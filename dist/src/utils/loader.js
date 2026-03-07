"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════════════════════════════╗
 * ║   QAntum v15.1 - Type-Safe Module Loader                                                     ║
 * ║   Safely loads modules with full TypeScript support                                               ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════════════════╝
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.safeRequire = safeRequire;
exports.safeGet = safeGet;
exports.lazyRequire = lazyRequire;
exports.lazyGet = lazyGet;
exports.moduleExists = moduleExists;
exports.clearCache = clearCache;
exports.getCacheStats = getCacheStats;
const SILENT = process.env.QAntum_SILENT === 'true';
// Cache for loaded modules
const moduleCache = new Map();
/**
 * Safely require a module with error handling
 * @param modulePath - Path to the module
 * @param moduleName - Display name for logging
 * @returns The module or null if not available
 */
function safeRequire(modulePath, moduleName) {
    if (moduleCache.has(modulePath)) {
        return moduleCache.get(modulePath);
    }
    try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const mod = require(modulePath);
        moduleCache.set(modulePath, mod);
        return mod;
    }
    catch (e) {
        if (!SILENT) {
            console.warn(`⚠️ ${moduleName} not available`);
        }
        moduleCache.set(modulePath, null);
        return null;
    }
}
/**
 * Safely extract keys from a module
 * @param mod - The module object
 * @param keys - Keys to extract
 * @returns Object with extracted values (null if not found)
 */
function safeGet(mod, keys) {
    const result = {};
    for (const key of keys) {
        result[key] = mod && key in mod ? mod[key] : null;
    }
    return result;
}
/**
 * Lazy module loader - returns a function that loads on first call
 * @param modulePath - Path to the module
 * @param moduleName - Display name for logging
 * @returns Function that returns the module when called
 */
function lazyRequire(modulePath, moduleName) {
    let loaded = false;
    let cached = null;
    return () => {
        if (!loaded) {
            cached = safeRequire(modulePath, moduleName);
            loaded = true;
        }
        return cached;
    };
}
/**
 * Lazy property getter - returns a function that gets property on first call
 * @param getModule - Function that returns the module
 * @param key - Property key to get
 * @returns Function that returns the property value when called
 */
function lazyGet(getModule, key) {
    return () => {
        const mod = getModule();
        return mod && key in mod ? mod[key] : null;
    };
}
/**
 * Check if a module is available without loading it
 * @param modulePath - Path to the module
 * @returns True if module exists
 */
function moduleExists(modulePath) {
    try {
        require.resolve(modulePath);
        return true;
    }
    catch {
        return false;
    }
}
/**
 * Clear the module cache
 */
function clearCache() {
    moduleCache.clear();
}
/**
 * Get cache statistics
 * @returns Object with cache stats
 */
function getCacheStats() {
    return {
        size: moduleCache.size,
        modules: Array.from(moduleCache.keys()),
    };
}
