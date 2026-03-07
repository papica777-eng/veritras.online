"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ENTERPRISE CORE - MAIN EXPORTS
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * God Mode Enterprise Infrastructure
 * - Logging
 * - Error Handling
 * - Security
 * - Configuration Management
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
exports.getConfigManager = exports.createConfigManager = exports.QAntumConfigSchema = exports.EnterpriseConfigManager = exports.AuditLogger = exports.SecretManager = exports.CryptoService = exports.SecurityHeaders = exports.RateLimiter = exports.SchemaValidator = exports.InputSanitizer = exports.ErrorFormatter = exports.GlobalErrorHandler = exports.CircuitBreaker = exports.ErrorRecoveryManager = exports.CircuitBreakerError = exports.LicenseError = exports.SecurityError = exports.ConfigurationError = exports.NetworkError = exports.DatabaseError = exports.TimeoutError = exports.ServiceUnavailableError = exports.InternalServerError = exports.RateLimitError = exports.ConflictError = exports.NotFoundError = exports.AuthorizationError = exports.AuthenticationError = exports.ValidationError = exports.QAntumError = exports.DatadogTransport = exports.getLogger = exports.createLogger = exports.LogLevel = exports.EnterpriseLogger = void 0;
exports.initializeEnterpriseCore = initializeEnterpriseCore;
// Logging
var enterprise_logger_1 = require("./logging/enterprise-logger");
Object.defineProperty(exports, "EnterpriseLogger", { enumerable: true, get: function () { return enterprise_logger_1.EnterpriseLogger; } });
Object.defineProperty(exports, "LogLevel", { enumerable: true, get: function () { return enterprise_logger_1.LogLevel; } });
Object.defineProperty(exports, "createLogger", { enumerable: true, get: function () { return enterprise_logger_1.createLogger; } });
Object.defineProperty(exports, "getLogger", { enumerable: true, get: function () { return enterprise_logger_1.getLogger; } });
Object.defineProperty(exports, "DatadogTransport", { enumerable: true, get: function () { return enterprise_logger_1.DatadogTransport; } });
// Error Handling
var enterprise_errors_1 = require("./errors/enterprise-errors");
Object.defineProperty(exports, "QAntumError", { enumerable: true, get: function () { return enterprise_errors_1.QAntumError; } });
Object.defineProperty(exports, "ValidationError", { enumerable: true, get: function () { return enterprise_errors_1.ValidationError; } });
Object.defineProperty(exports, "AuthenticationError", { enumerable: true, get: function () { return enterprise_errors_1.AuthenticationError; } });
Object.defineProperty(exports, "AuthorizationError", { enumerable: true, get: function () { return enterprise_errors_1.AuthorizationError; } });
Object.defineProperty(exports, "NotFoundError", { enumerable: true, get: function () { return enterprise_errors_1.NotFoundError; } });
Object.defineProperty(exports, "ConflictError", { enumerable: true, get: function () { return enterprise_errors_1.ConflictError; } });
Object.defineProperty(exports, "RateLimitError", { enumerable: true, get: function () { return enterprise_errors_1.RateLimitError; } });
Object.defineProperty(exports, "InternalServerError", { enumerable: true, get: function () { return enterprise_errors_1.InternalServerError; } });
Object.defineProperty(exports, "ServiceUnavailableError", { enumerable: true, get: function () { return enterprise_errors_1.ServiceUnavailableError; } });
Object.defineProperty(exports, "TimeoutError", { enumerable: true, get: function () { return enterprise_errors_1.TimeoutError; } });
Object.defineProperty(exports, "DatabaseError", { enumerable: true, get: function () { return enterprise_errors_1.DatabaseError; } });
Object.defineProperty(exports, "NetworkError", { enumerable: true, get: function () { return enterprise_errors_1.NetworkError; } });
Object.defineProperty(exports, "ConfigurationError", { enumerable: true, get: function () { return enterprise_errors_1.ConfigurationError; } });
Object.defineProperty(exports, "SecurityError", { enumerable: true, get: function () { return enterprise_errors_1.SecurityError; } });
Object.defineProperty(exports, "LicenseError", { enumerable: true, get: function () { return enterprise_errors_1.LicenseError; } });
Object.defineProperty(exports, "CircuitBreakerError", { enumerable: true, get: function () { return enterprise_errors_1.CircuitBreakerError; } });
Object.defineProperty(exports, "ErrorRecoveryManager", { enumerable: true, get: function () { return enterprise_errors_1.ErrorRecoveryManager; } });
Object.defineProperty(exports, "CircuitBreaker", { enumerable: true, get: function () { return enterprise_errors_1.CircuitBreaker; } });
Object.defineProperty(exports, "GlobalErrorHandler", { enumerable: true, get: function () { return enterprise_errors_1.GlobalErrorHandler; } });
Object.defineProperty(exports, "ErrorFormatter", { enumerable: true, get: function () { return enterprise_errors_1.ErrorFormatter; } });
// Security
var enterprise_security_1 = require("./security/enterprise-security");
Object.defineProperty(exports, "InputSanitizer", { enumerable: true, get: function () { return enterprise_security_1.InputSanitizer; } });
Object.defineProperty(exports, "SchemaValidator", { enumerable: true, get: function () { return enterprise_security_1.SchemaValidator; } });
Object.defineProperty(exports, "RateLimiter", { enumerable: true, get: function () { return enterprise_security_1.RateLimiter; } });
Object.defineProperty(exports, "SecurityHeaders", { enumerable: true, get: function () { return enterprise_security_1.SecurityHeaders; } });
Object.defineProperty(exports, "CryptoService", { enumerable: true, get: function () { return enterprise_security_1.CryptoService; } });
Object.defineProperty(exports, "SecretManager", { enumerable: true, get: function () { return enterprise_security_1.SecretManager; } });
Object.defineProperty(exports, "AuditLogger", { enumerable: true, get: function () { return enterprise_security_1.AuditLogger; } });
// Configuration
var enterprise_config_1 = require("./config/enterprise-config");
Object.defineProperty(exports, "EnterpriseConfigManager", { enumerable: true, get: function () { return enterprise_config_1.EnterpriseConfigManager; } });
Object.defineProperty(exports, "QAntumConfigSchema", { enumerable: true, get: function () { return enterprise_config_1.QAntumConfigSchema; } });
Object.defineProperty(exports, "createConfigManager", { enumerable: true, get: function () { return enterprise_config_1.createConfigManager; } });
Object.defineProperty(exports, "getConfigManager", { enumerable: true, get: function () { return enterprise_config_1.getConfigManager; } });
/**
 * Initialize all enterprise systems
 */
async function initializeEnterpriseCore(options = {}) {
    const { getLogger } = await Promise.resolve().then(() => __importStar(require('./logging/enterprise-logger')));
    const { GlobalErrorHandler } = await Promise.resolve().then(() => __importStar(require('./errors/enterprise-errors')));
    const { SecretManager } = await Promise.resolve().then(() => __importStar(require('./security/enterprise-security')));
    const { createConfigManager } = await Promise.resolve().then(() => __importStar(require('./config/enterprise-config')));
    const logger = getLogger();
    // Initialize global error handlers
    GlobalErrorHandler.initialize();
    // Initialize secret manager
    if (options.secretMasterKey) {
        SecretManager.initialize(options.secretMasterKey);
    }
    // Initialize configuration manager
    const configManager = createConfigManager(undefined, {
        configPath: options.configPath,
        hotReload: process.env.NODE_ENV !== 'production'
    });
    await configManager.initialize();
    logger.info('Enterprise core initialized', {
        component: 'EnterpriseCore',
        environment: process.env.NODE_ENV || 'development'
    });
}
