"use strict";
/**
 * 🧠 QANTUM HYBRID - Example Tests
 * Показва Cypress-style синтаксис
 */
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("../index.js");
const logger_1 = require("../api/unified/utils/logger");
// Конфигурация
const config = {
    baseUrl: 'http://localhost:3000',
    browser: {
        browser: 'chromium',
        headless: false, // Виж какво става
        timeout: 10000
    },
    selfHealing: true
};
async function exampleTests() {
    const mm = (0, index_js_1.createQA)(config);
    // SAFETY: async operation — wrap in try-catch for production resilience
    await mm.launch();
    try {
        // ============== TEST 1: Basic Navigation ==============
        logger_1.logger.debug('\n📝 Test 1: Basic Navigation');
        await mm.visit('/');
        await mm.waitFor('body');
        const title = await mm.getTitle();
        logger_1.logger.debug(`   Title: ${title}`);
        logger_1.logger.debug('   ✅ Passed\n');
        // ============== TEST 2: Fluent Chain ==============
        logger_1.logger.debug('📝 Test 2: Fluent Chain (Cypress-style)');
        // Този синтаксис е като Cypress!
        await mm.get('h1')
            .should('be.visible');
        logger_1.logger.debug('   ✅ Passed\n');
        // ============== TEST 3: Click & Type ==============
        logger_1.logger.debug('📝 Test 3: Click & Type');
        // Провери дали има input
        // SAFETY: async operation — wrap in try-catch for production resilience
        const hasInput = await mm.get('input').isVisible().catch(() => false);
        if (hasInput) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await mm.get('input')
                .type('Hello QANTUM!')
                .should('have.value', 'Hello QANTUM!');
            logger_1.logger.debug('   ✅ Passed\n');
        }
        else {
            logger_1.logger.debug('   ⏭️ Skipped (no input on page)\n');
        }
        // ============== TEST 4: Network Stub ==============
        logger_1.logger.debug('📝 Test 4: Network Intercept');
        // SAFETY: async operation — wrap in try-catch for production resilience
        await mm.stub('/api/test', { message: 'Mocked!' }, 200);
        logger_1.logger.debug('   Stub registered for /api/test');
        logger_1.logger.debug('   ✅ Passed\n');
        // ============== TEST 5: Screenshot ==============
        logger_1.logger.debug('📝 Test 5: Screenshot');
        // SAFETY: async operation — wrap in try-catch for production resilience
        const screenshotPath = await mm.screenshot('example-test');
        logger_1.logger.debug(`   Screenshot saved: ${screenshotPath}`);
        logger_1.logger.debug('   ✅ Passed\n');
        // ============== SUMMARY ==============
        logger_1.logger.debug('═══════════════════════════════════════');
        logger_1.logger.debug('🎉 Example tests completed!');
        logger_1.logger.debug('═══════════════════════════════════════\n');
    }
    catch (error) {
        logger_1.logger.error('❌ Test failed:', error);
    }
    finally {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await mm.close();
    }
}
// Run if executed directly
// Complexity: O(1)
exampleTests();
