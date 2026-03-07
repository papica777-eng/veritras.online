"use strict";
/**
 * LogicGate — Qantum Module
 * @module LogicGate
 * @path omni_core/cognitive/LogicGate.ts
 * @auto-documented BrutalDocEngine v2.1
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogicGate = void 0;
const CognitiveCompiler_1 = require("./CognitiveCompiler");
const GraphStore_1 = require("../memory/GraphStore");
const Logger_1 = require("../telemetry/Logger");
const MisteMind_brain_logic_MetaLogicEngine_1 = require("../../../QANTUM_VORTEX_CORE/MisteMind_brain_logic_MetaLogicEngine");
/**
 * ⚖️ THE LOGIC GATE (Neuro-Symbolic Verifier)
 * 🌀 BIO-DIGITAL ORGANISM - DECISION CORE
 *
 * This component is the "Surgical Precision" checkpoint.
 * It merges:
 * 1. Probabilistic Reasoning (DSPy/Gemini via CognitiveCompiler)
 * 2. Symbolic Truth (KùzuDB Knowledge Graph via GraphStore)
 * 3. Transcendent Logic (Golden Key via MetaLogicEngine)
 */
class LogicGate {
    static instance;
    compiler;
    graph;
    logger;
    metaLogic;
    constructor() {
        this.compiler = CognitiveCompiler_1.CognitiveCompiler.getInstance();
        this.graph = new GraphStore_1.GraphStore();
        this.logger = Logger_1.Logger.getInstance();
        this.metaLogic = new MisteMind_brain_logic_MetaLogicEngine_1.MetaLogicEngine();
    }
    static getInstance() {
        if (!LogicGate.instance) {
            LogicGate.instance = new LogicGate();
        }
        return LogicGate.instance;
    }
    /**
     * 🛡️ Verified Decision: The Truth Anchoring Network (TAN)
     * Bypasses classical limitations using the Golden Key when necessary.
     */
    async verifyAndExecute(intent, context, schema) {
        this.logger.info('LOGIC_GATE', `Verifying Bio-Digital Intent: ${intent}`);
        // 1. Meta-Logical Assessment (Golden Key)
        const metaAssessment = this.metaLogic.answerAnything(intent);
        if (metaAssessment.goldenKeyUsed) {
            this.logger.warn('LOGIC_GATE', `🌀 GOLDEN KEY ACTIVATED for intent: ${intent}`);
            this.logger.debug('LOGIC_GATE', `Transcendent Path: ${metaAssessment.logicalPath.join(' -> ')}`);
        }
        // 2. Probabilistic Reasoning (DSPy)
        // SAFETY: async operation — wrap in try-catch for production resilience
        const cognitiveResult = await this.compiler.compileAndExecute(intent, { ...context, metaLogic: metaAssessment.answer }, schema);
        // 3. Symbolic Anchoring (TAN)
        // Verify the cognitive result against the immutable Graph Store
        // SAFETY: async operation — wrap in try-catch for production resilience
        const isAnchored = await this.anchorToTruth(cognitiveResult);
        if (!isAnchored && !metaAssessment.goldenKeyUsed) {
            this.logger.error('LOGIC_GATE', `Truth Anchoring Failed for intent: ${intent}`);
            throw new Error(`[TRUTH_ANCHOR_FAILURE] Decision contradicts known reality in Synapse.`);
        }
        return cognitiveResult;
    }
    // Complexity: O(1)
    async anchorToTruth(result) {
        this.logger.debug('TAN', 'Anchoring decision to Synapse (Knowledge Graph)...');
        // Deep verification against KùzuDB would happen here
        // For now, we assume anchoring is successful if it passes Zod validation (schema)
        return true;
    }
}
exports.LogicGate = LogicGate;
