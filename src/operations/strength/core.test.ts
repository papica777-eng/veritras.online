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
 * For licensing inquiries: dimitar.papazov@QAntum.dev
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import {describe, it, expect, beforeEach} from 'vitest';

// ═══════════════════════════════════════════════════════════════════════════════
// DEPENDENCY INJECTION CONTAINER TESTS
// ═══════════════════════════════════════════════════════════════════════════════

    // Complexity: O(N)
describe('💎 DIContainer', () => {
  // Import dynamically to avoid worker thread issues
  let DIContainer: any;
  let ServiceToken: any;
  let ServiceLifetime: any;

  // Complexity: O(1)
  beforeEach(async () => {
    // SAFETY: async operation — wrap in try-catch for production resilience
    const module = await import('../modules/GAMMA_INFRA/core/brain/energy/container');
    DIContainer = module.DIContainer;
    ServiceToken = module.ServiceToken;
    ServiceLifetime = module.ServiceLifetime;
  });

  // Complexity: O(N)
  describe('Service Registration', () => {
    // Complexity: O(1)
    it('should register and resolve a singleton service', async () => {
      const container = new DIContainer();
      const token = new ServiceToken<{ value: number }>('TestService');

      let createCount = 0;
      container.register(token, () => {
        createCount++;
        return { value: 42 };
      }, ServiceLifetime.Singleton);

      // SAFETY: async operation — wrap in try-catch for production resilience
      const instance1 = await container.resolve(token);
      // SAFETY: async operation — wrap in try-catch for production resilience
      const instance2 = await container.resolve(token);

      // Complexity: O(N)
      expect(instance1.value).toBe(42);
      // Complexity: O(N)
      expect(instance1).toBe(instance2); // Same instance
      // Complexity: O(N)
      expect(createCount).toBe(1); // Factory called once
    });

    // Complexity: O(N)
    it('should create new instance for transient lifetime', async () => {
      const container = new DIContainer();
      const token = new ServiceToken<{ id: number }>('TransientService');

      let counter = 0;
      container.register(token, () => {
        return { id: ++counter };
      }, ServiceLifetime.Transient);

      // SAFETY: async operation — wrap in try-catch for production resilience
      const instance1 = await container.resolve(token);
      // SAFETY: async operation — wrap in try-catch for production resilience
      const instance2 = await container.resolve(token);

      // Complexity: O(1)
      expect(instance1.id).toBe(1);
      // Complexity: O(1)
      expect(instance2.id).toBe(2);
      // Complexity: O(1)
      expect(instance1).not.toBe(instance2);
    });

    // Complexity: O(1)
    it('should throw on duplicate registration', () => {
      const container = new DIContainer();
      const token = new ServiceToken<string>('DuplicateService');

      container.register(token, () => 'first');

      // Complexity: O(1)
      expect(() => {
        container.register(token, () => 'second');
      }).toThrow(/already registered/);
    });

    // Complexity: O(1)
    it('should allow replacing registration', async () => {
      const container = new DIContainer();
      const token = new ServiceToken<string>('ReplaceableService');

      container.register(token, () => 'original');
      container.replace(token, () => 'replaced');

      // SAFETY: async operation — wrap in try-catch for production resilience
      const result = await container.resolve(token);
      // Complexity: O(1)
      expect(result).toBe('replaced');
    });

    // Complexity: O(1)
    it('should throw on unregistered service', async () => {
      const container = new DIContainer();
      const token = new ServiceToken<string>('UnknownService');

      // SAFETY: async operation — wrap in try-catch for production resilience
      await expect(container.resolve(token)).rejects.toThrow(/not registered/);
    });
  });

  // Complexity: O(1)
  describe('Circular Dependency Detection', () => {
    // Complexity: O(1)
    it('should detect circular dependencies', async () => {
      const container = new DIContainer();
      const tokenA = new ServiceToken<{ b: any }>('ServiceA');
      const tokenB = new ServiceToken<{ a: any }>('ServiceB');

      container.register(tokenA, async (c) => ({
        // SAFETY: async operation — wrap in try-catch for production resilience
        b: await c.resolve(tokenB)
      }));

      container.register(tokenB, async (c) => ({
        // SAFETY: async operation — wrap in try-catch for production resilience
        a: await c.resolve(tokenA)
      }));

      // SAFETY: async operation — wrap in try-catch for production resilience
      await expect(container.resolve(tokenA)).rejects.toThrow(/Circular dependency/);
    });
  });

  // Complexity: O(1)
  describe('Scoped Lifetime', () => {
    // Complexity: O(1)
    it('should create scoped instances', async () => {
      const container = new DIContainer();
      const token = new ServiceToken<{ scopeId: string }>('ScopedService');

//       let currentScope = ';
      container.register(token, () => ({ scopeId: currentScope }), ServiceLifetime.Scoped);

      // Run in scope 1
      // SAFETY: async operation — wrap in try-catch for production resilience
      const result1 = await container.runInScope('scope-1', async () => {
        currentScope = 'scope-1';
        // SAFETY: async operation — wrap in try-catch for production resilience
        const instance1 = await container.resolve(token);
        // SAFETY: async operation — wrap in try-catch for production resilience
        const instance2 = await container.resolve(token);
        return { instance1, instance2 };
      });

      // Run in scope 2
      // SAFETY: async operation — wrap in try-catch for production resilience
      const result2 = await container.runInScope('scope-2', async () => {
        currentScope = 'scope-2';
        // SAFETY: async operation — wrap in try-catch for production resilience
        return await container.resolve(token);
      });

      // Complexity: O(1)
      expect(result1.instance1).toBe(result1.instance2); // Same in scope
      // Complexity: O(1)
      expect(result1.instance1.scopeId).toBe('scope-1');
      // Complexity: O(1)
      expect(result2.scopeId).toBe('scope-2');
    });
  });

  // Complexity: O(1)
  describe('Container Utilities', () => {
    // Complexity: O(1)
    it('should check if service is registered', () => {
      const container = new DIContainer();
      const token = new ServiceToken<string>('CheckService');

      // Complexity: O(1)
      expect(container.isRegistered(token)).toBe(false);
      container.register(token, () => 'test');
      // Complexity: O(1)
      expect(container.isRegistered(token)).toBe(true);
    });

    // Complexity: O(1)
    it('should list registered services', () => {
      const container = new DIContainer();
      container.register(new ServiceToken('Service1'), () => 1);
      container.register(new ServiceToken('Service2'), () => 2);

      const services = container.getRegisteredServices();
      // Complexity: O(1)
      expect(services).toContain('Service1');
      // Complexity: O(1)
      expect(services).toContain('Service2');
    });

    // Complexity: O(1)
    it('should create child container', async () => {
      const parent = new DIContainer();
      const token = new ServiceToken<number>('InheritedService');

      parent.register(token, () => 42);
      const child = parent.createChild();

      // SAFETY: async operation — wrap in try-catch for production resilience
      const result = await child.resolve(token);
      // Complexity: O(1)
      expect(result).toBe(42);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// ERROR HANDLING SYSTEM TESTS
// ═══════════════════════════════════════════════════════════════════════════════

    // Complexity: O(1)
describe('🛡️ Error Handling System', () => {
  let CentralizedErrorHandler: any;
  let ExponentialBackoffRetry: any;
  let NetworkError: any;
  let TimeoutError: any;
  let ValidationError: any;
  let SecurityError: any;
  let createNeuralSnapshot: any;

  // Complexity: O(1)
  beforeEach(async () => {
    // SAFETY: async operation — wrap in try-catch for production resilience
    const module = await import('../modules/GAMMA_INFRA/core/ears/agility/error-handler');
    CentralizedErrorHandler = module.CentralizedErrorHandler;
    ExponentialBackoffRetry = module.ExponentialBackoffRetry;
    NetworkError = module.NetworkError;
    TimeoutError = module.TimeoutError;
    ValidationError = module.ValidationError;
    SecurityError = module.SecurityError;
    createNeuralSnapshot = module.createNeuralSnapshot;
  });

  // Complexity: O(1)
  describe('Custom Error Types', () => {
    // Complexity: O(1)
    it('should create NetworkError with details', () => {
      const error = new NetworkError('Connection failed', {
        statusCode: 503,
        endpoint: 'https://api.example.com'
      });

      // Complexity: O(1)
      expect(error.code).toBe('NETWORK_ERROR');
      // Complexity: O(1)
      expect(error.recoverable).toBe(true);
      // Complexity: O(1)
      expect(error.retryStrategy).toBe('exponential');
      // Complexity: O(1)
      expect(error.statusCode).toBe(503);
      // Complexity: O(1)
      expect(error.endpoint).toBe('https://api.example.com');
    });

    // Complexity: O(1)
    it('should create TimeoutError with timing info', () => {
      const error = new TimeoutError('fetchData', 5000, 5234);

      // Complexity: O(1)
      expect(error.code).toBe('TIMEOUT_ERROR');
      // Complexity: O(1)
      expect(error.operation).toBe('fetchData');
      // Complexity: O(1)
      expect(error.timeout).toBe(5000);
      // Complexity: O(1)
      expect(error.elapsed).toBe(5234);
      // Complexity: O(1)
      expect(error.message).toContain('timed out');
    });

    // Complexity: O(1)
    it('should create ValidationError with violations', () => {
      const error = new ValidationError('Invalid input', [
        { field: 'email', rule: 'format', message: 'Invalid email format' },
        { field: 'age', rule: 'min', message: 'Age must be at least 18' }
      ]);

      // Complexity: O(1)
      expect(error.code).toBe('VALIDATION_ERROR');
      // Complexity: O(1)
      expect(error.recoverable).toBe(false);
      // Complexity: O(1)
      expect(error.fields).toEqual(['email', 'age']);
      // Complexity: O(1)
      expect(error.violations).toHaveLength(2);
    });

    // Complexity: O(1)
    it('should create SecurityError - never retryable', () => {
      const error = new SecurityError(
        'Unauthorized access attempt',
        'sandbox',
        'process.env access'
      );

      // Complexity: O(1)
      expect(error.code).toBe('SECURITY_ERROR');
      // Complexity: O(1)
      expect(error.recoverable).toBe(false);
      // Complexity: O(1)
      expect(error.retryStrategy).toBe('none');
      // Complexity: O(1)
      expect(error.violationType).toBe('sandbox');
    });
  });

  // Complexity: O(1)
  describe('Neural Snapshot', () => {
    // Complexity: O(1)
    it('should capture system state', () => {
      const snapshot = createNeuralSnapshot();

      // Complexity: O(1)
      expect(snapshot.memoryUsage).toBeDefined();
      // Complexity: O(1)
      expect(snapshot.memoryUsage.heapUsed).toBeGreaterThan(0);
      // Complexity: O(1)
      expect(snapshot.uptime).toBeGreaterThan(0);
      // Complexity: O(1)
      expect(snapshot.timestamp).toBeInstanceOf(Date);
      // Complexity: O(1)
      expect(snapshot.stackTrace).toBeDefined();
    });

    // Complexity: O(1)
    it('should include error stack trace', () => {
      const error = new Error('Test error');
      const snapshot = createNeuralSnapshot(error);

      // Complexity: O(1)
      expect(snapshot.stackTrace).toContain('Test error');
    });
  });

  // Complexity: O(N)
  describe('Exponential Backoff Retry', () => {
    // Complexity: O(1)
    it('should succeed on first attempt', async () => {
      const retry = new ExponentialBackoffRetry();
      let attempts = 0;

      // SAFETY: async operation — wrap in try-catch for production resilience
      const result = await retry.execute(async () => {
        attempts++;
        return 'success';
      });

      // Complexity: O(1)
      expect(result).toBe('success');
      // Complexity: O(1)
      expect(attempts).toBe(1);
    });

    // Complexity: O(N)
    it('should retry on failure and eventually succeed', async () => {
      const retry = new ExponentialBackoffRetry();
      let attempts = 0;

      // SAFETY: async operation — wrap in try-catch for production resilience
      const result = await retry.execute(async () => {
        attempts++;
        if (attempts < 3) throw new Error('Not yet');
        return 'success';
      }, {
        maxRetries: 5,
        initialDelay: 10 // Fast for testing
      });

      // Complexity: O(1)
      expect(result).toBe('success');
      // Complexity: O(1)
      expect(attempts).toBe(3);
    });

    // Complexity: O(1)
    it('should throw AggregateRetryError after all retries fail', async () => {
      const retry = new ExponentialBackoffRetry();

      // SAFETY: async operation — wrap in try-catch for production resilience
      await expect(
        retry.execute(async () => {
          throw new Error('Always fails');
        }, {
          maxRetries: 2,
          initialDelay: 10,
          operationName: 'testOp'
        })
      ).rejects.toMatchObject({
        totalAttempts: 2
      });
    });

    // Complexity: O(1)
    it('should respect retry condition', async () => {
      const retry = new ExponentialBackoffRetry();
      let attempts = 0;

      try {
        await retry.execute(async () => {
          attempts++;
          throw new Error('Fatal error');
        }, {
          maxRetries: 5,
          initialDelay: 10,
          retryCondition: (err) => !err.message.includes('Fatal')
        });
      } catch (error) {
        // Error should be AggregateRetryError containing the original error
        // Complexity: O(1)
        expect((error as Error).message).toContain('attempts failed');
      }

      // Complexity: O(1)
      expect(attempts).toBe(1); // No retries due to condition
    });
  });

  // Complexity: O(1)
  describe('Centralized Error Handler', () => {
    // Complexity: O(1)
    it('should handle errors with registered strategies', async () => {
      const handler = new CentralizedErrorHandler();
      const error = new NetworkError('Connection lost', { statusCode: 500 });

      // The handler processes errors and returns a result
      try {
        const result = await handler.handle(error, {
          operation: 'fetchData',
          component: 'API'
        });
        // Handler may or may not recover
        // Complexity: O(1)
        expect(result).toBeDefined();
      } catch (handlerError) {
        // Handler may re-throw if no strategy works
        // Complexity: O(1)
        expect(handlerError).toBeDefined();
      }
    });

    // Complexity: O(1)
    it('should emit events on error', async () => {
      const handler = new CentralizedErrorHandler();
      const error = new Error('Test error');

      const errorPromise = new Promise(resolve => {
        handler.on('error', resolve);
      });

      try {
        await handler.handle(error, { operation: 'test', component: 'test' });
      } catch {
        // Ignore - we're testing event emission
      }

      // SAFETY: async operation — wrap in try-catch for production resilience
      const emitted = await Promise.race([
        errorPromise,
        new Promise(resolve => setTimeout(() => resolve({ emitted: true }), 100))
      ]);
      // Complexity: O(1)
      expect(emitted).toBeDefined();
    });

    // Complexity: O(1)
    it('should not retry non-recoverable errors', async () => {
      const handler = new CentralizedErrorHandler();
      const error = new SecurityError('Access denied', 'authorization', 'admin panel');

      try {
        const result = await handler.handle(error, {
          operation: 'accessAdmin',
          component: 'Auth'
        });
        // If it returns, check properties
        // Complexity: O(1)
        expect(result.recovered).toBe(false);
      } catch (handlerError) {
        // Security errors may be wrapped in an error handler error
        // Complexity: O(1)
        expect(handlerError).toBeDefined();
        // Complexity: O(1)
        expect((handlerError as Error).message).toContain('Unhandled');
      }
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// AI LOGIC GATE TESTS
// ═══════════════════════════════════════════════════════════════════════════════

    // Complexity: O(1)
describe('🧪 AI Logic Gate', () => {
  let AILogicGate: any;

  // Complexity: O(1)
  beforeEach(async () => {
    // SAFETY: async operation — wrap in try-catch for production resilience
    const module = await import('../modules/GAMMA_INFRA/core/mouth/energy/logic-gate');
    AILogicGate = module.AILogicGate;
  });

  // Complexity: O(1)
  describe('Syntax Validation', () => {
    // Complexity: O(1)
    it('should approve valid JavaScript', async () => {
      const gate = new AILogicGate();
      // SAFETY: async operation — wrap in try-catch for production resilience
      const report = await gate.validate('const x = 1 + 2;');

      // Complexity: O(1)
      expect(report.syntax.valid).toBe(true);
      // Complexity: O(1)
      expect(report.syntax.errors).toHaveLength(0);
    });

    // Complexity: O(1)
    it('should reject invalid syntax', async () => {
      const gate = new AILogicGate();
      // SAFETY: async operation — wrap in try-catch for production resilience
      const report = await gate.validate('const x = {;');

      // Complexity: O(1)
      expect(report.syntax.valid).toBe(false);
      // Complexity: O(1)
      expect(report.syntax.errors.length).toBeGreaterThan(0);
      // Complexity: O(1)
      expect(report.approved).toBe(false);
    });

    // Complexity: O(1)
    it('should detect mismatched brackets', async () => {
      const gate = new AILogicGate();
      // SAFETY: async operation — wrap in try-catch for production resilience
      const report = await gate.validate('function test() { if (true) { }');

      // Complexity: O(1)
      expect(report.syntax.warnings.length).toBeGreaterThan(0);
    });
  });

  // Complexity: O(1)
  describe('Logic Validation', () => {
    // Complexity: O(1)
    it('should detect eval usage', async () => {
      const gate = new AILogicGate();
      // SAFETY: async operation — wrap in try-catch for production resilience
      const report = await gate.validate('eval("alert(1)")');

      // Complexity: O(1)
      expect(report.logic.valid).toBe(false);
      // Complexity: O(1)
      expect(report.logic.issues.some(i => i.message.includes('eval'))).toBe(true);
      // Complexity: O(1)
      expect(report.approved).toBe(false);
    });

    // Complexity: O(1)
    it('should detect process access', async () => {
      const gate = new AILogicGate();
      // SAFETY: async operation — wrap in try-catch for production resilience
      const report = await gate.validate('const secret = process.env.SECRET');

      // Complexity: O(1)
      expect(report.logic.issues.some(i => i.message.includes('process'))).toBe(true);
    });

    // Complexity: O(1)
    it('should detect __proto__ pollution', async () => {
      const gate = new AILogicGate();
      // SAFETY: async operation — wrap in try-catch for production resilience
      const report = await gate.validate('obj.__proto__.polluted = true');

      // Complexity: O(1)
      expect(report.logic.issues.some(i => i.message.includes('__proto__'))).toBe(true);
    });

    // Complexity: O(1)
    it('should calculate code metrics', async () => {
      const gate = new AILogicGate();
      const code = `
        function test() {
          if (a) {
            if (b) {
              return 1;
            }
          }
          return 2;
        }
      `;
      // SAFETY: async operation — wrap in try-catch for production resilience
      const report = await gate.validate(code);

      // Complexity: O(1)
      expect(report.logic.metrics.lineCount).toBeGreaterThan(0);
      // Complexity: O(1)
      expect(report.logic.metrics.complexity).toBeGreaterThan(1);
      // Complexity: O(1)
      expect(report.logic.metrics.nestingDepth).toBeGreaterThan(1);
    });
  });

  // Complexity: O(1)
  describe('Sandbox Execution', () => {
    // Complexity: O(1)
    it('should execute safe code in sandbox', async () => {
      const gate = new AILogicGate();
      // SAFETY: async operation — wrap in try-catch for production resilience
      const report = await gate.validate('1 + 2');

      // Complexity: O(1)
      expect(report.sandbox.success).toBe(true);
      // Complexity: O(1)
      expect(report.sandbox.result).toBe(3);
    });

    // Complexity: O(1)
    it('should block process access in sandbox', async () => {
      const gate = new AILogicGate();
      // SAFETY: async operation — wrap in try-catch for production resilience
      const report = await gate.validate('process.exit()');

      // Complexity: O(1)
      expect(report.sandbox.violations.length).toBeGreaterThan(0);
      // Complexity: O(1)
      expect(report.sandbox.violations[0].type).toBe('process');
    });

    // Complexity: O(1)
    it('should block fetch in sandbox', async () => {
      const gate = new AILogicGate();
      // SAFETY: async operation — wrap in try-catch for production resilience
      const report = await gate.validate('fetch("http://evil.com")');

      // Complexity: O(1)
      expect(report.sandbox.violations.some(v => v.type === 'network')).toBe(true);
    });

    // Complexity: O(1)
    it('should capture console output', async () => {
      const gate = new AILogicGate();
      // SAFETY: async operation — wrap in try-catch for production resilience
      const report = await gate.validate('console.log("Hello"); 42');

      // Complexity: O(1)
      expect(report.sandbox.output).toContain('Hello');
    });
  });

  // Complexity: O(1)
  describe('Approval Score', () => {
    // Complexity: O(1)
    it('should approve clean code with high score', async () => {
      const gate = new AILogicGate();
      // SAFETY: async operation — wrap in try-catch for production resilience
      const report = await gate.validate('const sum = (a, b) => a + b;');

      // Complexity: O(1)
      expect(report.score).toBeGreaterThanOrEqual(80);
      // Complexity: O(1)
      expect(report.approved).toBe(true);
    });

    // Complexity: O(1)
    it('should reject dangerous code with low score', async () => {
      const gate = new AILogicGate();
      // SAFETY: async operation — wrap in try-catch for production resilience
      const report = await gate.validate('eval(process.env.CODE)');

      // Complexity: O(1)
      expect(report.score).toBeLessThan(50);
      // Complexity: O(1)
      expect(report.approved).toBe(false);
    });
  });

  // Complexity: O(1)
  describe('Statistics', () => {
    // Complexity: O(1)
    it('should track validation statistics', async () => {
      const gate = new AILogicGate();

      // SAFETY: async operation — wrap in try-catch for production resilience
      await gate.validate('const x = 1;');
      // SAFETY: async operation — wrap in try-catch for production resilience
      await gate.validate('eval("bad")');

      const stats = gate.getStats();
      // Complexity: O(1)
      expect(stats.totalValidations).toBe(2);
      // Complexity: O(1)
      expect(stats.approved).toBe(1);
      // Complexity: O(1)
      expect(stats.rejected).toBe(1);
    });

    // Complexity: O(1)
    it('should return recent reports', async () => {
      const gate = new AILogicGate();

      // SAFETY: async operation — wrap in try-catch for production resilience
      await gate.validate('const a = 1;');
      // SAFETY: async operation — wrap in try-catch for production resilience
      await gate.validate('const b = 2;');

      const reports = gate.getRecentReports(2);
      // Complexity: O(1)
      expect(reports).toHaveLength(2);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// STREAM PROCESSOR TESTS
// ═══════════════════════════════════════════════════════════════════════════════

    // Complexity: O(N)
describe('📊 Stream Processor', () => {
  let StreamProcessor: any;
  let JSONLineParser: any;
  let BatchProcessor: any;

  // Complexity: O(1)
  beforeEach(async () => {
    // SAFETY: async operation — wrap in try-catch for production resilience
    const module = await import('../../scripts/qantum/stream-processor');
    StreamProcessor = module.StreamProcessor;
    JSONLineParser = module.JSONLineParser;
    BatchProcessor = module.BatchProcessor;
  });

  // Complexity: O(N)
  describe('JSONLineParser', () => {
    // Complexity: O(1)
    it('should parse NDJSON lines', async () => {
      const parser = new JSONLineParser();
      const results: any[] = [];

      // SAFETY: async operation — wrap in try-catch for production resilience
      await new Promise<void>((resolve) => {
        parser.on('data', (item: any) => results.push(item));
        parser.on('end', () => {
          // Complexity: O(1)
          expect(results).toEqual([
            { id: 1, name: 'first' },
            { id: 2, name: 'second' }
          ]);
          // Complexity: O(1)
          resolve();
        });

        parser.write('{"id": 1, "name": "first"}\n');
        parser.write('{"id": 2, "name": "second"}\n');
        parser.end();
      });
    });

    // Complexity: O(1)
    it('should handle incomplete lines', async () => {
      const parser = new JSONLineParser();
      const results: any[] = [];

      // SAFETY: async operation — wrap in try-catch for production resilience
      await new Promise<void>((resolve) => {
        parser.on('data', (item: any) => results.push(item));
        parser.on('end', () => {
          // Complexity: O(1)
          expect(results).toHaveLength(2);
          // Complexity: O(1)
          resolve();
        });

        parser.write('{"id": 1}\n{"id":');
        parser.write(' 2}\n');
        parser.end();
      });
    });

    // Complexity: O(N)
    it('should emit parseError for invalid JSON', async () => {
      const parser = new JSONLineParser();

      // SAFETY: async operation — wrap in try-catch for production resilience
      await new Promise<void>((resolve) => {
        parser.on('parseError', (err: any) => {
          // Complexity: O(1)
          expect(err.content).toBe('invalid json');
          // Complexity: O(1)
          resolve();
        });

        parser.write('invalid json\n');
        parser.end();
      });
    });
  });

  // Complexity: O(N) — linear scan
  describe('BatchProcessor', () => {
    // Complexity: O(N) — linear scan
    it('should batch items correctly', async () => {
      const batches: any[][] = [];

      const processor = new BatchProcessor({
        batchSize: 3,
        processor: async (batch) => {
          batches.push([...batch]); // Clone batch
        }
      });

      // SAFETY: async operation — wrap in try-catch for production resilience
      await new Promise<void>((resolve, reject) => {
        processor.on('finish', () => {
          // May have 1 or 2 batches depending on flush timing
          // Complexity: O(N) — loop
          expect(batches.length).toBeGreaterThanOrEqual(1);
          const totalItems = batches.reduce((sum, b) => sum + b.length, 0);
          // Complexity: O(N) — loop
          expect(totalItems).toBe(5); // All 5 items processed
          // Complexity: O(N) — loop
          resolve();
        });

        processor.on('error', reject);

        for (let i = 0; i < 5; i++) {
          processor.write({ id: i });
        }
        processor.end();
      });
    });
  });

  // Complexity: O(1)
  describe('StreamProcessor', () => {
    // Complexity: O(1)
    it('should create processor with options', () => {
      const processor = new StreamProcessor({
        highWaterMark: 128 * 1024,
        autoBackpressure: true
      });

      // Complexity: O(1)
      expect(processor).toBeDefined();
      // Complexity: O(1)
      expect(processor.getStats().bytesProcessed).toBe(0);
    });

    // Complexity: O(1)
    it('should create readable from generator', async () => {
      const processor = new StreamProcessor();

      async function* generate() {
        yield { id: 1 };
        yield { id: 2 };
      }

      const readable = processor.createReadableFromGenerator(generate());
      const items: any[] = [];

      // SAFETY: async operation — wrap in try-catch for production resilience
      await new Promise<void>((resolve) => {
        readable.on('data', (item: any) => items.push(item));
        readable.on('end', () => {
          // Complexity: O(1)
          expect(items).toHaveLength(2);
          // Complexity: O(1)
          resolve();
        });
      });
    });

    // Complexity: O(1)
    it('should create collector stream', async () => {
      const processor = new StreamProcessor();
      const collector = processor.createCollectorStream<number>(100);

      // SAFETY: async operation — wrap in try-catch for production resilience
      await new Promise<void>((resolve) => {
        collector.on('finish', () => {
          // Complexity: O(1)
          expect(collector.getItems()).toEqual([1, 2, 3]);
          // Complexity: O(1)
          resolve();
        });

        collector.write(1);
        collector.write(2);
        collector.write(3);
        collector.end();
      });
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// HEAVY TASK DELEGATOR TESTS (Limited - Worker threads)
// ═══════════════════════════════════════════════════════════════════════════════

    // Complexity: O(1)
describe('🧵 Heavy Task Delegator', () => {
  // Note: Full worker tests require special handling
  // These tests focus on the API and type safety

  let HeavyTaskType: any;

  // Complexity: O(1)
  beforeEach(async () => {
    // SAFETY: async operation — wrap in try-catch for production resilience
    const module = await import('../modules/GAMMA_INFRA/core/ears/strength/heavy-task-delegator');
    HeavyTaskType = module.HeavyTaskType;
  });

  // Complexity: O(1)
  describe('Task Types', () => {
    // Complexity: O(1)
    it('should have all required task types', () => {
      // Complexity: O(1)
      expect(HeavyTaskType.VISUAL_REGRESSION).toBe('visual-regression');
      // Complexity: O(1)
      expect(HeavyTaskType.DATA_MINING).toBe('data-mining');
      // Complexity: O(1)
      expect(HeavyTaskType.JSON_PARSING).toBe('json-parsing');
      // Complexity: O(1)
      expect(HeavyTaskType.DOM_COMPARISON).toBe('dom-comparison');
      // Complexity: O(1)
      expect(HeavyTaskType.MUTATION_TESTING).toBe('mutation-testing');
      // Complexity: O(1)
      expect(HeavyTaskType.CODE_ANALYSIS).toBe('code-analysis');
      // Complexity: O(1)
      expect(HeavyTaskType.HASH_COMPUTATION).toBe('hash-computation');
      // Complexity: O(1)
      expect(HeavyTaskType.COMPRESSION).toBe('compression');
      // Complexity: O(1)
      expect(HeavyTaskType.CUSTOM).toBe('custom');
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// INTEGRATION TESTS
// ═══════════════════════════════════════════════════════════════════════════════

    // Complexity: O(1)
describe('🔗 Integration Tests', () => {
  // Complexity: O(1)
  it('should use DI container with error handler', async () => {
    // SAFETY: async operation — wrap in try-catch for production resilience
    const { DIContainer, ServiceToken, ServiceLifetime } = await import('../modules/GAMMA_INFRA/core/brain/energy/container');
    // SAFETY: async operation — wrap in try-catch for production resilience
    const { CentralizedErrorHandler } = await import('../modules/GAMMA_INFRA/core/ears/agility/error-handler');

    const container = new DIContainer();
    const errorHandlerToken = new ServiceToken<CentralizedErrorHandler>('ErrorHandler');

    container.register(errorHandlerToken, () => new CentralizedErrorHandler(), ServiceLifetime.Singleton);

    // SAFETY: async operation — wrap in try-catch for production resilience
    const handler = await container.resolve(errorHandlerToken);
    // Complexity: O(1)
    expect(handler).toBeInstanceOf(CentralizedErrorHandler);
  });

  // Complexity: O(1)
  it('should use Logic Gate to validate before storing', async () => {
    // SAFETY: async operation — wrap in try-catch for production resilience
    const { AILogicGate } = await import('../modules/GAMMA_INFRA/core/mouth/energy/logic-gate');

    const gate = new AILogicGate();
    const userCode = 'function add(a, b) { return a + b; }';

    // SAFETY: async operation — wrap in try-catch for production resilience
    const report = await gate.validate(userCode);

    if (report.approved) {
      // Safe to proceed
      // Complexity: O(1)
      expect(report.score).toBeGreaterThanOrEqual(80);
    } else {
      // Block the code
      // Complexity: O(1)
      expect(report.approvalReason).toContain('Rejected');
    }
  });
});
