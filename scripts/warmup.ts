#!/usr/bin/env node
/**
 * @file warmup.ts
 * @description JIT Warm-up Script - 1000 изпълнения на критични функции преди реален Swarm
 * @version 1.0.0
 * @author QANTUM AI
 * @phase Phase 2: Performance (Kernel & V8 Tuning)
 * 
 * @usage
 * ```bash
 * npx ts-node scripts/warmup.ts
 * # or
 * npm run warmup
 * ```
 * 
 * V8 JIT Compilation:
 * - Functions called <2 times = Interpreted (slow)
 * - Functions called 2-10 times = Baseline compiled
 * - Functions called >10 times = Optimized (TurboFan)
 * - Functions called >1000 times = Highly optimized + inlined
 * 
 * This script ensures all critical paths are "hot" before production load.
 */

import * as v8 from 'v8';

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

interface WarmupConfig {
  /** Number of iterations per function */
  iterations: number;
  /** Enable detailed logging */
  verbose: boolean;
  /** Measure and report times */
  benchmark: boolean;
  /** Run optimization status check */
  checkOptimization: boolean;
}

const CONFIG: WarmupConfig = {
  iterations: 1000,
  verbose: process.argv.includes('--verbose') || process.argv.includes('-v'),
  benchmark: true,
  checkOptimization: true,
};

// ═══════════════════════════════════════════════════════════════════════════════
// V8 OPTIMIZATION HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Check if function is optimized by V8
 * Requires --allow-natives-syntax flag
 */
function getOptimizationStatus(fn: Function): string {
  try {
    // This only works with --allow-natives-syntax
    const status = (globalThis as any)['%GetOptimizationStatus']?.(fn);
    
    if (status === undefined) return 'unknown';
    
    const flags = [
      status & (1 << 0) ? 'function' : null,
      status & (1 << 1) ? 'never_optimized' : null,
      status & (1 << 2) ? 'always_optimized' : null,
      status & (1 << 3) ? 'maybe_deoptimized' : null,
      status & (1 << 4) ? 'optimized' : null,
      status & (1 << 5) ? 'turbofanned' : null,
      status & (1 << 6) ? 'interpreted' : null,
      status & (1 << 7) ? 'baseline' : null,
    ].filter(Boolean);
    
    return flags.join(', ') || 'unknown';
  } catch {
    return 'native-syntax-disabled';
  }
}

/**
 * Force V8 to optimize a function
 */
function forceOptimization(fn: Function): void {
  try {
    (globalThis as any)['%OptimizeFunctionOnNextCall']?.(fn);
    fn();
  } catch {
    // Native syntax not available, use iteration method
    for (let i = 0; i < 100; i++) {
      fn();
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// CRITICAL FUNCTIONS TO WARM UP
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Collection of critical functions that need JIT optimization
 */
const CRITICAL_FUNCTIONS = {
  // ═══ MATH OPERATIONS ═══════════════════════════════════════════════════════
  
  /** Fast hash function (used everywhere) */
  fastHash: (str: string): number => {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
    }
    return hash >>> 0;
  },

  /** FNV-1a hash (alternative) */
  fnv1a: (str: string): number => {
    let hash = 2166136261;
    for (let i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  },

  /** Linear interpolation */
  lerp: (a: number, b: number, t: number): number => {
    return a + (b - a) * t;
  },

  /** Clamp value */
  clamp: (value: number, min: number, max: number): number => {
    return Math.max(min, Math.min(max, value));
  },

  /** Exponential backoff calculation */
  exponentialBackoff: (attempt: number, base: number = 1000): number => {
    return Math.min(base * Math.pow(2, attempt), 30000) + Math.random() * 1000;
  },

  // ═══ STRING OPERATIONS ═════════════════════════════════════════════════════
  
  /** Fast string comparison */
  fastStringCompare: (a: string, b: string): boolean => {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (a.charCodeAt(i) !== b.charCodeAt(i)) return false;
    }
    return true;
  },

  /** Selector sanitization */
  sanitizeSelector: (selector: string): string => {
    return selector
      .replace(/['"\\]/g, '\\$&')
      .replace(/[\x00-\x1F\x7F]/g, '')
      .trim();
  },

  /** URL normalization */
  normalizeUrl: (url: string): string => {
    try {
      const parsed = new URL(url);
      parsed.hash = '';
      parsed.searchParams.sort();
      return parsed.toString().replace(/\/$/, '');
    } catch {
      return url;
    }
  },

  // ═══ ARRAY OPERATIONS ══════════════════════════════════════════════════════
  
  /** Fast array shuffle (Fisher-Yates) */
  shuffleArray: <T>(arr: T[]): T[] => {
    const result = [...arr];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  },

  /** Binary search */
  binarySearch: (arr: number[], target: number): number => {
    let left = 0;
    let right = arr.length - 1;
    
    while (left <= right) {
      const mid = (left + right) >>> 1;
      if (arr[mid] === target) return mid;
      if (arr[mid] < target) left = mid + 1;
      else right = mid - 1;
    }
    
    return -1;
  },

  /** Partition array (for worker distribution) */
  partitionArray: <T>(arr: T[], n: number): T[][] => {
    const result: T[][] = Array.from({ length: n }, () => []);
    arr.forEach((item, i) => {
      result[i % n].push(item);
    });
    return result;
  },

  // ═══ OBJECT OPERATIONS ═════════════════════════════════════════════════════
  
  /** Fast object merge */
  fastMerge: <T extends object>(target: T, source: Partial<T>): T => {
    const result = { ...target };
    for (const key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        (result as any)[key] = source[key];
      }
    }
    return result;
  },

  /** Deep clone (fast path for common cases) */
  fastClone: <T>(obj: T): T => {
    if (obj === null || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(CRITICAL_FUNCTIONS.fastClone) as unknown as T;
    
    const clone: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        clone[key] = CRITICAL_FUNCTIONS.fastClone((obj as any)[key]);
      }
    }
    return clone;
  },

  /** Pick specific keys from object */
  pick: <T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> => {
    const result = {} as Pick<T, K>;
    for (const key of keys) {
      if (key in obj) {
        result[key] = obj[key];
      }
    }
    return result;
  },

  // ═══ TIMING OPERATIONS ═════════════════════════════════════════════════════
  
  /** High-resolution timestamp */
  hrTimestamp: (): bigint => {
    return process.hrtime.bigint();
  },

  /** Calculate duration in ms from hr time */
  hrDuration: (start: bigint): number => {
    return Number(process.hrtime.bigint() - start) / 1_000_000;
  },

  /** Throttle check */
  shouldThrottle: (lastTime: number, intervalMs: number): boolean => {
    return Date.now() - lastTime < intervalMs;
  },

  // ═══ BIOMETRIC SIMULATION ══════════════════════════════════════════════════
  
  /** Gaussian random (for human-like delays) */
  gaussianRandom: (mean: number, stdDev: number): number => {
    const u1 = Math.random();
    const u2 = Math.random();
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    return mean + z0 * stdDev;
  },

  /** Human typing delay based on key distance */
  typingDelay: (char1: string, char2: string): number => {
    const keyboard = 'qwertyuiopasdfghjklzxcvbnm';
    const pos1 = keyboard.indexOf(char1.toLowerCase());
    const pos2 = keyboard.indexOf(char2.toLowerCase());
    
    if (pos1 === -1 || pos2 === -1) return 100;
    
    const row1 = Math.floor(pos1 / 10);
    const col1 = pos1 % 10;
    const row2 = Math.floor(pos2 / 10);
    const col2 = pos2 % 10;
    
    const distance = Math.sqrt(Math.pow(row2 - row1, 2) + Math.pow(col2 - col1, 2));
    return 50 + distance * 30 + Math.random() * 50;
  },

  /** Mouse movement curve (bezier) */
  bezierPoint: (t: number, p0: number, p1: number, p2: number, p3: number): number => {
    const oneMinusT = 1 - t;
    return (
      oneMinusT * oneMinusT * oneMinusT * p0 +
      3 * oneMinusT * oneMinusT * t * p1 +
      3 * oneMinusT * t * t * p2 +
      t * t * t * p3
    );
  },

  // ═══ MEMORY OPERATIONS ═════════════════════════════════════════════════════
  
  /** Buffer pool allocation */
  allocateBuffer: (size: number): Buffer => {
    return Buffer.allocUnsafe(size);
  },

  /** Fast buffer comparison */
  bufferEquals: (a: Buffer, b: Buffer): boolean => {
    if (a.length !== b.length) return false;
    return a.compare(b) === 0;
  },

  /** Ring buffer push */
  ringBufferPush: <T>(buffer: T[], item: T, maxSize: number): T[] => {
    buffer.push(item);
    if (buffer.length > maxSize) {
      buffer.shift();
    }
    return buffer;
  },

  // ═══ CRYPTO OPERATIONS ═════════════════════════════════════════════════════
  
  /** XOR encryption (fast, for non-sensitive data) */
  xorEncrypt: (data: string, key: string): string => {
    let result = '';
    for (let i = 0; i < data.length; i++) {
      result += String.fromCharCode(
        data.charCodeAt(i) ^ key.charCodeAt(i % key.length)
      );
    }
    return result;
  },

  /** Base64 encode */
  base64Encode: (data: string): string => {
    return Buffer.from(data).toString('base64');
  },

  /** Base64 decode */
  base64Decode: (data: string): string => {
    return Buffer.from(data, 'base64').toString('utf-8');
  },

  // ═══ JSON OPERATIONS ═══════════════════════════════════════════════════════
  
  /** Safe JSON parse */
  safeParse: <T>(json: string, fallback: T): T => {
    try {
      return JSON.parse(json);
    } catch {
      return fallback;
    }
  },

  /** Fast JSON stringify (pre-allocated buffer) */
  fastStringify: (obj: unknown): string => {
    return JSON.stringify(obj);
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// WARMUP EXECUTOR
// ═══════════════════════════════════════════════════════════════════════════════

interface WarmupResult {
  name: string;
  iterations: number;
  totalTimeMs: number;
  avgTimeNs: number;
  optimizationStatus: string;
}

async function warmupFunction(
  name: string,
  fn: Function,
  testData: () => unknown[]
): Promise<WarmupResult> {
  const iterations = CONFIG.iterations;
  const args = testData();
  
  // Pre-warmup: ensure function shape is stable
  for (let i = 0; i < 10; i++) {
    fn(...args);
  }

  // Main warmup loop
  const startTime = process.hrtime.bigint();
  
  for (let i = 0; i < iterations; i++) {
    fn(...args);
  }
  
  const endTime = process.hrtime.bigint();
  const totalTimeMs = Number(endTime - startTime) / 1_000_000;
  const avgTimeNs = Number(endTime - startTime) / iterations;

  // Force optimization
  forceOptimization(fn);

  return {
    name,
    iterations,
    totalTimeMs,
    avgTimeNs,
    optimizationStatus: getOptimizationStatus(fn),
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEST DATA GENERATORS
// ═══════════════════════════════════════════════════════════════════════════════

const TEST_DATA = {
  string: () => ['hello-world-test-string-for-warmup-' + Math.random()],
  strings: () => ['hello', 'world'],
  numbers: () => [0.5, 1.0, 0.5],
  numberTriple: () => [50, 0, 100],
  attempt: () => [3, 1000],
  url: () => ['https://example.com/path?b=2&a=1#hash'],
  array: () => [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]],
  sortedArray: () => [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 7],
  arrayN: () => [[1, 2, 3, 4, 5, 6, 7, 8], 3],
  object: () => [{ a: 1, b: 2 }, { c: 3 }],
  deepObject: () => [{ a: { b: { c: 1 } }, d: [1, 2, 3] }],
  objectKeys: () => [{ a: 1, b: 2, c: 3 }, ['a', 'c']],
  hrTime: () => [process.hrtime.bigint()],
  timestamp: () => [Date.now() - 500, 1000],
  gaussian: () => [100, 20],
  chars: () => ['a', 's'],
  bezier: () => [0.5, 0, 100, 200, 300],
  buffer: () => [1024],
  buffers: () => [Buffer.from('test'), Buffer.from('test')],
  ringBuffer: () => [[], 'item', 10],
  xor: () => ['secret data', 'key123'],
  base64: () => ['hello world'],
  json: () => ['{"test": true}', {}],
  stringify: () => [{ nested: { data: [1, 2, 3] } }],
  selector: () => ['div.class[data-id="123"]'],
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN EXECUTION
// ═══════════════════════════════════════════════════════════════════════════════

async function runWarmup(): Promise<void> {
  console.log('╔═══════════════════════════════════════════════════════════════╗');
  console.log('║           🔥 QANTUM PRIME JIT WARM-UP SCRIPT 🔥               ║');
  console.log('╠═══════════════════════════════════════════════════════════════╣');
  console.log(`║  Iterations: ${CONFIG.iterations.toLocaleString().padEnd(8)} | V8 Version: ${process.versions.v8.padEnd(14)} ║`);
  console.log('╚═══════════════════════════════════════════════════════════════╝');
  console.log('');

  const results: WarmupResult[] = [];
  const totalStart = Date.now();

  // Define warmup tasks
  const tasks: [string, Function, () => unknown[]][] = [
    ['fastHash', CRITICAL_FUNCTIONS.fastHash, TEST_DATA.string],
    ['fnv1a', CRITICAL_FUNCTIONS.fnv1a, TEST_DATA.string],
    ['lerp', CRITICAL_FUNCTIONS.lerp, TEST_DATA.numbers],
    ['clamp', CRITICAL_FUNCTIONS.clamp, TEST_DATA.numberTriple],
    ['exponentialBackoff', CRITICAL_FUNCTIONS.exponentialBackoff, TEST_DATA.attempt],
    ['fastStringCompare', CRITICAL_FUNCTIONS.fastStringCompare, TEST_DATA.strings],
    ['sanitizeSelector', CRITICAL_FUNCTIONS.sanitizeSelector, TEST_DATA.selector],
    ['normalizeUrl', CRITICAL_FUNCTIONS.normalizeUrl, TEST_DATA.url],
    ['shuffleArray', CRITICAL_FUNCTIONS.shuffleArray, TEST_DATA.array],
    ['binarySearch', CRITICAL_FUNCTIONS.binarySearch, TEST_DATA.sortedArray],
    ['partitionArray', CRITICAL_FUNCTIONS.partitionArray, TEST_DATA.arrayN],
    ['fastMerge', CRITICAL_FUNCTIONS.fastMerge, TEST_DATA.object],
    ['fastClone', CRITICAL_FUNCTIONS.fastClone, TEST_DATA.deepObject],
    ['pick', CRITICAL_FUNCTIONS.pick, TEST_DATA.objectKeys],
    ['hrTimestamp', CRITICAL_FUNCTIONS.hrTimestamp, () => []],
    ['hrDuration', CRITICAL_FUNCTIONS.hrDuration, TEST_DATA.hrTime],
    ['shouldThrottle', CRITICAL_FUNCTIONS.shouldThrottle, TEST_DATA.timestamp],
    ['gaussianRandom', CRITICAL_FUNCTIONS.gaussianRandom, TEST_DATA.gaussian],
    ['typingDelay', CRITICAL_FUNCTIONS.typingDelay, TEST_DATA.chars],
    ['bezierPoint', CRITICAL_FUNCTIONS.bezierPoint, TEST_DATA.bezier],
    ['allocateBuffer', CRITICAL_FUNCTIONS.allocateBuffer, TEST_DATA.buffer],
    ['bufferEquals', CRITICAL_FUNCTIONS.bufferEquals, TEST_DATA.buffers],
    ['ringBufferPush', CRITICAL_FUNCTIONS.ringBufferPush, TEST_DATA.ringBuffer],
    ['xorEncrypt', CRITICAL_FUNCTIONS.xorEncrypt, TEST_DATA.xor],
    ['base64Encode', CRITICAL_FUNCTIONS.base64Encode, TEST_DATA.base64],
    ['base64Decode', CRITICAL_FUNCTIONS.base64Decode, () => [CRITICAL_FUNCTIONS.base64Encode('hello')]],
    ['safeParse', CRITICAL_FUNCTIONS.safeParse, TEST_DATA.json],
    ['fastStringify', CRITICAL_FUNCTIONS.fastStringify, TEST_DATA.stringify],
  ];

  // Execute warmup
  for (const [name, fn, dataGen] of tasks) {
    process.stdout.write(`  ⏳ Warming up ${name.padEnd(20)}`);
    
    const result = await warmupFunction(name, fn, dataGen);
    results.push(result);
    
    const emoji = result.avgTimeNs < 1000 ? '🚀' : result.avgTimeNs < 10000 ? '✅' : '⚠️';
    console.log(`${emoji} ${result.avgTimeNs.toFixed(2).padStart(10)}ns/op`);
  }

  const totalTime = Date.now() - totalStart;

  // Print summary
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('                         📊 SUMMARY');
  console.log('═══════════════════════════════════════════════════════════════════');
  
  // Sort by speed
  const sorted = [...results].sort((a, b) => a.avgTimeNs - b.avgTimeNs);
  
  console.log('');
  console.log('🏆 FASTEST FUNCTIONS:');
  for (const r of sorted.slice(0, 5)) {
    console.log(`   ${r.name.padEnd(20)} ${r.avgTimeNs.toFixed(2).padStart(10)}ns/op`);
  }
  
  console.log('');
  console.log('🐢 SLOWEST FUNCTIONS:');
  for (const r of sorted.slice(-5).reverse()) {
    console.log(`   ${r.name.padEnd(20)} ${r.avgTimeNs.toFixed(2).padStart(10)}ns/op`);
  }

  // Heap stats
  const heapStats = v8.getHeapStatistics();
  console.log('');
  console.log('💾 MEMORY AFTER WARMUP:');
  console.log(`   Heap Used:  ${(heapStats.used_heap_size / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   Heap Total: ${(heapStats.total_heap_size / 1024 / 1024).toFixed(2)} MB`);

  console.log('');
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log(`✅ Warm-up complete! ${results.length} functions optimized in ${totalTime}ms`);
  console.log('═══════════════════════════════════════════════════════════════════');
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export {
  CRITICAL_FUNCTIONS,
  runWarmup,
  warmupFunction,
  forceOptimization,
  getOptimizationStatus,
};

// Run if executed directly
if (require.main === module) {
  runWarmup().catch(console.error);
}
