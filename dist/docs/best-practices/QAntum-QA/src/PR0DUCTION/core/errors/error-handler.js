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
 * For licensing inquiries: dimitar.prodromov@QAntum.dev
 * ═══════════════════════════════════════════════════════════════════════════════
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CentralizedErrorHandler = exports.AggregateRetryError = exports.ExponentialBackoffRetry = exports.CircuitOpenError = exports.WorkerError = exports.MutationError = exports.SecurityError = exports.BrowserError = exports.AIServiceError = exports.ConfigurationError = exports.ValidationError = exports.TimeoutError = exports.NetworkError = exports.QAntumError = void 0;
exports.createNeuralSnapshot = createNeuralSnapshot;
const node_events_1 = require("node:events");
// ═══════════════════════════════════════════════════════════════════════════════
// CUSTOM ERROR TYPES - Specific, not generic!
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * Base error class for QANTUM errors
 * All custom errors extend this for type-safe handling
 */
class QAntumError extends Error {
    /** Neural snapshot at time of error */
    neuralSnapshot;
    /** Original error if wrapped */
    cause;
    constructor(message, cause) {
        super(message);
        this.name = this.constructor.name;
        this.cause = cause;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.QAntumError = QAntumError;
/**
 * Network-related errors (API calls, WebSocket, etc.)
 */
class NetworkError extends QAntumError {
    code = 'NETWORK_ERROR';
    component = 'Network';
    recoverable = true;
    retryStrategy = 'exponential';
    /** HTTP status code if applicable */
    statusCode;
    /** Target URL or endpoint */
    endpoint;
    constructor(message, options) {
        super(message, options?.cause);
        this.statusCode = options?.statusCode;
        this.endpoint = options?.endpoint;
    }
}
exports.NetworkError = NetworkError;
/**
 * Timeout errors for operations that exceeded their time limit
 */
class TimeoutError extends QAntumError {
    code = 'TIMEOUT_ERROR';
    component = 'Timeout';
    recoverable = true;
    retryStrategy = 'exponential';
    /** Operation that timed out */
    operation;
    /** Timeout duration in ms */
    timeout;
    /** Elapsed time when timeout occurred */
    elapsed;
    constructor(operation, timeout, elapsed, cause) {
        super(`Operation '${operation}' timed out after ${elapsed}ms (limit: ${timeout}ms)`, cause);
        this.operation = operation;
        this.timeout = timeout;
        this.elapsed = elapsed;
    }
}
exports.TimeoutError = TimeoutError;
/**
 * Validation errors for invalid input or data
 */
class ValidationError extends QAntumError {
    code = 'VALIDATION_ERROR';
    component = 'Validation';
    recoverable = false;
    retryStrategy = 'none';
    /** Field(s) that failed validation */
    fields;
    /** Validation rules that were violated */
    violations;
    constructor(message, violations) {
        super(message);
        this.fields = violations.map(v => v.field);
        this.violations = violations;
    }
}
exports.ValidationError = ValidationError;
/**
 * Configuration errors for missing or invalid configuration
 */
class ConfigurationError extends QAntumError {
    code = 'CONFIGURATION_ERROR';
    component = 'Configuration';
    recoverable = false;
    retryStrategy = 'none';
    /** Configuration key that's problematic */
    configKey;
    /** Expected type or value */
    expected;
    /** Actual value received */
    actual;
    constructor(message, configKey, options) {
        super(message);
        this.configKey = configKey;
        this.expected = options?.expected;
        this.actual = options?.actual;
    }
}
exports.ConfigurationError = ConfigurationError;
/**
 * AI service errors (API failures, rate limits, etc.)
 */
class AIServiceError extends QAntumError {
    code = 'AI_SERVICE_ERROR';
    component = 'AIService';
    recoverable = true;
    retryStrategy = 'alternative';
    /** AI provider that failed */
    provider;
    /** Model used */
    model;
    /** Error type from provider */
    providerError;
    /** Whether rate limited */
    rateLimited;
    constructor(message, provider, options) {
        super(message, options?.cause);
        this.provider = provider;
        this.model = options?.model;
        this.providerError = options?.providerError;
        this.rateLimited = options?.rateLimited ?? false;
    }
}
exports.AIServiceError = AIServiceError;
/**
 * Browser automation errors
 */
class BrowserError extends QAntumError {
    code = 'BROWSER_ERROR';
    component = 'Browser';
    recoverable = true;
    retryStrategy = 'immediate';
    /** Browser type (chromium, firefox, webkit) */
    browserType;
    /** Page URL when error occurred */
    pageUrl;
    /** Selector that caused the error */
    selector;
    constructor(message, browserType, options) {
        super(message, options?.cause);
        this.browserType = browserType;
        this.pageUrl = options?.pageUrl;
        this.selector = options?.selector;
    }
}
exports.BrowserError = BrowserError;
/**
 * Security violation errors from sandbox
 */
class SecurityError extends QAntumError {
    code = 'SECURITY_ERROR';
    component = 'Security';
    recoverable = false;
    retryStrategy = 'none';
    /** Type of security violation */
    violationType;
    /** Attempted operation */
    attemptedOperation;
    constructor(message, violationType, attemptedOperation) {
        super(message);
        this.violationType = violationType;
        this.attemptedOperation = attemptedOperation;
    }
}
exports.SecurityError = SecurityError;
/**
 * Mutation errors from SEGC
 */
class MutationError extends QAntumError {
    code = 'MUTATION_ERROR';
    component = 'SEGC';
    recoverable = true;
    retryStrategy = 'alternative';
    /** Mutation ID that failed */
    mutationId;
    /** Phase where failure occurred */
    phase;
    /** Whether rollback is available */
    rollbackAvailable;
    constructor(message, mutationId, phase, options) {
        super(message, options?.cause);
        this.mutationId = mutationId;
        this.phase = phase;
        this.rollbackAvailable = options?.rollbackAvailable ?? false;
    }
}
exports.MutationError = MutationError;
/**
 * Worker thread errors
 */
class WorkerError extends QAntumError {
    code = 'WORKER_ERROR';
    component = 'Worker';
    recoverable = true;
    retryStrategy = 'immediate';
    /** Worker ID that errored */
    workerId;
    /** Task type being executed */
    taskType;
    /** Task ID if available */
    taskId;
    constructor(message, workerId, options) {
        super(message, options?.cause);
        this.workerId = workerId;
        this.taskType = options?.taskType;
        this.taskId = options?.taskId;
    }
}
exports.WorkerError = WorkerError;
/**
 * Circuit breaker errors
 */
class CircuitOpenError extends QAntumError {
    code = 'CIRCUIT_OPEN';
    component = 'CircuitBreaker';
    recoverable = true;
    retryStrategy = 'alternative';
    /** Service that's circuit-opened */
    service;
    /** When circuit will attempt half-open */
    cooldownEnd;
    constructor(service, cooldownEnd) {
        super(`Circuit breaker open for service '${service}'. Retry after ${cooldownEnd.toISOString()}`);
        this.service = service;
        this.cooldownEnd = cooldownEnd;
    }
}
exports.CircuitOpenError = CircuitOpenError;
// ═══════════════════════════════════════════════════════════════════════════════
// NEURAL SNAPSHOT GENERATOR
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * Generate a neural snapshot of the current system state
 * Captures memory, handles, and stack trace for debugging
 */
function createNeuralSnapshot(error) {
    // Note: _getActiveHandles is an undocumented Node.js API for debugging
    const processWithInternals = process;
    return {
        memoryUsage: process.memoryUsage(),
        activeHandles: processWithInternals._getActiveHandles?.()?.length ?? 0,
        uptime: process.uptime(),
        timestamp: new Date(),
        stackTrace: error?.stack ?? new Error().stack ?? ''
    };
}
// ═══════════════════════════════════════════════════════════════════════════════
// EXPONENTIAL BACKOFF RETRY STRATEGY
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * Default retry options
 */
const DEFAULT_RETRY_OPTIONS = {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 30000,
    backoffMultiplier: 2,
    retryCondition: () => true
};
/**
 * 🔄 Exponential Backoff Retry Strategy
 *
 * Implements intelligent retry logic with:
 * - Exponential backoff (delay doubles each attempt)
 * - Jitter to prevent thundering herd
 * - Alternative strategies when retries exhausted
 * - Neural snapshots on each failure
 */
class ExponentialBackoffRetry {
    logger;
    alternatives = new Map();
    constructor(logger) {
        this.logger = logger;
    }
    /**
     * Register alternative strategies for a specific operation
     * @param operationName - Name of the operation
     * @param strategies - Alternative strategies to try
     */
    registerAlternatives(operationName, strategies) {
        this.alternatives.set(operationName, strategies);
    }
    /**
     * Execute a function with exponential backoff retry
     * @param fn - Function to execute
     * @param options - Retry options
     * @returns Result of successful execution
     * @throws Last error if all retries and alternatives fail
     */
    async execute(fn, options = {}) {
        const opts = { ...DEFAULT_RETRY_OPTIONS, ...options };
        const errors = [];
        // Try main function with retries
        for (let attempt = 1; attempt <= opts.maxRetries; attempt++) {
            try {
                return await fn();
            }
            catch (error) {
                const err = error;
                const snapshot = createNeuralSnapshot(err);
                errors.push({ error: err, attempt, snapshot });
                this.logger?.warn(`Retry attempt ${attempt}/${opts.maxRetries} failed`, {
                    error: err.message,
                    attempt,
                    operation: options.operationName
                });
                // Check if we should retry
                if (attempt === opts.maxRetries || !opts.retryCondition(err)) {
                    break;
                }
                // Calculate delay with jitter
                const baseDelay = opts.initialDelay * Math.pow(opts.backoffMultiplier, attempt - 1);
                const jitter = Math.random() * 0.3 * baseDelay;
                const delay = Math.min(baseDelay + jitter, opts.maxDelay);
                this.logger?.info(`Waiting ${Math.round(delay)}ms before retry ${attempt + 1}`, {
                    operation: options.operationName
                });
                await this.sleep(delay);
            }
        }
        // Try alternative strategies
        if (options.operationName) {
            const alternatives = this.alternatives.get(options.operationName);
            if (alternatives && alternatives.length > 0) {
                const lastError = errors[errors.length - 1]?.error;
                for (const alt of alternatives) {
                    if (alt.condition && lastError && !alt.condition(lastError)) {
                        continue;
                    }
                    try {
                        this.logger?.info(`Trying alternative strategy: ${alt.name}`, {
                            operation: options.operationName
                        });
                        return await alt.execute();
                    }
                    catch (altError) {
                        const err = altError;
                        errors.push({
                            error: err,
                            attempt: opts.maxRetries + alternatives.indexOf(alt) + 1,
                            snapshot: createNeuralSnapshot(err)
                        });
                        this.logger?.warn(`Alternative strategy '${alt.name}' failed`, {
                            error: err.message
                        });
                    }
                }
            }
        }
        // All attempts failed - create comprehensive error
        const lastError = errors[errors.length - 1];
        const aggregateError = new AggregateRetryError(`All ${errors.length} attempts failed for operation '${options.operationName ?? 'unknown'}'`, errors);
        throw aggregateError;
    }
    /**
     * Sleep helper
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
exports.ExponentialBackoffRetry = ExponentialBackoffRetry;
/**
 * Aggregate error containing all retry failures
 */
class AggregateRetryError extends Error {
    code = 'AGGREGATE_RETRY_ERROR';
    attempts;
    totalAttempts;
    constructor(message, attempts) {
        super(message);
        this.name = 'AggregateRetryError';
        this.attempts = attempts;
        this.totalAttempts = attempts.length;
    }
    /**
     * Get the last error
     */
    get lastError() {
        return this.attempts[this.attempts.length - 1]?.error;
    }
    /**
     * Get all unique error types
     */
    get errorTypes() {
        return [...new Set(this.attempts.map(a => a.error.name))];
    }
}
exports.AggregateRetryError = AggregateRetryError;
// ═══════════════════════════════════════════════════════════════════════════════
// CENTRALIZED ERROR HANDLER
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * 🛡️ Centralized Error Handler
 *
 * Routes errors to appropriate handlers based on type.
 * Supports custom strategies for different error categories.
 */
class CentralizedErrorHandler extends node_events_1.EventEmitter {
    strategies = new Map();
    logger;
    retryStrategy;
    constructor(options) {
        super();
        this.logger = options?.logger;
        this.retryStrategy = options?.retryStrategy ?? new ExponentialBackoffRetry(options?.logger);
        // Register default strategies
        this.registerDefaultStrategies();
    }
    /**
     * Register a custom error handling strategy
     * @param errorType - Error type name (constructor.name)
     * @param strategy - Strategy to handle the error
     */
    registerStrategy(errorType, strategy) {
        this.strategies.set(errorType, strategy);
        this.logger?.debug(`Registered error strategy for '${errorType}'`);
    }
    /**
     * Handle an error with appropriate strategy
     * @param error - Error to handle
     * @param context - Additional context
     * @returns Result of error handling
     */
    async handle(error, context) {
        // Capture neural snapshot
        const snapshot = createNeuralSnapshot(error);
        if (error instanceof QAntumError) {
            error.neuralSnapshot = snapshot;
        }
        // Log the error
        this.logger?.error(`Error in ${context?.component ?? 'unknown'}`, error, {
            operation: context?.operation,
            code: error.code,
            recoverable: error.recoverable,
            memoryUsage: snapshot.memoryUsage.heapUsed
        });
        // Emit error event
        this.emit('error', { error, context, snapshot });
        // Find appropriate strategy
        const strategy = this.findStrategy(error);
        if (strategy) {
            try {
                return await strategy.handle(error, context ?? {
                    operation: 'unknown',
                    component: 'unknown',
                    neuralSnapshot: snapshot
                });
            }
            catch (strategyError) {
                this.logger?.error('Error strategy failed', strategyError);
            }
        }
        // Default handling - not recovered
        return {
            recovered: false,
            retried: false,
            retryCount: 0,
            finalError: error
        };
    }
    /**
     * Find the most appropriate strategy for an error
     */
    findStrategy(error) {
        // Try exact match first
        let strategy = this.strategies.get(error.name);
        if (strategy?.canHandle(error)) {
            return strategy;
        }
        // Try by error code for QAntumErrors
        if (error instanceof QAntumError) {
            strategy = this.strategies.get(error.code);
            if (strategy?.canHandle(error)) {
                return strategy;
            }
        }
        // Try generic handlers
        for (const [, s] of this.strategies) {
            if (s.canHandle(error)) {
                return s;
            }
        }
        return undefined;
    }
    /**
     * Register default strategies for known error types
     */
    registerDefaultStrategies() {
        // Network error strategy - retry with exponential backoff
        this.registerStrategy('NetworkError', {
            canHandle: (e) => e instanceof NetworkError,
            handle: async (error, context) => {
                const networkError = error;
                // Don't retry 4xx errors (client errors)
                if (networkError.statusCode && networkError.statusCode >= 400 && networkError.statusCode < 500) {
                    return { recovered: false, retried: false, retryCount: 0, finalError: error };
                }
                // Will retry via external mechanism
                return { recovered: false, retried: true, retryCount: 0, finalError: error };
            }
        });
        // AI Service error strategy - try alternative providers
        this.registerStrategy('AIServiceError', {
            canHandle: (e) => e instanceof AIServiceError,
            handle: async (error, _context) => {
                const aiError = error;
                // If rate limited, retry is suggested
                if (aiError.rateLimited) {
                    return { recovered: false, retried: true, retryCount: 0, finalError: error };
                }
                // Try alternative provider
                return { recovered: false, retried: true, retryCount: 0, finalError: error };
            }
        });
        // Timeout error strategy
        this.registerStrategy('TimeoutError', {
            canHandle: (e) => e instanceof TimeoutError,
            handle: async (_error, _context) => {
                return { recovered: false, retried: true, retryCount: 0 };
            }
        });
        // Security error strategy - never retry
        this.registerStrategy('SecurityError', {
            canHandle: (e) => e instanceof SecurityError,
            handle: async (error, context) => {
                this.logger?.fatal('SECURITY VIOLATION', error, { context });
                this.emit('securityViolation', { error, context });
                return { recovered: false, retried: false, retryCount: 0, finalError: error };
            }
        });
    }
}
exports.CentralizedErrorHandler = CentralizedErrorHandler;
// ═══════════════════════════════════════════════════════════════════════════════
// DEFAULT EXPORT
// ═══════════════════════════════════════════════════════════════════════════════
exports.default = CentralizedErrorHandler;
