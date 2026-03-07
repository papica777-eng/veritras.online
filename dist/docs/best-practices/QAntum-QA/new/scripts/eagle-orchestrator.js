"use strict";
/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║     🦅 EAGLE-VIEW ORCHESTRATOR                                               ║
 * ║     "Скриптът не греши никога защото е математика."                          ║
 * ╠══════════════════════════════════════════════════════════════════════════════╣
 * ║     @author Димитър Продромов                                                ║
 * ║     @version 1.0.0                                                           ║
 * ║     @date 31 December 2025                                                   ║
 * ║                                                                              ║
 * ║     РАБОТИ НА НИВО ПРОЕКТИ, НЕ ФАЙЛОВЕ!                                      ║
 * ║     Класифицира • Организира • Самонадграждане • Мащабност                   ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
// ═══════════════════════════════════════════════════════════════════════════════
// 🎨 CONSOLE STYLING
// ═══════════════════════════════════════════════════════════════════════════════
const C = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
};
const log = (msg, color = 'reset') => console.log(`${C[color]}${msg}${C.reset}`);
const banner = () => {
    console.clear();
    log('╔══════════════════════════════════════════════════════════════════════════════╗', 'cyan');
    log('║     🦅 EAGLE-VIEW ORCHESTRATOR                                               ║', 'cyan');
    log('║     "Скриптът не греши никога защото е математика."                          ║', 'yellow');
    log('╠══════════════════════════════════════════════════════════════════════════════╣', 'cyan');
    log('║     МАЩАБЕН • КЛАСИФИЦИРАН • АВТОМАТИЗИРАН • САМОНАДГРАЖДАЩ СЕ              ║', 'cyan');
    log('╚══════════════════════════════════════════════════════════════════════════════╝', 'cyan');
    console.log();
};
const CATEGORIES = [
    {
        id: 'core',
        name: '🧠 CORE',
        description: 'Kernel, types, base classes',
        patterns: [/types?\.ts$/, /core\//i, /kernel\//i, /base[A-Z]/, /interfaces?\.ts$/],
        priority: 1,
        color: 'magenta'
    },
    {
        id: 'security',
        name: '🔐 SECURITY',
        description: 'Auth, encryption, validation',
        patterns: [/security\//i, /auth/, /crypto/, /encrypt/, /vault/, /bastion/i],
        priority: 2,
        color: 'red'
    },
    {
        id: 'ai',
        name: '🤖 AI/ML',
        description: 'Intelligence, neural, ML',
        patterns: [/neural\//i, /ai\//i, /ml\//i, /model/, /predict/, /learn/],
        priority: 3,
        color: 'cyan'
    },
    {
        id: 'automation',
        name: '🤖 AUTOMATION',
        description: 'Ghost protocol, browser, testing',
        patterns: [/ghost/i, /browser\//i, /automat/, /stealth/, /phantom/],
        priority: 4,
        color: 'green'
    },
    {
        id: 'enterprise',
        name: '🏢 ENTERPRISE',
        description: 'Scaling, distributed, swarm',
        patterns: [/enterprise\//i, /swarm\//i, /distributed/, /scale/, /cluster/],
        priority: 5,
        color: 'yellow'
    },
    {
        id: 'integration',
        name: '🔌 INTEGRATION',
        description: 'APIs, adapters, bridges',
        patterns: [/adapter/, /api\//i, /bridge/, /integration/, /connector/],
        priority: 6,
        color: 'blue'
    },
    {
        id: 'ux',
        name: '🎨 UX/UI',
        description: 'Dashboard, visual, reports',
        patterns: [/ux\//i, /ui\//i, /dashboard/, /visual/, /report/],
        priority: 7,
        color: 'magenta'
    },
    {
        id: 'tests',
        name: '🧪 TESTS',
        description: 'Test files, specs, mocks',
        patterns: [/\.test\.ts$/, /\.spec\.ts$/, /tests?\//i, /mock/, /__tests__/],
        priority: 8,
        color: 'yellow'
    },
    {
        id: 'docs',
        name: '📚 DOCS',
        description: 'Documentation, examples',
        patterns: [/docs?\//i, /\.md$/, /example/, /README/i],
        priority: 9,
        color: 'white'
    },
    {
        id: 'scripts',
        name: '🔧 SCRIPTS',
        description: 'Build, deploy, utilities',
        patterns: [/scripts?\//i, /build/, /deploy/, /util/],
        priority: 10,
        color: 'cyan'
    },
    {
        id: 'other',
        name: '📦 OTHER',
        description: 'Uncategorized',
        patterns: [/.*/],
        priority: 99,
        color: 'reset'
    }
];
class EagleScanner {
    rootPath;
    ignoredDirs = ['node_modules', 'dist', '.git', '.vscode', 'coverage', '__pycache__'];
    targetExtensions = ['.ts', '.tsx', '.js', '.jsx', '.md', '.json'];
    constructor(rootPath) {
        this.rootPath = rootPath;
    }
    scan() {
        const files = [];
        this.walkDir(this.rootPath, files);
        return files;
    }
    walkDir(dir, files) {
        const entries = fs_1.default.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path_1.default.join(dir, entry.name);
            if (entry.isDirectory()) {
                if (!this.ignoredDirs.includes(entry.name)) {
                    this.walkDir(fullPath, files);
                }
            }
            else if (entry.isFile()) {
                const ext = path_1.default.extname(entry.name);
                if (this.targetExtensions.includes(ext)) {
                    files.push(this.analyzeFile(fullPath));
                }
            }
        }
    }
    analyzeFile(filePath) {
        const content = fs_1.default.readFileSync(filePath, 'utf-8');
        const relativePath = path_1.default.relative(this.rootPath, filePath);
        const lines = content.split('\n').length;
        return {
            path: filePath,
            relativePath,
            name: path_1.default.basename(filePath),
            extension: path_1.default.extname(filePath),
            size: fs_1.default.statSync(filePath).size,
            lines,
            category: this.classifyFile(filePath, content),
            exports: this.extractExports(content),
            imports: this.extractImports(content),
            hash: crypto_1.default.createHash('md5').update(content).digest('hex').slice(0, 8),
        };
    }
    classifyFile(filePath, content) {
        const fullPath = filePath.toLowerCase();
        for (const cat of CATEGORIES) {
            for (const pattern of cat.patterns) {
                if (pattern.test(fullPath)) {
                    return cat;
                }
            }
        }
        return CATEGORIES[CATEGORIES.length - 1]; // 'other'
    }
    extractExports(content) {
        const exports = [];
        const patterns = [
            /export\s+(?:class|interface|type|enum|function|const|let|var)\s+(\w+)/g,
            /export\s+\{\s*([^}]+)\s*\}/g,
            /export\s+default\s+(?:class|function)?\s*(\w+)?/g,
        ];
        for (const pattern of patterns) {
            let match;
            while ((match = pattern.exec(content)) !== null) {
                if (match[1]) {
                    const names = match[1].split(',').map(n => n.trim().split(' ')[0]);
                    exports.push(...names.filter(n => n && !n.includes('{')));
                }
            }
        }
        return [...new Set(exports)];
    }
    extractImports(content) {
        const imports = [];
        const pattern = /from\s+['"]([^'"]+)['"]/g;
        let match;
        while ((match = pattern.exec(content)) !== null) {
            imports.push(match[1]);
        }
        return [...new Set(imports)];
    }
}
// ═══════════════════════════════════════════════════════════════════════════════
// 📊 PROJECT ANALYZER
// ═══════════════════════════════════════════════════════════════════════════════
class EagleAnalyzer {
    analyze(files) {
        const stats = {
            totalFiles: files.length,
            totalLines: 0,
            totalSize: 0,
            byCategory: new Map(),
            byExtension: new Map(),
            dependencies: new Map(),
        };
        for (const file of files) {
            stats.totalLines += file.lines;
            stats.totalSize += file.size;
            // By category
            const catFiles = stats.byCategory.get(file.category.id) || [];
            catFiles.push(file);
            stats.byCategory.set(file.category.id, catFiles);
            // By extension
            const extCount = stats.byExtension.get(file.extension) || 0;
            stats.byExtension.set(file.extension, extCount + 1);
            // Dependencies
            stats.dependencies.set(file.relativePath, file.imports);
        }
        return stats;
    }
    printReport(stats, projectName) {
        console.log();
        log(`╔${'═'.repeat(76)}╗`, 'cyan');
        log(`║  📊 PROJECT ANALYSIS: ${projectName.padEnd(52)}║`, 'cyan');
        log(`╠${'═'.repeat(76)}╣`, 'cyan');
        log(`║  Total Files:  ${stats.totalFiles.toString().padEnd(10)} Lines: ${stats.totalLines.toLocaleString().padEnd(15)} Size: ${(stats.totalSize / 1024 / 1024).toFixed(2)} MB    ║`, 'white');
        log(`╠${'═'.repeat(76)}╣`, 'cyan');
        // By category
        log('║  BY CATEGORY:'.padEnd(77) + '║', 'yellow');
        for (const cat of CATEGORIES) {
            const files = stats.byCategory.get(cat.id) || [];
            if (files.length > 0) {
                const lines = files.reduce((sum, f) => sum + f.lines, 0);
                const pct = ((files.length / stats.totalFiles) * 100).toFixed(1);
                log(`║    ${cat.name.padEnd(20)} ${files.length.toString().padStart(4)} files  ${lines.toLocaleString().padStart(8)} lines  (${pct}%)`.padEnd(77) + '║', cat.color);
            }
        }
        log(`╠${'═'.repeat(76)}╣`, 'cyan');
        // By extension
        log('║  BY EXTENSION:'.padEnd(77) + '║', 'yellow');
        for (const [ext, count] of stats.byExtension) {
            log(`║    ${ext.padEnd(10)} ${count.toString().padStart(5)} files`.padEnd(77) + '║', 'white');
        }
        log(`╚${'═'.repeat(76)}╝`, 'cyan');
    }
}
class EagleOrganizer {
    createReorganizePlan(files, targetStructure) {
        const plan = {
            moves: [],
            creates: [],
            updates: [],
        };
        // Ensure category directories exist
        for (const cat of CATEGORIES.filter(c => c.id !== 'other')) {
            const dirPath = path_1.default.join(targetStructure, cat.id);
            if (!fs_1.default.existsSync(dirPath)) {
                plan.creates.push({
                    path: dirPath,
                    type: 'dir',
                });
            }
        }
        // Suggest moves based on classification
        for (const file of files) {
            if (file.category.id !== 'other' && file.category.id !== 'docs' && file.category.id !== 'tests') {
                const currentDir = path_1.default.dirname(file.relativePath);
                const suggestedDir = file.category.id;
                if (!currentDir.includes(suggestedDir)) {
                    const newPath = path_1.default.join(targetStructure, suggestedDir, file.name);
                    plan.moves.push({
                        from: file.path,
                        to: newPath,
                        reason: `File belongs to ${file.category.name}`,
                    });
                }
            }
        }
        return plan;
    }
    generateIndexFiles(files, stats) {
        const indexes = new Map();
        for (const [catId, catFiles] of stats.byCategory) {
            if (catFiles.length === 0)
                continue;
            const cat = CATEGORIES.find(c => c.id === catId);
            if (!cat || cat.id === 'other' || cat.id === 'docs' || cat.id === 'tests')
                continue;
            const exports = catFiles.flatMap(f => f.exports).filter(e => e);
            if (exports.length === 0)
                continue;
            let indexContent = `/**
 * ${cat.name} - Auto-generated barrel export
 * Generated by Eagle-View Orchestrator
 * @category ${cat.name}
 */

`;
            for (const file of catFiles) {
                if (file.exports.length > 0) {
                    const relativePath = './' + file.name.replace('.ts', '');
                    indexContent += `export * from '${relativePath}';\n`;
                }
            }
            indexes.set(`${catId}/index.ts`, indexContent);
        }
        return indexes;
    }
}
// ═══════════════════════════════════════════════════════════════════════════════
// 🔄 PROJECT SYNCHRONIZER
// ═══════════════════════════════════════════════════════════════════════════════
class EagleSynchronizer {
    projects = new Map();
    registerProject(name, projectPath) {
        const scanner = new EagleScanner(projectPath);
        const analyzer = new EagleAnalyzer();
        const files = scanner.scan();
        const stats = analyzer.analyze(files);
        this.projects.set(name, {
            path: projectPath,
            stats,
            lastScan: new Date(),
        });
        log(`✅ Registered project: ${name}`, 'green');
        log(`   Path: ${projectPath}`, 'white');
        log(`   Files: ${stats.totalFiles} | Lines: ${stats.totalLines.toLocaleString()}`, 'white');
    }
    syncAll() {
        log('\n🔄 Synchronizing all registered projects...', 'cyan');
        for (const [name, project] of this.projects) {
            log(`\n   Syncing: ${name}`, 'yellow');
            const scanner = new EagleScanner(project.path);
            const analyzer = new EagleAnalyzer();
            const files = scanner.scan();
            const newStats = analyzer.analyze(files);
            const diff = {
                files: newStats.totalFiles - project.stats.totalFiles,
                lines: newStats.totalLines - project.stats.totalLines,
            };
            project.stats = newStats;
            project.lastScan = new Date();
            log(`   ${diff.files >= 0 ? '+' : ''}${diff.files} files, ${diff.lines >= 0 ? '+' : ''}${diff.lines} lines`, diff.files >= 0 ? 'green' : 'red');
        }
    }
    compareProjects() {
        log('\n📊 Project Comparison', 'cyan');
        log('═'.repeat(77), 'cyan');
        const header = '│ Project'.padEnd(25) + '│ Files'.padEnd(10) + '│ Lines'.padEnd(12) + '│ Size'.padEnd(12) + '│';
        log(header, 'white');
        log('─'.repeat(77), 'cyan');
        for (const [name, project] of this.projects) {
            const row = `│ ${name}`.padEnd(25) +
                `│ ${project.stats.totalFiles}`.padEnd(10) +
                `│ ${project.stats.totalLines.toLocaleString()}`.padEnd(12) +
                `│ ${(project.stats.totalSize / 1024 / 1024).toFixed(2)} MB`.padEnd(12) + '│';
            log(row, 'white');
        }
        log('═'.repeat(77), 'cyan');
    }
}
// ═══════════════════════════════════════════════════════════════════════════════
// 📝 DOCUMENTATION GENERATOR
// ═══════════════════════════════════════════════════════════════════════════════
class EagleDocGenerator {
    generate(files, stats, projectName) {
        let doc = `# 🦅 ${projectName} - Project Structure

> Auto-generated by Eagle-View Orchestrator
> Generated: ${new Date().toISOString()}

## 📊 Statistics

| Metric | Value |
|--------|-------|
| Total Files | ${stats.totalFiles} |
| Total Lines | ${stats.totalLines.toLocaleString()} |
| Total Size | ${(stats.totalSize / 1024 / 1024).toFixed(2)} MB |

## 📁 Structure by Category

`;
        for (const cat of CATEGORIES) {
            const catFiles = stats.byCategory.get(cat.id) || [];
            if (catFiles.length === 0)
                continue;
            const lines = catFiles.reduce((sum, f) => sum + f.lines, 0);
            doc += `### ${cat.name}

> ${cat.description}

| File | Lines | Exports |
|------|-------|---------|
`;
            for (const file of catFiles.slice(0, 20)) {
                doc += `| ${file.name} | ${file.lines} | ${file.exports.slice(0, 3).join(', ')}${file.exports.length > 3 ? '...' : ''} |\n`;
            }
            if (catFiles.length > 20) {
                doc += `| ... and ${catFiles.length - 20} more files |  |  |\n`;
            }
            doc += '\n';
        }
        doc += `---

**"Скриптът не греши никога защото е математика."**

© 2025 Dimitar Prodromov. All rights reserved.
`;
        return doc;
    }
}
// ═══════════════════════════════════════════════════════════════════════════════
// 🚀 MAIN ORCHESTRATOR
// ═══════════════════════════════════════════════════════════════════════════════
class EagleOrchestrator {
    scanner;
    analyzer;
    organizer;
    synchronizer;
    docGenerator;
    constructor() {
        this.scanner = new EagleScanner('.');
        this.analyzer = new EagleAnalyzer();
        this.organizer = new EagleOrganizer();
        this.synchronizer = new EagleSynchronizer();
        this.docGenerator = new EagleDocGenerator();
    }
    async run(command, args) {
        banner();
        switch (command) {
            case 'scan':
                await this.cmdScan(args[0] || '.');
                break;
            case 'analyze':
                await this.cmdAnalyze(args[0] || '.');
                break;
            case 'classify':
                await this.cmdClassify(args[0] || '.');
                break;
            case 'docs':
                await this.cmdGenerateDocs(args[0] || '.', args[1] || 'PROJECT-STRUCTURE.md');
                break;
            case 'sync':
                await this.cmdSync();
                break;
            case 'register':
                await this.cmdRegister(args[0], args[1]);
                break;
            case 'compare':
                await this.cmdCompare();
                break;
            case 'all':
                await this.cmdAll();
                break;
            default:
                this.printHelp();
        }
    }
    async cmdScan(projectPath) {
        log(`🔍 Scanning: ${projectPath}`, 'cyan');
        this.scanner = new EagleScanner(projectPath);
        const files = this.scanner.scan();
        log(`\n✅ Found ${files.length} files`, 'green');
        // Quick summary
        const byExt = new Map();
        files.forEach(f => {
            byExt.set(f.extension, (byExt.get(f.extension) || 0) + 1);
        });
        for (const [ext, count] of byExt) {
            log(`   ${ext}: ${count}`, 'white');
        }
    }
    async cmdAnalyze(projectPath) {
        this.scanner = new EagleScanner(projectPath);
        const files = this.scanner.scan();
        const stats = this.analyzer.analyze(files);
        this.analyzer.printReport(stats, path_1.default.basename(path_1.default.resolve(projectPath)));
    }
    async cmdClassify(projectPath) {
        log('📁 Classifying files by category...', 'cyan');
        this.scanner = new EagleScanner(projectPath);
        const files = this.scanner.scan();
        const stats = this.analyzer.analyze(files);
        for (const cat of CATEGORIES) {
            const catFiles = stats.byCategory.get(cat.id) || [];
            if (catFiles.length === 0)
                continue;
            log(`\n${cat.name} (${catFiles.length} files)`, cat.color);
            for (const file of catFiles.slice(0, 10)) {
                log(`  📄 ${file.relativePath}`, 'white');
            }
            if (catFiles.length > 10) {
                log(`  ... and ${catFiles.length - 10} more`, 'white');
            }
        }
    }
    async cmdGenerateDocs(projectPath, outputPath) {
        log('📚 Generating documentation...', 'cyan');
        this.scanner = new EagleScanner(projectPath);
        const files = this.scanner.scan();
        const stats = this.analyzer.analyze(files);
        const doc = this.docGenerator.generate(files, stats, path_1.default.basename(path_1.default.resolve(projectPath)));
        const fullOutputPath = path_1.default.join(projectPath, outputPath);
        fs_1.default.writeFileSync(fullOutputPath, doc);
        log(`✅ Documentation written to: ${fullOutputPath}`, 'green');
    }
    async cmdSync() {
        this.synchronizer.syncAll();
    }
    async cmdRegister(name, projectPath) {
        if (!name || !projectPath) {
            log('❌ Usage: eagle register <name> <path>', 'red');
            return;
        }
        this.synchronizer.registerProject(name, projectPath);
    }
    async cmdCompare() {
        this.synchronizer.compareProjects();
    }
    async cmdAll() {
        // Register both projects
        log('🔄 Registering projects...', 'cyan');
        this.synchronizer.registerProject('QAntumQATool', 'C:\\QAntumQATool');
        this.synchronizer.registerProject('MisteMind', 'C:\\MisteMind');
        // Compare
        this.synchronizer.compareProjects();
        // Analyze each
        log('\n', 'reset');
        await this.cmdAnalyze('C:\\QAntumQATool');
        log('\n', 'reset');
        await this.cmdAnalyze('C:\\MisteMind');
        // Generate docs
        await this.cmdGenerateDocs('C:\\QAntumQATool', 'PROJECT-STRUCTURE.md');
        await this.cmdGenerateDocs('C:\\MisteMind', 'PROJECT-STRUCTURE.md');
        log('\n✅ Eagle-View complete!', 'green');
    }
    printHelp() {
        log(`
Usage: npx tsx eagle-orchestrator.ts <command> [args]

Commands:
  scan <path>              Quick scan of project
  analyze <path>           Full analysis with stats
  classify <path>          Classify files by category
  docs <path> [output]     Generate documentation
  register <name> <path>   Register project for sync
  sync                     Sync all registered projects
  compare                  Compare registered projects
  all                      Full analysis of all projects

Examples:
  npx tsx eagle-orchestrator.ts analyze C:\\QAntumQATool
  npx tsx eagle-orchestrator.ts classify .
  npx tsx eagle-orchestrator.ts all
`, 'white');
    }
}
// ═══════════════════════════════════════════════════════════════════════════════
// 🚀 ENTRY POINT
// ═══════════════════════════════════════════════════════════════════════════════
const args = process.argv.slice(2);
const command = args[0] || 'all';
const commandArgs = args.slice(1);
const eagle = new EagleOrchestrator();
eagle.run(command, commandArgs).catch(console.error);
