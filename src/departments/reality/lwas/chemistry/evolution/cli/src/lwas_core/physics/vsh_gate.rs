/// vsh_gate — Qantum Rust Module
/// Path: src/departments/reality/lwas/chemistry/evolution/cli/src/lwas_core/physics/vsh_gate.rs
/// Auto-documented by BrutalDocEngine v2.1

use crate::lwas_core::omega::smt_engine::SystemIntent;
use super::memory_shrouding::PolymorphicBuffer;
use anyhow::{Result, Context};
use std::fs;
use std::path::Path;

/// The VSH Gate is the bridge between the Mind (Aeterna/Intent) and the Physical Hardware.
/// It utilizes Memory Shrouding to keep intentions hidden until the last possible microsecond.
pub struct VshGate;

impl VshGate {
    // Complexity: O(N*M) — nested iteration
    pub fn pass_through(intent: SystemIntent) -> Result<()> {
        match intent.operation.as_str() {
            "CREATE_FILE" => {
                // Shroud the path and content immediately
                let path_buffer = PolymorphicBuffer::new(intent.target.as_deref().unwrap_or_default().as_bytes());
                let content_buffer = PolymorphicBuffer::new(intent.payload.as_deref().unwrap_or_default().as_bytes());
                
                Self::actuate_creation(path_buffer, content_buffer)?;
            }
            "GHOST_PROTOCOL" => {
                // Special operation for "Module Zero"
                // Expects target to be the file to "hide"
                 let path_buffer = PolymorphicBuffer::new(intent.target.as_deref().unwrap_or_default().as_bytes());
                 Self::actuate_ghost(path_buffer)?;
            }
            "GENESIS" => {
                 // No physical actuation needed for Genesis event itself, it's a metadata event
            }
            _ => {
                // For now, other operations are passed through or ignored safely
            }
        }
        Ok(())
    }

    // Complexity: O(N)
    fn actuate_creation(path: PolymorphicBuffer, content: PolymorphicBuffer) -> Result<()> {
        // Unlock only for the syscall
        let path_str = path.unlock_as_string().context("Failed to unlock path")?;
        let content_bytes = content.unlock();

        let path_obj = Path::new(&path_str);
        if let Some(parent) = path_obj.parent() {
            if !parent.exists() {
                fs::create_dir_all(parent)?;
            }
        }

        fs::write(path_obj, content_bytes)?;
        // Immediately drop the unlocked strings (Rust does this at end of scope)
        println!("✅ [VSH GATE] Materialized: {}", path_str);
        Ok(())
    }
    
    // Complexity: O(1)
    fn actuate_ghost(path: PolymorphicBuffer) -> Result<()> {
        let path_str = path.unlock_as_string().context("Failed to unlock path")?;
        let path_obj = Path::new(&path_str);
        
        if path_obj.exists() {
             // Simulating "hiding" by renaming to a dotfile (Basic Ghost Protocol)
             let file_name = path_obj.file_name().unwrap_or_default();
             let mut new_name = String::from(".");
             new_name.push_str(file_name.to_str().unwrap_or_default());
             
             let parent = path_obj.parent().unwrap_or_else(|| Path::new("."));
             let new_path = parent.join(new_name);
             
             fs::rename(path_obj, &new_path)?;
             println!("👻 [VSH GATE] Ghost Protocol: '{}' vanished to '{:?}'", path_str, new_path);
        } else {
             println!("⚠️ [VSH GATE] Ghost Protocol: Target '{}' not found.", path_str);
        }
        
        Ok(())
    }
}
