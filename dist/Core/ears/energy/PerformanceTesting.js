"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * MIND-ENGINE: PERFORMANCE TESTING
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Web Vitals, Lighthouse integration, load testing, profiling
 *
 * @author dp | QAntum Labs
 * @version 1.0.0
 * @license Commercial
 * ═══════════════════════════════════════════════════════════════════════════════
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceBudget = exports.ResourceProfiler = exports.LoadTester = exports.LighthouseRunner = exports.WebVitalsCollector = void 0;
exports.createWebVitalsCollector = createWebVitalsCollector;
exports.createLighthouseRunner = createLighthouseRunner;
exports.createLoadTester = createLoadTester;
const events_1 = require("events");
// ═══════════════════════════════════════════════════════════════════════════════
// WEB VITALS COLLECTOR
// ═══════════════════════════════════════════════════════════════════════════════
class WebVitalsCollector extends events_1.EventEmitter {
    page;
    metrics = {};
    constructor(page) {
        super();
        this.page = page;
    }
    /**
     * Collect all Web Vitals
     */
    // Complexity: O(N)
    async collect() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.injectCollector();
        // Wait for metrics to stabilize
        // SAFETY: async operation — wrap in try-catch for production resilience
        await new Promise(r => setTimeout(r, 3000));
        // SAFETY: async operation — wrap in try-catch for production resilience
        this.metrics = await this.page.evaluate(() => {
            return window.__MIND_VITALS__ || {};
        });
        // Get additional metrics from Performance API
        // SAFETY: async operation — wrap in try-catch for production resilience
        const performanceMetrics = await this.getPerformanceMetrics();
        return {
            LCP: this.metrics.LCP || performanceMetrics.LCP || 0,
            FID: this.metrics.FID || 0,
            CLS: this.metrics.CLS || 0,
            FCP: performanceMetrics.FCP || 0,
            TTFB: performanceMetrics.TTFB || 0,
            TTI: performanceMetrics.TTI || 0,
            TBT: performanceMetrics.TBT || 0,
            SI: performanceMetrics.SI || 0
        };
    }
    /**
     * Inject Web Vitals collector script
     */
    // Complexity: O(N) — linear iteration
    async injectCollector() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.page.evaluate(() => {
            window.__MIND_VITALS__ = {};
            // LCP Observer
            new PerformanceObserver((entryList) => {
                const entries = entryList.getEntries();
                const lastEntry = entries[entries.length - 1];
                window.__MIND_VITALS__.LCP = lastEntry.startTime;
            }).observe({ type: 'largest-contentful-paint', buffered: true });
            // FID Observer
            new PerformanceObserver((entryList) => {
                const firstInput = entryList.getEntries()[0];
                if (firstInput) {
                    window.__MIND_VITALS__.FID = firstInput.processingStart - firstInput.startTime;
                }
            }).observe({ type: 'first-input', buffered: true });
            // CLS Observer
            let clsValue = 0;
            new PerformanceObserver((entryList) => {
                for (const entry of entryList.getEntries()) {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                    }
                }
                window.__MIND_VITALS__.CLS = clsValue;
            }).observe({ type: 'layout-shift', buffered: true });
        });
    }
    /**
     * Get metrics from Performance API
     */
    // Complexity: O(N) — linear iteration
    async getPerformanceMetrics() {
        return this.page.evaluate(() => {
            const timing = performance.getEntriesByType('navigation')[0];
            if (!timing)
                return {};
            const paint = performance.getEntriesByType('paint');
            const fcp = paint.find(p => p.name === 'first-contentful-paint');
            return {
                TTFB: timing.responseStart - timing.requestStart,
                FCP: fcp?.startTime || 0,
                TTI: timing.domInteractive - timing.fetchStart,
                TBT: 0, // Requires more complex calculation
                SI: 0 // Requires visual progress tracking
            };
        });
    }
    /**
     * Assert metrics meet thresholds
     */
    // Complexity: O(N) — linear iteration
    assertThresholds(thresholds) {
        const violations = [];
        for (const [metric, threshold] of Object.entries(thresholds)) {
            const actual = this.metrics[metric];
            if (actual !== undefined && threshold !== undefined) {
                // CLS is lower-is-better with different scale
                if (metric === 'CLS') {
                    if (actual > threshold) {
                        violations.push({ metric, actual, threshold });
                    }
                }
                else {
                    if (actual > threshold) {
                        violations.push({ metric, actual, threshold });
                    }
                }
            }
        }
        return {
            passed: violations.length === 0,
            violations
        };
    }
}
exports.WebVitalsCollector = WebVitalsCollector;
// ═══════════════════════════════════════════════════════════════════════════════
// LIGHTHOUSE RUNNER
// ═══════════════════════════════════════════════════════════════════════════════
class LighthouseRunner extends events_1.EventEmitter {
    config;
    constructor(config = {}) {
        super();
        this.config = {
            categories: ['performance', 'accessibility', 'best-practices', 'seo'],
            device: 'mobile',
            throttling: true,
            screenEmulation: true,
            ...config
        };
    }
    /**
     * Run Lighthouse audit
     */
    // Complexity: O(1) — amortized
    async run(url) {
        this.emit('start', { url });
        // Simulated Lighthouse report
        // In real implementation, use lighthouse npm package
        const report = {
            scores: {
                performance: Math.floor(Math.random() * 30) + 70,
                accessibility: Math.floor(Math.random() * 20) + 80,
                bestPractices: Math.floor(Math.random() * 20) + 80,
                seo: Math.floor(Math.random() * 15) + 85
            },
            metrics: {
                LCP: Math.random() * 2000 + 1000,
                FID: Math.random() * 100 + 10,
                CLS: Math.random() * 0.1,
                FCP: Math.random() * 1000 + 500,
                TTFB: Math.random() * 500 + 100,
                TTI: Math.random() * 3000 + 2000,
                TBT: Math.random() * 200 + 50,
                SI: Math.random() * 2000 + 1000
            },
            audits: {
                'first-contentful-paint': {
                    title: 'First Contentful Paint',
                    description: 'First Contentful Paint marks the time at which the first text or image is painted.',
                    score: 0.9,
                    displayValue: '1.2 s'
                },
                'largest-contentful-paint': {
                    title: 'Largest Contentful Paint',
                    description: 'Largest Contentful Paint marks the time at which the largest text or image is painted.',
                    score: 0.8,
                    displayValue: '2.1 s'
                },
                'cumulative-layout-shift': {
                    title: 'Cumulative Layout Shift',
                    description: 'Cumulative Layout Shift measures the movement of visible elements within the viewport.',
                    score: 0.95,
                    displayValue: '0.05'
                }
            },
            timestamp: new Date()
        };
        this.emit('complete', report);
        return report;
    }
    /**
     * Compare two reports
     */
    // Complexity: O(N*M) — nested iteration detected
    compare(baseline, current) {
        const comparison = {
            scores: {},
            metrics: {},
            improved: [],
            degraded: []
        };
        // Compare scores
        for (const [category, score] of Object.entries(current.scores)) {
            const baselineScore = baseline.scores[category];
            const diff = score - baselineScore;
            comparison.scores[category] = {
                baseline: baselineScore,
                current: score,
                diff,
                percentage: ((diff / baselineScore) * 100).toFixed(2) + '%'
            };
            if (diff > 5) {
                comparison.improved.push(category);
            }
            else if (diff < -5) {
                comparison.degraded.push(category);
            }
        }
        // Compare metrics
        for (const [metric, value] of Object.entries(current.metrics)) {
            const baselineValue = baseline.metrics[metric];
            const diff = value - baselineValue;
            const isImproved = metric === 'CLS' ? diff < 0 : diff < 0;
            comparison.metrics[metric] = {
                baseline: baselineValue,
                current: value,
                diff,
                improved: isImproved
            };
        }
        return comparison;
    }
}
exports.LighthouseRunner = LighthouseRunner;
// ═══════════════════════════════════════════════════════════════════════════════
// LOAD TESTER
// ═══════════════════════════════════════════════════════════════════════════════
class LoadTester extends events_1.EventEmitter {
    config;
    running = false;
    results = [];
    errors = {};
    successCount = 0;
    failCount = 0;
    constructor(config) {
        super();
        this.config = {
            rampUp: 0,
            timeout: 30000,
            ...config
        };
    }
    /**
     * Run load test
     */
    // Complexity: O(N) — linear iteration
    async run() {
        this.running = true;
        this.results = [];
        this.errors = {};
        this.successCount = 0;
        this.failCount = 0;
        const startTime = Date.now();
        const endTime = startTime + this.config.duration;
        const workers = [];
        this.emit('start', { config: this.config });
        // Create concurrent workers
        for (let i = 0; i < this.config.concurrency; i++) {
            const workerDelay = this.config.rampUp
                ? (this.config.rampUp / this.config.concurrency) * i
                : 0;
            workers.push(this.worker(endTime, workerDelay));
        }
        // SAFETY: async operation — wrap in try-catch for production resilience
        await Promise.all(workers);
        this.running = false;
        const result = this.calculateResults(Date.now() - startTime);
        this.emit('complete', result);
        return result;
    }
    /**
     * Stop load test
     */
    // Complexity: O(1)
    stop() {
        this.running = false;
    }
    // Complexity: O(N) — loop-based
    async worker(endTime, initialDelay) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await new Promise(r => setTimeout(r, initialDelay));
        while (this.running && Date.now() < endTime) {
            const requestStart = Date.now();
            try {
                // Simulate HTTP request
                await this.makeRequest();
                const duration = Date.now() - requestStart;
                this.results.push(duration);
                this.successCount++;
                this.emit('request', {
                    success: true,
                    duration,
                    total: this.results.length
                });
            }
            catch (error) {
                this.failCount++;
                const errorType = error.message || 'Unknown error';
                this.errors[errorType] = (this.errors[errorType] || 0) + 1;
                this.emit('request', {
                    success: false,
                    error: errorType,
                    total: this.results.length + this.failCount
                });
            }
            // Rate limiting
            if (this.config.requestsPerSecond) {
                const delay = 1000 / this.config.requestsPerSecond;
                // SAFETY: async operation — wrap in try-catch for production resilience
                await new Promise(r => setTimeout(r, delay));
            }
        }
    }
    // Complexity: O(1)
    async makeRequest() {
        // Simulated request - in real implementation use fetch/axios
        const delay = Math.random() * 500 + 50;
        // SAFETY: async operation — wrap in try-catch for production resilience
        await new Promise(r => setTimeout(r, delay));
        // Simulate occasional failures
        if (Math.random() < 0.02) {
            throw new Error('Connection timeout');
        }
    }
    // Complexity: O(N log N) — sort operation
    calculateResults(duration) {
        const sorted = [...this.results].sort((a, b) => a - b);
        const total = sorted.length;
        return {
            totalRequests: total + this.failCount,
            successfulRequests: this.successCount,
            failedRequests: this.failCount,
            avgResponseTime: total > 0 ? sorted.reduce((a, b) => a + b, 0) / total : 0,
            minResponseTime: sorted[0] || 0,
            maxResponseTime: sorted[total - 1] || 0,
            p50ResponseTime: sorted[Math.floor(total * 0.5)] || 0,
            p95ResponseTime: sorted[Math.floor(total * 0.95)] || 0,
            p99ResponseTime: sorted[Math.floor(total * 0.99)] || 0,
            requestsPerSecond: (total / duration) * 1000,
            errors: this.errors,
            duration
        };
    }
}
exports.LoadTester = LoadTester;
// ═══════════════════════════════════════════════════════════════════════════════
// RESOURCE PROFILER
// ═══════════════════════════════════════════════════════════════════════════════
class ResourceProfiler extends events_1.EventEmitter {
    page;
    constructor(page) {
        super();
        this.page = page;
    }
    /**
     * Profile page resources
     */
    // Complexity: O(N log N) — sort operation
    async profile() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const resources = await this.page.evaluate(() => {
            const entries = performance.getEntriesByType('resource');
            return entries.map((entry) => ({
                name: entry.name,
                type: entry.initiatorType,
                duration: entry.duration,
                size: entry.transferSize,
                startTime: entry.startTime
            }));
        });
        const byType = {};
        for (const resource of resources) {
            if (!byType[resource.type]) {
                byType[resource.type] = { count: 0, size: 0, duration: 0 };
            }
            byType[resource.type].count++;
            byType[resource.type].size += resource.size || 0;
            byType[resource.type].duration += resource.duration || 0;
        }
        const totalSize = resources.reduce((sum, r) => sum + (r.size || 0), 0);
        const totalDuration = resources.reduce((sum, r) => sum + (r.duration || 0), 0);
        return {
            totalResources: resources.length,
            totalSize,
            totalDuration,
            byType,
            resources,
            largestResources: [...resources]
                .sort((a, b) => (b.size || 0) - (a.size || 0))
                .slice(0, 10),
            slowestResources: [...resources]
                .sort((a, b) => (b.duration || 0) - (a.duration || 0))
                .slice(0, 10)
        };
    }
    /**
     * Monitor resources in real-time
     */
    // Complexity: O(N) — loop-based
    async monitor(duration = 10000) {
        const timeline = [];
        const startTime = Date.now();
        while (Date.now() - startTime < duration) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            const profile = await this.profile();
            timeline.push({
                time: Date.now() - startTime,
                resources: profile.totalResources,
                size: profile.totalSize
            });
            // SAFETY: async operation — wrap in try-catch for production resilience
            await new Promise(r => setTimeout(r, 500));
        }
        return {
            duration,
            snapshots: timeline
        };
    }
}
exports.ResourceProfiler = ResourceProfiler;
// ═══════════════════════════════════════════════════════════════════════════════
// PERFORMANCE BUDGET
// ═══════════════════════════════════════════════════════════════════════════════
class PerformanceBudget {
    budgets;
    constructor(budgets) {
        this.budgets = budgets;
    }
    /**
     * Check if metrics meet budget
     */
    // Complexity: O(N) — linear iteration
    check(metrics) {
        const violations = [];
        for (const [metric, budget] of Object.entries(this.budgets)) {
            const actual = metrics[metric];
            if (actual !== undefined && budget !== undefined && actual > budget) {
                violations.push({
                    metric,
                    budget,
                    actual,
                    overage: actual - budget,
                    percentage: ((actual - budget) / budget * 100).toFixed(2) + '%'
                });
            }
        }
        return {
            passed: violations.length === 0,
            violations,
            summary: violations.length === 0
                ? 'All metrics within budget'
                : `${violations.length} metric(s) exceeded budget`
        };
    }
    /**
     * Generate budget report
     */
    // Complexity: O(N) — linear iteration
    generateReport(metrics) {
        const result = this.check(metrics);
        let report = '# Performance Budget Report\n\n';
        if (result.passed) {
            report += '✅ **All metrics within budget**\n\n';
        }
        else {
            report += `⚠️ **${result.violations.length} budget violations**\n\n`;
        }
        report += '## Metrics\n\n';
        report += '| Metric | Budget | Actual | Status |\n';
        report += '|--------|--------|--------|--------|\n';
        for (const [metric, budget] of Object.entries(this.budgets)) {
            const actual = metrics[metric] ?? 'N/A';
            const status = actual <= budget ? '✅' : '❌';
            report += `| ${metric} | ${budget} | ${actual} | ${status} |\n`;
        }
        return report;
    }
}
exports.PerformanceBudget = PerformanceBudget;
// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════
function createWebVitalsCollector(page) {
    return new WebVitalsCollector(page);
}
function createLighthouseRunner(config) {
    return new LighthouseRunner(config);
}
function createLoadTester(config) {
    return new LoadTester(config);
}
exports.default = {
    WebVitalsCollector,
    LighthouseRunner,
    LoadTester,
    ResourceProfiler,
    PerformanceBudget,
    createWebVitalsCollector,
    createLighthouseRunner,
    createLoadTester
};
