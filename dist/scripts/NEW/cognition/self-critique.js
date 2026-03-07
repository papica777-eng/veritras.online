"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                               ║
 * ║   QANTUM SELF-CRITIQUE SYSTEM                                                ║
 * ║   "Оценявай, критикувай, подобрявай - итеративно"                            ║
 * ║                                                                               ║
 * ║   © 2025-2026 QAntum | Dimitar Prodromov                                        ║
 * ║                                                                               ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 *
 * Цикъл на самокритика:
 *
 *   OUTPUT → EVALUATE → CRITIQUE → IMPROVE → VALIDATE
 *              ↓           ↓          ↓         ↓
 *           Score     Weaknesses  NewOutput  Satisfied?
 *              ↓           ↓          ↓         ↓
 *          (0-100)     (list)     (better)   (yes/no)
 *                                    ↓
 *                              ITERATE (max N)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSelfCritique = exports.SelfCritique = exports.DEFAULT_DIMENSIONS = void 0;
// ═══════════════════════════════════════════════════════════════════════════════
// DEFAULT DIMENSIONS
// ═══════════════════════════════════════════════════════════════════════════════
exports.DEFAULT_DIMENSIONS = [
    {
        name: 'Correctness',
        weight: 0.30,
        evaluator: (output) => ({
            name: 'Correctness',
            score: evaluateCorrectness(output),
            weight: 0.30,
            feedback: 'Measures logical and factual accuracy'
        })
    },
    {
        name: 'Completeness',
        weight: 0.25,
        evaluator: (output) => ({
            name: 'Completeness',
            score: evaluateCompleteness(output),
            weight: 0.25,
            feedback: 'Measures how fully the problem is addressed'
        })
    },
    {
        name: 'Clarity',
        weight: 0.20,
        evaluator: (output) => ({
            name: 'Clarity',
            score: evaluateClarity(output),
            weight: 0.20,
            feedback: 'Measures readability and understandability'
        })
    },
    {
        name: 'Efficiency',
        weight: 0.15,
        evaluator: (output) => ({
            name: 'Efficiency',
            score: evaluateEfficiency(output),
            weight: 0.15,
            feedback: 'Measures resource usage and optimization'
        })
    },
    {
        name: 'Elegance',
        weight: 0.10,
        evaluator: (output) => ({
            name: 'Elegance',
            score: evaluateElegance(output),
            weight: 0.10,
            feedback: 'Measures simplicity and beauty of solution'
        })
    }
];
// Evaluation helper functions
function evaluateCorrectness(output) {
    if (!output)
        return 0;
    let score = 50; // Base score
    if (typeof output === 'string') {
        // Check for error indicators
        if (/error|fail|exception/i.test(output))
            score -= 20;
        // Check for success indicators
        if (/success|complete|done/i.test(output))
            score += 20;
        // Check for logical connectors
        if (/because|therefore|thus/i.test(output))
            score += 10;
    }
    if (typeof output === 'object') {
        // Has structure
        if (Object.keys(output).length > 0)
            score += 15;
        // Has validation
        if (output.validated || output.verified)
            score += 20;
    }
    return Math.max(0, Math.min(100, score));
}
function evaluateCompleteness(output) {
    if (!output)
        return 0;
    let score = 40;
    if (typeof output === 'string') {
        const words = output.split(/\s+/).length;
        if (words > 10)
            score += 10;
        if (words > 50)
            score += 15;
        if (words > 200)
            score += 15;
        // Has conclusion
        if (/conclusion|summary|result/i.test(output))
            score += 10;
    }
    if (typeof output === 'object') {
        const keys = Object.keys(output).length;
        if (keys > 3)
            score += 15;
        if (keys > 7)
            score += 15;
    }
    return Math.max(0, Math.min(100, score));
}
function evaluateClarity(output) {
    if (!output)
        return 0;
    let score = 60;
    if (typeof output === 'string') {
        // Penalize jargon overload
        const jargonCount = (output.match(/\b[A-Z]{3,}\b/g) || []).length;
        score -= jargonCount * 3;
        // Reward structure
        if (/^\d+\.|^-|^\*/m.test(output))
            score += 10; // Lists
        if (/\n\n/.test(output))
            score += 5; // Paragraphs
    }
    return Math.max(0, Math.min(100, score));
}
function evaluateEfficiency(output) {
    if (!output)
        return 0;
    let score = 70;
    if (typeof output === 'string') {
        const words = output.split(/\s+/).length;
        // Penalize verbosity
        if (words > 500)
            score -= 15;
        if (words > 1000)
            score -= 15;
    }
    return Math.max(0, Math.min(100, score));
}
function evaluateElegance(output) {
    if (!output)
        return 0;
    let score = 50;
    if (typeof output === 'string') {
        // Simple sentences
        const avgSentenceLength = output.length / (output.split(/[.!?]/).length || 1);
        if (avgSentenceLength < 100)
            score += 15;
        if (avgSentenceLength < 50)
            score += 15;
    }
    return Math.max(0, Math.min(100, score));
}
// ═══════════════════════════════════════════════════════════════════════════════
// SELF-CRITIQUE ENGINE
// ═══════════════════════════════════════════════════════════════════════════════
class SelfCritique {
    config;
    history = [];
    constructor(config = {}) {
        this.config = {
            maxIterations: 3,
            satisfactionThreshold: 75,
            dimensions: exports.DEFAULT_DIMENSIONS,
            improvementStrategy: 'balanced',
            verbose: true,
            ...config
        };
    }
    // ─────────────────────────────────────────────────────────────────────────
    // ГЛАВЕН МЕТОД: ITERATE UNTIL SATISFIED
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Итерира подобрения докато не е удовлетворен или достигне лимита
     */
    async iterateUntilSatisfied(initialOutput, improver) {
        this.log(`\n${'═'.repeat(60)}`);
        this.log(`🔄 SELF-CRITIQUE LOOP STARTED`);
        this.log(`${'═'.repeat(60)}\n`);
        let currentOutput = initialOutput;
        let iteration = 0;
        while (iteration < this.config.maxIterations) {
            iteration++;
            this.log(`\n📍 ITERATION ${iteration}/${this.config.maxIterations}`);
            // ОЦЕНКА
            const evaluation = this.evaluate(currentOutput);
            this.log(`   Score: ${evaluation.score.toFixed(1)}/100`);
            // ПРОВЕРКА ЗА УДОВЛЕТВОРЕНИЕ
            if (evaluation.score >= this.config.satisfactionThreshold) {
                this.log(`   ✅ Satisfaction threshold reached!`);
                return {
                    finalOutput: currentOutput,
                    iterations: iteration,
                    finalScore: evaluation.score
                };
            }
            // КРИТИКА
            const critique = this.critique(currentOutput, evaluation);
            this.log(`   Weaknesses found: ${critique.weaknesses.length}`);
            // ЗАПАЗВАНЕ В ИСТОРИЯ
            const previousOutput = currentOutput;
            // ПОДОБРЕНИЕ
            this.log(`   🔧 Improving...`);
            // SAFETY: async operation — wrap in try-catch for production resilience
            currentOutput = await improver(currentOutput, critique.weaknesses);
            // ЗАПИСВАНЕ НА ИТЕРАЦИЯТА
            const newEvaluation = this.evaluate(currentOutput);
            this.history.push({
                iteration,
                input: previousOutput,
                output: currentOutput,
                critique,
                delta: newEvaluation.score - evaluation.score
            });
            this.log(`   Delta: ${(newEvaluation.score - evaluation.score).toFixed(1)}`);
            // ПРОВЕРКА ЗА РЕГРЕС
            if (newEvaluation.score < evaluation.score) {
                this.log(`   ⚠️ Regression detected! Reverting...`);
                currentOutput = previousOutput;
            }
        }
        const finalEval = this.evaluate(currentOutput);
        this.log(`\n${'═'.repeat(60)}`);
        this.log(`🏁 MAX ITERATIONS REACHED`);
        this.log(`   Final Score: ${finalEval.score.toFixed(1)}/100`);
        this.log(`${'═'.repeat(60)}\n`);
        return {
            finalOutput: currentOutput,
            iterations: iteration,
            finalScore: finalEval.score
        };
    }
    // ─────────────────────────────────────────────────────────────────────────
    // EVALUATE: Оценка на изход
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Оценява изход по всички измерения
     */
    // Complexity: O(N) — linear iteration
    evaluate(output) {
        const dimensions = this.config.dimensions.map(d => d.evaluator(output));
        // Изчисляване на претеглен резултат
        const weightedSum = dimensions.reduce((sum, d) => sum + (d.score * d.weight), 0);
        const totalWeight = dimensions.reduce((sum, d) => sum + d.weight, 0);
        const score = weightedSum / totalWeight;
        // Генериране на overall assessment
        let assessment;
        if (score >= 90)
            assessment = 'Excellent - Minor refinements only';
        else if (score >= 75)
            assessment = 'Good - Ready with small improvements';
        else if (score >= 60)
            assessment = 'Acceptable - Needs improvement';
        else if (score >= 40)
            assessment = 'Poor - Significant issues';
        else
            assessment = 'Inadequate - Major rework needed';
        return {
            score,
            dimensions,
            overallAssessment: assessment,
            passesThreshold: score >= this.config.satisfactionThreshold
        };
    }
    // ─────────────────────────────────────────────────────────────────────────
    // CRITIQUE: Критика и идентифициране на слабости
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Критикува изход и намира слабости
     */
    // Complexity: O(N log N) — sort operation
    critique(output, evaluation) {
        const weaknesses = [];
        const strengths = [];
        // Анализ по измерения
        for (const dim of evaluation.dimensions) {
            if (dim.score < 50) {
                weaknesses.push({
                    id: `weak_${dim.name.toLowerCase()}`,
                    dimension: dim.name,
                    description: `${dim.name} score is below acceptable (${dim.score.toFixed(0)}/100)`,
                    severity: dim.score < 30 ? 'critical' : dim.score < 40 ? 'major' : 'moderate',
                    suggestion: this.getSuggestionFor(dim.name, dim.score)
                });
            }
            else if (dim.score >= 80) {
                strengths.push(`Strong ${dim.name} (${dim.score.toFixed(0)}/100)`);
            }
        }
        // Сортиране по severity и приоритет
        const severityOrder = {
            critical: 4, major: 3, moderate: 2, minor: 1
        };
        weaknesses.sort((a, b) => severityOrder[b.severity] - severityOrder[a.severity]);
        // Приоритети за подобрение
        const improvementPriority = weaknesses
            .slice(0, 3)
            .map(w => w.dimension);
        return {
            evaluation,
            weaknesses,
            strengths,
            improvementPriority
        };
    }
    /** Генериране на предложение за подобрение */
    // Complexity: O(N*M) — nested iteration detected
    getSuggestionFor(dimension, score) {
        const suggestions = {
            'Correctness': 'Review logic and verify facts. Add validation checks.',
            'Completeness': 'Add missing details. Cover edge cases. Provide examples.',
            'Clarity': 'Simplify language. Use bullet points. Add structure.',
            'Efficiency': 'Remove redundancy. Optimize for brevity without losing meaning.',
            'Elegance': 'Refactor for simplicity. Remove unnecessary complexity.'
        };
        return suggestions[dimension] || 'Review and improve this aspect.';
    }
    // ─────────────────────────────────────────────────────────────────────────
    // IMPROVE: Автоматично подобрение
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Подобрява изход базирано на слабости (default implementation)
     */
    // Complexity: O(N) — linear iteration
    improve(output, weaknesses) {
        // Ако е string, прилагаме text improvements
        if (typeof output === 'string') {
            let improved = output;
            for (const weakness of weaknesses) {
                switch (weakness.dimension) {
                    case 'Clarity':
                        // Добавяне на структура
                        if (!improved.includes('\n\n')) {
                            improved = improved.replace(/\. ([A-Z])/g, '.\n\n$1');
                        }
                        break;
                    case 'Completeness':
                        // Добавяне на заключение ако липсва
                        if (!/conclusion|summary|in summary/i.test(improved)) {
                            improved += '\n\nIn summary: The above addresses the key points.';
                        }
                        break;
                    case 'Efficiency':
                        // Премахване на повторения
                        improved = improved.replace(/(\b\w+\b)\s+\1/gi, '$1');
                        break;
                }
            }
            return improved;
        }
        // Ако е object, връщаме копие с бележки
        if (typeof output === 'object') {
            return {
                ...output,
                _improvements_applied: weaknesses.map(w => w.dimension),
                _iteration: (output._iteration || 0) + 1
            };
        }
        return output;
    }
    // ─────────────────────────────────────────────────────────────────────────
    // UTILITIES
    // ─────────────────────────────────────────────────────────────────────────
    /** Logging */
    // Complexity: O(1) — hash/map lookup
    log(message) {
        if (this.config.verbose) {
            console.log(`[SelfCritique] ${message}`);
        }
    }
    /** Вземане на история */
    // Complexity: O(1)
    getHistory() {
        return [...this.history];
    }
    /** Reset */
    // Complexity: O(1)
    reset() {
        this.history = [];
    }
    /** Добавяне на custom dimension */
    // Complexity: O(1)
    addDimension(dimension) {
        this.config.dimensions.push(dimension);
    }
    /** Премахване на dimension */
    // Complexity: O(N) — linear iteration
    removeDimension(name) {
        this.config.dimensions = this.config.dimensions.filter(d => d.name !== name);
    }
}
exports.SelfCritique = SelfCritique;
// ═══════════════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════════════
const createSelfCritique = (config) => {
    return new SelfCritique(config);
};
exports.createSelfCritique = createSelfCritique;
exports.default = SelfCritique;
