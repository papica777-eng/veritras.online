"use strict";
/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║     🦅 QANTUM MASTER CONTROL                                                 ║
 * ║     "Скриптът не греши никога защото е математика."                          ║
 * ╠══════════════════════════════════════════════════════════════════════════════╣
 * ║     Central hub for all QAntum automation scripts                            ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const C = {
    reset: '\x1b[0m', green: '\x1b[32m', cyan: '\x1b[36m', yellow: '\x1b[33m', red: '\x1b[31m', magenta: '\x1b[35m', dim: '\x1b[2m', bold: '\x1b[1m'
};
const log = (msg, color = 'reset') => console.log(`${C[color]}${msg}${C.reset}`);
const SCRIPTS = [
    {
        name: 'Eagle Orchestrator',
        file: 'eagle-orchestrator.ts',
        description: 'Project-level analysis, classification, and structure management',
        category: 'analysis',
        commands: ['scan', 'analyze', 'organize', 'sync', 'all']
    },
    {
        name: 'QANTUM Surgeon',
        file: 'qantum-surgeon.ts',
        description: 'TypeScript error detection, classification, and auto-fix',
        category: 'quality',
        commands: ['diagnose', 'fix', 'report']
    },
    {
        name: 'QAntum Control Panel',
        file: 'qantum-control-panel.ts',
        description: 'Interactive control panel for manual operations',
        category: 'utility',
        commands: ['start', 'menu']
    },
    {
        name: 'QAntum Release',
        file: 'qantum-release.ts',
        description: 'Version bumping, changelog generation, and release management',
        category: 'release',
        commands: ['major', 'minor', 'patch', 'prerelease', 'status']
    },
    {
        name: 'QAntum CI/CD',
        file: 'qantum-ci-cd.ts',
        description: 'CI/CD pipeline generator for GitHub, Azure DevOps, GitLab',
        category: 'devops',
        commands: ['generate', 'github', 'azure', 'gitlab']
    },
    {
        name: 'Dependency Doctor',
        file: 'qantum-dep-doctor.ts',
        description: 'Dependency audit, outdated packages, licenses, security',
        category: 'security',
        commands: ['check', 'outdated', 'audit', 'licenses', 'update', 'report']
    },
    {
        name: 'QAntum Benchmark',
        file: 'qantum-benchmark.ts',
        description: 'Performance benchmarking for build, tests, and file operations',
        category: 'analysis',
        commands: ['all', 'build', 'test', 'lint', 'typecheck', 'report']
    },
    {
        name: 'Git Hooks',
        file: 'qantum-git-hooks.ts',
        description: 'Git hooks installation and management (pre-commit, commit-msg, etc.)',
        category: 'devops',
        commands: ['install', 'uninstall', 'list', 'test']
    },
    {
        name: 'ENV Validator',
        file: 'qantum-env-validator.ts',
        description: 'Environment validation, encryption, and synchronization',
        category: 'security',
        commands: ['validate', 'template', 'schema', 'sync', 'encrypt', 'decrypt', 'diff']
    },
    {
        name: 'Code Metrics',
        file: 'qantum-code-metrics.ts',
        description: 'Code complexity, LOC, functions, classes, quality score',
        category: 'analysis',
        commands: ['analyze', 'report', 'json', 'full']
    },
    {
        name: 'QAntum Backup',
        file: 'qantum-backup.ts',
        description: 'Project backup, restore, and archive management',
        category: 'utility',
        commands: ['create', 'restore', 'list', 'config']
    }
];
// ═══════════════════════════════════════════════════════════════════════════════
// MASTER CONTROL CLASS
// ═══════════════════════════════════════════════════════════════════════════════
class QantumMasterControl {
    scriptsPath;
    constructor() {
        this.scriptsPath = __dirname;
    }
    // ─────────────────────────────────────────────────────────────────────────────
    // RUN SCRIPT
    // ─────────────────────────────────────────────────────────────────────────────
    run(scriptName, args = []) {
        const script = SCRIPTS.find(s => s.name.toLowerCase().includes(scriptName.toLowerCase()) ||
            s.file.toLowerCase().includes(scriptName.toLowerCase()));
        if (!script) {
            log(`\n❌ Script not found: ${scriptName}`, 'red');
            log('   Use "list" to see available scripts.', 'dim');
            return;
        }
        const scriptPath = path_1.default.join(this.scriptsPath, script.file);
        if (!fs_1.default.existsSync(scriptPath)) {
            log(`\n❌ Script file not found: ${script.file}`, 'red');
            return;
        }
        log(`\n🚀 Running: ${script.name}`, 'cyan');
        log('─'.repeat(50), 'dim');
        try {
            const cmd = `npx tsx "${scriptPath}" ${args.join(' ')}`;
            (0, child_process_1.execSync)(cmd, { stdio: 'inherit', cwd: process.cwd() });
        }
        catch (e) {
            if (e.status !== 0) {
                log(`\n⚠️ Script exited with code ${e.status}`, 'yellow');
            }
        }
    }
    // ─────────────────────────────────────────────────────────────────────────────
    // LIST SCRIPTS
    // ─────────────────────────────────────────────────────────────────────────────
    list() {
        console.log();
        log('╔══════════════════════════════════════════════════════════════════════════════╗', 'cyan');
        log('║     🦅 QANTUM MASTER CONTROL - SCRIPT REGISTRY                               ║', 'cyan');
        log('╚══════════════════════════════════════════════════════════════════════════════╝', 'cyan');
        const categories = ['analysis', 'quality', 'release', 'security', 'devops', 'utility'];
        const categoryNames = {
            analysis: '📊 ANALYSIS',
            quality: '✨ QUALITY',
            release: '🚀 RELEASE',
            security: '🔒 SECURITY',
            devops: '⚙️ DEVOPS',
            utility: '🔧 UTILITY'
        };
        for (const category of categories) {
            const scripts = SCRIPTS.filter(s => s.category === category);
            if (scripts.length === 0)
                continue;
            log(`\n${categoryNames[category]}`, 'magenta');
            log('─'.repeat(70), 'dim');
            for (const script of scripts) {
                const exists = fs_1.default.existsSync(path_1.default.join(this.scriptsPath, script.file));
                const status = exists ? '✅' : '❌';
                log(`  ${status} ${script.name}`, exists ? 'green' : 'red');
                log(`     ${script.description}`, 'dim');
                log(`     Commands: ${script.commands.join(', ')}`, 'dim');
                log(`     File: ${script.file}`, 'dim');
                console.log();
            }
        }
    }
    // ─────────────────────────────────────────────────────────────────────────────
    // STATUS
    // ─────────────────────────────────────────────────────────────────────────────
    status() {
        console.log();
        log('╔══════════════════════════════════════════════════════════════════════════════╗', 'cyan');
        log('║     📊 QANTUM MASTER CONTROL - STATUS                                        ║', 'cyan');
        log('╚══════════════════════════════════════════════════════════════════════════════╝', 'cyan');
        let installed = 0;
        let missing = 0;
        log('\n📁 Script Status:', 'magenta');
        log('─'.repeat(50), 'dim');
        for (const script of SCRIPTS) {
            const scriptPath = path_1.default.join(this.scriptsPath, script.file);
            const exists = fs_1.default.existsSync(scriptPath);
            if (exists) {
                installed++;
                const stat = fs_1.default.statSync(scriptPath);
                const size = (stat.size / 1024).toFixed(1);
                log(`  ✅ ${script.file.padEnd(30)} ${size} KB`, 'green');
            }
            else {
                missing++;
                log(`  ❌ ${script.file.padEnd(30)} MISSING`, 'red');
            }
        }
        log('\n─'.repeat(50), 'dim');
        log(`\n📊 Summary:`, 'cyan');
        log(`   Total scripts:    ${SCRIPTS.length}`, 'white');
        log(`   Installed:        ${installed}`, 'green');
        log(`   Missing:          ${missing}`, missing > 0 ? 'red' : 'white');
        log(`   Installation:     ${((installed / SCRIPTS.length) * 100).toFixed(0)}%`, 'white');
    }
    // ─────────────────────────────────────────────────────────────────────────────
    // FULL ANALYSIS
    // ─────────────────────────────────────────────────────────────────────────────
    async fullAnalysis() {
        console.log();
        log('╔══════════════════════════════════════════════════════════════════════════════╗', 'cyan');
        log('║     🔬 QANTUM FULL PROJECT ANALYSIS                                          ║', 'cyan');
        log('╚══════════════════════════════════════════════════════════════════════════════╝', 'cyan');
        log('\nRunning complete project analysis...\n', 'white');
        const analyses = [
            { script: 'eagle-orchestrator.ts', args: ['analyze'] },
            { script: 'qantum-surgeon.ts', args: ['diagnose'] },
            { script: 'qantum-code-metrics.ts', args: ['analyze'] },
            { script: 'qantum-dep-doctor.ts', args: ['check'] },
        ];
        for (const { script, args } of analyses) {
            const scriptPath = path_1.default.join(this.scriptsPath, script);
            if (fs_1.default.existsSync(scriptPath)) {
                log(`\n${'═'.repeat(70)}`, 'cyan');
                log(`▶ Running ${script}...`, 'yellow');
                log('═'.repeat(70), 'cyan');
                try {
                    (0, child_process_1.execSync)(`npx tsx "${scriptPath}" ${args.join(' ')}`, {
                        stdio: 'inherit',
                        cwd: process.cwd()
                    });
                }
                catch {
                    log(`⚠️ ${script} completed with warnings`, 'yellow');
                }
            }
        }
        log('\n╔══════════════════════════════════════════════════════════════════════════════╗', 'green');
        log('║     ✅ FULL ANALYSIS COMPLETE                                                ║', 'green');
        log('╚══════════════════════════════════════════════════════════════════════════════╝', 'green');
    }
    // ─────────────────────────────────────────────────────────────────────────────
    // QUICK FIX
    // ─────────────────────────────────────────────────────────────────────────────
    async quickFix() {
        console.log();
        log('╔══════════════════════════════════════════════════════════════════════════════╗', 'cyan');
        log('║     🔧 QANTUM QUICK FIX                                                      ║', 'cyan');
        log('╚══════════════════════════════════════════════════════════════════════════════╝', 'cyan');
        log('\nRunning automatic fixes...\n', 'white');
        const fixes = [
            { script: 'qantum-surgeon.ts', args: ['fix'] },
            { script: 'qantum-dep-doctor.ts', args: ['update', '--safe'] },
        ];
        for (const { script, args } of fixes) {
            const scriptPath = path_1.default.join(this.scriptsPath, script);
            if (fs_1.default.existsSync(scriptPath)) {
                log(`\n▶ Running ${script}...`, 'yellow');
                try {
                    (0, child_process_1.execSync)(`npx tsx "${scriptPath}" ${args.join(' ')}`, {
                        stdio: 'inherit',
                        cwd: process.cwd()
                    });
                }
                catch {
                    // Continue
                }
            }
        }
        log('\n✅ Quick fix complete!', 'green');
    }
    // ─────────────────────────────────────────────────────────────────────────────
    // PREPARE RELEASE
    // ─────────────────────────────────────────────────────────────────────────────
    async prepareRelease(bumpType = 'patch') {
        console.log();
        log('╔══════════════════════════════════════════════════════════════════════════════╗', 'cyan');
        log('║     🚀 QANTUM RELEASE PREPARATION                                            ║', 'cyan');
        log('╚══════════════════════════════════════════════════════════════════════════════╝', 'cyan');
        const steps = [
            { name: 'Type Check', script: 'qantum-surgeon.ts', args: ['diagnose'] },
            { name: 'Security Audit', script: 'qantum-dep-doctor.ts', args: ['audit'] },
            { name: 'Benchmarks', script: 'qantum-benchmark.ts', args: ['all'] },
            { name: 'Code Metrics', script: 'qantum-code-metrics.ts', args: ['report'] },
            { name: 'Release', script: 'qantum-release.ts', args: [bumpType, '--dry-run'] },
        ];
        for (const step of steps) {
            log(`\n${'─'.repeat(50)}`, 'dim');
            log(`📋 ${step.name}...`, 'cyan');
            const scriptPath = path_1.default.join(this.scriptsPath, step.script);
            if (fs_1.default.existsSync(scriptPath)) {
                try {
                    (0, child_process_1.execSync)(`npx tsx "${scriptPath}" ${step.args.join(' ')}`, {
                        stdio: 'inherit',
                        cwd: process.cwd()
                    });
                }
                catch {
                    log(`⚠️ ${step.name} had issues`, 'yellow');
                }
            }
        }
        log('\n╔══════════════════════════════════════════════════════════════════════════════╗', 'green');
        log('║     ✅ RELEASE PREPARATION COMPLETE                                          ║', 'green');
        log('╚══════════════════════════════════════════════════════════════════════════════╝', 'green');
        log(`\nTo proceed with release, run:`, 'white');
        log(`  npx tsx qantum-release.ts ${bumpType}`, 'cyan');
    }
    // ─────────────────────────────────────────────────────────────────────────────
    // SETUP PROJECT
    // ─────────────────────────────────────────────────────────────────────────────
    async setupProject() {
        console.log();
        log('╔══════════════════════════════════════════════════════════════════════════════╗', 'cyan');
        log('║     🏗️ QANTUM PROJECT SETUP                                                  ║', 'cyan');
        log('╚══════════════════════════════════════════════════════════════════════════════╝', 'cyan');
        const setup = [
            { name: 'Git Hooks', script: 'qantum-git-hooks.ts', args: ['install'] },
            { name: 'ENV Template', script: 'qantum-env-validator.ts', args: ['template'] },
            { name: 'ENV Schema', script: 'qantum-env-validator.ts', args: ['schema'] },
            { name: 'Backup Config', script: 'qantum-backup.ts', args: ['config'] },
            { name: 'CI/CD Pipelines', script: 'qantum-ci-cd.ts', args: ['generate'] },
        ];
        for (const step of setup) {
            log(`\n📋 Setting up ${step.name}...`, 'cyan');
            const scriptPath = path_1.default.join(this.scriptsPath, step.script);
            if (fs_1.default.existsSync(scriptPath)) {
                try {
                    (0, child_process_1.execSync)(`npx tsx "${scriptPath}" ${step.args.join(' ')}`, {
                        stdio: 'inherit',
                        cwd: process.cwd()
                    });
                }
                catch {
                    // Continue
                }
            }
        }
        log('\n✅ Project setup complete!', 'green');
    }
}
// ═══════════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════════
const args = process.argv.slice(2);
const command = args[0];
const subArgs = args.slice(1);
const master = new QantumMasterControl();
switch (command) {
    case 'run':
        if (!subArgs[0]) {
            log('❌ Please specify script to run', 'red');
            log('   Example: npx tsx qantum-master.ts run eagle analyze', 'dim');
        }
        else {
            master.run(subArgs[0], subArgs.slice(1));
        }
        break;
    case 'list':
        master.list();
        break;
    case 'status':
        master.status();
        break;
    case 'analyze':
        master.fullAnalysis();
        break;
    case 'fix':
        master.quickFix();
        break;
    case 'release':
        master.prepareRelease(subArgs[0] || 'patch');
        break;
    case 'setup':
        master.setupProject();
        break;
    default:
        console.log();
        log('╔══════════════════════════════════════════════════════════════════════════════╗', 'cyan');
        log('║     🦅 QANTUM MASTER CONTROL                                                 ║', 'cyan');
        log('║     "Скриптът не греши никога защото е математика."                          ║', 'cyan');
        log('╚══════════════════════════════════════════════════════════════════════════════╝', 'cyan');
        log(`
Usage: npx tsx qantum-master.ts <command> [options]

Commands:
  list              List all available scripts
  status            Show status of all scripts
  run <script>      Run a specific script
  analyze           Run full project analysis
  fix               Run automatic fixes
  release [type]    Prepare for release (major|minor|patch)
  setup             Setup project (hooks, configs, CI/CD)

Quick Commands:
  npx tsx qantum-master.ts analyze           # Full analysis
  npx tsx qantum-master.ts fix               # Auto-fix issues
  npx tsx qantum-master.ts release patch     # Prepare patch release
  npx tsx qantum-master.ts setup             # Setup project

Run Individual Scripts:
  npx tsx qantum-master.ts run eagle analyze
  npx tsx qantum-master.ts run surgeon fix
  npx tsx qantum-master.ts run benchmark all
  npx tsx qantum-master.ts run release minor

Available Scripts:
  eagle       - Eagle Orchestrator (project analysis)
  surgeon     - QANTUM Surgeon (TS error fix)
  release     - Release Manager (versioning)
  cicd        - CI/CD Generator (pipelines)
  dep         - Dependency Doctor (audit)
  benchmark   - Performance Benchmark
  hooks       - Git Hooks Manager
  env         - ENV Validator
  metrics     - Code Metrics
  backup      - Backup Manager
`, 'white');
}
