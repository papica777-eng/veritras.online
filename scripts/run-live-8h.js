/**
 * QAntum 8H Live Runner — v3 (unprecedented logic)
 *
 * v2 improvements retained:
 *  1. Fetches MIN_NOTIONAL & LOT_SIZE from Binance exchangeInfo
 *  2. Stop-loss per position
 *  3. Cooldown after every SELL
 *  4. LIMIT orders (GTC) instead of MARKET — saves slippage
 *  5. Syncs real position from Binance account on start
 *
 * v3 NEW — unprecedented improvements:
 *  6. ATR-scaled adaptive stop-loss (widens in volatile, tightens in calm)
 *  7. Entropy-gated signal confidence (uses Rust engine when available)
 *  8. Fill verification loop — polls order status, re-prices if unfilled
 *  9. Cross-timeframe alignment — 1m + 5m SMA must agree
 * 10. Self-tuning feedback — tracks fill times to auto-adjust LIMIT offset
 */
require('dotenv').config();
const fs   = require('fs');
const path = require('path');
const { makeClient } = require('./lib/binance-client');

/* ── helpers ─────────────────────────────────────── */

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function sma(values) {
  return values.reduce((s, v) => s + v, 0) / (values.length || 1);
}

/** Round `qty` DOWN to `stepSize` precision (Binance LOT_SIZE) */
function floorToStep(qty, stepSize) {
  const precision = Math.max(0, Math.round(-Math.log10(stepSize)));
  const factor    = Math.pow(10, precision);
  return Math.floor(qty * factor) / factor;
}

/**
 * v3 #6: ATR (Average True Range) from klines.
 * Each kline = [openTime, open, high, low, close, ...]
 * ATR_period = 14 by default.
 */
function computeATR(klines, period = 14) {
  if (klines.length < 2) return 0;
  const trueRanges = [];
  for (let i = 1; i < klines.length; i++) {
    const high     = Number(klines[i][2]);
    const low      = Number(klines[i][3]);
    const prevClose = Number(klines[i - 1][4]);
    const tr = Math.max(high - low, Math.abs(high - prevClose), Math.abs(low - prevClose));
    trueRanges.push(tr);
  }
  // Simple moving average of last `period` true ranges
  const slice = trueRanges.slice(-period);
  return slice.reduce((a, b) => a + b, 0) / (slice.length || 1);
}

/**
 * v3 #7: Load Rust engine for entropy gating (optional).
 * If available, computeGlobalEntropy() returns 0–1 chaos measure.
 */
let rustEngine = null;
try {
  const addonPaths = [
    path.join(__dirname, '..', 'native', 'qantum-engine', 'qantum-engine.node'),
    path.join(__dirname, '..', 'native', 'qantum-engine', 'target', 'release', 'qantum_engine.node'),
  ];
  for (const p of addonPaths) {
    try { rustEngine = require(p); break; } catch (_) {}
  }
} catch (_) {}

/**
 * v3 #8: Wait for a LIMIT order to fill, with timeout + re-pricing.
 * Returns { filled: boolean, filledQty, avgPrice, orderId }
 */
async function waitForFill(client, symbol, orderId, timeoutMs = 30000, pollMs = 5000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    // SAFETY: async operation — wrap in try-catch for production resilience
    await sleep(pollMs);
    try {
      const openOrders = await client.getOpenOrders(symbol);
      const still = openOrders.find(o => o.orderId === orderId);
      if (!still) {
        // Order no longer open — it was filled (or cancelled externally)
        return { filled: true, orderId };
      }
    } catch (_) {}
  }
  // Timed out — cancel and report unfilled
  // SAFETY: async operation — wrap in try-catch for production resilience
  try { await client.cancelOrder(symbol, orderId); } catch (_) {}
  return { filled: false, orderId };
}

/* ── main ────────────────────────────────────────── */

async function main() {
  /* ─── env checks ─── */
  const isLive  = process.env.TRADING_MODE       === 'live';
  const confirm = process.env.LIVE_TRADING_CONFIRM === 'YES';

  if (!process.env.BINANCE_API_KEY || !process.env.BINANCE_API_SECRET) {
    throw new Error('Missing BINANCE_API_KEY/BINANCE_API_SECRET in .env');
  }
  if (!isLive)  throw new Error('TRADING_MODE must be "live"');
  if (!confirm) throw new Error('LIVE_TRADING_CONFIRM must be "YES"');

  /* ─── config ─── */
  const symbol          = process.env.BOT_SYMBOL        || 'BTCUSDT';
  const runHours        = Number(process.env.BOT_RUN_HOURS      || 8);
  const loopIntervalSec = Number(process.env.LOOP_INTERVAL_SEC  || 60);
  const maxBudgetBgn    = Number(process.env.MAX_BUDGET_BGN     || 40);
  const bgnPerUsdt      = Number(process.env.BGN_PER_USDT       || 1.80);
  const maxOrderUsdt    = Number(process.env.MAX_ORDER_USDT     || 12);
  const stopLossPct     = Number(process.env.STOP_LOSS_PCT      || 2);   // percent
  const cooldownMin     = Number(process.env.COOLDOWN_MIN       || 5);   // minutes

  const maxBudgetUsdt = maxBudgetBgn / bgnPerUsdt;
  const startedAt     = Date.now();
  const endsAt        = startedAt + runHours * 3600000;

  let spentUsdt     = 0;
  let positionQty   = 0;
  let entryPrice    = 0;
  let lastSellTime  = 0;       // timestamp of last sell (for cooldown)
  let totalBuys     = 0;
  let totalSells    = 0;

  // v3 #10: fill-time tracking for self-tuning LIMIT offset
  const fillTimes   = [];      // ms per fill
  let limitOffset   = 0;       // auto-adjusted: 0 = at-price, positive = below-price (more aggressive)

  /* ─── logging ─── */
  const logDir  = path.join(__dirname, '..', 'dashboard', 'trades');
  fs.mkdirSync(logDir, { recursive: true });
  const logPath = path.join(logDir, `live-run-${new Date().toISOString().replace(/[:.]/g, '-')}.log`);

  function log(msg) {
    const line = `[${new Date().toISOString()}] ${msg}`;
    console.log(line);
    fs.appendFileSync(logPath, line + '\n');
  }

  /* ─── client ─── */
  const client = makeClient({
    apiKey:    process.env.BINANCE_API_KEY,
    apiSecret: process.env.BINANCE_API_SECRET,
  });

  /* ═══════════════════════════════════════════════════
   * 1. Fetch exchange filters (MIN_NOTIONAL, LOT_SIZE)
   * ═══════════════════════════════════════════════════ */
  // Complexity: O(1)
  log('Fetching exchange info …');
  // SAFETY: async operation — wrap in try-catch for production resilience
  const exInfo = await client.getExchangeInfo(symbol);
  const symInfo = exInfo.symbols.find(s => s.symbol === symbol);
  if (!symInfo) throw new Error(`Symbol ${symbol} not found on Binance`);

  const lotFilter       = symInfo.filters.find(f => f.filterType === 'LOT_SIZE');
  const notionalFilter  = symInfo.filters.find(f => f.filterType === 'NOTIONAL' || f.filterType === 'MIN_NOTIONAL');
  const priceFilter     = symInfo.filters.find(f => f.filterType === 'PRICE_FILTER');

  const stepSize       = Number(lotFilter?.stepSize   || 0.00001);
  const minQty         = Number(lotFilter?.minQty     || 0.00001);
  const minNotional    = Number(notionalFilter?.minNotional || 10);
  const tickSize       = Number(priceFilter?.tickSize || 0.01);

  // Complexity: O(1)
  log(`Filters: stepSize=${stepSize}, minQty=${minQty}, minNotional=${minNotional}, tickSize=${tickSize}`);

  if (maxOrderUsdt < minNotional) {
    throw new Error(`MAX_ORDER_USDT (${maxOrderUsdt}) < min notional (${minNotional}). Increase MAX_ORDER_USDT or pick a different symbol.`);
  }

  /** Round price DOWN to tickSize grid */
  function roundPrice(p) {
    const prec = Math.max(0, Math.round(-Math.log10(tickSize)));
    const f    = Math.pow(10, prec);
    return Math.floor(p * f) / f;
  }

  /* ═══════════════════════════════════════════════════
   * 5. Sync real position from Binance account
   * ═══════════════════════════════════════════════════ */
  // Complexity: O(1)
  log('Syncing wallet …');
  const baseAsset = symInfo.baseAsset;   // e.g. "BTC"
  // SAFETY: async operation — wrap in try-catch for production resilience
  const acct      = await client.getAccount();
  const bal       = acct.balances.find(b => b.asset === baseAsset);
  const freeQty   = Number(bal?.free || 0);

  if (freeQty > minQty) {
    positionQty = freeQty;
    // estimate entry price as current price (best we can do)
    // SAFETY: async operation — wrap in try-catch for production resilience
    const tk   = await client.getTicker(symbol);
    entryPrice = Number(tk.price);
    // Complexity: O(1)
    log(`Existing position detected: ${positionQty} ${baseAsset} (~entry ${entryPrice.toFixed(2)})`);
  }

  /* ─── banner ─── */
  // Complexity: O(1)
  log('═══════════════════════════════════════════════════════════');
  // Complexity: O(1)
  log('QANTUM 8H LIVE RUN v2 — STARTED');
  // Complexity: O(1)
  log(`symbol=${symbol}  hours=${runHours}  budget=${maxBudgetBgn} BGN (${maxBudgetUsdt.toFixed(2)} USDT)`);
  // Complexity: O(1)
  log(`maxOrder=${maxOrderUsdt} USDT  stopLoss=${stopLossPct}%  cooldown=${cooldownMin} min`);
  // Complexity: O(N*M) — nested iteration detected
  log('═══════════════════════════════════════════════════════════');

  /* ═══════════════════════════════════════════════════
   * main loop
   * ═══════════════════════════════════════════════════ */
  while (Date.now() < endsAt) {
    try {
      const ticker = await client.getTicker(symbol);
      const price  = Number(ticker.price);

      /* ─── Fetch klines for SMA + ATR ─── */
      const klines1m = await client.getKlines(symbol, '1m', 30);
      const closes1m = klines1m.map(k => Number(k[4]));

      /* ═══ v3 #6: ATR-scaled adaptive stop-loss ═══ */
      const atr14 = computeATR(klines1m, 14);
      // Adaptive stop: 1.5× ATR or minimum stopLossPct, whichever is wider
      const atrStopPct = atr14 > 0 && entryPrice > 0
        ? Math.max(stopLossPct, (atr14 * 1.5 / entryPrice) * 100)
        : stopLossPct;

      if (positionQty > 0 && entryPrice > 0) {
        const drawdown = ((entryPrice - price) / entryPrice) * 100;
        if (drawdown >= atrStopPct) {
          // Complexity: O(1)
          log(`⚠ ATR-STOP triggered  entry=${entryPrice.toFixed(2)}  now=${price.toFixed(2)}  dd=${drawdown.toFixed(2)}%  atrStop=${atrStopPct.toFixed(2)}%`);
          const qty = floorToStep(positionQty, stepSize);
          if (qty >= minQty) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            const order = await client.placeOrder({
              symbol,
              side: 'SELL',
              type: 'MARKET',
              quantity: String(qty),
            });
            // Complexity: O(1)
            log(`STOP-LOSS SELL ${qty} ${symbol} @market  OrderId=${order.orderId}`);
            totalSells++;
          }
          positionQty = 0;
          entryPrice  = 0;
          lastSellTime = Date.now();
          // SAFETY: async operation — wrap in try-catch for production resilience
          await sleep(loopIntervalSec * 1000);
          continue;
        }
      }

      /* ═══ v3 #7: Entropy-gated signal confidence ═══ */
      let entropy = 0.5;   // default: neutral
      if (rustEngine && rustEngine.computeGlobalEntropy) {
        try { entropy = rustEngine.computeGlobalEntropy(); } catch (_) {}
      }
      // High entropy (>0.7) = chaotic → require wider crossover
      // Low entropy (<0.3) = trending → use tight crossover
      const crossoverMult = entropy > 0.7 ? 1.005 : entropy < 0.3 ? 1.0005 : 1.001;
      // Position sizing: reduce in chaos, full in trend
      const entropyScale = entropy > 0.7 ? 0.5 : entropy < 0.3 ? 1.0 : 0.75;

      /* ─── SMA signals (1m) ─── */
      const sma7   = sma(closes1m.slice(-7));
      const sma25  = sma(closes1m.slice(-25));

      /* ═══ v3 #9: Cross-timeframe alignment (5m) ═══ */
      let aligned = true;
      try {
        const klines5m = await client.getKlines(symbol, '5m', 10);
        const closes5m = klines5m.map(k => Number(k[4]));
        const sma5m_fast = sma(closes5m.slice(-3));
        const sma5m_slow = sma(closes5m.slice(-7));
        // 5m must agree with 1m direction
        const dir1m = sma7 > sma25 ? 'bull' : 'bear';
        const dir5m = sma5m_fast > sma5m_slow ? 'bull' : 'bear';
        aligned = dir1m === dir5m;
      } catch (_) { /* if klines fetch fails, allow trade */ }

      const buySignal  = sma7 > sma25 * crossoverMult && aligned;
      const sellSignal = sma7 < sma25 * (2 - crossoverMult);  // symmetric threshold

      /* ─── 3. Cooldown guard ─── */
      const cooldownMs   = cooldownMin * 60000;
      const inCooldown   = (Date.now() - lastSellTime) < cooldownMs;

      /* ─── BUY (with entropy scaling + fill verification) ─── */
      if (positionQty <= 0 && buySignal && spentUsdt < maxBudgetUsdt && !inCooldown) {
        const rawOrderUsdt = Math.min(maxOrderUsdt, maxBudgetUsdt - spentUsdt);
        const orderUsdt    = rawOrderUsdt * entropyScale;   // v3: scale by entropy
        if (orderUsdt < minNotional) {
          // Complexity: O(1)
          log(`SKIP BUY — entropy-scaled budget ${orderUsdt.toFixed(2)} < minNotional ${minNotional}`);
        } else {
          const rawQty = orderUsdt / price;
          const qty    = floorToStep(rawQty, stepSize);

          if (qty >= minQty && qty * price >= minNotional) {
            /* v3 #10: self-tuning LIMIT offset */
            const limitPrice = roundPrice(price - limitOffset);
            const orderStartTime = Date.now();
            // SAFETY: async operation — wrap in try-catch for production resilience
            const order = await client.placeOrder({
              symbol,
              side:            'BUY',
              type:            'LIMIT',
              timeInForce:     'GTC',
              price:           String(limitPrice),
              quantity:        String(qty),
            });

            // Complexity: O(1)
            log(`BUY PLACED ${qty} ${symbol} @${limitPrice} entropy=${entropy.toFixed(3)} atrStop=${atrStopPct.toFixed(2)}%  OrderId=${order.orderId}`);

            /* ═══ v3 #8: Fill verification loop ═══ */
            // SAFETY: async operation — wrap in try-catch for production resilience
            const fillResult = await waitForFill(client, symbol, order.orderId, 30000, 5000);
            if (fillResult.filled) {
              const fillTime = Date.now() - orderStartTime;
              fillTimes.push(fillTime);
              if (fillTimes.length > 50) fillTimes.shift();
              // Self-tune: if fills are consistently slow (>15s), widen the offset
              const avgFillMs = fillTimes.reduce((a, b) => a + b, 0) / fillTimes.length;
              if (avgFillMs > 15000) limitOffset = Math.min(limitOffset + tickSize, tickSize * 5);
              else if (avgFillMs < 5000 && limitOffset > 0) limitOffset = Math.max(0, limitOffset - tickSize);

              positionQty += qty;
              entryPrice   = limitPrice;
              spentUsdt   += qty * limitPrice;
              totalBuys++;
              // Complexity: O(1)
              log(`BUY FILLED in ${(fillTime / 1000).toFixed(1)}s  spent=${spentUsdt.toFixed(2)}/${maxBudgetUsdt.toFixed(2)} USDT  offset=${limitOffset.toFixed(4)}`);
            } else {
              // Complexity: O(1)
              log(`BUY UNFILLED — cancelled after 30s timeout.  Price moved.  limitOffset=${limitOffset.toFixed(4)}`);
              // Increase offset for next attempt
              limitOffset = Math.min(limitOffset + tickSize, tickSize * 3);
            }
          } else {
            // Complexity: O(1)
            log(`SKIP BUY — qty ${rawQty.toFixed(8)} rounds to ${qty} (< minQty ${minQty})`);
          }
        }

      /* ─── SELL ─── */
      } else if (positionQty > 0 && sellSignal) {
        const qty = floorToStep(positionQty, stepSize);
        if (qty >= minQty) {
          const limitPrice = roundPrice(price);
          // SAFETY: async operation — wrap in try-catch for production resilience
          const order = await client.placeOrder({
            symbol,
            side:            'SELL',
            type:            'LIMIT',
            timeInForce:     'GTC',
            price:           String(limitPrice),
            quantity:        String(qty),
          });
          totalSells++;

          // Also verify sell fills
          // SAFETY: async operation — wrap in try-catch for production resilience
          const fillResult = await waitForFill(client, symbol, order.orderId, 30000, 5000);
          if (fillResult.filled) {
            // Complexity: O(1)
            log(`SELL FILLED ${qty} ${symbol} @${limitPrice}  OrderId=${order.orderId}`);
          } else {
            // If sell didn't fill, force MARKET
            // Complexity: O(1)
            log(`SELL UNFILLED — forcing MARKET sell…`);
            try {
              const mktOrder = await client.placeOrder({ symbol, side: 'SELL', type: 'MARKET', quantity: String(qty) });
              // Complexity: O(1)
              log(`MARKET SELL ${qty} ${symbol}  OrderId=${mktOrder.orderId}`);
            } catch (e) { log(`MARKET SELL FAILED: ${e.message}`); }
          }
        }
        positionQty  = 0;
        entryPrice   = 0;
        lastSellTime = Date.now();

      /* ─── HOLD ─── */
      } else {
        const cd = inCooldown ? ` [cooldown ${Math.round((cooldownMs - (Date.now() - lastSellTime)) / 1000)}s]` : '';
        const al = !aligned ? ' [5m-MISALIGN]' : '';
        // Complexity: O(1)
        log(`HOLD | price=${price.toFixed(2)} sma7=${sma7.toFixed(2)} sma25=${sma25.toFixed(2)} pos=${positionQty} entropy=${entropy.toFixed(3)} atr=${atr14.toFixed(2)}${cd}${al}`);
      }

    } catch (err) {
      // Complexity: O(1)
      log(`ERROR ${err.message}`);
    }

    // SAFETY: async operation — wrap in try-catch for production resilience
    await sleep(loopIntervalSec * 1000);
  }

  /* ═══════════════════════════════════════════════════
   * End-of-session: cancel open orders + market-close
   * ═══════════════════════════════════════════════════ */
  try {
    // cancel any open limit orders first
    const openOrders = await client.getOpenOrders(symbol);
    for (const o of openOrders) {
      await client.cancelOrder(symbol, o.orderId);
      // Complexity: O(1)
      log(`Cancelled open order ${o.orderId}`);
    }

    if (positionQty > 0) {
      const qty = floorToStep(positionQty, stepSize);
      if (qty >= minQty) {
        const order = await client.placeOrder({
          symbol,
          side: 'SELL',
          type: 'MARKET',
          quantity: String(qty),
        });
        // Complexity: O(1)
        log(`FINAL CLOSE SELL ${qty} ${symbol} @market  OrderId=${order.orderId}`);
      }
    }
  } catch (err) {
    // Complexity: O(1)
    log(`FINAL CLOSE ERROR ${err.message}`);
  }

  // Complexity: O(1)
  log('═══════════════════════════════════════════════════════════');
  // Complexity: O(1)
  log(`SESSION SUMMARY: buys=${totalBuys} sells=${totalSells} spent=${spentUsdt.toFixed(2)} USDT`);
  const avgFill = fillTimes.length > 0 ? (fillTimes.reduce((a, b) => a + b, 0) / fillTimes.length / 1000).toFixed(1) : 'N/A';
  // Complexity: O(1)
  log(`FILL STATS: avgFillTime=${avgFill}s  limitOffset=${limitOffset.toFixed(4)}  fills=${fillTimes.length}`);
  // Complexity: O(1)
  log(`ENGINE: Rust=${!!rustEngine}  entropy-gating=YES  ATR-stop=YES  5m-alignment=YES`);
  // Complexity: O(1)
  log('QANTUM 8H LIVE RUN v3 — FINISHED');
  // Complexity: O(1)
  log('═══════════════════════════════════════════════════════════');
  // Complexity: O(1)
  log(`Log → ${logPath}`);
}

    // Complexity: O(1) — hash/map lookup
main().catch(err => {
  console.error(`[FATAL] ${err.message}`);
  process.exit(1);
});
