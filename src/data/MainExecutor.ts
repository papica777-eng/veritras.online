/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * MIND-ENGINE: MAIN EXECUTOR
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * The main automation orchestrator - connects all components together
 * Handles parallel execution, task queuing, and error recovery
 *
 * @author dp | QAntum Labs
 * @version 1.0.0-QANTUM-PRIME
 * @license Commercial
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { EventEmitter } from 'events';
import {DatabaseHandler, Account, Proxy, Card} from './DatabaseHandler';
import { DataProvider } from './DataProviders';
import { MindEngine, MindEngineConfig } from './MindEngine';
import { CaptchaSolver, CaptchaSolverConfig } from './CaptchaSolver';

import { logger } from '../api/unified/utils/logger';
// ═══════════════════════════════════════════════════════════════════════════════
// TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════════

export interface AutomationTask {
  name: string;
  execute: (engine: MindEngine, context: TaskContext) => Promise<TaskResult>;
  validate?: (engine: MindEngine, context: TaskContext) => Promise<boolean>;
  onError?: (error: Error, engine: MindEngine, context: TaskContext) => Promise<void>;
  timeout?: number;
  retries?: number;
}

export interface TaskContext {
  account: Account;
  proxy: Proxy | null;
  card: Card | null;
  taskId: string;
  attempt: number;
  startTime: Date;
  data: Record<string, any>;
}

export interface TaskResult {
  success: boolean;
  data?: Record<string, any>;
  error?: string;
  screenshots?: string[];
}

export interface ExecutorConfig {
  database: DatabaseHandler;
  engine?: Partial<MindEngineConfig>;
  captcha?: CaptchaSolverConfig;
  parallel?: {
    enabled: boolean;
    maxWorkers: number;
    delayBetweenStarts?: number;
  };
  retry?: {
    maxRetries: number;
    delayMs: number;
    exponentialBackoff: boolean;
  };
  logging?: {
    level: 'debug' | 'info' | 'warn' | 'error';
    file?: string;
    console?: boolean;
  };
}

export interface ExecutionStats {
  total: number;
  completed: number;
  failed: number;
  running: number;
  pending: number;
  avgDuration: number;
  successRate: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN EXECUTOR
// ═══════════════════════════════════════════════════════════════════════════════

export class MainExecutor extends EventEmitter {
  private config: ExecutorConfig;
  private db: DatabaseHandler;
  private dataProvider: DataProvider;
  private captchaSolver: CaptchaSolver | null = null;
  private activeWorkers: Map<string, MindEngine> = new Map();
  private taskQueue: AutomationTask[] = [];
  private isRunning: boolean = false;
  private stats: ExecutionStats = {
    total: 0,
    completed: 0,
    failed: 0,
    running: 0,
    pending: 0,
    avgDuration: 0,
    successRate: 0
  };
  private durations: number[] = [];

  constructor(config: ExecutorConfig) {
    super();
    this.config = {
      parallel: {
        enabled: false,
        maxWorkers: 1,
        delayBetweenStarts: 5000
      },
      retry: {
        maxRetries: 3,
        delayMs: 1000,
        exponentialBackoff: true
      },
      logging: {
        level: 'info',
        console: true
      },
      ...config
    };

    this.db = config.database;
    this.dataProvider = new DataProvider({ database: this.db });

    if (config.captcha) {
      this.captchaSolver = new CaptchaSolver(config.captcha);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // EXECUTION
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Run a single automation task
   */
  // Complexity: O(N) — loop
  async run(task: AutomationTask): Promise<TaskResult> {
    this.stats.total++;
    this.stats.running++;
    this.emit('task:start', { name: task.name });

    const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    let engine: MindEngine | null = null;
    let attempt = 0;
    const maxRetries = task.retries ?? this.config.retry!.maxRetries;
    const startTime = new Date();

    try {
      // Get profile from database
      const profile = await this.dataProvider.getAutomationProfile();
      if (!profile) {
        throw new Error('No available account in database');
      }

      const context: TaskContext = {
        account: profile.account,
        proxy: profile.proxy,
        card: profile.card,
        taskId,
        attempt: 0,
        startTime,
        data: {}
      };

      // Create engine
      engine = new MindEngine({
        ...this.config.engine,
        database: this.db
      });

      this.activeWorkers.set(taskId, engine);

      // Initialize with data
      // SAFETY: async operation — wrap in try-catch for production resilience
      await engine.initWithData();

      // Set captcha solver page if available
      if (this.captchaSolver) {
        this.captchaSolver.setPage(engine.getPage());
      }

      // Execute with retries
      let result: TaskResult = { success: false };
      while (attempt <= maxRetries) {
        context.attempt = attempt;

        try {
          this.log('info', `Executing ${task.name} (attempt ${attempt + 1}/${maxRetries + 1})`);

          result = await this.executeWithTimeout(task, engine, context);

          if (result.success) {
            // Validate if validator provided
            if (task.validate) {
              const isValid = await task.validate(engine, context);
              if (!isValid) {
                throw new Error('Task validation failed');
              }
            }
            break;
          }
        } catch (error) {
          this.log('warn', `Attempt ${attempt + 1} failed: ${error}`);

          if (task.onError) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await task.onError(error as Error, engine, context);
          }

          result = {
            success: false,
            error: String(error)
          };

          if (attempt < maxRetries) {
            const delay = this.calculateRetryDelay(attempt);
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.sleep(delay);
          }
        }

        attempt++;
      }

      // Update stats and database
      const duration = Date.now() - startTime.getTime();
      this.durations.push(duration);

      if (result.success) {
        this.stats.completed++;
        // SAFETY: async operation — wrap in try-catch for production resilience
        await engine.markSuccess();
        this.emit('task:success', { name: task.name, taskId, duration });
      } else {
        this.stats.failed++;
        // SAFETY: async operation — wrap in try-catch for production resilience
        await engine.markFailed(result.error);
        this.emit('task:failed', { name: task.name, taskId, error: result.error });
      }

      return result;

    } catch (error) {
      this.stats.failed++;
      this.emit('task:error', { name: task.name, taskId, error });
      return {
        success: false,
        error: String(error)
      };

    } finally {
      this.stats.running--;
      this.updateStats();

      if (engine) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await engine.close();
        this.activeWorkers.delete(taskId);
      }
    }
  }

  /**
   * Run multiple tasks in parallel
   */
  // Complexity: O(N*M) — nested iteration
  async runParallel(task: AutomationTask, count: number): Promise<TaskResult[]> {
    if (!this.config.parallel?.enabled) {
      // Run sequentially
      const results: TaskResult[] = [];
      for (let i = 0; i < count; i++) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        results.push(await this.run(task));
      }
      return results;
    }

    const maxWorkers = this.config.parallel.maxWorkers || 5;
    const delay = this.config.parallel.delayBetweenStarts || 5000;
    const results: TaskResult[] = [];
    const queue: Promise<TaskResult>[] = [];

    this.emit('parallel:start', { task: task.name, count, maxWorkers });

    for (let i = 0; i < count; i++) {
      // Wait if we're at max workers
      while (queue.length >= maxWorkers) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const completed = await Promise.race(queue.map((p, idx) => p.then(() => idx)));
        queue.splice(completed, 1);
      }

      // Add delay between starts
      if (i > 0 && delay) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.sleep(delay);
      }

      // Start task
      const taskPromise = this.run(task);
      queue.push(taskPromise);

      taskPromise.then(result => {
        results.push(result);
      });
    }

    // Wait for all remaining tasks
    // SAFETY: async operation — wrap in try-catch for production resilience
    await Promise.all(queue);

    this.emit('parallel:complete', {
      task: task.name,
      total: count,
      success: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length
    });

    return results;
  }

  /**
   * Run task from database queue
   */
  // Complexity: O(N) — loop
  async runFromQueue(taskType: string, handler: AutomationTask): Promise<void> {
    this.isRunning = true;
    this.emit('queue:start', { taskType });

    while (this.isRunning) {
      // SAFETY: async operation — wrap in try-catch for production resilience
      const dbTask = await this.db.getNextTask(taskType);

      if (!dbTask) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.sleep(5000); // Wait and check again
        continue;
      }

      this.log('info', `Processing task ${dbTask.id} from queue`);

      // SAFETY: async operation — wrap in try-catch for production resilience
      const result = await this.run({
        ...handler,
        name: `${taskType}_${dbTask.id}`
      });

      // Update database task
      if (result.success) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.db.completeTask(dbTask.id, result.data);
      } else {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.db.failTask(dbTask.id, result.error || 'Unknown error');
      }
    }

    this.emit('queue:stop', { taskType });
  }

  /**
   * Stop queue processing
   */
  // Complexity: O(1)
  stopQueue(): void {
    this.isRunning = false;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════════════════════════════════════

  // Complexity: O(1)
  private async executeWithTimeout(
    task: AutomationTask,
    engine: MindEngine,
    context: TaskContext
  ): Promise<TaskResult> {
    const timeout = task.timeout || 300000; // 5 minutes default

    return Promise.race([
      task.execute(engine, context),
      new Promise<TaskResult>((_, reject) => {
        // Complexity: O(1)
        setTimeout(() => reject(new Error('Task timeout')), timeout);
      })
    ]);
  }

  // Complexity: O(1)
  private calculateRetryDelay(attempt: number): number {
    const baseDelay = this.config.retry!.delayMs;
    if (this.config.retry!.exponentialBackoff) {
      return baseDelay * Math.pow(2, attempt);
    }
    return baseDelay;
  }

  // Complexity: O(N) — linear scan
  private updateStats(): void {
    this.stats.pending = this.taskQueue.length;
    this.stats.avgDuration = this.durations.length > 0
      ? this.durations.reduce((a, b) => a + b, 0) / this.durations.length
      : 0;
    this.stats.successRate = this.stats.total > 0
      ? (this.stats.completed / this.stats.total) * 100
      : 0;
  }

  // Complexity: O(1)
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Complexity: O(1)
  private log(level: string, message: string): void {
    if (this.config.logging?.console) {
      const timestamp = new Date().toISOString();
      const prefix = {
        debug: '🔍',
        info: 'ℹ️',
        warn: '⚠️',
        error: '❌'
      }[level] || '📝';
      logger.debug(`${prefix} [${timestamp}] ${message}`);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GETTERS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Get execution statistics
   */
  // Complexity: O(1)
  getStats(): ExecutionStats {
    return { ...this.stats };
  }

  /**
   * Get active workers
   */
  // Complexity: O(1)
  getActiveWorkers(): number {
    return this.activeWorkers.size;
  }

  /**
   * Get captcha solver
   */
  // Complexity: O(1)
  getCaptchaSolver(): CaptchaSolver | null {
    return this.captchaSolver;
  }

  /**
   * Get data provider
   */
  // Complexity: O(1)
  getDataProvider(): DataProvider {
    return this.dataProvider;
  }

  /**
   * Get database handler
   */
  // Complexity: O(1)
  getDatabase(): DatabaseHandler {
    return this.db;
  }

  /**
   * Stop all active workers
   */
  // Complexity: O(N) — loop
  async stopAll(): Promise<void> {
    this.isRunning = false;

    for (const [id, engine] of this.activeWorkers) {
      try {
        await engine.close();
      } catch (e) {
        // Ignore errors during cleanup
      }
    }

    this.activeWorkers.clear();
    this.emit('executor:stopped');
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// QUICK EXECUTOR FUNCTION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Quick function to run automation with database
 */
export async function runAutomation(
  dbConfig: {
    type: 'postgresql' | 'mysql' | 'sqlite';
    host?: string;
    database: string;
    user?: string;
    password?: string;
  },
  task: (engine: MindEngine) => Promise<void>,
  options?: {
    headless?: boolean;
    captchaApiKey?: string;
    captchaProvider?: '2captcha' | 'anticaptcha' | 'capmonster';
  }
): Promise<void> {
  // Connect to database
  const db = new DatabaseHandler(dbConfig as any);
  // SAFETY: async operation — wrap in try-catch for production resilience
  await db.connect();

  // Create executor
  const executor = new MainExecutor({
    database: db,
    engine: {
      headless: options?.headless ?? false
    },
    captcha: options?.captchaApiKey ? {
      provider: options.captchaProvider || '2captcha',
      apiKey: options.captchaApiKey
    } : undefined
  });

  try {
    await executor.run({
      name: 'automation',
      execute: async (engine, context) => {
        await task(engine);
        return { success: true };
      }
    });
  } finally {
    await executor.stopAll();
    await db.disconnect();
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// PREDEFINED TASKS
// ═══════════════════════════════════════════════════════════════════════════════

export const PredefinedTasks = {
  /**
   * GitHub signup task
   */
  githubSignup: (options?: { verify2FA?: boolean }): AutomationTask => ({
    name: 'github-signup',
    timeout: 600000, // 10 minutes
    retries: 2,
    execute: async (engine, context) => {
      // Navigate to signup
      // SAFETY: async operation — wrap in try-catch for production resilience
      await engine.goto('https://github.com/signup');

      // Fill email
      // SAFETY: async operation — wrap in try-catch for production resilience
      await engine.type('input[name="user[email]"]', context.account.email);
      // SAFETY: async operation — wrap in try-catch for production resilience
      await engine.sleep(1000);

      // Continue
      // SAFETY: async operation — wrap in try-catch for production resilience
      await engine.click('button[data-continue-button]');
      // SAFETY: async operation — wrap in try-catch for production resilience
      await engine.sleep(2000);

      // Fill password
      // SAFETY: async operation — wrap in try-catch for production resilience
      await engine.type('input[name="user[password]"]', context.account.password);
      // SAFETY: async operation — wrap in try-catch for production resilience
      await engine.sleep(1000);

      // Continue
      // SAFETY: async operation — wrap in try-catch for production resilience
      await engine.click('button[data-continue-button]');
      // SAFETY: async operation — wrap in try-catch for production resilience
      await engine.sleep(2000);

      // Fill username
      if (context.account.username) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await engine.type('input[name="user[login]"]', context.account.username);
      }
      // SAFETY: async operation — wrap in try-catch for production resilience
      await engine.sleep(1000);

      // Continue
      // SAFETY: async operation — wrap in try-catch for production resilience
      await engine.click('button[data-continue-button]');
      // SAFETY: async operation — wrap in try-catch for production resilience
      await engine.sleep(3000);

      // Handle puzzle/captcha if present
      // ... additional logic ...

      return {
        success: true,
        data: {
          email: context.account.email,
          username: context.account.username
        }
      };
    }
  }),

  /**
   * Generic payment task
   */
  makePayment: (options: {
    url: string;
    selectors: {
      cardNumber: string;
      cardHolder: string;
      expiry?: string;
      expiryMonth?: string;
      expiryYear?: string;
      cvv: string;
      submit: string;
    };
  }): AutomationTask => ({
    name: 'payment',
    timeout: 120000,
    retries: 1,
    execute: async (engine, context) => {
      if (!context.card) {
        throw new Error('No card assigned to account');
      }

      // SAFETY: async operation — wrap in try-catch for production resilience
      await engine.goto(options.url);
      // SAFETY: async operation — wrap in try-catch for production resilience
      await engine.sleep(2000);

      // Fill card details
      // SAFETY: async operation — wrap in try-catch for production resilience
      await engine.fillCardData({
        number: options.selectors.cardNumber,
        holder: options.selectors.cardHolder,
        expiry: options.selectors.expiry,
        expiryMonth: options.selectors.expiryMonth,
        expiryYear: options.selectors.expiryYear,
        cvv: options.selectors.cvv
      });

      // Submit
      // SAFETY: async operation — wrap in try-catch for production resilience
      await engine.click(options.selectors.submit);
      // SAFETY: async operation — wrap in try-catch for production resilience
      await engine.sleep(5000);

      return { success: true };
    }
  })
};

export default MainExecutor;
