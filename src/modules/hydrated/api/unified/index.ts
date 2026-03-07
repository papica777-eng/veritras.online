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

// Server
export {
  UnifiedServer,
  createServer,
  type ServerConfig,
  type Request,
  type Response,
  type RouteHandler,
  type Middleware,
  type CorsConfig,
} from '../../../../../scripts/qantum/api/unified/server';

// Logger
export {
  Logger,
  createLogger,
  getLogger,
  type LogLevel,
  type LogEntry,
  type LoggerConfig,
} from '../../../../../scripts/qantum/layers/physics/logger';

// Validation
export {
  Schema,
  ValidationException,
  CommonSchemas,
  RequestSchemas,
  v,
  type ValidationResult,
  type ValidationError,
  type SchemaInfer,
} from '../../../../../scripts/qantum/api/unified/utils/validation';

// Auth
export {
  AuthMiddleware,
  createApiKey,
  createUser,
  createJWT,
  JWTUtil,
  PasswordUtil,
  type AuthConfig,
  type AuthStrategy,
  type AuthResult,
  type AuthenticatedUser,
  type ApiKeyInfo,
  type UserInfo,
  type JWTPayload,
} from '../../../../../scripts/qantum/api/unified/middleware/auth';

// Rate Limiting
export {
  RateLimiter,
  SlidingWindowRateLimiter,
  TieredRateLimiter,
  createRateLimiter,
  createSlidingWindowRateLimiter,
  createTieredRateLimiter,
  type RateLimitConfig,
  type RateLimitResult,
  type TieredRateLimitConfig,
} from '../../../../../scripts/qantum/api/unified/middleware/rateLimit';

// Error Handling
export {
  ErrorHandler,
  createErrorHandler,
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  TooManyRequestsError,
  InternalServerError,
  ServiceUnavailableError,
  asyncHandler,
  tryCatch,
  type ErrorResponse,
  type ErrorHandlerConfig,
} from '../../../../../scripts/qantum/api/unified/middleware/errorHandler';

// Request Logging
export {
  RequestLogger,
  ResponseTimeTracker,
  createRequestLogger,
  createResponseTimeTracker,
  type RequestLogConfig,
  type RequestLog,
  type ResponseLog,
} from '../../../../../scripts/qantum/api/unified/middleware/logging';

// ═══════════════════════════════════════════════════════════════════════════════
// QUICK START FACTORY
// ═══════════════════════════════════════════════════════════════════════════════

import { createServer, type ServerConfig } from '../../../../../scripts/qantum/api/unified/server';
import { createApiKey, type ApiKeyInfo } from '../../../../../scripts/qantum/api/unified/middleware/auth';

/**
 * Quick start a production-ready API server
 */
export function quickStart(options: {
  port?: number;
  apiKeys?: string[];
  rateLimit?: boolean;
  cors?: boolean;
}): { server: ReturnType<typeof createServer>; keys: ApiKeyInfo[] } {
  const keys: ApiKeyInfo[] = [];
  const apiKeyMap = new Map<string, ApiKeyInfo>();

  // Generate API keys
  if (options.apiKeys) {
    options.apiKeys.forEach((name) => {
      const key = createApiKey(name, 'pro', ['*']);
      keys.push(key);
      apiKeyMap.set(key.key, key);
    });
  } else {
    // Generate default key
    const key = createApiKey('default', 'pro', ['*']);
    keys.push(key);
    apiKeyMap.set(key.key, key);
  }

  const config: ServerConfig = {
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

  const server = createServer(config);

  return { server, keys };
}

// Default export
export default {
  createServer,
  quickStart,
};
