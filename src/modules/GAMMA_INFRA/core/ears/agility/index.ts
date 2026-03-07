/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CHEMISTRY LAYER - REACTIVE TRANSFORMATIONS
 * Layer 3: Reactions, Bindings, and Transformations
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * "Химията е изкуството на трансформацията."
 *                                    — Антоан Лавоазие
 *
 * This layer handles TRANSFORMATIONS. It takes inputs (reactants) and
 * produces outputs (products) through well-defined reactions.
 *
 * PRINCIPLES:
 * - Depends on MATH and PHYSICS layers
 * - Pure transformations (input → output)
 * - Composable reaction chains (pipelines)
 * - Type-safe bindings
 *
 * CONTENTS:
 * - Adapters: Convert between formats (JSON, XML, protobuf)
 * - Validators: Schema validation, type checking
 * - Transformers: Data transformation pipelines
 * - Bindings: Connect different systems/protocols
 *
 * LAYER HIERARCHY:
 * ┌─────────────────────────────────────────────────────────────────┐
 * │ [5] REALITY    ← Final output to the world                      │
 * │ [4] BIOLOGY    ← Self-organizing, learning systems              │
 * │ [3] CHEMISTRY  ← Reactive transformations ← YOU ARE HERE        │
 * │ [2] PHYSICS    ← Interaction rules, forces                      │
 * │ [1] MATH       ← Pure algorithms, immutable truths              │
 * └─────────────────────────────────────────────────────────────────┘
 *
 * DEPENDENCY RULE:
 * Chemistry imports FROM Math, Physics
 * Chemistry exports TO Biology, Reality
 *
 * @module layers/chemistry
 * @version 1.0.0-QAntum
 * @license MIT
 */

import {
  type MathResult,
  createMathResult,
  contentHash,
  jaccardSimilarity,
  similarityFingerprint,
} from '../math';
import {
  type PhysicalEntity,
  PhysicsQueue,
  RateLimiter,
  PerformanceTracker,
} from '../physics';

// ═══════════════════════════════════════════════════════════════════════════
// CHEMISTRY PRIMITIVES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * A reaction takes reactants and produces products
 */
export interface Reaction<TInput, TOutput> {
  readonly name: string;
  readonly catalyst?: string; // Optional enhancer
  readonly transform: (input: TInput) => TOutput | Promise<TOutput>;
}

/**
 * Result of a chemical transformation
 */
export interface TransformResult<T> {
  readonly success: boolean;
  readonly output?: T;
  readonly byproducts: string[];
  readonly energyConsumed: number;
  readonly reactionTime: number;
}

/**
 * Validation result
 */
export interface ValidationResult {
  readonly valid: boolean;
  readonly errors: ValidationError[];
  readonly warnings: ValidationWarning[];
  readonly metadata: Record<string, unknown>;
}

export interface ValidationError {
  readonly path: string;
  readonly message: string;
  readonly code: string;
}

export interface ValidationWarning {
  readonly path: string;
  readonly message: string;
  readonly suggestion?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// TRANSFORMATION PIPELINE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Composable transformation pipeline (like chemical reactions in series)
 */
export class TransformPipeline<TInput, TOutput> {
  private reactions: Array<Reaction<unknown, unknown>> = [];
  private readonly tracker = new PerformanceTracker();

  /**
   * Add a transformation step
   */
  pipe<TNext>(
    reaction: Reaction<TOutput, TNext>
  ): TransformPipeline<TInput, TNext> {
    this.reactions.push(reaction as Reaction<unknown, unknown>);
    return this as unknown as TransformPipeline<TInput, TNext>;
  }

  /**
   * Execute the pipeline
   */
  // Complexity: O(N) — linear iteration
  async execute(input: TInput): Promise<TransformResult<TOutput>> {
    const startTime = performance.now();
    let current: unknown = input;
    const byproducts: string[] = [];

    try {
      for (const reaction of this.reactions) {
        const stepStart = performance.now();
        current = await reaction.transform(current);
        const stepTime = performance.now() - stepStart;

        byproducts.push(`${reaction.name}: ${stepTime.toFixed(2)}ms`);
        this.tracker.record(stepTime);
      }

      return {
        success: true,
        output: current as TOutput,
        byproducts,
        energyConsumed: this.reactions.length,
        reactionTime: performance.now() - startTime,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      byproducts.push(`ERROR: ${message}`);

      return {
        success: false,
        byproducts,
        energyConsumed: this.reactions.length,
        reactionTime: performance.now() - startTime,
      };
    }
  }

  /**
   * Get pipeline statistics
   */
  // Complexity: O(1)
  getStats(): MathResult<{ totalReactions: number; avgTime: number }> {
    const stats = this.tracker.getStats();
    return createMathResult({
      totalReactions: this.reactions.length,
      avgTime: stats.value.mean,
    }, stats.confidence, 'pipeline-stats');
  }
}

/**
 * Create a new transformation pipeline
 */
export function createPipeline<T>(): TransformPipeline<T, T> {
  return new TransformPipeline<T, T>();
}

// ═══════════════════════════════════════════════════════════════════════════
// ADAPTERS (Format Conversions)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Adapter interface for format conversions
 */
export interface Adapter<TFrom, TTo> {
  readonly sourceFormat: string;
  readonly targetFormat: string;
  // Complexity: O(1)
  adapt(source: TFrom): TTo;
  reverse?(target: TTo): TFrom;
}

/**
 * JSON to Map adapter
 */
export class JsonToMapAdapter implements Adapter<string, Map<string, unknown>> {
  readonly sourceFormat = 'json';
  readonly targetFormat = 'map';

  // Complexity: O(1)
  adapt(source: string): Map<string, unknown> {
    const parsed = JSON.parse(source);
    return new Map(Object.entries(parsed));
  }

  // Complexity: O(1)
  reverse(target: Map<string, unknown>): string {
    return JSON.stringify(Object.fromEntries(target));
  }
}

/**
 * Object to typed adapter with validation
 */
export class TypedAdapter<T> implements Adapter<unknown, T> {
  readonly sourceFormat = 'unknown';
  readonly targetFormat: string;
  private readonly validator: (input: unknown) => input is T;

  constructor(
    targetFormat: string,
    validator: (input: unknown) => input is T
  ) {
    this.targetFormat = targetFormat;
    this.validator = validator;
  }

  // Complexity: O(N) — potential recursive descent
  adapt(source: unknown): T {
    if (this.validator(source)) {
      return source;
    }
    throw new Error(`Invalid input for ${this.targetFormat}`);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// VALIDATORS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Schema definition for validation
 */
export interface SchemaDefinition {
  readonly type: 'object' | 'array' | 'string' | 'number' | 'boolean';
  readonly required?: string[];
  readonly properties?: Record<string, SchemaDefinition>;
  readonly items?: SchemaDefinition;
  readonly minLength?: number;
  readonly maxLength?: number;
  readonly minimum?: number;
  readonly maximum?: number;
  readonly pattern?: string;
}

/**
 * Schema validator
 */
export class SchemaValidator {
  private readonly schema: SchemaDefinition;

  constructor(schema: SchemaDefinition) {
    this.schema = schema;
  }

  // Complexity: O(1)
  validate(value: unknown, path = '): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    this.validateNode(value, this.schema, path, errors, warnings);

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      metadata: {
        checkedAt: Date.now(),
        schemaHash: contentHash(JSON.stringify(this.schema)),
      },
    };
  }

  // Complexity: O(N*M) — nested iteration detected
  private validateNode(
    value: unknown,
    schema: SchemaDefinition,
    path: string,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): void {
    // Type check
    const actualType = this.getType(value);
    if (actualType !== schema.type) {
      errors.push({
        path: path || 'root',
        message: `Expected ${schema.type}, got ${actualType}`,
        code: 'TYPE_MISMATCH',
      });
      return;
    }

    // Object validation
    if (schema.type === 'object' && schema.properties) {
      const obj = value as Record<string, unknown>;

      // Check required fields
      for (const required of schema.required ?? []) {
        if (!(required in obj)) {
          errors.push({
            path: `${path}.${required}`,
            message: `Required field missing: ${required}`,
            code: 'REQUIRED_MISSING',
          });
        }
      }

      // Validate properties
      for (const [key, propSchema] of Object.entries(schema.properties)) {
        if (key in obj) {
          this.validateNode(
            obj[key],
            propSchema,
            path ? `${path}.${key}` : key,
            errors,
            warnings
          );
        }
      }

      // Warn about extra properties
      for (const key of Object.keys(obj)) {
        if (!(key in schema.properties)) {
          warnings.push({
            path: `${path}.${key}`,
            message: `Unknown property: ${key}`,
            suggestion: 'Consider removing or adding to schema',
          });
        }
      }
    }

    // Array validation
    if (schema.type === 'array' && schema.items) {
      const arr = value as unknown[];
      arr.forEach((item, index) => {
        this.validateNode(
          item,
          schema.items!,
          `${path}[${index}]`,
          errors,
          warnings
        );
      });
    }

    // String validation
    if (schema.type === 'string') {
      const str = value as string;
      if (schema.minLength && str.length < schema.minLength) {
        errors.push({
          path,
          message: `String too short: min ${schema.minLength}`,
          code: 'STRING_TOO_SHORT',
        });
      }
      if (schema.maxLength && str.length > schema.maxLength) {
        errors.push({
          path,
          message: `String too long: max ${schema.maxLength}`,
          code: 'STRING_TOO_LONG',
        });
      }
      if (schema.pattern && !new RegExp(schema.pattern).test(str)) {
        errors.push({
          path,
          message: `String doesn't match pattern: ${schema.pattern}`,
          code: 'PATTERN_MISMATCH',
        });
      }
    }

    // Number validation
    if (schema.type === 'number') {
      const num = value as number;
      if (schema.minimum !== undefined && num < schema.minimum) {
        errors.push({
          path,
          message: `Number too small: min ${schema.minimum}`,
          code: 'NUMBER_TOO_SMALL',
        });
      }
      if (schema.maximum !== undefined && num > schema.maximum) {
        errors.push({
          path,
          message: `Number too large: max ${schema.maximum}`,
          code: 'NUMBER_TOO_LARGE',
        });
      }
    }
  }

  // Complexity: O(1)
  private getType(value: unknown): string {
    if (Array.isArray(value)) return 'array';
    if (value === null) return 'null';
    return typeof value;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// BINDINGS (System Connectors)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Protocol binding interface
 */
export interface ProtocolBinding<TRequest, TResponse> {
  readonly protocol: string;
  readonly version: string;
  // Complexity: O(1)
  send(request: TRequest): Promise<TResponse>;
  // Complexity: O(1)
  disconnect(): Promise<void>;
}

/**
 * HTTP binding configuration
 */
export interface HttpBindingConfig {
  readonly baseUrl: string;
  readonly timeout?: number;
  readonly headers?: Record<string, string>;
  readonly rateLimiter?: RateLimiter;
}

/**
 * HTTP protocol binding
 */
export class HttpBinding implements ProtocolBinding<Request, Response> {
  readonly protocol = 'http';
  readonly version = '1.1';
  private readonly config: HttpBindingConfig;
  private readonly tracker = new PerformanceTracker();

  constructor(config: HttpBindingConfig) {
    this.config = config;
  }

  // Complexity: O(1) — amortized
  async send(request: Request): Promise<Response> {
    // Check rate limit
    if (this.config.rateLimiter && !this.config.rateLimiter.tryConsume()) {
      throw new Error('Rate limit exceeded');
    }

    return this.tracker.time(async () => {
      const controller = new AbortController();
      const timeout = setTimeout(
        () => controller.abort(),
        this.config.timeout ?? 30000
      );

      try {
        const response = await fetch(request.url, {
          method: request.method,
          headers: {
            ...this.config.headers,
            ...Object.fromEntries(request.headers.entries()),
          },
          body: request.body,
          signal: controller.signal,
        });
        return response;
      } finally {
        // Complexity: O(1)
        clearTimeout(timeout);
      }
    });
  }

  // Complexity: O(1)
  async disconnect(): Promise<void> {
    // HTTP is stateless, nothing to disconnect
  }

  // Complexity: O(1)
  getPerformanceStats() {
    return this.tracker.getStats();
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SIMILARITY DETECTOR (for deduplication)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Content deduplication using similarity
 */
export class SimilarityDetector {
  private readonly fingerprints: Map<string, Set<number>> = new Map();
  private readonly threshold: number;

  constructor(similarityThreshold = 0.8) {
    this.threshold = similarityThreshold;
  }

  /**
   * Add content and return if it's a duplicate
   */
  // Complexity: O(N) — linear iteration
  addAndCheck(id: string, content: string): { isDuplicate: boolean; similarTo?: string } {
    const newFingerprint = similarityFingerprint(content);

    for (const [existingId, existingFp] of this.fingerprints) {
      const similarity = jaccardSimilarity(newFingerprint, existingFp);
      if (similarity >= this.threshold) {
        return { isDuplicate: true, similarTo: existingId };
      }
    }

    this.fingerprints.set(id, newFingerprint);
    return { isDuplicate: false };
  }

  /**
   * Find similar content
   */
  // Complexity: O(N log N) — sort operation
  findSimilar(content: string): Array<{ id: string; similarity: number }> {
    const targetFp = similarityFingerprint(content);
    const results: Array<{ id: string; similarity: number }> = [];

    for (const [id, fp] of this.fingerprints) {
      const similarity = jaccardSimilarity(targetFp, fp);
      if (similarity > 0.1) { // At least 10% similar
        results.push({ id, similarity });
      }
    }

    return results.sort((a, b) => b.similarity - a.similarity);
  }

  /**
   * Clear all fingerprints
   */
  // Complexity: O(1)
  clear(): void {
    this.fingerprints.clear();
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// LAYER METADATA
// ═══════════════════════════════════════════════════════════════════════════

export const LAYER_INFO = Object.freeze({
  name: 'CHEMISTRY',
  level: 3,
  description: 'Reactive Transformations - Reactions, Bindings, Conversions',
  principles: [
    'Depends on MATH and PHYSICS',
    'Pure transformations (input → output)',
    'Composable reaction chains',
    'Type-safe bindings',
  ],
  exports: ['BIOLOGY', 'REALITY'],
  imports: ['MATH', 'PHYSICS'],
});

export default {
  TransformPipeline,
  createPipeline,
  JsonToMapAdapter,
  TypedAdapter,
  SchemaValidator,
  HttpBinding,
  SimilarityDetector,
  LAYER_INFO,
};
