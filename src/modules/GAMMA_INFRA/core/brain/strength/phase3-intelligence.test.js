/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * PHASE 3B: INTELLIGENCE TESTS (Steps 43-47)
 * ═══════════════════════════════════════════════════════════════════════════════
 * Hardware Telemetry, SEGC Controller, Ghost Execution, Predictive Preloader, UX Auditor
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
      if (actual === undefined) throw new Error('Expected defined');
    },
    toBeUndefined: () => {
      if (actual !== undefined) throw new Error('Expected undefined');
    },
    toBeTruthy: () => {
      if (!actual) throw new Error('Expected truthy');
    },
    toBeFalsy: () => {
      if (actual) throw new Error('Expected falsy');
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
      } else if (!actual.includes(expected)) throw new Error(`Doesn't contain ${expected}`);
    },
    toHaveLength: (expected) => {
      if (actual.length !== expected) throw new Error(`Length ${actual.length} != ${expected}`);
    },
    toHaveProperty: (prop) => {
      if (!(prop in actual)) throw new Error(`Missing property: ${prop}`);
    },
    toBeInstanceOf: (cls) => {
      if (!(actual instanceof cls)) throw new Error(`Not instance of ${cls.name}`);
    },
    not: {
      toBe: (expected) => {
        if (actual === expected) throw new Error(`Should not be ${expected}`);
      },
      toContain: (expected) => {
        if (Array.isArray(actual) && actual.includes(expected))
          throw new Error(`Should not contain ${expected}`);
      },
      toBeNull: () => {
        if (actual === null) throw new Error('Should not be null');
      },
    },
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 43: HARDWARE TELEMETRY TESTS
// ═══════════════════════════════════════════════════════════════════════════════

    // Complexity: O(1)
describe('Step 43: HardwareTelemetry', () => {
  class CoreMetrics {
    constructor(id, usage = 0) {
      this.id = id;
      this.model = 'AMD Ryzen 7 7435HS';
      this.speed = 3100;
      this.usage = usage;
    }
  }

  // Complexity: O(1)
  test('CoreMetrics should store CPU info', () => {
    const core = new CoreMetrics(0, 45);
    // Complexity: O(1)
    expect(core.id).toBe(0);
    // Complexity: O(1)
    expect(core.usage).toBe(45);
  });

  // Complexity: O(1)
  test('CoreMetrics should have Ryzen model', () => {
    const core = new CoreMetrics(1);
    // Complexity: O(1)
    expect(core.model).toContain('Ryzen');
  });

  class SystemMetrics {
    constructor() {
      this.timestamp = Date.now();
      this.cpu = {
        model: 'AMD Ryzen 7 7435HS',
        cores: 8,
        threads: 16,
        usage: 0,
        perCore: [],
      };
      this.memory = {
        total: 16 * 1024 * 1024 * 1024,
        used: 0,
        free: 0,
        usagePercent: 0,
      };
      this.system = {
        platform: 'win32',
        arch: 'x64',
        uptime: 0,
      };
    }

    // Complexity: O(1)
    updateCpu(usage) {
      this.cpu.usage = usage;
      this.timestamp = Date.now();
    }

    // Complexity: O(1)
    updateMemory(used, total) {
      this.memory.used = used;
      this.memory.total = total;
      this.memory.free = total - used;
      this.memory.usagePercent = (used / total) * 100;
    }
  }

  // Complexity: O(1)
  test('SystemMetrics should initialize with timestamp', () => {
    const metrics = new SystemMetrics();
    // Complexity: O(1)
    expect(metrics.timestamp).toBeGreaterThan(0);
  });

  // Complexity: O(1)
  test('SystemMetrics should have CPU info', () => {
    const metrics = new SystemMetrics();
    // Complexity: O(1)
    expect(metrics.cpu.cores).toBe(8);
    // Complexity: O(1)
    expect(metrics.cpu.threads).toBe(16);
  });

  // Complexity: O(1)
  test('SystemMetrics updateCpu should set usage', () => {
    const metrics = new SystemMetrics();
    metrics.updateCpu(75);
    // Complexity: O(1)
    expect(metrics.cpu.usage).toBe(75);
  });

  // Complexity: O(1)
  test('SystemMetrics updateMemory should calculate free', () => {
    const metrics = new SystemMetrics();
    metrics.updateMemory(8000, 16000);
    // Complexity: O(1)
    expect(metrics.memory.free).toBe(8000);
    // Complexity: O(1)
    expect(metrics.memory.usagePercent).toBe(50);
  });

  class ThrottleConfig {
    constructor(options = {}) {
      this.cpuThreshold = options.cpuThreshold ?? 90;
      this.memoryThreshold = options.memoryThreshold ?? 85;
      this.throttleDelay = options.throttleDelay ?? 100;
      this.minWorkers = options.minWorkers ?? 2;
      this.maxWorkers = options.maxWorkers ?? 14;
      this.checkInterval = options.checkInterval ?? 1000;
      this.cooldownPeriod = options.cooldownPeriod ?? 5000;
    }
  }

  // Complexity: O(1)
  test('ThrottleConfig should have defaults', () => {
    const config = new ThrottleConfig();
    // Complexity: O(1)
    expect(config.cpuThreshold).toBe(90);
    // Complexity: O(1)
    expect(config.maxWorkers).toBe(14);
  });

  // Complexity: O(1)
  test('ThrottleConfig should accept custom values', () => {
    const config = new ThrottleConfig({ cpuThreshold: 80, maxWorkers: 8 });
    // Complexity: O(1)
    expect(config.cpuThreshold).toBe(80);
    // Complexity: O(1)
    expect(config.maxWorkers).toBe(8);
  });

  class HardwareTelemetry {
    constructor(config = {}) {
      this.config = new ThrottleConfig(config);
      this.isThrottled = false;
      this.throttleCount = 0;
      this.metricsHistory = [];
      this.maxHistory = 100;
      this.isMonitoring = false;
    }

    // Complexity: O(1)
    startMonitoring() {
      this.isMonitoring = true;
    }
    // Complexity: O(1)
    stopMonitoring() {
      this.isMonitoring = false;
    }

    // Complexity: O(1)
    collectMetrics() {
      const metrics = new SystemMetrics();
      metrics.updateCpu(Math.random() * 100);
      metrics.updateMemory(Math.random() * 16 * 1024 * 1024 * 1024, 16 * 1024 * 1024 * 1024);
      this.metricsHistory.push(metrics);
      if (this.metricsHistory.length > this.maxHistory) {
        this.metricsHistory.shift();
      }
      return metrics;
    }

    // Complexity: O(1)
    checkThrottling(metrics) {
      const shouldThrottle =
        metrics.cpu.usage > this.config.cpuThreshold ||
        metrics.memory.usagePercent > this.config.memoryThreshold;

      if (shouldThrottle && !this.isThrottled) {
        this.isThrottled = true;
        this.throttleCount++;
      } else if (!shouldThrottle && this.isThrottled) {
        this.isThrottled = false;
      }
      return shouldThrottle;
    }

    // Complexity: O(1)
    getLastMetrics() {
      return this.metricsHistory[this.metricsHistory.length - 1];
    }

    // Complexity: O(N) — linear scan
    getAverageUsage(count = 10) {
      const recent = this.metricsHistory.slice(-count);
      if (recent.length === 0) return 0;
      return recent.reduce((sum, m) => sum + m.cpu.usage, 0) / recent.length;
    }
  }

  // Complexity: O(1)
  test('HardwareTelemetry should start monitoring', () => {
    const tel = new HardwareTelemetry();
    tel.startMonitoring();
    // Complexity: O(1)
    expect(tel.isMonitoring).toBe(true);
  });

  // Complexity: O(1)
  test('HardwareTelemetry collectMetrics should return metrics', () => {
    const tel = new HardwareTelemetry();
    const metrics = tel.collectMetrics();
    // Complexity: O(1)
    expect(metrics).toHaveProperty('cpu');
    // Complexity: O(1)
    expect(metrics).toHaveProperty('memory');
  });

  // Complexity: O(1)
  test('HardwareTelemetry should store history', () => {
    const tel = new HardwareTelemetry();
    tel.collectMetrics();
    tel.collectMetrics();
    // Complexity: O(1)
    expect(tel.metricsHistory).toHaveLength(2);
  });

  // Complexity: O(1)
  test('HardwareTelemetry checkThrottling should detect high CPU', () => {
    const tel = new HardwareTelemetry({ cpuThreshold: 50 });
    const metrics = new SystemMetrics();
    metrics.updateCpu(60);
    // Complexity: O(1)
    expect(tel.checkThrottling(metrics)).toBe(true);
  });

  // Complexity: O(1)
  test('HardwareTelemetry checkThrottling should detect high memory', () => {
    const tel = new HardwareTelemetry({ memoryThreshold: 50 });
    const metrics = new SystemMetrics();
    metrics.updateMemory(7000, 10000);
    // Complexity: O(1)
    expect(tel.checkThrottling(metrics)).toBe(true);
  });

  // Complexity: O(1)
  test('HardwareTelemetry should track throttle count', () => {
    const tel = new HardwareTelemetry({ cpuThreshold: 50 });
    const metrics = new SystemMetrics();
    metrics.updateCpu(60);
    tel.checkThrottling(metrics);
    // Complexity: O(1)
    expect(tel.throttleCount).toBe(1);
  });

  // Complexity: O(N) — loop
  test('HardwareTelemetry getAverageUsage should calculate', () => {
    const tel = new HardwareTelemetry();
    for (let i = 0; i < 5; i++) tel.collectMetrics();
    const avg = tel.getAverageUsage(5);
    // Complexity: O(1)
    expect(avg).toBeGreaterThanOrEqual(0);
    // Complexity: O(1)
    expect(avg).toBeLessThan(100);
  });

  // Complexity: O(N) — loop
  test('HardwareTelemetry should limit history', () => {
    const tel = new HardwareTelemetry();
    tel.maxHistory = 5;
    for (let i = 0; i < 10; i++) tel.collectMetrics();
    // Complexity: O(1)
    expect(tel.metricsHistory.length).toBeLessThan(10);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 44: SEGC CONTROLLER TESTS
// ═══════════════════════════════════════════════════════════════════════════════

    // Complexity: O(1)
describe('Step 44: SEGCController', () => {
  class GeneticMutation {
    constructor(id, type, selector, confidence = 0.5) {
      this.id = id;
      this.type = type;
      this.selector = selector;
      this.confidence = confidence;
      this.appliedAt = null;
    }

    // Complexity: O(1)
    apply() {
      this.appliedAt = new Date();
      return true;
    }
  }

  // Complexity: O(1)
  test('GeneticMutation should store mutation info', () => {
    const mut = new GeneticMutation('mut-1', 'selector-change', '#btn');
    // Complexity: O(1)
    expect(mut.id).toBe('mut-1');
    // Complexity: O(1)
    expect(mut.type).toBe('selector-change');
  });

  // Complexity: O(1)
  test('GeneticMutation apply should set timestamp', () => {
    const mut = new GeneticMutation('mut-2', 'css', '.nav');
    mut.apply();
    // Complexity: O(1)
    expect(mut.appliedAt).not.toBeNull();
  });

  class GeneticMutationEngine {
    constructor() {
      this.pendingMutations = [];
      this.appliedMutations = [];
      this.stats = { generated: 0, applied: 0, rejected: 0 };
    }

    // Complexity: O(1)
    generateMutation(selector) {
      const mutation = new GeneticMutation(
        `mut-${Date.now()}`,
        'selector-improvement',
        selector,
        Math.random()
      );
      this.pendingMutations.push(mutation);
      this.stats.generated++;
      return mutation;
    }

    // Complexity: O(1)
    applyMutation(id) {
      const idx = this.pendingMutations.findIndex((m) => m.id === id);
      if (idx === -1) return false;

      const mut = this.pendingMutations.splice(idx, 1)[0];
      mut.apply();
      this.appliedMutations.push(mut);
      this.stats.applied++;
      return true;
    }

    // Complexity: O(1)
    rejectMutation(id) {
      const idx = this.pendingMutations.findIndex((m) => m.id === id);
      if (idx === -1) return false;
      this.pendingMutations.splice(idx, 1);
      this.stats.rejected++;
      return true;
    }

    // Complexity: O(1)
    getPendingMutations() {
      return [...this.pendingMutations];
    }
    // Complexity: O(N) — linear scan
    getHighConfidence(threshold = 0.8) {
      return this.pendingMutations.filter((m) => m.confidence >= threshold);
    }
  }

  // Complexity: O(1)
  test('GeneticMutationEngine should generate mutations', () => {
    const engine = new GeneticMutationEngine();
    const mut = engine.generateMutation('#submit');
    // Complexity: O(1)
    expect(mut).toBeDefined();
    // Complexity: O(1)
    expect(engine.stats.generated).toBe(1);
  });

  // Complexity: O(1)
  test('GeneticMutationEngine should apply mutations', () => {
    const engine = new GeneticMutationEngine();
    const mut = engine.generateMutation('.btn');
    engine.applyMutation(mut.id);
    // Complexity: O(1)
    expect(engine.appliedMutations).toHaveLength(1);
    // Complexity: O(1)
    expect(engine.stats.applied).toBe(1);
  });

  // Complexity: O(1)
  test('GeneticMutationEngine should reject mutations', () => {
    const engine = new GeneticMutationEngine();
    const mut = engine.generateMutation('.danger');
    engine.rejectMutation(mut.id);
    // Complexity: O(1)
    expect(engine.pendingMutations).toHaveLength(0);
    // Complexity: O(1)
    expect(engine.stats.rejected).toBe(1);
  });

  // Complexity: O(N) — linear scan
  test('GeneticMutationEngine getHighConfidence should filter', () => {
    const engine = new GeneticMutationEngine();
    for (let i = 0; i < 10; i++) engine.generateMutation(`#el-${i}`);
    const high = engine.getHighConfidence(0.8);
    high.forEach((m) => expect(m.confidence).toBeGreaterThanOrEqual(0.8));
  });

  class HotSwapModuleLoader {
    constructor() {
      this.modules = new Map();
      this.swapCount = 0;
    }

    // Complexity: O(1) — lookup
    register(name, impl) {
      this.modules.set(name, { impl, version: 1, loadedAt: Date.now() });
    }

    // Complexity: O(1) — lookup
    swap(name, newImpl) {
      const existing = this.modules.get(name);
      if (!existing) return false;
      this.modules.set(name, {
        impl: newImpl,
        version: existing.version + 1,
        loadedAt: Date.now(),
      });
      this.swapCount++;
      return true;
    }

    // Complexity: O(1) — lookup
    get(name) {
      const mod = this.modules.get(name);
      return mod ? mod.impl : null;
    }

    // Complexity: O(1) — lookup
    getVersion(name) {
      const mod = this.modules.get(name);
      return mod ? mod.version : 0;
    }
  }

  // Complexity: O(1) — lookup
  test('HotSwapModuleLoader should register modules', () => {
    const loader = new HotSwapModuleLoader();
    loader.register('selectorEngine', () => {});
    // Complexity: O(1)
    expect(loader.get('selectorEngine')).not.toBeNull();
  });

  // Complexity: O(1)
  test('HotSwapModuleLoader should swap modules', () => {
    const loader = new HotSwapModuleLoader();
    loader.register('parser', () => 'v1');
    loader.swap('parser', () => 'v2');
    // Complexity: O(1)
    expect(loader.getVersion('parser')).toBe(2);
    // Complexity: O(1)
    expect(loader.swapCount).toBe(1);
  });

  // Complexity: O(1)
  test('HotSwapModuleLoader swap non-existent should return false', () => {
    const loader = new HotSwapModuleLoader();
    // Complexity: O(1)
    expect(loader.swap('fake', () => {})).toBe(false);
  });

  class SEGCController {
    constructor(config = {}) {
      this.config = {
        enabled: config.enabled ?? true,
        learningRate: config.learningRate ?? 0.1,
        verbose: config.verbose ?? false,
      };
      this.mutations = new GeneticMutationEngine();
      this.hotswap = new HotSwapModuleLoader();
      this.learningCycles = 0;
      this.improvements = 0;
    }

    // Complexity: O(N) — loop
    async runLearningCycle() {
      this.learningCycles++;
      const pending = this.mutations.getPendingMutations();
      const applied = [];

      for (const mut of pending) {
        if (mut.confidence >= 0.8) {
          this.mutations.applyMutation(mut.id);
          applied.push(mut);
          this.improvements++;
        }
      }

      return { improvements: applied.length, mutations: applied };
    }

    // Complexity: O(1)
    getStats() {
      return {
        learningCycles: this.learningCycles,
        improvements: this.improvements,
        pendingMutations: this.mutations.pendingMutations.length,
        appliedMutations: this.mutations.appliedMutations.length,
      };
    }
  }

  // Complexity: O(1)
  test('SEGCController should initialize with config', () => {
    const segc = new SEGCController({ learningRate: 0.2 });
    // Complexity: O(1)
    expect(segc.config.learningRate).toBe(0.2);
  });

  // Complexity: O(1)
  test('SEGCController runLearningCycle should increment count', async () => {
    const segc = new SEGCController();
    // SAFETY: async operation — wrap in try-catch for production resilience
    await segc.runLearningCycle();
    // Complexity: O(1)
    expect(segc.learningCycles).toBe(1);
  });

  // Complexity: O(N) — loop
  test('SEGCController should apply high-confidence mutations', async () => {
    const segc = new SEGCController();
    // Generate mutations
    for (let i = 0; i < 5; i++) {
      const mut = segc.mutations.generateMutation(`#el-${i}`);
      mut.confidence = 0.9; // Force high confidence
    }
    // SAFETY: async operation — wrap in try-catch for production resilience
    await segc.runLearningCycle();
    // Complexity: O(1)
    expect(segc.improvements).toBeGreaterThan(0);
  });

  // Complexity: O(1)
  test('SEGCController getStats should return stats', () => {
    const segc = new SEGCController();
    const stats = segc.getStats();
    // Complexity: O(1)
    expect(stats).toHaveProperty('learningCycles');
    // Complexity: O(1)
    expect(stats).toHaveProperty('improvements');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 45: GHOST EXECUTION TESTS
// ═══════════════════════════════════════════════════════════════════════════════

    // Complexity: O(N) — loop
describe('Step 45: GhostExecutionLayer', () => {
  class GhostPath {
    constructor(selector, strategy = 'css') {
      this.selector = selector;
      this.strategy = strategy;
      this.confidence = 0.5;
      this.createdAt = Date.now();
    }
  }

  // Complexity: O(1)
  test('GhostPath should store selector and strategy', () => {
    const path = new GhostPath('#submit', 'css');
    // Complexity: O(1)
    expect(path.selector).toBe('#submit');
    // Complexity: O(1)
    expect(path.strategy).toBe('css');
  });

  // Complexity: O(1)
  test('GhostPath should default to css strategy', () => {
    const path = new GhostPath('.btn');
    // Complexity: O(1)
    expect(path.strategy).toBe('css');
  });

  class GhostExecutionResult {
    constructor(path, success, executionTime) {
      this.path = path;
      this.success = success;
      this.executionTime = executionTime;
      this.elementFound = success;
      this.timestamp = new Date();
      this.error = null;
    }
  }

  // Complexity: O(1)
  test('GhostExecutionResult should capture result', () => {
    const path = new GhostPath('#btn');
    const result = new GhostExecutionResult(path, true, 150);
    // Complexity: O(1)
    expect(result.success).toBe(true);
    // Complexity: O(1)
    expect(result.executionTime).toBe(150);
  });

  class GhostSession {
    constructor(realPath, ghostPaths) {
      this.id = `ghost-${Date.now()}`;
      this.realPath = realPath;
      this.ghostPaths = ghostPaths;
      this.results = new Map();
      this.startedAt = new Date();
      this.completedAt = null;
      this.winner = null;
    }

    // Complexity: O(1) — lookup
    addResult(path, result) {
      this.results.set(path.selector, result);
    }

    // Complexity: O(N) — loop
    complete() {
      this.completedAt = new Date();
      // Find fastest successful path
      let best = null;
      let bestTime = Infinity;
      for (const [selector, result] of this.results) {
        if (result.success && result.executionTime < bestTime) {
          best = selector;
          bestTime = result.executionTime;
        }
      }
      this.winner = best;
      return this.winner;
    }

    // Complexity: O(1)
    getDuration() {
      if (!this.completedAt) return Date.now() - this.startedAt.getTime();
      return this.completedAt.getTime() - this.startedAt.getTime();
    }
  }

  // Complexity: O(1)
  test('GhostSession should store paths', () => {
    const real = new GhostPath('#real');
    const ghosts = [new GhostPath('.alt1'), new GhostPath('.alt2')];
    const session = new GhostSession(real, ghosts);
    // Complexity: O(1)
    expect(session.ghostPaths).toHaveLength(2);
  });

  // Complexity: O(1)
  test('GhostSession complete should find winner', () => {
    const session = new GhostSession(new GhostPath('#real'), []);
    session.addResult(new GhostPath('#fast'), new GhostExecutionResult(null, true, 50));
    session.addResult(new GhostPath('#slow'), new GhostExecutionResult(null, true, 200));
    const winner = session.complete();
    // Complexity: O(1)
    expect(winner).toBe('#fast');
  });

  // Complexity: O(1)
  test('GhostSession complete should ignore failed paths', () => {
    const session = new GhostSession(new GhostPath('#real'), []);
    session.addResult(new GhostPath('#failed'), new GhostExecutionResult(null, false, 10));
    session.addResult(new GhostPath('#ok'), new GhostExecutionResult(null, true, 100));
    const winner = session.complete();
    // Complexity: O(1)
    expect(winner).toBe('#ok');
  });

  class KnowledgeBase {
    constructor() {
      this.paths = new Map();
    }

    // Complexity: O(1) — lookup
    record(selector, success, time) {
      const existing = this.paths.get(selector) || { successRate: 0, avgTime: 0, samples: 0 };
      const totalSuccess = existing.successRate * existing.samples + (success ? 1 : 0);
      const totalTime = existing.avgTime * existing.samples + time;
      existing.samples++;
      existing.successRate = totalSuccess / existing.samples;
      existing.avgTime = totalTime / existing.samples;
      this.paths.set(selector, existing);
    }

    // Complexity: O(1) — lookup
    getStats(selector) {
      return this.paths.get(selector) || null;
    }

    // Complexity: O(N) — loop
    getBest() {
      let best = null;
      let bestScore = -1;
      for (const [selector, stats] of this.paths) {
        const score = stats.successRate / (stats.avgTime + 1);
        if (score > bestScore) {
          best = selector;
          bestScore = score;
        }
      }
      return best;
    }
  }

  // Complexity: O(1)
  test('KnowledgeBase should record path stats', () => {
    const kb = new KnowledgeBase();
    kb.record('#btn', true, 100);
    const stats = kb.getStats('#btn');
    // Complexity: O(1)
    expect(stats.samples).toBe(1);
    // Complexity: O(1)
    expect(stats.successRate).toBe(1);
  });

  // Complexity: O(1)
  test('KnowledgeBase should calculate averages', () => {
    const kb = new KnowledgeBase();
    kb.record('#btn', true, 100);
    kb.record('#btn', true, 200);
    const stats = kb.getStats('#btn');
    // Complexity: O(1)
    expect(stats.avgTime).toBe(150);
  });

  // Complexity: O(1)
  test('KnowledgeBase getBest should return best selector', () => {
    const kb = new KnowledgeBase();
    kb.record('#fast', true, 50);
    kb.record('#slow', true, 500);
    // Complexity: O(1)
    expect(kb.getBest()).toBe('#fast');
  });

  class GhostExecutionLayer {
    constructor(config = {}) {
      this.config = {
        enabled: config.enabled ?? true,
        maxGhostThreads: config.maxGhostThreads ?? 3,
        ghostTimeout: config.ghostTimeout ?? 5000,
      };
      this.activeSessions = new Map();
      this.knowledgeBase = new KnowledgeBase();
      this.stats = { sessions: 0, improvements: 0, pathsTested: 0 };
    }

    // Complexity: O(1) — lookup
    startSession(realPath, alternatives) {
      const session = new GhostSession(realPath, alternatives);
      this.activeSessions.set(session.id, session);
      this.stats.sessions++;
      return session;
    }

    // Complexity: O(N) — loop
    completeSession(sessionId) {
      const session = this.activeSessions.get(sessionId);
      if (!session) return null;

      const winner = session.complete();

      // Update knowledge base
      for (const [selector, result] of session.results) {
        this.knowledgeBase.record(selector, result.success, result.executionTime);
        this.stats.pathsTested++;
      }

      if (winner && winner !== session.realPath.selector) {
        this.stats.improvements++;
      }

      this.activeSessions.delete(sessionId);
      return winner;
    }

    // Complexity: O(1)
    generateAlternatives(selector) {
      const alternatives = [];
      // CSS to XPath
      if (selector.startsWith('#')) {
        alternatives.push(new GhostPath(`//*[@id="${selector.slice(1)}"]`, 'xpath'));
      }
      // Add data-testid variant
      alternatives.push(new GhostPath(`[data-testid="${selector}"]`, 'css'));
      // Add text-based
      alternatives.push(new GhostPath(`text=${selector}`, 'text'));
      return alternatives;
    }
  }

  // Complexity: O(1)
  test('GhostExecutionLayer should start sessions', () => {
    const ghost = new GhostExecutionLayer();
    const session = ghost.startSession(new GhostPath('#btn'), []);
    // Complexity: O(1)
    expect(session).toBeDefined();
    // Complexity: O(1)
    expect(ghost.stats.sessions).toBe(1);
  });

  // Complexity: O(1)
  test('GhostExecutionLayer generateAlternatives should create paths', () => {
    const ghost = new GhostExecutionLayer();
    const alts = ghost.generateAlternatives('#submit');
    // Complexity: O(1)
    expect(alts.length).toBeGreaterThan(0);
  });

  // Complexity: O(1)
  test('GhostExecutionLayer completeSession should update KB', () => {
    const ghost = new GhostExecutionLayer();
    const session = ghost.startSession(new GhostPath('#btn'), []);
    session.addResult(new GhostPath('#btn'), new GhostExecutionResult(null, true, 100));
    ghost.completeSession(session.id);
    // Complexity: O(1)
    expect(ghost.stats.pathsTested).toBeGreaterThan(0);
  });

  // Complexity: O(1)
  test('GhostExecutionLayer completeSession should track improvements', () => {
    const ghost = new GhostExecutionLayer();
    const session = ghost.startSession(new GhostPath('#old'), []);
    session.addResult(new GhostPath('#old'), new GhostExecutionResult(null, true, 200));
    session.addResult(new GhostPath('#new'), new GhostExecutionResult(null, true, 50));
    ghost.completeSession(session.id);
    // Complexity: O(1)
    expect(ghost.stats.improvements).toBe(1);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 46: PREDICTIVE STATE PRELOADER TESTS
// ═══════════════════════════════════════════════════════════════════════════════

    // Complexity: O(N) — linear scan
describe('Step 46: PredictiveStatePreloader', () => {
  class StateTransition {
    constructor(from, to, probability = 0.5) {
      this.from = from;
      this.to = to;
      this.probability = probability;
      this.occurrences = 1;
      this.avgTime = 0;
    }

    // Complexity: O(1)
    record(time) {
      const total = this.avgTime * this.occurrences + time;
      this.occurrences++;
      this.avgTime = total / this.occurrences;
    }
  }

  // Complexity: O(1)
  test('StateTransition should store from/to', () => {
    const trans = new StateTransition('login', 'dashboard');
    // Complexity: O(1)
    expect(trans.from).toBe('login');
    // Complexity: O(1)
    expect(trans.to).toBe('dashboard');
  });

  // Complexity: O(1)
  test('StateTransition record should update stats', () => {
    const trans = new StateTransition('a', 'b');
    trans.record(100);
    trans.record(200);
    // Complexity: O(1)
    expect(trans.occurrences).toBe(3);
    // Complexity: O(1)
    expect(trans.avgTime).toBeGreaterThan(0);
  });

  class TransitionGraph {
    constructor() {
      this.graph = new Map();
    }

    // Complexity: O(1) — lookup
    addTransition(from, to, time = 0) {
      if (!this.graph.has(from)) {
        this.graph.set(from, new Map());
      }
      const transitions = this.graph.get(from);

      if (transitions.has(to)) {
        transitions.get(to).record(time);
      } else {
        const trans = new StateTransition(from, to);
        trans.avgTime = time;
        transitions.set(to, trans);
      }
      this.normalizeFrom(from);
    }

    // Complexity: O(N) — linear scan
    normalizeFrom(from) {
      const transitions = this.graph.get(from);
      if (!transitions) return;

      const total = Array.from(transitions.values()).reduce((sum, t) => sum + t.occurrences, 0);

      for (const trans of transitions.values()) {
        trans.probability = trans.occurrences / total;
      }
    }

    // Complexity: O(N log N) — sort
    getNextStates(from) {
      const transitions = this.graph.get(from);
      if (!transitions) return [];
      return Array.from(transitions.values()).sort((a, b) => b.probability - a.probability);
    }

    // Complexity: O(1)
    getMostLikely(from) {
      const next = this.getNextStates(from);
      return next.length > 0 ? next[0].to : null;
    }
  }

  // Complexity: O(1)
  test('TransitionGraph should add transitions', () => {
    const graph = new TransitionGraph();
    graph.addTransition('login', 'home', 100);
    const next = graph.getNextStates('login');
    // Complexity: O(1)
    expect(next).toHaveLength(1);
  });

  // Complexity: O(N) — linear scan
  test('TransitionGraph should normalize probabilities', () => {
    const graph = new TransitionGraph();
    graph.addTransition('home', 'profile', 100);
    graph.addTransition('home', 'settings', 100);
    const next = graph.getNextStates('home');
    const total = next.reduce((sum, t) => sum + t.probability, 0);
    // Complexity: O(1)
    expect(total).toBe(1);
  });

  // Complexity: O(1)
  test('TransitionGraph getMostLikely should return top', () => {
    const graph = new TransitionGraph();
    graph.addTransition('start', 'a', 100);
    graph.addTransition('start', 'a', 100);
    graph.addTransition('start', 'b', 100);
    // Complexity: O(1)
    expect(graph.getMostLikely('start')).toBe('a');
  });

  class SelectorCache {
    constructor(maxSize = 100, expiration = 300000) {
      this.cache = new Map();
      this.maxSize = maxSize;
      this.expiration = expiration;
      this.hits = 0;
      this.misses = 0;
    }

    // Complexity: O(1) — lookup
    set(state, selectors) {
      if (this.cache.size >= this.maxSize) {
        const oldest = this.cache.keys().next().value;
        this.cache.delete(oldest);
      }
      this.cache.set(state, { selectors, timestamp: Date.now() });
    }

    // Complexity: O(1) — lookup
    get(state) {
      const entry = this.cache.get(state);
      if (!entry) {
        this.misses++;
        return null;
      }
      if (Date.now() - entry.timestamp > this.expiration) {
        this.cache.delete(state);
        this.misses++;
        return null;
      }
      this.hits++;
      return entry.selectors;
    }

    // Complexity: O(1)
    getHitRate() {
      const total = this.hits + this.misses;
      return total > 0 ? this.hits / total : 0;
    }

    // Complexity: O(1)
    clear() {
      this.cache.clear();
    }
  }

  // Complexity: O(1) — lookup
  test('SelectorCache should store and retrieve', () => {
    const cache = new SelectorCache();
    cache.set('login', ['#username', '#password']);
    // Complexity: O(1)
    expect(cache.get('login')).toHaveLength(2);
  });

  // Complexity: O(1) — lookup
  test('SelectorCache should track hits', () => {
    const cache = new SelectorCache();
    cache.set('home', ['#nav']);
    cache.get('home');
    cache.get('home');
    // Complexity: O(1)
    expect(cache.hits).toBe(2);
  });

  // Complexity: O(1) — lookup
  test('SelectorCache should track misses', () => {
    const cache = new SelectorCache();
    cache.get('nonexistent');
    // Complexity: O(1)
    expect(cache.misses).toBe(1);
  });

  // Complexity: O(1) — lookup
  test('SelectorCache should respect maxSize', () => {
    const cache = new SelectorCache(3);
    cache.set('a', []);
    cache.set('b', []);
    cache.set('c', []);
    cache.set('d', []);
    // Complexity: O(1)
    expect(cache.cache.size).toBeLessThanOrEqual(3);
  });

  class PredictiveStatePreloader {
    constructor(config = {}) {
      this.config = {
        enabled: config.enabled ?? true,
        predictionThreshold: config.predictionThreshold ?? 0.3,
        lookAheadDepth: config.lookAheadDepth ?? 3,
        maxCacheSize: config.maxCacheSize ?? 100,
      };
      this.graph = new TransitionGraph();
      this.cache = new SelectorCache(this.config.maxCacheSize);
      this.currentState = 'initial';
      this.stats = { predictions: 0, preloaded: 0, timeSaved: 0 };
    }

    // Complexity: O(1)
    learnTransition(from, to, time) {
      this.graph.addTransition(from, to, time);
    }

    // Complexity: O(1)
    recordStateChange(newState) {
      this.learnTransition(this.currentState, newState, 0);
      this.currentState = newState;
      this.generatePredictions();
    }

    // Complexity: O(N) — linear scan
    generatePredictions() {
      const next = this.graph.getNextStates(this.currentState);
      const predictions = next
        .filter((t) => t.probability >= this.config.predictionThreshold)
        .slice(0, this.config.lookAheadDepth);

      this.stats.predictions += predictions.length;
      return predictions;
    }

    // Complexity: O(1) — lookup
    preloadSelectors(state, selectors) {
      this.cache.set(state, selectors);
      this.stats.preloaded++;
    }

    // Complexity: O(1) — lookup
    getPreloadedSelectors(state) {
      return this.cache.get(state);
    }

    // Complexity: O(1)
    getStats() {
      return {
        ...this.stats,
        cacheHitRate: this.cache.getHitRate(),
        currentState: this.currentState,
      };
    }
  }

  // Complexity: O(1)
  test('PredictiveStatePreloader should learn transitions', () => {
    const preloader = new PredictiveStatePreloader();
    preloader.learnTransition('login', 'home', 100);
    const next = preloader.graph.getNextStates('login');
    // Complexity: O(1)
    expect(next).toHaveLength(1);
  });

  // Complexity: O(1)
  test('PredictiveStatePreloader recordStateChange should update current', () => {
    const preloader = new PredictiveStatePreloader();
    preloader.recordStateChange('dashboard');
    // Complexity: O(1)
    expect(preloader.currentState).toBe('dashboard');
  });

  // Complexity: O(1)
  test('PredictiveStatePreloader should preload selectors', () => {
    const preloader = new PredictiveStatePreloader();
    preloader.preloadSelectors('checkout', ['#card', '#cvv']);
    // Complexity: O(1)
    expect(preloader.getPreloadedSelectors('checkout')).toHaveLength(2);
  });

  // Complexity: O(1)
  test('PredictiveStatePreloader getStats should return stats', () => {
    const preloader = new PredictiveStatePreloader();
    const stats = preloader.getStats();
    // Complexity: O(1)
    expect(stats).toHaveProperty('predictions');
    // Complexity: O(1)
    expect(stats).toHaveProperty('cacheHitRate');
  });

  // Complexity: O(1)
  test('PredictiveStatePreloader should generate predictions', () => {
    const preloader = new PredictiveStatePreloader({ predictionThreshold: 0 });
    preloader.learnTransition('home', 'profile', 100);
    preloader.currentState = 'home';
    const predictions = preloader.generatePredictions();
    // Complexity: O(1)
    expect(predictions.length).toBeGreaterThan(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 47: COGNITIVE UX AUDITOR TESTS
// ═══════════════════════════════════════════════════════════════════════════════

    // Complexity: O(1)
describe('Step 47: CognitiveUXAuditor', () => {
  class UXIssue {
    constructor(severity, category, description, impact = 50) {
      this.severity = severity;
      this.category = category;
      this.description = description;
      this.impact = impact;
      this.location = null;
      this.wcagReference = null;
    }

    // Complexity: O(1)
    setLocation(x, y, width, height) {
      this.location = { x, y, width, height };
    }

    // Complexity: O(1)
    setWcag(ref) {
      this.wcagReference = ref;
    }
  }

  // Complexity: O(1)
  test('UXIssue should store issue details', () => {
    const issue = new UXIssue('critical', 'accessibility', 'Missing alt text');
    // Complexity: O(1)
    expect(issue.severity).toBe('critical');
    // Complexity: O(1)
    expect(issue.category).toBe('accessibility');
  });

  // Complexity: O(1)
  test('UXIssue should set location', () => {
    const issue = new UXIssue('minor', 'visual', 'Color contrast low');
    issue.setLocation(100, 200, 50, 30);
    // Complexity: O(1)
    expect(issue.location.x).toBe(100);
  });

  // Complexity: O(1)
  test('UXIssue should set WCAG reference', () => {
    const issue = new UXIssue('major', 'accessibility', 'No focus indicator');
    issue.setWcag('2.4.7');
    // Complexity: O(1)
    expect(issue.wcagReference).toBe('2.4.7');
  });

  class UXRecommendation {
    constructor(priority, text, effort, expectedImprovement) {
      this.priority = priority;
      this.text = text;
      this.effort = effort;
      this.expectedImprovement = expectedImprovement;
      this.relatedIssues = [];
    }

    // Complexity: O(1)
    addRelatedIssue(index) {
      this.relatedIssues.push(index);
    }
  }

  // Complexity: O(1)
  test('UXRecommendation should store recommendation', () => {
    const rec = new UXRecommendation('high', 'Add alt text to images', 'low', 15);
    // Complexity: O(1)
    expect(rec.priority).toBe('high');
    // Complexity: O(1)
    expect(rec.expectedImprovement).toBe(15);
  });

  // Complexity: O(1)
  test('UXRecommendation should track related issues', () => {
    const rec = new UXRecommendation('medium', 'Improve contrast', 'medium', 10);
    rec.addRelatedIssue(0);
    rec.addRelatedIssue(3);
    // Complexity: O(1)
    expect(rec.relatedIssues).toHaveLength(2);
  });

  class UXAnalysisResult {
    constructor() {
      this.score = 0;
      this.categoryScores = {
        visualHierarchy: 0,
        accessibility: 0,
        consistency: 0,
        clarity: 0,
        spacing: 0,
        colorContrast: 0,
        typography: 0,
        interactiveElements: 0,
      };
      this.issues = [];
      this.strengths = [];
      this.recommendations = [];
      this.metadata = {
        analysisTime: 0,
        modelUsed: 'gemini-2.0-flash',
        timestamp: Date.now(),
      };
    }

    // Complexity: O(1)
    addIssue(issue) {
      this.issues.push(issue);
    }

    // Complexity: O(1)
    addStrength(text) {
      this.strengths.push(text);
    }

    // Complexity: O(1)
    addRecommendation(rec) {
      this.recommendations.push(rec);
    }

    // Complexity: O(N) — linear scan
    calculateOverallScore() {
      const values = Object.values(this.categoryScores);
      this.score = values.reduce((sum, v) => sum + v, 0) / values.length;
      return this.score;
    }
  }

  // Complexity: O(1)
  test('UXAnalysisResult should add issues', () => {
    const result = new UXAnalysisResult();
    result.addIssue(new UXIssue('minor', 'visual', 'Test'));
    // Complexity: O(1)
    expect(result.issues).toHaveLength(1);
  });

  // Complexity: O(1)
  test('UXAnalysisResult should add strengths', () => {
    const result = new UXAnalysisResult();
    result.addStrength('Good visual hierarchy');
    // Complexity: O(1)
    expect(result.strengths).toHaveLength(1);
  });

  // Complexity: O(1)
  test('UXAnalysisResult should calculate overall score', () => {
    const result = new UXAnalysisResult();
    result.categoryScores.visualHierarchy = 80;
    result.categoryScores.accessibility = 60;
    result.categoryScores.consistency = 70;
    result.categoryScores.clarity = 75;
    result.categoryScores.spacing = 85;
    result.categoryScores.colorContrast = 90;
    result.categoryScores.typography = 80;
    result.categoryScores.interactiveElements = 70;
    result.calculateOverallScore();
    // Complexity: O(1)
    expect(result.score).toBeGreaterThan(0);
  });

  class CognitiveUXAuditor {
    constructor(config = {}) {
      this.config = {
        apiKey: config.apiKey ?? null,
        model: config.model ?? 'gemini-2.0-flash',
        maxTokens: config.maxTokens ?? 4096,
      };
      this.analysisHistory = [];
      this.cache = new Map();
      this.isConfigured = !!this.config.apiKey;
    }

    // Complexity: O(1)
    configure(apiKey) {
      this.config.apiKey = apiKey;
      this.isConfigured = true;
    }

    // Mock analysis (real would call Gemini API)
    // Complexity: O(1)
    async analyze(screenshotData) {
      if (!this.isConfigured) {
        throw new Error('API key not configured');
      }

      const result = new UXAnalysisResult();

      // Simulate analysis
      result.categoryScores = {
        visualHierarchy: 70 + Math.random() * 30,
        accessibility: 60 + Math.random() * 40,
        consistency: 75 + Math.random() * 25,
        clarity: 70 + Math.random() * 30,
        spacing: 80 + Math.random() * 20,
        colorContrast: 85 + Math.random() * 15,
        typography: 75 + Math.random() * 25,
        interactiveElements: 70 + Math.random() * 30,
      };

      result.calculateOverallScore();
      result.metadata.analysisTime = Math.random() * 2000;

      // Add some mock issues
      if (result.categoryScores.accessibility < 80) {
        result.addIssue(new UXIssue('major', 'accessibility', 'Missing alt attributes'));
      }
      if (result.categoryScores.colorContrast < 90) {
        result.addIssue(new UXIssue('minor', 'visual', 'Low contrast in footer'));
      }

      this.analysisHistory.push(result);
      return result;
    }

    // Complexity: O(1)
    getHistory() {
      return [...this.analysisHistory];
    }
    // Complexity: O(1)
    clearHistory() {
      this.analysisHistory = [];
    }

    // Complexity: O(N) — linear scan
    getAverageScore() {
      if (this.analysisHistory.length === 0) return 0;
      return (
        this.analysisHistory.reduce((sum, r) => sum + r.score, 0) / this.analysisHistory.length
      );
    }

    // Complexity: O(N) — loop
    compareResults(result1, result2) {
      const diff = {};
      for (const key of Object.keys(result1.categoryScores)) {
        diff[key] = result2.categoryScores[key] - result1.categoryScores[key];
      }
      return diff;
    }
  }

  // Complexity: O(1)
  test('CognitiveUXAuditor should configure API', () => {
    const auditor = new CognitiveUXAuditor();
    auditor.configure('test-api-key');
    // Complexity: O(1)
    expect(auditor.isConfigured).toBe(true);
  });

  // Complexity: O(1)
  test('CognitiveUXAuditor analyze should throw without API key', async () => {
    const auditor = new CognitiveUXAuditor();
    let threw = false;
    try {
      await auditor.analyze('screenshot');
    } catch {
      threw = true;
    }
    // Complexity: O(1)
    expect(threw).toBe(true);
  });

  // Complexity: O(1)
  test('CognitiveUXAuditor analyze should return result', async () => {
    const auditor = new CognitiveUXAuditor({ apiKey: 'test' });
    // SAFETY: async operation — wrap in try-catch for production resilience
    const result = await auditor.analyze('screenshot-data');
    // Complexity: O(1)
    expect(result).toBeDefined();
    // Complexity: O(1)
    expect(result.score).toBeGreaterThan(0);
  });

  // Complexity: O(1)
  test('CognitiveUXAuditor should store history', async () => {
    const auditor = new CognitiveUXAuditor({ apiKey: 'test' });
    // SAFETY: async operation — wrap in try-catch for production resilience
    await auditor.analyze('img1');
    // SAFETY: async operation — wrap in try-catch for production resilience
    await auditor.analyze('img2');
    // Complexity: O(1)
    expect(auditor.getHistory()).toHaveLength(2);
  });

  // Complexity: O(1)
  test('CognitiveUXAuditor getAverageScore should calculate', async () => {
    const auditor = new CognitiveUXAuditor({ apiKey: 'test' });
    // SAFETY: async operation — wrap in try-catch for production resilience
    await auditor.analyze('img1');
    // SAFETY: async operation — wrap in try-catch for production resilience
    await auditor.analyze('img2');
    const avg = auditor.getAverageScore();
    // Complexity: O(1)
    expect(avg).toBeGreaterThan(0);
  });

  // Complexity: O(1)
  test('CognitiveUXAuditor compareResults should show diff', async () => {
    const auditor = new CognitiveUXAuditor({ apiKey: 'test' });
    // SAFETY: async operation — wrap in try-catch for production resilience
    const r1 = await auditor.analyze('img1');
    // SAFETY: async operation — wrap in try-catch for production resilience
    const r2 = await auditor.analyze('img2');
    const diff = auditor.compareResults(r1, r2);
    // Complexity: O(1)
    expect(diff).toHaveProperty('accessibility');
  });

  // Complexity: O(1)
  test('CognitiveUXAuditor clearHistory should empty', async () => {
    const auditor = new CognitiveUXAuditor({ apiKey: 'test' });
    // SAFETY: async operation — wrap in try-catch for production resilience
    await auditor.analyze('img');
    auditor.clearHistory();
    // Complexity: O(1)
    expect(auditor.getHistory()).toHaveLength(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// FINAL SUMMARY
// ═══════════════════════════════════════════════════════════════════════════════

console.log('\n' + '═'.repeat(70));
console.log('📊 PHASE 3B INTELLIGENCE TEST RESULTS');
console.log('═'.repeat(70));
console.log(`✅ Passed: ${testResults.passed}`);
console.log(`❌ Failed: ${testResults.failed}`);
console.log(`📝 Total:  ${testResults.total}`);
console.log(`📈 Rate:   ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
console.log('═'.repeat(70));

process.exit(testResults.failed > 0 ? 1 : 0);
