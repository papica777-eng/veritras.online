"use strict";
/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║     🏥 QANTUM DEPENDENCY DOCTOR                                              ║
 * ║     "Скриптът не греши никога защото е математика."                          ║
 * ╠══════════════════════════════════════════════════════════════════════════════╣
 * ║     Audit • Outdated • Licenses • Security • Auto-update                     ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const child_process_1 = require("child_process");
const C = {
    reset: '\x1b[0m', green: '\x1b[32m', cyan: '\x1b[36m', yellow: '\x1b[33m', red: '\x1b[31m', magenta: '\x1b[35m', dim: '\x1b[2m'
};
const log = (msg, color = 'reset') => console.log(`${C[color]}${msg}${C.reset}`);
// ═══════════════════════════════════════════════════════════════════════════════
// UTILS
// ═══════════════════════════════════════════════════════════════════════════════
function exec(cmd, silent = false) {
    try {
        return (0, child_process_1.execSync)(cmd, {
            encoding: 'utf-8',
            stdio: silent ? 'pipe' : ['pipe', 'pipe', 'pipe']
        }).trim();
    }
    catch (e) {
        return e.stdout?.trim() || e.message || '';
    }
}
function execJson(cmd) {
    try {
        const output = exec(cmd, true);
        return JSON.parse(output);
    }
    catch {
        return null;
    }
}
// ═══════════════════════════════════════════════════════════════════════════════
// DEPENDENCY DOCTOR CLASS
// ═══════════════════════════════════════════════════════════════════════════════
class DependencyDoctor {
    rootPath;
    packageJsonPath;
    constructor(rootPath) {
        this.rootPath = rootPath;
        this.packageJsonPath = path_1.default.join(rootPath, 'package.json');
    }
    // ─────────────────────────────────────────────────────────────────────────────
    // CHECK OUTDATED
    // ─────────────────────────────────────────────────────────────────────────────
    checkOutdated() {
        log('\n📦 Checking for outdated packages...', 'cyan');
        const output = exec('npm outdated --json', true);
        if (!output || output === '{}') {
            log('✅ All packages are up to date!', 'green');
            return [];
        }
        try {
            const outdated = JSON.parse(output);
            const packages = [];
            for (const [name, info] of Object.entries(outdated)) {
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
        }
        catch {
            return [];
        }
    }
    displayOutdated(packages) {
        if (packages.length === 0)
            return;
        log('\n📊 Outdated Packages:', 'yellow');
        log('─'.repeat(80), 'dim');
        log(`${'Package'.padEnd(30)} ${'Current'.padEnd(12)} ${'Wanted'.padEnd(12)} ${'Latest'.padEnd(12)} Type`, 'cyan');
        log('─'.repeat(80), 'dim');
        for (const pkg of packages) {
            const isMajor = pkg.current.split('.')[0] !== pkg.latest.split('.')[0];
            const color = isMajor ? 'red' : 'yellow';
            log(`${pkg.name.padEnd(30)} ${pkg.current.padEnd(12)} ${pkg.wanted.padEnd(12)} ${pkg.latest.padEnd(12)} ${pkg.type}`, color);
        }
        log('─'.repeat(80), 'dim');
        log(`Total: ${packages.length} outdated packages`, 'white');
    }
    // ─────────────────────────────────────────────────────────────────────────────
    // SECURITY AUDIT
    // ─────────────────────────────────────────────────────────────────────────────
    async runAudit() {
        log('\n🔒 Running security audit...', 'cyan');
        const output = exec('npm audit --json 2>/dev/null', true);
        if (!output) {
            log('✅ No vulnerabilities found!', 'green');
            return;
        }
        try {
            const audit = JSON.parse(output);
            const vulns = audit.metadata?.vulnerabilities || audit.vulnerabilities || {};
            const total = (vulns.info || 0) + (vulns.low || 0) + (vulns.moderate || 0) +
                (vulns.high || 0) + (vulns.critical || 0);
            if (total === 0) {
                log('✅ No vulnerabilities found!', 'green');
                return;
            }
            log('\n⚠️ Vulnerabilities Found:', 'red');
            log('─'.repeat(50), 'dim');
            if (vulns.critical > 0)
                log(`  🔴 Critical: ${vulns.critical}`, 'red');
            if (vulns.high > 0)
                log(`  🟠 High:     ${vulns.high}`, 'red');
            if (vulns.moderate > 0)
                log(`  🟡 Moderate: ${vulns.moderate}`, 'yellow');
            if (vulns.low > 0)
                log(`  🟢 Low:      ${vulns.low}`, 'green');
            if (vulns.info > 0)
                log(`  ℹ️ Info:     ${vulns.info}`, 'cyan');
            log('─'.repeat(50), 'dim');
            log(`Total: ${total} vulnerabilities`, 'white');
            if (vulns.critical > 0 || vulns.high > 0) {
                log('\n💡 Run "npm audit fix" to attempt automatic fixes', 'yellow');
                log('   Run "npm audit fix --force" for breaking changes', 'yellow');
            }
        }
        catch {
            log('⚠️ Could not parse audit results', 'yellow');
        }
    }
    // ─────────────────────────────────────────────────────────────────────────────
    // LICENSE CHECK
    // ─────────────────────────────────────────────────────────────────────────────
    checkLicenses() {
        log('\n📜 Checking licenses...', 'cyan');
        const nodeModulesPath = path_1.default.join(this.rootPath, 'node_modules');
        if (!fs_1.default.existsSync(nodeModulesPath)) {
            log('⚠️ node_modules not found. Run npm install first.', 'yellow');
            return [];
        }
        const licenses = [];
        const dirs = fs_1.default.readdirSync(nodeModulesPath);
        for (const dir of dirs) {
            if (dir.startsWith('.'))
                continue;
            const pkgPath = path_1.default.join(nodeModulesPath, dir, 'package.json');
            if (!fs_1.default.existsSync(pkgPath))
                continue;
            try {
                const pkg = JSON.parse(fs_1.default.readFileSync(pkgPath, 'utf-8'));
                licenses.push({
                    name: pkg.name || dir,
                    version: pkg.version || 'unknown',
                    license: pkg.license || 'UNKNOWN',
                    repository: typeof pkg.repository === 'string'
                        ? pkg.repository
                        : pkg.repository?.url
                });
            }
            catch {
                // Skip
            }
        }
        return licenses;
    }
    displayLicenses(licenses) {
        const licenseCount = {};
        const problematic = [];
        const riskyLicenses = ['GPL', 'AGPL', 'LGPL', 'UNKNOWN', 'UNLICENSED'];
        for (const lic of licenses) {
            const key = lic.license || 'UNKNOWN';
            licenseCount[key] = (licenseCount[key] || 0) + 1;
            if (riskyLicenses.some(r => key.toUpperCase().includes(r))) {
                problematic.push(lic);
            }
        }
        log('\n📊 License Distribution:', 'cyan');
        log('─'.repeat(50), 'dim');
        const sorted = Object.entries(licenseCount).sort((a, b) => b[1] - a[1]);
        for (const [license, count] of sorted) {
            const isRisky = riskyLicenses.some(r => license.toUpperCase().includes(r));
            log(`  ${license.padEnd(25)} ${count}`, isRisky ? 'yellow' : 'green');
        }
        if (problematic.length > 0) {
            log('\n⚠️ Packages with potentially problematic licenses:', 'yellow');
            log('─'.repeat(50), 'dim');
            for (const pkg of problematic) {
                log(`  ${pkg.name}@${pkg.version} - ${pkg.license}`, 'yellow');
            }
        }
        log('─'.repeat(50), 'dim');
        log(`Total: ${licenses.length} packages scanned`, 'white');
    }
    // ─────────────────────────────────────────────────────────────────────────────
    // AUTO UPDATE
    // ─────────────────────────────────────────────────────────────────────────────
    async autoUpdate(options = {}) {
        const packages = this.checkOutdated();
        if (packages.length === 0) {
            return;
        }
        this.displayOutdated(packages);
        if (options.safe) {
            log('\n🔧 Updating safe packages (minor/patch only)...', 'cyan');
            exec('npm update');
            log('✅ Safe updates complete!', 'green');
        }
        else {
            log('\n🔧 Updating all packages to latest...', 'cyan');
            const deps = [];
            const devDeps = [];
            for (const pkg of packages) {
                if (pkg.type === 'devDependencies') {
                    devDeps.push(`${pkg.name}@latest`);
                }
                else {
                    deps.push(`${pkg.name}@latest`);
                }
            }
            if (deps.length > 0) {
                exec(`npm install ${deps.join(' ')}`);
            }
            if (devDeps.length > 0) {
                exec(`npm install -D ${devDeps.join(' ')}`);
            }
            log('✅ All updates complete!', 'green');
        }
    }
    // ─────────────────────────────────────────────────────────────────────────────
    // FULL DIAGNOSIS
    // ─────────────────────────────────────────────────────────────────────────────
    async fullDiagnosis() {
        console.log();
        log('╔══════════════════════════════════════════════════════════════════════════════╗', 'cyan');
        log('║     🏥 QANTUM DEPENDENCY DOCTOR - FULL DIAGNOSIS                             ║', 'cyan');
        log('╚══════════════════════════════════════════════════════════════════════════════╝', 'cyan');
        const pkg = JSON.parse(fs_1.default.readFileSync(this.packageJsonPath, 'utf-8'));
        log(`\n📦 Project: ${pkg.name}@${pkg.version}`, 'white');
        // Check outdated
        const outdated = this.checkOutdated();
        this.displayOutdated(outdated);
        // Security audit
        await this.runAudit();
        // License check
        const licenses = this.checkLicenses();
        this.displayLicenses(licenses);
        // Summary
        console.log();
        log('╔══════════════════════════════════════════════════════════════════════════════╗', 'green');
        log('║     📋 DIAGNOSIS COMPLETE                                                    ║', 'green');
        log('╚══════════════════════════════════════════════════════════════════════════════╝', 'green');
        console.log();
        if (outdated.length > 0) {
            log('💡 Run "npx tsx qantum-dep-doctor.ts update" to update packages', 'yellow');
        }
    }
    // ─────────────────────────────────────────────────────────────────────────────
    // GENERATE REPORT
    // ─────────────────────────────────────────────────────────────────────────────
    async generateReport() {
        const pkg = JSON.parse(fs_1.default.readFileSync(this.packageJsonPath, 'utf-8'));
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
        }
        else {
            report += '| Package | Current | Latest | Type |\n';
            report += '|---------|---------|--------|------|\n';
            for (const pkg of outdated) {
                report += `| ${pkg.name} | ${pkg.current} | ${pkg.latest} | ${pkg.type} |\n`;
            }
        }
        report += `\n## License Distribution\n\n`;
        const licenseCount = {};
        for (const lic of licenses) {
            const key = lic.license || 'UNKNOWN';
            licenseCount[key] = (licenseCount[key] || 0) + 1;
        }
        report += '| License | Count |\n';
        report += '|---------|-------|\n';
        for (const [license, count] of Object.entries(licenseCount).sort((a, b) => b[1] - a[1])) {
            report += `| ${license} | ${count} |\n`;
        }
        const reportPath = path_1.default.join(this.rootPath, 'DEPENDENCY-REPORT.md');
        fs_1.default.writeFileSync(reportPath, report);
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
