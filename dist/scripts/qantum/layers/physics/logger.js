"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * PHYSICS LAYER LOGGER - Lightweight Logging for Infrastructure
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * UNIVERSAL SYNTHESIS LAW:
 *   PHYSICS layer imports ONLY from MATH layer.
 *   This logger uses NO external dependencies except Node.js primitives.
 *
 * @module layers/physics/logger
 * @layer PHYSICS [Level 2]
 * @version 1.0.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.PhysicsLogger = void 0;
exports.createLogger = createLogger;
// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════
const LOG_LEVELS = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
    fatal: 4
};
const LEVEL_PREFIXES = {
    debug: '[DEBUG]',
    info: '[INFO] ',
    warn: '[WARN] ',
    error: '[ERROR]',
    fatal: '[FATAL]'
};
// ═══════════════════════════════════════════════════════════════════════════════
// PHYSICS LOGGER CLASS
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * Lightweight logger for PHYSICS layer components.
 * Zero external dependencies. Pure Node.js console output.
 */
class PhysicsLogger {
    context;
    minLevel;
    constructor(context, minLevel = 'info') {
        this.context = context;
        this.minLevel = this.resolveMinLevel(minLevel);
    }
    /**
     * Resolve minimum log level from environment or default
     */
    // Complexity: O(1) — hash/map lookup
    resolveMinLevel(defaultLevel) {
        const envLevel = process.env.LOG_LEVEL?.toLowerCase();
        if (envLevel && LOG_LEVELS[envLevel] !== undefined) {
            return envLevel;
        }
        // Production = warn, Development = debug
        if (process.env.NODE_ENV === 'production') {
            return 'warn';
        }
        return defaultLevel;
    }
    /**
     * Check if a log level should be output
     */
    // Complexity: O(1) — hash/map lookup
    shouldLog(level) {
        return LOG_LEVELS[level] >= LOG_LEVELS[this.minLevel];
    }
    /**
     * Format timestamp in ISO format
     */
    // Complexity: O(1)
    timestamp() {
        return new Date().toISOString();
    }
    /**
     * Format a log entry
     */
    // Complexity: O(1) — hash/map lookup
    format(level, message, ctx) {
        const ts = this.timestamp();
        const prefix = LEVEL_PREFIXES[level];
        const context = this.context + (ctx?.module ? `:${ctx.module}` : '');
        let line = `${ts} ${prefix} [${context}] ${message}`;
        // Add structured context if present
        if (ctx && Object.keys(ctx).length > 0) {
            const extras = { ...ctx };
            delete extras.module;
            if (Object.keys(extras).length > 0) {
                line += ` ${JSON.stringify(extras)}`;
            }
        }
        return line;
    }
    /**
     * Output log entry to appropriate stream
     */
    // Complexity: O(1)
    output(level, formatted) {
        if (level === 'error' || level === 'fatal') {
            console.error(formatted);
        }
        else if (level === 'warn') {
            console.warn(formatted);
        }
        else {
            console.log(formatted);
        }
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // PUBLIC API
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Debug level - Development only
     */
    // Complexity: O(1)
    debug(message, ctx) {
        if (this.shouldLog('debug')) {
            const context = this.normalizeContext(ctx);
            this.output('debug', this.format('debug', message, context));
        }
    }
    /**
     * Info level - Normal operations
     */
    // Complexity: O(1)
    info(message, ctx) {
        if (this.shouldLog('info')) {
            const context = this.normalizeContext(ctx);
            this.output('info', this.format('info', message, context));
        }
    }
    /**
     * Warn level - Potential issues
     */
    // Complexity: O(1)
    warn(message, ctx) {
        if (this.shouldLog('warn')) {
            const context = this.normalizeContext(ctx);
            this.output('warn', this.format('warn', message, context));
        }
    }
    /**
     * Normalize various context types to LogContext
     */
    // Complexity: O(1)
    normalizeContext(ctx) {
        if (!ctx)
            return undefined;
        if (typeof ctx === 'object' && !Array.isArray(ctx))
            return ctx;
        if (Array.isArray(ctx))
            return { data: ctx };
        return { data: ctx };
    }
    // Complexity: O(1)
    error(message, errorOrCtx, ctx) {
        if (!this.shouldLog('error'))
            return;
        let logCtx = this.normalizeContext(ctx);
        if (errorOrCtx instanceof Error) {
            logCtx = {
                ...logCtx,
                errorName: errorOrCtx.name,
                errorMessage: errorOrCtx.message,
                stack: errorOrCtx.stack?.split('\n').slice(0, 5).join('\n')
            };
        }
        else if (errorOrCtx) {
            logCtx = this.normalizeContext(errorOrCtx);
        }
        this.output('error', this.format('error', message, logCtx));
    }
    // Complexity: O(1)
    fatal(message, errorOrCtx, ctx) {
        let logCtx = this.normalizeContext(ctx);
        if (errorOrCtx instanceof Error) {
            logCtx = {
                ...logCtx,
                errorName: errorOrCtx.name,
                errorMessage: errorOrCtx.message,
                stack: errorOrCtx.stack
            };
        }
        else if (errorOrCtx) {
            logCtx = this.normalizeContext(errorOrCtx);
        }
        this.output('fatal', this.format('fatal', message, logCtx));
    }
    /**
     * Create child logger with additional context
     */
    // Complexity: O(1)
    child(module) {
        return new PhysicsLogger(`${this.context}:${module}`, this.minLevel);
    }
    /**
     * Measure execution time of async operation
     */
    async measure(operation, fn) {
        const start = Date.now();
        try {
            const result = await fn();
            const duration = Date.now() - start;
            this.info(`${operation} completed`, { duration, operation });
            return result;
        }
        catch (error) {
            const duration = Date.now() - start;
            this.error(`${operation} failed`, error, { duration, operation });
            throw error;
        }
    }
}
exports.PhysicsLogger = PhysicsLogger;
// ═══════════════════════════════════════════════════════════════════════════════
// SINGLETON FACTORY
// ═══════════════════════════════════════════════════════════════════════════════
const loggerCache = new Map();
/**
 * Create or retrieve a logger for a PHYSICS layer component
 *
 * @example
 * ```typescript
 * import { createLogger } from './logger';
 * const log = createLogger('SwarmOrchestrator');
 * log.info('Starting swarm coordination');
 * ```
 */
function createLogger(context) {
    if (!loggerCache.has(context)) {
        loggerCache.set(context, new PhysicsLogger(context));
    }
    return loggerCache.get(context);
}
// ═══════════════════════════════════════════════════════════════════════════════
// GLOBAL SINGLETON (Compatible with old logger interface)
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * Global singleton logger instance
 *
 * @example
 * ```typescript
 * import { logger } from './logger';
 * logger.info('Message');
 * logger.debug('Debug info');
 * logger.error('Error occurred', error);
 * ```
 */
exports.logger = new PhysicsLogger('PHYSICS');
// ═══════════════════════════════════════════════════════════════════════════════
// DEFAULT EXPORT
// ═══════════════════════════════════════════════════════════════════════════════
exports.default = exports.logger;
