"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * MIND-ENGINE: ERROR HANDLER MIDDLEWARE
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Centralized error handling with proper HTTP responses
 * Error classification, logging, and sanitization
 *
 * @author Dimitar Prodromov
 * @version 1.0.0
 * @license Commercial
 * ═══════════════════════════════════════════════════════════════════════════════
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorHandler = exports.ServiceUnavailableError = exports.InternalServerError = exports.TooManyRequestsError = exports.ConflictError = exports.NotFoundError = exports.ForbiddenError = exports.UnauthorizedError = exports.BadRequestError = exports.AppError = void 0;
exports.asyncHandler = asyncHandler;
exports.tryCatch = tryCatch;
exports.createErrorHandler = createErrorHandler;
const logger_1 = require("../utils/logger");
const validation_1 = require("../utils/validation");
const logger = (0, logger_1.getLogger)().child('ErrorHandler');
// ═══════════════════════════════════════════════════════════════════════════════
// ERROR TYPES
// ═══════════════════════════════════════════════════════════════════════════════
class AppError extends Error {
    statusCode;
    code;
    isOperational;
    details;
    constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', isOperational = true, details) {
        super(message);
        this.name = 'AppError';
        this.statusCode = statusCode;
        this.code = code;
        this.isOperational = isOperational;
        this.details = details;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
class BadRequestError extends AppError {
    constructor(message = 'Bad request', details) {
        super(message, 400, 'BAD_REQUEST', true, details);
        this.name = 'BadRequestError';
    }
}
exports.BadRequestError = BadRequestError;
class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized', code = 'UNAUTHORIZED') {
        super(message, 401, code, true);
        this.name = 'UnauthorizedError';
    }
}
exports.UnauthorizedError = UnauthorizedError;
class ForbiddenError extends AppError {
    constructor(message = 'Forbidden', code = 'FORBIDDEN') {
        super(message, 403, code, true);
        this.name = 'ForbiddenError';
    }
}
exports.ForbiddenError = ForbiddenError;
class NotFoundError extends AppError {
    constructor(resource = 'Resource') {
        super(`${resource} not found`, 404, 'NOT_FOUND', true);
        this.name = 'NotFoundError';
    }
}
exports.NotFoundError = NotFoundError;
class ConflictError extends AppError {
    constructor(message = 'Conflict') {
        super(message, 409, 'CONFLICT', true);
        this.name = 'ConflictError';
    }
}
exports.ConflictError = ConflictError;
class TooManyRequestsError extends AppError {
    retryAfter;
    constructor(retryAfter = 60) {
        super('Too many requests', 429, 'RATE_LIMIT_EXCEEDED', true, { retryAfter });
        this.name = 'TooManyRequestsError';
        this.retryAfter = retryAfter;
    }
}
exports.TooManyRequestsError = TooManyRequestsError;
class InternalServerError extends AppError {
    constructor(message = 'Internal server error') {
        super(message, 500, 'INTERNAL_ERROR', false);
        this.name = 'InternalServerError';
    }
}
exports.InternalServerError = InternalServerError;
class ServiceUnavailableError extends AppError {
    constructor(message = 'Service temporarily unavailable') {
        super(message, 503, 'SERVICE_UNAVAILABLE', true);
        this.name = 'ServiceUnavailableError';
    }
}
exports.ServiceUnavailableError = ServiceUnavailableError;
class ErrorHandler {
    config;
    constructor(config) {
        const env = process.env.NODE_ENV === 'production' ? 'production' : 'development';
        this.config = {
            includeStack: config?.includeStack ?? (env === 'development'),
            includeDetails: config?.includeDetails ?? true,
            logErrors: config?.logErrors ?? true,
            environment: config?.environment ?? env,
            transformError: config?.transformError ?? this.defaultTransform.bind(this)
        };
    }
    /**
     * Handle error and send response
     */
    // Complexity: O(1)
    handle(error, res, requestId, path) {
        const appError = this.normalize(error);
        if (this.config.logErrors) {
            this.logError(appError, requestId);
        }
        const response = this.formatResponse(appError, requestId, path);
        this.sendResponse(res, appError.statusCode, response);
    }
    /**
     * Normalize any error to AppError
     */
    // Complexity: O(1)
    normalize(error) {
        // Already an AppError
        if (error instanceof AppError) {
            return error;
        }
        // Validation error
        if (error instanceof validation_1.ValidationException) {
            return new BadRequestError('Validation failed', error.errors);
        }
        // Standard Error
        if (error instanceof Error) {
            return this.config.transformError(error);
        }
        // Unknown error
        return new InternalServerError('An unexpected error occurred');
    }
    /**
     * Default error transformer
     */
    // Complexity: O(1) — amortized
    defaultTransform(error) {
        // Handle common error types
        const message = error.message.toLowerCase();
        if (message.includes('not found')) {
            return new NotFoundError(error.message);
        }
        if (message.includes('unauthorized') || message.includes('unauthenticated')) {
            return new UnauthorizedError(error.message);
        }
        if (message.includes('forbidden') || message.includes('permission denied')) {
            return new ForbiddenError(error.message);
        }
        if (message.includes('invalid') || message.includes('malformed')) {
            return new BadRequestError(error.message);
        }
        if (message.includes('timeout')) {
            return new ServiceUnavailableError('Request timed out');
        }
        if (message.includes('econnrefused') || message.includes('enotfound')) {
            return new ServiceUnavailableError('External service unavailable');
        }
        // Default to internal error
        const appError = new InternalServerError(this.config.environment === 'development'
            ? error.message
            : 'An unexpected error occurred');
        appError.stack = error.stack;
        return appError;
    }
    /**
     * Format error response
     */
    // Complexity: O(1) — amortized
    formatResponse(error, requestId, path) {
        const response = {
            error: {
                message: error.message,
                code: error.code,
                statusCode: error.statusCode,
                timestamp: new Date().toISOString()
            }
        };
        if (requestId) {
            response.error.requestId = requestId;
        }
        if (path) {
            response.error.path = path;
        }
        if (this.config.includeDetails && error.details) {
            response.error.details = error.details;
        }
        if (this.config.includeStack && error.stack) {
            response.error.stack = error.stack;
        }
        return response;
    }
    /**
     * Send HTTP response
     */
    // Complexity: O(1)
    sendResponse(res, statusCode, body) {
        if (res.writableEnded) {
            logger.warn('Attempted to send error response after response ended');
            return;
        }
        res.writeHead(statusCode, {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store'
        });
        res.end(JSON.stringify(body));
    }
    /**
     * Log error
     */
    // Complexity: O(1) — amortized
    logError(error, requestId) {
        const meta = {
            statusCode: error.statusCode,
            code: error.code,
            isOperational: error.isOperational,
        };
        if (requestId)
            meta.requestId = requestId;
        if (error.details)
            meta.details = error.details;
        if (error.isOperational) {
            // Expected errors - log as warning
            if (error.statusCode >= 500) {
                logger.error(error.message, { ...meta, stack: error.stack });
            }
            else if (error.statusCode >= 400) {
                logger.warn(error.message, meta);
            }
        }
        else {
            // Unexpected errors - always log as error with stack
            logger.error(error.message, { ...meta, stack: error.stack });
        }
    }
    /**
     * Create middleware function
     */
    // Complexity: O(N) — potential recursive descent
    middleware() {
        return (error, res, requestId, path) => {
            this.handle(error, res, requestId, path);
        };
    }
}
exports.ErrorHandler = ErrorHandler;
/**
 * Wrap async handler to catch errors
 */
function asyncHandler(fn) {
    return async (...args) => {
        try {
            return await fn(...args);
        }
        catch (error) {
            throw error; // Re-throw to be caught by error handler
        }
    };
}
/**
 * Try-catch wrapper that returns result or error
 */
async function tryCatch(fn) {
    try {
        const result = await fn();
        return [result, null];
    }
    catch (error) {
        return [null, error instanceof Error ? error : new Error(String(error))];
    }
}
// ═══════════════════════════════════════════════════════════════════════════════
// FACTORY
// ═══════════════════════════════════════════════════════════════════════════════
function createErrorHandler(config) {
    return new ErrorHandler(config);
}
// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════
exports.default = ErrorHandler;
