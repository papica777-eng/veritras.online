import { EventEmitter } from 'events';
/**
 * Vulnerability categories
 */
export type VulnerabilityCategory = 'sqli' | 'xss' | 'nosqli' | 'cmdi' | 'path_traversal' | 'ssrf' | 'xxe' | 'ssti' | 'bola' | 'broken_auth' | 'mass_assignment' | 'sensitive_data' | 'rate_limiting' | 'insecure_deserialization';
/**
 * Code pattern that indicates potential vulnerability
 */
export interface VulnerabilityPattern {
    /** Pattern ID */
    id: string;
    /** Category */
    category: VulnerabilityCategory;
    /** Pattern name */
    name: string;
    /** Description */
    description: string;
    /** Regex patterns to detect */
    patterns: RegExp[];
    /** Languages this applies to */
    languages: string[];
    /** Base risk score (0-100) */
    baseRiskScore: number;
    /** Factors that increase risk */
    riskFactors: RiskFactor[];
    /** Remediation guidance */
    remediation: string;
    /** OWASP mapping */
    owaspMapping: string;
    /** CWE ID */
    cweId: number;
}
/**
 * Risk factor that modifies vulnerability score
 */
export interface RiskFactor {
    /** Factor name */
    name: string;
    /** Pattern to detect */
    pattern: RegExp;
    /** Score modifier (+/-) */
    scoreModifier: number;
    /** Description */
    description: string;
}
/**
 * Detected vulnerability trend
 */
export interface VulnerabilityTrend {
    /** Unique ID */
    id: string;
    /** File path */
    filePath: string;
    /** Line number */
    lineNumber: number;
    /** Code snippet */
    codeSnippet: string;
    /** Vulnerability category */
    category: VulnerabilityCategory;
    /** Pattern that matched */
    patternId: string;
    /** Current risk score */
    currentRiskScore: number;
    /** Predicted future risk score */
    predictedRiskScore: number;
    /** Prediction confidence (0-100) */
    predictionConfidence: number;
    /** Prediction reason */
    predictionReason: string;
    /** Time to vulnerability (estimated days) */
    estimatedDaysToVulnerability: number;
    /** Related code changes */
    relatedChanges: CodeChange[];
    /** Recommendations */
    recommendations: string[];
    /** Historical trend */
    historicalTrend: TrendPoint[];
}
/**
 * Code change that affects vulnerability
 */
export interface CodeChange {
    /** Change type */
    type: 'dependency_update' | 'config_change' | 'code_pattern' | 'schema_change' | 'api_change';
    /** Description */
    description: string;
    /** Impact score */
    impactScore: number;
    /** Source of change (git commit, dependency, etc.) */
    source: string;
}
/**
 * Historical trend point
 */
export interface TrendPoint {
    /** Timestamp */
    timestamp: Date;
    /** Risk score at this point */
    riskScore: number;
    /** Event that caused change */
    event?: string;
}
/**
 * Dependency vulnerability info
 */
export interface DependencyRisk {
    /** Package name */
    package: string;
    /** Current version */
    currentVersion: string;
    /** Known vulnerable versions */
    vulnerableVersions: string[];
    /** Vulnerability type */
    vulnerabilityType: VulnerabilityCategory;
    /** CVE ID if available */
    cveId?: string;
    /** Risk score */
    riskScore: number;
    /** Upgrade recommendation */
    upgradeRecommendation: string;
}
/**
 * Attack surface analysis result
 */
export interface AttackSurfaceAnalysis {
    /** Analysis timestamp */
    analyzedAt: Date;
    /** Total files analyzed */
    filesAnalyzed: number;
    /** Total lines of code */
    totalLinesOfCode: number;
    /** Current vulnerabilities */
    currentVulnerabilities: VulnerabilityTrend[];
    /** Predicted vulnerabilities */
    predictedVulnerabilities: VulnerabilityTrend[];
    /** Dependency risks */
    dependencyRisks: DependencyRisk[];
    /** Overall risk score */
    overallRiskScore: number;
    /** Predicted risk score (30 days) */
    predictedRiskScore30Days: number;
    /** Predicted risk score (90 days) */
    predictedRiskScore90Days: number;
    /** Hot spots (high risk areas) */
    hotSpots: Array<{
        path: string;
        riskScore: number;
        vulnerabilityCount: number;
    }>;
    /** Recommendations */
    recommendations: string[];
}
/**
 * Predictive analysis configuration
 */
export interface PredictiveConfig {
    /** Source directory to analyze */
    sourceDir: string;
    /** File extensions to analyze */
    fileExtensions?: string[];
    /** Exclude patterns */
    excludePatterns?: string[];
    /** Enable dependency analysis */
    analyzeDependencies?: boolean;
    /** Enable git history analysis */
    analyzeGitHistory?: boolean;
    /** Enable AI-powered analysis */
    enableAiAnalysis?: boolean;
    /** Gemini API key */
    geminiApiKey?: string;
    /** Risk threshold for alerts */
    riskThreshold?: number;
    /** Persist analysis history */
    persistHistory?: boolean;
    /** History file path */
    historyFilePath?: string;
}
export declare class PredictiveAttackSurface extends EventEmitter {
    private config;
    private analysisHistory;
    private geminiModel;
    constructor(config: PredictiveConfig);
    initialize(): Promise<void>;
    /**
     * Analyze the entire codebase
     */
    analyzeCodebase(): Promise<AttackSurfaceAnalysis>;
    /**
     * Get all files recursively
     */
    private getAllFiles;
    /**
     * Analyze a single file
     */
    private analyzeFile;
    /**
     * Get language from extension
     */
    private getLanguage;
    /**
     * Predict vulnerability trend for a specific finding
     */
    private predictVulnerabilityTrend;
    /**
     * Check if file has high change frequency (mock implementation)
     */
    private isHighChurnFile;
    /**
     * Get AI-powered prediction
     */
    private getAiPrediction;
    /**
     * Generate predictions for all vulnerabilities
     */
    private generatePredictions;
    /**
     * Analyze dependencies for known vulnerabilities
     */
    private analyzeDependencies;
    /**
     * Calculate overall risk score
     */
    private calculateOverallRisk;
    /**
     * Predict risk score for future date
     */
    private predictRiskScore;
    /**
     * Identify hot spots (high-risk areas)
     */
    private identifyHotSpots;
    /**
     * Generate recommendations
     */
    private generateRecommendations;
    private saveHistory;
    private loadHistory;
    /**
     * Get analysis history
     */
    getHistory(): AttackSurfaceAnalysis[];
    /**
     * Compare two analyses
     */
    compareAnalyses(older: AttackSurfaceAnalysis, newer: AttackSurfaceAnalysis): {
        newVulnerabilities: VulnerabilityTrend[];
        resolvedVulnerabilities: VulnerabilityTrend[];
        riskChange: number;
        summary: string;
    };
}
//# sourceMappingURL=predictive-attack-surface.d.ts.map