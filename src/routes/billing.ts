/**
 * Billing Routes - Stripe Integration
 *
 * Handles subscriptions, usage-based billing, and webhooks
 *
 * @author Димитър Продромов
 * @copyright 2026 QAntum. All Rights Reserved.
 */

import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import Stripe from 'stripe';
import { prisma } from '../modules/OMEGA_MIND/brain/logic/energy/prisma';
import { requireAuth, getTenant } from '../middleware/auth';

// ═══════════════════════════════════════════════════════════════════════════════
// STRIPE SETUP
// ═══════════════════════════════════════════════════════════════════════════════

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

// ═══════════════════════════════════════════════════════════════════════════════
// PRICING CONFIGURATION — 3 Products × Multiple Tiers
// Matches: veritras.online, veritras.website, aeterna.website
// ═══════════════════════════════════════════════════════════════════════════════

const PRICING = {
  // ─── SERVICE 01: QAntum Prime — QA Automation (veritras.website) ───────────
  QANTUM_STARTER: {
    priceId: process.env.STRIPE_QANTUM_STARTER_ID || 'price_qantum_starter',
    product: 'QANTUM_PRIME',
    amount: 2900, // €29.00
    testsLimit: 1000,
    features: [
      'Ghost Protocol — invisible to anti-bot systems',
      'Self-Healing Engine — broken selectors auto-repair',
      '3 projects',
      'Auto Test Factory — API & E2E tests',
      'Basic PDF reports',
    ],
  },
  QANTUM_PRO: {
    priceId: process.env.STRIPE_QANTUM_PRO_ID || 'price_qantum_pro',
    product: 'QANTUM_PRIME',
    amount: 7900, // €79.00
    testsLimit: 10000,
    features: [
      'All Starter features',
      'Swarm Execution — 100+ parallel workers',
      '20 projects',
      'Executive PDF & DOCX reports',
      'CI/CD integration (GitHub, GitLab)',
      'AI-powered test generation',
      'Priority support',
    ],
  },
  QANTUM_ENTERPRISE: {
    priceId: process.env.STRIPE_QANTUM_ENTERPRISE_ID || 'price_qantum_enterprise',
    product: 'QANTUM_PRIME',
    amount: null, // Custom
    testsLimit: -1, // Unlimited
    features: [
      'All Pro features',
      'Unlimited projects & tests',
      'SSO & SAML',
      'Dedicated support & SLA',
      'Custom integrations',
      'On-premise deployment',
    ],
  },

  // ─── SERVICE 02: AETERNA Logos — Sovereign Infrastructure (aeterna.website) ─
  AETERNA_STARTER: {
    priceId: process.env.STRIPE_AETERNA_STARTER_ID || 'price_aeterna_starter',
    product: 'AETERNA_LOGOS',
    amount: 4900, // €49.00
    manifoldNodes: 3,
    features: [
      'Manifold Node deployment (3 nodes)',
      '24/7 Logic Pulse monitoring',
      'LwaS — custom .soul language',
      'Sovereign Encryption Vault (10 keys)',
      'Email support',
    ],
  },
  AETERNA_PRO: {
    priceId: process.env.STRIPE_AETERNA_PRO_ID || 'price_aeterna_pro',
    product: 'AETERNA_LOGOS',
    amount: 9900, // €99.00
    manifoldNodes: 20,
    features: [
      'All Starter features',
      'Manifold Node deployment (20 nodes)',
      'Wealth Bridge API integration',
      'Sovereign Encryption Vault (100 keys)',
      'Custom .soul bytecode compiler',
      'Priority support',
    ],
  },
  AETERNA_SOVEREIGN: {
    priceId: process.env.STRIPE_AETERNA_SOVEREIGN_ID || 'price_aeterna_sovereign',
    product: 'AETERNA_LOGOS',
    amount: 24900, // €249.00
    manifoldNodes: -1, // Unlimited
    features: [
      'All Pro features',
      'Unlimited Manifold Nodes',
      'Dedicated Vault instance',
      'Custom .soul VM runtime',
      'Dedicated support & SLA',
    ],
  },

  // ─── SERVICE 03: CHRONOS Sovereign — Trading Intelligence (veritras.online) ─
  CHRONOS_STARTER: {
    priceId: process.env.STRIPE_CHRONOS_STARTER_ID || 'price_chronos_starter',
    product: 'CHRONOS_SOVEREIGN',
    amount: 9900, // €99.00
    predictionsPerDay: 50,
    features: [
      'Catuskoti 4-valued logic (TRUE/FALSE/PARADOX/TRANSCENDENT)',
      '3 trading pairs (BTC, ETH, ETHEUR)',
      '50 predictions/day',
      'Order book analysis (5 levels)',
      'Anti-panic PARADOX protection',
    ],
  },
  CHRONOS_PRO: {
    priceId: process.env.STRIPE_CHRONOS_PRO_ID || 'price_chronos_pro',
    product: 'CHRONOS_SOVEREIGN',
    amount: 19900, // €199.00
    predictionsPerDay: 500,
    features: [
      'All Starter features',
      '8 trading pairs',
      '500 predictions/day',
      'Retrocausal temporal re-evaluation',
      'OBI Manifold curvature (20 levels)',
      'Soul Karma evolution engine',
    ],
  },
  CHRONOS_SOVEREIGN: {
    priceId: process.env.STRIPE_CHRONOS_SOVEREIGN_ID || 'price_chronos_sovereign',
    product: 'CHRONOS_SOVEREIGN',
    amount: 49900, // €499.00
    predictionsPerDay: -1, // Unlimited
    features: [
      'All Pro features',
      'Unlimited pairs & predictions',
      'Full OBI Manifold (50 levels)',
      'Custom Catuskoti logic rules',
      'Dedicated support & SLA',
    ],
  },
} as const;

export const billingRoutes: FastifyPluginAsync = async (app) => {
  // ═══════════════════════════════════════════════════════════════════════════
  // GET /api/v1/billing/plans
  // List available plans
  // ═══════════════════════════════════════════════════════════════════════════

  app.get('/plans', async () => {
    const products: Record<string, any[]> = {};

    for (const [key, value] of Object.entries(PRICING)) {
      const product = (value as any).product || 'QANTUM_PRIME';
      if (!products[product]) products[product] = [];
      products[product].push({
        id: key,
        name: key.replace(/_/g, ' '),
        price: value.amount ? `€${value.amount / 100}/mo` : 'Custom',
        features: value.features,
      });
    }

    return {
      products: {
        QANTUM_PRIME: {
          name: 'QAntum Prime — QA Automation',
          domain: 'veritras.website',
          startingFrom: '€29/mo',
          plans: products.QANTUM_PRIME || [],
        },
        AETERNA_LOGOS: {
          name: 'AETERNA Logos — Sovereign Infrastructure',
          domain: 'aeterna.website',
          startingFrom: '€49/mo',
          plans: products.AETERNA_LOGOS || [],
        },
        CHRONOS_SOVEREIGN: {
          name: 'CHRONOS Sovereign — Trading Intelligence',
          domain: 'veritras.online',
          startingFrom: '€99/mo',
          plans: products.CHRONOS_SOVEREIGN || [],
        },
      },
    };
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // GET /api/v1/billing/subscription
  // Get current subscription status
  // ═══════════════════════════════════════════════════════════════════════════

  app.get('/subscription', { preHandler: requireAuth }, async (request) => {
    // SAFETY: async operation — wrap in try-catch for production resilience
    const tenant = await getTenant(request);

    let subscription = null;
    if (tenant.stripeSubscriptionId) {
      try {
        subscription = await stripe.subscriptions.retrieve(tenant.stripeSubscriptionId);
      } catch {
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
      pricing: PRICING[tenant.plan as keyof typeof PRICING],
    };
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // POST /api/v1/billing/checkout
  // Create Stripe checkout session
  // ═══════════════════════════════════════════════════════════════════════════

  app.post('/checkout', { preHandler: requireAuth }, async (request, reply) => {
    // SAFETY: async operation — wrap in try-catch for production resilience
    const tenant = await getTenant(request);

    const schema = z.object({
      plan: z.enum(['PRO', 'TEAM']),
      successUrl: z.string().url(),
      cancelUrl: z.string().url(),
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
      await prisma.tenant.update({
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

  app.post('/portal', { preHandler: requireAuth }, async (request, reply) => {
    // SAFETY: async operation — wrap in try-catch for production resilience
    const tenant = await getTenant(request);

    if (!tenant.stripeCustomerId) {
      return reply.status(400).send({
        error: { code: 'NO_CUSTOMER', message: 'No billing account found' },
      });
    }

    const schema = z.object({
      returnUrl: z.string().url(),
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

  app.get('/usage', { preHandler: requireAuth }, async (request) => {
    // SAFETY: async operation — wrap in try-catch for production resilience
    const tenant = await getTenant(request);

    // Get current month usage
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // SAFETY: async operation — wrap in try-catch for production resilience
    const usage = await prisma.usageRecord.aggregate({
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
    const dailyUsage = await prisma.$queryRaw`
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

  app.get('/invoices', { preHandler: requireAuth }, async (request) => {
    // SAFETY: async operation — wrap in try-catch for production resilience
    const tenant = await getTenant(request);

    // SAFETY: async operation — wrap in try-catch for production resilience
    const invoices = await prisma.invoice.findMany({
      where: { tenantId: tenant.id },
      orderBy: { createdAt: 'desc' },
      take: 12,
    });

    // Enhance with Stripe data
    // SAFETY: async operation — wrap in try-catch for production resilience
    const enhancedInvoices = await Promise.all(
      invoices.map(async (inv) => {
        let stripeInvoice = null;
        try {
          stripeInvoice = await stripe.invoices.retrieve(inv.stripeInvoiceId);
        } catch {
          // Invoice may not exist in Stripe
        }

        return {
          ...inv,
          invoiceUrl: stripeInvoice?.hosted_invoice_url,
          pdfUrl: stripeInvoice?.invoice_pdf,
        };
      })
    );

    return { invoices: enhancedInvoices };
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // POST /api/v1/billing/cancel
  // Cancel subscription
  // ═══════════════════════════════════════════════════════════════════════════

  app.post('/cancel', { preHandler: requireAuth }, async (request, reply) => {
    // SAFETY: async operation — wrap in try-catch for production resilience
    const tenant = await getTenant(request);

    if (!tenant.stripeSubscriptionId) {
      return reply.status(400).send({
        error: { code: 'NO_SUBSCRIPTION', message: 'No active subscription' },
      });
    }

    const schema = z.object({
      cancelImmediately: z.boolean().default(false),
      feedback: z.string().optional(),
    });

    const body = schema.parse(request.body);

    if (body.cancelImmediately) {
      // SAFETY: async operation — wrap in try-catch for production resilience
      await stripe.subscriptions.cancel(tenant.stripeSubscriptionId);

      // SAFETY: async operation — wrap in try-catch for production resilience
      await prisma.tenant.update({
        where: { id: tenant.id },
        data: {
          plan: 'STARTER',
          testsLimit: 500,
          stripeSubscriptionId: null,
        },
      });
    } else {
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
