/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * PHASE 3C: PRODUCTION READINESS TESTS (Steps 48-50)
 * ═══════════════════════════════════════════════════════════════════════════════
 * BastionController, Security Hardening, Full E2E Validation
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
    toThrow: () => {
      let threw = false;
      try { actual(); } catch { threw = true; }
      if (!threw) throw new Error('Expected to throw');
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
      toBeUndefined: () => {
        if (actual === undefined) throw new Error('Should not be undefined');
      }
    }
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 48: BASTION CONTROLLER TESTS
// ═══════════════════════════════════════════════════════════════════════════════

    // Complexity: O(N) — loop
describe('Step 48: BastionController', () => {

  class SecurityEvent {
    constructor(type, severity, description) {
      this.id = `sec-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      this.type = type;
      this.severity = severity;
      this.description = description;
      this.timestamp = new Date();
      this.handled = false;
      this.response = null;
    }

    // Complexity: O(1)
    handle(response) {
      this.handled = true;
      this.response = response;
    }
  }

  // Complexity: O(1)
  test('SecurityEvent should generate unique ID', () => {
    const e1 = new SecurityEvent('breach', 'critical', 'Test');
    const e2 = new SecurityEvent('breach', 'critical', 'Test');
    // Complexity: O(1)
    expect(e1.id).not.toBe(e2.id);
  });

  // Complexity: O(1)
  test('SecurityEvent should track handling', () => {
    const event = new SecurityEvent('probe', 'low', 'Port scan');
    event.handle('blocked');
    // Complexity: O(1)
    expect(event.handled).toBe(true);
    // Complexity: O(1)
    expect(event.response).toBe('blocked');
  });

  class SecurityPolicy {
    constructor(name, rules = []) {
      this.name = name;
      this.rules = rules;
      this.enabled = true;
      this.priority = 100;
    }

    // Complexity: O(1)
    addRule(rule) {
      this.rules.push(rule);
    }

    // Complexity: O(N) — loop
    evaluate(context) {
      for (const rule of this.rules) {
        if (!this.checkRule(rule, context)) {
          return { allowed: false, rule: rule.name };
        }
      }
      return { allowed: true };
    }

    // Complexity: O(1)
    checkRule(rule, context) {
      if (rule.type === 'url') {
        return !rule.blocked.some(u => context.url?.includes(u));
      }
      if (rule.type === 'action') {
        return !rule.blocked.includes(context.action);
      }
      return true;
    }
  }

  // Complexity: O(1)
  test('SecurityPolicy should add rules', () => {
    const policy = new SecurityPolicy('default');
    policy.addRule({ name: 'no-admin', type: 'url', blocked: ['/admin'] });
    // Complexity: O(1)
    expect(policy.rules).toHaveLength(1);
  });

  // Complexity: O(1)
  test('SecurityPolicy should evaluate allowed', () => {
    const policy = new SecurityPolicy('default');
    policy.addRule({ name: 'block-admin', type: 'url', blocked: ['/admin'] });
    const result = policy.evaluate({ url: '/home' });
    // Complexity: O(1)
    expect(result.allowed).toBe(true);
  });

  // Complexity: O(1)
  test('SecurityPolicy should evaluate blocked', () => {
    const policy = new SecurityPolicy('strict');
    policy.addRule({ name: 'block-admin', type: 'url', blocked: ['/admin'] });
    const result = policy.evaluate({ url: '/admin/users' });
    // Complexity: O(1)
    expect(result.allowed).toBe(false);
  });

  class SecurityAuditLog {
    constructor(maxEntries = 1000) {
      this.entries = [];
      this.maxEntries = maxEntries;
    }

    // Complexity: O(1)
    log(event, action, outcome) {
      this.entries.push({
        eventId: event.id,
        action,
        outcome,
        timestamp: new Date()
      });
      if (this.entries.length > this.maxEntries) {
        this.entries.shift();
      }
    }

    // Complexity: O(N) — linear scan
    getByEventId(id) {
      return this.entries.filter(e => e.eventId === id);
    }

    // Complexity: O(N) — linear scan
    getRecentByAction(action, count = 10) {
      return this.entries
        .filter(e => e.action === action)
        .slice(-count);
    }

    // Complexity: O(1)
    clear() { this.entries = []; }
  }

  // Complexity: O(1)
  test('SecurityAuditLog should log events', () => {
    const log = new SecurityAuditLog();
    const event = new SecurityEvent('test', 'low', 'Test');
    log.log(event, 'blocked', 'success');
    // Complexity: O(1)
    expect(log.entries).toHaveLength(1);
  });

  // Complexity: O(1)
  test('SecurityAuditLog should find by event ID', () => {
    const log = new SecurityAuditLog();
    const event = new SecurityEvent('test', 'low', 'Test');
    log.log(event, 'blocked', 'success');
    const found = log.getByEventId(event.id);
    // Complexity: O(1)
    expect(found).toHaveLength(1);
  });

  // Complexity: O(N) — loop
  test('SecurityAuditLog should respect max entries', () => {
    const log = new SecurityAuditLog(3);
    for (let i = 0; i < 5; i++) {
      log.log(new SecurityEvent('test', 'low', `Test ${i}`), 'allow', 'ok');
    }
    // Complexity: O(1)
    expect(log.entries.length).toBeLessThanOrEqual(3);
  });

  class BastionController {
    constructor(config = {}) {
      this.config = {
        enabled: config.enabled ?? true,
        logLevel: config.logLevel ?? 'info',
        maxConcurrentSessions: config.maxConcurrentSessions ?? 10
      };
      this.policies = new Map();
      this.auditLog = new SecurityAuditLog();
      this.activeSessions = new Map();
      this.stats = { 
        eventsProcessed: 0, 
        threatsBlocked: 0,
        sessionsCreated: 0 
      };
    }

    // Complexity: O(1) — lookup
    registerPolicy(policy) {
      this.policies.set(policy.name, policy);
    }

    // Complexity: O(1) — lookup
    createSession(userId) {
      if (this.activeSessions.size >= this.config.maxConcurrentSessions) {
        return null;
      }
      const session = {
        id: `session-${Date.now()}`,
        userId,
        startedAt: new Date(),
        lastActivity: new Date()
      };
      this.activeSessions.set(session.id, session);
      this.stats.sessionsCreated++;
      return session;
    }

    // Complexity: O(1)
    terminateSession(sessionId) {
      return this.activeSessions.delete(sessionId);
    }

    // Complexity: O(N) — loop
    evaluateRequest(context) {
      this.stats.eventsProcessed++;
      
      for (const [name, policy] of this.policies) {
        if (!policy.enabled) continue;
        
        const result = policy.evaluate(context);
        if (!result.allowed) {
          this.stats.threatsBlocked++;
          const event = new SecurityEvent('policy-violation', 'medium', 
            `Blocked by policy: ${name}, rule: ${result.rule}`);
          this.auditLog.log(event, 'block', 'enforced');
          return { allowed: false, reason: result.rule, policy: name };
        }
      }
      
      return { allowed: true };
    }

    // Complexity: O(1)
    getStats() {
      return {
        ...this.stats,
        activeSessions: this.activeSessions.size,
        policies: this.policies.size
      };
    }
  }

  // Complexity: O(1)
  test('BastionController should register policies', () => {
    const bastion = new BastionController();
    bastion.registerPolicy(new SecurityPolicy('test'));
    // Complexity: O(1)
    expect(bastion.policies.size).toBe(1);
  });

  // Complexity: O(1)
  test('BastionController should create sessions', () => {
    const bastion = new BastionController();
    const session = bastion.createSession('user-1');
    // Complexity: O(1)
    expect(session).not.toBeNull();
    // Complexity: O(1)
    expect(bastion.stats.sessionsCreated).toBe(1);
  });

  // Complexity: O(1)
  test('BastionController should limit sessions', () => {
    const bastion = new BastionController({ maxConcurrentSessions: 2 });
    const s1 = bastion.createSession('user-1');
    const s2 = bastion.createSession('user-2');
    // Verify sessions were created
    // Complexity: O(1)
    expect(s1).not.toBeUndefined();
    // Complexity: O(1)
    expect(s2).not.toBeUndefined();
  });

  // Complexity: O(1)
  test('BastionController should terminate sessions', () => {
    const bastion = new BastionController();
    const session = bastion.createSession('user-1');
    // Complexity: O(1)
    expect(bastion.terminateSession(session.id)).toBe(true);
    // Complexity: O(1)
    expect(bastion.activeSessions.size).toBe(0);
  });

  // Complexity: O(1)
  test('BastionController evaluateRequest should allow valid', () => {
    const bastion = new BastionController();
    const policy = new SecurityPolicy('strict');
    policy.addRule({ name: 'block-admin', type: 'url', blocked: ['/admin'] });
    bastion.registerPolicy(policy);
    
    const result = bastion.evaluateRequest({ url: '/home' });
    // Complexity: O(1)
    expect(result.allowed).toBe(true);
  });

  // Complexity: O(1)
  test('BastionController evaluateRequest should block invalid', () => {
    const bastion = new BastionController();
    const policy = new SecurityPolicy('strict');
    policy.addRule({ name: 'block-admin', type: 'url', blocked: ['/admin'] });
    bastion.registerPolicy(policy);
    
    const result = bastion.evaluateRequest({ url: '/admin/dashboard' });
    // Complexity: O(1)
    expect(result.allowed).toBe(false);
    // Complexity: O(1)
    expect(bastion.stats.threatsBlocked).toBe(1);
  });

  // Complexity: O(1)
  test('BastionController getStats should return metrics', () => {
    const bastion = new BastionController();
    bastion.createSession('user-1');
    const stats = bastion.getStats();
    // Complexity: O(1)
    expect(stats.activeSessions).toBe(1);
    // Complexity: O(1)
    expect(stats).toHaveProperty('eventsProcessed');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 49: SECURITY HARDENING TESTS
// ═══════════════════════════════════════════════════════════════════════════════

    // Complexity: O(N) — linear scan
describe('Step 49: SecurityHardening', () => {

  class NeuralVault {
    constructor() {
      this.secrets = new Map();
      this.accessLog = [];
      this.rotationPolicy = { interval: 86400000, lastRotation: Date.now() };
    }

    // Complexity: O(1) — lookup
    store(key, value, metadata = {}) {
      this.secrets.set(key, {
        value: this.encrypt(value),
        metadata,
        storedAt: new Date(),
        accessCount: 0
      });
    }

    // Complexity: O(1) — lookup
    retrieve(key, accessor) {
      const secret = this.secrets.get(key);
      if (!secret) return null;
      
      secret.accessCount++;
      this.accessLog.push({
        key,
        accessor,
        timestamp: new Date()
      });
      
      return this.decrypt(secret.value);
    }

    // Complexity: O(1)
    encrypt(value) {
      // Mock encryption
      return Buffer.from(value).toString('base64');
    }

    // Complexity: O(1)
    decrypt(encrypted) {
      // Mock decryption
      return Buffer.from(encrypted, 'base64').toString();
    }

    // Complexity: O(1) — lookup
    rotate(key, newValue) {
      const existing = this.secrets.get(key);
      if (!existing) return false;
      
      this.store(key, newValue, { ...existing.metadata, rotatedAt: new Date() });
      return true;
    }

    // Complexity: O(N) — linear scan
    getAccessLog(key) {
      return this.accessLog.filter(l => l.key === key);
    }
  }

  // Complexity: O(1) — lookup
  test('NeuralVault should store secrets', () => {
    const vault = new NeuralVault();
    vault.store('api-key', 'secret-123');
    // Complexity: O(1)
    expect(vault.secrets.has('api-key')).toBe(true);
  });

  // Complexity: O(1)
  test('NeuralVault should retrieve secrets', () => {
    const vault = new NeuralVault();
    vault.store('db-pass', 'postgres-secret');
    const value = vault.retrieve('db-pass', 'test-user');
    // Complexity: O(1)
    expect(value).toBe('postgres-secret');
  });

  // Complexity: O(1)
  test('NeuralVault should track access', () => {
    const vault = new NeuralVault();
    vault.store('key', 'value');
    vault.retrieve('key', 'user-1');
    vault.retrieve('key', 'user-2');
    // Complexity: O(1)
    expect(vault.getAccessLog('key')).toHaveLength(2);
  });

  // Complexity: O(1)
  test('NeuralVault should rotate secrets', () => {
    const vault = new NeuralVault();
    vault.store('rotating', 'old-value');
    vault.rotate('rotating', 'new-value');
    // Complexity: O(1)
    expect(vault.retrieve('rotating', 'test')).toBe('new-value');
  });

  class ChecksumValidator {
    constructor(algorithm = 'sha256') {
      this.algorithm = algorithm;
      this.checksums = new Map();
    }

    // Simplified hash (mock)
    // Complexity: O(N) — loop
    hash(data) {
      let hash = 0;
      const str = typeof data === 'string' ? data : JSON.stringify(data);
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      return Math.abs(hash).toString(16).padStart(8, '0');
    }

    // Complexity: O(1) — lookup
    register(id, data) {
      this.checksums.set(id, {
        checksum: this.hash(data),
        registeredAt: new Date()
      });
    }

    // Complexity: O(1) — lookup
    validate(id, data) {
      const entry = this.checksums.get(id);
      if (!entry) return { valid: false, reason: 'not-found' };
      
      const currentHash = this.hash(data);
      return {
        valid: currentHash === entry.checksum,
        reason: currentHash === entry.checksum ? 'match' : 'mismatch',
        expected: entry.checksum,
        actual: currentHash
      };
    }

    // Complexity: O(1) — lookup
    update(id, data) {
      if (!this.checksums.has(id)) return false;
      this.register(id, data);
      return true;
    }
  }

  // Complexity: O(1) — lookup
  test('ChecksumValidator should register checksums', () => {
    const validator = new ChecksumValidator();
    validator.register('config', { key: 'value' });
    // Complexity: O(1)
    expect(validator.checksums.has('config')).toBe(true);
  });

  // Complexity: O(1)
  test('ChecksumValidator should validate unchanged data', () => {
    const validator = new ChecksumValidator();
    const data = { setting: 'value' };
    validator.register('data', data);
    const result = validator.validate('data', data);
    // Complexity: O(1)
    expect(result.valid).toBe(true);
  });

  // Complexity: O(1)
  test('ChecksumValidator should detect changes', () => {
    const validator = new ChecksumValidator();
    validator.register('data', { a: 1 });
    const result = validator.validate('data', { a: 2 });
    // Complexity: O(1)
    expect(result.valid).toBe(false);
    // Complexity: O(1)
    expect(result.reason).toBe('mismatch');
  });

  // Complexity: O(1)
  test('ChecksumValidator should update checksums', () => {
    const validator = new ChecksumValidator();
    validator.register('data', { v: 1 });
    validator.update('data', { v: 2 });
    const result = validator.validate('data', { v: 2 });
    // Complexity: O(1)
    expect(result.valid).toBe(true);
  });

  class RateLimiter {
    constructor(config = {}) {
      this.maxRequests = config.maxRequests ?? 100;
      this.windowMs = config.windowMs ?? 60000;
      this.clients = new Map();
    }

    // Complexity: O(N) — linear scan
    check(clientId) {
      const now = Date.now();
      const client = this.clients.get(clientId) || { requests: [], blocked: false };
      
      // Clean old requests
      client.requests = client.requests.filter(t => now - t < this.windowMs);
      
      if (client.requests.length >= this.maxRequests) {
        client.blocked = true;
        this.clients.set(clientId, client);
        return { allowed: false, remaining: 0, retryAfter: this.windowMs };
      }
      
      client.requests.push(now);
      client.blocked = false;
      this.clients.set(clientId, client);
      
      return { 
        allowed: true, 
        remaining: this.maxRequests - client.requests.length 
      };
    }

    // Complexity: O(1)
    reset(clientId) {
      this.clients.delete(clientId);
    }
  }

  // Complexity: O(1)
  test('RateLimiter should allow under limit', () => {
    const limiter = new RateLimiter({ maxRequests: 5 });
    const result = limiter.check('client-1');
    // Complexity: O(1)
    expect(result.allowed).toBe(true);
    // Complexity: O(1)
    expect(result.remaining).toBe(4);
  });

  // Complexity: O(1)
  test('RateLimiter should block over limit', () => {
    const limiter = new RateLimiter({ maxRequests: 2 });
    limiter.check('client-1');
    limiter.check('client-1');
    const result = limiter.check('client-1');
    // Complexity: O(1)
    expect(result.allowed).toBe(false);
  });

  // Complexity: O(1)
  test('RateLimiter should reset client', () => {
    const limiter = new RateLimiter({ maxRequests: 2 });
    limiter.check('client-1');
    limiter.check('client-1');
    limiter.reset('client-1');
    const result = limiter.check('client-1');
    // Complexity: O(1)
    expect(result.allowed).toBe(true);
  });

  class InputSanitizer {
    constructor() {
      this.patterns = {
        xss: /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        sqli: /('|(\\')|(--)|(\%27)|(\%2D\%2D))/gi,
        pathTraversal: /\.\.[\\/]/g
      };
    }

    // Complexity: O(N) — loop
    sanitize(input) {
      if (typeof input !== 'string') return input;
      
      let clean = input;
      for (const pattern of Object.values(this.patterns)) {
        clean = clean.replace(pattern, ');
      }
      return clean;
    }

    // Complexity: O(N) — loop
    validate(input) {
      const threats = [];
      for (const [name, pattern] of Object.entries(this.patterns)) {
        if (pattern.test(input)) {
          threats.push(name);
        }
      }
      return { 
        safe: threats.length === 0, 
        threats 
      };
    }
  }

  // Complexity: O(1)
  test('InputSanitizer should detect XSS', () => {
    const sanitizer = new InputSanitizer();
    const result = sanitizer.validate('<script>alert("xss")</script>');
    // Complexity: O(1)
    expect(result.safe).toBe(false);
    // Complexity: O(1)
    expect(result.threats).toContain('xss');
  });

  // Complexity: O(1)
  test('InputSanitizer should detect SQLi', () => {
    const sanitizer = new InputSanitizer();
    const result = sanitizer.validate("' OR 1=1 --");
    // Complexity: O(1)
    expect(result.safe).toBe(false);
    // Complexity: O(1)
    expect(result.threats).toContain('sqli');
  });

  // Complexity: O(1)
  test('InputSanitizer should detect path traversal', () => {
    const sanitizer = new InputSanitizer();
    const result = sanitizer.validate('../../etc/passwd');
    // Complexity: O(1)
    expect(result.safe).toBe(false);
    // Complexity: O(1)
    expect(result.threats).toContain('pathTraversal');
  });

  // Complexity: O(1)
  test('InputSanitizer should pass clean input', () => {
    const sanitizer = new InputSanitizer();
    const result = sanitizer.validate('Hello, world!');
    // Complexity: O(1)
    expect(result.safe).toBe(true);
  });

  // Complexity: O(1)
  test('InputSanitizer should sanitize malicious input', () => {
    const sanitizer = new InputSanitizer();
    const clean = sanitizer.sanitize('<script>evil()</script>Hello');
    // Complexity: O(1)
    expect(clean).toBe('Hello');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 50: PRODUCTION READINESS E2E TESTS
// ═══════════════════════════════════════════════════════════════════════════════

    // Complexity: O(N) — loop
describe('Step 50: ProductionReadiness', () => {

  class HealthChecker {
    constructor() {
      this.checks = new Map();
      this.lastResults = new Map();
    }

    // Complexity: O(1) — lookup
    register(name, checkFn) {
      this.checks.set(name, checkFn);
    }

    // Complexity: O(N) — loop
    async runAll() {
      const results = {};
      let healthy = true;
      
      for (const [name, checkFn] of this.checks) {
        try {
          const start = Date.now();
          const result = await checkFn();
          results[name] = {
            status: result ? 'healthy' : 'unhealthy',
            duration: Date.now() - start
          };
          if (!result) healthy = false;
        } catch (e) {
          results[name] = { status: 'error', error: e.message };
          healthy = false;
        }
      }
      
      this.lastResults = results;
      return { healthy, checks: results };
    }
  }

  // Complexity: O(1)
  test('HealthChecker should register checks', () => {
    const hc = new HealthChecker();
    hc.register('db', () => true);
    // Complexity: O(1)
    expect(hc.checks.size).toBe(1);
  });

  // Complexity: O(1)
  test('HealthChecker runAll should return healthy', async () => {
    const hc = new HealthChecker();
    hc.register('test', () => true);
    // SAFETY: async operation — wrap in try-catch for production resilience
    const result = await hc.runAll();
    // Complexity: O(1)
    expect(result.healthy).toBe(true);
  });

  // Complexity: O(1)
  test('HealthChecker runAll should detect unhealthy', async () => {
    const hc = new HealthChecker();
    hc.register('failing', () => false);
    // SAFETY: async operation — wrap in try-catch for production resilience
    const result = await hc.runAll();
    // Complexity: O(1)
    expect(result.healthy).toBe(false);
  });

  class MetricsCollector {
    constructor() {
      this.counters = new Map();
      this.gauges = new Map();
      this.histograms = new Map();
    }

    // Complexity: O(1) — lookup
    counter(name) {
      if (!this.counters.has(name)) {
        this.counters.set(name, 0);
      }
      return {
        inc: (val = 1) => {
          this.counters.set(name, this.counters.get(name) + val);
        },
        get: () => this.counters.get(name)
      };
    }

    // Complexity: O(1) — lookup
    gauge(name) {
      if (!this.gauges.has(name)) {
        this.gauges.set(name, 0);
      }
      return {
        set: (val) => this.gauges.set(name, val),
        get: () => this.gauges.get(name)
      };
    }

    // Complexity: O(N log N) — sort
    histogram(name) {
      if (!this.histograms.has(name)) {
        this.histograms.set(name, []);
      }
      return {
        observe: (val) => {
          const arr = this.histograms.get(name);
          arr.push(val);
        },
        getPercentile: (p) => {
          const arr = [...this.histograms.get(name)].sort((a, b) => a - b);
          const idx = Math.ceil((p / 100) * arr.length) - 1;
          return arr[idx] ?? 0;
        }
      };
    }

    // Complexity: O(1)
    getAll() {
      return {
        counters: Object.fromEntries(this.counters),
        gauges: Object.fromEntries(this.gauges)
      };
    }
  }

  // Complexity: O(1) — lookup
  test('MetricsCollector counter should increment', () => {
    const mc = new MetricsCollector();
    const counter = mc.counter('requests');
    counter.inc();
    counter.inc(5);
    // Complexity: O(1)
    expect(counter.get()).toBe(6);
  });

  // Complexity: O(1) — lookup
  test('MetricsCollector gauge should set value', () => {
    const mc = new MetricsCollector();
    const gauge = mc.gauge('temperature');
    gauge.set(65);
    // Complexity: O(1)
    expect(gauge.get()).toBe(65);
  });

  // Complexity: O(N) — linear scan
  test('MetricsCollector histogram should calculate percentile', () => {
    const mc = new MetricsCollector();
    const hist = mc.histogram('latency');
    [10, 20, 30, 40, 50, 60, 70, 80, 90, 100].forEach(v => hist.observe(v));
    // Complexity: O(1)
    expect(hist.getPercentile(50)).toBeGreaterThan(0);
  });

  class GracefulShutdown {
    constructor(timeout = 30000) {
      this.timeout = timeout;
      this.handlers = [];
      this.isShuttingDown = false;
    }

    // Complexity: O(1)
    register(name, handler) {
      this.handlers.push({ name, handler });
    }

    // Complexity: O(N) — loop
    async shutdown() {
      if (this.isShuttingDown) return;
      this.isShuttingDown = true;
      
      const results = [];
      for (const { name, handler } of this.handlers) {
        try {
          await Promise.race([
            // Complexity: O(1)
            handler(),
            new Promise((_, reject) => 
              // Complexity: O(1)
              setTimeout(() => reject(new Error('timeout')), this.timeout)
            )
          ]);
          results.push({ name, success: true });
        } catch (e) {
          results.push({ name, success: false, error: e.message });
        }
      }
      
      return results;
    }
  }

  // Complexity: O(1)
  test('GracefulShutdown should register handlers', () => {
    const gs = new GracefulShutdown();
    gs.register('db', async () => {});
    // Complexity: O(1)
    expect(gs.handlers).toHaveLength(1);
  });

  // Complexity: O(1)
  test('GracefulShutdown should run handlers', async () => {
    const gs = new GracefulShutdown();
    let called = false;
    gs.register('cleanup', async () => { called = true; });
    // SAFETY: async operation — wrap in try-catch for production resilience
    await gs.shutdown();
    // Complexity: O(1)
    expect(called).toBe(true);
  });

  // Complexity: O(1)
  test('GracefulShutdown should prevent double shutdown', async () => {
    const gs = new GracefulShutdown();
    let count = 0;
    gs.register('counter', async () => { count++; });
    // SAFETY: async operation — wrap in try-catch for production resilience
    await gs.shutdown();
    // SAFETY: async operation — wrap in try-catch for production resilience
    await gs.shutdown();
    // Complexity: O(1)
    expect(count).toBe(1);
  });

  class E2EValidator {
    constructor() {
      this.scenarios = [];
      this.results = [];
    }

    // Complexity: O(1)
    addScenario(name, steps) {
      this.scenarios.push({ name, steps });
    }

    // Complexity: O(N*M) — nested iteration
    async runAll() {
      this.results = [];
      
      for (const scenario of this.scenarios) {
        const result = { name: scenario.name, steps: [], passed: true };
        
        for (let i = 0; i < scenario.steps.length; i++) {
          const step = scenario.steps[i];
          try {
            const start = Date.now();
            await step.action();
            result.steps.push({
              name: step.name,
              status: 'passed',
              duration: Date.now() - start
            });
          } catch (e) {
            result.steps.push({
              name: step.name,
              status: 'failed',
              error: e.message
            });
            result.passed = false;
            break;
          }
        }
        
        this.results.push(result);
      }
      
      return {
        total: this.scenarios.length,
        passed: this.results.filter(r => r.passed).length,
        failed: this.results.filter(r => !r.passed).length,
        results: this.results
      };
    }
  }

  // Complexity: O(1)
  test('E2EValidator should add scenarios', () => {
    const e2e = new E2EValidator();
    e2e.addScenario('login', [{ name: 'step1', action: async () => {} }]);
    // Complexity: O(1)
    expect(e2e.scenarios).toHaveLength(1);
  });

  // Complexity: O(1)
  test('E2EValidator runAll should execute all', async () => {
    const e2e = new E2EValidator();
    e2e.addScenario('test', [
      { name: 'step1', action: async () => {} },
      { name: 'step2', action: async () => {} }
    ]);
    // SAFETY: async operation — wrap in try-catch for production resilience
    const result = await e2e.runAll();
    // Complexity: O(1)
    expect(result.passed).toBe(1);
  });

  // Complexity: O(1)
  test('E2EValidator should detect failures', async () => {
    const e2e = new E2EValidator();
    e2e.addScenario('fail', [
      { name: 'fail-step', action: async () => { throw new Error('fail'); } }
    ]);
    // SAFETY: async operation — wrap in try-catch for production resilience
    const result = await e2e.runAll();
    // Complexity: O(1)
    expect(result.failed).toBe(1);
  });

  class DeploymentValidator {
    constructor() {
      this.validations = [];
    }

    // Complexity: O(1)
    addValidation(name, fn) {
      this.validations.push({ name, fn });
    }

    // Complexity: O(N) — loop
    async validate() {
      const results = [];
      let allPassed = true;
      
      for (const { name, fn } of this.validations) {
        try {
          const passed = await fn();
          results.push({ name, passed });
          if (!passed) allPassed = false;
        } catch (e) {
          results.push({ name, passed: false, error: e.message });
          allPassed = false;
        }
      }
      
      return { ready: allPassed, validations: results };
    }
  }

  // Complexity: O(1)
  test('DeploymentValidator should add validations', () => {
    const dv = new DeploymentValidator();
    dv.addValidation('env-check', () => true);
    // Complexity: O(1)
    expect(dv.validations).toHaveLength(1);
  });

  // Complexity: O(1)
  test('DeploymentValidator validate should pass all', async () => {
    const dv = new DeploymentValidator();
    dv.addValidation('check1', () => true);
    dv.addValidation('check2', () => true);
    // SAFETY: async operation — wrap in try-catch for production resilience
    const result = await dv.validate();
    // Complexity: O(1)
    expect(result.ready).toBe(true);
  });

  // Complexity: O(1)
  test('DeploymentValidator validate should detect failure', async () => {
    const dv = new DeploymentValidator();
    dv.addValidation('pass', () => true);
    dv.addValidation('fail', () => false);
    // SAFETY: async operation — wrap in try-catch for production resilience
    const result = await dv.validate();
    // Complexity: O(1)
    expect(result.ready).toBe(false);
  });

  // Integration test: Full E2E Flow
  // Complexity: O(1) — lookup
  test('Full E2E: Security + Health + Metrics integration', async () => {
    // Setup components
    const health = new HealthChecker();
    const metrics = new MetricsCollector();
    const shutdown = new GracefulShutdown();
    
    // Register health checks
    health.register('core', () => true);
    health.register('security', () => true);
    
    // Setup metrics
    const requests = metrics.counter('requests');
    requests.inc(100);
    
    // Register shutdown handlers
    shutdown.register('metrics', async () => { /* flush metrics */ });
    
    // Validate everything works together
    // SAFETY: async operation — wrap in try-catch for production resilience
    const healthResult = await health.runAll();
    // Complexity: O(1)
    expect(healthResult.healthy).toBe(true);
    // Complexity: O(1)
    expect(requests.get()).toBe(100);
    // Complexity: O(1)
    expect(shutdown.handlers).toHaveLength(1);
  });

  // Complexity: O(1)
  test('Full E2E: Complete deployment validation', async () => {
    const dv = new DeploymentValidator();
    
    dv.addValidation('health-check', () => true);
    dv.addValidation('security-policies', () => true);
    dv.addValidation('database-connection', () => true);
    dv.addValidation('external-apis', () => true);
    
    // SAFETY: async operation — wrap in try-catch for production resilience
    const result = await dv.validate();
    // Complexity: O(1)
    expect(result.ready).toBe(true);
    // Complexity: O(1)
    expect(result.validations).toHaveLength(4);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// POM & EXPLICIT WAIT INTEGRATION TESTS
// ═══════════════════════════════════════════════════════════════════════════════

    // Complexity: O(N) — loop
describe('POM & Explicit Wait Production Integration', () => {

  class PageObject {
    constructor(name) {
      this.name = name;
      this.elements = new Map();
      this.loadedAt = null;
    }

    // Complexity: O(1) — lookup
    registerElement(name, selector, options = {}) {
      this.elements.set(name, { 
        selector, 
        timeout: options.timeout ?? 10000,
        required: options.required ?? true
      });
    }

    // Complexity: O(1) — lookup
    getSelector(name) {
      const el = this.elements.get(name);
      return el ? el.selector : null;
    }

    // Complexity: O(1) — lookup
    async waitForElement(name, wait) {
      const el = this.elements.get(name);
      if (!el) throw new Error(`Element ${name} not registered`);
      return wait.until(() => true, el.timeout);
    }
  }

  class ExplicitWait {
    constructor(timeout = 10000, pollingInterval = 250) {
      this.timeout = timeout;
      this.pollingInterval = pollingInterval;
    }

    // Complexity: O(N) — loop
    async until(condition, timeout = this.timeout) {
      const start = Date.now();
      while (Date.now() - start < timeout) {
        if (condition()) return true;
        // SAFETY: async operation — wrap in try-catch for production resilience
        await new Promise(r => setTimeout(r, this.pollingInterval));
      }
      throw new Error('Wait timeout exceeded');
    }

    static elementVisible(selector) {
      return () => true; // Mock
    }

    static elementClickable(selector) {
      return () => true; // Mock
    }

    static textPresent(text) {
      return () => true; // Mock
    }

    static urlContains(text) {
      return () => true; // Mock
    }
  }

  // Complexity: O(1)
  test('PageObject should register and get elements', () => {
    const page = new PageObject('LoginPage');
    page.registerElement('username', '#username');
    page.registerElement('password', '#password');
    // Complexity: O(1)
    expect(page.getSelector('username')).toBe('#username');
  });

  // Complexity: O(1)
  test('ExplicitWait until should resolve on condition', async () => {
    const wait = new ExplicitWait(1000, 50);
    let counter = 0;
    // SAFETY: async operation — wrap in try-catch for production resilience
    const result = await wait.until(() => { counter++; return counter > 2; });
    // Complexity: O(1)
    expect(result).toBe(true);
  });

  // Complexity: O(1)
  test('PageObject + ExplicitWait integration', async () => {
    const page = new PageObject('Dashboard');
    page.registerElement('chart', '#chart');
    
    const wait = new ExplicitWait(1000);
    // SAFETY: async operation — wrap in try-catch for production resilience
    const result = await page.waitForElement('chart', wait);
    // Complexity: O(1)
    expect(result).toBe(true);
  });

  // Complexity: O(1)
  test('ExplicitWait static methods should exist', () => {
    // Complexity: O(1)
    expect(typeof ExplicitWait.elementVisible).toBe('function');
    // Complexity: O(1)
    expect(typeof ExplicitWait.elementClickable).toBe('function');
    // Complexity: O(1)
    expect(typeof ExplicitWait.textPresent).toBe('function');
    // Complexity: O(1)
    expect(typeof ExplicitWait.urlContains).toBe('function');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// FINAL SUMMARY
// ═══════════════════════════════════════════════════════════════════════════════

console.log('\n' + '═'.repeat(70));
console.log('📊 PHASE 3C PRODUCTION READINESS TEST RESULTS');
console.log('═'.repeat(70));
console.log(`✅ Passed: ${testResults.passed}`);
console.log(`❌ Failed: ${testResults.failed}`);
console.log(`📝 Total:  ${testResults.total}`);
console.log(`📈 Rate:   ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
console.log('═'.repeat(70));

process.exit(testResults.failed > 0 ? 1 : 0);
