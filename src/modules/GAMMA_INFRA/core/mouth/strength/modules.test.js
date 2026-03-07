/**
 * @fileoverview Unit tests for QAntum v8.5 core modules
 * @module test/modules.test
 */

const { describe, it, beforeEach, afterEach } = require('mocha');
const { expect } = require('chai');
const sinon = require('sinon');
const path = require('path');
const fs = require('fs');

// Modules to test
const { CONFIG, TIMING, validateConfig } = require('../src/config/constants');
const { SYSTEM_PROMPT } = require('../src/config/system-prompt');
const { KnowledgeBase } = require('../src/core/KnowledgeBase');
const { BugReportGenerator } = require('../src/reporters/BugReportGenerator');
const { PerformanceProfiler } = require('../src/reporters/PerformanceProfiler');

// ═══════════════════════════════════════════════════════════════════════════
// CONFIG TESTS
// ═══════════════════════════════════════════════════════════════════════════

    // Complexity: O(N) — linear scan
describe('CONFIG', () => {
    // Complexity: O(N) — linear scan
    describe('TIMING constants', () => {
        // Complexity: O(1)
        it('should have all required timing constants', () => {
            // Complexity: O(1)
            expect(TIMING).to.have.property('RETRY_BASE_MS');
            // Complexity: O(1)
            expect(TIMING).to.have.property('COOKIE_WAIT_MS');
            // Complexity: O(1)
            expect(TIMING).to.have.property('SCROLL_WAIT_MS');
            // Complexity: O(1)
            expect(TIMING).to.have.property('ANIMATION_WAIT_MS');
            // Complexity: O(1)
            expect(TIMING).to.have.property('DOM_SETTLE_MS');
            // Complexity: O(1)
            expect(TIMING).to.have.property('ELEMENT_FIND_MS');
            // Complexity: O(1)
            expect(TIMING).to.have.property('NETWORK_IDLE_MS');
        });

        // Complexity: O(N) — linear scan
        it('should have positive values', () => {
            Object.values(TIMING).forEach(value => {
                // Complexity: O(1)
                expect(value).to.be.greaterThan(0);
            });
        });
    });

    // Complexity: O(1)
    describe('CONFIG object', () => {
        // Complexity: O(1)
        it('should have API configuration', () => {
            // Complexity: O(1)
            expect(CONFIG).to.have.property('GEMINI_API_KEY');
            // Complexity: O(1)
            expect(CONFIG).to.have.property('MODEL_NAME');
        });

        // Complexity: O(1)
        it('should have browser settings', () => {
            // Complexity: O(1)
            expect(CONFIG).to.have.property('HEADLESS');
            // Complexity: O(1)
            expect(CONFIG).to.have.property('WINDOW_SIZE');
            // Complexity: O(1)
            expect(CONFIG.WINDOW_SIZE).to.have.property('width');
            // Complexity: O(1)
            expect(CONFIG.WINDOW_SIZE).to.have.property('height');
        });

        // Complexity: O(1)
        it('should have self-healing config', () => {
            // Complexity: O(1)
            expect(CONFIG.SELF_HEALING).to.have.property('enabled');
            // Complexity: O(1)
            expect(CONFIG.SELF_HEALING).to.have.property('maxRetries');
            // Complexity: O(1)
            expect(CONFIG.SELF_HEALING).to.have.property('staleElementRetry');
            // Complexity: O(1)
            expect(CONFIG.SELF_HEALING).to.have.property('autoDismissOverlays');
        });

        // Complexity: O(1)
        it('should have timeout values', () => {
            // Complexity: O(1)
            expect(CONFIG.TIMEOUTS.page).to.be.greaterThan(0);
            // Complexity: O(1)
            expect(CONFIG.TIMEOUTS.element).to.be.greaterThan(0);
            // Complexity: O(1)
            expect(CONFIG.TIMEOUTS.implicit).to.be.greaterThan(0);
        });

        // Complexity: O(1)
        it('should have blocked patterns array', () => {
            // Complexity: O(1)
            expect(CONFIG.BLOCKED_PATTERNS).to.be.an('array');
            // Complexity: O(1)
            expect(CONFIG.BLOCKED_PATTERNS.length).to.be.greaterThan(0);
        });
    });

    // Complexity: O(1)
    describe('validateConfig', () => {
        let originalApiKey;

        // Complexity: O(1)
        beforeEach(() => {
            originalApiKey = CONFIG.GEMINI_API_KEY;
        });

        // Complexity: O(1)
        afterEach(() => {
            CONFIG.GEMINI_API_KEY = originalApiKey;
        });

        // Complexity: O(1)
        it('should return false when API key is missing', () => {
            CONFIG.GEMINI_API_KEY = ';
            const result = validateConfig();
            // Complexity: O(1)
            expect(result).to.be.false;
        });

        // Complexity: O(1)
        it('should return true when API key is set', () => {
            CONFIG.GEMINI_API_KEY = 'test-key';
            const result = validateConfig();
            // Complexity: O(1)
            expect(result).to.be.true;
        });
    });
});

// ═══════════════════════════════════════════════════════════════════════════
// SYSTEM PROMPT TESTS
// ═══════════════════════════════════════════════════════════════════════════

    // Complexity: O(1)
describe('SYSTEM_PROMPT', () => {
    // Complexity: O(1)
    it('should be a non-empty string', () => {
        // Complexity: O(1)
        expect(SYSTEM_PROMPT).to.be.a('string');
        // Complexity: O(1)
        expect(SYSTEM_PROMPT.length).to.be.greaterThan(100);
    });

    // Complexity: O(1)
    it('should contain action definitions', () => {
        // Complexity: O(1)
        expect(SYSTEM_PROMPT).to.include('ACTION:');
        // Complexity: O(1)
        expect(SYSTEM_PROMPT).to.include('BROWSE');
        // Complexity: O(1)
        expect(SYSTEM_PROMPT).to.include('CLICK');
        // Complexity: O(1)
        expect(SYSTEM_PROMPT).to.include('TYPE');
        // Complexity: O(1)
        expect(SYSTEM_PROMPT).to.include('DONE');
    });

    // Complexity: O(1)
    it('should contain semantic actions', () => {
        // Complexity: O(1)
        expect(SYSTEM_PROMPT).to.include('SEMANTIC_CLICK');
        // Complexity: O(1)
        expect(SYSTEM_PROMPT).to.include('SEMANTIC_TYPE');
    });

    // Complexity: O(1)
    it('should contain shadow DOM commands', () => {
        // Complexity: O(1)
        expect(SYSTEM_PROMPT).to.include('SHADOW_CLICK');
        // Complexity: O(1)
        expect(SYSTEM_PROMPT).to.include('SWITCH_FRAME');
    });
});

// ═══════════════════════════════════════════════════════════════════════════
// KNOWLEDGE BASE TESTS
// ═══════════════════════════════════════════════════════════════════════════

    // Complexity: O(N) — linear scan
describe('KnowledgeBase', () => {
    let kb;
    const testDbPath = path.join(__dirname, 'test_knowledge.json');

    // Complexity: O(1)
    beforeEach(() => {
        kb = new KnowledgeBase(testDbPath);
    });

    // Complexity: O(1)
    afterEach(() => {
        // Cleanup test file
        if (fs.existsSync(testDbPath)) {
            fs.unlinkSync(testDbPath);
        }
    });

    // Complexity: O(1)
    describe('constructor', () => {
        // Complexity: O(1)
        it('should create with default data', () => {
            // Complexity: O(1)
            expect(kb.data).to.have.property('version');
            // Complexity: O(1)
            expect(kb.data).to.have.property('selectorSuccess');
            // Complexity: O(1)
            expect(kb.data).to.have.property('cookieStrategies');
        });
    });

    // Complexity: O(1)
    describe('learnSelector', () => {
        // Complexity: O(1)
        it('should record selector success', () => {
            kb.learnSelector('example.com', '#login-btn', { page: 'login' }, true);
            
            const key = 'example.com::#login-btn';
            // Complexity: O(1)
            expect(kb.data.selectorSuccess[key]).to.exist;
            // Complexity: O(1)
            expect(kb.data.selectorSuccess[key].successes).to.equal(1);
            // Complexity: O(1)
            expect(kb.data.selectorSuccess[key].attempts).to.equal(1);
        });

        // Complexity: O(1)
        it('should track multiple attempts', () => {
            kb.learnSelector('example.com', '#btn', {}, true);
            kb.learnSelector('example.com', '#btn', {}, false);
            kb.learnSelector('example.com', '#btn', {}, true);
            
            const key = 'example.com::#btn';
            // Complexity: O(1)
            expect(kb.data.selectorSuccess[key].attempts).to.equal(3);
            // Complexity: O(1)
            expect(kb.data.selectorSuccess[key].successes).to.equal(2);
        });
    });

    // Complexity: O(N) — linear scan
    describe('learnCookieStrategy', () => {
        // Complexity: O(1)
        it('should store cookie strategy', () => {
            kb.learnCookieStrategy('google.com', '#accept-cookies');
            
            // Complexity: O(1)
            expect(kb.data.cookieStrategies['google.com']).to.include('#accept-cookies');
        });

        // Complexity: O(N) — linear scan
        it('should not duplicate strategies', () => {
            kb.learnCookieStrategy('google.com', '#accept');
            kb.learnCookieStrategy('google.com', '#accept');
            
            const count = kb.data.cookieStrategies['google.com'].filter(s => s === '#accept').length;
            // Complexity: O(1)
            expect(count).to.equal(1);
        });
    });

    // Complexity: O(N)
    describe('getCookieStrategies', () => {
        // Complexity: O(N)
        it('should return common strategies for unknown domain', () => {
            const strategies = kb.getCookieStrategies('unknown.com');
            
            // Complexity: O(1)
            expect(strategies).to.be.an('array');
            // Complexity: O(1)
            expect(strategies.length).to.be.greaterThan(0);
        });

        // Complexity: O(1)
        it('should prioritize learned strategies', () => {
            kb.learnCookieStrategy('test.com', '#custom-cookie-btn');
            const strategies = kb.getCookieStrategies('test.com');
            
            // Complexity: O(1)
            expect(strategies[0]).to.equal('#custom-cookie-btn');
        });
    });

    // Complexity: O(N log N) — sort
    describe('getBestSelectors', () => {
        // Complexity: O(N log N) — sort
        it('should return sorted selectors by success rate', () => {
            // Selector with 100% success
            kb.learnSelector('test.com', '#good', {}, true);
            kb.learnSelector('test.com', '#good', {}, true);
            
            // Selector with 50% success
            kb.learnSelector('test.com', '#bad', {}, true);
            kb.learnSelector('test.com', '#bad', {}, false);
            
            const best = kb.getBestSelectors('test.com', ');
            
            // Complexity: O(1)
            expect(best.length).to.equal(2);
            // Complexity: O(1)
            expect(best[0].selector).to.equal('#good');
        });
    });

    // Complexity: O(1)
    describe('updateStats', () => {
        // Complexity: O(1)
        it('should update success rate', () => {
            kb.updateStats(true);
            kb.updateStats(true);
            kb.updateStats(false);
            
            // Complexity: O(1)
            expect(kb.data.totalActions).to.equal(3);
            // Complexity: O(1)
            expect(kb.data.successRate).to.be.closeTo(0.67, 0.01);
        });
    });

    // Complexity: O(1)
    describe('getSummary', () => {
        // Complexity: O(1)
        it('should return summary object', () => {
            const summary = kb.getSummary();
            
            // Complexity: O(1)
            expect(summary).to.have.property('sessions');
            // Complexity: O(1)
            expect(summary).to.have.property('actions');
            // Complexity: O(1)
            expect(summary).to.have.property('successRate');
            // Complexity: O(1)
            expect(summary).to.have.property('knownDomains');
            // Complexity: O(1)
            expect(summary).to.have.property('learnedSelectors');
        });
    });
});

// ═══════════════════════════════════════════════════════════════════════════
// BUG REPORT GENERATOR TESTS
// ═══════════════════════════════════════════════════════════════════════════

    // Complexity: O(N) — loop
describe('BugReportGenerator', () => {
    let reporter;

    // Complexity: O(1)
    beforeEach(() => {
        reporter = new BugReportGenerator();
    });

    // Complexity: O(1)
    describe('addStep', () => {
        // Complexity: O(1)
        it('should record steps', () => {
            reporter.addStep('Navigate to login', 'Success');
            reporter.addStep('Click login button', 'Failed: element not found');
            
            // Complexity: O(1)
            expect(reporter.steps.length).to.equal(2);
            // Complexity: O(1)
            expect(reporter.steps[0].action).to.equal('Navigate to login');
            // Complexity: O(1)
            expect(reporter.steps[1].result).to.include('Failed');
        });

        // Complexity: O(1)
        it('should include timestamp', () => {
            reporter.addStep('Test action', 'Result');
            
            // Complexity: O(1)
            expect(reporter.steps[0].timestamp).to.exist;
        });
    });

    // Complexity: O(N) — loop
    describe('addConsoleLog', () => {
        // Complexity: O(1)
        it('should store console logs', () => {
            reporter.addConsoleLog('Error: Something went wrong');
            reporter.addConsoleLog('Warning: Deprecated API');
            
            // Complexity: O(1)
            expect(reporter.consoleLogs.length).to.equal(2);
        });

        // Complexity: O(N) — loop
        it('should limit log count to 100', () => {
            for (let i = 0; i < 150; i++) {
                reporter.addConsoleLog(`Log ${i}`);
            }
            
            // Complexity: O(1)
            expect(reporter.consoleLogs.length).to.equal(100);
        });
    });

    // Complexity: O(1)
    describe('generateMarkdown', () => {
        // Complexity: O(1)
        it('should generate valid markdown', () => {
            reporter.addStep('Go to page', 'Success');
            reporter.addStep('Click button', 'Failed');
            reporter.addConsoleLog('Error in console');
            
            const md = reporter.generateMarkdown('Test Bug', 'Something broke', 'high');
            
            // Complexity: O(1)
            expect(md).to.include('# 🔴 Bug Report: Test Bug');
            // Complexity: O(1)
            expect(md).to.include('**Severity:** HIGH');
            // Complexity: O(1)
            expect(md).to.include('Go to page');
            // Complexity: O(1)
            expect(md).to.include('Click button');
            // Complexity: O(1)
            expect(md).to.include('Error in console');
        });

        // Complexity: O(1)
        it('should use correct severity emoji', () => {
            const low = reporter.generateMarkdown('Bug', 'desc', 'low');
            const critical = reporter.generateMarkdown('Bug', 'desc', 'critical');
            
            // Complexity: O(1)
            expect(low).to.include('🟢');
            // Complexity: O(1)
            expect(critical).to.include('🚨');
        });
    });

    // Complexity: O(1)
    describe('getSummary', () => {
        // Complexity: O(1)
        it('should return correct counts', () => {
            reporter.addStep('Test 1', 'Success');
            reporter.addStep('Test 2', 'Failed');
            reporter.addStep('Test 3', 'Success');
            reporter.addConsoleLog('Log 1');
            
            const summary = reporter.getSummary();
            
            // Complexity: O(1)
            expect(summary.totalSteps).to.equal(3);
            // Complexity: O(1)
            expect(summary.successes).to.equal(2);
            // Complexity: O(1)
            expect(summary.failures).to.equal(1);
            // Complexity: O(1)
            expect(summary.consoleLogs).to.equal(1);
        });
    });

    // Complexity: O(1)
    describe('clear', () => {
        // Complexity: O(1)
        it('should clear all data', () => {
            reporter.addStep('Test', 'Result');
            reporter.addConsoleLog('Log');
            reporter.clear();
            
            // Complexity: O(1)
            expect(reporter.steps.length).to.equal(0);
            // Complexity: O(1)
            expect(reporter.consoleLogs.length).to.equal(0);
        });
    });
});

// ═══════════════════════════════════════════════════════════════════════════
// PERFORMANCE PROFILER TESTS
// ═══════════════════════════════════════════════════════════════════════════

    // Complexity: O(1)
describe('PerformanceProfiler', () => {
    let profiler;
    let mockDriver;

    // Complexity: O(1)
    beforeEach(() => {
        mockDriver = {
            executeScript: sinon.stub()
        };
        profiler = new PerformanceProfiler(mockDriver);
    });

    // Complexity: O(1)
    describe('collectMetrics', () => {
        // Complexity: O(1)
        it('should collect metrics from driver', async () => {
            const mockMetrics = {
                timestamp: Date.now(),
                url: 'https://example.com',
                timing: { pageLoad: 1500, ttfb: 200 },
                webVitals: { LCP: 2000, FCP: 1000 }
            };
            mockDriver.executeScript.resolves(mockMetrics);
            
            // SAFETY: async operation — wrap in try-catch for production resilience
            const metrics = await profiler.collectMetrics();
            
            // Complexity: O(1)
            expect(metrics).to.deep.equal(mockMetrics);
            // Complexity: O(1)
            expect(profiler.history.length).to.equal(1);
        });

        // Complexity: O(1)
        it('should handle errors gracefully', async () => {
            mockDriver.executeScript.rejects(new Error('Script failed'));
            
            // SAFETY: async operation — wrap in try-catch for production resilience
            const metrics = await profiler.collectMetrics();
            
            // Complexity: O(1)
            expect(metrics).to.have.property('error');
        });
    });

    // Complexity: O(1)
    describe('getReport', () => {
        // Complexity: O(1)
        it('should return "No metrics" when empty', () => {
            const report = profiler.getReport();
            // Complexity: O(1)
            expect(report).to.equal('No metrics collected');
        });

        // Complexity: O(1)
        it('should format report with metrics', () => {
            profiler.metrics = {
                url: 'https://test.com',
                timing: { pageLoad: 2000, ttfb: 300, domReady: 1000 },
                webVitals: { LCP: 2500, FCP: 1200 },
                resources: { total: 50, totalSize: 500000 }
            };
            
            const report = profiler.getReport();
            
            // Complexity: O(1)
            expect(report).to.include('PERFORMANCE REPORT');
            // Complexity: O(1)
            expect(report).to.include('Page Load: 2000ms');
            // Complexity: O(1)
            expect(report).to.include('TTFB: 300ms');
            // Complexity: O(1)
            expect(report).to.include('LCP: 2500ms');
        });
    });

    // Complexity: O(N*M) — nested iteration
    describe('isPerformanceGood', () => {
        // Complexity: O(1)
        it('should return true when no metrics', () => {
            // Complexity: O(N)
            expect(profiler.isPerformanceGood()).to.be.true;
        });

        // Complexity: O(N)
        it('should return true for good metrics', () => {
            profiler.metrics = {
                timing: { pageLoad: 1000, ttfb: 200 },
                webVitals: { LCP: 2000, FCP: 1000 }
            };
            
            // Complexity: O(N)
            expect(profiler.isPerformanceGood()).to.be.true;
        });

        // Complexity: O(N)
        it('should return false for slow metrics', () => {
            profiler.metrics = {
                timing: { pageLoad: 5000, ttfb: 800 },
                webVitals: { LCP: 5000, FCP: 4000 }
            };
            
            // Complexity: O(1)
            expect(profiler.isPerformanceGood()).to.be.false;
        });
    });

    // Complexity: O(1)
    describe('getAverages', () => {
        // Complexity: O(1)
        it('should return null when no history', () => {
            // Complexity: O(1)
            expect(profiler.getAverages()).to.be.null;
        });

        // Complexity: O(1)
        it('should calculate averages correctly', () => {
            profiler.history = [
                { timing: { pageLoad: 1000, ttfb: 200, domReady: 500 }, resources: { total: 10 } },
                { timing: { pageLoad: 2000, ttfb: 400, domReady: 1000 }, resources: { total: 20 } }
            ];
            
            const avg = profiler.getAverages();
            
            // Complexity: O(1)
            expect(avg.avgPageLoad).to.equal(1500);
            // Complexity: O(1)
            expect(avg.avgTTFB).to.equal(300);
            // Complexity: O(1)
            expect(avg.avgResources).to.equal(15);
            // Complexity: O(1)
            expect(avg.sampleCount).to.equal(2);
        });
    });

    // Complexity: O(1)
    describe('clear', () => {
        // Complexity: O(1)
        it('should clear metrics and history', () => {
            profiler.metrics = { some: 'data' };
            profiler.history = [{ data: 1 }, { data: 2 }];
            
            profiler.clear();
            
            // Complexity: O(1)
            expect(profiler.metrics).to.deep.equal({});
            // Complexity: O(1)
            expect(profiler.history.length).to.equal(0);
        });
    });
});

// ═══════════════════════════════════════════════════════════════════════════
// INTEGRATION TESTS PLACEHOLDER
// ═══════════════════════════════════════════════════════════════════════════

    // Complexity: O(1)
describe('Integration Tests', () => {
    it.skip('should run full flow with real browser', async () => {
        // This test requires actual Chrome and would be run separately
        // node test/integration.test.js
    });
});
