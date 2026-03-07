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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkerPoolManager = void 0;
exports.workerMain = workerMain;
const node_worker_threads_1 = require("node:worker_threads");
const node_os_1 = require("node:os");
const node_events_1 = require("node:events");
/**
 * Priority Queue for task scheduling
 */
class PriorityQueue {
    items = [];
    enqueue(item) {
        // Insert in sorted order (higher priority first)
        let inserted = false;
        for (let i = 0; i < this.items.length; i++) {
            if (item.priority > this.items[i].priority) {
                this.items.splice(i, 0, item);
                inserted = true;
                break;
            }
        }
        if (!inserted) {
            this.items.push(item);
        }
    }
    dequeue() {
        return this.items.shift();
    }
    peek() {
        return this.items[0];
    }
    get size() {
        return this.items.length;
    }
    isEmpty() {
        return this.items.length === 0;
    }
    clear() {
        this.items = [];
    }
    toArray() {
        return [...this.items];
    }
}
/**
 * Worker Pool Manager
 *
 * Manages a pool of worker threads for parallel task execution.
 * Designed for CPU-intensive operations like Ghost simulations.
 */
class WorkerPoolManager extends node_events_1.EventEmitter {
    workers = new Map();
    workerInfo = new Map();
    taskQueue = new PriorityQueue();
    activeTasks = new Map();
    config;
    isShuttingDown = false;
    startTime = Date.now();
    tasksCompleted = 0;
    tasksFailed = 0;
    totalExecutionTime = 0;
    nextWorkerId = 1;
    constructor(config = {}) {
        super();
        const cpuCount = (0, node_os_1.cpus)().length;
        this.config = {
            workerCount: config.workerCount ?? cpuCount,
            maxTasksPerWorker: config.maxTasksPerWorker ?? 1000,
            taskTimeout: config.taskTimeout ?? 30000,
            maxQueueSize: config.maxQueueSize ?? 10000,
            enableWorkStealing: config.enableWorkStealing ?? true,
            workerScript: config.workerScript ?? this.getDefaultWorkerScript()
        };
        // Initialize workers
        this.initializeWorkers();
    }
    /**
     * Initialize worker threads
     */
    initializeWorkers() {
        for (let i = 0; i < this.config.workerCount; i++) {
            this.spawnWorker();
        }
    }
    /**
     * Spawn a new worker thread
     */
    spawnWorker() {
        const workerId = this.nextWorkerId++;
        // Check if config is a file path or inline script
        const isFilePath = this.config.workerScript.endsWith('.js') ||
            this.config.workerScript.endsWith('.ts') ||
            this.config.workerScript.startsWith('./') ||
            this.config.workerScript.startsWith('/') ||
            /^[A-Za-z]:\\/.test(this.config.workerScript);
        const worker = new node_worker_threads_1.Worker(this.config.workerScript, {
            workerData: { workerId },
            eval: !isFilePath
        });
        // Track worker info
        this.workerInfo.set(workerId, {
            id: workerId,
            threadId: worker.threadId,
            status: 'idle',
            tasksCompleted: 0,
            totalExecutionTime: 0,
            lastActive: new Date(),
            errorCount: 0
        });
        // Set up event handlers
        worker.on('message', (message) => this.handleWorkerMessage(workerId, message));
        worker.on('error', (error) => this.handleWorkerError(workerId, error));
        worker.on('exit', (code) => this.handleWorkerExit(workerId, code));
        this.workers.set(workerId, worker);
        this.emit('workerSpawned', workerId);
        return worker;
    }
    /**
     * Handle message from worker
     */
    handleWorkerMessage(workerId, message) {
        const info = this.workerInfo.get(workerId);
        if (!info)
            return;
        if (message.type === 'taskComplete') {
            const { taskId, result, duration } = message;
            const activeTask = this.activeTasks.get(taskId);
            if (activeTask) {
                // Update stats
                info.tasksCompleted++;
                info.totalExecutionTime += duration;
                info.lastActive = new Date();
                info.status = 'idle';
                this.tasksCompleted++;
                this.totalExecutionTime += duration;
                // Resolve task
                activeTask.task.resolve(result);
                this.activeTasks.delete(taskId);
                // Check if worker needs recycling
                if (info.tasksCompleted >= this.config.maxTasksPerWorker) {
                    this.recycleWorker(workerId);
                }
                else {
                    // Try to pick up next task
                    this.assignNextTask(workerId);
                }
            }
        }
        else if (message.type === 'taskError') {
            const { taskId, error } = message;
            const activeTask = this.activeTasks.get(taskId);
            if (activeTask) {
                info.errorCount++;
                info.lastActive = new Date();
                info.status = 'idle';
                this.tasksFailed++;
                activeTask.task.reject(new Error(error));
                this.activeTasks.delete(taskId);
                this.assignNextTask(workerId);
            }
        }
        else if (message.type === 'ready') {
            info.status = 'idle';
            this.assignNextTask(workerId);
        }
    }
    /**
     * Handle worker error
     */
    handleWorkerError(workerId, error) {
        console.error(`[WorkerPool] Worker ${workerId} error:`, error.message);
        const info = this.workerInfo.get(workerId);
        if (info) {
            info.status = 'error';
            info.errorCount++;
        }
        // Fail any active task for this worker
        for (const [taskId, activeTask] of this.activeTasks.entries()) {
            if (activeTask.workerId === workerId) {
                activeTask.task.reject(error);
                this.activeTasks.delete(taskId);
                this.tasksFailed++;
            }
        }
        // Respawn worker if not shutting down
        if (!this.isShuttingDown) {
            this.workers.delete(workerId);
            this.workerInfo.delete(workerId);
            this.spawnWorker();
        }
        this.emit('workerError', workerId, error);
    }
    /**
     * Handle worker exit
     */
    handleWorkerExit(workerId, code) {
        const info = this.workerInfo.get(workerId);
        if (info) {
            info.status = 'terminated';
        }
        this.workers.delete(workerId);
        this.emit('workerExit', workerId, code);
        // Respawn if unexpected exit and not shutting down
        if (code !== 0 && !this.isShuttingDown) {
            this.spawnWorker();
        }
    }
    /**
     * Recycle a worker (terminate and respawn)
     */
    recycleWorker(workerId) {
        const worker = this.workers.get(workerId);
        if (worker) {
            worker.terminate();
            this.workers.delete(workerId);
            this.workerInfo.delete(workerId);
            this.spawnWorker();
            this.emit('workerRecycled', workerId);
        }
    }
    /**
     * Assign next task from queue to a worker
     */
    assignNextTask(workerId) {
        if (this.taskQueue.isEmpty() || this.isShuttingDown)
            return;
        const task = this.taskQueue.dequeue();
        if (!task)
            return;
        const worker = this.workers.get(workerId);
        const info = this.workerInfo.get(workerId);
        if (!worker || !info) {
            // Put task back in queue
            this.taskQueue.enqueue(task);
            return;
        }
        info.status = 'busy';
        info.currentTaskId = task.id;
        task.startedAt = new Date();
        this.activeTasks.set(task.id, { workerId, task });
        // Send task to worker
        worker.postMessage({
            type: 'executeTask',
            taskId: task.id,
            taskType: task.type,
            payload: task.payload,
            timeout: task.timeout ?? this.config.taskTimeout
        });
        this.emit('taskAssigned', task.id, workerId);
    }
    /**
     * Submit a task to the pool
     */
    async submitTask(type, payload, options = {}) {
        if (this.isShuttingDown) {
            throw new Error('Worker pool is shutting down');
        }
        if (this.taskQueue.size >= this.config.maxQueueSize) {
            throw new Error('Task queue is full');
        }
        return new Promise((resolve, reject) => {
            const task = {
                id: this.generateTaskId(),
                type,
                payload,
                priority: options.priority ?? 5,
                timeout: options.timeout,
                resolve,
                reject,
                queuedAt: new Date()
            };
            // Set timeout for task
            const timeoutMs = options.timeout ?? this.config.taskTimeout;
            const timeoutHandle = setTimeout(() => {
                if (this.activeTasks.has(task.id) || this.taskQueue.toArray().some(t => t.id === task.id)) {
                    this.cancelTask(task.id);
                    reject(new Error(`Task ${task.id} timed out after ${timeoutMs}ms`));
                }
            }, timeoutMs);
            // Clear timeout on resolution
            const originalResolve = task.resolve;
            task.resolve = (result) => {
                clearTimeout(timeoutHandle);
                originalResolve(result);
            };
            const originalReject = task.reject;
            task.reject = (error) => {
                clearTimeout(timeoutHandle);
                originalReject(error);
            };
            this.taskQueue.enqueue(task);
            this.emit('taskQueued', task.id);
            // Try to assign to idle worker
            this.tryAssignToIdleWorker();
        });
    }
    /**
     * Try to assign task to an idle worker
     */
    tryAssignToIdleWorker() {
        for (const [workerId, info] of this.workerInfo.entries()) {
            if (info.status === 'idle') {
                this.assignNextTask(workerId);
                break;
            }
        }
    }
    /**
     * Cancel a task
     */
    cancelTask(taskId) {
        // Check if in queue
        const queueTasks = this.taskQueue.toArray();
        const taskIndex = queueTasks.findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
            queueTasks.splice(taskIndex, 1);
            this.taskQueue.clear();
            queueTasks.forEach(t => this.taskQueue.enqueue(t));
            return true;
        }
        // Check if active
        const activeTask = this.activeTasks.get(taskId);
        if (activeTask) {
            const worker = this.workers.get(activeTask.workerId);
            if (worker) {
                worker.postMessage({ type: 'cancelTask', taskId });
            }
            this.activeTasks.delete(taskId);
            return true;
        }
        return false;
    }
    /**
     * Generate unique task ID
     */
    generateTaskId() {
        return `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    /**
     * Get default worker script content
     */
    getDefaultWorkerScript() {
        // Return inline worker code as data URL
        const workerCode = `
      const { parentPort, workerData } = require('node:worker_threads');
      
      // Signal ready
      parentPort.postMessage({ type: 'ready' });
      
      // Handle messages
      parentPort.on('message', async (message) => {
        if (message.type === 'executeTask') {
          const { taskId, taskType, payload, timeout } = message;
          const startTime = Date.now();
          
          try {
            // Execute based on task type
            let result;
            
            switch (taskType) {
              case 'ghostSimulation':
                result = await simulateGhost(payload);
                break;
              case 'mutationTest':
                result = await testMutation(payload);
                break;
              case 'stateComputation':
                result = await computeState(payload);
                break;
              default:
                result = { payload, processed: true };
            }
            
            parentPort.postMessage({
              type: 'taskComplete',
              taskId,
              result,
              duration: Date.now() - startTime
            });
          } catch (error) {
            parentPort.postMessage({
              type: 'taskError',
              taskId,
              error: error.message
            });
          }
        }
      });
      
      // Task implementations
      async function simulateGhost(payload) {
        // Simulate ghost execution
        return { ghostId: payload.ghostId, result: 'simulated' };
      }
      
      async function testMutation(payload) {
        // Test mutation
        return { mutationId: payload.mutationId, success: true };
      }
      
      async function computeState(payload) {
        // Compute state
        return { stateId: payload.stateId, computed: true };
      }
    `;
        // Return as a file path placeholder (in real usage, this would be a file)
        return workerCode;
    }
    /**
     * Get pool statistics
     */
    getStats() {
        let activeWorkers = 0;
        let idleWorkers = 0;
        for (const info of this.workerInfo.values()) {
            if (info.status === 'busy')
                activeWorkers++;
            else if (info.status === 'idle')
                idleWorkers++;
        }
        return {
            totalWorkers: this.workers.size,
            activeWorkers,
            idleWorkers,
            queueSize: this.taskQueue.size,
            tasksCompleted: this.tasksCompleted,
            tasksFailed: this.tasksFailed,
            avgTaskTime: this.tasksCompleted > 0
                ? this.totalExecutionTime / this.tasksCompleted
                : 0,
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
     * Scale workers up or down
     */
    scale(targetCount) {
        const currentCount = this.workers.size;
        if (targetCount > currentCount) {
            // Scale up
            for (let i = 0; i < targetCount - currentCount; i++) {
                this.spawnWorker();
            }
        }
        else if (targetCount < currentCount) {
            // Scale down (terminate idle workers first)
            let toTerminate = currentCount - targetCount;
            for (const [workerId, info] of this.workerInfo.entries()) {
                if (toTerminate <= 0)
                    break;
                if (info.status === 'idle') {
                    const worker = this.workers.get(workerId);
                    if (worker) {
                        worker.terminate();
                        this.workers.delete(workerId);
                        this.workerInfo.delete(workerId);
                        toTerminate--;
                    }
                }
            }
        }
        this.emit('scaled', this.workers.size);
    }
    /**
     * Shutdown the pool gracefully
     */
    async shutdown(graceful = true) {
        this.isShuttingDown = true;
        if (graceful) {
            // Wait for active tasks to complete
            while (this.activeTasks.size > 0) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }
        else {
            // Cancel all pending tasks
            for (const [taskId, activeTask] of this.activeTasks.entries()) {
                activeTask.task.reject(new Error('Pool shutdown'));
            }
            this.activeTasks.clear();
        }
        // Terminate all workers
        for (const worker of this.workers.values()) {
            await worker.terminate();
        }
        this.workers.clear();
        this.workerInfo.clear();
        this.taskQueue.clear();
        this.emit('shutdown');
    }
    /**
     * Check if pool is running
     */
    isRunning() {
        return !this.isShuttingDown && this.workers.size > 0;
    }
}
exports.WorkerPoolManager = WorkerPoolManager;
/**
 * Worker thread entry point (for use in separate worker file)
 */
function workerMain() {
    if (node_worker_threads_1.isMainThread) {
        throw new Error('workerMain() must be called from a worker thread');
    }
    const { workerId } = node_worker_threads_1.workerData;
    // Signal ready
    node_worker_threads_1.parentPort.postMessage({ type: 'ready' });
    // Handle messages
    node_worker_threads_1.parentPort.on('message', async (message) => {
        if (message.type === 'executeTask') {
            const { taskId, taskType, payload } = message;
            const startTime = Date.now();
            try {
                // Generic task execution
                const result = { taskType, payload, processed: true };
                node_worker_threads_1.parentPort.postMessage({
                    type: 'taskComplete',
                    taskId,
                    result,
                    duration: Date.now() - startTime
                });
            }
            catch (error) {
                node_worker_threads_1.parentPort.postMessage({
                    type: 'taskError',
                    taskId,
                    error: error.message
                });
            }
        }
    });
}
exports.default = WorkerPoolManager;
