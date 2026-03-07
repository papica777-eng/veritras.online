"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                               ║
 * ║   QANTUM LAZY LOADER                                                          ║
 * ║   "On-demand module loading for better startup"                               ║
 * ║                                                                               ║
 * ║   TODO B #12 - Lazy Loading                                                   ║
 * ║                                                                               ║
 * ║   © 2025-2026 QAntum | Dimitar Prodromov                                        ║
 * ║                                                                               ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
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
exports.getLazyLoader = exports.QAntumModules = exports.LazyLoader = void 0;
exports.lazyFn = lazyFn;
exports.lazyAsync = lazyAsync;
exports.LazyProperty = LazyProperty;
// ═══════════════════════════════════════════════════════════════════════════════
// LAZY MODULE IMPLEMENTATION
// ═══════════════════════════════════════════════════════════════════════════════
class LazyModuleImpl {
    name;
    loader;
    module;
    loading = null;
    config;
    retryCount = 0;
    loadStartTime = 0;
    constructor(name, loader, config = {}) {
        this.name = name;
        this.loader = loader;
        this.config = {
            preloadOnIdle: false,
            retryOnError: true,
            maxRetries: 3,
            retryDelay: 1000,
            timeout: 30000,
            ...config,
        };
        if (this.config.preloadOnIdle) {
            this.schedulePreload();
        }
    }
    get isLoaded() {
        return this.module !== undefined;
    }
    // Complexity: O(1)
    async load() {
        // Return cached if already loaded
        if (this.module !== undefined) {
            return this.module;
        }
        // Return existing loading promise if in progress
        if (this.loading) {
            return this.loading;
        }
        // Start loading
        this.loadStartTime = Date.now();
        this.loading = this.executeLoad();
        try {
            this.module = await this.loading;
            const loadTime = Date.now() - this.loadStartTime;
            console.log(`[LazyLoader] "${this.name}" loaded in ${loadTime}ms`);
            return this.module;
        }
        finally {
            this.loading = null;
        }
    }
    // Complexity: O(1)
    get() {
        return this.module;
    }
    // Complexity: O(1)
    async getOrLoad() {
        return this.module !== undefined ? this.module : this.load();
    }
    // Complexity: O(1)
    reset() {
        this.module = undefined;
        this.loading = null;
        this.retryCount = 0;
    }
    // Complexity: O(N) — loop
    async executeLoad() {
        while (this.retryCount <= this.config.maxRetries) {
            try {
                return await this.loadWithTimeout();
            }
            catch (error) {
                this.retryCount++;
                if (!this.config.retryOnError || this.retryCount > this.config.maxRetries) {
                    throw error;
                }
                console.warn(`[LazyLoader] "${this.name}" load failed, retry ${this.retryCount}/${this.config.maxRetries}`);
                // SAFETY: async operation — wrap in try-catch for production resilience
                await this.delay(this.config.retryDelay * this.retryCount);
            }
        }
        throw new Error(`Failed to load module "${this.name}" after ${this.config.maxRetries} retries`);
    }
    // Complexity: O(1)
    async loadWithTimeout() {
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                // Complexity: O(1)
                reject(new Error(`Module "${this.name}" load timed out after ${this.config.timeout}ms`));
            }, this.config.timeout);
            this.loader()
                .then((module) => {
                // Complexity: O(1)
                clearTimeout(timer);
                // Complexity: O(1)
                resolve(module);
            })
                .catch((error) => {
                // Complexity: O(1)
                clearTimeout(timer);
                // Complexity: O(1)
                reject(error);
            });
        });
    }
    // Complexity: O(1)
    schedulePreload() {
        if (typeof requestIdleCallback !== 'undefined') {
            // Complexity: O(1)
            requestIdleCallback(() => this.load().catch(() => { }));
        }
        else {
            // Complexity: O(1)
            setTimeout(() => this.load().catch(() => { }), 100);
        }
    }
    // Complexity: O(1)
    delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
// ═══════════════════════════════════════════════════════════════════════════════
// LAZY LOADER MANAGER
// ═══════════════════════════════════════════════════════════════════════════════
class LazyLoader {
    static instance;
    modules = new Map();
    stats = [];
    constructor() { }
    static getInstance() {
        if (!LazyLoader.instance) {
            LazyLoader.instance = new LazyLoader();
        }
        return LazyLoader.instance;
    }
    // ─────────────────────────────────────────────────────────────────────────
    // REGISTRATION
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Register a lazy module
     */
    register(name, loader, config) {
        const lazyModule = new LazyModuleImpl(name, loader, config);
        this.modules.set(name, lazyModule);
        return lazyModule;
    }
    /**
     * Get a registered module
     */
    get(name) {
        return this.modules.get(name);
    }
    /**
     * Load a module by name
     */
    async load(name) {
        const module = this.get(name);
        if (!module) {
            throw new Error(`Module "${name}" not registered`);
        }
        const startTime = Date.now();
        // SAFETY: async operation — wrap in try-catch for production resilience
        const result = await module.load();
        this.stats.push({
            moduleName: name,
            loadTime: Date.now() - startTime,
            loadedAt: new Date().toISOString(),
            retries: 0,
        });
        return result;
    }
    // ─────────────────────────────────────────────────────────────────────────
    // PRELOADING
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Preload specific modules
     */
    // Complexity: O(N) — linear scan
    async preload(names) {
        const promises = names.map((name) => this.load(name).catch(() => { }));
        // SAFETY: async operation — wrap in try-catch for production resilience
        await Promise.all(promises);
    }
    /**
     * Preload all registered modules
     */
    // Complexity: O(1)
    async preloadAll() {
        const names = [...this.modules.keys()];
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.preload(names);
    }
    // ─────────────────────────────────────────────────────────────────────────
    // STATUS
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Get loading statistics
     */
    // Complexity: O(1)
    getStats() {
        return [...this.stats];
    }
    /**
     * Check if a module is loaded
     */
    // Complexity: O(1) — lookup
    isLoaded(name) {
        return this.modules.get(name)?.isLoaded ?? false;
    }
    /**
     * Get all module names
     */
    // Complexity: O(1)
    listModules() {
        return [...this.modules.keys()];
    }
    /**
     * Clear all modules
     */
    // Complexity: O(1)
    clear() {
        this.modules.clear();
        this.stats = [];
    }
}
exports.LazyLoader = LazyLoader;
// ═══════════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * Create a lazy function that only executes on first call
 */
function lazyFn(fn) {
    let result;
    let executed = false;
    return () => {
        if (!executed) {
            result = fn();
            executed = true;
        }
        return result;
    };
}
/**
 * Create a lazy async function
 */
function lazyAsync(fn) {
    let result;
    let promise = null;
    return async () => {
        if (result !== undefined) {
            return result;
        }
        if (promise) {
            return promise;
        }
        promise = fn().then((r) => {
            result = r;
            return r;
        });
        return promise;
    };
}
/**
 * Create a lazy property descriptor
 */
function LazyProperty(initializer) {
    return (target, propertyKey) => {
        const key = Symbol(`__lazy_${String(propertyKey)}`);
        Object.defineProperty(target, propertyKey, {
            // Complexity: O(1)
            get() {
                if (!(key in this)) {
                    this[key] = initializer.call(this);
                }
                return this[key];
            },
            configurable: true,
            enumerable: true,
        });
    };
}
// ═══════════════════════════════════════════════════════════════════════════════
// PREDEFINED LAZY MODULES FOR QANTUM
// ═══════════════════════════════════════════════════════════════════════════════
exports.QAntumModules = {
    // Cognition modules (heavy, load on demand)
    // Complexity: O(1)
    registerCognitionModules(loader) {
        loader.register('cognition/thought-chain', async () => {
            // SAFETY: async operation — wrap in try-catch for production resilience
            const { ThoughtChain } = await Promise.resolve().then(() => __importStar(require('../cognition/thought-chain')));
            return ThoughtChain;
        });
        loader.register('cognition/self-critique', async () => {
            // SAFETY: async operation — wrap in try-catch for production resilience
            const { SelfCritique } = await Promise.resolve().then(() => __importStar(require('../cognition/self-critique')));
            return SelfCritique;
        });
        loader.register('cognition/inference-engine', async () => {
            // SAFETY: async operation — wrap in try-catch for production resilience
            const { LogicalInferenceEngine } = await Promise.resolve().then(() => __importStar(require('../cognition/inference-engine')));
            return LogicalInferenceEngine;
        });
        loader.register('cognition/semantic-memory', async () => {
            // SAFETY: async operation — wrap in try-catch for production resilience
            const { SemanticMemoryBank } = await Promise.resolve().then(() => __importStar(require('../cognition/semantic-memory')));
            return SemanticMemoryBank;
        });
    },
};
// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════
const getLazyLoader = () => LazyLoader.getInstance();
exports.getLazyLoader = getLazyLoader;
exports.default = LazyLoader;
