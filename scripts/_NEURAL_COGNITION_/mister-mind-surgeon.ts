/**
 * 🧠 QANTUM - AUTONOMOUS SURGEON v1.0
 * ═══════════════════════════════════════════════════════════════════════════════
 * @description Автоматично локализиране и коригиране на TypeScript грешки.
 *              Self-Healing Codebase - "Свещеният Граал" на софтуерната архитектура.
 * @author Dimitar Prodromov - Senior QA Architect
 * @copyright 2025 All Rights Reserved.
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * АРХИТЕКТУРА:
 * ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
 * │   SCANNER   │───▶│   PARSER    │───▶│  ANALYZER   │───▶│   SURGEON   │───▶│  VALIDATOR  │
 * │ (tsc exec)  │    │  (regex)    │    │   (AI)      │    │  (patch)    │    │  (verify)   │
 * └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
 */

import { execSync, exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

// ═══════════════════════════════════════════════════════════════════════════════
// 🎨 CONSOLE COLORS
// ═══════════════════════════════════════════════════════════════════════════════
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
};

function log(msg: string, color: keyof typeof colors = 'reset'): void {
  console.log(`${colors[color]}${msg}${colors.reset}`);
}

function logBox(title: string, content: string[]): void {
  const width = 75;
  // Complexity: O(N) — linear iteration
  log('╔' + '═'.repeat(width) + '╗', 'cyan');
  // Complexity: O(N) — linear iteration
  log('║  ' + title.padEnd(width - 2) + '║', 'cyan');
  // Complexity: O(N) — linear iteration
  log('╠' + '═'.repeat(width) + '╣', 'cyan');
  content.forEach(line => {
    // Complexity: O(1)
    log('║  ' + line.padEnd(width - 2) + '║', 'cyan');
  });
  // Complexity: O(1)
  log('╚' + '═'.repeat(width) + '╝', 'cyan');
}

// ═══════════════════════════════════════════════════════════════════════════════
// 📊 INTERFACES
// ═══════════════════════════════════════════════════════════════════════════════

interface ErrorDetail {
  file: string;
  line: number;
  column: number;
  code: string;
  message: string;
  context?: string;
}

interface FixResult {
  file: string;
  success: boolean;
  errorsFixed: number;
  errorsBefore: number;
  errorsAfter: number;
  backupPath?: string;
}

interface SurgeonConfig {
  maxRetries: number;
  createBackups: boolean;
  parallelFixes: boolean;
  dryRun: boolean;
  verbose: boolean;
  contextLines: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🔧 FIX STRATEGIES - Pattern-based fixes without external AI
// ═══════════════════════════════════════════════════════════════════════════════

const fixStrategies: Record<string, (error: ErrorDetail, lines: string[]) => { fixed: boolean; lines: string[]; description: string }> = {
  
  // TS2307: Cannot find module
  TS2307: (error, lines) => {
    const line = lines[error.line - 1];
    
    // Fix common import path issues
    const fixes: Array<[RegExp, string, string]> = [
      [/from ['"]\.\/voice-commander['"]/, "from '../qantum/SaaS-Framework/01_ECOSYSTEM_APPS/MrMindQATool/src/multimodal/voice-commander'", 'voice-commander path'],
      [/from ['"]\.\/thermal-aware-pool['"]/, "from '../../src/energy/thermal-aware-pool'", 'thermal-aware-pool path'],
      [/from ['"]\.\/worker-pool['"]/, "from '../qantum/SaaS-Framework/01_ECOSYSTEM_APPS/MisteMind-OMEGA/TRAINING/training-framework/src/bastion/workers/worker-pool'", 'worker-pool path'],
    ];
    
    for (const [pattern, replacement, desc] of fixes) {
      if (pattern.test(line)) {
        lines[error.line - 1] = line.replace(pattern, replacement);
        return { fixed: true, lines, description: `Fixed import path: ${desc}` };
      }
    }
    
    return { fixed: false, lines, description: 'Unknown module - manual fix required' };
  },
  
  // TS4114: Override modifier missing
  TS4114: (error, lines) => {
    const line = lines[error.line - 1];
    
    // Add override to method
    if (!line.includes('override')) {
      const methodPatterns = [
        /(\s+)(async\s+)?(_transform|_flush|_read|_write|_final|_destroy)/,
        /(\s+)(public\s+)?(async\s+)?(\w+)\(/,
      ];
      
      for (const pattern of methodPatterns) {
        if (pattern.test(line)) {
          const fixed = line.replace(/(\s+)(async\s+)?/, '$1override $2');
          if (fixed !== line) {
            lines[error.line - 1] = fixed;
            return { fixed: true, lines, description: 'Added override modifier' };
          }
        }
      }
    }
    
    return { fixed: false, lines, description: 'Could not add override' };
  },
  
  // TS4023: Re-exporting type needs export type
  TS4023: (error, lines) => {
    const line = lines[error.line - 1];
    
    if (line.includes('export {') && !line.includes('export type')) {
      // Extract type name from error message
      const typeMatch = error.message.match(/'(\w+)'/);
      if (typeMatch) {
        const typeName = typeMatch[1];
        if (line.includes(typeName)) {
          // Change to export type
          const fixed = line.replace('export {', 'export type {');
          lines[error.line - 1] = fixed;
          return { fixed: true, lines, description: `Changed to export type for ${typeName}` };
        }
      }
    }
    
    return { fixed: false, lines, description: 'Could not convert to export type' };
  },
  
  // TS2339: Property does not exist
  TS2339: (error, lines) => {
    const line = lines[error.line - 1];
    
    // error.message on unknown
    if (error.message.includes("'message'") && error.message.includes("'unknown'")) {
      if (line.includes('error.message')) {
        // Find the variable name
        const varMatch = line.match(/(\w+)\.message/);
        if (varMatch) {
          const varName = varMatch[1];
          const indent = line.match(/^(\s*)/)?.[1] || '';
          const typeGuard = `${indent}const ${varName}Message = ${varName} instanceof Error ? ${varName}.message : String(${varName});`;
          const fixed = line.replace(`${varName}.message`, `${varName}Message`);
          
          // Insert type guard before this line
          lines.splice(error.line - 1, 0, typeGuard);
          lines[error.line] = fixed;
          
          return { fixed: true, lines, description: 'Added type guard for error.message' };
        }
      }
    }
    
    // metadata property - use params instead
    if (error.message.includes("'metadata'")) {
      const fixed = line.replace('.metadata', '.params');
      if (fixed !== line) {
        lines[error.line - 1] = fixed;
        return { fixed: true, lines, description: 'Replaced .metadata with .params' };
      }
    }
    
    return { fixed: false, lines, description: 'Property fix not found' };
  },
  
  // TS2345: Argument type mismatch
  TS2345: (error, lines) => {
    const line = lines[error.line - 1];
    
    // WorkerTask generic mismatch
    if (error.message.includes('WorkerTask')) {
      if (line.includes('.enqueue(')) {
        const fixed = line.replace(
          /\.enqueue\((\w+)\)/,
          '.enqueue($1 as WorkerTask<unknown, unknown>)'
        );
        if (fixed !== line) {
          lines[error.line - 1] = fixed;
          return { fixed: true, lines, description: 'Added WorkerTask type assertion' };
        }
      }
    }
    
    // positionHint type
    if (error.message.includes('positionHint')) {
      const fixed = line.replace(
        /positionHint\?: string/,
        "positionHint?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center'"
      );
      if (fixed !== line) {
        lines[error.line - 1] = fixed;
        return { fixed: true, lines, description: 'Fixed positionHint type' };
      }
    }
    
    return { fixed: false, lines, description: 'Type mismatch - manual fix required' };
  },
  
  // TS2322: Type not assignable
  TS2322: (error, lines) => {
    const line = lines[error.line - 1];
    
    // unknown[] to specific array type
    if (error.message.includes("'unknown[]'")) {
      const typeMatch = error.message.match(/to type '([^']+)'/);
      if (typeMatch && line.includes(': unknown[]')) {
        const targetType = typeMatch[1];
        const fixed = line.replace(': unknown[]', `: ${targetType}`);
        lines[error.line - 1] = fixed;
        return { fixed: true, lines, description: `Changed unknown[] to ${targetType}` };
      }
    }
    
    // Map type mismatch
    if (error.message.includes("Map<string, string>") && error.message.includes("Map<string, number>")) {
      // Find interface and fix
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('selectors: Map<string, number>')) {
          lines[i] = lines[i].replace('Map<string, number>', 'Map<string, string>');
          return { fixed: true, lines, description: 'Changed Map type from number to string' };
        }
      }
    }
    
    return { fixed: false, lines, description: 'Type assignment - manual fix required' };
  },
  
  // TS2769: No overload matches
  TS2769: (error, lines) => {
    const line = lines[error.line - 1];
    
    // Playwright evaluate typing issue
    if (error.message.includes('evaluate') || line.includes('.evaluate(')) {
      // Remove type annotations from callback parameters
      const fixed = line
        .replace(/\((\w+): string\)/g, '($1)')
        .replace(/\((\w+): number\)/g, '($1)')
        .replace(/\((\w+): string,/g, '($1,')
        .replace(/\((\w+): number,/g, '($1,');
      
      if (fixed !== line) {
        lines[error.line - 1] = fixed;
        return { fixed: true, lines, description: 'Removed type annotations from evaluate callback' };
      }
    }
    
    return { fixed: false, lines, description: 'Overload mismatch - manual fix required' };
  },
  
  // TS2532: Object possibly undefined
  TS2532: (error, lines) => {
    const line = lines[error.line - 1];
    
    // Add optional chaining
    const propMatch = error.message.match(/'(\w+)'/);
    if (propMatch) {
      const prop = propMatch[1];
      const regex = new RegExp(`(\\w+)\\.${prop}(?!\\?)`, 'g');
      const fixed = line.replace(regex, `$1?.${prop}`);
      
      if (fixed !== line) {
        lines[error.line - 1] = fixed;
        return { fixed: true, lines, description: `Added optional chaining for ${prop}` };
      }
    }
    
    return { fixed: false, lines, description: 'Could not add optional chaining' };
  },
  
  // TS2305: Module has no exported member
  TS2305: (error, lines) => {
    const line = lines[error.line - 1];
    
    // Try to fix import by removing the missing member
    const memberMatch = error.message.match(/'(\w+)'/);
    if (memberMatch) {
      const member = memberMatch[1];
      
      // Remove the member from the import
      const importRegex = new RegExp(`\\b${member}\\b,?\\s*`, 'g');
      const fixed = line.replace(importRegex, '');
      
      // Clean up empty imports
      const cleanedImport = fixed
        .replace(/{\s*,/, '{')
        .replace(/,\s*}/, '}')
        .replace(/,\s*,/g, ',')
        .replace(/{\s*}/g, '{}');
      
      if (cleanedImport !== line && !cleanedImport.includes('{}')) {
        lines[error.line - 1] = cleanedImport;
        return { fixed: true, lines, description: `Removed missing export: ${member}` };
      }
    }
    
    return { fixed: false, lines, description: 'Missing export - manual fix required' };
  },
  
  // TS2578: Unused @ts-expect-error
  TS2578: (error, lines) => {
    const line = lines[error.line - 1];
    
    if (line.includes('@ts-expect-error')) {
      // Remove the line
      lines.splice(error.line - 1, 1);
      return { fixed: true, lines, description: 'Removed unused @ts-expect-error' };
    }
    
    return { fixed: false, lines, description: 'Could not remove directive' };
  },
  
  // TS2724: Module has no exported member (did you mean...?)
  TS2724: (error, lines) => {
    const line = lines[error.line - 1];
    
    // Extract suggested name
    const suggestionMatch = error.message.match(/Did you mean '(\w+)'/);
    const originalMatch = error.message.match(/no exported member named '(\w+)'/);
    
    if (suggestionMatch && originalMatch) {
      const original = originalMatch[1];
      const suggested = suggestionMatch[1];
      const fixed = line.replace(new RegExp(`\\b${original}\\b`), suggested);
      
      if (fixed !== line) {
        lines[error.line - 1] = fixed;
        return { fixed: true, lines, description: `Renamed ${original} to ${suggested}` };
      }
    }
    
    return { fixed: false, lines, description: 'Could not apply suggestion' };
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// 🏥 QANTUM SURGEON CLASS
// ═══════════════════════════════════════════════════════════════════════════════

class QAntumSurgeon {
  private config: SurgeonConfig;
  private stats = {
    filesProcessed: 0,
    errorsFound: 0,
    errorsFixed: 0,
    errorsFailed: 0,
    iterations: 0,
  };
  
  constructor(config: Partial<SurgeonConfig> = {}) {
    this.config = {
      maxRetries: 5,
      createBackups: true,
      parallelFixes: false,
      dryRun: false,
      verbose: true,
      contextLines: 5,
      ...config,
    };
  }
  
  // ─────────────────────────────────────────────────────────────────────────────
  // 🚀 MAIN ENTRY POINT
  // ─────────────────────────────────────────────────────────────────────────────
  
  // Complexity: O(N*M) — nested iteration detected
  async run(): Promise<void> {
    console.clear();
    // Complexity: O(N*M) — nested iteration detected
    logBox('🧠 QANTUM - AUTONOMOUS SURGEON v1.0', [
      'Self-Healing Codebase System',
      'By Dimitar Prodromov - Senior QA Architect',
      '',
      'Initializing genetic patch system...',
    ]);
    
    let iteration = 0;
    let previousErrorCount = Infinity;
    
    while (iteration < this.config.maxRetries) {
      iteration++;
      this.stats.iterations = iteration;
      
      // Complexity: O(1)
      log(`\n${'═'.repeat(77)}`, 'magenta');
      // Complexity: O(1)
      log(`  🔄 ITERATION ${iteration}/${this.config.maxRetries}`, 'bright');
      // Complexity: O(1)
      log(`${'═'.repeat(77)}`, 'magenta');
      
      // STEP 1: SCAN
      const errors = this.scanForErrors();
      
      if (errors.length === 0) {
        this.printSuccess();
        return;
      }
      
      // Check for progress
      if (errors.length >= previousErrorCount) {
        // Complexity: O(1)
        log(`\n⚠️  No progress made. Errors: ${previousErrorCount} → ${errors.length}`, 'yellow');
        if (iteration > 2) {
          // Complexity: O(1)
          log('   Remaining errors require manual intervention.', 'yellow');
          break;
        }
      }
      
      previousErrorCount = errors.length;
      this.stats.errorsFound = errors.length;
      
      // Complexity: O(1)
      log(`\n📊 Found ${errors.length} errors`, 'yellow');
      
      // Group by file
      const errorsByFile = this.groupErrorsByFile(errors);
      
      // STEP 2: FIX EACH FILE
      for (const [filePath, fileErrors] of errorsByFile) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.fixFile(filePath, fileErrors);
      }
      
      // Complexity: O(1)
      log(`\n📈 Iteration ${iteration} complete: ${this.stats.errorsFixed} fixed, ${this.stats.errorsFailed} failed`, 'blue');
    }
    
    // Final verification
    const remainingErrors = this.scanForErrors();
    
    if (remainingErrors.length === 0) {
      this.printSuccess();
    } else {
      this.printRemaining(remainingErrors);
    }
  }
  
  // ─────────────────────────────────────────────────────────────────────────────
  // 🔍 SCANNER - Execute tsc and capture errors
  // ─────────────────────────────────────────────────────────────────────────────
  
  // Complexity: O(1)
  private scanForErrors(): ErrorDetail[] {
    // Complexity: O(N) — potential recursive descent
    log('\n🔍 Scanning codebase with TypeScript compiler...', 'cyan');
    
    try {
      // Complexity: O(1)
      execSync('npx tsc --noEmit 2>&1', { encoding: 'utf8', stdio: 'pipe' });
      return [];
    } catch (err: any) {
      const output = err.stdout || err.stderr || '';
      return this.parseErrors(output);
    }
  }
  
  // ─────────────────────────────────────────────────────────────────────────────
  // 📝 PARSER - Extract error details from compiler output
  // ─────────────────────────────────────────────────────────────────────────────
  
  // Complexity: O(N*M) — nested iteration detected
  private parseErrors(output: string): ErrorDetail[] {
    const regex = /(.+\.ts)\((\d+),(\d+)\): error (TS\d+): (.+)/g;
    const errors: ErrorDetail[] = [];
    let match;
    
    while ((match = regex.exec(output)) !== null) {
      errors.push({
        file: path.resolve(match[1]),
        line: parseInt(match[2]),
        column: parseInt(match[3]),
        code: match[4],
        message: match[5].trim(),
      });
    }
    
    // Print error summary by type
    if (this.config.verbose && errors.length > 0) {
      const byCode = new Map<string, number>();
      errors.forEach(e => {
        byCode.set(e.code, (byCode.get(e.code) || 0) + 1);
      });
      
      // Complexity: O(N) — linear iteration
      log('\n   Error breakdown:', 'blue');
      for (const [code, count] of byCode) {
        const hasStrategy = fixStrategies[code] ? '✓' : '✗';
        // Complexity: O(1)
        log(`   ${hasStrategy} ${code}: ${count} errors`, hasStrategy === '✓' ? 'green' : 'red');
      }
    }
    
    return errors;
  }
  
  // ─────────────────────────────────────────────────────────────────────────────
  // 📁 GROUP ERRORS BY FILE
  // ─────────────────────────────────────────────────────────────────────────────
  
  // Complexity: O(N) — linear iteration
  private groupErrorsByFile(errors: ErrorDetail[]): Map<string, ErrorDetail[]> {
    const grouped = new Map<string, ErrorDetail[]>();
    
    for (const error of errors) {
      const existing = grouped.get(error.file) || [];
      existing.push(error);
      grouped.set(error.file, existing);
    }
    
    return grouped;
  }
  
  // ─────────────────────────────────────────────────────────────────────────────
  // 🩹 SURGEON - Apply fixes to a file
  // ─────────────────────────────────────────────────────────────────────────────
  
  // Complexity: O(N log N) — sort operation
  private async fixFile(filePath: string, errors: ErrorDetail[]): Promise<FixResult> {
    const fileName = path.basename(filePath);
    // Complexity: O(1)
    log(`\n🩹 Operating on: ${fileName} (${errors.length} errors)`, 'cyan');
    
    if (!fs.existsSync(filePath)) {
      // Complexity: O(1)
      log(`   ❌ File not found: ${filePath}`, 'red');
      return { file: filePath, success: false, errorsFixed: 0, errorsBefore: errors.length, errorsAfter: errors.length };
    }
    
    // Read file content
    let content = fs.readFileSync(filePath, 'utf8');
    let lines = content.split('\n');
    
    // Create backup
    if (this.config.createBackups) {
      const backupPath = `${filePath}.bak`;
      fs.writeFileSync(backupPath, content);
    }
    
    // Sort errors by line number DESCENDING (fix from bottom to top to preserve line numbers)
    errors.sort((a, b) => b.line - a.line);
    
    let fixed = 0;
    let failed = 0;
    
    for (const error of errors) {
      const strategy = fixStrategies[error.code];
      
      if (strategy) {
        try {
          const result = strategy(error, [...lines]);
          
          if (result.fixed) {
            lines = result.lines;
            fixed++;
            this.stats.errorsFixed++;
            // Complexity: O(1)
            log(`   ✅ [${error.code}] Line ${error.line}: ${result.description}`, 'green');
          } else {
            failed++;
            this.stats.errorsFailed++;
            if (this.config.verbose) {
              // Complexity: O(1)
              log(`   ⚠️  [${error.code}] Line ${error.line}: ${result.description}`, 'yellow');
            }
          }
        } catch (e) {
          failed++;
          this.stats.errorsFailed++;
          // Complexity: O(1)
          log(`   ❌ [${error.code}] Line ${error.line}: Fix threw error`, 'red');
        }
      } else {
        failed++;
        this.stats.errorsFailed++;
        if (this.config.verbose) {
          // Complexity: O(1)
          log(`   ❓ [${error.code}] Line ${error.line}: No fix strategy available`, 'yellow');
        }
      }
    }
    
    // Write fixed content
    if (fixed > 0 && !this.config.dryRun) {
      fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
      // Complexity: O(1)
      log(`   💾 Saved ${fileName} (${fixed} fixes applied)`, 'blue');
    }
    
    this.stats.filesProcessed++;
    
    return {
      file: filePath,
      success: fixed > 0,
      errorsFixed: fixed,
      errorsBefore: errors.length,
      errorsAfter: failed,
    };
  }
  
  // ─────────────────────────────────────────────────────────────────────────────
  // 🎉 SUCCESS OUTPUT
  // ─────────────────────────────────────────────────────────────────────────────
  
  // Complexity: O(1)
  private printSuccess(): void {
    console.log();
    // Complexity: O(1)
    logBox('🎉 SURGERY COMPLETE - PATIENT IS HEALTHY!', [
      '',
      `   Total iterations: ${this.stats.iterations}`,
      `   Files processed:  ${this.stats.filesProcessed}`,
      `   Errors found:     ${this.stats.errorsFound}`,
      `   Errors fixed:     ${this.stats.errorsFixed}`,
      '',
      '   🏆 The codebase is now compiling successfully!',
      '',
    ]);
    
    // Complexity: O(1)
    log('\n   Run `npm run build` to verify.\n', 'green');
  }
  
  // ─────────────────────────────────────────────────────────────────────────────
  // ⚠️ REMAINING ERRORS OUTPUT
  // ─────────────────────────────────────────────────────────────────────────────
  
  // Complexity: O(N) — linear iteration
  private printRemaining(errors: ErrorDetail[]): void {
    console.log();
    // Complexity: O(1)
    logBox('⚠️ SURGERY INCOMPLETE - MANUAL INTERVENTION REQUIRED', [
      '',
      `   Total iterations: ${this.stats.iterations}`,
      `   Files processed:  ${this.stats.filesProcessed}`,
      `   Errors fixed:     ${this.stats.errorsFixed}`,
      `   Errors remaining: ${errors.length}`,
      '',
    ]);
    
    // Complexity: O(N) — linear iteration
    log('\n   Remaining errors:\n', 'yellow');
    
    const byFile = this.groupErrorsByFile(errors);
    for (const [file, fileErrors] of byFile) {
      // Complexity: O(1)
      log(`   📄 ${path.basename(file)}:`, 'cyan');
      fileErrors.forEach(e => {
        // Complexity: O(1)
        log(`      Line ${e.line} [${e.code}]: ${e.message.substring(0, 60)}...`, 'red');
      });
    }
    
    console.log();
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🚀 MAIN EXECUTION
// ═══════════════════════════════════════════════════════════════════════════════

const args = process.argv.slice(2);
const config: Partial<SurgeonConfig> = {
  dryRun: args.includes('--dry-run'),
  verbose: !args.includes('--quiet'),
  maxRetries: args.includes('--max-retries') ? parseInt(args[args.indexOf('--max-retries') + 1]) : 5,
};

const surgeon = new QAntumSurgeon(config);
surgeon.run().catch(console.error);
