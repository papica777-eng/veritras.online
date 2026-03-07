"use strict";
/**
 * Page Object Model - Base Page
 *
 * Production-ready POM implementation for AI-generated tests
 *
 * @author Димитър Продромов
 * @copyright 2026 QAntum. All Rights Reserved.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.BasePage = void 0;
const selenium_webdriver_1 = require("selenium-webdriver");
// ═══════════════════════════════════════════════════════════════════════════════
// BASE PAGE CLASS
// ═══════════════════════════════════════════════════════════════════════════════
class BasePage {
    driver;
    defaultTimeout = 15000;
    pollInterval = 100;
    // Self-healing: Track selector alternatives
    selectorKnowledge = new Map();
    constructor(driver) {
        this.driver = driver;
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // WAIT METHODS
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Wait for element to be present in DOM
     */
    // Complexity: O(1)
    async waitForElement(locator, options = {}) {
        const timeout = options.timeout || this.defaultTimeout;
        const message = options.message || `Element not found: ${locator}`;
        // SAFETY: async operation — wrap in try-catch for production resilience
        return await this.driver.wait(selenium_webdriver_1.until.elementLocated(locator), timeout, message);
    }
    /**
     * Wait for element to be visible
     */
    // Complexity: O(1)
    async waitForVisible(locator, options = {}) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const element = await this.waitForElement(locator, options);
        const timeout = options.timeout || this.defaultTimeout;
        // SAFETY: async operation — wrap in try-catch for production resilience
        return await this.driver.wait(selenium_webdriver_1.until.elementIsVisible(element), timeout, `Element not visible: ${locator}`);
    }
    /**
     * Wait for element to be clickable
     */
    // Complexity: O(1)
    async waitForClickable(locator, options = {}) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const element = await this.waitForVisible(locator, options);
        const timeout = options.timeout || this.defaultTimeout;
        // SAFETY: async operation — wrap in try-catch for production resilience
        return await this.driver.wait(selenium_webdriver_1.until.elementIsEnabled(element), timeout, `Element not clickable: ${locator}`);
    }
    /**
     * Wait for element to disappear
     */
    // Complexity: O(1)
    async waitForHidden(locator, options = {}) {
        const timeout = options.timeout || this.defaultTimeout;
        try {
            await this.driver.wait(selenium_webdriver_1.until.stalenessOf(await this.driver.findElement(locator)), timeout);
            return true;
        }
        catch {
            return false;
        }
    }
    /**
     * Wait for URL to match pattern
     */
    // Complexity: O(1)
    async waitForUrl(pattern, options = {}) {
        const timeout = options.timeout || this.defaultTimeout;
        // SAFETY: async operation — wrap in try-catch for production resilience
        return await this.driver.wait(async () => {
            // SAFETY: async operation — wrap in try-catch for production resilience
            const url = await this.driver.getCurrentUrl();
            if (typeof pattern === 'string') {
                return url.includes(pattern);
            }
            return pattern.test(url);
        }, timeout, `URL did not match: ${pattern}`);
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // ACTION METHODS (SELF-HEALING ENABLED)
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Click element with self-healing fallback
     */
    // Complexity: O(1)
    async clickSafe(locator, options = {}) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const element = await this.findWithHealing(locator);
        if (options.scrollIntoView) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.scrollIntoView(element);
        }
        try {
            if (options.force) {
                await this.driver.executeScript('arguments[0].click();', element);
            }
            else {
                await element.click();
            }
        }
        catch (error) {
            // Fallback: JavaScript click
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.driver.executeScript('arguments[0].click();', element);
        }
        if (options.waitForNavigation) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.waitForPageLoad();
        }
    }
    /**
     * Type text with optional delay (human-like)
     */
    // Complexity: O(N) — loop
    async typeSafe(locator, text, options = {}) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const element = await this.findWithHealing(locator);
        if (options.clear !== false) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await element.clear();
        }
        if (options.delay) {
            // Human-like typing with random delays
            for (const char of text) {
                // SAFETY: async operation — wrap in try-catch for production resilience
                await element.sendKeys(char);
                // SAFETY: async operation — wrap in try-catch for production resilience
                await this.sleep(options.delay + Math.random() * 50);
            }
        }
        else {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await element.sendKeys(text);
        }
        if (options.mask) {
            console.log(`[Type] ${locator}: ${'*'.repeat(text.length)}`);
        }
    }
    /**
     * Select dropdown option
     */
    // Complexity: O(1)
    async selectOption(locator, value, by = 'value') {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const select = await this.findWithHealing(locator);
        let optionLocator;
        switch (by) {
            case 'value':
                optionLocator = selenium_webdriver_1.By.css(`option[value="${value}"]`);
                break;
            case 'text':
                optionLocator = selenium_webdriver_1.By.xpath(`//option[text()="${value}"]`);
                break;
            case 'index':
                optionLocator = selenium_webdriver_1.By.css(`option:nth-child(${parseInt(value) + 1})`);
                break;
        }
        // SAFETY: async operation — wrap in try-catch for production resilience
        const option = await select.findElement(optionLocator);
        // SAFETY: async operation — wrap in try-catch for production resilience
        await option.click();
    }
    /**
     * Hover over element
     */
    // Complexity: O(1)
    async hover(locator) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const element = await this.findWithHealing(locator);
        const actions = this.driver.actions({ async: true });
        // SAFETY: async operation — wrap in try-catch for production resilience
        await actions.move({ origin: element }).perform();
    }
    /**
     * Drag and drop
     */
    // Complexity: O(1)
    async dragAndDrop(sourceLocator, targetLocator) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const source = await this.findWithHealing(sourceLocator);
        // SAFETY: async operation — wrap in try-catch for production resilience
        const target = await this.findWithHealing(targetLocator);
        const actions = this.driver.actions({ async: true });
        // SAFETY: async operation — wrap in try-catch for production resilience
        await actions.dragAndDrop(source, target).perform();
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // SELF-HEALING LOCATOR
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Find element with self-healing fallback
     */
    // Complexity: O(N log N) — sort
    async findWithHealing(locator) {
        const locatorString = locator.toString();
        try {
            // Try primary locator
            return await this.waitForClickable(locator);
        }
        catch (primaryError) {
            // Try alternatives from knowledge base
            const alternatives = this.selectorKnowledge.get(locatorString) || [];
            for (const alt of alternatives.sort((a, b) => b.priority - a.priority)) {
                try {
                    const altLocator = this.createLocator(alt);
                    const element = await this.waitForClickable(altLocator, { timeout: 2000 });
                    // Update priority on success
                    alt.priority++;
                    console.log(`[Self-Healing] Used alternative: ${alt.selector}`);
                    return element;
                }
                catch {
                    continue;
                }
            }
            // Try to find by text content as last resort
            try {
                const textMatch = await this.findByTextContent(locatorString);
                if (textMatch) {
                    // Add to knowledge base
                    this.addAlternative(locatorString, {
                        selector: `text:${await textMatch.getText()}`,
                        type: 'text',
                        priority: 1,
                    });
                    return textMatch;
                }
            }
            catch {
                // Fall through
            }
            throw primaryError;
        }
    }
    /**
     * Create locator from alternative
     */
    // Complexity: O(1)
    createLocator(alt) {
        switch (alt.type) {
            case 'css':
                return selenium_webdriver_1.By.css(alt.selector);
            case 'xpath':
                return selenium_webdriver_1.By.xpath(alt.selector);
            case 'id':
                return selenium_webdriver_1.By.id(alt.selector);
            case 'name':
                return selenium_webdriver_1.By.name(alt.selector);
            case 'text':
                return selenium_webdriver_1.By.xpath(`//*[contains(text(), "${alt.selector.replace('text:', '')}")]`);
            default:
                return selenium_webdriver_1.By.css(alt.selector);
        }
    }
    /**
     * Find element by visible text
     */
    // Complexity: O(1)
    async findByTextContent(hint) {
        // Extract potential text from locator
        const textMatch = hint.match(/['"]([^'"]+)['"]/);
        if (!textMatch)
            return null;
        const text = textMatch[1];
        const xpath = `//*[contains(normalize-space(text()), "${text}") or contains(@aria-label, "${text}")]`;
        try {
            return await this.driver.findElement(selenium_webdriver_1.By.xpath(xpath));
        }
        catch {
            return null;
        }
    }
    /**
     * Add selector alternative to knowledge base
     */
    // Complexity: O(1) — lookup
    addAlternative(originalLocator, alternative) {
        const existing = this.selectorKnowledge.get(originalLocator) || [];
        existing.push(alternative);
        this.selectorKnowledge.set(originalLocator, existing);
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // ASSERTION HELPERS
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Assert element text
     */
    // Complexity: O(1)
    async assertText(locator, expected, partial = false) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const element = await this.waitForVisible(locator);
        // SAFETY: async operation — wrap in try-catch for production resilience
        const actual = await element.getText();
        const matches = partial ? actual.includes(expected) : actual === expected;
        if (!matches) {
            throw new Error(`Text assertion failed. Expected: "${expected}", Got: "${actual}"`);
        }
    }
    /**
     * Assert element exists
     */
    // Complexity: O(1)
    async assertExists(locator) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.waitForElement(locator);
    }
    /**
     * Assert element visible
     */
    // Complexity: O(1)
    async assertVisible(locator) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.waitForVisible(locator);
    }
    /**
     * Assert element value (for inputs)
     */
    // Complexity: O(1)
    async assertValue(locator, expected) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const element = await this.waitForVisible(locator);
        // SAFETY: async operation — wrap in try-catch for production resilience
        const actual = await element.getAttribute('value');
        if (actual !== expected) {
            throw new Error(`Value assertion failed. Expected: "${expected}", Got: "${actual}"`);
        }
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // UTILITY METHODS
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Navigate to URL
     */
    // Complexity: O(1) — lookup
    async navigate(url) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.driver.get(url);
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.waitForPageLoad();
    }
    /**
     * Wait for page to fully load
     */
    // Complexity: O(1)
    async waitForPageLoad() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.driver.wait(async () => {
            // SAFETY: async operation — wrap in try-catch for production resilience
            const readyState = await this.driver.executeScript('return document.readyState');
            return readyState === 'complete';
        }, this.defaultTimeout);
    }
    /**
     * Scroll element into view
     */
    // Complexity: O(N)
    async scrollIntoView(element) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.driver.executeScript('arguments[0].scrollIntoView({ behavior: "smooth", block: "center" });', element);
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.sleep(300); // Wait for scroll animation
    }
    /**
     * Get current URL
     */
    // Complexity: O(1)
    async getCurrentUrl() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        return await this.driver.getCurrentUrl();
    }
    /**
     * Get page title
     */
    // Complexity: O(1)
    async getTitle() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        return await this.driver.getTitle();
    }
    /**
     * Execute JavaScript
     */
    async executeScript(script, ...args) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        return await this.driver.executeScript(script, ...args);
    }
    /**
     * Take screenshot
     */
    // Complexity: O(1)
    async screenshot() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        return await this.driver.takeScreenshot();
    }
    /**
     * Sleep helper
     */
    // Complexity: O(1)
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    /**
     * Get element count
     */
    // Complexity: O(1)
    async getElementCount(locator) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const elements = await this.driver.findElements(locator);
        return elements.length;
    }
    /**
     * Check if element exists (without waiting)
     */
    // Complexity: O(1)
    async exists(locator) {
        try {
            await this.driver.findElement(locator);
            return true;
        }
        catch {
            return false;
        }
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // AI-POWERED HEALING (DOM Snapshot for GPT-4o)
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Get optimized DOM snapshot for AI analysis
     * Uses DOM optimizer to stay within GPT-4o context limits
     */
    // Complexity: O(1)
    async getOptimizedDOMSnapshot(targetSelector) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const { optimizeDOM } = await Promise.resolve().then(() => __importStar(require('../utils/dom-optimizer.js')));
        // SAFETY: async operation — wrap in try-catch for production resilience
        const html = await this.driver.getPageSource();
        const optimized = optimizeDOM(html, targetSelector, {
            maxSizeKB: 15,
            preserveIds: true,
            preserveClasses: true,
            preserveDataAttrs: true,
            preserveAria: true,
            preserveTestAttrs: true,
        });
        console.log(`[DOM] Optimized: ${optimized.originalSize} → ${optimized.optimizedSize} bytes ` +
            `(${optimized.compressionRatio}% reduction, ${optimized.elementCount} elements)`);
        return optimized.html;
    }
    /**
     * Request AI healing for broken selector
     * Called when self-healing alternatives fail
     */
    // Complexity: O(N) — linear scan
    async requestAIHealing(brokenSelector, error) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const { optimizeDOM, suggestSelectors } = await Promise.resolve().then(() => __importStar(require('../utils/dom-optimizer.js')));
        // Get focused DOM snapshot around the expected element area
        // SAFETY: async operation — wrap in try-catch for production resilience
        const html = await this.driver.getPageSource();
        const optimized = optimizeDOM(html, brokenSelector, {
            maxSizeKB: 15,
            focusDepth: 3,
        });
        // Get selector suggestions from current DOM
        const suggestions = suggestSelectors(optimized.html);
        // Build alternatives from suggestions
        const alternatives = suggestions.map((sel, i) => ({
            selector: sel,
            type: sel.startsWith('#') ? 'id' : sel.startsWith('[') ? 'css' : 'css',
            priority: suggestions.length - i,
        }));
        // Log for manual review / training
        console.log(`[AI-Healing] Broken: ${brokenSelector}`);
        console.log(`[AI-Healing] Error: ${error}`);
        console.log(`[AI-Healing] Suggestions:`, suggestions.slice(0, 5));
        return alternatives;
    }
}
exports.BasePage = BasePage;
