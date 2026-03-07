"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * QAntum
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * @copyright 2025 Димитър Продромов (Dimitar Prodromov). All Rights Reserved.
 * @license PROPRIETARY AND CONFIDENTIAL
 *
 * This file is part of QAntum.
 * Unauthorized copying, modification, distribution, or use of this file,
 * via any medium, is strictly prohibited without express written permission.
 *
 * For licensing inquiries: dimitar.papazov@QAntum.dev
 * ═══════════════════════════════════════════════════════════════════════════════
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 🧬 SEGC Tests - Self-Evolving Genetic Core
 *
 * @version 18.0.0
 */
const vitest_1 = require("vitest");
const segc_1 = require("../src/segc");
(0, vitest_1.describe)('🧬 Self-Evolving Genetic Core v18.0', () => {
    // ═══════════════════════════════════════════════════════════════════════════
    // GHOST EXECUTION LAYER TESTS
    // ═══════════════════════════════════════════════════════════════════════════
    (0, vitest_1.describe)('👻 Ghost Execution Layer', () => {
        let ghost;
        (0, vitest_1.beforeEach)(() => {
            ghost = new segc_1.GhostExecutionLayer();
        });
        (0, vitest_1.afterEach)(async () => {
            await ghost.shutdown();
        });
        (0, vitest_1.it)('should generate alternative paths for a selector', () => {
            const alternatives = ghost.generateAlternativePaths('#login-button', 'Login', 'button');
            (0, vitest_1.expect)(alternatives).toBeDefined();
            (0, vitest_1.expect)(alternatives.length).toBeGreaterThan(1);
            (0, vitest_1.expect)(alternatives[0].selector).toBe('#login-button');
            (0, vitest_1.expect)(alternatives.some(a => a.strategy === 'text')).toBe(true);
        });
        (0, vitest_1.it)('should include text-based alternative', () => {
            const alternatives = ghost.generateAlternativePaths('button.submit-btn', 'Submit Form');
            const textPath = alternatives.find(a => a.strategy === 'text');
            (0, vitest_1.expect)(textPath).toBeDefined();
            (0, vitest_1.expect)(textPath?.selector).toBe('Submit Form');
        });
        (0, vitest_1.it)('should simplify complex selectors', () => {
            const alternatives = ghost.generateAlternativePaths('div.container > form#login > button[data-testid="submit"]:nth-child(2)');
            // Should have a simplified version
            const simplified = alternatives.find(a => a.name === 'Path C (Simplified)');
            (0, vitest_1.expect)(simplified).toBeDefined();
        });
        (0, vitest_1.it)('should track statistics', () => {
            const stats = ghost.getStats();
            (0, vitest_1.expect)(stats).toHaveProperty('totalSessions');
            (0, vitest_1.expect)(stats).toHaveProperty('pathsTested');
            (0, vitest_1.expect)(stats).toHaveProperty('improvementsFound');
            (0, vitest_1.expect)(stats).toHaveProperty('knowledgeBaseSize');
        });
        (0, vitest_1.it)('should export and import knowledge', () => {
            const knowledge = ghost.exportKnowledge();
            (0, vitest_1.expect)(Array.isArray(knowledge)).toBe(true);
            ghost.importKnowledge([{
                    pathHash: 'test_hash',
                    successRate: 0.9,
                    avgTime: 100,
                    sampleCount: 5,
                    lastUpdated: new Date(),
                }]);
            (0, vitest_1.expect)(ghost.getStats().knowledgeBaseSize).toBe(1);
        });
    });
    // ═══════════════════════════════════════════════════════════════════════════
    // PREDICTIVE STATE PRE-LOADER TESTS
    // ═══════════════════════════════════════════════════════════════════════════
    (0, vitest_1.describe)('🔮 Predictive State Pre-loader', () => {
        let predictive;
        (0, vitest_1.beforeEach)(() => {
            predictive = new segc_1.PredictiveStatePreloader();
        });
        (0, vitest_1.afterEach)(async () => {
            await predictive.shutdown();
        });
        (0, vitest_1.it)('should learn state transitions', () => {
            predictive.learnTransition('login', 'dashboard', 500);
            predictive.learnTransition('login', 'dashboard', 450);
            predictive.learnTransition('login', 'error', 100);
            const stats = predictive.getTransitionStats();
            (0, vitest_1.expect)(stats.length).toBe(2);
            (0, vitest_1.expect)(stats.find(t => t.from === 'login' && t.to === 'dashboard')).toBeDefined();
        });
        (0, vitest_1.it)('should predict next states', () => {
            // Learn some transitions
            predictive.learnTransition('home', 'products', 200);
            predictive.learnTransition('home', 'about', 150);
            predictive.learnTransition('home', 'products', 180);
            const predictions = predictive.predictNextStates('home');
            (0, vitest_1.expect)(predictions.length).toBeGreaterThan(0);
            // Products should be more likely
            (0, vitest_1.expect)(predictions[0].stateId).toBe('products');
        });
        (0, vitest_1.it)('should register and cache selectors', () => {
            const selector = predictive.registerSelector('dashboard', '#user-profile', {
                textContent: 'Profile',
                ariaLabel: 'User Profile',
            });
            (0, vitest_1.expect)(selector.original).toBe('#user-profile');
            (0, vitest_1.expect)(selector.alternatives.length).toBeGreaterThan(0);
        });
        (0, vitest_1.it)('should cache DOM snapshots', () => {
            predictive.cacheDOMSnapshot('login', '<html><body>Login Page</body></html>');
            const cached = predictive.getCachedDOM('login');
            (0, vitest_1.expect)(cached).toContain('Login Page');
        });
        (0, vitest_1.it)('should export and import state machine', () => {
            predictive.learnTransition('A', 'B', 100);
            predictive.learnTransition('B', 'C', 150);
            const exported = predictive.exportStateMachine();
            (0, vitest_1.expect)(exported.states).toContain('A');
            (0, vitest_1.expect)(exported.states).toContain('B');
            (0, vitest_1.expect)(exported.transitions.length).toBe(2);
            // Import into new instance
            const newPreloader = new segc_1.PredictiveStatePreloader();
            newPreloader.importStateMachine(exported);
            (0, vitest_1.expect)(newPreloader.getStats().transitionCount).toBe(2);
        });
    });
    // ═══════════════════════════════════════════════════════════════════════════
    // GENETIC MUTATION ENGINE TESTS
    // ═══════════════════════════════════════════════════════════════════════════
    (0, vitest_1.describe)('🧬 Genetic Mutation Engine', () => {
        let mutations;
        (0, vitest_1.beforeEach)(() => {
            mutations = new segc_1.GeneticMutationEngine();
        });
        (0, vitest_1.afterEach)(async () => {
            await mutations.shutdown();
        });
        (0, vitest_1.it)('should record failures and detect patterns', () => {
            const pattern = mutations.recordFailure({
                error: 'Timeout: element not found',
                selector: '#login-button',
                testName: 'login.test.ts',
            });
            (0, vitest_1.expect)(pattern).toBeDefined();
            (0, vitest_1.expect)(pattern.errorType).toBe('timeout');
        });
        (0, vitest_1.it)('should generate mutation after repeated failures', () => {
            // Record same failure multiple times
            for (let i = 0; i < 4; i++) {
                mutations.recordFailure({
                    error: 'Element not found: #submit',
                    selector: '#submit',
                    testName: 'form.test.ts',
                });
            }
            const pending = mutations.getPendingMutations();
            (0, vitest_1.expect)(pending.length).toBeGreaterThan(0);
            (0, vitest_1.expect)(pending[0].type).toBe(segc_1.MutationType.WAIT_INJECTION);
        });
        (0, vitest_1.it)('should classify different error types', () => {
            const timeoutPattern = mutations.recordFailure({
                error: 'Timeout exceeded',
                selector: '#btn',
            });
            (0, vitest_1.expect)(timeoutPattern.errorType).toBe('timeout');
            const notFoundPattern = mutations.recordFailure({
                error: 'No element found for selector',
                selector: '#missing',
            });
            (0, vitest_1.expect)(notFoundPattern.errorType).toBe('element_not_found');
        });
        (0, vitest_1.it)('should track mutation statistics', () => {
            const stats = mutations.getStats();
            (0, vitest_1.expect)(stats).toHaveProperty('patternsDetected');
            (0, vitest_1.expect)(stats).toHaveProperty('mutationsGenerated');
            (0, vitest_1.expect)(stats).toHaveProperty('mutationsApplied');
            (0, vitest_1.expect)(stats).toHaveProperty('successRate');
        });
        (0, vitest_1.it)('should support custom mutation rules', () => {
            mutations.addMutationRule('custom_error', (pattern) => ({
                id: 'custom_mut',
                type: segc_1.MutationType.ERROR_HANDLING,
                targetSelector: pattern.selector || '',
                originalCode: '',
                mutatedCode: 'try { } catch { }',
                confidence: 0.9,
                generatedAt: new Date(),
                status: 'pending',
                parentPattern: pattern.id,
            }));
            // Record failure that matches custom rule
            for (let i = 0; i < 4; i++) {
                mutations.recordFailure({
                    error: 'custom_error: something bad',
                    selector: '#test',
                });
            }
        });
    });
    // ═══════════════════════════════════════════════════════════════════════════
    // HOT-SWAP MODULE LOADER TESTS
    // ═══════════════════════════════════════════════════════════════════════════
    (0, vitest_1.describe)('🔥 Hot-Swap Module Loader', () => {
        let hotswap;
        (0, vitest_1.beforeEach)(() => {
            hotswap = new segc_1.HotSwapModuleLoader();
        });
        (0, vitest_1.afterEach)(async () => {
            await hotswap.shutdown();
        });
        (0, vitest_1.it)('should register a module with methods', () => {
            class TestService {
                greet(name) { return `Hello, ${name}!`; }
                add(a, b) { return a + b; }
            }
            const module = hotswap.registerModule('TestService', new TestService());
            (0, vitest_1.expect)(module.name).toBe('TestService');
            (0, vitest_1.expect)(module.methods.size).toBe(2);
        });
        (0, vitest_1.it)('should add alternative implementations', () => {
            class Calculator {
                multiply(a, b) { return a * b; }
            }
            const module = hotswap.registerModule('Calculator', new Calculator());
            // Get the registered method from module.methods Map
            // Keys are method names, values are SwappableMethod objects
            (0, vitest_1.expect)(module.methods.size).toBeGreaterThan(0);
            // Get first method entry
            const [methodName, method] = Array.from(module.methods.entries())[0];
            // The method ID for addAlternative should be the full ID (moduleId:methodName)
            const alt = hotswap.addAlternative(method.id, // Use method.id which is the full ID
            (a, b) => a * b * 1.1, // 10% boost
            { name: 'Boosted Multiply' });
            (0, vitest_1.expect)(alt.name).toBe('Boosted Multiply');
            (0, vitest_1.expect)(method.alternatives.length).toBe(1);
        });
        (0, vitest_1.it)('should track statistics', () => {
            const stats = hotswap.getStats();
            (0, vitest_1.expect)(stats).toHaveProperty('modulesRegistered');
            (0, vitest_1.expect)(stats).toHaveProperty('methodsRegistered');
            (0, vitest_1.expect)(stats).toHaveProperty('swapsPerformed');
        });
        (0, vitest_1.it)('should export configuration', () => {
            class Service {
                run() { return 'running'; }
            }
            hotswap.registerModule('Service', new Service());
            const config = hotswap.exportConfig();
            (0, vitest_1.expect)(config.modules.length).toBe(1);
            (0, vitest_1.expect)(config.modules[0].name).toBe('Service');
        });
    });
    // ═══════════════════════════════════════════════════════════════════════════
    // STATE VERSIONING SYSTEM TESTS
    // ═══════════════════════════════════════════════════════════════════════════
    (0, vitest_1.describe)('🔄 State Versioning System', () => {
        let versioning;
        (0, vitest_1.beforeEach)(() => {
            versioning = new segc_1.StateVersioningSystem();
        });
        (0, vitest_1.afterEach)(async () => {
            await versioning.shutdown();
        });
        (0, vitest_1.it)('should create versions', () => {
            const version = versioning.createVersion({
                name: 'Strategy A',
                description: 'Initial strategy',
                strategy: { selector: '#btn' },
                isBaseline: true,
            });
            (0, vitest_1.expect)(version.id).toBeDefined();
            (0, vitest_1.expect)(version.name).toBe('Strategy A');
            (0, vitest_1.expect)(version.isBaseline).toBe(true);
        });
        (0, vitest_1.it)('should activate versions', () => {
            const v1 = versioning.createVersion({
                name: 'V1',
                strategy: { timeout: 5000 },
            });
            versioning.activateVersion(v1.id);
            const active = versioning.selectVersion();
            (0, vitest_1.expect)(active?.id).toBe(v1.id);
        });
        (0, vitest_1.it)('should run A/B experiments', () => {
            const vA = versioning.createVersion({
                name: 'Version A',
                strategy: { wait: 1000 },
            });
            const vB = versioning.createVersion({
                name: 'Version B',
                strategy: { wait: 500 },
            });
            const experimentId = versioning.startExperiment(vA.id, vB.id, 0.5);
            (0, vitest_1.expect)(experimentId).toBeDefined();
            const experiment = versioning.getExperiment(experimentId);
            (0, vitest_1.expect)(experiment).toBeDefined();
            (0, vitest_1.expect)(experiment?.versionA).toBe(vA.id);
            (0, vitest_1.expect)(experiment?.versionB).toBe(vB.id);
        });
        (0, vitest_1.it)('should record results and track metrics', () => {
            const version = versioning.createVersion({
                name: 'Test Version',
                strategy: {},
            });
            versioning.activateVersion(version.id);
            // Record some results
            for (let i = 0; i < 10; i++) {
                versioning.recordResult(version.id, {
                    success: i < 8, // 80% success rate
                    executionTime: 100 + Math.random() * 50,
                });
            }
            const metrics = versioning.getVersionMetrics(version.id);
            (0, vitest_1.expect)(metrics?.successCount).toBe(8);
            (0, vitest_1.expect)(metrics?.totalExecutions).toBe(10);
        });
        (0, vitest_1.it)('should rollback to baseline', () => {
            const baseline = versioning.createVersion({
                name: 'Baseline',
                strategy: { stable: true },
                isBaseline: true,
            });
            const experimental = versioning.createVersion({
                name: 'Experimental',
                strategy: { risky: true },
            });
            versioning.activateVersion(experimental.id);
            versioning.rollbackToBaseline();
            const active = versioning.selectVersion();
            (0, vitest_1.expect)(active?.id).toBe(baseline.id);
        });
    });
    // ═══════════════════════════════════════════════════════════════════════════
    // SEGC CONTROLLER TESTS
    // ═══════════════════════════════════════════════════════════════════════════
    (0, vitest_1.describe)('🧬 SEGC Controller', () => {
        let segc;
        (0, vitest_1.beforeEach)(() => {
            segc = new segc_1.SEGCController({ verbose: false });
        });
        (0, vitest_1.afterEach)(async () => {
            await segc.shutdown();
        });
        (0, vitest_1.it)('should initialize all components', () => {
            (0, vitest_1.expect)(segc.ghost).toBeInstanceOf(segc_1.GhostExecutionLayer);
            (0, vitest_1.expect)(segc.predictive).toBeInstanceOf(segc_1.PredictiveStatePreloader);
            (0, vitest_1.expect)(segc.mutations).toBeInstanceOf(segc_1.GeneticMutationEngine);
            (0, vitest_1.expect)(segc.hotswap).toBeInstanceOf(segc_1.HotSwapModuleLoader);
            (0, vitest_1.expect)(segc.versioning).toBeInstanceOf(segc_1.StateVersioningSystem);
        });
        (0, vitest_1.it)('should provide comprehensive statistics', () => {
            const stats = segc.getStats();
            (0, vitest_1.expect)(stats).toHaveProperty('ghostExecutions');
            (0, vitest_1.expect)(stats).toHaveProperty('ghostImprovements');
            (0, vitest_1.expect)(stats).toHaveProperty('predictionsMade');
            (0, vitest_1.expect)(stats).toHaveProperty('predictionAccuracy');
            (0, vitest_1.expect)(stats).toHaveProperty('mutationsProposed');
            (0, vitest_1.expect)(stats).toHaveProperty('mutationsApplied');
            (0, vitest_1.expect)(stats).toHaveProperty('hotSwapsPerformed');
            (0, vitest_1.expect)(stats).toHaveProperty('overallFitnessImprovement');
            (0, vitest_1.expect)(stats).toHaveProperty('uptime');
        });
        (0, vitest_1.it)('should run learning cycles', async () => {
            const result = await segc.runLearningCycle();
            (0, vitest_1.expect)(result).toHaveProperty('improvements');
            (0, vitest_1.expect)(result).toHaveProperty('mutations');
            (0, vitest_1.expect)(result).toHaveProperty('predictions');
        });
        (0, vitest_1.it)('should record failures', () => {
            segc.recordFailure({
                error: 'Timeout waiting for selector',
                selector: '#test-element',
                testName: 'sample.test.ts',
            });
            const patterns = segc.mutations.getFailurePatterns();
            (0, vitest_1.expect)(patterns.length).toBe(1);
        });
        (0, vitest_1.it)('should record state changes', () => {
            segc.recordStateChange('login');
            segc.recordStateChange('dashboard');
            segc.recordStateChange('profile');
            const transitions = segc.predictive.getTransitionStats();
            (0, vitest_1.expect)(transitions.length).toBeGreaterThan(0);
        });
        (0, vitest_1.it)('should create strategy versions', () => {
            const version = segc.createVersion({
                name: 'Strategy V1',
                description: 'First iteration',
                strategy: { timeout: 10000 },
                isBaseline: true,
            });
            (0, vitest_1.expect)(version).toBeDefined();
            (0, vitest_1.expect)(version?.name).toBe('Strategy V1');
        });
        (0, vitest_1.it)('should export and import knowledge', () => {
            // Add some data
            segc.recordStateChange('A');
            segc.recordStateChange('B');
            const knowledge = segc.exportKnowledge();
            (0, vitest_1.expect)(knowledge.ghost).toBeDefined();
            (0, vitest_1.expect)(knowledge.predictive).toBeDefined();
            (0, vitest_1.expect)(knowledge.mutations).toBeDefined();
            (0, vitest_1.expect)(knowledge.versioning).toBeDefined();
        });
    });
});
