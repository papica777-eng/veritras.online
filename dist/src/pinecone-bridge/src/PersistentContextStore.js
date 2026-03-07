"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.persistentStore = exports.PersistentContextStore = void 0;
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const events_1 = require("events");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// ═══════════════════════════════════════════════════════════════════════════════
// PERSISTENT CONTEXT STORE
// ═══════════════════════════════════════════════════════════════════════════════
class PersistentContextStore extends events_1.EventEmitter {
    db;
    dbPath;
    constructor(dbPath) {
        super();
        // Default path in user data directory
        this.dbPath = dbPath || path_1.default.join(process.env.APPDATA || process.env.HOME || '.', '.QAntum', 'context-bridge.db');
        // Ensure directory exists
        const dir = path_1.default.dirname(this.dbPath);
        if (!fs_1.default.existsSync(dir)) {
            fs_1.default.mkdirSync(dir, { recursive: true });
        }
        // Initialize database
        this.db = new better_sqlite3_1.default(this.dbPath);
        this.initializeSchema();
        console.log(`[PersistentStore] 💾 Database initialized at: ${this.dbPath}`);
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // SCHEMA INITIALIZATION
    // ═══════════════════════════════════════════════════════════════════════════
    // Complexity: O(N*M) — nested iteration
    initializeSchema() {
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
        // Complexity: O(1)
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
    // Complexity: O(1)
    saveSession(session) {
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
        stmt.run(session.sessionId, session.name, session.createdAt, session.lastAccessedAt, JSON.stringify(session.queryHistory), JSON.stringify(session.contextVectors), JSON.stringify(session.activeFilters), JSON.stringify(session.projectScope), JSON.stringify(session.metadata || {}));
        this.emit('session:saved', session.sessionId);
    }
    /**
     * Load a session by ID
     */
    // Complexity: O(1) — lookup
    loadSession(sessionId) {
        const stmt = this.db.prepare(`
      SELECT * FROM sessions WHERE session_id = ?
    `);
        const row = stmt.get(sessionId);
        if (!row)
            return null;
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
    // Complexity: O(N) — linear scan
    getAllSessions() {
        const stmt = this.db.prepare(`
      SELECT * FROM sessions ORDER BY last_accessed_at DESC
    `);
        return stmt.all().map((row) => ({
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
    // Complexity: O(1) — lookup
    getMostRecentSession() {
        const stmt = this.db.prepare(`
      SELECT * FROM sessions ORDER BY last_accessed_at DESC LIMIT 1
    `);
        const row = stmt.get();
        if (!row)
            return null;
        return this.loadSession(row.session_id);
    }
    /**
     * Delete a session
     */
    // Complexity: O(1)
    deleteSession(sessionId) {
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
    // Complexity: O(1)
    saveQuery(sessionId, query, results, queryTimeMs) {
        const stmt = this.db.prepare(`
      INSERT INTO queries (session_id, query, results, query_time_ms, timestamp)
      // Complexity: O(1)
      VALUES (?, ?, ?, ?, ?)
    `);
        const result = stmt.run(sessionId, query, JSON.stringify(results), queryTimeMs, Date.now());
        return result.lastInsertRowid;
    }
    /**
     * Get query history for a session
     */
    // Complexity: O(N) — linear scan
    getQueryHistory(sessionId, limit = 100) {
        const stmt = this.db.prepare(`
      SELECT * FROM queries
      WHERE session_id = ?
      ORDER BY timestamp DESC
      LIMIT ?
    `);
        return stmt.all(sessionId, limit).map((row) => ({
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
    // Complexity: O(N) — linear scan
    searchQueryHistory(searchTerm, limit = 50) {
        const stmt = this.db.prepare(`
      SELECT * FROM queries
      WHERE query LIKE ?
      ORDER BY timestamp DESC
      LIMIT ?
    `);
        return stmt.all(`%${searchTerm}%`, limit).map((row) => ({
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
    // Complexity: O(1)
    saveMessage(sessionId, role, content, contextUsed = []) {
        const stmt = this.db.prepare(`
      INSERT INTO conversations (session_id, role, content, context_used, timestamp)
      // Complexity: O(1)
      VALUES (?, ?, ?, ?, ?)
    `);
        const result = stmt.run(sessionId, role, content, JSON.stringify(contextUsed), Date.now());
        return result.lastInsertRowid;
    }
    /**
     * Get conversation history for a session
     */
    // Complexity: O(N) — linear scan
    getConversation(sessionId, limit = 100) {
        const stmt = this.db.prepare(`
      SELECT * FROM conversations
      WHERE session_id = ?
      ORDER BY timestamp ASC
      LIMIT ?
    `);
        return stmt.all(sessionId, limit).map((row) => ({
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
    // Complexity: O(N) — linear scan
    getRecentContext(sessionId, messageCount = 10) {
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
    // Complexity: O(1)
    setKnowledge(category, key, value, source, confidence = 1.0) {
        const stmt = this.db.prepare(`
      INSERT INTO knowledge (category, key, value, source, confidence, created_at, updated_at)
      // Complexity: O(1)
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
    // Complexity: O(1) — lookup
    getKnowledge(category, key) {
        const stmt = this.db.prepare(`
      SELECT value FROM knowledge WHERE category = ? AND key = ?
    `);
        const row = stmt.get(category, key);
        return row?.value || null;
    }
    /**
     * Get all knowledge in a category
     */
    // Complexity: O(N) — loop
    getKnowledgeByCategory(category) {
        const stmt = this.db.prepare(`
      SELECT key, value FROM knowledge WHERE category = ?
    `);
        const result = {};
        for (const row of stmt.all(category)) {
            result[row.key] = row.value;
        }
        return result;
    }
    /**
     * Search knowledge base
     */
    // Complexity: O(1)
    searchKnowledge(searchTerm) {
        const stmt = this.db.prepare(`
      SELECT category, key, value FROM knowledge
      WHERE key LIKE ? OR value LIKE ?
      ORDER BY confidence DESC, updated_at DESC
    `);
        return stmt.all(`%${searchTerm}%`, `%${searchTerm}%`);
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // EMBEDDINGS CACHE
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Cache an embedding
     */
    // Complexity: O(1)
    cacheEmbedding(text, vector) {
        const hash = this.hashText(text);
        const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO embeddings_cache (text_hash, text, vector, created_at)
      // Complexity: O(1)
      VALUES (?, ?, ?, ?)
    `);
        stmt.run(hash, text, JSON.stringify(vector), Date.now());
    }
    /**
     * Get cached embedding
     */
    // Complexity: O(1) — lookup
    getCachedEmbedding(text) {
        const hash = this.hashText(text);
        const stmt = this.db.prepare(`
      SELECT vector FROM embeddings_cache WHERE text_hash = ?
    `);
        const row = stmt.get(hash);
        return row ? JSON.parse(row.vector) : null;
    }
    /**
     * Clear old embeddings cache
     */
    // Complexity: O(1)
    clearOldEmbeddings(maxAge = 7 * 24 * 60 * 60 * 1000) {
        const stmt = this.db.prepare(`
      DELETE FROM embeddings_cache WHERE created_at < ?
    `);
        const result = stmt.run(Date.now() - maxAge);
        return result.changes;
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // UTILITIES
    // ═══════════════════════════════════════════════════════════════════════════
    // Complexity: O(N) — loop
    hashText(text) {
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
    // Complexity: O(1) — lookup
    getStats() {
        const stats = {
            sessions: this.db.prepare('SELECT COUNT(*) as count FROM sessions').get().count,
            queries: this.db.prepare('SELECT COUNT(*) as count FROM queries').get().count,
            conversations: this.db.prepare('SELECT COUNT(*) as count FROM conversations').get().count,
            knowledge: this.db.prepare('SELECT COUNT(*) as count FROM knowledge').get().count,
            cachedEmbeddings: this.db.prepare('SELECT COUNT(*) as count FROM embeddings_cache').get().count,
            dbSizeBytes: fs_1.default.existsSync(this.dbPath) ? fs_1.default.statSync(this.dbPath).size : 0,
        };
        return stats;
    }
    /**
     * Vacuum database
     */
    // Complexity: O(1)
    vacuum() {
        this.db.exec('VACUUM');
    }
    /**
     * Close database connection
     */
    // Complexity: O(1)
    close() {
        this.db.close();
        console.log('[PersistentStore] 💾 Database connection closed');
    }
}
exports.PersistentContextStore = PersistentContextStore;
// ═══════════════════════════════════════════════════════════════════════════════
// SINGLETON INSTANCE
// ═══════════════════════════════════════════════════════════════════════════════
exports.persistentStore = new PersistentContextStore();
exports.default = PersistentContextStore;
