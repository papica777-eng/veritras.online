"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * MIND-ENGINE: UNIFIED API - EXPORTS
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Main entry point for the unified API module
 *
 * @author Dimitar Prodromov
 * @version 1.0.0-QAntum
 * @license Commercial
 * ═══════════════════════════════════════════════════════════════════════════════
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createResponseTimeTracker = exports.createRequestLogger = exports.ResponseTimeTracker = exports.RequestLogger = exports.tryCatch = exports.asyncHandler = exports.ServiceUnavailableError = exports.InternalServerError = exports.TooManyRequestsError = exports.ConflictError = exports.NotFoundError = exports.ForbiddenError = exports.UnauthorizedError = exports.BadRequestError = exports.AppError = exports.createErrorHandler = exports.ErrorHandler = exports.createTieredRateLimiter = exports.createSlidingWindowRateLimiter = exports.createRateLimiter = exports.TieredRateLimiter = exports.SlidingWindowRateLimiter = exports.RateLimiter = exports.PasswordUtil = exports.JWTUtil = exports.createJWT = exports.createUser = exports.createApiKey = exports.AuthMiddleware = exports.v = exports.RequestSchemas = exports.CommonSchemas = exports.ValidationException = exports.Schema = exports.getLogger = exports.createLogger = exports.Logger = exports.createServer = exports.UnifiedServer = void 0;
exports.quickStart = quickStart;
// Server
var server_1 = require("../../../../../scripts/qantum/api/unified/server");
Object.defineProperty(exports, "UnifiedServer", { enumerable: true, get: function () { return server_1.UnifiedServer; } });
Object.defineProperty(exports, "createServer", { enumerable: true, get: function () { return server_1.createServer; } });
// Logger
var logger_1 = require("../../../../../scripts/qantum/layers/physics/logger");
Object.defineProperty(exports, "Logger", { enumerable: true, get: function () { return logger_1.Logger; } });
Object.defineProperty(exports, "createLogger", { enumerable: true, get: function () { return logger_1.createLogger; } });
Object.defineProperty(exports, "getLogger", { enumerable: true, get: function () { return logger_1.getLogger; } });
// Validation
var validation_1 = require("../../../../../scripts/qantum/api/unified/utils/validation");
Object.defineProperty(exports, "Schema", { enumerable: true, get: function () { return validation_1.Schema; } });
Object.defineProperty(exports, "ValidationException", { enumerable: true, get: function () { return validation_1.ValidationException; } });
Object.defineProperty(exports, "CommonSchemas", { enumerable: true, get: function () { return validation_1.CommonSchemas; } });
Object.defineProperty(exports, "RequestSchemas", { enumerable: true, get: function () { return validation_1.RequestSchemas; } });
Object.defineProperty(exports, "v", { enumerable: true, get: function () { return validation_1.v; } });
// Auth
var auth_1 = require("../../../../../scripts/qantum/api/unified/middleware/auth");
Object.defineProperty(exports, "AuthMiddleware", { enumerable: true, get: function () { return auth_1.AuthMiddleware; } });
Object.defineProperty(exports, "createApiKey", { enumerable: true, get: function () { return auth_1.createApiKey; } });
Object.defineProperty(exports, "createUser", { enumerable: true, get: function () { return auth_1.createUser; } });
Object.defineProperty(exports, "createJWT", { enumerable: true, get: function () { return auth_1.createJWT; } });
Object.defineProperty(exports, "JWTUtil", { enumerable: true, get: function () { return auth_1.JWTUtil; } });
Object.defineProperty(exports, "PasswordUtil", { enumerable: true, get: function () { return auth_1.PasswordUtil; } });
// Rate Limiting
var rateLimit_1 = require("../../../../../scripts/qantum/api/unified/middleware/rateLimit");
Object.defineProperty(exports, "RateLimiter", { enumerable: true, get: function () { return rateLimit_1.RateLimiter; } });
Object.defineProperty(exports, "SlidingWindowRateLimiter", { enumerable: true, get: function () { return rateLimit_1.SlidingWindowRateLimiter; } });
Object.defineProperty(exports, "TieredRateLimiter", { enumerable: true, get: function () { return rateLimit_1.TieredRateLimiter; } });
Object.defineProperty(exports, "createRateLimiter", { enumerable: true, get: function () { return rateLimit_1.createRateLimiter; } });
Object.defineProperty(exports, "createSlidingWindowRateLimiter", { enumerable: true, get: function () { return rateLimit_1.createSlidingWindowRateLimiter; } });
Object.defineProperty(exports, "createTieredRateLimiter", { enumerable: true, get: function () { return rateLimit_1.createTieredRateLimiter; } });
// Error Handling
var errorHandler_1 = require("../../../../../scripts/qantum/api/unified/middleware/errorHandler");
Object.defineProperty(exports, "ErrorHandler", { enumerable: true, get: function () { return errorHandler_1.ErrorHandler; } });
Object.defineProperty(exports, "createErrorHandler", { enumerable: true, get: function () { return errorHandler_1.createErrorHandler; } });
Object.defineProperty(exports, "AppError", { enumerable: true, get: function () { return errorHandler_1.AppError; } });
Object.defineProperty(exports, "BadRequestError", { enumerable: true, get: function () { return errorHandler_1.BadRequestError; } });
Object.defineProperty(exports, "UnauthorizedError", { enumerable: true, get: function () { return errorHandler_1.UnauthorizedError; } });
Object.defineProperty(exports, "ForbiddenError", { enumerable: true, get: function () { return errorHandler_1.ForbiddenError; } });
Object.defineProperty(exports, "NotFoundError", { enumerable: true, get: function () { return errorHandler_1.NotFoundError; } });
Object.defineProperty(exports, "ConflictError", { enumerable: true, get: function () { return errorHandler_1.ConflictError; } });
Object.defineProperty(exports, "TooManyRequestsError", { enumerable: true, get: function () { return errorHandler_1.TooManyRequestsError; } });
Object.defineProperty(exports, "InternalServerError", { enumerable: true, get: function () { return errorHandler_1.InternalServerError; } });
Object.defineProperty(exports, "ServiceUnavailableError", { enumerable: true, get: function () { return errorHandler_1.ServiceUnavailableError; } });
Object.defineProperty(exports, "asyncHandler", { enumerable: true, get: function () { return errorHandler_1.asyncHandler; } });
Object.defineProperty(exports, "tryCatch", { enumerable: true, get: function () { return errorHandler_1.tryCatch; } });
// Request Logging
var logging_1 = require("../../../../../scripts/qantum/api/unified/middleware/logging");
Object.defineProperty(exports, "RequestLogger", { enumerable: true, get: function () { return logging_1.RequestLogger; } });
Object.defineProperty(exports, "ResponseTimeTracker", { enumerable: true, get: function () { return logging_1.ResponseTimeTracker; } });
Object.defineProperty(exports, "createRequestLogger", { enumerable: true, get: function () { return logging_1.createRequestLogger; } });
Object.defineProperty(exports, "createResponseTimeTracker", { enumerable: true, get: function () { return logging_1.createResponseTimeTracker; } });
// ═══════════════════════════════════════════════════════════════════════════════
// QUICK START FACTORY
// ═══════════════════════════════════════════════════════════════════════════════
const server_2 = require("../../../../../scripts/qantum/api/unified/server");
const auth_2 = require("../../../../../scripts/qantum/api/unified/middleware/auth");
/**
 * Quick start a production-ready API server
 */
function quickStart(options) {
    const keys = [];
    const apiKeyMap = new Map();
    // Generate API keys
    if (options.apiKeys) {
        options.apiKeys.forEach((name) => {
            const key = (0, auth_2.createApiKey)(name, 'pro', ['*']);
            keys.push(key);
            apiKeyMap.set(key.key, key);
        });
    }
    else {
        // Generate default key
        const key = (0, auth_2.createApiKey)('default', 'pro', ['*']);
        keys.push(key);
        apiKeyMap.set(key.key, key);
    }
    const config = {
        port: options.port || 3000,
        cors: {
            enabled: options.cors ?? true,
        },
        auth: {
            strategy: 'apikey',
            apiKeys: apiKeyMap,
            publicPaths: ['/health', '/ready', '/api/v1'],
        },
        ...(options.rateLimit !== false && {
            rateLimit: {
                windowMs: 60000,
                tiers: {
                    anonymous: 60,
                    free: 300,
                    pro: 3000,
                    enterprise: 30000,
                },
            },
        }),
    };
    const server = (0, server_2.createServer)(config);
    return { server, keys };
}
// Default export
exports.default = {
    createServer: server_2.createServer,
    quickStart,
};
