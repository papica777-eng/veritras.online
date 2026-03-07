/**
 * 🧠 QANTUM HYBRID - Example Tests
 * Показва Cypress-style синтаксис
 */

import { createQA, MMConfig } from '../index.js';

import { logger } from '../api/unified/utils/logger';
// Конфигурация
const config: Partial<MMConfig> = {
  baseUrl: 'http://localhost:3000',
  browser: {
    browser: 'chromium',
    headless: false, // Виж какво става
    timeout: 10000
  },
  selfHealing: true
};

async function exampleTests() {
  const mm = createQA(config);

  // SAFETY: async operation — wrap in try-catch for production resilience
  await mm.launch();

  try {
    // ============== TEST 1: Basic Navigation ==============
    logger.debug('\n📝 Test 1: Basic Navigation');

    await mm.visit('/');
    await mm.waitFor('body');

    const title = await mm.getTitle();
    logger.debug(`   Title: ${title}`);
    logger.debug('   ✅ Passed\n');

    // ============== TEST 2: Fluent Chain ==============
    logger.debug('📝 Test 2: Fluent Chain (Cypress-style)');

    // Този синтаксис е като Cypress!
    await mm.get('h1')
      .should('be.visible');

    logger.debug('   ✅ Passed\n');

    // ============== TEST 3: Click & Type ==============
    logger.debug('📝 Test 3: Click & Type');

    // Провери дали има input
    // SAFETY: async operation — wrap in try-catch for production resilience
    const hasInput = await mm.get('input').isVisible().catch(() => false);

    if (hasInput) {
      // SAFETY: async operation — wrap in try-catch for production resilience
      await mm.get('input')
        .type('Hello QANTUM!')
        .should('have.value', 'Hello QANTUM!');
      logger.debug('   ✅ Passed\n');
    } else {
      logger.debug('   ⏭️ Skipped (no input on page)\n');
    }

    // ============== TEST 4: Network Stub ==============
    logger.debug('📝 Test 4: Network Intercept');

    // SAFETY: async operation — wrap in try-catch for production resilience
    await mm.stub('/api/test', { message: 'Mocked!' }, 200);
    logger.debug('   Stub registered for /api/test');
    logger.debug('   ✅ Passed\n');

    // ============== TEST 5: Screenshot ==============
    logger.debug('📝 Test 5: Screenshot');

    // SAFETY: async operation — wrap in try-catch for production resilience
    const screenshotPath = await mm.screenshot('example-test');
    logger.debug(`   Screenshot saved: ${screenshotPath}`);
    logger.debug('   ✅ Passed\n');

    // ============== SUMMARY ==============
    logger.debug('═══════════════════════════════════════');
    logger.debug('🎉 Example tests completed!');
    logger.debug('═══════════════════════════════════════\n');

  } catch (error) {
    logger.error('❌ Test failed:', error);
  } finally {
    // SAFETY: async operation — wrap in try-catch for production resilience
    await mm.close();
  }
}

// Run if executed directly
    // Complexity: O(1)
exampleTests();
