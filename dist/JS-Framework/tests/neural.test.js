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
 * For licensing inquiries: dimitar.prodromov@QAntum.dev
 * ═══════════════════════════════════════════════════════════════════════════════
 */
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const neural_optimizer_1 = require("../src/neural/neural-optimizer");
// ═══════════════════════════════════════════════════════════════════════════════
// 🧠 NEURAL OPTIMIZER TESTS - LRU Cache & Pattern Deduplication
// ═══════════════════════════════════════════════════════════════════════════════
(0, vitest_1.describe)('🧠 LRUCache - Least Recently Used Cache', () => {
    let cache;
    (0, vitest_1.beforeEach)(() => {
        cache = new neural_optimizer_1.LRUCache(5, 10);
    });
    (0, vitest_1.describe)('📥 Basic Operations', () => {
        (0, vitest_1.it)('should store and retrieve values', () => {
            cache.put('key1', 'value1');
            (0, vitest_1.expect)(cache.get('key1')).toBe('value1');
        });
        (0, vitest_1.it)('should return undefined for missing keys', () => {
            (0, vitest_1.expect)(cache.get('nonexistent')).toBeUndefined();
        });
        (0, vitest_1.it)('should update existing keys', () => {
            cache.put('key1', 'value1');
            cache.put('key1', 'updated');
            (0, vitest_1.expect)(cache.get('key1')).toBe('updated');
            (0, vitest_1.expect)(cache.size).toBe(1);
        });
        (0, vitest_1.it)('should check key existence', () => {
            cache.put('key1', 'value1');
            (0, vitest_1.expect)(cache.has('key1')).toBe(true);
            (0, vitest_1.expect)(cache.has('key2')).toBe(false);
        });
        (0, vitest_1.it)('should delete keys', () => {
            cache.put('key1', 'value1');
            (0, vitest_1.expect)(cache.delete('key1')).toBe(true);
            (0, vitest_1.expect)(cache.get('key1')).toBeUndefined();
            (0, vitest_1.expect)(cache.delete('key1')).toBe(false);
        });
        (0, vitest_1.it)('should clear all entries', () => {
            cache.put('key1', 'value1');
            cache.put('key2', 'value2');
            cache.clear();
            (0, vitest_1.expect)(cache.size).toBe(0);
            (0, vitest_1.expect)(cache.get('key1')).toBeUndefined();
        });
    });
    (0, vitest_1.describe)('🔄 LRU Eviction', () => {
        (0, vitest_1.it)('should evict least recently used when capacity reached', () => {
            // Fill cache to capacity
            cache.put('key1', 'value1');
            cache.put('key2', 'value2');
            cache.put('key3', 'value3');
            cache.put('key4', 'value4');
            cache.put('key5', 'value5');
            // Add one more (should evict key1)
            cache.put('key6', 'value6');
            (0, vitest_1.expect)(cache.get('key1')).toBeUndefined();
            (0, vitest_1.expect)(cache.get('key6')).toBe('value6');
        });
        (0, vitest_1.it)('should keep recently accessed items', () => {
            cache.put('key1', 'value1');
            cache.put('key2', 'value2');
            cache.put('key3', 'value3');
            cache.put('key4', 'value4');
            cache.put('key5', 'value5');
            // Access key1 to make it recently used
            cache.get('key1');
            // Add new item (should evict key2, not key1)
            cache.put('key6', 'value6');
            (0, vitest_1.expect)(cache.get('key1')).toBe('value1');
            (0, vitest_1.expect)(cache.get('key2')).toBeUndefined();
        });
    });
    (0, vitest_1.describe)('📊 Statistics', () => {
        (0, vitest_1.it)('should track hits and misses', () => {
            cache.put('key1', 'value1');
            cache.get('key1'); // hit
            cache.get('key1'); // hit
            cache.get('key2'); // miss
            const stats = cache.getStats();
            (0, vitest_1.expect)(stats.hits).toBe(2);
            (0, vitest_1.expect)(stats.misses).toBe(1);
            (0, vitest_1.expect)(stats.hitRate).toBeCloseTo(0.667, 1);
        });
        (0, vitest_1.it)('should track evictions', () => {
            for (let i = 0; i < 10; i++) {
                cache.put(`key${i}`, `value${i}`);
            }
            const stats = cache.getStats();
            (0, vitest_1.expect)(stats.evictions).toBe(5); // 10 items, capacity 5
        });
        (0, vitest_1.it)('should return hot items', () => {
            cache.put('key1', 'value1');
            cache.put('key2', 'value2');
            cache.put('key3', 'value3');
            // Access key2 multiple times
            cache.get('key2');
            cache.get('key2');
            cache.get('key2');
            cache.get('key1');
            const hotItems = cache.getHotItems(2);
            (0, vitest_1.expect)(hotItems[0].key).toBe('key2');
            (0, vitest_1.expect)(hotItems[0].accessCount).toBe(4); // 1 put + 3 gets
        });
    });
});
(0, vitest_1.describe)('🗜️ PatternDeduplicator - Selector Compression', () => {
    let deduplicator;
    (0, vitest_1.beforeEach)(() => {
        deduplicator = new neural_optimizer_1.PatternDeduplicator();
    });
    (0, vitest_1.afterEach)(() => {
        deduplicator.clear();
    });
    (0, vitest_1.describe)('🔍 Pattern Extraction', () => {
        (0, vitest_1.it)('should deduplicate identical selectors', () => {
            const selectors = [
                '.btn-primary',
                '.btn-primary',
                '.btn-primary',
                '.btn-secondary'
            ];
            const result = deduplicator.deduplicate(selectors);
            (0, vitest_1.expect)(result.patterns.length).toBeLessThan(selectors.length);
        });
        (0, vitest_1.it)('should extract common patterns', () => {
            const selectors = [
                'input[type="text"]',
                'input[type="email"]',
                'input[type="password"]',
                '[data-testid="submit"]',
                '[data-testid="cancel"]'
            ];
            const result = deduplicator.deduplicate(selectors);
            (0, vitest_1.expect)(result.patterns.length).toBeGreaterThan(0);
        });
        (0, vitest_1.it)('should track pattern frequency', () => {
            const selectors = [
                '.btn-primary',
                '.btn-primary',
                '.btn-secondary'
            ];
            deduplicator.deduplicate(selectors);
            const topPatterns = deduplicator.getTopPatterns(1);
            (0, vitest_1.expect)(topPatterns[0].frequency).toBeGreaterThan(1);
        });
        (0, vitest_1.it)('should calculate compression ratio', () => {
            const selectors = [
                '.very-long-class-name-that-repeats',
                '.very-long-class-name-that-repeats',
                '.very-long-class-name-that-repeats',
                '.another-long-class-name',
                '.another-long-class-name'
            ];
            const result = deduplicator.deduplicate(selectors);
            (0, vitest_1.expect)(result.compressionRatio).toBeGreaterThan(0);
        });
    });
    (0, vitest_1.describe)('📋 Top Patterns', () => {
        (0, vitest_1.it)('should return most common patterns', () => {
            const selectors = Array(10).fill('.common-class')
                .concat(Array(5).fill('.less-common'))
                .concat(['.unique']);
            deduplicator.deduplicate(selectors);
            const topPatterns = deduplicator.getTopPatterns(2);
            (0, vitest_1.expect)(topPatterns[0].pattern).toContain('common-class');
            (0, vitest_1.expect)(topPatterns[0].frequency).toBeGreaterThan(topPatterns[1].frequency);
        });
    });
});
(0, vitest_1.describe)('🧠 NeuralOptimizer - Main Optimization Engine', () => {
    let optimizer;
    (0, vitest_1.beforeEach)(() => {
        optimizer = new neural_optimizer_1.NeuralOptimizer({
            selectorCacheSize: 100,
            heuristicsCacheSize: 50,
            maxMemoryMB: 10
        });
    });
    (0, vitest_1.afterEach)(() => {
        optimizer.clear();
    });
    (0, vitest_1.describe)('📥 Selector Caching', () => {
        (0, vitest_1.it)('should cache and retrieve selectors', () => {
            optimizer.cacheSelector('click login button', '#login-btn');
            (0, vitest_1.expect)(optimizer.getSelector('click login button')).toBe('#login-btn');
        });
        (0, vitest_1.it)('should return undefined for missing selectors', () => {
            (0, vitest_1.expect)(optimizer.getSelector('unknown')).toBeUndefined();
        });
    });
    (0, vitest_1.describe)('📊 Heuristics Caching', () => {
        (0, vitest_1.it)('should cache and retrieve heuristics', () => {
            const heuristic = { type: 'button', score: 0.9 };
            optimizer.cacheHeuristic('button-detection', heuristic);
            (0, vitest_1.expect)(optimizer.getHeuristic('button-detection')).toEqual(heuristic);
        });
    });
    (0, vitest_1.describe)('📈 Statistics', () => {
        (0, vitest_1.it)('should return combined stats', () => {
            optimizer.cacheSelector('intent1', '.selector1');
            optimizer.cacheSelector('intent2', '.selector2');
            optimizer.cacheHeuristic('key1', { data: true });
            const stats = optimizer.getStats();
            (0, vitest_1.expect)(stats.selectors.itemCount).toBe(2);
            (0, vitest_1.expect)(stats.heuristics.itemCount).toBe(1);
        });
        (0, vitest_1.it)('should return hot selectors', () => {
            optimizer.cacheSelector('intent1', '.selector1');
            optimizer.getSelector('intent1');
            optimizer.getSelector('intent1');
            const hotItems = optimizer.getHotSelectors(1);
            (0, vitest_1.expect)(hotItems[0].key).toBe('intent1');
            (0, vitest_1.expect)(hotItems[0].accessCount).toBeGreaterThan(1);
        });
    });
    (0, vitest_1.describe)('📦 Preloading', () => {
        (0, vitest_1.it)('should preload selectors', () => {
            const selectors = [
                { intent: 'click submit', selector: '#submit' },
                { intent: 'click cancel', selector: '#cancel' },
                { intent: 'fill email', selector: 'input[type="email"]' }
            ];
            optimizer.preload(selectors);
            (0, vitest_1.expect)(optimizer.getSelector('click submit')).toBe('#submit');
            (0, vitest_1.expect)(optimizer.getSelector('click cancel')).toBe('#cancel');
            (0, vitest_1.expect)(optimizer.getSelector('fill email')).toBe('input[type="email"]');
        });
    });
    (0, vitest_1.describe)('🧹 Clear', () => {
        (0, vitest_1.it)('should clear all caches', () => {
            optimizer.cacheSelector('intent', '.selector');
            optimizer.cacheHeuristic('key', { data: true });
            optimizer.clear();
            (0, vitest_1.expect)(optimizer.getSelector('intent')).toBeUndefined();
            (0, vitest_1.expect)(optimizer.getHeuristic('key')).toBeUndefined();
        });
    });
});
