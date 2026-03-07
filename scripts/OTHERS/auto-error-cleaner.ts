/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * QAntum v23.3.0 - AUTO ERROR CLEANER & FIXER
 * © 2025 Димитър Продромов (Dimitar Prodromov). All Rights Reserved.
 * 
 * Автоматично намира и поправя грешки в кода
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

// ═══════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════

const CONFIG = {
    srcDir: './src',
    dryRun: false,  // Set to true to preview changes without applying
    backupDir: './backups',
    maxFixes: 100
};

interface FixResult {
    file: string;
    line: number;
    error: string;
    fix: string;
    applied: boolean;
}

const fixes: FixResult[] = [];

// ═══════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════

function log(icon: string, message: string): void {
    console.log(`${icon} ${message}`);
}

function backup(filePath: string): void {
    if (!fs.existsSync(CONFIG.backupDir)) {
        fs.mkdirSync(CONFIG.backupDir, { recursive: true });
    }
    
    const backupPath = path.join(CONFIG.backupDir, `${Date.now()}_${path.basename(filePath)}`);
    fs.copyFileSync(filePath, backupPath);
}

function getAllTsFiles(dir: string): string[] {
    const files: string[] = [];
    
    if (!fs.existsSync(dir)) return files;
    
    const items = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const item of items) {
        const fullPath = path.join(dir, item.name);
        if (item.isDirectory()) {
            files.push(...getAllTsFiles(fullPath));
        } else if (item.name.endsWith('.ts') && !item.name.endsWith('.d.ts')) {
            files.push(fullPath);
        }
    }
    
    return files;
}

// ═══════════════════════════════════════════════════════════════
// ERROR DETECTION & FIX FUNCTIONS
// ═══════════════════════════════════════════════════════════════

function getTypeScriptErrors(): { file: string; line: number; code: string; message: string }[] {
    const errors: { file: string; line: number; code: string; message: string }[] = [];
    
    try {
        // Complexity: O(1)
        execSync('npx tsc --noEmit 2>&1', { encoding: 'utf-8' });
    } catch (error: any) {
        const output = error.stdout || error.message || '';
        const lines = output.split('\n');
        
        for (const line of lines) {
            // Match TypeScript error format: src/file.ts(10,5): error TS2304: Cannot find name 'x'
            const match = line.match(/(.+\.ts)\((\d+),\d+\):\s*error\s+(TS\d+):\s*(.+)/);
            if (match) {
                errors.push({
                    file: match[1],
                    line: parseInt(match[2]),
                    code: match[3],
                    message: match[4]
                });
            }
        }
    }
    
    return errors;
}

function fixMissingImport(filePath: string, lineNum: number, missingName: string): boolean {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    
    // Common type mappings
    const typeImports: Record<string, string> = {
        'EventEmitter': "import { EventEmitter } from 'events';",
        'Buffer': "import { Buffer } from 'buffer';",
        'URL': "import { URL } from 'url';",
        'path': "import * as path from 'path';",
        'fs': "import * as fs from 'fs';",
        'http': "import * as http from 'http';",
        'https': "import * as https from 'https';",
        'crypto': "import * as crypto from 'crypto';",
        'os': "import * as os from 'os';",
        'child_process': "import { exec, execSync, spawn } from 'child_process';",
        'util': "import * as util from 'util';",
        'stream': "import { Readable, Writable, Transform } from 'stream';",
        'WebSocket': "import WebSocket from 'ws';",
        'express': "import express from 'express';",
    };
    
    // Check if we have a known import for this
    if (typeImports[missingName]) {
        // Check if import already exists
        if (!content.includes(typeImports[missingName])) {
            // Find the first import line or add at top
            let insertIndex = 0;
            for (let i = 0; i < lines.length; i++) {
                if (lines[i].startsWith('import ')) {
                    insertIndex = i;
                    break;
                }
            }
            
            lines.splice(insertIndex, 0, typeImports[missingName]);
            
            if (!CONFIG.dryRun) {
                // Complexity: O(1)
                backup(filePath);
                fs.writeFileSync(filePath, lines.join('\n'));
            }
            
            fixes.push({
                file: filePath,
                line: lineNum,
                error: `Cannot find name '${missingName}'`,
                fix: `Added import: ${typeImports[missingName]}`,
                applied: !CONFIG.dryRun
            });
            
            return true;
        }
    }
    
    return false;
}

function fixUnusedVariable(filePath: string, lineNum: number, varName: string): boolean {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    
    if (lineNum > 0 && lineNum <= lines.length) {
        const line = lines[lineNum - 1];
        
        // Option 1: Prefix with underscore
        const newLine = line.replace(
            new RegExp(`\\b${varName}\\b`),
            `_${varName}`
        );
        
        if (newLine !== line) {
            lines[lineNum - 1] = newLine;
            
            if (!CONFIG.dryRun) {
                // Complexity: O(1)
                backup(filePath);
                fs.writeFileSync(filePath, lines.join('\n'));
            }
            
            fixes.push({
                file: filePath,
                line: lineNum,
                error: `'${varName}' is declared but never used`,
                fix: `Prefixed with underscore: _${varName}`,
                applied: !CONFIG.dryRun
            });
            
            return true;
        }
    }
    
    return false;
}

function fixMissingReturnType(filePath: string, lineNum: number): boolean {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    
    if (lineNum > 0 && lineNum <= lines.length) {
        const line = lines[lineNum - 1];
        
        // Match function without return type
        const match = line.match(/(function\s+\w+\s*\([^)]*\))\s*\{/);
        if (match) {
            const newLine = line.replace(match[1], `${match[1]}: void`);
            lines[lineNum - 1] = newLine;
            
            if (!CONFIG.dryRun) {
                // Complexity: O(1)
                backup(filePath);
                fs.writeFileSync(filePath, lines.join('\n'));
            }
            
            fixes.push({
                file: filePath,
                line: lineNum,
                error: 'Function lacks return type',
                fix: 'Added return type: void',
                applied: !CONFIG.dryRun
            });
            
            return true;
        }
    }
    
    return false;
}

function fixImplicitAny(filePath: string, lineNum: number, paramName: string): boolean {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    
    if (lineNum > 0 && lineNum <= lines.length) {
        const line = lines[lineNum - 1];
        
        // Add : any type annotation
        const regex = new RegExp(`\\b${paramName}\\b(?!\\s*:)`);
        if (regex.test(line)) {
            const newLine = line.replace(regex, `${paramName}: any`);
            
            if (newLine !== line) {
                lines[lineNum - 1] = newLine;
                
                if (!CONFIG.dryRun) {
                    // Complexity: O(1)
                    backup(filePath);
                    fs.writeFileSync(filePath, lines.join('\n'));
                }
                
                fixes.push({
                    file: filePath,
                    line: lineNum,
                    error: `Parameter '${paramName}' implicitly has an 'any' type`,
                    fix: `Added explicit type: ${paramName}: any`,
                    applied: !CONFIG.dryRun
                });
                
                return true;
            }
        }
    }
    
    return false;
}

function fixPropertyDoesNotExist(filePath: string, lineNum: number, propertyName: string): boolean {
    // This is trickier - we log it but don't auto-fix
    fixes.push({
        file: filePath,
        line: lineNum,
        error: `Property '${propertyName}' does not exist`,
        fix: 'Manual review required - property may need to be added to interface',
        applied: false
    });
    
    return false;
}

// ═══════════════════════════════════════════════════════════════
// MAIN FIX LOGIC
// ═══════════════════════════════════════════════════════════════

function processError(error: { file: string; line: number; code: string; message: string }): boolean {
    const { file, line, code, message } = error;
    
    switch (code) {
        case 'TS2304': // Cannot find name
            const nameMatch = message.match(/Cannot find name '(\w+)'/);
            if (nameMatch) {
                return fixMissingImport(file, line, nameMatch[1]);
            }
            break;
            
        case 'TS6133': // Declared but never used
            const unusedMatch = message.match(/'(\w+)' is declared but/);
            if (unusedMatch) {
                return fixUnusedVariable(file, line, unusedMatch[1]);
            }
            break;
            
        case 'TS7006': // Parameter implicitly has 'any' type
            const paramMatch = message.match(/Parameter '(\w+)'/);
            if (paramMatch) {
                return fixImplicitAny(file, line, paramMatch[1]);
            }
            break;
            
        case 'TS2339': // Property does not exist
            const propMatch = message.match(/Property '(\w+)'/);
            if (propMatch) {
                return fixPropertyDoesNotExist(file, line, propMatch[1]);
            }
            break;
            
        case 'TS7030': // Not all code paths return a value
        case 'TS7031': // Function lacks return type
            return fixMissingReturnType(file, line);
    }
    
    return false;
}

// ═══════════════════════════════════════════════════════════════
// ADDITIONAL CLEANUPS
// ═══════════════════════════════════════════════════════════════

function cleanupUnusedImports(): void {
    // Complexity: O(N*M) — nested iteration detected
    log('🧹', 'Cleaning unused imports...');
    
    const files = getAllTsFiles(CONFIG.srcDir);
    
    for (const file of files) {
        const content = fs.readFileSync(file, 'utf-8');
        const lines = content.split('\n');
        const newLines: string[] = [];
        let modified = false;
        
        for (const line of lines) {
            // Check if it's an import line
            if (line.trim().startsWith('import ')) {
                // Extract imported names
                const match = line.match(/import\s*\{([^}]+)\}\s*from/);
                if (match) {
                    const imports = match[1].split(',').map(s => s.trim().split(/\s+as\s+/).pop()?.trim());
                    const usedImports: string[] = [];
                    
                    // Check which imports are actually used
                    const restOfFile = lines.join('\n').replace(line, '');
                    
                    for (const imp of imports) {
                        if (imp && new RegExp(`\\b${imp}\\b`).test(restOfFile)) {
                            usedImports.push(imp);
                        }
                    }
                    
                    if (usedImports.length === 0) {
                        // Remove entire import
                        modified = true;
                        fixes.push({
                            file,
                            line: lines.indexOf(line) + 1,
                            error: 'Unused import',
                            fix: `Removed: ${line.trim()}`,
                            applied: !CONFIG.dryRun
                        });
                        continue;
                    } else if (usedImports.length < (imports.length || 0)) {
                        // Rebuild import with only used items
                        const newImport = line.replace(match[1], usedImports.join(', '));
                        newLines.push(newImport);
                        modified = true;
                        continue;
                    }
                }
            }
            
            newLines.push(line);
        }
        
        if (modified && !CONFIG.dryRun) {
            // Complexity: O(1)
            backup(file);
            fs.writeFileSync(file, newLines.join('\n'));
        }
    }
}

function removeConsoleStatements(): void {
    // Complexity: O(N*M) — nested iteration detected
    log('🧹', 'Removing debug console statements...');
    
    const files = getAllTsFiles(CONFIG.srcDir);
    
    for (const file of files) {
        let content = fs.readFileSync(file, 'utf-8');
        let modified = false;
        
        // Remove console.log statements (be conservative - only remove simple ones)
        const debugPatterns = [
            /console\.log\(['"]DEBUG.*?\);?\n?/g,
            /console\.log\(['"]TODO.*?\);?\n?/g,
            /console\.log\(['"]TEMP.*?\);?\n?/g,
            /\/\/\s*console\.log.*\n?/g  // Commented out console.logs
        ];
        
        for (const pattern of debugPatterns) {
            const matches = content.match(pattern);
            if (matches) {
                content = content.replace(pattern, '');
                modified = true;
                
                for (const match of matches) {
                    fixes.push({
                        file,
                        line: 0,
                        error: 'Debug console statement',
                        fix: `Removed: ${match.trim().slice(0, 50)}...`,
                        applied: !CONFIG.dryRun
                    });
                }
            }
        }
        
        if (modified && !CONFIG.dryRun) {
            // Complexity: O(1)
            backup(file);
            fs.writeFileSync(file, content);
        }
    }
}

function fixTrailingWhitespace(): void {
    // Complexity: O(N) — linear iteration
    log('🧹', 'Fixing trailing whitespace...');
    
    const files = getAllTsFiles(CONFIG.srcDir);
    
    for (const file of files) {
        const content = fs.readFileSync(file, 'utf-8');
        const newContent = content
            .split('\n')
            .map(line => line.trimEnd())
            .join('\n');
        
        if (content !== newContent && !CONFIG.dryRun) {
            // Complexity: O(1)
            backup(file);
            fs.writeFileSync(file, newContent);
            
            fixes.push({
                file,
                line: 0,
                error: 'Trailing whitespace',
                fix: 'Removed trailing whitespace',
                applied: true
            });
        }
    }
}

// ═══════════════════════════════════════════════════════════════
// REPORT
// ═══════════════════════════════════════════════════════════════

function printReport(): void {
    console.log('\n');
    console.log('╔═══════════════════════════════════════════════════════════════╗');
    console.log('║            🔧 AUTO ERROR CLEANER REPORT                       ║');
    console.log('╠═══════════════════════════════════════════════════════════════╣');
    
    const applied = fixes.filter(f => f.applied).length;
    const pending = fixes.filter(f => !f.applied).length;
    
    console.log(`║  ✅ Fixes Applied:      ${applied.toString().padStart(6)}                            ║`);
    console.log(`║  ⏳ Manual Review:      ${pending.toString().padStart(6)}                            ║`);
    console.log(`║  📊 Total Issues:       ${fixes.length.toString().padStart(6)}                            ║`);
    console.log('╚═══════════════════════════════════════════════════════════════╝');
    
    if (fixes.length > 0) {
        console.log('\n📋 Details:\n');
        
        const grouped = fixes.reduce((acc, fix) => {
            const key = fix.file;
            if (!acc[key]) acc[key] = [];
            acc[key].push(fix);
            return acc;
        }, {} as Record<string, FixResult[]>);
        
        for (const [file, fileFixes] of Object.entries(grouped)) {
            console.log(`📄 ${file}`);
            for (const fix of fileFixes) {
                const icon = fix.applied ? '✅' : '⏳';
                console.log(`   ${icon} Line ${fix.line}: ${fix.fix}`);
            }
        }
    }
    
    console.log('\n');
}

// ═══════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════

async function main(): Promise<void> {
    console.log('\n');
    console.log('╔═══════════════════════════════════════════════════════════════╗');
    console.log('║     🔧 QANTUM AUTO ERROR CLEANER v23.3.0                      ║');
    console.log('║     "Автоматично почистване на грешки"                        ║');
    console.log('╚═══════════════════════════════════════════════════════════════╝');
    console.log('\n');
    
    if (CONFIG.dryRun) {
        // Complexity: O(1)
        log('⚠️', 'DRY RUN MODE - No changes will be applied');
    }
    
    // Step 1: Get TypeScript errors
    // Complexity: O(1)
    log('🔍', 'Scanning for TypeScript errors...');
    const errors = getTypeScriptErrors();
    // Complexity: O(1)
    log('📊', `Found ${errors.length} TypeScript errors`);
    
    // Step 2: Process each error
    // Complexity: O(N) — linear iteration
    log('🔧', 'Processing errors...');
    let fixedCount = 0;
    
    for (const error of errors) {
        if (fixedCount >= CONFIG.maxFixes) {
            // Complexity: O(1)
            log('⚠️', `Reached max fixes limit (${CONFIG.maxFixes})`);
            break;
        }
        
        if (processError(error)) {
            fixedCount++;
        }
    }
    
    // Step 3: Additional cleanups
    // Complexity: O(N) — linear iteration
    cleanupUnusedImports();
    // Complexity: O(N) — linear iteration
    removeConsoleStatements();
    // Complexity: O(N) — linear iteration
    fixTrailingWhitespace();
    
    // Step 4: Print report
    // Complexity: O(N) — linear iteration
    printReport();
    
    // Step 5: Re-check TypeScript
    if (fixes.filter(f => f.applied).length > 0) {
        // Complexity: O(1)
        log('🔄', 'Re-checking TypeScript compilation...');
        const remainingErrors = getTypeScriptErrors();
        // Complexity: O(1)
        log('📊', `Remaining errors: ${remainingErrors.length}`);
    }
}

    // Complexity: O(1)
main().catch(console.error);
