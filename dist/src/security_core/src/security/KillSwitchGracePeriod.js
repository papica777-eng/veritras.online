"use strict";
/**
 * @file KillSwitchGracePeriod.ts
 * @description Kill Switch с 24-часов Grace Period - Soft-lock → Hard-lock stages
 * @version 1.0.0-QAntum
 * @author QAntum AI
 * @phase Phase 5: Security & SaaS (Business & Protection)
 *
 * @example
 * ```typescript
 * import { KillSwitch } from '@/security/KillSwitchGracePeriod';
 *
 * const killSwitch = new KillSwitch({
 *   gracePeriodHours: 24,
 *   notificationEmail: 'admin@example.com',
 *   notificationSMS: '+359888123456'
 * });
 *
 * // Trigger soft-lock
 // SAFETY: async operation — wrap in try-catch for production resilience
 * await killSwitch.trigger('license_expired');
 * ```
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.KillSwitch = exports.TriggerReason = exports.KillSwitchState = void 0;
exports.killSwitchMiddleware = killSwitchMiddleware;
exports.getGlobalKillSwitch = getGlobalKillSwitch;
const events_1 = require("events");
// ═══════════════════════════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════════════════
var KillSwitchState;
(function (KillSwitchState) {
    /** Normal operation */
    KillSwitchState["ACTIVE"] = "ACTIVE";
    /** Warning state - 24h before soft-lock */
    KillSwitchState["WARNING"] = "WARNING";
    /** Soft-lock - limited functionality */
    KillSwitchState["SOFT_LOCKED"] = "SOFT_LOCKED";
    /** Hard-lock - no functionality */
    KillSwitchState["HARD_LOCKED"] = "HARD_LOCKED";
    /** Emergency - immediate shutdown */
    KillSwitchState["EMERGENCY"] = "EMERGENCY";
})(KillSwitchState || (exports.KillSwitchState = KillSwitchState = {}));
var TriggerReason;
(function (TriggerReason) {
    TriggerReason["LICENSE_EXPIRED"] = "license_expired";
    TriggerReason["LICENSE_REVOKED"] = "license_revoked";
    TriggerReason["PAYMENT_FAILED"] = "payment_failed";
    TriggerReason["SECURITY_BREACH"] = "security_breach";
    TriggerReason["TERMS_VIOLATION"] = "terms_violation";
    TriggerReason["MANUAL_ADMIN"] = "manual_admin";
    TriggerReason["HARDWARE_MISMATCH"] = "hardware_mismatch";
    TriggerReason["TAMPERING_DETECTED"] = "tampering_detected";
})(TriggerReason || (exports.TriggerReason = TriggerReason = {}));
// ═══════════════════════════════════════════════════════════════════════════════
// DEFAULT CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════
const DEFAULT_CONFIG = {
    gracePeriodHours: 24,
    warningHours: 48, // 48 hours before soft-lock
    allowMasterKeyOverride: true,
    softLockDisabledFeatures: ['swarm:create', 'oracle:predict', 'export:data', 'api:write'],
    enableAuditLog: true,
};
// ═══════════════════════════════════════════════════════════════════════════════
// KILL SWITCH CLASS
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * @class KillSwitch
 * @description Graceful shutdown system with 24-hour grace period
 * @extends EventEmitter
 *
 * Events:
 * - 'warning': Warning state activated
 * - 'soft-lock': Soft-lock activated
 * - 'hard-lock': Hard-lock activated
 * - 'emergency': Emergency shutdown
 * - 'override': Master key override used
 * - 'recovered': System recovered to active
 */
class KillSwitch extends events_1.EventEmitter {
    config;
    state = KillSwitchState.ACTIVE;
    reason;
    triggeredAt;
    auditLog = [];
    notificationsSent = 0;
    lastNotification;
    warningTimer;
    softLockTimer;
    hardLockTimer;
    notificationInterval;
    constructor(config = {}) {
        super();
        this.config = { ...DEFAULT_CONFIG, ...config };
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // PUBLIC METHODS
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Trigger the kill switch with grace period
     */
    // Complexity: O(1)
    async trigger(reason) {
        if (this.state !== KillSwitchState.ACTIVE) {
            console.warn(`⚠️  Kill switch already in state: ${this.state}`);
            return;
        }
        this.log('KILL_SWITCH_TRIGGERED', this.state, KillSwitchState.WARNING, reason);
        this.reason = reason;
        this.triggeredAt = new Date();
        this.state = KillSwitchState.WARNING;
        console.log(`\n🚨 KILL SWITCH TRIGGERED: ${reason}`);
        console.log(`   Grace Period: ${this.config.gracePeriodHours} hours`);
        console.log(`   Warning Period: ${this.config.warningHours} hours`);
        // Send initial notification
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.sendNotification({
            type: 'warning',
            state: this.state,
            reason,
            timeRemaining: `${this.config.warningHours + this.config.gracePeriodHours} hours`,
            action: 'Please resolve the issue to avoid service interruption',
        });
        // Schedule state transitions
        this.scheduleTransitions();
        // Start periodic notifications
        this.startNotificationInterval();
        this.emit('warning', { reason, state: this.state });
    }
    /**
     * Trigger emergency shutdown (immediate, no grace period)
     */
    // Complexity: O(1)
    async emergency(reason) {
        this.log('EMERGENCY_SHUTDOWN', this.state, KillSwitchState.EMERGENCY, reason);
        this.clearAllTimers();
        this.reason = reason;
        this.triggeredAt = new Date();
        this.state = KillSwitchState.EMERGENCY;
        console.log(`\n🔴 EMERGENCY SHUTDOWN: ${reason}`);
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.sendNotification({
            type: 'emergency',
            state: this.state,
            reason,
            action: 'IMMEDIATE SHUTDOWN - All services terminated',
        });
        this.emit('emergency', { reason });
        // Actually kill the process after notification
        // Complexity: O(1)
        setTimeout(() => {
            process.exit(1);
        }, 1000);
    }
    /**
     * Override kill switch with master key
     */
    // Complexity: O(1)
    async override(masterKey) {
        if (!this.config.allowMasterKeyOverride) {
            console.error('❌ Master key override not allowed');
            return false;
        }
        // Verify master key (in real implementation, check against secure hash)
        if (!this.verifyMasterKey(masterKey)) {
            console.error('❌ Invalid master key');
            this.log('INVALID_OVERRIDE_ATTEMPT', this.state, this.state);
            return false;
        }
        this.log('MASTER_KEY_OVERRIDE', this.state, KillSwitchState.ACTIVE);
        this.clearAllTimers();
        const previousState = this.state;
        this.state = KillSwitchState.ACTIVE;
        this.reason = undefined;
        this.triggeredAt = undefined;
        console.log(`\n✅ KILL SWITCH OVERRIDE: System restored to ACTIVE`);
        this.emit('override', { previousState });
        return true;
    }
    /**
     * Recover system to active state (e.g., payment received)
     */
    // Complexity: O(N)
    async recover() {
        if (this.state === KillSwitchState.ACTIVE) {
            return;
        }
        if (this.state === KillSwitchState.EMERGENCY) {
            console.error('❌ Cannot recover from EMERGENCY state');
            return;
        }
        this.log('SYSTEM_RECOVERED', this.state, KillSwitchState.ACTIVE);
        this.clearAllTimers();
        const previousState = this.state;
        this.state = KillSwitchState.ACTIVE;
        this.reason = undefined;
        this.triggeredAt = undefined;
        console.log(`\n✅ SYSTEM RECOVERED: State changed from ${previousState} to ACTIVE`);
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.sendNotification({
            type: 'warning',
            state: this.state,
            reason: TriggerReason.MANUAL_ADMIN,
            action: 'System has been restored. Thank you for resolving the issue.',
        });
        this.emit('recovered', { previousState });
    }
    /**
     * Get current status
     */
    // Complexity: O(1)
    getStatus() {
        const now = Date.now();
        let timeUntilSoftLock;
        let timeUntilHardLock;
        if (this.triggeredAt) {
            const warningMs = this.config.warningHours * 60 * 60 * 1000;
            const graceMs = this.config.gracePeriodHours * 60 * 60 * 1000;
            const elapsed = now - this.triggeredAt.getTime();
            if (this.state === KillSwitchState.WARNING) {
                timeUntilSoftLock = Math.max(0, warningMs - elapsed);
                timeUntilHardLock = Math.max(0, warningMs + graceMs - elapsed);
            }
            else if (this.state === KillSwitchState.SOFT_LOCKED) {
                timeUntilHardLock = Math.max(0, warningMs + graceMs - elapsed);
            }
        }
        return {
            state: this.state,
            reason: this.reason,
            triggeredAt: this.triggeredAt,
            softLockAt: this.triggeredAt
                ? new Date(this.triggeredAt.getTime() + this.config.warningHours * 60 * 60 * 1000)
                : undefined,
            hardLockAt: this.triggeredAt
                ? new Date(this.triggeredAt.getTime() +
                    (this.config.warningHours + this.config.gracePeriodHours) * 60 * 60 * 1000)
                : undefined,
            timeUntilSoftLock,
            timeUntilHardLock,
            notificationsSent: this.notificationsSent,
            lastNotification: this.lastNotification,
            canOverride: this.config.allowMasterKeyOverride && this.state !== KillSwitchState.EMERGENCY,
        };
    }
    /**
     * Check if a feature is allowed in current state
     */
    // Complexity: O(1)
    isFeatureAllowed(feature) {
        if (this.state === KillSwitchState.ACTIVE) {
            return true;
        }
        if (this.state === KillSwitchState.HARD_LOCKED || this.state === KillSwitchState.EMERGENCY) {
            return false;
        }
        if (this.state === KillSwitchState.SOFT_LOCKED) {
            return !this.config.softLockDisabledFeatures.includes(feature);
        }
        // WARNING state - all features allowed
        return true;
    }
    /**
     * Get audit log
     */
    // Complexity: O(1)
    getAuditLog() {
        return [...this.auditLog];
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // PRIVATE METHODS
    // ═══════════════════════════════════════════════════════════════════════════
    // Complexity: O(1)
    scheduleTransitions() {
        const warningMs = this.config.warningHours * 60 * 60 * 1000;
        const graceMs = this.config.gracePeriodHours * 60 * 60 * 1000;
        // Schedule soft-lock
        this.softLockTimer = setTimeout(() => {
            this.transitionToSoftLock();
        }, warningMs);
        // Schedule hard-lock
        this.hardLockTimer = setTimeout(() => {
            this.transitionToHardLock();
        }, warningMs + graceMs);
    }
    // Complexity: O(1)
    async transitionToSoftLock() {
        this.log('SOFT_LOCK_ACTIVATED', this.state, KillSwitchState.SOFT_LOCKED, this.reason);
        this.state = KillSwitchState.SOFT_LOCKED;
        console.log(`\n⚠️  SOFT-LOCK ACTIVATED`);
        console.log(`   Disabled features: ${this.config.softLockDisabledFeatures.join(', ')}`);
        console.log(`   Time until hard-lock: ${this.config.gracePeriodHours} hours`);
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.sendNotification({
            type: 'soft_lock',
            state: this.state,
            reason: this.reason,
            timeRemaining: `${this.config.gracePeriodHours} hours`,
            action: 'URGENT: Some features are now disabled. Resolve immediately to restore full access.',
        });
        this.emit('soft-lock', { reason: this.reason, state: this.state });
    }
    // Complexity: O(1)
    async transitionToHardLock() {
        this.log('HARD_LOCK_ACTIVATED', this.state, KillSwitchState.HARD_LOCKED, this.reason);
        this.state = KillSwitchState.HARD_LOCKED;
        console.log(`\n🔴 HARD-LOCK ACTIVATED`);
        console.log(`   All services disabled`);
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.sendNotification({
            type: 'hard_lock',
            state: this.state,
            reason: this.reason,
            action: 'CRITICAL: All services are now disabled. Contact support to restore access.',
        });
        this.clearAllTimers();
        this.emit('hard-lock', { reason: this.reason, state: this.state });
    }
    // Complexity: O(1)
    startNotificationInterval() {
        // Send notifications every 4 hours during grace period
        this.notificationInterval = setInterval(
        // Complexity: O(1)
        async () => {
            const status = this.getStatus();
            if (status.timeUntilHardLock && status.timeUntilHardLock > 0) {
                const hoursRemaining = Math.ceil(status.timeUntilHardLock / (60 * 60 * 1000));
                // SAFETY: async operation — wrap in try-catch for production resilience
                await this.sendNotification({
                    type: this.state === KillSwitchState.SOFT_LOCKED ? 'soft_lock' : 'warning',
                    state: this.state,
                    reason: this.reason,
                    timeRemaining: `${hoursRemaining} hours`,
                    action: `You have ${hoursRemaining} hours to resolve the issue before ${this.state === KillSwitchState.SOFT_LOCKED ? 'hard-lock' : 'soft-lock'}.`,
                });
            }
        }, 4 * 60 * 60 * 1000); // Every 4 hours
    }
    // Complexity: O(1)
    async sendNotification(payload) {
        this.notificationsSent++;
        this.lastNotification = new Date();
        console.log(`\n📧 Sending notification (${payload.type})`);
        // Email notification
        if (this.config.notificationEmail) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.sendEmail(payload);
        }
        // SMS notification
        if (this.config.notificationSMS) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.sendSMS(payload);
        }
        // Discord notification
        if (this.config.discordWebhook) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.sendDiscord(payload);
        }
        // Slack notification
        if (this.config.slackWebhook) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.sendSlack(payload);
        }
    }
    // Complexity: O(1)
    async sendEmail(payload) {
        // In real implementation, use SendGrid or similar
        console.log(`   📧 Email to ${this.config.notificationEmail}: ${payload.action}`);
        // Example SendGrid integration:
        // await sendgrid.send({
        //   to: this.config.notificationEmail,
        //   from: 'alerts@QAntum.dev',
        //   subject: `[${payload.type.toUpperCase()}] QAntum Prime - ${payload.reason}`,
        //   text: payload.action,
        // });
    }
    // Complexity: O(1)
    async sendSMS(payload) {
        // In real implementation, use Twilio or similar
        console.log(`   📱 SMS to ${this.config.notificationSMS}: ${payload.action.slice(0, 160)}`);
        // Example Twilio integration:
        // await twilio.messages.create({
        //   to: this.config.notificationSMS,
        //   from: '+1234567890',
        //   body: `QAntum: ${payload.action.slice(0, 140)}`,
        // });
    }
    // Complexity: O(1)
    async sendDiscord(payload) {
        if (!this.config.discordWebhook)
            return;
        const colors = {
            warning: 0xffcc00,
            soft_lock: 0xff9900,
            hard_lock: 0xff0000,
            emergency: 0x990000,
        };
        try {
            await fetch(this.config.discordWebhook, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    embeds: [
                        {
                            title: `🚨 QAntum Kill Switch - ${payload.type.toUpperCase()}`,
                            description: payload.action,
                            color: colors[payload.type] || 0xff0000,
                            fields: [
                                { name: 'State', value: payload.state, inline: true },
                                { name: 'Reason', value: payload.reason, inline: true },
                                { name: 'Time Remaining', value: payload.timeRemaining || 'N/A', inline: true },
                            ],
                            timestamp: new Date().toISOString(),
                        },
                    ],
                }),
            });
            console.log('   💬 Discord notification sent');
        }
        catch (error) {
            console.error(`   ❌ Discord notification failed: ${error}`);
        }
    }
    // Complexity: O(1)
    async sendSlack(payload) {
        if (!this.config.slackWebhook)
            return;
        const emojis = {
            warning: '⚠️',
            soft_lock: '🟠',
            hard_lock: '🔴',
            emergency: '🚨',
        };
        try {
            await fetch(this.config.slackWebhook, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    blocks: [
                        {
                            type: 'header',
                            text: {
                                type: 'plain_text',
                                text: `${emojis[payload.type]} QAntum Kill Switch - ${payload.type.toUpperCase()}`,
                            },
                        },
                        {
                            type: 'section',
                            text: {
                                type: 'mrkdwn',
                                text: `*${payload.action}*`,
                            },
                        },
                        {
                            type: 'section',
                            fields: [
                                { type: 'mrkdwn', text: `*State:* ${payload.state}` },
                                { type: 'mrkdwn', text: `*Reason:* ${payload.reason}` },
                                { type: 'mrkdwn', text: `*Time:* ${payload.timeRemaining || 'N/A'}` },
                            ],
                        },
                    ],
                }),
            });
            console.log('   💬 Slack notification sent');
        }
        catch (error) {
            console.error(`   ❌ Slack notification failed: ${error}`);
        }
    }
    // Complexity: O(1)
    verifyMasterKey(key) {
        // In real implementation, verify against secure hash
        // This is a placeholder
        const validKeys = [
            process.env.QAntum_MASTER_KEY,
            'EMERGENCY_OVERRIDE_2025', // Remove in production!
        ];
        return validKeys.includes(key);
    }
    // Complexity: O(1)
    log(event, previousState, newState, reason) {
        if (!this.config.enableAuditLog)
            return;
        const entry = {
            timestamp: new Date(),
            event,
            previousState,
            newState,
            reason,
            actor: 'system',
        };
        this.auditLog.push(entry);
        // Keep only last 1000 entries
        if (this.auditLog.length > 1000) {
            this.auditLog.shift();
        }
    }
    // Complexity: O(1)
    clearAllTimers() {
        if (this.warningTimer) {
            // Complexity: O(1)
            clearTimeout(this.warningTimer);
            this.warningTimer = undefined;
        }
        if (this.softLockTimer) {
            // Complexity: O(1)
            clearTimeout(this.softLockTimer);
            this.softLockTimer = undefined;
        }
        if (this.hardLockTimer) {
            // Complexity: O(1)
            clearTimeout(this.hardLockTimer);
            this.hardLockTimer = undefined;
        }
        if (this.notificationInterval) {
            // Complexity: O(1)
            clearInterval(this.notificationInterval);
            this.notificationInterval = undefined;
        }
    }
}
exports.KillSwitch = KillSwitch;
// ═══════════════════════════════════════════════════════════════════════════════
// MIDDLEWARE FOR EXPRESS/FASTIFY
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * Middleware to check kill switch state
 */
function killSwitchMiddleware(killSwitch) {
    return (req, res, next) => {
        const status = killSwitch.getStatus();
        // Add status to request for downstream use
        req.killSwitchStatus = status;
        // Hard-lock or emergency - block all requests
        if (status.state === KillSwitchState.HARD_LOCKED ||
            status.state === KillSwitchState.EMERGENCY) {
            return res.status(503).json({
                error: 'Service Unavailable',
                code: 'KILL_SWITCH_ACTIVE',
                state: status.state,
                reason: status.reason,
                message: 'This service is temporarily unavailable. Please contact support.',
            });
        }
        // Soft-lock - check feature
        if (status.state === KillSwitchState.SOFT_LOCKED) {
            const feature = `${req.method.toLowerCase()}:${req.path.split('/')[1] || 'root'}`;
            if (!killSwitch.isFeatureAllowed(feature)) {
                return res.status(403).json({
                    error: 'Feature Disabled',
                    code: 'FEATURE_SOFT_LOCKED',
                    feature,
                    timeRemaining: status.timeUntilHardLock,
                    message: 'This feature is temporarily disabled. Please resolve billing issues.',
                });
            }
        }
        // Warning - add header
        if (status.state === KillSwitchState.WARNING) {
            res.setHeader('X-KillSwitch-Warning', 'true');
            res.setHeader('X-KillSwitch-TimeRemaining', status.timeUntilSoftLock || 0);
        }
        // Complexity: O(1)
        next();
    };
}
// ═══════════════════════════════════════════════════════════════════════════════
// SINGLETON INSTANCE
// ═══════════════════════════════════════════════════════════════════════════════
let globalKillSwitch = null;
function getGlobalKillSwitch(config) {
    if (!globalKillSwitch) {
        globalKillSwitch = new KillSwitch(config);
    }
    return globalKillSwitch;
}
// ═══════════════════════════════════════════════════════════════════════════════
// CLI MODE
// ═══════════════════════════════════════════════════════════════════════════════
if (require.main === module) {
    console.log('🔴 Kill Switch Grace Period - Test Mode');
    console.log('═'.repeat(50));
    const killSwitch = new KillSwitch({
        gracePeriodHours: 0.01, // 36 seconds for testing
        warningHours: 0.005, // 18 seconds for testing
        enableAuditLog: true,
    });
    killSwitch.on('warning', () => console.log('EVENT: warning'));
    killSwitch.on('soft-lock', () => console.log('EVENT: soft-lock'));
    killSwitch.on('hard-lock', () => console.log('EVENT: hard-lock'));
    // Trigger for testing
    killSwitch.trigger(TriggerReason.LICENSE_EXPIRED);
    // Check status periodically
    const statusInterval = setInterval(() => {
        const status = killSwitch.getStatus();
        console.log(`\nStatus: ${status.state}`);
        console.log(`Time until soft-lock: ${status.timeUntilSoftLock}ms`);
        console.log(`Time until hard-lock: ${status.timeUntilHardLock}ms`);
        if (status.state === KillSwitchState.HARD_LOCKED) {
            // Complexity: O(1)
            clearInterval(statusInterval);
            process.exit(0);
        }
    }, 5000);
}
// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════
exports.default = KillSwitch;
