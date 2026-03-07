"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * QANTUM CRYPTO VAULT - AES-256-GCM ENCRYPTION ENGINE
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Military-grade encryption for sensitive data (API keys, wallet seeds, strategies).
 * Uses AES-256-GCM with random IV/nonce for maximum security.
 *
 * @author Dimitar Prodromov / QAntum Empire
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
exports.CryptoVault = void 0;
const crypto = __importStar(require("crypto"));
const fs = __importStar(require("fs"));
const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 128 bits
const AUTH_TAG_LENGTH = 16;
class CryptoVault {
    masterKey;
    constructor(password) {
        // Derive 256-bit key from password using PBKDF2
        this.masterKey = crypto.pbkdf2Sync(password, 'qantum-empire-salt', // In production, use random salt
        100000, // 100k iterations
        KEY_LENGTH, 'sha512');
    }
    /**
     * Encrypt sensitive data (API keys, secrets, etc.)
     */
    // Complexity: O(1)
    encrypt(plaintext) {
        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv(ALGORITHM, this.masterKey, iv);
        let encrypted = cipher.update(plaintext, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        const authTag = cipher.getAuthTag();
        // Format: iv:authTag:ciphertext
        return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
    }
    /**
     * Decrypt encrypted data
     */
    // Complexity: O(1) — hash/map lookup
    decrypt(encryptedData) {
        const parts = encryptedData.split(':');
        if (parts.length !== 3) {
            throw new Error('Invalid encrypted data format');
        }
        const iv = Buffer.from(parts[0], 'hex');
        const authTag = Buffer.from(parts[1], 'hex');
        const encrypted = parts[2];
        const decipher = crypto.createDecipheriv(ALGORITHM, this.masterKey, iv);
        decipher.setAuthTag(authTag);
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
    /**
     * Encrypt file (for wallet backups, strategy files)
     */
    // Complexity: O(1)
    encryptFile(inputPath, outputPath) {
        const plaintext = fs.readFileSync(inputPath, 'utf8');
        const encrypted = this.encrypt(plaintext);
        fs.writeFileSync(outputPath, encrypted);
    }
    /**
     * Decrypt file
     */
    // Complexity: O(1)
    decryptFile(inputPath, outputPath) {
        const encrypted = fs.readFileSync(inputPath, 'utf8');
        const decrypted = this.decrypt(encrypted);
        fs.writeFileSync(outputPath, decrypted);
    }
}
exports.CryptoVault = CryptoVault;
// ═══════════════════════════════════════════════════════════════════════════════
// DEMONSTRATION
// ═══════════════════════════════════════════════════════════════════════════════
const url_1 = require("url");
const isMainModule = process.argv[1] === (0, url_1.fileURLToPath)(import.meta.url);
if (isMainModule) {
    console.log('\n🔒 QAntum Crypto Vault - AES-256-GCM Demo\n');
    const vault = new CryptoVault('QAntumEmpire2026!SecurePassword');
    // Encrypt sensitive API key
    const apiKey = 'sk_live_PLACEHOLDER_FOR_DEMO_ONLY_DO_NOT_USE_IN_PROD';
    console.log('📄 Original API Key:', apiKey);
    const encrypted = vault.encrypt(apiKey);
    console.log('🔒 Encrypted:', encrypted);
    console.log('   Length:', encrypted.length, 'chars');
    const decrypted = vault.decrypt(encrypted);
    console.log('🔓 Decrypted:', decrypted);
    console.log('✅ Match:', apiKey === decrypted ? 'SUCCESS' : 'FAILED');
    // Encrypt trading strategy
    console.log('\n📊 Encrypting Trading Strategy...');
    const strategy = {
        name: 'Omega Latency Arbitrage v3',
        maxSlippage: 0.002,
        minProfit: 0.005,
        exchanges: ['Binance', 'Kraken', 'Bybit'],
        secret: 'This is our competitive edge'
    };
    const encryptedStrategy = vault.encrypt(JSON.stringify(strategy));
    console.log('🔒 Encrypted Strategy:', encryptedStrategy.substring(0, 80) + '...');
    const decryptedStrategy = JSON.parse(vault.decrypt(encryptedStrategy));
    console.log('🔓 Decrypted Strategy:', decryptedStrategy.name);
    console.log('✅ Integrity:', decryptedStrategy.secret === strategy.secret ? 'VERIFIED' : 'COMPROMISED');
    console.log('\n💪 RESULT: AES-256-GCM encryption/decryption OPERATIONAL\n');
}
