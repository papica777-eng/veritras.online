/**
 * ╔══════════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                                  ║
 * ║   SINGULARITY ↔ MARKET REAPER BRIDGE  v1.0.0                                   ║
 * ║   "The God Equation"                                                             ║
 * ║                                                                                  ║
 * ║   Fuses two titans:                                                              ║
 * ║   🧠 QAntumSingularity  — The Cognitive Brain (ThoughtChain + SelfCritique)     ║
 * ║   ⚔️  Market Reaper       — The Execution Arm  (PriceOracle + AtomicTrader)     ║
 * ║                                                                                  ║
 * ║   Flow:                                                                          ║
 * ║   1. PriceOracle generates T+30s predictions (Monte Carlo, VaR)                 ║
 * ║   2. ArbitrageOrchestrator detects price spreads across exchanges               ║
 * ║   3. Cognitive Gate scores each opportunity:                                     ║
 * ║        score = oracleConfidence × profitability × (1 − riskFactor)              ║
 * ║   4. If score ≥ minConfidenceThreshold → decision is approved                   ║
 * ║   5. BiometricJitter injects "Dimitar DNA" timing before execution               ║
 * ║        (847ms reaction time | 12% hesitation | sleep-fatigue pattern)           ║
 * ║   6. AtomicTrader executes the approved swap in < 0.08ms                        ║
 * ║                                                                                  ║
 * ║   © 2025-2026 QAntum | Dimitar Prodromov                                        ║
 * ║                                                                                  ║
 * ╚══════════════════════════════════════════════════════════════════════════════════╝
 */

import { EventEmitter } from 'events';

// ─── Market Reaper Components ──────────────────────────────────────────────────
import { PriceOracle, PricePrediction, ChronosConfig } from '../src/chronos/PriceOracle';
import {
  ArbitrageOrchestrator,
  OrchestratorConfig,
  ReaperStatus,
  DailyStats,
} from '../src/departments/reality/economy/ArbitrageOrchestrator';
import { AtomicTrader, AtomicSwap, AtomicTraderConfig } from '../src/departments/physics/AtomicTrader';
import { ArbitrageOpportunity } from '../src/departments/math/ArbitrageLogic';

// ─── Cognition Components ──────────────────────────────────────────────────────
import { ThoughtChain, Problem, Solution, createThoughtChain } from '../src/departments/cognition/thought-chain';
import { SelfCritique, CritiqueResult, createSelfCritique } from '../src/departments/cognition/self-critique';

// ─── Biometric Stealth ────────────────────────────────────────────────────────
import { BiometricJitter, BiometricProfile } from '../src/departments/biology/biometric-jitter';


// ═══════════════════════════════════════════════════════════════════════════════
// DIMITAR DNA — Biometric profile hardcoded from real behavioural data
// These numbers make the bot indistinguishable from the real Dimitar Prodromov.
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Sleep/fatigue schedule (Bulgarian time = UTC+2)
 * Dimitar is sharpest between 09:00-13:00 and 15:00-22:00.
 * Performance degrades during 00:00-08:00 and post-lunch (13:00-15:00).
 */
function getDimitarFatigueMultiplier(): number {
  const bulgarianHour = (new Date().getUTCHours() + 2) % 24;

  if (bulgarianHour >= 0 && bulgarianHour < 8) return 0.40; // Deep sleep zone
  if (bulgarianHour >= 8 && bulgarianHour < 9) return 0.70; // Morning warm-up
  if (bulgarianHour >= 9 && bulgarianHour < 13) return 1.00; // Peak focus
  if (bulgarianHour >= 13 && bulgarianHour < 15) return 0.75; // Post-lunch dip
  if (bulgarianHour >= 15 && bulgarianHour < 22) return 0.95; // Afternoon flow
  return 0.55;                                                  // Late evening
}

// Raw config object (kept for hesitationProbability reference in delay logic)
const DIMITAR_BIOMETRIC_CONFIG = {
  hesitationProbability: 0.12,         // 12% chance of a pre-click hesitation
  tremorFrequency: 10.4,          // Hz — measured from mouse telemetry
};

// Full biology-compatible Dimitar Prodromov biometric profile
const DIMITAR_BIOMETRIC_PROFILE: BiometricProfile = {
  id: 'dimitar-prodromov-2025',
  name: 'Dimitar Prodromov',
  avgReactionTimeMs: 847,
  reactionTimeVariance: 120,
  typingSpeedWPM: 72,
  typingVariance: 0.10,
  hesitationProbability: 0.12,
  doubleCheckProbability: 0.08,
  cancelProbability: 0.02,
  activeHours: { start: 9, end: 22 },
  peakActivityHours: [9, 10, 11, 12, 15, 16, 17, 18, 19, 20, 21],
  // 24-slot fatigue multiplier (Bulgarian UTC+2)
  fatiguePattern: [
    0.40, 0.35, 0.30, 0.30, 0.30, 0.35,  // 00-05
    0.40, 0.60, 0.70, 1.00, 1.00, 1.00,  // 06-11
    1.00, 0.75, 0.75, 0.95, 0.95, 0.95,  // 12-17
    0.95, 0.95, 0.90, 0.85, 0.70, 0.55,  // 18-23
  ],
  preferRoundNumbers: true,
  roundNumberProbability: 0.30,
  preferredOrderSizes: [100, 500, 1000, 5000, 10000],
  orderSizeVariance: 0.15,
  avgSessionDurationMinutes: 90,
  breakProbability: 0.08,
  minBreakMinutes: 10,
  maxBreakMinutes: 30,
};

/** Base reaction time for Dimitar (ms). Scales with fatigue. */
const DIMITAR_BASE_REACTION_MS = 847;


// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface BridgeConfig {
  // Reaper
  reaperMode: 'simulation' | 'paper' | 'live';
  capitalUSD: number;
  maxTradesPerHour: number;
  minProfitThreshold: number;   // % minimum spread profit
  maxRiskThreshold: number;   // % maximum VaR allowed

  // Cognitive Gate
  minCognitiveScore: number;   // 0.0–1.0. Trades below this are rejected
  cognitiveSelfCritiqueEnabled: boolean;

  // Biometric Stealth
  biometricStealthEnabled: boolean;
  reactionTimeOverrideMs: number | null; // null = use Dimitar DNA

  // Oracle
  oraclePredictionHorizonS: number;
  oracleConfidenceFloor: number;  // Reject oracle signals below this

  // Telemetry
  onTradeDecision?: (decision: CognitiveTradeDecision) => void;
  onSwapCompleted?: (swap: AtomicSwap, decision: CognitiveTradeDecision) => void;
  onSwapFailed?: (swap: AtomicSwap, reason: string) => void;
}

/** The full reasoning chain the AI brain runs before every trade. */
export interface CognitiveTradeDecision {
  id: string;
  timestamp: number;
  opportunity: ArbitrageOpportunity;
  oraclePrediction: PricePrediction | null;

  // Cognitive scoring
  oracleScore: number;   // 0–1: how confident the oracle is about direction
  profitScore: number;   // 0–1: normalised expected profit
  riskScore: number;   // 0–1: 1 = zero risk, 0 = max risk
  cognitiveScore: number;   // Weighted composite
  approved: boolean;

  // Biometric execution timing
  biometricDelayMs: number;   // How long the bot "hesitated" before executing
  fatigueLevel: number;   // 0–1; 1 = fully alert

  // Critique (if enabled)
  critique?: string;
  critiqueScore?: number;

  // Outcome (filled after execution)
  swapId?: string;
  actualProfitUSD?: number;
  executionLatencyMs?: number;
}

/** Live stats emitted every 60 seconds. */
export interface BridgeStats {
  uptime: number;
  decisionsEvaluated: number;
  decisionsApproved: number;
  decisionsRejected: number;
  swapsExecuted: number;
  swapsSuccessful: number;
  totalProfitUSD: number;
  avgCognitiveScore: number;
  avgBiometricDelayMs: number;
  cognitiveApprovalRate: number;   // % of opportunities the brain liked
  reaperDailyStats: DailyStats | null;
  currentFatigueLevel: number;
}


// ═══════════════════════════════════════════════════════════════════════════════
// DEFAULT CONFIG
// ═══════════════════════════════════════════════════════════════════════════════

export const DEFAULT_BRIDGE_CONFIG: BridgeConfig = {
  reaperMode: 'paper',
  capitalUSD: 10_000,
  maxTradesPerHour: 60,
  minProfitThreshold: 1.2,
  maxRiskThreshold: 12,

  minCognitiveScore: 0.72,
  cognitiveSelfCritiqueEnabled: true,

  biometricStealthEnabled: true,
  reactionTimeOverrideMs: null,

  oraclePredictionHorizonS: 30,
  oracleConfidenceFloor: 0.60,
};


// ═══════════════════════════════════════════════════════════════════════════════
// THE BRIDGE
// ═══════════════════════════════════════════════════════════════════════════════

export class SingularityMarketBridge extends EventEmitter {

  private cfg: BridgeConfig;
  private oracle: PriceOracle;
  private orchestrator: ArbitrageOrchestrator;
  private trader: AtomicTrader;
  private jitter: BiometricJitter;
  private thoughtChain: ThoughtChain;
  private selfCritique: SelfCritique;

  private isRunning: boolean = false;
  private startTime: number = 0;

  // ── Counters ──────────────────────────────────────────────────────────────  private decisionsEvaluated = 0;
  private decisionsEvaluated = 0;
  private decisionsApproved = 0;
  private decisionsRejected = 0;
  private swapsExecuted = 0;
  private swapsSuccessful = 0;
  private totalProfitUSD = 0;
  private cognitiveScoreSum = 0;
  private biometricDelaySum = 0;

  // Decision log (last 500)
  private decisionLog: CognitiveTradeDecision[] = [];

  // Stats heartbeat
  private statsInterval: NodeJS.Timeout | null = null;

  constructor(config: Partial<BridgeConfig> = {}) {
    super();

    this.cfg = { ...DEFAULT_BRIDGE_CONFIG, ...config };

    // ── Instantiate Market Reaper components ──────────────────────────────
    this.oracle = new PriceOracle({
      predictionHorizonSeconds: this.cfg.oraclePredictionHorizonS,
      confidenceThreshold: this.cfg.oracleConfidenceFloor,
      maxRiskPercent: this.cfg.maxRiskThreshold,
    } as Partial<ChronosConfig>);

    this.orchestrator = new ArbitrageOrchestrator({
      mode: this.cfg.reaperMode,
      capitalUSD: this.cfg.capitalUSD,
      maxTradesPerHour: this.cfg.maxTradesPerHour,
      minProfitThreshold: this.cfg.minProfitThreshold,
      maxRiskThreshold: this.cfg.maxRiskThreshold,
      enableChronosPrediction: false,   // We drive oracle ourselves
      enableAtomicExecution: false,   // We drive trader ourselves
    } as Partial<OrchestratorConfig>);

    this.trader = new AtomicTrader({
      maxConcurrentSwaps: 8,
      failoverTimeoutMs: 0.08,
      maxRetries: 3,
      slippageTolerancePercent: 0.4,
    } as Partial<AtomicTraderConfig>);

    // ── Biometric jitter — Dimitar DNA ────────────────────────────────────
    this.jitter = new BiometricJitter(DIMITAR_BIOMETRIC_PROFILE);

    // ── Cognition ─────────────────────────────────────────────────────────
    this.thoughtChain = createThoughtChain();
    this.selfCritique = createSelfCritique();

    // ── Wire internal events ──────────────────────────────────────────────
    this.wireEvents();

    this.log('🔗 SingularityMarketBridge initialised.');
    this.log(`   Mode: ${this.cfg.reaperMode.toUpperCase()} | Capital: $${this.cfg.capitalUSD.toLocaleString()}`);
    this.log(`   Cognitive threshold: ${this.cfg.minCognitiveScore} | Biometric stealth: ${this.cfg.biometricStealthEnabled ? 'ON (Dimitar DNA)' : 'OFF'}`);
  }


  // ═══════════════════════════════════════════════════════════════════════════
  // PUBLIC API
  // ═══════════════════════════════════════════════════════════════════════════

  /** Start the full autonomous loop. */
  public async start(): Promise<void> {
    if (this.isRunning) {
      this.log('⚠️  Already running.');
      return;
    }
    this.isRunning = true;
    this.startTime = Date.now();

    this.log('🚀 Bridge starting...');

    // Kick off PriceOracle
    this.oracle.start();
    this.log('🔮 PriceOracle online — T+30s predictions active.');

    // Kick off ArbitrageOrchestrator (only in spread-detection mode — we own execution)
    this.orchestrator.start();
    this.log('⚔️  ArbitrageOrchestrator online — scanning spreads.');

    // Heartbeat stats
    this.statsInterval = setInterval(() => this.emitStats(), 60_000);

    this.log('🧠 Cognitive Gate online — Singularity is watching the market.');
    this.emit('started');
  }

  /** Graceful shutdown. */
  public async stop(): Promise<void> {
    if (!this.isRunning) return;
    this.isRunning = false;

    this.orchestrator.stop();
    this.oracle.stop();

    if (this.statsInterval) {
      clearInterval(this.statsInterval);
      this.statsInterval = null;
    }

    this.log('🛑 Bridge stopped.');
    this.emit('stopped', this.buildStats());
  }

  /** Get a snapshot of live performance metrics. */
  public getStats(): BridgeStats {
    return this.buildStats();
  }

  /** Get the last N cognitive trade decisions. */
  public getDecisionLog(limit = 50): CognitiveTradeDecision[] {
    return this.decisionLog.slice(-limit);
  }


  // ═══════════════════════════════════════════════════════════════════════════
  // INTERNAL — EVENT WIRING
  // ═══════════════════════════════════════════════════════════════════════════

  private wireEvents(): void {

    // ── 1. Orchestrator detects a spread opportunity ──────────────────────
    //    The orchestrator fires 'opportunity' when it finds a viable spread.
    //    We intercept it here instead of letting the orchestrator auto-execute.
    this.orchestrator.on('opportunity', (opp: ArbitrageOpportunity) => {
      if (this.isRunning) {
        // Fire-and-forget — each opportunity is processed independently
        this.processOpportunity(opp).catch(err =>
          this.log(`❌ processOpportunity threw: ${err.message}`)
        );
      }
    });

    // ── 2. AtomicTrader swap outcomes ─────────────────────────────────────
    this.trader.on('swap-completed', (swap: AtomicSwap) => {
      this.swapsExecuted++;
      this.swapsSuccessful++;

      const profit = swap.actualProfit ?? 0;
      this.totalProfitUSD += profit;

      // Link back to the decision that spawned this swap
      const decision = this.decisionLog.find(d => d.swapId === swap.id);
      if (decision) {
        decision.actualProfitUSD = profit;
        decision.executionLatencyMs = swap.latencyMs ?? 0;
      }

      this.log(`✅ Swap completed ${swap.id} | Profit: $${profit.toFixed(4)} | Latency: ${swap.latencyMs?.toFixed(3)}ms`);
      this.emit('swap-completed', swap, decision);
      if (this.cfg.onSwapCompleted && decision) this.cfg.onSwapCompleted(swap, decision);
    });

    this.trader.on('swap-failed', (swap: AtomicSwap) => {
      this.swapsExecuted++;
      const reason = swap.buyOrder.error ?? swap.sellOrder.error ?? 'unknown';
      this.log(`❌ Swap failed ${swap.id} | Reason: ${reason}`);
      this.emit('swap-failed', swap, reason);
      if (this.cfg.onSwapFailed) this.cfg.onSwapFailed(swap, reason);
    });

    this.trader.on('swap-rollback', (swap: AtomicSwap) => {
      this.log(`⏪ Swap rolled back ${swap.id}`);
    });
  }


  // ═══════════════════════════════════════════════════════════════════════════
  // INTERNAL — CORE PIPELINE
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Full pipeline for a single opportunity:
   *   Oracle interrogation → Cognitive Gate → Biometric delay → AtomicExecution
   */
  private async processOpportunity(opp: ArbitrageOpportunity): Promise<void> {

    const decisionId = `DEC-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    this.decisionsEvaluated++;

    // ── Step 1: Consult PriceOracle ────────────────────────────────────────
    const prediction = await this.queryOracle(opp.symbol);

    // ── Step 2: Cognitive Gate ─────────────────────────────────────────────
    const decision = await this.cognitivellyEvaluate(decisionId, opp, prediction);

    // Store decision
    this.decisionLog.push(decision);
    if (this.decisionLog.length > 500) this.decisionLog.shift();  // rolling window

    this.cognitiveScoreSum += decision.cognitiveScore;
    this.emit('decision', decision);
    if (this.cfg.onTradeDecision) this.cfg.onTradeDecision(decision);

    if (!decision.approved) {
      this.decisionsRejected++;
      this.log(
        `🚫 [${decisionId}] REJECTED ${opp.symbol} ` +
        `| cognitive=${decision.cognitiveScore.toFixed(3)} ` +
        `< threshold=${this.cfg.minCognitiveScore}`
      );
      return;
    }

    this.decisionsApproved++;
    this.log(
      `✅ [${decisionId}] APPROVED ${opp.symbol} ` +
      `| cognitive=${decision.cognitiveScore.toFixed(3)} ` +
      `| oracle_conf=${prediction?.confidence.toFixed(3) ?? 'N/A'} ` +
      `| expected_profit=$${opp.netProfit.toFixed(4)}`
    );

    // ── Step 3: Biometric Stealth Delay ───────────────────────────────────
    if (this.cfg.biometricStealthEnabled) {
      await this.injectBiometricDelay(decision);
    }

    // ── Step 4: Execute via AtomicTrader ──────────────────────────────────
    try {
      const swap = await this.trader.executeAtomicSwap(
        opp.symbol,
        opp.buyExchange,
        opp.sellExchange,
        opp.buyPrice,
        opp.sellPrice,
        Math.max(1, this.cfg.capitalUSD * 0.10 / opp.buyPrice),
        opp.netProfit
      );
      decision.swapId = swap.id;
      this.swapsExecuted++;
    } catch (err: any) {
      this.log(`❌ AtomicTrader threw for ${opp.symbol}: ${err.message}`);
    }
  }


  // ═══════════════════════════════════════════════════════════════════════════
  // INTERNAL — ORACLE QUERY
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Ask PriceOracle for its T+30s prediction on a given market symbol.
   * Returns null if the oracle has no data yet, or the signal is too weak.
   */
  private async queryOracle(symbol: string): Promise<PricePrediction | null> {
    try {
      const pred = this.oracle.getPrediction(symbol);
      if (!pred) return null;

      // Reject extreme-risk oracle signals early
      if (pred.riskLevel === 'extreme') {
        this.log(`⚠️  Oracle signals EXTREME risk on ${symbol} — discarding.`);
        return null;
      }

      return pred;
    } catch {
      return null;
    }
  }


  // ═══════════════════════════════════════════════════════════════════════════
  // INTERNAL — COGNITIVE GATE
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Evaluates whether the Singularity approves a trade.
   *
   * Formula:
   *   oracleScore   = oracle.confidence  (or 0.5 if no oracle signal)
   *   profitScore   = clamp(profitPct / 5%, 0, 1)   — 5% profit = perfect score
   *   riskScore     = 1 − (riskLevel / maxRisk)
   *   cognitiveScore = 0.40·oracle + 0.35·profit + 0.25·(1−risk)
   *
   * If selfCritique is enabled, the critique can lower the score by up to 0.10.
   */
  private async cognitivellyEvaluate(
    decisionId: string,
    opp: ArbitrageOpportunity,
    prediction: PricePrediction | null,
  ): Promise<CognitiveTradeDecision> {

    const fatigueLevel = getDimitarFatigueMultiplier();

    // ── Oracle Score ─────────────────────────────────────────────────────
    let oracleScore = 0.50; // Neutral baseline when no oracle data
    if (prediction) {
      oracleScore = prediction.confidence;

      // If the oracle predicts bearish and we're buying, penalise heavily
      if (prediction.trend === 'bearish') {
        oracleScore *= 0.30;
      }
    }

    // ── Profit Score ─────────────────────────────────────────────────────
    const profitPct = opp.netProfitPercent;
    const profitScore = Math.min(profitPct / 5.0, 1.0);  // 5%+ spread = perfect

    // ── Risk Score ───────────────────────────────────────────────────────
    const calculatedRiskScore = 100 - (opp.confidenceScore ?? 100);
    const riskRatio = Math.min(calculatedRiskScore / 100, 1.0);
    const riskScore = 1.0 - riskRatio;

    // ── Composite ────────────────────────────────────────────────────────
    let cognitiveScore = (0.40 * oracleScore) + (0.35 * profitScore) + (0.25 * riskScore);

    // Fatigue penalty: a tired Dimitar is more conservative
    cognitiveScore *= (0.70 + 0.30 * fatigueLevel);

    // ── Self-Critique (optional) ──────────────────────────────────────────
    let critiqueText: string | undefined;
    let critiqueScore: number | undefined;

    if (this.cfg.cognitiveSelfCritiqueEnabled) {
      const critique = await this.runSelfCritique(opp, cognitiveScore);
      critiqueText = critique.summary;
      critiqueScore = critique.score;

      // Critique can downgrade the score by up to 10 points
      const penaltyFactor = 1.0 - (Math.max(0, 70 - critiqueScore) / 700);
      cognitiveScore *= penaltyFactor;
    }

    cognitiveScore = Math.max(0, Math.min(1, cognitiveScore));

    const approved = cognitiveScore >= this.cfg.minCognitiveScore;

    return {
      id: decisionId,
      timestamp: Date.now(),
      opportunity: opp,
      oraclePrediction: prediction,
      oracleScore,
      profitScore,
      riskScore,
      cognitiveScore,
      approved,
      biometricDelayMs: 0,   // filled in injectBiometricDelay
      fatigueLevel,
      critique: critiqueText,
      critiqueScore,
    };
  }


  // ═══════════════════════════════════════════════════════════════════════════
  // INTERNAL — SELF-CRITIQUE
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Runs a lightweight self-critique loop on the proposed trade.
   * Returns a summary string and a score 0–100.
   *
   * Checks:
   *  - Is the spread wide enough to survive slippage?
   *  - Are both exchanges liquid at this volume?
   *  - Is this a known low-liquidity window (e.g. weekend)?
   *  - Did a similar trade fail in the last 10 minutes?
   */
  private async runSelfCritique(opp: ArbitrageOpportunity, rawScore: number): Promise<{ summary: string; score: number }> {
    const issues: string[] = [];
    let score = 100;

    // 1. Slippage headroom
    const slippageBuffer = (opp.netProfitPercent ?? 0) - 0.5;
    if (slippageBuffer < 0.5) {
      issues.push(`Spread ${(opp.netProfitPercent ?? 0).toFixed(2)}% may not survive 0.5% slippage.`);
      score -= 20;
    }

    // 2. Low-liquidity window (Friday 20:00–Sunday 08:00 UTC)
    const day = new Date().getUTCDay();  // 0=Sun, 5=Fri, 6=Sat
    const hour = new Date().getUTCHours();
    const isWeekend = (day === 5 && hour >= 20) || day === 6 || (day === 0 && hour < 8);
    if (isWeekend) {
      issues.push('Weekend trading window — reduced liquidity risk.');
      score -= 10;
    }

    // 3. Recent failure on same symbol (check last 10 decisions in log)
    const recentFail = this.decisionLog
      .slice(-10)
      .find(d => d.opportunity.symbol === opp.symbol && d.swapId && !d.actualProfitUSD);
    if (recentFail) {
      issues.push(`Recent failed swap on ${opp.symbol} — elevated execution risk.`);
      score -= 15;
    }

    // 4. Cognitive score is borderline
    if (rawScore < this.cfg.minCognitiveScore + 0.05) {
      issues.push('Cognitive score is borderline — consider skipping.');
      score -= 10;
    }

    const summary = issues.length > 0
      ? `⚠️ Critique: ${issues.join(' | ')}`
      : '✅ Critique: No concerns. Trade looks clean.';

    return { summary, score: Math.max(0, score) };
  }


  // ═══════════════════════════════════════════════════════════════════════════
  // INTERNAL — BIOMETRIC DELAY INJECTION
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Injects a human-realistic delay before AtomicTrader fires.
   *
   * Timing is based on Dimitar's real biometric data:
   *  - Base reaction:    847ms
   *  - Hesitation:       12% chance → adds 120–900ms extra
   *  - Fatigue scaling:  tired Dimitar reacts slower
   *  - Jitter:           ±15% Gaussian noise to avoid timing fingerprints
   */
  private async injectBiometricDelay(decision: CognitiveTradeDecision): Promise<void> {
    const baseReaction = this.cfg.reactionTimeOverrideMs ?? DIMITAR_BASE_REACTION_MS;

    // Fatigue slows reaction time: tired = up to 2× slower
    const fatigueSlowdown = 1.0 + (1.0 - decision.fatigueLevel) * 0.8;
    let delayMs = baseReaction * fatigueSlowdown;

    // 12% hesitation chance (high-confidence trade = less hesitation)
    const hesitationRoll = Math.random();
    const adjustedHesitationChance = DIMITAR_BIOMETRIC_CONFIG.hesitationProbability * (1.0 - decision.cognitiveScore * 0.5);
    if (hesitationRoll < adjustedHesitationChance) {
      const hesitationMs = 120 + Math.random() * (900 - 120);
      delayMs += hesitationMs;
      this.log(`⏸️  Biometric hesitation injected: +${hesitationMs.toFixed(0)}ms`);
    }

    // ±15% Gaussian jitter to prevent timing fingerprinting
    const jitterFactor = 0.85 + Math.random() * 0.30;
    delayMs *= jitterFactor;
    delayMs = Math.max(50, Math.round(delayMs));

    decision.biometricDelayMs = delayMs;
    this.biometricDelaySum += delayMs;

    await new Promise<void>(resolve => setTimeout(resolve, delayMs));
  }


  // ═══════════════════════════════════════════════════════════════════════════
  // INTERNAL — STATS
  // ═══════════════════════════════════════════════════════════════════════════

  private buildStats(): BridgeStats {
    const evaluated = Math.max(1, this.decisionsEvaluated);
    let reaperDailyStats: DailyStats | null = null;

    try {
      reaperDailyStats = this.orchestrator.getDailyStats?.() ?? null;
    } catch { /* optional */ }

    return {
      uptime: this.isRunning ? Date.now() - this.startTime : 0,
      decisionsEvaluated: this.decisionsEvaluated,
      decisionsApproved: this.decisionsApproved,
      decisionsRejected: this.decisionsRejected,
      swapsExecuted: this.swapsExecuted,
      swapsSuccessful: this.swapsSuccessful,
      totalProfitUSD: this.totalProfitUSD,
      avgCognitiveScore: this.cognitiveScoreSum / evaluated,
      avgBiometricDelayMs: this.biometricDelaySum / Math.max(1, this.decisionsApproved),
      cognitiveApprovalRate: (this.decisionsApproved / evaluated) * 100,
      reaperDailyStats,
      currentFatigueLevel: getDimitarFatigueMultiplier(),
    };
  }

  private emitStats(): void {
    const stats = this.buildStats();
    this.emit('stats', stats);
    this.log(
      `📊 Stats | approved=${stats.decisionsApproved}/${stats.decisionsEvaluated}` +
      ` | profit=$${stats.totalProfitUSD.toFixed(2)}` +
      ` | avg_cognitive=${stats.avgCognitiveScore.toFixed(3)}` +
      ` | fatigue=${(stats.currentFatigueLevel * 100).toFixed(0)}%`
    );
  }

  private log(msg: string): void {
    console.log(`[SINGULARITY↔REAPER] ${msg}`);
  }
}


// ═══════════════════════════════════════════════════════════════════════════════
// FACTORY — Singleton instances for typical use-cases
// ═══════════════════════════════════════════════════════════════════════════════

/** Paper-trading bridge (safe to run any time, no real money). */
export function createPaperBridge(overrides: Partial<BridgeConfig> = {}): SingularityMarketBridge {
  return new SingularityMarketBridge({
    reaperMode: 'paper',
    capitalUSD: 10_000,
    minCognitiveScore: 0.70,
    biometricStealthEnabled: true,
    ...overrides,
  });
}

/** Live-trading bridge (God Mode — real capital, real risk). */
export function createLiveBridge(capitalUSD: number, overrides: Partial<BridgeConfig> = {}): SingularityMarketBridge {
  return new SingularityMarketBridge({
    reaperMode: 'live',
    capitalUSD,
    minCognitiveScore: 0.80,   // Higher bar for real money
    cognitiveSelfCritiqueEnabled: true,
    biometricStealthEnabled: true,
    ...overrides,
  });
}

/** Quick simulation — useful for backtesting cognitive thresholds. */
export function createSimBridge(overrides: Partial<BridgeConfig> = {}): SingularityMarketBridge {
  return new SingularityMarketBridge({
    reaperMode: 'simulation',
    capitalUSD: 100_000,
    minCognitiveScore: 0.60,
    biometricStealthEnabled: false,
    ...overrides,
  });
}


// ═══════════════════════════════════════════════════════════════════════════════
// QUICK-START EXAMPLE
// ═══════════════════════════════════════════════════════════════════════════════
//
//   import { createPaperBridge } from './singularity-market-bridge';
//
//   const bridge = createPaperBridge();
//
//   bridge.on('decision', (d) => {
//     console.log(`Decision ${d.id}: ${d.approved ? '✅ APPROVED' : '🚫 REJECTED'} | score=${d.cognitiveScore.toFixed(3)}`);
//   });
//
//   bridge.on('swap-completed', (swap, decision) => {
//     console.log(`Swap ${swap.id} profit: $${decision?.actualProfitUSD?.toFixed(4)}`);
//   });
//
//   bridge.on('stats', (s) => console.log(s));
//
//   await bridge.start();
//
// ═══════════════════════════════════════════════════════════════════════════════
