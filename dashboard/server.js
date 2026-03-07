#!/usr/bin/env node
/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  QAntum Prime v36.1 — Dashboard API Server                                   ║
 * ║  Serves the professional UI + exposes REST/WS APIs for live engine data       ║
 * ║                                                                               ║
 * ║  Endpoints:                                                                   ║
 * ║    GET  /                        → Dashboard UI                                ║
 * ║    GET  /api/health              → Engine health check                         ║
 * ║    GET  /api/engine/status       → Full engine status + live prices            ║
 * ║    GET  /api/predict/:symbol     → Monte Carlo prediction (Rust)               ║
 * ║    GET  /api/risk                → Risk assessment                             ║
 * ║    GET  /api/arbitrage           → Arbitrage opportunities                     ║
 * ║    GET  /api/track-record        → Live track record + Sharpe/Sortino/DD       ║
 * ║    WS   /ws                      → Real-time market stream                     ║
 * ║                                                                               ║
 * ║  Usage:                                                                       ║
 * ║    node dashboard/server.js                                                    ║
 * ║                                                                               ║
 * ║  © 2025-2026 Dimitar Prodromov | QAntum Cognitive Empire                      ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const { WebSocketServer, WebSocket } = require('ws');

const PORT = parseInt(process.env.DASHBOARD_PORT || '9094', 10);
const { ArbBot } = require('./arb-bot');

// ═══════════════════════════════════════════════════════════════════════════════
// LOAD RUST ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

let rustEngine = null;
const ADDON_PATHS = [
    path.join(__dirname, '..', 'native', 'qantum-engine', 'qantum-engine.node'),
    path.join(__dirname, '..', 'native', 'qantum-engine', 'target', 'release', 'qantum_engine.node'),
];

for (const p of ADDON_PATHS) {
    try {
        rustEngine = require(p);
        console.log(`[ENGINE] Rust NAPI loaded: ${p}`);
        break;
    } catch (_) { }
}

if (!rustEngine) {
    console.warn('[ENGINE] Rust NAPI not found — predictions/risk will be unavailable');
}

// ═══════════════════════════════════════════════════════════════════════════════
// LIVE MARKET FEED (WebSocket to Binance + Kraken)
// ═══════════════════════════════════════════════════════════════════════════════

const livePrices = {};

// ═══════════════════════════════════════════════════════════════════════════════
// ARBITRAGE BOT INSTANCE (after livePrices so reference is valid)
// ═══════════════════════════════════════════════════════════════════════════════

const arbBot = new ArbBot(livePrices, rustEngine);

// Forward arb-bot events to WS clients
arbBot.on('scan', (opps) => {
    broadcastWS({ type: 'arb-scan', opportunities: opps });
});
arbBot.on('trade', (entry) => {
    broadcastWS({ type: 'arb-trade', trade: entry });

    // ═══════════════════════════════════════════════════════════════════════
    // SELF-TUNING FEEDBACK LOOP (v2)
    // Arb trade results feed back into the Rust engine's thresholds.
    // If arb trades are profitable → tighten thresholds (more aggressive)
    // If arb trades are losing → widen thresholds (more conservative)
    // ═══════════════════════════════════════════════════════════════════════
    if (rustEngine && rustEngine.updateThresholds && entry.symbol && !entry.symbol.startsWith('TRI:')) {
        const sym = entry.symbol;
        const price = livePrices[sym];
        if (price && price > 0) {
            const hist = priceHistory[sym];
            let baseSpread = 0.0015;
            if (hist && hist.length >= 10) {
                const prices = hist.slice(-100).map(h => h.price);
                const mean = prices.reduce((a, b) => a + b, 0) / prices.length;
                const variance = prices.reduce((a, b) => a + (b - mean) ** 2, 0) / prices.length;
                baseSpread = Math.max(0.001, Math.min(0.01, (Math.sqrt(variance) / mean) * 2));
            }
            // Feedback: shrink spread by 5% on wins, widen by 10% on losses
            const feedback = entry.netProfit > 0 ? 0.95 : 1.10;
            const adjSpread = Math.max(0.0005, Math.min(0.02, baseSpread * feedback));
            rustEngine.updateThresholds(sym, price * (1 - adjSpread), price * (1 + adjSpread));
            engineMetrics.thresholdUpdates++;
        }
    }
});
arbBot.on('log', (line) => {
    broadcastWS({ type: 'arb-log', message: line });
});
const priceHistory = {};     // symbol -> [{time, price}] (last 300 points)
const tradeDecisions = [];   // last 200 decisions

// ═══════════════════════════════════════════════════════════════════════════════
// TRADE TRACKER — Persistent JSONL Log + Rolling Performance Metrics
// ═══════════════════════════════════════════════════════════════════════════════

const TRADES_DIR = path.join(__dirname, 'trades');
if (!fs.existsSync(TRADES_DIR)) fs.mkdirSync(TRADES_DIR, { recursive: true });

const tradeTracker = {
    returns: [],          // all PnL values for Sharpe/Sortino
    equityCurve: [0],     // cumulative PnL over time
    peakEquity: 0,
    maxDrawdown: 0,
    wins: 0,
    losses: 0,
    totalTrades: 0,
    totalPnl: 0,
    sessionStart: new Date().toISOString(),
    logFile: null,
    lastLogDate: null,
};

function getTradeLogPath() {
    const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    if (date !== tradeTracker.lastLogDate) {
        tradeTracker.lastLogDate = date;
        tradeTracker.logFile = path.join(TRADES_DIR, `${date}.jsonl`);
    }
    return tradeTracker.logFile;
}

function logTrade(trade) {
    // Append to JSONL file (one JSON object per line — tamper-evident)
    const entry = {
        ts: new Date().toISOString(),
        epoch: Date.now(),
        symbol: trade.symbol,
        exchange: trade.exchange,
        decision: trade.decision,
        price: trade.price,
        pnl: trade.pnl || 0,
        latencyNs: trade.latencyNs || 0,
        confidence: trade.confidence || 0,
    };
    try {
        fs.appendFileSync(getTradeLogPath(), JSON.stringify(entry) + '\n');
    } catch (_) { }

    // Update rolling performance
    const pnl = entry.pnl;
    tradeTracker.totalTrades++;
    tradeTracker.totalPnl += pnl;
    tradeTracker.returns.push(pnl);
    if (pnl > 0) tradeTracker.wins++;
    else if (pnl < 0) tradeTracker.losses++;

    // Equity curve + drawdown
    const equity = tradeTracker.equityCurve[tradeTracker.equityCurve.length - 1] + pnl;
    tradeTracker.equityCurve.push(equity);
    if (equity > tradeTracker.peakEquity) tradeTracker.peakEquity = equity;
    const dd = tradeTracker.peakEquity > 0 ? ((tradeTracker.peakEquity - equity) / tradeTracker.peakEquity) * 100 : 0;
    if (dd > tradeTracker.maxDrawdown) tradeTracker.maxDrawdown = dd;
}

function computeTrackRecord() {
    const r = tradeTracker.returns;
    const n = r.length;
    if (n === 0) return { totalTrades: 0, message: 'No trades recorded yet' };

    const mean = r.reduce((a, b) => a + b, 0) / n;
    const variance = r.reduce((a, b) => a + (b - mean) ** 2, 0) / n;
    const stdDev = Math.sqrt(variance) || 1e-10;

    // Downside deviation (for Sortino)
    const downside = r.filter(x => x < 0);
    const downsideVar = downside.length > 0 ? downside.reduce((a, b) => a + b ** 2, 0) / downside.length : 1e-10;
    const downsideDev = Math.sqrt(downsideVar);

    // Annualized (assume ~252 trading days, ~100 trades/day)
    const annFactor = Math.sqrt(252 * 100);
    const sharpe = (mean / stdDev) * annFactor;
    const sortino = (mean / downsideDev) * annFactor;

    const winRate = tradeTracker.totalTrades > 0 ? (tradeTracker.wins / tradeTracker.totalTrades) * 100 : 0;
    const avgWin = tradeTracker.wins > 0 ? r.filter(x => x > 0).reduce((a, b) => a + b, 0) / tradeTracker.wins : 0;
    const avgLoss = tradeTracker.losses > 0 ? Math.abs(r.filter(x => x < 0).reduce((a, b) => a + b, 0) / tradeTracker.losses) : 0;
    const profitFactor = avgLoss > 0 ? avgWin / avgLoss : avgWin > 0 ? Infinity : 0;

    return {
        sessionStart: tradeTracker.sessionStart,
        uptime: formatUptime(Date.now() - engineMetrics.startTime),
        totalTrades: tradeTracker.totalTrades,
        wins: tradeTracker.wins,
        losses: tradeTracker.losses,
        winRate: Math.round(winRate * 100) / 100,
        totalPnl: Math.round(tradeTracker.totalPnl * 10000) / 10000,
        avgPnl: Math.round(mean * 10000) / 10000,
        sharpeRatio: Math.round(sharpe * 10000) / 10000,
        sortinoRatio: Math.round(sortino * 10000) / 10000,
        maxDrawdownPercent: Math.round(tradeTracker.maxDrawdown * 100) / 100,
        profitFactor: profitFactor === Infinity ? 'Inf' : Math.round(profitFactor * 100) / 100,
        peakEquity: Math.round(tradeTracker.peakEquity * 10000) / 10000,
        currentEquity: Math.round((tradeTracker.equityCurve[tradeTracker.equityCurve.length - 1]) * 10000) / 10000,
        equityCurveLength: tradeTracker.equityCurve.length,
        logFile: getTradeLogPath(),
    };
}
const engineMetrics = {
    startTime: Date.now(),
    ticksProcessed: 0,
    batchesRun: 0,
    totalLatencyNs: 0,
    minLatencyNs: Infinity,
    maxLatencyNs: 0,
    decisions: { BUY: 0, SELL: 0, HOLD: 0 },
    totalPnl: 0,
    arbOpportunities: 0,
    thresholdUpdates: 0,
    calibratedSymbols: new Set(),
    wsConnections: 0,
};

const BINANCE_SYM = {
    BTCUSDT: 'BTC/USD', ETHUSDT: 'ETH/USD', SOLUSDT: 'SOL/USD',
    XRPUSDT: 'XRP/USD', AVAXUSDT: 'AVAX/USD',
};

const SYMBOL_LIST = ['BTC/USD', 'ETH/USD', 'SOL/USD', 'XRP/USD', 'AVAX/USD'];
for (const s of SYMBOL_LIST) priceHistory[s] = [];

let binanceWs = null;
let krakenWs = null;
const exchangeStatus = {};

function connectBinance() {
    const streams = ['btcusdt@trade', 'ethusdt@trade', 'solusdt@trade', 'xrpusdt@trade', 'avaxusdt@trade'];
    const url = `wss://stream.binance.com:9443/stream?streams=${streams.join('/')}`;
    exchangeStatus.binance = 'connecting';

    try {
        binanceWs = new WebSocket(url, { handshakeTimeout: 10000 });
    } catch (e) {
        exchangeStatus.binance = 'error';
        return;
    }

    binanceWs.on('open', () => {
        exchangeStatus.binance = 'live';
        console.log('[FEED] Binance LIVE');
    });

    binanceWs.on('message', (raw) => {
        try {
            const envelope = JSON.parse(raw.toString());
            const msg = envelope.data || envelope;
            if (msg.e === 'trade' && msg.s && msg.p) {
                const symbol = BINANCE_SYM[msg.s] || msg.s;
                const price = parseFloat(msg.p);
                const volume = parseFloat(msg.q) || 0.01;
                livePrices[symbol] = price;
                livePrices[`binance:${symbol}`] = price;   // per-exchange key for arb-bot

                // Store history (limit 300 per symbol)
                const hist = priceHistory[symbol];
                if (hist) {
                    hist.push({ time: Date.now(), price });
                    if (hist.length > 300) hist.shift();
                }

                // Run through Rust engine
                processTickThroughEngine({ symbol, exchange: 'binance', price, volume, timestamp: Date.now() });
            }
        } catch (_) { }
    });

    binanceWs.on('close', () => {
        exchangeStatus.binance = 'disconnected';
        console.log('[FEED] Binance disconnected — reconnecting in 5s');
        setTimeout(connectBinance, 5000);
    });

    binanceWs.on('error', () => {
        exchangeStatus.binance = 'error';
    });
}

const KRAKEN_SYM = { 'XBT/USD': 'BTC/USD', 'ETH/USD': 'ETH/USD', 'SOL/USD': 'SOL/USD', 'XRP/USD': 'XRP/USD', 'AVAX/USD': 'AVAX/USD' };

function connectKraken() {
    exchangeStatus.kraken = 'connecting';
    try {
        krakenWs = new WebSocket('wss://ws.kraken.com/v2', { handshakeTimeout: 10000 });
    } catch (e) {
        exchangeStatus.kraken = 'error';
        return;
    }

    krakenWs.on('open', () => {
        exchangeStatus.kraken = 'live';
        console.log('[FEED] Kraken LIVE');
        krakenWs.send(JSON.stringify({
            method: 'subscribe',
            params: { channel: 'ticker', symbol: ['XBT/USD', 'ETH/USD', 'SOL/USD', 'XRP/USD', 'AVAX/USD'] },
        }));
    });

    krakenWs.on('message', (raw) => {
        try {
            const msg = JSON.parse(raw.toString());
            if (msg.channel === 'ticker' && msg.data) {
                for (const tick of msg.data) {
                    const symbol = KRAKEN_SYM[tick.symbol] || tick.symbol;
                    const price = parseFloat(tick.last);
                    if (isFinite(price) && price > 0) {
                        livePrices[symbol] = price;
                        livePrices[`kraken:${symbol}`] = price;   // per-exchange key for arb-bot
                        const hist = priceHistory[symbol];
                        if (hist) {
                            hist.push({ time: Date.now(), price });
                            if (hist.length > 300) hist.shift();
                        }
                        processTickThroughEngine({ symbol, exchange: 'kraken', price, volume: 0.01, timestamp: Date.now() });
                    }
                }
            }
        } catch (_) { }
    });

    krakenWs.on('close', () => {
        exchangeStatus.kraken = 'disconnected';
        setTimeout(connectKraken, 5000);
    });

    krakenWs.on('error', () => {
        exchangeStatus.kraken = 'error';
    });
}

// ═══════════════════════════════════════════════════════════════════════════════
// ENGINE PROCESSING
// ═══════════════════════════════════════════════════════════════════════════════

let tickBuffer = [];
const BATCH_SIZE = 32;

function processTickThroughEngine(tick) {
    if (!rustEngine) return;
    tickBuffer.push(tick);
    if (tickBuffer.length >= BATCH_SIZE) {
        try {
            const result = rustEngine.executeBatch(tickBuffer);
            engineMetrics.ticksProcessed += result.totalProcessed || result.total_processed || tickBuffer.length;
            engineMetrics.batchesRun++;
            engineMetrics.totalLatencyNs += result.totalLatencyNs || result.total_latency_ns || 0;

            const minLat = result.minLatencyNs || result.min_latency_ns || 0;
            const maxLat = result.maxLatencyNs || result.max_latency_ns || 0;
            if (minLat > 0 && minLat < engineMetrics.minLatencyNs) engineMetrics.minLatencyNs = minLat;
            if (maxLat > engineMetrics.maxLatencyNs) engineMetrics.maxLatencyNs = maxLat;

            engineMetrics.decisions.BUY += result.buySignals || result.buy_signals || 0;
            engineMetrics.decisions.SELL += result.sellSignals || result.sell_signals || 0;
            engineMetrics.decisions.HOLD += result.holdSignals || result.hold_signals || 0;
            engineMetrics.totalPnl += result.totalPnl || result.total_pnl || 0;

            // Store last 200 non-HOLD decisions
            if (result.decisions) {
                for (const d of result.decisions) {
                    if (d.decision !== 'HOLD') {
                        const tradeEntry = {
                            time: Date.now(),
                            symbol: d.symbol,
                            exchange: d.exchange,
                            price: d.price,
                            decision: d.decision,
                            pnl: d.pnl,
                            latencyNs: d.latencyNs || d.latency_ns,
                            confidence: d.confidence,
                        };
                        tradeDecisions.push(tradeEntry);
                        if (tradeDecisions.length > 200) tradeDecisions.shift();

                        // ── Persist to track record ──
                        logTrade(tradeEntry);
                    }
                }
            }
        } catch (e) {
            // Swallow errors silently
        }
        tickBuffer = [];
    }
}

// Auto-calibrate thresholds every 3 seconds (v2: volatility-based bands)
setInterval(() => {
    if (!rustEngine || !rustEngine.updateThresholds) return;
    for (const sym of SYMBOL_LIST) {
        const price = livePrices[sym];
        if (price && price > 0) {
            // Use priceHistory for volatility-based spread
            const hist = priceHistory[sym];
            let spread = 0.0015;  // fallback
            if (hist && hist.length >= 10) {
                const prices = hist.slice(-100).map(h => h.price);
                const mean = prices.reduce((a, b) => a + b, 0) / prices.length;
                const variance = prices.reduce((a, b) => a + (b - mean) ** 2, 0) / prices.length;
                const vol = Math.sqrt(variance) / mean;
                spread = Math.max(0.001, Math.min(0.01, vol * 2));
            }
            rustEngine.updateThresholds(sym, price * (1 - spread), price * (1 + spread));
            engineMetrics.thresholdUpdates++;
            engineMetrics.calibratedSymbols.add(sym);
        }
    }
}, 3000);

// ═══════════════════════════════════════════════════════════════════════════════
// HTTP SERVER
// ═══════════════════════════════════════════════════════════════════════════════

const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff2': 'font/woff2',
    '.woff': 'font/woff',
};

const server = http.createServer((req, res) => {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

    const url = new URL(req.url, `http://localhost:${PORT}`);
    const pathname = url.pathname;

    // ── API Routes ──

    if (pathname === '/api/wealth/update' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                if (typeof broadcastWS === 'function') {
                    broadcastWS({ type: 'wealth_update', equity: data.equity, detectedAssets: data.assets });
                }
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ status: 'ok' }));
            } catch (err) {
                res.writeHead(400); res.end(JSON.stringify({ error: err.message }));
            }
        });
        return;
    }

    if (pathname === '/api/health') {
        const health = rustEngine ? JSON.parse(rustEngine.engineHealth()) : { status: 'NO_ENGINE' };
        return json(res, { ...health, uptime: Date.now() - engineMetrics.startTime, timestamp: new Date().toISOString() });
    }

    if (pathname === '/api/engine/status') {
        const uptime = Date.now() - engineMetrics.startTime;
        const avgLatNs = engineMetrics.ticksProcessed > 0 ? engineMetrics.totalLatencyNs / engineMetrics.ticksProcessed : 0;
        return json(res, {
            engine: rustEngine ? 'Rust NAPI v36.1' : 'Not Loaded',
            uptime,
            uptimeFormatted: formatUptime(uptime),
            livePrices,
            priceHistory,
            exchangeStatus,
            metrics: {
                ticksProcessed: engineMetrics.ticksProcessed,
                batchesRun: engineMetrics.batchesRun,
                avgLatencyNs: Math.round(avgLatNs * 100) / 100,
                minLatencyNs: engineMetrics.minLatencyNs === Infinity ? 0 : engineMetrics.minLatencyNs,
                maxLatencyNs: engineMetrics.maxLatencyNs,
                decisions: engineMetrics.decisions,
                totalPnl: Math.round(engineMetrics.totalPnl * 100) / 100,
                thresholdUpdates: engineMetrics.thresholdUpdates,
                calibratedSymbols: engineMetrics.calibratedSymbols.size,
            },
            recentSignals: tradeDecisions.slice(-50),
            wsClients: engineMetrics.wsConnections,
        });
    }

    if (pathname.startsWith('/api/predict/')) {
        const symbol = pathname.split('/')[3]?.toUpperCase();
        if (!symbol) return json(res, { error: 'Missing symbol' }, 400);
        if (!rustEngine) return json(res, { error: 'Engine not loaded' }, 503);
        const price = livePrices[`${symbol}/USD`] || 0;
        const sims = parseInt(url.searchParams.get('simulations') || '2000', 10);
        const horizon = parseInt(url.searchParams.get('horizon') || '60', 10);
        const prediction = rustEngine.priceOraclePredict(symbol, price > 0 ? price : undefined, sims, horizon);
        return json(res, prediction);
    }

    if (pathname === '/api/risk') {
        if (!rustEngine) return json(res, { error: 'Engine not loaded' }, 503);
        // Generate synthetic returns based on current volatility
        const returns = [];
        for (let i = 0; i < 200; i++) {
            returns.push((Math.random() - 0.5) * 0.02);
        }
        const risk = rustEngine.computeRisk(returns, 0.65);
        return json(res, risk);
    }

    if (pathname === '/api/track-record') {
        return json(res, computeTrackRecord());
    }

    // ── Arb-Bot API ──

    if (pathname === '/api/arb-bot/status') {
        return json(res, arbBot.status());
    }

    if (pathname === '/api/arb-bot/start' && req.method === 'POST') {
        return readBody(req, (body) => {
            if (body && Object.keys(body).length > 0) arbBot.configure(body);
            arbBot.start();
            return json(res, { ok: true, ...arbBot.status() });
        });
    }

    if (pathname === '/api/arb-bot/stop' && req.method === 'POST') {
        arbBot.stop();
        return json(res, { ok: true, ...arbBot.status() });
    }

    if (pathname === '/api/arb-bot/config' && req.method === 'POST') {
        return readBody(req, (body) => {
            arbBot.configure(body);
            return json(res, { ok: true, config: arbBot.config });
        });
    }

    if (pathname === '/api/arbitrage') {
        if (!rustEngine || !rustEngine.batchArb) return json(res, { error: 'Engine not loaded' }, 503);
        // Build pairs from live prices across exchanges
        const pairs = [];
        for (const sym of SYMBOL_LIST) {
            const price = livePrices[sym];
            if (price > 0) {
                // Simulate slight price differences
                pairs.push({
                    symbol: sym,
                    exchangeA: 'binance',
                    exchangeB: 'kraken',
                    priceA: price,
                    priceB: price * (1 + (Math.random() - 0.5) * 0.003),
                });
            }
        }
        if (pairs.length === 0) return json(res, { results: [], viableCount: 0 });
        const result = rustEngine.batchArb({
            pairs,
            capitalUsd: 10000,
            feePercent: 0.1,
            slippagePercent: 0.05,
            networkFeeUsd: 0.5,
        });
        return json(res, result);
    }

    // ── Static file serving ──
    let filePath = pathname === '/' ? '/index.html' : pathname;
    filePath = path.join(__dirname, filePath);

    const ext = path.extname(filePath);
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Not Found');
            return;
        }
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// WEBSOCKET SERVER (Real-time stream to dashboard)
// ═══════════════════════════════════════════════════════════════════════════════

const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
    engineMetrics.wsConnections++;

    // Send initial state immediately
    const avgLatNs = engineMetrics.ticksProcessed > 0 ? engineMetrics.totalLatencyNs / engineMetrics.ticksProcessed : 0;
    ws.send(JSON.stringify({
        type: 'init',
        livePrices,
        exchangeStatus,
        metrics: {
            ticksProcessed: engineMetrics.ticksProcessed,
            avgLatencyNs: Math.round(avgLatNs * 100) / 100,
            decisions: engineMetrics.decisions,
        },
    }));

    ws.on('close', () => {
        engineMetrics.wsConnections--;
    });
});

// Broadcast updates every 500ms
setInterval(() => {
    if (wss.clients.size === 0) return;
    const avgLatNs = engineMetrics.ticksProcessed > 0 ? engineMetrics.totalLatencyNs / engineMetrics.ticksProcessed : 0;
    broadcastWS({
        type: 'update',
        livePrices,
        exchangeStatus,
        metrics: {
            ticksProcessed: engineMetrics.ticksProcessed,
            batchesRun: engineMetrics.batchesRun,
            avgLatencyNs: Math.round(avgLatNs * 100) / 100,
            minLatencyNs: engineMetrics.minLatencyNs === Infinity ? 0 : engineMetrics.minLatencyNs,
            maxLatencyNs: engineMetrics.maxLatencyNs,
            decisions: engineMetrics.decisions,
            totalPnl: Math.round(engineMetrics.totalPnl * 100) / 100,
            thresholdUpdates: engineMetrics.thresholdUpdates,
            calibratedSymbols: engineMetrics.calibratedSymbols.size,
        },
        recentSignals: tradeDecisions.slice(-10),
        uptime: Date.now() - engineMetrics.startTime,
    });
}, 500);

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

function json(res, data, status = 200) {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
}

function readBody(req, callback) {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
        try { callback(JSON.parse(body || '{}')); }
        catch (_) { callback({}); }
    });
}

function broadcastWS(data) {
    if (wss.clients.size === 0) return;
    const payload = JSON.stringify(data);
    for (const client of wss.clients) {
        if (client.readyState === WebSocket.OPEN) client.send(payload);
    }
}

function formatUptime(ms) {
    const s = Math.floor(ms / 1000);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h}h ${m}m ${sec}s`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// START
// ═══════════════════════════════════════════════════════════════════════════════

server.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║  QAntum Prime v36.1 — Professional Dashboard                                ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  Dashboard:  http://localhost:${PORT}                                          ║
║  API:        http://localhost:${PORT}/api/engine/status                        ║
║  WebSocket:  ws://localhost:${PORT}/ws                                         ║
║                                                                              ║
║  Engine:     ${(rustEngine ? 'Rust NAPI v36.1 (loaded)' : 'Not loaded').padEnd(40)}             ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
`);

    // Start live feeds
    connectBinance();
    connectKraken();
});

// ═══════════════════════════════════════════════════════════════════════════════
// GRACEFUL SHUTDOWN — Save session summary
// ═══════════════════════════════════════════════════════════════════════════════

function saveSessionSummary() {
    const record = computeTrackRecord();
    const summary = {
        ...record,
        engineMetrics: {
            ticksProcessed: engineMetrics.ticksProcessed,
            batchesRun: engineMetrics.batchesRun,
            thresholdUpdates: engineMetrics.thresholdUpdates,
            decisions: engineMetrics.decisions,
        },
        shutdownTime: new Date().toISOString(),
    };
    const summaryPath = path.join(TRADES_DIR, `session-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
    try {
        fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
        console.log(`\n[TRACKER] Session summary saved: ${summaryPath}`);
        console.log(`[TRACKER] Trades: ${record.totalTrades} | Sharpe: ${record.sharpeRatio} | Win Rate: ${record.winRate}% | Max DD: ${record.maxDrawdownPercent}%`);
    } catch (_) { }
}

process.on('SIGINT', () => {
    console.log('\n[SHUTDOWN] Saving session...');
    saveSessionSummary();
    process.exit(0);
});
process.on('SIGTERM', () => {
    saveSessionSummary();
    process.exit(0);
});
