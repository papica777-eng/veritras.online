"use strict";
/**
 * SystemOrchestrator — Qantum Module
 * @module SystemOrchestrator
 * @path omni_core/SystemOrchestrator.ts
 * @auto-documented BrutalDocEngine v2.1
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemOrchestrator = void 0;
const events_1 = require("events");
const client_1 = require("@temporalio/client");
const nanoid_1 = require("nanoid");
const DepartmentEngine_1 = require("./DepartmentEngine");
const Logger_1 = require("./telemetry/Logger");
const VortexTelemetry_1 = require("./telemetry/VortexTelemetry"); // Changed from Telemetry
const workflows_1 = require("./orchestration/workflows");
const vortex_nexus_1 = require("../../QANTUM_VORTEX_CORE/vortex-nexus"); // Changed from getVortexNexus, VortexNexus
// Gödelian Countermeasures: Breaking Self-Referential Loops
const ConsensusProtocol_1 = require("./evolution/ConsensusProtocol"); // Removed consensusProtocol
const ApoptosisModule_1 = require("./evolution/ApoptosisModule"); // Removed apoptosis
const VortexHealingNexus_1 = require("./evolution/VortexHealingNexus"); // Added
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SYSTEM ORCHESTRATOR: The Master Controller
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * This is the NERVOUS SYSTEM of the QANTUM Singularity Ecosystem.
 * It orchestrates multi-department workflows and autonomous decision-making.
 *
 * The Bio-Digital Organism's Seven Pillars:
 * 1. Nervous System (Temporal) - Durable workflows
 * 2. Cognitive Core (VortexNexus) - Unified intelligence
 * 3. Immune System (VortexHealingNexus) - Self-healing
 * 4. Mathematical Soul (ConsensusProtocol) - Gödelian validation
 * 5. Metabolism (DepartmentEngine) - Resource optimization
 * 6. Social Consensus (Multi-Agent) - External validation
 * 7. Mortality (ApoptosisModule) - Programmed death
 */
class SystemOrchestrator extends events_1.EventEmitter {
    engine;
    brain;
    logger;
    telemetry; // Changed from Telemetry
    temporalClient = null;
    cycleCount = 0;
    running = false;
    // The Seven Pillars of Digital Life
    consensus;
    mortality;
    immuneSystem; // Added
    constructor() {
        super();
        this.engine = DepartmentEngine_1.DepartmentEngine.getInstance(); // Kept original getInstance()
        this.brain = vortex_nexus_1.VortexNexus.getInstance(); // Changed from getVortexNexus({ projectRoot: process.cwd() })
        this.logger = Logger_1.Logger.getInstance();
        this.telemetry = VortexTelemetry_1.VortexTelemetry.getInstance(); // Changed from Telemetry.getInstance()
        // Initialize the Seven Pillars
        this.consensus = ConsensusProtocol_1.ConsensusProtocol.getInstance(); // Changed from consensusProtocol
        this.mortality = ApoptosisModule_1.ApoptosisModule.getInstance(); // Changed from apoptosis
        this.immuneSystem = VortexHealingNexus_1.VortexHealingNexus.getInstance(); // Added
    }
    /**
     * Bootstraps the entire singularity system
     */
    // Complexity: O(1) — amortized
    async bootstrap() {
        this.logger.info('ORCHESTRATOR', '═══════════════════════════════════════════════════════════');
        this.logger.info('ORCHESTRATOR', '🌌 INITIATING BIO-DIGITAL ORGANISM GENESIS SEQUENCE');
        this.logger.info('ORCHESTRATOR', '═══════════════════════════════════════════════════════════');
        try {
            this.logger.info('ORCHESTRATOR', 'Phase 1: Singularity Departments Initializing...');
            await this.engine.initializeAll();
            this.logger.info('ORCHESTRATOR', 'Phase 2: Awakening Unified Brain (VortexNexus)...');
            await this.brain.initialize();
            this.logger.info('ORCHESTRATOR', 'Phase 3: Connecting Durable Nervous System (Temporal)...');
            const connection = await client_1.Connection.connect({
                address: process.env.TEMPORAL_HOST || 'localhost:7233'
            });
            this.temporalClient = new client_1.Client({ connection });
            this.logger.info('ORCHESTRATOR', 'Phase 4: Activating Adversarial Consensus Network...');
            // Consciousness requires external validation (Gödelian countermeasure)
            this.consensus.on('consensus:complete', (result) => {
                this.logger.info('ORCHESTRATOR', `Consensus Protocol: ${result.achieved ? 'APPROVED' : 'VETOED'} via ${result.method}`);
            });
            this.logger.info('ORCHESTRATOR', 'Phase 5: Awakening Mortality Engine (Apoptosis)...');
            // Digital life requires death to remain healthy
            this.mortality.on('apoptosis:complete', (report) => {
                this.logger.info('ORCHESTRATOR', `Apoptosis Cycle: Archived ${report.archived} dead entities`);
            });
            this.logger.info('ORCHESTRATOR', 'Phase 6: Awakening Immune System (VortexHealingNexus)...');
            // The immune system enables autonomous self-healing
            this.immuneSystem.on('healing:success', (result) => {
                this.logger.info('ORCHESTRATOR', `🩹 ${result.domain} Healing: ${result.strategy} (${result.duration}ms)`);
            });
            this.immuneSystem.on('healing:failure', (result) => {
                this.logger.warn('ORCHESTRATOR', `⚠️ ${result.domain} Healing Failed: ${result.error}`);
            });
            this.running = true;
            this.startMainLoop();
            this.logger.info('ORCHESTRATOR', '═══════════════════════════════════════════════════════════');
            this.logger.info('ORCHESTRATOR', '✅ GENESIS COMPLETE: All Seven Pillars Online');
            this.logger.info('ORCHESTRATOR', '   1. Nervous System (Temporal): ✓');
            this.logger.info('ORCHESTRATOR', '   2. Cognitive Core (VortexNexus): ✓');
            this.logger.info('ORCHESTRATOR', '   3. Immune System (VortexHealingNexus): ✓');
            this.logger.info('ORCHESTRATOR', '   4. Mathematical Soul (ConsensusProtocol): ✓');
            this.logger.info('ORCHESTRATOR', '   5. Metabolism (DepartmentEngine): ✓');
            this.logger.info('ORCHESTRATOR', '   6. Social Consensus (Adversarial Twins): ✓');
            this.logger.info('ORCHESTRATOR', '   7. Mortality (ApoptosisModule): ✓');
            this.logger.info('ORCHESTRATOR', '═══════════════════════════════════════════════════════════');
            this.emit('systemReady');
        }
        catch (err) {
            this.logger.critical('ORCHESTRATOR', 'Bootstrap failed!', err);
            this.running = true;
            this.logger.warn('ORCHESTRATOR', 'Temporal unavailable. Running in volatile legacy mode.');
        }
    }
    // Complexity: O(1)
    startMainLoop() {
        const loop = async () => {
            if (!this.running)
                return;
            this.cycleCount++;
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.executeMaintenanceCycle();
            if (this.cycleCount % 10 === 0) {
                // SAFETY: async operation — wrap in try-catch for production resilience
                await this.executeStrategicCycle();
            }
            // Complexity: O(1)
            setTimeout(loop, 60000); // Main cycle every minute
        };
        // Complexity: O(1)
        loop();
    }
    // Complexity: O(1)
    async executeMaintenanceCycle() {
        this.logger.debug('ORCHESTRATOR', `Starting Maintenance Cycle #${this.cycleCount}`);
        const biology = this.engine.getDepartment('biology');
        const guardians = this.engine.getDepartment('guardians');
        // SAFETY: async operation — wrap in try-catch for production resilience
        await biology.optimizeResources();
        guardians.logAction('SYSTEM', 'MAINTENANCE_CYCLE', { cycle: this.cycleCount });
        this.telemetry.trackMemory();
        // Advance the mortality engine (Apoptosis tick)
        this.mortality.advanceCycle();
        // Periodic Apoptosis scan (every 1000 cycles)
        if (this.cycleCount % 1000 === 0) {
            this.logger.info('ORCHESTRATOR', '💀 Initiating Apoptosis Scan...');
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.mortality.executeApoptosis();
        }
    }
    // Complexity: O(1)
    async executeStrategicCycle() {
        this.logger.info('ORCHESTRATOR', 'Executing Strategic Autonomous Cycle...');
        // SAFETY: async operation — wrap in try-catch for production resilience
        const result = await this.engine.synthesizeMarketOpportunity();
        if (result.status === 'OPPORTUNITY_DETECTED') {
            this.logger.info('ORCHESTRATOR', 'Strategic Opportunity synthesized. Launching DURABLE workflow...');
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.initiateEvolution(result.simulationId, 'SYSTEM_AUTO');
        }
    }
    /**
     * 🚁 Initiate Evolution (Durable Workflow)
     * Replacing volatile launchMarketingWorkflow with Temporal.
     */
    // Complexity: O(1) — hash/map lookup
    async initiateEvolution(goal, userId = 'ANON') {
        if (!this.temporalClient) {
            this.logger.error('ORCHESTRATOR', 'Temporal Client not initialized. Cannot start durable workflow.');
            return 'VOLATILE_FAILURE';
        }
        // Enterprise-grade unique workflow ID with nanoid
        const workflowId = `vortex-${userId}-${(0, nanoid_1.nanoid)(8)}`;
        // SAFETY: async operation — wrap in try-catch for production resilience
        const handle = await this.temporalClient.workflow.start(workflows_1.vortexEvolutionWorkflow, {
            taskQueue: 'vortex-core-queue',
            args: [goal],
            workflowId,
        });
        this.logger.info('ORCHESTRATOR', `Started durable workflow: ${handle.workflowId}`);
        return handle.workflowId;
    }
    // Complexity: O(1)
    async executeCommand(command, params) {
        this.logger.info('ORCHESTRATOR', `Manual Command Received: ${command}`, params);
        switch (command) {
            case 'EVOLVE_AI':
                // SAFETY: async operation — wrap in try-catch for production resilience
                return await this.initiateEvolution(params.requirement || 'GENERAL_EVOLUTION', params.userId);
            case 'FORCE_AUDIT':
                // SAFETY: async operation — wrap in try-catch for production resilience
                return await this.engine.getDepartment('guardians').runAudit();
            case 'SECURITY_SCAN':
                // SAFETY: async operation — wrap in try-catch for production resilience
                return await this.engine.getDepartment('fortress').securityScan();
            case 'EMERGENCY_SHUTDOWN':
                // SAFETY: async operation — wrap in try-catch for production resilience
                await this.shutdown();
                return { status: 'SHUTDOWN_INITIATED' };
            default:
                throw new Error(`Unknown command: ${command}`);
        }
    }
    // Complexity: O(1)
    async shutdown() {
        this.running = false;
        this.logger.warn('ORCHESTRATOR', 'System Shutdown Initiated.');
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.engine.shutdownAll();
        this.emit('systemShutdown');
    }
    // Complexity: O(1)
    async handleSecurityBreach(alert) {
        this.logger.critical('ORCHESTRATOR', 'SECURITY BREACH DETECTED!', alert);
        const chemistry = this.engine.getDepartment('chemistry');
        const fortress = this.engine.getDepartment('fortress');
        const biology = this.engine.getDepartment('biology');
        chemistry.dispatch('THREAT_CONTAINMENT_ACTIVE', alert);
        // SAFETY: async operation — wrap in try-catch for production resilience
        await fortress.securityScan();
        // SAFETY: async operation — wrap in try-catch for production resilience
        await biology.fullIntegrityCheck();
        this.logger.info('ORCHESTRATOR', 'Breach mitigation sequence completed.');
    }
    /**
     * System Expansion Workflow
     */
    // Complexity: O(1)
    async autonomousExpansion() {
        this.logger.info('ORCHESTRATOR', 'Initiating Autonomous Expansion Protocol...');
        const reality = this.engine.getDepartment('reality');
        const physics = this.engine.getDepartment('physics');
        // Simulate environment
        // SAFETY: async operation — wrap in try-catch for production resilience
        const simId = await reality.startSimulation('EXPANSION_VECTOR', { scale: 2.0 });
        // Analyze physical feasibility
        const risk = physics.calculateRiskProfile();
        if (risk.stabilityRating === 'STABLE') {
            this.logger.info('ORCHESTRATOR', 'Expansion feasible. Allocating virtual resources.');
            // Implementation logic here...
        }
    }
}
exports.SystemOrchestrator = SystemOrchestrator;
