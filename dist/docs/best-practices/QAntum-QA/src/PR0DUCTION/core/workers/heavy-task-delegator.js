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
exports.HeavyTaskDelegator = exports.HeavyTaskType = void 0;
const node_worker_threads_1 = require("node:worker_threads");
const node_events_1 = require("node:events");
const os = __importStar(require("node:os"));
// ═══════════════════════════════════════════════════════════════════════════════
// TYPES AND INTERFACES
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * Task types that should be offloaded to workers
 */
var HeavyTaskType;
(function (HeavyTaskType) {
    /** Visual regression comparison (pixel diff) */
    HeavyTaskType["VISUAL_REGRESSION"] = "visual-regression";
    /** Large data mining and analysis */
    HeavyTaskType["DATA_MINING"] = "data-mining";
    /** JSON parsing of large files */
    HeavyTaskType["JSON_PARSING"] = "json-parsing";
    /** DOM snapshot comparison */
    HeavyTaskType["DOM_COMPARISON"] = "dom-comparison";
    /** Mutation testing in isolation */
    HeavyTaskType["MUTATION_TESTING"] = "mutation-testing";
    /** Code analysis and metrics */
    HeavyTaskType["CODE_ANALYSIS"] = "code-analysis";
    /** AI response processing */
    HeavyTaskType["AI_PROCESSING"] = "ai-processing";
    /** Hash computation */
    HeavyTaskType["HASH_COMPUTATION"] = "hash-computation";
    /** Compression/decompression */
    HeavyTaskType["COMPRESSION"] = "compression";
    /** Custom task */
    HeavyTaskType["CUSTOM"] = "custom";
})(HeavyTaskType || (exports.HeavyTaskType = HeavyTaskType = {}));
/**
 * Default task handlers for common heavy operations
 */
const DEFAULT_HANDLERS = {
    [HeavyTaskType.HASH_COMPUTATION]: {
        async execute(input, reportProgress) {
            const crypto = await Promise.resolve().then(() => __importStar(require('node:crypto')));
            reportProgress(50, 'Computing hash...');
            const hash = crypto.createHash(input.algorithm || 'sha256')
                .update(input.data)
                .digest('hex');
            reportProgress(100, 'Hash computed');
            return { hash };
        }
    },
    [HeavyTaskType.JSON_PARSING]: {
        async execute(input, reportProgress) {
            reportProgress(10, 'Starting parse...');
            const parsed = JSON.parse(input.json);
            reportProgress(100, 'Parse complete');
            return parsed;
        }
    },
    [HeavyTaskType.COMPRESSION]: {
        async execute(input, reportProgress) {
            const zlib = await Promise.resolve().then(() => __importStar(require('node:zlib')));
            const { promisify } = await Promise.resolve().then(() => __importStar(require('node:util')));
            reportProgress(10, 'Starting compression...');
            if (input.compress) {
                const gzip = promisify(zlib.gzip);
                const result = await gzip(Buffer.from(input.data));
                reportProgress(100, 'Compression complete');
                return { compressed: result };
            }
            else {
                const gunzip = promisify(zlib.gunzip);
                const result = await gunzip(Buffer.from(input.data));
                reportProgress(100, 'Decompression complete');
                return { decompressed: result.toString() };
            }
        }
    },
    [HeavyTaskType.CODE_ANALYSIS]: {
        async execute(input, reportProgress) {
            reportProgress(10, 'Analyzing code...');
            const code = input.code;
            const lines = code.split('\n').length;
            const functions = (code.match(/function\s+\w+|const\s+\w+\s*=\s*(?:async\s*)?\(/g) || []).length;
            const classes = (code.match(/class\s+\w+/g) || []).length;
            const imports = (code.match(/import\s+/g) || []).length;
            const comments = (code.match(/\/\/|\/\*|\*\//g) || []).length;
            // Cyclomatic complexity
            const branches = (code.match(/\bif\b|\belse\b|\bfor\b|\bwhile\b|\bcase\b|\bcatch\b|\b\?\b/g) || []).length;
            const complexity = branches + 1;
            reportProgress(100, 'Analysis complete');
            return {
                lines,
                functions,
                classes,
                imports,
                comments,
                complexity,
                avgLinesPerFunction: functions > 0 ? Math.round(lines / functions) : 0
            };
        }
    },
    [HeavyTaskType.DOM_COMPARISON]: {
        async execute(input, reportProgress) {
            reportProgress(10, 'Comparing DOMs...');
            // Simple diff - in real implementation would use proper DOM parser
            const lines1 = input.dom1.split('\n');
            const lines2 = input.dom2.split('\n');
            const differences = [];
            const maxLines = Math.max(lines1.length, lines2.length);
            for (let i = 0; i < maxLines; i++) {
                if (lines1[i] !== lines2[i]) {
                    if (lines1[i] && !lines2[i]) {
                        differences.push({ line: i + 1, type: 'removed', content: lines1[i] });
                    }
                    else if (!lines1[i] && lines2[i]) {
                        differences.push({ line: i + 1, type: 'added', content: lines2[i] });
                    }
                    else {
                        differences.push({ line: i + 1, type: 'changed', content: `${lines1[i]} -> ${lines2[i]}` });
                    }
                }
                if (i % 100 === 0) {
                    reportProgress(10 + Math.round((i / maxLines) * 80), `Comparing line ${i}/${maxLines}`);
                }
            }
            reportProgress(100, 'Comparison complete');
            return {
                identical: differences.length === 0,
                differenceCount: differences.length,
                differences: differences.slice(0, 100) // Limit output size
            };
        }
    },
    [HeavyTaskType.CUSTOM]: {
        async execute(input, reportProgress) {
            reportProgress(10, 'Executing custom task...');
            // Create sandboxed function
            const fn = new Function('context', 'reportProgress', input.code);
            const result = await fn(input.context, reportProgress);
            reportProgress(100, 'Custom task complete');
            return result;
        }
    }
};
// ═══════════════════════════════════════════════════════════════════════════════
// WORKER CODE (runs in worker thread)
// ═══════════════════════════════════════════════════════════════════════════════
if (!node_worker_threads_1.isMainThread && node_worker_threads_1.parentPort) {
    const port = node_worker_threads_1.parentPort;
    const workerId = node_worker_threads_1.workerData?.workerId ?? 0;
    // Signal ready
    port.postMessage({ type: 'ready', workerId });
    // Handle tasks
    port.on('message', async (message) => {
        if (message.type === 'execute') {
            const startTime = Date.now();
            try {
                const handler = DEFAULT_HANDLERS[message.taskType];
                if (!handler) {
                    throw new Error(`Unknown task type: ${message.taskType}`);
                }
                const reportProgress = (progress, msg) => {
                    port.postMessage({
                        type: 'progress',
                        taskId: message.taskId,
                        progress,
                        message: msg
                    });
                };
                const result = await handler.execute(message.input, reportProgress);
                port.postMessage({
                    type: 'complete',
                    taskId: message.taskId,
                    result,
                    executionTime: Date.now() - startTime,
                    workerId
                });
            }
            catch (error) {
                port.postMessage({
                    type: 'error',
                    taskId: message.taskId,
                    error: error.message,
                    executionTime: Date.now() - startTime,
                    workerId
                });
            }
        }
    });
}
// ═══════════════════════════════════════════════════════════════════════════════
// HEAVY TASK DELEGATOR (main thread)
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * 🧵 Heavy Task Delegator
 *
 * Manages a pool of worker threads for CPU-intensive operations.
 * Automatically scales workers based on load.
 */
class HeavyTaskDelegator extends node_events_1.EventEmitter {
    config;
    workers = new Map();
    workerInfo = new Map();
    taskQueue = [];
    nextWorkerId = 1;
    startTime = Date.now();
    constructor(config = {}) {
        super();
        const cpuCount = os.cpus().length;
        this.config = {
            minWorkers: config.minWorkers ?? Math.max(2, Math.floor(cpuCount / 4)),
            maxWorkers: config.maxWorkers ?? cpuCount - 2, // Leave 2 cores for main thread and OS
            autoScale: config.autoScale ?? true,
            defaultTimeout: config.defaultTimeout ?? 30000,
            maxQueueSize: config.maxQueueSize ?? 1000
        };
        // Initialize minimum workers
        this.initializeWorkers();
    }
    /**
     * Initialize worker pool
     */
    initializeWorkers() {
        for (let i = 0; i < this.config.minWorkers; i++) {
            this.spawnWorker();
        }
    }
    /**
     * Spawn a new worker
     */
    spawnWorker() {
        if (this.workers.size >= this.config.maxWorkers) {
            return;
        }
        const workerId = this.nextWorkerId++;
        // Use current file as worker script
        const worker = new node_worker_threads_1.Worker(__filename, {
            workerData: { workerId }
        });
        this.workerInfo.set(workerId, {
            id: workerId,
            threadId: worker.threadId,
            status: 'starting',
            tasksCompleted: 0,
            totalExecutionTime: 0,
            lastActive: new Date()
        });
        worker.on('message', (msg) => {
            this.handleWorkerMessage(workerId, msg);
        });
        worker.on('error', (error) => {
            this.handleWorkerError(workerId, error);
        });
        worker.on('exit', (code) => {
            this.handleWorkerExit(workerId, code);
        });
        this.workers.set(workerId, worker);
        this.emit('workerSpawned', { workerId, threadId: worker.threadId });
    }
    /**
     * Handle messages from workers
     */
    handleWorkerMessage(workerId, msg) {
        const info = this.workerInfo.get(workerId);
        switch (msg.type) {
            case 'ready':
                if (info) {
                    info.status = 'idle';
                }
                this.processQueue();
                break;
            case 'complete':
                if (info) {
                    info.status = 'idle';
                    info.tasksCompleted++;
                    info.totalExecutionTime += msg.executionTime || 0;
                    info.lastActive = new Date();
                    info.currentTask = undefined;
                }
                this.emit('taskComplete', {
                    taskId: msg.taskId,
                    result: msg.result,
                    executionTime: msg.executionTime,
                    workerId
                });
                this.processQueue();
                break;
            case 'error':
                if (info) {
                    info.status = 'idle';
                    info.lastActive = new Date();
                    info.currentTask = undefined;
                }
                this.emit('taskError', {
                    taskId: msg.taskId,
                    error: msg.error,
                    executionTime: msg.executionTime,
                    workerId
                });
                this.processQueue();
                break;
            case 'progress':
                this.emit('taskProgress', {
                    taskId: msg.taskId,
                    progress: msg.progress,
                    message: msg.message
                });
                break;
        }
    }
    /**
     * Handle worker errors
     */
    handleWorkerError(workerId, error) {
        const info = this.workerInfo.get(workerId);
        if (info) {
            info.status = 'error';
        }
        this.emit('workerError', { workerId, error: error.message });
        // Respawn worker
        this.workers.delete(workerId);
        this.workerInfo.delete(workerId);
        if (this.workers.size < this.config.minWorkers) {
            this.spawnWorker();
        }
    }
    /**
     * Handle worker exit
     */
    handleWorkerExit(workerId, code) {
        this.emit('workerExit', { workerId, code });
        this.workers.delete(workerId);
        this.workerInfo.delete(workerId);
        // Respawn if below minimum
        if (this.workers.size < this.config.minWorkers) {
            this.spawnWorker();
        }
    }
    /**
     * Submit a heavy task for processing
     * @param task - Task to execute
     * @returns Promise resolving to task result
     */
    async submit(task) {
        // Check queue size
        if (this.taskQueue.length >= this.config.maxQueueSize) {
            throw new Error(`Task queue full (${this.config.maxQueueSize} tasks). Try again later.`);
        }
        // Auto-scale if needed
        if (this.config.autoScale && this.taskQueue.length > this.workers.size * 2) {
            this.spawnWorker();
        }
        return new Promise((resolve, reject) => {
            this.taskQueue.push({ task, resolve, reject });
            this.processQueue();
        });
    }
    /**
     * Process the task queue
     */
    processQueue() {
        if (this.taskQueue.length === 0)
            return;
        // Find idle worker
        for (const [workerId, info] of this.workerInfo) {
            if (info.status === 'idle' && this.taskQueue.length > 0) {
                const { task, resolve, reject } = this.taskQueue.shift();
                info.status = 'busy';
                info.currentTask = task.id;
                const worker = this.workers.get(workerId);
                if (!worker)
                    continue;
                // Set up timeout
                const timeout = task.timeout || this.config.defaultTimeout;
                const timer = setTimeout(() => {
                    reject(new Error(`Task ${task.id} timed out after ${timeout}ms`));
                }, timeout);
                // Listen for completion
                const cleanup = () => {
                    clearTimeout(timer);
                    this.off('taskComplete', onComplete);
                    this.off('taskError', onError);
                };
                const onComplete = (result) => {
                    if (result.taskId === task.id) {
                        cleanup();
                        resolve(result);
                    }
                };
                const onError = (error) => {
                    if (error.taskId === task.id) {
                        cleanup();
                        resolve({
                            taskId: task.id,
                            success: false,
                            error: error.error,
                            executionTime: error.executionTime,
                            workerId: error.workerId
                        });
                    }
                };
                this.on('taskComplete', onComplete);
                this.on('taskError', onError);
                // Progress callback
                if (task.onProgress) {
                    const onProgress = (info) => {
                        if (info.taskId === task.id && task.onProgress) {
                            task.onProgress(info.progress, info.message);
                        }
                    };
                    this.on('taskProgress', onProgress);
                }
                // Send task to worker
                worker.postMessage({
                    type: 'execute',
                    taskId: task.id,
                    taskType: task.type,
                    input: task.input,
                    timeout
                });
            }
        }
    }
    /**
     * Get delegator statistics
     */
    getStats() {
        let idleWorkers = 0;
        let busyWorkers = 0;
        let totalTasks = 0;
        let totalTime = 0;
        for (const info of this.workerInfo.values()) {
            if (info.status === 'idle')
                idleWorkers++;
            else if (info.status === 'busy')
                busyWorkers++;
            totalTasks += info.tasksCompleted;
            totalTime += info.totalExecutionTime;
        }
        return {
            totalWorkers: this.workers.size,
            idleWorkers,
            busyWorkers,
            queueSize: this.taskQueue.length,
            totalTasksCompleted: totalTasks,
            avgExecutionTime: totalTasks > 0 ? totalTime / totalTasks : 0,
            uptime: Date.now() - this.startTime
        };
    }
    /**
     * Get worker information
     */
    getWorkerInfo() {
        return Array.from(this.workerInfo.values());
    }
    /**
     * Scale workers up
     * @param count - Number of workers to add
     */
    scaleUp(count = 1) {
        for (let i = 0; i < count && this.workers.size < this.config.maxWorkers; i++) {
            this.spawnWorker();
        }
    }
    /**
     * Scale workers down
     * @param count - Number of workers to remove
     */
    scaleDown(count = 1) {
        let removed = 0;
        for (const [workerId, info] of this.workerInfo) {
            if (removed >= count)
                break;
            if (info.status === 'idle' && this.workers.size > this.config.minWorkers) {
                const worker = this.workers.get(workerId);
                worker?.terminate();
                this.workers.delete(workerId);
                this.workerInfo.delete(workerId);
                removed++;
            }
        }
    }
    /**
     * Shutdown all workers
     * @param graceful - Wait for tasks to complete
     */
    async shutdown(graceful = true) {
        if (graceful) {
            // Wait for queue to empty
            while (this.taskQueue.length > 0) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            // Wait for busy workers
            while (Array.from(this.workerInfo.values()).some(w => w.status === 'busy')) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }
        // Terminate all workers
        for (const worker of this.workers.values()) {
            worker.terminate();
        }
        this.workers.clear();
        this.workerInfo.clear();
        this.taskQueue = [];
        this.emit('shutdown');
    }
}
exports.HeavyTaskDelegator = HeavyTaskDelegator;
exports.default = HeavyTaskDelegator;
