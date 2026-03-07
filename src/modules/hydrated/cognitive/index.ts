/**
 * 🧠 COGNITIVE CORE - Unified Export
 *
 * Master module that ties together all cognitive capabilities:
 * - NeuralMapEngine: Cognitive Anchors with self-learning selectors
 * - AutonomousExplorer: Self-discovery and site mapping
 * - AutoTestFactory: Self-writing test generation
 * - SelfHealingV2: Real-time test repair
 *
 * @version 1.0.0-QAntum
 * @phase 81-90
 */

// Core modules
export { NeuralMapEngine, CognitiveAnchor, createNeuralMap } from '../../../../scripts/qantum/SaaS-Framework/scripts/OTHERS/neural-map-engine';
export { AutonomousExplorer, SiteMap, DiscoveredPage, createExplorer } from '../../../../scripts/qantum/cognitive/autonomous-explorer';
export { AutoTestFactory, createTestFactory } from '../../../../scripts/qantum/Oracle/auto-test-factory';
export { SelfHealingV2, HealingResult, createSelfHealing } from '../../../../scripts/qantum/cognitive/self-healing-v2';

// Re-export types
export type {
    DiscoveredForm,
    ApiCall,
    TransactionFlow
} from '../../../../scripts/qantum/cognitive/autonomous-explorer';

export type {
    RefactorSuggestion,
    AnchorChange
} from '../../../../scripts/qantum/cognitive/self-healing-v2';

// ============================================================
// COGNITIVE ORCHESTRATOR
// ============================================================
import { NeuralMapEngine } from '../../../../scripts/qantum/SaaS-Framework/scripts/OTHERS/neural-map-engine';
import { AutonomousExplorer, SiteMap } from '../../../../scripts/qantum/cognitive/autonomous-explorer';
import { AutoTestFactory } from '../../../../scripts/qantum/Oracle/auto-test-factory';
import { SelfHealingV2 } from '../../../../scripts/qantum/cognitive/self-healing-v2';
import { EventEmitter } from 'events';

interface CognitiveConfig {
    autoExplore: boolean;
    autoGenerateTests: boolean;
    autoHeal: boolean;
    outputDir: string;
    parallelWorkers: number;
    maxPages: number;
}

/**
 * 🧠 Cognitive Orchestrator - The Brain of QAntum
 *
 * Coordinates all cognitive modules for autonomous test generation
 */
export class CognitiveOrchestrator extends EventEmitter {
    private config: CognitiveConfig;
    private neuralMap: NeuralMapEngine;
    private explorer: AutonomousExplorer;
    private testFactory: AutoTestFactory;
    private selfHealing: SelfHealingV2;

    constructor(config: Partial<CognitiveConfig> = {}) {
        super();

        this.config = {
            autoExplore: true,
            autoGenerateTests: true,
            autoHeal: true,
            outputDir: './cognitive-output',
            parallelWorkers: 4,
            maxPages: 100,
            ...config
        };

        // Initialize modules
        this.neuralMap = new NeuralMapEngine();
        this.explorer = new AutonomousExplorer({
            parallelWorkers: this.config.parallelWorkers,
            maxPages: this.config.maxPages,
            outputDir: `${this.config.outputDir}/exploration`
        });
        this.testFactory = new AutoTestFactory({
            outputDir: `${this.config.outputDir}/tests`
        });
        this.selfHealing = new SelfHealingV2({
            outputDir: `${this.config.outputDir}/healing`
        });

        // Wire up events
        this.setupEventHandlers();
    }

    /**
     * 🚀 Full autonomous pipeline
     */
    // Complexity: O(N) — linear iteration
    async autonomousRun(targetUrl: string): Promise<{
        siteMap: SiteMap;
        testsGenerated: number;
        healingEnabled: boolean;
    }> {
        console.log(`
╔═══════════════════════════════════════════════════════════════╗
║  🧠 COGNITIVE ORCHESTRATOR                                    ║
║                                                               ║
║  "QAntum writes its own tests!"                         ║
╠═══════════════════════════════════════════════════════════════╣
║  Pipeline:                                                    ║
║  1. 🗺️  Explore → Discover site structure                     ║
║  2. 🏭 Generate → Create tests automatically                  ║
║  3. 🔧 Heal → Monitor and self-repair                         ║
╚═══════════════════════════════════════════════════════════════╝
`);

        const startTime = Date.now();

        // Phase 1: Explore
        console.log('📍 PHASE 1: Autonomous Exploration');
        console.log('─'.repeat(60));
        // SAFETY: async operation — wrap in try-catch for production resilience
        const siteMap = await this.explorer.explore(targetUrl);

        // Phase 2: Generate Tests
//         console.log(');
//         console.log('📍 PHASE 2: Test Generation');
        console.log('─'.repeat(60));
        // SAFETY: async operation — wrap in try-catch for production resilience
        const testSuites = await this.testFactory.generateFromSiteMap(siteMap);

        const totalTests = testSuites.reduce((sum, s) => sum + s.tests.length, 0);

        // Phase 3: Enable Self-Healing
//         console.log(');
//         console.log('📍 PHASE 3: Self-Healing Enabled');
        console.log('─'.repeat(60));
        console.log('🔧 Self-healing is now active and monitoring for changes');

        const duration = Date.now() - startTime;

        // Print summary
//         console.log(');
//         console.log('╔═══════════════════════════════════════════════════════════════╗');
        console.log('║  🧠 COGNITIVE PIPELINE COMPLETE                               ║');
        console.log('╠═══════════════════════════════════════════════════════════════╣');
        console.log(`║  Duration: ${(duration / 1000).toFixed(1)}s`.padEnd(62) + '║');
        console.log(`║  Pages explored: ${siteMap.totalPages}`.padEnd(62) + '║');
        console.log(`║  Forms discovered: ${siteMap.totalForms}`.padEnd(62) + '║');
        console.log(`║  API endpoints: ${siteMap.totalApiEndpoints}`.padEnd(62) + '║');
        console.log(`║  Tests generated: ${totalTests}`.padEnd(62) + '║');
        console.log(`║  Transaction flows: ${siteMap.transactionFlows.length}`.padEnd(62) + '║');
        console.log('╚═══════════════════════════════════════════════════════════════╝');

        this.emit('pipeline:complete', {
            siteMap,
            testsGenerated: totalTests,
            duration
        });

        return {
            siteMap,
            testsGenerated: totalTests,
            healingEnabled: true
        };
    }

    /**
     * Setup event handlers
     */
    // Complexity: O(1)
    private setupEventHandlers(): void {
        this.explorer.on('page:crawled', (page) => {
            this.emit('exploration:page', page);
        });

        this.explorer.on('exploration:complete', (siteMap) => {
            this.emit('exploration:complete', siteMap);
        });

        this.selfHealing.on('healing:complete', (result) => {
            this.emit('healing:complete', result);
        });
    }

    /**
     * Get individual modules
     */
    // Complexity: O(1)
    getNeuralMap(): NeuralMapEngine {
        return this.neuralMap;
    }

    // Complexity: O(1)
    getExplorer(): AutonomousExplorer {
        return this.explorer;
    }

    // Complexity: O(1)
    getTestFactory(): AutoTestFactory {
        return this.testFactory;
    }

    // Complexity: O(1)
    getSelfHealing(): SelfHealingV2 {
        return this.selfHealing;
    }
}

/**
 * Factory function
 */
export function createCognitiveOrchestrator(
    config?: Partial<CognitiveConfig>
): CognitiveOrchestrator {
    return new CognitiveOrchestrator(config);
}
