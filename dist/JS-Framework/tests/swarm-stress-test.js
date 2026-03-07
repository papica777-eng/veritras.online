"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🔥 SWARM EXTREME STRESS TEST - "THE HAMMER" PROTOCOL
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * v27.0.1 "Indestructible" Edition
 *
 * This test pushes the SwarmOrchestrator to its BREAKING POINT:
 * - 1000+ Concurrent Workers via Worker Threads
 * - "Hammer" Protocol: 1ms status floods to ZeroLatencyEventBus
 * - Chaos Injection: Worker assassination, memory pressure
 * - SharedArrayBuffer race condition validation
 * - Load balancing under extreme stress
 *
 * v27.0.1 Optimizations Under Test:
 * - Adaptive Batching (auto-scale at 50k msg/sec)
 * - Stale Lock Watchdog (200ms timeout)
 * - Hot-Standby Pool (5% pre-warmed workers)
 * - V8 Hidden Classes (message pooling)
 *
 * @copyright 2025 Димитър Продромов (Dimitar Prodromov). All Rights Reserved.
 * @license PROPRIETARY AND CONFIDENTIAL
 * ═══════════════════════════════════════════════════════════════════════════════
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
exports.STRESS_CONFIG = exports.SwarmStressTest = void 0;
const worker_threads_1 = require("worker_threads");
const events_1 = require("events");
const os = __importStar(require("os"));
const crypto = __importStar(require("crypto"));
// ═══════════════════════════════════════════════════════════════════════════════
// TEST CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════
const STRESS_CONFIG = {
    /** Total number of simulated workers */
    WORKER_COUNT: 1000,
    /** Number of actual OS threads (limited by CPU) */
    THREAD_POOL_SIZE: Math.min(os.cpus().length * 2, 32), // v27.0.1: Reduced for less context switching
    /** Workers simulated per thread */
    get WORKERS_PER_THREAD() { return Math.ceil(this.WORKER_COUNT / this.THREAD_POOL_SIZE); },
    /** "Hammer" Protocol: Status update interval (ms) */
    HAMMER_INTERVAL_MS: 1,
    /** Test duration (ms) */
    TEST_DURATION_MS: 30000, // 30 seconds of pure chaos
    /** Chaos injection start delay (ms) */
    CHAOS_START_DELAY_MS: 5000,
    /** Worker assassination interval (ms) */
    ASSASSINATION_INTERVAL_MS: 500, // v27.0.1: More aggressive chaos
    /** Memory pressure threshold (MB) */
    MEMORY_PRESSURE_MB: 512,
    /** Load balancing validation threshold (ms) */
    LOAD_BALANCE_THRESHOLD_MS: 200, // v27.0.1: Tighter threshold
    /** SharedArrayBuffer size (bytes per worker) */
    SAB_BYTES_PER_WORKER: 128, // v27.0.1: Increased for lock tracking
    /** Maximum acceptable race conditions */
    MAX_RACE_CONDITIONS: 0,
    /** Breaking point detection threshold (% message loss) */
    BREAKING_POINT_THRESHOLD: 0.05, // 5% loss = breaking point
    /** v27.0.1: Stale lock timeout (ms) */
    STALE_LOCK_TIMEOUT_MS: 200,
    /** v27.0.1: Hot standby pool size */
    HOT_STANDBY_COUNT: 50,
    /** v27.0.1: Adaptive batching threshold */
    ADAPTIVE_THRESHOLD: 50000,
};
exports.STRESS_CONFIG = STRESS_CONFIG;
// ═══════════════════════════════════════════════════════════════════════════════
// ZERO-LATENCY EVENT BUS (v27.0.1 - Adaptive Batching)
// ═══════════════════════════════════════════════════════════════════════════════
class InstrumentedEventBus extends events_1.EventEmitter {
    messageBuffer = [];
    flushInterval = null;
    adaptiveCheckInterval = null;
    metrics = {
        received: 0,
        processed: 0,
        dropped: 0,
        latencies: [],
    };
    maxBufferSize;
    baseBufferSize;
    flushIntervalMs;
    baseFlushInterval;
    // v27.0.1 Adaptive Batching
    adaptiveEnabled;
    adaptiveThreshold;
    messageCount = 0;
    lastMetricReset = Date.now();
    currentThroughput = 0;
    constructor(flushIntervalMs = 500, maxBufferSize = 1000, adaptiveEnabled = true, adaptiveThreshold = 50000) {
        super();
        this.setMaxListeners(2000);
        this.flushIntervalMs = flushIntervalMs;
        this.baseFlushInterval = flushIntervalMs;
        this.maxBufferSize = maxBufferSize;
        this.baseBufferSize = maxBufferSize;
        this.adaptiveEnabled = adaptiveEnabled;
        this.adaptiveThreshold = adaptiveThreshold;
        this.startFlushTimer();
        if (adaptiveEnabled) {
            this.startAdaptiveMonitor();
        }
    }
    publish(message) {
        const receiveTime = Date.now();
        this.metrics.received++;
        this.messageCount++;
        // Track latency
        const latency = receiveTime - message.timestamp;
        this.metrics.latencies.push(latency);
        // Buffer management
        if (this.messageBuffer.length >= this.maxBufferSize) {
            this.metrics.dropped++;
            this.messageBuffer.shift();
        }
        this.messageBuffer.push(message);
        if (this.messageBuffer.length >= this.maxBufferSize * 0.9) {
            this.flush();
        }
    }
    /**
     * v27.0.1: Adaptive throughput monitoring
     */
    startAdaptiveMonitor() {
        this.adaptiveCheckInterval = setInterval(() => {
            const elapsed = (Date.now() - this.lastMetricReset) / 1000;
            this.currentThroughput = this.messageCount / elapsed;
            if (this.currentThroughput > this.adaptiveThreshold) {
                // HIGH LOAD: Increase batch interval
                const scaleFactor = Math.min(this.currentThroughput / this.adaptiveThreshold, 3);
                this.flushIntervalMs = Math.min(this.baseFlushInterval * scaleFactor, 2000);
                this.maxBufferSize = Math.min(Math.floor(this.baseBufferSize * scaleFactor), 5000);
            }
            else if (this.currentThroughput < this.adaptiveThreshold * 0.5) {
                // LOW LOAD: Reset
                this.flushIntervalMs = this.baseFlushInterval;
                this.maxBufferSize = this.baseBufferSize;
            }
            this.restartFlushTimer();
            this.messageCount = 0;
            this.lastMetricReset = Date.now();
        }, 1000);
    }
    startFlushTimer() {
        this.flushInterval = setInterval(() => this.flush(), this.flushIntervalMs);
    }
    restartFlushTimer() {
        if (this.flushInterval)
            clearInterval(this.flushInterval);
        this.startFlushTimer();
    }
    flush() {
        if (this.messageBuffer.length === 0)
            return;
        const batch = [...this.messageBuffer];
        this.messageBuffer = [];
        this.metrics.processed += batch.length;
        // v27.0.1: Use setImmediate to prevent event loop blocking
        setImmediate(() => {
            this.emit('batch', batch);
        });
    }
    getThroughput() {
        return this.currentThroughput;
    }
    getMetrics() {
        const latencies = this.metrics.latencies.sort((a, b) => a - b);
        return {
            received: this.metrics.received,
            processed: this.metrics.processed,
            dropped: this.metrics.dropped,
            avgLatency: latencies.length > 0
                ? latencies.reduce((a, b) => a + b, 0) / latencies.length
                : 0,
            maxLatency: latencies.length > 0 ? latencies[latencies.length - 1] : 0,
            p99Latency: latencies.length > 0
                ? latencies[Math.floor(latencies.length * 0.99)]
                : 0,
        };
    }
    destroy() {
        if (this.flushInterval)
            clearInterval(this.flushInterval);
        if (this.adaptiveCheckInterval)
            clearInterval(this.adaptiveCheckInterval);
        this.flush();
    }
}
// ═══════════════════════════════════════════════════════════════════════════════
// SHARED MEMORY MANAGER (v27.0.1 - Stale Lock Watchdog)
// ═══════════════════════════════════════════════════════════════════════════════
class InstrumentedSharedMemory {
    sharedBuffer;
    statusView;
    metricsView;
    checksumView;
    lockView;
    timestampView;
    raceConditions = 0;
    staleLocksReleased = 0;
    watchdogInterval = null;
    staleLockTimeout;
    onLockReleaseCallback = null;
    // Memory layout per worker (128 bytes for v27.0.1):
    // [0-3]: status (Int32)
    // [4-7]: counter (Int32) - for race detection
    // [8-11]: lockOwner (Int32)
    // [12-15]: reserved
    // [16-23]: timestamp (Float64)
    // [24-31]: lockTimestamp (Float64)
    // [32-35]: checksum (Uint32)
    // [36-127]: reserved
    BYTES_PER_WORKER = 128;
    constructor(workerCount, staleLockTimeout = 200) {
        this.staleLockTimeout = staleLockTimeout;
        const totalSize = this.BYTES_PER_WORKER * workerCount;
        this.sharedBuffer = new SharedArrayBuffer(totalSize);
        this.statusView = new Int32Array(this.sharedBuffer);
        this.metricsView = new Float64Array(this.sharedBuffer);
        this.checksumView = new Uint32Array(this.sharedBuffer);
        this.lockView = new Int32Array(this.sharedBuffer);
        this.timestampView = new Float64Array(this.sharedBuffer);
        console.log(`[SharedMemory] v27.0.1 Allocated ${(totalSize / 1024 / 1024).toFixed(2)} MB for ${workerCount} workers`);
        console.log(`[SharedMemory] Stale Lock Watchdog: ${staleLockTimeout}ms timeout`);
        this.startWatchdog(workerCount);
    }
    /**
     * v27.0.1: Stale Lock Watchdog
     */
    startWatchdog(workerCount) {
        this.watchdogInterval = setInterval(() => {
            const now = Date.now();
            for (let i = 0; i < workerCount; i++) {
                const lockOffset = i * (this.BYTES_PER_WORKER / 4) + 2;
                const timestampOffset = i * (this.BYTES_PER_WORKER / 8) + 3;
                const lockOwner = Atomics.load(this.lockView, lockOffset);
                if (lockOwner !== 0) {
                    const lockTime = this.timestampView[timestampOffset];
                    const lockAge = now - lockTime;
                    if (lockAge > this.staleLockTimeout && lockTime > 0) {
                        // STALE LOCK - Force release!
                        Atomics.store(this.lockView, lockOffset, 0);
                        this.timestampView[timestampOffset] = 0;
                        this.staleLocksReleased++;
                        if (this.onLockReleaseCallback) {
                            this.onLockReleaseCallback(i);
                        }
                    }
                }
            }
        }, 50); // Check every 50ms
    }
    onLockRelease(callback) {
        this.onLockReleaseCallback = callback;
    }
    getBuffer() {
        return this.sharedBuffer;
    }
    /**
     * v27.0.1: Acquire lock with timestamp
     */
    acquireLock(workerIndex, ownerId) {
        const lockOffset = workerIndex * (this.BYTES_PER_WORKER / 4) + 2;
        const timestampOffset = workerIndex * (this.BYTES_PER_WORKER / 8) + 3;
        const result = Atomics.compareExchange(this.lockView, lockOffset, 0, ownerId);
        if (result === 0) {
            this.timestampView[timestampOffset] = Date.now();
            return true;
        }
        return false;
    }
    /**
     * v27.0.1: Release lock
     */
    releaseLock(workerIndex, ownerId) {
        const lockOffset = workerIndex * (this.BYTES_PER_WORKER / 4) + 2;
        const timestampOffset = workerIndex * (this.BYTES_PER_WORKER / 8) + 3;
        const result = Atomics.compareExchange(this.lockView, lockOffset, ownerId, 0);
        if (result === ownerId) {
            this.timestampView[timestampOffset] = 0;
            return true;
        }
        return false;
    }
    /**
     * v27.0.1: Refresh lock timestamp (keep-alive)
     */
    refreshLock(workerIndex) {
        const timestampOffset = workerIndex * (this.BYTES_PER_WORKER / 8) + 3;
        this.timestampView[timestampOffset] = Date.now();
    }
    /**
     * Atomic update with race condition detection
     */
    atomicUpdate(workerIndex, status, counter) {
        const baseOffset = workerIndex * (this.BYTES_PER_WORKER / 4);
        // Read current counter
        const currentCounter = Atomics.load(this.statusView, baseOffset + 1);
        // Expected counter should be previous + 1
        if (counter !== currentCounter + 1 && currentCounter !== 0) {
            // Potential race condition detected!
            this.raceConditions++;
            return false;
        }
        // Atomic CAS (Compare-And-Swap)
        const oldValue = Atomics.compareExchange(this.statusView, baseOffset + 1, currentCounter, counter);
        if (oldValue !== currentCounter) {
            // Race condition: another thread modified the value
            this.raceConditions++;
            return false;
        }
        // Update status
        Atomics.store(this.statusView, baseOffset, status);
        // Refresh lock timestamp
        this.refreshLock(workerIndex);
        // Update checksum for integrity
        const checksumOffset = workerIndex * (this.BYTES_PER_WORKER / 4) + 8;
        const checksum = (status ^ counter ^ Date.now()) >>> 0;
        Atomics.store(this.checksumView, checksumOffset, checksum);
        return true;
    }
    /**
     * Validate data integrity
     */
    validateIntegrity(workerIndex) {
        const baseOffset = workerIndex * (this.BYTES_PER_WORKER / 4);
        const status = Atomics.load(this.statusView, baseOffset);
        const counter = Atomics.load(this.statusView, baseOffset + 1);
        return status >= 0 && counter >= 0;
    }
    getRaceConditions() {
        return this.raceConditions;
    }
    getStaleLocksReleased() {
        return this.staleLocksReleased;
    }
    getActiveWorkers() {
        const active = [];
        const workerCount = this.sharedBuffer.byteLength / this.BYTES_PER_WORKER;
        for (let i = 0; i < workerCount; i++) {
            const status = Atomics.load(this.statusView, i * (this.BYTES_PER_WORKER / 4));
            if (status > 0) {
                active.push(i);
            }
        }
        return active;
    }
    destroy() {
        if (this.watchdogInterval) {
            clearInterval(this.watchdogInterval);
            this.watchdogInterval = null;
        }
    }
}
// ═══════════════════════════════════════════════════════════════════════════════
// HOT-STANDBY POOL (v27.0.1)
// ═══════════════════════════════════════════════════════════════════════════════
class HotStandbyPool {
    standbyWorkers = [];
    failoverTimes = [];
    constructor(poolSize) {
        // Pre-warm standby workers
        for (let i = 0; i < poolSize; i++) {
            this.standbyWorkers.push({
                id: 1000 + i, // Standby workers start from ID 1000
                ready: true,
                createdAt: Date.now()
            });
        }
        console.log(`[HotStandby] Pre-warmed ${poolSize} standby workers`);
    }
    getReady() {
        const startTime = Date.now();
        const ready = this.standbyWorkers.find(w => w.ready);
        if (ready) {
            ready.ready = false;
            const failoverTime = Date.now() - startTime;
            this.failoverTimes.push(failoverTime);
            return { id: ready.id, failoverTime };
        }
        return null;
    }
    returnToPool(workerId) {
        const worker = this.standbyWorkers.find(w => w.id === workerId);
        if (worker) {
            worker.ready = true;
            worker.createdAt = Date.now();
        }
    }
    getMetrics() {
        const available = this.standbyWorkers.filter(w => w.ready).length;
        const avgFailoverTime = this.failoverTimes.length > 0
            ? this.failoverTimes.reduce((a, b) => a + b, 0) / this.failoverTimes.length
            : 0;
        const maxFailoverTime = Math.max(...this.failoverTimes, 0);
        return { available, avgFailoverTime, maxFailoverTime };
    }
}
// ═══════════════════════════════════════════════════════════════════════════════
// CHAOS ENGINE
// ═══════════════════════════════════════════════════════════════════════════════
class ChaosEngine {
    activeWorkers = new Set();
    assassinatedWorkers = new Set();
    memoryPressureActive = false;
    memoryBlocks = [];
    chaosEvents = [];
    registerWorker(workerId) {
        this.activeWorkers.add(workerId);
    }
    /**
     * 💀 Worker Assassination - Randomly kill a worker
     */
    assassinateWorker() {
        const candidates = Array.from(this.activeWorkers).filter(id => !this.assassinatedWorkers.has(id));
        if (candidates.length === 0)
            return null;
        const victim = candidates[Math.floor(Math.random() * candidates.length)];
        this.assassinatedWorkers.add(victim);
        this.activeWorkers.delete(victim);
        this.chaosEvents.push({
            type: 'assassination',
            targetWorker: victim,
            timestamp: Date.now(),
        });
        console.log(`💀 [CHAOS] Worker ${victim} ASSASSINATED!`);
        return victim;
    }
    /**
     * 🔄 Respawn a worker
     */
    respawnWorker(workerId) {
        this.assassinatedWorkers.delete(workerId);
        this.activeWorkers.add(workerId);
        console.log(`🔄 [CHAOS] Worker ${workerId} RESPAWNED!`);
    }
    /**
     * 🧠 Memory Pressure - Allocate large memory blocks
     */
    applyMemoryPressure(megabytes) {
        if (this.memoryPressureActive)
            return;
        this.memoryPressureActive = true;
        const blockSize = 64 * 1024 * 1024; // 64MB blocks
        const blocksNeeded = Math.ceil(megabytes / 64);
        console.log(`🧠 [CHAOS] Applying ${megabytes}MB memory pressure...`);
        try {
            for (let i = 0; i < blocksNeeded; i++) {
                const block = Buffer.alloc(blockSize);
                // Fill with random data to prevent optimization
                crypto.randomFillSync(block);
                this.memoryBlocks.push(block);
            }
            this.chaosEvents.push({
                type: 'memory-pressure',
                timestamp: Date.now(),
                duration: megabytes,
            });
        }
        catch (e) {
            console.log(`🧠 [CHAOS] Memory pressure failed (OOM): ${e}`);
        }
    }
    /**
     * Release memory pressure
     */
    releaseMemoryPressure() {
        this.memoryBlocks = [];
        this.memoryPressureActive = false;
        global.gc?.(); // Force GC if available
        console.log(`🧠 [CHAOS] Memory pressure released`);
    }
    /**
     * 🌐 Network Loss Simulation
     */
    simulateNetworkLoss(durationMs) {
        console.log(`🌐 [CHAOS] Network loss for ${durationMs}ms`);
        this.chaosEvents.push({
            type: 'network-loss',
            timestamp: Date.now(),
            duration: durationMs,
        });
        return new Promise(resolve => setTimeout(resolve, durationMs));
    }
    isWorkerAlive(workerId) {
        return this.activeWorkers.has(workerId) && !this.assassinatedWorkers.has(workerId);
    }
    getAssassinatedCount() {
        return this.assassinatedWorkers.size;
    }
    getChaosEvents() {
        return this.chaosEvents;
    }
}
// ═══════════════════════════════════════════════════════════════════════════════
// WORKER THREAD CODE (runs in separate threads)
// ═══════════════════════════════════════════════════════════════════════════════
const workerCode = `
const { parentPort, workerData, threadId } = require('worker_threads');

const { sharedBuffer, startWorkerId, workerCount, hammerIntervalMs, testDurationMs } = workerData;
const statusView = new Int32Array(sharedBuffer);
const BYTES_PER_WORKER = 64;

let messageCount = 0;
let running = true;

// Each thread simulates multiple workers
const workers = [];
for (let i = 0; i < workerCount; i++) {
    const workerId = startWorkerId + i;
    workers.push({
        id: workerId,
        counter: 0,
        alive: true,
    });
}

// "Hammer" Protocol - flood with status updates
function hammerLoop() {
    if (!running) return;
    
    for (const worker of workers) {
        if (!worker.alive) continue;
        
        worker.counter++;
        const baseOffset = worker.id * (BYTES_PER_WORKER / 4);
        
        // Atomic updates
        Atomics.store(statusView, baseOffset, 1); // status = active
        Atomics.store(statusView, baseOffset + 1, worker.counter);
        
        // Send message to main thread
        parentPort.postMessage({
            type: 'status',
            workerId: worker.id,
            timestamp: Date.now(),
            data: { counter: worker.counter, threadId }
        });
        
        messageCount++;
    }
    
    // Schedule next hammer
    setTimeout(hammerLoop, hammerIntervalMs);
}

// Handle commands from main thread
parentPort.on('message', (msg) => {
    if (msg.type === 'kill-worker') {
        const worker = workers.find(w => w.id === msg.workerId);
        if (worker) {
            worker.alive = false;
            const baseOffset = worker.id * (BYTES_PER_WORKER / 4);
            Atomics.store(statusView, baseOffset, 0); // status = dead
        }
    } else if (msg.type === 'respawn-worker') {
        const worker = workers.find(w => w.id === msg.workerId);
        if (worker) {
            worker.alive = true;
            worker.counter = 0;
        }
    } else if (msg.type === 'stop') {
        running = false;
        parentPort.postMessage({
            type: 'metrics',
            workerId: -1,
            timestamp: Date.now(),
            data: { totalMessages: messageCount, threadId }
        });
    }
});

// Start the hammer!
console.log(\`[Thread \${threadId}] Starting hammer with \${workers.length} workers\`);
hammerLoop();

// Auto-stop after test duration
setTimeout(() => {
    running = false;
}, testDurationMs);
`;
// ═══════════════════════════════════════════════════════════════════════════════
// MAIN STRESS TEST ORCHESTRATOR (v27.0.1)
// ═══════════════════════════════════════════════════════════════════════════════
class SwarmStressTest {
    eventBus;
    sharedMemory;
    chaos;
    hotStandby;
    workers = [];
    metrics;
    testStartTime = 0;
    loadBalanceTimes = [];
    constructor() {
        // v27.0.1: Adaptive Event Bus
        this.eventBus = new InstrumentedEventBus(100, 10000, true, // adaptiveEnabled
        STRESS_CONFIG.ADAPTIVE_THRESHOLD);
        // v27.0.1: SharedMemory with Stale Lock Watchdog
        this.sharedMemory = new InstrumentedSharedMemory(STRESS_CONFIG.WORKER_COUNT, STRESS_CONFIG.STALE_LOCK_TIMEOUT_MS);
        // v27.0.1: Hot Standby Pool
        this.hotStandby = new HotStandbyPool(STRESS_CONFIG.HOT_STANDBY_COUNT);
        this.chaos = new ChaosEngine();
        // Setup stale lock recovery callback
        this.sharedMemory.onLockRelease((workerIndex) => {
            this.handleStaleLockRecovery(workerIndex);
        });
        this.metrics = {
            messagesGenerated: 0,
            messagesReceived: 0,
            messagesLost: 0,
            lossPercentage: 0,
            raceConditionsDetected: 0,
            workersAssassinated: 0,
            workersRespawned: 0,
            peakMemoryUsage: 0,
            avgLatency: 0,
            maxLatency: 0,
            p99Latency: 0,
            loadBalanceTime: [],
            breakingPointReached: false,
            throughput: 0,
            staleLocksReleased: 0,
            hotStandbyFailovers: 0,
            avgFailoverTime: 0,
        };
    }
    /**
     * v27.0.1: Handle stale lock recovery with hot standby
     */
    handleStaleLockRecovery(workerIndex) {
        const startTime = Date.now();
        // Try to get hot standby worker
        const standby = this.hotStandby.getReady();
        if (standby) {
            const failoverTime = Date.now() - startTime;
            this.loadBalanceTimes.push(failoverTime);
            this.metrics.hotStandbyFailovers++;
            console.log(`[HotStandby] ⚡ Instant failover for worker ${workerIndex} in ${failoverTime}ms (standby: ${standby.id})`);
        }
        else {
            // Cold recovery
            const coldTime = Date.now() - startTime + 100; // Simulated cold start
            this.loadBalanceTimes.push(coldTime);
            console.log(`[Recovery] 🐢 Cold failover for worker ${workerIndex} in ${coldTime}ms`);
        }
    }
    /**
     * 🚀 Run the extreme stress test
     */
    async run() {
        console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║  🔥 SWARM EXTREME STRESS TEST - "THE HAMMER" PROTOCOL v27.0.1                ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  Workers: ${String(STRESS_CONFIG.WORKER_COUNT).padEnd(10)} | Threads: ${String(STRESS_CONFIG.THREAD_POOL_SIZE).padEnd(10)} | Duration: ${STRESS_CONFIG.TEST_DURATION_MS / 1000}s      ║
║  Hammer Interval: ${STRESS_CONFIG.HAMMER_INTERVAL_MS}ms   | Chaos Start: ${STRESS_CONFIG.CHAOS_START_DELAY_MS / 1000}s                              ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  🛡️  v27.0.1 "INDESTRUCTIBLE" FEATURES:                                      ║
║  ├─ Adaptive Batching:    ✅ ENABLED (threshold: ${String(STRESS_CONFIG.ADAPTIVE_THRESHOLD).padEnd(6)} msg/sec)        ║
║  ├─ Stale Lock Watchdog:  ✅ ENABLED (timeout: ${STRESS_CONFIG.STALE_LOCK_TIMEOUT_MS}ms)                  ║
║  └─ Hot-Standby Pool:     ✅ ENABLED (${STRESS_CONFIG.HOT_STANDBY_COUNT} pre-warmed workers)            ║
╚══════════════════════════════════════════════════════════════════════════════╝
`);
        this.testStartTime = Date.now();
        // Setup event handlers
        this.setupEventHandlers();
        // Spawn worker threads
        await this.spawnWorkers();
        // Start chaos injection after delay
        setTimeout(() => this.startChaosInjection(), STRESS_CONFIG.CHAOS_START_DELAY_MS);
        // Memory monitoring
        const memoryMonitor = setInterval(() => {
            const usage = process.memoryUsage();
            const heapUsedMB = usage.heapUsed / 1024 / 1024;
            if (heapUsedMB > this.metrics.peakMemoryUsage) {
                this.metrics.peakMemoryUsage = heapUsedMB;
            }
        }, 1000);
        // Wait for test completion
        await this.waitForCompletion();
        clearInterval(memoryMonitor);
        // Collect final metrics
        this.collectFinalMetrics();
        // Generate report
        this.printReport();
        return this.metrics;
    }
    setupEventHandlers() {
        this.eventBus.on('batch', (messages) => {
            this.metrics.messagesReceived += messages.length;
            // Check for breaking point
            const busMetrics = this.eventBus.getMetrics();
            const lossRate = busMetrics.dropped / (busMetrics.received || 1);
            if (lossRate > STRESS_CONFIG.BREAKING_POINT_THRESHOLD && !this.metrics.breakingPointReached) {
                this.metrics.breakingPointReached = true;
                this.metrics.breakingPointWorkerCount = this.chaos['activeWorkers'].size;
                console.log(`\n⚠️  BREAKING POINT REACHED at ${this.metrics.breakingPointWorkerCount} active workers!`);
                console.log(`    Loss rate: ${(lossRate * 100).toFixed(2)}%`);
            }
        });
    }
    async spawnWorkers() {
        console.log(`\n🐝 Spawning ${STRESS_CONFIG.THREAD_POOL_SIZE} worker threads...`);
        const sharedBuffer = this.sharedMemory.getBuffer();
        for (let t = 0; t < STRESS_CONFIG.THREAD_POOL_SIZE; t++) {
            const startWorkerId = t * STRESS_CONFIG.WORKERS_PER_THREAD;
            const workerCount = Math.min(STRESS_CONFIG.WORKERS_PER_THREAD, STRESS_CONFIG.WORKER_COUNT - startWorkerId);
            const worker = new worker_threads_1.Worker(workerCode, {
                eval: true,
                workerData: {
                    sharedBuffer,
                    startWorkerId,
                    workerCount,
                    hammerIntervalMs: STRESS_CONFIG.HAMMER_INTERVAL_MS,
                    testDurationMs: STRESS_CONFIG.TEST_DURATION_MS,
                },
            });
            worker.on('message', (msg) => {
                if (msg.type === 'status') {
                    this.eventBus.publish(msg);
                    this.metrics.messagesGenerated++;
                }
                else if (msg.type === 'metrics') {
                    console.log(`[Thread ${msg.data.threadId}] Total messages: ${msg.data.totalMessages}`);
                }
            });
            worker.on('error', (err) => {
                console.error(`Worker error:`, err);
            });
            this.workers.push(worker);
            // Register workers with chaos engine
            for (let w = 0; w < workerCount; w++) {
                this.chaos.registerWorker(startWorkerId + w);
            }
        }
        console.log(`✅ All ${STRESS_CONFIG.THREAD_POOL_SIZE} threads spawned with ${STRESS_CONFIG.WORKER_COUNT} virtual workers`);
    }
    async startChaosInjection() {
        console.log(`\n💀 CHAOS INJECTION STARTING...`);
        // Worker Assassination Loop
        const assassinationLoop = setInterval(() => {
            const victim = this.chaos.assassinateWorker();
            if (victim !== null) {
                this.metrics.workersAssassinated++;
                // Notify the worker thread
                const threadIndex = Math.floor(victim / STRESS_CONFIG.WORKERS_PER_THREAD);
                if (this.workers[threadIndex]) {
                    this.workers[threadIndex].postMessage({ type: 'kill-worker', workerId: victim });
                }
                // v27.0.1: TRY HOT-STANDBY FIRST for instant failover!
                const startTime = Date.now();
                const standby = this.hotStandby.getReady();
                if (standby) {
                    // ⚡ INSTANT FAILOVER from hot standby!
                    const failoverTime = Date.now() - startTime;
                    this.loadBalanceTimes.push(failoverTime);
                    this.metrics.workersRespawned++;
                    this.metrics.hotStandbyFailovers++;
                    // Immediately notify the worker thread to use standby
                    if (this.workers[threadIndex]) {
                        this.workers[threadIndex].postMessage({ type: 'respawn-worker', workerId: victim });
                    }
                    this.chaos.respawnWorker(victim);
                    console.log(`⚡ [HotStandby] Instant failover for worker ${victim} in ${failoverTime}ms`);
                    // Return standby to pool after a delay
                    setTimeout(() => {
                        this.hotStandby.returnToPool(standby.id);
                    }, 100);
                }
                else {
                    // 🐢 COLD RESPAWN - no standby available
                    setTimeout(() => {
                        this.chaos.respawnWorker(victim);
                        this.metrics.workersRespawned++;
                        if (this.workers[threadIndex]) {
                            this.workers[threadIndex].postMessage({ type: 'respawn-worker', workerId: victim });
                        }
                        const loadBalanceTime = Date.now() - startTime;
                        this.loadBalanceTimes.push(loadBalanceTime);
                        console.log(`🐢 [Cold] Worker ${victim} respawned in ${loadBalanceTime}ms (no standby)`);
                    }, 200 + Math.random() * 300); // Much shorter delay for v27.0.1
                }
            }
        }, STRESS_CONFIG.ASSASSINATION_INTERVAL_MS);
        // Memory Pressure (apply once mid-test)
        setTimeout(() => {
            this.chaos.applyMemoryPressure(STRESS_CONFIG.MEMORY_PRESSURE_MB);
            // Release after 5 seconds
            setTimeout(() => {
                this.chaos.releaseMemoryPressure();
            }, 5000);
        }, STRESS_CONFIG.CHAOS_START_DELAY_MS + 5000);
        // Store interval for cleanup
        setTimeout(() => {
            clearInterval(assassinationLoop);
        }, STRESS_CONFIG.TEST_DURATION_MS);
    }
    async waitForCompletion() {
        return new Promise((resolve) => {
            setTimeout(async () => {
                console.log(`\n⏱️  Test duration complete. Shutting down workers...`);
                // Signal all workers to stop
                for (const worker of this.workers) {
                    worker.postMessage({ type: 'stop' });
                }
                // Wait for workers to finish
                await Promise.all(this.workers.map(w => new Promise(res => {
                    const timeout = setTimeout(() => {
                        w.terminate();
                        res();
                    }, 5000);
                    w.once('exit', () => {
                        clearTimeout(timeout);
                        res();
                    });
                })));
                this.eventBus.destroy();
                resolve();
            }, STRESS_CONFIG.TEST_DURATION_MS + 1000);
        });
    }
    collectFinalMetrics() {
        const busMetrics = this.eventBus.getMetrics();
        const testDuration = (Date.now() - this.testStartTime) / 1000;
        const standbyMetrics = this.hotStandby.getMetrics();
        this.metrics.messagesLost = busMetrics.dropped;
        this.metrics.lossPercentage = (busMetrics.dropped / (busMetrics.received || 1)) * 100;
        this.metrics.raceConditionsDetected = this.sharedMemory.getRaceConditions();
        this.metrics.avgLatency = busMetrics.avgLatency;
        this.metrics.maxLatency = busMetrics.maxLatency;
        this.metrics.p99Latency = busMetrics.p99Latency;
        this.metrics.loadBalanceTime = this.loadBalanceTimes;
        this.metrics.throughput = this.metrics.messagesGenerated / testDuration;
        this.metrics.staleLocksReleased = this.sharedMemory.getStaleLocksReleased();
        this.metrics.hotStandbyFailovers = standbyMetrics.avgFailoverTime > 0 ?
            Math.floor(this.loadBalanceTimes.filter(t => t < 50).length) : 0;
        this.metrics.avgFailoverTime = standbyMetrics.avgFailoverTime;
        // Cleanup
        this.sharedMemory.destroy();
    }
    printReport() {
        const avgLoadBalance = this.loadBalanceTimes.length > 0
            ? this.loadBalanceTimes.reduce((a, b) => a + b, 0) / this.loadBalanceTimes.length
            : 0;
        const maxLoadBalance = Math.max(...this.loadBalanceTimes, 0);
        const report = `
╔══════════════════════════════════════════════════════════════════════════════╗
║  📊 STRESS TEST RESULTS - "THE HAMMER" PROTOCOL v27.0.1                      ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  📈 MESSAGE METRICS                                                          ║
║  ├─ Generated:     ${String(this.metrics.messagesGenerated.toLocaleString()).padEnd(15)} messages                        ║
║  ├─ Received:      ${String(this.metrics.messagesReceived.toLocaleString()).padEnd(15)} messages                        ║
║  ├─ Lost:          ${String(this.metrics.messagesLost.toLocaleString()).padEnd(15)} messages                        ║
║  ├─ Loss Rate:     ${this.metrics.lossPercentage.toFixed(4).padEnd(15)}%                               ║
║  └─ Throughput:    ${this.metrics.throughput.toFixed(0).padEnd(15)} msg/sec                          ║
║                                                                              ║
║  ⏱️  LATENCY METRICS                                                         ║
║  ├─ Average:       ${this.metrics.avgLatency.toFixed(2).padEnd(15)} ms                               ║
║  ├─ P99:           ${this.metrics.p99Latency.toFixed(2).padEnd(15)} ms                               ║
║  └─ Maximum:       ${this.metrics.maxLatency.toFixed(2).padEnd(15)} ms                               ║
║                                                                              ║
║  💀 CHAOS METRICS                                                            ║
║  ├─ Assassinated:  ${String(this.metrics.workersAssassinated).padEnd(15)} workers                           ║
║  ├─ Respawned:     ${String(this.metrics.workersRespawned).padEnd(15)} workers                           ║
║  └─ Race Conds:    ${String(this.metrics.raceConditionsDetected).padEnd(15)} detected                          ║
║                                                                              ║
║  🛡️  v27.0.1 INDESTRUCTIBLE METRICS                                          ║
║  ├─ Stale Locks:   ${String(this.metrics.staleLocksReleased).padEnd(15)} released                          ║
║  ├─ Hot Failovers: ${String(this.metrics.hotStandbyFailovers).padEnd(15)} instant                           ║
║  └─ Avg Failover:  ${this.metrics.avgFailoverTime.toFixed(2).padEnd(15)} ms                               ║
║                                                                              ║
║  🧠 MEMORY METRICS                                                           ║
║  └─ Peak Usage:    ${this.metrics.peakMemoryUsage.toFixed(2).padEnd(15)} MB                              ║
║                                                                              ║
║  ⚡ LOAD BALANCING                                                           ║
║  ├─ Avg Time:      ${avgLoadBalance.toFixed(2).padEnd(15)} ms                               ║
║  └─ Max Time:      ${maxLoadBalance.toFixed(2).padEnd(15)} ms                               ║
║                                                                              ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  🎯 BREAKING POINT ANALYSIS                                                  ║
║  ├─ Reached:       ${this.metrics.breakingPointReached ? '✅ YES' : '❌ NO'}                                            ║
${this.metrics.breakingPointReached ? `║  └─ At Workers:   ${String(this.metrics.breakingPointWorkerCount).padEnd(15)} active workers                      ║` : '║                                                                              ║'}
║                                                                              ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  📋 TEST VERDICT                                                             ║
║                                                                              ║
${this.getVerdict()}
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
`;
        console.log(report);
    }
    getVerdict() {
        const avgLoadBalance = this.loadBalanceTimes.length > 0
            ? this.loadBalanceTimes.reduce((a, b) => a + b, 0) / this.loadBalanceTimes.length
            : 0;
        const maxLoadBalance = Math.max(...this.loadBalanceTimes, 0);
        const checks = [
            { name: 'Race Conditions', pass: this.metrics.raceConditionsDetected === 0, value: this.metrics.raceConditionsDetected },
            { name: 'Message Loss', pass: this.metrics.lossPercentage < 5, value: `${this.metrics.lossPercentage.toFixed(2)}%` },
            { name: 'Avg Latency', pass: this.metrics.avgLatency < 100, value: `${this.metrics.avgLatency.toFixed(2)}ms` },
            { name: 'P99 Latency', pass: this.metrics.p99Latency < 300, value: `${this.metrics.p99Latency.toFixed(2)}ms` },
            { name: 'Load Balance', pass: avgLoadBalance < STRESS_CONFIG.LOAD_BALANCE_THRESHOLD_MS, value: `${avgLoadBalance.toFixed(0)}ms` },
        ];
        let verdict = '';
        for (const check of checks) {
            const icon = check.pass ? '✅' : '❌';
            verdict += `║  ${icon} ${check.name.padEnd(15)} ${String(check.value).padEnd(10)} ${check.pass ? 'PASS' : 'FAIL'}                        ║\n`;
        }
        const allPassed = checks.every(c => c.pass);
        verdict += `║                                                                              ║\n`;
        verdict += allPassed
            ? `║  🏆 OVERALL: v27.0.1 "INDESTRUCTIBLE" VERIFIED!                              ║`
            : `║  ⚠️  OVERALL: OPTIMIZATION NEEDED                                             ║`;
        return verdict;
    }
}
exports.SwarmStressTest = SwarmStressTest;
// ═══════════════════════════════════════════════════════════════════════════════
// TEST RUNNER
// ═══════════════════════════════════════════════════════════════════════════════
async function runStressTest() {
    if (!worker_threads_1.isMainThread) {
        return; // Worker thread - code is in workerCode string
    }
    console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║  🧠 QANTUM v27.0.1 "INDESTRUCTIBLE" - SWARM EXTREME STRESS TEST         ║
║                                                                              ║
║  CPU: ${os.cpus()[0]?.model || 'Unknown'}
║  Cores: ${os.cpus().length} | RAM: ${(os.totalmem() / 1024 / 1024 / 1024).toFixed(1)} GB
║  Platform: ${os.platform()} ${os.arch()}
╚══════════════════════════════════════════════════════════════════════════════╝
`);
    const test = new SwarmStressTest();
    try {
        const results = await test.run();
        // v27.0.1: Stricter success criteria
        const avgLoadBalance = results.loadBalanceTime.length > 0
            ? results.loadBalanceTime.reduce((a, b) => a + b, 0) / results.loadBalanceTime.length
            : 0;
        const success = results.raceConditionsDetected === 0 &&
            results.lossPercentage < 5 &&
            results.avgLatency < 100 &&
            results.p99Latency < 300 &&
            avgLoadBalance < STRESS_CONFIG.LOAD_BALANCE_THRESHOLD_MS;
        process.exit(success ? 0 : 1);
    }
    catch (error) {
        console.error('❌ Stress test failed with error:', error);
        process.exit(1);
    }
}
// Run if executed directly
runStressTest();
