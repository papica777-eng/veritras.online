"use strict";
/**
 * thermal-aware-pool — Qantum Module
 * @module thermal-aware-pool
 * @path src/enterprise/thermal-aware-pool.ts
 * @auto-documented BrutalDocEngine v2.1
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThermalAwarePool = void 0;
const events_1 = require("events");
class ThermalAwarePool extends events_1.EventEmitter {
    temp = 60;
    config;
    constructor(config = {}) {
        super();
        this.config = {
            throttleThreshold: 90,
            criticalThreshold: 95,
            coolThreshold: 70,
            maxInstancesCool: 40,
            minInstancesHot: 4,
            ...config
        };
    }
    // Complexity: O(1)
    getState() {
        if (this.temp > 100)
            return 'emergency';
        if (this.temp > this.config.criticalThreshold)
            return 'critical';
        if (this.temp > this.config.throttleThreshold)
            return 'hot';
        return 'cool';
    }
    // Complexity: O(1)
    getConcurrency() {
        const state = this.getState();
        if (state === 'cool')
            return this.config.maxInstancesCool;
        if (state === 'hot')
            return this.config.minInstancesHot;
        return 0;
    }
    // Complexity: O(1)
    setTemperature(temp) {
        this.temp = temp;
    }
}
exports.ThermalAwarePool = ThermalAwarePool;
