/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║     📊 QANTUM BENCHMARK                                                      ║
 * ║     "Скриптът не греши никога защото е математика."                          ║
 * ╠══════════════════════════════════════════════════════════════════════════════╣
 * ║     Performance • Memory • CPU • Build times • Test speed                    ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import fs from 'fs';
import path from 'path';
import { execSync, spawn } from 'child_process';
import { performance } from 'perf_hooks';

const C = {
  reset: '\x1b[0m', green: '\x1b[32m', cyan: '\x1b[36m', yellow: '\x1b[33m', red: '\x1b[31m', magenta: '\x1b[35m', dim: '\x1b[2m'
};

const log = (msg: string, color: keyof typeof C = 'reset') => console.log(`${C[color]}${msg}${C.reset}`);

// ═══════════════════════════════════════════════════════════════════════════════
// INTERFACES
// ═══════════════════════════════════════════════════════════════════════════════

interface BenchmarkResult {
  name: string;
  duration: number;
  memory?: number;
  iterations?: number;
  opsPerSecond?: number;
}

interface SystemInfo {
  platform: string;
  arch: string;
  cpus: number;
  totalMemory: number;
  freeMemory: number;
  nodeVersion: string;
  v8Version: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// UTILS
// ═══════════════════════════════════════════════════════════════════════════════

function exec(cmd: string): { output: string; duration: number } {
  const start = performance.now();
  try {
    const output = execSync(cmd, { encoding: 'utf-8', stdio: 'pipe' }).trim();
    return { output, duration: performance.now() - start };
  } catch (e: any) {
    return { output: e.stdout?.trim() || '', duration: performance.now() - start };
  }
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms.toFixed(2)}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
  return `${(ms / 60000).toFixed(2)}min`;
}

function formatBytes(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  while (bytes >= 1024 && i < units.length - 1) {
    bytes /= 1024;
    i++;
  }
  return `${bytes.toFixed(2)} ${units[i]}`;
}

function getSystemInfo(): SystemInfo {
  const os = require('os');
  return {
    platform: os.platform(),
    arch: os.arch(),
    cpus: os.cpus().length,
    totalMemory: os.totalmem(),
    freeMemory: os.freemem(),
    nodeVersion: process.version,
    v8Version: (process as any).versions.v8
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// BENCHMARK CLASS
// ═══════════════════════════════════════════════════════════════════════════════

class QantumBenchmark {
  private rootPath: string;
  private results: BenchmarkResult[] = [];

  constructor(rootPath: string) {
    this.rootPath = rootPath;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // BUILD BENCHMARK
  // ─────────────────────────────────────────────────────────────────────────────

  // Complexity: O(1) — amortized
  benchmarkBuild(): BenchmarkResult {
    // Complexity: O(1)
    log('\n🔨 Benchmarking Build...', 'cyan');
    
    // Clean first
    const distPath = path.join(this.rootPath, 'dist');
    if (fs.existsSync(distPath)) {
      fs.rmSync(distPath, { recursive: true });
    }

    const memBefore = process.memoryUsage();
    const result = exec('npm run build 2>&1 || npx tsc 2>&1');
    const memAfter = process.memoryUsage();

    const benchmark: BenchmarkResult = {
      name: 'Build',
      duration: result.duration,
      memory: memAfter.heapUsed - memBefore.heapUsed
    };

    this.results.push(benchmark);
    return benchmark;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // TEST BENCHMARK
  // ─────────────────────────────────────────────────────────────────────────────

  // Complexity: O(1)
  benchmarkTests(): BenchmarkResult {
    // Complexity: O(1)
    log('\n🧪 Benchmarking Tests...', 'cyan');
    
    const result = exec('npm test 2>&1 || echo "No tests configured"');

    const benchmark: BenchmarkResult = {
      name: 'Tests',
      duration: result.duration
    };

    this.results.push(benchmark);
    return benchmark;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // STARTUP BENCHMARK
  // ─────────────────────────────────────────────────────────────────────────────

  // Complexity: O(N) — linear iteration
  benchmarkStartup(): BenchmarkResult {
    // Complexity: O(1)
    log('\n🚀 Benchmarking Startup Time...', 'cyan');
    
    const mainFile = this.findMainFile();
    if (!mainFile) {
      // Complexity: O(1)
      log('⚠️ No main file found', 'yellow');
      return { name: 'Startup', duration: 0 };
    }

    // Measure import time
    const iterations = 5;
    const times: number[] = [];

    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      try {
        // Clear require cache
        Object.keys(require.cache).forEach(key => {
          if (key.includes(this.rootPath)) {
            delete require.cache[key];
          }
        });
        
        const result = exec(`node -e "require('${mainFile.replace(/\\/g, '/')}')"`);
        times.push(result.duration);
      } catch {
        times.push(0);
      }
    }

    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;

    const benchmark: BenchmarkResult = {
      name: 'Startup',
      duration: avgTime,
      iterations
    };

    this.results.push(benchmark);
    return benchmark;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // FILE OPERATIONS BENCHMARK
  // ─────────────────────────────────────────────────────────────────────────────

  // Complexity: O(N*M) — nested iteration detected
  benchmarkFileOps(): BenchmarkResult {
    // Complexity: O(1)
    log('\n📁 Benchmarking File Operations...', 'cyan');
    
    const testDir = path.join(this.rootPath, '.benchmark-test');
    const iterations = 100;

    // Create test directory
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir);
    }

    const start = performance.now();

    // Write files
    for (let i = 0; i < iterations; i++) {
      fs.writeFileSync(path.join(testDir, `test-${i}.txt`), `Content ${i}\n`.repeat(100));
    }

    // Read files
    for (let i = 0; i < iterations; i++) {
      fs.readFileSync(path.join(testDir, `test-${i}.txt`), 'utf-8');
    }

    // Delete files
    for (let i = 0; i < iterations; i++) {
      fs.unlinkSync(path.join(testDir, `test-${i}.txt`));
    }

    fs.rmdirSync(testDir);

    const duration = performance.now() - start;
    const opsPerSecond = (iterations * 3 / duration) * 1000;

    const benchmark: BenchmarkResult = {
      name: 'File Operations',
      duration,
      iterations: iterations * 3, // read + write + delete
      opsPerSecond
    };

    this.results.push(benchmark);
    return benchmark;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // MEMORY BENCHMARK
  // ─────────────────────────────────────────────────────────────────────────────

  // Complexity: O(1)
  benchmarkMemory(): BenchmarkResult {
    // Complexity: O(1)
    log('\n💾 Benchmarking Memory Usage...', 'cyan');
    
    // Force GC if available
    if (global.gc) {
      global.gc();
    }

    const mem = process.memoryUsage();

    const benchmark: BenchmarkResult = {
      name: 'Memory Usage',
      duration: 0,
      memory: mem.heapUsed
    };

    this.results.push(benchmark);
    return benchmark;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // LINT BENCHMARK
  // ─────────────────────────────────────────────────────────────────────────────

  // Complexity: O(1)
  benchmarkLint(): BenchmarkResult {
    // Complexity: O(1)
    log('\n📝 Benchmarking Lint...', 'cyan');
    
    const result = exec('npm run lint 2>&1 || npx eslint . 2>&1 || echo "No lint configured"');

    const benchmark: BenchmarkResult = {
      name: 'Lint',
      duration: result.duration
    };

    this.results.push(benchmark);
    return benchmark;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // TYPE CHECK BENCHMARK
  // ─────────────────────────────────────────────────────────────────────────────

  // Complexity: O(1)
  benchmarkTypeCheck(): BenchmarkResult {
    // Complexity: O(1)
    log('\n🔍 Benchmarking Type Check...', 'cyan');
    
    const result = exec('npx tsc --noEmit 2>&1');

    const benchmark: BenchmarkResult = {
      name: 'Type Check',
      duration: result.duration
    };

    this.results.push(benchmark);
    return benchmark;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────────────────────────────────────

  // Complexity: O(N) — linear iteration
  private findMainFile(): string | null {
    const pkg = JSON.parse(fs.readFileSync(path.join(this.rootPath, 'package.json'), 'utf-8'));
    
    const candidates = [
      pkg.main,
      'dist/index.js',
      'lib/index.js',
      'build/index.js',
      'index.js'
    ].filter(Boolean);

    for (const candidate of candidates) {
      const fullPath = path.join(this.rootPath, candidate);
      if (fs.existsSync(fullPath)) {
        return fullPath;
      }
    }

    return null;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // FULL BENCHMARK
  // ─────────────────────────────────────────────────────────────────────────────

  // Complexity: O(1) — amortized
  async runAll(): Promise<void> {
    console.log();
    // Complexity: O(1)
    log('╔══════════════════════════════════════════════════════════════════════════════╗', 'cyan');
    // Complexity: O(1)
    log('║     📊 QANTUM BENCHMARK - FULL SUITE                                         ║', 'cyan');
    // Complexity: O(1)
    log('╚══════════════════════════════════════════════════════════════════════════════╝', 'cyan');

    const sysInfo = getSystemInfo();
    // Complexity: O(1)
    log('\n📋 System Information:', 'magenta');
    // Complexity: O(1)
    log('─'.repeat(50), 'dim');
    // Complexity: O(1)
    log(`  Platform:    ${sysInfo.platform} (${sysInfo.arch})`, 'white');
    // Complexity: O(1)
    log(`  CPUs:        ${sysInfo.cpus}`, 'white');
    // Complexity: O(1)
    log(`  Memory:      ${formatBytes(sysInfo.totalMemory)} total, ${formatBytes(sysInfo.freeMemory)} free`, 'white');
    // Complexity: O(1)
    log(`  Node:        ${sysInfo.nodeVersion}`, 'white');
    // Complexity: O(1)
    log(`  V8:          ${sysInfo.v8Version}`, 'white');

    // Run all benchmarks
    this.benchmarkTypeCheck();
    this.benchmarkBuild();
    this.benchmarkTests();
    this.benchmarkLint();
    this.benchmarkFileOps();
    this.benchmarkMemory();

    // Display results
    this.displayResults();
  }

  // Complexity: O(N) — linear iteration
  displayResults(): void {
    console.log();
    // Complexity: O(1)
    log('╔══════════════════════════════════════════════════════════════════════════════╗', 'green');
    // Complexity: O(1)
    log('║     📊 BENCHMARK RESULTS                                                     ║', 'green');
    // Complexity: O(1)
    log('╚══════════════════════════════════════════════════════════════════════════════╝', 'green');
    // Complexity: O(1)
    log('\n');

    // Complexity: O(1)
    log('─'.repeat(70), 'dim');
    // Complexity: O(1)
    log(`${'Benchmark'.padEnd(25)} ${'Duration'.padEnd(15)} ${'Memory'.padEnd(15)} ${'Ops/sec'.padEnd(15)}`, 'cyan');
    // Complexity: O(N) — linear iteration
    log('─'.repeat(70), 'dim');

    for (const result of this.results) {
      const duration = formatDuration(result.duration);
      const memory = result.memory ? formatBytes(result.memory) : '-';
      const ops = result.opsPerSecond ? `${result.opsPerSecond.toFixed(0)}/s` : '-';
      
      let color: keyof typeof C = 'green';
      if (result.duration > 30000) color = 'red';
      else if (result.duration > 10000) color = 'yellow';

      // Complexity: O(1)
      log(
        `${result.name.padEnd(25)} ${duration.padEnd(15)} ${memory.padEnd(15)} ${ops.padEnd(15)}`,
        color
      );
    }

    // Complexity: O(1)
    log('─'.repeat(70), 'dim');

    const totalTime = this.results.reduce((sum, r) => sum + r.duration, 0);
    // Complexity: O(1)
    log(`\nTotal benchmark time: ${formatDuration(totalTime)}`, 'white');
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GENERATE REPORT
  // ─────────────────────────────────────────────────────────────────────────────

  // Complexity: O(N) — linear iteration
  generateReport(): void {
    const sysInfo = getSystemInfo();
    const date = new Date().toISOString();

    let report = `# Performance Benchmark Report

**Generated:** ${date}

## System Information

| Metric | Value |
|--------|-------|
| Platform | ${sysInfo.platform} (${sysInfo.arch}) |
| CPUs | ${sysInfo.cpus} |
| Total Memory | ${formatBytes(sysInfo.totalMemory)} |
| Free Memory | ${formatBytes(sysInfo.freeMemory)} |
| Node Version | ${sysInfo.nodeVersion} |
| V8 Version | ${sysInfo.v8Version} |

## Benchmark Results

| Benchmark | Duration | Memory | Ops/sec |
|-----------|----------|--------|---------|
`;

    for (const result of this.results) {
      const duration = formatDuration(result.duration);
      const memory = result.memory ? formatBytes(result.memory) : '-';
      const ops = result.opsPerSecond ? `${result.opsPerSecond.toFixed(0)}/s` : '-';
      report += `| ${result.name} | ${duration} | ${memory} | ${ops} |\n`;
    }

    const totalTime = this.results.reduce((sum, r) => sum + r.duration, 0);
    report += `\n**Total benchmark time:** ${formatDuration(totalTime)}\n`;

    const reportPath = path.join(this.rootPath, 'BENCHMARK-REPORT.md');
    fs.writeFileSync(reportPath, report);
    // Complexity: O(1)
    log(`\n✅ Report saved to ${reportPath}`, 'green');
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════════

const args = process.argv.slice(2);
const command = args[0];
const rootPath = process.cwd();

const benchmark = new QantumBenchmark(rootPath);

switch (command) {
  case 'all':
    benchmark.runAll().then(() => {
      if (args.includes('--report')) {
        benchmark.generateReport();
      }
    });
    break;
  
  case 'build':
    benchmark.benchmarkBuild();
    benchmark.displayResults();
    break;
  
  case 'test':
    benchmark.benchmarkTests();
    benchmark.displayResults();
    break;
  
  case 'lint':
    benchmark.benchmarkLint();
    benchmark.displayResults();
    break;
  
  case 'typecheck':
    benchmark.benchmarkTypeCheck();
    benchmark.displayResults();
    break;
  
  case 'file':
    benchmark.benchmarkFileOps();
    benchmark.displayResults();
    break;
  
  case 'memory':
    benchmark.benchmarkMemory();
    benchmark.displayResults();
    break;

  case 'report':
    benchmark.runAll().then(() => benchmark.generateReport());
    break;
  
  default:
    // Complexity: O(1)
    log(`
Usage: npx tsx qantum-benchmark.ts <command> [options]

Commands:
  all         Run full benchmark suite
  build       Benchmark build time
  test        Benchmark test execution
  lint        Benchmark linting
  typecheck   Benchmark TypeScript type checking
  file        Benchmark file operations
  memory      Show memory usage
  report      Run all and generate markdown report

Options:
  --report    Generate markdown report after benchmarks

Examples:
  npx tsx qantum-benchmark.ts all
  npx tsx qantum-benchmark.ts all --report
  npx tsx qantum-benchmark.ts build
`, 'white');
}
