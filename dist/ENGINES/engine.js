"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                               ║
 * ║   QANTUM VISUAL TEST ENGINE                                                   ║
 * ║   "Pixel-perfect visual regression testing"                                   ║
 * ║                                                                               ║
 * ║   TODO B #33 - Visual Testing: Screenshot comparison                          ║
 * ║                                                                               ║
 * ║   © 2025-2026 QAntum | Dimitar Prodromov                                        ║
 * ║                                                                               ║
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
exports.visual = exports.configureVisual = exports.getVisualEngine = exports.ViewportPresets = exports.VisualTestEngine = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const crypto = __importStar(require("crypto"));
// ═══════════════════════════════════════════════════════════════════════════════
// VISUAL TEST ENGINE
// ═══════════════════════════════════════════════════════════════════════════════
class VisualTestEngine {
    static instance;
    config;
    baselines = new Map();
    constructor(config = {}) {
        this.config = {
            baselineDir: config.baselineDir || './visual-baselines',
            actualDir: config.actualDir || './visual-actual',
            diffDir: config.diffDir || './visual-diffs',
            threshold: config.threshold ?? 0.01,
            antiAliasing: config.antiAliasing ?? true,
            ignoreColors: config.ignoreColors ?? false,
            ignoreAntialiasing: config.ignoreAntialiasing ?? false,
            outputDiffPixels: config.outputDiffPixels ?? true,
            diffColor: config.diffColor || { r: 255, g: 0, b: 0 }
        };
    }
    static getInstance(config) {
        if (!VisualTestEngine.instance) {
            VisualTestEngine.instance = new VisualTestEngine(config);
        }
        return VisualTestEngine.instance;
    }
    static configure(config) {
        VisualTestEngine.instance = new VisualTestEngine(config);
        return VisualTestEngine.instance;
    }
    // ─────────────────────────────────────────────────────────────────────────
    // BASELINE MANAGEMENT
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Save baseline screenshot
     */
    async saveBaseline(name, screenshot) {
        await this.ensureDir(this.config.baselineDir);
        const filename = this.sanitizeName(name) + '.png';
        const filepath = path.join(this.config.baselineDir, filename);
        await fs.promises.writeFile(filepath, screenshot);
        this.baselines.set(name, screenshot);
        return filepath;
    }
    /**
     * Load baseline
     */
    async loadBaseline(name) {
        if (this.baselines.has(name)) {
            return this.baselines.get(name);
        }
        const filename = this.sanitizeName(name) + '.png';
        const filepath = path.join(this.config.baselineDir, filename);
        try {
            const buffer = await fs.promises.readFile(filepath);
            this.baselines.set(name, buffer);
            return buffer;
        }
        catch {
            return null;
        }
    }
    /**
     * Check if baseline exists
     */
    async hasBaseline(name) {
        if (this.baselines.has(name))
            return true;
        const filename = this.sanitizeName(name) + '.png';
        const filepath = path.join(this.config.baselineDir, filename);
        try {
            await fs.promises.access(filepath);
            return true;
        }
        catch {
            return false;
        }
    }
    /**
     * Delete baseline
     */
    async deleteBaseline(name) {
        this.baselines.delete(name);
        const filename = this.sanitizeName(name) + '.png';
        const filepath = path.join(this.config.baselineDir, filename);
        try {
            await fs.promises.unlink(filepath);
        }
        catch {
            // Ignore if doesn't exist
        }
    }
    // ─────────────────────────────────────────────────────────────────────────
    // COMPARISON
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Compare screenshot with baseline
     */
    async compare(name, actual) {
        // Save actual screenshot
        await this.ensureDir(this.config.actualDir);
        const actualFilename = this.sanitizeName(name) + '.png';
        const actualPath = path.join(this.config.actualDir, actualFilename);
        await fs.promises.writeFile(actualPath, actual);
        // Load baseline
        const baseline = await this.loadBaseline(name);
        const baselinePath = path.join(this.config.baselineDir, actualFilename);
        if (!baseline) {
            // No baseline exists - save as new baseline
            await this.saveBaseline(name, actual);
            return {
                match: true,
                similarity: 1,
                diffPixels: 0,
                totalPixels: 0,
                diffPercentage: 0,
                baselinePath,
                actualPath,
                dimensions: {
                    baseline: { width: 0, height: 0 },
                    actual: { width: 0, height: 0 }
                },
                error: 'No baseline found - created new baseline'
            };
        }
        // Compare images
        return this.compareBuffers(name, baseline, actual, baselinePath, actualPath);
    }
    /**
     * Compare two image buffers
     */
    async compareBuffers(name, baseline, actual, baselinePath, actualPath) {
        // Get image dimensions from PNG headers
        const baselineDims = this.getPngDimensions(baseline);
        const actualDims = this.getPngDimensions(actual);
        // Check dimensions match
        if (!baselineDims || !actualDims) {
            return {
                match: false,
                similarity: 0,
                diffPixels: -1,
                totalPixels: -1,
                diffPercentage: 100,
                baselinePath,
                actualPath,
                dimensions: {
                    baseline: baselineDims || { width: 0, height: 0 },
                    actual: actualDims || { width: 0, height: 0 }
                },
                error: 'Could not parse image dimensions'
            };
        }
        if (baselineDims.width !== actualDims.width || baselineDims.height !== actualDims.height) {
            return {
                match: false,
                similarity: 0,
                diffPixels: -1,
                totalPixels: Math.max(baselineDims.width * baselineDims.height, actualDims.width * actualDims.height),
                diffPercentage: 100,
                baselinePath,
                actualPath,
                dimensions: {
                    baseline: baselineDims,
                    actual: actualDims
                },
                error: `Dimension mismatch: baseline ${baselineDims.width}x${baselineDims.height}, actual ${actualDims.width}x${actualDims.height}`
            };
        }
        // Simple byte comparison for exact match
        const baselineHash = crypto.createHash('md5').update(baseline).digest('hex');
        const actualHash = crypto.createHash('md5').update(actual).digest('hex');
        const totalPixels = baselineDims.width * baselineDims.height;
        if (baselineHash === actualHash) {
            return {
                match: true,
                similarity: 1,
                diffPixels: 0,
                totalPixels,
                diffPercentage: 0,
                baselinePath,
                actualPath,
                dimensions: {
                    baseline: baselineDims,
                    actual: actualDims
                }
            };
        }
        // Perform pixel-level comparison
        const diffResult = await this.pixelCompare(baseline, actual, baselineDims);
        const diffPercentage = (diffResult.diffPixels / totalPixels) * 100;
        const match = diffPercentage <= this.config.threshold * 100;
        // Save diff image
        let diffPath;
        if (this.config.outputDiffPixels && diffResult.diffBuffer) {
            await this.ensureDir(this.config.diffDir);
            const diffFilename = this.sanitizeName(name) + '-diff.png';
            diffPath = path.join(this.config.diffDir, diffFilename);
            await fs.promises.writeFile(diffPath, diffResult.diffBuffer);
        }
        return {
            match,
            similarity: 1 - (diffResult.diffPixels / totalPixels),
            diffPixels: diffResult.diffPixels,
            totalPixels,
            diffPercentage,
            diffPath,
            baselinePath,
            actualPath,
            dimensions: {
                baseline: baselineDims,
                actual: actualDims
            }
        };
    }
    /**
     * Pixel-level comparison
     */
    async pixelCompare(baseline, actual, dimensions) {
        // Simple comparison - compare raw buffer bytes
        // In real implementation, would decode PNG and compare pixels
        let diffPixels = 0;
        const minLength = Math.min(baseline.length, actual.length);
        for (let i = 0; i < minLength; i++) {
            if (baseline[i] !== actual[i]) {
                diffPixels++;
            }
        }
        // Estimate pixel diff from byte diff
        // PNG has ~4 bytes per pixel (RGBA)
        const estimatedPixelDiff = Math.floor(diffPixels / 4);
        return {
            diffPixels: estimatedPixelDiff,
            diffBuffer: undefined // Would generate diff image in full implementation
        };
    }
    // ─────────────────────────────────────────────────────────────────────────
    // VISUAL ASSERTIONS
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Assert visual match
     */
    async assertMatch(name, actual) {
        const result = await this.compare(name, actual);
        if (!result.match) {
            throw new Error(`Visual regression detected for "${name}": ` +
                `${result.diffPercentage.toFixed(2)}% difference ` +
                `(threshold: ${this.config.threshold * 100}%)\n` +
                `Baseline: ${result.baselinePath}\n` +
                `Actual: ${result.actualPath}` +
                (result.diffPath ? `\nDiff: ${result.diffPath}` : ''));
        }
    }
    /**
     * Assert similarity threshold
     */
    async assertSimilarity(name, actual, threshold) {
        const result = await this.compare(name, actual);
        if (result.similarity < threshold) {
            throw new Error(`Visual similarity too low for "${name}": ` +
                `${(result.similarity * 100).toFixed(2)}% ` +
                `(required: ${threshold * 100}%)`);
        }
    }
    // ─────────────────────────────────────────────────────────────────────────
    // UTILITIES
    // ─────────────────────────────────────────────────────────────────────────
    sanitizeName(name) {
        return name.replace(/[^a-zA-Z0-9-_]/g, '_').toLowerCase();
    }
    async ensureDir(dir) {
        await fs.promises.mkdir(dir, { recursive: true });
    }
    getPngDimensions(buffer) {
        // PNG header check
        if (buffer.length < 24)
            return null;
        // Check PNG signature
        const signature = buffer.slice(0, 8);
        const pngSignature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
        if (!signature.equals(pngSignature))
            return null;
        // IHDR chunk starts at byte 8
        // Width is at bytes 16-19, Height at 20-23
        const width = buffer.readUInt32BE(16);
        const height = buffer.readUInt32BE(20);
        return { width, height };
    }
    /**
     * Update configuration
     */
    configure(config) {
        Object.assign(this.config, config);
    }
    /**
     * Get configuration
     */
    getConfig() {
        return { ...this.config };
    }
}
exports.VisualTestEngine = VisualTestEngine;
// ═══════════════════════════════════════════════════════════════════════════════
// VIEWPORT PRESETS
// ═══════════════════════════════════════════════════════════════════════════════
exports.ViewportPresets = {
    // Desktop
    desktop: { width: 1920, height: 1080 },
    desktopHD: { width: 1366, height: 768 },
    desktopSmall: { width: 1280, height: 800 },
    // Laptop
    laptop: { width: 1440, height: 900 },
    laptopHiDPI: { width: 1440, height: 900, deviceScaleFactor: 2 },
    // Tablet
    iPadPro: { width: 1024, height: 1366, isMobile: true },
    iPad: { width: 768, height: 1024, isMobile: true },
    iPadMini: { width: 768, height: 1024, isMobile: true },
    // Mobile
    iPhone14ProMax: { width: 430, height: 932, isMobile: true, deviceScaleFactor: 3 },
    iPhone14: { width: 390, height: 844, isMobile: true, deviceScaleFactor: 3 },
    iPhoneSE: { width: 375, height: 667, isMobile: true, deviceScaleFactor: 2 },
    pixel7: { width: 412, height: 915, isMobile: true, deviceScaleFactor: 2.625 },
    galaxyS21: { width: 360, height: 800, isMobile: true, deviceScaleFactor: 3 }
};
// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════
const getVisualEngine = () => VisualTestEngine.getInstance();
exports.getVisualEngine = getVisualEngine;
const configureVisual = (config) => VisualTestEngine.configure(config);
exports.configureVisual = configureVisual;
// Quick visual operations
exports.visual = {
    compare: (name, screenshot) => VisualTestEngine.getInstance().compare(name, screenshot),
    assertMatch: (name, screenshot) => VisualTestEngine.getInstance().assertMatch(name, screenshot),
    saveBaseline: (name, screenshot) => VisualTestEngine.getInstance().saveBaseline(name, screenshot),
    hasBaseline: (name) => VisualTestEngine.getInstance().hasBaseline(name)
};
exports.default = VisualTestEngine;
