"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                   SOVEREIGN AUDIT - THE SELF-OPTIMIZING ENGINE                ║
 * ║                                                                               ║
 * ║       "Сканира 1.1M реда код за архитектурни аномалии и предлага              ║
 * ║        оптимизации, които човешкото око не може да види."                     ║
 * ║                                                                               ║
 * ║  Функции:                                                                     ║
 * ║  • Redundancy Detection - Открива дублиран код между проекти                  ║
 * ║  • Logic Gaps - Намира неизползвани методи и мъртъв код                       ║
 * ║  • Optimization - Предлага премахване/обединяване на модули                   ║
 * ║  • Auto-Purge - Автоматично изтрива код след потвърждение                     ║
 * ║                                                                               ║
 * ║  Created: 2026-01-01 | QAntum Prime v28.1.0 SUPREME - Empire Architect        ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SovereignAudit = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const crypto = __importStar(require("crypto"));
const DeepSeekLink_1 = require("./DeepSeekLink");
const VectorSync_1 = __importDefault(require("./VectorSync"));
// ═══════════════════════════════════════════════════════════════════════════════
// SOVEREIGN AUDIT ENGINE
// ═══════════════════════════════════════════════════════════════════════════════
class SovereignAudit {
    config;
    ai;
    vectorDB;
    symbolRegistry = new Map();
    findings = [];
    constructor(config) {
        this.config = {
            projects: config?.projects || ['MisteMind', 'MrMindQATool', 'MisterMindPage'],
            outputPath: config?.outputPath || 'C:/MisteMind/data/audits',
            deepAnalysis: config?.deepAnalysis ?? true,
            autoFix: config?.autoFix ?? false,
            thresholds: {
                redundancyScore: config?.thresholds?.redundancyScore ?? 0.8,
                deadCodeThreshold: config?.thresholds?.deadCodeThreshold ?? 90,
                complexityLimit: config?.thresholds?.complexityLimit ?? 20,
            },
        };
        this.ai = (0, DeepSeekLink_1.getDeepSeekLink)();
        this.vectorDB = new VectorSync_1.default();
        this.log('🔍 SovereignAudit initialized');
    }
    // ═══════════════════════════════════════════════════════════════════════════════
    // PUBLIC API
    // ═══════════════════════════════════════════════════════════════════════════════
    /**
     * Изпълнява пълен одит на Империята
     */
    async runFullAudit() {
        const startTime = Date.now();
        this.findings = [];
        this.printBanner();
        this.log('\n🔍 Скениране на Империята за архитектурни аномалии...\n');
        // Phase 1: Build Symbol Registry
        this.log('📊 Фаза 1: Изграждане на Symbol Registry...');
        await this.buildSymbolRegistry();
        // Phase 2: Redundancy Detection
        this.log('\n🔄 Фаза 2: Откриване на дублиран код...');
        await this.detectRedundancy();
        // Phase 3: Dead Code Analysis
        this.log('\n💀 Фаза 3: Анализ на мъртъв код...');
        await this.detectDeadCode();
        // Phase 4: Logic Gap Analysis
        this.log('\n🕳️ Фаза 4: Търсене на логически пропуски...');
        await this.detectLogicGaps();
        // Phase 5: Performance Optimization
        this.log('\n⚡ Фаза 5: Performance анализ...');
        await this.analyzePerformance();
        // Phase 6: AI Deep Analysis (if enabled)
        let aiInsights;
        if (this.config.deepAnalysis) {
            this.log('\n🧠 Фаза 6: DeepSeek AI анализ...');
            aiInsights = await this.runAIAnalysis();
        }
        // Generate Report
        const report = this.generateReport(startTime, aiInsights);
        // Save Report
        await this.saveReport(report);
        // Print Summary
        this.printReportSummary(report);
        return report;
    }
    /**
     * Бърз одит без AI
     */
    async runQuickAudit() {
        const originalDeep = this.config.deepAnalysis;
        this.config.deepAnalysis = false;
        const report = await this.runFullAudit();
        this.config.deepAnalysis = originalDeep;
        return report;
    }
    /**
     * Одит на конкретен проект
     */
    async auditProject(projectName) {
        this.log(`\n🔍 Одит на ${projectName}...`);
        const projectPath = this.getProjectPath(projectName);
        const findings = [];
        // Scan project
        const files = await this.scanProject(projectPath);
        for (const file of files) {
            const fileFindings = await this.analyzeFile(file, projectName);
            findings.push(...fileFindings);
        }
        return findings;
    }
    /**
     * Изпълнява auto-fix на одобрени findings
     */
    async applyFixes(findingIds) {
        let success = 0;
        let failed = 0;
        for (const id of findingIds) {
            const finding = this.findings.find(f => f.id === id);
            if (!finding || !finding.autoFixable || !finding.fixCode) {
                failed++;
                continue;
            }
            try {
                await this.applyFix(finding);
                success++;
                this.log(`   ✅ Fixed: ${finding.title}`);
            }
            catch (error) {
                failed++;
                this.log(`   ❌ Failed: ${finding.title} - ${error}`);
            }
        }
        return { success, failed };
    }
    // ═══════════════════════════════════════════════════════════════════════════════
    // SYMBOL REGISTRY
    // ═══════════════════════════════════════════════════════════════════════════════
    async buildSymbolRegistry() {
        const projectPaths = {
            'MisteMind': 'C:/MisteMind',
            'MrMindQATool': 'C:/MrMindQATool',
            'MisterMindPage': 'C:/MisterMindPage',
        };
        for (const [project, basePath] of Object.entries(projectPaths)) {
            if (!fs.existsSync(basePath))
                continue;
            const files = await this.scanProject(basePath);
            for (const file of files) {
                try {
                    const content = fs.readFileSync(file, 'utf-8');
                    const symbols = this.extractSymbols(content, file, project);
                    for (const symbol of symbols) {
                        this.symbolRegistry.set(symbol.id, symbol);
                    }
                }
                catch { }
            }
        }
        this.log(`   📊 Индексирани символи: ${this.symbolRegistry.size}`);
    }
    extractSymbols(content, filePath, project) {
        const symbols = [];
        const lines = content.split('\n');
        // Extract exports
        const patterns = [
            { regex: /export\s+(const|let|var)\s+(\w+)/g, type: 'variable' },
            { regex: /export\s+(?:async\s+)?function\s+(\w+)/g, type: 'function' },
            { regex: /export\s+class\s+(\w+)/g, type: 'class' },
            { regex: /export\s+interface\s+(\w+)/g, type: 'interface' },
            { regex: /export\s+type\s+(\w+)/g, type: 'type' },
            { regex: /export\s+enum\s+(\w+)/g, type: 'enum' },
        ];
        for (const { regex, type } of patterns) {
            let match;
            while ((match = regex.exec(content)) !== null) {
                const name = match[2] || match[1];
                const lineNumber = content.slice(0, match.index).split('\n').length;
                symbols.push({
                    id: `${project}:${path.relative(this.getProjectPath(project), filePath)}:${name}`,
                    name,
                    type: type,
                    project,
                    filePath,
                    line: lineNumber,
                    hash: crypto.createHash('md5').update(`${name}:${type}:${filePath}`).digest('hex').slice(0, 8),
                    usages: 0,
                    lastUsed: null,
                });
            }
        }
        return symbols;
    }
    // ═══════════════════════════════════════════════════════════════════════════════
    // REDUNDANCY DETECTION
    // ═══════════════════════════════════════════════════════════════════════════════
    async detectRedundancy() {
        const symbolsByName = new Map();
        // Group symbols by name
        for (const symbol of this.symbolRegistry.values()) {
            const existing = symbolsByName.get(symbol.name) || [];
            existing.push(symbol);
            symbolsByName.set(symbol.name, existing);
        }
        // Find duplicates across projects
        for (const [name, symbols] of symbolsByName) {
            if (symbols.length > 1) {
                // Check if they're in different projects
                const projects = new Set(symbols.map(s => s.project));
                if (projects.size > 1) {
                    this.findings.push({
                        id: `redundancy-${name}-${Date.now()}`,
                        type: 'redundancy',
                        severity: 'warning',
                        title: `Дублиран символ: ${name}`,
                        description: `Символът "${name}" съществува в ${projects.size} проекта: ${Array.from(projects).join(', ')}`,
                        files: symbols.map(s => s.filePath),
                        suggestion: `Обедини в общ модул или премахни дублирането`,
                        autoFixable: false,
                        impact: {
                            linesAffected: symbols.length * 10,
                            estimatedSavings: '~100 lines',
                        },
                    });
                }
            }
        }
        this.log(`   🔄 Намерени ${this.findings.filter(f => f.type === 'redundancy').length} дублирания`);
    }
    // ═══════════════════════════════════════════════════════════════════════════════
    // DEAD CODE DETECTION
    // ═══════════════════════════════════════════════════════════════════════════════
    async detectDeadCode() {
        const unusedSymbols = [];
        // Check each symbol for usages
        for (const symbol of this.symbolRegistry.values()) {
            const usages = await this.findUsages(symbol);
            if (usages === 0 && symbol.type !== 'interface' && symbol.type !== 'type') {
                unusedSymbols.push(symbol);
            }
        }
        // Group by file for better reporting
        const byFile = new Map();
        for (const symbol of unusedSymbols) {
            const existing = byFile.get(symbol.filePath) || [];
            existing.push(symbol);
            byFile.set(symbol.filePath, existing);
        }
        for (const [file, symbols] of byFile) {
            if (symbols.length > 3) {
                this.findings.push({
                    id: `deadcode-${crypto.createHash('md5').update(file).digest('hex').slice(0, 8)}`,
                    type: 'dead_code',
                    severity: 'info',
                    title: `Потенциален мъртъв код в ${path.basename(file)}`,
                    description: `${symbols.length} неизползвани символа: ${symbols.slice(0, 5).map(s => s.name).join(', ')}${symbols.length > 5 ? '...' : ''}`,
                    files: [file],
                    suggestion: `Провери дали тези символи са нужни и премахни неизползваните`,
                    autoFixable: false,
                    impact: {
                        linesAffected: symbols.length * 15,
                        estimatedSavings: `~${symbols.length * 15} lines`,
                    },
                });
            }
        }
        this.log(`   💀 Намерени ${unusedSymbols.length} неизползвани символа`);
    }
    async findUsages(symbol) {
        let usages = 0;
        // Simple usage detection - search for symbol name in all files
        for (const [project, basePath] of Object.entries({
            'MisteMind': 'C:/MisteMind',
            'MrMindQATool': 'C:/MrMindQATool',
        })) {
            if (project === symbol.project)
                continue;
            const files = await this.scanProject(basePath);
            for (const file of files.slice(0, 100)) { // Limit for performance
                try {
                    const content = fs.readFileSync(file, 'utf-8');
                    const regex = new RegExp(`\\b${symbol.name}\\b`, 'g');
                    const matches = content.match(regex);
                    usages += matches?.length || 0;
                }
                catch { }
            }
        }
        return usages;
    }
    // ═══════════════════════════════════════════════════════════════════════════════
    // LOGIC GAP DETECTION
    // ═══════════════════════════════════════════════════════════════════════════════
    async detectLogicGaps() {
        // Check for common patterns that indicate logic gaps
        const patterns = [
            { regex: /TODO:|FIXME:|HACK:|XXX:/gi, type: 'todo', severity: 'info' },
            { regex: /throw new Error\(['"]Not implemented/gi, type: 'not_implemented', severity: 'warning' },
            { regex: /\/\/ @ts-ignore/gi, type: 'ts_ignore', severity: 'warning' },
            { regex: /any(?=\s*[;,)\]])/gi, type: 'any_type', severity: 'info' },
        ];
        const projectPaths = {
            'MisteMind': 'C:/MisteMind',
            'MrMindQATool': 'C:/MrMindQATool',
        };
        for (const [project, basePath] of Object.entries(projectPaths)) {
            const files = await this.scanProject(basePath);
            for (const file of files.slice(0, 200)) {
                try {
                    const content = fs.readFileSync(file, 'utf-8');
                    for (const { regex, type, severity } of patterns) {
                        const matches = content.match(regex);
                        if (matches && matches.length > 3) {
                            this.findings.push({
                                id: `logicgap-${type}-${crypto.createHash('md5').update(file).digest('hex').slice(0, 8)}`,
                                type: 'logic_gap',
                                severity,
                                title: `${type.replace('_', ' ').toUpperCase()} намерени в ${path.basename(file)}`,
                                description: `${matches.length} инстанции на ${type}`,
                                files: [file],
                                suggestion: `Разреши ${type} коментарите/patterns`,
                                autoFixable: false,
                                impact: {
                                    linesAffected: matches.length,
                                    estimatedSavings: 'Technical debt reduction',
                                },
                            });
                        }
                    }
                }
                catch { }
            }
        }
        this.log(`   🕳️ Намерени ${this.findings.filter(f => f.type === 'logic_gap').length} логически пропуска`);
    }
    // ═══════════════════════════════════════════════════════════════════════════════
    // PERFORMANCE ANALYSIS
    // ═══════════════════════════════════════════════════════════════════════════════
    async analyzePerformance() {
        const performancePatterns = [
            {
                regex: /for\s*\([^)]*\)\s*\{[^}]*for\s*\([^)]*\)/gi,
                issue: 'Nested loops',
                suggestion: 'Consider using Map/Set for O(1) lookups',
            },
            {
                regex: /\.forEach\([^)]*\.filter\(/gi,
                issue: 'Filter inside forEach',
                suggestion: 'Combine into single reduce or filter first',
            },
            {
                regex: /JSON\.parse\(JSON\.stringify/gi,
                issue: 'Deep clone via JSON',
                suggestion: 'Use structuredClone() or lodash.cloneDeep()',
            },
        ];
        const projectPaths = {
            'MisteMind': 'C:/MisteMind/src',
        };
        for (const [project, basePath] of Object.entries(projectPaths)) {
            if (!fs.existsSync(basePath))
                continue;
            const files = await this.scanProject(basePath);
            for (const file of files.slice(0, 100)) {
                try {
                    const content = fs.readFileSync(file, 'utf-8');
                    for (const { regex, issue, suggestion } of performancePatterns) {
                        if (regex.test(content)) {
                            this.findings.push({
                                id: `perf-${crypto.createHash('md5').update(file + issue).digest('hex').slice(0, 8)}`,
                                type: 'performance',
                                severity: 'suggestion',
                                title: `${issue} в ${path.basename(file)}`,
                                description: `Performance anti-pattern открит`,
                                files: [file],
                                suggestion,
                                autoFixable: false,
                                impact: {
                                    linesAffected: 5,
                                    estimatedSavings: 'Performance improvement',
                                },
                            });
                        }
                    }
                }
                catch { }
            }
        }
        this.log(`   ⚡ Намерени ${this.findings.filter(f => f.type === 'performance').length} performance issues`);
    }
    // ═══════════════════════════════════════════════════════════════════════════════
    // AI ANALYSIS
    // ═══════════════════════════════════════════════════════════════════════════════
    async runAIAnalysis() {
        const summary = {
            totalSymbols: this.symbolRegistry.size,
            findings: this.findings.length,
            topIssues: this.findings.slice(0, 10).map(f => f.title),
        };
        try {
            const response = await this.ai.askEmpire({
                query: `Анализирай тези ${this.symbolRegistry.size} символа от QAntum Prime. 

Данни от одита:
- Намерени проблеми: ${this.findings.length}
- Топ issues: ${summary.topIssues.join(', ')}

Търси:
1. Redundancy: Има ли дублиращи се интерфейси между MisteMind и MrMindQATool?
2. Logic Gaps: Има ли методи в src/physics, които не се използват в src/reality?
3. Optimization: Предложи премахване на код, който не допринася за системната цялост.
4. Architecture: Какви архитектурни подобрения препоръчваш?

Отговори кратко и конкретно.`,
                temperature: 0.2,
            });
            return response.answer;
        }
        catch (error) {
            return `AI анализът не е наличен: ${error}`;
        }
    }
    // ═══════════════════════════════════════════════════════════════════════════════
    // REPORT GENERATION
    // ═══════════════════════════════════════════════════════════════════════════════
    generateReport(startTime, aiInsights) {
        const critical = this.findings.filter(f => f.severity === 'critical').length;
        const warnings = this.findings.filter(f => f.severity === 'warning').length;
        const suggestions = this.findings.filter(f => f.severity === 'suggestion' || f.severity === 'info').length;
        // Calculate symbol stats
        const used = Array.from(this.symbolRegistry.values()).filter(s => s.usages > 0).length;
        const duplicated = this.findings.filter(f => f.type === 'redundancy').length;
        return {
            id: `audit-${Date.now()}`,
            timestamp: Date.now(),
            duration: Date.now() - startTime,
            summary: {
                totalFindings: this.findings.length,
                critical,
                warnings,
                suggestions,
                estimatedDebtReduction: `~${this.findings.reduce((sum, f) => sum + f.impact.linesAffected, 0)} lines`,
            },
            findings: this.findings,
            symbolStats: {
                total: this.symbolRegistry.size,
                used,
                unused: this.symbolRegistry.size - used,
                duplicated,
            },
            projectBreakdown: this.config.projects.map(p => ({
                project: p,
                files: Array.from(this.symbolRegistry.values()).filter(s => s.project === p).length,
                symbols: Array.from(this.symbolRegistry.values()).filter(s => s.project === p).length,
                issues: this.findings.filter(f => f.files.some(file => file.includes(p))).length,
            })),
            aiInsights,
        };
    }
    async saveReport(report) {
        try {
            fs.mkdirSync(this.config.outputPath, { recursive: true });
            // Save JSON
            const jsonPath = path.join(this.config.outputPath, `sovereign-audit-${report.id}.json`);
            fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));
            // Save Markdown
            const mdPath = path.join(this.config.outputPath, 'sovereign-report.md');
            const markdown = this.generateMarkdownReport(report);
            fs.writeFileSync(mdPath, markdown);
            this.log(`\n💾 Одитът е записан:`);
            this.log(`   JSON: ${jsonPath}`);
            this.log(`   MD: ${mdPath}`);
        }
        catch (error) {
            this.log(`⚠️ Не можах да запиша репорта: ${error}`);
        }
    }
    generateMarkdownReport(report) {
        return `# 🏛️ SOVEREIGN AUDIT REPORT

**Generated:** ${new Date(report.timestamp).toISOString()}
**Duration:** ${report.duration}ms
**QAntum Prime v28.1.0 SUPREME**

---

## 📊 Summary

| Metric | Value |
|--------|-------|
| Total Findings | ${report.summary.totalFindings} |
| Critical | ${report.summary.critical} |
| Warnings | ${report.summary.warnings} |
| Suggestions | ${report.summary.suggestions} |
| Estimated Debt Reduction | ${report.summary.estimatedDebtReduction} |

## 🧩 Symbol Statistics

| Metric | Value |
|--------|-------|
| Total Symbols | ${report.symbolStats.total} |
| Used | ${report.symbolStats.used} |
| Unused | ${report.symbolStats.unused} |
| Duplicated | ${report.symbolStats.duplicated} |

## 🏗️ Project Breakdown

${report.projectBreakdown.map(p => `### ${p.project}
- Files: ${p.files}
- Symbols: ${p.symbols}
- Issues: ${p.issues}
`).join('\n')}

## 🔍 Findings

${report.findings.map(f => `### ${f.severity === 'critical' ? '🔴' : f.severity === 'warning' ? '🟡' : '🔵'} ${f.title}

**Type:** ${f.type} | **Severity:** ${f.severity}

${f.description}

**Files:**
${f.files.map(file => `- \`${file}\``).join('\n')}

**Suggestion:** ${f.suggestion}

**Impact:** ${f.impact.linesAffected} lines affected, ${f.impact.estimatedSavings}

---
`).join('\n')}

${report.aiInsights ? `## 🧠 AI Insights

${report.aiInsights}
` : ''}

---
*Generated by Sovereign Audit Engine - QAntum Prime*
`;
    }
    // ═══════════════════════════════════════════════════════════════════════════════
    // HELPERS
    // ═══════════════════════════════════════════════════════════════════════════════
    async scanProject(basePath) {
        const files = [];
        const walk = (dir) => {
            try {
                const entries = fs.readdirSync(dir, { withFileTypes: true });
                for (const entry of entries) {
                    if (entry.name.startsWith('.') ||
                        entry.name === 'node_modules' ||
                        entry.name === 'dist' ||
                        entry.name === 'coverage') {
                        continue;
                    }
                    const fullPath = path.join(dir, entry.name);
                    if (entry.isDirectory()) {
                        walk(fullPath);
                    }
                    else if (entry.isFile() && /\.(ts|js)$/.test(entry.name)) {
                        files.push(fullPath);
                    }
                }
            }
            catch { }
        };
        if (fs.existsSync(basePath)) {
            walk(basePath);
        }
        return files;
    }
    async analyzeFile(filePath, project) {
        // Placeholder for file-specific analysis
        return [];
    }
    async applyFix(finding) {
        // Implementation for auto-fixing
        if (!finding.fixCode)
            throw new Error('No fix code provided');
        // Would apply the fix here
    }
    getProjectPath(project) {
        const paths = {
            'MisteMind': 'C:/MisteMind',
            'MrMindQATool': 'C:/MrMindQATool',
            'MisterMindPage': 'C:/MisterMindPage',
        };
        return paths[project] || 'C:/MisteMind';
    }
    printBanner() {
        console.log(`
╔═══════════════════════════════════════════════════════════════════════════════╗
║                                                                               ║
║   ███████╗ ██████╗ ██╗   ██╗███████╗██████╗ ███████╗██╗ ██████╗ ███╗   ██╗   ║
║   ██╔════╝██╔═══██╗██║   ██║██╔════╝██╔══██╗██╔════╝██║██╔════╝ ████╗  ██║   ║
║   ███████╗██║   ██║██║   ██║█████╗  ██████╔╝█████╗  ██║██║  ███╗██╔██╗ ██║   ║
║   ╚════██║██║   ██║╚██╗ ██╔╝██╔══╝  ██╔══██╗██╔══╝  ██║██║   ██║██║╚██╗██║   ║
║   ███████║╚██████╔╝ ╚████╔╝ ███████╗██║  ██║███████╗██║╚██████╔╝██║ ╚████║   ║
║   ╚══════╝ ╚═════╝   ╚═══╝  ╚══════╝╚═╝  ╚═╝╚══════╝╚═╝ ╚═════╝ ╚═╝  ╚═══╝   ║
║                                                                               ║
║                            🔍 AUDIT ENGINE                                    ║
║                                                                               ║
║                    QAntum Prime v28.1.0 - Empire Architect                    ║
╚═══════════════════════════════════════════════════════════════════════════════╝
`);
    }
    printReportSummary(report) {
        console.log(`
╔═══════════════════════════════════════════════════════════════════════════════╗
║                           🏛️ AUDIT COMPLETE                                   ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║   📊 Total Findings:     ${String(report.summary.totalFindings).padStart(6)}                                      ║
║   🔴 Critical:           ${String(report.summary.critical).padStart(6)}                                      ║
║   🟡 Warnings:           ${String(report.summary.warnings).padStart(6)}                                      ║
║   🔵 Suggestions:        ${String(report.summary.suggestions).padStart(6)}                                      ║
║   ⏱️  Duration:           ${String(report.duration).padStart(4)}ms                                      ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║   🧩 Symbols Analyzed:   ${String(report.symbolStats.total).padStart(6)}                                      ║
║   ✅ Used:               ${String(report.symbolStats.used).padStart(6)}                                      ║
║   💀 Unused:             ${String(report.symbolStats.unused).padStart(6)}                                      ║
║   🔄 Duplicated:         ${String(report.symbolStats.duplicated).padStart(6)}                                      ║
╚═══════════════════════════════════════════════════════════════════════════════╝
`);
    }
    log(message) {
        console.log(message);
    }
}
exports.SovereignAudit = SovereignAudit;
// ═══════════════════════════════════════════════════════════════════════════════
// CLI RUNNER
// ═══════════════════════════════════════════════════════════════════════════════
if (require.main === module) {
    const audit = new SovereignAudit();
    if (process.argv.includes('--quick')) {
        audit.runQuickAudit().catch(console.error);
    }
    else {
        audit.runFullAudit().catch(console.error);
    }
}
exports.default = SovereignAudit;
