"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                               ║
 * ║   QAntum CHAIN-OF-THOUGHT FRAMEWORK                                           ║
 * ║   "Разсъждение като Claude - стъпка по стъпка"                                ║
 * ║                                                                               ║
 * ║   © 2025-2026 QAntum | Dimitar Prodromov                                        ║
 * ║                                                                               ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 *
 * Архитектура на мислене:
 *
 *   PROBLEM → DECOMPOSE → ANALYZE → SYNTHESIZE → VALIDATE → SOLUTION
 *              ↓            ↓           ↓           ↓
 *           SubProblems  Analyses   Candidates   Confidence
 *              ↓            ↓           ↓           ↓
 *           (1..N)       (1..N)      (1..M)      (0.0-1.0)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createThoughtChain = exports.ThoughtChain = void 0;
// ═══════════════════════════════════════════════════════════════════════════════
// CHAIN-OF-THOUGHT ENGINE
// ═══════════════════════════════════════════════════════════════════════════════
class ThoughtChain {
    config;
    thoughtLog = [];
    memory = new Map();
    constructor(config = {}) {
        this.config = {
            maxSubProblems: 10,
            minConfidenceThreshold: 0.6,
            maxIterations: 5,
            verboseLogging: true,
            humanInLoop: false,
            memoryEnabled: true,
            ...config,
        };
    }
    // ─────────────────────────────────────────────────────────────────────────
    // ГЛАВЕН МЕТОД: SOLVE
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Главната функция - приема проблем, връща решение
     */
    // Complexity: O(1) — amortized
    async solve(problem) {
        this.log(`\n${'═'.repeat(70)}`);
        this.log(`🧠 CHAIN-OF-THOUGHT ACTIVATED`);
        this.log(`Problem: ${problem.description}`);
        this.log(`${'═'.repeat(70)}\n`);
        // СТЪПКА 1: ДЕКОМПОЗИЦИЯ
        this.log(`\n📦 PHASE 1: DECOMPOSITION`);
        // SAFETY: async operation — wrap in try-catch for production resilience
        const subProblems = await this.decompose(problem);
        this.log(`   → Generated ${subProblems.length} sub-problems`);
        // СТЪПКА 2: АНАЛИЗ
        this.log(`\n🔍 PHASE 2: ANALYSIS`);
        // SAFETY: async operation — wrap in try-catch for production resilience
        const analyses = await this.analyzeAll(subProblems);
        this.log(`   → Completed ${analyses.length} analyses`);
        // СТЪПКА 3: СИНТЕЗ
        this.log(`\n⚗️ PHASE 3: SYNTHESIS`);
        // SAFETY: async operation — wrap in try-catch for production resilience
        const candidates = await this.synthesize(analyses);
        this.log(`   → Generated ${candidates.length} solution candidates`);
        // СТЪПКА 4: ВАЛИДАЦИЯ
        this.log(`\n✅ PHASE 4: VALIDATION`);
        // SAFETY: async operation — wrap in try-catch for production resilience
        const solution = await this.validate(problem, candidates);
        this.log(`   → Final confidence: ${(solution.confidence * 100).toFixed(1)}%`);
        // СТЪПКА 5: ИЗВОД
        this.log(`\n${'═'.repeat(70)}`);
        this.log(`🎯 SOLUTION: ${solution.validationStatus.toUpperCase()}`);
        this.log(`${'═'.repeat(70)}\n`);
        return solution;
    }
    // ─────────────────────────────────────────────────────────────────────────
    // DECOMPOSE: Разбиване на проблема
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Разбива проблем на по-малки управляеми части
     */
    // Complexity: O(N) — linear iteration
    async decompose(problem) {
        const subProblems = [];
        // Стратегия 1: По компоненти
        const components = this.identifyComponents(problem);
        // Стратегия 2: По стъпки
        const steps = this.identifySteps(problem);
        // Стратегия 3: По ограничения
        const constraints = this.identifyConstraints(problem);
        // Комбиниране
        let order = 1;
        for (const component of components) {
            subProblems.push({
                id: `sub_${problem.id}_comp_${order}`,
                parentId: problem.id,
                description: component,
                complexity: this.assessComplexity(component),
                dependencies: [],
                order: order++,
            });
        }
        // Ограничаване до максимум
        const limited = subProblems.slice(0, this.config.maxSubProblems);
        // Сортиране по зависимости (топологично)
        return this.topologicalSort(limited);
    }
    /** Идентифицира компоненти в проблема */
    // Complexity: O(N) — linear iteration
    identifyComponents(problem) {
        const components = [];
        const desc = problem.description.toLowerCase();
        // Търсене на ключови думи за разбиване
        const patterns = [
            { regex: /\band\b/g, split: ' and ' },
            { regex: /,\s*/g, split: ', ' },
            { regex: /\bthen\b/g, split: ' then ' },
            { regex: /\bafter\b/g, split: ' after ' },
            { regex: /\bfirst\b.*\bthen\b/i, split: /first|then/i },
        ];
        // Базово разбиване
        if (problem.constraints?.length) {
            problem.constraints.forEach((c, i) => {
                components.push(`Handle constraint: ${c}`);
            });
        }
        // Ако няма разбиване, третираме като един компонент
        if (components.length === 0) {
            components.push(problem.description);
        }
        return components;
    }
    /** Идентифицира стъпки */
    // Complexity: O(1)
    identifySteps(problem) {
        const steps = [];
        // Стандартни стъпки за повечето проблеми
        steps.push(`Understand: ${problem.description}`);
        steps.push(`Plan: Design solution approach`);
        steps.push(`Implement: Execute the plan`);
        steps.push(`Verify: Check against desired outcome`);
        return steps;
    }
    /** Идентифицира ограничения */
    // Complexity: O(1)
    identifyConstraints(problem) {
        return problem.constraints || [];
    }
    /** Оценка на сложността */
    // Complexity: O(1)
    assessComplexity(description) {
        const words = description.split(/\s+/).length;
        const hasCode = /code|implement|create|build/i.test(description);
        const hasLogic = /if|when|unless|condition/i.test(description);
        if (words < 5 && !hasCode)
            return 'trivial';
        if (words < 10 && !hasLogic)
            return 'simple';
        if (words < 20)
            return 'moderate';
        if (words < 40 || hasCode)
            return 'complex';
        return 'extreme';
    }
    /** Топологично сортиране по зависимости */
    // Complexity: O(N log N) — sort operation
    topologicalSort(subProblems) {
        // Simplified: sort by order
        return [...subProblems].sort((a, b) => a.order - b.order);
    }
    // ─────────────────────────────────────────────────────────────────────────
    // ANALYZE: Анализ на всички подпроблеми
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Анализира всички подпроблеми
     */
    // Complexity: O(N) — linear iteration
    async analyzeAll(subProblems) {
        const analyses = [];
        for (const sub of subProblems) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            const analysis = await this.analyze(sub);
            analyses.push(analysis);
            this.log(`   • Analyzed: "${sub.description.slice(0, 50)}..." → ${analysis.possibleApproaches.length} approaches`);
        }
        return analyses;
    }
    /**
     * Анализира единичен подпроблем
     */
    // Complexity: O(N) — linear iteration
    async analyze(subProblem) {
        const insights = this.extractInsights(subProblem);
        const approaches = this.generateApproaches(subProblem, insights);
        const risks = this.identifyRisks(subProblem, approaches);
        // Изчисляване на увереност
        const avgFeasibility = approaches.reduce((sum, a) => sum + a.feasibility, 0) / approaches.length || 0;
        const riskPenalty = risks.filter((r) => r.impact === 'critical').length * 0.2;
        const confidence = Math.max(0, Math.min(1, avgFeasibility - riskPenalty));
        return {
            subProblemId: subProblem.id,
            insights,
            possibleApproaches: approaches,
            risks,
            estimatedEffort: this.estimateEffort(subProblem),
            confidence,
        };
    }
    /** Извличане на инсайти */
    // Complexity: O(1) — amortized
    extractInsights(subProblem) {
        const insights = [];
        const desc = subProblem.description;
        // Наблюдения
        insights.push({
            type: 'observation',
            content: `Task complexity: ${subProblem.complexity}`,
            relevance: 0.8,
        });
        // Търсене на patterns
        if (/async|await|promise/i.test(desc)) {
            insights.push({
                type: 'pattern',
                content: 'Async operation detected - consider error handling',
                relevance: 0.9,
            });
        }
        if (/database|storage|persist/i.test(desc)) {
            insights.push({
                type: 'pattern',
                content: 'Data persistence required - consider transactions',
                relevance: 0.85,
            });
        }
        // Предупреждения
        if (subProblem.complexity === 'extreme') {
            insights.push({
                type: 'warning',
                content: 'High complexity - consider further decomposition',
                relevance: 1.0,
            });
        }
        return insights;
    }
    /** Генериране на подходи */
    // Complexity: O(1) — amortized
    generateApproaches(subProblem, insights) {
        const approaches = [];
        // Подход 1: Директно решение
        approaches.push({
            name: 'Direct Implementation',
            description: 'Implement the solution directly with minimal abstraction',
            pros: ['Fast to implement', 'Easy to understand'],
            cons: ['May not scale', 'Harder to test'],
            feasibility: subProblem.complexity === 'trivial' ? 0.95 : 0.6,
        });
        // Подход 2: Абстрактно решение
        approaches.push({
            name: 'Abstracted Solution',
            description: 'Create reusable abstractions before solving',
            pros: ['Reusable', 'Testable', 'Scalable'],
            cons: ['Takes longer', 'May be over-engineered'],
            feasibility: subProblem.complexity === 'complex' ? 0.85 : 0.5,
        });
        // Подход 3: Инкрементален
        approaches.push({
            name: 'Incremental Approach',
            description: 'Solve in small iterations with validation at each step',
            pros: ['Low risk', 'Early feedback', 'Adaptable'],
            cons: ['Slower', 'Requires more planning'],
            feasibility: 0.75,
        });
        return approaches;
    }
    /** Идентифициране на рискове */
    // Complexity: O(1) — amortized
    identifyRisks(subProblem, approaches) {
        const risks = [];
        // Риск от сложност
        if (subProblem.complexity === 'extreme') {
            risks.push({
                description: 'Extreme complexity may lead to bugs',
                probability: 0.7,
                impact: 'high',
                mitigation: 'Additional testing and code review',
            });
        }
        // Риск от зависимости
        if (subProblem.dependencies.length > 2) {
            risks.push({
                description: 'Multiple dependencies increase coupling',
                probability: 0.5,
                impact: 'medium',
                mitigation: 'Use dependency injection',
            });
        }
        return risks;
    }
    /** Оценка на усилие */
    // Complexity: O(1)
    estimateEffort(subProblem) {
        const complexityMap = {
            trivial: 1,
            simple: 2,
            moderate: 4,
            complex: 7,
            extreme: 10,
        };
        return complexityMap[subProblem.complexity];
    }
    // ─────────────────────────────────────────────────────────────────────────
    // SYNTHESIZE: Синтез на решения
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Синтезира решения от анализите
     */
    // Complexity: O(N*M) — nested iteration detected
    async synthesize(analyses) {
        const candidates = [];
        // Намиране на най-добрите подходи от всеки анализ
        const bestApproaches = analyses
            .map((a) => {
            const sorted = [...a.possibleApproaches].sort((x, y) => y.feasibility - x.feasibility);
            return sorted[0];
        })
            .filter(Boolean);
        // Генериране на кандидат 1: Комбинация от най-добри подходи
        if (bestApproaches.length > 0) {
            const avgApproach = {
                name: 'Optimal Combination',
                description: 'Combines the best approach for each sub-problem',
                pros: bestApproaches.flatMap((a) => a.pros),
                cons: bestApproaches.flatMap((a) => a.cons),
                feasibility: bestApproaches.reduce((s, a) => s + a.feasibility, 0) / bestApproaches.length,
            };
            candidates.push({
                id: `candidate_optimal`,
                approach: avgApproach,
                steps: this.generateSteps(analyses, bestApproaches),
                explanation: 'This solution uses the highest feasibility approach for each sub-problem.',
                tradeoffs: ['Optimized for feasibility', 'May miss alternative perspectives'],
            });
        }
        // Генериране на кандидат 2: Безопасен подход
        candidates.push({
            id: `candidate_safe`,
            approach: {
                name: 'Conservative Approach',
                description: 'Prioritizes safety and testability over speed',
                pros: ['Low risk', 'Well tested'],
                cons: ['Slower implementation'],
                feasibility: 0.8,
            },
            steps: ['Plan thoroughly', 'Implement with tests', 'Review and refactor'],
            explanation: 'This solution prioritizes safety and reliability.',
            tradeoffs: ['More time investment', 'Higher confidence in result'],
        });
        return candidates;
    }
    /** Генериране на стъпки за решение */
    // Complexity: O(N) — linear iteration
    generateSteps(analyses, approaches) {
        const steps = [];
        steps.push('1. Initialize: Set up necessary dependencies and configuration');
        for (let i = 0; i < Math.min(analyses.length, 5); i++) {
            const analysis = analyses[i];
            const approach = approaches[i];
            steps.push(`${i + 2}. ${approach?.name || 'Step'}: Handle sub-problem ${i + 1}`);
        }
        steps.push(`${steps.length + 1}. Validate: Run tests and verify correctness`);
        steps.push(`${steps.length + 1}. Finalize: Clean up and document`);
        return steps;
    }
    // ─────────────────────────────────────────────────────────────────────────
    // VALIDATE: Валидация и избор на решение
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Валидира кандидатите и избира най-добрия
     */
    // Complexity: O(N log N) — sort operation
    async validate(problem, candidates) {
        if (candidates.length === 0) {
            return this.createUncertainSolution(problem);
        }
        // Скориране на кандидатите
        const scored = candidates.map((c) => ({
            candidate: c,
            score: this.scoreCandidate(c, problem),
        }));
        // Сортиране по резултат
        scored.sort((a, b) => b.score - a.score);
        const best = scored[0];
        // Определяне на статус
        let status;
        if (best.score >= this.config.minConfidenceThreshold) {
            status = 'validated';
        }
        else if (best.score >= 0.4) {
            status = 'needs_review';
        }
        else {
            status = 'uncertain';
        }
        // Генериране на reasoning
        const reasoning = this.generateReasoning(best.candidate, scored);
        return {
            problemId: problem.id,
            selectedCandidate: best.candidate,
            confidence: best.score,
            reasoning,
            uncertainties: this.identifyUncertainties(best.candidate),
            alternativesConsidered: candidates.length,
            validationStatus: status,
        };
    }
    /** Скориране на кандидат */
    // Complexity: O(1)
    scoreCandidate(candidate, problem) {
        let score = candidate.approach.feasibility;
        // Бонуси
        if (candidate.steps.length >= 3)
            score += 0.05; // Добре структуриран
        if (candidate.explanation.length > 50)
            score += 0.05; // Добре обяснен
        // Наказания
        if (candidate.tradeoffs.length > 3)
            score -= 0.1; // Много компромиси
        return Math.max(0, Math.min(1, score));
    }
    /** Генериране на reasoning */
    // Complexity: O(1)
    generateReasoning(selected, all) {
        const reasoning = [];
        reasoning.push(`Selected approach: "${selected.approach.name}" based on highest score`);
        reasoning.push(`Feasibility rating: ${(selected.approach.feasibility * 100).toFixed(0)}%`);
        reasoning.push(`Considered ${all.length} alternative(s)`);
        if (selected.approach.pros.length > 0) {
            reasoning.push(`Key advantages: ${selected.approach.pros.slice(0, 2).join(', ')}`);
        }
        if (selected.tradeoffs.length > 0) {
            reasoning.push(`Trade-offs accepted: ${selected.tradeoffs.slice(0, 2).join(', ')}`);
        }
        return reasoning;
    }
    /** Идентифициране на несигурности */
    // Complexity: O(1)
    identifyUncertainties(candidate) {
        const uncertainties = [];
        if (candidate.approach.feasibility < 0.7) {
            uncertainties.push('Feasibility below 70% - results may vary');
        }
        if (candidate.approach.cons.length > candidate.approach.pros.length) {
            uncertainties.push('More cons than pros - proceed with caution');
        }
        if (!candidate.code) {
            uncertainties.push('No code implementation provided - manual implementation required');
        }
        return uncertainties;
    }
    /** Създаване на несигурно решение */
    // Complexity: O(N)
    createUncertainSolution(problem) {
        return {
            problemId: problem.id,
            selectedCandidate: {
                id: 'fallback',
                approach: {
                    name: 'Manual Review Required',
                    description: 'Unable to generate confident solution',
                    pros: [],
                    cons: ['Requires human intervention'],
                    feasibility: 0,
                },
                steps: ['Request human review'],
                explanation: 'The system could not generate a confident solution for this problem.',
                tradeoffs: [],
            },
            confidence: 0,
            reasoning: ['No viable candidates generated', 'Human review recommended'],
            uncertainties: ['Full problem not understood', 'Insufficient context'],
            alternativesConsidered: 0,
            validationStatus: 'uncertain',
        };
    }
    // ─────────────────────────────────────────────────────────────────────────
    // UTILITIES
    // ─────────────────────────────────────────────────────────────────────────
    /** Logging */
    // Complexity: O(1) — hash/map lookup
    log(message) {
        this.thoughtLog.push(message);
        if (this.config.verboseLogging) {
            console.log(`[ThoughtChain] ${message}`);
        }
    }
    /** Вземане на лог */
    // Complexity: O(1)
    getThoughtLog() {
        return [...this.thoughtLog];
    }
    /** Изчистване на състоянието */
    // Complexity: O(1)
    reset() {
        this.thoughtLog = [];
        this.memory.clear();
    }
    /** Запазване в памет */
    // Complexity: O(1) — hash/map lookup
    remember(key, value) {
        if (this.config.memoryEnabled) {
            this.memory.set(key, value);
        }
    }
    /** Извличане от памет */
    // Complexity: O(1) — hash/map lookup
    recall(key) {
        return this.memory.get(key);
    }
}
exports.ThoughtChain = ThoughtChain;
// ═══════════════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════════════
const createThoughtChain = (config) => {
    return new ThoughtChain(config);
};
exports.createThoughtChain = createThoughtChain;
exports.default = ThoughtChain;
