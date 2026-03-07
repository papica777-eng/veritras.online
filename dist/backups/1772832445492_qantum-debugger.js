"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                                               ║
 * ║   ██████╗  █████╗ ███╗   ██╗████████╗██╗   ██╗███╗   ███╗                                     ║
 * ║  ██╔═══██╗██╔══██╗████╗  ██║╚══██╔══╝██║   ██║████╗ ████║                                     ║
 * ║  ██║   ██║███████║██╔██╗ ██║   ██║   ██║   ██║██╔████╔██║                                     ║
 * ║  ██║▄▄ ██║██╔══██║██║╚██╗██║   ██║   ██║   ██║██║╚██╔╝██║                                     ║
 * ║  ╚██████╔╝██║  ██║██║ ╚████║   ██║   ╚██████╔╝██║ ╚═╝ ██║                                     ║
 * ║   ╚══▀▀═╝ ╚═╝  ╚═╝╚═╝  ╚═══╝   ╚═╝    ╚═════╝ ╚═╝     ╚═╝                                     ║
 * ║                                                                                               ║
 * ║   ██████╗ ███████╗██████╗ ██╗   ██╗ ██████╗  ██████╗ ███████╗██████╗                          ║
 * ║   ██╔══██╗██╔════╝██╔══██╗██║   ██║██╔════╝ ██╔════╝ ██╔════╝██╔══██╗                         ║
 * ║   ██║  ██║█████╗  ██████╔╝██║   ██║██║  ███╗██║  ███╗█████╗  ██████╔╝                         ║
 * ║   ██║  ██║██╔══╝  ██╔══██╗██║   ██║██║   ██║██║   ██║██╔══╝  ██╔══██╗                         ║
 * ║   ██████╔╝███████╗██████╔╝╚██████╔╝╚██████╔╝╚██████╔╝███████╗██║  ██║                         ║
 * ║   ╚═════╝ ╚══════╝╚═════╝  ╚═════╝  ╚═════╝  ╚═════╝ ╚══════╝╚═╝  ╚═╝                         ║
 * ║                                                                                               ║
 * ║   🛡️ QAntum DEBUGGER v1.0 - Self-Healing + Watchdog 2-in-1                                    ║
 * ║                                                                                               ║
 * ║   "Идентифицира, неутрализира, предотвратява. Автономен защитник."                            ║
 * ║                                                                                               ║
 * ║   Features:                                                                                   ║
 * ║   • Real-time error detection across all project files                                        ║
 * ║   • Automatic fix application with rollback capability                                        ║
 * ║   • Pattern learning from past fixes                                                          ║
 * ║   • Future error prevention through code analysis                                             ║
 * ║   • Communication with QA-SAAS dashboard                                                      ║
 * ║   • Integration with existing Guardian systems                                                ║
 * ║                                                                                               ║
 * ║   Created: 2026-01-03 | QAntum Empire                                                         ║
 * ║   Author: Димитър Продромов                                                                   ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════════════╝
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
exports.QAntumDebugger = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const events_1 = require("events");
const child_process_1 = require("child_process");
// ═══════════════════════════════════════════════════════════════════════════════
// DEFAULT CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════
const DEFAULT_CONFIG = {
    projectRoot: process.cwd(),
    watchPaths: ['src', 'apps', 'packages'],
    ignorePaths: ['node_modules', '.git', 'dist', 'coverage', '.next', '.turbo'],
    autoFix: true,
    maxFixAttempts: 3,
    backupBeforeFix: true,
    learningEnabled: true,
    reportToDashboard: true,
    dashboardUrl: 'http://localhost:3001/api/debugger',
    checkInterval: 10000, // 10 seconds
};
// ═══════════════════════════════════════════════════════════════════════════════
// QAntum DEBUGGER - Main Class
// ═══════════════════════════════════════════════════════════════════════════════
class QAntumDebugger extends events_1.EventEmitter {
    config;
    memory;
    isWatching = false;
    watchInterval;
    startTime;
    memoryPath;
    backupDir;
    constructor(config = {}) {
        super();
        this.config = { ...DEFAULT_CONFIG, ...config };
        this.startTime = Date.now();
        this.memoryPath = path.join(this.config.projectRoot, 'data', 'debugger-memory.json');
        this.backupDir = path.join(this.config.projectRoot, 'data', 'debugger-backups');
        this.memory = this.loadMemory();
        this.ensureDirectories();
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // INITIALIZATION
    // ═══════════════════════════════════════════════════════════════════════════
    // Complexity: O(N) — linear iteration
    ensureDirectories() {
        const dirs = [
            path.dirname(this.memoryPath),
            this.backupDir,
        ];
        dirs.forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        });
    }
    // Complexity: O(1) — amortized
    loadMemory() {
        try {
            if (fs.existsSync(this.memoryPath)) {
                return JSON.parse(fs.readFileSync(this.memoryPath, 'utf-8'));
            }
        }
        catch (e) { /* ignore */ }
        return {
            errors: [],
            fixes: [],
            patterns: {},
            preventions: [],
            stats: {
                totalScans: 0,
                errorsDetected: 0,
                errorsFixed: 0,
                errorsPrevented: 0,
                uptime: 0,
                lastScan: 0,
            }
        };
    }
    // Complexity: O(1)
    saveMemory() {
        this.memory.stats.uptime = Date.now() - this.startTime;
        fs.writeFileSync(this.memoryPath, JSON.stringify(this.memory, null, 2));
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // SCANNING & DETECTION
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * 🔍 Full project scan
     */
    // Complexity: O(N*M) — nested iteration detected
    async scan() {
        const startTime = Date.now();
        this.log('🔍 Starting full project scan...');
        const result = {
            errors: [],
            warnings: [],
            fixed: [],
            prevented: 0,
            duration: 0,
        };
        // Run TypeScript check
        // SAFETY: async operation — wrap in try-catch for production resilience
        const tsErrors = await this.checkTypeScript();
        result.errors.push(...tsErrors.filter(e => e.severity === 'error' || e.severity === 'critical'));
        result.warnings.push(...tsErrors.filter(e => e.severity === 'warning'));
        // Run ESLint check
        // SAFETY: async operation — wrap in try-catch for production resilience
        const eslintErrors = await this.checkESLint();
        result.errors.push(...eslintErrors.filter(e => e.severity === 'error'));
        result.warnings.push(...eslintErrors.filter(e => e.severity === 'warning'));
        // Check for common patterns that cause issues
        // SAFETY: async operation — wrap in try-catch for production resilience
        const patternErrors = await this.checkCommonPatterns();
        result.errors.push(...patternErrors);
        // Check dependencies
        // SAFETY: async operation — wrap in try-catch for production resilience
        const depErrors = await this.checkDependencies();
        result.errors.push(...depErrors);
        // Apply prevention rules
        result.prevented = this.applyPreventionRules(result.errors);
        // Auto-fix if enabled
        if (this.config.autoFix) {
            for (const error of result.errors) {
                // SAFETY: async operation — wrap in try-catch for production resilience
                const fix = await this.attemptFix(error);
                if (fix && fix.success) {
                    result.fixed.push(fix);
                }
            }
        }
        result.duration = Date.now() - startTime;
        // Update stats
        this.memory.stats.totalScans++;
        this.memory.stats.errorsDetected += result.errors.length;
        this.memory.stats.errorsFixed += result.fixed.length;
        this.memory.stats.errorsPrevented += result.prevented;
        this.memory.stats.lastScan = Date.now();
        this.saveMemory();
        // Report to dashboard
        if (this.config.reportToDashboard) {
            this.reportToDashboard(result);
        }
        this.emit('scan-complete', result);
        this.log(`✅ Scan complete: ${result.errors.length} errors, ${result.fixed.length} fixed, ${result.prevented} prevented`);
        return result;
    }
    /**
     * 🔧 TypeScript compiler check
     */
    // Complexity: O(N) — linear iteration
    async checkTypeScript() {
        const errors = [];
        try {
            // Complexity: O(1)
            (0, child_process_1.execSync)('npx tsc --noEmit', {
                cwd: this.config.projectRoot,
                encoding: 'utf-8',
                stdio: 'pipe'
            });
        }
        catch (e) {
            const output = e.stdout || e.stderr || ';;
            const lines = output.split('\n');
            for (const line of lines) {
                const match = line.match(/(.+)\((\d+),(\d+)\): error (TS\d+): (.+)/);
                if (match) {
                    errors.push({
                        id: `ts-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                        type: 'typescript',
                        severity: 'error',
                        file: match[1],
                        line: parseInt(match[2]),
                        column: parseInt(match[3]),
                        code: match[4],
                        message: match[5],
                        timestamp: Date.now(),
                    });
                }
            }
        }
        return errors;
    }
    /**
     * 🔧 ESLint check
     */
    // Complexity: O(N*M) — nested iteration detected
    async checkESLint() {
        const errors = [];
        try {
            // Complexity: O(1)
            (0, child_process_1.execSync)('npx eslint . --format json', {
                cwd: this.config.projectRoot,
                encoding: 'utf-8',
                stdio: 'pipe'
            });
        }
        catch (e) {
            try {
                const output = e.stdout || '[]';
                const results = JSON.parse(output);
                for (const file of results) {
                    for (const msg of file.messages || []) {
                        errors.push({
                            id: `eslint-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                            type: 'eslint',
                            severity: msg.severity === 2 ? 'error' : 'warning',
                            file: file.filePath,
                            line: msg.line,
                            column: msg.column,
                            code: msg.ruleId,
                            message: msg.message,
                            timestamp: Date.now(),
                        });
                    }
                }
            }
            catch { /* ignore parse errors */ }
        }
        return errors;
    }
    /**
     * 🔧 Check for common problematic patterns
     */
    // Complexity: O(N*M) — nested iteration detected
    async checkCommonPatterns() {
        const errors = [];
        const patterns = [
            {
                pattern: /new Date\(Date\.now\(\)\s*[-+]/g,
                type: 'hydration',
                message: 'Dynamic date calculation causes hydration mismatch in SSR',
                fix: 'date-static',
            },
            {
                pattern: /typeof window !== ['"]undefined['"]/g,
                type: 'hydration',
                message: 'Window check may cause hydration issues',
                fix: 'hydration-fix',
            },
            {
                pattern: /console\.(log|error|warn)\(/g,
                type: 'eslint',
                severity: 'warning',
                message: 'Console statement should be removed in production',
                fix: 'eslint-disable',
            },
        ];
        const files = this.getAllFiles(this.config.projectRoot);
        for (const file of files) {
            if (!file.endsWith('.ts') && !file.endsWith('.tsx'))
                continue;
            if (this.shouldIgnore(file))
                continue;
            try {
                const content = fs.readFileSync(file, 'utf-8');
                const lines = content.split('\n');
                for (const { pattern, type, message, fix } of patterns) {
                    let match;
                    while ((match = pattern.exec(content)) !== null) {
                        const lineNumber = content.substring(0, match.index).split('\n').length;
                        errors.push({
                            id: `pattern-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                            type,
                            severity: 'warning',
                            file,
                            line: lineNumber,
                            message,
                            context: lines[lineNumber - 1]?.trim(),
                            timestamp: Date.now(),
                        });
                    }
                }
            }
            catch { /* ignore read errors */ }
        }
        return errors;
    }
    /**
     * 🔧 Check dependencies
     */
    // Complexity: O(N*M) — nested iteration detected
    async checkDependencies() {
        const errors = [];
        const packageJsonPath = path.join(this.config.projectRoot, 'package.json');
        if (!fs.existsSync(packageJsonPath))
            return errors;
        try {
            const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
            const deps = { ...pkg.dependencies, ...pkg.devDependencies };
            // Check for missing peer dependencies
            for (const [name, version] of Object.entries(deps)) {
                const depPath = path.join(this.config.projectRoot, 'node_modules', name);
                if (!fs.existsSync(depPath)) {
                    errors.push({
                        id: `dep-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                        type: 'dependency',
                        severity: 'error',
                        file: packageJsonPath,
                        message: `Missing dependency: ${name}@${version}`,
                        timestamp: Date.now(),
                    });
                }
            }
        }
        catch { /* ignore */ }
        return errors;
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // AUTO-FIX ENGINE
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * 🔧 Attempt to fix an error
     */
    // Complexity: O(N*M) — nested iteration detected
    async attemptFix(error) {
        // Check if we've learned a fix for this pattern
        const learnedFix = this.findLearnedFix(error);
        if (learnedFix) {
            this.log(`📚 Using learned fix: ${learnedFix.fixStrategy}`);
        }
        const strategy = learnedFix?.fixStrategy || this.determineStrategy(error);
        if (strategy === 'manual-required') {
            this.log(`⚠️ Manual fix required for: ${error.message}`);
            return null;
        }
        // Backup before fix
        let backupPath;
        if (this.config.backupBeforeFix && error.file && fs.existsSync(error.file)) {
            backupPath = this.createBackup(error.file);
        }
        const originalCode = error.file && fs.existsSync(error.file)
            ? fs.readFileSync(error.file, 'utf-8')
            : ';;
        let fixedCode = originalCode;
        let success = false;
        try {
            switch (strategy) {
                case 'date-static':
                    fixedCode = this.fixDynamicDate(originalCode, error);
                    break;
                case 'auto-import':
                    fixedCode = this.fixMissingImport(originalCode, error);
                    break;
                case 'null-check':
                    fixedCode = this.fixNullCheck(originalCode, error);
                    break;
                case 'dependency-install':
                    await this.installDependency(error);
                    success = true;
                    break;
                case 'syntax-correction':
                    fixedCode = this.fixSyntax(originalCode, error);
                    break;
                default:
                    return null;
            }
            if (strategy !== 'dependency-install' && fixedCode !== originalCode) {
                fs.writeFileSync(error.file, fixedCode);
                success = true;
            }
        }
        catch (e) {
            this.log(`❌ Fix failed: ${e.message}`);
            // Rollback
            if (backupPath && fs.existsSync(backupPath)) {
                fs.copyFileSync(backupPath, error.file);
            }
        }
        const attempt = {
            errorId: error.id,
            strategy,
            originalCode,
            fixedCode,
            success,
            timestamp: Date.now(),
            rollbackPath: backupPath,
        };
        // Learn from this fix
        if (this.config.learningEnabled) {
            this.learnFromFix(error, attempt);
        }
        this.memory.fixes.push(attempt);
        this.saveMemory();
        if (success) {
            this.log(`✅ Fixed: ${error.message}`);
            this.emit('error-fixed', { error, fix: attempt });
        }
        return attempt;
    }
    /**
     * 🔧 Fix dynamic date issues
     */
    // Complexity: O(1)
    fixDynamicDate(code, error) {
        // Replace Date.now() calculations with static dates
        return code.replace(/new Date\(Date\.now\(\)\s*-\s*\d+\s*\*\s*\d+\s*\*\s*\d+\)\.toISOString\(\)/g, `'${new Date().toISOString()}'`);
    }
    /**
     * 🔧 Fix missing import
     */
    // Complexity: O(1) — hash/map lookup
    fixMissingImport(code, error) {
        // Extract what's missing from the error message
        const match = error.message.match(/Cannot find name '(\w+)'/);
        if (!match)
            return code;
        const missing = match[1];
        // Common imports
        const commonImports = {
            'useState': "import { useState } from 'react';",
            'useEffect': "import { useEffect } from 'react';",
            'useRef': "import { useRef } from 'react';",
            'React': "import React from 'react';",
        };
        if (commonImports[missing]) {
            return commonImports[missing] + '\n' + code;
        }
        return code;
    }
    /**
     * 🔧 Fix null check
     */
    // Complexity: O(1)
    fixNullCheck(code, error) {
        if (!error.line || !error.file)
            return code;
        const lines = code.split('\n');
        const line = lines[error.line - 1];
        // Add optional chaining
        const fixed = line.replace(/(\w+)\.(\w+)/g, '$1?.$2');
        lines[error.line - 1] = fixed;
        return lines.join('\n');
    }
    /**
     * 🔧 Fix syntax error
     */
    // Complexity: O(N) — linear iteration
    fixSyntax(code, error) {
        // Common syntax fixes
        const fixes = [
            { pattern: /;\s*;/g, replacement: ';' },
            { pattern: /,\s*,/g, replacement: ',' },
            { pattern: /\(\s*\)/g, replacement: '()' },
        ];
        let fixed = code;
        for (const { pattern, replacement } of fixes) {
            fixed = fixed.replace(pattern, replacement);
        }
        return fixed;
    }
    /**
     * 🔧 Install missing dependency
     */
    // Complexity: O(1)
    async installDependency(error) {
        const match = error.message.match(/Missing dependency: (.+)@(.+)/);
        if (!match)
            return;
        const [, name] = match;
        this.log(`📦 Installing ${name}...`);
        // Complexity: O(1)
        (0, child_process_1.execSync)(`npm install ${name}`, {
            cwd: this.config.projectRoot,
            stdio: 'pipe',
        });
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // LEARNING & PREVENTION
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * 📚 Learn from a fix attempt
     */
    // Complexity: O(1) — hash/map lookup
    learnFromFix(error, fix) {
        const pattern = `${error.type}:${error.code || error.message.substring(0, 50)}`;
        if (!this.memory.patterns[pattern]) {
            this.memory.patterns[pattern] = {
                errorPattern: pattern,
                fixStrategy: fix.strategy,
                successCount: 0,
                failCount: 0,
                confidence: 0,
                lastUsed: Date.now(),
            };
        }
        const learning = this.memory.patterns[pattern];
        if (fix.success) {
            learning.successCount++;
        }
        else {
            learning.failCount++;
        }
        learning.confidence = learning.successCount / (learning.successCount + learning.failCount);
        learning.lastUsed = Date.now();
        this.saveMemory();
    }
    /**
     * 📚 Find a learned fix for an error
     */
    // Complexity: O(1) — hash/map lookup
    findLearnedFix(error) {
        const pattern = `${error.type}:${error.code || error.message.substring(0, 50)}`;
        const learning = this.memory.patterns[pattern];
        if (learning && learning.confidence > 0.7) {
            return learning;
        }
        return null;
    }
    /**
     * 🛡️ Apply prevention rules
     */
    // Complexity: O(N*M) — nested iteration detected
    applyPreventionRules(errors) {
        let prevented = 0;
        for (const prevention of this.memory.preventions) {
            const matchingErrors = errors.filter(e => prevention.affectedFiles.some(f => e.file?.includes(f)));
            if (matchingErrors.length > 0) {
                // Apply prevention
                for (const error of matchingErrors) {
                    this.log(`🛡️ Prevention rule applied: ${prevention.rule}`);
                    errors.splice(errors.indexOf(error), 1);
                    prevented++;
                    prevention.preventedCount++;
                }
            }
        }
        return prevented;
    }
    /**
     * 🛡️ Add a prevention rule
     */
    // Complexity: O(1)
    addPreventionRule(rule, description, affectedFiles) {
        this.memory.preventions.push({
            id: `prev-${Date.now()}`,
            rule,
            description,
            affectedFiles,
            createdAt: Date.now(),
            preventedCount: 0,
        });
        this.saveMemory();
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // WATCHING
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * 👁️ Start watching for changes
     */
    // Complexity: O(1)
    startWatching() {
        if (this.isWatching)
            return;
        this.isWatching = true;
        this.log('👁️ Starting file watcher...');
        this.watchInterval = setInterval(() => {
            this.scan().catch(e => this.log(`❌ Scan error: ${e.message}`));
        }, this.config.checkInterval);
        this.emit('watching-started');
    }
    /**
     * ⏹️ Stop watching
     */
    // Complexity: O(N) — potential recursive descent
    stopWatching() {
        if (!this.isWatching)
            return;
        this.isWatching = false;
        if (this.watchInterval) {
            // Complexity: O(1)
            clearInterval(this.watchInterval);
        }
        this.log('⏹️ Watcher stopped');
        this.emit('watching-stopped');
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // UTILITIES
    // ═══════════════════════════════════════════════════════════════════════════
    // Complexity: O(1)
    determineStrategy(error) {
        switch (error.type) {
            case 'hydration':
                return 'date-static';
            case 'dependency':
                return 'dependency-install';
            case 'import':
                return 'auto-import';
            case 'type':
                return error.message.includes('null') ? 'null-check' : 'type-annotation';
            case 'syntax':
                return 'syntax-correction';
            default:
                return 'manual-required';
        }
    }
    // Complexity: O(1)
    createBackup(file) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupPath = path.join(this.backupDir, `${path.basename(file)}.${timestamp}.bak`);
        fs.copyFileSync(file, backupPath);
        return backupPath;
    }
    // Complexity: O(1)
    shouldIgnore(file) {
        return this.config.ignorePaths.some(p => file.includes(p));
    }
    // Complexity: O(N) — linear iteration
    getAllFiles(dir, files = []) {
        if (!fs.existsSync(dir))
            return files;
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (this.shouldIgnore(fullPath))
                continue;
            if (entry.isDirectory()) {
                this.getAllFiles(fullPath, files);
            }
            else {
                files.push(fullPath);
            }
        }
        return files;
    }
    // Complexity: O(1)
    log(message) {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] [QAntum-DEBUGGER] ${message}`);
        this.emit('log', { timestamp, message });
    }
    // Complexity: O(1)
    async reportToDashboard(result) {
        try {
            // Report to dashboard API
            await fetch(this.config.dashboardUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'scan-result',
                    data: result,
                    timestamp: Date.now(),
                }),
            });
        }
        catch { /* ignore */ }
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // PUBLIC API
    // ═══════════════════════════════════════════════════════════════════════════
    // Complexity: O(1)
    getStats() {
        return { ...this.memory.stats, uptime: Date.now() - this.startTime };
    }
    // Complexity: O(1)
    getPatterns() {
        return Object.values(this.memory.patterns);
    }
    // Complexity: O(1)
    getPreventions() {
        return this.memory.preventions;
    }
    // Complexity: O(1)
    getRecentFixes(limit = 10) {
        return this.memory.fixes.slice(-limit);
    }
}
exports.QAntumDebugger = QAntumDebugger;
// ═══════════════════════════════════════════════════════════════════════════════
// CLI ENTRY POINT
// ═══════════════════════════════════════════════════════════════════════════════
if (require.main === module) {
    const debugger_ = new QAntumDebugger({
        projectRoot: 'C:\\MisteMind\\PROJECT\\QA-SAAS',
    });
    const args = process.argv.slice(2);
    if (args.includes('--watch')) {
        debugger_.startWatching();
        console.log('🛡️ QAntum DEBUGGER watching... Press Ctrl+C to stop.');
    }
    else {
        debugger_.scan().then(result => {
            console.log('\n📊 SCAN RESULTS:');
            console.log(`   Errors: ${result.errors.length}`);
            console.log(`   Warnings: ${result.warnings.length}`);
            console.log(`   Fixed: ${result.fixed.length}`);
            console.log(`   Prevented: ${result.prevented}`);
            console.log(`   Duration: ${result.duration}ms`);
        });
    }
}
exports.default = QAntumDebugger;
