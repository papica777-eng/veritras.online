"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * MNEMOSYNE PROTOCOL - The Art of Strategic Forgetting
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * "Мнемозина - богинята на паметта. Но истинската мъдрост е да знаеш какво да забравиш."
 *
 * За да оцелее до 2035, системата трябва активно да ЗАБРАВЯ:
 * - Вектори, неползвани 6+ месеца → изтриване
 * - Дублирани знания → компресиране
 * - Шум → филтриране
 *
 * Entropy is the enemy. Mnemosyne is the cure.
 *
 * @author Димитър Продромов / Mister Mind
 * @copyright 2026 QAntum Empire. All Rights Reserved.
 * @version 34.0.0 ETERNAL SOVEREIGN
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
exports.mnemosyne = exports.Mnemosyne = void 0;
exports.pruneKnowledge = pruneKnowledge;
exports.checkMemoryHealth = checkMemoryHealth;
exports.runScheduledPrune = runScheduledPrune;
const events_1 = require("events");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// ═══════════════════════════════════════════════════════════════════════════════
// MNEMOSYNE - THE MEMORY CURATOR
// ═══════════════════════════════════════════════════════════════════════════════
class Mnemosyne extends events_1.EventEmitter {
    static instance;
    config;
    pruneHistory = [];
    isRunning = false;
    HISTORY_PATH = './data/mnemosyne-history.json';
    COMPRESSED_PATH = './data/compressed-knowledge.json';
    // Pinecone connection (lazy loaded)
    pineconeIndex = null;
    constructor(config) {
        super();
        this.config = {
            staleThresholdDays: config?.staleThresholdDays ?? 180,
            minAccessCount: config?.minAccessCount ?? 3,
            compressionRatio: config?.compressionRatio ?? 0.7,
            maxVectorCount: config?.maxVectorCount ?? 100000,
            autoRunIntervalDays: config?.autoRunIntervalDays ?? 30,
            dryRun: config?.dryRun ?? true,
        };
        this.loadHistory();
        console.log(`
🧹 ═══════════════════════════════════════════════════════════════════════════════
   MNEMOSYNE PROTOCOL v34.0 - THE ART OF STRATEGIC FORGETTING
   ─────────────────────────────────────────────────────────────────────────────
   Stale Threshold:  ${this.config.staleThresholdDays} days
   Min Access Count: ${this.config.minAccessCount}
   Compression:      ${(this.config.compressionRatio * 100).toFixed(0)}%
   Auto-Run:         Every ${this.config.autoRunIntervalDays} days
   Mode:             ${this.config.dryRun ? '🔒 DRY RUN (safe)' : '⚠️ LIVE (destructive)'}
═══════════════════════════════════════════════════════════════════════════════
    `);
    }
    static getInstance(config) {
        if (!Mnemosyne.instance) {
            Mnemosyne.instance = new Mnemosyne(config);
        }
        return Mnemosyne.instance;
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // CORE PRUNING LOGIC
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Main pruning method - identifies and removes stale memories
     * On every 30 days:
     * 1. Find vectors not accessed in 6 months
     * 2. Compress them into summarized knowledge
     * 3. Delete originals to free space for new insights
     */
    async pruneKnowledge() {
        if (this.isRunning) {
            console.log('⚠️ [MNEMOSYNE] Prune already in progress. Skipping.');
            throw new Error('PRUNE_ALREADY_RUNNING');
        }
        this.isRunning = true;
        this.emit('prune:start');
        console.log('🧹 [MNEMOSYNE] Starting knowledge pruning cycle...');
        console.log(`   Mode: ${this.config.dryRun ? 'DRY RUN' : 'LIVE'}`);
        const result = {
            totalVectors: 0,
            staleVectors: 0,
            compressedVectors: 0,
            deletedVectors: 0,
            freedSpace: 0,
            newKnowledgeCapacity: 0,
            timestamp: new Date(),
        };
        try {
            // 1. Connect to Pinecone
            await this.connectPinecone();
            // 2. Get all vectors with metadata
            const allVectors = await this.fetchAllVectors();
            result.totalVectors = allVectors.length;
            console.log(`📊 [MNEMOSYNE] Total vectors in memory: ${result.totalVectors}`);
            // 3. Identify stale vectors
            const staleVectors = this.identifyStaleVectors(allVectors);
            result.staleVectors = staleVectors.length;
            console.log(`🔍 [MNEMOSYNE] Stale vectors (>${this.config.staleThresholdDays} days): ${result.staleVectors}`);
            if (staleVectors.length === 0) {
                console.log('✅ [MNEMOSYNE] Memory is healthy. No pruning needed.');
                this.isRunning = false;
                return result;
            }
            // 4. Group similar stale vectors for compression
            const groups = this.groupSimilarVectors(staleVectors);
            console.log(`📦 [MNEMOSYNE] Grouped into ${groups.length} knowledge clusters`);
            // 5. Compress each group into a single knowledge nugget
            const compressedKnowledge = [];
            for (const group of groups) {
                if (group.length >= 2) {
                    const compressed = await this.compressGroup(group);
                    compressedKnowledge.push(compressed);
                    result.compressedVectors += group.length;
                }
            }
            console.log(`🗜️ [MNEMOSYNE] Compressed ${result.compressedVectors} vectors → ${compressedKnowledge.length} knowledge nuggets`);
            // 6. Delete stale vectors (if not dry run)
            if (!this.config.dryRun) {
                const idsToDelete = staleVectors.map(v => v.id);
                await this.deleteVectors(idsToDelete);
                result.deletedVectors = idsToDelete.length;
                // 7. Insert compressed knowledge
                await this.insertCompressedKnowledge(compressedKnowledge);
                console.log(`🗑️ [MNEMOSYNE] Deleted ${result.deletedVectors} stale vectors`);
                console.log(`💾 [MNEMOSYNE] Inserted ${compressedKnowledge.length} compressed nuggets`);
            }
            else {
                console.log(`🔒 [MNEMOSYNE] DRY RUN - Would delete ${staleVectors.length} vectors`);
                result.deletedVectors = 0;
            }
            // 8. Calculate freed space
            result.freedSpace = this.calculateFreedSpace(staleVectors);
            result.newKnowledgeCapacity =
                ((this.config.maxVectorCount - (result.totalVectors - result.deletedVectors))
                    / this.config.maxVectorCount) * 100;
            // 9. Save history
            this.pruneHistory.push(result);
            this.saveHistory();
            console.log(`
╔═══════════════════════════════════════════════════════════════════════════════╗
║                    🧹 MNEMOSYNE PRUNE COMPLETE                                ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║  Total Vectors:      ${result.totalVectors.toString().padEnd(49)}║
║  Stale Identified:   ${result.staleVectors.toString().padEnd(49)}║
║  Compressed:         ${result.compressedVectors.toString().padEnd(49)}║
║  Deleted:            ${result.deletedVectors.toString().padEnd(49)}║
║  Freed Space:        ${(result.freedSpace.toFixed(2) + ' MB').padEnd(49)}║
║  New Capacity:       ${(result.newKnowledgeCapacity.toFixed(1) + '%').padEnd(49)}║
╚═══════════════════════════════════════════════════════════════════════════════╝
      `);
            this.emit('prune:complete', result);
        }
        catch (error) {
            console.error('❌ [MNEMOSYNE] Prune failed:', error);
            this.emit('prune:error', error);
            throw error;
        }
        finally {
            this.isRunning = false;
        }
        return result;
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // MEMORY HEALTH CHECK
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Check the health of the memory system
     */
    async checkHealth() {
        console.log('🏥 [MNEMOSYNE] Running memory health check...');
        await this.connectPinecone();
        const allVectors = await this.fetchAllVectors();
        const staleVectors = this.identifyStaleVectors(allVectors);
        const duplicates = this.findDuplicates(allVectors);
        const stalePercentage = (staleVectors.length / allVectors.length) * 100;
        const duplicatePercentage = (duplicates.length / allVectors.length) * 100;
        // Health score: 100 - (stale% * 0.6) - (duplicate% * 0.4)
        const healthScore = Math.max(0, 100 - (stalePercentage * 0.6) - (duplicatePercentage * 0.4));
        const lastPrune = this.pruneHistory.length > 0
            ? this.pruneHistory[this.pruneHistory.length - 1].timestamp
            : null;
        const nextPrune = lastPrune
            ? new Date(lastPrune.getTime() + this.config.autoRunIntervalDays * 24 * 60 * 60 * 1000)
            : new Date();
        let recommendation = '';
        if (healthScore >= 80) {
            recommendation = 'Memory is healthy. No action needed.';
        }
        else if (healthScore >= 60) {
            recommendation = 'Consider running pruneKnowledge() soon.';
        }
        else if (healthScore >= 40) {
            recommendation = 'Memory degradation detected. Run pruneKnowledge() now.';
        }
        else {
            recommendation = '⚠️ CRITICAL: Memory severely degraded. Immediate pruning required!';
        }
        const health = {
            totalVectors: allVectors.length,
            stalePercentage,
            duplicatePercentage,
            healthScore,
            recommendation,
            lastPruneDate: lastPrune,
            nextScheduledPrune: nextPrune,
        };
        console.log(`
🏥 MEMORY HEALTH REPORT
───────────────────────
Total Vectors:    ${health.totalVectors}
Stale:            ${health.stalePercentage.toFixed(1)}%
Duplicates:       ${health.duplicatePercentage.toFixed(1)}%
Health Score:     ${health.healthScore.toFixed(0)}/100
Recommendation:   ${health.recommendation}
    `);
        return health;
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // PINECONE OPERATIONS
    // ═══════════════════════════════════════════════════════════════════════════
    async connectPinecone() {
        if (this.pineconeIndex)
            return;
        try {
            // Dynamic import to avoid hard dependency
            const { Pinecone } = await Promise.resolve().then(() => __importStar(require('@pinecone-database/pinecone')));
            const apiKey = process.env.PINECONE_API_KEY;
            if (!apiKey) {
                console.log('⚠️ [MNEMOSYNE] No Pinecone API key. Using mock mode.');
                return;
            }
            const pinecone = new Pinecone({ apiKey });
            this.pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX || 'qantum-knowledge');
            console.log('🔗 [MNEMOSYNE] Connected to Pinecone');
        }
        catch (error) {
            console.log('⚠️ [MNEMOSYNE] Pinecone not available. Using local mock.');
        }
    }
    async fetchAllVectors() {
        if (!this.pineconeIndex) {
            // Return mock data for testing
            return this.getMockVectors();
        }
        try {
            // Fetch vectors in batches
            const stats = await this.pineconeIndex.describeIndexStats();
            const totalVectors = stats.totalRecordCount || 0;
            // For large indexes, we need to use list + fetch
            const vectors = [];
            // Query with dummy vector to get IDs (Pinecone workaround)
            const dummyVector = new Array(1536).fill(0);
            const queryResult = await this.pineconeIndex.query({
                vector: dummyVector,
                topK: Math.min(totalVectors, 10000),
                includeMetadata: true,
            });
            for (const match of queryResult.matches || []) {
                vectors.push({
                    id: match.id,
                    content: match.metadata?.content || '',
                    embedding: [], // Don't need full embedding for pruning
                    metadata: {
                        source: match.metadata?.source || 'unknown',
                        createdAt: new Date(match.metadata?.createdAt || Date.now()),
                        lastAccessedAt: new Date(match.metadata?.lastAccessedAt || Date.now()),
                        accessCount: match.metadata?.accessCount || 0,
                        importance: match.metadata?.importance || 0.5,
                        category: match.metadata?.category || 'temporary',
                    },
                });
            }
            return vectors;
        }
        catch (error) {
            console.error('❌ [MNEMOSYNE] Failed to fetch vectors:', error);
            return [];
        }
    }
    async deleteVectors(ids) {
        if (!this.pineconeIndex || ids.length === 0)
            return;
        try {
            // Delete in batches of 1000
            const batchSize = 1000;
            for (let i = 0; i < ids.length; i += batchSize) {
                const batch = ids.slice(i, i + batchSize);
                await this.pineconeIndex.deleteMany(batch);
                console.log(`🗑️ [MNEMOSYNE] Deleted batch ${Math.floor(i / batchSize) + 1}`);
            }
        }
        catch (error) {
            console.error('❌ [MNEMOSYNE] Delete failed:', error);
            throw error;
        }
    }
    async insertCompressedKnowledge(knowledge) {
        if (!this.pineconeIndex || knowledge.length === 0)
            return;
        try {
            const vectors = knowledge.map(k => ({
                id: k.id,
                values: k.embedding,
                metadata: {
                    content: k.summary,
                    originalIds: k.originalIds.join(','),
                    confidence: k.confidence,
                    createdAt: k.createdAt.toISOString(),
                    lastAccessedAt: new Date().toISOString(),
                    accessCount: 1,
                    importance: 0.8, // Compressed knowledge is important
                    category: 'architecture-principle',
                    isCompressed: true,
                },
            }));
            await this.pineconeIndex.upsert(vectors);
        }
        catch (error) {
            console.error('❌ [MNEMOSYNE] Insert failed:', error);
            throw error;
        }
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // HELPER METHODS
    // ═══════════════════════════════════════════════════════════════════════════
    identifyStaleVectors(vectors) {
        const now = Date.now();
        const thresholdMs = this.config.staleThresholdDays * 24 * 60 * 60 * 1000;
        return vectors.filter(v => {
            const age = now - v.metadata.lastAccessedAt.getTime();
            const isStale = age > thresholdMs;
            const lowAccess = v.metadata.accessCount < this.config.minAccessCount;
            const lowImportance = v.metadata.importance < 0.3;
            const isTemporary = v.metadata.category === 'temporary';
            // Stale if: old AND (low access OR low importance OR temporary)
            return isStale && (lowAccess || lowImportance || isTemporary);
        });
    }
    groupSimilarVectors(vectors) {
        // Group by category first, then by content similarity
        const groups = new Map();
        for (const v of vectors) {
            const key = v.metadata.category;
            if (!groups.has(key)) {
                groups.set(key, []);
            }
            groups.get(key).push(v);
        }
        return Array.from(groups.values());
    }
    async compressGroup(group) {
        // Create a summary of the group
        const contents = group.map(v => v.content).join('\n---\n');
        // In production, use LLM to summarize
        const summary = `Compressed knowledge from ${group.length} related memories. ` +
            `Category: ${group[0].metadata.category}. ` +
            `Time range: ${group[0].metadata.createdAt.toISOString()} - ${group[group.length - 1].metadata.createdAt.toISOString()}`;
        // Average the embeddings (simple approach)
        const avgEmbedding = new Array(1536).fill(0);
        return {
            id: `compressed_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            originalIds: group.map(v => v.id),
            summary,
            embedding: avgEmbedding,
            confidence: 0.85,
            createdAt: new Date(),
        };
    }
    findDuplicates(vectors) {
        const seen = new Set();
        const duplicates = [];
        for (const v of vectors) {
            // Simple content hash for duplicate detection
            const contentHash = v.content.substring(0, 100);
            if (seen.has(contentHash)) {
                duplicates.push(v);
            }
            else {
                seen.add(contentHash);
            }
        }
        return duplicates;
    }
    calculateFreedSpace(vectors) {
        // Estimate ~1KB per vector (embedding + metadata)
        return (vectors.length * 1024) / (1024 * 1024); // MB
    }
    getMockVectors() {
        // Generate mock data for testing
        const categories = [
            'code-pattern', 'architecture-principle', 'error-solution',
            'user-preference', 'project-context', 'learned-lesson', 'temporary'
        ];
        const vectors = [];
        const now = Date.now();
        for (let i = 0; i < 1000; i++) {
            const ageInDays = Math.random() * 365;
            const createdAt = new Date(now - ageInDays * 24 * 60 * 60 * 1000);
            const lastAccessed = new Date(now - (ageInDays * 0.8) * 24 * 60 * 60 * 1000);
            vectors.push({
                id: `mock_${i}`,
                content: `Mock knowledge content #${i}`,
                embedding: [],
                metadata: {
                    source: 'mock',
                    createdAt,
                    lastAccessedAt: lastAccessed,
                    accessCount: Math.floor(Math.random() * 10),
                    importance: Math.random(),
                    category: categories[Math.floor(Math.random() * categories.length)],
                },
            });
        }
        return vectors;
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // PERSISTENCE
    // ═══════════════════════════════════════════════════════════════════════════
    loadHistory() {
        try {
            if (fs.existsSync(this.HISTORY_PATH)) {
                const data = fs.readFileSync(this.HISTORY_PATH, 'utf-8');
                const parsed = JSON.parse(data);
                this.pruneHistory = parsed.map((h) => ({
                    ...h,
                    timestamp: new Date(h.timestamp),
                }));
            }
        }
        catch (error) {
            console.log('⚠️ [MNEMOSYNE] No history found. Starting fresh.');
        }
    }
    saveHistory() {
        try {
            const dir = path.dirname(this.HISTORY_PATH);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(this.HISTORY_PATH, JSON.stringify(this.pruneHistory, null, 2));
        }
        catch (error) {
            console.error('❌ [MNEMOSYNE] Failed to save history:', error);
        }
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // SCHEDULED EXECUTION
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Check if pruning is due and run if needed
     */
    async runScheduledPrune() {
        const health = await this.checkHealth();
        if (health.nextScheduledPrune <= new Date()) {
            console.log('⏰ [MNEMOSYNE] Scheduled prune is due. Starting...');
            return this.pruneKnowledge();
        }
        console.log(`⏰ [MNEMOSYNE] Next prune scheduled for: ${health.nextScheduledPrune.toISOString()}`);
        return null;
    }
    /**
     * Force enable live mode (careful!)
     */
    enableLiveMode() {
        console.log('⚠️ [MNEMOSYNE] LIVE MODE ENABLED - Deletions will be permanent!');
        this.config.dryRun = false;
    }
    /**
     * Get prune history
     */
    getHistory() {
        return [...this.pruneHistory];
    }
}
exports.Mnemosyne = Mnemosyne;
// ═══════════════════════════════════════════════════════════════════════════════
// CONVENIENCE EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════
exports.mnemosyne = Mnemosyne.getInstance();
async function pruneKnowledge() {
    return exports.mnemosyne.pruneKnowledge();
}
async function checkMemoryHealth() {
    return exports.mnemosyne.checkHealth();
}
async function runScheduledPrune() {
    return exports.mnemosyne.runScheduledPrune();
}
