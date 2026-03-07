/**
 * ModuleRegistry — Qantum Module
 * @module ModuleRegistry
 * @path core/ModuleRegistry.ts
 * @auto-documented BrutalDocEngine v2.1
 */

import * as fs from 'fs';
import * as path from 'path';

export interface ModuleMetadata {
  name: string;
  version: string;
  description: string;
  dependencies: string[];
  category: string;
  status: 'loaded' | 'error' | 'disabled';
}

export class ModuleRegistry {
  private modules: Map<string, ModuleMetadata> = new Map();
  private baseDir: string;

  constructor(baseDir: string) {
    this.baseDir = baseDir;
  }

  // Complexity: O(N) — linear iteration
  async discoverModules(): Promise<void> {
    const moduleDirs = [
      'brain',
      'core',
      'security',
      'skills',
      'healing',
      'intelligence',
      'physics',
      'ArbitrageOrchestrator',
      'BrainRouter',
      'ChronosEngine',
      'CognitiveCircularGuard',
      'ContextInjector',
      'EternalWatchdog',
    ];

    for (const dir of moduleDirs) {
      const fullPath = path.isAbsolute(dir) ? dir : path.join(this.baseDir, dir);
      if (fs.existsSync(fullPath)) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.scanDirectory(fullPath, dir);
      }
    }
  }

  // Complexity: O(N) — linear iteration
  private async scanDirectory(dirPath: string, category: string): Promise<void> {
    const files = fs.readdirSync(dirPath);

    for (const file of files) {
      const fullPath = path.join(dirPath, file);
      const stat = fs.statSync(fullPath);

      if (stat.isFile() && (file.endsWith('.ts') || file.endsWith('.js'))) {
        const moduleName = path.basename(file, path.extname(file));
        this.modules.set(moduleName, {
          name: moduleName,
          version: '1.0.0', // Default, should read from file eventually
          description: `Module from ${category}`,
          dependencies: [],
          category,
          status: 'loaded',
        });
      }
    }
  }

  // Complexity: O(1) — hash/map lookup
  getModule(name: string): ModuleMetadata | undefined {
    return this.modules.get(name);
  }

  // Complexity: O(1)
  getAllModules(): ModuleMetadata[] {
    return Array.from(this.modules.values());
  }

  // Complexity: O(N) — linear iteration
  getModulesByCategory(category: string): ModuleMetadata[] {
    return this.getAllModules().filter((m) => m.category === category);
  }

  // Complexity: O(N) — linear iteration
  getHealthStatus(): { total: number; loaded: number; errors: number } {
    const all = this.getAllModules();
    return {
      total: all.length,
      loaded: all.filter((m) => m.status === 'loaded').length,
      errors: all.filter((m) => m.status === 'error').length,
    };
  }
}
