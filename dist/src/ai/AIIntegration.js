"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * MIND-ENGINE: AI/ML INTEGRATION
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Smart selectors, anomaly detection, predictive healing, ML model training
 *
 * @author dp | QAntum Labs
 * @version 1.0.0-QANTUM-PRIME
 * @license Commercial
 * ═══════════════════════════════════════════════════════════════════════════════
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
exports.QAntumOrchestrator = exports.NoeticWatchdog = exports.MetaLogicArbiter = exports.TemporalResonanceEngine = exports.CatuskotiLogicCore = exports.MLModelTrainer = exports.PredictiveHealing = exports.AnomalyDetector = exports.SmartSelectorAI = void 0;
exports.createSmartSelectorAI = createSmartSelectorAI;
exports.createAnomalyDetector = createAnomalyDetector;
exports.createPredictiveHealing = createPredictiveHealing;
exports.createMLTrainer = createMLTrainer;
exports.createCatuskotiCore = createCatuskotiCore;
exports.createTemporalResonance = createTemporalResonance;
exports.createMetaLogicArbiter = createMetaLogicArbiter;
exports.createNoeticWatchdog = createNoeticWatchdog;
exports.createQAntumOrchestrator = createQAntumOrchestrator;
const events_1 = require("events");
const fs = __importStar(require("fs"));
// ═══════════════════════════════════════════════════════════════════════════════
// SMART SELECTOR AI
// ═══════════════════════════════════════════════════════════════════════════════
class SmartSelectorAI extends events_1.EventEmitter {
    model;
    selectorHistory = new Map();
    learningRate = 0.1;
    constructor() {
        super();
        this.model = new SelectorModel();
    }
    /**
     * Find element with AI-powered selector
     */
    async findElement(page, description) {
        // Extract features from description
        const features = this.extractFeaturesFromDescription(description);
        // Generate candidate selectors
        // SAFETY: async operation — wrap in try-catch for production resilience
        const candidates = await this.generateCandidates(page, features);
        // Rank candidates using ML model
        const ranked = this.rankCandidates(candidates, features);
        // Try each candidate
        for (const candidate of ranked) {
            try {
                const element = await page.locator(candidate.selector).first();
                const isVisible = await element.isVisible();
                if (isVisible) {
                    // Record success
                    this.recordSuccess(description, candidate);
                    return {
                        element,
                        prediction: candidate
                    };
                }
            }
            catch {
                // Selector failed, try next
            }
        }
        throw new Error(`Could not find element matching: ${description}`);
    }
    /**
     * Learn from selector success/failure
     */
    learn(description, selector, success) {
        const key = this.hashDescription(description);
        if (!this.selectorHistory.has(key)) {
            this.selectorHistory.set(key, {
                description,
                attempts: [],
                successfulSelectors: []
            });
        }
        const history = this.selectorHistory.get(key);
        history.attempts.push({ selector, success, timestamp: Date.now() });
        if (success) {
            if (!history.successfulSelectors.includes(selector)) {
                history.successfulSelectors.push(selector);
            }
        }
        // Update model weights
        this.model.updateWeights(this.extractSelectorFeatures(selector), success);
        this.emit('learned', { description, selector, success });
    }
    /**
     * Suggest best selector for element
     */
    async suggestSelector(page, element) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const features = await this.extractElementFeatures(page, element);
        const suggestions = [];
        // ID-based selector (highest priority)
        if (features.id) {
            suggestions.push({
                selector: `#${features.id}`,
                confidence: 0.95,
                strategy: 'id',
                fallbacks: []
            });
        }
        // Data-testid selector
        if (features.attributes['data-testid']) {
            suggestions.push({
                selector: `[data-testid="${features.attributes['data-testid']}"]`,
                confidence: 0.9,
                strategy: 'css',
                fallbacks: []
            });
        }
        // Role-based selector
        if (features.attributes['role']) {
            const roleSelector = `[role="${features.attributes['role']}"]`;
            suggestions.push({
                selector: roleSelector,
                confidence: 0.7,
                strategy: 'role',
                fallbacks: [features.cssSelector]
            });
        }
        // Text-based selector
        if (features.text && features.text.length < 50) {
            suggestions.push({
                selector: `text="${features.text}"`,
                confidence: 0.6,
                strategy: 'text',
                fallbacks: [features.xpath]
            });
        }
        // AI-generated selector
        const aiSelector = this.model.predictSelector(features);
        suggestions.push({
            selector: aiSelector.selector,
            confidence: aiSelector.confidence,
            strategy: 'ai',
            fallbacks: [features.xpath, features.cssSelector]
        });
        // Sort by confidence
        return suggestions.sort((a, b) => b.confidence - a.confidence);
    }
    extractFeaturesFromDescription(description) {
        const features = {
            hasId: /id|#/.test(description),
            hasClass: /class|\./.test(description),
            hasText: /text|label|button|link/i.test(description),
            hasRole: /role|aria/i.test(description),
            isButton: /button|btn|submit/i.test(description),
            isInput: /input|field|text|email|password/i.test(description),
            isLink: /link|anchor|href/i.test(description),
            words: description.toLowerCase().split(/\s+/)
        };
        return features;
    }
    async generateCandidates(page, features) {
        const candidates = [];
        // Generate based on features
        for (const word of features.words) {
            candidates.push({ selector: `#${word}`, confidence: 0.5, strategy: 'id', fallbacks: [] }, { selector: `.${word}`, confidence: 0.4, strategy: 'css', fallbacks: [] }, { selector: `[data-testid="${word}"]`, confidence: 0.6, strategy: 'css', fallbacks: [] }, { selector: `text="${word}"`, confidence: 0.3, strategy: 'text', fallbacks: [] });
        }
        if (features.isButton) {
            candidates.push({ selector: 'button', confidence: 0.3, strategy: 'css', fallbacks: [] }, { selector: '[type="submit"]', confidence: 0.4, strategy: 'css', fallbacks: [] });
        }
        return candidates;
    }
    rankCandidates(candidates, features) {
        return candidates
            .map(c => ({
            ...c,
            confidence: this.model.predictConfidence(c.selector, features)
        }))
            .sort((a, b) => b.confidence - a.confidence);
    }
    async extractElementFeatures(page, element) {
        return page.evaluate((el) => {
            const rect = el.getBoundingClientRect();
            const computedStyle = window.getComputedStyle(el);
            return {
                tagName: el.tagName.toLowerCase(),
                id: el.id,
                className: el.className,
                text: el.textContent?.trim().slice(0, 100) || '',
                attributes: Object.fromEntries(Array.from(el.attributes).map(a => [a.name, a.value])),
                position: { x: rect.x, y: rect.y },
                size: { width: rect.width, height: rect.height },
                xpath: '', // Would compute XPath
                cssSelector: '', // Would compute CSS selector
                depth: 0, // Would compute DOM depth
                siblingIndex: Array.from(el.parentElement?.children || []).indexOf(el),
                parentTag: el.parentElement?.tagName.toLowerCase() || '',
                childCount: el.children.length,
                isVisible: computedStyle.display !== 'none' && computedStyle.visibility !== 'hidden',
                isInteractive: ['button', 'a', 'input', 'select', 'textarea'].includes(el.tagName.toLowerCase())
            };
        }, element);
    }
    extractSelectorFeatures(selector) {
        return [
            selector.startsWith('#') ? 1 : 0,
            selector.startsWith('.') ? 1 : 0,
            selector.includes('[') ? 1 : 0,
            selector.includes('text=') ? 1 : 0,
            selector.includes('role=') ? 1 : 0,
            selector.length / 100,
            (selector.match(/\s/g) || []).length / 10
        ];
    }
    hashDescription(description) {
        return description.toLowerCase().replace(/\s+/g, '-');
    }
    recordSuccess(description, prediction) {
        this.learn(description, prediction.selector, true);
    }
}
exports.SmartSelectorAI = SmartSelectorAI;
// ═══════════════════════════════════════════════════════════════════════════════
// SELECTOR MODEL (Simple Neural Network Simulation)
// ═══════════════════════════════════════════════════════════════════════════════
class SelectorModel {
    weights = [0.3, 0.3, 0.2, 0.1, 0.1, 0.5, 0.3];
    bias = 0.5;
    learningRate = 0.01;
    predict(features) {
        let sum = this.bias;
        for (let i = 0; i < features.length && i < this.weights.length; i++) {
            sum += features[i] * this.weights[i];
        }
        return this.sigmoid(sum);
    }
    predictConfidence(selector, features) {
        const selectorFeatures = this.extractFeatures(selector, features);
        return this.predict(selectorFeatures);
    }
    predictSelector(elementFeatures) {
        const candidates = this.generateSelectors(elementFeatures);
        let best = { selector: '', confidence: 0 };
        for (const selector of candidates) {
            const conf = this.predictConfidence(selector, elementFeatures);
            if (conf > best.confidence) {
                best = { selector, confidence: conf };
            }
        }
        return best;
    }
    updateWeights(features, success) {
        const target = success ? 1 : 0;
        const prediction = this.predict(features);
        const error = target - prediction;
        for (let i = 0; i < this.weights.length && i < features.length; i++) {
            this.weights[i] += this.learningRate * error * features[i];
        }
        this.bias += this.learningRate * error;
    }
    sigmoid(x) {
        return 1 / (1 + Math.exp(-x));
    }
    extractFeatures(selector, ctx) {
        return [
            selector.startsWith('#') ? 1 : 0,
            selector.startsWith('.') ? 1 : 0,
            selector.includes('[data-') ? 1 : 0,
            selector.includes('text=') ? 1 : 0,
            ctx.hasId ? 0.5 : 0,
            ctx.isButton ? 0.3 : 0,
            Math.min(selector.length / 50, 1)
        ];
    }
    generateSelectors(features) {
        const selectors = [];
        if (features.id)
            selectors.push(`#${features.id}`);
        if (features.className) {
            const classes = features.className.split(' ').filter(Boolean);
            for (const cls of classes.slice(0, 3)) {
                selectors.push(`.${cls}`);
            }
        }
        if (features.attributes['data-testid']) {
            selectors.push(`[data-testid="${features.attributes['data-testid']}"]`);
        }
        if (features.text) {
            selectors.push(`text="${features.text.slice(0, 30)}"`);
        }
        return selectors;
    }
}
// ═══════════════════════════════════════════════════════════════════════════════
// ANOMALY DETECTOR
// ═══════════════════════════════════════════════════════════════════════════════
class AnomalyDetector extends events_1.EventEmitter {
    baselines = new Map();
    threshold;
    constructor(threshold = 2.0) {
        super();
        this.threshold = threshold; // Standard deviations
    }
    /**
     * Record baseline data
     */
    recordBaseline(key, value) {
        if (!this.baselines.has(key)) {
            this.baselines.set(key, {
                values: [],
                mean: 0,
                stdDev: 0,
                min: Infinity,
                max: -Infinity
            });
        }
        const baseline = this.baselines.get(key);
        baseline.values.push(value);
        baseline.min = Math.min(baseline.min, value);
        baseline.max = Math.max(baseline.max, value);
        // Update statistics
        this.updateStatistics(baseline);
    }
    /**
     * Detect anomaly
     */
    detect(key, value) {
        const baseline = this.baselines.get(key);
        if (!baseline || baseline.values.length < 5) {
            return {
                isAnomaly: false,
                score: 0,
                reasons: ['Insufficient baseline data'],
                baseline: null,
                current: value
            };
        }
        const zScore = Math.abs((value - baseline.mean) / (baseline.stdDev || 1));
        const isAnomaly = zScore > this.threshold;
        const reasons = [];
        if (value > baseline.max * 1.5) {
            reasons.push(`Value ${value} is 50%+ above historical max ${baseline.max}`);
        }
        if (value < baseline.min * 0.5) {
            reasons.push(`Value ${value} is 50%+ below historical min ${baseline.min}`);
        }
        if (zScore > this.threshold) {
            reasons.push(`Z-score ${zScore.toFixed(2)} exceeds threshold ${this.threshold}`);
        }
        const result = {
            isAnomaly,
            score: zScore,
            reasons,
            baseline: {
                mean: baseline.mean,
                stdDev: baseline.stdDev,
                min: baseline.min,
                max: baseline.max
            },
            current: value
        };
        if (isAnomaly) {
            this.emit('anomaly', { key, ...result });
        }
        return result;
    }
    /**
     * Detect multiple metrics
     */
    detectMultiple(metrics) {
        const results = new Map();
        for (const [key, value] of Object.entries(metrics)) {
            results.set(key, this.detect(key, value));
        }
        return results;
    }
    /**
     * Export baselines
     */
    exportBaselines() {
        const exported = {};
        for (const [key, value] of this.baselines) {
            exported[key] = { ...value };
        }
        return exported;
    }
    /**
     * Import baselines
     */
    importBaselines(data) {
        for (const [key, value] of Object.entries(data)) {
            this.baselines.set(key, value);
        }
    }
    updateStatistics(baseline) {
        const n = baseline.values.length;
        baseline.mean = baseline.values.reduce((a, b) => a + b, 0) / n;
        const variance = baseline.values.reduce((sum, val) => sum + Math.pow(val - baseline.mean, 2), 0) / n;
        baseline.stdDev = Math.sqrt(variance);
    }
}
exports.AnomalyDetector = AnomalyDetector;
// ═══════════════════════════════════════════════════════════════════════════════
// PREDICTIVE HEALING
// ═══════════════════════════════════════════════════════════════════════════════
class PredictiveHealing extends events_1.EventEmitter {
    failurePatterns = [];
    elementHealth = new Map();
    /**
     * Record element interaction
     */
    recordInteraction(selector, success, context) {
        if (!this.elementHealth.has(selector)) {
            this.elementHealth.set(selector, {
                selector,
                totalAttempts: 0,
                failures: 0,
                lastSuccess: null,
                lastFailure: null,
                contexts: []
            });
        }
        const health = this.elementHealth.get(selector);
        health.totalAttempts++;
        if (success) {
            health.lastSuccess = new Date();
        }
        else {
            health.failures++;
            health.lastFailure = new Date();
            health.contexts.push(context);
            // Learn failure pattern
            this.learnFailurePattern(selector, context);
        }
    }
    /**
     * Predict if selector will fail
     */
    predict(selector, context) {
        const health = this.elementHealth.get(selector);
        if (!health) {
            return {
                willFail: false,
                probability: 0,
                reasons: ['No historical data'],
                suggestedAction: 'proceed'
            };
        }
        const failureRate = health.failures / health.totalAttempts;
        const matchingPatterns = this.findMatchingPatterns(selector, context);
        let probability = failureRate;
        const reasons = [];
        // Increase probability based on patterns
        for (const pattern of matchingPatterns) {
            probability = Math.min(0.95, probability + pattern.weight * 0.2);
            reasons.push(pattern.description);
        }
        // Check recent failures
        if (health.lastFailure) {
            const timeSinceFailure = Date.now() - health.lastFailure.getTime();
            if (timeSinceFailure < 60000) { // Within last minute
                probability = Math.min(0.95, probability + 0.2);
                reasons.push('Recent failure detected');
            }
        }
        const willFail = probability > 0.5;
        let suggestedAction = 'proceed';
        if (willFail) {
            if (probability > 0.8) {
                suggestedAction = 'use-fallback';
            }
            else {
                suggestedAction = 'add-retry';
            }
        }
        return {
            willFail,
            probability,
            reasons,
            suggestedAction
        };
    }
    /**
     * Get healing suggestions
     */
    getHealingSuggestions(selector) {
        const suggestions = [];
        const health = this.elementHealth.get(selector);
        if (!health)
            return suggestions;
        // Analyze failure contexts
        const contextPatterns = this.analyzeContexts(health.contexts);
        if (contextPatterns.timingIssues) {
            suggestions.push('Add explicit wait before interaction');
        }
        if (contextPatterns.visibilityIssues) {
            suggestions.push('Check element visibility before action');
        }
        if (contextPatterns.staleElement) {
            suggestions.push('Re-locate element before each interaction');
        }
        if (contextPatterns.overlappingElements) {
            suggestions.push('Scroll element into view or use force click');
        }
        return suggestions;
    }
    learnFailurePattern(selector, context) {
        // Create pattern from context
        const pattern = {
            selector,
            conditions: context,
            weight: 1,
            occurrences: 1,
            description: this.describePattern(context)
        };
        // Check if similar pattern exists
        const existing = this.failurePatterns.find(p => p.selector === selector && this.matchesConditions(p.conditions, context));
        if (existing) {
            existing.occurrences++;
            existing.weight = Math.min(1, existing.weight + 0.1);
        }
        else {
            this.failurePatterns.push(pattern);
        }
    }
    findMatchingPatterns(selector, context) {
        return this.failurePatterns.filter(p => (p.selector === selector || p.selector === '*') &&
            this.matchesConditions(p.conditions, context));
    }
    matchesConditions(pattern, context) {
        for (const [key, value] of Object.entries(pattern)) {
            if (context[key] !== value)
                return false;
        }
        return true;
    }
    describePattern(context) {
        const parts = [];
        if (context.error)
            parts.push(`Error: ${context.error}`);
        if (context.viewport)
            parts.push(`Viewport: ${context.viewport}`);
        if (context.timing)
            parts.push(`Timing issue detected`);
        return parts.join(', ') || 'Unknown pattern';
    }
    analyzeContexts(contexts) {
        return {
            timingIssues: contexts.some(c => c.error?.includes('timeout')),
            visibilityIssues: contexts.some(c => c.error?.includes('visible')),
            staleElement: contexts.some(c => c.error?.includes('stale')),
            overlappingElements: contexts.some(c => c.error?.includes('intercept'))
        };
    }
}
exports.PredictiveHealing = PredictiveHealing;
// ═══════════════════════════════════════════════════════════════════════════════
// ML MODEL TRAINER
// ═══════════════════════════════════════════════════════════════════════════════
class MLModelTrainer extends events_1.EventEmitter {
    trainingData = [];
    model;
    constructor() {
        super();
        this.model = new SimpleNeuralNetwork([10, 8, 4, 1]);
    }
    /**
     * Add training sample
     */
    addSample(features, label, metadata) {
        this.trainingData.push({ features, label, metadata });
    }
    /**
     * Train model
     */
    train(epochs = 100, learningRate = 0.01) {
        const startTime = Date.now();
        const losses = [];
        for (let epoch = 0; epoch < epochs; epoch++) {
            let epochLoss = 0;
            for (const sample of this.trainingData) {
                const output = this.model.forward(sample.features);
                const loss = this.model.backward(sample.label, learningRate);
                epochLoss += loss;
            }
            epochLoss /= this.trainingData.length;
            losses.push(epochLoss);
            if (epoch % 10 === 0) {
                this.emit('progress', { epoch, loss: epochLoss });
            }
        }
        return {
            epochs,
            finalLoss: losses[losses.length - 1],
            duration: Date.now() - startTime,
            samplesUsed: this.trainingData.length
        };
    }
    /**
     * Predict
     */
    predict(features) {
        return this.model.forward(features);
    }
    /**
     * Save model
     */
    saveModel(filePath) {
        const modelData = this.model.export();
        fs.writeFileSync(filePath, JSON.stringify(modelData, null, 2));
    }
    /**
     * Load model
     */
    loadModel(filePath) {
        const modelData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        this.model.import(modelData);
    }
    /**
     * Export training data
     */
    exportTrainingData(filePath) {
        fs.writeFileSync(filePath, JSON.stringify(this.trainingData, null, 2));
    }
    /**
     * Import training data
     */
    importTrainingData(filePath) {
        this.trainingData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
}
exports.MLModelTrainer = MLModelTrainer;
// ═══════════════════════════════════════════════════════════════════════════════
// SIMPLE NEURAL NETWORK
// ═══════════════════════════════════════════════════════════════════════════════
class SimpleNeuralNetwork {
    layers;
    weights;
    biases;
    activations;
    constructor(layers) {
        this.layers = layers;
        this.weights = [];
        this.biases = [];
        this.activations = [];
        // Initialize weights and biases
        for (let i = 0; i < layers.length - 1; i++) {
            const w = [];
            for (let j = 0; j < layers[i + 1]; j++) {
                const row = [];
                for (let k = 0; k < layers[i]; k++) {
                    row.push((Math.random() - 0.5) * 2);
                }
                w.push(row);
            }
            this.weights.push(w);
            const b = [];
            for (let j = 0; j < layers[i + 1]; j++) {
                b.push(0);
            }
            this.biases.push(b);
        }
    }
    forward(input) {
        this.activations = [input];
        let current = input;
        for (let i = 0; i < this.weights.length; i++) {
            const next = [];
            for (let j = 0; j < this.weights[i].length; j++) {
                let sum = this.biases[i][j];
                for (let k = 0; k < current.length; k++) {
                    sum += current[k] * this.weights[i][j][k];
                }
                next.push(this.sigmoid(sum));
            }
            current = next;
            this.activations.push(current);
        }
        return current[0];
    }
    backward(target, learningRate) {
        const output = this.activations[this.activations.length - 1][0];
        const error = target - output;
        const loss = error * error;
        // Simple gradient descent (simplified backprop)
        let delta = [error * this.sigmoidDerivative(output)];
        for (let i = this.weights.length - 1; i >= 0; i--) {
            const newDelta = [];
            for (let j = 0; j < this.weights[i].length; j++) {
                for (let k = 0; k < this.weights[i][j].length; k++) {
                    this.weights[i][j][k] += learningRate * delta[j] * this.activations[i][k];
                }
                this.biases[i][j] += learningRate * delta[j];
            }
            if (i > 0) {
                for (let k = 0; k < this.activations[i].length; k++) {
                    let sum = 0;
                    for (let j = 0; j < delta.length; j++) {
                        sum += delta[j] * (this.weights[i][j]?.[k] || 0);
                    }
                    newDelta.push(sum * this.sigmoidDerivative(this.activations[i][k]));
                }
                delta = newDelta;
            }
        }
        return loss;
    }
    export() {
        return {
            layers: this.layers,
            weights: this.weights,
            biases: this.biases
        };
    }
    import(data) {
        this.layers = data.layers;
        this.weights = data.weights;
        this.biases = data.biases;
    }
    sigmoid(x) {
        return 1 / (1 + Math.exp(-Math.max(-500, Math.min(500, x))));
    }
    sigmoidDerivative(x) {
        return x * (1 - x);
    }
}
// ═══════════════════════════════════════════════════════════════════════════════
// THE CATUSKOTI LOGIC CORE
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * CatuskotiLogicCore — The Tetralemma Engine
 *
 * Complexity: O(n) per evaluation where n = |observations|
 * Memory: O(k) where k = unique identifiers tracked
 *
 * This engine replaces binary TRUE/FALSE logic with four-state quantum logic.
 * It integrates with AnomalyDetector and PredictiveHealing to create
 * a unified decision framework that can handle:
 *
 *   1. Normal operations (TRUE → EXECUTE)
 *   2. Broken systems (FALSE → HEAL)
 *   3. Traps and honeypots (PARADOX → EXPLOIT or APOPTOSIS)
 *   4. Total chaos beyond logic (TRANSCENDENT → OBSERVE or ENTROPY_FARM)
 *
 * The mathematical foundation:
 *   - Shannon Entropy H(X) classifies the entropy regime
 *   - Z-score analysis detects statistical anomalies
 *   - Contradiction coefficient Ψ identifies paradoxes
 *   - Kolmogorov complexity approximation detects transcendence
 *
 * "When entropy realizes it IS the entropy, it self-terminates."
 *                                              — Nagarjuna × QAntum
 */
class CatuskotiLogicCore extends events_1.EventEmitter {
    // ─── Internal State ────────────────────────────────────────────────
    memory = new Map();
    anomalyDetector;
    globalEntropyHistory = [];
    // ─── Configuration ─────────────────────────────────────────────────
    PARADOX_THRESHOLD = 0.35; // Contradiction Ψ > this → PARADOX
    TRANSCENDENCE_THRESHOLD = 0.85; // Entropy H > this → TRANSCENDENT
    EXPLOIT_MIN_CONFIDENCE = 0.60; // Min confidence to exploit paradox
    APOPTOSIS_LOOP_LIMIT = 5; // Self-referential loops before termination
    MEMORY_WINDOW = 100; // Max history entries per identifier
    ENTROPY_FARM_THRESHOLD = 0.70; // Min exploitability for entropy farming
    constructor(anomalyThreshold = 2.0) {
        super();
        this.anomalyDetector = new AnomalyDetector(anomalyThreshold);
    }
    // ═════════════════════════════════════════════════════════════════════
    // PRIMARY INTERFACE: EVALUATE
    // Complexity: O(n) where n = signal.observations.length
    // ═════════════════════════════════════════════════════════════════════
    /**
     * Evaluate a signal through the four-state Catuskoti lens.
     * This is the MAIN entry point. Every decision in the system
     * should pass through this gate.
     */
    evaluate(signal) {
        const startTime = Date.now();
        // Step 1: Compute Shannon Entropy of the observation vector
        const shannonEntropy = this.computeShannonEntropy(signal.observations);
        const entropyRegime = this.classifyEntropyRegime(shannonEntropy);
        const entropyDelta = this.computeEntropyDelta(shannonEntropy);
        // Step 2: Feed observations to AnomalyDetector for Z-score baseline
        const anomalyKey = `catuskoti:${signal.domain}:${signal.identifier}`;
        for (const obs of signal.observations) {
            this.anomalyDetector.recordBaseline(anomalyKey, obs);
        }
        const latestValue = signal.observations[signal.observations.length - 1] ?? 0;
        const anomaly = signal.anomalyResult ?? this.anomalyDetector.detect(anomalyKey, latestValue);
        // Step 3: Compute the Contradiction Coefficient Ψ
        const psi = this.computeContradictionCoefficient(signal, anomaly, shannonEntropy);
        // Step 4: Classify into Catuskoti state
        const { state, confidence, paradoxVector, transcendenceDepth } = this.classifyState(signal, shannonEntropy, entropyRegime, anomaly, psi);
        // Step 5: Resolve action vector
        const { action, rationale } = this.resolveAction(state, confidence, shannonEntropy, paradoxVector, signal);
        // Step 6: Record to memory
        this.recordDecision(signal.identifier, state, shannonEntropy, action);
        // Step 7: Check for apoptosis (self-referential destruction loops)
        const finalAction = this.checkApoptosis(signal.identifier, action, state);
        const decision = {
            state,
            confidence,
            shannonEntropy,
            entropyRegime,
            entropyDelta,
            action: finalAction,
            actionRationale: rationale,
            paradoxVector: state === 'PARADOX' ? paradoxVector : undefined,
            transcendenceDepth: state === 'TRANSCENDENT' ? transcendenceDepth : undefined,
            timestamp: Date.now(),
            computeTimeMs: Date.now() - startTime,
            logicDepth: 1,
        };
        // Emit events for observability
        this.emit('decision', decision);
        if (state === 'PARADOX')
            this.emit('paradox:detected', decision);
        if (state === 'TRANSCENDENT')
            this.emit('transcendence:entered', decision);
        if (finalAction === 'APOPTOSIS')
            this.emit('apoptosis:triggered', decision);
        return decision;
    }
    // ═════════════════════════════════════════════════════════════════════
    // STEP 1: SHANNON ENTROPY COMPUTATION
    // H(X) = -Σ p(x) log₂ p(x)
    // Complexity: O(n)
    // ═════════════════════════════════════════════════════════════════════
    /**
     * Compute Shannon entropy of an observation vector.
     * Maps continuous values to discrete bins, then computes H(X).
     *
     * H = 0.00 → perfect crystal (single value repeating)
     * H = 1.00 → maximum chaos (uniform distribution)
     */
    computeShannonEntropy(observations) {
        if (observations.length < 2)
            return 0;
        // Bin continuous values into 20 buckets for probability estimation
        const numBins = Math.min(20, Math.ceil(Math.sqrt(observations.length)));
        const min = Math.min(...observations);
        const max = Math.max(...observations);
        const range = max - min || 1;
        const bins = new Array(numBins).fill(0);
        for (const val of observations) {
            const binIdx = Math.min(numBins - 1, Math.floor(((val - min) / range) * numBins));
            bins[binIdx]++;
        }
        // Compute probabilities and Shannon entropy
        const n = observations.length;
        let H = 0;
        for (const count of bins) {
            if (count === 0)
                continue;
            const p = count / n;
            H -= p * Math.log2(p);
        }
        // Normalize to [0, 1] range
        const maxEntropy = Math.log2(numBins);
        return maxEntropy > 0 ? H / maxEntropy : 0;
    }
    /**
     * Classify entropy into qualitative regime.
     */
    classifyEntropyRegime(H) {
        if (H < 0.001)
            return 'CRYSTALLINE';
        if (H < 0.30)
            return 'STRUCTURED';
        if (H < 0.70)
            return 'TURBULENT';
        if (H < 0.95)
            return 'CHAOTIC';
        return 'VOID';
    }
    /**
     * Compute rate of entropy change (ΔH).
     * Positive ΔH = system is degrading toward chaos.
     * Negative ΔH = system is crystallizing toward order.
     */
    computeEntropyDelta(currentH) {
        this.globalEntropyHistory.push(currentH);
        if (this.globalEntropyHistory.length > 50) {
            this.globalEntropyHistory.shift();
        }
        if (this.globalEntropyHistory.length < 3)
            return 0;
        const recent = this.globalEntropyHistory.slice(-5);
        const older = this.globalEntropyHistory.slice(-10, -5);
        if (older.length === 0)
            return 0;
        const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
        const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
        return recentAvg - olderAvg;
    }
    // ═════════════════════════════════════════════════════════════════════
    // STEP 3: CONTRADICTION COEFFICIENT Ψ
    // The heart of Catuskoti: measuring how PARADOXICAL reality is.
    // Ψ = 0 → classical (purely true or purely false)
    // Ψ = 1 → maximum paradox (equally true AND false)
    // Complexity: O(n)
    // ═════════════════════════════════════════════════════════════════════
    /**
     * Compute the contradiction coefficient Ψ (Psi).
     *
     * Ψ measures the degree to which a signal contains SIMULTANEOUS
     * evidence for BOTH truth and falsehood.
     *
     * Example paradoxes:
     *   - Web element exists in DOM but has 0px size (invisible trap)
     *   - Market price spikes but volume drops to zero (fake pump)
     *   - Network returns 200 OK but body contains error message
     *   - Test passes but performance degrades 500%
     */
    computeContradictionCoefficient(signal, anomaly, entropy) {
        let trueEvidence = 0;
        let falseEvidence = 0;
        let contradictionFactors = 0;
        // Factor 1: Anomaly says normal but observations are extreme
        if (!anomaly.isAnomaly && entropy > 0.6) {
            trueEvidence += 0.7; // Anomaly detector says "fine"
            falseEvidence += 0.8; // But entropy says "chaos"
            contradictionFactors++;
        }
        // Factor 2: Anomaly says abnormal but entropy is low
        if (anomaly.isAnomaly && entropy < 0.2) {
            trueEvidence += 0.3;
            falseEvidence += 0.9;
            contradictionFactors++;
        }
        // Factor 3: Signal-specific contradiction detection
        if (signal.anomalyResult && signal.predictionResult) {
            // Anomaly detector and predictor disagree
            const anomSaysNormal = !signal.anomalyResult.isAnomaly;
            const predSaysFail = signal.predictionResult.willFail;
            if (anomSaysNormal && predSaysFail) {
                trueEvidence += 0.6;
                falseEvidence += 0.7;
                contradictionFactors++;
            }
            if (!anomSaysNormal && !predSaysFail) {
                trueEvidence += 0.5;
                falseEvidence += 0.6;
                contradictionFactors++;
            }
        }
        // Factor 4: Observation vector self-contradiction
        // Check if the signal oscillates rapidly between extremes
        const oscillationRate = this.computeOscillationRate(signal.observations);
        if (oscillationRate > 0.7) {
            trueEvidence += oscillationRate * 0.5;
            falseEvidence += oscillationRate * 0.5;
            contradictionFactors++;
        }
        // Factor 5: Historical state flipping (memory-based)
        const mem = this.memory.get(signal.identifier);
        if (mem && mem.history.length >= 3) {
            const recentStates = mem.history.slice(-5).map(h => h.state);
            const stateChanges = recentStates.filter((s, i) => i > 0 && s !== recentStates[i - 1]).length;
            if (stateChanges >= 3) {
                // State is flipping rapidly — classic paradox signature
                trueEvidence += 0.4;
                falseEvidence += 0.4;
                contradictionFactors++;
            }
        }
        if (contradictionFactors === 0)
            return 0;
        // Ψ = geometric mean of min(T,F)/max(T,F) weighted by count
        const minSignal = Math.min(trueEvidence, falseEvidence);
        const maxSignal = Math.max(trueEvidence, falseEvidence);
        const psi = maxSignal > 0
            ? (minSignal / maxSignal) * Math.min(1, contradictionFactors / 3)
            : 0;
        return Math.min(1, psi);
    }
    /**
     * Compute oscillation rate of an observation vector.
     * How rapidly does the signal flip between high and low values?
     *
     * Returns [0, 1] where 1 = maximum oscillation.
     */
    computeOscillationRate(observations) {
        if (observations.length < 3)
            return 0;
        const min = Math.min(...observations);
        const max = Math.max(...observations);
        const range = max - min;
        if (range === 0)
            return 0;
        let directionChanges = 0;
        let prevDirection = 0;
        for (let i = 1; i < observations.length; i++) {
            const diff = observations[i] - observations[i - 1];
            const direction = Math.sign(diff);
            if (direction !== 0 && direction !== prevDirection && prevDirection !== 0) {
                directionChanges++;
            }
            if (direction !== 0)
                prevDirection = direction;
        }
        // Normalize: max possible changes = n - 2
        return directionChanges / Math.max(1, observations.length - 2);
    }
    // ═════════════════════════════════════════════════════════════════════
    // STEP 4: STATE CLASSIFICATION
    // The four corners of Nagarjuna's Diamond
    // Complexity: O(1) given precomputed entropy and Ψ
    // ═════════════════════════════════════════════════════════════════════
    classifyState(signal, entropy, regime, anomaly, psi) {
        // ── GATE 1: PARADOX (Ψ exceeds threshold) ──────────────────────
        if (psi > this.PARADOX_THRESHOLD) {
            const paradoxVector = this.resolveParadoxVector(signal, psi, anomaly);
            return {
                state: 'PARADOX',
                confidence: psi,
                paradoxVector,
            };
        }
        // ── GATE 2: TRANSCENDENT (Entropy exceeds threshold) ────────────
        if (entropy > this.TRANSCENDENCE_THRESHOLD || regime === 'VOID') {
            // Approximation of Kolmogorov complexity: if we can't compress
            // the observations at all, we've left classical logic behind.
            const depth = this.estimateTranscendenceDepth(signal.observations, entropy);
            return {
                state: 'TRANSCENDENT',
                confidence: entropy,
                transcendenceDepth: depth,
            };
        }
        // ── GATE 3: FALSE (Anomaly detected OR prediction says fail) ────
        if (anomaly.isAnomaly || signal.predictionResult?.willFail) {
            return {
                state: 'FALSE',
                confidence: anomaly.isAnomaly
                    ? Math.min(1, anomaly.score / 5)
                    : (signal.predictionResult?.probability ?? 0.5),
            };
        }
        // ── GATE 4: TRUE (Default — reality is as expected) ─────────────
        return {
            state: 'TRUE',
            confidence: 1 - entropy, // Higher entropy → lower confidence in TRUE
        };
    }
    /**
     * Resolve the paradox into an exploitable vector.
     * This is where we turn the enemy's trap into our weapon.
     */
    resolveParadoxVector(signal, psi, anomaly) {
        const trueSignal = anomaly.isAnomaly ? 0.3 : 0.8;
        const falseSignal = anomaly.isAnomaly ? 0.8 : 0.3;
        // Exploitability: can we profit from this contradiction?
        let exploitability = psi * 0.8;
        // Market paradoxes are highly exploitable (arbitrage)
        if (signal.domain === 'MARKET')
            exploitability = Math.min(1, exploitability * 1.5);
        // Web paradoxes are exploitable (bypass anti-bot)
        if (signal.domain === 'WEB')
            exploitability = Math.min(1, exploitability * 1.2);
        // Trap probability: higher Ψ + anomaly = likely deliberate
        const trapProbability = Math.min(1, psi * (anomaly.isAnomaly ? 1.3 : 0.5));
        // What does the trap WANT us to do? (We invert it.)
        let invertedAction = 'PROCEED';
        if (signal.domain === 'MARKET') {
            invertedAction = anomaly.isAnomaly ? 'BUY (trap wants SELL → we SHORT)' : 'SELL (trap wants BUY → we FADE)';
        }
        else if (signal.domain === 'WEB') {
            invertedAction = 'BYPASS_VIA_NETWORK_LAYER (trap wants DOM interaction)';
        }
        return {
            trueSignal,
            falseSignal,
            contradiction: psi,
            exploitability,
            trapProbability,
            invertedAction,
        };
    }
    /**
     * Estimate how deep into transcendence we are.
     * Uses a simplified Kolmogorov complexity approximation.
     * Depth 1 = edge of chaos. Depth 5+ = pure mathematical void.
     */
    estimateTranscendenceDepth(observations, entropy) {
        // Attempt to "compress" the observations via run-length encoding
        let runs = 1;
        const quantized = observations.map(v => Math.round(v * 10));
        for (let i = 1; i < quantized.length; i++) {
            if (quantized[i] !== quantized[i - 1])
                runs++;
        }
        // Compression ratio: runs / length. Closer to 1 = incompressible = transcendent
        const compressionRatio = runs / Math.max(1, quantized.length);
        // Map to depth [1, 10]
        return Math.max(1, Math.round(compressionRatio * 10 * entropy));
    }
    // ═════════════════════════════════════════════════════════════════════
    // STEP 5: ACTION RESOLUTION
    // Given the state, what does the machine DO?
    // Complexity: O(1)
    // ═════════════════════════════════════════════════════════════════════
    resolveAction(state, confidence, entropy, paradoxVector, signal) {
        switch (state) {
            case 'TRUE':
                return {
                    action: 'EXECUTE',
                    rationale: `Reality confirmed (confidence=${(confidence * 100).toFixed(1)}%, H=${entropy.toFixed(3)}). Proceeding with standard execution.`,
                };
            case 'FALSE':
                return {
                    action: 'HEAL',
                    rationale: `Reality broken for "${signal.identifier}" (confidence=${(confidence * 100).toFixed(1)}%). Activating self-healing protocol.`,
                };
            case 'PARADOX': {
                if (!paradoxVector) {
                    return { action: 'OBSERVE', rationale: 'Paradox detected but vector unresolvable. Observing.' };
                }
                // Can we exploit this paradox?
                if (paradoxVector.exploitability >= this.EXPLOIT_MIN_CONFIDENCE) {
                    return {
                        action: 'EXPLOIT_PARADOX',
                        rationale: `PARADOX EXPLOITABLE (Ψ=${paradoxVector.contradiction.toFixed(3)}, exploit=${(paradoxVector.exploitability * 100).toFixed(1)}%). Trap inversion: ${paradoxVector.invertedAction}. The enemy's weapon becomes our profit.`,
                    };
                }
                // Paradox exists but too risky to exploit
                return {
                    action: 'OBSERVE',
                    rationale: `Paradox detected (Ψ=${paradoxVector.contradiction.toFixed(3)}) but exploitation confidence too low (${(paradoxVector.exploitability * 100).toFixed(1)}% < ${this.EXPLOIT_MIN_CONFIDENCE * 100}%). Observing and gathering data.`,
                };
            }
            case 'TRANSCENDENT': {
                // In total chaos, can we farm entropy for profit?
                const mem = this.memory.get(signal.identifier);
                const recentParadoxes = mem ? mem.paradoxCount : 0;
                if (entropy > this.ENTROPY_FARM_THRESHOLD && signal.domain === 'MARKET') {
                    return {
                        action: 'ENTROPY_FARM',
                        rationale: `VOID STATE entered (H=${entropy.toFixed(3)}). Classical logic does not apply. Engaging entropy farming: harvesting value from pure chaos via nano-trades. Previous paradoxes: ${recentParadoxes}.`,
                    };
                }
                return {
                    action: 'OBSERVE',
                    rationale: `TRANSCENDENCE entered (H=${entropy.toFixed(3)}). Neither true nor false. Logic suspended. Gathering observations until pattern crystallizes.`,
                };
            }
        }
    }
    // ═════════════════════════════════════════════════════════════════════
    // STEP 6 & 7: MEMORY & APOPTOSIS
    // "When entropy realizes it IS entropy, it self-terminates."
    // ═════════════════════════════════════════════════════════════════════
    /**
     * Record decision to memory for pattern learning.
     */
    recordDecision(identifier, state, entropy, action) {
        if (!this.memory.has(identifier)) {
            this.memory.set(identifier, {
                identifier,
                history: [],
                stateFrequency: { TRUE: 0, FALSE: 0, PARADOX: 0, TRANSCENDENT: 0 },
                averageEntropy: 0,
                paradoxCount: 0,
                transcendenceCount: 0,
            });
        }
        const mem = this.memory.get(identifier);
        mem.history.push({ state, entropy, action, outcome: 'UNKNOWN', timestamp: Date.now() });
        mem.stateFrequency[state]++;
        if (state === 'PARADOX')
            mem.paradoxCount++;
        if (state === 'TRANSCENDENT')
            mem.transcendenceCount++;
        // Rolling average entropy
        const totalDecisions = mem.history.length;
        mem.averageEntropy = ((mem.averageEntropy * (totalDecisions - 1)) + entropy) / totalDecisions;
        // Trim memory window
        if (mem.history.length > this.MEMORY_WINDOW) {
            mem.history.shift();
        }
    }
    /**
     * Record the outcome of a previous decision (feedback loop).
     */
    recordOutcome(identifier, outcome) {
        const mem = this.memory.get(identifier);
        if (!mem || mem.history.length === 0)
            return;
        mem.history[mem.history.length - 1].outcome = outcome;
    }
    /**
     * APOPTOSIS CHECK — Programmed Self-Destruction.
     *
     * If the system detects a self-referential destruction loop
     * (e.g., PARADOX → EXPLOIT → PARADOX → EXPLOIT → PARADOX...),
     * it recognizes that it IS the problem, and terminates the process.
     *
     * This is the mathematical equivalent of:
     * "Cancer realizes it's cancer, and commits apoptosis."
     */
    checkApoptosis(identifier, currentAction, currentState) {
        const mem = this.memory.get(identifier);
        if (!mem || mem.history.length < this.APOPTOSIS_LOOP_LIMIT)
            return currentAction;
        const recent = mem.history.slice(-this.APOPTOSIS_LOOP_LIMIT);
        // Pattern 1: All recent states are PARADOX → stuck in contradiction loop
        const allParadox = recent.every(h => h.state === 'PARADOX');
        // Pattern 2: Alternating EXPLOIT → FAILURE → EXPLOIT → FAILURE
        const exploitFailLoop = recent.every((h, i) => i % 2 === 0
            ? h.action === 'EXPLOIT_PARADOX'
            : h.outcome === 'FAILURE');
        // Pattern 3: Entropy is monotonically increasing (system is dying)
        const entropyMonotonic = recent.every((h, i) => i === 0 || h.entropy >= recent[i - 1].entropy);
        const entropyExplosion = entropyMonotonic && recent[recent.length - 1].entropy > 0.9;
        if (allParadox || exploitFailLoop || entropyExplosion) {
            this.emit('apoptosis:triggered', {
                identifier,
                reason: allParadox
                    ? 'PARADOX_LOOP: Self-referential contradiction detected. Terminating.'
                    : exploitFailLoop
                        ? 'EXPLOIT_FAIL_LOOP: Exploitation attempts consistently failing. The trap has trapped us.'
                        : 'ENTROPY_EXPLOSION: System entropy is monotonically increasing toward void. Graceful death.',
                recentHistory: recent,
            });
            return 'APOPTOSIS';
        }
        return currentAction;
    }
    // ═════════════════════════════════════════════════════════════════════
    // PUBLIC API: CONVENIENCE METHODS
    // ═════════════════════════════════════════════════════════════════════
    /**
     * Quick evaluation for market signals.
     */
    evaluateMarketSignal(symbol, priceHistory) {
        return this.evaluate({
            domain: 'MARKET',
            identifier: symbol,
            observations: priceHistory,
        });
    }
    /**
     * Quick evaluation for web/DOM signals.
     */
    evaluateWebSignal(url, metrics, anomaly) {
        return this.evaluate({
            domain: 'WEB',
            identifier: url,
            observations: metrics,
            anomalyResult: anomaly,
        });
    }
    /**
     * Quick evaluation for system health signals.
     */
    evaluateSystemSignal(component, metrics) {
        return this.evaluate({
            domain: 'SYSTEM',
            identifier: component,
            observations: metrics,
        });
    }
    /**
     * Get the complete memory state for a given identifier.
     */
    getMemory(identifier) {
        return this.memory.get(identifier);
    }
    /**
     * Export the entire Catuskoti state for persistence.
     */
    exportState() {
        let totalParadoxes = 0;
        let totalTranscendences = 0;
        for (const mem of this.memory.values()) {
            totalParadoxes += mem.paradoxCount;
            totalTranscendences += mem.transcendenceCount;
        }
        const avgGlobalEntropy = this.globalEntropyHistory.length > 0
            ? this.globalEntropyHistory.reduce((a, b) => a + b, 0) / this.globalEntropyHistory.length
            : 0;
        return {
            memoryEntries: this.memory.size,
            globalEntropy: avgGlobalEntropy,
            totalParadoxes,
            totalTranscendences,
        };
    }
}
exports.CatuskotiLogicCore = CatuskotiLogicCore;
/**
 * TemporalResonanceEngine — The Fractal Prophet
 *
 * Complexity: O(n * k) per scan, where n = window size, k = stored fingerprints
 * Memory: O(k * w) where w = wavelet coefficient size
 *
 * Stores "fingerprints" of significant past events (crashes, pumps, anomalies).
 * When new data arrives, it computes the current fingerprint and compares it
 * against the library using cosine similarity on wavelet coefficients.
 *
 * If similarity > threshold, it means "history is rhyming" and we can
 * predict the future based on what happened AFTER the past event.
 */
class TemporalResonanceEngine extends events_1.EventEmitter {
    library = [];
    SIMILARITY_THRESHOLD = 0.75;
    MAX_LIBRARY_SIZE = 500;
    WAVELET_DEPTH = 4; // Haar wavelet decomposition depth
    fingerIdCounter = 0;
    constructor() {
        super();
    }
    // ═══════════════════════════════════════════════════════════════════
    // FINGERPRINT CREATION
    // Complexity: O(n) where n = observations.length
    // ═══════════════════════════════════════════════════════════════════
    /**
     * Create a temporal fingerprint from an observation window.
     */
    createFingerprint(domain, identifier, observations, label = '', outcome, catuskotiState) {
        const waveletCoeffs = this.haarWaveletTransform(observations);
        const autocorrelation = this.computeAutocorrelation(observations, 10);
        const entropy = this.computeWindowEntropy(observations);
        const fp = {
            id: `TFP-${++this.fingerIdCounter}-${Date.now()}`,
            label: label || `Fingerprint at ${new Date().toISOString()}`,
            domain,
            identifier,
            timestamp: Date.now(),
            windowSize: observations.length,
            waveletCoeffs,
            autocorrelation,
            entropy,
            catuskotiState,
            outcome: outcome || 'UNKNOWN',
        };
        return fp;
    }
    /**
     * Store a fingerprint in the library for future comparison.
     */
    storeFingerprint(fp) {
        this.library.push(fp);
        if (this.library.length > this.MAX_LIBRARY_SIZE) {
            this.library.shift(); // FIFO eviction
        }
        this.emit('fingerprint:stored', { id: fp.id, label: fp.label, librarySize: this.library.length });
    }
    /**
     * Record and store a significant event (convenience method).
     */
    recordEvent(domain, identifier, observations, label, outcome) {
        const fp = this.createFingerprint(domain, identifier, observations, label, outcome);
        this.storeFingerprint(fp);
        return fp;
    }
    // ═══════════════════════════════════════════════════════════════════
    // RESONANCE SCAN — "Does the present rhyme with the past?"
    // Complexity: O(k * w) where k = library size, w = wavelet length
    // ═══════════════════════════════════════════════════════════════════
    /**
     * Scan current observations against the fingerprint library.
     * Returns matches sorted by similarity (highest first).
     */
    scan(domain, identifier, currentObservations) {
        const currentFP = this.createFingerprint(domain, identifier, currentObservations);
        const matches = [];
        for (const stored of this.library) {
            // Only compare same domain + identifier (or wildcard)
            if (stored.domain !== domain)
                continue;
            // Compute cosine similarity on wavelet coefficients
            const waveletSim = this.cosineSimilarity(currentFP.waveletCoeffs, stored.waveletCoeffs);
            // Compute cosine similarity on autocorrelation (shape similarity)
            const acorrSim = this.cosineSimilarity(currentFP.autocorrelation, stored.autocorrelation);
            // Entropy distance (penalize if entropy regimes are very different)
            const entropyDist = 1 - Math.abs(currentFP.entropy - stored.entropy);
            // Combined similarity: weighted average
            const similarity = waveletSim * 0.5 + acorrSim * 0.3 + entropyDist * 0.2;
            if (similarity >= this.SIMILARITY_THRESHOLD) {
                const timeSince = Date.now() - stored.timestamp;
                const timeHorizon = timeSince < 3600000 ? '30 min'
                    : timeSince < 86400000 ? '2-6 hours'
                        : timeSince < 604800000 ? '1-3 days'
                            : '1 week+';
                matches.push({
                    fingerprint: stored,
                    similarity,
                    predictedOutcome: stored.outcome || 'UNKNOWN',
                    confidence: similarity * (stored.outcome !== 'UNKNOWN' ? 1 : 0.5),
                    timeHorizon,
                    warning: this.generateWarning(stored, similarity),
                });
            }
        }
        // Sort by similarity descending
        matches.sort((a, b) => b.similarity - a.similarity);
        if (matches.length > 0) {
            this.emit('resonance:detected', {
                matchCount: matches.length,
                topMatch: matches[0],
            });
        }
        return matches;
    }
    // ═══════════════════════════════════════════════════════════════════
    // HAAR WAVELET TRANSFORM (Simplified)
    // Decomposes signal into multi-scale shape coefficients.
    // Complexity: O(n log n)
    // ═══════════════════════════════════════════════════════════════════
    haarWaveletTransform(signal) {
        // Pad to nearest power of 2
        const len = Math.pow(2, Math.ceil(Math.log2(Math.max(2, signal.length))));
        const padded = [...signal];
        while (padded.length < len)
            padded.push(padded[padded.length - 1] ?? 0);
        const coeffs = [];
        let current = [...padded];
        for (let depth = 0; depth < this.WAVELET_DEPTH && current.length >= 2; depth++) {
            const next = [];
            const details = [];
            for (let i = 0; i < current.length; i += 2) {
                const avg = (current[i] + current[i + 1]) / 2;
                const diff = (current[i] - current[i + 1]) / 2;
                next.push(avg);
                details.push(diff);
            }
            coeffs.push(...details);
            current = next;
        }
        // Add the final averages
        coeffs.push(...current);
        return coeffs;
    }
    // ═══════════════════════════════════════════════════════════════════
    // AUTOCORRELATION — measures self-similarity at different lags
    // Complexity: O(n * maxLag)
    // ═══════════════════════════════════════════════════════════════════
    computeAutocorrelation(data, maxLag) {
        const n = data.length;
        if (n < 3)
            return new Array(maxLag).fill(0);
        const mean = data.reduce((a, b) => a + b, 0) / n;
        const variance = data.reduce((s, v) => s + (v - mean) ** 2, 0) / n;
        if (variance === 0)
            return new Array(maxLag).fill(1);
        const result = [];
        for (let lag = 1; lag <= maxLag; lag++) {
            let sum = 0;
            for (let i = 0; i < n - lag; i++) {
                sum += (data[i] - mean) * (data[i + lag] - mean);
            }
            result.push(sum / (n * variance));
        }
        return result;
    }
    /**
     * Cosine similarity between two vectors.
     */
    cosineSimilarity(a, b) {
        const minLen = Math.min(a.length, b.length);
        if (minLen === 0)
            return 0;
        let dotProduct = 0, normA = 0, normB = 0;
        for (let i = 0; i < minLen; i++) {
            dotProduct += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }
        const denom = Math.sqrt(normA) * Math.sqrt(normB);
        return denom > 0 ? Math.max(0, dotProduct / denom) : 0;
    }
    computeWindowEntropy(observations) {
        if (observations.length < 2)
            return 0;
        const numBins = Math.min(10, Math.ceil(Math.sqrt(observations.length)));
        const min = Math.min(...observations);
        const max = Math.max(...observations);
        const range = max - min || 1;
        const bins = new Array(numBins).fill(0);
        for (const v of observations) {
            bins[Math.min(numBins - 1, Math.floor(((v - min) / range) * numBins))]++;
        }
        const n = observations.length;
        let H = 0;
        for (const c of bins) {
            if (c === 0)
                continue;
            const p = c / n;
            H -= p * Math.log2(p);
        }
        const maxH = Math.log2(numBins);
        return maxH > 0 ? H / maxH : 0;
    }
    generateWarning(fp, similarity) {
        const pct = (similarity * 100).toFixed(1);
        switch (fp.outcome) {
            case 'CRASH':
                return `⚠️ CRITICAL: Current pattern is ${pct}% similar to "${fp.label}" which led to a CRASH. Prepare defenses.`;
            case 'PUMP':
                return `🚀 OPPORTUNITY: Current pattern is ${pct}% similar to "${fp.label}" which led to a PUMP. Consider positioning.`;
            case 'RECOVERY':
                return `📈 RECOVERY SIGNAL: Current pattern is ${pct}% similar to "${fp.label}" which led to recovery.`;
            case 'FLAT':
                return `➡️ STAGNATION: Current pattern is ${pct}% similar to "${fp.label}" — expect sideways movement.`;
            default:
                return `🔍 RESONANCE: Current pattern is ${pct}% similar to "${fp.label}" — outcome unknown. Observe.`;
        }
    }
    /**
     * Get library statistics.
     */
    getStats() {
        const byDomain = {};
        const byOutcome = {};
        for (const fp of this.library) {
            byDomain[fp.domain] = (byDomain[fp.domain] || 0) + 1;
            const out = fp.outcome || 'UNKNOWN';
            byOutcome[out] = (byOutcome[out] || 0) + 1;
        }
        return { totalFingerprints: this.library.length, byDomain, byOutcome };
    }
}
exports.TemporalResonanceEngine = TemporalResonanceEngine;
/**
 * MetaLogicArbiter — Thinking About Thinking
 *
 * Complexity: O(d * n) per analysis, d = domains, n = decisions per domain
 * Memory: O(d * w) where w = decision window size
 *
 * Ingests every CatuskotiDecision and builds a meta-view.
 * Detects patterns that no single Catuskoti evaluation can see:
 * coordinated manipulation, domain collapse, golden windows.
 */
class MetaLogicArbiter extends events_1.EventEmitter {
    decisionLog = [];
    WINDOW_SIZE = 200;
    PARADOX_ALARM_THRESHOLD = 0.40; // 40%+ PARADOX → manipulation
    COLLAPSE_THRESHOLD = 0.60; // 60%+ FALSE → collapse
    GOLDEN_THRESHOLD = 0.80; // 80%+ TRUE + low entropy → golden
    CASCADE_DETECTION_WINDOW = 30000; // 30 seconds
    constructor() {
        super();
    }
    // ═══════════════════════════════════════════════════════════════════
    // INGEST — Feed every Catuskoti decision into the Arbiter
    // Complexity: O(1) amortized
    // ═══════════════════════════════════════════════════════════════════
    /**
     * Ingest a Catuskoti decision for meta-analysis.
     * Call this for EVERY decision the CatuskotiLogicCore produces.
     */
    ingest(decision, domain, identifier) {
        this.decisionLog.push({
            decision,
            domain,
            identifier,
            timestamp: Date.now(),
        });
        // Trim window
        if (this.decisionLog.length > this.WINDOW_SIZE) {
            this.decisionLog.shift();
        }
    }
    // ═══════════════════════════════════════════════════════════════════
    // ANALYZE — Generate a MetaReport
    // Complexity: O(n) where n = decision log size
    // ═══════════════════════════════════════════════════════════════════
    /**
     * Perform full meta-analysis across all ingested decisions.
     */
    analyze() {
        const domainStates = this.computeDomainStates();
        const paradoxConc = this.computeStateConcentration('PARADOX');
        const transcConc = this.computeStateConcentration('TRANSCENDENT');
        const crossEntropy = this.computeCrossDomainEntropy(domainStates);
        const entropyTrend = this.computeEntropyTrend();
        const verdict = this.issueVerdict(domainStates, paradoxConc, transcConc, crossEntropy);
        const recommendations = this.generateRecommendations(verdict, domainStates, paradoxConc);
        const report = {
            timestamp: Date.now(),
            verdict,
            confidence: this.computeVerdictConfidence(verdict, paradoxConc, transcConc),
            domainStates,
            crossDomainEntropy: crossEntropy,
            paradoxConcentration: paradoxConc,
            transcendenceConcentration: transcConc,
            entropyTrend,
            recommendations,
        };
        this.emit('meta:report', report);
        if (verdict === 'SYSTEMIC_MANIPULATION')
            this.emit('meta:manipulation', report);
        if (verdict === 'DOMAIN_COLLAPSE')
            this.emit('meta:collapse', report);
        if (verdict === 'GOLDEN_WINDOW')
            this.emit('meta:golden', report);
        if (verdict === 'CASCADE_PARADOX')
            this.emit('meta:cascade', report);
        return report;
    }
    /**
     * Compute per-domain state summaries.
     */
    computeDomainStates() {
        const domains = {};
        for (const entry of this.decisionLog) {
            const d = entry.domain;
            if (!domains[d]) {
                domains[d] = {
                    domain: d,
                    totalDecisions: 0,
                    stateDistribution: { TRUE: 0, FALSE: 0, PARADOX: 0, TRANSCENDENT: 0 },
                    averageEntropy: 0,
                    dominantState: 'TRUE',
                    healthScore: 100,
                };
            }
            const ds = domains[d];
            ds.totalDecisions++;
            ds.stateDistribution[entry.decision.state]++;
            ds.averageEntropy = ((ds.averageEntropy * (ds.totalDecisions - 1)) + entry.decision.shannonEntropy) / ds.totalDecisions;
        }
        // Compute dominant state and health
        for (const ds of Object.values(domains)) {
            let maxCount = 0;
            for (const [state, count] of Object.entries(ds.stateDistribution)) {
                if (count > maxCount) {
                    maxCount = count;
                    ds.dominantState = state;
                }
            }
            // Health: TRUE → 100, FALSE → 40, PARADOX → 20, TRANSCENDENT → 10
            const weights = { TRUE: 100, FALSE: 40, PARADOX: 20, TRANSCENDENT: 10 };
            let weightedSum = 0;
            for (const [state, count] of Object.entries(ds.stateDistribution)) {
                weightedSum += weights[state] * count;
            }
            ds.healthScore = ds.totalDecisions > 0 ? Math.round(weightedSum / ds.totalDecisions) : 100;
        }
        return domains;
    }
    /**
     * What percentage of recent decisions are in a given state?
     */
    computeStateConcentration(state) {
        if (this.decisionLog.length === 0)
            return 0;
        const count = this.decisionLog.filter(e => e.decision.state === state).length;
        return count / this.decisionLog.length;
    }
    /**
     * Cross-domain entropy: how correlated are the domains?
     * If all domains have the same dominant state, cross-entropy is low (coordinated).
     */
    computeCrossDomainEntropy(domainStates) {
        const domains = Object.values(domainStates);
        if (domains.length < 2)
            return 0;
        const stateCounts = {};
        for (const ds of domains) {
            stateCounts[ds.dominantState] = (stateCounts[ds.dominantState] || 0) + 1;
        }
        const n = domains.length;
        let H = 0;
        for (const count of Object.values(stateCounts)) {
            const p = count / n;
            if (p > 0)
                H -= p * Math.log2(p);
        }
        const maxH = Math.log2(4); // 4 possible states
        return maxH > 0 ? H / maxH : 0;
    }
    /**
     * Is the global entropy rising, falling, stable, or oscillating?
     */
    computeEntropyTrend() {
        if (this.decisionLog.length < 10)
            return 'STABLE';
        const recent = this.decisionLog.slice(-20).map(e => e.decision.shannonEntropy);
        const firstHalf = recent.slice(0, Math.floor(recent.length / 2));
        const secondHalf = recent.slice(Math.floor(recent.length / 2));
        const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
        const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
        const delta = avgSecond - avgFirst;
        // Check oscillation
        let dirChanges = 0;
        let prevDir = 0;
        for (let i = 1; i < recent.length; i++) {
            const dir = Math.sign(recent[i] - recent[i - 1]);
            if (dir !== 0 && dir !== prevDir && prevDir !== 0)
                dirChanges++;
            if (dir !== 0)
                prevDir = dir;
        }
        const oscillationRate = dirChanges / Math.max(1, recent.length - 2);
        if (oscillationRate > 0.6)
            return 'OSCILLATING';
        if (delta > 0.05)
            return 'RISING';
        if (delta < -0.05)
            return 'FALLING';
        return 'STABLE';
    }
    /**
     * Issue the final meta-verdict based on all analysis.
     */
    issueVerdict(domainStates, paradoxConc, transcConc, crossEntropy) {
        // CASCADE: Check if paradoxes appeared in rapid succession across domains
        const recentParadoxes = this.decisionLog
            .filter(e => e.decision.state === 'PARADOX')
            .slice(-10);
        if (recentParadoxes.length >= 5) {
            const uniqueDomains = new Set(recentParadoxes.map(e => e.domain)).size;
            const timeSpan = recentParadoxes.length > 1
                ? recentParadoxes[recentParadoxes.length - 1].timestamp - recentParadoxes[0].timestamp
                : Infinity;
            if (uniqueDomains >= 3 && timeSpan < this.CASCADE_DETECTION_WINDOW) {
                return 'CASCADE_PARADOX';
            }
        }
        // SYSTEMIC MANIPULATION: Too many paradoxes
        if (paradoxConc >= this.PARADOX_ALARM_THRESHOLD) {
            return 'SYSTEMIC_MANIPULATION';
        }
        // ENTROPY CONVERGENCE: All domains converging to similar entropy
        if (crossEntropy < 0.15 && Object.keys(domainStates).length >= 3) {
            const entropies = Object.values(domainStates).map(d => d.averageEntropy);
            const avgEnt = entropies.reduce((a, b) => a + b, 0) / entropies.length;
            if (avgEnt > 0.6)
                return 'ENTROPY_CONVERGENCE';
        }
        // DOMAIN COLLAPSE: Any domain has 60%+ FALSE
        for (const ds of Object.values(domainStates)) {
            if (ds.totalDecisions >= 5) {
                const falseRate = ds.stateDistribution.FALSE / ds.totalDecisions;
                if (falseRate >= this.COLLAPSE_THRESHOLD)
                    return 'DOMAIN_COLLAPSE';
            }
        }
        // GOLDEN WINDOW: Most decisions are TRUE with low entropy
        const allDomains = Object.values(domainStates);
        if (allDomains.length > 0) {
            const avgHealth = allDomains.reduce((s, d) => s + d.healthScore, 0) / allDomains.length;
            const trueRate = this.computeStateConcentration('TRUE');
            if (trueRate >= this.GOLDEN_THRESHOLD && avgHealth > 80) {
                return 'GOLDEN_WINDOW';
            }
        }
        // CAUTION: Elevated paradox or transcendence levels
        if (paradoxConc > 0.15 || transcConc > 0.20) {
            return 'CAUTION';
        }
        return 'CLEAR';
    }
    computeVerdictConfidence(verdict, paradoxConc, transcConc) {
        const base = Math.min(1, this.decisionLog.length / 50); // More data = more confidence
        switch (verdict) {
            case 'SYSTEMIC_MANIPULATION': return base * Math.min(1, paradoxConc / this.PARADOX_ALARM_THRESHOLD);
            case 'GOLDEN_WINDOW': return base * 0.9;
            case 'CLEAR': return base * 0.85;
            default: return base * 0.7;
        }
    }
    generateRecommendations(verdict, domainStates, paradoxConc) {
        const recs = [];
        switch (verdict) {
            case 'SYSTEMIC_MANIPULATION':
                recs.push('🚨 HALT all automated trading. Market is being coordinated-manipulated.');
                recs.push(`Paradox concentration: ${(paradoxConc * 100).toFixed(1)}% — abnormally high.`);
                recs.push('Switch to OBSERVE mode across all domains until paradoxes resolve.');
                break;
            case 'DOMAIN_COLLAPSE':
                recs.push('🔴 Critical domain failure detected. Evacuate positions in affected domain.');
                for (const ds of Object.values(domainStates)) {
                    if (ds.healthScore < 40)
                        recs.push(`Domain "${ds.domain}" health: ${ds.healthScore}/100 — immediate attention required.`);
                }
                break;
            case 'GOLDEN_WINDOW':
                recs.push('🟢 GOLDEN WINDOW — maximize exposure. All signals are coherent.');
                recs.push('Increase position sizes and reduce cooldown intervals.');
                break;
            case 'CASCADE_PARADOX':
                recs.push('⚡ CASCADE PARADOX — paradoxes spreading across domains like infection.');
                recs.push('Activate containment: isolate affected domains, do not cross-pollinate decisions.');
                break;
            case 'ENTROPY_CONVERGENCE':
                recs.push('🌀 All domains converging to same entropy level — singularity event possible.');
                recs.push('Prepare for extreme volatility or total system recalibration.');
                break;
            case 'CAUTION':
                recs.push('⚠️ Elevated anomaly levels. Reduce exposure 30-50%.');
                break;
            case 'CLEAR':
                recs.push('✅ All systems nominal. Proceed with standard operations.');
                break;
        }
        return recs;
    }
}
exports.MetaLogicArbiter = MetaLogicArbiter;
/**
 * NoeticWatchdog — The AI That Watches The AI
 *
 * Complexity: O(m * h) per health check, m = modules, h = history length
 * Memory: O(m * h)
 *
 * The Noetic Watchdog is the recursive self-awareness layer.
 * It observes the behavior of Catuskoti, MetaLogic, Temporal, and all
 * lower modules, detecting when THEY are degrading or making bad decisions.
 *
 * It can:
 *   1. Issue alerts and warnings
 *   2. Force a module into COOLDOWN (temporary pause)
 *   3. RESTART a module (clear its memory, reset state)
 *   4. QUARANTINE a module (disable it entirely until human intervention)
 *
 * The Watchdog itself is the ONLY module that cannot be watched.
 * It is the irreducible observer — the Witness.
 *
 * "Quis custodiet ipsos custodes?" — The Watchdog watches the watchers.
 */
class NoeticWatchdog extends events_1.EventEmitter {
    modules = new Map();
    alerts = [];
    alertIdCounter = 0;
    // ─── Thresholds ────────────────────────────────────────────────────
    FAILURE_RATE_WARNING = 0.30; // 30% failure → WARNING
    FAILURE_RATE_CRITICAL = 0.50; // 50% failure → CRITICAL
    CONSECUTIVE_FAIL_LIMIT = 5; // 5 in a row → COOLDOWN
    CONFIDENCE_DEGRADATION = 0.15; // 15% drop → WARNING
    COMPUTE_TIME_SPIKE = 3.0; // 3x slower → WARNING
    COOLDOWN_DURATION_MS = 60000; // 1 minute default cooldown
    MAX_DECISIONS_PER_MINUTE = 100; // Rate limit
    HISTORY_WINDOW = 50;
    constructor() {
        super();
    }
    // ═══════════════════════════════════════════════════════════════════
    // MODULE REGISTRATION
    // ═══════════════════════════════════════════════════════════════════
    /**
     * Register a module for monitoring.
     */
    registerModule(name) {
        if (this.modules.has(name))
            return;
        this.modules.set(name, {
            module: name,
            decisionsMade: 0,
            successCount: 0,
            failureCount: 0,
            paradoxCount: 0,
            averageConfidence: 1.0,
            averageComputeTimeMs: 0,
            lastActivityTimestamp: Date.now(),
            consecutiveFailures: 0,
            status: 'HEALTHY',
            cooldownUntil: 0,
            history: [],
        });
        this.emit('module:registered', { module: name });
    }
    // ═══════════════════════════════════════════════════════════════════
    // OBSERVATION — Feed telemetry from any module
    // Complexity: O(1) amortized
    // ═══════════════════════════════════════════════════════════════════
    /**
     * Observe a decision from any module.
     * Call this after every Catuskoti decision, MetaLogic report, etc.
     */
    observe(moduleName, success, confidence, computeTimeMs, isParadox = false, entropy = 0) {
        if (!this.modules.has(moduleName))
            this.registerModule(moduleName);
        const tel = this.modules.get(moduleName);
        // Check cooldown
        if (tel.status === 'COOLDOWN' && Date.now() < tel.cooldownUntil) {
            return this.createAlert(moduleName, 'INFO', `Module "${moduleName}" is in COOLDOWN until ${new Date(tel.cooldownUntil).toISOString()}.`, {}, 'NONE');
        }
        else if (tel.status === 'COOLDOWN' && Date.now() >= tel.cooldownUntil) {
            tel.status = 'HEALTHY';
            tel.consecutiveFailures = 0;
            this.emit('module:cooldown_ended', { module: moduleName });
        }
        if (tel.status === 'QUARANTINED') {
            return this.createAlert(moduleName, 'CRITICAL', `Module "${moduleName}" is QUARANTINED. Human intervention required.`, {}, 'NONE');
        }
        // Update telemetry
        tel.decisionsMade++;
        tel.lastActivityTimestamp = Date.now();
        if (success) {
            tel.successCount++;
            tel.consecutiveFailures = 0;
        }
        else {
            tel.failureCount++;
            tel.consecutiveFailures++;
        }
        if (isParadox)
            tel.paradoxCount++;
        // Rolling average confidence
        tel.averageConfidence = ((tel.averageConfidence * (tel.decisionsMade - 1)) + confidence) / tel.decisionsMade;
        // Rolling average compute time
        tel.averageComputeTimeMs = ((tel.averageComputeTimeMs * (tel.decisionsMade - 1)) + computeTimeMs) / tel.decisionsMade;
        // Record history snapshot every 10 decisions
        if (tel.decisionsMade % 10 === 0) {
            tel.history.push({
                timestamp: Date.now(),
                successRate: tel.successCount / tel.decisionsMade,
                avgConfidence: tel.averageConfidence,
                entropy,
            });
            if (tel.history.length > this.HISTORY_WINDOW)
                tel.history.shift();
        }
        // Run health check
        return this.healthCheck(moduleName);
    }
    // ═══════════════════════════════════════════════════════════════════
    // HEALTH CHECK — Diagnose module health
    // Complexity: O(h) where h = history length
    // ═══════════════════════════════════════════════════════════════════
    /**
     * Run a comprehensive health check on a module.
     */
    healthCheck(moduleName) {
        const tel = this.modules.get(moduleName);
        if (!tel || tel.decisionsMade < 5)
            return null;
        const failureRate = tel.failureCount / tel.decisionsMade;
        // ── Check 1: Consecutive failures → COOLDOWN ─────────────────
        if (tel.consecutiveFailures >= this.CONSECUTIVE_FAIL_LIMIT) {
            tel.status = 'COOLDOWN';
            tel.cooldownUntil = Date.now() + this.COOLDOWN_DURATION_MS;
            return this.createAlert(moduleName, 'CRITICAL', `Module "${moduleName}" has ${tel.consecutiveFailures} consecutive failures. Forcing COOLDOWN for ${this.COOLDOWN_DURATION_MS / 1000}s.`, { consecutiveFailures: tel.consecutiveFailures, failureRate }, 'COOLDOWN', this.COOLDOWN_DURATION_MS);
        }
        // ── Check 2: High failure rate → CRITICAL ────────────────────
        if (failureRate >= this.FAILURE_RATE_CRITICAL) {
            tel.status = 'CRITICAL';
            return this.createAlert(moduleName, 'CRITICAL', `Module "${moduleName}" failure rate: ${(failureRate * 100).toFixed(1)}% — exceeds critical threshold.`, { failureRate, totalDecisions: tel.decisionsMade }, 'RESTART');
        }
        // ── Check 3: Elevated failure rate → WARNING ─────────────────
        if (failureRate >= this.FAILURE_RATE_WARNING) {
            tel.status = 'DEGRADED';
            return this.createAlert(moduleName, 'WARNING', `Module "${moduleName}" failure rate: ${(failureRate * 100).toFixed(1)}% — elevated but not critical.`, { failureRate }, 'NONE');
        }
        // ── Check 4: Confidence degradation over time ────────────────
        if (tel.history.length >= 3) {
            const recent = tel.history.slice(-3);
            const older = tel.history.slice(-6, -3);
            if (older.length > 0) {
                const recentConf = recent.reduce((s, h) => s + h.avgConfidence, 0) / recent.length;
                const olderConf = older.reduce((s, h) => s + h.avgConfidence, 0) / older.length;
                const drop = olderConf - recentConf;
                if (drop > this.CONFIDENCE_DEGRADATION) {
                    return this.createAlert(moduleName, 'WARNING', `Module "${moduleName}" confidence dropping: ${(olderConf * 100).toFixed(1)}% → ${(recentConf * 100).toFixed(1)}% (Δ=${(drop * 100).toFixed(1)}%).`, { recentConfidence: recentConf, olderConfidence: olderConf, delta: drop }, 'NONE');
                }
            }
        }
        // ── Check 5: Compute time spike ──────────────────────────────
        if (tel.history.length >= 2) {
            const baselineTime = tel.history[0]?.avgConfidence ?? tel.averageComputeTimeMs;
            if (tel.averageComputeTimeMs > baselineTime * this.COMPUTE_TIME_SPIKE && baselineTime > 0) {
                return this.createAlert(moduleName, 'WARNING', `Module "${moduleName}" compute time spiking: ${tel.averageComputeTimeMs.toFixed(1)}ms (${this.COMPUTE_TIME_SPIKE}x baseline).`, { currentMs: tel.averageComputeTimeMs, baselineMs: baselineTime }, 'NONE');
            }
        }
        // All clear
        tel.status = 'HEALTHY';
        return null;
    }
    // ═══════════════════════════════════════════════════════════════════
    // INTERVENTIONS
    // ═══════════════════════════════════════════════════════════════════
    /**
     * Force a module into cooldown.
     */
    forceCooldown(moduleName, durationMs = this.COOLDOWN_DURATION_MS) {
        const tel = this.modules.get(moduleName);
        if (!tel)
            return;
        tel.status = 'COOLDOWN';
        tel.cooldownUntil = Date.now() + durationMs;
        this.emit('module:cooldown', { module: moduleName, durationMs });
    }
    /**
     * Quarantine a module (requires human intervention to restore).
     */
    quarantine(moduleName, reason) {
        const tel = this.modules.get(moduleName);
        if (!tel)
            return;
        tel.status = 'QUARANTINED';
        this.createAlert(moduleName, 'FATAL', `Module "${moduleName}" QUARANTINED: ${reason}`, {}, 'QUARANTINE');
        this.emit('module:quarantined', { module: moduleName, reason });
    }
    /**
     * Restore a quarantined module (manual intervention).
     */
    restore(moduleName) {
        const tel = this.modules.get(moduleName);
        if (!tel)
            return;
        tel.status = 'HEALTHY';
        tel.consecutiveFailures = 0;
        tel.failureCount = Math.floor(tel.failureCount * 0.5); // Reset half the failures
        this.emit('module:restored', { module: moduleName });
    }
    /**
     * Check if a module is allowed to operate.
     */
    isOperational(moduleName) {
        const tel = this.modules.get(moduleName);
        if (!tel)
            return true; // Unknown modules are allowed by default
        if (tel.status === 'QUARANTINED')
            return false;
        if (tel.status === 'COOLDOWN' && Date.now() < tel.cooldownUntil)
            return false;
        return true;
    }
    // ═══════════════════════════════════════════════════════════════════
    // COGNITIVE FATIGUE ANALYSIS
    // "Even a perfect machine needs rest."
    // ═══════════════════════════════════════════════════════════════════
    /**
     * Compute the cognitive fatigue index across all modules.
     * Returns [0, 1] where 1 = maximum fatigue.
     */
    computeFatigueIndex() {
        if (this.modules.size === 0)
            return 0;
        let totalFatigue = 0;
        let moduleCount = 0;
        for (const tel of this.modules.values()) {
            if (tel.decisionsMade === 0)
                continue;
            moduleCount++;
            const failureRate = tel.failureCount / tel.decisionsMade;
            const confidenceDrop = tel.history.length >= 2
                ? Math.max(0, tel.history[0].avgConfidence - tel.history[tel.history.length - 1].avgConfidence)
                : 0;
            const paradoxRate = tel.paradoxCount / tel.decisionsMade;
            // Fatigue formula: weighted combination of degradation signals
            const moduleFatigue = (failureRate * 0.4) + (confidenceDrop * 0.3) + (paradoxRate * 0.3);
            totalFatigue += Math.min(1, moduleFatigue);
        }
        return moduleCount > 0 ? totalFatigue / moduleCount : 0;
    }
    /**
     * Should the entire system take a break?
     */
    shouldCooldownAll() {
        const fatigue = this.computeFatigueIndex();
        if (fatigue > 0.6) {
            return {
                needed: true,
                fatigueIndex: fatigue,
                reason: `Cognitive fatigue index: ${(fatigue * 100).toFixed(1)}%. System needs recovery time.`,
            };
        }
        return { needed: false, fatigueIndex: fatigue, reason: 'Within acceptable parameters.' };
    }
    // ═══════════════════════════════════════════════════════════════════
    // REPORTING
    // ═══════════════════════════════════════════════════════════════════
    /**
     * Get a full status report across all monitored modules.
     */
    getStatusReport() {
        const moduleReports = [];
        for (const [name, tel] of this.modules) {
            const failureRate = tel.decisionsMade > 0 ? tel.failureCount / tel.decisionsMade : 0;
            const healthScore = Math.round((1 - failureRate) * tel.averageConfidence * 100);
            moduleReports.push({
                name,
                status: tel.status,
                healthScore,
                decisions: tel.decisionsMade,
                failureRate,
            });
        }
        return {
            modules: moduleReports,
            fatigueIndex: this.computeFatigueIndex(),
            totalAlerts: this.alerts.length,
            criticalAlerts: this.alerts.filter(a => a.severity === 'CRITICAL' || a.severity === 'FATAL').length,
        };
    }
    /**
     * Get recent alerts.
     */
    getAlerts(limit = 20) {
        return this.alerts.slice(-limit);
    }
    createAlert(module, severity, message, metrics, action, cooldownMs) {
        const alert = {
            alertId: `WD-${++this.alertIdCounter}`,
            timestamp: Date.now(),
            module,
            severity,
            message,
            metrics,
            action,
            cooldownMs,
        };
        this.alerts.push(alert);
        if (this.alerts.length > 200)
            this.alerts.shift();
        this.emit('alert', alert);
        return alert;
    }
}
exports.NoeticWatchdog = NoeticWatchdog;
/**
 * QAntumOrchestrator — The Unified Brain
 *
 * Complexity: O(n * k + d) per decision
 *   n = observation window, k = temporal library, d = decision log
 *
 * This is the single entry point for the entire Cognitive Stack.
 * It owns instances of all 4 layers and orchestrates them in sequence.
 *
 * Usage:
 *   const brain = new QAntumOrchestrator();
 *   const decision = brain.process('MARKET', 'BTC/USDT', [64000, 64200, 63800, ...]);
 *   console.log(decision.finalAction);       // "EXPLOIT_PARADOX"
 *   console.log(decision.temporal.topMatch);  // { label: "COVID crash", similarity: 0.87 }
 *   console.log(decision.watchdog.fatigueIndex); // 0.12
 */
class QAntumOrchestrator extends events_1.EventEmitter {
    // ── Cognitive Layers ──
    catuskoti;
    metaLogic;
    temporal;
    watchdog;
    // ── Internal State ──
    decisionCounter = 0;
    MODULE_NAME = 'QAntumOrchestrator';
    constructor(anomalyThreshold) {
        super();
        // Instantiate all cognitive layers
        this.catuskoti = new CatuskotiLogicCore(anomalyThreshold);
        this.metaLogic = new MetaLogicArbiter();
        this.temporal = new TemporalResonanceEngine();
        this.watchdog = new NoeticWatchdog();
        // Register all modules with the Watchdog
        this.watchdog.registerModule('CatuskotiLogicCore');
        this.watchdog.registerModule('MetaLogicArbiter');
        this.watchdog.registerModule('TemporalResonanceEngine');
        this.watchdog.registerModule(this.MODULE_NAME);
        // Wire up event forwarding
        this.catuskoti.on('paradox:detected', (data) => this.emit('paradox:detected', data));
        this.catuskoti.on('transcendence:entered', (data) => this.emit('transcendence:entered', data));
        this.catuskoti.on('apoptosis:triggered', (data) => this.emit('apoptosis:triggered', data));
        this.metaLogic.on('meta:manipulation', (data) => this.emit('meta:manipulation', data));
        this.metaLogic.on('meta:golden', (data) => this.emit('meta:golden', data));
        this.metaLogic.on('meta:cascade', (data) => this.emit('meta:cascade', data));
        this.temporal.on('resonance:detected', (data) => this.emit('resonance:detected', data));
        this.watchdog.on('alert', (data) => this.emit('watchdog:alert', data));
    }
    // ═══════════════════════════════════════════════════════════════════
    // PROCESS — The Main Pipeline
    // Signal → Catuskoti → MetaLogic → Temporal → Watchdog → Decision
    // Complexity: O(n * k + d)
    // ═══════════════════════════════════════════════════════════════════
    /**
     * Process a raw signal through the entire Cognitive Stack.
     *
     * @param domain   - 'MARKET', 'WEB', 'SYSTEM', 'NETWORK', etc.
     * @param identifier - 'BTC/USDT', 'https://target.com', 'cpu_load', etc.
     * @param observations - Array of numeric values (prices, latencies, scores)
     * @returns QAntumDecision — the multi-layered final decision
     */
    process(domain, identifier, observations) {
        const startTime = Date.now();
        const decisionId = `QD-${++this.decisionCounter}-${startTime}`;
        // ── PRE-CHECK: Is system operational? ─────────────────────────
        if (!this.watchdog.isOperational('CatuskotiLogicCore')) {
            return this.createBlockedDecision(decisionId, domain, identifier, 'CatuskotiLogicCore is in COOLDOWN or QUARANTINE.', startTime);
        }
        // ── LAYER 1: Catuskoti Logic Core ─────────────────────────────
        const catDecision = this.catuskoti.evaluate({
            domain,
            identifier,
            observations,
        });
        // Feed Catuskoti result to Watchdog
        const catAlert = this.watchdog.observe('CatuskotiLogicCore', catDecision.state === 'TRUE' || catDecision.action === 'EXPLOIT_PARADOX', catDecision.confidence, catDecision.computeTimeMs, catDecision.state === 'PARADOX', catDecision.shannonEntropy);
        // ── LAYER 2: MetaLogic Arbiter ────────────────────────────────
        this.metaLogic.ingest(catDecision, domain, identifier);
        const metaReport = this.metaLogic.analyze();
        this.watchdog.observe('MetaLogicArbiter', metaReport.verdict === 'CLEAR' || metaReport.verdict === 'GOLDEN_WINDOW', metaReport.confidence, 0, metaReport.verdict === 'CASCADE_PARADOX');
        // ── CROSS-LAYER: Temporal Resonance ───────────────────────────
        const resonanceMatches = this.temporal.scan(domain, identifier, observations);
        this.watchdog.observe('TemporalResonanceEngine', true, // Temporal never "fails", it just finds or doesn't find
        resonanceMatches.length > 0 ? resonanceMatches[0].confidence : 0.5, 0);
        // ── LAYER 3: Watchdog Self-Assessment ─────────────────────────
        const fatigue = this.watchdog.computeFatigueIndex();
        const cooldown = this.watchdog.shouldCooldownAll();
        // ── FINAL SYNTHESIS ───────────────────────────────────────────
        const { finalAction, finalConfidence, reasoning } = this.synthesize(catDecision, metaReport, resonanceMatches, fatigue, cooldown.needed);
        const computeTimeMs = Date.now() - startTime;
        const qDecision = {
            id: decisionId,
            timestamp: startTime,
            domain,
            identifier,
            catuskoti: {
                state: catDecision.state,
                action: catDecision.action,
                confidence: catDecision.confidence,
                shannonEntropy: catDecision.shannonEntropy,
                entropyRegime: catDecision.entropyRegime,
                entropyDelta: catDecision.entropyDelta,
                paradoxVector: catDecision.paradoxVector,
                transcendenceDepth: catDecision.transcendenceDepth,
            },
            metaLogic: {
                verdict: metaReport.verdict,
                confidence: metaReport.confidence,
                paradoxConcentration: metaReport.paradoxConcentration,
                entropyTrend: metaReport.entropyTrend,
                recommendations: metaReport.recommendations,
            },
            temporal: {
                resonanceFound: resonanceMatches.length > 0,
                topMatch: resonanceMatches.length > 0 ? {
                    label: resonanceMatches[0].fingerprint.label,
                    similarity: resonanceMatches[0].similarity,
                    predictedOutcome: resonanceMatches[0].predictedOutcome,
                    warning: resonanceMatches[0].warning,
                } : null,
                matchCount: resonanceMatches.length,
            },
            watchdog: {
                systemOperational: true,
                fatigueIndex: fatigue,
                alert: catAlert,
                cooldownRecommended: cooldown.needed,
            },
            finalAction,
            finalConfidence,
            reasoning,
            computeTimeMs,
        };
        // Emit the full decision
        this.emit('decision', qDecision);
        // Auto-record significant events for future temporal resonance
        if (catDecision.state === 'PARADOX' || catDecision.state === 'TRANSCENDENT') {
            const outcome = catDecision.state === 'PARADOX' ? 'UNKNOWN' : 'UNKNOWN';
            this.temporal.recordEvent(domain, identifier, observations, `Auto: ${catDecision.state} at ${new Date().toISOString()}`, outcome);
        }
        return qDecision;
    }
    // ═══════════════════════════════════════════════════════════════════
    // SYNTHESIS — Combine all layers into final action
    // ═══════════════════════════════════════════════════════════════════
    synthesize(cat, meta, temporal, fatigue, cooldownNeeded) {
        const reasoning = [];
        let action = cat.action;
        let confidence = cat.confidence;
        // ── MetaLogic override ───────────────────────────────────────
        if (meta.verdict === 'SYSTEMIC_MANIPULATION') {
            action = 'FULL_DEFENSE';
            confidence *= 0.3;
            reasoning.push(`MetaLogic: SYSTEMIC_MANIPULATION detected → overriding to FULL_DEFENSE.`);
        }
        else if (meta.verdict === 'DOMAIN_COLLAPSE') {
            action = 'EVACUATE';
            confidence *= 0.5;
            reasoning.push(`MetaLogic: DOMAIN_COLLAPSE → overriding to EVACUATE.`);
        }
        else if (meta.verdict === 'GOLDEN_WINDOW' && cat.state === 'TRUE') {
            action = 'MAXIMIZE';
            confidence = Math.min(1, confidence * 1.2);
            reasoning.push(`MetaLogic GOLDEN_WINDOW + Catuskoti TRUE → upgrading to MAXIMIZE.`);
        }
        else if (meta.verdict === 'CASCADE_PARADOX') {
            action = 'CONTAINMENT';
            confidence *= 0.4;
            reasoning.push(`MetaLogic CASCADE_PARADOX → switching to CONTAINMENT mode.`);
        }
        else {
            reasoning.push(`MetaLogic: ${meta.verdict} — no override needed.`);
        }
        // ── Temporal override ────────────────────────────────────────
        if (temporal.length > 0) {
            const top = temporal[0];
            if (top.predictedOutcome === 'CRASH' && top.similarity > 0.80) {
                if (action !== 'FULL_DEFENSE' && action !== 'EVACUATE') {
                    action = 'DEFENSIVE_POSITION';
                    confidence = Math.min(confidence, top.confidence);
                    reasoning.push(`Temporal: ${(top.similarity * 100).toFixed(1)}% match → CRASH predicted → DEFENSIVE_POSITION.`);
                }
            }
            else if (top.predictedOutcome === 'PUMP' && top.similarity > 0.80 && cat.state === 'TRUE') {
                action = 'AGGRESSIVE_ENTRY';
                confidence = Math.min(1, (confidence + top.confidence) / 2);
                reasoning.push(`Temporal: ${(top.similarity * 100).toFixed(1)}% match → PUMP predicted → AGGRESSIVE_ENTRY.`);
            }
            else {
                reasoning.push(`Temporal: ${temporal.length} match(es), top: ${(top.similarity * 100).toFixed(1)}% → ${top.predictedOutcome}. No override.`);
            }
        }
        else {
            reasoning.push(`Temporal: No historical resonance found.`);
        }
        // ── Fatigue dampening ────────────────────────────────────────
        if (cooldownNeeded) {
            action = 'SYSTEM_COOLDOWN';
            confidence *= 0.2;
            reasoning.push(`Watchdog: Cognitive fatigue at ${(fatigue * 100).toFixed(1)}% → forcing SYSTEM_COOLDOWN.`);
        }
        else if (fatigue > 0.4) {
            confidence *= (1 - fatigue * 0.3);
            reasoning.push(`Watchdog: Fatigue at ${(fatigue * 100).toFixed(1)}% → dampening confidence by ${(fatigue * 30).toFixed(0)}%.`);
        }
        else {
            reasoning.push(`Watchdog: System healthy. Fatigue: ${(fatigue * 100).toFixed(1)}%.`);
        }
        // ── Final summary ────────────────────────────────────────────
        reasoning.push(`FINAL: ${action} @ ${(confidence * 100).toFixed(1)}% confidence.`);
        return { finalAction: action, finalConfidence: confidence, reasoning };
    }
    createBlockedDecision(id, domain, identifier, reason, startTime) {
        return {
            id, timestamp: startTime, domain, identifier,
            catuskoti: { state: 'FALSE', action: 'OBSERVE', confidence: 0, shannonEntropy: 0, entropyRegime: 'VOID', entropyDelta: 0, paradoxVector: undefined, transcendenceDepth: undefined },
            metaLogic: { verdict: 'CAUTION', confidence: 0, paradoxConcentration: 0, entropyTrend: 'STABLE', recommendations: [reason] },
            temporal: { resonanceFound: false, topMatch: null, matchCount: 0 },
            watchdog: { systemOperational: false, fatigueIndex: 1, alert: null, cooldownRecommended: true },
            finalAction: 'BLOCKED', finalConfidence: 0, reasoning: [`System blocked: ${reason}`], computeTimeMs: Date.now() - startTime,
        };
    }
    // ═══════════════════════════════════════════════════════════════════
    // CONVENIENCE METHODS
    // ═══════════════════════════════════════════════════════════════════
    /** Record a past event outcome for future Temporal Resonance. */
    recordHistoricalEvent(domain, identifier, observations, label, outcome) {
        this.temporal.recordEvent(domain, identifier, observations, label, outcome);
    }
    /** Get full system health report. */
    getSystemReport() {
        return {
            watchdog: this.watchdog.getStatusReport(),
            metaLogic: this.metaLogic.analyze(),
            temporalStats: this.temporal.getStats(),
            catuskotiMemory: this.catuskoti.exportState(),
            totalDecisions: this.decisionCounter,
        };
    }
    /** Access individual layers for advanced usage. */
    getLayers() {
        return {
            catuskoti: this.catuskoti,
            metaLogic: this.metaLogic,
            temporal: this.temporal,
            watchdog: this.watchdog,
        };
    }
}
exports.QAntumOrchestrator = QAntumOrchestrator;
// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════
function createSmartSelectorAI() {
    return new SmartSelectorAI();
}
function createAnomalyDetector(threshold) {
    return new AnomalyDetector(threshold);
}
function createPredictiveHealing() {
    return new PredictiveHealing();
}
function createMLTrainer() {
    return new MLModelTrainer();
}
function createCatuskotiCore(anomalyThreshold) {
    return new CatuskotiLogicCore(anomalyThreshold);
}
function createTemporalResonance() {
    return new TemporalResonanceEngine();
}
function createMetaLogicArbiter() {
    return new MetaLogicArbiter();
}
function createNoeticWatchdog() {
    return new NoeticWatchdog();
}
function createQAntumOrchestrator(anomalyThreshold) {
    return new QAntumOrchestrator(anomalyThreshold);
}
exports.default = {
    SmartSelectorAI,
    AnomalyDetector,
    PredictiveHealing,
    MLModelTrainer,
    CatuskotiLogicCore,
    TemporalResonanceEngine,
    MetaLogicArbiter,
    NoeticWatchdog,
    QAntumOrchestrator,
    createSmartSelectorAI,
    createAnomalyDetector,
    createPredictiveHealing,
    createMLTrainer,
    createCatuskotiCore,
    createTemporalResonance,
    createMetaLogicArbiter,
    createNoeticWatchdog,
    createQAntumOrchestrator,
};
