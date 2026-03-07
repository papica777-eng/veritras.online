/**
 * ═══════════════════════════════════════════════════════════════════════════
 * BIOLOGY LAYER - SELF-ORGANIZING SYSTEMS
 * Layer 4: Learning, Adaptation, and Self-Healing
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * "Животът намира път."
 *                        — Ян Малкълм (Джурасик Парк)
 * 
 * This layer creates LIFE from chemistry. Systems that learn, adapt,
 * heal themselves, and evolve over time.
 * 
 * PRINCIPLES:
 * - Depends on MATH, PHYSICS, CHEMISTRY
 * - Self-organization and emergence
 * - Learning from experience
 * - Autonomous healing and adaptation
 * 
 * CONTENTS:
 * - Cognitive Core: Learning, memory, decision making
 * - Oracle System: Prediction and anticipation
 * - Self-Healing: Automatic error recovery
 * - Evolution Engine: Genetic algorithms, optimization
 * 
 * LAYER HIERARCHY:
 * ┌─────────────────────────────────────────────────────────────────┐
 * │ [5] REALITY    ← Final output to the world                      │
 * │ [4] BIOLOGY    ← Self-organizing, learning systems ← YOU ARE HERE
 * │ [3] CHEMISTRY  ← Reactive transformations                       │
 * │ [2] PHYSICS    ← Interaction rules, forces                      │
 * │ [1] MATH       ← Pure algorithms, immutable truths              │
 * └─────────────────────────────────────────────────────────────────┘
 * 
 * DEPENDENCY RULE:
 * Biology imports FROM Math, Physics, Chemistry
 * Biology exports TO Reality ONLY
 * 
 * @module layers/biology
 * @version 1.0.0
 * @license MIT
 */

import {
  type MathResult,
  createMathResult,
  bayesianUpdate,
  weightedMovingAverage,
  contentHash,
  createTemporalPoint,
  type TemporalPoint,
} from '../math';
import {
  PhysicsQueue,
  PerformanceTracker,
  type SwarmParticle,
} from '../physics';
import {
  createPipeline,
  type TransformResult,
  SimilarityDetector,
} from '../chemistry';

// ═══════════════════════════════════════════════════════════════════════════
// BIOLOGY PRIMITIVES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * A memory unit - stores experience
 */
export interface Memory {
  readonly id: string;
  readonly content: unknown;
  readonly context: string;
  readonly importance: number; // 0-1
  readonly createdAt: TemporalPoint;
  readonly accessCount: number;
  readonly lastAccessedAt: TemporalPoint;
  readonly emotionalValence: number; // -1 to 1 (negative to positive)
}

/**
 * A learned pattern
 */
export interface LearnedPattern {
  readonly id: string;
  readonly pattern: string;
  readonly confidence: number;
  readonly occurrences: number;
  readonly lastSeenAt: TemporalPoint;
  readonly associations: string[];
}

/**
 * Decision with reasoning
 */
export interface Decision {
  readonly action: string;
  readonly confidence: number;
  readonly reasoning: string[];
  readonly alternatives: Array<{ action: string; score: number }>;
  readonly decidedAt: TemporalPoint;
}

// ═══════════════════════════════════════════════════════════════════════════
// COGNITIVE CORE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Working memory with limited capacity (like human working memory)
 */
export class WorkingMemory {
  private readonly slots: Map<string, Memory> = new Map();
  private readonly capacity: number;
  private readonly decayRate: number;

  constructor(options: { capacity?: number; decayRate?: number } = {}) {
    this.capacity = options.capacity ?? 7; // Miller's magic number
    this.decayRate = options.decayRate ?? 0.1;
  }

  /**
   * Store in working memory
   */
  store(content: unknown, context: string, importance = 0.5): Memory {
    const id = contentHash(JSON.stringify(content) + context);
    const now = createTemporalPoint();

    const memory: Memory = {
      id,
      content,
      context,
      importance,
      createdAt: now,
      accessCount: 1,
      lastAccessedAt: now,
      emotionalValence: 0,
    };

    // If at capacity, evict least important
    if (this.slots.size >= this.capacity) {
      this.evictLeastImportant();
    }

    this.slots.set(id, memory);
    return memory;
  }

  /**
   * Retrieve from working memory
   */
  retrieve(id: string): Memory | undefined {
    const memory = this.slots.get(id);
    if (memory) {
      // Update access stats
      const updated: Memory = {
        ...memory,
        accessCount: memory.accessCount + 1,
        lastAccessedAt: createTemporalPoint(),
      };
      this.slots.set(id, updated);
      return updated;
    }
    return undefined;
  }

  /**
   * Search by context
   */
  searchByContext(context: string): Memory[] {
    return Array.from(this.slots.values())
      .filter(m => m.context.includes(context) || context.includes(m.context))
      .sort((a, b) => b.importance - a.importance);
  }

  /**
   * Apply memory decay
   */
  applyDecay(): void {
    const now = Date.now();
    for (const [id, memory] of this.slots) {
      const age = now - memory.lastAccessedAt.epochMs;
      const decayedImportance = memory.importance * Math.exp(-this.decayRate * age / 1000);
      
      if (decayedImportance < 0.01) {
        this.slots.delete(id);
      } else {
        this.slots.set(id, { ...memory, importance: decayedImportance });
      }
    }
  }

  private evictLeastImportant(): void {
    let minImportance = Infinity;
    let toEvict: string | null = null;

    for (const [id, memory] of this.slots) {
      const score = memory.importance * (1 + Math.log(memory.accessCount + 1));
      if (score < minImportance) {
        minImportance = score;
        toEvict = id;
      }
    }

    if (toEvict) {
      this.slots.delete(toEvict);
    }
  }

  get size(): number {
    return this.slots.size;
  }

  getAll(): Memory[] {
    return Array.from(this.slots.values());
  }
}

/**
 * Long-term memory with consolidation
 */
export class LongTermMemory {
  private readonly memories: Map<string, Memory> = new Map();
  private readonly patterns: Map<string, LearnedPattern> = new Map();
  private readonly similarityDetector = new SimilarityDetector(0.7);
  private readonly maxMemories: number;

  constructor(maxMemories = 100000) {
    this.maxMemories = maxMemories;
  }

  /**
   * Consolidate from working memory
   */
  consolidate(workingMemory: WorkingMemory): number {
    let consolidated = 0;
    
    for (const memory of workingMemory.getAll()) {
      // Only consolidate important memories
      if (memory.importance > 0.3 && memory.accessCount > 1) {
        const contentStr = JSON.stringify(memory.content);
        const duplicate = this.similarityDetector.addAndCheck(memory.id, contentStr);
        
        if (!duplicate.isDuplicate) {
          this.memories.set(memory.id, memory);
          consolidated++;
        } else {
          // Strengthen existing memory
          const existing = this.memories.get(duplicate.similarTo!);
          if (existing) {
            this.memories.set(existing.id, {
              ...existing,
              importance: Math.min(1, existing.importance + 0.1),
              accessCount: existing.accessCount + memory.accessCount,
            });
          }
        }
      }
    }

    // Enforce capacity
    while (this.memories.size > this.maxMemories) {
      this.forgetLeastImportant();
    }

    return consolidated;
  }

  /**
   * Learn a pattern
   */
  learnPattern(pattern: string, associations: string[] = []): LearnedPattern {
    const id = contentHash(pattern);
    const existing = this.patterns.get(id);
    const now = createTemporalPoint();

    if (existing) {
      const updated: LearnedPattern = {
        ...existing,
        confidence: Math.min(1, existing.confidence + 0.05),
        occurrences: existing.occurrences + 1,
        lastSeenAt: now,
        associations: [...new Set([...existing.associations, ...associations])],
      };
      this.patterns.set(id, updated);
      return updated;
    }

    const newPattern: LearnedPattern = {
      id,
      pattern,
      confidence: 0.5,
      occurrences: 1,
      lastSeenAt: now,
      associations,
    };
    this.patterns.set(id, newPattern);
    return newPattern;
  }

  /**
   * Recall by association
   */
  recall(context: string): Memory[] {
    const results: Array<Memory & { relevance: number }> = [];
    
    for (const memory of this.memories.values()) {
      let relevance = 0;
      
      // Context match
      if (memory.context.includes(context)) {
        relevance += 0.5;
      }
      
      // Content match (if string)
      const contentStr = JSON.stringify(memory.content);
      if (contentStr.includes(context)) {
        relevance += 0.3;
      }
      
      // Importance boost
      relevance += memory.importance * 0.2;
      
      if (relevance > 0) {
        results.push({ ...memory, relevance });
      }
    }

    return results
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 10);
  }

  /**
   * Get learned patterns
   */
  getPatterns(minConfidence = 0.6): LearnedPattern[] {
    return Array.from(this.patterns.values())
      .filter(p => p.confidence >= minConfidence)
      .sort((a, b) => b.confidence - a.confidence);
  }

  private forgetLeastImportant(): void {
    let minScore = Infinity;
    let toForget: string | null = null;

    for (const [id, memory] of this.memories) {
      const age = Date.now() - memory.createdAt.epochMs;
      const score = memory.importance * memory.accessCount / Math.log(age + 2);
      
      if (score < minScore) {
        minScore = score;
        toForget = id;
      }
    }

    if (toForget) {
      this.memories.delete(toForget);
    }
  }

  get memoryCount(): number {
    return this.memories.size;
  }

  get patternCount(): number {
    return this.patterns.size;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// ORACLE SYSTEM (Prediction)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Prediction with confidence
 */
export interface Prediction {
  readonly outcome: string;
  readonly probability: number;
  readonly confidence: number;
  readonly reasoning: string[];
  readonly predictedAt: TemporalPoint;
  readonly horizon: number; // How far into the future (ms)
}

/**
 * Oracle - Prediction engine based on learned patterns
 */
export class Oracle {
  private readonly longTermMemory: LongTermMemory;
  private readonly predictionHistory: Map<string, { prediction: Prediction; actual?: string }> = new Map();
  private baseConfidence = 0.5;

  constructor(longTermMemory: LongTermMemory) {
    this.longTermMemory = longTermMemory;
  }

  /**
   * Predict outcome based on current context
   */
  predict(context: string, horizon = 60000): MathResult<Prediction> {
    const patterns = this.longTermMemory.getPatterns(0.5);
    const relevantPatterns = patterns.filter(p => 
      p.pattern.includes(context) || 
      p.associations.some(a => a.includes(context))
    );

    if (relevantPatterns.length === 0) {
      return createMathResult({
        outcome: 'unknown',
        probability: 0.5,
        confidence: 0.1,
        reasoning: ['No relevant patterns found'],
        predictedAt: createTemporalPoint(),
        horizon,
      }, 0.1, 'oracle-prediction');
    }

    // Weight by confidence and recency
    const weights = relevantPatterns.map(p => {
      const recency = 1 / Math.log((Date.now() - p.lastSeenAt.epochMs) / 1000 + 2);
      return p.confidence * recency * Math.log(p.occurrences + 1);
    });

    const totalWeight = weights.reduce((a, b) => a + b, 0);
    const normalizedWeights = weights.map(w => w / totalWeight);

    // Build prediction from weighted patterns
    const topPattern = relevantPatterns[
      weights.indexOf(Math.max(...weights))
    ];

    const prediction: Prediction = {
      outcome: topPattern.pattern,
      probability: topPattern.confidence,
      confidence: this.baseConfidence * (relevantPatterns.length / (patterns.length + 1)),
      reasoning: [
        `Based on ${relevantPatterns.length} relevant patterns`,
        `Top pattern seen ${topPattern.occurrences} times`,
        `Confidence: ${(topPattern.confidence * 100).toFixed(1)}%`,
      ],
      predictedAt: createTemporalPoint(),
      horizon,
    };

    // Store for later validation
    const predictionId = contentHash(context + Date.now());
    this.predictionHistory.set(predictionId, { prediction });

    return createMathResult(prediction, prediction.confidence, 'oracle-prediction');
  }

  /**
   * Validate a past prediction
   */
  validatePrediction(predictionId: string, actualOutcome: string): void {
    const entry = this.predictionHistory.get(predictionId);
    if (!entry) return;

    entry.actual = actualOutcome;

    // Update base confidence using Bayesian update
    const wasCorrect = entry.prediction.outcome === actualOutcome;
    const prior = this.baseConfidence;
    const likelihood = wasCorrect ? 0.9 : 0.1;
    const evidence = 0.5;

    const update = bayesianUpdate(prior, likelihood, evidence);
    this.baseConfidence = update.value;

    // Learn from this
    if (wasCorrect) {
      this.longTermMemory.learnPattern(actualOutcome, [entry.prediction.outcome]);
    }
  }

  /**
   * Get prediction accuracy
   */
  getAccuracy(): MathResult<number> {
    const validated = Array.from(this.predictionHistory.values())
      .filter(e => e.actual !== undefined);

    if (validated.length === 0) {
      return createMathResult(0, 0, 'accuracy');
    }

    const correct = validated.filter(
      e => e.prediction.outcome === e.actual
    ).length;

    return createMathResult(
      correct / validated.length,
      Math.min(1, validated.length / 100),
      'accuracy'
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SELF-HEALING SYSTEM
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Health status
 */
export interface HealthStatus {
  readonly component: string;
  readonly status: 'healthy' | 'degraded' | 'critical' | 'dead';
  readonly lastCheck: TemporalPoint;
  readonly metrics: Record<string, number>;
  readonly issues: string[];
}

/**
 * Healing action
 */
export interface HealingAction {
  readonly type: 'restart' | 'scale' | 'reconfigure' | 'isolate' | 'alert';
  readonly target: string;
  readonly reason: string;
  readonly priority: 'low' | 'medium' | 'high' | 'critical';
  readonly automated: boolean;
}

/**
 * Self-healing organism
 */
export class SelfHealingOrganism {
  private readonly componentHealth: Map<string, HealthStatus> = new Map();
  private readonly healingHistory: HealingAction[] = [];
  private readonly healthChecks: Map<string, () => Promise<HealthStatus>> = new Map();
  private readonly tracker = new PerformanceTracker();

  /**
   * Register a component for health monitoring
   */
  registerComponent(
    name: string,
    healthCheck: () => Promise<HealthStatus>
  ): void {
    this.healthChecks.set(name, healthCheck);
  }

  /**
   * Run health checks on all components
   */
  async diagnose(): Promise<HealthStatus[]> {
    const results: HealthStatus[] = [];

    for (const [name, check] of this.healthChecks) {
      try {
        const status = await this.tracker.time(() => check());
        this.componentHealth.set(name, status);
        results.push(status);
      } catch (error) {
        const errorStatus: HealthStatus = {
          component: name,
          status: 'critical',
          lastCheck: createTemporalPoint(),
          metrics: {},
          issues: [error instanceof Error ? error.message : String(error)],
        };
        this.componentHealth.set(name, errorStatus);
        results.push(errorStatus);
      }
    }

    return results;
  }

  /**
   * Determine healing actions based on diagnosis
   */
  prescribe(diagnosis: HealthStatus[]): HealingAction[] {
    const actions: HealingAction[] = [];

    for (const status of diagnosis) {
      if (status.status === 'healthy') continue;

      // Prescribe based on severity
      if (status.status === 'dead') {
        actions.push({
          type: 'restart',
          target: status.component,
          reason: `Component ${status.component} is dead: ${status.issues.join(', ')}`,
          priority: 'critical',
          automated: true,
        });
      } else if (status.status === 'critical') {
        actions.push({
          type: 'isolate',
          target: status.component,
          reason: `Component ${status.component} is critical: ${status.issues.join(', ')}`,
          priority: 'high',
          automated: true,
        });
        actions.push({
          type: 'alert',
          target: 'ops-team',
          reason: `Critical issue in ${status.component}`,
          priority: 'critical',
          automated: true,
        });
      } else if (status.status === 'degraded') {
        // Check if it's a performance issue
        const errorRate = status.metrics['errorRate'] ?? 0;
        const latency = status.metrics['latency'] ?? 0;

        if (errorRate > 0.1) {
          actions.push({
            type: 'reconfigure',
            target: status.component,
            reason: `High error rate: ${(errorRate * 100).toFixed(1)}%`,
            priority: 'medium',
            automated: true,
          });
        }

        if (latency > 1000) {
          actions.push({
            type: 'scale',
            target: status.component,
            reason: `High latency: ${latency}ms`,
            priority: 'medium',
            automated: false, // Scaling needs human approval
          });
        }
      }
    }

    return actions.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  /**
   * Execute automated healing actions
   */
  async heal(actions: HealingAction[]): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const action of actions) {
      if (!action.automated) {
        // Log for human review
        this.healingHistory.push(action);
        continue;
      }

      try {
        await this.executeHealingAction(action);
        this.healingHistory.push(action);
        success++;
      } catch {
        failed++;
      }
    }

    return { success, failed };
  }

  private async executeHealingAction(action: HealingAction): Promise<void> {
    // Simulated healing - in real implementation, this would interact with
    // the actual systems
    switch (action.type) {
      case 'restart':
        // Would restart the component
        break;
      case 'isolate':
        // Would remove from load balancer
        break;
      case 'reconfigure':
        // Would apply new configuration
        break;
      case 'scale':
        // Would add more instances
        break;
      case 'alert':
        // Would send alert to monitoring system
        break;
    }
  }

  /**
   * Get overall system health
   */
  getSystemHealth(): MathResult<{
    overall: 'healthy' | 'degraded' | 'critical';
    components: number;
    healthy: number;
    degraded: number;
    critical: number;
  }> {
    const statuses = Array.from(this.componentHealth.values());
    const healthy = statuses.filter(s => s.status === 'healthy').length;
    const degraded = statuses.filter(s => s.status === 'degraded').length;
    const critical = statuses.filter(s => 
      s.status === 'critical' || s.status === 'dead'
    ).length;

    let overall: 'healthy' | 'degraded' | 'critical' = 'healthy';
    if (critical > 0) overall = 'critical';
    else if (degraded > statuses.length * 0.3) overall = 'degraded';

    return createMathResult({
      overall,
      components: statuses.length,
      healthy,
      degraded,
      critical,
    }, statuses.length > 0 ? 1 : 0, 'system-health');
  }

  getHealingHistory(): HealingAction[] {
    return [...this.healingHistory];
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EVOLUTION ENGINE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Genetic individual
 */
export interface GeneticIndividual<T> {
  readonly genes: T;
  readonly fitness: number;
  readonly generation: number;
  readonly parentIds: string[];
  readonly id: string;
}

/**
 * Evolution configuration
 */
export interface EvolutionConfig<T> {
  readonly populationSize: number;
  readonly mutationRate: number;
  readonly crossoverRate: number;
  readonly elitismCount: number;
  readonly fitnessFunction: (genes: T) => number;
  readonly mutate: (genes: T) => T;
  readonly crossover: (parent1: T, parent2: T) => T;
  readonly createRandom: () => T;
}

/**
 * Simple genetic algorithm for optimization
 */
export class EvolutionEngine<T> {
  private population: GeneticIndividual<T>[] = [];
  private generation = 0;
  private readonly config: EvolutionConfig<T>;
  private readonly bestHistory: GeneticIndividual<T>[] = [];

  constructor(config: EvolutionConfig<T>) {
    this.config = config;
    this.initializePopulation();
  }

  private initializePopulation(): void {
    for (let i = 0; i < this.config.populationSize; i++) {
      const genes = this.config.createRandom();
      this.population.push({
        genes,
        fitness: this.config.fitnessFunction(genes),
        generation: 0,
        parentIds: [],
        id: contentHash(JSON.stringify(genes) + i),
      });
    }
    this.sortByFitness();
  }

  /**
   * Evolve for N generations
   */
  evolve(generations: number): GeneticIndividual<T> {
    for (let i = 0; i < generations; i++) {
      this.generation++;
      
      // Keep elite
      const nextGen: GeneticIndividual<T>[] = this.population.slice(
        0, 
        this.config.elitismCount
      );

      // Fill rest with offspring
      while (nextGen.length < this.config.populationSize) {
        const parent1 = this.selectParent();
        const parent2 = this.selectParent();

        let childGenes: T;
        
        // Crossover
        if (Math.random() < this.config.crossoverRate) {
          childGenes = this.config.crossover(parent1.genes, parent2.genes);
        } else {
          childGenes = Math.random() < 0.5 ? parent1.genes : parent2.genes;
        }

        // Mutation
        if (Math.random() < this.config.mutationRate) {
          childGenes = this.config.mutate(childGenes);
        }

        nextGen.push({
          genes: childGenes,
          fitness: this.config.fitnessFunction(childGenes),
          generation: this.generation,
          parentIds: [parent1.id, parent2.id],
          id: contentHash(JSON.stringify(childGenes) + this.generation + nextGen.length),
        });
      }

      this.population = nextGen;
      this.sortByFitness();
      this.bestHistory.push(this.getBest());
    }

    return this.getBest();
  }

  /**
   * Tournament selection
   */
  private selectParent(): GeneticIndividual<T> {
    const tournamentSize = 3;
    let best: GeneticIndividual<T> | null = null;

    for (let i = 0; i < tournamentSize; i++) {
      const idx = Math.floor(Math.random() * this.population.length);
      const individual = this.population[idx];
      if (!best || individual.fitness > best.fitness) {
        best = individual;
      }
    }

    return best!;
  }

  private sortByFitness(): void {
    this.population.sort((a, b) => b.fitness - a.fitness);
  }

  getBest(): GeneticIndividual<T> {
    return this.population[0];
  }

  getPopulation(): GeneticIndividual<T>[] {
    return [...this.population];
  }

  getGenerationStats(): MathResult<{
    generation: number;
    bestFitness: number;
    avgFitness: number;
    diversity: number;
  }> {
    const fitnesses = this.population.map(p => p.fitness);
    const avg = fitnesses.reduce((a, b) => a + b, 0) / fitnesses.length;
    
    // Diversity: standard deviation of fitness
    const variance = fitnesses.reduce((sum, f) => sum + Math.pow(f - avg, 2), 0) / fitnesses.length;
    const diversity = Math.sqrt(variance);

    return createMathResult({
      generation: this.generation,
      bestFitness: fitnesses[0],
      avgFitness: avg,
      diversity,
    }, 1, 'evolution-stats');
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// LAYER METADATA
// ═══════════════════════════════════════════════════════════════════════════

export const LAYER_INFO = Object.freeze({
  name: 'BIOLOGY',
  level: 4,
  description: 'Self-Organizing Systems - Learning, Adaptation, Self-Healing',
  principles: [
    'Depends on MATH, PHYSICS, CHEMISTRY',
    'Self-organization and emergence',
    'Learning from experience',
    'Autonomous healing',
  ],
  exports: ['REALITY'],
  imports: ['MATH', 'PHYSICS', 'CHEMISTRY'],
});

export default {
  WorkingMemory,
  LongTermMemory,
  Oracle,
  SelfHealingOrganism,
  EvolutionEngine,
  LAYER_INFO,
};
