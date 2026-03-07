"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🧠 QANTUM HYBRID v1.0.0 - LocatorFactory
 * Fluent locator builder (By.css, By.xpath, By.testId, etc.)
 * Ported from: training-framework/architecture/pom-base.js
 * ═══════════════════════════════════════════════════════════════════════════════
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocatorBuilder = exports.By = exports.LocatorFactory = void 0;
exports.locator = locator;
// ═══════════════════════════════════════════════════════════════════════════════
// LOCATOR FACTORY (By class)
// ═══════════════════════════════════════════════════════════════════════════════
class LocatorFactory {
    /**
     * CSS selector
     */
    static css(selector) {
        return { type: 'css', value: selector };
    }
    /**
     * XPath selector
     */
    static xpath(expression) {
        return { type: 'xpath', value: expression };
    }
    /**
     * ID selector
     */
    static id(id) {
        return { type: 'id', value: id };
    }
    /**
     * Name attribute selector
     */
    static name(name) {
        return { type: 'name', value: name };
    }
    /**
     * Test ID selector (data-testid)
     */
    static testId(testId) {
        return { type: 'testId', value: testId };
    }
    /**
     * Data attribute selector
     */
    static data(attribute, value) {
        const selector = value !== undefined
            ? `[data-${attribute}="${value}"]`
            : `[data-${attribute}]`;
        return { type: 'css', value: selector };
    }
    /**
     * ARIA role selector
     */
    static role(role, options) {
        return { type: 'role', value: role, options };
    }
    /**
     * Text content selector
     */
    static text(text, options) {
        return { type: 'text', value: text, options };
    }
    /**
     * Label selector
     */
    static label(text) {
        return { type: 'label', value: text };
    }
    /**
     * Placeholder selector
     */
    static placeholder(text) {
        return { type: 'css', value: `[placeholder="${text}"]` };
    }
    /**
     * Title attribute selector
     */
    static title(text) {
        return { type: 'css', value: `[title="${text}"]` };
    }
    /**
     * Alt attribute selector (for images)
     */
    static alt(text) {
        return { type: 'css', value: `[alt="${text}"]` };
    }
    /**
     * Class name selector
     */
    static className(className) {
        return { type: 'css', value: `.${className}` };
    }
    /**
     * Tag name selector
     */
    static tagName(tag) {
        return { type: 'css', value: tag };
    }
    /**
     * Link text selector
     */
    static linkText(text, partial = false) {
        return partial
            ? { type: 'xpath', value: `//a[contains(text(), "${text}")]` }
            : { type: 'xpath', value: `//a[text()="${text}"]` };
    }
    /**
     * Partial link text selector
     */
    static partialLinkText(text) {
        return this.linkText(text, true);
    }
    /**
     * Button by text
     */
    static button(text) {
        return {
            type: 'xpath',
            value: `//button[contains(text(), "${text}")] | //input[@type="button" and @value="${text}"] | //input[@type="submit" and @value="${text}"]`
        };
    }
    /**
     * Input by type
     */
    static input(type) {
        return { type: 'css', value: `input[type="${type}"]` };
    }
    /**
     * Form field by label
     */
    static fieldByLabel(labelText) {
        return {
            type: 'xpath',
            value: `//label[contains(text(), "${labelText}")]/following::input[1] | //label[contains(text(), "${labelText}")]/input`
        };
    }
    /**
     * Nth child selector
     */
    static nthChild(selector, n) {
        return { type: 'css', value: `${selector}:nth-child(${n})` };
    }
    /**
     * First child selector
     */
    static firstChild(selector) {
        return { type: 'css', value: `${selector}:first-child` };
    }
    /**
     * Last child selector
     */
    static lastChild(selector) {
        return { type: 'css', value: `${selector}:last-child` };
    }
    /**
     * Contains text (XPath)
     */
    static containsText(text) {
        return { type: 'xpath', value: `//*[contains(text(), "${text}")]` };
    }
    /**
     * Attribute contains
     */
    static attributeContains(attr, value) {
        return { type: 'css', value: `[${attr}*="${value}"]` };
    }
    /**
     * Attribute starts with
     */
    static attributeStartsWith(attr, value) {
        return { type: 'css', value: `[${attr}^="${value}"]` };
    }
    /**
     * Attribute ends with
     */
    static attributeEndsWith(attr, value) {
        return { type: 'css', value: `[${attr}$="${value}"]` };
    }
    /**
     * Has attribute
     */
    static hasAttribute(attr) {
        return { type: 'css', value: `[${attr}]` };
    }
    /**
     * Chain multiple selectors (descendant)
     */
    static chain(...selectors) {
        return { type: 'css', value: selectors.join(' ') };
    }
    /**
     * Direct child selector
     */
    static child(parent, child) {
        return { type: 'css', value: `${parent} > ${child}` };
    }
    /**
     * Adjacent sibling selector
     */
    static adjacent(first, second) {
        return { type: 'css', value: `${first} + ${second}` };
    }
    /**
     * General sibling selector
     */
    static sibling(first, second) {
        return { type: 'css', value: `${first} ~ ${second}` };
    }
    /**
     * Multiple selectors (OR)
     */
    static or(...selectors) {
        return { type: 'css', value: selectors.join(', ') };
    }
    /**
     * Not selector
     */
    static not(selector, notSelector) {
        return { type: 'css', value: `${selector}:not(${notSelector})` };
    }
    /**
     * Visible only
     */
    static visible(selector) {
        return { type: 'css', value: `${selector}:visible` };
    }
    /**
     * Custom locator
     */
    static custom(value, type = 'css') {
        return { type, value };
    }
}
exports.LocatorFactory = LocatorFactory;
// ═══════════════════════════════════════════════════════════════════════════════
// BY ALIAS (Selenium-style)
// ═══════════════════════════════════════════════════════════════════════════════
exports.By = LocatorFactory;
// ═══════════════════════════════════════════════════════════════════════════════
// LOCATOR BUILDER (Fluent API)
// ═══════════════════════════════════════════════════════════════════════════════
class LocatorBuilder {
    strategies = [];
    currentSelector = '';
    /**
     * Start with CSS selector
     */
    // Complexity: O(1)
    css(selector) {
        this.currentSelector = selector;
        return this;
    }
    /**
     * Filter by attribute
     */
    // Complexity: O(1)
    withAttribute(attr, value) {
        if (value !== undefined) {
            this.currentSelector += `[${attr}="${value}"]`;
        }
        else {
            this.currentSelector += `[${attr}]`;
        }
        return this;
    }
    /**
     * Filter by class
     */
    // Complexity: O(1)
    withClass(className) {
        this.currentSelector += `.${className}`;
        return this;
    }
    /**
     * Filter by ID
     */
    // Complexity: O(1)
    withId(id) {
        this.currentSelector += `#${id}`;
        return this;
    }
    /**
     * Filter by nth-child
     */
    // Complexity: O(1)
    nth(n) {
        this.currentSelector += `:nth-child(${n})`;
        return this;
    }
    /**
     * Filter first
     */
    // Complexity: O(1)
    first() {
        this.currentSelector += ':first-child';
        return this;
    }
    /**
     * Filter last
     */
    // Complexity: O(1)
    last() {
        this.currentSelector += ':last-child';
        return this;
    }
    /**
     * Child selector
     */
    // Complexity: O(1)
    find(selector) {
        this.currentSelector += ` ${selector}`;
        return this;
    }
    /**
     * Direct child
     */
    // Complexity: O(1)
    directChild(selector) {
        this.currentSelector += ` > ${selector}`;
        return this;
    }
    /**
     * Add as alternative
     */
    // Complexity: O(1)
    or() {
        if (this.currentSelector) {
            this.strategies.push({ type: 'css', value: this.currentSelector });
            this.currentSelector = '';
        }
        return this;
    }
    /**
     * Build locator strategy
     */
    // Complexity: O(N) — linear scan
    build() {
        if (this.currentSelector) {
            this.strategies.push({ type: 'css', value: this.currentSelector });
        }
        if (this.strategies.length === 0) {
            throw new Error('No locator defined');
        }
        if (this.strategies.length === 1) {
            return this.strategies[0];
        }
        // Return combined selector
        return {
            type: 'css',
            value: this.strategies.map(s => s.value).join(', '),
        };
    }
    /**
     * Build all strategies (for self-healing)
     */
    // Complexity: O(1)
    buildAll() {
        if (this.currentSelector) {
            this.strategies.push({ type: 'css', value: this.currentSelector });
        }
        return [...this.strategies];
    }
}
exports.LocatorBuilder = LocatorBuilder;
/**
 * Create new locator builder
 */
function locator() {
    return new LocatorBuilder();
}
exports.default = { LocatorFactory, By: exports.By, LocatorBuilder, locator };
