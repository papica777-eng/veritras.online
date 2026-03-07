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
exports.SwarmCommander = exports.Soldier = void 0;
const events_1 = require("events");
const os = __importStar(require("os"));
// ═══════════════════════════════════════════════════════════════════════════════
// 🎖️ SOLDIER CLASS - Worker Unit
// ═══════════════════════════════════════════════════════════════════════════════
class Soldier {
    id;
    threadId;
    status = 'idle';
    currentTask = null;
    tasksCompleted = 0;
    tasksFailed = 0;
    totalExecutionTime = 0;
    lastActive = Date.now();
    constructor(id) {
        this.id = id;
        this.threadId = id; // In real impl, would be actual thread ID
    }
    /**
     * Execute a task
     */
    async execute(task) {
        this.status = 'busy';
        this.currentTask = task;
        this.lastActive = Date.now();
        const startTime = Date.now();
        const startMemory = process.memoryUsage().heapUsed;
        try {
            // Simulate task execution based on type
            const result = await this.processTask(task);
            const executionTime = Date.now() - startTime;
            this.totalExecutionTime += executionTime;
            this.tasksCompleted++;
            this.status = 'idle';
            this.currentTask = null;
            return {
                taskId: task.id,
                soldierId: this.id,
                success: true,
                result,
                executionTime,
                memoryUsed: process.memoryUsage().heapUsed - startMemory
            };
        }
        catch (error) {
            this.tasksFailed++;
            this.status = 'idle';
            this.currentTask = null;
            return {
                taskId: task.id,
                soldierId: this.id,
                success: false,
                error: error instanceof Error ? error.message : String(error),
                executionTime: Date.now() - startTime,
                memoryUsed: process.memoryUsage().heapUsed - startMemory
            };
        }
    }
    /**
     * Process task based on type
     */
    async processTask(task) {
        // Simulate processing delay based on task type
        const delays = {
            'semantic-analysis': 150,
            'dom-inspection': 50,
            'visual-diff': 200,
            'api-validation': 100,
            'accessibility-audit': 180,
            'performance-metric': 80,
            'security-scan': 250,
            'regression-check': 120
        };
        await new Promise(resolve => setTimeout(resolve, delays[task.type] || 100));
        return {
            taskType: task.type,
            processedBy: this.id,
            timestamp: Date.now(),
            payload: task.payload
        };
    }
    /**
     * Get soldier status
     */
    getStatus() {
        return {
            id: this.id,
            threadId: this.threadId,
            status: this.status,
            currentTask: this.currentTask?.id || null,
            tasksCompleted: this.tasksCompleted,
            tasksFailed: this.tasksFailed,
            avgExecutionTime: this.tasksCompleted > 0
                ? this.totalExecutionTime / this.tasksCompleted
                : 0,
            lastActive: this.lastActive
        };
    }
    /**
     * Enter cooldown mode
     */
    enterCooldown() {
        this.status = 'cooldown';
    }
    /**
     * Resume from cooldown
     */
    resume() {
        if (this.status === 'cooldown') {
            this.status = 'idle';
        }
    }
    /**
     * Terminate soldier
     */
    terminate() {
        this.status = 'terminated';
        this.currentTask = null;
    }
}
exports.Soldier = Soldier;
// ═══════════════════════════════════════════════════════════════════════════════
// 🎖️ COMMANDER CLASS - Strategy & Coordination
// ═══════════════════════════════════════════════════════════════════════════════
class SwarmCommander extends events_1.EventEmitter {
    soldiers = new Map();
    taskQueue = [];
    activeCount = 0;
    strategy;
    metrics;
    thermalMonitorInterval = null;
    isRunning = false;
    nextTaskId = 1;
    // Thermal state
    currentTemperature = 50;
    thermalState = 'cool';
    constructor(strategy) {
        super();
        const cpuCount = os.cpus().length;
        this.strategy = {
            name: strategy?.name || 'Thermal-Aware Swarm',
            description: strategy?.description || 'Optimized for Ryzen 7 7435HS',
            maxConcurrency: strategy?.maxConcurrency || cpuCount,
            priorityWeights: strategy?.priorityWeights || {
                critical: 100,
                high: 75,
                normal: 50,
                low: 25,
                background: 10
            },
            taskDistribution: strategy?.taskDistribution || 'thermal-aware',
            thermalConfig: {
                throttleTemp: 90,
                criticalTemp: 95,
                coolTemp: 70,
                maxSoldiersCool: 40,
                minSoldiersHot: 4,
                checkInterval: 2000,
                ...strategy?.thermalConfig
            }
        };
        this.metrics = {
            totalTasks: 0,
            completedTasks: 0,
            failedTasks: 0,
            avgExecutionTime: 0,
            throughput: 0,
            activeSoldiers: 0,
            queueLength: 0,
            thermalState: 'cool',
            estimatedTemperature: 50
        };
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // 🚀 LIFECYCLE
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Initialize the swarm
     */
    async initialize() {
        if (this.isRunning)
            return;
        // Spawn initial soldiers based on thermal state
        const initialCount = this.calculateOptimalSoldierCount();
        for (let i = 0; i < initialCount; i++) {
            this.spawnSoldier();
        }
        // Start thermal monitoring
        this.startThermalMonitoring();
        this.isRunning = true;
        this.emit('initialized', { soldiers: this.soldiers.size });
    }
    /**
     * Shutdown the swarm
     */
    async shutdown() {
        this.isRunning = false;
        // Stop thermal monitoring
        if (this.thermalMonitorInterval) {
            clearInterval(this.thermalMonitorInterval);
            this.thermalMonitorInterval = null;
        }
        // Terminate all soldiers
        for (const soldier of this.soldiers.values()) {
            soldier.terminate();
        }
        this.soldiers.clear();
        // Clear queue
        this.taskQueue = [];
        this.emit('shutdown');
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // 👥 SOLDIER MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Spawn a new soldier
     */
    spawnSoldier() {
        const id = this.soldiers.size + 1;
        const soldier = new Soldier(id);
        this.soldiers.set(id, soldier);
        this.emit('soldier-spawned', { id, total: this.soldiers.size });
        return soldier;
    }
    /**
     * Terminate a soldier
     */
    terminateSoldier(id) {
        const soldier = this.soldiers.get(id);
        if (soldier && soldier.status === 'idle') {
            soldier.terminate();
            this.soldiers.delete(id);
            this.emit('soldier-terminated', { id, total: this.soldiers.size });
        }
    }
    /**
     * Scale soldiers based on thermal state
     */
    scaleSoldiers() {
        const optimalCount = this.calculateOptimalSoldierCount();
        const currentCount = this.soldiers.size;
        if (optimalCount > currentCount) {
            // Scale up
            const toAdd = optimalCount - currentCount;
            for (let i = 0; i < toAdd; i++) {
                this.spawnSoldier();
            }
            this.emit('soldiers-scaled', { direction: 'up', count: toAdd, total: this.soldiers.size });
        }
        else if (optimalCount < currentCount) {
            // Scale down - terminate idle soldiers
            const toRemove = currentCount - optimalCount;
            let removed = 0;
            for (const [id, soldier] of this.soldiers) {
                if (removed >= toRemove)
                    break;
                if (soldier.status === 'idle') {
                    this.terminateSoldier(id);
                    removed++;
                }
            }
            this.emit('soldiers-scaled', { direction: 'down', count: removed, total: this.soldiers.size });
        }
    }
    /**
     * Calculate optimal soldier count based on thermal state
     */
    calculateOptimalSoldierCount() {
        const { thermalConfig } = this.strategy;
        const temp = this.currentTemperature;
        if (temp >= thermalConfig.criticalTemp) {
            return thermalConfig.minSoldiersHot;
        }
        if (temp >= thermalConfig.throttleTemp) {
            // Linear interpolation between hot and cool
            const range = thermalConfig.throttleTemp - thermalConfig.criticalTemp;
            const position = (thermalConfig.throttleTemp - temp) / range;
            const soldierRange = thermalConfig.maxSoldiersCool - thermalConfig.minSoldiersHot;
            return Math.floor(thermalConfig.minSoldiersHot + position * soldierRange * 0.5);
        }
        if (temp <= thermalConfig.coolTemp) {
            return thermalConfig.maxSoldiersCool;
        }
        // Warm zone - partial capacity
        const range = thermalConfig.throttleTemp - thermalConfig.coolTemp;
        const position = (temp - thermalConfig.coolTemp) / range;
        const soldierRange = thermalConfig.maxSoldiersCool - thermalConfig.minSoldiersHot;
        return Math.floor(thermalConfig.maxSoldiersCool - position * soldierRange * 0.3);
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // 🌡️ THERMAL MONITORING
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Start thermal monitoring
     */
    startThermalMonitoring() {
        this.thermalMonitorInterval = setInterval(() => {
            this.updateThermalState();
            this.scaleSoldiers();
        }, this.strategy.thermalConfig.checkInterval);
    }
    /**
     * Update thermal state (simulated based on CPU usage)
     */
    updateThermalState() {
        // Estimate temperature based on CPU load and active workers
        const cpus = os.cpus();
        const avgUsage = cpus.reduce((sum, cpu) => {
            const total = cpu.times.user + cpu.times.nice + cpu.times.sys + cpu.times.idle;
            const idle = cpu.times.idle;
            return sum + ((total - idle) / total * 100);
        }, 0) / cpus.length;
        // Simulate temperature (real implementation would use actual sensors)
        const baseTemp = 45;
        const loadTemp = (avgUsage / 100) * 55; // Up to 55°C from load
        const workerTemp = (this.activeCount / 16) * 10; // Up to 10°C from workers
        this.currentTemperature = Math.min(100, baseTemp + loadTemp + workerTemp);
        // Update thermal state
        const { thermalConfig } = this.strategy;
        let newState;
        if (this.currentTemperature >= thermalConfig.criticalTemp) {
            newState = 'critical';
        }
        else if (this.currentTemperature >= thermalConfig.throttleTemp) {
            newState = 'hot';
        }
        else if (this.currentTemperature > thermalConfig.coolTemp) {
            newState = 'warm';
        }
        else {
            newState = 'cool';
        }
        if (newState !== this.thermalState) {
            const oldState = this.thermalState;
            this.thermalState = newState;
            this.emit('thermal-state-changed', {
                from: oldState,
                to: newState,
                temperature: this.currentTemperature
            });
        }
        // Update metrics
        this.metrics.thermalState = this.thermalState;
        this.metrics.estimatedTemperature = this.currentTemperature;
    }
    /**
     * Set temperature manually (for testing or external sensors)
     */
    setTemperature(temp) {
        this.currentTemperature = temp;
        // Determine new state based on manual temperature
        const { thermalConfig } = this.strategy;
        let newState;
        if (temp >= thermalConfig.criticalTemp) {
            newState = 'critical';
        }
        else if (temp >= thermalConfig.throttleTemp) {
            newState = 'hot';
        }
        else if (temp > thermalConfig.coolTemp) {
            newState = 'warm';
        }
        else {
            newState = 'cool';
        }
        if (newState !== this.thermalState) {
            this.thermalState = newState;
        }
        // Update metrics
        this.metrics.thermalState = this.thermalState;
        this.metrics.estimatedTemperature = this.currentTemperature;
        this.scaleSoldiers();
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // 📋 TASK MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Submit a task to the swarm
     */
    async submitTask(type, payload, options) {
        const task = {
            id: `task_${this.nextTaskId++}_${Date.now()}`,
            type,
            priority: options?.priority || 'normal',
            payload,
            createdAt: Date.now(),
            deadline: options?.deadline,
            retries: 0,
            maxRetries: 3
        };
        // Insert based on priority
        this.insertTaskByPriority(task);
        this.metrics.totalTasks++;
        this.metrics.queueLength = this.taskQueue.length;
        // Try to dispatch
        this.dispatchTasks();
        this.emit('task-submitted', { taskId: task.id, queueLength: this.taskQueue.length });
        return task.id;
    }
    /**
     * Submit multiple tasks
     */
    async submitBatch(tasks) {
        const taskIds = [];
        for (const taskDef of tasks) {
            const id = await this.submitTask(taskDef.type, taskDef.payload, { priority: taskDef.priority });
            taskIds.push(id);
        }
        return taskIds;
    }
    /**
     * Insert task by priority
     */
    insertTaskByPriority(task) {
        const weight = this.strategy.priorityWeights[task.priority];
        // Find insertion point
        let insertIndex = this.taskQueue.length;
        for (let i = 0; i < this.taskQueue.length; i++) {
            const existingWeight = this.strategy.priorityWeights[this.taskQueue[i].priority];
            if (weight > existingWeight) {
                insertIndex = i;
                break;
            }
        }
        this.taskQueue.splice(insertIndex, 0, task);
    }
    /**
     * Dispatch tasks to available soldiers
     */
    async dispatchTasks() {
        if (!this.isRunning || this.taskQueue.length === 0)
            return;
        // Find idle soldiers
        for (const soldier of this.soldiers.values()) {
            if (soldier.status !== 'idle' || this.taskQueue.length === 0)
                continue;
            const task = this.taskQueue.shift();
            this.activeCount++;
            this.metrics.queueLength = this.taskQueue.length;
            this.metrics.activeSoldiers = this.activeCount;
            // Execute task
            soldier.execute(task).then((result) => {
                this.handleTaskResult(result, task);
            });
        }
    }
    /**
     * Handle task result
     */
    handleTaskResult(result, task) {
        this.activeCount--;
        this.metrics.activeSoldiers = this.activeCount;
        if (result.success) {
            this.metrics.completedTasks++;
            this.updateAvgExecutionTime(result.executionTime);
            this.emit('task-completed', result);
        }
        else {
            // Retry logic
            if (task.retries < task.maxRetries) {
                task.retries++;
                this.insertTaskByPriority(task);
                this.emit('task-retrying', { taskId: task.id, attempt: task.retries });
            }
            else {
                this.metrics.failedTasks++;
                this.emit('task-failed', result);
            }
        }
        // Update throughput
        const uptime = (Date.now() - (this.metrics.totalTasks > 0 ? Date.now() - 60000 : Date.now())) / 1000;
        this.metrics.throughput = this.metrics.completedTasks / Math.max(1, uptime);
        // Try to dispatch more tasks
        this.dispatchTasks();
    }
    /**
     * Update average execution time
     */
    updateAvgExecutionTime(executionTime) {
        const total = this.metrics.avgExecutionTime * (this.metrics.completedTasks - 1) + executionTime;
        this.metrics.avgExecutionTime = total / this.metrics.completedTasks;
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // 📊 STATUS & METRICS
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Get swarm metrics
     */
    getMetrics() {
        return { ...this.metrics };
    }
    /**
     * Get all soldier statuses
     */
    getSoldierStatuses() {
        return Array.from(this.soldiers.values()).map(s => s.getStatus());
    }
    /**
     * Get current strategy
     */
    getStrategy() {
        return { ...this.strategy };
    }
    /**
     * Update thermal config
     */
    updateThermalConfig(config) {
        this.strategy.thermalConfig = { ...this.strategy.thermalConfig, ...config };
        this.emit('config-updated', { thermalConfig: this.strategy.thermalConfig });
    }
    /**
     * Get queue length
     */
    getQueueLength() {
        return this.taskQueue.length;
    }
    /**
     * Check if running
     */
    isSwarmRunning() {
        return this.isRunning;
    }
}
exports.SwarmCommander = SwarmCommander;
// ═══════════════════════════════════════════════════════════════════════════════
// 📦 EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════
exports.default = SwarmCommander;
