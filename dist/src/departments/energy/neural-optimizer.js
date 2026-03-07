"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * QAntum
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * @copyright 2025 Димитър Продромов (Dimitar Prodromov). All Rights Reserved.
 * @license PROPRIETARY AND CONFIDENTIAL
 *
 * This file is part of QAntum.
 * Unauthorized copying, modification, distribution, or use of this file,
 * via any medium, is strictly prohibited without express written permission.
 *
 * For licensing inquiries: dp@qantum.site
 * ═══════════════════════════════════════════════════════════════════════════════
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
exports.neuralOptimizer = exports.NeuralOptimizer = exports.PatternDeduplicator = exports.LRUCache = void 0;
const events_1 = require("events");
const fs = __importStar(require("fs"));
const zlib = __importStar(require("zlib"));
/**
 * 🧠 LRUCache - Least Recently Used Cache Implementation
 *
 * High-performance cache with O(1) get/put operations.
 * Automatically evicts least recently used items when capacity is reached.
 */
class LRUCache extends events_1.EventEmitter {
    capacity;
    maxMemory;
    cache;
    head = null;
    tail = null;
    currentMemory = 0;
    // Statistics
    stats = {
        hits: 0,
        misses: 0,
        evictions: 0,
        currentSize: 0,
        maxSize: 0,
        itemCount: 0,
        hitRate: 0,
        memoryUsage: 0
    };
    constructor(capacity = 1000, maxMemoryMB = 100) {
        super();
        this.capacity = capacity;
        this.maxMemory = maxMemoryMB * 1024 * 1024; // Convert to bytes
        this.cache = new Map();
        this.stats.maxSize = capacity;
    }
    /**
     * Get value from cache
     */
    // Complexity: O(1) — hash/map lookup
    get(key) {
        const node = this.cache.get(key);
        if (!node) {
            this.stats.misses++;
            this.updateHitRate();
            return undefined;
        }
        // Update access info
        node.accessCount++;
        node.lastAccess = Date.now();
        // Move to head (most recently used)
        this.moveToHead(node);
        this.stats.hits++;
        this.updateHitRate();
        return node.value;
    }
    /**
     * Put value in cache
     */
    // Complexity: O(N) — loop-based
    put(key, value, sizeBytes) {
        const size = sizeBytes || this.estimateSize(value);
        // Check if key exists
        const existing = this.cache.get(key);
        if (existing) {
            // Update existing node
            this.currentMemory -= existing.size;
            existing.value = value;
            existing.size = size;
            existing.accessCount++;
            existing.lastAccess = Date.now();
            this.currentMemory += size;
            this.moveToHead(existing);
            return;
        }
        // Evict if necessary
        while (this.shouldEvict(size)) {
            this.evictLRU();
        }
        // Create new node
        const node = {
            key,
            value,
            prev: null,
            next: null,
            accessCount: 1,
            lastAccess: Date.now(),
            size
        };
        // Add to cache and list
        this.cache.set(key, node);
        this.addToHead(node);
        this.currentMemory += size;
        this.stats.currentSize = this.cache.size;
        this.stats.itemCount = this.cache.size;
        this.stats.memoryUsage = this.currentMemory;
        this.emit('put', { key, size });
    }
    /**
     * Check if key exists
     */
    // Complexity: O(1) — hash/map lookup
    has(key) {
        return this.cache.has(key);
    }
    /**
     * Delete key from cache
     */
    // Complexity: O(1) — hash/map lookup
    delete(key) {
        const node = this.cache.get(key);
        if (!node)
            return false;
        this.removeNode(node);
        this.cache.delete(key);
        this.currentMemory -= node.size;
        this.stats.currentSize = this.cache.size;
        this.stats.itemCount = this.cache.size;
        this.stats.memoryUsage = this.currentMemory;
        return true;
    }
    /**
     * Clear the cache
     */
    // Complexity: O(1)
    clear() {
        this.cache.clear();
        this.head = null;
        this.tail = null;
        this.currentMemory = 0;
        this.stats.currentSize = 0;
        this.stats.itemCount = 0;
        this.stats.memoryUsage = 0;
        this.emit('clear');
    }
    /**
     * Get cache statistics
     */
    // Complexity: O(1)
    getStats() {
        return { ...this.stats };
    }
    /**
     * Get most frequently accessed items
     */
    // Complexity: O(N log N) — sort operation
    getHotItems(count = 10) {
        const items = [];
        for (const [key, node] of this.cache) {
            items.push({ key, accessCount: node.accessCount });
        }
        return items
            .sort((a, b) => b.accessCount - a.accessCount)
            .slice(0, count);
    }
    /**
     * Move node to head of list
     */
    // Complexity: O(N) — potential recursive descent
    moveToHead(node) {
        if (node === this.head)
            return;
        this.removeNode(node);
        this.addToHead(node);
    }
    /**
     * Add node to head
     */
    // Complexity: O(1)
    addToHead(node) {
        node.prev = null;
        node.next = this.head;
        if (this.head) {
            this.head.prev = node;
        }
        this.head = node;
        if (!this.tail) {
            this.tail = node;
        }
    }
    /**
     * Remove node from list
     */
    // Complexity: O(1)
    removeNode(node) {
        if (node.prev) {
            node.prev.next = node.next;
        }
        else {
            this.head = node.next;
        }
        if (node.next) {
            node.next.prev = node.prev;
        }
        else {
            this.tail = node.prev;
        }
    }
    /**
     * Check if eviction is needed
     */
    // Complexity: O(1)
    shouldEvict(incomingSize) {
        return (this.cache.size >= this.capacity ||
            this.currentMemory + incomingSize > this.maxMemory);
    }
    /**
     * Evict least recently used item
     */
    // Complexity: O(1)
    evictLRU() {
        if (!this.tail)
            return;
        const lru = this.tail;
        this.removeNode(lru);
        this.cache.delete(lru.key);
        this.currentMemory -= lru.size;
        this.stats.evictions++;
        this.emit('eviction', { key: lru.key, accessCount: lru.accessCount });
    }
    /**
     * Update hit rate statistic
     */
    // Complexity: O(1)
    updateHitRate() {
        const total = this.stats.hits + this.stats.misses;
        this.stats.hitRate = total > 0 ? this.stats.hits / total : 0;
    }
    /**
     * Estimate size of value in bytes
     */
    // Complexity: O(N)
    estimateSize(value) {
        if (typeof value === 'string') {
            return value.length * 2; // UTF-16
        }
        if (typeof value === 'number') {
            return 8;
        }
        if (Buffer.isBuffer(value)) {
            return value.length;
        }
        // Rough estimate for objects
        return JSON.stringify(value).length * 2;
    }
    /**
     * Get current size
     */
    get size() {
        return this.cache.size;
    }
}
exports.LRUCache = LRUCache;
/**
 * 🗜️ PatternDeduplicator - Compresses repetitive patterns
 *
 * Identifies and deduplicates common patterns in selector data
 * to reduce memory footprint and improve lookup speed.
 */
class PatternDeduplicator extends events_1.EventEmitter {
    patterns = new Map();
    patternIndex = new Map(); // hash -> pattern ID
    nextPatternId = 1;
    /**
     * Extract and deduplicate patterns from selectors
     */
    // Complexity: O(N*M) — nested iteration detected
    deduplicate(selectors) {
        const compressed = new Map();
        //         const originalSize = selectors.join(').length;
        //         for (const selector of selectors) {
        // Extract common patterns
        const patterns = this.extractPatterns(selector);
        for (const pattern of patterns) {
            const patternId = this.getOrCreatePattern(pattern, selector);
            compressed.set(selector, patternId);
        }
    }
    // Calculate compression ratio
    compressedSize = this.calculateCompressedSize();
    compressionRatio = originalSize > 0
        ? (1 - compressedSize / originalSize) * 100
        : 0;
    //         this.emit('deduplicated', {
    //             originalSelectors: selectors.length,
    //             uniquePatterns: this.patterns.size,
    compressionRatio;
    //         });
    //         return {
    //             compressed,
    //             patterns: Array.from(this.patterns.values()),
    compressionRatio;
    //         };
    //     }
    /**
     * Extract patterns from a selector
     */
    // Complexity: O(N) — linear iteration
    //     private extractPatterns(selector: string): string[] {
    patterns = [];
    // Common CSS selector patterns
    patternRegexes = [
        /\[data-[\w-]+\]/g, // data attributes
        /\.[\w-]+/g, // classes
        /#[\w-]+/g, // IDs
        /\[aria-[\w-]+\]/g, // ARIA attributes
        /input\[type="[\w]+"\]/g, // input types
        /\[role="[\w]+"\]/g, // roles
    ];
    //         for (const regex of patternRegexes) {
    matches = selector.match(regex);
    if(matches) {
        patterns.push(...matches);
    }
}
exports.PatternDeduplicator = PatternDeduplicator;
// If no patterns found, use the whole selector
//         if (patterns.length === 0) {
patterns.push(selector);
//         }
return patterns;
//     }
/**
 * Get existing pattern or create new one
 */
// Complexity: O(1) — hash/map lookup
//     private getOrCreatePattern(pattern: string, context: string): string {
const hash = this.hashPattern(pattern);
if (this.patternIndex.has(hash)) {
    const id = this.patternIndex.get(hash);
    const existing = this.patterns.get(id);
    existing.frequency++;
    existing.lastSeen = Date.now();
    if (!existing.contexts.includes(context)) {
        existing.contexts.push(context);
    }
    return id;
}
// Create new pattern
const id = `p${this.nextPatternId++}`;
const newPattern = {
    id,
    pattern,
    frequency: 1,
    lastSeen: Date.now(),
    contexts: [context]
};
this.patterns.set(id, newPattern);
this.patternIndex.set(hash, id);
return id;
//     }
/**
 * Simple hash function for patterns
 */
// Complexity: O(N) — linear iteration
//     private hashPattern(pattern: string): string {
let hash = 0;
for (let i = 0; i < pattern.length; i++) {
    const char = pattern.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
}
return hash.toString(36);
//     }
/**
 * Calculate compressed size
 */
// Complexity: O(N) — linear iteration
//     private calculateCompressedSize(): number {
let size = 0;
for (const pattern of this.patterns.values()) {
    size += pattern.pattern.length + pattern.id.length;
}
return size;
//     }
/**
 * Get most common patterns
 */
// Complexity: O(N log N) — sort operation
//     getTopPatterns(count: number = 20): Pattern[] {
return Array.from(this.patterns.values())
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, count);
//     }
/**
 * Clear all patterns
 */
// Complexity: O(1)
//     clear(): void {
//         this.patterns.clear();
//         this.patternIndex.clear();
//         this.nextPatternId = 1;
//     }
// }
/**
 * 🧠 NeuralOptimizer - Main Knowledge Optimization Engine
 *
 * Combines LRU caching and pattern deduplication for optimal
 * memory usage and fast selector lookups.
 */
class NeuralOptimizer extends events_1.EventEmitter {
    selectorCache;
    heuristicsCache;
    deduplicator;
    compressionEnabled = true;
    constructor(options) {
        super();
        const opts = {
            selectorCacheSize: 5000,
            heuristicsCacheSize: 1000,
            maxMemoryMB: 150,
            ...options
        };
        this.selectorCache = new LRUCache(opts.selectorCacheSize, opts.maxMemoryMB * 0.6);
        this.heuristicsCache = new LRUCache(opts.heuristicsCacheSize, opts.maxMemoryMB * 0.4);
        this.deduplicator = new PatternDeduplicator();
        // Forward events
        this.selectorCache.on('eviction', (data) => {
            this.emit('selector-eviction', data);
        });
        this.heuristicsCache.on('eviction', (data) => {
            this.emit('heuristic-eviction', data);
        });
    }
    /**
     * Cache a selector mapping
     */
    // Complexity: O(1)
    cacheSelector(intent, selector) {
        this.selectorCache.put(intent, selector);
    }
    /**
     * Get cached selector
     */
    // Complexity: O(1) — hash/map lookup
    getSelector(intent) {
        return this.selectorCache.get(intent);
    }
    /**
     * Cache heuristic data
     */
    // Complexity: O(1)
    cacheHeuristic(key, data) {
        this.heuristicsCache.put(key, data);
    }
    /**
     * Get cached heuristic
     */
    // Complexity: O(1) — hash/map lookup
    getHeuristic(key) {
        return this.heuristicsCache.get(key);
    }
    /**
     * Compress and optimize global_heuristics.json
     */
    // Complexity: O(1) — amortized
    async optimizeHeuristicsFile(filePath) {
        // Read original file
        // SAFETY: async operation — wrap in try-catch for production resilience
        const content = await fs.promises.readFile(filePath, 'utf-8');
        const originalSize = Buffer.byteLength(content, 'utf-8');
        // Parse JSON
        const heuristics = JSON.parse(content);
        // Extract all selectors
        const selectors = this.extractSelectorsFromHeuristics(heuristics);
        // Deduplicate patterns
        const { compressed, patterns, compressionRatio } = this.deduplicator.deduplicate(selectors);
        // Create optimized structure
        const optimized = {
            version: '1.0',
            compressionRatio,
            patterns,
            selectors: compressed,
            metadata: {
                originalSize,
                compressedSize: 0,
                patternCount: patterns.length,
                timestamp: Date.now()
            }
        };
        // Compress with gzip
        const jsonStr = JSON.stringify(optimized);
        // SAFETY: async operation — wrap in try-catch for production resilience
        const compressedBuffer = await this.gzipCompress(jsonStr);
        const compressedSize = compressedBuffer.length;
        optimized.metadata.compressedSize = compressedSize;
        // Write optimized file
        const optimizedPath = filePath.replace('.json', '.optimized.json.gz');
        // SAFETY: async operation — wrap in try-catch for production resilience
        await fs.promises.writeFile(optimizedPath, compressedBuffer);
        this.emit('optimization-complete', {
            originalSize,
            compressedSize,
            compressionRatio: ((1 - compressedSize / originalSize) * 100).toFixed(2),
            patternCount: patterns.length
        });
        return {
            originalSize,
            compressedSize,
            compressionRatio: (1 - compressedSize / originalSize) * 100,
            patternCount: patterns.length
        };
    }
    /**
     * Load optimized heuristics file
     */
    // Complexity: O(N) — potential recursive descent
    async loadOptimizedHeuristics(filePath) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const compressed = await fs.promises.readFile(filePath);
        // SAFETY: async operation — wrap in try-catch for production resilience
        const decompressed = await this.gzipDecompress(compressed);
        return JSON.parse(decompressed);
    }
    /**
     * Extract selectors from heuristics object
     */
    // Complexity: O(N*M) — nested iteration detected
    extractSelectorsFromHeuristics(obj, selectors = []) {
        if (typeof obj === 'string') {
            // Check if it looks like a selector
            if (obj.includes('.') || obj.includes('#') || obj.includes('[')) {
                selectors.push(obj);
            }
        }
        else if (Array.isArray(obj)) {
            for (const item of obj) {
                this.extractSelectorsFromHeuristics(item, selectors);
            }
        }
        else if (typeof obj === 'object' && obj !== null) {
            for (const key of Object.keys(obj)) {
                if (key === 'selector' || key === 'selectors' || key.includes('Selector')) {
                    const value = obj[key];
                    if (typeof value === 'string') {
                        selectors.push(value);
                    }
                    else if (Array.isArray(value)) {
                        selectors.push(...value.filter((v) => typeof v === 'string'));
                    }
                }
                this.extractSelectorsFromHeuristics(obj[key], selectors);
            }
        }
        return selectors;
    }
    /**
     * Gzip compress
     */
    // Complexity: O(1)
    gzipCompress(data) {
        return new Promise((resolve, reject) => {
            zlib.gzip(data, (err, result) => {
                if (err)
                    reject(err);
                else
                    resolve(result);
            });
        });
    }
    /**
     * Gzip decompress
     */
    // Complexity: O(1)
    gzipDecompress(data) {
        return new Promise((resolve, reject) => {
            zlib.gunzip(data, (err, result) => {
                if (err)
                    reject(err);
                else
                    resolve(result.toString('utf-8'));
            });
        });
    }
    /**
     * Get combined cache statistics
     */
    // Complexity: O(1)
    getStats() {
        return {
            selectors: this.selectorCache.getStats(),
            heuristics: this.heuristicsCache.getStats(),
            topPatterns: this.deduplicator.getTopPatterns(10)
        };
    }
    /**
     * Clear all caches
     */
    // Complexity: O(1)
    clear() {
        this.selectorCache.clear();
        this.heuristicsCache.clear();
        this.deduplicator.clear();
        this.emit('cleared');
    }
    /**
     * Get hot selectors for preloading
     */
    // Complexity: O(1)
    getHotSelectors(count = 50) {
        return this.selectorCache.getHotItems(count);
    }
    /**
     * Preload frequently used selectors
     */
    // Complexity: O(N) — linear iteration
    preload(selectors) {
        for (const { intent, selector } of selectors) {
            this.cacheSelector(intent, selector);
        }
        this.emit('preloaded', { count: selectors.length });
    }
}
exports.NeuralOptimizer = NeuralOptimizer;
// Export singleton instance
exports.neuralOptimizer = new NeuralOptimizer();
