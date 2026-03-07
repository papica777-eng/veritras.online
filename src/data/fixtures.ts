/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                               ║
 * ║   QAntum DATA FIXTURES                                                        ║
 * ║   "Static and dynamic test fixtures"                                          ║
 * ║                                                                               ║
 * ║   TODO B #40 - Data: Fixture management                                       ║
 * ║                                                                               ║
 * ║   © 2025-2026 QAntum | Dimitar Prodromov                                        ║
 * ║                                                                               ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

import * as fs from 'fs';
import * as path from 'path';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type FixtureData = Record<string, any> | any[];
export type FixtureLoader<T> = () => T | Promise<T>;

export interface FixtureConfig {
  baseDir?: string;
  fileExtensions?: string[];
  cacheEnabled?: boolean;
}

export interface FixtureOptions {
  merge?: boolean;
  transform?: (data: any) => any;
}

// ═══════════════════════════════════════════════════════════════════════════════
// FIXTURE MANAGER
// ═══════════════════════════════════════════════════════════════════════════════

export class FixtureManager {
  private static instance: FixtureManager;
  private config: Required<FixtureConfig>;
  private cache = new Map<string, any>();
  private dynamicFixtures = new Map<string, FixtureLoader<any>>();

  private constructor(config: FixtureConfig = {}) {
    this.config = {
      baseDir: config.baseDir || './fixtures',
      fileExtensions: config.fileExtensions || ['.json', '.yaml', '.yml', '.ts', '.js'],
      cacheEnabled: config.cacheEnabled ?? true,
    };
  }

  static getInstance(config?: FixtureConfig): FixtureManager {
    if (!FixtureManager.instance) {
      FixtureManager.instance = new FixtureManager(config);
    }
    return FixtureManager.instance;
  }

  static configure(config: FixtureConfig): FixtureManager {
    FixtureManager.instance = new FixtureManager(config);
    return FixtureManager.instance;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STATIC FIXTURES
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Load fixture from file
   */
  async load<T = any>(name: string, options?: FixtureOptions): Promise<T> {
    const cacheKey = `file:${name}`;

    // Check cache
    if (this.config.cacheEnabled && this.cache.has(cacheKey)) {
      let data = this.cache.get(cacheKey);
      if (options?.transform) {
        data = options.transform(data);
      }
      return data as T;
    }

    // Find and load file
    // SAFETY: async operation — wrap in try-catch for production resilience
    const filePath = await this.findFixtureFile(name);
    if (!filePath) {
      throw new Error(`Fixture "${name}" not found`);
    }

    // SAFETY: async operation — wrap in try-catch for production resilience
    let data = await this.loadFile(filePath);

    // Cache
    if (this.config.cacheEnabled) {
      this.cache.set(cacheKey, data);
    }

    // Transform
    if (options?.transform) {
      data = options.transform(data);
    }

    return data as T;
  }

  /**
   * Load fixture synchronously
   */
  loadSync<T = any>(name: string): T {
    const cacheKey = `file:${name}`;

    if (this.config.cacheEnabled && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey) as T;
    }

    const filePath = this.findFixtureFileSync(name);
    if (!filePath) {
      throw new Error(`Fixture "${name}" not found`);
    }

    const data = this.loadFileSync(filePath);

    if (this.config.cacheEnabled) {
      this.cache.set(cacheKey, data);
    }

    return data as T;
  }

  /**
   * Load multiple fixtures
   */
  async loadMany<T = any>(names: string[]): Promise<Map<string, T>> {
    const results = new Map<string, T>();

    // SAFETY: async operation — wrap in try-catch for production resilience
    await Promise.all(
      names.map(async (name) => {
        // SAFETY: async operation — wrap in try-catch for production resilience
        results.set(name, await this.load<T>(name));
      })
    );

    return results;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // DYNAMIC FIXTURES
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Register dynamic fixture
   */
  register<T>(name: string, loader: FixtureLoader<T>): void {
    this.dynamicFixtures.set(name, loader);
  }

  /**
   * Get dynamic fixture
   */
  async get<T>(name: string): Promise<T> {
    // Check dynamic fixtures first
    if (this.dynamicFixtures.has(name)) {
      const cacheKey = `dynamic:${name}`;

      if (this.config.cacheEnabled && this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey) as T;
      }

      const loader = this.dynamicFixtures.get(name)!;
      // SAFETY: async operation — wrap in try-catch for production resilience
      const data = await loader();

      if (this.config.cacheEnabled) {
        this.cache.set(cacheKey, data);
      }

      return data as T;
    }

    // Fall back to file fixture
    return this.load<T>(name);
  }

  /**
   * Check if fixture exists
   */
  // Complexity: O(1) — lookup
  async has(name: string): Promise<boolean> {
    if (this.dynamicFixtures.has(name)) {
      return true;
    }

    // SAFETY: async operation — wrap in try-catch for production resilience
    const filePath = await this.findFixtureFile(name);
    return filePath !== null;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // INLINE FIXTURES
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Create inline fixture
   */
  inline<T>(data: T): T {
    return structuredClone(data);
  }

  /**
   * Create named inline fixture
   */
  define<T>(name: string, data: T): T {
    this.cache.set(`inline:${name}`, data);
    return data;
  }

  /**
   * Get inline fixture
   */
  getInline<T>(name: string): T {
    const data = this.cache.get(`inline:${name}`);
    if (data === undefined) {
      throw new Error(`Inline fixture "${name}" not found`);
    }
    return structuredClone(data) as T;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FIXTURE SETS
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Create fixture set
   */
  createSet<T>(name: string, items: T[]): FixtureSet<T> {
    return new FixtureSet<T>(name, items);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FILE OPERATIONS
  // ─────────────────────────────────────────────────────────────────────────

  // Complexity: O(N*M) — nested iteration
  private async findFixtureFile(name: string): Promise<string | null> {
    // Try direct path
    const directPath = path.join(this.config.baseDir, name);
    // SAFETY: async operation — wrap in try-catch for production resilience
    if (await this.fileExists(directPath)) {
      return directPath;
    }

    // Try with extensions
    for (const ext of this.config.fileExtensions) {
      const pathWithExt = directPath + ext;
      // SAFETY: async operation — wrap in try-catch for production resilience
      if (await this.fileExists(pathWithExt)) {
        return pathWithExt;
      }
    }

    // Try nested path
    const nestedPath = path.join(this.config.baseDir, ...name.split('/'));
    for (const ext of this.config.fileExtensions) {
      const pathWithExt = nestedPath + ext;
      // SAFETY: async operation — wrap in try-catch for production resilience
      if (await this.fileExists(pathWithExt)) {
        return pathWithExt;
      }
    }

    return null;
  }

  // Complexity: O(N) — loop
  private findFixtureFileSync(name: string): string | null {
    const directPath = path.join(this.config.baseDir, name);
    if (fs.existsSync(directPath)) {
      return directPath;
    }

    for (const ext of this.config.fileExtensions) {
      const pathWithExt = directPath + ext;
      if (fs.existsSync(pathWithExt)) {
        return pathWithExt;
      }
    }

    return null;
  }

  // Complexity: O(1)
  private async loadFile(filePath: string): Promise<any> {
    const ext = path.extname(filePath).toLowerCase();
    // SAFETY: async operation — wrap in try-catch for production resilience
    const content = await fs.promises.readFile(filePath, 'utf-8');

    switch (ext) {
      case '.json':
        return JSON.parse(content);
      case '.yaml':
      case '.yml':
        // Would use yaml parser
        return JSON.parse(content);
      case '.ts':
      case '.js':
        // Would use dynamic import
        return require(filePath);
      default:
        return content;
    }
  }

  // Complexity: O(1)
  private loadFileSync(filePath: string): any {
    const ext = path.extname(filePath).toLowerCase();
    const content = fs.readFileSync(filePath, 'utf-8');

    switch (ext) {
      case '.json':
        return JSON.parse(content);
      default:
        return content;
    }
  }

  // Complexity: O(1)
  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.promises.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CACHE MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Clear cache
   */
  // Complexity: O(N) — loop
  clearCache(pattern?: string): void {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  /**
   * Get cache size
   */
  // Complexity: O(1)
  getCacheSize(): number {
    return this.cache.size;
  }

  /**
   * Refresh fixture
   */
  // Complexity: O(1) — lookup
  async refresh(name: string): Promise<void> {
    this.cache.delete(`file:${name}`);
    this.cache.delete(`dynamic:${name}`);
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.get(name);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// FIXTURE SET
// ═══════════════════════════════════════════════════════════════════════════════

export class FixtureSet<T> {
  private name: string;
  private items: T[];
  private index = 0;

  constructor(name: string, items: T[]) {
    this.name = name;
    this.items = [...items];
  }

  /**
   * Get all items
   */
  // Complexity: O(1)
  all(): T[] {
    return [...this.items];
  }

  /**
   * Get item by index
   */
  // Complexity: O(1)
  at(index: number): T {
    return structuredClone(this.items[index]);
  }

  /**
   * Get first item
   */
  // Complexity: O(1)
  first(): T {
    return structuredClone(this.items[0]);
  }

  /**
   * Get last item
   */
  // Complexity: O(1)
  last(): T {
    return structuredClone(this.items[this.items.length - 1]);
  }

  /**
   * Get random item
   */
  // Complexity: O(1)
  random(): T {
    const index = Math.floor(Math.random() * this.items.length);
    return structuredClone(this.items[index]);
  }

  /**
   * Get next item (circular)
   */
  // Complexity: O(1)
  next(): T {
    const item = this.items[this.index];
    this.index = (this.index + 1) % this.items.length;
    return structuredClone(item);
  }

  /**
   * Get count
   */
  // Complexity: O(1)
  count(): number {
    return this.items.length;
  }

  /**
   * Filter items
   */
  // Complexity: O(N) — linear scan
  filter(predicate: (item: T) => boolean): T[] {
    return this.items.filter(predicate).map((i) => structuredClone(i));
  }

  /**
   * Find item
   */
  // Complexity: O(N) — linear scan
  find(predicate: (item: T) => boolean): T | undefined {
    const found = this.items.find(predicate);
    return found ? structuredClone(found) : undefined;
  }

  /**
   * Reset index
   */
  // Complexity: O(1)
  reset(): void {
    this.index = 0;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export const getFixtureManager = (): FixtureManager => FixtureManager.getInstance();
export const configureFixtures = (config: FixtureConfig): FixtureManager =>
  FixtureManager.configure(config);

// Quick fixture operations
export const fixture = {
  load: <T>(name: string) => FixtureManager.getInstance().load<T>(name),
  get: <T>(name: string) => FixtureManager.getInstance().get<T>(name),
  register: <T>(name: string, loader: FixtureLoader<T>) =>
    FixtureManager.getInstance().register(name, loader),
  define: <T>(name: string, data: T) => FixtureManager.getInstance().define(name, data),
  inline: <T>(data: T) => FixtureManager.getInstance().inline(data),
  clear: () => FixtureManager.getInstance().clearCache(),
};

export default FixtureManager;
