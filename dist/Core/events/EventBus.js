"use strict";
/**
 * EventBus — Qantum Module
 * @module EventBus
 * @path core/events/EventBus.ts
 * @auto-documented BrutalDocEngine v2.1
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventBus = void 0;
const events_1 = require("events");
const Logger_1 = require("../telemetry/Logger");
const Telemetry_1 = require("../telemetry/Telemetry");
/**
 * 🛰️ Global Event Bus
 * The backbone of asynchronous communication across the QANTUM ecosystem.
 */
class EventBus extends events_1.EventEmitter {
    static instance;
    logger;
    telemetry;
    history = [];
    maxHistory = 1000;
    constructor() {
        super();
        this.logger = Logger_1.Logger.getInstance();
        this.telemetry = Telemetry_1.Telemetry.getInstance();
        this.setMaxListeners(100);
    }
    static getInstance() {
        if (!EventBus.instance) {
            EventBus.instance = new EventBus();
        }
        return EventBus.instance;
    }
    /**
     * Publishes an event to the bus
     */
    // Complexity: O(1) — amortized
    publish(topic, source, payload, priority = 'MEDIUM') {
        const event = {
            id: `EVT_${Date.now()}_${Math.random().toString(36).substring(7)}`,
            topic,
            source,
            payload,
            timestamp: Date.now(),
            priority,
        };
        this.logger.debug('EVENT', `Publishing event: ${topic} from ${source}`, { priority });
        // Record telemetry
        this.telemetry.record('event.published', 1, { topic, source, priority });
        // Store in history
        this.history.push(event);
        if (this.history.length > this.maxHistory)
            this.history.shift();
        // Emit to listeners
        this.emit(topic, event);
        this.emit('*', event); // Wildcard listener
        // Critical events trigger immediate logging
        if (priority === 'CRITICAL') {
            this.logger.critical('EVENT', `CRITICAL EVENT: ${topic}`, { event });
        }
    }
    /**
     * Subscribes to a specific topic
     */
    // Complexity: O(N)
    subscribe(topic, handler) {
        this.on(topic, handler);
        this.logger.info('EVENT', `New subscription established for topic: ${topic}`);
    }
    /**
     * Subscribes to all events (wildcard)
     */
    // Complexity: O(1)
    subscribeAll(handler) {
        this.on('*', handler);
    }
    /**
     * Unsubscribes a handler from a topic
     */
    // Complexity: O(1)
    unsubscribe(topic, handler) {
        this.off(topic, handler);
    }
    /**
     * Retrieves event history filtered by topic
     */
    // Complexity: O(N) — linear iteration
    getHistory(topic) {
        if (topic) {
            return this.history.filter((e) => e.topic === topic);
        }
        return [...this.history];
    }
    /**
     * Clears event history
     */
    // Complexity: O(1)
    clearHistory() {
        this.logger.warn('EVENT', 'Event history purged.');
        this.history = [];
    }
    /**
     * Waits for a specific event to occur (Promise-based)
     */
    // Complexity: O(N)
    waitFor(topic, timeoutMs = 30000) {
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                this.off(topic, handler);
                // Complexity: O(N)
                reject(new Error(`Timeout waiting for event: ${topic}`));
            }, timeoutMs);
            const handler = (event) => {
                // Complexity: O(1)
                clearTimeout(timer);
                this.off(topic, handler);
                // Complexity: O(1)
                resolve(event);
            };
            this.once(topic, handler);
        });
    }
}
exports.EventBus = EventBus;
