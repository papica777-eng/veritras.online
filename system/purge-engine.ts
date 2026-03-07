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

import { readFile, writeFile, readdir, stat, mkdir } from 'fs/promises';
import { join, relative, dirname, basename } from 'path';
import { existsSync } from 'fs';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

interface DeadSymbol {
    name: string;
    file: string;
    type: 'export' | 'interface' | 'type' | 'function' | 'class' | 'const';
    line: number;
    reason: string;
}

interface MeditationResult {
    timestamp: string;
    duration: number;
    assimilation: { totalFiles: number; totalLines: number; totalSymbols: number; };
    layerAudit: { violations: any[]; circularDependencies: any[]; healthScore: number; };
    deadSymbols: { unusedExports: DeadSymbol[]; unusedInterfaces: DeadSymbol[]; };
}

interface PurgeResult {
    timestamp: string;
    symbolsPurged: number;
    filesModified: number;
    linesRemoved: number;
    bytesSaved: number;
    safetyChecks: SafetyCheck[];
    errors: PurgeError[];
    backupPath: string;
}

interface SafetyCheck {
    symbol: string;
    file: string;
    check: string;
    passed: boolean;
    details?: string;
}

interface PurgeError {
    symbol: string;
    file: string;
    error: string;
    recoverable: boolean;
}

interface PurgeOptions {
    dryRun: boolean;
    createBackup: boolean;
    preserveInterfaces: boolean;
    preserveTypes: boolean;
    maxPurgePercent: number;
    excludePatterns: string[];
    verbose: boolean;
}

// ═══════════════════════════════════════════════════════════════
// PURGE ENGINE
// ═══════════════════════════════════════════════════════════════

export class PurgeEngine {
    private static instance: PurgeEngine;
    private meditationResult: MeditationResult | null = null;
    private srcRoot: string;
    private backupRoot: string;

    private options: PurgeOptions = {
        dryRun: false,
        createBackup: true,
        preserveInterfaces: true,
        preserveTypes: true,
        maxPurgePercent: 30,
        excludePatterns: ['index.ts', '.spec.ts', '.test.ts', 'types.ts', 'interfaces.ts'],
        verbose: true
    };

    private constructor() {
        this.srcRoot = join(process.cwd(), 'src');
        this.backupRoot = join(process.cwd(), 'data', 'purge-backup');
    }

    static getInstance(): PurgeEngine {
        if (!PurgeEngine.instance) PurgeEngine.instance = new PurgeEngine();
        return PurgeEngine.instance;
    }

    // ─────────────────────────────────────────────────────────────
    // MAIN PURGE
    // ─────────────────────────────────────────────────────────────

    async purge(meditationResultPath: string, options?: Partial<PurgeOptions>): Promise<PurgeResult> {
        const startTime = Date.now();
        if (options) this.options = { ...this.options, ...options };

        console.log('\n╔══════════════════════════════════════════════════════╗');
        console.log('║            💀 THE GREAT PURGE v2                     ║');
        console.log('║          "Eliminating Dead Code Safely"              ║');
        console.log(`║  Mode: ${this.options.dryRun ? '🔍 DRY RUN' : '⚡ LIVE PURGE'}                                  ║`);
        console.log('╚══════════════════════════════════════════════════════╝\n');

        const result: PurgeResult = {
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
        } catch (error) {
            console.error('❌ Purge failed:', error);
            result.errors.push({ symbol: 'GLOBAL', file: 'N/A', error: String(error), recoverable: false });
        }

        return result;
    }

    // ─────────────────────────────────────────────────────────────
    // MEDITATION RESULT LOADING
    // ─────────────────────────────────────────────────────────────

    private async loadMeditationResult(path: string): Promise<void> {
        const content = await readFile(path, 'utf-8');
        this.meditationResult = JSON.parse(content);
    }

    private getTotalDeadSymbols(): number {
        if (!this.meditationResult) return 0;
        return (this.meditationResult.deadSymbols.unusedExports?.length || 0) + (this.meditationResult.deadSymbols.unusedInterfaces?.length || 0);
    }

    private groupSymbolsByFile(): Map<string, DeadSymbol[]> {
        const grouped = new Map<string, DeadSymbol[]>();
        if (!this.meditationResult) return grouped;
        const allDeadSymbols = [...(this.meditationResult.deadSymbols.unusedExports || []), ...(this.meditationResult.deadSymbols.unusedInterfaces || [])];
        for (const symbol of allDeadSymbols) {
            if (this.options.preserveInterfaces && symbol.type === 'interface') continue;
            if (this.options.preserveTypes && symbol.type === 'type') continue;
            if (this.options.excludePatterns.some(pattern => symbol.file.includes(pattern))) continue;
            const existing = grouped.get(symbol.file) || [];
            existing.push(symbol);
            grouped.set(symbol.file, existing);
        }
        return grouped;
    }

    // ─────────────────────────────────────────────────────────────
    // FILE PROCESSING
    // ─────────────────────────────────────────────────────────────

    private async processFile(relativePath: string, symbols: DeadSymbol[], result: PurgeResult): Promise<{ modified: boolean; symbolsPurged: number; linesRemoved: number; bytesSaved: number }> {
        const filePath = join(this.srcRoot, relativePath);
        if (!existsSync(filePath)) {
            if (this.options.verbose) console.log(`   ⚠️ File not found: ${relativePath}`);
            return { modified: false, symbolsPurged: 0, linesRemoved: 0, bytesSaved: 0 };
        }
        const originalContent = await readFile(filePath, 'utf-8');
        const originalSize = originalContent.length;
        const originalLines = originalContent.split('\n').length;
        let modifiedContent = originalContent;
        let purgedCount = 0;

        console.log(`📄 ${relativePath} (${symbols.length} dead symbols)`);
        for (const symbol of symbols) {
            const safetyCheck = this.performSafetyCheck(symbol, modifiedContent);
            result.safetyChecks.push(safetyCheck);
            if (!safetyCheck.passed) { console.log(`   ⚠️ Skip ${symbol.name}: ${safetyCheck.details}`); continue; }
            const removal = this.removeSymbol(symbol, modifiedContent);
            if (removal.success) { modifiedContent = removal.newContent; purgedCount++; console.log(`   ✅ Removed: ${symbol.name} (${symbol.type})`); }
            else { console.log(`   ❌ Failed: ${symbol.name} - ${removal.error}`); result.errors.push({ symbol: symbol.name, file: symbol.file, error: removal.error || 'Unknown error', recoverable: true }); }
        }

        const newLines = modifiedContent.split('\n').length;
        const linesRemoved = originalLines - newLines;
        const bytesSaved = originalSize - modifiedContent.length;
        const purgePercent = (linesRemoved / originalLines) * 100;

        if (purgePercent > this.options.maxPurgePercent) {
            console.log(`   🛑 Aborting: Would remove ${purgePercent.toFixed(1)}% (max: ${this.options.maxPurgePercent}%)`);
            return { modified: false, symbolsPurged: 0, linesRemoved: 0, bytesSaved: 0 };
        }
        if (!this.options.dryRun && purgedCount > 0) await writeFile(filePath, modifiedContent, 'utf-8');
        if (purgedCount > 0) console.log(`   📊 Result: -${linesRemoved} lines, -${bytesSaved} bytes\n`);
        return { modified: purgedCount > 0, symbolsPurged: purgedCount, linesRemoved, bytesSaved };
    }

    // ─────────────────────────────────────────────────────────────
    // SYMBOL REMOVAL
    // ─────────────────────────────────────────────────────────────

    private removeSymbol(symbol: DeadSymbol, content: string): { success: boolean; newContent: string; error?: string } {
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
        } catch (error) { return { success: false, newContent: content, error: String(error) }; }
    }

    private getRemovalPatterns(symbol: DeadSymbol): RegExp[] {
        const name = this.escapeRegex(symbol.name);
        const patterns: RegExp[] = [];
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

    private escapeRegex(str: string): string { return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
    private cleanupEmptyLines(content: string): string { return content.replace(/\n{4,}/g, '\n\n\n'); }

    // ─────────────────────────────────────────────────────────────
    // SAFETY CHECKS
    // ─────────────────────────────────────────────────────────────

    private performSafetyCheck(symbol: DeadSymbol, content: string): SafetyCheck {
        if (!content.includes(symbol.name)) return { symbol: symbol.name, file: symbol.file, check: 'existence', passed: false, details: 'Symbol not found in file' };

        const exportPattern = new RegExp(`export\\s+(const|function|class|interface|type)\\s+${symbol.name}`, 'g');
        const usagePattern = new RegExp(`(?<!export\\s+(const|function|class|interface|type)\\s+)\\b${symbol.name}\\b`, 'g');
        const exportMatches = content.match(exportPattern) || [];
        const usageMatches = content.match(usagePattern) || [];
        if (usageMatches.length > exportMatches.length + 1) return { symbol: symbol.name, file: symbol.file, check: 'internal-usage', passed: false, details: `Used ${usageMatches.length - exportMatches.length} times internally` };

        const corePatterns = [/Config$/, /Options$/, /Settings$/, /^init/i, /^get[A-Z]/, /^create[A-Z]/, /Instance$/];
        for (const pattern of corePatterns) {
            if (pattern.test(symbol.name)) return { symbol: symbol.name, file: symbol.file, check: 'core-pattern', passed: false, details: `Matches core pattern: ${pattern}` };
        }

        return { symbol: symbol.name, file: symbol.file, check: 'all-checks', passed: true };
    }

    // ─────────────────────────────────────────────────────────────
    // BACKUP
    // ─────────────────────────────────────────────────────────────

    private async createBackup(): Promise<string> {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupPath = join(this.backupRoot, `purge-${timestamp}`);
        await mkdir(backupPath, { recursive: true });
        const symbolsByFile = this.groupSymbolsByFile();
        for (const [relativePath] of symbolsByFile) {
            const sourcePath = join(this.srcRoot, relativePath);
            const destPath = join(backupPath, relativePath);
            if (existsSync(sourcePath)) {
                await mkdir(dirname(destPath), { recursive: true });
                await writeFile(destPath, await readFile(sourcePath, 'utf-8'), 'utf-8');
            }
        }
        return backupPath;
    }

    // ─────────────────────────────────────────────────────────────
    // REPORTING
    // ─────────────────────────────────────────────────────────────

    private async generateReport(result: PurgeResult, durationMs: number): Promise<void> {
        const reportPath = join(process.cwd(), 'data', 'purge-report.json');
        const mdReportPath = join(process.cwd(), 'data', 'purge-report.md');
        await mkdir(dirname(reportPath), { recursive: true });
        await writeFile(reportPath, JSON.stringify(result, null, 2), 'utf-8');

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
        await writeFile(mdReportPath, mdContent, 'utf-8');

        console.log('\n╔══════════════════════════════════════════════════════╗');
        console.log('║            💀 PURGE COMPLETE                         ║');
        console.log(`║  Symbols: ${result.symbolsPurged} | Files: ${result.filesModified} | Lines: -${result.linesRemoved}     ║`);
        console.log(`║  Bytes saved: ${(result.bytesSaved / 1024).toFixed(1)} KB | Duration: ${(durationMs / 1000).toFixed(2)}s       ║`);
        console.log('╚══════════════════════════════════════════════════════╝\n');
    }
}

// ═══════════════════════════════════════════════════════════════
// FACTORY & CLI
// ═══════════════════════════════════════════════════════════════

export function getPurgeEngine(): PurgeEngine {
    return PurgeEngine.getInstance();
}

async function main() {
    const args = process.argv.slice(2);
    const dryRun = args.includes('--dry-run');
    const engine = getPurgeEngine();
    const meditationPath = join(process.cwd(), 'data', 'supreme-meditation', 'meditation-result.json');
    if (!existsSync(meditationPath)) { console.error('❌ meditation-result.json not found! Run supreme-meditation.ts first.'); process.exit(1); }
    await engine.purge(meditationPath, { dryRun });
}

main().catch(console.error);
