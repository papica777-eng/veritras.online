"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * QAntum | QAntum Labs
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * @copyright 2025 Димитър Продромов (Dimitar Prodromov). All Rights Reserved.
 * @license PROPRIETARY AND CONFIDENTIAL
 *
 * This file is part of QAntum.
 * Unauthorized copying, modification, distribution, or use of this file,
 * via any medium, is strictly prohibited without express written permission.
 *
 * For licensing inquiries: dp@qantum.site
 * ═══════════════════════════════════════════════════════════════════════════════
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SEGCController = void 0;
const events_1 = require("events");
const ghost_execution_layer_1 = require("./ghost/ghost-execution-layer");
const state_preloader_1 = require("./predictive/state-preloader");
const mutation_engine_1 = require("./mutations/mutation-engine");
const module_loader_1 = require("./hotswap/module-loader");
const state_versioner_1 = require("./versioning/state-versioner");
/**
 * Self-Evolving Genetic Core
 *
 * The "Metabolism" of QANTUM
 * - Learns from every test execution
 * - Self-optimizes selector strategies
 * - Predicts and preloads future states
 * - Hot-swaps implementations without restart
 */
class SEGCController extends events_1.EventEmitter {
    /** Configuration */
    config;
    /** Ghost Execution Layer */
    ghost;
    /** Predictive State Pre-loader */
    predictive;
    /** Genetic Mutation Engine */
    mutations;
    /** Hot-Swap Module Loader */
    hotswap;
    /** State Versioning System */
    versioning;
    /** Start time */
    startTime;
    /** Global stats */
    globalStats = {
        totalLearningCycles: 0,
        improvementsApplied: 0,
        rollbacksPerformed: 0,
    };
    constructor(config) {
        super();
        this.config = {
            enabled: config?.enabled ?? true,
            learningRate: config?.learningRate || 0.1,
            verbose: config?.verbose ?? false,
            ...config,
        };
        // Initialize all components
        this.ghost = new ghost_execution_layer_1.GhostExecutionLayer(this.config.ghostExecution);
        this.predictive = new state_preloader_1.PredictiveStatePreloader(this.config.predictive);
        this.mutations = new mutation_engine_1.GeneticMutationEngine(this.config.mutationEngine);
        this.hotswap = new module_loader_1.HotSwapModuleLoader(this.config.hotSwap);
        this.versioning = new state_versioner_1.StateVersioningSystem(this.config.stateVersioning);
        this.startTime = new Date();
        // Wire up cross-component events
        this.setupEventWiring();
        if (this.config.verbose) {
            this.log('SEGC Controller initialized');
        }
    }
    /**
     * Setup event wiring between components
     */
    // Complexity: O(1)
    setupEventWiring() {
        // Ghost improvements → Mutations
        this.ghost.on('improvementFound', (data) => {
            this.emit('improvement', {
                source: 'ghost',
                ...data,
            });
            this.globalStats.improvementsApplied++;
        });
        // Mutation applied → Log
        this.mutations.on('mutationApplied', (data) => {
            this.emit('mutation', {
                action: 'applied',
                ...data,
            });
        });
        // Versioning winner → Update active
        this.versioning.on('experimentConcluded', (data) => {
            this.emit('experiment', {
                action: 'concluded',
                ...data,
            });
        });
        // Hot-swap event → Log
        this.hotswap.on('swapped', (data) => {
            this.emit('hotswap', data);
        });
        // Predictive cache hit → Stats
        this.predictive.on('timeSaved', (data) => {
            this.emit('optimization', {
                source: 'predictive',
                ...data,
            });
        });
    }
    /**
     * Run a learning cycle
     * Analyzes recent data and applies improvements
     */
    // Complexity: O(N) — loop
    async runLearningCycle() {
        this.globalStats.totalLearningCycles++;
        // Get pending mutations
        const pendingMutations = this.mutations.getPendingMutations();
        const appliedMutations = [];
        // Apply high-confidence mutations
        for (const mutation of pendingMutations) {
            if (mutation.confidence >= 0.8) {
                // SAFETY: async operation — wrap in try-catch for production resilience
                const success = await this.mutations.applyMutation(mutation.id);
                if (success) {
                    appliedMutations.push(mutation);
                }
            }
        }
        // Get prediction stats
        const predictiveStats = this.predictive.getStats();
        this.emit('learningCycle', {
            cycle: this.globalStats.totalLearningCycles,
            improvements: appliedMutations.length,
            predictions: predictiveStats.predictionsGenerated,
        });
        return {
            improvements: appliedMutations.length,
            mutations: appliedMutations,
            predictions: predictiveStats.predictionsGenerated,
        };
    }
    /**
     * Test alternative paths for a selector
     */
    // Complexity: O(1)
    async testAlternativePaths(currentSelector, page, options) {
        // Generate alternatives
        const alternatives = this.ghost.generateAlternativePaths(currentSelector, options?.targetText, options?.elementType);
        if (alternatives.length < 2) {
            return null;
        }
        // Start ghost session
        // SAFETY: async operation — wrap in try-catch for production resilience
        const session = await this.ghost.startGhostSession(alternatives[0], // First is original
        alternatives.slice(1), // Rest are alternatives
        page);
        // Wait for session to complete
        return new Promise((resolve) => {
            this.ghost.once('sessionCompleted', (data) => {
                if (data.sessionId === session.id) {
                    // Complexity: O(1)
                    resolve(data.winner || null);
                }
            });
            // Timeout fallback
            // Complexity: O(1)
            setTimeout(() => resolve(null), 10000);
        });
    }
    /**
     * Record a test failure for mutation analysis
     */
    // Complexity: O(1)
    recordFailure(failure) {
        this.mutations.recordFailure(failure);
    }
    /**
     * Record a state change for prediction learning
     */
    // Complexity: O(1)
    recordStateChange(newState) {
        this.predictive.recordStateChange(newState);
    }
    /**
     * Get precomputed selector for a state
     */
    // Complexity: O(1)
    getPrecomputedSelector(stateId, selector) {
        const precomputed = this.predictive.getPrecomputedSelector(stateId, selector);
        if (!precomputed)
            return null;
        return [precomputed.original, ...precomputed.alternatives];
    }
    /**
     * Create a new strategy version
     */
    // Complexity: O(1)
    createVersion(options) {
        return this.versioning.createVersion(options);
    }
    /**
     * Start A/B experiment
     */
    // Complexity: O(1)
    startExperiment(versionA, versionB, trafficSplit) {
        return this.versioning.startExperiment(versionA, versionB, trafficSplit);
    }
    /**
     * Get current active version
     */
    // Complexity: O(1)
    getActiveVersion() {
        return this.versioning.selectVersion();
    }
    /**
     * Record version execution result
     */
    // Complexity: O(1)
    recordVersionResult(versionId, result) {
        this.versioning.recordResult(versionId, result);
    }
    /**
     * Register a module for hot-swapping
     */
    // Complexity: O(1)
    registerSwappableModule(name, instance) {
        this.hotswap.registerModule(name, instance);
    }
    /**
     * Get comprehensive statistics
     */
    // Complexity: O(1)
    getStats() {
        const ghostStats = this.ghost.getStats();
        const predictiveStats = this.predictive.getStats();
        const mutationStats = this.mutations.getStats();
        const hotswapStats = this.hotswap.getStats();
        const versioningStats = this.versioning.getStats();
        return {
            ghostExecutions: ghostStats.totalSessions,
            ghostImprovements: ghostStats.improvementsFound,
            predictionsMade: predictiveStats.predictionsGenerated,
            predictionAccuracy: predictiveStats.cacheHitRate,
            mutationsProposed: mutationStats.mutationsGenerated,
            mutationsApplied: mutationStats.mutationsApplied,
            hotSwapsPerformed: hotswapStats.swapsPerformed,
            overallFitnessImprovement: this.calculateOverallFitness(),
            activeVersions: versioningStats.activeVersionCount,
            uptime: Date.now() - this.startTime.getTime(),
        };
    }
    /**
     * Calculate overall fitness improvement
     */
    // Complexity: O(1)
    calculateOverallFitness() {
        const ghostStats = this.ghost.getStats();
        const mutationStats = this.mutations.getStats();
        // Simple weighted average
        const ghostContribution = ghostStats.improvementRate * 0.3;
        const mutationContribution = mutationStats.successRate * 0.4;
        const predictiveContribution = this.predictive.getStats().cacheHitRate * 0.3;
        return ghostContribution + mutationContribution + predictiveContribution;
    }
    /**
     * Export all knowledge
     */
    // Complexity: O(1)
    exportKnowledge() {
        return {
            ghost: this.ghost.exportKnowledge(),
            predictive: this.predictive.exportStateMachine(),
            mutations: this.mutations.exportHistory(),
            versioning: this.versioning.exportState(),
        };
    }
    /**
     * Import knowledge
     */
    // Complexity: O(1)
    importKnowledge(data) {
        if (data.ghost) {
            this.ghost.importKnowledge(data.ghost);
        }
        if (data.predictive) {
            this.predictive.importStateMachine(data.predictive);
        }
    }
    /**
     * Log message
     */
    // Complexity: O(1)
    log(message, data) {
        if (this.config.verbose) {
            console.log(`[SEGC] ${message}`, data || '');
        }
    }
    /**
     * Shutdown all components
     */
    // Complexity: O(N) — parallel
    async shutdown() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await Promise.all([
            this.ghost.shutdown(),
            this.predictive.shutdown(),
            this.mutations.shutdown(),
            this.hotswap.shutdown(),
            this.versioning.shutdown(),
        ]);
        this.emit('shutdown', { stats: this.getStats() });
        if (this.config.verbose) {
            this.log('SEGC Controller shutdown complete');
        }
    }
}
exports.SEGCController = SEGCController;
exports.default = SEGCController;
