/**
 * ⚛️ QANTUM - Test Runner
 * @author dp | QAntum Labs
 */

import { createQA } from './index.js';

import { logger } from './api/unified/utils/logger';
async function runBasicTest() {
  logger.debug('⚛️ QAntum v1.0.0 - Basic Test\n');
  logger.debug('[ dp ] qantum labs\n');
  
  const qa = createQA({
    baseUrl: 'https://example.com',
    browser: {
      browser: 'chromium',
      headless: true,
      timeout: 30000
    }
  });

  try {
    // 1. Launch browser
    logger.debug('1️⃣ Launching browser...');
    await qa.launch();
    logger.debug('   ✅ Browser launched\n');

    // 2. Visit page
    logger.debug('2️⃣ Visiting https://example.com...');
    await qa.visit('https://example.com');
    logger.debug('   ✅ Page loaded\n');

    // 3. Get title
    logger.debug('3️⃣ Getting page title...');
    const title = await qa.getTitle();
    logger.debug(`   ✅ Title: "${title}"\n`);

    // 4. Check element exists
    logger.debug('4️⃣ Checking h1 element...');
    const isVisible = await qa.get('h1').isVisible();
    logger.debug(`   ✅ h1 visible: ${isVisible}\n`);

    // 5. Get text
    logger.debug('5️⃣ Getting h1 text...');
    const text = await qa.get('h1').getText();
    logger.debug(`   ✅ Text: "${text}"\n`);

    // 6. Fluent chain assertion
    logger.debug('6️⃣ Fluent assertion: h1 should contain "Example"...');
    await qa.get('h1').should('contain.text', 'Example');
    logger.debug('   ✅ Assertion passed\n');

    logger.debug('═══════════════════════════════════════');
    logger.debug('⚛️ ALL TESTS PASSED!');
    logger.debug('[ dp ] qantum labs');
    logger.debug('═══════════════════════════════════════\n');

  } catch (error) {
    logger.error('❌ Test failed:', error);
    process.exit(1);
  } finally {
    await qa.close();
  }
}

runBasicTest();
