/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║   QANTUM SAAS — TELEMETRY ENGINE                                              ║
 * ║   "Know everything. Sell accordingly."                                        ║
 * ║                                                                               ║
 * ║   Tracks:                                                                     ║
 * ║   • Every user action with timestamp                                          ║
 * ║   • Feature usage frequency                                                   ║
 * ║   • Error events and stack traces                                             ║
 * ║   • Session time (time-on-platform)                                           ║
 * ║   • Funnel progression (visit → trial → activated → paid → churned)          ║
 * ║   • Market trading events (decisions, fills, P&L)                            ║
 * ║                                                                               ║
 * ║   Output: Actionable insights for Singularity upsell automation              ║
 * ║                                                                               ║
 * ║   © 2025-2026 QAntum | Dimitar Prodromov                                     ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

import { EventEmitter } from 'events';
import { randomUUID } from 'crypto';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type EventCategory =
    | 'pageview'
    | 'feature'
    | 'sales'
    | 'trading'
    | 'billing'
    | 'error'
    | 'auth'
    | 'onboarding'
    | 'conversion'
    | 'session';

export interface TelemetryEvent {
    id: string;
    name: string;
    category: EventCategory;
    userId?: string;
    sessionId?: string;
    subscriptionId?: string;
    timestamp: Date;
    properties: Record<string, any>;
    durationMs?: number;
}

export interface UserSession {
    sessionId: string;
    userId: string;
    startedAt: Date;
    lastSeenAt: Date;
    events: string[];  // event IDs
    durationMs: number;
    entryPoint?: string;
    exitPoint?: string;
}

export interface FunnelStep {
    name: string;
    count: number;
    dropoffPct?: number;
}

export interface UserBehaviorProfile {
    userId: string;
    totalEvents: number;
    sessionCount: number;
    totalTimeOnPlatformMs: number;
    mostUsedFeatures: Array<{ feature: string; count: number }>;
    errorCount: number;
    lastActiveAt: Date;
    funnelStage: 'visitor' | 'trial' | 'activated' | 'paying' | 'power_user' | 'churned';
    riskOfChurn: number;  // 0-1
    upsellReadiness: number;  // 0-1
}

export interface TelemetryReport {
    period: { start: Date; end: Date };
    totalEvents: number;
    uniqueUsers: number;
    topEvents: Array<{ name: string; count: number }>;
    errorRate: number;
    avgSessionDurationMs: number;
    funnel: FunnelStep[];
    topFeatures: Array<{ feature: string; count: number }>;
    revenueSignals: {
        upsellReadyUsers: string[];
        churnRiskUsers: string[];
    };
}

// ═══════════════════════════════════════════════════════════════════════════════
// TELEMETRY ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

export class TelemetryEngine extends EventEmitter {
    private events: Map<string, TelemetryEvent> = new Map();
    private sessions: Map<string, UserSession> = new Map();
    private userProfiles: Map<string, UserBehaviorProfile> = new Map();
    private featureCounters: Map<string, number> = new Map();

    // ─────────────────────────────────────────────────────────────────────────
    // CORE: TRACK AN EVENT
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * The main tracking method. Use this everywhere.
     *
     * Examples:
     *   telemetry.track({ name: 'singularity_outreach_sent', category: 'sales', properties: { ... } });
     *   telemetry.track({ name: 'market_trade_completed', category: 'trading', userId: email, ... });
     *   telemetry.track({ name: 'subscription_upgrade', category: 'billing', properties: { from: 'free', to: 'pro' } });
     */
    // Complexity: O(N) — linear iteration
    track(input: Omit<TelemetryEvent, 'id' | 'timestamp'>): TelemetryEvent {
        const event: TelemetryEvent = {
            id: `evt_${randomUUID().replace(/-/g, '').slice(0, 16)}`,
            timestamp: new Date(),
            ...input,
        };

        this.events.set(event.id, event);

        // Update feature counters
        if (event.category === 'feature') {
            const key = event.name;
            this.featureCounters.set(key, (this.featureCounters.get(key) ?? 0) + 1);
        }

        // Update user profile
        if (event.userId) {
            this._updateUserProfile(event);
        }

        // Update session
        if (event.sessionId) {
            this._updateSession(event);
        }

        this.emit('event', event);

        // Prune old events if memory grows too large (keep last 100k)
        if (this.events.size > 100_000) {
            const oldest = Array.from(this.events.keys()).slice(0, 10_000);
            oldest.forEach(k => this.events.delete(k));
        }

        return event;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // SESSION TRACKING
    // ─────────────────────────────────────────────────────────────────────────

    // Complexity: O(1) — hash/map lookup
    startSession(userId: string, entryPoint?: string): UserSession {
        const session: UserSession = {
            sessionId: `sess_${randomUUID().replace(/-/g, '').slice(0, 12)}`,
            userId,
            startedAt: new Date(),
            lastSeenAt: new Date(),
            events: [],
            durationMs: 0,
            entryPoint,
        };

        this.sessions.set(session.sessionId, session);
        this.track({
            name: 'session_start',
            category: 'session',
            userId,
            sessionId: session.sessionId,
            properties: { entryPoint },
        });

        return session;
    }

    // Complexity: O(1) — hash/map lookup
    endSession(sessionId: string, exitPoint?: string): UserSession | undefined {
        const session = this.sessions.get(sessionId);
        if (!session) return undefined;

        session.exitPoint = exitPoint;
        session.durationMs = Date.now() - session.startedAt.getTime();

        this.track({
            name: 'session_end',
            category: 'session',
            userId: session.userId,
            sessionId,
            durationMs: session.durationMs,
            properties: {
                exitPoint,
                durationSeconds: Math.round(session.durationMs / 1000),
                eventCount: session.events.length,
            },
        });

        return session;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ERROR TRACKING
    // ─────────────────────────────────────────────────────────────────────────

    // Complexity: O(1)
    trackError(error: Error, context: { userId?: string; feature?: string; sessionId?: string } = {}): TelemetryEvent {
        return this.track({
            name: 'error',
            category: 'error',
            userId: context.userId,
            sessionId: context.sessionId,
            properties: {
                message: error.message,
                stack: error.stack?.slice(0, 2000),
                feature: context.feature,
                errorType: error.constructor.name,
            },
        });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // FUNNEL TRACKING
    // ─────────────────────────────────────────────────────────────────────────

    // Complexity: O(1)
    trackFunnelStep(
        userId: string,
        step: 'landing' | 'signup' | 'first_test' | 'shadow_provisioned' | 'trial_start' | 'upgrade' | 'payment' | 'churn',
        properties: Record<string, any> = {}
    ): void {
        this.track({
            name: `funnel_${step}`,
            category: 'onboarding',
            userId,
            properties: { step, ...properties },
        });

        // Update funnel stage in profile
        const profile = this._getOrCreateProfile(userId);
        const stageMap: Record<string, UserBehaviorProfile['funnelStage']> = {
            landing:           'visitor',
            signup:            'trial',
            first_test:        'activated',
            shadow_provisioned:'trial',
            trial_start:       'trial',
            upgrade:           'paying',
            payment:           'paying',
            churn:             'churned',
        };
        if (stageMap[step]) {
            profile.funnelStage = stageMap[step];
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // QUERYING
    // ─────────────────────────────────────────────────────────────────────────

    // Complexity: O(N log N) — sort operation
    getEventsByUser(userId: string, limit = 100): TelemetryEvent[] {
        return Array.from(this.events.values())
            .filter(e => e.userId === userId)
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .slice(0, limit);
    }

    // Complexity: O(N log N) — sort operation
    getEventsByCategory(category: EventCategory, limit = 500): TelemetryEvent[] {
        return Array.from(this.events.values())
            .filter(e => e.category === category)
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .slice(0, limit);
    }

    // Complexity: O(N log N) — sort operation
    getEventsByName(name: string, since?: Date): TelemetryEvent[] {
        return Array.from(this.events.values())
            .filter(e => e.name === name && (!since || e.timestamp >= since))
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }

    // Complexity: O(1) — hash/map lookup
    getUserProfile(userId: string): UserBehaviorProfile | undefined {
        return this.userProfiles.get(userId);
    }

    // Complexity: O(N log N) — sort operation
    getTopFeatures(limit = 10): Array<{ feature: string; count: number }> {
        return Array.from(this.featureCounters.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([feature, count]) => ({ feature, count }));
    }

    /**
     * Returns users who are likely ready for an upsell (high engagement + approaching limits).
     * Used by Singularity to auto-generate personalized upgrade emails.
     */
    // Complexity: O(N log N) — sort operation
    getUpsellCandidates(minReadiness = 0.6): UserBehaviorProfile[] {
        return Array.from(this.userProfiles.values())
            .filter(p => p.upsellReadiness >= minReadiness && p.funnelStage !== 'churned')
            .sort((a, b) => b.upsellReadiness - a.upsellReadiness);
    }

    /**
     * Returns users at high risk of churning.
     * Triggers: inactivity > 14 days, high error rate, no conversions
     */
    // Complexity: O(N log N) — sort operation
    getChurnRiskUsers(minRisk = 0.7): UserBehaviorProfile[] {
        return Array.from(this.userProfiles.values())
            .filter(p => p.riskOfChurn >= minRisk)
            .sort((a, b) => b.riskOfChurn - a.riskOfChurn);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // REPORTING
    // ─────────────────────────────────────────────────────────────────────────

    // Complexity: O(N*M) — nested iteration detected
    generateReport(since?: Date): TelemetryReport {
        const now = new Date();
        const periodStart = since ?? new Date(now.getTime() - 30 * 24 * 3600 * 1000);

        const periodEvents = Array.from(this.events.values())
            .filter(e => e.timestamp >= periodStart);

        const uniqueUsers = new Set(periodEvents.map(e => e.userId).filter(Boolean)).size;

        // Top events
        const eventCounts = new Map<string, number>();
        for (const e of periodEvents) {
            eventCounts.set(e.name, (eventCounts.get(e.name) ?? 0) + 1);
        }
        const topEvents = Array.from(eventCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 20)
            .map(([name, count]) => ({ name, count }));

        // Error rate
        const errors = periodEvents.filter(e => e.category === 'error').length;
        const errorRate = periodEvents.length > 0
            ? parseFloat((errors / periodEvents.length * 100).toFixed(2))
            : 0;

        // Avg session duration
        const completedSessions = Array.from(this.sessions.values())
            .filter(s => s.durationMs > 0 && s.startedAt >= periodStart);
        const avgSessionDurationMs = completedSessions.length > 0
            ? Math.round(completedSessions.reduce((sum, s) => sum + s.durationMs, 0) / completedSessions.length)
            : 0;

        // Funnel
        const funnelSteps: FunnelStep[] = [
            { name: 'Visitors',    count: this._countEvent('funnel_landing',       periodStart) },
            { name: 'Signups',     count: this._countEvent('funnel_signup',        periodStart) },
            { name: 'Activated',   count: this._countEvent('funnel_first_test',    periodStart) },
            { name: 'Trials',      count: this._countEvent('funnel_trial_start',   periodStart) },
            { name: 'Paying',      count: this._countEvent('funnel_payment',       periodStart) },
        ];
        // Add dropoff percentages
        for (let i = 1; i < funnelSteps.length; i++) {
            const prev = funnelSteps[i - 1].count;
            funnelSteps[i].dropoffPct = prev > 0
                ? parseFloat((100 - (funnelSteps[i].count / prev * 100)).toFixed(1))
                : 0;
        }

        // Revenue signals
        const upsellReady = this.getUpsellCandidates(0.6).map(p => p.userId);
        const churnRisk = this.getChurnRiskUsers(0.7).map(p => p.userId);

        return {
            period: { start: periodStart, end: now },
            totalEvents: periodEvents.length,
            uniqueUsers,
            topEvents,
            errorRate,
            avgSessionDurationMs,
            funnel: funnelSteps,
            topFeatures: this.getTopFeatures(10),
            revenueSignals: {
                upsellReadyUsers: upsellReady,
                churnRiskUsers: churnRisk,
            },
        };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PRIVATE
    // ─────────────────────────────────────────────────────────────────────────

    // Complexity: O(N log N) — sort operation
    private _updateUserProfile(event: TelemetryEvent): void {
        const profile = this._getOrCreateProfile(event.userId!);

        profile.totalEvents++;
        profile.lastActiveAt = event.timestamp;

        if (event.category === 'feature') {
            const idx = profile.mostUsedFeatures.findIndex(f => f.feature === event.name);
            if (idx >= 0) {
                profile.mostUsedFeatures[idx].count++;
            } else {
                profile.mostUsedFeatures.push({ feature: event.name, count: 1 });
            }
            // Keep top 20 by count
            profile.mostUsedFeatures.sort((a, b) => b.count - a.count);
            if (profile.mostUsedFeatures.length > 20) profile.mostUsedFeatures.pop();
        }

        if (event.category === 'error') {
            profile.errorCount++;
        }

        // Recalculate risk & readiness scores
        this._recalcScores(profile);
    }

    // Complexity: O(1) — hash/map lookup
    private _updateSession(event: TelemetryEvent): void {
        const session = this.sessions.get(event.sessionId!);
        if (!session) return;

        session.events.push(event.id);
        session.lastSeenAt = event.timestamp;
        session.durationMs = event.timestamp.getTime() - session.startedAt.getTime();
    }

    // Complexity: O(1) — hash/map lookup
    private _getOrCreateProfile(userId: string): UserBehaviorProfile {
        if (!this.userProfiles.has(userId)) {
            this.userProfiles.set(userId, {
                userId,
                totalEvents: 0,
                sessionCount: 0,
                totalTimeOnPlatformMs: 0,
                mostUsedFeatures: [],
                errorCount: 0,
                lastActiveAt: new Date(),
                funnelStage: 'visitor',
                riskOfChurn: 0,
                upsellReadiness: 0,
            });
        }
        return this.userProfiles.get(userId)!;
    }

    // Complexity: O(1) — amortized
    private _recalcScores(profile: UserBehaviorProfile): void {
        const now = Date.now();
        const daysSinceActive = (now - profile.lastActiveAt.getTime()) / (1000 * 60 * 60 * 24);

        // Churn risk: 0-1
        // Factors: inactivity, error rate, stage
        let churnRisk = 0;
        if (daysSinceActive > 30) churnRisk += 0.5;
        else if (daysSinceActive > 14) churnRisk += 0.3;
        else if (daysSinceActive > 7) churnRisk += 0.15;

        const errorRatio = profile.totalEvents > 0 ? profile.errorCount / profile.totalEvents : 0;
        churnRisk += Math.min(0.3, errorRatio * 3);

        if (profile.funnelStage === 'churned') churnRisk = 1;
        if (profile.funnelStage === 'paying' || profile.funnelStage === 'power_user') churnRisk *= 0.5;

        profile.riskOfChurn = parseFloat(Math.min(1, churnRisk).toFixed(3));

        // Upsell readiness: 0-1
        // High engagement + low errors + paying or activated stage
        let readiness = 0;
        if (profile.totalEvents > 50)  readiness += 0.2;
        if (profile.totalEvents > 200) readiness += 0.2;
        if (profile.sessionCount > 5)  readiness += 0.15;
        if (profile.funnelStage === 'activated' || profile.funnelStage === 'trial') readiness += 0.25;
        if (profile.funnelStage === 'paying') readiness += 0.1;
        if (profile.mostUsedFeatures.length > 3) readiness += 0.1;
        if (daysSinceActive < 1) readiness += 0.1; // active today

        profile.upsellReadiness = parseFloat(Math.min(1, readiness).toFixed(3));
    }

    // Complexity: O(N) — linear iteration
    private _countEvent(name: string, since: Date): number {
        return Array.from(this.events.values())
            .filter(e => e.name === name && e.timestamp >= since)
            .length;
    }
}
