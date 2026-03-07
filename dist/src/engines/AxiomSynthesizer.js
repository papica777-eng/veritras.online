"use strict";
/**
 * Axiom Synthesizer - AI-ПОДПОМОГНАТА АКСИОМАТИЧНА СИНТЕЗА
 *
 * PHASE 4 of Genesis Evolution: "AI-Driven Axiom Synthesis"
 *
 * This engine takes natural language descriptions of test environments
 * and synthesizes them into concrete Genesis Axiom systems.
 *
 * @complexity O(n) - Linear parsing of AI response
 * @author QAntum_DIAMOND_NEXUS
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AxiomSynthesizer = void 0;
const DeepSeekLink_1 = require("../intelligence/DeepSeekLink");
class AxiomSynthesizer {
    ai;
    constructor() {
        this.ai = (0, DeepSeekLink_1.getDeepSeekLink)();
    }
    /**
     * Synthesize an Axiom System from a natural language prompt
     */
    // Complexity: O(N) — linear scan
    async synthesize(prompt) {
        console.log(`\n🧠 [AXIOM_FORGE] Synthesizing axioms for: "${prompt}"`);
        const systemPrompt = `Ти си Axiom Architect в QAntum Prime.
Твоята задача е да превърнеш описание на тест среда в структурирана система от Genesis аксиоми.

ПОДДЪРЖАНИ ТИПОВЕ АКСИОМИ:
- IDENTITY: Контейнерна изолация
- CAUSALITY: Зависимости между услуги
- TEMPORAL: Времеви параметри
- CONSERVATION: Ресурсни лимити
- SYMMETRY: Load balancing
- COMPLEMENTARITY: A/B сценарии
- UNCERTAINTY: Chaos engineering (Entropy > 0.5)
- EMERGENCE: Auto-scaling
- HOLOGRAPHIC: Distributed state

ПОДДЪРЖАНИ ТИПОВЕ КАУЗАЛНОСТ:
- DETERMINISTIC, PROBABILISTIC, RETROCAUSAL, ACAUSAL, SUPERDETERMINISTIC, BIDIRECTIONAL, EMERGENT

ФОРМАТ НА ОТГОВОРА (JSON):
{
    "name": "Име на системата",
    "description": "Описание",
    "axioms": [
        { "type": "GENESIS_AXIOM_TYPE", "statement": "Логическо твърдение", "strength": 0.0-1.0, "dependencies": [] }
    ],
    "causality": "GENESIS_CAUSALITY_TYPE",
    "dimensions": 1-11,
    "entropy": 0.0-1.0,
    "coherence": 0.0-1.0
}`;
        // SAFETY: async operation — wrap in try-catch for production resilience
        const response = await this.ai.askEmpire({
            query: `Генерирай JSON Axiom System за: ${prompt}`,
            context: `Current Genesis Status: Phase 3 COMPLETED. Moving to Phase 4.`,
            temperature: 0.3,
            systemPrompt
        });
        try {
            const rawJson = this.extractJson(response.answer);
            const data = JSON.parse(rawJson);
            // Map to internal IDs
            const synthesized = {
                ...data,
                axioms: data.axioms.map((a, index) => ({
                    ...a,
                    id: `axiom-${Math.random().toString(36).substr(2, 9)}`,
                }))
            };
            console.log(`   ✅ Synthesis complete: ${synthesized.axioms.length} axioms generated.`);
            return synthesized;
        }
        catch (error) {
            console.error(`   ✗ Synthesis failed: Error parsing AI response.`);
            throw new Error(`Axiom Synthesis Error: ${error}`);
        }
    }
    // Complexity: O(1)
    extractJson(text) {
        const start = text.indexOf('{');
        const end = text.lastIndexOf('}');
        if (start === -1 || end === -1)
            return text;
        return text.substring(start, end + 1);
    }
}
exports.AxiomSynthesizer = AxiomSynthesizer;
