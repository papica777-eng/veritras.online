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

import * as crypto from 'crypto';
import * as fs from 'fs';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16;  // 128 bits
const AUTH_TAG_LENGTH = 16;

export class CryptoVault {
    private masterKey: Buffer;

    constructor(password: string) {
        // Derive 256-bit key from password using PBKDF2
        this.masterKey = crypto.pbkdf2Sync(
            password,
            'qantum-empire-salt', // In production, use random salt
            100000,  // 100k iterations
            KEY_LENGTH,
            'sha512'
        );
    }

    /**
     * Encrypt sensitive data (API keys, secrets, etc.)
     */
    // Complexity: O(1)
    encrypt(plaintext: string): string {
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
    decrypt(encryptedData: string): string {
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
    encryptFile(inputPath: string, outputPath: string): void {
        const plaintext = fs.readFileSync(inputPath, 'utf8');
        const encrypted = this.encrypt(plaintext);
        fs.writeFileSync(outputPath, encrypted);
    }

    /**
     * Decrypt file
     */
    // Complexity: O(1)
    decryptFile(inputPath: string, outputPath: string): void {
        const encrypted = fs.readFileSync(inputPath, 'utf8');
        const decrypted = this.decrypt(encrypted);
        fs.writeFileSync(outputPath, decrypted);
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// DEMONSTRATION
// ═══════════════════════════════════════════════════════════════════════════════

import { fileURLToPath } from 'url';
const isMainModule = process.argv[1] === fileURLToPath(import.meta.url);

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
