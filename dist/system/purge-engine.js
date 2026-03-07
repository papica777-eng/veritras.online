"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════╗
 * ║  THE GREAT PURGE v2 - "Dead Code Elimination Engine"               ║
 * ║  "Премахваме 4.2% мъртва материя безопасно"                        ║
 * ║                                                                     ║
 * ║  Използва данните от meditation-result.json за:                     ║
 * ║    • Безопасно премахване на неизползвани exports                   ║
 * ║    • Изчистване на orphan interfaces                                ║
 * ║    • Tree-shaking на стероиди                                       ║
 * ║                                                                     ║
 * ║  © 2025-2026 QAntum | Dimitar Prodromov                            ║
 * ╚═══════════════════════════════════════════════════════════════════════╝
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PurgeEngine = void 0;
exports.getPurgeEngine = getPurgeEngine;
const promises_1 = require("fs/promises");
const path_1 = require("path");
const fs_1 = require("fs");
// ═══════════════════════════════════════════════════════════════
// PURGE ENGINE
// ═══════════════════════════════════════════════════════════════
class PurgeEngine {
    static instance;
    meditationResult = null;
    srcRoot;
    backupRoot;
    options = {
        dryRun: false,
        createBackup: true,
        preserveInterfaces: true,
        preserveTypes: true,
        maxPurgePercent: 30,
        excludePatterns: ['index.ts', '.spec.ts', '.test.ts', 'types.ts', 'interfaces.ts'],
        verbose: true
    };
    constructor() {
        this.srcRoot = (0, path_1.join)(process.cwd(), 'src');
        this.backupRoot = (0, path_1.join)(process.cwd(), 'data', 'purge-backup');
    }
    static getInstance() {
        if (!PurgeEngine.instance)
            PurgeEngine.instance = new PurgeEngine();
        return PurgeEngine.instance;
    }
    // ─────────────────────────────────────────────────────────────
    // MAIN PURGE
    // ─────────────────────────────────────────────────────────────
    async purge(meditationResultPath, options) {
        const startTime = Date.now();
        if (options)
            this.options = { ...this.options, ...options };
        console.log('\n╔══════════════════════════════════════════════════════╗');
        console.log('║            💀 THE GREAT PURGE v2                     ║');
        console.log('║          "Eliminating Dead Code Safely"              ║');
        console.log(`║  Mode: ${this.options.dryRun ? '🔍 DRY RUN' : '⚡ LIVE PURGE'}                                  ║`);
        console.log('╚══════════════════════════════════════════════════════╝\n');
        const result = {
            timestamp: new Date().toISOString(), symbolsPurged: 0, filesModified: 0,
            linesRemoved: 0, bytesSaved: 0, safetyChecks: [], errors: [], backupPath: ''
        };
        try {
            console.log('📖 Loading meditation result...');
            await this.loadMeditationResult(meditationResultPath);
            const totalDead = this.getTotalDeadSymbols();
            console.log(`   Found ${totalDead} dead symbols to analyze\n`);
            if (this.options.createBackup && !this.options.dryRun) {
                console.log('💾 Creating backup...');
                result.backupPath = await this.createBackup();
                console.log(`   Backup: ${result.backupPath}\n`);
            }
            const symbolsByFile = this.groupSymbolsByFile();
            console.log(`📁 Symbols grouped into ${symbolsByFile.size} files\n`);
            console.log('═══════════════════════════════════════════════════════');
            console.log('  PROCESSING FILES');
            console.log('═══════════════════════════════════════════════════════\n');
            for (const [file, symbols] of symbolsByFile) {
                const fileResult = await this.processFile(file, symbols, result);
                if (fileResult.modified) {
                    result.filesModified++;
                    result.symbolsPurged += fileResult.symbolsPurged;
                    result.linesRemoved += fileResult.linesRemoved;
                    result.bytesSaved += fileResult.bytesSaved;
                }
            }
            await this.generateReport(result, Date.now() - startTime);
        }
        catch (error) {
            console.error('❌ Purge failed:', error);
            result.errors.push({ symbol: 'GLOBAL', file: 'N/A', error: String(error), recoverable: false });
        }
        return result;
    }
    // ─────────────────────────────────────────────────────────────
    // MEDITATION RESULT LOADING
    // ─────────────────────────────────────────────────────────────
    async loadMeditationResult(path) {
        const content = await (0, promises_1.readFile)(path, 'utf-8');
        this.meditationResult = JSON.parse(content);
    }
    getTotalDeadSymbols() {
        if (!this.meditationResult)
            return 0;
        return (this.meditationResult.deadSymbols.unusedExports?.length || 0) + (this.meditationResult.deadSymbols.unusedInterfaces?.length || 0);
    }
    groupSymbolsByFile() {
        const grouped = new Map();
        if (!this.meditationResult)
            return grouped;
        const allDeadSymbols = [...(this.meditationResult.deadSymbols.unusedExports || []), ...(this.meditationResult.deadSymbols.unusedInterfaces || [])];
        for (const symbol of allDeadSymbols) {
            if (this.options.preserveInterfaces && symbol.type === 'interface')
                continue;
            if (this.options.preserveTypes && symbol.type === 'type')
                continue;
            if (this.options.excludePatterns.some(pattern => symbol.file.includes(pattern)))
                continue;
            const existing = grouped.get(symbol.file) || [];
            existing.push(symbol);
            grouped.set(symbol.file, existing);
        }
        return grouped;
    }
    // ─────────────────────────────────────────────────────────────
    // FILE PROCESSING
    // ─────────────────────────────────────────────────────────────
    async processFile(relativePath, symbols, result) {
        const filePath = (0, path_1.join)(this.srcRoot, relativePath);
        if (!(0, fs_1.existsSync)(filePath)) {
            if (this.options.verbose)
                console.log(`   ⚠️ File not found: ${relativePath}`);
            return { modified: false, symbolsPurged: 0, linesRemoved: 0, bytesSaved: 0 };
        }
        const originalContent = await (0, promises_1.readFile)(filePath, 'utf-8');
        const originalSize = originalContent.length;
        const originalLines = originalContent.split('\n').length;
        let modifiedContent = originalContent;
        let purgedCount = 0;
        console.log(`📄 ${relativePath} (${symbols.length} dead symbols)`);
        for (const symbol of symbols) {
            const safetyCheck = this.performSafetyCheck(symbol, modifiedContent);
            result.safetyChecks.push(safetyCheck);
            if (!safetyCheck.passed) {
                console.log(`   ⚠️ Skip ${symbol.name}: ${safetyCheck.details}`);
                continue;
            }
            const removal = this.removeSymbol(symbol, modifiedContent);
            if (removal.success) {
                modifiedContent = removal.newContent;
                purgedCount++;
                console.log(`   ✅ Removed: ${symbol.name} (${symbol.type})`);
            }
            else {
                console.log(`   ❌ Failed: ${symbol.name} - ${removal.error}`);
                result.errors.push({ symbol: symbol.name, file: symbol.file, error: removal.error || 'Unknown error', recoverable: true });
            }
        }
        const newLines = modifiedContent.split('\n').length;
        const linesRemoved = originalLines - newLines;
        const bytesSaved = originalSize - modifiedContent.length;
        const purgePercent = (linesRemoved / originalLines) * 100;
        if (purgePercent > this.options.maxPurgePercent) {
            console.log(`   🛑 Aborting: Would remove ${purgePercent.toFixed(1)}% (max: ${this.options.maxPurgePercent}%)`);
            return { modified: false, symbolsPurged: 0, linesRemoved: 0, bytesSaved: 0 };
        }
        if (!this.options.dryRun && purgedCount > 0)
            await (0, promises_1.writeFile)(filePath, modifiedContent, 'utf-8');
        if (purgedCount > 0)
            console.log(`   📊 Result: -${linesRemoved} lines, -${bytesSaved} bytes\n`);
        return { modified: purgedCount > 0, symbolsPurged: purgedCount, linesRemoved, bytesSaved };
    }
    // ─────────────────────────────────────────────────────────────
    // SYMBOL REMOVAL
    // ─────────────────────────────────────────────────────────────
    removeSymbol(symbol, content) {
        try {
            const patterns = this.getRemovalPatterns(symbol);
            for (const pattern of patterns) {
                const match = content.match(pattern);
                if (match) {
                    const newContent = content.replace(pattern, '');
                    return { success: true, newContent: this.cleanupEmptyLines(newContent) };
                }
            }
            return { success: false, newContent: content, error: 'No matching pattern found' };
        }
        catch (error) {
            return { success: false, newContent: content, error: String(error) };
        }
    }
    getRemovalPatterns(symbol) {
        const name = this.escapeRegex(symbol.name);
        const patterns = [];
        switch (symbol.type) {
            case 'export':
                patterns.push(new RegExp(`^\\s*export\\s+const\\s+${name}\\s*=.*?;\\s*$`, 'gm'));
                patterns.push(new RegExp(`^\\s*export\\s+function\\s+${name}\\s*\\([^)]*\\)\\s*\\{[^}]*\\}\\s*$`, 'gms'));
                patterns.push(new RegExp(`^\\s*export\\s*\\{[^}]*\\b${name}\\b[^}]*\\};?\\s*$`, 'gm'));
                break;
            case 'interface':
                patterns.push(new RegExp(`^\\s*export\\s+interface\\s+${name}\\s*\\{[^}]*\\}\\s*$`, 'gms'));
                break;
            case 'type':
                patterns.push(new RegExp(`^\\s*export\\s+type\\s+${name}\\s*=.*?;\\s*$`, 'gms'));
                break;
            case 'class':
                patterns.push(new RegExp(`^\\s*export\\s+class\\s+${name}\\s*(extends[^{]*)?\\{[\\s\\S]*?^\\}\\s*$`, 'gm'));
                break;
            case 'function':
                patterns.push(new RegExp(`^\\s*export\\s+(async\\s+)?function\\s+${name}\\s*\\([^)]*\\)[^{]*\\{[\\s\\S]*?^\\}\\s*$`, 'gm'));
                break;
            case 'const':
                patterns.push(new RegExp(`^\\s*export\\s+const\\s+${name}\\s*[:=][^;]+;\\s*$`, 'gm'));
                break;
        }
        return patterns;
    }
    escapeRegex(str) { return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
    cleanupEmptyLines(content) { return content.replace(/\n{4,}/g, '\n\n\n'); }
    // ─────────────────────────────────────────────────────────────
    // SAFETY CHECKS
    // ─────────────────────────────────────────────────────────────
    performSafetyCheck(symbol, content) {
        if (!content.includes(symbol.name))
            return { symbol: symbol.name, file: symbol.file, check: 'existence', passed: false, details: 'Symbol not found in file' };
        const exportPattern = new RegExp(`export\\s+(const|function|class|interface|type)\\s+${symbol.name}`, 'g');
        const usagePattern = new RegExp(`(?<!export\\s+(const|function|class|interface|type)\\s+)\\b${symbol.name}\\b`, 'g');
        const exportMatches = content.match(exportPattern) || [];
        const usageMatches = content.match(usagePattern) || [];
        if (usageMatches.length > exportMatches.length + 1)
            return { symbol: symbol.name, file: symbol.file, check: 'internal-usage', passed: false, details: `Used ${usageMatches.length - exportMatches.length} times internally` };
        const corePatterns = [/Config$/, /Options$/, /Settings$/, /^init/i, /^get[A-Z]/, /^create[A-Z]/, /Instance$/];
        for (const pattern of corePatterns) {
            if (pattern.test(symbol.name))
                return { symbol: symbol.name, file: symbol.file, check: 'core-pattern', passed: false, details: `Matches core pattern: ${pattern}` };
        }
        return { symbol: symbol.name, file: symbol.file, check: 'all-checks', passed: true };
    }
    // ─────────────────────────────────────────────────────────────
    // BACKUP
    // ─────────────────────────────────────────────────────────────
    async createBackup() {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupPath = (0, path_1.join)(this.backupRoot, `purge-${timestamp}`);
        await (0, promises_1.mkdir)(backupPath, { recursive: true });
        const symbolsByFile = this.groupSymbolsByFile();
        for (const [relativePath] of symbolsByFile) {
            const sourcePath = (0, path_1.join)(this.srcRoot, relativePath);
            const destPath = (0, path_1.join)(backupPath, relativePath);
            if ((0, fs_1.existsSync)(sourcePath)) {
                await (0, promises_1.mkdir)((0, path_1.dirname)(destPath), { recursive: true });
                await (0, promises_1.writeFile)(destPath, await (0, promises_1.readFile)(sourcePath, 'utf-8'), 'utf-8');
            }
        }
        return backupPath;
    }
    // ─────────────────────────────────────────────────────────────
    // REPORTING
    // ─────────────────────────────────────────────────────────────
    async generateReport(result, durationMs) {
        const reportPath = (0, path_1.join)(process.cwd(), 'data', 'purge-report.json');
        const mdReportPath = (0, path_1.join)(process.cwd(), 'data', 'purge-report.md');
        await (0, promises_1.mkdir)((0, path_1.dirname)(reportPath), { recursive: true });
        await (0, promises_1.writeFile)(reportPath, JSON.stringify(result, null, 2), 'utf-8');
        const mdContent = `# 💀 THE GREAT PURGE v2 - Report

**Generated:** ${result.timestamp}
**Duration:** ${(durationMs / 1000).toFixed(2)}s
**Mode:** ${this.options.dryRun ? 'DRY RUN' : 'LIVE'}

## Summary
| Metric | Value |
|--------|-------|
| Symbols Purged | ${result.symbolsPurged} |
| Files Modified | ${result.filesModified} |
| Lines Removed | ${result.linesRemoved} |
| Bytes Saved | ${(result.bytesSaved / 1024).toFixed(2)} KB |

## Safety Checks
${result.safetyChecks.filter(c => c.passed).length} / ${result.safetyChecks.length} passed

### Failed:
${result.safetyChecks.filter(c => !c.passed).map(c => `- **${c.symbol}** (${c.file}): ${c.details}`).join('\n') || '_None_'}

## Errors
${result.errors.length > 0 ? result.errors.map(e => `- **${e.symbol}** (${e.file}): ${e.error}`).join('\n') : '_No errors_'}

## Backup
${result.backupPath ? `Backup at: \`${result.backupPath}\`` : '_No backup_'}

---
*Generated by QAntum Purge Engine v2*
`;
        await (0, promises_1.writeFile)(mdReportPath, mdContent, 'utf-8');
        console.log('\n╔══════════════════════════════════════════════════════╗');
        console.log('║            💀 PURGE COMPLETE                         ║');
        console.log(`║  Symbols: ${result.symbolsPurged} | Files: ${result.filesModified} | Lines: -${result.linesRemoved}     ║`);
        console.log(`║  Bytes saved: ${(result.bytesSaved / 1024).toFixed(1)} KB | Duration: ${(durationMs / 1000).toFixed(2)}s       ║`);
        console.log('╚══════════════════════════════════════════════════════╝\n');
    }
}
exports.PurgeEngine = PurgeEngine;
// ═══════════════════════════════════════════════════════════════
// FACTORY & CLI
// ═══════════════════════════════════════════════════════════════
function getPurgeEngine() {
    return PurgeEngine.getInstance();
}
async function main() {
    const args = process.argv.slice(2);
    const dryRun = args.includes('--dry-run');
    const engine = getPurgeEngine();
    const meditationPath = (0, path_1.join)(process.cwd(), 'data', 'supreme-meditation', 'meditation-result.json');
    if (!(0, fs_1.existsSync)(meditationPath)) {
        console.error('❌ meditation-result.json not found! Run supreme-meditation.ts first.');
        process.exit(1);
    }
    await engine.purge(meditationPath, { dryRun });
}
main().catch(console.error);
