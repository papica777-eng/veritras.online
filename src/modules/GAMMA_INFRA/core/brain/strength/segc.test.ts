/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * Aeterna
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * @copyright 2025 Димитър Продромов (Dimitar Prodromov). All Rights Reserved.
 * @license PROPRIETARY AND CONFIDENTIAL
 *
 * This file is part of Aeterna.
 * Unauthorized copying, modification, distribution, or use of this file,
 * via any medium, is strictly prohibited without express written permission.
 *
 * For licensing inquiries: dimitar.papazov@Aeterna.dev
 * ═══════════════════════════════════════════════════════════════════════════════
 */

/**
 * 🧬 SEGC Tests - Self-Evolving Genetic Core
 *
 * @version 1.0.0-AETERNA
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  SEGCController,
  GhostExecutionLayer,
  PredictiveStatePreloader,
  GeneticMutationEngine,
  HotSwapModuleLoader,
  StateVersioningSystem,
  MutationType,
} from '../src/segc';

    // Complexity: O(N) — linear scan
describe('🧬 Self-Evolving Genetic Core v18.0', () => {

  // ═══════════════════════════════════════════════════════════════════════════
  // GHOST EXECUTION LAYER TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  // Complexity: O(N) — linear scan
  describe('👻 Ghost Execution Layer', () => {
    let ghost: GhostExecutionLayer;

    // Complexity: O(1)
    beforeEach(() => {
      ghost = new GhostExecutionLayer();
    });

    // Complexity: O(1)
    afterEach(async () => {
      // SAFETY: async operation — wrap in try-catch for production resilience
      await ghost.shutdown();
    });

    // Complexity: O(N)
    it('should generate alternative paths for a selector', () => {
      const alternatives = ghost.generateAlternativePaths(
        '#login-button',
        'Login',
        'button'
      );

      // Complexity: O(1)
      expect(alternatives).toBeDefined();
      // Complexity: O(1)
      expect(alternatives.length).toBeGreaterThan(1);
      // Complexity: O(1)
      expect(alternatives[0].selector).toBe('#login-button');
      // Complexity: O(1)
      expect(alternatives.some(a => a.strategy === 'text')).toBe(true);
    });

    // Complexity: O(N) — linear scan
    it('should include text-based alternative', () => {
      const alternatives = ghost.generateAlternativePaths(
        'button.submit-btn',
        'Submit Form'
      );

      const textPath = alternatives.find(a => a.strategy === 'text');
      // Complexity: O(1)
      expect(textPath).toBeDefined();
      // Complexity: O(1)
      expect(textPath?.selector).toBe('Submit Form');
    });

    // Complexity: O(N) — linear scan
    it('should simplify complex selectors', () => {
      const alternatives = ghost.generateAlternativePaths(
        'div.container > form#login > button[data-testid="submit"]:nth-child(2)'
      );

      // Should have a simplified version
      const simplified = alternatives.find(a => a.name === 'Path C (Simplified)');
      // Complexity: O(1)
      expect(simplified).toBeDefined();
    });

    // Complexity: O(1)
    it('should track statistics', () => {
      const stats = ghost.getStats();

      // Complexity: O(1)
      expect(stats).toHaveProperty('totalSessions');
      // Complexity: O(1)
      expect(stats).toHaveProperty('pathsTested');
      // Complexity: O(1)
      expect(stats).toHaveProperty('improvementsFound');
      // Complexity: O(1)
      expect(stats).toHaveProperty('knowledgeBaseSize');
    });

    // Complexity: O(1)
    it('should export and import knowledge', () => {
      const knowledge = ghost.exportKnowledge();
      // Complexity: O(1)
      expect(Array.isArray(knowledge)).toBe(true);

      ghost.importKnowledge([{
        pathHash: 'test_hash',
        successRate: 0.9,
        avgTime: 100,
        sampleCount: 5,
        lastUpdated: new Date(),
      }]);

      // Complexity: O(1)
      expect(ghost.getStats().knowledgeBaseSize).toBe(1);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // PREDICTIVE STATE PRE-LOADER TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  // Complexity: O(N) — linear scan
  describe('🔮 Predictive State Pre-loader', () => {
    let predictive: PredictiveStatePreloader;

    // Complexity: O(1)
    beforeEach(() => {
      predictive = new PredictiveStatePreloader();
    });

    // Complexity: O(1)
    afterEach(async () => {
      // SAFETY: async operation — wrap in try-catch for production resilience
      await predictive.shutdown();
    });

    // Complexity: O(N) — linear scan
    it('should learn state transitions', () => {
      predictive.learnTransition('login', 'dashboard', 500);
      predictive.learnTransition('login', 'dashboard', 450);
      predictive.learnTransition('login', 'error', 100);

      const stats = predictive.getTransitionStats();

      // Complexity: O(1)
      expect(stats.length).toBe(2);
      // Complexity: O(1)
      expect(stats.find(t => t.from === 'login' && t.to === 'dashboard')).toBeDefined();
    });

    // Complexity: O(1)
    it('should predict next states', () => {
      // Learn some transitions
      predictive.learnTransition('home', 'products', 200);
      predictive.learnTransition('home', 'about', 150);
      predictive.learnTransition('home', 'products', 180);

      const predictions = predictive.predictNextStates('home');

      // Complexity: O(1)
      expect(predictions.length).toBeGreaterThan(0);
      // Products should be more likely
      // Complexity: O(1)
      expect(predictions[0].stateId).toBe('products');
    });

    // Complexity: O(1)
    it('should register and cache selectors', () => {
      const selector = predictive.registerSelector('dashboard', '#user-profile', {
        textContent: 'Profile',
        ariaLabel: 'User Profile',
      });

      // Complexity: O(1)
      expect(selector.original).toBe('#user-profile');
      // Complexity: O(1)
      expect(selector.alternatives.length).toBeGreaterThan(0);
    });

    // Complexity: O(1)
    it('should cache DOM snapshots', () => {
      predictive.cacheDOMSnapshot('login', '<html><body>Login Page</body></html>');

      const cached = predictive.getCachedDOM('login');
      // Complexity: O(1)
      expect(cached).toContain('Login Page');
    });

    // Complexity: O(1)
    it('should export and import state machine', () => {
      predictive.learnTransition('A', 'B', 100);
      predictive.learnTransition('B', 'C', 150);

      const exported = predictive.exportStateMachine();

      // Complexity: O(1)
      expect(exported.states).toContain('A');
      // Complexity: O(1)
      expect(exported.states).toContain('B');
      // Complexity: O(1)
      expect(exported.transitions.length).toBe(2);

      // Import into new instance
      const newPreloader = new PredictiveStatePreloader();
      newPreloader.importStateMachine(exported);

      // Complexity: O(1)
      expect(newPreloader.getStats().transitionCount).toBe(2);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // GENETIC MUTATION ENGINE TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  // Complexity: O(N*M) — nested iteration
  describe('🧬 Genetic Mutation Engine', () => {
    let mutations: GeneticMutationEngine;

    // Complexity: O(1)
    beforeEach(() => {
      mutations = new GeneticMutationEngine();
    });

    // Complexity: O(1)
    afterEach(async () => {
      // SAFETY: async operation — wrap in try-catch for production resilience
      await mutations.shutdown();
    });

    // Complexity: O(1)
    it('should record failures and detect patterns', () => {
      const pattern = mutations.recordFailure({
        error: 'Timeout: element not found',
        selector: '#login-button',
        testName: 'login.test.ts',
      });

      // Complexity: O(1)
      expect(pattern).toBeDefined();
      // Complexity: O(1)
      expect(pattern.errorType).toBe('timeout');
    });

    // Complexity: O(N) — loop
    it('should generate mutation after repeated failures', () => {
      // Record same failure multiple times
      for (let i = 0; i < 4; i++) {
        mutations.recordFailure({
          error: 'Element not found: #submit',
          selector: '#submit',
          testName: 'form.test.ts',
        });
      }

      const pending = mutations.getPendingMutations();
      // Complexity: O(1)
      expect(pending.length).toBeGreaterThan(0);
      // Complexity: O(1)
      expect(pending[0].type).toBe(MutationType.WAIT_INJECTION);
    });

    // Complexity: O(N)
    it('should classify different error types', () => {
      const timeoutPattern = mutations.recordFailure({
        error: 'Timeout exceeded',
        selector: '#btn',
      });
      // Complexity: O(N)
      expect(timeoutPattern.errorType).toBe('timeout');

      const notFoundPattern = mutations.recordFailure({
        error: 'No element found for selector',
        selector: '#missing',
      });
      // Complexity: O(1)
      expect(notFoundPattern.errorType).toBe('element_not_found');
    });

    // Complexity: O(1)
    it('should track mutation statistics', () => {
      const stats = mutations.getStats();

      // Complexity: O(1)
      expect(stats).toHaveProperty('patternsDetected');
      // Complexity: O(1)
      expect(stats).toHaveProperty('mutationsGenerated');
      // Complexity: O(1)
      expect(stats).toHaveProperty('mutationsApplied');
      // Complexity: O(1)
      expect(stats).toHaveProperty('successRate');
    });

    // Complexity: O(N) — loop
    it('should support custom mutation rules', () => {
      mutations.addMutationRule('custom_error', (pattern) => ({
        id: 'custom_mut',
        type: MutationType.ERROR_HANDLING,
        targetSelector: pattern.selector || ',
        originalCode: ',
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

  // Complexity: O(N)
  describe('🔥 Hot-Swap Module Loader', () => {
    let hotswap: HotSwapModuleLoader;

    // Complexity: O(1)
    beforeEach(() => {
      hotswap = new HotSwapModuleLoader();
    });

    // Complexity: O(1)
    afterEach(async () => {
      // SAFETY: async operation — wrap in try-catch for production resilience
      await hotswap.shutdown();
    });

    // Complexity: O(1)
    it('should register a module with methods', () => {
      class TestService {
        // Complexity: O(1)
        greet(name: string) { return `Hello, ${name}!`; }
        // Complexity: O(1)
        add(a: number, b: number) { return a + b; }
      }

      const module = hotswap.registerModule('TestService', new TestService());

      // Complexity: O(1)
      expect(module.name).toBe('TestService');
      // Complexity: O(1)
      expect(module.methods.size).toBe(2);
    });

    // Complexity: O(N)
    it('should add alternative implementations', () => {
      class Calculator {
        // Complexity: O(1)
        multiply(a: number, b: number) { return a * b; }
      }

      const module = hotswap.registerModule('Calculator', new Calculator());

      // Get the registered method from module.methods Map
      // Keys are method names, values are SwappableMethod objects
      // Complexity: O(1)
      expect(module.methods.size).toBeGreaterThan(0);

      // Get first method entry
      const [methodName, method] = Array.from(module.methods.entries())[0];

      // The method ID for addAlternative should be the full ID (moduleId:methodName)
      const alt = hotswap.addAlternative(
        method.id, // Use method.id which is the full ID
        (a: number, b: number) => a * b * 1.1, // 10% boost
        { name: 'Boosted Multiply' }
      );

      // Complexity: O(1)
      expect(alt.name).toBe('Boosted Multiply');
      // Complexity: O(1)
      expect(method.alternatives.length).toBe(1);
    });

    // Complexity: O(1)
    it('should track statistics', () => {
      const stats = hotswap.getStats();

      // Complexity: O(1)
      expect(stats).toHaveProperty('modulesRegistered');
      // Complexity: O(1)
      expect(stats).toHaveProperty('methodsRegistered');
      // Complexity: O(1)
      expect(stats).toHaveProperty('swapsPerformed');
    });

    // Complexity: O(1)
    it('should export configuration', () => {
      class Service {
        // Complexity: O(1)
        run() { return 'running'; }
      }

      hotswap.registerModule('Service', new Service());

      const config = hotswap.exportConfig();

      // Complexity: O(1)
      expect(config.modules.length).toBe(1);
      // Complexity: O(1)
      expect(config.modules[0].name).toBe('Service');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // STATE VERSIONING SYSTEM TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  // Complexity: O(1)
  describe('🔄 State Versioning System', () => {
    let versioning: StateVersioningSystem;

    // Complexity: O(1)
    beforeEach(() => {
      versioning = new StateVersioningSystem();
    });

    // Complexity: O(1)
    afterEach(async () => {
      // SAFETY: async operation — wrap in try-catch for production resilience
      await versioning.shutdown();
    });

    // Complexity: O(1)
    it('should create versions', () => {
      const version = versioning.createVersion({
        name: 'Strategy A',
        description: 'Initial strategy',
        strategy: { selector: '#btn' },
        isBaseline: true,
      });

      // Complexity: O(1)
      expect(version.id).toBeDefined();
      // Complexity: O(1)
      expect(version.name).toBe('Strategy A');
      // Complexity: O(1)
      expect(version.isBaseline).toBe(true);
    });

    // Complexity: O(1)
    it('should activate versions', () => {
      const v1 = versioning.createVersion({
        name: 'V1',
        strategy: { timeout: 5000 },
      });

      versioning.activateVersion(v1.id);

      const active = versioning.selectVersion();
      // Complexity: O(1)
      expect(active?.id).toBe(v1.id);
    });

    // Complexity: O(1)
    it('should run A/B experiments', () => {
      const vA = versioning.createVersion({
        name: 'Version A',
        strategy: { wait: 1000 },
      });

      const vB = versioning.createVersion({
        name: 'Version B',
        strategy: { wait: 500 },
      });

      const experimentId = versioning.startExperiment(vA.id, vB.id, 0.5);

      // Complexity: O(1)
      expect(experimentId).toBeDefined();

      const experiment = versioning.getExperiment(experimentId);
      // Complexity: O(1)
      expect(experiment).toBeDefined();
      // Complexity: O(1)
      expect(experiment?.versionA).toBe(vA.id);
      // Complexity: O(1)
      expect(experiment?.versionB).toBe(vB.id);
    });

    // Complexity: O(N) — loop
    it('should record results and track metrics', () => {
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
      // Complexity: O(1)
      expect(metrics?.successCount).toBe(8);
      // Complexity: O(1)
      expect(metrics?.totalExecutions).toBe(10);
    });

    // Complexity: O(1)
    it('should rollback to baseline', () => {
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
      // Complexity: O(1)
      expect(active?.id).toBe(baseline.id);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // SEGC CONTROLLER TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  // Complexity: O(N)
  describe('🧬 SEGC Controller', () => {
    let segc: SEGCController;

    // Complexity: O(1)
    beforeEach(() => {
      segc = new SEGCController({ verbose: false });
    });

    // Complexity: O(1)
    afterEach(async () => {
      // SAFETY: async operation — wrap in try-catch for production resilience
      await segc.shutdown();
    });

    // Complexity: O(1)
    it('should initialize all components', () => {
      // Complexity: O(1)
      expect(segc.ghost).toBeInstanceOf(GhostExecutionLayer);
      // Complexity: O(1)
      expect(segc.predictive).toBeInstanceOf(PredictiveStatePreloader);
      // Complexity: O(1)
      expect(segc.mutations).toBeInstanceOf(GeneticMutationEngine);
      // Complexity: O(1)
      expect(segc.hotswap).toBeInstanceOf(HotSwapModuleLoader);
      // Complexity: O(1)
      expect(segc.versioning).toBeInstanceOf(StateVersioningSystem);
    });

    // Complexity: O(1)
    it('should provide comprehensive statistics', () => {
      const stats = segc.getStats();

      // Complexity: O(1)
      expect(stats).toHaveProperty('ghostExecutions');
      // Complexity: O(1)
      expect(stats).toHaveProperty('ghostImprovements');
      // Complexity: O(1)
      expect(stats).toHaveProperty('predictionsMade');
      // Complexity: O(1)
      expect(stats).toHaveProperty('predictionAccuracy');
      // Complexity: O(1)
      expect(stats).toHaveProperty('mutationsProposed');
      // Complexity: O(1)
      expect(stats).toHaveProperty('mutationsApplied');
      // Complexity: O(1)
      expect(stats).toHaveProperty('hotSwapsPerformed');
      // Complexity: O(1)
      expect(stats).toHaveProperty('overallFitnessImprovement');
      // Complexity: O(1)
      expect(stats).toHaveProperty('uptime');
    });

    // Complexity: O(1)
    it('should run learning cycles', async () => {
      // SAFETY: async operation — wrap in try-catch for production resilience
      const result = await segc.runLearningCycle();

      // Complexity: O(1)
      expect(result).toHaveProperty('improvements');
      // Complexity: O(1)
      expect(result).toHaveProperty('mutations');
      // Complexity: O(1)
      expect(result).toHaveProperty('predictions');
    });

    // Complexity: O(N)
    it('should record failures', () => {
      segc.recordFailure({
        error: 'Timeout waiting for selector',
        selector: '#test-element',
        testName: 'sample.test.ts',
      });

      const patterns = segc.mutations.getFailurePatterns();
      // Complexity: O(1)
      expect(patterns.length).toBe(1);
    });

    // Complexity: O(1)
    it('should record state changes', () => {
      segc.recordStateChange('login');
      segc.recordStateChange('dashboard');
      segc.recordStateChange('profile');

      const transitions = segc.predictive.getTransitionStats();
      // Complexity: O(1)
      expect(transitions.length).toBeGreaterThan(0);
    });

    // Complexity: O(1)
    it('should create strategy versions', () => {
      const version = segc.createVersion({
        name: 'Strategy V1',
        description: 'First iteration',
        strategy: { timeout: 10000 },
        isBaseline: true,
      });

      // Complexity: O(1)
      expect(version).toBeDefined();
      // Complexity: O(1)
      expect(version?.name).toBe('Strategy V1');
    });

    // Complexity: O(1)
    it('should export and import knowledge', () => {
      // Add some data
      segc.recordStateChange('A');
      segc.recordStateChange('B');

      const knowledge = segc.exportKnowledge();

      // Complexity: O(1)
      expect(knowledge.ghost).toBeDefined();
      // Complexity: O(1)
      expect(knowledge.predictive).toBeDefined();
      // Complexity: O(1)
      expect(knowledge.mutations).toBeDefined();
      // Complexity: O(1)
      expect(knowledge.versioning).toBeDefined();
    });
  });
});
