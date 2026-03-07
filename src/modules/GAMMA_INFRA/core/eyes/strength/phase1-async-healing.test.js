/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * PHASE 1 ASYNC/HEALING - UNIT TESTS
 * Steps 15, 16, 17, 18: Wait Logic, Timeout Manager, Error Detector, Recovery Engine
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// Test utilities
let passed = 0;
let failed = 0;
const results = [];

function describe(name, fn) {
  console.log(`\n📦 ${name}`);
  // Complexity: O(1)
  fn();
}

function test(name, fn) {
  try {
    // Complexity: O(1)
    fn();
    passed++;
    console.log(`  ✅ ${name}`);
    results.push({ name, status: 'passed' });
  } catch (error) {
    failed++;
    console.log(`  ❌ ${name}`);
    console.log(`     Error: ${error.message}`);
    results.push({ name, status: 'failed', error: error.message });
  }
}

function expect(actual) {
  return {
    // Complexity: O(1)
    toBe(expected) {
      if (actual !== expected) {
        throw new Error(`Expected ${expected} but got ${actual}`);
      }
    },
    // Complexity: O(1)
    toEqual(expected) {
      const actualStr = JSON.stringify(actual);
      const expectedStr = JSON.stringify(expected);
      if (actualStr !== expectedStr) {
        throw new Error(`Expected ${expectedStr} but got ${actualStr}`);
      }
    },
    // Complexity: O(1)
    toBeDefined() {
      if (actual === undefined) {
        throw new Error('Expected value to be defined');
      }
    },
    // Complexity: O(1)
    toBeUndefined() {
      if (actual !== undefined) {
        throw new Error(`Expected undefined but got ${actual}`);
      }
    },
    // Complexity: O(1)
    toBeTruthy() {
      if (!actual) {
        throw new Error(`Expected truthy but got ${actual}`);
      }
    },
    // Complexity: O(1)
    toBeFalsy() {
      if (actual) {
        throw new Error(`Expected falsy but got ${actual}`);
      }
    },
    // Complexity: O(1)
    toBeNull() {
      if (actual !== null) {
        throw new Error(`Expected null but got ${actual}`);
      }
    },
    // Complexity: O(1)
    toBeInstanceOf(expected) {
      if (!(actual instanceof expected)) {
        throw new Error(`Expected instance of ${expected.name}`);
      }
    },
    // Complexity: O(1)
    toContain(expected) {
      if (Array.isArray(actual)) {
        if (!actual.includes(expected)) {
          throw new Error(`Expected array to contain ${expected}`);
        }
      } else if (typeof actual === 'string') {
        if (!actual.includes(expected)) {
          throw new Error(`Expected string to contain ${expected}`);
        }
      }
    },
    // Complexity: O(1)
    toHaveLength(expected) {
      if (actual.length !== expected) {
        throw new Error(`Expected length ${expected} but got ${actual.length}`);
      }
    },
    // Complexity: O(1)
    toBeGreaterThan(expected) {
      if (actual <= expected) {
        throw new Error(`Expected ${actual} to be greater than ${expected}`);
      }
    },
    // Complexity: O(1)
    toBeGreaterThanOrEqual(expected) {
      if (actual < expected) {
        throw new Error(`Expected ${actual} to be >= ${expected}`);
      }
    },
    // Complexity: O(1)
    toBeLessThan(expected) {
      if (actual >= expected) {
        throw new Error(`Expected ${actual} to be less than ${expected}`);
      }
    },
    // Complexity: O(1)
    toBeLessThanOrEqual(expected) {
      if (actual > expected) {
        throw new Error(`Expected ${actual} to be <= ${expected}`);
      }
    },
    // Complexity: O(1)
    toThrow() {
      let threw = false;
      try {
        // Complexity: O(1)
        actual();
      } catch (e) {
        threw = true;
      }
      if (!threw) {
        throw new Error('Expected function to throw');
      }
    },
    // Complexity: O(1)
    toBeTypeOf(expected) {
      if (typeof actual !== expected) {
        throw new Error(`Expected type ${expected} but got ${typeof actual}`);
      }
    },
    // Complexity: O(1)
    toHaveProperty(prop) {
      if (!(prop in actual)) {
        throw new Error(`Expected object to have property ${prop}`);
      }
    },
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// IMPORT MODULES
// ═══════════════════════════════════════════════════════════════════════════════

console.log('═══════════════════════════════════════════════════════════════════════════════');
console.log('🧪 PHASE 1 ASYNC/HEALING - UNIT TESTS');
console.log('═══════════════════════════════════════════════════════════════════════════════');

// Step 15 - Wait Logic
const {
  Condition,
  WaitEngine,
  FluentWait,
  Conditions,
  visible,
  exists,
  enabled,
  clickable,
  textContains,
  urlContains,
  createWait,
  getWaitEngine,
} = require('../../async/wait-logic');

// Step 16 - Timeout Manager
const {
  TimeoutHandle,
  TimeoutManager,
  RetryStrategy,
  FixedRetryStrategy,
  ExponentialRetryStrategy,
  LinearRetryStrategy,
  JitterRetryStrategy,
  SmartRetryStrategy,
  TimeoutProfiles,
  withTimeout,
  withRetry,
  getTimeoutManager,
  createTimeoutManager,
} = require('../../async/timeout-manager');

// Step 17 - Error Detector
const {
  ErrorPattern,
  ErrorDetector,
  ErrorAggregator,
  ErrorType,
  ErrorSeverity,
  BuiltInPatterns,
  getErrorDetector,
  createErrorDetector,
} = require('../../healing/error-detector');

// Step 18 - Recovery Engine
const {
  RecoveryStrategy: RecoveryStrategyBase,
  RecoveryEngine,
  HealingContext,
  RetryRecoveryStrategy,
  RefreshRecoveryStrategy,
  WaitAndRetryStrategy,
  AlternativeSelectorStrategy,
  ScrollIntoViewStrategy,
  DismissOverlayStrategy,
  JavaScriptClickStrategy,
  NetworkRetryStrategy,
  getRecoveryEngine,
  createRecoveryEngine,
  createHealingContext,
} = require('../../healing/recovery-engine');

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 15: WAIT LOGIC TESTS
// ═══════════════════════════════════════════════════════════════════════════════

    // Complexity: O(1)
describe('Step 15: Wait Logic', () => {
  // Condition tests
  // Complexity: O(1)
  describe('Condition', () => {
    // Complexity: O(1)
    test('Condition should be a class', () => {
      // Complexity: O(1)
      expect(typeof Condition).toBe('function');
    });

    // Complexity: O(1)
    test('Condition should accept name and check function', () => {
      const cond = new Condition('test', () => true);
      // Complexity: O(1)
      expect(cond.name).toBe('test');
    });

    // Complexity: O(1)
    test('Condition should have evaluate method', () => {
      const cond = new Condition('test', () => true);
      // Complexity: O(1)
      expect(typeof cond.evaluate).toBe('function');
    });
  });

  // Conditions object tests
  // Complexity: O(1)
  describe('Conditions', () => {
    // Complexity: O(1)
    test('Conditions should be defined', () => {
      // Complexity: O(1)
      expect(Conditions).toBeDefined();
    });

    // Complexity: O(1)
    test('Conditions.visible should return Condition', () => {
      const cond = Conditions.visible({});
      // Complexity: O(1)
      expect(cond instanceof Condition).toBeTruthy();
    });

    // Complexity: O(1)
    test('Conditions.exists should return Condition', () => {
      const cond = Conditions.exists({});
      // Complexity: O(1)
      expect(cond instanceof Condition).toBeTruthy();
    });

    // Complexity: O(1)
    test('Conditions.enabled should return Condition', () => {
      const cond = Conditions.enabled({});
      // Complexity: O(1)
      expect(cond instanceof Condition).toBeTruthy();
    });

    // Complexity: O(1)
    test('Conditions.clickable should return Condition', () => {
      const cond = Conditions.clickable({});
      // Complexity: O(1)
      expect(cond instanceof Condition).toBeTruthy();
    });

    // Complexity: O(1)
    test('Conditions.textContains should return Condition', () => {
      const cond = Conditions.textContains({}, 'test');
      // Complexity: O(1)
      expect(cond instanceof Condition).toBeTruthy();
    });

    // Complexity: O(1)
    test('Conditions.urlContains should return Condition', () => {
      const cond = Conditions.urlContains('test');
      // Complexity: O(1)
      expect(cond instanceof Condition).toBeTruthy();
    });

    // Complexity: O(1)
    test('Conditions.and should combine conditions', () => {
      const c1 = new Condition('c1', () => true);
      const c2 = new Condition('c2', () => true);
      const combined = Conditions.and(c1, c2);
      // Complexity: O(1)
      expect(combined.name).toBe('and');
    });

    // Complexity: O(1)
    test('Conditions.or should combine conditions', () => {
      const c1 = new Condition('c1', () => true);
      const c2 = new Condition('c2', () => false);
      const combined = Conditions.or(c1, c2);
      // Complexity: O(1)
      expect(combined.name).toBe('or');
    });

    // Complexity: O(1)
    test('Conditions.not should negate condition', () => {
      const c = new Condition('c', () => false);
      const negated = Conditions.not(c);
      // Complexity: O(1)
      expect(negated.name).toBe('not');
    });

    // Complexity: O(1)
    test('Conditions.custom should create custom condition', () => {
      const cond = Conditions.custom('myCondition', () => true);
      // Complexity: O(1)
      expect(cond.name).toBe('myCondition');
    });
  });

  // Shortcut exports tests
  // Complexity: O(1)
  describe('Shortcut Exports', () => {
    // Complexity: O(1)
    test('visible should be a function', () => {
      // Complexity: O(1)
      expect(typeof visible).toBe('function');
    });

    // Complexity: O(1)
    test('exists should be a function', () => {
      // Complexity: O(1)
      expect(typeof exists).toBe('function');
    });

    // Complexity: O(1)
    test('enabled should be a function', () => {
      // Complexity: O(1)
      expect(typeof enabled).toBe('function');
    });

    // Complexity: O(1)
    test('clickable should be a function', () => {
      // Complexity: O(1)
      expect(typeof clickable).toBe('function');
    });

    // Complexity: O(1)
    test('textContains should be a function', () => {
      // Complexity: O(1)
      expect(typeof textContains).toBe('function');
    });

    // Complexity: O(1)
    test('urlContains should be a function', () => {
      // Complexity: O(1)
      expect(typeof urlContains).toBe('function');
    });
  });

  // WaitEngine tests
  // Complexity: O(1)
  describe('WaitEngine', () => {
    // Complexity: O(1)
    test('WaitEngine should be a class', () => {
      // Complexity: O(1)
      expect(typeof WaitEngine).toBe('function');
    });

    // Complexity: O(1)
    test('WaitEngine should have waitFor method', () => {
      const engine = new WaitEngine();
      // Complexity: O(1)
      expect(typeof engine.waitFor).toBe('function');
    });

    // Complexity: O(1)
    test('WaitEngine should have waitForAll method', () => {
      const engine = new WaitEngine();
      // Complexity: O(1)
      expect(typeof engine.waitForAll).toBe('function');
    });

    // Complexity: O(1)
    test('WaitEngine should have waitForAny method', () => {
      const engine = new WaitEngine();
      // Complexity: O(1)
      expect(typeof engine.waitForAny).toBe('function');
    });

    // Complexity: O(1)
    test('WaitEngine should have waitForElement method', () => {
      const engine = new WaitEngine();
      // Complexity: O(1)
      expect(typeof engine.waitForElement).toBe('function');
    });

    // Complexity: O(1)
    test('WaitEngine should have waitForVisible method', () => {
      const engine = new WaitEngine();
      // Complexity: O(1)
      expect(typeof engine.waitForVisible).toBe('function');
    });

    // Complexity: O(1)
    test('WaitEngine should have waitForClickable method', () => {
      const engine = new WaitEngine();
      // Complexity: O(1)
      expect(typeof engine.waitForClickable).toBe('function');
    });

    // Complexity: O(1)
    test('WaitEngine should have waitForText method', () => {
      const engine = new WaitEngine();
      // Complexity: O(1)
      expect(typeof engine.waitForText).toBe('function');
    });

    // Complexity: O(1)
    test('WaitEngine should accept options', () => {
      const engine = new WaitEngine({ defaultTimeout: 5000 });
      // Complexity: O(1)
      expect(engine.options.defaultTimeout).toBe(5000);
    });

    // Complexity: O(1)
    test('WaitEngine should have stats', () => {
      const engine = new WaitEngine();
      // Complexity: O(1)
      expect(engine.stats).toHaveProperty('waits');
      // Complexity: O(1)
      expect(engine.stats).toHaveProperty('successes');
    });
  });

  // FluentWait tests
  // Complexity: O(1)
  describe('FluentWait', () => {
    // Complexity: O(1)
    test('FluentWait should be a class', () => {
      // Complexity: O(1)
      expect(typeof FluentWait).toBe('function');
    });

    // Complexity: O(1)
    test('FluentWait should have withTimeout method', () => {
      const engine = new WaitEngine();
      const fw = new FluentWait(engine);
      // Complexity: O(1)
      expect(typeof fw.withTimeout).toBe('function');
    });

    // Complexity: O(1)
    test('FluentWait should have pollingEvery method', () => {
      const engine = new WaitEngine();
      const fw = new FluentWait(engine);
      // Complexity: O(1)
      expect(typeof fw.pollingEvery).toBe('function');
    });

    // Complexity: O(1)
    test('FluentWait should have until method', () => {
      const engine = new WaitEngine();
      const fw = new FluentWait(engine);
      // Complexity: O(1)
      expect(typeof fw.until).toBe('function');
    });

    // Complexity: O(1)
    test('FluentWait should support chaining', () => {
      const engine = new WaitEngine();
      const fw = new FluentWait(engine);
      const chained = fw.withTimeout(5000).pollingEvery(100);
      // Complexity: O(1)
      expect(chained).toBeInstanceOf(FluentWait);
    });
  });

  // Factory functions tests
  // Complexity: O(1)
  describe('Factory Functions', () => {
    // Complexity: O(1)
    test('createWait should return WaitEngine', () => {
      const engine = createWait();
      // Complexity: O(1)
      expect(engine instanceof WaitEngine).toBeTruthy();
    });

    // Complexity: O(1)
    test('getWaitEngine should return singleton', () => {
      const e1 = getWaitEngine();
      const e2 = getWaitEngine();
      // Complexity: O(1)
      expect(e1).toBe(e2);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 16: TIMEOUT MANAGER TESTS
// ═══════════════════════════════════════════════════════════════════════════════

    // Complexity: O(1)
describe('Step 16: Timeout Manager', () => {
  // TimeoutProfiles tests
  // Complexity: O(1)
  describe('TimeoutProfiles', () => {
    // Complexity: O(1)
    test('TimeoutProfiles should be defined', () => {
      // Complexity: O(1)
      expect(TimeoutProfiles).toBeDefined();
    });

    // Complexity: O(1)
    test('TimeoutProfiles should have INSTANT', () => {
      // Complexity: O(1)
      expect(TimeoutProfiles.INSTANT).toBeDefined();
      // Complexity: O(1)
      expect(TimeoutProfiles.INSTANT.timeout).toBe(1000);
    });

    // Complexity: O(1)
    test('TimeoutProfiles should have SHORT', () => {
      // Complexity: O(1)
      expect(TimeoutProfiles.SHORT).toBeDefined();
    });

    // Complexity: O(1)
    test('TimeoutProfiles should have MEDIUM', () => {
      // Complexity: O(1)
      expect(TimeoutProfiles.MEDIUM).toBeDefined();
    });

    // Complexity: O(1)
    test('TimeoutProfiles should have LONG', () => {
      // Complexity: O(1)
      expect(TimeoutProfiles.LONG).toBeDefined();
    });

    // Complexity: O(1)
    test('TimeoutProfiles should have VERY_LONG', () => {
      // Complexity: O(1)
      expect(TimeoutProfiles.VERY_LONG).toBeDefined();
    });

    // Complexity: O(1)
    test('TimeoutProfiles should have INFINITE', () => {
      // Complexity: O(1)
      expect(TimeoutProfiles.INFINITE).toBeDefined();
      // Complexity: O(1)
      expect(TimeoutProfiles.INFINITE.timeout).toBe(0);
    });
  });

  // RetryStrategy tests
  // Complexity: O(1)
  describe('RetryStrategy', () => {
    // Complexity: O(1)
    test('RetryStrategy should be a class', () => {
      // Complexity: O(1)
      expect(typeof RetryStrategy).toBe('function');
    });

    // Complexity: O(1)
    test('RetryStrategy should have getDelay method', () => {
      const strategy = new RetryStrategy('test');
      // Complexity: O(1)
      expect(typeof strategy.getDelay).toBe('function');
    });

    // Complexity: O(1)
    test('RetryStrategy should have shouldRetry method', () => {
      const strategy = new RetryStrategy('test');
      // Complexity: O(1)
      expect(typeof strategy.shouldRetry).toBe('function');
    });
  });

  // FixedRetryStrategy tests
  // Complexity: O(1)
  describe('FixedRetryStrategy', () => {
    // Complexity: O(1)
    test('FixedRetryStrategy should extend RetryStrategy', () => {
      const strategy = new FixedRetryStrategy();
      // Complexity: O(1)
      expect(strategy instanceof RetryStrategy).toBeTruthy();
    });

    // Complexity: O(1)
    test('FixedRetryStrategy getDelay should return fixed delay', () => {
      const strategy = new FixedRetryStrategy({ delay: 2000 });
      // Complexity: O(1)
      expect(strategy.getDelay(1)).toBe(2000);
      // Complexity: O(1)
      expect(strategy.getDelay(2)).toBe(2000);
    });
  });

  // ExponentialRetryStrategy tests
  // Complexity: O(1)
  describe('ExponentialRetryStrategy', () => {
    // Complexity: O(1)
    test('ExponentialRetryStrategy should extend RetryStrategy', () => {
      const strategy = new ExponentialRetryStrategy();
      // Complexity: O(1)
      expect(strategy instanceof RetryStrategy).toBeTruthy();
    });

    // Complexity: O(1)
    test('ExponentialRetryStrategy getDelay should increase exponentially', () => {
      const strategy = new ExponentialRetryStrategy({ baseDelay: 1000, multiplier: 2 });
      // Complexity: O(1)
      expect(strategy.getDelay(1)).toBe(1000);
      // Complexity: O(1)
      expect(strategy.getDelay(2)).toBe(2000);
      // Complexity: O(1)
      expect(strategy.getDelay(3)).toBe(4000);
    });
  });

  // LinearRetryStrategy tests
  // Complexity: O(1)
  describe('LinearRetryStrategy', () => {
    // Complexity: O(1)
    test('LinearRetryStrategy should extend RetryStrategy', () => {
      const strategy = new LinearRetryStrategy();
      // Complexity: O(1)
      expect(strategy instanceof RetryStrategy).toBeTruthy();
    });

    // Complexity: O(1)
    test('LinearRetryStrategy getDelay should increase linearly', () => {
      const strategy = new LinearRetryStrategy({ baseDelay: 1000, increment: 500 });
      // Complexity: O(1)
      expect(strategy.getDelay(1)).toBe(1000);
      // Complexity: O(1)
      expect(strategy.getDelay(2)).toBe(1500);
      // Complexity: O(1)
      expect(strategy.getDelay(3)).toBe(2000);
    });
  });

  // JitterRetryStrategy tests
  // Complexity: O(1)
  describe('JitterRetryStrategy', () => {
    // Complexity: O(1)
    test('JitterRetryStrategy should extend RetryStrategy', () => {
      const strategy = new JitterRetryStrategy();
      // Complexity: O(1)
      expect(strategy instanceof RetryStrategy).toBeTruthy();
    });

    // Complexity: O(1)
    test('JitterRetryStrategy getDelay should add randomness', () => {
      const strategy = new JitterRetryStrategy({ baseDelay: 1000 });
      const delay = strategy.getDelay(1);
      // Complexity: O(1)
      expect(delay).toBeGreaterThanOrEqual(1000);
    });
  });

  // SmartRetryStrategy tests
  // Complexity: O(1)
  describe('SmartRetryStrategy', () => {
    // Complexity: O(1)
    test('SmartRetryStrategy should extend RetryStrategy', () => {
      const strategy = new SmartRetryStrategy();
      // Complexity: O(1)
      expect(strategy instanceof RetryStrategy).toBeTruthy();
    });

    // Complexity: O(1)
    test('SmartRetryStrategy should have getStrategyForError', () => {
      const strategy = new SmartRetryStrategy();
      // Complexity: O(1)
      expect(typeof strategy.getStrategyForError).toBe('function');
    });
  });

  // TimeoutHandle tests
  // Complexity: O(1)
  describe('TimeoutHandle', () => {
    // Complexity: O(1)
    test('TimeoutHandle should be a class', () => {
      // Complexity: O(1)
      expect(typeof TimeoutHandle).toBe('function');
    });

    // Complexity: O(1)
    test('TimeoutHandle should have start method', () => {
      const handle = new TimeoutHandle('test', 1000, null);
      // Complexity: O(1)
      expect(typeof handle.start).toBe('function');
    });

    // Complexity: O(1)
    test('TimeoutHandle should have cancel method', () => {
      const handle = new TimeoutHandle('test', 1000, null);
      // Complexity: O(1)
      expect(typeof handle.cancel).toBe('function');
    });

    // Complexity: O(1)
    test('TimeoutHandle should have complete method', () => {
      const handle = new TimeoutHandle('test', 1000, null);
      // Complexity: O(1)
      expect(typeof handle.complete).toBe('function');
    });

    // Complexity: O(1)
    test('TimeoutHandle should have getRemainingTime method', () => {
      const handle = new TimeoutHandle('test', 1000, null);
      // Complexity: O(1)
      expect(typeof handle.getRemainingTime).toBe('function');
    });

    // Complexity: O(1)
    test('TimeoutHandle should have getElapsedTime method', () => {
      const handle = new TimeoutHandle('test', 1000, null);
      // Complexity: O(1)
      expect(typeof handle.getElapsedTime).toBe('function');
    });
  });

  // TimeoutManager tests
  // Complexity: O(1)
  describe('TimeoutManager', () => {
    // Complexity: O(1)
    test('TimeoutManager should be a class', () => {
      // Complexity: O(1)
      expect(typeof TimeoutManager).toBe('function');
    });

    // Complexity: O(1)
    test('TimeoutManager should have create method', () => {
      const manager = new TimeoutManager();
      // Complexity: O(1)
      expect(typeof manager.create).toBe('function');
    });

    // Complexity: O(1)
    test('TimeoutManager should have cancel method', () => {
      const manager = new TimeoutManager();
      // Complexity: O(1)
      expect(typeof manager.cancel).toBe('function');
    });

    // Complexity: O(1)
    test('TimeoutManager should have stats', () => {
      const manager = new TimeoutManager();
      // Complexity: O(1)
      expect(manager.stats).toHaveProperty('created');
      // Complexity: O(1)
      expect(manager.stats).toHaveProperty('completed');
    });

    // Complexity: O(1)
    test('TimeoutManager create should return TimeoutHandle', () => {
      const manager = new TimeoutManager();
      const handle = manager.create(1000);
      // Complexity: O(1)
      expect(handle instanceof TimeoutHandle).toBeTruthy();
      handle.cancel(); // Clean up
    });
  });

  // Decorators tests
  // Complexity: O(1)
  describe('Decorators', () => {
    // Complexity: O(1)
    test('withTimeout should be a function', () => {
      // Complexity: O(1)
      expect(typeof withTimeout).toBe('function');
    });

    // Complexity: O(1)
    test('withRetry should be a function', () => {
      // Complexity: O(1)
      expect(typeof withRetry).toBe('function');
    });
  });

  // Factory functions tests
  // Complexity: O(1)
  describe('Factory Functions', () => {
    // Complexity: O(1)
    test('getTimeoutManager should return singleton', () => {
      const m1 = getTimeoutManager();
      const m2 = getTimeoutManager();
      // Complexity: O(1)
      expect(m1).toBe(m2);
    });

    // Complexity: O(1)
    test('createTimeoutManager should return new instance', () => {
      const manager = createTimeoutManager({});
      // Complexity: O(1)
      expect(manager instanceof TimeoutManager).toBeTruthy();
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 17: ERROR DETECTOR TESTS
// ═══════════════════════════════════════════════════════════════════════════════

    // Complexity: O(1)
describe('Step 17: Error Detector', () => {
  // ErrorType tests
  // Complexity: O(1)
  describe('ErrorType', () => {
    // Complexity: O(1)
    test('ErrorType should be defined', () => {
      // Complexity: O(1)
      expect(ErrorType).toBeDefined();
    });

    // Complexity: O(1)
    test('ErrorType should have ELEMENT_NOT_FOUND', () => {
      // Complexity: O(1)
      expect(ErrorType.ELEMENT_NOT_FOUND).toBe('ELEMENT_NOT_FOUND');
    });

    // Complexity: O(1)
    test('ErrorType should have TIMEOUT', () => {
      // Complexity: O(1)
      expect(ErrorType.TIMEOUT).toBe('TIMEOUT');
    });

    // Complexity: O(1)
    test('ErrorType should have NETWORK_ERROR', () => {
      // Complexity: O(1)
      expect(ErrorType.NETWORK_ERROR).toBe('NETWORK_ERROR');
    });

    // Complexity: O(1)
    test('ErrorType should have UNKNOWN', () => {
      // Complexity: O(1)
      expect(ErrorType.UNKNOWN).toBe('UNKNOWN');
    });
  });

  // ErrorSeverity tests
  // Complexity: O(1)
  describe('ErrorSeverity', () => {
    // Complexity: O(1)
    test('ErrorSeverity should be defined', () => {
      // Complexity: O(1)
      expect(ErrorSeverity).toBeDefined();
    });

    // Complexity: O(1)
    test('ErrorSeverity should have CRITICAL', () => {
      // Complexity: O(1)
      expect(ErrorSeverity.CRITICAL).toBe('critical');
    });

    // Complexity: O(1)
    test('ErrorSeverity should have HIGH', () => {
      // Complexity: O(1)
      expect(ErrorSeverity.HIGH).toBe('high');
    });

    // Complexity: O(1)
    test('ErrorSeverity should have MEDIUM', () => {
      // Complexity: O(1)
      expect(ErrorSeverity.MEDIUM).toBe('medium');
    });

    // Complexity: O(1)
    test('ErrorSeverity should have LOW', () => {
      // Complexity: O(1)
      expect(ErrorSeverity.LOW).toBe('low');
    });
  });

  // ErrorPattern tests
  // Complexity: O(1)
  describe('ErrorPattern', () => {
    // Complexity: O(1)
    test('ErrorPattern should be a class', () => {
      // Complexity: O(1)
      expect(typeof ErrorPattern).toBe('function');
    });

    // Complexity: O(1)
    test('ErrorPattern should have matches method', () => {
      const pattern = new ErrorPattern({ name: 'test', patterns: [] });
      // Complexity: O(1)
      expect(typeof pattern.matches).toBe('function');
    });

    // Complexity: O(1)
    test('ErrorPattern should match string patterns', () => {
      const pattern = new ErrorPattern({
        name: 'test',
        patterns: ['element not found'],
      });
      // Complexity: O(1)
      expect(pattern.matches({ message: 'element not found on page' })).toBeTruthy();
    });

    // Complexity: O(1)
    test('ErrorPattern should match regex patterns', () => {
      const pattern = new ErrorPattern({
        name: 'test',
        patterns: [/timeout/i],
      });
      // Complexity: O(1)
      expect(pattern.matches({ message: 'Request Timeout Error' })).toBeTruthy();
    });
  });

  // BuiltInPatterns tests
  // Complexity: O(1)
  describe('BuiltInPatterns', () => {
    // Complexity: O(1)
    test('BuiltInPatterns should be an array', () => {
      // Complexity: O(1)
      expect(Array.isArray(BuiltInPatterns)).toBeTruthy();
    });

    // Complexity: O(1)
    test('BuiltInPatterns should have patterns', () => {
      // Complexity: O(1)
      expect(BuiltInPatterns.length).toBeGreaterThan(0);
    });

    // Complexity: O(1)
    test('BuiltInPatterns should contain ErrorPattern instances', () => {
      // Complexity: O(1)
      expect(BuiltInPatterns[0] instanceof ErrorPattern).toBeTruthy();
    });
  });

  // ErrorDetector tests
  // Complexity: O(1)
  describe('ErrorDetector', () => {
    // Complexity: O(1)
    test('ErrorDetector should be a class', () => {
      // Complexity: O(1)
      expect(typeof ErrorDetector).toBe('function');
    });

    // Complexity: O(1)
    test('ErrorDetector should have detect method', () => {
      const detector = new ErrorDetector();
      // Complexity: O(1)
      expect(typeof detector.detect).toBe('function');
    });

    // Complexity: O(1)
    test('ErrorDetector should have registerPattern method', () => {
      const detector = new ErrorDetector();
      // Complexity: O(1)
      expect(typeof detector.registerPattern).toBe('function');
    });

    // Complexity: O(1)
    test('ErrorDetector detect should return classified error', () => {
      const detector = new ErrorDetector();
      const result = detector.detect(new Error('Element not found'));
      // Complexity: O(1)
      expect(result).toHaveProperty('type');
      // Complexity: O(1)
      expect(result).toHaveProperty('severity');
      // Complexity: O(1)
      expect(result).toHaveProperty('recoverable');
    });

    // Complexity: O(1)
    test('ErrorDetector should classify element not found', () => {
      const detector = new ErrorDetector();
      const result = detector.detect(new Error('Unable to locate element'));
      // Complexity: O(1)
      expect(result.type).toBe(ErrorType.ELEMENT_NOT_FOUND);
    });

    // Complexity: O(1)
    test('ErrorDetector should track analytics', () => {
      const detector = new ErrorDetector();
      detector.detect(new Error('test error'));
      // Complexity: O(1)
      expect(detector.analytics.total).toBeGreaterThan(0);
    });
  });

  // ErrorAggregator tests
  // Complexity: O(1)
  describe('ErrorAggregator', () => {
    // Complexity: O(1)
    test('ErrorAggregator should be a class', () => {
      // Complexity: O(1)
      expect(typeof ErrorAggregator).toBe('function');
    });

    // Complexity: O(1)
    test('ErrorAggregator should have getSummary method', () => {
      const aggregator = new ErrorAggregator();
      // Complexity: O(1)
      expect(typeof aggregator.getSummary).toBe('function');
    });

    // Complexity: O(1)
    test('ErrorAggregator should have clear method', () => {
      const aggregator = new ErrorAggregator();
      // Complexity: O(1)
      expect(typeof aggregator.clear).toBe('function');
    });
  });

  // Factory functions tests
  // Complexity: O(1)
  describe('Factory Functions', () => {
    // Complexity: O(1)
    test('getErrorDetector should return singleton', () => {
      const d1 = getErrorDetector();
      const d2 = getErrorDetector();
      // Complexity: O(1)
      expect(d1).toBe(d2);
    });

    // Complexity: O(1)
    test('createErrorDetector should return new instance', () => {
      const detector = createErrorDetector({});
      // Complexity: O(1)
      expect(detector instanceof ErrorDetector).toBeTruthy();
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 18: RECOVERY ENGINE TESTS
// ═══════════════════════════════════════════════════════════════════════════════

    // Complexity: O(1)
describe('Step 18: Recovery Engine', () => {
  // RecoveryStrategy tests
  // Complexity: O(1)
  describe('RecoveryStrategy', () => {
    // Complexity: O(1)
    test('RecoveryStrategy should be a class', () => {
      // Complexity: O(1)
      expect(typeof RecoveryStrategyBase).toBe('function');
    });

    // Complexity: O(1)
    test('RecoveryStrategy should have appliesTo method', () => {
      const strategy = new RecoveryStrategyBase({ name: 'test' });
      // Complexity: O(1)
      expect(typeof strategy.appliesTo).toBe('function');
    });

    // Complexity: O(1)
    test('RecoveryStrategy should have execute method', () => {
      const strategy = new RecoveryStrategyBase({ name: 'test' });
      // Complexity: O(1)
      expect(typeof strategy.execute).toBe('function');
    });
  });

  // Built-in strategies tests
  // Complexity: O(1)
  describe('Built-in Recovery Strategies', () => {
    // Complexity: O(1)
    test('RetryRecoveryStrategy should be a class', () => {
      // Complexity: O(1)
      expect(typeof RetryRecoveryStrategy).toBe('function');
    });

    // Complexity: O(1)
    test('RefreshRecoveryStrategy should be a class', () => {
      // Complexity: O(1)
      expect(typeof RefreshRecoveryStrategy).toBe('function');
    });

    // Complexity: O(1)
    test('WaitAndRetryStrategy should be a class', () => {
      // Complexity: O(1)
      expect(typeof WaitAndRetryStrategy).toBe('function');
    });

    // Complexity: O(1)
    test('AlternativeSelectorStrategy should be a class', () => {
      // Complexity: O(1)
      expect(typeof AlternativeSelectorStrategy).toBe('function');
    });

    // Complexity: O(1)
    test('ScrollIntoViewStrategy should be a class', () => {
      // Complexity: O(1)
      expect(typeof ScrollIntoViewStrategy).toBe('function');
    });

    // Complexity: O(1)
    test('DismissOverlayStrategy should be a class', () => {
      // Complexity: O(1)
      expect(typeof DismissOverlayStrategy).toBe('function');
    });

    // Complexity: O(1)
    test('JavaScriptClickStrategy should be a class', () => {
      // Complexity: O(1)
      expect(typeof JavaScriptClickStrategy).toBe('function');
    });

    // Complexity: O(1)
    test('NetworkRetryStrategy should be a class', () => {
      // Complexity: O(1)
      expect(typeof NetworkRetryStrategy).toBe('function');
    });

    // Complexity: O(1)
    test('RetryRecoveryStrategy should extend base', () => {
      const strategy = new RetryRecoveryStrategy();
      // Complexity: O(1)
      expect(strategy.name).toBe('retry');
    });

    // Complexity: O(1)
    test('RefreshRecoveryStrategy should extend base', () => {
      const strategy = new RefreshRecoveryStrategy();
      // Complexity: O(1)
      expect(strategy.name).toBe('refresh');
    });

    // Complexity: O(1)
    test('WaitAndRetryStrategy should extend base', () => {
      const strategy = new WaitAndRetryStrategy();
      // Complexity: O(1)
      expect(strategy.name).toBe('waitAndRetry');
    });
  });

  // RecoveryEngine tests
  // Complexity: O(1)
  describe('RecoveryEngine', () => {
    // Complexity: O(1)
    test('RecoveryEngine should be a class', () => {
      // Complexity: O(1)
      expect(typeof RecoveryEngine).toBe('function');
    });

    // Complexity: O(1)
    test('RecoveryEngine should have registerStrategy method', () => {
      const engine = new RecoveryEngine();
      // Complexity: O(1)
      expect(typeof engine.registerStrategy).toBe('function');
    });

    // Complexity: O(1)
    test('RecoveryEngine should have recover method', () => {
      const engine = new RecoveryEngine();
      // Complexity: O(1)
      expect(typeof engine.recover).toBe('function');
    });

    // Complexity: O(1)
    test('RecoveryEngine should have built-in strategies', () => {
      const engine = new RecoveryEngine();
      // Complexity: O(1)
      expect(engine.strategies.length).toBeGreaterThan(0);
    });

    // Complexity: O(1)
    test('RecoveryEngine should accept options', () => {
      const engine = new RecoveryEngine({ maxRecoveryAttempts: 10 });
      // Complexity: O(1)
      expect(engine.options.maxRecoveryAttempts).toBe(10);
    });

    // Complexity: O(1)
    test('RecoveryEngine registerStrategy should add strategy', () => {
      const engine = new RecoveryEngine();
      const initialCount = engine.strategies.length;
      engine.registerStrategy(new RecoveryStrategyBase({ name: 'custom', priority: 100 }));
      // Complexity: O(1)
      expect(engine.strategies.length).toBe(initialCount + 1);
    });
  });

  // HealingContext tests
  // Complexity: O(1)
  describe('HealingContext', () => {
    // Complexity: O(1)
    test('HealingContext should be a class', () => {
      // Complexity: O(1)
      expect(typeof HealingContext).toBe('function');
    });

    // Complexity: O(1)
    test('HealingContext should have execute method', () => {
      const engine = new RecoveryEngine();
      const ctx = new HealingContext(engine, {});
      // Complexity: O(1)
      expect(typeof ctx.execute).toBe('function');
    });
  });

  // Factory functions tests
  // Complexity: O(1)
  describe('Factory Functions', () => {
    // Complexity: O(1)
    test('getRecoveryEngine should return singleton', () => {
      const e1 = getRecoveryEngine();
      const e2 = getRecoveryEngine();
      // Complexity: O(1)
      expect(e1).toBe(e2);
    });

    // Complexity: O(1)
    test('createRecoveryEngine should return new instance', () => {
      const engine = createRecoveryEngine({});
      // Complexity: O(1)
      expect(engine instanceof RecoveryEngine).toBeTruthy();
    });

    // Complexity: O(1)
    test('createHealingContext should return HealingContext', () => {
      const engine = new RecoveryEngine();
      const ctx = createHealingContext(engine, {});
      // Complexity: O(1)
      expect(ctx instanceof HealingContext).toBeTruthy();
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// SUMMARY
// ═══════════════════════════════════════════════════════════════════════════════

console.log('\n═══════════════════════════════════════════════════════════════════════════════');
console.log('📊 TEST SUMMARY');
console.log('═══════════════════════════════════════════════════════════════════════════════');
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
console.log('═══════════════════════════════════════════════════════════════════════════════');

if (failed > 0) {
  console.log('\n❌ FAILED TESTS:');
  results
    .filter((r) => r.status === 'failed')
    .forEach((r) => {
      console.log(`  - ${r.name}: ${r.error}`);
    });
}

process.exit(failed > 0 ? 1 : 0);
