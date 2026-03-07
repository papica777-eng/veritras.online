/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                               ║
 * ║   QAntum CHRONOS MODULE                                                       ║
 * ║   "Master of Time - Scheduling, Travel & Deadlines"                           ║
 * ║                                                                               ║
 * ║   TODO B #31-33 - Complete Chronos System                                     ║
 * ║                                                                               ║
 * ║   © 2025-2026 QAntum | Dimitar Prodromov                                        ║
 * ║                                                                               ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

// ═══════════════════════════════════════════════════════════════════════════════
// RE-EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export * from './engine';
export * from './time-traveler';
export * from './deadline';

// ═══════════════════════════════════════════════════════════════════════════════
// IMPORTS
// ═══════════════════════════════════════════════════════════════════════════════

import { ChronosEngine, getChronos, CronParser, Scheduled } from './engine';
import {
  TimeTraveler,
  timeTraveler,
  freeze,
  unfreeze,
  advance,
  rewind,
  jumpTo,
  resetTime,
  FrozenTime,
  MockTime,
} from './time-traveler';
import {
  DeadlineManager,
  getDeadlineManager,
  DeadlineContext,
  DeadlineExpiredError,
  WithDeadline,
  AdaptiveDeadline,
} from './deadline';

// ═══════════════════════════════════════════════════════════════════════════════
// UNIFIED CHRONOS FACADE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Unified Chronos - Master of Time
 */
export class Chronos {
  private static instance: Chronos;

  private engine: ChronosEngine;
  private traveler: TimeTraveler;
  private deadlineManager: DeadlineManager;

  private constructor() {
    this.engine = getChronos();
    this.traveler = TimeTraveler.getInstance();
    this.deadlineManager = getDeadlineManager();
  }

  static getInstance(): Chronos {
    if (!Chronos.instance) {
      Chronos.instance = new Chronos();
    }
    return Chronos.instance;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SCHEDULING
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Schedule a one-time job
   */
  // Complexity: O(1)
  scheduleOnce(name: string, runAt: Date | number, handler: () => Promise<void>): string {
    return this.engine.scheduleOnce(name, runAt, handler);
  }

  /**
   * Schedule a repeating job
   */
  // Complexity: O(1)
  scheduleInterval(name: string, intervalMs: number, handler: () => Promise<void>): string {
    return this.engine.scheduleInterval(name, intervalMs, handler);
  }

  /**
   * Schedule a cron job
   */
  // Complexity: O(1)
  scheduleCron(name: string, cronExpression: string, handler: () => Promise<void>): string {
    return this.engine.scheduleCron(name, cronExpression, handler);
  }

  /**
   * Schedule a delayed job
   */
  // Complexity: O(1)
  delay(name: string, delayMs: number, handler: () => Promise<void>): string {
    return this.engine.scheduleDelay(name, delayMs, handler);
  }

  /**
   * Cancel a scheduled job
   */
  // Complexity: O(1)
  cancelJob(jobId: string): boolean {
    return this.engine.cancel(jobId);
  }

  /**
   * Start the scheduler
   */
  // Complexity: O(1)
  startScheduler(): void {
    this.engine.start();
  }

  /**
   * Stop the scheduler
   */
  // Complexity: O(1)
  stopScheduler(): void {
    this.engine.stop();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // TIME TRAVEL
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Get current time (respects mock time)
   */
  // Complexity: O(1)
  now(): number {
    return this.traveler.now();
  }

  /**
   * Jump to specific time
   */
  // Complexity: O(1)
  jumpTo(time: Date | number): void {
    this.traveler.jumpTo(time);
  }

  /**
   * Advance time
   */
  // Complexity: O(1)
  advance(ms: number): void {
    this.traveler.advance(ms);
  }

  /**
   * Rewind time
   */
  // Complexity: O(1)
  rewind(ms: number): void {
    this.traveler.rewind(ms);
  }

  /**
   * Freeze time
   */
  // Complexity: O(1)
  freeze(at?: Date | number): void {
    this.traveler.freeze(at);
  }

  /**
   * Unfreeze time
   */
  // Complexity: O(1)
  unfreeze(): void {
    this.traveler.unfreeze();
  }

  /**
   * Create time snapshot
   */
  // Complexity: O(1)
  snapshot(label?: string): string {
    return this.traveler.snapshot(label);
  }

  /**
   * Restore time snapshot
   */
  // Complexity: O(1)
  restoreSnapshot(idOrLabel: string): boolean {
    return this.traveler.restore(idOrLabel);
  }

  /**
   * Install mock time globally
   */
  // Complexity: O(1)
  installMockTime(): void {
    this.traveler.install();
  }

  /**
   * Uninstall mock time
   */
  // Complexity: O(1)
  uninstallMockTime(): void {
    this.traveler.uninstall();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // DEADLINES
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Execute with deadline
   */
  async withDeadline<T>(
    name: string,
    timeoutMs: number,
    fn: (context: DeadlineContext) => Promise<T>
  ): Promise<T> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    const result = await this.deadlineManager.withDeadline(name, timeoutMs, fn);

    if (result.expired) {
      throw new DeadlineExpiredError(name, timeoutMs);
    }

    return result.result!;
  }

  /**
   * Execute with adaptive deadline
   */
  async withAdaptiveDeadline<T>(
    name: string,
    baseTimeoutMs: number,
    fn: (context: DeadlineContext) => Promise<T>
  ): Promise<T> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    const result = await this.deadlineManager.withAdaptiveDeadline(name, baseTimeoutMs, fn);

    if (result.expired) {
      throw new DeadlineExpiredError(name, baseTimeoutMs);
    }

    return result.result!;
  }

  /**
   * Create deadline context
   */
  // Complexity: O(1)
  createDeadline(name: string, timeoutMs: number): DeadlineContext {
    return this.deadlineManager.createContext(name, timeoutMs);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // UTILITIES
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Parse cron expression
   */
  // Complexity: O(1)
  parseCron(expression: string): ReturnType<typeof CronParser.parse> {
    return CronParser.parse(expression);
  }

  /**
   * Get next cron run time
   */
  // Complexity: O(1)
  getNextCronRun(expression: string, from?: Date): Date {
    return CronParser.getNextRun(expression, from);
  }

  /**
   * Sleep helper
   */
  // Complexity: O(1)
  async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Run all pending mock timers
   */
  // Complexity: O(1)
  runAllTimers(): void {
    this.traveler.runAllTimers();
  }

  /**
   * Reset all time manipulation
   */
  // Complexity: O(1)
  reset(): void {
    this.traveler.reset();
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONVENIENCE EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export const chronos = Chronos.getInstance();

// Re-export decorators
export { Scheduled, FrozenTime, MockTime, WithDeadline, AdaptiveDeadline };

// Re-export time control functions
export { freeze, unfreeze, advance, rewind, jumpTo, resetTime };

// Re-export classes
export {
  ChronosEngine,
  TimeTraveler,
  DeadlineManager,
  DeadlineContext,
  DeadlineExpiredError,
  CronParser,
};

export default Chronos;
