"use strict";
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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBackpack = exports.createDistiller = exports.NeuralBackpack = exports.KnowledgeDistiller = exports.QANTUM_LAYERS = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// ═══════════════════════════════════════════════════════════════════════════════
// DEFAULT LAYER ARCHITECTURE (5-Layer QAntum)
// ═══════════════════════════════════════════════════════════════════════════════
exports.QANTUM_LAYERS = [
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
class KnowledgeDistiller {
    config;
    fileNodes = new Map();
    importEdges = [];
    principles = [];
    constructor(config = {}) {
        this.config = {
            rootDir: process.cwd(),
            outputPath: './data/distilled-knowledge.json',
            includePatterns: ['**/*.ts', '**/*.js'],
            excludePatterns: ['**/node_modules/**', '**/dist/**', '**/*.test.*', '**/*.spec.*'],
            layers: exports.QANTUM_LAYERS,
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
    async distill() {
        const startTime = Date.now();
        this.log('\n' + '═'.repeat(70));
        this.log('🧪 KNOWLEDGE DISTILLATION STARTED');
        this.log('═'.repeat(70) + '\n');
        // Стъпка 1: Сканиране на файлове
        this.log('📁 Phase 1: Scanning source files...');
        const files = await this.scanFiles();
        this.log(`   Found ${files.length} files`);
        // Стъпка 2: Парсване и анализ
        this.log('\n🔍 Phase 2: Parsing and analyzing...');
        let totalLines = 0;
        for (const file of files) {
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
        await this.extractPrinciples();
        this.log(`   ${this.principles.length} principles identified`);
        // Стъпка 7: Компресиране и запис
        this.log('\n💾 Phase 7: Compressing and saving...');
        const knowledge = this.compileKnowledge(startTime, files.length, totalLines, cycles, violations);
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
    async scanFiles() {
        const files = [];
        const walkDir = (dir) => {
            try {
                const entries = fs.readdirSync(dir, { withFileTypes: true });
                for (const entry of entries) {
                    const fullPath = path.join(dir, entry.name);
                    const relativePath = path.relative(this.config.rootDir, fullPath);
                    // Проверка за exclude
                    if (this.shouldExclude(relativePath))
                        continue;
                    if (entry.isDirectory()) {
                        walkDir(fullPath);
                    }
                    else if (entry.isFile() && this.shouldInclude(entry.name)) {
                        files.push(fullPath);
                    }
                }
            }
            catch (e) {
                // Skip inaccessible directories
            }
        };
        walkDir(this.config.rootDir);
        return files;
    }
    shouldInclude(filename) {
        return filename.endsWith('.ts') || filename.endsWith('.js');
    }
    shouldExclude(relativePath) {
        const excludes = ['node_modules', 'dist', '.git', 'coverage', '.vscode'];
        return excludes.some(ex => relativePath.includes(ex));
    }
    // ─────────────────────────────────────────────────────────────────────────
    // PARSING
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Парсва файл и извлича метаданни
     */
    async parseFile(filePath) {
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
        }
        catch (e) {
            return null;
        }
    }
    /** Извлича import statements */
    extractImports(content) {
        const imports = [];
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
    extractExports(content) {
        const exports = [];
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
    extractClasses(content) {
        const classes = [];
        const regex = /class\s+(\w+)/g;
        let match;
        while ((match = regex.exec(content)) !== null) {
            classes.push(match[1]);
        }
        return classes;
    }
    /** Извлича функции */
    extractFunctions(content) {
        const functions = [];
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
    determineLayer(filePath) {
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
    matchPattern(path, pattern) {
        const regexPattern = pattern
            .replace(/\*\*/g, '.*')
            .replace(/\*/g, '[^/]*');
        return new RegExp(regexPattern).test(path);
    }
    /** Изчислява cyclomatic complexity (опростено) */
    calculateComplexity(content) {
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
    buildImportGraph() {
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
    resolveImport(fromFile, importPath) {
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
    detectCycles() {
        const cycles = [];
        const visited = new Set();
        const recursionStack = new Set();
        const path = [];
        const dfs = (node) => {
            visited.add(node);
            recursionStack.add(node);
            path.push(node);
            const edges = this.importEdges.filter(e => e.from === node);
            for (const edge of edges) {
                if (!visited.has(edge.to)) {
                    dfs(edge.to);
                }
                else if (recursionStack.has(edge.to)) {
                    // Намерен е цикъл
                    const cycleStart = path.indexOf(edge.to);
                    if (cycleStart !== -1) {
                        const cycle = path.slice(cycleStart).map(p => path.relative(this.config.rootDir, p));
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
    detectLayerViolations() {
        const violations = [];
        const layerMap = new Map(this.config.layers.map(l => [l.name, l]));
        for (const edge of this.importEdges) {
            const fromNode = this.fileNodes.get(edge.from);
            const toNode = this.fileNodes.get(edge.to);
            if (!fromNode || !toNode)
                continue;
            const fromLayer = layerMap.get(fromNode.layer);
            const toLayer = layerMap.get(toNode.layer);
            if (!fromLayer || !toLayer)
                continue;
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
    async extractPrinciples() {
        // Принцип 1: Слоева изолация
        await this.extractLayeringPrinciples();
        // Принцип 2: Naming conventions
        await this.extractNamingPrinciples();
        // Принцип 3: Design patterns
        await this.extractPatternPrinciples();
        // Принцип 4: Error handling
        await this.extractErrorHandlingPrinciples();
        // Принцип 5: Async patterns
        await this.extractAsyncPrinciples();
    }
    async extractLayeringPrinciples() {
        const layerCounts = new Map();
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
                    type: 'strong'
                })),
                confidence: 0.9,
                appliesTo: ['**/*.ts'],
                learnedFrom: Array.from(this.fileNodes.keys()).slice(0, 5)
            });
        }
    }
    async extractNamingPrinciples() {
        const namingPatterns = {
            camelCase: 0,
            PascalCase: 0,
            kebabCase: 0,
            snakeCase: 0
        };
        for (const node of this.fileNodes.values()) {
            for (const fn of node.functions) {
                if (/^[a-z][a-zA-Z0-9]*$/.test(fn))
                    namingPatterns.camelCase++;
            }
            for (const cls of node.classes) {
                if (/^[A-Z][a-zA-Z0-9]*$/.test(cls))
                    namingPatterns.PascalCase++;
            }
        }
        const dominant = Object.entries(namingPatterns)
            .sort(([, a], [, b]) => b - a)[0];
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
    async extractPatternPrinciples() {
        const patterns = {
            singleton: 0,
            factory: 0,
            observer: 0,
            decorator: 0
        };
        for (const node of this.fileNodes.values()) {
            if (node.classes.some(c => /Factory$/.test(c)))
                patterns.factory++;
            if (node.classes.some(c => /Observer|Listener|Handler$/.test(c)))
                patterns.observer++;
            if (node.functions.some(f => /create[A-Z]/.test(f)))
                patterns.factory++;
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
    async extractErrorHandlingPrinciples() {
        let tryCatchCount = 0;
        let customErrorCount = 0;
        for (const [filePath, node] of this.fileNodes) {
            try {
                const content = fs.readFileSync(filePath, 'utf-8');
                tryCatchCount += (content.match(/try\s*\{/g) || []).length;
                customErrorCount += (content.match(/extends\s+Error/g) || []).length;
            }
            catch (e) { }
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
    async extractAsyncPrinciples() {
        let asyncAwaitCount = 0;
        let promiseCount = 0;
        for (const [filePath] of this.fileNodes) {
            try {
                const content = fs.readFileSync(filePath, 'utf-8');
                asyncAwaitCount += (content.match(/async\s+/g) || []).length;
                promiseCount += (content.match(/Promise\./g) || []).length;
            }
            catch (e) { }
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
    compileKnowledge(startTime, filesProcessed, linesAnalyzed, cycles, violations) {
        // Статистики
        const layerDistribution = {};
        let totalClasses = 0;
        let totalFunctions = 0;
        let totalComplexity = 0;
        for (const node of this.fileNodes.values()) {
            layerDistribution[node.layer] = (layerDistribution[node.layer] || 0) + 1;
            totalClasses += node.classes.length;
            totalFunctions += node.functions.length;
            totalComplexity += node.complexity;
        }
        const patternUsage = {};
        for (const p of this.principles.filter(p => p.category === 'patterns')) {
            patternUsage[p.name] = p.evidence[0]?.snippet.match(/\d+/)?.[0]
                ? parseInt(p.evidence[0].snippet.match(/\d+/)[0])
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
    async saveKnowledge(knowledge) {
        const outputDir = path.dirname(this.config.outputPath);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        fs.writeFileSync(this.config.outputPath, JSON.stringify(knowledge, null, 2), 'utf-8');
    }
    // ─────────────────────────────────────────────────────────────────────────
    // UTILITIES
    // ─────────────────────────────────────────────────────────────────────────
    log(message) {
        if (this.config.verbose) {
            console.log(`[Distiller] ${message}`);
        }
    }
    /** Получаване на дестилирано знание */
    getKnowledge() {
        try {
            if (fs.existsSync(this.config.outputPath)) {
                return JSON.parse(fs.readFileSync(this.config.outputPath, 'utf-8'));
            }
        }
        catch (e) { }
        return null;
    }
}
exports.KnowledgeDistiller = KnowledgeDistiller;
// ═══════════════════════════════════════════════════════════════════════════════
// NEURAL BACKPACK INTEGRATION
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * Neural Backpack - автоматично зареждане на знание при стартиране
 */
class NeuralBackpack {
    knowledge = null;
    loaded = false;
    knowledgePath;
    constructor(knowledgePath = './data/distilled-knowledge.json') {
        this.knowledgePath = knowledgePath;
    }
    /**
     * Зарежда знанието в паметта
     */
    async load() {
        try {
            if (fs.existsSync(this.knowledgePath)) {
                const content = fs.readFileSync(this.knowledgePath, 'utf-8');
                this.knowledge = JSON.parse(content);
                this.loaded = true;
                console.log(`[NeuralBackpack] ✅ Loaded ${this.knowledge?.principles.length || 0} principles`);
                return true;
            }
        }
        catch (e) {
            console.error('[NeuralBackpack] ❌ Failed to load knowledge:', e);
        }
        return false;
    }
    /**
     * Проверява дали знанието е заредено
     */
    isLoaded() {
        return this.loaded && this.knowledge !== null;
    }
    /**
     * Получава принцип по категория
     */
    getPrinciples(category) {
        if (!this.knowledge)
            return [];
        if (category) {
            return this.knowledge.principles.filter(p => p.category === category);
        }
        return this.knowledge.principles;
    }
    /**
     * Получава цикли
     */
    getCycles() {
        return this.knowledge?.importGraph.cycles || [];
    }
    /**
     * Получава layer violations
     */
    getViolations() {
        return this.knowledge?.importGraph.layerViolations || [];
    }
    /**
     * Проверява дали файл нарушава принцип
     */
    checkFile(filePath) {
        const violations = [];
        const suggestions = [];
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
    getStats() {
        return this.knowledge?.statistics || null;
    }
    /**
     * Препоръчва на база знание
     */
    recommend(context) {
        const recommendations = [];
        if (!this.knowledge)
            return recommendations;
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
exports.NeuralBackpack = NeuralBackpack;
// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════
const createDistiller = (config) => {
    return new KnowledgeDistiller(config);
};
exports.createDistiller = createDistiller;
const createBackpack = (path) => {
    return new NeuralBackpack(path);
};
exports.createBackpack = createBackpack;
exports.default = KnowledgeDistiller;
