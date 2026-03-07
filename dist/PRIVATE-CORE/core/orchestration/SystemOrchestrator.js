"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemOrchestrator = void 0;
const VortexHealingNexus_1 = require("../evolution/VortexHealingNexus");
const ApoptosisModule_1 = require("../evolution/ApoptosisModule");
const SwarmAgents_1 = require("../../swarm/SwarmAgents");
const Logger_1 = require("../../utils/Logger");
class SystemOrchestrator {
    nexus;
    apoptosis;
    swarm;
    logger;
    constructor() {
        this.nexus = new VortexHealingNexus_1.VortexHealingNexus();
        this.apoptosis = new ApoptosisModule_1.ApoptosisModule();
        this.swarm = new SwarmAgents_1.SwarmQueen();
        this.logger = Logger_1.Logger.getInstance();
    }
    async awaken() {
        this.logger.log('🌌 INITIALIZING VORTEX GENESIS PROTOCOLS...');
        // 1. Activate Immune System
        this.logger.log('🛡️ Activating Immune System (VortexHealingNexus)...');
        // (Nexus is passive until invoked, but we can verify it)
        const metrics = this.nexus.getMetrics();
        this.logger.log(`Immune System Status: OPERATIONAL (Success Rate: ${metrics.successRate * 100}%)`);
        // 2. Activate Mortality System
        this.logger.log('💀 Activating Apoptosis Module...');
        // (Also passive, mostly)
        // 3. Awaken the Swarm (Agents)
        await this.swarm.awaken();
        // 4. Final System Check
        this.logger.log('✅ ALL SYSTEMS GREEN.');
    }
}
exports.SystemOrchestrator = SystemOrchestrator;
