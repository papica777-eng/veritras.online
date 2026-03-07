"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * MIND-ENGINE: METRICS & MONITORING
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Prometheus-compatible metrics, performance monitoring, alerting
 *
 * @author dp | QAntum Labs
 * @version 1.0.0-QANTUM-PRIME
 * @license Commercial
 * ═══════════════════════════════════════════════════════════════════════════════
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MindEngineMetrics = exports.AlertManager = exports.MetricsRegistry = exports.Summary = exports.Histogram = exports.Gauge = exports.Counter = void 0;
exports.createMetrics = createMetrics;
const events_1 = require("events");
// ═══════════════════════════════════════════════════════════════════════════════
// METRIC IMPLEMENTATIONS
// ═══════════════════════════════════════════════════════════════════════════════
class Metric {
    config;
    values = new Map();
    constructor(config) {
        this.config = config;
    }
    // Complexity: O(N log N) — sort
    labelsKey(labels) {
        if (!labels || Object.keys(labels).length === 0) {
            return '';
        }
        return Object.entries(labels)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([k, v]) => `${k}="${v}"`)
            .join(',');
    }
    // Complexity: O(1)
    formatLabels(labelsKey) {
        return labelsKey ? `{${labelsKey}}` : '';
    }
}
class Counter extends Metric {
    constructor(config) {
        super({ ...config, type: 'counter' });
    }
    // Complexity: O(1) — lookup
    inc(labels, value = 1) {
        if (value < 0) {
            throw new Error('Counter can only be incremented');
        }
        const key = this.labelsKey(labels);
        this.values.set(key, (this.values.get(key) || 0) + value);
    }
    // Complexity: O(1) — lookup
    get(labels) {
        return this.values.get(this.labelsKey(labels)) || 0;
    }
    // Complexity: O(1)
    reset(labels) {
        this.values.delete(this.labelsKey(labels));
    }
    // Complexity: O(N) — loop
    collect() {
        const lines = [];
        lines.push(`# HELP ${this.config.name} ${this.config.help}`);
        lines.push(`# TYPE ${this.config.name} counter`);
        for (const [key, value] of this.values) {
            lines.push(`${this.config.name}${this.formatLabels(key)} ${value}`);
        }
        return lines.join('\n');
    }
}
exports.Counter = Counter;
class Gauge extends Metric {
    constructor(config) {
        super({ ...config, type: 'gauge' });
    }
    // Complexity: O(1) — lookup
    set(value, labels) {
        this.values.set(this.labelsKey(labels), value);
    }
    // Complexity: O(1) — lookup
    inc(labels, value = 1) {
        const key = this.labelsKey(labels);
        this.values.set(key, (this.values.get(key) || 0) + value);
    }
    // Complexity: O(1) — lookup
    dec(labels, value = 1) {
        const key = this.labelsKey(labels);
        this.values.set(key, (this.values.get(key) || 0) - value);
    }
    // Complexity: O(1) — lookup
    get(labels) {
        return this.values.get(this.labelsKey(labels)) || 0;
    }
    // Complexity: O(1) — lookup
    setToCurrentTime(labels) {
        this.set(Date.now() / 1000, labels);
    }
    // Complexity: O(N) — loop
    collect() {
        const lines = [];
        lines.push(`# HELP ${this.config.name} ${this.config.help}`);
        lines.push(`# TYPE ${this.config.name} gauge`);
        for (const [key, value] of this.values) {
            lines.push(`${this.config.name}${this.formatLabels(key)} ${value}`);
        }
        return lines.join('\n');
    }
}
exports.Gauge = Gauge;
class Histogram extends Metric {
    bucketValues = new Map();
    sums = new Map();
    counts = new Map();
    buckets;
    constructor(config) {
        super({ ...config, type: 'histogram' });
        this.buckets = config.buckets || [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10];
    }
    // Complexity: O(N) — loop
    observe(value, labels) {
        const key = this.labelsKey(labels);
        // Update sum and count
        this.sums.set(key, (this.sums.get(key) || 0) + value);
        this.counts.set(key, (this.counts.get(key) || 0) + 1);
        // Update buckets
        if (!this.bucketValues.has(key)) {
            this.bucketValues.set(key, new Map());
        }
        const buckets = this.bucketValues.get(key);
        for (const bucket of this.buckets) {
            if (value <= bucket) {
                buckets.set(bucket, (buckets.get(bucket) || 0) + 1);
            }
        }
    }
    // Complexity: O(1)
    timer(labels) {
        const start = process.hrtime.bigint();
        return () => {
            const end = process.hrtime.bigint();
            const duration = Number(end - start) / 1e9;
            this.observe(duration, labels);
            return duration;
        };
    }
    // Complexity: O(N*M) — nested iteration
    collect() {
        const lines = [];
        lines.push(`# HELP ${this.config.name} ${this.config.help}`);
        lines.push(`# TYPE ${this.config.name} histogram`);
        for (const [key, buckets] of this.bucketValues) {
            let cumulativeCount = 0;
            for (const bucket of [...this.buckets, Infinity]) {
                cumulativeCount += buckets.get(bucket) || 0;
                const le = bucket === Infinity ? '+Inf' : bucket.toString();
                const labelsStr = key
                    ? `{${key},le="${le}"}`
                    : `{le="${le}"}`;
                lines.push(`${this.config.name}_bucket${labelsStr} ${cumulativeCount}`);
            }
            const labelsFormatted = key ? `{${key}}` : '';
            lines.push(`${this.config.name}_sum${labelsFormatted} ${this.sums.get(key) || 0}`);
            lines.push(`${this.config.name}_count${labelsFormatted} ${this.counts.get(key) || 0}`);
        }
        return lines.join('\n');
    }
}
exports.Histogram = Histogram;
class Summary extends Metric {
    observations = new Map();
    percentiles;
    constructor(config) {
        super({ ...config, type: 'summary' });
        this.percentiles = config.percentiles || [0.5, 0.9, 0.95, 0.99];
    }
    // Complexity: O(1) — lookup
    observe(value, labels) {
        const key = this.labelsKey(labels);
        if (!this.observations.has(key)) {
            this.observations.set(key, []);
        }
        this.observations.get(key).push(value);
    }
    // Complexity: O(N*M) — nested iteration
    collect() {
        const lines = [];
        lines.push(`# HELP ${this.config.name} ${this.config.help}`);
        lines.push(`# TYPE ${this.config.name} summary`);
        for (const [key, values] of this.observations) {
            if (values.length === 0)
                continue;
            const sorted = [...values].sort((a, b) => a - b);
            const sum = values.reduce((a, b) => a + b, 0);
            for (const p of this.percentiles) {
                const idx = Math.ceil(p * sorted.length) - 1;
                const labelsStr = key
                    ? `{${key},quantile="${p}"}`
                    : `{quantile="${p}"}`;
                lines.push(`${this.config.name}${labelsStr} ${sorted[Math.max(0, idx)]}`);
            }
            const labelsFormatted = key ? `{${key}}` : '';
            lines.push(`${this.config.name}_sum${labelsFormatted} ${sum}`);
            lines.push(`${this.config.name}_count${labelsFormatted} ${values.length}`);
        }
        return lines.join('\n');
    }
}
exports.Summary = Summary;
// ═══════════════════════════════════════════════════════════════════════════════
// METRICS REGISTRY
// ═══════════════════════════════════════════════════════════════════════════════
class MetricsRegistry {
    metrics = new Map();
    prefix;
    constructor(prefix = 'mind_engine') {
        this.prefix = prefix;
    }
    // Complexity: O(1) — lookup
    createCounter(config) {
        const counter = new Counter({
            ...config,
            name: `${this.prefix}_${config.name}`
        });
        this.metrics.set(config.name, counter);
        return counter;
    }
    // Complexity: O(1) — lookup
    createGauge(config) {
        const gauge = new Gauge({
            ...config,
            name: `${this.prefix}_${config.name}`
        });
        this.metrics.set(config.name, gauge);
        return gauge;
    }
    // Complexity: O(1) — lookup
    createHistogram(config) {
        const histogram = new Histogram({
            ...config,
            name: `${this.prefix}_${config.name}`
        });
        this.metrics.set(config.name, histogram);
        return histogram;
    }
    // Complexity: O(1) — lookup
    createSummary(config) {
        const summary = new Summary({
            ...config,
            name: `${this.prefix}_${config.name}`
        });
        this.metrics.set(config.name, summary);
        return summary;
    }
    // Complexity: O(1) — lookup
    getMetric(name) {
        return this.metrics.get(name);
    }
    // Complexity: O(N) — loop
    collect() {
        const outputs = [];
        for (const metric of this.metrics.values()) {
            outputs.push(metric.collect());
        }
        return outputs.join('\n\n');
    }
}
exports.MetricsRegistry = MetricsRegistry;
// ═══════════════════════════════════════════════════════════════════════════════
// ALERT MANAGER
// ═══════════════════════════════════════════════════════════════════════════════
class AlertManager extends events_1.EventEmitter {
    rules = new Map();
    activeAlerts = new Map();
    checkInterval;
    registry;
    constructor(registry) {
        super();
        this.registry = registry;
    }
    // Complexity: O(1) — lookup
    addRule(rule) {
        this.rules.set(rule.name, rule);
        return this;
    }
    // Complexity: O(1)
    removeRule(name) {
        return this.rules.delete(name);
    }
    // Complexity: O(1)
    start(intervalMs = 10000) {
        this.checkInterval = setInterval(() => {
            this.checkAlerts();
        }, intervalMs);
    }
    // Complexity: O(1)
    stop() {
        if (this.checkInterval) {
            // Complexity: O(1)
            clearInterval(this.checkInterval);
        }
    }
    // Complexity: O(N) — loop
    checkAlerts() {
        for (const [name, rule] of this.rules) {
            const metric = this.registry.getMetric(rule.metric);
            if (!metric)
                continue;
            const value = metric.get?.(rule.labels) ?? 0;
            const shouldFire = this.evaluateCondition(value, rule.condition, rule.threshold);
            const alertKey = `${name}-${JSON.stringify(rule.labels || {})}`;
            const existingAlert = this.activeAlerts.get(alertKey);
            if (shouldFire && !existingAlert) {
                const alert = {
                    rule: name,
                    metric: rule.metric,
                    value,
                    threshold: rule.threshold,
                    labels: rule.labels || {},
                    timestamp: new Date(),
                    status: 'firing'
                };
                this.activeAlerts.set(alertKey, alert);
                rule.handler(alert);
                this.emit('alert', alert);
            }
            else if (!shouldFire && existingAlert) {
                existingAlert.status = 'resolved';
                rule.handler(existingAlert);
                this.activeAlerts.delete(alertKey);
                this.emit('resolved', existingAlert);
            }
        }
    }
    // Complexity: O(1)
    evaluateCondition(value, condition, threshold) {
        switch (condition) {
            case 'gt': return value > threshold;
            case 'lt': return value < threshold;
            case 'eq': return value === threshold;
            case 'gte': return value >= threshold;
            case 'lte': return value <= threshold;
            default: return false;
        }
    }
    // Complexity: O(1)
    getActiveAlerts() {
        return Array.from(this.activeAlerts.values());
    }
}
exports.AlertManager = AlertManager;
// ═══════════════════════════════════════════════════════════════════════════════
// MIND ENGINE METRICS
// ═══════════════════════════════════════════════════════════════════════════════
class MindEngineMetrics {
    registry;
    // Test metrics
    testsTotal;
    testsPassed;
    testsFailed;
    testsSkipped;
    testDuration;
    // Browser metrics
    browsersActive;
    pagesActive;
    navigationDuration;
    // Action metrics
    actionsTotal;
    actionDuration;
    actionErrors;
    // Self-healing metrics
    healingAttempts;
    healingSuccess;
    healingDuration;
    // System metrics
    memoryUsage;
    cpuUsage;
    uptime;
    constructor(prefix = 'mind') {
        this.registry = new MetricsRegistry(prefix);
        // Test metrics
        this.testsTotal = this.registry.createCounter({
            name: 'tests_total',
            help: 'Total number of tests executed',
            labels: ['project', 'browser', 'status']
        });
        this.testsPassed = this.registry.createCounter({
            name: 'tests_passed_total',
            help: 'Total number of passed tests'
        });
        this.testsFailed = this.registry.createCounter({
            name: 'tests_failed_total',
            help: 'Total number of failed tests'
        });
        this.testsSkipped = this.registry.createCounter({
            name: 'tests_skipped_total',
            help: 'Total number of skipped tests'
        });
        this.testDuration = this.registry.createHistogram({
            name: 'test_duration_seconds',
            help: 'Test execution duration in seconds',
            buckets: [0.5, 1, 2, 5, 10, 30, 60, 120, 300]
        });
        // Browser metrics
        this.browsersActive = this.registry.createGauge({
            name: 'browsers_active',
            help: 'Number of active browser instances'
        });
        this.pagesActive = this.registry.createGauge({
            name: 'pages_active',
            help: 'Number of active browser pages'
        });
        this.navigationDuration = this.registry.createHistogram({
            name: 'navigation_duration_seconds',
            help: 'Page navigation duration in seconds',
            buckets: [0.1, 0.5, 1, 2, 5, 10, 30]
        });
        // Action metrics
        this.actionsTotal = this.registry.createCounter({
            name: 'actions_total',
            help: 'Total number of actions executed',
            labels: ['type', 'status']
        });
        this.actionDuration = this.registry.createHistogram({
            name: 'action_duration_seconds',
            help: 'Action execution duration in seconds',
            buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5]
        });
        this.actionErrors = this.registry.createCounter({
            name: 'action_errors_total',
            help: 'Total number of action errors',
            labels: ['type', 'error']
        });
        // Self-healing metrics
        this.healingAttempts = this.registry.createCounter({
            name: 'healing_attempts_total',
            help: 'Total number of self-healing attempts'
        });
        this.healingSuccess = this.registry.createCounter({
            name: 'healing_success_total',
            help: 'Total number of successful self-healing operations'
        });
        this.healingDuration = this.registry.createHistogram({
            name: 'healing_duration_seconds',
            help: 'Self-healing operation duration'
        });
        // System metrics
        this.memoryUsage = this.registry.createGauge({
            name: 'memory_usage_bytes',
            help: 'Memory usage in bytes'
        });
        this.cpuUsage = this.registry.createGauge({
            name: 'cpu_usage_percent',
            help: 'CPU usage percentage'
        });
        this.uptime = this.registry.createGauge({
            name: 'uptime_seconds',
            help: 'Process uptime in seconds'
        });
        // Start system metrics collection
        this.startSystemMetrics();
    }
    // Complexity: O(1) — lookup
    startSystemMetrics() {
        // Complexity: O(1) — lookup
        setInterval(() => {
            const mem = process.memoryUsage();
            this.memoryUsage.set(mem.heapUsed);
            this.uptime.set(process.uptime());
        }, 5000);
    }
    // Complexity: O(1)
    collect() {
        return this.registry.collect();
    }
    // Complexity: O(1)
    getRegistry() {
        return this.registry;
    }
}
exports.MindEngineMetrics = MindEngineMetrics;
// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════
function createMetrics(prefix) {
    return new MindEngineMetrics(prefix);
}
exports.default = {
    MetricsRegistry,
    Counter,
    Gauge,
    Histogram,
    Summary,
    AlertManager,
    MindEngineMetrics,
    createMetrics
};
