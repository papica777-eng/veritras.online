"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                               ║
 * ║   QAntum CHRONOS ENGINE                                                       ║
 * ║   "Time-based test scheduling and orchestration"                              ║
 * ║                                                                               ║
 * ║   TODO B #31 - Chronos: Time Management                                       ║
 * ║                                                                               ║
 * ║   © 2025-2026 QAntum | Dimitar Prodromov                                        ║
 * ║                                                                               ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChronos = exports.ChronosEngine = exports.CronParser = void 0;
exports.Scheduled = Scheduled;
// ═══════════════════════════════════════════════════════════════════════════════
// CRON PARSER
// ═══════════════════════════════════════════════════════════════════════════════
class CronParser {
    /**
     * Parse cron expression
     */
    static parse(expression) {
        const parts = expression.split(' ');
        if (parts.length !== 5) {
            throw new Error('Invalid cron expression. Expected 5 parts.');
        }
        return {
            minute: parts[0],
            hour: parts[1],
            dayOfMonth: parts[2],
            month: parts[3],
            dayOfWeek: parts[4],
        };
    }
    /**
     * Get next execution time
     */
    static getNextRun(expression, from = new Date()) {
        const cron = this.parse(expression);
        const next = new Date(from);
        next.setSeconds(0, 0);
        next.setMinutes(next.getMinutes() + 1);
        // Simple implementation - find next matching time
        for (let i = 0; i < 525600; i++) {
            // Max 1 year ahead
            if (this.matches(next, cron)) {
                return next;
            }
            next.setMinutes(next.getMinutes() + 1);
        }
        throw new Error('Could not find next execution time');
    }
    /**
     * Check if date matches cron expression
     */
    static matches(date, cron) {
        return (this.matchField(date.getMinutes(), cron.minute) &&
            this.matchField(date.getHours(), cron.hour) &&
            this.matchField(date.getDate(), cron.dayOfMonth) &&
            this.matchField(date.getMonth() + 1, cron.month) &&
            this.matchField(date.getDay(), cron.dayOfWeek));
    }
    static matchField(value, field) {
        if (field === '*')
            return true;
        // Handle ranges (1-5)
        if (field.includes('-')) {
            const [min, max] = field.split('-').map(Number);
            return value >= min && value <= max;
        }
        // Handle lists (1,3,5)
        if (field.includes(',')) {
            return field.split(',').map(Number).includes(value);
        }
        // Handle steps (*/5)
        if (field.includes('/')) {
            const [, step] = field.split('/');
            return value % parseInt(step, 10) === 0;
        }
        // Exact match
        return value === parseInt(field, 10);
    }
}
exports.CronParser = CronParser;
// ═══════════════════════════════════════════════════════════════════════════════
// CHRONOS ENGINE
// ═══════════════════════════════════════════════════════════════════════════════
class ChronosEngine {
    static instance;
    jobs = new Map();
    results = new Map();
    timers = new Map();
    running = false;
    static getInstance() {
        if (!ChronosEngine.instance) {
            ChronosEngine.instance = new ChronosEngine();
        }
        return ChronosEngine.instance;
    }
    // ─────────────────────────────────────────────────────────────────────────
    // JOB SCHEDULING
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Schedule a one-time job
     */
    // Complexity: O(1)
    scheduleOnce(name, runAt, handler, options) {
        const timestamp = runAt instanceof Date ? runAt.getTime() : runAt;
        const delay = timestamp - Date.now();
        if (delay < 0) {
            throw new Error('Cannot schedule job in the past');
        }
        return this.createJob(name, 'once', timestamp, handler, options);
    }
    /**
     * Schedule a repeating job
     */
    // Complexity: O(1)
    scheduleInterval(name, intervalMs, handler, options) {
        return this.createJob(name, 'interval', intervalMs, handler, options);
    }
    /**
     * Schedule a cron job
     */
    // Complexity: O(1)
    scheduleCron(name, cronExpression, handler, options) {
        // Validate cron expression
        CronParser.parse(cronExpression);
        return this.createJob(name, 'cron', cronExpression, handler, options);
    }
    /**
     * Schedule a delayed job
     */
    // Complexity: O(1)
    scheduleDelay(name, delayMs, handler, options) {
        return this.createJob(name, 'delay', delayMs, handler, options);
    }
    // ─────────────────────────────────────────────────────────────────────────
    // JOB MANAGEMENT
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Get job by ID
     */
    // Complexity: O(1) — lookup
    getJob(jobId) {
        return this.jobs.get(jobId);
    }
    /**
     * Get all jobs
     */
    // Complexity: O(1)
    getAllJobs() {
        return [...this.jobs.values()];
    }
    /**
     * Get job results
     */
    // Complexity: O(1) — lookup
    getResults(jobId) {
        return this.results.get(jobId) || [];
    }
    /**
     * Cancel a job
     */
    // Complexity: O(1) — lookup
    cancel(jobId) {
        const job = this.jobs.get(jobId);
        if (!job)
            return false;
        job.status = 'cancelled';
        const timer = this.timers.get(jobId);
        if (timer) {
            // Complexity: O(1)
            clearTimeout(timer);
            this.timers.delete(jobId);
        }
        return true;
    }
    /**
     * Pause a job
     */
    // Complexity: O(1) — lookup
    pause(jobId) {
        const job = this.jobs.get(jobId);
        if (!job)
            return false;
        const timer = this.timers.get(jobId);
        if (timer) {
            // Complexity: O(1)
            clearTimeout(timer);
            this.timers.delete(jobId);
        }
        return true;
    }
    /**
     * Resume a job
     */
    // Complexity: O(1) — lookup
    resume(jobId) {
        const job = this.jobs.get(jobId);
        if (!job || job.status === 'cancelled')
            return false;
        this.scheduleNextRun(job);
        return true;
    }
    /**
     * Trigger job immediately
     */
    // Complexity: O(1) — lookup
    async trigger(jobId) {
        const job = this.jobs.get(jobId);
        if (!job)
            return null;
        return this.executeJob(job);
    }
    // ─────────────────────────────────────────────────────────────────────────
    // ENGINE CONTROL
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Start the engine
     */
    // Complexity: O(N) — loop
    start() {
        if (this.running)
            return;
        this.running = true;
        // Schedule all pending jobs
        for (const job of this.jobs.values()) {
            if (job.status === 'pending') {
                this.scheduleNextRun(job);
            }
        }
        console.log('[Chronos] Engine started');
    }
    /**
     * Stop the engine
     */
    // Complexity: O(N) — loop
    stop() {
        this.running = false;
        // Clear all timers
        for (const timer of this.timers.values()) {
            // Complexity: O(1)
            clearTimeout(timer);
        }
        this.timers.clear();
        console.log('[Chronos] Engine stopped');
    }
    /**
     * Check if running
     */
    // Complexity: O(1)
    isRunning() {
        return this.running;
    }
    // ─────────────────────────────────────────────────────────────────────────
    // PRIVATE
    // ─────────────────────────────────────────────────────────────────────────
    // Complexity: O(1) — lookup
    createJob(name, type, schedule, handler, options) {
        const id = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const job = {
            id,
            name,
            type,
            schedule,
            handler,
            status: 'pending',
            runCount: 0,
            createdAt: Date.now(),
            ...options,
        };
        // Calculate next run
        job.nextRun = this.calculateNextRun(job);
        this.jobs.set(id, job);
        this.results.set(id, []);
        if (this.running) {
            this.scheduleNextRun(job);
        }
        return id;
    }
    // Complexity: O(1)
    calculateNextRun(job) {
        const now = Date.now();
        switch (job.type) {
            case 'once':
                return job.schedule;
            case 'delay':
                return now + job.schedule;
            case 'interval':
                return now + job.schedule;
            case 'cron':
                return CronParser.getNextRun(job.schedule).getTime();
            default:
                return now;
        }
    }
    // Complexity: O(1) — lookup
    scheduleNextRun(job) {
        if (!job.nextRun)
            return;
        const delay = Math.max(0, job.nextRun - Date.now());
        const timer = setTimeout(async () => {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.executeJob(job);
            // Schedule next run if repeating
            if (job.type === 'interval' || job.type === 'cron') {
                if (job.maxRuns && job.runCount >= job.maxRuns) {
                    job.status = 'completed';
                }
                else {
                    job.nextRun = this.calculateNextRun(job);
                    this.scheduleNextRun(job);
                }
            }
        }, delay);
        this.timers.set(job.id, timer);
    }
    // Complexity: O(1) — lookup
    async executeJob(job) {
        const startedAt = Date.now();
        job.status = 'running';
        job.lastRun = startedAt;
        const result = {
            jobId: job.id,
            status: 'success',
            duration: 0,
            startedAt,
            completedAt: 0,
        };
        try {
            // Execute with timeout if specified
            if (job.timeout) {
                await Promise.race([
                    job.handler(),
                    new Promise((_, reject) => 
                    // Complexity: O(1)
                    setTimeout(() => reject(new Error('Job timeout')), job.timeout)),
                ]);
            }
            else {
                await job.handler();
            }
            job.runCount++;
            job.status = job.type === 'once' || job.type === 'delay' ? 'completed' : 'pending';
        }
        catch (error) {
            result.status = 'failure';
            result.error = error.message;
            job.status = 'failed';
            // Retry if configured
            if (job.retries && job.retries > 0) {
                job.retries--;
                job.nextRun = Date.now() + 5000; // Retry in 5 seconds
                this.scheduleNextRun(job);
            }
        }
        result.completedAt = Date.now();
        result.duration = result.completedAt - result.startedAt;
        // Store result
        const results = this.results.get(job.id) || [];
        results.push(result);
        this.results.set(job.id, results.slice(-100)); // Keep last 100 results
        return result;
    }
}
exports.ChronosEngine = ChronosEngine;
// ═══════════════════════════════════════════════════════════════════════════════
// DECORATORS
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * @Scheduled - Mark method as scheduled job
 */
function Scheduled(type, schedule) {
    return function (target, propertyKey, descriptor) {
        const original = descriptor.value;
        // Store metadata for registration
        if (!target._scheduledJobs)
            target._scheduledJobs = [];
        target._scheduledJobs.push({
            method: propertyKey,
            type,
            schedule,
        });
        return descriptor;
    };
}
// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════
const getChronos = () => ChronosEngine.getInstance();
exports.getChronos = getChronos;
exports.default = ChronosEngine;
