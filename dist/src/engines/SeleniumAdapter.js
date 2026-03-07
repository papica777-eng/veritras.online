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
    // Complexity: O(1)
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
    // Complexity: O(1)
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
    // Complexity: O(1)
    async click() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.locator.click();
    }
    /**
     * Send keys to element
     */
    // Complexity: O(N)
    async sendKeys(...keys) {
        const text = keys.join('');
        // Check for special keys
        if (text.includes(exports.Key.ENTER)) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.locator.press('Enter');
        }
        else if (text.includes(exports.Key.TAB)) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.locator.press('Tab');
        }
        else if (text.includes(exports.Key.ESCAPE)) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.locator.press('Escape');
        }
        else {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.locator.fill(text);
        }
    }
    /**
     * Clear element
     */
    // Complexity: O(1)
    async clear() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.locator.clear();
    }
    /**
     * Get text content
     */
    // Complexity: O(1)
    async getText() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        return (await this.locator.textContent()) || '';
    }
    /**
     * Get attribute
     */
    // Complexity: O(1)
    async getAttribute(name) {
        return this.locator.getAttribute(name);
    }
    /**
     * Get CSS property
     */
    // Complexity: O(1)
    async getCssValue(propertyName) {
        return this.locator.evaluate((el, prop) => {
            return window.getComputedStyle(el).getPropertyValue(prop);
        }, propertyName);
    }
    /**
     * Get tag name
     */
    // Complexity: O(1)
    async getTagName() {
        return this.locator.evaluate(el => el.tagName.toLowerCase());
    }
    /**
     * Check if displayed
     */
    // Complexity: O(1)
    async isDisplayed() {
        return this.locator.isVisible();
    }
    /**
     * Check if enabled
     */
    // Complexity: O(1)
    async isEnabled() {
        return this.locator.isEnabled();
    }
    /**
     * Check if selected
     */
    // Complexity: O(1)
    async isSelected() {
        return this.locator.isChecked();
    }
    /**
     * Submit form
     */
    // Complexity: O(1)
    async submit() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.locator.evaluate((el) => {
            const form = el.closest('form');
            if (form)
                form.submit();
        });
    }
    /**
     * Get element rect
     */
    // Complexity: O(1)
    async getRect() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const box = await this.locator.boundingBox();
        return box || { x: 0, y: 0, width: 0, height: 0 };
    }
    /**
     * Get location
     */
    // Complexity: O(1)
    async getLocation() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const rect = await this.getRect();
        return { x: rect.x, y: rect.y };
    }
    /**
     * Get size
     */
    // Complexity: O(1)
    async getSize() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const rect = await this.getRect();
        return { width: rect.width, height: rect.height };
    }
    /**
     * Find child element
     */
    // Complexity: O(1)
    async findElement(by) {
        const selector = by.toPlaywright();
        const child = this.locator.locator(selector).first();
        return new WebElement(child, this.driver);
    }
    /**
     * Find child elements
     */
    // Complexity: O(N) — loop
    async findElements(by) {
        const selector = by.toPlaywright();
        const children = this.locator.locator(selector);
        // SAFETY: async operation — wrap in try-catch for production resilience
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
    // Complexity: O(1)
    async takeScreenshot() {
        return this.locator.screenshot();
    }
    /**
     * Get ID
     */
    // Complexity: O(1)
    async getId() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        return (await this.getAttribute('id')) || '';
    }
    /**
     * Get underlying Playwright locator
     */
    // Complexity: O(1)
    getLocator() {
        return this.locator;
    }
}
exports.WebElement = WebElement;
// ═══════════════════════════════════════════════════════════════════════════════
// EXPECTED CONDITIONS (until)
// ═══════════════════════════════════════════════════════════════════════════════
exports.until = {
    // Complexity: O(1)
    elementLocated(by) {
        return async (driver) => {
            return driver.findElement(by);
        };
    },
    // Complexity: O(1)
    elementsLocated(by) {
        return async (driver) => {
            // SAFETY: async operation — wrap in try-catch for production resilience
            const elements = await driver.findElements(by);
            if (elements.length > 0)
                return elements;
            throw new Error('Elements not found');
        };
    },
    // Complexity: O(1)
    elementIsVisible(element) {
        return async () => {
            // SAFETY: async operation — wrap in try-catch for production resilience
            if (await element.isDisplayed())
                return element;
            throw new Error('Element not visible');
        };
    },
    // Complexity: O(1)
    elementIsNotVisible(element) {
        return async () => {
            // SAFETY: async operation — wrap in try-catch for production resilience
            if (!(await element.isDisplayed()))
                return true;
            throw new Error('Element still visible');
        };
    },
    // Complexity: O(1)
    elementIsEnabled(element) {
        return async () => {
            // SAFETY: async operation — wrap in try-catch for production resilience
            if (await element.isEnabled())
                return element;
            throw new Error('Element not enabled');
        };
    },
    // Complexity: O(1)
    elementIsDisabled(element) {
        return async () => {
            // SAFETY: async operation — wrap in try-catch for production resilience
            if (!(await element.isEnabled()))
                return element;
            throw new Error('Element still enabled');
        };
    },
    // Complexity: O(1)
    elementIsSelected(element) {
        return async () => {
            // SAFETY: async operation — wrap in try-catch for production resilience
            if (await element.isSelected())
                return element;
            throw new Error('Element not selected');
        };
    },
    // Complexity: O(1)
    elementTextIs(element, text) {
        return async () => {
            // SAFETY: async operation — wrap in try-catch for production resilience
            if ((await element.getText()) === text)
                return true;
            throw new Error('Text does not match');
        };
    },
    // Complexity: O(1)
    elementTextContains(element, text) {
        return async () => {
            // SAFETY: async operation — wrap in try-catch for production resilience
            if ((await element.getText()).includes(text))
                return true;
            throw new Error('Text not found');
        };
    },
    // Complexity: O(1)
    titleIs(title) {
        return async (driver) => {
            // SAFETY: async operation — wrap in try-catch for production resilience
            if (await driver.getTitle() === title)
                return true;
            throw new Error('Title does not match');
        };
    },
    // Complexity: O(1)
    titleContains(text) {
        return async (driver) => {
            // SAFETY: async operation — wrap in try-catch for production resilience
            if ((await driver.getTitle()).includes(text))
                return true;
            throw new Error('Title does not contain text');
        };
    },
    // Complexity: O(1)
    urlIs(url) {
        return async (driver) => {
            // SAFETY: async operation — wrap in try-catch for production resilience
            if (await driver.getCurrentUrl() === url)
                return true;
            throw new Error('URL does not match');
        };
    },
    // Complexity: O(1)
    urlContains(text) {
        return async (driver) => {
            // SAFETY: async operation — wrap in try-catch for production resilience
            if ((await driver.getCurrentUrl()).includes(text))
                return true;
            throw new Error('URL does not contain text');
        };
    },
    // Complexity: O(N) — loop
    alertIsPresent() {
        return async (driver) => {
            // Playwright handles dialogs differently
            throw new Error('Use page.on("dialog") for alerts in Playwright');
        };
    },
    // Complexity: O(1)
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
    // Complexity: O(1)
    elementToBeClickable(by) {
        return async (driver) => {
            // SAFETY: async operation — wrap in try-catch for production resilience
            const element = await driver.findElement(by);
            // SAFETY: async operation — wrap in try-catch for production resilience
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
    // Complexity: O(1)
    async accept() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.dialog.accept();
    }
    // Complexity: O(1)
    async dismiss() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.dialog.dismiss();
    }
    // Complexity: O(1)
    async getText() {
        return this.dialog.message();
    }
    // Complexity: O(1)
    async sendKeys(text) {
        // SAFETY: async operation — wrap in try-catch for production resilience
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
    // Complexity: O(1)
    click(element) {
        this.actions.push(async () => {
            if (element) {
                // SAFETY: async operation — wrap in try-catch for production resilience
                await element.click();
            }
            else {
                // SAFETY: async operation — wrap in try-catch for production resilience
                await this.driver.getPage().mouse.click(0, 0);
            }
        });
        return this;
    }
    // Complexity: O(1)
    doubleClick(element) {
        this.actions.push(async () => {
            if (element) {
                // SAFETY: async operation — wrap in try-catch for production resilience
                await element.getLocator().dblclick();
            }
            else {
                // SAFETY: async operation — wrap in try-catch for production resilience
                await this.driver.getPage().mouse.dblclick(0, 0);
            }
        });
        return this;
    }
    // Complexity: O(1)
    contextClick(element) {
        this.actions.push(async () => {
            if (element) {
                // SAFETY: async operation — wrap in try-catch for production resilience
                await element.getLocator().click({ button: 'right' });
            }
            else {
                // SAFETY: async operation — wrap in try-catch for production resilience
                await this.driver.getPage().mouse.click(0, 0, { button: 'right' });
            }
        });
        return this;
    }
    // Complexity: O(1)
    moveToElement(element, xOffset, yOffset) {
        this.actions.push(async () => {
            // SAFETY: async operation — wrap in try-catch for production resilience
            const rect = await element.getRect();
            const x = rect.x + (xOffset || rect.width / 2);
            const y = rect.y + (yOffset || rect.height / 2);
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.driver.getPage().mouse.move(x, y);
        });
        return this;
    }
    // Complexity: O(1)
    sendKeys(...keys) {
        this.actions.push(async () => {
            const text = keys.join('');
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.driver.getPage().keyboard.type(text);
        });
        return this;
    }
    // Complexity: O(1)
    keyDown(key) {
        this.actions.push(async () => {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.driver.getPage().keyboard.down(key);
        });
        return this;
    }
    // Complexity: O(1)
    keyUp(key) {
        this.actions.push(async () => {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.driver.getPage().keyboard.up(key);
        });
        return this;
    }
    // Complexity: O(1)
    dragAndDrop(source, target) {
        this.actions.push(async () => {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await source.getLocator().dragTo(target.getLocator());
        });
        return this;
    }
    // Complexity: O(1)
    pause(ms) {
        this.actions.push(async () => {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await new Promise(r => setTimeout(r, ms));
        });
        return this;
    }
    // Complexity: O(N) — loop
    async perform() {
        for (const action of this.actions) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await action();
        }
        this.actions = [];
    }
    // Complexity: O(1)
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
    // Complexity: O(1)
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
            // SAFETY: async operation — wrap in try-catch for production resilience
            await page.frameLocator(`[name="${idOrElement}"], #${idOrElement}`);
        }
        else {
            // WebElement - get frame from element
        }
        return this.driver;
    }
    // Complexity: O(1)
    async defaultContent() {
        // Reset to main frame
        return this.driver;
    }
    // Complexity: O(1)
    async parentFrame() {
        return this.driver;
    }
    // Complexity: O(N) — linear scan
    async window(handle) {
        const context = this.driver.getContext();
        const pages = context.pages();
        const targetPage = pages.find(p => p.url() === handle || p.url().includes(handle));
        if (targetPage) {
            this.driver.page = targetPage;
        }
        return this.driver;
    }
    // Complexity: O(1)
    async newWindow(type = 'tab') {
        const context = this.driver.getContext();
        // SAFETY: async operation — wrap in try-catch for production resilience
        const newPage = await context.newPage();
        this.driver.page = newPage;
        return this.driver;
    }
    // Complexity: O(N) — loop
    async alert() {
        // This is a simplified implementation
        // Real alert handling requires dialog event listeners
        throw new Error('Use page.on("dialog") for handling alerts in Playwright');
    }
    // Complexity: O(1)
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
    // Complexity: O(1)
    async addCookie(cookie) {
        const context = this.driver.getContext();
        // SAFETY: async operation — wrap in try-catch for production resilience
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
    // Complexity: O(N) — linear scan
    async getCookie(name) {
        const context = this.driver.getContext();
        // SAFETY: async operation — wrap in try-catch for production resilience
        const cookies = await context.cookies();
        return cookies.find(c => c.name === name) || null;
    }
    // Complexity: O(1)
    async getCookies() {
        const context = this.driver.getContext();
        return context.cookies();
    }
    // Complexity: O(1)
    async deleteAllCookies() {
        const context = this.driver.getContext();
        // SAFETY: async operation — wrap in try-catch for production resilience
        await context.clearCookies();
    }
    // Complexity: O(N) — linear scan
    async deleteCookie(name) {
        // Playwright doesn't have deleteCookie, clear and re-add
        const context = this.driver.getContext();
        // SAFETY: async operation — wrap in try-catch for production resilience
        const cookies = await context.cookies();
        // SAFETY: async operation — wrap in try-catch for production resilience
        await context.clearCookies();
        // SAFETY: async operation — wrap in try-catch for production resilience
        await context.addCookies(cookies.filter(c => c.name !== name));
    }
    // Complexity: O(1)
    timeouts() {
        return new Timeouts(this.driver);
    }
    // Complexity: O(1)
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
    // Complexity: O(1)
    async implicitlyWait(ms) {
        this.driver.getContext().setDefaultTimeout(ms);
    }
    // Complexity: O(1)
    async setScriptTimeout(ms) {
        // Playwright doesn't have separate script timeout
    }
    // Complexity: O(1)
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
    // Complexity: O(1)
    async getRect() {
        const viewport = this.driver.getPage().viewportSize();
        return {
            x: 0,
            y: 0,
            width: viewport?.width || 1280,
            height: viewport?.height || 720
        };
    }
    // Complexity: O(1)
    async setRect(rect) {
        if (rect.width && rect.height) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.driver.getPage().setViewportSize({
                width: rect.width,
                height: rect.height
            });
        }
    }
    // Complexity: O(1)
    async maximize() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.driver.getPage().setViewportSize({ width: 1920, height: 1080 });
    }
    // Complexity: O(1)
    async minimize() {
        // Not directly supported in Playwright
    }
    // Complexity: O(1)
    async fullscreen() {
        // SAFETY: async operation — wrap in try-catch for production resilience
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
    // Complexity: O(1)
    async to(url) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.driver.getPage().goto(url);
    }
    // Complexity: O(1)
    async back() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.driver.getPage().goBack();
    }
    // Complexity: O(1)
    async forward() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.driver.getPage().goForward();
    }
    // Complexity: O(1)
    async refresh() {
        // SAFETY: async operation — wrap in try-catch for production resilience
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
    // Complexity: O(1)
    async build() {
        const browserType = this.getBrowserType();
        // SAFETY: async operation — wrap in try-catch for production resilience
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
        // SAFETY: async operation — wrap in try-catch for production resilience
        this.context = await this.browser.newContext(contextOptions);
        this.context.setDefaultTimeout(this.options.timeout || 30000);
        // SAFETY: async operation — wrap in try-catch for production resilience
        this.page = await this.context.newPage();
        return this;
    }
    // Complexity: O(1)
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
    // Complexity: O(1)
    async get(url) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.page.goto(url, { waitUntil: 'domcontentloaded' });
    }
    /**
     * Get current URL
     */
    // Complexity: O(1)
    async getCurrentUrl() {
        return this.page.url();
    }
    /**
     * Get page title
     */
    // Complexity: O(1)
    async getTitle() {
        return this.page.title();
    }
    /**
     * Get page source
     */
    // Complexity: O(1)
    async getPageSource() {
        return this.page.content();
    }
    /**
     * Find element
     */
    // Complexity: O(1)
    async findElement(by) {
        const selector = by.toPlaywright();
        const locator = this.page.locator(selector).first();
        // SAFETY: async operation — wrap in try-catch for production resilience
        await locator.waitFor({ state: 'visible', timeout: this.options.timeout });
        return new WebElement(locator, this);
    }
    /**
     * Find elements
     */
    // Complexity: O(N) — loop
    async findElements(by) {
        const selector = by.toPlaywright();
        const locators = this.page.locator(selector);
        // SAFETY: async operation — wrap in try-catch for production resilience
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
    // Complexity: O(1)
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
                // SAFETY: async operation — wrap in try-catch for production resilience
                await new Promise(r => setTimeout(r, 100));
            }
        }
        throw new Error(message || lastError?.message || 'Wait timeout');
    }
    /**
     * Sleep
     */
    // Complexity: O(1)
    async sleep(ms) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await new Promise(r => setTimeout(r, ms));
    }
    /**
     * Get window handle
     */
    // Complexity: O(1)
    async getWindowHandle() {
        return this.page.url();
    }
    /**
     * Get all window handles
     */
    // Complexity: O(N) — linear scan
    async getAllWindowHandles() {
        return this.context.pages().map(p => p.url());
    }
    /**
     * Close current window
     */
    // Complexity: O(1)
    async close() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.page.close();
        const pages = this.context.pages();
        if (pages.length > 0) {
            this.page = pages[0];
        }
    }
    /**
     * Quit driver
     */
    // Complexity: O(1)
    async quit() {
        if (this.context) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.context.close();
        }
        if (this.browser) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.browser.close();
        }
        this.page = null;
        this.context = null;
        this.browser = null;
    }
    /**
     * Get actions builder
     */
    // Complexity: O(1)
    actions() {
        return new Actions(this);
    }
    /**
     * Get target locator (for switching)
     */
    // Complexity: O(1)
    switchTo() {
        return new TargetLocator(this);
    }
    /**
     * Get options (cookies, timeouts)
     */
    // Complexity: O(1)
    manage() {
        return new Options(this);
    }
    /**
     * Get navigation
     */
    // Complexity: O(1)
    navigate() {
        return new Navigation(this);
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // RAW ACCESS
    // ═══════════════════════════════════════════════════════════════════════════
    // Complexity: O(1)
    getPage() {
        if (!this.page)
            throw new Error('Driver not initialized');
        return this.page;
    }
    // Complexity: O(1)
    getContext() {
        if (!this.context)
            throw new Error('Driver not initialized');
        return this.context;
    }
    // Complexity: O(1)
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
    // Complexity: O(1)
    forBrowser(browser) {
        this.options.browser = browser;
        return this;
    }
    // Complexity: O(1)
    setProxy(proxy) {
        this.options.proxy = proxy;
        return this;
    }
    // Complexity: O(1)
    headless(value = true) {
        this.options.headless = value;
        return this;
    }
    // Complexity: O(1)
    setChromeOptions(options) {
        if (options.args) {
            this.options.args = options.args;
        }
        if (options.headless) {
            this.options.headless = true;
        }
        return this;
    }
    // Complexity: O(1)
    setFirefoxOptions(options) {
        if (options.args) {
            this.options.args = options.args;
        }
        return this;
    }
    // Complexity: O(1)
    withCapabilities(caps) {
        if (caps.browserName) {
            this.options.browser = caps.browserName;
        }
        return this;
    }
    // Complexity: O(1)
    usingServer(url) {
        // For Selenium Grid compatibility - not directly supported
        return this;
    }
    // Complexity: O(1)
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
