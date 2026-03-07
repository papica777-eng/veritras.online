/**
 * Centralized cryptographic utilities
 * 
 * Provides consistent ID generation, signing, and hashing across the framework.
 * Reduces duplication and improves maintainability.
 * 
 * @module core/utils/crypto
 */

import * as crypto from 'crypto';

/**
 * ID generation options
 */
export interface IdGenerationOptions {
  prefix?: string;
  length?: number;
  timestamp?: boolean;
}

/**
 * Cryptographic utilities
 */
export class CryptoUtils {
  /**
   * Generate a unique identifier
   * 
   * Performance optimized: Pre-allocates buffer for randomBytes
   * 
   * @param prefix Optional prefix for the ID
   * @param options Configuration options
   * @returns Generated unique ID
   */
  static generateId(prefix: string = 'id', options: Partial<IdGenerationOptions> = {}): string {
    const {
      length = 12,
      timestamp = false
    } = options;

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
  static generateIds(count: number, prefix: string = 'id'): string[] {
    const ids: string[] = [];
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
  static hash(data: string | Buffer): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Create a truncated hash (useful for signatures)
   * 
   * @param data Data to hash
   * @param length Length of output (default 32 chars)
   * @returns Truncated hash
   */
  static hashTruncated(data: string | Buffer, length: number = 32): string {
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
  static sign(data: string | Buffer, key?: string): string {
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
  static verify(data: string | Buffer, signature: string, key?: string): boolean {
    const expectedSignature = this.sign(data, key);
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }

  /**
   * Encrypt data (simple XOR for now, use proper encryption in production)
   * 
   * @param data Data to encrypt
   * @param key Encryption key
   * @returns Encrypted hex string
   */
  static encrypt(data: string, key: string = 'default-key'): string {
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
  static decrypt(encrypted: string, key: string = 'default-key'): string {
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
    } catch (error) {
      throw new Error(`Decryption failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Generate a random token (useful for authentication)
   * 
   * @param length Token length in bytes
   * @returns Random token as hex string
   */
  static generateToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Create a checksum for data integrity
   * 
   * @param data Data to checksum
   * @returns Checksum value
   */
  static checksum(data: string | Buffer): string {
    return crypto.createHash('md5').update(data).digest('hex');
  }
}

// Re-export for convenience
export const generateId = (prefix?: string, options?: Partial<IdGenerationOptions>) =>
  CryptoUtils.generateId(prefix, options);

export const hash = (data: string | Buffer) =>
  CryptoUtils.hash(data);

export const sign = (data: string | Buffer, key?: string) =>
  CryptoUtils.sign(data, key);
