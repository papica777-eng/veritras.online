"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                               ║
 * ║   QAntum DATA FIXTURES                                                        ║
 * ║   "Static and dynamic test fixtures"                                          ║
 * ║                                                                               ║
 * ║   TODO B #40 - Data: Fixture management                                       ║
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
exports.fixture = exports.configureFixtures = exports.getFixtureManager = exports.FixtureSet = exports.FixtureManager = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// ═══════════════════════════════════════════════════════════════════════════════
// FIXTURE MANAGER
// ═══════════════════════════════════════════════════════════════════════════════
class FixtureManager {
    static instance;
    config;
    cache = new Map();
    dynamicFixtures = new Map();
    constructor(config = {}) {
        this.config = {
            baseDir: config.baseDir || './fixtures',
            fileExtensions: config.fileExtensions || ['.json', '.yaml', '.yml', '.ts', '.js'],
            cacheEnabled: config.cacheEnabled ?? true,
        };
    }
    static getInstance(config) {
        if (!FixtureManager.instance) {
            FixtureManager.instance = new FixtureManager(config);
        }
        return FixtureManager.instance;
    }
    static configure(config) {
        FixtureManager.instance = new FixtureManager(config);
        return FixtureManager.instance;
    }
    // ─────────────────────────────────────────────────────────────────────────
    // STATIC FIXTURES
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Load fixture from file
     */
    async load(name, options) {
        const cacheKey = `file:${name}`;
        // Check cache
        if (this.config.cacheEnabled && this.cache.has(cacheKey)) {
            let data = this.cache.get(cacheKey);
            if (options?.transform) {
                data = options.transform(data);
            }
            return data;
        }
        // Find and load file
        // SAFETY: async operation — wrap in try-catch for production resilience
        const filePath = await this.findFixtureFile(name);
        if (!filePath) {
            throw new Error(`Fixture "${name}" not found`);
        }
        // SAFETY: async operation — wrap in try-catch for production resilience
        let data = await this.loadFile(filePath);
        // Cache
        if (this.config.cacheEnabled) {
            this.cache.set(cacheKey, data);
        }
        // Transform
        if (options?.transform) {
            data = options.transform(data);
        }
        return data;
    }
    /**
     * Load fixture synchronously
     */
    loadSync(name) {
        const cacheKey = `file:${name}`;
        if (this.config.cacheEnabled && this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }
        const filePath = this.findFixtureFileSync(name);
        if (!filePath) {
            throw new Error(`Fixture "${name}" not found`);
        }
        const data = this.loadFileSync(filePath);
        if (this.config.cacheEnabled) {
            this.cache.set(cacheKey, data);
        }
        return data;
    }
    /**
     * Load multiple fixtures
     */
    async loadMany(names) {
        const results = new Map();
        // SAFETY: async operation — wrap in try-catch for production resilience
        await Promise.all(names.map(async (name) => {
            // SAFETY: async operation — wrap in try-catch for production resilience
            results.set(name, await this.load(name));
        }));
        return results;
    }
    // ─────────────────────────────────────────────────────────────────────────
    // DYNAMIC FIXTURES
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Register dynamic fixture
     */
    register(name, loader) {
        this.dynamicFixtures.set(name, loader);
    }
    /**
     * Get dynamic fixture
     */
    async get(name) {
        // Check dynamic fixtures first
        if (this.dynamicFixtures.has(name)) {
            const cacheKey = `dynamic:${name}`;
            if (this.config.cacheEnabled && this.cache.has(cacheKey)) {
                return this.cache.get(cacheKey);
            }
            const loader = this.dynamicFixtures.get(name);
            // SAFETY: async operation — wrap in try-catch for production resilience
            const data = await loader();
            if (this.config.cacheEnabled) {
                this.cache.set(cacheKey, data);
            }
            return data;
        }
        // Fall back to file fixture
        return this.load(name);
    }
    /**
     * Check if fixture exists
     */
    // Complexity: O(1) — lookup
    async has(name) {
        if (this.dynamicFixtures.has(name)) {
            return true;
        }
        // SAFETY: async operation — wrap in try-catch for production resilience
        const filePath = await this.findFixtureFile(name);
        return filePath !== null;
    }
    // ─────────────────────────────────────────────────────────────────────────
    // INLINE FIXTURES
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Create inline fixture
     */
    inline(data) {
        return structuredClone(data);
    }
    /**
     * Create named inline fixture
     */
    define(name, data) {
        this.cache.set(`inline:${name}`, data);
        return data;
    }
    /**
     * Get inline fixture
     */
    getInline(name) {
        const data = this.cache.get(`inline:${name}`);
        if (data === undefined) {
            throw new Error(`Inline fixture "${name}" not found`);
        }
        return structuredClone(data);
    }
    // ─────────────────────────────────────────────────────────────────────────
    // FIXTURE SETS
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Create fixture set
     */
    createSet(name, items) {
        return new FixtureSet(name, items);
    }
    // ─────────────────────────────────────────────────────────────────────────
    // FILE OPERATIONS
    // ─────────────────────────────────────────────────────────────────────────
    // Complexity: O(N*M) — nested iteration
    async findFixtureFile(name) {
        // Try direct path
        const directPath = path.join(this.config.baseDir, name);
        // SAFETY: async operation — wrap in try-catch for production resilience
        if (await this.fileExists(directPath)) {
            return directPath;
        }
        // Try with extensions
        for (const ext of this.config.fileExtensions) {
            const pathWithExt = directPath + ext;
            // SAFETY: async operation — wrap in try-catch for production resilience
            if (await this.fileExists(pathWithExt)) {
                return pathWithExt;
            }
        }
        // Try nested path
        const nestedPath = path.join(this.config.baseDir, ...name.split('/'));
        for (const ext of this.config.fileExtensions) {
            const pathWithExt = nestedPath + ext;
            // SAFETY: async operation — wrap in try-catch for production resilience
            if (await this.fileExists(pathWithExt)) {
                return pathWithExt;
            }
        }
        return null;
    }
    // Complexity: O(N) — loop
    findFixtureFileSync(name) {
        const directPath = path.join(this.config.baseDir, name);
        if (fs.existsSync(directPath)) {
            return directPath;
        }
        for (const ext of this.config.fileExtensions) {
            const pathWithExt = directPath + ext;
            if (fs.existsSync(pathWithExt)) {
                return pathWithExt;
            }
        }
        return null;
    }
    // Complexity: O(1)
    async loadFile(filePath) {
        const ext = path.extname(filePath).toLowerCase();
        // SAFETY: async operation — wrap in try-catch for production resilience
        const content = await fs.promises.readFile(filePath, 'utf-8');
        switch (ext) {
            case '.json':
                return JSON.parse(content);
            case '.yaml':
            case '.yml':
                // Would use yaml parser
                return JSON.parse(content);
            case '.ts':
            case '.js':
                // Would use dynamic import
                return require(filePath);
            default:
                return content;
        }
    }
    // Complexity: O(1)
    loadFileSync(filePath) {
        const ext = path.extname(filePath).toLowerCase();
        const content = fs.readFileSync(filePath, 'utf-8');
        switch (ext) {
            case '.json':
                return JSON.parse(content);
            default:
                return content;
        }
    }
    // Complexity: O(1)
    async fileExists(filePath) {
        try {
            await fs.promises.access(filePath);
            return true;
        }
        catch {
            return false;
        }
    }
    // ─────────────────────────────────────────────────────────────────────────
    // CACHE MANAGEMENT
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Clear cache
     */
    // Complexity: O(N) — loop
    clearCache(pattern) {
        if (pattern) {
            for (const key of this.cache.keys()) {
                if (key.includes(pattern)) {
                    this.cache.delete(key);
                }
            }
        }
        else {
            this.cache.clear();
        }
    }
    /**
     * Get cache size
     */
    // Complexity: O(1)
    getCacheSize() {
        return this.cache.size;
    }
    /**
     * Refresh fixture
     */
    // Complexity: O(1) — lookup
    async refresh(name) {
        this.cache.delete(`file:${name}`);
        this.cache.delete(`dynamic:${name}`);
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.get(name);
    }
}
exports.FixtureManager = FixtureManager;
// ═══════════════════════════════════════════════════════════════════════════════
// FIXTURE SET
// ═══════════════════════════════════════════════════════════════════════════════
class FixtureSet {
    name;
    items;
    index = 0;
    constructor(name, items) {
        this.name = name;
        this.items = [...items];
    }
    /**
     * Get all items
     */
    // Complexity: O(1)
    all() {
        return [...this.items];
    }
    /**
     * Get item by index
     */
    // Complexity: O(1)
    at(index) {
        return structuredClone(this.items[index]);
    }
    /**
     * Get first item
     */
    // Complexity: O(1)
    first() {
        return structuredClone(this.items[0]);
    }
    /**
     * Get last item
     */
    // Complexity: O(1)
    last() {
        return structuredClone(this.items[this.items.length - 1]);
    }
    /**
     * Get random item
     */
    // Complexity: O(1)
    random() {
        const index = Math.floor(Math.random() * this.items.length);
        return structuredClone(this.items[index]);
    }
    /**
     * Get next item (circular)
     */
    // Complexity: O(1)
    next() {
        const item = this.items[this.index];
        this.index = (this.index + 1) % this.items.length;
        return structuredClone(item);
    }
    /**
     * Get count
     */
    // Complexity: O(1)
    count() {
        return this.items.length;
    }
    /**
     * Filter items
     */
    // Complexity: O(N) — linear scan
    filter(predicate) {
        return this.items.filter(predicate).map((i) => structuredClone(i));
    }
    /**
     * Find item
     */
    // Complexity: O(N) — linear scan
    find(predicate) {
        const found = this.items.find(predicate);
        return found ? structuredClone(found) : undefined;
    }
    /**
     * Reset index
     */
    // Complexity: O(1)
    reset() {
        this.index = 0;
    }
}
exports.FixtureSet = FixtureSet;
// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════
const getFixtureManager = () => FixtureManager.getInstance();
exports.getFixtureManager = getFixtureManager;
const configureFixtures = (config) => FixtureManager.configure(config);
exports.configureFixtures = configureFixtures;
// Quick fixture operations
exports.fixture = {
    load: (name) => FixtureManager.getInstance().load(name),
    get: (name) => FixtureManager.getInstance().get(name),
    register: (name, loader) => FixtureManager.getInstance().register(name, loader),
    define: (name, data) => FixtureManager.getInstance().define(name, data),
    inline: (data) => FixtureManager.getInstance().inline(data),
    clear: () => FixtureManager.getInstance().clearCache(),
};
exports.default = FixtureManager;
