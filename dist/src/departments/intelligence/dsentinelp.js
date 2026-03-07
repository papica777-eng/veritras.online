"use strict";
/**
 * dsentinelp — Qantum Module
 * @module dsentinelp
 * @path src/departments/intelligence/dsentinelp.ts
 * @auto-documented BrutalDocEngine v2.1
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.dSENTINELp = void 0;
const ghost_recon_1 = require("../modules/hydrated/ghost-recon");
const event_bus_1 = require("../core/event-bus");
const entropy_harvester_1 = require("./entropy-harvester");
const pattern_engine_1 = require("./pattern-engine");
/**
 * @class dSENTINELp
 * @description Background worker for continuous network observation and mesh hydration.
 * The Sentinel ensures the Neural Mesh is always refreshed with live environmental data.
 */
class dSENTINELp {
    recon;
    harvester;
    patternEngine;
    bus;
    interval = null;
    constructor() {
        this.recon = new ghost_recon_1.GhostRecon();
        this.harvester = new entropy_harvester_1.EntropyHarvester();
        this.patternEngine = new pattern_engine_1.PatternEngine();
        this.bus = event_bus_1.EventBus.getInstance();
    }
    /**
     * Starts the continuous observation loop.
     * @param frequency Frequency in milliseconds (default: 60s)
     */
    // Complexity: O(1) — hash/map lookup
    watch(frequency = 60000) {
        console.log(`[\x1b[35mSENTINEL\x1b[0m] Watchdog initialized. Frequency: ${frequency}ms`);
        // Immediate check
        this.cycle().catch(console.error);
        this.interval = setInterval(async () => {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.cycle();
        }, frequency);
    }
    // Complexity: O(1) — hash/map lookup
    async cycle() {
        try {
            // 1. Refresh Sensory Data
            await this.recon.executeRecon();
            // 2. Harvest Entropy (Silent Accumulation)
            await this.harvester.harvest();
            // 3. Analyze Patterns (The Hunt)
            await this.patternEngine.analyze();
            // 4. Notify System
            await this.bus.emit('dSENTINELp_UPDATE', { timestamp: Date.now(), status: 'SYNCED' });
        }
        catch (error) {
            console.error('[\x1b[31mdSENTINELp_ERROR\x1b[0m]', error);
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.bus.emit('dSENTINELp_ERROR', { error: String(error) });
        }
    }
    // Complexity: O(1) — hash/map lookup
    halt() {
        if (this.interval)
            clearInterval(this.interval);
        console.log('[\x1b[35mSENTINEL\x1b[0m] Watchdog halted.');
    }
}
exports.dSENTINELp = dSENTINELp;
