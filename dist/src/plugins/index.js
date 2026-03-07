"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                               ║
 * ║   QAntum PLUGINS MODULE                                                       ║
 * ║   "Unified plugin system"                                                     ║
 * ║                                                                               ║
 * ║   TODO B #44 - Plugin System                                                  ║
 * ║                                                                               ║
 * ║   © 2025-2026 QAntum | Dimitar Prodromov                                        ║
 * ║                                                                               ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.plugins = exports.getQAntumPlugins = exports.QAntumPlugins = exports.ScreenshotPlugin = exports.ConsoleReporterPlugin = exports.RetryPlugin = exports.TimerPlugin = exports.PluginBuilder = exports.PluginManager = void 0;
// ═══════════════════════════════════════════════════════════════════════════════
// RE-EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════
var plugin_1 = require("./plugin");
Object.defineProperty(exports, "PluginManager", { enumerable: true, get: function () { return plugin_1.PluginManager; } });
Object.defineProperty(exports, "PluginBuilder", { enumerable: true, get: function () { return plugin_1.PluginBuilder; } });
// Built-in plugins
Object.defineProperty(exports, "TimerPlugin", { enumerable: true, get: function () { return plugin_1.TimerPlugin; } });
Object.defineProperty(exports, "RetryPlugin", { enumerable: true, get: function () { return plugin_1.RetryPlugin; } });
Object.defineProperty(exports, "ConsoleReporterPlugin", { enumerable: true, get: function () { return plugin_1.ConsoleReporterPlugin; } });
Object.defineProperty(exports, "ScreenshotPlugin", { enumerable: true, get: function () { return plugin_1.ScreenshotPlugin; } });
// ═══════════════════════════════════════════════════════════════════════════════
// IMPORTS
// ═══════════════════════════════════════════════════════════════════════════════
const plugin_2 = require("./plugin");
// ═══════════════════════════════════════════════════════════════════════════════
// QAntum PLUGINS
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * Unified QAntum Plugins
 */
class QAntumPlugins {
    static instance;
    manager;
    constructor() {
        this.manager = new plugin_2.PluginManager();
    }
    static getInstance() {
        if (!QAntumPlugins.instance) {
            QAntumPlugins.instance = new QAntumPlugins();
        }
        return QAntumPlugins.instance;
    }
    /**
     * Register plugin
     */
    // Complexity: O(1)
    async use(plugin, config) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.manager.register(plugin, config);
        return this;
    }
    /**
     * Register multiple plugins
     */
    // Complexity: O(N) — loop
    async useAll(...plugins) {
        for (const plugin of plugins) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.manager.register(plugin);
        }
        return this;
    }
    /**
     * Initialize all plugins
     */
    // Complexity: O(1)
    async init() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.manager.init();
        return this;
    }
    /**
     * Load default plugins
     */
    // Complexity: O(1)
    async loadDefaults() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.use(plugin_2.TimerPlugin);
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.use(plugin_2.ConsoleReporterPlugin);
        return this;
    }
    /**
     * Get plugin
     */
    get(name) {
        return this.manager.get(name);
    }
    /**
     * Check if plugin exists
     */
    // Complexity: O(1) — lookup
    has(name) {
        return this.manager.has(name);
    }
    /**
     * Get all plugins
     */
    // Complexity: O(1)
    list() {
        return this.manager.getAll();
    }
    /**
     * Create custom plugin
     */
    // Complexity: O(1)
    create(name) {
        return plugin_2.PluginBuilder.create(name);
    }
    /**
     * Destroy all
     */
    // Complexity: O(1)
    async destroy() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.manager.destroy();
    }
}
exports.QAntumPlugins = QAntumPlugins;
// ═══════════════════════════════════════════════════════════════════════════════
// SINGLETON & EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════
const getQAntumPlugins = () => QAntumPlugins.getInstance();
exports.getQAntumPlugins = getQAntumPlugins;
exports.plugins = QAntumPlugins.getInstance();
exports.default = QAntumPlugins;
