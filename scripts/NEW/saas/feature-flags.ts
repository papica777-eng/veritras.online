/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║   QANTUM SAAS — FEATURE FLAGS ENGINE                                          ║
 * ║   "Dynamic Control. A/B Testing. Surgical Access."                            ║
 * ║                                                                               ║
 * ║   Capabilities:                                                               ║
 * ║   • Toggle features on/off globally or per-user/company                      ║
 * ║   • Roll out to X% of users (gradual deployment)                             ║
 * ║   • A/B test different offers, pricing, or feature sets                      ║
 * ║   • VIP overrides (specific users always get feature)                        ║
 * ║   • Plan-gated features (only Pro+ users)                                    ║
 * ║   • Automatic kill-switch for non-paying users                               ║
 * ║                                                                               ║
 * ║   © 2025-2026 QAntum | Dimitar Prodromov                                     ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

import { EventEmitter } from 'events';
import { createHash } from 'crypto';
import { PlanTier } from './subscription';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type FlagStatus = 'on' | 'off' | 'gradual' | 'ab_test';

export interface FeatureFlag {
    key: string;
    name: string;
    description: string;
    status: FlagStatus;
    /** 0-100: percentage of users who see this (only when status='gradual' or 'ab_test') */
    rolloutPercent: number;
    /** Minimum plan required to access this feature */
    requiredPlan: PlanTier;
    /** Specific user emails that always get this feature regardless of rules */
    vipOverrides: Set<string>;
    /** Specific user emails explicitly blocked from this feature */
    blocklist: Set<string>;
    /** A/B test variant mapping — key: variant name, value: cohort description */
    variants?: Record<string, ABVariant>;
    /** The active variant being tested (for ab_test flags) */
    activeVariant?: string;
    createdAt: Date;
    updatedAt: Date;
    metadata: Record<string, any>;
}

export interface ABVariant {
    name: string;
    description: string;
    /** 0-100 weight for this variant. Weights should sum to 100. */
    weight: number;
    payload?: Record<string, any>;
}

export interface FlagEvaluation {
    flagKey: string;
    userId: string;
    enabled: boolean;
    variant?: string;
    reason: 'enabled' | 'disabled' | 'plan_gate' | 'rollout_miss' | 'blocklist' | 'vip_override' | 'ab_test';
}

export interface ABTestResult {
    flagKey: string;
    variantName: string;
    impressions: number;
    conversions: number;
    conversionRate: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// FEATURE FLAG ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

export class FeatureFlagEngine extends EventEmitter {
    private flags: Map<string, FeatureFlag> = new Map();
    private userPlanCache: Map<string, PlanTier> = new Map();
    private abStats: Map<string, Map<string, { impressions: number; conversions: number }>> = new Map();

    constructor() {
        super();
        this._seedDefaultFlags();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // FLAG MANAGEMENT
    // ─────────────────────────────────────────────────────────────────────────

    // Complexity: O(1) — hash/map lookup
    create(config: Partial<FeatureFlag> & { key: string; name: string }): FeatureFlag {
        const flag: FeatureFlag = {
            key: config.key,
            name: config.name,
            description: config.description ?? '',
            status: config.status ?? 'off',
            rolloutPercent: config.rolloutPercent ?? 100,
            requiredPlan: config.requiredPlan ?? 'free',
            vipOverrides: config.vipOverrides ?? new Set(),
            blocklist: config.blocklist ?? new Set(),
            variants: config.variants,
            activeVariant: config.activeVariant,
            createdAt: new Date(),
            updatedAt: new Date(),
            metadata: config.metadata ?? {},
        };

        this.flags.set(flag.key, flag);
        this.emit('flag:created', flag);
        return flag;
    }

    // Complexity: O(1) — hash/map lookup
    enable(key: string): void {
        const flag = this._getOrThrow(key);
        flag.status = 'on';
        flag.updatedAt = new Date();
        this.emit('flag:updated', { key, change: 'enabled' });
        console.log(`[FeatureFlags] ✅ '${key}' ENABLED globally`);
    }

    // Complexity: O(1) — hash/map lookup
    disable(key: string): void {
        const flag = this._getOrThrow(key);
        flag.status = 'off';
        flag.updatedAt = new Date();
        this.emit('flag:updated', { key, change: 'disabled' });
        console.log(`[FeatureFlags] 🔴 '${key}' DISABLED globally`);
    }

    /**
     * Roll out a feature to X% of users.
     * Uses deterministic hashing so the same user always gets the same answer.
     */
    // Complexity: O(1) — hash/map lookup
    gradualRollout(key: string, percent: number): void {
        if (percent < 0 || percent > 100) throw new Error('Percent must be 0-100');
        const flag = this._getOrThrow(key);
        flag.status = 'gradual';
        flag.rolloutPercent = percent;
        flag.updatedAt = new Date();
        this.emit('flag:updated', { key, change: `gradual_rollout_${percent}pct` });
        console.log(`[FeatureFlags] 🔀 '${key}' rolled out to ${percent}% of users`);
    }

    /**
     * Start an A/B test for a flag.
     * variants: { control: { weight: 50 }, experimental: { weight: 50 } }
     */
    // Complexity: O(N*M) — nested iteration detected
    startABTest(key: string, variants: Record<string, ABVariant>): void {
        const flag = this._getOrThrow(key);
        const totalWeight = Object.values(variants).reduce((s, v) => s + v.weight, 0);
        if (Math.abs(totalWeight - 100) > 0.01) {
            throw new Error(`A/B variant weights must sum to 100 (got ${totalWeight})`);
        }

        flag.status = 'ab_test';
        flag.variants = variants;
        flag.updatedAt = new Date();

        // Init stats
        const statsMap = new Map<string, { impressions: number; conversions: number }>();
        for (const vk of Object.keys(variants)) {
            statsMap.set(vk, { impressions: 0, conversions: 0 });
        }
        this.abStats.set(key, statsMap);

        this.emit('flag:ab_test_started', { key, variants });
        console.log(`[FeatureFlags] 🧪 A/B test started for '${key}' with ${Object.keys(variants).length} variants`);
    }

    // Complexity: O(N)
    addVIPOverride(key: string, email: string): void {
        const flag = this._getOrThrow(key);
        flag.vipOverrides.add(email.toLowerCase());
        flag.updatedAt = new Date();
        console.log(`[FeatureFlags] ⭐ VIP override added for '${email}' on flag '${key}'`);
    }

    // Complexity: O(1) — hash/map lookup
    blockUser(key: string, email: string): void {
        const flag = this._getOrThrow(key);
        flag.blocklist.add(email.toLowerCase());
        flag.updatedAt = new Date();
        console.log(`[FeatureFlags] 🚫 '${email}' blocked from flag '${key}'`);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // EVALUATION
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * The main evaluation function. Call this everywhere you need to gate a feature.
     * 
     * Usage:
     *   const ev = flags.evaluate('market_reaper', user.email, user.tier);
     *   if (!ev.enabled) return res.status(403).json({ paywall: true, suggestedPlan: 'pro' });
     */
    // Complexity: O(1) — hash/map lookup
    evaluate(key: string, userId: string, userPlan?: PlanTier): FlagEvaluation {
        const flag = this.flags.get(key);
        const email = userId.toLowerCase();

        if (!flag) {
            return { flagKey: key, userId, enabled: false, reason: 'disabled' };
        }

        // 1. Blocklist check
        if (flag.blocklist.has(email)) {
            return { flagKey: key, userId, enabled: false, reason: 'blocklist' };
        }

        // 2. VIP override — always ON
        if (flag.vipOverrides.has(email)) {
            return { flagKey: key, userId, enabled: true, reason: 'vip_override' };
        }

        // 3. Global off
        if (flag.status === 'off') {
            return { flagKey: key, userId, enabled: false, reason: 'disabled' };
        }

        // 4. Plan gate check
        const planTier = userPlan ?? this.userPlanCache.get(email) ?? 'free';
        if (!this._planMeetsRequirement(planTier, flag.requiredPlan)) {
            return { flagKey: key, userId, enabled: false, reason: 'plan_gate' };
        }

        // 5. Global on
        if (flag.status === 'on') {
            return { flagKey: key, userId, enabled: true, reason: 'enabled' };
        }

        // 6. Gradual rollout
        if (flag.status === 'gradual') {
            const bucket = this._getUserBucket(email, key);
            const enabled = bucket < flag.rolloutPercent;
            return {
                flagKey: key,
                userId,
                enabled,
                reason: enabled ? 'enabled' : 'rollout_miss',
            };
        }

        // 7. A/B test
        if (flag.status === 'ab_test' && flag.variants) {
            const variant = this._assignABVariant(email, key, flag.variants);
            const stats = this.abStats.get(key)?.get(variant);
            if (stats) stats.impressions++;

            return {
                flagKey: key,
                userId,
                enabled: true,
                variant,
                reason: 'ab_test',
            };
        }

        return { flagKey: key, userId, enabled: false, reason: 'disabled' };
    }

    /** Quick boolean check — use when you don't need the reason */
    // Complexity: O(N) — potential recursive descent
    isEnabled(key: string, userId: string, userPlan?: PlanTier): boolean {
        return this.evaluate(key, userId, userPlan).enabled;
    }

    /** Get the A/B variant for a user without recording an impression */
    // Complexity: O(N) — potential recursive descent
    getVariant(key: string, userId: string): string | undefined {
        const flag = this.flags.get(key);
        if (!flag || flag.status !== 'ab_test' || !flag.variants) return undefined;
        return this._assignABVariant(userId.toLowerCase(), key, flag.variants);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // A/B TEST TRACKING
    // ─────────────────────────────────────────────────────────────────────────

    // Complexity: O(1) — hash/map lookup
    recordConversion(flagKey: string, userId: string): void {
        const flag = this.flags.get(flagKey);
        if (!flag || flag.status !== 'ab_test' || !flag.variants) return;

        const variant = this._assignABVariant(userId.toLowerCase(), flagKey, flag.variants);
        const stats = this.abStats.get(flagKey)?.get(variant);
        if (stats) {
            stats.conversions++;
            this.emit('ab_test:conversion', { flagKey, variant, userId });
        }
    }

    // Complexity: O(N log N) — sort operation
    getABTestResults(flagKey: string): ABTestResult[] {
        const results: ABTestResult[] = [];
        const statsMap = this.abStats.get(flagKey);
        if (!statsMap) return results;

        for (const [variantName, stats] of statsMap) {
            results.push({
                flagKey,
                variantName,
                impressions: stats.impressions,
                conversions: stats.conversions,
                conversionRate: stats.impressions > 0
                    ? parseFloat((stats.conversions / stats.impressions * 100).toFixed(2))
                    : 0,
            });
        }

        return results.sort((a, b) => b.conversionRate - a.conversionRate);
    }

    /** Returns the winning variant (highest conversion rate) */
    // Complexity: O(N) — potential recursive descent
    getWinningVariant(flagKey: string): ABTestResult | null {
        const results = this.getABTestResults(flagKey);
        return results.length > 0 ? results[0] : null;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PLAN CACHE (updated by subscription engine events)
    // ─────────────────────────────────────────────────────────────────────────

    // Complexity: O(1) — hash/map lookup
    setUserPlan(email: string, plan: PlanTier): void {
        this.userPlanCache.set(email.toLowerCase(), plan);
    }

    // Complexity: O(N*M) — nested iteration detected
    revokeUserAccess(email: string): void {
        this.userPlanCache.set(email.toLowerCase(), 'free');
        // Block all premium flags for this user
        for (const flag of this.flags.values()) {
            if (flag.requiredPlan !== 'free') {
                flag.blocklist.add(email.toLowerCase());
            }
        }
        console.log(`[FeatureFlags] 🔒 All premium features revoked for ${email}`);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ADMIN
    // ─────────────────────────────────────────────────────────────────────────

    // Complexity: O(1)
    listFlags(): FeatureFlag[] {
        return Array.from(this.flags.values());
    }

    // Complexity: O(1) — hash/map lookup
    getFlag(key: string): FeatureFlag | undefined {
        return this.flags.get(key);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PRIVATE
    // ─────────────────────────────────────────────────────────────────────────

    // Complexity: O(1)
    private _getUserBucket(userId: string, flagKey: string): number {
        // Deterministic 0-99 bucket — same user always gets same bucket per flag
        const hash = createHash('sha256')
            .update(`${userId}:${flagKey}`)
            .digest('hex');
        return parseInt(hash.slice(0, 4), 16) % 100;
    }

    // Complexity: O(N) — linear iteration
    private _assignABVariant(userId: string, flagKey: string, variants: Record<string, ABVariant>): string {
        const bucket = this._getUserBucket(userId, flagKey + '_ab');
        let cumWeight = 0;
        for (const [name, variant] of Object.entries(variants)) {
            cumWeight += variant.weight;
            if (bucket < cumWeight) return name;
        }
        return Object.keys(variants)[0];
    }

    // Complexity: O(1)
    private _planMeetsRequirement(userPlan: PlanTier, required: PlanTier): boolean {
        const order: PlanTier[] = ['free', 'starter', 'pro', 'enterprise'];
        return order.indexOf(userPlan) >= order.indexOf(required);
    }

    // Complexity: O(1) — hash/map lookup
    private _getOrThrow(key: string): FeatureFlag {
        const flag = this.flags.get(key);
        if (!flag) throw new Error(`Feature flag '${key}' not found`);
        return flag;
    }

    // Complexity: O(N*M) — nested iteration detected
    private _seedDefaultFlags(): void {
        // Platform capabilities — mapped to plan tiers
        const defaults: Array<Partial<FeatureFlag> & { key: string; name: string }> = [
            { key: 'ai_healing_tests',      name: 'AI Self-Healing Tests',         requiredPlan: 'free',       status: 'on'  },
            { key: 'god_loop',              name: 'Autonomous God Loop',            requiredPlan: 'starter',    status: 'on'  },
            { key: 'email_outreach',        name: 'Email Outreach Automation',      requiredPlan: 'starter',    status: 'on'  },
            { key: 'growth_hacker',         name: 'Growth Hacker Engine',           requiredPlan: 'starter',    status: 'on'  },
            { key: 'market_reaper',         name: 'Market Reaper (Paper Mode)',     requiredPlan: 'pro',        status: 'on'  },
            { key: 'market_reaper_live',    name: 'Market Reaper (LIVE Trading)',   requiredPlan: 'enterprise', status: 'on'  },
            { key: 'singularity_god_mode',  name: 'Singularity Full God Mode',      requiredPlan: 'enterprise', status: 'on'  },
            { key: 'advanced_analytics',    name: 'Advanced Analytics Dashboard',   requiredPlan: 'pro',        status: 'on'  },
            { key: 'custom_webhooks',       name: 'Custom Webhooks',                requiredPlan: 'pro',        status: 'on'  },
            { key: 'white_label',           name: 'White-Label Reports',            requiredPlan: 'pro',        status: 'on'  },
            { key: 'sso',                   name: 'SSO Authentication',             requiredPlan: 'enterprise', status: 'on'  },
            { key: 'cloudflare_bypass',     name: 'Cloudflare Bypass Engine',       requiredPlan: 'enterprise', status: 'on'  },
            // These flags are used for A/B testing pricing pages
            { key: 'pricing_v2',            name: 'New Pricing Page v2',            requiredPlan: 'free',       status: 'off' },
            { key: 'onboarding_v2',         name: 'New Onboarding Flow v2',         requiredPlan: 'free',       status: 'off' },
            { key: 'upsell_banner',         name: 'Usage Limit Upsell Banner',      requiredPlan: 'free',       status: 'on'  },
        ];

        for (const cfg of defaults) {
            this.create({ description: '', rolloutPercent: 100, metadata: {}, ...cfg });
        }

        console.log(`[FeatureFlags] 🚀 Seeded ${defaults.length} default flags`);
    }
}
