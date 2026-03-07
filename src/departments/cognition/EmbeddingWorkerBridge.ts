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

import { EventEmitter } from 'events';
import { Worker } from 'worker_threads';
import * as path from 'path';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface EmbeddingBridgeConfig {
  /** Path to the worker script (default: auto-resolved) */
  workerPath?: string;
  /** Base path for node_modules resolution inside worker */
  basePath?: string;
  /** Timeout for individual embed calls in ms (default: 30000) */
  timeout: number;
  /** Max queued requests before rejecting (default: 500) */
  maxQueueSize: number;
  /** Auto-restart worker on crash (default: true) */
  autoRestart: boolean;
  /** Max restart attempts before giving up (default: 5) */
  maxRestarts: number;
}

export interface EmbeddingResult {
  vector: number[];
  cached: boolean;
}

export interface SimilarityResult {
  text: string;
  score: number;
}

interface PendingRequest {
  resolve: (value: any) => void;
  reject: (reason: any) => void;
  timer: ReturnType<typeof setTimeout>;
  action: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// EMBEDDING WORKER BRIDGE
// ═══════════════════════════════════════════════════════════════════════════════

export class EmbeddingWorkerBridge extends EventEmitter {
  private config: EmbeddingBridgeConfig;
  private worker: Worker | null = null;
  private isReady: boolean = false;
  private isTerminated: boolean = false;
  private pendingRequests: Map<number, PendingRequest> = new Map();
  private nextId: number = 1;
  private restartCount: number = 0;
  private loadTimeMs: number = 0;

  private stats = {
    embeddings: 0,
    batchEmbeddings: 0,
    similarities: 0,
    errors: 0,
    workerRestarts: 0,
    avgLatencyMs: 0,
    totalLatencyMs: 0,
  };

  constructor(config?: Partial<EmbeddingBridgeConfig>) {
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
  public async init(): Promise<boolean> {
    if (this.isReady && this.worker) return true;

    return new Promise<boolean>((resolve) => {
      try {
        const workerPath = this.config.workerPath
          || path.resolve(__dirname, 'embedding-worker.js');

        this.worker = new Worker(workerPath, {
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
        const onReady = (msg: any) => {
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

      } catch (err: any) {
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
  public async shutdown(): Promise<void> {
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
  public async embed(text: string): Promise<number[]> {
    const startTime = Date.now();
    // SAFETY: async operation — wrap in try-catch for production resilience
    const result = await this.send<EmbeddingResult>('embed', { text });
    this.stats.embeddings++;
    this.trackLatency(Date.now() - startTime);
    return result.vector;
  }

  /**
   * Generate embeddings for multiple texts in batch.
   */
  // Complexity: O(1)
  public async embedBatch(texts: string[], batchSize?: number): Promise<number[][]> {
    const startTime = Date.now();
    // SAFETY: async operation — wrap in try-catch for production resilience
    const result = await this.send<number[][]>('embedBatch', { texts, batchSize });
    this.stats.batchEmbeddings++;
    this.trackLatency(Date.now() - startTime);
    return result;
  }

  /**
   * Calculate similarity between two texts.
   */
  // Complexity: O(1)
  public async textSimilarity(text1: string, text2: string): Promise<number> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    const result = await this.send<number>('similarity', { text1, text2 });
    this.stats.similarities++;
    return result;
  }

  /**
   * Find most similar texts from candidates.
   */
  // Complexity: O(1)
  public async findMostSimilar(
    query: string,
    candidates: string[],
    topK: number = 5
  ): Promise<SimilarityResult[]> {
    return this.send<SimilarityResult[]>('findSimilar', { query, candidates, topK });
  }

  /**
   * Clear the embedding cache inside the worker.
   */
  // Complexity: O(1)
  public async clearCache(): Promise<void> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.send('clearCache', {});
  }

  /**
   * Ping the worker to check health.
   */
  // Complexity: O(1)
  public async ping(): Promise<boolean> {
    try {
      const result = await this.send<string>('ping', {});
      return result === 'pong';
    } catch {
      return false;
    }
  }

  /**
   * Check if the worker is ready.
   */
  // Complexity: O(1)
  public ready(): boolean {
    return this.isReady;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MESSAGE PASSING
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Send a message to the worker and wait for response.
   */
  private send<T>(action: string, payload: any): Promise<T> {
    return new Promise<T>((resolve, reject) => {
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
  private handleMessage(msg: any): void {
    // Log messages from worker
    if (msg.type === 'log') {
      console.log(`   ${msg.msg}`);
      return;
    }

    // Ready notification (handled in init())
    if (msg.type === 'ready') return;

    // Error broadcast
    if (msg.type === 'error' && !msg.id) {
      console.error('🧵 Worker broadcast error:', msg.error);
      this.stats.errors++;
      return;
    }

    // Response to a specific request
    const { id } = msg;
    const pending = this.pendingRequests.get(id);
    if (!pending) return;

    this.pendingRequests.delete(id);
    // Complexity: O(1)
    clearTimeout(pending.timer);

    if (msg.type === 'result') {
      pending.resolve(msg.result);
    } else if (msg.type === 'error') {
      this.stats.errors++;
      pending.reject(new Error(msg.error));
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CRASH RECOVERY
  // ═══════════════════════════════════════════════════════════════════════════

  // Complexity: O(N) — linear iteration
  private handleWorkerCrash(): void {
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
    } else if (this.restartCount >= this.config.maxRestarts) {
      console.error('🧵 ❌ Max restart attempts reached — embeddings offline');
      this.emit('offline');
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STATS
  // ═══════════════════════════════════════════════════════════════════════════

  // Complexity: O(1)
  private trackLatency(ms: number): void {
    this.stats.totalLatencyMs += ms;
    const total = this.stats.embeddings + this.stats.batchEmbeddings;
    this.stats.avgLatencyMs = total > 0 ? Math.round(this.stats.totalLatencyMs / total) : 0;
  }

  // Complexity: O(1)
  public getStats() {
    return {
      ...this.stats,
      isReady: this.isReady,
      pendingRequests: this.pendingRequests.size,
      loadTimeMs: this.loadTimeMs,
      restartCount: this.restartCount,
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SINGLETON
// ═══════════════════════════════════════════════════════════════════════════════

let bridgeInstance: EmbeddingWorkerBridge | null = null;

export function getEmbeddingBridge(config?: Partial<EmbeddingBridgeConfig>): EmbeddingWorkerBridge {
  if (!bridgeInstance) {
    bridgeInstance = new EmbeddingWorkerBridge(config);
  }
  return bridgeInstance;
}

export default EmbeddingWorkerBridge;
