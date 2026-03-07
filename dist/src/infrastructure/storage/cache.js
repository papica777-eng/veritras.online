"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                               ║
 * ║   QAntum CACHE STORAGE                                                        ║
 * ║   "High-performance caching with multiple backends"                           ║
 * ║                                                                               ║
 * ║   TODO B #32 - Storage: Cache Operations                                      ║
 * ║                                                                               ║
 * ║   © 2025-2026 QAntum | Dimitar Prodromov                                        ║
 * ║                                                                               ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCache = exports.CacheStorage = void 0;
exports.memoize = memoize;
exports.Cached = Cached;
exports.ClearCache = ClearCache;
// ═══════════════════════════════════════════════════════════════════════════════
// CACHE IMPLEMENTATION
// ═══════════════════════════════════════════════════════════════════════════════
class CacheStorage {
    cache = new Map();
    options;
    stats = {
        hits: 0,
        misses: 0,
        evictions: 0,
        totalSize: 0,
    };
    constructor(options = {}) {
        this.options = {
            defaultTTL: options.defaultTTL || 0,
            maxEntries: options.maxEntries || 10000,
            maxSize: options.maxSize || 100 * 1024 * 1024, // 100MB
            onEvict: options.onEvict || (() => { }),
            evictionPolicy: options.evictionPolicy || 'LRU',
        };
    }
    // ─────────────────────────────────────────────────────────────────────────
    // BASIC OPERATIONS
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Get value from cache
     */
    // Complexity: O(1) — lookup
    get(key) {
        const entry = this.cache.get(key);
        if (!entry) {
            this.stats.misses++;
            return undefined;
        }
        // Check expiration
        if (entry.expiresAt && Date.now() > entry.expiresAt) {
            this.delete(key);
            this.stats.misses++;
            return undefined;
        }
        // Update stats
        entry.hits++;
        entry.lastAccess = Date.now();
        this.stats.hits++;
        return entry.value;
    }
    /**
     * Set value in cache
     */
    // Complexity: O(1) — lookup
    set(key, value, ttl, tags = []) {
        // Estimate size
        const size = this.estimateSize(value);
        // Check if we need to evict
        this.ensureCapacity(size);
        const now = Date.now();
        const actualTTL = ttl !== undefined ? ttl : this.options.defaultTTL;
        this.cache.set(key, {
            value,
            createdAt: now,
            expiresAt: actualTTL > 0 ? now + actualTTL : undefined,
            hits: 0,
            lastAccess: now,
            tags,
            size,
        });
        this.stats.totalSize += size;
    }
    /**
     * Check if key exists
     */
    // Complexity: O(1) — lookup
    has(key) {
        const entry = this.cache.get(key);
        if (!entry)
            return false;
        if (entry.expiresAt && Date.now() > entry.expiresAt) {
            this.delete(key);
            return false;
        }
        return true;
    }
    /**
     * Delete key
     */
    // Complexity: O(1) — lookup
    delete(key) {
        const entry = this.cache.get(key);
        if (!entry)
            return false;
        this.stats.totalSize -= entry.size;
        this.options.onEvict(key, entry.value);
        return this.cache.delete(key);
    }
    /**
     * Clear cache
     */
    // Complexity: O(N) — loop
    clear() {
        for (const [key, entry] of this.cache) {
            this.options.onEvict(key, entry.value);
        }
        this.cache.clear();
        this.stats.totalSize = 0;
    }
    // ─────────────────────────────────────────────────────────────────────────
    // ADVANCED OPERATIONS
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Get or set with callback
     */
    // Complexity: O(1) — lookup
    async getOrSet(key, factory, ttl) {
        const cached = this.get(key);
        if (cached !== undefined)
            return cached;
        // SAFETY: async operation — wrap in try-catch for production resilience
        const value = await factory();
        this.set(key, value, ttl);
        return value;
    }
    /**
     * Get multiple values
     */
    // Complexity: O(N) — loop
    getMany(keys) {
        const result = new Map();
        for (const key of keys) {
            result.set(key, this.get(key));
        }
        return result;
    }
    /**
     * Set multiple values
     */
    // Complexity: O(N) — loop
    setMany(entries, ttl) {
        for (const [key, value] of entries) {
            this.set(key, value, ttl);
        }
    }
    /**
     * Delete by tags
     */
    // Complexity: O(N) — loop
    deleteByTags(tags) {
        let deleted = 0;
        const tagsSet = new Set(tags);
        for (const [key, entry] of this.cache) {
            if (entry.tags.some((t) => tagsSet.has(t))) {
                this.delete(key);
                deleted++;
            }
        }
        return deleted;
    }
    /**
     * Get entries by tags
     */
    // Complexity: O(N) — loop
    getByTags(tags) {
        const result = new Map();
        const tagsSet = new Set(tags);
        for (const [key, entry] of this.cache) {
            if (entry.tags.some((t) => tagsSet.has(t))) {
                const value = this.get(key);
                if (value !== undefined) {
                    result.set(key, value);
                }
            }
        }
        return result;
    }
    // ─────────────────────────────────────────────────────────────────────────
    // EVICTION
    // ─────────────────────────────────────────────────────────────────────────
    // Complexity: O(N*M) — nested iteration
    ensureCapacity(additionalSize) {
        // Check entry limit
        while (this.cache.size >= this.options.maxEntries) {
            this.evictOne();
        }
        // Check size limit
        while (this.stats.totalSize + additionalSize > this.options.maxSize && this.cache.size > 0) {
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
    // Complexity: O(N*M) — nested iteration
    selectEvictionCandidate() {
        if (this.cache.size === 0)
            return null;
        let candidate = null;
        let candidateScore = Infinity;
        switch (this.options.evictionPolicy) {
            case 'LRU':
                // Least Recently Used
                for (const [key, entry] of this.cache) {
                    if (entry.lastAccess < candidateScore) {
                        candidateScore = entry.lastAccess;
                        candidate = key;
                    }
                }
                break;
            case 'LFU':
                // Least Frequently Used
                for (const [key, entry] of this.cache) {
                    if (entry.hits < candidateScore) {
                        candidateScore = entry.hits;
                        candidate = key;
                    }
                }
                break;
            case 'FIFO':
                // First In First Out
                for (const [key, entry] of this.cache) {
                    if (entry.createdAt < candidateScore) {
                        candidateScore = entry.createdAt;
                        candidate = key;
                    }
                }
                break;
            case 'TTL':
                // Shortest TTL first
                const now = Date.now();
                for (const [key, entry] of this.cache) {
                    const ttl = entry.expiresAt ? entry.expiresAt - now : Infinity;
                    if (ttl < candidateScore) {
                        candidateScore = ttl;
                        candidate = key;
                    }
                }
                break;
        }
        return candidate;
    }
    /**
     * Cleanup expired entries
     */
    // Complexity: O(N) — loop
    cleanup() {
        let cleaned = 0;
        const now = Date.now();
        for (const [key, entry] of this.cache) {
            if (entry.expiresAt && now > entry.expiresAt) {
                this.delete(key);
                cleaned++;
            }
        }
        return cleaned;
    }
    // ─────────────────────────────────────────────────────────────────────────
    // STATS & INFO
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Get cache statistics
     */
    // Complexity: O(1)
    getStats() {
        const total = this.stats.hits + this.stats.misses;
        return {
            hits: this.stats.hits,
            misses: this.stats.misses,
            entries: this.cache.size,
            size: this.stats.totalSize,
            hitRate: total > 0 ? this.stats.hits / total : 0,
            evictions: this.stats.evictions,
        };
    }
    /**
     * Get size
     */
    get size() {
        return this.cache.size;
    }
    /**
     * Get all keys
     */
    // Complexity: O(1)
    keys() {
        return [...this.cache.keys()];
    }
    // ─────────────────────────────────────────────────────────────────────────
    // UTILITIES
    // ─────────────────────────────────────────────────────────────────────────
    // Complexity: O(1)
    estimateSize(value) {
        if (typeof value === 'string') {
            return value.length * 2;
        }
        if (typeof value === 'number') {
            return 8;
        }
        if (typeof value === 'boolean') {
            return 4;
        }
        if (value === null || value === undefined) {
            return 0;
        }
        if (Buffer.isBuffer(value)) {
            return value.length;
        }
        // Estimate object size
        return JSON.stringify(value).length * 2;
    }
}
exports.CacheStorage = CacheStorage;
// ═══════════════════════════════════════════════════════════════════════════════
// MEMOIZATION
// ═══════════════════════════════════════════════════════════════════════════════
function memoize(fn, options = {}) {
    const cache = new CacheStorage({
        defaultTTL: options.ttl,
        maxEntries: options.maxSize || 1000,
    });
    const keyGen = options.keyGenerator || ((...args) => JSON.stringify(args));
    return ((...args) => {
        const key = keyGen(...args);
        const cached = cache.get(key);
        if (cached !== undefined)
            return cached;
        const result = fn(...args);
        cache.set(key, result);
        return result;
    });
}
// ═══════════════════════════════════════════════════════════════════════════════
// DECORATORS
// ═══════════════════════════════════════════════════════════════════════════════
const methodCaches = new Map();
/**
 * Cache method results
 */
function Cached(options = {}) {
    return function (target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        const cacheKey = `${target.constructor.name}.${String(propertyKey)}`;
        if (!methodCaches.has(cacheKey)) {
            methodCaches.set(cacheKey, new CacheStorage({
                defaultTTL: options.ttl,
                maxEntries: options.maxSize || 1000,
            }));
        }
        descriptor.value = function (...args) {
            const cache = methodCaches.get(cacheKey);
            const key = JSON.stringify(args);
            const cached = cache.get(key);
            if (cached !== undefined)
                return cached;
            const result = originalMethod.apply(this, args);
            cache.set(key, result);
            return result;
        };
        return descriptor;
    };
}
/**
 * Clear cache decorator
 */
function ClearCache(cacheKey) {
    return function (target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        descriptor.value = function (...args) {
            const fullKey = `${target.constructor.name}.${cacheKey}`;
            const cache = methodCaches.get(fullKey);
            if (cache)
                cache.clear();
            return originalMethod.apply(this, args);
        };
        return descriptor;
    };
}
// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════
const createCache = (options) => {
    return new CacheStorage(options);
};
exports.createCache = createCache;
exports.default = CacheStorage;
