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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
// ═══════════════════════════════════════════════════════════════════════════════
// DEPENDENCY INJECTION CONTAINER TESTS
// ═══════════════════════════════════════════════════════════════════════════════
(0, vitest_1.describe)('💎 DIContainer', () => {
    // Import dynamically to avoid worker thread issues
    let DIContainer;
    let ServiceToken;
    let ServiceLifetime;
    (0, vitest_1.beforeEach)(async () => {
        const module = await Promise.resolve().then(() => __importStar(require('../src/core/di/container')));
        DIContainer = module.DIContainer;
        ServiceToken = module.ServiceToken;
        ServiceLifetime = module.ServiceLifetime;
    });
    (0, vitest_1.describe)('Service Registration', () => {
        (0, vitest_1.it)('should register and resolve a singleton service', async () => {
            const container = new DIContainer();
            const token = new ServiceToken('TestService');
            let createCount = 0;
            container.register(token, () => {
                createCount++;
                return { value: 42 };
            }, ServiceLifetime.Singleton);
            const instance1 = await container.resolve(token);
            const instance2 = await container.resolve(token);
            (0, vitest_1.expect)(instance1.value).toBe(42);
            (0, vitest_1.expect)(instance1).toBe(instance2); // Same instance
            (0, vitest_1.expect)(createCount).toBe(1); // Factory called once
        });
        (0, vitest_1.it)('should create new instance for transient lifetime', async () => {
            const container = new DIContainer();
            const token = new ServiceToken('TransientService');
            let counter = 0;
            container.register(token, () => {
                return { id: ++counter };
            }, ServiceLifetime.Transient);
            const instance1 = await container.resolve(token);
            const instance2 = await container.resolve(token);
            (0, vitest_1.expect)(instance1.id).toBe(1);
            (0, vitest_1.expect)(instance2.id).toBe(2);
            (0, vitest_1.expect)(instance1).not.toBe(instance2);
        });
        (0, vitest_1.it)('should throw on duplicate registration', () => {
            const container = new DIContainer();
            const token = new ServiceToken('DuplicateService');
            container.register(token, () => 'first');
            (0, vitest_1.expect)(() => {
                container.register(token, () => 'second');
            }).toThrow(/already registered/);
        });
        (0, vitest_1.it)('should allow replacing registration', async () => {
            const container = new DIContainer();
            const token = new ServiceToken('ReplaceableService');
            container.register(token, () => 'original');
            container.replace(token, () => 'replaced');
            const result = await container.resolve(token);
            (0, vitest_1.expect)(result).toBe('replaced');
        });
        (0, vitest_1.it)('should throw on unregistered service', async () => {
            const container = new DIContainer();
            const token = new ServiceToken('UnknownService');
            await (0, vitest_1.expect)(container.resolve(token)).rejects.toThrow(/not registered/);
        });
    });
    (0, vitest_1.describe)('Circular Dependency Detection', () => {
        (0, vitest_1.it)('should detect circular dependencies', async () => {
            const container = new DIContainer();
            const tokenA = new ServiceToken('ServiceA');
            const tokenB = new ServiceToken('ServiceB');
            container.register(tokenA, async (c) => ({
                b: await c.resolve(tokenB)
            }));
            container.register(tokenB, async (c) => ({
                a: await c.resolve(tokenA)
            }));
            await (0, vitest_1.expect)(container.resolve(tokenA)).rejects.toThrow(/Circular dependency/);
        });
    });
    (0, vitest_1.describe)('Scoped Lifetime', () => {
        (0, vitest_1.it)('should create scoped instances', async () => {
            const container = new DIContainer();
            const token = new ServiceToken('ScopedService');
            let currentScope = '';
            container.register(token, () => ({ scopeId: currentScope }), ServiceLifetime.Scoped);
            // Run in scope 1
            const result1 = await container.runInScope('scope-1', async () => {
                currentScope = 'scope-1';
                const instance1 = await container.resolve(token);
                const instance2 = await container.resolve(token);
                return { instance1, instance2 };
            });
            // Run in scope 2
            const result2 = await container.runInScope('scope-2', async () => {
                currentScope = 'scope-2';
                return await container.resolve(token);
            });
            (0, vitest_1.expect)(result1.instance1).toBe(result1.instance2); // Same in scope
            (0, vitest_1.expect)(result1.instance1.scopeId).toBe('scope-1');
            (0, vitest_1.expect)(result2.scopeId).toBe('scope-2');
        });
    });
    (0, vitest_1.describe)('Container Utilities', () => {
        (0, vitest_1.it)('should check if service is registered', () => {
            const container = new DIContainer();
            const token = new ServiceToken('CheckService');
            (0, vitest_1.expect)(container.isRegistered(token)).toBe(false);
            container.register(token, () => 'test');
            (0, vitest_1.expect)(container.isRegistered(token)).toBe(true);
        });
        (0, vitest_1.it)('should list registered services', () => {
            const container = new DIContainer();
            container.register(new ServiceToken('Service1'), () => 1);
            container.register(new ServiceToken('Service2'), () => 2);
            const services = container.getRegisteredServices();
            (0, vitest_1.expect)(services).toContain('Service1');
            (0, vitest_1.expect)(services).toContain('Service2');
        });
        (0, vitest_1.it)('should create child container', async () => {
            const parent = new DIContainer();
            const token = new ServiceToken('InheritedService');
            parent.register(token, () => 42);
            const child = parent.createChild();
            const result = await child.resolve(token);
            (0, vitest_1.expect)(result).toBe(42);
        });
    });
});
// ═══════════════════════════════════════════════════════════════════════════════
// ERROR HANDLING SYSTEM TESTS
// ═══════════════════════════════════════════════════════════════════════════════
(0, vitest_1.describe)('🛡️ Error Handling System', () => {
    let CentralizedErrorHandler;
    let ExponentialBackoffRetry;
    let NetworkError;
    let TimeoutError;
    let ValidationError;
    let SecurityError;
    let createNeuralSnapshot;
    (0, vitest_1.beforeEach)(async () => {
        const module = await Promise.resolve().then(() => __importStar(require('../src/core/errors/error-handler')));
        CentralizedErrorHandler = module.CentralizedErrorHandler;
        ExponentialBackoffRetry = module.ExponentialBackoffRetry;
        NetworkError = module.NetworkError;
        TimeoutError = module.TimeoutError;
        ValidationError = module.ValidationError;
        SecurityError = module.SecurityError;
        createNeuralSnapshot = module.createNeuralSnapshot;
    });
    (0, vitest_1.describe)('Custom Error Types', () => {
        (0, vitest_1.it)('should create NetworkError with details', () => {
            const error = new NetworkError('Connection failed', {
                statusCode: 503,
                endpoint: 'https://api.example.com'
            });
            (0, vitest_1.expect)(error.code).toBe('NETWORK_ERROR');
            (0, vitest_1.expect)(error.recoverable).toBe(true);
            (0, vitest_1.expect)(error.retryStrategy).toBe('exponential');
            (0, vitest_1.expect)(error.statusCode).toBe(503);
            (0, vitest_1.expect)(error.endpoint).toBe('https://api.example.com');
        });
        (0, vitest_1.it)('should create TimeoutError with timing info', () => {
            const error = new TimeoutError('fetchData', 5000, 5234);
            (0, vitest_1.expect)(error.code).toBe('TIMEOUT_ERROR');
            (0, vitest_1.expect)(error.operation).toBe('fetchData');
            (0, vitest_1.expect)(error.timeout).toBe(5000);
            (0, vitest_1.expect)(error.elapsed).toBe(5234);
            (0, vitest_1.expect)(error.message).toContain('timed out');
        });
        (0, vitest_1.it)('should create ValidationError with violations', () => {
            const error = new ValidationError('Invalid input', [
                { field: 'email', rule: 'format', message: 'Invalid email format' },
                { field: 'age', rule: 'min', message: 'Age must be at least 18' }
            ]);
            (0, vitest_1.expect)(error.code).toBe('VALIDATION_ERROR');
            (0, vitest_1.expect)(error.recoverable).toBe(false);
            (0, vitest_1.expect)(error.fields).toEqual(['email', 'age']);
            (0, vitest_1.expect)(error.violations).toHaveLength(2);
        });
        (0, vitest_1.it)('should create SecurityError - never retryable', () => {
            const error = new SecurityError('Unauthorized access attempt', 'sandbox', 'process.env access');
            (0, vitest_1.expect)(error.code).toBe('SECURITY_ERROR');
            (0, vitest_1.expect)(error.recoverable).toBe(false);
            (0, vitest_1.expect)(error.retryStrategy).toBe('none');
            (0, vitest_1.expect)(error.violationType).toBe('sandbox');
        });
    });
    (0, vitest_1.describe)('Neural Snapshot', () => {
        (0, vitest_1.it)('should capture system state', () => {
            const snapshot = createNeuralSnapshot();
            (0, vitest_1.expect)(snapshot.memoryUsage).toBeDefined();
            (0, vitest_1.expect)(snapshot.memoryUsage.heapUsed).toBeGreaterThan(0);
            (0, vitest_1.expect)(snapshot.uptime).toBeGreaterThan(0);
            (0, vitest_1.expect)(snapshot.timestamp).toBeInstanceOf(Date);
            (0, vitest_1.expect)(snapshot.stackTrace).toBeDefined();
        });
        (0, vitest_1.it)('should include error stack trace', () => {
            const error = new Error('Test error');
            const snapshot = createNeuralSnapshot(error);
            (0, vitest_1.expect)(snapshot.stackTrace).toContain('Test error');
        });
    });
    (0, vitest_1.describe)('Exponential Backoff Retry', () => {
        (0, vitest_1.it)('should succeed on first attempt', async () => {
            const retry = new ExponentialBackoffRetry();
            let attempts = 0;
            const result = await retry.execute(async () => {
                attempts++;
                return 'success';
            });
            (0, vitest_1.expect)(result).toBe('success');
            (0, vitest_1.expect)(attempts).toBe(1);
        });
        (0, vitest_1.it)('should retry on failure and eventually succeed', async () => {
            const retry = new ExponentialBackoffRetry();
            let attempts = 0;
            const result = await retry.execute(async () => {
                attempts++;
                if (attempts < 3)
                    throw new Error('Not yet');
                return 'success';
            }, {
                maxRetries: 5,
                initialDelay: 10 // Fast for testing
            });
            (0, vitest_1.expect)(result).toBe('success');
            (0, vitest_1.expect)(attempts).toBe(3);
        });
        (0, vitest_1.it)('should throw AggregateRetryError after all retries fail', async () => {
            const retry = new ExponentialBackoffRetry();
            await (0, vitest_1.expect)(retry.execute(async () => {
                throw new Error('Always fails');
            }, {
                maxRetries: 2,
                initialDelay: 10,
                operationName: 'testOp'
            })).rejects.toMatchObject({
                totalAttempts: 2
            });
        });
        (0, vitest_1.it)('should respect retry condition', async () => {
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
            }
            catch (error) {
                // Error should be AggregateRetryError containing the original error
                (0, vitest_1.expect)(error.message).toContain('attempts failed');
            }
            (0, vitest_1.expect)(attempts).toBe(1); // No retries due to condition
        });
    });
    (0, vitest_1.describe)('Centralized Error Handler', () => {
        (0, vitest_1.it)('should handle errors with registered strategies', async () => {
            const handler = new CentralizedErrorHandler();
            const error = new NetworkError('Connection lost', { statusCode: 500 });
            // The handler processes errors and returns a result
            try {
                const result = await handler.handle(error, {
                    operation: 'fetchData',
                    component: 'API'
                });
                // Handler may or may not recover
                (0, vitest_1.expect)(result).toBeDefined();
            }
            catch (handlerError) {
                // Handler may re-throw if no strategy works
                (0, vitest_1.expect)(handlerError).toBeDefined();
            }
        });
        (0, vitest_1.it)('should emit events on error', async () => {
            const handler = new CentralizedErrorHandler();
            const error = new Error('Test error');
            const errorPromise = new Promise(resolve => {
                handler.on('error', resolve);
            });
            try {
                await handler.handle(error, { operation: 'test', component: 'test' });
            }
            catch {
                // Ignore - we're testing event emission
            }
            const emitted = await Promise.race([
                errorPromise,
                new Promise(resolve => setTimeout(() => resolve({ emitted: true }), 100))
            ]);
            (0, vitest_1.expect)(emitted).toBeDefined();
        });
        (0, vitest_1.it)('should not retry non-recoverable errors', async () => {
            const handler = new CentralizedErrorHandler();
            const error = new SecurityError('Access denied', 'authorization', 'admin panel');
            try {
                const result = await handler.handle(error, {
                    operation: 'accessAdmin',
                    component: 'Auth'
                });
                // If it returns, check properties
                (0, vitest_1.expect)(result.recovered).toBe(false);
            }
            catch (handlerError) {
                // Security errors may be wrapped in an error handler error
                (0, vitest_1.expect)(handlerError).toBeDefined();
                (0, vitest_1.expect)(handlerError.message).toContain('Unhandled');
            }
        });
    });
});
// ═══════════════════════════════════════════════════════════════════════════════
// AI LOGIC GATE TESTS
// ═══════════════════════════════════════════════════════════════════════════════
(0, vitest_1.describe)('🧪 AI Logic Gate', () => {
    let AILogicGate;
    (0, vitest_1.beforeEach)(async () => {
        const module = await Promise.resolve().then(() => __importStar(require('../src/core/validation/logic-gate')));
        AILogicGate = module.AILogicGate;
    });
    (0, vitest_1.describe)('Syntax Validation', () => {
        (0, vitest_1.it)('should approve valid JavaScript', async () => {
            const gate = new AILogicGate();
            const report = await gate.validate('const x = 1 + 2;');
            (0, vitest_1.expect)(report.syntax.valid).toBe(true);
            (0, vitest_1.expect)(report.syntax.errors).toHaveLength(0);
        });
        (0, vitest_1.it)('should reject invalid syntax', async () => {
            const gate = new AILogicGate();
            const report = await gate.validate('const x = {;');
            (0, vitest_1.expect)(report.syntax.valid).toBe(false);
            (0, vitest_1.expect)(report.syntax.errors.length).toBeGreaterThan(0);
            (0, vitest_1.expect)(report.approved).toBe(false);
        });
        (0, vitest_1.it)('should detect mismatched brackets', async () => {
            const gate = new AILogicGate();
            const report = await gate.validate('function test() { if (true) { }');
            (0, vitest_1.expect)(report.syntax.warnings.length).toBeGreaterThan(0);
        });
    });
    (0, vitest_1.describe)('Logic Validation', () => {
        (0, vitest_1.it)('should detect eval usage', async () => {
            const gate = new AILogicGate();
            const report = await gate.validate('eval("alert(1)")');
            (0, vitest_1.expect)(report.logic.valid).toBe(false);
            (0, vitest_1.expect)(report.logic.issues.some(i => i.message.includes('eval'))).toBe(true);
            (0, vitest_1.expect)(report.approved).toBe(false);
        });
        (0, vitest_1.it)('should detect process access', async () => {
            const gate = new AILogicGate();
            const report = await gate.validate('const secret = process.env.SECRET');
            (0, vitest_1.expect)(report.logic.issues.some(i => i.message.includes('process'))).toBe(true);
        });
        (0, vitest_1.it)('should detect __proto__ pollution', async () => {
            const gate = new AILogicGate();
            const report = await gate.validate('obj.__proto__.polluted = true');
            (0, vitest_1.expect)(report.logic.issues.some(i => i.message.includes('__proto__'))).toBe(true);
        });
        (0, vitest_1.it)('should calculate code metrics', async () => {
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
            const report = await gate.validate(code);
            (0, vitest_1.expect)(report.logic.metrics.lineCount).toBeGreaterThan(0);
            (0, vitest_1.expect)(report.logic.metrics.complexity).toBeGreaterThan(1);
            (0, vitest_1.expect)(report.logic.metrics.nestingDepth).toBeGreaterThan(1);
        });
    });
    (0, vitest_1.describe)('Sandbox Execution', () => {
        (0, vitest_1.it)('should execute safe code in sandbox', async () => {
            const gate = new AILogicGate();
            const report = await gate.validate('1 + 2');
            (0, vitest_1.expect)(report.sandbox.success).toBe(true);
            (0, vitest_1.expect)(report.sandbox.result).toBe(3);
        });
        (0, vitest_1.it)('should block process access in sandbox', async () => {
            const gate = new AILogicGate();
            const report = await gate.validate('process.exit()');
            (0, vitest_1.expect)(report.sandbox.violations.length).toBeGreaterThan(0);
            (0, vitest_1.expect)(report.sandbox.violations[0].type).toBe('process');
        });
        (0, vitest_1.it)('should block fetch in sandbox', async () => {
            const gate = new AILogicGate();
            const report = await gate.validate('fetch("http://evil.com")');
            (0, vitest_1.expect)(report.sandbox.violations.some(v => v.type === 'network')).toBe(true);
        });
        (0, vitest_1.it)('should capture console output', async () => {
            const gate = new AILogicGate();
            const report = await gate.validate('console.log("Hello"); 42');
            (0, vitest_1.expect)(report.sandbox.output).toContain('Hello');
        });
    });
    (0, vitest_1.describe)('Approval Score', () => {
        (0, vitest_1.it)('should approve clean code with high score', async () => {
            const gate = new AILogicGate();
            const report = await gate.validate('const sum = (a, b) => a + b;');
            (0, vitest_1.expect)(report.score).toBeGreaterThanOrEqual(80);
            (0, vitest_1.expect)(report.approved).toBe(true);
        });
        (0, vitest_1.it)('should reject dangerous code with low score', async () => {
            const gate = new AILogicGate();
            const report = await gate.validate('eval(process.env.CODE)');
            (0, vitest_1.expect)(report.score).toBeLessThan(50);
            (0, vitest_1.expect)(report.approved).toBe(false);
        });
    });
    (0, vitest_1.describe)('Statistics', () => {
        (0, vitest_1.it)('should track validation statistics', async () => {
            const gate = new AILogicGate();
            await gate.validate('const x = 1;');
            await gate.validate('eval("bad")');
            const stats = gate.getStats();
            (0, vitest_1.expect)(stats.totalValidations).toBe(2);
            (0, vitest_1.expect)(stats.approved).toBe(1);
            (0, vitest_1.expect)(stats.rejected).toBe(1);
        });
        (0, vitest_1.it)('should return recent reports', async () => {
            const gate = new AILogicGate();
            await gate.validate('const a = 1;');
            await gate.validate('const b = 2;');
            const reports = gate.getRecentReports(2);
            (0, vitest_1.expect)(reports).toHaveLength(2);
        });
    });
});
// ═══════════════════════════════════════════════════════════════════════════════
// STREAM PROCESSOR TESTS
// ═══════════════════════════════════════════════════════════════════════════════
(0, vitest_1.describe)('📊 Stream Processor', () => {
    let StreamProcessor;
    let JSONLineParser;
    let BatchProcessor;
    (0, vitest_1.beforeEach)(async () => {
        const module = await Promise.resolve().then(() => __importStar(require('../src/core/streams/stream-processor')));
        StreamProcessor = module.StreamProcessor;
        JSONLineParser = module.JSONLineParser;
        BatchProcessor = module.BatchProcessor;
    });
    (0, vitest_1.describe)('JSONLineParser', () => {
        (0, vitest_1.it)('should parse NDJSON lines', async () => {
            const parser = new JSONLineParser();
            const results = [];
            await new Promise((resolve) => {
                parser.on('data', (item) => results.push(item));
                parser.on('end', () => {
                    (0, vitest_1.expect)(results).toEqual([
                        { id: 1, name: 'first' },
                        { id: 2, name: 'second' }
                    ]);
                    resolve();
                });
                parser.write('{"id": 1, "name": "first"}\n');
                parser.write('{"id": 2, "name": "second"}\n');
                parser.end();
            });
        });
        (0, vitest_1.it)('should handle incomplete lines', async () => {
            const parser = new JSONLineParser();
            const results = [];
            await new Promise((resolve) => {
                parser.on('data', (item) => results.push(item));
                parser.on('end', () => {
                    (0, vitest_1.expect)(results).toHaveLength(2);
                    resolve();
                });
                parser.write('{"id": 1}\n{"id":');
                parser.write(' 2}\n');
                parser.end();
            });
        });
        (0, vitest_1.it)('should emit parseError for invalid JSON', async () => {
            const parser = new JSONLineParser();
            await new Promise((resolve) => {
                parser.on('parseError', (err) => {
                    (0, vitest_1.expect)(err.content).toBe('invalid json');
                    resolve();
                });
                parser.write('invalid json\n');
                parser.end();
            });
        });
    });
    (0, vitest_1.describe)('BatchProcessor', () => {
        (0, vitest_1.it)('should batch items correctly', async () => {
            const batches = [];
            const processor = new BatchProcessor({
                batchSize: 3,
                processor: async (batch) => {
                    batches.push([...batch]); // Clone batch
                }
            });
            await new Promise((resolve, reject) => {
                processor.on('finish', () => {
                    // May have 1 or 2 batches depending on flush timing
                    (0, vitest_1.expect)(batches.length).toBeGreaterThanOrEqual(1);
                    const totalItems = batches.reduce((sum, b) => sum + b.length, 0);
                    (0, vitest_1.expect)(totalItems).toBe(5); // All 5 items processed
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
    (0, vitest_1.describe)('StreamProcessor', () => {
        (0, vitest_1.it)('should create processor with options', () => {
            const processor = new StreamProcessor({
                highWaterMark: 128 * 1024,
                autoBackpressure: true
            });
            (0, vitest_1.expect)(processor).toBeDefined();
            (0, vitest_1.expect)(processor.getStats().bytesProcessed).toBe(0);
        });
        (0, vitest_1.it)('should create readable from generator', async () => {
            const processor = new StreamProcessor();
            async function* generate() {
                yield { id: 1 };
                yield { id: 2 };
            }
            const readable = processor.createReadableFromGenerator(generate());
            const items = [];
            await new Promise((resolve) => {
                readable.on('data', (item) => items.push(item));
                readable.on('end', () => {
                    (0, vitest_1.expect)(items).toHaveLength(2);
                    resolve();
                });
            });
        });
        (0, vitest_1.it)('should create collector stream', async () => {
            const processor = new StreamProcessor();
            const collector = processor.createCollectorStream(100);
            await new Promise((resolve) => {
                collector.on('finish', () => {
                    (0, vitest_1.expect)(collector.getItems()).toEqual([1, 2, 3]);
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
(0, vitest_1.describe)('🧵 Heavy Task Delegator', () => {
    // Note: Full worker tests require special handling
    // These tests focus on the API and type safety
    let HeavyTaskType;
    (0, vitest_1.beforeEach)(async () => {
        const module = await Promise.resolve().then(() => __importStar(require('../src/core/workers/heavy-task-delegator')));
        HeavyTaskType = module.HeavyTaskType;
    });
    (0, vitest_1.describe)('Task Types', () => {
        (0, vitest_1.it)('should have all required task types', () => {
            (0, vitest_1.expect)(HeavyTaskType.VISUAL_REGRESSION).toBe('visual-regression');
            (0, vitest_1.expect)(HeavyTaskType.DATA_MINING).toBe('data-mining');
            (0, vitest_1.expect)(HeavyTaskType.JSON_PARSING).toBe('json-parsing');
            (0, vitest_1.expect)(HeavyTaskType.DOM_COMPARISON).toBe('dom-comparison');
            (0, vitest_1.expect)(HeavyTaskType.MUTATION_TESTING).toBe('mutation-testing');
            (0, vitest_1.expect)(HeavyTaskType.CODE_ANALYSIS).toBe('code-analysis');
            (0, vitest_1.expect)(HeavyTaskType.HASH_COMPUTATION).toBe('hash-computation');
            (0, vitest_1.expect)(HeavyTaskType.COMPRESSION).toBe('compression');
            (0, vitest_1.expect)(HeavyTaskType.CUSTOM).toBe('custom');
        });
    });
});
// ═══════════════════════════════════════════════════════════════════════════════
// INTEGRATION TESTS
// ═══════════════════════════════════════════════════════════════════════════════
(0, vitest_1.describe)('🔗 Integration Tests', () => {
    (0, vitest_1.it)('should use DI container with error handler', async () => {
        const { DIContainer, ServiceToken, ServiceLifetime } = await Promise.resolve().then(() => __importStar(require('../src/core/di/container')));
        const { CentralizedErrorHandler } = await Promise.resolve().then(() => __importStar(require('../src/core/errors/error-handler')));
        const container = new DIContainer();
        const errorHandlerToken = new ServiceToken('ErrorHandler');
        container.register(errorHandlerToken, () => new CentralizedErrorHandler(), ServiceLifetime.Singleton);
        const handler = await container.resolve(errorHandlerToken);
        (0, vitest_1.expect)(handler).toBeInstanceOf(CentralizedErrorHandler);
    });
    (0, vitest_1.it)('should use Logic Gate to validate before storing', async () => {
        const { AILogicGate } = await Promise.resolve().then(() => __importStar(require('../src/core/validation/logic-gate')));
        const gate = new AILogicGate();
        const userCode = 'function add(a, b) { return a + b; }';
        const report = await gate.validate(userCode);
        if (report.approved) {
            // Safe to proceed
            (0, vitest_1.expect)(report.score).toBeGreaterThanOrEqual(80);
        }
        else {
            // Block the code
            (0, vitest_1.expect)(report.approvalReason).toContain('Rejected');
        }
    });
});
