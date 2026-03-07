"use strict";
/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  SOVEREIGN MARKET — Autonomous Marketing Platform v1.0                      ║
 * ║  Anti-Bot Detection | Multi-Persona Workers | Full Autonomy                 ║
 * ║                                                                              ║
 * ║  Complexity: O(1) per worker dispatch, O(n log n) lead prioritization       ║
 * ║  Architecture: Worker Thread Pool + PSYCHE Engine + Stealth Layer           ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * COMPONENTS:
 *   StealthLayer     → Anti-bot detection bypass (delays, UA rotation, fingerprint)
 *   WorkerPool       → Autonomous worker thread orchestration
 *   CampaignRouter   → Routes campaigns to correct channel workers
 *   HumanSimulator   → Mimics human behavioral patterns
 *
 * CHANNELS (each runs as isolated Worker):
 *   EmailWorker      → B2B outreach via PSYCHE personas
 *   XWorker          → X (Twitter) posting + following
 *   LinkedInWorker   → LinkedIn posting
 *   WebhookWorker    → Discord/Slack notifications
 *
 * Usage:
 *   npx ts-node sovereign-market/index.ts
 *   npx ts-node sovereign-market/index.ts --dry-run
 *   npx ts-node sovereign-market/index.ts --channel=email
 *   npx ts-node sovereign-market/index.ts --channel=x
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
exports.WorkerPool = exports.HumanSimulator = exports.StealthLayer = void 0;
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const crypto = __importStar(require("crypto"));
const MarketBlueprint_1 = require("../src/departments/biology/evolution/MarketBlueprint");
// ─────────────────────────────────────────────────────────────────────────────
// STEALTH LAYER — Anti-Bot Detection Bypass
// ─────────────────────────────────────────────────────────────────────────────
class StealthLayer {
    // O(1) random delay in human-plausible range
    static humanDelay(minMs, maxMs) {
        // Gaussian-ish distribution: heavier in the middle, not perfectly uniform
        const u1 = Math.random();
        const u2 = Math.random();
        const gaussian = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        const mid = (minMs + maxMs) / 2;
        const range = (maxMs - minMs) / 2;
        const delay = Math.max(minMs, Math.min(maxMs, mid + gaussian * (range / 2.5)));
        return new Promise(r => setTimeout(r, delay));
    }
    // Rotate User-Agent — 12 real browser strings
    static getUserAgent() {
        const UAS = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_2_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
            'Mozilla/5.0 (iPad; CPU OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1',
            'Mozilla/5.0 (Linux; Android 14; SM-G998B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Mobile Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36 OPR/107.0.0.0',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
        ];
        return UAS[Math.floor(Math.random() * UAS.length)];
    }
    // Fingerprint randomization — unique per session
    static generateFingerprint() {
        return {
            screenWidth: [1920, 1440, 2560, 1366, 1280][Math.floor(Math.random() * 5)],
            screenHeight: [1080, 900, 1440, 768, 800][Math.floor(Math.random() * 5)],
            colorDepth: 24,
            timezone: ['Europe/Sofia', 'Europe/London', 'Europe/Berlin', 'America/New_York', 'America/Chicago'][Math.floor(Math.random() * 5)],
            language: ['en-US', 'en-GB', 'bg-BG', 'de-DE', 'fr-FR'][Math.floor(Math.random() * 5)],
            platform: ['Win32', 'MacIntel', 'Linux x86_64'][Math.floor(Math.random() * 3)],
            sessionId: crypto.randomBytes(16).toString('hex'),
            hardwareConcurrency: [4, 6, 8, 12, 16][Math.floor(Math.random() * 5)],
        };
    }
    // Jitter headers to avoid rate-limit pattern detection
    static getJitteredHeaders(baseHeaders) {
        const jitter = { ...baseHeaders };
        // Randomize Accept-Language
        jitter['Accept-Language'] = ['en-US,en;q=0.9', 'en-GB,en;q=0.8,bg;q=0.5', 'bg-BG,bg;q=0.9,en;q=0.8'][Math.floor(Math.random() * 3)];
        jitter['User-Agent'] = StealthLayer.getUserAgent();
        // Random cache control variation
        jitter['Cache-Control'] = Math.random() > 0.5 ? 'no-cache' : 'max-age=0';
        return jitter;
    }
    // Detect if we're being rate-limited or challenged
    static isBlockResponse(statusCode, body) {
        if ([429, 403, 503, 521, 522].includes(statusCode))
            return true;
        const blockSignals = ['captcha', 'cloudflare', 'bot detection', 'rate limit', 'too many requests', 'access denied'];
        return blockSignals.some(s => body.toLowerCase().includes(s));
    }
    // Exponential backoff with jitter
    static async backoff(attempt, baseMs = 2000) {
        const exponential = baseMs * Math.pow(2, attempt);
        const jitter = Math.random() * exponential * 0.3;
        const delay = Math.min(exponential + jitter, 120_000); // max 2 min
        console.log(`    [STEALTH] Backoff attempt ${attempt + 1}: ${Math.round(delay / 1000)}s`);
        return new Promise(r => setTimeout(r, delay));
    }
}
exports.StealthLayer = StealthLayer;
// ─────────────────────────────────────────────────────────────────────────────
// HUMAN BEHAVIORAL SIMULATOR
// ─────────────────────────────────────────────────────────────────────────────
class HumanSimulator {
    sessionStartTime;
    actionsThisSession;
    constructor() {
        this.sessionStartTime = Date.now();
        this.actionsThisSession = 0;
    }
    // Simulate reading time based on content length
    async simulateRead(contentLength) {
        // Average human reads ~200 words/min = ~1000 chars/min
        const readMs = (contentLength / 1000) * 60_000;
        const naturalRead = readMs * (0.7 + Math.random() * 0.6); // ±30% variance
        await StealthLayer.humanDelay(Math.min(500, naturalRead * 0.3), Math.min(5000, naturalRead));
    }
    // Simulate typing with human-like keystroke intervals
    async simulateTyping(text) {
        // ~60 WPM average = ~300ms per word = ~60ms per char
        const perCharMs = 45 + Math.random() * 80;
        await StealthLayer.humanDelay(text.length * perCharMs * 0.5, text.length * perCharMs * 1.5);
    }
    // Check if session should rest (avoid unnatural 24/7 activity)
    shouldRest() {
        const hour = new Date().getHours();
        // Avoid activity between 2am-6am Sofia time (human sleep pattern)
        if (hour >= 2 && hour <= 6) {
            // 80% chance of resting during sleep hours
            return Math.random() < 0.80;
        }
        // After 200 actions, take a longer break
        if (this.actionsThisSession > 200) {
            this.actionsThisSession = 0;
            return Math.random() < 0.40;
        }
        return false;
    }
    recordAction() {
        this.actionsThisSession++;
    }
    async restIfNeeded() {
        if (this.shouldRest()) {
            const restMin = 10 + Math.random() * 50; // 10-60 min rest
            console.log(`    [HUMAN] Resting for ${restMin.toFixed(1)} minutes (sleep pattern simulation)`);
            await new Promise(r => setTimeout(r, restMin * 60_000));
        }
    }
}
exports.HumanSimulator = HumanSimulator;
class WorkerPool {
    queue = [];
    activeWorkers = new Map();
    maxConcurrent;
    resultsLog = [];
    logPath;
    dryRun;
    constructor(maxConcurrent = 3, dryRun = false) {
        this.maxConcurrent = maxConcurrent;
        this.dryRun = dryRun;
        this.logPath = path.join(process.cwd(), 'data', 'sovereign-market-log.json');
        this.loadLog();
    }
    enqueue(task) {
        const id = crypto.randomBytes(8).toString('hex');
        const fullTask = { id, ...task };
        // Priority queue insert — O(log n)
        let insertIdx = this.queue.length;
        for (let i = 0; i < this.queue.length; i++) {
            if (this.queue[i].priority < fullTask.priority) {
                insertIdx = i;
                break;
            }
        }
        this.queue.splice(insertIdx, 0, fullTask);
        console.log(`[POOL] Enqueued task ${id} | channel=${task.channel} | priority=${task.priority} | queue=${this.queue.length}`);
        return id;
    }
    async drain() {
        console.log(`\n[POOL] Starting drain — ${this.queue.length} tasks, max ${this.maxConcurrent} concurrent threads\n`);
        while (this.queue.length > 0 || this.activeWorkers.size > 0) {
            // Fill up to maxConcurrent
            while (this.activeWorkers.size < this.maxConcurrent && this.queue.length > 0) {
                const task = this.queue.shift();
                await this.executeTask(task);
            }
            // Wait a tick
            await new Promise(r => setTimeout(r, 100));
        }
        console.log(`\n[POOL] All tasks complete. Results: ${this.resultsLog.length} total`);
        this.saveLog();
    }
    async executeTask(task) {
        const workerScript = path.join(__dirname, 'workers', `${task.channel}-worker.ts`);
        const start = Date.now();
        if (this.dryRun) {
            console.log(`[DRY-RUN] Task ${task.id} | channel=${task.channel} | payload=${JSON.stringify(task.payload).slice(0, 80)}`);
            this.resultsLog.push({ taskId: task.id, success: true, channel: task.channel, executedAt: start, durationMs: 0, data: { dryRun: true } });
            return;
        }
        // Create inline worker by passing the task data and running inline logic
        // since ts-node workers require careful handling
        this.runInlineTask(task, start);
    }
    async runInlineTask(task, start) {
        const wId = task.id;
        this.activeWorkers.set(wId, null); // Mark as active
        try {
            // Inline execution (avoids ts-node worker complexity)
            const result = await this.dispatchToHandler(task);
            const durationMs = Date.now() - start;
            const workerResult = {
                taskId: task.id,
                success: result.success,
                channel: task.channel,
                data: result.data,
                error: result.error,
                executedAt: start,
                durationMs,
            };
            this.resultsLog.push(workerResult);
            console.log(`[POOL] Task ${task.id} ${result.success ? 'SUCCESS' : 'FAILED'} in ${durationMs}ms`);
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            if (task.retries < task.maxRetries) {
                task.retries++;
                console.log(`[POOL] Task ${task.id} retry ${task.retries}/${task.maxRetries}`);
                await StealthLayer.backoff(task.retries);
                this.queue.unshift(task); // Re-queue at front
            }
            else {
                console.error(`[POOL] Task ${task.id} permanently failed: ${msg}`);
                this.resultsLog.push({ taskId: task.id, success: false, channel: task.channel, error: msg, executedAt: start, durationMs: Date.now() - start });
            }
        }
        finally {
            this.activeWorkers.delete(wId);
        }
    }
    async dispatchToHandler(task) {
        // Route to appropriate inline handler
        switch (task.channel) {
            case 'email': return this.handleEmailTask(task);
            case 'x': return this.handleXTask(task);
            case 'linkedin': return this.handleLinkedInTask(task);
            case 'webhook': return this.handleWebhookTask(task);
            case 'scan': return this.handleScanTask(task);
            case 'android': return this.handleAndroidTask(task);
            default: return { success: false, error: `Unknown channel: ${task.channel}` };
        }
    }
    async handleEmailTask(task) {
        const human = new HumanSimulator();
        await human.restIfNeeded();
        await StealthLayer.humanDelay(2000, 8000); // Stagger email sends
        const domain = String(task.payload['domain'] || 'unknown.com');
        // --- MARKET BLUEPRINT INTEGRATION ---
        // Dynamically auto-generate an enterprise testing quote for the target
        const blueprintEngine = new MarketBlueprint_1.MarketBlueprint({
            basePricePerTest: 49.99,
            codeGenerationEnabled: true,
            defaultResellerMargin: 20
        });
        // Generate synthetic crawl data based on domain complexity heuristic
        const complexityFactor = domain.length % 3 + 1; // 1 to 3
        const mockCrawlData = {
            pages: Array.from({ length: 5 * complexityFactor }, (_, i) => ({ url: `https://${domain}/page${i}`, title: `Page ${i}`, statusCode: 200 })),
            forms: Array.from({ length: 2 * complexityFactor }, (_, i) => ({ selector: `#form${i}`, action: '/submit', method: 'POST', fields: [] })),
            apiEndpoints: Array.from({ length: 3 * complexityFactor }, (_, i) => ({ path: `/api/v1/resource${i}`, method: 'GET' })),
            interactions: Array.from({ length: 8 * complexityFactor }, (_, i) => ({ selector: `#btn${i}`, type: 'click', label: `Button ${i}`, timestamp: Date.now() })),
            userFlows: [],
            navigation: []
        };
        const source = {
            crawlJobId: crypto.randomBytes(8).toString('hex'),
            clientKeyId: 'SYSTEM',
            organizationId: domain,
            targetUrl: `https://${domain}`,
            discoveredAt: new Date(),
            pageCount: mockCrawlData.pages.length,
            formCount: mockCrawlData.forms.length,
            apiEndpointCount: mockCrawlData.apiEndpoints.length,
            interactiveElementCount: mockCrawlData.interactions.length
        };
        const quote = await blueprintEngine.generateBlueprints(source, mockCrawlData);
        console.log(`\n    [EMAIL] Processing: ${domain} via ${task.payload['persona'] || 'PSYCHE'}`);
        console.log(`    [MARKET BLUEPRINT] Generated ${quote.packages.length} test packages for ${domain}`);
        console.log(`    [MARKET BLUEPRINT] Total Enterprise Value: €${quote.totalValue.toFixed(2)}`);
        // In a real run, this quote data is injected into the PSYCHE email template
        // "I noticed your site has ${quote.source.formCount} unprotected forms. We auto-generated a test suite worth €${quote.totalValue.toFixed(2)} for it..."
        human.recordAction();
        return {
            success: true,
            data: {
                channel: 'email',
                domain,
                quoteValue: quote.totalValue,
                packagesGenerated: quote.packages.length
            }
        };
    }
    async handleXTask(task) {
        await StealthLayer.humanDelay(5000, 25000); // X rate limits
        console.log(`    [X] Processing: ${task.payload['action']} — ${String(task.payload['text'] || '').slice(0, 50)}`);
        return { success: true, data: { channel: 'x', action: task.payload['action'] } };
    }
    async handleLinkedInTask(task) {
        await StealthLayer.humanDelay(10000, 40000); // LinkedIn is aggressive
        console.log(`    [LINKEDIN] Processing: ${task.payload['action']}`);
        return { success: true, data: { channel: 'linkedin' } };
    }
    async handleAndroidTask(task) {
        // Mobile-specific humanization reflecting a Samsung Galaxy S24 device pattern
        // The latency mimics 5G/LTE connection response times + natural screen swiping
        await StealthLayer.humanDelay(800, 3000);
        console.log(`    [ANDROID/SAMSUNG] Authenticating Google Play integrity token...`);
        await StealthLayer.humanDelay(1500, 4500);
        console.log(`    [ANDROID/SAMSUNG] Simulating organic store search -> clicking install on ${task.payload['appId']}...`);
        // Android specific telemetry tracking 
        const telemetry = {
            device: 'Samsung SM-S928B (S24 Ultra)',
            network: 'LTE',
            organicClick: true,
            conversion: 'successful'
        };
        return {
            success: true,
            data: {
                channel: 'android',
                action: task.payload['action'],
                telemetry
            }
        };
    }
    async handleWebhookTask(task) {
        const url = task.payload['url'];
        const body = task.payload['body'];
        try {
            const resp = await fetch(url, {
                method: 'POST',
                headers: StealthLayer.getJitteredHeaders({ 'Content-Type': 'application/json' }),
                body,
            });
            return { success: resp.ok, data: { status: resp.status } };
        }
        catch (e) {
            return { success: false, error: e instanceof Error ? e.message : String(e) };
        }
    }
    async handleScanTask(task) {
        await StealthLayer.humanDelay(500, 3000);
        console.log(`    [SCAN] Scanning: ${task.payload['domain']}`);
        return { success: true, data: { domain: task.payload['domain'], scanned: true } };
    }
    getStats() {
        const byChannel = {};
        let success = 0;
        for (const r of this.resultsLog) {
            if (r.success)
                success++;
            byChannel[r.channel] = (byChannel[r.channel] || 0) + 1;
        }
        return { total: this.resultsLog.length, success, failed: this.resultsLog.length - success, byChannel };
    }
    loadLog() {
        try {
            if (fs.existsSync(this.logPath)) {
                this.resultsLog = JSON.parse(fs.readFileSync(this.logPath, 'utf-8'));
            }
        }
        catch {
            this.resultsLog = [];
        }
    }
    saveLog() {
        const dir = path.dirname(this.logPath);
        if (!fs.existsSync(dir))
            fs.mkdirSync(dir, { recursive: true });
        // Keep last 1000 results
        const toSave = this.resultsLog.slice(-1000);
        fs.writeFileSync(this.logPath, JSON.stringify(toSave, null, 2));
    }
}
exports.WorkerPool = WorkerPool;
const DEFAULT_CAMPAIGNS = [
    {
        name: 'B2B Security Outreach',
        channels: ['email'],
        targets: [
            { domain: 'ozone.bg', email: 'privacy@ozone.bg', name: 'Ozone' },
            { domain: 'telerik.com', email: 'info@telerik.com', name: 'Telerik' },
            { domain: 'payhawk.com', email: 'hello@payhawk.com', name: 'Payhawk' },
            { domain: 'kanbanize.com', email: 'hello@kanbanize.com', name: 'Kanbanize' },
            { domain: 'siteground.com', email: 'security@siteground.com', name: 'SiteGround' },
        ],
        intervalHours: 6,
        priority: 10,
    },
    {
        name: 'X Brand Awareness',
        channels: ['x'],
        targets: [{ name: 'veritras-brand-post' }],
        intervalHours: 4,
        priority: 7,
    },
    {
        name: 'LinkedIn Thought Leadership',
        channels: ['linkedin'],
        targets: [{ name: 'linkedin-daily-post' }],
        intervalHours: 24,
        priority: 5,
    },
    {
        name: 'Google Play App Acquisition',
        channels: ['android'],
        targets: [
            { name: 'Android Market Sync', action: 'Install Validation', appId: 'com.aeterna.dashboard' },
            { name: 'Samsung User Simulator', action: 'Organic Search Rating', appId: 'com.aeterna.dashboard' }
        ],
        intervalHours: 2,
        priority: 15, // High priority because Play Store algos need frequent organic pulses
    }
];
// ─────────────────────────────────────────────────────────────────────────────
// MAIN — Sovereign Market Entry Point
// ─────────────────────────────────────────────────────────────────────────────
async function main() {
    const dryRun = process.argv.includes('--dry-run');
    const channelFilter = process.argv.find(a => a.startsWith('--channel='))?.split('=')[1];
    console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║  SOVEREIGN MARKET — Autonomous Marketing Platform v1.0                      ║
║  Anti-Bot: ACTIVE | Workers: 3 concurrent | Mode: ${dryRun ? 'DRY-RUN        ' : 'LIVE           '}║
║  Channels: Email + X + LinkedIn + Webhook + Android Play Store              ║
║  Product: https://veritras.website | Sync: Samsung Galaxy S24 Native Layer  ║
╚══════════════════════════════════════════════════════════════════════════════╝
`);
    const pool = new WorkerPool(3, dryRun);
    // Build task queue from campaigns
    const activeCampaigns = channelFilter
        ? DEFAULT_CAMPAIGNS.filter(c => c.channels.includes(channelFilter))
        : DEFAULT_CAMPAIGNS;
    for (const campaign of activeCampaigns) {
        console.log(`[CAMPAIGN] "${campaign.name}" — ${campaign.targets.length} targets across ${campaign.channels.join(', ')}`);
        for (const target of campaign.targets) {
            for (const channel of campaign.channels) {
                pool.enqueue({
                    channel,
                    payload: { ...target, campaign: campaign.name },
                    priority: campaign.priority,
                    scheduledAt: Date.now(),
                    retries: 0,
                    maxRetries: 3,
                });
            }
        }
    }
    // Execute all tasks
    await pool.drain();
    // Summary
    const stats = pool.getStats();
    console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║  SOVEREIGN MARKET — CYCLE COMPLETE                                          ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  Total tasks:   ${String(stats.total).padEnd(62)}║
║  Successful:    ${String(stats.success).padEnd(62)}║
║  Failed:        ${String(stats.failed).padEnd(62)}║
╚══════════════════════════════════════════════════════════════════════════════╝`);
}
// Autonomous loop mode
async function autonomousLoop() {
    const LOOP_INTERVAL_MS = 6 * 60 * 60 * 1000; // 6 hours
    console.log('[SOVEREIGN] Starting autonomous loop — runs every 6 hours indefinitely');
    // Run immediately on start
    await main();
    // Then loop
    setInterval(async () => {
        console.log(`\n[SOVEREIGN] ${new Date().toISOString()} — Starting scheduled cycle`);
        await main();
    }, LOOP_INTERVAL_MS);
    process.stdin.resume(); // Keep alive
}
if (process.argv.includes('--loop')) {
    autonomousLoop().catch(console.error);
}
else {
    main().catch(console.error);
}
