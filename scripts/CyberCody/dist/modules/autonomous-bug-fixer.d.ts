import { EventEmitter } from 'events';
import type { VulnerabilityTrend, VulnerabilityCategory } from '../../../qantum/SaaS-Framework/01_ECOSYSTEM_APPS/MisterMind-Site/dpengeneering/cybercody/src/modules/predictive-attack-surface';
/**
 * Patch generation strategy
 */
export type PatchStrategy = 'inline_fix' | 'wrapper' | 'middleware' | 'replacement' | 'configuration';
/**
 * Test type for verification
 */
export type TestType = 'unit' | 'integration' | 'security' | 'regression';
/**
 * Generated patch
 */
export interface GeneratedPatch {
    /** Unique ID */
    id: string;
    /** Vulnerability being fixed */
    vulnerabilityId: string;
    /** Vulnerability category */
    category: VulnerabilityCategory;
    /** Strategy used */
    strategy: PatchStrategy;
    /** Original file path */
    originalFilePath: string;
    /** Original code */
    originalCode: string;
    /** Patched code */
    patchedCode: string;
    /** Diff */
    diff: string;
    /** New files to create */
    newFiles: Array<{
        path: string;
        content: string;
        description: string;
    }>;
    /** Dependencies to add */
    dependencies: string[];
    /** Configuration changes */
    configChanges: Array<{
        file: string;
        key: string;
        value: string;
    }>;
    /** Generated tests */
    tests: GeneratedTest[];
    /** Explanation of the fix */
    explanation: string;
    /** Security impact */
    securityImpact: string;
    /** Breaking changes (if any) */
    breakingChanges: string[];
    /** OWASP reference */
    owaspReference: string;
    /** Confidence in fix (0-100) */
    confidence: number;
    /** Generated timestamp */
    generatedAt: Date;
}
/**
 * Generated test
 */
export interface GeneratedTest {
    /** Test name */
    name: string;
    /** Test type */
    type: TestType;
    /** Test code */
    code: string;
    /** Test file path */
    filePath: string;
    /** What it validates */
    validates: string;
}
/**
 * Patch verification result
 */
export interface PatchVerification {
    /** Patch ID */
    patchId: string;
    /** All tests passed */
    success: boolean;
    /** Test results */
    testResults: Array<{
        testName: string;
        passed: boolean;
        error?: string;
        duration: number;
    }>;
    /** Security scan result */
    securityScanPassed: boolean;
    /** Syntax validation */
    syntaxValid: boolean;
    /** Type check passed */
    typeCheckPassed: boolean;
    /** Performance impact */
    performanceImpact: 'none' | 'minimal' | 'moderate' | 'significant';
    /** Ready for PR */
    readyForPR: boolean;
    /** Issues found */
    issues: string[];
}
/**
 * Pull Request details
 */
export interface PullRequestDetails {
    /** PR title */
    title: string;
    /** PR body (markdown) */
    body: string;
    /** Branch name */
    branchName: string;
    /** Files changed */
    filesChanged: string[];
    /** Labels */
    labels: string[];
    /** Reviewers */
    reviewers: string[];
    /** PR number (after creation) */
    prNumber?: number;
    /** PR URL (after creation) */
    prUrl?: string;
    /** Created timestamp */
    createdAt?: Date;
}
/**
 * Bug fixer configuration
 */
export interface BugFixerConfig {
    /** Repository root directory */
    repoRoot: string;
    /** GitHub token for PR creation */
    githubToken?: string;
    /** Repository owner */
    repoOwner?: string;
    /** Repository name */
    repoName?: string;
    /** Auto-create PRs */
    autoCreatePR?: boolean;
    /** Auto-merge approved PRs */
    autoMerge?: boolean;
    /** Test command */
    testCommand?: string;
    /** Build command */
    buildCommand?: string;
    /** Lint command */
    lintCommand?: string;
    /** Enable AI-powered patch generation */
    enableAiPatches?: boolean;
    /** Gemini API key */
    geminiApiKey?: string;
    /** PR branch prefix */
    branchPrefix?: string;
    /** PR labels */
    defaultLabels?: string[];
    /** Default reviewers */
    defaultReviewers?: string[];
    /** Dry run mode (don't create actual PRs) */
    dryRun?: boolean;
    /** Output directory for patches */
    outputDir?: string;
}
/**
 * Lifecycle result
 */
export interface LifecycleResult {
    /** Vulnerability ID */
    vulnerabilityId: string;
    /** Patch generated */
    patch: GeneratedPatch | null;
    /** Verification result */
    verification: PatchVerification | null;
    /** PR details */
    pullRequest: PullRequestDetails | null;
    /** Overall success */
    success: boolean;
    /** Stage where it failed (if failed) */
    failedAt?: 'patch_generation' | 'verification' | 'pr_creation';
    /** Error message */
    error?: string;
    /** Duration */
    durationMs: number;
}
export declare class AutonomousBugFixer extends EventEmitter {
    private config;
    private geminiModel;
    private generatedPatches;
    private verificationResults;
    private createdPRs;
    constructor(config: BugFixerConfig);
    initialize(): Promise<void>;
    /**
     * Detect repository info from git remote
     */
    private detectRepoInfo;
    /**
     * Execute full lifecycle: Discovery → Fix → Verify → PR
     */
    executeLifecycle(vulnerability: VulnerabilityTrend): Promise<LifecycleResult>;
    /**
     * Generate patch for vulnerability
     */
    generatePatch(vulnerability: VulnerabilityTrend): Promise<GeneratedPatch | null>;
    /**
     * Generate AI-powered patch
     */
    private generateAiPatch;
    /**
     * Verify generated patch
     */
    verifyPatch(patch: GeneratedPatch): Promise<PatchVerification>;
    /**
     * Assess performance impact of patch
     */
    private assessPerformanceImpact;
    /**
     * Create GitHub Pull Request
     */
    createPullRequest(patch: GeneratedPatch, verification: PatchVerification): Promise<PullRequestDetails>;
    /**
     * Prepare PR details without creating
     */
    private preparePullRequestDetails;
    /**
     * Apply patch to files
     */
    private applyPatch;
    private getLanguage;
    private extractVariableName;
    private generateDiff;
    private generateExplanation;
    private getCweId;
    private getOwaspReference;
    /**
     * Get all generated patches
     */
    getPatches(): GeneratedPatch[];
    /**
     * Get all verification results
     */
    getVerificationResults(): PatchVerification[];
    /**
     * Get all created PRs
     */
    getCreatedPRs(): PullRequestDetails[];
    /**
     * Generate summary report
     */
    generateReport(): {
        totalPatches: number;
        successfulPatches: number;
        failedPatches: number;
        prsCreated: number;
        categoryCounts: Record<string, number>;
    };
}
//# sourceMappingURL=autonomous-bug-fixer.d.ts.map