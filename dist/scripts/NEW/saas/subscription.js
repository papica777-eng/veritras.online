"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║   QANTUM SAAS — SUBSCRIPTION ENGINE                                           ║
 * ║   "The Financial Backbone of the Empire"                                      ║
 * ║                                                                               ║
 * ║   Handles: Plans, Usage Enforcement, Invoicing, Auto-Upsell Signals          ║
 * ║   Plans: Free → Starter → Pro → Enterprise                                   ║
 * ║                                                                               ║
 * ║   © 2025-2026 QAntum | Dimitar Prodromov                                     ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionEngine = exports.PLANS = void 0;
const events_1 = require("events");
const crypto_1 = require("crypto");
exports.PLANS = {
    free: {
        tier: 'free',
        name: 'Free (Open Source)',
        monthlyPriceUSD: 0,
        annualPriceUSD: 0,
        badge: '🆓',
        features: [
            'Open Source Framework access',
            'Basic testing engine (10 tests/mo)',
            'Community support',
            'Bug detection (no auto-healing)',
            'Public dashboard',
        ],
        limits: {
            apiRequestsPerMonth: 500,
            storageGB: 0.5,
            maxUsers: 1,
            maxProjects: 1,
            aiHealingTestsPerMonth: 10,
            maxTargetsPerGodLoop: 0,
            emailOutreachPerDay: 0,
            customWebhooks: false,
            prioritySupport: false,
            whiteLabel: false,
            ssoEnabled: false,
            advancedAnalytics: false,
            marketReeaper: false,
            singularityMode: false,
        },
    },
    starter: {
        tier: 'starter',
        name: 'Starter',
        monthlyPriceUSD: 49,
        annualPriceUSD: 470,
        badge: '🚀',
        features: [
            'Everything in Free',
            'AI-Healing Tests (100/mo)',
            '5,000 API requests/month',
            'Email outreach: 20/day',
            'Self-healing sales reports',
            'Basic analytics',
            'Email support',
        ],
        limits: {
            apiRequestsPerMonth: 5_000,
            storageGB: 5,
            maxUsers: 3,
            maxProjects: 5,
            aiHealingTestsPerMonth: 100,
            maxTargetsPerGodLoop: 10,
            emailOutreachPerDay: 20,
            customWebhooks: false,
            prioritySupport: false,
            whiteLabel: false,
            ssoEnabled: false,
            advancedAnalytics: false,
            marketReeaper: false,
            singularityMode: false,
        },
    },
    pro: {
        tier: 'pro',
        name: 'Pro',
        monthlyPriceUSD: 149,
        annualPriceUSD: 1_430,
        badge: '⚡',
        features: [
            'Everything in Starter',
            'Unlimited AI-Healing Tests',
            '50,000 API requests/month',
            'Email outreach: 200/day',
            'Autonomous Singularity (10 targets/day)',
            'Advanced analytics & A/B testing',
            'Custom webhooks',
            'Priority support (4h SLA)',
            'White-label reports',
            'Market Reaper (paper mode)',
        ],
        limits: {
            apiRequestsPerMonth: 50_000,
            storageGB: 50,
            maxUsers: 15,
            maxProjects: 25,
            aiHealingTestsPerMonth: -1,
            maxTargetsPerGodLoop: 50,
            emailOutreachPerDay: 200,
            customWebhooks: true,
            prioritySupport: true,
            whiteLabel: true,
            ssoEnabled: false,
            advancedAnalytics: true,
            marketReeaper: true,
            singularityMode: false,
        },
    },
    enterprise: {
        tier: 'enterprise',
        name: 'Enterprise',
        monthlyPriceUSD: 499,
        annualPriceUSD: 4_790,
        badge: '👑',
        features: [
            'Everything in Pro',
            'Unlimited everything',
            'QAntum Singularity — Full God Mode',
            'Market Reaper (LIVE trading)',
            'Dedicated infrastructure',
            'SSO & advanced security',
            'Custom integrations',
            'White-glove onboarding',
            '1h SLA + dedicated Slack channel',
            'Custom pricing on volume',
        ],
        limits: {
            apiRequestsPerMonth: -1,
            storageGB: -1,
            maxUsers: -1,
            maxProjects: -1,
            aiHealingTestsPerMonth: -1,
            maxTargetsPerGodLoop: -1,
            emailOutreachPerDay: -1,
            customWebhooks: true,
            prioritySupport: true,
            whiteLabel: true,
            ssoEnabled: true,
            advancedAnalytics: true,
            marketReeaper: true,
            singularityMode: true,
        },
    },
};
// ═══════════════════════════════════════════════════════════════════════════════
// SUBSCRIPTION ENGINE
// ═══════════════════════════════════════════════════════════════════════════════
class SubscriptionEngine extends events_1.EventEmitter {
    subscriptions = new Map();
    invoices = new Map();
    emailIndex = new Map(); // email → subscriptionId
    // ─────────────────────────────────────────────────────────────────────────
    // CRUD
    // ─────────────────────────────────────────────────────────────────────────
    // Complexity: O(1)
    createSubscription(email, tier = 'free', billing = 'monthly', options = {}) {
        // Idempotent — return existing if already provisioned
        const existingId = this.emailIndex.get(email);
        if (existingId) {
            return this.subscriptions.get(existingId);
        }
        const now = new Date();
        const periodEnd = new Date(now);
        billing === 'monthly'
            ? periodEnd.setMonth(periodEnd.getMonth() + 1)
            : periodEnd.setFullYear(periodEnd.getFullYear() + 1);
        const sub = {
            id: `sub_${(0, crypto_1.randomUUID)().replace(/-/g, '').slice(0, 16)}`,
            email,
            tier,
            status: 'active',
            billing,
            createdAt: now,
            currentPeriodStart: now,
            currentPeriodEnd: periodEnd,
            usage: this._freshUsage(now, periodEnd),
            metadata: {},
            ...options,
        };
        this.subscriptions.set(sub.id, sub);
        this.emailIndex.set(email, sub.id);
        this.emit('subscription:created', sub);
        console.log(`[Subscriptions] ✅ Created '${tier}' plan for ${email} (ID: ${sub.id})`);
        // Auto-generate invoice unless free
        if (tier !== 'free') {
            this.generateInvoice(sub);
        }
        return sub;
    }
    // Complexity: O(1) — hash/map lookup
    getByEmail(email) {
        const id = this.emailIndex.get(email);
        return id ? this.subscriptions.get(id) : undefined;
    }
    // Complexity: O(1) — hash/map lookup
    getById(id) {
        return this.subscriptions.get(id);
    }
    // Complexity: O(1) — hash/map lookup
    upgradePlan(subscriptionId, newTier, discountPct = 0) {
        const sub = this.subscriptions.get(subscriptionId);
        if (!sub)
            throw new Error(`Subscription not found: ${subscriptionId}`);
        const oldTier = sub.tier;
        sub.tier = newTier;
        sub.status = 'active';
        this.emit('subscription:upgraded', { sub, oldTier, newTier });
        console.log(`[Subscriptions] ⬆️  ${sub.email} upgraded ${oldTier} → ${newTier}`);
        this.generateInvoice(sub, discountPct);
        return sub;
    }
    // Complexity: O(1) — hash/map lookup
    cancelSubscription(subscriptionId, reason) {
        const sub = this.subscriptions.get(subscriptionId);
        if (!sub)
            return;
        sub.status = 'cancelled';
        sub.cancelledAt = new Date();
        sub.metadata.cancellationReason = reason ?? 'not_specified';
        this.emit('subscription:cancelled', sub);
        console.log(`[Subscriptions] ❌ ${sub.email} cancelled (reason: ${reason ?? 'n/a'})`);
    }
    /** Downgrade to Free and emit event for follow-up email sequence */
    // Complexity: O(1) — hash/map lookup
    suspendForNonPayment(subscriptionId) {
        const sub = this.subscriptions.get(subscriptionId);
        if (!sub)
            return;
        sub.status = 'past_due';
        this.emit('subscription:past_due', sub);
        console.log(`[Subscriptions] ⚠️  ${sub.email} suspended — payment overdue`);
    }
    // ─────────────────────────────────────────────────────────────────────────
    // USAGE TRACKING
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Record API usage. Returns the upsell signal if limits are approaching.
     */
    // Complexity: O(N) — potential recursive descent
    recordApiRequest(subscriptionId, count = 1) {
        const sub = this.subscriptions.get(subscriptionId);
        if (!sub)
            return null;
        sub.usage.apiRequests += count;
        return this._checkLimitsAndUpsell(sub, 'api');
    }
    // Complexity: O(N) — potential recursive descent
    recordAiTest(subscriptionId, count = 1) {
        const sub = this.subscriptions.get(subscriptionId);
        if (!sub)
            return null;
        sub.usage.aiHealingTests += count;
        return this._checkLimitsAndUpsell(sub, 'ai_tests');
    }
    // Complexity: O(N) — potential recursive descent
    recordEmailSent(subscriptionId, count = 1) {
        const sub = this.subscriptions.get(subscriptionId);
        if (!sub)
            return null;
        sub.usage.emailsSentToday += count;
        return this._checkLimitsAndUpsell(sub, 'email');
    }
    // Complexity: O(N) — potential recursive descent
    recordGodLoopTarget(subscriptionId, count = 1) {
        const sub = this.subscriptions.get(subscriptionId);
        if (!sub)
            return null;
        sub.usage.godLoopTargets += count;
        return this._checkLimitsAndUpsell(sub, 'god_loop');
    }
    /**
     * Test if a feature is within plan limits.
     * Returns false if the user has hit their limit.
     */
    // Complexity: O(1) — hash/map lookup
    canUse(subscriptionId, feature) {
        const sub = this.subscriptions.get(subscriptionId);
        if (!sub || sub.status === 'cancelled')
            return false;
        const limits = exports.PLANS[sub.tier].limits;
        const val = limits[feature];
        if (typeof val === 'boolean')
            return val;
        if (val === -1)
            return true; // unlimited
        switch (feature) {
            case 'apiRequestsPerMonth':
                return sub.usage.apiRequests < val;
            case 'aiHealingTestsPerMonth':
                return sub.usage.aiHealingTests < val;
            case 'emailOutreachPerDay':
                return sub.usage.emailsSentToday < val;
            case 'maxTargetsPerGodLoop':
                return sub.usage.godLoopTargets < val;
            default:
                return true;
        }
    }
    // Complexity: O(1) — hash/map lookup
    getUsagePercent(subscriptionId) {
        const sub = this.subscriptions.get(subscriptionId);
        if (!sub)
            return {};
        const limits = exports.PLANS[sub.tier].limits;
        const pct = (used, limit) => limit === -1 ? 0 : Math.min(100, Math.round((used / limit) * 100));
        return {
            apiRequests: pct(sub.usage.apiRequests, limits.apiRequestsPerMonth),
            aiHealingTests: pct(sub.usage.aiHealingTests, limits.aiHealingTestsPerMonth),
            emailOutreach: pct(sub.usage.emailsSentToday, limits.emailOutreachPerDay),
            godLoopTargets: pct(sub.usage.godLoopTargets, limits.maxTargetsPerGodLoop),
        };
    }
    // ─────────────────────────────────────────────────────────────────────────
    // INVOICING
    // ─────────────────────────────────────────────────────────────────────────
    // Complexity: O(1) — hash/map lookup
    generateInvoice(sub, discountPct = 0) {
        const plan = exports.PLANS[sub.tier];
        const baseAmount = sub.billing === 'annual' ? plan.annualPriceUSD : plan.monthlyPriceUSD;
        const amountDue = baseAmount * (1 - discountPct / 100);
        const invoice = {
            id: `inv_${(0, crypto_1.randomUUID)().replace(/-/g, '').slice(0, 16)}`,
            subscriptionId: sub.id,
            email: sub.email,
            tier: sub.tier,
            amountUSD: baseAmount,
            amountDue: parseFloat(amountDue.toFixed(2)),
            discountPct,
            status: 'issued',
            issuedAt: new Date(),
            dueDate: (() => {
                const d = new Date();
                d.setDate(d.getDate() + 14);
                return d;
            })(),
            lineItems: [
                {
                    description: `${plan.name} Plan (${sub.billing})`,
                    quantity: 1,
                    unitPriceUSD: baseAmount,
                    totalUSD: baseAmount,
                },
            ],
        };
        if (discountPct > 0) {
            invoice.lineItems.push({
                description: `Discount (${discountPct}% — automated upsell offer)`,
                quantity: 1,
                unitPriceUSD: -(baseAmount * discountPct / 100),
                totalUSD: -(baseAmount * discountPct / 100),
            });
        }
        this.invoices.set(invoice.id, invoice);
        this.emit('invoice:issued', invoice);
        console.log(`[Subscriptions] 🧾 Invoice issued: ${invoice.id} — $${invoice.amountDue} to ${sub.email}`);
        return invoice;
    }
    // Complexity: O(1) — hash/map lookup
    markInvoicePaid(invoiceId) {
        const inv = this.invoices.get(invoiceId);
        if (!inv)
            return;
        inv.status = 'paid';
        inv.paidAt = new Date();
        const sub = this.subscriptions.get(inv.subscriptionId);
        if (sub) {
            sub.status = 'active';
        }
        this.emit('invoice:paid', inv);
    }
    // Complexity: O(N) — linear iteration
    checkOverdueInvoices() {
        const now = new Date();
        const overdue = [];
        for (const inv of this.invoices.values()) {
            if (inv.status === 'issued' && inv.dueDate < now) {
                inv.status = 'overdue';
                overdue.push(inv);
                this.suspendForNonPayment(inv.subscriptionId);
                this.emit('invoice:overdue', inv);
            }
        }
        return overdue;
    }
    // Complexity: O(N) — linear iteration
    getInvoicesByEmail(email) {
        return Array.from(this.invoices.values()).filter(i => i.email === email);
    }
    // ─────────────────────────────────────────────────────────────────────────
    // STATS
    // ─────────────────────────────────────────────────────────────────────────
    // Complexity: O(N) — linear iteration
    getMRR() {
        let mrr = 0;
        for (const sub of this.subscriptions.values()) {
            if (sub.status !== 'active')
                continue;
            const plan = exports.PLANS[sub.tier];
            mrr += sub.billing === 'annual'
                ? plan.annualPriceUSD / 12
                : plan.monthlyPriceUSD;
        }
        return parseFloat(mrr.toFixed(2));
    }
    // Complexity: O(N) — linear iteration
    getStats() {
        const subs = Array.from(this.subscriptions.values());
        const byTier = { free: 0, starter: 0, pro: 0, enterprise: 0 };
        for (const s of subs)
            byTier[s.tier]++;
        return {
            total: subs.length,
            active: subs.filter(s => s.status === 'active').length,
            byTier,
            mrr: this.getMRR(),
            shadowProvisioned: subs.filter(s => s.shadowProvisioned).length,
        };
    }
    // ─────────────────────────────────────────────────────────────────────────
    // PRIVATE
    // ─────────────────────────────────────────────────────────────────────────
    // Complexity: O(1) — amortized
    _checkLimitsAndUpsell(sub, trigger) {
        const usagePct = this.getUsagePercent(sub.id);
        const tierOrder = ['free', 'starter', 'pro', 'enterprise'];
        const currentIdx = tierOrder.indexOf(sub.tier);
        const nextTier = tierOrder[currentIdx + 1];
        if (!nextTier)
            return null; // already on enterprise
        const maxPct = Math.max(...Object.values(usagePct));
        let urgency = null;
        let discountOffer;
        if (maxPct >= 100) {
            urgency = 'critical';
            discountOffer = 10;
        }
        else if (maxPct >= 90) {
            urgency = 'high';
            discountOffer = 20;
        }
        else if (maxPct >= 75) {
            urgency = 'medium';
        }
        else if (maxPct >= 50) {
            urgency = 'low';
        }
        if (!urgency)
            return null;
        const signal = {
            subscriptionId: sub.id,
            email: sub.email,
            currentTier: sub.tier,
            suggestedTier: nextTier,
            reason: this._upsellMessage(sub, trigger, maxPct, nextTier),
            urgency,
            discountOffer,
            triggeredAt: new Date(),
        };
        this.emit('upsell:signal', signal);
        return signal;
    }
    // Complexity: O(N*M) — nested iteration detected
    _upsellMessage(sub, trigger, pct, next) {
        const nextPlan = exports.PLANS[next];
        const msgs = {
            api: `You've used ${pct}% of your monthly API requests. Upgrade to ${nextPlan.name} for ${nextPlan.limits.apiRequestsPerMonth === -1 ? 'unlimited' : nextPlan.limits.apiRequestsPerMonth.toLocaleString()} requests.`,
            ai_tests: `You've used ${pct}% of your AI healing tests. Upgrade to ${nextPlan.name} for unlimited tests.`,
            email: `Email outreach at ${pct}% capacity. Upgrade to ${nextPlan.name} for ${nextPlan.limits.emailOutreachPerDay === -1 ? 'unlimited' : nextPlan.limits.emailOutreachPerDay} emails/day.`,
            god_loop: `Singularity target limit reached (${pct}%). Upgrade to ${nextPlan.name} to expand to ${nextPlan.limits.maxTargetsPerGodLoop === -1 ? 'unlimited' : nextPlan.limits.maxTargetsPerGodLoop} targets/day.`,
        };
        return msgs[trigger] ?? `Usage at ${pct}%. Consider upgrading to ${nextPlan.name}.`;
    }
    // Complexity: O(1)
    _freshUsage(start, end) {
        return {
            apiRequests: 0,
            storageGB: 0,
            aiHealingTests: 0,
            emailsSentToday: 0,
            godLoopTargets: 0,
            periodStart: start,
            periodEnd: end,
        };
    }
}
exports.SubscriptionEngine = SubscriptionEngine;
