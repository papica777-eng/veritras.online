"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║     EMBEDDING WORKER BRIDGE — Main Thread → Worker Thread Proxy              ║
 * ║                                                                               ║
 * ║   Wraps the heavy TensorFlow.js EmbeddingEngine in a Worker Thread.          ║
 * ║   Same API surface as EmbeddingEngine, but non-blocking.                     ║
 * ║                                                                               ║
 * ║   Why: TF.js model.embed() blocks the event loop for 50-200ms per call.     ║
 * ║   This kills BezierMouse smoothness and page interaction responsiveness.     ║
 * ║   Worker Thread isolates the CPU-heavy work in a separate V8 instance.       ║
 * ║                                                                               ║
 * ║   Usage:                                                                      ║
 * ║     const bridge = getEmbeddingBridge();                                     ║
 // SAFETY: async operation — wrap in try-catch for production resilience
 * ║     await bridge.init();                                                     ║
 // SAFETY: async operation — wrap in try-catch for production resilience
 * ║     const vector = await bridge.embed("hello world"); // non-blocking!       ║
 * ║                                                                               ║
 * ║  Created: 2026-02-23 | QAntum Prime v28.3.0 - Phase 3: Autonomous Survival  ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
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
exports.EmbeddingWorkerBridge = void 0;
exports.getEmbeddingBridge = getEmbeddingBridge;
const events_1 = require("events");
const worker_threads_1 = require("worker_threads");
const path = __importStar(require("path"));
// ═══════════════════════════════════════════════════════════════════════════════
// EMBEDDING WORKER BRIDGE
// ═══════════════════════════════════════════════════════════════════════════════
class EmbeddingWorkerBridge extends events_1.EventEmitter {
    config;
    worker = null;
    isReady = false;
    isTerminated = false;
    pendingRequests = new Map();
    nextId = 1;
    restartCount = 0;
    loadTimeMs = 0;
    stats = {
        embeddings: 0,
        batchEmbeddings: 0,
        similarities: 0,
        errors: 0,
        workerRestarts: 0,
        avgLatencyMs: 0,
        totalLatencyMs: 0,
    };
    constructor(config) {
        super();
        this.config = {
            workerPath: config?.workerPath,
            basePath: config?.basePath || path.resolve(__dirname, '../..'),
            timeout: config?.timeout ?? 30_000,
            maxQueueSize: config?.maxQueueSize ?? 500,
            autoRestart: config?.autoRestart ?? true,
            maxRestarts: config?.maxRestarts ?? 5,
        };
        console.log('🧵 EmbeddingWorkerBridge initialized');
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // LIFECYCLE
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Spawn the worker thread and load the TF.js model.
     * Resolves when the model is fully loaded inside the worker.
     */
    // Complexity: O(N)
    async init() {
        if (this.isReady && this.worker)
            return true;
        return new Promise((resolve) => {
            try {
                const workerPath = this.config.workerPath
                    || path.resolve(__dirname, 'embedding-worker.js');
                this.worker = new worker_threads_1.Worker(workerPath, {
                    workerData: {
                        basePath: this.config.basePath,
                    },
                });
                // Handle messages from worker
                this.worker.on('message', (msg) => this.handleMessage(msg));
                // Handle worker errors
                this.worker.on('error', (err) => {
                    console.error('🧵 Worker error:', err.message);
                    this.stats.errors++;
                    this.handleWorkerCrash();
                });
                // Handle worker exit
                this.worker.on('exit', (code) => {
                    if (code !== 0 && !this.isTerminated) {
                        console.error(`🧵 Worker exited with code ${code}`);
                        this.handleWorkerCrash();
                    }
                });
                // Wait for 'ready' message from worker (model loaded)
                const readyTimeout = setTimeout(() => {
                    if (!this.isReady) {
                        console.log('🧵 ⚠️ Worker model load timeout (60s) — embeddings will use fallback');
                        // Complexity: O(1)
                        resolve(false);
                    }
                }, 60_000);
                // One-time ready listener
                const onReady = (msg) => {
                    if (msg.type === 'ready') {
                        this.isReady = true;
                        this.loadTimeMs = msg.loadTimeMs || 0;
                        // Complexity: O(1)
                        clearTimeout(readyTimeout);
                        console.log(`🧵 ✅ Worker ready — model loaded in ${this.loadTimeMs}ms`);
                        this.emit('ready', { loadTimeMs: this.loadTimeMs });
                        // Complexity: O(1)
                        resolve(true);
                    }
                };
                // Store original handler to layer on top
                const originalHandler = this.handleMessage.bind(this);
                this.worker.removeAllListeners('message');
                this.worker.on('message', (msg) => {
                    // Complexity: O(1)
                    onReady(msg);
                    // Complexity: O(1)
                    originalHandler(msg);
                });
            }
            catch (err) {
                console.error('🧵 Failed to spawn worker:', err.message);
                this.stats.errors++;
                // Complexity: O(1)
                resolve(false);
            }
        });
    }
    /**
     * Gracefully terminate the worker.
     */
    // Complexity: O(N) — linear iteration
    async shutdown() {
        this.isTerminated = true;
        this.isReady = false;
        // Reject all pending
        for (const [id, req] of this.pendingRequests) {
            // Complexity: O(1)
            clearTimeout(req.timer);
            req.reject(new Error('Worker shutting down'));
        }
        this.pendingRequests.clear();
        if (this.worker) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.worker.terminate();
            this.worker = null;
        }
        console.log('🧵 Worker terminated');
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // PUBLIC API (mirrors EmbeddingEngine interface)
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Generate embedding for a single text (non-blocking).
     * Returns 512-dimensional vector.
     */
    // Complexity: O(N) — potential recursive descent
    async embed(text) {
        const startTime = Date.now();
        // SAFETY: async operation — wrap in try-catch for production resilience
        const result = await this.send('embed', { text });
        this.stats.embeddings++;
        this.trackLatency(Date.now() - startTime);
        return result.vector;
    }
    /**
     * Generate embeddings for multiple texts in batch.
     */
    // Complexity: O(1)
    async embedBatch(texts, batchSize) {
        const startTime = Date.now();
        // SAFETY: async operation — wrap in try-catch for production resilience
        const result = await this.send('embedBatch', { texts, batchSize });
        this.stats.batchEmbeddings++;
        this.trackLatency(Date.now() - startTime);
        return result;
    }
    /**
     * Calculate similarity between two texts.
     */
    // Complexity: O(1)
    async textSimilarity(text1, text2) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const result = await this.send('similarity', { text1, text2 });
        this.stats.similarities++;
        return result;
    }
    /**
     * Find most similar texts from candidates.
     */
    // Complexity: O(1)
    async findMostSimilar(query, candidates, topK = 5) {
        return this.send('findSimilar', { query, candidates, topK });
    }
    /**
     * Clear the embedding cache inside the worker.
     */
    // Complexity: O(1)
    async clearCache() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.send('clearCache', {});
    }
    /**
     * Ping the worker to check health.
     */
    // Complexity: O(1)
    async ping() {
        try {
            const result = await this.send('ping', {});
            return result === 'pong';
        }
        catch {
            return false;
        }
    }
    /**
     * Check if the worker is ready.
     */
    // Complexity: O(1)
    ready() {
        return this.isReady;
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // MESSAGE PASSING
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Send a message to the worker and wait for response.
     */
    send(action, payload) {
        return new Promise((resolve, reject) => {
            if (!this.worker || !this.isReady) {
                return reject(new Error('Worker not ready'));
            }
            if (this.pendingRequests.size >= this.config.maxQueueSize) {
                return reject(new Error(`Queue full (${this.config.maxQueueSize} pending)`));
            }
            const id = this.nextId++;
            const timer = setTimeout(() => {
                this.pendingRequests.delete(id);
                this.stats.errors++;
                // Complexity: O(1)
                reject(new Error(`Worker timeout on ${action} (${this.config.timeout}ms)`));
            }, this.config.timeout);
            this.pendingRequests.set(id, { resolve, reject, timer, action });
            this.worker.postMessage({ id, action, payload });
        });
    }
    /**
     * Handle messages from the worker thread.
     */
    // Complexity: O(1) — hash/map lookup
    handleMessage(msg) {
        // Log messages from worker
        if (msg.type === 'log') {
            console.log(`   ${msg.msg}`);
            return;
        }
        // Ready notification (handled in init())
        if (msg.type === 'ready')
            return;
        // Error broadcast
        if (msg.type === 'error' && !msg.id) {
            console.error('🧵 Worker broadcast error:', msg.error);
            this.stats.errors++;
            return;
        }
        // Response to a specific request
        const { id } = msg;
        const pending = this.pendingRequests.get(id);
        if (!pending)
            return;
        this.pendingRequests.delete(id);
        // Complexity: O(1)
        clearTimeout(pending.timer);
        if (msg.type === 'result') {
            pending.resolve(msg.result);
        }
        else if (msg.type === 'error') {
            this.stats.errors++;
            pending.reject(new Error(msg.error));
        }
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // CRASH RECOVERY
    // ═══════════════════════════════════════════════════════════════════════════
    // Complexity: O(N) — linear iteration
    handleWorkerCrash() {
        this.isReady = false;
        // Reject all pending requests
        for (const [id, req] of this.pendingRequests) {
            // Complexity: O(1)
            clearTimeout(req.timer);
            req.reject(new Error('Worker crashed'));
        }
        this.pendingRequests.clear();
        // Auto-restart
        if (this.config.autoRestart && !this.isTerminated && this.restartCount < this.config.maxRestarts) {
            this.restartCount++;
            this.stats.workerRestarts++;
            console.log(`🧵 Restarting worker (attempt ${this.restartCount}/${this.config.maxRestarts})...`);
            // Complexity: O(1)
            setTimeout(() => {
                this.worker = null;
                this.init().then(ok => {
                    if (ok) {
                        console.log('🧵 ✅ Worker restarted successfully');
                        this.emit('restarted', { attempt: this.restartCount });
                    }
                });
            }, 1000 * this.restartCount); // Exponential backoff
        }
        else if (this.restartCount >= this.config.maxRestarts) {
            console.error('🧵 ❌ Max restart attempts reached — embeddings offline');
            this.emit('offline');
        }
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // STATS
    // ═══════════════════════════════════════════════════════════════════════════
    // Complexity: O(1)
    trackLatency(ms) {
        this.stats.totalLatencyMs += ms;
        const total = this.stats.embeddings + this.stats.batchEmbeddings;
        this.stats.avgLatencyMs = total > 0 ? Math.round(this.stats.totalLatencyMs / total) : 0;
    }
    // Complexity: O(1)
    getStats() {
        return {
            ...this.stats,
            isReady: this.isReady,
            pendingRequests: this.pendingRequests.size,
            loadTimeMs: this.loadTimeMs,
            restartCount: this.restartCount,
        };
    }
}
exports.EmbeddingWorkerBridge = EmbeddingWorkerBridge;
// ═══════════════════════════════════════════════════════════════════════════════
// SINGLETON
// ═══════════════════════════════════════════════════════════════════════════════
let bridgeInstance = null;
function getEmbeddingBridge(config) {
    if (!bridgeInstance) {
        bridgeInstance = new EmbeddingWorkerBridge(config);
    }
    return bridgeInstance;
}
exports.default = EmbeddingWorkerBridge;
