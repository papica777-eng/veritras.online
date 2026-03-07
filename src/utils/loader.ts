/**
 * ╔═══════════════════════════════════════════════════════════════════════════════════════════════════╗
 * ║   QAntum v15.1 - Type-Safe Module Loader                                                     ║
 * ║   Safely loads modules with full TypeScript support                                               ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════════════════╝
 */

const SILENT = process.env.QAntum_SILENT === 'true';

// Cache for loaded modules
const moduleCache = new Map<string, unknown>();

/**
 * Safely require a module with error handling
 * @param modulePath - Path to the module
 * @param moduleName - Display name for logging
 * @returns The module or null if not available
 */
export function safeRequire<T = unknown>(modulePath: string, moduleName: string): T | null {
  if (moduleCache.has(modulePath)) {
    return moduleCache.get(modulePath) as T | null;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require(modulePath) as T;
    moduleCache.set(modulePath, mod);
    return mod;
  } catch (e) {
    if (!SILENT) {
      console.warn(`⚠️ ${moduleName} not available`);
    }
    moduleCache.set(modulePath, null);
    return null;
  }
}

/**
 * Safely extract keys from a module
 * @param mod - The module object
 * @param keys - Keys to extract
 * @returns Object with extracted values (null if not found)
 */
export function safeGet<T extends Record<string, unknown>>(
  mod: T | null,
  keys: (keyof T)[]
): Record<keyof T, unknown> {
  const result = {} as Record<keyof T, unknown>;

  for (const key of keys) {
    result[key] = mod && key in mod ? mod[key] : null;
  }

  return result;
}

/**
 * Lazy module loader - returns a function that loads on first call
 * @param modulePath - Path to the module
 * @param moduleName - Display name for logging
 * @returns Function that returns the module when called
 */
export function lazyRequire<T = unknown>(
  modulePath: string,
  moduleName: string
): () => T | null {
  let loaded = false;
  let cached: T | null = null;

  return (): T | null => {
    if (!loaded) {
      cached = safeRequire<T>(modulePath, moduleName);
      loaded = true;
    }
    return cached;
  };
}

/**
 * Lazy property getter - returns a function that gets property on first call
 * @param getModule - Function that returns the module
 * @param key - Property key to get
 * @returns Function that returns the property value when called
 */
export function lazyGet<T extends object, K extends keyof T>(
  getModule: () => T | null,
  key: K
): () => T[K] | null {
  return (): T[K] | null => {
    const mod = getModule();
    return mod && key in mod ? mod[key] : null;
  };
}

/**
 * Check if a module is available without loading it
 * @param modulePath - Path to the module
 * @returns True if module exists
 */
export function moduleExists(modulePath: string): boolean {
  try {
    require.resolve(modulePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Clear the module cache
 */
export function clearCache(): void {
  moduleCache.clear();
}

/**
 * Get cache statistics
 * @returns Object with cache stats
 */
export function getCacheStats(): { size: number; modules: string[] } {
  return {
    size: moduleCache.size,
    modules: Array.from(moduleCache.keys()),
  };
}
