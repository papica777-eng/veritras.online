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
 * For licensing inquiries: dimitar.papazov@QAntum.dev
 * ═══════════════════════════════════════════════════════════════════════════════
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
exports.SandboxExecutor = void 0;
const vm = __importStar(require("node:vm"));
const node_events_1 = require("node:events");
/**
 * Default security policy - maximum restrictions
 */
const DEFAULT_SECURITY_POLICY = {
    allowFileSystem: false,
    allowedPaths: [],
    allowNetwork: false,
    allowedHosts: [],
    allowProcess: false,
    maxExecutionTime: 5000,
    maxMemory: 128 * 1024 * 1024, // 128MB
    allowEval: false,
    allowRequire: false,
    allowedModules: []
};
/**
 * Sandboxed Mutation Executor
 *
 * Provides a secure execution environment for testing mutations
 * before they are applied to the live system.
 */
class SandboxExecutor extends node_events_1.EventEmitter {
    config;
    violations = [];
    executionCount = 0;
    blockedCount = 0;
    startTime = Date.now();
    constructor(config = {}) {
        super();
        this.config = {
            enabled: config.enabled ?? true,
            defaultPolicy: { ...DEFAULT_SECURITY_POLICY, ...config.defaultPolicy },
            logViolations: config.logViolations ?? true,
            onViolation: config.onViolation ?? this.defaultViolationHandler.bind(this)
        };
    }
    /**
     * Execute code in a sandboxed environment
     * @param code - Code to execute
     * @param context - Optional context variables
     * @param policy - Optional security policy override
     */
    async execute(code, context = {}, policy = {}) {
        const startTime = Date.now();
        const mergedPolicy = { ...this.config.defaultPolicy, ...policy };
        const localViolations = [];
        this.executionCount++;
        try {
            // Create sandbox with security restrictions
            const sandbox = this.createSandbox(mergedPolicy, localViolations);
            // Add user context
            Object.assign(sandbox, context);
            // Create VM context
            const vmContext = vm.createContext(sandbox);
            // Compile the script (filename for stack traces)
            const script = new vm.Script(code, {
                filename: 'sandbox-script.js'
            });
            // Run with timeout
            const result = script.runInContext(vmContext, {
                timeout: mergedPolicy.maxExecutionTime
            });
            const executionTime = Date.now() - startTime;
            const memoryUsed = this.estimateMemoryUsage(result);
            // Check memory limit
            if (memoryUsed > mergedPolicy.maxMemory) {
                const violation = this.createViolation('memory', 'Memory limit exceeded', `Used: ${memoryUsed}, Limit: ${mergedPolicy.maxMemory}`);
                localViolations.push(violation);
                this.handleViolation(violation);
            }
            return {
                success: localViolations.length === 0,
                result,
                executionTime,
                memoryUsed,
                violations: localViolations
            };
        }
        catch (error) {
            const executionTime = Date.now() - startTime;
            const err = error;
            // Check if it's a timeout
            if (err.message?.includes('timed out') || err.message?.includes('timeout')) {
                const violation = this.createViolation('timeout', 'Execution timeout', `Exceeded ${mergedPolicy.maxExecutionTime}ms`);
                localViolations.push(violation);
                this.handleViolation(violation);
            }
            return {
                success: false,
                executionTime,
                memoryUsed: 0,
                violations: localViolations,
                error: err.message,
                stackTrace: err.stack
            };
        }
    }
    /**
     * Execute mutation code and validate safety
     * @param mutationId - Unique mutation identifier
     * @param mutationCode - Mutation code to test
     * @param testContext - Test context for validation
     */
    async validateMutation(mutationId, mutationCode, testContext = {}) {
        // Use strict policy for mutation validation
        const strictPolicy = {
            allowFileSystem: false,
            allowNetwork: false,
            allowProcess: false,
            allowEval: false,
            allowRequire: false,
            maxExecutionTime: 3000,
            maxMemory: 64 * 1024 * 1024 // 64MB for mutations
        };
        const sandboxResult = await this.execute(mutationCode, testContext, strictPolicy);
        // Determine if mutation is malicious
        const isMalicious = sandboxResult.violations.some(v => v.type === 'process' ||
            v.type === 'filesystem' ||
            v.type === 'network');
        // Determine if mutation is unstable
        const isUnstable = sandboxResult.violations.some(v => v.type === 'timeout' ||
            v.type === 'memory') || !!sandboxResult.error;
        // Determine recommendation
        let recommendation;
        if (isMalicious) {
            recommendation = 'reject';
            this.blockedCount++;
        }
        else if (isUnstable) {
            recommendation = 'review';
        }
        else if (sandboxResult.success) {
            recommendation = 'apply';
        }
        else {
            recommendation = 'review';
        }
        return {
            mutationId,
            isSafe: !isMalicious && !isUnstable && sandboxResult.success,
            isMalicious,
            isUnstable,
            sandboxResult,
            validatedAt: new Date(),
            recommendation
        };
    }
    /**
     * Create sandbox object with security traps
     */
    createSandbox(policy, violations) {
        const self = this;
        // Safe global objects
        const sandbox = {
            // Math operations
            Math,
            // JSON operations
            JSON,
            // Date (read-only)
            Date,
            // Safe array methods
            Array,
            // Object operations
            Object,
            // String operations
            String,
            // Number operations
            Number,
            // Boolean
            Boolean,
            // Promise (for async operations)
            Promise,
            // Console proxy
            console: {
                log: (..._args) => { },
                warn: (..._args) => { },
                error: (..._args) => { },
                info: (..._args) => { }
            },
            // setTimeout/setInterval (limited)
            setTimeout: (fn, ms) => {
                if (ms > policy.maxExecutionTime) {
                    const violation = self.createViolation('timeout', 'setTimeout exceeds limit', `Requested: ${ms}ms`);
                    violations.push(violation);
                    self.handleViolation(violation);
                    return -1;
                }
                return setTimeout(fn, Math.min(ms, policy.maxExecutionTime));
            },
            clearTimeout,
            // Map, Set
            Map,
            Set,
            // Symbol
            Symbol,
            // Reflect (limited)
            Reflect: {
                get: Reflect.get,
                set: Reflect.set,
                has: Reflect.has,
                ownKeys: Reflect.ownKeys
            }
        };
        // Block dangerous globals
        sandbox.eval = undefined;
        sandbox.Function = undefined;
        sandbox.require = undefined;
        sandbox.module = undefined;
        sandbox.exports = undefined;
        sandbox.__dirname = undefined;
        sandbox.__filename = undefined;
        // Block process access
        sandbox.process = new Proxy({}, {
            get: (_target, prop) => {
                const violation = self.createViolation('process', 'Process access blocked', `Attempted to access process.${String(prop)}`);
                violations.push(violation);
                self.handleViolation(violation);
                return undefined;
            }
        });
        // Block fs access (if not allowed)
        if (!policy.allowFileSystem) {
            sandbox.fs = new Proxy({}, {
                get: (_target, prop) => {
                    const violation = self.createViolation('filesystem', 'Filesystem access blocked', `Attempted to access fs.${String(prop)}`);
                    violations.push(violation);
                    self.handleViolation(violation);
                    return undefined;
                }
            });
        }
        // Block network access (if not allowed)
        if (!policy.allowNetwork) {
            sandbox.fetch = () => {
                const violation = self.createViolation('network', 'Network access blocked', 'Attempted fetch()');
                violations.push(violation);
                self.handleViolation(violation);
                // Return rejected promise that's immediately caught
                return Promise.reject(new Error('Network access is blocked')).catch(() => undefined);
            };
            sandbox.XMLHttpRequest = function () {
                const violation = self.createViolation('network', 'Network access blocked', 'Attempted XMLHttpRequest');
                violations.push(violation);
                self.handleViolation(violation);
                throw new Error('Network access is blocked');
            };
        }
        return sandbox;
    }
    /**
     * Create a security violation record
     */
    createViolation(type, operation, details) {
        return {
            type,
            operation,
            details,
            timestamp: new Date(),
            blocked: true
        };
    }
    /**
     * Handle a security violation
     */
    handleViolation(violation) {
        this.violations.push(violation);
        this.blockedCount++;
        if (this.config.logViolations) {
            console.warn(`[SANDBOX VIOLATION] ${violation.type}: ${violation.operation}`);
        }
        this.config.onViolation(violation);
        this.emit('violation', violation);
    }
    /**
     * Default violation handler
     */
    defaultViolationHandler(_violation) {
        // Default: just log
    }
    /**
     * Estimate memory usage of a result
     */
    estimateMemoryUsage(result) {
        try {
            const str = JSON.stringify(result);
            return str ? str.length * 2 : 0; // UTF-16 estimate
        }
        catch {
            return 0;
        }
    }
    /**
     * Get all recorded violations
     */
    getViolations() {
        return [...this.violations];
    }
    /**
     * Get executor statistics
     */
    getStats() {
        return {
            executionCount: this.executionCount,
            blockedCount: this.blockedCount,
            violationCount: this.violations.length,
            uptime: Date.now() - this.startTime
        };
    }
    /**
     * Clear violation history
     */
    clearViolations() {
        this.violations = [];
    }
    /**
     * Check if sandbox is enabled
     */
    isEnabled() {
        return this.config.enabled;
    }
}
exports.SandboxExecutor = SandboxExecutor;
exports.default = SandboxExecutor;
