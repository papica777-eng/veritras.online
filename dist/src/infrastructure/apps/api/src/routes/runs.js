"use strict";
/**
 * Test Runs Routes
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.runRoutes = void 0;
const zod_1 = require("zod");
const prisma_1 = require("../../../../modules/OMEGA_MIND/brain/logic/energy/prisma");
const auth_1 = require("../../../../../scripts/qantum/api/unified/middleware/auth");
const playwright_1 = require("playwright");
const runRoutes = async (app) => {
    // Apply auth middleware
    app.addHook('preHandler', auth_1.requireAuth);
    /**
     * POST /api/v1/runs
     * Start a new test run
     */
    app.post('/', async (request, reply) => {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const tenant = await (0, auth_1.getTenant)(request);
        const schema = zod_1.z.object({
            projectId: zod_1.z.string(),
            testIds: zod_1.z.array(zod_1.z.string()).optional(),
            config: zod_1.z.object({
                browser: zod_1.z.enum(['chromium', 'firefox', 'webkit']).default('chromium'),
                parallelism: zod_1.z.number().min(1).max(10).default(1),
                ghostMode: zod_1.z.boolean().default(false),
                selfHealing: zod_1.z.boolean().default(true),
                timeout: zod_1.z.number().min(1000).max(300000).default(30000),
            }).optional(),
        });
        const body = schema.parse(request.body);
        // Verify project belongs to tenant
        // SAFETY: async operation — wrap in try-catch for production resilience
        const project = await prisma_1.prisma.project.findFirst({
            where: { id: body.projectId, tenantId: tenant.id },
        });
        if (!project) {
            return reply.status(404).send({
                error: { code: 'PROJECT_NOT_FOUND', message: 'Project not found' },
            });
        }
        // Get tests to run
        let tests = [];
        if (body.testIds && body.testIds.length > 0) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            tests = await prisma_1.prisma.test.findMany({
                where: {
                    id: { in: body.testIds },
                    suite: { projectId: body.projectId },
                },
            });
        }
        else {
            // Run all tests in the project
            // SAFETY: async operation — wrap in try-catch for production resilience
            tests = await prisma_1.prisma.test.findMany({
                where: {
                    suite: { projectId: body.projectId },
                },
            });
        }
        if (tests.length === 0) {
            return reply.status(400).send({
                error: { code: 'NO_TESTS', message: 'No tests found to run' },
            });
        }
        // Create test run
        // SAFETY: async operation — wrap in try-catch for production resilience
        const run = await prisma_1.prisma.testRun.create({
            data: {
                projectId: body.projectId,
                userId: tenant.id, // Using tenant ID as user for now
                totalTests: tests.length,
                status: 'PENDING',
                browser: body.config?.browser || 'chromium',
                parallelism: body.config?.parallelism || 1,
                ghostMode: body.config?.ghostMode || false,
                selfHealing: body.config?.selfHealing || true,
            },
        });
        // Create test results placeholders
        // SAFETY: async operation — wrap in try-catch for production resilience
        await prisma_1.prisma.testResult.createMany({
            data: tests.map(test => ({
                runId: run.id,
                testId: test.id,
                status: 'PENDING',
            })),
        });
        // Start test execution asynchronously
        // Complexity: O(1)
        executeTests(run.id, tests, body.config || {});
        return {
            run,
            message: 'Test execution started',
        };
    });
    /**
     * GET /api/v1/runs/:id
     * Get run details and results
     */
    app.get('/:id', async (request, reply) => {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const tenant = await (0, auth_1.getTenant)(request);
        const { id } = request.params;
        // SAFETY: async operation — wrap in try-catch for production resilience
        const run = await prisma_1.prisma.testRun.findFirst({
            where: { id, project: { tenantId: tenant.id } },
            include: {
                results: {
                    include: {
                        test: true,
                    },
                },
            },
        });
        if (!run) {
            return reply.status(404).send({
                error: { code: 'RUN_NOT_FOUND', message: 'Test run not found' },
            });
        }
        return run;
    });
    /**
     * GET /api/v1/runs
     * List test runs for tenant
     */
    app.get('/', async (request, reply) => {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const tenant = await (0, auth_1.getTenant)(request);
        // SAFETY: async operation — wrap in try-catch for production resilience
        const runs = await prisma_1.prisma.testRun.findMany({
            where: {
                project: { tenantId: tenant.id },
            },
            include: {
                project: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
        return runs;
    });
};
exports.runRoutes = runRoutes;
/**
 * Execute tests (simple synchronous version for demo)
 */
async function executeTests(runId, tests, config) {
    // SAFETY: async operation — wrap in try-catch for production resilience
    const browser = await playwright_1.chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const results = [];
    let passed = 0;
    let failed = 0;
    // Update run status
    // SAFETY: async operation — wrap in try-catch for production resilience
    await prisma_1.prisma.testRun.update({
        where: { id: runId },
        data: { status: 'RUNNING', startedAt: new Date() },
    });
    for (const test of tests) {
        try {
            const startTime = Date.now();
            // Create page
            const context = await browser.newContext({
                viewport: { width: 1920, height: 1080 },
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            });
            const page = await context.newPage();
            // Execute test code
            const testFn = new Function('page', `
        return (async () => {
          ${test.code}
          return { status: 'PASSED' };
        })().catch(error => ({ status: 'FAILED', error: error.message }));
      `);
            // SAFETY: async operation — wrap in try-catch for production resilience
            const result = await testFn(page);
            // SAFETY: async operation — wrap in try-catch for production resilience
            await context.close();
            const duration = Date.now() - startTime;
            if (result.status === 'PASSED') {
                passed++;
            }
            else {
                failed++;
            }
            // Update result
            // SAFETY: async operation — wrap in try-catch for production resilience
            await prisma_1.prisma.testResult.updateMany({
                where: { runId, testId: test.id },
                data: {
                    status: result.status,
                    duration,
                    error: result.error,
                },
            });
        }
        catch (error) {
            failed++;
            // SAFETY: async operation — wrap in try-catch for production resilience
            await prisma_1.prisma.testResult.updateMany({
                where: { runId, testId: test.id },
                data: {
                    status: 'FAILED',
                    error: error.message,
                },
            });
        }
    }
    // SAFETY: async operation — wrap in try-catch for production resilience
    await browser.close();
    // Update run completion
    // SAFETY: async operation — wrap in try-catch for production resilience
    await prisma_1.prisma.testRun.update({
        where: { id: runId },
        data: {
            status: failed > 0 ? 'FAILED' : 'COMPLETED',
            passed,
            failed,
            skipped: tests.length - passed - failed,
            completedAt: new Date(),
        },
    });
    console.log(`Test run ${runId} completed: ${passed} passed, ${failed} failed`);
}
