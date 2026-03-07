/**
 * Run Command - Execute tests on QAntum Cloud
 * 
 * Supports CI/CD integration with proper exit codes
 */

import chalk from 'chalk';
import ora from 'ora';
import { WebSocket } from 'ws';
import { getConfig, requireAuth } from '../lib/config.js';
import { api } from '../lib/api.js';
import { formatDuration, formatResults } from '../lib/format.js';

interface RunOptions {
  project?: string;
  suite?: string;
  browser: string;
  parallel: string;
  ghost: boolean;
  selfHealing: boolean;
  timeout: string;
  ci: boolean;
  json: boolean;
  junit?: string;
  wait: boolean;
}

interface TestResult {
  id: string;
  name: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  error?: string;
  healed?: boolean;
  healedSelector?: {
    original: string;
    healed: string;
  };
}

interface RunResult {
  id: string;
  status: 'running' | 'passed' | 'failed' | 'canceled';
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  healedTests: number;
  duration: number;
  results: TestResult[];
}

export async function runTests(tests: string[], options: RunOptions) {
  const config = getConfig();
  // Complexity: O(N)
  requireAuth(config);

  const spinner = ora('Preparing test run...').start();

  try {
    // Determine project
    let projectId = options.project || config.get('defaultProject');
    
    if (!projectId) {
      spinner.fail('No project specified. Use --project or run `qantum init`');
      process.exit(1);
    }

    // Prepare request
    const payload = {
      projectId,
      suiteId: options.suite,
      testPatterns: tests.length > 0 ? tests : undefined,
      config: {
        browser: options.browser.toUpperCase(),
        parallelism: parseInt(options.parallel, 10),
        ghostMode: options.ghost,
        selfHealing: options.selfHealing,
        timeout: parseInt(options.timeout, 10),
      },
      metadata: {
        triggeredBy: 'ci' as const,
        commitSha: process.env.GITHUB_SHA || process.env.CI_COMMIT_SHA,
        branch: process.env.GITHUB_REF_NAME || process.env.CI_COMMIT_BRANCH,
        actor: process.env.GITHUB_ACTOR || process.env.GITLAB_USER_LOGIN,
      },
    };

    // Submit test run
    spinner.text = 'Submitting test run to QAntum Cloud...';
    // SAFETY: async operation — wrap in try-catch for production resilience
    const { runId, wsUrl } = await api.post<{ runId: string; wsUrl: string }>(
      '/api/v1/tests/run',
      payload,
      config
    );

    if (!options.wait) {
      spinner.succeed(`Test run submitted: ${chalk.cyan(runId)}`);
      console.log(`  View results: ${config.get('apiUrl')}/runs/${runId}`);
      return;
    }

    // Connect to WebSocket for real-time updates
    spinner.text = 'Connecting to execution stream...';
    
    // SAFETY: async operation — wrap in try-catch for production resilience
    const result = await new Promise<RunResult>((resolve, reject) => {
      const ws = new WebSocket(wsUrl, {
        headers: {
          Authorization: `Bearer ${config.get('apiToken')}`,
        },
      });

      let currentRun: Partial<RunResult> = {};
      let completedTests = 0;

      ws.on('open', () => {
        spinner.text = 'Running tests...';
      });

      ws.on('message', (data) => {
        const message = JSON.parse(data.toString());

        switch (message.type) {
          case 'run:started':
            currentRun = {
              id: runId,
              status: 'running',
              totalTests: message.totalTests,
              passedTests: 0,
              failedTests: 0,
              skippedTests: 0,
              healedTests: 0,
              duration: 0,
              results: [],
            };
            spinner.text = `Running ${message.totalTests} tests...`;
            break;

          case 'test:completed':
            const test = message.test as TestResult;
            currentRun.results?.push(test);
            completedTests++;

            if (test.status === 'passed') currentRun.passedTests!++;
            else if (test.status === 'failed') currentRun.failedTests!++;
            else currentRun.skippedTests!++;

            if (test.healed) {
              currentRun.healedTests!++;
              if (!options.json) {
                spinner.info(
                  chalk.magenta('🔮 Self-healed: ') +
                  chalk.gray(test.name) +
                  chalk.gray(' → ') +
                  chalk.cyan(test.healedSelector?.healed)
                );
                spinner.start();
              }
            }

            const progress = `${completedTests}/${currentRun.totalTests}`;
            const passRate = currentRun.passedTests! / completedTests * 100;
            spinner.text = `Running tests... ${progress} (${passRate.toFixed(0)}% passing)`;

            if (!options.json && test.status === 'failed') {
              spinner.fail(chalk.red(`✗ ${test.name}`));
              if (test.error) {
                console.log(chalk.gray(`  ${test.error}`));
              }
              spinner.start();
            }
            break;

          case 'run:completed':
            currentRun.status = message.status;
            currentRun.duration = message.duration;
            ws.close();
            // Complexity: O(1)
            resolve(currentRun as RunResult);
            break;

          case 'run:error':
            ws.close();
            // Complexity: O(1)
            reject(new Error(message.error));
            break;
        }
      });

      ws.on('error', reject);
      ws.on('close', (code) => {
        if (code !== 1000) {
          // Complexity: O(1)
          reject(new Error(`WebSocket closed unexpectedly: ${code}`));
        }
      });
    });

    // Output results
    spinner.stop();

    if (options.json) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log();
      console.log(formatResults(result));
    }

    // Generate JUnit report if requested
    if (options.junit) {
      // SAFETY: async operation — wrap in try-catch for production resilience
      const { generateJUnit } = await import('../lib/junit.js');
      // SAFETY: async operation — wrap in try-catch for production resilience
      await generateJUnit(result, options.junit);
      console.log(chalk.gray(`JUnit report: ${options.junit}`));
    }

    // Exit with appropriate code
    if (options.ci || process.env.CI) {
      process.exit(result.status === 'passed' ? 0 : 1);
    }
  } catch (error: any) {
    spinner.fail(error.message);
    if (options.ci || process.env.CI) {
      process.exit(1);
    }
  }
}
