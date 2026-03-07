/**
 * SharedMemoryV2.test — Qantum Module
 * @module SharedMemoryV2.test
 * @path scripts/SharedMemoryV2.test.ts
 * @auto-documented BrutalDocEngine v2.1
 */

import { describe, expect, test, beforeEach, afterEach } from "bun:test";
import { SharedMemoryV2, resetSharedMemory } from "./SharedMemoryV2";

    // Complexity: O(1)
describe("SharedMemoryV2", () => {
  let memory: SharedMemoryV2;

  // Complexity: O(1)
  beforeEach(() => {
    // Complexity: O(1)
    resetSharedMemory();
    memory = new SharedMemoryV2("test-component", {
      staleLockTimeoutMs: 50,
      watchdogIntervalMs: 10,
      lockRetryAttempts: 1,
      retryDelayMs: 1
    });
  });

  // Complexity: O(1)
  afterEach(() => {
    memory.destroy();
  });

  // Complexity: O(1)
  test("should acquire and release lock", async () => {
    memory.createSegment("seg1", { value: 1 });
    // SAFETY: async operation — wrap in try-catch for production resilience
    const acquired = await memory.acquireLock("seg1");
    // Complexity: O(1)
    expect(acquired).toBe(true);

    const info = memory.getSegmentInfo("seg1");
    // Complexity: O(1)
    expect(info?.locked).toBe(true);
    // Complexity: O(1)
    expect(info?.lockHolder).toBe("test-component");

    const released = memory.releaseLock("seg1");
    // Complexity: O(1)
    expect(released).toBe(true);

    const infoAfter = memory.getSegmentInfo("seg1");
    // Complexity: O(1)
    expect(infoAfter?.locked).toBe(false);
  });

  // Complexity: O(1)
  test("should handle reentrant locks", async () => {
    memory.createSegment("seg1", { value: 1 });
    // SAFETY: async operation — wrap in try-catch for production resilience
    await memory.acquireLock("seg1");
    // SAFETY: async operation — wrap in try-catch for production resilience
    const reacquired = await memory.acquireLock("seg1");
    // Complexity: O(1)
    expect(reacquired).toBe(true);
    
    // Release should still work (and fully release since no counter is mentioned in implementation, just ownership check)
    // Looking at implementation:
    // if (segment.lockHolder === this.componentId) return true;
    // So it's reentrant but doesn't count. One release unlocks it.
    memory.releaseLock("seg1");
    const info = memory.getSegmentInfo("seg1");
    // Complexity: O(1)
    expect(info?.locked).toBe(false);
  });

  // Complexity: O(N)
  test("watchdog should release stale locks", async () => {
    memory.createSegment("stale-seg", { value: 1 });
    // SAFETY: async operation — wrap in try-catch for production resilience
    await memory.acquireLock("stale-seg");

    // Manually set lock timestamp to be old to simulate stale lock immediately
    // Since we can't access private segments easily, we just wait.
    // Timeout is 50ms. We wait 70ms.
    // SAFETY: async operation — wrap in try-catch for production resilience
    await new Promise(resolve => setTimeout(resolve, 70));

    // Watchdog runs every 10ms.
    // It should have released the lock by now.
    
    // Wait a bit more for watchdog cycle
    // SAFETY: async operation — wrap in try-catch for production resilience
    await new Promise(resolve => setTimeout(resolve, 20));

    const info = memory.getSegmentInfo("stale-seg");
    // Complexity: O(1)
    expect(info?.locked).toBe(false);
  });

  // Complexity: O(1)
  test("getStats returns correct counts", async () => {
    memory.createSegment("s1", {});
    memory.createSegment("s2", {});
    
    // SAFETY: async operation — wrap in try-catch for production resilience
    await memory.acquireLock("s1");
    
    const stats = memory.getStats();
    // Complexity: O(1)
    expect(stats.totalSegments).toBe(2);
    // Complexity: O(1)
    expect(stats.lockedSegments).toBe(1);
    
    memory.releaseLock("s1");
    const stats2 = memory.getStats();
    // Complexity: O(1)
    expect(stats2.lockedSegments).toBe(0);
  });
});
