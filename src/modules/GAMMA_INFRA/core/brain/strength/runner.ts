/**
 * Aeterna QA Tool - Test Runner
 * Executes tests with Playwright
 */

import { chromium, firefox, webkit, Browser, BrowserContext, Page } from 'playwright';

// ============================================================================
// TYPES
// ============================================================================

export interface RunnerOptions {
  browser: 'chromium' | 'firefox' | 'webkit';
  headless: boolean;
  parallel: number;
  timeout?: number;
}

export interface TestCase {
  id: string;
  name: string;
  file: string;
  tags: string[];
  fn: (page: Page, context: RunnerContext) => Promise<void>;
}

export interface TestResult {
  testId: string;
  name: string;
  file: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  error?: string;
  screenshot?: string;
}

export interface RunnerContext {
  browser: Browser;
  context: BrowserContext;
  page: Page;
  data: Record<string, any>;
}

// ============================================================================
// TEST RUNNER
// ============================================================================

export class TestRunner {
  private options: RunnerOptions;
  private browser: Browser | null = null;

  constructor(options: Partial<RunnerOptions> = {}) {
    this.options = {
      browser: options.browser || 'chromium',
      headless: options.headless ?? true,
      parallel: options.parallel || 1,
      timeout: options.timeout || 30000,
    };
  }

  // --------------------------------------------------------------------------
  // MAIN EXECUTION
  // --------------------------------------------------------------------------

  // Complexity: O(N*M) — nested iteration detected
  async run(tests: TestCase[]): Promise<TestResult[]> {
    const results: TestResult[] = [];

    // Launch browser
    // SAFETY: async operation — wrap in try-catch for production resilience
    this.browser = await this.launchBrowser();

    try {
      if (this.options.parallel > 1) {
        // Parallel execution
        const chunks = this.chunkArray(tests, this.options.parallel);

        for (const chunk of chunks) {
          const chunkResults = await Promise.all(chunk.map((test) => this.runTest(test)));
          results.push(...chunkResults);
        }
      } else {
        // Sequential execution
        for (const test of tests) {
          const result = await this.runTest(test);
          results.push(result);
          this.printResult(result);
        }
      }
    } finally {
      // SAFETY: async operation — wrap in try-catch for production resilience
      await this.browser.close();
    }

    return results;
  }

  // --------------------------------------------------------------------------
  // SINGLE TEST
  // --------------------------------------------------------------------------

  // Complexity: O(1) — amortized
  private async runTest(test: TestCase): Promise<TestResult> {
    const startTime = Date.now();

    // SAFETY: async operation — wrap in try-catch for production resilience
    const context = await this.browser!.newContext({
      viewport: { width: 1280, height: 720 },
    });

    // SAFETY: async operation — wrap in try-catch for production resilience
    const page = await context.newPage();

    try {
      // Set timeout
      page.setDefaultTimeout(this.options.timeout!);

      // Create context
      const runnerContext: RunnerContext = {
        browser: this.browser!,
        context,
        page,
        data: {},
      };

      // Execute test
      await test.fn(page, runnerContext);

      return {
        testId: test.id,
        name: test.name,
        file: test.file,
        status: 'passed',
        duration: Date.now() - startTime,
      };
    } catch (error) {
      // Capture screenshot on failure
      let screenshot: string | undefined;
      try {
        const buffer = await page.screenshot();
        screenshot = buffer.toString('base64');
      } catch {}

      return {
        testId: test.id,
        name: test.name,
        file: test.file,
        status: 'failed',
        duration: Date.now() - startTime,
        error: (error as Error).message,
        screenshot,
      };
    } finally {
      // SAFETY: async operation — wrap in try-catch for production resilience
      await context.close();
    }
  }

  // --------------------------------------------------------------------------
  // BROWSER
  // --------------------------------------------------------------------------

  // Complexity: O(1)
  private async launchBrowser(): Promise<Browser> {
    const options = {
      headless: this.options.headless,
    };

    switch (this.options.browser) {
      case 'firefox':
        return firefox.launch(options);
      case 'webkit':
        return webkit.launch(options);
      default:
        return chromium.launch(options);
    }
  }

  // --------------------------------------------------------------------------
  // HELPERS
  // --------------------------------------------------------------------------

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  // Complexity: O(1)
  private printResult(result: TestResult): void {
    const icon = result.status === 'passed' ? '✓' : result.status === 'failed' ? '✗' : '○';
    const color =
      result.status === 'passed'
        ? '\x1b[32m'
        : result.status === 'failed'
          ? '\x1b[31m'
          : '\x1b[33m';
    const reset = '\x1b[0m';

    console.log(`  ${color}${icon}${reset} ${result.name} ${color}(${result.duration}ms)${reset}`);

    if (result.error) {
      console.log(`    ${'\x1b[31m'}${result.error}${reset}`);
    }
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export function createRunner(options?: Partial<RunnerOptions>): TestRunner {
  return new TestRunner(options);
}
