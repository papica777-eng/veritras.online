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

import * as http from 'http';
import * as fs   from 'fs';
import * as path from 'path';
import { ServerResponse } from 'http';

// ── Load .env before anything else ─────────────────────────────────────────────────
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq < 0) continue;
    const k = t.slice(0, eq).trim();
    const v = t.slice(eq + 1).trim().replace(/#.*$/, '').trim();
    if (k && v && !process.env[k]) process.env[k] = v;
  }
  console.log('[Server] .env loaded from', envPath);
}

import {
  SingularityMarketBridge,
  createPaperBridge,
  createSimBridge,
  CognitiveTradeDecision,
  BridgeStats,
  BridgeConfig,
} from './singularity-market-bridge';

import { AtomicSwap } from '../physics/AtomicTrader';
import { marketWatcher } from '../reality/economy/MarketWatcher';
import { atomicTrader  } from '../physics/AtomicTrader';
import {
  patchWithLiveData,
  validateKeys,
  getAccountBalances,
  cancelAllOrders,
} from './live-connector';

// ─── Config ─────────────────────────────────────────────────────────────────
const PORT         = Number(process.env.PORT         ?? 3333);
const TRADING_MODE = (process.env.TRADING_MODE       ?? 'paper') as 'simulation' | 'paper' | 'live';
const CAPITAL_USD  = Number(process.env.CAPITAL_USD  ?? 10_000);
const DASHBOARD    = path.join(__dirname, 'reaper-live-dashboard.html');


// ═══════════════════════════════════════════════════════════════════════════════
// STATE  (kept in memory, streamed to all browser clients)
// ═══════════════════════════════════════════════════════════════════════════════

interface LiveState {
  mode:           string;
  capitalUSD:     number;
  startedAt:      number;

  // P&L
  totalProfitUSD:      number;
  todayProfitUSD:      number;
  swapsExecuted:       number;
  swapsSuccessful:     number;
  winRate:             number;

  // Cognitive
  decisionsEvaluated:  number;
  decisionsApproved:   number;
  decisionsRejected:   number;
  avgCognitiveScore:   number;
  cognitiveApprovalRate: number;

  // Biometric
  currentFatigueLevel: number;
  avgBiometricDelayMs: number;

  // Feed data (rolling windows)
  decisionFeed:        CognitiveTradeDecision[];   // last 50
  tradeFeed:           TradeFeedEntry[];            // last 50
  profitHistory:       ProfitPoint[];               // last 200

  // Oracle
  oracleSignals:       OracleSignal[];              // last 20
}

interface TradeFeedEntry {
  swapId:    string;
  symbol:    string;
  profit:    number;
  latencyMs: number;
  timestamp: number;
  status:    'success' | 'failed';
}

interface ProfitPoint {
  t:           number;   // timestamp
  profit:      number;   // single trade profit
  cumulative:  number;   // running total
}

interface OracleSignal {
  symbol:     string;
  trend:      'bullish' | 'bearish' | 'neutral';
  confidence: number;
  predicted:  number;
  current:    number;
  riskLevel:  string;
  ts:         number;
}

const state: LiveState = {
  mode:           TRADING_MODE,
  capitalUSD:     CAPITAL_USD,
  startedAt:      Date.now(),
  totalProfitUSD:      0,
  todayProfitUSD:      0,
  swapsExecuted:       0,
  swapsSuccessful:     0,
  winRate:             0,
  decisionsEvaluated:  0,
  decisionsApproved:   0,
  decisionsRejected:   0,
  avgCognitiveScore:   0,
  cognitiveApprovalRate: 0,
  currentFatigueLevel: 1,
  avgBiometricDelayMs: 0,
  decisionFeed:        [],
  tradeFeed:           [],
  profitHistory:       [],
  oracleSignals:       [],
};


// ═══════════════════════════════════════════════════════════════════════════════
// BRIDGE — Start the Singularity ↔ Market Reaper
// ═══════════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════════
// SSE CLIENT REGISTRY
// ═══════════════════════════════════════════════════════════════════════════════

const clients = new Set<ServerResponse>();

function broadcast(event: string, data: unknown): void {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const res of clients) {
    try { res.write(payload); } catch { clients.delete(res); }
  }
}


// ═══════════════════════════════════════════════════════════════════════════════
// BRIDGE
// ═══════════════════════════════════════════════════════════════════════════════

const bridgeConfig: Partial<BridgeConfig> = {
  capitalUSD:          CAPITAL_USD,
  minCognitiveScore:   0.82,
  biometricStealthEnabled: true,
  cognitiveSelfCritiqueEnabled: true,

  onTradeDecision: (d: CognitiveTradeDecision) => {
    // Update state
    state.decisionsEvaluated++;
    if (d.approved) state.decisionsApproved++;
    else            state.decisionsRejected++;
    state.cognitiveApprovalRate = (state.decisionsApproved / state.decisionsEvaluated) * 100;
    state.avgCognitiveScore     = d.cognitiveScore;   // last value (good enough for live)
    state.currentFatigueLevel   = d.fatigueLevel;

    // Oracle signals from decision
    if (d.oraclePrediction) {
      const p = d.oraclePrediction;
      // Complexity: O(1)
      pushAndTrim(state.oracleSignals, {
        symbol:     p.symbol,
        trend:      p.trend,
        confidence: p.confidence,
        predicted:  p.predictedPrice,
        current:    p.currentPrice,
        riskLevel:  p.riskLevel,
        ts:         Date.now(),
      }, 20);
    }

    // Decision feed
    // Complexity: O(1)
    pushAndTrim(state.decisionFeed, d, 50);

    // Complexity: O(1)
    broadcast('decision', d);
    // Complexity: O(1)
    broadcast('state', getPublicState());
  },

  onSwapCompleted: (swap: AtomicSwap, decision?: CognitiveTradeDecision) => {
    const profit = decision?.actualProfitUSD ?? 0;

    state.swapsExecuted++;
    state.swapsSuccessful++;
    state.totalProfitUSD += profit;
    state.todayProfitUSD += profit;
    state.winRate = (state.swapsSuccessful / state.swapsExecuted) * 100;
    state.avgBiometricDelayMs = decision?.biometricDelayMs ?? state.avgBiometricDelayMs;

    const entry: TradeFeedEntry = {
      swapId:    swap.id,
      symbol:    decision?.opportunity.symbol ?? '?',
      profit,
      latencyMs: swap.latencyMs ?? 0,
      timestamp: Date.now(),
      status:    'success',
    };
    // Complexity: O(1)
    pushAndTrim(state.tradeFeed, entry, 50);

    const lastCumulative = state.profitHistory.at(-1)?.cumulative ?? 0;
    // Complexity: O(1)
    pushAndTrim(state.profitHistory, {
      t: Date.now(),
      profit,
      cumulative: lastCumulative + profit,
    }, 200);

    // Complexity: O(1)
    broadcast('trade', entry);
    // Complexity: O(1)
    broadcast('state', getPublicState());
  },

  onSwapFailed: (swap: AtomicSwap, reason: string) => {
    state.swapsExecuted++;
    state.winRate = state.swapsExecuted > 0
      ? (state.swapsSuccessful / state.swapsExecuted) * 100
      : 0;

    const entry: TradeFeedEntry = {
      swapId:    swap.id,
      symbol:    '?',
      profit:    0,
      latencyMs: 0,
      timestamp: Date.now(),
      status:    'failed',
    };
    // Complexity: O(1)
    pushAndTrim(state.tradeFeed, entry, 50);
    // Complexity: O(1)
    broadcast('trade-failed', { swapId: swap.id, reason });
    // Complexity: O(1)
    broadcast('state', getPublicState());
  },
};

const bridge = TRADING_MODE === 'live'
  ? new SingularityMarketBridge({ ...bridgeConfig, reaperMode: 'live' })
  : TRADING_MODE === 'paper'
    ? createPaperBridge(bridgeConfig)
    : createSimBridge(bridgeConfig);

// ── Hook up real Binance data (paper = real prices, live = real orders too) ──
if (TRADING_MODE !== 'simulation') {
  const status = validateKeys();
  console.log(`\n[Server] ${status.message}`);
  // Complexity: O(1)
  patchWithLiveData(marketWatcher, atomicTrader);
} else {
  console.log('[Server] 🎮 SIMULATION mode — all data is synthetic.');
}

// Periodic full stats sync
bridge.on('stats', (s: BridgeStats) => {
  state.totalProfitUSD        = s.totalProfitUSD;
  state.avgCognitiveScore     = s.avgCognitiveScore;
  state.avgBiometricDelayMs   = s.avgBiometricDelayMs;
  state.currentFatigueLevel   = s.currentFatigueLevel;
  state.cognitiveApprovalRate = s.cognitiveApprovalRate;
  // Complexity: O(1)
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
    res.end(); return;
  }

  const json = (data: unknown) => {
    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    res.end(JSON.stringify(data));
  };

  // ── Balance check ───────────────────────────────────────────────────────────
  if (url === '/api/balances' && req.method === 'GET') {
    // SAFETY: async operation — wrap in try-catch for production resilience
    const balances = await getAccountBalances();
    return json({ ok: true, balances });
  }

  // ── Keys status ───────────────────────────────────────────────────────────
  if (url === '/api/keys-status') {
    return json(validateKeys());
  }

  // ── PAUSE bridge ────────────────────────────────────────────────────────
  if (url === '/api/pause' && req.method === 'POST') {
    // SAFETY: async operation — wrap in try-catch for production resilience
    if (isBridgeRunning) { await bridge.stop(); isBridgeRunning = false; }
    // Complexity: O(1)
    broadcast('bridge-state', { running: false });
    return json({ ok: true, running: false });
  }

  // ── RESUME bridge ────────────────────────────────────────────────────────
  if (url === '/api/resume' && req.method === 'POST') {
    // SAFETY: async operation — wrap in try-catch for production resilience
    if (!isBridgeRunning) { await bridge.start(); isBridgeRunning = true; }
    // Complexity: O(1)
    broadcast('bridge-state', { running: true });
    return json({ ok: true, running: true });
  }

  // ── CLEAR stats & feeds ──────────────────────────────────────────────────
  if (url === '/api/clear' && req.method === 'POST') {
    state.decisionFeed.length   = 0;
    state.tradeFeed.length      = 0;
    state.profitHistory.length  = 0;
    state.totalProfitUSD        = 0;
    state.todayProfitUSD        = 0;
    state.swapsExecuted         = 0;
    state.swapsSuccessful       = 0;
    state.decisionsEvaluated    = 0;
    state.decisionsApproved     = 0;
    state.decisionsRejected     = 0;
    state.cognitiveApprovalRate = 0;
    state.winRate               = 0;
    // Complexity: O(1)
    broadcast('clear', {});
    // Complexity: O(1)
    broadcast('state', getPublicState());
    return json({ ok: true });
  }

  // ── PANIC STOP ───────────────────────────────────────────────────────────
  if (url === '/api/panic' && req.method === 'POST') {
    // SAFETY: async operation — wrap in try-catch for production resilience
    if (isBridgeRunning) { await bridge.stop(); isBridgeRunning = false; }
    // SAFETY: async operation — wrap in try-catch for production resilience
    await cancelAllOrders();   // cancel any open Binance orders
    // Complexity: O(1)
    broadcast('panic', {});
    // Complexity: O(1)
    broadcast('bridge-state', { running: false });
    console.log('\n🚨 PANIC STOP triggered from dashboard\n');
    return json({ ok: true, running: false });
  }

  // ── SSE endpoint ──────────────────────────────────────────────────────────
  if (url === '/events') {
    res.writeHead(200, {
      'Content-Type':  'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection':    'keep-alive',
      'Access-Control-Allow-Origin': '*',
    });
    res.flushHeaders();
    res.write(`event: init\ndata: ${JSON.stringify(getPublicState())}\n\n`);

    clients.add(res);
    console.log(`📡 Browser connected  (total: ${clients.size})`);

    const heartbeat = setInterval(() => {
      try { res.write(': ping\n\n'); } catch { clearInterval(heartbeat); }
    }, 20_000);

    req.on('close', () => {
      // Complexity: O(1)
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
  } else {
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

function pushAndTrim<T>(arr: T[], item: T, maxLen: number): void {
  arr.push(item);
  if (arr.length > maxLen) arr.shift();
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

bridge.start().then(() =>
  console.log('⚔️  Bridge started. Waiting for market opportunities…\n')
);

process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down…');
  // SAFETY: async operation — wrap in try-catch for production resilience
  await bridge.stop();
  httpServer.close();
  process.exit(0);
});
