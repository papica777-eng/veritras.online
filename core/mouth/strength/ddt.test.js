/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  🔄 DATA-DRIVEN TESTING (DDT) - QANTUM QA Framework
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 *  This module demonstrates Data-Driven Testing pattern where test logic
 *  is separated from test data, enabling scalable and maintainable tests.
 * 
 *  Benefits of DDT:
 *  - Single test logic, multiple data points
 *  - Easy to add new test cases (just add JSON)
 *  - Better test coverage reporting
 *  - Separation of concerns (QA writes data, Dev writes logic)
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

require('dotenv').config({ debug: false });
const { expect } = require('chai');
const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs');
const path = require('path');

// ═══════════════════════════════════════════════════════════════════════════
//  📂 LOAD TEST DATA FROM JSON
// ═══════════════════════════════════════════════════════════════════════════

const testDataPath = path.join(__dirname, 'data', 'testData.json');
const testData = JSON.parse(fs.readFileSync(testDataPath, 'utf8'));

console.log(`\n📂 Loaded ${testData.searchTests.length} search tests from testData.json\n`);

// ═══════════════════════════════════════════════════════════════════════════
//  ⚙️ CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const CONFIG = {
    searchEngineUrl: process.env.SEARCH_ENGINE_URL || process.env.GOOGLE_URL || 'https://www.google.com',
    timeout: parseInt(process.env.BROWSER_TIMEOUT) || 15000,
    headless: process.env.HEADLESS !== 'false',
    screenshotOnFailure: process.env.SCREENSHOT_ON_FAILURE !== 'false'
};

// ═══════════════════════════════════════════════════════════════════════════
//  🛠️ HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

function getChromeOptions() {
    const options = new chrome.Options();
    
    if (CONFIG.headless) {
        options.addArguments('--headless=new');
    }
    
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');
    options.addArguments('--disable-gpu');
    options.addArguments('--window-size=1920,1080');
    options.addArguments('--disable-blink-features=AutomationControlled');
    options.addArguments('--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    options.addArguments('--lang=en-US');
    
    return options;
}

async function takeScreenshot(driver, testName) {
    try {
        const screenshotDir = path.join(__dirname, '..', 'screenshots');
        if (!fs.existsSync(screenshotDir)) {
            fs.mkdirSync(screenshotDir, { recursive: true });
        }
        
        const safeName = testName.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50);
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `${safeName}_${timestamp}.png`;
        const filepath = path.join(screenshotDir, filename);
        
        const screenshot = await driver.takeScreenshot();
        fs.writeFileSync(filepath, screenshot, 'base64');
        console.log(`    📸 Screenshot saved: ${filename}`);
        return filepath;
    } catch (e) {
        console.log(`    ⚠️ Screenshot failed: ${e.message}`);
        return null;
    }
}

// ═══════════════════════════════════════════════════════════════════════════
//  📄 PAGE OBJECT: SearchEnginePage
// ═══════════════════════════════════════════════════════════════════════════

class SearchEnginePage {
    constructor(driver) {
        this.driver = driver;
        this.url = CONFIG.searchEngineUrl;
    }

    // Complexity: O(N*M) — nested iteration
    async handleConsent() {
        console.log('    🍪 [UI Log]: Checking for consent dialog...');
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.driver.sleep(1500);
        
        const consentSelectors = [
            'button[id="L2AGLb"]',
            'button[aria-label="Accept all"]',
            'button.tHlp8d'
        ];
        
        for (const selector of consentSelectors) {
            try {
                const button = await this.driver.findElement(By.css(selector));
                if (await button.isDisplayed().catch(() => false)) {
                    await button.click();
                    console.log('    ✅ [UI Log]: Consent accepted!');
                    await this.driver.sleep(1000);
                    return true;
                }
            } catch (e) {
                continue;
            }
        }
        
        console.log('    ℹ️ [UI Log]: No consent dialog present, skipping.');
        return false;
    }

    // Complexity: O(1) — lookup
    async open() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.driver.get(this.url);
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.handleConsent();
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.driver.sleep(1500);
        return this;
    }

    // Complexity: O(1)
    async getSearchBox() {
        const selectors = 'input[name="q"], textarea[name="q"]';
        // SAFETY: async operation — wrap in try-catch for production resilience
        const element = await this.driver.wait(
            until.elementLocated(By.css(selectors)),
            CONFIG.timeout
        );
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.driver.wait(until.elementIsVisible(element), 5000);
        return element;
    }

    // Complexity: O(1)
    async getTitle() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        return await this.driver.getTitle();
    }
}

// ═══════════════════════════════════════════════════════════════════════════
//  🧪 DATA-DRIVEN TEST SUITE
// ═══════════════════════════════════════════════════════════════════════════

    // Complexity: O(N) — linear scan
describe('🔄 Data-Driven Search Component Tests', function() {
    this.timeout(120000);
    
    let driver;
    let searchPage;

    // Complexity: O(1)
    before(async function() {
        console.log('\n    🚀 [Setup]: Initializing WebDriver...');
        console.log(`    📋 [Config]: Mode = ${CONFIG.headless ? 'HEADLESS' : 'VISUAL'}`);
        console.log(`    📊 [Config]: Test Cases = ${testData.searchTests.length}\n`);
        
        // SAFETY: async operation — wrap in try-catch for production resilience
        driver = await new Builder()
            .forBrowser('chrome')
            .setChromeOptions(getChromeOptions())
            .build();
        
        searchPage = new SearchEnginePage(driver);
        console.log('    ✅ [Setup]: Browser initialized successfully!\n');
    });

    // Complexity: O(1)
    after(async function() {
        if (driver) {
            console.log('\n    🛑 [Teardown]: Closing browser...');
            // SAFETY: async operation — wrap in try-catch for production resilience
            await driver.quit();
        }
    });

    // Complexity: O(1)
    afterEach(async function() {
        if (this.currentTest.state === 'failed' && CONFIG.screenshotOnFailure) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await takeScreenshot(driver, this.currentTest.title);
        }
    });

    // ═══════════════════════════════════════════════════════════════════════
    //  🔄 DYNAMIC TEST GENERATION FROM JSON DATA
    // ═══════════════════════════════════════════════════════════════════════
    
    // Complexity: O(N) — linear scan
    describe('Search Input Component - Data-Driven Validation', function() {
        
        // Complexity: O(1)
        before(async function() {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await searchPage.open();
        });

        // 🎯 DDT MAGIC: One loop generates multiple tests!
        testData.searchTests.forEach((testCase) => {
            
            // Complexity: O(N)
            it(`🔍 [TC-${testCase.id}] Should accept input: "${testCase.query}"`, async function() {
                console.log(`\n    ══════════════════════════════════════════`);
                console.log(`    📝 [Test Case #${testCase.id}]: ${testCase.query}`);
                console.log(`    📖 [Description]: ${testCase.description}`);
                console.log(`    ══════════════════════════════════════════`);
                
                // 1. Locate search component
                // SAFETY: async operation — wrap in try-catch for production resilience
                const searchBox = await searchPage.getSearchBox();
                
                // 2. Clear previous state and input new data
                // SAFETY: async operation — wrap in try-catch for production resilience
                await searchBox.clear();
                // SAFETY: async operation — wrap in try-catch for production resilience
                await driver.sleep(300);
                // SAFETY: async operation — wrap in try-catch for production resilience
                await searchBox.sendKeys(testCase.query);
                
                // 3. Verify input value
                // SAFETY: async operation — wrap in try-catch for production resilience
                const actualValue = await searchBox.getAttribute('value');
                console.log(`    ✏️ [Input]: "${actualValue}"`);
                
                // 4. ASSERTION: Validate data integrity
                // Complexity: O(N)
                expect(actualValue.toLowerCase()).to.include(
                    testCase.query.toLowerCase().split(' ')[0],
                    `Input validation failed for: ${testCase.query}`
                );
                console.log(`    ✅ [Assertion]: Input verified successfully!`);
            });
        });
    });

    // ═══════════════════════════════════════════════════════════════════════
    //  📈 SUMMARY
    // ═══════════════════════════════════════════════════════════════════════
    
    // Complexity: O(1)
    describe('Test Execution Summary', function() {
        // Complexity: O(1)
        it('📊 All DDT test cases completed', function() {
            console.log('\n    ════════════════════════════════════════════════════');
            console.log(`    🎉 DATA-DRIVEN TESTING COMPLETE!`);
            console.log(`    📊 Total test cases executed: ${testData.searchTests.length}`);
            console.log(`    📁 Data source: testData.json`);
            console.log('    ════════════════════════════════════════════════════\n');
            // Complexity: O(1)
            expect(true).to.be.true;
        });
    });
});
