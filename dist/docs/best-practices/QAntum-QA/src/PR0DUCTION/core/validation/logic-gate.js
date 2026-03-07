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
exports.AILogicGate = void 0;
const vm = __importStar(require("node:vm"));
const node_events_1 = require("node:events");
const crypto = __importStar(require("node:crypto"));
// ═══════════════════════════════════════════════════════════════════════════════
// DANGEROUS PATTERNS DETECTOR
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * Patterns that indicate potentially dangerous code
 */
const DANGEROUS_PATTERNS = [
    // Dangerous globals
    { pattern: /\beval\s*\(/, name: 'eval', severity: 'critical' },
    { pattern: /\bFunction\s*\(/, name: 'Function constructor', severity: 'critical' },
    { pattern: /\bsetTimeout\s*\(\s*["']/, name: 'setTimeout with string', severity: 'high' },
    { pattern: /\bsetInterval\s*\(\s*["']/, name: 'setInterval with string', severity: 'high' },
    // Prototype pollution
    { pattern: /__proto__/, name: '__proto__ access', severity: 'critical' },
    { pattern: /\bconstructor\s*\[/, name: 'constructor bracket access', severity: 'high' },
    { pattern: /Object\.setPrototypeOf/, name: 'setPrototypeOf', severity: 'high' },
    // Process/System access
    { pattern: /\bprocess\./, name: 'process access', severity: 'critical' },
    { pattern: /\brequire\s*\(/, name: 'require', severity: 'high' },
    { pattern: /\bimport\s*\(/, name: 'dynamic import', severity: 'high' },
    { pattern: /child_process/, name: 'child_process', severity: 'critical' },
    // File system
    { pattern: /\bfs\b/, name: 'fs module', severity: 'high' },
    { pattern: /readFile|writeFile|unlink|rmdir/, name: 'file operations', severity: 'high' },
    // Network
    { pattern: /\bfetch\s*\(/, name: 'fetch', severity: 'medium' },
    { pattern: /XMLHttpRequest/, name: 'XMLHttpRequest', severity: 'medium' },
    { pattern: /WebSocket/, name: 'WebSocket', severity: 'medium' },
    // Infinite loops (heuristic)
    { pattern: /while\s*\(\s*true\s*\)/, name: 'while(true)', severity: 'high' },
    { pattern: /while\s*\(\s*1\s*\)/, name: 'while(1)', severity: 'high' },
    { pattern: /for\s*\(\s*;\s*;\s*\)/, name: 'for(;;)', severity: 'high' },
    // Memory issues
    { pattern: /new Array\s*\(\s*\d{7,}\s*\)/, name: 'huge array allocation', severity: 'high' },
    { pattern: /\.push\s*\([^)]*\)\s*;?\s*\}/, name: 'unbounded push in loop', severity: 'medium' }
];
/**
 * Required safety patterns
 */
const SAFETY_PATTERNS = [
    // Error handling
    { pattern: /try\s*\{/, name: 'try-catch', required: false },
    // Input validation
    { pattern: /typeof|instanceof/, name: 'type checking', required: false }
];
// ═══════════════════════════════════════════════════════════════════════════════
// AI LOGIC GATE
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * 🧪 AI Logic Gate
 *
 * Three-phase validation for AI-generated code:
 * 1. Syntax Validation - Check for valid JavaScript/TypeScript
 * 2. Logic Validation - Check for dangerous patterns and code quality
 * 3. Sandbox Execution - Test in isolated environment
 *
 * Only code that passes all three phases is approved for production.
 */
class AILogicGate extends node_events_1.EventEmitter {
    config;
    validationHistory = [];
    approvalCount = 0;
    rejectionCount = 0;
    startTime = Date.now();
    constructor(config = {}) {
        super();
        this.config = {
            maxExecutionTime: config.maxExecutionTime ?? 5000,
            maxMemory: config.maxMemory ?? 64 * 1024 * 1024, // 64MB
            maxComplexity: config.maxComplexity ?? 20,
            maxNestingDepth: config.maxNestingDepth ?? 6,
            allowedPatterns: config.allowedPatterns ?? [],
            forbiddenPatterns: config.forbiddenPatterns ?? [],
            requiredPatterns: config.requiredPatterns ?? [],
            autoApproveThreshold: config.autoApproveThreshold ?? 80
        };
    }
    /**
     * Validate AI-generated code through all gates
     * @param code - Code to validate
     * @param context - Optional execution context
     * @returns Full validation report
     */
    async validate(code, context = {}) {
        const reportId = this.generateReportId();
        const timestamp = new Date();
        // Phase 1: Syntax Validation
        const syntaxResult = this.validateSyntax(code);
        // Phase 2: Logic Validation
        const logicResult = this.validateLogic(code);
        // Phase 3: Sandbox Execution (only if syntax is valid)
        let sandboxResult;
        if (syntaxResult.valid) {
            sandboxResult = await this.executeInSandbox(code, context);
        }
        else {
            sandboxResult = {
                success: false,
                error: 'Skipped due to syntax errors',
                executionTime: 0,
                memoryUsed: 0,
                violations: [],
                output: []
            };
        }
        // Calculate approval score
        const score = this.calculateScore(syntaxResult, logicResult, sandboxResult);
        const approved = score >= this.config.autoApproveThreshold;
        const approvalReason = this.generateApprovalReason(approved, score, syntaxResult, logicResult, sandboxResult);
        // Update counters
        if (approved) {
            this.approvalCount++;
        }
        else {
            this.rejectionCount++;
        }
        // Create report
        const report = {
            id: reportId,
            code,
            timestamp,
            syntax: syntaxResult,
            logic: logicResult,
            sandbox: sandboxResult,
            approved,
            approvalReason,
            score
        };
        // Store in history
        this.validationHistory.push(report);
        if (this.validationHistory.length > 1000) {
            this.validationHistory.shift();
        }
        // Emit events
        this.emit('validated', report);
        if (!approved) {
            this.emit('rejected', report);
        }
        return report;
    }
    /**
     * Phase 1: Syntax Validation
     * Checks if code is syntactically valid JavaScript
     */
    validateSyntax(code) {
        const errors = [];
        const warnings = [];
        // Try to parse as a module
        try {
            new vm.Script(code, { filename: 'validation.js' });
        }
        catch (e) {
            const error = e;
            const match = error.message.match(/line (\d+)/i);
            errors.push({
                line: match ? parseInt(match[1]) : 1,
                column: 0,
                message: error.message,
                severity: 'error'
            });
        }
        // Check for common issues
        if (!code.trim()) {
            errors.push({
                line: 1,
                column: 0,
                message: 'Empty code block',
                severity: 'error'
            });
        }
        // Check for unclosed brackets/braces
        const openBraces = (code.match(/\{/g) || []).length;
        const closeBraces = (code.match(/\}/g) || []).length;
        if (openBraces !== closeBraces) {
            warnings.push(`Mismatched braces: ${openBraces} open, ${closeBraces} close`);
        }
        const openParens = (code.match(/\(/g) || []).length;
        const closeParens = (code.match(/\)/g) || []).length;
        if (openParens !== closeParens) {
            warnings.push(`Mismatched parentheses: ${openParens} open, ${closeParens} close`);
        }
        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }
    /**
     * Phase 2: Logic Validation
     * Checks for dangerous patterns and code quality
     */
    validateLogic(code) {
        const issues = [];
        const dangerousPatterns = [];
        // Check dangerous patterns
        for (const dangerous of DANGEROUS_PATTERNS) {
            if (dangerous.pattern.test(code)) {
                dangerousPatterns.push(dangerous.name);
                issues.push({
                    type: 'security',
                    message: `Dangerous pattern detected: ${dangerous.name}`,
                    severity: dangerous.severity,
                    suggestion: `Remove or replace ${dangerous.name} with a safe alternative`
                });
            }
        }
        // Check forbidden patterns from config
        for (const pattern of this.config.forbiddenPatterns) {
            if (pattern.test(code)) {
                issues.push({
                    type: 'security',
                    message: `Forbidden pattern: ${pattern.toString()}`,
                    severity: 'high'
                });
            }
        }
        // Check required patterns from config
        for (const pattern of this.config.requiredPatterns) {
            if (!pattern.test(code)) {
                issues.push({
                    type: 'security',
                    message: `Required pattern missing: ${pattern.toString()}`,
                    severity: 'medium'
                });
            }
        }
        // Calculate metrics
        const metrics = this.calculateMetrics(code);
        // Check metrics against limits
        if (metrics.complexity > this.config.maxComplexity) {
            issues.push({
                type: 'performance',
                message: `Cyclomatic complexity (${metrics.complexity}) exceeds limit (${this.config.maxComplexity})`,
                severity: 'medium',
                suggestion: 'Break down complex functions into smaller ones'
            });
        }
        if (metrics.nestingDepth > this.config.maxNestingDepth) {
            issues.push({
                type: 'performance',
                message: `Nesting depth (${metrics.nestingDepth}) exceeds limit (${this.config.maxNestingDepth})`,
                severity: 'medium',
                suggestion: 'Reduce nesting by extracting conditions or using early returns'
            });
        }
        return {
            valid: !issues.some(i => i.severity === 'critical' || i.severity === 'high'),
            issues,
            metrics: { ...metrics, dangerousPatterns }
        };
    }
    /**
     * Calculate code metrics
     */
    calculateMetrics(code) {
        const lines = code.split('\n');
        // Count functions
        const functionMatches = code.match(/function\s+\w+|const\s+\w+\s*=\s*(?:async\s*)?\(|=>\s*\{/g);
        const functionCount = functionMatches?.length ?? 0;
        // Count async operations
        const asyncMatches = code.match(/async|await|Promise|\.then\(|\.catch\(/g);
        const asyncOperations = asyncMatches?.length ?? 0;
        // Calculate cyclomatic complexity (simplified)
        const branchKeywords = code.match(/\bif\b|\belse\b|\bfor\b|\bwhile\b|\bcase\b|\bcatch\b|\b\?\b|\b&&\b|\b\|\|\b/g);
        const complexity = (branchKeywords?.length ?? 0) + 1;
        // Calculate max nesting depth
        let maxDepth = 0;
        let currentDepth = 0;
        for (const char of code) {
            if (char === '{') {
                currentDepth++;
                maxDepth = Math.max(maxDepth, currentDepth);
            }
            else if (char === '}') {
                currentDepth--;
            }
        }
        return {
            lineCount: lines.length,
            complexity,
            nestingDepth: maxDepth,
            functionCount,
            asyncOperations
        };
    }
    /**
     * Phase 3: Sandbox Execution
     * Executes code in isolated environment
     */
    async executeInSandbox(code, context) {
        const violations = [];
        const output = [];
        const startTime = Date.now();
        const startMemory = process.memoryUsage().heapUsed;
        // Create secure sandbox
        const sandbox = this.createSecureSandbox(violations, output);
        Object.assign(sandbox, context);
        try {
            const vmContext = vm.createContext(sandbox);
            const script = new vm.Script(code, { filename: 'sandbox.js' });
            const result = script.runInContext(vmContext, {
                timeout: this.config.maxExecutionTime
            });
            const executionTime = Date.now() - startTime;
            const memoryUsed = process.memoryUsage().heapUsed - startMemory;
            // Check memory usage
            if (memoryUsed > this.config.maxMemory) {
                violations.push({
                    type: 'memory',
                    operation: 'allocation',
                    blocked: false,
                    timestamp: new Date()
                });
            }
            return {
                success: true,
                result,
                executionTime,
                memoryUsed: Math.max(0, memoryUsed),
                violations,
                output
            };
        }
        catch (error) {
            const err = error;
            const executionTime = Date.now() - startTime;
            if (err.message.includes('timed out')) {
                violations.push({
                    type: 'timeout',
                    operation: 'execution',
                    blocked: true,
                    timestamp: new Date()
                });
            }
            // v20.0: Handle dynamic import attempts (sandbox escape vector)
            const errWithCode = err;
            if (err.message.includes('dynamic import') ||
                errWithCode.code === 'ERR_VM_DYNAMIC_IMPORT_CALLBACK_MISSING') {
                violations.push({
                    type: 'code-injection',
                    operation: 'dynamic-import',
                    blocked: true,
                    timestamp: new Date()
                });
            }
            return {
                success: false,
                error: err.message,
                executionTime,
                memoryUsed: 0,
                violations,
                output
            };
        }
    }
    /**
     * Create secure sandbox with trapped globals
     */
    createSecureSandbox(violations, output) {
        const sandbox = {
            // Safe globals
            Math,
            JSON,
            Date,
            Array,
            Object,
            String,
            Number,
            Boolean,
            Promise,
            Map,
            Set,
            Symbol,
            RegExp,
            parseInt,
            parseFloat,
            isNaN,
            isFinite,
            encodeURIComponent,
            decodeURIComponent,
            // Console proxy
            console: {
                log: (...args) => output.push(args.map(String).join(' ')),
                warn: (...args) => output.push(`[WARN] ${args.map(String).join(' ')}`),
                error: (...args) => output.push(`[ERROR] ${args.map(String).join(' ')}`),
                info: (...args) => output.push(`[INFO] ${args.map(String).join(' ')}`)
            },
            // Blocked globals
            eval: undefined,
            Function: undefined,
            require: undefined,
            module: undefined,
            exports: undefined,
            __dirname: undefined,
            __filename: undefined,
            // Trapped process
            process: new Proxy({}, {
                get: (_target, prop) => {
                    violations.push({
                        type: 'process',
                        operation: `process.${String(prop)}`,
                        blocked: true,
                        timestamp: new Date()
                    });
                    return undefined;
                }
            }),
            // Trapped fs
            fs: new Proxy({}, {
                get: (_target, prop) => {
                    violations.push({
                        type: 'filesystem',
                        operation: `fs.${String(prop)}`,
                        blocked: true,
                        timestamp: new Date()
                    });
                    return undefined;
                }
            }),
            // Trapped fetch
            fetch: () => {
                violations.push({
                    type: 'network',
                    operation: 'fetch',
                    blocked: true,
                    timestamp: new Date()
                });
                return Promise.resolve(undefined);
            }
        };
        return sandbox;
    }
    /**
     * Calculate approval score (0-100)
     */
    calculateScore(syntax, logic, sandbox) {
        let score = 100;
        // Syntax penalties
        score -= syntax.errors.length * 25;
        score -= syntax.warnings.length * 5;
        // Logic penalties
        for (const issue of logic.issues) {
            switch (issue.severity) {
                case 'critical':
                    score -= 50;
                    break;
                case 'high':
                    score -= 25;
                    break;
                case 'medium':
                    score -= 10;
                    break;
                case 'low':
                    score -= 5;
                    break;
            }
        }
        // Sandbox penalties
        if (!sandbox.success)
            score -= 30;
        score -= sandbox.violations.length * 15;
        // Complexity penalty
        if (logic.metrics.complexity > 10) {
            score -= Math.min(20, logic.metrics.complexity - 10);
        }
        return Math.max(0, Math.min(100, score));
    }
    /**
     * Generate human-readable approval reason
     */
    generateApprovalReason(approved, score, syntax, logic, sandbox) {
        if (approved) {
            return `Approved with score ${score}/100. Code passed all validation gates.`;
        }
        const reasons = [];
        if (syntax.errors.length > 0) {
            reasons.push(`${syntax.errors.length} syntax error(s)`);
        }
        const criticalIssues = logic.issues.filter(i => i.severity === 'critical');
        if (criticalIssues.length > 0) {
            reasons.push(`${criticalIssues.length} critical security issue(s)`);
        }
        if (sandbox.violations.length > 0) {
            reasons.push(`${sandbox.violations.length} sandbox violation(s)`);
        }
        if (!sandbox.success) {
            reasons.push('sandbox execution failed');
        }
        return `Rejected with score ${score}/100: ${reasons.join(', ')}.`;
    }
    /**
     * Generate unique report ID
     */
    generateReportId() {
        return `gate-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    }
    /**
     * Get validation statistics
     */
    getStats() {
        const total = this.approvalCount + this.rejectionCount;
        return {
            totalValidations: total,
            approved: this.approvalCount,
            rejected: this.rejectionCount,
            approvalRate: total > 0 ? (this.approvalCount / total) * 100 : 0,
            uptime: Date.now() - this.startTime
        };
    }
    /**
     * Get recent validation reports
     * @param count - Number of reports to return
     */
    getRecentReports(count = 10) {
        return this.validationHistory.slice(-count);
    }
    /**
     * Clear validation history
     */
    clearHistory() {
        this.validationHistory = [];
    }
}
exports.AILogicGate = AILogicGate;
exports.default = AILogicGate;
