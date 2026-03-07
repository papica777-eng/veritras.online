/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  BINANCE LIVE CONNECTOR  v1.0                                              ║
 * ║  Реални цени + реални ордери срещу Binance REST API                        ║
 * ║                                                                            ║
 * ║  Зарежда се само когато TRADING_MODE=live или =paper                       ║
 * ║  При paper: реални цени, симулирано изпълнение (без реални ордери)         ║
 * ║  При live:  реални цени + реални подписани ордери                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

import * as https   from 'https';
import * as crypto  from 'crypto';
import * as fs      from 'fs';
import * as path    from 'path';

// ─── Load .env manually (no external deps) ──────────────────────────────────
function loadEnv(): void {
  const envPath = path.join(__dirname, '.env');
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

// ─── Config ──────────────────────────────────────────────────────────────────
const API_KEY    = process.env.BINANCE_API_KEY    ?? '';
const API_SECRET = process.env.BINANCE_API_SECRET ?? '';
const MODE       = (process.env.TRADING_MODE ?? 'paper') as 'simulation' | 'paper' | 'live';
const BASE_URL   = 'api.binance.com';
const RECV_WINDOW = 5000;

// ─── Singleton price cache ────────────────────────────────────────────────────
const priceCache: Map<string, { price: number; ts: number }> = new Map();
let allPricesFetchedAt = 0;

// ─── HTTP helper ─────────────────────────────────────────────────────────────
function httpsGet(path: string, headers: Record<string, string> = {}): Promise<any> {
  return new Promise((resolve, reject) => {
    const req = https.get({ hostname: BASE_URL, path, headers, timeout: 6000 }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch { reject(new Error(`JSON parse error: ${data.slice(0, 200)}`)); }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Binance request timeout')); });
  });
}

function httpsPost(reqPath: string, body: string, headers: Record<string, string>): Promise<any> {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: BASE_URL,
      path: reqPath,
      method: 'POST',
      headers: {
        'Content-Type':   'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(body),
        ...headers,
      },
      timeout: 8000,
    };
    const req = https.request(opts, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch { reject(new Error(`JSON parse: ${data.slice(0, 200)}`)); }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Post timeout')); });
    req.write(body);
    req.end();
  });
}

// ─── HMAC-SHA256 signature ────────────────────────────────────────────────────
function sign(queryString: string): string {
  return crypto
    .createHmac('sha256', API_SECRET)
    .update(queryString)
    .digest('hex');
}

function buildSigned(params: Record<string, string | number>): string {
  const ts = Date.now();
  const qs = Object.entries({ ...params, timestamp: ts, recvWindow: RECV_WINDOW })
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join('&');
  return `${qs}&signature=${sign(qs)}`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PUBLIC — PRICE FEED
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Fetch all spot prices from Binance in one shot (no auth needed).
 * Cached for 2 seconds so concurrent calls don't spam the API.
 */
export async function fetchAllBinancePrices(): Promise<Map<string, number>> {
  const now = Date.now();
  if (now - allPricesFetchedAt < 2000 && priceCache.size > 0) {
    return new Map([...priceCache.entries()].map(([k, v]) => [k, v.price]));
  }

  try {
    const data = await httpsGet('/api/v3/ticker/price');
    if (!Array.isArray(data)) {
      // Binance returned an error — log it fully so we can diagnose
      console.error(`[BinanceLive] ❌ Price fetch: expected array, got: ${JSON.stringify(data).slice(0, 300)}`);
      // Don't spam — back off for 10s
      allPricesFetchedAt = now - 2000 + 10000;
    } else {
      for (const { symbol, price } of data as Array<{ symbol: string; price: string }>) {
        priceCache.set(symbol, { price: parseFloat(price), ts: now });
      }
      allPricesFetchedAt = now;
      if (priceCache.size > 0) {
        console.log(`[BinanceLive] 📡 Price feed updated: ${priceCache.size} pairs`);
      }
    }
  } catch (err: any) {
    console.error(`[BinanceLive] ❌ Price fetch error: ${err.message}`);
    // Back off 10s on error to avoid spam
    allPricesFetchedAt = now - 2000 + 10000;
  }

  return new Map([...priceCache.entries()].map(([k, v]) => [k, v.price]));
}

/**
 * Get a single symbol price.
 * e.g. getPrice('BTCUSDT') → 67400
 */
export async function getPrice(symbol: string): Promise<number | null> {
  try {
    const data: { price: string } = await httpsGet(`/api/v3/ticker/price?symbol=${symbol}`);
    return parseFloat(data.price);
  } catch {
    return priceCache.get(symbol)?.price ?? null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// PUBLIC — ACCOUNT
// ═══════════════════════════════════════════════════════════════════════════════

export async function getAccountBalances(): Promise<Record<string, number>> {
  if (!API_KEY || !API_SECRET) {
    console.warn('[BinanceLive] ⚠️  API keys not set — cannot fetch balances.');
    return {};
  }
  try {
    const qs   = buildSigned({});
    const data = await httpsGet(`/api/v3/account?${qs}`, { 'X-MBX-APIKEY': API_KEY });
    if (data.code) throw new Error(`Binance error ${data.code}: ${data.msg}`);
    const balances: Record<string, number> = {};
    for (const b of data.balances as Array<{ asset: string; free: string; locked: string }>) {
      const total = parseFloat(b.free) + parseFloat(b.locked);
      if (total > 0) balances[b.asset] = total;
    }
    return balances;
  } catch (err: any) {
    console.error(`[BinanceLive] ❌ Balance error: ${err.message}`);
    return {};
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// PUBLIC — ORDER PLACEMENT
// ═══════════════════════════════════════════════════════════════════════════════

export interface BinanceOrderResult {
  orderId:         number;
  symbol:          string;
  side:            'BUY' | 'SELL';
  status:          'FILLED' | 'PARTIALLY_FILLED' | 'NEW' | 'REJECTED' | 'EXPIRED';
  executedQty:     number;
  cummulativeQuoteQty: number;
  fills:           Array<{ price: string; qty: string; commission: string; commissionAsset: string }>;
  error?:          string;
}

/**
 * Place a MARKET order on Binance.
 * Returns a result with fill details.
 *
 * SAFETY: only actually fires when MODE === 'live' AND API keys are set.
 * In all other cases it simulates a fill.
 */
export async function placeMarketOrder(
  symbol:   string,
  side:     'BUY' | 'SELL',
  quantity: number,
): Promise<BinanceOrderResult> {

  // ── Paper/sim → simulate fill ───────────────────────────────────────────
  if (MODE !== 'live' || !API_KEY || !API_SECRET) {
    const simulatedPrice = priceCache.get(symbol)?.price ?? 1;
    const slip = 1 + (Math.random() - 0.5) * 0.002;
    const filled = simulatedPrice * slip;
    return {
      orderId:             Math.floor(Math.random() * 9_999_999),
      symbol,
      side,
      status:              'FILLED',
      executedQty:         quantity,
      cummulativeQuoteQty: filled * quantity,
      fills: [{ price: filled.toFixed(8), qty: quantity.toFixed(8), commission: '0', commissionAsset: 'BNB' }],
    };
  }

  // ── Live → real signed order ─────────────────────────────────────────────
  try {
    const params = buildSigned({
      symbol,
      side,
      type:     'MARKET',
      quantity: quantity.toFixed(8),
    });

    const data = await httpsPost('/api/v3/order', params, { 'X-MBX-APIKEY': API_KEY });

    if (data.code) {
      return {
        orderId: -1, symbol, side,
        status:             'REJECTED',
        executedQty:        0,
        cummulativeQuoteQty: 0,
        fills:              [],
        error:              `Binance ${data.code}: ${data.msg}`,
      };
    }

    return {
      orderId:             data.orderId,
      symbol:              data.symbol,
      side:                data.side,
      status:              data.status,
      executedQty:         parseFloat(data.executedQty),
      cummulativeQuoteQty: parseFloat(data.cummulativeQuoteQty),
      fills:               data.fills ?? [],
    };

  } catch (err: any) {
    return {
      orderId: -1, symbol, side,
      status:             'REJECTED',
      executedQty:        0,
      cummulativeQuoteQty: 0,
      fills:              [],
      error:              err.message,
    };
  }
}

/**
 * Emergency: cancel ALL open orders for a symbol (or all symbols).
 */
export async function cancelAllOrders(symbol?: string): Promise<void> {
  if (!API_KEY || !API_SECRET) return;
  try {
    if (symbol) {
      const qs = buildSigned({ symbol });
      await httpsPost(`/api/v3/openOrders?${qs}`, '', { 'X-MBX-APIKEY': API_KEY });
      console.log(`[BinanceLive] 🚨 Cancelled all orders for ${symbol}`);
    } else {
      // For each USDT pair in cache, cancel
      const pairs = [...priceCache.keys()].filter(k => k.endsWith('USDT'));
      await Promise.allSettled(pairs.map(s => cancelAllOrders(s)));
    }
  } catch (err: any) {
    console.error(`[BinanceLive] Cancel error: ${err.message}`);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// PATCH — Inject real data into MarketWatcher + AtomicTrader
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Call this ONCE before starting the bridge.
 * Monkey-patches the two simulation functions with real Binance calls.
 */
export function patchWithLiveData(
  marketWatcher: any,
  atomicTrader:  any,
): void {
  // ── 1. Patch MarketWatcher price fetch ──────────────────────────────────
  const origFetch = marketWatcher['fetchMarketPrices']?.bind(marketWatcher);

  marketWatcher['fetchMarketPrices'] = async function(
    config: any,
    symbols: string[],
  ): Promise<any[]> {
    try {
      const prices = await fetchAllBinancePrices();
      const result: any[] = [];
      const exchangeName: string = config.name ?? 'Binance';

      for (const sym of symbols) {
        const usdt  = sym + 'USDT';
        const price = prices.get(usdt);
        if (!price) continue;

        // Simulate small cross-exchange variance for non-Binance exchanges
        const variance = exchangeName === 'Binance'
          ? 1
          : 1 + (Math.random() - 0.5) * 0.008;

        result.push({
          exchange:   exchangeName,
          symbol:     sym,
          price:      price * variance,
          volume24h:  Math.random() * 1_000_000_000,
          timestamp:  Date.now(),
          latencyMs:  1,
          confidence: 0.99,
        });
      }
      return result;
    } catch {
      // Fall back to original simulation on error
      return origFetch ? origFetch(config, symbols) : [];
    }
  };

  console.log('[BinanceLive] ✅ MarketWatcher patched → real Binance prices');

  // ── 2. Patch AtomicTrader order execution ──────────────────────────────
  atomicTrader['executeOrder'] = async function(order: any): Promise<any> {
    const symbol = order.symbol + 'USDT';
    const side   = order.type === 'buy' ? 'BUY' : 'SELL';

    const result = await placeMarketOrder(symbol, side, order.quantity);

    if (result.status === 'FILLED') {
      const avgFill = result.fills.length
        ? result.fills.reduce((s: number, f: any) => s + parseFloat(f.price) * parseFloat(f.qty), 0)
          / result.fills.reduce((s: number, f: any) => s + parseFloat(f.qty), 0)
        : result.cummulativeQuoteQty / result.executedQty;

      order.status        = 'filled';
      order.fillPrice     = avgFill;
      order.fillTimestamp = Date.now();
      order._orderId      = result.orderId;

      console.log(
        `[BinanceLive] ✅ ${side} ${symbol} @ ${avgFill.toFixed(4)}` +
        `  qty=${result.executedQty}  orderId=${result.orderId}`
      );
    } else {
      order.status = 'failed';
      order.error  = result.error ?? `Status: ${result.status}`;
      console.error(`[BinanceLive] ❌ ${side} ${symbol} REJECTED — ${order.error}`);
    }

    return order;
  };

  console.log('[BinanceLive] ✅ AtomicTrader patched → real Binance orders');
  if (MODE === 'live') {
    console.log('[BinanceLive] 🔴 LIVE MODE — реални пари, реални ордери!');
  } else {
    console.log('[BinanceLive] 🟡 PAPER MODE — реални цени, симулирано изпълнение.');
  }
}

// ─── Key validation ───────────────────────────────────────────────────────────
export function validateKeys(): { ok: boolean; mode: string; message: string } {
  if (!API_KEY || !API_SECRET) {
    return {
      ok:      false,
      mode:    MODE,
      message: '⚠️  Binance API ключовете не са зададени в .env — работи на симулирани цени.',
    };
  }
  return {
    ok:      true,
    mode:    MODE,
    message: `✅ API ключове заредени. Mode=${MODE.toUpperCase()}`,
  };
}

export { MODE as CONNECTOR_MODE };
