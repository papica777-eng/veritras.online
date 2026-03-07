import { EventEmitter } from 'events';
/**
 * Security health metrics
 */
export interface SecurityHealthScore {
    overall: number;
    categories: {
        bola: number;
        injection: number;
        pii: number;
        phishing: number;
        clickjacking: number;
        authentication: number;
        authorization: number;
        dataExposure: number;
    };
    trend: 'improving' | 'stable' | 'degrading';
    lastUpdated: Date;
}
/**
 * Dashboard sync event
 */
export interface DashboardEvent {
    type: DashboardEventType;
    timestamp: Date;
    source: 'cybercody';
    version: string;
    data: unknown;
}
/**
 * Event types for dashboard
 */
export type DashboardEventType = 'scan:start' | 'scan:progress' | 'scan:complete' | 'vulnerability:found' | 'pii:detected' | 'phishing:detected' | 'clickjacking:detected' | 'health:update' | 'report:ready' | 'alert:critical' | 'alert:high' | 'status:connected' | 'status:disconnected';
/**
 * Vulnerability summary for dashboard
 */
export interface VulnerabilitySummary {
    id: string;
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    target: string;
    endpoint?: string;
    description: string;
    timestamp: Date;
    remediation?: string;
}
/**
 * Scan progress update
 */
export interface ScanProgress {
    scanId: string;
    target: string;
    phase: string;
    progress: number;
    currentTask: string;
    findings: number;
    startTime: Date;
    estimatedCompletion?: Date;
}
/**
 * Full security report for dashboard
 */
export interface DashboardSecurityReport {
    id: string;
    target: string;
    scanType: 'full' | 'api' | 'ghost' | 'visual' | 'phishing' | 'hidden';
    startTime: Date;
    endTime: Date;
    healthScore: SecurityHealthScore;
    vulnerabilities: VulnerabilitySummary[];
    statistics: {
        totalEndpoints: number;
        testedEndpoints: number;
        totalVulnerabilities: number;
        criticalCount: number;
        highCount: number;
        mediumCount: number;
        lowCount: number;
        piiExposures: number;
        phishingRisks: number;
        clickjackingVectors: number;
    };
    recommendations: string[];
    rawReportPath?: string;
}
/**
 * Dashboard sync configuration
 */
export interface DashboardSyncConfig {
    dashboardUrl?: string;
    dashboardPort?: number;
    apiKey?: string;
    autoConnect?: boolean;
    reconnectInterval?: number;
    maxReconnectAttempts?: number;
    reportStorePath?: string;
    enableRealTimeUpdates?: boolean;
    batchUpdates?: boolean;
    batchInterval?: number;
}
/**
 * Connection status
 */
export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error';
/**
 * Dashboard Sync Module
 *
 * Provides real-time integration between CyberCody security scanner
 * and Mister Mind Dashboard for unified security monitoring.
 */
export declare class DashboardSync extends EventEmitter {
    private config;
    private ws;
    private connectionStatus;
    private reconnectAttempts;
    private reconnectTimer;
    private eventQueue;
    private batchTimer;
    private currentHealthScore;
    private activeScanId;
    constructor(config?: DashboardSyncConfig);
    /**
     * Connect to Mister Mind Dashboard
     */
    connect(): Promise<boolean>;
    /**
     * Disconnect from dashboard
     */
    disconnect(): void;
    /**
     * Schedule reconnection attempt
     */
    private scheduleReconnect;
    /**
     * Handle incoming message from dashboard
     */
    private handleMessage;
    /**
     * Send event to dashboard
     */
    sendEvent(event: DashboardEvent): void;
    /**
     * Send event immediately
     */
    private sendImmediate;
    /**
     * Schedule batch send
     */
    private scheduleBatchSend;
    /**
     * Flush event queue
     */
    private flushEventQueue;
    /**
     * Start tracking a new scan
     */
    startScan(target: string, scanType: DashboardSecurityReport['scanType']): string;
    /**
     * Update scan progress
     */
    updateProgress(progress: ScanProgress): void;
    /**
     * Report a found vulnerability
     */
    reportVulnerability(vuln: VulnerabilitySummary): void;
    /**
     * Report PII detection
     */
    reportPIIDetection(detection: {
        category: string;
        endpoint: string;
        count: number;
        compliance: string[];
    }): void;
    /**
     * Report phishing detection
     */
    reportPhishingDetection(detection: {
        url: string;
        riskScore: number;
        detectedBrands: string[];
        visualMismatch: boolean;
    }): void;
    /**
     * Report clickjacking detection
     */
    reportClickjacking(detection: {
        url: string;
        vectorCount: number;
        hiddenElements: number;
        riskScore: number;
    }): void;
    /**
     * Complete a scan and send final report
     */
    completeScan(report: DashboardSecurityReport): void;
    /**
     * Create default health score
     */
    private createDefaultHealthScore;
    /**
     * Update health score based on vulnerability
     */
    private updateHealthFromVulnerability;
    /**
     * Get current health score
     */
    getHealthScore(): SecurityHealthScore;
    /**
     * Send health update to dashboard
     */
    sendHealthUpdate(): void;
    /**
     * Reset health score (after remediation)
     */
    resetHealthScore(): void;
    /**
     * Save report to disk
     */
    private saveReport;
    /**
     * Load report from disk
     */
    loadReport(reportId: string): DashboardSecurityReport | null;
    /**
     * Send a specific report to dashboard
     */
    sendReport(reportId?: string): void;
    /**
     * Get connection status
     */
    getConnectionStatus(): ConnectionStatus;
    /**
     * Check if connected
     */
    isConnected(): boolean;
    /**
     * Get active scan ID
     */
    getActiveScanId(): string | null;
    /**
     * Build security report from CyberCody scan results
     */
    buildSecurityReport(target: string, scanType: DashboardSecurityReport['scanType'], startTime: Date, endTime: Date, rawResults: {
        bolaReport?: {
            totalTests: number;
            vulnerabilitiesFound: number;
            criticalVulns: number;
        };
        piiReport?: {
            totalDetections: number;
            criticalExposures: number;
        };
        phishingReport?: {
            phishingDetected: number;
            highRiskPages: unknown[];
        };
        hiddenReport?: {
            clickjackingVectors: unknown[];
            criticalFindings: number;
        };
        vulnerabilities?: VulnerabilitySummary[];
        statistics?: Partial<DashboardSecurityReport['statistics']>;
        recommendations?: string[];
    }): DashboardSecurityReport;
    /**
     * Calculate health score from statistics
     */
    private calculateHealthScore;
}
//# sourceMappingURL=dashboard-sync.d.ts.map