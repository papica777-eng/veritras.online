"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                                               ║
 * ║   ██╗   ██╗██╗███████╗██╗   ██╗ █████╗ ██╗          ██████╗ ██╗  ██╗ ██████╗ ███████╗████████╗║
 * ║   ██║   ██║██║██╔════╝██║   ██║██╔══██╗██║         ██╔════╝ ██║  ██║██╔═══██╗██╔════╝╚══██╔══╝║
 * ║   ██║   ██║██║███████╗██║   ██║███████║██║         ██║  ███╗███████║██║   ██║███████╗   ██║   ║
 * ║   ╚██╗ ██╔╝██║╚════██║██║   ██║██╔══██║██║         ██║   ██║██╔══██║██║   ██║╚════██║   ██║   ║
 * ║    ╚████╔╝ ██║███████║╚██████╔╝██║  ██║███████╗    ╚██████╔╝██║  ██║╚██████╔╝███████║   ██║   ║
 * ║     ╚═══╝  ╚═╝╚══════╝ ╚═════╝ ╚═╝  ╚═╝╚══════╝     ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚══════╝   ╚═╝   ║
 * ║                                                                                               ║
 * ║                         VISUAL GHOSTING INTEGRATION ENGINE                                    ║
 * ║                  "Fake-but-Perfect Rendering for Canvas Fingerprinting"                       ║
 * ║                                                                                               ║
 * ║   THE FINAL SYNTHESIS - Task 2: Visual Ghosting                                               ║
 * ║   © 2025-2026 QAntum | Dimitar Prodromov                                                        ║
 * ║                                                                                               ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════════════╝
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVisualGhost = exports.VisualGhostBridge = exports.VisualGhostEngine = void 0;
// ═══════════════════════════════════════════════════════════════════════════════
// PERLIN NOISE GENERATOR
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * Perlin Noise for organic canvas modifications
 */
class PerlinNoise {
    permutation = [];
    p = [];
    constructor(seed = Date.now()) {
        this.initPermutation(seed);
    }
    // Complexity: O(N*M) — nested iteration
    initPermutation(seed) {
        const random = this.seededRandom(seed);
        for (let i = 0; i < 256; i++) {
            this.permutation[i] = i;
        }
        // Fisher-Yates shuffle
        for (let i = 255; i > 0; i--) {
            const j = Math.floor(random() * (i + 1));
            [this.permutation[i], this.permutation[j]] = [this.permutation[j], this.permutation[i]];
        }
        // Duplicate for overflow
        this.p = [...this.permutation, ...this.permutation];
    }
    // Complexity: O(1)
    seededRandom(seed) {
        return () => {
            seed = (seed * 9301 + 49297) % 233280;
            return seed / 233280;
        };
    }
    // Complexity: O(1)
    fade(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }
    // Complexity: O(1)
    lerp(a, b, t) {
        return a + t * (b - a);
    }
    // Complexity: O(1)
    grad(hash, x, y) {
        const h = hash & 3;
        const u = h < 2 ? x : y;
        const v = h < 2 ? y : x;
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    }
    // Complexity: O(1)
    noise2D(x, y) {
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;
        x -= Math.floor(x);
        y -= Math.floor(y);
        const u = this.fade(x);
        const v = this.fade(y);
        const A = this.p[X] + Y;
        const B = this.p[X + 1] + Y;
        return this.lerp(this.lerp(this.grad(this.p[A], x, y), this.grad(this.p[B], x - 1, y), u), this.lerp(this.grad(this.p[A + 1], x, y - 1), this.grad(this.p[B + 1], x - 1, y - 1), u), v);
    }
}
// ═══════════════════════════════════════════════════════════════════════════════
// VISUAL GHOST ENGINE
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * VisualGhostEngine - Intercepts and modifies canvas fingerprinting attempts
 */
class VisualGhostEngine {
    static instance;
    config;
    perlin;
    interceptedRenders = [];
    fingerprintCache = new Map();
    constructor(config = {}) {
        this.config = {
            noiseEnabled: true,
            noiseIntensity: 0.02,
            gpuVendor: 'Intel Inc.',
            gpuRenderer: 'Intel Iris OpenGL Engine',
            hashSeed: Date.now(),
            webglSpoof: true,
            audioMask: true,
            ...config
        };
        this.perlin = new PerlinNoise(this.config.hashSeed);
    }
    static getInstance(config) {
        if (!VisualGhostEngine.instance) {
            VisualGhostEngine.instance = new VisualGhostEngine(config);
        }
        return VisualGhostEngine.instance;
    }
    /**
     * Apply ghost modifications to canvas ImageData
     */
    // Complexity: O(N*M) — nested iteration
    ghostify(imageData) {
        if (!this.config.noiseEnabled) {
            return imageData;
        }
        const data = new Uint8ClampedArray(imageData.data);
        const width = imageData.width;
        const height = imageData.height;
        // Apply perlin noise to each pixel
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const i = (y * width + x) * 4;
                // Generate noise value for this position
                const noiseValue = this.perlin.noise2D(x * 0.1, y * 0.1);
                const modification = Math.floor(noiseValue * this.config.noiseIntensity * 10);
                // Apply subtle modification to RGB channels (not alpha)
                data[i] = this.clamp(data[i] + modification); // R
                data[i + 1] = this.clamp(data[i + 1] + modification); // G
                data[i + 2] = this.clamp(data[i + 2] + modification); // B
                // data[i + 3] unchanged (Alpha)
            }
        }
        return new ImageData(data, width, height);
    }
    /**
     * Generate fake-but-consistent canvas fingerprint
     */
    // Complexity: O(1) — lookup
    generateFakeFingerprint(width = 200, height = 50) {
        const cacheKey = `${width}x${height}-${this.config.hashSeed}`;
        if (this.fingerprintCache.has(cacheKey)) {
            return this.fingerprintCache.get(cacheKey);
        }
        // Generate deterministic but unique fingerprint based on seed
        const hash = this.generateDeterministicHash(width, height);
        const entropy = 0.7 + (this.config.hashSeed % 1000) / 3333; // 0.7-1.0 range
        const fingerprint = {
            hash,
            width,
            height,
            dataUrl: this.generateFakeDataUrl(width, height),
            entropy
        };
        this.fingerprintCache.set(cacheKey, fingerprint);
        return fingerprint;
    }
    /**
     * Intercept canvas toDataURL call
     */
    // Complexity: O(1)
    interceptToDataURL(originalData, canvas) {
        // Generate consistent fake data URL
        const fake = this.generateFakeDataUrl(canvas.width, canvas.height);
        console.log(`👻 [VisualGhost] Intercepted toDataURL: ${canvas.width}x${canvas.height}`);
        return fake;
    }
    /**
     * Get WebGL parameter spoofing values
     */
    // Complexity: O(1)
    getWebGLSpoofParams() {
        return {
            vendor: this.config.gpuVendor,
            renderer: this.config.gpuRenderer,
            extensions: [
                'ANGLE_instanced_arrays',
                'EXT_blend_minmax',
                'EXT_color_buffer_half_float',
                'EXT_disjoint_timer_query',
                'EXT_float_blend',
                'EXT_frag_depth',
                'EXT_shader_texture_lod',
                'EXT_texture_compression_bptc',
                'EXT_texture_compression_rgtc',
                'EXT_texture_filter_anisotropic',
                'OES_element_index_uint',
                'OES_fbo_render_mipmap',
                'OES_standard_derivatives',
                'OES_texture_float',
                'OES_texture_float_linear',
                'OES_texture_half_float',
                'OES_texture_half_float_linear',
                'OES_vertex_array_object',
                'WEBGL_color_buffer_float',
                'WEBGL_compressed_texture_s3tc',
                'WEBGL_compressed_texture_s3tc_srgb',
                'WEBGL_debug_renderer_info',
                'WEBGL_debug_shaders',
                'WEBGL_depth_texture',
                'WEBGL_draw_buffers',
                'WEBGL_lose_context'
            ],
            maxTextureSize: 16384,
            maxViewportDims: [32767, 32767]
        };
    }
    /**
     * Get AudioContext fingerprint masking
     */
    // Complexity: O(1)
    getAudioContextMask() {
        // Generate consistent but varied audio fingerprint
        const seed = this.config.hashSeed;
        return {
            sampleRate: 44100 + (seed % 4) * 100, // 44100, 44200, 44300, or 44400
            channelCount: 2,
            oscillatorFrequency: 1000 + (seed % 100),
            noiseFloor: -100 + (seed % 20) // -100 to -80 dB
        };
    }
    /**
     * Record interception for analysis
     */
    // Complexity: O(1)
    recordInterception(original, modified) {
        this.interceptedRenders.push({
            original,
            modified,
            timestamp: Date.now(),
            fingerprint: this.generateFakeFingerprint(original.width, original.height)
        });
        // Keep only last 100 interceptions
        if (this.interceptedRenders.length > 100) {
            this.interceptedRenders.shift();
        }
    }
    /**
     * Get interception statistics
     */
    // Complexity: O(1)
    getStats() {
        return {
            totalInterceptions: this.interceptedRenders.length,
            uniqueFingerprints: this.fingerprintCache.size,
            lastInterception: this.interceptedRenders.length > 0
                ? this.interceptedRenders[this.interceptedRenders.length - 1].timestamp
                : null
        };
    }
    /**
     * Update configuration
     */
    // Complexity: O(1)
    updateConfig(config) {
        this.config = { ...this.config, ...config };
        if (config.hashSeed !== undefined) {
            this.perlin = new PerlinNoise(config.hashSeed);
            this.fingerprintCache.clear();
        }
    }
    // ─────────────────────────────────────────────────────────────────────────
    // PRIVATE HELPERS
    // ─────────────────────────────────────────────────────────────────────────
    // Complexity: O(1)
    clamp(value) {
        return Math.max(0, Math.min(255, value));
    }
    // Complexity: O(N) — loop
    generateDeterministicHash(width, height) {
        const seed = this.config.hashSeed;
        const input = `${width}-${height}-${seed}`;
        // Simple deterministic hash
        let hash = 0;
        for (let i = 0; i < input.length; i++) {
            const char = input.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(36).padStart(12, '0');
    }
    // Complexity: O(1)
    generateFakeDataUrl(width, height) {
        // Generate deterministic fake base64 data
        const seed = this.config.hashSeed;
        const fakeData = this.generatePseudoBase64(width * height * 4, seed);
        return `data:image/png;base64,${fakeData}`;
    }
    // Complexity: O(N) — loop
    generatePseudoBase64(length, seed) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
        //         let result = ';
        let random = seed;
        for (let i = 0; i < Math.min(length, 1000); i++) {
            random = (random * 9301 + 49297) % 233280;
            result += chars[Math.floor((random / 233280) * 64)];
        }
        return result;
    }
}
exports.VisualGhostEngine = VisualGhostEngine;
// ═══════════════════════════════════════════════════════════════════════════════
// VISUAL + GHOST PROTOCOL BRIDGE
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * VisualGhostBridge - Connects Visual Module with Ghost Protocol
 */
class VisualGhostBridge {
    ghostEngine;
    constructor(config) {
        this.ghostEngine = VisualGhostEngine.getInstance(config);
    }
    /**
     * Process screenshot with ghost protection
     */
    // Complexity: O(1)
    processScreenshot(imageData) {
        const ghosted = this.ghostEngine.ghostify(imageData);
        const fingerprint = this.ghostEngine.generateFakeFingerprint(imageData.width, imageData.height);
        this.ghostEngine.recordInterception(imageData, ghosted);
        return {
            original: imageData,
            ghosted,
            fingerprint
        };
    }
    /**
     * Get ghost engine instance
     */
    // Complexity: O(1)
    getEngine() {
        return this.ghostEngine;
    }
}
exports.VisualGhostBridge = VisualGhostBridge;
// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════
const getVisualGhost = (config) => VisualGhostEngine.getInstance(config);
exports.getVisualGhost = getVisualGhost;
exports.default = VisualGhostEngine;
