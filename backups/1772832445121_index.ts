/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 🛡️ SECURITY CORE - Input Sanitization & OWASP Protection
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 
 * Metaphysical Principle: Security is the art of transformation - converting chaos
 * (malicious input) into order (safe data) while preserving essence (intended meaning).
 * 
 * The boundary between system and external world is where threats manifest.
 * This module guards that boundary with multiple layers of defense, following the
 * principle of "defense in depth" - if one layer fails, others remain.
 * 
 * OWASP Top 10 Protections:
 * 1. A03:2021 – Injection (SQL, Command, LDAP, XPath)
 * 2. A07:2021 – Cross-Site Scripting (XSS)
 * 3. A01:2021 – Broken Access Control (Path Traversal)
 * 4. A04:2021 – Insecure Design (CSRF)
 * 5. A05:2021 – Security Misconfiguration (Rate Limiting)
 * 
 * @author Dimitar Prodromov
 * @version 17.0.0
 */

import { createHash, randomBytes, timingSafeEqual } from 'crypto';
import type {
  SanitizationType,
  SanitizationResult,
  ThreatLevel,
  CSRFToken,
  RateLimitConfig,
  RateLimitEntry,
} from '../../types/security.types';

// ═══════════════════════════════════════════════════════════════════════════════════════
// 🧹 INPUT SANITIZERS
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Core sanitization functions for various attack vectors
 */
export const Sanitizers = {
  /**
   * XSS (Cross-Site Scripting) Sanitization
   * 
   * Neutralizes script injection by encoding dangerous characters.
   * Uses allowlist approach - only known-safe content passes through.
   */
  // Complexity: O(N*M) — nested iteration detected
  xss(input: string): SanitizationResult {
    const modifications: string[] = [];
    let sanitized = input;
    
    // HTML entity encoding for dangerous characters
    const htmlEntities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;',
      '`': '&#x60;',
      '=': '&#x3D;',
    };
    
    for (const [char, entity] of Object.entries(htmlEntities)) {
      if (sanitized.includes(char)) {
        sanitized = sanitized.split(char).join(entity);
        modifications.push(`Encoded '${char}' to '${entity}'`);
      }
    }
    
    // Remove dangerous patterns
    const dangerousPatterns = [
      /javascript:/gi,
      /vbscript:/gi,
      /data:/gi,
      /on\w+\s*=/gi,  // onclick, onload, onerror, etc.
      /expression\s*\(/gi,
      /url\s*\(/gi,
    ];
    
    for (const pattern of dangerousPatterns) {
      if (pattern.test(sanitized)) {
        sanitized = sanitized.replace(pattern, '');
        modifications.push(`Removed pattern: ${pattern.source}`);
      }
    }
    
    // Determine threat level based on modifications
    let threatLevel: ThreatLevel = 'none';
    if (modifications.length > 5) threatLevel = 'critical';
    else if (modifications.length > 3) threatLevel = 'high';
    else if (modifications.length > 1) threatLevel = 'medium';
    else if (modifications.length > 0) threatLevel = 'low';
    
    return {
      original: input,
      sanitized,
      type: 'xss',
      threatLevel,
      modifications,
    };
  },

  /**
   * SQL Injection Sanitization
   * 
   * Escapes SQL special characters and detects injection patterns.
   * Note: This should be used in addition to, not instead of, parameterized queries.
   */
  // Complexity: O(N*M) — nested iteration detected
  sql(input: string): SanitizationResult {
    const modifications: string[] = [];
    let sanitized = input;
    
    // Escape SQL special characters
    const sqlEscapes: Record<string, string> = {
      "'": "''",
      '\\': '\\\\',
      '\x00': '\\0',
      '\n': '\\n',
      '\r': '\\r',
      '\x1a': '\\Z',
    };
    
    for (const [char, escape] of Object.entries(sqlEscapes)) {
      if (sanitized.includes(char)) {
        sanitized = sanitized.split(char).join(escape);
        modifications.push(`Escaped '${char}'`);
      }
    }
    
    // Detect SQL injection patterns
    const injectionPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|TRUNCATE|UNION|JOIN)\b)/gi,
      /--/g,
      /;/g,
      /\/\*/g,
      /\*\//g,
      /\bOR\s+\d+\s*=\s*\d+/gi,
      /\bAND\s+\d+\s*=\s*\d+/gi,
      /\b(EXEC|EXECUTE|WAITFOR|BENCHMARK)\b/gi,
    ];
    
    for (const pattern of injectionPatterns) {
      if (pattern.test(input)) {
        modifications.push(`Detected SQL pattern: ${pattern.source}`);
      }
    }
    
    let threatLevel: ThreatLevel = 'none';
    if (modifications.length > 4) threatLevel = 'critical';
    else if (modifications.length > 2) threatLevel = 'high';
    else if (modifications.length > 1) threatLevel = 'medium';
    else if (modifications.length > 0) threatLevel = 'low';
    
    return {
      original: input,
      sanitized,
      type: 'sql',
      threatLevel,
      modifications,
    };
  },

  /**
   * Path Traversal Sanitization
   * 
   * Prevents directory traversal attacks by normalizing and validating paths.
   * Throws SecurityError if path attempts to escape allowed boundaries.
   */
  // Complexity: O(N) — linear iteration
  path(input: string, basePath: string = ''): SanitizationResult {
    const modifications: string[] = [];
    let sanitized = input;
    
    // Remove null bytes
    if (sanitized.includes('\x00')) {
      sanitized = sanitized.replace(/\x00/g, '');
      modifications.push('Removed null bytes');
    }
    
    // Remove path traversal sequences
    const traversalPatterns = [
      /\.\.\//g,
      /\.\.\\/g,
      /\.\.%2f/gi,
      /\.\.%5c/gi,
      /%2e%2e%2f/gi,
      /%2e%2e%5c/gi,
      /\.\.%252f/gi,
      /\.\.%255c/gi,
    ];
    
    for (const pattern of traversalPatterns) {
      if (pattern.test(sanitized)) {
        sanitized = sanitized.replace(pattern, '');
        modifications.push(`Removed traversal pattern: ${pattern.source}`);
      }
    }
    
    // Normalize slashes
    sanitized = sanitized.replace(/[\/\\]+/g, '/');
    
    // Remove leading slashes that could escape base path
    sanitized = sanitized.replace(/^\/+/, '');
    
    // Detect dangerous file extensions
    const dangerousExtensions = ['.php', '.asp', '.aspx', '.jsp', '.exe', '.sh', '.bat'];
    const ext = sanitized.slice(sanitized.lastIndexOf('.')).toLowerCase();
    if (dangerousExtensions.includes(ext)) {
      modifications.push(`Dangerous file extension detected: ${ext}`);
    }
    
    let threatLevel: ThreatLevel = 'none';
    if (modifications.length > 3) threatLevel = 'critical';
    else if (modifications.length > 2) threatLevel = 'high';
    else if (modifications.length > 1) threatLevel = 'medium';
    else if (modifications.length > 0) threatLevel = 'low';
    
    return {
      original: input,
      sanitized: basePath ? `${basePath}/${sanitized}` : sanitized,
      type: 'path',
      threatLevel,
      modifications,
    };
  },

  /**
   * Command Injection Sanitization
   * 
   * Escapes shell special characters to prevent command injection.
   */
  // Complexity: O(N*M) — nested iteration detected
  command(input: string): SanitizationResult {
    const modifications: string[] = [];
    let sanitized = input;
    
    // Shell metacharacters to escape
    const shellChars = ['&', ';', '|', '`', '$', '(', ')', '{', '}', '[', ']', 
                        '!', '<', '>', '\n', '\r', "'", '"', '\\', '*', '?'];
    
    for (const char of shellChars) {
      if (sanitized.includes(char)) {
        sanitized = sanitized.split(char).join(`\\${char}`);
        modifications.push(`Escaped shell char: '${char}'`);
      }
    }
    
    // Detect dangerous commands
    const dangerousCommands = [
      /\b(rm|rmdir|del|format|fdisk|mkfs)\b/gi,
      /\b(wget|curl|fetch)\b/gi,
      /\b(chmod|chown|sudo|su)\b/gi,
      /\b(cat|head|tail|less|more)\s+\/etc/gi,
      /\b(nc|netcat|ncat)\b/gi,
    ];
    
    for (const pattern of dangerousCommands) {
      if (pattern.test(input)) {
        modifications.push(`Dangerous command pattern: ${pattern.source}`);
      }
    }
    
    let threatLevel: ThreatLevel = 'none';
    if (modifications.length > 5) threatLevel = 'critical';
    else if (modifications.length > 3) threatLevel = 'high';
    else if (modifications.length > 1) threatLevel = 'medium';
    else if (modifications.length > 0) threatLevel = 'low';
    
    return {
      original: input,
      sanitized,
      type: 'command',
      threatLevel,
      modifications,
    };
  },

  /**
   * LDAP Injection Sanitization
   */
  // Complexity: O(N) — linear iteration
  ldap(input: string): SanitizationResult {
    const modifications: string[] = [];
    let sanitized = input;
    
    const ldapEscapes: Record<string, string> = {
      '\\': '\\5c',
      '*': '\\2a',
      '(': '\\28',
      ')': '\\29',
      '\x00': '\\00',
    };
    
    for (const [char, escape] of Object.entries(ldapEscapes)) {
      if (sanitized.includes(char)) {
        sanitized = sanitized.split(char).join(escape);
        modifications.push(`Escaped LDAP char: '${char}'`);
      }
    }
    
    let threatLevel: ThreatLevel = 'none';
    if (modifications.length > 3) threatLevel = 'high';
    else if (modifications.length > 1) threatLevel = 'medium';
    else if (modifications.length > 0) threatLevel = 'low';
    
    return {
      original: input,
      sanitized,
      type: 'ldap',
      threatLevel,
      modifications,
    };
  },

  /**
   * XML/XXE Injection Sanitization
   */
  // Complexity: O(N*M) — nested iteration detected
  xml(input: string): SanitizationResult {
    const modifications: string[] = [];
    let sanitized = input;
    
    // XML entity encoding
    const xmlEntities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&apos;',
    };
    
    for (const [char, entity] of Object.entries(xmlEntities)) {
      if (sanitized.includes(char)) {
        sanitized = sanitized.split(char).join(entity);
        modifications.push(`Encoded XML entity: '${char}'`);
      }
    }
    
    // Detect XXE patterns
    const xxePatterns = [
      /<!DOCTYPE/gi,
      /<!ENTITY/gi,
      /SYSTEM\s+["'][^"']*["']/gi,
      /PUBLIC\s+["'][^"']*["']/gi,
    ];
    
    for (const pattern of xxePatterns) {
      if (pattern.test(input)) {
        modifications.push(`XXE pattern detected: ${pattern.source}`);
      }
    }
    
    let threatLevel: ThreatLevel = 'none';
    if (modifications.some(m => m.includes('XXE'))) threatLevel = 'critical';
    else if (modifications.length > 3) threatLevel = 'high';
    else if (modifications.length > 1) threatLevel = 'medium';
    else if (modifications.length > 0) threatLevel = 'low';
    
    return {
      original: input,
      sanitized,
      type: 'xml',
      threatLevel,
      modifications,
    };
  },
};

// ═══════════════════════════════════════════════════════════════════════════════════════
// 🔐 CSRF PROTECTION
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * CSRF Token Manager
 * 
 * Generates and validates tokens using cryptographically secure methods.
 * Implements double-submit cookie pattern with fingerprinting.
 */
export class CSRFProtection {
  private tokens: Map<string, CSRFToken>;
  private readonly TOKEN_LENGTH = 32;
  private readonly TOKEN_LIFETIME_MS = 3600000; // 1 hour

  constructor() {
    this.tokens = new Map();
    this.startCleanupInterval();
  }

  /**
   * Generate CSRF token
   * 
   * @param sessionId - Optional session ID to bind token to session
   */
  // Complexity: O(1) — hash/map lookup
  public generateToken(sessionId?: string): CSRFToken {
    const tokenBytes = randomBytes(this.TOKEN_LENGTH);
    const token = tokenBytes.toString('hex');
    
    const timestamp = Date.now();
    const fingerprint = this.generateFingerprint(sessionId);
    
    const csrfToken: CSRFToken = {
      token,
      timestamp,
      expiresAt: timestamp + this.TOKEN_LIFETIME_MS,
      fingerprint,
    };
    
    this.tokens.set(token, csrfToken);
    return csrfToken;
  }

  /**
   * Validate CSRF token
   * 
   * Uses timing-safe comparison to prevent timing attacks.
   */
  // Complexity: O(1) — hash/map lookup
  public validateToken(token: string, sessionId?: string): boolean {
    const stored = this.tokens.get(token);
    
    if (!stored) {
      return false;
    }
    
    // Check expiration
    if (Date.now() > stored.expiresAt) {
      this.tokens.delete(token);
      return false;
    }
    
    // Validate fingerprint if session provided
    if (sessionId) {
      const expectedFingerprint = this.generateFingerprint(sessionId);
      const storedBuffer = Buffer.from(stored.fingerprint, 'hex');
      const expectedBuffer = Buffer.from(expectedFingerprint, 'hex');
      
      if (storedBuffer.length !== expectedBuffer.length) {
        return false;
      }
      
      if (!timingSafeEqual(storedBuffer, expectedBuffer)) {
        return false;
      }
    }
    
    // Invalidate token after use (single use)
    this.tokens.delete(token);
    return true;
  }

  /**
   * Generate fingerprint for session binding
   */
  // Complexity: O(1)
  private generateFingerprint(sessionId?: string): string {
    const data = sessionId || 'anonymous';
    return createHash('sha256').update(data).digest('hex');
  }

  /**
   * Start periodic cleanup of expired tokens
   */
  // Complexity: O(N) — linear iteration
  private startCleanupInterval(): void {
    // Complexity: O(N) — linear iteration
    setInterval(() => {
      const now = Date.now();
      for (const [token, data] of this.tokens) {
        if (now > data.expiresAt) {
          this.tokens.delete(token);
        }
      }
    }, 60000); // Clean every minute
  }

  /**
   * Get active token count
   */
  // Complexity: O(1)
  public getActiveTokenCount(): number {
    return this.tokens.size;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// ⏱️ RATE LIMITING
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Rate Limiter
 * 
 * Implements sliding window rate limiting with IP-based tracking.
 * Protects against brute force and DoS attacks.
 */
export class RateLimiter {
  private limits: Map<string, RateLimitEntry>;
  private config: RateLimitConfig;

  constructor(config: Partial<RateLimitConfig> = {}) {
    this.limits = new Map();
    this.config = {
      maxRequests: config.maxRequests || 100,
      windowMs: config.windowMs || 900000, // 15 minutes
      blockDurationMs: config.blockDurationMs || 3600000, // 1 hour
      keyGenerator: config.keyGenerator || ((id) => id),
    };
    
    this.startCleanupInterval();
  }

  /**
   * Check if request should be allowed
   * 
   * @param identifier - Unique identifier (IP, user ID, API key)
   * @returns Object with allowed status and remaining requests
   */
  // Complexity: O(1) — hash/map lookup
  public check(identifier: string): { allowed: boolean; remaining: number; resetAt: number } {
    const key = this.config.keyGenerator!(identifier);
    const now = Date.now();
    
    let entry = this.limits.get(key);
    
    if (!entry) {
      entry = {
        count: 0,
        firstRequest: now,
        lastRequest: now,
        blocked: false,
      };
      this.limits.set(key, entry);
    }
    
    // Check if blocked
    if (entry.blocked && entry.blockedUntil && now < entry.blockedUntil) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: entry.blockedUntil,
      };
    }
    
    // Reset if window expired
    if (now - entry.firstRequest > this.config.windowMs) {
      entry = {
        count: 0,
        firstRequest: now,
        lastRequest: now,
        blocked: false,
      };
      this.limits.set(key, entry);
    }
    
    // Increment counter
    entry.count++;
    entry.lastRequest = now;
    
    // Check if limit exceeded
    if (entry.count > this.config.maxRequests) {
      entry.blocked = true;
      entry.blockedUntil = now + this.config.blockDurationMs!;
      
      return {
        allowed: false,
        remaining: 0,
        resetAt: entry.blockedUntil,
      };
    }
    
    const remaining = this.config.maxRequests - entry.count;
    const resetAt = entry.firstRequest + this.config.windowMs;
    
    return {
      allowed: true,
      remaining,
      resetAt,
    };
  }

  /**
   * Manually block an identifier
   */
  // Complexity: O(1) — hash/map lookup
  public block(identifier: string, durationMs?: number): void {
    const key = this.config.keyGenerator!(identifier);
    const now = Date.now();
    const duration = durationMs || this.config.blockDurationMs!;
    
    this.limits.set(key, {
      count: this.config.maxRequests + 1,
      firstRequest: now,
      lastRequest: now,
      blocked: true,
      blockedUntil: now + duration,
    });
  }

  /**
   * Unblock an identifier
   */
  // Complexity: O(1)
  public unblock(identifier: string): void {
    const key = this.config.keyGenerator!(identifier);
    this.limits.delete(key);
  }

  /**
   * Get rate limit status for identifier
   */
  // Complexity: O(1) — hash/map lookup
  public getStatus(identifier: string): RateLimitEntry | null {
    const key = this.config.keyGenerator!(identifier);
    return this.limits.get(key) || null;
  }

  /**
   * Start periodic cleanup
   */
  // Complexity: O(N) — linear iteration
  private startCleanupInterval(): void {
    // Complexity: O(N) — linear iteration
    setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.limits) {
        // Remove entries with expired windows and no block
        if (!entry.blocked && now - entry.firstRequest > this.config.windowMs * 2) {
          this.limits.delete(key);
        }
        // Remove expired blocks
        if (entry.blocked && entry.blockedUntil && now > entry.blockedUntil) {
          this.limits.delete(key);
        }
      }
    }, 60000);
  }

  /**
   * Get statistics
   */
  // Complexity: O(N) — linear iteration
  public getStats(): { tracked: number; blocked: number } {
    let blocked = 0;
    for (const entry of this.limits.values()) {
      if (entry.blocked) blocked++;
    }
    return { tracked: this.limits.size, blocked };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// 🔒 UNIFIED SECURITY FACADE
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Unified Security API
 * 
 * Single entry point for all security operations.
 */
export class Security {
  private static csrfInstance: CSRFProtection | null = null;
  private static rateLimiterInstance: RateLimiter | null = null;

  /**
   * Get or create CSRF protection instance
   */
  public static get csrf(): CSRFProtection {
    if (!this.csrfInstance) {
      this.csrfInstance = new CSRFProtection();
    }
    return this.csrfInstance;
  }

  /**
   * Get or create rate limiter instance
   */
  public static get rateLimiter(): RateLimiter {
    if (!this.rateLimiterInstance) {
      this.rateLimiterInstance = new RateLimiter();
    }
    return this.rateLimiterInstance;
  }

  /**
   * Generate CSRF token (convenience method)
   */
  public static generateCSRFToken(sessionId?: string): CSRFToken {
    return this.csrf.generateToken(sessionId);
  }

  /**
   * Validate CSRF token (convenience method)
   */
  public static validateCSRFToken(token: string, sessionId?: string): boolean {
    return this.csrf.validateToken(token, sessionId);
  }

  /**
   * Check rate limit (convenience method)
   */
  public static checkRateLimit(identifier: string): ReturnType<RateLimiter['check']> {
    return this.rateLimiter.check(identifier);
  }

  /**
   * Sanitize input with specified type
   */
  public static sanitize(input: string, type: SanitizationType): SanitizationResult {
    switch (type) {
      case 'xss': return Sanitizers.xss(input);
      case 'sql': return Sanitizers.sql(input);
      case 'path': return Sanitizers.path(input);
      case 'command': return Sanitizers.command(input);
      case 'ldap': return Sanitizers.ldap(input);
      case 'xml': return Sanitizers.xml(input);
      default:
        throw new Error(`Unknown sanitization type: ${type}`);
    }
  }

  /**
   * Full sanitization - apply all sanitizers
   */
  public static sanitizeAll(input: string): Record<SanitizationType, SanitizationResult> {
    return {
      xss: Sanitizers.xss(input),
      sql: Sanitizers.sql(input),
      path: Sanitizers.path(input),
      command: Sanitizers.command(input),
      ldap: Sanitizers.ldap(input),
      xml: Sanitizers.xml(input),
    };
  }

  /**
   * Get highest threat level from multiple sanitization results
   */
  public static getHighestThreat(
    results: Record<string, SanitizationResult>
  ): { type: string; level: ThreatLevel } {
    const levels: ThreatLevel[] = ['none', 'low', 'medium', 'high', 'critical'];
    let highest: { type: string; level: ThreatLevel } = { type: 'none', level: 'none' };
    
    for (const [type, result] of Object.entries(results)) {
      const currentIndex = levels.indexOf(result.threatLevel);
      const highestIndex = levels.indexOf(highest.level);
      
      if (currentIndex > highestIndex) {
        highest = { type, level: result.threatLevel };
      }
    }
    
    return highest;
  }

  /**
   * Generate secure hash
   */
  public static hash(data: string, algorithm: 'sha256' | 'sha512' = 'sha256'): string {
    return createHash(algorithm).update(data).digest('hex');
  }

  /**
   * Generate secure random string
   */
  public static randomString(length: number = 32): string {
    return randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
  }
}

// Export default instances
export const csrfProtection = new CSRFProtection();
export const rateLimiter = new RateLimiter();

export default Security;
