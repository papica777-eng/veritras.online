/**
 * Output Formatting Utilities
 */

import chalk from 'chalk';

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}m ${seconds}s`;
}

interface TestResult {
  id: string;
  name: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  error?: string;
  healed?: boolean;
  healedSelector?: {
    original: string;
    healed: string;
  };
}

interface RunResult {
  id: string;
  status: 'running' | 'passed' | 'failed' | 'canceled';
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  healedTests: number;
  duration: number;
  results: TestResult[];
}

export function formatResults(result: RunResult): string {
  const lines: string[] = [];
  
  // Header
  lines.push('');
  lines.push(chalk.bold('  Test Results'));
  lines.push(chalk.gray('  ════════════════════════════════════════'));
  lines.push('');

  // Summary
  const statusIcon = result.status === 'passed' 
    ? chalk.green('✓') 
    : result.status === 'failed' 
      ? chalk.red('✗')
      : chalk.yellow('○');
  
  const statusText = result.status === 'passed'
    ? chalk.green.bold('PASSED')
    : result.status === 'failed'
      ? chalk.red.bold('FAILED')
      : chalk.yellow(result.status.toUpperCase());

  lines.push(`  ${statusIcon} ${statusText}  ${chalk.gray(`(${formatDuration(result.duration)})`)}`);
  lines.push('');

  // Stats
  lines.push(chalk.gray('  ────────────────────────────────────────'));
  lines.push(`  ${chalk.green('✓')} Passed:   ${chalk.green(result.passedTests)}`);
  
  if (result.failedTests > 0) {
    lines.push(`  ${chalk.red('✗')} Failed:   ${chalk.red(result.failedTests)}`);
  }
  
  if (result.skippedTests > 0) {
    lines.push(`  ${chalk.yellow('○')} Skipped:  ${chalk.yellow(result.skippedTests)}`);
  }
  
  if (result.healedTests > 0) {
    lines.push(`  ${chalk.magenta('🔮')} Healed:   ${chalk.magenta(result.healedTests)}`);
  }
  
  lines.push(`  ${chalk.gray('━')} Total:    ${result.totalTests}`);
  lines.push('');

  // Pass rate
  const passRate = (result.passedTests / result.totalTests * 100).toFixed(1);
  const passRateColor = parseFloat(passRate) >= 90 
    ? chalk.green 
    : parseFloat(passRate) >= 70 
      ? chalk.yellow 
      : chalk.red;
  
  lines.push(`  Pass Rate: ${passRateColor.bold(`${passRate}%`)}`);
  lines.push('');

  // Failed tests details
  const failedTests = result.results.filter(t => t.status === 'failed');
  if (failedTests.length > 0) {
    lines.push(chalk.red.bold('  Failed Tests:'));
    lines.push(chalk.gray('  ────────────────────────────────────────'));
    
    for (const test of failedTests) {
      lines.push(`  ${chalk.red('✗')} ${test.name}`);
      if (test.error) {
        lines.push(chalk.gray(`    ${test.error.split('\n')[0]}`));
      }
    }
    lines.push('');
  }

  // Healed tests details
  const healedTests = result.results.filter(t => t.healed);
  if (healedTests.length > 0) {
    lines.push(chalk.magenta.bold('  Self-Healed Selectors:'));
    lines.push(chalk.gray('  ────────────────────────────────────────'));
    
    for (const test of healedTests) {
      lines.push(`  ${chalk.magenta('🔮')} ${test.name}`);
      if (test.healedSelector) {
        lines.push(chalk.gray(`    ${chalk.red.strikethrough(test.healedSelector.original)}`));
        lines.push(chalk.gray(`    ${chalk.green('→')} ${chalk.cyan(test.healedSelector.healed)}`));
      }
    }
    lines.push('');
  }

  return lines.join('\n');
}
