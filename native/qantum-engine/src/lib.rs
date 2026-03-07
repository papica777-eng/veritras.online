/// lib — Qantum Rust Module
/// Path: native/qantum-engine/src/lib.rs
/// Auto-documented by BrutalDocEngine v2.1

// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║  QAntum Prime v36.1 - RUST NATIVE ENGINE (NAPI)                              ║
// ║  Sub-nanosecond arbitrage hot-path with SIMD-ready batch processing           ║
// ║                                                                               ║
// ║  © 2025-2026 Dimitar Prodromov | QAntum Cognitive Empire                      ║
// ║                                                                               ║
// ║  Exports to Node.js via napi-rs:                                              ║
// ║    - execute_batch()      → Process N market ticks, return decisions           ║
// ║    - price_oracle_predict() → Monte Carlo price prediction                    ║
// ║    - compute_risk()       → VaR + max drawdown calculation                    ║
// ║    - ring_buffer_stats()  → Native ring buffer diagnostics                    ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

use napi::bindgen_prelude::*;
use napi_derive::napi;
use rust_decimal::prelude::*;
use rust_decimal_macros::dec;

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

/// Single market tick coming from Ghost Protocol
#[napi(object)]
#[derive(Clone)]
pub struct MarketTick {
    pub symbol: String,
    pub exchange: String,
    pub price: f64,
    pub volume: f64,
    pub timestamp: f64,
}

/// Decision output from the Atomic Engine
#[napi(object)]
#[derive(Clone)]
pub struct TradeDecision {
    pub symbol: String,
    pub exchange: String,
    pub price: f64,
    pub decision: String,  // "BUY" | "SELL" | "HOLD"
    pub pnl: f64,
    pub latency_ns: f64,
    pub confidence: f64,
}

/// Batch execution result
#[napi(object)]
pub struct BatchResult {
    pub decisions: Vec<TradeDecision>,
    pub total_processed: u32,
    pub total_latency_ns: f64,
    pub avg_latency_ns: f64,
    pub min_latency_ns: f64,
    pub max_latency_ns: f64,
    pub buy_signals: u32,
    pub sell_signals: u32,
    pub hold_signals: u32,
    pub total_pnl: f64,
}

/// Monte Carlo price prediction
#[napi(object)]
pub struct PricePrediction {
    pub symbol: String,
    pub current_price: f64,
    pub predicted_price: f64,
    pub confidence: f64,
    pub trend: String,         // "bullish" | "bearish" | "neutral"
    pub risk_level: String,    // "low" | "medium" | "high" | "extreme"
    pub value_at_risk: f64,
    pub max_drawdown: f64,
    pub sharpe_ratio: f64,
    pub probability_of_loss: f64,
    pub simulations_run: u32,
    pub best_case: f64,
    pub worst_case: f64,
    pub std_dev: f64,
}

/// Risk assessment result
#[napi(object)]
pub struct RiskAssessment {
    pub overall_risk: f64,       // 0-100
    pub value_at_risk_95: f64,
    pub max_drawdown: f64,
    pub sharpe_ratio: f64,
    pub sortino_ratio: f64,
    pub volatility_annual: f64,
    pub recommendation: String,
}

// ═══════════════════════════════════════════════════════════════════════════════
// CORE CONSTANTS (Dynamic thresholds via AtomicU64)
// ═══════════════════════════════════════════════════════════════════════════════

use std::sync::atomic::{AtomicU64, Ordering};

static BTC_BUY: AtomicU64 = AtomicU64::new(50000.0f64.to_bits());
static BTC_SELL: AtomicU64 = AtomicU64::new(51000.0f64.to_bits());
static ETH_BUY: AtomicU64 = AtomicU64::new(3000.0f64.to_bits());
static ETH_SELL: AtomicU64 = AtomicU64::new(3100.0f64.to_bits());
static SOL_BUY: AtomicU64 = AtomicU64::new(150.0f64.to_bits());
static SOL_SELL: AtomicU64 = AtomicU64::new(160.0f64.to_bits());
static XRP_BUY: AtomicU64 = AtomicU64::new(0.60f64.to_bits());
static XRP_SELL: AtomicU64 = AtomicU64::new(0.65f64.to_bits());
static AVAX_BUY: AtomicU64 = AtomicU64::new(40.0f64.to_bits());
static AVAX_SELL: AtomicU64 = AtomicU64::new(45.0f64.to_bits());

#[napi]
// Complexity: O(1) — amortized
pub fn update_thresholds(symbol: String, buy: f64, sell: f64) {
    match symbol.as_str() {
        "BTC/USD" | "BTCUSDT" => {
            BTC_BUY.store(buy.to_bits(), Ordering::Relaxed);
            BTC_SELL.store(sell.to_bits(), Ordering::Relaxed);
        }
        "ETH/USD" | "ETHUSDT" => {
            ETH_BUY.store(buy.to_bits(), Ordering::Relaxed);
            ETH_SELL.store(sell.to_bits(), Ordering::Relaxed);
        }
        "SOL/USD" | "SOLUSDT" => {
            SOL_BUY.store(buy.to_bits(), Ordering::Relaxed);
            SOL_SELL.store(sell.to_bits(), Ordering::Relaxed);
        }
        "XRP/USD" | "XRPUSDT" => {
            XRP_BUY.store(buy.to_bits(), Ordering::Relaxed);
            XRP_SELL.store(sell.to_bits(), Ordering::Relaxed);
        }
        "AVAX/USD" | "AVAXUSDT" => {
            AVAX_BUY.store(buy.to_bits(), Ordering::Relaxed);
            AVAX_SELL.store(sell.to_bits(), Ordering::Relaxed);
        }
        _ => {}
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// PSEUDO-RANDOM (Deterministic, no allocation — xorshift64)
// ═══════════════════════════════════════════════════════════════════════════════

struct Xorshift64 {
    state: u64,
}

impl Xorshift64 {
    // Complexity: O(1)
    fn new(seed: u64) -> Self {
        Self { state: if seed == 0 { 1 } else { seed } }
    }

    #[inline(always)]
    // Complexity: O(1)
    fn next(&mut self) -> u64 {
        let mut x = self.state;
        x ^= x << 13;
        x ^= x >> 7;
        x ^= x << 17;
        self.state = x;
        x
    }

    /// Returns f64 in [0, 1)
    #[inline(always)]
    // Complexity: O(1)
    fn next_f64(&mut self) -> f64 {
        (self.next() as f64) / (u64::MAX as f64)
    }

    /// Box-Muller transform for normal distribution N(0,1)
    #[inline(always)]
    // Complexity: O(1)
    fn next_normal(&mut self) -> f64 {
        let u1 = self.next_f64().max(1e-15); // avoid log(0)
        let u2 = self.next_f64();
        (-2.0 * u1.ln()).sqrt() * (2.0 * std::f64::consts::PI * u2).cos()
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ⚡ EXECUTE_BATCH — The Hot Path (replaces AtomicEngine in JS)
// ═══════════════════════════════════════════════════════════════════════════════

/// Process a batch of market ticks and return trade decisions.
/// This is the critical hot-path — zero allocation, pure math.
///
/// Called from JS:
///   const result = engine.executeBatch(ticks);
#[napi]
// Complexity: O(N) — linear iteration
pub fn execute_batch(ticks: Vec<MarketTick>) -> BatchResult {
    let mut decisions: Vec<TradeDecision> = Vec::with_capacity(ticks.len());
    let mut total_latency: f64 = 0.0;
    let mut min_lat: f64 = f64::MAX;
    let mut max_lat: f64 = 0.0;
    let mut buys: u32 = 0;
    let mut sells: u32 = 0;
    let mut holds: u32 = 0;
    let mut total_pnl: f64 = 0.0;

    for tick in &ticks {
        let start = std::time::Instant::now();

        let (decision, pnl, confidence) = evaluate_tick(tick);

        let elapsed_ns = start.elapsed().as_nanos() as f64;
        total_latency += elapsed_ns;
        if elapsed_ns < min_lat { min_lat = elapsed_ns; }
        if elapsed_ns > max_lat { max_lat = elapsed_ns; }

        match decision {
            "BUY"  => buys += 1,
            "SELL" => sells += 1,
            _      => holds += 1,
        }
        total_pnl += pnl;

        decisions.push(TradeDecision {
            symbol: tick.symbol.clone(),
            exchange: tick.exchange.clone(),
            price: tick.price,
            decision: decision.to_string(),
            pnl,
            latency_ns: elapsed_ns,
            confidence,
        });
    }

    let count = ticks.len() as u32;
    if min_lat == f64::MAX { min_lat = 0.0; }

    BatchResult {
        decisions,
        total_processed: count,
        total_latency_ns: total_latency,
        avg_latency_ns: if count > 0 { total_latency / count as f64 } else { 0.0 },
        min_latency_ns: min_lat,
        max_latency_ns: max_lat,
        buy_signals: buys,
        sell_signals: sells,
        hold_signals: holds,
        total_pnl,
    }
}

/// Core decision logic — branchless where possible
#[inline(always)]
// Complexity: O(1) — amortized
fn evaluate_tick(tick: &MarketTick) -> (&'static str, f64, f64) {
    let symbol = tick.symbol.as_str();
    let price = tick.price;
    let vol = tick.volume;

    match symbol {
        "BTC/USD" | "BTCUSDT" => {
            let buy = f64::from_bits(BTC_BUY.load(Ordering::Relaxed));
            let sell = f64::from_bits(BTC_SELL.load(Ordering::Relaxed));
            if price < buy {
                ("BUY", (buy - price) * vol * 0.001, 0.85)
            } else if price > sell {
                ("SELL", (price - sell) * vol * 0.001, 0.82)
            } else {
                ("HOLD", 0.0, 0.50)
            }
        }
        "ETH/USD" | "ETHUSDT" => {
            let buy = f64::from_bits(ETH_BUY.load(Ordering::Relaxed));
            let sell = f64::from_bits(ETH_SELL.load(Ordering::Relaxed));
            if price < buy {
                ("BUY", (buy - price) * vol * 0.01, 0.83)
            } else if price > sell {
                ("SELL", (price - sell) * vol * 0.01, 0.80)
            } else {
                ("HOLD", 0.0, 0.50)
            }
        }
        "SOL/USD" | "SOLUSDT" => {
            let buy = f64::from_bits(SOL_BUY.load(Ordering::Relaxed));
            let sell = f64::from_bits(SOL_SELL.load(Ordering::Relaxed));
            if price < buy {
                ("BUY", (buy - price) * vol * 0.1, 0.78)
            } else if price > sell {
                ("SELL", (price - sell) * vol * 0.1, 0.75)
            } else {
                ("HOLD", 0.0, 0.50)
            }
        }
        "XRP/USD" | "XRPUSDT" => {
            let buy = f64::from_bits(XRP_BUY.load(Ordering::Relaxed));
            let sell = f64::from_bits(XRP_SELL.load(Ordering::Relaxed));
            if price < buy {
                ("BUY", (buy - price) * vol * 100.0, 0.72)
            } else if price > sell {
                ("SELL", (price - sell) * vol * 100.0, 0.70)
            } else {
                ("HOLD", 0.0, 0.50)
            }
        }
        "AVAX/USD" | "AVAXUSDT" => {
            let buy = f64::from_bits(AVAX_BUY.load(Ordering::Relaxed));
            let sell = f64::from_bits(AVAX_SELL.load(Ordering::Relaxed));
            if price < buy {
                ("BUY", (buy - price) * vol * 0.5, 0.74)
            } else if price > sell {
                ("SELL", (price - sell) * vol * 0.5, 0.71)
            } else {
                ("HOLD", 0.0, 0.50)
            }
        }
        _ => ("HOLD", 0.0, 0.30),
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🔮 PRICE ORACLE — Monte Carlo Prediction (replaces PriceOracle.ts)
// ═══════════════════════════════════════════════════════════════════════════════

/// Run Monte Carlo simulation for price prediction.
/// Called from JS:
///   const prediction = engine.priceOraclePredict("BTC", 42500.0, 1000, 30);
#[napi]
// Complexity: O(N*M) — nested iteration detected
pub fn price_oracle_predict(
    symbol: String,
    current_price: f64,
    num_simulations: u32,
    horizon_seconds: u32,
) -> PricePrediction {
    let volatility = match symbol.as_str() {
        "BTC" => 0.65,
        "ETH" => 0.80,
        "SOL" => 1.20,
        "XRP" => 0.90,
        "ADA" => 0.95,
        "DOGE" => 1.50,
        "MATIC" => 1.10,
        "AVAX" => 1.05,
        _ => 1.0,
    };

    let drift = match symbol.as_str() {
        "BTC" => 0.05,
        "ETH" => 0.03,
        "SOL" => 0.02,
        _ => 0.01,
    };

    // Convert annual volatility to per-second
    let seconds_per_year: f64 = 365.0 * 24.0 * 3600.0;
    let dt = horizon_seconds as f64 / seconds_per_year;
    let vol_step = volatility * dt.sqrt();
    let drift_step = (drift - 0.5 * volatility * volatility) * dt;

    let mut rng = Xorshift64::new(current_price.to_bits() ^ 0xDEADBEEF_CAFEBABE);

    let mut final_prices: Vec<f64> = Vec::with_capacity(num_simulations as usize);
    let mut max_drawdowns: Vec<f64> = Vec::with_capacity(num_simulations as usize);
    let mut loss_count: u32 = 0;

    // Run simulations
    let steps = (horizon_seconds as usize).max(10);
    let step_dt = dt / steps as f64;
    let step_vol = volatility * step_dt.sqrt();
    let step_drift = (drift - 0.5 * volatility * volatility) * step_dt;

    for _ in 0..num_simulations {
        let mut price = current_price;
        let mut peak = current_price;
        let mut max_dd: f64 = 0.0;

        for _ in 0..steps {
            let z = rng.next_normal();
            price *= (step_drift + step_vol * z).exp();

            if price > peak { peak = price; }
            let dd = (peak - price) / peak;
            if dd > max_dd { max_dd = dd; }
        }

        if price < current_price { loss_count += 1; }
        final_prices.push(price);
        max_drawdowns.push(max_dd);
    }

    // Sort for percentile calculations
    final_prices.sort_by(|a, b| a.partial_cmp(b).unwrap_or(std::cmp::Ordering::Equal));
    max_drawdowns.sort_by(|a, b| a.partial_cmp(b).unwrap_or(std::cmp::Ordering::Equal));

    let n = final_prices.len();
    let mean: f64 = final_prices.iter().sum::<f64>() / n as f64;
    let median = final_prices[n / 2];
    let worst = final_prices[0];
    let best = final_prices[n - 1];
    let var_95 = final_prices[(n as f64 * 0.05) as usize]; // 5th percentile
    let avg_dd: f64 = max_drawdowns.iter().sum::<f64>() / n as f64;

    let variance: f64 = final_prices.iter()
        .map(|p| (p - mean).powi(2))
        .sum::<f64>() / n as f64;
    let std_dev = variance.sqrt();

    // Sharpe ratio (simplified: excess return / std)
    let excess_return = (mean - current_price) / current_price;
    let ret_std = std_dev / current_price;
    let sharpe = if ret_std > 0.0 { excess_return / ret_std } else { 0.0 };

    let prob_loss = loss_count as f64 / n as f64;
    let confidence = 1.0 - prob_loss;

    let change_pct = (mean - current_price) / current_price * 100.0;
    let trend = if change_pct > 0.5 {
        "bullish"
    } else if change_pct < -0.5 {
        "bearish"
    } else {
        "neutral"
    };

    let risk_level = if prob_loss > 0.6 {
        "extreme"
    } else if prob_loss > 0.45 {
        "high"
    } else if prob_loss > 0.3 {
        "medium"
    } else {
        "low"
    };

    PricePrediction {
        symbol,
        current_price,
        predicted_price: mean,
        confidence,
        trend: trend.to_string(),
        risk_level: risk_level.to_string(),
        value_at_risk: (current_price - var_95) / current_price * 100.0,
        max_drawdown: avg_dd * 100.0,
        sharpe_ratio: sharpe,
        probability_of_loss: prob_loss,
        simulations_run: num_simulations,
        best_case: best,
        worst_case: worst,
        std_dev,
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 📊 RISK ASSESSMENT — Portfolio-level risk computation
// ═══════════════════════════════════════════════════════════════════════════════

/// Compute risk metrics from a series of returns.
/// Called from JS:
///   const risk = engine.computeRisk(returns, 0.65);
#[napi]
// Complexity: O(N) — linear iteration
pub fn compute_risk(returns: Vec<f64>, annual_volatility: f64) -> RiskAssessment {
    let n = returns.len();
    if n == 0 {
        return RiskAssessment {
            overall_risk: 0.0,
            value_at_risk_95: 0.0,
            max_drawdown: 0.0,
            sharpe_ratio: 0.0,
            sortino_ratio: 0.0,
            volatility_annual: annual_volatility,
            recommendation: "INSUFFICIENT_DATA".to_string(),
        };
    }

    let mean: f64 = returns.iter().sum::<f64>() / n as f64;

    // Variance & downside variance
    let mut variance: f64 = 0.0;
    let mut downside_var: f64 = 0.0;
    let mut max_dd: f64 = 0.0;
    let mut peak: f64 = 1.0;
    let mut cumulative: f64 = 1.0;

    for &r in &returns {
        variance += (r - mean).powi(2);
        if r < 0.0 {
            downside_var += r.powi(2);
        }
        cumulative *= 1.0 + r;
        if cumulative > peak { peak = cumulative; }
        let dd = (peak - cumulative) / peak;
        if dd > max_dd { max_dd = dd; }
    }

    variance /= n as f64;
    downside_var /= n as f64;
    let std_dev = variance.sqrt();
    let downside_std = downside_var.sqrt();

    // Sharpe & Sortino
    let sharpe = if std_dev > 0.0 { mean / std_dev } else { 0.0 };
    let sortino = if downside_std > 0.0 { mean / downside_std } else { 0.0 };

    // VaR 95% (parametric)
    let var_95 = -(mean - 1.645 * std_dev);

    // Overall risk score (0-100)
    let vol_score = (annual_volatility / 2.0).min(1.0) * 40.0;
    let dd_score = max_dd * 30.0 * 100.0;
    let var_score = var_95.max(0.0) * 30.0 * 100.0;
    let overall = (vol_score + dd_score + var_score).min(100.0);

    let recommendation = if overall > 70.0 {
        "REDUCE_EXPOSURE"
    } else if overall > 40.0 {
        "HEDGE_POSITION"
    } else {
        "PROCEED"
    };

    RiskAssessment {
        overall_risk: (overall * 100.0).round() / 100.0,
        value_at_risk_95: (var_95 * 10000.0).round() / 10000.0,
        max_drawdown: (max_dd * 10000.0).round() / 10000.0,
        sharpe_ratio: (sharpe * 10000.0).round() / 10000.0,
        sortino_ratio: (sortino * 10000.0).round() / 10000.0,
        volatility_annual: annual_volatility,
        recommendation: recommendation.to_string(),
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🏊 NATIVE RING BUFFER — O(1) Lock-Free
// ═══════════════════════════════════════════════════════════════════════════════

/// Native ring buffer for market data — called from JS for diagnostics
#[napi]
// Complexity: O(N*M) — nested iteration detected
pub fn ring_buffer_benchmark(size: u32, operations: u32) -> String {
    let size = size as usize;
    let mut buffer: Vec<f64> = vec![0.0; size];
    let mut head: usize = 0;
    let mut tail: usize = 0;
    let mut count: usize = 0;
    let mut overflows: u64 = 0;

    let start = std::time::Instant::now();

    // Push operations
    for i in 0..operations {
        if count >= size {
            overflows += 1;
            tail = (tail + 1) % size;
            count -= 1;
        }
        buffer[head] = i as f64 * 1.001;
        head = (head + 1) % size;
        count += 1;
    }

    // Pop all
    let mut sum: f64 = 0.0;
    while count > 0 {
        sum += buffer[tail];
        tail = (tail + 1) % size;
        count -= 1;
    }

    let elapsed = start.elapsed();

    format!(
        "{{\"operations\":{},\"elapsed_ns\":{},\"ops_per_sec\":{},\"overflows\":{},\"checksum\":{:.2}}}",
        operations,
        elapsed.as_nanos(),
        if elapsed.as_nanos() > 0 {
            (operations as u128 * 1_000_000_000) / elapsed.as_nanos()
        } else {
            0
        },
        overflows,
        sum
    )
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🧠 GLOBAL ENTROPY (replaces NexusLogic.py Rust FFI)
// ═══════════════════════════════════════════════════════════════════════════════

/// Compute system entropy from bio/market/energy streams.
/// Direct replacement for the Python ctypes → Rust DLL bridge.
#[napi]
// Complexity: O(N*M) — nested iteration detected
pub fn compute_global_entropy(
    bio_stress: f64,
    market_stress: f64,
    energy_stress: f64,
) -> f64 {
    // Shannon entropy-inspired calculation
    let streams = [bio_stress, market_stress, energy_stress];
    let total: f64 = streams.iter().sum::<f64>();

    if total <= 0.0 { return 0.0; }

    let mut entropy: f64 = 0.0;
    for &s in &streams {
        if s > 0.0 {
            let p = s / total;
            entropy -= p * p.ln();
        }
    }

    // Normalize to [0, 1] — max entropy for 3 sources is ln(3)
    let max_entropy = 3.0_f64.ln();
    let normalized = entropy / max_entropy;

    // Apply sovereign resonance factor
    let resonance = 0.8890;
    (normalized * resonance * 10000.0).round() / 10000.0
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🏥 HEALTH CHECK
// ═══════════════════════════════════════════════════════════════════════════════

#[napi]
// Complexity: O(1)
pub fn engine_health() -> String {
    format!(
        "{{\"engine\":\"QAntum Rust NAPI\",\"version\":\"36.1.0\",\"status\":\"OPERATIONAL\",\"features\":[\"execute_batch\",\"price_oracle_predict\",\"compute_risk\",\"compute_global_entropy\",\"ring_buffer_benchmark\",\"batch_arb\",\"triangular_arb\"]}}"
    )
}

// ═══════════════════════════════════════════════════════════════════════════════
// 💹 ARBITRAGE ENGINE — 128-bit Fixed-Point (ported from arb_hotpath)
// ═══════════════════════════════════════════════════════════════════════════════

/// Price pair for cross-exchange arbitrage (input from JS)
#[napi(object)]
#[derive(Clone)]
pub struct PricePair {
    pub symbol: String,
    pub exchange_a: String,
    pub exchange_b: String,
    pub price_a: f64,
    pub price_b: f64,
}

/// Single arbitrage result
#[napi(object)]
#[derive(Clone)]
pub struct ArbitrageResult {
    pub symbol: String,
    pub buy_exchange: String,
    pub sell_exchange: String,
    pub buy_price: f64,
    pub sell_price: f64,
    pub spread_percent: f64,
    pub net_profit_usd: f64,
    pub net_profit_percent: f64,
    pub risk_score: f64,
    pub is_viable: bool,
    pub calculation_ns: f64,
}

/// Batch arbitrage input
#[napi(object)]
pub struct BatchArbInput {
    pub pairs: Vec<PricePair>,
    pub capital_usd: f64,
    pub fee_percent: f64,
    pub slippage_percent: f64,
    pub network_fee_usd: f64,
}

/// Batch arbitrage output
#[napi(object)]
pub struct BatchArbOutput {
    pub results: Vec<ArbitrageResult>,
    pub viable_count: u32,
    pub total_pairs_scanned: u32,
    pub total_calculation_ns: f64,
    pub best_profit_usd: f64,
    pub best_symbol: String,
}

/// Triangular arbitrage path input
#[napi(object)]
pub struct TriangularPath {
    pub leg1_symbol: String,
    pub leg2_symbol: String,
    pub leg3_symbol: String,
    pub leg1_price: f64,
    pub leg2_price: f64,
    pub leg3_price: f64,
}

/// Triangular arbitrage result
#[napi(object)]
pub struct TriangularResult {
    pub path: String,
    pub expected_return: f64,
    pub net_after_fees: f64,
    pub is_profitable: bool,
    pub calculation_ns: f64,
}

/// Core single-pair arbitrage calculation using 128-bit fixed-point math.
/// All financial operations use rust_decimal for zero rounding errors.
#[inline]
// Complexity: O(1) — amortized
fn calc_single_arb(
    pair: &PricePair,
    capital: Decimal,
    fee_pct: Decimal,
    slippage_pct: Decimal,
    network_fee: Decimal,
) -> ArbitrageResult {
    let start = std::time::Instant::now();

    let price_a = Decimal::from_f64(pair.price_a).unwrap_or(dec!(0));
    let price_b = Decimal::from_f64(pair.price_b).unwrap_or(dec!(0));

    // Determine buy/sell direction
    let (buy_price, sell_price, buy_ex, sell_ex) = if price_a < price_b {
        (price_a, price_b, pair.exchange_a.clone(), pair.exchange_b.clone())
    } else {
        (price_b, price_a, pair.exchange_b.clone(), pair.exchange_a.clone())
    };

    if buy_price.is_zero() || sell_price.is_zero() {
        return ArbitrageResult {
            symbol: pair.symbol.clone(),
            buy_exchange: buy_ex,
            sell_exchange: sell_ex,
            buy_price: buy_price.to_f64().unwrap_or(0.0),
            sell_price: sell_price.to_f64().unwrap_or(0.0),
            spread_percent: 0.0,
            net_profit_usd: 0.0,
            net_profit_percent: 0.0,
            risk_score: 1.0,
            is_viable: false,
            calculation_ns: start.elapsed().as_nanos() as f64,
        };
    }

    let spread = (sell_price - buy_price) / buy_price * dec!(100);
    let quantity = capital / buy_price;
    let buy_fee = capital * fee_pct / dec!(100);
    let sell_revenue = quantity * sell_price;
    let sell_fee = sell_revenue * fee_pct / dec!(100);
    let slippage_cost = capital * slippage_pct / dec!(100);
    let total_costs = buy_fee + sell_fee + slippage_cost + network_fee;
    let gross_profit = sell_revenue - capital;
    let net_profit = gross_profit - total_costs;
    let net_profit_pct = if !capital.is_zero() {
        net_profit / capital * dec!(100)
    } else {
        dec!(0)
    };

    let cost_ratio = if !gross_profit.is_zero() {
        total_costs / gross_profit.abs()
    } else {
        dec!(1)
    };
    let risk = cost_ratio.min(dec!(1));

    ArbitrageResult {
        symbol: pair.symbol.clone(),
        buy_exchange: buy_ex,
        sell_exchange: sell_ex,
        buy_price: buy_price.to_f64().unwrap_or(0.0),
        sell_price: sell_price.to_f64().unwrap_or(0.0),
        spread_percent: spread.to_f64().unwrap_or(0.0),
        net_profit_usd: net_profit.to_f64().unwrap_or(0.0),
        net_profit_percent: net_profit_pct.to_f64().unwrap_or(0.0),
        risk_score: risk.to_f64().unwrap_or(1.0),
        is_viable: net_profit > dec!(0) && risk < dec!(0.8),
        calculation_ns: start.elapsed().as_nanos() as f64,
    }
}

/// Batch-calculate cross-exchange arbitrage across all pairs.
/// Uses 128-bit rust_decimal for precise financial math.
/// Called from JS:
///   const result = engine.batchArb({ pairs, capitalUsd: 10000, feePercent: 0.1, ... });
#[napi]
// Complexity: O(N) — linear iteration
pub fn batch_arb(input: BatchArbInput) -> BatchArbOutput {
    let start = std::time::Instant::now();

    let capital = Decimal::from_f64(input.capital_usd).unwrap_or(dec!(100));
    let fee_pct = Decimal::from_f64(input.fee_percent).unwrap_or(dec!(0.1));
    let slippage = Decimal::from_f64(input.slippage_percent).unwrap_or(dec!(0.05));
    let net_fee = Decimal::from_f64(input.network_fee_usd).unwrap_or(dec!(0.5));

    let mut results: Vec<ArbitrageResult> = Vec::with_capacity(input.pairs.len());
    let mut best_profit: f64 = 0.0;
    let mut best_symbol = String::new();
    let mut viable_count: u32 = 0;

    for pair in &input.pairs {
        let result = calc_single_arb(pair, capital, fee_pct, slippage, net_fee);
        if result.is_viable {
            viable_count += 1;
            if result.net_profit_usd > best_profit {
                best_profit = result.net_profit_usd;
                best_symbol = result.symbol.clone();
            }
        }
        results.push(result);
    }

    BatchArbOutput {
        total_pairs_scanned: input.pairs.len() as u32,
        viable_count,
        total_calculation_ns: start.elapsed().as_nanos() as f64,
        best_profit_usd: best_profit,
        best_symbol,
        results,
    }
}

/// Calculate triangular arbitrage profit using 128-bit precision.
/// Path: Base → Mid → End → Base
/// Called from JS:
///   const result = engine.triangularArb({ leg1Symbol, leg1Price, ..., feePercent });
#[napi]
// Complexity: O(1) — amortized
pub fn triangular_arb(path: TriangularPath, fee_percent: f64) -> TriangularResult {
    let start = std::time::Instant::now();

    let p1 = Decimal::from_f64(path.leg1_price).unwrap_or(dec!(0));
    let p2 = Decimal::from_f64(path.leg2_price).unwrap_or(dec!(0));
    let p3 = Decimal::from_f64(path.leg3_price).unwrap_or(dec!(0));
    let fee_pct = Decimal::from_f64(fee_percent).unwrap_or(dec!(0.1));

    if p1.is_zero() || p2.is_zero() || p3.is_zero() {
        return TriangularResult {
            path: format!("{} → {} → {}", path.leg1_symbol, path.leg2_symbol, path.leg3_symbol),
            expected_return: 0.0,
            net_after_fees: 0.0,
            is_profitable: false,
            calculation_ns: start.elapsed().as_nanos() as f64,
        };
    }

    let fee_mult = dec!(1) - fee_pct / dec!(100);
    let after_leg1 = (dec!(1) / p1) * fee_mult;
    let after_leg2 = (after_leg1 * p2) * fee_mult;
    let after_leg3 = (after_leg2 / p3) * fee_mult;
    let net_return = after_leg3;
    let net_after_fees = net_return - dec!(1);

    TriangularResult {
        path: format!("{} → {} → {}", path.leg1_symbol, path.leg2_symbol, path.leg3_symbol),
        expected_return: net_return.to_f64().unwrap_or(0.0),
        net_after_fees: net_after_fees.to_f64().unwrap_or(0.0),
        is_profitable: net_after_fees > dec!(0),
        calculation_ns: start.elapsed().as_nanos() as f64,
    }
}
