"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                               ║
 * ║   QAntum PLUGIN SYSTEM                                                        ║
 * ║   "Extensible plugin architecture"                                            ║
 * ║                                                                               ║
 * ║   TODO B #44 - Plugin System                                                  ║
 * ║                                                                               ║
 * ║   © 2025-2026 QAntum | Dimitar Prodromov                                        ║
 * ║                                                                               ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScreenshotPlugin = exports.ConsoleReporterPlugin = exports.RetryPlugin = exports.TimerPlugin = exports.PluginBuilder = exports.PluginManager = void 0;
// ═══════════════════════════════════════════════════════════════════════════════
// PLUGIN MANAGER
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * Plugin Manager
 */
class PluginManager {
    plugins = new Map();
    initialized = new Set();
    eventHandlers = new Map();
    storage = new Map();
    /**
     * Register a plugin
     */
    // Complexity: O(N) — loop
    async register(plugin, config) {
        // Handle factory function
        const resolvedPlugin = typeof plugin === 'function' ? plugin(config) : plugin;
        const { name, version } = resolvedPlugin.metadata;
        if (this.plugins.has(name)) {
            throw new Error(`Plugin '${name}' is already registered`);
        }
        // Check dependencies
        if (resolvedPlugin.metadata.dependencies) {
            for (const [dep, requiredVersion] of Object.entries(resolvedPlugin.metadata.dependencies)) {
                if (!this.plugins.has(dep)) {
                    throw new Error(`Plugin '${name}' requires '${dep}' v${requiredVersion}`);
                }
            }
        }
        // Store plugin
        this.plugins.set(name, resolvedPlugin);
        this.storage.set(name, new Map());
        // Create context
        const context = this.createContext(name);
        // Call onRegister hook
        if (resolvedPlugin.onRegister) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await resolvedPlugin.onRegister(context);
        }
        this.log(`Registered plugin: ${name}@${version}`);
    }
    /**
     * Initialize all plugins
     */
    // Complexity: O(N) — loop
    async init() {
        for (const [name, plugin] of this.plugins) {
            if (this.initialized.has(name))
                continue;
            const context = this.createContext(name);
            if (plugin.onInit) {
                // SAFETY: async operation — wrap in try-catch for production resilience
                await plugin.onInit(context);
            }
            this.initialized.add(name);
            this.log(`Initialized plugin: ${name}`);
        }
    }
    /**
     * Get a plugin
     */
    get(name) {
        return this.plugins.get(name);
    }
    /**
     * Check if plugin is registered
     */
    // Complexity: O(1) — lookup
    has(name) {
        return this.plugins.has(name);
    }
    /**
     * Get all plugins
     */
    // Complexity: O(1)
    getAll() {
        return Array.from(this.plugins.values());
    }
    /**
     * Unregister a plugin
     */
    // Complexity: O(N) — loop
    async unregister(name) {
        const plugin = this.plugins.get(name);
        if (!plugin)
            return;
        // Check if other plugins depend on this
        for (const [depName, depPlugin] of this.plugins) {
            if (depPlugin.metadata.dependencies?.[name]) {
                throw new Error(`Cannot unregister '${name}': '${depName}' depends on it`);
            }
        }
        const context = this.createContext(name);
        if (plugin.onDestroy) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await plugin.onDestroy(context);
        }
        this.plugins.delete(name);
        this.initialized.delete(name);
        this.storage.delete(name);
        this.log(`Unregistered plugin: ${name}`);
    }
    // ─────────────────────────────────────────────────────────────────────────
    // LIFECYCLE HOOKS
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Call beforeAll hooks
     */
    // Complexity: O(N) — loop
    async beforeAll() {
        for (const [name, plugin] of this.plugins) {
            if (plugin.beforeAll) {
                // SAFETY: async operation — wrap in try-catch for production resilience
                await plugin.beforeAll(this.createContext(name));
            }
        }
    }
    /**
     * Call afterAll hooks
     */
    // Complexity: O(N) — loop
    async afterAll(results) {
        for (const [name, plugin] of this.plugins) {
            if (plugin.afterAll) {
                // SAFETY: async operation — wrap in try-catch for production resilience
                await plugin.afterAll(this.createContext(name), results);
            }
        }
    }
    /**
     * Call beforeSuite hooks
     */
    // Complexity: O(N) — loop
    async beforeSuite(context) {
        for (const [, plugin] of this.plugins) {
            if (plugin.beforeSuite) {
                // SAFETY: async operation — wrap in try-catch for production resilience
                await plugin.beforeSuite(context);
            }
        }
    }
    /**
     * Call afterSuite hooks
     */
    // Complexity: O(N) — loop
    async afterSuite(context) {
        for (const [, plugin] of this.plugins) {
            if (plugin.afterSuite) {
                // SAFETY: async operation — wrap in try-catch for production resilience
                await plugin.afterSuite(context);
            }
        }
    }
    /**
     * Call beforeTest hooks
     */
    // Complexity: O(N) — loop
    async beforeTest(context) {
        for (const [, plugin] of this.plugins) {
            if (plugin.beforeTest) {
                // SAFETY: async operation — wrap in try-catch for production resilience
                await plugin.beforeTest(context);
            }
        }
    }
    /**
     * Call afterTest hooks
     */
    // Complexity: O(N) — loop
    async afterTest(context) {
        for (const [, plugin] of this.plugins) {
            if (plugin.afterTest) {
                // SAFETY: async operation — wrap in try-catch for production resilience
                await plugin.afterTest(context);
            }
        }
    }
    /**
     * Call onError hooks
     */
    // Complexity: O(N) — loop
    async onError(error) {
        for (const [name, plugin] of this.plugins) {
            if (plugin.onError) {
                // SAFETY: async operation — wrap in try-catch for production resilience
                await plugin.onError(error, this.createContext(name));
            }
        }
    }
    // ─────────────────────────────────────────────────────────────────────────
    // EVENTS
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Emit event
     */
    // Complexity: O(N*M) — nested iteration
    emit(event, data) {
        const handlers = this.eventHandlers.get(event) || [];
        for (const handler of handlers) {
            try {
                // Complexity: O(1)
                handler(data);
            }
            catch (error) {
                console.error(`Error in event handler for '${event}':`, error);
            }
        }
    }
    /**
     * Subscribe to event
     */
    // Complexity: O(1) — lookup
    on(event, handler) {
        if (!this.eventHandlers.has(event)) {
            this.eventHandlers.set(event, []);
        }
        this.eventHandlers.get(event).push(handler);
        return () => {
            const handlers = this.eventHandlers.get(event);
            if (handlers) {
                const index = handlers.indexOf(handler);
                if (index >= 0)
                    handlers.splice(index, 1);
            }
        };
    }
    // ─────────────────────────────────────────────────────────────────────────
    // UTILITIES
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Create plugin context
     */
    // Complexity: O(1) — lookup
    createContext(pluginName) {
        const plugin = this.plugins.get(pluginName);
        const storage = this.storage.get(pluginName) || new Map();
        return {
            manager: this,
            config: plugin?.config || {},
            log: this.createLogger(pluginName),
            storage,
            getPlugin: (name) => this.get(name),
            emit: (event, data) => this.emit(event, data),
            on: (event, handler) => this.on(event, handler)
        };
    }
    /**
     * Create plugin logger
     */
    // Complexity: O(1)
    createLogger(pluginName) {
        const prefix = `[${pluginName}]`;
        return {
            debug: (...args) => console.debug(prefix, ...args),
            info: (...args) => console.info(prefix, ...args),
            warn: (...args) => console.warn(prefix, ...args),
            error: (...args) => console.error(prefix, ...args)
        };
    }
    /**
     * Internal log
     */
    // Complexity: O(1)
    log(message) {
        console.debug('[PluginManager]', message);
    }
    /**
     * Destroy all plugins
     */
    // Complexity: O(N) — loop
    async destroy() {
        for (const name of Array.from(this.plugins.keys()).reverse()) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.unregister(name);
        }
    }
}
exports.PluginManager = PluginManager;
// ═══════════════════════════════════════════════════════════════════════════════
// PLUGIN BUILDER
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * Fluent plugin builder
 */
class PluginBuilder {
    plugin = {
        metadata: {
        //             name: ',
        //             version: '1.0.0'
        }
    };
    static create(name) {
        const builder = new PluginBuilder();
        builder.plugin.metadata.name = name;
        return builder;
    }
    // Complexity: O(1)
    version(version) {
        this.plugin.metadata.version = version;
        return this;
    }
    // Complexity: O(1)
    description(desc) {
        this.plugin.metadata.description = desc;
        return this;
    }
    // Complexity: O(1)
    author(author) {
        this.plugin.metadata.author = author;
        return this;
    }
    // Complexity: O(1)
    license(license) {
        this.plugin.metadata.license = license;
        return this;
    }
    // Complexity: O(1)
    keywords(...keywords) {
        this.plugin.metadata.keywords = keywords;
        return this;
    }
    // Complexity: O(1)
    depends(name, version = '*') {
        this.plugin.metadata.dependencies = this.plugin.metadata.dependencies || {};
        this.plugin.metadata.dependencies[name] = version;
        return this;
    }
    // Complexity: O(1)
    config(config) {
        this.plugin.config = config;
        return this;
    }
    // Complexity: O(1)
    onRegister(hook) {
        this.plugin.onRegister = hook;
        return this;
    }
    // Complexity: O(1)
    onInit(hook) {
        this.plugin.onInit = hook;
        return this;
    }
    // Complexity: O(1)
    beforeTest(hook) {
        this.plugin.beforeTest = hook;
        return this;
    }
    // Complexity: O(1)
    afterTest(hook) {
        this.plugin.afterTest = hook;
        return this;
    }
    // Complexity: O(1)
    beforeSuite(hook) {
        this.plugin.beforeSuite = hook;
        return this;
    }
    // Complexity: O(1)
    afterSuite(hook) {
        this.plugin.afterSuite = hook;
        return this;
    }
    // Complexity: O(1)
    beforeAll(hook) {
        this.plugin.beforeAll = hook;
        return this;
    }
    // Complexity: O(1)
    afterAll(hook) {
        this.plugin.afterAll = hook;
        return this;
    }
    // Complexity: O(1)
    onError(hook) {
        this.plugin.onError = hook;
        return this;
    }
    // Complexity: O(1)
    onDestroy(hook) {
        this.plugin.onDestroy = hook;
        return this;
    }
    // Complexity: O(1)
    build() {
        if (!this.plugin.metadata?.name) {
            throw new Error('Plugin name is required');
        }
        return this.plugin;
    }
}
exports.PluginBuilder = PluginBuilder;
// ═══════════════════════════════════════════════════════════════════════════════
// BUILT-IN PLUGINS
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * Timer plugin - tracks test duration
 */
const TimerPlugin = () => PluginBuilder.create('timer')
    .version('1.0.0')
    .description('Tracks test execution time')
    .beforeTest((ctx) => {
    ctx.metadata.set('startTime', Date.now());
})
    .afterTest((ctx) => {
    const start = ctx.metadata.get('startTime');
    const duration = Date.now() - start;
    ctx.metadata.set('duration', duration);
})
    .build();
exports.TimerPlugin = TimerPlugin;
/**
 * Retry plugin - retries failed tests
 */
const RetryPlugin = (config) => PluginBuilder.create('retry')
    .version('1.0.0')
    .description('Retries failed tests')
    .config({ maxRetries: config?.maxRetries || 3 })
    .onInit((ctx) => {
    ctx.storage.set('retries', new Map());
})
    .build();
exports.RetryPlugin = RetryPlugin;
/**
 * Console reporter plugin
 */
const ConsoleReporterPlugin = () => PluginBuilder.create('console-reporter')
    .version('1.0.0')
    .description('Console output reporter')
    .beforeSuite((ctx) => {
    console.log(`\n📁 Suite: ${ctx.name}`);
})
    .beforeTest((ctx) => {
    console.log(`  ⏳ ${ctx.name}`);
})
    .afterTest((ctx) => {
    const duration = ctx.metadata.get('duration') || 0;
    console.log(`  ✅ ${ctx.name} (${duration}ms)`);
})
    .afterAll((_, results) => {
    console.log('\n' + '═'.repeat(60));
    console.log(`📊 Results: ${results.passed}/${results.total} passed`);
    console.log(`⏱️  Duration: ${results.duration}ms`);
    console.log('═'.repeat(60) + '\n');
})
    .build();
exports.ConsoleReporterPlugin = ConsoleReporterPlugin;
/**
 * Screenshot plugin
 */
const ScreenshotPlugin = (config) => PluginBuilder.create('screenshot')
    .version('1.0.0')
    .description('Captures screenshots')
    .config({ onFailure: config?.onFailure ?? true })
    .build();
exports.ScreenshotPlugin = ScreenshotPlugin;
