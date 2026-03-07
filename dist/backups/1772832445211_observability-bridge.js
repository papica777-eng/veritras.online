"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * QAntum
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * @copyright 2025 Димитър Продромов (Dimitar Prodromov). All Rights Reserved.
 * @license PROPRIETARY AND CONFIDENTIAL
 *
 * This file is part of QAntum.
 * Unauthorized copying, modification, distribution, or use of this file,
 * via any medium, is strictly prohibited without express written permission.
 *
 * For licensing inquiries: dimitar.papazov@QAntum.dev
 * ═══════════════════════════════════════════════════════════════════════════════
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObservabilityBridge = void 0;
const events_1 = require("events");
const id_generator_1 = require("../utils/id-generator");
/**
 * Observability Bridge
 *
 * Provides:
 * - Distributed tracing with W3C Trace Context
 * - Span creation and management
 * - Metric collection
 * - Export to OTLP backends
 */
class ObservabilityBridge extends events_1.EventEmitter {
    /** Configuration */
    config;
    /** Span buffer */
    spanBuffer = [];
    /** Active spans */
    activeSpans = new Map();
    /** Export timer */
    exportTimer = null;
    /** Statistics */
    stats = {
        spansCreated: 0,
        spansExported: 0,
        spansDropped: 0,
        errors: 0,
    };
    /** Current trace context (for context propagation) */
    currentContext = null;
    constructor(config) {
        super();
        this.config = {
            serviceName: config?.serviceName || 'QAntum-swarm',
            serviceVersion: config?.serviceVersion || '17.0.0',
            endpoint: config?.endpoint || 'http://localhost:4318/v1/traces',
            exportInterval: config?.exportInterval || 30000,
            maxSpans: config?.maxSpans || 1000,
            consoleExport: config?.consoleExport ?? false,
            detailedAttributes: config?.detailedAttributes ?? true,
            samplingRate: config?.samplingRate || 1.0,
            verbose: config?.verbose ?? false,
        };
        this.startExportTimer();
    }
    /**
     * Start a new trace
     */
    // Complexity: O(1)
    startTrace(operationName, attributes) {
        const traceId = (0, id_generator_1.generateTraceId)();
        const spanId = (0, id_generator_1.generateSpanId)();
        this.currentContext = { traceId, spanId };
        this.createSpan(traceId, spanId, undefined, operationName, attributes);
        this.log(`Started trace: ${traceId}`);
        return traceId;
    }
    /**
     * Start a span within current trace
     */
    // Complexity: O(1)
    startSpan(operationName, attributes) {
        if (!this.currentContext) {
            return this.startTrace(operationName, attributes);
        }
        const spanId = (0, id_generator_1.generateSpanId)();
        const parentSpanId = this.currentContext.spanId;
        this.createSpan(this.currentContext.traceId, spanId, parentSpanId, operationName, attributes);
        // Update context
        this.currentContext = {
            ...this.currentContext,
            spanId,
            parentSpanId,
        };
        return spanId;
    }
    /**
     * Create a span
     */
    // Complexity: O(1) — hash/map lookup
    createSpan(traceId, spanId, parentSpanId, operationName, attributes) {
        // Apply sampling
        if (Math.random() > this.config.samplingRate) {
            this.stats.spansDropped++;
            return {};
        }
        const span = {
            traceId,
            spanId,
            parentSpanId,
            operationName,
            startTime: new Date(),
            status: 'ok',
            tags: {
                'service.name': this.config.serviceName,
                'service.version': this.config.serviceVersion,
                ...attributes,
            },
            events: [],
        };
        this.activeSpans.set(spanId, span);
        this.stats.spansCreated++;
        this.emit('spanStarted', { traceId, spanId, operationName });
        return span;
    }
    /**
     * Add event to current span
     */
    // Complexity: O(1) — hash/map lookup
    addEvent(name, attributes) {
        if (!this.currentContext)
            return;
        const span = this.activeSpans.get(this.currentContext.spanId);
        if (span) {
            span.events.push({
                timestamp: new Date(),
                name,
                attributes,
            });
        }
    }
    /**
     * Set span attribute
     */
    // Complexity: O(1) — hash/map lookup
    setAttribute(key, value) {
        if (!this.currentContext)
            return;
        const span = this.activeSpans.get(this.currentContext.spanId);
        if (span) {
            span.tags[key] = value;
        }
    }
    /**
     * Set span status
     */
    // Complexity: O(1) — hash/map lookup
    setStatus(status, message) {
        if (!this.currentContext)
            return;
        const span = this.activeSpans.get(this.currentContext.spanId);
        if (span) {
            span.status = status;
            if (message) {
                span.tags['status.message'] = message;
            }
        }
    }
    /**
     * End current span
     */
    // Complexity: O(1) — hash/map lookup
    endSpan(status) {
        if (!this.currentContext)
            return;
        const span = this.activeSpans.get(this.currentContext.spanId);
        if (span) {
            span.endTime = new Date();
            span.duration = span.endTime.getTime() - span.startTime.getTime();
            if (status) {
                span.status = status;
            }
            // Move to buffer
            this.activeSpans.delete(this.currentContext.spanId);
            this.addToBuffer(span);
            // Restore parent context
            if (this.currentContext.parentSpanId) {
                this.currentContext = {
                    traceId: this.currentContext.traceId,
                    spanId: this.currentContext.parentSpanId,
                };
            }
            else {
                this.currentContext = null;
            }
            this.emit('spanEnded', {
                traceId: span.traceId,
                spanId: span.spanId,
                duration: span.duration,
            });
        }
    }
    /**
     * End trace (ends all active spans)
     */
    // Complexity: O(N) — loop-based
    endTrace() {
        while (this.currentContext) {
            this.endSpan();
        }
    }
    /**
     * Create a child span and execute function
     */
    async withSpan(operationName, fn, attributes) {
        const spanId = this.startSpan(operationName, attributes);
        try {
            const result = await fn();
            this.setStatus('ok');
            return result;
        }
        catch (error) {
            const err = error instanceof Error ? error : new Error(String(error));
            this.setStatus('error', err.message);
            this.recordException(err);
            throw error;
        }
        finally {
            this.endSpan();
        }
    }
    /**
     * Record exception
     */
    // Complexity: O(1)
    recordException(error) {
        this.addEvent('exception', {
            'exception.type': error.name,
            'exception.message': error.message,
            'exception.stacktrace': error.stack,
        });
        this.stats.errors++;
    }
    /**
     * Get current trace ID
     */
    // Complexity: O(1)
    getCurrentTraceId() {
        return this.currentContext?.traceId || null;
    }
    /**
     * Get current span ID
     */
    // Complexity: O(1)
    getCurrentSpanId() {
        return this.currentContext?.spanId || null;
    }
    /**
     * Get trace context for propagation
     */
    // Complexity: O(1)
    getTraceContext() {
        return this.currentContext ? { ...this.currentContext } : null;
    }
    /**
     * Set trace context (for cross-process propagation)
     */
    // Complexity: O(1)
    setTraceContext(context) {
        this.currentContext = context;
    }
    /**
     * Get W3C traceparent header
     */
    // Complexity: O(1)
    getTraceparent() {
        if (!this.currentContext)
            return null;
        // Format: version-traceid-spanid-flags
        // version: 00, flags: 01 (sampled)
        return `00-${this.currentContext.traceId}-${this.currentContext.spanId}-01`;
    }
    /**
     * Parse W3C traceparent header
     */
    // Complexity: O(1) — hash/map lookup
    parseTraceparent(traceparent) {
        const parts = traceparent.split('-');
        if (parts.length !== 4)
            return null;
        return {
            traceId: parts[1],
            spanId: parts[2],
        };
    }
    /**
     * Add span to buffer
     */
    // Complexity: O(1)
    addToBuffer(span) {
        this.spanBuffer.push(span);
        // Export to console if enabled
        if (this.config.consoleExport) {
            this.logSpan(span);
        }
        // Check buffer size
        if (this.spanBuffer.length >= this.config.maxSpans) {
            this.export();
        }
    }
    /**
     * Log span to console (for debugging)
     */
    // Complexity: O(1) — hash/map lookup
    logSpan(span) {
        console.log(`[TRACE] ${span.operationName} (${span.duration}ms)`, {
            traceId: span.traceId,
            spanId: span.spanId,
            status: span.status,
            tags: span.tags,
        });
    }
    /**
     * Export spans to backend
     */
    // Complexity: O(1) — amortized
    async export() {
        if (this.spanBuffer.length === 0) {
            return 0;
        }
        const spans = [...this.spanBuffer];
        this.spanBuffer = [];
        try {
            // In a real implementation, this would send to OTLP endpoint
            // For now, we just log the export
            this.log(`Exporting ${spans.length} spans to ${this.config.endpoint}`);
            // Simulate OTLP export
            await this.simulateExport(spans);
            this.stats.spansExported += spans.length;
            this.emit('exported', { count: spans.length });
            return spans.length;
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            this.log(`Export failed: ${message}`);
            // Put spans back in buffer
            this.spanBuffer.unshift(...spans);
            throw error;
        }
    }
    /**
     * Simulate OTLP export
     */
    // Complexity: O(1)
    async simulateExport(spans) {
        // Convert to OTLP format
        const otlpData = this.toOtlpFormat(spans);
        // In real implementation:
        // await fetch(this.config.endpoint!, {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(otlpData),
        // });
        // Simulate network delay
        // SAFETY: async operation — wrap in try-catch for production resilience
        await new Promise((resolve) => setTimeout(resolve, 10));
    }
    /**
     * Convert spans to OTLP format
     */
    // Complexity: O(N) — linear iteration
    toOtlpFormat(spans) {
        return {
            resourceSpans: [
                {
                    resource: {
                        attributes: [
                            { key: 'service.name', value: { stringValue: this.config.serviceName } },
                            { key: 'service.version', value: { stringValue: this.config.serviceVersion } },
                        ],
                    },
                    scopeSpans: [
                        {
                            spans: spans.map((span) => ({
                                traceId: span.traceId,
                                spanId: span.spanId,
                                parentSpanId: span.parentSpanId,
                                name: span.operationName,
                                startTimeUnixNano: span.startTime.getTime() * 1000000,
                                endTimeUnixNano: span.endTime ? span.endTime.getTime() * 1000000 : 0,
                                status: { code: span.status === 'ok' ? 1 : 2 },
                                attributes: Object.entries(span.tags).map(([k, v]) => ({
                                    key: k,
                                    value: { stringValue: v },
                                })),
                                events: span.events.map((e) => ({
                                    timeUnixNano: e.timestamp.getTime() * 1000000,
                                    name: e.name,
                                    attributes: e.attributes
                                        ? Object.entries(e.attributes).map(([k, v]) => ({
                                            key: k,
                                            value: { stringValue: String(v) },
                                        }))
                                        : [],
                                })),
                            })),
                        },
                    ],
                },
            ],
        };
    }
    /**
     * Start export timer
     */
    // Complexity: O(1)
    startExportTimer() {
        this.stopExportTimer();
        this.exportTimer = setInterval(() => {
            this.export().catch((err) => this.log(`Auto-export error: ${err.message}`));
        }, this.config.exportInterval);
    }
    /**
     * Stop export timer
     */
    // Complexity: O(1)
    stopExportTimer() {
        if (this.exportTimer) {
            // Complexity: O(1)
            clearInterval(this.exportTimer);
            this.exportTimer = null;
        }
    }
    /**
     * Get statistics
     */
    // Complexity: O(1)
    getStats() {
        return {
            ...this.stats,
            spansBuffered: this.spanBuffer.length,
            spansActive: this.activeSpans.size,
        };
    }
    /**
     * Get all active traces
     */
    // Complexity: O(N) — linear iteration
    getActiveTraces() {
        const traces = new Set();
        for (const span of this.activeSpans.values()) {
            traces.add(span.traceId);
        }
        return Array.from(traces);
    }
    /**
     * Clear all data
     */
    // Complexity: O(1)
    clear() {
        this.spanBuffer = [];
        this.activeSpans.clear();
        this.currentContext = null;
        this.stats = {
            spansCreated: 0,
            spansExported: 0,
            spansDropped: 0,
            errors: 0,
        };
    }
    /**
     * Shutdown
     */
    // Complexity: O(N) — linear iteration
    async shutdown() {
        this.stopExportTimer();
        // End all active spans
        for (const span of this.activeSpans.values()) {
            span.endTime = new Date();
            span.duration = span.endTime.getTime() - span.startTime.getTime();
            span.status = 'timeout';
            this.spanBuffer.push(span);
        }
        this.activeSpans.clear();
        // Final export
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.export();
        this.log('Observability bridge shutdown');
    }
    /**
     * Log if verbose
     */
    // Complexity: O(1) — hash/map lookup
    log(message, ...args) {
        if (this.config.verbose) {
            console.log(`[Observability] ${message}`, ...args);
        }
    }
}
exports.ObservabilityBridge = ObservabilityBridge;
exports.default = ObservabilityBridge;
