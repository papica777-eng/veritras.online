"use strict";
/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║     📈 QANTUM CODE METRICS                                                   ║
 * ║     "Скриптът не греши никога защото е математика."                          ║
 * ╠══════════════════════════════════════════════════════════════════════════════╣
 * ║     Complexity • Coverage • Duplication • Dependencies • Quality Score       ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const C = {
    reset: '\x1b[0m', green: '\x1b[32m', cyan: '\x1b[36m', yellow: '\x1b[33m', red: '\x1b[31m', magenta: '\x1b[35m', dim: '\x1b[2m'
};
const log = (msg, color = 'reset') => console.log(`${C[color]}${msg}${C.reset}`);
// ═══════════════════════════════════════════════════════════════════════════════
// CODE METRICS CLASS
// ═══════════════════════════════════════════════════════════════════════════════
class CodeMetrics {
    rootPath;
    ignorePatterns = [
        /node_modules/,
        /dist/,
        /build/,
        /coverage/,
        /\.git/,
        /\.next/,
        /\.cache/,
        /\.min\./,
        /\.bundle\./,
        /package-lock\.json/,
        /yarn\.lock/
    ];
    constructor(rootPath) {
        this.rootPath = rootPath;
    }
    // ─────────────────────────────────────────────────────────────────────────────
    // ANALYZE FILE
    // ─────────────────────────────────────────────────────────────────────────────
    analyzeFile(filePath) {
        try {
            const content = fs_1.default.readFileSync(filePath, 'utf-8');
            const lines = content.split('\n');
            let linesOfCode = 0;
            let comments = 0;
            let blanks = 0;
            let complexity = 0;
            let functions = 0;
            let classes = 0;
            let imports = 0;
            let exports = 0;
            let todos = 0;
            let inBlockComment = false;
            for (const line of lines) {
                const trimmed = line.trim();
                // Blank line
                if (!trimmed) {
                    blanks++;
                    continue;
                }
                // Comments
                if (inBlockComment) {
                    comments++;
                    if (trimmed.includes('*/')) {
                        inBlockComment = false;
                    }
                    continue;
                }
                if (trimmed.startsWith('/*')) {
                    comments++;
                    if (!trimmed.includes('*/')) {
                        inBlockComment = true;
                    }
                    continue;
                }
                if (trimmed.startsWith('//') || trimmed.startsWith('#')) {
                    comments++;
                    continue;
                }
                // Code line
                linesOfCode++;
                // Complexity indicators (cyclomatic complexity approximation)
                complexity += (trimmed.match(/\b(if|else|while|for|switch|case|catch|&&|\|\||\?)/g) || []).length;
                // Function count
                if (/\b(function|=>|async\s+function)\b/.test(trimmed)) {
                    functions++;
                }
                // Class count
                if (/\bclass\s+\w+/.test(trimmed)) {
                    classes++;
                }
                // Imports
                if (/^import\s/.test(trimmed) || /require\(/.test(trimmed)) {
                    imports++;
                }
                // Exports
                if (/^export\s/.test(trimmed) || /module\.exports/.test(trimmed)) {
                    exports++;
                }
                // TODOs
                if (/\b(TODO|FIXME|XXX|HACK)\b/i.test(trimmed)) {
                    todos++;
                }
            }
            return {
                path: filePath,
                lines: lines.length,
                linesOfCode,
                comments,
                blanks,
                complexity,
                functions,
                classes,
                imports,
                exports,
                todos
            };
        }
        catch {
            return null;
        }
    }
    // ─────────────────────────────────────────────────────────────────────────────
    // SCAN DIRECTORY
    // ─────────────────────────────────────────────────────────────────────────────
    scanDirectory(dir, extensions) {
        const files = [];
        const scan = (currentDir) => {
            const entries = fs_1.default.readdirSync(currentDir, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path_1.default.join(currentDir, entry.name);
                // Check ignore patterns
                if (this.ignorePatterns.some(p => p.test(fullPath))) {
                    continue;
                }
                if (entry.isDirectory()) {
                    scan(fullPath);
                }
                else if (entry.isFile()) {
                    const ext = path_1.default.extname(entry.name).toLowerCase();
                    if (extensions.includes(ext)) {
                        files.push(fullPath);
                    }
                }
            }
        };
        scan(dir);
        return files;
    }
    // ─────────────────────────────────────────────────────────────────────────────
    // ANALYZE PROJECT
    // ─────────────────────────────────────────────────────────────────────────────
    analyzeProject(extensions = ['.ts', '.tsx', '.js', '.jsx']) {
        const files = this.scanDirectory(this.rootPath, extensions);
        const metrics = [];
        const filesByType = {};
        for (const file of files) {
            const result = this.analyzeFile(file);
            if (result) {
                metrics.push(result);
                const ext = path_1.default.extname(file);
                filesByType[ext] = (filesByType[ext] || 0) + 1;
            }
        }
        // Calculate aggregates
        const totalLines = metrics.reduce((sum, m) => sum + m.lines, 0);
        const totalLOC = metrics.reduce((sum, m) => sum + m.linesOfCode, 0);
        const totalComments = metrics.reduce((sum, m) => sum + m.comments, 0);
        const totalBlanks = metrics.reduce((sum, m) => sum + m.blanks, 0);
        const totalComplexity = metrics.reduce((sum, m) => sum + m.complexity, 0);
        const totalFunctions = metrics.reduce((sum, m) => sum + m.functions, 0);
        const totalClasses = metrics.reduce((sum, m) => sum + m.classes, 0);
        const totalTodos = metrics.reduce((sum, m) => sum + m.todos, 0);
        const avgComplexity = metrics.length > 0
            ? totalComplexity / metrics.length
            : 0;
        const maxComplexity = metrics.length > 0
            ? Math.max(...metrics.map(m => m.complexity))
            : 0;
        // Sort by complexity and size
        const topComplexFiles = [...metrics]
            .sort((a, b) => b.complexity - a.complexity)
            .slice(0, 10);
        const topLargestFiles = [...metrics]
            .sort((a, b) => b.linesOfCode - a.linesOfCode)
            .slice(0, 10);
        // Calculate quality score (0-100)
        const qualityScore = this.calculateQualityScore(metrics, {
            totalLOC,
            totalComments,
            avgComplexity,
            totalTodos
        });
        return {
            totalFiles: metrics.length,
            totalLines,
            totalLOC,
            totalComments,
            totalBlanks,
            avgComplexity,
            maxComplexity,
            totalFunctions,
            totalClasses,
            totalTodos,
            filesByType,
            topComplexFiles,
            topLargestFiles,
            qualityScore
        };
    }
    calculateQualityScore(metrics, stats) {
        let score = 100;
        // Deduct for high complexity
        if (stats.avgComplexity > 20)
            score -= 20;
        else if (stats.avgComplexity > 10)
            score -= 10;
        else if (stats.avgComplexity > 5)
            score -= 5;
        // Deduct for low comment ratio
        const commentRatio = stats.totalComments / stats.totalLOC;
        if (commentRatio < 0.05)
            score -= 15;
        else if (commentRatio < 0.1)
            score -= 10;
        else if (commentRatio < 0.15)
            score -= 5;
        // Deduct for TODOs
        if (stats.totalTodos > 50)
            score -= 15;
        else if (stats.totalTodos > 20)
            score -= 10;
        else if (stats.totalTodos > 10)
            score -= 5;
        // Deduct for very large files
        const largeFiles = metrics.filter(m => m.linesOfCode > 500).length;
        score -= Math.min(largeFiles * 2, 15);
        // Deduct for very complex files
        const complexFiles = metrics.filter(m => m.complexity > 50).length;
        score -= Math.min(complexFiles * 3, 15);
        return Math.max(0, Math.min(100, score));
    }
    // ─────────────────────────────────────────────────────────────────────────────
    // DISPLAY RESULTS
    // ─────────────────────────────────────────────────────────────────────────────
    displayMetrics(metrics) {
        console.log();
        log('╔══════════════════════════════════════════════════════════════════════════════╗', 'cyan');
        log('║     📈 QANTUM CODE METRICS                                                   ║', 'cyan');
        log('╚══════════════════════════════════════════════════════════════════════════════╝', 'cyan');
        // Quality Score
        const scoreColor = metrics.qualityScore >= 80 ? 'green' :
            metrics.qualityScore >= 60 ? 'yellow' : 'red';
        log(`\n🎯 Quality Score: ${metrics.qualityScore}/100`, scoreColor);
        log('─'.repeat(50), 'dim');
        // Overview
        log('\n📊 Project Overview:', 'magenta');
        log('─'.repeat(50), 'dim');
        log(`  Files analyzed:     ${metrics.totalFiles.toLocaleString()}`, 'white');
        log(`  Total lines:        ${metrics.totalLines.toLocaleString()}`, 'white');
        log(`  Lines of code:      ${metrics.totalLOC.toLocaleString()}`, 'white');
        log(`  Comments:           ${metrics.totalComments.toLocaleString()} (${((metrics.totalComments / metrics.totalLOC) * 100).toFixed(1)}%)`, 'white');
        log(`  Blank lines:        ${metrics.totalBlanks.toLocaleString()}`, 'white');
        // Complexity
        log('\n🧠 Complexity:', 'magenta');
        log('─'.repeat(50), 'dim');
        const avgColor = metrics.avgComplexity <= 5 ? 'green' :
            metrics.avgComplexity <= 10 ? 'yellow' : 'red';
        log(`  Average complexity: ${metrics.avgComplexity.toFixed(2)}`, avgColor);
        log(`  Max complexity:     ${metrics.maxComplexity}`, metrics.maxComplexity > 50 ? 'red' : 'white');
        // Structure
        log('\n🏗️ Structure:', 'magenta');
        log('─'.repeat(50), 'dim');
        log(`  Functions:          ${metrics.totalFunctions.toLocaleString()}`, 'white');
        log(`  Classes:            ${metrics.totalClasses.toLocaleString()}`, 'white');
        log(`  TODOs/FIXMEs:       ${metrics.totalTodos}`, metrics.totalTodos > 20 ? 'yellow' : 'white');
        // Files by type
        log('\n📁 Files by Type:', 'magenta');
        log('─'.repeat(50), 'dim');
        for (const [ext, count] of Object.entries(metrics.filesByType).sort((a, b) => b[1] - a[1])) {
            const bar = '█'.repeat(Math.min(Math.round(count / metrics.totalFiles * 30), 30));
            log(`  ${ext.padEnd(8)} ${count.toString().padStart(5)} ${bar}`, 'white');
        }
        // Top complex files
        if (metrics.topComplexFiles.length > 0) {
            log('\n⚠️ Most Complex Files:', 'yellow');
            log('─'.repeat(50), 'dim');
            for (const file of metrics.topComplexFiles.slice(0, 5)) {
                const relPath = path_1.default.relative(this.rootPath, file.path);
                log(`  ${file.complexity.toString().padStart(4)} │ ${relPath}`, file.complexity > 50 ? 'red' : 'yellow');
            }
        }
        // Top largest files
        if (metrics.topLargestFiles.length > 0) {
            log('\n📦 Largest Files:', 'cyan');
            log('─'.repeat(50), 'dim');
            for (const file of metrics.topLargestFiles.slice(0, 5)) {
                const relPath = path_1.default.relative(this.rootPath, file.path);
                log(`  ${file.linesOfCode.toString().padStart(5)} LOC │ ${relPath}`, file.linesOfCode > 500 ? 'yellow' : 'white');
            }
        }
    }
    // ─────────────────────────────────────────────────────────────────────────────
    // GENERATE REPORT
    // ─────────────────────────────────────────────────────────────────────────────
    generateReport(metrics) {
        const date = new Date().toISOString();
        let report = `# Code Metrics Report

**Generated:** ${date}
**Quality Score:** ${metrics.qualityScore}/100

## Overview

| Metric | Value |
|--------|-------|
| Files Analyzed | ${metrics.totalFiles.toLocaleString()} |
| Total Lines | ${metrics.totalLines.toLocaleString()} |
| Lines of Code | ${metrics.totalLOC.toLocaleString()} |
| Comments | ${metrics.totalComments.toLocaleString()} (${((metrics.totalComments / metrics.totalLOC) * 100).toFixed(1)}%) |
| Blank Lines | ${metrics.totalBlanks.toLocaleString()} |

## Complexity

| Metric | Value |
|--------|-------|
| Average Complexity | ${metrics.avgComplexity.toFixed(2)} |
| Max Complexity | ${metrics.maxComplexity} |

## Structure

| Metric | Value |
|--------|-------|
| Functions | ${metrics.totalFunctions.toLocaleString()} |
| Classes | ${metrics.totalClasses.toLocaleString()} |
| TODOs/FIXMEs | ${metrics.totalTodos} |

## Files by Type

| Extension | Count | Percentage |
|-----------|-------|------------|
`;
        for (const [ext, count] of Object.entries(metrics.filesByType).sort((a, b) => b[1] - a[1])) {
            const pct = ((count / metrics.totalFiles) * 100).toFixed(1);
            report += `| ${ext} | ${count} | ${pct}% |\n`;
        }
        report += `
## Top 10 Complex Files

| Complexity | File |
|------------|------|
`;
        for (const file of metrics.topComplexFiles) {
            const relPath = path_1.default.relative(this.rootPath, file.path);
            report += `| ${file.complexity} | ${relPath} |\n`;
        }
        report += `
## Top 10 Largest Files

| LOC | File |
|-----|------|
`;
        for (const file of metrics.topLargestFiles) {
            const relPath = path_1.default.relative(this.rootPath, file.path);
            report += `| ${file.linesOfCode} | ${relPath} |\n`;
        }
        const reportPath = path_1.default.join(this.rootPath, 'CODE-METRICS-REPORT.md');
        fs_1.default.writeFileSync(reportPath, report);
        log(`\n✅ Report saved to ${reportPath}`, 'green');
    }
    // ─────────────────────────────────────────────────────────────────────────────
    // JSON OUTPUT
    // ─────────────────────────────────────────────────────────────────────────────
    exportJson(metrics) {
        const jsonPath = path_1.default.join(this.rootPath, 'code-metrics.json');
        fs_1.default.writeFileSync(jsonPath, JSON.stringify(metrics, null, 2));
        log(`\n✅ JSON exported to ${jsonPath}`, 'green');
    }
}
// ═══════════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════════
const args = process.argv.slice(2);
const command = args[0];
const rootPath = process.cwd();
const analyzer = new CodeMetrics(rootPath);
const defaultExtensions = ['.ts', '.tsx', '.js', '.jsx', '.vue', '.svelte'];
switch (command) {
    case 'analyze':
    case 'run':
        const metrics = analyzer.analyzeProject(defaultExtensions);
        analyzer.displayMetrics(metrics);
        break;
    case 'report':
        const reportMetrics = analyzer.analyzeProject(defaultExtensions);
        analyzer.displayMetrics(reportMetrics);
        analyzer.generateReport(reportMetrics);
        break;
    case 'json':
        const jsonMetrics = analyzer.analyzeProject(defaultExtensions);
        analyzer.exportJson(jsonMetrics);
        break;
    case 'full':
        const fullMetrics = analyzer.analyzeProject(defaultExtensions);
        analyzer.displayMetrics(fullMetrics);
        analyzer.generateReport(fullMetrics);
        analyzer.exportJson(fullMetrics);
        break;
    default:
        log(`
Usage: npx tsx qantum-code-metrics.ts <command>

Commands:
  analyze     Analyze codebase and display metrics
  run         Alias for analyze
  report      Generate markdown report
  json        Export metrics as JSON
  full        All of the above

Analyzed file types:
  .ts, .tsx, .js, .jsx, .vue, .svelte

Examples:
  npx tsx qantum-code-metrics.ts analyze
  npx tsx qantum-code-metrics.ts report
  npx tsx qantum-code-metrics.ts full
`, 'white');
}
