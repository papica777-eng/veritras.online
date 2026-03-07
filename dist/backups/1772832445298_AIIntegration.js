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
exports.MLModelTrainer = exports.PredictiveHealing = exports.AnomalyDetector = exports.SmartSelectorAI = void 0;
exports.createSmartSelectorAI = createSmartSelectorAI;
exports.createAnomalyDetector = createAnomalyDetector;
exports.createPredictiveHealing = createPredictiveHealing;
exports.createMLTrainer = createMLTrainer;
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
    // Complexity: O(N) — linear iteration
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
    // Complexity: O(1) — hash/map lookup
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
    // Complexity: O(N log N) — sort operation
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
    // Complexity: O(1)
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
    // Complexity: O(N) — linear iteration
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
    // Complexity: O(N log N) — sort operation
    rankCandidates(candidates, features) {
        return candidates
            .map(c => ({
            ...c,
            confidence: this.model.predictConfidence(c.selector, features)
        }))
            .sort((a, b) => b.confidence - a.confidence);
    }
    // Complexity: O(N) — linear iteration
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
    // Complexity: O(1)
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
    // Complexity: O(1)
    hashDescription(description) {
        return description.toLowerCase().replace(/\s+/g, '-');
    }
    // Complexity: O(1)
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
    // Complexity: O(N) — linear iteration
    predict(features) {
        let sum = this.bias;
        for (let i = 0; i < features.length && i < this.weights.length; i++) {
            sum += features[i] * this.weights[i];
        }
        return this.sigmoid(sum);
    }
    // Complexity: O(N) — potential recursive descent
    predictConfidence(selector, features) {
        const selectorFeatures = this.extractFeatures(selector, features);
        return this.predict(selectorFeatures);
    }
    // Complexity: O(N) — linear iteration
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
    // Complexity: O(N) — linear iteration
    updateWeights(features, success) {
        const target = success ? 1 : 0;
        const prediction = this.predict(features);
        const error = target - prediction;
        for (let i = 0; i < this.weights.length && i < features.length; i++) {
            this.weights[i] += this.learningRate * error * features[i];
        }
        this.bias += this.learningRate * error;
    }
    // Complexity: O(1)
    sigmoid(x) {
        return 1 / (1 + Math.exp(-x));
    }
    // Complexity: O(1)
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
    // Complexity: O(N) — linear iteration
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
    // Complexity: O(1) — hash/map lookup
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
    // Complexity: O(1) — hash/map lookup
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
    // Complexity: O(N) — linear iteration
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
    // Complexity: O(N) — linear iteration
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
    // Complexity: O(N) — linear iteration
    importBaselines(data) {
        for (const [key, value] of Object.entries(data)) {
            this.baselines.set(key, value);
        }
    }
    // Complexity: O(N) — linear iteration
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
    // Complexity: O(1) — hash/map lookup
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
    // Complexity: O(N) — linear iteration
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
    // Complexity: O(1) — hash/map lookup
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
    // Complexity: O(N) — linear iteration
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
    // Complexity: O(N) — linear iteration
    findMatchingPatterns(selector, context) {
        return this.failurePatterns.filter(p => (p.selector === selector || p.selector === '*') &&
            this.matchesConditions(p.conditions, context));
    }
    // Complexity: O(N) — linear iteration
    matchesConditions(pattern, context) {
        for (const [key, value] of Object.entries(pattern)) {
            if (context[key] !== value)
                return false;
        }
        return true;
    }
    // Complexity: O(1)
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
    // Complexity: O(1)
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
    // Complexity: O(1)
    addSample(features, label, metadata) {
        this.trainingData.push({ features, label, metadata });
    }
    /**
     * Train model
     */
    // Complexity: O(N*M) — nested iteration detected
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
    // Complexity: O(1)
    predict(features) {
        return this.model.forward(features);
    }
    /**
     * Save model
     */
    // Complexity: O(1)
    saveModel(filePath) {
        const modelData = this.model.export();
        fs.writeFileSync(filePath, JSON.stringify(modelData, null, 2));
    }
    /**
     * Load model
     */
    // Complexity: O(1)
    loadModel(filePath) {
        const modelData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        this.model.import(modelData);
    }
    /**
     * Export training data
     */
    // Complexity: O(1)
    exportTrainingData(filePath) {
        fs.writeFileSync(filePath, JSON.stringify(this.trainingData, null, 2));
    }
    /**
     * Import training data
     */
    // Complexity: O(1)
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
    // Complexity: O(N*M) — nested iteration detected
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
    // Complexity: O(N*M) — nested iteration detected
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
    // Complexity: O(1)
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
    // Complexity: O(1)
    sigmoid(x) {
        return 1 / (1 + Math.exp(-Math.max(-500, Math.min(500, x))));
    }
    // Complexity: O(1)
    sigmoidDerivative(x) {
        return x * (1 - x);
    }
}
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
exports.default = {
    SmartSelectorAI,
    AnomalyDetector,
    PredictiveHealing,
    MLModelTrainer,
    createSmartSelectorAI,
    createAnomalyDetector,
    createPredictiveHealing,
    createMLTrainer
};
