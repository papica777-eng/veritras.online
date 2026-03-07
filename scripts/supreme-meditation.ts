/**
 * ╔═══════════════════════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                                               ║
 * ║  ████████╗██╗  ██╗███████╗    ███████╗██╗   ██╗██████╗ ██████╗ ███████╗███╗   ███╗███████╗    ║
 * ║  ╚══██╔══╝██║  ██║██╔════╝    ██╔════╝██║   ██║██╔══██╗██╔══██╗██╔════╝████╗ ████║██╔════╝    ║
 * ║     ██║   ███████║█████╗      ███████╗██║   ██║██████╔╝██████╔╝█████╗  ██╔████╔██║█████╗      ║
 * ║     ██║   ██╔══██║██╔══╝      ╚════██║██║   ██║██╔═══╝ ██╔══██╗██╔══╝  ██║╚██╔╝██║██╔══╝      ║
 * ║     ██║   ██║  ██║███████╗    ███████║╚██████╔╝██║     ██║  ██║███████╗██║ ╚═╝ ██║███████╗    ║
 * ║     ╚═╝   ╚═╝  ╚═╝╚══════╝    ╚══════╝ ╚═════╝ ╚═╝     ╚═╝  ╚═╝╚══════╝╚═╝     ╚═╝╚══════╝    ║
 * ║                                                                                               ║
 * ║  ███╗   ███╗███████╗██████╗ ██╗████████╗ █████╗ ████████╗██╗ ██████╗ ███╗   ██╗               ║
 * ║  ████╗ ████║██╔════╝██╔══██╗██║╚══██╔══╝██╔══██╗╚══██╔══╝██║██╔═══██╗████╗  ██║               ║
 * ║  ██╔████╔██║█████╗  ██║  ██║██║   ██║   ███████║   ██║   ██║██║   ██║██╔██╗ ██║               ║
 * ║  ██║╚██╔╝██║██╔══╝  ██║  ██║██║   ██║   ██╔══██║   ██║   ██║██║   ██║██║╚██╗██║               ║
 * ║  ██║ ╚═╝ ██║███████╗██████╔╝██║   ██║   ██║  ██║   ██║   ██║╚██████╔╝██║ ╚████║               ║
 * ║  ╚═╝     ╚═╝╚══════╝╚═════╝ ╚═╝   ╚═╝   ╚═╝  ╚═╝   ╚═╝   ╚═╝ ╚═════╝ ╚═╝  ╚═══╝               ║
 * ║                                                                                               ║
 * ║               THE HYPER-AUDIT OF QANTUM PRIME v28.1.0 SUPREME                                 ║
 * ║            "Всяка звезда на мястото си. Всяка връзка проверена."                              ║
 * ║                                                                                               ║
 * ║   © 2025-2026 QAntum | Dimitar Prodromov                                                      ║
 * ║                                                                                               ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════════════╝
 */

import { Assimilator, AssimilationResult, SymbolRegistry } from './assimilator';
import { DependencyGraph, GraphAnalysis, LayerViolation, CircularDependency } from '../src/cognition/DependencyGraph';
import { readdir, readFile, writeFile, stat, mkdir } from 'fs/promises';
import { join, relative, basename, extname } from 'path';
import { existsSync } from 'fs';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════


export interface MeditationResult {
    timestamp: string;
    duration: number;
    
    // Phase 1: Full Scan
    assimilation: {
        totalFiles: number;
        totalLines: number;
        totalSymbols: number;
        symbolRegistry: RegistrySummary;
    };
    
    // Phase 2: Cross-Layer Audit
    layerAudit: {
        violations: LayerViolation[];
        circularDependencies: CircularDependency[];
        healthScore: number;
    };
    
    // Phase 3: Dead Symbol Detection
    deadSymbols: {
        unusedExports: DeadSymbol[];
        unusedInterfaces: DeadSymbol[];
        unusedTypes: DeadSymbol[];
        totalDead: number;
    };
    
    // Phase 4: Context Injection Test
    contextTest: {
        module: string;
        extractedSymbols: number;
        documentedSymbols: number;
        mismatches: Mismatch[];
        coverage: number;
    };
    
    // Overall
    overallHealth: number;
    recommendations: string[];
}

export interface RegistrySummary {
    classes: number;
    functions: number;
    interfaces: number;
    types: number;
    constants: number;
    enums: number;
}

export interface DeadSymbol {
    name: string;
    file: string;
    type: 'export' | 'interface' | 'type' | 'function' | 'class';
    line: number;
    reason: string;
}

export interface Mismatch {
    symbol: string;
    inCode: boolean;
    inDocs: boolean;
    details: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUPREME MEDITATION ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

export class SupremeMeditation {
    private projectRoot: string;
    private assimilator: Assimilator;
    private dependencyGraph: DependencyGraph;
    private outputDir: string;
    
    // State
    private assimilationResult: AssimilationResult | null = null;
    private graphAnalysis: GraphAnalysis | null = null;

    constructor(projectRoot: string) {
        this.projectRoot = projectRoot;
        this.outputDir = join(projectRoot, 'data', 'supreme-meditation');
        this.assimilator = Assimilator.getInstance({ targetFolder: join(projectRoot, 'src') });
        this.dependencyGraph = DependencyGraph.getInstance(projectRoot);
    }

    /**
     * Execute the Supreme Meditation - Full System Audit
     */
    async meditate(): Promise<MeditationResult> {
        const startTime = Date.now();
        
        console.log('\n');
        console.log('╔══════════════════════════════════════════════════════════════════════════╗');
        console.log('║                    🧘 THE SUPREME MEDITATION                             ║');
        console.log('║                  QAntum Prime v28.1.0 SUPREME                            ║');
        console.log('╠══════════════════════════════════════════════════════════════════════════╣');
        console.log('║  "Всяка звезда на мястото си. Всяка връзка проверена."                   ║');
        console.log('╚══════════════════════════════════════════════════════════════════════════╝');
        console.log('');

        // Ensure output directory exists
        await mkdir(this.outputDir, { recursive: true });

        // Phase 1: Full Scan
        console.log('═══════════════════════════════════════════════════════════════════════════');
        console.log('  PHASE 1: FULL ASSIMILATION SCAN');
        console.log('═══════════════════════════════════════════════════════════════════════════');
        const assimilationPhase = await this.phase1_FullScan();

        // Phase 2: Cross-Layer Audit
        console.log('\n═══════════════════════════════════════════════════════════════════════════');
        console.log('  PHASE 2: CROSS-LAYER ARCHITECTURE AUDIT');
        console.log('═══════════════════════════════════════════════════════════════════════════');
        const layerAuditPhase = await this.phase2_CrossLayerAudit();

        // Phase 3: Dead Symbol Detection
        console.log('\n═══════════════════════════════════════════════════════════════════════════');
        console.log('  PHASE 3: DEAD SYMBOL DETECTION');
        console.log('═══════════════════════════════════════════════════════════════════════════');
        const deadSymbolsPhase = await this.phase3_DeadSymbolDetection();

        // Phase 4: Context Injection Test
        console.log('\n═══════════════════════════════════════════════════════════════════════════');
        console.log('  PHASE 4: CONTEXT INJECTION TEST (Ghost Protocol)');
        console.log('═══════════════════════════════════════════════════════════════════════════');
        const contextTestPhase = await this.phase4_ContextInjectionTest('ghost');

        // Calculate overall health
        const overallHealth = this.calculateOverallHealth(
            assimilationPhase,
            layerAuditPhase,
            deadSymbolsPhase,
            contextTestPhase
        );

        // Generate recommendations
        const recommendations = this.generateRecommendations(
            layerAuditPhase,
            deadSymbolsPhase,
            contextTestPhase
        );

        const duration = Date.now() - startTime;

        const result: MeditationResult = {
            timestamp: new Date().toISOString(),
            duration,
            assimilation: assimilationPhase,
            layerAudit: layerAuditPhase,
            deadSymbols: deadSymbolsPhase,
            contextTest: contextTestPhase,
            overallHealth,
            recommendations
        };

        // Save results
        await this.saveResults(result);

        // Print summary
        this.printSummary(result);

        return result;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PHASE 1: FULL SCAN
    // ─────────────────────────────────────────────────────────────────────────

    private async phase1_FullScan(): Promise<MeditationResult['assimilation']> {
        console.log('   🔬 Assimilating entire codebase...');
        
        this.assimilationResult = await this.assimilator.assimilate();
        const registry = this.assimilator.getRegistry();

        const summary: RegistrySummary = {
            classes: registry.classes.size,
            functions: registry.functions.size,
            interfaces: registry.interfaces.size,
            types: registry.types.size,
            constants: registry.constants.size,
            enums: 0 // Would need to track separately
        };

        const totalSymbols = Object.values(summary).reduce((a, b) => a + b, 0);

        console.log(`   ✅ Files scanned: ${this.assimilationResult.totalFiles}`);
        console.log(`   ✅ Lines of code: ${this.assimilationResult.totalLines.toLocaleString()}`);
        console.log(`   ✅ Symbols registered: ${totalSymbols.toLocaleString()}`);
        console.log(`      • Classes: ${summary.classes}`);
        console.log(`      • Functions: ${summary.functions}`);
        console.log(`      • Interfaces: ${summary.interfaces}`);
        console.log(`      • Types: ${summary.types}`);
        console.log(`      • Constants: ${summary.constants}`);

        return {
            totalFiles: this.assimilationResult.totalFiles,
            totalLines: this.assimilationResult.totalLines,
            totalSymbols,
            symbolRegistry: summary
        };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PHASE 2: CROSS-LAYER AUDIT
    // ─────────────────────────────────────────────────────────────────────────

    private async phase2_CrossLayerAudit(): Promise<MeditationResult['layerAudit']> {
        console.log('   🏗️ Building dependency graph...');
        
        this.graphAnalysis = await this.dependencyGraph.build();

        console.log(`   ✅ Modules analyzed: ${this.graphAnalysis.modules.length}`);
        console.log(`   ✅ Total edges: ${this.graphAnalysis.totalEdges}`);
        
        // Layer violations
        const violations = this.graphAnalysis.layerViolations;
        if (violations.length > 0) {
            console.log(`   ⚠️  Layer violations found: ${violations.length}`);
            for (const v of violations.slice(0, 5)) {
                console.log(`      ❌ ${basename(v.source)} (${v.sourceLayer}) → ${basename(v.target)} (${v.targetLayer})`);
            }
            if (violations.length > 5) {
                console.log(`      ... and ${violations.length - 5} more`);
            }
        } else {
            console.log('   ✅ No layer violations! Architecture is clean.');
        }

        // Circular dependencies
        const circular = this.graphAnalysis.circularDependencies;
        if (circular.length > 0) {
            console.log(`   ⚠️  Circular dependencies found: ${circular.length}`);
            for (const c of circular.slice(0, 3)) {
                const shortCycle = c.cycle.map(f => basename(f)).join(' → ');
                console.log(`      🔄 ${shortCycle}`);
            }
        } else {
            console.log('   ✅ No circular dependencies!');
        }

        console.log(`   🏥 Architecture Health Score: ${this.graphAnalysis.healthScore}/100`);

        return {
            violations,
            circularDependencies: circular,
            healthScore: this.graphAnalysis.healthScore
        };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PHASE 3: DEAD SYMBOL DETECTION
    // ─────────────────────────────────────────────────────────────────────────

    private async phase3_DeadSymbolDetection(): Promise<MeditationResult['deadSymbols']> {
        console.log('   💀 Scanning for dead symbols...');

        const deadSymbols: DeadSymbol[] = [];
        const registry = this.assimilator.getRegistry();

        if (!this.assimilationResult) {
            return { unusedExports: [], unusedInterfaces: [], unusedTypes: [], totalDead: 0 };
        }

        // Collect all symbol usages across all files
        const usedSymbols = new Set<string>();
        
        for (const file of this.assimilationResult.files) {
            // Get all identifiers used in the file
            const identifiers = this.extractAllIdentifiers(file.content);
            identifiers.forEach(id => usedSymbols.add(id));
        }

        // Check exports
        const unusedExports: DeadSymbol[] = [];
        for (const [name, filePath] of registry.exports) {
            // Skip if it's used somewhere
            let isUsed = false;
            
            for (const file of this.assimilationResult.files) {
                if (file.relativePath === filePath) continue; // Skip definition file
                
                // Check if imported or used
                const hasImport = file.imports.some(imp => 
                    imp.imports.includes(name)
                );
                
                if (hasImport) {
                    isUsed = true;
                    break;
                }
            }

            if (!isUsed && !this.isEntryPoint(name)) {
                unusedExports.push({
                    name,
                    file: filePath,
                    type: 'export',
                    line: 0,
                    reason: 'Not imported by any other file'
                });
            }
        }

        // Check interfaces
        const unusedInterfaces: DeadSymbol[] = [];
        for (const [name, filePath] of registry.interfaces) {
            if (!usedSymbols.has(name) && !this.isPublicAPI(name)) {
                unusedInterfaces.push({
                    name,
                    file: filePath,
                    type: 'interface',
                    line: 0,
                    reason: 'Never referenced in codebase'
                });
            }
        }

        // Check types
        const unusedTypes: DeadSymbol[] = [];
        for (const [name, filePath] of registry.types) {
            if (!usedSymbols.has(name) && !this.isPublicAPI(name)) {
                unusedTypes.push({
                    name,
                    file: filePath,
                    type: 'type',
                    line: 0,
                    reason: 'Never referenced in codebase'
                });
            }
        }

        const totalDead = unusedExports.length + unusedInterfaces.length + unusedTypes.length;

        console.log(`   ✅ Dead exports found: ${unusedExports.length}`);
        console.log(`   ✅ Unused interfaces: ${unusedInterfaces.length}`);
        console.log(`   ✅ Unused types: ${unusedTypes.length}`);
        console.log(`   📊 Total candidates for 'The Great Purge v2': ${totalDead}`);

        if (totalDead > 0 && totalDead <= 10) {
            console.log('   📋 Dead symbols:');
            for (const dead of [...unusedExports, ...unusedInterfaces, ...unusedTypes].slice(0, 10)) {
                console.log(`      • ${dead.name} (${dead.type}) in ${dead.file}`);
            }
        }

        return {
            unusedExports,
            unusedInterfaces,
            unusedTypes,
            totalDead
        };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PHASE 4: CONTEXT INJECTION TEST
    // ─────────────────────────────────────────────────────────────────────────

    private async phase4_ContextInjectionTest(moduleName: string): Promise<MeditationResult['contextTest']> {
        console.log(`   📖 Testing context injection for module: ${moduleName}`);

        const mismatches: Mismatch[] = [];
        const modulePath = join(this.projectRoot, 'src', moduleName);
        const docsPath = join(this.projectRoot, 'docs');

        // Get context from assimilator
        const moduleContext = this.assimilator.getModuleContext(moduleName);
        
        if (!moduleContext) {
            console.log(`   ⚠️  Module '${moduleName}' not found in assimilated context`);
            return {
                module: moduleName,
                extractedSymbols: 0,
                documentedSymbols: 0,
                mismatches: [],
                coverage: 0
            };
        }

        // Extract symbols from module
        const extractedSymbols = this.extractSymbolsFromContext(moduleContext);
        console.log(`   ✅ Symbols extracted from code: ${extractedSymbols.size}`);

        // Try to find documentation
        const documentedSymbols = await this.extractDocumentedSymbols(docsPath, moduleName);
        console.log(`   ✅ Symbols found in docs: ${documentedSymbols.size}`);

        // Find mismatches
        for (const symbol of extractedSymbols) {
            if (!documentedSymbols.has(symbol)) {
                mismatches.push({
                    symbol,
                    inCode: true,
                    inDocs: false,
                    details: `Symbol '${symbol}' exists in code but not documented`
                });
            }
        }

        for (const symbol of documentedSymbols) {
            if (!extractedSymbols.has(symbol)) {
                mismatches.push({
                    symbol,
                    inCode: false,
                    inDocs: true,
                    details: `Symbol '${symbol}' documented but not found in code (possible hallucination?)`
                });
            }
        }

        const coverage = extractedSymbols.size > 0 
            ? ((extractedSymbols.size - mismatches.filter(m => m.inCode && !m.inDocs).length) / extractedSymbols.size) * 100
            : 100;

        console.log(`   📊 Documentation coverage: ${coverage.toFixed(1)}%`);
        
        if (mismatches.length > 0) {
            console.log(`   ⚠️  Mismatches found: ${mismatches.length}`);
            for (const m of mismatches.slice(0, 5)) {
                const icon = m.inCode && !m.inDocs ? '📝' : '👻';
                console.log(`      ${icon} ${m.symbol}: ${m.details}`);
            }
        } else {
            console.log('   ✅ Perfect alignment between code and documentation!');
        }

        return {
            module: moduleName,
            extractedSymbols: extractedSymbols.size,
            documentedSymbols: documentedSymbols.size,
            mismatches,
            coverage
        };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // HELPER METHODS
    // ─────────────────────────────────────────────────────────────────────────

    private extractAllIdentifiers(content: string): Set<string> {
        const identifiers = new Set<string>();
        
        // Match identifiers (excluding keywords)
        const keywords = new Set([
            'import', 'export', 'from', 'const', 'let', 'var', 'function', 'class',
            'interface', 'type', 'enum', 'if', 'else', 'for', 'while', 'do', 'switch',
            'case', 'break', 'continue', 'return', 'throw', 'try', 'catch', 'finally',
            'new', 'this', 'super', 'extends', 'implements', 'static', 'public', 'private',
            'protected', 'readonly', 'async', 'await', 'yield', 'true', 'false', 'null',
            'undefined', 'void', 'never', 'any', 'unknown', 'string', 'number', 'boolean',
            'object', 'symbol', 'bigint', 'as', 'is', 'in', 'of', 'typeof', 'instanceof',
            'keyof', 'infer', 'extends', 'default', 'abstract', 'declare', 'namespace',
            'module', 'require', 'global'
        ]);

        const matches = content.match(/\b[A-Z][a-zA-Z0-9_]*\b/g) || [];
        for (const match of matches) {
            if (!keywords.has(match.toLowerCase())) {
                identifiers.add(match);
            }
        }

        return identifiers;
    }

    private isEntryPoint(name: string): boolean {
        // Entry points that are expected to be exported but not imported
        const entryPoints = [
            'QAntumPrime', 'default', 'main', 'init', 'start', 'run',
            'createInstance', 'getInstance', 'initialize'
        ];
        return entryPoints.some(ep => name.toLowerCase().includes(ep.toLowerCase()));
    }

    private isPublicAPI(name: string): boolean {
        // Public API symbols that might not be used internally
        const publicPatterns = ['Config', 'Options', 'Settings', 'Props', 'Result', 'Response'];
        return publicPatterns.some(p => name.includes(p));
    }

    private extractSymbolsFromContext(context: string): Set<string> {
        const symbols = new Set<string>();
        
        // Extract exported symbols
        const exportMatches = context.match(/export\s+(?:class|interface|type|function|const|enum)\s+(\w+)/g) || [];
        for (const match of exportMatches) {
            const name = match.split(/\s+/).pop();
            if (name) symbols.add(name);
        }

        return symbols;
    }

    private async extractDocumentedSymbols(docsPath: string, moduleName: string): Promise<Set<string>> {
        const symbols = new Set<string>();
        
        if (!existsSync(docsPath)) {
            return symbols;
        }

        try {
            const files = await readdir(docsPath);
            
            for (const file of files) {
                if (!file.endsWith('.md')) continue;
                
                const content = await readFile(join(docsPath, file), 'utf-8');
                
                // Look for documented symbols related to the module
                if (content.toLowerCase().includes(moduleName.toLowerCase())) {
                    // Extract code blocks
                    const codeBlocks = content.match(/```[\s\S]*?```/g) || [];
                    for (const block of codeBlocks) {
                        const blockSymbols = block.match(/\b[A-Z][a-zA-Z0-9_]*\b/g) || [];
                        blockSymbols.forEach(s => symbols.add(s));
                    }

                    // Extract inline code
                    const inlineCode = content.match(/`([A-Z][a-zA-Z0-9_]*)`/g) || [];
                    for (const code of inlineCode) {
                        symbols.add(code.replace(/`/g, ''));
                    }
                }
            }
        } catch (error) {
            console.log(`   ⚠️  Could not read docs: ${error}`);
        }

        return symbols;
    }

    private calculateOverallHealth(
        assimilation: MeditationResult['assimilation'],
        layerAudit: MeditationResult['layerAudit'],
        deadSymbols: MeditationResult['deadSymbols'],
        contextTest: MeditationResult['contextTest']
    ): number {
        let health = 100;

        // Architecture health (40% weight)
        health -= (100 - layerAudit.healthScore) * 0.4;

        // Dead symbols penalty (20% weight)
        const deadRatio = deadSymbols.totalDead / Math.max(assimilation.totalSymbols, 1);
        health -= deadRatio * 100 * 0.2;

        // Documentation coverage (20% weight)
        health -= (100 - contextTest.coverage) * 0.2;

        // Circular dependencies penalty (20% weight)
        health -= Math.min(layerAudit.circularDependencies.length * 5, 20);

        return Math.max(0, Math.min(100, Math.round(health)));
    }

    private generateRecommendations(
        layerAudit: MeditationResult['layerAudit'],
        deadSymbols: MeditationResult['deadSymbols'],
        contextTest: MeditationResult['contextTest']
    ): string[] {
        const recommendations: string[] = [];

        // Layer violations
        if (layerAudit.violations.length > 0) {
            recommendations.push(
                `🏗️ Fix ${layerAudit.violations.length} layer violations to maintain clean architecture. ` +
                `Lower layers (physics, biology) should not import from higher layers (chemistry, quantum).`
            );
        }

        // Circular dependencies
        if (layerAudit.circularDependencies.length > 0) {
            recommendations.push(
                `🔄 Break ${layerAudit.circularDependencies.length} circular dependencies. ` +
                `Consider extracting shared code into a separate utility module.`
            );
        }

        // Dead symbols
        if (deadSymbols.totalDead > 10) {
            recommendations.push(
                `💀 Consider 'The Great Purge v2': Remove ${deadSymbols.totalDead} unused symbols ` +
                `to reduce codebase complexity.`
            );
        }

        // Documentation
        if (contextTest.coverage < 80) {
            recommendations.push(
                `📝 Documentation coverage is ${contextTest.coverage.toFixed(1)}%. ` +
                `Document ${contextTest.mismatches.filter(m => m.inCode && !m.inDocs).length} undocumented symbols.`
            );
        }

        // Documentation hallucinations
        const hallucinations = contextTest.mismatches.filter(m => !m.inCode && m.inDocs);
        if (hallucinations.length > 0) {
            recommendations.push(
                `👻 Found ${hallucinations.length} documented symbols that don't exist in code. ` +
                `Update documentation to match reality.`
            );
        }

        if (recommendations.length === 0) {
            recommendations.push('✨ Codebase is in excellent health! Continue the great work.');
        }

        return recommendations;
    }

    private async saveResults(result: MeditationResult): Promise<void> {
        // Save JSON
        await writeFile(
            join(this.outputDir, 'meditation-result.json'),
            JSON.stringify(result, null, 2)
        );

        // Save Markdown report
        const report = this.generateMarkdownReport(result);
        await writeFile(
            join(this.outputDir, 'meditation-report.md'),
            report
        );

        // Save dependency graph
        await this.dependencyGraph.saveAll(join(this.outputDir, 'dependency-graph'));

        console.log(`\n   💾 Results saved to: ${this.outputDir}`);
    }

    private generateMarkdownReport(result: MeditationResult): string {
        const lines: string[] = [];

        lines.push('# 🧘 THE SUPREME MEDITATION - AUDIT REPORT');
        lines.push(`**QAntum Prime v28.1.0 SUPREME**`);
        lines.push(`Generated: ${result.timestamp}`);
        lines.push(`Duration: ${(result.duration / 1000).toFixed(2)}s`);
        lines.push('');

        lines.push('## 📊 Overall Health Score');
        lines.push('');
        const bar = '█'.repeat(Math.floor(result.overallHealth / 2)) + '░'.repeat(50 - Math.floor(result.overallHealth / 2));
        lines.push(`\`[${bar}]\` **${result.overallHealth}%**`);
        lines.push('');

        lines.push('## Phase 1: Assimilation Scan');
        lines.push(`- **Files:** ${result.assimilation.totalFiles.toLocaleString()}`);
        lines.push(`- **Lines:** ${result.assimilation.totalLines.toLocaleString()}`);
        lines.push(`- **Symbols:** ${result.assimilation.totalSymbols.toLocaleString()}`);
        lines.push('');

        lines.push('### Symbol Registry');
        lines.push('| Type | Count |');
        lines.push('|------|-------|');
        lines.push(`| Classes | ${result.assimilation.symbolRegistry.classes} |`);
        lines.push(`| Functions | ${result.assimilation.symbolRegistry.functions} |`);
        lines.push(`| Interfaces | ${result.assimilation.symbolRegistry.interfaces} |`);
        lines.push(`| Types | ${result.assimilation.symbolRegistry.types} |`);
        lines.push(`| Constants | ${result.assimilation.symbolRegistry.constants} |`);
        lines.push('');

        lines.push('## Phase 2: Architecture Audit');
        lines.push(`- **Health Score:** ${result.layerAudit.healthScore}/100`);
        lines.push(`- **Layer Violations:** ${result.layerAudit.violations.length}`);
        lines.push(`- **Circular Dependencies:** ${result.layerAudit.circularDependencies.length}`);
        lines.push('');

        if (result.layerAudit.violations.length > 0) {
            lines.push('### Layer Violations');
            for (const v of result.layerAudit.violations.slice(0, 10)) {
                lines.push(`- ❌ \`${v.source}\` (${v.sourceLayer}) → \`${v.target}\` (${v.targetLayer})`);
            }
            lines.push('');
        }

        if (result.layerAudit.circularDependencies.length > 0) {
            lines.push('### Circular Dependencies');
            for (const c of result.layerAudit.circularDependencies.slice(0, 10)) {
                lines.push(`- 🔄 ${c.cycle.map(f => `\`${basename(f)}\``).join(' → ')}`);
                lines.push(`  - Severity: ${c.severity}, Suggestion: ${c.suggestion}`);
            }
            lines.push('');
        }

        lines.push('## Phase 3: Dead Symbol Detection');
        lines.push(`- **Unused Exports:** ${result.deadSymbols.unusedExports.length}`);
        lines.push(`- **Unused Interfaces:** ${result.deadSymbols.unusedInterfaces.length}`);
        lines.push(`- **Unused Types:** ${result.deadSymbols.unusedTypes.length}`);
        lines.push(`- **Total Candidates for Purge:** ${result.deadSymbols.totalDead}`);
        lines.push('');

        lines.push('## Phase 4: Context Injection Test');
        lines.push(`- **Module:** ${result.contextTest.module}`);
        lines.push(`- **Symbols in Code:** ${result.contextTest.extractedSymbols}`);
        lines.push(`- **Symbols in Docs:** ${result.contextTest.documentedSymbols}`);
        lines.push(`- **Coverage:** ${result.contextTest.coverage.toFixed(1)}%`);
        lines.push(`- **Mismatches:** ${result.contextTest.mismatches.length}`);
        lines.push('');

        lines.push('## 📋 Recommendations');
        for (const rec of result.recommendations) {
            lines.push(`- ${rec}`);
        }
        lines.push('');

        lines.push('---');
        lines.push('*Generated by Supreme Meditation Engine | QAntum Prime*');

        return lines.join('\n');
    }

    private printSummary(result: MeditationResult): void {
        console.log('\n');
        console.log('╔══════════════════════════════════════════════════════════════════════════╗');
        console.log('║                    🧘 MEDITATION COMPLETE                                ║');
        console.log('╠══════════════════════════════════════════════════════════════════════════╣');
        
        const bar = '█'.repeat(Math.floor(result.overallHealth / 2)) + '░'.repeat(50 - Math.floor(result.overallHealth / 2));
        const healthIcon = result.overallHealth >= 80 ? '🟢' : result.overallHealth >= 60 ? '🟡' : '🔴';
        
        console.log(`║  ${healthIcon} Overall Health: [${bar}] ${result.overallHealth}%  ║`);
        console.log('║                                                                          ║');
        console.log(`║  📁 Files: ${String(result.assimilation.totalFiles).padEnd(10)} 📝 Lines: ${String(result.assimilation.totalLines.toLocaleString()).padEnd(12)} 🔣 Symbols: ${String(result.assimilation.totalSymbols).padEnd(6)} ║`);
        console.log(`║  ❌ Violations: ${String(result.layerAudit.violations.length).padEnd(6)} 🔄 Cycles: ${String(result.layerAudit.circularDependencies.length).padEnd(8)} 💀 Dead: ${String(result.deadSymbols.totalDead).padEnd(8)} ║`);
        console.log('║                                                                          ║');
        console.log('║  📋 RECOMMENDATIONS:                                                     ║');
        
        for (const rec of result.recommendations.slice(0, 3)) {
            const truncated = rec.length > 68 ? rec.slice(0, 65) + '...' : rec;
            console.log(`║  ${truncated.padEnd(72)} ║`);
        }
        
        console.log('║                                                                          ║');
        console.log(`║  ⏱️ Duration: ${(result.duration / 1000).toFixed(2)}s                                                       ║`);
        console.log('╚══════════════════════════════════════════════════════════════════════════╝');
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// CLI EXECUTION
// ═══════════════════════════════════════════════════════════════════════════════

if (require.main === module) {
    (async () => {
        const meditation = new SupremeMeditation(process.cwd());
        await meditation.meditate();
    })();
}

export default SupremeMeditation;
