/**
 * paths — Qantum Module
 * @module paths
 * @path src/utils/paths.ts
 * @auto-documented BrutalDocEngine v2.1
 */

import * as path from 'path';

/**
 * 🛠️ Path Utilities
 * Ensures cross-platform path compatibility.
 */

export function pathJoin(...parts: string[]): string {
  return path.join(...parts);
}

export function getRelativePath(from: string, to: string): string {
  return path.relative(from, to);
}

export function getDirname(filePath: string): string {
  return path.dirname(filePath);
}

export function getFilename(filePath: string): string {
  return path.basename(filePath);
}

export function getExtension(filePath: string): string {
  return path.extname(filePath);
}

export const ROOT_DIR = path.resolve(process.cwd());
