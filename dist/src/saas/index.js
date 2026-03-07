"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                               ║
 * ║   QANTUM SAAS MODULE                                                          ║
 * ║   "Telemetry, Feature Flags & Subscriptions"                                  ║
 * ║                                                                               ║
 * ║   TODO B #48-50 - SaaS Complete                                               ║
 * ║                                                                               ║
 * ║   © 2025-2026 QAntum | Dimitar Prodromov                                        ║
 * ║                                                                               ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SaaS = exports.PLANS = exports.getSubscriptions = exports.SubscriptionService = exports.Feature = exports.createFlag = exports.getFeatureFlags = exports.FeatureFlagService = exports.Timed = exports.Track = exports.getTelemetry = exports.TelemetryService = void 0;
exports.getSaaS = getSaaS;
// ═══════════════════════════════════════════════════════════════════════════════
// TELEMETRY
// ═══════════════════════════════════════════════════════════════════════════════
var telemetry_1 = require("./telemetry");
Object.defineProperty(exports, "TelemetryService", { enumerable: true, get: function () { return telemetry_1.TelemetryService; } });
Object.defineProperty(exports, "getTelemetry", { enumerable: true, get: function () { return telemetry_1.getTelemetry; } });
Object.defineProperty(exports, "Track", { enumerable: true, get: function () { return telemetry_1.Track; } });
Object.defineProperty(exports, "Timed", { enumerable: true, get: function () { return telemetry_1.Timed; } });
// ═══════════════════════════════════════════════════════════════════════════════
// FEATURE FLAGS
// ═══════════════════════════════════════════════════════════════════════════════
var feature_flags_1 = require("./feature-flags");
Object.defineProperty(exports, "FeatureFlagService", { enumerable: true, get: function () { return feature_flags_1.FeatureFlagService; } });
Object.defineProperty(exports, "getFeatureFlags", { enumerable: true, get: function () { return feature_flags_1.getFeatureFlags; } });
Object.defineProperty(exports, "createFlag", { enumerable: true, get: function () { return feature_flags_1.createFlag; } });
Object.defineProperty(exports, "Feature", { enumerable: true, get: function () { return feature_flags_1.Feature; } });
// ═══════════════════════════════════════════════════════════════════════════════
// SUBSCRIPTION
// ═══════════════════════════════════════════════════════════════════════════════
var subscription_1 = require("./subscription");
Object.defineProperty(exports, "SubscriptionService", { enumerable: true, get: function () { return subscription_1.SubscriptionService; } });
Object.defineProperty(exports, "getSubscriptions", { enumerable: true, get: function () { return subscription_1.getSubscriptions; } });
Object.defineProperty(exports, "PLANS", { enumerable: true, get: function () { return subscription_1.PLANS; } });
// ═══════════════════════════════════════════════════════════════════════════════
// UNIFIED SAAS FACADE
// ═══════════════════════════════════════════════════════════════════════════════
const telemetry_2 = require("./telemetry");
const feature_flags_2 = require("./feature-flags");
const subscription_2 = require("./subscription");
class SaaS {
    telemetry;
    features;
    subscriptions;
    constructor() {
        this.telemetry = telemetry_2.TelemetryService.getInstance();
        this.features = feature_flags_2.FeatureFlagService.getInstance();
        this.subscriptions = subscription_2.SubscriptionService.getInstance();
    }
    /**
     * Check if feature is enabled for user
     */
    // Complexity: O(1)
    isFeatureEnabled(featureKey, userId, attributes) {
        return this.features.isEnabled(featureKey, { userId, userAttributes: attributes });
    }
    /**
     * Check if user can perform action within limits
     */
    // Complexity: O(1)
    canPerformAction(subscriptionId, action) {
        const result = this.subscriptions.checkLimit(subscriptionId, action);
        return result.allowed;
    }
    /**
     * Track feature usage
     */
    // Complexity: O(1)
    trackUsage(subscriptionId, metric, amount = 1) {
        this.subscriptions.recordUsage(subscriptionId, metric, amount);
        this.telemetry.track('usage', 'metering', { metric, amount, subscriptionId });
    }
    /**
     * Get user tier
     */
    // Complexity: O(1) — lookup
    getUserTier(subscriptionId) {
        const sub = this.subscriptions.get(subscriptionId);
        return sub?.tier || 'free';
    }
    /**
     * Quick subscription
     */
    // Complexity: O(N)
    subscribe(userId, tier, billingCycle = 'monthly') {
        const plan = this.subscriptions.getPlanByTier(tier);
        if (!plan)
            throw new Error(`Plan not found for tier: ${tier}`);
        const subscription = this.subscriptions.create(userId, plan.id, billingCycle);
        this.telemetry.track('subscription_created', 'billing', {
            tier,
            billingCycle,
            planId: plan.id,
        });
        return subscription.id;
    }
    /**
     * Shadow provision a new user gracefully (used by Qantum Singularity)
     */
    // Complexity: O(1) — lookup
    shadowProvision(email, companyName) {
        const subId = this.subscribe(email, 'free', 'monthly');
        const sub = this.subscriptions.get(subId);
        return {
            subscription: sub,
            magicLink: `https://qantum.empire/magic-login?token=${Buffer.from(email).toString('base64')}`
        };
    }
    /**
     * Record usage (wrapper for Singularity)
     */
    // Complexity: O(1)
    recordUsage(email, feature) {
        try {
            this.trackUsage(email, 'apiCalls', 1);
            return null;
        }
        catch {
            return { email, suggestedTier: 'pro', reason: 'Limit exceeded' };
        }
    }
    /**
     * Check access (wrapper for Singularity)
     */
    // Complexity: O(1)
    canAccess(email, feature) {
        const allowed = this.canPerformAction(email, 'apiCallsPerDay');
        if (allowed) {
            return { allowed: true };
        }
        return {
            allowed: false,
            reason: 'Feature limit reached',
            upgradeUrl: 'https://qantum.empire/pricing'
        };
    }
}
exports.SaaS = SaaS;
// Singleton
let saasInstance = null;
function getSaaS() {
    if (!saasInstance) {
        saasInstance = new SaaS();
    }
    return saasInstance;
}
exports.default = SaaS;
