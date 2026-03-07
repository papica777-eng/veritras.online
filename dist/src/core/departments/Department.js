"use strict";
/**
 * Department — Qantum Module
 * @module Department
 * @path src/core/departments/Department.ts
 * @auto-documented BrutalDocEngine v2.1
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Department = exports.DepartmentStatus = void 0;
const events_1 = require("events");
var DepartmentStatus;
(function (DepartmentStatus) {
    DepartmentStatus["OFFLINE"] = "OFFLINE";
    DepartmentStatus["INITIALIZING"] = "INITIALIZING";
    DepartmentStatus["OPERATIONAL"] = "OPERATIONAL";
    DepartmentStatus["ONLINE"] = "ONLINE";
    DepartmentStatus["DEGRADED"] = "DEGRADED";
    DepartmentStatus["MAINTENANCE"] = "MAINTENANCE";
})(DepartmentStatus || (exports.DepartmentStatus = DepartmentStatus = {}));
class Department extends events_1.EventEmitter {
    name;
    id;
    status = DepartmentStatus.OFFLINE;
    startTime = 0;
    metrics = { latency: [], requests: 0, errors: 0 };
    constructor(name, id) {
        super();
        this.name = name;
        this.id = id;
    }
    // Complexity: O(1)
    setStatus(status) {
        this.status = status;
        console.log(`[${this.name}] Status changed to: ${status}`);
    }
    // Complexity: O(1)
    startClock() {
        this.startTime = Date.now();
    }
    // Complexity: O(1)
    updateMetrics(latencyMs, isError = false) {
        this.metrics.requests++;
        this.metrics.latency.push(latencyMs);
        if (this.metrics.latency.length > 100)
            this.metrics.latency.shift(); // Keep last 100
        if (isError)
            this.metrics.errors++;
    }
    // Complexity: O(N) — linear iteration
    getMetrics() {
        const avgLatency = this.metrics.latency.length > 0
            ? this.metrics.latency.reduce((a, b) => a + b, 0) / this.metrics.latency.length
            : 0;
        return {
            uptime: Date.now() - this.startTime,
            requests: this.metrics.requests,
            errors: this.metrics.errors,
            avgLatency: avgLatency.toFixed(2) + 'ms'
        };
    }
}
exports.Department = Department;
