/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                               ║
 * ║   QANTUM SINGULARITY ORCHESTRATOR                                             ║
 * ║   "The Multifunctional Brutality"                                             ║
 * ║                                                                               ║
 * ║   Fuses:                                                                      ║
 * ║   1. Cognition (Thought Chain, Self-Critique, Multi-Perspective)              ║
 * ║   2. Reality (Armed Reaper, Autonomous Sales Force, Growth Hacker)            ║
 * ║   3. Sales (Self-Healing Sales, Opportunity Engine)                           ║
 * ║                                                                               ║
 * ║   © 2025-2026 QAntum | Dimitar Prodromov                                        ║
 * ║                                                                               ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

import { EventEmitter } from 'events';

// 1. COGNITION IMPORTS
import { ChainConfig, Problem, Solution } from '../src/departments/cognition/thought-chain';
import { SelfCritiqueConfig, CritiqueResult } from '../src/departments/cognition/self-critique';
import { MultiPerspectiveResult, Problem as PerspectiveProblem } from '../src/departments/cognition/multi-perspective';

// 2. REALITY IMPORTS
import { ArmedReaper, ArmedReaperConfig } from '../src/departments/reality/economy/ArmedReaper';
import { AutonomousSalesForce, BugSeverity } from '../src/departments/reality/gateway/AutonomousSalesForce';
import { GrowthHacker, LeadProfile } from '../src/departments/reality/gateway/GrowthHacker';

// 3. SALES IMPORTS
import { SelfHealingSales, DiscoveredIssue, IssueReport } from '../scripts/sales/SelfHealingSales';

// 4. SAAS IMPORTS
import { SaaS, PlanTier } from '../src/saas/index';

// 6. AI IMPORTS (Real DeepSeek calls — replaces all mocks)
import { DeepSeekLink } from '../src/departments/intelligence/DeepSeekLink';

// 5. MARKET BRIDGE IMPORT
import {
    SingularityMarketBridge,
    createPaperBridge,
    createLiveBridge,
    BridgeConfig,
    CognitiveTradeDecision,
} from './singularity-market-bridge';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES & CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

export interface SingularityConfig {
    mode: 'stealth' | 'aggressive' | 'god-mode';
    targetIndustries: string[];
    maxDailyOutreach: number;
    minConfidenceThreshold: number; // 0.0 - 1.0
    autoExecuteTrades: boolean;
    autoSendPitches: boolean;

    // ── Market Reaper integration ────────────────────────────────────────
    /** Whether to start the SingularityMarketBridge when God Loop runs. */
    enableMarketReaper: boolean;
    /** Capital allocated to market trading (USD). */
    tradingCapitalUSD: number;
    /** 'paper' = no real money | 'live' = God Mode */
    tradingMode: 'simulation' | 'paper' | 'live';
    /** Forwarded to BridgeConfig.minCognitiveScore */
    tradingCognitiveThreshold: number;
}

export interface SingularityTarget {
    url: string;
    companyName: string;
    industry: string;
    estimatedRevenue: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// THE SINGULARITY ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

export class QAntumSingularity extends EventEmitter {
    private config: SingularityConfig;

    // Sub-systems
    private reaper: ArmedReaper;
    private salesForce: AutonomousSalesForce;
    private growthHacker: GrowthHacker;
    private selfHealingSales: SelfHealingSales;
    private saasEngine: SaaS;
    private ai: DeepSeekLink;

    // Market Reaper bridge (lazy-initialised)
    private marketBridge: SingularityMarketBridge | null = null;

    constructor(config: Partial<SingularityConfig> = {}) {
        super();
        this.config = {
            mode: config.mode || 'stealth',
            targetIndustries: config.targetIndustries || ['saas', 'ecommerce', 'finance'],
            maxDailyOutreach: config.maxDailyOutreach || 50,
            minConfidenceThreshold: config.minConfidenceThreshold || 0.85,
            autoExecuteTrades: config.autoExecuteTrades || false,
            autoSendPitches: config.autoSendPitches || false,
            enableMarketReaper: config.enableMarketReaper ?? false,
            tradingCapitalUSD: config.tradingCapitalUSD ?? 10_000,
            tradingMode: config.tradingMode ?? 'paper',
            tradingCognitiveThreshold: config.tradingCognitiveThreshold ?? 0.75,
        };

        // Initialize Reality & Sales Engines
        this.reaper = new ArmedReaper({ mode: this.config.autoExecuteTrades ? 'live' : 'dry-run' });
        this.salesForce = new AutonomousSalesForce();
        this.growthHacker = new GrowthHacker();
        this.selfHealingSales = new SelfHealingSales();
        this.saasEngine = new SaaS();
        this.ai = new DeepSeekLink();

        this.log('🧠 QAntum Singularity Initialized. God Mode: ' + (this.config.mode === 'god-mode' ? 'ON' : 'OFF'));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PHASE 1: TARGET ACQUISITION (Growth Hacker + Multi-Perspective)
    // ─────────────────────────────────────────────────────────────────────────

    public async acquireTargets(): Promise<SingularityTarget[]> {
        this.log('🔍 Phase 1: Scanning market for high-value targets...');

        // 1. Growth Hacker finds leads
        const leads = await this.growthHacker.findSimilarSitesByIndustry(this.config.targetIndustries);

        // 2. Cognition: Multi-Perspective Analysis on each lead
        const qualifiedTargets: SingularityTarget[] = [];

        for (const lead of leads) {
            const analysis = await this.analyzeTargetPerspectives(lead);

            if (analysis.synthesis.confidence >= this.config.minConfidenceThreshold) {
                qualifiedTargets.push({
                    url: lead.domain,
                    companyName: lead.companyName,
                    industry: lead.industry,
                    estimatedRevenue: (lead as any).estimatedRevenue || 0
                });
                this.log(`🎯 Target Locked: ${lead.companyName} (Confidence: ${Math.round(analysis.synthesis.confidence * 100)}%)`);
            }
        }

        return qualifiedTargets;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PHASE 2: VULNERABILITY SCAN & ISSUE GENERATION (Oracle + Self-Healing)
    // ─────────────────────────────────────────────────────────────────────────

    public async scanAndGenerateReport(target: SingularityTarget): Promise<IssueReport | null> {
        this.log(`🕷️ Phase 2: Deep scanning ${target.url}...`);

        // 1. Oracle (QA Bot) scans the site
        const crawlResults = await this.salesForce.oracleScan(target.url) as any;

        // 2. Self-Healing Sales converts raw bugs into Business Issues
        const issues = this.selfHealingSales.analyzeForIssues(crawlResults);

        if (issues.length === 0) {
            this.log(`⚠️ No critical issues found on ${target.url}. Moving to next target.`);
            return null;
        }

        // 3. Generate Professional Report with ROI calculations
        const report = await this.selfHealingSales.generateReport(
            'AUTO_GEN_KEY',
            target.companyName,
            'JOB_' + Date.now(),
            target.url,
            issues,
            target.industry
        );

        this.log(`📄 Report Generated: ${issues.length} issues found. Potential ROI: $${report.valueProposition.potentialRevenueSaved}`);
        return report;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PHASE 3: COGNITIVE PITCH GENERATION (Thought Chain + Self-Critique)
    // ─────────────────────────────────────────────────────────────────────────

    public async generatePerfectPitch(target: SingularityTarget, report: IssueReport): Promise<string> {
        this.log(`🧠 Phase 3: Generating cognitive sales pitch for ${target.companyName}...`);

        // 1. Thought Chain: Decompose the problem (How to sell to THIS specific company)
        const strategy = await this.developSalesStrategy(target, report);

        // 2. Generate initial pitch based on strategy
        let currentPitch = this.salesForce.generateInitialPitch(target, report, strategy);

        // 3. Self-Critique Loop: Refine the pitch until it's perfect
        let iteration = 0;
        let isPerfect = false;

        while (!isPerfect && iteration < 5) {
            iteration++;
            const critique = await this.critiquePitch(currentPitch, target);

            if (critique.evaluation.score >= 90) {
                isPerfect = true;
                this.log(`✨ Pitch perfected after ${iteration} iterations (Score: ${critique.evaluation.score}/100)`);
            } else {
                this.log(`🔄 Refining pitch (Iteration ${iteration}, Score: ${critique.evaluation.score}/100)...`);
                currentPitch = await this.improvePitch(currentPitch, critique.weaknesses);
            }
        }

        return currentPitch;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PHASE 4: EXECUTION & SAAS PROVISIONING (Armed Reaper / Autonomous Sales)
    // ─────────────────────────────────────────────────────────────────────────

    public async execute(target: SingularityTarget, report: IssueReport, pitch: string): Promise<void> {
        this.log(`⚡ Phase 4: Execution against ${target.companyName}`);

        // 1. SaaS Provisioning: Shadow-provision a Free account for the target
        const targetEmail = `founder@${target.url.replace(/^https?:\/\/(www\.)?/, '')}`;
        const { subscription: shadowSub, magicLink } = this.saasEngine.shadowProvision(
            targetEmail,
            target.companyName,
        );

        this.log(`🎁 SaaS: Shadow Provisioned 'Free' Tier for ${targetEmail} (Sub ID: ${shadowSub.id})`);

        // Track SaaS usage signal — triggers upsell email if over limit
        const upsellSignal = this.saasEngine.recordUsage(targetEmail, 'god_loop_target');
        if (upsellSignal) {
            this.log(`📈 Upsell Signal: ${targetEmail} → ${upsellSignal.suggestedTier} (${upsellSignal.reason})`);
            this.emit('upsell:signal', upsellSignal);
        }

        // Append the pre-built magic login link to the pitch
        const finalPitch = `${pitch}\n\nP.S. I've already set up a free QAntum account for you to see the live dashboard of these issues. Click here to access it instantly (no credit card required): ${magicLink}`;

        if (this.config.autoSendPitches) {
            // Send the pitch via Email/LinkedIn
            await this.salesForce.dispatchOutreach(target, finalPitch, report.shareUrl);
            this.log(`🚀 Pitch dispatched to ${target.companyName}!`);

            // Track the offer in Self-Healing Sales
            this.selfHealingSales.trackOfferEvent(
                report.offers[0].offerId,
                'AUTO_GEN_KEY',
                'clicked'
            );

            // Track Telemetry for the outreach
            this.saasEngine.telemetry.track(
                'singularity_outreach_sent',
                'sales',
                {
                    targetCompany: target.companyName,
                    industry: target.industry,
                    subscriptionId: shadowSub.id
                }
            );
        } else {
            this.log(`⏸️ Auto-send is OFF. Pitch saved to drafts for ${target.companyName}.`);
            this.log(`Draft Pitch:\n${finalPitch}`);
        }

        // If target is a crypto exchange/finance site with vulnerabilities, 
        // Armed Reaper can theoretically exploit arbitrage opportunities found during scan
        if (this.config.autoExecuteTrades && target.industry === 'finance') {
            this.log(`⚠️ Armed Reaper analyzing financial target for arbitrage...`);
            // this.reaper.analyzeAndExecute(report);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // THE GOD LOOP (Run everything autonomously)
    // ─────────────────────────────────────────────────────────────────────────

    public async runGodLoop(): Promise<void> {
        this.log('🔥 INITIATING GOD LOOP 🔥');

        // ── Variant B: Wire upsell signals → autonomous upgrade email ────────
        this.on('upsell:signal', async (signal) => {
            try {
                await this.salesForce.sendUpgradeEmail?.(signal);
                this.log(`📧 Upgrade email sent to ${signal.email} → ${signal.suggestedTier}`);
                this.saasEngine.telemetry.track(
                    'upgrade_email_sent',
                    'sales',
                    { email: signal.email, plan: signal.suggestedTier, reason: signal.reason }
                );
            } catch { /* salesForce may not have sendUpgradeEmail — degrade gracefully */ }
        });

        // ── Start Market Reaper in parallel if enabled ───────────────────
        if (this.config.enableMarketReaper) {
            this.startMarketReaper();
        }

        const targets = await this.acquireTargets();
        let processed = 0;

        for (const target of targets) {
            if (processed >= this.config.maxDailyOutreach) break;

            try {
                // ── Variant A: Record usage & check limits ───────────────────
                const operatorEmail = process.env.OPERATOR_EMAIL || 'operator@qantum.empire';
                const usageSignal = this.saasEngine.recordUsage(operatorEmail, 'god_loop_target');
                if (usageSignal) {
                    this.log(`⚠️  Usage limit hit — upsell signal emitted for ${operatorEmail}`);
                    this.emit('upsell:signal', usageSignal);
                }

                const access = this.saasEngine.canAccess(operatorEmail, 'god_loop');
                if (!access.allowed) {
                    this.log(`🔒 God Loop blocked: ${access.reason}. Upgrade at ${access.upgradeUrl}`);
                    break;
                }

                const report = await this.scanAndGenerateReport(target);
                if (report) {
                    const pitch = await this.generatePerfectPitch(target, report);
                    await this.execute(target, report, pitch);
                    processed++;
                }
            } catch (error) {
                this.log(`❌ Error processing ${target.companyName}: ${error.message}`);
            }
        }

        this.log(`🏁 God Loop Complete. Processed ${processed} targets.`);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // MARKET REAPER CONTROL
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Start the Singularity ↔ Market Reaper bridge autonomously.
     * The brain (cognition) analyses every opportunity from PriceOracle
     * and routes approved trades through AtomicTrader with biometric stealth.
     */
    public startMarketReaper(): void {
        if (this.marketBridge) {
            this.log('⚠️  Market Reaper bridge already running.');
            return;
        }

        const bridgeConfig: Partial<BridgeConfig> = {
            reaperMode: this.config.tradingMode,
            capitalUSD: this.config.tradingCapitalUSD,
            minCognitiveScore: this.config.tradingCognitiveThreshold,
            biometricStealthEnabled: true,
            cognitiveSelfCritiqueEnabled: true,
            onTradeDecision: (d: CognitiveTradeDecision) => {
                this.emit('market-decision', d);
                // Log approved decisions as telemetry
                if (d.approved) {
                    this.saasEngine.telemetry.track(
                        'market_trade_approved',
                        'trading',
                        {
                            symbol: d.opportunity.symbol,
                            cognitiveScore: d.cognitiveScore,
                            expectedProfit: d.opportunity.netProfit,
                            fatigueLevel: d.fatigueLevel,
                        }
                    );
                }
            },
            onSwapCompleted: (swap, decision) => {
                this.emit('market-trade', swap, decision);
                const profit = decision?.actualProfitUSD ?? 0;
                this.log(`💰 Market trade completed | ${decision?.opportunity.symbol} | profit=$${profit.toFixed(4)}`);
                this.saasEngine.telemetry.track(
                    'market_trade_completed',
                    'trading',
                    { swapId: swap.id, profit }
                );
            },
            onSwapFailed: (swap, reason) => {
                this.log(`❌ Market trade failed | ${swap.id} | ${reason}`);
            },
        };

        this.marketBridge = this.config.tradingMode === 'live'
            ? createLiveBridge(this.config.tradingCapitalUSD, bridgeConfig)
            : createPaperBridge(bridgeConfig);

        this.marketBridge.on('stats', (s) => this.emit('market-stats', s));

        this.marketBridge.start().then(() => {
            this.log(`⚔️  Market Reaper ONLINE | mode=${this.config.tradingMode.toUpperCase()} | capital=$${this.config.tradingCapitalUSD.toLocaleString()}`);
        });
    }

    /** Stop the Market Reaper bridge. */
    public async stopMarketReaper(): Promise<void> {
        if (!this.marketBridge) return;
        await this.marketBridge.stop();
        this.marketBridge = null;
        this.log('🛑 Market Reaper bridge stopped.');
    }

    /** Get live market trading stats. */
    public getMarketStats() {
        return this.marketBridge?.getStats() ?? null;
    }

    /** Get the last N cognitive trade decisions from the bridge. */
    public getTradeDecisionLog(limit = 50) {
        return this.marketBridge?.getDecisionLog(limit) ?? [];
    }

    // ─────────────────────────────────────────────────────────────────────────
    // COGNITIVE HELPERS (Real DeepSeek-V3 calls)
    // ─────────────────────────────────────────────────────────────────────────

    private async analyzeTargetPerspectives(lead: any): Promise<any> {
        const response = await this.ai.askEmpire({
            query: `You are a B2B growth strategist. Analyze this business lead from three perspectives (OPTIMIST, PESSIMIST, STRATEGIST) and determine if a QA automation SaaS should pursue them.

Company: ${lead.companyName}
Domain: ${lead.domain}
Industry: ${lead.industry}
Estimated Revenue: $${lead.estimatedRevenue || 'Unknown'}

Respond ONLY with valid JSON (no markdown):
{"synthesis":{"confidence":0.0,"shouldTarget":true,"reasoning":"..."}}
Where confidence is 0.0-1.0 (0.9+ = must target, <0.6 = skip).`,
            includeContext: false,
            temperature: 0.3,
        });

        try {
            const match = response.answer.match(/\{[\s\S]*\}/);
            if (match) return JSON.parse(match[0]);
        } catch { /* fall through */ }

        // Graceful fallback — don't skip on parse error
        return { synthesis: { confidence: 0.75, shouldTarget: true, reasoning: response.answer } };
    }

    private async developSalesStrategy(target: any, report: any): Promise<any> {
        const issuesSummary = report?.issues
            ?.slice(0, 5)
            .map((i: any) => `- ${i.title || i.type}: ${i.description || ''}`)
            .join('\n') || 'Multiple critical UX/performance/SEO issues found';

        const response = await this.ai.askEmpire({
            query: `You are an elite B2B SaaS sales strategist. Develop a targeted outreach strategy.

Target: ${target.companyName} (${target.industry}, ~$${target.estimatedRevenue} revenue)
Issues Found on Their Site:
${issuesSummary}

QAntum Plans: Free ($0 — limited), Starter ($49/mo), Pro ($149/mo), Enterprise ($499/mo)

Respond ONLY with valid JSON (no markdown):
{"approach":"value-first","keyPoints":["...","...","..."],"recommendedPlan":"Pro","openingHook":"...","estimatedROI":"..."}`,
            includeContext: false,
            temperature: 0.4,
        });

        try {
            const match = response.answer.match(/\{[\s\S]*\}/);
            if (match) return JSON.parse(match[0]);
        } catch { /* fall through */ }

        return {
            approach: 'value-first',
            keyPoints: ['ROI', 'Security', 'Speed'],
            recommendedPlan: 'Pro',
            openingHook: response.answer.slice(0, 200),
            estimatedROI: '10x within 30 days',
        };
    }

    private async critiquePitch(pitch: string, target: any): Promise<any> {
        const response = await this.ai.askEmpire({
            query: `You are a world-class B2B sales coach. Critically evaluate this cold outreach email for ${target.companyName} (${target.industry}).

PITCH:
${pitch}

Score it 0-100 on: Personalization, Value Proposition, CTA clarity, Urgency, Credibility.
A score of 90+ means it's ready to send.

Respond ONLY with valid JSON (no markdown):
{"evaluation":{"score":85},"weaknesses":["...","..."],"strengths":["..."]}`,
            includeContext: false,
            temperature: 0.2,
        });

        try {
            const match = response.answer.match(/\{[\s\S]*\}/);
            if (match) return JSON.parse(match[0]);
        } catch { /* fall through */ }

        return { evaluation: { score: 82 }, weaknesses: ['Add more personalization'], strengths: ['Clear value prop'] };
    }

    private async improvePitch(pitch: string, weaknesses: any[]): Promise<string> {
        const weaknessText = Array.isArray(weaknesses) ? weaknesses.join('; ') : String(weaknesses);

        const response = await this.ai.askEmpire({
            query: `You are an elite B2B copywriter. Rewrite and improve this sales pitch to fix these specific weaknesses: ${weaknessText}

ORIGINAL PITCH:
${pitch}

Requirements: Keep it under 200 words, highly personalized, clear CTA, no buzzwords.
Return ONLY the improved pitch text — no explanations, no JSON, no headers.`,
            includeContext: false,
            temperature: 0.6,
        });

        return response.answer?.trim() || pitch;
    }

    private log(msg: string) {
        console.log(`[SINGULARITY] ${msg}`);
    }
}
