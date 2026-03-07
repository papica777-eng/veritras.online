/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                               ║
 * ║   QAntum KEY-VALUE STORE                                                      ║
 * ║   "Fast and flexible key-value storage"                                       ║
 * ║                                                                               ║
 * ║   TODO B #30 - Storage: Key-Value Store                                       ║
 * ║                                                                               ║
 * ║   © 2025-2026 QAntum | Dimitar Prodromov                                        ║
 * ║                                                                               ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface StoreEntry<T = any> {
  value: T;
  createdAt: number;
  updatedAt: number;
  expiresAt?: number;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface StoreConfig {
  maxSize?: number;
  defaultTTL?: number;
  cleanupInterval?: number;
  serializer?: (value: any) => string;
  deserializer?: (data: string) => any;
}

export interface StoreStats {
  size: number;
  hits: number;
  misses: number;
  hitRate: number;
  expired: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// KEY-VALUE STORE
// ═══════════════════════════════════════════════════════════════════════════════

export class KeyValueStore<T = any> {
  private data: Map<string, StoreEntry<T>> = new Map();
  private config: StoreConfig;
  private cleanupTimer?: ReturnType<typeof setInterval>;
  private stats = { hits: 0, misses: 0, expired: 0 };

  constructor(config: StoreConfig = {}) {
    this.config = {
      maxSize: config.maxSize || 10000,
      defaultTTL: config.defaultTTL,
      cleanupInterval: config.cleanupInterval || 60000,
      serializer: config.serializer || JSON.stringify,
      deserializer: config.deserializer || JSON.parse,
    };

    if (this.config.cleanupInterval) {
      this.startCleanup();
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // BASIC OPERATIONS
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Set value
   */
  // Complexity: O(1)
  set(
    key: string,
    value: T,
    options: { ttl?: number; tags?: string[]; metadata?: Record<string, any> } = {}
  ): this {
    const now = Date.now();

    // Evict if at capacity
    if (this.data.size >= this.config.maxSize! && !this.data.has(key)) {
      this.evictOldest();
    }

    const ttl = options.ttl ?? this.config.defaultTTL;

    this.data.set(key, {
      value,
      createdAt: now,
      updatedAt: now,
      expiresAt: ttl ? now + ttl : undefined,
      tags: options.tags,
      metadata: options.metadata,
    });

    return this;
  }

  /**
   * Get value
   */
  // Complexity: O(1) — lookup
  get(key: string): T | undefined {
    const entry = this.data.get(key);

    if (!entry) {
      this.stats.misses++;
      return undefined;
    }

    // Check expiration
    if (entry.expiresAt && entry.expiresAt < Date.now()) {
      this.data.delete(key);
      this.stats.misses++;
      this.stats.expired++;
      return undefined;
    }

    this.stats.hits++;
    return entry.value;
  }

  /**
   * Get with default
   */
  // Complexity: O(1) — lookup
  getOrDefault(key: string, defaultValue: T): T {
    const value = this.get(key);
    return value !== undefined ? value : defaultValue;
  }

  /**
   * Get or set
   */
  // Complexity: O(1) — lookup
  getOrSet(key: string, factory: () => T, options?: { ttl?: number; tags?: string[] }): T {
    const existing = this.get(key);
    if (existing !== undefined) {
      return existing;
    }

    const value = factory();
    this.set(key, value, options);
    return value;
  }

  /**
   * Check if key exists
   */
  // Complexity: O(1) — lookup
  has(key: string): boolean {
    const entry = this.data.get(key);
    if (!entry) return false;
    if (entry.expiresAt && entry.expiresAt < Date.now()) {
      this.data.delete(key);
      return false;
    }
    return true;
  }

  /**
   * Delete key
   */
  // Complexity: O(1)
  delete(key: string): boolean {
    return this.data.delete(key);
  }

  /**
   * Clear all data
   */
  // Complexity: O(1)
  clear(): void {
    this.data.clear();
    this.stats = { hits: 0, misses: 0, expired: 0 };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // BULK OPERATIONS
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Set multiple values
   */
  // Complexity: O(N) — loop
  setMany(entries: Array<{ key: string; value: T; ttl?: number; tags?: string[] }>): this {
    for (const entry of entries) {
      this.set(entry.key, entry.value, { ttl: entry.ttl, tags: entry.tags });
    }
    return this;
  }

  /**
   * Get multiple values
   */
  // Complexity: O(N) — loop
  getMany(keys: string[]): Map<string, T | undefined> {
    const results = new Map<string, T | undefined>();
    for (const key of keys) {
      results.set(key, this.get(key));
    }
    return results;
  }

  /**
   * Delete multiple keys
   */
  // Complexity: O(N) — loop
  deleteMany(keys: string[]): number {
    let count = 0;
    for (const key of keys) {
      if (this.delete(key)) count++;
    }
    return count;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // TAG OPERATIONS
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Get keys by tag
   */
  // Complexity: O(N) — loop
  getByTag(tag: string): Map<string, T> {
    const results = new Map<string, T>();
    const now = Date.now();

    for (const [key, entry] of this.data) {
      if (entry.tags?.includes(tag)) {
        if (!entry.expiresAt || entry.expiresAt > now) {
          results.set(key, entry.value);
        }
      }
    }

    return results;
  }

  /**
   * Delete by tag
   */
  // Complexity: O(N) — loop
  deleteByTag(tag: string): number {
    let count = 0;

    for (const [key, entry] of this.data) {
      if (entry.tags?.includes(tag)) {
        this.data.delete(key);
        count++;
      }
    }

    return count;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // EXPIRATION
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Set TTL for key
   */
  // Complexity: O(1) — lookup
  setTTL(key: string, ttl: number): boolean {
    const entry = this.data.get(key);
    if (!entry) return false;

    entry.expiresAt = Date.now() + ttl;
    return true;
  }

  /**
   * Get remaining TTL
   */
  // Complexity: O(1) — lookup
  getTTL(key: string): number | undefined {
    const entry = this.data.get(key);
    if (!entry || !entry.expiresAt) return undefined;

    const remaining = entry.expiresAt - Date.now();
    return remaining > 0 ? remaining : 0;
  }

  /**
   * Remove expiration
   */
  // Complexity: O(1) — lookup
  persist(key: string): boolean {
    const entry = this.data.get(key);
    if (!entry) return false;

    delete entry.expiresAt;
    return true;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // ITERATION
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Get all keys
   */
  // Complexity: O(1)
  keys(): string[] {
    return Array.from(this.data.keys());
  }

  /**
   * Get all values
   */
  // Complexity: O(N) — loop
  values(): T[] {
    const now = Date.now();
    const results: T[] = [];

    for (const entry of this.data.values()) {
      if (!entry.expiresAt || entry.expiresAt > now) {
        results.push(entry.value);
      }
    }

    return results;
  }

  /**
   * Get all entries
   */
  // Complexity: O(N) — loop
  entries(): Array<[string, T]> {
    const now = Date.now();
    const results: Array<[string, T]> = [];

    for (const [key, entry] of this.data) {
      if (!entry.expiresAt || entry.expiresAt > now) {
        results.push([key, entry.value]);
      }
    }

    return results;
  }

  /**
   * Iterate over entries
   */
  // Complexity: O(N) — loop
  forEach(callback: (value: T, key: string) => void): void {
    const now = Date.now();

    for (const [key, entry] of this.data) {
      if (!entry.expiresAt || entry.expiresAt > now) {
        // Complexity: O(1)
        callback(entry.value, key);
      }
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SEARCH
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Find by predicate
   */
  // Complexity: O(N) — loop
  find(predicate: (value: T, key: string) => boolean): T | undefined {
    const now = Date.now();

    for (const [key, entry] of this.data) {
      if (!entry.expiresAt || entry.expiresAt > now) {
        if (predicate(entry.value, key)) {
          return entry.value;
        }
      }
    }

    return undefined;
  }

  /**
   * Filter by predicate
   */
  // Complexity: O(N) — loop
  filter(predicate: (value: T, key: string) => boolean): Map<string, T> {
    const now = Date.now();
    const results = new Map<string, T>();

    for (const [key, entry] of this.data) {
      if (!entry.expiresAt || entry.expiresAt > now) {
        if (predicate(entry.value, key)) {
          results.set(key, entry.value);
        }
      }
    }

    return results;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // MAINTENANCE
  // ─────────────────────────────────────────────────────────────────────────

  // Complexity: O(1)
  private startCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  /**
   * Clean up expired entries
   */
  // Complexity: O(N) — loop
  cleanup(): number {
    const now = Date.now();
    let count = 0;

    for (const [key, entry] of this.data) {
      if (entry.expiresAt && entry.expiresAt < now) {
        this.data.delete(key);
        count++;
      }
    }

    this.stats.expired += count;
    return count;
  }

  // Complexity: O(N) — loop
  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.data) {
      if (entry.updatedAt < oldestTime) {
        oldestTime = entry.updatedAt;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.data.delete(oldestKey);
    }
  }

  /**
   * Destroy store
   */
  // Complexity: O(1)
  destroy(): void {
    if (this.cleanupTimer) {
      // Complexity: O(1)
      clearInterval(this.cleanupTimer);
    }
    this.data.clear();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STATISTICS
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Get store statistics
   */
  // Complexity: O(1)
  getStats(): StoreStats {
    const total = this.stats.hits + this.stats.misses;
    return {
      size: this.data.size,
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: total > 0 ? this.stats.hits / total : 0,
      expired: this.stats.expired,
    };
  }

  /**
   * Get size
   */
  get size(): number {
    return this.data.size;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export const createStore = <T>(config?: StoreConfig): KeyValueStore<T> =>
  new KeyValueStore<T>(config);

export default KeyValueStore;
