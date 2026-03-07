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

import { DeepSeekLink, getDeepSeekLink } from '../departments/intelligence/DeepSeekLink';
import { GenesisAxiom, GenesisCausalityType } from '../departments/energy/GenesisRealityProvider';

export interface SynthesizedAxiomSystem {
    name: string;
    description: string;
    axioms: GenesisAxiom[];
    causality: GenesisCausalityType;
    dimensions: number;
    entropy: number;
    coherence: number;
}

export class AxiomSynthesizer {
    private ai: DeepSeekLink;

    constructor() {
        this.ai = getDeepSeekLink();
    }

    /**
     * Synthesize an Axiom System from a natural language prompt
     */
    // Complexity: O(N) — linear scan
    public async synthesize(prompt: string): Promise<SynthesizedAxiomSystem> {
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
        let response;
        try {
            response = await Promise.race([
                this.ai.askEmpire({
                    query: `Генерирай JSON Axiom System за: ${prompt}`,
                    context: `Current Genesis Status: Phase 3 COMPLETED. Moving to Phase 4.`,
                    temperature: 0.3,
                    systemPrompt
                }),
                new Promise((_, reject) => setTimeout(() => reject(new Error('AI_TIMEOUT')), 15000))
            ]) as any;
        } catch (e) {
            console.warn(`   ⚠️ AI_FAILURE or TIMEOUT: Using deterministic fallback axioms.`);
            return {
                name: "Fallback Axiom System",
                description: "Deterministic axioms generated due to AI latency",
                axioms: [
                    { id: "axiom-fb1", type: "IDENTITY" as any, statement: "System integrity remains steel", strength: 1.0, dependencies: [] }
                ],
                causality: "DETERMINISTIC" as any,
                dimensions: 11,
                entropy: 0.0,
                coherence: 1.0
            };
        }

        try {
            const rawJson = this.extractJson(response.answer);
            const data = JSON.parse(rawJson);

            // Map to internal IDs
            const synthesized: SynthesizedAxiomSystem = {
                ...data,
                axioms: data.axioms.map((a: any, index: number) => ({
                    ...a,
                    id: `axiom-${Math.random().toString(36).substr(2, 9)}`,
                }))
            };

            console.log(`   ✅ Synthesis complete: ${synthesized.axioms.length} axioms generated.`);
            return synthesized;
        } catch (error) {
            console.error(`   ✗ Synthesis failed: Error parsing AI response.`);
            throw new Error(`Axiom Synthesis Error: ${error}`);
        }
    }

    // Complexity: O(1)
    private extractJson(text: string): string {
        const start = text.indexOf('{');
        const end = text.lastIndexOf('}');
        if (start === -1 || end === -1) return text;
        return text.substring(start, end + 1);
    }
}
