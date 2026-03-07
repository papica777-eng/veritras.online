"use strict";
/**
 * Webhook Routes - Stripe & CI/CD Events
 *
 * Handles external event callbacks
 *
 * @author Димитър Продромов
 * @copyright 2026 QAntum. All Rights Reserved.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.webhookRoutes = void 0;
const stripe_1 = __importDefault(require("stripe"));
const prisma_1 = require("../../../../modules/OMEGA_MIND/brain/logic/energy/prisma");
const entitlement_1 = require("../../../../modules/GAMMA_INFRA/core/mouth/energy/entitlement");
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
});
const webhookRoutes = async (app) => {
    // ═══════════════════════════════════════════════════════════════════════════
    // POST /webhooks/stripe
    // Stripe webhook handler
    // ═══════════════════════════════════════════════════════════════════════════
    app.post('/stripe', {
        config: {
            rawBody: true, // Needed for signature verification
        },
    }, async (request, reply) => {
        const sig = request.headers['stripe-signature'];
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
        let event;
        try {
            event = stripe.webhooks.constructEvent(request.rawBody, sig, webhookSecret);
        }
        catch (err) {
            console.error('[Webhook] Signature verification failed:', err.message);
            return reply.status(400).send({ error: 'Invalid signature' });
        }
        console.log(`[Webhook] Received event: ${event.type}`);
        try {
            switch (event.type) {
                // ═══════════════════════════════════════════════════════════════════
                // SUBSCRIPTION EVENTS
                // ═══════════════════════════════════════════════════════════════════
                case 'checkout.session.completed': {
                    const session = event.data.object;
                    const { tenantId, plan } = session.metadata || {};
                    if (tenantId && plan) {
                        await prisma_1.prisma.tenant.update({
                            where: { id: tenantId },
                            data: {
                                stripeCustomerId: session.customer,
                                stripeSubscriptionId: session.subscription,
                                stripePriceId: session.line_items?.data[0]?.price?.id || null,
                                subscriptionStatus: 'ACTIVE',
                            },
                        });
                        // Sync all entitlements from plan
                        // SAFETY: async operation — wrap in try-catch for production resilience
                        await (0, entitlement_1.syncTenantEntitlements)(tenantId, plan);
                        console.log(`[Webhook] Tenant ${tenantId} upgraded to ${plan}`);
                    }
                    break;
                }
                case 'customer.subscription.updated': {
                    const subscription = event.data.object;
                    // SAFETY: async operation — wrap in try-catch for production resilience
                    const customer = await stripe.customers.retrieve(subscription.customer);
                    const tenantId = customer.metadata?.tenantId;
                    if (tenantId) {
                        const priceId = subscription.items.data[0]?.price.id;
                        const plan = (0, entitlement_1.mapPriceToPlan)(priceId);
                        // Map Stripe status to our enum
                        const statusMap = {
                            'active': 'ACTIVE',
                            'trialing': 'TRIALING',
                            'past_due': 'PAST_DUE',
                            'canceled': 'CANCELED',
                            'unpaid': 'UNPAID',
                            'incomplete': 'INACTIVE',
                            'incomplete_expired': 'INACTIVE',
                        };
                        // SAFETY: async operation — wrap in try-catch for production resilience
                        await prisma_1.prisma.tenant.update({
                            where: { id: tenantId },
                            data: {
                                stripePriceId: priceId,
                                subscriptionStatus: statusMap[subscription.status] || 'INACTIVE',
                            },
                        });
                        // Sync all entitlements from plan
                        // SAFETY: async operation — wrap in try-catch for production resilience
                        await (0, entitlement_1.syncTenantEntitlements)(tenantId, plan);
                        console.log(`[Webhook] Tenant ${tenantId} subscription updated to ${plan}`);
                    }
                    break;
                }
                case 'customer.subscription.deleted': {
                    const subscription = event.data.object;
                    // SAFETY: async operation — wrap in try-catch for production resilience
                    const customer = await stripe.customers.retrieve(subscription.customer);
                    const tenantId = customer.metadata?.tenantId;
                    if (tenantId) {
                        // SAFETY: async operation — wrap in try-catch for production resilience
                        await prisma_1.prisma.tenant.update({
                            where: { id: tenantId },
                            data: {
                                stripeSubscriptionId: null,
                                stripePriceId: null,
                                subscriptionStatus: 'CANCELED',
                            },
                        });
                        // Downgrade to STARTER (free tier)
                        // SAFETY: async operation — wrap in try-catch for production resilience
                        await (0, entitlement_1.syncTenantEntitlements)(tenantId, 'STARTER');
                        console.log(`[Webhook] Tenant ${tenantId} downgraded to STARTER`);
                    }
                    break;
                }
                // ═══════════════════════════════════════════════════════════════════
                // INVOICE EVENTS
                // ═══════════════════════════════════════════════════════════════════
                case 'invoice.paid': {
                    const invoice = event.data.object;
                    // SAFETY: async operation — wrap in try-catch for production resilience
                    const customer = await stripe.customers.retrieve(invoice.customer);
                    const tenantId = customer.metadata?.tenantId;
                    if (tenantId) {
                        // Reset monthly usage
                        // SAFETY: async operation — wrap in try-catch for production resilience
                        await prisma_1.prisma.tenant.update({
                            where: { id: tenantId },
                            data: { testsUsed: 0 },
                        });
                        // Record invoice
                        // SAFETY: async operation — wrap in try-catch for production resilience
                        await prisma_1.prisma.invoice.create({
                            data: {
                                stripeInvoiceId: invoice.id,
                                amount: invoice.amount_paid,
                                currency: invoice.currency,
                                status: 'PAID',
                                testsUsed: 0, // Will be updated at end of period
                                period: new Date(invoice.period_start * 1000),
                                tenantId,
                                paidAt: new Date(),
                            },
                        });
                        console.log(`[Webhook] Invoice ${invoice.id} paid for tenant ${tenantId}`);
                    }
                    break;
                }
                case 'invoice.payment_failed': {
                    const invoice = event.data.object;
                    // SAFETY: async operation — wrap in try-catch for production resilience
                    const customer = await stripe.customers.retrieve(invoice.customer);
                    const tenantId = customer.metadata?.tenantId;
                    if (tenantId) {
                        // SAFETY: async operation — wrap in try-catch for production resilience
                        await prisma_1.prisma.invoice.updateMany({
                            where: { stripeInvoiceId: invoice.id },
                            data: { status: 'FAILED' },
                        });
                        // TODO: Send email notification about payment failure
                        console.log(`[Webhook] Payment failed for tenant ${tenantId}`);
                    }
                    break;
                }
                default:
                    console.log(`[Webhook] Unhandled event type: ${event.type}`);
            }
        }
        catch (error) {
            console.error(`[Webhook] Error processing ${event.type}:`, error.message);
            // Don't return error - Stripe will retry
        }
        return { received: true };
    });
    // ═══════════════════════════════════════════════════════════════════════════
    // POST /webhooks/github
    // GitHub Actions webhook for CI/CD integration
    // ═══════════════════════════════════════════════════════════════════════════
    app.post('/github', async (request, reply) => {
        const signature = request.headers['x-hub-signature-256'];
        const event = request.headers['x-github-event'];
        // TODO: Verify signature with GITHUB_WEBHOOK_SECRET
        console.log(`[Webhook] GitHub event: ${event}`);
        const payload = request.body;
        switch (event) {
            case 'push': {
                // Trigger tests on push
                const { repository, after: commitSha, ref } = payload;
                const branch = ref?.replace('refs/heads/', '');
                // TODO: Find associated project and trigger test run
                console.log(`[Webhook] Push to ${repository?.full_name}@${branch} (${commitSha})`);
                break;
            }
            case 'pull_request': {
                // Trigger tests on PR
                const { action, pull_request } = payload;
                if (['opened', 'synchronize'].includes(action)) {
                    console.log(`[Webhook] PR ${action}: ${pull_request?.title}`);
                    // TODO: Trigger test run and post status check
                }
                break;
            }
        }
        return { received: true };
    });
    // ═══════════════════════════════════════════════════════════════════════════
    // POST /webhooks/gitlab
    // GitLab webhook for CI/CD integration
    // ═══════════════════════════════════════════════════════════════════════════
    app.post('/gitlab', async (request, reply) => {
        const token = request.headers['x-gitlab-token'];
        const event = request.headers['x-gitlab-event'];
        // TODO: Verify token with GITLAB_WEBHOOK_SECRET
        console.log(`[Webhook] GitLab event: ${event}`);
        // TODO: Implement GitLab-specific logic
        return { received: true };
    });
};
exports.webhookRoutes = webhookRoutes;
