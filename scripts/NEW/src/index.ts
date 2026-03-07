/**
 * QAntum SDK - Programmatic API for Node.js
 * 
 * Use in CI/CD scripts or custom integrations
 */

import { WebSocket } from 'ws';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface QAntumConfig {
  apiToken: string;
  apiUrl?: string;
}

export interface RunTestsOptions {
  projectId: string;
  suiteId?: string;
  testPatterns?: string[];
  browser?: 'chromium' | 'firefox' | 'webkit';
  parallelism?: number;
  ghostMode?: boolean;
  selfHealing?: boolean;
  timeout?: number;
  metadata?: {
    commitSha?: string;
    branch?: string;
    triggeredBy?: 'manual' | 'ci' | 'schedule';
  };
}

export interface TestResult {
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

export interface RunResult {
  id: string;
  status: 'passed' | 'failed' | 'canceled';
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  healedTests: number;
  duration: number;
  results: TestResult[];
}

export interface TestRunEvent {
  type: 'started' | 'test:completed' | 'completed' | 'error';
  data: any;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CLIENT
// ═══════════════════════════════════════════════════════════════════════════════

export class QAntumClient {
  private apiUrl: string;
  private apiToken: string;

  constructor(config: QAntumConfig) {
    this.apiToken = config.apiToken;
    this.apiUrl = config.apiUrl || 'https://api.qantum.cloud';
  }

  /**
   * Run tests and wait for completion
   */
  // Complexity: O(1) — amortized
  async runTests(options: RunTestsOptions): Promise<RunResult> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    const response = await this.fetch('/api/v1/tests/run', {
      method: 'POST',
      body: JSON.stringify({
        projectId: options.projectId,
        suiteId: options.suiteId,
        testPatterns: options.testPatterns,
        config: {
          browser: options.browser?.toUpperCase() || 'CHROMIUM',
          parallelism: options.parallelism || 1,
          ghostMode: options.ghostMode ?? false,
          selfHealing: options.selfHealing ?? true,
          timeout: options.timeout || 30000,
        },
        metadata: options.metadata || { triggeredBy: 'ci' },
      }),
    });

    // SAFETY: async operation — wrap in try-catch for production resilience
    const { runId, wsUrl } = await response.json() as { runId: string; wsUrl: string };

    return this.waitForCompletion(runId, wsUrl);
  }

  /**
   * Run tests with streaming events
   */
  async *runTestsStream(
    options: RunTestsOptions
  ): AsyncGenerator<TestRunEvent, RunResult, void> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    const response = await this.fetch('/api/v1/tests/run', {
      method: 'POST',
      body: JSON.stringify({
        projectId: options.projectId,
        suiteId: options.suiteId,
        testPatterns: options.testPatterns,
        config: {
          browser: options.browser?.toUpperCase() || 'CHROMIUM',
          parallelism: options.parallelism || 1,
          ghostMode: options.ghostMode ?? false,
          selfHealing: options.selfHealing ?? true,
          timeout: options.timeout || 30000,
        },
        metadata: options.metadata || { triggeredBy: 'ci' },
      }),
    });

    // SAFETY: async operation — wrap in try-catch for production resilience
    const { runId, wsUrl } = await response.json() as { runId: string; wsUrl: string };

    // SAFETY: async operation — wrap in try-catch for production resilience
    const result = await new Promise<RunResult>((resolve, reject) => {
      const ws = new WebSocket(wsUrl, {
        headers: { Authorization: `Bearer ${this.apiToken}` },
      });

      const events: TestRunEvent[] = [];

      ws.on('message', (data) => {
        const message = JSON.parse(data.toString());
        events.push({ type: message.type, data: message });

        if (message.type === 'run:completed') {
          ws.close();
          // Complexity: O(1)
          resolve(this.buildResult(runId, events));
        } else if (message.type === 'run:error') {
          ws.close();
          // Complexity: O(1)
          reject(new Error(message.error));
        }
      });

      ws.on('error', reject);
    });

    return result;
  }

  /**
   * Get test run status
   */
  // Complexity: O(N) — potential recursive descent
  async getRunStatus(runId: string): Promise<RunResult> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    const response = await this.fetch(`/api/v1/tests/runs/${runId}`);
    return response.json() as Promise<RunResult>;
  }

  /**
   * List projects
   */
  // Complexity: O(N) — potential recursive descent
  async listProjects(): Promise<{ id: string; name: string }[]> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    const response = await this.fetch('/api/v1/projects');
    return response.json() as Promise<{ id: string; name: string }[]>;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PRIVATE METHODS
  // ═══════════════════════════════════════════════════════════════════════════

  // Complexity: O(1)
  private async fetch(path: string, options: RequestInit = {}): Promise<Response> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    const response = await fetch(`${this.apiUrl}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiToken}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      // SAFETY: async operation — wrap in try-catch for production resilience
      const error = await response.json().catch(() => ({})) as { error?: { message?: string } };
      throw new Error(error.error?.message || `Request failed: ${response.status}`);
    }

    return response;
  }

  // Complexity: O(1) — amortized
  private waitForCompletion(runId: string, wsUrl: string): Promise<RunResult> {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(wsUrl, {
        headers: { Authorization: `Bearer ${this.apiToken}` },
      });

      const events: TestRunEvent[] = [];

      ws.on('message', (data) => {
        const message = JSON.parse(data.toString());
        events.push({ type: message.type, data: message });

        if (message.type === 'run:completed') {
          ws.close();
          // Complexity: O(1)
          resolve(this.buildResult(runId, events));
        } else if (message.type === 'run:error') {
          ws.close();
          // Complexity: O(1)
          reject(new Error(message.error));
        }
      });

      ws.on('error', reject);
    });
  }

  // Complexity: O(N) — linear iteration
  private buildResult(runId: string, events: TestRunEvent[]): RunResult {
    const completedEvent = events.find((e) => e.type === 'completed')?.data;
    const testEvents = events.filter((e) => e.type === 'test:completed');

    const results: TestResult[] = testEvents.map((e) => e.data.test);
    const passed = results.filter((r) => r.status === 'passed').length;
    const failed = results.filter((r) => r.status === 'failed').length;
    const skipped = results.filter((r) => r.status === 'skipped').length;
    const healed = results.filter((r) => r.healed).length;

    return {
      id: runId,
      status: failed > 0 ? 'failed' : 'passed',
      totalTests: results.length,
      passedTests: passed,
      failedTests: failed,
      skippedTests: skipped,
      healedTests: healed,
      duration: completedEvent?.duration || 0,
      results,
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export function createClient(config: QAntumConfig): QAntumClient {
  return new QAntumClient(config);
}

export default QAntumClient;
