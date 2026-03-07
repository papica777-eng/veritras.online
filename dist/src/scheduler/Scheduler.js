"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * MIND-ENGINE: SCHEDULER SYSTEM
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Task scheduling with cron expressions, intervals, and queue management
 *
 * @author dp | QAntum Labs
 * @version 1.0.0-QANTUM-PRIME
 * @license Commercial
 * ═══════════════════════════════════════════════════════════════════════════════
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestScheduler = exports.SCHEDULES = exports.Scheduler = exports.CronParser = void 0;
exports.createScheduler = createScheduler;
exports.createTestScheduler = createTestScheduler;
const events_1 = require("events");
const logger_1 = require("../api/unified/utils/logger");
// ═══════════════════════════════════════════════════════════════════════════════
// CRON PARSER
// ═══════════════════════════════════════════════════════════════════════════════
class CronParser {
    static parse(expression) {
        const parts = expression.trim().split(/\s+/);
        if (parts.length !== 5) {
            throw new Error(`Invalid cron expression: ${expression}`);
        }
        return {
            minute: this.parsePart(parts[0], 0, 59),
            hour: this.parsePart(parts[1], 0, 23),
            dayOfMonth: this.parsePart(parts[2], 1, 31),
            month: this.parsePart(parts[3], 1, 12),
            dayOfWeek: this.parsePart(parts[4], 0, 6)
        };
    }
    static parsePart(part, min, max) {
        if (part === '*') {
            return this.range(min, max);
        }
        const values = [];
        for (const segment of part.split(',')) {
            if (segment.includes('/')) {
                const [range, step] = segment.split('/');
                const stepNum = parseInt(step);
                const [start, end] = range === '*'
                    ? [min, max]
                    : range.split('-').map(Number);
                for (let i = start; i <= (end ?? max); i += stepNum) {
                    values.push(i);
                }
            }
            else if (segment.includes('-')) {
                const [start, end] = segment.split('-').map(Number);
                for (let i = start; i <= end; i++) {
                    values.push(i);
                }
            }
            else {
                values.push(parseInt(segment));
            }
        }
        return [...new Set(values)].sort((a, b) => a - b);
    }
    static range(start, end) {
        const result = [];
        for (let i = start; i <= end; i++) {
            result.push(i);
        }
        return result;
    }
    static getNextRun(cronParts, from = new Date()) {
        const next = new Date(from.getTime());
        next.setSeconds(0);
        next.setMilliseconds(0);
        next.setMinutes(next.getMinutes() + 1);
        for (let i = 0; i < 366 * 24 * 60; i++) {
            if (cronParts.month.includes(next.getMonth() + 1) &&
                cronParts.dayOfMonth.includes(next.getDate()) &&
                cronParts.dayOfWeek.includes(next.getDay()) &&
                cronParts.hour.includes(next.getHours()) &&
                cronParts.minute.includes(next.getMinutes())) {
                return next;
            }
            next.setMinutes(next.getMinutes() + 1);
        }
        throw new Error('Could not calculate next run');
    }
}
exports.CronParser = CronParser;
// ═══════════════════════════════════════════════════════════════════════════════
// SCHEDULER
// ═══════════════════════════════════════════════════════════════════════════════
class Scheduler extends events_1.EventEmitter {
    state = {
        tasks: new Map(),
        executions: [],
        running: false
    };
    maxExecutionHistory = 1000;
    /**
     * Add scheduled task
     */
    // Complexity: O(1) — lookup
    addTask(task) {
        const internal = {
            ...task,
            runCount: 0,
            failCount: 0,
            options: {
                enabled: true,
                retries: 3,
                retryDelay: 1000,
                timeout: 30000,
                ...task.options
            }
        };
        // Parse cron if string
        if (typeof task.schedule === 'string') {
            internal.cronParts = CronParser.parse(task.schedule);
            internal.nextRun = CronParser.getNextRun(internal.cronParts);
        }
        this.state.tasks.set(task.id, internal);
        this.emit('taskAdded', task.id);
        // Start scheduling if running
        if (this.state.running) {
            this.scheduleTask(internal);
        }
        return this;
    }
    /**
     * Remove task
     */
    // Complexity: O(1) — lookup
    removeTask(id) {
        const task = this.state.tasks.get(id);
        if (!task)
            return false;
        if (task.timer) {
            // Complexity: O(1)
            clearTimeout(task.timer);
        }
        this.state.tasks.delete(id);
        this.emit('taskRemoved', id);
        return true;
    }
    /**
     * Get task
     */
    // Complexity: O(1) — lookup
    getTask(id) {
        return this.state.tasks.get(id);
    }
    /**
     * List all tasks
     */
    // Complexity: O(N) — linear scan
    listTasks() {
        return Array.from(this.state.tasks.values()).map(t => ({
            id: t.id,
            name: t.name,
            schedule: t.schedule,
            enabled: t.options?.enabled ?? true,
            nextRun: t.nextRun,
            lastRun: t.lastRun,
            runCount: t.runCount
        }));
    }
    /**
     * Enable task
     */
    // Complexity: O(1) — lookup
    enableTask(id) {
        const task = this.state.tasks.get(id);
        if (task?.options) {
            task.options.enabled = true;
            if (this.state.running) {
                this.scheduleTask(task);
            }
        }
    }
    /**
     * Disable task
     */
    // Complexity: O(1) — lookup
    disableTask(id) {
        const task = this.state.tasks.get(id);
        if (task) {
            if (task.options)
                task.options.enabled = false;
            if (task.timer) {
                // Complexity: O(1)
                clearTimeout(task.timer);
                task.timer = undefined;
            }
        }
    }
    /**
     * Run task immediately
     */
    // Complexity: O(1) — lookup
    async runTask(id) {
        const task = this.state.tasks.get(id);
        if (!task) {
            throw new Error(`Task not found: ${id}`);
        }
        return this.executeTask(task);
    }
    /**
     * Start scheduler
     */
    // Complexity: O(N) — loop
    start() {
        if (this.state.running)
            return;
        this.state.running = true;
        this.emit('started');
        // Schedule all tasks
        for (const task of this.state.tasks.values()) {
            if (task.options?.enabled !== false) {
                // Run on start if configured
                if (task.options?.runOnStart) {
                    this.executeTask(task).catch(() => { });
                }
                this.scheduleTask(task);
            }
        }
    }
    /**
     * Stop scheduler
     */
    // Complexity: O(N) — loop
    stop() {
        if (!this.state.running)
            return;
        this.state.running = false;
        // Clear all timers
        for (const task of this.state.tasks.values()) {
            if (task.timer) {
                // Complexity: O(1)
                clearTimeout(task.timer);
                task.timer = undefined;
            }
        }
        this.emit('stopped');
    }
    /**
     * Get execution history
     */
    // Complexity: O(N) — linear scan
    getExecutions(taskId) {
        if (taskId) {
            return this.state.executions.filter(e => e.taskId === taskId);
        }
        return this.state.executions;
    }
    /**
     * Get scheduler stats
     */
    // Complexity: O(N) — linear scan
    getStats() {
        const execs = this.state.executions;
        return {
            totalTasks: this.state.tasks.size,
            enabledTasks: Array.from(this.state.tasks.values())
                .filter(t => t.options?.enabled !== false).length,
            totalExecutions: execs.length,
            successfulExecutions: execs.filter(e => e.status === 'completed').length,
            failedExecutions: execs.filter(e => e.status === 'failed' || e.status === 'timeout').length,
            running: this.state.running
        };
    }
    // Complexity: O(1)
    scheduleTask(task) {
        if (!this.state.running || task.options?.enabled === false) {
            return;
        }
        // Clear existing timer
        if (task.timer) {
            // Complexity: O(1)
            clearTimeout(task.timer);
        }
        let delay;
        if (typeof task.schedule === 'number') {
            // Interval-based scheduling
            delay = task.schedule;
        }
        else {
            // Cron-based scheduling
            if (!task.cronParts) {
                task.cronParts = CronParser.parse(task.schedule);
            }
            task.nextRun = CronParser.getNextRun(task.cronParts);
            delay = task.nextRun.getTime() - Date.now();
        }
        // Ensure positive delay
        delay = Math.max(100, delay);
        task.timer = setTimeout(async () => {
            if (!this.state.running || task.options?.enabled === false) {
                return;
            }
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.executeTask(task);
            // Reschedule
            this.scheduleTask(task);
        }, delay);
    }
    // Complexity: O(N) — loop
    async executeTask(task) {
        const executionId = `${task.id}-${Date.now()}`;
        const execution = {
            id: executionId,
            taskId: task.id,
            startTime: new Date(),
            status: 'running'
        };
        this.state.executions.push(execution);
        this.trimExecutionHistory();
        this.emit('taskStart', { taskId: task.id, executionId });
        let retries = task.options?.retries ?? 0;
        let lastError;
        while (retries >= 0) {
            try {
                // Timeout wrapper
                const timeout = task.options?.timeout ?? 30000;
                await Promise.race([
                    task.handler(),
                    new Promise((_, reject) => 
                    // Complexity: O(1)
                    setTimeout(() => reject(new Error('Task timeout')), timeout))
                ]);
                // Success
                execution.status = 'completed';
                task.runCount++;
                task.lastRun = new Date();
                break;
            }
            catch (error) {
                lastError = error;
                retries--;
                if (retries >= 0) {
                    // SAFETY: async operation — wrap in try-catch for production resilience
                    await this.delay(task.options?.retryDelay ?? 1000);
                }
            }
        }
        // If still running, it failed
        if (execution.status === 'running') {
            execution.status = lastError?.message === 'Task timeout' ? 'timeout' : 'failed';
            execution.error = lastError?.message;
            task.failCount++;
        }
        execution.endTime = new Date();
        execution.duration = execution.endTime.getTime() - execution.startTime.getTime();
        this.emit('taskEnd', {
            taskId: task.id,
            executionId,
            status: execution.status,
            duration: execution.duration
        });
        return execution;
    }
    // Complexity: O(1)
    trimExecutionHistory() {
        if (this.state.executions.length > this.maxExecutionHistory) {
            this.state.executions = this.state.executions.slice(-this.maxExecutionHistory);
        }
    }
    // Complexity: O(1)
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
exports.Scheduler = Scheduler;
// ═══════════════════════════════════════════════════════════════════════════════
// PREDEFINED SCHEDULES
// ═══════════════════════════════════════════════════════════════════════════════
exports.SCHEDULES = {
    EVERY_MINUTE: '* * * * *',
    EVERY_5_MINUTES: '*/5 * * * *',
    EVERY_15_MINUTES: '*/15 * * * *',
    EVERY_30_MINUTES: '*/30 * * * *',
    EVERY_HOUR: '0 * * * *',
    EVERY_2_HOURS: '0 */2 * * *',
    EVERY_6_HOURS: '0 */6 * * *',
    EVERY_12_HOURS: '0 */12 * * *',
    DAILY: '0 0 * * *',
    DAILY_9AM: '0 9 * * *',
    DAILY_6PM: '0 18 * * *',
    WEEKLY: '0 0 * * 0',
    WEEKLY_MONDAY: '0 0 * * 1',
    MONTHLY: '0 0 1 * *',
    QUARTERLY: '0 0 1 */3 *',
    YEARLY: '0 0 1 1 *',
    WEEKDAYS: '0 9 * * 1-5',
    WEEKENDS: '0 10 * * 0,6'
};
// ═══════════════════════════════════════════════════════════════════════════════
// TEST SCHEDULER
// ═══════════════════════════════════════════════════════════════════════════════
class TestScheduler extends Scheduler {
    testSuites = new Map();
    // Complexity: O(1) — lookup
    addTestSuite(config) {
        this.testSuites.set(config.id, config);
        this.addTask({
            id: `test-suite-${config.id}`,
            name: `Test Suite: ${config.name}`,
            schedule: config.schedule,
            handler: async () => {
                this.emit('suiteStart', config);
                // Execute test suite logic here
                logger_1.logger.debug(`Running test suite: ${config.name}`);
                this.emit('suiteEnd', config);
            },
            options: config.options
        });
        return this;
    }
    // Complexity: O(1)
    removeTestSuite(id) {
        this.testSuites.delete(id);
        return this.removeTask(`test-suite-${id}`);
    }
}
exports.TestScheduler = TestScheduler;
// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════
function createScheduler() {
    return new Scheduler();
}
function createTestScheduler() {
    return new TestScheduler();
}
exports.default = {
    Scheduler,
    TestScheduler,
    CronParser,
    SCHEDULES: exports.SCHEDULES,
    createScheduler,
    createTestScheduler
};
