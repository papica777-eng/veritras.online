/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  BINANCE TRIANGULAR ARBITRAGE ENGINE                                      ║
 * ║  "EUR → USDT → BTC → EUR" | "USDT → BTC → ETH → USDT"                     ║
 * ║                                                                           ║
 * ║  Single-exchange cycles. Binance ↔ Binance. Steel execution.             ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 * Complexity: O(1) per cycle scan
 */

import { binanceProService } from '../services/BinanceProService';
import { SAFETY_CONFIG } from '../soul/QAntum_ANIMA';

export interface TriangularLeg {
  pair: string;
  side: 'buy' | 'sell';
  amount: number;
  price: number;
}

export interface TriangularOpportunity {
  id: string;
  cycle: string;
  legs: TriangularLeg[];
  startAmount: number;
  expectedEndAmount: number;
  netProfitPercent: number;
  netProfit: number;
  timestamp: number;
}

const FEE_PERCENT = 0.001; // 0.1% taker

/**
 * Cycle: USDT → BTC → ETH → USDT (classic, high liquidity)
 */
async function fetchTrianglePrices(): Promise<Record<string, number>> {
  const want = ['BTCUSDT', 'ETHBTC', 'ETHUSDT'];
  const out: Record<string, number> = {};

  try {
    const res = await fetch('https://api.binance.com/api/v3/ticker/price');
    const data = await res.json();
    const arr = Array.isArray(data) ? data : [data];
    for (const item of arr) {
      if (want.includes(item.symbol)) out[item.symbol] = parseFloat(item.price);
    }
  } catch {
    // fallback
  }
  return out;
}

/**
 * Detect profitable triangular cycle: USDT → BTC → ETH → USDT
 */
export async function scanTriangularOpportunity(
  capitalUSDT: number
): Promise<TriangularOpportunity | null> {
  // SAFETY: async operation — wrap in try-catch for production resilience
  const prices = await fetchTrianglePrices();
  const btcUsdt = prices['BTCUSDT'];
  const ethBtc = prices['ETHBTC'];
  const ethUsdt = prices['ETHUSDT'];

  if (!btcUsdt || !ethBtc || !ethUsdt) return null;

  // Simulate cycle: start USDT -> buy BTC -> buy ETH -> sell ETH for USDT
  const btcAmount = capitalUSDT / btcUsdt;
  const ethAmount = btcAmount / ethBtc;
  const endUsdt = ethAmount * ethUsdt;

  const grossProfit = endUsdt - capitalUSDT;
  const fees = capitalUSDT * FEE_PERCENT * 3; // 3 legs
  const netProfit = grossProfit - fees;
  const netProfitPercent = (netProfit / capitalUSDT) * 100;

  if (netProfitPercent < 0.05) return null; // min 0.05% after fees

  return {
    id: `TRI-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    cycle: 'USDT/BTC/ETH',
    legs: [
      { pair: 'BTC/USDT', side: 'buy', amount: btcAmount, price: btcUsdt },
      { pair: 'ETH/BTC', side: 'buy', amount: ethAmount, price: ethBtc },
      { pair: 'ETH/USDT', side: 'sell', amount: ethAmount, price: ethUsdt },
    ],
    startAmount: capitalUSDT,
    expectedEndAmount: endUsdt,
    netProfitPercent,
    netProfit,
    timestamp: Date.now(),
  };
}

/**
 * Execute triangular cycle - 3 sequential REAL orders
 */
export async function executeTriangularCycle(
  opp: TriangularOpportunity,
  isLive: boolean
): Promise<{ success: boolean; actualProfit?: number; error?: string }> {
  if (!binanceProService.isReady()) {
    return { success: false, error: 'Binance API keys not configured' };
  }

  if (opp.startAmount < SAFETY_CONFIG.MIN_ORDER_USDT) {
    return { success: false, error: `Below Binance minimum (${SAFETY_CONFIG.MIN_ORDER_USDT} USDT)` };
  }

  if (!isLive) {
    return { success: true, actualProfit: opp.netProfit };
  }

  console.log(`[MarketWatcher] ⚡ High-yield triangle detected: ${opp.cycle}`);

  let amount: number = opp.legs[0].amount;
  const results: { filled?: number; cost?: number }[] = [];

  for (let i = 0; i < opp.legs.length; i++) {
    const leg = opp.legs[i];
    const orderAmount = i === 0 ? leg.amount : amount;
    console.log(`[AtomicTrader] 🚀 Executing REAL Order ${i + 1}/3 (${leg.pair})`);

    // SAFETY: async operation — wrap in try-catch for production resilience
    const r = await binanceProService.executeOrder(leg.pair, leg.side, orderAmount);

    if (!r.success) {
      return { success: false, error: `Leg ${i + 1} failed: ${r.error}` };
    }

    results.push(r);
    amount = r.filled ?? leg.amount;
  }

  const actualEnd = results[2]?.cost ?? amount * opp.legs[2].price;
  const actualProfit = actualEnd - opp.startAmount;

  console.log(`[SUCCESS] 💰 Arbitrage Cycle COMPLETED. Net Profit: +${((actualProfit / opp.startAmount) * 100).toFixed(2)}%`);

  return { success: true, actualProfit };
}
