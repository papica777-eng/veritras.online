//! ═══════════════════════════════════════════════════════════════════════════════
//! 💹 CYBERFORTRESS TRADING - Rust Core
//! ═══════════════════════════════════════════════════════════════════════════════
//!
//! Ultra-low-latency HFT engine with OBI physics and order book management.
//!
//! Target: Sub-millisecond execution
//!
//! @author Dimitar Prodromov / QAntum Empire

#![deny(clippy::all)]

#[macro_use]
extern crate napi_derive;

pub mod physics;
pub mod orderbook;
pub mod execution;
pub mod connectors;

use napi::bindgen_prelude::*;
use rust_decimal::Decimal;
use std::str::FromStr;

/// Market data tick
#[napi(object)]
pub struct MarketTick {
    pub symbol: String,
    pub bid: f64,
    pub ask: f64,
    pub bid_size: f64,
    pub ask_size: f64,
    pub timestamp: i64,
}

/// Trading signal from Rust core
#[napi(object)]
pub struct TradingSignal {
    pub symbol: String,
    pub action: String,  // BUY, SELL, HOLD
    pub confidence: f64,
    pub obi_score: f64,
    pub momentum: f64,
    pub price_target: f64,
    pub stop_loss: f64,
    pub take_profit: f64,
}

/// Execution result
#[napi(object)]
pub struct ExecutionResult {
    pub success: bool,
    pub order_id: String,
    pub filled_price: f64,
    pub filled_quantity: f64,
    pub latency_us: u32,
    pub error: Option<String>,
}

/// Initialize CyberFortress trading engine
#[napi]
pub fn init_cyberfortress() -> String {
    println!("╔════════════════════════════════════════════════════════════╗");
    println!("║   💹 CYBERFORTRESS TRADING - HFT Engine                    ║");
    println!("║   Sub-millisecond execution | OBI Physics                  ║");
    println!("╚════════════════════════════════════════════════════════════╝");
    
    "💹 CYBERFORTRESS: ARMED".to_string()
}

/// Calculate Order Book Imbalance (OBI)
#[napi]
pub fn calculate_obi(bid_volume: f64, ask_volume: f64) -> f64 {
    physics::obi::calculate_obi(bid_volume, ask_volume)
}

/// Process market tick and generate signal
#[napi]
pub fn process_tick(tick: MarketTick) -> TradingSignal {
    let spread = tick.ask - tick.bid;
    let mid_price = (tick.bid + tick.ask) / 2.0;
    
    // Calculate OBI
    let obi = physics::obi::calculate_obi(tick.bid_size, tick.ask_size);
    
    // Calculate momentum (simplified)
    let momentum = obi * 0.8;
    
    // Determine action based on OBI
    let (action, confidence) = if obi > 0.3 {
        ("BUY".to_string(), obi.abs())
    } else if obi < -0.3 {
        ("SELL".to_string(), obi.abs())
    } else {
        ("HOLD".to_string(), 0.5)
    };
    
    // Calculate targets
    let atr = spread * 10.0; // Simplified ATR
    let price_target = if action == "BUY" {
        mid_price + atr * 2.0
    } else {
        mid_price - atr * 2.0
    };
    
    TradingSignal {
        symbol: tick.symbol,
        action,
        confidence,
        obi_score: obi,
        momentum,
        price_target,
        stop_loss: mid_price - atr,
        take_profit: mid_price + atr * 3.0,
    }
}

/// Execute trade (paper mode)
#[napi]
pub async fn execute_trade(
    symbol: String,
    side: String,
    quantity: f64,
    price: Option<f64>,
) -> Result<ExecutionResult> {
    let start = std::time::Instant::now();
    
    // In real implementation, this would connect to exchange
    let order_id = uuid::Uuid::new_v4().to_string();
    let filled_price = price.unwrap_or(0.0);
    
    let latency = start.elapsed().as_micros() as u32;
    
    println!(
        "💹 [EXECUTE] {} {} {} @ {} ({}µs)",
        side, quantity, symbol, filled_price, latency
    );
    
    Ok(ExecutionResult {
        success: true,
        order_id,
        filled_price,
        filled_quantity: quantity,
        latency_us: latency,
        error: None,
    })
}

/// Get order book snapshot
#[napi]
pub fn get_orderbook_snapshot(symbol: String, depth: u32) -> String {
    // Return JSON representation of order book
    serde_json::json!({
        "symbol": symbol,
        "bids": [],
        "asks": [],
        "depth": depth,
        "timestamp": chrono::Utc::now().timestamp_millis()
    }).to_string()
}
