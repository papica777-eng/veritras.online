/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║   QANTUM LOGICAL INFERENCE ENGINE                                             ║
 * ║   "Дедуктивно и индуктивно разсъждение"                                       ║
 * ║   Modus Ponens, Modus Tollens, Syllogism, Abduction, Forward/Backward Chain   ║
 * ║   © 2025-2026 QAntum | Dimitar Prodromov                                      ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

export interface Proposition {
    id: string;
    content: string;
    confidence: number;
    source: 'axiom' | 'observation' | 'inference' | 'hypothesis';
    derivedFrom?: string[];
}

export interface Rule {
    id: string;
    name: string;
    type: RuleType;
    premises: string[];
    conclusion: string;
    confidence: number;
    applicability: number;
}

export type RuleType = 'modus_ponens' | 'modus_tollens' | 'syllogism' | 'generalization' | 'specialization' | 'analogy' | 'abduction';

export interface InferenceStep {
    ruleApplied: Rule;
    inputPropositions: Proposition[];
    outputProposition: Proposition;
    confidence: number;
    timestamp: string;
}

export interface InferenceResult {
    conclusion: Proposition | null;
    path: InferenceStep[];
    confidence: number;
    alternatives: Proposition[];
    explanation: string;
}

export interface KnowledgeBase {
    propositions: Map<string, Proposition>;
    rules: Rule[];
    inferences: InferenceStep[];
}

export class LogicalInferenceEngine {
    private kb: KnowledgeBase;
    private maxDepth: number;
    private maxIterations: number;

    constructor(options: { maxDepth?: number; maxIterations?: number } = {}) {
        this.maxDepth = options.maxDepth || 10;
        this.maxIterations = options.maxIterations || 100;
        this.kb = { propositions: new Map(), rules: this.getBuiltInRules(), inferences: [] };
    }

    // Complexity: O(N) — potential recursive descent
    addAxiom(content: string, confidence: number = 1.0): Proposition {
        const prop = this.createProposition(content, 'axiom', confidence);
        this.kb.propositions.set(prop.id, prop);
        return prop;
    }

    // Complexity: O(N) — potential recursive descent
    addObservation(content: string, confidence: number = 0.9): Proposition {
        const prop = this.createProposition(content, 'observation', confidence);
        this.kb.propositions.set(prop.id, prop);
        return prop;
    }

    // Complexity: O(N) — potential recursive descent
    addHypothesis(content: string, confidence: number = 0.5): Proposition {
        const prop = this.createProposition(content, 'hypothesis', confidence);
        this.kb.propositions.set(prop.id, prop);
        return prop;
    }

    // Complexity: O(1)
    addRule(rule: Omit<Rule, 'id' | 'applicability'>): void {
        this.kb.rules.push({ ...rule, id: `rule_${this.kb.rules.length + 1}`, applicability: 0 });
    }

    // Complexity: O(1) — hash/map lookup
    deduct(goal: string): InferenceResult {
        console.log(`\n[Deduction] Goal: ${goal}`);
        const path: InferenceStep[] = [];
        const visited = new Set<string>();
        const result = this.backwardChain(goal, path, visited, 0);
        return { conclusion: result, path, confidence: result?.confidence || 0, alternatives: this.findAlternatives(goal), explanation: this.generateExplanation(path) };
    }

    // Complexity: O(N) — linear iteration
    induct(observations: string[]): InferenceResult {
        console.log(`\n[Induction] From ${observations.length} observations`);
        const path: InferenceStep[] = [];
        const pattern = this.findCommonPattern(observations);
        if (!pattern) return { conclusion: null, path, confidence: 0, alternatives: [], explanation: 'No common pattern found' };

        const generalization = this.createProposition(pattern, 'inference', this.calculateInductiveConfidence(observations));
        const step: InferenceStep = {
            ruleApplied: this.kb.rules.find(r => r.type === 'generalization')!,
            inputPropositions: observations.map(o => this.kb.propositions.get(this.findProposition(o) || '') || this.createProposition(o, 'observation', 0.8)),
            outputProposition: generalization, confidence: generalization.confidence, timestamp: new Date().toISOString()
        };
        path.push(step);
        this.kb.propositions.set(generalization.id, generalization);
        return { conclusion: generalization, path, confidence: generalization.confidence, alternatives: [], explanation: this.generateExplanation(path) };
    }

    // Complexity: O(N*M) — nested iteration detected
    abduct(observation: string): InferenceResult {
        console.log(`\n[Abduction] Finding explanation for: ${observation}`);
        const path: InferenceStep[] = [];
        const candidates: Proposition[] = [];

        for (const rule of this.kb.rules) {
            if (this.matches(observation, rule.conclusion)) {
                for (const premise of rule.premises) {
                    candidates.push(this.createProposition(`${premise} (explains ${observation})`, 'hypothesis', rule.confidence * 0.8));
                }
            }
        }

        candidates.sort((a, b) => b.confidence - a.confidence);
        const bestExplanation = candidates[0];

        if (bestExplanation) {
            path.push({
                ruleApplied: this.kb.rules.find(r => r.type === 'abduction')!,
                inputPropositions: [this.createProposition(observation, 'observation', 0.9)],
                outputProposition: bestExplanation, confidence: bestExplanation.confidence, timestamp: new Date().toISOString()
            });
            this.kb.propositions.set(bestExplanation.id, bestExplanation);
        }

        return { conclusion: bestExplanation || null, path, confidence: bestExplanation?.confidence || 0, alternatives: candidates.slice(1), explanation: this.generateExplanation(path) };
    }

    // Complexity: O(N*M) — nested iteration detected
    forwardChain(): Proposition[] {
        const newInferences: Proposition[] = [];
        let iterations = 0, changed = true;

        while (changed && iterations < this.maxIterations) {
            changed = false; iterations++;
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
                        this.kb.inferences.push({ ruleApplied: rule, inputPropositions: binding, outputProposition: newProp, confidence: newProp.confidence, timestamp: new Date().toISOString() });
                    }
                }
            }
        }
        console.log(`[ForwardChain] Generated ${newInferences.length} new inferences in ${iterations} iterations`);
        return newInferences;
    }

    // Complexity: O(1) — hash/map lookup
    query(proposition: string): { isTrue: boolean; confidence: number; derivation?: InferenceStep[] } {
        const direct = this.findProposition(proposition);
        if (direct) { const prop = this.kb.propositions.get(direct)!; return { isTrue: true, confidence: prop.confidence }; }
        const result = this.deduct(proposition);
        return { isTrue: result.conclusion !== null, confidence: result.confidence, derivation: result.path };
    }

    // Complexity: O(N log N) — sort operation
    findAll(pattern: string): Proposition[] {
        const results: Proposition[] = [];
        for (const prop of this.kb.propositions.values()) { if (this.matches(prop.content, pattern)) results.push(prop); }
        return results.sort((a, b) => b.confidence - a.confidence);
    }

    // Complexity: O(N*M) — nested iteration detected
    private backwardChain(goal: string, path: InferenceStep[], visited: Set<string>, depth: number): Proposition | null {
        if (depth > this.maxDepth) return null;
        const goalHash = this.hash(goal);
        if (visited.has(goalHash)) return null;
        visited.add(goalHash);

        const directId = this.findProposition(goal);
        if (directId) return this.kb.propositions.get(directId)!;

        for (const rule of this.kb.rules) {
            if (this.matches(goal, rule.conclusion)) {
                const premiseResults: Proposition[] = [];
                let allOk = true;
                for (const premise of rule.premises) {
                    const r = this.backwardChain(premise, path, visited, depth + 1);
                    if (r) premiseResults.push(r); else { allOk = false; break; }
                }
                if (allOk) {
                    const conclusion = this.createProposition(goal, 'inference', this.calculateRuleConfidence(rule, premiseResults));
                    conclusion.derivedFrom = premiseResults.map(p => p.id);
                    path.push({ ruleApplied: rule, inputPropositions: premiseResults, outputProposition: conclusion, confidence: conclusion.confidence, timestamp: new Date().toISOString() });
                    this.kb.propositions.set(conclusion.id, conclusion);
                    rule.applicability++;
                    return conclusion;
                }
            }
        }
        return null;
    }

    // Complexity: O(N) — potential recursive descent
    private createProposition(content: string, source: Proposition['source'], confidence: number): Proposition {
        return { id: this.hash(content), content, confidence: Math.min(1, Math.max(0, confidence)), source };
    }

    // Complexity: O(N) — linear iteration
    private hash(content: string): string {
        let hash = 0;
        for (let i = 0; i < content.length; i++) { const c = content.charCodeAt(i); hash = ((hash << 5) - hash) + c; hash = hash & hash; }
        return `prop_${Math.abs(hash)}`;
    }

    // Complexity: O(N) — linear iteration
    private findProposition(content: string): string | undefined {
        const h = this.hash(content);
        if (this.kb.propositions.has(h)) return h;
        for (const [id, prop] of this.kb.propositions) { if (this.matches(prop.content, content)) return id; }
        return undefined;
    }

    // Complexity: O(1)
    private matches(content: string, pattern: string): boolean {
        const regex = new RegExp('^' + pattern.replace(/\?/g, '\\w+').replace(/\*/g, '.*') + '$', 'i');
        return regex.test(content);
    }

    // Complexity: O(N*M) — nested iteration detected
    private findMatchingPropositions(premises: string[]): Proposition[][] {
        if (premises.length === 0) return [[]];
        const firstMatches = this.findAll(premises[0]);
        if (premises.length === 1) return firstMatches.map(m => [m]);
        const restMatches = this.findMatchingPropositions(premises.slice(1));
        const combined: Proposition[][] = [];
        for (const first of firstMatches) for (const rest of restMatches) combined.push([first, ...rest]);
        return combined;
    }

    // Complexity: O(1)
    private instantiate(template: string, _binding: Proposition[]): string { return template; }
    // Complexity: O(N) — linear iteration
    private calculateRuleConfidence(rule: Rule, premises: Proposition[]): number { return rule.confidence * premises.reduce((acc, p) => acc * p.confidence, 1); }
    // Complexity: O(1)
    private calculateInductiveConfidence(observations: string[]): number { return Math.min(0.9, 0.5 + (observations.length * 0.1)); }

    // Complexity: O(N) — linear iteration
    private findCommonPattern(observations: string[]): string | null {
        if (observations.length === 0) return null;
        if (observations.length === 1) return observations[0];
        const wordSets = observations.map(o => new Set(o.toLowerCase().split(/\W+/)));
        const common = [...wordSets[0]].filter(word => wordSets.every(set => set.has(word)));
        return common.length > 0 ? `Pattern involving: ${common.join(', ')}` : null;
    }

    // Complexity: O(N) — linear iteration
    private findAlternatives(goal: string): Proposition[] {
        return this.findAll('*' + goal.split(' ').pop()).filter(p => p.content !== goal);
    }

    // Complexity: O(N) — linear iteration
    private generateExplanation(path: InferenceStep[]): string {
        if (path.length === 0) return 'No inference path';
        const lines: string[] = ['Inference path:'];
        for (let i = 0; i < path.length; i++) {
            const step = path[i];
            lines.push(`${i + 1}. Applied ${step.ruleApplied.name}`);
            lines.push(`   From: ${step.inputPropositions.map(p => p.content).join(', ')}`);
            lines.push(`   Concluded: ${step.outputProposition.content} (conf: ${step.confidence.toFixed(2)})`);
        }
        return lines.join('\n');
    }

    // Complexity: O(1)
    private getBuiltInRules(): Rule[] {
        return [
            { id: 'builtin_modus_ponens', name: 'Modus Ponens', type: 'modus_ponens', premises: ['P', 'P implies Q'], conclusion: 'Q', confidence: 1.0, applicability: 0 },
            { id: 'builtin_modus_tollens', name: 'Modus Tollens', type: 'modus_tollens', premises: ['not Q', 'P implies Q'], conclusion: 'not P', confidence: 1.0, applicability: 0 },
            { id: 'builtin_syllogism', name: 'Hypothetical Syllogism', type: 'syllogism', premises: ['P implies Q', 'Q implies R'], conclusion: 'P implies R', confidence: 1.0, applicability: 0 },
            { id: 'builtin_generalization', name: 'Inductive Generalization', type: 'generalization', premises: ['example 1', 'example 2', 'example 3'], conclusion: 'general rule', confidence: 0.7, applicability: 0 },
            { id: 'builtin_abduction', name: 'Abductive Reasoning', type: 'abduction', premises: ['observation'], conclusion: 'best explanation', confidence: 0.6, applicability: 0 },
        ];
    }

    // Complexity: O(N) — linear iteration
    getStats() {
        const props = [...this.kb.propositions.values()];
        return { propositions: props.length, axioms: props.filter(p => p.source === 'axiom').length, inferences: props.filter(p => p.source === 'inference').length, rules: this.kb.rules.length, avgConfidence: props.reduce((acc, p) => acc + p.confidence, 0) / (props.length || 1) };
    }
}

export const createInferenceEngine = (options?: { maxDepth?: number; maxIterations?: number }): LogicalInferenceEngine => new LogicalInferenceEngine(options);
export default LogicalInferenceEngine;
