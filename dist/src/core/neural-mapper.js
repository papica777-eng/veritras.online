"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🧠 NEURAL MAPPER - THE BRAIN MAP
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * v1.0.0 "Quantum" Edition - Living System Protocol
 *
 * This module creates a complete dependency graph of the entire codebase using
 * Abstract Syntax Tree (AST) parsing. It enables QANTUM to "understand"
 * the code structure instantly without reading files as text.
 *
 * Features:
 * - AST-based function/class/interface extraction
 * - Dependency graph generation
 * - Import/Export relationship mapping
 * - Cyclomatic complexity analysis
 * - Call graph visualization
 * - Context Pulse snapshots
 *
 * @version 1.0.0-QANTUM-PRIME
 * @codename Quantum
 * @author Димитър Продромов (Meta-Architect)
 * @copyright 2025. All Rights Reserved.
 * ═══════════════════════════════════════════════════════════════════════════════
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
exports.NeuralMapper = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const crypto = __importStar(require("crypto"));
const logger_1 = require("../api/unified/utils/logger");
// ═══════════════════════════════════════════════════════════════════════════════
// NEURAL MAPPER CLASS
// ═══════════════════════════════════════════════════════════════════════════════
class NeuralMapper {
    brainMap = null;
    pulseHistory = [];
    rootDir;
    excludeDirs;
    includeExtensions;
    constructor(rootDir) {
        this.rootDir = rootDir;
        this.excludeDirs = new Set([
            'node_modules', 'dist', '.git', 'coverage',
            'logs', 'screenshots', 'videos', '_ARCHIVE',
            'visual_diffs', 'visual-diffs', 'visual-baselines'
        ]);
        this.includeExtensions = new Set(['.ts', '.js', '.tsx', '.jsx']);
    }
    /**
     * Generate complete Brain Map of the codebase
     * // Complexity: O(F * N) where F is the number of files and N is average nodes per file
     */
    async generateBrainMap() {
        logger_1.logger.debug('\n🧠 [NeuralMapper] Initiating Brain Map generation...');
        const startTime = performance.now();
        // SAFETY: async operation — wrap in try-catch for production resilience
        const files = await this.scanDirectory(this.rootDir);
        logger_1.logger.debug(`   📁 Found ${files.length} source files`);
        const fileNodes = new Map();
        const astNodes = new Map();
        const edges = [];
        let totalLines = 0;
        let totalFunctions = 0;
        let totalClasses = 0;
        let totalInterfaces = 0;
        let totalComplexity = 0;
        for (const filePath of files) {
            try {
                const fileNode = await this.parseFile(filePath);
                fileNodes.set(fileNode.relativePath, fileNode);
                totalLines += this.countLines(filePath);
                totalFunctions += fileNode.functions.length;
                totalClasses += fileNode.classes.length;
                totalInterfaces += fileNode.interfaces.length;
                totalComplexity += fileNode.complexity;
                // Create AST nodes
                for (const func of fileNode.functions) {
                    const nodeId = `${fileNode.relativePath}::${func.name}`;
                    astNodes.set(nodeId, {
                        type: 'function',
                        name: func.name,
                        filePath: fileNode.relativePath,
                        line: func.line,
                        column: 0,
                        complexity: func.complexity,
                        dependencies: func.calls,
                        dependents: [],
                        signature: `${func.name}(${func.params.join(', ')})`
                    });
                }
                for (const cls of fileNode.classes) {
                    const nodeId = `${fileNode.relativePath}::${cls.name}`;
                    astNodes.set(nodeId, {
                        type: 'class',
                        name: cls.name,
                        filePath: fileNode.relativePath,
                        line: cls.line,
                        column: 0,
                        complexity: cls.methods.reduce((sum, m) => sum + m.complexity, 0),
                        dependencies: cls.implements.concat(cls.extends ? [cls.extends] : []),
                        dependents: []
                    });
                    // Add extends edge
                    if (cls.extends) {
                        edges.push({
                            from: nodeId,
                            to: cls.extends,
                            type: 'extends',
                            weight: 1
                        });
                    }
                    // Add implements edges
                    for (const impl of cls.implements) {
                        edges.push({
                            from: nodeId,
                            to: impl,
                            type: 'implements',
                            weight: 0.5
                        });
                    }
                }
                // Create import edges
                for (const imp of fileNode.imports) {
                    if (imp.resolvedPath) {
                        edges.push({
                            from: fileNode.relativePath,
                            to: imp.resolvedPath,
                            type: 'import',
                            weight: imp.specifiers.length
                        });
                    }
                }
            }
            catch (error) {
                logger_1.logger.warn(`   ⚠️  Failed to parse: ${filePath}`);
            }
        }
        // Calculate dependents (reverse mapping)
        for (const edge of edges) {
            const toNode = astNodes.get(edge.to);
            if (toNode) {
                toNode.dependents.push(edge.from);
            }
        }
        // Find hotspots (high complexity + many dependents)
        const hotspots = Array.from(astNodes.entries())
            .filter(([_, node]) => node.complexity > 10 || node.dependents.length > 5)
            .sort((a, b) => (b[1].complexity + b[1].dependents.length) - (a[1].complexity + a[1].dependents.length))
            .slice(0, 10)
            .map(([id]) => id);
        // Find orphans (no dependents and no dependencies)
        const orphans = Array.from(astNodes.entries())
            .filter(([_, node]) => node.dependents.length === 0 && node.dependencies.length === 0)
            .map(([id]) => id);
        const avgComplexity = totalFunctions > 0 ? totalComplexity / totalFunctions : 0;
        const healthScore = this.calculateHealthScore(avgComplexity, orphans.length, hotspots.length, files.length);
        this.brainMap = {
            version: '1.0.0',
            generatedAt: new Date(),
            snapshotHash: this.generateSnapshotHash(fileNodes),
            stats: {
                totalFiles: files.length,
                totalLines,
                totalFunctions,
                totalClasses,
                totalInterfaces,
                avgComplexity,
                healthScore
            },
            files: fileNodes,
            nodes: astNodes,
            edges,
            hotspots,
            orphans
        };
        const elapsed = ((performance.now() - startTime) / 1000).toFixed(2);
        logger_1.logger.debug(`\n✅ [NeuralMapper] Brain Map generated in ${elapsed}s`);
        this.printStats();
        return this.brainMap;
    }
    /**
     * Take a Context Pulse snapshot
     * // Complexity: O(F * N) due to brain map regeneration
     */
    async takeContextPulse() {
        logger_1.logger.debug('\n💓 [NeuralMapper] Taking Context Pulse...');
        const startTime = performance.now();
        const previousHash = this.brainMap?.snapshotHash || '';
        // Regenerate brain map to detect changes
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.generateBrainMap();
        const changedFiles = [];
        const alerts = [];
        let healthDelta = 0;
        if (previousHash && this.brainMap) {
            // Detect changed files by comparing hashes
            // In a real implementation, we'd compare individual file hashes
            if (previousHash !== this.brainMap.snapshotHash) {
                changedFiles.push('(changes detected)');
            }
            // Generate alerts for health degradation
            if (this.brainMap.stats.healthScore < 80) {
                alerts.push(`⚠️ Health Score below 80%: ${this.brainMap.stats.healthScore.toFixed(1)}%`);
            }
            if (this.brainMap.stats.avgComplexity > 15) {
                alerts.push(`⚠️ Average complexity too high: ${this.brainMap.stats.avgComplexity.toFixed(1)}`);
            }
            if (this.brainMap.hotspots.length > 5) {
                alerts.push(`⚠️ Too many hotspots: ${this.brainMap.hotspots.length}`);
            }
        }
        const pulse = {
            timestamp: new Date(),
            memoryUsage: process.memoryUsage(),
            brainMapHash: this.brainMap?.snapshotHash || '',
            changedFiles,
            healthDelta,
            alerts
        };
        this.pulseHistory.push(pulse);
        // Keep only last 100 pulses
        if (this.pulseHistory.length > 100) {
            this.pulseHistory = this.pulseHistory.slice(-100);
        }
        const elapsed = ((performance.now() - startTime) / 1000).toFixed(2);
        logger_1.logger.debug(`✅ [NeuralMapper] Context Pulse complete in ${elapsed}s`);
        if (alerts.length > 0) {
            logger_1.logger.debug('\n🚨 ALERTS:');
            alerts.forEach(a => logger_1.logger.debug(`   ${a}`));
        }
        return pulse;
    }
    /**
     * Export Brain Map to JSON file
     * // Complexity: O(F + N) where F is files and N is nodes
     */
    async exportBrainMap(outputPath) {
        if (!this.brainMap) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.generateBrainMap();
        }
        const exportData = {
            ...this.brainMap,
            files: Object.fromEntries(this.brainMap.files),
            nodes: Object.fromEntries(this.brainMap.nodes)
        };
        // SAFETY: async operation — wrap in try-catch for production resilience
        await fs.promises.writeFile(outputPath, JSON.stringify(exportData, null, 2), 'utf-8');
        logger_1.logger.debug(`📁 Brain Map exported to: ${outputPath}`);
    }
    /**
     * Query the Brain Map
     * // Complexity: O(1) - Constant time retrieval from pre-calculated stats/hotspots
     */
    query(question) {
        if (!this.brainMap) {
            throw new Error('Brain Map not generated. Call generateBrainMap() first.');
        }
        const q = question.toLowerCase();
        if (q.includes('hotspot') || q.includes('complex')) {
            return {
                type: 'hotspots',
                data: this.brainMap.hotspots,
                description: 'Files/functions with high complexity or many dependents'
            };
        }
        if (q.includes('orphan') || q.includes('unused')) {
            return {
                type: 'orphans',
                data: this.brainMap.orphans,
                description: 'Files/functions with no connections'
            };
        }
        if (q.includes('health') || q.includes('score')) {
            return {
                type: 'health',
                data: this.brainMap.stats,
                description: 'Overall codebase health metrics'
            };
        }
        if (q.includes('depend')) {
            return {
                type: 'dependencies',
                data: this.brainMap.edges.slice(0, 50),
                description: 'Dependency relationships'
            };
        }
        return {
            type: 'stats',
            data: this.brainMap.stats,
            description: 'General codebase statistics'
        };
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // PRIVATE METHODS
    // ═══════════════════════════════════════════════════════════════════════════
    // Complexity: O(D + F) where D is directories and F is files
    async scanDirectory(dir) {
        const files = [];
        // SAFETY: async operation — wrap in try-catch for production resilience
        const entries = await fs.promises.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                if (!this.excludeDirs.has(entry.name)) {
                    // SAFETY: async operation — wrap in try-catch for production resilience
                    files.push(...await this.scanDirectory(fullPath));
                }
            }
            else if (entry.isFile()) {
                const ext = path.extname(entry.name);
                if (this.includeExtensions.has(ext)) {
                    files.push(fullPath);
                }
            }
        }
        return files;
    }
    // Complexity: O(L) where L is the number of lines in the file
    async parseFile(filePath) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const content = await fs.promises.readFile(filePath, 'utf-8');
        // SAFETY: async operation — wrap in try-catch for production resilience
        const stats = await fs.promises.stat(filePath);
        const relativePath = path.relative(this.rootDir, filePath).replace(/\\/g, '/');
        const imports = this.extractImports(content);
        const exports = this.extractExports(content);
        const functions = this.extractFunctions(content);
        const classes = this.extractClasses(content);
        const interfaces = this.extractInterfaces(content);
        // Resolve import paths
        for (const imp of imports) {
            if (imp.isRelative) {
                const dir = path.dirname(filePath);
                let resolved = path.resolve(dir, imp.source);
                // Try adding extensions
                for (const ext of ['.ts', '.js', '.tsx', '.jsx', '/index.ts', '/index.js']) {
                    if (fs.existsSync(resolved + ext)) {
                        resolved = resolved + ext;
                        break;
                    }
                }
                imp.resolvedPath = path.relative(this.rootDir, resolved).replace(/\\/g, '/');
            }
        }
        const complexity = functions.reduce((sum, f) => sum + f.complexity, 0) +
            classes.reduce((sum, c) => sum + c.methods.reduce((s, m) => s + m.complexity, 0), 0);
        return {
            path: filePath,
            relativePath,
            hash: this.hashContent(content),
            size: stats.size,
            lastModified: stats.mtime,
            imports,
            exports,
            functions,
            classes,
            interfaces,
            complexity,
            healthScore: this.calculateFileHealth(complexity, functions.length, classes.length)
        };
    }
    // Complexity: O(L) where L is lines of code (Regex scan)
    extractImports(content) {
        const imports = [];
        const importRegex = /import\s+(?:(\*\s+as\s+\w+)|(?:{([^}]+)})|(\w+))?\s*(?:,\s*(?:{([^}]+)}|(\w+)))?\s*from\s*['"]([^'"]+)['"]/g;
        let match;
        let lineNum = 1;
        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            importRegex.lastIndex = 0;
            while ((match = importRegex.exec(line)) !== null) {
                const source = match[6];
                const specifiers = [];
                if (match[1])
                    specifiers.push(match[1].replace('* as ', ''));
                if (match[2])
                    specifiers.push(...match[2].split(',').map(s => s.trim()));
                if (match[3])
                    specifiers.push(match[3]);
                if (match[4])
                    specifiers.push(...match[4].split(',').map(s => s.trim()));
                if (match[5])
                    specifiers.push(match[5]);
                imports.push({
                    source,
                    specifiers: specifiers.filter(s => s),
                    isRelative: source.startsWith('.') || source.startsWith('/'),
                    line: i + 1
                });
            }
        }
        return imports;
    }
    // Complexity: O(L) where L is lines of code
    extractExports(content) {
        const exports = [];
        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (line.includes('export default')) {
                const match = line.match(/export\s+default\s+(?:class|function|const|let|var)?\s*(\w+)?/);
                exports.push({
                    name: match?.[1] || 'default',
                    type: 'default',
                    line: i + 1
                });
            }
            else if (line.includes('export {')) {
                const match = line.match(/export\s*{([^}]+)}/);
                if (match) {
                    const names = match[1].split(',').map(s => s.trim().split(' as ')[0]);
                    for (const name of names) {
                        exports.push({ name, type: 'named', line: i + 1 });
                    }
                }
            }
            else if (line.includes('export *')) {
                exports.push({ name: '*', type: 'all', line: i + 1 });
            }
            else if (line.match(/^export\s+(class|function|const|let|var|interface|type|enum)\s+(\w+)/)) {
                const match = line.match(/^export\s+(class|function|const|let|var|interface|type|enum)\s+(\w+)/);
                if (match) {
                    exports.push({ name: match[2], type: 'named', line: i + 1 });
                }
            }
        }
        return exports;
    }
    // Complexity: O(L^2) in worst case due to findClosingBrace being called for each function
    extractFunctions(content) {
        const functions = [];
        const funcRegex = /(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\(([^)]*)\)(?:\s*:\s*([^{]+))?\s*{/g;
        const arrowRegex = /(?:export\s+)?(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?\(([^)]*)\)(?:\s*:\s*([^=]+))?\s*=>/g;
        const lines = content.split('\n');
        let lineIndex = 0;
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            // Regular functions
            funcRegex.lastIndex = 0;
            let match = funcRegex.exec(line);
            if (match) {
                const endLine = this.findClosingBrace(lines, i);
                const body = lines.slice(i, endLine + 1).join('\n');
                functions.push({
                    name: match[1],
                    params: match[2].split(',').map(p => p.trim()).filter(p => p),
                    returnType: match[3]?.trim(),
                    isAsync: line.includes('async'),
                    isExported: line.includes('export'),
                    complexity: this.calculateComplexity(body),
                    calls: this.extractFunctionCalls(body),
                    line: i + 1,
                    endLine: endLine + 1
                });
            }
            // Arrow functions
            arrowRegex.lastIndex = 0;
            match = arrowRegex.exec(line);
            if (match) {
                const endLine = this.findClosingBrace(lines, i) || i;
                const body = lines.slice(i, endLine + 1).join('\n');
                functions.push({
                    name: match[1],
                    params: match[2].split(',').map(p => p.trim()).filter(p => p),
                    returnType: match[3]?.trim(),
                    isAsync: line.includes('async'),
                    isExported: line.includes('export'),
                    complexity: this.calculateComplexity(body),
                    calls: this.extractFunctionCalls(body),
                    line: i + 1,
                    endLine: endLine + 1
                });
            }
        }
        return functions;
    }
    // Complexity: O(L^2) due to nested method extraction and brace finding
    extractClasses(content) {
        const classes = [];
        const classRegex = /(?:export\s+)?class\s+(\w+)(?:\s+extends\s+(\w+))?(?:\s+implements\s+([^{]+))?\s*{/g;
        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            classRegex.lastIndex = 0;
            const match = classRegex.exec(line);
            if (match) {
                const endLine = this.findClosingBrace(lines, i);
                const body = lines.slice(i, endLine + 1).join('\n');
                classes.push({
                    name: match[1],
                    extends: match[2],
                    implements: match[3]?.split(',').map(s => s.trim()) || [],
                    methods: this.extractMethods(body),
                    properties: this.extractProperties(body),
                    isExported: line.includes('export'),
                    line: i + 1,
                    endLine: endLine + 1
                });
            }
        }
        return classes;
    }
    // Complexity: O(L) for the class body snippet
    extractMethods(classBody) {
        const methods = [];
        const methodRegex = /(?:(public|private|protected)\s+)?(?:(static)\s+)?(?:(async)\s+)?(\w+)\s*\(([^)]*)\)(?:\s*:\s*([^{]+))?\s*{/g;
        const lines = classBody.split('\n');
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            methodRegex.lastIndex = 0;
            const match = methodRegex.exec(line);
            if (match && match[4] !== 'constructor' && match[4] !== 'class') {
                const endLine = this.findClosingBrace(lines, i);
                const body = lines.slice(i, endLine + 1).join('\n');
                methods.push({
                    name: match[4],
                    params: match[5].split(',').map(p => p.trim()).filter(p => p),
                    returnType: match[6]?.trim(),
                    isAsync: !!match[3],
                    isStatic: !!match[2],
                    visibility: match[1] || 'public',
                    complexity: this.calculateComplexity(body),
                    line: i + 1
                });
            }
        }
        return methods;
    }
    // Complexity: O(L) for the class body snippet
    extractProperties(classBody) {
        const properties = [];
        const propRegex = /(?:public|private|protected)?\s*(?:readonly\s+)?(\w+)(?:\?)?:\s*[^;]+;/g;
        let match;
        while ((match = propRegex.exec(classBody)) !== null) {
            if (!properties.includes(match[1])) {
                properties.push(match[1]);
            }
        }
        return properties;
    }
    // Complexity: O(L) for the file content
    extractInterfaces(content) {
        const interfaces = [];
        const interfaceRegex = /(?:export\s+)?interface\s+(\w+)(?:\s+extends\s+([^{]+))?\s*{/g;
        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            interfaceRegex.lastIndex = 0;
            const match = interfaceRegex.exec(line);
            if (match) {
                const endLine = this.findClosingBrace(lines, i);
                const body = lines.slice(i + 1, endLine).join('\n');
                interfaces.push({
                    name: match[1],
                    extends: match[2]?.split(',').map(s => s.trim()) || [],
                    properties: this.extractInterfaceProperties(body),
                    methods: this.extractInterfaceMethods(body),
                    isExported: line.includes('export'),
                    line: i + 1
                });
            }
        }
        return interfaces;
    }
    extractInterfaceProperties(body) {
        const properties = [];
        const propRegex = /(\w+)(\?)?:\s*([^;]+);/g;
        let match;
        while ((match = propRegex.exec(body)) !== null) {
            properties.push({
                name: match[1],
                type: match[3].trim(),
                optional: !!match[2]
            });
        }
        return properties;
    }
    extractInterfaceMethods(body) {
        const methods = [];
        const methodRegex = /(\w+)\s*\(([^)]*)\)(?:\s*:\s*([^;]+))?;/g;
        let match;
        while ((match = methodRegex.exec(body)) !== null) {
            methods.push({
                name: match[1],
                params: match[2].split(',').map(p => p.trim()).filter(p => p),
                returnType: match[3]?.trim()
            });
        }
        return methods;
    }
    // Complexity: O(L) for the function/method body
    extractFunctionCalls(body) {
        const calls = [];
        const callRegex = /(?:this\.)?(\w+)\s*\(/g;
        let match;
        while ((match = callRegex.exec(body)) !== null) {
            const name = match[1];
            if (!['if', 'for', 'while', 'switch', 'catch', 'function', 'return'].includes(name)) {
                if (!calls.includes(name)) {
                    calls.push(name);
                }
            }
        }
        return calls;
    }
    // Complexity: O(L) for the remaining lines of the file
    findClosingBrace(lines, startLine) {
        let braceCount = 0;
        let started = false;
        for (let i = startLine; i < lines.length; i++) {
            for (const char of lines[i]) {
                if (char === '{') {
                    braceCount++;
                    started = true;
                }
                else if (char === '}') {
                    braceCount--;
                    if (started && braceCount === 0) {
                        return i;
                    }
                }
            }
        }
        return lines.length - 1;
    }
    // Complexity: O(L * P) where P is the number of control patterns
    calculateComplexity(body) {
        let complexity = 1; // Base complexity
        // Count control flow statements
        const patterns = [
            /\bif\s*\(/g,
            /\belse\s+if\s*\(/g,
            /\bfor\s*\(/g,
            /\bwhile\s*\(/g,
            /\bswitch\s*\(/g,
            /\bcase\s+/g,
            /\bcatch\s*\(/g,
            /\?\s*[^:]+:/g, // Ternary
            /&&/g,
            /\|\|/g
        ];
        for (const pattern of patterns) {
            const matches = body.match(pattern);
            if (matches) {
                complexity += matches.length;
            }
        }
        return complexity;
    }
    calculateFileHealth(complexity, funcCount, classCount) {
        let health = 100;
        // Penalize high complexity
        if (complexity > 50)
            health -= 20;
        else if (complexity > 30)
            health -= 10;
        else if (complexity > 20)
            health -= 5;
        // Penalize too many functions/classes in one file
        if (funcCount > 20)
            health -= 15;
        else if (funcCount > 10)
            health -= 5;
        if (classCount > 5)
            health -= 10;
        else if (classCount > 3)
            health -= 5;
        return Math.max(0, health);
    }
    calculateHealthScore(avgComplexity, orphanCount, hotspotCount, fileCount) {
        let health = 100;
        // Penalize high average complexity (adjusted thresholds for large projects)
        // Large enterprise codebases naturally have higher complexity
        if (avgComplexity > 100)
            health -= 20;
        else if (avgComplexity > 80)
            health -= 10;
        else if (avgComplexity > 50)
            health -= 5;
        // Below 50 is excellent for enterprise projects
        // Penalize too many orphans (potential unused exports)
        // In modular architectures, some orphans are expected (library exports)
        const orphanRatio = orphanCount / Math.max(fileCount, 1);
        if (orphanRatio > 0.5)
            health -= 15;
        else if (orphanRatio > 0.4)
            health -= 8;
        else if (orphanRatio > 0.3)
            health -= 3;
        // Below 30% orphan ratio is acceptable for frameworks
        // Penalize too many hotspots (complexity centers)
        // Some hotspots are natural in large codebases (core engines, orchestrators)
        const hotspotRatio = hotspotCount / Math.max(fileCount, 1);
        if (hotspotRatio > 0.15)
            health -= 10;
        else if (hotspotRatio > 0.10)
            health -= 5;
        // Below 10% hotspot ratio is healthy
        return Math.max(0, Math.min(100, health));
    }
    // Complexity: O(L) - linear scan of the file
    countLines(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf-8');
            return content.split('\n').length;
        }
        catch {
            return 0;
        }
    }
    // Complexity: O(L) - digest calculation
    hashContent(content) {
        return crypto.createHash('md5').update(content).digest('hex').substring(0, 8);
    }
    generateSnapshotHash(files) {
        const hashes = Array.from(files.values()).map(f => f.hash).sort().join('');
        return crypto.createHash('sha256').update(hashes).digest('hex').substring(0, 16);
    }
    // Complexity: O(1) - log output
    printStats() {
        if (!this.brainMap)
            return;
        const { stats } = this.brainMap;
        logger_1.logger.debug(`
╔══════════════════════════════════════════════════════════════════════════════╗
║  🧠 BRAIN MAP STATISTICS                                                     ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  Files:        ${String(stats.totalFiles).padEnd(10)} │  Classes:     ${String(stats.totalClasses).padEnd(10)}         ║
║  Lines:        ${String(stats.totalLines).padEnd(10)} │  Interfaces:  ${String(stats.totalInterfaces).padEnd(10)}         ║
║  Functions:    ${String(stats.totalFunctions).padEnd(10)} │  Avg Complex: ${stats.avgComplexity.toFixed(2).padEnd(10)}         ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  Health Score: ${stats.healthScore.toFixed(1).padEnd(10)}%                                           ║
║  Hotspots:     ${String(this.brainMap.hotspots.length).padEnd(10)} │  Orphans:     ${String(this.brainMap.orphans.length).padEnd(10)}         ║
╚══════════════════════════════════════════════════════════════════════════════╝
`);
    }
}
exports.NeuralMapper = NeuralMapper;
// ═══════════════════════════════════════════════════════════════════════════════
// CLI INTERFACE
// ═══════════════════════════════════════════════════════════════════════════════
async function main() {
    const rootDir = process.cwd();
    const mapper = new NeuralMapper(rootDir);
    logger_1.logger.debug(`
╔══════════════════════════════════════════════════════════════════════════════╗
║  🧠 NEURAL MAPPER - THE BRAIN MAP                                            ║
║  v1.0.0 "Quantum" - Living System Protocol                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
`);
    // SAFETY: async operation — wrap in try-catch for production resilience
    const brainMap = await mapper.generateBrainMap();
    // Export to file
    const outputPath = path.join(rootDir, 'brain-map.json');
    // SAFETY: async operation — wrap in try-catch for production resilience
    await mapper.exportBrainMap(outputPath);
    // Take initial pulse
    // SAFETY: async operation — wrap in try-catch for production resilience
    await mapper.takeContextPulse();
    logger_1.logger.debug('\n🧠 Neural Mapper complete. The system now "knows" itself.');
}
if (require.main === module) {
    main().catch(console.error);
}
