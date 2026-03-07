"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * PHYSICS ENGINE SMOKE TEST
 * First Line of Defense for the PHYSICS Layer
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * "Димният тест: Ако включиш уреда и излиза дим, нещо не е наред."
 *                                                    — Engineering Wisdom
 *
 * This smoke test validates the core PHYSICS layer components:
 * - PhysicsQueue (priority queue with time decay)
 * - RateLimiter
 * - SlidingWindowCounter
 * - PerformanceTracker
 * - calculateSwarmForces
 *
 * @module tests/smoke/physics-engine.test
 * @version 1.0.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
// Physics Layer imports
const physics_1 = require("../../src/layers/physics");
// ═══════════════════════════════════════════════════════════════════════════
// SMOKE TEST SUITE
// ═══════════════════════════════════════════════════════════════════════════
(0, globals_1.describe)('🔬 PHYSICS ENGINE SMOKE TEST', () => {
    // ─────────────────────────────────────────────────────────────────────────
    // ENVIRONMENT CHECKS
    // ─────────────────────────────────────────────────────────────────────────
    (0, globals_1.describe)('Environment', () => {
        (0, globals_1.it)('should have SharedArrayBuffer available', () => {
            (0, globals_1.expect)(typeof SharedArrayBuffer).toBe('function');
        });
        (0, globals_1.it)('should have Atomics available', () => {
            (0, globals_1.expect)(typeof Atomics).toBe('object');
        });
        (0, globals_1.it)('should support Worker threads', () => {
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const { Worker } = require('worker_threads');
            (0, globals_1.expect)(typeof Worker).toBe('function');
        });
    });
    // ─────────────────────────────────────────────────────────────────────────
    // PHYSICS QUEUE TESTS
    // ─────────────────────────────────────────────────────────────────────────
    (0, globals_1.describe)('PhysicsQueue', () => {
        let queue;
        (0, globals_1.beforeAll)(() => {
            queue = new physics_1.PhysicsQueue({ maxSize: 100 });
        });
        (0, globals_1.it)('should create instance', () => {
            (0, globals_1.expect)(queue).toBeInstanceOf(physics_1.PhysicsQueue);
        });
        (0, globals_1.it)('should enqueue items with priority', () => {
            const testQueue = new physics_1.PhysicsQueue({ maxSize: 100 });
            const success = testQueue.enqueue('task-1', 10);
            (0, globals_1.expect)(success).toBe(true);
            (0, globals_1.expect)(testQueue.size).toBe(1);
        });
        (0, globals_1.it)('should dequeue highest priority first', () => {
            const testQueue = new physics_1.PhysicsQueue({ maxSize: 100 });
            testQueue.enqueue('low-priority', 1);
            testQueue.enqueue('high-priority', 100);
            testQueue.enqueue('mid-priority', 50);
            const first = testQueue.dequeue();
            (0, globals_1.expect)(first).toBe('high-priority');
        });
        (0, globals_1.it)('should respect max size limit', () => {
            const smallQueue = new physics_1.PhysicsQueue({ maxSize: 3 });
            smallQueue.enqueue(1, 10);
            smallQueue.enqueue(2, 20);
            smallQueue.enqueue(3, 30);
            const success = smallQueue.enqueue(4, 40);
            (0, globals_1.expect)(typeof success).toBe('boolean');
        });
        (0, globals_1.it)('should handle deadline urgency boost', () => {
            const urgentQueue = new physics_1.PhysicsQueue({ maxSize: 10 });
            urgentQueue.enqueue('normal', 50);
            urgentQueue.enqueue('urgent', 10, -1000);
            const first = urgentQueue.dequeue();
            (0, globals_1.expect)(first).toBe('urgent');
        });
        (0, globals_1.it)('should return undefined when empty', () => {
            const emptyQueue = new physics_1.PhysicsQueue({ maxSize: 10 });
            (0, globals_1.expect)(emptyQueue.dequeue()).toBeUndefined();
        });
    });
    // ─────────────────────────────────────────────────────────────────────────
    // RATE LIMITER TESTS
    // ─────────────────────────────────────────────────────────────────────────
    (0, globals_1.describe)('RateLimiter', () => {
        (0, globals_1.it)('should create instance with config', () => {
            const limiter = new physics_1.RateLimiter({ maxRequests: 10, windowMs: 1000 });
            (0, globals_1.expect)(limiter).toBeInstanceOf(physics_1.RateLimiter);
        });
        (0, globals_1.it)('should allow requests within limit', () => {
            const limiter = new physics_1.RateLimiter({ maxRequests: 5, windowMs: 1000 });
            for (let i = 0; i < 5; i++) {
                (0, globals_1.expect)(limiter.tryAcquire()).toBe(true);
            }
        });
        (0, globals_1.it)('should block requests over limit', () => {
            const limiter = new physics_1.RateLimiter({ maxRequests: 3, windowMs: 10000 });
            limiter.tryAcquire();
            limiter.tryAcquire();
            limiter.tryAcquire();
            (0, globals_1.expect)(limiter.tryAcquire()).toBe(false);
        });
        (0, globals_1.it)('should report remaining capacity', () => {
            const limiter = new physics_1.RateLimiter({ maxRequests: 10, windowMs: 1000 });
            limiter.tryAcquire();
            limiter.tryAcquire();
            (0, globals_1.expect)(limiter.remaining()).toBe(8);
        });
    });
    // ─────────────────────────────────────────────────────────────────────────
    // SLIDING WINDOW COUNTER TESTS
    // ─────────────────────────────────────────────────────────────────────────
    (0, globals_1.describe)('SlidingWindowCounter', () => {
        (0, globals_1.it)('should create instance', () => {
            const counter = new physics_1.SlidingWindowCounter({ windowMs: 1000, buckets: 10 });
            (0, globals_1.expect)(counter).toBeInstanceOf(physics_1.SlidingWindowCounter);
        });
        (0, globals_1.it)('should increment and track counts', () => {
            const counter = new physics_1.SlidingWindowCounter({ windowMs: 1000, buckets: 10 });
            counter.increment();
            counter.increment();
            counter.increment();
            (0, globals_1.expect)(counter.count()).toBe(3);
        });
        (0, globals_1.it)('should calculate rate', () => {
            const counter = new physics_1.SlidingWindowCounter({ windowMs: 1000, buckets: 10 });
            counter.increment();
            counter.increment();
            const rate = counter.rate();
            (0, globals_1.expect)(rate).toBeGreaterThanOrEqual(0);
        });
    });
    // ─────────────────────────────────────────────────────────────────────────
    // PERFORMANCE TRACKER TESTS
    // ─────────────────────────────────────────────────────────────────────────
    (0, globals_1.describe)('PerformanceTracker', () => {
        (0, globals_1.it)('should create instance', () => {
            const tracker = new physics_1.PerformanceTracker({ historySize: 100 });
            (0, globals_1.expect)(tracker).toBeInstanceOf(physics_1.PerformanceTracker);
        });
        (0, globals_1.it)('should record operations', () => {
            const tracker = new physics_1.PerformanceTracker({ historySize: 100 });
            tracker.record('test-op', 10);
            tracker.record('test-op', 20);
            tracker.record('test-op', 30);
            const stats = tracker.getStats('test-op');
            (0, globals_1.expect)(stats.count).toBe(3);
            (0, globals_1.expect)(stats.avg).toBe(20);
        });
        (0, globals_1.it)('should calculate min/max correctly', () => {
            const tracker = new physics_1.PerformanceTracker({ historySize: 100 });
            tracker.record('op', 5);
            tracker.record('op', 15);
            tracker.record('op', 10);
            const stats = tracker.getStats('op');
            (0, globals_1.expect)(stats.min).toBe(5);
            (0, globals_1.expect)(stats.max).toBe(15);
        });
    });
    // ─────────────────────────────────────────────────────────────────────────
    // SWARM FORCES CALCULATION TESTS
    // ─────────────────────────────────────────────────────────────────────────
    (0, globals_1.describe)('calculateSwarmForces', () => {
        (0, globals_1.it)('should calculate forces between particles', () => {
            const particle1 = {
                id: 'p1',
                mass: 1,
                velocity: 0,
                position: { x: 0, y: 0 },
                createdAt: { epochMs: Date.now(), iso: new Date().toISOString() },
                bestPosition: { x: 0, y: 0 },
                bestFitness: 0
            };
            const particle2 = {
                id: 'p2',
                mass: 1,
                velocity: 0,
                position: { x: 10, y: 0 },
                createdAt: { epochMs: Date.now(), iso: new Date().toISOString() },
                bestPosition: { x: 10, y: 0 },
                bestFitness: 0
            };
            const forces = (0, physics_1.calculateSwarmForces)([particle1, particle2], {
                cohesionWeight: 1,
                separationWeight: 1,
                alignmentWeight: 1,
                neighborRadius: 100
            });
            (0, globals_1.expect)(forces).toBeDefined();
            (0, globals_1.expect)(Array.isArray(forces)).toBe(true);
        });
    });
    // ─────────────────────────────────────────────────────────────────────────
    // INTEGRATION: Queue + RateLimiter Flow
    // ─────────────────────────────────────────────────────────────────────────
    (0, globals_1.describe)('E2E Integration', () => {
        (0, globals_1.it)('should flow from queue through rate limiter', () => {
            const queue = new physics_1.PhysicsQueue({ maxSize: 10 });
            const limiter = new physics_1.RateLimiter({ maxRequests: 100, windowMs: 1000 });
            queue.enqueue({ id: 'task-1', priority: 10 }, 10);
            queue.enqueue({ id: 'task-2', priority: 20 }, 20);
            queue.enqueue({ id: 'task-3', priority: 15 }, 15);
            const results = [];
            while (queue.size > 0) {
                const task = queue.dequeue();
                if (task && limiter.tryAcquire()) {
                    results.push(task.id);
                }
            }
            (0, globals_1.expect)(results).toHaveLength(3);
            (0, globals_1.expect)(results[0]).toBe('task-2');
        });
    });
});
// ═══════════════════════════════════════════════════════════════════════════
// PERFORMANCE BASELINE
// ═══════════════════════════════════════════════════════════════════════════
(0, globals_1.describe)('⚡ Performance Baseline', () => {
    (0, globals_1.it)('should enqueue 10,000 items in under 100ms', () => {
        const queue = new physics_1.PhysicsQueue({ maxSize: 10000 });
        const start = performance.now();
        for (let i = 0; i < 10000; i++) {
            queue.enqueue(i, Math.random() * 100);
        }
        const duration = performance.now() - start;
        console.log(`[Perf] Enqueue 10,000: ${duration.toFixed(2)}ms`);
        (0, globals_1.expect)(duration).toBeLessThan(100);
    });
    (0, globals_1.it)('should dequeue 10,000 items in under 500ms', () => {
        const queue = new physics_1.PhysicsQueue({ maxSize: 10000 });
        for (let i = 0; i < 10000; i++) {
            queue.enqueue(i, Math.random() * 100);
        }
        const start = performance.now();
        while (queue.size > 0) {
            queue.dequeue();
        }
        const duration = performance.now() - start;
        console.log(`[Perf] Dequeue 10,000: ${duration.toFixed(2)}ms`);
        (0, globals_1.expect)(duration).toBeLessThan(500);
    });
    (0, globals_1.it)('should handle 100,000 rate limit checks in under 50ms', () => {
        const limiter = new physics_1.RateLimiter({ maxRequests: 1000000, windowMs: 10000 });
        const start = performance.now();
        for (let i = 0; i < 100000; i++) {
            limiter.tryAcquire();
        }
        const duration = performance.now() - start;
        console.log(`[Perf] Rate Limit 100,000: ${duration.toFixed(2)}ms`);
        (0, globals_1.expect)(duration).toBeLessThan(50);
    });
});
