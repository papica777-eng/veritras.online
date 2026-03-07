"use strict";
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
const child_process_1 = require("child_process");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
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
function log(msg, color = 'reset') {
    console.log(`${colors[color]}${msg}${colors.reset}`);
}
function logBox(title, content) {
    const width = 75;
    log('╔' + '═'.repeat(width) + '╗', 'cyan');
    log('║  ' + title.padEnd(width - 2) + '║', 'cyan');
    log('╠' + '═'.repeat(width) + '╣', 'cyan');
    content.forEach(line => {
        log('║  ' + line.padEnd(width - 2) + '║', 'cyan');
    });
    log('╚' + '═'.repeat(width) + '╝', 'cyan');
}
// ═══════════════════════════════════════════════════════════════════════════════
// 🔧 FIX STRATEGIES - Pattern-based fixes without external AI
// ═══════════════════════════════════════════════════════════════════════════════
const fixStrategies = {
    // TS2307: Cannot find module
    TS2307: (error, lines) => {
        const line = lines[error.line - 1];
        // Fix common import path issues
        const fixes = [
            [/from ['"]\.\/voice-commander['"]/, "from '../multimodal/voice-commander'", 'voice-commander path'],
            [/from ['"]\.\/thermal-aware-pool['"]/, "from '../enterprise/thermal-aware-pool'", 'thermal-aware-pool path'],
            [/from ['"]\.\/worker-pool['"]/, "from '../bastion/workers/worker-pool'", 'worker-pool path'],
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
                const fixed = line.replace(/\.enqueue\((\w+)\)/, '.enqueue($1 as WorkerTask<unknown, unknown>)');
                if (fixed !== line) {
                    lines[error.line - 1] = fixed;
                    return { fixed: true, lines, description: 'Added WorkerTask type assertion' };
                }
            }
        }
        // positionHint type
        if (error.message.includes('positionHint')) {
            const fixed = line.replace(/positionHint\?: string/, "positionHint?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center'");
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
    config;
    stats = {
        filesProcessed: 0,
        errorsFound: 0,
        errorsFixed: 0,
        errorsFailed: 0,
        iterations: 0,
    };
    constructor(config = {}) {
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
    async run() {
        console.clear();
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
            log(`\n${'═'.repeat(77)}`, 'magenta');
            log(`  🔄 ITERATION ${iteration}/${this.config.maxRetries}`, 'bright');
            log(`${'═'.repeat(77)}`, 'magenta');
            // STEP 1: SCAN
            const errors = this.scanForErrors();
            if (errors.length === 0) {
                this.printSuccess();
                return;
            }
            // Check for progress
            if (errors.length >= previousErrorCount) {
                log(`\n⚠️  No progress made. Errors: ${previousErrorCount} → ${errors.length}`, 'yellow');
                if (iteration > 2) {
                    log('   Remaining errors require manual intervention.', 'yellow');
                    break;
                }
            }
            previousErrorCount = errors.length;
            this.stats.errorsFound = errors.length;
            log(`\n📊 Found ${errors.length} errors`, 'yellow');
            // Group by file
            const errorsByFile = this.groupErrorsByFile(errors);
            // STEP 2: FIX EACH FILE
            for (const [filePath, fileErrors] of errorsByFile) {
                await this.fixFile(filePath, fileErrors);
            }
            log(`\n📈 Iteration ${iteration} complete: ${this.stats.errorsFixed} fixed, ${this.stats.errorsFailed} failed`, 'blue');
        }
        // Final verification
        const remainingErrors = this.scanForErrors();
        if (remainingErrors.length === 0) {
            this.printSuccess();
        }
        else {
            this.printRemaining(remainingErrors);
        }
    }
    // ─────────────────────────────────────────────────────────────────────────────
    // 🔍 SCANNER - Execute tsc and capture errors
    // ─────────────────────────────────────────────────────────────────────────────
    scanForErrors() {
        log('\n🔍 Scanning codebase with TypeScript compiler...', 'cyan');
        try {
            (0, child_process_1.execSync)('npx tsc --noEmit 2>&1', { encoding: 'utf8', stdio: 'pipe' });
            return [];
        }
        catch (err) {
            const output = err.stdout || err.stderr || '';
            return this.parseErrors(output);
        }
    }
    // ─────────────────────────────────────────────────────────────────────────────
    // 📝 PARSER - Extract error details from compiler output
    // ─────────────────────────────────────────────────────────────────────────────
    parseErrors(output) {
        const regex = /(.+\.ts)\((\d+),(\d+)\): error (TS\d+): (.+)/g;
        const errors = [];
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
            const byCode = new Map();
            errors.forEach(e => {
                byCode.set(e.code, (byCode.get(e.code) || 0) + 1);
            });
            log('\n   Error breakdown:', 'blue');
            for (const [code, count] of byCode) {
                const hasStrategy = fixStrategies[code] ? '✓' : '✗';
                log(`   ${hasStrategy} ${code}: ${count} errors`, hasStrategy === '✓' ? 'green' : 'red');
            }
        }
        return errors;
    }
    // ─────────────────────────────────────────────────────────────────────────────
    // 📁 GROUP ERRORS BY FILE
    // ─────────────────────────────────────────────────────────────────────────────
    groupErrorsByFile(errors) {
        const grouped = new Map();
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
    async fixFile(filePath, errors) {
        const fileName = path.basename(filePath);
        log(`\n🩹 Operating on: ${fileName} (${errors.length} errors)`, 'cyan');
        if (!fs.existsSync(filePath)) {
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
                        log(`   ✅ [${error.code}] Line ${error.line}: ${result.description}`, 'green');
                    }
                    else {
                        failed++;
                        this.stats.errorsFailed++;
                        if (this.config.verbose) {
                            log(`   ⚠️  [${error.code}] Line ${error.line}: ${result.description}`, 'yellow');
                        }
                    }
                }
                catch (e) {
                    failed++;
                    this.stats.errorsFailed++;
                    log(`   ❌ [${error.code}] Line ${error.line}: Fix threw error`, 'red');
                }
            }
            else {
                failed++;
                this.stats.errorsFailed++;
                if (this.config.verbose) {
                    log(`   ❓ [${error.code}] Line ${error.line}: No fix strategy available`, 'yellow');
                }
            }
        }
        // Write fixed content
        if (fixed > 0 && !this.config.dryRun) {
            fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
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
    printSuccess() {
        console.log();
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
        log('\n   Run `npm run build` to verify.\n', 'green');
    }
    // ─────────────────────────────────────────────────────────────────────────────
    // ⚠️ REMAINING ERRORS OUTPUT
    // ─────────────────────────────────────────────────────────────────────────────
    printRemaining(errors) {
        console.log();
        logBox('⚠️ SURGERY INCOMPLETE - MANUAL INTERVENTION REQUIRED', [
            '',
            `   Total iterations: ${this.stats.iterations}`,
            `   Files processed:  ${this.stats.filesProcessed}`,
            `   Errors fixed:     ${this.stats.errorsFixed}`,
            `   Errors remaining: ${errors.length}`,
            '',
        ]);
        log('\n   Remaining errors:\n', 'yellow');
        const byFile = this.groupErrorsByFile(errors);
        for (const [file, fileErrors] of byFile) {
            log(`   📄 ${path.basename(file)}:`, 'cyan');
            fileErrors.forEach(e => {
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
const config = {
    dryRun: args.includes('--dry-run'),
    verbose: !args.includes('--quiet'),
    maxRetries: args.includes('--max-retries') ? parseInt(args[args.indexOf('--max-retries') + 1]) : 5,
};
const surgeon = new QAntumSurgeon(config);
surgeon.run().catch(console.error);
