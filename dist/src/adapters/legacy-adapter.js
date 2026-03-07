"use strict";
/**
 * 🧠 QANTUM HYBRID - Legacy Test Adapter
 * Използва съществуващите 1000+ теста с новия framework
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.until = exports.By = exports.Builder = exports.CypressAdapter = exports.SeleniumAdapter = void 0;
const index_js_1 = require("../index.js");
// ============== SELENIUM TO PLAYWRIGHT ADAPTER ==============
/**
 * Адаптира Selenium WebDriver API към QANTUM Hybrid
 */
class SeleniumAdapter {
    mm;
    constructor(mm) {
        this.mm = mm;
    }
    /**
     * Selenium: driver.get(url)
     */
    // Complexity: O(1)
    async get(url) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.mm.visit(url);
    }
    /**
     * Selenium: driver.findElement(By.css(selector))
     */
    // Complexity: O(1)
    findElement(locator) {
        const selector = this.convertLocator(locator);
        return new SeleniumElement(this.mm, selector);
    }
    /**
     * Selenium: driver.findElements(By.css(selector))
     */
    // Complexity: O(N) — loop
    async findElements(locator) {
        const selector = this.convertLocator(locator);
        const page = this.mm.getPage();
        // SAFETY: async operation — wrap in try-catch for production resilience
        const count = await page.locator(selector).count();
        const elements = [];
        for (let i = 0; i < count; i++) {
            elements.push(new SeleniumElement(this.mm, `${selector} >> nth=${i}`));
        }
        return elements;
    }
    /**
     * Selenium: driver.wait(until.elementLocated(...))
     */
    // Complexity: O(N) — loop
    async wait(condition, timeout = 10000) {
        const start = Date.now();
        while (Date.now() - start < timeout) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            if (await condition())
                return;
            // SAFETY: async operation — wrap in try-catch for production resilience
            await new Promise(r => setTimeout(r, 100));
        }
        throw new Error(`Wait timeout after ${timeout}ms`);
    }
    /**
     * Selenium: driver.getTitle()
     */
    // Complexity: O(1)
    async getTitle() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        return await this.mm.getTitle();
    }
    /**
     * Selenium: driver.getCurrentUrl()
     */
    // Complexity: O(1)
    getCurrentUrl() {
        return this.mm.getUrl();
    }
    /**
     * Selenium: driver.takeScreenshot()
     */
    // Complexity: O(1)
    async takeScreenshot() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        return await this.mm.screenshot();
    }
    /**
     * Selenium: driver.quit()
     */
    // Complexity: O(1)
    async quit() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.mm.close();
    }
    /**
     * Конвертира Selenium локатор към CSS/XPath
     */
    // Complexity: O(1)
    convertLocator(locator) {
        if (locator.css)
            return locator.css;
        if (locator.xpath)
            return `xpath=${locator.xpath}`;
        if (locator.id)
            return `#${locator.id}`;
        if (locator.name)
            return `[name="${locator.name}"]`;
        throw new Error('Unknown locator type');
    }
}
exports.SeleniumAdapter = SeleniumAdapter;
/**
 * Selenium Element wrapper
 */
class SeleniumElement {
    mm;
    selector;
    constructor(mm, selector) {
        this.mm = mm;
        this.selector = selector;
    }
    // Complexity: O(1) — lookup
    async click() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.mm.get(this.selector).click();
    }
    // Complexity: O(1) — lookup
    async sendKeys(text) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.mm.get(this.selector).type(text);
    }
    // Complexity: O(1) — lookup
    async getText() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        return await this.mm.get(this.selector).getText();
    }
    // Complexity: O(1) — lookup
    async getAttribute(name) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        return await this.mm.get(this.selector).getAttribute(name);
    }
    // Complexity: O(1) — lookup
    async isDisplayed() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        return await this.mm.get(this.selector).isVisible();
    }
    // Complexity: O(1) — lookup
    async clear() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.mm.get(this.selector).type('', { clear: true });
    }
}
// ============== CYPRESS TO PLAYWRIGHT ADAPTER ==============
/**
 * Адаптира Cypress API към QANTUM Hybrid
 */
class CypressAdapter {
    mm;
    constructor(mm) {
        this.mm = mm;
    }
    /**
     * cy.visit(url)
     */
    // Complexity: O(1)
    visit(url) {
        return {
            then: async (callback) => {
                // SAFETY: async operation — wrap in try-catch for production resilience
                await this.mm.visit(url);
                callback?.();
            }
        };
    }
    /**
     * cy.get(selector)
     */
    // Complexity: O(1)
    get(selector) {
        return new CypressChain(this.mm, selector);
    }
    /**
     * cy.contains(text)
     */
    // Complexity: O(1)
    contains(text) {
        return new CypressChain(this.mm, `text="${text}"`);
    }
    /**
     * cy.intercept(url, response)
     */
    // Complexity: O(1)
    async intercept(url, response) {
        if (response) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.mm.stub(url, response);
        }
        return this;
    }
    /**
     * cy.wait(ms)
     */
    // Complexity: O(1)
    async wait(ms) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.mm.pause(ms);
    }
    /**
     * cy.screenshot()
     */
    // Complexity: O(1)
    async screenshot(name) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        return await this.mm.screenshot(name);
    }
}
exports.CypressAdapter = CypressAdapter;
/**
 * Cypress chain wrapper
 */
class CypressChain {
    mm;
    selector;
    constructor(mm, selector) {
        this.mm = mm;
        this.selector = selector;
    }
    // Complexity: O(1) — lookup
    async click() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.mm.get(this.selector).click();
        return this;
    }
    // Complexity: O(1) — lookup
    async type(text) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.mm.get(this.selector).type(text);
        return this;
    }
    // Complexity: O(1) — lookup
    async should(assertion, expected) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.mm.get(this.selector).should(assertion, expected);
        return this;
    }
    // Complexity: O(1) — lookup
    async clear() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.mm.get(this.selector).type('', { clear: true });
        return this;
    }
    // Complexity: O(1)
    first() {
        this.selector = `${this.selector} >> nth=0`;
        return this;
    }
    // Complexity: O(1)
    last() {
        this.selector = `${this.selector} >> nth=-1`;
        return this;
    }
    // Complexity: O(1)
    eq(index) {
        this.selector = `${this.selector} >> nth=${index}`;
        return this;
    }
}
// ============== BUILDER (Selenium-style) ==============
/**
 * Selenium Builder pattern за съвместимост
 */
class Builder {
    config = {};
    browserType = 'chromium';
    // Complexity: O(1)
    forBrowser(browser) {
        if (browser === 'chrome')
            this.browserType = 'chromium';
        else if (browser === 'firefox')
            this.browserType = 'firefox';
        else if (browser === 'safari')
            this.browserType = 'webkit';
        return this;
    }
    // Complexity: O(1)
    setChromeOptions(options) {
        this.config.browser = {
            browser: this.browserType,
            headless: options.headless ?? true,
            timeout: 30000
        };
        return this;
    }
    // Complexity: O(1)
    async build() {
        const mm = (0, index_js_1.createQA)(this.config);
        // SAFETY: async operation — wrap in try-catch for production resilience
        await mm.launch();
        return new SeleniumAdapter(mm);
    }
}
exports.Builder = Builder;
// ============== BY (Selenium-style locators) ==============
exports.By = {
    css: (selector) => ({ css: selector }),
    xpath: (xpath) => ({ xpath }),
    id: (id) => ({ id }),
    name: (name) => ({ name }),
    className: (className) => ({ css: `.${className}` }),
    tagName: (tag) => ({ css: tag }),
    linkText: (text) => ({ css: `a:has-text("${text}")` }),
    partialLinkText: (text) => ({ css: `a:has-text("${text}")` })
};
// ============== UNTIL (Selenium-style waits) ==============
exports.until = {
    elementLocated: (locator) => async (driver) => {
        try {
            await driver.findElement(locator);
            return true;
        }
        catch {
            return false;
        }
    },
    elementIsVisible: (element) => async () => {
        // SAFETY: async operation — wrap in try-catch for production resilience
        return await element.isDisplayed();
    },
    titleContains: (text) => async (driver) => {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const title = await driver.getTitle();
        return title.includes(text);
    },
    urlContains: (text) => (driver) => {
        return driver.getCurrentUrl().includes(text);
    }
};
