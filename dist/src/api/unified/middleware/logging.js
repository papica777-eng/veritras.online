"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * MIND-ENGINE: REQUEST LOGGING MIDDLEWARE
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * HTTP request/response logging with timing
 * Request ID generation and propagation
 *
 * @author Dimitar Prodromov
 * @version 1.0.0-QANTUM-PRIME
 * @license Commercial
 * ═══════════════════════════════════════════════════════════════════════════════
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
exports.ResponseTimeTracker = exports.RequestLogger = void 0;
exports.createRequestLogger = createRequestLogger;
exports.createResponseTimeTracker = createResponseTimeTracker;
const crypto = __importStar(require("crypto"));
const logger_1 = require("../utils/logger");
const logger = (0, logger_1.getLogger)();
// ═══════════════════════════════════════════════════════════════════════════════
// REQUEST LOGGER
// ═══════════════════════════════════════════════════════════════════════════════
class RequestLogger {
    config;
    static DEFAULT_REDACT_HEADERS = [
        'authorization',
        'x-api-key',
        'cookie',
        'set-cookie'
    ];
    static DEFAULT_REDACT_FIELDS = [
        'password',
        'secret',
        'token',
        'apiKey',
        'creditCard',
        'ssn'
    ];
    constructor(config) {
        this.config = {
            logBody: config?.logBody ?? false,
            logResponseBody: config?.logResponseBody ?? false,
            maxBodyLength: config?.maxBodyLength ?? 10000,
            skipPaths: config?.skipPaths ?? ['/health', '/favicon.ico'],
            redactHeaders: [
                ...RequestLogger.DEFAULT_REDACT_HEADERS,
                ...(config?.redactHeaders ?? [])
            ],
            redactFields: [
                ...RequestLogger.DEFAULT_REDACT_FIELDS,
                ...(config?.redactFields ?? [])
            ],
            requestIdHeader: config?.requestIdHeader ?? 'x-request-id',
            generateRequestId: config?.generateRequestId ?? true
        };
    }
    /**
     * Generate or extract request ID
     */
    // Complexity: O(1)
    getRequestId(req) {
        const existingId = req.headers[this.config.requestIdHeader];
        if (existingId) {
            return existingId;
        }
        if (this.config.generateRequestId) {
            return this.generateId();
        }
        return 'unknown';
    }
    /**
     * Generate unique request ID
     */
    // Complexity: O(1)
    generateId() {
        // Format: timestamp-random (sortable and unique)
        const timestamp = Date.now().toString(36);
        const random = crypto.randomBytes(4).toString('hex');
        return `${timestamp}-${random}`;
    }
    /**
     * Log incoming request
     */
    // Complexity: O(1)
    logRequest(req, requestId, body) {
        const path = req.url?.split('?')[0] || '/';
        // Skip if path is in skip list
        if (this.shouldSkip(path)) {
            return;
        }
        const log = {
            requestId,
            method: req.method || 'GET',
            path,
            ip: this.getClientIP(req),
            timestamp: new Date().toISOString()
        };
        // Add query params
        if (req.url?.includes('?')) {
            const url = new URL(req.url, `http://${req.headers.host}`);
            log.query = Object.fromEntries(url.searchParams);
        }
        // Add user agent
        if (req.headers['user-agent']) {
            log.userAgent = req.headers['user-agent'];
        }
        // Add headers (redacted)
        log.headers = this.redactHeaders(req.headers);
        // Add body (redacted)
        if (this.config.logBody && body) {
            log.body = this.redactBody(body);
        }
        logger.http(`→ ${log.method} ${log.path}`, {
            requestId,
            ip: log.ip,
            userAgent: log.userAgent?.slice(0, 50)
        });
    }
    /**
     * Log outgoing response
     */
    // Complexity: O(1)
    logResponse(res, requestId, startTime, body) {
        const duration = Date.now() - startTime;
        const statusCode = res.statusCode;
        const log = {
            requestId,
            statusCode,
            duration,
            timestamp: new Date().toISOString()
        };
        // Add body (redacted)
        if (this.config.logResponseBody && body) {
            log.body = this.redactBody(body);
        }
        // Choose log level based on status code
        const statusEmoji = this.getStatusEmoji(statusCode);
        const logMessage = `← ${statusCode} ${statusEmoji} (${duration}ms)`;
        if (statusCode >= 500) {
            logger.error(logMessage, { requestId, duration });
        }
        else if (statusCode >= 400) {
            logger.warn(logMessage, { requestId, duration });
        }
        else {
            logger.http(logMessage, { requestId, duration });
        }
    }
    /**
     * Check if path should be skipped
     */
    // Complexity: O(1)
    shouldSkip(path) {
        return this.config.skipPaths.some(skip => {
            if (skip.endsWith('*')) {
                return path.startsWith(skip.slice(0, -1));
            }
            return path === skip;
        });
    }
    /**
     * Redact sensitive headers
     */
    // Complexity: O(N) — loop
    redactHeaders(headers) {
        const redacted = {};
        for (const [key, value] of Object.entries(headers)) {
            if (this.config.redactHeaders.includes(key.toLowerCase())) {
                redacted[key] = '[REDACTED]';
            }
            else {
                redacted[key] = value;
            }
        }
        return redacted;
    }
    /**
     * Redact sensitive fields from body
     */
    // Complexity: O(1)
    redactBody(body) {
        if (!body || typeof body !== 'object') {
            return body;
        }
        const stringified = JSON.stringify(body);
        // Check max length
        if (stringified.length > this.config.maxBodyLength) {
            return { _truncated: true, _length: stringified.length };
        }
        return this.redactObject(body);
    }
    /**
     * Recursively redact object fields
     */
    // Complexity: O(N) — linear scan
    redactObject(obj) {
        const redacted = {};
        for (const [key, value] of Object.entries(obj)) {
            const lowerKey = key.toLowerCase();
            if (this.config.redactFields.some(f => lowerKey.includes(f.toLowerCase()))) {
                redacted[key] = '[REDACTED]';
            }
            else if (Array.isArray(value)) {
                redacted[key] = value.map(item => typeof item === 'object' && item !== null
                    ? this.redactObject(item)
                    : item);
            }
            else if (typeof value === 'object' && value !== null) {
                redacted[key] = this.redactObject(value);
            }
            else {
                redacted[key] = value;
            }
        }
        return redacted;
    }
    /**
     * Get client IP from request
     */
    // Complexity: O(N)
    getClientIP(req) {
        const forwarded = req.headers['x-forwarded-for'];
        if (forwarded) {
            const ips = Array.isArray(forwarded) ? forwarded[0] : forwarded;
            return ips.split(',')[0].trim();
        }
        const realIP = req.headers['x-real-ip'];
        if (realIP) {
            return Array.isArray(realIP) ? realIP[0] : realIP;
        }
        return req.socket.remoteAddress || 'unknown';
    }
    /**
     * Get emoji for status code
     */
    // Complexity: O(1)
    getStatusEmoji(statusCode) {
        if (statusCode >= 500)
            return '💥';
        if (statusCode >= 400)
            return '⚠️';
        if (statusCode >= 300)
            return '↪️';
        if (statusCode >= 200)
            return '✅';
        return '📨';
    }
}
exports.RequestLogger = RequestLogger;
// ═══════════════════════════════════════════════════════════════════════════════
// RESPONSE TIME TRACKER
// ═══════════════════════════════════════════════════════════════════════════════
class ResponseTimeTracker {
    metrics = new Map();
    maxSamples;
    constructor(maxSamples = 1000) {
        this.maxSamples = maxSamples;
    }
    /**
     * Record response time for endpoint
     */
    // Complexity: O(1) — lookup
    record(path, duration) {
        let samples = this.metrics.get(path);
        if (!samples) {
            samples = [];
            this.metrics.set(path, samples);
        }
        samples.push(duration);
        // Keep only last N samples
        if (samples.length > this.maxSamples) {
            samples.shift();
        }
    }
    /**
     * Get statistics for endpoint
     */
    // Complexity: O(N log N) — sort
    getStats(path) {
        const samples = this.metrics.get(path);
        if (!samples || samples.length === 0) {
            return null;
        }
        const sorted = [...samples].sort((a, b) => a - b);
        const count = sorted.length;
        return {
            count,
            min: sorted[0],
            max: sorted[count - 1],
            avg: sorted.reduce((a, b) => a + b, 0) / count,
            p50: sorted[Math.floor(count * 0.5)],
            p95: sorted[Math.floor(count * 0.95)],
            p99: sorted[Math.floor(count * 0.99)]
        };
    }
    /**
     * Get all statistics
     */
    // Complexity: O(N) — loop
    getAllStats() {
        const result = {};
        for (const path of this.metrics.keys()) {
            result[path] = this.getStats(path);
        }
        return result;
    }
    /**
     * Reset all metrics
     */
    // Complexity: O(1)
    reset() {
        this.metrics.clear();
    }
}
exports.ResponseTimeTracker = ResponseTimeTracker;
// ═══════════════════════════════════════════════════════════════════════════════
// FACTORY
// ═══════════════════════════════════════════════════════════════════════════════
function createRequestLogger(config) {
    return new RequestLogger(config);
}
function createResponseTimeTracker(maxSamples) {
    return new ResponseTimeTracker(maxSamples);
}
exports.default = RequestLogger;
