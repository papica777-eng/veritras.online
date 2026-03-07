"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                               ║
 * ║   SELF-CRITIQUE TEST: KNOWLEDGE DISTILLER                                     ║
 * ║   "Системата анализира собствения си код"                                     ║
 * ║                                                                               ║
 * ║   © 2025-2026 QAntum | Dimitar Prodromov                                        ║
 * ║                                                                               ║
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CODE_DIMENSIONS = void 0;
exports.critiqueDistiller = critiqueDistiller;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const self_critique_1 = require("./self-critique");
// ═══════════════════════════════════════════════════════════════════════════════
// CUSTOM DIMENSIONS FOR CODE ANALYSIS
// ═══════════════════════════════════════════════════════════════════════════════
const CODE_DIMENSIONS = [
    {
        name: 'TypeSafety',
        weight: 0.25,
        evaluator: (code) => {
            let score = 50;
            // Положителни индикатори
            const typeAnnotations = (code.match(/:\s*\w+(\[\])?(\s*\|)?/g) || []).length;
            score += Math.min(typeAnnotations * 2, 30);
            // Интерфейси и типове
            const interfaces = (code.match(/interface\s+\w+/g) || []).length;
            const types = (code.match(/type\s+\w+/g) || []).length;
            score += (interfaces + types) * 3;
            // Негативни индикатори
            const anyUsage = (code.match(/:\s*any\b/g) || []).length;
            score -= anyUsage * 10;
            return {
                name: 'TypeSafety',
                score: Math.max(0, Math.min(100, score)),
                weight: 0.25,
                feedback: `${typeAnnotations} type annotations, ${anyUsage} 'any' usages`
            };
        }
    },
    {
        name: 'ErrorHandling',
        weight: 0.20,
        evaluator: (code) => {
            let score = 40;
            const tryCatch = (code.match(/try\s*\{/g) || []).length;
            score += tryCatch * 10;
            const errorTypes = (code.match(/catch\s*\(\s*\w+:\s*\w+/g) || []).length;
            score += errorTypes * 5;
            // Проверка за голи catch блокове
            const emptyCatch = (code.match(/catch\s*\(\s*\w*\s*\)\s*\{\s*\}/g) || []).length;
            score -= emptyCatch * 15;
            return {
                name: 'ErrorHandling',
                score: Math.max(0, Math.min(100, score)),
                weight: 0.20,
                feedback: `${tryCatch} try-catch blocks, ${emptyCatch} empty catches`
            };
        }
    },
    {
        name: 'Documentation',
        weight: 0.15,
        evaluator: (code) => {
            let score = 30;
            // JSDoc коментари
            const jsdoc = (code.match(/\/\*\*[\s\S]*?\*\//g) || []).length;
            score += jsdoc * 5;
            // Inline коментари
            const comments = (code.match(/\/\/\s*.+/g) || []).length;
            score += Math.min(comments, 20);
            // Функции без документация
            const functions = (code.match(/(?:async\s+)?function\s+\w+|(?:async\s+)?\w+\s*=\s*(?:async\s*)?\(/g) || []).length;
            const undocumented = Math.max(0, functions - jsdoc);
            score -= undocumented * 3;
            return {
                name: 'Documentation',
                score: Math.max(0, Math.min(100, score)),
                weight: 0.15,
                feedback: `${jsdoc} JSDoc blocks, ${comments} inline comments`
            };
        }
    },
    {
        name: 'Modularity',
        weight: 0.20,
        evaluator: (code) => {
            let score = 50;
            // Експорти
            const exports = (code.match(/export\s+(const|function|class|interface|type)/g) || []).length;
            score += Math.min(exports * 3, 20);
            // Дължина на функции (опростено)
            const longFunctions = (code.match(/\{[^{}]{2000,}\}/g) || []).length;
            score -= longFunctions * 15;
            // Single responsibility indicators
            const classCount = (code.match(/class\s+\w+/g) || []).length;
            const methodsPerClass = code.length / (classCount || 1) / 1000;
            if (methodsPerClass > 5)
                score -= 10;
            return {
                name: 'Modularity',
                score: Math.max(0, Math.min(100, score)),
                weight: 0.20,
                feedback: `${exports} exports, ${longFunctions} long function bodies`
            };
        }
    },
    {
        name: 'Performance',
        weight: 0.20,
        evaluator: (code) => {
            let score = 60;
            // Async patterns
            const asyncAwait = (code.match(/async\s+/g) || []).length;
            score += Math.min(asyncAwait * 2, 15);
            // Потенциални проблеми
            const nestedLoops = (code.match(/for.*\{[^}]*for/g) || []).length;
            score -= nestedLoops * 10;
            // Regex в цикли
            const regexInLoop = (code.match(/for.*new RegExp|while.*new RegExp/g) || []).length;
            score -= regexInLoop * 10;
            return {
                name: 'Performance',
                score: Math.max(0, Math.min(100, score)),
                weight: 0.20,
                feedback: `${asyncAwait} async functions, ${nestedLoops} nested loops`
            };
        }
    }
];
exports.CODE_DIMENSIONS = CODE_DIMENSIONS;
async function critiqueDistiller() {
    console.log('\n' + '═'.repeat(70));
    console.log('🔍 SELF-CRITIQUE: KNOWLEDGE DISTILLER');
    console.log('═'.repeat(70) + '\n');
    // Четене на distiller.ts
    const distillerPath = path.join(__dirname, 'distiller.ts');
    let code;
    try {
        code = fs.readFileSync(distillerPath, 'utf-8');
        console.log(`📄 Analyzing: ${distillerPath}`);
        console.log(`   Lines: ${code.split('\n').length}`);
        console.log(`   Size: ${(code.length / 1024).toFixed(1)} KB\n`);
    }
    catch (e) {
        console.error('❌ Could not read distiller.ts');
        return {
            file: distillerPath,
            score: 0,
            assessment: 'File not found',
            dimensions: [],
            weaknesses: ['File not accessible'],
            strengths: [],
            recommendations: ['Ensure distiller.ts exists']
        };
    }
    // Създаване на SelfCritique с custom dimensions
    const critique = (0, self_critique_1.createSelfCritique)({
        maxIterations: 1, // Само оценка, без подобрение
        satisfactionThreshold: 80,
        dimensions: CODE_DIMENSIONS,
        verbose: true
    });
    // Оценка
    const evaluation = critique.evaluate(code);
    // Критика
    const critiqueResult = critique.critique(code, evaluation);
    // Генериране на репорт
    const report = {
        file: 'src/cognition/distiller.ts',
        score: evaluation.score,
        assessment: evaluation.overallAssessment,
        dimensions: evaluation.dimensions.map(d => ({
            name: d.name,
            score: d.score,
            feedback: d.feedback
        })),
        weaknesses: critiqueResult.weaknesses.map(w => `[${w.severity.toUpperCase()}] ${w.dimension}: ${w.description}`),
        strengths: critiqueResult.strengths,
        recommendations: critiqueResult.improvementPriority.map(dim => `Improve ${dim}: ${critiqueResult.weaknesses.find(w => w.dimension === dim)?.suggestion || 'Review and enhance'}`)
    };
    // Показване на резултатите
    // Complexity: O(1)
    printReport(report);
    // Запазване на репорта
    const reportPath = './reports/distiller-critique.json';
    const reportDir = path.dirname(reportPath);
    if (!fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir, { recursive: true });
    }
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n💾 Report saved to: ${reportPath}`);
    return report;
}
function printReport(report) {
    console.log('\n' + '─'.repeat(70));
    console.log('📊 CRITIQUE RESULTS');
    console.log('─'.repeat(70));
    // Overall score
    const scoreColor = report.score >= 80 ? '✅' : report.score >= 60 ? '🟡' : '🔴';
    console.log(`\n${scoreColor} Overall Score: ${report.score.toFixed(1)}/100`);
    console.log(`   Assessment: ${report.assessment}`);
    // Dimensions
    console.log('\n📏 Dimension Scores:');
    for (const dim of report.dimensions) {
        const bar = '█'.repeat(Math.round(dim.score / 10)) + '░'.repeat(10 - Math.round(dim.score / 10));
        const icon = dim.score >= 70 ? '✅' : dim.score >= 50 ? '🟡' : '🔴';
        console.log(`   ${icon} ${dim.name.padEnd(15)} [${bar}] ${dim.score.toFixed(0)}%`);
        console.log(`      └─ ${dim.feedback}`);
    }
    // Weaknesses
    if (report.weaknesses.length > 0) {
        console.log('\n⚠️ Weaknesses:');
        for (const w of report.weaknesses) {
            console.log(`   • ${w}`);
        }
    }
    // Strengths
    if (report.strengths.length > 0) {
        console.log('\n💪 Strengths:');
        for (const s of report.strengths) {
            console.log(`   • ${s}`);
        }
    }
    // Recommendations
    if (report.recommendations.length > 0) {
        console.log('\n💡 Recommendations:');
        for (const r of report.recommendations) {
            console.log(`   • ${r}`);
        }
    }
    console.log('\n' + '═'.repeat(70));
}
// ═══════════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════════
if (require.main === module) {
    // Complexity: O(1)
    critiqueDistiller()
        .then(report => {
        process.exit(report.score >= 60 ? 0 : 1);
    })
        .catch(err => {
        console.error(err);
        process.exit(1);
    });
}
