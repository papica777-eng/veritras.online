"use strict";
/**
 * 🔐 Encryption Service
 * AES-256 encryption/decryption for secure recording storage
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.encryptionService = void 0;
const react_native_aes_crypto_1 = __importDefault(require("react-native-aes-crypto"));
const Crypto = __importStar(require("expo-crypto"));
class EncryptionService {
    static instance;
    KEY_SIZE = 256;
    ITERATIONS = 10000;
    constructor() { }
    static getInstance() {
        if (!EncryptionService.instance) {
            EncryptionService.instance = new EncryptionService();
        }
        return EncryptionService.instance;
    }
    /**
     * Generate a secure encryption key from device credentials
     */
    // Complexity: O(1) — hash/map lookup
    async generateKey(password, salt) {
        try {
            const key = await react_native_aes_crypto_1.default.pbkdf2(password, salt, this.ITERATIONS, this.KEY_SIZE);
            return key;
        }
        catch (error) {
            console.error('[EncryptionService] Key generation failed:', error);
            throw new Error('Failed to generate encryption key');
        }
    }
    /**
     * Generate random salt for key derivation
     */
    // Complexity: O(N) — linear iteration
    async generateSalt() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const saltBytes = await Crypto.getRandomBytesAsync(16);
        return Array.from(saltBytes)
            .map((b) => ('0' + b.toString(16)).slice(-2))
            .join('');
    }
    /**
     * Generate random initialization vector
     */
    // Complexity: O(N) — linear iteration
    async generateIV() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const ivBytes = await Crypto.getRandomBytesAsync(16);
        return Array.from(ivBytes)
            .map((b) => ('0' + b.toString(16)).slice(-2))
            .join('');
    }
    /**
     * Encrypt data using AES-256-CBC
     */
    // Complexity: O(1) — hash/map lookup
    async encrypt(data, password) {
        try {
            const salt = await this.generateSalt();
            const iv = await this.generateIV();
            const key = await this.generateKey(password, salt);
            const encryptedData = await react_native_aes_crypto_1.default.encrypt(data, key, iv, 'aes-256-cbc');
            console.log('[EncryptionService] Data encrypted successfully');
            return { encryptedData, iv, salt };
        }
        catch (error) {
            console.error('[EncryptionService] Encryption failed:', error);
            throw new Error('Failed to encrypt data');
        }
    }
    /**
     * Decrypt data using AES-256-CBC
     */
    // Complexity: O(1) — hash/map lookup
    async decrypt(params) {
        try {
            const { encryptedData, iv, salt, key: password } = params;
            const key = await this.generateKey(password, salt);
            const decryptedData = await react_native_aes_crypto_1.default.decrypt(encryptedData, key, iv, 'aes-256-cbc');
            console.log('[EncryptionService] Data decrypted successfully');
            return decryptedData;
        }
        catch (error) {
            console.error('[EncryptionService] Decryption failed:', error);
            throw new Error('Failed to decrypt data');
        }
    }
    /**
     * Encrypt a file
     */
    // Complexity: O(1) — hash/map lookup
    async encryptFile(fileUri, password) {
        try {
            // TODO: In production, read actual file contents and encrypt them
            // Example implementation:
            // const fileContent = await FileSystem.readAsStringAsync(fileUri, {
            //   encoding: FileSystem.EncodingType.Base64
            // });
            // const encrypted = await this.encrypt(fileContent, password);
            // await FileSystem.writeAsStringAsync(encryptedPath, encrypted.encryptedData);
            // For now, this is a placeholder
            // In production, this MUST read and encrypt the actual file content
            console.warn('[EncryptionService] File encryption is placeholder - implement actual file encryption before production');
            const fileData = fileUri;
            return await this.encrypt(fileData, password);
        }
        catch (error) {
            console.error('[EncryptionService] File encryption failed:', error);
            throw new Error('Failed to encrypt file');
        }
    }
    /**
     * Decrypt a file
     */
    // Complexity: O(N) — potential recursive descent
    async decryptFile(params) {
        try {
            return await this.decrypt(params);
        }
        catch (error) {
            console.error('[EncryptionService] File decryption failed:', error);
            throw new Error('Failed to decrypt file');
        }
    }
}
exports.encryptionService = EncryptionService.getInstance();
