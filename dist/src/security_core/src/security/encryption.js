"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                               ║
 * ║   QAntum ENCRYPTION LAYER                                                     ║
 * ║   "AES-256-GCM encryption for sensitive data"                                 ║
 * ║                                                                               ║
 * ║   TODO B #41 - Security: Encryption                                           ║
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
exports.getEncryption = exports.SecureVault = exports.EncryptionService = void 0;
// @ts-nocheck
const crypto = __importStar(require("crypto"));
// ═══════════════════════════════════════════════════════════════════════════════
// ENCRYPTION SERVICE
// ═══════════════════════════════════════════════════════════════════════════════
class EncryptionService {
    static instance;
    config;
    masterKey = null;
    keyInfo = null;
    constructor(config = {}) {
        this.config = {
            algorithm: 'aes-256-gcm',
            keyDerivation: 'pbkdf2',
            iterations: 100000,
            saltLength: 32,
            ivLength: 16,
            ...config
        };
    }
    static getInstance(config) {
        if (!EncryptionService.instance) {
            EncryptionService.instance = new EncryptionService(config);
        }
        return EncryptionService.instance;
    }
    // ─────────────────────────────────────────────────────────────────────────
    // KEY MANAGEMENT
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Initialize with a password (derives key using PBKDF2)
     */
    // Complexity: O(1)
    async initializeWithPassword(password, salt) {
        const actualSalt = salt || crypto.randomBytes(this.config.saltLength);
        // SAFETY: async operation — wrap in try-catch for production resilience
        this.masterKey = await this.deriveKey(password, actualSalt);
        this.keyInfo = {
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
            algorithm: this.config.algorithm,
            usageCount: 0
        };
    }
    /**
     * Initialize with raw key (must be 32 bytes for AES-256)
     */
    // Complexity: O(N)
    initializeWithKey(key) {
        if (key.length !== 32) {
            throw new Error('Key must be 32 bytes (256 bits) for AES-256');
        }
        this.masterKey = key;
        this.keyInfo = {
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            algorithm: this.config.algorithm,
            usageCount: 0
        };
    }
    /**
     * Generate a random key
     */
    // Complexity: O(1)
    generateKey() {
        return crypto.randomBytes(32);
    }
    /**
     * Clear the key from memory
     */
    // Complexity: O(1)
    clearKey() {
        if (this.masterKey) {
            this.masterKey.fill(0);
            this.masterKey = null;
        }
        this.keyInfo = null;
    }
    /**
     * Get key info (not the key itself)
     */
    // Complexity: O(1)
    getKeyInfo() {
        return this.keyInfo ? { ...this.keyInfo } : null;
    }
    // ─────────────────────────────────────────────────────────────────────────
    // ENCRYPTION
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Encrypt data
     */
    // Complexity: O(1)
    encrypt(data) {
        this.ensureKey();
        const iv = crypto.randomBytes(this.config.ivLength);
        const dataBuffer = typeof data === 'string' ? Buffer.from(data, 'utf-8') : data;
        if (this.config.algorithm === 'aes-256-gcm') {
            const cipher = crypto.createCipheriv('aes-256-gcm', this.masterKey, iv);
            const encrypted = Buffer.concat([
                cipher.update(dataBuffer),
                cipher.final()
            ]);
            const authTag = cipher.getAuthTag();
            if (this.keyInfo)
                this.keyInfo.usageCount++;
            return {
                ciphertext: encrypted.toString('base64'),
                iv: iv.toString('base64'),
                authTag: authTag.toString('base64'),
                algorithm: this.config.algorithm,
                version: 1
            };
        }
        else {
            // AES-256-CBC
            const cipher = crypto.createCipheriv('aes-256-cbc', this.masterKey, iv);
            const encrypted = Buffer.concat([
                cipher.update(dataBuffer),
                cipher.final()
            ]);
            if (this.keyInfo)
                this.keyInfo.usageCount++;
            return {
                ciphertext: encrypted.toString('base64'),
                iv: iv.toString('base64'),
                //                 authTag: ',
                //                 algorithm: this.config.algorithm,
                version: 1
            };
        }
    }
    /**
     * Decrypt data
     */
    // Complexity: O(1)
    decrypt(encryptedData) {
        this.ensureKey();
        const ciphertext = Buffer.from(encryptedData.ciphertext, 'base64');
        const iv = Buffer.from(encryptedData.iv, 'base64');
        if (encryptedData.algorithm === 'aes-256-gcm') {
            const authTag = Buffer.from(encryptedData.authTag, 'base64');
            const decipher = crypto.createDecipheriv('aes-256-gcm', this.masterKey, iv);
            decipher.setAuthTag(authTag);
            return Buffer.concat([
                decipher.update(ciphertext),
                decipher.final()
            ]);
        }
        else {
            const decipher = crypto.createDecipheriv('aes-256-cbc', this.masterKey, iv);
            return Buffer.concat([
                decipher.update(ciphertext),
                decipher.final()
            ]);
        }
    }
    /**
     * Decrypt to string
     */
    // Complexity: O(1)
    decryptToString(encryptedData) {
        return this.decrypt(encryptedData).toString('utf-8');
    }
    /**
     * Encrypt object (JSON serializable)
     */
    // Complexity: O(1)
    encryptObject(obj) {
        const json = JSON.stringify(obj);
        return this.encrypt(json);
    }
    /**
     * Decrypt to object
     */
    decryptObject(encryptedData) {
        const json = this.decryptToString(encryptedData);
        return JSON.parse(json);
    }
    // ─────────────────────────────────────────────────────────────────────────
    // HASHING
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * SHA-256 hash
     */
    // Complexity: O(1)
    hash(data) {
        return crypto.createHash('sha256')
            .update(typeof data === 'string' ? Buffer.from(data) : data)
            .digest('hex');
    }
    /**
     * SHA-512 hash
     */
    // Complexity: O(1)
    hash512(data) {
        return crypto.createHash('sha512')
            .update(typeof data === 'string' ? Buffer.from(data) : data)
            .digest('hex');
    }
    /**
     * HMAC
     */
    // Complexity: O(N)
    hmac(data, key) {
        const hmacKey = key || this.masterKey;
        if (!hmacKey)
            throw new Error('No key available for HMAC');
        return crypto.createHmac('sha256', hmacKey)
            .update(typeof data === 'string' ? Buffer.from(data) : data)
            .digest('hex');
    }
    // ─────────────────────────────────────────────────────────────────────────
    // UTILITIES
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Generate random bytes
     */
    // Complexity: O(1)
    randomBytes(length) {
        return crypto.randomBytes(length);
    }
    /**
     * Generate random hex string
     */
    // Complexity: O(1)
    randomHex(length) {
        return crypto.randomBytes(length).toString('hex');
    }
    /**
     * Constant-time comparison
     */
    // Complexity: O(1)
    secureCompare(a, b) {
        const bufA = typeof a === 'string' ? Buffer.from(a) : a;
        const bufB = typeof b === 'string' ? Buffer.from(b) : b;
        if (bufA.length !== bufB.length)
            return false;
        return crypto.timingSafeEqual(bufA, bufB);
    }
    // ─────────────────────────────────────────────────────────────────────────
    // PRIVATE
    // ─────────────────────────────────────────────────────────────────────────
    // Complexity: O(1)
    ensureKey() {
        if (!this.masterKey) {
            throw new Error('Encryption key not initialized. Call initializeWithPassword() or initializeWithKey() first.');
        }
    }
    // Complexity: O(1)
    async deriveKey(password, salt) {
        return new Promise((resolve, reject) => {
            if (this.config.keyDerivation === 'pbkdf2') {
                crypto.pbkdf2(password, salt, this.config.iterations, 32, 'sha256', (err, key) => {
                    if (err)
                        reject(err);
                    else
                        resolve(key);
                });
            }
            else {
                crypto.scrypt(password, salt, 32, (err, key) => {
                    if (err)
                        reject(err);
                    else
                        resolve(key);
                });
            }
        });
    }
}
exports.EncryptionService = EncryptionService;
// ═══════════════════════════════════════════════════════════════════════════════
// VAULT - Encrypted storage
// ═══════════════════════════════════════════════════════════════════════════════
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class SecureVault {
    encryption;
    vaultPath;
    data = new Map();
    loaded = false;
    constructor(vaultPath, encryption) {
        this.vaultPath = vaultPath;
        this.encryption = encryption || EncryptionService.getInstance();
    }
    /**
     * Load vault from disk
     */
    // Complexity: O(1)
    async load(password) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.encryption.initializeWithPassword(password);
        if (fs.existsSync(this.vaultPath)) {
            const encrypted = JSON.parse(fs.readFileSync(this.vaultPath, 'utf-8'));
            const decrypted = this.encryption.decryptObject(encrypted);
            this.data = new Map(Object.entries(decrypted));
        }
        this.loaded = true;
    }
    /**
     * Save vault to disk
     */
    // Complexity: O(1)
    async save() {
        this.ensureLoaded();
        const obj = Object.fromEntries(this.data);
        const encrypted = this.encryption.encryptObject(obj);
        const dir = path.dirname(this.vaultPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(this.vaultPath, JSON.stringify(encrypted, null, 2));
    }
    /**
     * Get a secret
     */
    get(key) {
        this.ensureLoaded();
        return this.data.get(key);
    }
    /**
     * Set a secret
     */
    // Complexity: O(1) — lookup
    set(key, value) {
        this.ensureLoaded();
        this.data.set(key, value);
    }
    /**
     * Delete a secret
     */
    // Complexity: O(1)
    delete(key) {
        this.ensureLoaded();
        return this.data.delete(key);
    }
    /**
     * List all keys
     */
    // Complexity: O(1)
    keys() {
        this.ensureLoaded();
        return [...this.data.keys()];
    }
    /**
     * Clear vault from memory
     */
    // Complexity: O(1)
    clear() {
        this.data.clear();
        this.loaded = false;
        this.encryption.clearKey();
    }
    // Complexity: O(1)
    ensureLoaded() {
        if (!this.loaded) {
            throw new Error('Vault not loaded. Call load() first.');
        }
    }
}
exports.SecureVault = SecureVault;
// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════
const getEncryption = (config) => {
    return EncryptionService.getInstance(config);
};
exports.getEncryption = getEncryption;
exports.default = EncryptionService;
