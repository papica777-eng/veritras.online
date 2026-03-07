/// 🧬 SELF-EVOLVING TRAITS
/// Allows the system to hot-swap trading logic based on VSH feedback.

pub trait TradingTrait: Send + Sync {
    // Complexity: O(N)
    fn name(&self) -> String;
    // Complexity: O(N)
    fn evaluate(&self, price: f64, obi: f64) -> String; // Returns "BUY", "SELL", "HOLD"
}

// STRATEGY 1: MOMENTUM SNIPER
pub struct MomentumSniper;
impl TradingTrait for MomentumSniper {
    // Complexity: O(1)
    fn name(&self) -> String { "MomentumSniper".to_string() }
    // Complexity: O(1)
    fn evaluate(&self, _price: f64, obi: f64) -> String {
        if obi > 0.5 { "BUY".to_string() } else { "SELL".to_string() }
    }
}

// STRATEGY 2: MEAN REVERSION GUARD
pub struct MeanReversionGuard;
impl TradingTrait for MeanReversionGuard {
    // Complexity: O(1)
    fn name(&self) -> String { "MeanReversionGuard".to_string() }
    // Complexity: O(1)
    fn evaluate(&self, _price: f64, obi: f64) -> String {
        if obi > 0.8 { "SELL".to_string() } else { "HOLD".to_string() } // Contrarian
    }
}

// THE AMNIOTIC ENGINE (Strategy Manager)
pub struct AmnioticEngine {
    current_strategy: Box<dyn TradingTrait>,
}

impl AmnioticEngine {
    // Complexity: O(1)
    pub fn new() -> Self {
        Self {
            current_strategy: Box::new(MomentumSniper),
        }
    }

    // Complexity: O(N)
    pub fn evolve(&mut self, market_regime: &str) {
        if market_regime == "HIGH_VOLATILITY" {
            println!("🧬 [AMNIOTIC] Evolving to MeanReversionGuard due to volatility.");
            self.current_strategy = Box::new(MeanReversionGuard);
        } else {
            println!("🧬 [AMNIOTIC] Evolving to MomentumSniper for trend following.");
            self.current_strategy = Box::new(MomentumSniper);
        }
    }

    // Complexity: O(1)
    pub fn execute(&self, price: f64, obi: f64) -> String {
        self.current_strategy.evaluate(price, obi)
    }
}
