/**
 * dashboard-sync — Qantum Module
 * @module dashboard-sync
 * @path scripts/CyberCody/src/modules/dashboard-sync.ts
 * @auto-documented BrutalDocEngine v2.1
 */

// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║  CYBERCODY v1.3.0 - DASHBOARD SYNC MODULE                                    ║
// ║  "The Visual Hacker" - Real-Time Integration with Mister Mind Dashboard      ║
// ║  WebSocket bridge for unified security ecosystem                             ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

import { EventEmitter } from 'events';
import { WebSocket } from 'ws';
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

// ═══════════════════════════════════════════════════════════════════════════════
// 🎯 TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════════════════

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
export type DashboardEventType = 
  | 'scan:start'
  | 'scan:progress'
  | 'scan:complete'
  | 'vulnerability:found'
  | 'pii:detected'
  | 'phishing:detected'
  | 'clickjacking:detected'
  | 'health:update'
  | 'report:ready'
  | 'alert:critical'
  | 'alert:high'
  | 'status:connected'
  | 'status:disconnected';

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

// ═══════════════════════════════════════════════════════════════════════════════
// 🔌 DASHBOARD SYNC CLASS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Dashboard Sync Module
 * 
 * Provides real-time integration between CyberCody security scanner
 * and Mister Mind Dashboard for unified security monitoring.
 */
export class DashboardSync extends EventEmitter {
  private config: Required<DashboardSyncConfig>;
  private ws: WebSocket | null = null;
  private connectionStatus: ConnectionStatus = 'disconnected';
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private eventQueue: DashboardEvent[] = [];
  private batchTimer: NodeJS.Timeout | null = null;
  private currentHealthScore: SecurityHealthScore;
  private activeScanId: string | null = null;

  constructor(config: DashboardSyncConfig = {}) {
    super();
    
    this.config = {
      dashboardUrl: config.dashboardUrl ?? 'localhost',
      dashboardPort: config.dashboardPort ?? 3847,
      apiKey: config.apiKey ?? '',
      autoConnect: config.autoConnect ?? true,
      reconnectInterval: config.reconnectInterval ?? 5000,
      maxReconnectAttempts: config.maxReconnectAttempts ?? 10,
      reportStorePath: config.reportStorePath ?? './reports',
      enableRealTimeUpdates: config.enableRealTimeUpdates ?? true,
      batchUpdates: config.batchUpdates ?? false,
      batchInterval: config.batchInterval ?? 1000,
    };

    // Initialize health score
    this.currentHealthScore = this.createDefaultHealthScore();

    // Ensure report directory exists
    if (!existsSync(this.config.reportStorePath)) {
      // Complexity: O(1)
      mkdirSync(this.config.reportStorePath, { recursive: true });
    }

    // Auto-connect if enabled
    if (this.config.autoConnect) {
      this.connect();
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 🔌 CONNECTION MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Connect to Mister Mind Dashboard
   */
  // Complexity: O(1) — amortized
  async connect(): Promise<boolean> {
    if (this.connectionStatus === 'connected') {
      return true;
    }

    this.connectionStatus = 'connecting';
    this.emit('status:connecting');

    try {
      const wsUrl = `ws://${this.config.dashboardUrl}:${this.config.dashboardPort}/cybercody`;
      
      this.ws = new WebSocket(wsUrl, {
        headers: {
          'X-API-Key': this.config.apiKey,
          'X-Client': 'CyberCody',
          'X-Version': '1.3.0',
        },
      });

      return new Promise((resolve) => {
        if (!this.ws) {
          // Complexity: O(1)
          resolve(false);
          return;
        }

        this.ws.on('open', () => {
          this.connectionStatus = 'connected';
          this.reconnectAttempts = 0;
          this.emit('status:connected');
          
          // Send identification
          this.sendEvent({
            type: 'status:connected',
            timestamp: new Date(),
            source: 'cybercody',
            version: '1.3.0',
            data: {
              capabilities: [
                'api-audit', 'ghost-audit', 'visual-audit',
                'phishing-scan', 'hidden-scan', 'bola-test',
                'pii-scan', 'fuzzing', 'recon'
              ],
            },
          });

          // Process queued events
          this.flushEventQueue();
          
          // Complexity: O(1)
          resolve(true);
        });

        this.ws.on('message', (data) => {
          this.handleMessage(data.toString());
        });

        this.ws.on('close', () => {
          this.connectionStatus = 'disconnected';
          this.emit('status:disconnected');
          this.scheduleReconnect();
        });

        this.ws.on('error', (error) => {
          this.connectionStatus = 'error';
          this.emit('error', error);
          // Complexity: O(1)
          resolve(false);
        });

        // Timeout after 10 seconds
        // Complexity: O(1)
        setTimeout(() => {
          if (this.connectionStatus === 'connecting') {
            this.connectionStatus = 'error';
            // Complexity: O(1)
            resolve(false);
          }
        }, 10000);
      });

    } catch (error) {
      this.connectionStatus = 'error';
      this.emit('error', error);
      return false;
    }
  }

  /**
   * Disconnect from dashboard
   */
  // Complexity: O(1) — amortized
  disconnect(): void {
    if (this.reconnectTimer) {
      // Complexity: O(1)
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.batchTimer) {
      // Complexity: O(1)
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }

    if (this.ws) {
      this.sendEvent({
        type: 'status:disconnected',
        timestamp: new Date(),
        source: 'cybercody',
        version: '1.3.0',
        data: { reason: 'client_disconnect' },
      });

      this.ws.close();
      this.ws = null;
    }

    this.connectionStatus = 'disconnected';
    this.emit('status:disconnected');
  }

  /**
   * Schedule reconnection attempt
   */
  // Complexity: O(1)
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      this.emit('reconnect:failed', { attempts: this.reconnectAttempts });
      return;
    }

    this.connectionStatus = 'reconnecting';
    this.reconnectAttempts++;
    
    this.emit('reconnect:scheduled', { 
      attempt: this.reconnectAttempts,
      maxAttempts: this.config.maxReconnectAttempts,
      delay: this.config.reconnectInterval,
    });

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, this.config.reconnectInterval);
  }

  /**
   * Handle incoming message from dashboard
   */
  // Complexity: O(1) — amortized
  private handleMessage(data: string): void {
    try {
      const message = JSON.parse(data);
      
      switch (message.type) {
        case 'command:scan':
          this.emit('command:scan', message.data);
          break;
        case 'command:stop':
          this.emit('command:stop', message.data);
          break;
        case 'request:health':
          this.sendHealthUpdate();
          break;
        case 'request:report':
          this.sendReport(message.data?.reportId);
          break;
        case 'ping':
          this.ws?.send(JSON.stringify({ type: 'pong', timestamp: new Date() }));
          break;
        default:
          this.emit('message', message);
      }
    } catch {
      this.emit('message:error', { data });
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 📤 EVENT SENDING
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Send event to dashboard
   */
  // Complexity: O(1)
  sendEvent(event: DashboardEvent): void {
    if (this.config.batchUpdates) {
      this.eventQueue.push(event);
      this.scheduleBatchSend();
    } else {
      this.sendImmediate(event);
    }
  }

  /**
   * Send event immediately
   */
  // Complexity: O(1)
  private sendImmediate(event: DashboardEvent): void {
    if (this.connectionStatus !== 'connected' || !this.ws) {
      this.eventQueue.push(event);
      return;
    }

    try {
      this.ws.send(JSON.stringify(event));
    } catch (error) {
      this.eventQueue.push(event);
      this.emit('send:error', { error, event });
    }
  }

  /**
   * Schedule batch send
   */
  // Complexity: O(N) — potential recursive descent
  private scheduleBatchSend(): void {
    if (this.batchTimer) return;

    this.batchTimer = setTimeout(() => {
      this.flushEventQueue();
      this.batchTimer = null;
    }, this.config.batchInterval);
  }

  /**
   * Flush event queue
   */
  // Complexity: O(1)
  private flushEventQueue(): void {
    if (this.eventQueue.length === 0) return;
    if (this.connectionStatus !== 'connected' || !this.ws) return;

    const events = [...this.eventQueue];
    this.eventQueue = [];

    try {
      this.ws.send(JSON.stringify({
        type: 'batch',
        events,
        timestamp: new Date(),
      }));
    } catch (error) {
      // Re-queue failed events
      this.eventQueue = [...events, ...this.eventQueue];
      this.emit('send:error', { error });
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 📊 SCAN PROGRESS & REPORTING
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Start tracking a new scan
   */
  // Complexity: O(1)
  startScan(target: string, scanType: DashboardSecurityReport['scanType']): string {
    const scanId = `scan-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    this.activeScanId = scanId;

    this.sendEvent({
      type: 'scan:start',
      timestamp: new Date(),
      source: 'cybercody',
      version: '1.3.0',
      data: {
        scanId,
        target,
        scanType,
      },
    });

    return scanId;
  }

  /**
   * Update scan progress
   */
  // Complexity: O(1)
  updateProgress(progress: ScanProgress): void {
    this.sendEvent({
      type: 'scan:progress',
      timestamp: new Date(),
      source: 'cybercody',
      version: '1.3.0',
      data: progress,
    });
  }

  /**
   * Report a found vulnerability
   */
  // Complexity: O(N)
  reportVulnerability(vuln: VulnerabilitySummary): void {
    // Update health score
    this.updateHealthFromVulnerability(vuln);

    this.sendEvent({
      type: 'vulnerability:found',
      timestamp: new Date(),
      source: 'cybercody',
      version: '1.3.0',
      data: vuln,
    });

    // Send alert for critical/high
    if (vuln.severity === 'critical') {
      this.sendEvent({
        type: 'alert:critical',
        timestamp: new Date(),
        source: 'cybercody',
        version: '1.3.0',
        data: {
          message: `CRITICAL: ${vuln.type} found at ${vuln.endpoint ?? vuln.target}`,
          vulnerability: vuln,
        },
      });
    } else if (vuln.severity === 'high') {
      this.sendEvent({
        type: 'alert:high',
        timestamp: new Date(),
        source: 'cybercody',
        version: '1.3.0',
        data: {
          message: `HIGH: ${vuln.type} found at ${vuln.endpoint ?? vuln.target}`,
          vulnerability: vuln,
        },
      });
    }
  }

  /**
   * Report PII detection
   */
  // Complexity: O(1)
  reportPIIDetection(detection: {
    category: string;
    endpoint: string;
    count: number;
    compliance: string[];
  }): void {
    this.sendEvent({
      type: 'pii:detected',
      timestamp: new Date(),
      source: 'cybercody',
      version: '1.3.0',
      data: detection,
    });
  }

  /**
   * Report phishing detection
   */
  // Complexity: O(1)
  reportPhishingDetection(detection: {
    url: string;
    riskScore: number;
    detectedBrands: string[];
    visualMismatch: boolean;
  }): void {
    this.sendEvent({
      type: 'phishing:detected',
      timestamp: new Date(),
      source: 'cybercody',
      version: '1.3.0',
      data: detection,
    });
  }

  /**
   * Report clickjacking detection
   */
  // Complexity: O(1)
  reportClickjacking(detection: {
    url: string;
    vectorCount: number;
    hiddenElements: number;
    riskScore: number;
  }): void {
    this.sendEvent({
      type: 'clickjacking:detected',
      timestamp: new Date(),
      source: 'cybercody',
      version: '1.3.0',
      data: detection,
    });
  }

  /**
   * Complete a scan and send final report
   */
  // Complexity: O(1) — amortized
  completeScan(report: DashboardSecurityReport): void {
    // Save report to disk
    const reportPath = this.saveReport(report);
    report.rawReportPath = reportPath;

    // Update overall health score
    this.currentHealthScore = report.healthScore;

    this.sendEvent({
      type: 'scan:complete',
      timestamp: new Date(),
      source: 'cybercody',
      version: '1.3.0',
      data: report,
    });

    this.sendEvent({
      type: 'report:ready',
      timestamp: new Date(),
      source: 'cybercody',
      version: '1.3.0',
      data: {
        reportId: report.id,
        target: report.target,
        scanType: report.scanType,
        summary: {
          healthScore: report.healthScore.overall,
          totalVulnerabilities: report.statistics.totalVulnerabilities,
          criticalCount: report.statistics.criticalCount,
        },
      },
    });

    this.activeScanId = null;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 💓 HEALTH SCORE MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Create default health score
   */
  // Complexity: O(1)
  private createDefaultHealthScore(): SecurityHealthScore {
    return {
      overall: 100,
      categories: {
        bola: 100,
        injection: 100,
        pii: 100,
        phishing: 100,
        clickjacking: 100,
        authentication: 100,
        authorization: 100,
        dataExposure: 100,
      },
      trend: 'stable',
      lastUpdated: new Date(),
    };
  }

  /**
   * Update health score based on vulnerability
   */
  // Complexity: O(N) — linear iteration
  private updateHealthFromVulnerability(vuln: VulnerabilitySummary): void {
    const penalty = vuln.severity === 'critical' ? 20 :
                   vuln.severity === 'high' ? 10 :
                   vuln.severity === 'medium' ? 5 : 2;

    // Determine which category to affect
    const type = vuln.type.toLowerCase();
    
    if (type.includes('bola') || type.includes('idor')) {
      this.currentHealthScore.categories.bola = Math.max(0, 
        this.currentHealthScore.categories.bola - penalty);
    }
    if (type.includes('sql') || type.includes('xss') || type.includes('inject')) {
      this.currentHealthScore.categories.injection = Math.max(0,
        this.currentHealthScore.categories.injection - penalty);
    }
    if (type.includes('pii') || type.includes('personal')) {
      this.currentHealthScore.categories.pii = Math.max(0,
        this.currentHealthScore.categories.pii - penalty);
    }
    if (type.includes('phish')) {
      this.currentHealthScore.categories.phishing = Math.max(0,
        this.currentHealthScore.categories.phishing - penalty);
    }
    if (type.includes('clickjack') || type.includes('hidden')) {
      this.currentHealthScore.categories.clickjacking = Math.max(0,
        this.currentHealthScore.categories.clickjacking - penalty);
    }
    if (type.includes('auth')) {
      this.currentHealthScore.categories.authentication = Math.max(0,
        this.currentHealthScore.categories.authentication - penalty);
    }

    // Recalculate overall
    const categories = Object.values(this.currentHealthScore.categories);
    this.currentHealthScore.overall = Math.round(
      categories.reduce((a, b) => a + b, 0) / categories.length
    );

    this.currentHealthScore.lastUpdated = new Date();
    this.currentHealthScore.trend = 'degrading';
  }

  /**
   * Get current health score
   */
  // Complexity: O(1)
  getHealthScore(): SecurityHealthScore {
    return { ...this.currentHealthScore };
  }

  /**
   * Send health update to dashboard
   */
  // Complexity: O(1)
  sendHealthUpdate(): void {
    this.sendEvent({
      type: 'health:update',
      timestamp: new Date(),
      source: 'cybercody',
      version: '1.3.0',
      data: this.currentHealthScore,
    });
  }

  /**
   * Reset health score (after remediation)
   */
  // Complexity: O(1)
  resetHealthScore(): void {
    this.currentHealthScore = this.createDefaultHealthScore();
    this.sendHealthUpdate();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 💾 REPORT STORAGE
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Save report to disk
   */
  // Complexity: O(1)
  private saveReport(report: DashboardSecurityReport): string {
    const filename = `cybercody-report-${report.id}.json`;
    const filepath = join(this.config.reportStorePath, filename);
    
    // Complexity: O(1)
    writeFileSync(filepath, JSON.stringify(report, null, 2));
    
    return filepath;
  }

  /**
   * Load report from disk
   */
  // Complexity: O(1)
  loadReport(reportId: string): DashboardSecurityReport | null {
    const filename = `cybercody-report-${reportId}.json`;
    const filepath = join(this.config.reportStorePath, filename);
    
    if (!existsSync(filepath)) {
      return null;
    }

    try {
      const content = readFileSync(filepath, 'utf-8');
      return JSON.parse(content);
    } catch {
      return null;
    }
  }

  /**
   * Send a specific report to dashboard
   */
  // Complexity: O(1)
  sendReport(reportId?: string): void {
    if (!reportId) return;

    const report = this.loadReport(reportId);
    if (report) {
      this.sendEvent({
        type: 'report:ready',
        timestamp: new Date(),
        source: 'cybercody',
        version: '1.3.0',
        data: report,
      });
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 🔧 UTILITY METHODS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Get connection status
   */
  // Complexity: O(1)
  getConnectionStatus(): ConnectionStatus {
    return this.connectionStatus;
  }

  /**
   * Check if connected
   */
  // Complexity: O(1)
  isConnected(): boolean {
    return this.connectionStatus === 'connected';
  }

  /**
   * Get active scan ID
   */
  // Complexity: O(1)
  getActiveScanId(): string | null {
    return this.activeScanId;
  }

  /**
   * Build security report from CyberCody scan results
   */
  // Complexity: O(1)
  buildSecurityReport(
    target: string,
    scanType: DashboardSecurityReport['scanType'],
    startTime: Date,
    endTime: Date,
    rawResults: {
      bolaReport?: { totalTests: number; vulnerabilitiesFound: number; criticalVulns: number };
      piiReport?: { totalDetections: number; criticalExposures: number };
      phishingReport?: { phishingDetected: number; highRiskPages: unknown[] };
      hiddenReport?: { clickjackingVectors: unknown[]; criticalFindings: number };
      vulnerabilities?: VulnerabilitySummary[];
      statistics?: Partial<DashboardSecurityReport['statistics']>;
      recommendations?: string[];
    }
  ): DashboardSecurityReport {
    const reportId = `report-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    // Calculate statistics
    const vulns = rawResults.vulnerabilities ?? [];
    const statistics: DashboardSecurityReport['statistics'] = {
      totalEndpoints: rawResults.statistics?.totalEndpoints ?? 0,
      testedEndpoints: rawResults.statistics?.testedEndpoints ?? 0,
      totalVulnerabilities: vulns.length,
      criticalCount: vulns.filter(v => v.severity === 'critical').length,
      highCount: vulns.filter(v => v.severity === 'high').length,
      mediumCount: vulns.filter(v => v.severity === 'medium').length,
      lowCount: vulns.filter(v => v.severity === 'low').length,
      piiExposures: rawResults.piiReport?.totalDetections ?? 0,
      phishingRisks: rawResults.phishingReport?.phishingDetected ?? 0,
      clickjackingVectors: (rawResults.hiddenReport?.clickjackingVectors ?? []).length,
    };

    // Calculate health score
    const healthScore = this.calculateHealthScore(statistics, rawResults);

    return {
      id: reportId,
      target,
      scanType,
      startTime,
      endTime,
      healthScore,
      vulnerabilities: vulns,
      statistics,
      recommendations: rawResults.recommendations ?? [],
    };
  }

  /**
   * Calculate health score from statistics
   */
  // Complexity: O(1)
  private calculateHealthScore(
    statistics: DashboardSecurityReport['statistics'],
    rawResults: {
      bolaReport?: { criticalVulns: number };
      piiReport?: { criticalExposures: number };
      hiddenReport?: { criticalFindings: number };
    }
  ): SecurityHealthScore {
    const score = { ...this.createDefaultHealthScore() };

    // Penalize based on findings
    score.categories.bola = Math.max(0, 100 - (statistics.criticalCount * 20) - (statistics.highCount * 10));
    score.categories.injection = Math.max(0, 100 - (statistics.criticalCount * 15) - (statistics.highCount * 8));
    score.categories.pii = Math.max(0, 100 - (statistics.piiExposures * 5));
    score.categories.phishing = Math.max(0, 100 - (statistics.phishingRisks * 15));
    score.categories.clickjacking = Math.max(0, 100 - (statistics.clickjackingVectors * 10));
    score.categories.dataExposure = Math.max(0, 100 - (statistics.piiExposures * 3) - (rawResults.piiReport?.criticalExposures ?? 0) * 10);
    
    // Calculate overall
    const categories = Object.values(score.categories);
    score.overall = Math.round(categories.reduce((a, b) => a + b, 0) / categories.length);
    score.lastUpdated = new Date();
    
    // Determine trend
    if (score.overall < 50) score.trend = 'degrading';
    else if (score.overall > 80) score.trend = 'improving';
    else score.trend = 'stable';

    return score;
  }
}
