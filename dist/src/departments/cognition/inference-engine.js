"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                               ║
 * ║   QAntum LOGICAL INFERENCE ENGINE                                             ║
 * ║   "Дедуктивно и индуктивно разсъждение"                                       ║
 * ║                                                                               ║
 * ║   TODO A #5 - Logical Inference Engine                                        ║
 * ║                                                                               ║
 * ║   © 2025-2026 QAntum | Dimitar Prodromov                                        ║
 * ║                                                                               ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInferenceEngine = exports.LogicalInferenceEngine = void 0;
// ═══════════════════════════════════════════════════════════════════════════════
// LOGICAL INFERENCE ENGINE
// ═══════════════════════════════════════════════════════════════════════════════
class LogicalInferenceEngine {
    kb;
    maxDepth;
    maxIterations;
    constructor(options = {}) {
        this.maxDepth = options.maxDepth || 10;
        this.maxIterations = options.maxIterations || 100;
        this.kb = {
            propositions: new Map(),
            rules: this.getBuiltInRules(),
            inferences: []
        };
    }
    // ─────────────────────────────────────────────────────────────────────────
    // KNOWLEDGE BASE OPERATIONS
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Добавяне на аксиома (безусловна истина)
     */
    // Complexity: O(N) — potential recursive descent
    addAxiom(content, confidence = 1.0) {
        const prop = this.createProposition(content, 'axiom', confidence);
        this.kb.propositions.set(prop.id, prop);
        return prop;
    }
    /**
     * Добавяне на наблюдение
     */
    // Complexity: O(N) — potential recursive descent
    addObservation(content, confidence = 0.9) {
        const prop = this.createProposition(content, 'observation', confidence);
        this.kb.propositions.set(prop.id, prop);
        return prop;
    }
    /**
     * Добавяне на хипотеза
     */
    // Complexity: O(N) — potential recursive descent
    addHypothesis(content, confidence = 0.5) {
        const prop = this.createProposition(content, 'hypothesis', confidence);
        this.kb.propositions.set(prop.id, prop);
        return prop;
    }
    /**
     * Добавяне на правило
     */
    // Complexity: O(1)
    addRule(rule) {
        const newRule = {
            ...rule,
            id: `rule_${this.kb.rules.length + 1}`,
            applicability: 0
        };
        this.kb.rules.push(newRule);
    }
    // ─────────────────────────────────────────────────────────────────────────
    // INFERENCE OPERATIONS
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Дедуктивно разсъждение - от общо към конкретно
     */
    // Complexity: O(1) — hash/map lookup
    deduct(goal) {
        console.log(`\n[Deduction] Goal: ${goal}`);
        const path = [];
        const visited = new Set();
        const result = this.backwardChain(goal, path, visited, 0);
        return {
            conclusion: result,
            path,
            confidence: result?.confidence || 0,
            alternatives: this.findAlternatives(goal),
            explanation: this.generateExplanation(path)
        };
    }
    /**
     * Индуктивно разсъждение - от конкретни примери към общо
     */
    // Complexity: O(N) — linear iteration
    induct(observations) {
        console.log(`\n[Induction] From ${observations.length} observations`);
        const path = [];
        // Намиране на общ модел
        const pattern = this.findCommonPattern(observations);
        if (!pattern) {
            return {
                conclusion: null,
                path,
                confidence: 0,
                alternatives: [],
                explanation: 'No common pattern found in observations'
            };
        }
        // Създаване на генерализирано твърдение
        const generalization = this.createProposition(pattern, 'inference', this.calculateInductiveConfidence(observations));
        const step = {
            ruleApplied: this.kb.rules.find(r => r.type === 'generalization'),
            inputPropositions: observations.map(o => this.kb.propositions.get(this.findProposition(o)) ||
                this.createProposition(o, 'observation', 0.8)),
            outputProposition: generalization,
            confidence: generalization.confidence,
            timestamp: new Date().toISOString()
        };
        path.push(step);
        this.kb.propositions.set(generalization.id, generalization);
        return {
            conclusion: generalization,
            path,
            confidence: generalization.confidence,
            alternatives: [],
            explanation: this.generateExplanation(path)
        };
    }
    /**
     * Абдуктивно разсъждение - намиране на най-добро обяснение
     */
    // Complexity: O(N*M) — nested iteration detected
    abduct(observation) {
        console.log(`\n[Abduction] Finding explanation for: ${observation}`);
        const path = [];
        const candidates = [];
        // Търсене на правила, чието заключение съвпада с наблюдението
        for (const rule of this.kb.rules) {
            if (this.matches(observation, rule.conclusion)) {
                // Проверка дали предпоставките могат да обяснят наблюдението
                for (const premise of rule.premises) {
                    const explanation = this.createProposition(`${premise} (explains ${observation})`, 'hypothesis', rule.confidence * 0.8);
                    candidates.push(explanation);
                }
            }
        }
        // Сортиране по confidence
        candidates.sort((a, b) => b.confidence - a.confidence);
        const bestExplanation = candidates[0];
        if (bestExplanation) {
            const step = {
                ruleApplied: this.kb.rules.find(r => r.type === 'abduction'),
                inputPropositions: [this.createProposition(observation, 'observation', 0.9)],
                outputProposition: bestExplanation,
                confidence: bestExplanation.confidence,
                timestamp: new Date().toISOString()
            };
            path.push(step);
            this.kb.propositions.set(bestExplanation.id, bestExplanation);
        }
        return {
            conclusion: bestExplanation || null,
            path,
            confidence: bestExplanation?.confidence || 0,
            alternatives: candidates.slice(1),
            explanation: this.generateExplanation(path)
        };
    }
    /**
     * Forward chaining - от факти към изводи
     */
    // Complexity: O(N*M) — nested iteration detected
    forwardChain() {
        const newInferences = [];
        let iterations = 0;
        let changed = true;
        while (changed && iterations < this.maxIterations) {
            changed = false;
            iterations++;
            for (const rule of this.kb.rules) {
                const bindings = this.findMatchingPropositions(rule.premises);
                for (const binding of bindings) {
                    const conclusion = this.instantiate(rule.conclusion, binding);
                    if (!this.kb.propositions.has(this.hash(conclusion))) {
                        const newProp = this.createProposition(conclusion, 'inference', this.calculateRuleConfidence(rule, binding));
                        newProp.derivedFrom = binding.map(p => p.id);
                        this.kb.propositions.set(newProp.id, newProp);
                        newInferences.push(newProp);
                        rule.applicability++;
                        changed = true;
                        this.kb.inferences.push({
                            ruleApplied: rule,
                            inputPropositions: binding,
                            outputProposition: newProp,
                            confidence: newProp.confidence,
                            timestamp: new Date().toISOString()
                        });
                    }
                }
            }
        }
        console.log(`[ForwardChain] Generated ${newInferences.length} new inferences in ${iterations} iterations`);
        return newInferences;
    }
    // ─────────────────────────────────────────────────────────────────────────
    // QUERY
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Проверка дали твърдение е вярно
     */
    // Complexity: O(1) — hash/map lookup
    query(proposition) {
        // Директно съществуване
        const direct = this.findProposition(proposition);
        if (direct) {
            const prop = this.kb.propositions.get(direct);
            return { isTrue: true, confidence: prop.confidence };
        }
        // Опит за извод
        const result = this.deduct(proposition);
        return {
            isTrue: result.conclusion !== null,
            confidence: result.confidence,
            derivation: result.path
        };
    }
    /**
     * Намиране на всички изводи за даден предикат
     */
    // Complexity: O(N log N) — sort operation
    findAll(pattern) {
        const results = [];
        for (const prop of this.kb.propositions.values()) {
            if (this.matches(prop.content, pattern)) {
                results.push(prop);
            }
        }
        return results.sort((a, b) => b.confidence - a.confidence);
    }
    // ─────────────────────────────────────────────────────────────────────────
    // PRIVATE: BACKWARD CHAINING
    // ─────────────────────────────────────────────────────────────────────────
    // Complexity: O(N*M) — nested iteration detected
    backwardChain(goal, path, visited, depth) {
        if (depth > this.maxDepth)
            return null;
        const goalHash = this.hash(goal);
        if (visited.has(goalHash))
            return null;
        visited.add(goalHash);
        // Проверка за директно съществуване
        const directId = this.findProposition(goal);
        if (directId) {
            return this.kb.propositions.get(directId);
        }
        // Търсене на правило, което може да изведе целта
        for (const rule of this.kb.rules) {
            if (this.matches(goal, rule.conclusion)) {
                const premiseResults = [];
                let allPremisesSatisfied = true;
                for (const premise of rule.premises) {
                    const premiseResult = this.backwardChain(premise, path, visited, depth + 1);
                    if (premiseResult) {
                        premiseResults.push(premiseResult);
                    }
                    else {
                        allPremisesSatisfied = false;
                        break;
                    }
                }
                if (allPremisesSatisfied) {
                    const conclusion = this.createProposition(goal, 'inference', this.calculateRuleConfidence(rule, premiseResults));
                    conclusion.derivedFrom = premiseResults.map(p => p.id);
                    const step = {
                        ruleApplied: rule,
                        inputPropositions: premiseResults,
                        outputProposition: conclusion,
                        confidence: conclusion.confidence,
                        timestamp: new Date().toISOString()
                    };
                    path.push(step);
                    this.kb.propositions.set(conclusion.id, conclusion);
                    rule.applicability++;
                    return conclusion;
                }
            }
        }
        return null;
    }
    // ─────────────────────────────────────────────────────────────────────────
    // PRIVATE HELPERS
    // ─────────────────────────────────────────────────────────────────────────
    // Complexity: O(N) — potential recursive descent
    createProposition(content, source, confidence) {
        return {
            id: this.hash(content),
            content,
            confidence: Math.min(1, Math.max(0, confidence)),
            source
        };
    }
    // Complexity: O(N) — linear iteration
    hash(content) {
        let hash = 0;
        for (let i = 0; i < content.length; i++) {
            const char = content.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return `prop_${Math.abs(hash)}`;
    }
    // Complexity: O(N) — linear iteration
    findProposition(content) {
        const targetHash = this.hash(content);
        if (this.kb.propositions.has(targetHash)) {
            return targetHash;
        }
        // Fuzzy match
        for (const [id, prop] of this.kb.propositions) {
            if (this.matches(prop.content, content)) {
                return id;
            }
        }
        return undefined;
    }
    // Complexity: O(1)
    matches(content, pattern) {
        // Простo съвпадение с wildcards
        const regex = new RegExp('^' + pattern.replace(/\?/g, '\\w+').replace(/\*/g, '.*') + '$', 'i');
        return regex.test(content);
    }
    // Complexity: O(N*M) — nested iteration detected
    findMatchingPropositions(premises) {
        if (premises.length === 0)
            return [[]];
        const firstMatches = this.findAll(premises[0]);
        if (premises.length === 1) {
            return firstMatches.map(m => [m]);
        }
        const restMatches = this.findMatchingPropositions(premises.slice(1));
        const combined = [];
        for (const first of firstMatches) {
            for (const rest of restMatches) {
                combined.push([first, ...rest]);
            }
        }
        return combined;
    }
    // Complexity: O(1)
    instantiate(template, binding) {
        // За сега просто връщаме template-а
        return template;
    }
    // Complexity: O(N) — linear iteration
    calculateRuleConfidence(rule, premises) {
        const premiseConfidence = premises.reduce((acc, p) => acc * p.confidence, 1);
        return rule.confidence * premiseConfidence;
    }
    // Complexity: O(1)
    calculateInductiveConfidence(observations) {
        // Повече наблюдения = по-висок confidence
        return Math.min(0.9, 0.5 + (observations.length * 0.1));
    }
    // Complexity: O(N) — linear iteration
    findCommonPattern(observations) {
        if (observations.length === 0)
            return null;
        if (observations.length === 1)
            return observations[0];
        // Намиране на общи думи
        const wordSets = observations.map(o => new Set(o.toLowerCase().split(/\W+/)));
        const common = [...wordSets[0]].filter(word => wordSets.every(set => set.has(word)));
        if (common.length > 0) {
            return `Pattern involving: ${common.join(', ')}`;
        }
        return null;
    }
    // Complexity: O(N) — linear iteration
    findAlternatives(goal) {
        return this.findAll('*' + goal.split(' ').pop()).filter(p => p.content !== goal);
    }
    // Complexity: O(N) — linear iteration
    generateExplanation(path) {
        if (path.length === 0)
            return 'No inference path';
        const lines = ['Inference path:'];
        for (let i = 0; i < path.length; i++) {
            const step = path[i];
            lines.push(`${i + 1}. Applied ${step.ruleApplied.name}`);
            lines.push(`   From: ${step.inputPropositions.map(p => p.content).join(', ')}`);
            lines.push(`   Concluded: ${step.outputProposition.content} (conf: ${step.confidence.toFixed(2)})`);
        }
        return lines.join('\n');
    }
    // Complexity: O(1) — amortized
    getBuiltInRules() {
        return [
            {
                id: 'builtin_modus_ponens',
                name: 'Modus Ponens',
                type: 'modus_ponens',
                premises: ['P', 'P implies Q'],
                conclusion: 'Q',
                confidence: 1.0,
                applicability: 0
            },
            {
                id: 'builtin_modus_tollens',
                name: 'Modus Tollens',
                type: 'modus_tollens',
                premises: ['not Q', 'P implies Q'],
                conclusion: 'not P',
                confidence: 1.0,
                applicability: 0
            },
            {
                id: 'builtin_syllogism',
                name: 'Hypothetical Syllogism',
                type: 'syllogism',
                premises: ['P implies Q', 'Q implies R'],
                conclusion: 'P implies R',
                confidence: 1.0,
                applicability: 0
            },
            {
                id: 'builtin_generalization',
                name: 'Inductive Generalization',
                type: 'generalization',
                premises: ['example 1', 'example 2', 'example 3'],
                conclusion: 'general rule',
                confidence: 0.7,
                applicability: 0
            },
            {
                id: 'builtin_abduction',
                name: 'Abductive Reasoning',
                type: 'abduction',
                premises: ['observation'],
                conclusion: 'best explanation',
                confidence: 0.6,
                applicability: 0
            }
        ];
    }
    // ─────────────────────────────────────────────────────────────────────────
    // STATS
    // ─────────────────────────────────────────────────────────────────────────
    // Complexity: O(N) — linear iteration
    getStats() {
        const props = [...this.kb.propositions.values()];
        return {
            propositions: props.length,
            axioms: props.filter(p => p.source === 'axiom').length,
            inferences: props.filter(p => p.source === 'inference').length,
            rules: this.kb.rules.length,
            avgConfidence: props.reduce((acc, p) => acc + p.confidence, 0) / (props.length || 1)
        };
    }
}
exports.LogicalInferenceEngine = LogicalInferenceEngine;
// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════
const createInferenceEngine = (options) => {
    return new LogicalInferenceEngine(options);
};
exports.createInferenceEngine = createInferenceEngine;
exports.default = LogicalInferenceEngine;
