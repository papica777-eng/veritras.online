/// synapse — Qantum Rust Module
/// Path: src/departments/reality/lwas/chemistry/evolution/cli/src/lwas_core/omega/synapse.rs
/// Auto-documented by BrutalDocEngine v2.1

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DecisionContext {
    pub signal_strength: f64,
    pub resource_cost: f64,
    pub risk_factor: f64,
    pub operation_type: String,
}

#[derive(Debug, Clone)]
pub struct ConfidenceScore {
    pub score: f64, // 0.0 to 1.0
    pub is_executable: bool,
    pub reasoning: String,
}

pub struct SynapticArbitrator;

impl SynapticArbitrator {
    /// Evaluates a context and returns a confidence score.
    /// This represents the "Intelligence" layer making a decision.
    // Complexity: O(N)
    pub fn evaluate(context: &DecisionContext) -> ConfidenceScore {
        // Bare Metal Logic:
        // Score = (Signal / Cost) * (1.0 - Risk)
        // This is a simplified arbitrage formula.
        
        if context.resource_cost <= 0.0 {
            return ConfidenceScore {
                score: 0.0,
                is_executable: false,
                reasoning: "Infinite Value Error: Zero Cost".to_string(),
            };
        }

        let raw_score = (context.signal_strength / context.resource_cost) * (1.0 - context.risk_factor);
        
        // Normalize score to 0.0 - 1.0 range vaguely, or just treat > 1.0 as high confidence.
        // Let's cap at 1.0 for the struct definition, but arbitrage can exceed 1.0 ROI.
        // For "Confidence", we want probability of success.
        
        // Let's redefine: Confidence is derived from the raw ROI.
        // If ROI > 1.5 (50% profit), Confidence is High.
        
        let confidence = if raw_score > 1.0 { 1.0 } else { raw_score };
        let is_executable = raw_score > 1.2; // Threshold: must have 20% margin

        ConfidenceScore {
            score: confidence,
            is_executable,
            reasoning: format!("Calculated ROI factor: {:.4}. Threshold: 1.2", raw_score),
        }
    }
}
