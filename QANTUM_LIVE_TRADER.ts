#!/usr/bin/env ts-node
// ═══════════════════════════════════════════════════════════════════════════════
// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║                                                                         ║
// ║   Q A N T U M   L I V E   T R A D E R                                 ║
// ║   Cognitive Stack × Binance LIVE                                       ║
// ║   "The Brain trades real money."  (EUR pairs)                          ║
// ║                                                                         ║
// ║   CAPITAL LIMIT: €21 MAX                                               ║
// ║   PER-TRADE:     €5 MAX                                                ║
// ║   STOP-LOSS:     5% portfolio                                          ║
// ║   KILL SWITCH:   Press Ctrl+C anytime                                  ║
// ║                                                                         ║
// ║   © 2025-2026 QAntum | Dimitar Prodromov                                ║
// ║                                                                         ║
// ╚═══════════════════════════════════════════════════════════════════════════╝
// ═══════════════════════════════════════════════════════════════════════════════

import * as path from 'path';
import * as fs from 'fs';

// ── Load .env ──
function loadEnv(): void {
    const envPath = path.resolve(__dirname, '.env');
    if (!fs.existsSync(envPath)) return;
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eq = trimmed.indexOf('=');
        if (eq < 0) continue;
        const key = trimmed.slice(0, eq).trim();
        const val = trimmed.slice(eq + 1).trim().replace(/#.*$/, '').trim();
        if (key && val && !process.env[key]) process.env[key] = val;
    }
}
loadEnv();

// ── Imports ──
import { createQAntumOrchestrator, QAntumOrchestrator } from './src/ai/AIIntegration';
import {
    fetchAllBinancePrices,
    getPrice,
    getAccountBalances,
    placeMarketOrder,
    validateKeys,
    BinanceOrderResult,
} from './system/live-connector';

// ═══════════════════════════════════════════════════════════════════════════════
// SAFETY CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

const MAX_CAPITAL_EUR = 21;     // Hard cap — never use more than €21
const MAX_TRADE_EUR = 5;      // Per-trade max
const STOP_LOSS_PCT = 5;      // Kill all if portfolio drops 5%
const CYCLE_INTERVAL_MS = 30000;  // Decision cycle every 30 seconds
const PRICE_WINDOW = 16;     // Number of price points for Catuskoti
const TRADE_SYMBOLS = ['BTCEUR', 'ETHEUR', 'BNBEUR', 'SOLEUR'];
const QUOTE_ASSET = 'EUR';
const LOG_FILE = './qantum-live-trades.log';

// ═══════════════════════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════════════════════

interface Position {
    symbol: string;
    asset: string;
    qty: number;
    entryPrice: number;
    entryTime: number;
    orderId: number;
}

interface TradeLog {
    time: string;
    symbol: string;
    side: 'BUY' | 'SELL';
    qty: number;
    price: number;
    usdValue: number;
    action: string;
    catuskotiState: string;
    confidence: number;
    orderId: number;
}

const priceHistory: Map<string, number[]> = new Map();
const openPositions: Map<string, Position> = new Map();
const tradeLog: TradeLog[] = [];
let startingEurBalance = 0;
let totalCycles = 0;
let isRunning = true;

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

// Complexity: O(1)
function log(msg: string): void {
    const ts = new Date().toISOString().slice(11, 19);
    const line = `[${ts}] ${msg}`;
    console.log(line);
    try { fs.appendFileSync(LOG_FILE, line + '\n'); } catch { }
}

// Complexity: O(1)
function actionToSide(action: string): 'BUY' | 'SELL' | null {
    switch (action) {
        case 'EXECUTE':
        case 'MAXIMIZE':
        case 'AGGRESSIVE_ENTRY':
            return 'BUY';
        case 'EVACUATE':
        case 'FULL_DEFENSE':
        case 'DEFENSIVE_POSITION':
        case 'EXPLOIT_PARADOX':
            return 'SELL';
        default:
            return null;
    }
}

// Complexity: O(n)
function getSymbolAsset(symbol: string): string {
    return symbol.replace('EUR', '');
}

// ═══════════════════════════════════════════════════════════════════════════════
// PRICE FEED
// ═══════════════════════════════════════════════════════════════════════════════

// Complexity: O(k) — k = number of tracked symbols
async function updatePrices(): Promise<Map<string, number>> {
    const allPrices = await fetchAllBinancePrices();
    const tracked: Map<string, number> = new Map();

    for (const sym of TRADE_SYMBOLS) {
        const price = allPrices.get(sym);
        if (!price) continue;

        tracked.set(sym, price);

        // Maintain rolling window
        const history = priceHistory.get(sym) || [];
        history.push(price);
        if (history.length > PRICE_WINDOW) history.shift();
        priceHistory.set(sym, history);
    }

    return tracked;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TRADE EXECUTION
// ═══════════════════════════════════════════════════════════════════════════════

// Complexity: O(1)
async function executeBuy(
    symbol: string,
    eurAmount: number,
    price: number,
    action: string,
    catuskotiState: string,
    confidence: number,
): Promise<void> {
    const asset = getSymbolAsset(symbol);

    // Skip if already holding
    if (openPositions.has(symbol)) {
        log(`  SKIP ${symbol} — already holding position`);
        return;
    }

    // Enforce per-trade limit
    const tradeEur = Math.min(eurAmount, MAX_TRADE_EUR);

    // Calculate quantity
    const qty = parseFloat((tradeEur / price).toFixed(6));
    if (qty <= 0) return;

    log(`  >> BUY ${symbol}: €${tradeEur.toFixed(2)} @ ${price.toFixed(2)} (qty: ${qty})`);

    const result = await placeMarketOrder(symbol, 'BUY', qty);

    if (result.status === 'FILLED') {
        const fillPrice = result.cummulativeQuoteQty / result.executedQty;

        openPositions.set(symbol, {
            symbol,
            asset,
            qty: result.executedQty,
            entryPrice: fillPrice,
            entryTime: Date.now(),
            orderId: result.orderId,
        });

        tradeLog.push({
            time: new Date().toISOString(),
            symbol,
            side: 'BUY',
            qty: result.executedQty,
            price: fillPrice,
            usdValue: result.cummulativeQuoteQty,
            action,
            catuskotiState,
            confidence,
            orderId: result.orderId,
        });

        log(`  << FILLED BUY ${symbol} @ €${fillPrice.toFixed(4)} | orderId: ${result.orderId}`);
    } else {
        log(`  !! BUY ${symbol} REJECTED: ${result.error || result.status}`);
    }
}

// Complexity: O(1)
async function executeSell(
    symbol: string,
    position: Position,
    price: number,
    reason: string,
    catuskotiState: string,
    confidence: number,
): Promise<void> {
    log(`  >> SELL ${symbol}: qty=${position.qty} @ ${price.toFixed(2)} (${reason})`);

    const result = await placeMarketOrder(symbol, 'SELL', position.qty);

    if (result.status === 'FILLED') {
        const fillPrice = result.cummulativeQuoteQty / result.executedQty;
        const pnl = (fillPrice - position.entryPrice) * result.executedQty;
        const pnlPct = ((fillPrice / position.entryPrice) - 1) * 100;

        openPositions.delete(symbol);

        tradeLog.push({
            time: new Date().toISOString(),
            symbol,
            side: 'SELL',
            qty: result.executedQty,
            price: fillPrice,
            usdValue: result.cummulativeQuoteQty,
            action: reason,
            catuskotiState,
            confidence,
            orderId: result.orderId,
        });

        log(`  << FILLED SELL ${symbol} @ €${fillPrice.toFixed(4)} | P&L: ${pnl > 0 ? '+' : ''}€${pnl.toFixed(4)} (${pnlPct > 0 ? '+' : ''}${pnlPct.toFixed(2)}%) | orderId: ${result.orderId}`);
    } else {
        log(`  !! SELL ${symbol} REJECTED: ${result.error || result.status}`);
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// DECISION CYCLE
// ═══════════════════════════════════════════════════════════════════════════════

// Complexity: O(k * n) — k symbols, n observations per symbol
async function runDecisionCycle(brain: QAntumOrchestrator, currentEurBalance: number): Promise<void> {
    totalCycles++;
    log(`\n=== CYCLE #${totalCycles} | EUR: €${currentEurBalance.toFixed(2)} | Positions: ${openPositions.size} ===`);

    const prices = await updatePrices();

    for (const symbol of TRADE_SYMBOLS) {
        const price = prices.get(symbol);
        const history = priceHistory.get(symbol);
        if (!price || !history || history.length < 4) continue;

        // Feed to Cognitive Stack
        const decision = brain.process('MARKET', symbol, history);
        const side = actionToSide(decision.finalAction);
        const state = decision.catuskoti.state;
        const conf = decision.finalConfidence;

        // Log the decision
        const sideStr = side ? side.padEnd(4) : 'HOLD';
        log(`  ${symbol.padEnd(10)} $${price.toFixed(2).padStart(10)} | ${state.padEnd(14)} | ${decision.finalAction.padEnd(22)} | ${sideStr} | conf: ${(conf * 100).toFixed(0)}%`);

        // ── Check open position for exit ──
        const position = openPositions.get(symbol);
        if (position) {
            const unrealized = ((price / position.entryPrice) - 1) * 100;

            // Stop-loss exit
            if (unrealized < -3) {
                await executeSell(symbol, position, price, 'STOP_LOSS', state, conf);
                continue;
            }

            // Take profit
            if (unrealized > 2) {
                await executeSell(symbol, position, price, 'TAKE_PROFIT', state, conf);
                continue;
            }

            // Brain says SELL
            if (side === 'SELL') {
                await executeSell(symbol, position, price, decision.finalAction, state, conf);
                continue;
            }
        }

        // ── Check for new buy ──
        if (side === 'BUY' && !openPositions.has(symbol) && conf > 0.5) {
            // Capital check
            const availableEur = Math.min(currentEurBalance * 0.25, MAX_TRADE_EUR);
            if (availableEur >= 5 && currentEurBalance >= 5) {
                await executeBuy(symbol, availableEur, price, decision.finalAction, state, conf);
            }
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// PORTFOLIO SAFETY CHECK
// ═══════════════════════════════════════════════════════════════════════════════

// Complexity: O(p) — p = number of open positions
async function checkPortfolioSafety(): Promise<boolean> {
    const balances = await getAccountBalances();
    const eur = balances['EUR'] || 0;

    let totalPortfolioEur = eur;

    for (const [symbol, position] of openPositions) {
        const price = await getPrice(symbol);
        if (price) {
            totalPortfolioEur += position.qty * price;
        }
    }

    const drawdown = ((startingEurBalance - totalPortfolioEur) / startingEurBalance) * 100;

    if (drawdown > STOP_LOSS_PCT) {
        log(`\n  !! KILL SWITCH: Portfolio drawdown ${drawdown.toFixed(1)}% exceeds ${STOP_LOSS_PCT}% limit!!`);
        log(`  !! Closing all positions...`);

        // Emergency close all
        for (const [symbol, position] of openPositions) {
            const price = await getPrice(symbol);
            await executeSell(symbol, position, price || position.entryPrice, 'EMERGENCY_EXIT', 'KILL_SWITCH', 0);
        }

        return false; // Stop trading
    }

    return true;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════════

async function main(): Promise<void> {
    const hr = '='.repeat(70);

    console.log('');
    console.log(hr);
    console.log('  QANTUM LIVE TRADER');
    console.log('  Cognitive Stack x Binance LIVE');
    console.log('  Capital: €21 | Per-trade: €5 | Stop-loss: 5%');
    console.log(hr);
    console.log('');

    // Validate API keys
    const keyStatus = validateKeys();
    log(`  API Status: ${keyStatus.message}`);

    if (!keyStatus.ok) {
        log('  FATAL: Binance API keys not configured. Cannot trade.');
        process.exit(1);
    }

    log(`  Mode: ${keyStatus.mode.toUpperCase()}`);

    // Check initial balance
    log('  Checking Binance account balance...');
    const balances = await getAccountBalances();
    const eur = balances['EUR'] || 0;

    log('');
    log('  --- ACCOUNT BALANCES ---');
    for (const [asset, amount] of Object.entries(balances)) {
        log(`    ${asset.padEnd(6)}: ${amount}`);
    }
    log('');

    if (eur < 5) {
        log(`  WARNING: EUR balance is €${eur.toFixed(2)} — minimum €5 needed to trade.`);
        if (eur <= 0) {
            log('  FATAL: No EUR balance. Cannot trade.');
            process.exit(1);
        }
    }

    startingEurBalance = Math.min(eur, MAX_CAPITAL_EUR);
    log(`  Working capital: €${startingEurBalance.toFixed(2)} (capped at €${MAX_CAPITAL_EUR})`);

    // Initialize brain
    log('  Initializing QAntum Cognitive Orchestrator...');
    const brain = createQAntumOrchestrator();
    log('  Orchestrator online.');

    // Pre-load price history (3 quick fetches with 2s spacing)
    log('  Loading initial price data...');
    for (let i = 0; i < 3; i++) {
        await updatePrices();
        if (i < 2) await new Promise(r => setTimeout(r, 2500));
    }
    log(`  Price history loaded: ${Array.from(priceHistory.entries()).map(([k, v]) => `${k}(${v.length})`).join(', ')}`);

    // Kill switch
    process.on('SIGINT', async () => {
        log('\n  CTRL+C detected — shutting down gracefully...');
        isRunning = false;

        // Close all positions
        for (const [symbol, position] of openPositions) {
            const price = await getPrice(symbol);
            await executeSell(symbol, position, price || position.entryPrice, 'MANUAL_SHUTDOWN', 'USER_EXIT', 0);
        }

        // Print summary
        printSummary();
        process.exit(0);
    });

    log('');
    log(hr);
    log('  LIVE TRADING STARTED — Press Ctrl+C to stop');
    log(hr);
    log('');

    // Main loop
    while (isRunning) {
        try {
            // Safety check
            const safe = await checkPortfolioSafety();
            if (!safe) {
                log('  KILL SWITCH activated. Trading stopped.');
                break;
            }

            // Get latest balance
            const freshBalances = await getAccountBalances();
            const currentEur = freshBalances['EUR'] || 0;

            // Decision cycle
            await runDecisionCycle(brain, currentEur);

        } catch (err: any) {
            log(`  ERROR in cycle: ${err.message}`);
        }

        // Wait for next cycle
        await new Promise(r => setTimeout(r, CYCLE_INTERVAL_MS));
    }

    printSummary();
}

function printSummary(): void {
    const hr = '='.repeat(70);
    console.log('');
    console.log(hr);
    console.log('  QANTUM LIVE TRADER — SESSION SUMMARY');
    console.log(hr);
    console.log(`  Total Cycles:     ${totalCycles}`);
    console.log(`  Total Trades:     ${tradeLog.length}`);
    console.log(`  Starting EUR:     €${startingEurBalance.toFixed(2)}`);
    console.log('');

    if (tradeLog.length > 0) {
        console.log('  --- TRADE LOG ---');
        for (const t of tradeLog) {
            const ts = t.time.slice(11, 19);
            console.log(`  [${ts}] ${t.side.padEnd(4)} ${t.symbol.padEnd(10)} qty=${t.qty.toFixed(6)} @ $${t.price.toFixed(4)} ($${t.usdValue.toFixed(2)}) | ${t.action} | ${t.catuskotiState}`);
        }
    }

    console.log('');
    console.log(`  Log saved to: ${LOG_FILE}`);
    console.log(hr);
}

// Run
main().catch(err => {
    console.error('FATAL:', err);
    process.exit(1);
});
