"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                                                   ║
 * ║   🔮 THE PREDICTION MATRIX - BARREL EXPORT                                                       ║
 * ║   "Unified Interface for Time-Aware Selector Intelligence"                                       ║
 * ║                                                                                                   ║
 * ║   QAntum v15.1: THE CHRONOS ENGINE                                                          ║
 * ║   Optimized for: AMD Ryzen 7000 Series (Zen 4 architecture)                                      ║
 * ║                                                                                                   ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════════════════╝
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.predictionMatrix = exports.PredictionMatrix = exports.rlBridge = exports.ReinforcementLearningBridge = exports.nStepSimulator = exports.NStepLookAheadSimulator = exports.domEvolutionTracker = exports.DOMEvolutionTracker = void 0;
// ═══════════════════════════════════════════════════════════════════════════════════════
// 🧬 DOM EVOLUTION TRACKER
// ═══════════════════════════════════════════════════════════════════════════════════════
var dom_evolution_tracker_1 = require("./dom-evolution-tracker");
Object.defineProperty(exports, "DOMEvolutionTracker", { enumerable: true, get: function () { return dom_evolution_tracker_1.DOMEvolutionTracker; } });
Object.defineProperty(exports, "domEvolutionTracker", { enumerable: true, get: function () { return dom_evolution_tracker_1.domEvolutionTracker; } });
// ═══════════════════════════════════════════════════════════════════════════════════════
// 🔮 N-STEP LOOK-AHEAD SIMULATOR
// ═══════════════════════════════════════════════════════════════════════════════════════
var n_step_simulator_1 = require("./n-step-simulator");
Object.defineProperty(exports, "NStepLookAheadSimulator", { enumerable: true, get: function () { return n_step_simulator_1.NStepLookAheadSimulator; } });
Object.defineProperty(exports, "nStepSimulator", { enumerable: true, get: function () { return n_step_simulator_1.nStepSimulator; } });
// ═══════════════════════════════════════════════════════════════════════════════════════
// 🤖 REINFORCEMENT LEARNING BRIDGE
// ═══════════════════════════════════════════════════════════════════════════════════════
var reinforcement_learning_bridge_1 = require("./reinforcement-learning-bridge");
Object.defineProperty(exports, "ReinforcementLearningBridge", { enumerable: true, get: function () { return reinforcement_learning_bridge_1.ReinforcementLearningBridge; } });
Object.defineProperty(exports, "rlBridge", { enumerable: true, get: function () { return reinforcement_learning_bridge_1.rlBridge; } });
// ═══════════════════════════════════════════════════════════════════════════════════════
// 🎯 UNIFIED PREDICTION MATRIX FACADE
// ═══════════════════════════════════════════════════════════════════════════════════════
const dom_evolution_tracker_2 = require("./dom-evolution-tracker");
const n_step_simulator_2 = require("./n-step-simulator");
const reinforcement_learning_bridge_2 = require("./reinforcement-learning-bridge");
const license_validator_1 = require("../licensing/license-validator");
// ═══════════════════════════════════════════════════════════════════════════════════════
// 🔐 LICENSE PROTECTION - DO NOT REMOVE
// ═══════════════════════════════════════════════════════════════════════════════════════
const LICENSE_ERROR = `
╔═══════════════════════════════════════════════════════════════════════════════════╗
║  ⛔ PREDICTION MATRIX REQUIRES A PRO LICENSE                                      ║
║                                                                                    ║
║  This feature is protected. To unlock:                                            ║
║  1. Get your license at: https://QAntum.lemonsqueezy.com                      ║
║  2. Set environment variable: QAntum_LICENSE=your-key                        ║
║                                                                                    ║
║  Pricing: $29/month - Includes all AI features + priority support                 ║
╚═══════════════════════════════════════════════════════════════════════════════════╝
`;
/**
 * 🔮 THE PREDICTION MATRIX
 *
 * Unified facade for all prediction capabilities.
 * This is the main entry point for the Chronos Engine to interact
 * with the prediction system.
 *
 * ⚠️ REQUIRES PRO LICENSE - Get yours at https://QAntum.lemonsqueezy.com
 *
 * @example
 * ```typescript
 * import { PredictionMatrix } from './prediction-matrix';
 *
 * const matrix = new PredictionMatrix();
 *
 * // Get best selector for an element
 // SAFETY: async operation — wrap in try-catch for production resilience
 * const result = await matrix.predictBestSelector(element, context);
 * console.log(result.selector, result.confidence);
 *
 * // Report outcome for learning
 * matrix.reportOutcome(element, result.selector, context, { success: true, ... });
 * ```
 */
class PredictionMatrix {
    evolutionTracker;
    simulator;
    rlBridge;
    isInitialized;
    license = null;
    licenseChecked = false;
    constructor(config = {}) {
        this.evolutionTracker = config.evolutionTracker || dom_evolution_tracker_2.domEvolutionTracker;
        this.simulator = config.simulator || n_step_simulator_2.nStepSimulator;
        this.rlBridge = config.rlBridge || reinforcement_learning_bridge_2.rlBridge;
        this.isInitialized = false;
        // Store license key for later validation
        if (config.licenseKey) {
            process.env.QAntum_LICENSE = config.licenseKey;
        }
    }
    /**
     * 🔐 Validate license before using premium features
     */
    // Complexity: O(N)
    async validateLicense() {
        if (this.licenseChecked)
            return;
        // Development mode bypass (for testing only)
        if (process.env.QAntum_DEV === 'true' || process.env.NODE_ENV === 'development') {
            console.log('⚠️ DEV MODE: License check bypassed');
            this.license = { valid: true, tier: 'pro', features: ['prediction-matrix', 'reinforcement-learning'] };
            this.licenseChecked = true;
            return;
        }
        const licenseKey = process.env.QAntum_LICENSE || '';
        // SAFETY: async operation — wrap in try-catch for production resilience
        this.license = await license_validator_1.licenseValidator.validateLicense(licenseKey);
        this.licenseChecked = true;
        if (!license_validator_1.licenseValidator.hasPredictionMatrix(this.license)) {
            console.error(LICENSE_ERROR);
            throw new Error('⛔ Prediction Matrix requires a Pro license. Get one at https://QAntum.lemonsqueezy.com');
        }
        console.log(`✅ License validated: ${this.license.tier.toUpperCase()} tier`);
    }
    /**
     * Initialize the Prediction Matrix
     */
    // Complexity: O(1)
    async initialize() {
        if (this.isInitialized)
            return;
        // 🔐 LICENSE CHECK - REQUIRED
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.validateLicense();
        console.log('╔═══════════════════════════════════════════════════════════════╗');
        console.log('║          🔮 THE PREDICTION MATRIX - INITIALIZING             ║');
        console.log('╚═══════════════════════════════════════════════════════════════╝');
        // All components are initialized in their constructors
        this.isInitialized = true;
        console.log('   ✅ DOM Evolution Tracker ready');
        console.log('   ✅ N-Step Look-Ahead Simulator ready');
        console.log('   ✅ Reinforcement Learning Bridge ready');
        console.log('   🎯 Prediction Matrix ONLINE');
    }
    /**
     * 🎯 MAIN ENTRY POINT
     *
     * Predict the best selector for a given element.
     * This combines all three subsystems:
     * 1. Historical evolution data
     * 2. Future state simulation
     * 3. Reinforcement learning optimization
     */
    // Complexity: O(N log N) — sort
    async predictBestSelector(element, context) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.initialize();
        // Step 1: Update evolution tracking
        const history = this.evolutionTracker.getHistory(element.trackingId);
        // Step 2: Run simulation
        const simulation = this.simulator.simulateFutureState(element, context, history);
        // Step 3: Get RL recommendation
        const rlResult = this.rlBridge.selectBestSelector(element, context);
        // Step 4: Combine insights
        const finalSelector = this.combineRecommendations(simulation.winnerSelector, rlResult.selector, element, context);
        // Build alternatives list
        const alternatives = element.selectors
            .filter(s => s.value !== finalSelector.value)
            .map(s => ({
            selector: s,
            score: simulation.survivalMatrix.survivalRates.get(s.value) || 0
        }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 3);
        // Generate reasoning
        const reasoning = this.generateReasoning(finalSelector, rlResult.strategy, simulation, history);
        return {
            selector: finalSelector,
            confidence: Math.max(rlResult.confidence, simulation.survivalMatrix.survivalRates.get(finalSelector.value) || 0),
            strategy: rlResult.strategy,
            alternatives,
            reasoning
        };
    }
    /**
     * 📊 Report action outcome for learning
     */
    // Complexity: O(1)
    reportOutcome(element, selector, context, outcome) {
        // Update RL
        this.rlBridge.updateFromOutcome(element, selector, context, outcome);
        // Update evolution tracker if mutation detected
        if (outcome.mutationDetected) {
            this.evolutionTracker.recordMutation(element.trackingId, {
                type: outcome.mutationType || 'ATTRIBUTE_CHANGED',
                timestamp: Date.now(),
                before: outcome.beforeValue || '',
                after: outcome.afterValue || '',
                affectedSelectors: [selector.type]
            });
        }
        // Update stability score
        this.evolutionTracker.updateSelectorStability(element.trackingId, selector.value, outcome.success);
    }
    /**
     * 📈 Get system statistics
     */
    // Complexity: O(1)
    getStatistics() {
        return {
            evolutionTracker: this.evolutionTracker.getStatistics(),
            simulator: this.simulator.getStatistics(),
            rlBridge: this.rlBridge.getStatistics()
        };
    }
    /**
     * 💾 Force save all data
     */
    // Complexity: O(1)
    async save() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.evolutionTracker.save();
        // RL bridge auto-saves
    }
    /**
     * 🧹 Cleanup on shutdown
     */
    // Complexity: O(1)
    dispose() {
        this.evolutionTracker.dispose();
        this.rlBridge.dispose();
    }
    // ═══════════════════════════════════════════════════════════════════════════════
    // 🔧 PRIVATE METHODS
    // ═══════════════════════════════════════════════════════════════════════════════
    // Complexity: O(N) — linear scan
    combineRecommendations(simulationWinner, rlWinner, element, context) {
        // If both agree, return that
        if (simulationWinner.value === rlWinner.value) {
            return simulationWinner;
        }
        // Weighted decision based on confidence
        const simScore = simulationWinner.survivalProbability;
        const rlEntries = this.rlBridge.getTopSelectors(element, context, 10);
        const rlScore = rlEntries.find(e => e.selector === rlWinner.value)?.successRate || 0.5;
        // Prefer RL if high success rate, otherwise trust simulation
        if (rlScore > 0.8) {
            return rlWinner;
        }
        if (simScore > rlScore + 0.2) {
            return simulationWinner;
        }
        return rlWinner;
    }
    // Complexity: O(N) — linear scan
    generateReasoning(selector, strategy, simulation, history) {
        const parts = [];
        parts.push(`Selected ${selector.type} selector: "${selector.value}"`);
        parts.push(`Strategy: ${strategy.toUpperCase()}`);
        parts.push(`Survival probability: ${(selector.survivalProbability * 100).toFixed(1)}%`);
        if (simulation.scenarios.length > 0) {
            const survivedScenarios = simulation.scenarios.filter(s => s.survivingSelectors.includes(selector.value)).length;
            parts.push(`Survives ${survivedScenarios}/${simulation.scenarios.length} future scenarios`);
        }
        if (history && history.mutations?.length > 0) {
            parts.push(`Historical mutations observed: ${history.mutations.length}`);
        }
        return parts.join(' | ');
    }
}
exports.PredictionMatrix = PredictionMatrix;
// Export default singleton instance
exports.predictionMatrix = new PredictionMatrix();
