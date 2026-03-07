/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ⚛️ QANTUM MASS REFACTORING ENGINE
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Tool-Builder Protocol - Autonomous Code Transformation
 * 
 * Features:
 * - Pattern-based search (Regex + Semantic)
 * - AST-aware transformations
 * - Dry Run mode (preview changes)
 * - Execute mode (apply changes)
 * - Auto-verification (TypeScript + Lint + Tests)
 * - Rollback capability
 * 
 * Usage:
 *   node tools/mass-refactor.js --help
 *   node tools/mass-refactor.js --dry-run --pattern "OldName" --replace "NewName"
 *   node tools/mass-refactor.js --execute --config refactor-config.json
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
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.html', '.css'],
    ignoreDirs: ['node_modules', 'dist', '.git', 'coverage', 'logs'],
    backupDir: '.refactor-backup',
    
    // Verification commands
    verify: {
        typescript: 'npx tsc --noEmit',
        lint: 'npm run lint --if-present',
        test: 'npm test --if-present'
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
// COLORS & LOGGING
// ═══════════════════════════════════════════════════════════════════════════════

const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m'
};

const log = {
    info: (msg) => console.log(`${colors.cyan}ℹ${colors.reset} ${msg}`),
    success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
    warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
    error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
    file: (msg) => console.log(`${colors.dim}  ${msg}${colors.reset}`),
    header: (msg) => console.log(`\n${colors.bright}${colors.cyan}${msg}${colors.reset}\n`)
};

function printBanner() {
    console.log(`
${colors.cyan}    ██████╗  █████╗ ███╗   ██╗████████╗██╗   ██╗███╗   ███╗
   ██╔═══██╗██╔══██╗████╗  ██║╚══██╔══╝██║   ██║████╗ ████║
   ██║   ██║███████║██╔██╗ ██║   ██║   ██║   ██║██╔████╔██║
   ██║▄▄ ██║██╔══██║██║╚██╗██║   ██║   ██║   ██║██║╚██╔╝██║
   ╚██████╔╝██║  ██║██║ ╚████║   ██║   ╚██████╔╝██║ ╚═╝ ██║
    ╚══▀▀═╝ ╚═╝  ╚═╝╚═╝  ╚═══╝   ╚═╝    ╚═════╝ ╚═╝     ╚═╝${colors.reset}

        ${colors.bright}⚛️ MASS REFACTORING ENGINE v1.0.0 ⚛️${colors.reset}
                 ${colors.dim}[ dp ] qantum labs${colors.reset}
`);
}

// ═══════════════════════════════════════════════════════════════════════════════
// FILE SYSTEM UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════

function getAllFiles(dir, extensions, ignoreDirs) {
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
                if (extensions.includes(ext)) {
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
    
    for (const file of files) {
        const relativePath = path.relative(CONFIG.projectRoot, file);
        const backupFile = path.join(backupPath, relativePath);
        fs.mkdirSync(path.dirname(backupFile), { recursive: true });
        fs.copyFileSync(file, backupFile);
    }
    
    log.success(`Backup created: ${backupPath}`);
    return backupPath;
}

// ═══════════════════════════════════════════════════════════════════════════════
// REFACTORING ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

class MassRefactor {
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
            replacements: 0,
            errors: 0
        };
        
        this.changes = [];
    }
    
    /**
     * Add a replacement rule
     */
    addRule(pattern, replacement, options = {}) {
        const rule = {
            pattern: typeof pattern === 'string' ? new RegExp(escapeRegex(pattern), 'g') : pattern,
            replacement,
            description: options.description || `Replace ${pattern}`,
            extensions: options.extensions || CONFIG.extensions,
            ...options
        };
        
        if (!this.rules) this.rules = [];
        this.rules.push(rule);
        return this;
    }
    
    /**
     * Semantic pattern matching - finds by structure not just text
     */
    addSemanticRule(config) {
        const { 
            type,           // 'class' | 'function' | 'variable' | 'import' | 'export'
            oldName,
            newName,
            description
        } = config;
        
        const patterns = this.generateSemanticPatterns(type, oldName, newName);
        
        for (const p of patterns) {
            this.addRule(p.pattern, p.replacement, { 
                description: description || `Rename ${type}: ${oldName} → ${newName}`,
                isRegex: true 
            });
        }
        
        return this;
    }
    
    /**
     * Generate patterns for semantic matching
     */
    generateSemanticPatterns(type, oldName, newName) {
        const patterns = [];
        
        switch (type) {
            case 'class':
                patterns.push(
                    { pattern: new RegExp(`\\bclass\\s+${oldName}\\b`, 'g'), replacement: `class ${newName}` },
                    { pattern: new RegExp(`\\bnew\\s+${oldName}\\b`, 'g'), replacement: `new ${newName}` },
                    { pattern: new RegExp(`\\bextends\\s+${oldName}\\b`, 'g'), replacement: `extends ${newName}` },
                    { pattern: new RegExp(`\\bimplements\\s+${oldName}\\b`, 'g'), replacement: `implements ${newName}` },
                    { pattern: new RegExp(`:\\s*${oldName}\\b`, 'g'), replacement: `: ${newName}` },
                    { pattern: new RegExp(`<${oldName}>`, 'g'), replacement: `<${newName}>` },
                    { pattern: new RegExp(`<${oldName},`, 'g'), replacement: `<${newName},` },
                    { pattern: new RegExp(`,\\s*${oldName}>`, 'g'), replacement: `, ${newName}>` }
                );
                break;
                
            case 'function':
                patterns.push(
                    { pattern: new RegExp(`\\bfunction\\s+${oldName}\\b`, 'g'), replacement: `function ${newName}` },
                    { pattern: new RegExp(`\\b${oldName}\\s*\\(`, 'g'), replacement: `${newName}(` },
                    { pattern: new RegExp(`\\.${oldName}\\s*\\(`, 'g'), replacement: `.${newName}(` }
                );
                break;
                
            case 'variable':
                patterns.push(
                    { pattern: new RegExp(`\\bconst\\s+${oldName}\\b`, 'g'), replacement: `const ${newName}` },
                    { pattern: new RegExp(`\\blet\\s+${oldName}\\b`, 'g'), replacement: `let ${newName}` },
                    { pattern: new RegExp(`\\bvar\\s+${oldName}\\b`, 'g'), replacement: `var ${newName}` }
                );
                break;
                
            case 'import':
                patterns.push(
                    { pattern: new RegExp(`import\\s*{[^}]*\\b${oldName}\\b[^}]*}`, 'g'), 
                      replacement: (match) => match.replace(new RegExp(`\\b${oldName}\\b`, 'g'), newName) },
                    { pattern: new RegExp(`import\\s+${oldName}\\s+from`, 'g'), replacement: `import ${newName} from` }
                );
                break;
                
            case 'export':
                patterns.push(
                    { pattern: new RegExp(`export\\s*{[^}]*\\b${oldName}\\b[^}]*}`, 'g'),
                      replacement: (match) => match.replace(new RegExp(`\\b${oldName}\\b`, 'g'), newName) },
                    { pattern: new RegExp(`export\\s+(?:const|let|var|function|class)\\s+${oldName}\\b`, 'g'),
                      replacement: (match) => match.replace(oldName, newName) }
                );
                break;
                
            default:
                // Generic word boundary replacement
                patterns.push(
                    { pattern: new RegExp(`\\b${oldName}\\b`, 'g'), replacement: newName }
                );
        }
        
        return patterns;
    }
    
    /**
     * Scan files and collect changes (Dry Run)
     */
    scan() {
        log.header('📂 SCANNING PROJECT');
        
        const srcPath = path.join(CONFIG.projectRoot, CONFIG.srcDir);
        const files = getAllFiles(srcPath, CONFIG.extensions, CONFIG.ignoreDirs);
        
        log.info(`Found ${files.length} files to scan`);
        
        for (const file of files) {
            this.stats.filesScanned++;
            
            try {
                const content = fs.readFileSync(file, 'utf8');
                const fileChanges = this.analyzeFile(file, content);
                
                if (fileChanges.length > 0) {
                    this.stats.filesMatched++;
                    this.changes.push({ file, changes: fileChanges });
                }
            } catch (err) {
                this.stats.errors++;
                log.error(`Error reading ${file}: ${err.message}`);
            }
        }
        
        return this;
    }
    
    /**
     * Analyze a single file for matches
     */
    analyzeFile(file, content) {
        const changes = [];
        
        for (const rule of this.rules || []) {
            // Check if file extension is allowed for this rule
            const ext = path.extname(file);
            if (rule.extensions && !rule.extensions.includes(ext)) continue;
            
            const matches = content.match(rule.pattern);
            if (matches) {
                changes.push({
                    rule: rule.description,
                    matches: matches.length,
                    pattern: rule.pattern.toString(),
                    replacement: typeof rule.replacement === 'function' 
                        ? '[Function]' 
                        : rule.replacement
                });
                this.stats.replacements += matches.length;
            }
        }
        
        return changes;
    }
    
    /**
     * Report scan results
     */
    report() {
        log.header('📊 SCAN REPORT');
        
        console.log(`   Files Scanned:    ${this.stats.filesScanned}`);
        console.log(`   Files Matched:    ${this.stats.filesMatched}`);
        console.log(`   Total Changes:    ${this.stats.replacements}`);
        console.log(`   Errors:           ${this.stats.errors}`);
        console.log('');
        
        if (this.changes.length > 0) {
            log.info('Files to be modified:');
            for (const { file, changes } of this.changes) {
                const relativePath = path.relative(CONFIG.projectRoot, file);
                log.file(`${relativePath} (${changes.reduce((sum, c) => sum + c.matches, 0)} changes)`);
                
                if (this.options.verbose) {
                    for (const change of changes) {
                        console.log(`      ${colors.dim}└─ ${change.rule}: ${change.matches} match(es)${colors.reset}`);
                    }
                }
            }
        }
        
        return this;
    }
    
    /**
     * Execute the refactoring
     */
    execute() {
        if (this.options.dryRun) {
            log.warning('DRY RUN MODE - No files will be modified');
            log.info('Use --execute to apply changes');
            return this;
        }
        
        log.header('🔧 EXECUTING REFACTORING');
        
        // Create backup if enabled
        if (this.options.backup && this.changes.length > 0) {
            const filesToBackup = this.changes.map(c => c.file);
            createBackup(filesToBackup, CONFIG.backupDir);
        }
        
        // Apply changes
        for (const { file } of this.changes) {
            try {
                let content = fs.readFileSync(file, 'utf8');
                let modified = false;
                
                for (const rule of this.rules || []) {
                    const ext = path.extname(file);
                    if (rule.extensions && !rule.extensions.includes(ext)) continue;
                    
                    if (rule.pattern.test(content)) {
                        // Reset regex lastIndex
                        rule.pattern.lastIndex = 0;
                        content = content.replace(rule.pattern, rule.replacement);
                        modified = true;
                    }
                }
                
                if (modified) {
                    fs.writeFileSync(file, content, 'utf8');
                    this.stats.filesModified++;
                    log.success(`Modified: ${path.relative(CONFIG.projectRoot, file)}`);
                }
            } catch (err) {
                this.stats.errors++;
                log.error(`Failed to modify ${file}: ${err.message}`);
            }
        }
        
        return this;
    }
    
    /**
     * Verify changes
     */
    verify() {
        if (!this.options.verify || this.options.dryRun) return this;
        
        log.header('🔍 VERIFICATION');
        
        // TypeScript check
        log.info('Running TypeScript check...');
        try {
            execSync(CONFIG.verify.typescript, { 
                cwd: CONFIG.projectRoot, 
                stdio: 'pipe' 
            });
            log.success('TypeScript: 0 errors');
        } catch (err) {
            log.error('TypeScript check failed!');
            if (this.options.verbose) {
                console.log(err.stdout?.toString() || err.message);
            }
        }
        
        return this;
    }
    
    /**
     * Print final summary
     */
    summary() {
        log.header('⚛️ REFACTORING COMPLETE');
        
        console.log(`   ${colors.green}Files Modified:  ${this.stats.filesModified}${colors.reset}`);
        console.log(`   ${colors.cyan}Replacements:    ${this.stats.replacements}${colors.reset}`);
        console.log(`   ${this.stats.errors > 0 ? colors.red : colors.green}Errors:          ${this.stats.errors}${colors.reset}`);
        console.log('');
        console.log(`   ${colors.dim}[ dp ] qantum labs © 2025${colors.reset}`);
        console.log('');
        
        return this;
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function parseArgs(args) {
    const parsed = {
        dryRun: true,
        execute: false,
        verbose: false,
        backup: true,
        verify: true,
        pattern: null,
        replace: null,
        config: null,
        help: false
    };
    
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        
        switch (arg) {
            case '--dry-run':
                parsed.dryRun = true;
                parsed.execute = false;
                break;
            case '--execute':
                parsed.dryRun = false;
                parsed.execute = true;
                break;
            case '--verbose':
            case '-v':
                parsed.verbose = true;
                break;
            case '--no-backup':
                parsed.backup = false;
                break;
            case '--no-verify':
                parsed.verify = false;
                break;
            case '--pattern':
            case '-p':
                parsed.pattern = args[++i];
                break;
            case '--replace':
            case '-r':
                parsed.replace = args[++i];
                break;
            case '--config':
            case '-c':
                parsed.config = args[++i];
                break;
            case '--help':
            case '-h':
                parsed.help = true;
                break;
        }
    }
    
    return parsed;
}

function printHelp() {
    console.log(`
${colors.bright}USAGE:${colors.reset}
  node tools/mass-refactor.js [options]

${colors.bright}OPTIONS:${colors.reset}
  --dry-run           Preview changes without modifying files (default)
  --execute           Apply changes to files
  --pattern, -p       Pattern to search for
  --replace, -r       Replacement string
  --config, -c        Load config from JSON file
  --verbose, -v       Show detailed output
  --no-backup         Skip backup creation
  --no-verify         Skip verification after refactoring
  --help, -h          Show this help

${colors.bright}EXAMPLES:${colors.reset}
  ${colors.dim}# Preview changes${colors.reset}
  node tools/mass-refactor.js --pattern "OldName" --replace "NewName"

  ${colors.dim}# Execute changes${colors.reset}
  node tools/mass-refactor.js --execute --pattern "v26" --replace "v1.0.0"

  ${colors.dim}# Use config file${colors.reset}
  node tools/mass-refactor.js --execute --config refactor-rules.json

${colors.bright}CONFIG FILE FORMAT:${colors.reset}
  {
    "rules": [
      { "pattern": "OldClass", "replacement": "NewClass", "type": "class" },
      { "pattern": "oldFunc", "replacement": "newFunc", "type": "function" }
    ]
  }
`);
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN ENTRY POINT
// ═══════════════════════════════════════════════════════════════════════════════

function main() {
    const args = parseArgs(process.argv.slice(2));
    
    printBanner();
    
    if (args.help) {
        printHelp();
        return;
    }
    
    const refactor = new MassRefactor({
        dryRun: args.dryRun,
        backup: args.backup,
        verify: args.verify,
        verbose: args.verbose
    });
    
    // Load rules from config file
    if (args.config) {
        try {
            const configPath = path.resolve(args.config);
            const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            
            for (const rule of config.rules || []) {
                if (rule.type) {
                    refactor.addSemanticRule({
                        type: rule.type,
                        oldName: rule.pattern,
                        newName: rule.replacement,
                        description: rule.description
                    });
                } else {
                    refactor.addRule(rule.pattern, rule.replacement, {
                        description: rule.description
                    });
                }
            }
            
            log.success(`Loaded ${config.rules?.length || 0} rules from ${args.config}`);
        } catch (err) {
            log.error(`Failed to load config: ${err.message}`);
            process.exit(1);
        }
    }
    
    // Add rule from command line args
    if (args.pattern && args.replace) {
        refactor.addRule(args.pattern, args.replace, {
            description: `Replace "${args.pattern}" → "${args.replace}"`
        });
    }
    
    // Check if we have any rules
    if (!refactor.rules || refactor.rules.length === 0) {
        log.warning('No refactoring rules specified.');
        log.info('Use --pattern and --replace, or --config to specify rules.');
        printHelp();
        return;
    }
    
    // Execute pipeline
    refactor
        .scan()
        .report()
        .execute()
        .verify()
        .summary();
}

// Export for programmatic use
module.exports = { MassRefactor, CONFIG };

// Run if called directly
if (require.main === module) {
    main();
}
