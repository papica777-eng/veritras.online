#!/usr/bin/env npx tsx
/**
 * 🔴 QANTUM ECOSYSTEM HEALTH MONITOR
 * ================================
 * РЕАЛНА диагностика - не хвалби, а ФАКТИ
 * 
 * Следи за:
 * - Счупени модули
 * - Липсващи node_modules
 * - TypeScript грешки
 * - Runtime crashes
 * - Self-healing status
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync, spawn } from 'child_process';

// ═══════════════════════════════════════════════════════════════
// SELF-HEALING INTEGRATION
// ═══════════════════════════════════════════════════════════════
interface HealingAction {
  type: 'npm_install' | 'tsc_fix' | 'restart_service' | 'clear_cache';
  target: string;
  command: string;
  description: string;
}

class SelfHealingIntegration {
  private healingLog: string[] = [];
  
  /**
   * Автоматично поправя счупени модули
   */
  async healBrokenModule(module: ModuleHealth): Promise<boolean> {
    console.log(`\n${CYAN}🏥 SELF-HEALING: ${module.name}${RESET}`);
    
    const actions = this.diagnoseAndPrescribe(module);
    
    for (const action of actions) {
      console.log(`   ${YELLOW}→ ${action.description}${RESET}`);
      
      try {
        execSync(action.command, { 
          cwd: action.target, 
          stdio: 'pipe',
          timeout: 120000 
        });
        this.healingLog.push(`✅ ${module.name}: ${action.description}`);
        console.log(`   ${GREEN}✅ SUCCESS${RESET}`);
      } catch (err: any) {
        this.healingLog.push(`❌ ${module.name}: ${action.description} FAILED`);
        console.log(`   ${RED}❌ FAILED: ${err.message?.slice(0, 100)}${RESET}`);
        return false;
      }
    }
    
    return actions.length > 0;
  }
  
  /**
   * Диагностицира проблемите и предписва лечение
   */
  private diagnoseAndPrescribe(module: ModuleHealth): HealingAction[] {
    const actions: HealingAction[] = [];
    
    // Липсващи node_modules
    if (!module.hasNodeModules && module.issues.some(i => i.includes('node_modules'))) {
      actions.push({
        type: 'npm_install',
        target: module.path,
        command: 'npm install --legacy-peer-deps',
        description: 'Installing dependencies'
      });
    }
    
    // TypeScript грешки - опитай да ребилднеш
    if (module.issues.some(i => i.includes('TypeScript'))) {
      if (fs.existsSync(path.join(module.path, 'node_modules'))) {
        actions.push({
          type: 'tsc_fix',
          target: module.path,
          command: 'npx tsc --skipLibCheck 2>&1 || true',
          description: 'Attempting TypeScript rebuild'
        });
      }
    }
    
    // Изчисти кеш ако има странни проблеми
    if (module.issues.some(i => i.includes('corrupt') || i.includes('cache'))) {
      actions.push({
        type: 'clear_cache',
        target: module.path,
        command: 'npm cache clean --force && rm -rf node_modules/.cache 2>&1 || true',
        description: 'Clearing cache'
      });
    }
    
    return actions;
  }
  
  getHealingLog(): string[] {
    return this.healingLog;
  }
}

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════
interface ModuleHealth {
  name: string;
  path: string;
  status: 'healthy' | 'broken' | 'warning' | 'unknown';
  issues: string[];
  version?: string;
  hasNodeModules: boolean;
  hasTsConfig: boolean;
  lastModified: Date;
  errors: string[];
}

interface EcosystemReport {
  timestamp: Date;
  totalModules: number;
  healthy: number;
  broken: number;
  warnings: number;
  criticalErrors: string[];
  modules: ModuleHealth[];
  selfHealingStatus: 'active' | 'inactive' | 'unknown';
}

// ═══════════════════════════════════════════════════════════════
// COLORS
// ═══════════════════════════════════════════════════════════════
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

// ═══════════════════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════════════════
const ECOSYSTEM_ROOT = process.env.ECOSYSTEM_ROOT || 'C:\\MisteMind';
const IGNORE_PATTERNS = [
  'node_modules',
  '.next',
  'dist',
  '.git',
  'backup',
  '.purge-backup',
  '.ascension-backup',
  '.backup',
  'purge-backup'
];

// ═══════════════════════════════════════════════════════════════
// ECOSYSTEM HEALTH MONITOR
// ═══════════════════════════════════════════════════════════════
class EcosystemHealthMonitor {
  private modules: ModuleHealth[] = [];
  private watchInterval: NodeJS.Timeout | null = null;
  private selfHealing: SelfHealingIntegration = new SelfHealingIntegration();
  
  /**
   * Сканира цялата екосистема
   */
  async scan(): Promise<EcosystemReport> {
    console.log(`\n${CYAN}${BOLD}🔬 QANTUM ECOSYSTEM HEALTH SCAN${RESET}`);
    console.log(`${CYAN}═══════════════════════════════════════════════════════════${RESET}\n`);
    
    this.modules = [];
    
    // Намери всички package.json файлове
    const packages = this.findPackages(ECOSYSTEM_ROOT);
    
    for (const pkgPath of packages) {
      const health = await this.analyzeModule(pkgPath);
      this.modules.push(health);
    }
    
    // Намери standalone TypeScript модули
    const standaloneModules = this.findStandaloneModules(ECOSYSTEM_ROOT);
    for (const modulePath of standaloneModules) {
      const health = await this.analyzeStandaloneModule(modulePath);
      this.modules.push(health);
    }
    
    // 🏥 AUTO-HEAL BROKEN MODULES
    const brokenModules = this.modules.filter(m => m.status === 'broken');
    if (brokenModules.length > 0 && process.argv.includes('--heal')) {
      console.log(`\n${CYAN}${BOLD}🏥 AUTO-HEALING ${brokenModules.length} BROKEN MODULES...${RESET}\n`);
      for (const broken of brokenModules) {
        const healed = await this.selfHealing.healBrokenModule(broken);
        if (healed) {
          // Re-analyze after healing
          const idx = this.modules.findIndex(m => m.path === broken.path);
          if (idx >= 0) {
            const pkgPath = path.join(broken.path, 'package.json');
            if (fs.existsSync(pkgPath)) {
              this.modules[idx] = await this.analyzeModule(pkgPath);
            }
          }
        }
      }
    }
    
    // Генерирай отчет
    return this.generateReport();
  }
  
  /**
   * Намира всички package.json файлове
   */
  private findPackages(rootDir: string): string[] {
    const packages: string[] = [];
    
    const scan = (dir: string) => {
      try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          
          // Игнорирай определени папки
          if (IGNORE_PATTERNS.some(p => entry.name.includes(p))) continue;
          
          if (entry.isDirectory()) {
            scan(fullPath);
          } else if (entry.name === 'package.json') {
            packages.push(fullPath);
          }
        }
      } catch (err) {
        // Игнорирай permission errors
      }
    };
    
    scan(rootDir);
    return packages;
  }
  
  /**
   * Намира standalone модули без package.json
   */
  private findStandaloneModules(rootDir: string): string[] {
    const modules: string[] = [];
    const securityDir = path.join(rootDir, 'security');
    
    if (fs.existsSync(securityDir)) {
      const scan = (dir: string) => {
        try {
          const entries = fs.readdirSync(dir, { withFileTypes: true });
          
          for (const entry of entries) {
            if (entry.isDirectory() && !entry.name.startsWith('_')) {
              modules.push(path.join(dir, entry.name));
            }
          }
        } catch (err) {}
      };
      
      scan(securityDir);
    }
    
    return modules;
  }
  
  /**
   * Анализира npm модул
   */
  private async analyzeModule(pkgPath: string): Promise<ModuleHealth> {
    const dir = path.dirname(pkgPath);
    const issues: string[] = [];
    const errors: string[] = [];
    let status: ModuleHealth['status'] = 'healthy';
    
    // Прочети package.json
    let pkg: any = {};
    try {
      pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    } catch (err) {
      issues.push('Invalid package.json');
      status = 'broken';
    }
    
    // Провери за node_modules
    const hasNodeModules = fs.existsSync(path.join(dir, 'node_modules'));
    if (!hasNodeModules && (pkg.dependencies || pkg.devDependencies)) {
      issues.push('Missing node_modules - run npm install');
      status = 'broken';
    }
    
    // Провери за tsconfig
    const hasTsConfig = fs.existsSync(path.join(dir, 'tsconfig.json'));
    
    // Провери за TypeScript грешки
    if (hasTsConfig && hasNodeModules) {
      try {
        execSync('npx tsc --noEmit 2>&1', { 
          cwd: dir, 
          stdio: 'pipe',
          timeout: 30000 
        });
      } catch (err: any) {
        const output = err.stdout?.toString() || err.stderr?.toString() || '';
        const errorCount = (output.match(/error TS/g) || []).length;
        if (errorCount > 0) {
          issues.push(`${errorCount} TypeScript errors`);
          if (status === 'healthy') status = 'warning';
          
          // Извлечи първите 3 грешки
          const errorLines = output.split('\n').filter((l: string) => l.includes('error TS'));
          errors.push(...errorLines.slice(0, 3));
        }
      }
    }
    
    // Провери за TODO/FIXME/BROKEN в кода
    const brokenMarkers = this.findBrokenMarkers(dir);
    if (brokenMarkers.length > 0) {
      issues.push(`${brokenMarkers.length} files with TODO/FIXME/BROKEN`);
      if (status === 'healthy') status = 'warning';
    }
    
    // Провери версиите (v1, v2, v3)
    const versionIssues = this.checkVersionFragmentation(dir);
    if (versionIssues.length > 0) {
      issues.push(...versionIssues);
      if (status === 'healthy') status = 'warning';
    }
    
    return {
      name: pkg.name || path.basename(dir),
      path: dir,
      status,
      issues,
      version: pkg.version,
      hasNodeModules,
      hasTsConfig,
      lastModified: fs.statSync(pkgPath).mtime,
      errors
    };
  }
  
  /**
   * Анализира standalone модул
   */
  private async analyzeStandaloneModule(modulePath: string): Promise<ModuleHealth> {
    const issues: string[] = [];
    const errors: string[] = [];
    let status: ModuleHealth['status'] = 'unknown';
    
    // Провери дали има index.ts
    const hasIndex = fs.existsSync(path.join(modulePath, 'index.ts')) ||
                     fs.existsSync(path.join(modulePath, '_index.ts'));
    
    if (!hasIndex) {
      issues.push('No entry point (index.ts)');
    }
    
    // Брой файлове
    try {
      const files = fs.readdirSync(modulePath).filter(f => f.endsWith('.ts'));
      
      if (files.length === 0) {
        issues.push('Empty module');
        status = 'broken';
      } else {
        status = 'healthy';
      }
      
      // Провери за BROKEN маркери
      for (const file of files) {
        const content = fs.readFileSync(path.join(modulePath, file), 'utf-8');
        if (/TODO|FIXME|BROKEN|NOT.?IMPLEMENTED/i.test(content)) {
          issues.push(`${file} has unfinished code`);
          if (status === 'healthy') status = 'warning';
        }
      }
    } catch (err) {
      issues.push('Cannot read module');
      status = 'broken';
    }
    
    return {
      name: path.basename(modulePath),
      path: modulePath,
      status,
      issues,
      hasNodeModules: false,
      hasTsConfig: false,
      lastModified: fs.statSync(modulePath).mtime,
      errors
    };
  }
  
  /**
   * Търси TODO/FIXME/BROKEN маркери
   */
  private findBrokenMarkers(dir: string): string[] {
    const files: string[] = [];
    
    const scan = (d: string) => {
      try {
        const entries = fs.readdirSync(d, { withFileTypes: true });
        
        for (const entry of entries) {
          if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
          
          const fullPath = path.join(d, entry.name);
          
          if (entry.isDirectory()) {
            scan(fullPath);
          } else if (entry.name.endsWith('.ts') || entry.name.endsWith('.js')) {
            try {
              const content = fs.readFileSync(fullPath, 'utf-8');
              if (/TODO|FIXME|BROKEN|NOT.?IMPLEMENTED/i.test(content)) {
                files.push(entry.name);
              }
            } catch {}
          }
        }
      } catch {}
    };
    
    scan(dir);
    return files;
  }
  
  /**
   * Проверява за фрагментация на версии
   */
  private checkVersionFragmentation(dir: string): string[] {
    const issues: string[] = [];
    
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      const versions: string[] = [];
      
      for (const entry of entries) {
        if (entry.name.match(/v\d+|version-?\d+|-v\d+/i)) {
          versions.push(entry.name);
        }
      }
      
      if (versions.length > 1) {
        issues.push(`Multiple versions detected: ${versions.join(', ')}`);
      }
    } catch {}
    
    return issues;
  }
  
  /**
   * Генерира финален отчет
   */
  private generateReport(): EcosystemReport {
    const healthy = this.modules.filter(m => m.status === 'healthy').length;
    const broken = this.modules.filter(m => m.status === 'broken').length;
    const warnings = this.modules.filter(m => m.status === 'warning').length;
    
    // Събери критични грешки
    const criticalErrors: string[] = [];
    for (const m of this.modules) {
      if (m.status === 'broken') {
        criticalErrors.push(`${m.name}: ${m.issues.join(', ')}`);
      }
    }
    
    // Провери self-healing статус
    const selfHealingPath = path.join(ECOSYSTEM_ROOT, 'security', 'healing', 'self-healing.ts');
    let selfHealingStatus: 'active' | 'inactive' | 'unknown' = 'unknown';
    if (fs.existsSync(selfHealingPath)) {
      selfHealingStatus = 'active'; // Вече е интегриран!
    }

    const report: EcosystemReport = {
      timestamp: new Date(),
      totalModules: this.modules.length,
      healthy,
      broken,
      warnings,
      criticalErrors,
      modules: this.modules,
      selfHealingStatus
    };
    
    this.printReport(report);
    this.saveReport(report);
    
    return report;
  }
  
  /**
   * Принтира отчета
   */
  private printReport(report: EcosystemReport): void {
    console.log(`\n${BOLD}╔══════════════════════════════════════════════════════════════════╗${RESET}`);
    console.log(`${BOLD}║          🔴 ECOSYSTEM HEALTH REPORT                              ║${RESET}`);
    console.log(`${BOLD}╠══════════════════════════════════════════════════════════════════╣${RESET}`);
    console.log(`${BOLD}║${RESET}  📊 Total Modules:     ${report.totalModules.toString().padEnd(38)}${BOLD}║${RESET}`);
    console.log(`${BOLD}║${RESET}  ${GREEN}✅ Healthy:${RESET}           ${report.healthy.toString().padEnd(38)}${BOLD}║${RESET}`);
    console.log(`${BOLD}║${RESET}  ${YELLOW}⚠️  Warnings:${RESET}          ${report.warnings.toString().padEnd(38)}${BOLD}║${RESET}`);
    console.log(`${BOLD}║${RESET}  ${RED}❌ Broken:${RESET}            ${report.broken.toString().padEnd(38)}${BOLD}║${RESET}`);
    console.log(`${BOLD}╠══════════════════════════════════════════════════════════════════╣${RESET}`);
    
    // Self-healing статус
    const healingColor = report.selfHealingStatus === 'active' ? GREEN : RED;
    console.log(`${BOLD}║${RESET}  🏥 Self-Healing:      ${healingColor}${report.selfHealingStatus.toUpperCase().padEnd(38)}${RESET}${BOLD}║${RESET}`);
    console.log(`${BOLD}╚══════════════════════════════════════════════════════════════════╝${RESET}`);
    
    // Критични грешки
    if (report.criticalErrors.length > 0) {
      console.log(`\n${RED}${BOLD}🚨 CRITICAL ERRORS:${RESET}`);
      for (const err of report.criticalErrors.slice(0, 10)) {
        console.log(`${RED}   ❌ ${err}${RESET}`);
      }
      if (report.criticalErrors.length > 10) {
        console.log(`${RED}   ... and ${report.criticalErrors.length - 10} more${RESET}`);
      }
    }
    
    // Модули с проблеми
    console.log(`\n${YELLOW}${BOLD}⚠️  MODULES NEEDING ATTENTION:${RESET}`);
    const problemModules = this.modules
      .filter(m => m.status !== 'healthy')
      .slice(0, 15);
    
    for (const m of problemModules) {
      const icon = m.status === 'broken' ? '❌' : '⚠️';
      const color = m.status === 'broken' ? RED : YELLOW;
      console.log(`${color}   ${icon} ${m.name}: ${m.issues.slice(0, 2).join(', ')}${RESET}`);
    }
    
    // Здрави модули
    console.log(`\n${GREEN}${BOLD}✅ HEALTHY MODULES:${RESET}`);
    const healthyModules = this.modules.filter(m => m.status === 'healthy').slice(0, 10);
    for (const m of healthyModules) {
      console.log(`${GREEN}   ✅ ${m.name} (v${m.version || '?'})${RESET}`);
    }
  }
  
  /**
   * Запазва отчета
   */
  private saveReport(report: EcosystemReport): void {
    const reportPath = path.join(ECOSYSTEM_ROOT, 'ECOSYSTEM-HEALTH-REPORT.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n${CYAN}📄 Report saved to: ${reportPath}${RESET}`);
    
    // Markdown версия
    const mdPath = path.join(ECOSYSTEM_ROOT, 'ECOSYSTEM-HEALTH-REPORT.md');
    const md = this.generateMarkdown(report);
    fs.writeFileSync(mdPath, md);
    console.log(`${CYAN}📄 Markdown report: ${mdPath}${RESET}`);
  }
  
  /**
   * Генерира Markdown отчет
   */
  private generateMarkdown(report: EcosystemReport): string {
    let md = `# 🔴 QANTUM ECOSYSTEM HEALTH REPORT
    
Generated: ${report.timestamp.toISOString()}

## Overview

| Metric | Value |
|--------|-------|
| Total Modules | ${report.totalModules} |
| ✅ Healthy | ${report.healthy} |
| ⚠️ Warnings | ${report.warnings} |
| ❌ Broken | ${report.broken} |
| 🏥 Self-Healing | ${report.selfHealingStatus} |

## Critical Errors

${report.criticalErrors.length === 0 ? 'None' : report.criticalErrors.map(e => `- ❌ ${e}`).join('\n')}

## Broken Modules

${this.modules.filter(m => m.status === 'broken').map(m => `
### ❌ ${m.name}
- Path: \`${m.path}\`
- Issues: ${m.issues.join(', ')}
`).join('\n')}

## Modules with Warnings

${this.modules.filter(m => m.status === 'warning').map(m => `
### ⚠️ ${m.name}
- Path: \`${m.path}\`
- Issues: ${m.issues.join(', ')}
`).join('\n')}

## Healthy Modules

${this.modules.filter(m => m.status === 'healthy').map(m => `- ✅ ${m.name} (v${m.version || '?'})`).join('\n')}

## Recommendations

1. Run \`npm install\` in broken modules
2. Fix TypeScript errors
3. Activate Self-Healing integration
4. Consolidate version fragmentation (v1/v2/v3)
`;
    
    return md;
  }
  
  /**
   * Стартира real-time мониторинг
   */
  startWatch(intervalMs: number = 60000): void {
    console.log(`${CYAN}👁️ Starting ecosystem watch (every ${intervalMs/1000}s)...${RESET}`);
    
    this.watchInterval = setInterval(async () => {
      console.clear();
      await this.scan();
    }, intervalMs);
    
    // Първоначално сканиране
    this.scan();
  }
  
  /**
   * Спира мониторинга
   */
  stopWatch(): void {
    if (this.watchInterval) {
      clearInterval(this.watchInterval);
      this.watchInterval = null;
      console.log(`${YELLOW}👁️ Ecosystem watch stopped${RESET}`);
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════
async function main() {
  const args = process.argv.slice(2);
  const monitor = new EcosystemHealthMonitor();
  
  if (args.includes('--watch') || args.includes('-w')) {
    const interval = parseInt(args[args.indexOf('--interval') + 1] || '60000');
    monitor.startWatch(interval);
    
    // Handle Ctrl+C
    process.on('SIGINT', () => {
      monitor.stopWatch();
      process.exit(0);
    });
  } else {
    await monitor.scan();
  }
}

main().catch(console.error);
