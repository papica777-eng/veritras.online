/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                               ║
 * ║   PERSISTENT CONTEXT STORE v1.0                                               ║
 * ║   "Memory That Survives Death"                                                ║
 * ║                                                                               ║
 * ║   SQLite-based persistent storage for context between sessions and restarts   ║
 * ║                                                                               ║
 * ║   © 2025-2026 QAntum Empire | Dimitar Prodromov                               ║
 * ║                                                                               ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

import Database from 'better-sqlite3';
import { EventEmitter } from 'events';
import path from 'path';
import fs from 'fs';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface StoredSession {
  sessionId: string;
  name: string;
  createdAt: number;
  lastAccessedAt: number;
  queryHistory: string[];
  contextVectors: number[][];
  activeFilters: Record<string, any>;
  projectScope: string[];
  metadata: Record<string, any>;
}

export interface StoredQuery {
  id: number;
  sessionId: string;
  query: string;
  results: any[];
  queryTimeMs: number;
  timestamp: number;
}

export interface ConversationMessage {
  id: number;
  sessionId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  contextUsed: string[];
  timestamp: number;
}

export interface StoredMessage {
  id: number;
  sessionId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  contextUsed: string[];
  timestamp: number;
}

export interface StoredKnowledge {
  id: number;
  key: string;
  value: any;
  category: string;
  createdAt: number;
  updatedAt: number;
}

export interface StoreConfig {
  dbPath?: string;
  autoCleanup?: boolean;
  maxSessions?: number;
  maxQueriesPerSession?: number;
}

export interface StoreStats {
  totalSessions: number;
  totalQueries: number;
  totalMessages: number;
  totalKnowledge: number;
  dbSizeBytes: number;
  oldestSession: number;
  newestSession: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PERSISTENT CONTEXT STORE
// ═══════════════════════════════════════════════════════════════════════════════

export class PersistentContextStore extends EventEmitter {
  private db: InstanceType<typeof Database>;
  private dbPath: string;

  constructor(dbPath?: string) {
    super();
    
    // Default path in user data directory
    this.dbPath = dbPath || path.join(
      process.env.APPDATA || process.env.HOME || '.',
      '.qantum',
      'context-bridge.db'
    );

    // Ensure directory exists
    const dir = path.dirname(this.dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Initialize database
    this.db = new Database(this.dbPath);
    this.initializeSchema();
    
    console.log(`[PersistentStore] 💾 Database initialized at: ${this.dbPath}`);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SCHEMA INITIALIZATION
  // ═══════════════════════════════════════════════════════════════════════════

  private initializeSchema(): void {
    this.db.exec(`
      -- Sessions table
      CREATE TABLE IF NOT EXISTS sessions (
        session_id TEXT PRIMARY KEY,
        name TEXT NOT NULL DEFAULT 'Unnamed Session',
        created_at INTEGER NOT NULL,
        last_accessed_at INTEGER NOT NULL,
        query_history TEXT NOT NULL DEFAULT '[]',
        context_vectors TEXT NOT NULL DEFAULT '[]',
        active_filters TEXT NOT NULL DEFAULT '{}',
        project_scope TEXT NOT NULL DEFAULT '["MisteMind", "MrMindQATool", "MisterMindPage"]',
        metadata TEXT NOT NULL DEFAULT '{}'
      );

      -- Queries table (query history with results)
      CREATE TABLE IF NOT EXISTS queries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        query TEXT NOT NULL,
        results TEXT NOT NULL DEFAULT '[]',
        query_time_ms INTEGER NOT NULL DEFAULT 0,
        timestamp INTEGER NOT NULL,
        FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE
      );

      -- Conversations table (for AI chat context)
      CREATE TABLE IF NOT EXISTS conversations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
        content TEXT NOT NULL,
        context_used TEXT NOT NULL DEFAULT '[]',
        timestamp INTEGER NOT NULL,
        FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE
      );

      -- Embeddings cache
      CREATE TABLE IF NOT EXISTS embeddings_cache (
        text_hash TEXT PRIMARY KEY,
        text TEXT NOT NULL,
        vector TEXT NOT NULL,
        created_at INTEGER NOT NULL
      );

      -- Knowledge base (important facts to remember)
      CREATE TABLE IF NOT EXISTS knowledge (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category TEXT NOT NULL,
        key TEXT NOT NULL,
        value TEXT NOT NULL,
        source TEXT,
        confidence REAL DEFAULT 1.0,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        UNIQUE(category, key)
      );

      -- Indexes for performance
      CREATE INDEX IF NOT EXISTS idx_queries_session ON queries(session_id);
      CREATE INDEX IF NOT EXISTS idx_queries_timestamp ON queries(timestamp);
      CREATE INDEX IF NOT EXISTS idx_conversations_session ON conversations(session_id);
      CREATE INDEX IF NOT EXISTS idx_knowledge_category ON knowledge(category);
    `);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SESSION MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Save or update a session
   */
  saveSession(session: StoredSession): void {
    const stmt = this.db.prepare(`
      INSERT INTO sessions (
        session_id, name, created_at, last_accessed_at, 
        query_history, context_vectors, active_filters, project_scope, metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(session_id) DO UPDATE SET
        name = excluded.name,
        last_accessed_at = excluded.last_accessed_at,
        query_history = excluded.query_history,
        context_vectors = excluded.context_vectors,
        active_filters = excluded.active_filters,
        project_scope = excluded.project_scope,
        metadata = excluded.metadata
    `);

    stmt.run(
      session.sessionId,
      session.name,
      session.createdAt,
      session.lastAccessedAt,
      JSON.stringify(session.queryHistory),
      JSON.stringify(session.contextVectors),
      JSON.stringify(session.activeFilters),
      JSON.stringify(session.projectScope),
      JSON.stringify(session.metadata || {})
    );

    this.emit('session:saved', session.sessionId);
  }

  /**
   * Load a session by ID
   */
  loadSession(sessionId: string): StoredSession | null {
    const stmt = this.db.prepare(`
      SELECT * FROM sessions WHERE session_id = ?
    `);

    const row = stmt.get(sessionId) as any;
    if (!row) return null;

    return {
      sessionId: row.session_id,
      name: row.name,
      createdAt: row.created_at,
      lastAccessedAt: row.last_accessed_at,
      queryHistory: JSON.parse(row.query_history),
      contextVectors: JSON.parse(row.context_vectors),
      activeFilters: JSON.parse(row.active_filters),
      projectScope: JSON.parse(row.project_scope),
      metadata: JSON.parse(row.metadata),
    };
  }

  /**
   * Get all sessions
   */
  getAllSessions(): StoredSession[] {
    const stmt = this.db.prepare(`
      SELECT * FROM sessions ORDER BY last_accessed_at DESC
    `);

    return stmt.all().map((row: any) => ({
      sessionId: row.session_id,
      name: row.name,
      createdAt: row.created_at,
      lastAccessedAt: row.last_accessed_at,
      queryHistory: JSON.parse(row.query_history),
      contextVectors: JSON.parse(row.context_vectors),
      activeFilters: JSON.parse(row.active_filters),
      projectScope: JSON.parse(row.project_scope),
      metadata: JSON.parse(row.metadata),
    }));
  }

  /**
   * Get most recent session
   */
  getMostRecentSession(): StoredSession | null {
    const stmt = this.db.prepare(`
      SELECT * FROM sessions ORDER BY last_accessed_at DESC LIMIT 1
    `);

    const row = stmt.get() as any;
    if (!row) return null;

    return this.loadSession(row.session_id);
  }

  /**
   * Delete a session
   */
  deleteSession(sessionId: string): void {
    const stmt = this.db.prepare(`DELETE FROM sessions WHERE session_id = ?`);
    stmt.run(sessionId);
    this.emit('session:deleted', sessionId);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // QUERY HISTORY
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Save a query with results
   */
  saveQuery(sessionId: string, query: string, results: any[], queryTimeMs: number): number {
    const stmt = this.db.prepare(`
      INSERT INTO queries (session_id, query, results, query_time_ms, timestamp)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      sessionId,
      query,
      JSON.stringify(results),
      queryTimeMs,
      Date.now()
    );

    return result.lastInsertRowid as number;
  }

  /**
   * Get query history for a session
   */
  getQueryHistory(sessionId: string, limit = 100): StoredQuery[] {
    const stmt = this.db.prepare(`
      SELECT * FROM queries 
      WHERE session_id = ? 
      ORDER BY timestamp DESC 
      LIMIT ?
    `);

    return stmt.all(sessionId, limit).map((row: any) => ({
      id: row.id,
      sessionId: row.session_id,
      query: row.query,
      results: JSON.parse(row.results),
      queryTimeMs: row.query_time_ms,
      timestamp: row.timestamp,
    }));
  }

  /**
   * Search query history
   */
  searchQueryHistory(searchTerm: string, limit = 50): StoredQuery[] {
    const stmt = this.db.prepare(`
      SELECT * FROM queries 
      WHERE query LIKE ? 
      ORDER BY timestamp DESC 
      LIMIT ?
    `);

    return stmt.all(`%${searchTerm}%`, limit).map((row: any) => ({
      id: row.id,
      sessionId: row.session_id,
      query: row.query,
      results: JSON.parse(row.results),
      queryTimeMs: row.query_time_ms,
      timestamp: row.timestamp,
    }));
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CONVERSATION HISTORY (AI CHAT)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Save a conversation message
   */
  saveMessage(
    sessionId: string, 
    role: 'user' | 'assistant' | 'system', 
    content: string,
    contextUsed: string[] = []
  ): number {
    const stmt = this.db.prepare(`
      INSERT INTO conversations (session_id, role, content, context_used, timestamp)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      sessionId,
      role,
      content,
      JSON.stringify(contextUsed),
      Date.now()
    );

    return result.lastInsertRowid as number;
  }

  /**
   * Get conversation history for a session
   */
  getConversation(sessionId: string, limit = 100): ConversationMessage[] {
    const stmt = this.db.prepare(`
      SELECT * FROM conversations 
      WHERE session_id = ? 
      ORDER BY timestamp ASC 
      LIMIT ?
    `);

    return stmt.all(sessionId, limit).map((row: any) => ({
      id: row.id,
      sessionId: row.session_id,
      role: row.role,
      content: row.content,
      contextUsed: JSON.parse(row.context_used),
      timestamp: row.timestamp,
    }));
  }

  /**
   * Get recent context from conversation
   */
  getRecentContext(sessionId: string, messageCount = 10): string {
    const messages = this.getConversation(sessionId, messageCount);
    return messages
      .map(m => `${m.role}: ${m.content}`)
      .join('\n');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // KNOWLEDGE BASE (FACTS TO REMEMBER)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Store a piece of knowledge
   */
  setKnowledge(
    category: string, 
    key: string, 
    value: string, 
    source?: string,
    confidence = 1.0
  ): void {
    const stmt = this.db.prepare(`
      INSERT INTO knowledge (category, key, value, source, confidence, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(category, key) DO UPDATE SET
        value = excluded.value,
        source = excluded.source,
        confidence = excluded.confidence,
        updated_at = excluded.updated_at
    `);

    const now = Date.now();
    stmt.run(category, key, value, source, confidence, now, now);
  }

  /**
   * Get knowledge by category and key
   */
  getKnowledge(category: string, key: string): string | null {
    const stmt = this.db.prepare(`
      SELECT value FROM knowledge WHERE category = ? AND key = ?
    `);

    const row = stmt.get(category, key) as any;
    return row?.value || null;
  }

  /**
   * Get all knowledge in a category
   */
  getKnowledgeByCategory(category: string): Record<string, string> {
    const stmt = this.db.prepare(`
      SELECT key, value FROM knowledge WHERE category = ?
    `);

    const result: Record<string, string> = {};
    for (const row of stmt.all(category) as any[]) {
      result[row.key] = row.value;
    }
    return result;
  }

  /**
   * Search knowledge base
   */
  searchKnowledge(searchTerm: string): Array<{ category: string; key: string; value: string }> {
    const stmt = this.db.prepare(`
      SELECT category, key, value FROM knowledge 
      WHERE key LIKE ? OR value LIKE ?
      ORDER BY confidence DESC, updated_at DESC
    `);

    return stmt.all(`%${searchTerm}%`, `%${searchTerm}%`) as any[];
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // EMBEDDINGS CACHE
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Cache an embedding
   */
  cacheEmbedding(text: string, vector: number[]): void {
    const hash = this.hashText(text);
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO embeddings_cache (text_hash, text, vector, created_at)
      VALUES (?, ?, ?, ?)
    `);

    stmt.run(hash, text, JSON.stringify(vector), Date.now());
  }

  /**
   * Get cached embedding
   */
  getCachedEmbedding(text: string): number[] | null {
    const hash = this.hashText(text);
    const stmt = this.db.prepare(`
      SELECT vector FROM embeddings_cache WHERE text_hash = ?
    `);

    const row = stmt.get(hash) as any;
    return row ? JSON.parse(row.vector) : null;
  }

  /**
   * Clear old embeddings cache
   */
  clearOldEmbeddings(maxAge = 7 * 24 * 60 * 60 * 1000): number {
    const stmt = this.db.prepare(`
      DELETE FROM embeddings_cache WHERE created_at < ?
    `);

    const result = stmt.run(Date.now() - maxAge);
    return result.changes;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // UTILITIES
  // ═══════════════════════════════════════════════════════════════════════════

  private hashText(text: string): string {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(16);
  }

  /**
   * Get database statistics
   */
  getStats(): {
    sessions: number;
    queries: number;
    conversations: number;
    knowledge: number;
    cachedEmbeddings: number;
    dbSizeBytes: number;
  } {
    const stats = {
      sessions: (this.db.prepare('SELECT COUNT(*) as count FROM sessions').get() as any).count,
      queries: (this.db.prepare('SELECT COUNT(*) as count FROM queries').get() as any).count,
      conversations: (this.db.prepare('SELECT COUNT(*) as count FROM conversations').get() as any).count,
      knowledge: (this.db.prepare('SELECT COUNT(*) as count FROM knowledge').get() as any).count,
      cachedEmbeddings: (this.db.prepare('SELECT COUNT(*) as count FROM embeddings_cache').get() as any).count,
      dbSizeBytes: fs.existsSync(this.dbPath) ? fs.statSync(this.dbPath).size : 0,
    };

    return stats;
  }

  /**
   * Vacuum database
   */
  vacuum(): void {
    this.db.exec('VACUUM');
  }

  /**
   * Close database connection
   */
  close(): void {
    this.db.close();
    console.log('[PersistentStore] 💾 Database connection closed');
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SINGLETON INSTANCE
// ═══════════════════════════════════════════════════════════════════════════════

export const persistentStore = new PersistentContextStore();

export default PersistentContextStore;
