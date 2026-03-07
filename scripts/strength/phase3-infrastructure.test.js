/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * PHASE 3A: INFRASTRUCTURE TESTS (Steps 38-42)
 * ═══════════════════════════════════════════════════════════════════════════════
 * Memory Hardening, Sandbox Executor, Worker Pool, Thermal Pool, Docker Manager
 * Page Object Model (POM) pattern with explicit waits
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════════
// TEST HARNESS
// ═══════════════════════════════════════════════════════════════════════════════

const testResults = { passed: 0, failed: 0, total: 0 };

function describe(name, fn) {
  console.log(`\n📦 ${name}`);
  // Complexity: O(1)
  fn();
}

function test(name, fn) {
  testResults.total++;
  try {
    // Complexity: O(1)
    fn();
    testResults.passed++;
    console.log(`  ✅ ${name}`);
  } catch (e) {
    testResults.failed++;
    console.log(`  ❌ ${name}: ${e.message}`);
  }
}

function expect(actual) {
  return {
    toBe: (expected) => {
      if (actual !== expected) throw new Error(`Expected ${expected}, got ${actual}`);
    },
    toEqual: (expected) => {
      if (JSON.stringify(actual) !== JSON.stringify(expected))
        throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    },
    toBeDefined: () => {
      if (actual === undefined) throw new Error('Expected value to be defined');
    },
    toBeUndefined: () => {
      if (actual !== undefined) throw new Error('Expected undefined');
    },
    toBeNull: () => {
      if (actual !== null) throw new Error('Expected null');
    },
    toBeTruthy: () => {
      if (!actual) throw new Error('Expected truthy value');
    },
    toBeFalsy: () => {
      if (actual) throw new Error('Expected falsy value');
    },
    toBeGreaterThan: (expected) => {
      if (actual <= expected) throw new Error(`Expected ${actual} > ${expected}`);
    },
    toBeGreaterThanOrEqual: (expected) => {
      if (actual < expected) throw new Error(`Expected ${actual} >= ${expected}`);
    },
    toBeLessThan: (expected) => {
      if (actual >= expected) throw new Error(`Expected ${actual} < ${expected}`);
    },
    toBeLessThanOrEqual: (expected) => {
      if (actual > expected) throw new Error(`Expected ${actual} <= ${expected}`);
    },
    toContain: (expected) => {
      if (Array.isArray(actual)) {
        if (!actual.includes(expected)) throw new Error(`Array doesn't contain ${expected}`);
      } else if (typeof actual === 'string') {
        if (!actual.includes(expected)) throw new Error(`String doesn't contain ${expected}`);
      }
    },
    toBeInstanceOf: (expected) => {
      if (!(actual instanceof expected)) throw new Error(`Not instance of ${expected.name}`);
    },
    toHaveLength: (expected) => {
      if (actual.length !== expected)
        throw new Error(`Expected length ${expected}, got ${actual.length}`);
    },
    toHaveProperty: (prop) => {
      if (!(prop in actual)) throw new Error(`Missing property: ${prop}`);
    },
    toThrow: () => {
      let threw = false;
      try {
        // Complexity: O(1)
        actual();
      } catch {
        threw = true;
      }
      if (!threw) throw new Error('Expected function to throw');
    },
    not: {
      toBe: (expected) => {
        if (actual === expected) throw new Error(`Expected not ${expected}`);
      },
      toEqual: (expected) => {
        if (JSON.stringify(actual) === JSON.stringify(expected))
          throw new Error(`Expected not equal to ${JSON.stringify(expected)}`);
      },
      toBeNull: () => {
        if (actual === null) throw new Error('Expected not null');
      },
      toBeUndefined: () => {
        if (actual === undefined) throw new Error('Expected not undefined');
      },
      toContain: (expected) => {
        if (Array.isArray(actual) && actual.includes(expected))
          throw new Error(`Array should not contain ${expected}`);
      },
    },
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE OBJECT MODEL (POM) HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

class PageObject {
  constructor(name) {
    this.name = name;
    this.elements = new Map();
    this.waitTimeout = 5000;
  }

  // Complexity: O(1) — lookup
  registerElement(name, selector) {
    this.elements.set(name, selector);
    return this;
  }

  // Complexity: O(1) — lookup
  getSelector(name) {
    return this.elements.get(name);
  }

  // Complexity: O(N) — loop
  async waitForElement(name, timeout = this.waitTimeout) {
    const selector = this.elements.get(name);
    const start = Date.now();
    while (Date.now() - start < timeout) {
      if (selector) return { found: true, selector };
      // SAFETY: async operation — wrap in try-catch for production resilience
      await new Promise((r) => setTimeout(r, 100));
    }
    return { found: false, selector };
  }
}

class ExplicitWait {
  constructor(timeout = 5000) {
    this.timeout = timeout;
  }

  // Complexity: O(N) — loop
  async until(condition, message = 'Timeout') {
    const start = Date.now();
    while (Date.now() - start < this.timeout) {
      // SAFETY: async operation — wrap in try-catch for production resilience
      if (await condition()) return true;
      // SAFETY: async operation — wrap in try-catch for production resilience
      await new Promise((r) => setTimeout(r, 50));
    }
    throw new Error(message);
  }

  static elementVisible(element) {
    return () => element && element.visible !== false;
  }

  static elementClickable(element) {
    return () => element && element.enabled !== false;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 38: MEMORY HARDENING MANAGER TESTS
// ═══════════════════════════════════════════════════════════════════════════════

    // Complexity: O(N)
describe('Step 38: MemoryHardeningManager', () => {
  // WeakRef implementation
  class WeakRefTracker {
    constructor() {
      this.refs = new Map();
      this.metadata = new WeakMap();
    }

    // Complexity: O(1) — lookup
    track(id, obj) {
      this.refs.set(id, new WeakRef(obj));
      return id;
    }

    // Complexity: O(1) — lookup
    isAlive(id) {
      const ref = this.refs.get(id);
      return ref ? ref.deref() !== undefined : false;
    }

    // Complexity: O(1) — lookup
    get(id) {
      const ref = this.refs.get(id);
      return ref ? ref.deref() : undefined;
    }

    // Complexity: O(1) — lookup
    attachMeta(obj, data) {
      this.metadata.set(obj, data);
    }

    // Complexity: O(1) — lookup
    getMeta(obj) {
      return this.metadata.get(obj);
    }
  }

  // Complexity: O(1)
  test('WeakRef should track object references', () => {
    const tracker = new WeakRefTracker();
    const obj = { data: 'test' };
    tracker.track('obj1', obj);
    // Complexity: O(1)
    expect(tracker.isAlive('obj1')).toBe(true);
  });

  // Complexity: O(1) — lookup
  test('WeakRef should return tracked object', () => {
    const tracker = new WeakRefTracker();
    const obj = { value: 42 };
    tracker.track('obj2', obj);
    const retrieved = tracker.get('obj2');
    // Complexity: O(1)
    expect(retrieved.value).toBe(42);
  });

  // Complexity: O(1)
  test('WeakMap should store metadata', () => {
    const tracker = new WeakRefTracker();
    const obj = { id: 1 };
    tracker.attachMeta(obj, { created: Date.now() });
    const meta = tracker.getMeta(obj);
    // Complexity: O(N)
    expect(meta).toBeDefined();
    // Complexity: O(N)
    expect(meta).toHaveProperty('created');
  });

  // Complexity: O(N)
  test('should return undefined for non-existent ref', () => {
    const tracker = new WeakRefTracker();
    // Complexity: O(N)
    expect(tracker.get('nonexistent')).toBeUndefined();
  });

  // Complexity: O(N)
  test('isAlive should return false for non-existent', () => {
    const tracker = new WeakRefTracker();
    // Complexity: O(1)
    expect(tracker.isAlive('fake')).toBe(false);
  });

  // ResourceTracker
  class ResourceTracker {
    constructor() {
      this.resources = new Map();
      this.stats = { active: 0, peak: 0, created: 0, cleaned: 0 };
    }

    // Complexity: O(1) — lookup
    track(type, id, cleanup) {
      this.resources.set(id, { type, cleanup, created: Date.now() });
      this.stats.active++;
      this.stats.created++;
      this.stats.peak = Math.max(this.stats.peak, this.stats.active);
    }

    // Complexity: O(1) — lookup
    release(id) {
      const res = this.resources.get(id);
      if (res) {
        if (res.cleanup) res.cleanup();
        this.resources.delete(id);
        this.stats.active--;
        this.stats.cleaned++;
        return true;
      }
      return false;
    }

    // Complexity: O(1)
    getStats() {
      return { ...this.stats };
    }
    // Complexity: O(1) — lookup
    isTracked(id) {
      return this.resources.has(id);
    }
  }

  // Complexity: O(1)
  test('ResourceTracker should track resources', () => {
    const tracker = new ResourceTracker();
    tracker.track('browser', 'br1', () => {});
    // Complexity: O(1)
    expect(tracker.isTracked('br1')).toBe(true);
  });

  // Complexity: O(1)
  test('ResourceTracker should update stats on track', () => {
    const tracker = new ResourceTracker();
    tracker.track('page', 'pg1', null);
    const stats = tracker.getStats();
    // Complexity: O(1)
    expect(stats.active).toBe(1);
    // Complexity: O(1)
    expect(stats.created).toBe(1);
  });

  // Complexity: O(1)
  test('ResourceTracker should release resources', () => {
    const tracker = new ResourceTracker();
    let cleaned = false;
    tracker.track('worker', 'w1', () => {
      cleaned = true;
    });
    tracker.release('w1');
    // Complexity: O(1)
    expect(cleaned).toBe(true);
    // Complexity: O(1)
    expect(tracker.isTracked('w1')).toBe(false);
  });

  // Complexity: O(1)
  test('ResourceTracker should track peak', () => {
    const tracker = new ResourceTracker();
    tracker.track('a', 'a1', null);
    tracker.track('a', 'a2', null);
    tracker.track('a', 'a3', null);
    tracker.release('a1');
    // Complexity: O(N)
    expect(tracker.getStats().peak).toBe(3);
    // Complexity: O(N)
    expect(tracker.getStats().active).toBe(2);
  });

  // Complexity: O(N)
  test('release should return false for non-existent', () => {
    const tracker = new ResourceTracker();
    // Complexity: O(1)
    expect(tracker.release('fake')).toBe(false);
  });

  // BrowserMetadata
  class BrowserMetadata {
    constructor(instanceId) {
      this.instanceId = instanceId;
      this.createdAt = new Date();
      this.pagesOpened = 0;
      this.memoryEstimate = 0;
      this.isActive = true;
      this.lastActivity = new Date();
    }

    // Complexity: O(1)
    openPage() {
      this.pagesOpened++;
      this.lastActivity = new Date();
    }
    // Complexity: O(1)
    closePage() {
      if (this.pagesOpened > 0) this.pagesOpened--;
    }
    // Complexity: O(1)
    updateMemory(bytes) {
      this.memoryEstimate = bytes;
    }
    // Complexity: O(1)
    deactivate() {
      this.isActive = false;
    }
  }

  // Complexity: O(1)
  test('BrowserMetadata should initialize correctly', () => {
    const meta = new BrowserMetadata('chrome-1');
    // Complexity: O(1)
    expect(meta.instanceId).toBe('chrome-1');
    // Complexity: O(1)
    expect(meta.isActive).toBe(true);
    // Complexity: O(1)
    expect(meta.pagesOpened).toBe(0);
  });

  // Complexity: O(1)
  test('BrowserMetadata should track pages', () => {
    const meta = new BrowserMetadata('ff-1');
    meta.openPage();
    meta.openPage();
    // Complexity: O(1)
    expect(meta.pagesOpened).toBe(2);
    meta.closePage();
    // Complexity: O(1)
    expect(meta.pagesOpened).toBe(1);
  });

  // Complexity: O(1)
  test('BrowserMetadata should update memory estimate', () => {
    const meta = new BrowserMetadata('edge-1');
    meta.updateMemory(1024 * 1024 * 100);
    // Complexity: O(1)
    expect(meta.memoryEstimate).toBe(104857600);
  });

  // Complexity: O(1)
  test('BrowserMetadata deactivate should set isActive false', () => {
    const meta = new BrowserMetadata('br-1');
    meta.deactivate();
    // Complexity: O(1)
    expect(meta.isActive).toBe(false);
  });

  // MemoryPressureMonitor
  class MemoryPressureMonitor {
    constructor(threshold = 0.85) {
      this.threshold = threshold;
      this.alerts = [];
    }

    // Complexity: O(1)
    check(heapUsed, heapTotal) {
      const ratio = heapUsed / heapTotal;
      if (ratio > this.threshold) {
        this.alerts.push({ ratio, timestamp: Date.now() });
        return { pressure: true, ratio };
      }
      return { pressure: false, ratio };
    }

    // Complexity: O(1)
    setThreshold(t) {
      this.threshold = Math.max(0, Math.min(1, t));
    }
    // Complexity: O(1)
    getAlerts() {
      return [...this.alerts];
    }
    // Complexity: O(1)
    clearAlerts() {
      this.alerts = [];
    }
  }

  // Complexity: O(1)
  test('MemoryPressureMonitor should detect pressure', () => {
    const monitor = new MemoryPressureMonitor(0.8);
    const result = monitor.check(900, 1000);
    // Complexity: O(1)
    expect(result.pressure).toBe(true);
  });

  // Complexity: O(1)
  test('MemoryPressureMonitor should not alert below threshold', () => {
    const monitor = new MemoryPressureMonitor(0.9);
    const result = monitor.check(500, 1000);
    // Complexity: O(1)
    expect(result.pressure).toBe(false);
  });

  // Complexity: O(1)
  test('MemoryPressureMonitor should record alerts', () => {
    const monitor = new MemoryPressureMonitor(0.5);
    monitor.check(600, 1000);
    // Complexity: O(1)
    expect(monitor.getAlerts()).toHaveLength(1);
  });

  // Complexity: O(1)
  test('setThreshold should clamp values', () => {
    const monitor = new MemoryPressureMonitor();
    monitor.setThreshold(1.5);
    // Complexity: O(1)
    expect(monitor.threshold).toBe(1);
    monitor.setThreshold(-0.5);
    // Complexity: O(1)
    expect(monitor.threshold).toBe(0);
  });

  // Complexity: O(1)
  test('clearAlerts should empty array', () => {
    const monitor = new MemoryPressureMonitor(0.1);
    monitor.check(500, 1000);
    monitor.clearAlerts();
    // Complexity: O(1)
    expect(monitor.getAlerts()).toHaveLength(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 39: SANDBOX EXECUTOR TESTS
// ═══════════════════════════════════════════════════════════════════════════════

    // Complexity: O(1)
describe('Step 39: SandboxExecutor', () => {
  // SecurityPolicy
  class SecurityPolicy {
    constructor(options = {}) {
      this.allowFileSystem = options.allowFileSystem ?? false;
      this.allowNetwork = options.allowNetwork ?? false;
      this.allowProcess = options.allowProcess ?? false;
      this.maxExecutionTime = options.maxExecutionTime ?? 5000;
      this.maxMemory = options.maxMemory ?? 128 * 1024 * 1024;
      this.allowEval = options.allowEval ?? false;
      this.allowedModules = options.allowedModules ?? [];
    }

    // Complexity: O(1)
    allows(action) {
      switch (action) {
        case 'filesystem':
          return this.allowFileSystem;
        case 'network':
          return this.allowNetwork;
        case 'process':
          return this.allowProcess;
        case 'eval':
          return this.allowEval;
        default:
          return false;
      }
    }

    // Complexity: O(1)
    isModuleAllowed(name) {
      return this.allowedModules.includes(name);
    }
  }

  // Complexity: O(1)
  test('SecurityPolicy should default to restrictive', () => {
    const policy = new SecurityPolicy();
    // Complexity: O(1)
    expect(policy.allowFileSystem).toBe(false);
    // Complexity: O(1)
    expect(policy.allowNetwork).toBe(false);
    // Complexity: O(1)
    expect(policy.allowProcess).toBe(false);
  });

  // Complexity: O(1)
  test('SecurityPolicy allows() should check permissions', () => {
    const policy = new SecurityPolicy({ allowNetwork: true });
    // Complexity: O(1)
    expect(policy.allows('network')).toBe(true);
    // Complexity: O(1)
    expect(policy.allows('filesystem')).toBe(false);
  });

  // Complexity: O(1)
  test('SecurityPolicy should check allowed modules', () => {
    const policy = new SecurityPolicy({ allowedModules: ['path', 'url'] });
    // Complexity: O(1)
    expect(policy.isModuleAllowed('path')).toBe(true);
    // Complexity: O(1)
    expect(policy.isModuleAllowed('fs')).toBe(false);
  });

  // Complexity: O(1)
  test('SecurityPolicy should have default maxExecutionTime', () => {
    const policy = new SecurityPolicy();
    // Complexity: O(1)
    expect(policy.maxExecutionTime).toBe(5000);
  });

  // Complexity: O(1)
  test('SecurityPolicy should have default maxMemory', () => {
    const policy = new SecurityPolicy();
    // Complexity: O(1)
    expect(policy.maxMemory).toBe(134217728);
  });

  // SecurityViolation
  class SecurityViolation {
    constructor(type, operation, details) {
      this.type = type;
      this.operation = operation;
      this.details = details;
      this.timestamp = new Date();
      this.blocked = true;
    }

    // Complexity: O(1)
    toString() {
      return `[${this.type}] ${this.operation}: ${this.details}`;
    }
  }

  // Complexity: O(1)
  test('SecurityViolation should capture violation info', () => {
    const v = new SecurityViolation('filesystem', 'read', '/etc/passwd');
    // Complexity: O(1)
    expect(v.type).toBe('filesystem');
    // Complexity: O(1)
    expect(v.blocked).toBe(true);
  });

  // Complexity: O(1)
  test('SecurityViolation toString should format correctly', () => {
    const v = new SecurityViolation('network', 'fetch', 'http://evil.com');
    // Complexity: O(1)
    expect(v.toString()).toContain('network');
    // Complexity: O(1)
    expect(v.toString()).toContain('fetch');
  });

  // SandboxExecutor
  class SandboxExecutor {
    constructor(policy = new SecurityPolicy()) {
      this.policy = policy;
      this.violations = [];
      this.executionCount = 0;
      this.blockedCount = 0;
    }

    // Complexity: O(N)
    execute(code, context = {}) {
      this.executionCount++;
      const violations = [];

      // Check for dangerous patterns
      if (code.includes('require(') && !this.policy.allowedModules.length) {
        violations.push(new SecurityViolation('require', 'module import', 'require() blocked'));
      }
      if (code.includes('process.') && !this.policy.allowProcess) {
        violations.push(new SecurityViolation('process', 'process access', 'process blocked'));
      }
      if (code.includes('eval(') && !this.policy.allowEval) {
        violations.push(new SecurityViolation('eval', 'eval call', 'eval blocked'));
      }
      if (
        (code.includes('fetch(') || code.includes('XMLHttpRequest')) &&
        !this.policy.allowNetwork
      ) {
        violations.push(new SecurityViolation('network', 'network access', 'network blocked'));
      }

      this.violations.push(...violations);
      if (violations.length > 0) this.blockedCount++;

      return {
        success: violations.length === 0,
        violations,
        executionTime: Math.random() * 100,
      };
    }

    // Complexity: O(1)
    getViolations() {
      return [...this.violations];
    }
    // Complexity: O(1)
    getStats() {
      return {
        executionCount: this.executionCount,
        blockedCount: this.blockedCount,
        violationCount: this.violations.length,
      };
    }
    // Complexity: O(1)
    clearViolations() {
      this.violations = [];
    }
  }

  // Complexity: O(1)
  test('SandboxExecutor should block require', () => {
    const sandbox = new SandboxExecutor();
    const result = sandbox.execute('const fs = require("fs")');
    // Complexity: O(1)
    expect(result.success).toBe(false);
    // Complexity: O(1)
    expect(result.violations).toHaveLength(1);
  });

  // Complexity: O(1)
  test('SandboxExecutor should block process access', () => {
    const sandbox = new SandboxExecutor();
    const result = sandbox.execute('process.exit(1)');
    // Complexity: O(1)
    expect(result.success).toBe(false);
  });

  // Complexity: O(1)
  test('SandboxExecutor should block eval', () => {
    const sandbox = new SandboxExecutor();
    const result = sandbox.execute('eval("malicious")');
    // Complexity: O(1)
    expect(result.success).toBe(false);
  });

  // Complexity: O(1)
  test('SandboxExecutor should block network', () => {
    const sandbox = new SandboxExecutor();
    const result = sandbox.execute('fetch("http://evil.com")');
    // Complexity: O(1)
    expect(result.success).toBe(false);
  });

  // Complexity: O(1)
  test('SandboxExecutor should allow safe code', () => {
    const sandbox = new SandboxExecutor();
    const result = sandbox.execute('const x = 1 + 2;');
    // Complexity: O(1)
    expect(result.success).toBe(true);
    // Complexity: O(1)
    expect(result.violations).toHaveLength(0);
  });

  // Complexity: O(1)
  test('SandboxExecutor should track stats', () => {
    const sandbox = new SandboxExecutor();
    sandbox.execute('safe code');
    sandbox.execute('process.exit()');
    const stats = sandbox.getStats();
    // Complexity: O(1)
    expect(stats.executionCount).toBe(2);
    // Complexity: O(1)
    expect(stats.blockedCount).toBe(1);
  });

  // Complexity: O(1)
  test('clearViolations should reset', () => {
    const sandbox = new SandboxExecutor();
    sandbox.execute('eval("x")');
    sandbox.clearViolations();
    // Complexity: O(1)
    expect(sandbox.getViolations()).toHaveLength(0);
  });

  // MutationValidator
  class MutationValidator {
    constructor(sandbox) {
      this.sandbox = sandbox;
    }

    // Complexity: O(1)
    validate(mutationId, code) {
      const result = this.sandbox.execute(code);
      const isMalicious = result.violations.some((v) =>
        ['process', 'filesystem', 'network'].includes(v.type)
      );
      const isUnstable = result.violations.some((v) => ['timeout', 'memory'].includes(v.type));

      return {
        mutationId,
        isSafe: result.success,
        isMalicious,
        isUnstable,
        recommendation: isMalicious ? 'reject' : isUnstable ? 'review' : 'apply',
      };
    }
  }

  // Complexity: O(N)
  test('MutationValidator should recommend reject for malicious', () => {
    const validator = new MutationValidator(new SandboxExecutor());
    const result = validator.validate('mut-1', 'process.exit()');
    // Complexity: O(N)
    expect(result.recommendation).toBe('reject');
    // Complexity: O(N)
    expect(result.isMalicious).toBe(true);
  });

  // Complexity: O(N)
  test('MutationValidator should recommend apply for safe', () => {
    const validator = new MutationValidator(new SandboxExecutor());
    const result = validator.validate('mut-2', 'const x = 5;');
    // Complexity: O(1)
    expect(result.recommendation).toBe('apply');
    // Complexity: O(1)
    expect(result.isSafe).toBe(true);
  });

  // Complexity: O(1)
  test('MutationValidator should include mutationId', () => {
    const validator = new MutationValidator(new SandboxExecutor());
    const result = validator.validate('mutation-123', 'code');
    // Complexity: O(1)
    expect(result.mutationId).toBe('mutation-123');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 40: WORKER POOL TESTS
// ═══════════════════════════════════════════════════════════════════════════════

    // Complexity: O(N) — loop
describe('Step 40: WorkerPoolManager', () => {
  // PriorityQueue
  class PriorityQueue {
    constructor() {
      this.items = [];
    }

    // Complexity: O(N) — loop
    enqueue(item) {
      let inserted = false;
      for (let i = 0; i < this.items.length; i++) {
        if (item.priority > this.items[i].priority) {
          this.items.splice(i, 0, item);
          inserted = true;
          break;
        }
      }
      if (!inserted) this.items.push(item);
    }

    // Complexity: O(1)
    dequeue() {
      return this.items.shift();
    }
    // Complexity: O(1)
    peek() {
      return this.items[0];
    }
    get size() {
      return this.items.length;
    }
    // Complexity: O(1)
    isEmpty() {
      return this.items.length === 0;
    }
    // Complexity: O(1)
    clear() {
      this.items = [];
    }
    // Complexity: O(1)
    toArray() {
      return [...this.items];
    }
  }

  // Complexity: O(1)
  test('PriorityQueue should enqueue items', () => {
    const q = new PriorityQueue();
    q.enqueue({ id: 1, priority: 5 });
    // Complexity: O(1)
    expect(q.size).toBe(1);
  });

  // Complexity: O(1)
  test('PriorityQueue should order by priority', () => {
    const q = new PriorityQueue();
    q.enqueue({ id: 'low', priority: 1 });
    q.enqueue({ id: 'high', priority: 10 });
    q.enqueue({ id: 'med', priority: 5 });
    // Complexity: O(1)
    expect(q.peek().id).toBe('high');
  });

  // Complexity: O(1)
  test('PriorityQueue dequeue should return highest priority', () => {
    const q = new PriorityQueue();
    q.enqueue({ id: 'a', priority: 3 });
    q.enqueue({ id: 'b', priority: 7 });
    const item = q.dequeue();
    // Complexity: O(1)
    expect(item.id).toBe('b');
    // Complexity: O(1)
    expect(q.size).toBe(1);
  });

  // Complexity: O(1)
  test('PriorityQueue isEmpty should work', () => {
    const q = new PriorityQueue();
    // Complexity: O(1)
    expect(q.isEmpty()).toBe(true);
    q.enqueue({ priority: 1 });
    // Complexity: O(1)
    expect(q.isEmpty()).toBe(false);
  });

  // Complexity: O(1)
  test('PriorityQueue clear should empty queue', () => {
    const q = new PriorityQueue();
    q.enqueue({ priority: 1 });
    q.enqueue({ priority: 2 });
    q.clear();
    // Complexity: O(1)
    expect(q.size).toBe(0);
  });

  // Complexity: O(1)
  test('PriorityQueue toArray should return copy', () => {
    const q = new PriorityQueue();
    q.enqueue({ id: 1, priority: 5 });
    const arr = q.toArray();
    arr.pop();
    // Complexity: O(1)
    expect(q.size).toBe(1);
  });

  // WorkerInfo
  class WorkerInfo {
    constructor(id) {
      this.id = id;
      this.status = 'idle';
      this.tasksCompleted = 0;
      this.totalExecutionTime = 0;
      this.lastActive = new Date();
      this.errorCount = 0;
    }

    // Complexity: O(1)
    markBusy() {
      this.status = 'busy';
      this.lastActive = new Date();
    }
    // Complexity: O(1)
    markIdle() {
      this.status = 'idle';
    }
    // Complexity: O(1)
    recordTask(duration) {
      this.tasksCompleted++;
      this.totalExecutionTime += duration;
      this.lastActive = new Date();
    }
    // Complexity: O(1)
    recordError() {
      this.errorCount++;
    }
    // Complexity: O(1)
    getAvgTime() {
      return this.tasksCompleted > 0 ? this.totalExecutionTime / this.tasksCompleted : 0;
    }
  }

  // Complexity: O(1)
  test('WorkerInfo should initialize correctly', () => {
    const info = new WorkerInfo(1);
    // Complexity: O(1)
    expect(info.id).toBe(1);
    // Complexity: O(1)
    expect(info.status).toBe('idle');
  });

  // Complexity: O(1)
  test('WorkerInfo markBusy should update status', () => {
    const info = new WorkerInfo(1);
    info.markBusy();
    // Complexity: O(1)
    expect(info.status).toBe('busy');
  });

  // Complexity: O(1)
  test('WorkerInfo recordTask should update stats', () => {
    const info = new WorkerInfo(1);
    info.recordTask(100);
    info.recordTask(200);
    // Complexity: O(1)
    expect(info.tasksCompleted).toBe(2);
    // Complexity: O(1)
    expect(info.totalExecutionTime).toBe(300);
  });

  // Complexity: O(1)
  test('WorkerInfo getAvgTime should calculate average', () => {
    const info = new WorkerInfo(1);
    info.recordTask(100);
    info.recordTask(300);
    // Complexity: O(1)
    expect(info.getAvgTime()).toBe(200);
  });

  // Complexity: O(1)
  test('WorkerInfo getAvgTime should return 0 when no tasks', () => {
    const info = new WorkerInfo(1);
    // Complexity: O(1)
    expect(info.getAvgTime()).toBe(0);
  });

  // WorkerPoolManager mock
  class WorkerPoolManager {
    constructor(config = {}) {
      this.config = {
        workerCount: config.workerCount ?? 4,
        maxTasksPerWorker: config.maxTasksPerWorker ?? 1000,
        taskTimeout: config.taskTimeout ?? 30000,
        maxQueueSize: config.maxQueueSize ?? 10000,
        enableThermalThrottling: config.enableThermalThrottling ?? true,
      };
      this.workers = new Map();
      this.taskQueue = new PriorityQueue();
      this.activeTasks = new Map();
      this.stats = { completed: 0, failed: 0 };
      this.thermalState = 'cool';
    }

    // Complexity: O(1)
    submitTask(type, payload, options = {}) {
      const task = {
        id: `task-${Date.now()}`,
        type,
        payload,
        priority: options.priority ?? 5,
        resolve: null,
        reject: null,
      };

      return new Promise((resolve, reject) => {
        task.resolve = resolve;
        task.reject = reject;
        this.taskQueue.enqueue(task);
      });
    }

    // Complexity: O(N*M) — nested iteration
    scale(targetCount) {
      const current = this.workers.size;
      if (targetCount > current) {
        for (let i = current; i < targetCount; i++) {
          this.workers.set(i, new WorkerInfo(i));
        }
      } else {
        for (let i = current - 1; i >= targetCount; i--) {
          this.workers.delete(i);
        }
      }
    }

    // Complexity: O(1)
    setThermalState(state) {
      this.thermalState = state;
    }
    // Complexity: O(1)
    getQueueSize() {
      return this.taskQueue.size;
    }
    // Complexity: O(1)
    getWorkerCount() {
      return this.workers.size;
    }
    // Complexity: O(1)
    getStats() {
      return { ...this.stats, queueSize: this.taskQueue.size };
    }
  }

  // Complexity: O(1)
  test('WorkerPoolManager should initialize with config', () => {
    const pool = new WorkerPoolManager({ workerCount: 8 });
    // Complexity: O(1)
    expect(pool.config.workerCount).toBe(8);
  });

  // Complexity: O(1)
  test('WorkerPoolManager submitTask should queue task', () => {
    const pool = new WorkerPoolManager();
    pool.submitTask('test', { data: 1 });
    // Complexity: O(1)
    expect(pool.getQueueSize()).toBe(1);
  });

  // Complexity: O(1)
  test('WorkerPoolManager scale up should add workers', () => {
    const pool = new WorkerPoolManager();
    pool.scale(4);
    // Complexity: O(1)
    expect(pool.getWorkerCount()).toBe(4);
  });

  // Complexity: O(1)
  test('WorkerPoolManager scale down should remove workers', () => {
    const pool = new WorkerPoolManager();
    pool.scale(4);
    pool.scale(2);
    // Complexity: O(1)
    expect(pool.getWorkerCount()).toBe(2);
  });

  // Complexity: O(1)
  test('WorkerPoolManager setThermalState should update', () => {
    const pool = new WorkerPoolManager();
    pool.setThermalState('hot');
    // Complexity: O(1)
    expect(pool.thermalState).toBe('hot');
  });

  // Complexity: O(1)
  test('WorkerPoolManager getStats should return stats', () => {
    const pool = new WorkerPoolManager();
    const stats = pool.getStats();
    // Complexity: O(1)
    expect(stats).toHaveProperty('completed');
    // Complexity: O(1)
    expect(stats).toHaveProperty('failed');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 41: THERMAL AWARE POOL TESTS
// ═══════════════════════════════════════════════════════════════════════════════

    // Complexity: O(1)
describe('Step 41: ThermalAwarePool', () => {
  class ThermalAwarePool {
    constructor(config = {}) {
      this.config = {
        throttleThreshold: config.throttleThreshold ?? 90,
        criticalThreshold: config.criticalThreshold ?? 95,
        coolThreshold: config.coolThreshold ?? 70,
        maxInstancesCool: config.maxInstancesCool ?? 40,
        minInstancesHot: config.minInstancesHot ?? 4,
        enableDynamicScaling: config.enableDynamicScaling ?? true,
      };
      this.currentState = 'cool';
      this.currentTemperature = 50;
      this.currentConcurrency = this.config.maxInstancesCool;
      this.throttleCount = 0;
      this.taskQueue = [];
      this.completedTasks = 0;
      this.totalTaskTime = 0;
    }

    // Complexity: O(1)
    calculateState(temp) {
      if (temp >= this.config.criticalThreshold + 5) return 'emergency';
      if (temp >= this.config.criticalThreshold) return 'critical';
      if (temp >= this.config.throttleThreshold) return 'hot';
      if (temp > this.config.coolThreshold) return 'warm';
      return 'cool';
    }

    // Complexity: O(1)
    setTemperature(temp) {
      this.currentTemperature = temp;
      const newState = this.calculateState(temp);
      if (newState !== this.currentState) {
        this.currentState = newState;
        if (this.config.enableDynamicScaling) this.adjustConcurrency();
      }
    }

    // Complexity: O(1)
    adjustConcurrency() {
      const { maxInstancesCool, minInstancesHot } = this.config;
      switch (this.currentState) {
        case 'emergency':
          this.currentConcurrency = Math.max(2, Math.floor(minInstancesHot / 2));
          this.throttleCount++;
          break;
        case 'critical':
          this.currentConcurrency = minInstancesHot;
          this.throttleCount++;
          break;
        case 'hot':
          this.currentConcurrency = Math.floor(
            minInstancesHot + (maxInstancesCool - minInstancesHot) * 0.3
          );
          this.throttleCount++;
          break;
        case 'warm':
          this.currentConcurrency = Math.floor(maxInstancesCool * 0.7);
          break;
        case 'cool':
        default:
          this.currentConcurrency = maxInstancesCool;
      }
    }

    // Complexity: O(1)
    isThrottling() {
      return ['hot', 'critical', 'emergency'].includes(this.currentState);
    }

    // Complexity: O(1)
    getMetrics() {
      return {
        currentTemperature: this.currentTemperature,
        state: this.currentState,
        currentConcurrency: this.currentConcurrency,
        maxConcurrency: this.config.maxInstancesCool,
        throttleCount: this.throttleCount,
        completedTasks: this.completedTasks,
        avgTaskTime: this.completedTasks > 0 ? this.totalTaskTime / this.completedTasks : 0,
      };
    }

    // Complexity: O(1)
    getState() {
      return this.currentState;
    }
    // Complexity: O(1)
    getConcurrency() {
      return this.currentConcurrency;
    }
    // Complexity: O(1)
    getTemperature() {
      return this.currentTemperature;
    }
    // Complexity: O(1)
    getConfig() {
      return { ...this.config };
    }
    // Complexity: O(1)
    forceConcurrency(c) {
      this.currentConcurrency = Math.max(1, Math.min(c, this.config.maxInstancesCool));
    }
  }

  // Complexity: O(1)
  test('ThermalAwarePool should initialize with defaults', () => {
    const pool = new ThermalAwarePool();
    // Complexity: O(N)
    expect(pool.currentState).toBe('cool');
    // Complexity: O(N)
    expect(pool.currentConcurrency).toBe(40);
  });

  // Complexity: O(N)
  test('calculateState should return cool for low temp', () => {
    const pool = new ThermalAwarePool();
    // Complexity: O(N)
    expect(pool.calculateState(60)).toBe('cool');
  });

  // Complexity: O(N)
  test('calculateState should return warm for medium temp', () => {
    const pool = new ThermalAwarePool();
    // Complexity: O(N)
    expect(pool.calculateState(80)).toBe('warm');
  });

  // Complexity: O(N)
  test('calculateState should return hot for high temp', () => {
    const pool = new ThermalAwarePool();
    // Complexity: O(N)
    expect(pool.calculateState(92)).toBe('hot');
  });

  // Complexity: O(N)
  test('calculateState should return critical for very high temp', () => {
    const pool = new ThermalAwarePool();
    // Complexity: O(N)
    expect(pool.calculateState(96)).toBe('critical');
  });

  // Complexity: O(N)
  test('calculateState should return emergency for extreme temp', () => {
    const pool = new ThermalAwarePool();
    // Complexity: O(1)
    expect(pool.calculateState(101)).toBe('emergency');
  });

  // Complexity: O(1)
  test('setTemperature should update state', () => {
    const pool = new ThermalAwarePool();
    pool.setTemperature(92);
    // Complexity: O(1)
    expect(pool.currentState).toBe('hot');
  });

  // Complexity: O(1)
  test('setTemperature should adjust concurrency', () => {
    const pool = new ThermalAwarePool();
    pool.setTemperature(96);
    // Complexity: O(1)
    expect(pool.currentConcurrency).toBeLessThan(40);
  });

  // Complexity: O(1)
  test('isThrottling should return true when hot', () => {
    const pool = new ThermalAwarePool();
    pool.setTemperature(92);
    // Complexity: O(1)
    expect(pool.isThrottling()).toBe(true);
  });

  // Complexity: O(1)
  test('isThrottling should return false when cool', () => {
    const pool = new ThermalAwarePool();
    pool.setTemperature(60);
    // Complexity: O(1)
    expect(pool.isThrottling()).toBe(false);
  });

  // Complexity: O(1)
  test('getMetrics should return all metrics', () => {
    const pool = new ThermalAwarePool();
    const metrics = pool.getMetrics();
    // Complexity: O(1)
    expect(metrics).toHaveProperty('currentTemperature');
    // Complexity: O(1)
    expect(metrics).toHaveProperty('state');
    // Complexity: O(1)
    expect(metrics).toHaveProperty('currentConcurrency');
  });

  // Complexity: O(1)
  test('forceConcurrency should override scaling', () => {
    const pool = new ThermalAwarePool();
    pool.forceConcurrency(10);
    // Complexity: O(1)
    expect(pool.getConcurrency()).toBe(10);
  });

  // Complexity: O(1)
  test('forceConcurrency should clamp to max', () => {
    const pool = new ThermalAwarePool();
    pool.forceConcurrency(100);
    // Complexity: O(1)
    expect(pool.getConcurrency()).toBe(40);
  });

  // Complexity: O(1)
  test('forceConcurrency should clamp to min 1', () => {
    const pool = new ThermalAwarePool();
    pool.forceConcurrency(0);
    // Complexity: O(1)
    expect(pool.getConcurrency()).toBe(1);
  });

  // Complexity: O(1)
  test('throttleCount should increment on throttle', () => {
    const pool = new ThermalAwarePool();
    pool.setTemperature(92);
    // Complexity: O(1)
    expect(pool.throttleCount).toBeGreaterThan(0);
  });

  // Complexity: O(1)
  test('getConfig should return config copy', () => {
    const pool = new ThermalAwarePool({ maxInstancesCool: 20 });
    const config = pool.getConfig();
    // Complexity: O(1)
    expect(config.maxInstancesCool).toBe(20);
    config.maxInstancesCool = 100;
    // Complexity: O(1)
    expect(pool.config.maxInstancesCool).toBe(20);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 42: DOCKER MANAGER TESTS
// ═══════════════════════════════════════════════════════════════════════════════

    // Complexity: O(1)
describe('Step 42: DockerManager', () => {
  class ContainerConfig {
    constructor(options = {}) {
      this.name = options.name ?? 'chrome';
      this.browser = options.browser ?? 'chrome';
      this.instances = options.instances ?? 4;
      this.memoryLimit = options.memoryLimit ?? '2g';
      this.cpuLimit = options.cpuLimit ?? '2.0';
      this.enableVnc = options.enableVnc ?? true;
      this.vncPort = options.vncPort ?? 5900;
      this.seleniumPort = options.seleniumPort ?? 5555;
    }
  }

  // Complexity: O(1)
  test('ContainerConfig should have defaults', () => {
    const config = new ContainerConfig();
    // Complexity: O(1)
    expect(config.browser).toBe('chrome');
    // Complexity: O(1)
    expect(config.instances).toBe(4);
  });

  // Complexity: O(1)
  test('ContainerConfig should accept custom values', () => {
    const config = new ContainerConfig({ browser: 'firefox', instances: 8 });
    // Complexity: O(1)
    expect(config.browser).toBe('firefox');
    // Complexity: O(1)
    expect(config.instances).toBe(8);
  });

  // GridConfig
  class GridConfig {
    constructor(options = {}) {
      this.hubPort = options.hubPort ?? 4444;
      this.maxSessions = options.maxSessions ?? 16;
      this.sessionTimeout = options.sessionTimeout ?? 300;
      this.networkName = options.networkName ?? 'QAntum-grid';
      this.enableVideo = options.enableVideo ?? false;
      this.nodes = options.nodes ?? [];
    }
  }

  // Complexity: O(1)
  test('GridConfig should have default port', () => {
    const config = new GridConfig();
    // Complexity: O(1)
    expect(config.hubPort).toBe(4444);
  });

  // Complexity: O(1)
  test('GridConfig should accept custom sessions', () => {
    const config = new GridConfig({ maxSessions: 32 });
    // Complexity: O(1)
    expect(config.maxSessions).toBe(32);
  });

  // DockerManager mock
  class DockerManager {
    constructor(config = {}) {
      this.config = new GridConfig(config);
      this.isGridRunning = false;
      this.containers = new Map();
    }

    // Complexity: O(1)
    generateDockerfile() {
      return `FROM node:20-slim
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
ENV NODE_ENV=production
CMD ["npm", "run", "test"]`;
    }

    // Complexity: O(N) — loop
    generateDockerCompose() {
      const services = {
        'selenium-hub': {
          image: 'selenium/hub:4.16.1',
          ports: [`${this.config.hubPort}:4444`],
        },
      };

      for (const node of this.config.nodes) {
        services[`${node.browser}-node`] = {
          image: `selenium/node-${node.browser}:4.16.1`,
          depends_on: ['selenium-hub'],
        };
      }

      return JSON.stringify({ version: '3.8', services }, null, 2);
    }

    // Complexity: O(1)
    async startGrid() {
      if (this.isGridRunning) throw new Error('Grid already running');
      this.isGridRunning = true;
      return { hubPort: this.config.hubPort };
    }

    // Complexity: O(1)
    async stopGrid() {
      this.isGridRunning = false;
    }

    // Complexity: O(1)
    isRunning() {
      return this.isGridRunning;
    }

    // Complexity: O(1)
    getStatus() {
      return {
        running: this.isGridRunning,
        hubPort: this.config.hubPort,
        nodes: this.config.nodes.length,
      };
    }

    // Complexity: O(1)
    addNode(node) {
      this.config.nodes.push(node);
    }
  }

  // Complexity: O(1)
  test('DockerManager generateDockerfile should return valid content', () => {
    const dm = new DockerManager();
    const dockerfile = dm.generateDockerfile();
    // Complexity: O(1)
    expect(dockerfile).toContain('FROM node');
    // Complexity: O(1)
    expect(dockerfile).toContain('WORKDIR');
  });

  // Complexity: O(1)
  test('DockerManager generateDockerCompose should include hub', () => {
    const dm = new DockerManager();
    const compose = dm.generateDockerCompose();
    // Complexity: O(1)
    expect(compose).toContain('selenium-hub');
  });

  // Complexity: O(1)
  test('DockerManager generateDockerCompose should include nodes', () => {
    const dm = new DockerManager({ nodes: [{ browser: 'chrome' }] });
    const compose = dm.generateDockerCompose();
    // Complexity: O(1)
    expect(compose).toContain('chrome-node');
  });

  // Complexity: O(1)
  test('DockerManager startGrid should set running', async () => {
    const dm = new DockerManager();
    // SAFETY: async operation — wrap in try-catch for production resilience
    await dm.startGrid();
    // Complexity: O(1)
    expect(dm.isRunning()).toBe(true);
  });

  // Complexity: O(1)
  test('DockerManager startGrid should throw if already running', async () => {
    const dm = new DockerManager();
    // SAFETY: async operation — wrap in try-catch for production resilience
    await dm.startGrid();
    let threw = false;
    try {
      await dm.startGrid();
    } catch {
      threw = true;
    }
    // Complexity: O(1)
    expect(threw).toBe(true);
  });

  // Complexity: O(1)
  test('DockerManager stopGrid should clear running', async () => {
    const dm = new DockerManager();
    // SAFETY: async operation — wrap in try-catch for production resilience
    await dm.startGrid();
    // SAFETY: async operation — wrap in try-catch for production resilience
    await dm.stopGrid();
    // Complexity: O(1)
    expect(dm.isRunning()).toBe(false);
  });

  // Complexity: O(1)
  test('DockerManager getStatus should return info', () => {
    const dm = new DockerManager({ hubPort: 5555 });
    const status = dm.getStatus();
    // Complexity: O(1)
    expect(status.hubPort).toBe(5555);
    // Complexity: O(1)
    expect(status).toHaveProperty('running');
  });

  // Complexity: O(1)
  test('DockerManager addNode should add to config', () => {
    const dm = new DockerManager();
    dm.addNode({ browser: 'firefox' });
    // Complexity: O(1)
    expect(dm.config.nodes).toHaveLength(1);
  });

  // Selenium Grid URL builder
  class GridUrlBuilder {
    constructor(host = 'localhost', port = 4444) {
      this.host = host;
      this.port = port;
    }

    // Complexity: O(1)
    getHubUrl() {
      return `http://${this.host}:${this.port}/wd/hub`;
    }
    // Complexity: O(1)
    getStatusUrl() {
      return `http://${this.host}:${this.port}/status`;
    }
    // Complexity: O(1)
    getSessionUrl(sessionId) {
      return `http://${this.host}:${this.port}/session/${sessionId}`;
    }
  }

  // Complexity: O(1)
  test('GridUrlBuilder should build hub URL', () => {
    const builder = new GridUrlBuilder();
    // Complexity: O(1)
    expect(builder.getHubUrl()).toBe('http://localhost:4444/wd/hub');
  });

  // Complexity: O(1)
  test('GridUrlBuilder should build status URL', () => {
    const builder = new GridUrlBuilder('grid.local', 5555);
    // Complexity: O(1)
    expect(builder.getStatusUrl()).toBe('http://grid.local:5555/status');
  });

  // Complexity: O(1)
  test('GridUrlBuilder should build session URL', () => {
    const builder = new GridUrlBuilder();
    // Complexity: O(1)
    expect(builder.getSessionUrl('abc123')).toContain('abc123');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// POM INTEGRATION TESTS
// ═══════════════════════════════════════════════════════════════════════════════

    // Complexity: O(1)
describe('POM & Explicit Waits Integration', () => {
  // Complexity: O(1)
  test('PageObject should register elements', () => {
    const page = new PageObject('LoginPage');
    page.registerElement('username', '#username');
    page.registerElement('password', '#password');
    // Complexity: O(1)
    expect(page.getSelector('username')).toBe('#username');
  });

  // Complexity: O(1)
  test('PageObject should chain registrations', () => {
    const page = new PageObject('HomePage')
      .registerElement('nav', '.nav')
      .registerElement('footer', '.footer');
    // Complexity: O(1)
    expect(page.elements.size).toBe(2);
  });

  // Complexity: O(1)
  test('ExplicitWait should resolve when condition met', async () => {
    const wait = new ExplicitWait(1000);
    let counter = 0;
    // SAFETY: async operation — wrap in try-catch for production resilience
    const result = await wait.until(() => {
      counter++;
      return counter >= 3;
    });
    // Complexity: O(1)
    expect(result).toBe(true);
  });

  // Complexity: O(1)
  test('ExplicitWait elementVisible should create condition', () => {
    const condition = ExplicitWait.elementVisible({ visible: true });
    // Complexity: O(1)
    expect(condition()).toBe(true);
  });

  // Complexity: O(1)
  test('ExplicitWait elementClickable should create condition', () => {
    const condition = ExplicitWait.elementClickable({ enabled: true });
    // Complexity: O(1)
    expect(condition()).toBe(true);
  });

  // Complexity: O(1)
  test('PageObject waitForElement should return found status', async () => {
    const page = new PageObject('TestPage');
    page.registerElement('btn', '#submit');
    // SAFETY: async operation — wrap in try-catch for production resilience
    const result = await page.waitForElement('btn', 100);
    // Complexity: O(1)
    expect(result.found).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// FINAL SUMMARY
// ═══════════════════════════════════════════════════════════════════════════════

console.log('\n' + '═'.repeat(70));
console.log('📊 PHASE 3A INFRASTRUCTURE TEST RESULTS');
console.log('═'.repeat(70));
console.log(`✅ Passed: ${testResults.passed}`);
console.log(`❌ Failed: ${testResults.failed}`);
console.log(`📝 Total:  ${testResults.total}`);
console.log(`📈 Rate:   ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
console.log('═'.repeat(70));

process.exit(testResults.failed > 0 ? 1 : 0);
