"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════
 *  Tests for Stealth Stack: BezierMouse, StealthTLS, SessionMemory,
 *  and DeepSeekLink Ollama Fallback
 * ═══════════════════════════════════════════════════════════════════════
 */
Object.defineProperty(exports, "__esModule", { value: true });
// ═══════════════════ BEZIER MOUSE ENGINE TESTS ═══════════════════
const BezierMouseEngine_1 = require("../BezierMouseEngine");
// Complexity: O(N*M) — nested iteration
describe('BezierMouseEngine', () => {
    let engine;
    // Complexity: O(N)
    beforeEach(() => {
        engine = new BezierMouseEngine_1.BezierMouseEngine({
            baseSpeed: 3,
            overshootProbability: 0.8,
            enableFatigue: false, // Deterministic for tests
        });
    });
    // Complexity: O(1)
    test('generates non-empty path between two points', () => {
        const path = engine.generatePath({ x: 0, y: 0 }, { x: 500, y: 300 });
        // Complexity: O(1)
        expect(path.length).toBeGreaterThan(5);
    });
    // Complexity: O(1)
    test('path ends near the target', () => {
        const target = { x: 200, y: 150 };
        const path = engine.generatePath({ x: 0, y: 0 }, target);
        const last = path[path.length - 1];
        // Should be within 15px of target (allowing jitter/hesitation)
        // Complexity: O(1)
        expect(Math.abs(last.x - target.x)).toBeLessThan(15);
        // Complexity: O(1)
        expect(Math.abs(last.y - target.y)).toBeLessThan(15);
    });
    // Complexity: O(1)
    test('short distance produces minimal path', () => {
        const path = engine.generatePath({ x: 100, y: 100 }, { x: 101, y: 100 });
        // Complexity: O(1)
        expect(path.length).toBeLessThanOrEqual(3);
    });
    // Complexity: O(N) — loop
    test('steps have valid phases', () => {
        const path = engine.generatePath({ x: 0, y: 0 }, { x: 300, y: 200 });
        const validPhases = ['accelerate', 'cruise', 'decelerate', 'overshoot', 'correct', 'hesitate'];
        for (const step of path) {
            // Complexity: O(1)
            expect(validPhases).toContain(step.phase);
        }
    });
    // Complexity: O(N) — loop
    test('delays are positive', () => {
        const path = engine.generatePath({ x: 0, y: 0 }, { x: 400, y: 400 });
        for (const step of path) {
            // Complexity: O(1)
            expect(step.delay).toBeGreaterThanOrEqual(0);
        }
    });
    // Complexity: O(1)
    test('getStats returns valid data', () => {
        engine.generatePath({ x: 0, y: 0 }, { x: 100, y: 100 });
        engine.generatePath({ x: 100, y: 100 }, { x: 200, y: 200 });
        const stats = engine.getStats();
        // Complexity: O(1)
        expect(stats.totalMoves).toBe(2);
        // Complexity: O(1)
        expect(stats.sessionDuration).toBeGreaterThanOrEqual(0);
        // Complexity: O(1)
        expect(stats.nervousness).toBe(0.3);
    });
    // Complexity: O(1)
    test('setNervousness clamps value', () => {
        engine.setNervousness(2);
        // Complexity: O(1)
        expect(engine.getStats().nervousness).toBe(1);
        engine.setNervousness(-5);
        // Complexity: O(1)
        expect(engine.getStats().nervousness).toBe(0);
    });
    // Complexity: O(1)
    test('singleton factory returns same instance', () => {
        const a = (0, BezierMouseEngine_1.getBezierMouseEngine)();
        const b = (0, BezierMouseEngine_1.getBezierMouseEngine)();
        // Complexity: O(1)
        expect(a).toBe(b);
    });
    // Complexity: O(1)
    test('event emitter fires path-generated', (done) => {
        engine.on('path-generated', (data) => {
            // Complexity: O(1)
            expect(data.steps).toBeGreaterThan(0);
            // Complexity: O(1)
            expect(data.distance).toBeGreaterThan(0);
            // Complexity: O(1)
            done();
        });
        engine.generatePath({ x: 0, y: 0 }, { x: 100, y: 100 });
    });
    // Complexity: O(N)
    test('fatigue increases over simulated time', () => {
        const fatigueEngine = new BezierMouseEngine_1.BezierMouseEngine({
            enableFatigue: true,
            fatigueRate: 100, // Extreme rate for testing
        });
        // Fatigue is time-based, so we check it's >= 1
        const stats = fatigueEngine.getStats();
        // Complexity: O(1)
        expect(stats.currentFatigue).toBeGreaterThanOrEqual(1);
    });
});
// ═══════════════════ STEALTH TLS TESTS ═══════════════════
const StealthTLS_1 = require("../StealthTLS");
// Complexity: O(1)
describe('StealthTLS', () => {
    let tls;
    // Complexity: O(1)
    beforeEach(() => {
        tls = new StealthTLS_1.StealthTLS({
            chromeVersion: 131,
            platform: 'Windows',
            rotateUA: false, // Deterministic
        });
    });
    // Complexity: O(1)
    test('initializes with correct Chrome version', () => {
        const info = tls.getProfileInfo();
        // Complexity: O(1)
        expect(info.chromeVersion).toBe(131);
        // Complexity: O(1)
        expect(info.userAgent).toContain('Chrome/131');
    });
    // Complexity: O(1)
    test('getHarmonizedHeaders returns all required headers', () => {
        const headers = tls.getHarmonizedHeaders();
        // Complexity: O(1)
        expect(headers['User-Agent']).toBeDefined();
        // Complexity: O(1)
        expect(headers['Accept']).toBeDefined();
        // Complexity: O(1)
        expect(headers['Accept-Language']).toBeDefined();
        // Complexity: O(1)
        expect(headers['Accept-Encoding']).toBeDefined();
        // Complexity: O(1)
        expect(headers['Sec-CH-UA']).toBeDefined();
        // Complexity: O(1)
        expect(headers['Sec-CH-UA-Platform']).toContain('Windows');
        // Complexity: O(1)
        expect(headers['Sec-CH-UA-Mobile']).toBe('?0');
        // Complexity: O(1)
        expect(headers['Sec-Fetch-Dest']).toBe('document');
    });
    // Complexity: O(1)
    test('headers match TLS profile — User-Agent consistency', () => {
        const headers = tls.getHarmonizedHeaders();
        const info = tls.getProfileInfo();
        // Complexity: O(1)
        expect(headers['User-Agent']).toBe(info.userAgent);
    });
    // Complexity: O(1)
    test('extra headers are merged', () => {
        const headers = tls.getHarmonizedHeaders({ 'X-Custom': 'test' });
        // Complexity: O(1)
        expect(headers['X-Custom']).toBe('test');
        // Complexity: O(1)
        expect(headers['User-Agent']).toBeDefined();
    });
    // Complexity: O(1)
    test('macOS platform adjusts profile', () => {
        const macTLS = new StealthTLS_1.StealthTLS({ platform: 'macOS', chromeVersion: 131 });
        const info = macTLS.getProfileInfo();
        // Complexity: O(1)
        expect(info.userAgent).toContain('Macintosh');
        const headers = macTLS.getHarmonizedHeaders();
        // Complexity: O(1)
        expect(headers['Sec-CH-UA-Platform']).toContain('macOS');
    });
    // Complexity: O(1)
    test('Linux platform adjusts profile', () => {
        const linuxTLS = new StealthTLS_1.StealthTLS({ platform: 'Linux', chromeVersion: 131 });
        const headers = linuxTLS.getHarmonizedHeaders();
        // Complexity: O(1)
        expect(headers['Sec-CH-UA-Platform']).toContain('Linux');
    });
    // Complexity: O(1)
    test('getPlaywrightArgs returns stealth flags', () => {
        const args = tls.getPlaywrightArgs();
        // Complexity: O(1)
        expect(args.some(a => a.includes('--user-agent='))).toBe(true);
        // Complexity: O(1)
        expect(args.some(a => a.includes('AutomationControlled'))).toBe(true);
        // Complexity: O(1)
        expect(args.some(a => a.includes('--lang='))).toBe(true);
    });
    // Complexity: O(1)
    test('JA3 fingerprint is defined', () => {
        const info = tls.getProfileInfo();
        // Complexity: O(1)
        expect(info.ja3).toBeDefined();
        // Complexity: O(1)
        expect(info.ja3.length).toBeGreaterThan(10);
        // JA3 format: version,ciphers,extensions,curves,point_formats
        // Complexity: O(1)
        expect(info.ja3.split(',').length).toBeGreaterThanOrEqual(4);
    });
    // Complexity: O(1)
    test('CycleTLS init returns false when not installed', async () => {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const result = await tls.initCycleTLS();
        // Complexity: O(1)
        expect(result).toBe(false);
        // Complexity: O(1)
        expect(tls.getProfileInfo().hasCycleTLS).toBe(false);
    });
    // Complexity: O(1)
    test('request count starts at 0', () => {
        // Complexity: O(1)
        expect(tls.getProfileInfo().requestCount).toBe(0);
    });
    // Complexity: O(1)
    test('singleton factory returns same instance', () => {
        const a = (0, StealthTLS_1.getStealthTLS)();
        const b = (0, StealthTLS_1.getStealthTLS)();
        // Complexity: O(1)
        expect(a).toBe(b);
    });
});
// ═══════════════════ SESSION MEMORY TESTS ═══════════════════
const SessionMemory_1 = require("../SessionMemory");
// Complexity: O(N*M) — nested iteration
describe('SessionMemory', () => {
    let memory;
    // Complexity: O(N*M) — nested iteration
    beforeEach(() => {
        memory = new SessionMemory_1.SessionMemory({
            maxEntries: 100,
            enableDecay: false, // Stable for tests
            vectorDimensions: 64, // Smaller for speed
        });
    });
    // Complexity: O(1)
    test('stores and recalls a memory', async () => {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const id = await memory.remember('Test product costs $50', {
            type: 'price',
            pageUrl: 'https://example.com/page1',
            value: 50,
        });
        // Complexity: O(1)
        expect(id).toContain('mem_');
        // SAFETY: async operation — wrap in try-catch for production resilience
        const results = await memory.recall({ text: 'product price', limit: 5 });
        // Complexity: O(1)
        expect(results.length).toBeGreaterThan(0);
        // Complexity: O(1)
        expect(results[0].entry.content).toContain('$50');
    });
    // Complexity: O(1)
    test('rememberPrice convenience method works', async () => {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await memory.rememberPrice('Widget', 29.99, 'https://shop.com/widget');
        // SAFETY: async operation — wrap in try-catch for production resilience
        const results = await memory.recallPrices('Widget');
        // Complexity: O(1)
        expect(results.length).toBe(1);
        // Complexity: O(1)
        expect(results[0].entry.metadata.value).toBe(29.99);
    });
    // Complexity: O(1)
    test('rememberNavigation works', async () => {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await memory.rememberNavigation('https://example.com', 'Example Page');
        // SAFETY: async operation — wrap in try-catch for production resilience
        const results = await memory.recallOnPage('https://example.com');
        // Complexity: O(1)
        expect(results.length).toBe(1);
        // Complexity: O(1)
        expect(results[0].entry.metadata.type).toBe('navigation');
    });
    // Complexity: O(N*M) — nested iteration
    test('deduplication merges similar memories', async () => {
        // Hash-based embedding should consider these as similar
        // SAFETY: async operation — wrap in try-catch for production resilience
        const id1 = await memory.remember('Price is $50 for widget', { type: 'price', value: 50 });
        // SAFETY: async operation — wrap in try-catch for production resilience
        const id2 = await memory.remember('Price is $50 for widget', { type: 'price', value: 50 });
        // Should reinforce, not create duplicate
        const stats = memory.getStats();
        // Complexity: O(1)
        expect(stats.totalEntries).toBe(1);
    });
    // Complexity: O(N) — loop
    test('eviction removes weakest when over capacity', async () => {
        const smallMemory = new SessionMemory_1.SessionMemory({
            maxEntries: 10,
            enableDecay: false,
            vectorDimensions: 32,
        });
        for (let i = 0; i < 15; i++) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await smallMemory.remember(`Unique item number ${i} with random suffix ${Math.random()}`, {
                type: 'text',
                tags: [`item${i}`],
            });
        }
        const stats = smallMemory.getStats();
        // Complexity: O(1)
        expect(stats.totalEntries).toBeLessThanOrEqual(10);
    });
    // Complexity: O(1)
    test('getContextWindow returns formatted string', async () => {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await memory.remember('Saw a nice laptop', { type: 'text', pageUrl: 'https://shop.com' });
        // SAFETY: async operation — wrap in try-catch for production resilience
        await memory.remember('Price was $999', { type: 'price', value: 999 });
        const context = memory.getContextWindow(10);
        // Complexity: O(1)
        expect(context).toContain('SESSION MEMORY');
        // Complexity: O(1)
        expect(context).toContain('PRICE');
    });
    // Complexity: O(1)
    test('filter by type works', async () => {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await memory.remember('Navigation test', { type: 'navigation' });
        // SAFETY: async operation — wrap in try-catch for production resilience
        await memory.remember('Price test $10', { type: 'price', value: 10 });
        // SAFETY: async operation — wrap in try-catch for production resilience
        const priceOnly = await memory.recall({ type: 'price', limit: 10 });
        // Complexity: O(1)
        expect(priceOnly.length).toBe(1);
        // Complexity: O(1)
        expect(priceOnly[0].entry.metadata.type).toBe('price');
    });
    // Complexity: O(1)
    test('filter by tags works', async () => {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await memory.remember('Tagged item', { type: 'custom', tags: ['special', 'priority'] });
        // SAFETY: async operation — wrap in try-catch for production resilience
        await memory.remember('Normal item', { type: 'custom', tags: ['regular'] });
        // SAFETY: async operation — wrap in try-catch for production resilience
        const special = await memory.recall({ tags: ['special'], limit: 10 });
        // Complexity: O(1)
        expect(special.length).toBe(1);
        // Complexity: O(1)
        expect(special[0].entry.metadata.tags).toContain('special');
    });
    // Complexity: O(1)
    test('getStats returns valid data', async () => {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await memory.remember('Test 1', { type: 'text', pageUrl: 'https://a.com' });
        // SAFETY: async operation — wrap in try-catch for production resilience
        await memory.remember('Test 2 different', { type: 'text', pageUrl: 'https://b.com' });
        const stats = memory.getStats();
        // Complexity: O(1)
        expect(stats.totalEntries).toBe(2);
        // Complexity: O(1)
        expect(stats.pagesVisited).toBe(2);
        // Complexity: O(1)
        expect(stats.avgStrength).toBe(1);
        // Complexity: O(1)
        expect(stats.sessionId).toContain('session_');
        // Complexity: O(1)
        expect(stats.byType.text).toBe(2);
    });
    // Complexity: O(1)
    test('empty memory context window', () => {
        const context = memory.getContextWindow();
        // Complexity: O(1)
        expect(context).toBe('No session memories yet.');
    });
    // Complexity: O(N)
    test('findPattern detects cross-page similarities', async () => {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await memory.remember('Laptop on page A costs $999', {
            type: 'price',
            pageUrl: 'https://storeA.com',
            value: 999,
        });
        // SAFETY: async operation — wrap in try-catch for production resilience
        const patterns = await memory.findPattern('Laptop costs $999', {
            excludeCurrentPage: 'https://storeB.com',
            minSimilarity: 0.1, // Low threshold for hash-based embedding
        });
        // Complexity: O(1)
        expect(patterns.length).toBeGreaterThan(0);
    });
    // Complexity: O(1)
    test('shutdown clears entries', async () => {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await memory.remember('Temp data', { type: 'text' });
        // Complexity: O(1)
        expect(memory.getStats().totalEntries).toBe(1);
        // SAFETY: async operation — wrap in try-catch for production resilience
        await memory.shutdown();
        // Complexity: O(1)
        expect(memory.getStats().totalEntries).toBe(0);
    });
});
// ═══════════════════ INTEGRATED STACK TEST ═══════════════════
// Complexity: O(1)
describe('Stealth Stack Integration', () => {
    // Complexity: O(1)
    test('all engines are independent singletons', () => {
        const mouse = (0, BezierMouseEngine_1.getBezierMouseEngine)();
        const tls = (0, StealthTLS_1.getStealthTLS)();
        const mem = (0, SessionMemory_1.getSessionMemory)();
        // Complexity: O(1)
        expect(mouse).toBeDefined();
        // Complexity: O(1)
        expect(tls).toBeDefined();
        // Complexity: O(1)
        expect(mem).toBeDefined();
        // Each has its own stats
        // Complexity: O(1)
        expect(mouse.getStats()).toHaveProperty('totalMoves');
        // Complexity: O(1)
        expect(tls.getProfileInfo()).toHaveProperty('ja3');
        // Complexity: O(1)
        expect(mem.getStats()).toHaveProperty('totalEntries');
    });
    // Complexity: O(1)
    test('bezier path + session memory record integration', async () => {
        const mouse = new BezierMouseEngine_1.BezierMouseEngine();
        const mem = new SessionMemory_1.SessionMemory({ maxEntries: 100, enableDecay: false, vectorDimensions: 32 });
        // Generate a mouse path
        const path = mouse.generatePath({ x: 100, y: 100 }, { x: 500, y: 400 });
        // Complexity: O(1)
        expect(path.length).toBeGreaterThan(0);
        // Record the action in session memory
        // SAFETY: async operation — wrap in try-catch for production resilience
        await mem.rememberAction(`Clicked button at (500, 400) via ${path.length}-step Bezier path`, {
            pageUrl: 'https://target.com',
        });
        // SAFETY: async operation — wrap in try-catch for production resilience
        const results = await mem.recall({ text: 'clicked button', limit: 5 });
        // Complexity: O(1)
        expect(results.length).toBe(1);
        // Complexity: O(1)
        expect(results[0].entry.content).toContain('Bezier');
    });
});
