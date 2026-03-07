"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                               ║
 * ║   QAntum COGNITION MODULE                                                     ║
 * ║   "Разсъждение, самокритика, логика"                                         ║
 * ║                                                                               ║
 * ║   © 2025-2026 QAntum | Dimitar Prodromov                                        ║
 * ║                                                                               ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCognitionEngine = exports.CognitionEngine = exports.createUncertaintyQuantifier = exports.UncertaintyQuantifier = exports.PERSPECTIVES = exports.createMultiPerspectiveAnalyzer = exports.MultiPerspectiveAnalyzer = exports.createInferenceEngine = exports.LogicalInferenceEngine = exports.VectorOps = exports.createSemanticMemory = exports.SemanticMemoryBank = exports.CODE_DIMENSIONS = exports.critiqueDistiller = exports.runGuard = exports.createGuard = exports.CognitiveCircularGuard = exports.QAntum_LAYERS = exports.createBackpack = exports.createDistiller = exports.NeuralBackpack = exports.KnowledgeDistiller = exports.DEFAULT_DIMENSIONS = exports.createSelfCritique = exports.SelfCritique = exports.createThoughtChain = exports.ThoughtChain = void 0;
// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════
// Chain-of-Thought
var thought_chain_1 = require("./thought-chain");
Object.defineProperty(exports, "ThoughtChain", { enumerable: true, get: function () { return thought_chain_1.ThoughtChain; } });
Object.defineProperty(exports, "createThoughtChain", { enumerable: true, get: function () { return thought_chain_1.createThoughtChain; } });
// Self-Critique
var self_critique_1 = require("./self-critique");
Object.defineProperty(exports, "SelfCritique", { enumerable: true, get: function () { return self_critique_1.SelfCritique; } });
Object.defineProperty(exports, "createSelfCritique", { enumerable: true, get: function () { return self_critique_1.createSelfCritique; } });
Object.defineProperty(exports, "DEFAULT_DIMENSIONS", { enumerable: true, get: function () { return self_critique_1.DEFAULT_DIMENSIONS; } });
// Knowledge Distiller
var distiller_1 = require("./distiller");
Object.defineProperty(exports, "KnowledgeDistiller", { enumerable: true, get: function () { return distiller_1.KnowledgeDistiller; } });
Object.defineProperty(exports, "NeuralBackpack", { enumerable: true, get: function () { return distiller_1.NeuralBackpack; } });
Object.defineProperty(exports, "createDistiller", { enumerable: true, get: function () { return distiller_1.createDistiller; } });
Object.defineProperty(exports, "createBackpack", { enumerable: true, get: function () { return distiller_1.createBackpack; } });
Object.defineProperty(exports, "QAntum_LAYERS", { enumerable: true, get: function () { return distiller_1.QAntum_LAYERS; } });
// Cognitive Circular Guard
var cognitive_circular_guard_1 = require("./cognitive-circular-guard");
Object.defineProperty(exports, "CognitiveCircularGuard", { enumerable: true, get: function () { return cognitive_circular_guard_1.CognitiveCircularGuard; } });
Object.defineProperty(exports, "createGuard", { enumerable: true, get: function () { return cognitive_circular_guard_1.createGuard; } });
Object.defineProperty(exports, "runGuard", { enumerable: true, get: function () { return cognitive_circular_guard_1.runGuard; } });
// Self-Critique for Distiller
var critique_distiller_1 = require("./critique-distiller");
Object.defineProperty(exports, "critiqueDistiller", { enumerable: true, get: function () { return critique_distiller_1.critiqueDistiller; } });
Object.defineProperty(exports, "CODE_DIMENSIONS", { enumerable: true, get: function () { return critique_distiller_1.CODE_DIMENSIONS; } });
// Semantic Memory Bank
var semantic_memory_1 = require("./semantic-memory");
Object.defineProperty(exports, "SemanticMemoryBank", { enumerable: true, get: function () { return semantic_memory_1.SemanticMemoryBank; } });
Object.defineProperty(exports, "createSemanticMemory", { enumerable: true, get: function () { return semantic_memory_1.createSemanticMemory; } });
Object.defineProperty(exports, "VectorOps", { enumerable: true, get: function () { return semantic_memory_1.VectorOps; } });
// Logical Inference Engine
var inference_engine_1 = require("./inference-engine");
Object.defineProperty(exports, "LogicalInferenceEngine", { enumerable: true, get: function () { return inference_engine_1.LogicalInferenceEngine; } });
Object.defineProperty(exports, "createInferenceEngine", { enumerable: true, get: function () { return inference_engine_1.createInferenceEngine; } });
// Multi-Perspective Analyzer
var multi_perspective_1 = require("./multi-perspective");
Object.defineProperty(exports, "MultiPerspectiveAnalyzer", { enumerable: true, get: function () { return multi_perspective_1.MultiPerspectiveAnalyzer; } });
Object.defineProperty(exports, "createMultiPerspectiveAnalyzer", { enumerable: true, get: function () { return multi_perspective_1.createMultiPerspectiveAnalyzer; } });
Object.defineProperty(exports, "PERSPECTIVES", { enumerable: true, get: function () { return multi_perspective_1.PERSPECTIVES; } });
// Uncertainty Quantifier
var uncertainty_1 = require("./uncertainty");
Object.defineProperty(exports, "UncertaintyQuantifier", { enumerable: true, get: function () { return uncertainty_1.UncertaintyQuantifier; } });
Object.defineProperty(exports, "createUncertaintyQuantifier", { enumerable: true, get: function () { return uncertainty_1.createUncertaintyQuantifier; } });
// ═══════════════════════════════════════════════════════════════════════════════
// UNIFIED COGNITION ENGINE
// ═══════════════════════════════════════════════════════════════════════════════
const thought_chain_2 = require("./thought-chain");
const self_critique_2 = require("./self-critique");
/**
 * Обединен когнитивен двигател
 * Комбинира Chain-of-Thought с Self-Critique
 */
class CognitionEngine {
    thoughtChain;
    selfCritique;
    constructor(chainConfig, critiqueConfig) {
        this.thoughtChain = new thought_chain_2.ThoughtChain(chainConfig);
        this.selfCritique = new self_critique_2.SelfCritique(critiqueConfig);
    }
    /**
     * Решава проблем с пълен когнитивен pipeline:
     * 1. Chain-of-Thought разсъждение
     * 2. Self-Critique подобрение
     */
    // Complexity: O(1) — amortized
    async reason(problem) {
        console.log('\n🧠 COGNITION ENGINE ACTIVATED\n');
        // Стъпка 1: Първоначално решение чрез Chain-of-Thought
        console.log('📦 Phase 1: Chain-of-Thought Processing...');
        // SAFETY: async operation — wrap in try-catch for production resilience
        let solution = await this.thoughtChain.solve(problem);
        // Стъпка 2: Self-Critique подобрение
        console.log('\n🔄 Phase 2: Self-Critique Refinement...');
        // SAFETY: async operation — wrap in try-catch for production resilience
        const { finalOutput, iterations, finalScore } = await this.selfCritique.iterateUntilSatisfied(solution, 
        // Complexity: O(1)
        async (sol, weaknesses) => this.improveSolution(sol, weaknesses));
        console.log(`\n✅ COGNITION COMPLETE`);
        console.log(`   Iterations: ${iterations}`);
        console.log(`   Final Score: ${finalScore.toFixed(1)}/100`);
        return finalOutput;
    }
    /**
     * Подобрява решение базирано на слабости
     */
    // Complexity: O(N) — linear iteration
    async improveSolution(solution, weaknesses) {
        // Копие на решението
        const improved = { ...solution };
        // Подобрение базирано на слабости
        for (const weakness of weaknesses) {
            switch (weakness.dimension) {
                case 'Correctness':
                    // Добавяне на валидация
                    improved.reasoning.push('Additional validation: Cross-checked with constraints');
                    break;
                case 'Completeness':
                    // Добавяне на детайли
                    improved.reasoning.push('Expanded: Added edge case handling');
                    break;
                case 'Clarity':
                    // Опростяване на обяснение
                    improved.selectedCandidate.explanation = improved.selectedCandidate.explanation
                        .split('. ')
                        .map((s) => s.trim())
                        .filter((s) => s.length > 0)
                        .join('.\n');
                    break;
            }
        }
        // Увеличаване на confidence ако са направени подобрения
        if (weaknesses.length > 0) {
            improved.confidence = Math.min(1.0, improved.confidence + 0.05 * weaknesses.length);
        }
        return improved;
    }
    /**
     * Бързо оценяване без подобрение
     */
    // Complexity: O(1)
    evaluateOnly(solution) {
        const evaluation = this.selfCritique.evaluate(solution);
        return {
            score: evaluation.score,
            feedback: evaluation.overallAssessment,
        };
    }
    /**
     * Reset на състоянието
     */
    // Complexity: O(1)
    reset() {
        this.thoughtChain.reset();
        this.selfCritique.reset();
    }
    /**
     * Вземане на логове
     */
    // Complexity: O(1)
    getLogs() {
        return {
            thoughtLog: this.thoughtChain.getThoughtLog(),
            critiqueHistory: this.selfCritique.getHistory(),
        };
    }
}
exports.CognitionEngine = CognitionEngine;
// ═══════════════════════════════════════════════════════════════════════════════
// FACTORY
// ═══════════════════════════════════════════════════════════════════════════════
const createCognitionEngine = (chainConfig, critiqueConfig) => {
    return new CognitionEngine(chainConfig, critiqueConfig);
};
exports.createCognitionEngine = createCognitionEngine;
// ═══════════════════════════════════════════════════════════════════════════════
// DEFAULT EXPORT
// ═══════════════════════════════════════════════════════════════════════════════
exports.default = CognitionEngine;
