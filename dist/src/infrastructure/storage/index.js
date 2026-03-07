"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                               ║
 * ║   QAntum STORAGE MODULE                                                       ║
 * ║   "Unified storage facade - KV, File, Cache"                                  ║
 * ║                                                                               ║
 * ║   TODO B #30-32 - Storage: Complete Module                                    ║
 * ║                                                                               ║
 * ║   © 2025-2026 QAntum | Dimitar Prodromov                                        ║
 * ║                                                                               ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.storage = exports.configureStorage = exports.getStorage = exports.QAntumStorage = exports.ClearCache = exports.Cached = exports.memoize = exports.createCache = exports.CacheStorage = exports.file = exports.getFileStorage = exports.FileStorage = exports.kv = exports.getKVStore = exports.KeyValueStore = void 0;
// ═══════════════════════════════════════════════════════════════════════════════
// RE-EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════
var kv_store_1 = require("./kv-store");
Object.defineProperty(exports, "KeyValueStore", { enumerable: true, get: function () { return kv_store_1.KeyValueStore; } });
Object.defineProperty(exports, "getKVStore", { enumerable: true, get: function () { return kv_store_1.getKVStore; } });
Object.defineProperty(exports, "kv", { enumerable: true, get: function () { return kv_store_1.kv; } });
var file_storage_1 = require("./file-storage");
Object.defineProperty(exports, "FileStorage", { enumerable: true, get: function () { return file_storage_1.FileStorage; } });
Object.defineProperty(exports, "getFileStorage", { enumerable: true, get: function () { return file_storage_1.getFileStorage; } });
Object.defineProperty(exports, "file", { enumerable: true, get: function () { return file_storage_1.file; } });
var cache_1 = require("./cache");
Object.defineProperty(exports, "CacheStorage", { enumerable: true, get: function () { return cache_1.CacheStorage; } });
Object.defineProperty(exports, "createCache", { enumerable: true, get: function () { return cache_1.createCache; } });
Object.defineProperty(exports, "memoize", { enumerable: true, get: function () { return cache_1.memoize; } });
Object.defineProperty(exports, "Cached", { enumerable: true, get: function () { return cache_1.Cached; } });
Object.defineProperty(exports, "ClearCache", { enumerable: true, get: function () { return cache_1.ClearCache; } });
// ═══════════════════════════════════════════════════════════════════════════════
// UNIFIED STORAGE
// ═══════════════════════════════════════════════════════════════════════════════
const kv_store_2 = require("./kv-store");
const file_storage_2 = require("./file-storage");
const cache_2 = require("./cache");
/**
 * Unified QAntum Storage
 */
class QAntumStorage {
    static instance;
    _kv;
    _file;
    _cache;
    namedCaches = new Map();
    constructor(config = {}) {
        this._kv = (0, kv_store_2.getKVStore)();
        this._file = (0, file_storage_2.getFileStorage)();
        if (config.fileOptions?.basePath) {
            this._file.setBasePath(config.fileOptions.basePath);
        }
        this._cache = (0, cache_2.createCache)(config.cacheOptions);
    }
    static getInstance(config) {
        if (!QAntumStorage.instance) {
            QAntumStorage.instance = new QAntumStorage(config);
        }
        return QAntumStorage.instance;
    }
    static configure(config) {
        QAntumStorage.instance = new QAntumStorage(config);
        return QAntumStorage.instance;
    }
    // ─────────────────────────────────────────────────────────────────────────
    // STORAGE ACCESSORS
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Get Key-Value store
     */
    get kv() {
        return this._kv;
    }
    /**
     * Get File storage
     */
    get file() {
        return this._file;
    }
    /**
     * Get default cache
     */
    get cache() {
        return this._cache;
    }
    /**
     * Get or create named cache
     */
    // Complexity: O(1) — lookup
    getCache(name, options) {
        if (!this.namedCaches.has(name)) {
            this.namedCaches.set(name, 
            // Complexity: O(1)
            (0, cache_2.createCache)({
                defaultTTL: options?.ttl,
                maxEntries: options?.maxSize,
            }));
        }
        return this.namedCaches.get(name);
    }
    // ─────────────────────────────────────────────────────────────────────────
    // QUICK METHODS
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Store value (auto-detect best storage)
     */
    // Complexity: O(1)
    async store(key, value, options) {
        if (options?.persist) {
            // Store to file
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this._file.writeJSON(`data/${key}.json`, value);
        }
        else if (options?.ttl) {
            // Store to cache with TTL
            this._cache.set(key, value, options.ttl);
        }
        else {
            // Store to KV
            this._kv.set(key, value);
        }
    }
    /**
     * Retrieve value (check all storages)
     */
    async retrieve(key) {
        // Check cache first
        const cached = this._cache.get(key);
        if (cached !== undefined)
            return cached;
        // Check KV
        const kvValue = this._kv.get(key);
        if (kvValue !== undefined)
            return kvValue;
        // Check file
        try {
            const filePath = `data/${key}.json`;
            if (await this._file.exists(filePath)) {
                return await this._file.readJSON(filePath);
            }
        }
        catch {
            // File doesn't exist
        }
        return undefined;
    }
    /**
     * Remove value from all storages
     */
    // Complexity: O(1)
    async remove(key) {
        this._cache.delete(key);
        this._kv.delete(key);
        try {
            const filePath = `data/${key}.json`;
            if (await this._file.exists(filePath)) {
                await this._file.delete(filePath);
            }
        }
        catch {
            // Ignore file errors
        }
    }
    // ─────────────────────────────────────────────────────────────────────────
    // CLEANUP
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Clear all storages
     */
    // Complexity: O(N) — loop
    async clearAll() {
        this._cache.clear();
        this._kv.clear();
        for (const cache of this.namedCaches.values()) {
            cache.clear();
        }
    }
    /**
     * Cleanup expired entries
     */
    // Complexity: O(N) — loop
    cleanup() {
        let cleaned = 0;
        cleaned += this._cache.cleanup();
        cleaned += this._kv.cleanup();
        for (const cache of this.namedCaches.values()) {
            cleaned += cache.cleanup();
        }
        return cleaned;
    }
    /**
     * Get combined statistics
     */
    // Complexity: O(1)
    getStats() {
        return {
            kv: this._kv.getStats(),
            cache: this._cache.getStats(),
            file: { basePath: this._file.getBasePath() },
            namedCaches: [...this.namedCaches.keys()],
        };
    }
}
exports.QAntumStorage = QAntumStorage;
// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════
const getStorage = () => QAntumStorage.getInstance();
exports.getStorage = getStorage;
const configureStorage = (config) => QAntumStorage.configure(config);
exports.configureStorage = configureStorage;
// Quick storage operations
exports.storage = {
    store: (key, value, options) => QAntumStorage.getInstance().store(key, value, options),
    retrieve: (key) => QAntumStorage.getInstance().retrieve(key),
    remove: (key) => QAntumStorage.getInstance().remove(key),
    kv: () => QAntumStorage.getInstance().kv,
    file: () => QAntumStorage.getInstance().file,
    cache: () => QAntumStorage.getInstance().cache,
    namedCache: (name, options) => QAntumStorage.getInstance().getCache(name, options),
};
exports.default = QAntumStorage;
