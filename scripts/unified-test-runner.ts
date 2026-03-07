/**
 * 💀 QANTUM UNIFIED TEST RUNNER — Polyglot CI Pipeline
 * Runs tests across ALL languages in one command:
 *   1. TypeScript/JavaScript (jest / ts-node)
 *   2. Rust (cargo test)
 *   3. Python (pytest)
 *
 * Usage: npx ts-node scripts/unified-test-runner.ts
 * CI:    npx ts-node scripts/unified-test-runner.ts --ci
 */

import { execSync, ExecSyncOptionsWithStringEncoding } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const ROOT = process.cwd();
const isCI = process.argv.includes('--ci');
const timestamp = new Date().toISOString();

interface TestResult {
    language: string;
    suite: string;
    passed: boolean;
    duration: number;
    output: string;
    error?: string;
}

const results: TestResult[] = [];

// Complexity: O(1)
function log(msg: string) {
    console.log(`  ${msg}`);
}

// Complexity: O(1)
function runTest(language: string, suite: string, cmd: string, cwd: string): TestResult {
    const start = Date.now();
    const opts: ExecSyncOptionsWithStringEncoding = {
        cwd,
        encoding: 'utf-8',
        timeout: 120_000,
        env: { ...process.env, FORCE_COLOR: '0' },
        stdio: 'pipe',
    };

    try {
        const output = execSync(cmd, opts);
        const duration = Date.now() - start;
        log(`✅ ${language}/${suite} — ${duration}ms`);
        return { language, suite, passed: true, duration, output: output.substring(0, 2000) };
    } catch (e: any) {
        const duration = Date.now() - start;
        const output = (e.stdout || '') + '\n' + (e.stderr || '');
        log(`❌ ${language}/${suite} — FAILED (${duration}ms)`);
        return { language, suite, passed: false, duration, output: output.substring(0, 2000), error: e.message?.substring(0, 500) };
    }
}

// ─── MAIN ───────────────────────────────────────────────────────────────────

function main() {
    console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║  💀 QANTUM UNIFIED TEST RUNNER — Polyglot CI Pipeline                       ║
║  Languages: TypeScript · JavaScript · Rust · Python                         ║
║  Mode: ${isCI ? 'CI (strict)' : 'Local (tolerant)'}                                                     ║
╚══════════════════════════════════════════════════════════════════════════════╝
    `);

    // ─── 1. TYPESCRIPT COMPILATION CHECK ────────────────────────────────────
    console.log('\n🟦 TYPESCRIPT / JAVASCRIPT\n');

    // TypeScript compile check
    results.push(runTest('TypeScript', 'compile-check', 'npx tsc --noEmit --skipLibCheck 2>&1', ROOT));

    // Jest tests (if available)
    const jestConfig = path.join(ROOT, 'jest.config.ts');
    const jestConfigJs = path.join(ROOT, 'jest.config.js');
    if (fs.existsSync(jestConfig) || fs.existsSync(jestConfigJs)) {
        results.push(runTest('TypeScript', 'jest-unit', 'npx jest --passWithNoTests --forceExit --detectOpenHandles --maxWorkers=2 2>&1', ROOT));
    } else {
        log('⚠️  No jest config found — skipping Jest tests');
    }

    // ─── 2. RUST ────────────────────────────────────────────────────────────
    console.log('\n🦀 RUST\n');

    // Find all Cargo.toml locations
    const rustDirs: string[] = [];
    const searchDirs = ['native', 'OmniCore/engines/rust_core', 'src/departments/reality/lwas/chemistry/evolution/cli'];
    for (const d of searchDirs) {
        const cargoPath = path.join(ROOT, d, 'Cargo.toml');
        if (fs.existsSync(cargoPath)) {
            rustDirs.push(path.join(ROOT, d));
        }
        // Check one level deeper
        const subDir = path.join(ROOT, d);
        if (fs.existsSync(subDir)) {
            try {
                for (const item of fs.readdirSync(subDir, { withFileTypes: true })) {
                    if (item.isDirectory()) {
                        const subCargo = path.join(subDir, item.name, 'Cargo.toml');
                        if (fs.existsSync(subCargo)) rustDirs.push(path.join(subDir, item.name));
                    }
                }
            } catch { }
        }
    }

    if (rustDirs.length > 0) {
        for (const dir of rustDirs) {
            const name = path.relative(ROOT, dir).replace(/\\/g, '/');
            results.push(runTest('Rust', `cargo-check/${name}`, 'cargo check 2>&1', dir));
            results.push(runTest('Rust', `cargo-test/${name}`, 'cargo test -- --nocapture 2>&1', dir));
        }
    } else {
        log('⚠️  No Cargo.toml found — skipping Rust tests');
    }

    // ─── 3. PYTHON ──────────────────────────────────────────────────────────
    console.log('\n🐍 PYTHON\n');

    const pythonDirs = ['backend'];
    for (const d of pythonDirs) {
        const pyDir = path.join(ROOT, d);
        if (fs.existsSync(pyDir)) {
            // Syntax check
            const pyFiles = fs.readdirSync(pyDir).filter(f => f.endsWith('.py'));
            if (pyFiles.length > 0) {
                results.push(runTest('Python', 'syntax-check', `python -m py_compile ${pyFiles[0]} 2>&1`, pyDir));
            }
            // pytest if available
            if (fs.existsSync(path.join(pyDir, 'test_')) || fs.existsSync(path.join(pyDir, 'tests'))) {
                results.push(runTest('Python', 'pytest', 'python -m pytest -v --tb=short 2>&1', pyDir));
            }
        }
    }

    // ─── REPORT ─────────────────────────────────────────────────────────────
    console.log('\n');
    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;
    const totalDuration = results.reduce((s, r) => s + r.duration, 0);

    console.log(`═══════════════════════════════════════════════════════════════════`);
    console.log(`  📊 UNIFIED TEST RESULTS:`);
    console.log(`  Total suites:  ${results.length}`);
    console.log(`  Passed:        ${passed} ✅`);
    console.log(`  Failed:        ${failed} ❌`);
    console.log(`  Duration:      ${(totalDuration / 1000).toFixed(1)}s`);
    console.log(`═══════════════════════════════════════════════════════════════════`);

    if (failed > 0) {
        console.log('\n❌ FAILED SUITES:\n');
        for (const r of results.filter(r => !r.passed)) {
            console.log(`  ${r.language}/${r.suite}:`);
            console.log(`    ${(r.error || 'Unknown error').substring(0, 200)}\n`);
        }
    }

    // Write JSON report
    const reportDir = path.join(ROOT, 'docs', 'enterprise');
    if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir, { recursive: true });
    const report = {
        timestamp,
        mode: isCI ? 'ci' : 'local',
        summary: { total: results.length, passed, failed, durationMs: totalDuration },
        results: results.map(r => ({ ...r, output: r.output.substring(0, 500) })),
    };
    fs.writeFileSync(path.join(reportDir, 'TEST_RESULTS.json'), JSON.stringify(report, null, 2));
    console.log(`\n✅ Report: docs/enterprise/TEST_RESULTS.json`);

    // Exit code for CI
    if (isCI && failed > 0) process.exit(1);
}

main();
