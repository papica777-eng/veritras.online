/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  🧠 QANTUM - HYBRID TEST SUITE (CI/CD Ready + Bulletproof)
 * ═══════════════════════════════════════════════════════════════════════════
 *  
 *  📋 This test demonstrates:
 *     ✅ API testing with Axios + Chai
 *     ✅ UI testing with Selenium WebDriver
 *     ✅ Headless Chrome mode for CI/CD
 *     ✅ Environment Variables from .env file
 *     ✅ Screenshot on Failure for debugging
 *     ✅ Page Object Model (POM) pattern
 *     ✅ Bulletproof Google Consent handling
 *     ✅ Parallel execution ready
 * 
 *  🚀 Run: npm test
 *  🚀 Parallel: npm run test:parallel
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

require('dotenv').config();

const { Builder, By, until, Key } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const axios = require('axios');
const { expect } = require('chai');
const fs = require('fs');
const path = require('path');

// ═══════════════════════════════════════════════════════════════════════════
//  🔧 CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const CONFIG = {
    baseUrl: process.env.BASE_URL || 'https://jsonplaceholder.typicode.com/posts/1',
    apiBaseUrl: process.env.API_BASE_URL || 'https://jsonplaceholder.typicode.com',
    googleUrl: process.env.GOOGLE_URL || 'https://www.google.com',
    headless: process.env.HEADLESS === 'false' ? false : true,
    timeout: parseInt(process.env.BROWSER_TIMEOUT) || 15000,
    screenshotOnFailure: process.env.SCREENSHOT_ON_FAILURE !== 'false',
    screenshotDir: process.env.SCREENSHOT_DIR || './screenshots'
};

// ═══════════════════════════════════════════════════════════════════════════
//  📸 SCREENSHOT HELPER
// ═══════════════════════════════════════════════════════════════════════════

async function takeScreenshot(driver, testName) {
    if (!driver) return null;
    
    try {
        if (!fs.existsSync(CONFIG.screenshotDir)) {
            fs.mkdirSync(CONFIG.screenshotDir, { recursive: true });
        }
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const sanitizedName = testName.replace(/[^a-zA-Z0-9]/g, '_');
        const filename = `${sanitizedName}_${timestamp}.png`;
        const filepath = path.join(CONFIG.screenshotDir, filename);
        
        const screenshot = await driver.takeScreenshot();
        fs.writeFileSync(filepath, screenshot, 'base64');
        
        console.log(`    📸 Screenshot saved: ${filepath}`);
        return filepath;
    } catch (error) {
        console.log(`    ⚠️ Screenshot failed: ${error.message}`);
        return null;
    }
}

// ═══════════════════════════════════════════════════════════════════════════
//  🌐 CHROME OPTIONS
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
    options.addArguments('--disable-extensions');
    options.addArguments('--disable-popup-blocking');
    options.addArguments('--ignore-certificate-errors');
    options.addArguments('--disable-blink-features=AutomationControlled');
    options.addArguments('--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    options.addArguments('--disable-notifications');
    options.addArguments('--disable-infobars');
    options.addArguments('--lang=en-US');
    
    return options;
}

// ═══════════════════════════════════════════════════════════════════════════
//  📄 PAGE OBJECT: GooglePage
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Page Object Model for Google
 * 
 * 🛡️ BULLETPROOF Consent Handler with try-catch
 * 
 * WHY try-catch is GOOD practice for optional elements:
 * 
 * 1. OPTIONAL ELEMENT: Consent dialog may or may NOT appear
 *    - In EU: ALWAYS appears (GDPR)
 *    - In USA: RARELY appears
 *    - On repeat visits: Does NOT appear (cookies)
 * 
 * 2. FLAKY TEST PREVENTION: Without try-catch test will FAIL if:
 *    - Dialog doesn't appear in time
 *    - Selector changes
 *    - Network is slow
 * 
 * 3. GRACEFUL DEGRADATION: Test continues even if consent
 *    handling fails - main functionality is still tested
 * 
 * 4. IDEMPOTENT: Can be called multiple times without issues
 */
class GooglePage {
    constructor(driver) {
        this.driver = driver;
        this.url = CONFIG.googleUrl;
        
        this.selectors = {
            searchBox: 'input[name="q"], textarea[name="q"]',
            consentButtonsCSS: [
                'button[id="L2AGLb"]',
                'button[aria-label="Accept all"]',
                '[data-ved] button:first-child',
                'button.tHlp8d',
                'div[role="dialog"] button:first-of-type'
            ],
            consentButtonsXPath: [
                '//button[contains(text(), "Accept")]',
                '//button[contains(text(), "Accept all")]',
                '//button[contains(text(), "I agree")]'
            ]
        };
    }

    // Complexity: O(N*M) — nested iteration
    async handleConsent() {
        console.log('    🍪 Checking for consent dialog...');
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.driver.sleep(2000);
        
        for (const selector of this.selectors.consentButtonsCSS) {
            try {
                const button = await this.driver.findElement(By.css(selector));
                const isDisplayed = await button.isDisplayed().catch(() => false);
                
                if (isDisplayed) {
                    console.log(`    ✅ Consent button found (CSS): ${selector}`);
                    await button.click();
                    console.log('    🎉 Consent accepted!');
                    await this.driver.sleep(1000);
                    return true;
                }
            } catch (e) {
                continue;
            }
        }
        
        for (const xpath of this.selectors.consentButtonsXPath) {
            try {
                const button = await this.driver.findElement(By.xpath(xpath));
                const isDisplayed = await button.isDisplayed().catch(() => false);
                
                if (isDisplayed) {
                    console.log(`    ✅ Consent button found (XPath)`);
                    await button.click();
                    console.log('    🎉 Consent accepted!');
                    await this.driver.sleep(1000);
                    return true;
                }
            } catch (e) {
                continue;
            }
        }
        
        console.log('    ℹ️ No consent dialog found (already accepted or not shown)');
        return false;
    }

    // Complexity: O(1) — lookup
    async open() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.driver.get(this.url);
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.handleConsent();
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.driver.sleep(2000);
        return this;
    }

    // Complexity: O(1)
    async search(query) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const searchBox = await this.getSearchBox();
        // SAFETY: async operation — wrap in try-catch for production resilience
        await searchBox.clear();
        // SAFETY: async operation — wrap in try-catch for production resilience
        await searchBox.sendKeys(query, Key.RETURN);
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.driver.wait(until.titleContains(query), CONFIG.timeout);
        return this;
    }

    // Complexity: O(1)
    async getSearchBox() {
        const allSelectors = 'input[name="q"], textarea[name="q"], textarea[title="Search"], input[title="Search"]';
        
        try {
            const element = await this.driver.wait(
                until.elementLocated(By.css(allSelectors)),
                10000
            );
            await this.driver.wait(until.elementIsVisible(element), 3000);
            console.log(`    🔍 Search box found!`);
            return element;
        } catch (e) {
            throw new Error('Search box not found: ' + e.message);
        }
    }

    // Complexity: O(1)
    async isSearchBoxVisible() {
        try {
            const searchBox = await this.getSearchBox();
            return await searchBox.isDisplayed();
        } catch (e) {
            return false;
        }
    }

    // Complexity: O(1)
    async getTitle() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        return await this.driver.getTitle();
    }
}

// ═══════════════════════════════════════════════════════════════════════════
//  🧪 TEST SUITE 1: API TESTS
// ═══════════════════════════════════════════════════════════════════════════

    // Complexity: O(N)
describe('🌐 API Tests (JSONPlaceholder)', function() {
    this.timeout(15000);

    // Complexity: O(1) — lookup
    describe('GET /posts/1', function() {
        
        // Complexity: O(1) — lookup
        it('✅ Should return status 200', async function() {
            // SAFETY: async operation — wrap in try-catch for production resilience
            const response = await axios.get(CONFIG.baseUrl);
            // Complexity: O(1)
            expect(response.status).to.equal(200);
        });

        // Complexity: O(1) — lookup
        it('✅ Should return object with correct structure', async function() {
            // SAFETY: async operation — wrap in try-catch for production resilience
            const response = await axios.get(CONFIG.baseUrl);
            // Complexity: O(1)
            expect(response.data).to.be.an('object');
            // Complexity: O(1)
            expect(response.data).to.have.property('userId');
            // Complexity: O(1)
            expect(response.data).to.have.property('id');
            // Complexity: O(1)
            expect(response.data).to.have.property('title');
            // Complexity: O(1)
            expect(response.data).to.have.property('body');
        });

        // Complexity: O(1) — lookup
        it('✅ Should have id equal to 1', async function() {
            // SAFETY: async operation — wrap in try-catch for production resilience
            const response = await axios.get(CONFIG.baseUrl);
            // Complexity: O(1)
            expect(response.data.id).to.equal(1);
        });

        // Complexity: O(1) — lookup
        it('✅ Title should not be empty', async function() {
            // SAFETY: async operation — wrap in try-catch for production resilience
            const response = await axios.get(CONFIG.baseUrl);
            // Complexity: O(1)
            expect(response.data.title).to.be.a('string').and.not.be.empty;
        });
    });

    // Complexity: O(1)
    describe('POST /posts', function() {
        
        // Complexity: O(1)
        it('✅ Should create a new post', async function() {
            const newPost = {
                title: 'QANTUM Test Post',
                body: 'Created by AI QA Agent',
                userId: 1
            };

            // SAFETY: async operation — wrap in try-catch for production resilience
            const response = await axios.post(`${CONFIG.apiBaseUrl}/posts`, newPost);
            // Complexity: O(1)
            expect(response.status).to.equal(201);
            // Complexity: O(1)
            expect(response.data).to.have.property('id');
            // Complexity: O(1)
            expect(response.data.title).to.equal(newPost.title);
        });
    });

    // Complexity: O(N)
    describe('Error Handling', function() {
        
        // Complexity: O(N)
        it('✅ Should return 404 for non-existent resource', async function() {
            try {
                await axios.get(`${CONFIG.apiBaseUrl}/posts/99999`);
                expect.fail('Should have thrown an error');
            } catch (error) {
                // Complexity: O(1)
                expect(error.response.status).to.equal(404);
            }
        });
    });
});

// ═══════════════════════════════════════════════════════════════════════════
//  🧪 TEST SUITE 2: UI TESTS
// ═══════════════════════════════════════════════════════════════════════════

    // Complexity: O(1)
describe('🖥️ UI Tests (Bulletproof)', function() {
    this.timeout(90000);
    
    let driver;
    let googlePage;

    // Complexity: O(1)
    before(async function() {
        console.log('\n    🚀 Starting Chrome...');
        console.log(`    📋 Mode: ${CONFIG.headless ? 'HEADLESS (CI/CD Ready)' : 'VISUAL'}`);
        
        // SAFETY: async operation — wrap in try-catch for production resilience
        driver = await new Builder()
            .forBrowser('chrome')
            .setChromeOptions(getChromeOptions())
            .build();
        
        googlePage = new GooglePage(driver);
        console.log('    ✅ Chrome started successfully!\n');
    });

    // Complexity: O(1)
    after(async function() {
        if (driver) {
            console.log('\n    🛑 Closing Chrome...');
            // SAFETY: async operation — wrap in try-catch for production resilience
            await driver.quit();
        }
    });

    // Complexity: O(1)
    afterEach(async function() {
        if (this.currentTest.state === 'failed' && CONFIG.screenshotOnFailure) {
            console.log(`\n    ❌ Test FAILED: ${this.currentTest.title}`);
            // SAFETY: async operation — wrap in try-catch for production resilience
            await takeScreenshot(driver, this.currentTest.title);
        }
    });

    // Complexity: O(1)
    describe('Google (with Consent Handling)', function() {
        
        // Complexity: O(1)
        before(async function() {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await googlePage.open();
        });
        
        // Complexity: O(1)
        it('✅ Should load Google and handle consent', async function() {
            // SAFETY: async operation — wrap in try-catch for production resilience
            const title = await googlePage.getTitle();
            console.log(`    📄 Page title: ${title}`);
            // Complexity: O(1)
            expect(title.toLowerCase()).to.include('google');
        });

        // Complexity: O(1)
        it('✅ Search box should be visible', async function() {
            // SAFETY: async operation — wrap in try-catch for production resilience
            const isVisible = await googlePage.isSearchBoxVisible();
            // Complexity: O(1)
            expect(isVisible).to.be.true;
        });

        // Complexity: O(1)
        it('✅ Should be able to enter text in search box', async function() {
            // SAFETY: async operation — wrap in try-catch for production resilience
            const searchBox = await googlePage.getSearchBox();
            // SAFETY: async operation — wrap in try-catch for production resilience
            await searchBox.clear();
            // SAFETY: async operation — wrap in try-catch for production resilience
            await searchBox.sendKeys('QANTUM QA');
            // SAFETY: async operation — wrap in try-catch for production resilience
            const value = await searchBox.getAttribute('value');
            // Complexity: O(1)
            expect(value).to.include('QANTUM');
        });

        it.skip('✅ Should search and get results', async function() {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await googlePage.search('Selenium WebDriver');
            // SAFETY: async operation — wrap in try-catch for production resilience
            const title = await googlePage.getTitle();
            // Complexity: O(1)
            expect(title.toLowerCase()).to.include('selenium');
        });
    });

    // Complexity: O(1) — lookup
    describe('Screenshot Tests', function() {
        
        // Complexity: O(1) — lookup
        it('📸 Screenshot on successful test', async function() {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await driver.get(CONFIG.googleUrl);
            // SAFETY: async operation — wrap in try-catch for production resilience
            const screenshotPath = await takeScreenshot(driver, 'google_success');
            // Complexity: O(1)
            expect(screenshotPath).to.not.be.null;
        });
    });
});
