"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🧠 QANTUM HYBRID v1.0.0 - BaseElement
 * Enterprise-grade element with self-healing capabilities
 * Ported from: training-framework/architecture/pom-base.js
 * ═══════════════════════════════════════════════════════════════════════════════
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseElement = void 0;
const events_1 = require("events");
const logger_1 = require("../api/unified/utils/logger");
// ═══════════════════════════════════════════════════════════════════════════════
// BASE ELEMENT CLASS
// ═══════════════════════════════════════════════════════════════════════════════
class BaseElement extends events_1.EventEmitter {
    locator;
    options;
    alternativeLocators;
    metadata;
    state;
    page;
    cachedLocator;
    constructor(locator, options = {}) {
        super();
        this.locator = locator;
        this.options = {
            timeout: options.timeout ?? 30000,
            retries: options.retries ?? 3,
            waitBetweenRetries: options.waitBetweenRetries ?? 500,
            selfHealing: options.selfHealing ?? true,
            cacheEnabled: options.cacheEnabled ?? true,
            name: options.name ?? 'unnamed',
            type: options.type ?? 'generic',
            description: options.description ?? '',
        };
        this.alternativeLocators = [];
        this.metadata = {
            name: this.options.name,
            type: this.options.type,
            description: this.options.description,
            createdAt: Date.now(),
        };
        this.state = {
            lastInteraction: null,
            interactionCount: 0,
            errors: [],
            healingHistory: [],
        };
    }
    /**
     * Set page context
     */
    // Complexity: O(1)
    setPage(page) {
        this.page = page;
        this.cachedLocator = undefined;
        return this;
    }
    /**
     * Add alternative locator for self-healing
     */
    // Complexity: O(N log N) — sort
    addAlternative(locator, priority = 0) {
        this.alternativeLocators.push({ locator, priority });
        this.alternativeLocators.sort((a, b) => b.priority - a.priority);
        return this;
    }
    /**
     * Get all locators (primary + alternatives)
     */
    // Complexity: O(1)
    getAllLocators() {
        return [
            { locator: this.locator, priority: 100 },
            ...this.alternativeLocators,
        ];
    }
    /**
     * Find element with self-healing
     */
    // Complexity: O(N) — loop
    async find() {
        if (!this.page) {
            throw new Error('Page not set. Call setPage() first.');
        }
        // Use cached locator if available
        if (this.options.cacheEnabled && this.cachedLocator) {
            try {
                const count = await this.cachedLocator.count();
                if (count > 0) {
                    return this.cachedLocator;
                }
            }
            catch {
                // Cache invalid, continue to find
            }
        }
        const locators = this.getAllLocators();
        let lastError = null;
        for (const { locator, priority } of locators) {
            try {
                const playwrightLocator = this.toPlaywrightLocator(locator);
                const count = await playwrightLocator.count();
                if (count > 0) {
                    // If healed (not primary locator), record it
                    if (locator !== this.locator) {
                        this.recordHealing(locator);
                    }
                    this.cachedLocator = playwrightLocator;
                    return playwrightLocator;
                }
            }
            catch (error) {
                lastError = error;
            }
        }
        throw lastError || new Error(`Element not found: ${this.metadata.name}`);
    }
    /**
     * Convert LocatorStrategy to Playwright Locator
     */
    // Complexity: O(1)
    toPlaywrightLocator(strategy) {
        if (!this.page) {
            throw new Error('Page not set');
        }
        switch (strategy.type) {
            case 'css':
                return this.page.locator(strategy.value);
            case 'xpath':
                return this.page.locator(`xpath=${strategy.value}`);
            case 'id':
                return this.page.locator(`#${strategy.value}`);
            case 'name':
                return this.page.locator(`[name="${strategy.value}"]`);
            case 'testId':
                return this.page.getByTestId(strategy.value);
            case 'text':
                return this.page.getByText(strategy.value, { exact: strategy.options?.exact });
            case 'role':
                return this.page.getByRole(strategy.value, strategy.options);
            case 'label':
                return this.page.getByLabel(strategy.value);
            default:
                return this.page.locator(strategy.value);
        }
    }
    /**
     * Record healing event
     */
    // Complexity: O(1)
    recordHealing(usedLocator) {
        const event = {
            timestamp: Date.now(),
            originalLocator: this.locator,
            usedLocator,
            successful: true,
        };
        this.state.healingHistory.push(event);
        this.emit('healed', event);
        logger_1.logger.debug(`🔧 Self-healed: ${this.metadata.name}`);
    }
    /**
     * Record interaction
     */
    // Complexity: O(1)
    recordInteraction(type, details = {}) {
        this.state.lastInteraction = {
            type,
            timestamp: Date.now(),
            details,
        };
        this.state.interactionCount++;
        this.emit('interaction', this.state.lastInteraction);
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // ACTIONS
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Click element
     */
    // Complexity: O(N) — linear scan
    async click() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const locator = await this.find();
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.retry(async () => {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await locator.click({ timeout: this.options.timeout });
        });
        this.recordInteraction('click');
    }
    /**
     * Double click
     */
    // Complexity: O(N) — linear scan
    async dblclick() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const locator = await this.find();
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.retry(async () => {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await locator.dblclick({ timeout: this.options.timeout });
        });
        this.recordInteraction('dblclick');
    }
    /**
     * Right click
     */
    // Complexity: O(N) — linear scan
    async rightclick() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const locator = await this.find();
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.retry(async () => {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await locator.click({ button: 'right', timeout: this.options.timeout });
        });
        this.recordInteraction('rightclick');
    }
    /**
     * Type text
     */
    // Complexity: O(N) — linear scan
    async type(text, options) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const locator = await this.find();
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.retry(async () => {
            if (options?.clear) {
                // SAFETY: async operation — wrap in try-catch for production resilience
                await locator.clear();
            }
            // SAFETY: async operation — wrap in try-catch for production resilience
            await locator.fill(text);
        });
        this.recordInteraction('type', { text });
    }
    /**
     * Press key
     */
    // Complexity: O(N) — linear scan
    async press(key) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const locator = await this.find();
        // SAFETY: async operation — wrap in try-catch for production resilience
        await locator.press(key);
        this.recordInteraction('press', { key });
    }
    /**
     * Clear input
     */
    // Complexity: O(N) — linear scan
    async clear() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const locator = await this.find();
        // SAFETY: async operation — wrap in try-catch for production resilience
        await locator.clear();
        this.recordInteraction('clear');
    }
    /**
     * Hover over element
     */
    // Complexity: O(N) — linear scan
    async hover() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const locator = await this.find();
        // SAFETY: async operation — wrap in try-catch for production resilience
        await locator.hover({ timeout: this.options.timeout });
        this.recordInteraction('hover');
    }
    /**
     * Focus element
     */
    // Complexity: O(N) — linear scan
    async focus() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const locator = await this.find();
        // SAFETY: async operation — wrap in try-catch for production resilience
        await locator.focus();
        this.recordInteraction('focus');
    }
    /**
     * Blur element
     */
    // Complexity: O(N) — linear scan
    async blur() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const locator = await this.find();
        // SAFETY: async operation — wrap in try-catch for production resilience
        await locator.blur();
        this.recordInteraction('blur');
    }
    /**
     * Scroll into view
     */
    // Complexity: O(N) — linear scan
    async scrollIntoView() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const locator = await this.find();
        // SAFETY: async operation — wrap in try-catch for production resilience
        await locator.scrollIntoViewIfNeeded();
        this.recordInteraction('scrollIntoView');
    }
    /**
     * Select option from dropdown
     */
    // Complexity: O(N) — linear scan
    async select(value) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const locator = await this.find();
        // SAFETY: async operation — wrap in try-catch for production resilience
        await locator.selectOption(value);
        this.recordInteraction('select', { value });
    }
    /**
     * Check checkbox/radio
     */
    // Complexity: O(N) — linear scan
    async check() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const locator = await this.find();
        // SAFETY: async operation — wrap in try-catch for production resilience
        await locator.check();
        this.recordInteraction('check');
    }
    /**
     * Uncheck checkbox
     */
    // Complexity: O(N) — linear scan
    async uncheck() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const locator = await this.find();
        // SAFETY: async operation — wrap in try-catch for production resilience
        await locator.uncheck();
        this.recordInteraction('uncheck');
    }
    /**
     * Upload file
     */
    // Complexity: O(N) — linear scan
    async upload(filePath) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const locator = await this.find();
        // SAFETY: async operation — wrap in try-catch for production resilience
        await locator.setInputFiles(filePath);
        this.recordInteraction('upload', { filePath });
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // GETTERS
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Get text content
     */
    // Complexity: O(N) — linear scan
    async getText() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const locator = await this.find();
        // SAFETY: async operation — wrap in try-catch for production resilience
        return (await locator.textContent()) ?? '';
    }
    /**
     * Get inner text
     */
    // Complexity: O(N) — linear scan
    async getInnerText() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const locator = await this.find();
        // SAFETY: async operation — wrap in try-catch for production resilience
        return await locator.innerText();
    }
    /**
     * Get input value
     */
    // Complexity: O(N) — linear scan
    async getValue() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const locator = await this.find();
        // SAFETY: async operation — wrap in try-catch for production resilience
        return await locator.inputValue();
    }
    /**
     * Get attribute
     */
    // Complexity: O(N) — linear scan
    async getAttribute(name) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const locator = await this.find();
        // SAFETY: async operation — wrap in try-catch for production resilience
        return await locator.getAttribute(name);
    }
    /**
     * Get CSS property
     */
    // Complexity: O(N) — linear scan
    async getCssValue(property) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const locator = await this.find();
        // SAFETY: async operation — wrap in try-catch for production resilience
        return await locator.evaluate((el, prop) => {
            return window.getComputedStyle(el).getPropertyValue(prop);
        }, property);
    }
    /**
     * Get bounding box
     */
    // Complexity: O(N) — linear scan
    async getRect() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const locator = await this.find();
        // SAFETY: async operation — wrap in try-catch for production resilience
        return await locator.boundingBox();
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // STATE CHECKS
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Check if visible
     */
    // Complexity: O(N) — linear scan
    async isVisible() {
        try {
            const locator = await this.find();
            return await locator.isVisible();
        }
        catch {
            return false;
        }
    }
    /**
     * Check if enabled
     */
    // Complexity: O(N) — linear scan
    async isEnabled() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const locator = await this.find();
        // SAFETY: async operation — wrap in try-catch for production resilience
        return await locator.isEnabled();
    }
    /**
     * Check if disabled
     */
    // Complexity: O(N) — linear scan
    async isDisabled() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const locator = await this.find();
        // SAFETY: async operation — wrap in try-catch for production resilience
        return await locator.isDisabled();
    }
    /**
     * Check if checked
     */
    // Complexity: O(N) — linear scan
    async isChecked() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const locator = await this.find();
        // SAFETY: async operation — wrap in try-catch for production resilience
        return await locator.isChecked();
    }
    /**
     * Check if element exists
     */
    // Complexity: O(N) — linear scan
    async exists() {
        try {
            const locator = await this.find();
            return (await locator.count()) > 0;
        }
        catch {
            return false;
        }
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // WAITS
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Wait for element to be visible
     */
    // Complexity: O(N) — linear scan
    async waitForVisible(timeout) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const locator = await this.find();
        // SAFETY: async operation — wrap in try-catch for production resilience
        await locator.waitFor({ state: 'visible', timeout: timeout ?? this.options.timeout });
    }
    /**
     * Wait for element to be hidden
     */
    // Complexity: O(N) — linear scan
    async waitForHidden(timeout) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const locator = await this.find();
        // SAFETY: async operation — wrap in try-catch for production resilience
        await locator.waitFor({ state: 'hidden', timeout: timeout ?? this.options.timeout });
    }
    /**
     * Wait for element to be attached
     */
    // Complexity: O(N) — linear scan
    async waitForAttached(timeout) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const locator = await this.find();
        // SAFETY: async operation — wrap in try-catch for production resilience
        await locator.waitFor({ state: 'attached', timeout: timeout ?? this.options.timeout });
    }
    /**
     * Wait for element to be detached
     */
    // Complexity: O(N) — linear scan
    async waitForDetached(timeout) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const locator = await this.find();
        // SAFETY: async operation — wrap in try-catch for production resilience
        await locator.waitFor({ state: 'detached', timeout: timeout ?? this.options.timeout });
    }
    /**
     * Wait for custom condition
     */
    // Complexity: O(N*M) — nested iteration
    async waitFor(condition, timeout) {
        const actualTimeout = timeout ?? this.options.timeout;
        const startTime = Date.now();
        while (Date.now() - startTime < actualTimeout) {
            try {
                const result = await condition();
                if (result)
                    return;
            }
            catch {
                // Continue waiting
            }
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.sleep(100);
        }
        throw new Error(`Wait timeout for ${this.metadata.name}: ${actualTimeout}ms`);
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // UTILITIES
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Retry operation
     */
    async retry(operation, retries) {
        const maxRetries = retries ?? this.options.retries;
        let lastError;
        for (let i = 0; i < maxRetries; i++) {
            try {
                return await operation();
            }
            catch (error) {
                lastError = error;
                this.state.errors.push({
                    timestamp: Date.now(),
                    attempt: i + 1,
                    error: lastError.message,
                });
                // SAFETY: async operation — wrap in try-catch for production resilience
                await this.sleep(this.options.waitBetweenRetries);
            }
        }
        throw lastError;
    }
    /**
     * Sleep helper
     */
    // Complexity: O(1)
    sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
    /**
     * Get element state info
     */
    // Complexity: O(1)
    getState() {
        return {
            ...this.state,
            metadata: this.metadata,
            locatorCount: this.getAllLocators().length,
        };
    }
    /**
     * Get Playwright locator directly
     */
    // Complexity: O(N) — linear scan
    async getLocator() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        return await this.find();
    }
}
exports.BaseElement = BaseElement;
exports.default = BaseElement;
