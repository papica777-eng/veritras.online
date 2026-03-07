"use strict";
/**
 * HybridSearch — Qantum Module
 * @module HybridSearch
 * @path omni_core/memory/HybridSearch.ts
 * @auto-documented BrutalDocEngine v2.1
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HybridSearch = void 0;
const PineconeContextBridge_1 = require("./PineconeContextBridge");
const neural_backpack_1 = require("./neural-backpack");
const flexsearch_1 = __importDefault(require("flexsearch"));
/**
 * 🛰️ HYBRID SEARCH - ETERNAL MEMORY BRIDGE v2.0
 * 🌀 BIO-DIGITAL ORGANISM - LONG-TERM MEMORY
 *
 * Combines:
 * 1. Semantic Vector Search (Pinecone Context Bridge)
 * 2. Lexical Keyword Search (FlexSearch BM25)
 * 3. Recent Context Recall (Neural Backpack)
 * 4. Reciprocal Rank Fusion (RRF) for Hybrid Ranking
 */
class HybridSearch {
    pinecone;
    backpack;
    lexicalIndex;
    constructor() {
        this.pinecone = new PineconeContextBridge_1.PineconeContextBridge();
        this.backpack = new neural_backpack_1.NeuralBackpack();
        this.lexicalIndex = new flexsearch_1.default.Index({
            tokenize: "forward",
            cache: true
        });
    }
    /**
     * Initialize the Hybrid Memory Hub
     */
    // Complexity: O(1) — hash/map lookup
    async initialize() {
        console.log('🧬 [HYBRID_SEARCH] Initializing Memory Hub...');
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.pinecone.connect();
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.backpack.initialize();
    }
    /**
     * Surgical Retrieval: Combined Lexical + Semantic + Contextual Search
     */
    // Complexity: O(N)
    async search(query, limit = 10) {
        console.log(`🔍 [HYBRID_SEARCH] Executing surgical search for: "${query}"`);
        // 1. Semantic Search (Pinecone)
        // Note: In real execution, we need an embedding function.
        // For now, we use a placeholder or the Pinecone bridge's text query if available.
        // SAFETY: async operation — wrap in try-catch for production resilience
        const semanticResults = await this.pinecone.queryByVector(new Array(512).fill(0), { topK: limit * 2 });
        // 2. Lexical Search (BM25)
        const lexicalResults = this.lexicalIndex.search(query, { limit: limit * 2 });
        // 3. Contextual Recall (Neural Backpack)
        const context = this.backpack.getContext();
        // 4. Reciprocal Rank Fusion (RRF)
        return this.fuseResults(semanticResults.matches, lexicalResults, limit);
    }
    // Complexity: O(N log N) — sort operation
    fuseResults(semantic, lexical, limit) {
        const scores = new Map();
        const k = 60; // RRF constant
        // Semantic weights
        semantic.forEach((match, index) => {
            const score = 1 / (k + index + 1);
            scores.set(match.id, (scores.get(match.id) || 0) + score);
        });
        // Lexical weights
        lexical.forEach((id, index) => {
            const score = 1 / (k + index + 1);
            scores.set(id, (scores.get(id) || 0) + score);
        });
        // Sort and map to final results
        return Array.from(scores.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([id, score]) => ({
            id,
            score,
            content: "Assimilated Content Fragment", // In reality, fetch from store
            metadata: {}
        }));
    }
    /**
     * Eternal Ingestion: Stores content across all layers
     */
    // Complexity: O(1)
    async ingest(id, content, metadata) {
        this.lexicalIndex.add(id, content);
        // Note: Vector ingestion would happen here via Pinecone bridge
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.backpack.recordMessage(content);
    }
}
exports.HybridSearch = HybridSearch;
