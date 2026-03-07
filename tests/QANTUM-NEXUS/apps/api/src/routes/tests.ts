/**
 * Test Execution Routes
 */

import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireAuth, getTenant } from '../middleware/auth.js';
import { checkTestExecution, EntitlementContext } from '../middleware/entitlement.js';

// Validation schemas
const runTestsSchema = z.object({
  projectId: z.string(),
  testIds: z.array(z.string()).optional(),
  suiteId: z.string().optional(),
  config: z.object({
    browser: z.enum(['chromium', 'firefox', 'webkit']).default('chromium'),
    parallelism: z.number().min(1).max(10).default(1),
    ghostMode: z.boolean().default(false),
    selfHealing: z.boolean().default(true),
    timeout: z.number().default(30000),
  }).optional(),
  metadata: z.object({
    commitSha: z.string().optional(),
    branch: z.string().optional(),
    triggeredBy: z.enum(['manual', 'ci', 'schedule']).default('manual'),
  }).optional(),
});

export const testRoutes: FastifyPluginAsync = async (app) => {
  // Apply auth middleware
  app.addHook('preHandler', requireAuth);

  /**
   * POST /api/v1/tests/run
   * Execute tests with entitlement checks
   */
  app.post('/run', { preHandler: [checkTestExecution] }, async (request, reply) => {
    const tenant = await getTenant(request);
    const entitlements = (request as any).entitlements as EntitlementContext;
    const body = runTestsSchema.parse(request.body);
    
    // Entitlement checks already done by middleware
    // Additional usage check with real-time count
    if (entitlements.usage.remaining <= 0 && entitlements.tenant.testsLimit !== -1) {
      return reply.status(402).send({
        error: {
          code: 'USAGE_LIMIT_EXCEEDED',
          message: `Monthly test limit (${entitlements.tenant.testsLimit}) exceeded. Please upgrade your plan.`,
          usage: entitlements.usage,
          upgradeUrl: '/billing/upgrade',
        },
      });
    }
    
    // Get tests to run
    let tests;
    if (body.testIds?.length) {
      tests = await prisma.test.findMany({
        where: {
          id: { in: body.testIds },
          suite: { project: { tenantId: tenant.id } },
        },
      });
    } else if (body.suiteId) {
      tests = await prisma.test.findMany({
        where: {
          suiteId: body.suiteId,
          suite: { project: { tenantId: tenant.id } },
        },
      });
    } else {
      // Run all tests in project
      tests = await prisma.test.findMany({
        where: {
          suite: {
            project: {
              id: body.projectId,
              tenantId: tenant.id,
            },
          },
        },
      });
    }
    
    if (tests.length === 0) {
      return reply.status(400).send({
        error: {
          code: 'NO_TESTS_FOUND',
          message: 'No tests found to run',
        },
      });
    }
    
    // Create test run
    const run = await prisma.testRun.create({
      data: {
        projectId: body.projectId,
        userId: request.auth.userId,
        totalTests: tests.length,
        browser: body.config?.browser?.toUpperCase() as 'CHROMIUM' | 'FIREFOX' | 'WEBKIT' || 'CHROMIUM',
        parallelism: body.config?.parallelism || 1,
        ghostMode: body.config?.ghostMode || false,
        selfHealing: body.config?.selfHealing ?? true,
        commitSha: body.metadata?.commitSha,
        branch: body.metadata?.branch,
        triggeredBy: body.metadata?.triggeredBy,
        results: {
          create: tests.map((test) => ({
            testId: test.id,
            status: 'PENDING',
          })),
        },
      },
      include: {
        results: true,
      },
    });
    
    // Queue the job
    await app.testQueue.add('execute', {
      runId: run.id,
      tenantId: tenant.id,
      tests: tests.map((t) => ({
        id: t.id,
        code: t.code,
        timeout: t.timeout,
        ghostMode: t.ghostMode || body.config?.ghostMode,
        selfHealing: t.selfHealing ?? body.config?.selfHealing,
      })),
      config: {
        browser: body.config?.browser || 'chromium',
        parallelism: body.config?.parallelism || 1,
      },
    }, {
      priority: tenant.plan === 'ENTERPRISE' ? 1 : tenant.plan === 'TEAM' ? 2 : 3,
    });
    
    // Update usage
    await prisma.tenant.update({
      where: { id: tenant.id },
      data: { testsUsed: { increment: tests.length } },
    });
    
    return {
      runId: run.id,
      status: 'PENDING',
      totalTests: tests.length,
      estimatedDuration: tests.length * 10, // seconds estimate
      dashboardUrl: `${process.env.DASHBOARD_URL}/runs/${run.id}`,
    };
  });

  /**
   * GET /api/v1/tests/:testId
   * Get test details
   */
  app.get('/:testId', async (request, reply) => {
    const tenant = await getTenant(request);
    const { testId } = request.params as { testId: string };
    
    const test = await prisma.test.findFirst({
      where: {
        id: testId,
        suite: { project: { tenantId: tenant.id } },
      },
      include: {
        suite: {
          include: { project: true },
        },
        results: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    
    if (!test) {
      return reply.status(404).send({
        error: { code: 'NOT_FOUND', message: 'Test not found' },
      });
    }
    
    return test;
  });

  /**
   * POST /api/v1/tests
   * Create new test
   */
  app.post('/', async (request, reply) => {
    const tenant = await getTenant(request);
    
    const schema = z.object({
      name: z.string().min(1).max(255),
      description: z.string().optional(),
      code: z.string().min(1),
      suiteId: z.string(),
      timeout: z.number().default(30000),
      retries: z.number().default(2),
      ghostMode: z.boolean().default(false),
      selfHealing: z.boolean().default(true),
    });
    
    const body = schema.parse(request.body);
    
    // Verify suite belongs to tenant
    const suite = await prisma.testSuite.findFirst({
      where: {
        id: body.suiteId,
        project: { tenantId: tenant.id },
      },
    });
    
    if (!suite) {
      return reply.status(404).send({
        error: { code: 'SUITE_NOT_FOUND', message: 'Test suite not found' },
      });
    }
    
    const test = await prisma.test.create({
      data: body,
    });
    
    return { test };
  });

  /**
   * DELETE /api/v1/tests/:testId
   * Delete test
   */
  app.delete('/:testId', async (request, reply) => {
    const tenant = await getTenant(request);
    const { testId } = request.params as { testId: string };
    
    const test = await prisma.test.findFirst({
      where: {
        id: testId,
        suite: { project: { tenantId: tenant.id } },
      },
    });
    
    if (!test) {
      return reply.status(404).send({
        error: { code: 'NOT_FOUND', message: 'Test not found' },
      });
    }
    
    await prisma.test.delete({ where: { id: testId } });
    
    return { success: true };
  });
};
