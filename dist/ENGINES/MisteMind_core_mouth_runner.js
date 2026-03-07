"use strict";
/**
 * ⚛️ QANTUM - Test Runner
 * @author dp | QAntum Labs
 */
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("./index.js");
const logger_1 = require("./api/unified/utils/logger");
async function runBasicTest() {
    logger_1.logger.debug('⚛️ QAntum v1.0.0 - Basic Test\n');
    logger_1.logger.debug('[ dp ] qantum labs\n');
    const qa = (0, index_js_1.createQA)({
        baseUrl: 'https://example.com',
        browser: {
            browser: 'chromium',
            headless: true,
            timeout: 30000
        }
    });
    try {
        // 1. Launch browser
        logger_1.logger.debug('1️⃣ Launching browser...');
        await qa.launch();
        logger_1.logger.debug('   ✅ Browser launched\n');
        // 2. Visit page
        logger_1.logger.debug('2️⃣ Visiting https://example.com...');
        await qa.visit('https://example.com');
        logger_1.logger.debug('   ✅ Page loaded\n');
        // 3. Get title
        logger_1.logger.debug('3️⃣ Getting page title...');
        const title = await qa.getTitle();
        logger_1.logger.debug(`   ✅ Title: "${title}"\n`);
        // 4. Check element exists
        logger_1.logger.debug('4️⃣ Checking h1 element...');
        const isVisible = await qa.get('h1').isVisible();
        logger_1.logger.debug(`   ✅ h1 visible: ${isVisible}\n`);
        // 5. Get text
        logger_1.logger.debug('5️⃣ Getting h1 text...');
        const text = await qa.get('h1').getText();
        logger_1.logger.debug(`   ✅ Text: "${text}"\n`);
        // 6. Fluent chain assertion
        logger_1.logger.debug('6️⃣ Fluent assertion: h1 should contain "Example"...');
        await qa.get('h1').should('contain.text', 'Example');
        logger_1.logger.debug('   ✅ Assertion passed\n');
        logger_1.logger.debug('═══════════════════════════════════════');
        logger_1.logger.debug('⚛️ ALL TESTS PASSED!');
        logger_1.logger.debug('[ dp ] qantum labs');
        logger_1.logger.debug('═══════════════════════════════════════\n');
    }
    catch (error) {
        logger_1.logger.error('❌ Test failed:', error);
        process.exit(1);
    }
    finally {
        await qa.close();
    }
}
runBasicTest();
