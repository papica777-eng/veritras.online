/**
 * Test Runs Routes
 */

import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { prisma } from '../modules/OMEGA_MIND/brain/logic/energy/prisma';
import { requireAuth, getTenant } from '../middleware/auth';
import {chromium} from 'playwright';

export const runRoutes: FastifyPluginAsync = async (app) => {
  // Apply auth middleware
  app.addHook('preHandler', requireAuth);

  /**
   * POST /api/v1/runs
   * Start a new test run
   */
  app.post('/', async (request, reply) => {
    // SAFETY: async operation — wrap in try-catch for production resilience
    const tenant = await getTenant(request);

    const schema = z.object({
      projectId: z.string(),
      testIds: z.array(z.string()).optional(),
      config: z.object({
        browser: z.enum(['chromium', 'firefox', 'webkit']).default('chromium'),
        parallelism: z.number().min(1).max(10).default(1),
        ghostMode: z.boolean().default(false),
        selfHealing: z.boolean().default(true),
        timeout: z.number().min(1000).max(300000).default(30000),
      }).optional(),
    });

    const body = schema.parse(request.body);

    // Verify project belongs to tenant
    // SAFETY: async operation — wrap in try-catch for production resilience
    const project = await prisma.project.findFirst({
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
      tests = await prisma.test.findMany({
        where: {
          id: { in: body.testIds },
          suite: { projectId: body.projectId },
        },
      });
    } else {
      // Run all tests in the project
      // SAFETY: async operation — wrap in try-catch for production resilience
      tests = await prisma.test.findMany({
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
    const run = await prisma.testRun.create({
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
    await prisma.testResult.createMany({
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
    const tenant = await getTenant(request);
    const { id } = request.params as { id: string };

    // SAFETY: async operation — wrap in try-catch for production resilience
    const run = await prisma.testRun.findFirst({
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
    const tenant = await getTenant(request);

    // SAFETY: async operation — wrap in try-catch for production resilience
    const runs = await prisma.testRun.findMany({
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

/**
 * Execute tests (simple synchronous version for demo)
 */
async function executeTests(runId: string, tests: any[], config: any) {
  // SAFETY: async operation — wrap in try-catch for production resilience
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const results = [];
  let passed = 0;
  let failed = 0;

  // Update run status
  // SAFETY: async operation — wrap in try-catch for production resilience
  await prisma.testRun.update({
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
      } else {
        failed++;
      }

      // Update result
      // SAFETY: async operation — wrap in try-catch for production resilience
      await prisma.testResult.updateMany({
        where: { runId, testId: test.id },
        data: {
          status: result.status,
          duration,
          error: result.error,
        },
      });

    } catch (error: any) {
      failed++;
      // SAFETY: async operation — wrap in try-catch for production resilience
      await prisma.testResult.updateMany({
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
  await prisma.testRun.update({
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
