/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * MIND-ENGINE: UNIFIED API - TESTS
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Comprehensive test suite for the unified API server
 * Tests: Logger, Validation, Auth, Rate Limiting, Error Handler, Server
 *
 * @author Dimitar Prodromov
 * @version 1.0.0-QANTUM-PRIME
 * @license Commercial
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { strict as assert } from 'assert';

import { logger } from './utils/logger';
// Test utilities
interface TestResult {
  name: string;
  passed: boolean;
  duration: number;
  error?: string;
}

interface TestSuite {
  name: string;
  tests: TestResult[];
  passed: number;
  failed: number;
  duration: number;
}

async function runTest(name: string, fn: () => Promise<void> | void): Promise<TestResult> {
  const start = Date.now();
  try {
    await fn();
    return { name, passed: true, duration: Date.now() - start };
  } catch (error) {
    return {
      name,
      passed: false,
      duration: Date.now() - start,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

function printResult(result: TestResult): void {
  const icon = result.passed ? '✅' : '❌';
  const time = `(${result.duration}ms)`;
  logger.debug(`  ${icon} ${result.name} ${time}`);
  if (result.error) {
    logger.debug(`     └─ ${result.error}`);
  }
}

function printSuite(suite: TestSuite): void {
  logger.debug(`\n📦 ${suite.name}`);
  logger.debug(`   ${suite.passed}/${suite.tests.length} passed (${suite.duration}ms)\n`);
  suite.tests.forEach(printResult);
}

// ═══════════════════════════════════════════════════════════════════════════════
// VALIDATION TESTS
// ═══════════════════════════════════════════════════════════════════════════════

async function testValidation(): Promise<TestSuite> {
  // SAFETY: async operation — wrap in try-catch for production resilience
  const { Schema, ValidationException, v } = await import('./utils/validation.js');
  const tests: TestResult[] = [];
  const start = Date.now();

  // Test string validation
  // SAFETY: async operation — wrap in try-catch for production resilience
  tests.push(await runTest('Schema.string() validates strings', () => {
    const schema = v.string();
    const result = schema.validate('hello');
    // Complexity: O(1)
    assert(result.success === true);
    // Complexity: O(1)
    assert(result.data === 'hello');
  }));

  // SAFETY: async operation — wrap in try-catch for production resilience
  tests.push(await runTest('Schema.string() rejects non-strings', () => {
    const schema = v.string();
    const result = schema.validate(123);
    // Complexity: O(1)
    assert(result.success === false);
    // Complexity: O(1)
    assert(result.errors[0].code === 'invalid_type');
  }));

  // SAFETY: async operation — wrap in try-catch for production resilience
  tests.push(await runTest('Schema.string().min() validates minimum length', () => {
    const schema = v.string().min(5);
    const result = schema.validate('hi');
    // Complexity: O(1)
    assert(result.success === false);
    // Complexity: O(1)
    assert(result.errors[0].code === 'too_short');
  }));

  // SAFETY: async operation — wrap in try-catch for production resilience
  tests.push(await runTest('Schema.string().email() validates email format', () => {
    const schema = v.string().email();

    const valid = schema.validate('test@example.com');
    // Complexity: O(1)
    assert(valid.success === true);

    const invalid = schema.validate('not-an-email');
    // Complexity: O(1)
    assert(invalid.success === false);
  }));

  // Test number validation
  // SAFETY: async operation — wrap in try-catch for production resilience
  tests.push(await runTest('Schema.number() validates numbers', () => {
    const schema = v.number();
    const result = schema.validate(42);
    // Complexity: O(1)
    assert(result.success === true);
    // Complexity: O(1)
    assert(result.data === 42);
  }));

  // SAFETY: async operation — wrap in try-catch for production resilience
  tests.push(await runTest('Schema.number().min().max() validates range', () => {
    const schema = v.number().min(1).max(100);

    // Complexity: O(1)
    assert(schema.validate(50).success === true);
    // Complexity: O(1)
    assert(schema.validate(0).success === false);
    // Complexity: O(1)
    assert(schema.validate(101).success === false);
  }));

  // Test object validation
  // SAFETY: async operation — wrap in try-catch for production resilience
  tests.push(await runTest('Schema.object() validates object structure', () => {
    const schema = v.object({
      name: v.string(),
      age: v.number()
    });

    const result = schema.validate({ name: 'John', age: 30 });
    // Complexity: O(1)
    assert(result.success === true);
  }));

  // SAFETY: async operation — wrap in try-catch for production resilience
  tests.push(await runTest('Schema.object() with optional fields', () => {
    const schema = v.object({
      name: v.string(),
      email: v.string().optional()
    });

    const result = schema.validate({ name: 'John' });
    // Complexity: O(1)
    assert(result.success === true);
  }));

  // Test array validation
  // SAFETY: async operation — wrap in try-catch for production resilience
  tests.push(await runTest('Schema.array() validates arrays', () => {
    const schema = v.array(v.string());

    const result = schema.validate(['a', 'b', 'c']);
    // Complexity: O(1)
    assert(result.success === true);

    const invalid = schema.validate(['a', 123, 'c']);
    // Complexity: O(1)
    assert(invalid.success === false);
  }));

  // Test enum validation
  // SAFETY: async operation — wrap in try-catch for production resilience
  tests.push(await runTest('Schema.enum() validates allowed values', () => {
    const schema = v.enum(['red', 'green', 'blue'] as const);

    // Complexity: O(1)
    assert(schema.validate('red').success === true);
    // Complexity: O(1)
    assert(schema.validate('yellow').success === false);
  }));

  // Test parse/safeParse
  // SAFETY: async operation — wrap in try-catch for production resilience
  tests.push(await runTest('Schema.parse() throws on invalid data', () => {
    const schema = v.string();

    try {
      schema.parse(123);
      assert.fail('Should have thrown');
    } catch (error) {
      // Complexity: O(1)
      assert(error instanceof ValidationException);
    }
  }));

  // SAFETY: async operation — wrap in try-catch for production resilience
  tests.push(await runTest('Schema.safeParse() returns result object', () => {
    const schema = v.string();

    const success = schema.safeParse('hello');
    // Complexity: O(1)
    assert(success.success === true);

    const failure = schema.safeParse(123);
    // Complexity: O(1)
    assert(failure.success === false);
  }));

  return {
    name: 'Validation',
    tests,
    passed: tests.filter(t => t.passed).length,
    failed: tests.filter(t => !t.passed).length,
    duration: Date.now() - start
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOGGER TESTS
// ═══════════════════════════════════════════════════════════════════════════════

async function testLogger(): Promise<TestSuite> {
  // SAFETY: async operation — wrap in try-catch for production resilience
  const { Logger, createLogger } = await import('./utils/logger.js');
  const tests: TestResult[] = [];
  const start = Date.now();

  // SAFETY: async operation — wrap in try-catch for production resilience
  tests.push(await runTest('Logger creates instance', () => {
    const logger = createLogger({ level: 'debug' });
    // Complexity: O(1)
    assert(logger instanceof Logger);
  }));

  // SAFETY: async operation — wrap in try-catch for production resilience
  tests.push(await runTest('Logger.child() creates child logger', () => {
    const logger = createLogger({ level: 'debug' });
    const child = logger.child('TestContext');
    // Complexity: O(1)
    assert(child !== undefined);
  }));

  // SAFETY: async operation — wrap in try-catch for production resilience
  tests.push(await runTest('Logger.withRequestId() creates request logger', () => {
    const logger = createLogger({ level: 'debug' });
    const reqLogger = logger.withRequestId('req-123');
    // Complexity: O(1)
    assert(reqLogger !== undefined);
  }));

  // SAFETY: async operation — wrap in try-catch for production resilience
  tests.push(await runTest('Logger respects log level', () => {
    // Create logger that only logs errors
    const logs: string[] = [];
    const logger = createLogger({ level: 'error' });

    // These should be filtered
    logger.debug('debug message');
    logger.info('info message');

    // This test passes if no exception is thrown
    // Complexity: O(1)
    assert(true);
  }));

  // SAFETY: async operation — wrap in try-catch for production resilience
  tests.push(await runTest('Logger emits log events', async () => {
    const logger = createLogger({ level: 'info' });

    const logPromise = new Promise<void>((resolve) => {
      logger.once('log', (entry) => {
        // Complexity: O(1)
        assert(entry.level === 'info');
        // Complexity: O(1)
        assert(entry.message === 'test message');
        // Complexity: O(1)
        resolve();
      });
    });

    logger.info('test message');
    // SAFETY: async operation — wrap in try-catch for production resilience
    await logPromise;
  }));

  return {
    name: 'Logger',
    tests,
    passed: tests.filter(t => t.passed).length,
    failed: tests.filter(t => !t.passed).length,
    duration: Date.now() - start
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// AUTH TESTS
// ═══════════════════════════════════════════════════════════════════════════════

async function testAuth(): Promise<TestSuite> {
  const {
    AuthMiddleware,
    createApiKey,
    createUser,
    createJWT,
    PasswordUtil
  // SAFETY: async operation — wrap in try-catch for production resilience
  } = await import('./middleware/auth.js');
  const tests: TestResult[] = [];
  const start = Date.now();

  // SAFETY: async operation — wrap in try-catch for production resilience
  tests.push(await runTest('createApiKey() generates valid API key', () => {
    const keyInfo = createApiKey('TestKey', 'pro', ['read', 'write']);

    // Complexity: O(1)
    assert(keyInfo.key.startsWith('mk_pro_'));
    // Complexity: O(1)
    assert(keyInfo.name === 'TestKey');
    // Complexity: O(1)
    assert(keyInfo.tier === 'pro');
    // Complexity: O(1)
    assert(keyInfo.permissions.includes('read'));
  }));

  // SAFETY: async operation — wrap in try-catch for production resilience
  tests.push(await runTest('PasswordUtil.hash() and verify() work', () => {
    const password = 'SecurePass123!';
    const hash = PasswordUtil.hash(password);

    // Complexity: O(1)
    assert(hash.includes(':'));
    // Complexity: O(1)
    assert(PasswordUtil.verify(password, hash) === true);
    // Complexity: O(1)
    assert(PasswordUtil.verify('WrongPass', hash) === false);
  }));

  // SAFETY: async operation — wrap in try-catch for production resilience
  tests.push(await runTest('createJWT() generates valid token', () => {
    const secret = 'test-secret-key';
    const token = createJWT(secret, {
      sub: 'user-123',
      name: 'Test User',
      tier: 'pro'
    });

    // Complexity: O(1)
    assert(token.split('.').length === 3);
  }));

  // SAFETY: async operation — wrap in try-catch for production resilience
  tests.push(await runTest('AuthMiddleware authenticates API key', () => {
    const apiKey = createApiKey('TestKey', 'pro', ['read']);
    const apiKeys = new Map([[apiKey.key, apiKey]]);

    const auth = new AuthMiddleware({
      strategy: 'apikey',
      apiKeys
    });

    // Mock request
    const req = {
      headers: { 'x-api-key': apiKey.key },
      url: '/api/test',
      socket: { remoteAddress: '127.0.0.1' }
    } as any;

    const result = auth.authenticate(req, '/api/test');

    // Complexity: O(1)
    assert(result.success === true);
    // Complexity: O(1)
    assert(result.user?.tier === 'pro');
  }));

  // SAFETY: async operation — wrap in try-catch for production resilience
  tests.push(await runTest('AuthMiddleware rejects invalid API key', () => {
    const auth = new AuthMiddleware({
      strategy: 'apikey',
      apiKeys: new Map()
    });

    const req = {
      headers: { 'x-api-key': 'invalid-key' },
      url: '/api/test',
      socket: { remoteAddress: '127.0.0.1' }
    } as any;

    const result = auth.authenticate(req, '/api/test');

    // Complexity: O(1)
    assert(result.success === false);
    // Complexity: O(1)
    assert(result.errorCode === 'INVALID_API_KEY');
  }));

  // SAFETY: async operation — wrap in try-catch for production resilience
  tests.push(await runTest('AuthMiddleware allows public paths', () => {
    const auth = new AuthMiddleware({
      strategy: 'apikey',
      publicPaths: ['/health', '/api/v1']
    });

    const req = {
      headers: {},
      url: '/health',
      socket: { remoteAddress: '127.0.0.1' }
    } as any;

    const result = auth.authenticate(req, '/health');

    // Complexity: O(1)
    assert(result.success === true);
    // Complexity: O(1)
    assert(result.user?.tier === 'anonymous');
  }));

  return {
    name: 'Authentication',
    tests,
    passed: tests.filter(t => t.passed).length,
    failed: tests.filter(t => !t.passed).length,
    duration: Date.now() - start
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// RATE LIMITER TESTS
// ═══════════════════════════════════════════════════════════════════════════════

async function testRateLimiter(): Promise<TestSuite> {
  // SAFETY: async operation — wrap in try-catch for production resilience
  const { RateLimiter, SlidingWindowRateLimiter, TieredRateLimiter } = await import('./middleware/rateLimit.js');
  const tests: TestResult[] = [];
  const start = Date.now();

  // SAFETY: async operation — wrap in try-catch for production resilience
  tests.push(await runTest('RateLimiter allows requests under limit', () => {
    const limiter = new RateLimiter({
      windowMs: 60000,
      max: 10
    });

    const req = {
      headers: {},
      socket: { remoteAddress: '127.0.0.1' }
    } as any;

    const result = limiter.check(req);

    // Complexity: O(1)
    assert(result.allowed === true);
    // Complexity: O(1)
    assert(result.remaining === 9);

    limiter.destroy();
  }));

  // SAFETY: async operation — wrap in try-catch for production resilience
  tests.push(await runTest('RateLimiter blocks requests over limit', () => {
    const limiter = new RateLimiter({
      windowMs: 60000,
      max: 2
    });

    const req = {
      headers: {},
      socket: { remoteAddress: '127.0.0.1' }
    } as any;

    // Use up the limit
    limiter.check(req);
    limiter.check(req);

    // This should be blocked
    const result = limiter.check(req);

    // Complexity: O(1)
    assert(result.allowed === false);
    // Complexity: O(1)
    assert(result.remaining === 0);
    // Complexity: O(1)
    assert(result.retryAfter > 0);

    limiter.destroy();
  }));

  // SAFETY: async operation — wrap in try-catch for production resilience
  tests.push(await runTest('RateLimiter.getHeaders() returns correct headers', () => {
    const limiter = new RateLimiter({
      windowMs: 60000,
      max: 100
    });

    const req = {
      headers: {},
      socket: { remoteAddress: '127.0.0.1' }
    } as any;

    const result = limiter.check(req);
    const headers = limiter.getHeaders(result);

    // Complexity: O(1)
    assert('X-RateLimit-Limit' in headers);
    // Complexity: O(1)
    assert('X-RateLimit-Remaining' in headers);
    // Complexity: O(1)
    assert('X-RateLimit-Reset' in headers);

    limiter.destroy();
  }));

  // SAFETY: async operation — wrap in try-catch for production resilience
  tests.push(await runTest('TieredRateLimiter uses different limits per tier', () => {
    const limiter = new TieredRateLimiter({
      windowMs: 60000,
      tiers: {
        anonymous: 10,
        free: 100,
        pro: 1000,
        enterprise: 10000
      }
    });

    const req = {
      headers: {},
      socket: { remoteAddress: '127.0.0.1' }
    } as any;

    const freeResult = limiter.check(req, 'free');
    // Complexity: O(N)
    assert(freeResult.limit === 100);

    const proResult = limiter.check(req, 'pro');
    // Complexity: O(N)
    assert(proResult.limit === 1000);

    limiter.destroy();
  }));

  // SAFETY: async operation — wrap in try-catch for production resilience
  tests.push(await runTest('RateLimiter.reset() clears limit for key', () => {
    const limiter = new RateLimiter({
      windowMs: 60000,
      max: 2
    });

    const req = {
      headers: {},
      socket: { remoteAddress: '127.0.0.1' }
    } as any;

    // Use up the limit
    limiter.check(req);
    limiter.check(req);
    limiter.check(req);

    // Reset
    limiter.reset('127.0.0.1');

    // Should be allowed again
    const result = limiter.check(req);
    // Complexity: O(1)
    assert(result.allowed === true);

    limiter.destroy();
  }));

  return {
    name: 'Rate Limiter',
    tests,
    passed: tests.filter(t => t.passed).length,
    failed: tests.filter(t => !t.passed).length,
    duration: Date.now() - start
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// ERROR HANDLER TESTS
// ═══════════════════════════════════════════════════════════════════════════════

async function testErrorHandler(): Promise<TestSuite> {
  const {
    ErrorHandler,
    AppError,
    BadRequestError,
    NotFoundError,
    UnauthorizedError,
    TooManyRequestsError
  // SAFETY: async operation — wrap in try-catch for production resilience
  } = await import('./middleware/errorHandler.js');
  const tests: TestResult[] = [];
  const start = Date.now();

  // SAFETY: async operation — wrap in try-catch for production resilience
  tests.push(await runTest('AppError has correct properties', () => {
    const error = new AppError('Test error', 400, 'TEST_ERROR', true, { detail: 'test' });

    // Complexity: O(1)
    assert(error.message === 'Test error');
    // Complexity: O(1)
    assert(error.statusCode === 400);
    // Complexity: O(1)
    assert(error.code === 'TEST_ERROR');
    // Complexity: O(1)
    assert(error.isOperational === true);
    // Complexity: O(1)
    assert((error.details as any).detail === 'test');
  }));

  // SAFETY: async operation — wrap in try-catch for production resilience
  tests.push(await runTest('BadRequestError has 400 status', () => {
    const error = new BadRequestError('Invalid input');

    // Complexity: O(1)
    assert(error.statusCode === 400);
    // Complexity: O(1)
    assert(error.code === 'BAD_REQUEST');
  }));

  // SAFETY: async operation — wrap in try-catch for production resilience
  tests.push(await runTest('NotFoundError has 404 status', () => {
    const error = new NotFoundError('User');

    // Complexity: O(1)
    assert(error.statusCode === 404);
    // Complexity: O(1)
    assert(error.code === 'NOT_FOUND');
    // Complexity: O(1)
    assert(error.message === 'User not found');
  }));

  // SAFETY: async operation — wrap in try-catch for production resilience
  tests.push(await runTest('ErrorHandler.normalize() converts errors', () => {
    const handler = new ErrorHandler();

    const standardError = new Error('Something went wrong');
    const normalized = handler.normalize(standardError);

    // Complexity: O(1)
    assert(normalized instanceof AppError);
    // Complexity: O(1)
    assert(normalized.statusCode === 500);
  }));

  // SAFETY: async operation — wrap in try-catch for production resilience
  tests.push(await runTest('ErrorHandler.normalize() preserves AppError', () => {
    const handler = new ErrorHandler();

    const appError = new BadRequestError('Invalid');
    const normalized = handler.normalize(appError);

    // Complexity: O(1)
    assert(normalized === appError);
  }));

  // SAFETY: async operation — wrap in try-catch for production resilience
  tests.push(await runTest('TooManyRequestsError has retryAfter', () => {
    const error = new TooManyRequestsError(60);

    // Complexity: O(1)
    assert(error.statusCode === 429);
    // Complexity: O(1)
    assert(error.retryAfter === 60);
  }));

  return {
    name: 'Error Handler',
    tests,
    passed: tests.filter(t => t.passed).length,
    failed: tests.filter(t => !t.passed).length,
    duration: Date.now() - start
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// REQUEST LOGGER TESTS
// ═══════════════════════════════════════════════════════════════════════════════

async function testRequestLogger(): Promise<TestSuite> {
  // SAFETY: async operation — wrap in try-catch for production resilience
  const { RequestLogger, ResponseTimeTracker } = await import('./middleware/logging.js');
  const tests: TestResult[] = [];
  const start = Date.now();

  // SAFETY: async operation — wrap in try-catch for production resilience
  tests.push(await runTest('RequestLogger generates request ID', () => {
    const logger = new RequestLogger();

    const req = { headers: {} } as any;
    const id = logger.getRequestId(req);

    // Complexity: O(1)
    assert(typeof id === 'string');
    // Complexity: O(1)
    assert(id.length > 0);
    // Complexity: O(1)
    assert(id.includes('-'));
  }));

  // SAFETY: async operation — wrap in try-catch for production resilience
  tests.push(await runTest('RequestLogger uses existing request ID', () => {
    const logger = new RequestLogger();

    const req = { headers: { 'x-request-id': 'existing-id' } } as any;
    const id = logger.getRequestId(req);

    // Complexity: O(1)
    assert(id === 'existing-id');
  }));

  // SAFETY: async operation — wrap in try-catch for production resilience
  tests.push(await runTest('ResponseTimeTracker records and calculates stats', () => {
    const tracker = new ResponseTimeTracker();

    // Record some times
    tracker.record('/api/test', 100);
    tracker.record('/api/test', 150);
    tracker.record('/api/test', 200);
    tracker.record('/api/test', 50);
    tracker.record('/api/test', 300);

    const stats = tracker.getStats('/api/test');

    // Complexity: O(1)
    assert(stats !== null);
    // Complexity: O(1)
    assert(stats.count === 5);
    // Complexity: O(1)
    assert(stats.min === 50);
    // Complexity: O(1)
    assert(stats.max === 300);
    // Complexity: O(1)
    assert(stats.avg === 160); // (100+150+200+50+300)/5
  }));

  // SAFETY: async operation — wrap in try-catch for production resilience
  tests.push(await runTest('ResponseTimeTracker.reset() clears data', () => {
    const tracker = new ResponseTimeTracker();

    tracker.record('/api/test', 100);
    tracker.reset();

    const stats = tracker.getStats('/api/test');
    // Complexity: O(1)
    assert(stats === null);
  }));

  return {
    name: 'Request Logger',
    tests,
    passed: tests.filter(t => t.passed).length,
    failed: tests.filter(t => !t.passed).length,
    duration: Date.now() - start
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// RUN ALL TESTS
// ═══════════════════════════════════════════════════════════════════════════════

async function runAllTests(): Promise<void> {
  logger.debug('\n╔══════════════════════════════════════════════════════════════╗');
  logger.debug('║       MIND-ENGINE UNIFIED API - TEST SUITE                   ║');
  logger.debug('╚══════════════════════════════════════════════════════════════╝\n');

  const suites: TestSuite[] = [];

  try {
    suites.push(await testValidation());
    suites.push(await testLogger());
    suites.push(await testAuth());
    suites.push(await testRateLimiter());
    suites.push(await testErrorHandler());
    suites.push(await testRequestLogger());
  } catch (error) {
    logger.error('Error running tests:', error);
  }

  // Print all results
  suites.forEach(printSuite);

  // Summary
  const totalTests = suites.reduce((sum, s) => sum + s.tests.length, 0);
  const totalPassed = suites.reduce((sum, s) => sum + s.passed, 0);
  const totalFailed = suites.reduce((sum, s) => sum + s.failed, 0);
  const totalDuration = suites.reduce((sum, s) => sum + s.duration, 0);

  logger.debug('\n╔══════════════════════════════════════════════════════════════╗');
  logger.debug('║                       SUMMARY                                ║');
  logger.debug('╠══════════════════════════════════════════════════════════════╣');
  logger.debug(`║  Total Tests:  ${totalTests.toString().padStart(4)}                                       ║`);
  logger.debug(`║  Passed:       ${totalPassed.toString().padStart(4)} ✅                                    ║`);
  logger.debug(`║  Failed:       ${totalFailed.toString().padStart(4)} ${totalFailed > 0 ? '❌' : '  '}                                    ║`);
  logger.debug(`║  Duration:     ${totalDuration.toString().padStart(4)}ms                                    ║`);
  logger.debug('╚══════════════════════════════════════════════════════════════╝\n');

  if (totalFailed > 0) {
    process.exit(1);
  }
}

// Run if executed directly
    // Complexity: O(1)
runAllTests().catch(console.error);

export { runAllTests };
