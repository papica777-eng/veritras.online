"use strict";
/**
 * 🧠 COGNITIVE CORE - Unified Export
 *
 * Master module that ties together all cognitive capabilities:
 * - NeuralMapEngine: Cognitive Anchors with self-learning selectors
 * - AutonomousExplorer: Self-discovery and site mapping
 * - AutoTestFactory: Self-writing test generation
 * - SelfHealingV2: Real-time test repair
 *
 * @version 1.0.0
 * @phase 81-90
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CognitiveOrchestrator = exports.createSelfHealing = exports.HealingResult = exports.SelfHealingV2 = exports.createTestFactory = exports.AutoTestFactory = exports.createExplorer = exports.DiscoveredPage = exports.SiteMap = exports.AutonomousExplorer = exports.createNeuralMap = exports.CognitiveAnchor = exports.NeuralMapEngine = void 0;
exports.createCognitiveOrchestrator = createCognitiveOrchestrator;
// Core modules
var neural_map_engine_1 = require("./neural-map-engine");
Object.defineProperty(exports, "NeuralMapEngine", { enumerable: true, get: function () { return neural_map_engine_1.NeuralMapEngine; } });
Object.defineProperty(exports, "CognitiveAnchor", { enumerable: true, get: function () { return neural_map_engine_1.CognitiveAnchor; } });
Object.defineProperty(exports, "createNeuralMap", { enumerable: true, get: function () { return neural_map_engine_1.createNeuralMap; } });
var autonomous_explorer_1 = require("./autonomous-explorer");
Object.defineProperty(exports, "AutonomousExplorer", { enumerable: true, get: function () { return autonomous_explorer_1.AutonomousExplorer; } });
Object.defineProperty(exports, "SiteMap", { enumerable: true, get: function () { return autonomous_explorer_1.SiteMap; } });
Object.defineProperty(exports, "DiscoveredPage", { enumerable: true, get: function () { return autonomous_explorer_1.DiscoveredPage; } });
Object.defineProperty(exports, "createExplorer", { enumerable: true, get: function () { return autonomous_explorer_1.createExplorer; } });
var auto_test_factory_1 = require("./auto-test-factory");
Object.defineProperty(exports, "AutoTestFactory", { enumerable: true, get: function () { return auto_test_factory_1.AutoTestFactory; } });
Object.defineProperty(exports, "createTestFactory", { enumerable: true, get: function () { return auto_test_factory_1.createTestFactory; } });
var self_healing_v2_1 = require("./self-healing-v2");
Object.defineProperty(exports, "SelfHealingV2", { enumerable: true, get: function () { return self_healing_v2_1.SelfHealingV2; } });
Object.defineProperty(exports, "HealingResult", { enumerable: true, get: function () { return self_healing_v2_1.HealingResult; } });
Object.defineProperty(exports, "createSelfHealing", { enumerable: true, get: function () { return self_healing_v2_1.createSelfHealing; } });
// ============================================================
// COGNITIVE ORCHESTRATOR
// ============================================================
const neural_map_engine_2 = require("./neural-map-engine");
const autonomous_explorer_2 = require("./autonomous-explorer");
const auto_test_factory_2 = require("./auto-test-factory");
const self_healing_v2_2 = require("./self-healing-v2");
const events_1 = require("events");
/**
 * 🧠 Cognitive Orchestrator - The Brain of QANTUM
 *
 * Coordinates all cognitive modules for autonomous test generation
 */
class CognitiveOrchestrator extends events_1.EventEmitter {
    config;
    neuralMap;
    explorer;
    testFactory;
    selfHealing;
    constructor(config = {}) {
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
        this.neuralMap = new neural_map_engine_2.NeuralMapEngine();
        this.explorer = new autonomous_explorer_2.AutonomousExplorer({
            parallelWorkers: this.config.parallelWorkers,
            maxPages: this.config.maxPages,
            outputDir: `${this.config.outputDir}/exploration`
        });
        this.testFactory = new auto_test_factory_2.AutoTestFactory({
            outputDir: `${this.config.outputDir}/tests`
        });
        this.selfHealing = new self_healing_v2_2.SelfHealingV2({
            outputDir: `${this.config.outputDir}/healing`
        });
        // Wire up events
        this.setupEventHandlers();
    }
    /**
     * 🚀 Full autonomous pipeline
     */
    // Complexity: O(N) — linear scan
    async autonomousRun(targetUrl) {
        console.log(`
╔═══════════════════════════════════════════════════════════════╗
║  🧠 COGNITIVE ORCHESTRATOR                                    ║
║                                                               ║
║  "QANTUM writes its own tests!"                         ║
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
    setupEventHandlers() {
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
    getNeuralMap() {
        return this.neuralMap;
    }
    // Complexity: O(1)
    getExplorer() {
        return this.explorer;
    }
    // Complexity: O(1)
    getTestFactory() {
        return this.testFactory;
    }
    // Complexity: O(1)
    getSelfHealing() {
        return this.selfHealing;
    }
}
exports.CognitiveOrchestrator = CognitiveOrchestrator;
/**
 * Factory function
 */
function createCognitiveOrchestrator(config) {
    return new CognitiveOrchestrator(config);
}
