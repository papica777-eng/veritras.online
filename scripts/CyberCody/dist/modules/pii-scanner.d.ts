import { EventEmitter } from 'events';
/**
 * PII category types
 */
export type PIICategory = 'email' | 'phone' | 'ssn' | 'credit_card' | 'passport' | 'drivers_license' | 'national_id' | 'address' | 'dob' | 'ip_address' | 'mac_address' | 'iban' | 'swift' | 'tax_id' | 'medical_record' | 'biometric' | 'genetic' | 'bank_account' | 'crypto_wallet' | 'username' | 'password_hash' | 'api_key' | 'jwt_token' | 'session_id';
/**
 * Risk level for PII exposure
 */
export type PIIRiskLevel = 'critical' | 'high' | 'medium' | 'low' | 'info';
/**
 * Compliance framework
 */
export type ComplianceFramework = 'GDPR' | 'CCPA' | 'HIPAA' | 'PCI-DSS' | 'SOX' | 'FERPA' | 'COPPA';
/**
 * Detected PII instance
 */
export interface PIIDetection {
    id: string;
    category: PIICategory;
    value: string;
    redactedValue: string;
    confidence: number;
    riskLevel: PIIRiskLevel;
    fieldPath: string;
    context: string;
    compliance: ComplianceFramework[];
    location: {
        startIndex: number;
        endIndex: number;
        line?: number;
    };
    metadata: Record<string, unknown>;
}
/**
 * PII Scanner configuration
 */
export interface PIIScannerConfig {
    categories?: PIICategory[];
    minConfidence?: number;
    useAI?: boolean;
    geminiApiKey?: string;
    customPatterns?: CustomPIIPattern[];
    redactMode?: 'full' | 'partial' | 'hash' | 'none';
    countryCode?: string;
}
/**
 * Custom PII pattern definition
 */
export interface CustomPIIPattern {
    name: string;
    category: PIICategory | string;
    pattern: RegExp;
    riskLevel: PIIRiskLevel;
    compliance: ComplianceFramework[];
    validator?: (value: string) => boolean;
}
/**
 * Endpoint PII analysis result
 */
export interface EndpointPIIResult {
    endpoint: string;
    method: string;
    detections: PIIDetection[];
    riskScore: number;
    compliance: {
        framework: ComplianceFramework;
        violations: string[];
    }[];
    recommendations: string[];
}
/**
 * PII Scanner report
 */
export interface PIIScannerReport {
    target: string;
    startTime: Date;
    endTime: Date;
    endpointsScanned: number;
    totalDetections: number;
    detectionsByCategory: Record<PIICategory, number>;
    detectionsByRisk: Record<PIIRiskLevel, number>;
    criticalEndpoints: EndpointPIIResult[];
    complianceViolations: {
        framework: ComplianceFramework;
        count: number;
        details: string[];
    }[];
    overallRiskScore: number;
    recommendations: string[];
}
/**
 * Comprehensive PII detection patterns
 */
declare const PII_PATTERNS: Record<PIICategory, {
    patterns: RegExp[];
    riskLevel: PIIRiskLevel;
    compliance: ComplianceFramework[];
}>;
/**
 * PII Scanner - The Privacy Hunter
 *
 * Comprehensive Personal Identifiable Information detection engine
 * with 50+ regex patterns and optional AI enhancement.
 */
export declare class PIIScanner extends EventEmitter {
    private config;
    private customPatterns;
    private detections;
    constructor(config?: PIIScannerConfig);
    /**
     * Scan a string for PII
     */
    scanText(text: string, fieldPath?: string): PIIDetection[];
    /**
     * Scan JSON object recursively for PII
     */
    scanJSON(obj: unknown, basePath?: string): PIIDetection[];
    /**
     * Scan an API response
     */
    scanAPIResponse(endpoint: string, method: string, responseBody: string, headers?: Record<string, string>): Promise<EndpointPIIResult>;
    /**
     * Check field name for sensitive indicators
     */
    private checkFieldName;
    /**
     * Calculate confidence score for a detection
     */
    private calculateConfidence;
    /**
     * Luhn algorithm for credit card validation
     */
    private luhnCheck;
    /**
     * Redact a PII value
     */
    private redact;
    /**
     * Calculate risk score for an endpoint
     */
    private calculateEndpointRiskScore;
    /**
     * Analyze compliance violations
     */
    private analyzeCompliance;
    /**
     * Generate recommendations
     */
    private generateRecommendations;
    /**
     * Extract context around a match
     */
    private extractContext;
    /**
     * Generate unique ID for detection
     */
    private generateId;
    /**
     * Generate comprehensive report
     */
    generateReport(target: string, startTime: Date): PIIScannerReport;
    /**
     * Print report to console
     */
    printReport(report: PIIScannerReport): void;
    /**
     * Clear all detections
     */
    clearDetections(): void;
    /**
     * Add custom pattern
     */
    addCustomPattern(pattern: CustomPIIPattern): void;
}
export { PII_PATTERNS };
//# sourceMappingURL=pii-scanner.d.ts.map