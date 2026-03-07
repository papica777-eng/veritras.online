"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                               ║
 * ║   QAntum COGNITIVE CIRCULAR DEPENDENCY GUARD                                  ║
 * ║   "Интелигентно откриване на цикли с CognitionEngine"                        ║
 * ║                                                                               ║
 * ║   © 2025-2026 QAntum | Dimitar Prodromov                                        ║
 * ║                                                                               ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 *
 * Използва CognitionEngine за:
 * 1. Откриване на циклични зависимости
 * 2. Анализ на причините
 * 3. Предложения за решения
 * 4. Автоматично блокиране на commit-и
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
exports.createGuard = exports.CognitiveCircularGuard = void 0;
exports.runGuard = runGuard;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const index_1 = require("./index");
const distiller_1 = require("./distiller");
// ═══════════════════════════════════════════════════════════════════════════════
// COGNITIVE CIRCULAR GUARD
// ═══════════════════════════════════════════════════════════════════════════════
class CognitiveCircularGuard {
    config;
    cognition;
    distiller;
    constructor(config = {}) {
        this.config = {
            rootDir: process.cwd(),
            blockOnCycles: true,
            blockOnLayerViolations: true,
            useCognition: true,
            reportPath: './reports/circular-deps-report.json',
            verbose: true,
            ...config
        };
        this.cognition = new index_1.CognitionEngine({ verboseLogging: this.config.verbose }, { maxIterations: 2, satisfactionThreshold: 70 });
        this.distiller = (0, distiller_1.createDistiller)({
            rootDir: this.config.rootDir,
            outputPath: './data/distilled-knowledge.json',
            verbose: this.config.verbose
        });
    }
    // ─────────────────────────────────────────────────────────────────────────
    // ГЛАВЕН МЕТОД: CHECK
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Пълна проверка за циклични зависимости
     */
    // Complexity: O(1) — amortized
    async check() {
        this.log('\n' + '═'.repeat(70));
        this.log('🛡️ COGNITIVE CIRCULAR DEPENDENCY GUARD');
        this.log('═'.repeat(70) + '\n');
        // Стъпка 1: Дестилация на знание
        this.log('📊 Step 1: Distilling project knowledge...');
        // SAFETY: async operation — wrap in try-catch for production resilience
        const knowledge = await this.distiller.distill();
        // Стъпка 2: Извличане на цикли
        this.log('\n🔄 Step 2: Extracting cycles...');
        const cycles = this.processCycles(knowledge.importGraph.cycles);
        this.log(`   Found ${cycles.length} cycles`);
        // Стъпка 3: Извличане на layer violations
        this.log('\n⚠️ Step 3: Extracting layer violations...');
        const violations = this.processViolations(knowledge.importGraph.layerViolations);
        this.log(`   Found ${violations.length} violations`);
        // Стъпка 4: Когнитивен анализ (ако е включен)
        let analysis = null;
        if (this.config.useCognition && (cycles.length > 0 || violations.length > 0)) {
            this.log('\n🧠 Step 4: Cognitive analysis...');
            // SAFETY: async operation — wrap in try-catch for production resilience
            analysis = await this.analyzeWithCognition(cycles, violations);
        }
        // Стъпка 5: Генериране на препоръки
        this.log('\n💡 Step 5: Generating recommendations...');
        const recommendations = this.generateRecommendations(cycles, violations, analysis);
        // Стъпка 6: Определяне дали да блокираме commit
        const blockCommit = this.shouldBlockCommit(cycles, violations);
        const report = {
            hasCycles: cycles.length > 0,
            cycles,
            layerViolations: violations,
            analysis,
            recommendations,
            blockCommit
        };
        // Стъпка 7: Запазване на репорта
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.saveReport(report);
        // Стъпка 8: Показване на резултат
        this.printSummary(report);
        return report;
    }
    // ─────────────────────────────────────────────────────────────────────────
    // PROCESSING
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Обработва сурови цикли в структуриран формат
     */
    // Complexity: O(N) — linear iteration
    processCycles(rawCycles) {
        return rawCycles.map((cycle, index) => {
            const severity = this.determineCycleSeverity(cycle);
            return {
                files: cycle,
                severity,
                description: this.describeCycle(cycle),
                suggestedFix: this.suggestCycleFix(cycle)
            };
        });
    }
    /**
     * Обработва layer violations
     */
    // Complexity: O(N) — linear iteration
    processViolations(rawViolations) {
        return rawViolations.map(v => ({
            fromFile: v.from.file,
            fromLayer: v.from.layer,
            toFile: v.to.file,
            toLayer: v.to.layer,
            severity: v.severity
        }));
    }
    /**
     * Определя тежестта на цикъла
     */
    // Complexity: O(1)
    determineCycleSeverity(cycle) {
        const length = cycle.length;
        // Проверка за core файлове
        const hasCoreFiles = cycle.some(f => f.includes('/core/') || f.includes('/index.') || f.includes('/main.'));
        if (hasCoreFiles && length > 3)
            return 'critical';
        if (length > 5)
            return 'critical';
        if (length > 3)
            return 'high';
        if (length > 2)
            return 'medium';
        return 'low';
    }
    /**
     * Описва цикъла човешки четимо
     */
    // Complexity: O(N) — linear iteration
    describeCycle(cycle) {
        if (cycle.length === 2) {
            return `Direct mutual dependency between ${path.basename(cycle[0])} and ${path.basename(cycle[1])}`;
        }
        return `Circular chain of ${cycle.length} files: ${cycle.map(f => path.basename(f)).join(' → ')}`;
    }
    /**
     * Предлага решение за цикъла
     */
    // Complexity: O(1)
    suggestCycleFix(cycle) {
        if (cycle.length === 2) {
            return `Extract shared types to a separate file that both can import, or use dependency injection`;
        }
        return `Consider creating an interface/abstract layer that breaks the dependency chain. Move shared code to a lower-level module.`;
    }
    // ─────────────────────────────────────────────────────────────────────────
    // COGNITIVE ANALYSIS
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Анализира проблемите с CognitionEngine
     */
    // Complexity: O(N) — linear iteration
    async analyzeWithCognition(cycles, violations) {
        const problemDescription = this.buildProblemDescription(cycles, violations);
        const problem = {
            id: `circular_analysis_${Date.now()}`,
            description: problemDescription,
            context: {
                cycleCount: cycles.length,
                violationCount: violations.length,
                criticalCycles: cycles.filter(c => c.severity === 'critical').length
            },
            constraints: [
                'Must not break existing functionality',
                'Should minimize code changes',
                'Must maintain layer architecture'
            ],
            desiredOutcome: 'Eliminate all circular dependencies and layer violations',
            createdAt: new Date()
        };
        // SAFETY: async operation — wrap in try-catch for production resilience
        return await this.cognition.reason(problem);
    }
    /**
     * Изгражда описание на проблема
     */
    // Complexity: O(N*M) — nested iteration detected
    buildProblemDescription(cycles, violations) {
        const parts = [];
        if (cycles.length > 0) {
            parts.push(`Found ${cycles.length} circular dependencies:`);
            for (const cycle of cycles.slice(0, 3)) {
                parts.push(`  - ${cycle.description} (${cycle.severity})`);
            }
            if (cycles.length > 3) {
                parts.push(`  ... and ${cycles.length - 3} more`);
            }
        }
        if (violations.length > 0) {
            parts.push(`\nFound ${violations.length} layer violations:`);
            for (const v of violations.slice(0, 3)) {
                parts.push(`  - ${v.fromLayer} → ${v.toLayer}: ${v.fromFile}`);
            }
            if (violations.length > 3) {
                parts.push(`  ... and ${violations.length - 3} more`);
            }
        }
        return parts.join('\n');
    }
    // ─────────────────────────────────────────────────────────────────────────
    // RECOMMENDATIONS
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Генерира препоръки
     */
    // Complexity: O(N*M) — nested iteration detected
    generateRecommendations(cycles, violations, analysis) {
        const recommendations = [];
        // Препоръки от анализа на цикли
        for (const cycle of cycles) {
            recommendations.push(`[${cycle.severity.toUpperCase()}] ${cycle.suggestedFix}`);
        }
        // Препоръки за layer violations
        for (const v of violations) {
            if (v.severity === 'error') {
                recommendations.push(`[ERROR] ${v.fromFile}: Remove import from ${v.toFile} (${v.fromLayer} cannot depend on ${v.toLayer})`);
            }
        }
        // Препоръки от когнитивния анализ
        if (analysis) {
            for (const reason of analysis.reasoning.slice(0, 3)) {
                recommendations.push(`[COGNITIVE] ${reason}`);
            }
        }
        // Общи препоръки
        if (cycles.length > 5) {
            recommendations.push('[GENERAL] Consider a major refactoring to clean up the dependency graph');
        }
        if (violations.length > 10) {
            recommendations.push('[GENERAL] Layer architecture needs enforcement through ESLint rules');
        }
        return recommendations;
    }
    // ─────────────────────────────────────────────────────────────────────────
    // COMMIT BLOCKING
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Определя дали да блокира commit
     */
    // Complexity: O(N) — linear iteration
    shouldBlockCommit(cycles, violations) {
        if (!this.config.blockOnCycles && !this.config.blockOnLayerViolations) {
            return false;
        }
        // Блокиране при критични цикли
        if (this.config.blockOnCycles) {
            const criticalCycles = cycles.filter(c => c.severity === 'critical' || c.severity === 'high');
            if (criticalCycles.length > 0) {
                return true;
            }
        }
        // Блокиране при error-level violations
        if (this.config.blockOnLayerViolations) {
            const errorViolations = violations.filter(v => v.severity === 'error');
            if (errorViolations.length > 0) {
                return true;
            }
        }
        return false;
    }
    // ─────────────────────────────────────────────────────────────────────────
    // REPORTING
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Запазва репорта
     */
    // Complexity: O(1) — amortized
    async saveReport(report) {
        const dir = path.dirname(this.config.reportPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        // Сериализиране без analysis (може да е твърде голям)
        const reportToSave = {
            ...report,
            analysis: report.analysis ? {
                confidence: report.analysis.confidence,
                validationStatus: report.analysis.validationStatus,
                reasoning: report.analysis.reasoning
            } : null,
            timestamp: new Date().toISOString()
        };
        fs.writeFileSync(this.config.reportPath, JSON.stringify(reportToSave, null, 2), 'utf-8');
    }
    /**
     * Показва обобщение
     */
    // Complexity: O(N*M) — nested iteration detected
    printSummary(report) {
        console.log('\n' + '═'.repeat(70));
        console.log('📋 CIRCULAR DEPENDENCY GUARD SUMMARY');
        console.log('═'.repeat(70));
        // Цикли
        if (report.cycles.length === 0) {
            console.log('\n✅ No circular dependencies detected!');
        }
        else {
            console.log(`\n❌ Found ${report.cycles.length} circular dependencies:`);
            for (const cycle of report.cycles.slice(0, 5)) {
                const icon = cycle.severity === 'critical' ? '🔴' :
                    cycle.severity === 'high' ? '🟠' :
                        cycle.severity === 'medium' ? '🟡' : '🟢';
                console.log(`   ${icon} ${cycle.description}`);
            }
            if (report.cycles.length > 5) {
                console.log(`   ... and ${report.cycles.length - 5} more`);
            }
        }
        // Layer violations
        if (report.layerViolations.length === 0) {
            console.log('\n✅ No layer violations detected!');
        }
        else {
            console.log(`\n⚠️ Found ${report.layerViolations.length} layer violations:`);
            for (const v of report.layerViolations.slice(0, 5)) {
                const icon = v.severity === 'error' ? '🔴' : '🟡';
                console.log(`   ${icon} ${v.fromLayer} → ${v.toLayer}: ${v.fromFile}`);
            }
        }
        // Препоръки
        if (report.recommendations.length > 0) {
            console.log('\n💡 Recommendations:');
            for (const rec of report.recommendations.slice(0, 5)) {
                console.log(`   • ${rec}`);
            }
        }
        // Commit status
        console.log('\n' + '─'.repeat(70));
        if (report.blockCommit) {
            console.log('🚫 COMMIT BLOCKED - Fix the issues above before committing');
        }
        else {
            console.log('✅ COMMIT ALLOWED - No blocking issues found');
        }
        console.log('═'.repeat(70) + '\n');
    }
    // ─────────────────────────────────────────────────────────────────────────
    // PRE-COMMIT HOOK
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Изпълнява като pre-commit hook
     */
    // Complexity: O(1)
    async runAsPreCommitHook() {
        try {
            const report = await this.check();
            if (report.blockCommit) {
                console.error('\n🚫 COMMIT REJECTED by Cognitive Circular Guard');
                console.error('   Fix the circular dependencies and layer violations before committing.\n');
                return 1; // Exit code 1 = блокира commit
            }
            console.log('\n✅ COMMIT APPROVED by Cognitive Circular Guard\n');
            return 0; // Exit code 0 = позволява commit
        }
        catch (error) {
            console.error('Error in Cognitive Circular Guard:', error);
            return 0; // При грешка позволяваме commit
        }
    }
    // ─────────────────────────────────────────────────────────────────────────
    // UTILITIES
    // ─────────────────────────────────────────────────────────────────────────
    // Complexity: O(1) — hash/map lookup
    log(message) {
        if (this.config.verbose) {
            console.log(`[CognitiveGuard] ${message}`);
        }
    }
}
exports.CognitiveCircularGuard = CognitiveCircularGuard;
// ═══════════════════════════════════════════════════════════════════════════════
// CLI RUNNER
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * CLI entry point
 */
async function runGuard(args = []) {
    const config = {
        verbose: !args.includes('--quiet'),
        blockOnCycles: !args.includes('--no-block-cycles'),
        blockOnLayerViolations: !args.includes('--no-block-violations'),
        useCognition: !args.includes('--no-cognition')
    };
    const guard = new CognitiveCircularGuard(config);
    // SAFETY: async operation — wrap in try-catch for production resilience
    return await guard.runAsPreCommitHook();
}
// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════
const createGuard = (config) => {
    return new CognitiveCircularGuard(config);
};
exports.createGuard = createGuard;
exports.default = CognitiveCircularGuard;
// ═══════════════════════════════════════════════════════════════════════════════
// MAIN (when run directly)
// ═══════════════════════════════════════════════════════════════════════════════
if (require.main === module) {
    // Complexity: O(1)
    runGuard(process.argv.slice(2))
        .then(exitCode => process.exit(exitCode))
        .catch(err => {
        console.error(err);
        process.exit(1);
    });
}
