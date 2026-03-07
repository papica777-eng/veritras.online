/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║                                                                           ║
 * ║   🧬 GENUS ENGINE – Genetic Strategy Evolution + RL (PPO/SAC) Layer      ║
 * ║   "Survival of the Most Profitable"                                       ║
 * ║                                                                           ║
 * ║   Part of QANTUM SINGULARITY – Core/Evolution                             ║
 * ║                                                                           ║
 * ║   Algorithms:                                                             ║
 * ║     • Genetic Algorithm – crossover, mutation, selection                  ║
 * ║     • PPO (Proximal Policy Optimization) – policy gradient RL             ║
 * ║     • SAC (Soft Actor-Critic) – entropy-regularised RL                    ║
 * ║                                                                           ║
 * ║   Role: LLM (DeepSeek) sets the *strategy* (General).                    ║
 * ║         RL agent performs the *execution* (Sniper).                      ║
 * ║                                                                           ║
 * ║   © 2025-2026 QAntum | Dimitar Prodromov                                  ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

import { EventEmitter } from 'events';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

/** Core genetic blueprint of a trading strategy */
export interface StrategyGene {
  id: string;
  riskFactor: number;        // 0.0 – 1.0
  timeframe: string;         // '1m' | '5m' | '15m' | '1h' | '4h' | '1d'
  indicators: string[];      // e.g. ['RSI', 'MACD', 'BB']
  weightings: number[];      // Per-indicator importance, sums to 1.0
  entryThreshold: number;    // Signal strength required to enter
  exitThreshold: number;     // Signal strength required to exit
  stopLossPct: number;       // Hard stop-loss percentage
  takeProfitPct: number;     // Target take-profit percentage
  positionSizePct: number;   // % of capital per trade
  fitness: number;           // Cumulative score from simulation
  generation: number;        // Which generation this gene was born in
}

/** Market state observed by the RL agent */
export interface MarketState {
  price: number;
  volume: number;
  volatility: number;        // e.g. ATR normalised
  momentum: number;          // RSI normalised to [-1, 1]
  trend: number;             // EMA slope normalised to [-1, 1]
  orderImbalance: number;    // Bid/Ask volume ratio normalised
  sentimentScore: number;    // From SentimentEngine [-1, 1]
  timestamp: number;
}

/** RL agent action */
export type RLAction = 'BUY' | 'SELL' | 'HOLD';

/** Outcome of a single simulated trade episode */
export interface EpisodeResult {
  geneId: string;
  totalReturn: number;       // % P&L over episode
  sharpeRatio: number;
  maxDrawdown: number;
  winRate: number;
  tradeCount: number;
  episodeLengthMs: number;
}

/** PPO hyperparameters */
export interface PPOConfig {
  learningRate: number;      // 3e-4 typical
  clipEpsilon: number;       // 0.2 typical
  valueLossCoeff: number;    // 0.5
  entropyCoeff: number;      // 0.01
  epochsPerUpdate: number;   // 4
  batchSize: number;         // 64
  gamma: number;             // Discount factor 0.99
  gaeLambda: number;         // GAE lambda 0.95
}

/** SAC hyperparameters */
export interface SACConfig {
  learningRate: number;      // 3e-4
  alpha: number;             // Entropy temperature (auto-tuned)
  gamma: number;             // 0.99
  tau: number;               // Soft update coefficient 0.005
  batchSize: number;         // 256
  replayBufferSize: number;  // 1_000_000
  targetUpdateInterval: number; // Steps between target updates
}

/** Transition stored in replay buffer (for SAC) */
interface Transition {
  state: MarketState;
  action: RLAction;
  reward: number;
  nextState: MarketState;
  done: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// DEFAULT CONFIGS
// ═══════════════════════════════════════════════════════════════════════════

const DEFAULT_PPO: PPOConfig = {
  learningRate: 3e-4,
  clipEpsilon: 0.2,
  valueLossCoeff: 0.5,
  entropyCoeff: 0.01,
  epochsPerUpdate: 4,
  batchSize: 64,
  gamma: 0.99,
  gaeLambda: 0.95,
};

const DEFAULT_SAC: SACConfig = {
  learningRate: 3e-4,
  alpha: 0.2,
  gamma: 0.99,
  tau: 0.005,
  batchSize: 256,
  replayBufferSize: 1_000_000,
  targetUpdateInterval: 1,
};

// ═══════════════════════════════════════════════════════════════════════════
// GENUS ENGINE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * GenusEngine
 *
 * Combines a Genetic Algorithm with PPO/SAC reinforcement learning to evolve
 * trading strategies. The GA handles macro-structure evolution (which
 * indicators, risk levels, timeframes) while the RL agent optimises the
 * microsecond-level execution decisions inside each strategy.
 *
 * Usage:
 *   const genus = new GenusEngine({ populationSize: 50, algorithm: 'PPO' });
 *   genus.seedPopulation();
 // SAFETY: async operation — wrap in try-catch for production resilience
 *   const best = await genus.evolve(100); // 100 generations
 */
export class GenusEngine extends EventEmitter {
  private population: StrategyGene[] = [];
  private replayBuffer: Transition[] = [];
  private generation = 0;
  private stepCount = 0;

  private readonly populationSize: number;
  private readonly elitismRate: number;
  private readonly mutationRate: number;
  private readonly algorithm: 'PPO' | 'SAC';
  private readonly ppoConfig: PPOConfig;
  private readonly sacConfig: SACConfig;

  // Simple in-memory policy table (weights indexed by state-feature buckets)
  // In production, replace with actual neural network weights (ONNX / WASM).
  private policyTable: Map<string, number[]> = new Map();

  constructor(options: {
    populationSize?: number;
    elitismRate?: number;
    mutationRate?: number;
    algorithm?: 'PPO' | 'SAC';
    ppo?: Partial<PPOConfig>;
    sac?: Partial<SACConfig>;
  } = {}) {
    super();
    this.populationSize = options.populationSize ?? 50;
    this.elitismRate = options.elitismRate ?? 0.1;
    this.mutationRate = options.mutationRate ?? 0.15;
    this.algorithm = options.algorithm ?? 'PPO';
    this.ppoConfig = { ...DEFAULT_PPO, ...(options.ppo ?? {}) };
    this.sacConfig = { ...DEFAULT_SAC, ...(options.sac ?? {}) };

    console.log(`🧬 GenusEngine initialised [${this.algorithm}] pop=${this.populationSize}`);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PUBLIC API
  // ─────────────────────────────────────────────────────────────────────────

  /** Seed the initial random population */
  // Complexity: O(1)
  seedPopulation(): void {
    this.population = Array.from({ length: this.populationSize }, (_, i) =>
      this.randomGene(`g0-${i}`, 0),
    );
    this.emit('populated', { size: this.population.length });
    console.log(`🧬 Population seeded: ${this.population.length} strategies`);
  }

  /**
   * Run the evolution loop for `generations` rounds.
   * Each generation:
   *   1. Evaluates every gene via simulate()
   *   2. Runs RL policy update (PPO or SAC)
   *   3. Selects survivors (elitism + tournament)
   *   4. Produces next generation via crossover + mutation
   */
  // Complexity: O(N*M) — nested iteration detected
  async evolve(generations: number = 100): Promise<StrategyGene> {
    if (this.population.length === 0) {
      this.seedPopulation();
    }

    for (let g = 0; g < generations; g++) {
      this.generation++;

      // 1. Evaluate fitness
      for (const gene of this.population) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const result = await this.simulate(gene);
        gene.fitness = this.calcFitness(result);
      }

      // 2. RL policy update
      if (this.algorithm === 'PPO') {
        this.updatePPO();
      } else {
        this.updateSAC();
      }

      // 3. Select & reproduce
      const nextPop = this.reproduce();
      this.population = nextPop;

      const best = this.getBest();
      this.emit('generation', {
        generation: this.generation,
        bestFitness: best.fitness,
        bestGene: best.id,
      });

      if (this.generation % 10 === 0) {
        console.log(
          `🧬 Gen ${this.generation}/${generations} | Best fitness: ${best.fitness.toFixed(4)}`,
        );
      }
    }

    return this.getBest();
  }

  /** Select the RL action for a live market state */
  // Complexity: O(1) — hash/map lookup
  selectAction(state: MarketState): { action: RLAction; confidence: number } {
    const key = this.encodeState(state);
    const logits = this.policyTable.get(key) ?? [0.33, 0.33, 0.33]; // BUY / SELL / HOLD
    const probs = this.softmax(logits);
    const actions: RLAction[] = ['BUY', 'SELL', 'HOLD'];
    const idx = probs.indexOf(Math.max(...probs));
    return { action: actions[idx], confidence: probs[idx] };
  }

  /** Store a transition in the replay buffer (SAC) */
  // Complexity: O(1)
  storeTransition(t: Transition): void {
    if (this.replayBuffer.length >= this.sacConfig.replayBufferSize) {
      this.replayBuffer.shift();
    }
    this.replayBuffer.push(t);
  }

  /** Return the best gene in current population */
  // Complexity: O(N log N) — sort operation
  getBest(): StrategyGene {
    return [...this.population].sort((a, b) => b.fitness - a.fitness)[0];
  }

  /** Return top N genes */
  // Complexity: O(N log N) — sort operation
  getTopN(n: number): StrategyGene[] {
    return [...this.population]
      .sort((a, b) => b.fitness - a.fitness)
      .slice(0, n);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PRIVATE – GENETIC ALGORITHM
  // ─────────────────────────────────────────────────────────────────────────

  // Complexity: O(1) — amortized
  private randomGene(id: string, generation: number): StrategyGene {
    const indicators = ['RSI', 'MACD', 'BB', 'ATR', 'EMA', 'VWAP', 'OBV'];
    const count = 2 + Math.floor(Math.random() * 4);
    const chosen = this.shuffle(indicators).slice(0, count);
    const weights = this.randomWeights(count);
    const timeframes = ['1m', '5m', '15m', '1h', '4h', '1d'];

    return {
      id,
      riskFactor: Math.random(),
      timeframe: timeframes[Math.floor(Math.random() * timeframes.length)],
      indicators: chosen,
      weightings: weights,
      entryThreshold: 0.5 + Math.random() * 0.4,
      exitThreshold: 0.3 + Math.random() * 0.4,
      stopLossPct: 0.5 + Math.random() * 4.5,
      takeProfitPct: 1.0 + Math.random() * 9.0,
      positionSizePct: 1.0 + Math.random() * 9.0,
      fitness: 0,
      generation,
    };
  }

  // Complexity: O(N log N) — sort operation
  private reproduce(): StrategyGene[] {
    const sorted = [...this.population].sort((a, b) => b.fitness - a.fitness);
    const eliteCount = Math.max(1, Math.floor(this.populationSize * this.elitismRate));
    const elites = sorted.slice(0, eliteCount).map((g) => ({ ...g }));

    const children: StrategyGene[] = [...elites];
    while (children.length < this.populationSize) {
      const parent1 = this.tournament(sorted);
      const parent2 = this.tournament(sorted);
      const child = this.crossover(parent1, parent2);
      this.mutate(child);
      children.push(child);
    }

    return children;
  }

  // Complexity: O(N log N) — sort operation
  private tournament(sorted: StrategyGene[], k = 3): StrategyGene {
    const candidates = this.shuffle([...sorted]).slice(0, k);
    return candidates.reduce((best, c) => (c.fitness > best.fitness ? c : best));
  }

  // Complexity: O(N)
  private crossover(a: StrategyGene, b: StrategyGene): StrategyGene {
    const id = `g${this.generation}-${Math.random().toString(36).slice(2, 8)}`;
    // Uniform crossover for numeric genes, pick parent's indicators randomly
    return {
      id,
      riskFactor: Math.random() < 0.5 ? a.riskFactor : b.riskFactor,
      timeframe: Math.random() < 0.5 ? a.timeframe : b.timeframe,
      indicators: Math.random() < 0.5 ? [...a.indicators] : [...b.indicators],
      weightings: Math.random() < 0.5 ? [...a.weightings] : [...b.weightings],
      entryThreshold: (a.entryThreshold + b.entryThreshold) / 2,
      exitThreshold: (a.exitThreshold + b.exitThreshold) / 2,
      stopLossPct: Math.random() < 0.5 ? a.stopLossPct : b.stopLossPct,
      takeProfitPct: Math.random() < 0.5 ? a.takeProfitPct : b.takeProfitPct,
      positionSizePct: (a.positionSizePct + b.positionSizePct) / 2,
      fitness: 0,
      generation: this.generation,
    };
  }

  // Complexity: O(1) — amortized
  private mutate(gene: StrategyGene): void {
    if (Math.random() < this.mutationRate) gene.riskFactor = Math.random();
    if (Math.random() < this.mutationRate) {
      gene.entryThreshold = Math.max(0.1, Math.min(0.99, gene.entryThreshold + (Math.random() - 0.5) * 0.1));
    }
    if (Math.random() < this.mutationRate) {
      gene.stopLossPct = Math.max(0.1, gene.stopLossPct + (Math.random() - 0.5) * 0.5);
    }
    if (Math.random() < this.mutationRate) {
      gene.positionSizePct = Math.max(0.5, Math.min(20, gene.positionSizePct + (Math.random() - 0.5) * 1));
    }
    // Occasionally add/remove an indicator
    if (Math.random() < this.mutationRate * 0.3) {
      const all = ['RSI', 'MACD', 'BB', 'ATR', 'EMA', 'VWAP', 'OBV', 'ADX', 'CCI'];
      const candidate = all[Math.floor(Math.random() * all.length)];
      if (!gene.indicators.includes(candidate)) {
        gene.indicators.push(candidate);
        gene.weightings = this.randomWeights(gene.indicators.length);
      }
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PRIVATE – RL (PPO / SAC)
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Simplified PPO policy update.
   * Production: replace with real neural network forward/backward passes.
   */
  // Complexity: O(N) — linear iteration
  private updatePPO(): void {
    if (this.replayBuffer.length < this.ppoConfig.batchSize) return;

    const batch = this.sampleBatch(this.ppoConfig.batchSize);
    let totalReward = 0;

    for (const t of batch) {
      const key = this.encodeState(t.state);
      const logits = this.policyTable.get(key) ?? [0, 0, 0];
      const actionIndex: Record<RLAction, number> = { BUY: 0, SELL: 1, HOLD: 2 };
      const idx = actionIndex[t.action];

      // PPO clipped surrogate objective (simplified scalar update)
      const advantage = t.reward + (t.done ? 0 : this.ppoConfig.gamma * this.maxQ(t.nextState)) - logits[idx];
      const ratio = Math.exp(advantage * this.ppoConfig.learningRate);
      const clipped = Math.min(
        ratio,
        Math.max(1 - this.ppoConfig.clipEpsilon, Math.min(1 + this.ppoConfig.clipEpsilon, ratio)),
      );
      logits[idx] += this.ppoConfig.learningRate * clipped * advantage;

      this.policyTable.set(key, logits);
      totalReward += t.reward;
      this.stepCount++;
    }

    this.emit('ppoUpdate', {
      steps: this.stepCount,
      avgReward: totalReward / batch.length,
    });
  }

  /**
   * Simplified SAC policy update.
   * Production: replace with real actor/critic neural networks.
   */
  // Complexity: O(N) — linear iteration
  private updateSAC(): void {
    if (this.replayBuffer.length < this.sacConfig.batchSize) return;

    const batch = this.sampleBatch(this.sacConfig.batchSize);
    let totalReward = 0;

    for (const t of batch) {
      const key = this.encodeState(t.state);
      const logits = this.policyTable.get(key) ?? [0, 0, 0];
      const probs = this.softmax(logits);
      const actionIndex: Record<RLAction, number> = { BUY: 0, SELL: 1, HOLD: 2 };
      const idx = actionIndex[t.action];

      // SAC target: Q - α * log(π)
      const targetQ = t.reward + (t.done ? 0 : this.sacConfig.gamma *
        (this.maxQ(t.nextState) - this.sacConfig.alpha * Math.log(probs[idx] + 1e-8)));

      // Soft update
      logits[idx] = logits[idx] + this.sacConfig.tau * (targetQ - logits[idx]);
      this.policyTable.set(key, logits);
      totalReward += t.reward;
      this.stepCount++;
    }

    this.emit('sacUpdate', {
      steps: this.stepCount,
      avgReward: totalReward / batch.length,
      alpha: this.sacConfig.alpha,
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PRIVATE – SIMULATION (Digital Twin placeholder)
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Simulate `gene` over synthetic market data.
   * In production: connect to DigitalTwin backtester via IPC/WebSocket.
   */
  // Complexity: O(N*M) — nested iteration detected
  private async simulate(gene: StrategyGene): Promise<EpisodeResult> {
    const episodes = 50;
    let totalReturn = 0;
    let wins = 0;
    let trades = 0;
    let maxDrawdown = 0;
    let peak = 1.0;
    let equity = 1.0;

    for (let e = 0; e < episodes; e++) {
      const state = this.syntheticState();
      const { action } = this.selectAction(state);
      const pnl = this.syntheticPnL(gene, action, state);
      equity *= 1 + pnl;
      totalReturn += pnl;
      if (equity > peak) peak = equity;
      const dd = (peak - equity) / peak;
      if (dd > maxDrawdown) maxDrawdown = dd;
      if (pnl > 0) wins++;
      trades++;

      // Store transition for RL
      const nextState = this.syntheticState();
      this.storeTransition({ state, action, reward: pnl * 100, nextState, done: e === episodes - 1 });
    }

    const avgReturn = totalReturn / episodes;
    const std = Math.sqrt(
      (totalReturn * totalReturn) / episodes - avgReturn * avgReturn + 1e-8,
    );
    const sharpe = (avgReturn / std) * Math.sqrt(252);

    return {
      geneId: gene.id,
      totalReturn: totalReturn * 100,
      sharpeRatio: sharpe,
      maxDrawdown: maxDrawdown * 100,
      winRate: wins / trades,
      tradeCount: trades,
      episodeLengthMs: episodes,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PRIVATE – HELPERS
  // ─────────────────────────────────────────────────────────────────────────

  // Complexity: O(1)
  private calcFitness(r: EpisodeResult): number {
    // Utility function: (Profit × Stability) - (Risk × Entropy)
    const profit = r.totalReturn;
    const stability = r.sharpeRatio;
    const risk = r.maxDrawdown;
    const entropy = 1 - r.winRate;
    return (profit * stability) - (risk * entropy);
  }

  // Complexity: O(N)
  private encodeState(s: MarketState): string {
    // Discretise continuous state into bucket string for table lookup
    const bucket = (v: number, bins = 5) => Math.floor(Math.max(0, Math.min(1, (v + 1) / 2)) * bins);
    return [
      // Complexity: O(1)
      bucket(s.momentum),
      // Complexity: O(1)
      bucket(s.trend),
      // Complexity: O(1)
      bucket(s.volatility),
      // Complexity: O(1)
      bucket(s.orderImbalance),
      // Complexity: O(1)
      bucket(s.sentimentScore),
    ].join(',');
  }

  // Complexity: O(N) — potential recursive descent
  private maxQ(s: MarketState): number {
    const key = this.encodeState(s);
    const logits = this.policyTable.get(key) ?? [0, 0, 0];
    return Math.max(...logits);
  }

  // Complexity: O(N) — potential recursive descent
  private sampleBatch(size: number): Transition[] {
    const shuffled = this.shuffle([...this.replayBuffer]);
    return shuffled.slice(0, Math.min(size, shuffled.length));
  }

  // Complexity: O(N) — linear iteration
  private softmax(logits: number[]): number[] {
    const max = Math.max(...logits);
    const exps = logits.map((l) => Math.exp(l - max));
    const sum = exps.reduce((a, b) => a + b, 0);
    return exps.map((e) => e / sum);
  }

  // Complexity: O(1)
  private syntheticState(): MarketState {
    return {
      price: 50000 + (Math.random() - 0.5) * 10000,
      volume: Math.random() * 1e6,
      volatility: Math.random(),
      momentum: (Math.random() - 0.5) * 2,
      trend: (Math.random() - 0.5) * 2,
      orderImbalance: (Math.random() - 0.5) * 2,
      sentimentScore: (Math.random() - 0.5) * 2,
      timestamp: Date.now(),
    };
  }

  // Complexity: O(1)
  private syntheticPnL(gene: StrategyGene, action: RLAction, state: MarketState): number {
    // Very simplified PnL based on momentum + action direction
    const direction = action === 'BUY' ? 1 : action === 'SELL' ? -1 : 0;
    const edge = direction * state.momentum * 0.01 * (1 - gene.riskFactor * 0.5);
    const noise = (Math.random() - 0.5) * 0.005;
    const result = edge + noise;
    // Clamp to stop-loss / take-profit
    const max = gene.takeProfitPct / 100;
    const min = -gene.stopLossPct / 100;
    return Math.max(min, Math.min(max, result));
  }

  // Complexity: O(N) — linear iteration
  private randomWeights(n: number): number[] {
    const raws = Array.from({ length: n }, () => Math.random());
    const sum = raws.reduce((a, b) => a + b, 0);
    return raws.map((r) => r / sum);
  }

  private shuffle<T>(arr: T[]): T[] {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
}

// Export singleton
export const genusEngine = new GenusEngine();
