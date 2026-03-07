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
    async get(url) {
        await this.mm.visit(url);
    }
    /**
     * Selenium: driver.findElement(By.css(selector))
     */
    findElement(locator) {
        const selector = this.convertLocator(locator);
        return new SeleniumElement(this.mm, selector);
    }
    /**
     * Selenium: driver.findElements(By.css(selector))
     */
    async findElements(locator) {
        const selector = this.convertLocator(locator);
        const page = this.mm.getPage();
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
    async wait(condition, timeout = 10000) {
        const start = Date.now();
        while (Date.now() - start < timeout) {
            if (await condition())
                return;
            await new Promise(r => setTimeout(r, 100));
        }
        throw new Error(`Wait timeout after ${timeout}ms`);
    }
    /**
     * Selenium: driver.getTitle()
     */
    async getTitle() {
        return await this.mm.getTitle();
    }
    /**
     * Selenium: driver.getCurrentUrl()
     */
    getCurrentUrl() {
        return this.mm.getUrl();
    }
    /**
     * Selenium: driver.takeScreenshot()
     */
    async takeScreenshot() {
        return await this.mm.screenshot();
    }
    /**
     * Selenium: driver.quit()
     */
    async quit() {
        await this.mm.close();
    }
    /**
     * Конвертира Selenium локатор към CSS/XPath
     */
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
    async click() {
        await this.mm.get(this.selector).click();
    }
    async sendKeys(text) {
        await this.mm.get(this.selector).type(text);
    }
    async getText() {
        return await this.mm.get(this.selector).getText();
    }
    async getAttribute(name) {
        return await this.mm.get(this.selector).getAttribute(name);
    }
    async isDisplayed() {
        return await this.mm.get(this.selector).isVisible();
    }
    async clear() {
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
    visit(url) {
        return {
            then: async (callback) => {
                await this.mm.visit(url);
                callback?.();
            }
        };
    }
    /**
     * cy.get(selector)
     */
    get(selector) {
        return new CypressChain(this.mm, selector);
    }
    /**
     * cy.contains(text)
     */
    contains(text) {
        return new CypressChain(this.mm, `text="${text}"`);
    }
    /**
     * cy.intercept(url, response)
     */
    async intercept(url, response) {
        if (response) {
            await this.mm.stub(url, response);
        }
        return this;
    }
    /**
     * cy.wait(ms)
     */
    async wait(ms) {
        await this.mm.pause(ms);
    }
    /**
     * cy.screenshot()
     */
    async screenshot(name) {
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
    async click() {
        await this.mm.get(this.selector).click();
        return this;
    }
    async type(text) {
        await this.mm.get(this.selector).type(text);
        return this;
    }
    async should(assertion, expected) {
        await this.mm.get(this.selector).should(assertion, expected);
        return this;
    }
    async clear() {
        await this.mm.get(this.selector).type('', { clear: true });
        return this;
    }
    first() {
        this.selector = `${this.selector} >> nth=0`;
        return this;
    }
    last() {
        this.selector = `${this.selector} >> nth=-1`;
        return this;
    }
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
    forBrowser(browser) {
        if (browser === 'chrome')
            this.browserType = 'chromium';
        else if (browser === 'firefox')
            this.browserType = 'firefox';
        else if (browser === 'safari')
            this.browserType = 'webkit';
        return this;
    }
    setChromeOptions(options) {
        this.config.browser = {
            browser: this.browserType,
            headless: options.headless ?? true,
            timeout: 30000
        };
        return this;
    }
    async build() {
        const mm = (0, index_js_1.createQA)(this.config);
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
        return await element.isDisplayed();
    },
    titleContains: (text) => async (driver) => {
        const title = await driver.getTitle();
        return title.includes(text);
    },
    urlContains: (text) => (driver) => {
        return driver.getCurrentUrl().includes(text);
    }
};
