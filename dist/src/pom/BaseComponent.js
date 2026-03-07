"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🧠 QANTUM HYBRID v1.0.0 - BaseComponent
 * Reusable UI component abstraction (Header, Footer, Modal, etc.)
 * Ported from: training-framework/architecture/pom-base.js
 * ═══════════════════════════════════════════════════════════════════════════════
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DropdownComponent = exports.TableComponent = exports.FormComponent = exports.ModalComponent = exports.FooterComponent = exports.HeaderComponent = exports.BaseComponent = void 0;
const events_1 = require("events");
const BaseElement_1 = require("./BaseElement");
// ═══════════════════════════════════════════════════════════════════════════════
// BASE COMPONENT CLASS
// ═══════════════════════════════════════════════════════════════════════════════
class BaseComponent extends events_1.EventEmitter {
    rootLocator;
    options;
    metadata;
    page;
    elements = new Map();
    subComponents = new Map();
    cachedRoot;
    constructor(rootLocator, options = {}) {
        super();
        this.rootLocator = rootLocator;
        this.options = {
            timeout: options.timeout ?? 30000,
            retries: options.retries ?? 3,
            waitBetweenRetries: options.waitBetweenRetries ?? 500,
            selfHealing: options.selfHealing ?? true,
            cacheEnabled: options.cacheEnabled ?? true,
            name: options.name ?? 'UnnamedComponent',
            type: options.type ?? 'component',
            description: options.description ?? '',
            waitForRoot: options.waitForRoot ?? true,
            rootTimeout: options.rootTimeout ?? 10000,
        };
        this.metadata = {
            name: this.options.name,
            type: this.options.type,
            description: this.options.description,
        };
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // INITIALIZATION
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Set Playwright page instance
     */
    // Complexity: O(N*M) — nested iteration
    setPage(page) {
        this.page = page;
        this.cachedRoot = undefined;
        // Update all child elements
        for (const element of this.elements.values()) {
            element.setPage(page);
        }
        // Update all sub-components
        for (const component of this.subComponents.values()) {
            component.setPage(page);
        }
        return this;
    }
    /**
     * Find the root element of this component
     */
    // Complexity: O(1)
    async findRoot() {
        if (!this.page) {
            throw new Error('Page not set. Call setPage() first.');
        }
        // Use cache if available
        if (this.options.cacheEnabled && this.cachedRoot) {
            try {
                const count = await this.cachedRoot.count();
                if (count > 0)
                    return this.cachedRoot;
            }
            catch {
                // Cache invalid
            }
        }
        const locator = this.toPlaywrightLocator(this.rootLocator);
        if (this.options.waitForRoot) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await locator.waitFor({
                state: 'attached',
                timeout: this.options.rootTimeout
            });
        }
        this.cachedRoot = locator;
        return locator;
    }
    /**
     * Convert strategy to Playwright locator
     */
    // Complexity: O(1)
    toPlaywrightLocator(strategy) {
        if (!this.page)
            throw new Error('Page not set');
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
                return this.page.getByText(strategy.value);
            case 'role':
                return this.page.getByRole(strategy.value, strategy.options);
            default:
                return this.page.locator(strategy.value);
        }
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // ELEMENT MANAGEMENT (scoped to component root)
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Define an element within this component (scoped to root)
     */
    // Complexity: O(1) — lookup
    element(name, locator, options = {}) {
        const strategy = typeof locator === 'string'
            ? { type: 'css', value: locator }
            : locator;
        // Create element that will be scoped to component root
        const element = new BaseElement_1.BaseElement(strategy, { ...options, name });
        if (this.page) {
            element.setPage(this.page);
        }
        this.elements.set(name, element);
        return element;
    }
    /**
     * Get scoped element by name
     */
    $(name) {
        const element = this.elements.get(name);
        if (!element) {
            throw new Error(`Element not found in component ${this.metadata.name}: ${name}`);
        }
        return element;
    }
    /**
     * Define a sub-component within this component
     */
    subComponent(name, ComponentClass, rootLocator, options) {
        const strategy = typeof rootLocator === 'string'
            ? { type: 'css', value: rootLocator }
            : rootLocator;
        const comp = new ComponentClass(strategy, { ...options, name });
        if (this.page) {
            comp.setPage(this.page);
        }
        this.subComponents.set(name, comp);
        return comp;
    }
    /**
     * Get sub-component by name
     */
    getSubComponent(name) {
        const comp = this.subComponents.get(name);
        if (!comp) {
            throw new Error(`Sub-component not found: ${name}`);
        }
        return comp;
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // STATE CHECKS
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Check if component is visible
     */
    // Complexity: O(1)
    async isVisible() {
        try {
            const root = await this.findRoot();
            return await root.isVisible();
        }
        catch {
            return false;
        }
    }
    /**
     * Check if component exists in DOM
     */
    // Complexity: O(1)
    async exists() {
        try {
            const root = await this.findRoot();
            return (await root.count()) > 0;
        }
        catch {
            return false;
        }
    }
    /**
     * Check if component is enabled
     */
    // Complexity: O(1)
    async isEnabled() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const root = await this.findRoot();
        // SAFETY: async operation — wrap in try-catch for production resilience
        return await root.isEnabled();
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // WAITS
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Wait for component to be visible
     */
    // Complexity: O(1)
    async waitForVisible(timeout) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const root = await this.findRoot();
        // SAFETY: async operation — wrap in try-catch for production resilience
        await root.waitFor({
            state: 'visible',
            timeout: timeout ?? this.options.timeout
        });
    }
    /**
     * Wait for component to be hidden
     */
    // Complexity: O(1)
    async waitForHidden(timeout) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const root = await this.findRoot();
        // SAFETY: async operation — wrap in try-catch for production resilience
        await root.waitFor({
            state: 'hidden',
            timeout: timeout ?? this.options.timeout
        });
    }
    /**
     * Wait for component to be detached
     */
    // Complexity: O(1)
    async waitForDetached(timeout) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const root = await this.findRoot();
        // SAFETY: async operation — wrap in try-catch for production resilience
        await root.waitFor({
            state: 'detached',
            timeout: timeout ?? this.options.timeout
        });
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // ACTIONS
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Click on component root
     */
    // Complexity: O(1)
    async click() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const root = await this.findRoot();
        // SAFETY: async operation — wrap in try-catch for production resilience
        await root.click();
    }
    /**
     * Hover over component
     */
    // Complexity: O(1)
    async hover() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const root = await this.findRoot();
        // SAFETY: async operation — wrap in try-catch for production resilience
        await root.hover();
    }
    /**
     * Scroll component into view
     */
    // Complexity: O(1)
    async scrollIntoView() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const root = await this.findRoot();
        // SAFETY: async operation — wrap in try-catch for production resilience
        await root.scrollIntoViewIfNeeded();
    }
    /**
     * Get text content of component
     */
    // Complexity: O(1)
    async getText() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const root = await this.findRoot();
        // SAFETY: async operation — wrap in try-catch for production resilience
        return (await root.textContent()) ?? '';
    }
    /**
     * Get inner HTML
     */
    // Complexity: O(1)
    async getInnerHTML() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const root = await this.findRoot();
        // SAFETY: async operation — wrap in try-catch for production resilience
        return await root.innerHTML();
    }
    /**
     * Get attribute
     */
    // Complexity: O(1)
    async getAttribute(name) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const root = await this.findRoot();
        // SAFETY: async operation — wrap in try-catch for production resilience
        return await root.getAttribute(name);
    }
    /**
     * Take screenshot of component
     */
    // Complexity: O(1)
    async screenshot(path) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const root = await this.findRoot();
        // SAFETY: async operation — wrap in try-catch for production resilience
        return await root.screenshot({ path });
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // UTILITIES
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Get component state info
     */
    // Complexity: O(1)
    getState() {
        return {
            metadata: this.metadata,
            elementCount: this.elements.size,
            subComponentCount: this.subComponents.size,
            elements: Array.from(this.elements.keys()),
            subComponents: Array.from(this.subComponents.keys()),
        };
    }
    /**
     * Get root Playwright locator directly
     */
    // Complexity: O(1)
    async getLocator() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        return await this.findRoot();
    }
}
exports.BaseComponent = BaseComponent;
// ═══════════════════════════════════════════════════════════════════════════════
// COMMON COMPONENT IMPLEMENTATIONS
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * Header Component
 */
class HeaderComponent extends BaseComponent {
    constructor(rootLocator = { type: 'css', value: 'header' }, options) {
        super(rootLocator, { ...options, type: 'header' });
        this.initElements();
    }
    // Complexity: O(1)
    initElements() {
        this.element('logo', 'img.logo, .logo, [data-testid="logo"]');
        this.element('nav', 'nav, .nav, .navigation');
        this.element('search', 'input[type="search"], .search-input');
        this.element('menuButton', '.menu-button, .hamburger, [data-testid="menu"]');
    }
    // Complexity: O(1)
    async clickLogo() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.$('logo').click();
    }
    // Complexity: O(1)
    async search(query) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.$('search').type(query);
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.$('search').press('Enter');
    }
    // Complexity: O(1)
    async toggleMenu() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.$('menuButton').click();
    }
}
exports.HeaderComponent = HeaderComponent;
/**
 * Footer Component
 */
class FooterComponent extends BaseComponent {
    constructor(rootLocator = { type: 'css', value: 'footer' }, options) {
        super(rootLocator, { ...options, type: 'footer' });
        this.initElements();
    }
    // Complexity: O(1)
    initElements() {
        this.element('copyright', '.copyright, [data-testid="copyright"]');
        this.element('links', '.footer-links, nav');
        this.element('socialLinks', '.social-links, .social');
    }
    // Complexity: O(1)
    async getCopyright() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        return await this.$('copyright').getText();
    }
}
exports.FooterComponent = FooterComponent;
/**
 * Modal/Dialog Component
 */
class ModalComponent extends BaseComponent {
    constructor(rootLocator = { type: 'css', value: '.modal, [role="dialog"], .dialog' }, options) {
        super(rootLocator, { ...options, type: 'modal' });
        this.initElements();
    }
    // Complexity: O(1)
    initElements() {
        this.element('title', '.modal-title, .dialog-title, h2');
        this.element('body', '.modal-body, .dialog-body, .content');
        this.element('closeButton', '.close, .modal-close, [aria-label="Close"]');
        this.element('confirmButton', '.confirm, .ok, button[type="submit"]');
        this.element('cancelButton', '.cancel, button[type="button"]:not(.confirm)');
        this.element('overlay', '.modal-overlay, .backdrop');
    }
    // Complexity: O(1)
    async close() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.$('closeButton').click();
    }
    // Complexity: O(1)
    async confirm() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.$('confirmButton').click();
    }
    // Complexity: O(1)
    async cancel() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.$('cancelButton').click();
    }
    // Complexity: O(1)
    async getTitle() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        return await this.$('title').getText();
    }
    // Complexity: O(1)
    async getBody() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        return await this.$('body').getText();
    }
}
exports.ModalComponent = ModalComponent;
/**
 * Form Component
 */
class FormComponent extends BaseComponent {
    constructor(rootLocator = { type: 'css', value: 'form' }, options) {
        super(rootLocator, { ...options, type: 'form' });
        this.initElements();
    }
    // Complexity: O(1)
    initElements() {
        this.element('submitButton', 'button[type="submit"], input[type="submit"]');
        this.element('resetButton', 'button[type="reset"], input[type="reset"]');
    }
    // Complexity: O(1)
    async fillField(name, value) {
        if (!this.page)
            throw new Error('Page not set');
        // SAFETY: async operation — wrap in try-catch for production resilience
        const root = await this.findRoot();
        // SAFETY: async operation — wrap in try-catch for production resilience
        await root.locator(`[name="${name}"], #${name}`).fill(value);
    }
    // Complexity: O(1)
    async selectOption(name, value) {
        if (!this.page)
            throw new Error('Page not set');
        // SAFETY: async operation — wrap in try-catch for production resilience
        const root = await this.findRoot();
        // SAFETY: async operation — wrap in try-catch for production resilience
        await root.locator(`select[name="${name}"], #${name}`).selectOption(value);
    }
    // Complexity: O(1)
    async checkField(name) {
        if (!this.page)
            throw new Error('Page not set');
        // SAFETY: async operation — wrap in try-catch for production resilience
        const root = await this.findRoot();
        // SAFETY: async operation — wrap in try-catch for production resilience
        await root.locator(`input[name="${name}"], #${name}`).check();
    }
    // Complexity: O(1)
    async submit() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.$('submitButton').click();
    }
    // Complexity: O(1)
    async reset() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.$('resetButton').click();
    }
}
exports.FormComponent = FormComponent;
/**
 * Table Component
 */
class TableComponent extends BaseComponent {
    constructor(rootLocator = { type: 'css', value: 'table' }, options) {
        super(rootLocator, { ...options, type: 'table' });
        this.initElements();
    }
    // Complexity: O(1)
    initElements() {
        this.element('header', 'thead');
        this.element('body', 'tbody');
        this.element('footer', 'tfoot');
    }
    // Complexity: O(1)
    async getRowCount() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const root = await this.findRoot();
        // SAFETY: async operation — wrap in try-catch for production resilience
        return await root.locator('tbody tr').count();
    }
    // Complexity: O(1)
    async getColumnCount() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const root = await this.findRoot();
        // SAFETY: async operation — wrap in try-catch for production resilience
        return await root.locator('thead th, thead td').count();
    }
    // Complexity: O(1)
    async getCell(row, col) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const root = await this.findRoot();
        const cell = root.locator(`tbody tr:nth-child(${row}) td:nth-child(${col})`);
        // SAFETY: async operation — wrap in try-catch for production resilience
        return (await cell.textContent()) ?? '';
    }
    // Complexity: O(N) — loop
    async getRow(index) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const root = await this.findRoot();
        const cells = root.locator(`tbody tr:nth-child(${index}) td`);
        // SAFETY: async operation — wrap in try-catch for production resilience
        const count = await cells.count();
        const values = [];
        for (let i = 0; i < count; i++) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            values.push((await cells.nth(i).textContent()) ?? '');
        }
        return values;
    }
    // Complexity: O(N) — loop
    async getColumn(index) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const root = await this.findRoot();
        const cells = root.locator(`tbody tr td:nth-child(${index})`);
        // SAFETY: async operation — wrap in try-catch for production resilience
        const count = await cells.count();
        const values = [];
        for (let i = 0; i < count; i++) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            values.push((await cells.nth(i).textContent()) ?? '');
        }
        return values;
    }
    // Complexity: O(1)
    async clickRow(index) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const root = await this.findRoot();
        // SAFETY: async operation — wrap in try-catch for production resilience
        await root.locator(`tbody tr:nth-child(${index})`).click();
    }
    // Complexity: O(N) — loop
    async getHeaders() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const root = await this.findRoot();
        const headers = root.locator('thead th');
        // SAFETY: async operation — wrap in try-catch for production resilience
        const count = await headers.count();
        const values = [];
        for (let i = 0; i < count; i++) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            values.push((await headers.nth(i).textContent()) ?? '');
        }
        return values;
    }
}
exports.TableComponent = TableComponent;
/**
 * Dropdown/Select Component
 */
class DropdownComponent extends BaseComponent {
    constructor(rootLocator = { type: 'css', value: '.dropdown, .select, select' }, options) {
        super(rootLocator, { ...options, type: 'dropdown' });
        this.initElements();
    }
    // Complexity: O(1)
    initElements() {
        this.element('trigger', '.dropdown-trigger, .select-trigger, button');
        this.element('menu', '.dropdown-menu, .select-menu, ul');
        this.element('options', '.option, li, option');
    }
    // Complexity: O(1)
    async open() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const visible = await this.isMenuVisible();
        if (!visible) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.$('trigger').click();
        }
    }
    // Complexity: O(1)
    async close() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const visible = await this.isMenuVisible();
        if (visible) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.$('trigger').click();
        }
    }
    // Complexity: O(1)
    async isMenuVisible() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        return await this.$('menu').isVisible();
    }
    // Complexity: O(1)
    async selectByText(text) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.open();
        // SAFETY: async operation — wrap in try-catch for production resilience
        const root = await this.findRoot();
        // SAFETY: async operation — wrap in try-catch for production resilience
        await root.locator(`text=${text}`).click();
    }
    // Complexity: O(1)
    async selectByIndex(index) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.open();
        // SAFETY: async operation — wrap in try-catch for production resilience
        const root = await this.findRoot();
        // SAFETY: async operation — wrap in try-catch for production resilience
        await root.locator('.option, li, option').nth(index).click();
    }
    // Complexity: O(N) — loop
    async getOptions() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const root = await this.findRoot();
        const options = root.locator('.option, li, option');
        // SAFETY: async operation — wrap in try-catch for production resilience
        const count = await options.count();
        const values = [];
        for (let i = 0; i < count; i++) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            values.push((await options.nth(i).textContent()) ?? '');
        }
        return values;
    }
    // Complexity: O(1)
    async getSelectedValue() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        return await this.$('trigger').getText();
    }
}
exports.DropdownComponent = DropdownComponent;
exports.default = BaseComponent;
