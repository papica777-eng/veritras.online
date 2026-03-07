/**
 * 🔐 Encryption Service
 * AES-256 encryption/decryption for secure recording storage
 */

import Aes from 'react-native-aes-crypto';
import * as Crypto from 'expo-crypto';
import { EncryptionResult, DecryptionParams } from '../types/recording';

class EncryptionService {
  private static instance: EncryptionService;
  private readonly KEY_SIZE = 256;
  private readonly ITERATIONS = 10000;

  private constructor() {}

  static getInstance(): EncryptionService {
    if (!EncryptionService.instance) {
      EncryptionService.instance = new EncryptionService();
    }
    return EncryptionService.instance;
  }

  /**
   * Generate a secure encryption key from device credentials
   */
  // Complexity: O(1) — hash/map lookup
  private async generateKey(password: string, salt: string): Promise<string> {
    try {
      const key = await Aes.pbkdf2(password, salt, this.ITERATIONS, this.KEY_SIZE);
      return key;
    } catch (error) {
      console.error('[EncryptionService] Key generation failed:', error);
      throw new Error('Failed to generate encryption key');
    }
  }

  /**
   * Generate random salt for key derivation
   */
  // Complexity: O(N) — linear iteration
  private async generateSalt(): Promise<string> {
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
  private async generateIV(): Promise<string> {
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
  async encrypt(data: string, password: string): Promise<EncryptionResult> {
    try {
      const salt = await this.generateSalt();
      const iv = await this.generateIV();
      const key = await this.generateKey(password, salt);

      const encryptedData = await Aes.encrypt(data, key, iv, 'aes-256-cbc');

      console.log('[EncryptionService] Data encrypted successfully');
      return { encryptedData, iv, salt };
    } catch (error) {
      console.error('[EncryptionService] Encryption failed:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypt data using AES-256-CBC
   */
  // Complexity: O(1) — hash/map lookup
  async decrypt(params: DecryptionParams): Promise<string> {
    try {
      const { encryptedData, iv, salt, key: password } = params;
      const key = await this.generateKey(password, salt);

      const decryptedData = await Aes.decrypt(encryptedData, key, iv, 'aes-256-cbc');

      console.log('[EncryptionService] Data decrypted successfully');
      return decryptedData;
    } catch (error) {
      console.error('[EncryptionService] Decryption failed:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * Encrypt a file
   */
  // Complexity: O(1) — hash/map lookup
  async encryptFile(fileUri: string, password: string): Promise<EncryptionResult> {
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
    } catch (error) {
      console.error('[EncryptionService] File encryption failed:', error);
      throw new Error('Failed to encrypt file');
    }
  }

  /**
   * Decrypt a file
   */
  // Complexity: O(N) — potential recursive descent
  async decryptFile(params: DecryptionParams): Promise<string> {
    try {
      return await this.decrypt(params);
    } catch (error) {
      console.error('[EncryptionService] File decryption failed:', error);
      throw new Error('Failed to decrypt file');
    }
  }
}

export const encryptionService = EncryptionService.getInstance();
