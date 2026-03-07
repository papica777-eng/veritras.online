/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🔍 DRIFT DETECTOR - PREDICTIVE ANOMALY DETECTION
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * v1.0.0 "Quantum" Edition - Living System Protocol
 *
 * This module continuously monitors the system's vital signs and compares them
 * against the Gold Standard baseline (qantum-LEGACY.json). When drift
 * exceeds thresholds, it generates alerts and fix proposals.
 *
 * Features:
 * - Real-time metric comparison against Gold Standard
 * - Latency drift detection (0.05ms sensitivity)
 * - Memory leak early warning
 * - External API changelog monitoring
 * - Anomaly heuristics with trend analysis
 * - Auto-generated fix proposals
 *
 * @version 1.0.0
 * @codename Quantum
 * @author Димитър Продромов (Meta-Architect)
 * @copyright 2025. All Rights Reserved.
 * ═══════════════════════════════════════════════════════════════════════════════
 */
import { EventEmitter } from 'events';
interface CurrentMetrics {
    failoverLatency: number;
    p99FailoverLatency: number;
    avgLatency: number;
    p99Latency: number;
    throughput: number;
    lossPercentage: number;
    lockRecoveryTime: number;
    memoryUsage: number;
    cpuUsage: number;
    timestamp: Date;
}
interface DriftReport {
    timestamp: Date;
    overallStatus: 'healthy' | 'warning' | 'critical';
    healthScore: number;
    drifts: DriftItem[];
    trends: TrendAnalysis[];
    alerts: Alert[];
    fixProposals: FixProposal[];
}
interface DriftItem {
    metric: string;
    goldStandard: number;
    current: number;
    drift: number;
    driftPercentage: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
    direction: 'improved' | 'degraded' | 'stable';
}
interface TrendAnalysis {
    metric: string;
    trend: 'improving' | 'degrading' | 'stable' | 'volatile';
    slope: number;
    confidence: number;
    prediction: string;
}
interface Alert {
    id: string;
    severity: 'info' | 'warning' | 'error' | 'critical';
    category: 'performance' | 'memory' | 'stability' | 'external';
    message: string;
    timestamp: Date;
    acknowledged: boolean;
    autoFixAvailable: boolean;
}
interface FixProposal {
    id: string;
    alert: string;
    description: string;
    impact: 'low' | 'medium' | 'high';
    confidence: number;
    steps: string[];
    autoApplicable: boolean;
    estimatedImprovement: string;
}
export declare class DriftDetector extends EventEmitter {
    private goldStandard;
    private goldStandardPath;
    private metricsHistory;
    private alerts;
    private isMonitoring;
    private monitorInterval;
    private readonly THRESHOLDS;
    constructor(projectRoot: string);
    /**
     * Initialize the Drift Detector by loading Gold Standard
     */
    initialize(): Promise<void>;
    /**
     * Start continuous monitoring
     */
    startMonitoring(intervalMs?: number): void;
    /**
     * Stop monitoring
     */
    stopMonitoring(): void;
    /**
     * Analyze current metrics against Gold Standard
     */
    analyze(currentMetrics: CurrentMetrics): Promise<DriftReport>;
    /**
     * Collect current system metrics
     */
    collectCurrentMetrics(): Promise<CurrentMetrics>;
    /**
     * Run a full drift analysis and print report
     */
    runAnalysis(): Promise<DriftReport>;
    private analyzeDrift;
    private updateHistory;
    private analyzeTrends;
    private calculateSlope;
    private calculateVolatility;
    private createAlert;
    private generateFixProposal;
    private calculateHealthScore;
    private getDefaultGoldStandard;
    private printReport;
}
export { DriftReport, Alert, FixProposal, CurrentMetrics };
//# sourceMappingURL=drift-detector.d.ts.map