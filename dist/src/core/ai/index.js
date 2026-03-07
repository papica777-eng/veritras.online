"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                               ║
 * ║   QANTUM AI MODULE                                                            ║
 * ║   "Intelligence at the Core of Testing"                                       ║
 * ║                                                                               ║
 * ║   TODO B #34-36 - Complete AI System                                          ║
 * ║                                                                               ║
 * ║   © 2025-2026 QAntum | Dimitar Prodromov                                        ║
 * ║                                                                               ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SelfHeal = exports.Activations = exports.SelectorGenerator = exports.SimilarityMetrics = exports.FeatureExtractor = exports.SelfHealingEngine = exports.PatternRecognizer = exports.TestIntelligence = exports.NeuralNetwork = exports.qantumAI = exports.QAntumAI = void 0;
// ═══════════════════════════════════════════════════════════════════════════════
// RE-EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════
__exportStar(require("./neural"), exports);
__exportStar(require("./pattern-recognizer"), exports);
__exportStar(require("./self-healing"), exports);
// ═══════════════════════════════════════════════════════════════════════════════
// IMPORTS
// ═══════════════════════════════════════════════════════════════════════════════
const neural_1 = require("./neural");
Object.defineProperty(exports, "NeuralNetwork", { enumerable: true, get: function () { return neural_1.NeuralNetwork; } });
Object.defineProperty(exports, "TestIntelligence", { enumerable: true, get: function () { return neural_1.TestIntelligence; } });
Object.defineProperty(exports, "Activations", { enumerable: true, get: function () { return neural_1.Activations; } });
const pattern_recognizer_1 = require("./pattern-recognizer");
Object.defineProperty(exports, "PatternRecognizer", { enumerable: true, get: function () { return pattern_recognizer_1.PatternRecognizer; } });
Object.defineProperty(exports, "FeatureExtractor", { enumerable: true, get: function () { return pattern_recognizer_1.FeatureExtractor; } });
Object.defineProperty(exports, "SimilarityMetrics", { enumerable: true, get: function () { return pattern_recognizer_1.SimilarityMetrics; } });
const self_healing_1 = require("./self-healing");
Object.defineProperty(exports, "SelfHealingEngine", { enumerable: true, get: function () { return self_healing_1.SelfHealingEngine; } });
Object.defineProperty(exports, "SelectorGenerator", { enumerable: true, get: function () { return self_healing_1.SelectorGenerator; } });
Object.defineProperty(exports, "SelfHeal", { enumerable: true, get: function () { return self_healing_1.SelfHeal; } });
// ═══════════════════════════════════════════════════════════════════════════════
// UNIFIED AI FACADE
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * Unified AI - Intelligence Hub
 */
class QAntumAI {
    static instance;
    intelligence;
    patternRecognizer;
    selfHealing;
    constructor() {
        this.intelligence = (0, neural_1.getTestIntelligence)();
        this.patternRecognizer = (0, pattern_recognizer_1.getPatternRecognizer)();
        this.selfHealing = (0, self_healing_1.getSelfHealingEngine)();
    }
    static getInstance() {
        if (!QAntumAI.instance) {
            QAntumAI.instance = new QAntumAI();
        }
        return QAntumAI.instance;
    }
    // ─────────────────────────────────────────────────────────────────────────
    // TEST INTELLIGENCE
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Predict if a test will fail
     */
    // Complexity: O(1)
    async predictFailure(execution) {
        const features = pattern_recognizer_1.FeatureExtractor.fromExecution({
            ...execution,
            timeOfDay: execution.timeOfDay ?? new Date().getHours(),
            dayOfWeek: execution.dayOfWeek ?? new Date().getDay(),
        });
        return this.intelligence.predictFailure(features);
    }
    /**
     * Calculate test priority
     */
    // Complexity: O(1)
    async calculatePriority(execution) {
        const features = pattern_recognizer_1.FeatureExtractor.fromExecution({
            ...execution,
            timeOfDay: new Date().getHours(),
            dayOfWeek: new Date().getDay(),
        });
        return this.intelligence.calculatePriority(features);
    }
    /**
     * Detect flaky test
     */
    // Complexity: O(1)
    async detectFlakiness(execution) {
        const features = pattern_recognizer_1.FeatureExtractor.fromExecution({
            ...execution,
            timeOfDay: new Date().getHours(),
            dayOfWeek: new Date().getDay(),
        });
        return this.intelligence.detectFlakiness(features);
    }
    /**
     * Train from historical data
     */
    // Complexity: O(1)
    async trainFromHistory(data) {
        return this.intelligence.trainFromHistory(data);
    }
    // ─────────────────────────────────────────────────────────────────────────
    // PATTERN RECOGNITION
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Learn from failure
     */
    // Complexity: O(1)
    learnFromFailure(execution, type = 'failure') {
        const features = pattern_recognizer_1.FeatureExtractor.fromExecution({
            ...execution,
            passed: false,
            timeOfDay: new Date().getHours(),
            dayOfWeek: new Date().getDay(),
        });
        return this.patternRecognizer.learn(features, type);
    }
    /**
     * Recognize pattern in failure
     */
    // Complexity: O(1)
    recognizePattern(execution) {
        const features = pattern_recognizer_1.FeatureExtractor.fromExecution({
            ...execution,
            passed: false,
            timeOfDay: new Date().getHours(),
            dayOfWeek: new Date().getDay(),
        });
        return this.patternRecognizer.recognize(features);
    }
    /**
     * Get similar patterns
     */
    // Complexity: O(1)
    findSimilarPatterns(errorMessage, limit = 5) {
        const features = pattern_recognizer_1.FeatureExtractor.fromError(errorMessage);
        const result = this.patternRecognizer.recognize(features);
        return result.matches.slice(0, limit);
    }
    /**
     * Cluster patterns
     */
    // Complexity: O(1)
    clusterPatterns(k = 5) {
        return this.patternRecognizer.cluster(k);
    }
    // ─────────────────────────────────────────────────────────────────────────
    // SELF-HEALING
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Heal a test failure
     */
    // Complexity: O(1)
    async healFailure(failure) {
        return this.selfHealing.heal(failure);
    }
    /**
     * Heal with retry
     */
    // Complexity: O(1)
    async healWithRetry(failure, executor, maxRetries) {
        return this.selfHealing.healWithRetry(failure, executor, maxRetries);
    }
    /**
     * Register custom healing strategy
     */
    // Complexity: O(1)
    registerHealingStrategy(strategy) {
        this.selfHealing.registerStrategy(strategy);
    }
    /**
     * Get healing statistics
     */
    // Complexity: O(1)
    getHealingStats() {
        return this.selfHealing.getStatistics();
    }
    // ─────────────────────────────────────────────────────────────────────────
    // NEURAL NETWORK UTILITIES
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Create a custom neural network
     */
    // Complexity: O(1)
    createNetwork(inputSize) {
        return new neural_1.NeuralNetwork(inputSize);
    }
    /**
     * Train a custom network
     */
    // Complexity: O(1)
    async trainNetwork(network, inputs, labels, config) {
        return network.train(inputs, labels, config);
    }
    // ─────────────────────────────────────────────────────────────────────────
    // ANALYSIS
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Analyze test suite health
     */
    // Complexity: O(1)
    async analyzeTestSuiteHealth(tests) {
        const flakyTests = [];
        const slowTests = [];
        const failingPatterns = [];
        const recommendations = [];
        let totalPassed = 0;
        let totalRuns = 0;
        for (const test of tests) {
            const passRate = test.runs.filter((r) => r.passed).length / test.runs.length;
            const avgDuration = test.runs.reduce((sum, r) => sum + r.duration, 0) / test.runs.length;
            totalPassed += test.runs.filter((r) => r.passed).length;
            totalRuns += test.runs.length;
            // Detect flaky (passes sometimes, fails sometimes)
            if (passRate > 0.1 && passRate < 0.9) {
                flakyTests.push(test.name);
            }
            // Detect slow (>2x average)
            const globalAvg = tests.reduce((sum, t) => sum + t.runs.reduce((s, r) => s + r.duration, 0) / t.runs.length, 0) / tests.length;
            if (avgDuration > globalAvg * 2) {
                slowTests.push(test.name);
            }
            // Analyze failures
            for (const run of test.runs.filter((r) => !r.passed && r.error)) {
                const features = pattern_recognizer_1.FeatureExtractor.fromError(run.error);
                const pattern = this.patternRecognizer.recognize(features);
                if (pattern.matches.length > 0) {
                    failingPatterns.push(pattern);
                }
            }
        }
        // Generate recommendations
        if (flakyTests.length > 0) {
            recommendations.push(`${flakyTests.length} flaky tests detected - consider adding retries or stabilizing`);
        }
        if (slowTests.length > 0) {
            recommendations.push(`${slowTests.length} slow tests detected - consider optimization or parallelization`);
        }
        if (totalPassed / totalRuns < 0.95) {
            recommendations.push('Overall pass rate is below 95% - review failing patterns');
        }
        return {
            overallHealth: totalPassed / totalRuns,
            flakyTests,
            slowTests,
            failingPatterns,
            recommendations,
        };
    }
    // ─────────────────────────────────────────────────────────────────────────
    // UTILITIES
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Extract features from execution
     */
    // Complexity: O(1)
    extractFeatures(execution) {
        return pattern_recognizer_1.FeatureExtractor.fromExecution({
            ...execution,
            timeOfDay: execution.timeOfDay ?? new Date().getHours(),
            dayOfWeek: execution.dayOfWeek ?? new Date().getDay(),
        });
    }
    /**
     * Calculate similarity between feature vectors
     */
    // Complexity: O(1)
    calculateSimilarity(a, b) {
        return pattern_recognizer_1.SimilarityMetrics.cosine(a, b);
    }
    /**
     * Clear all AI data
     */
    // Complexity: O(1)
    reset() {
        this.patternRecognizer.clear();
        this.selfHealing.clearHistory();
        this.selfHealing.clearCache();
    }
}
exports.QAntumAI = QAntumAI;
// ═══════════════════════════════════════════════════════════════════════════════
// CONVENIENCE EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════
exports.qantumAI = QAntumAI.getInstance();
exports.default = QAntumAI;
