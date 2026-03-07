"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ENTERPRISE ERROR HANDLING SYSTEM
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * God Mode Error Handling with:
 * - Typed error hierarchy
 * - Automatic error recovery strategies
 * - Circuit breaker integration
 * - Retry mechanisms with exponential backoff
 * - Error correlation and tracking
 * - Automatic alerting for critical errors
 * - Error analytics and reporting
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorFormatter = exports.GlobalErrorHandler = exports.CircuitBreaker = exports.ErrorRecoveryManager = exports.CircuitBreakerError = exports.LicenseError = exports.SecurityError = exports.ConfigurationError = exports.NetworkError = exports.DatabaseError = exports.TimeoutError = exports.ServiceUnavailableError = exports.InternalServerError = exports.RateLimitError = exports.ConflictError = exports.NotFoundError = exports.AuthorizationError = exports.AuthenticationError = exports.ValidationError = exports.QAntumError = void 0;
const enterprise_logger_1 = require("../logging/enterprise-logger");
const logger = (0, enterprise_logger_1.getLogger)();
/**
 * Base error class for all QAntum errors
 */
class QAntumError extends Error {
    retryStrategy;
    timestamp;
    correlationId;
    context;
    constructor(message, context) {
        super(message);
        this.name = this.constructor.name;
        this.timestamp = new Date();
        this.correlationId = `err-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
        this.context = context;
        this.retryStrategy = 'none';
        // Capture stack trace
        Error.captureStackTrace(this, this.constructor);
        // Log the error
        logger.error(message, this, { component: 'ErrorHandler' }, context);
    }
    toJSON() {
        return {
            name: this.name,
            code: this.code,
            message: this.message,
            statusCode: this.statusCode,
            recoverable: this.recoverable,
            retryStrategy: this.retryStrategy,
            timestamp: this.timestamp.toISOString(),
            correlationId: this.correlationId,
            context: this.context,
            stack: this.stack
        };
    }
}
exports.QAntumError = QAntumError;
/**
 * Validation Errors (400)
 */
class ValidationError extends QAntumError {
    validationErrors;
    code = 'VALIDATION_ERROR';
    statusCode = 400;
    recoverable = false;
    constructor(message, validationErrors) {
        super(message, { validationErrors });
        this.validationErrors = validationErrors;
    }
}
exports.ValidationError = ValidationError;
/**
 * Authentication Errors (401)
 */
class AuthenticationError extends QAntumError {
    code = 'AUTHENTICATION_ERROR';
    statusCode = 401;
    recoverable = false;
    constructor(message = 'Authentication failed') {
        super(message);
    }
}
exports.AuthenticationError = AuthenticationError;
/**
 * Authorization Errors (403)
 */
class AuthorizationError extends QAntumError {
    code = 'AUTHORIZATION_ERROR';
    statusCode = 403;
    recoverable = false;
    constructor(message = 'Insufficient permissions') {
        super(message);
    }
}
exports.AuthorizationError = AuthorizationError;
/**
 * Not Found Errors (404)
 */
class NotFoundError extends QAntumError {
    code = 'NOT_FOUND';
    statusCode = 404;
    recoverable = false;
    constructor(resource, identifier) {
        const message = identifier
            ? `${resource} with identifier '${identifier}' not found`
            : `${resource} not found`;
        super(message, { resource, identifier });
    }
}
exports.NotFoundError = NotFoundError;
/**
 * Conflict Errors (409)
 */
class ConflictError extends QAntumError {
    code = 'CONFLICT';
    statusCode = 409;
    recoverable = false;
    constructor(message) {
        super(message);
    }
}
exports.ConflictError = ConflictError;
/**
 * Rate Limit Errors (429)
 */
class RateLimitError extends QAntumError {
    retryAfter;
    code = 'RATE_LIMIT_EXCEEDED';
    statusCode = 429;
    recoverable = true;
    retryStrategy = 'exponential';
    constructor(message = 'Rate limit exceeded', retryAfter) {
        super(message, { retryAfter });
        this.retryAfter = retryAfter;
    }
}
exports.RateLimitError = RateLimitError;
/**
 * Internal Server Errors (500)
 */
class InternalServerError extends QAntumError {
    code = 'INTERNAL_SERVER_ERROR';
    statusCode = 500;
    recoverable = false;
    constructor(message = 'Internal server error', context) {
        super(message, context);
    }
}
exports.InternalServerError = InternalServerError;
/**
 * Service Unavailable Errors (503)
 */
class ServiceUnavailableError extends QAntumError {
    code = 'SERVICE_UNAVAILABLE';
    statusCode = 503;
    recoverable = true;
    retryStrategy = 'exponential';
    constructor(service, reason) {
        const message = reason
            ? `Service ${service} unavailable: ${reason}`
            : `Service ${service} unavailable`;
        super(message, { service, reason });
    }
}
exports.ServiceUnavailableError = ServiceUnavailableError;
/**
 * Timeout Errors
 */
class TimeoutError extends QAntumError {
    code = 'TIMEOUT';
    statusCode = 504;
    recoverable = true;
    retryStrategy = 'exponential';
    constructor(operation, timeout) {
        super(`Operation '${operation}' timed out after ${timeout}ms`, { operation, timeout });
    }
}
exports.TimeoutError = TimeoutError;
/**
 * Database Errors
 */
class DatabaseError extends QAntumError {
    originalError;
    code = 'DATABASE_ERROR';
    statusCode = 500;
    recoverable = false;
    constructor(message, originalError) {
        super(message, { originalError: originalError?.message });
        this.originalError = originalError;
    }
}
exports.DatabaseError = DatabaseError;
/**
 * Network Errors
 */
class NetworkError extends QAntumError {
    endpoint;
    code = 'NETWORK_ERROR';
    statusCode = 503;
    recoverable = true;
    retryStrategy = 'exponential';
    constructor(message, endpoint) {
        super(message, { endpoint });
        this.endpoint = endpoint;
    }
}
exports.NetworkError = NetworkError;
/**
 * Configuration Errors
 */
class ConfigurationError extends QAntumError {
    configKey;
    code = 'CONFIGURATION_ERROR';
    statusCode = 500;
    recoverable = false;
    constructor(message, configKey) {
        super(message, { configKey });
        this.configKey = configKey;
    }
}
exports.ConfigurationError = ConfigurationError;
/**
 * Security Errors
 */
class SecurityError extends QAntumError {
    severity;
    code = 'SECURITY_VIOLATION';
    statusCode = 403;
    recoverable = false;
    constructor(message, severity = 'high') {
        super(message, { severity });
        this.severity = severity;
        // Log security event
        logger.security(`Security violation: ${message}`, severity, {
            component: 'ErrorHandler',
            correlationId: this.correlationId
        });
    }
}
exports.SecurityError = SecurityError;
/**
 * License Errors
 */
class LicenseError extends QAntumError {
    code = 'LICENSE_ERROR';
    statusCode = 403;
    recoverable = false;
    constructor(message) {
        super(message);
    }
}
exports.LicenseError = LicenseError;
/**
 * Circuit Breaker Errors
 */
class CircuitBreakerError extends QAntumError {
    code = 'CIRCUIT_BREAKER_OPEN';
    statusCode = 503;
    recoverable = true;
    retryStrategy = 'alternative';
    constructor(service) {
        super(`Circuit breaker open for service: ${service}`, { service });
    }
}
exports.CircuitBreakerError = CircuitBreakerError;
class ErrorRecoveryManager {
    static defaultRetryConfig = {
        maxAttempts: 3,
        initialDelay: 1000,
        maxDelay: 30000,
        backoffMultiplier: 2,
        jitter: true
    };
    /**
     * Retry an operation with exponential backoff
     */
    static async retryWithBackoff(operation, config = {}) {
        const retryConfig = { ...this.defaultRetryConfig, ...config };
        let lastError;
        let delay = retryConfig.initialDelay;
        for (let attempt = 1; attempt <= retryConfig.maxAttempts; attempt++) {
            try {
                return await operation();
            }
            catch (error) {
                lastError = error;
                if (attempt === retryConfig.maxAttempts) {
                    break;
                }
                // Check if error is recoverable
                if (error instanceof QAntumError && !error.recoverable) {
                    throw error;
                }
                // Calculate next delay with jitter
                const actualDelay = retryConfig.jitter
                    ? delay * (0.5 + Math.random())
                    : delay;
                logger.warn(`Retry attempt ${attempt}/${retryConfig.maxAttempts} after ${actualDelay}ms`, {
                    component: 'ErrorRecovery',
                    operation: operation.name,
                    error: error.message
                });
                await this.sleep(actualDelay);
                delay = Math.min(delay * retryConfig.backoffMultiplier, retryConfig.maxDelay);
            }
        }
        throw lastError;
    }
    /**
     * Execute with timeout
     */
    static async withTimeout(operation, timeoutMs, operationName = 'operation') {
        return Promise.race([
            operation(),
            this.sleep(timeoutMs).then(() => {
                throw new TimeoutError(operationName, timeoutMs);
            })
        ]);
    }
    /**
     * Execute with circuit breaker
     */
    static async withCircuitBreaker(operation, serviceName, circuitBreaker) {
        if (circuitBreaker.isOpen()) {
            throw new CircuitBreakerError(serviceName);
        }
        try {
            const result = await operation();
            circuitBreaker.recordSuccess();
            return result;
        }
        catch (error) {
            circuitBreaker.recordFailure();
            throw error;
        }
    }
    static sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
exports.ErrorRecoveryManager = ErrorRecoveryManager;
/**
 * Circuit Breaker Implementation
 */
class CircuitBreaker {
    threshold;
    timeout;
    halfOpenAttempts;
    failureCount = 0;
    successCount = 0;
    lastFailureTime;
    state = 'closed';
    constructor(threshold = 5, timeout = 60000, // 1 minute
    halfOpenAttempts = 1) {
        this.threshold = threshold;
        this.timeout = timeout;
        this.halfOpenAttempts = halfOpenAttempts;
    }
    isOpen() {
        if (this.state === 'open') {
            // Check if timeout has elapsed
            if (this.lastFailureTime &&
                Date.now() - this.lastFailureTime.getTime() > this.timeout) {
                this.state = 'half-open';
                this.failureCount = 0;
                return false;
            }
            return true;
        }
        return false;
    }
    recordSuccess() {
        this.failureCount = 0;
        this.successCount++;
        if (this.state === 'half-open') {
            this.state = 'closed';
            logger.info('Circuit breaker closed', { component: 'CircuitBreaker' });
        }
    }
    recordFailure() {
        this.failureCount++;
        this.lastFailureTime = new Date();
        if (this.failureCount >= this.threshold) {
            this.state = 'open';
            logger.error('Circuit breaker opened', undefined, {
                component: 'CircuitBreaker',
                failureCount: this.failureCount,
                threshold: this.threshold
            });
        }
    }
    reset() {
        this.failureCount = 0;
        this.successCount = 0;
        this.state = 'closed';
        this.lastFailureTime = undefined;
    }
    getState() {
        return {
            state: this.state,
            failureCount: this.failureCount,
            successCount: this.successCount,
            lastFailureTime: this.lastFailureTime
        };
    }
}
exports.CircuitBreaker = CircuitBreaker;
/**
 * Global error handler for unhandled errors
 */
class GlobalErrorHandler {
    static initialized = false;
    static initialize() {
        if (this.initialized) {
            return;
        }
        // Handle unhandled promise rejections
        process.on('unhandledRejection', (reason, promise) => {
            logger.fatal('Unhandled Promise Rejection', reason instanceof Error ? reason : new Error(String(reason)), { component: 'GlobalErrorHandler' }, { promise: promise.toString() });
        });
        // Handle uncaught exceptions
        process.on('uncaughtException', (error) => {
            logger.fatal('Uncaught Exception', error, { component: 'GlobalErrorHandler' });
            // Give time for logs to flush
            setTimeout(() => {
                process.exit(1);
            }, 1000);
        });
        // Handle graceful shutdown
        process.on('SIGTERM', () => {
            logger.info('SIGTERM received, shutting down gracefully', {
                component: 'GlobalErrorHandler'
            });
            this.gracefulShutdown();
        });
        process.on('SIGINT', () => {
            logger.info('SIGINT received, shutting down gracefully', {
                component: 'GlobalErrorHandler'
            });
            this.gracefulShutdown();
        });
        this.initialized = true;
        logger.info('Global error handler initialized', { component: 'GlobalErrorHandler' });
    }
    static async gracefulShutdown() {
        try {
            // Perform cleanup tasks
            await logger.shutdown();
            process.exit(0);
        }
        catch (error) {
            console.error('Error during graceful shutdown:', error);
            process.exit(1);
        }
    }
}
exports.GlobalErrorHandler = GlobalErrorHandler;
/**
 * Error formatter for API responses
 */
class ErrorFormatter {
    static toHTTPResponse(error) {
        if (error instanceof QAntumError) {
            return {
                statusCode: error.statusCode,
                body: {
                    error: {
                        code: error.code,
                        message: error.message,
                        correlationId: error.correlationId,
                        timestamp: error.timestamp.toISOString(),
                        ...(process.env.NODE_ENV === 'development' && {
                            stack: error.stack,
                            context: error.context
                        })
                    }
                }
            };
        }
        // Unknown error
        return {
            statusCode: 500,
            body: {
                error: {
                    code: 'UNKNOWN_ERROR',
                    message: process.env.NODE_ENV === 'production'
                        ? 'An unexpected error occurred'
                        : error.message,
                    timestamp: new Date().toISOString(),
                    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
                }
            }
        };
    }
}
exports.ErrorFormatter = ErrorFormatter;
