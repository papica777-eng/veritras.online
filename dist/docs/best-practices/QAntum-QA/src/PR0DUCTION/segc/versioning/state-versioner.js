"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * QAntum
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * @copyright 2025 Димитър Продромов (Dimitar Prodromov). All Rights Reserved.
 * @license PROPRIETARY AND CONFIDENTIAL
 *
 * This file is part of QAntum.
 * Unauthorized copying, modification, distribution, or use of this file,
 * via any medium, is strictly prohibited without express written permission.
 *
 * For licensing inquiries: dimitar.prodromov@QAntum.dev
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
exports.StateVersioningSystem = void 0;
const events_1 = require("events");
const crypto = __importStar(require("crypto"));
/** Generate unique ID */
function generateId(prefix) {
    return `${prefix}_${crypto.randomBytes(4).toString('hex')}`;
}
/**
 * State Versioning System
 *
 * Features:
 * - Multiple strategy versions running in parallel
 * - Automatic winner selection based on metrics
 * - Gradual rollout with traffic splitting
 * - Rollback capability
 */
class StateVersioningSystem extends events_1.EventEmitter {
    /** Configuration */
    config;
    /** Registered versions */
    versions = new Map();
    /** Version metrics */
    metrics = new Map();
    /** Active version ID */
    activeVersionId = null;
    /** Baseline version ID */
    baselineVersionId = null;
    /** Traffic allocation */
    trafficAllocation = new Map();
    /** Experiment history */
    experiments = [];
    /** Statistics */
    stats = {
        versionsCreated: 0,
        experimentsRun: 0,
        winnersSelected: 0,
        rollbacksPerformed: 0,
        totalExecutions: 0,
    };
    /** Start time */
    startTime;
    constructor(config) {
        super();
        this.config = {
            enabled: config?.enabled ?? true,
            minSampleSize: config?.minSampleSize || 100,
            confidenceLevel: config?.confidenceLevel || 0.95,
            maxConcurrentVersions: config?.maxConcurrentVersions || 5,
            autoPromote: config?.autoPromote ?? false,
        };
        this.startTime = new Date();
    }
    /**
     * Create a new version
     */
    createVersion(options) {
        const version = {
            id: generateId('ver'),
            name: options.name,
            description: options.description,
            createdAt: new Date(),
            strategy: options.strategy,
            isActive: false,
            isBaseline: options.isBaseline || false,
        };
        this.versions.set(version.id, version);
        this.metrics.set(version.id, this.createEmptyMetrics());
        this.stats.versionsCreated++;
        if (options.isBaseline) {
            this.baselineVersionId = version.id;
        }
        this.emit('versionCreated', { version });
        return version;
    }
    /**
     * Create empty metrics object
     */
    createEmptyMetrics() {
        return {
            successCount: 0,
            failureCount: 0,
            totalExecutions: 0,
            avgExecutionTime: 0,
            lastExecutedAt: new Date(),
            errorMessages: [],
        };
    }
    /**
     * Activate a version
     */
    activateVersion(versionId) {
        const version = this.versions.get(versionId);
        if (!version) {
            throw new Error(`Version not found: ${versionId}`);
        }
        // Deactivate previous
        if (this.activeVersionId) {
            const prev = this.versions.get(this.activeVersionId);
            if (prev)
                prev.isActive = false;
        }
        version.isActive = true;
        this.activeVersionId = versionId;
        // Default traffic allocation
        this.trafficAllocation.set(versionId, 1.0);
        this.emit('versionActivated', { versionId });
        return true;
    }
    /**
     * Start an A/B experiment
     */
    startExperiment(versionAId, versionBId, trafficSplit = 0.5) {
        const versionA = this.versions.get(versionAId);
        const versionB = this.versions.get(versionBId);
        if (!versionA || !versionB) {
            throw new Error('Both versions must exist');
        }
        if (trafficSplit < 0 || trafficSplit > 1) {
            throw new Error('Traffic split must be between 0 and 1');
        }
        const experimentId = generateId('exp');
        // Set traffic allocation
        this.trafficAllocation.set(versionAId, trafficSplit);
        this.trafficAllocation.set(versionBId, 1 - trafficSplit);
        // Reset metrics for fair comparison
        this.metrics.set(versionAId, this.createEmptyMetrics());
        this.metrics.set(versionBId, this.createEmptyMetrics());
        // Mark both as active
        versionA.isActive = true;
        versionB.isActive = true;
        this.experiments.push({
            id: experimentId,
            versionA: versionAId,
            versionB: versionBId,
            startedAt: new Date(),
            metrics: {
                versionA: this.createEmptyMetrics(),
                versionB: this.createEmptyMetrics(),
            },
        });
        this.stats.experimentsRun++;
        this.emit('experimentStarted', {
            experimentId,
            versionA: versionAId,
            versionB: versionBId,
            trafficSplit,
        });
        return experimentId;
    }
    /**
     * Get version to use (based on traffic allocation)
     */
    selectVersion() {
        const activeVersions = Array.from(this.versions.values())
            .filter(v => v.isActive);
        if (activeVersions.length === 0) {
            return null;
        }
        if (activeVersions.length === 1) {
            return activeVersions[0];
        }
        // Random selection based on traffic allocation
        const random = Math.random();
        let cumulative = 0;
        for (const version of activeVersions) {
            const allocation = this.trafficAllocation.get(version.id) || 0;
            cumulative += allocation;
            if (random <= cumulative) {
                return version;
            }
        }
        return activeVersions[0];
    }
    /**
     * Record execution result
     */
    recordResult(versionId, result) {
        const metrics = this.metrics.get(versionId);
        if (!metrics)
            return;
        metrics.totalExecutions++;
        this.stats.totalExecutions++;
        if (result.success) {
            metrics.successCount++;
        }
        else {
            metrics.failureCount++;
            if (result.error) {
                metrics.errorMessages.push(result.error);
                // Keep only last 10 errors
                if (metrics.errorMessages.length > 10) {
                    metrics.errorMessages.shift();
                }
            }
        }
        // Update average execution time (EMA)
        const alpha = 0.2;
        metrics.avgExecutionTime =
            metrics.avgExecutionTime * (1 - alpha) + result.executionTime * alpha;
        metrics.lastExecutedAt = new Date();
        this.emit('resultRecorded', { versionId, result });
        // Check if experiment can be concluded
        this.checkExperimentConclusion();
    }
    /**
     * Check if any experiment can be concluded
     */
    checkExperimentConclusion() {
        for (const experiment of this.experiments) {
            if (experiment.endedAt)
                continue; // Already concluded
            const metricsA = this.metrics.get(experiment.versionA);
            const metricsB = this.metrics.get(experiment.versionB);
            if (!metricsA || !metricsB)
                continue;
            // Check if we have enough samples
            if (metricsA.totalExecutions < (this.config.minSampleSize || 100) ||
                metricsB.totalExecutions < (this.config.minSampleSize || 100)) {
                continue;
            }
            // Calculate success rates
            const successRateA = metricsA.successCount / metricsA.totalExecutions;
            const successRateB = metricsB.successCount / metricsB.totalExecutions;
            // Simple statistical significance check
            const significant = this.isStatisticallySignificant(metricsA.successCount, metricsA.totalExecutions, metricsB.successCount, metricsB.totalExecutions);
            if (significant) {
                const winner = successRateA > successRateB ? experiment.versionA : experiment.versionB;
                this.concludeExperiment(experiment.id, winner);
            }
        }
    }
    /**
     * Simple statistical significance test
     */
    isStatisticallySignificant(successA, totalA, successB, totalB) {
        // Z-test for two proportions
        const pA = successA / totalA;
        const pB = successB / totalB;
        const pPooled = (successA + successB) / (totalA + totalB);
        const se = Math.sqrt(pPooled * (1 - pPooled) * (1 / totalA + 1 / totalB));
        const z = Math.abs(pA - pB) / se;
        // z > 1.96 for 95% confidence
        const zThreshold = this.config.confidenceLevel === 0.99 ? 2.576 :
            this.config.confidenceLevel === 0.95 ? 1.96 : 1.645;
        return z > zThreshold;
    }
    /**
     * Conclude an experiment
     */
    concludeExperiment(experimentId, winnerId) {
        const experiment = this.experiments.find(e => e.id === experimentId);
        if (!experiment || experiment.endedAt)
            return;
        experiment.endedAt = new Date();
        experiment.winner = winnerId;
        experiment.metrics = {
            versionA: { ...this.metrics.get(experiment.versionA) },
            versionB: { ...this.metrics.get(experiment.versionB) },
        };
        this.stats.winnersSelected++;
        // Deactivate loser
        const loserId = winnerId === experiment.versionA ? experiment.versionB : experiment.versionA;
        const loser = this.versions.get(loserId);
        if (loser)
            loser.isActive = false;
        // Reset traffic to winner only
        this.trafficAllocation.clear();
        this.trafficAllocation.set(winnerId, 1.0);
        // Auto-promote if configured
        if (this.config.autoPromote) {
            this.activeVersionId = winnerId;
        }
        this.emit('experimentConcluded', { experimentId, winner: winnerId, loser: loserId });
    }
    /**
     * Rollback to baseline
     */
    rollbackToBaseline() {
        if (!this.baselineVersionId) {
            throw new Error('No baseline version set');
        }
        // Deactivate all versions except baseline
        for (const version of this.versions.values()) {
            version.isActive = version.id === this.baselineVersionId;
        }
        this.activeVersionId = this.baselineVersionId;
        this.trafficAllocation.clear();
        this.trafficAllocation.set(this.baselineVersionId, 1.0);
        this.stats.rollbacksPerformed++;
        this.emit('rolledBackToBaseline', { versionId: this.baselineVersionId });
        return true;
    }
    /**
     * Get version by ID
     */
    getVersion(versionId) {
        return this.versions.get(versionId);
    }
    /**
     * Get version metrics
     */
    getVersionMetrics(versionId) {
        return this.metrics.get(versionId);
    }
    /**
     * Get all versions
     */
    getAllVersions() {
        return Array.from(this.versions.values());
    }
    /**
     * Get active versions
     */
    getActiveVersions() {
        return Array.from(this.versions.values()).filter(v => v.isActive);
    }
    /**
     * Get experiment by ID
     */
    getExperiment(experimentId) {
        return this.experiments.find(e => e.id === experimentId);
    }
    /**
     * Get all experiments
     */
    getExperiments() {
        return [...this.experiments];
    }
    /**
     * Get statistics
     */
    getStats() {
        return {
            ...this.stats,
            versionCount: this.versions.size,
            activeVersionCount: this.getActiveVersions().length,
            activeExperiments: this.experiments.filter(e => !e.endedAt).length,
            uptime: Date.now() - this.startTime.getTime(),
        };
    }
    /**
     * Export state
     */
    exportState() {
        return {
            versions: Array.from(this.versions.values()),
            metrics: Array.from(this.metrics.entries()).map(([id, m]) => ({
                versionId: id,
                metrics: m,
            })),
            experiments: this.experiments,
            activeVersionId: this.activeVersionId,
            baselineVersionId: this.baselineVersionId,
        };
    }
    /**
     * Clear all
     */
    clear() {
        this.versions.clear();
        this.metrics.clear();
        this.trafficAllocation.clear();
        this.experiments = [];
        this.activeVersionId = null;
        this.baselineVersionId = null;
        this.emit('cleared');
    }
    /**
     * Shutdown
     */
    async shutdown() {
        this.emit('shutdown', { stats: this.getStats() });
    }
}
exports.StateVersioningSystem = StateVersioningSystem;
exports.default = StateVersioningSystem;
