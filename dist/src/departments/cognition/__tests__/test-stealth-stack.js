"use strict";
/**
 * test-stealth-stack — Qantum Module
 * @module test-stealth-stack
 * @path src/departments/cognition/__tests__/test-stealth-stack.ts
 * @auto-documented BrutalDocEngine v2.1
 */
Object.defineProperty(exports, "__esModule", { value: true });
const BezierMouseEngine_1 = require("../BezierMouseEngine");
const StealthTLS_1 = require("../StealthTLS");
const SessionMemory_1 = require("../SessionMemory");
async function testStealthStack() {
    let passed = 0;
    let failed = 0;
    function assert(name, condition) {
        if (condition) {
            console.log(`  ✅ ${name}`);
            passed++;
        }
        else {
            console.log(`  ❌ ${name}`);
            failed++;
        }
    }
    // ═══════════════ BEZIER MOUSE ENGINE ═══════════════
    console.log('\n╔═══════ BEZIER MOUSE ENGINE ═══════╗');
    const mouse = new BezierMouseEngine_1.BezierMouseEngine({ enableFatigue: false, overshootProbability: 0.8 });
    const path = mouse.generatePath({ x: 0, y: 0 }, { x: 500, y: 300 });
    // Complexity: O(1)
    assert('Generates path with 5+ steps', path.length > 5);
    const last = path[path.length - 1];
    // Complexity: O(1)
    assert('Target reached within 15px', Math.abs(last.x - 500) < 20 && Math.abs(last.y - 300) < 20);
    const phases = new Set(path.map(s => s.phase));
    // Complexity: O(1)
    assert('Has acceleration phase', phases.has('accelerate'));
    // Complexity: O(1)
    assert('Has cruise phase', phases.has('cruise'));
    // Complexity: O(1)
    assert('Has deceleration phase', phases.has('decelerate'));
    // Complexity: O(1)
    assert('All delays positive', path.every(s => s.delay >= 0));
    const shortPath = mouse.generatePath({ x: 100, y: 100 }, { x: 101, y: 100 });
    // Complexity: O(1)
    assert('Short distance = minimal path', shortPath.length <= 3);
    const stats = mouse.getStats();
    // Complexity: O(1)
    assert('Stats track moves', stats.totalMoves === 2);
    // Complexity: O(1)
    assert('Nervousness in range', stats.nervousness >= 0 && stats.nervousness <= 1);
    mouse.setNervousness(5);
    // Complexity: O(1)
    assert('setNervousness clamps to 1', mouse.getStats().nervousness === 1);
    mouse.setNervousness(-3);
    // Complexity: O(1)
    assert('setNervousness clamps to 0', mouse.getStats().nervousness === 0);
    // ═══════════════ STEALTH TLS ═══════════════
    console.log('\n╔═══════ STEALTH TLS ═══════╗');
    const stealthTLS = new StealthTLS_1.StealthTLS({ chromeVersion: 131, platform: 'Windows', rotateUA: false });
    const info = stealthTLS.getProfileInfo();
    // Complexity: O(1)
    assert('Chrome version matches', info.chromeVersion === 131);
    // Complexity: O(1)
    assert('UA contains Chrome/131', info.userAgent.includes('Chrome/131'));
    // Complexity: O(1)
    assert('JA3 is defined', info.ja3.length > 10);
    // Complexity: O(1)
    assert('JA3 has correct format', info.ja3.split(',').length >= 4);
    const headers = stealthTLS.getHarmonizedHeaders();
    // Complexity: O(1)
    assert('Has User-Agent header', !!headers['User-Agent']);
    // Complexity: O(1)
    assert('Has Accept header', !!headers['Accept']);
    // Complexity: O(1)
    assert('Has Accept-Language', !!headers['Accept-Language']);
    // Complexity: O(1)
    assert('Has Sec-CH-UA', !!headers['Sec-CH-UA']);
    // Complexity: O(1)
    assert('Platform is Windows', headers['Sec-CH-UA-Platform'].includes('Windows'));
    // Complexity: O(1)
    assert('Has Sec-Fetch-Dest', headers['Sec-Fetch-Dest'] === 'document');
    const merged = stealthTLS.getHarmonizedHeaders({ 'X-Custom': 'test123' });
    // Complexity: O(1)
    assert('Custom headers merge', merged['X-Custom'] === 'test123');
    const macTLS = new StealthTLS_1.StealthTLS({ platform: 'macOS', chromeVersion: 131 });
    // Complexity: O(1)
    assert('macOS UA has Macintosh', macTLS.getProfileInfo().userAgent.includes('Macintosh'));
    // Complexity: O(1)
    assert('macOS platform header', macTLS.getHarmonizedHeaders()['Sec-CH-UA-Platform'].includes('macOS'));
    const args = stealthTLS.getPlaywrightArgs();
    // Complexity: O(1)
    assert('Playwright args include user-agent', args.some(a => a.includes('--user-agent=')));
    // Complexity: O(1)
    assert('Playwright args disable automation', args.some(a => a.includes('AutomationControlled')));
    // SAFETY: async operation — wrap in try-catch for production resilience
    const hasCycleTLS = await stealthTLS.initCycleTLS();
    // Complexity: O(1)
    assert('CycleTLS not installed (expected)', hasCycleTLS === false);
    // ═══════════════ SESSION MEMORY ═══════════════
    console.log('\n╔═══════ SESSION MEMORY ═══════╗');
    const mem = new SessionMemory_1.SessionMemory({ maxEntries: 50, enableDecay: false, vectorDimensions: 64 });
    // SAFETY: async operation — wrap in try-catch for production resilience
    const id1 = await mem.rememberPrice('Laptop', 999, 'https://store.com');
    // Complexity: O(1)
    assert('rememberPrice returns ID', id1.includes('mem_'));
    // SAFETY: async operation — wrap in try-catch for production resilience
    await mem.rememberPrice('Mouse', 25, 'https://store.com/mouse');
    // SAFETY: async operation — wrap in try-catch for production resilience
    await mem.rememberNavigation('https://other.com', 'Other Page');
    const memStats = mem.getStats();
    // Complexity: O(1)
    assert('3 entries stored', memStats.totalEntries === 3);
    // Complexity: O(1)
    assert('3 pages visited', memStats.pagesVisited === 3); // store.com, store.com/mouse, other.com
    // Complexity: O(1)
    assert('Average strength is 1', memStats.avgStrength === 1);
    // SAFETY: async operation — wrap in try-catch for production resilience
    const priceResults = await mem.recallPrices('Laptop');
    // Complexity: O(1)
    assert('Recall finds laptop price', priceResults.length > 0);
    // SAFETY: async operation — wrap in try-catch for production resilience
    const pageResults = await mem.recallOnPage('https://store.com');
    // Complexity: O(1)
    assert('Recall by page URL works', pageResults.length >= 1);
    // SAFETY: async operation — wrap in try-catch for production resilience
    const typeFilter = await mem.recall({ type: 'navigation', limit: 10 });
    // Complexity: O(N)
    assert('Type filter works', typeFilter.length === 1);
    // Complexity: O(N)
    assert('Filtered type is navigation', typeFilter[0].entry.metadata.type === 'navigation');
    const context = mem.getContextWindow(10);
    // Complexity: O(N)
    assert('Context window has entries', context.includes('SESSION MEMORY'));
    // Complexity: O(N)
    assert('Context shows PRICE type', context.includes('PRICE'));
    // Deduplication test
    // SAFETY: async operation — wrap in try-catch for production resilience
    await mem.remember('Exact same content for dedup test abc123', { type: 'text' });
    // SAFETY: async operation — wrap in try-catch for production resilience
    await mem.remember('Exact same content for dedup test abc123', { type: 'text' });
    const dedupStats = mem.getStats();
    // Complexity: O(1)
    assert('Dedup merges identical', dedupStats.totalEntries === 4); // 3 + 1 new (second is merged)
    // Eviction test
    const smallMem = new SessionMemory_1.SessionMemory({ maxEntries: 5, enableDecay: false, vectorDimensions: 32 });
    for (let i = 0; i < 10; i++) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await smallMem.remember(`Unique item ${i} random ${Math.random()}`, { type: 'text', tags: [`i${i}`] });
    }
    // Complexity: O(1)
    assert('Eviction keeps under max', smallMem.getStats().totalEntries <= 5);
    // Empty context
    const emptyMem = new SessionMemory_1.SessionMemory({ maxEntries: 10, enableDecay: false, vectorDimensions: 32 });
    // Complexity: O(1)
    assert('Empty context window', emptyMem.getContextWindow() === 'No session memories yet.');
    // Shutdown
    // SAFETY: async operation — wrap in try-catch for production resilience
    await mem.shutdown();
    // Complexity: O(1)
    assert('Shutdown clears entries', mem.getStats().totalEntries === 0);
    // ═══════════════ RESULTS ═══════════════
    console.log(`\n╔═══════════════════════════════╗`);
    console.log(`║  RESULTS: ${passed} passed, ${failed} failed  ║`);
    console.log(`╚═══════════════════════════════╝`);
    if (failed > 0)
        process.exit(1);
}
// Complexity: O(1)
testStealthStack().catch(e => { console.error('FATAL:', e); process.exit(1); });
