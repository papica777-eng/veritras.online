"use strict";
/**
 * Centralized cryptographic utilities
 *
 * Provides consistent ID generation, signing, and hashing across the framework.
 * Reduces duplication and improves maintainability.
 *
 * @module core/utils/crypto
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
exports.sign = exports.hash = exports.generateId = exports.CryptoUtils = void 0;
const crypto = __importStar(require("crypto"));
/**
 * Cryptographic utilities
 */
class CryptoUtils {
    /**
     * Generate a unique identifier
     *
     * Performance optimized: Pre-allocates buffer for randomBytes
     *
     * @param prefix Optional prefix for the ID
     * @param options Configuration options
     * @returns Generated unique ID
     */
    static generateId(prefix = 'id', options = {}) {
        const { length = 12, timestamp = false } = options;
        const randomPart = crypto.randomBytes(length).toString('hex');
        const timestampPart = timestamp ? `_${Date.now()}` : '';
        return `${prefix}_${randomPart}${timestampPart}`;
    }
    /**
     * Generate batch of IDs efficiently
     *
     * Reduces crypto overhead by generating multiple IDs at once
     *
     * @param count Number of IDs to generate
     * @param prefix Prefix for all IDs
     * @returns Array of generated IDs
     */
    static generateIds(count, prefix = 'id') {
        const ids = [];
        const buffer = crypto.randomBytes(count * 12);
        for (let i = 0; i < count; i++) {
            const hex = buffer.slice(i * 12, (i + 1) * 12).toString('hex');
            ids.push(`${prefix}_${hex}`);
        }
        return ids;
    }
    /**
     * Create a SHA256 hash
     *
     * @param data Data to hash
     * @returns Hash string
     */
    static hash(data) {
        return crypto.createHash('sha256').update(data).digest('hex');
    }
    /**
     * Create a truncated hash (useful for signatures)
     *
     * @param data Data to hash
     * @param length Length of output (default 32 chars)
     * @returns Truncated hash
     */
    static hashTruncated(data, length = 32) {
        return this.hash(data).substring(0, length);
    }
    /**
     * Sign data with optional key
     *
     * Simple HMAC signing for data integrity verification
     *
     * @param data Data to sign
     * @param key Optional signing key (uses default if not provided)
     * @returns Signature
     */
    static sign(data, key) {
        const hmacKey = key || process.env.SIGNATURE_KEY || 'default-key';
        return crypto.createHmac('sha256', hmacKey)
            .update(data)
            .digest('hex')
            .substring(0, 64);
    }
    /**
     * Verify signed data
     *
     * @param data Original data
     * @param signature Signature to verify
     * @param key Signing key
     * @returns true if signature is valid
     */
    static verify(data, signature, key) {
        const expectedSignature = this.sign(data, key);
        return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
    }
    /**
     * Encrypt data (simple XOR for now, use proper encryption in production)
     *
     * @param data Data to encrypt
     * @param key Encryption key
     * @returns Encrypted hex string
     */
    static encrypt(data, key = 'default-key') {
        const keyHash = crypto.createHash('sha256').update(key).digest();
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv('aes-256-cbc', keyHash, iv);
        let encrypted = cipher.update(data, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return iv.toString('hex') + ':' + encrypted;
    }
    /**
     * Decrypt data
     *
     * @param encrypted Encrypted hex string (from encrypt method)
     * @param key Decryption key
     * @returns Decrypted data
     */
    static decrypt(encrypted, key = 'default-key') {
        try {
            const keyHash = crypto.createHash('sha256').update(key).digest();
            const [ivHex, encryptedHex] = encrypted.split(':');
            if (!ivHex || !encryptedHex) {
                throw new Error('Invalid encrypted data format');
            }
            const iv = Buffer.from(ivHex, 'hex');
            const decipher = crypto.createDecipheriv('aes-256-cbc', keyHash, iv);
            let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            return decrypted;
        }
        catch (error) {
            throw new Error(`Decryption failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Generate a random token (useful for authentication)
     *
     * @param length Token length in bytes
     * @returns Random token as hex string
     */
    static generateToken(length = 32) {
        return crypto.randomBytes(length).toString('hex');
    }
    /**
     * Create a checksum for data integrity
     *
     * @param data Data to checksum
     * @returns Checksum value
     */
    static checksum(data) {
        return crypto.createHash('md5').update(data).digest('hex');
    }
}
exports.CryptoUtils = CryptoUtils;
// Re-export for convenience
const generateId = (prefix, options) => CryptoUtils.generateId(prefix, options);
exports.generateId = generateId;
const hash = (data) => CryptoUtils.hash(data);
exports.hash = hash;
const sign = (data, key) => CryptoUtils.sign(data, key);
exports.sign = sign;
