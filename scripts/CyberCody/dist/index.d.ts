import { EventEmitter } from 'events';
import type { CyberCodyConfig, ScanResult, ReconResult, FuzzingResult, FuzzingConfig, VulnerabilitySnapshot, EventHandler, PayloadCategory } from '../../qantum/SaaS-Framework/01_ECOSYSTEM_APPS/MrMindQATool/src/index';
import { APIInterceptor, type APIMap } from '../../qantum/SaaS-Framework/01_ECOSYSTEM_APPS/MisterMind-Site/dpengeneering/cybercody/src/modules/api-interceptor';
import { BOLATester, type BOLATestReport } from '../../qantum/SaaS-Framework/01_ECOSYSTEM_APPS/MisterMind-Site/dpengeneering/cybercody/src/modules/bola-tester';
import { LogicAnalyzer, type LogicAnalysisReport } from '../src/modules/logic-analyzer.js';
import { SurgeonIntegration, type SurgeonReport, type Framework } from '../../qantum/SaaS-Framework/01_ECOSYSTEM_APPS/MisterMind-Site/dpengeneering/cybercody/src/modules/surgeon-integration';
import { ShadowAPIDiscovery, type ShadowAPIReport } from '../../qantum/SaaS-Framework/01_ECOSYSTEM_APPS/MisterMind-Site/dpengeneering/cybercody/src/modules/shadow-api-discovery';
import { SessionOrchestrator, type UserProfile, type SessionOrchestratorReport, type CrossSessionVulnerability } from '../../qantum/SaaS-Framework/01_ECOSYSTEM_APPS/MisterMind-Site/dpengeneering/cybercody/src/modules/session-orchestrator';
import { PIIScanner, type PIIDetection, type PIIScannerReport, type PIICategory, type PIIRiskLevel } from '../../qantum/SaaS-Framework/01_ECOSYSTEM_APPS/MisterMind-Site/dpengeneering/cybercody/src/modules/pii-scanner';
import { StealthEngine, type StealthResponse, type StealthLevel, type TimingStrategy, type StealthStats } from '../../qantum/SaaS-Framework/01_ECOSYSTEM_APPS/MisterMind-Site/dpengeneering/cybercody/src/modules/stealth-engine';
import { RemediationGenerator, type GeneratedPatch, type RemediationReport } from '../../qantum/SaaS-Framework/01_ECOSYSTEM_APPS/MisterMind-Site/dpengeneering/cybercody/src/modules/remediation-gen';
import { VisualPhishingDetector, type PhishingAnalysis, type PhishingReport, type BrandSignature } from '../../qantum/SaaS-Framework/01_ECOSYSTEM_APPS/MisterMind-Site/dpengeneering/cybercody/src/modules/visual-phishing-detector';
import { HiddenElementFinder, type HiddenElement, type HiddenElementReport, type ClickjackingVector } from '../../qantum/SaaS-Framework/01_ECOSYSTEM_APPS/MisterMind-Site/dpengeneering/cybercody/src/modules/hidden-element-finder';
import { DashboardSync, type SecurityHealthScore, type DashboardSecurityReport, type VulnerabilitySummary } from '../../qantum/SaaS-Framework/01_ECOSYSTEM_APPS/MisterMind-Site/dpengeneering/cybercody/src/modules/dashboard-sync';
import { type AttackSurfaceAnalysis } from '../../qantum/SaaS-Framework/01_ECOSYSTEM_APPS/MisterMind-Site/dpengeneering/cybercody/src/modules/predictive-attack-surface';
import { type LifecycleResult } from '../../qantum/SaaS-Framework/01_ECOSYSTEM_APPS/MisterMind-Site/dpengeneering/cybercody/src/modules/autonomous-bug-fixer';
/**
 * CyberCody - Offensive AI Security Agent
 *
 * The weapon to MisterMind's shield.
 *
 * Features:
 * - RECON_MODULE: Playwright-powered tech stack detection
 * - FUZZING_ENGINE: Worker Thread parallel fuzzing with 1000+ payloads
 * - VULNERABILITY_SNAPSHOT: Neural snapshots with auto-PoC generation
 * - ETHICAL_GUARDRAILS: Scope enforcement and authorization
 *
 * @example
 * ```typescript
 * const cody = new CyberCody({
 *   ethical: {
 *     allowedDomains: ['*.mydomain.com'],
 *     blockCriticalInfrastructure: true,
 *   }
 * });
 *
 * const result = await cody.scan('https://test.mydomain.com');
 * console.log(result.summary);
 * ```
 */
export declare class CyberCody extends EventEmitter {
    private config;
    private recon;
    private fuzzer;
    private snapshots;
    private guardrails;
    private activeScan;
    constructor(config?: Partial<CyberCodyConfig>);
    /**
     * Print CyberCody banner
     */
    private printBanner;
    /**
     * Perform full security scan on target
     *
     * @param target - URL to scan
     * @param options - Scan options
     */
    scan(target: string, options?: {
        skipRecon?: boolean;
        skipFuzzing?: boolean;
        fuzzCategories?: PayloadCategory[];
        fuzzIterations?: number;
    }): Promise<ScanResult>;
    /**
     * Run reconnaissance only
     */
    runRecon(target: string): Promise<ReconResult>;
    /**
     * Run fuzzing only
     */
    runFuzz(config: FuzzingConfig): Promise<FuzzingResult>;
    /**
     * Add allowed target domain
     */
    allowDomain(domain: string): void;
    /**
     * Add allowed target IP
     */
    allowIP(ip: string): void;
    /**
     * Get guardrails status
     */
    getGuardrailsStatus(): void;
    /**
     * Get all vulnerability snapshots
     */
    getVulnerabilities(): VulnerabilitySnapshot[];
    /**
     * Export scan results
     */
    exportResults(format?: 'json' | 'html' | 'markdown'): string;
    /**
     * Subscribe to events
     */
    onEvent(handler: EventHandler): void;
    /**
     * Emit typed event
     */
    private emitEvent;
    /**
     * Generate scan ID
     */
    private generateScanId;
    /**
     * Generate scan summary
     */
    private generateSummary;
    /**
     * Empty summary for initialization
     */
    private emptySummary;
    /**
     * Print scan summary to console
     */
    private printScanSummary;
    /**
     * Generate risk bar visualization
     */
    private getRiskBar;
    /**
     * Generate Markdown report
     */
    private generateMarkdownReport;
    /**
     * Generate HTML report
     */
    private generateHTMLReport;
    /**
     * Deep merge configuration objects
     */
    private mergeConfig;
    /**
     * Cleanup resources
     */
    cleanup(): Promise<void>;
    /**
     * Perform full API security audit
     *
     * This is the v1.1 "API Logic Hunter" scan that focuses on:
     * - API endpoint discovery and mapping
     * - BOLA/IDOR vulnerability testing
     * - Sensitive data exposure analysis
     * - Shadow API discovery
     * - Auto-generated security patches
     *
     * @param target - URL to audit
     * @param options - API audit options
     */
    apiSecurityAudit(target: string, options?: {
        /** Discover shadow/hidden APIs */
        discoverShadowAPIs?: boolean;
        /** Analyze response data for sensitive info */
        analyzeDataExposure?: boolean;
        /** Generate patches for vulnerabilities */
        generatePatches?: boolean;
        /** Target framework for patch generation */
        framework?: Framework;
        /** Gemini API key for AI analysis */
        geminiApiKey?: string;
        /** Actions to perform during interception */
        interactionSteps?: Array<{
            action: string;
            selector?: string;
            value?: string;
            url?: string;
        }>;
        /** Custom user IDs to test for BOLA */
        customIds?: string[];
        /** Maximum pages to crawl */
        maxPages?: number;
    }): Promise<APISecurityAuditReport>;
    /**
     * Calculate overall risk score from all reports
     */
    private calculateOverallRisk;
    /**
     * Generate recommendations based on findings
     */
    private generateAPIRecommendations;
    /**
     * Print API audit summary
     */
    private printAPIAuditSummary;
    /**
     * Perform Ghost Audit - Multi-user session BOLA testing with stealth mode
     *
     * This is the v1.2 "Ghost Auditor" scan that enables:
     * - Multi-user session management with JWT switching
     * - Cross-session BOLA/IDOR testing (User A accessing User B's data)
     * - PII detection in all API responses (50+ regex patterns)
     * - Stealth mode with adaptive rate limiting evasion
     * - Auto-generated remediation patches
     *
     * @param target - URL to audit
     * @param options - Ghost audit options
     */
    ghostAudit(target: string, options?: GhostAuditOptions): Promise<GhostAuditReport>;
    /**
     * Quick PII scan on a URL without full audit
     */
    quickPIIScan(target: string, options?: {
        categories?: PIICategory[] | 'all';
        sensitivityThreshold?: 'low' | 'medium' | 'high';
    }): Promise<PIIScannerReport>;
    /**
     * Register a user profile for multi-session testing
     */
    registerUserProfile(profile: UserProfile): void;
    /**
     * Calculate risk score for ghost audit
     */
    private calculateGhostRiskScore;
    /**
     * Count critical issues across all reports
     */
    private countCriticalIssues;
    /**
     * Generate recommendations for ghost audit
     */
    private generateGhostRecommendations;
    /**
     * Print ghost audit summary
     */
    private printGhostAuditSummary;
    /**
     * Visual Hack - Comprehensive visual security analysis
     * Combines phishing detection, hidden element scanning, and dashboard sync
     */
    visualHack(target: string, options?: VisualHackOptions): Promise<VisualHackReport>;
    /**
     * Quick phishing scan on URLs
     */
    quickPhishingScan(urls: string[], options?: {
        geminiApiKey?: string;
        sensitivityLevel?: 'low' | 'medium' | 'high';
    }): Promise<PhishingReport>;
    /**
     * Quick hidden element scan
     */
    quickHiddenScan(target: string, options?: {
        captureScreenshots?: boolean;
        revealHiddenElements?: boolean;
    }): Promise<HiddenElementReport>;
    /**
     * Calculate visual risk score
     */
    private calculateVisualRiskScore;
    /**
     * Generate visual security recommendations
     */
    private generateVisualRecommendations;
    /**
     * Print visual hack summary
     */
    private printVisualHackSummary;
    /**
     * Full Lifecycle Automation: Discovery → Attack → Fix → Verification → PR
     * The Temporal Healer - Autonomous security vulnerability lifecycle management
     */
    temporalHeal(sourceDir: string, options?: TemporalHealOptions): Promise<TemporalHealReport>;
    /**
     * Print Temporal Heal summary
     */
    private printTemporalHealSummary;
}
/**
 * Temporal Heal Options
 */
export interface TemporalHealOptions {
    /** Gemini API key */
    geminiApiKey?: string;
    /** Enable AI-powered analysis */
    enableAiAnalysis?: boolean;
    /** Analyze dependencies */
    analyzeDependencies?: boolean;
    /** Analyze git history */
    analyzeGitHistory?: boolean;
    /** Risk threshold for fixing (0-100) */
    riskThreshold?: number;
    /** Max vulnerabilities to fix in one run */
    maxVulnerabilitiesToFix?: number;
    /** GitHub token for PR creation */
    githubToken?: string;
    /** Repository owner */
    repoOwner?: string;
    /** Repository name */
    repoName?: string;
    /** Auto-create PRs */
    autoCreatePR?: boolean;
    /** Dry run mode */
    dryRun?: boolean;
    /** Enable AI-powered patches */
    enableAiPatches?: boolean;
    /** Test command */
    testCommand?: string;
    /** Build command */
    buildCommand?: string;
    /** PR labels */
    prLabels?: string[];
    /** PR reviewers */
    prReviewers?: string[];
    /** Enable visual matching */
    enableVisualMatching?: boolean;
    /** Min swap confidence */
    minSwapConfidence?: number;
    /** Sync to dashboard */
    syncToDashboard?: boolean;
    /** Dashboard URL */
    dashboardUrl?: string;
    /** Dashboard port */
    dashboardPort?: number;
}
/**
 * Temporal Heal Report
 */
export interface TemporalHealReport {
    sourceDir: string;
    startTime: Date;
    endTime: Date;
    durationSeconds: number;
    discovery: {
        filesAnalyzed: number;
        totalLinesOfCode: number;
        currentVulnerabilities: number;
        predictedVulnerabilities: number;
        dependencyRisks: number;
        overallRiskScore: number;
        predictedRiskScore30Days: number;
        predictedRiskScore90Days: number;
        hotSpots: Array<{
            path: string;
            riskScore: number;
            vulnerabilityCount: number;
        }>;
    };
    fixing: {
        vulnerabilitiesProcessed: number;
        successfulFixes: number;
        failedFixes: number;
        patchesGenerated: number;
        testsGenerated: number;
        prsCreated: number;
    };
    hotSwap: {
        selectorsMonitored: number;
        mutationsDetected: number;
        successfulSwaps: number;
        failedSwaps: number;
    };
    lifecycleResults: LifecycleResult[];
    attackSurfaceAnalysis: AttackSurfaceAnalysis;
    summary: {
        status: 'HEALED' | 'NEEDS_ATTENTION';
        healingRate: number;
        riskReduction: number;
        recommendations: string[];
    };
}
/**
 * API Security Audit Report
 */
export interface APISecurityAuditReport {
    target: string;
    startTime: Date;
    endTime: Date;
    authorization: {
        authorized: boolean;
        reason: string;
    };
    apiMap?: {
        totalEndpoints: number;
        totalRequests: number;
        bolaTargets: number;
        authTokensFound: number;
    };
    bolaReport?: {
        totalTests: number;
        vulnerabilitiesFound: number;
        confirmedBOLA: number;
        criticalVulns: number;
    };
    logicReport?: {
        totalExposures: number;
        totalLogicFlaws: number;
        overallRiskScore: number;
        complianceViolations: Record<string, number>;
    };
    shadowReport?: {
        totalEndpoints: number;
        criticalFindings: number;
        deprecatedAPIs: number;
        debugEndpoints: number;
    };
    patchesGenerated: number;
    summary: {
        overallRiskScore: number;
        criticalIssues: number;
        recommendations: string[];
    };
    fullReports: {
        apiMap?: APIMap;
        bolaReport?: BOLATestReport;
        logicReport?: LogicAnalysisReport;
        shadowReport?: ShadowAPIReport;
        surgeonReport?: SurgeonReport;
    };
}
/**
 * Ghost Audit Options
 */
export interface GhostAuditOptions {
    /** User profiles for multi-session testing */
    userProfiles?: UserProfile[];
    /** Token for User A (if not using profiles) */
    userAToken?: string;
    /** Token for User B (if not using profiles) */
    userBToken?: string;
    /** Auto-rotate tokens when expired */
    autoRotateTokens?: boolean;
    /** Role hierarchy for privilege testing */
    roleHierarchy?: string[];
    /** Test all role combinations */
    testAllRoleCombinations?: boolean;
    /** Include token swapping tests */
    includeTokenSwapping?: boolean;
    /** Custom payloads for cross-session testing */
    customPayloads?: string[];
    /** PII categories to scan for */
    piiCategories?: PIICategory[] | 'all';
    /** Sensitivity threshold for PII detection */
    sensitivityThreshold?: 'low' | 'medium' | 'high';
    /** Enable AI-powered PII analysis */
    enableAIAnalysis?: boolean;
    /** Stealth level for avoiding detection */
    stealthLevel?: StealthLevel;
    /** Timing strategy for requests */
    timingStrategy?: TimingStrategy;
    /** Adaptive threshold for rate limiting */
    adaptiveThreshold?: number;
    /** Target framework for patch generation */
    framework?: Framework;
    /** Include test files in patches */
    includeTests?: boolean;
    /** Generate documentation for patches */
    generateDocs?: boolean;
    /** Custom user IDs to test for BOLA */
    customIds?: string[];
    /** Actions to perform during interception */
    interactionSteps?: Array<{
        action: string;
        selector?: string;
        value?: string;
        url?: string;
    }>;
}
/**
 * Ghost Audit Report - Full output from v1.2 audit
 */
export interface GhostAuditReport {
    target: string;
    version: string;
    codename: string;
    startTime: Date;
    endTime: Date;
    authorization: {
        authorized: boolean;
        reason: string;
    };
    sessionReport: {
        profilesRegistered: number;
        crossSessionTests: number;
        crossSessionVulns: number;
        tokenSwappingTests: number;
    };
    piiReport: {
        totalScanned: number;
        totalDetections: number;
        categoriesFound: PIICategory[];
        complianceViolations: Record<string, string[]>;
        criticalExposures: number;
    };
    stealthReport: {
        level: StealthLevel;
        timingStrategy: TimingStrategy;
        totalRequests: number;
        rateLimitsDetected: number;
        successRate: number;
    };
    bolaReport: {
        totalTests: number;
        vulnerabilitiesFound: number;
        confirmedBOLA: number;
        criticalVulns: number;
    };
    remediationReport: {
        totalPatches: number;
        frameworksCovered: string[];
        patchTypes: string[];
    };
    summary: {
        overallRiskScore: number;
        criticalIssues: number;
        recommendations: string[];
    };
    fullReports: {
        sessionOrchestrator: SessionOrchestratorReport;
        piiScanner: PIIScannerReport;
        stealthEngine: Record<string, unknown>;
        bolaTester: BOLATestReport;
        remediationGen: RemediationReport;
        apiMap: APIMap;
    };
}
/**
 * Visual Hack Options
 */
export interface VisualHackOptions {
    /** Gemini API key for AI-powered analysis */
    geminiApiKey?: string;
    /** Additional URLs to scan for phishing */
    additionalUrls?: string[];
    /** Screenshot directory */
    screenshotDir?: string;
    /** Sensitivity level for phishing detection */
    sensitivityLevel?: 'low' | 'medium' | 'high';
    /** Capture screenshots of findings */
    captureScreenshots?: boolean;
    /** Reveal hidden elements in screenshots */
    revealHiddenElements?: boolean;
    /** Minimum risk level for hidden elements */
    minHiddenRiskLevel?: 'info' | 'low' | 'medium' | 'high' | 'critical';
    /** Sync results to Mister Mind Dashboard */
    syncToDashboard?: boolean;
    /** Dashboard URL */
    dashboardUrl?: string;
    /** Dashboard port */
    dashboardPort?: number;
    /** Interaction steps for API capture */
    interactionSteps?: Array<{
        action: string;
        selector?: string;
        value?: string;
        url?: string;
    }>;
}
/**
 * Visual Hack Report - Full output from v1.3 audit
 */
export interface VisualHackReport {
    target: string;
    version: string;
    codename: string;
    startTime: Date;
    endTime: Date;
    authorization: {
        authorized: boolean;
        reason: string;
    };
    phishingReport: {
        pagesScanned: number;
        phishingDetected: number;
        highRiskUrls: string[];
        detectedBrands: string[];
        visualMismatches: number;
        overallRiskScore: number;
    };
    hiddenElementReport: {
        totalScanned: number;
        hiddenElementsFound: number;
        criticalFindings: number;
        highRiskFindings: number;
        clickjackingVectors: number;
        hiddenForms: number;
        hiddenInputs: number;
        hiddenIframes: number;
        riskScore: number;
    };
    apiContext: {
        requestsCaptured: number;
        bolaTargets: number;
        authenticatedEndpoints: number;
    };
    summary: {
        overallRiskScore: number;
        criticalIssues: number;
        recommendations: string[];
    };
    fullReports: {
        phishingReport: PhishingReport;
        hiddenReport: HiddenElementReport;
        apiMap: APIMap;
    };
}
export { APIInterceptor, BOLATester, LogicAnalyzer, SurgeonIntegration, ShadowAPIDiscovery, };
export { SessionOrchestrator, PIIScanner, StealthEngine, RemediationGenerator, };
export { VisualPhishingDetector, HiddenElementFinder, DashboardSync, };
export type { UserProfile, SessionOrchestratorReport, CrossSessionVulnerability, PIIDetection, PIIScannerReport, PIICategory, PIIRiskLevel, StealthResponse, StealthLevel, TimingStrategy, StealthStats, GeneratedPatch, RemediationReport, };
export type { PhishingAnalysis, PhishingReport, BrandSignature, HiddenElement, HiddenElementReport, ClickjackingVector, SecurityHealthScore, DashboardSecurityReport, VulnerabilitySummary, };
export { HotSwapSelectorEngine } from '../../qantum/SaaS-Framework/01_ECOSYSTEM_APPS/MisterMind-Site/dpengeneering/cybercody/src/modules/hot-swap-selector';
export type { SelectorFingerprint, HotSwapResult, HotSwapReport, SelectorMemory } from '../../qantum/SaaS-Framework/01_ECOSYSTEM_APPS/MisterMind-Site/dpengeneering/cybercody/src/modules/hot-swap-selector';
export { PredictiveAttackSurface } from '../../qantum/SaaS-Framework/01_ECOSYSTEM_APPS/MisterMind-Site/dpengeneering/cybercody/src/modules/predictive-attack-surface';
export type { VulnerabilityTrend, AttackSurfaceAnalysis, VulnerabilityCategory, DependencyRisk } from '../../qantum/SaaS-Framework/01_ECOSYSTEM_APPS/MisterMind-Site/dpengeneering/cybercody/src/modules/predictive-attack-surface';
export { AutonomousBugFixer } from '../../qantum/SaaS-Framework/01_ECOSYSTEM_APPS/MisterMind-Site/dpengeneering/cybercody/src/modules/autonomous-bug-fixer';
export type { GeneratedPatch as BugPatch, PatchVerification, PullRequestDetails, LifecycleResult } from '../../qantum/SaaS-Framework/01_ECOSYSTEM_APPS/MisterMind-Site/dpengeneering/cybercody/src/modules/autonomous-bug-fixer';
export { ReconModule } from '../src/modules/recon.js';
export { FuzzingEngine } from '../src/modules/fuzzing.js';
export { VulnerabilitySnapshotModule } from '../src/modules/snapshot.js';
export { EthicalGuardrails } from '../src/modules/guardrails.js';
export * from '../../qantum/SaaS-Framework/01_ECOSYSTEM_APPS/MrMindQATool/src/index';
export default CyberCody;
//# sourceMappingURL=index.d.ts.map