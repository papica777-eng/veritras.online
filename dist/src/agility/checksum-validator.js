"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * QAntum
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * @copyright 2025 Димитър Продромов (Dimitar Prodromov). All Rights Reserved.
 * @license PROPRIETARY AND CONFIDENTIAL
 *
 * This file is part of QAntum.
 * Unauthorized copying, modification, distribution, or use of this file,
 * via any medium, is strictly prohibited without express written permission.
 *
 * For licensing inquiries: dimitar.papazov@QAntum.dev
 * ═══════════════════════════════════════════════════════════════════════════════
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
exports.ChecksumValidator = void 0;
const crypto = __importStar(require("node:crypto"));
const node_fs_1 = require("node:fs");
const promises_1 = require("node:fs/promises");
const node_path_1 = require("node:path");
const node_events_1 = require("node:events");
/**
 * Checksum Validator
 *
 * Provides checksum generation and verification utilities.
 */
class ChecksumValidator extends node_events_1.EventEmitter {
    cache = new Map();
    cacheEnabled;
    operationCount = 0;
    startTime = Date.now();
    constructor(options = {}) {
        super();
        this.cacheEnabled = options.cacheEnabled ?? true;
    }
    /**
     * Generate SHA-256 hash for a string
     * @param data - String data
     */
    // Complexity: O(1)
    hashString(data) {
        this.operationCount++;
        return crypto.createHash('sha256').update(data, 'utf-8').digest('hex');
    }
    /**
     * Generate SHA-256 hash for a buffer
     * @param buffer - Buffer data
     */
    // Complexity: O(1)
    hashBuffer(buffer) {
        this.operationCount++;
        return crypto.createHash('sha256').update(buffer).digest('hex');
    }
    /**
     * Generate SHA-256 hash for any serializable data
     * @param data - Any serializable data
     */
    // Complexity: O(1) — lookup
    hashData(data) {
        const serialized = JSON.stringify(data);
        const hash = this.hashString(serialized);
        const id = `data-${Date.now()}-${hash.slice(0, 8)}`;
        const record = {
            id,
            hash,
            algorithm: 'sha256',
            size: Buffer.byteLength(serialized, 'utf-8'),
            generatedAt: new Date()
        };
        if (this.cacheEnabled) {
            this.cache.set(id, record);
        }
        return record;
    }
    /**
     * Generate SHA-256 hash for a file
     * @param filePath - File path
     */
    // Complexity: O(1) — lookup
    async hashFile(filePath) {
        this.operationCount++;
        return new Promise(async (resolve, reject) => {
            try {
                const fileStat = await (0, promises_1.stat)(filePath);
                const hash = crypto.createHash('sha256');
                const stream = (0, node_fs_1.createReadStream)(filePath);
                stream.on('data', (chunk) => hash.update(chunk));
                stream.on('error', reject);
                stream.on('end', () => {
                    const record = {
                        id: filePath,
                        path: filePath,
                        hash: hash.digest('hex'),
                        algorithm: 'sha256',
                        size: fileStat.size,
                        mtime: fileStat.mtime,
                        generatedAt: new Date()
                    };
                    if (this.cacheEnabled) {
                        this.cache.set(filePath, record);
                    }
                    this.emit('fileHashed', record);
                    // Complexity: O(1)
                    resolve(record);
                });
            }
            catch (error) {
                // Complexity: O(1)
                reject(error);
            }
        });
    }
    /**
     * Generate checksum manifest for a directory
     * @param dirPath - Directory path
     * @param recursive - Include subdirectories
     */
    // Complexity: O(N log N) — sort
    async generateManifest(dirPath, recursive = true) {
        const files = [];
        let totalSize = 0;
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.walkDirectory(dirPath, recursive, async (filePath) => {
            // SAFETY: async operation — wrap in try-catch for production resilience
            const checksum = await this.hashFile(filePath);
            files.push(checksum);
            totalSize += checksum.size;
            this.emit('manifestProgress', { path: filePath, count: files.length });
        });
        // Generate manifest hash from all file hashes
        //     const allHashes = files.map(f => f.hash).sort().join(');
        //     const manifestHash = this.hashString(allHashes);
        const manifest = {
            version: '19.0.0',
            generatedAt: new Date(),
            rootPath: dirPath,
            files,
            totalFiles: files.length,
            totalSize,
            manifestHash
        };
        this.emit('manifestGenerated', manifest);
        return manifest;
    }
    /**
     * Walk directory recursively
     */
    // Complexity: O(N) — loop
    async walkDirectory(dirPath, recursive, callback) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const entries = await (0, promises_1.readdir)(dirPath, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = (0, node_path_1.join)(dirPath, entry.name);
            if (entry.isFile()) {
                // SAFETY: async operation — wrap in try-catch for production resilience
                await callback(fullPath);
            }
            else if (entry.isDirectory() && recursive) {
                // SAFETY: async operation — wrap in try-catch for production resilience
                await this.walkDirectory(fullPath, recursive, callback);
            }
        }
    }
    /**
     * Verify a checksum
     * @param data - Data to verify
     * @param expectedHash - Expected hash
     */
    // Complexity: O(1)
    verifyData(data, expectedHash) {
        const actualHash = this.hashString(JSON.stringify(data));
        return actualHash === expectedHash;
    }
    /**
     * Verify a file checksum
     * @param filePath - File path
     * @param expectedHash - Expected hash
     */
    // Complexity: O(1)
    async verifyFile(filePath, expectedHash) {
        try {
            const checksum = await this.hashFile(filePath);
            return checksum.hash === expectedHash;
        }
        catch {
            return false;
        }
    }
    /**
     * Verify a manifest
     * @param manifest - Manifest to verify
     */
    // Complexity: O(N log N) — sort
    async verifyManifest(manifest) {
        const result = {
            valid: true,
            checked: 0,
            validCount: 0,
            invalidCount: 0,
            missingCount: 0,
            invalidItems: [],
            verifiedAt: new Date()
        };
        for (const file of manifest.files) {
            result.checked++;
            try {
                const actualChecksum = await this.hashFile(file.path);
                if (actualChecksum.hash === file.hash) {
                    result.validCount++;
                }
                else {
                    result.valid = false;
                    result.invalidCount++;
                    result.invalidItems.push({
                        id: file.path,
                        expected: file.hash,
                        actual: actualChecksum.hash,
                        reason: 'mismatch'
                    });
                }
            }
            catch (error) {
                result.valid = false;
                result.missingCount++;
                result.invalidItems.push({
                    id: file.path,
                    expected: file.hash,
                    actual: null,
                    reason: 'missing'
                });
            }
            this.emit('verifyProgress', {
                path: file.path,
                checked: result.checked,
                total: manifest.totalFiles
            });
        }
        // Verify manifest hash
        //     const allHashes = manifest.files.map(f => f.hash).sort().join(');
        //     const calculatedManifestHash = this.hashString(allHashes);
        if (calculatedManifestHash !== manifest.manifestHash) {
            result.valid = false;
            result.invalidItems.push({
                id: 'manifest',
                expected: manifest.manifestHash,
                actual: calculatedManifestHash,
                reason: 'mismatch'
            });
        }
        this.emit('verifyComplete', result);
        return result;
    }
    /**
     * Verify multiple checksums at once
     * @param records - Checksum records to verify
     * @param dataProvider - Function to get data by ID
     */
    // Complexity: O(N) — loop
    async verifyMultiple(records, dataProvider) {
        const result = {
            valid: true,
            checked: 0,
            validCount: 0,
            invalidCount: 0,
            missingCount: 0,
            invalidItems: [],
            verifiedAt: new Date()
        };
        for (const record of records) {
            result.checked++;
            try {
                const data = await dataProvider(record.id);
                const actualHash = this.hashString(JSON.stringify(data));
                if (actualHash === record.hash) {
                    result.validCount++;
                }
                else {
                    result.valid = false;
                    result.invalidCount++;
                    result.invalidItems.push({
                        id: record.id,
                        expected: record.hash,
                        actual: actualHash,
                        reason: 'mismatch'
                    });
                }
            }
            catch (error) {
                result.valid = false;
                result.missingCount++;
                result.invalidItems.push({
                    id: record.id,
                    expected: record.hash,
                    actual: null,
                    reason: 'error'
                });
            }
        }
        return result;
    }
    /**
     * Compare two hashes in constant time (timing-safe)
     * @param hash1 - First hash
     * @param hash2 - Second hash
     */
    // Complexity: O(1)
    compareHashes(hash1, hash2) {
        if (hash1.length !== hash2.length)
            return false;
        try {
            return crypto.timingSafeEqual(Buffer.from(hash1, 'hex'), Buffer.from(hash2, 'hex'));
        }
        catch {
            return false;
        }
    }
    /**
     * Get cached checksum
     * @param id - Record ID
     */
    // Complexity: O(1) — lookup
    getCached(id) {
        return this.cache.get(id);
    }
    /**
     * Clear cache
     */
    // Complexity: O(1)
    clearCache() {
        this.cache.clear();
    }
    /**
     * Get statistics
     */
    // Complexity: O(1)
    getStats() {
        return {
            operationCount: this.operationCount,
            cacheSize: this.cache.size,
            uptime: Date.now() - this.startTime
        };
    }
}
exports.ChecksumValidator = ChecksumValidator;
exports.default = ChecksumValidator;
