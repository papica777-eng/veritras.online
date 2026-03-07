"use strict";
/**
 * encryption — Qantum Module
 * @module encryption
 * @path src/security/encryption.ts
 * @auto-documented BrutalDocEngine v2.1
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEncryption = exports.SecureVault = exports.EncryptionService = void 0;
const crypto_1 = __importDefault(require("crypto"));
class EncryptionService {
    static instance;
    algorithm = 'aes-256-gcm';
    key;
    constructor(config) {
        // In production, this should come from environment variables
        const secret = config?.key || process.env.ENCRYPTION_KEY || 'default-insecure-key-do-not-use-prod';
        // Ensure key is 32 bytes
        this.key = crypto_1.default.scryptSync(secret, 'salt', 32);
    }
    static getInstance(config) {
        if (!EncryptionService.instance) {
            EncryptionService.instance = new EncryptionService(config);
        }
        return EncryptionService.instance;
    }
    // Complexity: O(1)
    encrypt(text) {
        const iv = crypto_1.default.randomBytes(16);
        const cipher = crypto_1.default.createCipheriv(this.algorithm, this.key, iv);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        const tag = cipher.getAuthTag();
        return {
            iv: iv.toString('hex'),
            data: encrypted,
            tag: tag.toString('hex')
        };
    }
    // Complexity: O(1)
    decryptToString(encrypted) {
        const decipher = crypto_1.default.createDecipheriv(this.algorithm, this.key, Buffer.from(encrypted.iv, 'hex'));
        if (encrypted.tag) {
            decipher.setAuthTag(Buffer.from(encrypted.tag, 'hex'));
        }
        let decrypted = decipher.update(encrypted.data, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
    // Complexity: O(1)
    hash(text) {
        return crypto_1.default.createHash('sha256').update(text).digest('hex');
    }
}
exports.EncryptionService = EncryptionService;
class SecureVault {
}
exports.SecureVault = SecureVault;
const getEncryption = () => EncryptionService.getInstance();
exports.getEncryption = getEncryption;
