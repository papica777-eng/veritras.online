import * as fs from 'fs';
import * as path from 'path';
import { pathToFileURL } from 'url';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * QANTUM DYNAMIC LOADER
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Dynamically discovers and loads TypeScript modules across the project.
 * Useful for the Singularity engine to load capabilities without hardcoded paths.
 */

const SKIP = new Set(['node_modules', '.git', 'dist', 'coverage', 'out', '.venv', '__pycache__']);

export class DynamicLoader {
  /**
   * Searches for all files matching the export name in the project.
   */
  static findModuleFiles(exportName: string, root = process.cwd(), maxDepth = 10): string[] {
    const target = exportName.replace(/[-_\s]/g, '').toLowerCase();
    const out: string[] = [];
    
    function scan(dir: string, depth: number): void {
      if (depth > maxDepth) return;
      try {
        for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
          const full = path.join(dir, e.name);
          if (e.isDirectory()) {
            if (!SKIP.has(e.name)) scan(full, depth + 1);
          } else if (
            e.isFile() && 
            e.name.endsWith('.ts') && 
            !e.name.endsWith('.d.ts') && 
            e.name.toLowerCase().replace(/[-_.]/g, '').includes(target)
          ) {
            out.push(full);
          }
        }
      } catch {}
    }
    
    scan(root, 0);
    return out;
  }

  /**
   * Loads a module by searching the project and trying known paths.
   */
  static async loadModule<T>(exportName: string, knownPaths: string[] = []): Promise<T | null> {
    const found = this.findModuleFiles(exportName);
    const known = knownPaths.map((p) => path.resolve(process.cwd(), p));
    const pathsToTry = found.length ? [...found, ...known] : known;
    
    for (const modPath of pathsToTry) {
      try {
        const importPath = path.isAbsolute(modPath) ? pathToFileURL(modPath).href : modPath;
        const mod = await import(importPath);
        return (mod[exportName] ?? mod.default) as T;
      } catch (err) {
        // Silently fail and try the next path
      }
    }
    return null;
  }
}
