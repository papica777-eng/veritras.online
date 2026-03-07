"use strict";
/**
 * EventBus — Qantum Module
 * @module EventBus
 * @path src/events/EventBus.ts
 * @auto-documented BrutalDocEngine v2.1
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventBus = void 0;
const events_1 = require("events");
class EventBus {
    static instance;
    emitter;
    constructor() {
        this.emitter = new events_1.EventEmitter();
        this.emitter.setMaxListeners(100);
    }
    static getInstance() {
        if (!EventBus.instance)
            EventBus.instance = new EventBus();
        return EventBus.instance;
    }
    // Complexity: O(1)
    emit(event, data) {
        this.emitter.emit(event, data);
    }
    // Complexity: O(1)
    on(event, callback) {
        this.emitter.on(event, callback);
    }
    // Complexity: O(1)
    off(event, callback) {
        this.emitter.off(event, callback);
    }
}
exports.EventBus = EventBus;
