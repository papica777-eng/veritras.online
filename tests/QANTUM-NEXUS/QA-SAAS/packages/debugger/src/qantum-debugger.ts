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

import * as fs from 'fs';
import * as path from 'path';
import { EventEmitter } from 'events';
import { execSync, spawn } from 'child_process';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════════════════

interface DebuggerConfig {
  projectRoot: string;
  watchPaths: string[];
  ignorePaths: string[];
  autoFix: boolean;
  maxFixAttempts: number;
  backupBeforeFix: boolean;
  learningEnabled: boolean;
  reportToDashboard: boolean;
  dashboardUrl: string;
  checkInterval: number;
}

interface DetectedError {
  id: string;
  type: ErrorType;
  severity: 'critical' | 'error' | 'warning' | 'info';
  file: string;
  line?: number;
  column?: number;
  message: string;
  code?: string;
  timestamp: number;
  context?: string;
}

type ErrorType = 
  | 'typescript'
  | 'eslint'
  | 'runtime'
  | 'dependency'
  | 'import'
  | 'syntax'
  | 'type'
  | 'hydration'
  | 'build'
  | 'test'
  | 'unknown';

interface FixAttempt {
  errorId: string;
  strategy: FixStrategy;
  originalCode: string;
  fixedCode: string;
  success: boolean;
  timestamp: number;
  rollbackPath?: string;
}

type FixStrategy =
  | 'auto-import'
  | 'type-annotation'
  | 'null-check'
  | 'async-await'
  | 'dependency-install'
  | 'syntax-correction'
  | 'date-static'
  | 'hydration-fix'
  | 'eslint-disable'
  | 'manual-required';

interface DebuggerMemory {
  errors: DetectedError[];
  fixes: FixAttempt[];
  patterns: Record<string, PatternLearning>;
  preventions: Prevention[];
  stats: DebuggerStats;
}

interface PatternLearning {
  errorPattern: string;
  fixStrategy: FixStrategy;
  successCount: number;
  failCount: number;
  confidence: number;
  lastUsed: number;
}

interface Prevention {
  id: string;
  rule: string;
  description: string;
  affectedFiles: string[];
  createdAt: number;
  preventedCount: number;
}

interface DebuggerStats {
  totalScans: number;
  errorsDetected: number;
  errorsFixed: number;
  errorsPrevented: number;
  uptime: number;
  lastScan: number;
}

interface ScanResult {
  errors: DetectedError[];
  warnings: DetectedError[];
  fixed: FixAttempt[];
  prevented: number;
  duration: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// DEFAULT CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

const DEFAULT_CONFIG: DebuggerConfig = {
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

export class QAntumDebugger extends EventEmitter {
  private config: DebuggerConfig;
  private memory: DebuggerMemory;
  private isWatching: boolean = false;
  private watchInterval?: NodeJS.Timeout;
  private startTime: number;
  private memoryPath: string;
  private backupDir: string;

  constructor(config: Partial<DebuggerConfig> = {}) {
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

  private ensureDirectories(): void {
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

  private loadMemory(): DebuggerMemory {
    try {
      if (fs.existsSync(this.memoryPath)) {
        return JSON.parse(fs.readFileSync(this.memoryPath, 'utf-8'));
      }
    } catch (e) { /* ignore */ }
    
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

  private saveMemory(): void {
    this.memory.stats.uptime = Date.now() - this.startTime;
    fs.writeFileSync(this.memoryPath, JSON.stringify(this.memory, null, 2));
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SCANNING & DETECTION
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * 🔍 Full project scan
   */
  async scan(): Promise<ScanResult> {
    const startTime = Date.now();
    this.log('🔍 Starting full project scan...');

    const result: ScanResult = {
      errors: [],
      warnings: [],
      fixed: [],
      prevented: 0,
      duration: 0,
    };

    // Run TypeScript check
    const tsErrors = await this.checkTypeScript();
    result.errors.push(...tsErrors.filter(e => e.severity === 'error' || e.severity === 'critical'));
    result.warnings.push(...tsErrors.filter(e => e.severity === 'warning'));

    // Run ESLint check
    const eslintErrors = await this.checkESLint();
    result.errors.push(...eslintErrors.filter(e => e.severity === 'error'));
    result.warnings.push(...eslintErrors.filter(e => e.severity === 'warning'));

    // Check for common patterns that cause issues
    const patternErrors = await this.checkCommonPatterns();
    result.errors.push(...patternErrors);

    // Check dependencies
    const depErrors = await this.checkDependencies();
    result.errors.push(...depErrors);

    // Apply prevention rules
    result.prevented = this.applyPreventionRules(result.errors);

    // Auto-fix if enabled
    if (this.config.autoFix) {
      for (const error of result.errors) {
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
  private async checkTypeScript(): Promise<DetectedError[]> {
    const errors: DetectedError[] = [];
    
    try {
      execSync('npx tsc --noEmit', { 
        cwd: this.config.projectRoot,
        encoding: 'utf-8',
        stdio: 'pipe'
      });
    } catch (e: any) {
      const output = e.stdout || e.stderr || '';
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
  private async checkESLint(): Promise<DetectedError[]> {
    const errors: DetectedError[] = [];
    
    try {
      execSync('npx eslint . --format json', {
        cwd: this.config.projectRoot,
        encoding: 'utf-8',
        stdio: 'pipe'
      });
    } catch (e: any) {
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
      } catch { /* ignore parse errors */ }
    }

    return errors;
  }

  /**
   * 🔧 Check for common problematic patterns
   */
  private async checkCommonPatterns(): Promise<DetectedError[]> {
    const errors: DetectedError[] = [];
    const patterns = [
      {
        pattern: /new Date\(Date\.now\(\)\s*[-+]/g,
        type: 'hydration' as ErrorType,
        message: 'Dynamic date calculation causes hydration mismatch in SSR',
        fix: 'date-static' as FixStrategy,
      },
      {
        pattern: /typeof window !== ['"]undefined['"]/g,
        type: 'hydration' as ErrorType,
        message: 'Window check may cause hydration issues',
        fix: 'hydration-fix' as FixStrategy,
      },
      {
        pattern: /console\.(log|error|warn)\(/g,
        type: 'eslint' as ErrorType,
        severity: 'warning' as const,
        message: 'Console statement should be removed in production',
        fix: 'eslint-disable' as FixStrategy,
      },
    ];

    const files = this.getAllFiles(this.config.projectRoot);
    
    for (const file of files) {
      if (!file.endsWith('.ts') && !file.endsWith('.tsx')) continue;
      if (this.shouldIgnore(file)) continue;

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
      } catch { /* ignore read errors */ }
    }

    return errors;
  }

  /**
   * 🔧 Check dependencies
   */
  private async checkDependencies(): Promise<DetectedError[]> {
    const errors: DetectedError[] = [];
    const packageJsonPath = path.join(this.config.projectRoot, 'package.json');

    if (!fs.existsSync(packageJsonPath)) return errors;

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
    } catch { /* ignore */ }

    return errors;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // AUTO-FIX ENGINE
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * 🔧 Attempt to fix an error
   */
  private async attemptFix(error: DetectedError): Promise<FixAttempt | null> {
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
    let backupPath: string | undefined;
    if (this.config.backupBeforeFix && error.file && fs.existsSync(error.file)) {
      backupPath = this.createBackup(error.file);
    }

    const originalCode = error.file && fs.existsSync(error.file) 
      ? fs.readFileSync(error.file, 'utf-8') 
      : '';

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
    } catch (e: any) {
      this.log(`❌ Fix failed: ${e.message}`);
      // Rollback
      if (backupPath && fs.existsSync(backupPath)) {
        fs.copyFileSync(backupPath, error.file);
      }
    }

    const attempt: FixAttempt = {
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
  private fixDynamicDate(code: string, error: DetectedError): string {
    // Replace Date.now() calculations with static dates
    return code.replace(
      /new Date\(Date\.now\(\)\s*-\s*\d+\s*\*\s*\d+\s*\*\s*\d+\)\.toISOString\(\)/g,
      `'${new Date().toISOString()}'`
    );
  }

  /**
   * 🔧 Fix missing import
   */
  private fixMissingImport(code: string, error: DetectedError): string {
    // Extract what's missing from the error message
    const match = error.message.match(/Cannot find name '(\w+)'/);
    if (!match) return code;

    const missing = match[1];
    
    // Common imports
    const commonImports: Record<string, string> = {
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
  private fixNullCheck(code: string, error: DetectedError): string {
    if (!error.line || !error.file) return code;

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
  private fixSyntax(code: string, error: DetectedError): string {
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
  private async installDependency(error: DetectedError): Promise<void> {
    const match = error.message.match(/Missing dependency: (.+)@(.+)/);
    if (!match) return;

    const [, name] = match;
    this.log(`📦 Installing ${name}...`);
    
    execSync(`npm install ${name}`, {
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
  private learnFromFix(error: DetectedError, fix: FixAttempt): void {
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
    } else {
      learning.failCount++;
    }
    learning.confidence = learning.successCount / (learning.successCount + learning.failCount);
    learning.lastUsed = Date.now();

    this.saveMemory();
  }

  /**
   * 📚 Find a learned fix for an error
   */
  private findLearnedFix(error: DetectedError): PatternLearning | null {
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
  private applyPreventionRules(errors: DetectedError[]): number {
    let prevented = 0;

    for (const prevention of this.memory.preventions) {
      const matchingErrors = errors.filter(e => 
        prevention.affectedFiles.some(f => e.file?.includes(f))
      );

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
  addPreventionRule(rule: string, description: string, affectedFiles: string[]): void {
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
  startWatching(): void {
    if (this.isWatching) return;

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
  stopWatching(): void {
    if (!this.isWatching) return;

    this.isWatching = false;
    if (this.watchInterval) {
      clearInterval(this.watchInterval);
    }

    this.log('⏹️ Watcher stopped');
    this.emit('watching-stopped');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // UTILITIES
  // ═══════════════════════════════════════════════════════════════════════════

  private determineStrategy(error: DetectedError): FixStrategy {
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

  private createBackup(file: string): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(this.backupDir, `${path.basename(file)}.${timestamp}.bak`);
    fs.copyFileSync(file, backupPath);
    return backupPath;
  }

  private shouldIgnore(file: string): boolean {
    return this.config.ignorePaths.some(p => file.includes(p));
  }

  private getAllFiles(dir: string, files: string[] = []): string[] {
    if (!fs.existsSync(dir)) return files;

    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (this.shouldIgnore(fullPath)) continue;
      
      if (entry.isDirectory()) {
        this.getAllFiles(fullPath, files);
      } else {
        files.push(fullPath);
      }
    }

    return files;
  }

  private log(message: string): void {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [QAntum-DEBUGGER] ${message}`);
    this.emit('log', { timestamp, message });
  }

  private async reportToDashboard(result: ScanResult): Promise<void> {
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
    } catch { /* ignore */ }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PUBLIC API
  // ═══════════════════════════════════════════════════════════════════════════

  getStats(): DebuggerStats {
    return { ...this.memory.stats, uptime: Date.now() - this.startTime };
  }

  getPatterns(): PatternLearning[] {
    return Object.values(this.memory.patterns);
  }

  getPreventions(): Prevention[] {
    return this.memory.preventions;
  }

  getRecentFixes(limit: number = 10): FixAttempt[] {
    return this.memory.fixes.slice(-limit);
  }
}

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
  } else {
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

export default QAntumDebugger;
