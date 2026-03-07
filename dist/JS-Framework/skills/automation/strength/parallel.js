"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                               ║
 * ║   QANTUM PARALLEL EXECUTOR                                                    ║
 * ║   "Maximum parallelization for test execution"                                ║
 * ║                                                                               ║
 * ║   TODO B #20 - Performance: Parallel Execution                                ║
 * ║                                                                               ║
 * ║   © 2025-2026 QAntum | Dimitar Prodromov                                        ║
 * ║                                                                               ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParallelExecutor = void 0;
exports.parallel = parallel;
exports.parallelMap = parallelMap;
const event_emitter_js_1 = require("../core/event-emitter.js");
// ═══════════════════════════════════════════════════════════════════════════════
// TASK QUEUE
// ═══════════════════════════════════════════════════════════════════════════════
class TaskQueue {
    items = [];
    enqueue(item, priority = 0) {
        this.items.push({ priority, item });
        this.items.sort((a, b) => b.priority - a.priority);
    }
    dequeue() {
        return this.items.shift()?.item;
    }
    peek() {
        return this.items[0]?.item;
    }
    get length() {
        return this.items.length;
    }
    isEmpty() {
        return this.items.length === 0;
    }
    clear() {
        this.items = [];
    }
    toArray() {
        return this.items.map(i => i.item);
    }
}
// ═══════════════════════════════════════════════════════════════════════════════
// PARALLEL EXECUTOR
// ═══════════════════════════════════════════════════════════════════════════════
class ParallelExecutor extends event_emitter_js_1.EventEmitter {
    config;
    queue = new TaskQueue();
    results = new Map();
    workers = [];
    activeWorkers = 0;
    running = false;
    taskExecutor;
    completedTasks = new Set();
    pendingDependencies = new Map();
    constructor(config = {}) {
        super();
        this.config = {
            maxWorkers: config.maxWorkers || this.getOptimalWorkerCount(),
            strategy: config.strategy || 'adaptive',
            taskTimeout: config.taskTimeout || 30000,
            maxRetries: config.maxRetries || 3,
            batchSize: config.batchSize,
            gracefulShutdown: config.gracefulShutdown ?? true
        };
        this.initWorkers();
    }
    // ─────────────────────────────────────────────────────────────────────────
    // CONFIGURATION
    // ─────────────────────────────────────────────────────────────────────────
    getOptimalWorkerCount() {
        try {
            const os = require('os');
            return os.cpus().length;
        }
        catch {
            return 4;
        }
    }
    initWorkers() {
        this.workers = [];
        for (let i = 0; i < this.config.maxWorkers; i++) {
            this.workers.push({
                id: i,
                tasksCompleted: 0,
                tasksFailed: 0,
                totalTime: 0,
                idle: true
            });
        }
    }
    /**
     * Set task executor function
     */
    setExecutor(executor) {
        this.taskExecutor = executor;
        return this;
    }
    /**
     * Update configuration
     */
    configure(config) {
        this.config = { ...this.config, ...config };
        if (config.maxWorkers && config.maxWorkers !== this.workers.length) {
            this.initWorkers();
        }
        return this;
    }
    // ─────────────────────────────────────────────────────────────────────────
    // TASK MANAGEMENT
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Add task to queue
     */
    addTask(task) {
        // Track dependencies
        if (task.dependencies && task.dependencies.length > 0) {
            const unmet = new Set(task.dependencies.filter(dep => !this.completedTasks.has(dep)));
            if (unmet.size > 0) {
                this.pendingDependencies.set(task.id, unmet);
            }
        }
        this.queue.enqueue(task, task.priority || 0);
        this.emit('task:added', task);
        if (this.running) {
            this.scheduleNext();
        }
        return this;
    }
    /**
     * Add multiple tasks
     */
    addTasks(tasks) {
        for (const task of tasks) {
            this.addTask(task);
        }
        return this;
    }
    /**
     * Create task from data
     */
    createTask(data, options = {}) {
        return {
            id: options.id || `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            data,
            ...options
        };
    }
    // ─────────────────────────────────────────────────────────────────────────
    // EXECUTION
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Start execution
     */
    async start() {
        if (this.running)
            return;
        this.running = true;
        this.emit('execution:started');
        // Start initial batch of workers
        const initialWorkers = Math.min(this.config.maxWorkers, this.queue.length);
        for (let i = 0; i < initialWorkers; i++) {
            this.scheduleNext();
        }
    }
    /**
     * Stop execution
     */
    async stop() {
        this.running = false;
        if (this.config.gracefulShutdown) {
            // Wait for active workers to complete
            while (this.activeWorkers > 0) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }
        this.emit('execution:stopped');
    }
    /**
     * Execute all tasks and return results
     */
    async execute(tasks) {
        if (tasks) {
            this.addTasks(tasks);
        }
        if (!this.taskExecutor) {
            throw new Error('No task executor set. Use setExecutor() first.');
        }
        await this.start();
        // Wait for completion
        await new Promise(resolve => {
            const check = () => {
                if (this.queue.isEmpty() && this.activeWorkers === 0) {
                    resolve();
                }
                else {
                    setTimeout(check, 50);
                }
            };
            check();
        });
        await this.stop();
        return Array.from(this.results.values());
    }
    /**
     * Execute tasks in batches
     */
    async executeBatch(tasks, batchSize) {
        const size = batchSize || this.config.batchSize || this.config.maxWorkers;
        const allResults = [];
        for (let i = 0; i < tasks.length; i += size) {
            const batch = tasks.slice(i, i + size);
            this.results.clear();
            const results = await this.execute(batch);
            allResults.push(...results);
        }
        return allResults;
    }
    async scheduleNext() {
        if (!this.running)
            return;
        if (this.activeWorkers >= this.config.maxWorkers)
            return;
        if (this.queue.isEmpty())
            return;
        // Find ready task (dependencies met)
        const readyTask = this.findReadyTask();
        if (!readyTask)
            return;
        const worker = this.getIdleWorker();
        if (!worker)
            return;
        this.activeWorkers++;
        worker.idle = false;
        worker.currentTask = readyTask.id;
        this.emit('task:started', { taskId: readyTask.id, workerId: worker.id });
        try {
            const result = await this.executeTask(readyTask, worker);
            this.results.set(readyTask.id, result);
            this.completedTasks.add(readyTask.id);
            this.resolveDependencies(readyTask.id);
            if (result.success) {
                worker.tasksCompleted++;
                this.emit('task:completed', result);
            }
            else {
                worker.tasksFailed++;
                this.emit('task:failed', result);
            }
        }
        finally {
            worker.idle = true;
            worker.currentTask = undefined;
            this.activeWorkers--;
            this.scheduleNext();
        }
    }
    findReadyTask() {
        const tasks = this.queue.toArray();
        for (let i = 0; i < tasks.length; i++) {
            const task = tasks[i];
            const pending = this.pendingDependencies.get(task.id);
            if (!pending || pending.size === 0) {
                // Remove from queue (dequeue until we get this one)
                this.queue.dequeue();
                return task;
            }
        }
        return undefined;
    }
    resolveDependencies(completedTaskId) {
        for (const [taskId, deps] of this.pendingDependencies) {
            deps.delete(completedTaskId);
            if (deps.size === 0) {
                this.pendingDependencies.delete(taskId);
            }
        }
    }
    async executeTask(task, worker) {
        const startTime = Date.now();
        let retryCount = 0;
        const maxRetries = task.retries ?? this.config.maxRetries;
        while (retryCount <= maxRetries) {
            try {
                const timeout = task.timeout || this.config.taskTimeout;
                const result = await this.executeWithTimeout(task.data, timeout);
                const duration = Date.now() - startTime;
                worker.totalTime += duration;
                return {
                    taskId: task.id,
                    success: true,
                    result,
                    duration,
                    workerId: worker.id,
                    retryCount
                };
            }
            catch (error) {
                retryCount++;
                if (retryCount > maxRetries) {
                    const duration = Date.now() - startTime;
                    worker.totalTime += duration;
                    return {
                        taskId: task.id,
                        success: false,
                        error: error instanceof Error ? error : new Error(String(error)),
                        duration,
                        workerId: worker.id,
                        retryCount: retryCount - 1
                    };
                }
                // Exponential backoff
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 100));
            }
        }
        // Should not reach here
        return {
            taskId: task.id,
            success: false,
            error: new Error('Max retries exceeded'),
            duration: Date.now() - startTime,
            workerId: worker.id,
            retryCount
        };
    }
    async executeWithTimeout(data, timeout) {
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                reject(new Error(`Task timed out after ${timeout}ms`));
            }, timeout);
            Promise.resolve(this.taskExecutor(data))
                .then(result => {
                clearTimeout(timer);
                resolve(result);
            })
                .catch(error => {
                clearTimeout(timer);
                reject(error);
            });
        });
    }
    getIdleWorker() {
        return this.workers.find(w => w.idle);
    }
    // ─────────────────────────────────────────────────────────────────────────
    // STATISTICS
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Get worker statistics
     */
    getWorkerStats() {
        return [...this.workers];
    }
    /**
     * Get execution summary
     */
    getSummary() {
        const completed = Array.from(this.results.values());
        const successful = completed.filter(r => r.success);
        const failed = completed.filter(r => !r.success);
        const totalDuration = completed.reduce((sum, r) => sum + r.duration, 0);
        return {
            totalTasks: completed.length + this.queue.length,
            completedTasks: successful.length,
            failedTasks: failed.length,
            pendingTasks: this.queue.length,
            activeWorkers: this.activeWorkers,
            totalWorkers: this.config.maxWorkers,
            avgTaskDuration: completed.length > 0 ? totalDuration / completed.length : 0
        };
    }
    /**
     * Get results
     */
    getResults() {
        return new Map(this.results);
    }
    /**
     * Clear all
     */
    clear() {
        this.queue.clear();
        this.results.clear();
        this.completedTasks.clear();
        this.pendingDependencies.clear();
        this.initWorkers();
    }
}
exports.ParallelExecutor = ParallelExecutor;
// ═══════════════════════════════════════════════════════════════════════════════
// CONVENIENCE FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * Execute tasks in parallel
 */
async function parallel(items, executor, options = {}) {
    const runner = new ParallelExecutor(options);
    runner.setExecutor(executor);
    const tasks = items.map((data, index) => ({
        id: `task-${index}`,
        data
    }));
    const results = await runner.execute(tasks);
    // Maintain order
    return results
        .sort((a, b) => {
        const aIdx = parseInt(a.taskId.split('-')[1]);
        const bIdx = parseInt(b.taskId.split('-')[1]);
        return aIdx - bIdx;
    })
        .map(r => {
        if (!r.success)
            throw r.error;
        return r.result;
    });
}
/**
 * Map with parallelism limit
 */
async function parallelMap(items, mapper, concurrency = 4) {
    const results = new Array(items.length);
    let index = 0;
    const worker = async () => {
        while (index < items.length) {
            const currentIndex = index++;
            results[currentIndex] = await mapper(items[currentIndex], currentIndex);
        }
    };
    const workers = Array(Math.min(concurrency, items.length))
        .fill(null)
        .map(() => worker());
    await Promise.all(workers);
    return results;
}
// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════
exports.default = ParallelExecutor;
