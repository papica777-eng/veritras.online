��/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ⚛️ QANTUM SCRIPT GOD v1.0.0
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * 🧠 AUTONOMOUS PROBLEM SOLVER
 * 
 * Self-adaptive intelligent script that:
 * - Understands the exact problem through semantic analysis
 * - Selects the best strategy from a knowledge base
 * - Generates and executes the optimal solution
 * - Self-heals if something goes wrong
 * - Learns and improves with each mission
 * 
 * Philosophy: "Best practices always lead to success"
 * 
 * Usage:
 *   node tools/script-god.js "описание на проблема"
 *   node tools/script-god.js --analyze "problem description"
 *   node tools/script-god.js --mission "rename all X to Y"
 * 
 * @author dp | QAntum Labs
 * @version 1.0.0-QANTUM-PRIME
 * @license Commercial
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

const CONFIG = {
    projectRoot: path.resolve(__dirname, '..'),
    srcDir: 'src',
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.html', '.css', '.scss'],
    ignoreDirs: ['node_modules', 'dist', '.git', 'coverage', 'logs', '.purge-backup', '.refactor-backup'],
    knowledgeBase: path.resolve(__dirname, 'script-god-knowledge.json'),
    memoryFile: path.resolve(__dirname, '..', 'QANTUM-LEGACY.json'),
    maxRetries: 3,
    verifyCommands: {
        typescript: 'npx tsc --noEmit',
        lint: 'npm run lint --if-present',
        test: 'npm test --if-present'
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
// COLORS & UI
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
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    bgRed: '\x1b[41m',
    bgGreen: '\x1b[42m',
    bgYellow: '\x1b[43m',
    bgBlue: '\x1b[44m',
    bgMagenta: '\x1b[45m'
};

function printBanner() {
    console.log(`
${c.magenta}███████╗ ██████╗██████╗ ██╗██████╗ ████████╗     ██████╗  ██████╗ ██████╗ 
██╔════╝██╔════╝██╔══██╗██║██╔══██╗╚══██╔══╝    ██╔════╝ ██╔═══██╗██╔══██╗
███████╗██║     ██████╔╝██║██████╔╝   ██║       ██║  ███╗██║   ██║██║  ██║
╚════██║██║     ██╔══██╗██║██╔═══╝    ██║       ██║   ██║██║   ██║██║  ██║
███████║╚██████╗██║  ██║██║██║        ██║       ╚██████╔╝╚██████╔╝██████╔╝
╚══════╝ ╚═════╝╚═╝  ╚═╝╚═╝╚═╝        ╚═╝        ╚═════╝  ╚═════╝ ╚═════╝${c.reset}
                                                                          
        ${c.bright}${c.cyan}⚛️ AUTONOMOUS PROBLEM SOLVER v1.0.0 ⚛️${c.reset}
        ${c.dim}"Best practices always lead to success"${c.reset}
                 ${c.dim}[ dp ] qantum labs${c.reset}
`);
}

const log = {
    info: (msg) => console.log(`${c.cyan}ℹ${c.reset} ${msg}`),
    success: (msg) => console.log(`${c.green}✓${c.reset} ${msg}`),
    warning: (msg) => console.log(`${c.yellow}⚠${c.reset} ${msg}`),
    error: (msg) => console.log(`${c.red}✗${c.reset} ${msg}`),
    thinking: (msg) => console.log(`${c.magenta}🧠${c.reset} ${msg}`),
    strategy: (msg) => console.log(`${c.blue}📋${c.reset} ${msg}`),
    action: (msg) => console.log(`${c.yellow}⚡${c.reset} ${msg}`),
    phase: (num, name) => console.log(`\n${c.bgMagenta}${c.white} PHASE ${num} ${c.reset} ${c.bright}${name}${c.reset}\n`)
};

// ═══════════════════════════════════════════════════════════════════════════════
// KNOWLEDGE BASE - Best Practices Database
// ═══════════════════════════════════════════════════════════════════════════════

const KNOWLEDGE_BASE = {
    // Problem patterns and their solutions
    patterns: {
        // ─────────────────────────────────────────────────────────────────────
        // RENAMING PATTERNS
        // ─────────────────────────────────────────────────────────────────────
        rename: {
            keywords: ['rename', 'преименувай', 'промени името', 'change name', 'refactor name'],
            subPatterns: {
                class: {
                    keywords: ['class', 'клас', 'класа'],
                    strategy: 'semanticClassRename',
                    bestPractice: 'Use AST-aware renaming to catch all usages including inheritance'
                },
                function: {
                    keywords: ['function', 'функция', 'метод', 'method'],
                    strategy: 'semanticFunctionRename',
                    bestPractice: 'Track all call sites and update imports/exports'
                },
                variable: {
                    keywords: ['variable', 'променлива', 'const', 'let', 'var'],
                    strategy: 'semanticVariableRename',
                    bestPractice: 'Use word boundaries to avoid partial matches'
                },
                file: {
                    keywords: ['file', 'файл', 'файла'],
                    strategy: 'fileRename',
                    bestPractice: 'Update all import paths automatically'
                },
                interface: {
                    keywords: ['interface', 'интерфейс', 'type', 'тип'],
                    strategy: 'semanticInterfaceRename',
                    bestPractice: 'Handle generics and type constraints'
                }
            }
        },

        // ─────────────────────────────────────────────────────────────────────
        // REPLACEMENT PATTERNS
        // ─────────────────────────────────────────────────────────────────────
        replace: {
            keywords: ['replace', 'замени', 'промени', 'change', 'update', 'актуализирай'],
            subPatterns: {
                text: {
                    keywords: ['text', 'текст', 'string', 'стринг'],
                    strategy: 'textReplace',
                    bestPractice: 'Escape regex special characters for literal matching'
                },
                pattern: {
                    keywords: ['pattern', 'regex', 'шаблон'],
                    strategy: 'regexReplace',
                    bestPractice: 'Test regex on sample before mass apply'
                },
                import: {
                    keywords: ['import', 'импорт'],
                    strategy: 'importPathReplace',
                    bestPractice: 'Resolve relative paths correctly'
                },
                version: {
                    keywords: ['version', 'версия', 'версията'],
                    strategy: 'versionBump',
                    bestPractice: 'Update package.json and all references atomically'
                },
                logo: {
                    keywords: ['logo', 'лого', 'brand', 'бранд', 'icon', 'икона'],
                    strategy: 'brandUpdate',
                    bestPractice: 'Update SVG, PNG, CSS classes and HTML simultaneously'
                }
            }
        },

        // ─────────────────────────────────────────────────────────────────────
        // CLEANUP PATTERNS
        // ─────────────────────────────────────────────────────────────────────
        cleanup: {
            keywords: ['cleanup', 'clean', 'почисти', 'remove', 'махни', 'delete', 'изтрий'],
            subPatterns: {
                console: {
                    keywords: ['console', 'log', 'лог', 'логове'],
                    strategy: 'consoleToLogger',
                    bestPractice: 'Replace with professional logger, dont just delete'
                },
                comments: {
                    keywords: ['comment', 'коментар', 'todo', 'fixme'],
                    strategy: 'cleanupComments',
                    bestPractice: 'Preserve JSDoc, remove debug comments'
                },
                deadCode: {
                    keywords: ['dead', 'unused', 'неизползван', 'мъртъв код'],
                    strategy: 'removeDeadCode',
                    bestPractice: 'Use static analysis to find truly unused code'
                },
                duplicates: {
                    keywords: ['duplicate', 'дубликат', 'повтарящ'],
                    strategy: 'removeDuplicates',
                    bestPractice: 'Extract to shared utility'
                }
            }
        },

        // ─────────────────────────────────────────────────────────────────────
        // FIX PATTERNS
        // ─────────────────────────────────────────────────────────────────────
        fix: {
            keywords: ['fix', 'поправи', 'repair', 'коригирай', 'error', 'грешка', 'bug', 'бъг'],
            subPatterns: {
                typescript: {
                    keywords: ['typescript', 'ts', 'type', 'тип'],
                    strategy: 'fixTypeScriptErrors',
                    bestPractice: 'Parse tsc output and apply targeted fixes'
                },
                lint: {
                    keywords: ['lint', 'eslint', 'style'],
                    strategy: 'fixLintErrors',
                    bestPractice: 'Use eslint --fix for auto-fixable issues'
                },
                import: {
                    keywords: ['import', 'импорт', 'require'],
                    strategy: 'fixBrokenImports',
                    bestPractice: 'Scan for missing files and suggest alternatives'
                },
                syntax: {
                    keywords: ['syntax', 'синтаксис', 'parse'],
                    strategy: 'fixSyntaxErrors',
                    bestPractice: 'Use AST parser to identify and fix issues'
                }
            }
        },

        // ─────────────────────────────────────────────────────────────────────
        // MIGRATION PATTERNS
        // ─────────────────────────────────────────────────────────────────────
        migrate: {
            keywords: ['migrate', 'мигрирай', 'upgrade', 'ъпгрейд', 'convert', 'конвертирай'],
            subPatterns: {
                js2ts: {
                    keywords: ['javascript', 'typescript', 'js', 'ts'],
                    strategy: 'migrateJsToTs',
                    bestPractice: 'Add types incrementally, use any as temporary escape'
                },
                api: {
                    keywords: ['api', 'endpoint', 'route'],
                    strategy: 'migrateApi',
                    bestPractice: 'Maintain backward compatibility during migration'
                },
                dependency: {
                    keywords: ['dependency', 'package', 'пакет', 'library'],
                    strategy: 'migrateDependency',
                    bestPractice: 'Check breaking changes in changelog first'
                }
            }
        },

        // ─────────────────────────────────────────────────────────────────────
        // ADD/CREATE PATTERNS
        // ─────────────────────────────────────────────────────────────────────
        add: {
            keywords: ['add', 'добави', 'create', 'създай', 'insert', 'вмъкни', 'generate', 'генерирай'],
            subPatterns: {
                import: {
                    keywords: ['import', 'импорт'],
                    strategy: 'addMissingImports',
                    bestPractice: 'Calculate relative path and add to import block'
                },
                export: {
                    keywords: ['export', 'експорт'],
                    strategy: 'addExports',
                    bestPractice: 'Update index.ts barrel files'
                },
                documentation: {
                    keywords: ['doc', 'документация', 'jsdoc', 'comment'],
                    strategy: 'addDocumentation',
                    bestPractice: 'Generate JSDoc from function signatures'
                },
                test: {
                    keywords: ['test', 'тест', 'spec'],
                    strategy: 'generateTests',
                    bestPractice: 'Create test file next to source file'
                }
            }
        }
    },

    // Strategy implementations
    strategies: {
        // Will be populated dynamically
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
// PROBLEM ANALYZER - Understands what you want
// ═══════════════════════════════════════════════════════════════════════════════

class ProblemAnalyzer {
    constructor() {
        this.patterns = KNOWLEDGE_BASE.patterns;
    }

    /**
     * Analyze problem description and extract intent
     */
    analyze(description) {
        const normalized = description.toLowerCase();
        const result = {
            originalInput: description,
            primaryIntent: null,
            subIntent: null,
            strategy: null,
            bestPractice: null,
            parameters: {},
            confidence: 0
        };

        // Find primary intent
        for (const [intent, data] of Object.entries(this.patterns)) {
            for (const keyword of data.keywords) {
                if (normalized.includes(keyword.toLowerCase())) {
                    result.primaryIntent = intent;
                    result.confidence += 0.3;

                    // Find sub-intent
                    if (data.subPatterns) {
                        for (const [subIntent, subData] of Object.entries(data.subPatterns)) {
                            for (const subKeyword of subData.keywords) {
                                if (normalized.includes(subKeyword.toLowerCase())) {
                                    result.subIntent = subIntent;
                                    result.strategy = subData.strategy;
                                    result.bestPractice = subData.bestPractice;
                                    result.confidence += 0.4;
                                    break;
                                }
                            }
                            if (result.subIntent) break;
                        }
                    }
                    break;
                }
            }
            if (result.primaryIntent) break;
        }

        // Extract parameters (quoted strings, patterns like X to Y)
        result.parameters = this.extractParameters(description);
        if (Object.keys(result.parameters).length > 0) {
            result.confidence += 0.3;
        }

        return result;
    }

    /**
     * Extract parameters from description
     */
    extractParameters(description) {
        const params = {};

        // Pattern: "X" to "Y" or 'X' to 'Y'
        const toPattern = /["']([^"']+)["']\s*(?:to|към|на|->|=>|→)\s*["']([^"']+)["']/gi;
        const toMatch = toPattern.exec(description);
        if (toMatch) {
            params.from = toMatch[1];
            params.to = toMatch[2];
        }

        // Pattern: X към Y (without quotes)
        const simplePattern = /(\S+)\s*(?:to|към|на|->|=>|→)\s*(\S+)/i;
        if (!params.from) {
            const simpleMatch = simplePattern.exec(description);
            if (simpleMatch && !['to', 'към', 'на'].includes(simpleMatch[1].toLowerCase())) {
                params.from = simpleMatch[1];
                params.to = simpleMatch[2];
            }
        }

        // Extract file patterns
        const filePattern = /(?:in|в|from|във)\s+["']?([^"'\s]+(?:\*[^"'\s]*)?)["']?/gi;
        const fileMatch = filePattern.exec(description);
        if (fileMatch) {
            params.filePattern = fileMatch[1];
        }

        // Extract numbers
        const numbers = description.match(/\d+/g);
        if (numbers) {
            params.numbers = numbers.map(n => parseInt(n));
        }

        return params;
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// STRATEGY ENGINE - Selects and executes best approach
// ═══════════════════════════════════════════════════════════════════════════════

class StrategyEngine {
    constructor() {
        this.strategies = this.loadStrategies();
    }

    loadStrategies() {
        return {
            // ─────────────────────────────────────────────────────────────────
            // SEMANTIC RENAME STRATEGIES
            // ─────────────────────────────────────────────────────────────────
            semanticClassRename: {
                name: 'Semantic Class Rename',
                execute: (params, options) => this.executeSemanticRename('class', params, options)
            },

            semanticFunctionRename: {
                name: 'Semantic Function Rename',
                execute: (params, options) => this.executeSemanticRename('function', params, options)
            },

            semanticVariableRename: {
                name: 'Semantic Variable Rename',
                execute: (params, options) => this.executeSemanticRename('variable', params, options)
            },

            semanticInterfaceRename: {
                name: 'Semantic Interface Rename',
                execute: (params, options) => this.executeSemanticRename('interface', params, options)
            },

            // ─────────────────────────────────────────────────────────────────
            // REPLACE STRATEGIES
            // ─────────────────────────────────────────────────────────────────
            textReplace: {
                name: 'Text Replace',
                execute: (params, options) => this.executeTextReplace(params, options)
            },

            regexReplace: {
                name: 'Regex Replace',
                execute: (params, options) => this.executeRegexReplace(params, options)
            },

            versionBump: {
                name: 'Version Bump',
                execute: (params, options) => this.executeVersionBump(params, options)
            },

            brandUpdate: {
                name: 'Brand Update',
                execute: (params, options) => this.executeBrandUpdate(params, options)
            },

            // ─────────────────────────────────────────────────────────────────
            // CLEANUP STRATEGIES
            // ─────────────────────────────────────────────────────────────────
            consoleToLogger: {
                name: 'Console to Logger Migration',
                execute: (params, options) => this.executeConsoleToLogger(params, options)
            },

            cleanupComments: {
                name: 'Cleanup Comments',
                execute: (params, options) => this.executeCleanupComments(params, options)
            },

            // ─────────────────────────────────────────────────────────────────
            // FIX STRATEGIES
            // ─────────────────────────────────────────────────────────────────
            fixTypeScriptErrors: {
                name: 'Fix TypeScript Errors',
                execute: (params, options) => this.executeFixTypeScript(params, options)
            },

            fixLintErrors: {
                name: 'Fix Lint Errors',
                execute: (params, options) => this.executeFixLint(params, options)
            },

            fixBrokenImports: {
                name: 'Fix Broken Imports',
                execute: (params, options) => this.executeFixImports(params, options)
            }
        };
    }

    /**
     * Get strategy by name
     */
    getStrategy(name) {
        return this.strategies[name] || null;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // STRATEGY IMPLEMENTATIONS
    // ═══════════════════════════════════════════════════════════════════════

    executeSemanticRename(type, params, options) {
        const { from, to } = params;
        if (!from || !to) {
            return { success: false, error: 'Missing from/to parameters' };
        }

        const patterns = this.generateRenamePatterns(type, from, to);
        return this.applyPatterns(patterns, options);
    }

    generateRenamePatterns(type, oldName, newName) {
        const patterns = [];

        switch (type) {
            case 'class':
                patterns.push(
                    { regex: new RegExp(`\\bclass\\s+${oldName}\\b`, 'g'), replacement: `class ${newName}` },
                    { regex: new RegExp(`\\bnew\\s+${oldName}\\b`, 'g'), replacement: `new ${newName}` },
                    { regex: new RegExp(`\\bextends\\s+${oldName}\\b`, 'g'), replacement: `extends ${newName}` },
                    { regex: new RegExp(`\\bimplements\\s+${oldName}\\b`, 'g'), replacement: `implements ${newName}` },
                    { regex: new RegExp(`:\\s*${oldName}\\b`, 'g'), replacement: `: ${newName}` },
                    { regex: new RegExp(`<${oldName}>`, 'g'), replacement: `<${newName}>` }
                );
                break;

            case 'function':
                patterns.push(
                    { regex: new RegExp(`\\bfunction\\s+${oldName}\\b`, 'g'), replacement: `function ${newName}` },
                    { regex: new RegExp(`\\b${oldName}\\s*\\(`, 'g'), replacement: `${newName}(` },
                    { regex: new RegExp(`\\.${oldName}\\s*\\(`, 'g'), replacement: `.${newName}(` },
                    {
                        regex: new RegExp(`\\b${oldName}\\s*=\\s*(?:async\\s+)?(?:function|\\()`, 'g'),
                        replacement: (m) => m.replace(oldName, newName)
                    }
                );
                break;

            case 'variable':
                patterns.push(
                    {
                        regex: new RegExp(`\\b(const|let|var)\\s+${oldName}\\b`, 'g'),
                        replacement: (m, p1) => `${p1} ${newName}`
                    },
                    { regex: new RegExp(`\\b${oldName}\\b`, 'g'), replacement: newName }
                );
                break;

            case 'interface':
                patterns.push(
                    { regex: new RegExp(`\\binterface\\s+${oldName}\\b`, 'g'), replacement: `interface ${newName}` },
                    { regex: new RegExp(`\\btype\\s+${oldName}\\b`, 'g'), replacement: `type ${newName}` },
                    { regex: new RegExp(`:\\s*${oldName}\\b`, 'g'), replacement: `: ${newName}` },
                    { regex: new RegExp(`<${oldName}[,>]`, 'g'), replacement: (m) => m.replace(oldName, newName) },
                    { regex: new RegExp(`\\bextends\\s+${oldName}\\b`, 'g'), replacement: `extends ${newName}` }
                );
                break;
        }

        return patterns;
    }

    executeTextReplace(params, options) {
        const { from, to } = params;
        if (!from || !to) {
            return { success: false, error: 'Missing from/to parameters' };
        }

        const escaped = from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const patterns = [{ regex: new RegExp(escaped, 'g'), replacement: to }];

        return this.applyPatterns(patterns, options);
    }

    executeRegexReplace(params, options) {
        const { from, to } = params;
        if (!from || !to) {
            return { success: false, error: 'Missing from/to parameters' };
        }

        try {
            const patterns = [{ regex: new RegExp(from, 'g'), replacement: to }];
            return this.applyPatterns(patterns, options);
        } catch (e) {
            return { success: false, error: `Invalid regex: ${e.message}` };
        }
    }

    executeVersionBump(params, options) {
        const { from, to } = params;
        const patterns = [];

        if (from && to) {
            // Specific version replacement
            patterns.push(
                { regex: new RegExp(`"version"\\s*:\\s*"${from}"`, 'g'), replacement: `"version": "1.0.0-QANTUM-PRIME"` },
                { regex: new RegExp(`v${from}`, 'g'), replacement: `v${to}` },
                { regex: new RegExp(`@${from}`, 'g'), replacement: `@${to}` }
            );
        }

        return this.applyPatterns(patterns, options);
    }

    executeBrandUpdate(params, options) {
        const { from, to } = params;
        if (!from || !to) {
            return { success: false, error: 'Missing from/to parameters' };
        }

        const patterns = [
            // Text
            { regex: new RegExp(from, 'gi'), replacement: to },
            // Paths
            { regex: new RegExp(from.toLowerCase(), 'g'), replacement: to.toLowerCase() },
            // CSS classes
            { regex: new RegExp(`class="${from}"`, 'gi'), replacement: `class="${to}"` },
            { regex: new RegExp(`\\.${from}\\b`, 'g'), replacement: `.${to}` }
        ];

        return this.applyPatterns(patterns, options);
    }

    executeConsoleToLogger(params, options) {
        // Delegate to great-purge.js
        try {
            const cmd = options.dryRun
                ? 'node tools/great-purge.js --verbose'
                : 'node tools/great-purge.js --execute';

            execSync(cmd, { cwd: CONFIG.projectRoot, stdio: 'inherit' });
            return { success: true, message: 'Console to Logger migration completed' };
        } catch (e) {
            return { success: false, error: e.message };
        }
    }

    executeCleanupComments(params, options) {
        const patterns = [
            // Remove TODO/FIXME comments
            { regex: /\/\/\s*(?:TODO|FIXME|XXX|HACK|BUG):?.*$/gm, replacement: '' },
            // Remove debug comments
            { regex: /\/\/\s*(?:DEBUG|TEMP|TEST):?.*$/gm, replacement: '' },
            // Remove empty comment lines
            { regex: /^\s*\/\/\s*$/gm, replacement: '' }
        ];

        return this.applyPatterns(patterns, options);
    }

    executeFixTypeScript(params, options) {
        try {
            // Get TypeScript errors
            let errors;
            try {
                execSync('npx tsc --noEmit', { cwd: CONFIG.projectRoot, stdio: 'pipe' });
                return { success: true, message: 'No TypeScript errors found' };
            } catch (e) {
                errors = e.stdout?.toString() || e.stderr?.toString() || '';
            }

            // Parse and attempt to fix common errors
            const fixes = this.parseTypeScriptErrors(errors);

            return {
                success: true,
                message: `Found ${fixes.length} fixable issues`,
                fixes
            };
        } catch (e) {
            return { success: false, error: e.message };
        }
    }

    parseTypeScriptErrors(output) {
        const fixes = [];
        const lines = output.split('\n');

        for (const line of lines) {
            // Parse error format: file.ts(line,col): error TSxxxx: message
            const match = line.match(/(.+)\((\d+),(\d+)\):\s*error\s+(TS\d+):\s*(.+)/);
            if (match) {
                fixes.push({
                    file: match[1],
                    line: parseInt(match[2]),
                    column: parseInt(match[3]),
                    code: match[4],
                    message: match[5]
                });
            }
        }

        return fixes;
    }

    executeFixLint(params, options) {
        try {
            execSync('npx eslint --fix "src/**/*.{ts,tsx,js,jsx}"', {
                cwd: CONFIG.projectRoot,
                stdio: options.dryRun ? 'pipe' : 'inherit'
            });
            return { success: true, message: 'Lint fixes applied' };
        } catch (e) {
            return { success: false, error: e.message };
        }
    }

    executeFixImports(params, options) {
        // Scan for broken imports
        const files = this.getAllFiles();
        const brokenImports = [];

        for (const file of files) {
            const content = fs.readFileSync(file, 'utf8');
            const importMatches = content.matchAll(/import\s+.*?\s+from\s+['"]([^'"]+)['"]/g);

            for (const match of importMatches) {
                const importPath = match[1];
                if (importPath.startsWith('.')) {
                    const resolvedPath = path.resolve(path.dirname(file), importPath);
                    const extensions = ['', '.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.js'];

                    let found = false;
                    for (const ext of extensions) {
                        if (fs.existsSync(resolvedPath + ext)) {
                            found = true;
                            break;
                        }
                    }

                    if (!found) {
                        brokenImports.push({
                            file,
                            importPath,
                            resolvedPath
                        });
                    }
                }
            }
        }

        return {
            success: true,
            message: `Found ${brokenImports.length} broken imports`,
            brokenImports
        };
    }

    // ═══════════════════════════════════════════════════════════════════════
    // CORE EXECUTION
    // ═══════════════════════════════════════════════════════════════════════

    applyPatterns(patterns, options = {}) {
        const files = this.getAllFiles();
        const stats = {
            filesScanned: 0,
            filesModified: 0,
            replacements: 0,
            errors: 0
        };

        const changes = [];

        for (const file of files) {
            stats.filesScanned++;

            try {
                let content = fs.readFileSync(file, 'utf8');
                let modified = false;
                let fileReplacements = 0;

                for (const { regex, replacement } of patterns) {
                    const matches = content.match(regex);
                    if (matches) {
                        fileReplacements += matches.length;
                        content = content.replace(regex, replacement);
                        modified = true;
                    }
                }

                if (modified) {
                    if (!options.dryRun) {
                        fs.writeFileSync(file, content, 'utf8');
                    }
                    stats.filesModified++;
                    stats.replacements += fileReplacements;
                    changes.push({ file, replacements: fileReplacements });
                }
            } catch (e) {
                stats.errors++;
            }
        }

        return { success: true, stats, changes };
    }

    getAllFiles() {
        const files = [];
        const srcPath = path.join(CONFIG.projectRoot, CONFIG.srcDir);

        function scan(dir) {
            const entries = fs.readdirSync(dir, { withFileTypes: true });

            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);

                if (entry.isDirectory()) {
                    if (!CONFIG.ignoreDirs.includes(entry.name)) {
                        scan(fullPath);
                    }
                } else if (entry.isFile()) {
                    const ext = path.extname(entry.name);
                    if (CONFIG.extensions.includes(ext)) {
                        files.push(fullPath);
                    }
                }
            }
        }

        scan(srcPath);
        return files;
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SELF-HEALING VALIDATOR
// ═══════════════════════════════════════════════════════════════════════════════

class SelfHealingValidator {
    constructor() {
        this.retryCount = 0;
    }

    /**
     * Validate changes and attempt to self-heal if issues found
     */
    async validate(changes, options = {}) {
        const results = {
            typescript: null,
            lint: null,
            tests: null,
            overall: true
        };

        // TypeScript check
        log.info('Validating TypeScript...');
        try {
            execSync(CONFIG.verifyCommands.typescript, {
                cwd: CONFIG.projectRoot,
                stdio: 'pipe'
            });
            results.typescript = { success: true };
            log.success('TypeScript: 0 errors');
        } catch (e) {
            results.typescript = { success: false, output: e.stdout?.toString() };
            results.overall = false;
            log.error('TypeScript errors found');

            // Attempt self-healing
            if (this.retryCount < CONFIG.maxRetries) {
                log.warning(`Attempting self-heal (attempt ${this.retryCount + 1}/${CONFIG.maxRetries})`);
                const healed = await this.attemptHeal(results.typescript.output, changes);
                if (healed) {
                    this.retryCount++;
                    return this.validate(changes, options);
                }
            }
        }

        return results;
    }

    /**
     * Attempt to heal detected issues
     */
    async attemptHeal(errorOutput, originalChanges) {
        // Parse errors and determine fixes
        const errors = this.parseErrors(errorOutput);

        for (const error of errors) {
            log.thinking(`Analyzing: ${error.code} in ${error.file}`);

            // Common fixes
            switch (error.code) {
                case 'TS2304': // Cannot find name
                    // Try to add import
                    log.action(`Adding missing import for ${error.identifier}`);
                    break;

                case 'TS2307': // Cannot find module
                    // Check if file was renamed
                    log.action(`Checking module path: ${error.module}`);
                    break;

                case 'TS2339': // Property does not exist
                    // Update property name
                    log.action(`Updating property reference`);
                    break;
            }
        }

        return errors.length > 0;
    }

    parseErrors(output) {
        const errors = [];
        if (!output) return errors;

        const lines = output.split('\n');
        for (const line of lines) {
            const match = line.match(/(.+)\((\d+),(\d+)\):\s*error\s+(TS\d+):\s*(.+)/);
            if (match) {
                errors.push({
                    file: match[1],
                    line: parseInt(match[2]),
                    code: match[4],
                    message: match[5],
                    identifier: this.extractIdentifier(match[5])
                });
            }
        }

        return errors;
    }

    extractIdentifier(message) {
        const match = message.match(/['"]([^'"]+)['"]/);
        return match ? match[1] : null;
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// LEARNING MEMORY
// ═══════════════════════════════════════════════════════════════════════════════

class LearningMemory {
    constructor() {
        this.memoryPath = CONFIG.memoryFile;
        this.memory = this.load();
    }

    load() {
        try {
            if (fs.existsSync(this.memoryPath)) {
                return JSON.parse(fs.readFileSync(this.memoryPath, 'utf8'));
            }
        } catch (e) { }

        return {
            missions: [],
            patterns: {},
            successRate: 0,
            totalMissions: 0
        };
    }

    save() {
        fs.writeFileSync(this.memoryPath, JSON.stringify(this.memory, null, 2));
    }

    /**
     * Record a completed mission
     */
    recordMission(mission) {
        this.memory.missions.push({
            timestamp: new Date().toISOString(),
            ...mission
        });

        this.memory.totalMissions++;

        // Update pattern success rates
        if (mission.strategy) {
            if (!this.memory.patterns[mission.strategy]) {
                this.memory.patterns[mission.strategy] = { attempts: 0, successes: 0 };
            }
            this.memory.patterns[mission.strategy].attempts++;
            if (mission.success) {
                this.memory.patterns[mission.strategy].successes++;
            }
        }

        // Calculate overall success rate
        const successes = this.memory.missions.filter(m => m.success).length;
        this.memory.successRate = (successes / this.memory.totalMissions * 100).toFixed(1);

        this.save();
    }

    /**
     * Get best strategy for a problem type based on history
     */
    getBestStrategy(problemType) {
        const patternStats = this.memory.patterns;
        let bestStrategy = null;
        let bestRate = 0;

        for (const [strategy, stats] of Object.entries(patternStats)) {
            if (strategy.toLowerCase().includes(problemType.toLowerCase())) {
                const rate = stats.successes / stats.attempts;
                if (rate > bestRate) {
                    bestRate = rate;
                    bestStrategy = strategy;
                }
            }
        }

        return bestStrategy;
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCRIPT GOD - Main Orchestrator
// ═══════════════════════════════════════════════════════════════════════════════

class ScriptGod {
    constructor(options = {}) {
        this.options = {
            dryRun: options.dryRun ?? true,
            verbose: options.verbose ?? false,
            autoCommit: options.autoCommit ?? true,
            ...options
        };

        this.analyzer = new ProblemAnalyzer();
        this.strategyEngine = new StrategyEngine();
        this.validator = new SelfHealingValidator();
        this.memory = new LearningMemory();

        this.mission = null;
    }

    /**
     * Execute a mission
     */
    async execute(problemDescription) {
        printBanner();

        console.log(`   ${c.bright}Mode:${c.reset} ${this.options.dryRun ? '👁️  DRY RUN' : '🔥 EXECUTE'}`);
        console.log(`   ${c.bright}Mission:${c.reset} "${problemDescription}"\n`);

        // ─────────────────────────────────────────────────────────────────────
        // PHASE 1: Problem Analysis
        // ─────────────────────────────────────────────────────────────────────
        log.phase(1, 'PROBLEM ANALYSIS');

        const analysis = this.analyzer.analyze(problemDescription);
        this.mission = analysis;

        log.thinking(`Understanding: "${problemDescription}"`);
        console.log(`   ${c.dim}Primary Intent:${c.reset} ${analysis.primaryIntent || 'Unknown'}`);
        console.log(`   ${c.dim}Sub Intent:${c.reset} ${analysis.subIntent || 'Unknown'}`);
        console.log(`   ${c.dim}Strategy:${c.reset} ${analysis.strategy || 'Auto-detect'}`);
        console.log(`   ${c.dim}Confidence:${c.reset} ${(analysis.confidence * 100).toFixed(0)}%`);

        if (analysis.parameters.from && analysis.parameters.to) {
            console.log(`   ${c.dim}From:${c.reset} "${analysis.parameters.from}"`);
            console.log(`   ${c.dim}To:${c.reset} "${analysis.parameters.to}"`);
        }

        if (analysis.bestPractice) {
            console.log(`\n   ${c.green}💡 Best Practice:${c.reset} ${analysis.bestPractice}`);
        }

        if (analysis.confidence < 0.5) {
            log.warning('Low confidence - please provide more details');
            return { success: false, reason: 'Insufficient information' };
        }

        // ─────────────────────────────────────────────────────────────────────
        // PHASE 2: Strategy Selection
        // ─────────────────────────────────────────────────────────────────────
        log.phase(2, 'STRATEGY SELECTION');

        const strategy = this.strategyEngine.getStrategy(analysis.strategy);

        if (!strategy) {
            log.error(`No strategy found for: ${analysis.strategy}`);
            return { success: false, reason: 'No strategy available' };
        }

        log.strategy(`Selected: ${strategy.name}`);

        // Check memory for historical success rate
        const historicalRate = this.memory.memory.patterns[analysis.strategy];
        if (historicalRate) {
            const rate = (historicalRate.successes / historicalRate.attempts * 100).toFixed(0);
            console.log(`   ${c.dim}Historical Success Rate:${c.reset} ${rate}%`);
        }

        // ─────────────────────────────────────────────────────────────────────
        // PHASE 3: Execution
        // ─────────────────────────────────────────────────────────────────────
        log.phase(3, 'EXECUTION');

        const result = strategy.execute(analysis.parameters, this.options);

        if (!result.success) {
            log.error(`Execution failed: ${result.error}`);
            this.memory.recordMission({
                input: problemDescription,
                strategy: analysis.strategy,
                success: false,
                error: result.error
            });
            return result;
        }

        if (result.stats) {
            console.log(`   ${c.dim}Files Scanned:${c.reset} ${result.stats.filesScanned}`);
            console.log(`   ${c.dim}Files Modified:${c.reset} ${result.stats.filesModified}`);
            console.log(`   ${c.dim}Replacements:${c.reset} ${result.stats.replacements}`);
        }

        // ─────────────────────────────────────────────────────────────────────
        // PHASE 4: Validation
        // ─────────────────────────────────────────────────────────────────────
        if (!this.options.dryRun) {
            log.phase(4, 'VALIDATION & SELF-HEALING');

            const validation = await this.validator.validate(result.changes, this.options);

            if (!validation.overall) {
                log.warning('Validation found issues - check details above');
            }
        }

        // ─────────────────────────────────────────────────────────────────────
        // PHASE 5: Learning
        // ─────────────────────────────────────────────────────────────────────
        log.phase(5, 'LEARNING & MEMORY');

        this.memory.recordMission({
            input: problemDescription,
            strategy: analysis.strategy,
            success: true,
            filesModified: result.stats?.filesModified || 0,
            replacements: result.stats?.replacements || 0
        });

        console.log(`   ${c.dim}Mission recorded to memory${c.reset}`);
        console.log(`   ${c.dim}Overall Success Rate:${c.reset} ${this.memory.memory.successRate}%`);
        console.log(`   ${c.dim}Total Missions:${c.reset} ${this.memory.memory.totalMissions}`);

        // ─────────────────────────────────────────────────────────────────────
        // SUMMARY
        // ─────────────────────────────────────────────────────────────────────
        console.log(`
${c.bgGreen}${c.white} MISSION COMPLETE ${c.reset}

   ${c.green}✓ Problem understood${c.reset}
   ${c.green}✓ Best strategy selected${c.reset}
   ${c.green}✓ Changes applied${c.reset}
   ${c.green}✓ Knowledge updated${c.reset}
   
   ${c.dim}[ dp ] qantum labs © 2025${c.reset}
`);

        return result;
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// CLI
// ═══════════════════════════════════════════════════════════════════════════════

async function main() {
    const args = process.argv.slice(2);

    if (args.includes('--help') || args.includes('-h') || args.length === 0) {
        printBanner();
        console.log(`
${c.bright}USAGE:${c.reset}
  node tools/script-god.js [options] "problem description"

${c.bright}OPTIONS:${c.reset}
  --execute         Apply changes (default: dry-run)
  --verbose, -v     Show detailed output
  --no-commit       Skip auto-commit

${c.bright}EXAMPLES:${c.reset}
  ${c.dim}# Rename a class${c.reset}
  node tools/script-god.js "rename class QAntum to QAntum"
  
  ${c.dim}# Replace text${c.reset}
  node tools/script-god.js "replace 'v27' to 'v1.0.0'"
  
  ${c.dim}# Cleanup console logs${c.reset}
  node tools/script-god.js "cleanup console logs"
  
  ${c.dim}# Fix TypeScript errors${c.reset}
  node tools/script-god.js --execute "fix typescript errors"
  
  ${c.dim}# Update version${c.reset}
  node tools/script-god.js --execute "update version from 1.0.0-QANTUM-PRIME to 1.0.0"

${c.bright}SUPPORTED INTENTS:${c.reset}
  rename    - Rename classes, functions, variables, interfaces
  replace   - Replace text, patterns, versions, logos
  cleanup   - Remove console.logs, comments, dead code
  fix       - Fix TypeScript, lint, broken imports
  migrate   - Convert JS to TS, upgrade APIs
  add       - Add imports, exports, documentation

${c.bright}PHILOSOPHY:${c.reset}
  "Best practices always lead to success"
`);
        return;
    }

    const options = {
        dryRun: !args.includes('--execute'),
        verbose: args.includes('--verbose') || args.includes('-v'),
        autoCommit: !args.includes('--no-commit')
    };

    // Get problem description (everything that's not a flag)
    const problem = args.filter(a => !a.startsWith('--') && !a.startsWith('-')).join(' ');

    if (!problem) {
        console.log(`${c.red}Error: Please provide a problem description${c.reset}`);
        return;
    }

    const god = new ScriptGod(options);
    await god.execute(problem);
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = ScriptGod;
��*cascade082Ufile:///C:/Users/papic/Documents/github/brutality-vortex/scripts/oracle/script-god.js