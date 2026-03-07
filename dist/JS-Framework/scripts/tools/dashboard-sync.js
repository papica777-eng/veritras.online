"use strict";
// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║  CYBERCODY v1.3.0 - DASHBOARD SYNC MODULE                                    ║
// ║  "The Visual Hacker" - Real-Time Integration with Mister Mind Dashboard      ║
// ║  WebSocket bridge for unified security ecosystem                             ║
// ╚══════════════════════════════════════════════════════════════════════════════╝
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardSync = void 0;
const events_1 = require("events");
const ws_1 = require("ws");
const fs_1 = require("fs");
const path_1 = require("path");
// ═══════════════════════════════════════════════════════════════════════════════
// 🔌 DASHBOARD SYNC CLASS
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * Dashboard Sync Module
 *
 * Provides real-time integration between CyberCody security scanner
 * and Mister Mind Dashboard for unified security monitoring.
 */
class DashboardSync extends events_1.EventEmitter {
    config;
    ws = null;
    connectionStatus = 'disconnected';
    reconnectAttempts = 0;
    reconnectTimer = null;
    eventQueue = [];
    batchTimer = null;
    currentHealthScore;
    activeScanId = null;
    constructor(config = {}) {
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
        if (!(0, fs_1.existsSync)(this.config.reportStorePath)) {
            (0, fs_1.mkdirSync)(this.config.reportStorePath, { recursive: true });
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
    async connect() {
        if (this.connectionStatus === 'connected') {
            return true;
        }
        this.connectionStatus = 'connecting';
        this.emit('status:connecting');
        try {
            const wsUrl = `ws://${this.config.dashboardUrl}:${this.config.dashboardPort}/cybercody`;
            this.ws = new ws_1.WebSocket(wsUrl, {
                headers: {
                    'X-API-Key': this.config.apiKey,
                    'X-Client': 'CyberCody',
                    'X-Version': '1.3.0',
                },
            });
            return new Promise((resolve) => {
                if (!this.ws) {
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
                    resolve(false);
                });
                // Timeout after 10 seconds
                setTimeout(() => {
                    if (this.connectionStatus === 'connecting') {
                        this.connectionStatus = 'error';
                        resolve(false);
                    }
                }, 10000);
            });
        }
        catch (error) {
            this.connectionStatus = 'error';
            this.emit('error', error);
            return false;
        }
    }
    /**
     * Disconnect from dashboard
     */
    disconnect() {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
        if (this.batchTimer) {
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
    scheduleReconnect() {
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
    handleMessage(data) {
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
        }
        catch {
            this.emit('message:error', { data });
        }
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // 📤 EVENT SENDING
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Send event to dashboard
     */
    sendEvent(event) {
        if (this.config.batchUpdates) {
            this.eventQueue.push(event);
            this.scheduleBatchSend();
        }
        else {
            this.sendImmediate(event);
        }
    }
    /**
     * Send event immediately
     */
    sendImmediate(event) {
        if (this.connectionStatus !== 'connected' || !this.ws) {
            this.eventQueue.push(event);
            return;
        }
        try {
            this.ws.send(JSON.stringify(event));
        }
        catch (error) {
            this.eventQueue.push(event);
            this.emit('send:error', { error, event });
        }
    }
    /**
     * Schedule batch send
     */
    scheduleBatchSend() {
        if (this.batchTimer)
            return;
        this.batchTimer = setTimeout(() => {
            this.flushEventQueue();
            this.batchTimer = null;
        }, this.config.batchInterval);
    }
    /**
     * Flush event queue
     */
    flushEventQueue() {
        if (this.eventQueue.length === 0)
            return;
        if (this.connectionStatus !== 'connected' || !this.ws)
            return;
        const events = [...this.eventQueue];
        this.eventQueue = [];
        try {
            this.ws.send(JSON.stringify({
                type: 'batch',
                events,
                timestamp: new Date(),
            }));
        }
        catch (error) {
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
    startScan(target, scanType) {
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
    updateProgress(progress) {
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
    reportVulnerability(vuln) {
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
        }
        else if (vuln.severity === 'high') {
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
    reportPIIDetection(detection) {
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
    reportPhishingDetection(detection) {
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
    reportClickjacking(detection) {
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
    completeScan(report) {
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
    createDefaultHealthScore() {
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
    updateHealthFromVulnerability(vuln) {
        const penalty = vuln.severity === 'critical' ? 20 :
            vuln.severity === 'high' ? 10 :
                vuln.severity === 'medium' ? 5 : 2;
        // Determine which category to affect
        const type = vuln.type.toLowerCase();
        if (type.includes('bola') || type.includes('idor')) {
            this.currentHealthScore.categories.bola = Math.max(0, this.currentHealthScore.categories.bola - penalty);
        }
        if (type.includes('sql') || type.includes('xss') || type.includes('inject')) {
            this.currentHealthScore.categories.injection = Math.max(0, this.currentHealthScore.categories.injection - penalty);
        }
        if (type.includes('pii') || type.includes('personal')) {
            this.currentHealthScore.categories.pii = Math.max(0, this.currentHealthScore.categories.pii - penalty);
        }
        if (type.includes('phish')) {
            this.currentHealthScore.categories.phishing = Math.max(0, this.currentHealthScore.categories.phishing - penalty);
        }
        if (type.includes('clickjack') || type.includes('hidden')) {
            this.currentHealthScore.categories.clickjacking = Math.max(0, this.currentHealthScore.categories.clickjacking - penalty);
        }
        if (type.includes('auth')) {
            this.currentHealthScore.categories.authentication = Math.max(0, this.currentHealthScore.categories.authentication - penalty);
        }
        // Recalculate overall
        const categories = Object.values(this.currentHealthScore.categories);
        this.currentHealthScore.overall = Math.round(categories.reduce((a, b) => a + b, 0) / categories.length);
        this.currentHealthScore.lastUpdated = new Date();
        this.currentHealthScore.trend = 'degrading';
    }
    /**
     * Get current health score
     */
    getHealthScore() {
        return { ...this.currentHealthScore };
    }
    /**
     * Send health update to dashboard
     */
    sendHealthUpdate() {
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
    resetHealthScore() {
        this.currentHealthScore = this.createDefaultHealthScore();
        this.sendHealthUpdate();
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // 💾 REPORT STORAGE
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Save report to disk
     */
    saveReport(report) {
        const filename = `cybercody-report-${report.id}.json`;
        const filepath = (0, path_1.join)(this.config.reportStorePath, filename);
        (0, fs_1.writeFileSync)(filepath, JSON.stringify(report, null, 2));
        return filepath;
    }
    /**
     * Load report from disk
     */
    loadReport(reportId) {
        const filename = `cybercody-report-${reportId}.json`;
        const filepath = (0, path_1.join)(this.config.reportStorePath, filename);
        if (!(0, fs_1.existsSync)(filepath)) {
            return null;
        }
        try {
            const content = (0, fs_1.readFileSync)(filepath, 'utf-8');
            return JSON.parse(content);
        }
        catch {
            return null;
        }
    }
    /**
     * Send a specific report to dashboard
     */
    sendReport(reportId) {
        if (!reportId)
            return;
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
    getConnectionStatus() {
        return this.connectionStatus;
    }
    /**
     * Check if connected
     */
    isConnected() {
        return this.connectionStatus === 'connected';
    }
    /**
     * Get active scan ID
     */
    getActiveScanId() {
        return this.activeScanId;
    }
    /**
     * Build security report from CyberCody scan results
     */
    buildSecurityReport(target, scanType, startTime, endTime, rawResults) {
        const reportId = `report-${Date.now()}-${Math.random().toString(36).substring(7)}`;
        // Calculate statistics
        const vulns = rawResults.vulnerabilities ?? [];
        const statistics = {
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
    calculateHealthScore(statistics, rawResults) {
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
        if (score.overall < 50)
            score.trend = 'degrading';
        else if (score.overall > 80)
            score.trend = 'improving';
        else
            score.trend = 'stable';
        return score;
    }
}
exports.DashboardSync = DashboardSync;
