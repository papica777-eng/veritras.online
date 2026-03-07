/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                               ║
 * ║   @QANTUM/PINECONE-BRIDGE                                                     ║
 * ║   "52,573+ Vectors. Eternal Context. Zero Memory Loss."                       ║
 * ║                                                                               ║
 * ║   © 2025-2026 QAntum Empire | Dimitar Prodromov                               ║
 * ║                                                                               ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 * 
 * USAGE:
 * 
 * ```typescript
 * import { 
 *   PineconeContextBridge, 
 *   PersistentContextStore, 
 *   EmbeddingEngine,
 *   startServer,
 * } from '@qantum/pinecone-bridge';
 * 
 * // Initialize
 * const bridge = new PineconeContextBridge();
 * const store = new PersistentContextStore();
 * const embed = new EmbeddingEngine();
 * 
 * // Connect and query
 * await bridge.connect();
 * await embed.load();
 * 
 * const results = await bridge.queryByText(
 *   "Ghost Protocol logic",
 *   async (text) => await embed.embed(text)
 * );
 * 
 * // Start HTTP server
 * await startServer();
 * ```
 */

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export {
  PineconeContextBridge,
  type BridgeConfig,
  type BridgeConfig as PineconeConfig,
  type QueryResult,
  type VectorMatch,
  type SessionContext,
  type BridgeStats,
} from './PineconeContextBridge.js';

export {
  PersistentContextStore,
  type StoreConfig,
  type StoredSession,
  type StoredQuery,
  type StoredMessage,
  type StoredKnowledge,
  type StoreStats,
  type ConversationMessage,
} from './PersistentContextStore.js';

export {
  EmbeddingEngine,
  createEmbedFunction,
  getEmbeddingEngine,
  type EmbeddingConfig,
  type EmbeddingEngineConfig,
  type EmbedFunction,
  type EmbeddingResult,
} from './EmbeddingEngine.js';

// Server exports are excluded from compilation - import directly if needed
// export { startServer, createBridgeRouter, type ServerConfig } from './server.js';

// ═══════════════════════════════════════════════════════════════════════════════
// DAEMON MODULES - Autonomous Intelligence Components
// ═══════════════════════════════════════════════════════════════════════════════

export {
  // Supreme Daemon
  SupremeDaemon,
  awakenSupremeDaemon,
  DaemonState,
  SubDaemonType,
  type SubDaemon,
  type DaemonConfig,
  type DaemonMetrics,
  type ContextualDecision,
  // Neural Core Magnet
  NeuralCoreMagnet,
  createNeuralCoreMagnet,
  DataSourceType,
  type DataFragment,
  type MagnetConfig,
  type MagnetStats,
  type VectorizedFragment,
  // Autonomous Thought
  AutonomousThought,
  createAutonomousThought,
  ThoughtType,
  DecisionOutcome,
  type ThoughtContext,
  type HistoricalPrecedent,
  type Thought,
  type ReasoningChain,
  type ReasoningStep,
  type Decision,
  type AutonomousThoughtConfig,
  type ThoughtMetrics,
  // Supreme Meditation
  SupremeMeditation,
  createSupremeMeditation,
  MeditationType,
  InsightSeverity,
  type MeditationSession,
  type Pattern,
  type Anomaly,
  type Correlation,
  type Insight,
  type MetaInsight,
  type Recommendation,
  type MeditationConfig,
  type MeditationMetrics,
  // Genesis Bridge Adapter
  GenesisBridgeAdapter,
  createGenesisBridgeAdapter,
  AxiomType,
  type Axiom,
  type AxiomSystem,
  type GeneratedReality,
  type AxiomGenerationContext,
  type RealityEvaluation,
  type GenesisBridgeConfig,
  // QAntum Orchestrator
  QAntumOrchestrator,
  createQAntumOrchestrator,
  getQAntumOrchestrator,
  resetGlobalOrchestrator,
  type OrchestratorConfig,
  type OrchestratorStatus,
  type QAntumEvent,
} from './daemon/index.js';

// ═══════════════════════════════════════════════════════════════════════════════
// CONVENIENCE FACTORY
// ═══════════════════════════════════════════════════════════════════════════════

import { PineconeContextBridge, BridgeConfig, QueryResult } from './PineconeContextBridge.js';
import { PersistentContextStore, StoreConfig } from './PersistentContextStore.js';
import { EmbeddingEngine, EmbeddingConfig, createEmbedFunction } from './EmbeddingEngine.js';

export interface BridgeSystemConfig {
  pinecone?: Partial<BridgeConfig>;
  store?: Partial<StoreConfig>;
  embedding?: Partial<EmbeddingConfig>;
  autoConnect?: boolean;
  autoLoad?: boolean;
}

/**
 * Complete Bridge System - All components in one.
 * 
 * @example
 * const system = await createBridgeSystem({ autoConnect: true, autoLoad: true });
 * const results = await system.query("authentication flow");
 */
export class BridgeSystem {
  public readonly bridge: PineconeContextBridge;
  public readonly store: PersistentContextStore;
  public readonly embed: EmbeddingEngine;
  
  private isInitialized = false;
  
  constructor(config: BridgeSystemConfig = {}) {
    this.bridge = new PineconeContextBridge(config.pinecone);
    this.store = new PersistentContextStore(config.store?.dbPath);
    this.embed = new EmbeddingEngine(config.embedding);
  }
  
  /**
   * Initialize all components.
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    await Promise.all([
      this.bridge.connect(),
      this.embed.load(),
    ]);
    
    this.isInitialized = true;
    console.log('🧠 BridgeSystem initialized. Ready to query 52K+ vectors.');
  }
  
  /**
   * Query the vector database with natural language.
   */
  async query(
    text: string,
    options?: {
      topK?: number;
      minScore?: number;
      filter?: Record<string, any>;
      sessionId?: string;
    }
  ): Promise<QueryResult> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    const embedFn = createEmbedFunction(this.embed);
    const result = await this.bridge.queryByText(text, embedFn, options);
    
    // Persist query
    const sessionId = options?.sessionId || 'default';
    this.store.saveQuery(sessionId, text, result.matches, result.queryTimeMs);
    
    return result;
  }
  
  /**
   * Search code by description.
   */
  async searchCode(
    description: string,
    options?: {
      project?: string;
      filePattern?: string;
      topK?: number;
    }
  ): Promise<QueryResult> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    const embedFn = createEmbedFunction(this.embed);
    return this.bridge.searchCode(description, embedFn, options);
  }
  
  /**
   * Find code similar to a given snippet.
   */
  async findSimilar(
    codeSnippet: string,
    options?: { topK?: number; minScore?: number }
  ): Promise<QueryResult> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    const embedFn = createEmbedFunction(this.embed);
    return this.bridge.findSimilarCode(codeSnippet, embedFn, options);
  }
  
  /**
   * Get system status.
   */
  getStatus(): {
    initialized: boolean;
    bridge: ReturnType<PineconeContextBridge['getStats']>;
    store: ReturnType<PersistentContextStore['getStats']>;
  } {
    return {
      initialized: this.isInitialized,
      bridge: this.bridge.getStats(),
      store: this.store.getStats(),
    };
  }
  
  /**
   * Create or restore a session.
   */
  createSession(name: string): string {
    const session = this.bridge.createSession();
    this.store.saveSession({
      ...session,
      name,
      metadata: {},
    });
    return session.sessionId;
  }
  
  /**
   * Close all connections.
   */
  async close(): Promise<void> {
    // Store doesn't need explicit close (SQLite handles it)
    // Pinecone client doesn't need explicit close
    this.isInitialized = false;
    console.log('🧠 BridgeSystem closed.');
  }
}

/**
 * Factory function to create and optionally initialize a BridgeSystem.
 */
export async function createBridgeSystem(
  config: BridgeSystemConfig = {}
): Promise<BridgeSystem> {
  const system = new BridgeSystem(config);
  
  if (config.autoConnect || config.autoLoad) {
    await system.initialize();
  }
  
  return system;
}

// ═══════════════════════════════════════════════════════════════════════════════
// DEFAULT EXPORT
// ═══════════════════════════════════════════════════════════════════════════════

export default {
  BridgeSystem,
  createBridgeSystem,
  PineconeContextBridge,
  PersistentContextStore,
  EmbeddingEngine,
  createEmbedFunction,
};
