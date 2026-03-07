import { EventEmitter } from 'events';
/**
 * Known brand patterns for comparison
 */
export interface BrandSignature {
    name: string;
    domains: string[];
    logoPatterns: string[];
    colorSchemes: string[];
    keywords: string[];
    loginUrlPatterns: RegExp[];
}
/**
 * Phishing detection result
 */
export interface PhishingAnalysis {
    url: string;
    screenshotPath: string;
    timestamp: Date;
    domainInfo: {
        domain: string;
        tld: string;
        isIPAddress: boolean;
        hasTyposquatting: boolean;
        suspiciousTLD: boolean;
        ageUnknown: boolean;
        sslValid: boolean;
        sslIssuer: string;
    };
    visualAnalysis: {
        detectedBrands: string[];
        brandConfidence: Record<string, number>;
        loginFormDetected: boolean;
        passwordFieldCount: number;
        suspiciousElements: SuspiciousElement[];
        visualMismatch: boolean;
        mismatchDetails: string[];
    };
    riskAssessment: {
        score: number;
        level: 'safe' | 'low' | 'medium' | 'high' | 'critical';
        indicators: PhishingIndicator[];
        recommendation: string;
    };
    aiSummary: string;
}
/**
 * Suspicious element found on page
 */
export interface SuspiciousElement {
    type: 'hidden_field' | 'fake_url_bar' | 'credential_harvester' | 'obfuscated_link' | 'external_form_action' | 'data_exfiltration';
    selector: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
}
/**
 * Phishing indicator
 */
export interface PhishingIndicator {
    type: string;
    description: string;
    weight: number;
    evidence: string;
}
/**
 * Visual Phishing Detector configuration
 */
export interface VisualPhishingConfig {
    geminiApiKey?: string;
    screenshotDir?: string;
    timeout?: number;
    userAgent?: string;
    knownBrands?: BrandSignature[];
    sensitivityLevel?: 'low' | 'medium' | 'high';
}
/**
 * Full phishing scan report
 */
export interface PhishingReport {
    target: string;
    startTime: Date;
    endTime: Date;
    pagesScanned: number;
    phishingDetected: number;
    highRiskPages: PhishingAnalysis[];
    allAnalyses: PhishingAnalysis[];
    overallRiskScore: number;
    recommendations: string[];
}
/**
 * Visual Phishing Detector
 *
 * Uses Gemini 2.0 Vision AI to analyze screenshots of web pages and detect
 * phishing attempts by comparing visual elements against known brand signatures.
 */
export declare class VisualPhishingDetector extends EventEmitter {
    private config;
    private browser;
    private knownBrands;
    private analyses;
    constructor(config?: VisualPhishingConfig);
    /**
     * Analyze a URL for phishing indicators
     */
    analyzeUrl(url: string): Promise<PhishingAnalysis>;
    /**
     * Scan multiple URLs for phishing
     */
    scanUrls(urls: string[]): Promise<PhishingReport>;
    /**
     * Take a screenshot of the page
     */
    private takeScreenshot;
    /**
     * Generate a hash for the URL
     */
    private hashUrl;
    /**
     * Analyze domain for phishing indicators
     */
    private analyzeDomain;
    /**
     * Extract TLD from domain
     */
    private extractTLD;
    /**
     * Check if domain is an IP address
     */
    private isIPAddress;
    /**
     * Detect typosquatting attempts
     */
    private detectTyposquatting;
    /**
     * Analyze page content for suspicious elements
     */
    private analyzePageContent;
    /**
     * Analyze screenshot with Gemini Vision
     */
    private analyzeWithGeminiVision;
    /**
     * Heuristic visual analysis (when Gemini is unavailable)
     */
    private heuristicVisualAnalysis;
    /**
     * Calculate overall risk score
     */
    private calculateRiskScore;
    /**
     * Calculate overall risk for multiple analyses
     */
    private calculateOverallRisk;
    /**
     * Generate AI summary of the analysis
     */
    private generateAISummary;
    /**
     * Generate recommendations based on analyses
     */
    private generateRecommendations;
    /**
     * Generate full report
     */
    generateReport(target: string, startTime: Date): PhishingReport;
    /**
     * Cleanup resources
     */
    cleanup(): Promise<void>;
    /**
     * Get all analyses
     */
    getAnalyses(): PhishingAnalysis[];
}
//# sourceMappingURL=visual-phishing-detector.d.ts.map