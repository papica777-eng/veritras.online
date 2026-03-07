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
 * For licensing inquiries: dimitar.papazov@QAntum.dev
 * ═══════════════════════════════════════════════════════════════════════════════
 */
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const bastion_1 = require("../src/bastion");
// ═══════════════════════════════════════════════════════════════════════════
// SANDBOX EXECUTOR TESTS
// ═══════════════════════════════════════════════════════════════════════════
(0, vitest_1.describe)('🔒 SandboxExecutor', () => {
    let sandbox;
    (0, vitest_1.beforeEach)(() => {
        sandbox = new bastion_1.SandboxExecutor({ enabled: true, logViolations: false });
    });
    (0, vitest_1.describe)('Safe Code Execution', () => {
        (0, vitest_1.it)('should execute safe JavaScript code', async () => {
            const result = await sandbox.execute('1 + 2');
            (0, vitest_1.expect)(result.success).toBe(true);
            (0, vitest_1.expect)(result.result).toBe(3);
        });
        (0, vitest_1.it)('should execute code with context variables', async () => {
            const result = await sandbox.execute('x * y', { x: 4, y: 5 });
            (0, vitest_1.expect)(result.success).toBe(true);
            (0, vitest_1.expect)(result.result).toBe(20);
        });
        (0, vitest_1.it)('should allow safe Math operations', async () => {
            const result = await sandbox.execute('Math.sqrt(16) + Math.pow(2, 3)');
            (0, vitest_1.expect)(result.success).toBe(true);
            (0, vitest_1.expect)(result.result).toBe(12); // 4 + 8
        });
        (0, vitest_1.it)('should allow JSON operations', async () => {
            const result = await sandbox.execute('JSON.stringify({ a: 1, b: 2 })');
            (0, vitest_1.expect)(result.success).toBe(true);
            (0, vitest_1.expect)(result.result).toBe('{"a":1,"b":2}');
        });
    });
    (0, vitest_1.describe)('Security Violations', () => {
        (0, vitest_1.it)('should block process access', async () => {
            const result = await sandbox.execute('process.exit(1)');
            (0, vitest_1.expect)(result.violations.length).toBeGreaterThan(0);
            (0, vitest_1.expect)(result.violations[0].type).toBe('process');
        });
        (0, vitest_1.it)('should block filesystem access', async () => {
            const result = await sandbox.execute('fs.readFileSync("/etc/passwd")');
            (0, vitest_1.expect)(result.violations.length).toBeGreaterThan(0);
            (0, vitest_1.expect)(result.violations[0].type).toBe('filesystem');
        });
        (0, vitest_1.it)('should block network access', async () => {
            // The fetch call itself is blocked and records a violation
            const result = await sandbox.execute('fetch("http://evil.com")');
            (0, vitest_1.expect)(result.violations.length).toBeGreaterThan(0);
            (0, vitest_1.expect)(result.violations[0].type).toBe('network');
        });
        (0, vitest_1.it)('should block eval', async () => {
            // eval is undefined in sandbox
            const result = await sandbox.execute('typeof eval');
            (0, vitest_1.expect)(result.result).toBe('undefined');
        });
    });
    (0, vitest_1.describe)('Mutation Validation', () => {
        (0, vitest_1.it)('should validate safe mutation as safe', async () => {
            const validation = await sandbox.validateMutation('mut-001', 'x + 1', // Expression, not return statement (vm doesn't allow bare return)
            { x: 5 });
            (0, vitest_1.expect)(validation.isSafe).toBe(true);
            (0, vitest_1.expect)(validation.isMalicious).toBe(false);
            (0, vitest_1.expect)(validation.recommendation).toBe('apply');
        });
        (0, vitest_1.it)('should reject malicious mutation', async () => {
            const validation = await sandbox.validateMutation('mut-002', 'process.env.SECRET_KEY', {});
            (0, vitest_1.expect)(validation.isMalicious).toBe(true);
            (0, vitest_1.expect)(validation.recommendation).toBe('reject');
        });
        (0, vitest_1.it)('should flag unstable mutation for review', async () => {
            // Code that would cause timeout or memory issues
            const validation = await sandbox.validateMutation('mut-003', 'throw new Error("test error")', {});
            (0, vitest_1.expect)(validation.isUnstable).toBe(true);
            (0, vitest_1.expect)(validation.recommendation).toBe('review');
        });
    });
    (0, vitest_1.describe)('Statistics', () => {
        (0, vitest_1.it)('should track execution count', async () => {
            await sandbox.execute('1');
            await sandbox.execute('2');
            await sandbox.execute('3');
            const stats = sandbox.getStats();
            (0, vitest_1.expect)(stats.executionCount).toBe(3);
        });
        (0, vitest_1.it)('should track violations', async () => {
            await sandbox.execute('process.exit()');
            const violations = sandbox.getViolations();
            (0, vitest_1.expect)(violations.length).toBeGreaterThan(0);
        });
    });
});
// ═══════════════════════════════════════════════════════════════════════════
// WORKER POOL TESTS
// ═══════════════════════════════════════════════════════════════════════════
(0, vitest_1.describe)('🧵 WorkerPoolManager', () => {
    let pool;
    (0, vitest_1.beforeEach)(() => {
        pool = new bastion_1.WorkerPoolManager({
            workerCount: 2,
            taskTimeout: 5000
        });
    });
    (0, vitest_1.afterEach)(async () => {
        await pool.shutdown(false);
    });
    (0, vitest_1.describe)('Pool Management', () => {
        (0, vitest_1.it)('should initialize with configured worker count', () => {
            const stats = pool.getStats();
            (0, vitest_1.expect)(stats.totalWorkers).toBe(2);
        });
        (0, vitest_1.it)('should report worker info', () => {
            const workers = pool.getWorkerInfo();
            (0, vitest_1.expect)(workers.length).toBe(2);
            (0, vitest_1.expect)(workers[0].status).toBeDefined();
        });
        (0, vitest_1.it)('should scale workers up', () => {
            pool.scale(4);
            const stats = pool.getStats();
            (0, vitest_1.expect)(stats.totalWorkers).toBe(4);
        });
        (0, vitest_1.it)('should scale workers down', () => {
            pool.scale(1);
            const stats = pool.getStats();
            (0, vitest_1.expect)(stats.totalWorkers).toBe(1);
        });
    });
    (0, vitest_1.describe)('Statistics', () => {
        (0, vitest_1.it)('should track uptime', () => {
            const stats = pool.getStats();
            (0, vitest_1.expect)(stats.uptime).toBeGreaterThanOrEqual(0);
        });
        (0, vitest_1.it)('should track queue size', () => {
            const stats = pool.getStats();
            (0, vitest_1.expect)(stats.queueSize).toBe(0);
        });
    });
});
// ═══════════════════════════════════════════════════════════════════════════
// MEMORY HARDENING TESTS
// ═══════════════════════════════════════════════════════════════════════════
(0, vitest_1.describe)('🧠 MemoryHardeningManager', () => {
    let memory;
    (0, vitest_1.beforeEach)(() => {
        memory = new bastion_1.MemoryHardeningManager();
    });
    (0, vitest_1.afterEach)(() => {
        memory.shutdown();
    });
    (0, vitest_1.describe)('Browser Tracking', () => {
        (0, vitest_1.it)('should register browser with metadata', () => {
            const mockBrowser = { id: 'test-browser' };
            memory.registerBrowser(mockBrowser, 'browser-001');
            const metadata = memory.getBrowserMetadata(mockBrowser);
            (0, vitest_1.expect)(metadata).toBeDefined();
            (0, vitest_1.expect)(metadata?.instanceId).toBe('browser-001');
            (0, vitest_1.expect)(metadata?.isActive).toBe(true);
        });
        (0, vitest_1.it)('should update browser activity', () => {
            const mockBrowser = { id: 'test-browser' };
            memory.registerBrowser(mockBrowser, 'browser-002');
            memory.updateBrowserActivity(mockBrowser, 5, 1024 * 1024);
            const metadata = memory.getBrowserMetadata(mockBrowser);
            (0, vitest_1.expect)(metadata?.pagesOpened).toBe(5);
            (0, vitest_1.expect)(metadata?.memoryEstimate).toBe(1024 * 1024);
        });
        (0, vitest_1.it)('should deactivate browser', () => {
            const mockBrowser = { id: 'test-browser' };
            memory.registerBrowser(mockBrowser, 'browser-003');
            memory.deactivateBrowser(mockBrowser);
            const metadata = memory.getBrowserMetadata(mockBrowser);
            (0, vitest_1.expect)(metadata?.isActive).toBe(false);
        });
    });
    (0, vitest_1.describe)('Resource Tracking', () => {
        (0, vitest_1.it)('should track resources with WeakRef', () => {
            const resource = { type: 'ghost' };
            memory.trackResource('ghost', resource, 'ghost-001');
            (0, vitest_1.expect)(memory.isResourceAlive('ghost-001')).toBe(true);
        });
        (0, vitest_1.it)('should retrieve tracked resource', () => {
            const resource = { type: 'page', url: 'https://test.com' };
            memory.trackResource('page', resource, 'page-001');
            const retrieved = memory.getResource('page-001');
            (0, vitest_1.expect)(retrieved).toBe(resource);
        });
        (0, vitest_1.it)('should attach metadata to objects', () => {
            const obj = { id: 'test' };
            memory.attachMetadata(obj, { custom: 'value' });
            const metadata = memory.getMetadata(obj);
            (0, vitest_1.expect)(metadata?.custom).toBe('value');
        });
    });
    (0, vitest_1.describe)('Statistics', () => {
        (0, vitest_1.it)('should track memory stats', () => {
            const stats = memory.getMemoryStats();
            (0, vitest_1.expect)(stats.heapUsed).toBeGreaterThan(0);
            (0, vitest_1.expect)(stats.heapTotal).toBeGreaterThan(0);
            (0, vitest_1.expect)(stats.uptime).toBeGreaterThanOrEqual(0);
        });
        (0, vitest_1.it)('should track resource counts', () => {
            const resource = { id: 'test' };
            memory.trackResource('ghost', resource, 'ghost-stats');
            const tracker = memory.getTrackerStats('ghost');
            (0, vitest_1.expect)(tracker.totalCreated).toBeGreaterThan(0);
        });
    });
});
// ═══════════════════════════════════════════════════════════════════════════
// NEURAL VAULT TESTS
// ═══════════════════════════════════════════════════════════════════════════
(0, vitest_1.describe)('🔐 NeuralVault', () => {
    let vault;
    const testPassword = 'test-secure-password-123!';
    (0, vitest_1.beforeEach)(async () => {
        vault = new bastion_1.NeuralVault({
            enabled: true,
            vaultPath: './test-vault.encrypted',
            compression: true
        });
        await vault.initialize(testPassword, false);
    });
    (0, vitest_1.afterEach)(async () => {
        await vault.close();
    });
    (0, vitest_1.describe)('Encryption/Decryption', () => {
        (0, vitest_1.it)('should encrypt and decrypt data correctly', async () => {
            const originalData = { secret: 'classified', value: 42 };
            const encrypted = await vault.encrypt(originalData);
            (0, vitest_1.expect)(encrypted.algorithm).toBe('aes-256-gcm');
            (0, vitest_1.expect)(encrypted.iv).toBeDefined();
            (0, vitest_1.expect)(encrypted.authTag).toBeDefined();
            const decrypted = await vault.decrypt(encrypted);
            (0, vitest_1.expect)(decrypted).toEqual(originalData);
        });
        (0, vitest_1.it)('should generate unique IVs for each encryption', async () => {
            const data = { test: 'data' };
            const encrypted1 = await vault.encrypt(data);
            const encrypted2 = await vault.encrypt(data);
            (0, vitest_1.expect)(encrypted1.iv).not.toBe(encrypted2.iv);
        });
    });
    (0, vitest_1.describe)('Storage Operations', () => {
        (0, vitest_1.it)('should store and retrieve data', async () => {
            const testData = { predictions: [1, 2, 3], confidence: 0.95 };
            await vault.store('test-entry', 'predictions', testData);
            const retrieved = await vault.retrieve('test-entry');
            (0, vitest_1.expect)(retrieved).toEqual(testData);
        });
        (0, vitest_1.it)('should check entry existence', async () => {
            await vault.store('exists-entry', 'metrics', { count: 1 });
            (0, vitest_1.expect)(vault.has('exists-entry')).toBe(true);
            (0, vitest_1.expect)(vault.has('nonexistent')).toBe(false);
        });
        (0, vitest_1.it)('should delete entries', async () => {
            await vault.store('delete-me', 'mutations', { code: 'test' });
            (0, vitest_1.expect)(vault.has('delete-me')).toBe(true);
            vault.delete('delete-me');
            (0, vitest_1.expect)(vault.has('delete-me')).toBe(false);
        });
        (0, vitest_1.it)('should list all entries', async () => {
            await vault.store('entry-1', 'ghost_knowledge', { a: 1 });
            await vault.store('entry-2', 'predictions', { b: 2 });
            const entries = vault.listEntries();
            (0, vitest_1.expect)(entries.length).toBe(2);
            (0, vitest_1.expect)(entries.some(e => e.id === 'entry-1')).toBe(true);
            (0, vitest_1.expect)(entries.some(e => e.id === 'entry-2')).toBe(true);
        });
    });
    (0, vitest_1.describe)('Integrity Verification', () => {
        (0, vitest_1.it)('should verify data integrity with checksum', async () => {
            await vault.store('integrity-test', 'versions', { version: 1 });
            const isValid = await vault.verifyIntegrity('integrity-test');
            (0, vitest_1.expect)(isValid).toBe(true);
        });
        (0, vitest_1.it)('should calculate SHA-256 checksums', () => {
            const checksum1 = vault.calculateChecksum('test data');
            const checksum2 = vault.calculateChecksum('test data');
            const checksum3 = vault.calculateChecksum('different data');
            (0, vitest_1.expect)(checksum1).toBe(checksum2);
            (0, vitest_1.expect)(checksum1).not.toBe(checksum3);
            (0, vitest_1.expect)(checksum1.length).toBe(64); // SHA-256 hex length
        });
    });
    (0, vitest_1.describe)('Statistics', () => {
        (0, vitest_1.it)('should track operations', async () => {
            await vault.encrypt({ test: 1 });
            await vault.encrypt({ test: 2 });
            const stats = vault.getStats();
            (0, vitest_1.expect)(stats.operationCount).toBeGreaterThanOrEqual(2);
        });
        (0, vitest_1.it)('should report sync status', () => {
            const status = vault.getSyncStatus();
            (0, vitest_1.expect)(status.isSyncing).toBe(false);
        });
    });
});
// ═══════════════════════════════════════════════════════════════════════════
// CHECKSUM VALIDATOR TESTS
// ═══════════════════════════════════════════════════════════════════════════
(0, vitest_1.describe)('🔍 ChecksumValidator', () => {
    let validator;
    (0, vitest_1.beforeEach)(() => {
        validator = new bastion_1.ChecksumValidator({ cacheEnabled: true });
    });
    (0, vitest_1.describe)('Hash Generation', () => {
        (0, vitest_1.it)('should hash strings consistently', () => {
            const hash1 = validator.hashString('hello world');
            const hash2 = validator.hashString('hello world');
            (0, vitest_1.expect)(hash1).toBe(hash2);
            (0, vitest_1.expect)(hash1.length).toBe(64); // SHA-256
        });
        (0, vitest_1.it)('should hash buffers', () => {
            const buffer = Buffer.from('test data', 'utf-8');
            const hash = validator.hashBuffer(buffer);
            (0, vitest_1.expect)(hash.length).toBe(64);
        });
        (0, vitest_1.it)('should hash data objects', () => {
            const record = validator.hashData({ key: 'value', num: 42 });
            (0, vitest_1.expect)(record.hash).toBeDefined();
            (0, vitest_1.expect)(record.algorithm).toBe('sha256');
            (0, vitest_1.expect)(record.size).toBeGreaterThan(0);
        });
    });
    (0, vitest_1.describe)('Verification', () => {
        (0, vitest_1.it)('should verify matching data', () => {
            const data = { test: 'value' };
            const hash = validator.hashString(JSON.stringify(data));
            (0, vitest_1.expect)(validator.verifyData(data, hash)).toBe(true);
        });
        (0, vitest_1.it)('should reject mismatched data', () => {
            const data = { test: 'value' };
            const wrongHash = validator.hashString('wrong data');
            (0, vitest_1.expect)(validator.verifyData(data, wrongHash)).toBe(false);
        });
        (0, vitest_1.it)('should compare hashes securely (timing-safe)', () => {
            const hash1 = validator.hashString('data');
            const hash2 = validator.hashString('data');
            const hash3 = validator.hashString('different');
            (0, vitest_1.expect)(validator.compareHashes(hash1, hash2)).toBe(true);
            (0, vitest_1.expect)(validator.compareHashes(hash1, hash3)).toBe(false);
        });
    });
    (0, vitest_1.describe)('Caching', () => {
        (0, vitest_1.it)('should cache checksums', () => {
            const record = validator.hashData({ cached: true });
            const cached = validator.getCached(record.id);
            (0, vitest_1.expect)(cached).toBeDefined();
            (0, vitest_1.expect)(cached?.hash).toBe(record.hash);
        });
        (0, vitest_1.it)('should clear cache', () => {
            const record = validator.hashData({ clear: true });
            validator.clearCache();
            (0, vitest_1.expect)(validator.getCached(record.id)).toBeUndefined();
        });
    });
    (0, vitest_1.describe)('Statistics', () => {
        (0, vitest_1.it)('should track operations', () => {
            validator.hashString('a');
            validator.hashString('b');
            validator.hashBuffer(Buffer.from('c'));
            const stats = validator.getStats();
            (0, vitest_1.expect)(stats.operationCount).toBe(3);
        });
    });
});
// ═══════════════════════════════════════════════════════════════════════════
// CIRCUIT BREAKER TESTS
// ═══════════════════════════════════════════════════════════════════════════
(0, vitest_1.describe)('⚡ CircuitBreakerManager', () => {
    let breaker;
    (0, vitest_1.beforeEach)(() => {
        breaker = new bastion_1.CircuitBreakerManager({
            enabled: true,
            failureThreshold: 3,
            successThreshold: 2,
            resetTimeout: 1000,
            healthCheckInterval: 60000 // Long interval to avoid interference
        });
    });
    (0, vitest_1.afterEach)(() => {
        breaker.shutdown();
    });
    (0, vitest_1.describe)('Circuit States', () => {
        (0, vitest_1.it)('should start in closed state', () => {
            (0, vitest_1.expect)(breaker.getCircuitState('gemini')).toBe('closed');
        });
        (0, vitest_1.it)('should allow requests when closed', () => {
            (0, vitest_1.expect)(breaker.canRequest('gemini')).toBe(true);
        });
        (0, vitest_1.it)('should force circuit state', () => {
            breaker.forceState('gemini', 'open');
            (0, vitest_1.expect)(breaker.getCircuitState('gemini')).toBe('open');
            (0, vitest_1.expect)(breaker.canRequest('gemini')).toBe(false);
        });
        (0, vitest_1.it)('should reset all circuits', () => {
            breaker.forceState('gemini', 'open');
            breaker.forceState('claude', 'open');
            breaker.resetAll();
            (0, vitest_1.expect)(breaker.getCircuitState('gemini')).toBe('closed');
            (0, vitest_1.expect)(breaker.getCircuitState('claude')).toBe('closed');
        });
    });
    (0, vitest_1.describe)('Fallback Chain', () => {
        (0, vitest_1.it)('should have default fallback chain', () => {
            const chain = breaker.getFallbackChain();
            (0, vitest_1.expect)(chain.primary).toBe('gemini');
            (0, vitest_1.expect)(chain.fallbacks).toContain('ollama');
        });
        (0, vitest_1.it)('should set primary service', () => {
            breaker.setPrimary('claude');
            const chain = breaker.getFallbackChain();
            (0, vitest_1.expect)(chain.primary).toBe('claude');
        });
    });
    (0, vitest_1.describe)('Execute with Protection', () => {
        (0, vitest_1.it)('should execute successful requests', async () => {
            const result = await breaker.execute(async () => 'success');
            (0, vitest_1.expect)(result).toBe('success');
        });
        (0, vitest_1.it)('should track statistics', async () => {
            await breaker.execute(async () => 'ok');
            await breaker.execute(async () => 'ok');
            const stats = breaker.getStats();
            (0, vitest_1.expect)(stats.requestCount).toBe(2);
        });
    });
    (0, vitest_1.describe)('Service Health', () => {
        (0, vitest_1.it)('should report all service health', () => {
            const health = breaker.getAllServiceHealth();
            (0, vitest_1.expect)(health.length).toBeGreaterThan(0);
            (0, vitest_1.expect)(health.some(h => h.service === 'gemini')).toBe(true);
        });
        (0, vitest_1.it)('should get active service', () => {
            (0, vitest_1.expect)(breaker.getActiveService()).toBe('gemini');
        });
    });
});
// ═══════════════════════════════════════════════════════════════════════════
// HEALTH CHECK SYSTEM TESTS
// ═══════════════════════════════════════════════════════════════════════════
(0, vitest_1.describe)('💓 HealthCheckSystem', () => {
    let health;
    (0, vitest_1.beforeEach)(() => {
        health = new bastion_1.HealthCheckSystem({
            enabled: true,
            interval: 60000, // Long interval to control manually
            historyRetention: 50
        });
    });
    (0, vitest_1.afterEach)(() => {
        health.shutdown();
    });
    (0, vitest_1.describe)('Built-in Checks', () => {
        (0, vitest_1.it)('should have memory check registered', async () => {
            const results = await health.runAllChecks();
            const memoryCheck = results.find(r => r.module === 'memory');
            (0, vitest_1.expect)(memoryCheck).toBeDefined();
        });
        (0, vitest_1.it)('should have CPU check registered', async () => {
            const results = await health.runAllChecks();
            const cpuCheck = results.find(r => r.module === 'cpu');
            (0, vitest_1.expect)(cpuCheck).toBeDefined();
        });
        (0, vitest_1.it)('should have event loop check', async () => {
            const results = await health.runAllChecks();
            const eventLoopCheck = results.find(r => r.module === 'event-loop');
            (0, vitest_1.expect)(eventLoopCheck).toBeDefined();
        });
    });
    (0, vitest_1.describe)('Custom Checks', () => {
        (0, vitest_1.it)('should register custom health check', async () => {
            health.register('custom', async () => ({
                module: 'custom',
                healthy: true,
                duration: 0,
                message: 'Custom check OK',
                timestamp: new Date()
            }));
            const results = await health.runAllChecks();
            const customCheck = results.find(r => r.module === 'custom');
            (0, vitest_1.expect)(customCheck).toBeDefined();
            (0, vitest_1.expect)(customCheck?.healthy).toBe(true);
        });
        (0, vitest_1.it)('should unregister checks', () => {
            health.register('temp', async () => ({
                module: 'temp',
                healthy: true,
                duration: 0,
                message: 'Temp',
                timestamp: new Date()
            }));
            const removed = health.unregister('temp');
            (0, vitest_1.expect)(removed).toBe(true);
        });
    });
    (0, vitest_1.describe)('Health Status', () => {
        (0, vitest_1.it)('should get overall health', async () => {
            const systemHealth = await health.getHealth();
            (0, vitest_1.expect)(systemHealth.healthy).toBeDefined();
            (0, vitest_1.expect)(systemHealth.modules.length).toBeGreaterThan(0);
            (0, vitest_1.expect)(systemHealth.memoryUsage.heapUsed).toBeGreaterThan(0);
        });
        (0, vitest_1.it)('should get last results', async () => {
            await health.runAllChecks();
            const last = health.getLastResults();
            (0, vitest_1.expect)(last.length).toBeGreaterThan(0);
        });
    });
    (0, vitest_1.describe)('Alerts', () => {
        (0, vitest_1.it)('should have no active alerts initially', () => {
            const alerts = health.getActiveAlerts();
            (0, vitest_1.expect)(alerts.length).toBe(0);
        });
        (0, vitest_1.it)('should get all alerts', () => {
            const alerts = health.getAllAlerts();
            (0, vitest_1.expect)(Array.isArray(alerts)).toBe(true);
        });
    });
    (0, vitest_1.describe)('Trends', () => {
        (0, vitest_1.it)('should calculate health trend', async () => {
            // Run multiple checks to generate history
            await health.runAllChecks();
            await health.runAllChecks();
            const trend = health.getHealthTrend();
            (0, vitest_1.expect)(['improving', 'stable', 'degrading']).toContain(trend.trend);
            (0, vitest_1.expect)(trend.avgHealth).toBeGreaterThanOrEqual(0);
            (0, vitest_1.expect)(trend.avgHealth).toBeLessThanOrEqual(1);
        });
    });
    (0, vitest_1.describe)('Statistics', () => {
        (0, vitest_1.it)('should track stats', async () => {
            await health.runAllChecks();
            const stats = health.getStats();
            (0, vitest_1.expect)(stats.checksPerformed).toBeGreaterThan(0);
            (0, vitest_1.expect)(stats.registeredChecks).toBeGreaterThan(0);
        });
    });
});
// ═══════════════════════════════════════════════════════════════════════════
// BASTION CONTROLLER TESTS
// ═══════════════════════════════════════════════════════════════════════════
(0, vitest_1.describe)('🏰 BastionController', () => {
    let bastion;
    const testPassword = 'bastion-test-password-456!';
    (0, vitest_1.beforeEach)(async () => {
        bastion = new bastion_1.BastionController({
            enabled: true,
            verbose: false,
            healthCheckInterval: 60000,
            sandbox: { logViolations: false },
            workerPool: { workerCount: 1 },
            neuralVault: { vaultPath: './test-bastion-vault.encrypted' }
        });
        await bastion.initialize(testPassword);
    });
    (0, vitest_1.afterEach)(async () => {
        await bastion.shutdown();
    });
    (0, vitest_1.describe)('Initialization', () => {
        (0, vitest_1.it)('should initialize successfully', () => {
            (0, vitest_1.expect)(bastion.isReady()).toBe(true);
        });
        (0, vitest_1.it)('should not initialize twice', async () => {
            await bastion.initialize(testPassword);
            (0, vitest_1.expect)(bastion.isReady()).toBe(true);
        });
    });
    (0, vitest_1.describe)('Sandbox Integration', () => {
        (0, vitest_1.it)('should validate mutations', async () => {
            const result = await bastion.validateMutation('test-mut', '1 + 1', // Expression, not return statement (vm doesn't allow bare return)
            {});
            (0, vitest_1.expect)(result.isSafe).toBe(true);
        });
        (0, vitest_1.it)('should get violations', () => {
            const violations = bastion.getViolations();
            (0, vitest_1.expect)(Array.isArray(violations)).toBe(true);
        });
    });
    (0, vitest_1.describe)('Memory Integration', () => {
        (0, vitest_1.it)('should track browser', () => {
            const mockBrowser = { id: 'bastion-browser' };
            bastion.trackBrowser(mockBrowser, 'browser-bastion-001');
            // No error means success
        });
        (0, vitest_1.it)('should get memory stats', () => {
            const stats = bastion.getMemoryStats();
            (0, vitest_1.expect)(stats.heapUsed).toBeGreaterThan(0);
        });
    });
    (0, vitest_1.describe)('Vault Integration', () => {
        (0, vitest_1.it)('should store and retrieve secure data', async () => {
            await bastion.storeSecure('bastion-test', 'metrics', { count: 100 });
            const retrieved = await bastion.retrieveSecure('bastion-test');
            (0, vitest_1.expect)(retrieved).toEqual({ count: 100 });
        });
        (0, vitest_1.it)('should generate checksums', () => {
            const checksum = bastion.generateChecksum({ data: 'test' });
            (0, vitest_1.expect)(checksum.length).toBe(64);
        });
        (0, vitest_1.it)('should verify checksums', () => {
            const data = { verify: 'me' };
            const checksum = bastion.generateChecksum(data);
            (0, vitest_1.expect)(bastion.verifyChecksum(data, checksum)).toBe(true);
        });
    });
    (0, vitest_1.describe)('Circuit Breaker Integration', () => {
        (0, vitest_1.it)('should get active service', () => {
            const service = bastion.getActiveService();
            (0, vitest_1.expect)(service).toBe('gemini');
        });
        (0, vitest_1.it)('should set primary service', () => {
            bastion.setPrimaryService('ollama');
            (0, vitest_1.expect)(bastion.getActiveService()).toBe('ollama');
        });
        (0, vitest_1.it)('should get circuit stats', () => {
            const stats = bastion.getCircuitStats();
            (0, vitest_1.expect)(stats.requestCount).toBeDefined();
        });
    });
    (0, vitest_1.describe)('Health Integration', () => {
        (0, vitest_1.it)('should get system health', async () => {
            const health = await bastion.getHealth();
            (0, vitest_1.expect)(health.healthy).toBeDefined();
            (0, vitest_1.expect)(health.modules.length).toBeGreaterThan(0);
        });
        (0, vitest_1.it)('should get health trend', () => {
            const trend = bastion.getHealthTrend();
            (0, vitest_1.expect)(['improving', 'stable', 'degrading']).toContain(trend.trend);
        });
        (0, vitest_1.it)('should register custom health check', async () => {
            bastion.registerHealthCheck('custom-bastion', async () => ({
                healthy: true,
                message: 'Custom OK'
            }));
            const health = await bastion.getHealth();
            (0, vitest_1.expect)(health.modules.some(m => m.module === 'custom-bastion')).toBe(true);
        });
    });
    (0, vitest_1.describe)('Statistics', () => {
        (0, vitest_1.it)('should get comprehensive stats', () => {
            const stats = bastion.getStats();
            (0, vitest_1.expect)(stats.uptime).toBeGreaterThanOrEqual(0);
            (0, vitest_1.expect)(stats.sandboxExecutions).toBeDefined();
            (0, vitest_1.expect)(stats.workerTasksCompleted).toBeDefined();
        });
    });
    (0, vitest_1.describe)('Components Access', () => {
        (0, vitest_1.it)('should expose all components', () => {
            const components = bastion.getComponents();
            (0, vitest_1.expect)(components.sandbox).toBeDefined();
            (0, vitest_1.expect)(components.workerPool).toBeDefined();
            (0, vitest_1.expect)(components.memoryManager).toBeDefined();
            (0, vitest_1.expect)(components.vault).toBeDefined();
            (0, vitest_1.expect)(components.checksum).toBeDefined();
            (0, vitest_1.expect)(components.circuitBreaker).toBeDefined();
            (0, vitest_1.expect)(components.healthCheck).toBeDefined();
        });
    });
});
// ═══════════════════════════════════════════════════════════════════════════
// INTEGRATION TESTS
// ═══════════════════════════════════════════════════════════════════════════
(0, vitest_1.describe)('🔗 Integration Tests', () => {
    let bastion;
    (0, vitest_1.beforeEach)(async () => {
        bastion = new bastion_1.BastionController({
            enabled: true,
            verbose: false
        });
        await bastion.initialize('integration-test-password');
    });
    (0, vitest_1.afterEach)(async () => {
        await bastion.shutdown();
    });
    (0, vitest_1.it)('should validate mutation and store result', async () => {
        const validation = await bastion.validateMutation('integration-mut-001', 'return x * 2', { x: 5 });
        await bastion.storeSecure('mutation-result-001', 'mutations', validation);
        const stored = await bastion.retrieveSecure('mutation-result-001');
        (0, vitest_1.expect)(stored?.mutationId).toBe('integration-mut-001');
    });
    (0, vitest_1.it)('should track resource and verify health', async () => {
        const resource = { type: 'integration-test' };
        bastion.trackResource('ghost', resource, 'ghost-integration');
        const health = await bastion.getHealth();
        (0, vitest_1.expect)(health.healthy).toBeDefined();
    });
    (0, vitest_1.it)('should maintain data integrity with checksums', async () => {
        const originalData = { important: 'data', value: 42 };
        const checksum = bastion.generateChecksum(originalData);
        await bastion.storeSecure('integrity-test', 'metrics', {
            data: originalData,
            checksum
        });
        const stored = await bastion.retrieveSecure('integrity-test');
        (0, vitest_1.expect)(bastion.verifyChecksum(stored?.data, stored?.checksum)).toBe(true);
    });
});
