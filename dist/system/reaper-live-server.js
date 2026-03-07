"use strict";
/**
 * ╔══════════════════════════════════════════════════════════════════════════════════╗
 * ║  QANTUM MARKET REAPER — LIVE DASHBOARD SERVER  v1.0.0                           ║
 * ║                                                                                  ║
 * ║  Stack:  Node.js http (built-in) + Server-Sent Events — ZERO extra deps         ║
 * ║                                                                                  ║
 * ║  Run:  npx ts-node reaper-live-server.ts                                         ║
 * ║  Open: http://localhost:3333                                                      ║
 * ╚══════════════════════════════════════════════════════════════════════════════════╝
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const http = __importStar(require("http"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// ── Load .env before anything else ─────────────────────────────────────────────────
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
        const t = line.trim();
        if (!t || t.startsWith('#'))
            continue;
        const eq = t.indexOf('=');
        if (eq < 0)
            continue;
        const k = t.slice(0, eq).trim();
        const v = t.slice(eq + 1).trim().replace(/#.*$/, '').trim();
        if (k && v && !process.env[k])
            process.env[k] = v;
    }
    console.log('[Server] .env loaded from', envPath);
}
const singularity_market_bridge_1 = require("./singularity-market-bridge");
const MarketWatcher_1 = require("./reality/economy/MarketWatcher");
const AtomicTrader_1 = require("./physics/AtomicTrader");
const live_connector_1 = require("./live-connector");
// ─── Config ─────────────────────────────────────────────────────────────────
const PORT = Number(process.env.PORT ?? 3333);
const TRADING_MODE = (process.env.TRADING_MODE ?? 'paper');
const CAPITAL_USD = Number(process.env.CAPITAL_USD ?? 10_000);
const DASHBOARD = path.join(__dirname, 'reaper-live-dashboard.html');
const state = {
    mode: TRADING_MODE,
    capitalUSD: CAPITAL_USD,
    startedAt: Date.now(),
    totalProfitUSD: 0,
    todayProfitUSD: 0,
    swapsExecuted: 0,
    swapsSuccessful: 0,
    winRate: 0,
    decisionsEvaluated: 0,
    decisionsApproved: 0,
    decisionsRejected: 0,
    avgCognitiveScore: 0,
    cognitiveApprovalRate: 0,
    currentFatigueLevel: 1,
    avgBiometricDelayMs: 0,
    decisionFeed: [],
    tradeFeed: [],
    profitHistory: [],
    oracleSignals: [],
};
// ═══════════════════════════════════════════════════════════════════════════════
// BRIDGE — Start the Singularity ↔ Market Reaper
// ═══════════════════════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════════════════════
// SSE CLIENT REGISTRY
// ═══════════════════════════════════════════════════════════════════════════════
const clients = new Set();
function broadcast(event, data) {
    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    for (const res of clients) {
        try {
            res.write(payload);
        }
        catch {
            clients.delete(res);
        }
    }
}
// ═══════════════════════════════════════════════════════════════════════════════
// BRIDGE
// ═══════════════════════════════════════════════════════════════════════════════
const bridgeConfig = {
    capitalUSD: CAPITAL_USD,
    minCognitiveScore: 0.82,
    biometricStealthEnabled: true,
    cognitiveSelfCritiqueEnabled: true,
    onTradeDecision: (d) => {
        // Update state
        state.decisionsEvaluated++;
        if (d.approved)
            state.decisionsApproved++;
        else
            state.decisionsRejected++;
        state.cognitiveApprovalRate = (state.decisionsApproved / state.decisionsEvaluated) * 100;
        state.avgCognitiveScore = d.cognitiveScore; // last value (good enough for live)
        state.currentFatigueLevel = d.fatigueLevel;
        // Oracle signals from decision
        if (d.oraclePrediction) {
            const p = d.oraclePrediction;
            pushAndTrim(state.oracleSignals, {
                symbol: p.symbol,
                trend: p.trend,
                confidence: p.confidence,
                predicted: p.predictedPrice,
                current: p.currentPrice,
                riskLevel: p.riskLevel,
                ts: Date.now(),
            }, 20);
        }
        // Decision feed
        pushAndTrim(state.decisionFeed, d, 50);
        broadcast('decision', d);
        broadcast('state', getPublicState());
    },
    onSwapCompleted: (swap, decision) => {
        const profit = decision?.actualProfitUSD ?? 0;
        state.swapsExecuted++;
        state.swapsSuccessful++;
        state.totalProfitUSD += profit;
        state.todayProfitUSD += profit;
        state.winRate = (state.swapsSuccessful / state.swapsExecuted) * 100;
        state.avgBiometricDelayMs = decision?.biometricDelayMs ?? state.avgBiometricDelayMs;
        const entry = {
            swapId: swap.id,
            symbol: decision?.opportunity.symbol ?? '?',
            profit,
            latencyMs: swap.latencyMs ?? 0,
            timestamp: Date.now(),
            status: 'success',
        };
        pushAndTrim(state.tradeFeed, entry, 50);
        const lastCumulative = state.profitHistory.at(-1)?.cumulative ?? 0;
        pushAndTrim(state.profitHistory, {
            t: Date.now(),
            profit,
            cumulative: lastCumulative + profit,
        }, 200);
        broadcast('trade', entry);
        broadcast('state', getPublicState());
    },
    onSwapFailed: (swap, reason) => {
        state.swapsExecuted++;
        state.winRate = state.swapsExecuted > 0
            ? (state.swapsSuccessful / state.swapsExecuted) * 100
            : 0;
        const entry = {
            swapId: swap.id,
            symbol: '?',
            profit: 0,
            latencyMs: 0,
            timestamp: Date.now(),
            status: 'failed',
        };
        pushAndTrim(state.tradeFeed, entry, 50);
        broadcast('trade-failed', { swapId: swap.id, reason });
        broadcast('state', getPublicState());
    },
};
const bridge = TRADING_MODE === 'live'
    ? new singularity_market_bridge_1.SingularityMarketBridge({ ...bridgeConfig, reaperMode: 'live' })
    : TRADING_MODE === 'paper'
        ? (0, singularity_market_bridge_1.createPaperBridge)(bridgeConfig)
        : (0, singularity_market_bridge_1.createSimBridge)(bridgeConfig);
// ── Hook up real Binance data (paper = real prices, live = real orders too) ──
if (TRADING_MODE !== 'simulation') {
    const status = (0, live_connector_1.validateKeys)();
    console.log(`\n[Server] ${status.message}`);
    (0, live_connector_1.patchWithLiveData)(MarketWatcher_1.marketWatcher, AtomicTrader_1.atomicTrader);
}
else {
    console.log('[Server] 🎮 SIMULATION mode — all data is synthetic.');
}
// Periodic full stats sync
bridge.on('stats', (s) => {
    state.totalProfitUSD = s.totalProfitUSD;
    state.avgCognitiveScore = s.avgCognitiveScore;
    state.avgBiometricDelayMs = s.avgBiometricDelayMs;
    state.currentFatigueLevel = s.currentFatigueLevel;
    state.cognitiveApprovalRate = s.cognitiveApprovalRate;
    broadcast('stats', s);
});
// ═══════════════════════════════════════════════════════════════════════════════
// HTTP SERVER  (static + SSE + REST)
// ═══════════════════════════════════════════════════════════════════════════════
let isBridgeRunning = true;
const httpServer = http.createServer(async (req, res) => {
    const url = req.url ?? '/';
    // CORS pre-flight
    if (req.method === 'OPTIONS') {
        res.writeHead(204, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST', 'Access-Control-Allow-Headers': 'Content-Type' });
        res.end();
        return;
    }
    const json = (data) => {
        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify(data));
    };
    // ── Balance check ───────────────────────────────────────────────────────────
    if (url === '/api/balances' && req.method === 'GET') {
        const balances = await (0, live_connector_1.getAccountBalances)();
        return json({ ok: true, balances });
    }
    // ── Keys status ───────────────────────────────────────────────────────────
    if (url === '/api/keys-status') {
        return json((0, live_connector_1.validateKeys)());
    }
    // ── PAUSE bridge ────────────────────────────────────────────────────────
    if (url === '/api/pause' && req.method === 'POST') {
        if (isBridgeRunning) {
            await bridge.stop();
            isBridgeRunning = false;
        }
        broadcast('bridge-state', { running: false });
        return json({ ok: true, running: false });
    }
    // ── RESUME bridge ────────────────────────────────────────────────────────
    if (url === '/api/resume' && req.method === 'POST') {
        if (!isBridgeRunning) {
            await bridge.start();
            isBridgeRunning = true;
        }
        broadcast('bridge-state', { running: true });
        return json({ ok: true, running: true });
    }
    // ── CLEAR stats & feeds ──────────────────────────────────────────────────
    if (url === '/api/clear' && req.method === 'POST') {
        state.decisionFeed.length = 0;
        state.tradeFeed.length = 0;
        state.profitHistory.length = 0;
        state.totalProfitUSD = 0;
        state.todayProfitUSD = 0;
        state.swapsExecuted = 0;
        state.swapsSuccessful = 0;
        state.decisionsEvaluated = 0;
        state.decisionsApproved = 0;
        state.decisionsRejected = 0;
        state.cognitiveApprovalRate = 0;
        state.winRate = 0;
        broadcast('clear', {});
        broadcast('state', getPublicState());
        return json({ ok: true });
    }
    // ── PANIC STOP ───────────────────────────────────────────────────────────
    if (url === '/api/panic' && req.method === 'POST') {
        if (isBridgeRunning) {
            await bridge.stop();
            isBridgeRunning = false;
        }
        await (0, live_connector_1.cancelAllOrders)(); // cancel any open Binance orders
        broadcast('panic', {});
        broadcast('bridge-state', { running: false });
        console.log('\n🚨 PANIC STOP triggered from dashboard\n');
        return json({ ok: true, running: false });
    }
    // ── SSE endpoint ──────────────────────────────────────────────────────────
    if (url === '/events') {
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*',
        });
        res.flushHeaders();
        res.write(`event: init\ndata: ${JSON.stringify(getPublicState())}\n\n`);
        clients.add(res);
        console.log(`📡 Browser connected  (total: ${clients.size})`);
        const heartbeat = setInterval(() => {
            try {
                res.write(': ping\n\n');
            }
            catch {
                clearInterval(heartbeat);
            }
        }, 20_000);
        req.on('close', () => {
            clearInterval(heartbeat);
            clients.delete(res);
            console.log(`📡 Browser disconnected (total: ${clients.size})`);
        });
        return;
    }
    // ── REST snapshot ──────────────────────────────────────────────────────────
    if (url === '/api/state') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(getPublicState()));
        return;
    }
    // ── Dashboard HTML ─────────────────────────────────────────────────────────
    if (fs.existsSync(DASHBOARD)) {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(fs.readFileSync(DASHBOARD));
    }
    else {
        res.writeHead(404);
        res.end(`Dashboard not found at: ${DASHBOARD}`);
    }
});
httpServer.listen(PORT, () => {
    console.log('\n' + '═'.repeat(60));
    console.log('  ⚔️  QANTUM MARKET REAPER  —  LIVE DASHBOARD');
    console.log(`  Mode: ${TRADING_MODE.toUpperCase()}  |  Capital: $${CAPITAL_USD.toLocaleString()}`);
    console.log(`  🌐  http://localhost:${PORT}`);
    console.log('═'.repeat(60) + '\n');
});
// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════
function pushAndTrim(arr, item, maxLen) {
    arr.push(item);
    if (arr.length > maxLen)
        arr.shift();
}
function getPublicState() {
    return {
        ...state,
        uptime: Date.now() - state.startedAt,
        bridgeRunning: isBridgeRunning,
    };
}
// ═══════════════════════════════════════════════════════════════════════════════
// START
// ═══════════════════════════════════════════════════════════════════════════════
bridge.start().then(() => console.log('⚔️  Bridge started. Waiting for market opportunities…\n'));
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down…');
    await bridge.stop();
    httpServer.close();
    process.exit(0);
});
