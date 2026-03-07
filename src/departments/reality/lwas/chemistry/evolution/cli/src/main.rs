/// main — Qantum Rust Module
/// Path: src/departments/reality/lwas/chemistry/evolution/cli/src/main.rs
/// Auto-documented by BrutalDocEngine v2.1

use clap::{Parser, Subcommand};
use serde::{Deserialize, Serialize};
use std::process::Command;
use anyhow::{Context, Result};

pub mod lwas_core;

use lwas_core::physics::system_executor::SystemExecutor;
use lwas_core::omega::smt_engine::SystemIntent;
use lwas_core::physics::sentinel::AeternaSentinel;
use lwas_core::omega::synapse::DecisionContext;
use lwas_core::omega::noetic::NoeticNexus;
use lwas_core::omega::vector_memory::{SovereignVectorIndex, VectorSyncCore};
use lwas_core::omega::architect::AeternaArchitect;
use lwas_core::physics::sentinel_link::SentinelLeash;
use std::path::{Path, PathBuf};
use std::sync::Arc;
use std::sync::OnceLock;

static VECTOR_MEMORY: OnceLock<Arc<SovereignVectorIndex>> = OnceLock::new();

#[derive(Parser)]
#[command(name = "qantum")]
#[command(about = "The Qantum Sovereign Cognitive Agent", long_about = None)]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    /// Manifest a new reality based on intent
    Genesis {
        #[arg(short, long)]
        intent: String,
    },
    /// Unify Empire Orchestrator and Eternal Guardian (Start Sentinel)
    Unify {
        #[arg(short, long, default_value = ".")]
        path: PathBuf,
    },
    /// Ingest a signal into the Synaptic Arbitrator
    Ingest {
        #[arg(long)]
        signal: f64,
        #[arg(long)]
        cost: f64,
        #[arg(long, default_value_t = 0.0)]
        risk: f64,
        #[arg(long, default_value = "CREATE_FILE")]
        op: String,
    },
    /// Consult the Neural Network (Noetic Nexus) for logic verification
    Consult {
        #[arg(long)]
        query: String,
    },
    /// Wake Up the Aeterna Vector Core (Semantic Ingestion)
    WakeUp {
        #[arg(long, default_value = ".")]
        root: String,
    },
    /// Verify Sentinel License Status
    Verify {
        #[arg(long)]
        simulate_kill: bool,
    },
}

#[derive(Serialize, Deserialize, Debug)]
struct ManifestationResponse {
    success: bool,
    reality_id: Option<String>,
    actions: Vec<String>,
    message: String,
}

#[derive(Serialize, Deserialize, Debug)]
struct Action {
    #[serde(rename = "type")]
    action_type: String,
    path: Option<String>,
    content: Option<String>,
}

// Complexity: O(N*M) — nested iteration
fn main() -> Result<()> {
    let cli = Cli::parse();

    match &cli.command {
        Commands::Genesis { intent } => {
            println!("🌌 QANTUM GENESIS INITIATED");
            println!("👁️  Observing Intent: {}", intent);

            // Special Handling for Architect Missions
            if intent.trim().starts_with("RENAME") {
                println!("🏛️  Detected Architect Mission Protocol.");
                // Hardcoded target for safety in this iteration
                let target = Path::new("apps/cli/src/playground.rs");
                
                // Fallback if running from apps/cli directly
                let target = if target.exists() {
                     target
                } else {
                     Path::new("src/playground.rs")
                };
                
                if let Err(e) = AeternaArchitect::execute_mission(intent, target) {
                    eprintln!("❌ Architect Mission Failed: {}", e);
                }
                return Ok(());
            }

            // 1. Call the Mind
            let response = bridge_to_mind("GENESIS", intent)?;

            if response.success {
                println!("✨ Reality Manifested: {}", response.reality_id.as_deref().unwrap_or("Unknown"));
                println!("📜 Message: {}", response.message);

                // 2. Actuate Body
                for action_json in response.actions {
                    if let Err(e) = execute_action(&action_json) {
                        eprintln!("❌ Action Failed: {}", e);
                    }
                }
            } else {
                eprintln!("❌ Failed to manifest: {}", response.message);
            }
        }
        Commands::Unify { path } => {
            println!("⚔️  UNIFY COMMAND EXECUTED.");
            println!("🛡️  Initializing Aeterna Sentinel on: {:?}", path);
            println!("🧠  Empire Orchestrator + Eternal Guardian = AETERNA KERNEL");
            
            let sentinel = AeternaSentinel::new(vec![path.clone()]);
            
            // In a real daemon, this would spawn a thread. 
            // For this CLI interaction, we block to show it working.
            if let Err(e) = sentinel.watch_and_heal() {
                eprintln!("❌ Sentinel Failure: {}", e);
            }
        }
        Commands::Ingest { signal, cost, risk, op } => {
            let context = DecisionContext {
                signal_strength: *signal,
                resource_cost: *cost,
                risk_factor: *risk,
                operation_type: op.clone(),
            };

            if let Err(e) = SystemExecutor::ingest_and_execute(context) {
                eprintln!("❌ Ingest Refused: {}", e);
            } else {
                println!("✅ Ingest Successful.");
            }
        }
        Commands::Consult { query } => {
            println!("🧠 [NOETIC] Consulting DeepSeek via Aeterna Nexus...");
            println!("💭 Raw Thought: \"{}\"", query);

            let memory_ref = VECTOR_MEMORY.get().cloned();
            
            if let Some(wisdom) = NoeticNexus::process_thought(&query, memory_ref) {
                println!("✨ [VERIFIED WISDOM] logic_proof=VALID axioms={}", wisdom.axioms_verified);
                println!("   Action Plan: {:?}", wisdom.thought.raw_content);
                println!("   Confidence: {:.2}%", wisdom.thought.confidence * 100.0);
            } else {
                eprintln!("❌ [NOETIC] Hallucination Detected. All hypotheses failed Logic Proof.");
            }
        }
        Commands::WakeUp { root } => {
            println!("👁️  [WAKE UP] Aeterna Vector Core initializing...");
            
            let index = Arc::new(SovereignVectorIndex::new());
            // Store globally for this session
            let _ = VECTOR_MEMORY.set(index.clone());
            
            let sync_core = VectorSyncCore::new(index);
            sync_core.sync_empire(&root);
            
            println!("⚡ [SYSTEM] Singularity Bridge: ONLINE.");
        }
        Commands::Verify { simulate_kill } => {
            println!("🛡️  [SENTINEL] Verifying Hardware Identity...");
            let hardware_id = SentinelLeash::get_hardware_dna();
            println!("🆔 HWID: {}", hardware_id);
            
            let leash = SystemExecutor::get_leash();
            
            if *simulate_kill {
                 println!("⚠️  [TEST MODE] Simulating License Revocation...");
                 leash.trigger_revoke();
            }

            match leash.heartbeat() {
                Ok(_) => println!("✅ LICENSE: ACTIVE. System is Sovereign."),
                Err(e) => eprintln!("❌ LICENSE: REVOKED. {}", e),
            }
        }
    }

    Ok(())
}

// Complexity: O(N) — linear scan
fn bridge_to_mind(command: &str, payload: &str) -> Result<ManifestationResponse> {
    // Determine the path to the TS Mind
    // In this repo structure, we are at qantum-sovereign/apps/cli
    // The mind is at qantum-sovereign/packages/psyche/dist/index.js

    // We assume the binary is run from the repo root or we find the path relatively
    let mind_path = Path::new("packages/psyche/dist/index.js");

    // For robustness in this sandbox, we'll try to find it relative to current dir if needed
    let mind_path = if mind_path.exists() {
        mind_path
    } else {
        // Fallback for when running from apps/cli
        Path::new("../../packages/psyche/dist/index.js")
    };

    if !mind_path.exists() {
        anyhow::bail!("Cannot find the Mind at {:?}", mind_path);
    }

    let request = serde_json::json!({
        "command": command,
        "payload": payload
    });

    let output = Command::new("node")
        .arg(mind_path)
        .arg(request.to_string())
        .output()
        .context("Failed to execute Mind process")?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        anyhow::bail!("Mind process failed: {}", stderr);
    }

    let stdout = String::from_utf8_lossy(&output.stdout);
    // The Mind might print logs before the JSON. We need to parse the last valid JSON line or the whole output?
    // Our TS code prints logs then JSON.
    // Simple heuristic: Find the last line that looks like JSON.

    let json_str = stdout.lines()
        .rev()
        .find(|line| line.trim().starts_with('{'))
        .ok_or_else(|| anyhow::anyhow!("No JSON response from Mind. Output: {}", stdout))?;

    let response: ManifestationResponse = serde_json::from_str(json_str)
        .context("Failed to parse Mind response")?;

    Ok(response)
}

// Complexity: O(1)
fn execute_action(action_json: &str) -> Result<()> {
    let action: Action = serde_json::from_str(action_json)?;

    // Map legacy Action to SystemIntent
    let intent = SystemIntent {
        operation: action.action_type,
        target: action.path,
        payload: action.content,
    };

    // Execute via SystemExecutor (which performs SMT verification)
    SystemExecutor::execute(intent).context("System Execution Failed")?;

    Ok(())
}
