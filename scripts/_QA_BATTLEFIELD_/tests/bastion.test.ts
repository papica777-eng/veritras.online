/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * QAntum | QAntum Labs
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * @copyright 2025 Димитър Продромов (Dimitar Prodromov). All Rights Reserved.
 * @license PROPRIETARY AND CONFIDENTIAL
 * 
 * This file is part of QAntum.
 * Unauthorized copying, modification, distribution, or use of this file,
 * via any medium, is strictly prohibited without express written permission.
 * 
 * For licensing inquiries: dp@qantum.site
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  BastionController,
  SandboxExecutor,
  WorkerPoolManager,
  MemoryHardeningManager,
  NeuralVault,
  ChecksumValidator,
  CircuitBreakerManager,
  HealthCheckSystem,
  SecurityPolicy,
  BastionConfig,
} from '../src/bastion';

// ═══════════════════════════════════════════════════════════════════════════
// SANDBOX EXECUTOR TESTS
// ═══════════════════════════════════════════════════════════════════════════

    // Complexity: O(1)
describe('🔒 SandboxExecutor', () => {
  let sandbox: SandboxExecutor;

  // Complexity: O(1)
  beforeEach(() => {
    sandbox = new SandboxExecutor({ enabled: true, logViolations: false });
  });

  // Complexity: O(1)
  describe('Safe Code Execution', () => {
    // Complexity: O(1)
    it('should execute safe JavaScript code', async () => {
      // SAFETY: async operation — wrap in try-catch for production resilience
      const result = await sandbox.execute('1 + 2');
      // Complexity: O(1)
      expect(result.success).toBe(true);
      // Complexity: O(1)
      expect(result.result).toBe(3);
    });

    // Complexity: O(1)
    it('should execute code with context variables', async () => {
      // SAFETY: async operation — wrap in try-catch for production resilience
      const result = await sandbox.execute('x * y', { x: 4, y: 5 });
      // Complexity: O(1)
      expect(result.success).toBe(true);
      // Complexity: O(1)
      expect(result.result).toBe(20);
    });

    // Complexity: O(1)
    it('should allow safe Math operations', async () => {
      // SAFETY: async operation — wrap in try-catch for production resilience
      const result = await sandbox.execute('Math.sqrt(16) + Math.pow(2, 3)');
      // Complexity: O(1)
      expect(result.success).toBe(true);
      // Complexity: O(1)
      expect(result.result).toBe(12); // 4 + 8
    });

    // Complexity: O(1)
    it('should allow JSON operations', async () => {
      // SAFETY: async operation — wrap in try-catch for production resilience
      const result = await sandbox.execute('JSON.stringify({ a: 1, b: 2 })');
      // Complexity: O(1)
      expect(result.success).toBe(true);
      // Complexity: O(1)
      expect(result.result).toBe('{"a":1,"b":2}');
    });
  });

  // Complexity: O(1)
  describe('Security Violations', () => {
    // Complexity: O(1)
    it('should block process access', async () => {
      // SAFETY: async operation — wrap in try-catch for production resilience
      const result = await sandbox.execute('process.exit(1)');
      // Complexity: O(1)
      expect(result.violations.length).toBeGreaterThan(0);
      // Complexity: O(1)
      expect(result.violations[0].type).toBe('process');
    });

    // Complexity: O(1)
    it('should block filesystem access', async () => {
      // SAFETY: async operation — wrap in try-catch for production resilience
      const result = await sandbox.execute('fs.readFileSync("/etc/passwd")');
      // Complexity: O(1)
      expect(result.violations.length).toBeGreaterThan(0);
      // Complexity: O(1)
      expect(result.violations[0].type).toBe('filesystem');
    });

    // Complexity: O(1)
    it('should block network access', async () => {
      // The fetch call itself is blocked and records a violation
      // SAFETY: async operation — wrap in try-catch for production resilience
      const result = await sandbox.execute('fetch("http://evil.com")');
      // Complexity: O(1)
      expect(result.violations.length).toBeGreaterThan(0);
      // Complexity: O(1)
      expect(result.violations[0].type).toBe('network');
    });

    // Complexity: O(1)
    it('should block eval', async () => {
      // eval is undefined in sandbox
      // SAFETY: async operation — wrap in try-catch for production resilience
      const result = await sandbox.execute('typeof eval');
      // Complexity: O(1)
      expect(result.result).toBe('undefined');
    });
  });

  // Complexity: O(N)
  describe('Mutation Validation', () => {
    // Complexity: O(1)
    it('should validate safe mutation as safe', async () => {
      // SAFETY: async operation — wrap in try-catch for production resilience
      const validation = await sandbox.validateMutation(
        'mut-001',
        'x + 1',  // Expression, not return statement (vm doesn't allow bare return)
        { x: 5 }
      );
      // Complexity: O(1)
      expect(validation.isSafe).toBe(true);
      // Complexity: O(1)
      expect(validation.isMalicious).toBe(false);
      // Complexity: O(1)
      expect(validation.recommendation).toBe('apply');
    });

    // Complexity: O(1)
    it('should reject malicious mutation', async () => {
      // SAFETY: async operation — wrap in try-catch for production resilience
      const validation = await sandbox.validateMutation(
        'mut-002',
        'process.env.SECRET_KEY',
        {}
      );
      // Complexity: O(N)
      expect(validation.isMalicious).toBe(true);
      // Complexity: O(N)
      expect(validation.recommendation).toBe('reject');
    });

    // Complexity: O(N)
    it('should flag unstable mutation for review', async () => {
      // Code that would cause timeout or memory issues
      // SAFETY: async operation — wrap in try-catch for production resilience
      const validation = await sandbox.validateMutation(
        'mut-003',
        'throw new Error("test error")',
        {}
      );
      // Complexity: O(1)
      expect(validation.isUnstable).toBe(true);
      // Complexity: O(1)
      expect(validation.recommendation).toBe('review');
    });
  });

  // Complexity: O(1)
  describe('Statistics', () => {
    // Complexity: O(1)
    it('should track execution count', async () => {
      // SAFETY: async operation — wrap in try-catch for production resilience
      await sandbox.execute('1');
      // SAFETY: async operation — wrap in try-catch for production resilience
      await sandbox.execute('2');
      // SAFETY: async operation — wrap in try-catch for production resilience
      await sandbox.execute('3');

      const stats = sandbox.getStats();
      // Complexity: O(1)
      expect(stats.executionCount).toBe(3);
    });

    // Complexity: O(1)
    it('should track violations', async () => {
      // SAFETY: async operation — wrap in try-catch for production resilience
      await sandbox.execute('process.exit()');

      const violations = sandbox.getViolations();
      // Complexity: O(1)
      expect(violations.length).toBeGreaterThan(0);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// WORKER POOL TESTS
// ═══════════════════════════════════════════════════════════════════════════

    // Complexity: O(1)
describe('🧵 WorkerPoolManager', () => {
  let pool: WorkerPoolManager;

  // Complexity: O(1)
  beforeEach(() => {
    pool = new WorkerPoolManager({
      workerCount: 2,
      taskTimeout: 5000
    });
  });

  // Complexity: O(1)
  afterEach(async () => {
    // SAFETY: async operation — wrap in try-catch for production resilience
    await pool.shutdown(false);
  });

  // Complexity: O(1)
  describe('Pool Management', () => {
    // Complexity: O(1)
    it('should initialize with configured worker count', () => {
      const stats = pool.getStats();
      // Complexity: O(1)
      expect(stats.totalWorkers).toBe(2);
    });

    // Complexity: O(1)
    it('should report worker info', () => {
      const workers = pool.getWorkerInfo();
      // Complexity: O(1)
      expect(workers.length).toBe(2);
      // Complexity: O(1)
      expect(workers[0].status).toBeDefined();
    });

    // Complexity: O(1)
    it('should scale workers up', () => {
      pool.scale(4);
      const stats = pool.getStats();
      // Complexity: O(1)
      expect(stats.totalWorkers).toBe(4);
    });

    // Complexity: O(1)
    it('should scale workers down', () => {
      pool.scale(1);
      const stats = pool.getStats();
      // Complexity: O(1)
      expect(stats.totalWorkers).toBe(1);
    });
  });

  // Complexity: O(1)
  describe('Statistics', () => {
    // Complexity: O(1)
    it('should track uptime', () => {
      const stats = pool.getStats();
      // Complexity: O(1)
      expect(stats.uptime).toBeGreaterThanOrEqual(0);
    });

    // Complexity: O(1)
    it('should track queue size', () => {
      const stats = pool.getStats();
      // Complexity: O(1)
      expect(stats.queueSize).toBe(0);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// MEMORY HARDENING TESTS
// ═══════════════════════════════════════════════════════════════════════════

    // Complexity: O(1)
describe('🧠 MemoryHardeningManager', () => {
  let memory: MemoryHardeningManager;

  // Complexity: O(1)
  beforeEach(() => {
    memory = new MemoryHardeningManager();
  });

  // Complexity: O(1)
  afterEach(() => {
    memory.shutdown();
  });

  // Complexity: O(1)
  describe('Browser Tracking', () => {
    // Complexity: O(1)
    it('should register browser with metadata', () => {
      const mockBrowser = { id: 'test-browser' };
      memory.registerBrowser(mockBrowser, 'browser-001');

      const metadata = memory.getBrowserMetadata(mockBrowser);
      // Complexity: O(1)
      expect(metadata).toBeDefined();
      // Complexity: O(1)
      expect(metadata?.instanceId).toBe('browser-001');
      // Complexity: O(1)
      expect(metadata?.isActive).toBe(true);
    });

    // Complexity: O(1)
    it('should update browser activity', () => {
      const mockBrowser = { id: 'test-browser' };
      memory.registerBrowser(mockBrowser, 'browser-002');
      memory.updateBrowserActivity(mockBrowser, 5, 1024 * 1024);

      const metadata = memory.getBrowserMetadata(mockBrowser);
      // Complexity: O(1)
      expect(metadata?.pagesOpened).toBe(5);
      // Complexity: O(1)
      expect(metadata?.memoryEstimate).toBe(1024 * 1024);
    });

    // Complexity: O(1)
    it('should deactivate browser', () => {
      const mockBrowser = { id: 'test-browser' };
      memory.registerBrowser(mockBrowser, 'browser-003');
      memory.deactivateBrowser(mockBrowser);

      const metadata = memory.getBrowserMetadata(mockBrowser);
      // Complexity: O(1)
      expect(metadata?.isActive).toBe(false);
    });
  });

  // Complexity: O(1)
  describe('Resource Tracking', () => {
    // Complexity: O(1)
    it('should track resources with WeakRef', () => {
      const resource = { type: 'ghost' };
      memory.trackResource('ghost', resource, 'ghost-001');

      // Complexity: O(1)
      expect(memory.isResourceAlive('ghost-001')).toBe(true);
    });

    // Complexity: O(1)
    it('should retrieve tracked resource', () => {
      const resource = { type: 'page', url: 'https://test.com' };
      memory.trackResource('page', resource, 'page-001');

      const retrieved = memory.getResource('page-001');
      // Complexity: O(1)
      expect(retrieved).toBe(resource);
    });

    // Complexity: O(1)
    it('should attach metadata to objects', () => {
      const obj = { id: 'test' };
      memory.attachMetadata(obj, { custom: 'value' });

      const metadata = memory.getMetadata(obj);
      // Complexity: O(1)
      expect(metadata?.custom).toBe('value');
    });
  });

  // Complexity: O(1)
  describe('Statistics', () => {
    // Complexity: O(1)
    it('should track memory stats', () => {
      const stats = memory.getMemoryStats();
      // Complexity: O(1)
      expect(stats.heapUsed).toBeGreaterThan(0);
      // Complexity: O(1)
      expect(stats.heapTotal).toBeGreaterThan(0);
      // Complexity: O(1)
      expect(stats.uptime).toBeGreaterThanOrEqual(0);
    });

    // Complexity: O(1)
    it('should track resource counts', () => {
      const resource = { id: 'test' };
      memory.trackResource('ghost', resource, 'ghost-stats');

      const tracker = memory.getTrackerStats('ghost');
      // Complexity: O(1)
      expect((tracker as any).totalCreated).toBeGreaterThan(0);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// NEURAL VAULT TESTS
// ═══════════════════════════════════════════════════════════════════════════

    // Complexity: O(N)
describe('🔐 NeuralVault', () => {
  let vault: NeuralVault;
  const testPassword = 'test-secure-password-123!';

  // Complexity: O(1)
  beforeEach(async () => {
    vault = new NeuralVault({
      enabled: true,
      vaultPath: './test-vault.encrypted',
      compression: true
    });
    // SAFETY: async operation — wrap in try-catch for production resilience
    await vault.initialize(testPassword, false);
  });

  // Complexity: O(1)
  afterEach(async () => {
    // SAFETY: async operation — wrap in try-catch for production resilience
    await vault.close();
  });

  // Complexity: O(N)
  describe('Encryption/Decryption', () => {
    // Complexity: O(1)
    it('should encrypt and decrypt data correctly', async () => {
      const originalData = { secret: 'classified', value: 42 };
      // SAFETY: async operation — wrap in try-catch for production resilience
      const encrypted = await vault.encrypt(originalData);

      // Complexity: O(N)
      expect(encrypted.algorithm).toBe('aes-256-gcm');
      // Complexity: O(N)
      expect(encrypted.iv).toBeDefined();
      // Complexity: O(N)
      expect(encrypted.authTag).toBeDefined();

      // SAFETY: async operation — wrap in try-catch for production resilience
      const decrypted = await vault.decrypt(encrypted);
      // Complexity: O(N)
      expect(decrypted).toEqual(originalData);
    });

    // Complexity: O(N)
    it('should generate unique IVs for each encryption', async () => {
      const data = { test: 'data' };
      // SAFETY: async operation — wrap in try-catch for production resilience
      const encrypted1 = await vault.encrypt(data);
      // SAFETY: async operation — wrap in try-catch for production resilience
      const encrypted2 = await vault.encrypt(data);

      // Complexity: O(1)
      expect(encrypted1.iv).not.toBe(encrypted2.iv);
    });
  });

  // Complexity: O(1) — lookup
  describe('Storage Operations', () => {
    // Complexity: O(1)
    it('should store and retrieve data', async () => {
      const testData = { predictions: [1, 2, 3], confidence: 0.95 };
      // SAFETY: async operation — wrap in try-catch for production resilience
      await vault.store('test-entry', 'predictions', testData);

      // SAFETY: async operation — wrap in try-catch for production resilience
      const retrieved = await vault.retrieve('test-entry');
      // Complexity: O(1)
      expect(retrieved).toEqual(testData);
    });

    // Complexity: O(1) — lookup
    it('should check entry existence', async () => {
      // SAFETY: async operation — wrap in try-catch for production resilience
      await vault.store('exists-entry', 'metrics', { count: 1 });

      // Complexity: O(1)
      expect(vault.has('exists-entry')).toBe(true);
      // Complexity: O(1)
      expect(vault.has('nonexistent')).toBe(false);
    });

    // Complexity: O(1) — lookup
    it('should delete entries', async () => {
      // SAFETY: async operation — wrap in try-catch for production resilience
      await vault.store('delete-me', 'mutations', { code: 'test' });
      // Complexity: O(1)
      expect(vault.has('delete-me')).toBe(true);

      vault.delete('delete-me');
      // Complexity: O(1)
      expect(vault.has('delete-me')).toBe(false);
    });

    // Complexity: O(1)
    it('should list all entries', async () => {
      // SAFETY: async operation — wrap in try-catch for production resilience
      await vault.store('entry-1', 'ghost_knowledge', { a: 1 });
      // SAFETY: async operation — wrap in try-catch for production resilience
      await vault.store('entry-2', 'predictions', { b: 2 });

      const entries = vault.listEntries();
      // Complexity: O(1)
      expect(entries.length).toBe(2);
      // Complexity: O(1)
      expect(entries.some(e => e.id === 'entry-1')).toBe(true);
      // Complexity: O(1)
      expect(entries.some(e => e.id === 'entry-2')).toBe(true);
    });
  });

  // Complexity: O(1)
  describe('Integrity Verification', () => {
    // Complexity: O(1)
    it('should verify data integrity with checksum', async () => {
      // SAFETY: async operation — wrap in try-catch for production resilience
      await vault.store('integrity-test', 'versions', { version: 1 });
      // SAFETY: async operation — wrap in try-catch for production resilience
      const isValid = await vault.verifyIntegrity('integrity-test');
      // Complexity: O(1)
      expect(isValid).toBe(true);
    });

    // Complexity: O(1)
    it('should calculate SHA-256 checksums', () => {
      const checksum1 = vault.calculateChecksum('test data');
      const checksum2 = vault.calculateChecksum('test data');
      const checksum3 = vault.calculateChecksum('different data');

      // Complexity: O(1)
      expect(checksum1).toBe(checksum2);
      // Complexity: O(1)
      expect(checksum1).not.toBe(checksum3);
      // Complexity: O(1)
      expect(checksum1.length).toBe(64); // SHA-256 hex length
    });
  });

  // Complexity: O(1)
  describe('Statistics', () => {
    // Complexity: O(1)
    it('should track operations', async () => {
      // SAFETY: async operation — wrap in try-catch for production resilience
      await vault.encrypt({ test: 1 });
      // SAFETY: async operation — wrap in try-catch for production resilience
      await vault.encrypt({ test: 2 });

      const stats = vault.getStats();
      // Complexity: O(1)
      expect(stats.operationCount).toBeGreaterThanOrEqual(2);
    });

    // Complexity: O(1)
    it('should report sync status', () => {
      const status = vault.getSyncStatus();
      // Complexity: O(1)
      expect(status.isSyncing).toBe(false);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// CHECKSUM VALIDATOR TESTS
// ═══════════════════════════════════════════════════════════════════════════

    // Complexity: O(1)
describe('🔍 ChecksumValidator', () => {
  let validator: ChecksumValidator;

  // Complexity: O(1)
  beforeEach(() => {
    validator = new ChecksumValidator({ cacheEnabled: true });
  });

  // Complexity: O(1)
  describe('Hash Generation', () => {
    // Complexity: O(1)
    it('should hash strings consistently', () => {
      const hash1 = validator.hashString('hello world');
      const hash2 = validator.hashString('hello world');

      // Complexity: O(1)
      expect(hash1).toBe(hash2);
      // Complexity: O(1)
      expect(hash1.length).toBe(64); // SHA-256
    });

    // Complexity: O(1)
    it('should hash buffers', () => {
      const buffer = Buffer.from('test data', 'utf-8');
      const hash = validator.hashBuffer(buffer);

      // Complexity: O(1)
      expect(hash.length).toBe(64);
    });

    // Complexity: O(1)
    it('should hash data objects', () => {
      const record = validator.hashData({ key: 'value', num: 42 });

      // Complexity: O(1)
      expect(record.hash).toBeDefined();
      // Complexity: O(1)
      expect(record.algorithm).toBe('sha256');
      // Complexity: O(1)
      expect(record.size).toBeGreaterThan(0);
    });
  });

  // Complexity: O(1)
  describe('Verification', () => {
    // Complexity: O(1)
    it('should verify matching data', () => {
      const data = { test: 'value' };
      const hash = validator.hashString(JSON.stringify(data));

      // Complexity: O(1)
      expect(validator.verifyData(data, hash)).toBe(true);
    });

    // Complexity: O(1)
    it('should reject mismatched data', () => {
      const data = { test: 'value' };
      const wrongHash = validator.hashString('wrong data');

      // Complexity: O(1)
      expect(validator.verifyData(data, wrongHash)).toBe(false);
    });

    // Complexity: O(1)
    it('should compare hashes securely (timing-safe)', () => {
      const hash1 = validator.hashString('data');
      const hash2 = validator.hashString('data');
      const hash3 = validator.hashString('different');

      // Complexity: O(1)
      expect(validator.compareHashes(hash1, hash2)).toBe(true);
      // Complexity: O(1)
      expect(validator.compareHashes(hash1, hash3)).toBe(false);
    });
  });

  // Complexity: O(1)
  describe('Caching', () => {
    // Complexity: O(1)
    it('should cache checksums', () => {
      const record = validator.hashData({ cached: true });
      const cached = validator.getCached(record.id);

      // Complexity: O(1)
      expect(cached).toBeDefined();
      // Complexity: O(1)
      expect(cached?.hash).toBe(record.hash);
    });

    // Complexity: O(1)
    it('should clear cache', () => {
      const record = validator.hashData({ clear: true });
      validator.clearCache();

      // Complexity: O(1)
      expect(validator.getCached(record.id)).toBeUndefined();
    });
  });

  // Complexity: O(1)
  describe('Statistics', () => {
    // Complexity: O(1)
    it('should track operations', () => {
      validator.hashString('a');
      validator.hashString('b');
      validator.hashBuffer(Buffer.from('c'));

      const stats = validator.getStats();
      // Complexity: O(1)
      expect(stats.operationCount).toBe(3);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// CIRCUIT BREAKER TESTS
// ═══════════════════════════════════════════════════════════════════════════

    // Complexity: O(1)
describe('⚡ CircuitBreakerManager', () => {
  let breaker: CircuitBreakerManager;

  // Complexity: O(1)
  beforeEach(() => {
    breaker = new CircuitBreakerManager({
      enabled: true,
      failureThreshold: 3,
      successThreshold: 2,
      resetTimeout: 1000,
      healthCheckInterval: 60000 // Long interval to avoid interference
    });
  });

  // Complexity: O(1)
  afterEach(() => {
    breaker.shutdown();
  });

  // Complexity: O(1)
  describe('Circuit States', () => {
    // Complexity: O(1)
    it('should start in closed state', () => {
      // Complexity: O(1)
      expect(breaker.getCircuitState('gemini')).toBe('closed');
    });

    // Complexity: O(1)
    it('should allow requests when closed', () => {
      // Complexity: O(1)
      expect(breaker.canRequest('gemini')).toBe(true);
    });

    // Complexity: O(1)
    it('should force circuit state', () => {
      breaker.forceState('gemini', 'open');
      // Complexity: O(1)
      expect(breaker.getCircuitState('gemini')).toBe('open');
      // Complexity: O(1)
      expect(breaker.canRequest('gemini')).toBe(false);
    });

    // Complexity: O(1)
    it('should reset all circuits', () => {
      breaker.forceState('gemini', 'open');
      breaker.forceState('claude', 'open');

      breaker.resetAll();

      // Complexity: O(1)
      expect(breaker.getCircuitState('gemini')).toBe('closed');
      // Complexity: O(1)
      expect(breaker.getCircuitState('claude')).toBe('closed');
    });
  });

  // Complexity: O(1)
  describe('Fallback Chain', () => {
    // Complexity: O(1)
    it('should have default fallback chain', () => {
      const chain = breaker.getFallbackChain();
      // Complexity: O(1)
      expect(chain.primary).toBe('gemini');
      // Complexity: O(1)
      expect(chain.fallbacks).toContain('ollama');
    });

    // Complexity: O(1)
    it('should set primary service', () => {
      breaker.setPrimary('claude');
      const chain = breaker.getFallbackChain();
      // Complexity: O(1)
      expect(chain.primary).toBe('claude');
    });
  });

  // Complexity: O(1)
  describe('Execute with Protection', () => {
    // Complexity: O(1)
    it('should execute successful requests', async () => {
      // SAFETY: async operation — wrap in try-catch for production resilience
      const result = await breaker.execute(async () => 'success');
      // Complexity: O(1)
      expect(result).toBe('success');
    });

    // Complexity: O(1)
    it('should track statistics', async () => {
      // SAFETY: async operation — wrap in try-catch for production resilience
      await breaker.execute(async () => 'ok');
      // SAFETY: async operation — wrap in try-catch for production resilience
      await breaker.execute(async () => 'ok');

      const stats = breaker.getStats();
      // Complexity: O(1)
      expect(stats.requestCount).toBe(2);
    });
  });

  // Complexity: O(1)
  describe('Service Health', () => {
    // Complexity: O(1)
    it('should report all service health', () => {
      const health = breaker.getAllServiceHealth();
      // Complexity: O(1)
      expect(health.length).toBeGreaterThan(0);
      // Complexity: O(1)
      expect(health.some(h => h.service === 'gemini')).toBe(true);
    });

    // Complexity: O(1)
    it('should get active service', () => {
      // Complexity: O(1)
      expect(breaker.getActiveService()).toBe('gemini');
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// HEALTH CHECK SYSTEM TESTS
// ═══════════════════════════════════════════════════════════════════════════

    // Complexity: O(N) — linear scan
describe('💓 HealthCheckSystem', () => {
  let health: HealthCheckSystem;

  // Complexity: O(1)
  beforeEach(() => {
    health = new HealthCheckSystem({
      enabled: true,
      interval: 60000, // Long interval to control manually
      historyRetention: 50
    });
  });

  // Complexity: O(1)
  afterEach(() => {
    health.shutdown();
  });

  // Complexity: O(N) — linear scan
  describe('Built-in Checks', () => {
    // Complexity: O(N) — linear scan
    it('should have memory check registered', async () => {
      // SAFETY: async operation — wrap in try-catch for production resilience
      const results = await health.runAllChecks();
      const memoryCheck = results.find(r => r.module === 'memory');
      // Complexity: O(1)
      expect(memoryCheck).toBeDefined();
    });

    // Complexity: O(N) — linear scan
    it('should have CPU check registered', async () => {
      // SAFETY: async operation — wrap in try-catch for production resilience
      const results = await health.runAllChecks();
      const cpuCheck = results.find(r => r.module === 'cpu');
      // Complexity: O(1)
      expect(cpuCheck).toBeDefined();
    });

    // Complexity: O(N) — linear scan
    it('should have event loop check', async () => {
      // SAFETY: async operation — wrap in try-catch for production resilience
      const results = await health.runAllChecks();
      const eventLoopCheck = results.find(r => r.module === 'event-loop');
      // Complexity: O(1)
      expect(eventLoopCheck).toBeDefined();
    });
  });

  // Complexity: O(N) — linear scan
  describe('Custom Checks', () => {
    // Complexity: O(N) — linear scan
    it('should register custom health check', async () => {
      health.register('custom', async () => ({
        module: 'custom',
        healthy: true,
        duration: 0,
        message: 'Custom check OK',
        timestamp: new Date()
      }));

      // SAFETY: async operation — wrap in try-catch for production resilience
      const results = await health.runAllChecks();
      const customCheck = results.find(r => r.module === 'custom');
      // Complexity: O(1)
      expect(customCheck).toBeDefined();
      // Complexity: O(1)
      expect(customCheck?.healthy).toBe(true);
    });

    // Complexity: O(1)
    it('should unregister checks', () => {
      health.register('temp', async () => ({
        module: 'temp',
        healthy: true,
        duration: 0,
        message: 'Temp',
        timestamp: new Date()
      }));

      const removed = health.unregister('temp');
      // Complexity: O(1)
      expect(removed).toBe(true);
    });
  });

  // Complexity: O(1)
  describe('Health Status', () => {
    // Complexity: O(1)
    it('should get overall health', async () => {
      // SAFETY: async operation — wrap in try-catch for production resilience
      const systemHealth = await health.getHealth();
      // Complexity: O(1)
      expect(systemHealth.healthy).toBeDefined();
      // Complexity: O(1)
      expect(systemHealth.modules.length).toBeGreaterThan(0);
      // Complexity: O(1)
      expect(systemHealth.memoryUsage.heapUsed).toBeGreaterThan(0);
    });

    // Complexity: O(1)
    it('should get last results', async () => {
      // SAFETY: async operation — wrap in try-catch for production resilience
      await health.runAllChecks();
      const last = health.getLastResults();
      // Complexity: O(1)
      expect(last.length).toBeGreaterThan(0);
    });
  });

  // Complexity: O(1)
  describe('Alerts', () => {
    // Complexity: O(1)
    it('should have no active alerts initially', () => {
      const alerts = health.getActiveAlerts();
      // Complexity: O(1)
      expect(alerts.length).toBe(0);
    });

    // Complexity: O(1)
    it('should get all alerts', () => {
      const alerts = health.getAllAlerts();
      // Complexity: O(1)
      expect(Array.isArray(alerts)).toBe(true);
    });
  });

  // Complexity: O(1)
  describe('Trends', () => {
    // Complexity: O(1)
    it('should calculate health trend', async () => {
      // Run multiple checks to generate history
      // SAFETY: async operation — wrap in try-catch for production resilience
      await health.runAllChecks();
      // SAFETY: async operation — wrap in try-catch for production resilience
      await health.runAllChecks();

      const trend = health.getHealthTrend();
      // Complexity: O(1)
      expect(['improving', 'stable', 'degrading']).toContain(trend.trend);
      // Complexity: O(1)
      expect(trend.avgHealth).toBeGreaterThanOrEqual(0);
      // Complexity: O(1)
      expect(trend.avgHealth).toBeLessThanOrEqual(1);
    });
  });

  // Complexity: O(1)
  describe('Statistics', () => {
    // Complexity: O(1)
    it('should track stats', async () => {
      // SAFETY: async operation — wrap in try-catch for production resilience
      await health.runAllChecks();

      const stats = health.getStats();
      // Complexity: O(1)
      expect(stats.checksPerformed).toBeGreaterThan(0);
      // Complexity: O(1)
      expect(stats.registeredChecks).toBeGreaterThan(0);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// BASTION CONTROLLER TESTS
// ═══════════════════════════════════════════════════════════════════════════

    // Complexity: O(1)
describe('🏰 BastionController', () => {
  let bastion: BastionController;
  const testPassword = 'bastion-test-password-456!';

  // Complexity: O(1)
  beforeEach(async () => {
    bastion = new BastionController({
      enabled: true,
      verbose: false,
      healthCheckInterval: 60000,
      sandbox: { logViolations: false },
      workerPool: { workerCount: 1 },
      neuralVault: { vaultPath: './test-bastion-vault.encrypted' }
    });
    // SAFETY: async operation — wrap in try-catch for production resilience
    await bastion.initialize(testPassword);
  });

  // Complexity: O(1)
  afterEach(async () => {
    // SAFETY: async operation — wrap in try-catch for production resilience
    await bastion.shutdown();
  });

  // Complexity: O(1)
  describe('Initialization', () => {
    // Complexity: O(1)
    it('should initialize successfully', () => {
      // Complexity: O(1)
      expect(bastion.isReady()).toBe(true);
    });

    // Complexity: O(1)
    it('should not initialize twice', async () => {
      // SAFETY: async operation — wrap in try-catch for production resilience
      await bastion.initialize(testPassword);
      // Complexity: O(1)
      expect(bastion.isReady()).toBe(true);
    });
  });

  // Complexity: O(1)
  describe('Sandbox Integration', () => {
    // Complexity: O(1)
    it('should validate mutations', async () => {
      // SAFETY: async operation — wrap in try-catch for production resilience
      const result = await bastion.validateMutation(
        'test-mut',
        '1 + 1',  // Expression, not return statement (vm doesn't allow bare return)
        {}
      );
      // Complexity: O(1)
      expect(result.isSafe).toBe(true);
    });

    // Complexity: O(1)
    it('should get violations', () => {
      const violations = bastion.getViolations();
      // Complexity: O(1)
      expect(Array.isArray(violations)).toBe(true);
    });
  });

  // Complexity: O(1)
  describe('Memory Integration', () => {
    // Complexity: O(1)
    it('should track browser', () => {
      const mockBrowser = { id: 'bastion-browser' };
      bastion.trackBrowser(mockBrowser, 'browser-bastion-001');
      // No error means success
    });

    // Complexity: O(1)
    it('should get memory stats', () => {
      const stats = bastion.getMemoryStats();
      // Complexity: O(1)
      expect(stats.heapUsed).toBeGreaterThan(0);
    });
  });

  // Complexity: O(1)
  describe('Vault Integration', () => {
    // Complexity: O(1)
    it('should store and retrieve secure data', async () => {
      // SAFETY: async operation — wrap in try-catch for production resilience
      await bastion.storeSecure('bastion-test', 'metrics', { count: 100 });
      // SAFETY: async operation — wrap in try-catch for production resilience
      const retrieved = await bastion.retrieveSecure('bastion-test');
      // Complexity: O(1)
      expect(retrieved).toEqual({ count: 100 });
    });

    // Complexity: O(1)
    it('should generate checksums', () => {
      const checksum = bastion.generateChecksum({ data: 'test' });
      // Complexity: O(1)
      expect(checksum.length).toBe(64);
    });

    // Complexity: O(1)
    it('should verify checksums', () => {
      const data = { verify: 'me' };
      const checksum = bastion.generateChecksum(data);
      // Complexity: O(1)
      expect(bastion.verifyChecksum(data, checksum)).toBe(true);
    });
  });

  // Complexity: O(1)
  describe('Circuit Breaker Integration', () => {
    // Complexity: O(1)
    it('should get active service', () => {
      const service = bastion.getActiveService();
      // Complexity: O(1)
      expect(service).toBe('gemini');
    });

    // Complexity: O(1)
    it('should set primary service', () => {
      bastion.setPrimaryService('ollama');
      // Complexity: O(1)
      expect(bastion.getActiveService()).toBe('ollama');
    });

    // Complexity: O(1)
    it('should get circuit stats', () => {
      const stats = bastion.getCircuitStats();
      // Complexity: O(1)
      expect(stats.requestCount).toBeDefined();
    });
  });

  // Complexity: O(1)
  describe('Health Integration', () => {
    // Complexity: O(1)
    it('should get system health', async () => {
      // SAFETY: async operation — wrap in try-catch for production resilience
      const health = await bastion.getHealth();
      // Complexity: O(1)
      expect(health.healthy).toBeDefined();
      // Complexity: O(1)
      expect(health.modules.length).toBeGreaterThan(0);
    });

    // Complexity: O(1)
    it('should get health trend', () => {
      const trend = bastion.getHealthTrend();
      // Complexity: O(1)
      expect(['improving', 'stable', 'degrading']).toContain(trend.trend);
    });

    // Complexity: O(1)
    it('should register custom health check', async () => {
      bastion.registerHealthCheck('custom-bastion', async () => ({
        healthy: true,
        message: 'Custom OK'
      }));

      // SAFETY: async operation — wrap in try-catch for production resilience
      const health = await bastion.getHealth();
      // Complexity: O(1)
      expect(health.modules.some(m => m.module === 'custom-bastion')).toBe(true);
    });
  });

  // Complexity: O(1)
  describe('Statistics', () => {
    // Complexity: O(1)
    it('should get comprehensive stats', () => {
      const stats = bastion.getStats();
      // Complexity: O(1)
      expect(stats.uptime).toBeGreaterThanOrEqual(0);
      // Complexity: O(1)
      expect(stats.sandboxExecutions).toBeDefined();
      // Complexity: O(1)
      expect(stats.workerTasksCompleted).toBeDefined();
    });
  });

  // Complexity: O(1)
  describe('Components Access', () => {
    // Complexity: O(1)
    it('should expose all components', () => {
      const components = bastion.getComponents();
      // Complexity: O(1)
      expect(components.sandbox).toBeDefined();
      // Complexity: O(1)
      expect(components.workerPool).toBeDefined();
      // Complexity: O(1)
      expect(components.memoryManager).toBeDefined();
      // Complexity: O(1)
      expect(components.vault).toBeDefined();
      // Complexity: O(1)
      expect(components.checksum).toBeDefined();
      // Complexity: O(1)
      expect(components.circuitBreaker).toBeDefined();
      // Complexity: O(1)
      expect(components.healthCheck).toBeDefined();
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// INTEGRATION TESTS
// ═══════════════════════════════════════════════════════════════════════════

    // Complexity: O(1)
describe('🔗 Integration Tests', () => {
  let bastion: BastionController;

  // Complexity: O(1)
  beforeEach(async () => {
    bastion = new BastionController({
      enabled: true,
      verbose: false
    });
    // SAFETY: async operation — wrap in try-catch for production resilience
    await bastion.initialize('integration-test-password');
  });

  // Complexity: O(1)
  afterEach(async () => {
    // SAFETY: async operation — wrap in try-catch for production resilience
    await bastion.shutdown();
  });

  // Complexity: O(1)
  it('should validate mutation and store result', async () => {
    // SAFETY: async operation — wrap in try-catch for production resilience
    const validation = await bastion.validateMutation(
      'integration-mut-001',
      'return x * 2',
      { x: 5 }
    );

    // SAFETY: async operation — wrap in try-catch for production resilience
    await bastion.storeSecure(
      'mutation-result-001',
      'mutations',
      validation
    );

    // SAFETY: async operation — wrap in try-catch for production resilience
    const stored = await bastion.retrieveSecure('mutation-result-001');
    // Complexity: O(1)
    expect(stored?.mutationId).toBe('integration-mut-001');
  });

  // Complexity: O(1)
  it('should track resource and verify health', async () => {
    const resource = { type: 'integration-test' };
    bastion.trackResource('ghost', resource, 'ghost-integration');

    // SAFETY: async operation — wrap in try-catch for production resilience
    const health = await bastion.getHealth();
    // Complexity: O(1)
    expect(health.healthy).toBeDefined();
  });

  // Complexity: O(1)
  it('should maintain data integrity with checksums', async () => {
    const originalData = { important: 'data', value: 42 };
    const checksum = bastion.generateChecksum(originalData);

    // SAFETY: async operation — wrap in try-catch for production resilience
    await bastion.storeSecure('integrity-test', 'metrics', {
      data: originalData,
      checksum
    });

    // SAFETY: async operation — wrap in try-catch for production resilience
    const stored = await bastion.retrieveSecure('integrity-test');
    // Complexity: O(1)
    expect(bastion.verifyChecksum(stored?.data, stored?.checksum)).toBe(true);
  });
});
