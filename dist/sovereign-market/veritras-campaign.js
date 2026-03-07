"use strict";
/**
 * Sovereign Market — Veritras.website Campaign Runner
 * Complexity: O(1) per cycle
 *
 * This is the primary autonomous loop for veritras.website marketing.
 * Runs ALL channels: Email B2B, X, LinkedIn.
 * Anti-bot: full StealthLayer active.
 * Personas: PSYCHE engine (5 rotating identities).
 *
 * Usage:
 *   npx ts-node sovereign-market/veritras-campaign.ts
 *   npx ts-node sovereign-market/veritras-campaign.ts --dry-run
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const index_1 = require("./index");
// Load env
const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
    for (const line of lines) {
        const t = line.trim();
        if (!t || t.startsWith('#'))
            continue;
        const eq = t.indexOf('=');
        if (eq < 0)
            continue;
        const key = t.slice(0, eq).trim();
        const val = t.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
        if (!process.env[key])
            process.env[key] = val;
    }
}
const DRY_RUN = process.argv.includes('--dry-run');
// ─────────────────────────────────────────────────────────────────────────────
// CHANNEL CONFIGS — Timing per platform (bot-safe intervals)
// ─────────────────────────────────────────────────────────────────────────────
const CHANNEL_TIMING = {
    email: {
        minDelayMs: 35_000, // 35s between emails
        maxDelayMs: 65_000, // 65s max (Gmail safe)
        dailyLimit: 450,
    },
    x: {
        minDelayMs: 180_000, // 3 min between posts
        maxDelayMs: 600_000, // 10 min max
        dailyLimit: 17, // X limits ~17 posts/day for new accounts
    },
    linkedin: {
        minDelayMs: 3_600_000, // 1 hour between posts
        maxDelayMs: 7_200_000, // 2 hours max
        dailyLimit: 5,
    },
};
const TARGETS = [
    // Bulgarian tier 1 (highest value, closest to founder)
    { domain: 'payhawk.com', email: 'hello@payhawk.com', company: 'Payhawk', industry: 'fintech', country: 'BG', priority: 10 },
    { domain: 'telerik.com', email: 'info@telerik.com', company: 'Telerik', industry: 'saas', country: 'BG', priority: 9 },
    { domain: 'kanbanize.com', email: 'hello@kanbanize.com', company: 'Kanbanize', industry: 'saas', country: 'BG', priority: 9 },
    { domain: 'chaos.com', email: 'security@chaos.com', company: 'Chaos', industry: 'saas', country: 'BG', priority: 8 },
    { domain: 'siteground.com', email: 'security@siteground.com', company: 'SiteGround', industry: 'hosting', country: 'BG', priority: 8 },
    { domain: 'ozone.bg', email: 'privacy@ozone.bg', company: 'Ozone', industry: 'ecommerce', country: 'BG', priority: 7 },
    { domain: 'gtmhub.com', email: 'hello@gtmhub.com', company: 'Gtmhub', industry: 'saas', country: 'BG', priority: 7 },
    { domain: 'superhosting.bg', email: 'support@superhosting.bg', company: 'Superhosting', industry: 'hosting', country: 'BG', priority: 6 },
    { domain: 'jobs.bg', email: 'office@jobs.bg', company: 'Jobs.bg', industry: 'recruitment', country: 'BG', priority: 5 },
    // EU expansion targets
    { domain: 'zendesk.com', email: 'security@zendesk.com', company: 'Zendesk', industry: 'saas', country: 'EU', priority: 8 },
    { domain: 'atlassian.com', email: 'security@atlassian.com', company: 'Atlassian', industry: 'saas', country: 'EU', priority: 8 },
    { domain: 'pipedrive.com', email: 'security@pipedrive.com', company: 'Pipedrive', industry: 'saas', country: 'EU', priority: 7 },
    { domain: 'bolt.eu', email: 'security@bolt.eu', company: 'Bolt', industry: 'other', country: 'EU', priority: 7 },
    { domain: 'transferwise.com', email: 'security@wise.com', company: 'Wise', industry: 'fintech', country: 'EU', priority: 7 },
];
// ─────────────────────────────────────────────────────────────────────────────
// STEALTH BATCH SENDER — Core function
// ─────────────────────────────────────────────────────────────────────────────
async function runEmailCampaign(pool) {
    const human = new index_1.HumanSimulator();
    // Sort by priority DESC
    const sorted = [...TARGETS].sort((a, b) => b.priority - a.priority);
    console.log(`\n[EMAIL CAMPAIGN] ${sorted.length} targets queued`);
    console.log(`[STEALTH] Rate: 1 email / ${CHANNEL_TIMING.email.minDelayMs / 1000}s–${CHANNEL_TIMING.email.maxDelayMs / 1000}s`);
    for (const target of sorted) {
        await human.restIfNeeded();
        pool.enqueue({
            channel: 'email',
            payload: {
                domain: target.domain,
                email: target.email,
                company: target.company,
                industry: target.industry,
                country: target.country,
            },
            priority: target.priority,
            scheduledAt: Date.now(),
            retries: 0,
            maxRetries: 3,
        });
        human.recordAction();
    }
}
async function runXCampaign(pool) {
    const VERITRAS_TWEETS = [
        {
            text: `Automated testing that actually works.\n\nVeritras.website — QA automation for teams who care about quality.\n\nFree tier. No credit card. No cloud required.\n\nhttps://veritras.website\n\n#QA #Testing #DevTools #Automation`,
            action: 'post',
        },
        {
            text: `How much time does your team spend on manual QA?\n\nMost teams: 15-20 hours/week.\n\nWith Veritras: 2 hours. AI handles the rest.\n\nhttps://veritras.website\n\n#TestAutomation #DevOps #Engineering`,
            action: 'post',
        },
        {
            text: `Security headers missing on your site?\n\nVeritras scans it in 3 seconds and gives you the exact nginx config to fix it.\n\nFree. No account needed.\n\nhttps://veritras.website\n\n#WebSecurity #DevTools #OWASP`,
            action: 'post',
        },
        {
            text: `Your API endpoints deserve to be tested.\n\nVeritras tests REST, GraphQL, and WebSocket automatically.\n\nPaste URL → get full audit in seconds.\n\nhttps://veritras.website\n\n#API #Testing #Backend #QA`,
            action: 'post',
        },
    ];
    const tweet = VERITRAS_TWEETS[Math.floor(Date.now() / 1000) % VERITRAS_TWEETS.length];
    pool.enqueue({
        channel: 'x',
        payload: { ...tweet, platform: 'x' },
        priority: 7,
        scheduledAt: Date.now(),
        retries: 0,
        maxRetries: 2,
    });
    console.log(`[X CAMPAIGN] Queued post: "${tweet.text.slice(0, 60)}..."`);
}
async function runLinkedInCampaign(pool) {
    pool.enqueue({
        channel: 'linkedin',
        payload: { action: 'post', content: 'veritras-daily-template' },
        priority: 5,
        scheduledAt: Date.now(),
        retries: 0,
        maxRetries: 2,
    });
    console.log('[LINKEDIN CAMPAIGN] Daily post queued');
}
// ─────────────────────────────────────────────────────────────────────────────
// MAIN CAMPAIGN RUNNER
// ─────────────────────────────────────────────────────────────────────────────
async function runVeritrasDay() {
    console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║  VERITRAS.WEBSITE — Daily Marketing Campaign                                ║
║  Mode: ${DRY_RUN ? 'DRY-RUN (no sends)                                        ' : 'LIVE — all channels active                              '}║
║  Anti-Bot: StealthLayer v1.0 ACTIVE                                         ║
║  PSYCHE Personas: 5 identities rotating                                     ║
╚══════════════════════════════════════════════════════════════════════════════╝

Timestamp: ${new Date().toISOString()}
`);
    const pool = new index_1.WorkerPool(3, DRY_RUN);
    const channels = process.argv.find(a => a.startsWith('--channel='))?.split('=')[1];
    if (!channels || channels === 'email')
        await runEmailCampaign(pool);
    if (!channels || channels === 'x')
        await runXCampaign(pool);
    if (!channels || channels === 'linkedin')
        await runLinkedInCampaign(pool);
    await pool.drain();
}
// ─────────────────────────────────────────────────────────────────────────────
// AUTONOMOUS LOOP — Never stops
// ─────────────────────────────────────────────────────────────────────────────
async function autonomousLoop() {
    const INTERVAL_MS = 6 * 60 * 60 * 1000; // 6 hours
    console.log('[SOVEREIGN] Autonomous Veritras campaign starting — repeats every 6 hours');
    while (true) {
        const cycleStart = Date.now();
        try {
            await runVeritrasDay();
        }
        catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            console.error(`[SOVEREIGN] Cycle error: ${msg}`);
        }
        const elapsed = Date.now() - cycleStart;
        const remaining = Math.max(0, INTERVAL_MS - elapsed);
        const nextAt = new Date(Date.now() + remaining);
        console.log(`\n[SOVEREIGN] Next cycle: ${nextAt.toLocaleString()} (${Math.round(remaining / 60_000)} min from now)\n`);
        await index_1.StealthLayer.humanDelay(remaining * 0.95, remaining * 1.05); // ±5% jitter on interval
    }
}
if (process.argv.includes('--loop')) {
    autonomousLoop().catch(e => {
        console.error('[SOVEREIGN] FATAL:', e);
        process.exit(1);
    });
}
else {
    runVeritrasDay().catch(e => {
        console.error('[SOVEREIGN] FATAL:', e);
        process.exit(1);
    });
}
