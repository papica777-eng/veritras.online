"use strict";
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
exports.HealingStrategyPredictor = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class HealingStrategyPredictor {
    history = [];
    model = new Map();
    isTrained = false;
    constructor() { }
    /**
     * Loads historical data from a JSON file.
     */
    async loadData(filePath) {
        try {
            const absolutePath = path.resolve(filePath);
            const rawData = await fs.promises.readFile(absolutePath, 'utf-8');
            this.history = JSON.parse(rawData);
            console.log(`[ML] Loaded ${this.history.length} historical records.`);
        }
        catch (error) {
            console.error(`[ML] Failed to load data from ${filePath}:`, error);
            throw error;
        }
    }
    /**
     * Trains the model based on loaded history.
     * Builds a probabilistic map of Context -> Strategy -> Success Rate.
     */
    train() {
        console.log('[ML] Training started...');
        this.model.clear();
        for (const record of this.history) {
            // Feature Extraction: We use Domain as the primary context key
            // In a more advanced version, we could tokenize error_message
            const contextKey = this.getContextKey(record.domain, record.error_message);
            if (!this.model.has(contextKey)) {
                this.model.set(contextKey, new Map());
            }
            const strategies = this.model.get(contextKey);
            if (!strategies.has(record.strategy)) {
                strategies.set(record.strategy, { success: 0, total: 0 });
            }
            const stats = strategies.get(record.strategy);
            stats.total++;
            if (record.success) {
                stats.success++;
            }
        }
        this.isTrained = true;
        console.log(`[ML] Training complete. Learned patterns for ${this.model.size} contexts.`);
    }
    /**
     * Predicts the best healing strategy for a given error context.
     */
    predict(domain, errorMessage) {
        if (!this.isTrained) {
            throw new Error('Model is not trained. Call train() first.');
        }
        const contextKey = this.getContextKey(domain, errorMessage);
        const strategies = this.model.get(contextKey);
        if (!strategies) {
            // Fallback: If exact context not found, try generic domain context
            // or return a default safe strategy
            console.warn(`[ML] Unknown context '${contextKey}'. Falling back to generic domain heuristics.`);
            return this.getFallbackPrediction(domain);
        }
        let bestStrategy = 'Restart';
        let bestScore = -1;
        let bestCount = 0;
        for (const [strategy, stats] of strategies.entries()) {
            const winRate = stats.success / stats.total;
            // Wilson score interval or simple weighted score could be used here
            // We'll use a simple win rate, but penalize very low sample sizes slightly
            if (winRate > bestScore) {
                bestScore = winRate;
                bestStrategy = strategy;
                bestCount = stats.total;
            }
        }
        return {
            strategy: bestStrategy,
            confidence: bestScore,
            supportingDataPoints: bestCount
        };
    }
    /**
     * Simplistic feature extraction: Currently maps closely to domain/error groups.
     * Real ML would vectorize the error string.
     */
    getContextKey(domain, errorMessage) {
        // We group specific errors to improve generalization if exact match isn't needed
        // For this implementation, we'll try to identify key patterns in the error message
        let errorType = 'GENERIC';
        if (errorMessage.includes('timeout') || errorMessage.includes('ECONN'))
            errorType = 'TIMEOUT';
        else if (errorMessage.includes('not found') || errorMessage.includes('visual'))
            errorType = 'VISUAL';
        else if (errorMessage.includes('Syntax') || errorMessage.includes('Type'))
            errorType = 'SYNTAX';
        else if (errorMessage.includes('Database') || errorMessage.includes('Connection pool'))
            errorType = 'DB_CONN';
        return `${domain}::${errorType}`;
    }
    getFallbackPrediction(domain) {
        // Hardcoded fallbacks based on domain knowledge (prior priors)
        switch (domain) {
            case 'NETWORK': return { strategy: 'HydraNetwork', confidence: 0.5, supportingDataPoints: 0 };
            case 'UI': return { strategy: 'NeuralMapEngine', confidence: 0.5, supportingDataPoints: 0 };
            case 'LOGIC': return { strategy: 'EvolutionaryHardening', confidence: 0.5, supportingDataPoints: 0 };
            default: return { strategy: 'Restart', confidence: 0.1, supportingDataPoints: 0 };
        }
    }
}
exports.HealingStrategyPredictor = HealingStrategyPredictor;
