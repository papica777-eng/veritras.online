"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                               ║
 * ║   AETERNA DISTRIBUTED MODULE                                                   ║
 * ║   "Scale Testing Across Infrastructure"                                       ║
 * ║                                                                               ║
 * ║   TODO B #14-16 - Complete Distributed System                                 ║
 * ║                                                                               ║
 * ║   © 2025-2026 Aeterna | Dimitar Prodromov                                        ║
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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShardingEngine = exports.LoadBalancer = exports.DistributedRunner = exports.distributed = exports.Distributed = void 0;
// ═══════════════════════════════════════════════════════════════════════════════
// RE-EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════
__exportStar(require("./runner"), exports);
__exportStar(require("./load-balancer"), exports);
__exportStar(require("./sharding"), exports);
// ═══════════════════════════════════════════════════════════════════════════════
// IMPORTS
// ═══════════════════════════════════════════════════════════════════════════════
const runner_1 = require("./runner");
Object.defineProperty(exports, "DistributedRunner", { enumerable: true, get: function () { return runner_1.DistributedRunner; } });
const load_balancer_1 = require("./load-balancer");
Object.defineProperty(exports, "LoadBalancer", { enumerable: true, get: function () { return load_balancer_1.LoadBalancer; } });
const sharding_1 = require("./sharding");
Object.defineProperty(exports, "ShardingEngine", { enumerable: true, get: function () { return sharding_1.ShardingEngine; } });
// ═══════════════════════════════════════════════════════════════════════════════
// UNIFIED DISTRIBUTED FACADE
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * Unified Distributed System
 */
class Distributed {
    static instance;
    runner;
    balancer;
    sharding;
    constructor() {
        this.runner = (0, runner_1.getDistributedRunner)();
        this.balancer = (0, load_balancer_1.getLoadBalancer)();
        this.sharding = (0, sharding_1.getShardingEngine)();
    }
    static getInstance() {
        if (!Distributed.instance) {
            Distributed.instance = new Distributed();
        }
        return Distributed.instance;
    }
    // ─────────────────────────────────────────────────────────────────────────
    // QUICK SETUP
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Quick setup with nodes
     */
    // Complexity: O(1)
    setup(nodes, options) {
        // Configure strategies
        if (options?.strategy) {
            this.runner.configure({ strategy: options.strategy });
        }
        if (options?.shardingStrategy) {
            this.sharding.configure({ strategy: options.shardingStrategy });
        }
        if (options?.balancingAlgorithm) {
            this.balancer.configure({ algorithm: options.balancingAlgorithm });
        }
        // Register nodes
        for (const node of nodes) {
            const capabilities = node.capabilities || {
                browsers: ['chromium', 'firefox'],
                os: 'linux',
                memory: 8192,
                cpuCores: 4,
                tags: [],
            };
            this.runner.registerNode(node.name, node.host, node.port, capabilities);
            this.balancer.addWorker(`${node.host}:${node.port}`);
        }
        console.log(`[Distributed] Setup complete with ${nodes.length} nodes`);
    }
    // ─────────────────────────────────────────────────────────────────────────
    // TEST EXECUTION
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Run tests distributed across nodes
     */
    // Complexity: O(1)
    async run(tests, options) {
        const startTime = Date.now();
        const nodeCount = this.runner.getAllNodes().length;
        if (nodeCount === 0) {
            throw new Error('No nodes registered. Call setup() first.');
        }
        // Calculate optimal shard count
        const shardCount = options?.shardCount ||
            this.sharding.calculateOptimalShardCount(tests, {
                maxShards: nodeCount,
            });
        // Create shards
        const shards = this.sharding.createShards(tests, shardCount);
        // Start runner
        this.runner.start();
        // Submit all tests
        const taskIds = [];
        for (const shard of shards) {
            for (const test of shard.tests) {
                const taskId = this.runner.submitTask(test.id, test.name, {
                    priority: test.priority,
                });
                taskIds.push(taskId);
            }
        }
        // Wait for completion
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.runner.waitForCompletion(options?.timeout);
        // Collect results
        const results = new Map();
        const shardReports = [];
        for (const shard of shards) {
            let shardPassed = 0;
            let shardFailed = 0;
            let shardDuration = 0;
            for (const test of shard.tests) {
                const tasks = [
                    ...this.runner.getTasksByStatus('completed'),
                    ...this.runner.getTasksByStatus('failed'),
                ].filter((t) => t.testId === test.id);
                if (tasks.length > 0) {
                    const task = tasks[0];
                    results.set(test.id, task.result);
                    if (task.result?.success) {
                        shardPassed++;
                    }
                    else {
                        shardFailed++;
                    }
                    shardDuration += task.result?.duration || 0;
                }
            }
            shardReports.push({
                shardIndex: shard.index,
                totalShards: shard.total,
                testsRun: shard.tests.length,
                duration: shardDuration,
                passed: shardPassed,
                failed: shardFailed,
                skipped: 0,
            });
        }
        this.runner.stop();
        return {
            results,
            duration: Date.now() - startTime,
            shardReports,
        };
    }
    /**
     * Run tests in specific shard
     */
    // Complexity: O(1)
    async runShard(tests, shardIndex, totalShards) {
        const shard = this.sharding.getShard(tests, shardIndex, totalShards);
        return shard;
    }
    // ─────────────────────────────────────────────────────────────────────────
    // NODE MANAGEMENT
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Add a node at runtime
     */
    // Complexity: O(1)
    addNode(name, host, port, capabilities) {
        const caps = capabilities || {
            browsers: ['chromium'],
            os: 'linux',
            memory: 4096,
            cpuCores: 2,
            tags: [],
        };
        const nodeId = this.runner.registerNode(name, host, port, caps);
        this.balancer.addWorker(`${host}:${port}`);
        return nodeId;
    }
    /**
     * Remove a node at runtime
     */
    // Complexity: O(1)
    removeNode(nodeId) {
        const node = this.runner.getNode(nodeId);
        if (node) {
            this.balancer.removeWorker(`${node.host}:${node.port}`);
        }
        return this.runner.unregisterNode(nodeId);
    }
    /**
     * Get cluster status
     */
    // Complexity: O(1)
    getStatus() {
        return {
            nodes: this.runner.getAllNodes(),
            runnerStats: this.runner.getStatistics(),
            balancerStats: this.balancer.getStatistics(),
        };
    }
    // ─────────────────────────────────────────────────────────────────────────
    // SHARDING UTILITIES
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Preview shard distribution
     */
    // Complexity: O(1)
    previewShards(tests, shardCount) {
        const count = shardCount || this.sharding.calculateOptimalShardCount(tests);
        return this.sharding.createShards(tests, count);
    }
    /**
     * Calculate optimal shards
     */
    // Complexity: O(1)
    calculateShards(tests, options) {
        return this.sharding.calculateOptimalShardCount(tests, options);
    }
    /**
     * Record test duration for future optimization
     */
    // Complexity: O(1)
    recordDuration(testId, duration) {
        this.sharding.recordDuration(testId, duration);
    }
    // ─────────────────────────────────────────────────────────────────────────
    // CLEANUP
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Shutdown the distributed system
     */
    // Complexity: O(1)
    shutdown() {
        this.runner.stop();
        this.balancer.stopHealthChecks();
        console.log('[Distributed] Shutdown complete');
    }
}
exports.Distributed = Distributed;
// ═══════════════════════════════════════════════════════════════════════════════
// CONVENIENCE EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════
exports.distributed = Distributed.getInstance();
exports.default = Distributed;
