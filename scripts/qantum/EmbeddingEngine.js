/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                               ║
 * ║   EMBEDDING ENGINE v1.0                                                       ║
 * ║   "Transforming Words into Vectors"                                           ║
 * ║                                                                               ║
 * ║   Universal Sentence Encoder wrapper for generating 512-dim embeddings        ║
 * ║                                                                               ║
 * ║   © 2025-2026 QAntum Empire | Dimitar Prodromov                               ║
 * ║                                                                               ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */
import { EventEmitter } from 'events';
// ═══════════════════════════════════════════════════════════════════════════════
// DEFAULT CONFIG
// ═══════════════════════════════════════════════════════════════════════════════
const DEFAULT_CONFIG = {
    batchSize: 32,
    cacheEnabled: true,
    maxCacheSize: 10000,
};
// ═══════════════════════════════════════════════════════════════════════════════
// EMBEDDING ENGINE
// ═══════════════════════════════════════════════════════════════════════════════
export class EmbeddingEngine extends EventEmitter {
    config;
    model = null;
    isLoading = false;
    isReady = false;
    // Cache
    cache = new Map();
    // Stats
    stats = {
        embeddings: 0,
        cacheHits: 0,
        totalTimeMs: 0,
        loadTimeMs: 0,
    };
    constructor(config = {}) {
        super();
        this.config = { ...DEFAULT_CONFIG, ...config };
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // MODEL MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Load the Universal Sentence Encoder model
     */
    // Complexity: O(N)
    async load() {
        if (this.isReady || this.isLoading)
            return;
        this.isLoading = true;
        const startTime = Date.now();
        try {
            console.log('[EmbeddingEngine] ⏳ Loading Universal Sentence Encoder...');
            // Dynamic import for TensorFlow — use createRequire to resolve from parent node_modules
            const { createRequire } = await import('module');
            const { fileURLToPath } = await import('url');
            const _filename = typeof __filename !== 'undefined' ? __filename : fileURLToPath(import.meta.url);
            const _path = await import('path');
            const parentRequire = createRequire(_path.resolve(_path.dirname(_filename), '..', 'package.json'));
            let tf;
            try {
                tf = parentRequire('@tensorflow/tfjs-node');
            } catch (_) {
                console.log('[EmbeddingEngine] ℹ️ tfjs-node unavailable, using pure JS backend');
                tf = parentRequire('@tensorflow/tfjs');
            }
            let use = parentRequire('@tensorflow-models/universal-sentence-encoder');
            // SAFETY: async operation — wrap in try-catch for production resilience
            this.model = await use.load();
            this.stats.loadTimeMs = Date.now() - startTime;
            this.isReady = true;
            this.isLoading = false;
            console.log(`[EmbeddingEngine] ✅ Model loaded in ${this.stats.loadTimeMs}ms`);
            this.emit('loaded', { loadTimeMs: this.stats.loadTimeMs });
        }
        catch (error) {
            this.isLoading = false;
            console.error('[EmbeddingEngine] ❌ Failed to load model:', error);
            throw error;
        }
    }
    /**
     * Check if model is ready
     */
    // Complexity: O(1)
    ready() {
        return this.isReady;
    }
    /**
     * Wait for model to be ready
     */
    // Complexity: O(N)
    async waitForReady() {
        if (this.isReady)
            return;
        if (!this.isLoading) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.load();
            return;
        }
        // Wait for loading to complete
        return new Promise((resolve) => {
            const check = setInterval(() => {
                if (this.isReady) {
                    // Complexity: O(1)
                    clearInterval(check);
                    // Complexity: O(1)
                    resolve();
                }
            }, 100);
        });
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // EMBEDDING GENERATION
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Generate embedding for a single text
     */
    // Complexity: O(1) — hash/map lookup
    async embed(text) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.waitForReady();
        // Check cache
        if (this.config.cacheEnabled) {
            const cached = this.cache.get(text);
            if (cached) {
                this.stats.cacheHits++;
                return cached;
            }
        }
        const startTime = Date.now();
        try {
            const embeddings = await this.model.embed([text]);
            const vector = await embeddings.array();
            embeddings.dispose();
            const result = vector[0];
            // Update stats
            this.stats.embeddings++;
            this.stats.totalTimeMs += Date.now() - startTime;
            // Cache result
            if (this.config.cacheEnabled) {
                this.addToCache(text, result);
            }
            return result;
        }
        catch (error) {
            console.error('[EmbeddingEngine] ❌ Embedding failed:', error);
            throw error;
        }
    }
    /**
     * Generate embeddings for multiple texts
     */
    // Complexity: O(N*M) — nested iteration detected
    async embedBatch(texts) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.waitForReady();
        const results = [];
        const toEmbed = [];
        // Check cache for each text
        for (let i = 0; i < texts.length; i++) {
            if (this.config.cacheEnabled) {
                const cached = this.cache.get(texts[i]);
                if (cached) {
                    results[i] = cached;
                    this.stats.cacheHits++;
                    continue;
                }
            }
            toEmbed.push({ index: i, text: texts[i] });
        }
        // Embed uncached texts in batches
        if (toEmbed.length > 0) {
            const startTime = Date.now();
            for (let i = 0; i < toEmbed.length; i += this.config.batchSize) {
                const batch = toEmbed.slice(i, i + this.config.batchSize);
                const batchTexts = batch.map(item => item.text);
                // SAFETY: async operation — wrap in try-catch for production resilience
                const embeddings = await this.model.embed(batchTexts);
                // SAFETY: async operation — wrap in try-catch for production resilience
                const vectors = await embeddings.array();
                embeddings.dispose();
                // Store results
                for (let j = 0; j < batch.length; j++) {
                    const vector = vectors[j];
                    results[batch[j].index] = vector;
                    // Cache result
                    if (this.config.cacheEnabled) {
                        this.addToCache(batch[j].text, vector);
                    }
                }
            }
            this.stats.embeddings += toEmbed.length;
            this.stats.totalTimeMs += Date.now() - startTime;
        }
        return results;
    }
    /**
     * Generate embedding with metadata
     */
    // Complexity: O(1) — hash/map lookup
    async embedWithInfo(text) {
        const startTime = Date.now();
        // Check cache
        if (this.config.cacheEnabled) {
            const cached = this.cache.get(text);
            if (cached) {
                this.stats.cacheHits++;
                return {
                    text,
                    vector: cached,
                    cached: true,
                    timeMs: Date.now() - startTime,
                };
            }
        }
        // SAFETY: async operation — wrap in try-catch for production resilience
        const vector = await this.embed(text);
        return {
            text,
            vector,
            cached: false,
            timeMs: Date.now() - startTime,
        };
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // SIMILARITY OPERATIONS
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Calculate cosine similarity between two vectors
     */
    // Complexity: O(N) — linear iteration
    cosineSimilarity(a, b) {
        if (a.length !== b.length) {
            throw new Error('Vectors must have the same length');
        }
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
     * Calculate similarity between two texts
     */
    // Complexity: O(N) — potential recursive descent
    async textSimilarity(text1, text2) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const [vec1, vec2] = await this.embedBatch([text1, text2]);
        return this.cosineSimilarity(vec1, vec2);
    }
    /**
     * Find most similar texts from a list
     */
    // Complexity: O(N log N) — sort operation
    async findMostSimilar(query, candidates, topK = 5) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const queryVector = await this.embed(query);
        // SAFETY: async operation — wrap in try-catch for production resilience
        const candidateVectors = await this.embedBatch(candidates);
        const scores = candidates.map((text, i) => ({
            text,
            score: this.cosineSimilarity(queryVector, candidateVectors[i]),
        }));
        return scores
            .sort((a, b) => b.score - a.score)
            .slice(0, topK);
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // CACHE MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════════
    // Complexity: O(1) — hash/map lookup
    addToCache(text, vector) {
        // Evict oldest if cache is full
        if (this.cache.size >= this.config.maxCacheSize) {
            const firstKey = this.cache.keys().next().value;
            if (firstKey) {
                this.cache.delete(firstKey);
            }
        }
        this.cache.set(text, vector);
    }
    /**
     * Clear the embedding cache
     */
    // Complexity: O(1) — hash/map lookup
    clearCache() {
        this.cache.clear();
        console.log('[EmbeddingEngine] 🗑️ Cache cleared');
    }
    /**
     * Preload texts into cache
     */
    // Complexity: O(1) — hash/map lookup
    async preloadCache(texts) {
        console.log(`[EmbeddingEngine] ⏳ Preloading ${texts.length} texts into cache...`);
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.embedBatch(texts);
        console.log(`[EmbeddingEngine] ✅ Preloaded ${texts.length} embeddings`);
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // STATISTICS
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Get engine statistics
     */
    // Complexity: O(1)
    getStats() {
        const totalRequests = this.stats.embeddings + this.stats.cacheHits;
        return {
            isReady: this.isReady,
            embeddings: this.stats.embeddings,
            cacheHits: this.stats.cacheHits,
            cacheSize: this.cache.size,
            avgTimeMs: this.stats.embeddings > 0
                ? Math.round(this.stats.totalTimeMs / this.stats.embeddings)
                : 0,
            loadTimeMs: this.stats.loadTimeMs,
            hitRate: totalRequests > 0
                ? Math.round((this.stats.cacheHits / totalRequests) * 100)
                : 0,
        };
    }
}
// ═══════════════════════════════════════════════════════════════════════════════
// FACTORY FUNCTION
// ═══════════════════════════════════════════════════════════════════════════════
let embeddingEngineInstance = null;
/**
 * Get or create the singleton embedding engine
 */
export async function getEmbeddingEngine() {
    if (!embeddingEngineInstance) {
        embeddingEngineInstance = new EmbeddingEngine();
        // SAFETY: async operation — wrap in try-catch for production resilience
        await embeddingEngineInstance.load();
    }
    return embeddingEngineInstance;
}
/**
 * Create embed function for PineconeContextBridge
 */
export function createEmbedFunction(engine) {
    return (text) => engine.embed(text);
}
export default EmbeddingEngine;
//# sourceMappingURL=EmbeddingEngine.js.map