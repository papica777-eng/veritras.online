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

describe('CONFIG', () => {
    describe('TIMING constants', () => {
        it('should have all required timing constants', () => {
            expect(TIMING).to.have.property('RETRY_BASE_MS');
            expect(TIMING).to.have.property('COOKIE_WAIT_MS');
            expect(TIMING).to.have.property('SCROLL_WAIT_MS');
            expect(TIMING).to.have.property('ANIMATION_WAIT_MS');
            expect(TIMING).to.have.property('DOM_SETTLE_MS');
            expect(TIMING).to.have.property('ELEMENT_FIND_MS');
            expect(TIMING).to.have.property('NETWORK_IDLE_MS');
        });

        it('should have positive values', () => {
            Object.values(TIMING).forEach(value => {
                expect(value).to.be.greaterThan(0);
            });
        });
    });

    describe('CONFIG object', () => {
        it('should have API configuration', () => {
            expect(CONFIG).to.have.property('GEMINI_API_KEY');
            expect(CONFIG).to.have.property('MODEL_NAME');
        });

        it('should have browser settings', () => {
            expect(CONFIG).to.have.property('HEADLESS');
            expect(CONFIG).to.have.property('WINDOW_SIZE');
            expect(CONFIG.WINDOW_SIZE).to.have.property('width');
            expect(CONFIG.WINDOW_SIZE).to.have.property('height');
        });

        it('should have self-healing config', () => {
            expect(CONFIG.SELF_HEALING).to.have.property('enabled');
            expect(CONFIG.SELF_HEALING).to.have.property('maxRetries');
            expect(CONFIG.SELF_HEALING).to.have.property('staleElementRetry');
            expect(CONFIG.SELF_HEALING).to.have.property('autoDismissOverlays');
        });

        it('should have timeout values', () => {
            expect(CONFIG.TIMEOUTS.page).to.be.greaterThan(0);
            expect(CONFIG.TIMEOUTS.element).to.be.greaterThan(0);
            expect(CONFIG.TIMEOUTS.implicit).to.be.greaterThan(0);
        });

        it('should have blocked patterns array', () => {
            expect(CONFIG.BLOCKED_PATTERNS).to.be.an('array');
            expect(CONFIG.BLOCKED_PATTERNS.length).to.be.greaterThan(0);
        });
    });

    describe('validateConfig', () => {
        let originalApiKey;

        beforeEach(() => {
            originalApiKey = CONFIG.GEMINI_API_KEY;
        });

        afterEach(() => {
            CONFIG.GEMINI_API_KEY = originalApiKey;
        });

        it('should return false when API key is missing', () => {
            CONFIG.GEMINI_API_KEY = '';
            const result = validateConfig();
            expect(result).to.be.false;
        });

        it('should return true when API key is set', () => {
            CONFIG.GEMINI_API_KEY = 'test-key';
            const result = validateConfig();
            expect(result).to.be.true;
        });
    });
});

// ═══════════════════════════════════════════════════════════════════════════
// SYSTEM PROMPT TESTS
// ═══════════════════════════════════════════════════════════════════════════

describe('SYSTEM_PROMPT', () => {
    it('should be a non-empty string', () => {
        expect(SYSTEM_PROMPT).to.be.a('string');
        expect(SYSTEM_PROMPT.length).to.be.greaterThan(100);
    });

    it('should contain action definitions', () => {
        expect(SYSTEM_PROMPT).to.include('ACTION:');
        expect(SYSTEM_PROMPT).to.include('BROWSE');
        expect(SYSTEM_PROMPT).to.include('CLICK');
        expect(SYSTEM_PROMPT).to.include('TYPE');
        expect(SYSTEM_PROMPT).to.include('DONE');
    });

    it('should contain semantic actions', () => {
        expect(SYSTEM_PROMPT).to.include('SEMANTIC_CLICK');
        expect(SYSTEM_PROMPT).to.include('SEMANTIC_TYPE');
    });

    it('should contain shadow DOM commands', () => {
        expect(SYSTEM_PROMPT).to.include('SHADOW_CLICK');
        expect(SYSTEM_PROMPT).to.include('SWITCH_FRAME');
    });
});

// ═══════════════════════════════════════════════════════════════════════════
// KNOWLEDGE BASE TESTS
// ═══════════════════════════════════════════════════════════════════════════

describe('KnowledgeBase', () => {
    let kb;
    const testDbPath = path.join(__dirname, 'test_knowledge.json');

    beforeEach(() => {
        kb = new KnowledgeBase(testDbPath);
    });

    afterEach(() => {
        // Cleanup test file
        if (fs.existsSync(testDbPath)) {
            fs.unlinkSync(testDbPath);
        }
    });

    describe('constructor', () => {
        it('should create with default data', () => {
            expect(kb.data).to.have.property('version');
            expect(kb.data).to.have.property('selectorSuccess');
            expect(kb.data).to.have.property('cookieStrategies');
        });
    });

    describe('learnSelector', () => {
        it('should record selector success', () => {
            kb.learnSelector('example.com', '#login-btn', { page: 'login' }, true);
            
            const key = 'example.com::#login-btn';
            expect(kb.data.selectorSuccess[key]).to.exist;
            expect(kb.data.selectorSuccess[key].successes).to.equal(1);
            expect(kb.data.selectorSuccess[key].attempts).to.equal(1);
        });

        it('should track multiple attempts', () => {
            kb.learnSelector('example.com', '#btn', {}, true);
            kb.learnSelector('example.com', '#btn', {}, false);
            kb.learnSelector('example.com', '#btn', {}, true);
            
            const key = 'example.com::#btn';
            expect(kb.data.selectorSuccess[key].attempts).to.equal(3);
            expect(kb.data.selectorSuccess[key].successes).to.equal(2);
        });
    });

    describe('learnCookieStrategy', () => {
        it('should store cookie strategy', () => {
            kb.learnCookieStrategy('google.com', '#accept-cookies');
            
            expect(kb.data.cookieStrategies['google.com']).to.include('#accept-cookies');
        });

        it('should not duplicate strategies', () => {
            kb.learnCookieStrategy('google.com', '#accept');
            kb.learnCookieStrategy('google.com', '#accept');
            
            const count = kb.data.cookieStrategies['google.com'].filter(s => s === '#accept').length;
            expect(count).to.equal(1);
        });
    });

    describe('getCookieStrategies', () => {
        it('should return common strategies for unknown domain', () => {
            const strategies = kb.getCookieStrategies('unknown.com');
            
            expect(strategies).to.be.an('array');
            expect(strategies.length).to.be.greaterThan(0);
        });

        it('should prioritize learned strategies', () => {
            kb.learnCookieStrategy('test.com', '#custom-cookie-btn');
            const strategies = kb.getCookieStrategies('test.com');
            
            expect(strategies[0]).to.equal('#custom-cookie-btn');
        });
    });

    describe('getBestSelectors', () => {
        it('should return sorted selectors by success rate', () => {
            // Selector with 100% success
            kb.learnSelector('test.com', '#good', {}, true);
            kb.learnSelector('test.com', '#good', {}, true);
            
            // Selector with 50% success
            kb.learnSelector('test.com', '#bad', {}, true);
            kb.learnSelector('test.com', '#bad', {}, false);
            
            const best = kb.getBestSelectors('test.com', '');
            
            expect(best.length).to.equal(2);
            expect(best[0].selector).to.equal('#good');
        });
    });

    describe('updateStats', () => {
        it('should update success rate', () => {
            kb.updateStats(true);
            kb.updateStats(true);
            kb.updateStats(false);
            
            expect(kb.data.totalActions).to.equal(3);
            expect(kb.data.successRate).to.be.closeTo(0.67, 0.01);
        });
    });

    describe('getSummary', () => {
        it('should return summary object', () => {
            const summary = kb.getSummary();
            
            expect(summary).to.have.property('sessions');
            expect(summary).to.have.property('actions');
            expect(summary).to.have.property('successRate');
            expect(summary).to.have.property('knownDomains');
            expect(summary).to.have.property('learnedSelectors');
        });
    });
});

// ═══════════════════════════════════════════════════════════════════════════
// BUG REPORT GENERATOR TESTS
// ═══════════════════════════════════════════════════════════════════════════

describe('BugReportGenerator', () => {
    let reporter;

    beforeEach(() => {
        reporter = new BugReportGenerator();
    });

    describe('addStep', () => {
        it('should record steps', () => {
            reporter.addStep('Navigate to login', 'Success');
            reporter.addStep('Click login button', 'Failed: element not found');
            
            expect(reporter.steps.length).to.equal(2);
            expect(reporter.steps[0].action).to.equal('Navigate to login');
            expect(reporter.steps[1].result).to.include('Failed');
        });

        it('should include timestamp', () => {
            reporter.addStep('Test action', 'Result');
            
            expect(reporter.steps[0].timestamp).to.exist;
        });
    });

    describe('addConsoleLog', () => {
        it('should store console logs', () => {
            reporter.addConsoleLog('Error: Something went wrong');
            reporter.addConsoleLog('Warning: Deprecated API');
            
            expect(reporter.consoleLogs.length).to.equal(2);
        });

        it('should limit log count to 100', () => {
            for (let i = 0; i < 150; i++) {
                reporter.addConsoleLog(`Log ${i}`);
            }
            
            expect(reporter.consoleLogs.length).to.equal(100);
        });
    });

    describe('generateMarkdown', () => {
        it('should generate valid markdown', () => {
            reporter.addStep('Go to page', 'Success');
            reporter.addStep('Click button', 'Failed');
            reporter.addConsoleLog('Error in console');
            
            const md = reporter.generateMarkdown('Test Bug', 'Something broke', 'high');
            
            expect(md).to.include('# 🔴 Bug Report: Test Bug');
            expect(md).to.include('**Severity:** HIGH');
            expect(md).to.include('Go to page');
            expect(md).to.include('Click button');
            expect(md).to.include('Error in console');
        });

        it('should use correct severity emoji', () => {
            const low = reporter.generateMarkdown('Bug', 'desc', 'low');
            const critical = reporter.generateMarkdown('Bug', 'desc', 'critical');
            
            expect(low).to.include('🟢');
            expect(critical).to.include('🚨');
        });
    });

    describe('getSummary', () => {
        it('should return correct counts', () => {
            reporter.addStep('Test 1', 'Success');
            reporter.addStep('Test 2', 'Failed');
            reporter.addStep('Test 3', 'Success');
            reporter.addConsoleLog('Log 1');
            
            const summary = reporter.getSummary();
            
            expect(summary.totalSteps).to.equal(3);
            expect(summary.successes).to.equal(2);
            expect(summary.failures).to.equal(1);
            expect(summary.consoleLogs).to.equal(1);
        });
    });

    describe('clear', () => {
        it('should clear all data', () => {
            reporter.addStep('Test', 'Result');
            reporter.addConsoleLog('Log');
            reporter.clear();
            
            expect(reporter.steps.length).to.equal(0);
            expect(reporter.consoleLogs.length).to.equal(0);
        });
    });
});

// ═══════════════════════════════════════════════════════════════════════════
// PERFORMANCE PROFILER TESTS
// ═══════════════════════════════════════════════════════════════════════════

describe('PerformanceProfiler', () => {
    let profiler;
    let mockDriver;

    beforeEach(() => {
        mockDriver = {
            executeScript: sinon.stub()
        };
        profiler = new PerformanceProfiler(mockDriver);
    });

    describe('collectMetrics', () => {
        it('should collect metrics from driver', async () => {
            const mockMetrics = {
                timestamp: Date.now(),
                url: 'https://example.com',
                timing: { pageLoad: 1500, ttfb: 200 },
                webVitals: { LCP: 2000, FCP: 1000 }
            };
            mockDriver.executeScript.resolves(mockMetrics);
            
            const metrics = await profiler.collectMetrics();
            
            expect(metrics).to.deep.equal(mockMetrics);
            expect(profiler.history.length).to.equal(1);
        });

        it('should handle errors gracefully', async () => {
            mockDriver.executeScript.rejects(new Error('Script failed'));
            
            const metrics = await profiler.collectMetrics();
            
            expect(metrics).to.have.property('error');
        });
    });

    describe('getReport', () => {
        it('should return "No metrics" when empty', () => {
            const report = profiler.getReport();
            expect(report).to.equal('No metrics collected');
        });

        it('should format report with metrics', () => {
            profiler.metrics = {
                url: 'https://test.com',
                timing: { pageLoad: 2000, ttfb: 300, domReady: 1000 },
                webVitals: { LCP: 2500, FCP: 1200 },
                resources: { total: 50, totalSize: 500000 }
            };
            
            const report = profiler.getReport();
            
            expect(report).to.include('PERFORMANCE REPORT');
            expect(report).to.include('Page Load: 2000ms');
            expect(report).to.include('TTFB: 300ms');
            expect(report).to.include('LCP: 2500ms');
        });
    });

    describe('isPerformanceGood', () => {
        it('should return true when no metrics', () => {
            expect(profiler.isPerformanceGood()).to.be.true;
        });

        it('should return true for good metrics', () => {
            profiler.metrics = {
                timing: { pageLoad: 1000, ttfb: 200 },
                webVitals: { LCP: 2000, FCP: 1000 }
            };
            
            expect(profiler.isPerformanceGood()).to.be.true;
        });

        it('should return false for slow metrics', () => {
            profiler.metrics = {
                timing: { pageLoad: 5000, ttfb: 800 },
                webVitals: { LCP: 5000, FCP: 4000 }
            };
            
            expect(profiler.isPerformanceGood()).to.be.false;
        });
    });

    describe('getAverages', () => {
        it('should return null when no history', () => {
            expect(profiler.getAverages()).to.be.null;
        });

        it('should calculate averages correctly', () => {
            profiler.history = [
                { timing: { pageLoad: 1000, ttfb: 200, domReady: 500 }, resources: { total: 10 } },
                { timing: { pageLoad: 2000, ttfb: 400, domReady: 1000 }, resources: { total: 20 } }
            ];
            
            const avg = profiler.getAverages();
            
            expect(avg.avgPageLoad).to.equal(1500);
            expect(avg.avgTTFB).to.equal(300);
            expect(avg.avgResources).to.equal(15);
            expect(avg.sampleCount).to.equal(2);
        });
    });

    describe('clear', () => {
        it('should clear metrics and history', () => {
            profiler.metrics = { some: 'data' };
            profiler.history = [{ data: 1 }, { data: 2 }];
            
            profiler.clear();
            
            expect(profiler.metrics).to.deep.equal({});
            expect(profiler.history.length).to.equal(0);
        });
    });
});

// ═══════════════════════════════════════════════════════════════════════════
// INTEGRATION TESTS PLACEHOLDER
// ═══════════════════════════════════════════════════════════════════════════

describe('Integration Tests', () => {
    it.skip('should run full flow with real browser', async () => {
        // This test requires actual Chrome and would be run separately
        // node test/integration.test.js
    });
});
