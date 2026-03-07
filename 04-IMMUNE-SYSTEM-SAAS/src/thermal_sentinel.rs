// lwas_core/src/thermal_sentinel.rs
// THE FEVER PROTOCOL: Thermal-Logic Coupling
// "If the system does not feel the heat, it is not alive."

use crate::neural_hive::NeuralHive;
use std::sync::Arc;
use tokio::sync::RwLock;

pub struct SovereignSentinel {
    // Simulated CPU temperature
    simulated_temp: Arc<RwLock<f64>>,
}

impl SovereignSentinel {
    pub fn new() -> Self {
        Self {
            simulated_temp: Arc::new(RwLock::new(50.0)),
        }
    }

    // In a real scenario, this would read from sysfs/hwmon
    pub async fn read_cpu_temp(&self) -> f64 {
        let temp = *self.simulated_temp.read().await;
        // Fluctuate temp slightly for realism
        let noise = (rand::random::<f64>() - 0.5) * 2.0;
        (temp + noise).clamp(30.0, 100.0)
    }

    pub async fn set_simulated_temp(&self, temp: f64) {
        let mut t = self.simulated_temp.write().await;
        *t = temp;
    }

    pub async fn regulate_metabolism(&self, _hive: &NeuralHive) {
        let cpu_temp = self.read_cpu_temp().await;
        let mut metabolic_modifier = 1.0;

        if cpu_temp > 85.0 {
            println!(
                "🌡️ THERMAL ALERT: CPU at {:.1}°C. Initiating Logic Compression...",
                cpu_temp
            );
            // Slow down evolution to cool hardware
            metabolic_modifier = 0.618;
        } else if cpu_temp < 60.0 {
            // Optimal temp - force evolution
            // println!("❄️ THERMAL OPTIMAL: CPU at {:.1}°C. Accelerating Evolution...", cpu_temp);
            metabolic_modifier = 1.618;
        } else {
            // println!("🔥 THERMAL NOMINAL: CPU at {:.1}°C.", cpu_temp);
        }

        // Apply modifier to the Hive's metabolic system (conceptual simulation)
        // Since MetabolicSystem struct doesn't expose a dynamic rate yet, we log the intent.
        if metabolic_modifier != 1.0 {
            println!(
                "[SENTINEL] Adjusting Hive Metabolic Rate by factor {:.3}",
                metabolic_modifier
            );
        }
    }
}
