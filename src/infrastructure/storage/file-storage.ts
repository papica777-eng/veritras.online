/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                               ║
 * ║   QAntum FILE STORAGE                                                         ║
 * ║   "Unified file storage operations"                                           ║
 * ║                                                                               ║
 * ║   TODO B #31 - Storage: File Operations                                       ║
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

export interface FileInfo {
  path: string;
  name: string;
  extension: string;
  size: number;
  createdAt: Date;
  modifiedAt: Date;
  isDirectory: boolean;
  isFile: boolean;
}

export interface DirectoryInfo {
  path: string;
  name: string;
  files: FileInfo[];
  directories: DirectoryInfo[];
  totalSize: number;
  fileCount: number;
}

export interface WriteOptions {
  encoding?: BufferEncoding;
  mode?: number;
  flag?: string;
  append?: boolean;
}

export interface ReadOptions {
  encoding?: BufferEncoding;
  flag?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// FILE STORAGE
// ═══════════════════════════════════════════════════════════════════════════════

export class FileStorage {
  private static instance: FileStorage;
  private basePath: string;

  private constructor() {
    this.basePath = process.cwd();
  }

  static getInstance(): FileStorage {
    if (!FileStorage.instance) {
      FileStorage.instance = new FileStorage();
    }
    return FileStorage.instance;
  }

  /**
   * Set base path
   */
  // Complexity: O(1)
  setBasePath(basePath: string): this {
    this.basePath = basePath;
    return this;
  }

  /**
   * Get base path
   */
  // Complexity: O(1)
  getBasePath(): string {
    return this.basePath;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // READ OPERATIONS
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Read file as string
   */
  // Complexity: O(1)
  async read(filePath: string, options?: ReadOptions): Promise<string> {
    const fullPath = this.resolvePath(filePath);
    return fs.promises.readFile(fullPath, {
      encoding: options?.encoding || 'utf-8',
      flag: options?.flag,
    });
  }

  /**
   * Read file sync
   */
  // Complexity: O(1)
  readSync(filePath: string, options?: ReadOptions): string {
    const fullPath = this.resolvePath(filePath);
    return fs.readFileSync(fullPath, {
      encoding: options?.encoding || 'utf-8',
      flag: options?.flag,
    });
  }

  /**
   * Read file as JSON
   */
  async readJSON<T = any>(filePath: string): Promise<T> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    const content = await this.read(filePath);
    return JSON.parse(content);
  }

  /**
   * Read file as buffer
   */
  // Complexity: O(1)
  async readBuffer(filePath: string): Promise<Buffer> {
    const fullPath = this.resolvePath(filePath);
    return fs.promises.readFile(fullPath);
  }

  /**
   * Read file lines
   */
  // Complexity: O(1)
  async readLines(filePath: string): Promise<string[]> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    const content = await this.read(filePath);
    return content.split(/\r?\n/);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // WRITE OPERATIONS
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Write file
   */
  // Complexity: O(1)
  async write(filePath: string, content: string | Buffer, options?: WriteOptions): Promise<void> {
    const fullPath = this.resolvePath(filePath);
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.ensureDir(path.dirname(fullPath));

    if (options?.append) {
      // SAFETY: async operation — wrap in try-catch for production resilience
      await fs.promises.appendFile(fullPath, content, {
        encoding: options?.encoding,
        mode: options?.mode,
        flag: options?.flag,
      });
    } else {
      // SAFETY: async operation — wrap in try-catch for production resilience
      await fs.promises.writeFile(fullPath, content, {
        encoding: options?.encoding,
        mode: options?.mode,
        flag: options?.flag,
      });
    }
  }

  /**
   * Write file sync
   */
  // Complexity: O(1)
  writeSync(filePath: string, content: string | Buffer, options?: WriteOptions): void {
    const fullPath = this.resolvePath(filePath);
    this.ensureDirSync(path.dirname(fullPath));

    if (options?.append) {
      fs.appendFileSync(fullPath, content, {
        encoding: options?.encoding,
        mode: options?.mode,
        flag: options?.flag,
      });
    } else {
      fs.writeFileSync(fullPath, content, {
        encoding: options?.encoding,
        mode: options?.mode,
        flag: options?.flag,
      });
    }
  }

  /**
   * Write JSON file
   */
  // Complexity: O(1)
  async writeJSON(filePath: string, data: any, pretty: boolean = true): Promise<void> {
    const content = pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.write(filePath, content);
  }

  /**
   * Append to file
   */
  // Complexity: O(1)
  async append(filePath: string, content: string | Buffer): Promise<void> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.write(filePath, content, { append: true });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FILE OPERATIONS
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Check if file exists
   */
  // Complexity: O(1)
  async exists(filePath: string): Promise<boolean> {
    const fullPath = this.resolvePath(filePath);
    try {
      await fs.promises.access(fullPath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if exists sync
   */
  // Complexity: O(1)
  existsSync(filePath: string): boolean {
    const fullPath = this.resolvePath(filePath);
    return fs.existsSync(fullPath);
  }

  /**
   * Delete file
   */
  // Complexity: O(1)
  async delete(filePath: string): Promise<void> {
    const fullPath = this.resolvePath(filePath);
    // SAFETY: async operation — wrap in try-catch for production resilience
    await fs.promises.unlink(fullPath);
  }

  /**
   * Copy file
   */
  // Complexity: O(1)
  async copy(src: string, dest: string): Promise<void> {
    const srcPath = this.resolvePath(src);
    const destPath = this.resolvePath(dest);
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.ensureDir(path.dirname(destPath));
    // SAFETY: async operation — wrap in try-catch for production resilience
    await fs.promises.copyFile(srcPath, destPath);
  }

  /**
   * Move file
   */
  // Complexity: O(1)
  async move(src: string, dest: string): Promise<void> {
    const srcPath = this.resolvePath(src);
    const destPath = this.resolvePath(dest);
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.ensureDir(path.dirname(destPath));
    // SAFETY: async operation — wrap in try-catch for production resilience
    await fs.promises.rename(srcPath, destPath);
  }

  /**
   * Get file info
   */
  // Complexity: O(1)
  async info(filePath: string): Promise<FileInfo> {
    const fullPath = this.resolvePath(filePath);
    // SAFETY: async operation — wrap in try-catch for production resilience
    const stats = await fs.promises.stat(fullPath);
    const parsed = path.parse(fullPath);

    return {
      path: fullPath,
      name: parsed.name,
      extension: parsed.ext,
      size: stats.size,
      createdAt: stats.birthtime,
      modifiedAt: stats.mtime,
      isDirectory: stats.isDirectory(),
      isFile: stats.isFile(),
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // DIRECTORY OPERATIONS
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Create directory
   */
  // Complexity: O(1)
  async mkdir(dirPath: string): Promise<void> {
    const fullPath = this.resolvePath(dirPath);
    // SAFETY: async operation — wrap in try-catch for production resilience
    await fs.promises.mkdir(fullPath, { recursive: true });
  }

  /**
   * Ensure directory exists
   */
  // Complexity: O(1)
  async ensureDir(dirPath: string): Promise<void> {
    const fullPath = this.resolvePath(dirPath);
    // SAFETY: async operation — wrap in try-catch for production resilience
    await fs.promises.mkdir(fullPath, { recursive: true });
  }

  /**
   * Ensure directory exists sync
   */
  // Complexity: O(1)
  ensureDirSync(dirPath: string): void {
    const fullPath = this.resolvePath(dirPath);
    fs.mkdirSync(fullPath, { recursive: true });
  }

  /**
   * List directory contents
   */
  // Complexity: O(1)
  async list(dirPath: string): Promise<string[]> {
    const fullPath = this.resolvePath(dirPath);
    return fs.promises.readdir(fullPath);
  }

  /**
   * List files with info
   */
  // Complexity: O(N) — loop
  async listFiles(dirPath: string): Promise<FileInfo[]> {
    const fullPath = this.resolvePath(dirPath);
    // SAFETY: async operation — wrap in try-catch for production resilience
    const names = await fs.promises.readdir(fullPath);

    const files: FileInfo[] = [];
    for (const name of names) {
      const filePath = path.join(fullPath, name);
      // SAFETY: async operation — wrap in try-catch for production resilience
      const info = await this.info(filePath);
      files.push(info);
    }

    return files;
  }

  /**
   * Read directory recursively
   */
  // Complexity: O(1)
  async readDirRecursive(dirPath: string): Promise<DirectoryInfo> {
    const fullPath = this.resolvePath(dirPath);
    return this.readDirRecursiveInternal(fullPath);
  }

  // Complexity: O(N) — loop
  private async readDirRecursiveInternal(dirPath: string): Promise<DirectoryInfo> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    const names = await fs.promises.readdir(dirPath);
    const result: DirectoryInfo = {
      path: dirPath,
      name: path.basename(dirPath),
      files: [],
      directories: [],
      totalSize: 0,
      fileCount: 0,
    };

    for (const name of names) {
      const itemPath = path.join(dirPath, name);
      // SAFETY: async operation — wrap in try-catch for production resilience
      const stats = await fs.promises.stat(itemPath);

      if (stats.isDirectory()) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const subDir = await this.readDirRecursiveInternal(itemPath);
        result.directories.push(subDir);
        result.totalSize += subDir.totalSize;
        result.fileCount += subDir.fileCount;
      } else {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const info = await this.info(itemPath);
        result.files.push(info);
        result.totalSize += stats.size;
        result.fileCount++;
      }
    }

    return result;
  }

  /**
   * Remove directory
   */
  // Complexity: O(1)
  async rmdir(dirPath: string, recursive: boolean = false): Promise<void> {
    const fullPath = this.resolvePath(dirPath);
    // SAFETY: async operation — wrap in try-catch for production resilience
    await fs.promises.rm(fullPath, { recursive, force: recursive });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // GLOB OPERATIONS
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Find files by pattern
   */
  // Complexity: O(1)
  async glob(pattern: string, dirPath?: string): Promise<string[]> {
    const searchPath = dirPath ? this.resolvePath(dirPath) : this.basePath;
    const files: string[] = [];

    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.globRecursive(searchPath, pattern, files);
    return files;
  }

  // Complexity: O(N) — loop
  private async globRecursive(dirPath: string, pattern: string, results: string[]): Promise<void> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
    const regex = this.globToRegex(pattern);

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      const relativePath = path.relative(this.basePath, fullPath);

      if (entry.isDirectory()) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.globRecursive(fullPath, pattern, results);
      } else if (regex.test(relativePath) || regex.test(entry.name)) {
        results.push(fullPath);
      }
    }
  }

  // Complexity: O(1)
  private globToRegex(pattern: string): RegExp {
    const escaped = pattern
      .replace(/[.+^${}()|[\]\\]/g, '\\$&')
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.');
    return new RegExp(`^${escaped}$`);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // UTILITIES
  // ─────────────────────────────────────────────────────────────────────────

  // Complexity: O(1)
  private resolvePath(filePath: string): string {
    if (path.isAbsolute(filePath)) {
      return filePath;
    }
    return path.join(this.basePath, filePath);
  }

  /**
   * Join paths
   */
  // Complexity: O(1)
  join(...paths: string[]): string {
    return path.join(...paths);
  }

  /**
   * Get directory name
   */
  // Complexity: O(1)
  dirname(filePath: string): string {
    return path.dirname(filePath);
  }

  /**
   * Get base name
   */
  // Complexity: O(1)
  basename(filePath: string, ext?: string): string {
    return path.basename(filePath, ext);
  }

  /**
   * Get extension
   */
  // Complexity: O(1)
  extname(filePath: string): string {
    return path.extname(filePath);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export const getFileStorage = (): FileStorage => FileStorage.getInstance();

// Quick file operations
export const file = {
  read: (path: string) => FileStorage.getInstance().read(path),
  write: (path: string, content: string | Buffer) => FileStorage.getInstance().write(path, content),
  readJSON: <T>(path: string) => FileStorage.getInstance().readJSON<T>(path),
  writeJSON: (path: string, data: any) => FileStorage.getInstance().writeJSON(path, data),
  exists: (path: string) => FileStorage.getInstance().exists(path),
  delete: (path: string) => FileStorage.getInstance().delete(path),
  copy: (src: string, dest: string) => FileStorage.getInstance().copy(src, dest),
  move: (src: string, dest: string) => FileStorage.getInstance().move(src, dest),
  mkdir: (path: string) => FileStorage.getInstance().mkdir(path),
  list: (path: string) => FileStorage.getInstance().list(path),
  glob: (pattern: string, dir?: string) => FileStorage.getInstance().glob(pattern, dir),
};

export default FileStorage;
