"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                               ║
 * ║   AETERNA SHARDING ENGINE                                                      ║
 * ║   "Split tests intelligently across shards"                                   ║
 * ║                                                                               ║
 * ║   TODO B #16 - Performance: Test Sharding                                     ║
 * ║                                                                               ║
 * ║   © 2025-2026 Aeterna | Dimitar Prodromov                                        ║
 * ║                                                                               ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getShardingEngine = exports.ShardingEngine = void 0;
// ═══════════════════════════════════════════════════════════════════════════════
// SHARDING ENGINE
// ═══════════════════════════════════════════════════════════════════════════════
class ShardingEngine {
    static instance;
    testHistory = new Map();
    config = {
        strategy: 'duration',
        preserveOrder: false,
        respectDependencies: true,
    };
    static getInstance() {
        if (!ShardingEngine.instance) {
            ShardingEngine.instance = new ShardingEngine();
        }
        return ShardingEngine.instance;
    }
    // ─────────────────────────────────────────────────────────────────────────
    // CONFIGURATION
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Configure sharding
     */
    // Complexity: O(1)
    configure(config) {
        this.config = { ...this.config, ...config };
    }
    // ─────────────────────────────────────────────────────────────────────────
    // SHARDING
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Create shards from tests
     */
    // Complexity: O(N) — linear scan
    createShards(tests, shardCount) {
        if (shardCount <= 0) {
            throw new Error('Shard count must be positive');
        }
        if (tests.length === 0) {
            return this.createEmptyShards(shardCount);
        }
        // Estimate durations from history if not provided
        const testsWithDurations = tests.map((test) => ({
            ...test,
            duration: test.duration || this.estimateDuration(test.id),
        }));
        switch (this.config.strategy) {
            case 'count':
                return this.shardByCount(testsWithDurations, shardCount);
            case 'duration':
                return this.shardByDuration(testsWithDurations, shardCount);
            case 'file':
                return this.shardByFile(testsWithDurations, shardCount);
            case 'round-robin':
                return this.shardRoundRobin(testsWithDurations, shardCount);
            case 'hash':
                return this.shardByHash(testsWithDurations, shardCount);
            case 'weighted':
                return this.shardByWeight(testsWithDurations, shardCount);
            default:
                return this.shardByCount(testsWithDurations, shardCount);
        }
    }
    /**
     * Get shard for specific index
     */
    // Complexity: O(1)
    getShard(tests, shardIndex, totalShards) {
        const shards = this.createShards(tests, totalShards);
        return shards[shardIndex] || this.createEmptyShard(shardIndex, totalShards);
    }
    /**
     * Calculate optimal shard count
     */
    // Complexity: O(1)
    calculateOptimalShardCount(tests, options = {}) {
        const { targetDuration = 300000, // 5 minutes
        maxDuration = 600000, // 10 minutes
        minTestsPerShard = 1, maxShards = 50, } = options;
        const totalDuration = tests.reduce((sum, t) => sum + (t.duration || this.estimateDuration(t.id)), 0);
        // Calculate based on target duration
        let optimalByDuration = Math.ceil(totalDuration / targetDuration);
        // Ensure minimum tests per shard
        const optimalByCount = Math.ceil(tests.length / minTestsPerShard);
        // Take the larger to satisfy both constraints
        let optimal = Math.max(optimalByDuration, 1);
        // But don't exceed max shards or test count
        optimal = Math.min(optimal, maxShards, tests.length);
        return optimal;
    }
    // ─────────────────────────────────────────────────────────────────────────
    // DURATION TRACKING
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Record test duration for future estimation
     */
    // Complexity: O(1) — lookup
    recordDuration(testId, duration) {
        const history = this.testHistory.get(testId) || [];
        history.push(duration);
        // Keep last 10 runs
        if (history.length > 10) {
            history.shift();
        }
        this.testHistory.set(testId, history);
    }
    /**
     * Estimate duration based on history
     */
    // Complexity: O(N log N) — sort
    estimateDuration(testId) {
        const history = this.testHistory.get(testId);
        if (!history || history.length === 0) {
            return 60000; // Default 1 minute
        }
        // Use median for robustness
        const sorted = [...history].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
    }
    /**
     * Import duration history
     */
    // Complexity: O(N) — loop
    importHistory(history) {
        for (const [testId, durations] of Object.entries(history)) {
            this.testHistory.set(testId, durations);
        }
    }
    /**
     * Export duration history
     */
    // Complexity: O(1)
    exportHistory() {
        return Object.fromEntries(this.testHistory);
    }
    // ─────────────────────────────────────────────────────────────────────────
    // REPORTING
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Merge shard reports
     */
    // Complexity: O(N) — linear scan
    mergeReports(reports) {
        const merged = {
            totalTests: 0,
            totalDuration: 0,
            passed: 0,
            failed: 0,
            skipped: 0,
            shardBalance: 0,
        };
        for (const report of reports) {
            merged.totalTests += report.testsRun;
            merged.totalDuration = Math.max(merged.totalDuration, report.duration);
            merged.passed += report.passed;
            merged.failed += report.failed;
            merged.skipped += report.skipped;
        }
        // Calculate balance (how evenly distributed durations are)
        if (reports.length > 1) {
            const durations = reports.map((r) => r.duration);
            const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
            const variance = durations.reduce((sum, d) => sum + Math.pow(d - avg, 2), 0) / durations.length;
            const stdDev = Math.sqrt(variance);
            merged.shardBalance = 1 - stdDev / avg; // 1 = perfect balance, 0 = very unbalanced
        }
        else {
            merged.shardBalance = 1;
        }
        return merged;
    }
    // ─────────────────────────────────────────────────────────────────────────
    // PRIVATE - SHARDING STRATEGIES
    // ─────────────────────────────────────────────────────────────────────────
    // Complexity: O(N) — loop
    shardByCount(tests, shardCount) {
        const shards = this.createEmptyShards(shardCount);
        const testsPerShard = Math.ceil(tests.length / shardCount);
        for (let i = 0; i < tests.length; i++) {
            const shardIndex = Math.floor(i / testsPerShard);
            if (shardIndex < shardCount) {
                shards[shardIndex].tests.push(tests[i]);
                shards[shardIndex].estimatedDuration += tests[i].duration || 0;
            }
        }
        return shards;
    }
    // Complexity: O(N*M) — nested iteration
    shardByDuration(tests, shardCount) {
        const shards = this.createEmptyShards(shardCount);
        // Sort tests by duration (longest first) for better balancing
        const sortedTests = [...tests].sort((a, b) => (b.duration || 0) - (a.duration || 0));
        // Greedy assignment: always add to shard with lowest total duration
        for (const test of sortedTests) {
            const targetShard = shards.reduce((min, shard) => shard.estimatedDuration < min.estimatedDuration ? shard : min);
            targetShard.tests.push(test);
            targetShard.estimatedDuration += test.duration || 0;
        }
        return shards;
    }
    // Complexity: O(N*M) — nested iteration
    shardByFile(tests, shardCount) {
        // Group tests by file
        const byFile = new Map();
        for (const test of tests) {
            const file = test.file;
            const existing = byFile.get(file) || [];
            existing.push(test);
            byFile.set(file, existing);
        }
        // Create file groups
        const fileGroups = [...byFile.entries()].map(([file, fileTests]) => ({
            file,
            tests: fileTests,
            duration: fileTests.reduce((sum, t) => sum + (t.duration || 0), 0),
        }));
        // Sort by duration and distribute
        fileGroups.sort((a, b) => b.duration - a.duration);
        const shards = this.createEmptyShards(shardCount);
        for (const group of fileGroups) {
            const targetShard = shards.reduce((min, shard) => shard.estimatedDuration < min.estimatedDuration ? shard : min);
            targetShard.tests.push(...group.tests);
            targetShard.estimatedDuration += group.duration;
        }
        return shards;
    }
    // Complexity: O(N) — loop
    shardRoundRobin(tests, shardCount) {
        const shards = this.createEmptyShards(shardCount);
        for (let i = 0; i < tests.length; i++) {
            const shardIndex = i % shardCount;
            shards[shardIndex].tests.push(tests[i]);
            shards[shardIndex].estimatedDuration += tests[i].duration || 0;
        }
        return shards;
    }
    // Complexity: O(N) — loop
    shardByHash(tests, shardCount) {
        const shards = this.createEmptyShards(shardCount);
        const seed = this.config.seed || 42;
        for (const test of tests) {
            const hash = this.hashString(test.id + seed);
            const shardIndex = Math.abs(hash) % shardCount;
            shards[shardIndex].tests.push(test);
            shards[shardIndex].estimatedDuration += test.duration || 0;
        }
        return shards;
    }
    // Complexity: O(N log N) — sort
    shardByWeight(tests, shardCount) {
        const shards = this.createEmptyShards(shardCount);
        // Use priority as weight
        const sortedTests = [...tests].sort((a, b) => (b.priority || 0) - (a.priority || 0));
        // High priority tests first, distributed across shards
        for (let i = 0; i < sortedTests.length; i++) {
            const test = sortedTests[i];
            const targetShard = shards.reduce((min, shard) => (shard.weight < min.weight ? shard : min));
            targetShard.tests.push(test);
            targetShard.estimatedDuration += test.duration || 0;
            targetShard.weight += test.priority || 1;
        }
        return shards;
    }
    // ─────────────────────────────────────────────────────────────────────────
    // UTILITIES
    // ─────────────────────────────────────────────────────────────────────────
    // Complexity: O(1)
    createEmptyShards(count) {
        return Array.from({ length: count }, (_, i) => this.createEmptyShard(i, count));
    }
    // Complexity: O(1)
    createEmptyShard(index, total) {
        return {
            index,
            total,
            tests: [],
            estimatedDuration: 0,
            weight: 0,
        };
    }
    // Complexity: O(N) — loop
    hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash = hash & hash;
        }
        return hash;
    }
}
exports.ShardingEngine = ShardingEngine;
// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════
const getShardingEngine = () => ShardingEngine.getInstance();
exports.getShardingEngine = getShardingEngine;
exports.default = ShardingEngine;
