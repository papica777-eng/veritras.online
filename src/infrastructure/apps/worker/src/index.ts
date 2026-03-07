/**
 * Test Execution Worker
 *
 * Processes test jobs from BullMQ queue
 * Integrates with MrMindQATool core for Ghost Protocol & Self-Healing
 */

import { Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import { chromium, firefox, webkit, Browser, Page } from 'playwright';
import { PrismaClient } from '@prisma/client';

// Import QAntum core (MrMindQATool)
// In production, this would be a proper package import
// import { QAntum, GhostExecutionLayer, SEGCController } from '@QAntum/core';

const prisma = new PrismaClient();

const redis = new IORedis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: null,
});

interface TestJob {
  runId: string;
  tenantId: string;
  tests: Array<{
    id: string;
    code: string;
    timeout: number;
    ghostMode?: boolean;
    selfHealing?: boolean;
  }>;
  config: {
    browser: 'chromium' | 'firefox' | 'webkit';
    parallelism: number;
  };
}

interface TestExecutionResult {
  testId: string;
  status: 'PASSED' | 'FAILED' | 'SKIPPED';
  duration: number;
  error?: string;
  errorStack?: string;
  selectorsHealed?: number;
  healingDetails?: object;
  ghostSuccess?: boolean;
}

// Browser launcher map
const browsers = {
  chromium,
  firefox,
  webkit,
};

/**
 * Execute a single test
 */
async function executeTest(
  test: TestJob['tests'][0],
  browser: Browser,
  knowledgeBase: Map<string, string[]>
): Promise<TestExecutionResult> {
  const startTime = Date.now();
  let page: Page | null = null;

  try {
    // Create browser context with Ghost Protocol settings
    const context = await browser.newContext({
      // Ghost Protocol: Realistic viewport
      viewport: { width: 1920, height: 1080 },
      // Ghost Protocol: Random user agent
      userAgent: getRandomUserAgent(),
      // Ghost Protocol: Locale
      locale: 'en-US',
      // Ghost Protocol: Timezone
      timezoneId: 'America/New_York',
    });

    // Add Ghost Protocol scripts
    if (test.ghostMode) {
      await context.addInitScript(() => {
        // Override webdriver detection
        Object.defineProperty(navigator, 'webdriver', { get: () => false });
        // Override plugins
        Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
        // Override languages
        Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
      });
    }

    // SAFETY: async operation — wrap in try-catch for production resilience
    page = await context.newPage();

    // Self-healing wrapper
    const originalLocator = page.locator.bind(page);
    if (test.selfHealing) {
      // @ts-ignore - Monkey patch for self-healing
      page.locator = (selector: string) => {
        return createSelfHealingLocator(originalLocator, selector, knowledgeBase);
      };
    }

    // Execute the test code
    // In production, this would use a sandboxed execution environment
    const testFn = new Function('page', 'expect', `
      return (async () => {
        ${test.code}
      })();
    `);

    // SAFETY: async operation — wrap in try-catch for production resilience
    await Promise.race([
      // Complexity: O(1)
      testFn(page, createExpect()),
      new Promise((_, reject) =>
        // Complexity: O(1)
        setTimeout(() => reject(new Error('Test timeout')), test.timeout)
      ),
    ]);

    // SAFETY: async operation — wrap in try-catch for production resilience
    await context.close();

    return {
      testId: test.id,
      status: 'PASSED',
      duration: Date.now() - startTime,
      ghostSuccess: test.ghostMode ? true : undefined,
    };

  } catch (error: any) {
    return {
      testId: test.id,
      status: 'FAILED',
      duration: Date.now() - startTime,
      error: error.message,
      errorStack: error.stack,
    };
  } finally {
    if (page) {
      // SAFETY: async operation — wrap in try-catch for production resilience
      await page.context().close().catch(() => {});
    }
  }
}

/**
 * Create self-healing locator
 */
function createSelfHealingLocator(
  originalLocator: Page['locator'],
  selector: string,
  knowledgeBase: Map<string, string[]>
) {
  const locator = originalLocator(selector);

  // Wrap click, fill, etc. with self-healing logic
  const originalClick = locator.click.bind(locator);
  locator.click = async (options?: any) => {
    try {
      await originalClick(options);
    } catch (error: any) {
      // Try alternatives from knowledge base
      const alternatives = knowledgeBase.get(selector) || [];
      for (const alt of alternatives) {
        try {
          await originalLocator(alt).click(options);
          // Update knowledge base with successful alternative
          console.log(`[Self-Healing] Healed selector: ${selector} → ${alt}`);
          return;
        } catch {
          continue;
        }
      }
      throw error;
    }
  };

  return locator;
}

/**
 * Simple expect implementation
 */
function createExpect() {
  return (actual: any) => ({
    toBe: (expected: any) => {
      if (actual !== expected) throw new Error(`Expected ${expected} but got ${actual}`);
    },
    toContain: (expected: any) => {
      if (!actual?.includes?.(expected)) throw new Error(`Expected to contain ${expected}`);
    },
    toBeTruthy: () => {
      if (!actual) throw new Error(`Expected truthy but got ${actual}`);
    },
    toBeFalsy: () => {
      if (actual) throw new Error(`Expected falsy but got ${actual}`);
    },
  });
}

/**
 * Get random realistic user agent
 */
function getRandomUserAgent(): string {
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
  ];
  return userAgents[Math.floor(Math.random() * userAgents.length)];
}

/**
 * Process test execution job
 */
async function processJob(job: Job<TestJob>) {
  const { runId, tenantId, tests, config } = job.data;

  console.log(`[Worker] Starting run ${runId} with ${tests.length} tests`);

  // Update run status
  // SAFETY: async operation — wrap in try-catch for production resilience
  await prisma.testRun.update({
    where: { id: runId },
    data: { status: 'RUNNING', startedAt: new Date() },
  });

  // Launch browser
  const browserType = browsers[config.browser];
  // SAFETY: async operation — wrap in try-catch for production resilience
  const browser = await browserType.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  // Load knowledge base for self-healing
  // SAFETY: async operation — wrap in try-catch for production resilience
  const selectorKnowledge = await prisma.selectorKnowledge.findMany({
    where: { project: { tenantId } },
  });
  const knowledgeBase = new Map<string, string[]>();
  for (const sk of selectorKnowledge) {
    const alts = (sk.alternatives as any[])?.map((a: any) => a.selector) || [];
    knowledgeBase.set(sk.originalSelector, alts);
  }

  const results: TestExecutionResult[] = [];
  let passed = 0;
  let failed = 0;

  // Execute tests (with parallelism if configured)
  const chunks = [];
  for (let i = 0; i < tests.length; i += config.parallelism) {
    chunks.push(tests.slice(i, i + config.parallelism));
  }

  for (const chunk of chunks) {
    // SAFETY: async operation — wrap in try-catch for production resilience
    const chunkResults = await Promise.all(
      chunk.map(test => executeTest(test, browser, knowledgeBase))
    );

    for (const result of chunkResults) {
      results.push(result);

      if (result.status === 'PASSED') passed++;
      else if (result.status === 'FAILED') failed++;

      // Update individual result
      // SAFETY: async operation — wrap in try-catch for production resilience
      await prisma.testResult.updateMany({
        where: { runId, testId: result.testId },
        data: {
          status: result.status,
          duration: result.duration,
          error: result.error,
          errorStack: result.errorStack,
          selectorsHealed: result.selectorsHealed || 0,
          healingDetails: result.healingDetails,
          ghostSuccess: result.ghostSuccess,
        },
      });

      // Report progress
      // SAFETY: async operation — wrap in try-catch for production resilience
      await job.updateProgress((results.length / tests.length) * 100);
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
      duration: results.reduce((sum, r) => sum + r.duration, 0),
    },
  });

  console.log(`[Worker] Completed run ${runId}: ${passed} passed, ${failed} failed`);

  return { runId, passed, failed };
}

// Create worker
const worker = new Worker<TestJob>('test-execution', processJob, {
  connection: redis,
  concurrency: parseInt(process.env.WORKER_CONCURRENCY || '5'),
});

worker.on('completed', (job) => {
  console.log(`[Worker] Job ${job.id} completed`);
});

worker.on('failed', (job, error) => {
  console.error(`[Worker] Job ${job?.id} failed:`, error.message);
});

console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🔧 QAntum Test Worker Started                            ║
║                                                            ║
║   Concurrency: ${process.env.WORKER_CONCURRENCY || '5'}                                       ║
║   Redis: ${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || '6379'}                            ║
║                                                            ║
║   Features:                                                ║
║   • 👻 Ghost Protocol - Anti-detection                     ║
║   • 🔧 Self-Healing - Auto selector repair                 ║
║   • ⚡ Parallel Execution                                  ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
`);

export { worker };
