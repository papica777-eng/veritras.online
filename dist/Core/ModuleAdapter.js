"use strict";
/**
 * ModuleAdapter — Qantum Module
 * @module ModuleAdapter
 * @path core/ModuleAdapter.ts
 * @auto-documented BrutalDocEngine v2.1
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModuleAdapter = void 0;
exports.createAdapterFromMap = createAdapterFromMap;
const cross_module_sync_1 = require("../synthesis/cross-module-sync");
class ModuleAdapter {
    id;
    version;
    legacyModule;
    primaryMethod;
    constructor(id, legacyModule, options) {
        this.id = id;
        this.legacyModule = legacyModule;
        this.version = options?.version || '1.0.0';
        this.primaryMethod = options?.primaryMethod || this.detectPrimaryMethod();
        // 🔗 AUTO-REGISTER WITH ORCHESTRATOR
        try {
            // Complexity: O(1) — hash/map lookup
            (0, cross_module_sync_1.getSync)().registerModule(this.id, this);
            console.log(`🔌 [ModuleAdapter] ${this.id} connected to Orchestrator`);
        }
        catch (error) {
            console.warn(`⚠️ [ModuleAdapter] ${this.id} could not connect to Orchestrator:`, error);
        }
    }
    /**
     * Auto-detect the main execution method
     * Common patterns: execute, run, process, analyze, scan, fix
     */
    // Complexity: O(N) — linear iteration
    detectPrimaryMethod() {
        const candidates = ['execute', 'run', 'process', 'analyze', 'scan', 'fix', 'start'];
        for (const method of candidates) {
            if (typeof this.legacyModule[method] === 'function') {
                return method;
            }
        }
        // Fallback: find first function
        const firstFunc = Object.keys(this.legacyModule).find(key => typeof this.legacyModule[key] === 'function');
        return firstFunc || 'execute';
    }
    // Complexity: O(1) — amortized
    async execute(context) {
        const startTime = Date.now();
        const startMem = process.memoryUsage().heapUsed;
        try {
            const method = this.legacyModule[this.primaryMethod];
            if (!method) {
                return {
                    success: false,
                    error: `Method '${this.primaryMethod}' not found in module '${this.id}'`
                };
            }
            // Invoke the legacy method
            const result = await Promise.resolve(method.call(this.legacyModule, context.payload));
            return {
                success: true,
                data: result,
                metrics: {
                    durationMs: Date.now() - startTime,
                    memoryUsage: process.memoryUsage().heapUsed - startMem
                }
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message || 'Unknown error',
                metrics: {
                    durationMs: Date.now() - startTime,
                    memoryUsage: process.memoryUsage().heapUsed - startMem
                }
            };
        }
    }
    // Complexity: O(1)
    async health() {
        // Simple heuristic: if the module exists and has methods, it's READY
        if (this.legacyModule && typeof this.legacyModule === 'object') {
            return 'READY';
        }
        return 'OFFLINE';
    }
    // Complexity: O(1)
    async shutdown() {
        // Check if module has cleanup method
        if (typeof this.legacyModule.shutdown === 'function') {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.legacyModule.shutdown();
        }
        if (typeof this.legacyModule.cleanup === 'function') {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.legacyModule.cleanup();
        }
    }
    /**
     * Handle sync events from CrossModuleSyncOrchestrator
     */
    // Complexity: O(N)
    handleSyncEvent(event) {
        console.log(`📡 [${this.id}] Received event: ${event.type} from ${event.source}`);
        // If legacy module has event handler, delegate
        if (typeof this.legacyModule.handleSyncEvent === 'function') {
            this.legacyModule.handleSyncEvent(event);
        }
        // Otherwise, log for awareness
        if (event.type === 'SYSTEM_AWAKENING') {
            console.log(`🌟 [${this.id}] Acknowledged system awakening`);
        }
    }
    /**
     * Health check for orchestrator
     */
    // Complexity: O(1)
    healthCheck() {
        return true;
    }
}
exports.ModuleAdapter = ModuleAdapter;
/**
 * Factory function to create adapters from mega-map.json entries
 */
function createAdapterFromMap(mapEntry, moduleInstance) {
    return new ModuleAdapter(mapEntry.id, moduleInstance, {
        version: '1.0.0',
        primaryMethod: mapEntry.exports?.[0] || undefined
    });
}
