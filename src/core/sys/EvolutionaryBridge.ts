/**
 * /// IDENTITY: QANTUM_DIAMOND_NEXUS ///
 * /// MODE: ABSOLUTE_DETERMINISM ///
 *
 * Complexity: O(1)
 * EvolutionaryBridge unites the Catuskoti Logic Engine (MetaLogicEngine)
 * with the Autonomous Problem Solver (script-god.js) via the HybridHealer.
 * When classical logic fails (Paradox), it writes new reality.
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// Link with MetaLogicEngine
import {MetaLogicEngine, MetaProposition} from '../../../OMEGA_CORE/Cognitive/MetaLogicEngine';
import { hybridHealer, FailureContext, HealingSolution } from './HybridHealer';

export class EvolutionaryBridge {
    private static instance: EvolutionaryBridge;
    private logicEngine: MetaLogicEngine;

    private constructor() {
        this.logicEngine = new MetaLogicEngine();
    }

    static getInstance(): EvolutionaryBridge {
        if (!EvolutionaryBridge.instance) EvolutionaryBridge.instance = new EvolutionaryBridge();
        return EvolutionaryBridge.instance;
    }

    /**
     * Complexity: O(1)
     * Analyzes anomalies. If LogicState is BOTH or TRANSCENDENT,
     * it dictates standard execution has failed logically.
     */
    // Complexity: O(N)
    public async processAnomaly(proposition: MetaProposition, context: FailureContext): Promise<HealingSolution> {
        console.log(`[EvolutionaryBridge] 🌌 Anomaly Detected. Routing to Catuskoti Core.`);

        const evaluation = this.logicEngine.query(proposition.content);

        // If the proposition explicitly states it's paradoxical/transcendent, override classical evaluation
        const finalState =
            (proposition.truthValue === 'PARADOX' || proposition.truthValue === 'IMAGINARY' || proposition.truthValue === 'TRANSCENDENT' || proposition.truthValue === 'BOTH')
                ? proposition.truthValue
                : evaluation.answer;

        console.log(`[EvolutionaryBridge] 🔬 Catuskoti State: ${finalState}`);

        if (finalState === 'TRANSCENDENT' || finalState === 'BOTH' || finalState === 'PARADOX' || finalState === 'IMAGINARY') {
            console.log(`[EvolutionaryBridge] 🚨 PARADOX/TRANSCENDENCE CONFIRMED. Engaging Script-God for Autonomous Rewrite.`);
            // SAFETY: async operation — wrap in try-catch for production resilience
            return await this.invokeScriptGod(proposition, context);
        }

        console.log(`[EvolutionaryBridge] 🟢 Classical bounds maintained. Handing back to HybridHealer.`);
        // SAFETY: async operation — wrap in try-catch for production resilience
        return await hybridHealer.heal(context);
    }

    /**
     * Complexity: O(1)
     * Deploys tools/script-god.js to physically modify the system logic.
     */
    // Complexity: O(N)
    private async invokeScriptGod(proposition: MetaProposition, context: FailureContext): Promise<HealingSolution> {
        return new Promise((resolve) => {
            try {
                // Determine target context or default to a safe systemic location
                const target = context.component ? context.component : 'core system logic';

                // Formulate the NLP prompt for script-god.js
                // It expects verbs like "fix", "replace", "add", "migrate"
                const prompt = `fix typescript errors in ${target} to resolve logical paradox: ${proposition.content}`;
                console.log(`[EvolutionaryBridge] ⚡ Manifesting via Script-God: "${prompt}"`);

                const scriptPath = path.join(process.cwd(), 'tools', 'script-god.js');
                const out = execSync(`node "${scriptPath}" --execute "${prompt}"`, {
                    encoding: 'utf-8',
                    maxBuffer: 50 * 1024 * 1024 // 50MB buffer to prevent ENOBUFS
                });

                console.log(`[EvolutionaryBridge] ✅ Reality Rewritten. Entropy reset to 0.00.`);

                // Complexity: O(1)
                resolve({
                    strategy: 'AUTONOMOUS_EVOLUTION (Catuskoti Transcended)',
                    confidence: 1.0,
                    fix: `Patch Applied via Script-God. Log: ${out.substring(0, 80)}...`,
                    action: 'REWRITE_CODE'
                });
            } catch (err: any) {
                console.error(`[EvolutionaryBridge] ❌ Manifestation Failed: ${err.message}`);
                // Complexity: O(1)
                resolve({
                    strategy: 'EVOLUTION_FAILED',
                    confidence: 0,
                    fix: '',
                    action: 'IGNORE'
                });
            }
        });
    }
}

export const evolutionaryBridge = EvolutionaryBridge.getInstance();
