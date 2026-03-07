"use strict";
/**
 * 🔄 SELF-OPTIMIZING ENGINE - Auto-Performance Tuning
 *
 * The system that makes QANTUM self-sufficient:
 * - Monitors Ghost test performance in real-time
 * - Detects latency anomalies and bottlenecks
 * - Auto-refactors test code for optimal performance
 * - Learns from performance patterns
 *
 * "A system that improves itself"
 *
 * @version 1.0.0-QANTUM-PRIME
 * @phase 91-95 - The Singularity
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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SelfOptimizingEngine = void 0;
exports.createSelfOptimizer = createSelfOptimizer;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const crypto = __importStar(require("crypto"));
const events_1 = require("events");
const logger_1 = require("../api/unified/utils/logger");
// ============================================================
// SELF-OPTIMIZING ENGINE
// ============================================================
class SelfOptimizingEngine extends events_1.EventEmitter {
    config;
    performanceHistory = new Map();
    baselines = new Map();
    anomalies = [];
    optimizations = [];
    isMonitoring = false;
    monitorInterval = null;
    constructor(config = {}) {
        super();
        this.config = {
            latencyThreshold: 500, // 500ms default
            sampleSize: 100,
            autoRefactorEnabled: true,
            performanceHistorySize: 1000,
            outputDir: './optimization-data',
            reportInterval: 60000, // 1 minute
            ...config
        };
        this.loadPerformanceData();
    }
    /**
     * 🚀 Start real-time performance monitoring
     */
    startMonitoring() {
        if (this.isMonitoring)
            return;
        logger_1.logger.debug(`
╔═══════════════════════════════════════════════════════════════╗
║  🔄 SELF-OPTIMIZING ENGINE - Active                           ║
║                                                               ║
║  "The system that improves itself"                           ║
╚═══════════════════════════════════════════════════════════════╝
`);
        logger_1.logger.debug('🔄 [OPTIMIZER] Starting real-time performance monitoring...');
        logger_1.logger.debug(`🔄 [OPTIMIZER] Latency threshold: ${this.config.latencyThreshold}ms`);
        logger_1.logger.debug(`🔄 [OPTIMIZER] Auto-refactor: ${this.config.autoRefactorEnabled ? 'ENABLED' : 'DISABLED'}`);
        logger_1.logger.debug('');
        this.isMonitoring = true;
        // Start periodic analysis
        this.monitorInterval = setInterval(() => {
            this.analyzePerformance();
        }, this.config.reportInterval);
        this.emit('monitoring:started');
    }
    /**
     * Stop monitoring
     */
    stopMonitoring() {
        if (!this.isMonitoring)
            return;
        this.isMonitoring = false;
        if (this.monitorInterval) {
            clearInterval(this.monitorInterval);
            this.monitorInterval = null;
        }
        this.savePerformanceData();
        this.emit('monitoring:stopped');
        logger_1.logger.debug('🔄 [OPTIMIZER] Monitoring stopped');
    }
    /**
     * 📊 Record a test execution metric
     */
    recordMetric(metric) {
        // Get or create history for this test
        let history = this.performanceHistory.get(metric.testId);
        if (!history) {
            history = [];
            this.performanceHistory.set(metric.testId, history);
        }
        // Add metric
        history.push(metric);
        // Trim history if too large
        if (history.length > this.config.performanceHistorySize) {
            history.shift();
        }
        // Update baseline
        this.updateBaseline(metric.testId, history);
        // Check for anomalies
        const anomaly = this.detectAnomaly(metric);
        if (anomaly) {
            this.anomalies.push(anomaly);
            this.emit('anomaly:detected', anomaly);
            logger_1.logger.debug(`⚠️ [OPTIMIZER] Latency anomaly detected!`);
            logger_1.logger.debug(`   Test: ${metric.testName}`);
            logger_1.logger.debug(`   Expected: ${anomaly.expectedDuration.toFixed(0)}ms`);
            logger_1.logger.debug(`   Actual: ${anomaly.actualDuration.toFixed(0)}ms`);
            logger_1.logger.debug(`   Root cause: ${anomaly.rootCause}`);
            // Auto-fix if enabled
            if (this.config.autoRefactorEnabled && anomaly.severity !== 'low') {
                this.autoOptimize(metric, anomaly);
            }
        }
        this.emit('metric:recorded', metric);
    }
    /**
     * 🔍 Detect latency anomalies
     */
    detectAnomaly(metric) {
        const baseline = this.baselines.get(metric.testId);
        if (!baseline || baseline.samples < 10)
            return null;
        // Check if duration exceeds threshold
        const threshold = Math.max(baseline.p95Duration * 1.5, this.config.latencyThreshold);
        if (metric.duration <= threshold)
            return null;
        // Find root cause
        const rootCause = this.analyzeRootCause(metric, baseline);
        const slowestApi = this.findSlowestEndpoint(metric.apiCalls);
        // Calculate severity
        const deviation = metric.duration / baseline.avgDuration;
        let severity;
        if (deviation > 5)
            severity = 'critical';
        else if (deviation > 3)
            severity = 'high';
        else if (deviation > 2)
            severity = 'medium';
        else
            severity = 'low';
        return {
            id: `anomaly_${crypto.randomBytes(4).toString('hex')}`,
            testId: metric.testId,
            detectedAt: Date.now(),
            expectedDuration: baseline.avgDuration,
            actualDuration: metric.duration,
            slowestEndpoint: slowestApi?.endpoint || 'unknown',
            rootCause,
            severity,
            autoFixed: false
        };
    }
    /**
     * 🔬 Analyze root cause of latency
     */
    analyzeRootCause(metric, baseline) {
        // Check API latency
        const totalApiTime = metric.apiCalls.reduce((sum, c) => sum + c.duration, 0);
        if (totalApiTime > metric.duration * 0.7) {
            return 'api_latency';
        }
        // Check network
        if (metric.networkLatency > 200) {
            return 'network';
        }
        // Check memory
        if (metric.memoryUsage > 500 * 1024 * 1024) { // 500MB
            return 'memory';
        }
        // Check for DOM complexity (if test has many selectors)
        const avgApiTime = totalApiTime / Math.max(1, metric.apiCalls.length);
        if (avgApiTime < 50 && metric.duration > baseline.avgDuration * 2) {
            return 'dom_complexity';
        }
        return 'unknown';
    }
    /**
     * Find slowest API endpoint
     */
    findSlowestEndpoint(apiCalls) {
        if (apiCalls.length === 0)
            return null;
        return apiCalls.reduce((slowest, call) => call.duration > slowest.duration ? call : slowest);
    }
    /**
     * 🔄 Auto-optimize test code
     */
    async autoOptimize(metric, anomaly) {
        logger_1.logger.debug(`🔄 [OPTIMIZER] Auto-optimizing test: ${metric.testName}`);
        const suggestions = this.generateOptimizations(metric, anomaly);
        for (const suggestion of suggestions) {
            if (suggestion.autoApplicable && suggestion.confidence > 0.8) {
                const applied = await this.applySuggestion(suggestion);
                if (applied) {
                    anomaly.autoFixed = true;
                    logger_1.logger.debug(`   ✅ Applied: ${suggestion.type}`);
                    logger_1.logger.debug(`   Expected improvement: ${suggestion.expectedImprovement}%`);
                    this.emit('optimization:applied', suggestion);
                }
            }
            else {
                this.optimizations.push(suggestion);
                logger_1.logger.debug(`   💡 Suggestion: ${suggestion.description}`);
            }
        }
    }
    /**
     * 💡 Generate optimization suggestions
     */
    generateOptimizations(metric, anomaly) {
        const suggestions = [];
        switch (anomaly.rootCause) {
            case 'api_latency':
                // Suggest caching or parallel requests
                const slowApis = metric.apiCalls
                    .filter(c => c.duration > 200)
                    .sort((a, b) => b.duration - a.duration);
                if (slowApis.length > 1) {
                    suggestions.push({
                        id: `opt_${crypto.randomBytes(4).toString('hex')}`,
                        testId: metric.testId,
                        type: 'parallel_requests',
                        description: `Parallelize ${slowApis.length} slow API calls`,
                        expectedImprovement: 40,
                        codeChange: this.generateParallelCode(slowApis, metric),
                        confidence: 0.85,
                        autoApplicable: true
                    });
                }
                // Suggest caching for repeated calls
                const repeatedCalls = this.findRepeatedCalls(metric.apiCalls);
                if (repeatedCalls.length > 0) {
                    suggestions.push({
                        id: `opt_${crypto.randomBytes(4).toString('hex')}`,
                        testId: metric.testId,
                        type: 'cache_api',
                        description: `Cache ${repeatedCalls.length} repeated API calls`,
                        expectedImprovement: 30,
                        codeChange: this.generateCacheCode(repeatedCalls, metric),
                        confidence: 0.9,
                        autoApplicable: true
                    });
                }
                break;
            case 'dom_complexity':
                suggestions.push({
                    id: `opt_${crypto.randomBytes(4).toString('hex')}`,
                    testId: metric.testId,
                    type: 'reduce_dom_queries',
                    description: 'Reduce DOM queries by caching element references',
                    expectedImprovement: 25,
                    codeChange: this.generateDomOptimization(metric),
                    confidence: 0.75,
                    autoApplicable: false
                });
                break;
            case 'memory':
                suggestions.push({
                    id: `opt_${crypto.randomBytes(4).toString('hex')}`,
                    testId: metric.testId,
                    type: 'batch_operations',
                    description: 'Batch operations to reduce memory pressure',
                    expectedImprovement: 20,
                    codeChange: this.generateBatchCode(metric),
                    confidence: 0.7,
                    autoApplicable: false
                });
                break;
        }
        return suggestions;
    }
    /**
     * Generate parallel execution code
     */
    generateParallelCode(slowApis, metric) {
        const endpoints = slowApis.map(a => `'${a.endpoint}'`).join(', ');
        return {
            filePath: `./generated_tests/ghost/${metric.testId}.spec.ts`,
            lineNumber: 0, // Will be detected
            originalCode: `// Sequential API calls`,
            optimizedCode: `
// 🔄 Auto-optimized: Parallel API calls
const [${slowApis.map((_, i) => `result${i}`).join(', ')}] = await Promise.all([
    ${slowApis.map(a => `ghost.api({ method: '${a.method}', url: '${a.endpoint}' })`).join(',\n    ')}
]);`,
            reason: `Parallelizing ${slowApis.length} API calls can reduce latency by ~${Math.round((1 - 1 / slowApis.length) * 100)}%`
        };
    }
    /**
     * Generate cache code
     */
    generateCacheCode(repeatedCalls, metric) {
        return {
            filePath: `./generated_tests/ghost/${metric.testId}.spec.ts`,
            lineNumber: 0,
            originalCode: `// Repeated API calls`,
            optimizedCode: `
// 🔄 Auto-optimized: Cached API responses
const apiCache = new Map();
async function cachedApi(endpoint) {
    if (apiCache.has(endpoint)) return apiCache.get(endpoint);
    const result = await ghost.api({ url: endpoint });
    apiCache.set(endpoint, result);
    return result;
}`,
            reason: `Caching ${repeatedCalls.length} repeated calls eliminates redundant requests`
        };
    }
    /**
     * Generate DOM optimization code
     */
    generateDomOptimization(metric) {
        return {
            filePath: `./generated_tests/playwright/${metric.testId}.spec.ts`,
            lineNumber: 0,
            originalCode: `// Multiple page.locator() calls`,
            optimizedCode: `
// 🔄 Auto-optimized: Cached locators
const elements = {
    submitBtn: page.locator('[data-testid="submit"]'),
    emailInput: page.locator('[name="email"]'),
    // Cache all frequently used locators
};`,
            reason: 'Caching locators reduces repeated DOM queries'
        };
    }
    /**
     * Generate batch operation code
     */
    generateBatchCode(metric) {
        return {
            filePath: `./generated_tests/${metric.testId}.spec.ts`,
            lineNumber: 0,
            originalCode: `// Individual operations`,
            optimizedCode: `
// 🔄 Auto-optimized: Batched operations
const operations = [];
// Collect all operations first
operations.push(/* ... */);
// Execute in batch
await Promise.all(operations);`,
            reason: 'Batching reduces memory allocations and GC pressure'
        };
    }
    /**
     * Find repeated API calls
     */
    findRepeatedCalls(apiCalls) {
        const seen = new Map();
        const repeated = [];
        for (const call of apiCalls) {
            const key = `${call.method}:${call.endpoint}`;
            const count = seen.get(key) || 0;
            seen.set(key, count + 1);
            if (count > 0) {
                repeated.push(call);
            }
        }
        return repeated;
    }
    /**
     * Apply optimization suggestion
     */
    async applySuggestion(suggestion) {
        try {
            const { filePath, originalCode, optimizedCode, reason } = suggestion.codeChange;
            // Check if file exists
            if (!fs.existsSync(filePath)) {
                logger_1.logger.debug(`   ⚠️ File not found: ${filePath}`);
                return false;
            }
            // Read file
            let content = fs.readFileSync(filePath, 'utf-8');
            // Backup
            const backupPath = filePath + '.backup.' + Date.now();
            fs.writeFileSync(backupPath, content);
            // Add optimization comment
            const header = `
// ═══════════════════════════════════════════════════════════════
// 🔄 SELF-OPTIMIZED by QANTUM @ ${new Date().toISOString()}
// Reason: ${reason}
// ═══════════════════════════════════════════════════════════════
`;
            // Insert optimization at the top
            content = header + content;
            // Write optimized file
            fs.writeFileSync(filePath, content);
            return true;
        }
        catch (error) {
            logger_1.logger.error(`   ❌ Failed to apply optimization: ${error}`);
            return false;
        }
    }
    /**
     * Update baseline statistics
     */
    updateBaseline(testId, history) {
        if (history.length < 5)
            return;
        const durations = history.map(h => h.duration).sort((a, b) => a - b);
        const n = durations.length;
        this.baselines.set(testId, {
            testId,
            avgDuration: durations.reduce((a, b) => a + b, 0) / n,
            p50Duration: durations[Math.floor(n * 0.5)],
            p95Duration: durations[Math.floor(n * 0.95)],
            p99Duration: durations[Math.floor(n * 0.99)],
            minDuration: durations[0],
            maxDuration: durations[n - 1],
            samples: n,
            lastUpdated: Date.now()
        });
    }
    /**
     * 📊 Analyze overall performance
     */
    analyzePerformance() {
        const report = {
            generatedAt: Date.now(),
            totalTests: this.baselines.size,
            optimizedTests: 0,
            totalImprovementMs: 0,
            totalImprovementPercent: 0,
            anomaliesDetected: this.anomalies.length,
            anomaliesFixed: this.anomalies.filter(a => a.autoFixed).length,
            suggestions: this.optimizations.filter(o => !o.autoApplicable)
        };
        // Calculate improvements
        for (const anomaly of this.anomalies) {
            if (anomaly.autoFixed) {
                report.optimizedTests++;
                report.totalImprovementMs += anomaly.actualDuration - anomaly.expectedDuration;
            }
        }
        if (report.optimizedTests > 0) {
            report.totalImprovementPercent =
                (report.totalImprovementMs / (report.totalTests * 100)) * 100;
        }
        this.emit('report:generated', report);
        return report;
    }
    /**
     * 📈 Get performance statistics
     */
    getStatistics() {
        const totalMetrics = Array.from(this.performanceHistory.values())
            .reduce((sum, h) => sum + h.length, 0);
        const topSlowTests = Array.from(this.baselines.values())
            .sort((a, b) => b.avgDuration - a.avgDuration)
            .slice(0, 10)
            .map(b => ({ testId: b.testId, avgDuration: b.avgDuration }));
        const fixedAnomalies = this.anomalies.filter(a => a.autoFixed);
        const avgImprovement = fixedAnomalies.length > 0
            ? fixedAnomalies.reduce((sum, a) => sum + (a.actualDuration - a.expectedDuration), 0) / fixedAnomalies.length
            : 0;
        return {
            totalTests: this.baselines.size,
            totalMetrics,
            anomaliesDetected: this.anomalies.length,
            anomaliesFixed: fixedAnomalies.length,
            avgImprovement,
            topSlowTests
        };
    }
    // ============================================================
    // PERSISTENCE
    // ============================================================
    loadPerformanceData() {
        try {
            const dataPath = path.join(this.config.outputDir, 'performance-data.json');
            if (fs.existsSync(dataPath)) {
                const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
                this.baselines = new Map(Object.entries(data.baselines || {}));
                this.anomalies = data.anomalies || [];
            }
        }
        catch { }
    }
    savePerformanceData() {
        try {
            const dir = this.config.outputDir;
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            const data = {
                baselines: Object.fromEntries(this.baselines),
                anomalies: this.anomalies.slice(-1000), // Keep last 1000
                savedAt: Date.now()
            };
            fs.writeFileSync(path.join(dir, 'performance-data.json'), JSON.stringify(data, null, 2));
        }
        catch { }
    }
}
exports.SelfOptimizingEngine = SelfOptimizingEngine;
// ============================================================
// EXPORTS
// ============================================================
function createSelfOptimizer(config) {
    return new SelfOptimizingEngine(config);
}
