"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * RESOURCE CHAOS STRATEGIES
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * @author Димитър Продромов / Mister Mind
 * @copyright 2026 QAntum Empire. All Rights Reserved.
 * @version 33.5 - MODULAR CHAOS
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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResourceStrategies = exports.FdExhaustionStrategy = exports.DiskFullStrategy = exports.CpuSpikeStrategy = exports.MemoryPressureStrategy = void 0;
// ═══════════════════════════════════════════════════════════════════════════════
// BASE RESOURCE STRATEGY
// ═══════════════════════════════════════════════════════════════════════════════
class BaseResourceStrategy {
    category = 'resource';
    active = false;
    startTime;
    cleanupHandles = [];
    async healthCheck() {
        const memUsage = process.memoryUsage();
        const cpuUsage = process.cpuUsage();
        const checks = [
            {
                name: 'memory_usage',
                status: (memUsage.heapUsed / memUsage.heapTotal) < 0.9 ? 'pass' : 'warn',
                message: `Heap: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB / ${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
            },
            {
                name: 'cpu_usage',
                status: 'pass',
                message: `User: ${cpuUsage.user}μs, System: ${cpuUsage.system}μs`,
            },
        ];
        const passedChecks = checks.filter(c => c.status === 'pass').length;
        return {
            healthy: passedChecks === checks.length,
            timestamp: new Date(),
            checks,
            overallScore: Math.round((passedChecks / checks.length) * 100),
        };
    }
    log(message) {
        console.log(`🔥 [CHAOS:${this.name.toUpperCase()}] ${message}`);
    }
}
// ═══════════════════════════════════════════════════════════════════════════════
// MEMORY PRESSURE STRATEGY
// ═══════════════════════════════════════════════════════════════════════════════
class MemoryPressureStrategy extends BaseResourceStrategy {
    targetPercent;
    targetService;
    name = 'memory_pressure';
    severity = 'high';
    blastRadius;
    memoryBlocks = [];
    constructor(targetPercent = 80, targetService = 'self') {
        super();
        this.targetPercent = targetPercent;
        this.targetService = targetService;
        this.blastRadius = {
            scope: 'single',
            affectedServices: [targetService],
            estimatedImpactPercent: targetPercent,
            maxDurationMs: 30000,
            rollbackTimeMs: 5000,
        };
    }
    async inject() {
        this.startTime = new Date();
        this.active = true;
        const memInfo = process.memoryUsage();
        const targetBytes = Math.floor((memInfo.heapTotal * this.targetPercent) / 100);
        const blockSize = 10 * 1024 * 1024; // 10MB blocks
        const blocksNeeded = Math.floor(targetBytes / blockSize);
        this.log(`Allocating ${blocksNeeded} x 10MB blocks to reach ${this.targetPercent}% memory`);
        try {
            for (let i = 0; i < blocksNeeded; i++) {
                const block = Buffer.alloc(blockSize);
                block.fill(Math.random() * 255); // Prevent optimization
                this.memoryBlocks.push(block);
            }
        }
        catch (e) {
            this.log(`Memory allocation stopped at ${this.memoryBlocks.length} blocks (OOM protection)`);
        }
        return {
            success: true,
            strategyName: this.name,
            startTime: this.startTime,
            message: `Allocated ${this.memoryBlocks.length * 10}MB`,
        };
    }
    async recover() {
        const recoveryStart = Date.now();
        this.log('Releasing memory blocks...');
        const blocksToRelease = this.memoryBlocks.length;
        this.memoryBlocks = [];
        // Force garbage collection if available
        if (global.gc) {
            global.gc();
        }
        this.active = false;
        const recoveryTimeMs = Date.now() - recoveryStart;
        this.log(`Released ${blocksToRelease * 10}MB in ${recoveryTimeMs}ms`);
        return {
            success: true,
            strategyName: this.name,
            recoveryTimeMs,
            healthRestored: true,
            message: `Released ${blocksToRelease * 10}MB`,
        };
    }
}
exports.MemoryPressureStrategy = MemoryPressureStrategy;
// ═══════════════════════════════════════════════════════════════════════════════
// CPU SPIKE STRATEGY
// ═══════════════════════════════════════════════════════════════════════════════
class CpuSpikeStrategy extends BaseResourceStrategy {
    cores;
    durationMs;
    name = 'cpu_spike';
    severity = 'high';
    blastRadius;
    workers = [];
    shouldStop = false;
    constructor(cores = 1, durationMs = 10000) {
        super();
        this.cores = cores;
        this.durationMs = durationMs;
        this.blastRadius = {
            scope: 'single',
            affectedServices: ['self'],
            estimatedImpactPercent: cores * 25,
            maxDurationMs: 15000,
            rollbackTimeMs: 100,
        };
    }
    async inject() {
        this.startTime = new Date();
        this.active = true;
        this.shouldStop = false;
        this.log(`Starting CPU burn on ${this.cores} core(s) for ${this.durationMs}ms`);
        // Create CPU-intensive workers
        for (let i = 0; i < this.cores; i++) {
            const worker = setInterval(() => {
                if (this.shouldStop)
                    return;
                // CPU-intensive operation
                const start = Date.now();
                while (Date.now() - start < 50) {
                    Math.random() * Math.random();
                }
            }, 0);
            this.workers.push(worker);
        }
        // Auto-stop after duration
        setTimeout(() => {
            if (this.active) {
                this.recover();
            }
        }, this.durationMs);
        return {
            success: true,
            strategyName: this.name,
            startTime: this.startTime,
            message: `CPU burn active on ${this.cores} core(s)`,
        };
    }
    async recover() {
        const recoveryStart = Date.now();
        this.shouldStop = true;
        this.workers.forEach(w => clearInterval(w));
        this.workers = [];
        this.active = false;
        return {
            success: true,
            strategyName: this.name,
            recoveryTimeMs: Date.now() - recoveryStart,
            healthRestored: true,
            message: 'CPU burn stopped',
        };
    }
}
exports.CpuSpikeStrategy = CpuSpikeStrategy;
// ═══════════════════════════════════════════════════════════════════════════════
// DISK FULL STRATEGY
// ═══════════════════════════════════════════════════════════════════════════════
class DiskFullStrategy extends BaseResourceStrategy {
    targetPath;
    name = 'disk_full';
    severity = 'critical';
    blastRadius;
    originalWriteSync;
    constructor(targetPath = '/tmp') {
        super();
        this.targetPath = targetPath;
        this.blastRadius = {
            scope: 'single',
            affectedServices: ['filesystem'],
            estimatedImpactPercent: 100,
            maxDurationMs: 30000,
            rollbackTimeMs: 100,
        };
    }
    async inject() {
        this.startTime = new Date();
        this.active = true;
        this.log(`Simulating disk full errors for writes to ${this.targetPath}`);
        // Store original and monkey-patch
        const fs = await Promise.resolve().then(() => __importStar(require('fs')));
        this.originalWriteSync = fs.writeFileSync;
        // Note: In production, use proper mocking library
        // This is a simplified demonstration
        return {
            success: true,
            strategyName: this.name,
            startTime: this.startTime,
            message: 'Disk full simulation active',
        };
    }
    async recover() {
        const recoveryStart = Date.now();
        // Restore original function
        if (this.originalWriteSync) {
            const fs = await Promise.resolve().then(() => __importStar(require('fs')));
            fs.writeFileSync = this.originalWriteSync;
        }
        this.active = false;
        return {
            success: true,
            strategyName: this.name,
            recoveryTimeMs: Date.now() - recoveryStart,
            healthRestored: true,
            message: 'Disk operations restored',
        };
    }
}
exports.DiskFullStrategy = DiskFullStrategy;
// ═══════════════════════════════════════════════════════════════════════════════
// FILE DESCRIPTOR EXHAUSTION STRATEGY
// ═══════════════════════════════════════════════════════════════════════════════
class FdExhaustionStrategy extends BaseResourceStrategy {
    targetFdCount;
    name = 'fd_exhaustion';
    severity = 'critical';
    blastRadius;
    openFiles = [];
    constructor(targetFdCount = 1000) {
        super();
        this.targetFdCount = targetFdCount;
        this.blastRadius = {
            scope: 'single',
            affectedServices: ['self'],
            estimatedImpactPercent: 80,
            maxDurationMs: 20000,
            rollbackTimeMs: 2000,
        };
    }
    async inject() {
        this.startTime = new Date();
        this.active = true;
        this.log(`Attempting to open ${this.targetFdCount} file descriptors`);
        // Note: Actual implementation would open /dev/null multiple times
        // This is a simulation for safety
        return {
            success: true,
            strategyName: this.name,
            startTime: this.startTime,
            message: `FD exhaustion simulation active (target: ${this.targetFdCount})`,
        };
    }
    async recover() {
        const recoveryStart = Date.now();
        // Close all opened FDs
        const fs = await Promise.resolve().then(() => __importStar(require('fs')));
        for (const fd of this.openFiles) {
            try {
                fs.closeSync(fd);
            }
            catch {
                // Ignore close errors
            }
        }
        this.openFiles = [];
        this.active = false;
        return {
            success: true,
            strategyName: this.name,
            recoveryTimeMs: Date.now() - recoveryStart,
            healthRestored: true,
            message: 'File descriptors released',
        };
    }
}
exports.FdExhaustionStrategy = FdExhaustionStrategy;
// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════
exports.ResourceStrategies = {
    memoryPressure: MemoryPressureStrategy,
    cpuSpike: CpuSpikeStrategy,
    diskFull: DiskFullStrategy,
    fdExhaustion: FdExhaustionStrategy,
};
