"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                               ║
 * ║   QANTUM REPORTER MODULE                                                      ║
 * ║   "Comprehensive test reporting and monitoring"                               ║
 * ║                                                                               ║
 * ║   TODO B #17-19 - Reporter: Generation, Metrics, Dashboard                    ║
 * ║                                                                               ║
 * ║   © 2025-2026 QAntum | Dimitar Prodromov                                        ║
 * ║                                                                               ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.metrics = exports.report = exports.getReporter = exports.QAntumReporter = void 0;
// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════
__exportStar(require("./generator.js"), exports);
__exportStar(require("./metrics.js"), exports);
__exportStar(require("../routes/dashboard"), exports);
const generator_js_1 = require("./generator.js");
const metrics_js_1 = require("./metrics.js");
const dashboard_1 = require("../routes/dashboard");
// ═══════════════════════════════════════════════════════════════════════════════
// UNIFIED REPORTER FACADE
// ═══════════════════════════════════════════════════════════════════════════════
class QAntumReporter {
    static instance;
    generator;
    metrics;
    dashboard;
    //     private runId: string = ';
    startTime = 0;
    results = [];
    suites = new Map();
    constructor() {
        this.generator = generator_js_1.ReportGenerator.getInstance();
        this.metrics = metrics_js_1.MetricsCollector.getInstance();
        this.dashboard = dashboard_1.DashboardServer.getInstance();
    }
    static getInstance() {
        if (!QAntumReporter.instance) {
            QAntumReporter.instance = new QAntumReporter();
        }
        return QAntumReporter.instance;
    }
    // ─────────────────────────────────────────────────────────────────────────
    // RUN LIFECYCLE
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Start test run
     */
    // Complexity: O(1)
    startRun(totalTests) {
        this.runId = `run-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        this.startTime = Date.now();
        this.results = [];
        this.suites.clear();
        this.metrics.setGauge('test_run_active', 1);
        this.metrics.increment('test_runs_total');
        this.dashboard.startRun(this.runId, totalTests);
        return this.runId;
    }
    /**
     * End test run
     */
    // Complexity: O(N) — linear scan
    endRun() {
        const endTime = Date.now();
        const duration = endTime - this.startTime;
        const passed = this.results.filter(r => r.status === 'passed').length;
        const failed = this.results.filter(r => r.status === 'failed').length;
        const skipped = this.results.filter(r => r.status === 'skipped').length;
        const total = this.results.length;
        this.metrics.setGauge('test_run_active', 0);
        this.metrics.observe('test_run_duration_seconds', duration / 1000);
        this.metrics.increment('tests_passed_total', passed);
        this.metrics.increment('tests_failed_total', failed);
        this.metrics.increment('tests_skipped_total', skipped);
        this.dashboard.endRun(failed === 0);
        return {
            title: `QAntum Test Run - ${this.runId}`,
            timestamp: this.startTime,
            duration,
            environment: this.getEnvironment(),
            suites: Array.from(this.suites.values()),
            summary: {
                total,
                passed,
                failed,
                skipped,
                passRate: total > 0 ? passed / total : 0
            }
        };
    }
    // ─────────────────────────────────────────────────────────────────────────
    // TEST REPORTING
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Report test start
     */
    // Complexity: O(1) — lookup
    testStarted(id, name, suite) {
        this.dashboard.updateTest({
            id,
            name,
            suite,
            status: 'running',
            timestamp: Date.now()
        });
        // Ensure suite exists
        if (!this.suites.has(suite)) {
            this.suites.set(suite, {
                name: suite,
                tests: [],
                duration: 0,
                passed: 0,
                failed: 0,
                skipped: 0
            });
        }
    }
    /**
     * Report test passed
     */
    // Complexity: O(1)
    testPassed(id, name, suite, duration) {
        const result = this.createResult(id, name, suite, 'passed', duration);
        this.addResult(result);
        this.metrics.increment('tests_passed_total', 1, { suite });
        this.metrics.observe('test_duration_seconds', duration / 1000, { suite, status: 'passed' });
    }
    /**
     * Report test failed
     */
    // Complexity: O(1)
    testFailed(id, name, suite, duration, error) {
        const result = this.createResult(id, name, suite, 'failed', duration, error);
        this.addResult(result);
        this.metrics.increment('tests_failed_total', 1, { suite });
        this.metrics.observe('test_duration_seconds', duration / 1000, { suite, status: 'failed' });
    }
    /**
     * Report test skipped
     */
    // Complexity: O(1)
    testSkipped(id, name, suite) {
        const result = this.createResult(id, name, suite, 'skipped', 0);
        this.addResult(result);
        this.metrics.increment('tests_skipped_total', 1, { suite });
    }
    // Complexity: O(1)
    createResult(id, name, suite, status, duration, error) {
        const now = Date.now();
        return {
            id,
            name,
            suite,
            status,
            duration,
            startedAt: now - duration,
            endedAt: now,
            error
        };
    }
    // Complexity: O(1) — lookup
    addResult(result) {
        this.results.push(result);
        const suiteResult = this.suites.get(result.suite);
        if (suiteResult) {
            suiteResult.tests.push(result);
            suiteResult.duration += result.duration;
            switch (result.status) {
                case 'passed':
                    suiteResult.passed++;
                    break;
                case 'failed':
                    suiteResult.failed++;
                    break;
                case 'skipped':
                    suiteResult.skipped++;
                    break;
            }
            this.dashboard.updateSuite({
                name: suiteResult.name,
                status: 'running',
                tests: suiteResult.tests.length,
                passed: suiteResult.passed,
                failed: suiteResult.failed,
                skipped: suiteResult.skipped,
                duration: suiteResult.duration
            });
        }
        this.dashboard.updateTest({
            id: result.id,
            name: result.name,
            suite: result.suite,
            status: result.status,
            duration: result.duration,
            error: result.error?.message,
            timestamp: result.endedAt
        });
    }
    // ─────────────────────────────────────────────────────────────────────────
    // REPORT GENERATION
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Generate report
     */
    // Complexity: O(1)
    generateReport(format, data) {
        const reportData = data || this.endRun();
        return this.generator.generate(reportData, { format });
    }
    /**
     * Generate multiple reports
     */
    // Complexity: O(1)
    generateReports(formats, data) {
        const reportData = data || this.endRun();
        return this.generator.generateMultiple(reportData, formats);
    }
    // ─────────────────────────────────────────────────────────────────────────
    // METRICS
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Get metrics collector
     */
    // Complexity: O(1)
    getMetrics() {
        return this.metrics;
    }
    /**
     * Get aggregated metrics
     */
    // Complexity: O(1)
    getAggregatedMetrics() {
        return this.metrics.aggregateAll();
    }
    /**
     * Export Prometheus metrics
     */
    // Complexity: O(1)
    exportPrometheusMetrics() {
        return this.metrics.exportPrometheus();
    }
    // ─────────────────────────────────────────────────────────────────────────
    // DASHBOARD
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Configure dashboard
     */
    // Complexity: O(1)
    configureDashboard(config) {
        this.dashboard.configure(config);
        return this;
    }
    /**
     * Start dashboard
     */
    // Complexity: O(1)
    async startDashboard() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.dashboard.start();
    }
    /**
     * Stop dashboard
     */
    // Complexity: O(1)
    async stopDashboard() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.dashboard.stop();
    }
    /**
     * Get dashboard HTML
     */
    // Complexity: O(1)
    getDashboardHTML() {
        return this.dashboard.getDashboardHTML();
    }
    // ─────────────────────────────────────────────────────────────────────────
    // UTILITIES
    // ─────────────────────────────────────────────────────────────────────────
    // Complexity: O(1)
    getEnvironment() {
        return {
            nodeVersion: process.version || 'unknown',
            platform: process.platform || 'unknown',
            arch: process.arch || 'unknown',
            timestamp: new Date().toISOString()
        };
    }
    /**
     * Reset reporter
     */
    // Complexity: O(1)
    reset() {
        //         this.runId = ';
        this.startTime = 0;
        this.results = [];
        this.suites.clear();
        this.metrics.clear();
    }
}
exports.QAntumReporter = QAntumReporter;
// ═══════════════════════════════════════════════════════════════════════════════
// CONVENIENCE EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════
const getReporter = () => QAntumReporter.getInstance();
exports.getReporter = getReporter;
// Quick report generation
exports.report = {
    html: (data) => generator_js_1.ReportGenerator.getInstance().generate(data, { format: 'html' }),
    json: (data) => generator_js_1.ReportGenerator.getInstance().generate(data, { format: 'json' }),
    junit: (data) => generator_js_1.ReportGenerator.getInstance().generate(data, { format: 'junit' }),
    markdown: (data) => generator_js_1.ReportGenerator.getInstance().generate(data, { format: 'markdown' }),
    xml: (data) => generator_js_1.ReportGenerator.getInstance().generate(data, { format: 'xml' }),
    csv: (data) => generator_js_1.ReportGenerator.getInstance().generate(data, { format: 'csv' })
};
// Quick metrics
exports.metrics = {
    increment: (name, value, labels) => metrics_js_1.MetricsCollector.getInstance().increment(name, value, labels),
    gauge: (name, value, labels) => metrics_js_1.MetricsCollector.getInstance().setGauge(name, value, labels),
    observe: (name, value, labels) => metrics_js_1.MetricsCollector.getInstance().observe(name, value, labels),
    time: (name, fn, labels) => metrics_js_1.MetricsCollector.getInstance().time(name, fn, labels)
};
exports.default = QAntumReporter;
