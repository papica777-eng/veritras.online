"use strict";
/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                              ║
 * ║           Q A N T U M   O R C H E S T R A T O R                               ║
 * ║        ЦЕНТРАЛНА ТОЧКА ЗА КООРДИНАЦИЯ НА ВСИЧКИ DAEMON МОДУЛИ                 ║
 * ║                                                                              ║
 * ║  "Едно ядро. Безкраен контекст. Вечна памет."                                ║
 * ║  "One core. Infinite context. Eternal memory."                               ║
 * ║                                                                              ║
 * ║  Purpose: Unified entry point for all QAntum daemon capabilities:            ║
 * ║           - SupremeDaemon (orchestration)                                    ║
 * ║           - NeuralCoreMagnet (data collection)                               ║
 * ║           - AutonomousThought (AI decisions)                                 ║
 * ║           - SupremeMeditation (deep analysis)                                ║
 * ║           - GenesisBridgeAdapter (axiom/reality persistence)                 ║
 * ║                                                                              ║
 * ║  © 2025-2026 QAntum Empire | Dimitar Prodromov                               ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.QAntumOrchestrator = void 0;
exports.createQAntumOrchestrator = createQAntumOrchestrator;
exports.getQAntumOrchestrator = getQAntumOrchestrator;
exports.resetGlobalOrchestrator = resetGlobalOrchestrator;
const events_1 = require("events");
const crypto_1 = require("crypto");
const SupremeDaemon_js_1 = require("./SupremeDaemon.js");
const NeuralCoreMagnet_js_1 = require("./NeuralCoreMagnet.js");
const AutonomousThought_js_1 = require("./AutonomousThought.js");
const SupremeMeditation_js_1 = require("./SupremeMeditation.js");
const GenesisBridgeAdapter_1 = require("../../../../scripts/qantum/GenesisBridgeAdapter");
// ═══════════════════════════════════════════════════════════════════════════════
// QAntum ORCHESTRATOR CLASS
// ═══════════════════════════════════════════════════════════════════════════════
class QAntumOrchestrator extends events_1.EventEmitter {
    // Core systems
    bridge;
    daemon = null;
    magnet = null;
    thought = null;
    meditation = null;
    genesis = null;
    // State
    sessionId;
    state = 'dormant';
    startTime = null;
    debug;
    // Config storage for lazy init
    config;
    // Metrics
    metrics = {
        contextQueries: 0,
        decisionsGenerated: 0,
        meditationSessions: 0,
        axiomsStored: 0,
        realitiesStored: 0,
        fragmentsCollected: 0,
    };
    constructor(bridge, config = {}) {
        super();
        this.bridge = bridge;
        this.config = config;
        this.sessionId = config.sessionId || `QAntum-${(0, crypto_1.randomUUID)().slice(0, 8)}`;
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
    // Complexity: O(1)
    async start() {
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
        }
        catch (error) {
            this.state = 'degraded';
            this.log('error', `Failed to start: ${error}`);
            this.emit('error', error);
            throw error;
        }
    }
    /**
     * Stop all daemon modules
     */
    // Complexity: O(1)
    async stop() {
        if (this.state === 'dormant')
            return;
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
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.bridge.close();
            this.state = 'dormant';
            this.startTime = null;
            this.log('info', '💤 QAntum Orchestrator dormant');
            this.emit('stopped');
        }
        catch (error) {
            this.log('error', `Error during shutdown: ${error}`);
            throw error;
        }
    }
    /**
     * Initialize all modules
     */
    // Complexity: O(1)
    async initializeModules() {
        const { config } = this;
        // 1. SupremeDaemon
        this.log('debug', 'Initializing SupremeDaemon...');
        // SAFETY: async operation — wrap in try-catch for production resilience
        this.daemon = await (0, SupremeDaemon_js_1.awakenSupremeDaemon)(config.daemonConfig);
        // 2. NeuralCoreMagnet
        this.log('debug', 'Initializing NeuralCoreMagnet...');
        this.magnet = (0, NeuralCoreMagnet_js_1.createNeuralCoreMagnet)(this.bridge, config.magnetConfig);
        this.magnet.start();
        // 3. AutonomousThought
        this.log('debug', 'Initializing AutonomousThought...');
        this.thought = (0, AutonomousThought_js_1.createAutonomousThought)(this.bridge, config.thoughtConfig);
        // 4. SupremeMeditation
        this.log('debug', 'Initializing SupremeMeditation...');
        this.meditation = (0, SupremeMeditation_js_1.createSupremeMeditation)(this.bridge, config.meditationConfig);
        // 5. GenesisBridgeAdapter
        this.log('debug', 'Initializing GenesisBridgeAdapter...');
        this.genesis = (0, GenesisBridgeAdapter_1.createGenesisBridgeAdapter)(this.bridge, config.genesisConfig);
        this.genesis.start();
    }
    /**
     * Wire up event listeners for metrics
     */
    // Complexity: O(1)
    wireEventListeners() {
        if (this.genesis) {
            this.genesis.on('axiomStored', (data) => {
                this.metrics.axiomsStored++;
                this.emit('axiomStored', data);
            });
            this.genesis.on('realityStored', (data) => {
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
    // Complexity: O(1)
    async queryContext(query, options) {
        const start = Date.now();
        this.metrics.contextQueries++;
        // SAFETY: async operation — wrap in try-catch for production resilience
        const result = await this.bridge.query(query, {
            topK: options?.topK ?? 10,
            minScore: options?.minScore ?? 0.5,
            filter: options?.filter,
            sessionId: this.sessionId,
        });
        this.emit('contextRetrieved', { query, resultCount: result.matches.length });
        return {
            results: result.matches.map((m) => ({
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
    // Complexity: O(1)
    async makeDecision(question, type, options) {
        if (!this.thought) {
            throw new Error('AutonomousThought not initialized. Call start() first.');
        }
        // SAFETY: async operation — wrap in try-catch for production resilience
        const result = await this.thought.think(question, type || AutonomousThought_js_1.ThoughtType.TACTICAL, {
            depth: options?.depth ?? 3,
        });
        this.metrics.decisionsGenerated++;
        this.emit('decision', { question, type, confidence: result.confidence });
        return {
            decision: result.decision,
            reasoning: result.reasoning.steps.map((s) => s.description),
            confidence: result.confidence,
            alternatives: result.reasoning.alternativesConsidered,
            historicalContext: result.context.historicalPrecedents.map((p) => p.situation),
        };
    }
    /**
     * Quick decision without deep analysis
     */
    // Complexity: O(1)
    async quickDecision(question) {
        if (!this.thought) {
            throw new Error('AutonomousThought not initialized. Call start() first.');
        }
        // SAFETY: async operation — wrap in try-catch for production resilience
        const result = await this.thought.quickDecision(question);
        this.metrics.decisionsGenerated++;
        return {
            answer: result.action,
            confidence: result.outcome === AutonomousThought_js_1.DecisionOutcome.EXECUTE ? 0.8 : 0.5,
        };
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // MEDITATION (Unified Interface)
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Deep meditation on a topic
     */
    // Complexity: O(1)
    async meditate(topic, type, options) {
        if (!this.meditation) {
            throw new Error('SupremeMeditation not initialized. Call start() first.');
        }
        // SAFETY: async operation — wrap in try-catch for production resilience
        const result = await this.meditation.meditate(topic, type || SupremeMeditation_js_1.MeditationType.KNOWLEDGE_SYNTHESIS, options);
        this.metrics.meditationSessions++;
        this.emit('meditation', { topic, type, insightCount: result.insights.length });
        return {
            patterns: result.patterns.map((p) => ({ name: p.name, description: p.description })),
            anomalies: result.anomalies.map((a) => ({
                description: a.description,
                severity: a.severity,
            })),
            insights: result.insights.map((i) => ({
                title: i.title,
                description: i.description,
                actionable: i.actionable,
            })),
            recommendations: result.recommendations.map((r) => ({
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
    // Complexity: O(N) — linear scan
    async scanPatterns(topic) {
        if (!this.meditation) {
            throw new Error('SupremeMeditation not initialized. Call start() first.');
        }
        // SAFETY: async operation — wrap in try-catch for production resilience
        const patterns = await this.meditation.scanPatterns(topic);
        return patterns.map((p) => ({
            name: p.name,
            description: p.description,
            frequency: p.frequency,
        }));
    }
    /**
     * System health check
     */
    // Complexity: O(N) — linear scan
    async systemHealthCheck() {
        if (!this.meditation) {
            throw new Error('SupremeMeditation not initialized. Call start() first.');
        }
        // SAFETY: async operation — wrap in try-catch for production resilience
        const result = await this.meditation.systemHealthCheck();
        return {
            healthy: result.anomalies.length === 0,
            issues: result.anomalies.map((a) => a.description),
            score: Math.max(0, 1 - (result.anomalies.length * 0.1)),
        };
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // DATA COLLECTION (Unified Interface)
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Collect data fragment for eternal storage
     */
    // Complexity: O(1)
    collect(type, content, metadata) {
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
    // Complexity: O(1)
    async flush() {
        if (this.magnet) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.magnet.flush();
        }
        if (this.genesis) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.genesis.flush();
        }
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // GENESIS (Unified Interface)
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Store an axiom
     */
    // Complexity: O(1)
    async storeAxiom(axiom) {
        if (!this.genesis) {
            throw new Error('GenesisBridgeAdapter not initialized. Call start() first.');
        }
        return this.genesis.storeAxiom(axiom);
    }
    /**
     * Store a generated reality
     */
    // Complexity: O(1)
    async storeReality(reality) {
        if (!this.genesis) {
            throw new Error('GenesisBridgeAdapter not initialized. Call start() first.');
        }
        return this.genesis.storeReality(reality);
    }
    /**
     * Get context for axiom generation
     */
    // Complexity: O(1)
    async getAxiomGenerationContext(type, statement) {
        if (!this.genesis) {
            throw new Error('GenesisBridgeAdapter not initialized. Call start() first.');
        }
        return this.genesis.getAxiomGenerationContext(type, statement);
    }
    /**
     * Analyze axiom before generation
     */
    // Complexity: O(1)
    async analyzeAxiomBeforeGeneration(proposedAxiom) {
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
    // Complexity: O(1)
    getStatus() {
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
    // Complexity: O(1)
    getBridge() {
        return this.bridge;
    }
    /**
     * Get the Daemon instance
     */
    // Complexity: O(1)
    getDaemon() {
        return this.daemon;
    }
    /**
     * Get session ID
     */
    // Complexity: O(1)
    getSessionId() {
        return this.sessionId;
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // UTILITY
    // ═══════════════════════════════════════════════════════════════════════════
    // Complexity: O(1)
    log(level, message) {
        if (!this.debug && level === 'debug')
            return;
        const prefix = `[QAntum:${this.sessionId.slice(-4)}]`;
        switch (level) {
            case 'debug':
                console.debug(`${prefix} ${message}`);
                break;
            case 'info':
                console.log(`${prefix} ${message}`);
                break;
            case 'warn':
                console.warn(`${prefix} ⚠️ ${message}`);
                break;
            case 'error':
                console.error(`${prefix} ❌ ${message}`);
                break;
        }
    }
}
exports.QAntumOrchestrator = QAntumOrchestrator;
// ═══════════════════════════════════════════════════════════════════════════════
// FACTORY & SINGLETON
// ═══════════════════════════════════════════════════════════════════════════════
let globalOrchestrator = null;
/**
 * Create a new QAntum Orchestrator instance
 */
function createQAntumOrchestrator(bridge, config) {
    return new QAntumOrchestrator(bridge, config);
}
/**
 * Get or create the global QAntum Orchestrator singleton
 */
function getQAntumOrchestrator(bridge, config) {
    if (!globalOrchestrator && !bridge) {
        throw new Error('Must provide BridgeSystem on first call to getQAntumOrchestrator');
    }
    if (!globalOrchestrator && bridge) {
        globalOrchestrator = createQAntumOrchestrator(bridge, config);
    }
    return globalOrchestrator;
}
/**
 * Reset the global orchestrator (for testing)
 */
async function resetGlobalOrchestrator() {
    if (globalOrchestrator) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await globalOrchestrator.stop();
        globalOrchestrator = null;
    }
}
exports.default = QAntumOrchestrator;
