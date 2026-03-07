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
exports.HardwareTelemetry = exports.ThermalAwarePool = void 0;
const events_1 = require("events");
const os = __importStar(require("os"));
const hardware_telemetry_1 = require("../telemetry/hardware-telemetry");
Object.defineProperty(exports, "HardwareTelemetry", { enumerable: true, get: function () { return hardware_telemetry_1.HardwareTelemetry; } });
// ═══════════════════════════════════════════════════════════════════════════════
// 🌡️ THERMAL AWARE POOL CLASS
// ═══════════════════════════════════════════════════════════════════════════════
class ThermalAwarePool extends events_1.EventEmitter {
    config;
    telemetry;
    currentState = 'cool';
    currentTemperature = 50;
    currentConcurrency;
    monitorInterval = null;
    throttleCount = 0;
    completedTasks = 0;
    totalTaskTime = 0;
    taskQueue = [];
    activeWorkers = 0;
    constructor(config) {
        super();
        const cpuCount = os.cpus().length;
        this.config = {
            throttleThreshold: config?.throttleThreshold ?? 90,
            criticalThreshold: config?.criticalThreshold ?? 95,
            coolThreshold: config?.coolThreshold ?? 70,
            maxInstancesCool: config?.maxInstancesCool ?? 40,
            minInstancesHot: config?.minInstancesHot ?? 4,
            checkInterval: config?.checkInterval ?? 2000,
            enableDynamicScaling: config?.enableDynamicScaling ?? true
        };
        // Start with moderate concurrency
        this.currentConcurrency = Math.min(cpuCount, this.config.maxInstancesCool);
        // Initialize telemetry
        this.telemetry = new hardware_telemetry_1.HardwareTelemetry({
            cpuThreshold: this.config.throttleThreshold,
            memoryThreshold: 85,
            checkInterval: this.config.checkInterval
        });
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // 🚀 LIFECYCLE
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Start thermal monitoring
     */
    start() {
        if (this.monitorInterval)
            return;
        // Start telemetry monitoring
        this.telemetry.startMonitoring();
        // Subscribe to telemetry events
        this.telemetry.on('metrics', (metrics) => {
            this.handleMetrics(metrics);
        });
        this.emit('started', { concurrency: this.currentConcurrency });
    }
    /**
     * Stop thermal monitoring
     */
    stop() {
        this.telemetry.stopMonitoring();
        if (this.monitorInterval) {
            clearInterval(this.monitorInterval);
            this.monitorInterval = null;
        }
        this.emit('stopped');
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // 🌡️ THERMAL MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Handle telemetry metrics
     */
    handleMetrics(metrics) {
        // Estimate temperature from CPU usage (real implementation would use actual sensors)
        // AMD Ryzen 7 7435HS: idle ~45°C, full load ~90°C
        const baseTemp = 45;
        const loadFactor = metrics.cpu.usage / 100;
        const estimatedTemp = baseTemp + (loadFactor * 50); // 45-95°C range
        this.currentTemperature = Math.round(estimatedTemp * 10) / 10;
        // Determine new state
        const newState = this.calculateState(this.currentTemperature);
        // Handle state change
        if (newState !== this.currentState) {
            const previousState = this.currentState;
            this.currentState = newState;
            if (this.config.enableDynamicScaling) {
                this.adjustConcurrency();
            }
            const event = {
                previousState,
                newState,
                temperature: this.currentTemperature,
                recommendedConcurrency: this.currentConcurrency,
                timestamp: Date.now()
            };
            this.emit('state-changed', event);
            if (newState === 'hot' || newState === 'critical') {
                this.throttleCount++;
                this.emit('throttling', event);
            }
        }
        this.emit('temperature', {
            temperature: this.currentTemperature,
            state: this.currentState,
            concurrency: this.currentConcurrency
        });
    }
    /**
     * Calculate thermal state from temperature
     */
    calculateState(temp) {
        if (temp >= this.config.criticalThreshold + 5) {
            return 'emergency';
        }
        if (temp >= this.config.criticalThreshold) {
            return 'critical';
        }
        if (temp >= this.config.throttleThreshold) {
            return 'hot';
        }
        if (temp > this.config.coolThreshold) {
            return 'warm';
        }
        return 'cool';
    }
    /**
     * Adjust concurrency based on thermal state
     */
    adjustConcurrency() {
        const { maxInstancesCool, minInstancesHot, coolThreshold, throttleThreshold } = this.config;
        let newConcurrency;
        switch (this.currentState) {
            case 'emergency':
                // Emergency mode - minimum workers
                newConcurrency = Math.max(2, Math.floor(minInstancesHot / 2));
                break;
            case 'critical':
                // Critical - just above minimum
                newConcurrency = minInstancesHot;
                break;
            case 'hot':
                // Hot - reduced capacity
                newConcurrency = Math.floor(minInstancesHot + (maxInstancesCool - minInstancesHot) * 0.3);
                break;
            case 'warm':
                // Warm - moderate capacity
                const warmRange = throttleThreshold - coolThreshold;
                const warmPosition = (this.currentTemperature - coolThreshold) / warmRange;
                const capacityReduction = warmPosition * 0.4; // Up to 40% reduction
                newConcurrency = Math.floor(maxInstancesCool * (1 - capacityReduction));
                break;
            case 'cool':
            default:
                // Cool - full power!
                newConcurrency = maxInstancesCool;
                break;
        }
        if (newConcurrency !== this.currentConcurrency) {
            const previousConcurrency = this.currentConcurrency;
            this.currentConcurrency = newConcurrency;
            this.emit('concurrency-changed', {
                from: previousConcurrency,
                to: newConcurrency,
                state: this.currentState,
                temperature: this.currentTemperature
            });
        }
    }
    /**
     * Set temperature manually (for testing or external sensors)
     */
    setTemperature(temp) {
        this.currentTemperature = temp;
        const newState = this.calculateState(temp);
        if (newState !== this.currentState) {
            this.currentState = newState;
            if (this.config.enableDynamicScaling) {
                this.adjustConcurrency();
            }
        }
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // 📋 TASK EXECUTION
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Execute task with thermal-aware throttling
     */
    async execute(task) {
        return new Promise((resolve, reject) => {
            this.taskQueue.push({
                task: task,
                resolve: resolve,
                reject
            });
            this.processQueue();
        });
    }
    /**
     * Execute batch of tasks with thermal-aware concurrency
     */
    async executeBatch(tasks) {
        const results = [];
        const promises = tasks.map(task => this.execute(task));
        for (const promise of promises) {
            results.push(await promise);
        }
        return results;
    }
    /**
     * Process task queue
     */
    async processQueue() {
        while (this.taskQueue.length > 0 && this.activeWorkers < this.currentConcurrency) {
            const item = this.taskQueue.shift();
            if (!item)
                break;
            this.activeWorkers++;
            const startTime = Date.now();
            try {
                const result = await item.task();
                const duration = Date.now() - startTime;
                this.completedTasks++;
                this.totalTaskTime += duration;
                item.resolve(result);
            }
            catch (error) {
                item.reject(error instanceof Error ? error : new Error(String(error)));
            }
            this.activeWorkers--;
            // Continue processing
            if (this.taskQueue.length > 0) {
                this.processQueue();
            }
        }
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // 📊 STATUS & METRICS
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Get current metrics
     */
    getMetrics() {
        return {
            currentTemperature: this.currentTemperature,
            state: this.currentState,
            currentConcurrency: this.currentConcurrency,
            maxConcurrency: this.config.maxInstancesCool,
            queueLength: this.taskQueue.length,
            completedTasks: this.completedTasks,
            throttleCount: this.throttleCount,
            avgTaskTime: this.completedTasks > 0
                ? this.totalTaskTime / this.completedTasks
                : 0
        };
    }
    /**
     * Get current state
     */
    getState() {
        return this.currentState;
    }
    /**
     * Get current concurrency limit
     */
    getConcurrency() {
        return this.currentConcurrency;
    }
    /**
     * Get temperature
     */
    getTemperature() {
        return this.currentTemperature;
    }
    /**
     * Get configuration
     */
    getConfig() {
        return { ...this.config };
    }
    /**
     * Update configuration
     */
    updateConfig(config) {
        this.config = { ...this.config, ...config };
        if (this.config.enableDynamicScaling) {
            this.adjustConcurrency();
        }
        this.emit('config-updated', this.config);
    }
    /**
     * Force concurrency (override thermal scaling)
     */
    forceConcurrency(concurrency) {
        this.currentConcurrency = Math.max(1, Math.min(concurrency, this.config.maxInstancesCool));
        this.emit('concurrency-forced', this.currentConcurrency);
    }
    /**
     * Get queue length
     */
    getQueueLength() {
        return this.taskQueue.length;
    }
    /**
     * Check if throttling is active
     */
    isThrottling() {
        return this.currentState === 'hot' || this.currentState === 'critical' || this.currentState === 'emergency';
    }
}
exports.ThermalAwarePool = ThermalAwarePool;
exports.default = ThermalAwarePool;
