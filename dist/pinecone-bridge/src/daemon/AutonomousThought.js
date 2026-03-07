"use strict";
/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                              ║
 * ║        A U T O N O M O U S   T H O U G H T   v 3 4 . 1                        ║
 * ║          КОНТЕКСТУАЛНО ОСЪЗНАТО AI ВЗЕМАНЕ НА РЕШЕНИЯ                        ║
 * ║                                                                              ║
 * ║  "Мисля, следователно съществувам. Помня, следователно еволюирам."           ║
 * ║  "I think, therefore I am. I remember, therefore I evolve."                  ║
 * ║                                                                              ║
 * ║  Purpose: Make informed, context-aware decisions by actively leveraging      ║
 * ║           the vectorized eternal context from Pinecone. Each decision is     ║
 * ║           enriched with historical precedents and semantic understanding.    ║
 * ║                                                                              ║
 * ║  © 2025-2026 QAntum Empire | Dimitar Prodromov                               ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutonomousThought = exports.DecisionOutcome = exports.ThoughtType = void 0;
exports.createAutonomousThought = createAutonomousThought;
const events_1 = require("events");
const crypto_1 = require("crypto");
// ═══════════════════════════════════════════════════════════════════════════════
// TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════════
var ThoughtType;
(function (ThoughtType) {
    ThoughtType["STRATEGIC"] = "STRATEGIC";
    ThoughtType["TACTICAL"] = "TACTICAL";
    ThoughtType["REACTIVE"] = "REACTIVE";
    ThoughtType["PREDICTIVE"] = "PREDICTIVE";
    ThoughtType["DIAGNOSTIC"] = "DIAGNOSTIC";
    ThoughtType["CREATIVE"] = "CREATIVE";
    ThoughtType["CORRECTIVE"] = "CORRECTIVE";
    ThoughtType["EVOLUTIONARY"] = "EVOLUTIONARY";
})(ThoughtType || (exports.ThoughtType = ThoughtType = {}));
var DecisionOutcome;
(function (DecisionOutcome) {
    DecisionOutcome["EXECUTE"] = "EXECUTE";
    DecisionOutcome["DEFER"] = "DEFER";
    DecisionOutcome["ESCALATE"] = "ESCALATE";
    DecisionOutcome["REJECT"] = "REJECT";
    DecisionOutcome["INVESTIGATE"] = "INVESTIGATE";
    DecisionOutcome["ADAPT"] = "ADAPT";
})(DecisionOutcome || (exports.DecisionOutcome = DecisionOutcome = {}));
// ═══════════════════════════════════════════════════════════════════════════════
// AUTONOMOUS THOUGHT CLASS
// ═══════════════════════════════════════════════════════════════════════════════
class AutonomousThought extends events_1.EventEmitter {
    bridgeSystem;
    sessionId;
    // Configuration
    config;
    // History
    thoughtHistory = [];
    // Metrics
    metrics = {
        totalThoughts: 0,
        byType: {},
        byOutcome: {},
        averageConfidence: 0,
        averageDuration: 0,
        precedentsUsed: 0,
    };
    constructor(config) {
        super();
        this.bridgeSystem = config.bridgeSystem;
        this.sessionId = config.sessionId || `thought-${(0, crypto_1.randomUUID)().slice(0, 8)}`;
        this.config = {
            minConfidenceThreshold: config.minConfidenceThreshold ?? 0.5,
            maxHistoricalPrecedents: config.maxHistoricalPrecedents ?? 10,
            requirePrecedentForStrategic: config.requirePrecedentForStrategic ?? true,
            enableCreativeThinking: config.enableCreativeThinking ?? true,
            logThoughts: config.logThoughts ?? true,
        };
        // Initialize metrics
        Object.values(ThoughtType).forEach(t => this.metrics.byType[t] = 0);
        Object.values(DecisionOutcome).forEach(o => this.metrics.byOutcome[o] = 0);
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // MAIN THINKING INTERFACE
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Think about a situation and make a decision
     */
    async think(query, type, currentState, constraints) {
        const startTime = Date.now();
        if (this.config.logThoughts) {
            console.log(`\n🧠 [THOUGHT] Initiating ${type} thought: "${query.slice(0, 50)}..."`);
        }
        try {
            // Phase 1: Gather Context from Eternal Memory
            const context = await this.gatherContext(query, currentState, constraints);
            // Phase 2: Analyze Historical Precedents
            const precedents = await this.analyzeHistoricalPrecedents(context);
            context.historicalPrecedents = precedents;
            // Phase 3: Build Reasoning Chain
            const reasoning = await this.buildReasoningChain(query, type, context);
            // Phase 4: Make Decision
            const decision = await this.makeDecision(query, type, context, reasoning);
            // Phase 5: Calculate Confidence
            const confidence = this.calculateConfidence(context, reasoning, precedents);
            // Validate strategic decisions require precedent
            if (type === ThoughtType.STRATEGIC &&
                this.config.requirePrecedentForStrategic &&
                precedents.length === 0) {
                decision.outcome = DecisionOutcome.INVESTIGATE;
                decision.justification = 'No historical precedent found for strategic decision. Investigation required.';
            }
            // Validate confidence threshold
            if (confidence < this.config.minConfidenceThreshold) {
                decision.outcome = DecisionOutcome.DEFER;
                decision.justification = `Confidence ${(confidence * 100).toFixed(1)}% below threshold ${(this.config.minConfidenceThreshold * 100).toFixed(1)}%`;
            }
            const duration = Date.now() - startTime;
            const thought = {
                id: (0, crypto_1.randomUUID)(),
                type,
                query,
                context,
                reasoning,
                decision,
                confidence,
                timestamp: new Date(),
                duration,
            };
            // Store thought
            this.thoughtHistory.push(thought);
            this.updateMetrics(thought);
            // Persist to eternal memory
            await this.persistThought(thought);
            if (this.config.logThoughts) {
                console.log(`   ✅ Decision: ${decision.outcome} (confidence: ${(confidence * 100).toFixed(1)}%)`);
                console.log(`   📊 Precedents used: ${precedents.length}, Duration: ${duration}ms`);
            }
            this.emit('thought', thought);
            return thought;
        }
        catch (error) {
            const errorThought = {
                id: (0, crypto_1.randomUUID)(),
                type,
                query,
                context: {
                    query,
                    relatedVectors: [],
                    historicalPrecedents: [],
                    currentState: currentState || {},
                    constraints: constraints || [],
                },
                reasoning: {
                    steps: [],
                    conclusion: `Error during thought process: ${error.message}`,
                    alternativesConsidered: [],
                    risksIdentified: ['Process failure'],
                },
                decision: {
                    outcome: DecisionOutcome.ESCALATE,
                    action: 'ESCALATE_TO_OPERATOR',
                    parameters: { error: error.message },
                    justification: 'Thought process encountered an error',
                    expectedImpact: 'Unknown',
                },
                confidence: 0,
                timestamp: new Date(),
                duration: Date.now() - startTime,
            };
            this.emit('error', { thought: errorThought, error });
            return errorThought;
        }
    }
    /**
     * Quick tactical decision - less analysis, faster response
     */
    async quickDecision(query, currentState) {
        const thought = await this.think(query, ThoughtType.TACTICAL, currentState);
        return thought.decision;
    }
    /**
     * Strategic planning - deep analysis with precedents
     */
    async strategize(query, constraints) {
        return this.think(query, ThoughtType.STRATEGIC, {}, constraints);
    }
    /**
     * Diagnose a problem
     */
    async diagnose(problem, symptoms) {
        return this.think(`Diagnose: ${problem}. Symptoms: ${symptoms.join(', ')}`, ThoughtType.DIAGNOSTIC, { symptoms });
    }
    /**
     * Predict future state
     */
    async predict(scenario, variables) {
        return this.think(`Predict outcome for: ${scenario}`, ThoughtType.PREDICTIVE, variables);
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // CONTEXT GATHERING
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Gather context from eternal memory
     */
    async gatherContext(query, currentState, constraints) {
        // Query Pinecone for related vectors
        const queryResult = await this.bridgeSystem.query(query, {
            topK: 20,
            minScore: 0.4,
            sessionId: this.sessionId,
        });
        return {
            query,
            relatedVectors: queryResult.matches,
            historicalPrecedents: [], // Will be filled later
            currentState: currentState || {},
            constraints: constraints || [],
        };
    }
    /**
     * Analyze historical precedents from context
     */
    async analyzeHistoricalPrecedents(context) {
        const precedents = [];
        // Search for previous thoughts/decisions related to this context
        const previousDecisions = await this.bridgeSystem.query(`previous decision: ${context.query}`, { topK: this.config.maxHistoricalPrecedents, minScore: 0.6 });
        for (const match of previousDecisions.matches) {
            // Try to parse as a previous thought
            if (match.content.includes('Decision:') || match.content.includes('Outcome:')) {
                precedents.push({
                    id: match.id || (0, crypto_1.randomUUID)(),
                    similarity: match.score,
                    situation: match.content.slice(0, 200),
                    decision: this.extractDecision(match.content),
                    outcome: this.extractOutcome(match.content),
                    timestamp: match.metadata?.timestamp || 'unknown',
                    lessons: this.extractLessons(match.content),
                });
            }
        }
        // Also check local thought history
        for (const thought of this.thoughtHistory.slice(-50)) {
            const similarity = this.calculateQuerySimilarity(context.query, thought.query);
            if (similarity > 0.6) {
                precedents.push({
                    id: thought.id,
                    similarity,
                    situation: thought.query,
                    decision: thought.decision.action,
                    outcome: thought.decision.outcome,
                    timestamp: thought.timestamp.toISOString(),
                    lessons: thought.reasoning.risksIdentified,
                });
            }
        }
        // Sort by similarity and limit
        return precedents
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, this.config.maxHistoricalPrecedents);
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // REASONING ENGINE
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Build reasoning chain from context
     */
    async buildReasoningChain(query, type, context) {
        const steps = [];
        // Step 1: Analyze query
        steps.push({
            step: 1,
            description: `Analyzing ${type} query: ${query.slice(0, 100)}`,
            evidence: [`Query type: ${type}`, `Constraints: ${context.constraints.length}`],
            confidence: 0.9,
        });
        // Step 2: Evaluate context
        steps.push({
            step: 2,
            description: `Evaluating ${context.relatedVectors.length} related vectors from eternal memory`,
            evidence: context.relatedVectors.slice(0, 3).map(v => `[${(v.score * 100).toFixed(0)}%] ${v.content.slice(0, 50)}...`),
            confidence: context.relatedVectors.length > 0 ? 0.8 : 0.4,
        });
        // Step 3: Consider precedents
        if (context.historicalPrecedents.length > 0) {
            steps.push({
                step: 3,
                description: `Found ${context.historicalPrecedents.length} historical precedents`,
                evidence: context.historicalPrecedents.slice(0, 3).map(p => `[${(p.similarity * 100).toFixed(0)}%] ${p.situation.slice(0, 50)}... -> ${p.outcome}`),
                confidence: 0.85,
            });
        }
        // Step 4: Evaluate constraints
        if (context.constraints.length > 0) {
            steps.push({
                step: steps.length + 1,
                description: `Applying ${context.constraints.length} constraints`,
                evidence: context.constraints,
                confidence: 0.95,
            });
        }
        // Generate alternatives
        const alternatives = this.generateAlternatives(query, type, context);
        // Identify risks
        const risks = this.identifyRisks(query, type, context);
        // Form conclusion
        const conclusion = this.formConclusion(steps, alternatives, risks);
        return {
            steps,
            conclusion,
            alternativesConsidered: alternatives,
            risksIdentified: risks,
        };
    }
    /**
     * Generate alternative approaches
     */
    generateAlternatives(query, type, context) {
        const alternatives = [];
        // From historical precedents
        for (const precedent of context.historicalPrecedents.slice(0, 3)) {
            if (precedent.decision && !alternatives.includes(precedent.decision)) {
                alternatives.push(`Historical: ${precedent.decision}`);
            }
        }
        // Standard alternatives based on type
        switch (type) {
            case ThoughtType.STRATEGIC:
                alternatives.push('Defer for more data', 'Phased implementation', 'Risk mitigation first');
                break;
            case ThoughtType.TACTICAL:
                alternatives.push('Direct action', 'Parallel approach', 'Sequential steps');
                break;
            case ThoughtType.DIAGNOSTIC:
                alternatives.push('Root cause analysis', 'Symptom treatment', 'Full system audit');
                break;
            case ThoughtType.CREATIVE:
                if (this.config.enableCreativeThinking) {
                    alternatives.push('Novel synthesis', 'Paradigm shift', 'Hybrid solution');
                }
                break;
        }
        return alternatives.slice(0, 5);
    }
    /**
     * Identify potential risks
     */
    identifyRisks(query, type, context) {
        const risks = [];
        // Context-based risks
        if (context.relatedVectors.length < 3) {
            risks.push('Limited historical context available');
        }
        if (context.historicalPrecedents.length === 0) {
            risks.push('No direct precedent - uncharted territory');
        }
        // Check for negative outcomes in precedents
        for (const precedent of context.historicalPrecedents) {
            if (precedent.outcome.toLowerCase().includes('fail') ||
                precedent.outcome.toLowerCase().includes('error')) {
                risks.push(`Similar situation had negative outcome: ${precedent.outcome}`);
            }
        }
        // Type-specific risks
        switch (type) {
            case ThoughtType.STRATEGIC:
                risks.push('Long-term consequences uncertain');
                break;
            case ThoughtType.REACTIVE:
                risks.push('Quick decision may miss important factors');
                break;
            case ThoughtType.CORRECTIVE:
                risks.push('Correction may introduce new issues');
                break;
        }
        return risks.slice(0, 5);
    }
    /**
     * Form conclusion from reasoning
     */
    formConclusion(steps, alternatives, risks) {
        const avgConfidence = steps.reduce((sum, s) => sum + s.confidence, 0) / steps.length;
        if (avgConfidence > 0.8) {
            return `High confidence reasoning complete. ${steps.length} steps analyzed, ${alternatives.length} alternatives considered, ${risks.length} risks identified.`;
        }
        else if (avgConfidence > 0.6) {
            return `Moderate confidence. Additional context may improve decision quality. ${risks.length} risks require attention.`;
        }
        else {
            return `Low confidence reasoning. Consider gathering more context or deferring decision.`;
        }
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // DECISION MAKING
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Make final decision based on reasoning
     */
    async makeDecision(query, type, context, reasoning) {
        const avgStepConfidence = reasoning.steps.reduce((sum, s) => sum + s.confidence, 0) / reasoning.steps.length;
        // Determine outcome based on reasoning
        let outcome;
        let action;
        let justification;
        if (avgStepConfidence > 0.8 && context.historicalPrecedents.length > 0) {
            outcome = DecisionOutcome.EXECUTE;
            action = this.determineAction(type, context, reasoning);
            justification = `High confidence (${(avgStepConfidence * 100).toFixed(0)}%) with ${context.historicalPrecedents.length} precedents supporting decision.`;
        }
        else if (avgStepConfidence > 0.6) {
            outcome = DecisionOutcome.ADAPT;
            action = this.determineAction(type, context, reasoning);
            justification = `Moderate confidence. Adapting approach based on ${reasoning.risksIdentified.length} identified risks.`;
        }
        else if (reasoning.risksIdentified.length > 3) {
            outcome = DecisionOutcome.INVESTIGATE;
            action = 'GATHER_MORE_CONTEXT';
            justification = `Too many risks (${reasoning.risksIdentified.length}) identified. Investigation needed.`;
        }
        else {
            outcome = DecisionOutcome.DEFER;
            action = 'WAIT_FOR_CONTEXT';
            justification = 'Insufficient context for confident decision.';
        }
        return {
            outcome,
            action,
            parameters: {
                type,
                contextVectors: context.relatedVectors.length,
                precedents: context.historicalPrecedents.length,
                risks: reasoning.risksIdentified.length,
            },
            justification,
            expectedImpact: this.predictImpact(outcome, context),
            rollbackPlan: this.generateRollbackPlan(action, context),
        };
    }
    /**
     * Determine specific action based on thought type
     */
    determineAction(type, context, reasoning) {
        // Use best alternative if available
        if (reasoning.alternativesConsidered.length > 0) {
            return reasoning.alternativesConsidered[0];
        }
        // Default actions by type
        switch (type) {
            case ThoughtType.STRATEGIC:
                return 'IMPLEMENT_STRATEGY';
            case ThoughtType.TACTICAL:
                return 'EXECUTE_TACTIC';
            case ThoughtType.REACTIVE:
                return 'IMMEDIATE_RESPONSE';
            case ThoughtType.PREDICTIVE:
                return 'PREPARE_FOR_PREDICTION';
            case ThoughtType.DIAGNOSTIC:
                return 'APPLY_DIAGNOSIS';
            case ThoughtType.CREATIVE:
                return 'IMPLEMENT_INNOVATION';
            case ThoughtType.CORRECTIVE:
                return 'APPLY_CORRECTION';
            case ThoughtType.EVOLUTIONARY:
                return 'EVOLVE_SYSTEM';
            default:
                return 'PROCEED';
        }
    }
    /**
     * Predict impact of decision
     */
    predictImpact(outcome, context) {
        const precedentOutcomes = context.historicalPrecedents
            .map(p => p.outcome)
            .filter(Boolean);
        if (precedentOutcomes.length > 0) {
            return `Expected outcome based on ${precedentOutcomes.length} precedents: ${precedentOutcomes[0]}`;
        }
        switch (outcome) {
            case DecisionOutcome.EXECUTE:
                return 'Direct positive impact expected';
            case DecisionOutcome.ADAPT:
                return 'Modified approach may require iteration';
            case DecisionOutcome.INVESTIGATE:
                return 'Delayed impact pending investigation';
            case DecisionOutcome.DEFER:
                return 'No immediate impact; awaiting conditions';
            case DecisionOutcome.ESCALATE:
                return 'Impact depends on escalation response';
            default:
                return 'Impact uncertain';
        }
    }
    /**
     * Generate rollback plan
     */
    generateRollbackPlan(action, context) {
        // Check precedents for rollback strategies
        for (const precedent of context.historicalPrecedents) {
            for (const lesson of precedent.lessons) {
                if (lesson.toLowerCase().includes('rollback') || lesson.toLowerCase().includes('revert')) {
                    return lesson;
                }
            }
        }
        return `If ${action} fails: Revert to previous state, log failure, and escalate if critical.`;
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // CONFIDENCE & PERSISTENCE
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Calculate overall confidence
     */
    calculateConfidence(context, reasoning, precedents) {
        let confidence = 0.3; // Base
        // Context factor (up to 0.25)
        confidence += Math.min(0.25, context.relatedVectors.length * 0.025);
        // Precedent factor (up to 0.25)
        if (precedents.length > 0) {
            const avgSimilarity = precedents.reduce((sum, p) => sum + p.similarity, 0) / precedents.length;
            confidence += avgSimilarity * 0.25;
        }
        // Reasoning step confidence (up to 0.2)
        const avgStepConfidence = reasoning.steps.reduce((sum, s) => sum + s.confidence, 0) / reasoning.steps.length;
        confidence += avgStepConfidence * 0.2;
        // Risk penalty
        confidence -= reasoning.risksIdentified.length * 0.02;
        return Math.max(0, Math.min(1, confidence));
    }
    /**
     * Persist thought to eternal memory
     */
    async persistThought(thought) {
        const store = this.bridgeSystem.store;
        // Save as knowledge
        store.setKnowledge(`thoughts:${thought.type}`, thought.id, JSON.stringify({
            query: thought.query,
            decision: thought.decision,
            confidence: thought.confidence,
            timestamp: thought.timestamp.toISOString(),
        }));
        // Save conversation message
        store.saveMessage(this.sessionId, 'assistant', `[THOUGHT ${thought.type}] ${thought.decision.outcome}: ${thought.decision.action}`);
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // UTILITY METHODS
    // ═══════════════════════════════════════════════════════════════════════════
    extractDecision(content) {
        const match = content.match(/Decision:\s*(.+?)(?:\n|$)/i);
        return match ? match[1].trim() : 'Unknown';
    }
    extractOutcome(content) {
        const match = content.match(/Outcome:\s*(.+?)(?:\n|$)/i);
        return match ? match[1].trim() : 'Unknown';
    }
    extractLessons(content) {
        const lessons = [];
        const match = content.match(/Lesson[s]?:\s*(.+?)(?:\n\n|$)/i);
        if (match) {
            lessons.push(...match[1].split(',').map(s => s.trim()));
        }
        return lessons;
    }
    calculateQuerySimilarity(q1, q2) {
        const words1 = new Set(q1.toLowerCase().split(/\s+/));
        const words2 = new Set(q2.toLowerCase().split(/\s+/));
        const intersection = new Set([...words1].filter(w => words2.has(w)));
        return intersection.size / Math.max(words1.size, words2.size);
    }
    updateMetrics(thought) {
        this.metrics.totalThoughts++;
        this.metrics.byType[thought.type] = (this.metrics.byType[thought.type] || 0) + 1;
        this.metrics.byOutcome[thought.decision.outcome] = (this.metrics.byOutcome[thought.decision.outcome] || 0) + 1;
        this.metrics.precedentsUsed += thought.context.historicalPrecedents.length;
        // Running average
        this.metrics.averageConfidence =
            (this.metrics.averageConfidence * (this.metrics.totalThoughts - 1) + thought.confidence) / this.metrics.totalThoughts;
        this.metrics.averageDuration =
            (this.metrics.averageDuration * (this.metrics.totalThoughts - 1) + thought.duration) / this.metrics.totalThoughts;
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // PUBLIC GETTERS
    // ═══════════════════════════════════════════════════════════════════════════
    getMetrics() {
        return { ...this.metrics };
    }
    getThoughtHistory(limit) {
        const history = [...this.thoughtHistory];
        return limit ? history.slice(-limit) : history;
    }
    getSessionId() {
        return this.sessionId;
    }
}
exports.AutonomousThought = AutonomousThought;
// ═══════════════════════════════════════════════════════════════════════════════
// FACTORY
// ═══════════════════════════════════════════════════════════════════════════════
function createAutonomousThought(bridgeSystem, config) {
    return new AutonomousThought({
        bridgeSystem,
        ...config,
    });
}
exports.default = AutonomousThought;
