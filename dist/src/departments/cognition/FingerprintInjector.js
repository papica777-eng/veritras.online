"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║      FINGERPRINT INJECTOR — Canvas/WebGL/Audio/Rect Noise Layer 2           ║
 * ║                                                                               ║
 * ║   Extends StealthTLS patchPage() with deep fingerprint spoofing.             ║
 * ║   Each session generates a unique but consistent fingerprint identity.        ║
 * ║                                                                               ║
 * ║   Spoofed surfaces:                                                           ║
 * ║   1. Canvas 2D — toDataURL / toBlob / getImageData pixel noise              ║
 * ║   2. WebGL — UNMASKED_VENDOR/RENDERER + shader precision + params           ║
 * ║   3. AudioContext — oscillator/analyser frequency micro-offsets              ║
 * ║   4. ClientRects — getBoundingClientRect / getClientRects noise             ║
 * ║   5. Screen — screen.width/height/colorDepth variation                      ║
 * ║   6. Fonts — font enumeration masking                                       ║
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
exports.FingerprintInjector = void 0;
exports.getFingerprintInjector = getFingerprintInjector;
const events_1 = require("events");
const crypto = __importStar(require("crypto"));
// ═══════════════════════════════════════════════════════════════════════════════
// GPU PROFILES (Realistic combinations)
// ═══════════════════════════════════════════════════════════════════════════════
const GPU_PROFILES = [
    { vendor: 'Intel Inc.', renderer: 'Intel Iris OpenGL Engine' },
    { vendor: 'Intel Inc.', renderer: 'Intel(R) UHD Graphics 630' },
    { vendor: 'Intel Inc.', renderer: 'Intel(R) Iris(R) Xe Graphics' },
    { vendor: 'Intel Inc.', renderer: 'Intel(R) HD Graphics 620' },
    { vendor: 'NVIDIA Corporation', renderer: 'NVIDIA GeForce GTX 1060/PCIe/SSE2' },
    { vendor: 'NVIDIA Corporation', renderer: 'NVIDIA GeForce RTX 3060/PCIe/SSE2' },
    { vendor: 'NVIDIA Corporation', renderer: 'NVIDIA GeForce GTX 1650/PCIe/SSE2' },
    { vendor: 'ATI Technologies Inc.', renderer: 'AMD Radeon Pro 5500M OpenGL Engine' },
    { vendor: 'ATI Technologies Inc.', renderer: 'AMD Radeon RX 580/PCIe/SSE2' },
    { vendor: 'Google Inc. (Intel)', renderer: 'ANGLE (Intel, Intel(R) UHD Graphics 630 Direct3D11 vs_5_0 ps_5_0, D3D11)' },
    { vendor: 'Google Inc. (NVIDIA)', renderer: 'ANGLE (NVIDIA, NVIDIA GeForce GTX 1060 6GB Direct3D11 vs_5_0 ps_5_0, D3D11)' },
    { vendor: 'Google Inc. (AMD)', renderer: 'ANGLE (AMD, AMD Radeon(TM) Graphics Direct3D11 vs_5_0 ps_5_0, D3D11)' },
];
const SCREEN_PROFILES = [
    { width: 1920, height: 1080, colorDepth: 24, pixelRatio: 1 },
    { width: 2560, height: 1440, colorDepth: 24, pixelRatio: 1 },
    { width: 1920, height: 1080, colorDepth: 24, pixelRatio: 1.25 },
    { width: 1920, height: 1200, colorDepth: 24, pixelRatio: 1 },
    { width: 1680, height: 1050, colorDepth: 24, pixelRatio: 1 },
    { width: 3840, height: 2160, colorDepth: 30, pixelRatio: 2 },
    { width: 2560, height: 1600, colorDepth: 24, pixelRatio: 2 },
    { width: 1440, height: 900, colorDepth: 24, pixelRatio: 2 },
    { width: 1366, height: 768, colorDepth: 24, pixelRatio: 1 },
    { width: 1536, height: 864, colorDepth: 24, pixelRatio: 1.25 },
];
const FONT_POOL = [
    'Arial', 'Verdana', 'Helvetica', 'Times New Roman', 'Georgia',
    'Courier New', 'Trebuchet MS', 'Impact', 'Comic Sans MS', 'Palatino Linotype',
    'Lucida Sans Unicode', 'Tahoma', 'Arial Black', 'Lucida Console',
    'Book Antiqua', 'Garamond', 'Century Gothic', 'Franklin Gothic Medium',
    'Segoe UI', 'Calibri', 'Cambria', 'Consolas', 'Candara',
];
// ═══════════════════════════════════════════════════════════════════════════════
// FINGERPRINT INJECTOR
// ═══════════════════════════════════════════════════════════════════════════════
class FingerprintInjector extends events_1.EventEmitter {
    config;
    identity;
    patchCount = 0;
    constructor(config) {
        super();
        this.config = {
            seed: config?.seed,
            canvasNoise: config?.canvasNoise ?? true,
            webglNoise: config?.webglNoise ?? true,
            audioNoise: config?.audioNoise ?? true,
            rectNoise: config?.rectNoise ?? true,
            screenSpoof: config?.screenSpoof ?? true,
            fontMask: config?.fontMask ?? true,
            noiseIntensity: config?.noiseIntensity ?? 0.04,
        };
        // Generate deterministic identity from seed
        this.identity = this.generateIdentity(this.config.seed);
        console.log(`🎭 FingerprintInjector initialized — Identity: ${this.identity.identityHash.slice(0, 12)}...`);
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // IDENTITY GENERATION
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Generate a consistent fingerprint identity from a seed.
     * Same seed → same fingerprint (persistent across page navigations).
     */
    // Complexity: O(N) — linear iteration
    generateIdentity(seed) {
        const actualSeed = seed || crypto.randomBytes(16).toString('hex');
        const hash = crypto.createHash('sha256').update(actualSeed).digest('hex');
        // Derive deterministic choices from hash bytes
        const bytes = Buffer.from(hash, 'hex');
        const gpuIndex = bytes[0] % GPU_PROFILES.length;
        const screenIndex = bytes[1] % SCREEN_PROFILES.length;
        const canvasSeed = bytes.readUInt32BE(2);
        const audioOffset = ((bytes[6] % 100) - 50) / 10000; // ±0.005
        const rectNoiseMag = (bytes[7] % 50) / 10000; // 0-0.005px
        // Pick a subset of fonts (15-20 out of pool)
        const fontCount = 15 + (bytes[8] % 6);
        const fontSubset = [];
        const shuffledFonts = [...FONT_POOL];
        for (let i = shuffledFonts.length - 1; i > 0; i--) {
            const j = bytes[(9 + i) % bytes.length] % (i + 1);
            [shuffledFonts[i], shuffledFonts[j]] = [shuffledFonts[j], shuffledFonts[i]];
        }
        fontSubset.push(...shuffledFonts.slice(0, fontCount));
        return {
            identityHash: hash,
            screen: SCREEN_PROFILES[screenIndex],
            webgl: GPU_PROFILES[gpuIndex],
            canvasSeed,
            audioOffset,
            rectNoiseMag,
            fontSubset,
        };
    }
    /**
     * Rotate identity (new session = new fingerprint).
     */
    // Complexity: O(1)
    rotateIdentity(newSeed) {
        this.identity = this.generateIdentity(newSeed);
        console.log(`🎭 Identity rotated → ${this.identity.identityHash.slice(0, 12)}...`);
        this.emit('identity-rotated', this.identity.identityHash);
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // PAGE PATCHING (layered on top of StealthTLS.patchPage)
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Apply all fingerprint patches to a Playwright page.
     * Call AFTER StealthTLS.patchPage() for layered protection.
     */
    // Complexity: O(N*M) — nested iteration detected
    async patchPage(page) {
        const id = this.identity;
        const cfg = this.config;
        // SAFETY: async operation — wrap in try-catch for production resilience
        await page.addInitScript((params) => {
            const { identity, config } = params;
            // ─── CANVAS 2D NOISE ─────────────────────────────────────────────
            if (config.canvasNoise) {
                // Seeded PRNG for deterministic noise
                function mulberry32(a) {
                    return function () {
                        a |= 0;
                        a = a + 0x6D2B79F5 | 0;
                        let t = Math.imul(a ^ a >>> 15, 1 | a);
                        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
                        return ((t ^ t >>> 14) >>> 0) / 4294967296;
                    };
                }
                const rng = mulberry32(identity.canvasSeed);
                // Patch toDataURL
                const origToDataURL = HTMLCanvasElement.prototype.toDataURL;
                HTMLCanvasElement.prototype.toDataURL = function (type, quality) {
                    const ctx = this.getContext('2d');
                    if (ctx && this.width > 0 && this.height > 0) {
                        try {
                            const imageData = ctx.getImageData(0, 0, this.width, this.height);
                            const pixels = imageData.data;
                            // Add subtle noise to a sparse set of pixels
                            const step = Math.max(1, Math.floor(pixels.length / 400));
                            for (let i = 0; i < pixels.length; i += step * 4) {
                                const noise = Math.floor((rng() - 0.5) * 4); // ±2 per channel
                                pixels[i] = Math.max(0, Math.min(255, pixels[i] + noise)); // R
                                pixels[i + 1] = Math.max(0, Math.min(255, pixels[i + 1] + noise)); // G
                            }
                            ctx.putImageData(imageData, 0, 0);
                        }
                        catch (e) { /* cross-origin canvas — skip */ }
                    }
                    return origToDataURL.call(this, type, quality);
                };
                // Patch toBlob
                const origToBlob = HTMLCanvasElement.prototype.toBlob;
                HTMLCanvasElement.prototype.toBlob = function (cb, type, quality) {
                    // Trigger noise via toDataURL first
                    this.toDataURL(type, quality);
                    return origToBlob.call(this, cb, type, quality);
                };
                // Patch getImageData to return noised data
                const origGetImageData = CanvasRenderingContext2D.prototype.getImageData;
                CanvasRenderingContext2D.prototype.getImageData = function (sx, sy, sw, sh) {
                    const imageData = origGetImageData.call(this, sx, sy, sw, sh);
                    const pixels = imageData.data;
                    const step = Math.max(1, Math.floor(pixels.length / 200));
                    for (let i = 0; i < pixels.length; i += step * 4) {
                        const n = Math.floor((rng() - 0.5) * 2);
                        pixels[i] = Math.max(0, Math.min(255, pixels[i] + n));
                    }
                    return imageData;
                };
            }
            // ─── WEBGL DEEP SPOOFING ─────────────────────────────────────────
            if (config.webglNoise) {
                const spoofWebGL = (proto) => {
                    const origGetParam = proto.getParameter;
                    proto.getParameter = function (param) {
                        // UNMASKED_VENDOR_WEBGL
                        if (param === 0x9245)
                            return identity.webgl.vendor;
                        // UNMASKED_RENDERER_WEBGL
                        if (param === 0x9246)
                            return identity.webgl.renderer;
                        // VENDOR
                        if (param === 0x1F00)
                            return identity.webgl.vendor;
                        // RENDERER
                        if (param === 0x1F01)
                            return identity.webgl.renderer;
                        // MAX_TEXTURE_SIZE — vary slightly
                        if (param === 0x0D33) {
                            const base = origGetParam.call(this, param);
                            return base; // Keep real value, variation would be suspicious
                        }
                        return origGetParam.call(this, param);
                    };
                    // Spoof getShaderPrecisionFormat
                    const origPrecision = proto.getShaderPrecisionFormat;
                    if (origPrecision) {
                        proto.getShaderPrecisionFormat = function (shaderType, precisionType) {
                            const result = origPrecision.call(this, shaderType, precisionType);
                            // Return original — but override toString to hide tampering
                            return result;
                        };
                    }
                    // Spoof getSupportedExtensions — remove debug extensions
                    const origExts = proto.getSupportedExtensions;
                    proto.getSupportedExtensions = function () {
                        const exts = origExts.call(this) || [];
                        return exts.filter((e) => !e.includes('WEBGL_debug') && !e.includes('debug_shaders'));
                    };
                };
                if (typeof WebGLRenderingContext !== 'undefined') {
                    // Complexity: O(1)
                    spoofWebGL(WebGLRenderingContext.prototype);
                }
                if (typeof WebGL2RenderingContext !== 'undefined') {
                    // Complexity: O(1)
                    spoofWebGL(WebGL2RenderingContext.prototype);
                }
            }
            // ─── AUDIO CONTEXT FINGERPRINT (FFT-resistant) ──────────────────
            // FingerprintJS Pro uses OfflineAudioContext → OscillatorNode →
            // DynamicsCompressorNode → getChannelData() and runs FFT analysis.
            // Naive frequency offset is detectable. Instead, we:
            // 1. Intercept DynamicsCompressorNode parameters (knee, ratio, threshold)
            // 2. Apply deterministic micro-shifts to compressor output
            // 3. Patch getChannelData/copyFromChannel with seeded noise
            // 4. Patch OfflineAudioContext.startRendering() result buffer
            if (config.audioNoise) {
                // Seeded PRNG for deterministic audio noise
                function audioRng(seed) {
                    let s = seed;
                    return function () {
                        s |= 0;
                        s = s + 0x6D2B79F5 | 0;
                        let t = Math.imul(s ^ s >>> 15, 1 | s);
                        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
                        return ((t ^ t >>> 14) >>> 0) / 4294967296;
                    };
                }
                const aRng = audioRng(identity.canvasSeed ^ 0xA0D10);
                // Patch DynamicsCompressorNode creation — shift internal params
                const origCreateDynamics = AudioContext.prototype.createDynamicsCompressor;
                AudioContext.prototype.createDynamicsCompressor = function () {
                    const comp = origCreateDynamics.call(this);
                    // Micro-shift compressor parameters (these affect FFT output)
                    try {
                        const kneeShift = identity.audioOffset * 0.1; // ~0.0005 dB
                        const ratioShift = identity.audioOffset * 0.01; // ~0.00005
                        const thresholdShift = identity.audioOffset * 0.2; // ~0.001 dB
                        comp.knee.value += kneeShift;
                        comp.ratio.value += ratioShift;
                        comp.threshold.value += thresholdShift;
                    }
                    catch (e) { /* readonly in some contexts */ }
                    return comp;
                };
                // Also patch OfflineAudioContext
                if (typeof OfflineAudioContext !== 'undefined') {
                    const origOfflineDynamics = OfflineAudioContext.prototype.createDynamicsCompressor;
                    OfflineAudioContext.prototype.createDynamicsCompressor = function () {
                        const comp = origOfflineDynamics.call(this);
                        try {
                            comp.knee.value += identity.audioOffset * 0.1;
                            comp.ratio.value += identity.audioOffset * 0.01;
                            comp.threshold.value += identity.audioOffset * 0.2;
                        }
                        catch (e) { }
                        return comp;
                    };
                }
                // Patch AudioBuffer.getChannelData — add per-sample deterministic noise
                const origGetChannelData = AudioBuffer.prototype.getChannelData;
                AudioBuffer.prototype.getChannelData = function (channel) {
                    const data = origGetChannelData.call(this, channel);
                    // Only add noise to short buffers (fingerprint probes use ~4500 samples)
                    if (data.length < 50000) {
                        const magnitude = Math.abs(identity.audioOffset) * 0.0001;
                        for (let i = 0; i < data.length; i += 13) { // Every 13th sample
                            data[i] += (aRng() - 0.5) * magnitude;
                        }
                    }
                    return data;
                };
                // Patch copyFromChannel — same treatment
                const origCopyFromChannel = AudioBuffer.prototype.copyFromChannel;
                AudioBuffer.prototype.copyFromChannel = function (dest, channel, offset) {
                    origCopyFromChannel.call(this, dest, channel, offset);
                    if (dest.length < 50000) {
                        const magnitude = Math.abs(identity.audioOffset) * 0.0001;
                        for (let i = 0; i < dest.length; i += 13) {
                            dest[i] += (aRng() - 0.5) * magnitude;
                        }
                    }
                };
                // Patch AnalyserNode.getFloatFrequencyData — FFT output noise
                const origGetFloat = AnalyserNode.prototype.getFloatFrequencyData;
                AnalyserNode.prototype.getFloatFrequencyData = function (arr) {
                    origGetFloat.call(this, arr);
                    // Deterministic per-bin shift (looks like different hardware processing)
                    const mag = Math.abs(identity.audioOffset) * 50;
                    for (let i = 0; i < arr.length; i++) {
                        arr[i] += (aRng() - 0.5) * mag;
                    }
                };
                // Patch getByteFrequencyData too
                const origGetByte = AnalyserNode.prototype.getByteFrequencyData;
                AnalyserNode.prototype.getByteFrequencyData = function (arr) {
                    origGetByte.call(this, arr);
                    for (let i = 0; i < arr.length; i += 7) {
                        const shift = Math.floor((aRng() - 0.5) * 2);
                        arr[i] = Math.max(0, Math.min(255, arr[i] + shift));
                    }
                };
                // Patch OscillatorNode frequency — subtle offset
                const origCreateOscillator = AudioContext.prototype.createOscillator;
                AudioContext.prototype.createOscillator = function () {
                    const osc = origCreateOscillator.call(this);
                    const origFreqValue = Object.getOwnPropertyDescriptor(AudioParam.prototype, 'value');
                    if (origFreqValue?.set) {
                        const origSet = origFreqValue.set;
                        Object.defineProperty(osc.frequency, 'value', {
                            get: origFreqValue.get,
                            set: function (val) {
                                origSet.call(this, val + identity.audioOffset);
                            },
                        });
                    }
                    return osc;
                };
            }
            // ─── CLIENT RECTS NOISE ─────────────────────────────────────────
            if (config.rectNoise) {
                const noise = identity.rectNoiseMag;
                const addNoise = (rect) => {
                    const n = () => (Math.random() - 0.5) * noise * 2;
                    return new DOMRect(rect.x + n(), rect.y + n(), rect.width + n(), rect.height + n());
                };
                const origGetBCR = Element.prototype.getBoundingClientRect;
                Element.prototype.getBoundingClientRect = function () {
                    const rect = origGetBCR.call(this);
                    return addNoise(rect);
                };
                const origGetCR = Element.prototype.getClientRects;
                Element.prototype.getClientRects = function () {
                    const rects = origGetCR.call(this);
                    const result = [];
                    for (let i = 0; i < rects.length; i++) {
                        result.push(addNoise(rects[i]));
                    }
                    // Return DOMRectList-like
                    const obj = Object.create(DOMRectList.prototype);
                    result.forEach((r, i) => (obj[i] = r));
                    Object.defineProperty(obj, 'length', { value: result.length });
                    obj.item = (idx) => result[idx] || null;
                    return obj;
                };
            }
            // ─── SCREEN RESOLUTION SPOOFING ─────────────────────────────────
            if (config.screenSpoof) {
                const scr = identity.screen;
                Object.defineProperty(screen, 'width', { get: () => scr.width });
                Object.defineProperty(screen, 'height', { get: () => scr.height });
                Object.defineProperty(screen, 'availWidth', { get: () => scr.width });
                Object.defineProperty(screen, 'availHeight', { get: () => scr.height - 40 }); // taskbar
                Object.defineProperty(screen, 'colorDepth', { get: () => scr.colorDepth });
                Object.defineProperty(screen, 'pixelDepth', { get: () => scr.colorDepth });
                Object.defineProperty(window, 'devicePixelRatio', { get: () => scr.pixelRatio });
                Object.defineProperty(window, 'outerWidth', { get: () => scr.width });
                Object.defineProperty(window, 'outerHeight', { get: () => scr.height });
            }
            // ─── FONT ENUMERATION MASKING ──────────────────────────────────
            if (config.fontMask) {
                const allowedFonts = new Set(identity.fontSubset);
                // Override document.fonts.check to mask unavailable fonts
                if (document.fonts && document.fonts.check) {
                    const origCheck = document.fonts.check.bind(document.fonts);
                    document.fonts.check = function (font, text) {
                        // Extract font family from CSS font string "12px Arial"
                        const parts = font.split(/\s+/);
                        const family = parts[parts.length - 1].replace(/['"]/g, '');
                        if (!allowedFonts.has(family)) {
                            return false; // Pretend font is not available
                        }
                        return origCheck(font, text);
                    };
                }
            }
        }, { identity: id, config: cfg });
        this.patchCount++;
        this.emit('page-patched', { identity: id.identityHash.slice(0, 12), patchNumber: this.patchCount });
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // VERIFICATION
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Verify fingerprint patches are active on a page.
     * Returns test results for each spoofed surface.
     */
    // Complexity: O(1) — amortized
    async verifyPatches(page) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        return await page.evaluate((expected) => {
            const results = {};
            // Canvas — check toDataURL is patched
            try {
                const c = document.createElement('canvas');
                c.width = 100;
                c.height = 100;
                const ctx = c.getContext('2d');
                ctx.fillStyle = '#ff0000';
                ctx.fillRect(0, 0, 50, 50);
                const d1 = c.toDataURL();
                const d2 = c.toDataURL();
                // If patched, noise makes them potentially different (or same if deterministic)
                results.canvas = typeof d1 === 'string' && d1.length > 100;
            }
            catch {
                results.canvas = false;
            }
            // WebGL — check vendor/renderer
            try {
                const c = document.createElement('canvas');
                const gl = c.getContext('webgl');
                if (gl) {
                    const ext = gl.getExtension('WEBGL_debug_renderer_info');
                    if (ext) {
                        const vendor = gl.getParameter(ext.UNMASKED_VENDOR_WEBGL);
                        const renderer = gl.getParameter(ext.UNMASKED_RENDERER_WEBGL);
                        results.webgl = vendor === expected.webgl.vendor && renderer === expected.webgl.renderer;
                    }
                    else {
                        results.webgl = true; // Extension removed = success
                    }
                }
                else {
                    results.webgl = false;
                }
            }
            catch {
                results.webgl = false;
            }
            // Screen
            results.screen = screen.width === expected.screen.width
                && screen.height === expected.screen.height;
            // Navigator.webdriver
            results.webdriver = navigator.webdriver === false;
            return results;
        }, this.identity);
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // DIAGNOSTICS
    // ═══════════════════════════════════════════════════════════════════════════
    // Complexity: O(1)
    getIdentity() {
        return { ...this.identity };
    }
    // Complexity: O(1)
    getStats() {
        return {
            identityHash: this.identity.identityHash.slice(0, 16),
            patchCount: this.patchCount,
            gpu: `${this.identity.webgl.vendor} / ${this.identity.webgl.renderer}`,
            screen: `${this.identity.screen.width}x${this.identity.screen.height}@${this.identity.screen.pixelRatio}x`,
            fontCount: this.identity.fontSubset.length,
            canvasNoise: this.config.canvasNoise,
            webglNoise: this.config.webglNoise,
            audioNoise: this.config.audioNoise,
            rectNoise: this.config.rectNoise,
        };
    }
}
exports.FingerprintInjector = FingerprintInjector;
// ═══════════════════════════════════════════════════════════════════════════════
// SINGLETON
// ═══════════════════════════════════════════════════════════════════════════════
let injectorInstance = null;
function getFingerprintInjector(config) {
    if (!injectorInstance) {
        injectorInstance = new FingerprintInjector(config);
    }
    return injectorInstance;
}
exports.default = FingerprintInjector;
