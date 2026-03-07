"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🧠 QANTUM HYBRID v26.0 - BasePage
 * Enterprise POM (Page Object Model) base class
 * Ported from: training-framework/architecture/pom-base.js
 * ═══════════════════════════════════════════════════════════════════════════════
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BasePage = void 0;
const events_1 = require("events");
const BaseElement_1 = require("./BaseElement");
// ═══════════════════════════════════════════════════════════════════════════════
// BASE PAGE CLASS
// ═══════════════════════════════════════════════════════════════════════════════
class BasePage extends events_1.EventEmitter {
    page;
    context;
    elements = new Map();
    components = new Map();
    actions = new Map();
    metadata;
    options;
    initialized = false;
    constructor(metadata = {}, options = {}) {
        super();
        this.metadata = {
            name: metadata.name ?? 'UnnamedPage',
            url: metadata.url ?? '/',
            description: metadata.description,
            version: metadata.version,
        };
        this.options = {
            baseUrl: options.baseUrl ?? '',
            timeout: options.timeout ?? 30000,
            waitForLoad: options.waitForLoad ?? true,
            loadStrategy: options.loadStrategy ?? 'domcontentloaded',
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
        this.context = page.context();
        // Update all elements with page reference
        for (const element of this.elements.values()) {
            element.setPage(page);
        }
        // Update all components with page reference
        for (const component of this.components.values()) {
            component.setPage(page);
        }
        this.initialized = true;
        this.emit('pageSet', { page, metadata: this.metadata });
        return this;
    }
    /**
     * Navigate to page URL
     */
    // Complexity: O(1)
    async navigate(path) {
        if (!this.page) {
            throw new Error('Page not set. Call setPage() first.');
        }
        const url = path ?? this.metadata.url;
        const fullUrl = this.options.baseUrl ? `${this.options.baseUrl}${url}` : url;
        this.emit('navigating', { url: fullUrl });
        // SAFETY: async operation — wrap in try-catch for production resilience
        const response = await this.page.goto(fullUrl, {
            timeout: this.options.timeout,
            waitUntil: this.options.loadStrategy,
        });
        if (this.options.waitForLoad) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.waitForLoad();
        }
        this.emit('navigated', { url: fullUrl, response });
        return response;
    }
    /**
     * Wait for page to load
     */
    // Complexity: O(1)
    async waitForLoad() {
        if (!this.page)
            return;
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.page.waitForLoadState(this.options.loadStrategy);
        this.emit('loaded');
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // ELEMENT MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Define an element on the page
     */
    // Complexity: O(1) — lookup
    element(name, locator, options = {}) {
        const strategy = typeof locator === 'string'
            ? { type: 'css', value: locator }
            : locator;
        const element = new BaseElement_1.BaseElement(strategy, {
            ...options,
            name,
        });
        if (this.page) {
            element.setPage(this.page);
        }
        this.elements.set(name, element);
        return element;
    }
    /**
     * Get element by name (shorthand)
     */
    $(name) {
        const element = this.elements.get(name);
        if (!element) {
            throw new Error(`Element not found: ${name}. Available: ${Array.from(this.elements.keys()).join(', ')}`);
        }
        return element;
    }
    /**
     * Get element by name (alias)
     */
    // Complexity: O(1)
    getElement(name) {
        return this.$(name);
    }
    /**
     * Check if element exists in definition
     */
    // Complexity: O(1) — lookup
    hasElement(name) {
        return this.elements.has(name);
    }
    /**
     * Get all element names
     */
    // Complexity: O(1)
    getElementNames() {
        return Array.from(this.elements.keys());
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // COMPONENT MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Define a component on the page
     */
    component(name, ComponentClass, rootLocator, options) {
        const strategy = typeof rootLocator === 'string'
            ? { type: 'css', value: rootLocator }
            : rootLocator;
        const comp = new ComponentClass(strategy, { ...options, name });
        if (this.page) {
            comp.setPage(this.page);
        }
        this.components.set(name, comp);
        return comp;
    }
    /**
     * Get component by name
     */
    getComponent(name) {
        const comp = this.components.get(name);
        if (!comp) {
            throw new Error(`Component not found: ${name}. Available: ${Array.from(this.components.keys()).join(', ')}`);
        }
        return comp;
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // ACTION MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Define a page action
     */
    // Complexity: O(1) — lookup
    action(name, fn, description) {
        this.actions.set(name, { name, fn, description });
        return this;
    }
    /**
     * Execute a page action
     */
    // Complexity: O(1) — lookup
    async execute(name, params) {
        const action = this.actions.get(name);
        if (!action) {
            throw new Error(`Action not found: ${name}. Available: ${Array.from(this.actions.keys()).join(', ')}`);
        }
        this.emit('actionStart', { name, params });
        try {
            await action.fn(this, params);
            this.emit('actionComplete', { name, params });
        }
        catch (error) {
            this.emit('actionError', { name, params, error });
            throw error;
        }
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // PAGE UTILITIES
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Get current URL
     */
    // Complexity: O(1)
    async getUrl() {
        if (!this.page)
            throw new Error('Page not set');
        return this.page.url();
    }
    /**
     * Get page title
     */
    // Complexity: O(1)
    async getTitle() {
        if (!this.page)
            throw new Error('Page not set');
        // SAFETY: async operation — wrap in try-catch for production resilience
        return await this.page.title();
    }
    /**
     * Take screenshot
     */
    // Complexity: O(1)
    async screenshot(options) {
        if (!this.page)
            throw new Error('Page not set');
        // SAFETY: async operation — wrap in try-catch for production resilience
        return await this.page.screenshot(options);
    }
    /**
     * Execute script in page context
     */
    async evaluate(script, arg) {
        if (!this.page)
            throw new Error('Page not set');
        // SAFETY: async operation — wrap in try-catch for production resilience
        return await this.page.evaluate(script, arg);
    }
    /**
     * Wait for network idle
     */
    // Complexity: O(1)
    async waitForNetworkIdle(timeout) {
        if (!this.page)
            return;
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.page.waitForLoadState('networkidle', { timeout });
    }
    /**
     * Wait for selector
     */
    // Complexity: O(1)
    async waitForSelector(selector, options) {
        if (!this.page)
            return;
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.page.waitForSelector(selector, options);
    }
    /**
     * Wait for navigation
     */
    // Complexity: O(1)
    async waitForNavigation(options) {
        if (!this.page)
            return;
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.page.waitForURL(options?.url ?? '**/*', { timeout: options?.timeout });
    }
    /**
     * Reload page
     */
    // Complexity: O(1)
    async reload() {
        if (!this.page)
            throw new Error('Page not set');
        // SAFETY: async operation — wrap in try-catch for production resilience
        const response = await this.page.reload({
            timeout: this.options.timeout,
            waitUntil: this.options.loadStrategy,
        });
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.waitForLoad();
        return response;
    }
    /**
     * Go back
     */
    // Complexity: O(1)
    async goBack() {
        if (!this.page)
            throw new Error('Page not set');
        // SAFETY: async operation — wrap in try-catch for production resilience
        return await this.page.goBack({ timeout: this.options.timeout });
    }
    /**
     * Go forward
     */
    // Complexity: O(1)
    async goForward() {
        if (!this.page)
            throw new Error('Page not set');
        // SAFETY: async operation — wrap in try-catch for production resilience
        return await this.page.goForward({ timeout: this.options.timeout });
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // FRAME HANDLING
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Get frame by name or URL
     */
    // Complexity: O(N) — linear scan
    frame(nameOrUrl) {
        if (!this.page)
            return null;
        const frame = typeof nameOrUrl === 'string'
            ? this.page.frame(nameOrUrl)
            : this.page.frames().find(f => nameOrUrl.test(f.url()));
        if (!frame)
            return null;
        // Create new BasePage instance for frame
        const framePage = new BasePage({
            name: `Frame:${frame.name() || frame.url()}`,
            url: frame.url(),
        }, this.options);
        // Frames can't be directly set as Page, but we can access via locator
        // Return proxy that works with frame
        return framePage;
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // DIALOG HANDLING
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Handle dialogs
     */
    // Complexity: O(1)
    onDialog(handler) {
        if (!this.page)
            return;
        this.page.on('dialog', async (dialog) => {
            // Complexity: O(1)
            handler({
                type: dialog.type(),
                message: dialog.message(),
                // SAFETY: async operation — wrap in try-catch for production resilience
                accept: async (text) => await dialog.accept(text),
                // SAFETY: async operation — wrap in try-catch for production resilience
                dismiss: async () => await dialog.dismiss(),
            });
        });
    }
    /**
     * Auto-accept dialogs
     */
    // Complexity: O(1)
    autoAcceptDialogs() {
        this.onDialog(async (dialog) => {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await dialog.accept();
        });
    }
    /**
     * Auto-dismiss dialogs
     */
    // Complexity: O(1)
    autoDismissDialogs() {
        this.onDialog(async (dialog) => {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await dialog.dismiss();
        });
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // STATE INFO
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Get page state summary
     */
    // Complexity: O(1)
    getState() {
        return {
            metadata: this.metadata,
            initialized: this.initialized,
            elementCount: this.elements.size,
            componentCount: this.components.size,
            actionCount: this.actions.size,
            elements: Array.from(this.elements.keys()),
            components: Array.from(this.components.keys()),
            actions: Array.from(this.actions.keys()),
        };
    }
    /**
     * Get underlying Playwright page
     */
    // Complexity: O(1)
    getPlaywrightPage() {
        if (!this.page) {
            throw new Error('Page not set');
        }
        return this.page;
    }
}
exports.BasePage = BasePage;
exports.default = BasePage;
