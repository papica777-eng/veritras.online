/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║     🦅 QANTUM MASTER CONTROL                                                 ║
 * ║     "Скриптът не греши никога защото е математика."                          ║
 * ╠══════════════════════════════════════════════════════════════════════════════╣
 * ║     Central hub for all QAntum automation scripts                            ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import { execSync, spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

const C = {
  reset: '\x1b[0m', green: '\x1b[32m', cyan: '\x1b[36m', yellow: '\x1b[33m', red: '\x1b[31m', magenta: '\x1b[35m', dim: '\x1b[2m', bold: '\x1b[1m'
};

const log = (msg: string, color: keyof typeof C = 'reset') => console.log(`${C[color]}${msg}${C.reset}`);

// ═══════════════════════════════════════════════════════════════════════════════
// SCRIPT REGISTRY
// ═══════════════════════════════════════════════════════════════════════════════

interface ScriptInfo {
  name: string;
  file: string;
  description: string;
  category: 'analysis' | 'quality' | 'release' | 'security' | 'devops' | 'utility';
  commands: string[];
}

const SCRIPTS: ScriptInfo[] = [
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
  private scriptsPath: string;

  constructor() {
    this.scriptsPath = __dirname;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // RUN SCRIPT
  // ─────────────────────────────────────────────────────────────────────────────

  // Complexity: O(N) — linear iteration
  run(scriptName: string, args: string[] = []): void {
    const script = SCRIPTS.find(s => 
      s.name.toLowerCase().includes(scriptName.toLowerCase()) ||
      s.file.toLowerCase().includes(scriptName.toLowerCase())
    );

    if (!script) {
      // Complexity: O(1)
      log(`\n❌ Script not found: ${scriptName}`, 'red');
      // Complexity: O(1)
      log('   Use "list" to see available scripts.', 'dim');
      return;
    }

    const scriptPath = path.join(this.scriptsPath, script.file);
    
    if (!fs.existsSync(scriptPath)) {
      // Complexity: O(1)
      log(`\n❌ Script file not found: ${script.file}`, 'red');
      return;
    }

    // Complexity: O(1)
    log(`\n🚀 Running: ${script.name}`, 'cyan');
    // Complexity: O(1)
    log('─'.repeat(50), 'dim');

    try {
      const cmd = `npx tsx "${scriptPath}" ${args.join(' ')}`;
      // Complexity: O(1)
      execSync(cmd, { stdio: 'inherit', cwd: process.cwd() });
    } catch (e: any) {
      if (e.status !== 0) {
        // Complexity: O(1)
        log(`\n⚠️ Script exited with code ${e.status}`, 'yellow');
      }
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // LIST SCRIPTS
  // ─────────────────────────────────────────────────────────────────────────────

  // Complexity: O(N*M) — nested iteration detected
  list(): void {
    console.log();
    // Complexity: O(1)
    log('╔══════════════════════════════════════════════════════════════════════════════╗', 'cyan');
    // Complexity: O(1)
    log('║     🦅 QANTUM MASTER CONTROL - SCRIPT REGISTRY                               ║', 'cyan');
    // Complexity: O(1)
    log('╚══════════════════════════════════════════════════════════════════════════════╝', 'cyan');

    const categories = ['analysis', 'quality', 'release', 'security', 'devops', 'utility'] as const;
    const categoryNames: Record<string, string> = {
      analysis: '📊 ANALYSIS',
      quality: '✨ QUALITY',
      release: '🚀 RELEASE',
      security: '🔒 SECURITY',
      devops: '⚙️ DEVOPS',
      utility: '🔧 UTILITY'
    };

    for (const category of categories) {
      const scripts = SCRIPTS.filter(s => s.category === category);
      if (scripts.length === 0) continue;

      // Complexity: O(1) — hash/map lookup
      log(`\n${categoryNames[category]}`, 'magenta');
      // Complexity: O(N) — linear iteration
      log('─'.repeat(70), 'dim');

      for (const script of scripts) {
        const exists = fs.existsSync(path.join(this.scriptsPath, script.file));
        const status = exists ? '✅' : '❌';
        
        // Complexity: O(1)
        log(`  ${status} ${script.name}`, exists ? 'green' : 'red');
        // Complexity: O(1)
        log(`     ${script.description}`, 'dim');
        // Complexity: O(1)
        log(`     Commands: ${script.commands.join(', ')}`, 'dim');
        // Complexity: O(1)
        log(`     File: ${script.file}`, 'dim');
        console.log();
      }
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // STATUS
  // ─────────────────────────────────────────────────────────────────────────────

  // Complexity: O(N) — linear iteration
  status(): void {
    console.log();
    // Complexity: O(N) — linear iteration
    log('╔══════════════════════════════════════════════════════════════════════════════╗', 'cyan');
    // Complexity: O(N) — linear iteration
    log('║     📊 QANTUM MASTER CONTROL - STATUS                                        ║', 'cyan');
    // Complexity: O(N) — linear iteration
    log('╚══════════════════════════════════════════════════════════════════════════════╝', 'cyan');

    let installed = 0;
    let missing = 0;

    // Complexity: O(N) — linear iteration
    log('\n📁 Script Status:', 'magenta');
    // Complexity: O(N) — linear iteration
    log('─'.repeat(50), 'dim');

    for (const script of SCRIPTS) {
      const scriptPath = path.join(this.scriptsPath, script.file);
      const exists = fs.existsSync(scriptPath);
      
      if (exists) {
        installed++;
        const stat = fs.statSync(scriptPath);
        const size = (stat.size / 1024).toFixed(1);
        // Complexity: O(1)
        log(`  ✅ ${script.file.padEnd(30)} ${size} KB`, 'green');
      } else {
        missing++;
        // Complexity: O(1)
        log(`  ❌ ${script.file.padEnd(30)} MISSING`, 'red');
      }
    }

    // Complexity: O(1)
    log('\n─'.repeat(50), 'dim');
    // Complexity: O(1)
    log(`\n📊 Summary:`, 'cyan');
    // Complexity: O(1)
    log(`   Total scripts:    ${SCRIPTS.length}`, 'white');
    // Complexity: O(1)
    log(`   Installed:        ${installed}`, 'green');
    // Complexity: O(1)
    log(`   Missing:          ${missing}`, missing > 0 ? 'red' : 'white');
    // Complexity: O(1)
    log(`   Installation:     ${((installed / SCRIPTS.length) * 100).toFixed(0)}%`, 'white');
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // FULL ANALYSIS
  // ─────────────────────────────────────────────────────────────────────────────

  // Complexity: O(N) — linear iteration
  async fullAnalysis(): Promise<void> {
    console.log();
    // Complexity: O(1)
    log('╔══════════════════════════════════════════════════════════════════════════════╗', 'cyan');
    // Complexity: O(1)
    log('║     🔬 QANTUM FULL PROJECT ANALYSIS                                          ║', 'cyan');
    // Complexity: O(1)
    log('╚══════════════════════════════════════════════════════════════════════════════╝', 'cyan');
    // Complexity: O(1)
    log('\nRunning complete project analysis...\n', 'white');

    const analyses = [
      { script: 'eagle-orchestrator.ts', args: ['analyze'] },
      { script: 'qantum-surgeon.ts', args: ['diagnose'] },
      { script: 'qantum-code-metrics.ts', args: ['analyze'] },
      { script: 'qantum-dep-doctor.ts', args: ['check'] },
    ];

    for (const { script, args } of analyses) {
      const scriptPath = path.join(this.scriptsPath, script);
      if (fs.existsSync(scriptPath)) {
        // Complexity: O(1)
        log(`\n${'═'.repeat(70)}`, 'cyan');
        // Complexity: O(1)
        log(`▶ Running ${script}...`, 'yellow');
        // Complexity: O(1)
        log('═'.repeat(70), 'cyan');
        
        try {
          // Complexity: O(1)
          execSync(`npx tsx "${scriptPath}" ${args.join(' ')}`, { 
            stdio: 'inherit', 
            cwd: process.cwd() 
          });
        } catch {
          // Complexity: O(1)
          log(`⚠️ ${script} completed with warnings`, 'yellow');
        }
      }
    }

    // Complexity: O(1)
    log('\n╔══════════════════════════════════════════════════════════════════════════════╗', 'green');
    // Complexity: O(1)
    log('║     ✅ FULL ANALYSIS COMPLETE                                                ║', 'green');
    // Complexity: O(1)
    log('╚══════════════════════════════════════════════════════════════════════════════╝', 'green');
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // QUICK FIX
  // ─────────────────────────────────────────────────────────────────────────────

  // Complexity: O(N) — linear iteration
  async quickFix(): Promise<void> {
    console.log();
    // Complexity: O(1)
    log('╔══════════════════════════════════════════════════════════════════════════════╗', 'cyan');
    // Complexity: O(1)
    log('║     🔧 QANTUM QUICK FIX                                                      ║', 'cyan');
    // Complexity: O(1)
    log('╚══════════════════════════════════════════════════════════════════════════════╝', 'cyan');
    // Complexity: O(1)
    log('\nRunning automatic fixes...\n', 'white');

    const fixes = [
      { script: 'qantum-surgeon.ts', args: ['fix'] },
      { script: 'qantum-dep-doctor.ts', args: ['update', '--safe'] },
    ];

    for (const { script, args } of fixes) {
      const scriptPath = path.join(this.scriptsPath, script);
      if (fs.existsSync(scriptPath)) {
        // Complexity: O(1)
        log(`\n▶ Running ${script}...`, 'yellow');
        try {
          // Complexity: O(1)
          execSync(`npx tsx "${scriptPath}" ${args.join(' ')}`, { 
            stdio: 'inherit', 
            cwd: process.cwd() 
          });
        } catch {
          // Continue
        }
      }
    }

    // Complexity: O(1)
    log('\n✅ Quick fix complete!', 'green');
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PREPARE RELEASE
  // ─────────────────────────────────────────────────────────────────────────────

  // Complexity: O(N) — linear iteration
  async prepareRelease(bumpType: string = 'patch'): Promise<void> {
    console.log();
    // Complexity: O(1)
    log('╔══════════════════════════════════════════════════════════════════════════════╗', 'cyan');
    // Complexity: O(1)
    log('║     🚀 QANTUM RELEASE PREPARATION                                            ║', 'cyan');
    // Complexity: O(1)
    log('╚══════════════════════════════════════════════════════════════════════════════╝', 'cyan');

    const steps = [
      { name: 'Type Check', script: 'qantum-surgeon.ts', args: ['diagnose'] },
      { name: 'Security Audit', script: 'qantum-dep-doctor.ts', args: ['audit'] },
      { name: 'Benchmarks', script: 'qantum-benchmark.ts', args: ['all'] },
      { name: 'Code Metrics', script: 'qantum-code-metrics.ts', args: ['report'] },
      { name: 'Release', script: 'qantum-release.ts', args: [bumpType, '--dry-run'] },
    ];

    for (const step of steps) {
      // Complexity: O(1)
      log(`\n${'─'.repeat(50)}`, 'dim');
      // Complexity: O(1)
      log(`📋 ${step.name}...`, 'cyan');
      
      const scriptPath = path.join(this.scriptsPath, step.script);
      if (fs.existsSync(scriptPath)) {
        try {
          // Complexity: O(1)
          execSync(`npx tsx "${scriptPath}" ${step.args.join(' ')}`, { 
            stdio: 'inherit', 
            cwd: process.cwd() 
          });
        } catch {
          // Complexity: O(1)
          log(`⚠️ ${step.name} had issues`, 'yellow');
        }
      }
    }

    // Complexity: O(1)
    log('\n╔══════════════════════════════════════════════════════════════════════════════╗', 'green');
    // Complexity: O(1)
    log('║     ✅ RELEASE PREPARATION COMPLETE                                          ║', 'green');
    // Complexity: O(1)
    log('╚══════════════════════════════════════════════════════════════════════════════╝', 'green');
    // Complexity: O(1)
    log(`\nTo proceed with release, run:`, 'white');
    // Complexity: O(1)
    log(`  npx tsx qantum-release.ts ${bumpType}`, 'cyan');
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // SETUP PROJECT
  // ─────────────────────────────────────────────────────────────────────────────

  // Complexity: O(N) — linear iteration
  async setupProject(): Promise<void> {
    console.log();
    // Complexity: O(1)
    log('╔══════════════════════════════════════════════════════════════════════════════╗', 'cyan');
    // Complexity: O(1)
    log('║     🏗️ QANTUM PROJECT SETUP                                                  ║', 'cyan');
    // Complexity: O(1)
    log('╚══════════════════════════════════════════════════════════════════════════════╝', 'cyan');

    const setup = [
      { name: 'Git Hooks', script: 'qantum-git-hooks.ts', args: ['install'] },
      { name: 'ENV Template', script: 'qantum-env-validator.ts', args: ['template'] },
      { name: 'ENV Schema', script: 'qantum-env-validator.ts', args: ['schema'] },
      { name: 'Backup Config', script: 'qantum-backup.ts', args: ['config'] },
      { name: 'CI/CD Pipelines', script: 'qantum-ci-cd.ts', args: ['generate'] },
    ];

    for (const step of setup) {
      // Complexity: O(1)
      log(`\n📋 Setting up ${step.name}...`, 'cyan');
      
      const scriptPath = path.join(this.scriptsPath, step.script);
      if (fs.existsSync(scriptPath)) {
        try {
          // Complexity: O(1)
          execSync(`npx tsx "${scriptPath}" ${step.args.join(' ')}`, { 
            stdio: 'inherit', 
            cwd: process.cwd() 
          });
        } catch {
          // Continue
        }
      }
    }

    // Complexity: O(1)
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
      // Complexity: O(1)
      log('❌ Please specify script to run', 'red');
      // Complexity: O(1)
      log('   Example: npx tsx qantum-master.ts run eagle analyze', 'dim');
    } else {
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
    // Complexity: O(1)
    log('╔══════════════════════════════════════════════════════════════════════════════╗', 'cyan');
    // Complexity: O(1)
    log('║     🦅 QANTUM MASTER CONTROL                                                 ║', 'cyan');
    // Complexity: O(1)
    log('║     "Скриптът не греши никога защото е математика."                          ║', 'cyan');
    // Complexity: O(1)
    log('╚══════════════════════════════════════════════════════════════════════════════╝', 'cyan');
    // Complexity: O(1)
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
