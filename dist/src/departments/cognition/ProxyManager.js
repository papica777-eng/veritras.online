"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║           PROXY MANAGER — IP Rotation Orchestrator                           ║
 * ║                                                                               ║
 * ║   Manages residential/datacenter proxy pools with intelligent rotation.      ║
 * ║   Triggered by AntiTamper on 403/CAPTCHA detection.                          ║
 * ║                                                                               ║
 * ║   Features:                                                                   ║
 * ║   • Weighted proxy selection (faster/more reliable proxies get priority)     ║
 * ║   • Session-aware rotation (clears cookies on IP change)                     ║
 * ║   • Health checking & auto-removal of dead proxies                           ║
 * ║   • Rate limiting per proxy (spread load evenly)                             ║
 * ║   • Geo-targeting support (country/city selection)                           ║
 * ║   • Integration with Playwright browser contexts                             ║
 * ║                                                                               ║
 * ║   Proxy Sources:                                                              ║
 * ║   • Manual list (config/env)                                                 ║
 * ║   • Rotating residential API (BrightData/SmartProxy/etc.)                    ║
 * ║   • SOCKS5 support                                                           ║
 * ║                                                                               ║
 * ║  Created: 2026-02-23 | QAntum Prime v28.3.0 - Phase 3: Autonomous Survival  ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
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
exports.ProxyManager = void 0;
exports.getProxyManager = getProxyManager;
const events_1 = require("events");
const http = __importStar(require("http"));
// ═══════════════════════════════════════════════════════════════════════════════
// PROXY MANAGER
// ═══════════════════════════════════════════════════════════════════════════════
class ProxyManager extends events_1.EventEmitter {
    config;
    pool = new Map();
    activeProxy = null;
    lastRotation = 0;
    healthCheckTimer = null;
    using_gateway = false;
    stats = {
        totalRotations: 0,
        totalRequests: 0,
        totalFailures: 0,
        blockedIPs: 0,
        captchaTriggered: 0,
        healthChecks: 0,
        proxiesRemoved: 0,
        directFallbacks: 0,
    };
    constructor(config) {
        super();
        this.config = {
            proxies: config?.proxies || [],
            gatewayURL: config?.gatewayURL || process.env.PROXY_GATEWAY_URL,
            gatewayAuth: config?.gatewayAuth || this.parseGatewayAuth(),
            healthCheckInterval: config?.healthCheckInterval ?? 300_000,
            maxFailures: config?.maxFailures ?? 3,
            testURL: config?.testURL || 'https://httpbin.org/ip',
            testTimeout: config?.testTimeout ?? 10_000,
            minRotationInterval: config?.minRotationInterval ?? 5_000,
            geoTargeting: config?.geoTargeting ?? false,
            preferredCountries: config?.preferredCountries || [],
            maxRequestsPerProxy: config?.maxRequestsPerProxy ?? 100,
            allowDirect: config?.allowDirect ?? true,
        };
        // Parse environment proxies
        if (this.config.proxies.length === 0 && process.env.PROXY_LIST) {
            this.config.proxies = process.env.PROXY_LIST.split(',').map(p => p.trim()).filter(Boolean);
        }
        // Initialize pool
        for (const proxyUrl of this.config.proxies) {
            this.addProxy(proxyUrl);
        }
        // Check if using gateway
        if (this.config.gatewayURL) {
            this.using_gateway = true;
            this.addProxy(this.config.gatewayURL);
        }
        console.log(`🔄 ProxyManager initialized — ${this.pool.size} proxies loaded` +
            (this.using_gateway ? ' + gateway' : ''));
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // PROXY POOL MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Add a proxy to the pool.
     */
    // Complexity: O(1) — hash/map lookup
    addProxy(proxyUrl, meta) {
        if (this.pool.has(proxyUrl))
            return;
        try {
            const parsed = new URL(proxyUrl);
            const entry = {
                url: proxyUrl,
                protocol: parsed.protocol.replace(':', '') || 'http',
                host: parsed.hostname,
                port: parseInt(parsed.port) || 80,
                auth: parsed.username ? {
                    username: decodeURIComponent(parsed.username),
                    password: decodeURIComponent(parsed.password || ''),
                } : undefined,
                alive: true, // Assume alive until proven otherwise
                consecutiveFailures: 0,
                totalRequests: 0,
                totalFailures: 0,
                avgLatencyMs: 0,
                totalLatencyMs: 0,
                latencyMeasurements: 0,
                country: meta?.country,
                city: meta?.city,
                lastUsed: 0,
                lastChecked: 0,
                weight: 1.0,
            };
            this.pool.set(proxyUrl, entry);
        }
        catch (e) {
            console.log(`   ⚠️ Invalid proxy URL: ${proxyUrl} (${e.message})`);
        }
    }
    /**
     * Remove a proxy from the pool.
     */
    // Complexity: O(1)
    removeProxy(proxyUrl) {
        this.pool.delete(proxyUrl);
        if (this.activeProxy?.url === proxyUrl) {
            this.activeProxy = null;
        }
        this.stats.proxiesRemoved++;
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // ROTATION
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Rotate to a new proxy. Called by AntiTamper on 403/CAPTCHA.
     */
    // Complexity: O(1) — amortized
    async rotateIP(reason = 'manual') {
        const now = Date.now();
        // Rate limit rotations
        if (now - this.lastRotation < this.config.minRotationInterval) {
            const wait = this.config.minRotationInterval - (now - this.lastRotation);
            // SAFETY: async operation — wrap in try-catch for production resilience
            await new Promise(r => setTimeout(r, wait));
        }
        const previousProxy = this.activeProxy?.url || 'direct';
        // Mark current proxy as potentially problematic
        if (this.activeProxy && (reason === 'blocked' || reason === 'captcha')) {
            this.activeProxy.consecutiveFailures++;
            this.activeProxy.totalFailures++;
            this.activeProxy.weight *= 0.7; // Reduce weight
            if (reason === 'blocked')
                this.stats.blockedIPs++;
            if (reason === 'captcha')
                this.stats.captchaTriggered++;
            // Remove if too many failures
            if (this.activeProxy.consecutiveFailures >= this.config.maxFailures) {
                console.log(`   ❌ Proxy ${this.activeProxy.host}:${this.activeProxy.port} removed (${this.config.maxFailures} consecutive failures)`);
                this.activeProxy.alive = false;
                this.stats.proxiesRemoved++;
            }
        }
        // Select next proxy
        const nextProxy = this.selectBestProxy();
        if (nextProxy) {
            this.activeProxy = nextProxy;
            this.activeProxy.lastUsed = now;
        }
        else if (this.config.allowDirect) {
            this.activeProxy = null; // Go direct
            this.stats.directFallbacks++;
            console.log('   ⚠️ No proxies available — going direct');
        }
        else {
            console.log('   ❌ No proxies available and direct disabled');
        }
        this.lastRotation = now;
        this.stats.totalRotations++;
        const result = {
            previousProxy,
            newProxy: this.activeProxy?.url || 'direct',
            reason,
            aliveCount: this.getAliveCount(),
        };
        this.emit('rotation', result);
        console.log(`🔄 IP Rotated → ${this.activeProxy ? `${this.activeProxy.host}:${this.activeProxy.port}` : 'DIRECT'} (reason: ${reason})`);
        return result;
    }
    /**
     * Select the best proxy from the pool using weighted random selection.
     * Factors: weight, latency, time since last use, requests count.
     */
    // Complexity: O(N) — linear iteration
    selectBestProxy() {
        const alive = Array.from(this.pool.values()).filter(p => p.alive && p.url !== this.activeProxy?.url);
        if (alive.length === 0)
            return null;
        // Apply geo filter if enabled
        let candidates = alive;
        if (this.config.geoTargeting && this.config.preferredCountries.length > 0) {
            const geoCandidates = alive.filter(p => p.country && this.config.preferredCountries.includes(p.country));
            if (geoCandidates.length > 0)
                candidates = geoCandidates;
        }
        // Score each candidate
        const scored = candidates.map(proxy => {
            let score = proxy.weight;
            // Prefer lower latency
            if (proxy.latencyMeasurements > 0) {
                score *= (1000 / (proxy.avgLatencyMs + 100)); // Inverse latency bonus
            }
            // Prefer less-used proxies
            if (proxy.totalRequests > 0) {
                score *= (1 / (1 + proxy.totalRequests / 100));
            }
            // Prefer proxies not recently used (cooling period)
            const idleTime = Date.now() - proxy.lastUsed;
            if (idleTime > 60_000)
                score *= 1.2; // 1min idle bonus
            // Penalize proxies near max requests
            if (proxy.totalRequests >= this.config.maxRequestsPerProxy * 0.8) {
                score *= 0.3;
            }
            return { proxy, score };
        });
        // Weighted random selection
        const totalScore = scored.reduce((sum, s) => sum + s.score, 0);
        if (totalScore <= 0)
            return scored[0]?.proxy || null;
        let random = Math.random() * totalScore;
        for (const { proxy, score } of scored) {
            random -= score;
            if (random <= 0)
                return proxy;
        }
        return scored[scored.length - 1]?.proxy || null;
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // PLAYWRIGHT INTEGRATION
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Get Playwright browser launch proxy config.
     */
    // Complexity: O(1)
    getPlaywrightProxy() {
        if (!this.activeProxy)
            return undefined;
        const p = this.activeProxy;
        return {
            server: `${p.protocol}://${p.host}:${p.port}`,
            username: p.auth?.username,
            password: p.auth?.password,
        };
    }
    /**
     * Get proxy URL for the current active proxy.
     */
    // Complexity: O(1)
    getActiveProxyURL() {
        return this.activeProxy?.url || null;
    }
    /**
     * Apply proxy to a Playwright browser context.
     * Creates a new context with the current proxy settings.
     */
    // Complexity: O(N) — potential recursive descent
    async applyToContext(browser) {
        const proxy = this.getPlaywrightProxy();
        // SAFETY: async operation — wrap in try-catch for production resilience
        const context = await browser.newContext({
            proxy,
            // Clear all storage on new proxy context
            storageState: undefined,
        });
        return context;
    }
    /**
     * Record a request result (for proxy health tracking).
     */
    // Complexity: O(1) — amortized
    recordRequest(success, latencyMs) {
        if (!this.activeProxy)
            return;
        this.activeProxy.totalRequests++;
        this.stats.totalRequests++;
        if (success) {
            this.activeProxy.consecutiveFailures = 0;
            if (latencyMs !== undefined) {
                this.activeProxy.totalLatencyMs += latencyMs;
                this.activeProxy.latencyMeasurements++;
                this.activeProxy.avgLatencyMs =
                    this.activeProxy.totalLatencyMs / this.activeProxy.latencyMeasurements;
            }
        }
        else {
            this.activeProxy.consecutiveFailures++;
            this.activeProxy.totalFailures++;
            this.stats.totalFailures++;
            if (this.activeProxy.consecutiveFailures >= this.config.maxFailures) {
                this.activeProxy.alive = false;
            }
        }
        // Auto-rotate if max requests reached
        if (this.activeProxy.totalRequests >= this.config.maxRequestsPerProxy) {
            this.rotateIP('max-requests');
        }
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // HEALTH CHECKING
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Start periodic health checks on all proxies.
     */
    // Complexity: O(1)
    startHealthChecks() {
        if (this.healthCheckTimer)
            return;
        // Initial check
        this.checkAllProxies();
        this.healthCheckTimer = setInterval(() => {
            this.checkAllProxies();
        }, this.config.healthCheckInterval);
        console.log(`   🏥 Health checks started (every ${this.config.healthCheckInterval / 1000}s)`);
    }
    /**
     * Stop health checks.
     */
    // Complexity: O(1)
    stopHealthChecks() {
        if (this.healthCheckTimer) {
            // Complexity: O(1)
            clearInterval(this.healthCheckTimer);
            this.healthCheckTimer = null;
        }
    }
    /**
     * Check all proxies in the pool.
     */
    // Complexity: O(N) — linear iteration
    async checkAllProxies() {
        const promises = [];
        for (const [, proxy] of this.pool) {
            promises.push(this.checkProxy(proxy));
        }
        // SAFETY: async operation — wrap in try-catch for production resilience
        await Promise.allSettled(promises);
        this.stats.healthChecks++;
        const alive = this.getAliveCount();
        const total = this.pool.size;
        console.log(`   🏥 Health check complete: ${alive}/${total} proxies alive`);
    }
    /**
     * Check a single proxy's health.
     */
    // Complexity: O(N)
    async checkProxy(proxy) {
        const startTime = Date.now();
        proxy.lastChecked = startTime;
        try {
            const response = await this.testRequest(proxy);
            const latency = Date.now() - startTime;
            if (response.ok) {
                proxy.alive = true;
                proxy.consecutiveFailures = 0;
                proxy.totalLatencyMs += latency;
                proxy.latencyMeasurements++;
                proxy.avgLatencyMs = proxy.totalLatencyMs / proxy.latencyMeasurements;
                // Try to extract IP/country from response
                if (response.data) {
                    try {
                        const json = JSON.parse(response.data);
                        if (json.origin) {
                            // httpbin response
                        }
                    }
                    catch { /* ignore parse errors */ }
                }
                // Boost weight for fast, healthy proxies
                proxy.weight = Math.min(2.0, proxy.weight * 1.1);
            }
            else {
                proxy.consecutiveFailures++;
                proxy.weight *= 0.8;
                if (proxy.consecutiveFailures >= this.config.maxFailures) {
                    proxy.alive = false;
                }
            }
        }
        catch (err) {
            proxy.consecutiveFailures++;
            proxy.weight *= 0.8;
            if (proxy.consecutiveFailures >= this.config.maxFailures) {
                proxy.alive = false;
            }
        }
    }
    /**
     * Make a test request through a proxy.
     */
    // Complexity: O(N)
    testRequest(proxy) {
        return new Promise((resolve) => {
            const testUrl = new URL(this.config.testURL);
            const isHttps = testUrl.protocol === 'https:';
            // For HTTP proxies, use HTTP CONNECT tunnel for HTTPS
            const options = {
                hostname: proxy.host,
                port: proxy.port,
                path: this.config.testURL,
                method: 'GET',
                timeout: this.config.testTimeout,
                headers: {
                    'Host': testUrl.hostname,
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                },
            };
            if (proxy.auth) {
                options.headers['Proxy-Authorization'] =
                    'Basic ' + Buffer.from(`${proxy.auth.username}:${proxy.auth.password}`).toString('base64');
            }
            const req = http.request(options, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    // Complexity: O(1)
                    resolve({ ok: res.statusCode === 200, data });
                });
            });
            req.on('error', () => resolve({ ok: false }));
            req.on('timeout', () => { req.destroy(); resolve({ ok: false }); });
            req.end();
        });
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // UTILITIES
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Parse gateway auth from environment variables.
     */
    // Complexity: O(1)
    parseGatewayAuth() {
        const user = process.env.PROXY_GATEWAY_USER;
        const pass = process.env.PROXY_GATEWAY_PASS;
        const zone = process.env.PROXY_GATEWAY_ZONE;
        if (user && pass)
            return { username: user, password: pass, zone };
        return undefined;
    }
    /**
     * Get count of alive proxies.
     */
    // Complexity: O(N) — linear iteration
    getAliveCount() {
        let count = 0;
        for (const [, p] of this.pool) {
            if (p.alive)
                count++;
        }
        return count;
    }
    /**
     * Get list of all proxies with their status.
     */
    // Complexity: O(N) — linear iteration
    getPoolStatus() {
        return Array.from(this.pool.values()).map(p => ({
            host: p.host,
            port: p.port,
            alive: p.alive,
            latency: Math.round(p.avgLatencyMs),
            requests: p.totalRequests,
            failures: p.totalFailures,
            weight: parseFloat(p.weight.toFixed(2)),
        }));
    }
    /**
     * Check if using direct connection (no proxy).
     */
    // Complexity: O(1)
    isDirect() {
        return this.activeProxy === null;
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // STATS & LIFECYCLE
    // ═══════════════════════════════════════════════════════════════════════════
    // Complexity: O(N) — potential recursive descent
    getStats() {
        return {
            ...this.stats,
            poolSize: this.pool.size,
            aliveCount: this.getAliveCount(),
            activeProxy: this.activeProxy ? `${this.activeProxy.host}:${this.activeProxy.port}` : 'direct',
            usingGateway: this.using_gateway,
        };
    }
    // Complexity: O(1)
    async shutdown() {
        this.stopHealthChecks();
        this.pool.clear();
        this.activeProxy = null;
        console.log('🔄 ProxyManager shutdown');
    }
}
exports.ProxyManager = ProxyManager;
// ═══════════════════════════════════════════════════════════════════════════════
// SINGLETON
// ═══════════════════════════════════════════════════════════════════════════════
let proxyInstance = null;
function getProxyManager(config) {
    if (!proxyInstance) {
        proxyInstance = new ProxyManager(config);
    }
    return proxyInstance;
}
exports.default = ProxyManager;
