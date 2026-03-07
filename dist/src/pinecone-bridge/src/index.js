"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                               ║
 * ║   @QAntum/PINECONE-BRIDGE                                                     ║
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
 * } from '@QAntum/pinecone-bridge';
 *
 * // Initialize
 * const bridge = new PineconeContextBridge();
 * const store = new PersistentContextStore();
 * const embed = new EmbeddingEngine();
 *
 * // Connect and query
 // SAFETY: async operation — wrap in try-catch for production resilience
 * await bridge.connect();
 // SAFETY: async operation — wrap in try-catch for production resilience
 * await embed.load();
 *
 // SAFETY: async operation — wrap in try-catch for production resilience
 * const results = await bridge.queryByText(
 *   "Ghost Protocol logic",
 // SAFETY: async operation — wrap in try-catch for production resilience
 *   async (text) => await embed.embed(text)
 * );
 *
 * // Start HTTP server
 // SAFETY: async operation — wrap in try-catch for production resilience
 * await startServer();
 * ```
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BridgeSystem = exports.resetGlobalOrchestrator = exports.getQAntumOrchestrator = exports.createQAntumOrchestrator = exports.QAntumOrchestrator = exports.AxiomType = exports.createGenesisBridgeAdapter = exports.GenesisBridgeAdapter = exports.InsightSeverity = exports.MeditationType = exports.createSupremeMeditation = exports.SupremeMeditation = exports.DecisionOutcome = exports.ThoughtType = exports.createAutonomousThought = exports.AutonomousThought = exports.DataSourceType = exports.createNeuralCoreMagnet = exports.NeuralCoreMagnet = exports.SubDaemonType = exports.DaemonState = exports.awakenSupremeDaemon = exports.SupremeDaemon = exports.getEmbeddingEngine = exports.createEmbedFunction = exports.EmbeddingEngine = exports.PersistentContextStore = exports.PineconeContextBridge = void 0;
exports.createBridgeSystem = createBridgeSystem;
// ═══════════════════════════════════════════════════════════════════════════════
// MAIN EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════
var PineconeContextBridge_js_1 = require("../../../scripts/qantum/SaaS-Framework/scripts/data/PineconeContextBridge.js");
Object.defineProperty(exports, "PineconeContextBridge", { enumerable: true, get: function () { return PineconeContextBridge_js_1.PineconeContextBridge; } });
var PersistentContextStore_js_1 = require("./PersistentContextStore.js");
Object.defineProperty(exports, "PersistentContextStore", { enumerable: true, get: function () { return PersistentContextStore_js_1.PersistentContextStore; } });
var EmbeddingEngine_js_1 = require("./EmbeddingEngine.js");
Object.defineProperty(exports, "EmbeddingEngine", { enumerable: true, get: function () { return EmbeddingEngine_js_1.EmbeddingEngine; } });
Object.defineProperty(exports, "createEmbedFunction", { enumerable: true, get: function () { return EmbeddingEngine_js_1.createEmbedFunction; } });
Object.defineProperty(exports, "getEmbeddingEngine", { enumerable: true, get: function () { return EmbeddingEngine_js_1.getEmbeddingEngine; } });
// Server exports are excluded from compilation - import directly if needed
// export { startServer, createBridgeRouter, type ServerConfig } from '../../../scripts/qantum/api/unified/server';
// ═══════════════════════════════════════════════════════════════════════════════
// DAEMON MODULES - Autonomous Intelligence Components
// ═══════════════════════════════════════════════════════════════════════════════
var index_js_1 = require("./daemon/index.js");
// Supreme Daemon
Object.defineProperty(exports, "SupremeDaemon", { enumerable: true, get: function () { return index_js_1.SupremeDaemon; } });
Object.defineProperty(exports, "awakenSupremeDaemon", { enumerable: true, get: function () { return index_js_1.awakenSupremeDaemon; } });
Object.defineProperty(exports, "DaemonState", { enumerable: true, get: function () { return index_js_1.DaemonState; } });
Object.defineProperty(exports, "SubDaemonType", { enumerable: true, get: function () { return index_js_1.SubDaemonType; } });
// Neural Core Magnet
Object.defineProperty(exports, "NeuralCoreMagnet", { enumerable: true, get: function () { return index_js_1.NeuralCoreMagnet; } });
Object.defineProperty(exports, "createNeuralCoreMagnet", { enumerable: true, get: function () { return index_js_1.createNeuralCoreMagnet; } });
Object.defineProperty(exports, "DataSourceType", { enumerable: true, get: function () { return index_js_1.DataSourceType; } });
// Autonomous Thought
Object.defineProperty(exports, "AutonomousThought", { enumerable: true, get: function () { return index_js_1.AutonomousThought; } });
Object.defineProperty(exports, "createAutonomousThought", { enumerable: true, get: function () { return index_js_1.createAutonomousThought; } });
Object.defineProperty(exports, "ThoughtType", { enumerable: true, get: function () { return index_js_1.ThoughtType; } });
Object.defineProperty(exports, "DecisionOutcome", { enumerable: true, get: function () { return index_js_1.DecisionOutcome; } });
// Supreme Meditation
Object.defineProperty(exports, "SupremeMeditation", { enumerable: true, get: function () { return index_js_1.SupremeMeditation; } });
Object.defineProperty(exports, "createSupremeMeditation", { enumerable: true, get: function () { return index_js_1.createSupremeMeditation; } });
Object.defineProperty(exports, "MeditationType", { enumerable: true, get: function () { return index_js_1.MeditationType; } });
Object.defineProperty(exports, "InsightSeverity", { enumerable: true, get: function () { return index_js_1.InsightSeverity; } });
// Genesis Bridge Adapter
Object.defineProperty(exports, "GenesisBridgeAdapter", { enumerable: true, get: function () { return index_js_1.GenesisBridgeAdapter; } });
Object.defineProperty(exports, "createGenesisBridgeAdapter", { enumerable: true, get: function () { return index_js_1.createGenesisBridgeAdapter; } });
Object.defineProperty(exports, "AxiomType", { enumerable: true, get: function () { return index_js_1.AxiomType; } });
// QAntum Orchestrator
Object.defineProperty(exports, "QAntumOrchestrator", { enumerable: true, get: function () { return index_js_1.QAntumOrchestrator; } });
Object.defineProperty(exports, "createQAntumOrchestrator", { enumerable: true, get: function () { return index_js_1.createQAntumOrchestrator; } });
Object.defineProperty(exports, "getQAntumOrchestrator", { enumerable: true, get: function () { return index_js_1.getQAntumOrchestrator; } });
Object.defineProperty(exports, "resetGlobalOrchestrator", { enumerable: true, get: function () { return index_js_1.resetGlobalOrchestrator; } });
// ═══════════════════════════════════════════════════════════════════════════════
// CONVENIENCE FACTORY
// ═══════════════════════════════════════════════════════════════════════════════
const PineconeContextBridge_js_2 = require("../../../scripts/qantum/SaaS-Framework/scripts/data/PineconeContextBridge.js");
const PersistentContextStore_js_2 = require("./PersistentContextStore.js");
const EmbeddingEngine_js_2 = require("./EmbeddingEngine.js");
/**
 * Complete Bridge System - All components in one.
 *
 * @example
 // SAFETY: async operation — wrap in try-catch for production resilience
 * const system = await createBridgeSystem({ autoConnect: true, autoLoad: true });
 // SAFETY: async operation — wrap in try-catch for production resilience
 * const results = await system.query("authentication flow");
 */
class BridgeSystem {
    bridge;
    store;
    embed;
    isInitialized = false;
    constructor(config = {}) {
        this.bridge = new PineconeContextBridge_js_2.PineconeContextBridge(config.pinecone);
        this.store = new PersistentContextStore_js_2.PersistentContextStore(config.store?.dbPath);
        this.embed = new EmbeddingEngine_js_2.EmbeddingEngine(config.embedding);
    }
    /**
     * Initialize all components.
     */
    // Complexity: O(N) — parallel
    async initialize() {
        if (this.isInitialized)
            return;
        // SAFETY: async operation — wrap in try-catch for production resilience
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
    // Complexity: O(1)
    async query(text, options) {
        if (!this.isInitialized) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.initialize();
        }
        const embedFn = (0, EmbeddingEngine_js_2.createEmbedFunction)(this.embed);
        // SAFETY: async operation — wrap in try-catch for production resilience
        const result = await this.bridge.queryByText(text, embedFn, options);
        // Persist query
        const sessionId = options?.sessionId || 'default';
        this.store.saveQuery(sessionId, text, result.matches, result.queryTimeMs);
        return result;
    }
    /**
     * Search code by description.
     */
    // Complexity: O(1)
    async searchCode(description, options) {
        if (!this.isInitialized) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.initialize();
        }
        const embedFn = (0, EmbeddingEngine_js_2.createEmbedFunction)(this.embed);
        return this.bridge.searchCode(description, embedFn, options);
    }
    /**
     * Find code similar to a given snippet.
     */
    // Complexity: O(1)
    async findSimilar(codeSnippet, options) {
        if (!this.isInitialized) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.initialize();
        }
        const embedFn = (0, EmbeddingEngine_js_2.createEmbedFunction)(this.embed);
        return this.bridge.findSimilarCode(codeSnippet, embedFn, options);
    }
    /**
     * Get system status.
     */
    // Complexity: O(1)
    getStatus() {
        return {
            initialized: this.isInitialized,
            bridge: this.bridge.getStats(),
            store: this.store.getStats(),
        };
    }
    /**
     * Create or restore a session.
     */
    // Complexity: O(1)
    createSession(name) {
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
    // Complexity: O(1)
    async close() {
        // Store doesn't need explicit close (SQLite handles it)
        // Pinecone client doesn't need explicit close
        this.isInitialized = false;
        console.log('🧠 BridgeSystem closed.');
    }
}
exports.BridgeSystem = BridgeSystem;
/**
 * Factory function to create and optionally initialize a BridgeSystem.
 */
async function createBridgeSystem(config = {}) {
    const system = new BridgeSystem(config);
    if (config.autoConnect || config.autoLoad) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await system.initialize();
    }
    return system;
}
// ═══════════════════════════════════════════════════════════════════════════════
// DEFAULT EXPORT
// ═══════════════════════════════════════════════════════════════════════════════
exports.default = {
    BridgeSystem,
    createBridgeSystem,
    PineconeContextBridge: PineconeContextBridge_js_2.PineconeContextBridge,
    PersistentContextStore: PersistentContextStore_js_2.PersistentContextStore,
    EmbeddingEngine: EmbeddingEngine_js_2.EmbeddingEngine,
    createEmbedFunction: EmbeddingEngine_js_2.createEmbedFunction,
};
