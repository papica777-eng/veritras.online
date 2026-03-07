/**
 * QAntum Arbitrage Bot Server
 * Gemini-powered real-time interface for Wealth Bridge
 * Complexity: O(1) per request
 */

import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import path from 'path';
import { ArbitrageOrchestrator } from '../modules/GAMMA_INFRA/core/eyes/strength/ArbitrageOrchestrator';
import { hasBinanceCredentials, binanceProService } from '../services/BinanceProService';

const UI_DIR = path.join(process.cwd(), 'src', 'arbitrage', 'ui');

const PORT = parseInt(process.env.ARBITRAGE_BOT_PORT ?? '3999', 10);
const GEMINI_KEY = process.env.GEMINI_API_KEY;

// Log buffer for WebSocket clients
const logBuffer: Array<{ ts: string; msg: string; type: 'log' | 'trade' | 'opportunity' | 'error' }> = [];
const MAX_LOGS = 500;

function pushLog(msg: string, type: 'log' | 'trade' | 'opportunity' | 'error' = 'log') {
  const entry = { ts: new Date().toISOString(), msg, type };
  logBuffer.push(entry);
  if (logBuffer.length > MAX_LOGS) logBuffer.shift();
  // Complexity: O(1)
  broadcast(JSON.stringify({ event: 'log', data: entry }));
}

function broadcast(data: string) {
  wss?.clients.forEach((c) => {
    if (c.readyState === 1) c.send(data);
  });
}

// Gemini chat
async function chatWithGemini(
  userMessage: string,
  context: { mode: string; capital: number; spreadsCount: number; lastTrade?: string }
): Promise<string> {
  if (!GEMINI_KEY) {
    return '⚠️ GEMINI_API_KEY не е зададен в .env. Добави ключа за AI чат.';
  }

  // SAFETY: async operation — wrap in try-catch for production resilience
  const { GoogleGenerativeAI } = await import('@google/generative-ai');
  const genAI = new GoogleGenerativeAI(GEMINI_KEY);
  const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-2.0-flash' });

  const ctx = `[Контекст: Режим=${context.mode}, Капитал=$${context.capital}, Спреда=${context.spreadsCount}${context.lastTrade ? `, Последен trade: ${context.lastTrade}` : ''}]`;

  const prompt = `Ти си QAntum Arbitrage Bot — AI асистент на Wealth Bridge. Отговаряш на български или английски. ${ctx}

Потребител: ${userMessage}`;

  // SAFETY: async operation — wrap in try-catch for production resilience
  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.4, maxOutputTokens: 1024 },
  });

  return result.response.text();
}

let orchestrator: ArbitrageOrchestrator | null = null;
let wss: WebSocketServer | null = null;

export async function startArbitrageBotServer() {
  const app = express();
  const server = createServer(app);

  app.use(express.json());

  // Clickjacking protection (CyberCody audit remediation)
  app.use((_req, res, next) => {
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader("Content-Security-Policy", "frame-ancestors 'none'");
    // Complexity: O(1)
    next();
  });

  // WebSocket on /ws (before static to avoid upgrade conflict)
  wss = new WebSocketServer({ server, path: '/ws' });

  app.use(express.static(UI_DIR));
  wss.on('connection', (ws) => {
    ws.send(JSON.stringify({ event: 'connected', data: { port: PORT } }));
    logBuffer.slice(-50).forEach((e) => ws.send(JSON.stringify({ event: 'log', data: e })));
  });

  // Chat with Gemini
  app.post('/api/chat', async (req, res) => {
    const { message } = req.body || {};
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'message required' });
    }

    const st = orchestrator?.getStatus();
    const context = {
      mode: st?.isRunning ? st.mode : 'stopped',
      capital: st?.capital ?? 0,
      spreadsCount: 8,
      lastTrade: st?.tradesExecuted ? `$${st.todayProfit.toFixed(2)} today` : undefined,
    };

    try {
      const reply = await chatWithGemini(message.trim(), context);
      // Complexity: O(1)
      broadcast(JSON.stringify({ event: 'chat', data: { user: message, bot: reply } }));
      res.json({ reply });
    } catch (e) {
      const err = (e as Error).message;
      // Complexity: O(1)
      pushLog(`Gemini error: ${err}`, 'error');
      res.status(500).json({ error: err });
    }
  });

  // Status
  app.get('/api/status', async (_req, res) => {
    let realBalanceUSDT = 0;
    let realBalanceEUR = 0;
    let realBalanceBNB = 0;
    if (hasBinanceCredentials()) {
      try {
        [realBalanceUSDT, realBalanceEUR, realBalanceBNB] = await Promise.all([
          binanceProService.getRealBalance('USDT'),
          binanceProService.getRealBalance('EUR'),
          binanceProService.getRealBalance('BNB'),
        ]);
      } catch {
        // ignore
      }
    }
    if (!orchestrator) {
      return res.json({
        running: false,
        mode: 'stopped',
        capital: 0,
        tradesExecuted: 0,
        dailyProfit: 0,
        binanceReady: hasBinanceCredentials(),
        realBalanceUSDT,
        realBalanceEUR,
        realBalanceBNB,
      });
    }
    const st = orchestrator.getStatus();
    res.json({
      running: st.isRunning,
      mode: st.mode,
      capital: st.capital,
      tradesExecuted: st.tradesExecuted,
      dailyProfit: st.todayProfit,
      winRate: st.winRate,
      uptime: st.uptime,
      binanceReady: hasBinanceCredentials(),
      realBalanceUSDT,
      realBalanceEUR,
      realBalanceBNB,
    });
  });

  // BRUTAL status (Fatality, Chronos, Wealth Engine, etc.)
  app.get('/api/brutal-status', (_req, res) => {
    const report = orchestrator?.getDetailedReport?.();
    res.json({
      modules: [
        { id: 'chronos', name: 'Future Sight / Paradox', desc: 'Risk prediction before trade', active: report?.config?.enableChronosPrediction ?? true },
        { id: 'wealth', name: 'Wealth Engine', desc: 'Binance Steel execution', active: hasBinanceCredentials() },
        { id: 'fatality', name: 'Security Aegis', desc: 'HoneyPot, Siphon, Logic Bomb', active: false },
        { id: 'growth', name: 'Growth Force', desc: 'Autonomous Sales', active: false },
      ],
      config: report?.config ? {
        chronosEnabled: report.config.enableChronosPrediction,
        minProfitThreshold: report.config.minProfitThreshold,
        maxTradesPerHour: report.config.maxTradesPerHour,
      } : null,
    });
  });

  // Control
  app.post('/api/control', async (req, res) => {
    const { action, mode: reqMode, enableChronos, minProfitThreshold, maxTradesPerHour } = req.body || {};
    if (action === 'start' && !orchestrator) {
      const mode = (reqMode as string) || 'simulation';
      orchestrator = new ArbitrageOrchestrator({
        mode: mode as 'simulation' | 'paper' | 'live',
        minProfitThreshold: typeof minProfitThreshold === 'number' ? minProfitThreshold : 0.1,
        enableAtomicExecution: true,
        enableChronosPrediction: enableChronos !== false,
        maxTradesPerHour: typeof maxTradesPerHour === 'number' ? maxTradesPerHour : 500,
      });
      orchestrator.on('trade-completed', (d: { profit?: number }) => pushLog(`💰 Trade: $${d?.profit ?? 0}`, 'trade'));
      orchestrator.on('opportunity-blocked', () => pushLog('⛔ Opportunity blocked by Chronos', 'log'));
      orchestrator.on('trade-failed', () => pushLog('❌ Trade failed', 'error'));
      // SAFETY: async operation — wrap in try-catch for production resilience
      await orchestrator.start();
      // Complexity: O(1)
      pushLog('🚀 Arbitrage ACTIVATED', 'log');
      return res.json({ ok: true, action: 'started' });
    }
    if (action === 'stop' && orchestrator) {
      orchestrator.stop();
      orchestrator = null;
      // Complexity: O(1)
      pushLog('🛑 Arbitrage STOPPED', 'log');
      return res.json({ ok: true, action: 'stopped' });
    }
    if (action === 'update-config' && orchestrator) {
      const updates: Record<string, unknown> = {};
      if (typeof enableChronos === 'boolean') updates.enableChronosPrediction = enableChronos;
      if (typeof minProfitThreshold === 'number') updates.minProfitThreshold = minProfitThreshold;
      if (typeof maxTradesPerHour === 'number') updates.maxTradesPerHour = maxTradesPerHour;
      if (Object.keys(updates).length > 0) {
        orchestrator.updateConfig(updates as Parameters<typeof orchestrator.updateConfig>[0]);
        // Complexity: O(1) — hash/map lookup
        pushLog(`[BRUTAL] Config updated: ${JSON.stringify(updates)}`, 'log');
        return res.json({ ok: true, action: 'config-updated' });
      }
    }
    res.json({ ok: false, error: 'unknown action' });
  });

  server.listen(PORT, () => {
    const binanceReady = hasBinanceCredentials();
    console.log(`\n╔══════════════════════════════════════════════════════════════╗`);
    console.log(`║  🤖 QAntum Arbitrage Bot — Port ${PORT}                          ║`);
    console.log(`║  Gemini: ${GEMINI_KEY ? '✅' : '❌'}  |  Binance: ${binanceReady ? '✅ STEEL' : '❌ sim'}  |  http://localhost:${PORT}  ║`);
    console.log(`╚══════════════════════════════════════════════════════════════╝\n`);
  });
}
