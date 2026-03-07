"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                               ║
 * ║   QAntum CHRONOS MODULE                                                       ║
 * ║   "Master of Time - Scheduling, Travel & Deadlines"                           ║
 * ║                                                                               ║
 * ║   TODO B #31-33 - Complete Chronos System                                     ║
 * ║                                                                               ║
 * ║   © 2025-2026 QAntum | Dimitar Prodromov                                        ║
 * ║                                                                               ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CronParser = exports.DeadlineExpiredError = exports.DeadlineContext = exports.DeadlineManager = exports.TimeTraveler = exports.ChronosEngine = exports.resetTime = exports.jumpTo = exports.rewind = exports.advance = exports.unfreeze = exports.freeze = exports.AdaptiveDeadline = exports.WithDeadline = exports.MockTime = exports.FrozenTime = exports.Scheduled = exports.chronos = exports.Chronos = void 0;
// ═══════════════════════════════════════════════════════════════════════════════
// RE-EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════
__exportStar(require("./engine"), exports);
__exportStar(require("./time-traveler"), exports);
__exportStar(require("./deadline"), exports);
// ═══════════════════════════════════════════════════════════════════════════════
// IMPORTS
// ═══════════════════════════════════════════════════════════════════════════════
const engine_1 = require("./engine");
Object.defineProperty(exports, "ChronosEngine", { enumerable: true, get: function () { return engine_1.ChronosEngine; } });
Object.defineProperty(exports, "CronParser", { enumerable: true, get: function () { return engine_1.CronParser; } });
Object.defineProperty(exports, "Scheduled", { enumerable: true, get: function () { return engine_1.Scheduled; } });
const time_traveler_1 = require("./time-traveler");
Object.defineProperty(exports, "TimeTraveler", { enumerable: true, get: function () { return time_traveler_1.TimeTraveler; } });
Object.defineProperty(exports, "freeze", { enumerable: true, get: function () { return time_traveler_1.freeze; } });
Object.defineProperty(exports, "unfreeze", { enumerable: true, get: function () { return time_traveler_1.unfreeze; } });
Object.defineProperty(exports, "advance", { enumerable: true, get: function () { return time_traveler_1.advance; } });
Object.defineProperty(exports, "rewind", { enumerable: true, get: function () { return time_traveler_1.rewind; } });
Object.defineProperty(exports, "jumpTo", { enumerable: true, get: function () { return time_traveler_1.jumpTo; } });
Object.defineProperty(exports, "resetTime", { enumerable: true, get: function () { return time_traveler_1.resetTime; } });
Object.defineProperty(exports, "FrozenTime", { enumerable: true, get: function () { return time_traveler_1.FrozenTime; } });
Object.defineProperty(exports, "MockTime", { enumerable: true, get: function () { return time_traveler_1.MockTime; } });
const deadline_1 = require("./deadline");
Object.defineProperty(exports, "DeadlineManager", { enumerable: true, get: function () { return deadline_1.DeadlineManager; } });
Object.defineProperty(exports, "DeadlineContext", { enumerable: true, get: function () { return deadline_1.DeadlineContext; } });
Object.defineProperty(exports, "DeadlineExpiredError", { enumerable: true, get: function () { return deadline_1.DeadlineExpiredError; } });
Object.defineProperty(exports, "WithDeadline", { enumerable: true, get: function () { return deadline_1.WithDeadline; } });
Object.defineProperty(exports, "AdaptiveDeadline", { enumerable: true, get: function () { return deadline_1.AdaptiveDeadline; } });
// ═══════════════════════════════════════════════════════════════════════════════
// UNIFIED CHRONOS FACADE
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * Unified Chronos - Master of Time
 */
class Chronos {
    static instance;
    engine;
    traveler;
    deadlineManager;
    constructor() {
        this.engine = (0, engine_1.getChronos)();
        this.traveler = time_traveler_1.TimeTraveler.getInstance();
        this.deadlineManager = (0, deadline_1.getDeadlineManager)();
    }
    static getInstance() {
        if (!Chronos.instance) {
            Chronos.instance = new Chronos();
        }
        return Chronos.instance;
    }
    // ─────────────────────────────────────────────────────────────────────────
    // SCHEDULING
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Schedule a one-time job
     */
    // Complexity: O(1)
    scheduleOnce(name, runAt, handler) {
        return this.engine.scheduleOnce(name, runAt, handler);
    }
    /**
     * Schedule a repeating job
     */
    // Complexity: O(1)
    scheduleInterval(name, intervalMs, handler) {
        return this.engine.scheduleInterval(name, intervalMs, handler);
    }
    /**
     * Schedule a cron job
     */
    // Complexity: O(1)
    scheduleCron(name, cronExpression, handler) {
        return this.engine.scheduleCron(name, cronExpression, handler);
    }
    /**
     * Schedule a delayed job
     */
    // Complexity: O(1)
    delay(name, delayMs, handler) {
        return this.engine.scheduleDelay(name, delayMs, handler);
    }
    /**
     * Cancel a scheduled job
     */
    // Complexity: O(1)
    cancelJob(jobId) {
        return this.engine.cancel(jobId);
    }
    /**
     * Start the scheduler
     */
    // Complexity: O(1)
    startScheduler() {
        this.engine.start();
    }
    /**
     * Stop the scheduler
     */
    // Complexity: O(1)
    stopScheduler() {
        this.engine.stop();
    }
    // ─────────────────────────────────────────────────────────────────────────
    // TIME TRAVEL
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Get current time (respects mock time)
     */
    // Complexity: O(1)
    now() {
        return this.traveler.now();
    }
    /**
     * Jump to specific time
     */
    // Complexity: O(1)
    jumpTo(time) {
        this.traveler.jumpTo(time);
    }
    /**
     * Advance time
     */
    // Complexity: O(1)
    advance(ms) {
        this.traveler.advance(ms);
    }
    /**
     * Rewind time
     */
    // Complexity: O(1)
    rewind(ms) {
        this.traveler.rewind(ms);
    }
    /**
     * Freeze time
     */
    // Complexity: O(1)
    freeze(at) {
        this.traveler.freeze(at);
    }
    /**
     * Unfreeze time
     */
    // Complexity: O(1)
    unfreeze() {
        this.traveler.unfreeze();
    }
    /**
     * Create time snapshot
     */
    // Complexity: O(1)
    snapshot(label) {
        return this.traveler.snapshot(label);
    }
    /**
     * Restore time snapshot
     */
    // Complexity: O(1)
    restoreSnapshot(idOrLabel) {
        return this.traveler.restore(idOrLabel);
    }
    /**
     * Install mock time globally
     */
    // Complexity: O(1)
    installMockTime() {
        this.traveler.install();
    }
    /**
     * Uninstall mock time
     */
    // Complexity: O(1)
    uninstallMockTime() {
        this.traveler.uninstall();
    }
    // ─────────────────────────────────────────────────────────────────────────
    // DEADLINES
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Execute with deadline
     */
    async withDeadline(name, timeoutMs, fn) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const result = await this.deadlineManager.withDeadline(name, timeoutMs, fn);
        if (result.expired) {
            throw new deadline_1.DeadlineExpiredError(name, timeoutMs);
        }
        return result.result;
    }
    /**
     * Execute with adaptive deadline
     */
    async withAdaptiveDeadline(name, baseTimeoutMs, fn) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const result = await this.deadlineManager.withAdaptiveDeadline(name, baseTimeoutMs, fn);
        if (result.expired) {
            throw new deadline_1.DeadlineExpiredError(name, baseTimeoutMs);
        }
        return result.result;
    }
    /**
     * Create deadline context
     */
    // Complexity: O(1)
    createDeadline(name, timeoutMs) {
        return this.deadlineManager.createContext(name, timeoutMs);
    }
    // ─────────────────────────────────────────────────────────────────────────
    // UTILITIES
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Parse cron expression
     */
    // Complexity: O(1)
    parseCron(expression) {
        return engine_1.CronParser.parse(expression);
    }
    /**
     * Get next cron run time
     */
    // Complexity: O(1)
    getNextCronRun(expression, from) {
        return engine_1.CronParser.getNextRun(expression, from);
    }
    /**
     * Sleep helper
     */
    // Complexity: O(1)
    async sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
    /**
     * Run all pending mock timers
     */
    // Complexity: O(1)
    runAllTimers() {
        this.traveler.runAllTimers();
    }
    /**
     * Reset all time manipulation
     */
    // Complexity: O(1)
    reset() {
        this.traveler.reset();
    }
}
exports.Chronos = Chronos;
// ═══════════════════════════════════════════════════════════════════════════════
// CONVENIENCE EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════
exports.chronos = Chronos.getInstance();
exports.default = Chronos;
