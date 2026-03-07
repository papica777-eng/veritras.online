"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                               ║
 * ║   QANTUM PERFORMANCE MODULE                                                   ║
 * ║   "Unified performance optimization exports"                                  ║
 * ║                                                                               ║
 * ║   © 2025-2026 QAntum | Dimitar Prodromov                                        ║
 * ║                                                                               ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Memoize = exports.CacheRegistry = exports.NamespacedCache = exports.getCache = exports.Cache = exports.QAntumModules = exports.LazyProperty = exports.lazyAsync = exports.lazyFn = exports.getLazyLoader = exports.LazyLoader = exports.ProfileSync = exports.Profile = exports.getProfiler = exports.PerformanceProfiler = exports.ConnectionPool = exports.PagePool = exports.BrowserPool = exports.ResourcePool = exports.parallelMap = exports.parallel = exports.ParallelExecutor = void 0;
// ═══════════════════════════════════════════════════════════════════════════════
// PARALLEL EXECUTOR
// ═══════════════════════════════════════════════════════════════════════════════
var parallel_js_1 = require("./parallel.js");
Object.defineProperty(exports, "ParallelExecutor", { enumerable: true, get: function () { return parallel_js_1.ParallelExecutor; } });
Object.defineProperty(exports, "parallel", { enumerable: true, get: function () { return parallel_js_1.parallel; } });
Object.defineProperty(exports, "parallelMap", { enumerable: true, get: function () { return parallel_js_1.parallelMap; } });
// ═══════════════════════════════════════════════════════════════════════════════
// RESOURCE POOL
// ═══════════════════════════════════════════════════════════════════════════════
var pool_js_1 = require("./pool.js");
Object.defineProperty(exports, "ResourcePool", { enumerable: true, get: function () { return pool_js_1.ResourcePool; } });
Object.defineProperty(exports, "BrowserPool", { enumerable: true, get: function () { return pool_js_1.BrowserPool; } });
Object.defineProperty(exports, "PagePool", { enumerable: true, get: function () { return pool_js_1.PagePool; } });
Object.defineProperty(exports, "ConnectionPool", { enumerable: true, get: function () { return pool_js_1.ConnectionPool; } });
// ═══════════════════════════════════════════════════════════════════════════════
// PROFILER
// ═══════════════════════════════════════════════════════════════════════════════
var profiler_1 = require("./profiler");
Object.defineProperty(exports, "PerformanceProfiler", { enumerable: true, get: function () { return profiler_1.PerformanceProfiler; } });
Object.defineProperty(exports, "getProfiler", { enumerable: true, get: function () { return profiler_1.getProfiler; } });
Object.defineProperty(exports, "Profile", { enumerable: true, get: function () { return profiler_1.Profile; } });
Object.defineProperty(exports, "ProfileSync", { enumerable: true, get: function () { return profiler_1.ProfileSync; } });
// ═══════════════════════════════════════════════════════════════════════════════
// LAZY LOADER
// ═══════════════════════════════════════════════════════════════════════════════
var lazy_loader_1 = require("./lazy-loader");
Object.defineProperty(exports, "LazyLoader", { enumerable: true, get: function () { return lazy_loader_1.LazyLoader; } });
Object.defineProperty(exports, "getLazyLoader", { enumerable: true, get: function () { return lazy_loader_1.getLazyLoader; } });
Object.defineProperty(exports, "lazyFn", { enumerable: true, get: function () { return lazy_loader_1.lazyFn; } });
Object.defineProperty(exports, "lazyAsync", { enumerable: true, get: function () { return lazy_loader_1.lazyAsync; } });
Object.defineProperty(exports, "LazyProperty", { enumerable: true, get: function () { return lazy_loader_1.LazyProperty; } });
Object.defineProperty(exports, "QAntumModules", { enumerable: true, get: function () { return lazy_loader_1.QAntumModules; } });
// ═══════════════════════════════════════════════════════════════════════════════
// CACHE
// ═══════════════════════════════════════════════════════════════════════════════
var cache_1 = require("./cache");
Object.defineProperty(exports, "Cache", { enumerable: true, get: function () { return cache_1.Cache; } });
Object.defineProperty(exports, "getCache", { enumerable: true, get: function () { return cache_1.getCache; } });
Object.defineProperty(exports, "NamespacedCache", { enumerable: true, get: function () { return cache_1.NamespacedCache; } });
Object.defineProperty(exports, "CacheRegistry", { enumerable: true, get: function () { return cache_1.CacheRegistry; } });
Object.defineProperty(exports, "Memoize", { enumerable: true, get: function () { return cache_1.Memoize; } });
// ═══════════════════════════════════════════════════════════════════════════════
// DEFAULT EXPORT
// ═══════════════════════════════════════════════════════════════════════════════
const profiler_2 = __importDefault(require("./profiler"));
const lazy_loader_2 = __importDefault(require("./lazy-loader"));
const cache_2 = __importDefault(require("./cache"));
exports.default = {
    Profiler: profiler_2.default,
    LazyLoader: lazy_loader_2.default,
    Cache: cache_2.default,
};
