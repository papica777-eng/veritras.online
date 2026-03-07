"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * APPLICATION CHAOS STRATEGIES
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * @author Димитър Продромов / Mister Mind
 * @copyright 2026 QAntum Empire. All Rights Reserved.
 * @version 33.5 - MODULAR CHAOS
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationStrategies = exports.DeadlockStrategy = exports.MemoryLeakStrategy = exports.MalformedResponseStrategy = exports.SlowResponseStrategy = exports.ExceptionInjectionStrategy = void 0;
// ═══════════════════════════════════════════════════════════════════════════════
// BASE APPLICATION STRATEGY
// ═══════════════════════════════════════════════════════════════════════════════
class BaseApplicationStrategy {
    category = 'application';
    active = false;
    startTime;
    async healthCheck() {
        return {
            healthy: !this.active,
            timestamp: new Date(),
            checks: [
                {
                    name: 'application_state',
                    status: this.active ? 'warn' : 'pass',
                    message: this.active ? 'Chaos injection active' : 'Normal operation',
                },
            ],
            overallScore: this.active ? 50 : 100,
        };
    }
    log(message) {
        console.log(`🔥 [CHAOS:${this.name.toUpperCase()}] ${message}`);
    }
}
// ═══════════════════════════════════════════════════════════════════════════════
// EXCEPTION INJECTION STRATEGY
// ═══════════════════════════════════════════════════════════════════════════════
class ExceptionInjectionStrategy extends BaseApplicationStrategy {
    targetFunctions;
    name = 'exception_injection';
    severity = 'medium';
    blastRadius;
    originalFunctions = new Map();
    errorRate;
    constructor(targetFunctions, errorRatePercent = 10) {
        super();
        this.targetFunctions = targetFunctions;
        this.errorRate = errorRatePercent / 100;
        this.blastRadius = {
            scope: 'service',
            affectedServices: targetFunctions,
            estimatedImpactPercent: errorRatePercent,
            maxDurationMs: 60000,
            rollbackTimeMs: 100,
        };
    }
    async inject() {
        this.startTime = new Date();
        this.active = true;
        this.log(`Injecting exceptions at ${this.errorRate * 100}% rate`);
        this.log(`Targets: ${this.targetFunctions.join(', ')}`);
        // In real implementation, would patch specific functions
        // Using dependency injection or module mocking
        return {
            success: true,
            strategyName: this.name,
            startTime: this.startTime,
            message: `Exception injection active at ${this.errorRate * 100}% rate`,
        };
    }
    async recover() {
        const recoveryStart = Date.now();
        // Restore original functions
        this.originalFunctions.clear();
        this.active = false;
        return {
            success: true,
            strategyName: this.name,
            recoveryTimeMs: Date.now() - recoveryStart,
            healthRestored: true,
            message: 'Original functions restored',
        };
    }
    /**
     * Check if should throw based on error rate
     */
    shouldThrow() {
        return this.active && Math.random() < this.errorRate;
    }
}
exports.ExceptionInjectionStrategy = ExceptionInjectionStrategy;
// ═══════════════════════════════════════════════════════════════════════════════
// SLOW RESPONSE STRATEGY
// ═══════════════════════════════════════════════════════════════════════════════
class SlowResponseStrategy extends BaseApplicationStrategy {
    delayMs;
    affectedEndpoints;
    name = 'slow_response';
    severity = 'medium';
    blastRadius;
    constructor(delayMs, affectedEndpoints) {
        super();
        this.delayMs = delayMs;
        this.affectedEndpoints = affectedEndpoints;
        this.blastRadius = {
            scope: 'service',
            affectedServices: affectedEndpoints,
            estimatedImpactPercent: 40,
            maxDurationMs: 120000,
            rollbackTimeMs: 100,
        };
    }
    async inject() {
        this.startTime = new Date();
        this.active = true;
        this.log(`Injecting ${this.delayMs}ms delay to responses`);
        return {
            success: true,
            strategyName: this.name,
            startTime: this.startTime,
            message: `Responses delayed by ${this.delayMs}ms`,
            affectedEndpoints: this.affectedEndpoints,
        };
    }
    async recover() {
        const recoveryStart = Date.now();
        this.active = false;
        return {
            success: true,
            strategyName: this.name,
            recoveryTimeMs: Date.now() - recoveryStart,
            healthRestored: true,
            message: 'Response delays removed',
        };
    }
    /**
     * Apply delay if active
     */
    async maybeDelay() {
        if (this.active) {
            await new Promise(resolve => setTimeout(resolve, this.delayMs));
        }
    }
}
exports.SlowResponseStrategy = SlowResponseStrategy;
// ═══════════════════════════════════════════════════════════════════════════════
// MALFORMED RESPONSE STRATEGY
// ═══════════════════════════════════════════════════════════════════════════════
class MalformedResponseStrategy extends BaseApplicationStrategy {
    affectedEndpoints;
    name = 'malformed_response';
    severity = 'high';
    blastRadius;
    corruptionType;
    constructor(corruptionType = 'json', affectedEndpoints) {
        super();
        this.affectedEndpoints = affectedEndpoints;
        this.corruptionType = corruptionType;
        this.blastRadius = {
            scope: 'service',
            affectedServices: affectedEndpoints,
            estimatedImpactPercent: 60,
            maxDurationMs: 30000,
            rollbackTimeMs: 100,
        };
    }
    async inject() {
        this.startTime = new Date();
        this.active = true;
        this.log(`Injecting ${this.corruptionType} corruption`);
        return {
            success: true,
            strategyName: this.name,
            startTime: this.startTime,
            message: `Response corruption (${this.corruptionType}) active`,
            affectedEndpoints: this.affectedEndpoints,
        };
    }
    async recover() {
        const recoveryStart = Date.now();
        this.active = false;
        return {
            success: true,
            strategyName: this.name,
            recoveryTimeMs: Date.now() - recoveryStart,
            healthRestored: true,
            message: 'Response corruption stopped',
        };
    }
    /**
     * Corrupt response data
     */
    corrupt(data) {
        if (!this.active)
            return data;
        switch (this.corruptionType) {
            case 'json':
                return `{invalid json ${JSON.stringify(data).substring(0, 50)}`;
            case 'truncate':
                return JSON.stringify(data).substring(0, 10);
            case 'garbage':
                return '☠️💀🔥' + Math.random().toString(36);
            case 'wrong_type':
                return Array.isArray(data) ? {} : [];
            default:
                return data;
        }
    }
}
exports.MalformedResponseStrategy = MalformedResponseStrategy;
// ═══════════════════════════════════════════════════════════════════════════════
// MEMORY LEAK SIMULATION STRATEGY
// ═══════════════════════════════════════════════════════════════════════════════
class MemoryLeakStrategy extends BaseApplicationStrategy {
    leakRateMbPerMinute;
    maxLeakMb;
    name = 'memory_leak';
    severity = 'high';
    blastRadius;
    leakIntervalId;
    leakedData = [];
    constructor(leakRateMbPerMinute = 10, maxLeakMb = 500) {
        super();
        this.leakRateMbPerMinute = leakRateMbPerMinute;
        this.maxLeakMb = maxLeakMb;
        this.blastRadius = {
            scope: 'single',
            affectedServices: ['self'],
            estimatedImpactPercent: 30,
            maxDurationMs: 300000,
            rollbackTimeMs: 10000,
        };
    }
    async inject() {
        this.startTime = new Date();
        this.active = true;
        const bytesPerSecond = (this.leakRateMbPerMinute * 1024 * 1024) / 60;
        const chunkSize = Math.floor(bytesPerSecond);
        this.log(`Starting memory leak: ${this.leakRateMbPerMinute}MB/min`);
        this.leakIntervalId = setInterval(() => {
            const currentLeakMb = (this.leakedData.length * chunkSize) / 1024 / 1024;
            if (currentLeakMb >= this.maxLeakMb) {
                this.log(`Max leak reached (${this.maxLeakMb}MB), stopping`);
                this.recover();
                return;
            }
            // Create unreferenced data that won't be GC'd
            const leak = Buffer.alloc(chunkSize);
            leak.fill(Math.random() * 255);
            this.leakedData.push(leak);
        }, 1000);
        return {
            success: true,
            strategyName: this.name,
            startTime: this.startTime,
            message: `Memory leak simulation started: ${this.leakRateMbPerMinute}MB/min`,
        };
    }
    async recover() {
        const recoveryStart = Date.now();
        if (this.leakIntervalId) {
            clearInterval(this.leakIntervalId);
        }
        const leakedMb = this.leakedData.reduce((sum, buf) => sum + buf.length, 0) / 1024 / 1024;
        this.log(`Recovering ${leakedMb.toFixed(2)}MB of leaked memory`);
        this.leakedData = [];
        if (global.gc) {
            global.gc();
        }
        this.active = false;
        return {
            success: true,
            strategyName: this.name,
            recoveryTimeMs: Date.now() - recoveryStart,
            healthRestored: true,
            message: `Released ${leakedMb.toFixed(2)}MB`,
        };
    }
}
exports.MemoryLeakStrategy = MemoryLeakStrategy;
// ═══════════════════════════════════════════════════════════════════════════════
// DEADLOCK STRATEGY
// ═══════════════════════════════════════════════════════════════════════════════
class DeadlockStrategy extends BaseApplicationStrategy {
    resourceNames;
    name = 'deadlock';
    severity = 'critical';
    blastRadius;
    locks = new Map();
    releaseCallbacks = [];
    constructor(resourceNames) {
        super();
        this.resourceNames = resourceNames;
        this.blastRadius = {
            scope: 'service',
            affectedServices: resourceNames,
            estimatedImpactPercent: 100,
            maxDurationMs: 10000,
            rollbackTimeMs: 100,
        };
    }
    async inject() {
        this.startTime = new Date();
        this.active = true;
        this.log(`Creating deadlock scenario with resources: ${this.resourceNames.join(', ')}`);
        // Simulate deadlock by creating circular waiting
        for (const resource of this.resourceNames) {
            let release;
            const lockPromise = new Promise(resolve => {
                release = resolve;
            });
            this.releaseCallbacks.push(release);
            this.locks.set(resource, lockPromise);
        }
        return {
            success: true,
            strategyName: this.name,
            startTime: this.startTime,
            message: `Deadlock simulation active on ${this.resourceNames.length} resources`,
        };
    }
    async recover() {
        const recoveryStart = Date.now();
        // Release all locks
        this.releaseCallbacks.forEach(release => release());
        this.releaseCallbacks = [];
        this.locks.clear();
        this.active = false;
        return {
            success: true,
            strategyName: this.name,
            recoveryTimeMs: Date.now() - recoveryStart,
            healthRestored: true,
            message: 'Deadlock resolved, all resources released',
        };
    }
    /**
     * Try to acquire a lock (will hang if deadlock active)
     */
    async acquireLock(resource) {
        const lock = this.locks.get(resource);
        if (lock) {
            await lock;
        }
    }
}
exports.DeadlockStrategy = DeadlockStrategy;
// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════
exports.ApplicationStrategies = {
    exceptionInjection: ExceptionInjectionStrategy,
    slowResponse: SlowResponseStrategy,
    malformedResponse: MalformedResponseStrategy,
    memoryLeak: MemoryLeakStrategy,
    deadlock: DeadlockStrategy,
};
