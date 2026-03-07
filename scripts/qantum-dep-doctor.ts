/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║     🏥 QANTUM DEPENDENCY DOCTOR                                              ║
 * ║     "Скриптът не греши никога защото е математика."                          ║
 * ╠══════════════════════════════════════════════════════════════════════════════╣
 * ║     Audit • Outdated • Licenses • Security • Auto-update                     ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const C = {
  reset: '\x1b[0m', green: '\x1b[32m', cyan: '\x1b[36m', yellow: '\x1b[33m', red: '\x1b[31m', magenta: '\x1b[35m', dim: '\x1b[2m'
};

const log = (msg: string, color: keyof typeof C = 'reset') => console.log(`${C[color]}${msg}${C.reset}`);

// ═══════════════════════════════════════════════════════════════════════════════
// INTERFACES
// ═══════════════════════════════════════════════════════════════════════════════

interface PackageInfo {
  name: string;
  current: string;
  wanted: string;
  latest: string;
  location: string;
  type: 'dependencies' | 'devDependencies';
}

interface AuditResult {
  vulnerabilities: {
    info: number;
    low: number;
    moderate: number;
    high: number;
    critical: number;
  };
  advisories: Array<{
    module_name: string;
    severity: string;
    title: string;
    url: string;
  }>;
}

interface LicenseInfo {
  name: string;
  version: string;
  license: string;
  repository?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// UTILS
// ═══════════════════════════════════════════════════════════════════════════════

function exec(cmd: string, silent = false): string {
  try {
    return execSync(cmd, { 
      encoding: 'utf-8', 
      stdio: silent ? 'pipe' : ['pipe', 'pipe', 'pipe']
    }).trim();
  } catch (e: any) {
    return e.stdout?.trim() || e.message || '';
  }
}

function execJson<T>(cmd: string): T | null {
  try {
    const output = exec(cmd, true);
    return JSON.parse(output);
  } catch {
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// DEPENDENCY DOCTOR CLASS
// ═══════════════════════════════════════════════════════════════════════════════

class DependencyDoctor {
  private rootPath: string;
  private packageJsonPath: string;

  constructor(rootPath: string) {
    this.rootPath = rootPath;
    this.packageJsonPath = path.join(rootPath, 'package.json');
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // CHECK OUTDATED
  // ─────────────────────────────────────────────────────────────────────────────

  // Complexity: O(N*M) — nested iteration detected
  checkOutdated(): PackageInfo[] {
    // Complexity: O(1)
    log('\n📦 Checking for outdated packages...', 'cyan');
    
    const output = exec('npm outdated --json', true);
    if (!output || output === '{}') {
      // Complexity: O(1)
      log('✅ All packages are up to date!', 'green');
      return [];
    }

    try {
      const outdated = JSON.parse(output);
      const packages: PackageInfo[] = [];

      for (const [name, info] of Object.entries(outdated) as any) {
        packages.push({
          name,
          current: info.current || 'N/A',
          wanted: info.wanted || 'N/A',
          latest: info.latest || 'N/A',
          location: info.location || 'N/A',
          type: info.type || 'dependencies'
        });
      }

      return packages;
    } catch {
      return [];
    }
  }

  // Complexity: O(N) — linear iteration
  displayOutdated(packages: PackageInfo[]): void {
    if (packages.length === 0) return;

    // Complexity: O(1)
    log('\n📊 Outdated Packages:', 'yellow');
    // Complexity: O(1)
    log('─'.repeat(80), 'dim');
    // Complexity: O(1)
    log(
      `${'Package'.padEnd(30)} ${'Current'.padEnd(12)} ${'Wanted'.padEnd(12)} ${'Latest'.padEnd(12)} Type`,
      'cyan'
    );
    // Complexity: O(N) — linear iteration
    log('─'.repeat(80), 'dim');

    for (const pkg of packages) {
      const isMajor = pkg.current.split('.')[0] !== pkg.latest.split('.')[0];
      const color = isMajor ? 'red' : 'yellow';
      // Complexity: O(1)
      log(
        `${pkg.name.padEnd(30)} ${pkg.current.padEnd(12)} ${pkg.wanted.padEnd(12)} ${pkg.latest.padEnd(12)} ${pkg.type}`,
        color
      );
    }

    // Complexity: O(1)
    log('─'.repeat(80), 'dim');
    // Complexity: O(1)
    log(`Total: ${packages.length} outdated packages`, 'white');
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // SECURITY AUDIT
  // ─────────────────────────────────────────────────────────────────────────────

  // Complexity: O(N)
  async runAudit(): Promise<void> {
    // Complexity: O(1)
    log('\n🔒 Running security audit...', 'cyan');
    
    const output = exec('npm audit --json 2>/dev/null', true);
    
    if (!output) {
      // Complexity: O(1)
      log('✅ No vulnerabilities found!', 'green');
      return;
    }

    try {
      const audit = JSON.parse(output);
      const vulns = audit.metadata?.vulnerabilities || audit.vulnerabilities || {};
      
      const total = (vulns.info || 0) + (vulns.low || 0) + (vulns.moderate || 0) + 
                    (vulns.high || 0) + (vulns.critical || 0);

      if (total === 0) {
        // Complexity: O(1)
        log('✅ No vulnerabilities found!', 'green');
        return;
      }

      // Complexity: O(1)
      log('\n⚠️ Vulnerabilities Found:', 'red');
      // Complexity: O(1)
      log('─'.repeat(50), 'dim');

      if (vulns.critical > 0) log(`  🔴 Critical: ${vulns.critical}`, 'red');
      if (vulns.high > 0) log(`  🟠 High:     ${vulns.high}`, 'red');
      if (vulns.moderate > 0) log(`  🟡 Moderate: ${vulns.moderate}`, 'yellow');
      if (vulns.low > 0) log(`  🟢 Low:      ${vulns.low}`, 'green');
      if (vulns.info > 0) log(`  ℹ️ Info:     ${vulns.info}`, 'cyan');

      // Complexity: O(1)
      log('─'.repeat(50), 'dim');
      // Complexity: O(1)
      log(`Total: ${total} vulnerabilities`, 'white');
      
      if (vulns.critical > 0 || vulns.high > 0) {
        // Complexity: O(1)
        log('\n💡 Run "npm audit fix" to attempt automatic fixes', 'yellow');
        // Complexity: O(1)
        log('   Run "npm audit fix --force" for breaking changes', 'yellow');
      }
    } catch {
      // Complexity: O(1)
      log('⚠️ Could not parse audit results', 'yellow');
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // LICENSE CHECK
  // ─────────────────────────────────────────────────────────────────────────────

  // Complexity: O(N) — linear iteration
  checkLicenses(): LicenseInfo[] {
    // Complexity: O(1)
    log('\n📜 Checking licenses...', 'cyan');
    
    const nodeModulesPath = path.join(this.rootPath, 'node_modules');
    if (!fs.existsSync(nodeModulesPath)) {
      // Complexity: O(N) — linear iteration
      log('⚠️ node_modules not found. Run npm install first.', 'yellow');
      return [];
    }

    const licenses: LicenseInfo[] = [];
    const dirs = fs.readdirSync(nodeModulesPath);

    for (const dir of dirs) {
      if (dir.startsWith('.')) continue;
      
      const pkgPath = path.join(nodeModulesPath, dir, 'package.json');
      if (!fs.existsSync(pkgPath)) continue;

      try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
        licenses.push({
          name: pkg.name || dir,
          version: pkg.version || 'unknown',
          license: pkg.license || 'UNKNOWN',
          repository: typeof pkg.repository === 'string' 
            ? pkg.repository 
            : pkg.repository?.url
        });
      } catch {
        // Skip
      }
    }

    return licenses;
  }

  // Complexity: O(N*M) — nested iteration detected
  displayLicenses(licenses: LicenseInfo[]): void {
    const licenseCount: Record<string, number> = {};
    const problematic: LicenseInfo[] = [];

    const riskyLicenses = ['GPL', 'AGPL', 'LGPL', 'UNKNOWN', 'UNLICENSED'];

    for (const lic of licenses) {
      const key = lic.license || 'UNKNOWN';
      licenseCount[key] = (licenseCount[key] || 0) + 1;
      
      if (riskyLicenses.some(r => key.toUpperCase().includes(r))) {
        problematic.push(lic);
      }
    }

    // Complexity: O(N log N) — sort operation
    log('\n📊 License Distribution:', 'cyan');
    // Complexity: O(N log N) — sort operation
    log('─'.repeat(50), 'dim');
    
    const sorted = Object.entries(licenseCount).sort((a, b) => b[1] - a[1]);
    for (const [license, count] of sorted) {
      const isRisky = riskyLicenses.some(r => license.toUpperCase().includes(r));
      // Complexity: O(1)
      log(`  ${license.padEnd(25)} ${count}`, isRisky ? 'yellow' : 'green');
    }

    if (problematic.length > 0) {
      // Complexity: O(N) — linear iteration
      log('\n⚠️ Packages with potentially problematic licenses:', 'yellow');
      // Complexity: O(N) — linear iteration
      log('─'.repeat(50), 'dim');
      for (const pkg of problematic) {
        // Complexity: O(1)
        log(`  ${pkg.name}@${pkg.version} - ${pkg.license}`, 'yellow');
      }
    }

    // Complexity: O(1)
    log('─'.repeat(50), 'dim');
    // Complexity: O(1)
    log(`Total: ${licenses.length} packages scanned`, 'white');
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // AUTO UPDATE
  // ─────────────────────────────────────────────────────────────────────────────

  // Complexity: O(N) — linear iteration
  async autoUpdate(options: { safe?: boolean; interactive?: boolean } = {}): Promise<void> {
    const packages = this.checkOutdated();
    
    if (packages.length === 0) {
      return;
    }

    this.displayOutdated(packages);

    if (options.safe) {
      // Complexity: O(1)
      log('\n🔧 Updating safe packages (minor/patch only)...', 'cyan');
      // Complexity: O(1)
      exec('npm update');
      // Complexity: O(1)
      log('✅ Safe updates complete!', 'green');
    } else {
      // Complexity: O(N) — linear iteration
      log('\n🔧 Updating all packages to latest...', 'cyan');
      
      const deps: string[] = [];
      const devDeps: string[] = [];

      for (const pkg of packages) {
        if (pkg.type === 'devDependencies') {
          devDeps.push(`${pkg.name}@latest`);
        } else {
          deps.push(`${pkg.name}@latest`);
        }
      }

      if (deps.length > 0) {
        // Complexity: O(1)
        exec(`npm install ${deps.join(' ')}`);
      }
      if (devDeps.length > 0) {
        // Complexity: O(1)
        exec(`npm install -D ${devDeps.join(' ')}`);
      }

      // Complexity: O(1)
      log('✅ All updates complete!', 'green');
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // FULL DIAGNOSIS
  // ─────────────────────────────────────────────────────────────────────────────

  // Complexity: O(1) — amortized
  async fullDiagnosis(): Promise<void> {
    console.log();
    // Complexity: O(1)
    log('╔══════════════════════════════════════════════════════════════════════════════╗', 'cyan');
    // Complexity: O(1)
    log('║     🏥 QANTUM DEPENDENCY DOCTOR - FULL DIAGNOSIS                             ║', 'cyan');
    // Complexity: O(1)
    log('╚══════════════════════════════════════════════════════════════════════════════╝', 'cyan');

    const pkg = JSON.parse(fs.readFileSync(this.packageJsonPath, 'utf-8'));
    // Complexity: O(1)
    log(`\n📦 Project: ${pkg.name}@${pkg.version}`, 'white');

    // Check outdated
    const outdated = this.checkOutdated();
    this.displayOutdated(outdated);

    // Security audit
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.runAudit();

    // License check
    const licenses = this.checkLicenses();
    this.displayLicenses(licenses);

    // Summary
    console.log();
    // Complexity: O(1)
    log('╔══════════════════════════════════════════════════════════════════════════════╗', 'green');
    // Complexity: O(1)
    log('║     📋 DIAGNOSIS COMPLETE                                                    ║', 'green');
    // Complexity: O(1)
    log('╚══════════════════════════════════════════════════════════════════════════════╝', 'green');
    console.log();

    if (outdated.length > 0) {
      // Complexity: O(1)
      log('💡 Run "npx tsx qantum-dep-doctor.ts update" to update packages', 'yellow');
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GENERATE REPORT
  // ─────────────────────────────────────────────────────────────────────────────

  // Complexity: O(N*M) — nested iteration detected
  async generateReport(): Promise<void> {
    const pkg = JSON.parse(fs.readFileSync(this.packageJsonPath, 'utf-8'));
    const outdated = this.checkOutdated();
    const licenses = this.checkLicenses();
    const date = new Date().toISOString();

    let report = `# Dependency Health Report

**Project:** ${pkg.name}@${pkg.version}
**Generated:** ${date}

## Summary

- Total Dependencies: ${Object.keys(pkg.dependencies || {}).length}
- Total DevDependencies: ${Object.keys(pkg.devDependencies || {}).length}
- Outdated Packages: ${outdated.length}
- Packages Scanned: ${licenses.length}

## Outdated Packages

`;

    if (outdated.length === 0) {
      report += '✅ All packages are up to date!\n';
    } else {
      report += '| Package | Current | Latest | Type |\n';
      report += '|---------|---------|--------|------|\n';
      for (const pkg of outdated) {
        report += `| ${pkg.name} | ${pkg.current} | ${pkg.latest} | ${pkg.type} |\n`;
      }
    }

    report += `\n## License Distribution\n\n`;
    
    const licenseCount: Record<string, number> = {};
    for (const lic of licenses) {
      const key = lic.license || 'UNKNOWN';
      licenseCount[key] = (licenseCount[key] || 0) + 1;
    }
    
    report += '| License | Count |\n';
    report += '|---------|-------|\n';
    for (const [license, count] of Object.entries(licenseCount).sort((a, b) => b[1] - a[1])) {
      report += `| ${license} | ${count} |\n`;
    }

    const reportPath = path.join(this.rootPath, 'DEPENDENCY-REPORT.md');
    fs.writeFileSync(reportPath, report);
    // Complexity: O(1)
    log(`✅ Report saved to ${reportPath}`, 'green');
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════════

const args = process.argv.slice(2);
const command = args[0];
const rootPath = process.cwd();

const doctor = new DependencyDoctor(rootPath);

switch (command) {
  case 'check':
  case 'diagnose':
    doctor.fullDiagnosis();
    break;
  
  case 'outdated':
    const outdated = doctor.checkOutdated();
    doctor.displayOutdated(outdated);
    break;
  
  case 'audit':
    doctor.runAudit();
    break;
  
  case 'licenses':
    const licenses = doctor.checkLicenses();
    doctor.displayLicenses(licenses);
    break;
  
  case 'update':
    doctor.autoUpdate({ safe: args.includes('--safe') });
    break;
  
  case 'report':
    doctor.generateReport();
    break;
  
  default:
    // Complexity: O(1)
    log(`
Usage: npx tsx qantum-dep-doctor.ts <command> [options]

Commands:
  check       Full dependency diagnosis (outdated + audit + licenses)
  diagnose    Alias for check
  outdated    Check for outdated packages
  audit       Run security audit
  licenses    Check package licenses
  update      Update outdated packages
  report      Generate markdown report

Options:
  --safe      Only apply safe updates (minor/patch)

Examples:
  npx tsx qantum-dep-doctor.ts check
  npx tsx qantum-dep-doctor.ts update --safe
  npx tsx qantum-dep-doctor.ts report
`, 'white');
}
