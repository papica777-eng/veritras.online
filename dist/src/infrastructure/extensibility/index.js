"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                               ║
 * ║   QAntum EXTENSIBILITY MODULE                                                 ║
 * ║   "Plugin System & Theme Engine"                                              ║
 * ║                                                                               ║
 * ║   TODO B #46-47 - Extensibility Complete                                      ║
 * ║                                                                               ║
 * ║   © 2025-2026 QAntum | Dimitar Prodromov                                        ║
 * ║                                                                               ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Extensibility = exports.darkTheme = exports.lightTheme = exports.getThemeEngine = exports.ThemeEngine = exports.Hook = exports.Command = exports.getPluginManager = exports.PluginManager = void 0;
exports.getExtensibility = getExtensibility;
// ═══════════════════════════════════════════════════════════════════════════════
// PLUGIN SYSTEM
// ═══════════════════════════════════════════════════════════════════════════════
var plugin_system_1 = require("./plugin-system");
Object.defineProperty(exports, "PluginManager", { enumerable: true, get: function () { return plugin_system_1.PluginManager; } });
Object.defineProperty(exports, "getPluginManager", { enumerable: true, get: function () { return plugin_system_1.getPluginManager; } });
Object.defineProperty(exports, "Command", { enumerable: true, get: function () { return plugin_system_1.Command; } });
Object.defineProperty(exports, "Hook", { enumerable: true, get: function () { return plugin_system_1.Hook; } });
// ═══════════════════════════════════════════════════════════════════════════════
// THEME ENGINE
// ═══════════════════════════════════════════════════════════════════════════════
var theme_engine_1 = require("./theme-engine");
Object.defineProperty(exports, "ThemeEngine", { enumerable: true, get: function () { return theme_engine_1.ThemeEngine; } });
Object.defineProperty(exports, "getThemeEngine", { enumerable: true, get: function () { return theme_engine_1.getThemeEngine; } });
Object.defineProperty(exports, "lightTheme", { enumerable: true, get: function () { return theme_engine_1.lightTheme; } });
Object.defineProperty(exports, "darkTheme", { enumerable: true, get: function () { return theme_engine_1.darkTheme; } });
// ═══════════════════════════════════════════════════════════════════════════════
// UNIFIED EXTENSIBILITY FACADE
// ═══════════════════════════════════════════════════════════════════════════════
const plugin_system_2 = require("./plugin-system");
const theme_engine_2 = require("./theme-engine");
class Extensibility {
    plugins;
    themes;
    constructor() {
        this.plugins = plugin_system_2.PluginManager.getInstance();
        this.themes = theme_engine_2.ThemeEngine.getInstance();
    }
    /**
     * Install and activate a plugin
     */
    // Complexity: O(1)
    async installPlugin(manifest, PluginClass) {
        this.plugins.register(manifest, PluginClass);
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.plugins.activate(manifest.id);
    }
    /**
     * Apply a theme by ID
     */
    // Complexity: O(1)
    applyTheme(themeId) {
        this.themes.apply(themeId);
    }
    /**
     * Register and apply a custom theme
     */
    // Complexity: O(1)
    registerAndApplyTheme(theme) {
        this.themes.register(theme);
        this.themes.apply(theme.id);
    }
}
exports.Extensibility = Extensibility;
// Singleton
let extensibilityInstance = null;
function getExtensibility() {
    if (!extensibilityInstance) {
        extensibilityInstance = new Extensibility();
    }
    return extensibilityInstance;
}
exports.default = Extensibility;
