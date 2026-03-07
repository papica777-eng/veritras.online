/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║                                                                           ║
 * ║   🧬 MUTATION ENGINE – Biology Layer                                      ║
 * ║   "Code that rewrites itself. Supervised by The Architect."               ║
 * ║                                                                           ║
 * ║   Part of QANTUM SINGULARITY – Biology Layer                              ║
 * ║                                                                           ║
 * ║   Workflow:                                                               ║
 * ║     1. AI (DeepSeek / GenusEngine) proposes a new module version.         ║
 * ║     2. MutationEngine hashes the code and runs simulations.               ║
 * ║     3. TheArchitect (GenesisPrime) validates loyalty + risk.              ║
 * ║     4. If approved → RustBuilder (or fs.writeFileSync) deploys.           ║
 * ║     5. If rejected → mutation is silently discarded.                      ║
 * ║                                                                           ║
 * ║   © 2025-2026 QAntum | Dimitar Prodromov                                  ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { EventEmitter } from 'events';
import { TheArchitect } from '../security_core/ASCENSION_KERNEL/GenesisPrime';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

/** A proposed code mutation from the AI */
export interface MutationProposal {
  /** Human-readable name of the module being mutated */
  moduleName: string;
  /** Target file path (relative to project root) */
  targetPath: string;
  /** Full source code of the proposed new version */
  newCode: string;
  /** What improvement this mutation delivers */
  description: string;
  /** Simulated risk level 0–1 (from backtester / benchmark) */
  simulatedRiskLevel: number;
  /** Simulated ROI delta from benchmark (e.g. 0.02 = +2%) */
  simulatedRoiDelta: number;
}

/** Outcome of a mutation attempt */
export interface MutationResult {
  moduleName: string;
  codeHash: string;
  approved: boolean;
  rejectionReason?: string;
  deployedAt?: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// MUTATION ENGINE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * MutationEngine
 *
 * The biological evolution layer. Receives AI-generated code proposals,
 * asks TheArchitect whether they are safe and loyal, then deploys or
 * discards them accordingly.
 *
 * Every mutation that passes validation is written to disk and recorded.
 * Every rejected mutation is logged and silently discarded.
 */
export class MutationEngine extends EventEmitter {
  private history: MutationResult[] = [];
  private readonly projectRoot: string;

  constructor(projectRoot?: string) {
    super();
    this.projectRoot = projectRoot ?? process.cwd();
    console.log('🧬 MutationEngine (Biology Layer) online');
    console.log(`   📂 Project root: ${this.projectRoot}`);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PUBLIC API
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Primary entry point.
   * Call this when the AI has produced a mutation candidate.
   *
   * The mutation will be:
   *   1. Hashed (SHA-256)
   *   2. Submitted to TheArchitect for validation
   *   3. Deployed or discarded based on the verdict
   */
  // Complexity: O(1) — hash/map lookup
  applyMutation(proposal: MutationProposal): MutationResult {
    const codeHash = this.hash(proposal.newCode);

    console.log(
      `🧬 [Mutation] Evaluating: ${proposal.moduleName} [${codeHash.slice(0, 12)}…]`,
    );

    // ── Ask The Architect ────────────────────────────────────────────────
    const approved = TheArchitect.validateSelfModification({
      newCodeHash: codeHash,
      predictedOutcome: {
        description: proposal.description,
        riskLevel: proposal.simulatedRiskLevel,
        roiDelta: proposal.simulatedRoiDelta,
      },
    });

    const result: MutationResult = {
      moduleName: proposal.moduleName,
      codeHash,
      approved,
    };

    if (!approved) {
      result.rejectionReason =
        proposal.simulatedRiskLevel > 0.01
          ? `Risk level ${(proposal.simulatedRiskLevel * 100).toFixed(2)}% exceeds maximum 1%`
          : 'Loyalty constraint violation detected';

      this.history.push(result);
      this.emit('mutationRejected', result);
      console.warn(`🛑 [Mutation] Rejected: ${proposal.moduleName} – ${result.rejectionReason}`);
      return result;
    }

    // ── Deploy ───────────────────────────────────────────────────────────
    try {
      this.deploy(proposal);
      result.deployedAt = Date.now();
      this.history.push(result);
      this.emit('mutationDeployed', result);
      console.log(
        `✅ [Mutation] Deployed: ${proposal.moduleName} | ROI Δ +${(proposal.simulatedRoiDelta * 100).toFixed(2)}%`,
      );
    } catch (err) {
      result.approved = false;
      result.rejectionReason = `Deploy error: ${String(err)}`;
      this.history.push(result);
      this.emit('mutationFailed', result);
      console.error(`❌ [Mutation] Deploy failed: ${proposal.moduleName} – ${err}`);
    }

    return result;
  }

  /** Get mutation history */
  // Complexity: O(1)
  getHistory(limit = 50): MutationResult[] {
    return this.history.slice(-limit);
  }

  /** Get statistics */
  // Complexity: O(N) — linear iteration
  getStats(): { total: number; approved: number; rejected: number; approvalRate: number } {
    const approved = this.history.filter((r) => r.approved).length;
    const total = this.history.length;
    return {
      total,
      approved,
      rejected: total - approved,
      approvalRate: total > 0 ? approved / total : 0,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PRIVATE
  // ─────────────────────────────────────────────────────────────────────────

  // Complexity: O(1)
  private deploy(proposal: MutationProposal): void {
    const absPath = path.resolve(this.projectRoot, proposal.targetPath);
    const dir = path.dirname(absPath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Backup existing file before overwriting
    if (fs.existsSync(absPath)) {
      const backup = `${absPath}.${Date.now()}.bak`;
      fs.copyFileSync(absPath, backup);
    }

    fs.writeFileSync(absPath, proposal.newCode, 'utf-8');
  }

  // Complexity: O(1)
  private hash(code: string): string {
    return crypto.createHash('sha256').update(code).digest('hex');
  }
}

// Export singleton
export const mutationEngine = new MutationEngine();
