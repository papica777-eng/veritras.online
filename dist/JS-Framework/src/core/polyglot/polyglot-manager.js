"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * POLYGLOT INTEGRATION SYSTEM
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Multi-Language Integration for Maximum Performance & Stability:
 * - Rust: Performance-critical operations, memory safety
 * - Go: Concurrent processing, microservices
 * - C++: Legacy system integration, low-level operations
 * - Python: Data science, ML models
 *
 * Features:
 * - FFI (Foreign Function Interface) bridges
 * - Type-safe communication
 * - Error handling across language boundaries
 * - Performance monitoring
 * - Automatic fallback to TypeScript implementation
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
exports.PolyglotModuleManager = exports.SupportedLanguage = void 0;
exports.getPolyglotManager = getPolyglotManager;
const enterprise_logger_1 = require("../logging/enterprise-logger");
const enterprise_errors_1 = require("../errors/enterprise-errors");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const child_process_1 = require("child_process");
const logger = (0, enterprise_logger_1.getLogger)();
/**
 * Supported languages for integration
 */
var SupportedLanguage;
(function (SupportedLanguage) {
    SupportedLanguage["RUST"] = "rust";
    SupportedLanguage["GO"] = "go";
    SupportedLanguage["CPP"] = "cpp";
    SupportedLanguage["PYTHON"] = "python";
    SupportedLanguage["TYPESCRIPT"] = "typescript";
})(SupportedLanguage || (exports.SupportedLanguage = SupportedLanguage = {}));
/**
 * Polyglot Module Manager
 *
 * Manages integration with modules written in different languages
 */
class PolyglotModuleManager {
    modules = new Map();
    initialized = false;
    /**
     * Initialize the polyglot system
     */
    async initialize() {
        logger.info('Initializing Polyglot Module Manager', {
            component: 'PolyglotManager'
        });
        // Discover available modules
        await this.discoverModules();
        this.initialized = true;
        logger.info('Polyglot Module Manager initialized', {
            component: 'PolyglotManager',
            moduleCount: this.modules.size
        });
    }
    /**
     * Discover available polyglot modules
     */
    async discoverModules() {
        const modulesPath = path.join(process.cwd(), 'polyglot-modules');
        if (!fs.existsSync(modulesPath)) {
            logger.warn('Polyglot modules directory not found', {
                component: 'PolyglotManager',
                path: modulesPath
            });
            return;
        }
        // Scan for module manifests
        const manifestFiles = this.findManifests(modulesPath);
        for (const manifestPath of manifestFiles) {
            try {
                const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
                const module = await this.loadModule(manifest);
                this.modules.set(manifest.name, module);
                logger.info('Loaded polyglot module', {
                    component: 'PolyglotManager',
                    module: manifest.name,
                    language: manifest.language
                });
            }
            catch (error) {
                logger.error('Failed to load module', error, {
                    component: 'PolyglotManager',
                    manifest: manifestPath
                });
            }
        }
    }
    findManifests(dir) {
        const manifests = [];
        if (!fs.existsSync(dir)) {
            return manifests;
        }
        const files = fs.readdirSync(dir, { withFileTypes: true });
        for (const file of files) {
            const filePath = path.join(dir, file.name);
            if (file.isDirectory()) {
                manifests.push(...this.findManifests(filePath));
            }
            else if (file.name === 'module.json') {
                manifests.push(filePath);
            }
        }
        return manifests;
    }
    /**
     * Load a polyglot module
     */
    async loadModule(metadata) {
        switch (metadata.language) {
            case SupportedLanguage.RUST:
                return new RustModule(metadata);
            case SupportedLanguage.GO:
                return new GoModule(metadata);
            case SupportedLanguage.CPP:
                return new CppModule(metadata);
            case SupportedLanguage.PYTHON:
                return new PythonModule(metadata);
            default:
                throw new Error(`Unsupported language: ${metadata.language}`);
        }
    }
    /**
     * Call a method on a polyglot module
     */
    async call(moduleName, method, ...params) {
        const module = this.modules.get(moduleName);
        if (!module) {
            throw new enterprise_errors_1.ServiceUnavailableError(`Module not found: ${moduleName}`);
        }
        try {
            return await module.call(method, ...params);
        }
        catch (error) {
            logger.error('Module call failed', error, {
                component: 'PolyglotManager',
                module: moduleName,
                method
            });
            // Try fallback if available
            if (module.metadata.fallback) {
                logger.warn('Attempting fallback implementation', {
                    component: 'PolyglotManager',
                    module: moduleName,
                    fallback: module.metadata.fallback
                });
                return await this.callFallback(module.metadata.fallback, method, ...params);
            }
            throw error;
        }
    }
    /**
     * Call TypeScript fallback implementation
     */
    async callFallback(fallbackPath, method, ...params) {
        // Resolve fallback path relative to polyglot-modules directory if it's a relative path
        let resolvedPath = fallbackPath;
        if (fallbackPath.startsWith('./')) {
            // Fallback path is relative to module directory
            // The module.json is in polyglot-modules/<module-name>/
            // So ./fallback/crypto-fallback.ts becomes polyglot-modules/<module-name>/fallback/crypto-fallback.ts
            // We need to find which module this fallback belongs to by searching
            for (const [, module] of this.modules.entries()) {
                if (module.metadata.fallback === fallbackPath) {
                    resolvedPath = path.join(process.cwd(), 'polyglot-modules', module.metadata.name, fallbackPath.substring(2) // Remove './'
                    );
                    break;
                }
            }
        }
        logger.debug('Loading fallback module', {
            component: 'PolyglotManager',
            originalPath: fallbackPath,
            resolvedPath
        });
        const fallbackModule = await Promise.resolve(`${resolvedPath}`).then(s => __importStar(require(s)));
        if (typeof fallbackModule[method] !== 'function') {
            throw new Error(`Fallback method not found: ${method}`);
        }
        return await fallbackModule[method](...params);
    }
    /**
     * Get module health status
     */
    async getModuleHealth(moduleName) {
        const module = this.modules.get(moduleName);
        if (!module) {
            return { healthy: false, language: 'unknown', version: 'unknown' };
        }
        const healthy = await module.healthCheck();
        return {
            healthy,
            language: module.metadata.language,
            version: module.metadata.version
        };
    }
    /**
     * Reload a module (hot-reload support)
     */
    async reloadModule(moduleName) {
        const module = this.modules.get(moduleName);
        if (!module) {
            throw new Error(`Module not found: ${moduleName}`);
        }
        logger.info('Reloading module', {
            component: 'PolyglotManager',
            module: moduleName
        });
        await module.shutdown();
        // Reload module
        const manifestPath = path.join(process.cwd(), 'polyglot-modules', moduleName, 'module.json');
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        const newModule = await this.loadModule(manifest);
        this.modules.set(moduleName, newModule);
        logger.info('Module reloaded successfully', {
            component: 'PolyglotManager',
            module: moduleName
        });
    }
    /**
     * Shutdown all modules
     */
    async shutdown() {
        logger.info('Shutting down Polyglot Module Manager', {
            component: 'PolyglotManager'
        });
        for (const [name, module] of this.modules.entries()) {
            try {
                await module.shutdown();
                logger.info('Module shutdown', {
                    component: 'PolyglotManager',
                    module: name
                });
            }
            catch (error) {
                logger.error('Error shutting down module', error, {
                    component: 'PolyglotManager',
                    module: name
                });
            }
        }
        this.modules.clear();
        this.initialized = false;
    }
}
exports.PolyglotModuleManager = PolyglotModuleManager;
/**
 * Base class for polyglot modules
 */
class PolyglotModule {
    metadata;
    process;
    requestQueue = new Map();
    constructor(metadata) {
        this.metadata = metadata;
    }
    /**
     * Call a method on the module
     */
    async call(method, ...params) {
        const message = {
            id: this.generateId(),
            method,
            params,
            timestamp: Date.now()
        };
        return new Promise((resolve, reject) => {
            // Set timeout
            const timeout = setTimeout(() => {
                this.requestQueue.delete(message.id);
                reject(new Error(`Timeout calling ${method} on ${this.metadata.name}`));
            }, 30000); // 30 second timeout
            this.requestQueue.set(message.id, { resolve, reject, timeout });
            // Send message to module
            this.sendMessage(message);
        });
    }
    /**
     * Handle response from module
     */
    handleResponse(response) {
        const request = this.requestQueue.get(response.id);
        if (!request) {
            logger.warn('Received response for unknown request', {
                component: 'PolyglotModule',
                module: this.metadata.name,
                requestId: response.id
            });
            return;
        }
        clearTimeout(request.timeout);
        this.requestQueue.delete(response.id);
        if (response.error) {
            request.reject(new Error(response.error.message));
        }
        else {
            request.resolve(response.result);
        }
        logger.debug('Module call completed', {
            component: 'PolyglotModule',
            module: this.metadata.name,
            executionTime: response.executionTime
        });
    }
    /**
     * Health check
     */
    async healthCheck() {
        try {
            await this.call('__health__');
            return true;
        }
        catch {
            return false;
        }
    }
    /**
     * Shutdown module
     */
    async shutdown() {
        if (this.process) {
            this.process.kill();
            this.process = undefined;
        }
        // Reject all pending requests
        for (const [id, request] of this.requestQueue.entries()) {
            clearTimeout(request.timeout);
            request.reject(new Error('Module shutdown'));
        }
        this.requestQueue.clear();
    }
    generateId() {
        return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    }
}
/**
 * Rust module implementation
 */
class RustModule extends PolyglotModule {
    processInitialized = false;
    initError;
    constructor(metadata) {
        super(metadata);
        this.initializeProcess();
    }
    initializeProcess() {
        // Check if binary exists before attempting to spawn
        const binaryPath = path.isAbsolute(this.metadata.path)
            ? this.metadata.path
            : path.join(process.cwd(), 'polyglot-modules', this.metadata.name, this.metadata.path.replace('./', ''));
        if (!fs.existsSync(binaryPath)) {
            this.initError = new Error(`Rust binary not found at ${binaryPath}. Use TypeScript fallback or compile with: cd polyglot-modules/${this.metadata.name} && cargo build --release`);
            logger.warn('Rust binary not found, fallback will be used', {
                component: 'RustModule',
                module: this.metadata.name,
                binaryPath,
                fallback: this.metadata.fallback
            });
            return;
        }
        try {
            // Start Rust process
            this.process = (0, child_process_1.spawn)(binaryPath, [], {
                stdio: ['pipe', 'pipe', 'pipe', 'ipc']
            });
            // Handle messages from Rust
            this.process.on('message', (message) => {
                this.handleResponse(message);
            });
            this.process.on('error', (error) => {
                this.initError = error;
                logger.error('Rust module process error', error, {
                    component: 'RustModule',
                    module: this.metadata.name
                });
            });
            this.process.on('exit', (code) => {
                if (code !== 0) {
                    logger.warn('Rust module process exited', {
                        component: 'RustModule',
                        module: this.metadata.name,
                        exitCode: code
                    });
                }
                this.processInitialized = false;
            });
            this.processInitialized = true;
            logger.info('Rust module process started', {
                component: 'RustModule',
                module: this.metadata.name,
                pid: this.process.pid
            });
        }
        catch (error) {
            this.initError = error;
            logger.warn('Failed to start Rust module, fallback will be used', {
                component: 'RustModule',
                module: this.metadata.name,
                error: error.message
            });
        }
    }
    sendMessage(message) {
        if (!this.processInitialized || !this.process) {
            // Throw error to trigger fallback in PolyglotModuleManager
            throw this.initError || new Error('Rust module process not initialized - binary may not be compiled');
        }
        this.process.send(message);
    }
}
/**
 * Go module implementation
 */
class GoModule extends PolyglotModule {
    constructor(metadata) {
        super(metadata);
        this.initializeProcess();
    }
    initializeProcess() {
        this.process = (0, child_process_1.spawn)(this.metadata.path, [], {
            stdio: ['pipe', 'pipe', 'pipe', 'ipc']
        });
        this.process.on('message', (message) => {
            this.handleResponse(message);
        });
        logger.info('Go module process started', {
            component: 'GoModule',
            module: this.metadata.name,
            pid: this.process.pid
        });
    }
    sendMessage(message) {
        if (!this.process) {
            throw new Error('Go module process not initialized');
        }
        this.process.send(message);
    }
}
/**
 * C++ module implementation
 */
class CppModule extends PolyglotModule {
    nativeAddon;
    constructor(metadata) {
        super(metadata);
        this.loadNativeAddon();
    }
    loadNativeAddon() {
        try {
            // Load N-API addon
            this.nativeAddon = require(this.metadata.path);
            logger.info('C++ module loaded', {
                component: 'CppModule',
                module: this.metadata.name
            });
        }
        catch (error) {
            logger.error('Failed to load C++ module', error, {
                component: 'CppModule',
                module: this.metadata.name
            });
            throw error;
        }
    }
    sendMessage(message) {
        // For N-API, call method directly
        const startTime = Date.now();
        try {
            const result = this.nativeAddon[message.method](...message.params);
            const response = {
                id: message.id,
                result,
                timestamp: Date.now(),
                executionTime: Date.now() - startTime
            };
            this.handleResponse(response);
        }
        catch (error) {
            const response = {
                id: message.id,
                error: {
                    code: 'CPP_ERROR',
                    message: error.message
                },
                timestamp: Date.now(),
                executionTime: Date.now() - startTime
            };
            this.handleResponse(response);
        }
    }
}
/**
 * Python module implementation
 */
class PythonModule extends PolyglotModule {
    constructor(metadata) {
        super(metadata);
        this.initializeProcess();
    }
    initializeProcess() {
        this.process = (0, child_process_1.spawn)('python3', [this.metadata.path], {
            stdio: ['pipe', 'pipe', 'pipe']
        });
        // Parse JSON responses from stdout
        let buffer = '';
        this.process.stdout?.on('data', (data) => {
            buffer += data.toString();
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';
            for (const line of lines) {
                if (line.trim()) {
                    try {
                        const response = JSON.parse(line);
                        this.handleResponse(response);
                    }
                    catch (error) {
                        logger.error('Failed to parse Python response', error, {
                            component: 'PythonModule',
                            line
                        });
                    }
                }
            }
        });
        logger.info('Python module process started', {
            component: 'PythonModule',
            module: this.metadata.name,
            pid: this.process.pid
        });
    }
    sendMessage(message) {
        if (!this.process?.stdin) {
            throw new Error('Python module process not initialized');
        }
        this.process.stdin.write(JSON.stringify(message) + '\n');
    }
}
/**
 * Global polyglot manager instance
 */
let globalPolyglotManager = null;
function getPolyglotManager() {
    if (!globalPolyglotManager) {
        globalPolyglotManager = new PolyglotModuleManager();
    }
    return globalPolyglotManager;
}
