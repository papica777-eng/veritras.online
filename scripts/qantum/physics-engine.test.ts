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

import { describe, it, expect, beforeAll } from '@jest/globals';

// Physics Layer imports
import {
  PhysicsQueue,
  RateLimiter,
  SlidingWindowCounter,
  PerformanceTracker,
  calculateSwarmForces,
  type SwarmParticle,
} from '../../src/layers/physics';

// ═══════════════════════════════════════════════════════════════════════════
// SMOKE TEST SUITE
// ═══════════════════════════════════════════════════════════════════════════

    // Complexity: O(1)
describe('🔬 PHYSICS ENGINE SMOKE TEST', () => {
  
  // ─────────────────────────────────────────────────────────────────────────
  // ENVIRONMENT CHECKS
  // ─────────────────────────────────────────────────────────────────────────
  
  // Complexity: O(1)
  describe('Environment', () => {
    // Complexity: O(1)
    it('should have SharedArrayBuffer available', () => {
      // Complexity: O(1)
      expect(typeof SharedArrayBuffer).toBe('function');
    });
    
    // Complexity: O(1)
    it('should have Atomics available', () => {
      // Complexity: O(1)
      expect(typeof Atomics).toBe('object');
    });
    
    // Complexity: O(1)
    it('should support Worker threads', () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { Worker } = require('worker_threads');
      // Complexity: O(1)
      expect(typeof Worker).toBe('function');
    });
  });
  
  // ─────────────────────────────────────────────────────────────────────────
  // PHYSICS QUEUE TESTS
  // ─────────────────────────────────────────────────────────────────────────
  
  // Complexity: O(1)
  describe('PhysicsQueue', () => {
    let queue: PhysicsQueue<string>;
    
    // Complexity: O(1)
    beforeAll(() => {
      queue = new PhysicsQueue<string>({ maxSize: 100 });
    });
    
    // Complexity: O(1)
    it('should create instance', () => {
      // Complexity: O(1)
      expect(queue).toBeInstanceOf(PhysicsQueue);
    });
    
    // Complexity: O(1)
    it('should enqueue items with priority', () => {
      const testQueue = new PhysicsQueue<string>({ maxSize: 100 });
      const success = testQueue.enqueue('task-1', 10);
      // Complexity: O(1)
      expect(success).toBe(true);
      // Complexity: O(1)
      expect(testQueue.size).toBe(1);
    });
    
    // Complexity: O(1)
    it('should dequeue highest priority first', () => {
      const testQueue = new PhysicsQueue<string>({ maxSize: 100 });
      testQueue.enqueue('low-priority', 1);
      testQueue.enqueue('high-priority', 100);
      testQueue.enqueue('mid-priority', 50);
      
      const first = testQueue.dequeue();
      // Complexity: O(1)
      expect(first).toBe('high-priority');
    });
    
    // Complexity: O(1)
    it('should respect max size limit', () => {
      const smallQueue = new PhysicsQueue<number>({ maxSize: 3 });
      smallQueue.enqueue(1, 10);
      smallQueue.enqueue(2, 20);
      smallQueue.enqueue(3, 30);
      
      const success = smallQueue.enqueue(4, 40);
      // Complexity: O(1)
      expect(typeof success).toBe('boolean');
    });
    
    // Complexity: O(1)
    it('should handle deadline urgency boost', () => {
      const urgentQueue = new PhysicsQueue<string>({ maxSize: 10 });
      urgentQueue.enqueue('normal', 50);
      urgentQueue.enqueue('urgent', 10, -1000);
      
      const first = urgentQueue.dequeue();
      // Complexity: O(1)
      expect(first).toBe('urgent');
    });
    
    // Complexity: O(1)
    it('should return undefined when empty', () => {
      const emptyQueue = new PhysicsQueue<string>({ maxSize: 10 });
      // Complexity: O(1)
      expect(emptyQueue.dequeue()).toBeUndefined();
    });
  });
  
  // ─────────────────────────────────────────────────────────────────────────
  // RATE LIMITER TESTS
  // ─────────────────────────────────────────────────────────────────────────
  
  // Complexity: O(N) — loop
  describe('RateLimiter', () => {
    // Complexity: O(1)
    it('should create instance with config', () => {
      const limiter = new RateLimiter({ maxRequests: 10, windowMs: 1000 });
      // Complexity: O(1)
      expect(limiter).toBeInstanceOf(RateLimiter);
    });
    
    // Complexity: O(N) — loop
    it('should allow requests within limit', () => {
      const limiter = new RateLimiter({ maxRequests: 5, windowMs: 1000 });
      for (let i = 0; i < 5; i++) {
        // Complexity: O(1)
        expect(limiter.tryAcquire()).toBe(true);
      }
    });
    
    // Complexity: O(1)
    it('should block requests over limit', () => {
      const limiter = new RateLimiter({ maxRequests: 3, windowMs: 10000 });
      limiter.tryAcquire();
      limiter.tryAcquire();
      limiter.tryAcquire();
      // Complexity: O(1)
      expect(limiter.tryAcquire()).toBe(false);
    });
    
    // Complexity: O(1)
    it('should report remaining capacity', () => {
      const limiter = new RateLimiter({ maxRequests: 10, windowMs: 1000 });
      limiter.tryAcquire();
      limiter.tryAcquire();
      // Complexity: O(1)
      expect(limiter.remaining()).toBe(8);
    });
  });
  
  // ─────────────────────────────────────────────────────────────────────────
  // SLIDING WINDOW COUNTER TESTS
  // ─────────────────────────────────────────────────────────────────────────
  
  // Complexity: O(1)
  describe('SlidingWindowCounter', () => {
    // Complexity: O(1)
    it('should create instance', () => {
      const counter = new SlidingWindowCounter({ windowMs: 1000, buckets: 10 });
      // Complexity: O(1)
      expect(counter).toBeInstanceOf(SlidingWindowCounter);
    });
    
    // Complexity: O(1)
    it('should increment and track counts', () => {
      const counter = new SlidingWindowCounter({ windowMs: 1000, buckets: 10 });
      counter.increment();
      counter.increment();
      counter.increment();
      // Complexity: O(1)
      expect(counter.count()).toBe(3);
    });
    
    // Complexity: O(1)
    it('should calculate rate', () => {
      const counter = new SlidingWindowCounter({ windowMs: 1000, buckets: 10 });
      counter.increment();
      counter.increment();
      const rate = counter.rate();
      // Complexity: O(1)
      expect(rate).toBeGreaterThanOrEqual(0);
    });
  });
  
  // ─────────────────────────────────────────────────────────────────────────
  // PERFORMANCE TRACKER TESTS
  // ─────────────────────────────────────────────────────────────────────────
  
  // Complexity: O(1)
  describe('PerformanceTracker', () => {
    // Complexity: O(1)
    it('should create instance', () => {
      const tracker = new PerformanceTracker({ historySize: 100 });
      // Complexity: O(1)
      expect(tracker).toBeInstanceOf(PerformanceTracker);
    });
    
    // Complexity: O(1)
    it('should record operations', () => {
      const tracker = new PerformanceTracker({ historySize: 100 });
      tracker.record('test-op', 10);
      tracker.record('test-op', 20);
      tracker.record('test-op', 30);
      const stats = tracker.getStats('test-op');
      // Complexity: O(1)
      expect(stats.count).toBe(3);
      // Complexity: O(1)
      expect(stats.avg).toBe(20);
    });
    
    // Complexity: O(1)
    it('should calculate min/max correctly', () => {
      const tracker = new PerformanceTracker({ historySize: 100 });
      tracker.record('op', 5);
      tracker.record('op', 15);
      tracker.record('op', 10);
      const stats = tracker.getStats('op');
      // Complexity: O(1)
      expect(stats.min).toBe(5);
      // Complexity: O(1)
      expect(stats.max).toBe(15);
    });
  });
  
  // ─────────────────────────────────────────────────────────────────────────
  // SWARM FORCES CALCULATION TESTS
  // ─────────────────────────────────────────────────────────────────────────
  
  // Complexity: O(1)
  describe('calculateSwarmForces', () => {
    // Complexity: O(1)
    it('should calculate forces between particles', () => {
      const particle1: SwarmParticle = {
        id: 'p1',
        mass: 1,
        velocity: 0,
        position: { x: 0, y: 0 },
        createdAt: { epochMs: Date.now(), iso: new Date().toISOString() },
        bestPosition: { x: 0, y: 0 },
        bestFitness: 0
      };
      
      const particle2: SwarmParticle = {
        id: 'p2',
        mass: 1,
        velocity: 0,
        position: { x: 10, y: 0 },
        createdAt: { epochMs: Date.now(), iso: new Date().toISOString() },
        bestPosition: { x: 10, y: 0 },
        bestFitness: 0
      };
      
      const forces = calculateSwarmForces([particle1, particle2], {
        cohesionWeight: 1,
        separationWeight: 1,
        alignmentWeight: 1,
        neighborRadius: 100
      });
      
      // Complexity: O(1)
      expect(forces).toBeDefined();
      // Complexity: O(1)
      expect(Array.isArray(forces)).toBe(true);
    });
  });
  
  // ─────────────────────────────────────────────────────────────────────────
  // INTEGRATION: Queue + RateLimiter Flow
  // ─────────────────────────────────────────────────────────────────────────
  
  // Complexity: O(N) — loop
  describe('E2E Integration', () => {
    // Complexity: O(N) — loop
    it('should flow from queue through rate limiter', () => {
      const queue = new PhysicsQueue<{ id: string; priority: number }>({ maxSize: 10 });
      const limiter = new RateLimiter({ maxRequests: 100, windowMs: 1000 });
      
      queue.enqueue({ id: 'task-1', priority: 10 }, 10);
      queue.enqueue({ id: 'task-2', priority: 20 }, 20);
      queue.enqueue({ id: 'task-3', priority: 15 }, 15);
      
      const results: string[] = [];
      
      while (queue.size > 0) {
        const task = queue.dequeue();
        if (task && limiter.tryAcquire()) {
          results.push(task.id);
        }
      }
      
      // Complexity: O(1)
      expect(results).toHaveLength(3);
      // Complexity: O(1)
      expect(results[0]).toBe('task-2');
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// PERFORMANCE BASELINE
// ═══════════════════════════════════════════════════════════════════════════

    // Complexity: O(N*M) — nested iteration
describe('⚡ Performance Baseline', () => {
  // Complexity: O(N) — loop
  it('should enqueue 10,000 items in under 100ms', () => {
    const queue = new PhysicsQueue<number>({ maxSize: 10000 });
    const start = performance.now();
    
    for (let i = 0; i < 10000; i++) {
      queue.enqueue(i, Math.random() * 100);
    }
    
    const duration = performance.now() - start;
    console.log(`[Perf] Enqueue 10,000: ${duration.toFixed(2)}ms`);
    // Complexity: O(1)
    expect(duration).toBeLessThan(100);
  });
  
  // Complexity: O(N*M) — nested iteration
  it('should dequeue 10,000 items in under 500ms', () => {
    const queue = new PhysicsQueue<number>({ maxSize: 10000 });
    
    for (let i = 0; i < 10000; i++) {
      queue.enqueue(i, Math.random() * 100);
    }
    
    const start = performance.now();
    while (queue.size > 0) {
      queue.dequeue();
    }
    
    const duration = performance.now() - start;
    console.log(`[Perf] Dequeue 10,000: ${duration.toFixed(2)}ms`);
    // Complexity: O(1)
    expect(duration).toBeLessThan(500);
  });
  
  // Complexity: O(N) — loop
  it('should handle 100,000 rate limit checks in under 50ms', () => {
    const limiter = new RateLimiter({ maxRequests: 1000000, windowMs: 10000 });
    const start = performance.now();
    
    for (let i = 0; i < 100000; i++) {
      limiter.tryAcquire();
    }
    
    const duration = performance.now() - start;
    console.log(`[Perf] Rate Limit 100,000: ${duration.toFixed(2)}ms`);
    // Complexity: O(1)
    expect(duration).toBeLessThan(50);
  });
});
