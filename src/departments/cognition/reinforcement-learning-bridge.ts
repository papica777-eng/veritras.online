/**
 * ╔═══════════════════════════════════════════════════════════════════════════════════════════════════╗
 * ║   🤖 REINFORCEMENT LEARNING BRIDGE                                                               ║
 * ║   "Teaching the AI to Choose the Immortal Selector Through Experience"                           ║
 * ║   Algorithm: Q-Learning + Thompson Sampling + Upper Confidence Bound                             ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════════════════╝
 */

import { EventEmitter } from 'events';
import * as fs from 'fs';
import * as path from 'path';
import type {
  SelectorDNA,
  SelectorType,
  ReinforcementState,
  QLearningConfig,
  ActionOutcome,
  RewardSignal,
  ExplorationStrategy,
  PolicyGradient,
  ElementGeneticCode,
  ExecutionContext
} from './rl-types';
import { NStepLookAheadSimulator, nStepSimulator } from './n-step-simulator';

const DEFAULT_Q_CONFIG: QLearningConfig = {
  learningRate: 0.1,
  discountFactor: 0.95,
  explorationRate: 0.2,
  minExplorationRate: 0.05,
  explorationDecay: 0.995,
  batchSize: 32,
  memorySize: 10000
};

const REWARD_STRUCTURE = {
  SELECTOR_FOUND: 10,
  ACTION_SUCCEEDED: 15,
  NO_STALE_ELEMENT: 20,
  FAST_FIND: 5,
  CONSISTENT_SUCCESS: 25,
  SURVIVED_UPDATE: 50,
  SELECTOR_NOT_FOUND: -15,
  STALE_ELEMENT: -20,
  ACTION_FAILED: -10,
  TIMEOUT: -25,
  SLOW_FIND: -5,
  FALLBACK_USED: -8,
  MUTATION_DETECTED: 0,
  NEW_SELECTOR_DISCOVERED: 5
};

interface StateKey {
  domain: string;
  pagePath: string;
  elementType: string;
  selectorType: SelectorType;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  dayOfWeek: number;
  isDeploymentWindow: boolean;
  historicalSuccess: 'high' | 'medium' | 'low';
}

interface QTableEntry {
  stateKey: string;
  selectorValue: string;
  qValue: number;
  visits: number;
  lastUpdated: number;
  successCount: number;
  failureCount: number;
  averageResponseTime: number;
}

export class ReinforcementLearningBridge extends EventEmitter {
  private qTable: Map<string, QTableEntry[]>;
  private config: QLearningConfig;
  private experienceBuffer: ActionOutcome[];
  private nStepSimulator: NStepLookAheadSimulator;
  private currentExplorationRate: number;
  private episodeCount: number;
  private totalReward: number;
  private policyGradients: Map<string, PolicyGradient>;
  private persistencePath: string;
  private isDirty: boolean;
  private saveTimer: NodeJS.Timeout | null;
  private qValueBuffer: Float64Array;
  private ucbBuffer: Float64Array;

  constructor(config: Partial<QLearningConfig> = {}) {
    super();
    this.config = { ...DEFAULT_Q_CONFIG, ...config };
    this.qTable = new Map();
    this.experienceBuffer = [];
    this.nStepSimulator = nStepSimulator;
    this.currentExplorationRate = this.config.explorationRate;
    this.episodeCount = 0;
    this.totalReward = 0;
    this.policyGradients = new Map();
    this.persistencePath = path.join(process.cwd(), 'knowledge', 'q-learning.json');
    this.isDirty = false;
    this.saveTimer = null;
    this.qValueBuffer = new Float64Array(100);
    this.ucbBuffer = new Float64Array(100);

    this.loadQTable();
    this.saveTimer = setInterval(() => this.saveQTable(), 60000);

    console.log('🤖 Reinforcement Learning Bridge initialized');
    console.log(`   📊 Learning Rate: ${this.config.learningRate}`);
    console.log(`   🎲 Exploration Rate: ${this.currentExplorationRate}`);
    console.log(`   💾 Q-Table Size: ${this.qTable.size}`);
  }

  // Complexity: O(1) — hash/map lookup
  selectBestSelector(element: ElementGeneticCode, context: ExecutionContext): {
    selector: SelectorDNA; strategy: 'exploit' | 'explore' | 'simulation'; confidence: number;
  } {
    const stateKey = this.generateStateKey(element, context);
    const qEntries = this.qTable.get(stateKey) || [];
    const shouldExplore = Math.random() < this.currentExplorationRate;

    if (shouldExplore && element.selectors.length > 1) {
      return this.exploreSelection(element, qEntries);
    }
    if (qEntries.length > 0) {
      return this.exploitSelection(element, qEntries, context);
    }
    return this.simulationSelection(element, context);
  }

  // Complexity: O(N log N) — sort operation
  private exploreSelection(element: ElementGeneticCode, qEntries: QTableEntry[]): {
    selector: SelectorDNA; strategy: 'explore'; confidence: number;
  } {
    const sampledValues: Array<{ selector: SelectorDNA; sample: number }> = [];
    for (const selector of element.selectors) {
      const entry = qEntries.find(e => e.selectorValue === selector.value);
      const alpha = (entry?.successCount || 0) + 1;
      const beta = (entry?.failureCount || 0) + 1;
      const sample = this.sampleBeta(alpha, beta);
      sampledValues.push({ selector, sample });
    }
    sampledValues.sort((a, b) => b.sample - a.sample);
    const topCandidates = sampledValues.slice(0, Math.min(3, sampledValues.length));
    const chosen = topCandidates[Math.floor(Math.random() * topCandidates.length)];
    this.emit('exploration', { strategy: 'thompson_sampling', chosen: chosen.selector.value, candidates: topCandidates.map(c => c.selector.value) });
    return { selector: chosen.selector, strategy: 'explore', confidence: 0.3 + chosen.sample * 0.4 };
  }

  // Complexity: O(N log N) — sort operation
  private exploitSelection(element: ElementGeneticCode, qEntries: QTableEntry[], context: ExecutionContext): {
    selector: SelectorDNA; strategy: 'exploit'; confidence: number;
  } {
    const totalVisits = qEntries.reduce((sum, e) => sum + e.visits, 0) + 1;
    const ucbScores: Array<{ selector: SelectorDNA; score: number; qValue: number }> = [];

    for (let i = 0; i < element.selectors.length && i < this.qValueBuffer.length; i++) {
      const selector = element.selectors[i];
      const entry = qEntries.find(e => e.selectorValue === selector.value);
      if (entry) {
        const exploitation = entry.qValue;
        const exploration = Math.sqrt(2 * Math.log(totalVisits) / (entry.visits + 1));
        const ucb = exploitation + 2 * exploration;
        this.qValueBuffer[i] = entry.qValue;
        this.ucbBuffer[i] = ucb;
        ucbScores.push({ selector, score: ucb, qValue: entry.qValue });
      } else {
        ucbScores.push({ selector, score: 1000, qValue: 0 });
      }
    }

    ucbScores.sort((a, b) => b.score - a.score);
    const winner = ucbScores[0];
    const entry = qEntries.find(e => e.selectorValue === winner.selector.value);
    const visitConfidence = Math.min(1, (entry?.visits || 0) / 100);
    const qConfidence = (winner.qValue + 100) / 200;
    const confidence = 0.5 + (visitConfidence * 0.25) + (qConfidence * 0.25);
    this.emit('exploitation', { strategy: 'ucb1', chosen: winner.selector.value, qValue: winner.qValue, ucbScore: winner.score, confidence });
    return { selector: winner.selector, strategy: 'exploit', confidence: Math.min(0.99, confidence) };
  }

  // Complexity: O(1) — hash/map lookup
  private simulationSelection(element: ElementGeneticCode, context: ExecutionContext): {
    selector: SelectorDNA; strategy: 'simulation'; confidence: number;
  } {
    const simulation = this.nStepSimulator.simulateFutureState(element, context);
    const confidence = simulation.survivalMatrix.survivalRates.get(simulation.winnerSelector.value) || 0.5;
    this.emit('simulation', { strategy: 'n_step_lookahead', chosen: simulation.winnerSelector.value, survivalRate: confidence });
    return { selector: simulation.winnerSelector, strategy: 'simulation', confidence };
  }

  // Complexity: O(N) — linear iteration
  updateFromOutcome(element: ElementGeneticCode, selector: SelectorDNA, context: ExecutionContext, outcome: ActionOutcome): void {
    const stateKey = this.generateStateKey(element, context);
    const reward = this.calculateReward(outcome);

    let entries = this.qTable.get(stateKey);
    if (!entries) { entries = []; this.qTable.set(stateKey, entries); }

    let entry = entries.find(e => e.selectorValue === selector.value);
    if (!entry) {
      entry = { stateKey, selectorValue: selector.value, qValue: 0, visits: 0, lastUpdated: Date.now(), successCount: 0, failureCount: 0, averageResponseTime: 0 };
      entries.push(entry);
    }

    const maxNextQ = this.getMaxQ(stateKey, selector);
    const tdError = reward + this.config.discountFactor * maxNextQ - entry.qValue;
    entry.qValue += this.config.learningRate * tdError;
    entry.visits++;
    entry.lastUpdated = Date.now();
    if (outcome.success) entry.successCount++; else entry.failureCount++;
    entry.averageResponseTime = (entry.averageResponseTime * (entry.visits - 1) + outcome.responseTimeMs) / entry.visits;

    this.experienceBuffer.push(outcome);
    if (this.experienceBuffer.length > this.config.memorySize) this.experienceBuffer.shift();

    this.currentExplorationRate = Math.max(this.config.minExplorationRate, this.currentExplorationRate * this.config.explorationDecay);
    this.totalReward += reward;
    this.isDirty = true;

    this.emit('qUpdate', { stateKey, selector: selector.value, oldQ: entry.qValue - this.config.learningRate * tdError, newQ: entry.qValue, reward, tdError, explorationRate: this.currentExplorationRate });
  }

  // Complexity: O(1)
  private calculateReward(outcome: ActionOutcome): number {
    let reward = 0;
    if (outcome.success) { reward += REWARD_STRUCTURE.SELECTOR_FOUND; reward += REWARD_STRUCTURE.ACTION_SUCCEEDED; }
    else {
      if (outcome.error?.includes('StaleElement')) reward += REWARD_STRUCTURE.STALE_ELEMENT;
      else if (outcome.error?.includes('Timeout')) reward += REWARD_STRUCTURE.TIMEOUT;
      else reward += REWARD_STRUCTURE.SELECTOR_NOT_FOUND;
    }
    if (outcome.responseTimeMs < 100) reward += REWARD_STRUCTURE.FAST_FIND;
    else if (outcome.responseTimeMs > 1000) reward += REWARD_STRUCTURE.SLOW_FIND;
    if (outcome.usedFallback) reward += REWARD_STRUCTURE.FALLBACK_USED;
    if (outcome.consecutiveSuccesses >= 3) reward += REWARD_STRUCTURE.CONSISTENT_SUCCESS;
    if (outcome.survivedUpdate) reward += REWARD_STRUCTURE.SURVIVED_UPDATE;
    return reward;
  }

  // Complexity: O(1) — hash/map lookup
  private generateStateKey(element: ElementGeneticCode, context: ExecutionContext): string {
    const hour = new Date().getHours();
    const timeOfDay = hour < 6 ? 'night' : hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
    const key: StateKey = { domain: context.domain, pagePath: context.pagePath || '/', elementType: element.tagName.toLowerCase(), selectorType: element.selectors[0]?.type || 'ID', timeOfDay, dayOfWeek: new Date().getDay(), isDeploymentWindow: context.isDeploymentWindow, historicalSuccess: this.getHistoricalSuccessLevel(element) };
    return JSON.stringify(key);
  }

  // Complexity: O(1) — hash/map lookup
  private getHistoricalSuccessLevel(element: ElementGeneticCode): 'high' | 'medium' | 'low' {
    if (element.selectors[0]?.stability > 0.8) return 'high';
    if (element.selectors[0]?.stability > 0.5) return 'medium';
    return 'low';
  }

  // Complexity: O(N) — linear iteration
  private getMaxQ(stateKey: string, excludeSelector?: SelectorDNA): number {
    const entries = this.qTable.get(stateKey) || [];
    const filtered = excludeSelector ? entries.filter(e => e.selectorValue !== excludeSelector.value) : entries;
    if (filtered.length === 0) return 0;
    return Math.max(...filtered.map(e => e.qValue));
  }

  // Complexity: O(N) — potential recursive descent
  private sampleBeta(alpha: number, beta: number): number {
    const gamma1 = this.sampleGamma(alpha);
    const gamma2 = this.sampleGamma(beta);
    return gamma1 / (gamma1 + gamma2);
  }

  // Complexity: O(N*M) — nested iteration detected
  private sampleGamma(shape: number): number {
    if (shape < 1) return this.sampleGamma(shape + 1) * Math.pow(Math.random(), 1 / shape);
    const d = shape - 1/3;
    const c = 1 / Math.sqrt(9 * d);
    while (true) {
      let x, v;
      do { x = this.standardNormal(); v = 1 + c * x; } while (v <= 0);
      v = v * v * v;
      const u = Math.random();
      if (u < 1 - 0.0331 * (x * x) * (x * x)) return d * v;
      if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) return d * v;
    }
  }

  // Complexity: O(1)
  private standardNormal(): number {
    const u1 = Math.random();
    const u2 = Math.random();
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  }

  // Complexity: O(1)
  private loadQTable(): void {
    try {
      if (fs.existsSync(this.persistencePath)) {
        const data = JSON.parse(fs.readFileSync(this.persistencePath, 'utf-8'));
        this.qTable = new Map(Object.entries(data.qTable || {}));
        this.episodeCount = data.episodeCount || 0;
        this.totalReward = data.totalReward || 0;
        this.currentExplorationRate = data.explorationRate || this.config.explorationRate;
        console.log(`   💾 Loaded ${this.qTable.size} Q-table entries`);
      }
    } catch (error) { console.warn('⚠️ Could not load Q-table:', error); }
  }

  // Complexity: O(1)
  private saveQTable(): void {
    if (!this.isDirty) return;
    try {
      const dir = path.dirname(this.persistencePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      const data = { qTable: Object.fromEntries(this.qTable), episodeCount: this.episodeCount, totalReward: this.totalReward, explorationRate: this.currentExplorationRate, savedAt: new Date().toISOString() };
      fs.writeFileSync(this.persistencePath, JSON.stringify(data, null, 2));
      this.isDirty = false;
      this.emit('saved', { entries: this.qTable.size });
    } catch (error) { console.error('❌ Could not save Q-table:', error); }
  }

  // Complexity: O(1)
  getStatistics() {
    return { qTableSize: this.qTable.size, totalEpisodes: this.episodeCount, totalReward: this.totalReward, explorationRate: this.currentExplorationRate, experienceBufferSize: this.experienceBuffer.length };
  }

  // Complexity: O(N log N) — sort operation
  getTopSelectors(element: ElementGeneticCode, context: ExecutionContext, limit: number = 5) {
    const stateKey = this.generateStateKey(element, context);
    const entries = this.qTable.get(stateKey) || [];
    return entries.sort((a, b) => b.qValue - a.qValue).slice(0, limit).map(e => ({ selector: e.selectorValue, qValue: e.qValue, successRate: e.successCount / (e.successCount + e.failureCount) || 0 }));
  }

  // Complexity: O(1)
  setExplorationRate(rate: number): void {
    this.currentExplorationRate = Math.max(this.config.minExplorationRate, Math.min(1, rate));
  }

  // Complexity: O(1)
  reset(): void {
    this.qTable.clear(); this.experienceBuffer = []; this.episodeCount = 0; this.totalReward = 0; this.currentExplorationRate = this.config.explorationRate; this.isDirty = true;
  }

  // Complexity: O(1)
  dispose(): void {
    if (this.saveTimer) clearInterval(this.saveTimer);
    this.saveQTable();
  }
}

export const rlBridge = new ReinforcementLearningBridge();
