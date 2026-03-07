"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                                                   ║
 * ║   🤖 REINFORCEMENT LEARNING BRIDGE                                                               ║
 * ║   "Teaching the AI to Choose the Immortal Selector Through Experience"                           ║
 * ║                                                                                                   ║
 * ║   Part of THE PREDICTION MATRIX - QAntum v15.1                                              ║
 * ║                                                                                                   ║
 * ║   Algorithm: Q-Learning + Thompson Sampling + Upper Confidence Bound                             ║
 * ║   Optimized for: AMD Ryzen 7000 Series (Zen 4 architecture)                                      ║
 * ║                                                                                                   ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════════════════╝
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.rlBridge = exports.ReinforcementLearningBridge = void 0;
const events_1 = require("events");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const n_step_simulator_1 = require("./n-step-simulator");
// ═══════════════════════════════════════════════════════════════════════════════════════
// 🎯 Q-LEARNING CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════════════
const DEFAULT_Q_CONFIG = {
    learningRate: 0.1, // α - How much new info overrides old (0.1 = 10%)
    discountFactor: 0.95, // γ - Future reward importance (0.95 = high)
    explorationRate: 0.2, // ε - Probability of random exploration
    minExplorationRate: 0.05, // Minimum ε after decay
    explorationDecay: 0.995, // How fast ε decreases
    batchSize: 32, // Experience replay batch size
    memorySize: 10000 // Max experiences to remember
};
// ═══════════════════════════════════════════════════════════════════════════════════════
// 📊 REWARD STRUCTURE
// ═══════════════════════════════════════════════════════════════════════════════════════
const REWARD_STRUCTURE = {
    // Positive rewards
    SELECTOR_FOUND: 10, // Selector successfully found element
    ACTION_SUCCEEDED: 15, // Complete action (click, type, etc.) succeeded
    NO_STALE_ELEMENT: 20, // No StaleElementReference after action
    FAST_FIND: 5, // Element found in < 100ms
    CONSISTENT_SUCCESS: 25, // Same selector worked 3+ times in row
    SURVIVED_UPDATE: 50, // Selector still works after page update
    // Negative rewards
    SELECTOR_NOT_FOUND: -15, // Element not found
    STALE_ELEMENT: -20, // StaleElementReferenceException
    ACTION_FAILED: -10, // Action threw error
    TIMEOUT: -25, // Waited too long
    SLOW_FIND: -5, // Element found but took > 1000ms
    FALLBACK_USED: -8, // Had to use fallback selector
    // Neutral/Learning
    MUTATION_DETECTED: 0, // Element changed (learning opportunity)
    NEW_SELECTOR_DISCOVERED: 5 // Found new valid selector
};
// ═══════════════════════════════════════════════════════════════════════════════════════
// 🤖 REINFORCEMENT LEARNING BRIDGE CLASS
// ═══════════════════════════════════════════════════════════════════════════════════════
class ReinforcementLearningBridge extends events_1.EventEmitter {
    qTable;
    config;
    experienceBuffer;
    nStepSimulator;
    currentExplorationRate;
    episodeCount;
    totalReward;
    policyGradients;
    persistencePath;
    isDirty;
    saveTimer;
    // Performance: Typed arrays for Ryzen optimization
    qValueBuffer;
    ucbBuffer;
    constructor(config = {}) {
        super();
        this.config = { ...DEFAULT_Q_CONFIG, ...config };
        this.qTable = new Map();
        this.experienceBuffer = [];
        this.nStepSimulator = n_step_simulator_1.nStepSimulator;
        this.currentExplorationRate = this.config.explorationRate;
        this.episodeCount = 0;
        this.totalReward = 0;
        this.policyGradients = new Map();
        this.persistencePath = path.join(process.cwd(), 'knowledge', 'q-learning.json');
        this.isDirty = false;
        this.saveTimer = null;
        // Pre-allocate typed arrays for SIMD operations
        this.qValueBuffer = new Float64Array(100); // Max 100 selectors per state
        this.ucbBuffer = new Float64Array(100);
        // Load existing Q-table
        this.loadQTable();
        // Auto-save every 60 seconds
        this.saveTimer = setInterval(() => this.saveQTable(), 60000);
        console.log('🤖 Reinforcement Learning Bridge initialized');
        console.log(`   📊 Learning Rate: ${this.config.learningRate}`);
        console.log(`   🎲 Exploration Rate: ${this.currentExplorationRate}`);
        console.log(`   💾 Q-Table Size: ${this.qTable.size}`);
    }
    // ═══════════════════════════════════════════════════════════════════════════════
    // 🎯 MAIN SELECTOR SELECTION
    // ═══════════════════════════════════════════════════════════════════════════════
    /**
     * Choose the best selector for an element based on Q-values and exploration
     * This is the main entry point for ActionExecutor integration
     */
    // Complexity: O(N)
    selectBestSelector(element, context) {
        const stateKey = this.generateStateKey(element, context);
        // Get all available selectors for this state
        const qEntries = this.qTable.get(stateKey) || [];
        // Decide: Explore or Exploit?
        const shouldExplore = Math.random() < this.currentExplorationRate;
        if (shouldExplore && element.selectors.length > 1) {
            // EXPLORATION: Try a less-used selector (Thompson Sampling)
            return this.exploreSelection(element, qEntries);
        }
        // EXPLOITATION: Use best known selector
        if (qEntries.length > 0) {
            return this.exploitSelection(element, qEntries, context);
        }
        // NO HISTORY: Use N-Step Simulator prediction
        return this.simulationSelection(element, context);
    }
    // ═══════════════════════════════════════════════════════════════════════════════
    // 🎲 EXPLORATION STRATEGY (Thompson Sampling)
    // ═══════════════════════════════════════════════════════════════════════════════
    // Complexity: O(N*M) — nested iteration
    exploreSelection(element, qEntries) {
        // Thompson Sampling: Sample from Beta distribution for each selector
        const sampledValues = [];
        for (const selector of element.selectors) {
            const entry = qEntries.find(e => e.selectorValue === selector.value);
            // Beta(successes + 1, failures + 1)
            const alpha = (entry?.successCount || 0) + 1;
            const beta = (entry?.failureCount || 0) + 1;
            const sample = this.sampleBeta(alpha, beta);
            sampledValues.push({ selector, sample });
        }
        // Sort by sampled value
        sampledValues.sort((a, b) => b.sample - a.sample);
        // Pick one from top 3 (introduce variety)
        const topCandidates = sampledValues.slice(0, Math.min(3, sampledValues.length));
        const chosen = topCandidates[Math.floor(Math.random() * topCandidates.length)];
        this.emit('exploration', {
            strategy: 'thompson_sampling',
            chosen: chosen.selector.value,
            candidates: topCandidates.map(c => c.selector.value)
        });
        return {
            selector: chosen.selector,
            strategy: 'explore',
            confidence: 0.3 + chosen.sample * 0.4 // Lower confidence during exploration
        };
    }
    // ═══════════════════════════════════════════════════════════════════════════════
    // 🏆 EXPLOITATION STRATEGY (UCB1 + Q-Values)
    // ═══════════════════════════════════════════════════════════════════════════════
    // Complexity: O(N*M) — nested iteration
    exploitSelection(element, qEntries, context) {
        // Calculate UCB1 score for each selector
        const totalVisits = qEntries.reduce((sum, e) => sum + e.visits, 0) + 1;
        const ucbScores = [];
        for (let i = 0; i < element.selectors.length && i < this.qValueBuffer.length; i++) {
            const selector = element.selectors[i];
            const entry = qEntries.find(e => e.selectorValue === selector.value);
            if (entry) {
                // UCB1 formula: Q(s,a) + c * sqrt(ln(N) / n(s,a))
                const exploitation = entry.qValue;
                const exploration = Math.sqrt(2 * Math.log(totalVisits) / (entry.visits + 1));
                const ucb = exploitation + 2 * exploration; // c = 2
                this.qValueBuffer[i] = entry.qValue;
                this.ucbBuffer[i] = ucb;
                ucbScores.push({ selector, score: ucb, qValue: entry.qValue });
            }
            else {
                // Never visited - high UCB (encourage exploration)
                ucbScores.push({ selector, score: 1000, qValue: 0 });
            }
        }
        // Sort by UCB score
        ucbScores.sort((a, b) => b.score - a.score);
        const winner = ucbScores[0];
        // Confidence based on visits and Q-value
        const entry = qEntries.find(e => e.selectorValue === winner.selector.value);
        const visitConfidence = Math.min(1, (entry?.visits || 0) / 100);
        const qConfidence = (winner.qValue + 100) / 200; // Normalize Q to [0,1]
        const confidence = 0.5 + (visitConfidence * 0.25) + (qConfidence * 0.25);
        this.emit('exploitation', {
            strategy: 'ucb1',
            chosen: winner.selector.value,
            qValue: winner.qValue,
            ucbScore: winner.score,
            confidence
        });
        return {
            selector: winner.selector,
            strategy: 'exploit',
            confidence: Math.min(0.99, confidence)
        };
    }
    // ═══════════════════════════════════════════════════════════════════════════════
    // 🔮 SIMULATION FALLBACK (N-Step Look-Ahead)
    // ═══════════════════════════════════════════════════════════════════════════════
    // Complexity: O(1) — lookup
    simulationSelection(element, context) {
        // Use N-Step Simulator when no Q-learning history exists
        const simulation = this.nStepSimulator.simulateFutureState(element, context);
        const confidence = simulation.survivalMatrix.survivalRates.get(simulation.winnerSelector.value) || 0.5;
        this.emit('simulation', {
            strategy: 'n_step_lookahead',
            chosen: simulation.winnerSelector.value,
            survivalRate: confidence
        });
        return {
            selector: simulation.winnerSelector,
            strategy: 'simulation',
            confidence
        };
    }
    // ═══════════════════════════════════════════════════════════════════════════════
    // 📈 Q-VALUE UPDATE (Bellman Equation)
    // ═══════════════════════════════════════════════════════════════════════════════
    /**
     * Update Q-value after action execution
     * Call this after every selector use (success or failure)
     */
    // Complexity: O(N*M) — nested iteration
    updateFromOutcome(element, selector, context, outcome) {
        const stateKey = this.generateStateKey(element, context);
        const reward = this.calculateReward(outcome);
        // Get or create Q-table entries for this state
        let entries = this.qTable.get(stateKey);
        if (!entries) {
            entries = [];
            this.qTable.set(stateKey, entries);
        }
        // Find or create entry for this selector
        let entry = entries.find(e => e.selectorValue === selector.value);
        if (!entry) {
            entry = {
                stateKey,
                selectorValue: selector.value,
                qValue: 0,
                visits: 0,
                lastUpdated: Date.now(),
                successCount: 0,
                failureCount: 0,
                averageResponseTime: 0
            };
            entries.push(entry);
        }
        // Q-Learning update (Bellman Equation)
        // Q(s,a) = Q(s,a) + α * (r + γ * max(Q(s',a')) - Q(s,a))
        const maxNextQ = this.getMaxQ(stateKey, selector);
        const tdError = reward + this.config.discountFactor * maxNextQ - entry.qValue;
        entry.qValue += this.config.learningRate * tdError;
        // Update statistics
        entry.visits++;
        entry.lastUpdated = Date.now();
        if (outcome.success) {
            entry.successCount++;
        }
        else {
            entry.failureCount++;
        }
        entry.averageResponseTime =
            (entry.averageResponseTime * (entry.visits - 1) + outcome.responseTimeMs) / entry.visits;
        // Add to experience buffer
        this.experienceBuffer.push(outcome);
        if (this.experienceBuffer.length > this.config.memorySize) {
            this.experienceBuffer.shift();
        }
        // Decay exploration rate
        this.currentExplorationRate = Math.max(this.config.minExplorationRate, this.currentExplorationRate * this.config.explorationDecay);
        // Track total reward
        this.totalReward += reward;
        this.isDirty = true;
        this.emit('qUpdate', {
            stateKey,
            selector: selector.value,
            oldQ: entry.qValue - this.config.learningRate * tdError,
            newQ: entry.qValue,
            reward,
            tdError,
            explorationRate: this.currentExplorationRate
        });
    }
    // ═══════════════════════════════════════════════════════════════════════════════
    // 🎁 REWARD CALCULATION
    // ═══════════════════════════════════════════════════════════════════════════════
    // Complexity: O(1)
    calculateReward(outcome) {
        let reward = 0;
        // Base success/failure
        if (outcome.success) {
            reward += REWARD_STRUCTURE.SELECTOR_FOUND;
            reward += REWARD_STRUCTURE.ACTION_SUCCEEDED;
        }
        else {
            if (outcome.error?.includes('StaleElement')) {
                reward += REWARD_STRUCTURE.STALE_ELEMENT;
            }
            else if (outcome.error?.includes('Timeout')) {
                reward += REWARD_STRUCTURE.TIMEOUT;
            }
            else {
                reward += REWARD_STRUCTURE.SELECTOR_NOT_FOUND;
            }
        }
        // Response time bonus/penalty
        if (outcome.responseTimeMs < 100) {
            reward += REWARD_STRUCTURE.FAST_FIND;
        }
        else if (outcome.responseTimeMs > 1000) {
            reward += REWARD_STRUCTURE.SLOW_FIND;
        }
        // Fallback penalty
        if (outcome.usedFallback) {
            reward += REWARD_STRUCTURE.FALLBACK_USED;
        }
        // Consistency bonus
        if (outcome.consecutiveSuccesses >= 3) {
            reward += REWARD_STRUCTURE.CONSISTENT_SUCCESS;
        }
        // Survival bonus
        if (outcome.survivedUpdate) {
            reward += REWARD_STRUCTURE.SURVIVED_UPDATE;
        }
        return reward;
    }
    // ═══════════════════════════════════════════════════════════════════════════════
    // 🔧 UTILITY METHODS
    // ═══════════════════════════════════════════════════════════════════════════════
    // Complexity: O(1)
    generateStateKey(element, context) {
        const hour = new Date().getHours();
        const timeOfDay = hour < 6 ? 'night' : hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
        const key = {
            domain: context.domain,
            pagePath: context.pagePath || '/',
            elementType: element.tagName.toLowerCase(),
            selectorType: element.selectors[0]?.type || 'ID',
            timeOfDay,
            dayOfWeek: new Date().getDay(),
            isDeploymentWindow: context.isDeploymentWindow,
            historicalSuccess: this.getHistoricalSuccessLevel(element)
        };
        return JSON.stringify(key);
    }
    // Complexity: O(1)
    getHistoricalSuccessLevel(element) {
        // Simplified - would check actual history
        if (element.selectors[0]?.stability > 0.8)
            return 'high';
        if (element.selectors[0]?.stability > 0.5)
            return 'medium';
        return 'low';
    }
    // Complexity: O(N) — linear scan
    getMaxQ(stateKey, excludeSelector) {
        const entries = this.qTable.get(stateKey) || [];
        const filtered = excludeSelector
            ? entries.filter(e => e.selectorValue !== excludeSelector.value)
            : entries;
        if (filtered.length === 0)
            return 0;
        return Math.max(...filtered.map(e => e.qValue));
    }
    // Complexity: O(1)
    sampleBeta(alpha, beta) {
        // Approximate Beta distribution sampling using gamma trick
        const gamma1 = this.sampleGamma(alpha);
        const gamma2 = this.sampleGamma(beta);
        return gamma1 / (gamma1 + gamma2);
    }
    // Complexity: O(N*M) — nested iteration
    sampleGamma(shape) {
        // Marsaglia and Tsang's method
        if (shape < 1) {
            return this.sampleGamma(shape + 1) * Math.pow(Math.random(), 1 / shape);
        }
        const d = shape - 1 / 3;
        const c = 1 / Math.sqrt(9 * d);
        while (true) {
            let x, v;
            do {
                x = this.standardNormal();
                v = 1 + c * x;
            } while (v <= 0);
            v = v * v * v;
            const u = Math.random();
            if (u < 1 - 0.0331 * (x * x) * (x * x)) {
                return d * v;
            }
            if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) {
                return d * v;
            }
        }
    }
    // Complexity: O(1)
    standardNormal() {
        // Box-Muller transform
        const u1 = Math.random();
        const u2 = Math.random();
        return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    }
    // ═══════════════════════════════════════════════════════════════════════════════
    // 💾 PERSISTENCE
    // ═══════════════════════════════════════════════════════════════════════════════
    // Complexity: O(1)
    loadQTable() {
        try {
            if (fs.existsSync(this.persistencePath)) {
                const data = JSON.parse(fs.readFileSync(this.persistencePath, 'utf-8'));
                this.qTable = new Map(Object.entries(data.qTable || {}));
                this.episodeCount = data.episodeCount || 0;
                this.totalReward = data.totalReward || 0;
                this.currentExplorationRate = data.explorationRate || this.config.explorationRate;
                console.log(`   💾 Loaded ${this.qTable.size} Q-table entries`);
            }
        }
        catch (error) {
            console.warn('⚠️ Could not load Q-table:', error);
        }
    }
    // Complexity: O(1)
    saveQTable() {
        if (!this.isDirty)
            return;
        try {
            const dir = path.dirname(this.persistencePath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            const data = {
                qTable: Object.fromEntries(this.qTable),
                episodeCount: this.episodeCount,
                totalReward: this.totalReward,
                explorationRate: this.currentExplorationRate,
                savedAt: new Date().toISOString()
            };
            fs.writeFileSync(this.persistencePath, JSON.stringify(data, null, 2));
            this.isDirty = false;
            this.emit('saved', { entries: this.qTable.size });
        }
        catch (error) {
            console.error('❌ Could not save Q-table:', error);
        }
    }
    // ═══════════════════════════════════════════════════════════════════════════════
    // 📊 PUBLIC API
    // ═══════════════════════════════════════════════════════════════════════════════
    /**
     * Get statistics about the RL system
     */
    // Complexity: O(1)
    getStatistics() {
        return {
            qTableSize: this.qTable.size,
            totalEpisodes: this.episodeCount,
            totalReward: this.totalReward,
            explorationRate: this.currentExplorationRate,
            experienceBufferSize: this.experienceBuffer.length
        };
    }
    /**
     * Get top selectors for a given state
     */
    // Complexity: O(N log N) — sort
    getTopSelectors(element, context, limit = 5) {
        const stateKey = this.generateStateKey(element, context);
        const entries = this.qTable.get(stateKey) || [];
        return entries
            .sort((a, b) => b.qValue - a.qValue)
            .slice(0, limit)
            .map(e => ({
            selector: e.selectorValue,
            qValue: e.qValue,
            successRate: e.successCount / (e.successCount + e.failureCount) || 0
        }));
    }
    /**
     * Force exploration rate
     */
    // Complexity: O(1)
    setExplorationRate(rate) {
        this.currentExplorationRate = Math.max(this.config.minExplorationRate, Math.min(1, rate));
    }
    /**
     * Reset Q-table (for testing)
     */
    // Complexity: O(1)
    reset() {
        this.qTable.clear();
        this.experienceBuffer = [];
        this.episodeCount = 0;
        this.totalReward = 0;
        this.currentExplorationRate = this.config.explorationRate;
        this.isDirty = true;
    }
    /**
     * Cleanup on shutdown
     */
    // Complexity: O(1)
    dispose() {
        if (this.saveTimer) {
            // Complexity: O(1)
            clearInterval(this.saveTimer);
        }
        this.saveQTable();
    }
}
exports.ReinforcementLearningBridge = ReinforcementLearningBridge;
// Export singleton instance
exports.rlBridge = new ReinforcementLearningBridge();
