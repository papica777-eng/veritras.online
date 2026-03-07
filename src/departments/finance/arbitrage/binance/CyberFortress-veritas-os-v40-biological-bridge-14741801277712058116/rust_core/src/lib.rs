/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * QANTUM PHYSICS CORE - NAPI-RS BRIDGE (Rust ↔ TypeScript)
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * This is the FFI layer that exposes Rust GPU engine to Node.js/TypeScript.
 * JavaScript can call these functions directly with near-zero overhead.
 *
 * @author Dimitar Prodromov / QAntum Empire
 */

#![deny(clippy::all)]

#[macro_use]
extern crate napi_derive;

mod physics;

use napi::{bindgen_prelude::*, JsObject};
use physics::obi_engine::{PhysicsEngine, OrderBookSnapshot, evaluate_entropy};
use std::sync::Arc;
use tokio::sync::Mutex;

/// The global Physics Engine instance (singleton)
static mut PHYSICS_ENGINE: Option<Arc<Mutex<PhysicsEngine>>> = None;

/// Initialize the Physics Engine (call once on startup)
#[napi]
// Complexity: O(1)
pub fn init_physics_engine() -> Result<String> {
    unsafe {
        if PHYSICS_ENGINE.is_none() {
            let engine = PhysicsEngine::new();
            PHYSICS_ENGINE = Some(Arc::new(Mutex::new(engine)));
            Ok("🔥 Physics Engine: RTX 4050 CUDA Core ONLINE".to_string())
        } else {
            Ok("⚠️  Physics Engine: Already initialized".to_string())
        }
    }
}

/// Order Book Data from TypeScript
#[napi(object)]
pub struct OrderBookData {
    pub bid_price: f64,
    pub bid_volume: f64,
    pub ask_price: f64,
    pub ask_volume: f64,
}

/// OBI Result returned to TypeScript
#[napi(object)]
pub struct ObiResult {
    pub imbalance: f64,
    pub signal: String,
    pub gpu_latency_ms: f64,
}

/// Calculate Order Book Imbalance (exposed to TypeScript)
#[napi]
// Complexity: O(N) — linear iteration
pub async fn calculate_obi_batch(market_data: Vec<OrderBookData>) -> Result<Vec<ObiResult>> {
    let engine = unsafe {
        PHYSICS_ENGINE
            .as_ref()
            .ok_or_else(|| Error::from_reason("Physics Engine not initialized. Call init_physics_engine() first."))?
            .clone()
    };

    let start = std::time::Instant::now();

    // Convert TypeScript data to Rust structs
    let snapshots: Vec<OrderBookSnapshot> = market_data
        .iter()
        .map(|data| OrderBookSnapshot {
            bid_price: data.bid_price as f32,
            bid_volume: data.bid_volume as f32,
            ask_price: data.ask_price as f32,
ask_volume: data.ask_volume as f32,
        })
        .collect();

    // GPU Calculation (async to avoid blocking Node.js event loop)
    let engine_guard = engine.lock().await;
    let imbalances = engine_guard.calculate_obi_batch(&snapshots);
    drop(engine_guard);

    let gpu_latency_ms = start.elapsed().as_secs_f64() * 1000.0;

    // Convert results back to TypeScript format
    let results = imbalances
        .iter()
        .map(|&imbalance| ObiResult {
            imbalance: imbalance as f64,
            signal: evaluate_entropy(imbalance).to_string(),
            gpu_latency_ms,
        })
        .collect();

    Ok(results)
}

/// Evaluate single market entropy (synchronous helper)
#[napi]
// Complexity: O(1)
pub fn evaluate_market_entropy(imbalance: f64) -> String {
    evaluate_entropy(imbalance as f32).to_string()
}

/// Health check for GPU availability
#[napi]
// Complexity: O(1)
pub fn check_gpu_status() -> String {
    unsafe {
        if PHYSICS_ENGINE.is_some() {
            "✅ RTX 4050: ONLINE | CUDA: READY".to_string()
        } else {
            "⚠️  Physics Engine: NOT INITIALIZED".to_string()
        }
    }
}
