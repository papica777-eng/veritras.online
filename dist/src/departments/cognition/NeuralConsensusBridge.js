"use strict";
/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  🔗 NEURAL CONSENSUS BRIDGE - Hybridization Layer                          ║
 * ║  QAntum Framework v2.0 - "Zero Entropy Architecture"                       ║
 * ║                                                                            ║
 * ║  Fuses 5 engines into a single cognitive substrate:                         ║
 * ║  ├─ NeuralMapEngine  → Cognitive Anchors (self-healing selectors)           ║
 * ║  ├─ EmbeddingEngine  → Vector Semantics (O(log n) similarity)              ║
 * ║  ├─ HardwareBridge   → Substrate Telemetry (adaptive wait logic)           ║
 * ║  ├─ SwarmEngine V2   → Consensus Verification (multi-agent voting)         ║
 * ║  └─ AntiTamper       → Ghost Signature (stealth DOM traversal)             ║
 * ║                                                                            ║
 * ║  Operational Mode: ABSOLUTE DETERMINISM                                    ║
 * ║  Complexity: O(log n) via Vector Search + O(1) Hardware Anchor             ║
 * ║                                                                            ║
 * ║  @module cognition/NeuralConsensusBridge                                   ║
 * ║  @version 1.0.0-QAntum
 * ║  @enterprise true                                                          ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.NeuralConsensusBridge = void 0;
exports.getNeuralConsensusBridge = getNeuralConsensusBridge;
exports.createNeuralConsensusBridge = createNeuralConsensusBridge;
const events_1 = require("events");
const neural_map_engine_1 = require("../../scripts/qantum/SaaS-Framework/scripts/OTHERS/neural-map-engine");
const EmbeddingEngine_1 = require("../pinecone-bridge/src/EmbeddingEngine");
const HardwareBridge_1 = require("../../scripts/qantum/SaaS-Framework/scripts/physics/HardwareBridge");
const anti_tamper_1 = require("../../scripts/qantum/security/anti-tamper");
const DEFAULT_CONFIG = {
    requiredConsensus: 2,
    agentTimeoutMs: 5000,
    cpuThresholdHigh: 80,
    cpuThresholdCritical: 95,
    waitMultiplierHigh: 2,
    waitMultiplierCritical: 4,
    similarityThreshold: 0.75,
    vectorCacheSize: 5000,
    enableStealth: true,
    injectHumanJitter: true,
    autoHealOnFailure: true,
    maxHealAttempts: 3,
};
// ═══════════════════════════════════════════════════════════════════════════════
// NEURAL CONSENSUS BRIDGE
// ═══════════════════════════════════════════════════════════════════════════════
class NeuralConsensusBridge extends events_1.EventEmitter {
    config;
    // ── Engine references ──
    neuralMap;
    embedding = null;
    hardware;
    antiTamper = null;
    // ── State ──
    isInitialized = false;
    currentTelemetry = {
        cpuUsage: 0,
        ramUsage: 0,
        waitMultiplier: 1,
        threatLevel: 'SAFE',
        isCompromised: false,
        stealthActive: false,
        embeddingReady: false,
        activeAgents: 0,
    };
    // ── Metrics ──
    metrics = {
        totalSearches: 0,
        consensusReached: 0,
        consensusFailed: 0,
        healingTriggered: 0,
        healingSucceeded: 0,
        averageLatencyMs: 0,
        stealthInterventions: 0,
        hardwareAdjustments: 0,
    };
    // ── Vector cache for anchor text ──
    vectorCache = new Map();
    constructor(config = {}) {
        super();
        this.config = { ...DEFAULT_CONFIG, ...config };
        this.neuralMap = (0, neural_map_engine_1.createNeuralMap)();
        this.hardware = (0, HardwareBridge_1.createHardwareBridge)({ port: 0 }); // ephemeral port
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // INITIALIZATION
    // ═══════════════════════════════════════════════════════════════════════════
    async initialize() {
        if (this.isInitialized)
            return;
        const startTime = Date.now();
        this.emit('bridge:initializing');
        // 1. Load EmbeddingEngine (async — may download model)
        try {
            this.embedding = await (0, EmbeddingEngine_1.getEmbeddingEngine)();
            this.currentTelemetry.embeddingReady = true;
            this.emit('engine:loaded', { engine: 'EmbeddingEngine', timeMs: Date.now() - startTime });
        }
        catch (err) {
            this.emit('engine:failed', { engine: 'EmbeddingEngine', error: err.message });
            // Continue without embeddings — fallback to structural matching
        }
        // 2. Initialize HardwareBridge (telemetry server)
        try {
            await this.hardware.initialize();
            this.wireHardwareEvents();
            this.emit('engine:loaded', { engine: 'HardwareBridge', timeMs: Date.now() - startTime });
        }
        catch (err) {
            this.emit('engine:failed', { engine: 'HardwareBridge', error: err.message });
        }
        // 3. Initialize AntiTamper (ghost signatures)
        if (this.config.enableStealth) {
            try {
                this.antiTamper = (0, anti_tamper_1.getAntiTamper)({
                    enableDebugDetection: true,
                    enableVMDetection: true,
                    enableSandboxDetection: true,
                    enableIntegrityCheck: true,
                    onDetection: 'evade',
                });
                await this.antiTamper.initialize();
                this.currentTelemetry.stealthActive = true;
                this.wireAntiTamperEvents();
                this.emit('engine:loaded', { engine: 'AntiTamper', timeMs: Date.now() - startTime });
            }
            catch (err) {
                this.emit('engine:failed', { engine: 'AntiTamper', error: err.message });
            }
        }
        this.isInitialized = true;
        const elapsed = Date.now() - startTime;
        this.emit('bridge:initialized', { elapsed, engines: this.getActiveEngines() });
        this.printBanner(elapsed);
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // CORE API — findSecureElement (Consensus Search)
    // Complexity: O(log n) via Vector Search + O(1) Hardware Anchor
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Multi-agent consensus search for a DOM element.
     *
     * 1. Hardware Anchor: Adjusts waits based on real-time CPU/RAM telemetry
     * 2. Stealth Gate: AntiTamper scans for hostile environment before DOM touch
     * 3. Swarm Search: 3 parallel agents (Visual, Semantic, Structural)
     * 4. Neural Validation: Vector embedding similarity for final tiebreak
     * 5. Self-Healing: If consensus fails, vector-heal and retry
     */
    async findSecureElement(page, anchorId, options = {}) {
        this.metrics.totalSearches++;
        const searchStart = Date.now();
        // ── Phase 0: Stealth Gate ──
        // SAFETY: async operation — wrap in try-catch for production resilience
        const stealthApplied = await this.stealthGate();
        // ── Phase 1: Hardware Anchor (O(1) — read telemetry) ──
        const waitMultiplier = this.getWaitMultiplier();
        const effectiveTimeout = (options.timeout || this.config.agentTimeoutMs) * waitMultiplier;
        const hardwareAdjusted = waitMultiplier > 1;
        if (hardwareAdjusted)
            this.metrics.hardwareAdjustments++;
        this.emit('search:start', { anchorId, effectiveTimeout, waitMultiplier, stealthApplied });
        // ── Phase 2: Swarm Search (3 parallel agents) ──
        // SAFETY: async operation — wrap in try-catch for production resilience
        const votes = await this.runSwarmSearch(page, anchorId, effectiveTimeout);
        // ── Phase 3: Consensus Evaluation ──
        const consensus = this.evaluateConsensus(votes);
        if (consensus.consensusReached) {
            this.metrics.consensusReached++;
            const result = {
                ...consensus,
                latencyMs: Date.now() - searchStart,
                hardwareAdjusted,
                stealthApplied,
                healingApplied: false,
            };
            this.emit('search:consensus', result);
            return result;
        }
        // ── Phase 4: Self-Healing (if consensus failed) ──
        if (this.config.autoHealOnFailure || options.forceHeal) {
            this.metrics.healingTriggered++;
            // SAFETY: async operation — wrap in try-catch for production resilience
            const healed = await this.vectorHeal(page, anchorId, votes);
            if (healed) {
                this.metrics.healingSucceeded++;
                const result = {
                    element: healed.element,
                    confidence: healed.confidence,
                    strategy: 'semantic',
                    votes,
                    consensusReached: true,
                    latencyMs: Date.now() - searchStart,
                    hardwareAdjusted,
                    stealthApplied,
                    healingApplied: true,
                };
                this.emit('search:healed', result);
                return result;
            }
        }
        this.metrics.consensusFailed++;
        const failResult = {
            element: null,
            confidence: 0,
            strategy: 'structural',
            votes,
            consensusReached: false,
            latencyMs: Date.now() - searchStart,
            hardwareAdjusted,
            stealthApplied,
            healingApplied: false,
        };
        this.emit('search:failed', failResult);
        return failResult;
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // PHASE 2: SWARM SEARCH — 3 Parallel Agents
    // ═══════════════════════════════════════════════════════════════════════════
    async runSwarmSearch(page, anchorId, timeoutMs) {
        this.currentTelemetry.activeAgents = 3;
        const agentPromises = [
            this.runVisualAgent(page, anchorId, timeoutMs),
            this.runSemanticAgent(page, anchorId, timeoutMs),
            this.runStructuralAgent(page, anchorId, timeoutMs),
        ];
        // SAFETY: async operation — wrap in try-catch for production resilience
        const votes = await Promise.allSettled(agentPromises);
        this.currentTelemetry.activeAgents = 0;
        return votes
            .filter((r) => r.status === 'fulfilled')
            .map(r => r.value);
    }
    // ── Agent 1: Visual (position + size matching) ──
    async runVisualAgent(page, anchorId, timeoutMs) {
        const start = Date.now();
        try {
            const element = await Promise.race([
                this.neuralMap.findElement(page, anchorId),
                this.timeout(timeoutMs),
            ]);
            // If found, verify visual fingerprint consistency
            let confidence = element ? 0.8 : 0;
            if (element) {
                const box = await element.boundingBox();
                if (box && box.width > 0 && box.height > 0) {
                    confidence = 0.9;
                }
            }
            return {
                agentId: 'VISUAL_AGENT',
                strategy: 'visual',
                element,
                confidence,
                latencyMs: Date.now() - start,
            };
        }
        catch {
            return {
                agentId: 'VISUAL_AGENT',
                strategy: 'visual',
                element: null,
                confidence: 0,
                latencyMs: Date.now() - start,
            };
        }
    }
    // ── Agent 2: Semantic (vector embedding similarity — O(log n)) ──
    async runSemanticAgent(page, anchorId, timeoutMs) {
        const start = Date.now();
        if (!this.embedding) {
            return {
                agentId: 'SEMANTIC_AGENT',
                strategy: 'semantic',
                element: null,
                confidence: 0,
                vectorSimilarity: 0,
                latencyMs: Date.now() - start,
            };
        }
        try {
            // Get anchor stats for semantic context
            const stats = this.neuralMap.getAnchorStats(anchorId);
            if (!stats) {
                return {
                    agentId: 'SEMANTIC_AGENT',
                    strategy: 'semantic',
                    element: null,
                    confidence: 0,
                    vectorSimilarity: 0,
                    latencyMs: Date.now() - start,
                };
            }
            // Build semantic query from anchor name + context
            const query = `${stats.name || anchorId} ${stats.semanticHint || ''}`.trim();
            // Extract all text nodes from the page
            // SAFETY: async operation — wrap in try-catch for production resilience
            const pageTexts = await page.evaluate(() => {
                const nodes = [];
                const walk = (el, depth) => {
                    if (depth > 8)
                        return;
                    const text = el.textContent?.trim();
                    if (text && text.length > 0 && text.length < 200) {
                        let sel = el.tagName.toLowerCase();
                        if (el.id)
                            sel = `#${el.id}`;
                        else if (el.dataset?.testid)
                            sel = `[data-testid="${el.dataset.testid}"]`;
                        nodes.push({ text, selector: sel });
                    }
                    for (let ci = 0; ci < el.children.length; ci++) {
                        walk(el.children[ci], depth + 1);
                    }
                };
                walk(document.body, 0);
                return nodes.slice(0, 200); // cap for performance
            });
            if (pageTexts.length === 0) {
                return {
                    agentId: 'SEMANTIC_AGENT',
                    strategy: 'semantic',
                    element: null,
                    confidence: 0,
                    vectorSimilarity: 0,
                    latencyMs: Date.now() - start,
                };
            }
            // Vector search: embed query + find most similar
            const candidates = pageTexts.map(n => n.text);
            // SAFETY: async operation — wrap in try-catch for production resilience
            const matches = await this.embedding.findMostSimilar(query, candidates, 3);
            if (matches.length === 0 || matches[0].score < this.config.similarityThreshold) {
                return {
                    agentId: 'SEMANTIC_AGENT',
                    strategy: 'semantic',
                    element: null,
                    confidence: 0,
                    vectorSimilarity: matches[0]?.score || 0,
                    latencyMs: Date.now() - start,
                };
            }
            // Find the DOM element matching the best text
            const bestMatch = matches[0];
            const matchingNode = pageTexts.find(n => n.text === bestMatch.text);
            if (!matchingNode) {
                return {
                    agentId: 'SEMANTIC_AGENT',
                    strategy: 'semantic',
                    element: null,
                    confidence: 0,
                    vectorSimilarity: bestMatch.score,
                    latencyMs: Date.now() - start,
                };
            }
            // SAFETY: async operation — wrap in try-catch for production resilience
            const element = await page.$(matchingNode.selector);
            return {
                agentId: 'SEMANTIC_AGENT',
                strategy: 'semantic',
                element,
                confidence: bestMatch.score,
                vectorSimilarity: bestMatch.score,
                latencyMs: Date.now() - start,
            };
        }
        catch {
            return {
                agentId: 'SEMANTIC_AGENT',
                strategy: 'semantic',
                element: null,
                confidence: 0,
                vectorSimilarity: 0,
                latencyMs: Date.now() - start,
            };
        }
    }
    // ── Agent 3: Structural (CSS / XPath / DOM tree) ──
    async runStructuralAgent(page, anchorId, timeoutMs) {
        const start = Date.now();
        try {
            const locator = await Promise.race([
                this.neuralMap.getSmartLocator(page, anchorId),
                this.timeout(timeoutMs),
            ]);
            let element = null;
            let confidence = 0;
            if (locator) {
                try {
                    element = await locator.elementHandle({ timeout: timeoutMs / 2 });
                    confidence = element ? 0.85 : 0;
                }
                catch {
                    confidence = 0;
                }
            }
            return {
                agentId: 'STRUCTURAL_AGENT',
                strategy: 'structural',
                element,
                confidence,
                latencyMs: Date.now() - start,
            };
        }
        catch {
            return {
                agentId: 'STRUCTURAL_AGENT',
                strategy: 'structural',
                element: null,
                confidence: 0,
                latencyMs: Date.now() - start,
            };
        }
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // PHASE 3: CONSENSUS EVALUATION
    // ═══════════════════════════════════════════════════════════════════════════
    evaluateConsensus(votes) {
        // Filter votes that actually found something
        const positive = votes.filter(v => v.element !== null && v.confidence > 0.5);
        if (positive.length >= this.config.requiredConsensus) {
            // Sort by confidence, pick highest
            positive.sort((a, b) => b.confidence - a.confidence);
            const winner = positive[0];
            // Weighted confidence = average of all positive votes
            const avgConfidence = positive.reduce((s, v) => s + v.confidence, 0) / positive.length;
            return {
                element: winner.element,
                confidence: avgConfidence,
                strategy: winner.strategy,
                votes,
                consensusReached: true,
            };
        }
        // No consensus — return best single vote if any
        const best = votes.filter(v => v.element !== null).sort((a, b) => b.confidence - a.confidence)[0];
        return {
            element: best?.element || null,
            confidence: best?.confidence || 0,
            strategy: best?.strategy || 'structural',
            votes,
            consensusReached: false,
        };
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // PHASE 4: VECTOR HEALING (Neural-Semantic Self-Healing)
    // When consensus fails, use EmbeddingEngine to find the element by meaning
    // Complexity: O(log n) via vector similarity search
    // ═══════════════════════════════════════════════════════════════════════════
    async vectorHeal(page, anchorId, previousVotes) {
        if (!this.embedding)
            return null;
        this.emit('healing:start', { anchorId, attempt: 1 });
        const stats = this.neuralMap.getAnchorStats(anchorId);
        if (!stats)
            return null;
        // Build a rich semantic description for vector search
        const semanticParts = [];
        if (stats.name)
            semanticParts.push(stats.name);
        if (stats.semanticHint)
            semanticParts.push(stats.semanticHint);
        if (stats.innerText)
            semanticParts.push(stats.innerText);
        if (stats.ariaLabel)
            semanticParts.push(stats.ariaLabel);
        const query = semanticParts.join(' ').trim();
        if (!query)
            return null;
        // Get all interactive elements on the page
        // SAFETY: async operation — wrap in try-catch for production resilience
        const candidates = await page.evaluate(() => {
            const interactables = document.querySelectorAll('a, button, input, select, textarea, [role="button"], [role="link"], [onclick], [tabindex]');
            return Array.from(interactables).map((el, i) => ({
                text: (el.textContent?.trim() || '') + ' ' + (el.getAttribute('aria-label') || '') + ' ' + (el.getAttribute('placeholder') || ''),
                selector: el.id ? `#${el.id}` : `[data-heal-index="${i}"]`,
                index: i,
            })).filter(c => c.text.trim().length > 0);
        });
        // Inject temporary data-heal-index attributes
        // SAFETY: async operation — wrap in try-catch for production resilience
        await page.evaluate((count) => {
            const els = document.querySelectorAll('a, button, input, select, textarea, [role="button"], [role="link"], [onclick], [tabindex]');
            els.forEach((el, i) => {
                if (i < count)
                    el.dataset.healIndex = String(i);
            });
        }, candidates.length);
        if (candidates.length === 0)
            return null;
        // Vector search
        const texts = candidates.map(c => c.text);
        // SAFETY: async operation — wrap in try-catch for production resilience
        const matches = await this.embedding.findMostSimilar(query, texts, 5);
        for (const match of matches) {
            if (match.score < this.config.similarityThreshold * 0.9)
                continue; // slightly relaxed for healing
            const candidate = candidates.find(c => c.text === match.text);
            if (!candidate)
                continue;
            // SAFETY: async operation — wrap in try-catch for production resilience
            const element = await page.$(candidate.selector);
            if (element) {
                // Clean up temporary attributes
                // SAFETY: async operation — wrap in try-catch for production resilience
                await page.evaluate(() => {
                    document.querySelectorAll('[data-heal-index]').forEach(el => {
                        el.removeAttribute('data-heal-index');
                    });
                });
                this.emit('healing:success', { anchorId, similarity: match.score, text: match.text });
                return { element, confidence: match.score };
            }
        }
        // Clean up
        // SAFETY: async operation — wrap in try-catch for production resilience
        await page.evaluate(() => {
            document.querySelectorAll('[data-heal-index]').forEach(el => {
                el.removeAttribute('data-heal-index');
            });
        });
        this.emit('healing:failed', { anchorId });
        return null;
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // STEALTH GATE — AntiTamper Integration
    // ═══════════════════════════════════════════════════════════════════════════
    async stealthGate() {
        if (!this.antiTamper || !this.config.enableStealth)
            return false;
        // SAFETY: async operation — wrap in try-catch for production resilience
        const detections = await this.antiTamper.performFullScan();
        const threats = detections.filter(d => d.isDetected);
        if (threats.length > 0) {
            this.metrics.stealthInterventions++;
            this.currentTelemetry.threatLevel = this.classifyThreat(threats);
            this.currentTelemetry.isCompromised = this.antiTamper.isSystemCompromised();
            this.emit('stealth:threat', {
                count: threats.length,
                types: threats.map(t => t.type),
                threatLevel: this.currentTelemetry.threatLevel,
            });
            // If in evasion mode, add human-like jitter delay
            if (this.config.injectHumanJitter && this.antiTamper.isInEvasionMode()) {
                const jitter = Math.random() * 300 + 100; // 100-400ms human-like pause
                // SAFETY: async operation — wrap in try-catch for production resilience
                await new Promise(r => setTimeout(r, jitter));
            }
            return true;
        }
        this.currentTelemetry.threatLevel = 'SAFE';
        return false;
    }
    classifyThreat(threats) {
        const types = new Set(threats.map(t => t.type));
        if (types.has('debugger') && types.has('vm'))
            return 'CRITICAL';
        if (types.has('debugger'))
            return 'DANGER';
        if (types.has('vm') || types.has('sandbox'))
            return 'WARNING';
        if (types.has('analysis'))
            return 'CAUTION';
        return 'SAFE';
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // HARDWARE ADAPTATION — Substrate-Aware Wait Logic
    // ═══════════════════════════════════════════════════════════════════════════
    getWaitMultiplier() {
        const cpu = this.currentTelemetry.cpuUsage;
        if (cpu >= this.config.cpuThresholdCritical) {
            return this.config.waitMultiplierCritical;
        }
        if (cpu >= this.config.cpuThresholdHigh) {
            return this.config.waitMultiplierHigh;
        }
        // Linear interpolation between 1 and high multiplier
        if (cpu >= 50) {
            const t = (cpu - 50) / (this.config.cpuThresholdHigh - 50);
            return 1 + t * (this.config.waitMultiplierHigh - 1);
        }
        return 1;
    }
    wireHardwareEvents() {
        this.hardware.on('telemetry:received', (packet) => {
            this.currentTelemetry.cpuUsage = packet.cpuUsage;
            this.currentTelemetry.ramUsage = packet.ramUsage;
            this.currentTelemetry.waitMultiplier = this.getWaitMultiplier();
            this.emit('telemetry:updated', this.currentTelemetry);
        });
    }
    wireAntiTamperEvents() {
        if (!this.antiTamper)
            return;
        this.antiTamper.on('detection', (result) => {
            this.currentTelemetry.threatLevel = this.classifyThreat([result]);
            this.currentTelemetry.isCompromised = this.antiTamper.isSystemCompromised();
            this.emit('stealth:detection', result);
        });
        this.antiTamper.on('evasion_activated', () => {
            this.currentTelemetry.stealthActive = true;
            this.emit('stealth:evasion', { active: true });
        });
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // BATCH OPERATIONS — Multi-Element Consensus Search
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Find multiple elements with consensus verification.
     * Runs searches in parallel where possible, respecting hardware capacity.
     */
    async findSecureElements(page, anchorIds, options = {}) {
        const results = new Map();
        const concurrency = Math.min(options.concurrency || 3, this.currentTelemetry.cpuUsage > this.config.cpuThresholdHigh ? 1 : 3);
        // Process in batches based on hardware capacity
        for (let i = 0; i < anchorIds.length; i += concurrency) {
            const batch = anchorIds.slice(i, i + concurrency);
            // SAFETY: async operation — wrap in try-catch for production resilience
            const batchResults = await Promise.all(batch.map(id => this.findSecureElement(page, id)));
            batch.forEach((id, idx) => results.set(id, batchResults[idx]));
        }
        return results;
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // ANCHOR MANAGEMENT — Hybrid Create/Update
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Create a cognitive anchor with embedded vector representation.
     * Stores both structural selectors AND semantic embeddings.
     */
    async createHybridAnchor(page, element, name, businessFunction) {
        // Create cognitive anchor via NeuralMapEngine
        // SAFETY: async operation — wrap in try-catch for production resilience
        const anchor = await this.neuralMap.createAnchor(page, element, name, businessFunction);
        // Embed the semantic text into vector space
        let vectorEmbedded = false;
        if (this.embedding) {
            try {
                const semanticText = `${name} ${businessFunction || ''} ${anchor.semantic.innerText || ''}`.trim();
                const vector = await this.embedding.embed(semanticText);
                this.vectorCache.set(anchor.id, vector);
                vectorEmbedded = true;
            }
            catch {
                // Vector embedding is optional enhancement
            }
        }
        this.emit('anchor:created', { id: anchor.id, name, vectorEmbedded });
        return { anchorId: anchor.id, vectorEmbedded };
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // DIAGNOSTICS & TELEMETRY
    // ═══════════════════════════════════════════════════════════════════════════
    getTelemetry() {
        return { ...this.currentTelemetry };
    }
    getMetrics() {
        return { ...this.metrics };
    }
    getActiveEngines() {
        const engines = ['NeuralMapEngine'];
        if (this.embedding)
            engines.push('EmbeddingEngine');
        if (this.hardware)
            engines.push('HardwareBridge');
        if (this.antiTamper)
            engines.push('AntiTamper');
        return engines;
    }
    getConsensusRate() {
        const total = this.metrics.consensusReached + this.metrics.consensusFailed;
        return total === 0 ? 1 : this.metrics.consensusReached / total;
    }
    getHealingRate() {
        return this.metrics.healingTriggered === 0
            ? 1
            : this.metrics.healingSucceeded / this.metrics.healingTriggered;
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // SHUTDOWN
    // ═══════════════════════════════════════════════════════════════════════════
    async shutdown() {
        this.emit('bridge:shutting-down');
        if (this.antiTamper)
            this.antiTamper.stop();
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.hardware.shutdown();
        this.vectorCache.clear();
        this.isInitialized = false;
        this.emit('bridge:shutdown', this.getMetrics());
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // UTILITIES
    // ═══════════════════════════════════════════════════════════════════════════
    timeout(ms) {
        return new Promise(resolve => setTimeout(() => resolve(null), ms));
    }
    printBanner(elapsed) {
        const engines = this.getActiveEngines();
        console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║  🔗 NEURAL CONSENSUS BRIDGE v2.0 - Hybridization Layer                     ║
║                                                                            ║
║  Mode: ZERO ENTROPY     | Consensus: ${this.config.requiredConsensus}/3 votes required            ║
║  Engines: ${engines.length}/4 active     | Stealth: ${this.currentTelemetry.stealthActive ? 'ON ' : 'OFF'}                             ║
║  Vector: ${this.currentTelemetry.embeddingReady ? 'READY' : 'N/A  '}            | Init: ${elapsed}ms                              ║
║                                                                            ║
║  Active Engines:                                                           ║
║  ${engines.map(e => `✅ ${e}`).join('\n║  ').padEnd(73)}║
║                                                                            ║
║  "Всеки елемент е уникален. Всяко търсене - консенсус."                    ║
╚══════════════════════════════════════════════════════════════════════════════╝
`);
    }
}
exports.NeuralConsensusBridge = NeuralConsensusBridge;
// ═══════════════════════════════════════════════════════════════════════════════
// FACTORY EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════
let _bridgeInstance = null;
function getNeuralConsensusBridge(config) {
    if (!_bridgeInstance) {
        _bridgeInstance = new NeuralConsensusBridge(config);
    }
    return _bridgeInstance;
}
function createNeuralConsensusBridge(config) {
    return new NeuralConsensusBridge(config);
}
exports.default = NeuralConsensusBridge;
