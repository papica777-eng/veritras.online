/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                     TWO FACTOR MANAGER - 2FA Code Generator                   ║
 * ║                                                                               ║
 * ║   Generates TOTP codes (Time-based One-Time Password) compatible with         ║
 * ║   Google Authenticator, Binance 2FA, and other standard implementations.     ║
 * ║                                                                               ║
 * ║   © 2026 QAntum | Dimitar Prodromov                                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

import * as OTPAuth from 'otpauth';

export class TwoFactorManager {
  private totp: OTPAuth.TOTP;
  private issuer: string;

  /**
   * Initialize the 2FA manager with a secret key.
   * 
   * @param secret - The base32-encoded secret key (from QR code setup)
   * @param issuer - The service name (e.g., "Binance", "Coinbase")
   * 
   * ⚠️ SECURITY: Never hardcode secrets! Always load from .env:
   *    const secret = process.env.BINANCE_2FA_SECRET || '';
   */
  constructor(secret: string, issuer: string = 'Binance') {
    if (!secret || secret.length < 16) {
      throw new Error('❌ Invalid 2FA secret. Must be at least 16 characters (base32).');
    }

    // Clean the secret (remove spaces/dashes that some users copy from backup codes)
    const cleanSecret = secret.replace(/[\s-]/g, '').toUpperCase();

    this.issuer = issuer;
    
    try {
      this.totp = new OTPAuth.TOTP({
        issuer: issuer,
        label: 'QAntum Agent',
        algorithm: 'SHA1',    // Standard for most services
        digits: 6,            // 6-digit codes
        period: 30,           // Refreshes every 30 seconds
        secret: OTPAuth.Secret.fromBase32(cleanSecret),
      });
    } catch (err) {
      throw new Error(`❌ Failed to initialize 2FA: ${(err as Error).message}`);
    }
  }

  /**
   * Generate the current 6-digit TOTP code.
   * This code changes every 30 seconds.
   * 
   * @returns The current 6-digit code as a string
   */
  // Complexity: O(1)
  public getToken(): string {
    return this.totp.generate();
  }

  /**
   * Get the time remaining (in seconds) until the current code expires.
   * Useful for logging or deciding when to retry.
   */
  // Complexity: O(1)
  public getTimeRemaining(): number {
    const now = Math.floor(Date.now() / 1000);
    const period = 30;
    return period - (now % period);
  }

  /**
   * Validate a code (useful for testing or manual verification).
   * 
   * @param token - The 6-digit code to validate
   * @param window - How many time windows to check (default: 1 = current only)
   * @returns true if the code is valid
   */
  // Complexity: O(1)
  public validate(token: string, window: number = 1): boolean {
    return this.totp.validate({ token, window }) !== null;
  }

  /**
   * Get diagnostic information (safe for logging - doesn't expose secret).
   */
  // Complexity: O(N) — potential recursive descent
  public getInfo(): { issuer: string; timeRemaining: number; algorithm: string } {
    return {
      issuer: this.issuer,
      timeRemaining: this.getTimeRemaining(),
      algorithm: 'SHA1',
    };
  }
}
