"use strict";
/**
 * 👻 GHOST v1.0.0 - "The Ghost in the Machine"
 *
 * Zero-Detection Automation Layer - Makes QAntum invisible to anti-bot systems.
 *
 * This module integrates:
 * - WebGL Mutator: Unique GPU fingerprints per worker
 * - Biometric Jitter: Human-like mouse/keyboard behavior
 * - TLS Rotator: Browser-matching TLS fingerprints
 *
 * Together, these create a "Ghost Profile" for each of the 199 Swarm workers,
 * making them indistinguishable from real human users.
 *
 * @version 1.0.0-QAntum
 * @author QAntum AI Architect
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
exports.GhostEngine = exports.MARKET_SHARE = exports.TLS_PROFILES = exports.createTLSRotator = exports.TLSRotator = exports.BIOMETRIC_PRESETS = exports.createBiometricProfile = exports.createBiometricJitter = exports.BiometricJitter = exports.GPU_DATABASE = exports.createWebGLMutator = exports.WebGLMutator = void 0;
exports.createGhostEngine = createGhostEngine;
// ============================================================
// MAIN EXPORTS
// ============================================================
var webgl_mutator_1 = require("../../../../scripts/qantum/ghost/webgl-mutator");
Object.defineProperty(exports, "WebGLMutator", { enumerable: true, get: function () { return webgl_mutator_1.WebGLMutator; } });
Object.defineProperty(exports, "createWebGLMutator", { enumerable: true, get: function () { return webgl_mutator_1.createWebGLMutator; } });
Object.defineProperty(exports, "GPU_DATABASE", { enumerable: true, get: function () { return webgl_mutator_1.GPU_DATABASE; } });
var biometric_jitter_1 = require("./biometric-jitter");
Object.defineProperty(exports, "BiometricJitter", { enumerable: true, get: function () { return biometric_jitter_1.BiometricJitter; } });
Object.defineProperty(exports, "createBiometricJitter", { enumerable: true, get: function () { return biometric_jitter_1.createBiometricJitter; } });
Object.defineProperty(exports, "createBiometricProfile", { enumerable: true, get: function () { return biometric_jitter_1.createBiometricProfile; } });
Object.defineProperty(exports, "BIOMETRIC_PRESETS", { enumerable: true, get: function () { return biometric_jitter_1.BIOMETRIC_PRESETS; } });
var tls_rotator_1 = require("../../../../scripts/qantum/ghost/tls-rotator");
Object.defineProperty(exports, "TLSRotator", { enumerable: true, get: function () { return tls_rotator_1.TLSRotator; } });
Object.defineProperty(exports, "createTLSRotator", { enumerable: true, get: function () { return tls_rotator_1.createTLSRotator; } });
Object.defineProperty(exports, "TLS_PROFILES", { enumerable: true, get: function () { return tls_rotator_1.TLS_PROFILES; } });
Object.defineProperty(exports, "MARKET_SHARE", { enumerable: true, get: function () { return tls_rotator_1.MARKET_SHARE; } });
// ============================================================
// GHOST PROFILE - UNIFIED STEALTH IDENTITY
// ============================================================
const crypto = __importStar(require("crypto"));
const events_1 = require("events");
const webgl_mutator_2 = require("../../../../scripts/qantum/ghost/webgl-mutator");
const biometric_jitter_2 = require("./biometric-jitter");
const tls_rotator_2 = require("../../../../scripts/qantum/ghost/tls-rotator");
// ============================================================
// GHOST ENGINE - ORCHESTRATES ALL STEALTH MODULES
// ============================================================
class GhostEngine extends events_1.EventEmitter {
    config;
    webglMutator;
    biometricJitter;
    tlsRotator;
    profileCache = new Map();
    initialized = false;
    constructor(config = {}) {
        super();
        this.config = {
            enableWebGL: true,
            enableCanvas: true,
            enableAudio: true,
            enableBiometric: true,
            enableTLS: true,
            debugMode: false,
            ...config,
        };
        // Initialize sub-modules
        this.webglMutator = (0, webgl_mutator_2.createWebGLMutator)({ debugMode: this.config.debugMode });
        this.biometricJitter = (0, biometric_jitter_2.createBiometricJitter)();
        this.tlsRotator = (0, tls_rotator_2.createTLSRotator)();
    }
    /**
     * 🚀 Initialize the Ghost Engine
     */
    // Complexity: O(N) — parallel execution
    async initialize() {
        console.log(`
╔═══════════════════════════════════════════════════════════════════════════════════════╗
║                                                                                       ║
║     ██████╗ ██╗  ██╗ ██████╗ ███████╗████████╗    ██╗   ██╗██████╗ ███████╗          ║
║    ██╔════╝ ██║  ██║██╔═══██╗██╔════╝╚══██╔══╝    ██║   ██║╚════██╗╚════██║          ║
║    ██║  ███╗███████║██║   ██║███████╗   ██║       ██║   ██║ █████╔╝    ██╔╝          ║
║    ██║   ██║██╔══██║██║   ██║╚════██║   ██║       ╚██╗ ██╔╝██╔═══╝    ██╔╝           ║
║    ╚██████╔╝██║  ██║╚██████╔╝███████║   ██║        ╚████╔╝ ███████╗   ██║            ║
║     ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚══════╝   ╚═╝         ╚═══╝  ╚══════╝   ╚═╝            ║
║                                                                                       ║
║                       "THE GHOST IN THE MACHINE"                                      ║
║                                                                                       ║
╠═══════════════════════════════════════════════════════════════════════════════════════╣
║  STATUS: INITIALIZING STEALTH SUBSYSTEMS                                              ║
╠═══════════════════════════════════════════════════════════════════════════════════════╣
║  WebGL Mutator:      ${this.config.enableWebGL ? '✅ ENABLED' : '❌ DISABLED'}    - GPU fingerprint spoofing                      ║
║  Canvas Mutator:     ${this.config.enableCanvas ? '✅ ENABLED' : '❌ DISABLED'}    - Canvas hash mutation                         ║
║  Audio Mutator:      ${this.config.enableAudio ? '✅ ENABLED' : '❌ DISABLED'}    - AudioContext fingerprint                      ║
║  Biometric Jitter:   ${this.config.enableBiometric ? '✅ ENABLED' : '❌ DISABLED'}    - Human motion simulation                     ║
║  TLS Rotator:        ${this.config.enableTLS ? '✅ ENABLED' : '❌ DISABLED'}    - JA3 fingerprint matching                      ║
╚═══════════════════════════════════════════════════════════════════════════════════════╝
`);
        // Initialize all sub-modules in parallel
        // SAFETY: async operation — wrap in try-catch for production resilience
        await Promise.all([
            this.webglMutator.initialize(),
            this.biometricJitter.initialize(),
            this.tlsRotator.initialize(),
        ]);
        this.initialized = true;
        this.emit('initialized');
        console.log(`\n✅ Ghost Engine v1.0.0 fully operational. Ready to haunt. 👻\n`);
    }
    /**
     * 🎭 Create Ghost Profile for a Swarm Worker
     *
     * @param neuralFingerprintId - ID from Neural Fingerprinting engine
     * @param workerIndex - Worker index (0-198 for 199 workers)
     */
    // Complexity: O(N*M) — nested iteration detected
    createGhostProfile(neuralFingerprintId, workerIndex) {
        if (!this.initialized) {
            throw new Error('Ghost Engine not initialized. Call initialize() first.');
        }
        // Check cache
        const cacheKey = `${neuralFingerprintId}_${workerIndex}`;
        if (this.profileCache.has(cacheKey)) {
            return this.profileCache.get(cacheKey);
        }
        // Generate all fingerprints
        const webgl = this.config.enableWebGL
            ? this.webglMutator.generateWebGLProfile(neuralFingerprintId, workerIndex)
            : this.getDefaultWebGL();
        const canvas = this.config.enableCanvas
            ? this.webglMutator.generateCanvasProfile(neuralFingerprintId)
            : this.getDefaultCanvas();
        const audio = this.config.enableAudio
            ? this.webglMutator.generateAudioProfile(neuralFingerprintId)
            : this.getDefaultAudio();
        const biometric = this.config.enableBiometric
            ? (0, biometric_jitter_2.createBiometricProfile)(neuralFingerprintId, workerIndex)
            : this.getDefaultBiometric();
        const tls = this.config.enableTLS
            ? this.tlsRotator.getProfile(neuralFingerprintId, workerIndex)
            : this.getDefaultTLS();
        // Generate combined injection script
        const injectionScript = this.generateCombinedScript(webgl, canvas, audio);
        const profile = {
            ghostId: `ghost_${crypto.randomBytes(8).toString('hex')}`,
            neuralFingerprintId,
            workerIndex,
            createdAt: Date.now(),
            webgl,
            canvas,
            audio,
            biometric,
            tls,
            injectionScript,
        };
        // Cache for consistency
        this.profileCache.set(cacheKey, profile);
        if (this.config.debugMode) {
            console.log(`[Ghost] 👻 Created profile for worker ${workerIndex}:`);
            console.log(`   GPU: ${webgl.unmaskedRenderer}`);
            console.log(`   Browser: ${tls.browser} ${tls.browserVersion}`);
            console.log(`   Biometric: ${biometric.skillLevel} ${biometric.deviceType} user`);
        }
        this.emit('profile:created', profile);
        return profile;
    }
    /**
     * 💉 Get Playwright browser launch options with Ghost profile
     */
    // Complexity: O(1)
    getPlaywrightOptions(profile) {
        return {
            args: [
                ...this.tlsRotator.getPlaywrightArgs(profile.tls),
                '--disable-blink-features=AutomationControlled',
                '--disable-features=IsolateOrigins,site-per-process',
                '--disable-site-isolation-trials',
            ],
            ignoreDefaultArgs: ['--enable-automation'],
            headless: 'new',
        };
    }
    /**
     * 📝 Get context options for Playwright with matching headers
     */
    // Complexity: O(1)
    getContextOptions(profile) {
        return {
            userAgent: this.getUserAgent(profile.tls),
            viewport: { width: 1920, height: 1080 },
            locale: 'en-US',
            timezoneId: 'America/New_York',
            extraHTTPHeaders: this.tlsRotator.getMatchingHeaders(profile.tls),
            bypassCSP: true,
            javaScriptEnabled: true,
        };
    }
    /**
     * 🖱️ Get Biometric Jitter instance for human-like interactions
     */
    // Complexity: O(1)
    getBiometricJitter(profile) {
        const jitter = (0, biometric_jitter_2.createBiometricJitter)(profile.biometric);
        return jitter;
    }
    /**
     * 📊 Get engine statistics
     */
    // Complexity: O(1)
    getStats() {
        return {
            profilesCreated: this.profileCache.size,
            webglStats: this.webglMutator.getStats(),
            tlsStats: this.tlsRotator.getStats(),
        };
    }
    /**
     * 🔄 Clear all caches (force new fingerprints)
     */
    // Complexity: O(1)
    clearCache() {
        this.profileCache.clear();
        this.webglMutator.clearCache();
        this.tlsRotator.clearCache();
        this.emit('cache:cleared');
    }
    // ============================================================
    // PRIVATE HELPER METHODS
    // ============================================================
    // Complexity: O(1)
    generateCombinedScript(webgl, canvas, audio) {
        return this.webglMutator.generateInjectionScript(webgl, canvas, audio);
    }
    // Complexity: O(1) — hash/map lookup
    getUserAgent(tls) {
        const templates = {
            Chrome: `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${tls.browserVersion} Safari/537.36`,
            Firefox: `Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:${tls.browserVersion.split('.')[0]}.0) Gecko/20100101 Firefox/${tls.browserVersion}`,
            Safari: `Mozilla/5.0 (Macintosh; Intel Mac OS X 14_2) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/${tls.browserVersion} Safari/605.1.15`,
            Edge: `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${tls.browserVersion} Safari/537.36 Edg/${tls.browserVersion}`,
        };
        return templates[tls.browser] || templates['Chrome'];
    }
    // Complexity: O(1)
    getDefaultWebGL() {
        return this.webglMutator.generateWebGLProfile('default', 0);
    }
    // Complexity: O(1)
    getDefaultCanvas() {
        return {
            noiseScale: 0.001,
            colorShift: [0, 0, 0],
            fontRenderingVariance: 0.01,
            textBaselineJitter: 0.1,
        };
    }
    // Complexity: O(1)
    getDefaultAudio() {
        return {
            sampleRate: 44100,
            channelCount: 2,
            oscillatorType: 'sine',
            noiseAmplitude: 0.0000001,
        };
    }
    // Complexity: O(1)
    getDefaultBiometric() {
        return (0, biometric_jitter_2.createBiometricProfile)('default', 0);
    }
    // Complexity: O(1)
    getDefaultTLS() {
        return this.tlsRotator.getProfile('default', 0);
    }
}
exports.GhostEngine = GhostEngine;
// ============================================================
// FACTORY FUNCTION
// ============================================================
function createGhostEngine(config) {
    return new GhostEngine(config);
}
// ============================================================
// DEFAULT EXPORT
// ============================================================
exports.default = GhostEngine;
