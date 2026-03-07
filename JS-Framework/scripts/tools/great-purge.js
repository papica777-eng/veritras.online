/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ⚛️ THE GREAT PURGE - Console to Logger Migration
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * ФАЗА 5: ATOMIC DEPLOYMENT
 * 
 * Замяна на всички console.log/warn/error с професионален logger
 * от src/api/unified/utils/logger.ts
 * 
 * Features:
 * - Intelligent context-aware replacement
 * - Preserves log arguments
 * - Auto-adds import statements
 * - Dry Run + Execute modes
 * - Full verification pipeline
 * 
 * Usage:
 *   node tools/great-purge.js --dry-run     Preview changes
 *   node tools/great-purge.js --execute     Apply The Great Purge
 * 
 * @author dp | QAntum Labs
 * @version 1.0.0
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

const CONFIG = {
    projectRoot: path.resolve(__dirname, '..'),
    srcDir: 'src',
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    ignoreDirs: ['node_modules', 'dist', '.git', 'coverage', 'logs', 'tools'],
    ignoreFiles: ['logger.ts', 'great-purge.js', 'mass-refactor.js'],
    backupDir: '.purge-backup',
    
    // Logger import path (relative from src root)
    loggerImport: `import { logger } from '@/api/unified/utils/logger';`,
    loggerImportAlt: `import { logger } from '../api/unified/utils/logger';`,
    
    // Mapping: console method → logger method
    methodMap: {
        'console.log': 'logger.debug',
        'console.info': 'logger.info',
        'console.warn': 'logger.warn',
        'console.error': 'logger.error',
        'console.debug': 'logger.debug',
        'console.trace': 'logger.trace'
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
// COLORS & LOGGING
// ═══════════════════════════════════════════════════════════════════════════════

const c = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function printBanner() {
    console.log(`
${c.red}████████╗██╗  ██╗███████╗     ██████╗ ██████╗ ███████╗ █████╗ ████████╗
╚══██╔══╝██║  ██║██╔════╝    ██╔════╝ ██╔══██╗██╔════╝██╔══██╗╚══██╔══╝
   ██║   ███████║█████╗      ██║  ███╗██████╔╝█████╗  ███████║   ██║   
   ██║   ██╔══██║██╔══╝      ██║   ██║██╔══██╗██╔══╝  ██╔══██║   ██║   
   ██║   ██║  ██║███████╗    ╚██████╔╝██║  ██║███████╗██║  ██║   ██║   
   ╚═╝   ╚═╝  ╚═╝╚══════╝     ╚═════╝ ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝   ╚═╝   
                                                                        
${c.yellow}██████╗ ██╗   ██╗██████╗  ██████╗ ███████╗${c.reset}
${c.yellow}██╔══██╗██║   ██║██╔══██╗██╔════╝ ██╔════╝${c.reset}
${c.yellow}██████╔╝██║   ██║██████╔╝██║  ███╗█████╗  ${c.reset}
${c.yellow}██╔═══╝ ██║   ██║██╔══██╗██║   ██║██╔══╝  ${c.reset}
${c.yellow}██║     ╚██████╔╝██║  ██║╚██████╔╝███████╗${c.reset}
${c.yellow}╚═╝      ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚══════╝${c.reset}

        ${c.bright}⚛️ Console → Logger Migration v1.0.0 ⚛️${c.reset}
                 ${c.dim}[ dp ] qantum labs${c.reset}
`);
}

const log = {
    info: (msg) => console.log(`${c.cyan}ℹ${c.reset} ${msg}`),
    success: (msg) => console.log(`${c.green}✓${c.reset} ${msg}`),
    warning: (msg) => console.log(`${c.yellow}⚠${c.reset} ${msg}`),
    error: (msg) => console.log(`${c.red}✗${c.reset} ${msg}`),
    file: (msg) => console.log(`${c.dim}  ${msg}${c.reset}`),
    header: (msg) => console.log(`\n${c.bright}${c.cyan}${msg}${c.reset}\n`),
    phase: (num, name) => console.log(`\n${c.magenta}═══ PHASE ${num}: ${name} ═══${c.reset}\n`)
};

// ═══════════════════════════════════════════════════════════════════════════════
// FILE UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════

function getAllFiles(dir, extensions, ignoreDirs, ignoreFiles) {
    const files = [];
    
    function scan(currentDir) {
        const entries = fs.readdirSync(currentDir, { withFileTypes: true });
        
        for (const entry of entries) {
            const fullPath = path.join(currentDir, entry.name);
            
            if (entry.isDirectory()) {
                if (!ignoreDirs.includes(entry.name)) {
                    scan(fullPath);
                }
            } else if (entry.isFile()) {
                const ext = path.extname(entry.name);
                if (extensions.includes(ext) && !ignoreFiles.includes(entry.name)) {
                    files.push(fullPath);
                }
            }
        }
    }
    
    scan(dir);
    return files;
}

function createBackup(files, backupDir) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(CONFIG.projectRoot, backupDir, timestamp);
    
    fs.mkdirSync(backupPath, { recursive: true });
    
    let count = 0;
    for (const file of files) {
        const relativePath = path.relative(CONFIG.projectRoot, file);
        const backupFile = path.join(backupPath, relativePath);
        fs.mkdirSync(path.dirname(backupFile), { recursive: true });
        fs.copyFileSync(file, backupFile);
        count++;
    }
    
    log.success(`Backup created: ${backupPath} (${count} files)`);
    return backupPath;
}

// ═══════════════════════════════════════════════════════════════════════════════
// THE GREAT PURGE ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

class GreatPurge {
    constructor(options = {}) {
        this.options = {
            dryRun: options.dryRun ?? true,
            backup: options.backup ?? true,
            verify: options.verify ?? true,
            verbose: options.verbose ?? false,
            ...options
        };
        
        this.stats = {
            filesScanned: 0,
            filesMatched: 0,
            filesModified: 0,
            importsAdded: 0,
            replacements: {
                'console.log': 0,
                'console.info': 0,
                'console.warn': 0,
                'console.error': 0,
                'console.debug': 0,
                'console.trace': 0
            },
            totalReplacements: 0,
            errors: 0
        };
        
        this.filesToModify = [];
    }
    
    /**
     * PHASE 1: Deep Introspection - Scan all files
     */
    scanPhase() {
        log.phase(1, 'DEEP INTROSPECTION');
        
        const srcPath = path.join(CONFIG.projectRoot, CONFIG.srcDir);
        const files = getAllFiles(srcPath, CONFIG.extensions, CONFIG.ignoreDirs, CONFIG.ignoreFiles);
        
        log.info(`Found ${files.length} source files to analyze`);
        
        for (const file of files) {
            this.stats.filesScanned++;
            const analysis = this.analyzeFile(file);
            
            if (analysis.hasConsole) {
                this.stats.filesMatched++;
                this.filesToModify.push({
                    path: file,
                    ...analysis
                });
            }
        }
        
        return this;
    }
    
    /**
     * Analyze a single file for console usage
     */
    analyzeFile(filePath) {
        const content = fs.readFileSync(filePath, 'utf8');
        const result = {
            hasConsole: false,
            hasLoggerImport: false,
            counts: {},
            totalMatches: 0
        };
        
        // Check for existing logger import
        result.hasLoggerImport = /import\s*{[^}]*logger[^}]*}\s*from/.test(content);
        
        // Count each console method
        for (const method of Object.keys(CONFIG.methodMap)) {
            const regex = new RegExp(method.replace('.', '\\.') + '\\s*\\(', 'g');
            const matches = content.match(regex);
            const count = matches ? matches.length : 0;
            
            if (count > 0) {
                result.hasConsole = true;
                result.counts[method] = count;
                result.totalMatches += count;
            }
        }
        
        return result;
    }
    
    /**
     * PHASE 2: Report findings
     */
    reportPhase() {
        log.phase(2, 'DRIFT ANALYSIS REPORT');
        
        console.log(`   ${c.bright}Files Scanned:${c.reset}    ${this.stats.filesScanned}`);
        console.log(`   ${c.bright}Files with Console:${c.reset} ${this.stats.filesMatched}`);
        console.log('');
        
        // Total by method
        let grandTotal = 0;
        console.log(`   ${c.bright}Console Method Breakdown:${c.reset}`);
        
        for (const file of this.filesToModify) {
            for (const [method, count] of Object.entries(file.counts)) {
                this.stats.replacements[method] += count;
                grandTotal += count;
            }
        }
        
        for (const [method, count] of Object.entries(this.stats.replacements)) {
            if (count > 0) {
                const replacement = CONFIG.methodMap[method];
                console.log(`   ${c.yellow}${method}${c.reset} → ${c.green}${replacement}${c.reset}: ${count}`);
            }
        }
        
        this.stats.totalReplacements = grandTotal;
        console.log(`\n   ${c.bright}Total Replacements:${c.reset} ${c.cyan}${grandTotal}${c.reset}`);
        
        if (this.options.verbose) {
            console.log(`\n   ${c.bright}Files to modify:${c.reset}`);
            for (const file of this.filesToModify) {
                const relPath = path.relative(CONFIG.projectRoot, file.path);
                const importFlag = file.hasLoggerImport ? '' : ' [+import]';
                console.log(`   ${c.dim}${relPath} (${file.totalMatches})${importFlag}${c.reset}`);
            }
        }
        
        return this;
    }
    
    /**
     * PHASE 3: Create backup
     */
    backupPhase() {
        if (!this.options.backup || this.options.dryRun) return this;
        
        log.phase(3, 'SANDBOX PREPARATION');
        
        const filesToBackup = this.filesToModify.map(f => f.path);
        createBackup(filesToBackup, CONFIG.backupDir);
        
        return this;
    }
    
    /**
     * PHASE 4: Execute The Great Purge
     */
    executePhase() {
        if (this.options.dryRun) {
            log.phase(4, 'DRY RUN MODE');
            log.warning('No files will be modified');
            log.info('Use --execute to apply The Great Purge');
            return this;
        }
        
        log.phase(4, 'ATOMIC DEPLOYMENT');
        
        for (const file of this.filesToModify) {
            try {
                let content = fs.readFileSync(file.path, 'utf8');
                let modified = false;
                
                // Step 1: Add logger import if needed
                if (!file.hasLoggerImport) {
                    content = this.addLoggerImport(content, file.path);
                    this.stats.importsAdded++;
                    modified = true;
                }
                
                // Step 2: Replace all console.X with logger.X
                for (const [consoleMethod, loggerMethod] of Object.entries(CONFIG.methodMap)) {
                    const regex = new RegExp(consoleMethod.replace('.', '\\.') + '(\\s*\\()', 'g');
                    if (regex.test(content)) {
                        content = content.replace(regex, loggerMethod + '$1');
                        modified = true;
                    }
                }
                
                if (modified) {
                    fs.writeFileSync(file.path, content, 'utf8');
                    this.stats.filesModified++;
                    
                    const relPath = path.relative(CONFIG.projectRoot, file.path);
                    log.success(`Purged: ${relPath} (${file.totalMatches} replacements)`);
                }
                
            } catch (err) {
                this.stats.errors++;
                log.error(`Failed: ${file.path} - ${err.message}`);
            }
        }
        
        return this;
    }
    
    /**
     * Add logger import to file
     */
    addLoggerImport(content, filePath) {
        // Calculate relative path to logger
        const fileDir = path.dirname(filePath);
        const loggerPath = path.join(CONFIG.projectRoot, CONFIG.srcDir, 'api/unified/utils/logger');
        let relativePath = path.relative(fileDir, loggerPath).replace(/\\/g, '/');
        
        if (!relativePath.startsWith('.')) {
            relativePath = './' + relativePath;
        }
        
        const importStatement = `import { logger } from '${relativePath}';\n`;
        
        // Find the best place to add import
        // After existing imports, or at the top after any comments/header
        
        const importMatch = content.match(/^((?:import\s+.*?;\s*\n)+)/m);
        if (importMatch) {
            // Add after last import
            const lastImport = importMatch[0];
            return content.replace(lastImport, lastImport + importStatement);
        }
        
        // Add at the beginning (after any leading comments)
        const headerMatch = content.match(/^((?:\/\*[\s\S]*?\*\/\s*\n?|\/\/.*\n)*)/);
        if (headerMatch && headerMatch[0]) {
            return headerMatch[0] + importStatement + '\n' + content.slice(headerMatch[0].length);
        }
        
        return importStatement + '\n' + content;
    }
    
    /**
     * PHASE 5: Verification
     */
    verifyPhase() {
        if (!this.options.verify || this.options.dryRun) return this;
        
        log.phase(5, 'INTEGRITY VERIFICATION');
        
        // TypeScript Check
        log.info('Running TypeScript compilation check...');
        try {
            execSync('npx tsc --noEmit', { 
                cwd: CONFIG.projectRoot, 
                stdio: 'pipe',
                timeout: 120000
            });
            log.success('TypeScript: 0 errors ✓');
        } catch (err) {
            const output = err.stdout?.toString() || err.stderr?.toString() || err.message;
            log.error('TypeScript check found issues:');
            console.log(c.dim + output.slice(0, 1000) + c.reset);
            this.stats.errors++;
        }
        
        return this;
    }
    
    /**
     * PHASE 6: Summary
     */
    summaryPhase() {
        log.phase(6, 'EVOLUTIONARY MEMORY');
        
        console.log(`
   ${c.bright}═══════════════════════════════════════════════${c.reset}
   ${c.green}THE GREAT PURGE COMPLETE${c.reset}
   ${c.bright}═══════════════════════════════════════════════${c.reset}

   Files Scanned:     ${this.stats.filesScanned}
   Files Modified:    ${c.green}${this.stats.filesModified}${c.reset}
   Imports Added:     ${c.cyan}${this.stats.importsAdded}${c.reset}
   Total Replacements: ${c.yellow}${this.stats.totalReplacements}${c.reset}
   Errors:            ${this.stats.errors > 0 ? c.red + this.stats.errors + c.reset : c.green + '0' + c.reset}
   
   ${c.dim}[ dp ] qantum labs © 2025${c.reset}
`);
        
        // Save to legacy memory
        if (!this.options.dryRun && this.stats.filesModified > 0) {
            this.saveToLegacy();
        }
        
        return this;
    }
    
    /**
     * Save results to legacy memory
     */
    saveToLegacy() {
        const legacyPath = path.join(CONFIG.projectRoot, 'QANTUM-LEGACY.json');
        let legacy = {};
        
        try {
            if (fs.existsSync(legacyPath)) {
                legacy = JSON.parse(fs.readFileSync(legacyPath, 'utf8'));
            }
        } catch (e) {
            legacy = {};
        }
        
        if (!legacy.refactorHistory) legacy.refactorHistory = [];
        
        legacy.refactorHistory.push({
            operation: 'THE_GREAT_PURGE',
            timestamp: new Date().toISOString(),
            filesModified: this.stats.filesModified,
            replacements: this.stats.totalReplacements,
            importsAdded: this.stats.importsAdded,
            errors: this.stats.errors,
            description: 'Mass migration of console.log to professional logger'
        });
        
        fs.writeFileSync(legacyPath, JSON.stringify(legacy, null, 2));
        log.success('Results saved to QANTUM-LEGACY.json');
    }
    
    /**
     * Run full pipeline
     */
    run() {
        return this
            .scanPhase()
            .reportPhase()
            .backupPhase()
            .executePhase()
            .verifyPhase()
            .summaryPhase();
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// CLI
// ═══════════════════════════════════════════════════════════════════════════════

function main() {
    const args = process.argv.slice(2);
    
    const options = {
        dryRun: !args.includes('--execute'),
        backup: !args.includes('--no-backup'),
        verify: !args.includes('--no-verify'),
        verbose: args.includes('--verbose') || args.includes('-v')
    };
    
    if (args.includes('--help') || args.includes('-h')) {
        console.log(`
${c.bright}THE GREAT PURGE${c.reset} - Console to Logger Migration

${c.bright}USAGE:${c.reset}
  node tools/great-purge.js [options]

${c.bright}OPTIONS:${c.reset}
  --dry-run       Preview changes (default)
  --execute       Apply The Great Purge
  --verbose, -v   Show detailed file list
  --no-backup     Skip backup creation
  --no-verify     Skip TypeScript verification
  --help, -h      Show this help

${c.bright}EXAMPLES:${c.reset}
  node tools/great-purge.js                  # Preview mode
  node tools/great-purge.js --execute        # Apply changes
  node tools/great-purge.js --execute -v     # Apply with details
`);
        return;
    }
    
    printBanner();
    
    console.log(`   ${c.bright}Mode:${c.reset} ${options.dryRun ? '👁️  DRY RUN (Preview)' : '🔥 EXECUTE (Apply Changes)'}`);
    console.log(`   ${c.bright}Backup:${c.reset} ${options.backup ? 'Enabled' : 'Disabled'}`);
    console.log(`   ${c.bright}Verify:${c.reset} ${options.verify ? 'Enabled' : 'Disabled'}`);
    
    const purge = new GreatPurge(options);
    purge.run();
}

main();
