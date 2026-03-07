"use strict";
/**
 * 💰 QAntum SaaS API Handlers
 * Copyright © 2025 Dimitar Prodromov. All rights reserved.
 *
 * Express/HTTP handlers for SaaS platform integration
 * Ready to plug into singularity-dashboard.js
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.featureGateMiddleware = exports.rateLimitMiddleware = exports.saasApiHandlers = void 0;
const index_1 = require("./index");
const platform = new index_1.QAntumSaaSPlatform();
// ═══════════════════════════════════════════════════════════════════════════════
// API HANDLERS FOR SINGULARITY DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
exports.saasApiHandlers = {
    // ─────────────────────────────────────────────────────────────────────────────
    // PRICING & PLANS
    // ─────────────────────────────────────────────────────────────────────────────
    'GET /api/saas/pricing': async () => {
        return {
            success: true,
            data: platform.getPricingData()
        };
    },
    'GET /api/saas/tiers': async () => {
        return {
            success: true,
            data: index_1.SUBSCRIPTION_TIERS
        };
    },
    // ─────────────────────────────────────────────────────────────────────────────
    // CUSTOMER MANAGEMENT
    // ─────────────────────────────────────────────────────────────────────────────
    'POST /api/saas/register': async (body) => {
        const { email, name, tier = 'FREE' } = body;
        if (!email || !name) {
            return { success: false, error: 'Email and name required' };
        }
        try {
            const customer = await platform.registerCustomer(email, name, tier);
            return {
                success: true,
                data: {
                    customerId: customer.id,
                    licenseKey: customer.licenseKey,
                    tier: customer.tier,
                    message: `Welcome to QAntum ${index_1.SUBSCRIPTION_TIERS[tier].name}!`
                }
            };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    },
    'GET /api/saas/customer/:id': async (body, params) => {
        const dashboard = platform.getCustomerDashboard(params.id);
        if (!dashboard) {
            return { success: false, error: 'Customer not found' };
        }
        return {
            success: true,
            data: {
                ...dashboard.customer,
                tierInfo: dashboard.tier,
                usage: Object.fromEntries(dashboard.usage),
                limits: dashboard.limits
            }
        };
    },
    // ─────────────────────────────────────────────────────────────────────────────
    // SUBSCRIPTION MANAGEMENT
    // ─────────────────────────────────────────────────────────────────────────────
    'POST /api/saas/upgrade': async (body) => {
        const { customerId, tier } = body;
        if (!customerId || !tier) {
            return { success: false, error: 'Customer ID and tier required' };
        }
        if (!index_1.SUBSCRIPTION_TIERS[tier]) {
            return { success: false, error: 'Invalid tier' };
        }
        try {
            const result = await platform.upgradeSubscription(customerId, tier, `${process.env.BASE_URL || 'http://localhost:8888'}/success?session_id={CHECKOUT_SESSION_ID}`, `${process.env.BASE_URL || 'http://localhost:8888'}/pricing`);
            return {
                success: true,
                data: {
                    checkoutUrl: result.checkoutUrl,
                    tier: index_1.SUBSCRIPTION_TIERS[tier].name,
                    price: index_1.SUBSCRIPTION_TIERS[tier].price
                }
            };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    },
    // ─────────────────────────────────────────────────────────────────────────────
    // LICENSE VALIDATION
    // ─────────────────────────────────────────────────────────────────────────────
    'POST /api/saas/validate': async (body) => {
        const { licenseKey, feature } = body;
        if (!licenseKey) {
            return { success: false, error: 'License key required' };
        }
        const validation = platform.validateAccess(licenseKey, feature);
        return {
            success: validation.valid,
            data: validation.valid ? {
                tier: validation.tier,
                tierInfo: validation.tier ? index_1.SUBSCRIPTION_TIERS[validation.tier] : null
            } : null,
            error: validation.error
        };
    },
    'POST /api/saas/activate': async (body) => {
        const { licenseKey, machineId } = body;
        if (!licenseKey) {
            return { success: false, error: 'License key required' };
        }
        // Validate and activate
        const validation = platform.validateAccess(licenseKey);
        if (!validation.valid) {
            return { success: false, error: validation.error };
        }
        return {
            success: true,
            data: {
                activated: true,
                tier: validation.tier,
                machineId,
                activatedAt: new Date().toISOString()
            }
        };
    },
    // ─────────────────────────────────────────────────────────────────────────────
    // USAGE TRACKING
    // ─────────────────────────────────────────────────────────────────────────────
    'POST /api/saas/usage': async (body) => {
        const { customerId, metric, quantity = 1 } = body;
        if (!customerId || !metric) {
            return { success: false, error: 'Customer ID and metric required' };
        }
        try {
            const result = platform.trackUsage(customerId, metric, quantity);
            return {
                success: true,
                data: {
                    allowed: result.allowed,
                    remaining: result.remaining,
                    metric,
                    recorded: result.allowed ? quantity : 0
                }
            };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    },
    'GET /api/saas/usage/:customerId': async (body, params) => {
        const dashboard = platform.getCustomerDashboard(params.customerId);
        if (!dashboard) {
            return { success: false, error: 'Customer not found' };
        }
        return {
            success: true,
            data: {
                usage: Object.fromEntries(dashboard.usage),
                limits: dashboard.limits,
                tier: dashboard.customer.tier
            }
        };
    },
    // ─────────────────────────────────────────────────────────────────────────────
    // STRIPE WEBHOOK
    // ─────────────────────────────────────────────────────────────────────────────
    'POST /api/saas/webhook': async (body, params, rawBody, signature) => {
        if (!rawBody || !signature) {
            return { success: false, error: 'Missing webhook payload or signature' };
        }
        try {
            const result = await platform.handleWebhook(rawBody, signature);
            return { success: true, data: result };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    }
};
// ═══════════════════════════════════════════════════════════════════════════════
// MIDDLEWARE FOR RATE LIMITING & AUTH
// ═══════════════════════════════════════════════════════════════════════════════
const rateLimitMiddleware = (customerId, endpoint) => {
    const result = platform.trackUsage(customerId, 'apiCallsPerDay');
    return result.allowed;
};
exports.rateLimitMiddleware = rateLimitMiddleware;
const featureGateMiddleware = (licenseKey, feature) => {
    const validation = platform.validateAccess(licenseKey, feature);
    return validation.valid;
};
exports.featureGateMiddleware = featureGateMiddleware;
// ═══════════════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════════════
exports.default = exports.saasApiHandlers;
