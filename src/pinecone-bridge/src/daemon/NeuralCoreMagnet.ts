/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                              ║
 * ║        N E U R A L   C O R E   M A G N E T   v 3 4 . 1                       ║
 * ║         СЪБИРАЧ И ВЕКТОРИЗАТОР НА ОПЕРАТИВНИ ДАННИ                           ║
 * ║                                                                              ║
 * ║  "Аз виждам всичко. Аз помня всичко. Аз трансформирам в вектори."            ║
 * ║                                                                              ║
 * ║  Purpose: Collect operational data from all QAntum sources, convert to       ║
 * ║           embeddings via Universal Sentence Encoder, and persist to          ║
 * ║           Pinecone for eternal, semantically-searchable context.             ║
 * ║                                                                              ║
 * ║  © 2025-2026 QAntum Empire | Dimitar Prodromov                               ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import { EventEmitter } from 'events';
import { randomUUID } from 'crypto';
import {
  BridgeSystem,
  EmbeddingEngine,
  PersistentContextStore,
  createEmbedFunction,
} from '../../../../scripts/qantum/SaaS-Framework/01_ECOSYSTEM_APPS/MrMindQATool/src/index';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════════

export enum DataSourceType {
  TEST_RESULT = 'TEST_RESULT',
  BUG_REPORT = 'BUG_REPORT',
  CODE_CHANGE = 'CODE_CHANGE',
  USER_FEEDBACK = 'USER_FEEDBACK',
  SYSTEM_LOG = 'SYSTEM_LOG',
  GENESIS_AXIOM = 'GENESIS_AXIOM',
  GHOST_PROTOCOL = 'GHOST_PROTOCOL',
  HEALING_EVENT = 'HEALING_EVENT',
  MEDITATION_INSIGHT = 'MEDITATION_INSIGHT',
  DECISION_RECORD = 'DECISION_RECORD',
}

export interface DataFragment {
  id: string;
  source: DataSourceType;
  content: string;
  metadata: {
    project?: string;
    filePath?: string;
    timestamp: string;
    priority: 'low' | 'normal' | 'high' | 'critical';
    tags: string[];
    [key: string]: any;
  };
  embedding?: number[];
}

export interface MagnetConfig {
  bridgeSystem: BridgeSystem;
  autoVectorize?: boolean;
  batchSize?: number;
  flushInterval?: number;
  minContentLength?: number;
  maxContentLength?: number;
}

export interface MagnetStats {
  fragmentsCollected: number;
  fragmentsVectorized: number;
  fragmentsPersisted: number;
  bytesProcesed: number;
  lastFlush: Date | null;
  queueSize: number;
}

export interface VectorizedFragment extends DataFragment {
  embedding: number[];
  vectorId: string;
  persistedAt: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// NEURAL CORE MAGNET CLASS
// ═══════════════════════════════════════════════════════════════════════════════

export class NeuralCoreMagnet extends EventEmitter {
  private bridgeSystem: BridgeSystem;
  private embedEngine: EmbeddingEngine;
  private store: PersistentContextStore;

  // Queue for batch processing
  private fragmentQueue: DataFragment[] = [];
  private vectorizedCache: Map<string, VectorizedFragment> = new Map();

  // Configuration
  private config: Required<Omit<MagnetConfig, 'bridgeSystem'>>;

  // Metrics
  private stats: MagnetStats = {
    fragmentsCollected: 0,
    fragmentsVectorized: 0,
    fragmentsPersisted: 0,
    bytesProcesed: 0,
    lastFlush: null,
    queueSize: 0,
  };

  // Flush interval
  private flushInterval: NodeJS.Timeout | null = null;

  constructor(config: MagnetConfig) {
    super();
    this.bridgeSystem = config.bridgeSystem;
    this.embedEngine = config.bridgeSystem.embed;
    this.store = config.bridgeSystem.store;

    this.config = {
      autoVectorize: config.autoVectorize ?? true,
      batchSize: config.batchSize ?? 50,
      flushInterval: config.flushInterval ?? 30000,
      minContentLength: config.minContentLength ?? 10,
      maxContentLength: config.maxContentLength ?? 10000,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // LIFECYCLE
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Start the magnet - begin collecting and processing
   */
  // Complexity: O(1)
  start(): void {
    console.log('🧲 [NEURAL_MAGNET] Starting Neural Core Magnet...');

    // Start flush interval
    this.flushInterval = setInterval(async () => {
      // SAFETY: async operation — wrap in try-catch for production resilience
      await this.flush();
    }, this.config.flushInterval);

    this.emit('started');
    console.log('🧲 [NEURAL_MAGNET] Operational. Ready to collect data.');
  }

  /**
   * Stop the magnet - flush remaining and shutdown
   */
  // Complexity: O(1)
  async stop(): Promise<void> {
    console.log('🧲 [NEURAL_MAGNET] Stopping...');

    if (this.flushInterval) {
      // Complexity: O(1)
      clearInterval(this.flushInterval);
    }

    // Final flush
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.flush();

    this.emit('stopped');
    console.log('🧲 [NEURAL_MAGNET] Stopped. All data persisted.');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // DATA COLLECTION
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Collect a data fragment
   */
  // Complexity: O(1)
  collect(source: DataSourceType, content: string, metadata?: Partial<DataFragment['metadata']>): string {
    // Validate content length
    if (content.length < this.config.minContentLength) {
      this.emit('rejected', { reason: 'content too short', content });
      return '';
    }

    // Truncate if too long
    if (content.length > this.config.maxContentLength) {
      content = content.slice(0, this.config.maxContentLength) + '... [TRUNCATED]';
    }

    const fragment: DataFragment = {
      id: randomUUID(),
      source,
      content,
      metadata: {
        timestamp: new Date().toISOString(),
        priority: 'normal',
        tags: [],
        ...metadata,
      },
    };

    this.fragmentQueue.push(fragment);
    this.stats.fragmentsCollected++;
    this.stats.bytesProcesed += content.length;
    this.stats.queueSize = this.fragmentQueue.length;

    this.emit('collected', { fragmentId: fragment.id, source, size: content.length });

    // Auto-vectorize if queue reaches batch size
    if (this.config.autoVectorize && this.fragmentQueue.length >= this.config.batchSize) {
      this.flush().catch(err => this.emit('error', err));
    }

    return fragment.id;
  }

  /**
   * Collect a test result
   */
  // Complexity: O(N) — linear scan
  collectTestResult(result: {
    testId: string;
    testName: string;
    status: string;
    duration: number;
    error?: string;
    projectId?: string;
  }): string {
    const content = [
      `Test: ${result.testName}`,
      `Status: ${result.status}`,
      `Duration: ${result.duration}ms`,
      result.error ? `Error: ${result.error}` : '',
    ].filter(Boolean).join('\n');

    return this.collect(DataSourceType.TEST_RESULT, content, {
      project: result.projectId,
      tags: ['test', result.status.toLowerCase()],
      testId: result.testId,
    });
  }

  /**
   * Collect a bug report
   */
  // Complexity: O(1)
  collectBugReport(bug: {
    bugId: string;
    title: string;
    description: string;
    severity: string;
    projectId?: string;
  }): string {
    const content = [
      `Bug: ${bug.title}`,
      `Severity: ${bug.severity}`,
      `Description: ${bug.description}`,
    ].join('\n');

    return this.collect(DataSourceType.BUG_REPORT, content, {
      project: bug.projectId,
      priority: bug.severity === 'critical' ? 'critical' : 'high',
      tags: ['bug', bug.severity],
      bugId: bug.bugId,
    });
  }

  /**
   * Collect a code change
   */
  // Complexity: O(N) — linear scan
  collectCodeChange(change: {
    filePath: string;
    changeType: 'added' | 'modified' | 'deleted';
    diff?: string;
    commitId?: string;
    projectId?: string;
  }): string {
    const content = [
      `File: ${change.filePath}`,
      `Change: ${change.changeType}`,
      change.diff ? `Diff:\n${change.diff.slice(0, 2000)}` : '',
    ].filter(Boolean).join('\n');

    return this.collect(DataSourceType.CODE_CHANGE, content, {
      project: change.projectId,
      filePath: change.filePath,
      tags: ['code', change.changeType],
      commitId: change.commitId,
    });
  }

  /**
   * Collect a Genesis axiom
   */
  // Complexity: O(1)
  collectGenesisAxiom(axiom: {
    axiomId: string;
    name: string;
    type: string;
    statement: string;
    consequences: string[];
  }): string {
    const content = [
      `Axiom: ${axiom.name}`,
      `Type: ${axiom.type}`,
      `Statement: ${axiom.statement}`,
      `Consequences: ${axiom.consequences.join(', ')}`,
    ].join('\n');

    return this.collect(DataSourceType.GENESIS_AXIOM, content, {
      priority: 'high',
      tags: ['genesis', 'axiom', axiom.type.toLowerCase()],
      axiomId: axiom.axiomId,
    });
  }

  /**
   * Collect meditation insight
   */
  // Complexity: O(1)
  collectMeditationInsight(insight: {
    insightId: string;
    topic: string;
    conclusion: string;
    confidence: number;
    relatedQueries: string[];
  }): string {
    const content = [
      `Topic: ${insight.topic}`,
      `Insight: ${insight.conclusion}`,
      `Confidence: ${(insight.confidence * 100).toFixed(1)}%`,
      `Related: ${insight.relatedQueries.join(', ')}`,
    ].join('\n');

    return this.collect(DataSourceType.MEDITATION_INSIGHT, content, {
      priority: insight.confidence > 0.8 ? 'high' : 'normal',
      tags: ['meditation', 'insight'],
      insightId: insight.insightId,
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // VECTORIZATION & PERSISTENCE
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Flush queue - vectorize and persist
   */
  // Complexity: O(N) — linear scan
  async flush(): Promise<number> {
    if (this.fragmentQueue.length === 0) {
      return 0;
    }

    console.log(`🧲 [NEURAL_MAGNET] Flushing ${this.fragmentQueue.length} fragments...`);

    // Take current queue
    const fragments = [...this.fragmentQueue];
    this.fragmentQueue = [];

    try {
      // Vectorize batch
      const texts = fragments.map(f => f.content);
      const embeddings = await this.embedEngine.embedBatch(texts);

      // Create vectorized fragments
      const vectorized: VectorizedFragment[] = fragments.map((f, i) => ({
        ...f,
        embedding: embeddings[i],
        vectorId: `magnet-${f.id}`,
        persistedAt: new Date().toISOString(),
      }));

      // Persist to knowledge base
      for (const vf of vectorized) {
        this.store.setKnowledge(
          `fragments:${vf.source}`,
          vf.id,
          JSON.stringify({
            content: vf.content,
            metadata: vf.metadata,
            vectorId: vf.vectorId,
            persistedAt: vf.persistedAt,
          })
        );

        this.vectorizedCache.set(vf.id, vf);
      }

      // Update stats
      this.stats.fragmentsVectorized += vectorized.length;
      this.stats.fragmentsPersisted += vectorized.length;
      this.stats.lastFlush = new Date();
      this.stats.queueSize = this.fragmentQueue.length;

      this.emit('flushed', { count: vectorized.length, timestamp: new Date() });
      console.log(`🧲 [NEURAL_MAGNET] Flushed ${vectorized.length} fragments.`);

      return vectorized.length;

    } catch (error) {
      // Put fragments back in queue
      this.fragmentQueue = [...fragments, ...this.fragmentQueue];
      this.emit('error', { phase: 'flush', error });
      throw error;
    }
  }

  /**
   * Search collected fragments by semantic similarity
   */
  // Complexity: O(N log N) — sort
  async searchFragments(query: string, options?: {
    source?: DataSourceType;
    topK?: number;
    minScore?: number;
  }): Promise<Array<{
    fragment: DataFragment;
    score: number;
  }>> {
    // First, search in Pinecone via bridge
    // SAFETY: async operation — wrap in try-catch for production resilience
    const result = await this.bridgeSystem.query(query, {
      topK: options?.topK ?? 10,
      minScore: options?.minScore ?? 0.5,
    });

    // Also search local cache
    // SAFETY: async operation — wrap in try-catch for production resilience
    const queryEmbedding = await this.embedEngine.embed(query);
    const localResults: Array<{ fragment: DataFragment; score: number }> = [];

    for (const [id, vf] of this.vectorizedCache) {
      if (options?.source && vf.source !== options.source) continue;

      const score = this.cosineSimilarity(queryEmbedding, vf.embedding);
      if (score >= (options?.minScore ?? 0.5)) {
        localResults.push({ fragment: vf, score });
      }
    }

    // Sort by score
    localResults.sort((a, b) => b.score - a.score);

    return localResults.slice(0, options?.topK ?? 10);
  }

  /**
   * Get fragments by source type
   */
  // Complexity: O(N) — linear scan
  getFragmentsBySource(source: DataSourceType): DataFragment[] {
    return Array.from(this.vectorizedCache.values())
      .filter(f => f.source === source);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // UTILITY
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Calculate cosine similarity
   */
  // Complexity: O(N) — loop
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Get statistics
   */
  // Complexity: O(1)
  getStats(): MagnetStats {
    return { ...this.stats };
  }

  /**
   * Get queue size
   */
  // Complexity: O(1)
  getQueueSize(): number {
    return this.fragmentQueue.length;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// FACTORY
// ═══════════════════════════════════════════════════════════════════════════════

export function createNeuralCoreMagnet(bridgeSystem: BridgeSystem, config?: Partial<MagnetConfig>): NeuralCoreMagnet {
  return new NeuralCoreMagnet({
    bridgeSystem,
    ...config,
  });
}

export default NeuralCoreMagnet;
