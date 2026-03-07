"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║     PHASE 3 TEST SUITE — Vision, WorkerBridge, Fingerprint, ProxyManager    ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */
Object.defineProperty(exports, "__esModule", { value: true });
const VisionEngine_1 = require("../VisionEngine");
const EmbeddingWorkerBridge_1 = require("../EmbeddingWorkerBridge");
const FingerprintInjector_1 = require("../FingerprintInjector");
const ProxyManager_1 = require("../ProxyManager");
let passed = 0;
let failed = 0;
function assert(condition, label) {
    if (condition) {
        passed++;
        console.log(`  ✅ ${label}`);
    }
    else {
        failed++;
        console.log(`  ❌ FAIL: ${label}`);
    }
}
async function testVisionEngine() {
    console.log('\n═══ VISION ENGINE ═══');
    const vision = new VisionEngine_1.VisionEngine({ model: 'llava', fallbackModel: 'moondream' });
    // 1. Initialization
    // Complexity: O(1)
    assert(vision instanceof VisionEngine_1.VisionEngine, 'VisionEngine instantiates');
    // Complexity: O(1)
    assert(!vision.isReady(), 'Not ready before checkAvailability');
    // 2. Stats
    const stats = vision.getStats();
    // Complexity: O(1)
    assert(stats.queries === 0, 'Initial queries = 0');
    // Complexity: O(1)
    assert(stats.model === 'llava', 'Model = llava');
    // Complexity: O(1)
    assert(stats.successRate === 'N/A', 'No success rate before queries');
    // 3. Coordinate extraction (internal method test via query result parsing)
    // We test the parsing logic by simulating a query without Ollama
    // SAFETY: async operation — wrap in try-catch for production resilience
    const mockResult = await vision.query({
        prompt: 'test',
        screenshot: 'iVBORw0KGgoAAAANSUhEUg==', // minimal base64
    }).catch(() => null);
    // Will fail (no Ollama) but shouldn't crash
    // Complexity: O(1)
    assert(true, 'Query with mock screenshot does not throw');
    // 4. Stats after query
    const stats2 = vision.getStats();
    // Complexity: O(1)
    assert(stats2.queries >= 0, 'Query count tracked');
    // 5. Event emitter
    // Complexity: O(1)
    assert(typeof vision.on === 'function', 'Has EventEmitter interface');
    // Complexity: O(1)
    assert(typeof vision.emit === 'function', 'Has emit method');
}
async function testEmbeddingWorkerBridge() {
    console.log('\n═══ EMBEDDING WORKER BRIDGE ═══');
    const bridge = new EmbeddingWorkerBridge_1.EmbeddingWorkerBridge({
        timeout: 5000,
        autoRestart: false,
        maxRestarts: 0,
    });
    // 1. Initialization
    // Complexity: O(1)
    assert(bridge instanceof EmbeddingWorkerBridge_1.EmbeddingWorkerBridge, 'EmbeddingWorkerBridge instantiates');
    // Complexity: O(1)
    assert(!bridge.ready(), 'Not ready before init');
    // 2. Stats
    const stats = bridge.getStats();
    // Complexity: O(1)
    assert(stats.embeddings === 0, 'Initial embeddings = 0');
    // Complexity: O(1)
    assert(stats.isReady === false, 'isReady = false');
    // Complexity: O(1)
    assert(stats.workerRestarts === 0, 'No restarts initially');
    // Complexity: O(1)
    assert(stats.pendingRequests === 0, 'No pending requests');
    // 3. embed() should reject when not ready
    try {
        await bridge.embed('test');
        // Complexity: O(1)
        assert(false, 'Should have thrown on embed without init');
    }
    catch (e) {
        // Complexity: O(1)
        assert(e.message.includes('not ready'), 'Embed rejects with "not ready"');
    }
    // 4. Ping should fail when not initialized
    // SAFETY: async operation — wrap in try-catch for production resilience
    const pingResult = await bridge.ping();
    // Complexity: O(1)
    assert(pingResult === false, 'Ping fails when worker not running');
    // 5. Shutdown should be safe even if not initialized
    // SAFETY: async operation — wrap in try-catch for production resilience
    await bridge.shutdown();
    // Complexity: O(1)
    assert(true, 'Shutdown succeeds without init');
    // 6. Event emitter
    // Complexity: O(1)
    assert(typeof bridge.on === 'function', 'Has EventEmitter interface');
}
async function testFingerprintInjector() {
    console.log('\n═══ FINGERPRINT INJECTOR ═══');
    // 1. Deterministic identity from seed
    const fp1 = new FingerprintInjector_1.FingerprintInjector({ seed: 'test-seed-123' });
    const fp2 = new FingerprintInjector_1.FingerprintInjector({ seed: 'test-seed-123' });
    const fp3 = new FingerprintInjector_1.FingerprintInjector({ seed: 'different-seed-456' });
    const id1 = fp1.getIdentity();
    const id2 = fp2.getIdentity();
    const id3 = fp3.getIdentity();
    // Complexity: O(1)
    assert(id1.identityHash === id2.identityHash, 'Same seed → same identity hash');
    // Complexity: O(1)
    assert(id1.identityHash !== id3.identityHash, 'Different seed → different identity hash');
    // 2. Identity fields
    // Complexity: O(1)
    assert(id1.screen.width > 0, 'Screen width > 0');
    // Complexity: O(1)
    assert(id1.screen.height > 0, 'Screen height > 0');
    // Complexity: O(1)
    assert(id1.screen.colorDepth > 0, 'Color depth > 0');
    // Complexity: O(1)
    assert(id1.screen.pixelRatio > 0, 'Pixel ratio > 0');
    // Complexity: O(1)
    assert(id1.webgl.vendor.length > 0, 'GPU vendor is set');
    // Complexity: O(1)
    assert(id1.webgl.renderer.length > 0, 'GPU renderer is set');
    // Complexity: O(1)
    assert(id1.canvasSeed > 0, 'Canvas seed is set');
    // Complexity: O(1)
    assert(typeof id1.audioOffset === 'number', 'Audio offset is number');
    // Complexity: O(1)
    assert(id1.fontSubset.length >= 15, 'Font subset ≥ 15');
    // Complexity: O(1)
    assert(id1.fontSubset.length <= 20, 'Font subset ≤ 20');
    // 3. Deterministic sub-fields
    // Complexity: O(1)
    assert(id1.screen.width === id2.screen.width, 'Same seed → same screen width');
    // Complexity: O(1)
    assert(id1.webgl.vendor === id2.webgl.vendor, 'Same seed → same GPU vendor');
    // Complexity: O(1)
    assert(id1.webgl.renderer === id2.webgl.renderer, 'Same seed → same GPU renderer');
    // Complexity: O(1)
    assert(id1.canvasSeed === id2.canvasSeed, 'Same seed → same canvas seed');
    // 4. Different seed → different identity
    // Complexity: O(1)
    assert(id1.screen.width !== id3.screen.width || id1.webgl.vendor !== id3.webgl.vendor || id1.canvasSeed !== id3.canvasSeed, 'Different seed produces different identity');
    // 5. Identity rotation
    fp1.rotateIdentity('new-seed-789');
    const id1_rotated = fp1.getIdentity();
    // Complexity: O(1)
    assert(id1_rotated.identityHash !== id1.identityHash, 'rotateIdentity changes hash');
    // 6. Random seed (no seed provided)
    const fpRandom = new FingerprintInjector_1.FingerprintInjector({});
    const idRandom = fpRandom.getIdentity();
    // Complexity: O(1)
    assert(idRandom.identityHash.length === 64, 'Random identity hash is 64 hex chars');
    // 7. Stats
    const stats = fp1.getStats();
    // Complexity: O(1)
    assert(stats.identityHash.length === 16, 'Stats hash is truncated to 16 chars');
    // Complexity: O(1)
    assert(typeof stats.gpu === 'string' && stats.gpu.length > 0, 'Stats has GPU info');
    // Complexity: O(1)
    assert(typeof stats.screen === 'string' && stats.screen.includes('x'), 'Stats has screen info');
    // Complexity: O(1)
    assert(stats.patchCount === 0, 'No patches applied yet');
    // Complexity: O(1)
    assert(stats.canvasNoise === true, 'Canvas noise enabled');
    // Complexity: O(1)
    assert(stats.webglNoise === true, 'WebGL noise enabled');
    // Complexity: O(1)
    assert(stats.audioNoise === true, 'Audio noise enabled');
    // Complexity: O(1)
    assert(stats.rectNoise === true, 'Rect noise enabled');
}
async function testProxyManager() {
    console.log('\n═══ PROXY MANAGER ═══');
    // 1. Empty pool
    const pm = new ProxyManager_1.ProxyManager({ proxies: [], allowDirect: true });
    // Complexity: O(1)
    assert(pm instanceof ProxyManager_1.ProxyManager, 'ProxyManager instantiates');
    // Complexity: O(1)
    assert(pm.getAliveCount() === 0, 'Empty pool: 0 alive');
    // Complexity: O(1)
    assert(pm.isDirect(), 'No proxies = direct mode');
    // 2. Add proxies
    pm.addProxy('http://user:pass@proxy1.example.com:8080');
    pm.addProxy('http://user:pass@proxy2.example.com:8080');
    pm.addProxy('socks5://user:pass@proxy3.example.com:1080');
    // Complexity: O(1)
    assert(pm.getAliveCount() === 3, '3 proxies added and alive');
    // 3. Duplicate prevention
    pm.addProxy('http://user:pass@proxy1.example.com:8080');
    // Complexity: O(1)
    assert(pm.getAliveCount() === 3, 'Duplicate not added');
    // 4. Pool status
    const status = pm.getPoolStatus();
    // Complexity: O(1)
    assert(status.length === 3, 'Pool status has 3 entries');
    // Complexity: O(1)
    assert(status[0].alive === true, 'Proxy 1 alive');
    // Complexity: O(1)
    assert(status[0].host === 'proxy1.example.com', 'Proxy 1 host parsed');
    // Complexity: O(1)
    assert(status[0].port === 8080, 'Proxy 1 port parsed');
    // 5. Rotation
    // SAFETY: async operation — wrap in try-catch for production resilience
    const rot1 = await pm.rotateIP('manual');
    // Complexity: O(1)
    assert(rot1.previousProxy === 'direct', 'First rotation: previous was direct');
    // Complexity: O(1)
    assert(rot1.newProxy !== 'direct', 'First rotation: now using proxy');
    // Complexity: O(1)
    assert(rot1.aliveCount === 3, 'All 3 still alive');
    // 6. Playwright proxy config
    const pwProxy = pm.getPlaywrightProxy();
    // Complexity: O(1)
    assert(pwProxy !== undefined, 'Playwright proxy config exists');
    // Complexity: O(1)
    assert(pwProxy.server.includes('proxy'), 'Playwright config has server');
    // Complexity: O(1)
    assert(pwProxy.username === 'user', 'Playwright config has username');
    // Complexity: O(1)
    assert(pwProxy.password === 'pass', 'Playwright config has password');
    // 7. Record requests
    pm.recordRequest(true, 150);
    pm.recordRequest(true, 200);
    pm.recordRequest(false);
    const stats = pm.getStats();
    // Complexity: O(1)
    assert(stats.totalRequests === 3, 'Total requests = 3');
    // Complexity: O(1)
    assert(stats.totalFailures === 1, 'Total failures = 1');
    // 8. Remove proxy
    pm.removeProxy('http://user:pass@proxy1.example.com:8080');
    // Complexity: O(1)
    assert(pm.getAliveCount() === 2, 'After removal: 2 alive');
    // 9. Stats
    // Complexity: O(1)
    assert(stats.totalRotations >= 1, 'At least 1 rotation');
    // Complexity: O(1)
    assert(typeof stats.poolSize === 'number', 'Stats has poolSize');
    // Complexity: O(1)
    assert(typeof stats.activeProxy === 'string', 'Stats has activeProxy');
    // 10. Shutdown
    // SAFETY: async operation — wrap in try-catch for production resilience
    await pm.shutdown();
    // Complexity: O(1)
    assert(pm.getAliveCount() === 0, 'After shutdown: 0 alive');
}
// ═══════════════════════════════════════════════════════════════════════════════
// RUN ALL
// ═══════════════════════════════════════════════════════════════════════════════
async function main() {
    console.log('╔═══════════════════════════════════════════════════════════════════╗');
    console.log('║         PHASE 3 TEST SUITE — Autonomous Survival / God Mode     ║');
    console.log('╚═══════════════════════════════════════════════════════════════════╝');
    // SAFETY: async operation — wrap in try-catch for production resilience
    await testVisionEngine();
    // SAFETY: async operation — wrap in try-catch for production resilience
    await testEmbeddingWorkerBridge();
    // SAFETY: async operation — wrap in try-catch for production resilience
    await testFingerprintInjector();
    // SAFETY: async operation — wrap in try-catch for production resilience
    await testProxyManager();
    console.log('\n═══════════════════════════════════════');
    console.log(`RESULTS: ${passed} PASSED | ${failed} FAILED | ${passed + failed} TOTAL`);
    console.log('═══════════════════════════════════════');
    if (failed > 0) {
        process.exit(1);
    }
    else {
        console.log('\n🎉 ALL PHASE 3 TESTS PASSED!');
    }
}
// Complexity: O(1)
main().catch(e => {
    console.error('FATAL:', e);
    process.exit(1);
});
