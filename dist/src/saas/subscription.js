"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                               ║
 * ║   QAntum SUBSCRIPTION ENGINE                                                  ║
 * ║   "Free → Starter → Pro → Enterprise. Automatic. Ruthless."                  ║
 * ║                                                                               ║
 * ║   TODO B #48 - SaaS: Subscription Engine                                     ║
 * ║                                                                               ║
 * ║   © 2025-2026 QAntum | Dimitar Prodromov                                     ║
 * ║                                                                               ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionService = exports.PLANS = void 0;
exports.getSubscriptions = getSubscriptions;
const crypto_1 = require("crypto");
// ═══════════════════════════════════════════════════════════════════════════════
// PLAN DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════════
exports.PLANS = [
    {
        id: 'plan_free',
        tier: 'free',
        name: 'Free',
        badge: '🆓',
        description: 'Core framework, community support, MIT licensed forever.',
        monthlyPrice: 0,
        annualPrice: 0,
        limits: {
            projects: 1,
            users: 1,
            testsPerMonth: 10,
            apiCallsPerDay: 500,
            emailsPerDay: 0,
            singularityTargetsPerDay: 0,
            storageBytes: 100 * 1024 * 1024, // 100MB
        },
        features: [
            { key: 'self_healing_tests', name: 'AI Self-Healing Tests', included: true, limit: 10 },
            { key: 'bug_detection', name: 'Bug Detection', included: true },
            { key: 'community_support', name: 'Community Support', included: true },
            { key: 'sales_automation', name: 'Sales Automation', included: false },
            { key: 'market_reaper', name: 'Market Reaper', included: false },
            { key: 'singularity', name: 'QAntum Singularity', included: false },
            { key: 'cloudflare_bypass', name: 'Cloudflare Bypass Engine', included: false },
            { key: 'ab_testing', name: 'A/B Testing', included: false },
            { key: 'white_label', name: 'White-Label Reports', included: false },
            { key: 'live_trading', name: 'Live Trading', included: false },
        ],
        checkoutUrl: '',
    },
    {
        id: 'plan_starter',
        tier: 'starter',
        name: 'Starter',
        badge: '🚀',
        description: 'For solo devs and small teams ready to automate sales.',
        monthlyPrice: 4900, // $49
        annualPrice: 3916, // $470/yr = ~$39.16/mo
        limits: {
            projects: 5,
            users: 3,
            testsPerMonth: 100,
            apiCallsPerDay: 5000,
            emailsPerDay: 20,
            singularityTargetsPerDay: 0,
            storageBytes: 1024 * 1024 * 1024, // 1GB
        },
        features: [
            { key: 'self_healing_tests', name: 'AI Self-Healing Tests', included: true, limit: 100 },
            { key: 'bug_detection', name: 'Bug Detection', included: true },
            { key: 'community_support', name: 'Community Support', included: true },
            { key: 'sales_automation', name: 'Sales Automation (20 emails/day)', included: true },
            { key: 'self_healing_reports', name: 'Self-Healing Sales Reports', included: true },
            { key: 'basic_analytics', name: 'Basic Analytics', included: true },
            { key: 'market_reaper', name: 'Market Reaper', included: false },
            { key: 'singularity', name: 'QAntum Singularity', included: false },
            { key: 'cloudflare_bypass', name: 'Cloudflare Bypass Engine', included: false },
            { key: 'ab_testing', name: 'A/B Testing', included: false },
            { key: 'white_label', name: 'White-Label Reports', included: false },
            { key: 'live_trading', name: 'Live Trading', included: false },
        ],
        stripePriceIdMonthly: 'price_starter_monthly',
        stripePriceIdAnnual: 'price_starter_annual',
        checkoutUrl: 'https://QAntum.empire/checkout?plan=starter',
    },
    {
        id: 'plan_pro',
        tier: 'pro',
        name: 'Pro',
        badge: '⚡',
        description: 'Unlimited tests, full Singularity, Market Reaper paper mode.',
        monthlyPrice: 14900, // $149
        annualPrice: 11916, // $1,430/yr = ~$119.16/mo
        limits: {
            projects: 25,
            users: 15,
            testsPerMonth: -1, // unlimited
            apiCallsPerDay: 50000,
            emailsPerDay: 200,
            singularityTargetsPerDay: 50,
            storageBytes: 10 * 1024 * 1024 * 1024, // 10GB
        },
        features: [
            { key: 'self_healing_tests', name: 'UNLIMITED AI Self-Healing Tests', included: true },
            { key: 'bug_detection', name: 'Bug Detection', included: true },
            { key: 'priority_support', name: 'Priority Support (4h SLA)', included: true },
            { key: 'sales_automation', name: 'Sales Automation (200 emails/day)', included: true },
            { key: 'singularity', name: 'Singularity God Loop (50 targets/day)', included: true },
            { key: 'advanced_analytics', name: 'Advanced Analytics + A/B Testing', included: true },
            { key: 'market_reaper', name: 'Market Reaper (paper mode)', included: true },
            { key: 'custom_webhooks', name: 'Custom Webhooks', included: true },
            { key: 'white_label', name: 'White-Label Reports', included: true },
            { key: 'ab_testing', name: 'A/B Testing', included: true },
            { key: 'cloudflare_bypass', name: 'Cloudflare Bypass Engine', included: false },
            { key: 'live_trading', name: 'Live Trading', included: false },
        ],
        stripePriceIdMonthly: 'price_pro_monthly',
        stripePriceIdAnnual: 'price_pro_annual',
        checkoutUrl: 'https://QAntum.empire/checkout?plan=pro',
    },
    {
        id: 'plan_enterprise',
        tier: 'enterprise',
        name: 'Enterprise',
        badge: '👑',
        description: 'Everything unlimited. God Mode. Live trading. White-glove.',
        monthlyPrice: 49900, // $499
        annualPrice: 39916, // $4,790/yr = ~$399.16/mo
        limits: {
            projects: -1,
            users: -1,
            testsPerMonth: -1,
            apiCallsPerDay: -1,
            emailsPerDay: -1,
            singularityTargetsPerDay: -1,
            storageBytes: -1,
        },
        features: [
            { key: 'self_healing_tests', name: 'EVERYTHING UNLIMITED', included: true },
            { key: 'singularity', name: 'QAntum Singularity — Full God Mode', included: true },
            { key: 'market_reaper', name: 'Market Reaper (LIVE trading)', included: true },
            { key: 'cloudflare_bypass', name: 'Cloudflare Bypass Engine', included: true },
            { key: 'sso', name: 'SSO + Advanced Security', included: true },
            { key: 'dedicated_infra', name: 'Dedicated Infrastructure', included: true },
            { key: 'white_glove', name: 'White-Glove Onboarding', included: true },
            { key: 'priority_support', name: '1h SLA + Dedicated Slack', included: true },
            { key: 'custom_integrations', name: 'Custom Integrations + NDA', included: true },
            { key: 'live_trading', name: 'Live Trading', included: true },
        ],
        stripePriceIdMonthly: 'price_enterprise_monthly',
        stripePriceIdAnnual: 'price_enterprise_annual',
        checkoutUrl: 'https://QAntum.empire/checkout?plan=enterprise',
    },
];
// ═══════════════════════════════════════════════════════════════════════════════
// SUBSCRIPTION SERVICE
// ═══════════════════════════════════════════════════════════════════════════════
class SubscriptionService {
    static instance;
    // In-memory stores (replace with DB in production)
    subscriptions = new Map();
    usageMap = new Map();
    invoices = new Map();
    constructor() { }
    static getInstance() {
        if (!SubscriptionService.instance) {
            SubscriptionService.instance = new SubscriptionService();
        }
        return SubscriptionService.instance;
    }
    // ─────────────────────────────────────────────────────────────────────────────
    // PLAN OPERATIONS
    // ─────────────────────────────────────────────────────────────────────────────
    // Complexity: O(N) — linear scan
    getPlanByTier(tier) {
        return exports.PLANS.find(p => p.tier === tier);
    }
    // Complexity: O(N) — linear scan
    getPlanById(planId) {
        return exports.PLANS.find(p => p.id === planId);
    }
    // Complexity: O(1)
    getAllPlans() {
        return exports.PLANS;
    }
    // ─────────────────────────────────────────────────────────────────────────────
    // SUBSCRIPTION CRUD
    // ─────────────────────────────────────────────────────────────────────────────
    // Complexity: O(1) — lookup
    create(userId, planId, billingCycle = 'monthly', metadata) {
        const plan = this.getPlanById(planId);
        if (!plan)
            throw new Error(`Plan not found: ${planId}`);
        const now = new Date();
        const periodEnd = new Date(now);
        if (billingCycle === 'monthly') {
            periodEnd.setMonth(periodEnd.getMonth() + 1);
        }
        else {
            periodEnd.setFullYear(periodEnd.getFullYear() + 1);
        }
        const subscription = {
            id: `sub_${this.generateId()}`,
            userId,
            planId,
            tier: plan.tier,
            billingCycle,
            status: plan.tier === 'free' ? 'active' : 'trialing',
            trialEndsAt: plan.tier !== 'free' ? this.addDays(now, 14).toISOString() : undefined,
            currentPeriodStart: now.toISOString(),
            currentPeriodEnd: periodEnd.toISOString(),
            cancelAtPeriodEnd: false,
            metadata,
            createdAt: now.toISOString(),
            updatedAt: now.toISOString(),
        };
        this.subscriptions.set(subscription.id, subscription);
        this.initUsage(subscription.id);
        return subscription;
    }
    // Complexity: O(1) — lookup
    get(subscriptionId) {
        return this.subscriptions.get(subscriptionId);
    }
    // Complexity: O(N) — loop
    getByUserId(userId) {
        for (const sub of this.subscriptions.values()) {
            if (sub.userId === userId && sub.status !== 'canceled') {
                return sub;
            }
        }
        return undefined;
    }
    // Complexity: O(1) — lookup
    update(subscriptionId, updates) {
        const sub = this.subscriptions.get(subscriptionId);
        if (!sub)
            throw new Error(`Subscription not found: ${subscriptionId}`);
        const updated = {
            ...sub,
            ...updates,
            id: sub.id, // immutable
            userId: sub.userId, // immutable
            updatedAt: new Date().toISOString(),
        };
        this.subscriptions.set(subscriptionId, updated);
        return updated;
    }
    // Complexity: O(1) — lookup
    cancel(subscriptionId, immediately = false) {
        const sub = this.subscriptions.get(subscriptionId);
        if (!sub)
            throw new Error(`Subscription not found: ${subscriptionId}`);
        if (immediately) {
            return this.update(subscriptionId, { status: 'canceled' });
        }
        return this.update(subscriptionId, { cancelAtPeriodEnd: true });
    }
    // Complexity: O(N)
    upgrade(subscriptionId, newTier, billingCycle) {
        const sub = this.subscriptions.get(subscriptionId);
        if (!sub)
            throw new Error(`Subscription not found: ${subscriptionId}`);
        const newPlan = this.getPlanByTier(newTier);
        if (!newPlan)
            throw new Error(`Plan not found for tier: ${newTier}`);
        return this.update(subscriptionId, {
            planId: newPlan.id,
            tier: newTier,
            billingCycle: billingCycle || sub.billingCycle,
            status: 'active',
        });
    }
    // Complexity: O(1)
    getAll() {
        return Array.from(this.subscriptions.values());
    }
    // ─────────────────────────────────────────────────────────────────────────────
    // USAGE TRACKING
    // ─────────────────────────────────────────────────────────────────────────────
    // Complexity: O(1) — lookup
    initUsage(subscriptionId) {
        const period = this.currentPeriod();
        const key = `${subscriptionId}:${period}`;
        if (!this.usageMap.has(key)) {
            this.usageMap.set(key, {
                subscriptionId,
                period,
                projects: 0,
                users: 0,
                tests: 0,
                storageBytes: 0,
                apiCalls: 0,
                emailsSent: 0,
                singularityRuns: 0,
                updatedAt: new Date().toISOString(),
            });
        }
    }
    // Complexity: O(1) — lookup
    getUsage(subscriptionId, period) {
        const p = period || this.currentPeriod();
        const key = `${subscriptionId}:${p}`;
        if (!this.usageMap.has(key)) {
            this.initUsage(subscriptionId);
        }
        return this.usageMap.get(key);
    }
    // Complexity: O(1) — lookup
    recordUsage(subscriptionId, metric, amount = 1) {
        const usage = this.getUsage(subscriptionId);
        const key = `${subscriptionId}:${usage.period}`;
        const updated = { ...usage };
        updated[metric] = (updated[metric] || 0) + amount;
        updated.updatedAt = new Date().toISOString();
        this.usageMap.set(key, updated);
    }
    // ─────────────────────────────────────────────────────────────────────────────
    // LIMIT CHECKING
    // ─────────────────────────────────────────────────────────────────────────────
    // Complexity: O(1) — lookup
    checkLimit(subscriptionId, action) {
        const sub = this.subscriptions.get(subscriptionId);
        if (!sub) {
            return { allowed: false, current: 0, limit: 0, percentUsed: 100, nearLimit: true, atLimit: true };
        }
        const plan = this.getPlanById(sub.planId);
        if (!plan) {
            return { allowed: false, current: 0, limit: 0, percentUsed: 100, nearLimit: true, atLimit: true };
        }
        const usage = this.getUsage(subscriptionId);
        const limitMap = {
            projects: { limit: plan.limits.projects, current: usage.projects },
            users: { limit: plan.limits.users, current: usage.users },
            testsPerMonth: { limit: plan.limits.testsPerMonth, current: usage.tests },
            apiCallsPerDay: { limit: plan.limits.apiCallsPerDay, current: usage.apiCalls },
            emailsPerDay: { limit: plan.limits.emailsPerDay, current: usage.emailsSent },
            singularityTargetsPerDay: { limit: plan.limits.singularityTargetsPerDay, current: usage.singularityRuns },
        };
        const { limit, current } = limitMap[action] || { limit: 0, current: 0 };
        // -1 = unlimited
        if (limit === -1) {
            return { allowed: true, current, limit: -1, percentUsed: 0, nearLimit: false, atLimit: false };
        }
        const percentUsed = limit > 0 ? (current / limit) * 100 : 100;
        const atLimit = current >= limit;
        const nearLimit = percentUsed >= 80;
        return {
            allowed: !atLimit,
            current,
            limit,
            percentUsed: Math.round(percentUsed),
            nearLimit,
            atLimit,
        };
    }
    // Complexity: O(N) — linear scan
    isFeatureUnlocked(subscriptionId, featureKey) {
        const sub = this.subscriptions.get(subscriptionId);
        if (!sub)
            return false;
        const plan = this.getPlanById(sub.planId);
        if (!plan)
            return false;
        const feature = plan.features.find(f => f.key === featureKey);
        return feature?.included ?? false;
    }
    // ─────────────────────────────────────────────────────────────────────────────
    // INVOICING
    // ─────────────────────────────────────────────────────────────────────────────
    // Complexity: O(1) — lookup
    generateInvoice(subscriptionId) {
        const sub = this.subscriptions.get(subscriptionId);
        if (!sub)
            throw new Error(`Subscription not found: ${subscriptionId}`);
        const plan = this.getPlanById(sub.planId);
        if (!plan)
            throw new Error(`Plan not found: ${sub.planId}`);
        const now = new Date();
        const amount = sub.billingCycle === 'monthly' ? plan.monthlyPrice : plan.annualPrice;
        const invoice = {
            id: `inv_${this.generateId()}`,
            subscriptionId,
            userId: sub.userId,
            status: 'open',
            amount,
            currency: 'usd',
            period: this.currentPeriod(),
            items: [
                {
                    description: `QAntum ${plan.name} — ${sub.billingCycle === 'monthly' ? 'Monthly' : 'Annual'} Subscription`,
                    amount,
                    quantity: 1,
                },
            ],
            dueDate: this.addDays(now, 7).toISOString(),
            createdAt: now.toISOString(),
        };
        this.invoices.set(invoice.id, invoice);
        return invoice;
    }
    // Complexity: O(1) — lookup
    markInvoicePaid(invoiceId, stripeInvoiceId) {
        const invoice = this.invoices.get(invoiceId);
        if (!invoice)
            throw new Error(`Invoice not found: ${invoiceId}`);
        const updated = {
            ...invoice,
            status: 'paid',
            paidAt: new Date().toISOString(),
            stripeInvoiceId,
        };
        this.invoices.set(invoiceId, updated);
        return updated;
    }
    // Complexity: O(N) — linear scan
    getInvoicesBySubscription(subscriptionId) {
        return Array.from(this.invoices.values()).filter(i => i.subscriptionId === subscriptionId);
    }
    // ─────────────────────────────────────────────────────────────────────────────
    // CHURN DETECTION (feeds into telemetry)
    // ─────────────────────────────────────────────────────────────────────────────
    /**
     * Returns 0-100 churn risk score.
     * High score = likely to cancel.
     */
    // Complexity: O(1) — lookup
    calculateChurnRisk(subscriptionId) {
        const sub = this.subscriptions.get(subscriptionId);
        if (!sub)
            return 100;
        let risk = 0;
        // Past due
        if (sub.status === 'past_due')
            risk += 40;
        // Cancel at period end
        if (sub.cancelAtPeriodEnd)
            risk += 50;
        // Low usage
        const usage = this.getUsage(subscriptionId);
        const plan = this.getPlanById(sub.planId);
        if (plan && plan.limits.testsPerMonth > 0) {
            const testUsageRatio = usage.tests / plan.limits.testsPerMonth;
            if (testUsageRatio < 0.1)
                risk += 20; // Using < 10% of tests
            if (testUsageRatio < 0.3)
                risk += 10;
        }
        // Trial ending soon
        if (sub.trialEndsAt) {
            const trialEnd = new Date(sub.trialEndsAt);
            const daysLeft = (trialEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
            if (daysLeft <= 3)
                risk += 20;
        }
        return Math.min(100, risk);
    }
    /**
     * Returns 0-100 upsell readiness score.
     * High score = ready to upgrade.
     */
    // Complexity: O(N) — loop
    calculateUpsellReadiness(subscriptionId) {
        const sub = this.subscriptions.get(subscriptionId);
        if (!sub || sub.tier === 'enterprise')
            return 0;
        let score = 0;
        // Check limit usage
        const limitActions = ['testsPerMonth', 'apiCallsPerDay', 'emailsPerDay'];
        for (const action of limitActions) {
            const result = this.checkLimit(subscriptionId, action);
            if (result.atLimit)
                score += 30;
            else if (result.nearLimit)
                score += 15;
        }
        // Active usage (been checking limits = engaged user)
        const usage = this.getUsage(subscriptionId);
        if (usage.tests > 5)
            score += 10;
        if (usage.apiCalls > 100)
            score += 10;
        return Math.min(100, score);
    }
    // ─────────────────────────────────────────────────────────────────────────────
    // HELPERS
    // ─────────────────────────────────────────────────────────────────────────────
    // Complexity: O(1)
    generateId() {
        return (0, crypto_1.createHash)('sha256')
            .update(`${Date.now()}${Math.random()}`)
            .digest('hex')
            .slice(0, 16);
    }
    // Complexity: O(1)
    currentPeriod() {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    }
    // Complexity: O(1)
    addDays(date, days) {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }
}
exports.SubscriptionService = SubscriptionService;
// ═══════════════════════════════════════════════════════════════════════════════
// SINGLETON FACTORY
// ═══════════════════════════════════════════════════════════════════════════════
function getSubscriptions() {
    return SubscriptionService.getInstance();
}
exports.default = SubscriptionService;
