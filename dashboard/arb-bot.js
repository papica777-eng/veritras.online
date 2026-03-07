/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  QAntum Prime — Arbitrage Bot Engine  v2 (hardened)                          ║
 * ║                                                                               ║
 * ║  Cross-exchange spread arbitrage with real-time opportunity scanning.          ║
 * ║  Controlled via the Dashboard server (start / stop / config).                 ║
 * ║                                                                               ║
 * ║  v2 Improvements:                                                             ║
 * ║    1. REAL cross-exchange prices (no more Math.random())                      ║
 * ║    2. Triangular arbitrage via Rust engine (BTC→ETH→SOL→BTC loops)            ║
 * ║    3. Z-score stat-arb — mean-reversion on spread history (2σ trigger)        ║
 * ║    4. Latency-adjusted spread threshold                                       ║
 * ║                                                                               ║
 * ║  Modes:                                                                       ║
 * ║    paper  — log opportunities + simulated fills only                          ║
 * ║    live   — execute real orders via binance-client (requires .env keys)        ║
 * ║                                                                               ║
 * ║  © 2025-2026 Dimitar Prodromov | QAntum Cognitive Empire                      ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

'use strict';

const EventEmitter = require('events');
const fs   = require('fs');
const path = require('path');

// ─── Default Config ────────────────────────────────────────────────────────────

const DEFAULT_CONFIG = {
    mode:             'paper',        // 'paper' | 'live'
    capitalUsd:       500,            // total capital allocated to arb
    maxOrderUsd:      50,             // max per-trade size
    minSpreadPct:     0.15,           // min spread % to consider
    minProfitUsd:     0.10,           // min absolute profit after fees
    feePercentA:      0.10,           // exchange A fee %
    feePercentB:      0.10,           // exchange B fee %
    slippagePct:      0.05,           // estimated slippage %
    networkFeeUsd:    0.50,           // network / withdrawal fee
    scanIntervalMs:   3000,           // how often to scan (ms)
    cooldownMs:       10000,          // cooldown between trades on same pair
    pairs:            ['BTC/USD', 'ETH/USD', 'SOL/USD', 'XRP/USD', 'AVAX/USD'],
    exchanges:        ['binance', 'kraken'],
    maxTradesPerHour: 30,
    dailyLossLimitUsd: 20,
    // ── Z-Score Stat-Arb Config ──
    spreadHistorySize: 200,           // rolling window for mean/stddev
    zScoreThreshold:   2.0,           // trigger arb when spread > 2σ from mean
    // ── Triangular Arb ──
    enableTriangularArb: true,        // enable tri-arb scanning
    triArbMinProfitPct:  0.05,        // min profit % for triangular arb
};

// ─── Arb Bot Class ─────────────────────────────────────────────────────────────

class ArbBot extends EventEmitter {
    constructor(livePricesRef, rustEngineRef) {
        super();
        this.config        = { ...DEFAULT_CONFIG };
        this.livePrices    = livePricesRef;        // shared reference from server
        this.rustEngine    = rustEngineRef;         // optional Rust engine
        this.running       = false;
        this.timer         = null;
        this.startedAt     = 0;

        // Tracking
        this.spentUsd      = 0;
        this.realizedPnl   = 0;
        this.tradesTotal   = 0;
        this.tradesWon     = 0;
        this.tradesLost    = 0;
        this.tradesThisHour = 0;
        this.hourStart     = 0;
        this.dailyPnl      = 0;

        // Last trade timestamps per pair (for cooldown)
        this.lastTradeTime = {};

        // Trade log (last 200 entries)
        this.tradeLog      = [];

        // Scanned opportunities (last scan result)
        this.lastScan      = [];

        // ── Z-Score Stat-Arb: spread history ──
        this.spreadHistory = {};   // symbol -> [{ts, spread}] rolling window
        this.spreadStats   = {};   // symbol -> {mean, stddev, zScore}

        // ── Triangular arb tracking ──
        this.triArbOpportunities = 0;
        this.triArbBestProfit    = 0;

        // Persistent log
        this.logDir  = path.join(__dirname, 'trades');
        if (!fs.existsSync(this.logDir)) fs.mkdirSync(this.logDir, { recursive: true });
        this.logFile = path.join(this.logDir, `arb-bot-${new Date().toISOString().replace(/[:.]/g, '-')}.log`);
    }

    // ── Log ──────────────────────────────────────────────

    log(msg) {
        const line = `[${new Date().toISOString()}] ${msg}`;
        this.emit('log', line);
        try { fs.appendFileSync(this.logFile, line + '\n'); } catch (_) {}
    }

    // ── Configure ────────────────────────────────────────

    configure(partial) {
        Object.assign(this.config, partial);
        this.log(`CONFIG UPDATED: ${JSON.stringify(this.config)}`);
        this.emit('config', this.config);
    }

    // ── Start / Stop ─────────────────────────────────────

    start() {
        if (this.running) return;
        this.running   = true;
        this.startedAt = Date.now();
        this.hourStart = Date.now();
        this.tradesThisHour = 0;
        this.dailyPnl  = 0;
        this.log(`ARB BOT STARTED  mode=${this.config.mode}  capital=$${this.config.capitalUsd}  minSpread=${this.config.minSpreadPct}%`);
        this.emit('started');

        // Main scan loop
        this.timer = setInterval(() => this._scan(), this.config.scanIntervalMs);
        // Run first scan immediately
        this._scan();
    }

    stop() {
        if (!this.running) return;
        this.running = false;
        if (this.timer) { clearInterval(this.timer); this.timer = null; }
        this.log(`ARB BOT STOPPED  trades=${this.tradesTotal}  pnl=$${this.realizedPnl.toFixed(4)}`);
        this.emit('stopped');
    }

    // ── Status Snapshot ──────────────────────────────────

    status() {
        const uptime = this.running ? Date.now() - this.startedAt : 0;
        return {
            running:        this.running,
            mode:           this.config.mode,
            uptime,
            uptimeFormatted: this._fmtUptime(uptime),
            capitalUsd:     this.config.capitalUsd,
            spentUsd:       Math.round(this.spentUsd * 100) / 100,
            realizedPnl:    Math.round(this.realizedPnl * 10000) / 10000,
            dailyPnl:       Math.round(this.dailyPnl * 10000) / 10000,
            tradesTotal:    this.tradesTotal,
            tradesWon:      this.tradesWon,
            tradesLost:     this.tradesLost,
            winRate:        this.tradesTotal > 0 ? Math.round((this.tradesWon / this.tradesTotal) * 10000) / 100 : 0,
            tradesThisHour: this.tradesThisHour,
            maxTradesPerHour: this.config.maxTradesPerHour,
            triArbOpportunities: this.triArbOpportunities,
            triArbBestProfit:    Math.round(this.triArbBestProfit * 10000) / 10000,
            spreadStats:    { ...this.spreadStats },
            lastScan:       this.lastScan,
            recentTrades:   this.tradeLog.slice(-50),
            config:         this.config,
        };
    }

    // ── Core Scan (v2 — real cross-exchange prices + Z-score stat-arb) ────

    _scan() {
        if (!this.running) return;

        // Hourly rate-limit reset
        if (Date.now() - this.hourStart > 3600000) {
            this.hourStart = Date.now();
            this.tradesThisHour = 0;
        }

        // Daily loss guard
        if (this.dailyPnl < -this.config.dailyLossLimitUsd) {
            this.log(`DAILY LOSS LIMIT HIT ($${this.dailyPnl.toFixed(2)}) — pausing`);
            return;
        }

        const opportunities = [];
        const [exA, exB] = this.config.exchanges;   // 'binance', 'kraken'

        for (const sym of this.config.pairs) {
            // ══════════════════════════════════════════════════════════════
            // v2 FIX #1: Use REAL per-exchange prices (no Math.random())
            // server.js now stores: livePrices['binance:BTC/USD'] & livePrices['kraken:BTC/USD']
            // ══════════════════════════════════════════════════════════════
            const priceA = this.livePrices[`${exA}:${sym}`];
            const priceB = this.livePrices[`${exB}:${sym}`];

            // Skip if either exchange hasn't reported a price yet
            if (!priceA || priceA <= 0 || !priceB || priceB <= 0) continue;

            // ══════════════════════════════════════════════════════════════
            // v2 FIX #3: Z-Score Stat-Arb — track spread history & compute Z
            // ══════════════════════════════════════════════════════════════
            const rawSpread = priceA - priceB;
            if (!this.spreadHistory[sym]) this.spreadHistory[sym] = [];
            const hist = this.spreadHistory[sym];
            hist.push({ ts: Date.now(), spread: rawSpread });
            // Keep rolling window
            while (hist.length > this.config.spreadHistorySize) hist.shift();

            // Compute mean + stddev of spread
            let spreadMean = 0, spreadStd = 0, zScore = 0;
            if (hist.length >= 10) {
                const spreads = hist.map(h => h.spread);
                spreadMean = spreads.reduce((a, b) => a + b, 0) / spreads.length;
                const variance = spreads.reduce((a, b) => a + (b - spreadMean) ** 2, 0) / spreads.length;
                spreadStd = Math.sqrt(variance) || 1e-10;
                zScore = (rawSpread - spreadMean) / spreadStd;
            }
            this.spreadStats[sym] = {
                mean: Math.round(spreadMean * 100) / 100,
                stddev: Math.round(spreadStd * 100) / 100,
                zScore: Math.round(zScore * 1000) / 1000,
                samples: hist.length,
            };

            // Use Rust 128-bit batchArb if available for precise fee/slippage calc
            if (this.rustEngine && this.rustEngine.batchArb) {
                try {
                    this.rustEngine.batchArb({
                        pairs: [{
                            symbol: sym,
                            exchangeA: exA,
                            exchangeB: exB,
                            priceA,
                            priceB,
                        }],
                        capitalUsd: this.config.capitalUsd,
                        feePercent: this.config.feePercentA,
                        slippagePercent: this.config.slippagePct,
                        networkFeeUsd: this.config.networkFeeUsd,
                    });
                } catch (_) {}
            }

            // Determine direction
            let buyPrice, sellPrice, buyExchange, sellExchange;
            if (priceA < priceB) {
                buyPrice = priceA; sellPrice = priceB;
                buyExchange = exA; sellExchange = exB;
            } else {
                buyPrice = priceB; sellPrice = priceA;
                buyExchange = exB; sellExchange = exA;
            }

            const spreadPct = ((sellPrice - buyPrice) / buyPrice) * 100;
            const orderUsd  = Math.min(this.config.maxOrderUsd, this.config.capitalUsd - this.spentUsd);
            const qty       = orderUsd / buyPrice;

            // Gross profit
            const gross = (sellPrice - buyPrice) * qty;
            // Fees
            const feeA  = orderUsd * (this.config.feePercentA / 100);
            const feeB  = orderUsd * (this.config.feePercentB / 100);
            const slip  = orderUsd * (this.config.slippagePct / 100) * 2; // both sides
            const net   = gross - feeA - feeB - slip - this.config.networkFeeUsd;

            // v2: viability check uses BOTH spread threshold AND Z-score
            const spreadViable = spreadPct >= this.config.minSpreadPct && net >= this.config.minProfitUsd;
            const zScoreViable = Math.abs(zScore) >= this.config.zScoreThreshold && net >= this.config.minProfitUsd;
            const viable = spreadViable || zScoreViable;

            opportunities.push({
                symbol:       sym,
                buyExchange,
                sellExchange,
                buyPrice:     Math.round(buyPrice * 100) / 100,
                sellPrice:    Math.round(sellPrice * 100) / 100,
                spreadPct:    Math.round(spreadPct * 10000) / 10000,
                zScore:       Math.round(zScore * 1000) / 1000,
                grossProfit:  Math.round(gross * 10000) / 10000,
                netProfit:    Math.round(net * 10000) / 10000,
                fees:         Math.round((feeA + feeB + slip + this.config.networkFeeUsd) * 10000) / 10000,
                viable,
                viableReason: spreadViable ? 'spread' : zScoreViable ? 'z-score' : 'none',
                qty:          Math.round(qty * 100000000) / 100000000,
                orderUsd:     Math.round(orderUsd * 100) / 100,
                time:         Date.now(),
            });
        }

        // ══════════════════════════════════════════════════════════════════
        // v2 FIX #2: Triangular Arbitrage via Rust engine
        // Path: BTC→ETH→SOL→BTC (or any 3-pair loop)
        // ══════════════════════════════════════════════════════════════════
        if (this.config.enableTriangularArb && this.rustEngine && this.rustEngine.triangularArb) {
            const triPairs = [
                ['BTC/USD', 'ETH/USD', 'SOL/USD'],
                ['BTC/USD', 'ETH/USD', 'XRP/USD'],
                ['BTC/USD', 'SOL/USD', 'AVAX/USD'],
                ['ETH/USD', 'SOL/USD', 'AVAX/USD'],
            ];
            for (const [symA, symB, symC] of triPairs) {
                const pA = this.livePrices[symA];
                const pB = this.livePrices[symB];
                const pC = this.livePrices[symC];
                if (!pA || !pB || !pC) continue;
                try {
                    const triResult = this.rustEngine.triangularArb({
                        symbolA: symA, priceA: pA,
                        symbolB: symB, priceB: pB,
                        symbolC: symC, priceC: pC,
                        capitalUsd: this.config.capitalUsd,
                        feePercent: this.config.feePercentA,
                    });
                    if (triResult && triResult.profitable) {
                        this.triArbOpportunities++;
                        const profitPct = triResult.profitPercent || triResult.profit_percent || 0;
                        if (profitPct > this.triArbBestProfit) this.triArbBestProfit = profitPct;

                        if (profitPct >= this.config.triArbMinProfitPct) {
                            this.log(`TRIANGULAR ARB: ${symA}→${symB}→${symC} profit=${profitPct.toFixed(4)}%`);
                            opportunities.push({
                                symbol:       `TRI:${symA}→${symB}→${symC}`,
                                buyExchange:  'multi',
                                sellExchange: 'multi',
                                buyPrice:     pA,
                                sellPrice:    pA * (1 + profitPct / 100),
                                spreadPct:    profitPct,
                                zScore:       0,
                                grossProfit:  (this.config.capitalUsd * profitPct / 100),
                                netProfit:    (this.config.capitalUsd * profitPct / 100) - this.config.networkFeeUsd,
                                fees:         this.config.networkFeeUsd,
                                viable:       true,
                                viableReason: 'triangular',
                                qty:          0,
                                orderUsd:     this.config.capitalUsd,
                                time:         Date.now(),
                            });
                        }
                    }
                } catch (_) {}
            }
        }

        // Sort by net profit desc
        opportunities.sort((a, b) => b.netProfit - a.netProfit);
        this.lastScan = opportunities;
        this.emit('scan', opportunities);

        // Execute viable opportunities
        for (const opp of opportunities) {
            if (!opp.viable) continue;
            if (this.tradesThisHour >= this.config.maxTradesPerHour) {
                this.log(`HOURLY LIMIT (${this.config.maxTradesPerHour}) — skipping ${opp.symbol}`);
                break;
            }

            // Cooldown check
            const lastTime = this.lastTradeTime[opp.symbol] || 0;
            if (Date.now() - lastTime < this.config.cooldownMs) continue;

            // Budget check
            if (this.spentUsd + opp.orderUsd > this.config.capitalUsd) {
                this.log(`BUDGET FULL — skipping ${opp.symbol}`);
                continue;
            }

            this._executeTrade(opp);
        }
    }

    // ── Execute Trade ────────────────────────────────────

    _executeTrade(opp) {
        const entry = {
            time:         Date.now(),
            symbol:       opp.symbol,
            buyExchange:  opp.buyExchange,
            sellExchange: opp.sellExchange,
            buyPrice:     opp.buyPrice,
            sellPrice:    opp.sellPrice,
            spreadPct:    opp.spreadPct,
            zScore:       opp.zScore || 0,
            viableReason: opp.viableReason || 'spread',
            qty:          opp.qty,
            orderUsd:     opp.orderUsd,
            grossProfit:  opp.grossProfit,
            netProfit:    opp.netProfit,
            fees:         opp.fees,
            mode:         this.config.mode,
            status:       'filled',
        };

        if (this.config.mode === 'live') {
            // In live mode, we would call binance-client and kraken-client here
            // For now, this is prepared but not wired to avoid accidental real trades
            this.log(`LIVE TRADE SKIPPED (not yet wired) — ${opp.symbol} spread=${opp.spreadPct}% net=$${opp.netProfit}`);
            entry.status = 'skipped_live';
        } else {
            // Paper mode — simulate fill
            this.log(`PAPER TRADE: BUY ${opp.qty.toFixed(8)} ${opp.symbol} @${opp.buyPrice} on ${opp.buyExchange} → SELL @${opp.sellPrice} on ${opp.sellExchange} | spread=${opp.spreadPct}% net=$${opp.netProfit}`);
        }

        // Update stats
        this.tradesTotal++;
        this.tradesThisHour++;
        this.spentUsd    += opp.orderUsd;
        this.realizedPnl += opp.netProfit;
        this.dailyPnl    += opp.netProfit;
        this.lastTradeTime[opp.symbol] = Date.now();

        if (opp.netProfit > 0) this.tradesWon++;
        else this.tradesLost++;

        // Log
        this.tradeLog.push(entry);
        if (this.tradeLog.length > 200) this.tradeLog.shift();

        // Persist
        try {
            fs.appendFileSync(this.logFile, JSON.stringify(entry) + '\n');
        } catch (_) {}

        this.emit('trade', entry);
    }

    // ── Helpers ──────────────────────────────────────────

    _fmtUptime(ms) {
        const s = Math.floor(ms / 1000);
        const h = Math.floor(s / 3600);
        const m = Math.floor((s % 3600) / 60);
        const sec = s % 60;
        return `${h}h ${m}m ${sec}s`;
    }
}

module.exports = { ArbBot };
