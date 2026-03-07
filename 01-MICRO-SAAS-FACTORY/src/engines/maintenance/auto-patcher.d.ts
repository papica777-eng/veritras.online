/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🔧 AUTO-PATCHER - SELF-HEALING GIT INTEGRATION
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * v1.0.0 "Quantum" Edition - Living System Protocol
 *
 * This module provides autonomous self-healing capabilities with Git integration.
 * When tests fail due to DOM drift or selector changes, it automatically:
 * - Analyzes the failure pattern
 * - Generates fix proposals
 * - Applies patches to the codebase
 * - Commits with descriptive messages
 * - Validates with stress tests
 *
 * Features:
 * - DOM Drift Detection & Auto-fix
 * - Selector Evolution (CSS/XPath)
 * - Git commit automation
 * - Rollback on validation failure
 * - Self-Fix commit history
 *
 * @version 1.0.0
 * @codename Quantum
 * @author Димитър Продромов (Meta-Architect)
 * @copyright 2025. All Rights Reserved.
 * ═══════════════════════════════════════════════════════════════════════════════
 */
import { EventEmitter } from 'events';
interface FailureAnalysis {
    type: 'selector' | 'timeout' | 'assertion' | 'network' | 'unknown';
    file: string;
    line: number;
    originalSelector?: string;
    suggestedFix?: string;
    confidence: number;
    context: string[];
}
interface Patch {
    id: string;
    file: string;
    oldContent: string;
    newContent: string;
    description: string;
    type: 'selector-update' | 'timeout-increase' | 'retry-logic' | 'fallback-selector';
    confidence: number;
    createdAt: Date;
    applied: boolean;
    validated: boolean;
    rolledBack: boolean;
}
interface SelfFixCommit {
    hash: string;
    message: string;
    patches: string[];
    timestamp: Date;
    validated: boolean;
    performanceImpact: {
        before: {
            latency: number;
            throughput: number;
        };
        after: {
            latency: number;
            throughput: number;
        };
    } | null;
}
interface AutoPatcherConfig {
    maxAutoFixAttempts: number;
    validationCommand: string;
    commitPrefix: string;
    enableAutoCommit: boolean;
    rollbackOnFailure: boolean;
    dryRun: boolean;
}
export declare class AutoPatcher extends EventEmitter {
    private projectRoot;
    private config;
    private patches;
    private commits;
    private domDrifts;
    private isProcessing;
    constructor(projectRoot: string, config?: Partial<AutoPatcherConfig>);
    /**
     * Analyze a test failure and generate fix proposals
     */
    analyzeFailure(error: Error, testFile: string): Promise<FailureAnalysis>;
    /**
     * Generate and apply a patch for the failure
     */
    generatePatch(analysis: FailureAnalysis): Promise<Patch | null>;
    /**
     * Apply a patch to the filesystem
     */
    applyPatch(patchId: string): Promise<boolean>;
    /**
     * Validate a patch by running stress tests
     */
    validatePatch(patchId: string): Promise<boolean>;
    /**
     * Rollback a patch
     */
    rollbackPatch(patchId: string): Promise<boolean>;
    /**
     * Commit validated patches to Git
     */
    commitPatch(patchId: string): Promise<SelfFixCommit | null>;
    /**
     * Full auto-fix pipeline: Analyze → Generate → Apply → Validate → Commit
     */
    autoFix(error: Error, testFile: string): Promise<boolean>;
    /**
     * Track DOM drift for a selector
     */
    trackDOMDrift(selector: string): void;
    /**
     * Get patch history
     */
    getPatchHistory(): Patch[];
    /**
     * Get commit history
     */
    getCommitHistory(): SelfFixCommit[];
    private extractSelector;
    private extractTimeout;
    private extractLineNumber;
    private extractContext;
    private suggestSelectorFix;
    private applySelectorFix;
    private applyTimeoutFix;
    private applyRetryLogic;
    private generateDiff;
}
export { AutoPatcherConfig, Patch, SelfFixCommit, FailureAnalysis };
//# sourceMappingURL=auto-patcher.d.ts.map