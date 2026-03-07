"use strict";
/**
 * 🧠 QANTUM HYBRID - Fluent Chain
 * Cypress-style method chaining: mm.click().type().should()
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FluentChain = void 0;
const logger_1 = require("../api/unified/utils/logger");
class FluentChain {
    page;
    currentLocator;
    currentSelector;
    selfHealer;
    deepSearch;
    timeout;
    constructor(page, selfHealer, deepSearch, timeout = 30000) {
        this.page = page;
        this.selfHealer = selfHealer;
        this.deepSearch = deepSearch;
        this.timeout = timeout;
    }
    /**
     * Избери елемент
     */
    // Complexity: O(1)
    get(selector) {
        this.currentSelector = selector;
        this.currentLocator = this.page.locator(selector);
        return this;
    }
    /**
     * Намери с Deep Search (Shadow DOM, Iframes)
     */
    // Complexity: O(N) — linear iteration
    async find(selector) {
        this.currentSelector = selector;
        // SAFETY: async operation — wrap in try-catch for production resilience
        const result = await this.deepSearch.find(this.page, selector);
        if (result.found && result.locator) {
            this.currentLocator = result.locator;
        }
        else {
            // Self-healing опит
            // SAFETY: async operation — wrap in try-catch for production resilience
            const healed = await this.selfHealer.heal(this.page, selector);
            if (healed.healed && healed.newSelector) {
                this.currentLocator = this.page.locator(healed.newSelector);
                logger_1.logger.debug(`🩹 Self-healed: "${selector}" → "${healed.newSelector}"`);
            }
            else {
                this.currentLocator = this.page.locator(selector);
            }
        }
        return this;
    }
    /**
     * Кликни
     */
    // Complexity: O(N) — potential recursive descent
    async click() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.ensureLocator();
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.currentLocator.click({ timeout: this.timeout });
        return this;
    }
    /**
     * Double click
     */
    // Complexity: O(N) — potential recursive descent
    async dblclick() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.ensureLocator();
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.currentLocator.dblclick({ timeout: this.timeout });
        return this;
    }
    /**
     * Right click
     */
    // Complexity: O(N) — potential recursive descent
    async rightclick() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.ensureLocator();
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.currentLocator.click({ button: 'right', timeout: this.timeout });
        return this;
    }
    /**
     * Въведи текст
     */
    // Complexity: O(N) — potential recursive descent
    async type(text, options) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.ensureLocator();
        if (options?.clear) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.currentLocator.clear();
        }
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.currentLocator.fill(text);
        return this;
    }
    /**
     * Натисни клавиш
     */
    // Complexity: O(N) — potential recursive descent
    async press(key) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.ensureLocator();
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.currentLocator.press(key);
        return this;
    }
    /**
     * Hover
     */
    // Complexity: O(N) — potential recursive descent
    async hover() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.ensureLocator();
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.currentLocator.hover({ timeout: this.timeout });
        return this;
    }
    /**
     * Focus
     */
    // Complexity: O(N) — potential recursive descent
    async focus() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.ensureLocator();
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.currentLocator.focus();
        return this;
    }
    /**
     * Scroll into view
     */
    // Complexity: O(N) — potential recursive descent
    async scrollIntoView() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.ensureLocator();
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.currentLocator.scrollIntoViewIfNeeded();
        return this;
    }
    /**
     * Избери от dropdown
     */
    // Complexity: O(N) — potential recursive descent
    async select(value) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.ensureLocator();
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.currentLocator.selectOption(value);
        return this;
    }
    /**
     * Check checkbox/radio
     */
    // Complexity: O(N) — potential recursive descent
    async check() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.ensureLocator();
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.currentLocator.check();
        return this;
    }
    /**
     * Uncheck
     */
    // Complexity: O(N) — potential recursive descent
    async uncheck() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.ensureLocator();
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.currentLocator.uncheck();
        return this;
    }
    /**
     * Upload file
     */
    // Complexity: O(N) — potential recursive descent
    async upload(filePath) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.ensureLocator();
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.currentLocator.setInputFiles(filePath);
        return this;
    }
    /**
     * Изчакай елемент
     */
    // Complexity: O(N) — potential recursive descent
    async wait(timeout) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.ensureLocator();
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.currentLocator.waitFor({
            state: 'visible',
            timeout: timeout || this.timeout
        });
        return this;
    }
    /**
     * Cypress-style should() assertions
     */
    // Complexity: O(1) — hash/map lookup
    async should(assertion, expected) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.ensureLocator();
        const locator = this.currentLocator;
        switch (assertion) {
            case 'be.visible':
                // SAFETY: async operation — wrap in try-catch for production resilience
                await (0, test_1.expect)(locator).toBeVisible({ timeout: this.timeout });
                break;
            case 'be.hidden':
            case 'not.be.visible':
                // SAFETY: async operation — wrap in try-catch for production resilience
                await (0, test_1.expect)(locator).toBeHidden({ timeout: this.timeout });
                break;
            case 'exist':
                // SAFETY: async operation — wrap in try-catch for production resilience
                await (0, test_1.expect)(locator).toHaveCount(1, { timeout: this.timeout });
                break;
            case 'not.exist':
                // SAFETY: async operation — wrap in try-catch for production resilience
                await (0, test_1.expect)(locator).toHaveCount(0, { timeout: this.timeout });
                break;
            case 'be.enabled':
                // SAFETY: async operation — wrap in try-catch for production resilience
                await (0, test_1.expect)(locator).toBeEnabled({ timeout: this.timeout });
                break;
            case 'be.disabled':
                // SAFETY: async operation — wrap in try-catch for production resilience
                await (0, test_1.expect)(locator).toBeDisabled({ timeout: this.timeout });
                break;
            case 'be.checked':
                // SAFETY: async operation — wrap in try-catch for production resilience
                await (0, test_1.expect)(locator).toBeChecked({ timeout: this.timeout });
                break;
            case 'have.text':
                // SAFETY: async operation — wrap in try-catch for production resilience
                await (0, test_1.expect)(locator).toHaveText(expected, { timeout: this.timeout });
                break;
            case 'contain.text':
            case 'contain':
                // SAFETY: async operation — wrap in try-catch for production resilience
                await (0, test_1.expect)(locator).toContainText(expected, { timeout: this.timeout });
                break;
            case 'have.value':
                // SAFETY: async operation — wrap in try-catch for production resilience
                await (0, test_1.expect)(locator).toHaveValue(expected, { timeout: this.timeout });
                break;
            case 'have.attr':
                if (Array.isArray(expected)) {
                    // SAFETY: async operation — wrap in try-catch for production resilience
                    await (0, test_1.expect)(locator).toHaveAttribute(expected[0], expected[1], { timeout: this.timeout });
                }
                break;
            case 'have.class':
                // SAFETY: async operation — wrap in try-catch for production resilience
                await (0, test_1.expect)(locator).toHaveClass(new RegExp(expected), { timeout: this.timeout });
                break;
            case 'have.count':
                // SAFETY: async operation — wrap in try-catch for production resilience
                await (0, test_1.expect)(locator).toHaveCount(expected, { timeout: this.timeout });
                break;
            default:
                throw new Error(`Unknown assertion: ${assertion}`);
        }
        return this;
    }
    /**
     * Вземи текст
     */
    // Complexity: O(N) — potential recursive descent
    async getText() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.ensureLocator();
        // SAFETY: async operation — wrap in try-catch for production resilience
        return await this.currentLocator.textContent() || '';
    }
    /**
     * Вземи атрибут
     */
    // Complexity: O(N) — potential recursive descent
    async getAttribute(name) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.ensureLocator();
        // SAFETY: async operation — wrap in try-catch for production resilience
        return await this.currentLocator.getAttribute(name);
    }
    /**
     * Вземи стойност
     */
    // Complexity: O(N) — potential recursive descent
    async getValue() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.ensureLocator();
        // SAFETY: async operation — wrap in try-catch for production resilience
        return await this.currentLocator.inputValue();
    }
    /**
     * Провери дали е видим
     */
    // Complexity: O(N) — potential recursive descent
    async isVisible() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.ensureLocator();
        // SAFETY: async operation — wrap in try-catch for production resilience
        return await this.currentLocator.isVisible();
    }
    /**
     * Вземи Playwright locator директно
     */
    // Complexity: O(1)
    getLocator() {
        return this.currentLocator;
    }
    /**
     * Осигури че имаме локатор
     */
    // Complexity: O(N) — linear iteration
    async ensureLocator() {
        if (!this.currentLocator) {
            throw new Error('No element selected. Use .get() or .find() first.');
        }
        // Опитай self-healing ако елементът не съществува
        // SAFETY: async operation — wrap in try-catch for production resilience
        const count = await this.currentLocator.count();
        if (count === 0 && this.currentSelector) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            const healed = await this.selfHealer.heal(this.page, this.currentSelector);
            if (healed.healed && healed.newSelector) {
                this.currentLocator = this.page.locator(healed.newSelector);
                logger_1.logger.debug(`🩹 Auto-healed: "${this.currentSelector}" → "${healed.newSelector}"`);
            }
        }
    }
}
exports.FluentChain = FluentChain;
// Import Playwright expect
const test_1 = require("@playwright/test");
