"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║          SESSION MEMORY - SHORT-TERM VECTOR DATABASE                         ║
 * ║                                                                               ║
 * ║   In-memory Vector DB за session persistence.                                ║
 * ║   Ботът помни какво е видял преди 3 страници.                                ║
 * ║   "Without memory, every page is the first page."                             ║
 * ║                                                                               ║
 * ║   Features:                                                                   ║
 * ║   • In-memory vector store with cosine similarity search                     ║
 * ║   • Automatic embedding via EmbeddingEngine (TFJS USE)                       ║
 * ║   • Temporal decay — older memories fade unless reinforced                   ║
 * ║   • Semantic deduplication — similar memories merge                          ║
 * ║   • Session context window — "what happened in last N pages"                ║
 * ║   • Cross-page pattern detection                                             ║
 * ║   • JSON persistence — save/load sessions to disk                           ║
 * ║                                                                               ║
 * ║  Created: 2026-02-23 | QAntum Prime v28.2.0 - Cognitive Layer               ║
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
exports.SessionMemory = void 0;
exports.getSessionMemory = getSessionMemory;
const events_1 = require("events");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// ═══════════════════════════════════════════════════════════════════════════════
// SESSION MEMORY ENGINE
// ═══════════════════════════════════════════════════════════════════════════════
class SessionMemory extends events_1.EventEmitter {
    config;
    entries = new Map();
    sessionId;
    sessionStart;
    pagesVisited = new Set();
    embedder = null; // EmbeddingEngine reference
    autoSaveTimer = null;
    idCounter = 0;
    constructor(config) {
        super();
        this.config = {
            maxEntries: config?.maxEntries ?? 5000,
            decayRate: config?.decayRate ?? 0.002,
            evictionThreshold: config?.evictionThreshold ?? 0.05,
            deduplicationThreshold: config?.deduplicationThreshold ?? 0.92,
            autoSaveInterval: config?.autoSaveInterval ?? 60_000,
            persistPath: config?.persistPath,
            vectorDimensions: config?.vectorDimensions ?? 512,
            enableDecay: config?.enableDecay ?? true,
            reinforceOnAccess: config?.reinforceOnAccess ?? true,
        };
        this.sessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        this.sessionStart = Date.now();
        console.log(`🧠 SessionMemory initialized — ID: ${this.sessionId}`);
        console.log(`   Max entries: ${this.config.maxEntries} | Decay: ${this.config.decayRate}/min`);
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // INITIALIZATION
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Connect to EmbeddingEngine for vector generation.
     * If not connected, uses simple TF-IDF-like hashing as fallback.
     */
    // Complexity: O(1)
    connectEmbedder(embedder) {
        this.embedder = embedder;
        console.log('   ✅ SessionMemory connected to EmbeddingEngine');
    }
    /**
     * Start auto-save timer and load persisted session if available.
     */
    // Complexity: O(1)
    async start() {
        // Load persisted session
        if (this.config.persistPath) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.loadFromDisk();
        }
        // Auto-save timer
        if (this.config.persistPath && this.config.autoSaveInterval > 0) {
            this.autoSaveTimer = setInterval(() => {
                this.saveToDisk().catch(err => console.error('SessionMemory auto-save failed:', err));
            }, this.config.autoSaveInterval);
        }
        // Decay timer — every 30 seconds
        if (this.config.enableDecay) {
            // Complexity: O(1)
            setInterval(() => this.applyDecay(), 30_000);
        }
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // MEMORIZE
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Store a memory with automatic embedding.
     */
    // Complexity: O(N)
    async remember(content, metadata) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const vector = await this.embed(content);
        const id = `mem_${++this.idCounter}_${Date.now()}`;
        // Check for duplicates
        const existing = this.findDuplicate(vector);
        if (existing) {
            // Reinforce existing memory instead of creating duplicate
            existing.strength = Math.min(1, existing.strength + 0.1);
            existing.accessCount++;
            existing.lastAccessed = Date.now();
            // Merge metadata
            if (metadata.tags) {
                existing.metadata.tags = [
                    ...new Set([...(existing.metadata.tags || []), ...metadata.tags])
                ];
            }
            this.emit('memory-reinforced', { id: existing.id, strength: existing.strength });
            return existing.id;
        }
        // Track page
        if (metadata.pageUrl) {
            this.pagesVisited.add(metadata.pageUrl);
        }
        const entry = {
            id,
            content,
            vector,
            metadata,
            createdAt: Date.now(),
            lastAccessed: Date.now(),
            accessCount: 0,
            strength: 1.0,
        };
        this.entries.set(id, entry);
        // Evict if over capacity
        if (this.entries.size > this.config.maxEntries) {
            this.evictWeakest();
        }
        this.emit('memory-stored', { id, type: metadata.type, entries: this.entries.size });
        return id;
    }
    /**
     * Store a price observation (convenience method).
     */
    // Complexity: O(N) — potential recursive descent
    async rememberPrice(product, price, pageUrl) {
        return this.remember(`Price of ${product}: ${price}`, {
            type: 'price',
            pageUrl,
            value: price,
            tags: ['price', product.toLowerCase()],
        });
    }
    /**
     * Store a navigation event.
     */
    // Complexity: O(N) — potential recursive descent
    async rememberNavigation(pageUrl, pageTitle) {
        return this.remember(`Navigated to: ${pageTitle} (${pageUrl})`, {
            type: 'navigation',
            pageUrl,
            pageTitle,
            tags: ['navigation'],
        });
    }
    /**
     * Store an action performed.
     */
    // Complexity: O(N) — potential recursive descent
    async rememberAction(description, metadata = {}) {
        return this.remember(`Action: ${description}`, {
            type: 'action',
            ...metadata,
            tags: ['action', ...(metadata.tags || [])],
        });
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // RECALL
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Semantic search through memories.
     */
    // Complexity: O(N*M) — nested iteration detected
    async recall(query) {
        const limit = query.limit ?? 10;
        const now = Date.now();
        let results = [];
        // Get query vector
        let queryVector;
        if (query.vector) {
            queryVector = query.vector;
        }
        else if (query.text) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            queryVector = await this.embed(query.text);
        }
        else {
            // No vector query — filter by metadata only
            queryVector = [];
        }
        for (const entry of this.entries.values()) {
            // Apply filters
            if (query.type && entry.metadata.type !== query.type)
                continue;
            if (query.pageUrl && entry.metadata.pageUrl !== query.pageUrl)
                continue;
            if (query.minStrength && entry.strength < query.minStrength)
                continue;
            if (query.timeWindowMs && (now - entry.createdAt) > query.timeWindowMs)
                continue;
            if (query.tags?.length) {
                const entryTags = entry.metadata.tags || [];
                if (!query.tags.some(t => entryTags.includes(t)))
                    continue;
            }
            // Calculate similarity
            let similarity = 1;
            if (queryVector.length > 0 && entry.vector.length > 0) {
                similarity = this.cosineSimilarity(queryVector, entry.vector);
            }
            // Calculate recency factor (1.0 = just now, decays over time)
            const ageMs = now - entry.createdAt;
            const recency = Math.exp(-ageMs / (30 * 60_000)); // Half-life: 30 minutes
            // Combined relevance score
            const relevanceScore = similarity * entry.strength * (0.3 + 0.7 * recency);
            results.push({
                entry,
                similarity,
                ageMs,
                relevanceScore,
            });
        }
        // Sort by relevance
        results.sort((a, b) => b.relevanceScore - a.relevanceScore);
        results = results.slice(0, limit);
        // Reinforce accessed memories
        if (this.config.reinforceOnAccess) {
            for (const r of results) {
                r.entry.lastAccessed = now;
                r.entry.accessCount++;
                r.entry.strength = Math.min(1, r.entry.strength + 0.02);
            }
        }
        this.emit('recall', { query: query.text, results: results.length });
        return results;
    }
    /**
     * "What did I see on the previous page?"
     */
    // Complexity: O(N) — potential recursive descent
    async recallOnPage(pageUrl, limit = 20) {
        return this.recall({ pageUrl, limit });
    }
    /**
     * "What prices have I seen for this product?"
     */
    // Complexity: O(N) — potential recursive descent
    async recallPrices(product, limit = 10) {
        return this.recall({
            text: `Price of ${product}`,
            type: 'price',
            tags: [product.toLowerCase()],
            limit,
        });
    }
    /**
     * Get context window — summary of last N memories for AI prompt.
     */
    // Complexity: O(N log N) — sort operation
    getContextWindow(n = 20) {
        const recent = [...this.entries.values()]
            .sort((a, b) => b.lastAccessed - a.lastAccessed)
            .slice(0, n);
        if (recent.length === 0)
            return 'No session memories yet.';
        const lines = recent.map(e => {
            const age = this.formatAge(Date.now() - e.createdAt);
            const type = e.metadata.type.toUpperCase();
            return `[${type}] (${age} ago, str=${e.strength.toFixed(2)}) ${e.content}`;
        });
        return `SESSION MEMORY (${this.entries.size} total, ${this.pagesVisited.size} pages):\n${lines.join('\n')}`;
    }
    /**
     * Cross-page pattern detection.
     * Example: "Have I seen this price cheaper on another page?"
     */
    // Complexity: O(N) — linear iteration
    async findPattern(content, options) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const results = await this.recall({
            text: content,
            limit: 20,
            minStrength: 0.1,
        });
        const minSim = options?.minSimilarity ?? 0.7;
        return results.filter(r => {
            if (r.similarity < minSim)
                return false;
            if (options?.excludeCurrentPage && r.entry.metadata.pageUrl === options.excludeCurrentPage)
                return false;
            return true;
        });
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // MEMORY MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Apply temporal decay to all memories.
     */
    // Complexity: O(N) — linear iteration
    applyDecay() {
        const now = Date.now();
        let evicted = 0;
        for (const [id, entry] of this.entries) {
            const minutesOld = (now - entry.lastAccessed) / 60_000;
            entry.strength -= this.config.decayRate * minutesOld * 0.5;
            // Frequently accessed memories decay slower
            if (entry.accessCount > 5) {
                entry.strength = Math.max(entry.strength, 0.3);
            }
            if (entry.strength <= this.config.evictionThreshold) {
                this.entries.delete(id);
                evicted++;
            }
        }
        if (evicted > 0) {
            this.emit('decay', { evicted, remaining: this.entries.size });
        }
    }
    /**
     * Evict weakest memories when over capacity.
     */
    // Complexity: O(N log N) — sort operation
    evictWeakest() {
        const sorted = [...this.entries.entries()]
            .sort((a, b) => a[1].strength - b[1].strength);
        // Remove bottom 10%
        const toRemove = Math.ceil(this.config.maxEntries * 0.1);
        for (let i = 0; i < toRemove && i < sorted.length; i++) {
            this.entries.delete(sorted[i][0]);
        }
        this.emit('eviction', { removed: toRemove, remaining: this.entries.size });
    }
    /**
     * Find duplicate by vector similarity.
     */
    // Complexity: O(N) — linear iteration
    findDuplicate(vector) {
        if (vector.length === 0)
            return null;
        for (const entry of this.entries.values()) {
            if (entry.vector.length === 0)
                continue;
            const sim = this.cosineSimilarity(vector, entry.vector);
            if (sim >= this.config.deduplicationThreshold) {
                return entry;
            }
        }
        return null;
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // EMBEDDING
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Generate embedding vector.
     * Uses EmbeddingEngine if connected, otherwise TF-IDF hash fallback.
     */
    // Complexity: O(1)
    async embed(text) {
        // Try EmbeddingEngine first
        if (this.embedder?.embedText) {
            try {
                return await this.embedder.embedText(text);
            }
            catch {
                // Fall through to hash
            }
        }
        // Fallback: simple hash-based pseudo-embedding
        return this.hashEmbed(text);
    }
    /**
     * Simple hash-based pseudo-embedding for when no ML model is available.
     * Not semantically meaningful but enables basic similarity comparisons.
     */
    // Complexity: O(N*M) — nested iteration detected
    hashEmbed(text) {
        const dim = this.config.vectorDimensions;
        const vec = new Float32Array(dim);
        // Tokenize
        const tokens = text.toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(t => t.length > 1);
        // Hash each token into the vector space
        for (const token of tokens) {
            let hash = 0;
            for (let i = 0; i < token.length; i++) {
                hash = ((hash << 5) - hash + token.charCodeAt(i)) | 0;
            }
            // Scatter token influence across multiple dimensions
            for (let d = 0; d < 3; d++) {
                const idx = Math.abs((hash + d * 7919) % dim);
                vec[idx] += 1 / (1 + d);
            }
            // Bigram hashing for better quality
            if (token.length >= 3) {
                for (let i = 0; i < token.length - 1; i++) {
                    const bigram = token.slice(i, i + 2);
                    let bh = 0;
                    for (let j = 0; j < bigram.length; j++) {
                        bh = ((bh << 5) - bh + bigram.charCodeAt(j)) | 0;
                    }
                    const idx = Math.abs(bh % dim);
                    vec[idx] += 0.5;
                }
            }
        }
        // L2 normalize
        let norm = 0;
        for (let i = 0; i < dim; i++)
            norm += vec[i] * vec[i];
        norm = Math.sqrt(norm) || 1;
        const result = new Array(dim);
        for (let i = 0; i < dim; i++)
            result[i] = vec[i] / norm;
        return result;
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // VECTOR MATH
    // ═══════════════════════════════════════════════════════════════════════════
    // Complexity: O(N) — linear iteration
    cosineSimilarity(a, b) {
        if (a.length !== b.length || a.length === 0)
            return 0;
        let dot = 0, normA = 0, normB = 0;
        for (let i = 0; i < a.length; i++) {
            dot += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }
        const denom = Math.sqrt(normA) * Math.sqrt(normB);
        return denom === 0 ? 0 : dot / denom;
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // PERSISTENCE
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Save session to disk as JSON.
     */
    // Complexity: O(1) — amortized
    async saveToDisk() {
        if (!this.config.persistPath)
            return;
        const snapshot = {
            sessionId: this.sessionId,
            created: this.sessionStart,
            lastSaved: Date.now(),
            totalEntries: this.entries.size,
            pagesVisited: [...this.pagesVisited],
            entries: [...this.entries.values()],
        };
        const dir = path.dirname(this.config.persistPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(this.config.persistPath, JSON.stringify(snapshot, null, 2));
        this.emit('saved', { path: this.config.persistPath, entries: this.entries.size });
    }
    /**
     * Load session from disk.
     */
    // Complexity: O(N) — linear iteration
    async loadFromDisk() {
        if (!this.config.persistPath || !fs.existsSync(this.config.persistPath))
            return false;
        try {
            const data = fs.readFileSync(this.config.persistPath, 'utf-8');
            const snapshot = JSON.parse(data);
            for (const entry of snapshot.entries) {
                this.entries.set(entry.id, entry);
                this.idCounter = Math.max(this.idCounter, parseInt(entry.id.split('_')[1]) || 0);
            }
            this.pagesVisited = new Set(snapshot.pagesVisited);
            console.log(`   📂 Loaded ${this.entries.size} memories from ${this.config.persistPath}`);
            this.emit('loaded', { entries: this.entries.size });
            return true;
        }
        catch (err) {
            console.error('   ⚠️ Failed to load session:', err);
            return false;
        }
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // STATS & DIAGNOSTICS
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Get session statistics.
     */
    // Complexity: O(N) — linear iteration
    getStats() {
        const entries = [...this.entries.values()];
        const avgStrength = entries.length > 0
            ? entries.reduce((sum, e) => sum + e.strength, 0) / entries.length
            : 0;
        const byType = {};
        for (const e of entries) {
            byType[e.metadata.type] = (byType[e.metadata.type] || 0) + 1;
        }
        return {
            sessionId: this.sessionId,
            sessionDuration: Date.now() - this.sessionStart,
            totalEntries: this.entries.size,
            pagesVisited: this.pagesVisited.size,
            avgStrength: Math.round(avgStrength * 100) / 100,
            byType,
            oldestMemory: entries.length > 0
                ? Date.now() - Math.min(...entries.map(e => e.createdAt))
                : 0,
            newestMemory: entries.length > 0
                ? Date.now() - Math.max(...entries.map(e => e.createdAt))
                : 0,
        };
    }
    /**
     * Cleanup and shutdown.
     */
    // Complexity: O(1)
    async shutdown() {
        if (this.autoSaveTimer) {
            // Complexity: O(1)
            clearInterval(this.autoSaveTimer);
            this.autoSaveTimer = null;
        }
        // Final save
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.saveToDisk();
        this.entries.clear();
        console.log(`🧠 SessionMemory shut down — ${this.sessionId}`);
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // HELPERS
    // ═══════════════════════════════════════════════════════════════════════════
    // Complexity: O(1)
    formatAge(ms) {
        if (ms < 60_000)
            return `${Math.round(ms / 1000)}s`;
        if (ms < 3_600_000)
            return `${Math.round(ms / 60_000)}m`;
        return `${Math.round(ms / 3_600_000)}h`;
    }
}
exports.SessionMemory = SessionMemory;
// ═══════════════════════════════════════════════════════════════════════════════
// SINGLETON
// ═══════════════════════════════════════════════════════════════════════════════
let sessionMemoryInstance = null;
function getSessionMemory(config) {
    if (!sessionMemoryInstance) {
        sessionMemoryInstance = new SessionMemory(config);
    }
    return sessionMemoryInstance;
}
exports.default = SessionMemory;
