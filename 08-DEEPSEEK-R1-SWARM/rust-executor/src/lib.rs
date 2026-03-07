#![deny(clippy::all)]

//! ═══════════════════════════════════════════════════════════════════════════
//! 🦀 DEEPSEEK-R1-SWARM - Rust NAPI-RS Executor Bridge
//! ═══════════════════════════════════════════════════════════════════════════

use napi::bindgen_prelude::*;
use napi_derive::napi;
use rayon::prelude::*;
use std::collections::hash_map::DefaultHasher;
use std::hash::{Hash, Hasher};
use std::sync::{Arc, Mutex};
use std::time::Instant;

// ═══════════════════════════════════════════════════════════════
// NAPI Exported Structs (for TypeScript)
// ═══════════════════════════════════════════════════════════════

#[napi(object)]
#[derive(Debug, Clone)]
pub struct TestCase {
    pub id: String,
    pub name: String,
    pub code: String,
    pub timeout_ms: u32,
}

#[napi(object)]
#[derive(Debug, Clone)]
pub struct ExecutionResult {
    pub test_id: String,
    pub success: bool,
    pub duration_ms: u32,
    pub output: String,
    pub error: Option<String>,
}

#[napi(object)]
#[derive(Debug, Clone)]
pub struct ExecutorMetrics {
    pub total_executed: u32,
    pub successes: u32,
    pub failures: u32,
    pub avg_duration_ms: u32,
    pub throughput_per_sec: f64,
}

// ═══════════════════════════════════════════════════════════════
// Core Internal Metrics Mutex
// ═══════════════════════════════════════════════════════════════

#[derive(Debug, Clone)]
struct InnerMetrics {
    pub total_executed: u32,
    pub successes: u32,
    pub failures: u32,
    pub total_duration_ms: u64,
    pub throughput_per_sec: f64,
}

// ═══════════════════════════════════════════════════════════════
// NAPI Exported Class
// ═══════════════════════════════════════════════════════════════

#[napi]
pub struct SwarmExecutor {
    _max_parallel: u32,
    metrics: Arc<Mutex<InnerMetrics>>,
}

#[napi]
impl SwarmExecutor {
    /// Complexity: O(1)
    #[napi(constructor)]
    pub fn new(max_parallel: u32) -> Self {
        Self {
            _max_parallel: max_parallel,
            metrics: Arc::new(Mutex::new(InnerMetrics {
                total_executed: 0,
                successes: 0,
                failures: 0,
                total_duration_ms: 0,
                throughput_per_sec: 0.0,
            })),
        }
    }

    /// Complexity: O(N) where N = tests.len() (parallelized via Rayon)
    #[napi]
    pub fn execute_parallel(&self, env: Env, tests: Vec<TestCase>) -> Result<Vec<ExecutionResult>> {
        let start = Instant::now();
        let count = tests.len() as u32;

        if count == 0 {
            return Ok(vec![]);
        }

        // Rayon parallel iterator
        let results: Vec<ExecutionResult> = tests
            .into_par_iter()
            .map(|test| self.execute_single(&test))
            .collect();

        let elapsed_secs = start.elapsed().as_secs_f64();
        let elapsed_ms = start.elapsed().as_millis() as u64;

        // Await lock
        let mut m = self
            .metrics
            .lock()
            .map_err(|e| Error::new(Status::GenericFailure, format!("Lock error: {}", e)))?;

        let successes = results.iter().filter(|r| r.success).count() as u32;
        let failures = count - successes;

        m.total_executed += count;
        m.successes += successes;
        m.failures += failures;
        m.total_duration_ms += elapsed_ms;

        // Smooth throughput estimation
        m.throughput_per_sec = (count as f64) / elapsed_secs.max(0.001);

        Ok(results)
    }

    /// Complexity: O(1)
    #[napi]
    pub fn get_metrics(&self) -> Result<ExecutorMetrics> {
        let m = self
            .metrics
            .lock()
            .map_err(|e| Error::new(Status::GenericFailure, format!("Lock error: {}", e)))?;

        let avg_duration_ms = if m.total_executed > 0 {
            (m.total_duration_ms / m.total_executed as u64) as u32
        } else {
            0
        };

        Ok(ExecutorMetrics {
            total_executed: m.total_executed,
            successes: m.successes,
            failures: m.failures,
            avg_duration_ms,
            throughput_per_sec: m.throughput_per_sec,
        })
    }

    // ═══════════════════════════════════════════════════════════════
    // Internal Helpers
    // ═══════════════════════════════════════════════════════════════

    fn execute_single(&self, test: &TestCase) -> ExecutionResult {
        let start = Instant::now();

        // 🔴 FOR NOW: This is a deterministic mock.
        // In production, this would spawn a sandboxed process to evaluate code.
        let success = self.mock_run_code(&test.code);
        let duration_ms = start.elapsed().as_millis() as u32;

        ExecutionResult {
            test_id: test.id.clone(),
            success,
            duration_ms,
            output: format!("Execution {}", if success { "SUCCEEDED" } else { "FAILED" }),
            error: if success {
                None
            } else {
                Some("Assertion failed/Syntax error".to_string())
            },
        }
    }

    fn mock_run_code(&self, code: &str) -> bool {
        // Generate deterministic response based on hash
        let mut hasher = DefaultHasher::new();
        code.hash(&mut hasher);
        let hash = hasher.finish();

        // 85% success rate for generated code
        hash % 100 < 85
    }
}
