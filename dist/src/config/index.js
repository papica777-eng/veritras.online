"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                               ║
 * ║   QAntum CONFIGURATION MODULE                                                 ║
 * ║   "Unified configuration management"                                          ║
 * ║                                                                               ║
 * ║   TODO B #43 - Configuration Management                                       ║
 * ║                                                                               ║
 * ║   © 2025-2026 QAntum | Dimitar Prodromov                                        ║
 * ║                                                                               ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
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
exports.config = exports.getQAntumConfig = exports.QAntumConfiguration = exports.QAntum_CONFIG_SCHEMA = exports.s = exports.SchemaBuilder = exports.SchemaValidator = exports.deepMerge = exports.TOML_FORMAT = exports.ENV_FORMAT = exports.YAML_FORMAT = exports.JSON_FORMAT = exports.RemoteSource = exports.ObjectSource = exports.FileSource = exports.EnvSource = exports.ConfigLoader = void 0;
// ═══════════════════════════════════════════════════════════════════════════════
// RE-EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════
var loader_1 = require("./loader");
Object.defineProperty(exports, "ConfigLoader", { enumerable: true, get: function () { return loader_1.ConfigLoader; } });
Object.defineProperty(exports, "EnvSource", { enumerable: true, get: function () { return loader_1.EnvSource; } });
Object.defineProperty(exports, "FileSource", { enumerable: true, get: function () { return loader_1.FileSource; } });
Object.defineProperty(exports, "ObjectSource", { enumerable: true, get: function () { return loader_1.ObjectSource; } });
Object.defineProperty(exports, "RemoteSource", { enumerable: true, get: function () { return loader_1.RemoteSource; } });
Object.defineProperty(exports, "JSON_FORMAT", { enumerable: true, get: function () { return loader_1.JSON_FORMAT; } });
Object.defineProperty(exports, "YAML_FORMAT", { enumerable: true, get: function () { return loader_1.YAML_FORMAT; } });
Object.defineProperty(exports, "ENV_FORMAT", { enumerable: true, get: function () { return loader_1.ENV_FORMAT; } });
Object.defineProperty(exports, "TOML_FORMAT", { enumerable: true, get: function () { return loader_1.TOML_FORMAT; } });
Object.defineProperty(exports, "deepMerge", { enumerable: true, get: function () { return loader_1.deepMerge; } });
var schema_1 = require("./schema");
Object.defineProperty(exports, "SchemaValidator", { enumerable: true, get: function () { return schema_1.SchemaValidator; } });
Object.defineProperty(exports, "SchemaBuilder", { enumerable: true, get: function () { return schema_1.SchemaBuilder; } });
Object.defineProperty(exports, "s", { enumerable: true, get: function () { return schema_1.s; } });
// ═══════════════════════════════════════════════════════════════════════════════
// IMPORTS
// ═══════════════════════════════════════════════════════════════════════════════
const path = __importStar(require("path"));
const loader_2 = require("./loader");
const schema_2 = require("./schema");
// ═══════════════════════════════════════════════════════════════════════════════
// QAntum CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * QAntum default configuration schema
 */
exports.QAntum_CONFIG_SCHEMA = {
    // Test runner settings
    'runner.timeout': schema_2.s.number().default(30000).description('Test timeout in ms').build(),
    'runner.retries': schema_2.s.number().default(0).min(0).description('Number of retries').build(),
    'runner.parallel': schema_2.s.boolean().default(true).description('Run tests in parallel').build(),
    'runner.maxWorkers': schema_2.s.number().default(4).min(1).env('QAntum_MAX_WORKERS').build(),
    'runner.bail': schema_2.s.boolean().default(false).description('Stop on first failure').build(),
    // Reporter settings
    'reporter.format': schema_2.s.string().enum('console', 'json', 'html', 'junit').default('console').build(),
    'reporter.outputDir': schema_2.s.string().default('./reports').format('path').build(),
    'reporter.verbose': schema_2.s.boolean().default(false).env('QAntum_VERBOSE').build(),
    // Coverage settings
    'coverage.enabled': schema_2.s.boolean().default(false).build(),
    'coverage.threshold': schema_2.s
        .object({
        lines: schema_2.s.number().default(80).min(0).max(100).build(),
        branches: schema_2.s.number().default(80).min(0).max(100).build(),
        functions: schema_2.s.number().default(80).min(0).max(100).build(),
        statements: schema_2.s.number().default(80).min(0).max(100).build(),
    })
        .build(),
    'coverage.include': schema_2.s.array(schema_2.s.string().build()).default(['src/**/*.ts']).build(),
    'coverage.exclude': schema_2.s.array(schema_2.s.string().build()).default(['**/*.test.ts', '**/*.spec.ts']).build(),
    // Browser settings
    'browser.headless': schema_2.s.boolean().default(true).env('QAntum_HEADLESS').build(),
    'browser.viewport': schema_2.s
        .object({
        width: schema_2.s.number().default(1920).build(),
        height: schema_2.s.number().default(1080).build(),
    })
        .build(),
    'browser.timeout': schema_2.s.number().default(30000).build(),
    'browser.screenshots': schema_2.s.boolean().default(true).build(),
    // API settings
    'api.baseUrl': schema_2.s.string().format('url').env('QAntum_API_URL').build(),
    'api.timeout': schema_2.s.number().default(30000).build(),
    'api.retries': schema_2.s.number().default(3).build(),
    // Database settings
    'database.connectionString': schema_2.s.string().env('DATABASE_URL').build(),
    'database.poolSize': schema_2.s.number().default(10).min(1).build(),
    // Security settings
    'security.scanEnabled': schema_2.s.boolean().default(false).build(),
    'security.vulnerabilityThreshold': schema_2.s
        .string()
        .enum('low', 'medium', 'high', 'critical')
        .default('medium')
        .build(),
    // Performance settings
    'performance.metricsEnabled': schema_2.s.boolean().default(true).build(),
    'performance.thresholds': schema_2.s
        .object({
        fcp: schema_2.s.number().default(1500).description('First Contentful Paint (ms)').build(),
        lcp: schema_2.s.number().default(2500).description('Largest Contentful Paint (ms)').build(),
        cls: schema_2.s.number().default(0.1).description('Cumulative Layout Shift').build(),
        ttfb: schema_2.s.number().default(800).description('Time to First Byte (ms)').build(),
    })
        .build(),
};
/**
 * Unified QAntum Configuration Manager
 */
class QAntumConfiguration {
    static instance;
    loader;
    validator;
    config = null;
    constructor() {
        this.loader = new loader_2.ConfigLoader({
            defaults: this.getDefaultConfig(),
            mergeStrategy: 'deep',
        });
        this.validator = new schema_2.SchemaValidator(exports.QAntum_CONFIG_SCHEMA);
    }
    static getInstance() {
        if (!QAntumConfiguration.instance) {
            QAntumConfiguration.instance = new QAntumConfiguration();
        }
        return QAntumConfiguration.instance;
    }
    /**
     * Initialize with automatic detection
     */
    // Complexity: O(N) — loop
    async init(basePath = process.cwd()) {
        // Add common config file locations
        const configFiles = [
            'QAntum.config.json',
            'QAntum.config.yaml',
            'QAntum.config.yml',
            'QAntum.config.toml',
            '.QAntumrc',
            '.QAntumrc.json',
            '.QAntumrc.yaml',
        ];
        for (const file of configFiles) {
            this.loader.addFile(path.join(basePath, file), 50);
        }
        // Add environment variables
        this.loader.addEnv('QAntum_', 100);
        // Load and validate
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.loader.load();
        const raw = this.loader.getAll();
        const result = this.validator.validate(raw);
        if (!result.valid) {
            console.warn('Configuration warnings:', result.errors);
        }
        this.config = this.flatToNested(result.config);
        return this.config;
    }
    /**
     * Initialize from specific file
     */
    // Complexity: O(1)
    async initFromFile(filePath) {
        this.loader.addFile(filePath, 50);
        this.loader.addEnv('QAntum_', 100);
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.loader.load();
        const raw = this.loader.getAll();
        const result = this.validator.validateOrThrow(raw);
        this.config = this.flatToNested(result);
        return this.config;
    }
    /**
     * Initialize with object
     */
    // Complexity: O(1)
    initWithConfig(config) {
        const merged = (0, loader_2.deepMerge)(this.getDefaultConfig(), config);
        this.config = merged;
        return this.config;
    }
    // Complexity: O(N) — loop
    get(key) {
        if (!this.config) {
            this.config = this.getDefaultConfig();
        }
        const parts = key.split('.');
        let current = this.config;
        for (const part of parts) {
            if (current === undefined)
                return undefined;
            current = current[part];
        }
        return current;
    }
    // Complexity: O(N) — loop
    set(key, value) {
        if (!this.config) {
            this.config = this.getDefaultConfig();
        }
        const parts = key.split('.');
        let current = this.config;
        for (let i = 0; i < parts.length - 1; i++) {
            current[parts[i]] = current[parts[i]] || {};
            current = current[parts[i]];
        }
        current[parts[parts.length - 1]] = value;
    }
    /**
     * Get all config
     */
    // Complexity: O(1)
    getAll() {
        if (!this.config) {
            this.config = this.getDefaultConfig();
        }
        return { ...this.config };
    }
    /**
     * Reset to defaults
     */
    // Complexity: O(1)
    reset() {
        this.config = this.getDefaultConfig();
    }
    /**
     * Get default configuration
     */
    // Complexity: O(1)
    getDefaultConfig() {
        return {
            runner: {
                timeout: 30000,
                retries: 0,
                parallel: true,
                maxWorkers: 4,
                bail: false,
            },
            reporter: {
                format: 'console',
                outputDir: './reports',
                verbose: false,
            },
            coverage: {
                enabled: false,
                threshold: {
                    lines: 80,
                    branches: 80,
                    functions: 80,
                    statements: 80,
                },
                include: ['src/**/*.ts'],
                exclude: ['**/*.test.ts', '**/*.spec.ts'],
            },
            browser: {
                headless: true,
                viewport: { width: 1920, height: 1080 },
                timeout: 30000,
                screenshots: true,
            },
            api: {
                timeout: 30000,
                retries: 3,
            },
            database: {
                poolSize: 10,
            },
            security: {
                scanEnabled: false,
                vulnerabilityThreshold: 'medium',
            },
            performance: {
                metricsEnabled: true,
                thresholds: {
                    fcp: 1500,
                    lcp: 2500,
                    cls: 0.1,
                    ttfb: 800,
                },
            },
        };
    }
    /**
     * Convert flat keys to nested object
     */
    // Complexity: O(N*M) — nested iteration
    flatToNested(flat) {
        const result = {};
        for (const [key, value] of Object.entries(flat)) {
            const parts = key.split('.');
            let current = result;
            for (let i = 0; i < parts.length - 1; i++) {
                current[parts[i]] = current[parts[i]] || {};
                current = current[parts[i]];
            }
            current[parts[parts.length - 1]] = value;
        }
        return (0, loader_2.deepMerge)(this.getDefaultConfig(), result);
    }
}
exports.QAntumConfiguration = QAntumConfiguration;
// ═══════════════════════════════════════════════════════════════════════════════
// SINGLETON & HELPERS
// ═══════════════════════════════════════════════════════════════════════════════
const getQAntumConfig = () => QAntumConfiguration.getInstance();
exports.getQAntumConfig = getQAntumConfig;
exports.config = QAntumConfiguration.getInstance();
exports.default = QAntumConfiguration;
