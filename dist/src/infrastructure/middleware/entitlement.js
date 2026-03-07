"use strict";
/**
 * Entitlement Middleware - Feature Gate Enforcement
 *
 * Guards API routes based on tenant plan and usage limits
 *
 * @author Димитър Продромов
 * @copyright 2026 QAntum. All Rights Reserved.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PLAN_ENTITLEMENTS = void 0;
exports.checkEntitlements = checkEntitlements;
exports.checkGhostMode = checkGhostMode;
exports.checkSelfHealing = checkSelfHealing;
exports.checkParallelism = checkParallelism;
exports.checkApiAccess = checkApiAccess;
exports.checkTestExecution = checkTestExecution;
exports.getEntitlementsForPlan = getEntitlementsForPlan;
exports.mapPriceToPlan = mapPriceToPlan;
exports.syncTenantEntitlements = syncTenantEntitlements;
const prisma_1 = require("../modules/OMEGA_MIND/brain/logic/energy/prisma");
// ═══════════════════════════════════════════════════════════════════════════════
// PLAN CONFIGURATIONS
// ═══════════════════════════════════════════════════════════════════════════════
exports.PLAN_ENTITLEMENTS = {
    STARTER: {
        testsLimit: 500,
        ghostModeEnabled: false,
        selfHealingEnabled: false,
        parallelExecutionLimit: 1,
        apiAccessEnabled: false,
        ssoEnabled: false,
        projectsLimit: 1,
        teamMembersLimit: 1,
        retentionDays: 7,
    },
    PRO: {
        testsLimit: 10000,
        ghostModeEnabled: true,
        selfHealingEnabled: true,
        parallelExecutionLimit: 3,
        apiAccessEnabled: true,
        ssoEnabled: false,
        projectsLimit: 5,
        teamMembersLimit: 5,
        retentionDays: 30,
    },
    TEAM: {
        testsLimit: 50000,
        ghostModeEnabled: true,
        selfHealingEnabled: true,
        parallelExecutionLimit: 10,
        apiAccessEnabled: true,
        ssoEnabled: false,
        projectsLimit: 20,
        teamMembersLimit: 20,
        retentionDays: 90,
    },
    ENTERPRISE: {
        testsLimit: -1, // Unlimited
        ghostModeEnabled: true,
        selfHealingEnabled: true,
        parallelExecutionLimit: 50,
        apiAccessEnabled: true,
        ssoEnabled: true,
        projectsLimit: -1,
        teamMembersLimit: -1,
        retentionDays: 365,
    },
};
// ═══════════════════════════════════════════════════════════════════════════════
// ENTITLEMENT CHECKS
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * Main entitlement check middleware
 * Validates tenant has active subscription and quota
 */
async function checkEntitlements(request, reply) {
    const tenantId = request.tenantId;
    if (!tenantId) {
        return reply.status(401).send({
            error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
        });
    }
    // SAFETY: async operation — wrap in try-catch for production resilience
    const tenant = await prisma_1.prisma.tenant.findUnique({
        where: { id: tenantId },
    });
    if (!tenant) {
        return reply.status(404).send({
            error: { code: 'TENANT_NOT_FOUND', message: 'Tenant not found' },
        });
    }
    // Check subscription status
    if (tenant.plan !== 'STARTER' && tenant.subscriptionStatus !== 'ACTIVE' && tenant.subscriptionStatus !== 'TRIALING') {
        return reply.status(402).send({
            error: {
                code: 'SUBSCRIPTION_INACTIVE',
                message: 'Your subscription is inactive. Please update your payment method.',
                status: tenant.subscriptionStatus,
            },
        });
    }
    // Calculate current month usage
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    // SAFETY: async operation — wrap in try-catch for production resilience
    const usageCount = await prisma_1.prisma.testRun.count({
        where: {
            project: { tenantId },
            createdAt: { gte: startOfMonth },
        },
    });
    // Check quota (skip for unlimited plans)
    if (tenant.testsLimit !== -1 && usageCount >= tenant.testsLimit) {
        return reply.status(402).send({
            error: {
                code: 'QUOTA_EXCEEDED',
                message: `Monthly test limit (${tenant.testsLimit}) exceeded. Upgrade your plan to continue.`,
                usage: usageCount,
                limit: tenant.testsLimit,
                upgradeUrl: '/billing/upgrade',
            },
        });
    }
    // Attach entitlement context to request
    request.entitlements = {
        tenant: {
            id: tenant.id,
            plan: tenant.plan,
            testsUsed: usageCount,
            testsLimit: tenant.testsLimit,
            ghostModeEnabled: tenant.ghostModeEnabled,
            selfHealingEnabled: tenant.selfHealingEnabled,
            parallelExecutionLimit: tenant.parallelExecutionLimit,
            apiAccessEnabled: tenant.apiAccessEnabled,
            subscriptionStatus: tenant.subscriptionStatus,
        },
        usage: {
            currentMonth: usageCount,
            remaining: tenant.testsLimit === -1 ? Infinity : tenant.testsLimit - usageCount,
            percentUsed: tenant.testsLimit === -1 ? 0 : Math.round((usageCount / tenant.testsLimit) * 100),
        },
    };
}
/**
 * Check if Ghost Mode is enabled for tenant
 */
async function checkGhostMode(request, reply) {
    // SAFETY: async operation — wrap in try-catch for production resilience
    await checkEntitlements(request, reply);
    const body = request.body;
    const entitlements = request.entitlements;
    if (!entitlements)
        return; // Already sent error response
    // Check Ghost Mode access
    if (body?.config?.ghostMode || body?.ghostMode) {
        if (!entitlements.tenant.ghostModeEnabled) {
            return reply.status(403).send({
                error: {
                    code: 'FEATURE_LOCKED',
                    message: 'Ghost Mode is available on Pro and Team plans.',
                    feature: 'ghostMode',
                    requiredPlan: 'PRO',
                    currentPlan: entitlements.tenant.plan,
                    upgradeUrl: '/billing/upgrade?feature=ghostMode',
                },
            });
        }
    }
}
/**
 * Check if Self-Healing is enabled for tenant
 */
async function checkSelfHealing(request, reply) {
    // SAFETY: async operation — wrap in try-catch for production resilience
    await checkEntitlements(request, reply);
    const body = request.body;
    const entitlements = request.entitlements;
    if (!entitlements)
        return;
    if (body?.config?.selfHealing || body?.selfHealing) {
        if (!entitlements.tenant.selfHealingEnabled) {
            return reply.status(403).send({
                error: {
                    code: 'FEATURE_LOCKED',
                    message: 'Self-Healing is available on Pro and Team plans.',
                    feature: 'selfHealing',
                    requiredPlan: 'PRO',
                    currentPlan: entitlements.tenant.plan,
                    upgradeUrl: '/billing/upgrade?feature=selfHealing',
                },
            });
        }
    }
}
/**
 * Check parallelism limits
 */
async function checkParallelism(request, reply) {
    // SAFETY: async operation — wrap in try-catch for production resilience
    await checkEntitlements(request, reply);
    const body = request.body;
    const entitlements = request.entitlements;
    if (!entitlements)
        return;
    const requestedParallelism = body?.config?.parallelism || 1;
    if (requestedParallelism > entitlements.tenant.parallelExecutionLimit) {
        return reply.status(403).send({
            error: {
                code: 'PARALLELISM_LIMIT',
                message: `Your plan allows ${entitlements.tenant.parallelExecutionLimit} parallel executions. You requested ${requestedParallelism}.`,
                limit: entitlements.tenant.parallelExecutionLimit,
                requested: requestedParallelism,
                upgradeUrl: '/billing/upgrade?feature=parallelism',
            },
        });
    }
}
/**
 * Check API access (for CLI/SDK usage)
 */
async function checkApiAccess(request, reply) {
    // Check if request is from API key (not dashboard)
    const authHeader = request.headers.authorization;
    const isApiKeyAuth = authHeader?.startsWith('Bearer QAntum_');
    if (!isApiKeyAuth)
        return; // Dashboard access is always allowed
    // SAFETY: async operation — wrap in try-catch for production resilience
    await checkEntitlements(request, reply);
    const entitlements = request.entitlements;
    if (!entitlements)
        return;
    if (!entitlements.tenant.apiAccessEnabled) {
        return reply.status(403).send({
            error: {
                code: 'API_ACCESS_LOCKED',
                message: 'API access is available on Pro and higher plans.',
                feature: 'apiAccess',
                requiredPlan: 'PRO',
                currentPlan: entitlements.tenant.plan,
            },
        });
    }
}
/**
 * Combined check for test execution
 */
async function checkTestExecution(request, reply) {
    // SAFETY: async operation — wrap in try-catch for production resilience
    await checkEntitlements(request, reply);
    // SAFETY: async operation — wrap in try-catch for production resilience
    await checkGhostMode(request, reply);
    // SAFETY: async operation — wrap in try-catch for production resilience
    await checkSelfHealing(request, reply);
    // SAFETY: async operation — wrap in try-catch for production resilience
    await checkParallelism(request, reply);
}
// ═══════════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * Get entitlements for plan
 */
function getEntitlementsForPlan(plan) {
    return exports.PLAN_ENTITLEMENTS[plan] || exports.PLAN_ENTITLEMENTS.STARTER;
}
/**
 * Map Stripe price ID to plan
 */
function mapPriceToPlan(priceId) {
    const priceMap = {
        [process.env.STRIPE_STARTER_PRICE_ID || '']: 'STARTER',
        [process.env.STRIPE_PRO_PRICE_ID || '']: 'PRO',
        [process.env.STRIPE_TEAM_PRICE_ID || '']: 'TEAM',
        [process.env.STRIPE_ENTERPRISE_PRICE_ID || '']: 'ENTERPRISE',
    };
    return priceMap[priceId || ''] || 'STARTER';
}
/**
 * Sync tenant entitlements from plan
 */
async function syncTenantEntitlements(tenantId, plan) {
    const entitlements = getEntitlementsForPlan(plan);
    // SAFETY: async operation — wrap in try-catch for production resilience
    await prisma_1.prisma.tenant.update({
        where: { id: tenantId },
        data: {
            plan: plan,
            testsLimit: entitlements.testsLimit,
            ghostModeEnabled: entitlements.ghostModeEnabled,
            selfHealingEnabled: entitlements.selfHealingEnabled,
            parallelExecutionLimit: entitlements.parallelExecutionLimit,
            apiAccessEnabled: entitlements.apiAccessEnabled,
            ssoEnabled: entitlements.ssoEnabled,
        },
    });
}
