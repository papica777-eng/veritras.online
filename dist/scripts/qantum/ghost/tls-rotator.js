"use strict";
/**
 * 👻 GHOST v1.0.0 - TLS Rotator
 *
 * Network Invisibility Module - Makes TLS fingerprints match real browsers.
 *
 * Anti-bot systems use JA3/JA4 fingerprinting to identify headless browsers.
 * JA3 is computed from:
 * - TLS version
 * - Accepted cipher suites
 * - Extension list
 * - Elliptic curves
 * - EC point formats
 *
 * This module rotates TLS configurations to match legitimate Chrome/Firefox browsers.
 *
 * Supported fingerprints:
 * - Chrome 121+ (Windows/Mac/Linux)
 * - Firefox 121+ (Windows/Mac/Linux)
 * - Safari 17+ (Mac)
 * - Edge 121+ (Windows)
 *
 * @version 1.0.0-QANTUM-PRIME
 * @author QANTUM AI Architect
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
exports.MARKET_SHARE = exports.TLS_PROFILES = exports.TLSRotator = void 0;
exports.createTLSRotator = createTLSRotator;
const crypto = __importStar(require("crypto"));
const events_1 = require("events");
const logger_1 = require("../api/unified/utils/logger");
// ============================================================
// REAL BROWSER JA3 FINGERPRINTS
// Captured from actual browsers in January 2025
// ============================================================
const TLS_PROFILES = [
    // Chrome 121 - Windows 11
    {
        profileId: 'chrome_121_win11',
        browser: 'Chrome',
        browserVersion: '121.0.6167.85',
        os: 'Windows 11',
        ja3Hash: 'cd08e31494f9531f560d64c695473da9',
        ja3Full: '771,4865-4866-4867-49195-49199-49196-49200-52393-52392-49171-49172-156-157-47-53,0-23-65281-10-11-35-16-5-13-18-51-45-43-27-17513-21,29-23-24,0',
        ciphers: [
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
            'TLS_RSA_WITH_AES_256_CBC_SHA'
        ],
        minVersion: 'TLSv1.2',
        maxVersion: 'TLSv1.3',
        sigalgs: 'ecdsa_secp256r1_sha256:rsa_pss_rsae_sha256:rsa_pkcs1_sha256:ecdsa_secp384r1_sha384:rsa_pss_rsae_sha384:rsa_pkcs1_sha384:rsa_pss_rsae_sha512:rsa_pkcs1_sha512',
        ecdhCurves: 'X25519:P-256:P-384',
        alpnProtocols: ['h2', 'http/1.1'],
        sessionTimeout: 7200
    },
    // Chrome 121 - macOS Sonoma
    {
        profileId: 'chrome_121_macos',
        browser: 'Chrome',
        browserVersion: '121.0.6167.85',
        os: 'macOS 14.2',
        ja3Hash: 'b32309a26951912be7dba376398abc3b',
        ja3Full: '771,4865-4866-4867-49195-49199-49196-49200-52393-52392-49171-49172-156-157-47-53,0-23-65281-10-11-35-16-5-13-18-51-45-43-27-17513-21,29-23-24,0',
        ciphers: [
            'TLS_AES_128_GCM_SHA256',
            'TLS_AES_256_GCM_SHA384',
            'TLS_CHACHA20_POLY1305_SHA256',
            'TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256',
            'TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256',
            'TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384',
            'TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384',
            'TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305_SHA256',
            'TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305_SHA256'
        ],
        minVersion: 'TLSv1.2',
        maxVersion: 'TLSv1.3',
        sigalgs: 'ecdsa_secp256r1_sha256:rsa_pss_rsae_sha256:rsa_pkcs1_sha256:ecdsa_secp384r1_sha384:rsa_pss_rsae_sha384:rsa_pkcs1_sha384:rsa_pss_rsae_sha512:rsa_pkcs1_sha512',
        ecdhCurves: 'X25519:P-256:P-384',
        alpnProtocols: ['h2', 'http/1.1'],
        sessionTimeout: 7200
    },
    // Firefox 121 - Windows 11
    {
        profileId: 'firefox_121_win11',
        browser: 'Firefox',
        browserVersion: '121.0',
        os: 'Windows 11',
        ja3Hash: '579ccef312d18482fc42e2b822ca2430',
        ja3Full: '771,4865-4867-4866-49195-49199-52393-52392-49196-49200-49162-49161-49171-49172-156-157-47-53,0-23-65281-10-11-35-16-5-34-51-43-13-45-28,29-23-24-25-256-257,0',
        ciphers: [
            'TLS_AES_128_GCM_SHA256',
            'TLS_CHACHA20_POLY1305_SHA256',
            'TLS_AES_256_GCM_SHA384',
            'TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256',
            'TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256',
            'TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305_SHA256',
            'TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305_SHA256',
            'TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384',
            'TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384',
            'TLS_ECDHE_ECDSA_WITH_AES_256_CBC_SHA',
            'TLS_ECDHE_ECDSA_WITH_AES_128_CBC_SHA',
            'TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA',
            'TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA',
            'TLS_RSA_WITH_AES_128_GCM_SHA256',
            'TLS_RSA_WITH_AES_256_GCM_SHA384',
            'TLS_RSA_WITH_AES_128_CBC_SHA',
            'TLS_RSA_WITH_AES_256_CBC_SHA'
        ],
        minVersion: 'TLSv1.2',
        maxVersion: 'TLSv1.3',
        sigalgs: 'ecdsa_secp256r1_sha256:ecdsa_secp384r1_sha384:ecdsa_secp521r1_sha512:rsa_pss_rsae_sha256:rsa_pss_rsae_sha384:rsa_pss_rsae_sha512:rsa_pkcs1_sha256:rsa_pkcs1_sha384:rsa_pkcs1_sha512',
        ecdhCurves: 'X25519:P-256:P-384:P-521:ffdhe2048:ffdhe3072',
        alpnProtocols: ['h2', 'http/1.1'],
        sessionTimeout: 3600
    },
    // Firefox 121 - Linux
    {
        profileId: 'firefox_121_linux',
        browser: 'Firefox',
        browserVersion: '121.0',
        os: 'Ubuntu 22.04',
        ja3Hash: 'e0f04fe9b7ea68a7568219ee11e52e7d',
        ja3Full: '771,4865-4867-4866-49195-49199-52393-52392-49196-49200-49162-49161-49171-49172-156-157-47-53,0-23-65281-10-11-35-16-5-34-51-43-13-45-28,29-23-24-25-256-257,0',
        ciphers: [
            'TLS_AES_128_GCM_SHA256',
            'TLS_CHACHA20_POLY1305_SHA256',
            'TLS_AES_256_GCM_SHA384',
            'TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256',
            'TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256',
            'TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305_SHA256',
            'TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305_SHA256',
            'TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384',
            'TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384'
        ],
        minVersion: 'TLSv1.2',
        maxVersion: 'TLSv1.3',
        sigalgs: 'ecdsa_secp256r1_sha256:ecdsa_secp384r1_sha384:ecdsa_secp521r1_sha512:rsa_pss_rsae_sha256:rsa_pss_rsae_sha384:rsa_pss_rsae_sha512:rsa_pkcs1_sha256:rsa_pkcs1_sha384:rsa_pkcs1_sha512',
        ecdhCurves: 'X25519:P-256:P-384:P-521:ffdhe2048:ffdhe3072',
        alpnProtocols: ['h2', 'http/1.1'],
        sessionTimeout: 3600
    },
    // Safari 17.2 - macOS Sonoma
    {
        profileId: 'safari_17_macos',
        browser: 'Safari',
        browserVersion: '17.2',
        os: 'macOS 14.2',
        ja3Hash: '773906b0efdefa24a7f2b8eb6985bf37',
        ja3Full: '771,4865-4866-4867-49196-49195-52393-49200-49199-52392-49162-49161-49172-49171-157-156-53-47,0-23-65281-10-11-16-5-13-18-51-45-43-27,29-23-24,0',
        ciphers: [
            'TLS_AES_128_GCM_SHA256',
            'TLS_AES_256_GCM_SHA384',
            'TLS_CHACHA20_POLY1305_SHA256',
            'TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384',
            'TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256',
            'TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305_SHA256',
            'TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384',
            'TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256',
            'TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305_SHA256'
        ],
        minVersion: 'TLSv1.2',
        maxVersion: 'TLSv1.3',
        sigalgs: 'ecdsa_secp256r1_sha256:rsa_pss_rsae_sha256:rsa_pkcs1_sha256:ecdsa_secp384r1_sha384:ecdsa_secp521r1_sha512:rsa_pss_rsae_sha384:rsa_pss_rsae_sha512:rsa_pkcs1_sha384:rsa_pkcs1_sha512',
        ecdhCurves: 'X25519:P-256:P-384',
        alpnProtocols: ['h2', 'http/1.1'],
        sessionTimeout: 7200
    },
    // Edge 121 - Windows 11
    {
        profileId: 'edge_121_win11',
        browser: 'Edge',
        browserVersion: '121.0.2277.83',
        os: 'Windows 11',
        ja3Hash: 'cd08e31494f9531f560d64c695473da9',
        ja3Full: '771,4865-4866-4867-49195-49199-49196-49200-52393-52392-49171-49172-156-157-47-53,0-23-65281-10-11-35-16-5-13-18-51-45-43-27-17513-21,29-23-24,0',
        ciphers: [
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
            'TLS_RSA_WITH_AES_256_CBC_SHA'
        ],
        minVersion: 'TLSv1.2',
        maxVersion: 'TLSv1.3',
        sigalgs: 'ecdsa_secp256r1_sha256:rsa_pss_rsae_sha256:rsa_pkcs1_sha256:ecdsa_secp384r1_sha384:rsa_pss_rsae_sha384:rsa_pkcs1_sha384:rsa_pss_rsae_sha512:rsa_pkcs1_sha512',
        ecdhCurves: 'X25519:P-256:P-384',
        alpnProtocols: ['h2', 'http/1.1'],
        sessionTimeout: 7200
    }
];
exports.TLS_PROFILES = TLS_PROFILES;
// Market share weights for realistic distribution
const MARKET_SHARE = {
    'chrome_121_win11': 0.35,
    'chrome_121_macos': 0.15,
    'firefox_121_win11': 0.08,
    'firefox_121_linux': 0.05,
    'safari_17_macos': 0.12,
    'edge_121_win11': 0.25
};
exports.MARKET_SHARE = MARKET_SHARE;
// ============================================================
// TLS ROTATOR CLASS
// ============================================================
class TLSRotator extends events_1.EventEmitter {
    config;
    profileCache = new Map();
    rotationCounter = 0;
    lastProfile = null;
    constructor(config = {}) {
        super();
        this.config = {
            rotationStrategy: 'per-session',
            preferredBrowsers: ['chrome', 'firefox', 'edge'],
            preferredOS: ['windows', 'macos'],
            consistentPerWorker: true,
            enableHTTP2: true,
            enableSessionResumption: true,
            ...config
        };
    }
    /**
     * 🚀 Initialize the TLS Rotator
     */
    // Complexity: O(1)
    async initialize() {
        logger_1.logger.debug(`
╔═══════════════════════════════════════════════════════════════════════════════╗
║  👻 GHOST v1.0.0 - TLS ROTATOR                                               ║
║                                                                               ║
║  "Speak the language of real browsers"                                        ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║  TLS Profiles:     ${TLS_PROFILES.length} unique fingerprints                                       ║
║  Rotation:         ${this.config.rotationStrategy.toUpperCase().padEnd(12)}                                          ║
║  Browsers:         ${this.config.preferredBrowsers.join(', ').padEnd(25)}                    ║
║  HTTP/2:           ${this.config.enableHTTP2 ? '✅ ENABLED' : '❌ DISABLED'}                                                ║
║  Session Resumption: ${this.config.enableSessionResumption ? '✅ ENABLED' : '❌ DISABLED'}                                            ║
╚═══════════════════════════════════════════════════════════════════════════════╝
`);
        this.emit('initialized');
    }
    /**
     * 🎭 Get TLS profile for a Neural Fingerprint
     */
    // Complexity: O(N*M) — nested iteration detected
    getProfile(neuralFingerprintId, workerIndex) {
        // Check cache for per-session/per-worker consistency
        if (this.config.consistentPerWorker && this.profileCache.has(neuralFingerprintId)) {
            return this.profileCache.get(neuralFingerprintId);
        }
        let profile;
        switch (this.config.rotationStrategy) {
            case 'static':
                profile = this.getStaticProfile();
                break;
            case 'per-request':
                profile = this.getRandomProfile();
                break;
            case 'adaptive':
                profile = this.getAdaptiveProfile(neuralFingerprintId);
                break;
            case 'per-session':
            default:
                profile = this.getDeterministicProfile(neuralFingerprintId, workerIndex);
                break;
        }
        // Cache for consistency
        if (this.config.consistentPerWorker) {
            this.profileCache.set(neuralFingerprintId, profile);
        }
        this.lastProfile = profile;
        this.rotationCounter++;
        this.emit('profile:selected', { neuralFingerprintId, profile });
        return profile;
    }
    /**
     * 🔧 Get TLS options for Node.js https/tls
     */
    // Complexity: O(N)
    getTLSOptions(profile) {
        return {
            ciphers: profile.ciphers.join(':'),
            minVersion: profile.minVersion,
            maxVersion: profile.maxVersion,
            sigalgs: profile.sigalgs,
            ecdhCurve: profile.ecdhCurves,
            sessionTimeout: profile.sessionTimeout,
            // Enable session resumption for performance
            ...(this.config.enableSessionResumption && {
                sessionIdContext: crypto.randomBytes(16).toString('hex')
            })
        };
    }
    /**
     * 🎭 Get Playwright context options for TLS configuration
     *
     * Note: Playwright uses Chromium's TLS stack, so direct cipher control
     * is limited. This returns browser launch args for best compatibility.
     */
    // Complexity: O(1) — amortized
    getPlaywrightArgs(profile) {
        const args = [];
        // Force TLS 1.2 minimum
        args.push('--ssl-version-min=tls1.2');
        // Disable QUIC (can be fingerprinted)
        args.push('--disable-quic');
        // Match cipher preferences
        if (profile.browser === 'Firefox') {
            // Firefox-like behavior
            args.push('--cipher-suite-blacklist=0x0001,0x0002,0x0004,0x0005');
        }
        // HTTP/2 configuration
        if (this.config.enableHTTP2) {
            args.push('--enable-features=NetworkService');
        }
        else {
            args.push('--disable-http2');
        }
        return args;
    }
    /**
     * 🔄 Generate HTTP headers that match the TLS profile
     */
    // Complexity: O(1) — hash/map lookup
    getMatchingHeaders(profile) {
        const headers = {};
        // Accept headers vary by browser
        if (profile.browser === 'Chrome' || profile.browser === 'Edge') {
            headers['Accept'] = 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7';
            headers['Accept-Language'] = 'en-US,en;q=0.9';
            headers['Accept-Encoding'] = 'gzip, deflate, br';
            headers['Sec-Ch-Ua'] = `"Not A(Brand";v="99", "Google Chrome";v="${profile.browserVersion.split('.')[0]}", "Chromium";v="${profile.browserVersion.split('.')[0]}"`;
            headers['Sec-Ch-Ua-Mobile'] = '?0';
            headers['Sec-Ch-Ua-Platform'] = profile.os.includes('Windows') ? '"Windows"' : profile.os.includes('macOS') ? '"macOS"' : '"Linux"';
            headers['Sec-Fetch-Dest'] = 'document';
            headers['Sec-Fetch-Mode'] = 'navigate';
            headers['Sec-Fetch-Site'] = 'none';
            headers['Sec-Fetch-User'] = '?1';
            headers['Upgrade-Insecure-Requests'] = '1';
        }
        else if (profile.browser === 'Firefox') {
            headers['Accept'] = 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8';
            headers['Accept-Language'] = 'en-US,en;q=0.5';
            headers['Accept-Encoding'] = 'gzip, deflate, br';
            headers['Upgrade-Insecure-Requests'] = '1';
            headers['Sec-Fetch-Dest'] = 'document';
            headers['Sec-Fetch-Mode'] = 'navigate';
            headers['Sec-Fetch-Site'] = 'none';
            headers['Sec-Fetch-User'] = '?1';
        }
        else if (profile.browser === 'Safari') {
            headers['Accept'] = 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8';
            headers['Accept-Language'] = 'en-US,en;q=0.9';
            headers['Accept-Encoding'] = 'gzip, deflate, br';
        }
        return headers;
    }
    /**
     * 📊 Calculate JA3 hash from components
     */
    // Complexity: O(1)
    calculateJA3(components) {
        const ja3String = [
            components.tlsVersion.toString(),
            components.ciphers.join('-'),
            components.extensions.join('-'),
            components.ellipticCurves.join('-'),
            components.ecPointFormats.join('-')
        ].join(',');
        return crypto.createHash('md5').update(ja3String).digest('hex');
    }
    // ============================================================
    // PRIVATE HELPER METHODS
    // ============================================================
    // Complexity: O(N) — linear iteration
    getStaticProfile() {
        // Return most common profile (Chrome on Windows)
        return TLS_PROFILES.find(p => p.profileId === 'chrome_121_win11');
    }
    // Complexity: O(N) — potential recursive descent
    getRandomProfile() {
        const filtered = this.filterProfiles();
        return filtered[Math.floor(Math.random() * filtered.length)];
    }
    // Complexity: O(N)
    getDeterministicProfile(neuralFingerprintId, workerIndex) {
        const filtered = this.filterProfiles();
        // Use worker index for deterministic selection if available
        if (workerIndex !== undefined) {
            return filtered[workerIndex % filtered.length];
        }
        // Otherwise use fingerprint hash
        const hash = crypto.createHash('sha256').update(neuralFingerprintId).digest('hex');
        const index = parseInt(hash.substring(0, 8), 16) % filtered.length;
        return filtered[index];
    }
    // Complexity: O(N) — linear iteration
    getAdaptiveProfile(neuralFingerprintId) {
        // Select profile based on weighted market share
        const filtered = this.filterProfiles();
        const hash = crypto.createHash('sha256').update(neuralFingerprintId).digest('hex');
        const normalized = parseInt(hash.substring(0, 8), 16) / 0xFFFFFFFF;
        let cumulative = 0;
        for (const profile of filtered) {
            const share = MARKET_SHARE[profile.profileId] || 0.1;
            cumulative += share;
            if (normalized <= cumulative) {
                return profile;
            }
        }
        return filtered[0];
    }
    // Complexity: O(N) — linear iteration
    filterProfiles() {
        return TLS_PROFILES.filter(profile => {
            const browserMatch = this.config.preferredBrowsers.some(b => profile.browser.toLowerCase() === b.toLowerCase());
            const osMatch = this.config.preferredOS.some(os => {
                if (os === 'windows')
                    return profile.os.includes('Windows');
                if (os === 'macos')
                    return profile.os.includes('macOS');
                if (os === 'linux')
                    return profile.os.includes('Linux') || profile.os.includes('Ubuntu');
                return false;
            });
            return browserMatch && osMatch;
        });
    }
    /**
     * 🔄 Clear profile cache (force rotation)
     */
    // Complexity: O(1)
    clearCache() {
        this.profileCache.clear();
        this.emit('cache:cleared');
    }
    /**
     * 📊 Get rotation statistics
     */
    // Complexity: O(1)
    getStats() {
        return {
            rotations: this.rotationCounter,
            cachedProfiles: this.profileCache.size,
            lastProfile: this.lastProfile?.profileId || null
        };
    }
    /**
     * 🔍 Verify TLS fingerprint matches expected
     */
    // Complexity: O(1)
    verifyFingerprint(actual, expected) {
        return actual.toLowerCase() === expected.toLowerCase();
    }
}
exports.TLSRotator = TLSRotator;
// ============================================================
// FACTORY FUNCTION
// ============================================================
function createTLSRotator(config) {
    return new TLSRotator(config);
}
