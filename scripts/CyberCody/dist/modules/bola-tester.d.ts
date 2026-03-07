import { EventEmitter } from 'events';
import type { HTTPMethod } from '../../../qantum/SaaS-Framework/01_ECOSYSTEM_APPS/MrMindQATool/src/index';
import type { BOLATarget, APIMap, AuthenticationInfo } from '../../../qantum/SaaS-Framework/01_ECOSYSTEM_APPS/MisterMind-Site/dpengeneering/cybercody/src/modules/api-interceptor';
/**
 * BOLA test configuration
 */
export interface BOLATestConfig {
    /** API map from interceptor */
    apiMap: APIMap;
    /** Number of ID variations to test */
    variationsPerTarget?: number;
    /** Worker threads for parallel testing */
    workerCount?: number;
    /** Delay between requests (ms) */
    delayMs?: number;
    /** Request timeout (ms) */
    timeoutMs?: number;
    /** Authentication tokens to test with */
    authTokens?: AuthenticationInfo[];
    /** Test without auth as well */
    testUnauthenticated?: boolean;
    /** Custom ID values to test */
    customIds?: string[];
}
/**
 * Single BOLA test result
 */
export interface BOLATestResult {
    target: BOLATarget;
    testId: string;
    timestamp: Date;
    /** Original request */
    originalRequest: {
        url: string;
        method: HTTPMethod;
        authToken?: string;
    };
    /** Modified request (with swapped ID) */
    testedRequest: {
        url: string;
        method: HTTPMethod;
        testedValue: string;
        authToken?: string;
    };
    /** Original response */
    originalResponse: {
        statusCode: number;
        bodyHash: string;
        bodyLength: number;
        sensitiveFields: string[];
    };
    /** Tested response (with different ID) */
    testedResponse: {
        statusCode: number;
        bodyHash: string;
        bodyLength: number;
        sensitiveFields: string[];
        responseTime: number;
    };
    /** Vulnerability assessment */
    vulnerability: BOLAVulnerability;
}
/**
 * BOLA vulnerability details
 */
export interface BOLAVulnerability {
    detected: boolean;
    confidence: 'low' | 'medium' | 'high' | 'confirmed';
    type: BOLAType;
    evidence: string[];
    severity: 'info' | 'low' | 'medium' | 'high' | 'critical';
    dataExposed?: string[];
}
export type BOLAType = 'horizontal_privilege_escalation' | 'vertical_privilege_escalation' | 'data_enumeration' | 'unauthorized_access' | 'none';
/**
 * ID mutation strategy
 */
export interface IDMutation {
    type: 'increment' | 'decrement' | 'random' | 'zero' | 'negative' | 'max' | 'uuid' | 'custom';
    value: string;
    description: string;
}
/**
 * Complete BOLA test report
 */
export interface BOLATestReport {
    target: string;
    startTime: Date;
    endTime: Date;
    totalTargets: number;
    totalTests: number;
    vulnerabilitiesFound: number;
    results: BOLATestResult[];
    summary: {
        criticalVulns: number;
        highVulns: number;
        mediumVulns: number;
        lowVulns: number;
        confirmedBOLA: BOLATestResult[];
        potentialBOLA: BOLATestResult[];
    };
    recommendations: string[];
}
/**
 * BOLA Tester - The Identity Thief
 *
 * Tests for Broken Object Level Authorization vulnerabilities by
 * systematically swapping object IDs and analyzing server responses.
 */
export declare class BOLATester extends EventEmitter {
    private config;
    private results;
    constructor(config: BOLATestConfig);
    /**
     * Run BOLA tests on all identified targets
     */
    test(): Promise<BOLATestReport>;
    /**
     * Run worker thread for BOLA testing
     */
    private runWorker;
    /**
     * Generate test report
     */
    private generateReport;
    /**
     * Generate empty report
     */
    private generateEmptyReport;
    /**
     * Print report to console
     */
    private printReport;
    /**
     * Get all results
     */
    getResults(): BOLATestResult[];
    /**
     * Get confirmed vulnerabilities only
     */
    getConfirmedVulnerabilities(): BOLATestResult[];
    /**
     * Export results to JSON
     */
    exportToJSON(): string;
}
export default BOLATester;
//# sourceMappingURL=bola-tester.d.ts.map