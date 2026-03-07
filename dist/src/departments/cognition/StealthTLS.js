"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║          STEALTH TLS - TLS FINGERPRINT SPOOFING ENGINE                       ║
 * ║                                                                               ║
 * ║   Маскира Node.js TLS отпечатъка (JA3) да изглежда като истински Chrome.      ║
 * ║   "If they can't fingerprint you, they can't block you."                      ║
 * ║                                                                               ║
 * ║   Architecture:                                                               ║
 * ║   • CycleTLS bridge — Golang-based TLS engine with Chrome JA3 signatures     ║
 * ║   • Header harmonization — User-Agent + Accept-Language + TLS match          ║
 * ║   • Cipher suite rotation — randomize within Chrome-valid set                ║
 * ║   • Fallback chain — CycleTLS → tls-client → native https with overrides    ║
 * ║                                                                               ║
 * ║  Created: 2026-02-23 | QAntum Prime v28.2.0 - Stealth Layer 2               ║
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
exports.StealthTLS = void 0;
exports.getStealthTLS = getStealthTLS;
const https = __importStar(require("https"));
const tls = __importStar(require("tls"));
const http = __importStar(require("http"));
const events_1 = require("events");
// ═══════════════════════════════════════════════════════════════════════════════
// CHROME BROWSER PROFILES DATABASE
// ═══════════════════════════════════════════════════════════════════════════════
const CHROME_PROFILES = {
    121: {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        acceptLanguage: 'en-US,en;q=0.9',
        platform: 'Win32',
        secChUa: '"Not A(Brand";v="99", "Google Chrome";v="121", "Chromium";v="121"',
        secChUaPlatform: '"Windows"',
        secChUaMobile: '?0',
        acceptEncoding: 'gzip, deflate, br',
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        connection: 'keep-alive',
        cipherSuites: [
            'TLS_AES_128_GCM_SHA256',
            'TLS_AES_256_GCM_SHA384',
            'TLS_CHACHA20_POLY1305_SHA256',
            'TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256',
            'TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256',
            'TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384',
            'TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384',
            'TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305_SHA256',
            'TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305_SHA256',
            'TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA',
            'TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA',
            'TLS_RSA_WITH_AES_128_GCM_SHA256',
            'TLS_RSA_WITH_AES_256_GCM_SHA384',
            'TLS_RSA_WITH_AES_128_CBC_SHA',
            'TLS_RSA_WITH_AES_256_CBC_SHA',
        ],
        tlsVersion: 'TLSv1.3',
        extensions: [0, 23, 65281, 10, 11, 35, 16, 5, 13, 18, 51, 45, 43, 27, 17513, 21],
        ja3: '771,4865-4866-4867-49195-49199-49196-49200-52393-52392-49171-49172-156-157-47-53,0-23-65281-10-11-35-16-5-13-18-51-45-43-27-17513-21,29-23-24,0',
    },
    122: {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        acceptLanguage: 'en-US,en;q=0.9',
        platform: 'Win32',
        secChUa: '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
        secChUaPlatform: '"Windows"',
        secChUaMobile: '?0',
        acceptEncoding: 'gzip, deflate, br, zstd',
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        connection: 'keep-alive',
        cipherSuites: [
            'TLS_AES_128_GCM_SHA256',
            'TLS_AES_256_GCM_SHA384',
            'TLS_CHACHA20_POLY1305_SHA256',
            'TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256',
            'TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256',
            'TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384',
            'TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384',
            'TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305_SHA256',
            'TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305_SHA256',
            'TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA',
            'TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA',
            'TLS_RSA_WITH_AES_128_GCM_SHA256',
            'TLS_RSA_WITH_AES_256_GCM_SHA384',
            'TLS_RSA_WITH_AES_128_CBC_SHA',
            'TLS_RSA_WITH_AES_256_CBC_SHA',
        ],
        tlsVersion: 'TLSv1.3',
        extensions: [0, 23, 65281, 10, 11, 35, 16, 5, 13, 18, 51, 45, 43, 27, 17513, 21],
        ja3: '771,4865-4866-4867-49195-49199-49196-49200-52393-52392-49171-49172-156-157-47-53,0-23-65281-10-11-35-16-5-13-18-51-45-43-27-17513-21,29-23-24,0',
    },
    131: {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        acceptLanguage: 'en-US,en;q=0.9',
        platform: 'Win32',
        secChUa: '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
        secChUaPlatform: '"Windows"',
        secChUaMobile: '?0',
        acceptEncoding: 'gzip, deflate, br, zstd',
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        connection: 'keep-alive',
        cipherSuites: [
            'TLS_AES_128_GCM_SHA256',
            'TLS_AES_256_GCM_SHA384',
            'TLS_CHACHA20_POLY1305_SHA256',
            'TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256',
            'TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256',
            'TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384',
            'TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384',
            'TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305_SHA256',
            'TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305_SHA256',
            'TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA',
            'TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA',
            'TLS_RSA_WITH_AES_128_GCM_SHA256',
            'TLS_RSA_WITH_AES_256_GCM_SHA384',
        ],
        tlsVersion: 'TLSv1.3',
        extensions: [0, 23, 65281, 10, 11, 35, 16, 5, 13, 18, 51, 45, 43, 27, 17513, 21, 41],
        ja3: '771,4865-4866-4867-49195-49199-49196-49200-52393-52392-49171-49172-156-157-47-53,0-23-65281-10-11-35-16-5-13-18-51-45-43-27-17513-21-41,29-23-24,0',
    },
};
// User-Agent pool for rotation
const UA_POOL_WINDOWS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0',
];
const UA_POOL_MAC = [
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2.1 Safari/605.1.15',
];
const UA_POOL_LINUX = [
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:123.0) Gecko/20100101 Firefox/123.0',
];
// ═══════════════════════════════════════════════════════════════════════════════
// STEALTH TLS ENGINE
// ═══════════════════════════════════════════════════════════════════════════════
class StealthTLS extends events_1.EventEmitter {
    config;
    activeProfile;
    cycleTLS = null;
    requestCount = 0;
    lastRotation = Date.now();
    constructor(config) {
        super();
        this.config = {
            chromeVersion: config?.chromeVersion ?? 131,
            rotateUA: config?.rotateUA ?? true,
            useCycleTLS: config?.useCycleTLS ?? true,
            locale: config?.locale ?? 'en-US',
            extraLocales: config?.extraLocales ?? ['en', 'bg'],
            platform: config?.platform ?? 'Windows',
            randomizeCiphers: config?.randomizeCiphers ?? true,
        };
        // Select closest Chrome profile
        this.activeProfile = this.selectProfile();
        console.log(`🔒 StealthTLS initialized — JA3 emulating Chrome/${this.config.chromeVersion} on ${this.config.platform}`);
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // PUBLIC API
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Initialize CycleTLS bridge (if available).
     * CycleTLS uses a Golang subprocess for genuine Chrome TLS handshakes.
     */
    // Complexity: O(1)
    async initCycleTLS() {
        if (!this.config.useCycleTLS)
            return false;
        try {
            // Try to load CycleTLS (npm install cycletls)
            const CycleTLS = require('cycletls');
            this.cycleTLS = new CycleTLS();
            console.log('   ✅ CycleTLS Golang bridge active — genuine Chrome JA3');
            return true;
        }
        catch {
            console.log('   ⚠️ CycleTLS not installed — using native TLS with spoofed ciphers');
            console.log('   💡 Install: npm install cycletls');
            return false;
        }
    }
    /**
     * Make a stealth HTTP request with Chrome-like TLS fingerprint.
     * Fallback chain: CycleTLS → Native HTTPS with cipher override → Raw HTTPS
     */
    // Complexity: O(1) — amortized
    async request(req) {
        this.requestCount++;
        // Rotate UA every 15-30 requests
        if (this.config.rotateUA && this.requestCount % this.randInt(15, 30) === 0) {
            this.rotateUserAgent();
        }
        const startTime = Date.now();
        // Try CycleTLS first
        if (this.cycleTLS) {
            try {
                return await this.cycleTLSRequest(req, startTime);
            }
            catch (err) {
                this.emit('fallback', { from: 'cycletls', reason: err.message });
            }
        }
        // Native HTTPS with TLS overrides
        try {
            return await this.nativeStealthRequest(req, startTime);
        }
        catch (err) {
            this.emit('fallback', { from: 'native-stealth', reason: err.message });
        }
        // Raw fallback
        return this.rawRequest(req, startTime);
    }
    /**
     * Get harmonized headers that match the current TLS profile.
     * Use these when making requests to avoid TLS/Header mismatch detection.
     */
    // Complexity: O(1) — amortized
    getHarmonizedHeaders(extra) {
        const p = this.activeProfile;
        const acceptLang = this.buildAcceptLanguage();
        return {
            'User-Agent': p.userAgent,
            'Accept': p.accept,
            'Accept-Encoding': p.acceptEncoding,
            'Accept-Language': acceptLang,
            'Connection': p.connection,
            'Sec-CH-UA': p.secChUa,
            'Sec-CH-UA-Mobile': p.secChUaMobile,
            'Sec-CH-UA-Platform': p.secChUaPlatform,
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1',
            'Upgrade-Insecure-Requests': '1',
            'Cache-Control': 'max-age=0',
            ...extra,
        };
    }
    /**
     * Get Playwright browser launch args for TLS consistency.
     */
    // Complexity: O(1)
    getPlaywrightArgs() {
        return [
            `--user-agent=${this.activeProfile.userAgent}`,
            '--disable-blink-features=AutomationControlled',
            '--disable-features=IsolateOrigins,site-per-process',
            '--disable-site-isolation-trials',
            '--disable-web-security',
            '--no-first-run',
            '--no-default-browser-check',
            '--disable-infobars',
            `--lang=${this.config.locale}`,
        ];
    }
    /**
     * Apply stealth patches to a Playwright page.
     */
    // Complexity: O(1) — amortized
    async patchPage(page) {
        // Override navigator properties
        // SAFETY: async operation — wrap in try-catch for production resilience
        await page.addInitScript(() => {
            // Remove webdriver flag
            Object.defineProperty(navigator, 'webdriver', { get: () => false });
            // Chrome-specific properties
            window.chrome = {
                runtime: {},
                loadTimes: function () { },
                csi: function () { },
                app: { isInstalled: false },
            };
            // Override plugins (empty = headless detection)
            Object.defineProperty(navigator, 'plugins', {
                get: () => [
                    { name: 'Chrome PDF Plugin', filename: 'internal-pdf-viewer' },
                    { name: 'Chrome PDF Viewer', filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai' },
                    { name: 'Native Client', filename: 'internal-nacl-plugin' },
                ],
            });
            // Override languages
            Object.defineProperty(navigator, 'languages', {
                get: () => ['en-US', 'en'],
            });
            // Override hardware concurrency to realistic value
            Object.defineProperty(navigator, 'hardwareConcurrency', {
                get: () => 8,
            });
            // Override device memory
            Object.defineProperty(navigator, 'deviceMemory', {
                get: () => 8,
            });
            // Override permissions
            const originalQuery = window.navigator.permissions.query;
            window.navigator.permissions.query = (parameters) => parameters.name === 'notifications'
                ? Promise.resolve({ state: Notification.permission })
                : originalQuery(parameters);
            // WebGL vendor/renderer
            const getParameter = WebGLRenderingContext.prototype.getParameter;
            WebGLRenderingContext.prototype.getParameter = function (parameter) {
                if (parameter === 37445)
                    return 'Intel Inc.';
                if (parameter === 37446)
                    return 'Intel Iris OpenGL Engine';
                return getParameter.call(this, parameter);
            };
        });
        this.emit('page-patched', { url: page.url?.() || 'unknown' });
    }
    /**
     * Get current TLS profile info.
     */
    // Complexity: O(1)
    getProfileInfo() {
        return {
            userAgent: this.activeProfile.userAgent,
            ja3: this.activeProfile.ja3,
            chromeVersion: this.config.chromeVersion,
            platform: this.config.platform,
            requestCount: this.requestCount,
            hasCycleTLS: !!this.cycleTLS,
        };
    }
    /**
     * Cleanup resources.
     */
    // Complexity: O(1)
    async shutdown() {
        if (this.cycleTLS?.exit) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.cycleTLS.exit();
            this.cycleTLS = null;
        }
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // REQUEST IMPLEMENTATIONS
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * CycleTLS — genuine Chrome TLS handshake via Golang subprocess.
     */
    // Complexity: O(1) — amortized
    async cycleTLSRequest(req, startTime) {
        const headers = this.getHarmonizedHeaders(req.headers);
        // SAFETY: async operation — wrap in try-catch for production resilience
        const response = await this.cycleTLS(req.url, {
            body: req.body?.toString() || '',
            headers,
            ja3: this.activeProfile.ja3,
            userAgent: this.activeProfile.userAgent,
            timeout: req.timeout || 30_000,
            disableRedirect: !(req.followRedirects ?? true),
        }, req.method || 'GET');
        return {
            status: response.status,
            headers: response.headers || {},
            body: response.body,
            provider: 'cycletls',
            ja3Hash: this.activeProfile.ja3,
            timing: this.calculateTiming(startTime),
        };
    }
    /**
     * Native HTTPS with cipher suite override — best effort without CycleTLS.
     */
    // Complexity: O(N)
    nativeStealthRequest(req, startTime) {
        const headers = this.getHarmonizedHeaders(req.headers);
        const url = new URL(req.url);
        // Build cipher list matching Chrome
        const ciphers = this.config.randomizeCiphers
            ? this.shuffleCiphers(this.activeProfile.cipherSuites)
            : this.activeProfile.cipherSuites;
        return new Promise((resolve, reject) => {
            const options = {
                hostname: url.hostname,
                port: url.port || 443,
                path: url.pathname + url.search,
                method: req.method || 'GET',
                headers,
                timeout: req.timeout || 30_000,
            };
            // Override TLS options for cipher control
            const secureContext = tls.createSecureContext({
                ciphers: ciphers.join(':'),
                minVersion: 'TLSv1.2',
                maxVersion: 'TLSv1.3',
            });
            options.secureContext = secureContext;
            const request = https.request(options, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    // Complexity: O(1)
                    resolve({
                        status: res.statusCode || 0,
                        headers: res.headers,
                        body: data,
                        provider: 'native-stealth',
                        timing: this.calculateTiming(startTime),
                    });
                });
            });
            request.on('error', reject);
            request.on('timeout', () => { request.destroy(); reject(new Error('Timeout')); });
            if (req.body) {
                request.write(req.body);
            }
            request.end();
        });
    }
    /**
     * Raw HTTPS fallback — minimal stealth.
     */
    // Complexity: O(1) — amortized
    rawRequest(req, startTime) {
        const url = new URL(req.url);
        const isHttps = url.protocol === 'https:';
        const transport = isHttps ? https : http;
        const headers = {
            'User-Agent': this.activeProfile.userAgent,
            ...req.headers,
        };
        return new Promise((resolve, reject) => {
            const request = transport.request({
                hostname: url.hostname,
                port: url.port || (isHttps ? 443 : 80),
                path: url.pathname + url.search,
                method: req.method || 'GET',
                headers,
                timeout: req.timeout || 30_000,
            }, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    // Complexity: O(1)
                    resolve({
                        status: res.statusCode || 0,
                        headers: res.headers,
                        body: data,
                        provider: 'raw',
                        timing: this.calculateTiming(startTime),
                    });
                });
            });
            request.on('error', reject);
            request.on('timeout', () => { request.destroy(); reject(new Error('Timeout')); });
            if (req.body) {
                request.write(req.body);
            }
            request.end();
        });
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // HELPERS
    // ═══════════════════════════════════════════════════════════════════════════
    // Complexity: O(N log N) — sort operation
    selectProfile() {
        const version = this.config.chromeVersion;
        // Find exact match or closest lower version
        const available = Object.keys(CHROME_PROFILES).map(Number).sort((a, b) => b - a);
        const match = available.find(v => v <= version) || available[0];
        const profile = { ...CHROME_PROFILES[match] };
        // Adjust platform if needed
        if (this.config.platform === 'macOS') {
            profile.userAgent = profile.userAgent.replace('Windows NT 10.0; Win64; x64', 'Macintosh; Intel Mac OS X 10_15_7');
            profile.secChUaPlatform = '"macOS"';
            profile.platform = 'MacIntel';
        }
        else if (this.config.platform === 'Linux') {
            profile.userAgent = profile.userAgent.replace('Windows NT 10.0; Win64; x64', 'X11; Linux x86_64');
            profile.secChUaPlatform = '"Linux"';
            profile.platform = 'Linux x86_64';
        }
        return profile;
    }
    // Complexity: O(1)
    rotateUserAgent() {
        const pool = this.config.platform === 'macOS' ? UA_POOL_MAC
            : this.config.platform === 'Linux' ? UA_POOL_LINUX
                : UA_POOL_WINDOWS;
        const newUA = pool[Math.floor(Math.random() * pool.length)];
        this.activeProfile.userAgent = newUA;
        this.lastRotation = Date.now();
        this.emit('ua-rotated', { newUA });
    }
    // Complexity: O(N) — linear iteration
    buildAcceptLanguage() {
        const locales = [this.config.locale, ...this.config.extraLocales];
        return locales
            .map((loc, i) => i === 0 ? loc : `${loc};q=${(1 - i * 0.1).toFixed(1)}`)
            .join(',');
    }
    // Complexity: O(N) — linear iteration
    shuffleCiphers(ciphers) {
        // Shuffle within TLS 1.3 group and TLS 1.2 group separately
        // (TLS 1.3 ciphers must come first)
        const tls13 = ciphers.filter(c => c.startsWith('TLS_AES') || c.startsWith('TLS_CHACHA'));
        const tls12 = ciphers.filter(c => !tls13.includes(c));
        return [...this.fisherYatesShuffle(tls13), ...this.fisherYatesShuffle(tls12)];
    }
    fisherYatesShuffle(arr) {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }
    // Complexity: O(1)
    calculateTiming(startTime) {
        const total = Date.now() - startTime;
        return {
            dns: Math.round(total * 0.1),
            connect: Math.round(total * 0.15),
            tls: Math.round(total * 0.2),
            firstByte: Math.round(total * 0.6),
            total,
        };
    }
    // Complexity: O(1)
    randInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}
exports.StealthTLS = StealthTLS;
// ═══════════════════════════════════════════════════════════════════════════════
// SINGLETON
// ═══════════════════════════════════════════════════════════════════════════════
let stealthInstance = null;
function getStealthTLS(config) {
    if (!stealthInstance) {
        stealthInstance = new StealthTLS(config);
    }
    return stealthInstance;
}
exports.default = StealthTLS;
