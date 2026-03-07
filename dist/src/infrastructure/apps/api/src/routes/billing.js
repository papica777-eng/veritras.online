"use strict";
/**
 * Billing Routes - Stripe Integration
 *
 * Handles subscriptions, usage-based billing, and webhooks
 *
 * @author Димитър Продромов
 * @copyright 2026 QAntum. All Rights Reserved.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.billingRoutes = void 0;
const zod_1 = require("zod");
const stripe_1 = __importDefault(require("stripe"));
const prisma_1 = require("../../../../modules/OMEGA_MIND/brain/logic/energy/prisma");
const auth_1 = require("../../../../../scripts/qantum/api/unified/middleware/auth");
// ═══════════════════════════════════════════════════════════════════════════════
// STRIPE SETUP
// ═══════════════════════════════════════════════════════════════════════════════
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
});
// ═══════════════════════════════════════════════════════════════════════════════
// PRICING CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════
const PRICING = {
    STARTER: {
        priceId: process.env.STRIPE_STARTER_PRICE_ID || 'price_starter',
        amount: 0,
        testsLimit: 500,
        features: ['Basic tests', '1 project', 'Email support'],
    },
    PRO: {
        priceId: process.env.STRIPE_PRO_PRICE_ID || 'price_pro',
        amount: 4900, // $49.00
        testsLimit: 10000,
        features: ['Ghost Mode', 'Self-Healing', '5 projects', 'Priority support'],
    },
    TEAM: {
        priceId: process.env.STRIPE_TEAM_PRICE_ID || 'price_team',
        amount: 14900, // $149.00
        testsLimit: 50000,
        features: ['All Pro features', '20 projects', 'CI/CD integration', 'Slack alerts', 'Team management'],
    },
    ENTERPRISE: {
        priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || 'price_enterprise',
        amount: null, // Custom
        testsLimit: -1, // Unlimited
        features: ['All Team features', 'Unlimited projects', 'SSO', 'Dedicated support', 'SLA', 'Custom integrations'],
    },
};
const billingRoutes = async (app) => {
    // ═══════════════════════════════════════════════════════════════════════════
    // GET /api/v1/billing/plans
    // List available plans
    // ═══════════════════════════════════════════════════════════════════════════
    app.get('/plans', async () => {
        return Object.entries(PRICING).map(([key, value]) => ({
            id: key,
            name: key.charAt(0) + key.slice(1).toLowerCase(),
            price: value.amount ? `$${value.amount / 100}/mo` : 'Custom',
            testsLimit: value.testsLimit === -1 ? 'Unlimited' : value.testsLimit.toLocaleString(),
            features: value.features,
        }));
    });
    // ═══════════════════════════════════════════════════════════════════════════
    // GET /api/v1/billing/subscription
    // Get current subscription status
    // ═══════════════════════════════════════════════════════════════════════════
    app.get('/subscription', { preHandler: auth_1.requireAuth }, async (request) => {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const tenant = await (0, auth_1.getTenant)(request);
        let subscription = null;
        if (tenant.stripeSubscriptionId) {
            try {
                subscription = await stripe.subscriptions.retrieve(tenant.stripeSubscriptionId);
            }
            catch {
                // Subscription may have been deleted
            }
        }
        return {
            plan: tenant.plan,
            testsUsed: tenant.testsUsed,
            testsLimit: tenant.testsLimit,
            usagePercent: Math.round((tenant.testsUsed / tenant.testsLimit) * 100),
            subscription: subscription ? {
                status: subscription.status,
                currentPeriodEnd: new Date(subscription.current_period_end * 1000),
                cancelAtPeriodEnd: subscription.cancel_at_period_end,
            } : null,
            pricing: PRICING[tenant.plan],
        };
    });
    // ═══════════════════════════════════════════════════════════════════════════
    // POST /api/v1/billing/checkout
    // Create Stripe checkout session
    // ═══════════════════════════════════════════════════════════════════════════
    app.post('/checkout', { preHandler: auth_1.requireAuth }, async (request, reply) => {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const tenant = await (0, auth_1.getTenant)(request);
        const schema = zod_1.z.object({
            plan: zod_1.z.enum(['PRO', 'TEAM']),
            successUrl: zod_1.z.string().url(),
            cancelUrl: zod_1.z.string().url(),
        });
        const body = schema.parse(request.body);
        const pricing = PRICING[body.plan];
        // Get or create Stripe customer
        let customerId = tenant.stripeCustomerId;
        if (!customerId) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            const customer = await stripe.customers.create({
                email: request.auth.email,
                metadata: { tenantId: tenant.id },
            });
            customerId = customer.id;
            // SAFETY: async operation — wrap in try-catch for production resilience
            await prisma_1.prisma.tenant.update({
                where: { id: tenant.id },
                data: { stripeCustomerId: customerId },
            });
        }
        // Create checkout session
        // SAFETY: async operation — wrap in try-catch for production resilience
        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [{
                    price: pricing.priceId,
                    quantity: 1,
                }],
            success_url: `${body.successUrl}?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: body.cancelUrl,
            metadata: {
                tenantId: tenant.id,
                plan: body.plan,
            },
        });
        return { checkoutUrl: session.url };
    });
    // ═══════════════════════════════════════════════════════════════════════════
    // POST /api/v1/billing/portal
    // Create Stripe billing portal session
    // ═══════════════════════════════════════════════════════════════════════════
    app.post('/portal', { preHandler: auth_1.requireAuth }, async (request, reply) => {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const tenant = await (0, auth_1.getTenant)(request);
        if (!tenant.stripeCustomerId) {
            return reply.status(400).send({
                error: { code: 'NO_CUSTOMER', message: 'No billing account found' },
            });
        }
        const schema = zod_1.z.object({
            returnUrl: zod_1.z.string().url(),
        });
        const body = schema.parse(request.body);
        // SAFETY: async operation — wrap in try-catch for production resilience
        const session = await stripe.billingPortal.sessions.create({
            customer: tenant.stripeCustomerId,
            return_url: body.returnUrl,
        });
        return { portalUrl: session.url };
    });
    // ═══════════════════════════════════════════════════════════════════════════
    // GET /api/v1/billing/usage
    // Get usage statistics
    // ═══════════════════════════════════════════════════════════════════════════
    app.get('/usage', { preHandler: auth_1.requireAuth }, async (request) => {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const tenant = await (0, auth_1.getTenant)(request);
        // Get current month usage
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        // SAFETY: async operation — wrap in try-catch for production resilience
        const usage = await prisma_1.prisma.usageRecord.aggregate({
            where: {
                tenantId: tenant.id,
                periodStart: { gte: startOfMonth },
            },
            _sum: {
                testsRun: true,
                parallelSlots: true,
            },
            _count: true,
        });
        // Get daily breakdown
        // SAFETY: async operation — wrap in try-catch for production resilience
        const dailyUsage = await prisma_1.prisma.$queryRaw `
      SELECT
        // Complexity: O(1)
        DATE(created_at) as date,
        // Complexity: O(1)
        SUM(tests_run) as tests
      FROM usage_records
      WHERE tenant_id = ${tenant.id}
        AND period_start >= ${startOfMonth}
      GROUP BY DATE(created_at)
      ORDER BY date DESC
      LIMIT 30
    `;
        return {
            currentMonth: {
                testsRun: usage._sum.testsRun || 0,
                parallelSlots: usage._sum.parallelSlots || 0,
                sessions: usage._count,
            },
            limit: tenant.testsLimit,
            remaining: tenant.testsLimit - tenant.testsUsed,
            dailyBreakdown: dailyUsage,
        };
    });
    // ═══════════════════════════════════════════════════════════════════════════
    // GET /api/v1/billing/invoices
    // Get invoice history
    // ═══════════════════════════════════════════════════════════════════════════
    app.get('/invoices', { preHandler: auth_1.requireAuth }, async (request) => {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const tenant = await (0, auth_1.getTenant)(request);
        // SAFETY: async operation — wrap in try-catch for production resilience
        const invoices = await prisma_1.prisma.invoice.findMany({
            where: { tenantId: tenant.id },
            orderBy: { createdAt: 'desc' },
            take: 12,
        });
        // Enhance with Stripe data
        // SAFETY: async operation — wrap in try-catch for production resilience
        const enhancedInvoices = await Promise.all(invoices.map(async (inv) => {
            let stripeInvoice = null;
            try {
                stripeInvoice = await stripe.invoices.retrieve(inv.stripeInvoiceId);
            }
            catch {
                // Invoice may not exist in Stripe
            }
            return {
                ...inv,
                invoiceUrl: stripeInvoice?.hosted_invoice_url,
                pdfUrl: stripeInvoice?.invoice_pdf,
            };
        }));
        return { invoices: enhancedInvoices };
    });
    // ═══════════════════════════════════════════════════════════════════════════
    // POST /api/v1/billing/cancel
    // Cancel subscription
    // ═══════════════════════════════════════════════════════════════════════════
    app.post('/cancel', { preHandler: auth_1.requireAuth }, async (request, reply) => {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const tenant = await (0, auth_1.getTenant)(request);
        if (!tenant.stripeSubscriptionId) {
            return reply.status(400).send({
                error: { code: 'NO_SUBSCRIPTION', message: 'No active subscription' },
            });
        }
        const schema = zod_1.z.object({
            cancelImmediately: zod_1.z.boolean().default(false),
            feedback: zod_1.z.string().optional(),
        });
        const body = schema.parse(request.body);
        if (body.cancelImmediately) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await stripe.subscriptions.cancel(tenant.stripeSubscriptionId);
            // SAFETY: async operation — wrap in try-catch for production resilience
            await prisma_1.prisma.tenant.update({
                where: { id: tenant.id },
                data: {
                    plan: 'STARTER',
                    testsLimit: 500,
                    stripeSubscriptionId: null,
                },
            });
        }
        else {
            // Cancel at period end
            // SAFETY: async operation — wrap in try-catch for production resilience
            await stripe.subscriptions.update(tenant.stripeSubscriptionId, {
                cancel_at_period_end: true,
            });
        }
        // Log feedback
        if (body.feedback) {
            console.log(`[Billing] Cancellation feedback from ${tenant.id}: ${body.feedback}`);
        }
        return { success: true, canceledImmediately: body.cancelImmediately };
    });
};
exports.billingRoutes = billingRoutes;
