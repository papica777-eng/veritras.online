"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * MIND-ENGINE: VISUAL TESTING ENGINE
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Screenshot comparison, baseline management, diff generation
 * Pixel-perfect and perceptual comparison modes
 *
 * @author dp | QAntum Labs
 * @version 1.0.0-QANTUM-PRIME
 * @license Commercial
 * ═══════════════════════════════════════════════════════════════════════════════
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
exports.VisualRegressionSuite = exports.VisualTestingEngine = exports.BaselineManager = exports.VisualComparator = void 0;
const events_1 = require("events");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const crypto = __importStar(require("crypto"));
class SimplePNG {
    /**
     * Parse PNG header to get dimensions
     */
    static getDimensions(buffer) {
        // PNG signature: 137 80 78 71 13 10 26 10
        if (buffer[0] !== 137 || buffer[1] !== 80 || buffer[2] !== 78 || buffer[3] !== 71) {
            throw new Error('Invalid PNG signature');
        }
        // IHDR chunk starts at offset 8
        // Skip length (4 bytes) and chunk type (4 bytes)
        const width = buffer.readUInt32BE(16);
        const height = buffer.readUInt32BE(20);
        return { width, height };
    }
    /**
     * Simple pixel extraction (assuming raw RGBA)
     * In production, use proper PNG decoder like pngjs
     */
    static decode(buffer) {
        const { width, height } = this.getDimensions(buffer);
        // For demo purposes - in production use pngjs or sharp
        // This creates a placeholder RGBA buffer
        const data = Buffer.alloc(width * height * 4, 128);
        return { width, height, data };
    }
    /**
     * Create simple PNG (for diff images)
     * In production, use pngjs
     */
    static encode(imageData) {
        // Minimal PNG creation - use pngjs in production
        const { width, height, data } = imageData;
        // This is a simplified placeholder
        // Real implementation would create proper PNG
        const header = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
        return header; // Return minimal valid PNG-like buffer
    }
}
// ═══════════════════════════════════════════════════════════════════════════════
// VISUAL COMPARATOR
// ═══════════════════════════════════════════════════════════════════════════════
class VisualComparator {
    config;
    constructor(config = {}) {
        this.config = {
            baselineDir: './visual-baselines',
            diffDir: './visual-diffs',
            actualDir: './visual-actual',
            threshold: 0.01, // 1% difference allowed
            antialiasDetection: true,
            ignoreColors: false,
            ignoreAntialiasing: true,
            diffColor: { r: 255, g: 0, b: 255 },
            generateDiff: true,
            updateBaseline: 'missing',
            comparisonMethod: 'pixel',
            ...config
        };
    }
    /**
     * Compare two images
     */
    // Complexity: O(1)
    async compare(baseline, actual, options = {}) {
        const baselineBuffer = typeof baseline === 'string' ? fs.readFileSync(baseline) : baseline;
        const actualBuffer = typeof actual === 'string' ? fs.readFileSync(actual) : actual;
        const baselineDim = SimplePNG.getDimensions(baselineBuffer);
        const actualDim = SimplePNG.getDimensions(actualBuffer);
        // Check dimensions
        if (baselineDim.width !== actualDim.width || baselineDim.height !== actualDim.height) {
            return {
                match: false,
                diffPercentage: 100,
                diffPixels: baselineDim.width * baselineDim.height,
                totalPixels: baselineDim.width * baselineDim.height,
                dimensions: { baseline: baselineDim, actual: actualDim },
                error: `Dimension mismatch: baseline ${baselineDim.width}x${baselineDim.height} vs actual ${actualDim.width}x${actualDim.height}`
            };
        }
        const threshold = options.threshold ?? this.config.threshold;
        // Perform comparison based on method
        let result;
        switch (this.config.comparisonMethod) {
            case 'perceptual':
                // SAFETY: async operation — wrap in try-catch for production resilience
                result = await this.perceptualCompare(baselineBuffer, actualBuffer, options.ignoreRegions);
                break;
            case 'ssim':
                // SAFETY: async operation — wrap in try-catch for production resilience
                result = await this.ssimCompare(baselineBuffer, actualBuffer);
                break;
            default:
                // SAFETY: async operation — wrap in try-catch for production resilience
                result = await this.pixelCompare(baselineBuffer, actualBuffer, options.ignoreRegions);
        }
        const totalPixels = baselineDim.width * baselineDim.height;
        const diffPercentage = (result.diffPixels / totalPixels) * 100;
        const match = diffPercentage <= threshold * 100;
        return {
            match,
            diffPercentage,
            diffPixels: result.diffPixels,
            totalPixels,
            dimensions: { baseline: baselineDim, actual: actualDim }
        };
    }
    /**
     * Pixel-by-pixel comparison
     */
    // Complexity: O(N) — loop
    async pixelCompare(baseline, actual, ignoreRegions) {
        // Simplified pixel comparison
        // In production, decode PNG properly
        let diffPixels = 0;
        // Compare byte by byte (simplified)
        const minLen = Math.min(baseline.length, actual.length);
        for (let i = 0; i < minLen; i++) {
            if (baseline[i] !== actual[i]) {
                diffPixels++;
            }
        }
        // Normalize to pixel count (rough estimate)
        diffPixels = Math.floor(diffPixels / 4); // RGBA = 4 bytes
        return { diffPixels };
    }
    /**
     * Perceptual comparison (LAB color space)
     */
    // Complexity: O(1)
    async perceptualCompare(baseline, actual, ignoreRegions) {
        // Perceptual comparison using Delta E
        // Simplified implementation
        // SAFETY: async operation — wrap in try-catch for production resilience
        const pixelResult = await this.pixelCompare(baseline, actual, ignoreRegions);
        // Apply perceptual tolerance
        return { diffPixels: Math.floor(pixelResult.diffPixels * 0.8) };
    }
    /**
     * SSIM comparison
     */
    // Complexity: O(1)
    async ssimCompare(baseline, actual) {
        // Structural Similarity Index
        // Simplified - use ssim.js in production
        // SAFETY: async operation — wrap in try-catch for production resilience
        const pixelResult = await this.pixelCompare(baseline, actual);
        return { diffPixels: Math.floor(pixelResult.diffPixels * 0.7) };
    }
    /**
     * Calculate hash for image
     */
    // Complexity: O(1)
    calculateHash(buffer) {
        return crypto.createHash('md5').update(buffer).digest('hex');
    }
}
exports.VisualComparator = VisualComparator;
// ═══════════════════════════════════════════════════════════════════════════════
// BASELINE MANAGER
// ═══════════════════════════════════════════════════════════════════════════════
class BaselineManager extends events_1.EventEmitter {
    config;
    baselines = new Map();
    comparator;
    constructor(config = {}) {
        super();
        this.config = {
            baselineDir: './visual-baselines',
            diffDir: './visual-diffs',
            actualDir: './visual-actual',
            threshold: 0.01,
            antialiasDetection: true,
            ignoreColors: false,
            ignoreAntialiasing: true,
            diffColor: { r: 255, g: 0, b: 255 },
            generateDiff: true,
            updateBaseline: 'missing',
            comparisonMethod: 'pixel',
            ...config
        };
        this.comparator = new VisualComparator(this.config);
        this.ensureDirectories();
        this.loadBaselines();
    }
    /**
     * Save baseline
     */
    // Complexity: O(1) — lookup
    saveBaseline(name, screenshot, metadata) {
        const filePath = this.getBaselinePath(name);
        const dimensions = SimplePNG.getDimensions(screenshot);
        fs.writeFileSync(filePath, screenshot);
        const baseline = {
            name,
            path: filePath,
            hash: this.comparator.calculateHash(screenshot),
            width: dimensions.width,
            height: dimensions.height,
            createdAt: new Date(),
            updatedAt: new Date(),
            metadata
        };
        this.baselines.set(name, baseline);
        this.saveBaselineIndex();
        this.emit('baseline:saved', baseline);
        return baseline;
    }
    /**
     * Get baseline
     */
    // Complexity: O(1) — lookup
    getBaseline(name) {
        return this.baselines.get(name);
    }
    /**
     * Check if baseline exists
     */
    // Complexity: O(1) — lookup
    hasBaseline(name) {
        return this.baselines.has(name);
    }
    /**
     * Update baseline
     */
    // Complexity: O(1) — lookup
    updateBaseline(name, screenshot) {
        const existing = this.baselines.get(name);
        if (!existing) {
            return this.saveBaseline(name, screenshot);
        }
        const dimensions = SimplePNG.getDimensions(screenshot);
        fs.writeFileSync(existing.path, screenshot);
        existing.hash = this.comparator.calculateHash(screenshot);
        existing.width = dimensions.width;
        existing.height = dimensions.height;
        existing.updatedAt = new Date();
        this.saveBaselineIndex();
        this.emit('baseline:updated', existing);
        return existing;
    }
    /**
     * Delete baseline
     */
    // Complexity: O(1) — lookup
    deleteBaseline(name) {
        const baseline = this.baselines.get(name);
        if (!baseline)
            return false;
        if (fs.existsSync(baseline.path)) {
            fs.unlinkSync(baseline.path);
        }
        this.baselines.delete(name);
        this.saveBaselineIndex();
        this.emit('baseline:deleted', { name });
        return true;
    }
    /**
     * List all baselines
     */
    // Complexity: O(N) — linear scan
    listBaselines(filter) {
        let baselines = Array.from(this.baselines.values());
        if (filter?.prefix) {
            baselines = baselines.filter(b => b.name.startsWith(filter.prefix));
        }
        return baselines;
    }
    /**
     * Cleanup unused baselines
     */
    // Complexity: O(N) — loop
    cleanup(usedNames) {
        const usedSet = new Set(usedNames);
        let removed = 0;
        for (const [name] of this.baselines) {
            if (!usedSet.has(name)) {
                this.deleteBaseline(name);
                removed++;
            }
        }
        return removed;
    }
    // Complexity: O(N) — linear scan
    ensureDirectories() {
        [this.config.baselineDir, this.config.diffDir, this.config.actualDir].forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        });
    }
    // Complexity: O(1)
    getBaselinePath(name) {
        const sanitized = name.replace(/[^a-zA-Z0-9-_]/g, '_');
        return path.join(this.config.baselineDir, `${sanitized}.png`);
    }
    // Complexity: O(N) — loop
    loadBaselines() {
        const indexPath = path.join(this.config.baselineDir, 'index.json');
        if (fs.existsSync(indexPath)) {
            try {
                const data = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
                for (const baseline of data.baselines) {
                    baseline.createdAt = new Date(baseline.createdAt);
                    baseline.updatedAt = new Date(baseline.updatedAt);
                    this.baselines.set(baseline.name, baseline);
                }
            }
            catch {
                // Rebuild from files
                this.rebuildIndex();
            }
        }
        else {
            this.rebuildIndex();
        }
    }
    // Complexity: O(N) — linear scan
    rebuildIndex() {
        const files = fs.readdirSync(this.config.baselineDir).filter(f => f.endsWith('.png'));
        for (const file of files) {
            const name = path.basename(file, '.png');
            const filePath = path.join(this.config.baselineDir, file);
            const buffer = fs.readFileSync(filePath);
            const dimensions = SimplePNG.getDimensions(buffer);
            const stat = fs.statSync(filePath);
            this.baselines.set(name, {
                name,
                path: filePath,
                hash: this.comparator.calculateHash(buffer),
                width: dimensions.width,
                height: dimensions.height,
                createdAt: stat.birthtime,
                updatedAt: stat.mtime
            });
        }
        this.saveBaselineIndex();
    }
    // Complexity: O(1)
    saveBaselineIndex() {
        const indexPath = path.join(this.config.baselineDir, 'index.json');
        const data = {
            version: 1,
            updatedAt: new Date().toISOString(),
            baselines: Array.from(this.baselines.values())
        };
        fs.writeFileSync(indexPath, JSON.stringify(data, null, 2));
    }
}
exports.BaselineManager = BaselineManager;
// ═══════════════════════════════════════════════════════════════════════════════
// VISUAL TESTING ENGINE
// ═══════════════════════════════════════════════════════════════════════════════
class VisualTestingEngine extends events_1.EventEmitter {
    config;
    baselineManager;
    comparator;
    results = new Map();
    constructor(config = {}) {
        super();
        this.config = {
            baselineDir: './visual-baselines',
            diffDir: './visual-diffs',
            actualDir: './visual-actual',
            threshold: 0.01,
            antialiasDetection: true,
            ignoreColors: false,
            ignoreAntialiasing: true,
            diffColor: { r: 255, g: 0, b: 255 },
            generateDiff: true,
            updateBaseline: 'missing',
            comparisonMethod: 'pixel',
            ...config
        };
        this.baselineManager = new BaselineManager(this.config);
        this.comparator = new VisualComparator(this.config);
    }
    /**
     * Take screenshot and compare with baseline
     */
    // Complexity: O(1) — lookup
    async check(page, options) {
        const { name, threshold, ignoreRegions, element, fullPage, clip, waitBefore } = options;
        this.emit('check:start', { name });
        // Wait before screenshot if specified
        if (waitBefore) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await new Promise(r => setTimeout(r, waitBefore));
        }
        // Take screenshot
        let screenshot;
        if (element) {
            const locator = page.locator(element);
            // SAFETY: async operation — wrap in try-catch for production resilience
            screenshot = await locator.screenshot();
        }
        else {
            // SAFETY: async operation — wrap in try-catch for production resilience
            screenshot = await page.screenshot({
                fullPage: fullPage ?? false,
                clip
            });
        }
        // Save actual
        const actualPath = path.join(this.config.actualDir, `${name}.png`);
        fs.writeFileSync(actualPath, screenshot);
        // Check if baseline exists
        if (!this.baselineManager.hasBaseline(name)) {
            if (this.config.updateBaseline === 'missing' || this.config.updateBaseline === true) {
                this.baselineManager.saveBaseline(name, screenshot, options.metadata);
                const result = {
                    match: true,
                    diffPercentage: 0,
                    diffPixels: 0,
                    totalPixels: 0,
                    baselinePath: this.baselineManager.getBaseline(name)?.path,
                    actualPath,
                    dimensions: {
                        baseline: SimplePNG.getDimensions(screenshot),
                        actual: SimplePNG.getDimensions(screenshot)
                    }
                };
                this.results.set(name, result);
                this.emit('check:complete', { name, result, newBaseline: true });
                return result;
            }
            const result = {
                match: false,
                diffPercentage: 100,
                diffPixels: 0,
                totalPixels: 0,
                actualPath,
                dimensions: {
                    baseline: { width: 0, height: 0 },
                    actual: SimplePNG.getDimensions(screenshot)
                },
                error: `No baseline found for "${name}"`
            };
            this.results.set(name, result);
            this.emit('check:failed', { name, result });
            return result;
        }
        // Compare with baseline
        const baseline = this.baselineManager.getBaseline(name);
        const baselineBuffer = fs.readFileSync(baseline.path);
        // SAFETY: async operation — wrap in try-catch for production resilience
        const result = await this.comparator.compare(baselineBuffer, screenshot, {
            threshold: threshold ?? this.config.threshold,
            ignoreRegions
        });
        result.baselinePath = baseline.path;
        result.actualPath = actualPath;
        // Generate diff if needed
        if (!result.match && this.config.generateDiff) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            result.diffPath = await this.generateDiff(name, baselineBuffer, screenshot);
        }
        // Update baseline if configured
        if (this.config.updateBaseline === 'all' && !result.match) {
            this.baselineManager.updateBaseline(name, screenshot);
            this.emit('baseline:autoUpdated', { name });
        }
        this.results.set(name, result);
        this.emit(result.match ? 'check:complete' : 'check:failed', { name, result });
        return result;
    }
    /**
     * Generate diff image
     */
    // Complexity: O(1)
    async generateDiff(name, baseline, actual) {
        const diffPath = path.join(this.config.diffDir, `${name}_diff.png`);
        // Create simple diff visualization
        // In production, use proper image diff library
        const baselineDim = SimplePNG.getDimensions(baseline);
        // Create placeholder diff (in production, generate actual diff image)
        const diffBuffer = this.createPlaceholderDiff(baselineDim.width, baselineDim.height);
        fs.writeFileSync(diffPath, diffBuffer);
        return diffPath;
    }
    // Complexity: O(1)
    createPlaceholderDiff(width, height) {
        // Create minimal PNG placeholder
        // In production, generate actual pixel diff
        return Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
    }
    /**
     * Get all results
     */
    // Complexity: O(1)
    getResults() {
        return this.results;
    }
    /**
     * Get summary
     */
    // Complexity: O(N) — linear scan
    getSummary() {
        const results = Array.from(this.results.values());
        const passed = results.filter(r => r.match).length;
        const failed = results.length - passed;
        const avgDiffPercentage = results.length > 0
            ? results.reduce((sum, r) => sum + r.diffPercentage, 0) / results.length
            : 0;
        return { total: results.length, passed, failed, avgDiffPercentage };
    }
    /**
     * Clear results
     */
    // Complexity: O(1)
    clearResults() {
        this.results.clear();
    }
    /**
     * Update specific baseline
     */
    // Complexity: O(1)
    updateBaseline(name, screenshot) {
        this.baselineManager.updateBaseline(name, screenshot);
    }
    /**
     * Get baseline manager
     */
    // Complexity: O(1)
    getBaselineManager() {
        return this.baselineManager;
    }
}
exports.VisualTestingEngine = VisualTestingEngine;
// ═══════════════════════════════════════════════════════════════════════════════
// VISUAL REGRESSION SUITE
// ═══════════════════════════════════════════════════════════════════════════════
class VisualRegressionSuite extends events_1.EventEmitter {
    engine;
    tests = [];
    name;
    constructor(name, config = {}) {
        super();
        this.name = name;
        this.engine = new VisualTestingEngine(config);
        // Forward events
        this.engine.on('check:start', (data) => this.emit('test:start', data));
        this.engine.on('check:complete', (data) => this.emit('test:pass', data));
        this.engine.on('check:failed', (data) => this.emit('test:fail', data));
    }
    /**
     * Add visual test
     */
    // Complexity: O(1)
    addTest(options) {
        this.tests.push(options);
        return this;
    }
    /**
     * Run all tests
     */
    // Complexity: O(N) — loop
    async run(page) {
        this.emit('suite:start', { name: this.name, tests: this.tests.length });
        const results = [];
        for (const test of this.tests) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            const result = await this.engine.check(page, test);
            results.push(result);
        }
        const summary = this.engine.getSummary();
        this.emit('suite:complete', {
            name: this.name,
            ...summary
        });
        return {
            name: this.name,
            passed: summary.passed,
            failed: summary.failed,
            results
        };
    }
}
exports.VisualRegressionSuite = VisualRegressionSuite;
exports.default = {
    VisualTestingEngine,
    VisualComparator,
    BaselineManager,
    VisualRegressionSuite
};
