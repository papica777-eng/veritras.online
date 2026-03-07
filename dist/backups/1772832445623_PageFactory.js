"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🧠 QANTUM HYBRID v1.0.0 - PageFactory
 * Page Object factory and registry
 * Ported from: training-framework/architecture/pom-base.js
 * ═══════════════════════════════════════════════════════════════════════════════
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PageFactory = void 0;
exports.getFactory = getFactory;
exports.getPage = getPage;
exports.definePage = definePage;
exports.definePages = definePages;
exports.RegisterPage = RegisterPage;
exports.RegisterComponent = RegisterComponent;
const BasePage_1 = require("./BasePage");
// ═══════════════════════════════════════════════════════════════════════════════
// PAGE FACTORY
// ═══════════════════════════════════════════════════════════════════════════════
class PageFactory {
    static instance;
    pages = new Map();
    pageInstances = new Map();
    definitions = new Map();
    components = new Map();
    options;
    currentPage;
    currentContext;
    constructor(options = {}) {
        this.options = {
            baseUrl: options.baseUrl ?? '',
            defaultTimeout: options.defaultTimeout ?? 30000,
            autoSetup: options.autoSetup ?? true,
        };
    }
    /**
     * Get singleton instance
     */
    static getInstance(options) {
        if (!PageFactory.instance) {
            PageFactory.instance = new PageFactory(options);
        }
        return PageFactory.instance;
    }
    /**
     * Reset factory (for testing)
     */
    static reset() {
        PageFactory.instance = undefined;
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // REGISTRATION
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Register a page class
     */
    register(name, PageClass) {
        this.pages.set(name, PageClass);
        return this;
    }
    /**
     * Register page from definition (JSON/object)
     */
    // Complexity: O(1) — lookup
    registerDefinition(definition) {
        this.definitions.set(definition.name, definition);
        return this;
    }
    /**
     * Register multiple definitions
     */
    // Complexity: O(N) — loop
    registerDefinitions(definitions) {
        for (const def of definitions) {
            this.registerDefinition(def);
        }
        return this;
    }
    /**
     * Register a component class
     */
    registerComponent(name, ComponentClass) {
        this.components.set(name, ComponentClass);
        return this;
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // PAGE CREATION
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Get or create page instance
     */
    get(name) {
        // Check if already instantiated
        let instance = this.pageInstances.get(name);
        if (!instance) {
            instance = this.create(name);
            this.pageInstances.set(name, instance);
        }
        // Update with current page if available
        if (this.currentPage) {
            instance.setPage(this.currentPage);
        }
        return instance;
    }
    /**
     * Create new page instance (always new)
     */
    create(name) {
        // Try registered class first
        const PageClass = this.pages.get(name);
        if (PageClass) {
            const instance = new PageClass({ name }, { baseUrl: this.options.baseUrl, timeout: this.options.defaultTimeout });
            if (this.currentPage) {
                instance.setPage(this.currentPage);
            }
            return instance;
        }
        // Try definition
        const definition = this.definitions.get(name);
        if (definition) {
            return this.createFromDefinition(definition);
        }
        throw new Error(`Page not registered: ${name}. Available: ${this.getRegisteredPages().join(', ')}`);
    }
    /**
     * Create page from definition
     */
    createFromDefinition(definition) {
        const page = new BasePage_1.BasePage({ name: definition.name, url: definition.url ?? '/' }, {
            ...definition.options,
            baseUrl: definition.options?.baseUrl ?? this.options.baseUrl,
            timeout: definition.options?.timeout ?? this.options.defaultTimeout,
        });
        // Add elements
        if (definition.elements) {
            for (const [name, config] of Object.entries(definition.elements)) {
                if (typeof config === 'string') {
                    page.element(name, config);
                }
                else if ('locator' in config) {
                    page.element(name, config.locator, config.options);
                }
                else {
                    page.element(name, config);
                }
            }
        }
        // Add components
        if (definition.components) {
            for (const [name, config] of Object.entries(definition.components)) {
                const ComponentClass = this.components.get(config.type);
                if (ComponentClass) {
                    const locator = typeof config.root === 'string'
                        ? { type: 'css', value: config.root }
                        : config.root;
                    page.component(name, ComponentClass, locator, config.options);
                }
            }
        }
        // Add actions
        if (definition.actions) {
            for (const [name, fn] of Object.entries(definition.actions)) {
                page.action(name, fn);
            }
        }
        // Run setup
        if (definition.setup && this.options.autoSetup) {
            definition.setup(page);
        }
        // Set current page
        if (this.currentPage) {
            page.setPage(this.currentPage);
        }
        return page;
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // PLAYWRIGHT INTEGRATION
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Set current Playwright page
     */
    // Complexity: O(N) — loop
    setPage(page) {
        this.currentPage = page;
        this.currentContext = page.context();
        // Update all existing instances
        for (const instance of this.pageInstances.values()) {
            instance.setPage(page);
        }
        return this;
    }
    /**
     * Get current Playwright page
     */
    // Complexity: O(1)
    getPlaywrightPage() {
        return this.currentPage;
    }
    /**
     * Set browser context
     */
    // Complexity: O(1)
    setContext(context) {
        this.currentContext = context;
        return this;
    }
    /**
     * Create new page in context
     */
    // Complexity: O(1)
    async newPage() {
        if (!this.currentContext) {
            throw new Error('Browser context not set. Call setContext() first.');
        }
        // SAFETY: async operation — wrap in try-catch for production resilience
        const page = await this.currentContext.newPage();
        this.setPage(page);
        return page;
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // UTILITIES
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Get all registered page names
     */
    // Complexity: O(1)
    getRegisteredPages() {
        return [
            ...this.pages.keys(),
            ...this.definitions.keys(),
        ];
    }
    /**
     * Get all registered component names
     */
    // Complexity: O(1)
    getRegisteredComponents() {
        return [...this.components.keys()];
    }
    /**
     * Check if page is registered
     */
    // Complexity: O(1) — lookup
    hasPage(name) {
        return this.pages.has(name) || this.definitions.has(name);
    }
    /**
     * Check if component is registered
     */
    // Complexity: O(1) — lookup
    hasComponent(name) {
        return this.components.has(name);
    }
    /**
     * Clear all page instances (keeps registrations)
     */
    // Complexity: O(1)
    clearInstances() {
        this.pageInstances.clear();
        return this;
    }
    /**
     * Clear everything
     */
    // Complexity: O(1)
    clear() {
        this.pages.clear();
        this.pageInstances.clear();
        this.definitions.clear();
        this.components.clear();
        return this;
    }
    /**
     * Update factory options
     */
    // Complexity: O(1)
    configure(options) {
        Object.assign(this.options, options);
        return this;
    }
    /**
     * Get factory state
     */
    // Complexity: O(1)
    getState() {
        return {
            pageCount: this.pages.size,
            definitionCount: this.definitions.size,
            componentCount: this.components.size,
            instanceCount: this.pageInstances.size,
            pages: [...this.pages.keys()],
            definitions: [...this.definitions.keys()],
            components: [...this.components.keys()],
            hasCurrentPage: !!this.currentPage,
        };
    }
}
exports.PageFactory = PageFactory;
// ═══════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * Get factory instance (shorthand)
 */
function getFactory(options) {
    return PageFactory.getInstance(options);
}
/**
 * Get page from factory (shorthand)
 */
function getPage(name) {
    return getFactory().get(name);
}
/**
 * Register page definition (shorthand)
 */
function definePage(definition) {
    // Complexity: O(1)
    getFactory().registerDefinition(definition);
}
/**
 * Define multiple pages from JSON
 */
function definePages(definitions) {
    // Complexity: O(1)
    getFactory().registerDefinitions(definitions);
}
// ═══════════════════════════════════════════════════════════════════════════════
// PAGE DECORATOR (for TypeScript classes)
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * Decorator to auto-register page class
 */
function RegisterPage(name) {
    return function (target) {
        // Complexity: O(1)
        getFactory().register(name, target);
        return target;
    };
}
/**
 * Decorator to auto-register component class
 */
function RegisterComponent(name) {
    return function (target) {
        // Complexity: O(1)
        getFactory().registerComponent(name, target);
        return target;
    };
}
exports.default = PageFactory;
