#!/usr/bin/env ts-node
"use strict";
/**
 * QANTUM LIVE TRADER v2 — AUTO-CONVERT + TRADE
 * 1. Checks which pairs the API key can access
 * 2. Converts EUR → USDT if needed
 * 3. Trades with working pairs
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
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const https = __importStar(require("https"));
const crypto = __importStar(require("crypto"));
// ── Load .env ──
function loadEnv() {
    const envPath = path.resolve(__dirname, '.env');
    if (!fs.existsSync(envPath))
        return;
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#'))
            continue;
        const eq = trimmed.indexOf('=');
        if (eq < 0)
            continue;
        const key = trimmed.slice(0, eq).trim();
        const val = trimmed.slice(eq + 1).trim().replace(/#.*$/, '').trim();
        if (key && val && !process.env[key])
            process.env[key] = val;
    }
}
loadEnv();
const API_KEY = process.env.BINANCE_API_KEY ?? '';
const API_SECRET = process.env.BINANCE_API_SECRET ?? '';
const BASE = 'api.binance.com';
// ── HTTP helpers ──
function httpsReq(method, reqPath, body = '', headers = {}) {
    return new Promise((resolve, reject) => {
        const opts = {
            hostname: BASE, path: reqPath, method,
            headers: { 'X-MBX-APIKEY': API_KEY, ...headers },
            timeout: 8000,
        };
        if (body) {
            opts.headers['Content-Type'] = 'application/x-www-form-urlencoded';
            opts.headers['Content-Length'] = Buffer.byteLength(body);
        }
        const req = https.request(opts, res => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                }
                catch {
                    resolve({ raw: data });
                }
            });
        });
        req.on('error', reject);
        req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
        if (body)
            req.write(body);
        req.end();
    });
}
function sign(qs) {
    return crypto.createHmac('sha256', API_SECRET).update(qs).digest('hex');
}
function buildSigned(params) {
    const qs = Object.entries({ ...params, timestamp: Date.now(), recvWindow: 5000 })
        .map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&');
    return `${qs}&signature=${sign(qs)}`;
}
// ── Cognitive Stack ──
const AIIntegration_1 = require("./src/ai/AIIntegration");
// ═══════════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════════
function log(msg) {
    const ts = new Date().toISOString().slice(11, 19);
    console.log(`[${ts}] ${msg}`);
    try {
        fs.appendFileSync('./qantum-live-trades.log', `[${ts}] ${msg}\n`);
    }
    catch { }
}
async function main() {
    const hr = '='.repeat(70);
    console.log('');
    console.log(hr);
    console.log('  QANTUM LIVE TRADER v2');
    console.log('  Auto-Detect + Auto-Convert + Cognitive Trading');
    console.log(hr);
    console.log('');
    if (!API_KEY || !API_SECRET) {
        log('FATAL: No API keys.');
        process.exit(1);
    }
    log('API keys loaded. Mode: LIVE');
    // ═══ Step 1: Check account balance ═══
    log('');
    log('═══ STEP 1: CHECKING ACCOUNT ═══');
    const accQs = buildSigned({});
    const account = await httpsReq('GET', `/api/v3/account?${accQs}`);
    if (account.code) {
        log(`Binance error: ${account.code} — ${account.msg}`);
        process.exit(1);
    }
    const balances = {};
    for (const b of account.balances) {
        const free = parseFloat(b.free);
        const locked = parseFloat(b.locked);
        if (free > 0 || locked > 0) {
            balances[b.asset] = { free, locked };
            log(`  ${b.asset.padEnd(6)}: ${free.toFixed(8)} free | ${locked.toFixed(8)} locked`);
        }
    }
    const eurFree = balances['EUR']?.free || 0;
    const usdtFree = balances['USDT']?.free || 0;
    log('');
    log(`  EUR available:  €${eurFree.toFixed(2)}`);
    log(`  USDT available: $${usdtFree.toFixed(2)}`);
    // ═══ Step 2: Test which pairs work ═══
    log('');
    log('═══ STEP 2: TESTING API PAIR ACCESS ═══');
    const testPairs = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'BTCEUR', 'ETHEUR', 'EURUSDT'];
    const workingPairs = [];
    for (const sym of testPairs) {
        // Use Binance test order endpoint (doesn't place real orders)
        const testQs = buildSigned({ symbol: sym, side: 'BUY', type: 'MARKET', quoteOrderQty: '5' });
        const result = await httpsReq('POST', `/api/v3/order/test?${testQs}`, '');
        if (result.code) {
            log(`  ❌ ${sym}: blocked (${result.code}: ${result.msg})`);
        }
        else {
            log(`  ✅ ${sym}: ACCESSIBLE`);
            workingPairs.push(sym);
        }
    }
    log('');
    log(`  Working pairs: ${workingPairs.length > 0 ? workingPairs.join(', ') : 'NONE'}`);
    if (workingPairs.length === 0) {
        log('');
        log('════════════════════════════════════════════════════════');
        log('  ПРОБЛЕМ: API ключът ти блокира ВСИЧКИ trading pairs.');
        log('');
        log('  РЕШЕНИЕ (30 секунди в Binance ап):');
        log('  1. Отвори Binance app');
        log('  2. Отиди на Profile → API Management');
        log('  3. Натисни Edit на API ключа');
        log('  4. Под "Restrict access to trusted IPs only" виж');
        log('     "Enable Spot & Margin Trading" → нужно е ON');
        log('  5. Под "Restrict to specific symbols" → махни');
        log('     restriction-а или добави: BTCUSDT, ETHUSDT');
        log('  6. Save и пусни скрипта отново');
        log('════════════════════════════════════════════════════════');
        process.exit(1);
    }
    // ═══ Step 3: Auto-convert EUR → USDT if needed ═══
    let tradingQuote = 'USD';
    let tradingBalance = 0;
    let tradingSymbols = [];
    const hasUsdtPairs = workingPairs.some(p => p.endsWith('USDT'));
    const hasEurPairs = workingPairs.some(p => p.endsWith('EUR'));
    const canConvert = workingPairs.includes('EURUSDT');
    if (hasUsdtPairs && usdtFree >= 5) {
        // Already have USDT, use USDT pairs
        tradingQuote = 'USDT';
        tradingBalance = usdtFree;
        tradingSymbols = workingPairs.filter(p => p.endsWith('USDT') && p !== 'EURUSDT');
        log('  Strategy: Trade with existing USDT');
    }
    else if (hasUsdtPairs && canConvert && eurFree >= 5) {
        // Convert EUR → USDT first
        log('');
        log('═══ STEP 3: CONVERTING EUR → USDT ═══');
        // Get EUR/USDT price
        const priceData = await httpsReq('GET', '/api/v3/ticker/price?symbol=EURUSDT');
        const eurUsdtPrice = parseFloat(priceData.price);
        log(`  EUR/USDT price: ${eurUsdtPrice}`);
        // Sell EUR for USDT (SELL EURUSDT = sell EUR, receive USDT)
        const sellQty = (eurFree * 0.99).toFixed(2); // 99% to account for rounding
        log(`  Selling €${sellQty} EUR for USDT...`);
        const convertQs = buildSigned({
            symbol: 'EURUSDT',
            side: 'SELL',
            type: 'MARKET',
            quantity: sellQty,
        });
        const convertResult = await httpsReq('POST', `/api/v3/order`, convertQs, {});
        if (convertResult.code) {
            log(`  ❌ Convert failed: ${convertResult.code}: ${convertResult.msg}`);
            if (hasEurPairs) {
                tradingQuote = 'EUR';
                tradingBalance = eurFree;
                tradingSymbols = workingPairs.filter(p => p.endsWith('EUR'));
                log(`  Falling back to EUR pairs`);
            }
            else {
                log('  Cannot convert and no EUR pairs available.');
                process.exit(1);
            }
        }
        else {
            const gotUsdt = parseFloat(convertResult.cummulativeQuoteQty || '0');
            log(`  ✅ Converted! Got $${gotUsdt.toFixed(2)} USDT`);
            tradingQuote = 'USDT';
            tradingBalance = gotUsdt;
            tradingSymbols = workingPairs.filter(p => p.endsWith('USDT') && p !== 'EURUSDT');
        }
    }
    else if (hasEurPairs && eurFree >= 5) {
        tradingQuote = 'EUR';
        tradingBalance = eurFree;
        tradingSymbols = workingPairs.filter(p => p.endsWith('EUR'));
        log('  Strategy: Trade with EUR pairs');
    }
    else {
        log('  No viable trading strategy found. Need at least €5 or $5.');
        process.exit(1);
    }
    log('');
    log(`  Quote: ${tradingQuote} | Balance: ${tradingBalance.toFixed(2)} | Pairs: ${tradingSymbols.join(', ')}`);
    // ═══ Step 4: COGNITIVE LIVE TRADING ═══
    log('');
    log('═══ STEP 4: COGNITIVE LIVE TRADING ═══');
    log('  Initializing QAntum Orchestrator...');
    const brain = (0, AIIntegration_1.createQAntumOrchestrator)();
    log('  Brain online. Starting live cycles...');
    log('  Press Ctrl+C to stop.');
    log('');
    const MAX_TRADE = 5; // max per trade in quote currency
    const startingBalance = tradingBalance;
    let cycles = 0;
    let totalTrades = 0;
    let isRunning = true;
    const positions = new Map();
    const priceHistory = new Map();
    // Kill switch
    process.on('SIGINT', async () => {
        log('\n  CTRL+C — Shutting down...');
        isRunning = false;
        // Close positions
        for (const [sym, pos] of positions) {
            log(`  Closing ${sym}...`);
            const sellQs = buildSigned({ symbol: sym, side: 'SELL', type: 'MARKET', quantity: pos.qty.toFixed(6) });
            const r = await httpsReq('POST', '/api/v3/order', sellQs, {});
            if (r.code)
                log(`  ❌ Close ${sym}: ${r.msg}`);
            else
                log(`  ✅ Closed ${sym}`);
        }
        console.log('');
        console.log(hr);
        console.log(`  SESSION: ${cycles} cycles | ${totalTrades} trades | Start: ${tradingQuote} ${startingBalance.toFixed(2)}`);
        console.log(hr);
        process.exit(0);
    });
    // Main loop
    while (isRunning) {
        cycles++;
        // Refresh balance
        const bQs = buildSigned({});
        const bAcc = await httpsReq('GET', `/api/v3/account?${bQs}`);
        let currentBalance = 0;
        if (!bAcc.code) {
            for (const b of bAcc.balances) {
                if (b.asset === tradingQuote)
                    currentBalance = parseFloat(b.free);
            }
        }
        log(`\n═══ CYCLE #${cycles} | ${tradingQuote}: ${currentBalance.toFixed(2)} | Positions: ${positions.size} ═══`);
        // Fetch prices for trading symbols
        const allPrices = await httpsReq('GET', '/api/v3/ticker/price');
        if (!Array.isArray(allPrices)) {
            log('  Price fetch failed, skipping cycle');
            await sleep(30000);
            continue;
        }
        const priceMap = new Map();
        for (const p of allPrices) {
            priceMap.set(p.symbol, parseFloat(p.price));
        }
        for (const sym of tradingSymbols) {
            const price = priceMap.get(sym);
            if (!price)
                continue;
            // Update history
            const hist = priceHistory.get(sym) || [];
            hist.push(price);
            if (hist.length > 16)
                hist.shift();
            priceHistory.set(sym, hist);
            if (hist.length < 3)
                continue; // Need minimum data
            // Feed to brain
            const decision = brain.process('MARKET', sym, hist);
            const action = decision.finalAction;
            const state = decision.catuskoti.state;
            const conf = decision.finalConfidence;
            // Determine side
            let side = null;
            if (['EXECUTE', 'MAXIMIZE', 'AGGRESSIVE_ENTRY'].includes(action))
                side = 'BUY';
            if (['EVACUATE', 'FULL_DEFENSE', 'DEFENSIVE_POSITION', 'EXPLOIT_PARADOX'].includes(action))
                side = 'SELL';
            const sideStr = side || 'HOLD';
            log(`  ${sym.padEnd(10)} ${tradingQuote === 'EUR' ? '€' : '$'}${price.toFixed(2).padStart(10)} | ${state.padEnd(14)} | ${action.padEnd(22)} | ${sideStr.padEnd(4)} | ${(conf * 100).toFixed(0)}%`);
            // Check existing position
            const pos = positions.get(sym);
            if (pos) {
                const pnlPct = ((price / pos.entryPrice) - 1) * 100;
                // Stop loss -3%
                if (pnlPct < -3) {
                    log(`  !! STOP LOSS ${sym} (${pnlPct.toFixed(1)}%)`);
                    const sellQs = buildSigned({ symbol: sym, side: 'SELL', type: 'MARKET', quantity: pos.qty.toFixed(6) });
                    const r = await httpsReq('POST', '/api/v3/order', sellQs, {});
                    if (!r.code) {
                        const got = parseFloat(r.cummulativeQuoteQty || '0');
                        log(`  << SOLD ${sym} | Got ${tradingQuote} ${got.toFixed(2)} | P&L: ${pnlPct.toFixed(2)}%`);
                        positions.delete(sym);
                        totalTrades++;
                    }
                    else {
                        log(`  !! Sell failed: ${r.msg}`);
                    }
                    continue;
                }
                // Take profit +2%
                if (pnlPct > 2) {
                    log(`  ++ TAKE PROFIT ${sym} (${pnlPct.toFixed(1)}%)`);
                    const sellQs = buildSigned({ symbol: sym, side: 'SELL', type: 'MARKET', quantity: pos.qty.toFixed(6) });
                    const r = await httpsReq('POST', '/api/v3/order', sellQs, {});
                    if (!r.code) {
                        const got = parseFloat(r.cummulativeQuoteQty || '0');
                        log(`  << SOLD ${sym} | Got ${tradingQuote} ${got.toFixed(2)} | P&L: +${pnlPct.toFixed(2)}%`);
                        positions.delete(sym);
                        totalTrades++;
                    }
                    else {
                        log(`  !! Sell failed: ${r.msg}`);
                    }
                    continue;
                }
                // Brain says sell
                if (side === 'SELL') {
                    const sellQs = buildSigned({ symbol: sym, side: 'SELL', type: 'MARKET', quantity: pos.qty.toFixed(6) });
                    const r = await httpsReq('POST', '/api/v3/order', sellQs, {});
                    if (!r.code) {
                        const got = parseFloat(r.cummulativeQuoteQty || '0');
                        log(`  << BRAIN SELL ${sym} | Got ${tradingQuote} ${got.toFixed(2)} | P&L: ${pnlPct.toFixed(2)}%`);
                        positions.delete(sym);
                        totalTrades++;
                    }
                }
            }
            // New buy
            if (side === 'BUY' && !positions.has(sym) && conf > 0.5 && currentBalance >= 5) {
                const tradeAmt = Math.min(currentBalance * 0.25, MAX_TRADE);
                const qty = parseFloat((tradeAmt / price).toFixed(6));
                if (qty <= 0)
                    continue;
                log(`  >> BUY ${sym}: ${tradingQuote} ${tradeAmt.toFixed(2)} (qty: ${qty})`);
                const buyQs = buildSigned({ symbol: sym, side: 'BUY', type: 'MARKET', quantity: qty.toFixed(6) });
                const r = await httpsReq('POST', '/api/v3/order', buyQs, {});
                if (!r.code && r.status === 'FILLED') {
                    const fillPrice = parseFloat(r.cummulativeQuoteQty) / parseFloat(r.executedQty);
                    positions.set(sym, {
                        symbol: sym,
                        qty: parseFloat(r.executedQty),
                        entryPrice: fillPrice,
                        entryTime: Date.now(),
                    });
                    totalTrades++;
                    log(`  << FILLED ${sym} @ ${fillPrice.toFixed(4)} | orderId: ${r.orderId}`);
                }
                else if (r.code) {
                    log(`  !! BUY rejected: ${r.code}: ${r.msg}`);
                }
            }
        }
        // Safety: drawdown check
        if (currentBalance < startingBalance * 0.95 && positions.size === 0) {
            log(`\n  !! SAFETY: Balance dropped below 5% threshold. Pausing 60s...`);
            await sleep(60000);
        }
        await sleep(30000);
    }
}
function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}
main().catch(err => {
    console.error('FATAL:', err);
    process.exit(1);
});
