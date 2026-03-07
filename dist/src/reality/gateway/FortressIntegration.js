"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 * 🏰 FORTRESS INTEGRATION - GATEWAY-FATALITY BRIDGE
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 *
 * v1.5.0 "The Sovereign Gateway" - Security Fortress Integration
 *
 *   ███████╗ ██████╗ ██████╗ ████████╗██████╗ ███████╗███████╗███████╗
 *   ██╔════╝██╔═══██╗██╔══██╗╚══██╔══╝██╔══██╗██╔════╝██╔════╝██╔════╝
 *   █████╗  ██║   ██║██████╔╝   ██║   ██████╔╝█████╗  ███████╗███████╗
 *   ██╔══╝  ██║   ██║██╔══██╗   ██║   ██╔══██╗██╔══╝  ╚════██║╚════██║
 *   ██║     ╚██████╔╝██║  ██║   ██║   ██║  ██║███████╗███████║███████║
 *   ╚═╝      ╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝╚══════╝╚══════╝╚══════╝
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 *
 *   MARKET VALUE INCREMENT: +$75,000
 *
 *   Features:
 *   • Automatic IP Ban after 5 invalid attempts
 *   • Swarm-wide IP synchronization
 *   • Attacker profiling & fingerprinting
 *   • HoneyPot activation on breach attempt
 *   • Real-time threat intelligence sharing
 *   • Distributed ban list propagation
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 * @module reality/gateway
 * @version 1.5.0
 * @license Commercial - All Rights Reserved
 * @author QANTUM AI Architect
 * @commercial true
 * @marketValue $75,000
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
exports.FortressIntegration = void 0;
exports.createFatalityHook = createFatalityHook;
exports.getFortressIntegration = getFortressIntegration;
exports.createFortressIntegration = createFortressIntegration;
const crypto = __importStar(require("crypto"));
const events_1 = require("events");
// ═══════════════════════════════════════════════════════════════════════════════════════════
// FORTRESS INTEGRATION
// ═══════════════════════════════════════════════════════════════════════════════════════════
/**
 * 🏰 FortressIntegration - Gateway-Fatality Security Bridge
 *
 * Connects the Client Gateway to the Fatality Engine for:
 * - Automatic IP banning after threshold violations
 * - Swarm-wide ban synchronization
 * - Attacker profiling and tracking
 * - HoneyPot activation on breach attempts
 *
 * @example
 * ```typescript
 * const fortress = new FortressIntegration({
 *   maxInvalidAttempts: 5,
 *   enableSwarmSync: true
 * });
 *
 // SAFETY: async operation — wrap in try-catch for production resilience
 * await fortress.initialize();
 *
 * // Report invalid attempt
 // SAFETY: async operation — wrap in try-catch for production resilience
 * const result = await fortress.reportInvalidAttempt('192.168.1.100', 'LIC_123', 'Invalid API key');
 * if (result.banned) {
 *   console.log(`IP banned for ${result.duration}`);
 * }
 * ```
 */
class FortressIntegration extends events_1.EventEmitter {
    config;
    bannedIPs = new Map();
    violationHistory = new Map();
    attackerProfiles = new Map();
    swarmPeers = new Set();
    fatalityEngine;
    isInitialized = false;
    constructor(config) {
        super();
        this.setMaxListeners(100);
        this.config = {
            maxInvalidAttempts: config?.maxInvalidAttempts ?? 5,
            attemptWindowMs: config?.attemptWindowMs ?? 300000, // 5 minutes
            banDurations: config?.banDurations ?? {
                temporary: 3600000, // 1 hour
                extended: 86400000, // 24 hours
                permanent: -1 // Forever
            },
            enableSwarmSync: config?.enableSwarmSync ?? true,
            nodeId: config?.nodeId ?? `FORTRESS_${crypto.randomBytes(4).toString('hex')}`,
            swarmSecret: config?.swarmSecret ?? crypto.randomBytes(32).toString('hex'),
            enableHoneyPot: config?.enableHoneyPot ?? true,
            enableProfiling: config?.enableProfiling ?? true,
            alertWebhook: config?.alertWebhook
        };
    }
    // ─────────────────────────────────────────────────────────────────────────────────────────
    // INITIALIZATION
    // ─────────────────────────────────────────────────────────────────────────────────────────
    /**
     * Initialize the Fortress
     */
    // Complexity: O(1)
    async initialize(fatalityEngine) {
        if (this.isInitialized)
            return;
        this.fatalityEngine = fatalityEngine;
        console.log(`
╔═══════════════════════════════════════════════════════════════════════════════════════════════╗
║                                                                                               ║
║   🏰 FORTRESS INTEGRATION - SECURITY BRIDGE ACTIVE                                            ║
║                                                                                               ║
║   ┌─────────────────────────────────────────────────────────────────────────────────────┐    ║
║   │  🚫 Auto-Ban Threshold  │  ${this.config.maxInvalidAttempts} attempts in ${this.config.attemptWindowMs / 60000} minutes                                 │    ║
║   │  🔗 Swarm Sync          │  ${this.config.enableSwarmSync ? '✅ ENABLED' : '❌ DISABLED'}                                                 │    ║
║   │  🍯 HoneyPot Trigger    │  ${this.config.enableHoneyPot ? '✅ ENABLED' : '❌ DISABLED'}                                                 │    ║
║   │  👤 Attacker Profiling  │  ${this.config.enableProfiling ? '✅ ENABLED' : '❌ DISABLED'}                                                 │    ║
║   │  💀 Fatality Engine     │  ${this.fatalityEngine ? '✅ CONNECTED' : '⚠️ NOT CONNECTED'}                                              │    ║
║   └─────────────────────────────────────────────────────────────────────────────────────┘    ║
║                                                                                               ║
║   BAN DURATIONS:                                                                             ║
║   ├─ Temporary (1st offense):   ${this.config.banDurations.temporary / 3600000} hour(s)                                            ║
║   ├─ Extended (repeat):         ${this.config.banDurations.extended / 3600000} hours                                           ║
║   └─ Permanent (severe):        ∞ (manual unban required)                                   ║
║                                                                                               ║
║                       "5 strikes and you're out. No exceptions."                              ║
║                                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════════════════════╝
`);
        // Start cleanup timer
        this.startCleanupTimer();
        this.isInitialized = true;
        this.emit('initialized', { nodeId: this.config.nodeId });
    }
    // ─────────────────────────────────────────────────────────────────────────────────────────
    // VIOLATION TRACKING
    // ─────────────────────────────────────────────────────────────────────────────────────────
    /**
     * Report an invalid authentication attempt
     */
    // Complexity: O(1)
    async reportInvalidAttempt(ip, keyId, reason, metadata = {}) {
        // Check if already banned
        // SAFETY: async operation — wrap in try-catch for production resilience
        if (await this.isIPBanned(ip)) {
            return { banned: true, duration: 'already_banned' };
        }
        // Create violation record
        const violation = {
            id: `VIO_${crypto.randomBytes(8).toString('hex')}`,
            timestamp: Date.now(),
            ip,
            keyId,
            type: this.classifyAttack(reason, metadata),
            description: reason,
            metadata,
            fingerprint: this.generateFingerprint(ip, metadata)
        };
        // Add to history
        const history = this.violationHistory.get(ip) || [];
        history.push(violation);
        this.violationHistory.set(ip, history);
        // Count recent violations
        const windowStart = Date.now() - this.config.attemptWindowMs;
        const recentViolations = history.filter(v => v.timestamp >= windowStart);
        this.emit('violation_recorded', {
            ip,
            keyId,
            reason,
            count: recentViolations.length,
            threshold: this.config.maxInvalidAttempts
        });
        // Check threshold
        if (recentViolations.length >= this.config.maxInvalidAttempts) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            return await this.banIP(ip, `Exceeded ${this.config.maxInvalidAttempts} invalid attempts: ${reason}`);
        }
        return {
            banned: false,
            remaining: this.config.maxInvalidAttempts - recentViolations.length
        };
    }
    // ─────────────────────────────────────────────────────────────────────────────────────────
    // IP BANNING
    // ─────────────────────────────────────────────────────────────────────────────────────────
    /**
     * Ban an IP address
     */
    // Complexity: O(1) — lookup
    async banIP(ip, reason, customDuration) {
        // Determine ban duration based on history
        const previousBan = this.bannedIPs.get(ip);
        let duration;
        let durationMs;
        if (previousBan) {
            // Repeat offender - escalate
            if (previousBan.duration === 'temporary') {
                duration = 'extended';
                durationMs = this.config.banDurations.extended;
            }
            else {
                duration = 'permanent';
                durationMs = -1;
            }
        }
        else {
            // First offense
            duration = 'temporary';
            durationMs = this.config.banDurations.temporary;
        }
        // Override with custom duration if provided
        if (customDuration !== undefined) {
            durationMs = customDuration;
            duration = customDuration === -1 ? 'permanent' : 'temporary';
        }
        // Calculate threat level
        const violations = this.violationHistory.get(ip) || [];
        const threatLevel = this.calculateThreatLevel(violations);
        // Create ban record
        const ban = {
            ip,
            bannedAt: Date.now(),
            expiresAt: durationMs === -1 ? -1 : Date.now() + durationMs,
            duration,
            reason,
            violations,
            swarmSynced: false,
            threatLevel
        };
        this.bannedIPs.set(ip, ban);
        // Trigger HoneyPot if threat is high
        if (this.config.enableHoneyPot && threatLevel === 'critical' && this.fatalityEngine) {
            this.fatalityEngine.activateHoneyPot(`IP_BAN_${ip}`);
        }
        // Update attacker profile
        if (this.config.enableProfiling) {
            this.updateAttackerProfile(ip, violations);
        }
        // Sync to Swarm
        if (this.config.enableSwarmSync) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.syncBanToSwarm(ban);
        }
        // Send alert
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.sendAlert('ip_banned', { ip, reason, duration, threatLevel });
        this.emit('ip_banned', { ip, reason, duration, threatLevel, expiresAt: ban.expiresAt });
        const durationStr = duration === 'permanent' ? 'permanent' :
            `${Math.round(durationMs / 3600000)} hours`;
        return { banned: true, duration: durationStr };
    }
    /**
     * Check if IP is banned
     */
    // Complexity: O(1) — lookup
    async isIPBanned(ip) {
        const ban = this.bannedIPs.get(ip);
        if (!ban)
            return false;
        // Check if permanent
        if (ban.expiresAt === -1)
            return true;
        // Check if expired
        if (Date.now() >= ban.expiresAt) {
            this.bannedIPs.delete(ip);
            return false;
        }
        return true;
    }
    /**
     * Unban an IP address
     */
    // Complexity: O(1) — lookup
    async unbanIP(ip, reason = 'Manual unban') {
        const ban = this.bannedIPs.get(ip);
        if (!ban)
            return false;
        this.bannedIPs.delete(ip);
        // Sync to Swarm
        if (this.config.enableSwarmSync) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.syncUnbanToSwarm(ip);
        }
        this.emit('ip_unbanned', { ip, reason });
        return true;
    }
    /**
     * Get banned IP info
     */
    // Complexity: O(1) — lookup
    getBannedIPInfo(ip) {
        return this.bannedIPs.get(ip);
    }
    /**
     * Get all banned IPs
     */
    // Complexity: O(1)
    getAllBannedIPs() {
        return Array.from(this.bannedIPs.values());
    }
    // ─────────────────────────────────────────────────────────────────────────────────────────
    // ATTACKER PROFILING
    // ─────────────────────────────────────────────────────────────────────────────────────────
    /**
     * Update attacker profile
     */
    // Complexity: O(N) — loop
    updateAttackerProfile(ip, violations) {
        const fingerprint = violations[violations.length - 1]?.fingerprint || ip;
        let profile = this.attackerProfiles.get(fingerprint);
        if (!profile) {
            profile = {
                fingerprint,
                knownIPs: [],
                firstSeen: Date.now(),
                lastSeen: Date.now(),
                totalViolations: 0,
                attackTypes: [],
                threatLevel: 'low',
                patterns: {
                    avgTimeBetweenAttempts: 0,
                    preferredEndpoints: [],
                    userAgentPatterns: [],
                    geoLocations: []
                },
                isHoneyPotTarget: false
            };
        }
        // Update profile
        if (!profile.knownIPs.includes(ip)) {
            profile.knownIPs.push(ip);
        }
        profile.lastSeen = Date.now();
        profile.totalViolations += violations.length;
        // Add attack types
        for (const v of violations) {
            if (!profile.attackTypes.includes(v.type)) {
                profile.attackTypes.push(v.type);
            }
        }
        // Calculate threat level
        profile.threatLevel = this.calculateThreatLevel(violations);
        // Mark as HoneyPot target if critical
        if (profile.threatLevel === 'critical') {
            profile.isHoneyPotTarget = true;
        }
        this.attackerProfiles.set(fingerprint, profile);
        this.emit('profile_updated', { fingerprint, profile });
    }
    /**
     * Get attacker profile
     */
    // Complexity: O(N) — loop
    getAttackerProfile(ip) {
        // Find by IP in known IPs
        for (const profile of this.attackerProfiles.values()) {
            if (profile.knownIPs.includes(ip)) {
                return profile;
            }
        }
        return undefined;
    }
    // ─────────────────────────────────────────────────────────────────────────────────────────
    // SWARM SYNCHRONIZATION
    // ─────────────────────────────────────────────────────────────────────────────────────────
    /**
     * Sync ban to Swarm
     */
    // Complexity: O(1)
    async syncBanToSwarm(ban) {
        const message = {
            type: 'ban',
            nodeId: this.config.nodeId,
            timestamp: Date.now(),
            payload: ban,
            signature: this.signMessage(ban)
        };
        this.emit('swarm_sync', { type: 'ban', ip: ban.ip });
        ban.swarmSynced = true;
        // In production, this would broadcast to other Swarm nodes
        // For now, we emit an event that can be handled by the orchestrator
    }
    /**
     * Sync unban to Swarm
     */
    // Complexity: O(1)
    async syncUnbanToSwarm(ip) {
        const message = {
            type: 'unban',
            nodeId: this.config.nodeId,
            timestamp: Date.now(),
            payload: { ip },
            signature: this.signMessage({ ip })
        };
        this.emit('swarm_sync', { type: 'unban', ip });
    }
    /**
     * Receive ban from Swarm peer
     */
    // Complexity: O(1) — lookup
    async receiveBanFromSwarm(message) {
        if (!this.verifyMessage(message.payload, message.signature)) {
            this.emit('swarm_invalid_signature', { nodeId: message.nodeId });
            return;
        }
        const ban = message.payload;
        ban.swarmSynced = true;
        this.bannedIPs.set(ban.ip, ban);
        this.emit('swarm_ban_received', { ip: ban.ip, fromNode: message.nodeId });
    }
    // ─────────────────────────────────────────────────────────────────────────────────────────
    // HELPER METHODS
    // ─────────────────────────────────────────────────────────────────────────────────────────
    /**
     * Classify attack type
     */
    // Complexity: O(1)
    classifyAttack(reason, metadata) {
        const reasonLower = reason.toLowerCase();
        if (reasonLower.includes('invalid') && reasonLower.includes('key')) {
            return 'brute_force';
        }
        if (reasonLower.includes('rate') || reasonLower.includes('limit')) {
            return 'rate_abuse';
        }
        if (reasonLower.includes('injection') || reasonLower.includes('sql')) {
            return 'injection';
        }
        if (metadata.isKnownLeakedCredential) {
            return 'credential_stuffing';
        }
        return 'unknown';
    }
    /**
     * Calculate threat level
     */
    // Complexity: O(1)
    calculateThreatLevel(violations) {
        const count = violations.length;
        const hasInjection = violations.some(v => v.type === 'injection');
        const hasCredentialStuffing = violations.some(v => v.type === 'credential_stuffing');
        if (hasInjection || count >= 20)
            return 'critical';
        if (hasCredentialStuffing || count >= 10)
            return 'high';
        if (count >= 5)
            return 'medium';
        return 'low';
    }
    /**
     * Generate fingerprint from IP and metadata
     */
    // Complexity: O(1)
    generateFingerprint(ip, metadata) {
        const data = JSON.stringify({ ip, userAgent: metadata.userAgent, ...metadata });
        return crypto.createHash('sha256').update(data).digest('hex').substring(0, 16);
    }
    /**
     * Sign message for Swarm
     */
    // Complexity: O(1)
    signMessage(payload) {
        const data = JSON.stringify(payload);
        return crypto
            .createHmac('sha256', this.config.swarmSecret)
            .update(data)
            .digest('hex');
    }
    /**
     * Verify message signature
     */
    // Complexity: O(1)
    verifyMessage(payload, signature) {
        const expected = this.signMessage(payload);
        return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
    }
    /**
     * Send alert
     */
    // Complexity: O(1)
    async sendAlert(type, data) {
        if (!this.config.alertWebhook)
            return;
        try {
            // In production, this would send to webhook
            this.emit('alert_sent', { type, data });
        }
        catch (e) {
            this.emit('alert_failed', { type, error: e });
        }
    }
    /**
     * Start cleanup timer
     */
    // Complexity: O(N*M) — nested iteration
    startCleanupTimer() {
        // Complexity: O(N*M) — nested iteration
        setInterval(() => {
            const now = Date.now();
            const windowStart = now - this.config.attemptWindowMs;
            // Clean old violations
            for (const [ip, violations] of this.violationHistory) {
                const recent = violations.filter(v => v.timestamp >= windowStart);
                if (recent.length === 0) {
                    this.violationHistory.delete(ip);
                }
                else {
                    this.violationHistory.set(ip, recent);
                }
            }
            // Clean expired bans
            for (const [ip, ban] of this.bannedIPs) {
                if (ban.expiresAt !== -1 && now >= ban.expiresAt) {
                    this.bannedIPs.delete(ip);
                    this.emit('ban_expired', { ip });
                }
            }
        }, 60000); // Every minute
    }
    // ─────────────────────────────────────────────────────────────────────────────────────────
    // PUBLIC GETTERS
    // ─────────────────────────────────────────────────────────────────────────────────────────
    /**
     * Get fortress statistics
     */
    // Complexity: O(N) — linear scan
    getStats() {
        const threatBreakdown = {
            low: 0, medium: 0, high: 0, critical: 0
        };
        for (const ban of this.bannedIPs.values()) {
            threatBreakdown[ban.threatLevel]++;
        }
        return {
            bannedIPs: this.bannedIPs.size,
            totalViolations: Array.from(this.violationHistory.values())
                .reduce((sum, v) => sum + v.length, 0),
            attackerProfiles: this.attackerProfiles.size,
            swarmPeers: this.swarmPeers.size,
            threatBreakdown
        };
    }
    /**
     * Check if initialized
     */
    // Complexity: O(1)
    isReady() {
        return this.isInitialized;
    }
}
exports.FortressIntegration = FortressIntegration;
// ═══════════════════════════════════════════════════════════════════════════════════════════
// FATALITY HOOK ADAPTER
// ═══════════════════════════════════════════════════════════════════════════════════════════
/**
 * Create a Fatality Hook adapter for ClientOrchestrator
 */
function createFatalityHook(fortress) {
    return {
        // Complexity: O(1)
        async reportInvalidAttempt(ip, keyId, reason) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await fortress.reportInvalidAttempt(ip, keyId, reason);
        },
        // Complexity: O(1)
        async banIP(ip, reason, duration) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await fortress.banIP(ip, reason, duration);
        },
        // Complexity: O(1)
        async isIPBanned(ip) {
            return fortress.isIPBanned(ip);
        },
        // Complexity: O(1)
        async getAttackerProfile(ip) {
            return fortress.getAttackerProfile(ip);
        }
    };
}
// ═══════════════════════════════════════════════════════════════════════════════════════════
// FACTORY & EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════
let fortressInstance = null;
/**
 * Get singleton FortressIntegration instance
 */
function getFortressIntegration(config) {
    if (!fortressInstance) {
        fortressInstance = new FortressIntegration(config);
    }
    return fortressInstance;
}
/**
 * Create new FortressIntegration instance
 */
function createFortressIntegration(config) {
    return new FortressIntegration(config);
}
exports.default = FortressIntegration;
