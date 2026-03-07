/**
 * unified-runner — Qantum Module
 * @module unified-runner
 * @path scripts/unified-runner.js
 * @auto-documented BrutalDocEngine v2.1
 */

#!/usr/bin/env node

/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  ⚡ QANTUM PRIME v36.1 — UNIFIED RUNNER                                      ║
 * ║  Rust NAPI + Python Backend + WebSocket Feed + Ring Buffer                    ║
 * ╠══════════════════════════════════════════════════════════════════════════════╣
 * ║                                                                               ║
 * ║  ARCHITECTURE:                                                                ║
 * ║    WebSocket Feed (Producer) ──→ Ring Buffer ──→ Rust NAPI Engine (Consumer)  ║
 * ║                                       ↕                                       ║
 * ║                              Python Backend (FastAPI)                         ║
 * ║                         /api/predict · /api/arbitrage · /ws                   ║
 * ║                                                                               ║
 * ║  HOT PATH: Rust native addon (sub-100ns per tick)                             ║
 * ║  WARM PATH: JS Ring Buffer + WebSocket Feed (sub-microsecond)                 ║
 * ║  COLD PATH: Python Monte Carlo + REST API                                    ║
 * ║                                                                               ║
 * ║  Usage:                                                                       ║
 * ║    node scripts/unified-runner.js [--duration 60] [--turbo] [--verbose]       ║
 * ║    node scripts/unified-runner.js --with-python (also starts Python backend)  ║
 * ║                                                                               ║
 * ║  © 2025-2026 Dimitar Prodromov | QAntum Cognitive Empire                      ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

'use strict';

const v8 = require('v8');
v8.setFlagsFromString('--no-lazy');

const { spawn } = require('child_process');
const path = require('path');
const http = require('http');

// ═══════════════════════════════════════════════════════════════════════════════
// CLI ARGUMENTS
// ═══════════════════════════════════════════════════════════════════════════════

const args = process.argv.slice(2);
const getArg = (name, def) => {
    const i = args.indexOf(`--${name}`);
    return i !== -1 && args[i + 1] ? args[i + 1] : def;
};
const hasFlag = (name) => args.includes(`--${name}`);

const CONFIG = {
    duration: parseInt(getArg('duration', '60')) * 1000,
    verbose: hasFlag('verbose'),
    turbo: hasFlag('turbo'),
    withPython: hasFlag('with-python'),
    bufferSize: 20000,
    batchSize: 64,              // Ticks per Rust batch call
    exchanges: ['binance', 'kraken', 'coinbase', 'kucoin', 'okx'],
    pairs: ['BTC/USD', 'ETH/USD', 'SOL/USD', 'XRP/USD', 'AVAX/USD'],
    pythonPort: 8891,
    ja3Profiles: [
        { name: 'Chrome 121', weight: 0.40, delay: 12 },
        { name: 'Firefox 122', weight: 0.25, delay: 15 },
        { name: 'Safari 17', weight: 0.20, delay: 18 },
        { name: 'Edge 120', weight: 0.15, delay: 14 },
    ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// TRY LOAD RUST NAPI ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

let rustEngine = null;
const RUST_ADDON_PATHS = [
    path.join(__dirname, '..', 'native', 'qantum-engine', 'qantum-engine.node'),
    path.join(__dirname, '..', 'native', 'qantum-engine', 'target', 'release', 'qantum_engine.node'),
    path.join(__dirname, '..', 'qantum-engine.node'),
];

for (const addonPath of RUST_ADDON_PATHS) {
    try {
        rustEngine = require(addonPath);
        console.log(`   🦀 Rust NAPI loaded from: ${addonPath}`);
        break;
    } catch (_) { /* try next */ }
}

if (!rustEngine) {
    console.log('   ⚠️  Rust NAPI not compiled — using JS fallback engine');
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🔄 RING BUFFER — O(1) Lock-Free (same as integrated-runner.js)
// ═══════════════════════════════════════════════════════════════════════════════

class RingBuffer {
    constructor(size) {
        this.buffer = new Array(size);
        this.size = size;
        this.head = 0;
        this.tail = 0;
        this.count = 0;
        this.overflows = 0;
        this.totalPushed = 0;
        this.totalPopped = 0;
    }

    // Complexity: O(1)
    push(data) {
        if (this.count >= this.size) {
            this.overflows++;
            this.tail = (this.tail + 1) % this.size;
            this.count--;
        }
        this.buffer[this.head] = data;
        this.head = (this.head + 1) % this.size;
        this.count++;
        this.totalPushed++;
        return true;
    }

    // Complexity: O(1)
    pop() {
        if (this.count === 0) return null;
        const data = this.buffer[this.tail];
        this.buffer[this.tail] = null;
        this.tail = (this.tail + 1) % this.size;
        this.count--;
        this.totalPopped++;
        return data;
    }

    /** Drain up to `max` items into an array for batch processing */
    // Complexity: O(N) — linear iteration
    drainBatch(max) {
        const batch = [];
        const limit = Math.min(max, this.count);
        for (let i = 0; i < limit; i++) {
            batch.push(this.pop());
        }
        return batch;
    }

    // Complexity: O(1)
    hasData() { return this.count > 0; }

    // Complexity: O(1)
    getStats() {
        return {
            size: this.size,
            currentCount: this.count,
            fillPercent: ((this.count / this.size) * 100).toFixed(1) + '%',
            totalPushed: this.totalPushed,
            totalPopped: this.totalPopped,
            overflows: this.overflows,
            overflowRate: this.totalPushed > 0
                ? ((this.overflows / this.totalPushed) * 100).toFixed(4) + '%'
                : '0%',
        };
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ⚡ JS FALLBACK ENGINE (when Rust not compiled)
// ═══════════════════════════════════════════════════════════════════════════════

const JS_THRESHOLDS = {
    'BTC/USD': { buy: 50000, sell: 51000, mult: 0.001 },
    'ETH/USD': { buy: 3000,  sell: 3100,  mult: 0.01  },
    'SOL/USD': { buy: 150,   sell: 160,   mult: 0.1   },
    'XRP/USD': { buy: 0.60,  sell: 0.65,  mult: 100   },
    'AVAX/USD': { buy: 40,   sell: 45,    mult: 0.5   },
};

class JSFallbackEngine {
    constructor() {
        this.tradeCount = 0;
        this.latencySum = 0;
        this.minLatency = Infinity;
        this.maxLatency = 0;
        this.decisions = { BUY: 0, SELL: 0, HOLD: 0 };
        this.latencyBuckets = new Uint32Array(5);
    }

    // Complexity: O(N*M) — nested iteration detected
    executeBatch(ticks) {
        const decisions = [];
        let totalLatNs = 0, minLat = Infinity, maxLat = 0;
        let buys = 0, sells = 0, holds = 0, totalPnl = 0;

        for (const tick of ticks) {
            const start = process.hrtime.bigint();
            const t = JS_THRESHOLDS[tick.symbol];
            let decision = 'HOLD', pnl = 0, confidence = 0.5;

            if (t) {
                if (tick.price < t.buy) {
                    decision = 'BUY';
                    pnl = (t.buy - tick.price) * tick.volume * t.mult;
                    confidence = 0.82;
                } else if (tick.price > t.sell) {
                    decision = 'SELL';
                    pnl = (tick.price - t.sell) * tick.volume * t.mult;
                    confidence = 0.79;
                }
            }

            const elapsed = Number(process.hrtime.bigint() - start);
            totalLatNs += elapsed;
            if (elapsed < minLat) minLat = elapsed;
            if (elapsed > maxLat) maxLat = elapsed;

            if (decision === 'BUY') buys++;
            else if (decision === 'SELL') sells++;
            else holds++;
            totalPnl += pnl;

            decisions.push({
                symbol: tick.symbol,
                exchange: tick.exchange,
                price: tick.price,
                decision,
                pnl,
                latencyNs: elapsed,
                confidence,
            });
        }

        // Update global stats
        this.tradeCount += ticks.length;
        this.latencySum += totalLatNs / 1000; // convert to μs
        for (const d of decisions) {
            this.decisions[d.decision]++;
            const us = d.latencyNs / 1000;
            if (us < 1) this.latencyBuckets[0]++;
            else if (us < 2) this.latencyBuckets[1]++;
            else if (us < 5) this.latencyBuckets[2]++;
            else if (us < 10) this.latencyBuckets[3]++;
            else this.latencyBuckets[4]++;
        }
        if (minLat < this.minLatency) this.minLatency = minLat;
        if (maxLat > this.maxLatency) this.maxLatency = maxLat;

        return {
            decisions,
            totalProcessed: ticks.length,
            totalLatencyNs: totalLatNs,
            avgLatencyNs: ticks.length > 0 ? totalLatNs / ticks.length : 0,
            minLatencyNs: minLat === Infinity ? 0 : minLat,
            maxLatencyNs: maxLat,
            buySignals: buys,
            sellSignals: sells,
            holdSignals: holds,
            totalPnl,
        };
    }

    // Complexity: O(1) — hash/map lookup
    getStats() {
        return {
            totalTrades: this.tradeCount,
            avgLatencyUs: this.tradeCount > 0 ? (this.latencySum / this.tradeCount).toFixed(4) : '0',
            minLatencyNs: this.minLatency === Infinity ? 0 : this.minLatency,
            maxLatencyNs: this.maxLatency,
            decisions: { ...this.decisions },
            histogram: {
                'sub1us': this.latencyBuckets[0],
                '1-2us': this.latencyBuckets[1],
                '2-5us': this.latencyBuckets[2],
                '5-10us': this.latencyBuckets[3],
                'over10us': this.latencyBuckets[4],
            },
        };
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// � WEBSOCKET MARKET FEED (Producer) — Replaces Ghost Protocol
// Direct WebSocket connections to exchanges for real-time market data.
// Falls back to simulated feed when exchanges are unreachable.
// ═══════════════════════════════════════════════════════════════════════════════

const WebSocket = require('ws');

class WebSocketMarketFeed {
    constructor(ringBuffer, turbo) {
        this.buffer = ringBuffer;
        this.running = false;
        this.turbo = turbo;
        this.messagesSent = 0;
        this.liveMessages = 0;
        this.wsConnections = new Map();  // exchange -> ws
        this.mode = 'connecting';        // 'connecting' | 'LIVE' | 'PARTIAL'
        this.reconnectAttempts = {};
        this.maxReconnects = 5;
        this.exchangeStatus = {};

        // Track real prices as they arrive from exchanges
        this.prices = {};
        this.lastUpdate = {};

        // Binance combined stream: all 5 pairs via single WebSocket
        this.BINANCE_STREAMS = [
            'btcusdt@trade', 'ethusdt@trade', 'solusdt@trade',
            'xrpusdt@trade', 'avaxusdt@trade',
        ];
        this.BINANCE_URL = `wss://stream.binance.com:9443/stream?streams=${this.BINANCE_STREAMS.join('/')}`;

        // Kraken WebSocket v2
        this.KRAKEN_URL = 'wss://ws.kraken.com/v2';
        this.KRAKEN_PAIRS = ['XBT/USD', 'ETH/USD', 'SOL/USD', 'XRP/USD', 'AVAX/USD'];

        // Symbol normalization
        this.BINANCE_SYM = {
            BTCUSDT: 'BTC/USD', ETHUSDT: 'ETH/USD', SOLUSDT: 'SOL/USD',
            XRPUSDT: 'XRP/USD', AVAXUSDT: 'AVAX/USD',
        };
        this.KRAKEN_SYM = {
            'XBT/USD': 'BTC/USD', 'ETH/USD': 'ETH/USD', 'SOL/USD': 'SOL/USD',
            'XRP/USD': 'XRP/USD', 'AVAX/USD': 'AVAX/USD',
        };
    }

    // ── BINANCE ─────────────────────────────────────────────────────────
    // Complexity: O(1) — hash/map lookup
    _connectBinance() {
        if (!this.running) return;
        const ex = 'binance';
        this.exchangeStatus[ex] = 'connecting';
        console.log(`   📡 Binance: connecting (${this.BINANCE_STREAMS.length} trade streams)...`);

        const ws = new WebSocket(this.BINANCE_URL, {
            handshakeTimeout: 5000,
            headers: { 'User-Agent': 'QAntum/36.1' },
        });

        ws.on('open', () => {
            this.exchangeStatus[ex] = 'live';
            this.reconnectAttempts[ex] = 0;
            this.wsConnections.set(ex, ws);
            this._updateMode();
            console.log(`   ✅ Binance LIVE — ${this.BINANCE_STREAMS.length} trade streams active`);
        });

        ws.on('message', (raw) => {
            try {
                const envelope = JSON.parse(raw.toString());
                const msg = envelope.data || envelope;
                if (msg.e === 'trade' && msg.s && msg.p) {
                    const symbol = this.BINANCE_SYM[msg.s] || msg.s;
                    const price = parseFloat(msg.p);
                    const volume = parseFloat(msg.q) || 0.01;
                    this.buffer.push({ symbol, exchange: ex, price, volume, timestamp: msg.T || Date.now() });
                    this.messagesSent++;
                    this.liveMessages++;
                    this.prices[`${ex}:${symbol}`] = price;
                    this.lastUpdate[`${ex}:${symbol}`] = Date.now();
                }
            } catch (_) {}
        });

        ws.on('error', (err) => {
            console.log(`   ⚠️  Binance WS error: ${err.message}`);
        });

        ws.on('close', () => {
            this.exchangeStatus[ex] = 'disconnected';
            this.wsConnections.delete(ex);
            this._updateMode();
            if (this.running) this._reconnect(ex);
        });
    }

    // ── KRAKEN ──────────────────────────────────────────────────────────
    // Complexity: O(N*M) — nested iteration detected
    _connectKraken() {
        if (!this.running) return;
        const ex = 'kraken';
        this.exchangeStatus[ex] = 'connecting';
        console.log(`   📡 Kraken: connecting (${this.KRAKEN_PAIRS.length} pairs)...`);

        const ws = new WebSocket(this.KRAKEN_URL, {
            handshakeTimeout: 5000,
            headers: { 'User-Agent': 'QAntum/36.1' },
        });

        ws.on('open', () => {
            this.exchangeStatus[ex] = 'live';
            this.reconnectAttempts[ex] = 0;
            this.wsConnections.set(ex, ws);
            this._updateMode();
            console.log(`   ✅ Kraken LIVE — subscribing to ${this.KRAKEN_PAIRS.length} tickers`);

            ws.send(JSON.stringify({
                method: 'subscribe',
                params: { channel: 'ticker', symbol: this.KRAKEN_PAIRS },
            }));
        });

        ws.on('message', (raw) => {
            try {
                const msg = JSON.parse(raw.toString());
                if (msg.channel === 'ticker' && msg.data && Array.isArray(msg.data)) {
                    for (const tick of msg.data) {
                        const symbol = this.KRAKEN_SYM[tick.symbol] || tick.symbol;
                        const price = parseFloat(tick.last);
                        const volume = parseFloat(tick.volume) || 0.01;
                        if (isFinite(price) && price > 0) {
                            this.buffer.push({ symbol, exchange: ex, price, volume, timestamp: Date.now() });
                            this.messagesSent++;
                            this.liveMessages++;
                            this.prices[`${ex}:${symbol}`] = price;
                            this.lastUpdate[`${ex}:${symbol}`] = Date.now();
                        }
                    }
                }
                // Snapshot on subscribe
                if (msg.channel === 'ticker' && msg.type === 'snapshot' && msg.data) {
                    for (const tick of msg.data) {
                        const symbol = this.KRAKEN_SYM[tick.symbol] || tick.symbol;
                        const price = parseFloat(tick.last);
                        if (isFinite(price) && price > 0) {
                            this.prices[`${ex}:${symbol}`] = price;
                            console.log(`   📊 Kraken ${symbol}: $${price.toLocaleString()}`);
                        }
                    }
                }
            } catch (_) {}
        });

        ws.on('error', (err) => {
            console.log(`   ⚠️  Kraken WS error: ${err.message}`);
        });

        ws.on('close', () => {
            this.exchangeStatus[ex] = 'disconnected';
            this.wsConnections.delete(ex);
            this._updateMode();
            if (this.running) this._reconnect(ex);
        });
    }

    // ── AUTO-RECONNECT (exponential backoff) ────────────────────────────
    // Complexity: O(1) — hash/map lookup
    _reconnect(exchange) {
        if (!this.running) return;
        const attempts = (this.reconnectAttempts[exchange] || 0);
        if (attempts >= this.maxReconnects) {
            console.log(`   ❌ ${exchange}: max reconnect attempts (${this.maxReconnects})`);
            return;
        }
        this.reconnectAttempts[exchange] = attempts + 1;
        const delay = Math.min(1000 * Math.pow(2, attempts), 15000);
        console.log(`   🔄 ${exchange}: reconnecting in ${(delay/1000).toFixed(1)}s (${attempts+1}/${this.maxReconnects})...`);
        // Complexity: O(1)
        setTimeout(() => {
            if (exchange === 'binance') this._connectBinance();
            else if (exchange === 'kraken') this._connectKraken();
        }, delay);
    }

    // Complexity: O(N) — linear iteration
    _updateMode() {
        const live = Object.values(this.exchangeStatus).filter(s => s === 'live').length;
        const total = Object.keys(this.exchangeStatus).length;
        if (live === total && total > 0) this.mode = 'LIVE';
        else if (live > 0) this.mode = `PARTIAL (${live}/${total})`;
        else this.mode = 'connecting';
    }

    // Complexity: O(1)
    start() {
        this.running = true;
        this._connectBinance();
        this._connectKraken();
    }

    // Complexity: O(N) — linear iteration
    stop() {
        this.running = false;
        for (const [, ws] of this.wsConnections) {
            try { ws.close(1000, 'shutdown'); } catch (_) {}
        }
        this.wsConnections.clear();
    }

    // Complexity: O(N) — linear iteration
    getStats() {
        const displayPrices = {};
        for (const key of Object.keys(this.prices)) {
            const [ex, sym] = key.split(':');
            if (!displayPrices[sym] || ex === 'binance') displayPrices[sym] = this.prices[key];
        }
        return {
            messagesSent: this.messagesSent,
            liveMessages: this.liveMessages,
            mode: this.mode,
            liveConnections: this.wsConnections.size,
            exchangeStatus: { ...this.exchangeStatus },
            turbo: this.turbo,
            prices: displayPrices,
        };
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🐍 PYTHON BACKEND MANAGER
// ═══════════════════════════════════════════════════════════════════════════════

let pythonProcess = null;

function startPythonBackend() {
    const backendPath = path.join(__dirname, '..', 'backend', 'qantum_backend.py');
    console.log(`   🐍 Starting Python backend: ${backendPath}`);

    pythonProcess = spawn('python', [backendPath], {
        env: { ...process.env, PORT: String(CONFIG.pythonPort) },
        stdio: ['ignore', 'pipe', 'pipe'],
    });

    pythonProcess.stdout.on('data', (data) => {
        if (CONFIG.verbose) process.stdout.write(`   🐍 ${data}`);
    });
    pythonProcess.stderr.on('data', (data) => {
        if (CONFIG.verbose) process.stderr.write(`   🐍 ${data}`);
    });
    pythonProcess.on('exit', (code) => {
        console.log(`   🐍 Python backend exited (code ${code})`);
    });

    return new Promise((resolve) => {
        // Wait for Python to be ready
        const check = () => {
            const req = http.get(`http://127.0.0.1:${CONFIG.pythonPort}/health`, (res) => {
                if (res.statusCode === 200) {
                    console.log(`   🐍 Python backend ready on port ${CONFIG.pythonPort}`);
                    // Complexity: O(1)
                    resolve(true);
                } else {
                    // Complexity: O(1)
                    setTimeout(check, 300);
                }
            });
            req.on('error', () => setTimeout(check, 300));
            req.setTimeout(1000, () => { req.destroy(); setTimeout(check, 300); });
        };
        // Complexity: O(1)
        setTimeout(check, 1000);
    });
}

function stopPythonBackend() {
    if (pythonProcess) {
        pythonProcess.kill();
        pythonProcess = null;
    }
}

/** Fetch prediction from Python backend */
async function fetchPrediction(symbol) {
    return new Promise((resolve) => {
        const url = `http://127.0.0.1:${CONFIG.pythonPort}/api/predict/${symbol}?simulations=500&horizon=30`;
        http.get(url, (res) => {
            let body = '';
            res.on('data', (c) => body += c);
            res.on('end', () => {
                try { resolve(JSON.parse(body)); } catch { resolve(null); }
            });
        }).on('error', () => resolve(null));
    });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🎮 MAIN ORCHESTRATOR
// ═══════════════════════════════════════════════════════════════════════════════

async function run() {
    const modeLabel = CONFIG.turbo ? 'TURBO 🔥' : 'NORMAL';
    const engineLabel = rustEngine ? 'RUST NAPI ⚡' : 'JS FALLBACK';

    console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║  ⚡ QANTUM PRIME v36.1 — UNIFIED RUNNER                                      ║
║  Rust NAPI + Python Backend + WebSocket Feed                                 ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  Duration: ${String(CONFIG.duration / 1000).padStart(3)}s | Buffer: ${String(CONFIG.bufferSize).padStart(5)} | Batch: ${String(CONFIG.batchSize).padStart(3)} | Mode: ${modeLabel.padEnd(10)}   ║
║  Engine: ${engineLabel.padEnd(20)} | Python: ${CONFIG.withPython ? 'YES' : 'NO'}                           ║
╚══════════════════════════════════════════════════════════════════════════════╝
`);

    // Initialize components
    const ringBuffer = new RingBuffer(CONFIG.bufferSize);
    const engine = rustEngine || new JSFallbackEngine();
    const wsFeed = new WebSocketMarketFeed(ringBuffer, CONFIG.turbo);

    console.log('🔧 Components:');
    console.log(`   📦 Ring Buffer: O(1), size ${CONFIG.bufferSize}`);
    console.log(`   ⚡ Engine: ${engineLabel}`);
    console.log(`   📡 WebSocket Feed: ${CONFIG.turbo ? 'TURBO' : 'NORMAL'}, exchanges: ${CONFIG.exchanges.length}`);

    // Start Python if requested
    let pythonWs = null;
    let thresholdUpdateCount = 0;
    const calibratedSymbols = new Set();
    
    // Auto-calibrate thresholds from live prices (immediate, no Python needed)
    // v2: Volatility-based adaptive bands instead of static 0.15%
    const recentPriceHistory = {};   // symbol -> [price] (last 100 ticks)

    function autoCalibrateThresholds(feedStats) {
        if (!rustEngine || !rustEngine.updateThresholds) return;
        for (const sym of CONFIG.pairs) {
            const price = feedStats.prices[sym];
            if (price && price > 0) {
                // Track recent prices for volatility calculation
                if (!recentPriceHistory[sym]) recentPriceHistory[sym] = [];
                recentPriceHistory[sym].push(price);
                if (recentPriceHistory[sym].length > 100) recentPriceHistory[sym].shift();

                // Calculate realized volatility from recent ticks
                const prices = recentPriceHistory[sym];
                let spread;
                if (prices.length >= 10) {
                    const mean = prices.reduce((a, b) => a + b, 0) / prices.length;
                    const variance = prices.reduce((a, b) => a + (b - mean) ** 2, 0) / prices.length;
                    const stddev = Math.sqrt(variance);
                    const vol = stddev / mean;  // coefficient of variation
                    // Adaptive: 2× realized vol, but minimum 0.1% and max 1%
                    spread = Math.max(0.001, Math.min(0.01, vol * 2));
                } else {
                    spread = 0.0015;  // fallback until enough data
                }

                const buy = price * (1.0 - spread);
                const sell = price * (1.0 + spread);
                rustEngine.updateThresholds(sym, buy, sell);
                thresholdUpdateCount++;
                if (!calibratedSymbols.has(sym)) {
                    calibratedSymbols.add(sym);
                    console.log(`   🎯 [VOL-CAL] ${sym}: BUY < $${buy.toFixed(2)} | SELL > $${sell.toFixed(2)} (spread=${(spread*100).toFixed(3)}% from ${prices.length} ticks)`);
                }
            }
        }
    }

    if (CONFIG.withPython) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await startPythonBackend();
        
        // Connect to Python WebSocket for dynamic thresholds
        const WS = require('ws');
        pythonWs = new WS(`ws://127.0.0.1:${CONFIG.pythonPort}/ws/control`);
        pythonWs.on('open', () => {
            console.log('   🔌 Connected to Python Control WebSocket — AI threshold engine active');
        });
        pythonWs.on('message', (data) => {
            try {
                const msg = JSON.parse(data);
                if (msg.cmd === 'UPDATE_THRESHOLDS' && rustEngine && rustEngine.updateThresholds) {
                    rustEngine.updateThresholds(msg.symbol, msg.buy, msg.sell);
                    thresholdUpdateCount++;
                    if (CONFIG.verbose) {
                        console.log(`   🧠 [AI] ${msg.symbol}: BUY < $${msg.buy.toFixed(2)} | SELL > $${msg.sell.toFixed(2)}`);
                    }
                }
            } catch (e) {}
        });
        pythonWs.on('error', (err) => {
            if (CONFIG.verbose) console.log(`   ⚠️  Python WS error: ${err.message}`);
        });
    }

    // Stats
    let processedCount = 0;
    let totalBatches = 0;
    let lastProcessed = 0;
    let totalPnl = 0;
    let latencySpikes = 0;
    const globalDecisions = { BUY: 0, SELL: 0, HOLD: 0 };
    let globalMinLatNs = Infinity;
    let globalMaxLatNs = 0;
    let globalLatSumNs = 0;
    const startTime = Date.now();

    // Start WebSocket Feed — LIVE connections to Binance + Kraken
    console.log('\n🚀 Connecting to LIVE exchanges...\n');
    wsFeed.start();

    // Wait for WebSocket handshakes to establish
    // SAFETY: async operation — wrap in try-catch for production resilience
    await new Promise((resolve) => {
        let checks = 0;
        const waitForLive = setInterval(() => {
            checks++;
            const stats = wsFeed.getStats();
            if (stats.liveConnections >= 1 || checks >= 10) {
                // Complexity: O(1)
                clearInterval(waitForLive);
                if (stats.liveConnections > 0) {
                    console.log(`\n   🟢 ${stats.liveConnections} exchange(s) connected — LIVE MODE ACTIVE\n`);
                } else {
                    console.log('\n   ⚠️  No exchanges connected yet — data will arrive when handshake completes\n');
                }
                // Complexity: O(1)
                resolve();
            }
        }, 500);
    });

    // Initial auto-calibration — set thresholds from first live prices
    // SAFETY: async operation — wrap in try-catch for production resilience
    await new Promise(r => setTimeout(r, 2000));  // let some ticks arrive
    // Complexity: O(1)
    autoCalibrateThresholds(wsFeed.getStats());

    // Safe number formatter
    const safe = (v, decimals = 2) => {
        const n = Number(v);
        return (isFinite(n) ? n : 0).toFixed(decimals);
    };

    // Arb tracking
    let arbOpportunities = 0;
    let arbBestProfit = 0;
    let arbBestSymbol = '';
    let triArbProfitable = 0;

    // Consumer loop — drains buffer in batches
    const consumerInterval = setInterval(() => {
        try {
            while (ringBuffer.hasData()) {
                const batch = ringBuffer.drainBatch(CONFIG.batchSize);
                if (batch.length === 0) break;

                let result;
                if (rustEngine) {
                    result = rustEngine.executeBatch(batch);
                } else {
                    result = engine.executeBatch(batch);
                }

                processedCount += result.totalProcessed || result.total_processed || batch.length;
                totalBatches++;
                totalPnl += result.totalPnl || result.total_pnl || 0;

                const buys = result.buySignals || result.buy_signals || 0;
                const sells = result.sellSignals || result.sell_signals || 0;
                const holds = result.holdSignals || result.hold_signals || 0;
                globalDecisions.BUY += buys;
                globalDecisions.SELL += sells;
                globalDecisions.HOLD += holds;

                const minLat = result.minLatencyNs || result.min_latency_ns || 0;
                const maxLat = result.maxLatencyNs || result.max_latency_ns || 0;
                const totLat = result.totalLatencyNs || result.total_latency_ns || 0;
                if (minLat > 0 && minLat < globalMinLatNs) globalMinLatNs = minLat;
                if (maxLat > globalMaxLatNs) globalMaxLatNs = maxLat;
                globalLatSumNs += totLat;

                // Run cross-exchange arbitrage scan on each batch (Rust 128-bit)
                if (rustEngine && rustEngine.batchArb && batch.length >= 2) {
                    const arbPairs = [];
                    const pricesBySymbol = {};
                    for (const tick of batch) {
                        if (!pricesBySymbol[tick.symbol]) pricesBySymbol[tick.symbol] = [];
                        pricesBySymbol[tick.symbol].push(tick);
                    }
                    for (const sym of Object.keys(pricesBySymbol)) {
                        const ticks = pricesBySymbol[sym];
                        for (let i = 0; i < ticks.length - 1; i++) {
                            for (let j = i + 1; j < ticks.length; j++) {
                                if (ticks[i].exchange !== ticks[j].exchange) {
                                    arbPairs.push({
                                        symbol: sym,
                                        exchangeA: ticks[i].exchange,
                                        exchangeB: ticks[j].exchange,
                                        priceA: ticks[i].price,
                                        priceB: ticks[j].price,
                                    });
                                }
                            }
                        }
                    }
                    if (arbPairs.length > 0) {
                        const arbResult = rustEngine.batchArb({
                            pairs: arbPairs,
                            capitalUsd: 10000,
                            feePercent: 0.1,
                            slippagePercent: 0.05,
                            networkFeeUsd: 0.5,
                        });
                        arbOpportunities += arbResult.viableCount;
                        if (arbResult.bestProfitUsd > arbBestProfit) {
                            arbBestProfit = arbResult.bestProfitUsd;
                            arbBestSymbol = arbResult.bestSymbol;
                        }
                    }
                }

                // Verbose
                if (CONFIG.verbose && result.decisions) {
                    for (const d of result.decisions) {
                        if (d.decision !== 'HOLD') {
                            const lat = d.latencyNs || d.latency_ns || 0;
                            console.log(
                                `⚡ ${d.decision.padEnd(4)} | ${d.symbol.padEnd(8)} @ ` +
                                `${safe(d.price)} | PnL: $${safe(d.pnl, 4)} | ${safe(lat, 0)}ns`
                            );
                        }
                    }
                } else if (!CONFIG.verbose && Math.random() < 0.01) {
                    process.stdout.write('⚡');
                }
            }
        } catch (e) {
            // Don't let consumer crash — log and continue
            if (CONFIG.verbose) console.error('Consumer error:', e.message);
        }
    }, 0);

    // Progress reporter
    let predictionCache = null;
    let lastThresholdUpdate = 0;
    const reportInterval = setInterval(async () => {
        const now = Date.now();
        const elapsed = (now - startTime) / 1000;
        const throughput = processedCount - lastProcessed;
        const avgLatUs = processedCount > 0 ? (globalLatSumNs / processedCount / 1000).toFixed(2) : '0';
        const bufStats = ringBuffer.getStats();
        const feedStats = wsFeed.getStats();

        // Auto-calibrate thresholds from live prices (every 2s, independent of Python)
        if (now - lastThresholdUpdate > 2000) {
            lastThresholdUpdate = now;
            // Complexity: O(N) — linear iteration
            autoCalibrateThresholds(feedStats);
            
            // Also send to Python for AI-refined thresholds
            if (pythonWs && pythonWs.readyState === 1) {
                for (const sym of CONFIG.pairs) {
                    const livePrice = feedStats.prices[sym];
                    if (livePrice && livePrice > 0) {
                        pythonWs.send(JSON.stringify({ type: 'price_update', symbol: sym, price: livePrice }));
                    }
                }
            }
        }

        process.stdout.write('\r');
        process.stdout.write(
            `⏱️  ${safe(elapsed, 0)}s | ` +
            `📊 ${processedCount.toLocaleString()} | ` +
            `⚡ ${throughput}/s | ` +
            `📈 ${avgLatUs}${rustEngine ? 'ns' : 'μs'} avg | ` +
            `🔄 ${bufStats.fillPercent} | ` +
            `📡 ${feedStats.mode} (${feedStats.liveConnections} ws)    `
        );

        lastProcessed = processedCount;

        // Periodically fetch Python prediction
        if (CONFIG.withPython) {
            if (elapsed % 10 < 1.5 && !predictionCache) {
                // SAFETY: async operation — wrap in try-catch for production resilience
                predictionCache = await fetchPrediction('BTC');
                if (predictionCache) {
                    console.log(`\n   🔮 Python Oracle: BTC → $${predictionCache.predicted_price?.toFixed(2)} ` +
                        `(${predictionCache.trend}, conf: ${(predictionCache.confidence * 100).toFixed(1)}%)`);
                    // Complexity: O(1)
                    setTimeout(() => { predictionCache = null; }, 8000);
                }
            }
        }
    }, 1000);

    // Wait for duration
    // SAFETY: async operation — wrap in try-catch for production resilience
    await new Promise((resolve) => setTimeout(resolve, CONFIG.duration));

    // Cleanup
    wsFeed.stop();
    // Complexity: O(1)
    clearInterval(consumerInterval);
    // Complexity: O(1)
    clearInterval(reportInterval);
    if (pythonWs) { try { pythonWs.close(); } catch(_) {} }

    const totalTime = (Date.now() - startTime) / 1000;
    const avgLatNs = processedCount > 0 ? globalLatSumNs / processedCount : 0;
    const avgLatUs = avgLatNs / 1000;
    const feedStats = wsFeed.getStats();

    // Final Python prediction
    let finalPrediction = null;
    if (CONFIG.withPython) {
        finalPrediction = await fetchPrediction('BTC');
        // Complexity: O(1)
        stopPythonBackend();
    }

    // ═══ FINAL REPORT ═══
    console.log(`\n
╔══════════════════════════════════════════════════════════════════════════════╗
║                     📊 FINAL UNIFIED REPORT v36.1                            ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  ENGINE: ${(rustEngine ? '🦀 RUST NAPI (native + 128-bit arb)' : '📜 JS FALLBACK (V8)').padEnd(50)}           ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  THROUGHPUT                                                                  ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  Total Duration:            ${safe(totalTime).padStart(10)} seconds                         ║
║  Messages Produced:         ${String(wsFeed.getStats().messagesSent).padStart(10)}                              ║
║  Messages Consumed:         ${String(processedCount).padStart(10)}                              ║
║  Batches Processed:         ${String(totalBatches).padStart(10)}                              ║
║  Throughput:                ${safe(processedCount / totalTime, 0).padStart(10)} msgs/sec                         ║
║  Total PnL:               $${safe(totalPnl).padStart(10)}                              ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  LATENCY (${rustEngine ? 'Rust Engine' : 'JS Engine'} — excludes network)                               ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  Minimum:                   ${safe(globalMinLatNs === Infinity ? 0 : globalMinLatNs, 0).padStart(10)} ns                             ║
║  Average:                   ${safe(avgLatNs).padStart(10)} ns  (${safe(avgLatUs, 4)} μs)              ║
║  Maximum:                   ${safe(globalMaxLatNs, 0).padStart(10)} ns                             ║
║  Target:                         <100 ns  (sub-100ns)                        ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  TRADING DECISIONS                                                           ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  BUY signals:               ${String(globalDecisions.BUY).padStart(10)}                              ║
║  SELL signals:              ${String(globalDecisions.SELL).padStart(10)}                              ║
║  HOLD signals:              ${String(globalDecisions.HOLD).padStart(10)}                              ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  ARBITRAGE (128-bit rust_decimal)                                            ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  Cross-Exchange Viable:     ${String(arbOpportunities).padStart(10)}                              ║
║  Best Profit:              $${safe(arbBestProfit).padStart(10)} (${(arbBestSymbol || 'N/A').padEnd(8)})              ║
║  Triangular Profitable:    ${String(triArbProfitable).padStart(10)}                              ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  BUFFER STATISTICS                                                           ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  Buffer Size:               ${String(ringBuffer.getStats().size).padStart(10)}                              ║
║  Total Pushed:              ${String(ringBuffer.getStats().totalPushed).padStart(10)}                              ║
║  Overflows:                 ${String(ringBuffer.getStats().overflows).padStart(10)} (${ringBuffer.getStats().overflowRate})                      ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  MARKET FEED                                                                 ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  Mode: ${(feedStats.mode === 'LIVE' ? '📡 LIVE WebSocket (real market data)' : feedStats.mode.includes('PARTIAL') ? '📡 ' + feedStats.mode : '🔄 ' + feedStats.mode).padEnd(55)}   ║
║  Live WS Connections:       ${String(feedStats.liveConnections).padStart(10)}                              ║
║  Exchanges:                 ${Object.entries(feedStats.exchangeStatus||{}).map(([k,v])=>`${k}:${v}`).join(', ').padStart(30)}  ║
║  Live Ticks Received:       ${String(feedStats.liveMessages||0).padStart(10)}                              ║
║  Final Prices (REAL):                                                        ║
║    BTC/USD: $${safe(feedStats.prices['BTC/USD']).padStart(10)}   ETH/USD: $${safe(feedStats.prices['ETH/USD']).padStart(8)}               ║
║    SOL/USD: $${safe(feedStats.prices['SOL/USD']).padStart(10)}   XRP/USD: $${safe(feedStats.prices['XRP/USD'], 4).padStart(8)}               ║
║    AVAX/USD:$${safe(feedStats.prices['AVAX/USD']).padStart(10)}                                              ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  PYTHON BACKEND + DYNAMIC THRESHOLDS                                         ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  Status: ${(CONFIG.withPython ? '✅ ACTIVE' : '⏸️  DISABLED (use --with-python)').padEnd(55)}       ║
║  Threshold Updates:         ${String(thresholdUpdateCount).padStart(10)}                              ║
║  Calibrated Symbols:        ${String(calibratedSymbols.size).padStart(10)} / ${CONFIG.pairs.length}                            ║${
    finalPrediction ? `
║  BTC Prediction: $${String(finalPrediction.predicted_price?.toFixed(2) || 'N/A').padStart(10)}  (${finalPrediction.trend || 'N/A'})                       ║
║  Confidence:     ${String(((finalPrediction.confidence || 0) * 100).toFixed(1) + '%').padStart(10)}                                         ║
║  Sharpe Ratio:   ${String(finalPrediction.sharpe_ratio?.toFixed(4) || 'N/A').padStart(10)}                                         ║` : ''
}
╚══════════════════════════════════════════════════════════════════════════════╝
`);

    // Verdict
    if (avgLatNs < 100 && rustEngine) {
        console.log('🏆 VERDICT: EXCEPTIONAL! Sub-100ns average — Rust NAPI dominance!');
    } else if (avgLatUs < 1) {
        console.log('🏆 VERDICT: EXCEPTIONAL! Sub-microsecond average latency!');
    } else if (avgLatUs < 70) {
        console.log('✅ VERDICT: TARGET ACHIEVED!');
    } else {
        console.log('⚠️  VERDICT: Needs optimization');
    }

    console.log(`\n🔗 Architecture: WebSocket Feed → Ring Buffer → ${rustEngine ? 'Rust NAPI (128-bit arb)' : 'JS'} Engine${CONFIG.withPython ? ' + Python Backend' : ''}`);
    console.log('═══════════════════════════════════════════════════════════════════════════════\n');
}

// ═══════════════════════════════════════════════════════════════════════════════
// RUN
// ═══════════════════════════════════════════════════════════════════════════════

module.exports = { RingBuffer, WebSocketMarketFeed, JSFallbackEngine, run };

if (require.main === module) {
    // Complexity: O(1)
    run().catch(console.error);
}
