/**
 * encryption — Qantum Module
 * @module encryption
 * @path src/security/encryption.ts
 * @auto-documented BrutalDocEngine v2.1
 */

import crypto from 'crypto';

export interface EncryptedData {
  iv: string;
  data: string;
  tag?: string;
}

export interface EncryptionConfig {
  algorithm: string;
  key: string;
}

export interface KeyInfo {
  algorithm: string;
  length: number;
}

export class EncryptionService {
  private static instance: EncryptionService;
  private readonly algorithm = 'aes-256-gcm';
  private readonly key: Buffer;

  private constructor(config?: { key?: string }) {
    // In production, this should come from environment variables
    const secret = config?.key || process.env.ENCRYPTION_KEY || 'default-insecure-key-do-not-use-prod';
    // Ensure key is 32 bytes
    this.key = crypto.scryptSync(secret, 'salt', 32);
  }

  static getInstance(config?: { key?: string }): EncryptionService {
    if (!EncryptionService.instance) {
      EncryptionService.instance = new EncryptionService(config);
    }
    return EncryptionService.instance;
  }

  // Complexity: O(1)
  encrypt(text: string): EncryptedData {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv) as crypto.CipherGCM;

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
  decryptToString(encrypted: EncryptedData): string {
    const decipher = crypto.createDecipheriv(
      this.algorithm,
      this.key,
      Buffer.from(encrypted.iv, 'hex')
    ) as crypto.DecipherGCM;

    if (encrypted.tag) {
      decipher.setAuthTag(Buffer.from(encrypted.tag, 'hex'));
    }

    let decrypted = decipher.update(encrypted.data, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  // Complexity: O(1)
  hash(text: string): string {
    return crypto.createHash('sha256').update(text).digest('hex');
  }
}

export class SecureVault {
    // Placeholder for SecureVault
}

export const getEncryption = () => EncryptionService.getInstance();
