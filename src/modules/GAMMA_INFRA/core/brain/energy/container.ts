/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * Aeterna
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * @copyright 2025 Димитър Продромов (Dimitar Prodromov). All Rights Reserved.
 * @license PROPRIETARY AND CONFIDENTIAL
 *
 * This file is part of Aeterna.
 * Unauthorized copying, modification, distribution, or use of this file,
 * via any medium, is strictly prohibited without express written permission.
 *
 * For licensing inquiries: dimitar.papazov@Aeterna.dev
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { EventEmitter } from 'node:events';

// ═══════════════════════════════════════════════════════════════════════════════
// SERVICE TOKENS - Type-safe injection keys
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Service token for type-safe dependency injection
 * @template T - The service type this token represents
 */
export class ServiceToken<T> {
  /** Unique identifier for the service */
  readonly id: symbol;
  /** Human-readable name for debugging */
  readonly name: string;
  /** Type marker (never used at runtime) */
  readonly _type!: T;

  /**
   * Create a new service token
   * @param name - Human-readable identifier
   */
  constructor(name: string) {
    this.id = Symbol(name);
    this.name = name;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// PREDEFINED SERVICE TOKENS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Core service tokens for AETERNA
 * Use these to inject dependencies throughout the application
 */
export const ServiceTokens = {
  // Browser Engines
  BrowserEngine: new ServiceToken<IBrowserEngine>('BrowserEngine'),
  BrowserPool: new ServiceToken<IBrowserPool>('BrowserPool'),

  // AI Services
  AIProvider: new ServiceToken<IAIProvider>('AIProvider'),
  ModelRouter: new ServiceToken<IModelRouter>('ModelRouter'),

  // Database/Storage
  Database: new ServiceToken<IDatabase>('Database'),
  CacheProvider: new ServiceToken<ICacheProvider>('CacheProvider'),
  NeuralVault: new ServiceToken<INeuralVault>('NeuralVault'),

  // Workers
  WorkerPool: new ServiceToken<IWorkerPool>('WorkerPool'),
  TaskScheduler: new ServiceToken<ITaskScheduler>('TaskScheduler'),

  // Security
  Sandbox: new ServiceToken<ISandbox>('Sandbox'),
  CircuitBreaker: new ServiceToken<ICircuitBreaker>('CircuitBreaker'),

  // Observability
  Logger: new ServiceToken<ILogger>('Logger'),
  MetricsCollector: new ServiceToken<IMetricsCollector>('MetricsCollector'),
  HealthChecker: new ServiceToken<IHealthChecker>('HealthChecker'),

  // Configuration
  Config: new ServiceToken<IConfig>('Config'),
  Environment: new ServiceToken<IEnvironment>('Environment'),

  // Error Handling
  ErrorHandler: new ServiceToken<IErrorHandler>('ErrorHandler'),
  RetryStrategy: new ServiceToken<IRetryStrategy>('RetryStrategy'),

  // Semantic Core
  SemanticCore: new ServiceToken<ISemanticCore>('SemanticCore'),

  // SEGC
  MutationEngine: new ServiceToken<IMutationEngine>('MutationEngine'),
  GhostExecutor: new ServiceToken<IGhostExecutor>('GhostExecutor'),

  // Swarm
  SwarmOrchestrator: new ServiceToken<ISwarmOrchestrator>('SwarmOrchestrator'),
  AgentFactory: new ServiceToken<IAgentFactory>('AgentFactory'),
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// SERVICE INTERFACES - Contracts for all injectable services
// ═══════════════════════════════════════════════════════════════════════════════

/** Browser automation engine interface */
export interface IBrowserEngine {
  // Complexity: O(1)
  launch(): Promise<void>;
  // Complexity: O(1)
  close(): Promise<void>;
  // Complexity: O(1)
  newPage(): Promise<unknown>;
  // Complexity: O(1)
  getStatus(): 'idle' | 'busy' | 'closed';
}

/** Pool of browser instances */
export interface IBrowserPool {
  // Complexity: O(1)
  acquire(): Promise<IBrowserEngine>;
  // Complexity: O(1)
  release(browser: IBrowserEngine): void;
  // Complexity: O(1)
  getSize(): number;
  // Complexity: O(1)
  getActiveCount(): number;
}

/** AI model provider interface */
export interface IAIProvider {
  // Complexity: O(1)
  generate(prompt: string, options?: AIGenerateOptions): Promise<AIResponse>;
  // Complexity: O(1)
  chat(messages: ChatMessage[], options?: AIChatOptions): Promise<AIResponse>;
  // Complexity: O(1)
  embed(text: string): Promise<number[]>;
  // Complexity: O(1)
  getModel(): string;
  // Complexity: O(1)
  isAvailable(): Promise<boolean>;
}

/** Options for AI generation */
export interface AIGenerateOptions {
  temperature?: number;
  maxTokens?: number;
  stopSequences?: string[];
}

/** Options for AI chat */
export interface AIChatOptions extends AIGenerateOptions {
  systemPrompt?: string;
}

/** AI response structure */
export interface AIResponse {
  content: string;
  usage?: { promptTokens: number; completionTokens: number };
  model: string;
  finishReason: 'stop' | 'length' | 'error';
}

/** Chat message structure */
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/** Routes requests to appropriate AI models */
export interface IModelRouter {
  // Complexity: O(1)
  route(task: string, options?: RouteOptions): Promise<IAIProvider>;
  // Complexity: O(1)
  setPreferred(model: string): void;
  // Complexity: O(1)
  getAvailableModels(): string[];
}

/** Route options */
export interface RouteOptions {
  preferredModel?: string;
  fallbackEnabled?: boolean;
}

/** Database interface */
export interface IDatabase {
  // Complexity: O(1)
  connect(): Promise<void>;
  // Complexity: O(1)
  disconnect(): Promise<void>;
  query<T>(sql: string, params?: unknown[]): Promise<T[]>;
  // Complexity: O(1)
  execute(sql: string, params?: unknown[]): Promise<{ affectedRows: number }>;
  transaction<T>(fn: (tx: ITransaction) => Promise<T>): Promise<T>;
}

/** Transaction interface */
export interface ITransaction {
  query<T>(sql: string, params?: unknown[]): Promise<T[]>;
  // Complexity: O(1)
  execute(sql: string, params?: unknown[]): Promise<{ affectedRows: number }>;
  // Complexity: O(1)
  commit(): Promise<void>;
  // Complexity: O(1)
  rollback(): Promise<void>;
}

/** Cache provider interface */
export interface ICacheProvider {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  // Complexity: O(1)
  delete(key: string): Promise<boolean>;
  // Complexity: O(1)
  clear(): Promise<void>;
  // Complexity: O(1)
  has(key: string): Promise<boolean>;
}

/** Encrypted storage vault */
export interface INeuralVault {
  // Complexity: O(1)
  store(key: string, data: unknown): Promise<void>;
  retrieve<T>(key: string): Promise<T | null>;
  // Complexity: O(1)
  delete(key: string): Promise<boolean>;
  // Complexity: O(1)
  list(): Promise<string[]>;
}

/** Worker thread pool */
export interface IWorkerPool {
  submit<T>(task: WorkerTask): Promise<T>;
  // Complexity: O(1)
  getStats(): WorkerPoolStats;
  // Complexity: O(1)
  scaleUp(count: number): void;
  // Complexity: O(1)
  scaleDown(count: number): void;
  // Complexity: O(1)
  shutdown(graceful: boolean): Promise<void>;
}

/** Worker task definition */
export interface WorkerTask {
  type: string;
  payload: unknown;
  priority?: number;
  timeout?: number;
}

/** Worker pool statistics */
export interface WorkerPoolStats {
  totalWorkers: number;
  activeWorkers: number;
  queueSize: number;
  completedTasks: number;
}

/** Task scheduler interface */
export interface ITaskScheduler {
  // Complexity: O(1)
  schedule(task: ScheduledTask): string;
  // Complexity: O(1)
  cancel(taskId: string): boolean;
  // Complexity: O(1)
  getScheduled(): ScheduledTask[];
}

/** Scheduled task definition */
export interface ScheduledTask {
  id?: string;
  fn: () => Promise<void>;
  interval?: number;
  cron?: string;
  runOnce?: boolean;
}

/** Sandboxed execution environment */
export interface ISandbox {
  execute<T>(code: string, context?: Record<string, unknown>): Promise<SandboxResult<T>>;
  // Complexity: O(1)
  validateCode(code: string): Promise<ValidationResult>;
}

/** Sandbox execution result */
export interface SandboxResult<T> {
  success: boolean;
  result?: T;
  error?: string;
  violations: SecurityViolation[];
  executionTime: number;
}

/** Validation result */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/** Security violation record */
export interface SecurityViolation {
  type: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

/** Circuit breaker for resilience */
export interface ICircuitBreaker {
  execute<T>(fn: () => Promise<T>, fallback?: () => Promise<T>): Promise<T>;
  // Complexity: O(1)
  getState(): 'closed' | 'open' | 'half-open';
  // Complexity: O(1)
  reset(): void;
  // Complexity: O(1)
  trip(): void;
}

/** Logging interface */
export interface ILogger {
  // Complexity: O(1)
  debug(message: string, meta?: Record<string, unknown>): void;
  // Complexity: O(1)
  info(message: string, meta?: Record<string, unknown>): void;
  // Complexity: O(1)
  warn(message: string, meta?: Record<string, unknown>): void;
  // Complexity: O(1)
  error(message: string, error?: Error, meta?: Record<string, unknown>): void;
  // Complexity: O(1)
  fatal(message: string, error?: Error, meta?: Record<string, unknown>): void;
}

/** Metrics collector interface */
export interface IMetricsCollector {
  // Complexity: O(1)
  increment(metric: string, value?: number, tags?: Record<string, string>): void;
  // Complexity: O(1)
  gauge(metric: string, value: number, tags?: Record<string, string>): void;
  // Complexity: O(1)
  histogram(metric: string, value: number, tags?: Record<string, string>): void;
  // Complexity: O(1)
  timing(metric: string, duration: number, tags?: Record<string, string>): void;
}

/** Health checker interface */
export interface IHealthChecker {
  // Complexity: O(1)
  check(): Promise<HealthStatus>;
  // Complexity: O(1)
  registerCheck(name: string, check: () => Promise<CheckResult>): void;
  // Complexity: O(1)
  unregisterCheck(name: string): void;
}

/** Overall health status */
export interface HealthStatus {
  healthy: boolean;
  checks: Record<string, CheckResult>;
  timestamp: Date;
}

/** Individual check result */
export interface CheckResult {
  healthy: boolean;
  message?: string;
  duration: number;
}

/** Configuration interface */
export interface IConfig {
  get<T>(key: string, defaultValue?: T): T;
  // Complexity: O(1)
  set(key: string, value: unknown): void;
  // Complexity: O(1)
  has(key: string): boolean;
  // Complexity: O(1)
  getAll(): Record<string, unknown>;
}

/** Environment interface */
export interface IEnvironment {
  // Complexity: O(1)
  get(key: string, defaultValue?: string): string;
  // Complexity: O(1)
  isDevelopment(): boolean;
  // Complexity: O(1)
  isProduction(): boolean;
  // Complexity: O(1)
  isTest(): boolean;
}

/** Error handler interface */
export interface IErrorHandler {
  // Complexity: O(1)
  handle(error: Error, context?: ErrorContext): Promise<ErrorHandleResult>;
  // Complexity: O(1)
  registerStrategy(type: string, strategy: ErrorStrategy): void;
}

/** Error context */
export interface ErrorContext {
  operation: string;
  component: string;
  metadata?: Record<string, unknown>;
  neuralSnapshot?: NeuralSnapshot;
}

/** Neural snapshot for error debugging */
export interface NeuralSnapshot {
  memoryUsage: NodeJS.MemoryUsage;
  activeHandles: number;
  uptime: number;
  timestamp: Date;
  stackTrace: string;
}

/** Error handling result */
export interface ErrorHandleResult {
  recovered: boolean;
  retried: boolean;
  retryCount: number;
  finalError?: Error;
}

/** Error handling strategy */
export interface ErrorStrategy {
  // Complexity: O(1)
  canHandle(error: Error): boolean;
  // Complexity: O(1)
  handle(error: Error, context: ErrorContext): Promise<ErrorHandleResult>;
}

/** Retry strategy interface */
export interface IRetryStrategy {
  execute<T>(fn: () => Promise<T>, options?: RetryOptions): Promise<T>;
}

/** Retry options */
export interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  retryCondition?: (error: Error) => boolean;
}

/** Semantic analysis core */
export interface ISemanticCore {
  // Complexity: O(1)
  analyze(input: string): Promise<SemanticAnalysis>;
  // Complexity: O(1)
  generatePrediction(context: unknown): Promise<PredictionResult>;
}

/** Semantic analysis result */
export interface SemanticAnalysis {
  intent: string;
  entities: Array<{ type: string; value: string }>;
  confidence: number;
}

/** Prediction result */
export interface PredictionResult {
  prediction: unknown;
  confidence: number;
  reasoning: string[];
}

/** Mutation engine interface */
export interface IMutationEngine {
  // Complexity: O(1)
  propose(context: unknown): Promise<MutationProposal[]>;
  // Complexity: O(1)
  apply(mutation: MutationProposal): Promise<MutationResult>;
  // Complexity: O(1)
  rollback(mutationId: string): Promise<void>;
}

/** Mutation proposal */
export interface MutationProposal {
  id: string;
  type: string;
  target: string;
  changes: unknown;
  confidence: number;
}

/** Mutation result */
export interface MutationResult {
  success: boolean;
  applied: boolean;
  rollbackAvailable: boolean;
}

/** Ghost execution layer */
export interface IGhostExecutor {
  // Complexity: O(1)
  execute(action: unknown): Promise<GhostResult>;
  // Complexity: O(1)
  getActiveGhosts(): number;
}

/** Ghost execution result */
export interface GhostResult {
  success: boolean;
  result: unknown;
  duration: number;
}

/** Swarm orchestrator interface */
export interface ISwarmOrchestrator {
  // Complexity: O(1)
  assignTask(task: unknown): Promise<string>;
  // Complexity: O(1)
  getAgentStatus(agentId: string): AgentStatus;
  // Complexity: O(1)
  shutdown(): Promise<void>;
}

/** Agent status */
export interface AgentStatus {
  id: string;
  type: string;
  state: 'idle' | 'working' | 'error';
  currentTask?: string;
}

/** Agent factory interface */
export interface IAgentFactory {
  // Complexity: O(1)
  create(type: string, config?: unknown): unknown;
  // Complexity: O(1)
  getAvailableTypes(): string[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// SERVICE LIFETIME ENUM
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Service lifetime determines how instances are created and shared
 */
export enum ServiceLifetime {
  /** Single instance shared across all requests */
  Singleton = 'singleton',
  /** New instance for each scope (e.g., per request) */
  Scoped = 'scoped',
  /** New instance every time it's resolved */
  Transient = 'transient',
}

// ═══════════════════════════════════════════════════════════════════════════════
// SERVICE REGISTRATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Service registration entry
 */
interface ServiceRegistration<T> {
  token: ServiceToken<T>;
  factory: (container: DIContainer) => T | Promise<T>;
  lifetime: ServiceLifetime;
  instance?: T;
}

// ═══════════════════════════════════════════════════════════════════════════════
// DI CONTAINER - The Heart of Dependency Injection
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * 💎 Dependency Injection Container
 *
 * Central registry for all application services.
 * Supports singleton, scoped, and transient lifetimes.
 *
 * @example
 * ```typescript
 * const container = new DIContainer();
 *
 * // Register a singleton service
 * container.register(ServiceTokens.Logger, () => new ConsoleLogger(), ServiceLifetime.Singleton);
 *
 * // Resolve the service
 // SAFETY: async operation — wrap in try-catch for production resilience
 * const logger = await container.resolve(ServiceTokens.Logger);
 * logger.info('Hello from DI!');
 * ```
 */
export class DIContainer extends EventEmitter {
  private registrations = new Map<symbol, ServiceRegistration<unknown>>();
  private scopedInstances = new Map<string, Map<symbol, unknown>>();
  private currentScope: string | null = null;
  private resolving = new Set<symbol>();

  /**
   * Register a service with the container
   * @param token - Service token for type-safe resolution
   * @param factory - Factory function to create the service
   * @param lifetime - How the service instance should be managed
   * @throws Error if token is already registered
   */
  register<T>(
    token: ServiceToken<T>,
    factory: (container: DIContainer) => T | Promise<T>,
    lifetime: ServiceLifetime = ServiceLifetime.Singleton
  ): void {
    if (this.registrations.has(token.id)) {
      throw new Error(`Service '${token.name}' is already registered. Use replace() to override.`);
    }

    this.registrations.set(token.id, {
      token,
      factory,
      lifetime,
    } as ServiceRegistration<unknown>);

    this.emit('registered', { token: token.name, lifetime });
  }

  /**
   * Replace an existing service registration
   * @param token - Service token to replace
   * @param factory - New factory function
   * @param lifetime - New lifetime (optional, keeps existing if not provided)
   */
  replace<T>(
    token: ServiceToken<T>,
    factory: (container: DIContainer) => T | Promise<T>,
    lifetime?: ServiceLifetime
  ): void {
    const existing = this.registrations.get(token.id);

    this.registrations.set(token.id, {
      token,
      factory,
      lifetime: lifetime ?? existing?.lifetime ?? ServiceLifetime.Singleton,
    } as ServiceRegistration<unknown>);

    // Clear cached instance if singleton
    if (existing?.instance) {
      delete existing.instance;
    }

    this.emit('replaced', { token: token.name, lifetime });
  }

  /**
   * Resolve a service from the container
   * @param token - Service token to resolve
   * @returns The resolved service instance
   * @throws Error if service is not registered or circular dependency detected
   */
  async resolve<T>(token: ServiceToken<T>): Promise<T> {
    const registration = this.registrations.get(token.id) as ServiceRegistration<T> | undefined;

    if (!registration) {
      throw new Error(
        `Service '${token.name}' is not registered. Did you forget to call register()?`
      );
    }

    // Detect circular dependencies
    if (this.resolving.has(token.id)) {
      throw new Error(`Circular dependency detected for service '${token.name}'`);
    }

    try {
      this.resolving.add(token.id);
      return await this.resolveRegistration(registration);
    } finally {
      this.resolving.delete(token.id);
    }
  }

  /**
   * Resolve a registration based on its lifetime
   */
  private async resolveRegistration<T>(registration: ServiceRegistration<T>): Promise<T> {
    switch (registration.lifetime) {
      case ServiceLifetime.Singleton:
        if (!registration.instance) {
          registration.instance = await registration.factory(this);
        }
        return registration.instance;

      case ServiceLifetime.Scoped:
        if (!this.currentScope) {
          throw new Error(
            'Cannot resolve scoped service outside of a scope. Use container.runInScope().'
          );
        }

        let scopeMap = this.scopedInstances.get(this.currentScope);
        if (!scopeMap) {
          scopeMap = new Map();
          this.scopedInstances.set(this.currentScope, scopeMap);
        }

        if (!scopeMap.has(registration.token.id)) {
          // SAFETY: async operation — wrap in try-catch for production resilience
          scopeMap.set(registration.token.id, await registration.factory(this));
        }
        return scopeMap.get(registration.token.id) as T;

      case ServiceLifetime.Transient:
        // SAFETY: async operation — wrap in try-catch for production resilience
        return await registration.factory(this);
    }
  }

  /**
   * Run a function within a new scope
   * @param scopeId - Unique identifier for the scope
   * @param fn - Function to run within the scope
   * @returns The result of the function
   */
  async runInScope<T>(scopeId: string, fn: () => Promise<T>): Promise<T> {
    const previousScope = this.currentScope;
    this.currentScope = scopeId;

    try {
      return await fn();
    } finally {
      // Clean up scoped instances
      this.scopedInstances.delete(scopeId);
      this.currentScope = previousScope;
    }
  }

  /**
   * Check if a service is registered
   * @param token - Service token to check
   * @returns True if the service is registered
   */
  isRegistered<T>(token: ServiceToken<T>): boolean {
    return this.registrations.has(token.id);
  }

  /**
   * Get all registered service names
   * @returns Array of registered service names
   */
  // Complexity: O(N) — linear iteration
  getRegisteredServices(): string[] {
    return Array.from(this.registrations.values()).map((r) => r.token.name);
  }

  /**
   * Clear all registrations and instances
   * Use with caution - mainly for testing
   */
  // Complexity: O(1)
  clear(): void {
    this.registrations.clear();
    this.scopedInstances.clear();
    this.currentScope = null;
    this.resolving.clear();
    this.emit('cleared');
  }

  /**
   * Create a child container that inherits registrations
   * @returns A new child container
   */
  // Complexity: O(N) — linear iteration
  createChild(): DIContainer {
    const child = new DIContainer();

    // Copy registrations (but not instances)
    for (const [key, reg] of this.registrations) {
      child.registrations.set(key, {
        token: reg.token,
        factory: reg.factory,
        lifetime: reg.lifetime,
      });
    }

    return child;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// GLOBAL CONTAINER INSTANCE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Global DI container instance
 * Use this for application-wide service resolution
 */
export const globalContainer = new DIContainer();

// ═══════════════════════════════════════════════════════════════════════════════
// DECORATOR HELPERS (for future use)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Metadata key for storing injection tokens
 */
// ═══════════════════════════════════════════════════════════════════════════════
// INJECTION METADATA (For decorator-based injection if using reflect-metadata)
// ═══════════════════════════════════════════════════════════════════════════════

export const INJECT_METADATA_KEY = Symbol('inject');

// Internal metadata storage (no reflect-metadata dependency)
const injectionMetadataStore = new WeakMap<object, Array<ServiceToken<unknown> | undefined>>();

/**
 * Store injection metadata for a class constructor parameter
 * @param target - Class constructor
 * @param token - Service token to inject
 * @param parameterIndex - Constructor parameter index
 */
export function storeInjectionMetadata(
  target: object,
  token: ServiceToken<unknown>,
  parameterIndex: number
): void {
  const existing = injectionMetadataStore.get(target) || [];
  existing[parameterIndex] = token;
  injectionMetadataStore.set(target, existing);
}

/**
 * Retrieve injection metadata for a class
 * @param target - Class constructor
 * @returns Array of service tokens indexed by parameter position
 */
export function getInjectionMetadata(target: object): Array<ServiceToken<unknown> | undefined> {
  return injectionMetadataStore.get(target) || [];
}

export default DIContainer;
