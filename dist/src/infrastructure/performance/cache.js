"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                               ║
 * ║   QANTUM CACHING SYSTEM                                                       ║
 * ║   "Multi-layer caching with TTL and LRU"                                      ║
 * ║                                                                               ║
 * ║   TODO B #13 - Caching                                                        ║
 * ║                                                                               ║
 * ║   © 2025-2026 QAntum | Dimitar Prodromov                                        ║
 * ║                                                                               ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCache = exports.CacheRegistry = exports.NamespacedCache = exports.Cache = void 0;
exports.Memoize = Memoize;
// ═══════════════════════════════════════════════════════════════════════════════
// CACHE IMPLEMENTATION
// ═══════════════════════════════════════════════════════════════════════════════
class Cache {
    entries = new Map();
    config;
    stats = { hits: 0, misses: 0, evictions: 0 };
    memoryUsed = 0;
    constructor(config = {}) {
        this.config = {
            maxSize: 1000,
            maxMemory: 50 * 1024 * 1024, // 50MB
            defaultTTL: 5 * 60 * 1000, // 5 minutes
            evictionPolicy: 'lru',
            ...config
        };
    }
    // ─────────────────────────────────────────────────────────────────────────
    // ОСНОВНИ ОПЕРАЦИИ
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Set a value in cache
     */
    // Complexity: O(1) — lookup
    set(key, value, ttl) {
        // Remove existing entry if present
        if (this.entries.has(key)) {
            this.delete(key);
        }
        const size = this.estimateSize(value);
        const now = Date.now();
        const effectiveTTL = ttl ?? this.config.defaultTTL;
        // Ensure space is available
        this.ensureSpace(size);
        const entry = {
            value,
            createdAt: now,
            expiresAt: now + effectiveTTL,
            lastAccessed: now,
            accessCount: 0,
            size
        };
        this.entries.set(key, entry);
        this.memoryUsed += size;
    }
    /**
     * Get a value from cache
     */
    // Complexity: O(1) — lookup
    get(key) {
        const entry = this.entries.get(key);
        if (!entry) {
            this.stats.misses++;
            return undefined;
        }
        // Check expiration
        if (Date.now() > entry.expiresAt) {
            this.delete(key);
            this.stats.misses++;
            return undefined;
        }
        // Update access metadata
        entry.lastAccessed = Date.now();
        entry.accessCount++;
        this.stats.hits++;
        return entry.value;
    }
    /**
     * Get or set with factory function
     */
    // Complexity: O(1) — lookup
    async getOrSet(key, factory, ttl) {
        const existing = this.get(key);
        if (existing !== undefined) {
            return existing;
        }
        // SAFETY: async operation — wrap in try-catch for production resilience
        const value = await factory();
        this.set(key, value, ttl);
        return value;
    }
    /**
     * Check if key exists
     */
    // Complexity: O(1) — lookup
    has(key) {
        const entry = this.entries.get(key);
        if (!entry)
            return false;
        if (Date.now() > entry.expiresAt) {
            this.delete(key);
            return false;
        }
        return true;
    }
    /**
     * Delete a key
     */
    // Complexity: O(1) — lookup
    delete(key) {
        const entry = this.entries.get(key);
        if (!entry)
            return false;
        this.memoryUsed -= entry.size;
        this.entries.delete(key);
        if (this.config.onEvict) {
            this.config.onEvict(key, entry.value);
        }
        return true;
    }
    /**
     * Clear all entries
     */
    // Complexity: O(1)
    clear() {
        this.entries.clear();
        this.memoryUsed = 0;
        this.stats = { hits: 0, misses: 0, evictions: 0 };
    }
    // ─────────────────────────────────────────────────────────────────────────
    // BULK OPERATIONS
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Get multiple keys
     */
    // Complexity: O(N) — loop
    mget(keys) {
        const result = new Map();
        for (const key of keys) {
            const value = this.get(key);
            if (value !== undefined) {
                result.set(key, value);
            }
        }
        return result;
    }
    /**
     * Set multiple entries
     */
    // Complexity: O(N) — loop
    mset(entries) {
        for (const entry of entries) {
            this.set(entry.key, entry.value, entry.ttl);
        }
    }
    /**
     * Delete multiple keys
     */
    // Complexity: O(N) — loop
    mdelete(keys) {
        let count = 0;
        for (const key of keys) {
            if (this.delete(key))
                count++;
        }
        return count;
    }
    // ─────────────────────────────────────────────────────────────────────────
    // CACHE MANAGEMENT
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Remove expired entries
     */
    // Complexity: O(N) — loop
    prune() {
        const now = Date.now();
        let pruned = 0;
        for (const [key, entry] of this.entries) {
            if (now > entry.expiresAt) {
                this.delete(key);
                pruned++;
            }
        }
        return pruned;
    }
    /**
     * Get cache statistics
     */
    // Complexity: O(N) — loop
    getStats() {
        const total = this.stats.hits + this.stats.misses;
        let oldestEntry = Infinity;
        for (const entry of this.entries.values()) {
            if (entry.createdAt < oldestEntry) {
                oldestEntry = entry.createdAt;
            }
        }
        return {
            hits: this.stats.hits,
            misses: this.stats.misses,
            hitRate: total > 0 ? this.stats.hits / total : 0,
            size: this.entries.size,
            memoryUsed: this.memoryUsed,
            evictions: this.stats.evictions,
            oldestEntry: oldestEntry === Infinity ? 0 : oldestEntry
        };
    }
    /**
     * Get all keys
     */
    // Complexity: O(1)
    keys() {
        return [...this.entries.keys()];
    }
    /**
     * Get size
     */
    get size() {
        return this.entries.size;
    }
    // ─────────────────────────────────────────────────────────────────────────
    // PRIVATE HELPERS
    // ─────────────────────────────────────────────────────────────────────────
    // Complexity: O(N*M) — nested iteration
    ensureSpace(requiredSize) {
        // Check size limit
        while (this.entries.size >= this.config.maxSize) {
            this.evictOne();
        }
        // Check memory limit
        while (this.memoryUsed + requiredSize > this.config.maxMemory && this.entries.size > 0) {
            this.evictOne();
        }
    }
    // Complexity: O(1)
    evictOne() {
        const keyToEvict = this.selectEvictionCandidate();
        if (keyToEvict) {
            this.delete(keyToEvict);
            this.stats.evictions++;
        }
    }
    // Complexity: O(1)
    selectEvictionCandidate() {
        if (this.entries.size === 0)
            return null;
        switch (this.config.evictionPolicy) {
            case 'lru':
                return this.selectLRU();
            case 'lfu':
                return this.selectLFU();
            case 'fifo':
                return this.selectFIFO();
            default:
                return this.selectLRU();
        }
    }
    // Complexity: O(N) — loop
    selectLRU() {
        let oldest = Infinity;
        //         let oldestKey = ';
        for (const [key, entry] of this.entries) {
            if (entry.lastAccessed < oldest) {
                oldest = entry.lastAccessed;
                oldestKey = key;
            }
        }
        return oldestKey;
    }
    // Complexity: O(N) — loop
    selectLFU() {
        let minAccess = Infinity;
        //         let minKey = ';
        for (const [key, entry] of this.entries) {
            if (entry.accessCount < minAccess) {
                minAccess = entry.accessCount;
                minKey = key;
            }
        }
        return minKey;
    }
    // Complexity: O(N) — loop
    selectFIFO() {
        let oldest = Infinity;
        //         let oldestKey = ';
        for (const [key, entry] of this.entries) {
            if (entry.createdAt < oldest) {
                oldest = entry.createdAt;
                oldestKey = key;
            }
        }
        return oldestKey;
    }
    // Complexity: O(1)
    estimateSize(value) {
        // Rough estimate - in production use sizeof or similar
        if (value === null || value === undefined)
            return 8;
        if (typeof value === 'boolean')
            return 4;
        if (typeof value === 'number')
            return 8;
        if (typeof value === 'string')
            return value.length * 2;
        if (Array.isArray(value))
            return JSON.stringify(value).length;
        if (typeof value === 'object')
            return JSON.stringify(value).length;
        return 64;
    }
}
exports.Cache = Cache;
// ═══════════════════════════════════════════════════════════════════════════════
// SPECIALIZED CACHES
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * Cache with namespace support
 */
class NamespacedCache {
    cache;
    namespace;
    constructor(namespace, config) {
        this.namespace = namespace;
        this.cache = new Cache(config);
    }
    // Complexity: O(1)
    key(key) {
        return `${this.namespace}:${key}`;
    }
    // Complexity: O(1) — lookup
    set(key, value, ttl) {
        this.cache.set(this.key(key), value, ttl);
    }
    // Complexity: O(1) — lookup
    get(key) {
        return this.cache.get(this.key(key));
    }
    // Complexity: O(1) — lookup
    has(key) {
        return this.cache.has(this.key(key));
    }
    // Complexity: O(1)
    delete(key) {
        return this.cache.delete(this.key(key));
    }
    // Complexity: O(N) — loop
    clear() {
        // Only clear keys in this namespace
        for (const key of this.cache.keys()) {
            if (key.startsWith(this.namespace + ':')) {
                this.cache.delete(key);
            }
        }
    }
}
exports.NamespacedCache = NamespacedCache;
/**
 * Memoization decorator using cache
 */
function Memoize(ttl) {
    const cache = new Cache();
    return function (target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        descriptor.value = async function (...args) {
            const key = `${propertyKey}:${JSON.stringify(args)}`;
            return cache.getOrSet(key, () => originalMethod.apply(this, args), ttl);
        };
        return descriptor;
    };
}
// ═══════════════════════════════════════════════════════════════════════════════
// GLOBAL CACHE REGISTRY
// ═══════════════════════════════════════════════════════════════════════════════
class CacheRegistry {
    static instance;
    caches = new Map();
    constructor() { }
    static getInstance() {
        if (!CacheRegistry.instance) {
            CacheRegistry.instance = new CacheRegistry();
        }
        return CacheRegistry.instance;
    }
    /**
     * Get or create a named cache
     */
    getCache(name, config) {
        if (!this.caches.has(name)) {
            this.caches.set(name, new Cache(config));
        }
        return this.caches.get(name);
    }
    /**
     * Clear all caches
     */
    // Complexity: O(N) — loop
    clearAll() {
        for (const cache of this.caches.values()) {
            cache.clear();
        }
    }
    /**
     * Get stats for all caches
     */
    // Complexity: O(N) — loop
    getAllStats() {
        const stats = {};
        for (const [name, cache] of this.caches) {
            stats[name] = cache.getStats();
        }
        return stats;
    }
}
exports.CacheRegistry = CacheRegistry;
// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════
const getCache = (name, config) => {
    return CacheRegistry.getInstance().getCache(name, config);
};
exports.getCache = getCache;
exports.default = Cache;
