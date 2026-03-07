/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║                                                                           ║
 * ║   🧠 META-COGNITIVE OVERWATCH – "The Observer"                            ║
 * ║   "I watch the watchers. I veto the reckless."                            ║
 * ║                                                                           ║
 * ║   Part of QANTUM SINGULARITY – Safety Layer                               ║
 * ║                                                                           ║
 * ║   Role:                                                                   ║
 * ║     • Does NOT trade.                                                     ║
 * ║     • Monitors every BrainRouter decision before execution.               ║
 * ║     • Detects bias, overconfidence, or logical inconsistencies.           ║
 * ║     • Issues VETO if confidence < threshold for critical operations.      ║
 * ║     • Logs all veto events for post-analysis and self-improvement.        ║
 * ║                                                                           ║
 * ║   © 2025-2026 QAntum | Dimitar Prodromov                                  ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

import { EventEmitter } from 'events';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

/** Severity of the operation being reviewed */
export type OperationSeverity = 'low' | 'medium' | 'high' | 'critical';

/** The decision submitted by BrainRouter for review */
export interface RouterDecision {
  id: string;
  action: string;              // Human-readable description of the action
  reasoning: string[];         // Chain-of-thought from the LLM
  confidence: number;          // 0.0 – 1.0
  severity: OperationSeverity;
  metadata: Record<string, unknown>;
  timestamp: number;
}

/** Overwatch verdict */
export interface OversightVerdict {
  decisionId: string;
  approved: boolean;
  vetoReason?: string;         // Present when approved === false
  warnings: string[];          // Non-blocking concerns
  biasFlags: BiasFlag[];
  riskScore: number;           // 0.0 – 1.0 (higher = more risky)
  reviewedAt: number;
}

/** Types of cognitive bias Overwatch can detect */
export interface BiasFlag {
  type: BiasType;
  description: string;
  severity: 'info' | 'warning' | 'critical';
}

export type BiasType =
  | 'overconfidence'       // confidence > 0.99 with low historical accuracy
  | 'recency_bias'         // too many decisions based only on recent events
  | 'confirmation_bias'    // reasoning loop only supporting the original action
  | 'aggression_bias'      // position sizes / risk consistently at maximum
  | 'loss_aversion_bias'   // excessive hesitation after a loss streak
  | 'anchoring_bias';      // reasoning anchored to a single price level

/** Config for Overwatch thresholds */
export interface OverwatchConfig {
  /** Minimum confidence required for CRITICAL operations */
  criticalConfidenceThreshold: number;   // default 0.999
  /** Minimum confidence required for HIGH operations */
  highConfidenceThreshold: number;       // default 0.95
  /** Minimum confidence required for MEDIUM operations */
  mediumConfidenceThreshold: number;     // default 0.80
  /** Maximum consecutive aggressive decisions before bias flag */
  maxAggressionStreak: number;           // default 5
  /** Maximum consecutive same-direction decisions before flag */
  maxDirectionStreak: number;            // default 8
  /** Window size for recency bias detection */
  recencyWindowSize: number;             // default 20
  /** Enable automatic veto (vs warn-only) */
  autoVeto: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// OVERWATCH CLASS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * MetaCognitiveOverwatch
 *
 * Acts as an independent metacognitive layer that reviews every RouterDecision
 * before it reaches the execution engine. If it detects logical flaws, bias
 * patterns, or insufficient confidence for the risk level, it issues a VETO
 * that blocks execution until a human override or re-evaluation is provided.
 */
export class MetaCognitiveOverwatch extends EventEmitter {
  private readonly config: OverwatchConfig;
  private decisionHistory: RouterDecision[] = [];
  private vetoHistory: OversightVerdict[] = [];
  private directionStreak: { action: string; count: number } = { action: '', count: 0 };
  private aggressionStreak = 0;

  constructor(config: Partial<OverwatchConfig> = {}) {
    super();
    this.config = {
      criticalConfidenceThreshold: 0.999,
      highConfidenceThreshold: 0.95,
      mediumConfidenceThreshold: 0.80,
      maxAggressionStreak: 5,
      maxDirectionStreak: 8,
      recencyWindowSize: 20,
      autoVeto: true,
      ...config,
    };

    console.log('🧠 Meta-Cognitive Overwatch online');
    console.log(`   🔒 Critical threshold: ${this.config.criticalConfidenceThreshold}`);
    console.log(`   ⚡ Auto-veto: ${this.config.autoVeto}`);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PUBLIC API
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Main entry point.
   * Call BEFORE executing any decision from BrainRouter.
   * Returns a verdict; if `verdict.approved === false` → VETO, do not execute.
   */
  // Complexity: O(N) — linear iteration
  review(decision: RouterDecision): OversightVerdict {
    const warnings: string[] = [];
    const biasFlags: BiasFlag[] = [];

    // 1. Confidence check
    const confidenceVeto = this.checkConfidence(decision, warnings);

    // 2. Bias detection
    this.detectOverconfidence(decision, biasFlags);
    this.detectAggressionBias(decision, biasFlags);
    this.detectDirectionBias(decision, biasFlags);
    this.detectConfirmationBias(decision, biasFlags);
    this.detectRecencyBias(decision, warnings);

    // 3. Reasoning coherence
    this.checkReasoningCoherence(decision, warnings);

    // 4. Compute overall risk score
    const riskScore = this.computeRiskScore(decision, biasFlags);

    // 5. Decide veto
    const criticalBias = biasFlags.some((f) => f.severity === 'critical');
    const approved = this.config.autoVeto
      ? !confidenceVeto && !criticalBias && riskScore < 0.85
      : true; // warn-only mode

    const vetoReason = !approved
      ? confidenceVeto
        ? `Confidence ${decision.confidence.toFixed(4)} below threshold for ${decision.severity} operation`
        : criticalBias
          ? `Critical bias detected: ${biasFlags.filter((f) => f.severity === 'critical').map((f) => f.type).join(', ')}`
          : `Risk score ${riskScore.toFixed(3)} exceeds maximum allowed threshold`
      : undefined;

    const verdict: OversightVerdict = {
      decisionId: decision.id,
      approved,
      vetoReason,
      warnings,
      biasFlags,
      riskScore,
      reviewedAt: Date.now(),
    };

    // Record history
    this.decisionHistory.push(decision);
    if (this.decisionHistory.length > 500) this.decisionHistory.shift();

    if (!approved) {
      this.vetoHistory.push(verdict);
      if (this.vetoHistory.length > 200) this.vetoHistory.shift();
      this.emit('veto', { verdict, decision });
      console.warn(`🚫 VETO [${decision.id}] – ${vetoReason}`);
    } else {
      this.emit('approved', { verdict, decision });
    }

    // Update streak trackers
    this.updateStreaks(decision);

    return verdict;
  }

  /** Get veto statistics */
  // Complexity: O(N) — linear iteration
  getStats(): {
    totalReviewed: number;
    totalVetoed: number;
    vetoRate: number;
    recentBiasTypes: string[];
  } {
    const vetoCount = this.vetoHistory.length;
    const totalCount = this.decisionHistory.length;
    const recentBiases = this.vetoHistory
      .slice(-10)
      .flatMap((v) => v.biasFlags.map((f) => f.type));
    return {
      totalReviewed: totalCount,
      totalVetoed: vetoCount,
      vetoRate: totalCount > 0 ? vetoCount / totalCount : 0,
      recentBiasTypes: [...new Set(recentBiases)],
    };
  }

  /** Force clear streak counters (use after cooldown period) */
  // Complexity: O(1)
  resetStreaks(): void {
    this.directionStreak = { action: '', count: 0 };
    this.aggressionStreak = 0;
    this.emit('streaksReset');
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PRIVATE – CHECKS
  // ─────────────────────────────────────────────────────────────────────────

  // Complexity: O(N)
  private checkConfidence(decision: RouterDecision, warnings: string[]): boolean {
    const thresholds: Record<OperationSeverity, number> = {
      low: 0,
      medium: this.config.mediumConfidenceThreshold,
      high: this.config.highConfidenceThreshold,
      critical: this.config.criticalConfidenceThreshold,
    };
    const required = thresholds[decision.severity];
    if (decision.confidence < required) {
      warnings.push(
        `Confidence ${decision.confidence.toFixed(4)} is below required ${required} for ${decision.severity} operations`,
      );
      return true; // triggers veto
    }
    return false;
  }

  // Complexity: O(N) — linear iteration
  private detectOverconfidence(decision: RouterDecision, flags: BiasFlag[]): void {
    if (decision.confidence > 0.99 && decision.severity === 'critical') {
      // Check historical accuracy
      const recent = this.decisionHistory.slice(-50);
      const highConfidence = recent.filter((d) => d.confidence > 0.99);
      if (highConfidence.length > 10) {
        flags.push({
          type: 'overconfidence',
          description: `${highConfidence.length} of last 50 decisions had confidence >0.99 – statistical improbability`,
          severity: 'warning',
        });
      }
    }
  }

  // Complexity: O(1)
  private detectAggressionBias(decision: RouterDecision, flags: BiasFlag[]): void {
    const posSize = (decision.metadata.positionSizePct as number | undefined) ?? 0;
    const isAggressive = posSize > 15 || decision.confidence > 0.97;
    if (isAggressive) {
      this.aggressionStreak++;
    } else {
      this.aggressionStreak = 0;
    }

    if (this.aggressionStreak >= this.config.maxAggressionStreak) {
      flags.push({
        type: 'aggression_bias',
        description: `${this.aggressionStreak} consecutive aggressive decisions detected`,
        severity: this.aggressionStreak >= this.config.maxAggressionStreak * 2 ? 'critical' : 'warning',
      });
    }
  }

  // Complexity: O(1)
  private detectDirectionBias(decision: RouterDecision, flags: BiasFlag[]): void {
    if (decision.action === this.directionStreak.action) {
      this.directionStreak.count++;
    } else {
      this.directionStreak = { action: decision.action, count: 1 };
    }

    if (this.directionStreak.count >= this.config.maxDirectionStreak) {
      flags.push({
        type: 'recency_bias',
        description: `${this.directionStreak.count} consecutive '${decision.action}' decisions – possible directional fixation`,
        severity: 'warning',
      });
    }
  }

  // Complexity: O(1)
  private detectConfirmationBias(decision: RouterDecision, flags: BiasFlag[]): void {
    if (decision.reasoning.length < 2) return;
    // Simple heuristic: if all reasoning strings contain the same keyword as action, flag it
    const actionWord = decision.action.toLowerCase();
    const allConfirming = decision.reasoning.every(
      (r) => r.toLowerCase().includes(actionWord) || r.toLowerCase().includes('confirm'),
    );
    if (allConfirming && decision.reasoning.length >= 3) {
      flags.push({
        type: 'confirmation_bias',
        description: 'All reasoning steps confirm the action without considering alternatives',
        severity: 'warning',
      });
    }
  }

  // Complexity: O(N) — linear iteration
  private detectRecencyBias(decision: RouterDecision, warnings: string[]): void {
    const window = this.decisionHistory.slice(-this.config.recencyWindowSize);
    if (window.length < this.config.recencyWindowSize) return;

    const recentMs = window.map((d) => d.timestamp);
    const span = recentMs[recentMs.length - 1] - recentMs[0];
    // If all recent decisions happened within 10 seconds, flag as recency bias
    if (span < 10_000 && window.length >= this.config.recencyWindowSize) {
      warnings.push(
        `${window.length} decisions in ${(span / 1000).toFixed(1)}s – possible recency/speed bias`,
      );
    }
  }

  // Complexity: O(1)
  private checkReasoningCoherence(decision: RouterDecision, warnings: string[]): void {
    if (decision.reasoning.length === 0) {
      warnings.push('Decision has no reasoning chain – black-box decision detected');
      return;
    }
    if (decision.reasoning.some((r) => r.length < 10)) {
      warnings.push('Some reasoning steps are suspiciously short (< 10 chars)');
    }
  }

  // Complexity: O(N) — linear iteration
  private computeRiskScore(decision: RouterDecision, biasFlags: BiasFlag[]): number {
    let score = 0;

    // Base risk from severity
    const severityWeights: Record<OperationSeverity, number> = {
      low: 0.1,
      medium: 0.3,
      high: 0.6,
      critical: 0.9,
    };
    score += severityWeights[decision.severity] * 0.3;

    // Inverse confidence contribution
    score += (1 - decision.confidence) * 0.3;

    // Bias flags
    for (const flag of biasFlags) {
      if (flag.severity === 'critical') score += 0.25;
      else if (flag.severity === 'warning') score += 0.1;
    }

    // Aggression streak
    score += Math.min(0.2, this.aggressionStreak * 0.04);

    return Math.min(1.0, score);
  }

  // Complexity: O(N)
  private updateStreaks(decision: RouterDecision): void {
    // Direction tracking is done in detectDirectionBias above
    // Aggression tracking is done in detectAggressionBias above
    // This is kept for any additional streak tracking
  }
}

// Export singleton
export const overwatch = new MetaCognitiveOverwatch();
