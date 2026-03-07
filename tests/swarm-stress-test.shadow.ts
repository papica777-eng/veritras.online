/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🔥 SWARM EXTREME STRESS TEST - "THE HAMMER" PROTOCOL (SHADOW v1.0.1)
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * v1.0.1 "Quantum Stability" Optimization
 */

import { Worker, isMainThread, parentPort, workerData, threadId } from 'worker_threads';
import { EventEmitter } from 'events';
import * as os from 'os';

const args = process.argv.slice(2);
const getArg = (name: string, defaultValue: string) => {
    const idx = args.indexOf(name);
    return (idx !== -1 && args[idx + 1]) ? args[idx + 1] : defaultValue;
};

const STRESS_CONFIG = {
    WORKER_COUNT: parseInt(getArg('--workers', '100')),
    THREAD_POOL_SIZE: Math.min(os.cpus().length, 16),
    get WORKERS_PER_THREAD() { return Math.ceil(this.WORKER_COUNT / this.THREAD_POOL_SIZE); },
    HAMMER_INTERVAL_MS: 1,
    TEST_DURATION_MS: parseInt(getArg('--duration', '15')) * 1000,
    LOAD_BALANCE_THRESHOLD_MS: 100,
};

class MetricsTracker {
    public messagesGenerated = 0;
    public messagesReceived = 0;
    private totalLatency = 0;
    private latencyCount = 0;
    private samples: number[] = [];

    recordLatency(ms: number) {
        this.totalLatency += ms;
        this.latencyCount++;
        if (this.samples.length < 1000) this.samples.push(ms);
    }

    getStats() {
        const sorted = [...this.samples].sort((a, b) => a - b);
        return {
            avgLatency: this.latencyCount > 0 ? this.totalLatency / this.latencyCount : 0,
            p99Latency: sorted.length > 0 ? sorted[Math.floor(sorted.length * 0.99)] : 0,
            lossPercentage: this.messagesGenerated > 0
                ? ((this.messagesGenerated - this.messagesReceived) / this.messagesGenerated) * 100
                : 0
        };
    }
}

class OptimizedEventBus extends EventEmitter {
    private buffer: any[] = [];
    constructor() {
        super();
        this.setMaxListeners(1000);
        setInterval(() => this.flush(), 100);
    }
    publish(data: any) { this.buffer.push(data); }
    private flush() {
        if (this.buffer.length === 0) return;
        const batch = this.buffer;
        this.buffer = [];
        setImmediate(() => this.emit('batch', batch));
    }
}

const workerCode = `
    const { parentPort, workerData } = require('worker_threads');
    const { startWorkerId, workerCount, hammerIntervalMs, testDurationMs } = workerData;
    let sent = 0;
    const interval = setInterval(() => {
        for(let i=0; i<workerCount; i++) {
            parentPort.postMessage({ workerId: startWorkerId + i, timestamp: Date.now() });
            sent++;
        }
    }, hammerIntervalMs);
    setTimeout(() => {
        clearInterval(interval);
        process.exit(0);
    }, testDurationMs);
`;

class SwarmStressTest {
    private metrics = new MetricsTracker();
    private eventBus = new OptimizedEventBus();
    private workers: Worker[] = [];

    async run() {
        console.log('🚀 Phase 1: Swarm Ignition (' + STRESS_CONFIG.WORKER_COUNT + ' workers)');

        this.eventBus.on('batch', (batch) => {
            this.metrics.messagesReceived += batch.length;
            const now = Date.now();
            batch.forEach((msg: any) => this.metrics.recordLatency(now - msg.timestamp));
        });

        for (let i = 0; i < STRESS_CONFIG.THREAD_POOL_SIZE; i++) {
            const startWorkerId = i * STRESS_CONFIG.WORKERS_PER_THREAD;
            const count = Math.min(STRESS_CONFIG.WORKERS_PER_THREAD, STRESS_CONFIG.WORKER_COUNT - startWorkerId);
            const worker = new Worker(workerCode, {
                eval: true,
                workerData: { startWorkerId, workerCount: count, hammerIntervalMs: STRESS_CONFIG.HAMMER_INTERVAL_MS, testDurationMs: STRESS_CONFIG.TEST_DURATION_MS }
            });
            worker.on('message', (msg) => {
                this.metrics.messagesGenerated++;
                this.eventBus.publish(msg);
            });
            this.workers.push(worker);
        }

        console.log('✅ Swarm Online. Pushing substrate limits...');
        await new Promise(r => setTimeout(r, STRESS_CONFIG.TEST_DURATION_MS + 2000));
        this.report();
    }

    private report() {
        const stats = this.metrics.getStats();
        console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
        console.log('║  📊 VERDICT: ' + (stats.avgLatency < 100 ? '✅ PASS' : '❌ FAIL'));
        console.log('╠══════════════════════════════════════════════════════════════════════════════╣');
        console.log('║  Avg Latency: ' + stats.avgLatency.toFixed(2) + 'ms');
        console.log('║  P99 Latency: ' + stats.p99Latency.toFixed(2) + 'ms');
        console.log('╚══════════════════════════════════════════════════════════════════════════════╝');
        process.exit(stats.avgLatency < 100 ? 0 : 1);
    }
}

if (isMainThread) new SwarmStressTest().run();
