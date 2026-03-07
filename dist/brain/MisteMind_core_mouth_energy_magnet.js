"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                                       ║
 * ║   🧲 QANTUM MAGNET - AUTOMATIC MODULE COLLECTOR                                       ║
 * ║   "Събира ВСИЧКИ модули без значение къде са"                                         ║
 * ║                                                                                       ║
 * ║   Scans ALL directories recursively and catalogs every module found                   ║
 * ║                                                                                       ║
 * ║   @author Dimitar Prodromov                                                           ║
 * ║   @version 35.0.0                                                                     ║
 * ║                                                                                       ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════╝
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
exports.magnet = exports.QAntumMagnet = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// ═══════════════════════════════════════════════════════════════════════════════
// CATEGORY MAPPING
// ═══════════════════════════════════════════════════════════════════════════════
const CATEGORY_MAP = {
    // Core
    core: 'core',
    types: 'core',
    config: 'core',
    events: 'core',
    chronos: 'core',
    omega: 'core',
    // Security
    security: 'security',
    bastion: 'security',
    fortress: 'security',
    guardians: 'security',
    // AI & Cognition
    ai: 'ai',
    cognition: 'ai',
    intelligence: 'ai',
    neural: 'ai',
    multimodal: 'ai',
    persona: 'ai',
    oracle: 'ai',
    asc: 'ai',
    // Testing
    testing: 'testing',
    validation: 'testing',
    performance: 'testing',
    accessibility: 'testing',
    visual: 'testing',
    chaos: 'testing',
    segc: 'testing',
    // Scientific
    physics: 'scientific',
    biology: 'scientific',
    chemistry: 'scientific',
    math: 'scientific',
    // Enterprise
    enterprise: 'enterprise',
    licensing: 'enterprise',
    saas: 'enterprise',
    sales: 'enterprise',
    outreach: 'enterprise',
    // Infrastructure
    swarm: 'infrastructure',
    distributed: 'infrastructure',
    local: 'infrastructure',
    telemetry: 'infrastructure',
    // UI
    dashboard: 'ui',
    reporter: 'ui',
    ux: 'ui',
    // Data
    data: 'data',
    storage: 'data',
    // Integration
    api: 'integration',
    plugins: 'integration',
    extensibility: 'integration',
    integration: 'integration',
    // Stealth
    ghost: 'stealth',
    // Synthesis
    synthesis: 'synthesis',
    reality: 'synthesis',
    // Special
    ide: 'core',
    'global-nexus': 'core',
    'sovereign-market': 'enterprise',
};
// ═══════════════════════════════════════════════════════════════════════════════
// SCAN PATHS - ВСИЧКИ ВЪЗМОЖНИ ЛОКАЦИИ
// ═══════════════════════════════════════════════════════════════════════════════
const SCAN_PATHS = [
    // === PRIMARY SOURCES ===
    'C:/MrMindQATool/src',
    'C:/MisteMind/src',
    'C:/MisterMindPage',
    // === PRIVATE CORE (PROTECTED) ===
    'C:/MisteMind/PROJECT/PRIVATE/Mind-Engine-Core/src',
    'C:/MisteMind/PROJECT/PRIVATE/MrMindQATool/src',
    'C:/MisteMind/PROJECT/PRIVATE/QA-Framework/src',
    // === QA-SAAS PLATFORM (EXPANDED) ===
    'C:/MisteMind/PROJECT/QA-SAAS/apps',
    'C:/MisteMind/PROJECT/QA-SAAS/packages',
    // === NERVE CENTER ===
    'C:/MisteMind/qantum-nerve-center/src',
    'C:/MisteMind/qantum-nerve-center/server',
    // === TRAINING ===
    'C:/MisteMind/TRAINING/training-framework/src',
];
// ═══════════════════════════════════════════════════════════════════════════════
// MAGNET CLASS
// ═══════════════════════════════════════════════════════════════════════════════
class QAntumMagnet {
    modules = new Map();
    scanPaths;
    lastScan;
    constructor(customPaths) {
        this.scanPaths = customPaths || SCAN_PATHS;
    }
    /**
     * 🧲 ГЛАВНА ФУНКЦИЯ - Сканира и събира ВСИЧКИ модули
     */
    async scan() {
        console.log('🧲 QANTUM MAGNET ACTIVATED');
        console.log('═══════════════════════════════════════════════════════════');
        this.modules.clear();
        for (const basePath of this.scanPaths) {
            if (fs.existsSync(basePath)) {
                await this.scanDirectory(basePath);
            }
        }
        this.lastScan = new Date();
        const results = Array.from(this.modules.values());
        console.log(`\n🧲 MAGNET COMPLETE: ${results.length} modules collected`);
        console.log(`   Total LOC: ${results.reduce((sum, m) => sum + m.loc, 0).toLocaleString()}`);
        return results;
    }
    /**
     * Сканира директория за модули
     */
    async scanDirectory(basePath) {
        const source = this.detectSource(basePath);
        console.log(`\n📁 Scanning: ${basePath} [${source}]`);
        try {
            const entries = fs.readdirSync(basePath, { withFileTypes: true });
            for (const entry of entries) {
                if (entry.isDirectory() && !this.shouldSkip(entry.name)) {
                    const modulePath = path.join(basePath, entry.name);
                    const module = await this.analyzeModule(entry.name, modulePath, source);
                    if (module.files > 0) {
                        const key = modulePath;
                        this.modules.set(key, module);
                        console.log(`   ✅ ${entry.name}: ${module.files} files, ${module.loc} LOC`);
                    }
                }
            }
        }
        catch (error) {
            console.error(`   ❌ Error scanning ${basePath}:`, error);
        }
    }
    /**
     * Анализира един модул
     */
    async analyzeModule(name, modulePath, source) {
        const tsFiles = this.findTsFiles(modulePath);
        const loc = this.countLOC(tsFiles);
        const exports = this.extractExports(modulePath);
        const deps = this.extractDependencies(modulePath);
        return {
            name,
            source,
            path: modulePath,
            category: CATEGORY_MAP[name] || 'core',
            files: tsFiles.length,
            loc,
            status: this.determineStatus(name, loc),
            exports,
            dependencies: deps,
            lastModified: this.getLastModified(modulePath)
        };
    }
    /**
     * Намира всички .ts файлове (без node_modules и .d.ts)
     */
    findTsFiles(dir) {
        const files = [];
        const scan = (currentDir) => {
            try {
                const entries = fs.readdirSync(currentDir, { withFileTypes: true });
                for (const entry of entries) {
                    const fullPath = path.join(currentDir, entry.name);
                    if (entry.isDirectory()) {
                        if (!this.shouldSkip(entry.name)) {
                            scan(fullPath);
                        }
                    }
                    else if (entry.name.endsWith('.ts') && !entry.name.endsWith('.d.ts')) {
                        files.push(fullPath);
                    }
                }
            }
            catch { }
        };
        scan(dir);
        return files;
    }
    /**
     * Брои LOC
     */
    countLOC(files) {
        let total = 0;
        for (const file of files) {
            try {
                const content = fs.readFileSync(file, 'utf-8');
                total += content.split('\n').length;
            }
            catch { }
        }
        return total;
    }
    /**
     * Извлича exports от index.ts
     */
    extractExports(modulePath) {
        const indexPath = path.join(modulePath, 'index.ts');
        const exports = [];
        try {
            if (fs.existsSync(indexPath)) {
                const content = fs.readFileSync(indexPath, 'utf-8');
                const exportMatches = content.match(/export\s+(?:class|interface|function|const|type|enum)\s+(\w+)/g);
                if (exportMatches) {
                    for (const match of exportMatches) {
                        const name = match.split(/\s+/).pop();
                        if (name)
                            exports.push(name);
                    }
                }
                // Also check for re-exports
                const reExportMatches = content.match(/export\s+\*\s+from\s+['"](.+)['"]/g);
                if (reExportMatches) {
                    exports.push(`[re-exports: ${reExportMatches.length}]`);
                }
            }
        }
        catch { }
        return exports.slice(0, 10); // Limit to 10
    }
    /**
     * Извлича dependencies
     */
    extractDependencies(modulePath) {
        const deps = new Set();
        const indexPath = path.join(modulePath, 'index.ts');
        try {
            if (fs.existsSync(indexPath)) {
                const content = fs.readFileSync(indexPath, 'utf-8');
                const importMatches = content.match(/from\s+['"]\.\.\/(\w+)['"]/g);
                if (importMatches) {
                    for (const match of importMatches) {
                        const dep = match.match(/\.\.\/(\w+)/)?.[1];
                        if (dep)
                            deps.add(dep);
                    }
                }
            }
        }
        catch { }
        return Array.from(deps);
    }
    /**
     * Определя source по пътя
     */
    detectSource(basePath) {
        if (basePath.includes('MrMindQATool'))
            return 'MrMindQATool';
        if (basePath.includes('MisteMind'))
            return 'MisteMind';
        if (basePath.includes('MisterMindPage'))
            return 'MisterMindPage';
        return 'Unknown';
    }
    /**
     * Директории за пропускане
     */
    shouldSkip(name) {
        const skipList = [
            'node_modules', 'dist', '.git', '.vscode',
            'coverage', 'build', '__tests__', '__mocks__'
        ];
        return skipList.includes(name) || name.startsWith('.');
    }
    /**
     * Определя статус на модула
     */
    determineStatus(name, loc) {
        const experimental = ['multimodal', 'persona', 'reality', 'synthesis', 'oracle'];
        if (experimental.includes(name))
            return 'experimental';
        if (loc < 100)
            return 'deprecated';
        return 'active';
    }
    /**
     * Последна модификация
     */
    getLastModified(modulePath) {
        try {
            const stat = fs.statSync(modulePath);
            return stat.mtime;
        }
        catch {
            return undefined;
        }
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // PUBLIC API
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Връща всички модули
     */
    getAllModules() {
        return Array.from(this.modules.values());
    }
    /**
     * Филтрира по категория
     */
    getByCategory(category) {
        return this.getAllModules().filter(m => m.category === category);
    }
    /**
     * Филтрира по source
     */
    getBySource(source) {
        return this.getAllModules().filter(m => m.source === source);
    }
    /**
     * Търсене по име
     */
    findModule(name) {
        return this.getAllModules().find(m => m.name === name);
    }
    /**
     * Статистики
     */
    getStats() {
        const modules = this.getAllModules();
        const byCategory = {};
        const bySource = {};
        for (const m of modules) {
            // By category
            if (!byCategory[m.category]) {
                byCategory[m.category] = { count: 0, loc: 0 };
            }
            byCategory[m.category].count++;
            byCategory[m.category].loc += m.loc;
            // By source
            if (!bySource[m.source]) {
                bySource[m.source] = { count: 0, loc: 0 };
            }
            bySource[m.source].count++;
            bySource[m.source].loc += m.loc;
        }
        return {
            totalModules: modules.length,
            totalLOC: modules.reduce((sum, m) => sum + m.loc, 0),
            totalFiles: modules.reduce((sum, m) => sum + m.files, 0),
            byCategory,
            bySource,
            activeModules: modules.filter(m => m.status === 'active').length,
            experimentalModules: modules.filter(m => m.status === 'experimental').length,
            lastScan: this.lastScan
        };
    }
    /**
     * Експорт към JSON
     */
    toJSON() {
        return JSON.stringify({
            modules: this.getAllModules(),
            stats: this.getStats(),
            scanPaths: this.scanPaths,
            generatedAt: new Date().toISOString()
        }, null, 2);
    }
}
exports.QAntumMagnet = QAntumMagnet;
// ═══════════════════════════════════════════════════════════════════════════════
// SINGLETON INSTANCE
// ═══════════════════════════════════════════════════════════════════════════════
exports.magnet = new QAntumMagnet();
// ═══════════════════════════════════════════════════════════════════════════════
// AUTO-SCAN ON IMPORT (optional)
// ═══════════════════════════════════════════════════════════════════════════════
// Uncomment to auto-scan on import:
// magnet.scan().then(() => console.log('Magnet ready!'));
exports.default = exports.magnet;
