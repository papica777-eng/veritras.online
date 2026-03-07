"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * MIND-ENGINE: SELENIUM ADAPTER
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Full WebDriver API compatibility layer for migrating from Selenium
 * Drop-in replacement for selenium-webdriver with Playwright backend
 *
 * @author dp | QAntum Labs
 * @version 1.0.0-QANTUM-PRIME
 * @license Commercial
 * ═══════════════════════════════════════════════════════════════════════════════
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Builder = exports.WebDriver = exports.Navigation = exports.WindowOptions = exports.Timeouts = exports.Options = exports.TargetLocator = exports.Actions = exports.Alert = exports.until = exports.WebElement = exports.Key = exports.By = void 0;
const events_1 = require("events");
const playwright_1 = require("playwright");
// ═══════════════════════════════════════════════════════════════════════════════
// BY LOCATOR CLASS
// ═══════════════════════════════════════════════════════════════════════════════
class By {
    using;
    value;
    constructor(using, value) {
        this.using = using;
        this.value = value;
    }
    static id(id) {
        return new By('id', id);
    }
    static name(name) {
        return new By('name', name);
    }
    static className(className) {
        return new By('className', className);
    }
    static css(selector) {
        return new By('css', selector);
    }
    static xpath(xpath) {
        return new By('xpath', xpath);
    }
    static linkText(text) {
        return new By('linkText', text);
    }
    static partialLinkText(text) {
        return new By('partialLinkText', text);
    }
    static tagName(tagName) {
        return new By('tagName', tagName);
    }
    static js(script) {
        return new By('js', script);
    }
    /**
     * Convert to Playwright selector
     */
    toPlaywright() {
        switch (this.using) {
            case 'id':
                return `#${this.value}`;
            case 'name':
                return `[name="${this.value}"]`;
            case 'className':
                return `.${this.value.split(' ').join('.')}`;
            case 'css':
                return this.value;
            case 'xpath':
                return `xpath=${this.value}`;
            case 'linkText':
                return `text="${this.value}"`;
            case 'partialLinkText':
                return `text=${this.value}`;
            case 'tagName':
                return this.value;
            default:
                return this.value;
        }
    }
}
exports.By = By;
// ═══════════════════════════════════════════════════════════════════════════════
// KEY CLASS
// ═══════════════════════════════════════════════════════════════════════════════
exports.Key = {
    NULL: '\uE000',
    CANCEL: '\uE001',
    HELP: '\uE002',
    BACK_SPACE: 'Backspace',
    TAB: 'Tab',
    CLEAR: '\uE005',
    RETURN: 'Enter',
    ENTER: 'Enter',
    SHIFT: 'Shift',
    CONTROL: 'Control',
    ALT: 'Alt',
    PAUSE: 'Pause',
    ESCAPE: 'Escape',
    SPACE: ' ',
    PAGE_UP: 'PageUp',
    PAGE_DOWN: 'PageDown',
    END: 'End',
    HOME: 'Home',
    ARROW_LEFT: 'ArrowLeft',
    LEFT: 'ArrowLeft',
    ARROW_UP: 'ArrowUp',
    UP: 'ArrowUp',
    ARROW_RIGHT: 'ArrowRight',
    RIGHT: 'ArrowRight',
    ARROW_DOWN: 'ArrowDown',
    DOWN: 'ArrowDown',
    INSERT: 'Insert',
    DELETE: 'Delete',
    SEMICOLON: ';',
    EQUALS: '=',
    NUMPAD0: '0',
    NUMPAD1: '1',
    NUMPAD2: '2',
    NUMPAD3: '3',
    NUMPAD4: '4',
    NUMPAD5: '5',
    NUMPAD6: '6',
    NUMPAD7: '7',
    NUMPAD8: '8',
    NUMPAD9: '9',
    MULTIPLY: '*',
    ADD: '+',
    SEPARATOR: ',',
    SUBTRACT: '-',
    DECIMAL: '.',
    DIVIDE: '/',
    F1: 'F1',
    F2: 'F2',
    F3: 'F3',
    F4: 'F4',
    F5: 'F5',
    F6: 'F6',
    F7: 'F7',
    F8: 'F8',
    F9: 'F9',
    F10: 'F10',
    F11: 'F11',
    F12: 'F12',
    META: 'Meta',
    COMMAND: 'Meta',
    chord(...keys) {
        return keys.join('');
    }
};
// ═══════════════════════════════════════════════════════════════════════════════
// WEB ELEMENT CLASS
// ═══════════════════════════════════════════════════════════════════════════════
class WebElement {
    locator;
    driver;
    constructor(locator, driver) {
        this.locator = locator;
        this.driver = driver;
    }
    /**
     * Click element
     */
    async click() {
        await this.locator.click();
    }
    /**
     * Send keys to element
     */
    async sendKeys(...keys) {
        const text = keys.join('');
        // Check for special keys
        if (text.includes(exports.Key.ENTER)) {
            await this.locator.press('Enter');
        }
        else if (text.includes(exports.Key.TAB)) {
            await this.locator.press('Tab');
        }
        else if (text.includes(exports.Key.ESCAPE)) {
            await this.locator.press('Escape');
        }
        else {
            await this.locator.fill(text);
        }
    }
    /**
     * Clear element
     */
    async clear() {
        await this.locator.clear();
    }
    /**
     * Get text content
     */
    async getText() {
        return (await this.locator.textContent()) || '';
    }
    /**
     * Get attribute
     */
    async getAttribute(name) {
        return this.locator.getAttribute(name);
    }
    /**
     * Get CSS property
     */
    async getCssValue(propertyName) {
        return this.locator.evaluate((el, prop) => {
            return window.getComputedStyle(el).getPropertyValue(prop);
        }, propertyName);
    }
    /**
     * Get tag name
     */
    async getTagName() {
        return this.locator.evaluate(el => el.tagName.toLowerCase());
    }
    /**
     * Check if displayed
     */
    async isDisplayed() {
        return this.locator.isVisible();
    }
    /**
     * Check if enabled
     */
    async isEnabled() {
        return this.locator.isEnabled();
    }
    /**
     * Check if selected
     */
    async isSelected() {
        return this.locator.isChecked();
    }
    /**
     * Submit form
     */
    async submit() {
        await this.locator.evaluate((el) => {
            const form = el.closest('form');
            if (form)
                form.submit();
        });
    }
    /**
     * Get element rect
     */
    async getRect() {
        const box = await this.locator.boundingBox();
        return box || { x: 0, y: 0, width: 0, height: 0 };
    }
    /**
     * Get location
     */
    async getLocation() {
        const rect = await this.getRect();
        return { x: rect.x, y: rect.y };
    }
    /**
     * Get size
     */
    async getSize() {
        const rect = await this.getRect();
        return { width: rect.width, height: rect.height };
    }
    /**
     * Find child element
     */
    async findElement(by) {
        const selector = by.toPlaywright();
        const child = this.locator.locator(selector).first();
        return new WebElement(child, this.driver);
    }
    /**
     * Find child elements
     */
    async findElements(by) {
        const selector = by.toPlaywright();
        const children = this.locator.locator(selector);
        const count = await children.count();
        const elements = [];
        for (let i = 0; i < count; i++) {
            elements.push(new WebElement(children.nth(i), this.driver));
        }
        return elements;
    }
    /**
     * Take screenshot
     */
    async takeScreenshot() {
        return this.locator.screenshot();
    }
    /**
     * Get ID
     */
    async getId() {
        return (await this.getAttribute('id')) || '';
    }
    /**
     * Get underlying Playwright locator
     */
    getLocator() {
        return this.locator;
    }
}
exports.WebElement = WebElement;
// ═══════════════════════════════════════════════════════════════════════════════
// EXPECTED CONDITIONS (until)
// ═══════════════════════════════════════════════════════════════════════════════
exports.until = {
    elementLocated(by) {
        return async (driver) => {
            return driver.findElement(by);
        };
    },
    elementsLocated(by) {
        return async (driver) => {
            const elements = await driver.findElements(by);
            if (elements.length > 0)
                return elements;
            throw new Error('Elements not found');
        };
    },
    elementIsVisible(element) {
        return async () => {
            if (await element.isDisplayed())
                return element;
            throw new Error('Element not visible');
        };
    },
    elementIsNotVisible(element) {
        return async () => {
            if (!(await element.isDisplayed()))
                return true;
            throw new Error('Element still visible');
        };
    },
    elementIsEnabled(element) {
        return async () => {
            if (await element.isEnabled())
                return element;
            throw new Error('Element not enabled');
        };
    },
    elementIsDisabled(element) {
        return async () => {
            if (!(await element.isEnabled()))
                return element;
            throw new Error('Element still enabled');
        };
    },
    elementIsSelected(element) {
        return async () => {
            if (await element.isSelected())
                return element;
            throw new Error('Element not selected');
        };
    },
    elementTextIs(element, text) {
        return async () => {
            if ((await element.getText()) === text)
                return true;
            throw new Error('Text does not match');
        };
    },
    elementTextContains(element, text) {
        return async () => {
            if ((await element.getText()).includes(text))
                return true;
            throw new Error('Text not found');
        };
    },
    titleIs(title) {
        return async (driver) => {
            if (await driver.getTitle() === title)
                return true;
            throw new Error('Title does not match');
        };
    },
    titleContains(text) {
        return async (driver) => {
            if ((await driver.getTitle()).includes(text))
                return true;
            throw new Error('Title does not contain text');
        };
    },
    urlIs(url) {
        return async (driver) => {
            if (await driver.getCurrentUrl() === url)
                return true;
            throw new Error('URL does not match');
        };
    },
    urlContains(text) {
        return async (driver) => {
            if ((await driver.getCurrentUrl()).includes(text))
                return true;
            throw new Error('URL does not contain text');
        };
    },
    alertIsPresent() {
        return async (driver) => {
            // Playwright handles dialogs differently
            throw new Error('Use page.on("dialog") for alerts in Playwright');
        };
    },
    stalenessOf(element) {
        return async () => {
            try {
                await element.getTagName();
                throw new Error('Element still attached');
            }
            catch {
                return true;
            }
        };
    },
    elementToBeClickable(by) {
        return async (driver) => {
            const element = await driver.findElement(by);
            if (await element.isDisplayed() && await element.isEnabled()) {
                return element;
            }
            throw new Error('Element not clickable');
        };
    }
};
// ═══════════════════════════════════════════════════════════════════════════════
// ALERT CLASS
// ═══════════════════════════════════════════════════════════════════════════════
class Alert {
    dialog;
    constructor(dialog) {
        this.dialog = dialog;
    }
    async accept() {
        await this.dialog.accept();
    }
    async dismiss() {
        await this.dialog.dismiss();
    }
    async getText() {
        return this.dialog.message();
    }
    async sendKeys(text) {
        await this.dialog.accept(text);
    }
}
exports.Alert = Alert;
// ═══════════════════════════════════════════════════════════════════════════════
// ACTIONS CLASS
// ═══════════════════════════════════════════════════════════════════════════════
class Actions {
    driver;
    actions = [];
    constructor(driver) {
        this.driver = driver;
    }
    click(element) {
        this.actions.push(async () => {
            if (element) {
                await element.click();
            }
            else {
                await this.driver.getPage().mouse.click(0, 0);
            }
        });
        return this;
    }
    doubleClick(element) {
        this.actions.push(async () => {
            if (element) {
                await element.getLocator().dblclick();
            }
            else {
                await this.driver.getPage().mouse.dblclick(0, 0);
            }
        });
        return this;
    }
    contextClick(element) {
        this.actions.push(async () => {
            if (element) {
                await element.getLocator().click({ button: 'right' });
            }
            else {
                await this.driver.getPage().mouse.click(0, 0, { button: 'right' });
            }
        });
        return this;
    }
    moveToElement(element, xOffset, yOffset) {
        this.actions.push(async () => {
            const rect = await element.getRect();
            const x = rect.x + (xOffset || rect.width / 2);
            const y = rect.y + (yOffset || rect.height / 2);
            await this.driver.getPage().mouse.move(x, y);
        });
        return this;
    }
    sendKeys(...keys) {
        this.actions.push(async () => {
            const text = keys.join('');
            await this.driver.getPage().keyboard.type(text);
        });
        return this;
    }
    keyDown(key) {
        this.actions.push(async () => {
            await this.driver.getPage().keyboard.down(key);
        });
        return this;
    }
    keyUp(key) {
        this.actions.push(async () => {
            await this.driver.getPage().keyboard.up(key);
        });
        return this;
    }
    dragAndDrop(source, target) {
        this.actions.push(async () => {
            await source.getLocator().dragTo(target.getLocator());
        });
        return this;
    }
    pause(ms) {
        this.actions.push(async () => {
            await new Promise(r => setTimeout(r, ms));
        });
        return this;
    }
    async perform() {
        for (const action of this.actions) {
            await action();
        }
        this.actions = [];
    }
    clear() {
        this.actions = [];
        return this;
    }
}
exports.Actions = Actions;
// ═══════════════════════════════════════════════════════════════════════════════
// TARGET LOCATOR (for switching)
// ═══════════════════════════════════════════════════════════════════════════════
class TargetLocator {
    driver;
    constructor(driver) {
        this.driver = driver;
    }
    async frame(idOrElement) {
        const page = this.driver.getPage();
        if (typeof idOrElement === 'number') {
            const frames = page.frames();
            if (frames[idOrElement]) {
                // Playwright doesn't switch frames the same way
                // Store the frame reference
            }
        }
        else if (typeof idOrElement === 'string') {
            await page.frameLocator(`[name="${idOrElement}"], #${idOrElement}`);
        }
        else {
            // WebElement - get frame from element
        }
        return this.driver;
    }
    async defaultContent() {
        // Reset to main frame
        return this.driver;
    }
    async parentFrame() {
        return this.driver;
    }
    async window(handle) {
        const context = this.driver.getContext();
        const pages = context.pages();
        const targetPage = pages.find(p => p.url() === handle || p.url().includes(handle));
        if (targetPage) {
            this.driver.page = targetPage;
        }
        return this.driver;
    }
    async newWindow(type = 'tab') {
        const context = this.driver.getContext();
        const newPage = await context.newPage();
        this.driver.page = newPage;
        return this.driver;
    }
    async alert() {
        // This is a simplified implementation
        // Real alert handling requires dialog event listeners
        throw new Error('Use page.on("dialog") for handling alerts in Playwright');
    }
    async activeElement() {
        const page = this.driver.getPage();
        const activeSelector = ':focus';
        return new WebElement(page.locator(activeSelector), this.driver);
    }
}
exports.TargetLocator = TargetLocator;
// ═══════════════════════════════════════════════════════════════════════════════
// OPTIONS (Cookies, Timeouts, Window)
// ═══════════════════════════════════════════════════════════════════════════════
class Options {
    driver;
    constructor(driver) {
        this.driver = driver;
    }
    async addCookie(cookie) {
        const context = this.driver.getContext();
        await context.addCookies([{
                name: cookie.name,
                value: cookie.value,
                path: cookie.path || '/',
                domain: cookie.domain,
                secure: cookie.secure,
                httpOnly: cookie.httpOnly,
                expires: cookie.expiry,
                sameSite: cookie.sameSite
            }]);
    }
    async getCookie(name) {
        const context = this.driver.getContext();
        const cookies = await context.cookies();
        return cookies.find(c => c.name === name) || null;
    }
    async getCookies() {
        const context = this.driver.getContext();
        return context.cookies();
    }
    async deleteAllCookies() {
        const context = this.driver.getContext();
        await context.clearCookies();
    }
    async deleteCookie(name) {
        // Playwright doesn't have deleteCookie, clear and re-add
        const context = this.driver.getContext();
        const cookies = await context.cookies();
        await context.clearCookies();
        await context.addCookies(cookies.filter(c => c.name !== name));
    }
    timeouts() {
        return new Timeouts(this.driver);
    }
    window() {
        return new WindowOptions(this.driver);
    }
}
exports.Options = Options;
class Timeouts {
    driver;
    constructor(driver) {
        this.driver = driver;
    }
    async implicitlyWait(ms) {
        this.driver.getContext().setDefaultTimeout(ms);
    }
    async setScriptTimeout(ms) {
        // Playwright doesn't have separate script timeout
    }
    async pageLoadTimeout(ms) {
        this.driver.getContext().setDefaultNavigationTimeout(ms);
    }
}
exports.Timeouts = Timeouts;
class WindowOptions {
    driver;
    constructor(driver) {
        this.driver = driver;
    }
    async getRect() {
        const viewport = this.driver.getPage().viewportSize();
        return {
            x: 0,
            y: 0,
            width: viewport?.width || 1280,
            height: viewport?.height || 720
        };
    }
    async setRect(rect) {
        if (rect.width && rect.height) {
            await this.driver.getPage().setViewportSize({
                width: rect.width,
                height: rect.height
            });
        }
    }
    async maximize() {
        await this.driver.getPage().setViewportSize({ width: 1920, height: 1080 });
    }
    async minimize() {
        // Not directly supported in Playwright
    }
    async fullscreen() {
        await this.driver.getPage().setViewportSize({ width: 1920, height: 1080 });
    }
}
exports.WindowOptions = WindowOptions;
// ═══════════════════════════════════════════════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════════════════════════════════════════════
class Navigation {
    driver;
    constructor(driver) {
        this.driver = driver;
    }
    async to(url) {
        await this.driver.getPage().goto(url);
    }
    async back() {
        await this.driver.getPage().goBack();
    }
    async forward() {
        await this.driver.getPage().goForward();
    }
    async refresh() {
        await this.driver.getPage().reload();
    }
}
exports.Navigation = Navigation;
class WebDriver extends events_1.EventEmitter {
    browser = null;
    context = null;
    page = null;
    options;
    constructor(options = {}) {
        super();
        this.options = {
            browser: 'chromium',
            headless: false,
            timeout: 30000,
            ...options
        };
    }
    /**
     * Build and launch driver
     */
    async build() {
        const browserType = this.getBrowserType();
        this.browser = await browserType.launch({
            headless: this.options.headless,
            args: this.options.args
        });
        const contextOptions = {};
        if (this.options.proxy) {
            contextOptions.proxy = this.options.proxy;
        }
        if (this.options.userAgent) {
            contextOptions.userAgent = this.options.userAgent;
        }
        if (this.options.viewport) {
            contextOptions.viewport = this.options.viewport;
        }
        this.context = await this.browser.newContext(contextOptions);
        this.context.setDefaultTimeout(this.options.timeout || 30000);
        this.page = await this.context.newPage();
        return this;
    }
    getBrowserType() {
        switch (this.options.browser) {
            case 'firefox':
                return playwright_1.firefox;
            case 'safari':
            case 'webkit':
                return playwright_1.webkit;
            default:
                return playwright_1.chromium;
        }
    }
    /**
     * Navigate to URL
     */
    async get(url) {
        await this.page.goto(url, { waitUntil: 'domcontentloaded' });
    }
    /**
     * Get current URL
     */
    async getCurrentUrl() {
        return this.page.url();
    }
    /**
     * Get page title
     */
    async getTitle() {
        return this.page.title();
    }
    /**
     * Get page source
     */
    async getPageSource() {
        return this.page.content();
    }
    /**
     * Find element
     */
    async findElement(by) {
        const selector = by.toPlaywright();
        const locator = this.page.locator(selector).first();
        await locator.waitFor({ state: 'visible', timeout: this.options.timeout });
        return new WebElement(locator, this);
    }
    /**
     * Find elements
     */
    async findElements(by) {
        const selector = by.toPlaywright();
        const locators = this.page.locator(selector);
        const count = await locators.count();
        const elements = [];
        for (let i = 0; i < count; i++) {
            elements.push(new WebElement(locators.nth(i), this));
        }
        return elements;
    }
    /**
     * Execute JavaScript
     */
    async executeScript(script, ...args) {
        return this.page.evaluate(script, ...args);
    }
    /**
     * Execute async JavaScript
     */
    async executeAsyncScript(script, ...args) {
        return this.page.evaluate(script, ...args);
    }
    /**
     * Take screenshot
     */
    async takeScreenshot() {
        return this.page.screenshot();
    }
    /**
     * Wait for condition
     */
    async wait(condition, timeout = 10000, message) {
        const startTime = Date.now();
        let lastError = null;
        while (Date.now() - startTime < timeout) {
            try {
                const result = await condition(this);
                return result;
            }
            catch (error) {
                lastError = error;
                await new Promise(r => setTimeout(r, 100));
            }
        }
        throw new Error(message || lastError?.message || 'Wait timeout');
    }
    /**
     * Sleep
     */
    async sleep(ms) {
        await new Promise(r => setTimeout(r, ms));
    }
    /**
     * Get window handle
     */
    async getWindowHandle() {
        return this.page.url();
    }
    /**
     * Get all window handles
     */
    async getAllWindowHandles() {
        return this.context.pages().map(p => p.url());
    }
    /**
     * Close current window
     */
    async close() {
        await this.page.close();
        const pages = this.context.pages();
        if (pages.length > 0) {
            this.page = pages[0];
        }
    }
    /**
     * Quit driver
     */
    async quit() {
        if (this.context) {
            await this.context.close();
        }
        if (this.browser) {
            await this.browser.close();
        }
        this.page = null;
        this.context = null;
        this.browser = null;
    }
    /**
     * Get actions builder
     */
    actions() {
        return new Actions(this);
    }
    /**
     * Get target locator (for switching)
     */
    switchTo() {
        return new TargetLocator(this);
    }
    /**
     * Get options (cookies, timeouts)
     */
    manage() {
        return new Options(this);
    }
    /**
     * Get navigation
     */
    navigate() {
        return new Navigation(this);
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // RAW ACCESS
    // ═══════════════════════════════════════════════════════════════════════════
    getPage() {
        if (!this.page)
            throw new Error('Driver not initialized');
        return this.page;
    }
    getContext() {
        if (!this.context)
            throw new Error('Driver not initialized');
        return this.context;
    }
    getBrowser() {
        if (!this.browser)
            throw new Error('Driver not initialized');
        return this.browser;
    }
}
exports.WebDriver = WebDriver;
// ═══════════════════════════════════════════════════════════════════════════════
// BUILDER CLASS
// ═══════════════════════════════════════════════════════════════════════════════
class Builder {
    options = {};
    forBrowser(browser) {
        this.options.browser = browser;
        return this;
    }
    setProxy(proxy) {
        this.options.proxy = proxy;
        return this;
    }
    headless(value = true) {
        this.options.headless = value;
        return this;
    }
    setChromeOptions(options) {
        if (options.args) {
            this.options.args = options.args;
        }
        if (options.headless) {
            this.options.headless = true;
        }
        return this;
    }
    setFirefoxOptions(options) {
        if (options.args) {
            this.options.args = options.args;
        }
        return this;
    }
    withCapabilities(caps) {
        if (caps.browserName) {
            this.options.browser = caps.browserName;
        }
        return this;
    }
    usingServer(url) {
        // For Selenium Grid compatibility - not directly supported
        return this;
    }
    async build() {
        const driver = new WebDriver(this.options);
        return driver.build();
    }
}
exports.Builder = Builder;
// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════
exports.default = {
    Builder,
    By,
    Key: exports.Key,
    until: exports.until,
    WebDriver,
    WebElement,
    Actions,
    Alert
};
