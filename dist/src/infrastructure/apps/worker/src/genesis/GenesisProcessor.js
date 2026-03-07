"use strict";
/**
 * Genesis Test Processor - ТЕСТОВЕ В МАНИФЕСТИРАНА РЕАЛНОСТ
 *
 * "Всеки тест е наблюдение, което може да колапсира реалността"
 *
 * Extends BullMQ processor to execute tests within Genesis-created
 * Docker environments with custom axiom-defined rules.
 *
 * @author Димитър Продромов
 * @copyright 2026 QAntum. All Rights Reserved.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.genesisQueue = void 0;
exports.processGenesisTestJob = processGenesisTestJob;
exports.executeHybridGenesisTest = executeHybridGenesisTest;
exports.startGenesisWorker = startGenesisWorker;
const bullmq_1 = require("bullmq");
const ioredis_1 = __importDefault(require("ioredis"));
const client_1 = require("@prisma/client");
const GenesisRealityProvider_1 = require("../../../../SaaS-master/SaaS-master/brutality-vortex/dpREPO/7/src/modules/BETA_SECURITY/security/auth/energy/GenesisRealityProvider");
const executor_1 = require("../../../../energy/executor");
const GENESIS_PLAN_LIMITS = {
    STARTER: {
        maxRealities: 1,
        maxAxiomsPerReality: 3,
        maxDimensions: 4,
        allowChaos: false,
        allowRetrocausal: false,
        maxParallelObservations: 1,
        realityTimeout: 5,
    },
    PRO: {
        maxRealities: 5,
        maxAxiomsPerReality: 10,
        maxDimensions: 7,
        allowChaos: true,
        allowRetrocausal: false,
        maxParallelObservations: 3,
        realityTimeout: 30,
    },
    TEAM: {
        maxRealities: 20,
        maxAxiomsPerReality: 25,
        maxDimensions: 9,
        allowChaos: true,
        allowRetrocausal: true,
        maxParallelObservations: 10,
        realityTimeout: 60,
    },
    ENTERPRISE: {
        maxRealities: -1, // Unlimited
        maxAxiomsPerReality: -1,
        maxDimensions: 11,
        allowChaos: true,
        allowRetrocausal: true,
        maxParallelObservations: -1,
        realityTimeout: -1, // No timeout
    },
};
// ═══════════════════════════════════════════════════════════════════════════════
// REDIS & PRISMA SETUP
// ═══════════════════════════════════════════════════════════════════════════════
const redis = new ioredis_1.default({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    maxRetriesPerRequest: null,
});
const prisma = new client_1.PrismaClient();
// Genesis-specific queue
const genesisQueue = new bullmq_1.Queue('genesis-tests', { connection: redis });
exports.genesisQueue = genesisQueue;
// ═══════════════════════════════════════════════════════════════════════════════
// GENESIS TEST PROCESSOR
// ═══════════════════════════════════════════════════════════════════════════════
async function processGenesisTestJob(job) {
    const { runId, tenantId, tests, realitySpec, config, tenant } = job.data;
    console.log(`[GenesisProcessor] Starting job ${job.id} for run ${runId}`);
    console.log(`[GenesisProcessor] Reality: ${realitySpec.name}, Tests: ${tests.length}`);
    // ═══════════════════════════════════════════════════════════════════════════
    // STEP 1: Validate plan limits
    // ═══════════════════════════════════════════════════════════════════════════
    const limits = GENESIS_PLAN_LIMITS[tenant.plan] || GENESIS_PLAN_LIMITS.STARTER;
    // Check axiom count
    if (limits.maxAxiomsPerReality !== -1 &&
        realitySpec.axioms.length > limits.maxAxiomsPerReality) {
        throw new Error(`Plan ${tenant.plan} allows max ${limits.maxAxiomsPerReality} axioms, ` +
            `but ${realitySpec.axioms.length} requested`);
    }
    // Check dimensions
    if (realitySpec.dimensions > limits.maxDimensions) {
        throw new Error(`Plan ${tenant.plan} allows max ${limits.maxDimensions} dimensions, ` +
            `but ${realitySpec.dimensions} requested`);
    }
    // Check chaos/retrocausal permissions
    if (realitySpec.entropy > 0.3 && !limits.allowChaos) {
        throw new Error(`Plan ${tenant.plan} does not allow chaos engineering (entropy > 0.3)`);
    }
    // Check active realities
    if (limits.maxRealities !== -1) {
        const activeRealities = GenesisRealityProvider_1.genesisRealityProvider.getActiveRealities(tenantId);
        if (activeRealities.length >= limits.maxRealities) {
            throw new Error(`Plan ${tenant.plan} allows max ${limits.maxRealities} active realities. ` +
                `Collapse existing ones first.`);
        }
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // STEP 2: Update run status
    // ═══════════════════════════════════════════════════════════════════════════
    // SAFETY: async operation — wrap in try-catch for production resilience
    await prisma.testRun.update({
        where: { id: runId },
        data: { status: 'RUNNING', startedAt: new Date() },
    });
    // SAFETY: async operation — wrap in try-catch for production resilience
    await job.updateProgress(5);
    // ═══════════════════════════════════════════════════════════════════════════
    // STEP 3: Manifest Reality
    // ═══════════════════════════════════════════════════════════════════════════
    let manifestation;
    try {
        console.log(`[GenesisProcessor] Manifesting reality: ${realitySpec.name}...`);
        manifestation = await GenesisRealityProvider_1.genesisRealityProvider.manifestReality(realitySpec);
        console.log(`[GenesisProcessor] Reality manifested: ${manifestation.id}`);
        console.log(`[GenesisProcessor] Containers: ${manifestation.containers.length}`);
        await job.updateProgress(20);
    }
    catch (error) {
        console.error(`[GenesisProcessor] Failed to manifest reality:`, error);
        // SAFETY: async operation — wrap in try-catch for production resilience
        await updateRunStatus(runId, 'FAILED', {
            error: `Reality manifestation failed: ${error.message}`,
        });
        throw error;
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // STEP 4: Execute Tests Within Reality
    // ═══════════════════════════════════════════════════════════════════════════
    const results = [];
    let passed = 0;
    let failed = 0;
    let collapsed = 0;
    const parallelism = Math.min(config.parallelism, limits.maxParallelObservations);
    for (let i = 0; i < tests.length; i += parallelism) {
        const batch = tests.slice(i, i + parallelism);
        // SAFETY: async operation — wrap in try-catch for production resilience
        const batchResults = await Promise.all(batch.map(test => executeGenesisTest(manifestation, test, config, realitySpec)));
        for (const result of batchResults) {
            results.push(result);
            if (result.status === 'PASSED')
                passed++;
            else if (result.status === 'FAILED')
                failed++;
            else if (result.status === 'COLLAPSED')
                collapsed++;
            // Store result in database
            // SAFETY: async operation — wrap in try-catch for production resilience
            await prisma.testResult.updateMany({
                where: {
                    runId,
                    testId: result.testId,
                    run: { project: { tenantId } },
                },
                data: {
                    status: result.status === 'COLLAPSED' ? 'SKIPPED' : result.status,
                    duration: result.duration,
                    error: result.error,
                    errorStack: result.errorStack,
                    healingDetails: {
                        genesisReality: manifestation.id,
                        coherence: result.realityState.coherence,
                        entropy: result.realityState.entropy,
                        waveformCollapsed: result.waveformCollapsed,
                        measuredState: result.measuredState,
                    },
                },
            });
            // Update progress
            const progress = 20 + Math.round((results.length / tests.length) * 70);
            // SAFETY: async operation — wrap in try-catch for production resilience
            await job.updateProgress(progress);
        }
        // Check if reality collapsed during batch
        const reality = GenesisRealityProvider_1.genesisRealityProvider.getReality(manifestation.id);
        if (!reality || reality.status === 'COLLAPSED') {
            console.log(`[GenesisProcessor] Reality collapsed during test execution`);
            break;
        }
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // STEP 5: Collapse Reality (if configured)
    // ═══════════════════════════════════════════════════════════════════════════
    if (config.collapseAfterRun) {
        try {
            console.log(`[GenesisProcessor] Collapsing reality ${manifestation.id}...`);
            await GenesisRealityProvider_1.genesisRealityProvider.collapseReality(manifestation.id);
            console.log(`[GenesisProcessor] Reality collapsed`);
        }
        catch (error) {
            console.error(`[GenesisProcessor] Failed to collapse reality:`, error);
        }
    }
    else {
        console.log(`[GenesisProcessor] Reality ${manifestation.id} left active for future observations`);
        // Set auto-collapse timeout for non-enterprise plans
        if (limits.realityTimeout > 0) {
            // Complexity: O(1)
            setTimeout(async () => {
                try {
                    await GenesisRealityProvider_1.genesisRealityProvider.collapseReality(manifestation.id);
                    console.log(`[GenesisProcessor] Reality ${manifestation.id} auto-collapsed after timeout`);
                }
                catch { }
            }, limits.realityTimeout * 60 * 1000);
        }
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // STEP 6: Update Run Completion Status
    // ═══════════════════════════════════════════════════════════════════════════
    const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);
    // SAFETY: async operation — wrap in try-catch for production resilience
    await prisma.testRun.update({
        where: { id: runId },
        data: {
            status: failed > 0 ? 'FAILED' : 'COMPLETED',
            passed,
            failed,
            skipped: collapsed + (tests.length - passed - failed - collapsed),
            duration: totalDuration,
            completedAt: new Date(),
        },
    });
    // SAFETY: async operation — wrap in try-catch for production resilience
    await job.updateProgress(100);
    console.log(`[GenesisProcessor] Run ${runId} completed: ${passed}✓ ${failed}✗ ${collapsed}⚡`);
    return { runId, passed, failed, collapsed };
}
// ═══════════════════════════════════════════════════════════════════════════════
// GENESIS TEST EXECUTION
// ═══════════════════════════════════════════════════════════════════════════════
async function executeGenesisTest(manifestation, test, config, realitySpec) {
    const startTime = Date.now();
    try {
        // Determine target service from axiom
        let targetService = 'api'; // default
        if (test.targetAxiom) {
            const axiom = realitySpec.axioms.find(a => a.id === test.targetAxiom);
            if (axiom) {
                targetService = `axiom-${axiom.type.toLowerCase()}-${axiom.id.slice(0, 8)}`;
            }
        }
        // Execute observation
        const observation = await GenesisRealityProvider_1.genesisRealityProvider.observeReality({
            realityId: manifestation.id,
            observerId: test.id,
            testCode: test.code,
            targetService,
            timeout: test.timeout,
            collapseOnObservation: test.expectWaveformCollapse,
        });
        if (observation.waveformCollapsed) {
            return {
                testId: test.id,
                status: 'COLLAPSED',
                duration: observation.duration,
                realityState: {
                    coherence: realitySpec.coherence,
                    entropy: realitySpec.entropy,
                    observerCount: 0,
                },
                waveformCollapsed: true,
                measuredState: observation.measuredState,
            };
        }
        return {
            testId: test.id,
            status: observation.success ? 'PASSED' : 'FAILED',
            duration: observation.duration,
            error: observation.error,
            realityState: {
                coherence: realitySpec.coherence,
                entropy: realitySpec.entropy,
                observerCount: manifestation.observerCount,
            },
            waveformCollapsed: false,
            measuredState: observation.measuredState,
        };
    }
    catch (error) {
        return {
            testId: test.id,
            status: 'FAILED',
            duration: Date.now() - startTime,
            error: error.message,
            errorStack: error.stack,
            realityState: {
                coherence: realitySpec.coherence,
                entropy: realitySpec.entropy,
                observerCount: manifestation.observerCount,
            },
            waveformCollapsed: false,
        };
    }
}
// ═══════════════════════════════════════════════════════════════════════════════
// HYBRID EXECUTION - Genesis + Ghost Protocol
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * Execute browser tests within a Genesis reality
 * Combines Ghost Protocol anti-detection with Genesis environment isolation
 */
async function executeHybridGenesisTest(manifestation, test, config) {
    const startTime = Date.now();
    try {
        // Find web service in reality
        const webContainer = manifestation.containers.find(c => c.name.includes('web') || c.name.includes('proxy'));
        if (!webContainer) {
            throw new Error('No web service found in reality');
        }
        // Determine base URL from container ports
        const webPort = webContainer.ports.find(p => p.includes('80'))?.split(':')[0] || '80';
        const baseUrl = config.baseUrl || `http://localhost:${webPort}`;
        // Initialize Ghost Executor
        const context = await executor_1.ghostExecutor.initDriver({
            browser: config.browser,
            headless: true,
            tenantId: manifestation.tenantId,
            sessionId: `genesis-${manifestation.id}-${test.id}`,
        });
        try {
            // Inject Genesis context into test code
            const enhancedTestCode = `
        // Genesis Reality Context
        const GENESIS = {
          realityId: '${manifestation.id}',
          coherence: ${manifestation.status === 'STABLE' ? 0.95 : 0.5},
          containers: ${JSON.stringify(manifestation.containers.map(c => c.name))},
          baseUrl: '${baseUrl}'
        };

        // Navigate to reality's web service
        await driver.get(GENESIS.baseUrl);

        // Execute original test
        ${test.code}
      `;
            // SAFETY: async operation — wrap in try-catch for production resilience
            const result = await executor_1.ghostExecutor.executeTest(context.sessionId, enhancedTestCode, test.timeout);
            return {
                testId: test.id,
                status: result.success ? 'PASSED' : 'FAILED',
                duration: result.duration,
                error: result.error,
                realityState: {
                    coherence: manifestation.status === 'STABLE' ? 0.95 : 0.5,
                    entropy: 0.1,
                    observerCount: 1,
                },
                waveformCollapsed: false,
                measuredState: { baseUrl, browser: config.browser },
            };
        }
        finally {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await executor_1.ghostExecutor.cleanup(context.sessionId);
        }
    }
    catch (error) {
        return {
            testId: test.id,
            status: 'FAILED',
            duration: Date.now() - startTime,
            error: error.message,
            errorStack: error.stack,
            realityState: {
                coherence: 0,
                entropy: 1,
                observerCount: 0,
            },
            waveformCollapsed: false,
        };
    }
}
// ═══════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════
async function updateRunStatus(runId, status, extra = {}) {
    // SAFETY: async operation — wrap in try-catch for production resilience
    await prisma.testRun.update({
        where: { id: runId },
        data: {
            status,
            ...extra,
            completedAt: new Date(),
        },
    });
}
// ═══════════════════════════════════════════════════════════════════════════════
// WORKER SETUP
// ═══════════════════════════════════════════════════════════════════════════════
function startGenesisWorker() {
    const worker = new bullmq_1.Worker('genesis-tests', processGenesisTestJob, {
        connection: redis,
        concurrency: parseInt(process.env.GENESIS_WORKER_CONCURRENCY || '2'),
    });
    worker.on('completed', (job, result) => {
        console.log(`[GenesisWorker] Job ${job.id} completed:`, result);
    });
    worker.on('failed', (job, error) => {
        console.error(`[GenesisWorker] Job ${job?.id} failed:`, error);
    });
    worker.on('error', (error) => {
        console.error('[GenesisWorker] Worker error:', error);
    });
    console.log('[GenesisWorker] Started and listening for jobs...');
    return worker;
}
