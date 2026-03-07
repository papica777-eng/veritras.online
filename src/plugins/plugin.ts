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

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Plugin metadata
 */
export interface PluginMetadata {
    name: string;
    version: string;
    description?: string;
    author?: string;
    license?: string;
    homepage?: string;
    repository?: string;
    keywords?: string[];
    dependencies?: { [name: string]: string };
}

/**
 * Plugin lifecycle hooks
 */
export interface PluginHooks {
    /** Called when plugin is registered */
    onRegister?(context: PluginContext): void | Promise<void>;

    /** Called when plugin is initialized */
    onInit?(context: PluginContext): void | Promise<void>;

    /** Called before each test */
    beforeTest?(context: TestContext): void | Promise<void>;

    /** Called after each test */
    afterTest?(context: TestContext): void | Promise<void>;

    /** Called before each suite */
    beforeSuite?(context: SuiteContext): void | Promise<void>;

    /** Called after each suite */
    afterSuite?(context: SuiteContext): void | Promise<void>;

    /** Called before all tests */
    beforeAll?(context: PluginContext): void | Promise<void>;

    /** Called after all tests */
    afterAll?(context: PluginContext, results: TestResults): void | Promise<void>;

    /** Called on error */
    onError?(error: Error, context: PluginContext): void | Promise<void>;

    /** Called when plugin is destroyed */
    onDestroy?(context: PluginContext): void | Promise<void>;
}

/**
 * Plugin interface
 */
export interface Plugin extends PluginHooks {
    metadata: PluginMetadata;
    config?: any;
}

/**
 * Plugin context
 */
export interface PluginContext {
    /** Plugin manager instance */
    manager: PluginManager;

    /** Configuration */
    config: any;

    /** Logger */
    log: PluginLogger;

    /** Storage for plugin data */
    storage: Map<string, any>;

    /** Get other plugin */
    getPlugin<T extends Plugin>(name: string): T | undefined;

    /** Emit event */
    // Complexity: O(1)
    emit(event: string, data?: any): void;

    /** Listen to event */
    // Complexity: O(1)
    on(event: string, handler: (data: any) => void): () => void;
}

/**
 * Test context
 */
export interface TestContext {
    name: string;
    suite?: string;
    file?: string;
    timeout: number;
    metadata: Map<string, any>;
}

/**
 * Suite context
 */
export interface SuiteContext {
    name: string;
    file?: string;
    tests: string[];
    metadata: Map<string, any>;
}

/**
 * Test results
 */
export interface TestResults {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    duration: number;
    failures: Array<{
        name: string;
        error: Error;
        duration: number;
    }>;
}

/**
 * Plugin logger
 */
export interface PluginLogger {
    // Complexity: O(1)
    debug(...args: any[]): void;
    // Complexity: O(1)
    info(...args: any[]): void;
    // Complexity: O(1)
    warn(...args: any[]): void;
    // Complexity: O(1)
    error(...args: any[]): void;
}

/**
 * Plugin definition (for factory function)
 */
export type PluginFactory = (config?: any) => Plugin;

// ═══════════════════════════════════════════════════════════════════════════════
// PLUGIN MANAGER
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Plugin Manager
 */
export class PluginManager {
    private plugins: Map<string, Plugin> = new Map();
    private initialized: Set<string> = new Set();
    private eventHandlers: Map<string, Array<(data: any) => void>> = new Map();
    private storage: Map<string, Map<string, any>> = new Map();

    /**
     * Register a plugin
     */
    // Complexity: O(N) — loop
    async register(plugin: Plugin | PluginFactory, config?: any): Promise<void> {
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
    async init(): Promise<void> {
        for (const [name, plugin] of this.plugins) {
            if (this.initialized.has(name)) continue;

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
    get<T extends Plugin>(name: string): T | undefined {
        return this.plugins.get(name) as T | undefined;
    }

    /**
     * Check if plugin is registered
     */
    // Complexity: O(1) — lookup
    has(name: string): boolean {
        return this.plugins.has(name);
    }

    /**
     * Get all plugins
     */
    // Complexity: O(1)
    getAll(): Plugin[] {
        return Array.from(this.plugins.values());
    }

    /**
     * Unregister a plugin
     */
    // Complexity: O(N) — loop
    async unregister(name: string): Promise<void> {
        const plugin = this.plugins.get(name);
        if (!plugin) return;

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
    async beforeAll(): Promise<void> {
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
    async afterAll(results: TestResults): Promise<void> {
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
    async beforeSuite(context: SuiteContext): Promise<void> {
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
    async afterSuite(context: SuiteContext): Promise<void> {
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
    async beforeTest(context: TestContext): Promise<void> {
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
    async afterTest(context: TestContext): Promise<void> {
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
    async onError(error: Error): Promise<void> {
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
    emit(event: string, data?: any): void {
        const handlers = this.eventHandlers.get(event) || [];
        for (const handler of handlers) {
            try {
                // Complexity: O(1)
                handler(data);
            } catch (error) {
                console.error(`Error in event handler for '${event}':`, error);
            }
        }
    }

    /**
     * Subscribe to event
     */
    // Complexity: O(1) — lookup
    on(event: string, handler: (data: any) => void): () => void {
        if (!this.eventHandlers.has(event)) {
            this.eventHandlers.set(event, []);
        }
        this.eventHandlers.get(event)!.push(handler);

        return () => {
            const handlers = this.eventHandlers.get(event);
            if (handlers) {
                const index = handlers.indexOf(handler);
                if (index >= 0) handlers.splice(index, 1);
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
    private createContext(pluginName: string): PluginContext {
        const plugin = this.plugins.get(pluginName);
        const storage = this.storage.get(pluginName) || new Map();

        return {
            manager: this,
            config: plugin?.config || {},
            log: this.createLogger(pluginName),
            storage,
            getPlugin: <T extends Plugin>(name: string) => this.get<T>(name),
            emit: (event: string, data?: any) => this.emit(event, data),
            on: (event: string, handler: (data: any) => void) => this.on(event, handler)
        };
    }

    /**
     * Create plugin logger
     */
    // Complexity: O(1)
    private createLogger(pluginName: string): PluginLogger {
        const prefix = `[${pluginName}]`;
        return {
            debug: (...args: any[]) => console.debug(prefix, ...args),
            info: (...args: any[]) => console.info(prefix, ...args),
            warn: (...args: any[]) => console.warn(prefix, ...args),
            error: (...args: any[]) => console.error(prefix, ...args)
        };
    }

    /**
     * Internal log
     */
    // Complexity: O(1)
    private log(message: string): void {
        console.debug('[PluginManager]', message);
    }

    /**
     * Destroy all plugins
     */
    // Complexity: O(N) — loop
    async destroy(): Promise<void> {
        for (const name of Array.from(this.plugins.keys()).reverse()) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.unregister(name);
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// PLUGIN BUILDER
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Fluent plugin builder
 */
export class PluginBuilder {
    private plugin: Partial<Plugin> = {
        metadata: {
//             name: ',
//             version: '1.0.0'
        }
    };

    static create(name: string): PluginBuilder {
        const builder = new PluginBuilder();
        builder.plugin.metadata!.name = name;
        return builder;
    }

    // Complexity: O(1)
    version(version: string): this {
        this.plugin.metadata!.version = version;
        return this;
    }

    // Complexity: O(1)
    description(desc: string): this {
        this.plugin.metadata!.description = desc;
        return this;
    }

    // Complexity: O(1)
    author(author: string): this {
        this.plugin.metadata!.author = author;
        return this;
    }

    // Complexity: O(1)
    license(license: string): this {
        this.plugin.metadata!.license = license;
        return this;
    }

    // Complexity: O(1)
    keywords(...keywords: string[]): this {
        this.plugin.metadata!.keywords = keywords;
        return this;
    }

    // Complexity: O(1)
    depends(name: string, version: string = '*'): this {
        this.plugin.metadata!.dependencies = this.plugin.metadata!.dependencies || {};
        this.plugin.metadata!.dependencies[name] = version;
        return this;
    }

    // Complexity: O(1)
    config(config: any): this {
        this.plugin.config = config;
        return this;
    }

    // Complexity: O(1)
    onRegister(hook: PluginHooks['onRegister']): this {
        this.plugin.onRegister = hook;
        return this;
    }

    // Complexity: O(1)
    onInit(hook: PluginHooks['onInit']): this {
        this.plugin.onInit = hook;
        return this;
    }

    // Complexity: O(1)
    beforeTest(hook: PluginHooks['beforeTest']): this {
        this.plugin.beforeTest = hook;
        return this;
    }

    // Complexity: O(1)
    afterTest(hook: PluginHooks['afterTest']): this {
        this.plugin.afterTest = hook;
        return this;
    }

    // Complexity: O(1)
    beforeSuite(hook: PluginHooks['beforeSuite']): this {
        this.plugin.beforeSuite = hook;
        return this;
    }

    // Complexity: O(1)
    afterSuite(hook: PluginHooks['afterSuite']): this {
        this.plugin.afterSuite = hook;
        return this;
    }

    // Complexity: O(1)
    beforeAll(hook: PluginHooks['beforeAll']): this {
        this.plugin.beforeAll = hook;
        return this;
    }

    // Complexity: O(1)
    afterAll(hook: PluginHooks['afterAll']): this {
        this.plugin.afterAll = hook;
        return this;
    }

    // Complexity: O(1)
    onError(hook: PluginHooks['onError']): this {
        this.plugin.onError = hook;
        return this;
    }

    // Complexity: O(1)
    onDestroy(hook: PluginHooks['onDestroy']): this {
        this.plugin.onDestroy = hook;
        return this;
    }

    // Complexity: O(1)
    build(): Plugin {
        if (!this.plugin.metadata?.name) {
            throw new Error('Plugin name is required');
        }
        return this.plugin as Plugin;
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// BUILT-IN PLUGINS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Timer plugin - tracks test duration
 */
export const TimerPlugin: PluginFactory = () =>
    PluginBuilder.create('timer')
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

/**
 * Retry plugin - retries failed tests
 */
export const RetryPlugin: PluginFactory = (config?: { maxRetries?: number }) =>
    PluginBuilder.create('retry')
        .version('1.0.0')
        .description('Retries failed tests')
        .config({ maxRetries: config?.maxRetries || 3 })
        .onInit((ctx) => {
            ctx.storage.set('retries', new Map());
        })
        .build();

/**
 * Console reporter plugin
 */
export const ConsoleReporterPlugin: PluginFactory = () =>
    PluginBuilder.create('console-reporter')
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

/**
 * Screenshot plugin
 */
export const ScreenshotPlugin: PluginFactory = (config?: { onFailure?: boolean }) =>
    PluginBuilder.create('screenshot')
        .version('1.0.0')
        .description('Captures screenshots')
        .config({ onFailure: config?.onFailure ?? true })
        .build();
