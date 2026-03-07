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
exports.NeuralVault = void 0;
const crypto = __importStar(require("node:crypto"));
const zlib = __importStar(require("node:zlib"));
const node_util_1 = require("node:util");
const promises_1 = require("node:fs/promises");
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const node_events_1 = require("node:events");
const gzip = (0, node_util_1.promisify)(zlib.gzip);
const gunzip = (0, node_util_1.promisify)(zlib.gunzip);
/**
 * PBKDF2 configuration
 */
const PBKDF2_CONFIG = {
    iterations: 100000,
    keyLength: 32, // 256 bits for AES-256
    digest: 'sha512'
};
/**
 * Current vault version
 */
const VAULT_VERSION = 1;
/**
 * Neural Vault
 *
 * Provides encrypted storage for sensitive QAntum data.
 */
class NeuralVault extends node_events_1.EventEmitter {
    config;
    derivedKey = null;
    salt = null;
    manifest = null;
    entries = new Map();
    syncStatus;
    machineId;
    operationCount = 0;
    startTime = Date.now();
    constructor(config = {}) {
        super();
        this.config = {
            enabled: config.enabled ?? true,
            algorithm: config.algorithm ?? 'aes-256-gcm',
            vaultPath: config.vaultPath ?? './data/vault.encrypted',
            autoSyncInterval: config.autoSyncInterval ?? 0,
            cloudEndpoint: config.cloudEndpoint ?? '',
            compression: config.compression ?? true
        };
        this.syncStatus = {
            isSyncing: false,
            pendingChanges: 0
        };
        this.machineId = this.generateMachineId();
    }
    /**
     * Initialize the vault with a password
     * @param password - Master password for encryption
     * @param existingVault - Load existing vault if present
     */
    // Complexity: O(1) — amortized
    async initialize(password, existingVault = true) {
        if (!this.config.enabled) {
            throw new Error('Neural Vault is disabled');
        }
        // Generate or load salt
        if (existingVault && (0, node_fs_1.existsSync)(this.config.vaultPath)) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.loadVault(password);
        }
        else {
            this.salt = crypto.randomBytes(32);
            // SAFETY: async operation — wrap in try-catch for production resilience
            this.derivedKey = await this.deriveKey(password, this.salt);
            // Create initial manifest
            this.manifest = {
                version: '19.0.0',
                machineId: this.machineId,
                createdAt: new Date(),
                entryCount: 0,
                totalSize: 0,
                manifestChecksum: ''
            };
            this.manifest.manifestChecksum = this.calculateChecksum(JSON.stringify(this.manifest));
        }
        this.emit('initialized', { machineId: this.machineId });
    }
    /**
     * Derive encryption key from password using PBKDF2
     */
    // Complexity: O(1)
    async deriveKey(password, salt) {
        return new Promise((resolve, reject) => {
            crypto.pbkdf2(password, salt, PBKDF2_CONFIG.iterations, PBKDF2_CONFIG.keyLength, PBKDF2_CONFIG.digest, (err, derivedKey) => {
                if (err)
                    reject(err);
                else
                    resolve(derivedKey);
            });
        });
    }
    /**
     * Encrypt data using AES-256-GCM
     * @param data - Data to encrypt
     */
    // Complexity: O(N)
    async encrypt(data) {
        if (!this.derivedKey || !this.salt) {
            throw new Error('Vault not initialized');
        }
        this.operationCount++;
        // Serialize and optionally compress
        let serialized = JSON.stringify(data);
        if (this.config.compression) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            const compressed = await gzip(Buffer.from(serialized, 'utf-8'));
            serialized = compressed.toString('base64');
        }
        // Generate IV (12 bytes for GCM)
        const iv = crypto.randomBytes(12);
        // Create cipher
        const cipher = crypto.createCipheriv('aes-256-gcm', this.derivedKey, iv);
        // Encrypt
        const encrypted = Buffer.concat([
            cipher.update(serialized, 'utf-8'),
            cipher.final()
        ]);
        // Get auth tag
        const authTag = cipher.getAuthTag();
        return {
            algorithm: 'aes-256-gcm',
            iv: iv.toString('base64'),
            data: encrypted.toString('base64'),
            authTag: authTag.toString('base64'),
            salt: this.salt.toString('base64'),
            encryptedAt: new Date(),
            version: VAULT_VERSION
        };
    }
    /**
     * Decrypt data using AES-256-GCM
     * @param payload - Encrypted payload
     */
    async decrypt(payload) {
        if (!this.derivedKey) {
            throw new Error('Vault not initialized');
        }
        this.operationCount++;
        // Parse components
        const iv = Buffer.from(payload.iv, 'base64');
        const encrypted = Buffer.from(payload.data, 'base64');
        const authTag = Buffer.from(payload.authTag, 'base64');
        // Create decipher
        const decipher = crypto.createDecipheriv('aes-256-gcm', this.derivedKey, iv);
        // Set auth tag
        decipher.setAuthTag(authTag);
        // Decrypt
        let decrypted;
        try {
            decrypted = Buffer.concat([
                decipher.update(encrypted),
                decipher.final()
            ]).toString('utf-8');
        }
        catch (error) {
            throw new Error('Decryption failed: invalid password or corrupted data');
        }
        // Decompress if needed
        if (this.config.compression) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            const decompressed = await gunzip(Buffer.from(decrypted, 'base64'));
            decrypted = decompressed.toString('utf-8');
        }
        return JSON.parse(decrypted);
    }
    /**
     * Store data in the vault
     * @param id - Entry ID
     * @param type - Entry type
     * @param data - Data to store
     */
    // Complexity: O(1) — hash/map lookup
    async store(id, type, data) {
        const originalData = JSON.stringify(data);
        const checksum = this.calculateChecksum(originalData);
        // SAFETY: async operation — wrap in try-catch for production resilience
        const encrypted = await this.encrypt(data);
        const entry = {
            id,
            type,
            payload: encrypted,
            checksum,
            lastModified: new Date(),
            originalSize: originalData.length
        };
        this.entries.set(id, entry);
        this.syncStatus.pendingChanges++;
        this.emit('stored', { id, type });
        return entry;
    }
    /**
     * Retrieve data from the vault
     * @param id - Entry ID
     */
    async retrieve(id) {
        const entry = this.entries.get(id);
        if (!entry)
            return null;
        // SAFETY: async operation — wrap in try-catch for production resilience
        const data = await this.decrypt(entry.payload);
        // Verify checksum
        const checksum = this.calculateChecksum(JSON.stringify(data));
        if (checksum !== entry.checksum) {
            throw new Error(`Data integrity check failed for entry ${id}`);
        }
        return data;
    }
    /**
     * Check if an entry exists
     * @param id - Entry ID
     */
    // Complexity: O(1) — hash/map lookup
    has(id) {
        return this.entries.has(id);
    }
    /**
     * Delete an entry
     * @param id - Entry ID
     */
    // Complexity: O(N) — potential recursive descent
    delete(id) {
        const deleted = this.entries.delete(id);
        if (deleted) {
            this.syncStatus.pendingChanges++;
            this.emit('deleted', id);
        }
        return deleted;
    }
    /**
     * Calculate SHA-256 checksum
     * @param data - Data to hash
     */
    // Complexity: O(1)
    calculateChecksum(data) {
        return crypto.createHash('sha256').update(data).digest('hex');
    }
    /**
     * Verify data integrity
     * @param id - Entry ID
     */
    // Complexity: O(1) — hash/map lookup
    async verifyIntegrity(id) {
        const entry = this.entries.get(id);
        if (!entry)
            return false;
        try {
            const data = await this.decrypt(entry.payload);
            const checksum = this.calculateChecksum(JSON.stringify(data));
            return checksum === entry.checksum;
        }
        catch {
            return false;
        }
    }
    /**
     * Save vault to disk
     */
    // Complexity: O(N) — linear iteration
    async save() {
        if (!this.manifest || !this.salt) {
            throw new Error('Vault not initialized');
        }
        // Update manifest
        this.manifest.entryCount = this.entries.size;
        this.manifest.totalSize = Array.from(this.entries.values())
            .reduce((sum, entry) => sum + entry.originalSize, 0);
        this.manifest.lastSync = new Date();
        this.manifest.manifestChecksum = this.calculateChecksum(JSON.stringify({ ...this.manifest, manifestChecksum: '' }));
        // Prepare vault data
        const vaultData = {
            manifest: this.manifest,
            salt: this.salt.toString('base64'),
            entries: Array.from(this.entries.entries())
        };
        // Ensure directory exists
        const dir = (0, node_path_1.dirname)(this.config.vaultPath);
        if (!(0, node_fs_1.existsSync)(dir)) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await (0, promises_1.mkdir)(dir, { recursive: true });
        }
        // Write to disk
        // SAFETY: async operation — wrap in try-catch for production resilience
        await (0, promises_1.writeFile)(this.config.vaultPath, JSON.stringify(vaultData, null, 2), 'utf-8');
        this.syncStatus.lastSuccessfulSync = new Date();
        this.syncStatus.pendingChanges = 0;
        this.emit('saved', { path: this.config.vaultPath });
    }
    /**
     * Load vault from disk
     * @param password - Master password
     */
    // Complexity: O(1) — amortized
    async loadVault(password) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const data = await (0, promises_1.readFile)(this.config.vaultPath, 'utf-8');
        const vaultData = JSON.parse(data);
        // Restore salt and derive key
        this.salt = Buffer.from(vaultData.salt, 'base64');
        // SAFETY: async operation — wrap in try-catch for production resilience
        this.derivedKey = await this.deriveKey(password, this.salt);
        // Restore manifest
        this.manifest = vaultData.manifest;
        // Restore entries
        this.entries = new Map(vaultData.entries);
        // Verify manifest checksum
        const expectedChecksum = this.manifest.manifestChecksum;
        const calculatedChecksum = this.calculateChecksum(JSON.stringify({ ...this.manifest, manifestChecksum: '' }));
        if (expectedChecksum !== calculatedChecksum) {
            throw new Error('Vault manifest integrity check failed');
        }
        this.emit('loaded', { entryCount: this.entries.size });
    }
    /**
     * Change the master password
     * @param currentPassword - Current password
     * @param newPassword - New password
     */
    // Complexity: O(N*M) — nested iteration detected
    async changePassword(currentPassword, newPassword) {
        // Verify current password
        if (!this.derivedKey || !this.salt) {
            throw new Error('Vault not initialized');
        }
        // SAFETY: async operation — wrap in try-catch for production resilience
        const verifyKey = await this.deriveKey(currentPassword, this.salt);
        if (!verifyKey.equals(this.derivedKey)) {
            throw new Error('Current password is incorrect');
        }
        // Decrypt all entries
        const decryptedEntries = [];
        for (const [id, entry] of this.entries) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            const data = await this.decrypt(entry.payload);
            decryptedEntries.push({ entry, data });
        }
        // Generate new salt and key
        this.salt = crypto.randomBytes(32);
        // SAFETY: async operation — wrap in try-catch for production resilience
        this.derivedKey = await this.deriveKey(newPassword, this.salt);
        // Re-encrypt all entries
        for (const { entry, data } of decryptedEntries) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            const newPayload = await this.encrypt(data);
            entry.payload = newPayload;
            entry.lastModified = new Date();
        }
        // Save vault
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.save();
        this.emit('passwordChanged');
    }
    /**
     * Export vault (for backup)
     */
    // Complexity: O(1)
    async export() {
        if (!this.manifest || !this.salt) {
            throw new Error('Vault not initialized');
        }
        const exportData = {
            manifest: this.manifest,
            salt: this.salt.toString('base64'),
            entries: Array.from(this.entries.entries()),
            exportedAt: new Date().toISOString()
        };
        return JSON.stringify(exportData);
    }
    /**
     * Import vault (from backup)
     * @param exportData - Exported vault data
     * @param password - Master password
     */
    async import(exportData, password) {
        const data = JSON.parse(exportData);
        this.salt = Buffer.from(data.salt, 'base64');
        // SAFETY: async operation — wrap in try-catch for production resilience
        this.derivedKey = await this.deriveKey(password, this.salt);
        this.manifest = data.manifest;
        this.entries = new Map(data.entries);
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.save();
        this.emit('imported', { entryCount: this.entries.size });
    }
    /**
     * Get sync status
     */
    // Complexity: O(1)
    getSyncStatus() {
        return { ...this.syncStatus };
    }
    /**
     * Get vault statistics
     */
    // Complexity: O(1)
    getStats() {
        return {
            entryCount: this.entries.size,
            totalSize: this.manifest?.totalSize ?? 0,
            operationCount: this.operationCount,
            uptime: Date.now() - this.startTime,
            pendingChanges: this.syncStatus.pendingChanges
        };
    }
    /**
     * List all entries
     */
    // Complexity: O(N) — linear iteration
    listEntries() {
        return Array.from(this.entries.values()).map(entry => ({
            id: entry.id,
            type: entry.type,
            size: entry.originalSize,
            lastModified: entry.lastModified
        }));
    }
    /**
     * Generate machine ID
     */
    // Complexity: O(1) — hash/map lookup
    generateMachineId() {
        const hostname = require('node:os').hostname();
        const cpus = require('node:os').cpus();
        const data = `${hostname}-${cpus[0]?.model || 'unknown'}`;
        return crypto.createHash('sha256').update(data).digest('hex').slice(0, 16);
    }
    /**
     * Check if vault is initialized
     */
    // Complexity: O(1)
    isInitialized() {
        return this.derivedKey !== null && this.salt !== null;
    }
    /**
     * Check if vault is enabled
     */
    // Complexity: O(1)
    isEnabled() {
        return this.config.enabled;
    }
    /**
     * Close the vault
     */
    // Complexity: O(1)
    async close() {
        if (this.syncStatus.pendingChanges > 0) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.save();
        }
        this.derivedKey = null;
        this.salt = null;
        this.entries.clear();
        this.emit('closed');
    }
}
exports.NeuralVault = NeuralVault;
exports.default = NeuralVault;
