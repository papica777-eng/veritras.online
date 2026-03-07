/**
 * Department — Qantum Module
 * @module Department
 * @path src/core/departments/Department.ts
 * @auto-documented BrutalDocEngine v2.1
 */

import { EventEmitter } from 'events';

export enum DepartmentStatus {
    OFFLINE = 'OFFLINE',
    INITIALIZING = 'INITIALIZING',
    OPERATIONAL = 'OPERATIONAL',
    ONLINE = 'ONLINE', // Added for engine compatibility
    DEGRADED = 'DEGRADED',
    MAINTENANCE = 'MAINTENANCE'
}

export abstract class Department extends EventEmitter {
    public name: string;
    public id: string;
    protected status: DepartmentStatus = DepartmentStatus.OFFLINE;
    private startTime: number = 0;
    private metrics: { latency: number[], requests: number, errors: number } = { latency: [], requests: 0, errors: 0 };

    constructor(name: string, id: string) {
        super();
        this.name = name;
        this.id = id;
    }

    public abstract initialize(): Promise<void>;
    public abstract shutdown(): Promise<void>;
    public abstract sync(): Promise<void>;
    public abstract getHealth(): Promise<any>;

    // Complexity: O(1)
    protected setStatus(status: DepartmentStatus) {
        this.status = status;
        console.log(`[${this.name}] Status changed to: ${status}`);
    }

    // Complexity: O(1)
    protected startClock() {
        this.startTime = Date.now();
    }

    // Complexity: O(1)
    protected updateMetrics(latencyMs: number, isError: boolean = false) {
        this.metrics.requests++;
        this.metrics.latency.push(latencyMs);
        if (this.metrics.latency.length > 100) this.metrics.latency.shift(); // Keep last 100
        if (isError) this.metrics.errors++;
    }

    // Complexity: O(N) — linear iteration
    protected getMetrics() {
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
