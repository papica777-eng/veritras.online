/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                               ║
 * ║                       EVOLUTION CHAMBER - THE GENESIS FORGE                     ║
 * ║                                                                               ║
 * ║      "Системата, която се самоусъвършенства. Вечният цикъл на растеж."        ║
 * ║                                                                               ║
 * ║   • Runs the Singularity's God Loop in a perpetual, self-healing cycle.       ║
 * ║   • Uses AI to analyze performance and rewrite its own logic.                 ║
 * ║   • Ensures QAntum Prime never stops learning, earning, and evolving.         ║
 * ║                                                                               ║
 * ║   © 2026 QAntum | Dimitar Prodromov                                             ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

import { QAntumSingularity } from '../../QAntum-singularity';
import { DeepSeekLink } from '../../intelligence/DeepSeekLink';
import { NeuralConsensusBridge, createNeuralConsensusBridge } from '../../cognition/NeuralConsensusBridge';
import { BezierMouseEngine, getBezierMouseEngine } from '../../cognition/BezierMouseEngine';
import { StealthTLS, getStealthTLS } from '../../cognition/StealthTLS';
import { SessionMemory, getSessionMemory } from '../../cognition/SessionMemory';
import { VisionEngine, getVisionEngine } from '../../cognition/VisionEngine';
import { EmbeddingWorkerBridge, getEmbeddingBridge } from '../../cognition/EmbeddingWorkerBridge';
import { FingerprintInjector, getFingerprintInjector } from '../../cognition/FingerprintInjector';
import { ProxyManager, getProxyManager } from '../../cognition/ProxyManager';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';

const SINGULARITY_PATH = path.resolve(__dirname, '../../QAntum-singularity.ts');
const DEBUG_PATH = path.resolve(__dirname, '../../.debug-recordings');

// ═══════════════════════════════════════════════════════════════════════════════
// OODA TYPES (Observe, Orient, Decide, Act)
// ═══════════════════════════════════════════════════════════════════════════════

export interface OODAObservation {
  /** Structured page description from Vision AI */
  description: string;
  /** Detected interactive elements */
  elements: Array<{ type: string; description: string; coordinates?: { x: number; y: number } }>;
  /** Has CAPTCHA been detected? */
  hasCaptcha: boolean;
  /** Has the target been found? */
  hasTarget: boolean;
  /** Target coordinates for BezierMouse */
  targetCoordinates: { x: number; y: number } | null;
  /** Vision confidence 0-1 */
  confidence: number;
  /** Page URL */
  url: string;
  /** DOM structure hash (for cache comparison) */
  domHash: string;
}

export interface OODAOrientation {
  /** State vector from embedding worker */
  stateVector: number[] | null;
  /** Is this a previously seen state? */
  isKnownState: boolean;
  /** Similarity to closest known state */
  similarity: number;
  /** Most similar past action taken */
  pastAction: string | null;
  /** Session memory context */
  recentMemories: string[];
}

export interface OODADecision {
  /** What action to take */
  action: 'click' | 'type' | 'scroll' | 'wait' | 'navigate' | 'solve-captcha' | 'rotate-proxy' | 'abort';
  /** Target coordinates (for click) */
  target?: { x: number; y: number };
  /** Input text (for type) */
  text?: string;
  /** URL (for navigate) */
  url?: string;
  /** Reason for this decision */
  reasoning: string;
  /** Confidence in this decision */
  confidence: number;
}

export interface OODACycleResult {
  observation: OODAObservation;
  orientation: OODAOrientation;
  decision: OODADecision;
  actionTaken: boolean;
  cycleTimeMs: number;
  debugRecorded: boolean;
}

export class EvolutionChamber {
    private singularity: QAntumSingularity;
    private ai: DeepSeekLink;
    private bridge: NeuralConsensusBridge;
    public mouse: BezierMouseEngine;
    private stealthTLS: StealthTLS;
    public sessionMemory: SessionMemory;
    public vision: VisionEngine;
    public embeddingWorker: EmbeddingWorkerBridge;
    private fingerprint: FingerprintInjector;
    private proxyManager: ProxyManager;
    private cycleCount = 0;
    private lastSelfImprovement = new Date();
    private lastCalibration = new Date();
    private isRunning = false;

    // ── OODA State ──────────────────────────────────────────────────────
    private debugMode = false;
    private oodaCycleCount = 0;
    private debugConfidenceThreshold = 0.4;
    private oodaHistory: OODACycleResult[] = [];
    private maxOODAHistory = 100;
    private pendingGoals: Array<{ url: string; goal: string }> = [];

    constructor() {
        this.singularity = new QAntumSingularity({
            mode: 'god-mode',
            autoSendPitches: true,
            autoExecuteTrades: false,
            enableMarketReaper: false,
        });
        this.ai = new DeepSeekLink();
        this.bridge = createNeuralConsensusBridge({
            requiredConsensus: 2,
            enableStealth: true,
            autoHealOnFailure: true,
            similarityThreshold: 0.75,
        });
        this.mouse = getBezierMouseEngine({
            overshootProbability: 0.75,
            nervousness: 0.3,
            enableFatigue: true,
        });
        this.stealthTLS = getStealthTLS({
            chromeVersion: 131,
            platform: 'Windows',
            rotateUA: true,
        });
        this.sessionMemory = getSessionMemory({
            maxEntries: 5000,
            enableDecay: true,
            persistPath: path.resolve(__dirname, '../../.session-memory.json'),
        });
        this.vision = getVisionEngine({
            model: 'llava',
            fallbackModel: 'moondream',
            screenshotQuality: 80,
        });
        this.embeddingWorker = getEmbeddingBridge({
            timeout: 30_000,
            autoRestart: true,
            maxRestarts: 5,
        });
        this.fingerprint = getFingerprintInjector({
            canvasNoise: true,
            webglNoise: true,
            audioNoise: true,
            rectNoise: true,
            screenSpoof: true,
            fontMask: true,
            noiseIntensity: 0.04,
        });
        this.proxyManager = getProxyManager({
            healthCheckInterval: 300_000,
            maxFailures: 3,
            maxRequestsPerProxy: 100,
            allowDirect: true,
        });
        this.log('🧬 Evolution Chamber Initialized. The Genesis Forge is active.');
        this.log('🔗 NeuralConsensusBridge attached — Hybridization Layer online.');
        this.log('🎯 BezierMouse + StealthTLS + SessionMemory — Full Stealth Stack.');
        this.log('👁️ Phase 3: Vision + WorkerThreads + Fingerprint + Proxy — God Mode.');
    }

    // Complexity: O(1) — amortized
    public async start() {
        if (this.isRunning) {
            this.log('⚠️ Chamber is already running.');
            return;
        }
        this.isRunning = true;

        // Initialize the consensus bridge (load engines)
        try {
            await this.bridge.initialize();
            this.log(`🔗 Bridge engines active: ${this.bridge.getActiveEngines().join(', ')}`);
        } catch (err) {
            this.log(`⚠️ Bridge init partial: ${(err as Error).message}. Continuing with fallback.`);
        }

        // Initialize StealthTLS (try CycleTLS Golang bridge)
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.stealthTLS.initCycleTLS();
        this.log(`🔒 TLS Profile: ${this.stealthTLS.getProfileInfo().userAgent.slice(0, 60)}...`);

        // Initialize SessionMemory
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.sessionMemory.start();
        this.log(`🧠 Session Memory active — ID: ${this.sessionMemory.getStats().sessionId}`);

        // Log provider stats from AI (3-tier: DeepSeek → Ollama → Local)
        this.log(`🤖 AI Provider chain ready (3-Tier fallback active)`);
        const providerStats = this.ai.getProviderStats();
        this.log(`   DeepSeek: ${providerStats.deepseek} | Ollama: ${providerStats.ollama} | Local: ${providerStats.local}`);

        // Phase 3: Vision Engine (Ollama llava/moondream)
        // SAFETY: async operation — wrap in try-catch for production resilience
        const visionOK = await this.vision.checkAvailability();
        this.log(`👁️ Vision Engine: ${visionOK ? 'ONLINE' : 'OFFLINE (install: ollama pull llava)'}`);

        // Phase 3: Worker Thread Embeddings
        // SAFETY: async operation — wrap in try-catch for production resilience
        const workerOK = await this.embeddingWorker.init();
        this.log(`🧵 Embedding Worker: ${workerOK ? 'ONLINE (non-blocking)' : 'OFFLINE (will use main-thread fallback)'}`);

        // Phase 3: Fingerprint Injector
        const fpStats = this.fingerprint.getStats();
        this.log(`🎭 Fingerprint ID: ${fpStats.identityHash} | GPU: ${fpStats.gpu}`);
        this.log(`   Screen: ${fpStats.screen} | Fonts: ${fpStats.fontCount} | Canvas/WebGL/Audio/Rect noise active`);

        // Phase 3: Proxy Manager
        const proxyStats = this.proxyManager.getStats();
        this.log(`🔄 Proxy Pool: ${proxyStats.poolSize} proxies | Active: ${proxyStats.activeProxy}`);
        if (proxyStats.poolSize > 0) {
            this.proxyManager.startHealthChecks();
        }

        this.log('🔥 Perpetual evolution cycle started. God Loop will run indefinitely.');
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.evolutionLoop();
    }

    // Complexity: O(1)
    public stop() {
        this.log('🛑 Stopping perpetual evolution cycle.');
        this.isRunning = false;
    }

    // Complexity: O(N*M) — nested iteration detected
    private async evolutionLoop() {
        while (this.isRunning) {
            this.cycleCount++;
            this.log(`\n╔═══════ CYCLE ${this.cycleCount} ═══════╗`);

            try {
                // 1. Run the core revenue generation loop
                await this.singularity.runGodLoop();
                this.log('✅ God Loop cycle complete.');

                // 1b. OODA Autonomous Task Cycle (if there is a queued goal)
                if (this.pendingGoals.length > 0) {
                    const { url, goal } = this.pendingGoals[0];
                    this.log(`🎯 OODA Task: "${goal.slice(0, 50)}"`);
                    let session: { browser: any; page: any } | null = null;
                    try {
                        session = await this.initializeSession(url);
                        const maxCycles = 20;
                        for (let i = 0; i < maxCycles; i++) {
                            const result = await this.runOODACycle(session.page, goal);
                            if (result.decision.action === 'abort') {
                                this.log(`🛑 OODA aborted after ${i + 1} cycles.`);
                                break;
                            }
                            // Wait between cycles for page to update
                            await new Promise(r => setTimeout(r, 1000 + Math.random() * 2000));
                        }
                    } catch (err) {
                        this.log(`⚠️ OODA task failed: ${(err as Error).message}`);
                    } finally {
                        if (session?.browser) {
                            // SAFETY: async operation — wrap in try-catch for production resilience
                            await session.browser.close().catch(() => {});
                        }
                        this.pendingGoals.shift(); // remove completed goal
                    }
                }

                // 2. Bridge Diagnostics — log consensus health every cycle
                this.logBridgeDiagnostics();

                // 2b. Stealth Stack Diagnostics — mouse, TLS, memory
                this.logStealthDiagnostics();

                // 3. Calibration cycle — recalibrate bridge thresholds every 6 hours
                const hoursSinceCalibration = (new Date().getTime() - this.lastCalibration.getTime()) / (1000 * 60 * 60);
                if (hoursSinceCalibration > 6) {
                    // SAFETY: async operation — wrap in try-catch for production resilience
                    await this.calibrationCycle();
                    this.lastCalibration = new Date();
                }

                // 4. Check for self-improvement opportunity (every 12 hours)
                const hoursSinceLastImprovement = (new Date().getTime() - this.lastSelfImprovement.getTime()) / (1000 * 60 * 60);
                if (hoursSinceLastImprovement > 12) {
                    // SAFETY: async operation — wrap in try-catch for production resilience
                    await this.selfImprovementCycle();
                    this.lastSelfImprovement = new Date();
                }

            } catch (error) {
                this.log(`❌ CRITICAL ERROR in evolution loop: ${error.message}`);
                this.log('--- Attempting to self-heal and restart in 60 seconds ---');
                // SAFETY: async operation — wrap in try-catch for production resilience
                await new Promise(resolve => setTimeout(resolve, 60000));
            }

            this.log('╚════════════════════╝');
            // Wait before starting the next cycle to avoid rate limiting and burnout
            // SAFETY: async operation — wrap in try-catch for production resilience
            await new Promise(resolve => setTimeout(resolve, 5 * 60 * 1000)); // 5 minutes
        }
    }

    // Complexity: O(N)
    private async selfImprovementCycle() {
        this.log('🧠 Initiating self-improvement cycle...');
        try {
            const singularityCode = await fs.readFile(SINGULARITY_PATH, 'utf-8');

            const suggestion = await this.ai.askEmpire({
                query: `You are a 10x Staff Engineer AI. Analyze your own core logic ('QAntum-singularity.ts') and propose one specific, high-impact improvement to make it more efficient, profitable, or intelligent.

Provide your response as valid JSON only:
{"reasoning": "...", "code_change": "..."}

The 'code_change' should be a drop-in replacement for an existing function. Be concise and targeted.`,
                context: singularityCode,
                temperature: 0.4,
            });

            const parsed = JSON.parse(suggestion.answer.match(/\{[\s\S]*\}/)[0]);

            if (parsed.code_change && parsed.reasoning) {
                this.log(`💡 AI Suggestion: ${parsed.reasoning}`);
                // This is the most dangerous part: the AI is rewriting itself.
                // In a real scenario, this would need extreme sandboxing.
                // For now, we will just log the proposed change.
                this.log('Proposed Code Change:\n' + parsed.code_change);

                // In a true evolution, you might try to apply the change:
                // const newCode = singularityCode.replace(/some_function_to_replace/g, parsed.code_change);
                // await fs.writeFile(SINGULARITY_PATH, newCode);
                // this.log('✅ Code updated. Restarting Singularity to apply changes...');
                // this.singularity = new QAntumSingularity(...); // Re-initialize
            }
        } catch (error) {
            this.log(`⚠️ Self-improvement failed: ${error.message}`);
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // OODA LOOP — Observe, Orient, Decide, Act
    // The autonomous cognition cycle that makes QAntum Prime see, think, and act.
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Initialize a full stealth browser session:
     * 1. Get proxy from ProxyManager
     * 2. Launch Playwright browser with proxy settings
     * 3. Create browser context with StealthTLS headers
     * 4. Inject FingerprintInjector patches
     * 5. Return ready-to-use page
     */
    // Complexity: O(1) — amortized
    public async initializeSession(url?: string): Promise<{ browser: any; page: any }> {
        this.log('🌐 Initializing stealth session...');

        // 1. Get proxy
        const proxyConfig = this.proxyManager.getPlaywrightProxy();
        this.log(`   Proxy: ${proxyConfig ? proxyConfig.server : 'DIRECT (no proxy)'}`);

        // 2. Launch browser
        let chromium: any;
        try {
            chromium = require('playwright').chromium;
        } catch {
            chromium = require('playwright-core').chromium;
        }

        const launchOptions: any = {
            headless: true,
            args: [
                '--disable-blink-features=AutomationControlled',
                '--disable-features=IsolateOrigins,site-per-process',
                '--disable-site-isolation-trials',
                '--no-sandbox',
            ],
        };
        if (proxyConfig) {
            launchOptions.proxy = proxyConfig;
        }

        // SAFETY: async operation — wrap in try-catch for production resilience
        const browser = await chromium.launch(launchOptions);

        // 3. Create context with stealth headers
        const tlsProfile = this.stealthTLS.getProfileInfo();
        // SAFETY: async operation — wrap in try-catch for production resilience
        const context = await browser.newContext({
            userAgent: tlsProfile.userAgent,
            viewport: { width: 1920, height: 1080 },
            locale: 'en-US',
            timezoneId: 'America/New_York',
            extraHTTPHeaders: {
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'sec-ch-ua': `"Chromium";v="${tlsProfile.chromeVersion}", "Google Chrome";v="${tlsProfile.chromeVersion}", "Not-A.Brand";v="99"`,
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
            },
        });

        // SAFETY: async operation — wrap in try-catch for production resilience
        const page = await context.newPage();

        // 4. Inject fingerprint spoofing
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.fingerprint.patchPage(page);
        this.log('   🎭 Fingerprint injected.');

        // 5. Navigate if URL provided
        if (url) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30_000 });
            this.log(`   📍 Navigated to: ${url}`);
        }

        // Store in session memory
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.sessionMemory.remember(
            `Session initialized${url ? ` at ${url}` : ''}`,
            {
                type: 'action',
                pageUrl: url || 'about:blank',
                tags: ['session', 'init'],
            }
        );

        this.log('✅ Stealth session ready.');
        return { browser, page };
    }

    /**
     * Execute one full OODA cycle on a page with a given goal.
     * This is the core autonomy primitive — see → think → decide → act.
     */
    // Complexity: O(N)
    public async runOODACycle(page: any, goal: string): Promise<OODACycleResult> {
        const cycleStart = Date.now();
        this.oodaCycleCount++;
        this.log(`\n   ╔═══ OODA #${this.oodaCycleCount} ═══╗ Goal: "${goal.slice(0, 60)}"`);

        // ── OBSERVE ─────────────────────────────────────────────────
        // SAFETY: async operation — wrap in try-catch for production resilience
        const observation = await this.observe(page, goal);
        this.log(`   👁️ Observe | Elements: ${observation.elements.length} | CAPTCHA: ${observation.hasCaptcha} | Conf: ${observation.confidence.toFixed(2)}`);

        // ── ORIENT ──────────────────────────────────────────────────
        // SAFETY: async operation — wrap in try-catch for production resilience
        const orientation = await this.orient(observation);
        this.log(`   🧭 Orient  | Known: ${orientation.isKnownState} | Similarity: ${orientation.similarity.toFixed(2)} | Memories: ${orientation.recentMemories.length}`);

        // ── DECIDE ──────────────────────────────────────────────────
        // SAFETY: async operation — wrap in try-catch for production resilience
        const decision = await this.decide(observation, orientation, goal);
        this.log(`   🧠 Decide  | Action: ${decision.action} | Confidence: ${decision.confidence.toFixed(2)} | ${decision.reasoning.slice(0, 50)}`);

        // ── DEBUG RECORDING (if low confidence) ─────────────────────
        let debugRecorded = false;
        if (this.debugMode && decision.confidence < this.debugConfidenceThreshold) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.recordDebug(page, observation, decision, goal);
            debugRecorded = true;
            this.log(`   📹 Debug   | Low confidence (${decision.confidence.toFixed(2)} < ${this.debugConfidenceThreshold}) — recording saved.`);
        }

        // ── ACT ─────────────────────────────────────────────────────
        // SAFETY: async operation — wrap in try-catch for production resilience
        const actionTaken = await this.act(page, decision);
        this.log(`   ⚡ Act     | ${actionTaken ? 'SUCCESS' : 'SKIPPED/FAILED'}`);

        const result: OODACycleResult = {
            observation,
            orientation,
            decision,
            actionTaken,
            cycleTimeMs: Date.now() - cycleStart,
            debugRecorded,
        };

        // Store in OODA history (bounded ring buffer)
        this.oodaHistory.push(result);
        if (this.oodaHistory.length > this.maxOODAHistory) {
            this.oodaHistory.shift();
        }

        // Store in session memory for future orientation
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.sessionMemory.remember(
            `OODA: ${decision.action} — ${decision.reasoning}`,
            {
                type: 'action',
                pageUrl: observation.url,
                tags: ['ooda', decision.action],
            }
        );

        this.log(`   ╚═══ OODA #${this.oodaCycleCount} done in ${result.cycleTimeMs}ms ═══╝`);
        return result;
    }

    /**
     * OBSERVE — screenshot the page, use VisionEngine to understand what we see.
     */
    // Complexity: O(N) — linear iteration
    private async observe(page: any, goal: string): Promise<OODAObservation> {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const url = await page.url();

        // DOM hash for cache comparison
        // SAFETY: async operation — wrap in try-catch for production resilience
        const domHash = await page.evaluate(() => {
            const counts: Record<string, number> = {};
            document.querySelectorAll('*').forEach((el: Element) => {
                const tag = el.tagName.toLowerCase();
                counts[tag] = (counts[tag] || 0) + 1;
            });
            const textLen = (document.body?.innerText || '').length;
            return JSON.stringify({ counts, textLen });
        }).catch(() => 'unknown');

        // Use VisionEngine with caching — avoids redundant Ollama calls when DOM hasn't changed
        let visionResult: any;
        try {
            visionResult = await this.vision.query({ page, prompt: goal });
        } catch (err) {
            this.log(`   ⚠️ Vision failed: ${(err as Error).message}`);
            visionResult = {
                description: 'Vision unavailable',
                elements: [],
                confidence: 0,
                rawResponse: '',
            };
        }

        // Detect CAPTCHA via keywords in vision description
        const desc = (visionResult.description || '').toLowerCase();
        const hasCaptcha = /captcha|recaptcha|hcaptcha|verify.*human|i.*am.*not.*robot|challenge/.test(desc);

        // Check if the target/goal is visible
        const goalKeywords = goal.toLowerCase().split(/\s+/).filter(k => k.length > 3);
        const hasTarget = goalKeywords.some(kw => desc.includes(kw));

        // Find best target coordinates
        let targetCoordinates: { x: number; y: number } | null = null;
        if (visionResult.elements?.length > 0) {
            const bestMatch = visionResult.elements.find(
                (e: any) => e.coordinates && goalKeywords.some((kw: string) => (e.description || '').toLowerCase().includes(kw))
            );
            if (bestMatch?.coordinates) {
                targetCoordinates = bestMatch.coordinates;
            } else if (visionResult.elements[0]?.coordinates) {
                targetCoordinates = visionResult.elements[0].coordinates;
            }
        }

        return {
            description: visionResult.description || '',
            elements: visionResult.elements || [],
            hasCaptcha,
            hasTarget,
            targetCoordinates,
            confidence: visionResult.confidence || 0,
            url,
            domHash,
        };
    }

    /**
     * ORIENT — compare current state against session memory and embeddings
     * to understand WHERE we are relative to past experience.
     */
    // Complexity: O(N) — linear iteration
    private async orient(observation: OODAObservation): Promise<OODAOrientation> {
        let stateVector: number[] | null = null;
        let isKnownState = false;
        let similarity = 0;
        let pastAction: string | null = null;
        let recentMemories: string[] = [];

        // 1. Embed the current page description
        try {
            stateVector = await this.embeddingWorker.embed(observation.description);
        } catch {
            // Embedding worker might not be initialized
        }

        // 2. Search session memory for similar past states
        try {
            const recalled = await this.sessionMemory.recall({
                text: observation.description,
                limit: 5,
                minStrength: 0.3,
            });

            if (recalled.length > 0) {
                recentMemories = recalled.map((m) => m.entry.content);
                const topMatch = recalled[0];
                similarity = topMatch.relevanceScore;
                isKnownState = similarity > 0.7;

                // Extract the action from past memory if it was an OODA memory
                const ooda = recentMemories.find(m => m.startsWith('OODA:'));
                if (ooda) {
                    pastAction = ooda.replace('OODA:', '').trim();
                }
            }
        } catch {
            // Session memory might be empty
        }

        // 3. If we have a state vector, compare with recent OODA history
        if (stateVector && this.oodaHistory.length > 0) {
            try {
                const lastDesc = this.oodaHistory[this.oodaHistory.length - 1].observation.description;
                const sim = await this.embeddingWorker.textSimilarity(observation.description, lastDesc);
                if (sim > similarity) {
                    similarity = sim;
                    isKnownState = sim > 0.8;
                }
            } catch {
                // Non-critical
            }
        }

        return { stateVector, isKnownState, similarity, pastAction, recentMemories };
    }

    /**
     * DECIDE — Given what we see (observation) and what we know (orientation),
     * determine the best action to take.
     */
    // Complexity: O(1) — hash/map lookup
    private async decide(
        observation: OODAObservation,
        orientation: OODAOrientation,
        goal: string
    ): Promise<OODADecision> {
        // Priority 1: CAPTCHA → attempt solve
        if (observation.hasCaptcha) {
            return {
                action: 'solve-captcha',
                reasoning: 'CAPTCHA detected on page — attempting automated solve.',
                confidence: 0.6,
            };
        }

        // Priority 2: Blocked/403 → rotate proxy
        const isBlocked = /blocked|forbidden|403|access denied|rate.?limit/i.test(observation.description);
        if (isBlocked) {
            return {
                action: 'rotate-proxy',
                reasoning: 'Page is blocked/403. Rotating proxy to attempt bypass.',
                confidence: 0.8,
            };
        }

        // Priority 3: Target found with coordinates → click
        if (observation.hasTarget && observation.targetCoordinates) {
            return {
                action: 'click',
                target: observation.targetCoordinates,
                reasoning: `Target element found matching goal "${goal.slice(0, 30)}" — clicking.`,
                confidence: observation.confidence,
            };
        }

        // Priority 4: Elements visible but no direct target match → use AI to decide
        if (observation.elements.length > 0 && observation.confidence > 0.3) {
            try {
                const aiDecision = await this.ai.askEmpire({
                    query: `You are a web automation AI. Given this page state, decide what to do next.

Goal: ${goal}
Page: ${observation.description}
Elements: ${JSON.stringify(observation.elements.slice(0, 10))}
Past similar action: ${orientation.pastAction || 'none'}
Recent memories: ${orientation.recentMemories.slice(0, 3).join(' | ')}

Respond as JSON only:
{"action": "click|type|scroll|wait|navigate", "target_index": number_or_null, "text": "string_or_null", "reasoning": "short reason"}`,
                    context: 'OODA decision',
                    temperature: 0.3,
                });

                const parsed = JSON.parse(aiDecision.answer.match(/\{[\s\S]*?\}/)?.[0] || '{}');
                const action = parsed.action || 'wait';
                const targetIdx = parsed.target_index;

                if (action === 'click' && targetIdx != null && observation.elements[targetIdx]?.coordinates) {
                    return {
                        action: 'click',
                        target: observation.elements[targetIdx].coordinates,
                        reasoning: parsed.reasoning || 'AI selected target',
                        confidence: observation.confidence * 0.8,
                    };
                }
                if (action === 'type' && parsed.text) {
                    return {
                        action: 'type',
                        text: parsed.text,
                        target: targetIdx != null ? observation.elements[targetIdx]?.coordinates : undefined,
                        reasoning: parsed.reasoning || 'AI typed text',
                        confidence: 0.5,
                    };
                }
                if (action === 'scroll') {
                    return {
                        action: 'scroll',
                        reasoning: parsed.reasoning || 'AI decided to scroll',
                        confidence: 0.5,
                    };
                }
                if (action === 'navigate' && parsed.url) {
                    return {
                        action: 'navigate',
                        url: parsed.url,
                        reasoning: parsed.reasoning || 'AI decided to navigate',
                        confidence: 0.5,
                    };
                }
            } catch {
                // AI decision failed — fall through to default
            }
        }

        // Priority 5: Low confidence or unknown state → wait and observe again
        if (observation.confidence < 0.2) {
            return {
                action: 'abort',
                reasoning: 'Confidence too low. Aborting to prevent blind action.',
                confidence: observation.confidence,
            };
        }

        return {
            action: 'wait',
            reasoning: 'No clear action from observation. Waiting for page state to change.',
            confidence: 0.3,
        };
    }

    /**
     * ACT — Execute the decided action on the page.
     * Uses BezierMouse for human-like mouse movements.
     */
    // Complexity: O(N*M) — nested iteration detected
    private async act(page: any, decision: OODADecision): Promise<boolean> {
        try {
            switch (decision.action) {
                case 'click':
                    if (decision.target) {
                        // Use BezierMouse for human-like movement
                        const path = this.mouse.generatePath(
                            { x: 960, y: 540 },        // start from center
                            decision.target               // move to target
                        );
                        for (const point of path) {
                            await page.mouse.move(point.x, point.y);
                            await new Promise(r => setTimeout(r, point.delay || 2));
                        }
                        await page.mouse.click(decision.target.x, decision.target.y);
                        return true;
                    }
                    return false;

                case 'type':
                    if (decision.text) {
                        // If target exists, click it first
                        if (decision.target) {
                            // SAFETY: async operation — wrap in try-catch for production resilience
                            await page.mouse.click(decision.target.x, decision.target.y);
                            // SAFETY: async operation — wrap in try-catch for production resilience
                            await new Promise(r => setTimeout(r, 100 + Math.random() * 200));
                        }
                        // Type with human-like delay
                        for (const char of decision.text) {
                            // SAFETY: async operation — wrap in try-catch for production resilience
                            await page.keyboard.type(char, { delay: 50 + Math.random() * 120 });
                        }
                        return true;
                    }
                    return false;

                case 'scroll':
                    // SAFETY: async operation — wrap in try-catch for production resilience
                    await page.mouse.wheel(0, 300 + Math.random() * 200);
                    // SAFETY: async operation — wrap in try-catch for production resilience
                    await new Promise(r => setTimeout(r, 500 + Math.random() * 500));
                    return true;

                case 'navigate':
                    if (decision.url) {
                        // SAFETY: async operation — wrap in try-catch for production resilience
                        await page.goto(decision.url, { waitUntil: 'domcontentloaded', timeout: 30_000 });
                        return true;
                    }
                    return false;

                case 'solve-captcha':
                    // Delegate to VisionEngine CAPTCHA solver
                    try {
                        const captchaResult = await this.vision.solveCaptcha(page);
                        return captchaResult.confidence > 0.3;
                    } catch {
                        this.log('   ⚠️ CAPTCHA solve failed.');
                        return false;
                    }

                case 'rotate-proxy':
                    try {
                        const newProxy = await this.proxyManager.rotateIP('blocked');
                        this.log(`   🔄 Proxy rotated to: ${newProxy || 'DIRECT'}`);
                        return true;
                    } catch {
                        return false;
                    }

                case 'wait':
                    // SAFETY: async operation — wrap in try-catch for production resilience
                    await new Promise(r => setTimeout(r, 2000 + Math.random() * 3000));
                    return true;

                case 'abort':
                    return false;

                default:
                    return false;
            }
        } catch (err) {
            this.log(`   ⚠️ Action "${decision.action}" failed: ${(err as Error).message}`);
            return false;
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // DEBUG RECORDING — Video/screenshot capture on low-confidence decisions
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Save a debug recording when confidence is below threshold.
     * Captures: screenshot, observation data, decision data, page URL.
     */
    // Complexity: O(1) — amortized
    private async recordDebug(
        page: any,
        observation: OODAObservation,
        decision: OODADecision,
        goal: string
    ): Promise<void> {
        try {
            await fs.mkdir(DEBUG_PATH, { recursive: true });

            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const id = crypto.randomBytes(4).toString('hex');
            const prefix = `${timestamp}_${id}`;

            // Save screenshot
            const screenshotPath = path.join(DEBUG_PATH, `${prefix}_screenshot.png`);
            await page.screenshot({ path: screenshotPath, fullPage: false });

            // Save debug context
            const contextPath = path.join(DEBUG_PATH, `${prefix}_context.json`);
            await fs.writeFile(contextPath, JSON.stringify({
                goal,
                url: observation.url,
                domHash: observation.domHash,
                description: observation.description,
                elements: observation.elements,
                confidence: observation.confidence,
                hasCaptcha: observation.hasCaptcha,
                hasTarget: observation.hasTarget,
                decision: {
                    action: decision.action,
                    reasoning: decision.reasoning,
                    confidence: decision.confidence,
                },
                oodaCycle: this.oodaCycleCount,
                timestamp: new Date().toISOString(),
            }, null, 2));

            this.log(`   📹 Debug saved: ${screenshotPath}`);
        } catch (err) {
            this.log(`   ⚠️ Debug recording failed: ${(err as Error).message}`);
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // DEBUG MODE CONTROL
    // ═══════════════════════════════════════════════════════════════════════

    // Complexity: O(1)
    public enableDebug(confidenceThreshold = 0.4): void {
        this.debugMode = true;
        this.debugConfidenceThreshold = confidenceThreshold;
        this.log(`📹 Debug mode ENABLED. Recording when confidence < ${confidenceThreshold}`);
    }

    // Complexity: O(1)
    public disableDebug(): void {
        this.debugMode = false;
        this.log('📹 Debug mode DISABLED.');
    }

    /**
     * Queue an autonomous goal for the OODA loop to execute.
     * The next evolution cycle will pick it up, initialize a stealth session,
     * and run OODA cycles until the goal is achieved or aborted.
     */
    // Complexity: O(1)
    public queueGoal(url: string, goal: string): void {
        this.pendingGoals.push({ url, goal });
        this.log(`📋 Goal queued: "${goal.slice(0, 50)}" → ${url}`);
    }

    // Complexity: O(N) — linear iteration
    public getOODAStats() {
        return {
            totalCycles: this.oodaCycleCount,
            historySize: this.oodaHistory.length,
            debugMode: this.debugMode,
            debugThreshold: this.debugConfidenceThreshold,
            lastCycle: this.oodaHistory.length > 0
                ? this.oodaHistory[this.oodaHistory.length - 1]
                : null,
            actionBreakdown: this.oodaHistory.reduce((acc, r) => {
                acc[r.decision.action] = (acc[r.decision.action] || 0) + 1;
                return acc;
            }, {} as Record<string, number>),
            avgCycleTimeMs: this.oodaHistory.length > 0
                ? Math.round(this.oodaHistory.reduce((s, r) => s + r.cycleTimeMs, 0) / this.oodaHistory.length)
                : 0,
            avgConfidence: this.oodaHistory.length > 0
                ? +(this.oodaHistory.reduce((s, r) => s + r.decision.confidence, 0) / this.oodaHistory.length).toFixed(3)
                : 0,
            debugRecordings: this.oodaHistory.filter(r => r.debugRecorded).length,
        };
    }

    // ═══════════════════════════════════════════════════════════════════════
    // BRIDGE DIAGNOSTICS — Health monitoring per cycle
    // ═══════════════════════════════════════════════════════════════════════

    // Complexity: O(1)
    private logBridgeDiagnostics(): void {
        const m = this.bridge.getMetrics();
        const t = this.bridge.getTelemetry();
        const consensusRate = (this.bridge.getConsensusRate() * 100).toFixed(1);
        const healRate = (this.bridge.getHealingRate() * 100).toFixed(1);

        this.log(`🔗 Bridge Stats | Searches: ${m.totalSearches} | Consensus: ${consensusRate}% | Healing: ${healRate}% | CPU: ${t.cpuUsage.toFixed(0)}% | Threat: ${t.threatLevel}`);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // CALIBRATION — Bridge auto-tuning via AI
    // ═══════════════════════════════════════════════════════════════════════

    // Complexity: O(1) — hash/map lookup
    private async calibrationCycle(): Promise<void> {
        this.log('🔧 Starting bridge calibration cycle...');
        try {
            const metrics = this.bridge.getMetrics();
            const telemetry = this.bridge.getTelemetry();

            const analysis = await this.ai.askEmpire({
                query: `You are a system calibration AI. Analyze these runtime metrics and suggest threshold adjustments.

Metrics: ${JSON.stringify(metrics)}
Telemetry: ${JSON.stringify(telemetry)}

Respond as JSON only:
{"adjustments": {"similarityThreshold": number, "cpuThresholdHigh": number, "waitMultiplierHigh": number}, "reasoning": string}`,
                context: 'NeuralConsensusBridge calibration',
                temperature: 0.2,
            });

            const parsed = JSON.parse(analysis.answer.match(/\{[\s\S]*\}/)?.[0] || '{}');
            if (parsed.adjustments) {
                this.log(`🔧 Calibration suggestion: ${parsed.reasoning}`);
                this.log(`   Adjustments: ${JSON.stringify(parsed.adjustments)}`);
                // In production, apply adjustments dynamically here
            }
        } catch (err) {
            this.log(`⚠️ Calibration failed: ${(err as Error).message}`);
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // STEALTH STACK DIAGNOSTICS
    // ═══════════════════════════════════════════════════════════════════════

    // Complexity: O(1) — amortized
    private logStealthDiagnostics(): void {
        // Mouse engine
        const mouseStats = this.mouse.getStats();
        this.log(`🎯 Mouse | Moves: ${mouseStats.totalMoves} | Fatigue: ${mouseStats.currentFatigue.toFixed(2)}x | Nervous: ${(mouseStats.nervousness * 100).toFixed(0)}%`);

        // TLS profile
        const tlsInfo = this.stealthTLS.getProfileInfo();
        this.log(`🔒 TLS   | Chrome/${tlsInfo.chromeVersion} | CycleTLS: ${tlsInfo.hasCycleTLS ? 'YES' : 'NO'} | Requests: ${tlsInfo.requestCount}`);

        // Session Memory
        const memStats = this.sessionMemory.getStats();
        this.log(`🧠 Memory| Entries: ${memStats.totalEntries} | Pages: ${memStats.pagesVisited} | Avg.Str: ${memStats.avgStrength}`);

        // AI Provider stats
        const aiStats = this.ai.getProviderStats();
        this.log(`🤖 AI    | DeepSeek: ${aiStats.deepseek} | Ollama: ${aiStats.ollama} | Local: ${aiStats.local}`);

        // Phase 3: Vision Engine
        const visionStats = this.vision.getStats();
        this.log(`👁️ Vision| Model: ${visionStats.model} | Queries: ${visionStats.queries} | Success: ${visionStats.successRate} | Available: ${visionStats.isAvailable}`);

        // Phase 3: Embedding Worker Thread
        const workerStats = this.embeddingWorker.getStats();
        this.log(`🧵 Worker| Embeds: ${workerStats.embeddings} | Batches: ${workerStats.batchEmbeddings} | Restarts: ${workerStats.workerRestarts} | Ready: ${workerStats.isReady}`);

        // Phase 3: Fingerprint Identity
        const fpStats = this.fingerprint.getStats();
        this.log(`🎭 FP    | Identity: ${fpStats.identityHash} | Patches: ${fpStats.patchCount} | GPU: ${fpStats.gpu.slice(0, 40)}`);

        // Phase 3: Proxy Manager
        const pxStats = this.proxyManager.getStats();
        this.log(`🔄 Proxy | Pool: ${pxStats.poolSize} alive: ${pxStats.aliveCount} | Active: ${pxStats.activeProxy} | Rotations: ${pxStats.totalRotations}`);

        // OODA Loop Stats
        const oodaStats = this.getOODAStats();
        if (oodaStats.totalCycles > 0) {
            this.log(`🔁 OODA  | Cycles: ${oodaStats.totalCycles} | Avg: ${oodaStats.avgCycleTimeMs}ms | Conf: ${oodaStats.avgConfidence} | Debug: ${oodaStats.debugRecordings} recordings`);
            this.log(`   Goals | Queued: ${this.pendingGoals.length} | Actions: ${JSON.stringify(oodaStats.actionBreakdown)}`);
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // LOGGING
    // ═══════════════════════════════════════════════════════════════════════

    // Complexity: O(1) — hash/map lookup
    private log(message: string) {
        console.log(`[EVOLUTION_CHAMBER] ${new Date().toISOString()} | ${message}`);
    }
}

// Entry point to start the perpetual evolution (only when run directly)
if (require.main === module) {
    (async () => {
        const chamber = new EvolutionChamber();
        // SAFETY: async operation — wrap in try-catch for production resilience
        await chamber.start();
    })().catch(console.error);
}
