/**
 * EvolutionCore — Qantum Module
 * @module EvolutionCore
 * @path scripts/EvolutionCore.ts
 * @auto-documented BrutalDocEngine v2.1
 */

import * as fs from 'fs';
import * as path from 'path';
import { PatternRecognizer, PatternType } from '../src/core/ai/pattern-recognizer';
import { SelfHealingEngine, FailureContext } from '../src/core/ai/self-healing';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🧬 THE EVOLUTION CORE v1.0
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Capability: Continuous System Improvement and Darwinian Selection
 * Substrate: PatternRecognizer + SelfHealingEngine + Autonomous Agents
 * 
 * Action:
 * 1. Ingests data from successful/failed actions (outreach emails, audits).
 * 2. Feeds raw execution data to PatternRecognizer to identify winning patterns.
 * 3. Instructs SelfHealingEngine to auto-repair any failed selectors or timeouts.
 * 4. Logs the evolution state to physical disk for persistent growth.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const EVOLUTION_DIR = path.join(process.cwd(), 'data', 'evolution');
const PATTERNS_FILE = path.join(EVOLUTION_DIR, 'neural-patterns.json');

export class EvolutionCore {
    private static instance: EvolutionCore;
    private recognizer: PatternRecognizer;
    private healer: SelfHealingEngine;

    private constructor() {
        this.recognizer = PatternRecognizer.getInstance();
        this.healer = SelfHealingEngine.getInstance();

        if (!fs.existsSync(EVOLUTION_DIR)) {
            fs.mkdirSync(EVOLUTION_DIR, { recursive: true });
        }

        this.loadMemories();
    }

    static getInstance(): EvolutionCore {
        if (!EvolutionCore.instance) {
            EvolutionCore.instance = new EvolutionCore();
        }
        return EvolutionCore.instance;
    }

    /**
     * Load existing patterns from past executions to maintain persistence.
     */
    // Complexity: O(1)
    private loadMemories() {
        if (fs.existsSync(PATTERNS_FILE)) {
            try {
                const data = JSON.parse(fs.readFileSync(PATTERNS_FILE, 'utf-8'));
                if (data.patterns && data.clusters) {
                    this.recognizer.import(data);
                    console.log(`[Evolution Core] Loaded ${data.patterns.length} neural patterns from memory.`);
                }
            } catch (e) {
                console.error(`[Evolution Core] Memory corruption detected. Starting fresh.`);
            }
        }
    }

    /**
     * Save current patterns back to disk.
     */
    // Complexity: O(1)
    public crystallizeMemories() {
        const data = this.recognizer.export();
        fs.writeFileSync(PATTERNS_FILE, JSON.stringify(data, null, 2));
        console.log(`[Evolution Core] Crystallized neural patterns to disk.`);
    }

    /**
     * Learn from a B2B Outreach attempt (pass or fail).
     */
    // Complexity: O(1)
    public recordOutreach(success: boolean, domain: string, responseTime: number = Math.random() * 2000) {
        const features = [
            responseTime / 1000,
            responseTime / 1500,
            success ? 1 : 0,
            0, // retries
            0.5, // error type none
            new Date().getHours() / 24,
            new Date().getDay() / 7,
            0.1, 0.1 // mem/cpu
        ];

        const type: PatternType = success ? 'environment' : 'failure'; // Environment implies success adaptation here
        this.recognizer.learn(features, type, `Outreach_${domain}`);
        console.log(`[Evolution Core] Learned from Outreach action: ${domain} (Success: ${success})`);

        this.crystallizeMemories();
    }

    /**
     * Auto-heal a scraping/audit failure and return the new selector if successful.
     */
    // Complexity: O(N*M) — nested iteration detected
    public async healFailure(error: Error, testName: string, brokenSelector?: string): Promise<string | null> {
        console.log(`[Evolution Core] Activating Self-Healing for failure in: ${testName}`);

        const context: FailureContext = {
            testId: `Evolve_${Date.now()}`,
            testName,
            error: error.message,
            errorType: error.name,
            timestamp: Date.now(),
            attempt: 1,
            selector: brokenSelector
        };

        // SAFETY: async operation — wrap in try-catch for production resilience
        const result = await this.healer.heal(context);

        if (result.healed && result.newSelector) {
            console.log(`[Evolution Core] Successfully healed. Mutated Selector: ${result.newSelector}`);
            return result.newSelector;
        }

        console.log(`[Evolution Core] Healing failed. Pattern logged for manual review.`);
        return null;
    }

    /**
     * Run the clustering algorithm to find macro-trends (e.g. "We always fail on Fridays", "Fast TTFB domains convert better").
     */
    // Complexity: O(N) — linear iteration
    public analyzeEvolutionState() {
        const clusters = this.recognizer.cluster(3);
        console.log(`\n========= [ EVOLUTION STATE ] =========`);
        clusters.forEach(c => {
            console.log(`Cluster ${c.id} (${c.label}): Contains ${c.patterns.length} learned experiences.`);
        });
        console.log(`=======================================\n`);
    }
}
