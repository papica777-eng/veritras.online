"use strict";
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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.file = exports.getFileStorage = exports.FileStorage = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// ═══════════════════════════════════════════════════════════════════════════════
// FILE STORAGE
// ═══════════════════════════════════════════════════════════════════════════════
class FileStorage {
    static instance;
    basePath;
    constructor() {
        this.basePath = process.cwd();
    }
    static getInstance() {
        if (!FileStorage.instance) {
            FileStorage.instance = new FileStorage();
        }
        return FileStorage.instance;
    }
    /**
     * Set base path
     */
    // Complexity: O(1)
    setBasePath(basePath) {
        this.basePath = basePath;
        return this;
    }
    /**
     * Get base path
     */
    // Complexity: O(1)
    getBasePath() {
        return this.basePath;
    }
    // ─────────────────────────────────────────────────────────────────────────
    // READ OPERATIONS
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Read file as string
     */
    // Complexity: O(1)
    async read(filePath, options) {
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
    readSync(filePath, options) {
        const fullPath = this.resolvePath(filePath);
        return fs.readFileSync(fullPath, {
            encoding: options?.encoding || 'utf-8',
            flag: options?.flag,
        });
    }
    /**
     * Read file as JSON
     */
    async readJSON(filePath) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const content = await this.read(filePath);
        return JSON.parse(content);
    }
    /**
     * Read file as buffer
     */
    // Complexity: O(1)
    async readBuffer(filePath) {
        const fullPath = this.resolvePath(filePath);
        return fs.promises.readFile(fullPath);
    }
    /**
     * Read file lines
     */
    // Complexity: O(1)
    async readLines(filePath) {
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
    async write(filePath, content, options) {
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
        }
        else {
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
    writeSync(filePath, content, options) {
        const fullPath = this.resolvePath(filePath);
        this.ensureDirSync(path.dirname(fullPath));
        if (options?.append) {
            fs.appendFileSync(fullPath, content, {
                encoding: options?.encoding,
                mode: options?.mode,
                flag: options?.flag,
            });
        }
        else {
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
    async writeJSON(filePath, data, pretty = true) {
        const content = pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.write(filePath, content);
    }
    /**
     * Append to file
     */
    // Complexity: O(1)
    async append(filePath, content) {
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
    async exists(filePath) {
        const fullPath = this.resolvePath(filePath);
        try {
            await fs.promises.access(fullPath);
            return true;
        }
        catch {
            return false;
        }
    }
    /**
     * Check if exists sync
     */
    // Complexity: O(1)
    existsSync(filePath) {
        const fullPath = this.resolvePath(filePath);
        return fs.existsSync(fullPath);
    }
    /**
     * Delete file
     */
    // Complexity: O(1)
    async delete(filePath) {
        const fullPath = this.resolvePath(filePath);
        // SAFETY: async operation — wrap in try-catch for production resilience
        await fs.promises.unlink(fullPath);
    }
    /**
     * Copy file
     */
    // Complexity: O(1)
    async copy(src, dest) {
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
    async move(src, dest) {
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
    async info(filePath) {
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
    async mkdir(dirPath) {
        const fullPath = this.resolvePath(dirPath);
        // SAFETY: async operation — wrap in try-catch for production resilience
        await fs.promises.mkdir(fullPath, { recursive: true });
    }
    /**
     * Ensure directory exists
     */
    // Complexity: O(1)
    async ensureDir(dirPath) {
        const fullPath = this.resolvePath(dirPath);
        // SAFETY: async operation — wrap in try-catch for production resilience
        await fs.promises.mkdir(fullPath, { recursive: true });
    }
    /**
     * Ensure directory exists sync
     */
    // Complexity: O(1)
    ensureDirSync(dirPath) {
        const fullPath = this.resolvePath(dirPath);
        fs.mkdirSync(fullPath, { recursive: true });
    }
    /**
     * List directory contents
     */
    // Complexity: O(1)
    async list(dirPath) {
        const fullPath = this.resolvePath(dirPath);
        return fs.promises.readdir(fullPath);
    }
    /**
     * List files with info
     */
    // Complexity: O(N) — loop
    async listFiles(dirPath) {
        const fullPath = this.resolvePath(dirPath);
        // SAFETY: async operation — wrap in try-catch for production resilience
        const names = await fs.promises.readdir(fullPath);
        const files = [];
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
    async readDirRecursive(dirPath) {
        const fullPath = this.resolvePath(dirPath);
        return this.readDirRecursiveInternal(fullPath);
    }
    // Complexity: O(N) — loop
    async readDirRecursiveInternal(dirPath) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const names = await fs.promises.readdir(dirPath);
        const result = {
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
            }
            else {
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
    async rmdir(dirPath, recursive = false) {
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
    async glob(pattern, dirPath) {
        const searchPath = dirPath ? this.resolvePath(dirPath) : this.basePath;
        const files = [];
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.globRecursive(searchPath, pattern, files);
        return files;
    }
    // Complexity: O(N) — loop
    async globRecursive(dirPath, pattern, results) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
        const regex = this.globToRegex(pattern);
        for (const entry of entries) {
            const fullPath = path.join(dirPath, entry.name);
            const relativePath = path.relative(this.basePath, fullPath);
            if (entry.isDirectory()) {
                // SAFETY: async operation — wrap in try-catch for production resilience
                await this.globRecursive(fullPath, pattern, results);
            }
            else if (regex.test(relativePath) || regex.test(entry.name)) {
                results.push(fullPath);
            }
        }
    }
    // Complexity: O(1)
    globToRegex(pattern) {
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
    resolvePath(filePath) {
        if (path.isAbsolute(filePath)) {
            return filePath;
        }
        return path.join(this.basePath, filePath);
    }
    /**
     * Join paths
     */
    // Complexity: O(1)
    join(...paths) {
        return path.join(...paths);
    }
    /**
     * Get directory name
     */
    // Complexity: O(1)
    dirname(filePath) {
        return path.dirname(filePath);
    }
    /**
     * Get base name
     */
    // Complexity: O(1)
    basename(filePath, ext) {
        return path.basename(filePath, ext);
    }
    /**
     * Get extension
     */
    // Complexity: O(1)
    extname(filePath) {
        return path.extname(filePath);
    }
}
exports.FileStorage = FileStorage;
// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════
const getFileStorage = () => FileStorage.getInstance();
exports.getFileStorage = getFileStorage;
// Quick file operations
exports.file = {
    read: (path) => FileStorage.getInstance().read(path),
    write: (path, content) => FileStorage.getInstance().write(path, content),
    readJSON: (path) => FileStorage.getInstance().readJSON(path),
    writeJSON: (path, data) => FileStorage.getInstance().writeJSON(path, data),
    exists: (path) => FileStorage.getInstance().exists(path),
    delete: (path) => FileStorage.getInstance().delete(path),
    copy: (src, dest) => FileStorage.getInstance().copy(src, dest),
    move: (src, dest) => FileStorage.getInstance().move(src, dest),
    mkdir: (path) => FileStorage.getInstance().mkdir(path),
    list: (path) => FileStorage.getInstance().list(path),
    glob: (pattern, dir) => FileStorage.getInstance().glob(pattern, dir),
};
exports.default = FileStorage;
