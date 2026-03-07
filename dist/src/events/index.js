"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                               ║
 * ║   QAntum EVENTS MODULE                                                        ║
 * ║   "Unified event system facade"                                               ║
 * ║                                                                               ║
 * ║   TODO B #41-42 - Events Module Complete                                      ║
 * ║                                                                               ║
 * ║   © 2025-2026 QAntum | Dimitar Prodromov                                        ║
 * ║                                                                               ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getQAntumEvents = exports.QAntumEvents = exports.createObservable = exports.createEmitter = exports.ObservableEmitter = exports.TypedEmitter = exports.events = exports.configureEventBus = exports.getEventBus = exports.EventBus = void 0;
// ═══════════════════════════════════════════════════════════════════════════════
// RE-EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════
var bus_1 = require("./bus");
Object.defineProperty(exports, "EventBus", { enumerable: true, get: function () { return bus_1.EventBus; } });
Object.defineProperty(exports, "getEventBus", { enumerable: true, get: function () { return bus_1.getEventBus; } });
Object.defineProperty(exports, "configureEventBus", { enumerable: true, get: function () { return bus_1.configureEventBus; } });
Object.defineProperty(exports, "events", { enumerable: true, get: function () { return bus_1.events; } });
var emitter_1 = require("./emitter");
Object.defineProperty(exports, "TypedEmitter", { enumerable: true, get: function () { return emitter_1.TypedEmitter; } });
Object.defineProperty(exports, "ObservableEmitter", { enumerable: true, get: function () { return emitter_1.ObservableEmitter; } });
Object.defineProperty(exports, "createEmitter", { enumerable: true, get: function () { return emitter_1.createEmitter; } });
Object.defineProperty(exports, "createObservable", { enumerable: true, get: function () { return emitter_1.createObservable; } });
// ═══════════════════════════════════════════════════════════════════════════════
// UNIFIED EVENTS
// ═══════════════════════════════════════════════════════════════════════════════
const bus_2 = require("./bus");
const emitter_2 = require("./emitter");
/**
 * Unified QAntum Events
 */
class QAntumEvents {
    static instance;
    bus;
    emitter;
    constructor() {
        this.bus = bus_2.EventBus.getInstance();
        this.emitter = (0, emitter_2.createEmitter)();
    }
    static getInstance() {
        if (!QAntumEvents.instance) {
            QAntumEvents.instance = new QAntumEvents();
        }
        return QAntumEvents.instance;
    }
    // ─────────────────────────────────────────────────────────────────────────
    // TYPED EVENTS
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Listen to typed event
     */
    on(event, handler) {
        this.emitter.on(event, handler);
        return this;
    }
    /**
     * Listen once
     */
    once(event, handler) {
        this.emitter.once(event, handler);
        return this;
    }
    /**
     * Remove listener
     */
    off(event, handler) {
        this.emitter.off(event, handler);
        return this;
    }
    /**
     * Emit typed event
     */
    emit(event, payload) {
        this.emitter.emit(event, payload);
        // Also emit to bus for middleware/history
        this.bus.emitSync(event, payload);
    }
    /**
     * Wait for event
     */
    waitFor(event, timeout) {
        return this.emitter.waitFor(event, timeout);
    }
    // ─────────────────────────────────────────────────────────────────────────
    // OBSERVABLES
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Create observable for event
     */
    observe(event) {
        const observable = (0, emitter_2.createObservable)();
        this.emitter.on(event, (payload) => {
            observable.next(payload);
        });
        return observable;
    }
    // ─────────────────────────────────────────────────────────────────────────
    // COMMON EVENTS
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Emit test start
     */
    // Complexity: O(1)
    testStart(name, suite) {
        this.emit('test:start', { name, suite });
    }
    /**
     * Emit test end
     */
    // Complexity: O(1)
    testEnd(name, passed, duration) {
        this.emit('test:end', { name, passed, duration });
    }
    /**
     * Emit test error
     */
    // Complexity: O(1)
    testError(name, error) {
        this.emit('test:error', { name, error });
    }
    /**
     * Emit suite start
     */
    // Complexity: O(1)
    suiteStart(name, testCount) {
        this.emit('suite:start', { name, testCount });
    }
    /**
     * Emit suite end
     */
    // Complexity: O(1)
    suiteEnd(name, passed, failed, duration) {
        this.emit('suite:end', { name, passed, failed, duration });
    }
    /**
     * Emit runner start
     */
    // Complexity: O(1)
    runnerStart(suites) {
        this.emit('runner:start', { suites });
    }
    /**
     * Emit runner end
     */
    // Complexity: O(1)
    runnerEnd(total, passed, failed, duration) {
        this.emit('runner:end', { total, passed, failed, duration });
    }
    /**
     * Emit performance measurement
     */
    // Complexity: O(1)
    perfMeasurement(name, value, unit = 'ms') {
        this.emit('perf:measurement', { name, value, unit });
    }
    // ─────────────────────────────────────────────────────────────────────────
    // UTILITIES
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Get history
     */
    // Complexity: O(1)
    getHistory(event) {
        return this.bus.getHistory(event);
    }
    /**
     * Clear history
     */
    // Complexity: O(1)
    clearHistory() {
        this.bus.clearHistory();
    }
    /**
     * Remove all listeners
     */
    // Complexity: O(1)
    reset() {
        this.emitter.removeAllListeners();
        this.bus.removeAllListeners();
    }
}
exports.QAntumEvents = QAntumEvents;
// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════
const getQAntumEvents = () => QAntumEvents.getInstance();
exports.getQAntumEvents = getQAntumEvents;
exports.default = QAntumEvents;
