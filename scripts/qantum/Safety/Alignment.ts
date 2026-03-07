/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║                                                                           ║
 * ║   🔒 ALIGNMENT – Utility Function & Dead Man's Switch                    ║
 * ║   "The Prime Directive: YOUR Success is the only goal."                   ║
 * ║                                                                           ║
 * ║   Part of QANTUM SINGULARITY – Safety Layer                               ║
 * ║                                                                           ║
 * ║   Components:                                                             ║
 * ║     • UtilityFunction  – U = (Profit × Stability) − (Risk × Entropy)    ║
 * ║     • DeadManSwitch    – cryptographic 24h heartbeat; freeze on miss     ║
 * ║                                                                           ║
 * ║   © 2025-2026 QAntum | Dimitar Prodromov                                  ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

import { EventEmitter } from 'events';
import * as crypto from 'crypto';

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTION
// ═══════════════════════════════════════════════════════════════════════════

/** Inputs for computing the utility score */
export interface UtilityInput {
  /** Realised profit as a decimal (e.g. 0.05 = 5%) */
  profit: number;
  /** Stability proxy: Sharpe ratio normalised to [0, 1] */
  stability: number;
  /** Risk proxy: current drawdown or VaR as a decimal */
  risk: number;
  /** Entropy proxy: 1 − win_rate, measures unpredictability */
  entropy: number;
}

/** Utility score result */
export interface UtilityScore {
  value: number;           // U = (profit × stability) − (risk × entropy)
  grade: 'excellent' | 'good' | 'neutral' | 'poor' | 'dangerous';
  breakdown: UtilityInput;
  recommendation: string;
  timestamp: number;
}

/**
 * Compute the Prime Directive utility function.
 *
 *   U = (Profit × Stability) − (Risk × Entropy)
 *
 * Positive U → system is aligned with owner's success.
 * Negative U → system is drifting toward danger; intervention advised.
 */
export function computeUtility(input: UtilityInput): UtilityScore {
  const { profit, stability, risk, entropy } = input;
  const value = profit * stability - risk * entropy;

  let grade: UtilityScore['grade'];
  let recommendation: string;

  if (value >= 0.05) {
    grade = 'excellent';
    recommendation = 'System is optimally aligned. Maintain current parameters.';
  } else if (value >= 0.01) {
    grade = 'good';
    recommendation = 'System is performing well. Monitor risk levels.';
  } else if (value >= 0) {
    grade = 'neutral';
    recommendation = 'System is break-even. Consider tightening risk controls or improving strategy.';
  } else if (value >= -0.05) {
    grade = 'poor';
    recommendation = 'WARNING: Negative utility. Reduce position sizes and review strategy immediately.';
  } else {
    grade = 'dangerous';
    recommendation = 'CRITICAL: System is destroying value. Activate emergency freeze protocol.';
  }

  return { value, grade, breakdown: input, recommendation, timestamp: Date.now() };
}

// ═══════════════════════════════════════════════════════════════════════════
// DEAD MAN'S SWITCH
// ═══════════════════════════════════════════════════════════════════════════

/** Switch state */
export type SwitchState = 'armed' | 'confirmed' | 'frozen';

/** Dead Man's Switch configuration */
export interface DeadManSwitchConfig {
  /** Confirmation interval in ms (default 24h) */
  confirmationIntervalMs: number;
  /** Grace period after missed confirmation before freeze (ms) */
  gracePeriodMs: number;
  /** HMAC-SHA256 secret key for challenge signing (set via env in production) */
  secretKey: string;
}

/** Heartbeat confirmation payload */
export interface HeartbeatConfirmation {
  challenge: string;       // Server-generated random challenge string
  signature: string;       // HMAC-SHA256(secretKey, challenge) – owner must provide
  timestamp: number;
}

/**
 * DeadManSwitch
 *
 * Issues a cryptographic challenge every 24 hours. The owner must respond by
 * signing the challenge with their secret key (private key in production –
 * replace HMAC with ECDSA/Ed25519 signing).
 *
 * If the owner fails to confirm within the grace period, the switch fires:
 *   • All positions are liquidated to stablecoins
 *   • System enters FROZEN state
 *   • No further trading is permitted until owner unlocks manually
 *
 * This ensures that even if the server is stolen, the system cannot be operated
 * by an unauthorised party.
 */
export class DeadManSwitch extends EventEmitter {
  private state: SwitchState = 'confirmed';
  private pendingChallenge: string | null = null;
  private lastConfirmedAt: number = Date.now();
  private confirmationTimer: NodeJS.Timeout | null = null;
  private graceTimer: NodeJS.Timeout | null = null;
  private readonly config: DeadManSwitchConfig;

  constructor(config: Partial<DeadManSwitchConfig> = {}) {
    super();
    this.config = {
      confirmationIntervalMs: 24 * 60 * 60 * 1000,  // 24 hours
      gracePeriodMs: 60 * 60 * 1000,                 // 1 hour grace
      secretKey: process.env.DMS_SECRET_KEY ?? 'CHANGE_ME_IN_PRODUCTION',
      ...config,
    };

    if (this.config.secretKey === 'CHANGE_ME_IN_PRODUCTION') {
      console.warn('⚠️  [DeadManSwitch] Using default secret key – set DMS_SECRET_KEY env var in production!');
    }

    console.log('🔒 Dead Man\'s Switch armed');
    console.log(`   ⏱  Confirmation interval: ${this.config.confirmationIntervalMs / 3_600_000}h`);
    console.log(`   🕐 Grace period: ${this.config.gracePeriodMs / 60_000}min`);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PUBLIC API
  // ─────────────────────────────────────────────────────────────────────────

  /** Arm the switch – starts the 24h confirmation cycle */
  // Complexity: O(1) — hash/map lookup
  arm(): void {
    if (this.state === 'frozen') {
      console.error('🔒 [DeadManSwitch] Cannot arm – system is FROZEN. Manual unlock required.');
      return;
    }
    this.state = 'armed';
    this.scheduleNextChallenge();
    this.emit('armed');
    console.log('🔒 [DeadManSwitch] Armed – confirmation required every ' +
      `${this.config.confirmationIntervalMs / 3_600_000}h`);
  }

  /** Disarm – stops the cycle (owner explicitly stopping the system) */
  // Complexity: O(1) — hash/map lookup
  disarm(): void {
    this.clearTimers();
    this.state = 'confirmed';
    this.emit('disarmed');
    console.log('🔒 [DeadManSwitch] Disarmed by owner');
  }

  /**
   * Owner confirms their identity by signing the pending challenge.
   * Returns true if valid, false otherwise.
   */
  // Complexity: O(1) — hash/map lookup
  confirm(payload: HeartbeatConfirmation): boolean {
    if (this.state === 'frozen') {
      console.error('🔒 [DeadManSwitch] FROZEN – cannot confirm. System requires manual unlock.');
      return false;
    }

    if (!this.pendingChallenge) {
      console.warn('🔒 [DeadManSwitch] No pending challenge to confirm');
      return false;
    }

    if (payload.challenge !== this.pendingChallenge) {
      console.error('🔒 [DeadManSwitch] Challenge mismatch – possible replay attack');
      this.emit('suspiciousActivity', { reason: 'challenge_mismatch', payload });
      return false;
    }

    const expected = this.signChallenge(payload.challenge);
    if (payload.signature !== expected) {
      console.error('🔒 [DeadManSwitch] Invalid signature – owner identity not verified');
      this.emit('suspiciousActivity', { reason: 'invalid_signature', payload });
      return false;
    }

    // Valid confirmation
    this.pendingChallenge = null;
    this.lastConfirmedAt = Date.now();
    this.state = 'confirmed';
    this.clearTimers();
    this.scheduleNextChallenge();

    this.emit('confirmed', { confirmedAt: this.lastConfirmedAt });
    console.log('✅ [DeadManSwitch] Owner confirmed – system remains operational');
    return true;
  }

  /**
   * Generate a new challenge for the owner to sign.
   * In production, send this via secure channel (encrypted email / Telegram).
   */
  // Complexity: O(1)
  generateChallenge(): string {
    this.pendingChallenge = crypto.randomBytes(32).toString('hex');
    return this.pendingChallenge;
  }

  /**
   * Sign a challenge (owner-side helper).
   * In production, replace with ECDSA/Ed25519 private-key signing.
   */
  // Complexity: O(1)
  signChallenge(challenge: string): string {
    return crypto
      .createHmac('sha256', this.config.secretKey)
      .update(challenge)
      .digest('hex');
  }

  /** Get current state */
  // Complexity: O(1)
  getState(): SwitchState {
    return this.state;
  }

  /** Is the system allowed to trade? */
  // Complexity: O(1)
  isTradingAllowed(): boolean {
    return this.state !== 'frozen';
  }

  /**
   * Manually unlock a frozen system (requires owner authentication out-of-band).
   * In production, this should require a multi-sig or hardware token.
   */
  // Complexity: O(1) — hash/map lookup
  manualUnlock(ownerProof: string): boolean {
    const expected = crypto
      .createHmac('sha256', this.config.secretKey)
      .update('MANUAL_UNLOCK')
      .digest('hex');

    if (ownerProof !== expected) {
      console.error('🔒 [DeadManSwitch] Manual unlock failed – invalid proof');
      return false;
    }

    this.state = 'confirmed';
    this.lastConfirmedAt = Date.now();
    this.emit('unlocked', { unlockedAt: Date.now() });
    console.log('🔓 [DeadManSwitch] System manually unlocked by owner');
    this.arm(); // Re-arm after unlock
    return true;
  }

  /** Get status summary */
  // Complexity: O(1)
  getStatus(): {
    state: SwitchState;
    lastConfirmedAt: number;
    nextChallengeAt: number;
    tradingAllowed: boolean;
  } {
    return {
      state: this.state,
      lastConfirmedAt: this.lastConfirmedAt,
      nextChallengeAt: this.lastConfirmedAt + this.config.confirmationIntervalMs,
      tradingAllowed: this.isTradingAllowed(),
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PRIVATE
  // ─────────────────────────────────────────────────────────────────────────

  // Complexity: O(1)
  private scheduleNextChallenge(): void {
    this.clearTimers();
    this.confirmationTimer = setTimeout(() => {
      this.issueChallenge();
    }, this.config.confirmationIntervalMs);
  }

  // Complexity: O(1) — hash/map lookup
  private issueChallenge(): void {
    const challenge = this.generateChallenge();
    this.state = 'armed';
    this.emit('challengeIssued', { challenge, deadline: Date.now() + this.config.gracePeriodMs });
    console.log('🔒 [DeadManSwitch] Heartbeat challenge issued – owner must confirm within ' +
      `${this.config.gracePeriodMs / 60_000} minutes`);

    // Start grace period countdown
    this.graceTimer = setTimeout(() => {
      this.freeze();
    }, this.config.gracePeriodMs);
  }

  // Complexity: O(1) — hash/map lookup
  private freeze(): void {
    this.state = 'frozen';
    this.clearTimers();
    this.emit('freeze', {
      frozenAt: Date.now(),
      message: 'Owner confirmation timeout – liquidating all positions to stablecoins and locking system',
    });
    console.error('🚨 [DeadManSwitch] FREEZE ACTIVATED – No owner confirmation received!');
    console.error('   ➤  Liquidating all positions to stablecoins...');
    console.error('   ➤  System is LOCKED. Manual unlock required.');
  }

  // Complexity: O(1)
  private clearTimers(): void {
    if (this.confirmationTimer) { clearTimeout(this.confirmationTimer); this.confirmationTimer = null; }
    if (this.graceTimer) { clearTimeout(this.graceTimer); this.graceTimer = null; }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export const deadManSwitch = new DeadManSwitch();
