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
exports.hardwareTelemetry = exports.HardwareTelemetry = void 0;
const events_1 = require("events");
const os = __importStar(require("os"));
/**
 * ⚡ HardwareTelemetry - System Monitoring Engine
 *
 * Provides real-time monitoring of CPU, memory, and system metrics.
 * Automatically throttles workload when system resources are strained.
 */
class HardwareTelemetry extends events_1.EventEmitter {
    lastCpuInfo = [];
    lastCpuTime = 0;
    monitoringInterval = null;
    metricsHistory = [];
    maxHistoryLength = 100;
    // Throttling state
    throttleConfig;
    isThrottled = false;
    lastThrottleTime = 0;
    throttleCount = 0;
    // Worker management
    workerPool = new Map();
    taskQueue = [];
    completedTasks = 0;
    constructor(config) {
        super();
        this.throttleConfig = {
            cpuThreshold: 90,
            memoryThreshold: 85,
            throttleDelay: 100,
            minWorkers: 2,
            maxWorkers: Math.max(2, os.cpus().length - 2),
            checkInterval: 1000,
            cooldownPeriod: 5000,
            ...config
        };
        // Initialize CPU baseline
        this.lastCpuInfo = os.cpus();
        this.lastCpuTime = Date.now();
    }
    /**
     * Start monitoring system resources
     */
    startMonitoring() {
        if (this.monitoringInterval)
            return;
        this.emit('monitoring-started');
        this.monitoringInterval = setInterval(() => {
            const metrics = this.collectMetrics();
            this.metricsHistory.push(metrics);
            // Trim history
            if (this.metricsHistory.length > this.maxHistoryLength) {
                this.metricsHistory.shift();
            }
            // Check for throttling
            this.checkThrottling(metrics);
            this.emit('metrics', metrics);
        }, this.throttleConfig.checkInterval);
    }
    /**
     * Stop monitoring
     */
    stopMonitoring() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
            this.emit('monitoring-stopped');
        }
    }
    /**
     * Collect current system metrics
     */
    collectMetrics() {
        const cpus = os.cpus();
        const mem = process.memoryUsage();
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        // Calculate per-core CPU usage
        const perCore = cpus.map((cpu, i) => {
            const prev = this.lastCpuInfo[i];
            let usage = 0;
            if (prev) {
                const prevTotal = prev.times.user + prev.times.nice + prev.times.sys + prev.times.idle + prev.times.irq;
                const currTotal = cpu.times.user + cpu.times.nice + cpu.times.sys + cpu.times.idle + cpu.times.irq;
                const prevIdle = prev.times.idle;
                const currIdle = cpu.times.idle;
                const totalDiff = currTotal - prevTotal;
                const idleDiff = currIdle - prevIdle;
                usage = totalDiff > 0 ? ((totalDiff - idleDiff) / totalDiff) * 100 : 0;
            }
            return {
                id: i,
                model: cpu.model,
                speed: cpu.speed,
                times: cpu.times,
                usage: Math.round(usage * 10) / 10
            };
        });
        // Calculate average CPU usage
        const avgCpuUsage = perCore.reduce((sum, core) => sum + core.usage, 0) / perCore.length;
        // Update baseline
        this.lastCpuInfo = cpus;
        this.lastCpuTime = Date.now();
        return {
            timestamp: Date.now(),
            cpu: {
                model: cpus[0]?.model || 'Unknown',
                cores: cpus.length / 2, // Physical cores (assuming HT)
                threads: cpus.length,
                speed: cpus[0]?.speed || 0,
                usage: Math.round(avgCpuUsage * 10) / 10,
                perCore
            },
            memory: {
                total: totalMem,
                used: totalMem - freeMem,
                free: freeMem,
                usagePercent: Math.round(((totalMem - freeMem) / totalMem) * 1000) / 10,
                heapUsed: mem.heapUsed,
                heapTotal: mem.heapTotal,
                external: mem.external
            },
            system: {
                platform: os.platform(),
                arch: os.arch(),
                uptime: os.uptime(),
                loadAvg: os.loadavg()
            }
        };
    }
    /**
     * Check if throttling is needed
     */
    checkThrottling(metrics) {
        const { cpuThreshold, memoryThreshold, cooldownPeriod } = this.throttleConfig;
        const shouldThrottle = metrics.cpu.usage > cpuThreshold ||
            metrics.memory.usagePercent > memoryThreshold;
        const cooldownElapsed = Date.now() - this.lastThrottleTime > cooldownPeriod;
        if (shouldThrottle && !this.isThrottled) {
            this.isThrottled = true;
            this.lastThrottleTime = Date.now();
            this.throttleCount++;
            this.emit('throttle-activated', {
                cpuUsage: metrics.cpu.usage,
                memoryUsage: metrics.memory.usagePercent,
                reason: metrics.cpu.usage > cpuThreshold ? 'cpu' : 'memory'
            });
            // Scale down workers
            this.scaleWorkers('down');
        }
        else if (!shouldThrottle && this.isThrottled && cooldownElapsed) {
            this.isThrottled = false;
            this.emit('throttle-deactivated', {
                cpuUsage: metrics.cpu.usage,
                memoryUsage: metrics.memory.usagePercent,
                throttleDuration: Date.now() - this.lastThrottleTime
            });
            // Scale up workers
            this.scaleWorkers('up');
        }
    }
    /**
     * Scale worker pool up or down
     */
    scaleWorkers(direction) {
        const { minWorkers, maxWorkers } = this.throttleConfig;
        const currentWorkers = this.workerPool.size;
        if (direction === 'down') {
            // Remove workers down to minimum
            const targetWorkers = Math.max(minWorkers, Math.floor(currentWorkers * 0.5));
            const toRemove = currentWorkers - targetWorkers;
            let removed = 0;
            for (const [id, worker] of this.workerPool) {
                if (removed >= toRemove)
                    break;
                worker.terminate();
                this.workerPool.delete(id);
                removed++;
            }
            this.emit('workers-scaled', { direction: 'down', count: removed, current: this.workerPool.size });
        }
        else {
            // Add workers up to maximum
            const targetWorkers = Math.min(maxWorkers, currentWorkers * 2 || minWorkers);
            const toAdd = targetWorkers - currentWorkers;
            // Note: Actual worker creation would happen here
            // For now, just emit the event
            this.emit('workers-scaled', { direction: 'up', count: toAdd, target: targetWorkers });
        }
    }
    /**
     * Get throttle delay if throttled
     */
    getThrottleDelay() {
        return this.isThrottled ? this.throttleConfig.throttleDelay : 0;
    }
    /**
     * Check if system is throttled
     */
    isSystemThrottled() {
        return this.isThrottled;
    }
    /**
     * Add task to queue with priority handling
     */
    queueTask(task) {
        // Insert based on priority
        if (task.priority === 'high') {
            // Find first non-high priority task
            const insertIndex = this.taskQueue.findIndex(t => t.priority !== 'high');
            if (insertIndex === -1) {
                this.taskQueue.push(task);
            }
            else {
                this.taskQueue.splice(insertIndex, 0, task);
            }
        }
        else if (task.priority === 'low') {
            this.taskQueue.push(task);
        }
        else {
            // Normal priority - insert after high, before low
            const insertIndex = this.taskQueue.findIndex(t => t.priority === 'low');
            if (insertIndex === -1) {
                this.taskQueue.push(task);
            }
            else {
                this.taskQueue.splice(insertIndex, 0, task);
            }
        }
        this.emit('task-queued', { taskId: task.id, queueLength: this.taskQueue.length });
    }
    /**
     * Get next task from queue
     */
    getNextTask() {
        return this.taskQueue.shift();
    }
    /**
     * Get worker pool status
     */
    getWorkerPoolStatus() {
        return {
            activeWorkers: this.workerPool.size,
            maxWorkers: this.throttleConfig.maxWorkers,
            queueLength: this.taskQueue.length,
            completedTasks: this.completedTasks,
            throttled: this.isThrottled
        };
    }
    /**
     * Get metrics history
     */
    getMetricsHistory() {
        return [...this.metricsHistory];
    }
    /**
     * Get average metrics over time period
     */
    getAverageMetrics(periodMs = 60000) {
        const cutoff = Date.now() - periodMs;
        const recent = this.metricsHistory.filter(m => m.timestamp > cutoff);
        if (recent.length === 0) {
            return {
                avgCpuUsage: 0,
                avgMemoryUsage: 0,
                peakCpuUsage: 0,
                peakMemoryUsage: 0,
                throttleEvents: this.throttleCount
            };
        }
        const cpuUsages = recent.map(m => m.cpu.usage);
        const memUsages = recent.map(m => m.memory.usagePercent);
        return {
            avgCpuUsage: Math.round(cpuUsages.reduce((a, b) => a + b, 0) / cpuUsages.length * 10) / 10,
            avgMemoryUsage: Math.round(memUsages.reduce((a, b) => a + b, 0) / memUsages.length * 10) / 10,
            peakCpuUsage: Math.max(...cpuUsages),
            peakMemoryUsage: Math.max(...memUsages),
            throttleEvents: this.throttleCount
        };
    }
    /**
     * Generate performance report
     */
    generateReport() {
        const metrics = this.collectMetrics();
        const avgMetrics = this.getAverageMetrics();
        const workerStatus = this.getWorkerPoolStatus();
        const lines = [];
        lines.push('═══════════════════════════════════════════════════════════════════════════════');
        lines.push('                    ⚡ HARDWARE TELEMETRY REPORT                              ');
        lines.push('═══════════════════════════════════════════════════════════════════════════════');
        lines.push('');
        lines.push(`🖥️  CPU: ${metrics.cpu.model}`);
        lines.push(`⚡ Cores/Threads: ${metrics.cpu.cores}/${metrics.cpu.threads} @ ${metrics.cpu.speed}MHz`);
        lines.push('');
        lines.push('────────────────────────────────────────────────────────────────────────────────');
        lines.push('CURRENT STATUS:');
        lines.push('────────────────────────────────────────────────────────────────────────────────');
        lines.push(`📈 CPU Usage: ${metrics.cpu.usage}% ${this.getUsageBar(metrics.cpu.usage)}`);
        lines.push(`💾 Memory: ${this.formatBytes(metrics.memory.used)} / ${this.formatBytes(metrics.memory.total)} (${metrics.memory.usagePercent}%)`);
        lines.push(`🔷 Node Heap: ${this.formatBytes(metrics.memory.heapUsed)} / ${this.formatBytes(metrics.memory.heapTotal)}`);
        lines.push(`🔶 External: ${this.formatBytes(metrics.memory.external)}`);
        lines.push(`⏰ System Uptime: ${this.formatUptime(metrics.system.uptime)}`);
        lines.push('');
        lines.push('────────────────────────────────────────────────────────────────────────────────');
        lines.push('PER-CORE USAGE:');
        lines.push('────────────────────────────────────────────────────────────────────────────────');
        for (const core of metrics.cpu.perCore) {
            const bar = this.getUsageBar(core.usage);
            lines.push(`Core ${core.id.toString().padStart(2)}: ${bar} ${core.usage.toFixed(1)}%`);
        }
        lines.push('');
        lines.push('────────────────────────────────────────────────────────────────────────────────');
        lines.push('AVERAGES (Last 60s):');
        lines.push('────────────────────────────────────────────────────────────────────────────────');
        lines.push(`📊 Avg CPU: ${avgMetrics.avgCpuUsage}%`);
        lines.push(`📈 Peak CPU: ${avgMetrics.peakCpuUsage}%`);
        lines.push(`💾 Avg Memory: ${avgMetrics.avgMemoryUsage}%`);
        lines.push(`📈 Peak Memory: ${avgMetrics.peakMemoryUsage}%`);
        lines.push(`⚠️  Throttle Events: ${avgMetrics.throttleEvents}`);
        lines.push('');
        lines.push('────────────────────────────────────────────────────────────────────────────────');
        lines.push('WORKER POOL:');
        lines.push('────────────────────────────────────────────────────────────────────────────────');
        lines.push(`👷 Active Workers: ${workerStatus.activeWorkers}/${workerStatus.maxWorkers}`);
        lines.push(`📋 Queue Length: ${workerStatus.queueLength}`);
        lines.push(`✅ Completed Tasks: ${workerStatus.completedTasks}`);
        lines.push(`🚦 Throttled: ${workerStatus.throttled ? '🔴 YES' : '🟢 NO'}`);
        lines.push('');
        lines.push('═══════════════════════════════════════════════════════════════════════════════');
        return lines.join('\n');
    }
    /**
     * Get ASCII usage bar
     */
    getUsageBar(usage) {
        const filled = Math.floor(usage / 5);
        const empty = 20 - filled;
        const color = usage > 90 ? '🔴' : usage > 70 ? '🟠' : usage > 50 ? '🟡' : '🟢';
        return `${color} ${'█'.repeat(filled)}${'░'.repeat(empty)}`;
    }
    /**
     * Format bytes to human readable
     */
    formatBytes(bytes) {
        const units = ['B', 'KB', 'MB', 'GB', 'TB'];
        let unitIndex = 0;
        let size = bytes;
        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }
        return `${size.toFixed(2)} ${units[unitIndex]}`;
    }
    /**
     * Format uptime to human readable
     */
    formatUptime(seconds) {
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const parts = [];
        if (days > 0)
            parts.push(`${days}d`);
        if (hours > 0)
            parts.push(`${hours}h`);
        if (minutes > 0)
            parts.push(`${minutes}m`);
        return parts.join(' ') || '< 1m';
    }
    /**
     * Update throttle configuration
     */
    updateConfig(config) {
        this.throttleConfig = { ...this.throttleConfig, ...config };
        this.emit('config-updated', this.throttleConfig);
    }
    /**
     * Get current configuration
     */
    getConfig() {
        return { ...this.throttleConfig };
    }
}
exports.HardwareTelemetry = HardwareTelemetry;
// Export singleton instance
exports.hardwareTelemetry = new HardwareTelemetry();
