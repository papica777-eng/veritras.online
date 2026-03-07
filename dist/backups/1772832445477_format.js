"use strict";
/**
 * Output Formatting Utilities
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatDuration = formatDuration;
exports.formatResults = formatResults;
const chalk_1 = __importDefault(require("chalk"));
function formatDuration(ms) {
    if (ms < 1000)
        return `${ms}ms`;
    if (ms < 60000)
        return `${(ms / 1000).toFixed(1)}s`;
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
}
function formatResults(result) {
    const lines = [];
    // Header
    lines.push('');
    lines.push(chalk_1.default.bold('  Test Results'));
    lines.push(chalk_1.default.gray('  ════════════════════════════════════════'));
    lines.push('');
    // Summary
    const statusIcon = result.status === 'passed'
        ? chalk_1.default.green('✓')
        : result.status === 'failed'
            ? chalk_1.default.red('✗')
            : chalk_1.default.yellow('○');
    const statusText = result.status === 'passed'
        ? chalk_1.default.green.bold('PASSED')
        : result.status === 'failed'
            ? chalk_1.default.red.bold('FAILED')
            : chalk_1.default.yellow(result.status.toUpperCase());
    lines.push(`  ${statusIcon} ${statusText}  ${chalk_1.default.gray(`(${formatDuration(result.duration)})`)}`);
    lines.push('');
    // Stats
    lines.push(chalk_1.default.gray('  ────────────────────────────────────────'));
    lines.push(`  ${chalk_1.default.green('✓')} Passed:   ${chalk_1.default.green(result.passedTests)}`);
    if (result.failedTests > 0) {
        lines.push(`  ${chalk_1.default.red('✗')} Failed:   ${chalk_1.default.red(result.failedTests)}`);
    }
    if (result.skippedTests > 0) {
        lines.push(`  ${chalk_1.default.yellow('○')} Skipped:  ${chalk_1.default.yellow(result.skippedTests)}`);
    }
    if (result.healedTests > 0) {
        lines.push(`  ${chalk_1.default.magenta('🔮')} Healed:   ${chalk_1.default.magenta(result.healedTests)}`);
    }
    lines.push(`  ${chalk_1.default.gray('━')} Total:    ${result.totalTests}`);
    lines.push('');
    // Pass rate
    const passRate = (result.passedTests / result.totalTests * 100).toFixed(1);
    const passRateColor = parseFloat(passRate) >= 90
        ? chalk_1.default.green
        : parseFloat(passRate) >= 70
            ? chalk_1.default.yellow
            : chalk_1.default.red;
    lines.push(`  Pass Rate: ${passRateColor.bold(`${passRate}%`)}`);
    lines.push('');
    // Failed tests details
    const failedTests = result.results.filter(t => t.status === 'failed');
    if (failedTests.length > 0) {
        lines.push(chalk_1.default.red.bold('  Failed Tests:'));
        lines.push(chalk_1.default.gray('  ────────────────────────────────────────'));
        for (const test of failedTests) {
            lines.push(`  ${chalk_1.default.red('✗')} ${test.name}`);
            if (test.error) {
                lines.push(chalk_1.default.gray(`    ${test.error.split('\n')[0]}`));
            }
        }
        lines.push('');
    }
    // Healed tests details
    const healedTests = result.results.filter(t => t.healed);
    if (healedTests.length > 0) {
        lines.push(chalk_1.default.magenta.bold('  Self-Healed Selectors:'));
        lines.push(chalk_1.default.gray('  ────────────────────────────────────────'));
        for (const test of healedTests) {
            lines.push(`  ${chalk_1.default.magenta('🔮')} ${test.name}`);
            if (test.healedSelector) {
                lines.push(chalk_1.default.gray(`    ${chalk_1.default.red.strikethrough(test.healedSelector.original)}`));
                lines.push(chalk_1.default.gray(`    ${chalk_1.default.green('→')} ${chalk_1.default.cyan(test.healedSelector.healed)}`));
            }
        }
        lines.push('');
    }
    return lines.join('\n');
}
