"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ENTERPRISE CONFIGURATION MANAGEMENT
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * God Mode Configuration with:
 * - Environment-based configuration
 * - Schema validation on startup
 * - Type-safe configuration access
 * - Hot-reload capability
 * - Configuration change auditing
 * - Secret management integration
 * - Configuration versioning
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
exports.QAntumConfigSchema = exports.EnterpriseConfigManager = void 0;
exports.createConfigManager = createConfigManager;
exports.getConfigManager = getConfigManager;
const fs = __importStar(require("fs"));
const enterprise_logger_1 = require("../logging/enterprise-logger");
const enterprise_errors_1 = require("../errors/enterprise-errors");
const enterprise_security_1 = require("../security/enterprise-security");
const logger = (0, enterprise_logger_1.getLogger)();
/**
 * Enterprise Configuration Manager
 */
class EnterpriseConfigManager {
    config = new Map();
    schema;
    watchers = new Set();
    configPath;
    hotReload;
    fileWatcher;
    constructor(schema, options = {}) {
        this.schema = schema;
        this.configPath = options.configPath;
        this.hotReload = options.hotReload ?? false;
    }
    /**
     * Initialize configuration
     */
    async initialize() {
        logger.info('Initializing enterprise configuration', {
            component: 'ConfigManager'
        });
        // Load configuration from environment
        this.loadFromEnvironment();
        // Load configuration from file if provided
        if (this.configPath) {
            await this.loadFromFile(this.configPath);
        }
        // Validate configuration against schema
        this.validate();
        // Set up hot reload if enabled
        if (this.hotReload && this.configPath) {
            this.setupHotReload();
        }
        logger.info('Enterprise configuration initialized', {
            component: 'ConfigManager',
            keys: Array.from(this.config.keys()).length
        });
    }
    /**
     * Load configuration from environment variables
     */
    loadFromEnvironment() {
        for (const [key, definition] of Object.entries(this.schema)) {
            const envKey = this.toEnvKey(key);
            const envValue = process.env[envKey];
            if (envValue !== undefined) {
                const value = this.parseValue(envValue, definition.type);
                if (definition.secret) {
                    // Store in SecretManager instead of config
                    enterprise_security_1.SecretManager.setSecret(key, envValue);
                }
                else {
                    this.config.set(key, value);
                }
                logger.debug(`Loaded config from environment: ${key}`, {
                    component: 'ConfigManager'
                });
            }
            else if (definition.default !== undefined) {
                this.config.set(key, definition.default);
            }
        }
    }
    /**
     * Load configuration from file
     */
    async loadFromFile(filePath) {
        try {
            if (!fs.existsSync(filePath)) {
                logger.warn(`Configuration file not found: ${filePath}`, {
                    component: 'ConfigManager'
                });
                return;
            }
            const content = fs.readFileSync(filePath, 'utf8');
            const fileConfig = JSON.parse(content);
            for (const [key, value] of Object.entries(fileConfig)) {
                if (this.schema[key]) {
                    if (this.schema[key].secret) {
                        enterprise_security_1.SecretManager.setSecret(key, String(value));
                    }
                    else {
                        this.config.set(key, value);
                    }
                }
            }
            logger.info(`Configuration loaded from file: ${filePath}`, {
                component: 'ConfigManager'
            });
        }
        catch (error) {
            logger.error('Failed to load configuration file', error, {
                component: 'ConfigManager',
                filePath
            });
        }
    }
    /**
     * Validate configuration against schema
     */
    validate() {
        const errors = [];
        for (const [key, definition] of Object.entries(this.schema)) {
            const value = definition.secret
                ? enterprise_security_1.SecretManager.getSecret(key)
                : this.config.get(key);
            // Check required fields
            if (definition.required && value === undefined) {
                errors.push(`Required configuration key '${key}' is missing`);
                continue;
            }
            if (value === undefined) {
                continue;
            }
            // Validate type
            if (!this.validateType(value, definition.type)) {
                errors.push(`Configuration key '${key}' has invalid type. Expected ${definition.type}`);
            }
            // Custom validator
            if (definition.validator && !definition.validator(value)) {
                errors.push(`Configuration key '${key}' failed custom validation`);
            }
        }
        if (errors.length > 0) {
            const errorMessage = `Configuration validation failed:\n${errors.join('\n')}`;
            logger.error(errorMessage, undefined, { component: 'ConfigManager' });
            throw new enterprise_errors_1.ConfigurationError(errorMessage);
        }
        logger.info('Configuration validation passed', {
            component: 'ConfigManager'
        });
    }
    /**
     * Get configuration value
     */
    get(key, defaultValue) {
        const definition = this.schema[key];
        if (!definition) {
            logger.warn(`Accessing unknown configuration key: ${key}`, {
                component: 'ConfigManager'
            });
        }
        const value = definition?.secret
            ? enterprise_security_1.SecretManager.getSecret(key)
            : this.config.get(key);
        return (value ?? defaultValue);
    }
    /**
     * Set configuration value
     */
    set(key, value) {
        const definition = this.schema[key];
        if (!definition) {
            throw new enterprise_errors_1.ConfigurationError(`Cannot set unknown configuration key: ${key}`);
        }
        // Validate value
        if (!this.validateType(value, definition.type)) {
            throw new enterprise_errors_1.ConfigurationError(`Invalid type for key '${key}'. Expected ${definition.type}`);
        }
        if (definition.validator && !definition.validator(value)) {
            throw new enterprise_errors_1.ConfigurationError(`Value for key '${key}' failed validation`);
        }
        // Store value
        if (definition.secret) {
            enterprise_security_1.SecretManager.setSecret(key, String(value));
        }
        else {
            this.config.set(key, value);
        }
        // Notify watchers
        this.notifyWatchers(key, value);
        logger.info(`Configuration updated: ${key}`, {
            component: 'ConfigManager'
        });
    }
    /**
     * Check if configuration key exists
     */
    has(key) {
        const definition = this.schema[key];
        if (definition?.secret) {
            return enterprise_security_1.SecretManager.getSecret(key) !== undefined;
        }
        return this.config.has(key);
    }
    /**
     * Get all configuration keys
     */
    keys() {
        return Array.from(this.config.keys());
    }
    /**
     * Watch for configuration changes
     */
    watch(callback) {
        this.watchers.add(callback);
        // Return unwatch function
        return () => {
            this.watchers.delete(callback);
        };
    }
    /**
     * Set up hot reload for configuration file
     */
    setupHotReload() {
        if (!this.configPath)
            return;
        this.fileWatcher = fs.watch(this.configPath, async (eventType) => {
            if (eventType === 'change') {
                logger.info('Configuration file changed, reloading...', {
                    component: 'ConfigManager'
                });
                try {
                    await this.loadFromFile(this.configPath);
                    this.validate();
                    logger.info('Configuration reloaded successfully', {
                        component: 'ConfigManager'
                    });
                }
                catch (error) {
                    logger.error('Failed to reload configuration', error, {
                        component: 'ConfigManager'
                    });
                }
            }
        });
    }
    /**
     * Notify watchers of configuration changes
     */
    notifyWatchers(key, value) {
        for (const callback of this.watchers) {
            try {
                callback(key, value);
            }
            catch (error) {
                logger.error('Error in configuration watcher', error, {
                    component: 'ConfigManager',
                    key
                });
            }
        }
    }
    /**
     * Parse value from string to appropriate type
     */
    parseValue(value, type) {
        switch (type) {
            case 'number':
                return Number(value);
            case 'boolean':
                return value.toLowerCase() === 'true';
            case 'object':
            case 'array':
                try {
                    return JSON.parse(value);
                }
                catch {
                    return value;
                }
            default:
                return value;
        }
    }
    /**
     * Validate value type
     */
    validateType(value, type) {
        switch (type) {
            case 'string':
                return typeof value === 'string';
            case 'number':
                return typeof value === 'number' && !isNaN(value);
            case 'boolean':
                return typeof value === 'boolean';
            case 'object':
                return typeof value === 'object' && value !== null && !Array.isArray(value);
            case 'array':
                return Array.isArray(value);
            default:
                return false;
        }
    }
    /**
     * Convert config key to environment variable format
     */
    toEnvKey(key) {
        return key
            .replace(/([A-Z])/g, '_$1')
            .toUpperCase()
            .replace(/^_/, '');
    }
    /**
     * Export configuration (excluding secrets)
     */
    exportConfig() {
        const exported = {};
        for (const [key, value] of this.config.entries()) {
            if (!this.schema[key]?.secret) {
                exported[key] = value;
            }
        }
        return exported;
    }
    /**
     * Shutdown and cleanup
     */
    shutdown() {
        if (this.fileWatcher) {
            this.fileWatcher.close();
        }
        this.watchers.clear();
        logger.info('Configuration manager shutdown', {
            component: 'ConfigManager'
        });
    }
}
exports.EnterpriseConfigManager = EnterpriseConfigManager;
/**
 * Default QAntum configuration schema
 */
exports.QAntumConfigSchema = {
    // Environment
    nodeEnv: {
        type: 'string',
        required: true,
        default: 'development',
        validator: (value) => ['development', 'staging', 'production'].includes(value),
        description: 'Application environment'
    },
    // Server
    port: {
        type: 'number',
        required: true,
        default: 3847,
        validator: (value) => value > 0 && value < 65536,
        description: 'Server port'
    },
    host: {
        type: 'string',
        required: true,
        default: 'localhost',
        description: 'Server host'
    },
    // Logging
    logLevel: {
        type: 'string',
        required: true,
        default: 'info',
        validator: (value) => ['debug', 'info', 'warn', 'error', 'fatal'].includes(value),
        description: 'Logging level'
    },
    logFile: {
        type: 'boolean',
        required: false,
        default: false,
        description: 'Enable file logging'
    },
    // Database
    databaseUrl: {
        type: 'string',
        required: false,
        secret: true,
        description: 'Database connection URL'
    },
    // API Keys
    openaiApiKey: {
        type: 'string',
        required: false,
        secret: true,
        description: 'OpenAI API key'
    },
    anthropicApiKey: {
        type: 'string',
        required: false,
        secret: true,
        description: 'Anthropic API key'
    },
    // Security
    jwtSecret: {
        type: 'string',
        required: false,
        secret: true,
        description: 'JWT signing secret'
    },
    encryptionKey: {
        type: 'string',
        required: false,
        secret: true,
        description: 'Data encryption key'
    },
    // Rate Limiting
    rateLimitWindow: {
        type: 'number',
        required: false,
        default: 900000, // 15 minutes
        description: 'Rate limit window in milliseconds'
    },
    rateLimitMax: {
        type: 'number',
        required: false,
        default: 100,
        description: 'Maximum requests per window'
    },
    // Feature Flags
    enableMetrics: {
        type: 'boolean',
        required: false,
        default: true,
        description: 'Enable metrics collection'
    },
    enableAuditLog: {
        type: 'boolean',
        required: false,
        default: true,
        description: 'Enable audit logging'
    },
    enableHotReload: {
        type: 'boolean',
        required: false,
        default: false,
        description: 'Enable configuration hot reload'
    }
};
/**
 * Global configuration manager instance
 */
let globalConfigManager = null;
function createConfigManager(schema = exports.QAntumConfigSchema, options) {
    if (!globalConfigManager) {
        globalConfigManager = new EnterpriseConfigManager(schema, options);
    }
    return globalConfigManager;
}
function getConfigManager() {
    if (!globalConfigManager) {
        globalConfigManager = createConfigManager();
    }
    return globalConfigManager;
}
