import { EventEmitter } from 'events';
import type { APIMap } from '../../../qantum/SaaS-Framework/01_ECOSYSTEM_APPS/MisterMind-Site/dpengeneering/cybercody/src/modules/api-interceptor';
/**
 * Configuration for Logic Analyzer
 */
export interface LogicAnalyzerConfig {
    /** Gemini API key */
    geminiApiKey?: string;
    /** Use local analysis instead of AI */
    useLocalOnly?: boolean;
    /** Maximum response size to analyze (bytes) */
    maxResponseSize?: number;
    /** Categories to scan for */
    categories?: SensitiveCategory[];
    /** Custom patterns to detect */
    customPatterns?: CustomPattern[];
}
export type SensitiveCategory = 'pii' | 'financial' | 'auth' | 'health' | 'location' | 'internal' | 'business';
export interface CustomPattern {
    name: string;
    pattern: RegExp;
    category: SensitiveCategory;
    severity: DataExposureSeverity;
}
/**
 * Analysis result for a single response
 */
export interface LogicAnalysisResult {
    endpoint: string;
    method: string;
    timestamp: Date;
    /** Data exposures found */
    exposures: DataExposure[];
    /** Logic flaws detected */
    logicFlaws: LogicFlaw[];
    /** AI insights (if Gemini enabled) */
    aiInsights?: AIAnalysis;
    /** Risk score (0-100) */
    riskScore: number;
    /** Overall severity */
    severity: DataExposureSeverity;
}
export type DataExposureSeverity = 'info' | 'low' | 'medium' | 'high' | 'critical';
export interface DataExposure {
    /** Category of exposed data */
    category: SensitiveCategory;
    /** Field name or path where found */
    field: string;
    /** Sample of exposed data (redacted) */
    sample: string;
    /** Pattern that matched */
    pattern: string;
    /** Severity level */
    severity: DataExposureSeverity;
    /** GDPR/HIPAA/PCI relevance */
    compliance: ComplianceTag[];
    /** Remediation suggestion */
    remediation: string;
}
export type ComplianceTag = 'GDPR' | 'HIPAA' | 'PCI-DSS' | 'SOX' | 'CCPA';
export interface LogicFlaw {
    /** Type of logic flaw */
    type: LogicFlawType;
    /** Description */
    description: string;
    /** Evidence */
    evidence: string;
    /** Severity */
    severity: DataExposureSeverity;
    /** Exploitation scenario */
    exploitScenario: string;
}
export type LogicFlawType = 'excessive_data_exposure' | 'debug_info_leak' | 'internal_id_exposure' | 'inconsistent_authorization' | 'mass_assignment' | 'rate_limit_bypass' | 'predictable_identifiers' | 'verbose_errors';
export interface AIAnalysis {
    /** Overall assessment */
    assessment: string;
    /** Data classification suggestions */
    dataClassification: DataClassification[];
    /** Business logic vulnerabilities */
    businessLogicIssues: string[];
    /** Recommended fixes */
    fixes: string[];
    /** Confidence score */
    confidence: number;
}
export interface DataClassification {
    field: string;
    suggestedClassification: 'public' | 'internal' | 'confidential' | 'restricted';
    reason: string;
}
/**
 * Complete analysis report
 */
export interface LogicAnalysisReport {
    target: string;
    analyzedAt: Date;
    totalEndpoints: number;
    totalExposures: number;
    totalLogicFlaws: number;
    results: LogicAnalysisResult[];
    summary: {
        criticalExposures: DataExposure[];
        highRiskEndpoints: string[];
        complianceViolations: Record<ComplianceTag, number>;
        overallRiskScore: number;
    };
    recommendations: string[];
}
/**
 * Logic Analyzer - The AI Eye
 *
 * Uses pattern matching and optional Gemini 2.0 AI to detect
 * sensitive data exposure and business logic vulnerabilities.
 */
export declare class LogicAnalyzer extends EventEmitter {
    private config;
    private results;
    constructor(config?: LogicAnalyzerConfig);
    /**
     * Analyze an API map for sensitive data exposure
     */
    analyzeAPIMap(apiMap: APIMap): Promise<LogicAnalysisReport>;
    /**
     * Analyze a single response
     */
    analyzeResponse(body: string, endpoint: string, method?: string): Promise<LogicAnalysisResult>;
    /**
     * Add custom pattern for detection
     */
    addCustomPattern(pattern: CustomPattern): void;
    /**
     * Generate analysis report
     */
    private generateReport;
    /**
     * Print report to console
     */
    private printReport;
    /**
     * Get all results
     */
    getResults(): LogicAnalysisResult[];
    /**
     * Export results to JSON
     */
    exportToJSON(): string;
}
export default LogicAnalyzer;
//# sourceMappingURL=logic-analyzer.d.ts.map