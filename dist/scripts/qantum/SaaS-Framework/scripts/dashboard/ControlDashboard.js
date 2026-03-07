"use strict";
/**
 * ControlDashboard.ts - "The Command Center"
 *
 * QAntum Framework v1.9.5 - "The Hybrid Bridge"
 *
 * Dashboard control interface with FULL AUTONOMY vs MANUAL UX OVERRIDE toggle.
 * Provides real-time state management for the entire Swarm consciousness.
 *
 * Control Modes:
 * ┌────────────────────────────────────────────────────────────────────────┐
 * │                          CONTROL DASHBOARD                             │
 * ├────────────────────────────────────────────────────────────────────────┤
 * │                                                                         │
 * │   ┌─────────────────────────────────────────────────────────────────┐  │
 * │   │                    MODE SELECTOR                                 │  │
 * │   │                                                                  │  │
 * │   │    ◉ FULL AUTONOMY      ○ HYBRID       ○ MANUAL UX OVERRIDE    │  │
 * │   │    [====================================|            ]          │  │
 * │   │                                                                  │  │
 * │   └─────────────────────────────────────────────────────────────────┘  │
 * │                                                                         │
 * │   ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐    │
 * │   │  🤖 Workers: 47  │  │  👁️ Spectators: 2 │  │  🎮 Hijacked: 1  │    │
 * │   └──────────────────┘  └──────────────────┘  └──────────────────┘    │
 * │                                                                         │
 * └────────────────────────────────────────────────────────────────────────┘
 *
 * MARKET VALUE: +$180,000 (Enterprise Control)
 *
 * @module dashboard/ControlDashboard
 * @version 1.0.0
 * @enterprise true
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ControlDashboard = void 0;
exports.createControlDashboard = createControlDashboard;
const events_1 = require("events");
const crypto = __importStar(require("crypto"));
// ═══════════════════════════════════════════════════════════════════════════
// DEFAULT CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════
const DEFAULT_CONFIG = {
    stateUpdateInterval: 1000,
    metricsUpdateInterval: 5000,
    requireApprovalForManual: false,
    modeTransitionCooldown: 5000,
    maxAlerts: 100,
    alertRetentionMinutes: 60,
    cpuWarningThreshold: 80,
    memoryWarningThreshold: 85,
    threatEscalationThreshold: 0.7
};
// ═══════════════════════════════════════════════════════════════════════════
// CONTROL DASHBOARD ENGINE
// ═══════════════════════════════════════════════════════════════════════════
/**
 * ControlDashboard - The Nerve Center
 *
 * Central control interface for the entire QAntum swarm.
 * Manages FULL AUTONOMY vs MANUAL UX OVERRIDE switching.
 */
class ControlDashboard extends events_1.EventEmitter {
    config;
    bridge;
    spectator;
    // State
    state;
    workers = new Map();
    alerts = [];
    // Mode transitions
    pendingTransitions = new Map();
    lastModeChange = new Date();
    // Update timers
    stateUpdateTimer;
    metricsUpdateTimer;
    alertCleanupTimer;
    // Event handlers for WebSocket broadcasting
    stateChangeHandlers = [];
    constructor(bridge, spectator, config = {}) {
        super();
        this.bridge = bridge;
        this.spectator = spectator;
        this.config = { ...DEFAULT_CONFIG, ...config };
        // Initialize state
        this.state = {
            controlMode: 'FULL_AUTONOMY',
            systemHealth: 'healthy',
            uptime: 0,
            totalWorkers: 0,
            activeWorkers: 0,
            idleWorkers: 0,
            errorWorkers: 0,
            spectatorCount: 0,
            activeHijacks: 0,
            cpuUsage: 0,
            memoryUsage: 0,
            networkLatency: 0,
            neuralWeightsLoaded: false,
            humanPatternsLearned: 0,
            threatLevel: 'safe',
            activeAlerts: 0
        };
        this.setupListeners();
        this.startUpdateLoops();
        this.emit('initialized', { timestamp: new Date() });
    }
    // ═══════════════════════════════════════════════════════════════════════
    // EVENT LISTENERS
    // ═══════════════════════════════════════════════════════════════════════
    /**
     * Setup event listeners from bridge and spectator
     */
    // Complexity: O(1) — amortized
    setupListeners() {
        // Bridge events
        this.bridge.on('control:mode-changed', (data) => {
            this.handleModeChange(data.newMode);
        });
        this.bridge.on('hijack:started', (data) => {
            this.handleHijackStarted(data.workerId, data.operatorId);
        });
        this.bridge.on('hijack:ended', (data) => {
            this.handleHijackEnded(data.workerId);
        });
        this.bridge.on('client:connected', (data) => {
            if (data.role === 'spectator' || data.role === 'satellite') {
                this.state.spectatorCount++;
                this.emitStateChange();
            }
        });
        this.bridge.on('client:disconnected', (data) => {
            if (data.role === 'spectator' || data.role === 'satellite') {
                this.state.spectatorCount = Math.max(0, this.state.spectatorCount - 1);
                this.emitStateChange();
            }
        });
        // Spectator events
        if (this.spectator) {
            this.spectator.on('neural:weights-updated', (data) => {
                this.state.neuralWeightsLoaded = true;
                this.state.lastWeightUpdate = new Date();
                this.state.humanPatternsLearned = data.sampleCount;
                this.emitStateChange();
                this.addAlert('info', `Neural weights updated from ${data.sampleCount} human sessions`, 'OracleHumanizer');
            });
        }
    }
    /**
     * Start update loops
     */
    // Complexity: O(1)
    startUpdateLoops() {
        // State update
        this.stateUpdateTimer = setInterval(() => {
            this.updateState();
        }, this.config.stateUpdateInterval);
        // Metrics update (less frequent)
        this.metricsUpdateTimer = setInterval(() => {
            this.updateMetrics();
        }, this.config.metricsUpdateInterval);
        // Alert cleanup
        this.alertCleanupTimer = setInterval(() => {
            this.cleanupAlerts();
        }, 60000);
    }
    // ═══════════════════════════════════════════════════════════════════════
    // MODE CONTROL
    // ═══════════════════════════════════════════════════════════════════════
    /**
     * Request mode transition
     */
    // Complexity: O(1) — hash/map lookup
    async requestModeTransition(toMode, requestedBy, reason) {
        const request = {
            requestId: this.generateId('trans'),
            fromMode: this.state.controlMode,
            toMode,
            requestedBy,
            requestedAt: new Date(),
            reason,
            requiresApproval: toMode === 'MANUAL_UX_OVERRIDE' && this.config.requireApprovalForManual
        };
        // Check cooldown
        const timeSinceLastChange = Date.now() - this.lastModeChange.getTime();
        if (timeSinceLastChange < this.config.modeTransitionCooldown) {
            this.addAlert('warning', `Mode transition blocked - cooldown ${(this.config.modeTransitionCooldown - timeSinceLastChange) / 1000}s remaining`, 'ControlDashboard');
            return request;
        }
        // If approval required, queue request
        if (request.requiresApproval) {
            this.pendingTransitions.set(request.requestId, request);
            this.addAlert('warning', `Mode transition to ${toMode} requires approval`, 'ControlDashboard');
            this.emit('mode:approval-required', request);
            return request;
        }
        // Execute transition
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.executeTransition(request);
        return request;
    }
    /**
     * Approve pending mode transition
     */
    // Complexity: O(1) — hash/map lookup
    async approveModeTransition(requestId, approvedBy) {
        const request = this.pendingTransitions.get(requestId);
        if (!request) {
            return false;
        }
        request.approvedBy = approvedBy;
        request.approvedAt = new Date();
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.executeTransition(request);
        this.pendingTransitions.delete(requestId);
        return true;
    }
    /**
     * Execute mode transition
     */
    // Complexity: O(1) — hash/map lookup
    async executeTransition(request) {
        const { fromMode, toMode, requestedBy } = request;
        // Log transition
        this.log('info', `[CONTROL] Mode transition: ${fromMode} → ${toMode} by ${requestedBy}`);
        // Update bridge
        this.bridge.setControlMode(toMode);
        // Update state
        this.state.controlMode = toMode;
        this.state.modeLockedBy = requestedBy;
        this.state.modeLockedAt = new Date();
        this.lastModeChange = new Date();
        // Emit events
        this.emit('mode:changed', {
            fromMode,
            toMode,
            requestedBy,
            timestamp: new Date()
        });
        this.emitStateChange();
        // Add alert
        this.addAlert('info', `Control mode changed to ${toMode}`, 'ControlDashboard');
        // Mode-specific actions
        if (toMode === 'FULL_AUTONOMY') {
            // Release all hijacks when going to full autonomy
            this.emit('mode:autonomy-activated');
        }
        else if (toMode === 'MANUAL_UX_OVERRIDE') {
            // Pause autonomous actions when going manual
            this.emit('mode:manual-activated');
        }
    }
    /**
     * Handle mode change from bridge
     */
    // Complexity: O(1)
    handleModeChange(newMode) {
        this.state.controlMode = newMode;
        this.lastModeChange = new Date();
        this.emitStateChange();
    }
    /**
     * Toggle between AUTONOMY and MANUAL
     */
    // Complexity: O(N) — potential recursive descent
    async toggleMode(requestedBy) {
        const newMode = this.state.controlMode === 'FULL_AUTONOMY'
            ? 'MANUAL_UX_OVERRIDE'
            : 'FULL_AUTONOMY';
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.requestModeTransition(newMode, requestedBy, 'Toggle');
        return newMode;
    }
    /**
     * Set to FULL AUTONOMY
     */
    // Complexity: O(1)
    async setAutonomyMode(requestedBy) {
        if (this.state.controlMode !== 'FULL_AUTONOMY') {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.requestModeTransition('FULL_AUTONOMY', requestedBy);
        }
    }
    /**
     * Set to MANUAL UX OVERRIDE
     */
    // Complexity: O(1)
    async setManualMode(requestedBy) {
        if (this.state.controlMode !== 'MANUAL_UX_OVERRIDE') {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.requestModeTransition('MANUAL_UX_OVERRIDE', requestedBy);
        }
    }
    /**
     * Set to HYBRID mode
     */
    // Complexity: O(1)
    async setHybridMode(requestedBy) {
        if (this.state.controlMode !== 'HYBRID') {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.requestModeTransition('HYBRID', requestedBy);
        }
    }
    // ═══════════════════════════════════════════════════════════════════════
    // WORKER MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════
    /**
     * Register worker for dashboard
     */
    // Complexity: O(1) — hash/map lookup
    registerWorker(workerId, initialStatus = {}) {
        const worker = {
            workerId,
            status: 'idle',
            cpuUsage: 0,
            memoryMB: 0,
            actionsPerMinute: 0,
            threatLevel: 'safe',
            detectionRisk: 0,
            isHijacked: false,
            ...initialStatus
        };
        this.workers.set(workerId, worker);
        this.updateWorkerCounts();
        this.emit('worker:registered', { workerId });
    }
    /**
     * Update worker status
     */
    // Complexity: O(N)
    updateWorkerStatus(workerId, status) {
        const worker = this.workers.get(workerId);
        if (worker) {
            Object.assign(worker, status);
            this.updateWorkerCounts();
            // Check for threat escalation
            if (worker.detectionRisk > this.config.threatEscalationThreshold) {
                this.addAlert('warning', `Worker ${workerId} detection risk elevated: ${(worker.detectionRisk * 100).toFixed(1)}%`, 'ThreatMonitor');
            }
        }
    }
    /**
     * Unregister worker
     */
    // Complexity: O(1)
    unregisterWorker(workerId) {
        this.workers.delete(workerId);
        this.updateWorkerCounts();
        this.emit('worker:unregistered', { workerId });
    }
    /**
     * Handle hijack started
     */
    // Complexity: O(1) — hash/map lookup
    handleHijackStarted(workerId, operatorId) {
        const worker = this.workers.get(workerId);
        if (worker) {
            worker.isHijacked = true;
            worker.hijackedBy = operatorId;
            worker.status = 'hijacked';
        }
        this.state.activeHijacks++;
        this.emitStateChange();
        this.addAlert('info', `Worker ${workerId} hijacked by ${operatorId}`, 'SpectatorMode');
    }
    /**
     * Handle hijack ended
     */
    // Complexity: O(1) — hash/map lookup
    handleHijackEnded(workerId) {
        const worker = this.workers.get(workerId);
        if (worker) {
            worker.isHijacked = false;
            worker.hijackedBy = undefined;
            worker.status = 'active';
        }
        this.state.activeHijacks = Math.max(0, this.state.activeHijacks - 1);
        this.emitStateChange();
        this.addAlert('info', `Worker ${workerId} released from hijack`, 'SpectatorMode');
    }
    /**
     * Update worker counts
     */
    // Complexity: O(N) — linear iteration
    updateWorkerCounts() {
        let active = 0, idle = 0, error = 0;
        for (const worker of this.workers.values()) {
            switch (worker.status) {
                case 'active':
                case 'hijacked':
                    active++;
                    break;
                case 'idle':
                    idle++;
                    break;
                case 'error':
                case 'offline':
                    error++;
                    break;
            }
        }
        this.state.totalWorkers = this.workers.size;
        this.state.activeWorkers = active;
        this.state.idleWorkers = idle;
        this.state.errorWorkers = error;
    }
    // ═══════════════════════════════════════════════════════════════════════
    // STATE UPDATES
    // ═══════════════════════════════════════════════════════════════════════
    /**
     * Update dashboard state
     */
    // Complexity: O(N) — linear iteration
    updateState() {
        // Update uptime
        const bridgeStatus = this.bridge.getStatus();
        this.state.uptime = bridgeStatus.uptime;
        // Update spectator count
        this.state.spectatorCount = bridgeStatus.clientsByRole.spectator +
            bridgeStatus.clientsByRole.satellite;
        // Update active hijacks
        this.state.activeHijacks = bridgeStatus.activeHijacks;
        // Update alert count
        this.state.activeAlerts = this.alerts.filter(a => !a.acknowledged).length;
        // Calculate system health
        this.state.systemHealth = this.calculateSystemHealth();
        // Calculate threat level
        this.state.threatLevel = this.calculateThreatLevel();
        // Emit state update
        this.emitStateChange();
    }
    /**
     * Update metrics (less frequent)
     */
    // Complexity: O(1) — amortized
    updateMetrics() {
        // CPU usage
        const cpuUsage = process.cpuUsage();
        this.state.cpuUsage = (cpuUsage.user + cpuUsage.system) / 1000000 * 100;
        // Memory usage
        const memUsage = process.memoryUsage();
        this.state.memoryUsage = (memUsage.heapUsed / memUsage.heapTotal) * 100;
        // Check thresholds
        if (this.state.cpuUsage > this.config.cpuWarningThreshold) {
            this.addAlert('warning', `CPU usage high: ${this.state.cpuUsage.toFixed(1)}%`, 'SystemMonitor');
        }
        if (this.state.memoryUsage > this.config.memoryWarningThreshold) {
            this.addAlert('warning', `Memory usage high: ${this.state.memoryUsage.toFixed(1)}%`, 'SystemMonitor');
        }
    }
    /**
     * Calculate system health
     */
    // Complexity: O(1)
    calculateSystemHealth() {
        const errorRatio = this.state.totalWorkers > 0
            ? this.state.errorWorkers / this.state.totalWorkers
            : 0;
        if (errorRatio > 0.5 || this.state.cpuUsage > 95 || this.state.memoryUsage > 95) {
            return 'critical';
        }
        if (errorRatio > 0.2 || this.state.cpuUsage > this.config.cpuWarningThreshold ||
            this.state.memoryUsage > this.config.memoryWarningThreshold) {
            return 'degraded';
        }
        return 'healthy';
    }
    /**
     * Calculate overall threat level
     */
    // Complexity: O(N) — linear iteration
    calculateThreatLevel() {
        let maxRisk = 0;
        for (const worker of this.workers.values()) {
            if (worker.detectionRisk > maxRisk) {
                maxRisk = worker.detectionRisk;
            }
        }
        if (maxRisk > 0.9)
            return 'critical';
        if (maxRisk > 0.7)
            return 'danger';
        if (maxRisk > 0.5)
            return 'warning';
        if (maxRisk > 0.3)
            return 'caution';
        return 'safe';
    }
    // ═══════════════════════════════════════════════════════════════════════
    // ALERTS
    // ═══════════════════════════════════════════════════════════════════════
    /**
     * Add alert
     */
    // Complexity: O(N) — linear iteration
    addAlert(level, message, source) {
        const alert = {
            alertId: this.generateId('alert'),
            level,
            message,
            source,
            timestamp: new Date(),
            acknowledged: false
        };
        this.alerts.unshift(alert);
        // Trim to max
        if (this.alerts.length > this.config.maxAlerts) {
            this.alerts = this.alerts.slice(0, this.config.maxAlerts);
        }
        this.state.activeAlerts = this.alerts.filter(a => !a.acknowledged).length;
        this.emit('alert:new', alert);
        return alert;
    }
    /**
     * Acknowledge alert
     */
    // Complexity: O(N) — linear iteration
    acknowledgeAlert(alertId) {
        const alert = this.alerts.find(a => a.alertId === alertId);
        if (alert) {
            alert.acknowledged = true;
            this.state.activeAlerts = this.alerts.filter(a => !a.acknowledged).length;
            this.emit('alert:acknowledged', { alertId });
        }
    }
    /**
     * Acknowledge all alerts
     */
    // Complexity: O(N) — linear iteration
    acknowledgeAllAlerts() {
        for (const alert of this.alerts) {
            alert.acknowledged = true;
        }
        this.state.activeAlerts = 0;
        this.emit('alert:all-acknowledged');
    }
    /**
     * Cleanup old alerts
     */
    // Complexity: O(N) — linear iteration
    cleanupAlerts() {
        const cutoff = Date.now() - this.config.alertRetentionMinutes * 60 * 1000;
        this.alerts = this.alerts.filter(a => a.timestamp.getTime() > cutoff || !a.acknowledged);
    }
    // ═══════════════════════════════════════════════════════════════════════
    // STATE BROADCASTING
    // ═══════════════════════════════════════════════════════════════════════
    /**
     * Register state change handler (for WebSocket broadcast)
     */
    // Complexity: O(1)
    onStateChange(handler) {
        this.stateChangeHandlers.push(handler);
    }
    /**
     * Emit state change to all handlers
     */
    // Complexity: O(N) — linear iteration
    emitStateChange() {
        const state = this.getState();
        for (const handler of this.stateChangeHandlers) {
            try {
                // Complexity: O(1)
                handler(state);
            }
            catch (error) {
                this.log('error', `State change handler error: ${error.message}`);
            }
        }
        this.emit('state:changed', state);
    }
    // ═══════════════════════════════════════════════════════════════════════
    // API METHODS
    // ═══════════════════════════════════════════════════════════════════════
    /**
     * Get current state
     */
    // Complexity: O(1)
    getState() {
        return { ...this.state };
    }
    /**
     * Get current control mode
     */
    // Complexity: O(1)
    getControlMode() {
        return this.state.controlMode;
    }
    /**
     * Check if in autonomy mode
     */
    // Complexity: O(1)
    isAutonomyMode() {
        return this.state.controlMode === 'FULL_AUTONOMY';
    }
    /**
     * Check if in manual mode
     */
    // Complexity: O(1)
    isManualMode() {
        return this.state.controlMode === 'MANUAL_UX_OVERRIDE';
    }
    /**
     * Check if in hybrid mode
     */
    // Complexity: O(1)
    isHybridMode() {
        return this.state.controlMode === 'HYBRID';
    }
    /**
     * Get all workers
     */
    // Complexity: O(1)
    getWorkers() {
        return Array.from(this.workers.values());
    }
    /**
     * Get worker by ID
     */
    // Complexity: O(1) — hash/map lookup
    getWorker(workerId) {
        return this.workers.get(workerId);
    }
    /**
     * Get alerts
     */
    // Complexity: O(N) — linear iteration
    getAlerts(unacknowledgedOnly = false) {
        if (unacknowledgedOnly) {
            return this.alerts.filter(a => !a.acknowledged);
        }
        return [...this.alerts];
    }
    /**
     * Get pending mode transitions
     */
    // Complexity: O(1)
    getPendingTransitions() {
        return Array.from(this.pendingTransitions.values());
    }
    // ═══════════════════════════════════════════════════════════════════════
    // UTILITIES
    // ═══════════════════════════════════════════════════════════════════════
    /**
     * Generate unique ID
     */
    // Complexity: O(1)
    generateId(prefix) {
        return `${prefix}_${crypto.randomBytes(6).toString('hex')}`;
    }
    /**
     * Log message
     */
    // Complexity: O(1)
    log(level, message) {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`);
        this.emit('log', { level, message, timestamp });
    }
    // ═══════════════════════════════════════════════════════════════════════
    // SHUTDOWN
    // ═══════════════════════════════════════════════════════════════════════
    /**
     * Shutdown dashboard
     */
    // Complexity: O(1) — hash/map lookup
    async shutdown() {
        // Stop timers
        if (this.stateUpdateTimer)
            clearInterval(this.stateUpdateTimer);
        if (this.metricsUpdateTimer)
            clearInterval(this.metricsUpdateTimer);
        if (this.alertCleanupTimer)
            clearInterval(this.alertCleanupTimer);
        // Clear state
        this.workers.clear();
        this.alerts = [];
        this.pendingTransitions.clear();
        this.stateChangeHandlers = [];
        this.emit('shutdown', { timestamp: new Date() });
        this.log('info', '[DASHBOARD] Control dashboard shutdown complete');
    }
}
exports.ControlDashboard = ControlDashboard;
// ═══════════════════════════════════════════════════════════════════════════
// FACTORY EXPORT
// ═══════════════════════════════════════════════════════════════════════════
/**
 * Create a new ControlDashboard instance
 */
function createControlDashboard(bridge, spectator, config) {
    return new ControlDashboard(bridge, spectator, config);
}
exports.default = ControlDashboard;
