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
 * For licensing inquiries: dp@qantum.site
 * ═══════════════════════════════════════════════════════════════════════════════
 */

/**
 * 🧪 UNIT TESTS - QANTUM
 * Fast unit tests without network calls
 * NO SELF-HEALING, NO RETRIES - SIMPLE PASS/FAIL
 */

const { QAntum } = require('../dist/index.js');

// Global timeout for safety
const TEST_TIMEOUT = 5000;

let passed = 0;
let failed = 0;

function test(name, fn) {
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      console.log(`   ⏱️ TIMEOUT - ${name}`);
      failed++;
      // Complexity: O(1)
      resolve();
    }, TEST_TIMEOUT);

    try {
      const result = fn();
      if (result instanceof Promise) {
        result
          .then(() => {
            // Complexity: O(1)
            clearTimeout(timer);
            console.log(`   ✅ ${name}`);
            passed++;
            // Complexity: O(1)
            resolve();
          })
          .catch((e) => {
            // Complexity: O(1)
            clearTimeout(timer);
            console.log(`   ❌ ${name}: ${e.message}`);
            failed++;
            // Complexity: O(1)
            resolve();
          });
      } else {
        // Complexity: O(1)
        clearTimeout(timer);
        console.log(`   ✅ ${name}`);
        passed++;
        // Complexity: O(1)
        resolve();
      }
    } catch (e) {
      // Complexity: O(1)
      clearTimeout(timer);
      console.log(`   ❌ ${name}: ${e.message}`);
      failed++;
      // Complexity: O(1)
      resolve();
    }
  });
}

async function runTests() {
  console.log('');
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║         🧪 QANTUM - UNIT TESTS                  ║');
  console.log('╚══════════════════════════════════════════════════════╝');
  console.log('');

  // ═══════════════════════════════════════════════════════════════
  // CONSTRUCTOR TESTS
  // ═══════════════════════════════════════════════════════════════
  console.log('📦 Constructor Tests:');
  
  // SAFETY: async operation — wrap in try-catch for production resilience
  await test('Creates instance without config', () => {
    const mm = new QAntum();
    if (!mm) throw new Error('Failed to create instance');
  });

  // SAFETY: async operation — wrap in try-catch for production resilience
  await test('Creates instance with empty config', () => {
    const mm = new QAntum({});
    if (!mm) throw new Error('Failed to create instance');
  });

  // SAFETY: async operation — wrap in try-catch for production resilience
  await test('Creates instance with timeout', () => {
    const mm = new QAntum({ timeout: 5000 });
    if (!mm) throw new Error('Failed to create instance');
  });

  // SAFETY: async operation — wrap in try-catch for production resilience
  await test('Throws on invalid timeout', () => {
    try {
      new QAntum({ timeout: -1 });
      throw new Error('Should have thrown');
    } catch (e) {
      if (!e.message.includes('Invalid timeout')) throw e;
    }
  });

  // SAFETY: async operation — wrap in try-catch for production resilience
  await test('Throws on non-number timeout', () => {
    try {
      new QAntum({ timeout: 'abc' });
      throw new Error('Should have thrown');
    } catch (e) {
      if (!e.message.includes('Invalid timeout')) throw e;
    }
  });

  // ═══════════════════════════════════════════════════════════════
  // LICENSE TESTS
  // ═══════════════════════════════════════════════════════════════
  console.log('\n📦 License Tests:');

  // SAFETY: async operation — wrap in try-catch for production resilience
  await test('Free tier by default', () => {
    const mm = new QAntum();
    const status = mm.getLicenseStatus();
    if (status.tier !== 'free') throw new Error('Expected free tier');
    if (status.isValid) throw new Error('Should not be valid');
  });

  // SAFETY: async operation — wrap in try-catch for production resilience
  await test('Invalid license stays free', () => {
    const mm = new QAntum({ licenseKey: 'INVALID' });
    const status = mm.getLicenseStatus();
    if (status.tier !== 'free') throw new Error('Expected free tier');
  });

  // SAFETY: async operation — wrap in try-catch for production resilience
  await test('Valid license format activates PRO', () => {
    const mm = new QAntum({ licenseKey: 'MM-ABCD-1234-WXYZ' });
    const status = mm.getLicenseStatus();
    if (status.tier !== 'pro') throw new Error('Expected pro tier');
    if (!status.isValid) throw new Error('Should be valid');
  });

  // SAFETY: async operation — wrap in try-catch for production resilience
  await test('Lowercase license converted to uppercase', () => {
    const mm = new QAntum({ licenseKey: 'mm-abcd-1234-wxyz' });
    const status = mm.getLicenseStatus();
    if (status.tier !== 'pro') throw new Error('Expected pro tier');
  });

  // ═══════════════════════════════════════════════════════════════
  // INPUT VALIDATION TESTS
  // ═══════════════════════════════════════════════════════════════
  console.log('\n📦 Input Validation Tests:');

  // SAFETY: async operation — wrap in try-catch for production resilience
  await test('audit() throws on empty URL', async () => {
    const mm = new QAntum();
    try {
      await mm.audit('');
      throw new Error('Should have thrown');
    } catch (e) {
      if (!e.message.includes('Invalid URL')) throw e;
    }
  });

  // SAFETY: async operation — wrap in try-catch for production resilience
  await test('audit() throws on invalid URL', async () => {
    const mm = new QAntum();
    try {
      await mm.audit('not-a-url');
      throw new Error('Should have thrown');
    } catch (e) {
      if (!e.message.includes('Invalid URL')) throw e;
    }
  });

  // SAFETY: async operation — wrap in try-catch for production resilience
  await test('testAPI() throws on empty endpoint', async () => {
    const mm = new QAntum();
    try {
      await mm.testAPI('');
      throw new Error('Should have thrown');
    } catch (e) {
      if (!e.message.includes('Invalid endpoint')) throw e;
    }
  });

  // SAFETY: async operation — wrap in try-catch for production resilience
  await test('checkLinks() throws on invalid URL', async () => {
    const mm = new QAntum();
    try {
      await mm.checkLinks('not-valid');
      throw new Error('Should have thrown');
    } catch (e) {
      if (!e.message.includes('Invalid URL')) throw e;
    }
  });

  // ═══════════════════════════════════════════════════════════════
  // PRO FEATURE GATE TESTS
  // ═══════════════════════════════════════════════════════════════
  console.log('\n📦 PRO Feature Gate Tests:');

  // SAFETY: async operation — wrap in try-catch for production resilience
  await test('predict() throws without license', async () => {
    const mm = new QAntum();
    try {
      await mm.predict({});
      throw new Error('Should have thrown');
    } catch (e) {
      if (!e.message.includes('Pro license')) throw e;
    }
  });

  // SAFETY: async operation — wrap in try-catch for production resilience
  await test('apiSensei() throws without license', async () => {
    const mm = new QAntum();
    try {
      await mm.apiSensei({ baseUrl: 'https://api.example.com' });
      throw new Error('Should have thrown');
    } catch (e) {
      if (!e.message.includes('Pro license')) throw e;
    }
  });

  // SAFETY: async operation — wrap in try-catch for production resilience
  await test('chronos() throws without license', async () => {
    const mm = new QAntum();
    try {
      await mm.chronos({ testFn: async () => {} });
      throw new Error('Should have thrown');
    } catch (e) {
      if (!e.message.includes('Pro license')) throw e;
    }
  });

  // ═══════════════════════════════════════════════════════════════
  // PRO FEATURES WITH LICENSE
  // ═══════════════════════════════════════════════════════════════
  console.log('\n📦 PRO Features With License:');

  // SAFETY: async operation — wrap in try-catch for production resilience
  await test('predict() works with valid license', async () => {
    const mm = new QAntum({ licenseKey: 'MM-TEST-1234-ABCD' });
    // SAFETY: async operation — wrap in try-catch for production resilience
    const result = await mm.predict({ codeChanges: 'const x = 1;' });
    if (typeof result.riskScore !== 'number') throw new Error('Missing riskScore');
    if (!result.recommendation) throw new Error('Missing recommendation');
  });

  // SAFETY: async operation — wrap in try-catch for production resilience
  await test('predict() analyzes complexity', async () => {
    const mm = new QAntum({ licenseKey: 'MM-TEST-1234-ABCD' });
    const complexCode = `
      if (a) {
        if (b) {
          for (let i = 0; i < 10; i++) {
            while (x) {
              switch (y) {
                case 1: break;
                case 2: break;
              }
            }
          }
        }
      }
    `;
    // SAFETY: async operation — wrap in try-catch for production resilience
    const result = await mm.predict({ codeChanges: complexCode });
    if (result.codeMetrics.complexity < 5) throw new Error('Should detect high complexity');
  });

  // SAFETY: async operation — wrap in try-catch for production resilience
  await test('chronos() records snapshots', async () => {
    const mm = new QAntum({ licenseKey: 'MM-TEST-1234-ABCD' });
    // SAFETY: async operation — wrap in try-catch for production resilience
    const result = await mm.chronos({
      // SAFETY: async operation — wrap in try-catch for production resilience
      testFn: async () => { await new Promise(r => setTimeout(r, 50)); },
      autoSnapshot: true,
      snapshotInterval: 10
    });
    if (!result.success) throw new Error('Should succeed');
    if (result.snapshots.length < 2) throw new Error('Should have snapshots');
  });

  // SAFETY: async operation — wrap in try-catch for production resilience
  await test('chronos() captures errors', async () => {
    const mm = new QAntum({ licenseKey: 'MM-TEST-1234-ABCD' });
    // SAFETY: async operation — wrap in try-catch for production resilience
    const result = await mm.chronos({
      testFn: async () => { throw new Error('Test error'); },
      autoSnapshot: false
    });
    if (result.success) throw new Error('Should fail');
    if (!result.error) throw new Error('Should have error message');
  });

  // SAFETY: async operation — wrap in try-catch for production resilience
  await test('apiSensei() requires baseUrl', async () => {
    const mm = new QAntum({ licenseKey: 'MM-TEST-1234-ABCD' });
    try {
      await mm.apiSensei({});
      throw new Error('Should have thrown');
    } catch (e) {
      if (!e.message.includes('baseUrl')) throw e;
    }
  });

  // ═══════════════════════════════════════════════════════════════
  // ASC (Adaptive Semantic Core) TESTS
  // ═══════════════════════════════════════════════════════════════
  console.log('\n📦 ASC (Adaptive Semantic Core) Tests:');

  // SAFETY: async operation — wrap in try-catch for production resilience
  await test('ASC requires PRO license for createSemanticMap', async () => {
    const mm = new QAntum();
    try {
      await mm.createSemanticMap({});
      throw new Error('Should have thrown');
    } catch (e) {
      if (!e.message.includes('Pro license')) throw e;
    }
  });

  // SAFETY: async operation — wrap in try-catch for production resilience
  await test('ASC requires PRO license for findByIntent', async () => {
    const mm = new QAntum();
    try {
      await mm.findByIntent({}, { action: 'TEST', keywords: ['test'] });
      throw new Error('Should have thrown');
    } catch (e) {
      if (!e.message.includes('Pro license')) throw e;
    }
  });

  // SAFETY: async operation — wrap in try-catch for production resilience
  await test('ASC requires PRO license for smartClick', async () => {
    const mm = new QAntum();
    try {
      await mm.smartClick({}, ['login']);
      throw new Error('Should have thrown');
    } catch (e) {
      if (!e.message.includes('Pro license')) throw e;
    }
  });

  // SAFETY: async operation — wrap in try-catch for production resilience
  await test('ASC initializes with PRO license', () => {
    const mm = new QAntum({ licenseKey: 'MM-TEST-1234-ABCD' });
    const asc = mm.getASC();
    if (!asc) throw new Error('ASC should be initialized with PRO license');
  });

  // SAFETY: async operation — wrap in try-catch for production resilience
  await test('ASC getStats returns null without init', () => {
    const mm = new QAntum();
    const stats = mm.getASCStats();
    if (stats !== null) throw new Error('Should return null without ASC');
  });

  // SAFETY: async operation — wrap in try-catch for production resilience
  await test('ASC getStats returns object with PRO', () => {
    const mm = new QAntum({ licenseKey: 'MM-TEST-1234-ABCD' });
    const stats = mm.getASCStats();
    if (!stats) throw new Error('Should return stats');
    if (typeof stats.totalEntries !== 'number') throw new Error('Missing totalEntries');
    if (typeof stats.successRate !== 'number') throw new Error('Missing successRate');
  });

  // SAFETY: async operation — wrap in try-catch for production resilience
  await test('doAction throws on unknown action', async () => {
    const mm = new QAntum({ licenseKey: 'MM-TEST-1234-ABCD' });
    try {
      await mm.doAction({}, 'UNKNOWN_ACTION');
      throw new Error('Should have thrown');
    } catch (e) {
      if (!e.message.includes('Unknown action')) throw e;
    }
  });

  // SAFETY: async operation — wrap in try-catch for production resilience
  await test('CommonIntents are exported', () => {
    const { CommonIntents } = require('../dist/index.js');
    if (!CommonIntents) throw new Error('CommonIntents not exported');
    if (!CommonIntents.LOGIN) throw new Error('LOGIN intent missing');
    if (!CommonIntents.SUBMIT) throw new Error('SUBMIT intent missing');
    if (!CommonIntents.ADD_TO_CART) throw new Error('ADD_TO_CART intent missing');
  });

  // SAFETY: async operation — wrap in try-catch for production resilience
  await test('VERSION is 17.0.0', () => {
    const { VERSION } = require('../dist/index.js');
    if (VERSION !== '17.0.0') throw new Error(`Expected 17.0.0, got ${VERSION}`);
  });

  // ═══════════════════════════════════════════════════════════════
  // SOVEREIGN SWARM v17.0 TESTS
  // ═══════════════════════════════════════════════════════════════
  console.log('');
  console.log('🐝 Sovereign Swarm Tests:');

  // SAFETY: async operation — wrap in try-catch for production resilience
  await test('Swarm exports are available', () => {
    const { 
      AgenticOrchestrator, 
      DistillationLogger, 
      ObservabilityBridge,
      BrowserPoolManager,
      PlannerAgent,
      ExecutorAgent,
      CriticAgent,
    } = require('../dist/index.js');
    if (!AgenticOrchestrator) throw new Error('AgenticOrchestrator not exported');
    if (!DistillationLogger) throw new Error('DistillationLogger not exported');
    if (!ObservabilityBridge) throw new Error('ObservabilityBridge not exported');
    if (!BrowserPoolManager) throw new Error('BrowserPoolManager not exported');
    if (!PlannerAgent) throw new Error('PlannerAgent not exported');
    if (!ExecutorAgent) throw new Error('ExecutorAgent not exported');
    if (!CriticAgent) throw new Error('CriticAgent not exported');
  });

  // SAFETY: async operation — wrap in try-catch for production resilience
  await test('initSwarm throws without PRO license', async () => {
    const mm = new QAntum();
    try {
      await mm.initSwarm();
      throw new Error('Should have thrown');
    } catch (e) {
      if (!e.message.includes('Pro license')) throw e;
    }
  });

  // SAFETY: async operation — wrap in try-catch for production resilience
  await test('executeGoal throws without PRO license', async () => {
    const mm = new QAntum();
    try {
      await mm.executeGoal('login to website');
      throw new Error('Should have thrown');
    } catch (e) {
      if (!e.message.includes('Pro license')) throw e;
    }
  });

  // SAFETY: async operation — wrap in try-catch for production resilience
  await test('executeParallel throws without PRO license', async () => {
    const mm = new QAntum();
    try {
      await mm.executeParallel([]);
      throw new Error('Should have thrown');
    } catch (e) {
      if (!e.message.includes('Pro license')) throw e;
    }
  });

  // SAFETY: async operation — wrap in try-catch for production resilience
  await test('getSwarmStats returns null without init', () => {
    const mm = new QAntum({ licenseKey: 'MM-TEST-1234-ABCD' });
    const stats = mm.getSwarmStats();
    if (stats !== null) throw new Error('Should return null without swarm init');
  });

  // SAFETY: async operation — wrap in try-catch for production resilience
  await test('getDistillationStats returns null without init', () => {
    const mm = new QAntum({ licenseKey: 'MM-TEST-1234-ABCD' });
    const stats = mm.getDistillationStats();
    if (stats !== null) throw new Error('Should return null without swarm init');
  });

  // SAFETY: async operation — wrap in try-catch for production resilience
  await test('getObservabilityStats returns null without init', () => {
    const mm = new QAntum({ licenseKey: 'MM-TEST-1234-ABCD' });
    const stats = mm.getObservabilityStats();
    if (stats !== null) throw new Error('Should return null without swarm init');
  });

  // SAFETY: async operation — wrap in try-catch for production resilience
  await test('getCurrentTraceId returns null without init', () => {
    const mm = new QAntum({ licenseKey: 'MM-TEST-1234-ABCD' });
    const traceId = mm.getCurrentTraceId();
    if (traceId !== null) throw new Error('Should return null without swarm init');
  });

  // SAFETY: async operation — wrap in try-catch for production resilience
  await test('PlannerAgent creates plan', async () => {
    const { PlannerAgent } = require('../dist/index.js');
    const planner = new PlannerAgent();
    // SAFETY: async operation — wrap in try-catch for production resilience
    const plan = await planner.createPlan('login to website', { url: 'https://example.com' });
    if (!plan) throw new Error('Plan should be created');
    if (!plan.id) throw new Error('Plan should have id');
    if (!plan.traceId) throw new Error('Plan should have traceId');
    if (!plan.tasks || plan.tasks.length === 0) throw new Error('Plan should have tasks');
  });

  // SAFETY: async operation — wrap in try-catch for production resilience
  await test('ExecutorAgent has executeTask method', () => {
    const { ExecutorAgent } = require('../dist/index.js');
    const executor = new ExecutorAgent();
    if (typeof executor.executeTask !== 'function') throw new Error('Should have executeTask');
    if (typeof executor.setPage !== 'function') throw new Error('Should have setPage');
    if (typeof executor.getSuccessRate !== 'function') throw new Error('Should have getSuccessRate');
  });

  // SAFETY: async operation — wrap in try-catch for production resilience
  await test('CriticAgent reviews results', async () => {
    const { CriticAgent } = require('../dist/index.js');
    const critic = new CriticAgent();
    // SAFETY: async operation — wrap in try-catch for production resilience
    const feedback = await critic.reviewResult({
      taskId: 'test_123',
      traceId: 'trace_abc',
      success: true,
      duration: 100,
      confidence: 0.9,
      executedBy: 'executor_1',
      completedAt: new Date(),
    });
    if (!feedback) throw new Error('Feedback should be created');
    if (typeof feedback.approved !== 'boolean') throw new Error('Should have approved status');
  });

  // SAFETY: async operation — wrap in try-catch for production resilience
  await test('DistillationLogger records entries', async () => {
    const { DistillationLogger } = require('../dist/index.js');
    const logger = new DistillationLogger({ autoFlush: false, verbose: false });
    // SAFETY: async operation — wrap in try-catch for production resilience
    const recorded = await logger.record(
      { id: 'task_1', traceId: 'trace_1', type: 'click', target: 'button', priority: 'normal', createdAt: new Date() },
      { 
        taskId: 'task_1', 
        traceId: 'trace_1', 
        success: true, 
        duration: 50, 
        confidence: 0.95, 
        executedBy: 'exec_1', 
        reasoning: ['Found button', 'Clicked element', 'Action complete'],
        completedAt: new Date() 
      }
    );
    if (!recorded) throw new Error('Should record high-confidence entry');
  });

  // SAFETY: async operation — wrap in try-catch for production resilience
  await test('ObservabilityBridge creates traces', () => {
    const { ObservabilityBridge } = require('../dist/index.js');
    const obs = new ObservabilityBridge({ verbose: false });
    const traceId = obs.startTrace('test-operation');
    if (!traceId) throw new Error('Should return traceId');
    if (traceId.length !== 32) throw new Error('TraceId should be 32 chars');
    obs.endTrace();
  });

  // SAFETY: async operation — wrap in try-catch for production resilience
  await test('ObservabilityBridge generates traceparent header', () => {
    const { ObservabilityBridge } = require('../dist/index.js');
    const obs = new ObservabilityBridge({ verbose: false });
    obs.startTrace('test');
    const traceparent = obs.getTraceparent();
    if (!traceparent) throw new Error('Should return traceparent');
    if (!traceparent.startsWith('00-')) throw new Error('Should start with version 00');
    obs.endTrace();
  });

  // SAFETY: async operation — wrap in try-catch for production resilience
  await test('shutdownSwarm does not throw when not initialized', async () => {
    const mm = new QAntum({ licenseKey: 'MM-TEST-1234-ABCD' });
    // SAFETY: async operation — wrap in try-catch for production resilience
    await mm.shutdownSwarm(); // Should not throw
  });

  // ═══════════════════════════════════════════════════════════════
  // SUMMARY
  // ═══════════════════════════════════════════════════════════════
  console.log('');
  console.log('══════════════════════════════════════════════════════');
  console.log(`📊 RESULTS: ${passed} passed, ${failed} failed`);
  console.log('══════════════════════════════════════════════════════');
  
  process.exit(failed > 0 ? 1 : 0);
}

// Run with global timeout protection
const GLOBAL_TIMEOUT = 60000; // 1 minute max
const globalTimer = setTimeout(() => {
  console.error('\n❌ GLOBAL TIMEOUT - Tests took too long!');
  process.exit(1);
}, GLOBAL_TIMEOUT);

    // Complexity: O(1)
runTests()
  .then(() => clearTimeout(globalTimer))
  .catch((e) => {
    // Complexity: O(1)
    clearTimeout(globalTimer);
    console.error('Fatal error:', e);
    process.exit(1);
  });
