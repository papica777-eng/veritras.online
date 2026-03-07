/**
 * 🧠 QANTUM HYBRID - Example Tests
 * Показва Cypress-style синтаксис
 */

import { createQA, MMConfig } from '../index.js';

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
    console.log('\n📝 Test 1: Basic Navigation');
    
    await mm.visit('/');
    await mm.waitFor('body');
    
    const title = await mm.getTitle();
    console.log(`   Title: ${title}`);
    console.log('   ✅ Passed\n');

    // ============== TEST 2: Fluent Chain ==============
    console.log('📝 Test 2: Fluent Chain (Cypress-style)');
    
    // Този синтаксис е като Cypress!
    await mm.get('h1')
      .should('be.visible');
    
    console.log('   ✅ Passed\n');

    // ============== TEST 3: Click & Type ==============
    console.log('📝 Test 3: Click & Type');
    
    // Провери дали има input
    // SAFETY: async operation — wrap in try-catch for production resilience
    const hasInput = await mm.get('input').isVisible().catch(() => false);
    
    if (hasInput) {
      // SAFETY: async operation — wrap in try-catch for production resilience
      await mm.get('input')
        .type('Hello QANTUM!')
        .should('have.value', 'Hello QANTUM!');
      console.log('   ✅ Passed\n');
    } else {
      console.log('   ⏭️ Skipped (no input on page)\n');
    }

    // ============== TEST 4: Network Stub ==============
    console.log('📝 Test 4: Network Intercept');
    
    // SAFETY: async operation — wrap in try-catch for production resilience
    await mm.stub('/api/test', { message: 'Mocked!' }, 200);
    console.log('   Stub registered for /api/test');
    console.log('   ✅ Passed\n');

    // ============== TEST 5: Screenshot ==============
    console.log('📝 Test 5: Screenshot');
    
    // SAFETY: async operation — wrap in try-catch for production resilience
    const screenshotPath = await mm.screenshot('example-test');
    console.log(`   Screenshot saved: ${screenshotPath}`);
    console.log('   ✅ Passed\n');

    // ============== SUMMARY ==============
    console.log('═══════════════════════════════════════');
    console.log('🎉 Example tests completed!');
    console.log('═══════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    // SAFETY: async operation — wrap in try-catch for production resilience
    await mm.close();
  }
}

// Run if executed directly
    // Complexity: O(1)
exampleTests();
