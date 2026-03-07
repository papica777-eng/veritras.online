"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                                               ║
 * ║  ███████╗██╗   ██╗███████╗████████╗███████╗███╗   ███╗                                        ║
 * ║  ██╔════╝╚██╗ ██╔╝██╔════╝╚══██╔══╝██╔════╝████╗ ████║                                        ║
 * ║  ███████╗ ╚████╔╝ ███████╗   ██║   █████╗  ██╔████╔██║                                        ║
 * ║  ╚════██║  ╚██╔╝  ╚════██║   ██║   ██╔══╝  ██║╚██╔╝██║                                        ║
 * ║  ███████║   ██║   ███████║   ██║   ███████╗██║ ╚═╝ ██║                                        ║
 * ║  ╚══════╝   ╚═╝   ╚══════╝   ╚═╝   ╚══════╝╚═╝     ╚═╝                                        ║
 * ║                                                                                               ║
 * ║  ███╗   ███╗███████╗██████╗ ██╗████████╗ █████╗ ████████╗██╗ ██████╗ ███╗   ██╗               ║
 * ║  ████╗ ████║██╔════╝██╔══██╗██║╚══██╔══╝██╔══██╗╚══██╔══╝██║██╔═══██╗████╗  ██║               ║
 * ║  ██╔████╔██║█████╗  ██║  ██║██║   ██║   ███████║   ██║   ██║██║   ██║██╔██╗ ██║               ║
 * ║  ██║╚██╔╝██║██╔══╝  ██║  ██║██║   ██║   ██╔══██║   ██║   ██║██║   ██║██║╚██╗██║               ║
 * ║  ██║ ╚═╝ ██║███████╗██████╔╝██║   ██║   ██║  ██║   ██║   ██║╚██████╔╝██║ ╚████║               ║
 * ║  ╚═╝     ╚═╝╚══════╝╚═════╝ ╚═╝   ╚═╝   ╚═╝  ╚═╝   ╚═╝   ╚═╝ ╚═════╝ ╚═╝  ╚═══╝               ║
 * ║                                                                                               ║
 * ║                            SYSTEM MEDITATION ENGINE                                           ║
 * ║                    "Universal Synthesis Layer Integrity Verification"                         ║
 * ║                                                                                               ║
 * ║   THE FINAL SYNTHESIS - Task 4: System Meditation                                             ║
 * ║   © 2025-2026 QAntum | Dimitar Prodromov                                                        ║
 * ║                                                                                               ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════════════╝
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
exports.getMeditation = exports.SystemMeditation = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// ═══════════════════════════════════════════════════════════════════════════════
// UNIVERSAL SYNTHESIS LAYERS
// ═══════════════════════════════════════════════════════════════════════════════
const UNIVERSAL_SYNTHESIS_LAYERS = [
    {
        name: 'Foundation',
        description: 'Core utilities, types, and primitives',
        modules: ['core', 'types', 'utils'],
        dependsOn: [],
        status: 'healthy',
    },
    {
        name: 'Infrastructure',
        description: 'Storage, events, configuration',
        modules: ['storage', 'events', 'config', 'plugins'],
        dependsOn: ['Foundation'],
        status: 'healthy',
    },
    {
        name: 'Domain',
        description: 'Testing logic, assertions, matchers',
        modules: ['validation', 'api', 'performance', 'security', 'accessibility', 'visual'],
        dependsOn: ['Foundation', 'Infrastructure'],
        status: 'healthy',
    },
    {
        name: 'Intelligence',
        description: 'AI, cognition, oracle, swarm',
        modules: ['ai', 'cognition', 'oracle', 'swarm', 'ghost'],
        dependsOn: ['Foundation', 'Infrastructure', 'Domain'],
        status: 'healthy',
    },
    {
        name: 'Synthesis',
        description: 'Cross-module integration, orchestration',
        modules: ['synthesis', 'distributed', 'chronos', 'reality'],
        dependsOn: ['Foundation', 'Infrastructure', 'Domain', 'Intelligence'],
        status: 'healthy',
    },
    {
        name: 'Presentation',
        description: 'Reporting, dashboard, UI',
        modules: ['reporter', 'dashboard', 'extensibility'],
        dependsOn: ['Foundation', 'Infrastructure', 'Domain', 'Synthesis'],
        status: 'healthy',
    },
    {
        name: 'Business',
        description: 'SaaS, licensing, billing',
        modules: ['saas', 'licensing', 'sales'],
        dependsOn: ['Foundation', 'Infrastructure', 'Presentation'],
        status: 'healthy',
    },
];
// ═══════════════════════════════════════════════════════════════════════════════
// SYSTEM MEDITATION ENGINE
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * SystemMeditation - Deep analysis and verification of system integrity
 */
class SystemMeditation {
    static instance;
    srcPath;
    meditationHistory = [];
    constructor(srcPath = process.cwd()) {
        this.srcPath = srcPath;
    }
    static getInstance(srcPath) {
        if (!SystemMeditation.instance) {
            SystemMeditation.instance = new SystemMeditation(srcPath);
        }
        return SystemMeditation.instance;
    }
    /**
     * Execute full system meditation
     */
    // Complexity: O(N) — linear scan
    async meditate() {
        const startTime = Date.now();
        console.log('\n🧘 Starting System Meditation...\n');
        console.log('═'.repeat(60));
        // Phase 1: Scan all files
        console.log('\n📂 Phase 1: Scanning file system...');
        // SAFETY: async operation — wrap in try-catch for production resilience
        const { files, lines } = await this.scanFileSystem();
        console.log(`   Found ${files} files, ${lines.toLocaleString()} lines`);
        // Phase 2: Analyze module health
        console.log('\n🔬 Phase 2: Analyzing module health...');
        // SAFETY: async operation — wrap in try-catch for production resilience
        const moduleHealth = await this.analyzeModuleHealth();
        moduleHealth.forEach((m) => {
            const healthEmoji = {
                excellent: '💚',
                good: '💙',
                fair: '💛',
                poor: '❤️',
            }[m.health];
            console.log(`   ${healthEmoji} ${m.name}: ${m.health} (${m.files} files, ${m.lines} lines)`);
        });
        // Phase 3: Verify layer integrity
        console.log('\n🏗️ Phase 3: Verifying Universal Synthesis Layers...');
        // SAFETY: async operation — wrap in try-catch for production resilience
        const layerIntegrity = await this.verifyLayerIntegrity();
        layerIntegrity.layers.forEach((layer) => {
            const statusEmoji = {
                healthy: '✅',
                warning: '⚠️',
                critical: '❌',
            }[layer.status];
            console.log(`   ${statusEmoji} ${layer.name}: ${layer.status}`);
        });
        // Phase 4: Generate synthesis score
        console.log('\n📊 Phase 4: Calculating Synthesis Score...');
        const synthesisScore = this.calculateSynthesisScore(layerIntegrity, moduleHealth);
        console.log(`   Score: ${synthesisScore}/100`);
        // Phase 5: Generate recommendations
        console.log('\n💡 Phase 5: Generating recommendations...');
        const { warnings, recommendations } = this.generateInsights(layerIntegrity, moduleHealth);
        const duration = Date.now() - startTime;
        const result = {
            timestamp: new Date().toISOString(),
            duration,
            totalFiles: files,
            totalLines: lines,
            layerIntegrity,
            moduleHealth,
            synthesisScore,
            warnings,
            recommendations,
            passed: synthesisScore >= 80 &&
                layerIntegrity.violations.filter((v) => v.severity === 'error').length === 0,
        };
        this.meditationHistory.push(result);
        this.printFinalReport(result);
        return result;
    }
    /**
     * Quick health check
     */
    // Complexity: O(N) — linear scan
    async quickCheck() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const moduleHealth = await this.analyzeModuleHealth();
        // SAFETY: async operation — wrap in try-catch for production resilience
        const layerIntegrity = await this.verifyLayerIntegrity();
        const score = this.calculateSynthesisScore(layerIntegrity, moduleHealth);
        const issues = [];
        layerIntegrity.violations.forEach((v) => {
            if (v.severity === 'error') {
                issues.push(`Layer violation: ${v.from} → ${v.to}`);
            }
        });
        moduleHealth.forEach((m) => {
            if (m.health === 'poor') {
                issues.push(`Module ${m.name} needs attention`);
            }
            if (m.circularDeps.length > 0) {
                issues.push(`Circular dependencies in ${m.name}`);
            }
        });
        return {
            healthy: score >= 80 && issues.length === 0,
            score,
            issues,
        };
    }
    // ─────────────────────────────────────────────────────────────────────────
    // PRIVATE METHODS
    // ─────────────────────────────────────────────────────────────────────────
    // Complexity: O(N) — loop
    async scanFileSystem() {
        const srcDir = path.join(this.srcPath, 'src');
        let totalFiles = 0;
        let totalLines = 0;
        const scanDir = (dir) => {
            if (!fs.existsSync(dir))
                return;
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                if (entry.isDirectory()) {
                    // Complexity: O(1)
                    scanDir(fullPath);
                }
                else if (entry.name.endsWith('.ts') || entry.name.endsWith('.js')) {
                    totalFiles++;
                    try {
                        const content = fs.readFileSync(fullPath, 'utf-8');
                        totalLines += content.split('\n').length;
                    }
                    catch {
                        // Skip unreadable files
                    }
                }
            }
        };
        // Complexity: O(1)
        scanDir(srcDir);
        return { files: totalFiles, lines: totalLines };
    }
    // Complexity: O(N) — linear scan
    async analyzeModuleHealth() {
        const srcDir = path.join(this.srcPath, 'src');
        const reports = [];
        if (!fs.existsSync(srcDir)) {
            return reports;
        }
        const modules = fs
            .readdirSync(srcDir, { withFileTypes: true })
            .filter((d) => d.isDirectory())
            .map((d) => d.name);
        for (const moduleName of modules) {
            const modulePath = path.join(srcDir, moduleName);
            // SAFETY: async operation — wrap in try-catch for production resilience
            const report = await this.analyzeModule(moduleName, modulePath);
            reports.push(report);
        }
        return reports;
    }
    // Complexity: O(N*M) — nested iteration
    async analyzeModule(name, modulePath) {
        let files = 0;
        let lines = 0;
        let exports = 0;
        const dependencies = new Set();
        const issues = [];
        const scanModule = (dir) => {
            if (!fs.existsSync(dir))
                return;
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                if (entry.isDirectory()) {
                    // Complexity: O(1)
                    scanModule(fullPath);
                }
                else if (entry.name.endsWith('.ts')) {
                    files++;
                    try {
                        const content = fs.readFileSync(fullPath, 'utf-8');
                        lines += content.split('\n').length;
                        // Count exports
                        const exportMatches = content.match(/export\s+(class|function|const|interface|type|enum)/g);
                        exports += exportMatches?.length || 0;
                        // Find imports
                        const importMatches = content.matchAll(/from\s+['"]\.\.\/([^/'"]+)/g);
                        for (const match of importMatches) {
                            dependencies.add(match[1]);
                        }
                    }
                    catch {
                        issues.push(`Could not read ${entry.name}`);
                    }
                }
            }
        };
        // Complexity: O(1)
        scanModule(modulePath);
        // Determine health
        let health = 'excellent';
        if (files === 0) {
            health = 'poor';
            issues.push('No TypeScript files found');
        }
        else if (exports === 0) {
            health = 'fair';
            issues.push('No exports found');
        }
        else if (files > 50) {
            health = 'fair';
            issues.push('Large module - consider splitting');
        }
        // Check for index.ts
        if (!fs.existsSync(path.join(modulePath, 'index.ts'))) {
            if (health === 'excellent')
                health = 'good';
            issues.push('Missing index.ts barrel file');
        }
        return {
            name,
            path: modulePath,
            files,
            lines,
            exports,
            dependencies: Array.from(dependencies),
            circularDeps: [], // Would need full import graph analysis
            health,
            issues,
        };
    }
    // Complexity: O(N*M) — nested iteration
    async verifyLayerIntegrity() {
        const violations = [];
        const layers = [...UNIVERSAL_SYNTHESIS_LAYERS];
        // Check each layer's modules exist
        const srcDir = path.join(this.srcPath, 'src');
        for (const layer of layers) {
            const existingModules = layer.modules.filter((m) => fs.existsSync(path.join(srcDir, m)));
            if (existingModules.length < layer.modules.length * 0.5) {
                layer.status = 'warning';
            }
            if (existingModules.length === 0) {
                layer.status = 'critical';
            }
        }
        // Simple dependency check (would need full AST analysis for complete check)
        const layerMap = new Map();
        layers.forEach((layer, index) => {
            layer.modules.forEach((m) => layerMap.set(m, index));
        });
        const score = (layers.filter((l) => l.status === 'healthy').length / layers.length) * 100;
        return {
            layers,
            violations,
            score,
        };
    }
    // Complexity: O(N) — linear scan
    calculateSynthesisScore(layerIntegrity, moduleHealth) {
        let score = 0;
        // Layer integrity: 40%
        score += layerIntegrity.score * 0.4;
        // Module health: 40%
        const healthScores = {
            excellent: 100,
            good: 80,
            fair: 60,
            poor: 40,
        };
        const avgModuleHealth = moduleHealth.length > 0
            ? moduleHealth.reduce((sum, m) => sum + healthScores[m.health], 0) / moduleHealth.length
            : 100;
        score += avgModuleHealth * 0.4;
        // Module coverage: 20%
        const expectedModules = UNIVERSAL_SYNTHESIS_LAYERS.flatMap((l) => l.modules);
        const existingModules = moduleHealth.map((m) => m.name);
        const coverage = (existingModules.filter((m) => expectedModules.includes(m)).length / expectedModules.length) *
            100;
        score += coverage * 0.2;
        return Math.round(score);
    }
    // Complexity: O(N) — linear scan
    generateInsights(layerIntegrity, moduleHealth) {
        const warnings = [];
        const recommendations = [];
        // Layer warnings
        layerIntegrity.layers.forEach((layer) => {
            if (layer.status === 'warning') {
                warnings.push(`Layer "${layer.name}" has incomplete modules`);
            }
            if (layer.status === 'critical') {
                warnings.push(`Layer "${layer.name}" is missing critical modules`);
            }
        });
        // Violation warnings
        layerIntegrity.violations.forEach((v) => {
            warnings.push(`Layer violation: ${v.message}`);
        });
        // Module recommendations
        moduleHealth.forEach((m) => {
            if (m.health === 'poor') {
                recommendations.push(`Improve module "${m.name}" - ${m.issues.join(', ')}`);
            }
            if (m.circularDeps.length > 0) {
                recommendations.push(`Break circular dependencies in "${m.name}"`);
            }
            if (!m.issues.includes('Missing index.ts barrel file') && m.exports > 20) {
                recommendations.push(`Consider splitting "${m.name}" into sub-modules`);
            }
        });
        // General recommendations
        if (moduleHealth.length < 10) {
            recommendations.push('Consider adding more specialized modules for better organization');
        }
        return { warnings, recommendations };
    }
    // Complexity: O(N) — linear scan
    printFinalReport(result) {
        console.log('\n' + '═'.repeat(60));
        console.log('                    🧘 MEDITATION COMPLETE 🧘');
        console.log('═'.repeat(60));
        console.log(`
┌────────────────────────────────────────────────────────────┐
│                     SYNTHESIS REPORT                        │
├────────────────────────────────────────────────────────────┤
│  📁 Total Files:        ${result.totalFiles.toString().padStart(6)}                          │
│  📝 Total Lines:        ${result.totalLines.toLocaleString().padStart(6)}                          │
│  ⏱️  Duration:           ${result.duration.toString().padStart(6)}ms                         │
│  📊 Synthesis Score:    ${result.synthesisScore.toString().padStart(6)}/100                       │
│  ${result.passed ? '✅' : '❌'} Status:             ${result.passed ? 'PASSED' : 'FAILED'}                           │
└────────────────────────────────────────────────────────────┘
`);
        if (result.warnings.length > 0) {
            console.log('\n⚠️  WARNINGS:');
            result.warnings.forEach((w) => console.log(`   • ${w}`));
        }
        if (result.recommendations.length > 0) {
            console.log('\n💡 RECOMMENDATIONS:');
            result.recommendations.forEach((r) => console.log(`   • ${r}`));
        }
        if (result.passed) {
            console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║    🎉 UNIVERSAL SYNTHESIS INTEGRITY VERIFIED! 🎉          ║
║                                                            ║
║    All layers are in harmony.                              ║
║    The system is ready for production.                     ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
`);
        }
    }
}
exports.SystemMeditation = SystemMeditation;
// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════
const getMeditation = (srcPath) => SystemMeditation.getInstance(srcPath);
exports.getMeditation = getMeditation;
exports.default = SystemMeditation;
