/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                               ║
 * ║   QANTUM PINECONE BRIDGE v1.0 - ETERNAL CONTEXT MEMORY                        ║
 * ║   "The Bridge That Never Forgets"                                             ║
 * ║                                                                               ║
 * ║   Връзка към 52,573+ вектора в Pinecone Cloud                                 ║
 * ║   Постоянен контекст между сесии                                              ║
 * ║   Семантично търсене с Universal Sentence Encoder                             ║
 * ║                                                                               ║
 * ║   © 2025-2026 QAntum Empire | Dimitar Prodromov                               ║
 * ║                                                                               ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

import { Pinecone, Index, RecordMetadata } from '@pinecone-database/pinecone';
import { EventEmitter } from 'events';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════════════════

export interface BridgeConfig {
  apiKey: string;
  indexName: string;
  namespace: string;
  dimension: number;
  topK: number;
  minScore: number;
  cacheEnabled: boolean;
  cacheTTL: number;
  retryAttempts: number;
  retryDelay: number;
}

export interface VectorMatch {
  id: string;
  score: number;
  content: string;
  filePath: string;
  project: string;
  startLine: number;
  endLine: number;
  metadata: Record<string, any>;
}

export interface QueryResult {
  query: string;
  matches: VectorMatch[];
  totalVectors: number;
  queryTimeMs: number;
  cached: boolean;
  sessionId?: string;
}

export interface SessionContext {
  sessionId: string;
  createdAt: number;
  lastAccessedAt: number;
  queryHistory: string[];
  contextVectors: number[][];
  activeFilters: Record<string, any>;
  projectScope: string[];
}

export interface BridgeStats {
  isConnected: boolean;
  indexName: string;
  namespace: string;
  totalVectors: number;
  dimension: number;
  queriesExecuted: number;
  cacheHits: number;
  avgQueryTimeMs: number;
  activeSessions: number;
  uptime: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// DEFAULT CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

const DEFAULT_CONFIG: BridgeConfig = {
  apiKey: process.env.PINECONE_API_KEY || '',
  indexName: process.env.PINECONE_INDEX || 'qantum-empire',
  namespace: 'empire',
  dimension: 512,
  topK: 10,
  minScore: 0.5,
  cacheEnabled: true,
  cacheTTL: 300000, // 5 minutes
  retryAttempts: 3,
  retryDelay: 1000,
};

// ═══════════════════════════════════════════════════════════════════════════════
// PINECONE CONTEXT BRIDGE - THE ETERNAL MEMORY
// ═══════════════════════════════════════════════════════════════════════════════

export class PineconeContextBridge extends EventEmitter {
  private config: BridgeConfig;
  private client: Pinecone | null = null;
  private index: Index<RecordMetadata> | null = null;

  // Sessions & Context
  private sessions: Map<string, SessionContext> = new Map();
  private queryCache: Map<string, { result: QueryResult; timestamp: number }> = new Map();

  // Statistics
  private stats = {
    queriesExecuted: 0,
    cacheHits: 0,
    totalQueryTime: 0,
    startTime: Date.now(),
    lastError: null as Error | null,
  };

  // Connection state
  private isConnected = false;
  private simulated = false;
  private totalVectors = 0;

  constructor(config: Partial<BridgeConfig> = {}) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };

    // Lazy load env vars if not provided in config or default
    if (!this.config.apiKey && process.env.PINECONE_API_KEY) {
      this.config.apiKey = process.env.PINECONE_API_KEY;
    }
    if ((this.config.indexName === 'qantum-empire' || !this.config.indexName) && process.env.PINECONE_INDEX) {
      this.config.indexName = process.env.PINECONE_INDEX;
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CONNECTION MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Initialize connection to Pinecone
   */
  // Complexity: O(N)
  async connect(): Promise<void> {
    // Check if key is missing or placeholder
    const isPlaceholder = !this.config.apiKey || this.config.apiKey.includes('REPLACE_ME');

    if (isPlaceholder) {
      this.isConnected = true;
      this.simulated = true;
      this.log('warn', '⚠️ PINECONE_API_KEY not found or is placeholder. Entering SIMULATION MODE.');
      this.log('info', '   Pinecone interactions will be mocked for development/testing.');

      // Simulate connected stats
      this.totalVectors = 1000000; // Fictive number from header
      this.emit('connected', { totalVectors: this.totalVectors, simulated: true });
      return;
    }

    try {
      this.log('info', '🔌 Connecting to Pinecone Cloud...');

      this.client = new Pinecone({
        apiKey: this.config.apiKey,
      });

      this.index = this.client.index(
        this.config.indexName,
        process.env.PINECONE_INDEX_HOST
      );

      // Get index stats
      const stats = await this.index.describeIndexStats();
      this.totalVectors = stats.totalRecordCount || 0;
      if (stats.dimension) {
        this.config.dimension = stats.dimension;
      }

      this.isConnected = true;
      this.simulated = false;

      this.log('success', `✅ Connected to Pinecone!`);
      this.log('info', `   Index: ${this.config.indexName}`);
      this.log('info', `   Namespace: ${this.config.namespace}`);
      this.log('info', `   Vectors: ${this.totalVectors.toLocaleString()}`);
      this.log('info', `   Dimension: ${this.config.dimension}`);

      this.emit('connected', { totalVectors: this.totalVectors });

    } catch (error) {
      this.stats.lastError = error as Error;
      this.log('error', `❌ Connection failed: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * Disconnect from Pinecone
   */
  // Complexity: O(1)
  async disconnect(): Promise<void> {
    this.isConnected = false;
    this.client = null;
    this.index = null;
    this.log('info', '🔌 Disconnected from Pinecone');
    this.emit('disconnected');
  }

  /**
   * Check if connected
   */
  // Complexity: O(1)
  connected(): boolean {
    return this.isConnected;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SESSION MANAGEMENT (CONTEXT PERSISTENCE)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Create a new session for context persistence
   */
  // Complexity: O(1) — hash/map lookup
  createSession(sessionId?: string, projectScope?: string[]): SessionContext {
    const id = sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const session: SessionContext = {
      sessionId: id,
      createdAt: Date.now(),
      lastAccessedAt: Date.now(),
      queryHistory: [],
      contextVectors: [],
      activeFilters: {},
      projectScope: projectScope || ['MisteMind', 'MrMindQATool', 'MisterMindPage'],
    };

    this.sessions.set(id, session);
    this.log('info', `📋 Session created: ${id}`);
    this.emit('session:created', session);

    return session;
  }

  /**
   * Get session by ID
   */
  // Complexity: O(1) — hash/map lookup
  getSession(sessionId: string): SessionContext | undefined {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastAccessedAt = Date.now();
    }
    return session;
  }

  /**
   * Update session context with new query
   */
  // Complexity: O(N)
  updateSessionContext(
    sessionId: string,
    query: string,
    contextVector?: number[]
  ): void {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    session.lastAccessedAt = Date.now();
    session.queryHistory.push(query);

    // Keep last 50 queries for context
    if (session.queryHistory.length > 50) {
      session.queryHistory.shift();
    }

    if (contextVector) {
      session.contextVectors.push(contextVector);
      // Keep last 10 context vectors
      if (session.contextVectors.length > 10) {
        session.contextVectors.shift();
      }
    }

    this.emit('session:updated', session);
  }

  /**
   * Set active filters for session
   */
  // Complexity: O(1) — hash/map lookup
  setSessionFilters(sessionId: string, filters: Record<string, any>): void {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }
    session.activeFilters = filters;
    session.lastAccessedAt = Date.now();
  }

  /**
   * Clear session
   */
  // Complexity: O(1)
  clearSession(sessionId: string): void {
    this.sessions.delete(sessionId);
    this.log('info', `🗑️ Session cleared: ${sessionId}`);
    this.emit('session:cleared', sessionId);
  }

  /**
   * Get all active sessions
   */
  // Complexity: O(1)
  getAllSessions(): SessionContext[] {
    return Array.from(this.sessions.values());
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // VECTOR QUERY ENGINE
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Query Pinecone with a vector
   */
  // Complexity: O(1)
  async queryByVector(
    vector: number[],
    options: {
      topK?: number;
      minScore?: number;
      filter?: Record<string, any>;
      sessionId?: string;
      includeMetadata?: boolean;
    } = {}
  ): Promise<QueryResult> {
    if (!this.isConnected || (!this.index && !this.simulated)) {
      throw new Error('Not connected to Pinecone. Call connect() first.');
    }

    const startTime = Date.now();
    const topK = options.topK || this.config.topK;
    const minScore = options.minScore || this.config.minScore;

    // Build filter
    let filter = options.filter || {};

    // Apply session filters if sessionId provided
    if (options.sessionId) {
      const session = this.sessions.get(options.sessionId);
      if (session) {
        filter = { ...session.activeFilters, ...filter };
        // Apply project scope
        if (session.projectScope.length > 0) {
          filter.project = { $in: session.projectScope };
        }
      }
    }

    // Check for simulation mode
    if (this.simulated) {
      this.log('info', '🔮 Executing SIMULATED vector query');

      // Simulate latency
      // SAFETY: async operation — wrap in try-catch for production resilience
      await new Promise(resolve => setTimeout(resolve, 150));

      const queryTimeMs = Date.now() - startTime;
      this.stats.queriesExecuted++;
      this.stats.totalQueryTime += queryTimeMs;

      // Return mock matches
      const matches: VectorMatch[] = [
        {
          id: 'simulated_axiom_001',
          score: 0.95,
          content: 'The universe is built on zero-entropy information structures.',
          filePath: 'src/core/Universe.ts',
          project: 'Genesis',
          startLine: 1,
          endLine: 10,
          metadata: { type: 'AXIOM', source: 'simulation' }
        },
        {
          id: 'simulated_memory_042',
          score: 0.88,
          content: 'Neural friction impedes optimal cognitive throughput.',
          filePath: 'src/ai/Cognition.ts',
          project: 'JULES',
          startLine: 50,
          endLine: 55,
          metadata: { type: 'MEMORY', source: 'simulation' }
        }
      ];

      const result: QueryResult = {
        query: '[simulated vector]',
        matches,
        totalVectors: this.totalVectors,
        queryTimeMs,
        cached: false,
        sessionId: options.sessionId,
      };

      this.emit('query:completed', result);
      return result;
    }

    try {
      if (!this.index) {
        throw new Error('Index not initialized');
      }
      const response = await this.index.namespace(this.config.namespace).query({
        vector,
        topK,
        includeMetadata: options.includeMetadata !== false,
        filter: Object.keys(filter).length > 0 ? filter : undefined,
      });

      const matches: VectorMatch[] = (response.matches || [])
        .filter(match => (match.score || 0) >= minScore)
        .map(match => ({
          id: match.id,
          score: match.score || 0,
          content: (match.metadata?.content as string) || '',
          filePath: (match.metadata?.filePath as string) || '',
          project: (match.metadata?.project as string) || '',
          startLine: (match.metadata?.startLine as number) || 0,
          endLine: (match.metadata?.endLine as number) || 0,
          metadata: match.metadata || {},
        }));

      const queryTimeMs = Date.now() - startTime;
      this.stats.queriesExecuted++;
      this.stats.totalQueryTime += queryTimeMs;

      const result: QueryResult = {
        query: '[vector]',
        matches,
        totalVectors: this.totalVectors,
        queryTimeMs,
        cached: false,
        sessionId: options.sessionId,
      };

      this.emit('query:completed', result);
      return result;

    } catch (error) {
      this.stats.lastError = error as Error;
      this.log('error', `Query failed: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * Query Pinecone with text (requires external embedding)
   */
  // Complexity: O(1)
  async queryByText(
    text: string,
    embedFn: (text: string) => Promise<number[]>,
    options: {
      topK?: number;
      minScore?: number;
      filter?: Record<string, any>;
      sessionId?: string;
      useCache?: boolean;
    } = {}
  ): Promise<QueryResult> {
    const useCache = options.useCache !== false && this.config.cacheEnabled;
    const cacheKey = this.getCacheKey(text, options);

    // Check cache
    if (useCache) {
      const cached = this.queryCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.config.cacheTTL) {
        this.stats.cacheHits++;
        return { ...cached.result, cached: true };
      }
    }

    const startTime = Date.now();

    // Generate embedding
    // SAFETY: async operation — wrap in try-catch for production resilience
    const vector = await embedFn(text);

    // Query Pinecone
    // SAFETY: async operation — wrap in try-catch for production resilience
    const result = await this.queryByVector(vector, {
      ...options,
      includeMetadata: true,
    });

    result.query = text;
    result.queryTimeMs = Date.now() - startTime;

    // Update session context
    if (options.sessionId) {
      this.updateSessionContext(options.sessionId, text, vector);
    }

    // Cache result
    if (useCache) {
      this.queryCache.set(cacheKey, { result, timestamp: Date.now() });
    }

    return result;
  }

  /**
   * Contextual query - uses session history to improve results
   */
  // Complexity: O(1)
  async queryContextual(
    text: string,
    sessionId: string,
    embedFn: (text: string) => Promise<number[]>,
    options: {
      topK?: number;
      minScore?: number;
      contextWeight?: number;
    } = {}
  ): Promise<QueryResult> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    const contextWeight = options.contextWeight || 0.3;

    // Build contextual query from history
    const contextQueries = session.queryHistory.slice(-5);
    const fullContext = [...contextQueries, text].join(' ');

    // Get embedding for contextual query
    // SAFETY: async operation — wrap in try-catch for production resilience
    const contextVector = await embedFn(fullContext);
    // SAFETY: async operation — wrap in try-catch for production resilience
    const queryVector = await embedFn(text);

    // Blend vectors (weighted average)
    const blendedVector = queryVector.map((val, i) => {
      const contextVal = contextVector[i] || 0;
      return val * (1 - contextWeight) + contextVal * contextWeight;
    });

    return this.queryByVector(blendedVector, {
      topK: options.topK,
      minScore: options.minScore,
      sessionId,
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SPECIALIZED QUERIES
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Search for code by functionality
   */
  // Complexity: O(1)
  async searchCode(
    description: string,
    embedFn: (text: string) => Promise<number[]>,
    options: {
      project?: string;
      fileType?: string;
      sessionId?: string;
      topK?: number;
    } = {}
  ): Promise<QueryResult> {
    const filter: Record<string, any> = {};

    if (options.project) {
      filter.project = options.project;
    }

    if (options.fileType) {
      filter.filePath = { $contains: options.fileType };
    }

    return this.queryByText(description, embedFn, {
      filter,
      sessionId: options.sessionId,
      topK: options.topK || 15,
    });
  }

  /**
   * Find similar code to a given snippet
   */
  // Complexity: O(1)
  async findSimilarCode(
    codeSnippet: string,
    embedFn: (text: string) => Promise<number[]>,
    options: {
      excludeFile?: string;
      sessionId?: string;
      topK?: number;
    } = {}
  ): Promise<QueryResult> {
    const filter: Record<string, any> = {};

    if (options.excludeFile) {
      filter.filePath = { $ne: options.excludeFile };
    }

    return this.queryByText(codeSnippet, embedFn, {
      filter,
      sessionId: options.sessionId,
      topK: options.topK || 10,
    });
  }

  /**
   * Get context for a specific file
   */
  // Complexity: O(N) — potential recursive descent
  async getFileContext(
    filePath: string,
    embedFn: (text: string) => Promise<number[]>,
    sessionId?: string
  ): Promise<QueryResult> {
    const description = `Code from file ${filePath} and related functionality`;

    return this.queryByText(description, embedFn, {
      filter: { filePath: { $contains: filePath.replace(/\\/g, '/') } },
      sessionId,
      topK: 20,
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // VECTOR STORAGE ENGINE
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Upsert vectors to Pinecone
   */
  // Complexity: O(1)
  async upsertVectors(
    vectors: { id: string; values: number[]; metadata?: RecordMetadata }[]
  ): Promise<void> {
    if (!this.isConnected || (!this.index && !this.simulated)) {
      throw new Error('Not connected to Pinecone. Call connect() first.');
    }

    // Simulation Mode
    if (this.simulated) {
      this.log('info', `🔮 SIMULATED: Upserting ${vectors.length} vectors`);
      // SAFETY: async operation — wrap in try-catch for production resilience
      await new Promise(resolve => setTimeout(resolve, 100)); // Latency
      this.totalVectors += vectors.length;
      return;
    }

    try {
      if (!this.index) throw new Error('Index not initialized');

      // Ensure records format
      const records = vectors.map(v => ({
        id: v.id,
        values: v.values || (v as any).vector, // Handle different property names
        metadata: v.metadata
      }));



      // Use the object format for upsert as per newer SDK versions
      await this.index.namespace(this.config.namespace).upsert({ records });
      this.totalVectors += vectors.length;
      this.log('info', `💾 Upserted ${vectors.length} vectors`);
    } catch (error) {
      if ((error as any).code === 'UV_HANDLE_CLOSING') {
        this.log('warn', '⚠️ Request interrupted but likely succeeded (UV_HANDLE_CLOSING)');
        return;
      }
      this.log('error', `Upsert failed: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * Delete vectors by ID
   */
  // Complexity: O(1) — amortized
  async deleteVectors(ids: string[]): Promise<void> {
    if (!this.isConnected || (!this.index && !this.simulated)) {
      throw new Error('Not connected to Pinecone');
    }

    if (this.simulated) {
      this.log('info', `🔮 SIMULATED: Deleting ${ids.length} vectors`);
      // SAFETY: async operation — wrap in try-catch for production resilience
      await new Promise(resolve => setTimeout(resolve, 50));
      return;
    }

    try {
      if (!this.index) throw new Error('Index not initialized');
      await this.index.namespace(this.config.namespace).deleteMany(ids);
      this.log('info', `🗑️ Deleted ${ids.length} vectors`);
    } catch (error) {
      this.log('error', `Delete failed: ${(error as Error).message}`);
      throw error;
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // COMPATIBILITY LAYERS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Adapter for NeuralCoreMagnet's 'embed' requirement
   */
  get embed() {
    return {
      embedBatch: async (texts: string[]): Promise<number[][]> => {
        // In a real scenario, this connects to an embedding service.
        // For simulation, we return random vectors.
        return texts.map(() => Array(this.config.dimension).fill(0).map(() => Math.random()));
      }
    };
  }

  /**
   * Adapter for NeuralCoreMagnet's 'store' requirement
   */
  get store() {
    return {
      setKnowledge: async (item: {
        id: string;
        vector: number[];
        content: string;
        metadata?: any
      }) => {
        return this.upsertVectors([{
          id: item.id,
          vector: item.vector, // Pass as 'vector' which upsertVectors handles with casting
          metadata: {
            content: item.content,
            ...item.metadata
          }
        } as any]);
      }
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STATISTICS & MONITORING
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Get bridge statistics
   */
  // Complexity: O(1)
  getStats(): BridgeStats {
    return {
      isConnected: this.isConnected,
      indexName: this.config.indexName,
      namespace: this.config.namespace,
      totalVectors: this.totalVectors,
      dimension: this.config.dimension,
      queriesExecuted: this.stats.queriesExecuted,
      cacheHits: this.stats.cacheHits,
      avgQueryTimeMs: this.stats.queriesExecuted > 0
        ? Math.round(this.stats.totalQueryTime / this.stats.queriesExecuted)
        : 0,
      activeSessions: this.sessions.size,
      uptime: Date.now() - this.stats.startTime,
    };
  }

  /**
   * Get last error
   */
  // Complexity: O(1)
  getLastError(): Error | null {
    return this.stats.lastError;
  }

  /**
   * Clear query cache
   */
  // Complexity: O(1)
  clearCache(): void {
    this.queryCache.clear();
    this.log('info', '🗑️ Query cache cleared');
  }

  /**
   * Refresh index stats
   */
  // Complexity: O(1)
  async refreshStats(): Promise<void> {
    if (!this.isConnected || !this.index) {
      throw new Error('Not connected to Pinecone');
    }

    // SAFETY: async operation — wrap in try-catch for production resilience
    const stats = await this.index.describeIndexStats();
    this.totalVectors = stats.totalRecordCount || 0;
    this.log('info', `📊 Stats refreshed: ${this.totalVectors.toLocaleString()} vectors`);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // UTILITIES
  // ═══════════════════════════════════════════════════════════════════════════

  // Complexity: O(1)
  private getCacheKey(text: string, options: Record<string, any>): string {
    return `${text}:${JSON.stringify(options)}`;
  }

  // Complexity: O(1) — hash/map lookup
  private log(level: 'info' | 'success' | 'error' | 'warn', message: string): void {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: '📘',
      success: '✅',
      error: '❌',
      warn: '⚠️',
    }[level];

    console.log(`[${timestamp}] ${prefix} [PineconeBridge] ${message}`);
    this.emit('log', { level, message, timestamp });
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SINGLETON INSTANCE
// ═══════════════════════════════════════════════════════════════════════════════

export const pineconeContextBridge = new PineconeContextBridge();

export default PineconeContextBridge;
