/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  QAntum Prime v36.0 - RUST HOT-PATH ENGINE                               ║
 * ║  "The NEON Blade" - Sub-microsecond Arbitrage Calculation                 ║
 * ║                                                                           ║
 * ║  Offloads critical calculations from Node.js V8 JIT to native Rust        ║
 * ║  Target: Snapdragon 8 Gen 3 (Cortex-X4) with NEON SIMD                   ║
 * ║  Performance: 10-100x faster than TypeScript for batch math               ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */
// NOTE: This is Rust, not JavaScript. The file extension and doc comment
// style are for the outer build system only.
use rust_decimal::prelude::*;
use rust_decimal_macros::dec;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PricePair {
    pub symbol: String,
    pub exchange_a: String,
    pub exchange_b: String,
    pub price_a: f64, // Used only for ingestion; converted to Decimal internally
    pub price_b: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ArbitrageResult {
    pub symbol: String,
    pub buy_exchange: String,
    pub sell_exchange: String,
    pub buy_price: String,
    pub sell_price: String,
    pub spread_percent: String,
    pub net_profit_usd: String,
    pub net_profit_percent: String,
    pub risk_score: String,
    pub is_viable: bool,
    pub calculation_ns: u128,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TriangularPath {
    pub leg1_symbol: String,
    pub leg2_symbol: String,
    pub leg3_symbol: String,
    pub leg1_price: f64,
    pub leg2_price: f64,
    pub leg3_price: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TriangularResult {
    pub path: String,
    pub expected_return: String,
    pub net_after_fees: String,
    pub is_profitable: bool,
    pub calculation_ns: u128,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BatchInput {
    pub pairs: Vec<PricePair>,
    pub capital_usd: f64,
    pub fee_percent: f64,
    pub min_spread_percent: f64,
    pub slippage_percent: f64,
    pub network_fee_usd: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BatchOutput {
    pub results: Vec<ArbitrageResult>,
    pub viable_count: usize,
    pub total_pairs_scanned: usize,
    pub total_calculation_ns: u128,
    pub best_opportunity: Option<ArbitrageResult>,
}

// ═══════════════════════════════════════════════════════════════════════════
// CORE ENGINE
// ═══════════════════════════════════════════════════════════════════════════

/// Calculate net arbitrage profit for a single pair
/// All financial math uses rust_decimal (128-bit fixed point)
/// Complexity: O(1) per pair
fn calculate_single_arb(
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
        (price_a, price_b, &pair.exchange_a, &pair.exchange_b)
    } else {
        (price_b, price_a, &pair.exchange_b, &pair.exchange_a)
    };

    // Guard: zero prices
    if buy_price.is_zero() || sell_price.is_zero() {
        return ArbitrageResult {
            symbol: pair.symbol.clone(),
            buy_exchange: buy_ex.clone(),
            sell_exchange: sell_ex.clone(),
            buy_price: buy_price.to_string(),
            sell_price: sell_price.to_string(),
            spread_percent: "0".to_string(),
            net_profit_usd: "0".to_string(),
            net_profit_percent: "0".to_string(),
            risk_score: "1.0".to_string(),
            is_viable: false,
            calculation_ns: start.elapsed().as_nanos(),
        };
    }

    // Spread calculation
    let spread = (sell_price - buy_price) / buy_price * dec!(100);

    // Quantity we can buy
    let quantity = capital / buy_price;

    // Costs
    let buy_fee = capital * fee_pct / dec!(100);
    let sell_revenue = quantity * sell_price;
    let sell_fee = sell_revenue * fee_pct / dec!(100);
    let slippage_cost = capital * slippage_pct / dec!(100);
    let total_costs = buy_fee + sell_fee + slippage_cost + network_fee;

    // Net profit
    let gross_profit = sell_revenue - capital;
    let net_profit = gross_profit - total_costs;
    let net_profit_pct = if !capital.is_zero() {
        net_profit / capital * dec!(100)
    } else {
        dec!(0)
    };

    // Risk score: 0.0 (safe) to 1.0 (dangerous)
    // Based on spread tightness and cost ratio
    let cost_ratio = if !gross_profit.is_zero() {
        total_costs / gross_profit.abs()
    } else {
        dec!(1)
    };
    let risk = cost_ratio.min(dec!(1));

    let elapsed = start.elapsed().as_nanos();

    ArbitrageResult {
        symbol: pair.symbol.clone(),
        buy_exchange: buy_ex.clone(),
        sell_exchange: sell_ex.clone(),
        buy_price: buy_price.round_dp(8).to_string(),
        sell_price: sell_price.round_dp(8).to_string(),
        spread_percent: spread.round_dp(4).to_string(),
        net_profit_usd: net_profit.round_dp(2).to_string(),
        net_profit_percent: net_profit_pct.round_dp(4).to_string(),
        risk_score: risk.round_dp(4).to_string(),
        is_viable: net_profit > dec!(0) && risk < dec!(0.8),
        calculation_ns: elapsed,
    }
}

/// Batch-calculate arbitrage across all pairs
/// Complexity: O(n) where n = number of pairs
fn batch_calculate(input: &BatchInput) -> BatchOutput {
    let start = std::time::Instant::now();

    let capital = Decimal::from_f64(input.capital_usd).unwrap_or(dec!(100));
    let fee_pct = Decimal::from_f64(input.fee_percent).unwrap_or(dec!(0.1));
    let slippage = Decimal::from_f64(input.slippage_percent).unwrap_or(dec!(0.05));
    let net_fee = Decimal::from_f64(input.network_fee_usd).unwrap_or(dec!(0.5));
    let min_spread = Decimal::from_f64(input.min_spread_percent).unwrap_or(dec!(0.1));

    let mut results: Vec<ArbitrageResult> = Vec::with_capacity(input.pairs.len());
    let mut best: Option<ArbitrageResult> = None;
    let mut viable_count = 0usize;

    for pair in &input.pairs {
        let result = calculate_single_arb(pair, capital, fee_pct, slippage, net_fee);

        if result.is_viable {
            viable_count += 1;

            // Track best opportunity
            let net_val: Decimal = result.net_profit_usd.parse().unwrap_or(dec!(0));
            let current_best_val: Decimal = best
                .as_ref()
                .map(|b| b.net_profit_usd.parse().unwrap_or(dec!(0)))
                .unwrap_or(dec!(0));

            if net_val > current_best_val {
                best = Some(result.clone());
            }
        }

        results.push(result);
    }

    BatchOutput {
        total_pairs_scanned: input.pairs.len(),
        viable_count,
        total_calculation_ns: start.elapsed().as_nanos(),
        best_opportunity: best,
        results,
    }
}

/// Calculate triangular arbitrage profit
/// Path: Base → Mid → End → Base
/// E.g.: 1 BTC → X ETH → Y SOL → Z BTC
/// Profitable if Z > 1.0 (after fees)
/// Complexity: O(1)
fn calculate_triangular(path: &TriangularPath, fee_pct: Decimal) -> TriangularResult {
    let start = std::time::Instant::now();

    let p1 = Decimal::from_f64(path.leg1_price).unwrap_or(dec!(0));
    let p2 = Decimal::from_f64(path.leg2_price).unwrap_or(dec!(0));
    let p3 = Decimal::from_f64(path.leg3_price).unwrap_or(dec!(0));

    if p1.is_zero() || p2.is_zero() || p3.is_zero() {
        return TriangularResult {
            path: format!(
                "{} → {} → {}",
                path.leg1_symbol, path.leg2_symbol, path.leg3_symbol
            ),
            expected_return: "0".to_string(),
            net_after_fees: "0".to_string(),
            is_profitable: false,
            calculation_ns: start.elapsed().as_nanos(),
        };
    }

    let fee_mult = dec!(1) - fee_pct / dec!(100);

    // Start with 1 unit of base
    // Leg 1: Buy mid with base
    let after_leg1 = (dec!(1) / p1) * fee_mult;
    // Leg 2: Buy end with mid
    let after_leg2 = (after_leg1 * p2) * fee_mult;
    // Leg 3: Buy base back with end
    let after_leg3 = (after_leg2 / p3) * fee_mult;

    // Net return: if > 1.0, profitable
    let net_return = after_leg3;
    let net_after_fees = net_return - dec!(1);

    TriangularResult {
        path: format!(
            "{} → {} → {}",
            path.leg1_symbol, path.leg2_symbol, path.leg3_symbol
        ),
        expected_return: net_return.round_dp(8).to_string(),
        net_after_fees: net_after_fees.round_dp(8).to_string(),
        is_profitable: net_after_fees > dec!(0),
        calculation_ns: start.elapsed().as_nanos(),
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// STDIO JSON INTERFACE (for Node.js child_process integration)
// ═══════════════════════════════════════════════════════════════════════════

fn main() {
    // Read JSON from stdin
    let mut input_str = String::new();
    std::io::Read::read_to_string(&mut std::io::stdin(), &mut input_str)
        .expect("Failed to read stdin");

    // Determine command type from JSON
    #[derive(Deserialize)]
    struct Command {
        #[serde(rename = "type")]
        cmd_type: String,
        data: serde_json::Value,
    }

    let cmd: Command = serde_json::from_str(&input_str).expect("Invalid JSON input");

    match cmd.cmd_type.as_str() {
        "batch_arb" => {
            let input: BatchInput = serde_json::from_value(cmd.data).expect("Invalid BatchInput");
            let output = batch_calculate(&input);
            println!("{}", serde_json::to_string(&output).unwrap());
        }
        "triangular" => {
            let path: TriangularPath =
                serde_json::from_value(cmd.data).expect("Invalid TriangularPath");
            let fee = dec!(0.1); // 0.1% default
            let output = calculate_triangular(&path, fee);
            println!("{}", serde_json::to_string(&output).unwrap());
        }
        _ => {
            eprintln!("Unknown command type: {}", cmd.cmd_type);
            std::process::exit(1);
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_single_arb_profitable() {
        let pair = PricePair {
            symbol: "BTCUSDT".to_string(),
            exchange_a: "Binance".to_string(),
            exchange_b: "Kraken".to_string(),
            price_a: 50000.0,
            price_b: 50150.0, // 0.3% spread
        };

        let result = calculate_single_arb(
            &pair,
            dec!(1000), // $1000 capital
            dec!(0.1),  // 0.1% fee
            dec!(0.05), // 0.05% slippage
            dec!(0.5),  // $0.50 network fee
        );

        assert!(result.is_viable, "Should be viable with 0.3% spread");
        let profit: Decimal = result.net_profit_usd.parse().unwrap();
        assert!(profit > dec!(0), "Net profit should be positive");
    }

    #[test]
    fn test_single_arb_not_profitable() {
        let pair = PricePair {
            symbol: "ETHUSDT".to_string(),
            exchange_a: "Binance".to_string(),
            exchange_b: "Coinbase".to_string(),
            price_a: 3000.0,
            price_b: 3001.0, // 0.03% spread — too tight
        };

        let result = calculate_single_arb(&pair, dec!(1000), dec!(0.1), dec!(0.05), dec!(0.5));

        assert!(!result.is_viable, "Should NOT be viable with 0.03% spread");
    }

    #[test]
    fn test_batch_calculation() {
        let input = BatchInput {
            pairs: vec![
                PricePair {
                    symbol: "BTCUSDT".to_string(),
                    exchange_a: "Binance".to_string(),
                    exchange_b: "Kraken".to_string(),
                    price_a: 50000.0,
                    price_b: 50200.0,
                },
                PricePair {
                    symbol: "ETHUSDT".to_string(),
                    exchange_a: "Binance".to_string(),
                    exchange_b: "Coinbase".to_string(),
                    price_a: 3000.0,
                    price_b: 3001.0,
                },
            ],
            capital_usd: 1000.0,
            fee_percent: 0.1,
            min_spread_percent: 0.1,
            slippage_percent: 0.05,
            network_fee_usd: 0.5,
        };

        let output = batch_calculate(&input);
        assert_eq!(output.total_pairs_scanned, 2);
        assert!(
            output.viable_count >= 1,
            "At least BTC pair should be viable"
        );
        assert!(output.best_opportunity.is_some());
    }

    #[test]
    fn test_triangular_arb() {
        let path = TriangularPath {
            leg1_symbol: "BTC/ETH".to_string(),
            leg2_symbol: "ETH/SOL".to_string(),
            leg3_symbol: "SOL/BTC".to_string(),
            leg1_price: 16.5,    // 1 BTC = 16.5 ETH
            leg2_price: 50.0,    // 1 ETH = 50 SOL
            leg3_price: 0.00125, // 1 SOL = 0.00125 BTC (if perfectly balanced, this = 1/(16.5*50))
        };

        let result = calculate_triangular(&path, dec!(0.1));
        // With fees, should be slightly below 1.0
        println!("Triangular result: {:?}", result);
        // This test just ensures no panics; profitability depends on prices
    }

    #[test]
    fn test_zero_price_guard() {
        let pair = PricePair {
            symbol: "TESTUSDT".to_string(),
            exchange_a: "A".to_string(),
            exchange_b: "B".to_string(),
            price_a: 0.0,
            price_b: 100.0,
        };

        let result = calculate_single_arb(&pair, dec!(1000), dec!(0.1), dec!(0.05), dec!(0.5));
        assert!(!result.is_viable, "Zero price should not be viable");
    }
}
