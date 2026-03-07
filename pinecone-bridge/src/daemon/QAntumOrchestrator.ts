/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                              ║
 * ║           Q A N T U M   O R C H E S T R A T O R                               ║
 * ║        ЦЕНТРАЛНА ТОЧКА ЗА КООРДИНАЦИЯ НА ВСИЧКИ DAEMON МОДУЛИ                 ║
 * ║                                                                              ║
 * ║  "Едно ядро. Безкраен контекст. Вечна памет."                                ║
 * ║  "One core. Infinite context. Eternal memory."                               ║
 * ║                                                                              ║
 * ║  Purpose: Unified entry point for all QANTUM daemon capabilities:            ║
 * ║           - SupremeDaemon (orchestration)                                    ║
 * ║           - NeuralCoreMagnet (data collection)                               ║
 * ║           - AutonomousThought (AI decisions)                                 ║
 * ║           - SupremeMeditation (deep analysis)                                ║
 * ║           - GenesisBridgeAdapter (axiom/reality persistence)                 ║
 * ║                                                                              ║
 * ║  © 2025-2026 QAntum Empire | Dimitar Prodromov                               ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import { EventEmitter } from 'events';
import { randomUUID } from 'crypto';
import { BridgeSystem, BridgeSystemConfig } from '../index.js';
import { SupremeDaemon, awakenSupremeDaemon, DaemonConfig, DaemonState } from './SupremeDaemon.js';
import { NeuralCoreMagnet, createNeuralCoreMagnet, DataSourceType, MagnetConfig } from './NeuralCoreMagnet.js';
import { AutonomousThought, createAutonomousThought, ThoughtType, AutonomousThoughtConfig, Decision, DecisionOutcome } from './AutonomousThought.js';
import { SupremeMeditation, createSupremeMeditation, MeditationType, MeditationConfig } from './SupremeMeditation.js';
import { GenesisBridgeAdapter, createGenesisBridgeAdapter, GenesisBridgeConfig, AxiomType, Axiom } from './GenesisBridgeAdapter.js';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════════

export interface OrchestratorConfig {
  /** BridgeSystem config */
  bridgeConfig?: BridgeSystemConfig;
  
  /** Unique session identifier */
  sessionId?: string;
  
  /** Auto-start all daemons on creation */
  autoStart?: boolean;
  
  /** Enable verbose logging */
  debug?: boolean;
  
  /** Custom Daemon config */
  daemonConfig?: Partial<DaemonConfig>;
  
  /** Custom Magnet config */
  magnetConfig?: Partial<MagnetConfig>;
  
  /** Custom Thought config */
  thoughtConfig?: Partial<AutonomousThoughtConfig>;
  
  /** Custom Meditation config */
  meditationConfig?: Partial<MeditationConfig>;
  
  /** Custom Genesis config */
  genesisConfig?: Partial<GenesisBridgeConfig>;
}

export interface OrchestratorStatus {
  sessionId: string;
  state: 'dormant' | 'initializing' | 'active' | 'degraded' | 'terminating';
  uptime: number;
  modules: {
    bridge: 'active' | 'inactive' | 'error';
    daemon: 'active' | 'inactive' | 'error';
    magnet: 'active' | 'inactive' | 'error';
    thought: 'active' | 'inactive' | 'error';
    meditation: 'active' | 'inactive' | 'error';
    genesis: 'active' | 'inactive' | 'error';
  };
  metrics: {
    contextQueries: number;
    decisionsGenerated: number;
    meditationSessions: number;
    axiomsStored: number;
    realitiesStored: number;
    fragmentsCollected: number;
  };
}

export type QAntumEvent = 
  | 'started'
  | 'stopped'
  | 'error'
  | 'decision'
  | 'meditation'
  | 'axiomStored'
  | 'realityStored'
  | 'fragmentCollected'
  | 'contextRetrieved';

// ═══════════════════════════════════════════════════════════════════════════════
// QANTUM ORCHESTRATOR CLASS
// ═══════════════════════════════════════════════════════════════════════════════

export class QAntumOrchestrator extends EventEmitter {
  // Core systems
  private bridge: BridgeSystem;
  private daemon: SupremeDaemon | null = null;
  private magnet: NeuralCoreMagnet | null = null;
  private thought: AutonomousThought | null = null;
  private meditation: SupremeMeditation | null = null;
  private genesis: GenesisBridgeAdapter | null = null;
  
  // State
  private sessionId: string;
  private state: OrchestratorStatus['state'] = 'dormant';
  private startTime: number | null = null;
  private debug: boolean;
  
  // Config storage for lazy init
  private config: OrchestratorConfig;
  
  // Metrics
  private metrics = {
    contextQueries: 0,
    decisionsGenerated: 0,
    meditationSessions: 0,
    axiomsStored: 0,
    realitiesStored: 0,
    fragmentsCollected: 0,
  };
  
  constructor(bridge: BridgeSystem, config: OrchestratorConfig = {}) {
    super();
    this.bridge = bridge;
    this.config = config;
    this.sessionId = config.sessionId || `qantum-${randomUUID().slice(0, 8)}`;
    this.debug = config.debug ?? false;
    
    if (config.autoStart) {
      this.start().catch(console.error);
    }
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // LIFECYCLE
  // ═══════════════════════════════════════════════════════════════════════════
  
  /**
   * Start all daemon modules
   */
  async start(): Promise<void> {
    if (this.state !== 'dormant') {
      this.log('warn', 'Orchestrator already running');
      return;
    }
    
    this.state = 'initializing';
    this.startTime = Date.now();
    this.log('info', '⚡ QAntum Orchestrator initializing...');
    
    try {
      // Initialize bridge first
      await this.bridge.initialize();
      
      // Initialize all modules
      await this.initializeModules();
      
      // Wire up event listeners
      this.wireEventListeners();
      
      this.state = 'active';
      this.log('info', '✅ QAntum Orchestrator ACTIVE');
      this.emit('started', { sessionId: this.sessionId });
    } catch (error) {
      this.state = 'degraded';
      this.log('error', `Failed to start: ${error}`);
      this.emit('error', error);
      throw error;
    }
  }
  
  /**
   * Stop all daemon modules
   */
  async stop(): Promise<void> {
    if (this.state === 'dormant') return;
    
    this.state = 'terminating';
    this.log('info', '🔌 QAntum Orchestrator shutting down...');
    
    try {
      // Stop in reverse order
      if (this.genesis) {
        await this.genesis.stop();
        this.genesis = null;
      }
      
      if (this.magnet) {
        await this.magnet.stop();
        this.magnet = null;
      }
      
      if (this.daemon) {
        await this.daemon.terminate();
        this.daemon = null;
      }
      
      // Clear references
      this.thought = null;
      this.meditation = null;
      
      await this.bridge.close();
      
      this.state = 'dormant';
      this.startTime = null;
      this.log('info', '💤 QAntum Orchestrator dormant');
      this.emit('stopped');
    } catch (error) {
      this.log('error', `Error during shutdown: ${error}`);
      throw error;
    }
  }
  
  /**
   * Initialize all modules
   */
  private async initializeModules(): Promise<void> {
    const { config } = this;
    
    // 1. SupremeDaemon
    this.log('debug', 'Initializing SupremeDaemon...');
    this.daemon = await awakenSupremeDaemon(config.daemonConfig);
    
    // 2. NeuralCoreMagnet
    this.log('debug', 'Initializing NeuralCoreMagnet...');
    this.magnet = createNeuralCoreMagnet(this.bridge, config.magnetConfig);
    this.magnet.start();
    
    // 3. AutonomousThought
    this.log('debug', 'Initializing AutonomousThought...');
    this.thought = createAutonomousThought(this.bridge, config.thoughtConfig);
    
    // 4. SupremeMeditation
    this.log('debug', 'Initializing SupremeMeditation...');
    this.meditation = createSupremeMeditation(this.bridge, config.meditationConfig);
    
    // 5. GenesisBridgeAdapter
    this.log('debug', 'Initializing GenesisBridgeAdapter...');
    this.genesis = createGenesisBridgeAdapter(this.bridge, config.genesisConfig);
    this.genesis.start();
  }
  
  /**
   * Wire up event listeners for metrics
   */
  private wireEventListeners(): void {
    if (this.genesis) {
      this.genesis.on('axiomStored', (data: any) => {
        this.metrics.axiomsStored++;
        this.emit('axiomStored', data);
      });
      
      this.genesis.on('realityStored', (data: any) => {
        this.metrics.realitiesStored++;
        this.emit('realityStored', data);
      });
    }
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // CONTEXT RETRIEVAL (Unified Interface)
  // ═══════════════════════════════════════════════════════════════════════════
  
  /**
   * Query eternal context (unified interface)
   */
  async queryContext(
    query: string,
    options?: {
      topK?: number;
      minScore?: number;
      filter?: Record<string, any>;
    }
  ): Promise<{
    results: Array<{ content: string; score: number; metadata: any }>;
    totalRelevant: number;
    queryTime: number;
  }> {
    const start = Date.now();
    this.metrics.contextQueries++;
    
    const result = await this.bridge.query(query, {
      topK: options?.topK ?? 10,
      minScore: options?.minScore ?? 0.5,
      filter: options?.filter,
      sessionId: this.sessionId,
    });
    
    this.emit('contextRetrieved', { query, resultCount: result.matches.length });
    
    return {
      results: result.matches.map((m: any) => ({
        content: m.content,
        score: m.score,
        metadata: m.metadata,
      })),
      totalRelevant: result.matches.length,
      queryTime: Date.now() - start,
    };
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // DECISION MAKING (Unified Interface)
  // ═══════════════════════════════════════════════════════════════════════════
  
  /**
   * Make an AI decision with full context
   */
  async makeDecision(
    question: string,
    type?: ThoughtType,
    options?: { depth?: number; storePrecedent?: boolean }
  ): Promise<{
    decision: Decision;
    reasoning: string[];
    confidence: number;
    alternatives: string[];
    historicalContext: string[];
  }> {
    if (!this.thought) {
      throw new Error('AutonomousThought not initialized. Call start() first.');
    }
    
    const result = await this.thought.think(question, type || ThoughtType.TACTICAL, {
      depth: options?.depth ?? 3,
    });
    
    this.metrics.decisionsGenerated++;
    this.emit('decision', { question, type, confidence: result.confidence });
    
    return {
      decision: result.decision,
      reasoning: result.reasoning.steps.map((s: any) => s.description),
      confidence: result.confidence,
      alternatives: result.reasoning.alternativesConsidered,
      historicalContext: result.context.historicalPrecedents.map((p: any) => p.situation),
    };
  }
  
  /**
   * Quick decision without deep analysis
   */
  async quickDecision(question: string): Promise<{
    answer: string;
    confidence: number;
  }> {
    if (!this.thought) {
      throw new Error('AutonomousThought not initialized. Call start() first.');
    }
    
    const result = await this.thought.quickDecision(question);
    this.metrics.decisionsGenerated++;
    
    return {
      answer: result.action,
      confidence: result.outcome === DecisionOutcome.EXECUTE ? 0.8 : 0.5,
    };
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // MEDITATION (Unified Interface)
  // ═══════════════════════════════════════════════════════════════════════════
  
  /**
   * Deep meditation on a topic
   */
  async meditate(
    topic: string,
    type?: MeditationType,
    options?: { depth?: number }
  ): Promise<{
    patterns: Array<{ name: string; description: string }>;
    anomalies: Array<{ description: string; severity: string }>;
    insights: Array<{ title: string; description: string; actionable: boolean }>;
    recommendations: Array<{ action: string; rationale: string; priority: string }>;
    metaInsight?: { title: string; confidence: number };
  }> {
    if (!this.meditation) {
      throw new Error('SupremeMeditation not initialized. Call start() first.');
    }
    
    const result = await this.meditation.meditate(
      topic,
      type || MeditationType.KNOWLEDGE_SYNTHESIS,
      options
    );
    
    this.metrics.meditationSessions++;
    this.emit('meditation', { topic, type, insightCount: result.insights.length });
    
    return {
      patterns: result.patterns.map((p: any) => ({ name: p.name, description: p.description })),
      anomalies: result.anomalies.map((a: any) => ({ 
        description: a.description,
        severity: a.severity,
      })),
      insights: result.insights.map((i: any) => ({
        title: i.title,
        description: i.description,
        actionable: i.actionable,
      })),
      recommendations: result.recommendations.map((r: any) => ({
        action: r.action,
        rationale: r.rationale,
        priority: r.priority,
      })),
      metaInsight: result.metaInsight ? {
        title: result.metaInsight.title,
        confidence: result.metaInsight.confidence,
      } : undefined,
    };
  }
  
  /**
   * Quick pattern scan
   */
  async scanPatterns(topic: string): Promise<Array<{
    name: string;
    description: string;
    frequency: number;
  }>> {
    if (!this.meditation) {
      throw new Error('SupremeMeditation not initialized. Call start() first.');
    }
    
    const patterns = await this.meditation.scanPatterns(topic);
    return patterns.map((p: any) => ({
      name: p.name,
      description: p.description,
      frequency: p.frequency,
    }));
  }
  
  /**
   * System health check
   */
  async systemHealthCheck(): Promise<{
    healthy: boolean;
    issues: string[];
    score: number;
  }> {
    if (!this.meditation) {
      throw new Error('SupremeMeditation not initialized. Call start() first.');
    }
    
    const result = await this.meditation.systemHealthCheck();
    
    return {
      healthy: result.anomalies.length === 0,
      issues: result.anomalies.map((a: any) => a.description),
      score: Math.max(0, 1 - (result.anomalies.length * 0.1)),
    };
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // DATA COLLECTION (Unified Interface)
  // ═══════════════════════════════════════════════════════════════════════════
  
  /**
   * Collect data fragment for eternal storage
   */
  collect(
    type: DataSourceType,
    content: string,
    metadata?: Record<string, any>
  ): string {
    if (!this.magnet) {
      throw new Error('NeuralCoreMagnet not initialized. Call start() first.');
    }
    
    const id = this.magnet.collect(type, content, metadata);
    this.metrics.fragmentsCollected++;
    this.emit('fragmentCollected', { type, id });
    return id;
  }
  
  /**
   * Flush pending fragments to Pinecone
   */
  async flush(): Promise<void> {
    if (this.magnet) {
      await this.magnet.flush();
    }
    if (this.genesis) {
      await this.genesis.flush();
    }
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GENESIS (Unified Interface)
  // ═══════════════════════════════════════════════════════════════════════════
  
  /**
   * Store an axiom
   */
  async storeAxiom(axiom: Axiom): Promise<string> {
    if (!this.genesis) {
      throw new Error('GenesisBridgeAdapter not initialized. Call start() first.');
    }
    return this.genesis.storeAxiom(axiom);
  }
  
  /**
   * Store a generated reality
   */
  async storeReality(reality: Parameters<GenesisBridgeAdapter['storeReality']>[0]): Promise<void> {
    if (!this.genesis) {
      throw new Error('GenesisBridgeAdapter not initialized. Call start() first.');
    }
    return this.genesis.storeReality(reality);
  }
  
  /**
   * Get context for axiom generation
   */
  async getAxiomGenerationContext(
    type: AxiomType,
    statement?: string
  ): ReturnType<GenesisBridgeAdapter['getAxiomGenerationContext']> {
    if (!this.genesis) {
      throw new Error('GenesisBridgeAdapter not initialized. Call start() first.');
    }
    return this.genesis.getAxiomGenerationContext(type, statement);
  }
  
  /**
   * Analyze axiom before generation
   */
  async analyzeAxiomBeforeGeneration(
    proposedAxiom: Parameters<GenesisBridgeAdapter['analyzeAxiomBeforeGeneration']>[0]
  ): ReturnType<GenesisBridgeAdapter['analyzeAxiomBeforeGeneration']> {
    if (!this.genesis) {
      throw new Error('GenesisBridgeAdapter not initialized. Call start() first.');
    }
    return this.genesis.analyzeAxiomBeforeGeneration(proposedAxiom);
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // STATUS & METRICS
  // ═══════════════════════════════════════════════════════════════════════════
  
  /**
   * Get orchestrator status
   */
  getStatus(): OrchestratorStatus {
    return {
      sessionId: this.sessionId,
      state: this.state,
      uptime: this.startTime ? Date.now() - this.startTime : 0,
      modules: {
        bridge: 'active', // Bridge is always active once created
        daemon: this.daemon ? 'active' : 'inactive',
        magnet: this.magnet ? 'active' : 'inactive',
        thought: this.thought ? 'active' : 'inactive',
        meditation: this.meditation ? 'active' : 'inactive',
        genesis: this.genesis ? 'active' : 'inactive',
      },
      metrics: { ...this.metrics },
    };
  }
  
  /**
   * Get the underlying Bridge System
   */
  getBridge(): BridgeSystem {
    return this.bridge;
  }
  
  /**
   * Get the Daemon instance
   */
  getDaemon(): SupremeDaemon | null {
    return this.daemon;
  }
  
  /**
   * Get session ID
   */
  getSessionId(): string {
    return this.sessionId;
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // UTILITY
  // ═══════════════════════════════════════════════════════════════════════════
  
  private log(level: 'debug' | 'info' | 'warn' | 'error', message: string): void {
    if (!this.debug && level === 'debug') return;
    
    const prefix = `[QANTUM:${this.sessionId.slice(-4)}]`;
    switch (level) {
      case 'debug': console.debug(`${prefix} ${message}`); break;
      case 'info': console.log(`${prefix} ${message}`); break;
      case 'warn': console.warn(`${prefix} ⚠️ ${message}`); break;
      case 'error': console.error(`${prefix} ❌ ${message}`); break;
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// FACTORY & SINGLETON
// ═══════════════════════════════════════════════════════════════════════════════

let globalOrchestrator: QAntumOrchestrator | null = null;

/**
 * Create a new QAntum Orchestrator instance
 */
export function createQAntumOrchestrator(
  bridge: BridgeSystem, 
  config?: OrchestratorConfig
): QAntumOrchestrator {
  return new QAntumOrchestrator(bridge, config);
}

/**
 * Get or create the global QAntum Orchestrator singleton
 */
export function getQAntumOrchestrator(
  bridge?: BridgeSystem,
  config?: OrchestratorConfig
): QAntumOrchestrator {
  if (!globalOrchestrator && !bridge) {
    throw new Error('Must provide BridgeSystem on first call to getQAntumOrchestrator');
  }
  
  if (!globalOrchestrator && bridge) {
    globalOrchestrator = createQAntumOrchestrator(bridge, config);
  }
  
  return globalOrchestrator!;
}

/**
 * Reset the global orchestrator (for testing)
 */
export async function resetGlobalOrchestrator(): Promise<void> {
  if (globalOrchestrator) {
    await globalOrchestrator.stop();
    globalOrchestrator = null;
  }
}

export default QAntumOrchestrator;
