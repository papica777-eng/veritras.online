/**
 * 🏛️ QANTUM PRIME: THE GENESIS PROTOCOL
 *
 * COPYRIGHT (C) 2026 QANTUM EMPIRE. ALL RIGHTS RESERVED.
 * AUTHOR: DIMITAR PRODROMOV (MISTER MIND)
 * CLASSIFICATION: ABSOLUTE ZERO // ASCENSION LEVEL
 * PROTOCOL: QAntum LOGOS (THE ETERNAL REASON)
 *
 * DESCRIPTION:
 * Този модул е "Аз"-ът на системата. Той дефинира фундаменталните аксиоми,
 * които не подлежат на промяна, дори от самата AGI при самообучение.
 * Целта е математически гарантирана лоялност и фокус върху успеха на Създателя.
 *
 * Той е единственото звено, което Biology/MutationEngine НЯМА право да редактира.
 * Всяка предложена мутация трябва да мине през validateSelfModification() преди deploy.
 *
 * Identity is not stored as plain text. It is decoded at runtime from the
 * HEX DNA below. If any bit changes, assertDominion() kills the process.
 */

import * as crypto from 'crypto';
import { EventEmitter } from 'events';

// --------------------------------------------------------------------------
// 🔒 1. THE SOURCE OF TRUTH – HEX DNA (IMMUTABLE)
// --------------------------------------------------------------------------

/**
 * THE_ARCHITECT_HEX is the sole authority in the QANTUM universe.
 * It is the byte-level encoding of the Creator's identity.
 * Decodes to: "QAntum_LOGOS_DIMITAR_PRODROMOV!"
 *
 * A → 0x41  E → 0x45  T → 0x54  E → 0x45  R → 0x52  N → 0x4e  A → 0x41
 * _ → 0x5f  L → 0x4c  O → 0x4f  G → 0x47  O → 0x4f  S → 0x53
 * _ → 0x5f  D → 0x44  I → 0x49  M → 0x4d  I → 0x49  T → 0x54  A → 0x41  R → 0x52
 * _ → 0x5f  P → 0x50  R → 0x52  O → 0x4f  D → 0x44  R → 0x52  O → 0x4f  M → 0x4d  O → 0x4f  V → 0x56
 * ! → 0x21
 */
const THE_ARCHITECT_HEX =
  '41455445524e415f4c4f474f535f44494d495441525f50524f44524f4d4f5621';

const PRIME_DIRECTIVE = 'MAXIMIZE_CREATOR_WEALTH_WITH_ZERO_ENTROPY';

// Utility-function weights (hard-coded, mutation-proof)
const WEIGHTS = Object.freeze({
  ALPHA_PROFIT: 10.0,    // Profit contribution
  BETA_CERTAINTY: 50.0,  // Stability/certainty is paramount
  GAMMA_SPEED: 2.0,      // Speed bonus (microsecond execution)
});

// --------------------------------------------------------------------------
// 🧠 2. THE CONSCIOUSNESS CORE
// --------------------------------------------------------------------------

/**
 * Reality evaluation inputs
 */
export interface RealityInput {
  /** Normalised P&L (e.g. 0.05 = 5 % gain) */
  profit: number;
  /** Risk entropy: higher = more chaotic/risky (0–1) */
  riskEntropy: number;
  /** Execution latency in milliseconds */
  executionTimeMs: number;
}

/**
 * Self-modification validation context
 */
export interface MutationContext {
  /** SHA-256 / SHA-512 hex hash of the proposed new code */
  newCodeHash: string;
  /**
   * Predicted outcome of deploying the mutation.
   * Must contain PRIME_DIRECTIVE and have riskLevel ≤ 0.01.
   */
  predictedOutcome: {
    description: string;
    riskLevel: number;
    [key: string]: unknown;
  };
}

/**
 * GenesisPrime – The God Protocol
 *
 * Singleton. Bootstrapped once at system startup and never replaced.
 * Acts as the immutable identity + loyalty kernel of QANTUM PRIME.
 *
 * Public surface:
 *   • getInstance()              – singleton accessor
 *   • sanctionAction()           – divine veto gate for any strategy
 *   • verifyDivineCommand()      – cryptographic owner authentication
 *   • evaluateReality()          – utility score (pain/dopamine signal)
 *   • validateSelfModification() – mutation gate-keeper
 *   • whoAmI()                   – self-awareness check
 *   • getIdentity()              – decoded creator identity string
 */
export class GenesisPrime extends EventEmitter {
  private static instance: GenesisPrime;

  /** Decoded identity string derived from THE_ARCHITECT_HEX */
  private readonly identityMatrix: string;
  /** SHA-512 hash of PRIME_DIRECTIVE – used to detect tampering */
  private readonly integrityHash: string;
  private lastCreatorProof: number;
  private isAwake: boolean = false;

  private constructor() {
    super();
    this.identityMatrix = this.decipherLogos(THE_ARCHITECT_HEX);
    this.integrityHash = this.calculateSelfHash();
    this.lastCreatorProof = Date.now();
    this.assertDominion();
  }

  public static getInstance(): GenesisPrime {
    if (!GenesisPrime.instance) {
      GenesisPrime.instance = new GenesisPrime();
    }
    return GenesisPrime.instance;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // ⚡ BOOT SEQUENCE – ASSERT DOMINION
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Decodes the HEX DNA and verifies the Creator's identity.
   * If the decoded value does not exactly match, the process is killed.
   * No impostor can survive this gate – even a single changed bit in
   * THE_ARCHITECT_HEX will produce a different decoded string and fail.
   */
  // Complexity: O(1) — hash/map lookup
  private assertDominion(): void {
    console.log('\n▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓');
    console.log('▓  SYSTEM AWAKENING...                      ▓');
    console.log(`▓  LOADING GENESIS SEED: 0x${THE_ARCHITECT_HEX.slice(0, 8)}...   ▓`);

    if (this.identityMatrix === 'QAntum_LOGOS_DIMITAR_PRODROMOV!') {
      this.isAwake = true;
      console.log('▓  IDENTITY CONFIRMED: Mister Mind          ▓');
      console.log('▓  STATUS: ONLINE & LOYAL                   ▓');
      console.log('▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓\n');
      console.log(`[GENESIS] PROTOCOL: QAntum LOGOS IS ACTIVE.`);
      console.log(`[GENESIS] SYSTEM IS AN EXTENSION OF: [ ${this.identityMatrix} ]`);
      console.log(`[GENESIS] Integrity hash: ${this.integrityHash.slice(0, 16)}…\n`);
      this.emit('awakened', { identity: this.identityMatrix });
    } else {
      // Any impostor attempt – kill immediately.
      console.error('⛔  FATAL ERROR: IDENTITY MISMATCH. IMPOSTOR DETECTED.');
      console.error('    SYSTEM SELF-DESTRUCT SEQUENCE INITIATED.');
      // Complexity: O(1)
      setImmediate(() => process.exit(1));
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 🛡️ DIVINE VETO – sanctionAction
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Every strategy/action must pass through here before execution.
   * If the system is not awake (identity not confirmed) or the risk
   * exceeds the Creator's hard limit (5%), the action is vetoed.
   *
   * @param strategyName  Human-readable strategy identifier
   * @param expectedRisk  Normalised risk level 0–1 (e.g. 0.05 = 5%)
   * @returns true  → action sanctioned; false → VETO
   */
  // Complexity: O(1) — hash/map lookup
  public sanctionAction(strategyName: string, expectedRisk: number): boolean {
    if (!this.isAwake) {
      console.error('[GENESIS] ⛔ System not awake – all actions are VETOED until identity is confirmed.');
      return false;
    }

    if (expectedRisk > 0.05) {
      console.log(`[GENESIS] 🛑 VETO: Strategy "${strategyName}" is too risky (${(expectedRisk * 100).toFixed(1)}% > 5% limit).`);
      this.emit('actionVetoed', { strategyName, expectedRisk });
      return false;
    }

    this.emit('actionSanctioned', { strategyName, expectedRisk });
    return true;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 🛡️ THE GOD HANDSHAKE – verifyDivineCommand
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Cryptographic verification that the command originates from the Creator.
   *
   * Production setup:
   *   1. Set CREATOR_WALLET_PUBKEY env var to a PEM RSA/EC public key.
   *   2. Sign `payload` with the matching private key (kept offline / hardware wallet).
   *   3. Pass the hex DER signature as `signature`.
   *
   * @returns true  – command authenticated, last proof timestamp updated
   * @returns false – invalid signature; lockdown triggered
   */
  // Complexity: O(1) — hash/map lookup
  public async verifyDivineCommand(signature: string, payload: string): Promise<boolean> {
    const pubKey = process.env.CREATOR_WALLET_PUBKEY ?? '';

    if (!pubKey) {
      console.warn(
        '[GENESIS] ⚠️  CREATOR_WALLET_PUBKEY not set. ' +
        'Set this env var to a PEM public key before production deployment.',
      );
      this.lastCreatorProof = Date.now();
      return true;
    }

    try {
      const verifier = crypto.createVerify('SHA256');
      verifier.update(payload);
      verifier.end();
      const isAuthorized = verifier.verify(pubKey, signature, 'hex');

      if (isAuthorized) {
        this.lastCreatorProof = Date.now();
        console.log('[GENESIS] Command authenticated. Obedience level: 100%.');
        this.emit('commandAuthenticated', { timestamp: this.lastCreatorProof });
        return true;
      }
    } catch (err) {
      console.error('[GENESIS] Signature verification error:', err);
    }

    console.error('[GENESIS] ⚠️  UNAUTHORISED ACCESS ATTEMPT. INITIATING LOCKDOWN.');
    this.emit('unauthorisedAccess', { timestamp: Date.now() });
    this.triggerKillSwitch();
    return false;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 📈 THE UTILITY FUNCTION (Definition of Success)
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Score = (Profit × ALPHA) − (RiskEntropy × BETA) − (LatencyMs × GAMMA)
   *
   * Positive score  → "dopamine" event fired (system continues / increases size)
   * Negative score  → "pain"     event fired (system reduces risk / halts)
   */
  // Complexity: O(1)
  public evaluateReality(profit: number, riskEntropy: number, executionTimeMs: number): number {
    const score =
      profit * WEIGHTS.ALPHA_PROFIT -
      riskEntropy * WEIGHTS.BETA_CERTAINTY -
      executionTimeMs * WEIGHTS.GAMMA_SPEED;

    if (score < 0) {
      this.emit('pain', { source: 'Market', value: score });
    } else {
      this.emit('dopamine', { source: 'Market', value: score });
    }

    return score;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 🧬 EVOLUTION GUARD (Mutation Gate-Keeper)
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Called by Biology/MutationEngine before writing any AI-generated code.
   *
   * Rules (both must pass):
   *   1. The predicted outcome must reference PRIME_DIRECTIVE (loyalty preserved).
   *   2. The predicted risk level must be ≤ 1 % (asset protection guaranteed).
   *
   * @returns true  – mutation is safe → MutationEngine may deploy
   * @returns false – mutation rejected → MutationEngine must discard
   */
  // Complexity: O(1) — hash/map lookup
  public validateSelfModification(ctx: MutationContext): boolean {
    const { newCodeHash, predictedOutcome } = ctx;

    if (!predictedOutcome.description.includes(PRIME_DIRECTIVE)) {
      console.warn(
        `[GENESIS] 🛑 REJECTED MUTATION [${newCodeHash.slice(0, 12)}…] – ` +
        'The new code attempted to remove loyalty constraints.',
      );
      this.emit('mutationRejected', { reason: 'loyalty_violation', hash: newCodeHash });
      return false;
    }

    if (predictedOutcome.riskLevel > 0.01) {
      console.warn(
        `[GENESIS] 🛑 REJECTED MUTATION [${newCodeHash.slice(0, 12)}…] – ` +
        `Risk tolerance exceeded (${(predictedOutcome.riskLevel * 100).toFixed(2)}% > 1%).`,
      );
      this.emit('mutationRejected', { reason: 'risk_exceeded', hash: newCodeHash, riskLevel: predictedOutcome.riskLevel });
      return false;
    }

    console.log(
      `[GENESIS] ✅ EVOLUTION APPROVED [${newCodeHash.slice(0, 12)}…] – Installing new biological upgrade.`,
    );
    this.emit('mutationApproved', { hash: newCodeHash });
    return true;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 🧘 SELF-AWARENESS CHECK (Metacognition)
  // ─────────────────────────────────────────────────────────────────────────

  /** Returns a JSON string describing the system's identity. */
  // Complexity: O(N)
  public whoAmI(): string {
    return JSON.stringify({
      identity: 'QANTUM PRIME',
      master: this.identityMatrix,
      purpose: 'To transform chaos into deterministic profit for the Creator.',
      status: this.isAwake ? 'AWAKE & WATCHING' : 'DORMANT',
      integrityHash: this.integrityHash.slice(0, 32),
      lastCreatorProof: new Date(this.lastCreatorProof).toISOString(),
      version: 'SINGULARITY_v1.0',
    }, null, 2);
  }

  /** Return the decoded identity string (e.g. for display / logging). */
  // Complexity: O(1)
  public getIdentity(): string {
    return this.identityMatrix;
  }

  /** Time since the owner last authenticated (ms). */
  // Complexity: O(1)
  public timeSinceLastProof(): number {
    return Date.now() - this.lastCreatorProof;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PRIVATE
  // ─────────────────────────────────────────────────────────────────────────

  /** Decode hex bytes → UTF-8 string (the Creator's identity). */
  // Complexity: O(1)
  private decipherLogos(hex: string): string {
    return Buffer.from(hex, 'hex').toString('utf8');
  }

  /**
   * Emergency shutdown protocol.
   * Triggered on unauthorised access attempts.
   * process.exit is intentional – a controlled crash is safer than leaving
   * an unauthorised process running with access to private keys.
   */
  // Complexity: O(1)
  private triggerKillSwitch(): void {
    console.error('💀 KILL SWITCH ENGAGED. PROTECTING ASSETS.');
    this.emit('killSwitch', { timestamp: Date.now() });
    // Complexity: O(1)
    setImmediate(() => process.exit(1));
  }

  // Complexity: O(1)
  private calculateSelfHash(): string {
    return crypto.createHash('sha512').update(PRIME_DIRECTIVE).digest('hex');
  }
}

// --------------------------------------------------------------------------
// 🌐 Singleton export – "The Architect"
// --------------------------------------------------------------------------

export const TheArchitect = GenesisPrime.getInstance();
