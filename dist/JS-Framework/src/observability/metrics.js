"use strict";
/*
 * Prometheus Metrics Exporter for QAntum Fortress
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsManager = void 0;
class MetricsManager {
    static instance;
    metrics = new Map();
    constructor() { }
    static getInstance() {
        if (!MetricsManager.instance) {
            MetricsManager.instance = new MetricsManager();
        }
        return MetricsManager.instance;
    }
    increment(metric, labels = {}) {
        const key = this.getKey(metric, labels);
        const val = this.metrics.get(key) || 0;
        this.metrics.set(key, val + 1);
    }
    set(metric, value, labels = {}) {
        const key = this.getKey(metric, labels);
        this.metrics.set(key, value);
    }
    getMetrics() {
        let output = '';
        this.metrics.forEach((value, key) => {
            output += `# HELP ${key.split('{')[0]} Custom metric\n`;
            output += `# TYPE ${key.split('{')[0]} gauge\n`;
            output += `${key} ${value}\n`;
        });
        return output;
    }
    getKey(metric, labels) {
        if (Object.keys(labels).length === 0)
            return metric;
        const labelStr = Object.entries(labels)
            .map(([k, v]) => `${k}="${v}"`)
            .join(',');
        return `${metric}{${labelStr}}`;
    }
}
exports.MetricsManager = MetricsManager;
