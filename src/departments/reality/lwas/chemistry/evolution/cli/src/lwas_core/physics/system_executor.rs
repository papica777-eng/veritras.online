/// system_executor — Qantum Rust Module
/// Path: src/departments/reality/lwas/chemistry/evolution/cli/src/lwas_core/physics/system_executor.rs
/// Auto-documented by BrutalDocEngine v2.1

use crate::lwas_core::omega::smt_engine::{SystemIntent, LogicalVerifier};
use crate::lwas_core::omega::synapse::{SynapticArbitrator, DecisionContext};
use super::vsh_gate::VshGate;
use super::sentinel_link::SentinelLeash;
use thiserror::Error;
use std::sync::OnceLock;

static SENTINEL_LEASH: OnceLock<SentinelLeash> = OnceLock::new();

#[derive(Error, Debug)]
pub enum ExecutionError {
    #[error("Logic Verification Failed: {0:?}")]
    LogicViolation(Vec<String>),
    #[error("IO Error: {0}")]
    IoError(#[from] std::io::Error),
    #[error("Invalid Action: {0}")]
    InvalidAction(String),
    #[error("VSH Gate Error: {0}")]
    VshGateError(#[from] anyhow::Error),
    #[error("Synaptic Arbitrage Failed: {0}")]
    ArbitrageRefusal(String),
    #[error("SYSTEM LOCKDOWN: Sentinel Leash Verification Failed.")]
    SystemLockdown,
}

pub struct SystemExecutor;

impl SystemExecutor {
    // Complexity: O(1)
    pub fn get_leash() -> &'static SentinelLeash {
        SENTINEL_LEASH.get_or_init(SentinelLeash::new)
    }

    // Complexity: O(1)
    pub fn execute(intent: SystemIntent) -> Result<(), ExecutionError> {
        // 0. Leash Verification (The First Gate)
        // If the Leash is revoked, we refuse all execution.
        let leash = Self::get_leash();
        if leash.heartbeat().is_err() {
            return Err(ExecutionError::SystemLockdown);
        }

        // 1. Verify Logic (Mind checks Body)
        let proof = LogicalVerifier::verify(&intent);
        if !proof.is_valid {
            return Err(ExecutionError::LogicViolation(proof.axioms_violated));
        }

        // 2. Actuate via VSH Gate (The Silent Shell)
        VshGate::pass_through(intent)?;

        Ok(())
    }

    /// Ingests a signal, runs it through Synaptic Arbitrage, validates it, and executes if profitable.
    // Complexity: O(1)
    pub fn ingest_and_execute(context: DecisionContext) -> Result<(), ExecutionError> {
        println!("🧠 [SYNAPSE] Evaluating Signal: {:?}", context);
        
        // 1. Synaptic Arbitrage
        let decision = SynapticArbitrator::evaluate(&context);
        
        if !decision.is_executable {
            return Err(ExecutionError::ArbitrageRefusal(decision.reasoning));
        }

        println!("⚡ [SYNAPSE] Signal Accepted. Reasoning: {}", decision.reasoning);

        // 2. Construct SystemIntent based on the decision
        // (In a real system, the decision would contain specific parameters. Here we infer.)
        let intent = SystemIntent {
            operation: context.operation_type,
            target: Some("manifested_value.dat".to_string()), // Simulation target
            payload: Some(format!("Confirmed Value: {}", context.signal_strength)),
        };

        // 3. Hand off to standard execution pipeline (SMT -> Gate)
        Self::execute(intent)?;

        Ok(())
    }
}
