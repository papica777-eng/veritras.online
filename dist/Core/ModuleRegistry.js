"use strict";
/**
 * ModuleRegistry — Qantum Module
 * @module ModuleRegistry
 * @path core/ModuleRegistry.ts
 * @auto-documented BrutalDocEngine v2.1
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
exports.ModuleRegistry = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class ModuleRegistry {
    modules = new Map();
    baseDir;
    constructor(baseDir) {
        this.baseDir = baseDir;
    }
    // Complexity: O(N) — linear iteration
    async discoverModules() {
        const moduleDirs = [
            'brain',
            'core',
            'security',
            'skills',
            'healing',
            'intelligence',
            'physics',
            'ArbitrageOrchestrator',
            'BrainRouter',
            'ChronosEngine',
            'CognitiveCircularGuard',
            'ContextInjector',
            'EternalWatchdog',
        ];
        for (const dir of moduleDirs) {
            const fullPath = path.isAbsolute(dir) ? dir : path.join(this.baseDir, dir);
            if (fs.existsSync(fullPath)) {
                // SAFETY: async operation — wrap in try-catch for production resilience
                await this.scanDirectory(fullPath, dir);
            }
        }
    }
    // Complexity: O(N) — linear iteration
    async scanDirectory(dirPath, category) {
        const files = fs.readdirSync(dirPath);
        for (const file of files) {
            const fullPath = path.join(dirPath, file);
            const stat = fs.statSync(fullPath);
            if (stat.isFile() && (file.endsWith('.ts') || file.endsWith('.js'))) {
                const moduleName = path.basename(file, path.extname(file));
                this.modules.set(moduleName, {
                    name: moduleName,
                    version: '1.0.0', // Default, should read from file eventually
                    description: `Module from ${category}`,
                    dependencies: [],
                    category,
                    status: 'loaded',
                });
            }
        }
    }
    // Complexity: O(1) — hash/map lookup
    getModule(name) {
        return this.modules.get(name);
    }
    // Complexity: O(1)
    getAllModules() {
        return Array.from(this.modules.values());
    }
    // Complexity: O(N) — linear iteration
    getModulesByCategory(category) {
        return this.getAllModules().filter((m) => m.category === category);
    }
    // Complexity: O(N) — linear iteration
    getHealthStatus() {
        const all = this.getAllModules();
        return {
            total: all.length,
            loaded: all.filter((m) => m.status === 'loaded').length,
            errors: all.filter((m) => m.status === 'error').length,
        };
    }
}
exports.ModuleRegistry = ModuleRegistry;
