/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║   QANTUM SAAS — UNIFIED MODULE ENTRY POINT                                   ║
 * ║   "The Infinite Revenue Loop"                                                 ║
 * ║                                                                               ║
 * ║   Assembles:                                                                  ║
 * ║   • SubscriptionEngine — Plans, Limits, Invoices, Auto-Upsell                ║
 * ║   • FeatureFlagEngine  — A/B Testing, Plan Gates, VIP Overrides             ║
 * ║   • TelemetryEngine    — Analytics, Behavior Profiles, Churn Detection      ║
 * ║                                                                               ║
 * ║   The SaaS class wires them together so Singularity can call               ║
 * ║   a single .saasEngine reference for everything.                             ║
 * ║                                                                               ║
 * ║   © 2025-2026 QAntum | Dimitar Prodromov                                     ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

export { SubscriptionEngine, PLANS, PlanTier, BillingCycle, Subscription, Invoice, UpsellSignal, InvoiceStatus, SubscriptionStatus } from './subscription';
export { FeatureFlagEngine, FeatureFlag, FlagStatus, ABVariant, ABTestResult, FlagEvaluation } from './feature-flags';
export { TelemetryEngine, TelemetryEvent, EventCategory, UserSession, UserBehaviorProfile, TelemetryReport } from './telemetry';

import { SubscriptionEngine } from './subscription';
import { FeatureFlagEngine } from './feature-flags';
import { TelemetryEngine } from './telemetry';
import { PlanTier, UpsellSignal, Subscription } from './subscription';

// ═══════════════════════════════════════════════════════════════════════════════
// UNIFIED SAAS FACADE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * SaaS — the single class imported by QAntumSingularity.
 * 
 * Exposes all three engines AND handles the cross-engine wiring:
 *  - When subscription is upgraded → feature flags update user plan
 *  - When upsell signal fires → telemetry records it
 *  - When subscription is past_due → feature flags revoke premium access
 *  - When telemetry detects churn risk → emit 'churn_alert' for email campaigns
 */
export class SaaS {
    public readonly subscriptions: SubscriptionEngine;
    public readonly flags: FeatureFlagEngine;
    public readonly telemetry: TelemetryEngine;

    constructor() {
        this.subscriptions = new SubscriptionEngine();
        this.flags = new FeatureFlagEngine();
        this.telemetry = new TelemetryEngine();

        this._wireEngines();
        console.log('[SaaS] 🏗️  QAntum SaaS Module online — Revenue loop armed.');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // CONVENIENCE METHODS (High-level APIs for Singularity)
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Shadow provision: called by Singularity when it finds a new prospect.
     * Creates a Free subscription and returns the magic activation link.
     */
    // Complexity: O(1) — hash/map lookup
    shadowProvision(email: string, companyName?: string): { subscription: Subscription; magicLink: string } {
        const sub = this.subscriptions.createSubscription(email, 'free', 'monthly', {
            companyName,
            shadowProvisioned: true,
        });

        const magicLink = `https://qantum.empire/activate?token=${sub.id}&email=${encodeURIComponent(email)}`;

        this.telemetry.track({
            name: 'shadow_provisioned',
            category: 'onboarding',
            userId: email,
            subscriptionId: sub.id,
            properties: { companyName, source: 'singularity_god_loop' },
        });

        this.telemetry.trackFunnelStep(email, 'shadow_provisioned', { companyName });

        console.log(`[SaaS] 🎁 Shadow provisioned: ${email} → ${magicLink}`);
        return { subscription: sub, magicLink };
    }

    /**
     * Check if a user can access a feature. Combines plan gates + feature flags.
     * Returns detailed info for building personalized upgrade prompts.
     */
    // Complexity: O(1) — amortized
    canAccess(email: string, feature: string): {
        allowed: boolean;
        reason: string;
        upgradeTarget?: PlanTier;
        upgradeUrl?: string;
    } {
        const sub = this.subscriptions.getByEmail(email);
        const userPlan = sub?.tier ?? 'free';

        const evaluation = this.flags.evaluate(feature, email, userPlan);

        if (evaluation.enabled) {
            return { allowed: true, reason: 'authorized' };
        }

        const flag = this.flags.getFlag(feature);
        const requiredPlan = flag?.requiredPlan ?? 'pro';

        return {
            allowed: false,
            reason: evaluation.reason,
            upgradeTarget: requiredPlan,
            upgradeUrl: `https://qantum.empire/upgrade?plan=${requiredPlan}&from=${email}`,
        };
    }

    /**
     * Record API usage for a user and return an upsell signal if they're hitting limits.
     * Singularity calls this after every API call to auto-trigger upgrade emails.
     */
    // Complexity: O(1) — amortized
    recordUsage(
        email: string,
        type: 'api' | 'ai_test' | 'email' | 'god_loop_target'
    ): UpsellSignal | null {
        const sub = this.subscriptions.getByEmail(email);
        if (!sub) return null;

        let signal: UpsellSignal | null = null;
        switch (type) {
            case 'api':              signal = this.subscriptions.recordApiRequest(sub.id);     break;
            case 'ai_test':          signal = this.subscriptions.recordAiTest(sub.id);         break;
            case 'email':            signal = this.subscriptions.recordEmailSent(sub.id);      break;
            case 'god_loop_target':  signal = this.subscriptions.recordGodLoopTarget(sub.id);  break;
        }

        this.telemetry.track({
            name: `usage_${type}`,
            category: 'feature',
            userId: email,
            subscriptionId: sub.id,
            properties: { type, plan: sub.tier },
        });

        return signal;
    }

    /**
     * Get a full dashboard snapshot for the admin panel.
     */
    // Complexity: O(N) — linear iteration
    getDashboard() {
        const subStats = this.subscriptions.getStats();
        const telemetryReport = this.telemetry.generateReport();
        const flags = this.flags.listFlags().map(f => ({
            key: f.key,
            name: f.name,
            status: f.status,
            requiredPlan: f.requiredPlan,
            vipCount: f.vipOverrides.size,
            blocklistCount: f.blocklist.size,
        }));

        return {
            subscriptions: subStats,
            telemetry: {
                totalEvents: telemetryReport.totalEvents,
                uniqueUsers: telemetryReport.uniqueUsers,
                errorRate: telemetryReport.errorRate,
                avgSessionMin: Math.round(telemetryReport.avgSessionDurationMs / 60_000),
                funnel: telemetryReport.funnel,
                topFeatures: telemetryReport.topFeatures,
                upsellReady: telemetryReport.revenueSignals.upsellReadyUsers.length,
                atChurnRisk: telemetryReport.revenueSignals.churnRiskUsers.length,
            },
            flags,
        };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PRIVATE: Cross-engine wiring
    // ─────────────────────────────────────────────────────────────────────────

    // Complexity: O(1) — amortized
    private _wireEngines(): void {
        // 1. Subscription upgraded → update feature flag plan cache
        this.subscriptions.on('subscription:upgraded', ({ sub, newTier }: { sub: Subscription; newTier: PlanTier }) => {
            this.flags.setUserPlan(sub.email, newTier);
            this.telemetry.track({
                name: 'subscription_upgraded',
                category: 'billing',
                userId: sub.email,
                subscriptionId: sub.id,
                properties: { from: sub.tier, to: newTier },
            });
            this.telemetry.trackFunnelStep(sub.email, 'upgrade', { from: sub.tier, to: newTier });
        });

        // 2. Subscription created → seed plan in feature flags + telemetry
        this.subscriptions.on('subscription:created', (sub: Subscription) => {
            this.flags.setUserPlan(sub.email, sub.tier);
            this.telemetry.trackFunnelStep(sub.email, sub.shadowProvisioned ? 'shadow_provisioned' : 'signup');
        });

        // 3. Past due / cancelled → revoke premium flags
        this.subscriptions.on('subscription:past_due', (sub: Subscription) => {
            this.flags.revokeUserAccess(sub.email);
            this.telemetry.track({
                name: 'subscription_past_due',
                category: 'billing',
                userId: sub.email,
                subscriptionId: sub.id,
                properties: {},
            });
        });

        this.subscriptions.on('subscription:cancelled', (sub: Subscription) => {
            this.flags.revokeUserAccess(sub.email);
            this.telemetry.trackFunnelStep(sub.email, 'churn', { reason: sub.metadata?.cancellationReason });
        });

        // 4. Upsell signal → track it in telemetry
        this.subscriptions.on('upsell:signal', (signal: UpsellSignal) => {
            this.telemetry.track({
                name: 'upsell_signal_fired',
                category: 'conversion',
                userId: signal.email,
                subscriptionId: signal.subscriptionId,
                properties: {
                    urgency: signal.urgency,
                    currentTier: signal.currentTier,
                    suggestedTier: signal.suggestedTier,
                    discountOffer: signal.discountOffer,
                    reason: signal.reason,
                },
            });
        });

        // 5. Invoice paid → track conversion
        this.subscriptions.on('invoice:paid', (invoice: any) => {
            this.telemetry.track({
                name: 'invoice_paid',
                category: 'billing',
                userId: invoice.email,
                subscriptionId: invoice.subscriptionId,
                properties: { amount: invoice.amountDue, tier: invoice.tier },
            });
            this.telemetry.trackFunnelStep(invoice.email, 'payment', { amount: invoice.amountDue });
        });
    }
}
