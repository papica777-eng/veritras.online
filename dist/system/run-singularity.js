"use strict";
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
const dotenv = __importStar(require("dotenv"));
const path = __importStar(require("path"));
// Load .env BEFORE any module reads process.env (DeepSeekLink constructor checks it)
dotenv.config({ path: path.join(__dirname, '.env') });
const qantum_singularity_1 = require("./qantum-singularity");
const NeuralHUD_1 = require("./intelligence/NeuralHUD");
const DynamicLoader_1 = require("./system/DynamicLoader");
const PineconeContextBridge_1 = require("./pinecone-bridge/src/PineconeContextBridge");
const EmbeddingEngine_1 = require("./pinecone-bridge/src/EmbeddingEngine");
// ═══════════════════════════════════════════════════════════════════════════
// 🚀 START THE SINGULARITY
// ═══════════════════════════════════════════════════════════════════════════
/**
 * CLI modes:
 *   npx ts-node run-singularity.ts          — Sales God Loop
 *   TRADING=1 npx ts-node run-singularity.ts — Sales + Market Reaper
 */
const WITH_TRADING = process.env.TRADING === '1';
function runTelemetryUpsellLoop(hud) {
    // Rotating mock leads; replace with real feed/API when ready
    const leads = [
        { company: 'Acme FinTech', email: 'cto@acme-fin.com', plan: 'starter', usagePct: 0.93, latencyMs: 480, unpaidDays: 0 },
        { company: 'Nova SaaS', email: 'ops@nova.dev', plan: 'starter', usagePct: 0.62, latencyMs: 220, unpaidDays: 4 },
        { company: 'Mercury Retail', email: 'ceo@mercury.shop', plan: 'pro', usagePct: 0.81, latencyMs: 310, unpaidDays: 0 },
    ];
    let tick = 0;
    setInterval(() => {
        tick++;
        for (const lead of leads) {
            // A/B variant
            const variant = tick % 2 === 0 ? 'offer-A' : 'offer-B';
            // Shadow provisioning is implied; we just emit lifecycle events here
            if (lead.usagePct >= 0.9) {
                hud.wave('action', 'sales-force', `⚡ ${lead.company}: 90%+ usage — pushing ${variant}`, { lead, variant, action: 'upsell' }, 0.92, ['upsell']);
            }
            // Latency-based nudge
            if (lead.latencyMs > 450) {
                hud.wave('evaluation', 'system', `⏱️ ${lead.company}: latency ${lead.latencyMs}ms — suggest scale-up`, { lead, variant, action: 'latency' }, 0.7);
            }
            // Stop on non-payment with grace
            if (lead.unpaidDays >= 3) {
                hud.wave('action', 'saas-engine', `🚫 ${lead.company}: overdue ${lead.unpaidDays}d — throttling`, { lead, variant, action: 'throttle' }, 0.4, ['billing']);
            }
        }
    }, 15_000);
}
async function main() {
    console.log('\n=================================================================');
    console.log('  QANTUM SINGULARITY ORCHESTRATOR - "The Multifunctional Brutality"');
    if (WITH_TRADING)
        console.log('  ⚔️  MARKET REAPER: ENABLED (paper mode)');
    console.log('=================================================================\n');
    // ── Neural HUD ────────────────────────────────────────────────────────
    const hud = new NeuralHUD_1.NeuralHUD(3847);
    await hud.start();
    // ── Pinecone Vector Memory ────────────────────────────────────────────
    const pinecone = new PineconeContextBridge_1.PineconeContextBridge({
        apiKey: process.env.PINECONE_API_KEY || '',
        indexName: process.env.PINECONE_INDEX || 'qantum-empire',
        namespace: 'empire',
        dimension: 512,
        topK: 10,
        minScore: 0.5,
    });
    const embedEngine = new EmbeddingEngine_1.EmbeddingEngine();
    // Embed helper that PineconeContextBridge expects: (texts: string[]) => Promise<number[][]>
    const embedFn = async (texts) => embedEngine.embedBatch(texts);
    let pineconeReady = false;
    try {
        hud.wave('perception', 'system', '🔌 Connecting to Pinecone Cloud…');
        await pinecone.connect();
        hud.wave('perception', 'system', '⏳ Loading Embedding Engine (Universal Sentence Encoder)…');
        await embedEngine.load();
        pineconeReady = true;
        const stats = pinecone.getStats();
        hud.wave('perception', 'system', `✅ Pinecone ONLINE — ${stats.totalVectors.toLocaleString()} vectors | dim=${stats.dimension}`, { stats }, 1.0, ['pinecone']);
        // Create a session for this God Loop run
        const session = pinecone.createSession(`god-loop-${Date.now()}`);
        hud.wave('perception', 'system', `📎 Pinecone session created: ${session.sessionId}`, {}, 0.8, ['pinecone']);
    }
    catch (err) {
        hud.wave('evaluation', 'system', `⚠️ Pinecone offline — running without vector memory (${err.message})`, { error: err.message }, 0.3, ['pinecone']);
        console.warn('[PINECONE] Connection failed, continuing without vector memory:', err.message);
    }
    // Dynamically load sales agents (AutonomousSalesForce, GrowthHacker) if present
    const salesForce = await DynamicLoader_1.DynamicLoader.loadModule('AutonomousSalesForce', ['./reality/gateway/AutonomousSalesForce']);
    const growthHacker = await DynamicLoader_1.DynamicLoader.loadModule('GrowthHacker', ['./reality/gateway/GrowthHacker']);
    if (salesForce && growthHacker) {
        hud.wave('perception', 'system', '🤖 AutonomousSalesForce & GrowthHacker loaded', { salesForce: true, growthHacker: true }, 0.8);
    }
    else {
        hud.wave('perception', 'system', '⚠️ Sales agents not found (fallback to local loop)', { salesForce: !!salesForce, growthHacker: !!growthHacker }, 0.3);
    }
    // Shared stats object — updated each cycle
    let cycle = 0;
    let targetsProcessed = 0;
    let pitchesSent = 0;
    hud.wave('perception', 'system', '🔥 QAntum Singularity starting — God Mode ON');
    // Start telemetry-driven upsell loop (mock feed; replace with real usage API when ready)
    runTelemetryUpsellLoop(hud);
    const singularity = new qantum_singularity_1.QAntumSingularity({
        mode: 'god-mode',
        targetIndustries: ['saas', 'ecommerce', 'finance'],
        maxDailyOutreach: 50,
        minConfidenceThreshold: 0.85,
        autoExecuteTrades: false,
        autoSendPitches: true,
        // ── Market Reaper ─────────────────────────────────────────────────
        enableMarketReaper: WITH_TRADING,
        tradingMode: 'paper',
        tradingCapitalUSD: 10_000,
        tradingCognitiveThreshold: 0.75,
    });
    // ── Hook singularity events → HUD waves ───────────────────────────────
    singularity.on('upsell:signal', (sig) => {
        pitchesSent++;
        hud.wave('action', 'saas-engine', `🚀 Upsell signal → ${sig?.targetEmail ?? '?'} (${sig?.suggestedTier ?? '?'})`, { signal: sig }, 0.9, ['upsell']);
        hud.updateStats({ cycle, targetsProcessed, pitchesSent });
        // ── Store upsell event as a vector in Pinecone for future context ─
        if (pineconeReady) {
            const text = `Upsell signal for ${sig?.targetEmail} — tier ${sig?.suggestedTier}: ${sig?.reason ?? 'usage threshold'}`;
            embedFn([text]).then(vectors => {
                pinecone.upsertContext?.({
                    id: `upsell-${Date.now()}`,
                    values: vectors[0],
                    metadata: { type: 'upsell', email: sig?.targetEmail, tier: sig?.suggestedTier, timestamp: Date.now() },
                }).catch(() => { });
            }).catch(() => { });
        }
    });
    if (WITH_TRADING) {
        singularity.on('market-decision', (d) => {
            console.log(`[MARKET] ${d.approved ? '✅' : '🚫'} ${d.opportunity?.symbol} score=${d.cognitiveScore?.toFixed(3)}`);
            hud.wave('decision', 'market-reaper', `${d.approved ? '✅ APPROVED' : '🚫 REJECTED'} ${d.opportunity?.symbol ?? '?'} — score ${d.cognitiveScore?.toFixed(3)}`, { decision: d }, d.cognitiveScore ?? 0.5);
        });
        singularity.on('market-trade', (swap, decision) => {
            console.log(`[MARKET] 💰 Swap ${swap.id} profit=$${decision?.actualProfitUSD?.toFixed(4)}`);
            hud.wave('action', 'market-reaper', `💰 Trade executed — profit $${decision?.actualProfitUSD?.toFixed(4) ?? '?'}`, { swap }, 1.0, ['trade']);
        });
        singularity.on('market-stats', (s) => {
            hud.wave('evaluation', 'market-reaper', `📊 Market stats update`, { stats: s }, 0.8);
        });
    }
    // ── Periodic stats refresh every 10s ──────────────────────────────────
    const statsTicker = setInterval(() => {
        hud.updateStats({ cycle, targetsProcessed, pitchesSent });
        // Refresh Pinecone stats in HUD
        if (pineconeReady) {
            const ps = pinecone.getStats();
            hud.wave('evaluation', 'system', `📊 Pinecone: ${ps.queriesExecuted} queries | ${ps.cacheHits} cache hits | avg ${ps.avgQueryTimeMs.toFixed(0)}ms`, { pinecone: ps }, 0.6, ['pinecone']);
        }
    }, 10_000);
    // ── Cleanup on exit ───────────────────────────────────────────────────
    process.on('SIGINT', async () => {
        clearInterval(statsTicker);
        hud.wave('action', 'system', '🛑 Singularity shutting down');
        if (pineconeReady) {
            await pinecone.disconnect();
            hud.wave('action', 'system', '🔌 Pinecone disconnected');
        }
        await hud.stop();
        process.exit(0);
    });
    await singularity.runGodLoop();
    clearInterval(statsTicker);
    if (pineconeReady)
        await pinecone.disconnect();
    await hud.stop();
}
main().catch(console.error);
