/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * QAntum
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * @copyright 2025 Димитър Продромов (Dimitar Prodromov). All Rights Reserved.
 * @license PROPRIETARY AND CONFIDENTIAL
 *
 * This file is part of QAntum.
 * Unauthorized copying, modification, distribution, or use of this file,
 * via any medium, is strictly prohibited without express written permission.
 *
 * For licensing inquiries: dimitar.papazov@QAntum.dev
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { EventEmitter } from 'node:events';
import { SandboxExecutor } from './sandbox/sandbox-executor';
import { WorkerPoolManager } from './workers/worker-pool';
import { MemoryHardeningManager } from './memory/memory-hardening';
import { NeuralVault } from './neural/neural-vault';
import { ChecksumValidator } from './neural/checksum-validator';
import { CircuitBreakerManager } from './energy/circuit-breaker';
import { HealthCheckSystem } from './health/health-check';
import {
  BastionConfig,
  BastionStats,
  SecurityViolation,
  MutationValidation,
  ServiceProvider,
  SystemHealth
} from './types';

/**
 * Bastion Controller
 *
 * Central hub for all security and infrastructure operations.
 */
export class BastionController extends EventEmitter {
  private config: Required<BastionConfig>;

  // Core components
  private sandbox: SandboxExecutor;
  private workerPool: WorkerPoolManager;
  private memoryManager: MemoryHardeningManager;
  private vault: NeuralVault;
  private checksum: ChecksumValidator;
  private circuitBreaker: CircuitBreakerManager;
  private healthCheck: HealthCheckSystem;

  // State
  private isInitialized = false;
  private startTime = Date.now();

  constructor(config: BastionConfig = {}) {
    super();

    this.config = {
      enabled: config.enabled ?? true,
      sandbox: config.sandbox ?? {},
      workerPool: config.workerPool ?? {},
      neuralVault: config.neuralVault ?? {},
      circuitBreaker: config.circuitBreaker ?? {},
      healthCheckInterval: config.healthCheckInterval ?? 30000,
      verbose: config.verbose ?? false
    };

    // Initialize components
    this.sandbox = new SandboxExecutor(this.config.sandbox);
    this.workerPool = new WorkerPoolManager(this.config.workerPool);
    this.memoryManager = new MemoryHardeningManager();
    this.vault = new NeuralVault(this.config.neuralVault);
    this.checksum = new ChecksumValidator();
    this.circuitBreaker = new CircuitBreakerManager(this.config.circuitBreaker);
    this.healthCheck = new HealthCheckSystem({
      interval: this.config.healthCheckInterval
    });

    // Wire up event forwarding
    this.setupEventForwarding();

    // Register custom health checks
    this.registerHealthChecks();
  }

  /**
   * Initialize the Bastion with vault password
   * @param vaultPassword - Password for encrypted storage
   */
  // Complexity: O(1)
  async initialize(vaultPassword: string): Promise<void> {
    if (this.isInitialized) return;

    this.log('Initializing Security Bastion v19.0...');

    try {
      // Initialize vault
      await this.vault.initialize(vaultPassword);
      this.log('Neural Vault initialized');

      // Start health monitoring
      this.healthCheck.start();
      this.log('Health monitoring started');

      this.isInitialized = true;
      this.emit('initialized');
      this.log('Security Bastion ready');
    } catch (error) {
      this.emit('initError', error);
      throw error;
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // SANDBOX OPERATIONS
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Validate a mutation in sandbox
   * @param mutationId - Mutation identifier
   * @param mutationCode - Code to validate
   * @param context - Test context
   */
  // Complexity: O(1)
  async validateMutation(
    mutationId: string,
    mutationCode: string,
    context: Record<string, unknown> = {}
  ): Promise<MutationValidation> {
    this.ensureInitialized();

    // SAFETY: async operation — wrap in try-catch for production resilience
    const result = await this.sandbox.validateMutation(
      mutationId,
      mutationCode,
      context
    );

    if (!result.isSafe) {
      this.emit('mutationBlocked', { mutationId, result });
    }

    return result;
  }

  /**
   * Get sandbox violations
   */
  // Complexity: O(1)
  getViolations(): SecurityViolation[] {
    return this.sandbox.getViolations();
  }

  // ═══════════════════════════════════════════════════════════════════════
  // WORKER POOL OPERATIONS
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Submit a task to the worker pool
   * @param type - Task type
   * @param payload - Task payload
   * @param options - Task options
   */
  async submitTask<T = unknown, R = unknown>(
    type: string,
    payload: T,
    options?: { priority?: number; timeout?: number }
  ): Promise<R> {
    return this.workerPool.submitTask<T, R>(type, payload, options);
  }

  /**
   * Scale worker pool
   * @param targetCount - Target worker count
   */
  // Complexity: O(1)
  scaleWorkers(targetCount: number): void {
    this.workerPool.scale(targetCount);
  }

  /**
   * Get worker pool stats
   */
  // Complexity: O(1)
  getWorkerStats() {
    return this.workerPool.getStats();
  }

  // ═══════════════════════════════════════════════════════════════════════
  // MEMORY OPERATIONS
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Register a browser instance for tracking
   * @param browser - Browser instance
   * @param instanceId - Unique ID
   */
  // Complexity: O(1)
  trackBrowser(browser: object, instanceId: string): void {
    this.memoryManager.registerBrowser(browser, instanceId);
  }

  /**
   * Track a resource with cleanup
   * @param type - Resource type
   * @param resource - Resource object
   * @param resourceId - Resource ID
   * @param cleanup - Cleanup callback
   */
  // Complexity: O(1)
  trackResource(
    type: 'browser' | 'page' | 'ghost' | 'mutation' | 'worker' | 'socket' | 'stream',
    resource: object,
    resourceId: string,
    cleanup?: () => void | Promise<void>
  ): void {
    this.memoryManager.trackResource(type, resource, resourceId, cleanup);
  }

  /**
   * Get memory stats
   */
  // Complexity: O(1)
  getMemoryStats() {
    return this.memoryManager.getMemoryStats();
  }

  // ═══════════════════════════════════════════════════════════════════════
  // VAULT OPERATIONS
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Store data in encrypted vault
   * @param id - Entry ID
   * @param type - Entry type
   * @param data - Data to store
   */
  // Complexity: O(1)
  async storeSecure(
    id: string,
    type: 'ghost_knowledge' | 'predictions' | 'mutations' | 'versions' | 'metrics',
    data: unknown
  ) {
    this.ensureInitialized();
    return this.vault.store(id, type, data);
  }

  /**
   * Retrieve data from vault
   * @param id - Entry ID
   */
  async retrieveSecure<T = unknown>(id: string): Promise<T | null> {
    this.ensureInitialized();
    return this.vault.retrieve<T>(id);
  }

  /**
   * Save vault to disk
   */
  // Complexity: O(1)
  async saveVault(): Promise<void> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.vault.save();
  }

  // ═══════════════════════════════════════════════════════════════════════
  // CHECKSUM OPERATIONS
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Generate checksum for data
   * @param data - Data to hash
   */
  // Complexity: O(1)
  generateChecksum(data: unknown): string {
    return this.checksum.hashString(JSON.stringify(data));
  }

  /**
   * Verify data checksum
   * @param data - Data to verify
   * @param expectedHash - Expected hash
   */
  // Complexity: O(1)
  verifyChecksum(data: unknown, expectedHash: string): boolean {
    return this.checksum.verifyData(data, expectedHash);
  }

  // ═══════════════════════════════════════════════════════════════════════
  // CIRCUIT BREAKER OPERATIONS
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Execute request with circuit breaker
   * @param requestFn - Request function
   * @param options - Options
   */
  async executeWithFallback<T>(
    requestFn: (service: ServiceProvider) => Promise<T>,
    options?: { service?: ServiceProvider; timeout?: number }
  ): Promise<T> {
    return this.circuitBreaker.execute(requestFn, options);
  }

  /**
   * Get active service
   */
  // Complexity: O(1)
  getActiveService(): ServiceProvider {
    return this.circuitBreaker.getFallbackChain().activeService;
  }

  /**
   * Set primary service
   * @param service - Primary service
   */
  // Complexity: O(1)
  setPrimaryService(service: ServiceProvider): void {
    this.circuitBreaker.setPrimary(service);
  }

  /**
   * Get circuit breaker stats
   */
  // Complexity: O(1)
  getCircuitStats() {
    return this.circuitBreaker.getStats();
  }

  // ═══════════════════════════════════════════════════════════════════════
  // HEALTH OPERATIONS
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Get system health
   */
  // Complexity: O(1)
  async getHealth(): Promise<SystemHealth> {
    return this.healthCheck.getHealth();
  }

  /**
   * Get health trend
   */
  // Complexity: O(1)
  getHealthTrend() {
    return this.healthCheck.getHealthTrend();
  }

  /**
   * Register custom health check
   * @param name - Check name
   * @param checkFn - Check function
   */
  // Complexity: O(1)
  registerHealthCheck(
    name: string,
    checkFn: () => Promise<{
      healthy: boolean;
      message: string;
      metrics?: Record<string, number>;
    }>
  ): void {
    this.healthCheck.register(name, async () => ({
      module: name,
      // SAFETY: async operation — wrap in try-catch for production resilience
      ...(await checkFn()),
      duration: 0,
      timestamp: new Date()
    }));
  }

  // ═══════════════════════════════════════════════════════════════════════
  // STATISTICS & STATE
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Get comprehensive stats
   */
  // Complexity: O(1)
  getStats(): BastionStats {
    const sandboxStats = this.sandbox.getStats();
    const workerStats = this.workerPool.getStats();
    const circuitStats = this.circuitBreaker.getStats();
    const healthStats = this.healthCheck.getStats();
    const vaultStats = this.vault.getStats();

    return {
      sandboxExecutions: sandboxStats.executionCount,
      violationsBlocked: sandboxStats.blockedCount,
      workerTasksCompleted: workerStats.tasksCompleted,
      vaultOperations: vaultStats.operationCount,
      circuitBreakerTrips: circuitStats.tripCount,
      healthChecksPerformed: healthStats.checksPerformed,
      uptime: Date.now() - this.startTime
    };
  }

  /**
   * Check if initialized
   */
  // Complexity: O(1)
  isReady(): boolean {
    return this.isInitialized;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // PRIVATE METHODS
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Set up event forwarding from components
   */
  // Complexity: O(1)
  private setupEventForwarding(): void {
    // Sandbox events
    this.sandbox.on?.('violation', (v: SecurityViolation) => {
      this.emit('sandbox:violation', v);
    });

    // Worker events
    this.workerPool.on('workerError', (id, err) => {
      this.emit('worker:error', { id, error: err });
    });

    // Circuit breaker events
    this.circuitBreaker.on('circuitOpen', (data) => {
      this.emit('circuit:open', data);
    });
    this.circuitBreaker.on('failover', (data) => {
      this.emit('circuit:failover', data);
    });

    // Memory events
    this.memoryManager.on('memoryPressure', (data) => {
      this.emit('memory:pressure', data);
    });

    // Health events
    this.healthCheck.on('alert', (alert) => {
      this.emit('health:alert', alert);
    });
  }

  /**
   * Register health checks for all components
   */
  // Complexity: O(1)
  private registerHealthChecks(): void {
    // Sandbox health
    this.healthCheck.register('sandbox', async () => ({
      module: 'sandbox',
      healthy: this.sandbox.isEnabled(),
      duration: 0,
      message: 'Sandbox operational',
      timestamp: new Date()
    }));

    // Worker pool health
    this.healthCheck.register('worker-pool', async () => {
      const stats = this.workerPool.getStats();
      return {
        module: 'worker-pool',
        healthy: this.workerPool.isRunning() && stats.totalWorkers > 0,
        duration: 0,
        message: `${stats.activeWorkers}/${stats.totalWorkers} workers active`,
        metrics: {
          active: stats.activeWorkers,
          total: stats.totalWorkers,
          queueSize: stats.queueSize
        },
        timestamp: new Date()
      };
    });

    // Vault health
    this.healthCheck.register('vault', async () => ({
      module: 'vault',
      healthy: this.vault.isInitialized(),
      duration: 0,
      message: this.vault.isInitialized() ? 'Vault unlocked' : 'Vault locked',
      timestamp: new Date()
    }));

    // Circuit breaker health
    this.healthCheck.register('circuit-breaker', async () => {
      const stats = this.circuitBreaker.getStats();
      return {
        module: 'circuit-breaker',
        healthy: true,
        duration: 0,
        message: `Active: ${stats.activeService}`,
        metrics: {
          failovers: stats.failoverCount,
          trips: stats.tripCount
        },
        timestamp: new Date()
      };
    });
  }

  /**
   * Ensure Bastion is initialized
   */
  // Complexity: O(1)
  private ensureInitialized(): void {
    if (!this.isInitialized) {
      throw new Error('Bastion not initialized. Call initialize() first.');
    }
  }

  /**
   * Log with verbose check
   */
  // Complexity: O(1)
  private log(message: string): void {
    if (this.config.verbose) {
      console.log(`[BASTION] ${message}`);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // LIFECYCLE
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Shutdown all components
   */
  // Complexity: O(1)
  async shutdown(): Promise<void> {
    this.log('Shutting down Security Bastion...');

    // Stop health monitoring
    this.healthCheck.shutdown();

    // Shutdown circuit breaker
    this.circuitBreaker.shutdown();

    // Shutdown memory manager
    this.memoryManager.shutdown();

    // Save and close vault
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.vault.close();

    // Shutdown worker pool
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.workerPool.shutdown(true);

    this.isInitialized = false;
    this.emit('shutdown');
    this.log('Security Bastion shutdown complete');
  }

  /**
   * Get component references for advanced usage
   */
  // Complexity: O(1)
  getComponents() {
    return {
      sandbox: this.sandbox,
      workerPool: this.workerPool,
      memoryManager: this.memoryManager,
      vault: this.vault,
      checksum: this.checksum,
      circuitBreaker: this.circuitBreaker,
      healthCheck: this.healthCheck
    };
  }
}

export default BastionController;
