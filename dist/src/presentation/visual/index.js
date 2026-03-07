"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                               ║
 * ║   QANTUM VISUAL MODULE                                                        ║
 * ║   "Unified visual testing facade"                                             ║
 * ║                                                                               ║
 * ║   TODO B #33-34 - Visual Testing Module                                       ║
 * ║                                                                               ║
 * ║   © 2025-2026 QAntum | Dimitar Prodromov                                        ║
 * ║                                                                               ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureQAntumVisual = exports.getQAntumVisual = exports.QAntumVisual = exports.snapshot = exports.configureSnapshots = exports.getSnapshotManager = exports.SnapshotManager = exports.visual = exports.configureVisual = exports.getVisualEngine = exports.ViewportPresets = exports.VisualTestEngine = void 0;
// ═══════════════════════════════════════════════════════════════════════════════
// RE-EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════
var engine_1 = require("./engine");
Object.defineProperty(exports, "VisualTestEngine", { enumerable: true, get: function () { return engine_1.VisualTestEngine; } });
Object.defineProperty(exports, "ViewportPresets", { enumerable: true, get: function () { return engine_1.ViewportPresets; } });
Object.defineProperty(exports, "getVisualEngine", { enumerable: true, get: function () { return engine_1.getVisualEngine; } });
Object.defineProperty(exports, "configureVisual", { enumerable: true, get: function () { return engine_1.configureVisual; } });
Object.defineProperty(exports, "visual", { enumerable: true, get: function () { return engine_1.visual; } });
var snapshot_1 = require("./snapshot");
Object.defineProperty(exports, "SnapshotManager", { enumerable: true, get: function () { return snapshot_1.SnapshotManager; } });
Object.defineProperty(exports, "getSnapshotManager", { enumerable: true, get: function () { return snapshot_1.getSnapshotManager; } });
Object.defineProperty(exports, "configureSnapshots", { enumerable: true, get: function () { return snapshot_1.configureSnapshots; } });
Object.defineProperty(exports, "snapshot", { enumerable: true, get: function () { return snapshot_1.snapshot; } });
// ═══════════════════════════════════════════════════════════════════════════════
// UNIFIED VISUAL TESTING
// ═══════════════════════════════════════════════════════════════════════════════
const engine_2 = require("./engine");
const snapshot_2 = require("./snapshot");
/**
 * Unified QAntum Visual Testing
 */
class QAntumVisual {
    static instance;
    _engine;
    _snapshots;
    constructor(config = {}) {
        this._engine = engine_2.VisualTestEngine.getInstance(config.visual);
        this._snapshots = snapshot_2.SnapshotManager.getInstance(config.snapshot);
    }
    static getInstance(config) {
        if (!QAntumVisual.instance) {
            QAntumVisual.instance = new QAntumVisual(config);
        }
        return QAntumVisual.instance;
    }
    static configure(config) {
        QAntumVisual.instance = new QAntumVisual(config);
        return QAntumVisual.instance;
    }
    // ─────────────────────────────────────────────────────────────────────────
    // ACCESSORS
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Get visual engine
     */
    get engine() {
        return this._engine;
    }
    /**
     * Get snapshot manager
     */
    get snapshots() {
        return this._snapshots;
    }
    /**
     * Get viewport presets
     */
    get viewports() {
        return engine_2.ViewportPresets;
    }
    // ─────────────────────────────────────────────────────────────────────────
    // SCREENSHOT TESTING
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Compare screenshot with baseline
     */
    // Complexity: O(1)
    async compareScreenshot(name, screenshot) {
        return this._engine.compare(name, screenshot);
    }
    /**
     * Assert screenshot matches baseline
     */
    // Complexity: O(1)
    async assertScreenshot(name, screenshot) {
        return this._engine.assertMatch(name, screenshot);
    }
    /**
     * Save new baseline
     */
    // Complexity: O(1)
    async saveBaseline(name, screenshot) {
        return this._engine.saveBaseline(name, screenshot);
    }
    /**
     * Check baseline exists
     */
    // Complexity: O(1)
    async hasBaseline(name) {
        return this._engine.hasBaseline(name);
    }
    // ─────────────────────────────────────────────────────────────────────────
    // SNAPSHOT TESTING
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Match value snapshot
     */
    // Complexity: O(1)
    async matchSnapshot(testName, value, snapshotName) {
        return this._snapshots.matchSnapshot(testName, value, snapshotName);
    }
    /**
     * Assert value matches snapshot
     */
    // Complexity: O(1)
    async assertSnapshot(testName, value, snapshotName) {
        return this._snapshots.assertSnapshot(testName, value, snapshotName);
    }
    /**
     * Match inline snapshot
     */
    // Complexity: O(1)
    matchInlineSnapshot(value, inlineSnapshot) {
        return this._snapshots.matchInlineSnapshot(value, inlineSnapshot);
    }
    /**
     * Serialize value
     */
    // Complexity: O(1)
    serialize(value) {
        return this._snapshots.serialize(value);
    }
    // ─────────────────────────────────────────────────────────────────────────
    // COMBINED TESTING
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Full page test - screenshot + HTML snapshot
     */
    // Complexity: O(N) — parallel
    async fullPageTest(name, screenshot, html) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const [visual, snapshot] = await Promise.all([
            this.compareScreenshot(name, screenshot),
            this.matchSnapshot(name, html, `${name}-html`),
        ]);
        return { visual, snapshot };
    }
    /**
     * Assert full page matches
     */
    // Complexity: O(N) — parallel
    async assertFullPage(name, screenshot, html) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await Promise.all([
            this.assertScreenshot(name, screenshot),
            this.assertSnapshot(name, html, `${name}-html`),
        ]);
    }
    // ─────────────────────────────────────────────────────────────────────────
    // RESPONSIVE TESTING
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Test multiple viewports
     */
    // Complexity: O(1)
    async testResponsive(name, screenshotGetter, viewportNames = ['desktop', 'iPad', 'iPhone14']) {
        const results = new Map();
        for (const viewportName of viewportNames) {
            const viewport = engine_2.ViewportPresets[viewportName];
            // SAFETY: async operation — wrap in try-catch for production resilience
            const screenshot = await screenshotGetter(viewport);
            // SAFETY: async operation — wrap in try-catch for production resilience
            const result = await this.compareScreenshot(`${name}-${viewportName}`, screenshot);
            results.set(viewportName, result);
        }
        return results;
    }
    /**
     * Assert all viewports match
     */
    // Complexity: O(1)
    async assertResponsive(name, screenshotGetter, viewportNames = ['desktop', 'iPad', 'iPhone14']) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const results = await this.testResponsive(name, screenshotGetter, viewportNames);
        const failures = [];
        for (const [viewport, result] of results) {
            if (!result.match) {
                failures.push(`${viewport}: ${result.diffPercentage.toFixed(2)}% difference`);
            }
        }
        if (failures.length > 0) {
            throw new Error(`Responsive visual regression:\n${failures.join('\n')}`);
        }
    }
    // ─────────────────────────────────────────────────────────────────────────
    // CONFIGURATION
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Enable update mode
     */
    // Complexity: O(1)
    enableUpdateMode() {
        this._snapshots.setUpdateMode(true);
    }
    /**
     * Disable update mode
     */
    // Complexity: O(1)
    disableUpdateMode() {
        this._snapshots.setUpdateMode(false);
    }
    /**
     * Reset for new test file
     */
    // Complexity: O(1)
    reset() {
        this._snapshots.resetCounts();
    }
}
exports.QAntumVisual = QAntumVisual;
// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════
const getQAntumVisual = () => QAntumVisual.getInstance();
exports.getQAntumVisual = getQAntumVisual;
const configureQAntumVisual = (config) => QAntumVisual.configure(config);
exports.configureQAntumVisual = configureQAntumVisual;
exports.default = QAntumVisual;
