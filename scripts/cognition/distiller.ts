/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                               ║
 * ║   QANTUM KNOWLEDGE DISTILLER                                                  ║
 * ║   "Превръща код в архитектурни принципи"                                     ║
 * ║                                                                               ║
 * ║   © 2025-2026 QAntum | Dimitar Prodromov                                        ║
 * ║                                                                               ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 * 
 * Процес на дестилация:
 * 
 *   SOURCE CODE → PARSE → ANALYZE → EXTRACT → COMPRESS → KNOWLEDGE JSON
 *                   ↓        ↓         ↓          ↓
 *                  AST    Patterns   Rules    Principles
 */

import * as fs from 'fs';
import * as path from 'path';

// ═══════════════════════════════════════════════════════════════════════════════
// ТИПОВЕ
// ═══════════════════════════════════════════════════════════════════════════════

/** Архитектурен принцип */
export interface ArchitecturalPrinciple {
    id: string;
    name: string;
    category: PrincipleCategory;
    description: string;
    evidence: Evidence[];
    confidence: number; // 0.0-1.0
    appliesTo: string[]; // file patterns
    learnedFrom: string[]; // source files
}

/** Категория на принципа */
export type PrincipleCategory = 
    | 'layering'      // Слоева архитектура
    | 'naming'        // Конвенции за имена
    | 'patterns'      // Design patterns
    | 'dependencies'  // Управление на зависимости
    | 'error-handling'// Обработка на грешки
    | 'async'         // Асинхронни операции
    | 'security'      // Сигурност
    | 'performance'   // Производителност
    | 'testing'       // Тестване
    | 'documentation';// Документация

/** Доказателство за принцип */
export interface Evidence {
    file: string;
    line: number;
    snippet: string;
    type: 'strong' | 'moderate' | 'weak';
}

/** Импорт граф */
export interface ImportGraph {
    nodes: Map<string, FileNode>;
    edges: ImportEdge[];
    cycles: string[][];
}

/** Файлов възел */
export interface FileNode {
    path: string;
    layer: string;
    imports: string[];
    exports: string[];
    classes: string[];
    functions: string[];
    complexity: number;
}

/** Импорт връзка */
export interface ImportEdge {
    from: string;
    to: string;
    type: 'direct' | 'reexport' | 'dynamic';
}

/** Дестилирано знание */
export interface DistilledKnowledge {
    version: string;
    timestamp: string;
    projectName: string;
    principles: ArchitecturalPrinciple[];
    importGraph: {
        nodeCount: number;
        edgeCount: number;
        cycles: string[][];
        layerViolations: LayerViolation[];
    };
    statistics: KnowledgeStats;
    metadata: {
        distillationTime: number;
        filesProcessed: number;
        linesAnalyzed: number;
    };
}

/** Нарушение на слоеве */
export interface LayerViolation {
    from: { file: string; layer: string };
    to: { file: string; layer: string };
    severity: 'error' | 'warning';
}

/** Статистики */
export interface KnowledgeStats {
    totalFiles: number;
    totalLines: number;
    totalClasses: number;
    totalFunctions: number;
    avgComplexity: number;
    layerDistribution: Record<string, number>;
    patternUsage: Record<string, number>;
}

/** Конфигурация */
export interface DistillerConfig {
    rootDir: string;
    outputPath: string;
    includePatterns: string[];
    excludePatterns: string[];
    layers: LayerDefinition[];
    verbose: boolean;
}

/** Дефиниция на слой */
export interface LayerDefinition {
    name: string;
    patterns: string[];
    allowedDependencies: string[];
    level: number; // По-висок = по-абстрактен
}

// ═══════════════════════════════════════════════════════════════════════════════
// DEFAULT LAYER ARCHITECTURE (5-Layer QAntum)
// ═══════════════════════════════════════════════════════════════════════════════

export const QANTUM_LAYERS: LayerDefinition[] = [
    {
        name: 'Math',
        patterns: ['**/math/**', '**/utils/**', '**/helpers/**'],
        allowedDependencies: [],
        level: 1
    },
    {
        name: 'Logic',
        patterns: ['**/logic/**', '**/core/**', '**/engine/**'],
        allowedDependencies: ['Math'],
        level: 2
    },
    {
        name: 'Physics',
        patterns: ['**/physics/**', '**/network/**', '**/io/**'],
        allowedDependencies: ['Math', 'Logic'],
        level: 3
    },
    {
        name: 'Biology',
        patterns: ['**/biology/**', '**/swarm/**', '**/oracle/**', '**/ghost/**'],
        allowedDependencies: ['Math', 'Logic', 'Physics'],
        level: 4
    },
    {
        name: 'Reality',
        patterns: ['**/reality/**', '**/api/**', '**/cli/**', '**/dashboard/**'],
        allowedDependencies: ['Math', 'Logic', 'Physics', 'Biology'],
        level: 5
    }
];

// ═══════════════════════════════════════════════════════════════════════════════
// KNOWLEDGE DISTILLER
// ═══════════════════════════════════════════════════════════════════════════════

export class KnowledgeDistiller {
    private config: DistillerConfig;
    private fileNodes: Map<string, FileNode> = new Map();
    private importEdges: ImportEdge[] = [];
    private principles: ArchitecturalPrinciple[] = [];

    constructor(config: Partial<DistillerConfig> = {}) {
        this.config = {
            rootDir: process.cwd(),
            outputPath: './data/distilled-knowledge.json',
            includePatterns: ['**/*.ts', '**/*.js'],
            excludePatterns: ['**/node_modules/**', '**/dist/**', '**/*.test.*', '**/*.spec.*'],
            layers: QANTUM_LAYERS,
            verbose: true,
            ...config
        };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ГЛАВЕН МЕТОД: DISTILL
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Извършва пълна дестилация на знанието
     */
    // Complexity: O(N) — linear iteration
    async distill(): Promise<DistilledKnowledge> {
        const startTime = Date.now();
        this.log('\n' + '═'.repeat(70));
        this.log('🧪 KNOWLEDGE DISTILLATION STARTED');
        this.log('═'.repeat(70) + '\n');

        // Стъпка 1: Сканиране на файлове
        this.log('📁 Phase 1: Scanning source files...');
        // SAFETY: async operation — wrap in try-catch for production resilience
        const files = await this.scanFiles();
        this.log(`   Found ${files.length} files`);

        // Стъпка 2: Парсване и анализ
        this.log('\n🔍 Phase 2: Parsing and analyzing...');
        let totalLines = 0;
        for (const file of files) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            const node = await this.parseFile(file);
            if (node) {
                this.fileNodes.set(file, node);
                totalLines += node.complexity;
            }
        }
        this.log(`   Analyzed ${this.fileNodes.size} modules`);

        // Стъпка 3: Изграждане на импорт граф
        this.log('\n🕸️ Phase 3: Building import graph...');
        this.buildImportGraph();
        this.log(`   ${this.importEdges.length} dependencies mapped`);

        // Стъпка 4: Откриване на цикли
        this.log('\n🔄 Phase 4: Detecting cycles...');
        const cycles = this.detectCycles();
        this.log(`   ${cycles.length} cycles found`);

        // Стъпка 5: Проверка за layer violations
        this.log('\n⚠️ Phase 5: Checking layer violations...');
        const violations = this.detectLayerViolations();
        this.log(`   ${violations.length} violations detected`);

        // Стъпка 6: Извличане на принципи
        this.log('\n📚 Phase 6: Extracting principles...');
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.extractPrinciples();
        this.log(`   ${this.principles.length} principles identified`);

        // Стъпка 7: Компресиране и запис
        this.log('\n💾 Phase 7: Compressing and saving...');
        const knowledge = this.compileKnowledge(startTime, files.length, totalLines, cycles, violations);
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.saveKnowledge(knowledge);

        this.log('\n' + '═'.repeat(70));
        this.log('✅ DISTILLATION COMPLETE');
        this.log(`   Time: ${Date.now() - startTime}ms`);
        this.log(`   Output: ${this.config.outputPath}`);
        this.log('═'.repeat(70) + '\n');

        return knowledge;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // SCANNING
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Сканира файловата система за source файлове
     */
    // Complexity: O(N) — linear iteration
    private async scanFiles(): Promise<string[]> {
        const files: string[] = [];
        
        const walkDir = (dir: string): void => {
            try {
                const entries = fs.readdirSync(dir, { withFileTypes: true });
                
                for (const entry of entries) {
                    const fullPath = path.join(dir, entry.name);
                    const relativePath = path.relative(this.config.rootDir, fullPath);
                    
                    // Проверка за exclude
                    if (this.shouldExclude(relativePath)) continue;
                    
                    if (entry.isDirectory()) {
                        // Complexity: O(1)
                        walkDir(fullPath);
                    } else if (entry.isFile() && this.shouldInclude(entry.name)) {
                        files.push(fullPath);
                    }
                }
            } catch (e) {
                // Skip inaccessible directories
            }
        };

        // Complexity: O(1)
        walkDir(this.config.rootDir);
        return files;
    }

    // Complexity: O(1)
    private shouldInclude(filename: string): boolean {
        return filename.endsWith('.ts') || filename.endsWith('.js');
    }

    // Complexity: O(1)
    private shouldExclude(relativePath: string): boolean {
        const excludes = ['node_modules', 'dist', '.git', 'coverage', '.vscode'];
        return excludes.some(ex => relativePath.includes(ex));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PARSING
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Парсва файл и извлича метаданни
     */
    // Complexity: O(1) — amortized
    private async parseFile(filePath: string): Promise<FileNode | null> {
        try {
            const content = fs.readFileSync(filePath, 'utf-8');
            const lines = content.split('\n');
            
            // Извличане на импорти
            const imports = this.extractImports(content);
            
            // Извличане на експорти
            const exports = this.extractExports(content);
            
            // Извличане на класове
            const classes = this.extractClasses(content);
            
            // Извличане на функции
            const functions = this.extractFunctions(content);
            
            // Определяне на слой
            const layer = this.determineLayer(filePath);
            
            // Изчисляване на сложност
            const complexity = this.calculateComplexity(content);

            return {
                path: filePath,
                layer,
                imports,
                exports,
                classes,
                functions,
                complexity
            };
        } catch (e) {
            return null;
        }
    }

    /** Извлича import statements */
    // Complexity: O(1)
    private extractImports(content: string): string[] {
        const imports: string[] = [];
        
        // ES6 imports
        const es6Regex = /import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)\s+from\s+)?['"]([^'"]+)['"]/g;
        let match;
        while ((match = es6Regex.exec(content)) !== null) {
            imports.push(match[1]);
        }
        
        // CommonJS requires
        const cjsRegex = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
        while ((match = cjsRegex.exec(content)) !== null) {
            imports.push(match[1]);
        }
        
        return [...new Set(imports)];
    }

    /** Извлича exports */
    // Complexity: O(N) — loop-based
    private extractExports(content: string): string[] {
        const exports: string[] = [];
        
        // Named exports
        const namedRegex = /export\s+(?:const|let|var|function|class|interface|type|enum)\s+(\w+)/g;
        let match;
        while ((match = namedRegex.exec(content)) !== null) {
            exports.push(match[1]);
        }
        
        // Default export
        if (/export\s+default/.test(content)) {
            exports.push('default');
        }
        
        return exports;
    }

    /** Извлича класове */
    // Complexity: O(N) — loop-based
    private extractClasses(content: string): string[] {
        const classes: string[] = [];
        const regex = /class\s+(\w+)/g;
        let match;
        while ((match = regex.exec(content)) !== null) {
            classes.push(match[1]);
        }
        return classes;
    }

    /** Извлича функции */
    // Complexity: O(N*M) — nested iteration detected
    private extractFunctions(content: string): string[] {
        const functions: string[] = [];
        
        // Function declarations
        const funcRegex = /function\s+(\w+)/g;
        let match;
        while ((match = funcRegex.exec(content)) !== null) {
            functions.push(match[1]);
        }
        
        // Arrow functions assigned to const
        const arrowRegex = /const\s+(\w+)\s*=\s*(?:async\s*)?\(/g;
        while ((match = arrowRegex.exec(content)) !== null) {
            functions.push(match[1]);
        }
        
        return functions;
    }

    /** Определя слоя на файла */
    // Complexity: O(N*M) — nested iteration detected
    private determineLayer(filePath: string): string {
        const relativePath = path.relative(this.config.rootDir, filePath).replace(/\\/g, '/');
        
        for (const layer of this.config.layers) {
            for (const pattern of layer.patterns) {
                if (this.matchPattern(relativePath, pattern)) {
                    return layer.name;
                }
            }
        }
        
        return 'Unknown';
    }

    /** Проста pattern matching */
    // Complexity: O(1)
    private matchPattern(path: string, pattern: string): boolean {
        const regexPattern = pattern
            .replace(/\*\*/g, '.*')
            .replace(/\*/g, '[^/]*');
        return new RegExp(regexPattern).test(path);
    }

    /** Изчислява cyclomatic complexity (опростено) */
    // Complexity: O(N*M) — nested iteration detected
    private calculateComplexity(content: string): number {
        let complexity = 1;
        
        // Контролни структури
        const controlKeywords = /\b(if|else|for|while|switch|case|catch|try|\?\?|\|\||&&)\b/g;
        const matches = content.match(controlKeywords);
        if (matches) {
            complexity += matches.length;
        }
        
        return complexity;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // IMPORT GRAPH
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Изгражда граф на зависимостите
     */
    // Complexity: O(N*M) — nested iteration detected
    private buildImportGraph(): void {
        for (const [filePath, node] of this.fileNodes) {
            for (const imp of node.imports) {
                // Резолване на относителни пътища
                const resolvedPath = this.resolveImport(filePath, imp);
                
                if (resolvedPath && this.fileNodes.has(resolvedPath)) {
                    this.importEdges.push({
                        from: filePath,
                        to: resolvedPath,
                        type: 'direct'
                    });
                }
            }
        }
    }

    /** Резолва import path */
    // Complexity: O(N) — linear iteration
    private resolveImport(fromFile: string, importPath: string): string | null {
        // Пропускаме external packages
        if (!importPath.startsWith('.') && !importPath.startsWith('/')) {
            return null;
        }
        
        const dir = path.dirname(fromFile);
        let resolved = path.resolve(dir, importPath);
        
        // Добавяне на разширение ако липсва
        const extensions = ['.ts', '.js', '/index.ts', '/index.js'];
        for (const ext of extensions) {
            const withExt = resolved + ext;
            if (fs.existsSync(withExt)) {
                return withExt;
            }
        }
        
        if (fs.existsSync(resolved)) {
            return resolved;
        }
        
        return null;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // CYCLE DETECTION (Tarjan's Algorithm)
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Открива циклични зависимости
     */
    // Complexity: O(N*M) — nested iteration detected
    private detectCycles(): string[][] {
        const cycles: string[][] = [];
        const visited = new Set<string>();
        const recursionStack = new Set<string>();
        const path: string[] = [];

        const dfs = (node: string): void => {
            visited.add(node);
            recursionStack.add(node);
            path.push(node);

            const edges = this.importEdges.filter(e => e.from === node);
            for (const edge of edges) {
                if (!visited.has(edge.to)) {
                    // Complexity: O(1) — hash/map lookup
                    dfs(edge.to);
                } else if (recursionStack.has(edge.to)) {
                    // Намерен е цикъл
                    const cycleStart = path.indexOf(edge.to);
                    if (cycleStart !== -1) {
                        const cycle = path.slice(cycleStart).map(p => 
                            path.relative(this.config.rootDir, p)
                        );
                        cycle.push(path.relative(this.config.rootDir, edge.to));
                        cycles.push(cycle);
                    }
                }
            }

            path.pop();
            recursionStack.delete(node);
        };

        for (const node of this.fileNodes.keys()) {
            if (!visited.has(node)) {
                // Complexity: O(1)
                dfs(node);
            }
        }

        return cycles;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // LAYER VIOLATIONS
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Открива нарушения на слоевата архитектура
     */
    // Complexity: O(N) — linear iteration
    private detectLayerViolations(): LayerViolation[] {
        const violations: LayerViolation[] = [];
        const layerMap = new Map(this.config.layers.map(l => [l.name, l]));

        for (const edge of this.importEdges) {
            const fromNode = this.fileNodes.get(edge.from);
            const toNode = this.fileNodes.get(edge.to);
            
            if (!fromNode || !toNode) continue;
            
            const fromLayer = layerMap.get(fromNode.layer);
            const toLayer = layerMap.get(toNode.layer);
            
            if (!fromLayer || !toLayer) continue;
            
            // Проверка: по-долен слой не може да импортира от по-горен
            if (fromLayer.level < toLayer.level) {
                violations.push({
                    from: { file: path.relative(this.config.rootDir, edge.from), layer: fromNode.layer },
                    to: { file: path.relative(this.config.rootDir, edge.to), layer: toNode.layer },
                    severity: 'error'
                });
            }
            
            // Проверка: импортът трябва да е от позволените зависимости
            if (!fromLayer.allowedDependencies.includes(toNode.layer) && fromNode.layer !== toNode.layer) {
                if (fromLayer.level >= toLayer.level) {
                    violations.push({
                        from: { file: path.relative(this.config.rootDir, edge.from), layer: fromNode.layer },
                        to: { file: path.relative(this.config.rootDir, edge.to), layer: toNode.layer },
                        severity: 'warning'
                    });
                }
            }
        }

        return violations;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PRINCIPLE EXTRACTION
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Извлича архитектурни принципи от анализа
     */
    // Complexity: O(1)
    private async extractPrinciples(): Promise<void> {
        // Принцип 1: Слоева изолация
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.extractLayeringPrinciples();
        
        // Принцип 2: Naming conventions
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.extractNamingPrinciples();
        
        // Принцип 3: Design patterns
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.extractPatternPrinciples();
        
        // Принцип 4: Error handling
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.extractErrorHandlingPrinciples();
        
        // Принцип 5: Async patterns
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.extractAsyncPrinciples();
    }

    // Complexity: O(N) — linear iteration
    private async extractLayeringPrinciples(): Promise<void> {
        const layerCounts = new Map<string, number>();
        
        for (const node of this.fileNodes.values()) {
            layerCounts.set(node.layer, (layerCounts.get(node.layer) || 0) + 1);
        }

        if (layerCounts.size > 1) {
            this.principles.push({
                id: 'LAYER_001',
                name: '5-Layer Architecture',
                category: 'layering',
                description: `Project uses ${layerCounts.size} distinct layers: ${Array.from(layerCounts.keys()).join(', ')}`,
                evidence: Array.from(layerCounts.entries()).map(([layer, count]) => ({
                    file: `${layer}/*`,
                    line: 0,
                    snippet: `${count} files in ${layer} layer`,
                    type: 'strong' as const
                })),
                confidence: 0.9,
                appliesTo: ['**/*.ts'],
                learnedFrom: Array.from(this.fileNodes.keys()).slice(0, 5)
            });
        }
    }

    // Complexity: O(N*M) — nested iteration detected
    private async extractNamingPrinciples(): Promise<void> {
        const namingPatterns = {
            camelCase: 0,
            PascalCase: 0,
            kebabCase: 0,
            snakeCase: 0
        };

        for (const node of this.fileNodes.values()) {
            for (const fn of node.functions) {
                if (/^[a-z][a-zA-Z0-9]*$/.test(fn)) namingPatterns.camelCase++;
            }
            for (const cls of node.classes) {
                if (/^[A-Z][a-zA-Z0-9]*$/.test(cls)) namingPatterns.PascalCase++;
            }
        }

        const dominant = Object.entries(namingPatterns)
            .sort(([,a], [,b]) => b - a)[0];

        if (dominant[1] > 10) {
            this.principles.push({
                id: 'NAME_001',
                name: `${dominant[0]} Naming Convention`,
                category: 'naming',
                description: `Primary naming convention is ${dominant[0]} with ${dominant[1]} occurrences`,
                evidence: [{
                    file: 'project-wide',
                    line: 0,
                    snippet: `${dominant[1]} identifiers follow ${dominant[0]}`,
                    type: 'strong'
                }],
                confidence: Math.min(dominant[1] / 50, 1.0),
                appliesTo: ['**/*.ts'],
                learnedFrom: []
            });
        }
    }

    // Complexity: O(N*M) — nested iteration detected
    private async extractPatternPrinciples(): Promise<void> {
        const patterns = {
            singleton: 0,
            factory: 0,
            observer: 0,
            decorator: 0
        };

        for (const node of this.fileNodes.values()) {
            if (node.classes.some(c => /Factory$/.test(c))) patterns.factory++;
            if (node.classes.some(c => /Observer|Listener|Handler$/.test(c))) patterns.observer++;
            if (node.functions.some(f => /create[A-Z]/.test(f))) patterns.factory++;
        }

        for (const [pattern, count] of Object.entries(patterns)) {
            if (count >= 3) {
                this.principles.push({
                    id: `PATTERN_${pattern.toUpperCase()}`,
                    name: `${pattern.charAt(0).toUpperCase() + pattern.slice(1)} Pattern`,
                    category: 'patterns',
                    description: `${pattern} pattern detected in ${count} locations`,
                    evidence: [{
                        file: 'multiple',
                        line: 0,
                        snippet: `${count} implementations found`,
                        type: count > 5 ? 'strong' : 'moderate'
                    }],
                    confidence: Math.min(count / 10, 1.0),
                    appliesTo: ['**/*.ts'],
                    learnedFrom: []
                });
            }
        }
    }

    // Complexity: O(N*M) — nested iteration detected
    private async extractErrorHandlingPrinciples(): Promise<void> {
        let tryCatchCount = 0;
        let customErrorCount = 0;

        for (const [filePath, node] of this.fileNodes) {
            try {
                const content = fs.readFileSync(filePath, 'utf-8');
                tryCatchCount += (content.match(/try\s*\{/g) || []).length;
                customErrorCount += (content.match(/extends\s+Error/g) || []).length;
            } catch (e) { console.error("[SOUL] Void Exception Handled:", e); }
        }

        if (tryCatchCount > 10) {
            this.principles.push({
                id: 'ERROR_001',
                name: 'Structured Error Handling',
                category: 'error-handling',
                description: `${tryCatchCount} try-catch blocks, ${customErrorCount} custom error classes`,
                evidence: [{
                    file: 'project-wide',
                    line: 0,
                    snippet: `Consistent error handling pattern`,
                    type: 'strong'
                }],
                confidence: 0.85,
                appliesTo: ['**/*.ts'],
                learnedFrom: []
            });
        }
    }

    // Complexity: O(N) — linear iteration
    private async extractAsyncPrinciples(): Promise<void> {
        let asyncAwaitCount = 0;
        let promiseCount = 0;

        for (const [filePath] of this.fileNodes) {
            try {
                const content = fs.readFileSync(filePath, 'utf-8');
                asyncAwaitCount += (content.match(/async\s+/g) || []).length;
                promiseCount += (content.match(/Promise\./g) || []).length;
            } catch (e) { console.error("[SOUL] Void Exception Handled:", e); }
        }

        if (asyncAwaitCount > 20) {
            this.principles.push({
                id: 'ASYNC_001',
                name: 'Async/Await Pattern',
                category: 'async',
                description: `Project uses modern async/await (${asyncAwaitCount} async functions)`,
                evidence: [{
                    file: 'project-wide',
                    line: 0,
                    snippet: `${asyncAwaitCount} async, ${promiseCount} Promise usages`,
                    type: 'strong'
                }],
                confidence: 0.95,
                appliesTo: ['**/*.ts'],
                learnedFrom: []
            });
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // COMPILATION & SAVING
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Компилира цялото знание в JSON
     */
    // Complexity: O(N*M) — nested iteration detected
    private compileKnowledge(
        startTime: number,
        filesProcessed: number,
        linesAnalyzed: number,
        cycles: string[][],
        violations: LayerViolation[]
    ): DistilledKnowledge {
        // Статистики
        const layerDistribution: Record<string, number> = {};
        let totalClasses = 0;
        let totalFunctions = 0;
        let totalComplexity = 0;

        for (const node of this.fileNodes.values()) {
            layerDistribution[node.layer] = (layerDistribution[node.layer] || 0) + 1;
            totalClasses += node.classes.length;
            totalFunctions += node.functions.length;
            totalComplexity += node.complexity;
        }

        const patternUsage: Record<string, number> = {};
        for (const p of this.principles.filter(p => p.category === 'patterns')) {
            patternUsage[p.name] = p.evidence[0]?.snippet.match(/\d+/)?.[0] 
                ? parseInt(p.evidence[0].snippet.match(/\d+/)![0]) 
                : 1;
        }

        return {
            version: '1.0.0',
            timestamp: new Date().toISOString(),
            projectName: path.basename(this.config.rootDir),
            principles: this.principles,
            importGraph: {
                nodeCount: this.fileNodes.size,
                edgeCount: this.importEdges.length,
                cycles,
                layerViolations: violations
            },
            statistics: {
                totalFiles: this.fileNodes.size,
                totalLines: linesAnalyzed,
                totalClasses,
                totalFunctions,
                avgComplexity: this.fileNodes.size > 0 ? totalComplexity / this.fileNodes.size : 0,
                layerDistribution,
                patternUsage
            },
            metadata: {
                distillationTime: Date.now() - startTime,
                filesProcessed,
                linesAnalyzed
            }
        };
    }

    /**
     * Запазва знанието във файл
     */
    // Complexity: O(1)
    private async saveKnowledge(knowledge: DistilledKnowledge): Promise<void> {
        const outputDir = path.dirname(this.config.outputPath);
        
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        fs.writeFileSync(
            this.config.outputPath,
            JSON.stringify(knowledge, null, 2),
            'utf-8'
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // UTILITIES
    // ─────────────────────────────────────────────────────────────────────────

    // Complexity: O(1) — hash/map lookup
    private log(message: string): void {
        if (this.config.verbose) {
            console.log(`[Distiller] ${message}`);
        }
    }

    /** Получаване на дестилирано знание */
    // Complexity: O(1) — hash/map lookup
    getKnowledge(): DistilledKnowledge | null {
        try {
            if (fs.existsSync(this.config.outputPath)) {
                return JSON.parse(fs.readFileSync(this.config.outputPath, 'utf-8'));
            }
        } catch (e) { console.error("[SOUL] Void Exception Handled:", e); }
        return null;
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// NEURAL BACKPACK INTEGRATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Neural Backpack - автоматично зареждане на знание при стартиране
 */
export class NeuralBackpack {
    private knowledge: DistilledKnowledge | null = null;
    private loaded: boolean = false;
    private knowledgePath: string;

    constructor(knowledgePath: string = './data/distilled-knowledge.json') {
        this.knowledgePath = knowledgePath;
    }

    /**
     * Зарежда знанието в паметта
     */
    // Complexity: O(1) — hash/map lookup
    async load(): Promise<boolean> {
        try {
            if (fs.existsSync(this.knowledgePath)) {
                const content = fs.readFileSync(this.knowledgePath, 'utf-8');
                this.knowledge = JSON.parse(content);
                this.loaded = true;
                console.log(`[NeuralBackpack] ✅ Loaded ${this.knowledge?.principles.length || 0} principles`);
                return true;
            }
        } catch (e) {
            console.error('[NeuralBackpack] ❌ Failed to load knowledge:', e);
        }
        return false;
    }

    /**
     * Проверява дали знанието е заредено
     */
    // Complexity: O(1)
    isLoaded(): boolean {
        return this.loaded && this.knowledge !== null;
    }

    /**
     * Получава принцип по категория
     */
    // Complexity: O(N) — linear iteration
    getPrinciples(category?: PrincipleCategory): ArchitecturalPrinciple[] {
        if (!this.knowledge) return [];
        
        if (category) {
            return this.knowledge.principles.filter(p => p.category === category);
        }
        return this.knowledge.principles;
    }

    /**
     * Получава цикли
     */
    // Complexity: O(1)
    getCycles(): string[][] {
        return this.knowledge?.importGraph.cycles || [];
    }

    /**
     * Получава layer violations
     */
    // Complexity: O(1)
    getViolations(): LayerViolation[] {
        return this.knowledge?.importGraph.layerViolations || [];
    }

    /**
     * Проверява дали файл нарушава принцип
     */
    // Complexity: O(N) — linear iteration
    checkFile(filePath: string): { violations: string[]; suggestions: string[] } {
        const violations: string[] = [];
        const suggestions: string[] = [];

        if (!this.knowledge) {
            return { violations, suggestions };
        }

        const relativePath = path.relative(process.cwd(), filePath);

        // Проверка за layer violations
        for (const v of this.knowledge.importGraph.layerViolations) {
            if (v.from.file === relativePath) {
                violations.push(`Layer violation: ${v.from.layer} → ${v.to.layer}`);
                suggestions.push(`Move import from ${v.to.file} to a lower layer or refactor`);
            }
        }

        return { violations, suggestions };
    }

    /**
     * Получава статистики
     */
    // Complexity: O(1)
    getStats(): KnowledgeStats | null {
        return this.knowledge?.statistics || null;
    }

    /**
     * Препоръчва на база знание
     */
    // Complexity: O(N) — linear iteration
    recommend(context: string): string[] {
        const recommendations: string[] = [];
        
        if (!this.knowledge) return recommendations;

        // Препоръки базирани на принципи
        for (const principle of this.knowledge.principles) {
            if (principle.confidence > 0.8) {
                if (principle.category === 'naming') {
                    recommendations.push(`Follow ${principle.name} convention`);
                }
                if (principle.category === 'patterns' && context.includes('create')) {
                    recommendations.push(`Consider using ${principle.name}`);
                }
            }
        }

        return recommendations;
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export const createDistiller = (config?: Partial<DistillerConfig>): KnowledgeDistiller => {
    return new KnowledgeDistiller(config);
};

export const createBackpack = (path?: string): NeuralBackpack => {
    return new NeuralBackpack(path);
};

export default KnowledgeDistiller;
