/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                               ║
 * ║   QAntum SECURITY MODULE                                                      ║
 * ║   "Encryption, Authentication, Validation, Scanning"                          ║
 * ║                                                                               ║
 * ║   TODO B #35-43 - Security Complete                                           ║
 * ║                                                                               ║
 * ║   © 2025-2026 QAntum | Dimitar Prodromov                                        ║
 * ║                                                                               ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

// ═══════════════════════════════════════════════════════════════════════════════
// VULNERABILITY SCANNING
// ═══════════════════════════════════════════════════════════════════════════════

export {
  SecurityScanner,
  SecurityHeaderChecker,
  getSecurityScanner,
  getHeaderChecker,
  security,
  type Vulnerability,
  type VulnerabilitySeverity,
  type VulnerabilityType,
  type ScanConfig,
  type ScanResult,
} from './scanner';

// ═══════════════════════════════════════════════════════════════════════════════
// AUTHENTICATION TESTING
// ═══════════════════════════════════════════════════════════════════════════════

export {
  AuthenticationTester,
  JWTValidator,
  PasswordStrengthChecker,
  getAuthTester,
  auth,
  type AuthTestConfig,
  type AuthTestResult,
  type AuthType,
  type JWTConfig,
} from '../../../../scripts/qantum/api/unified/middleware/auth';

// ═══════════════════════════════════════════════════════════════════════════════
// ENCRYPTION
// ═══════════════════════════════════════════════════════════════════════════════

export {
  EncryptionService,
  SecureVault,
  getEncryption,
  type EncryptedData,
  type EncryptionConfig,
  type KeyInfo,
} from './encryption';

// ═══════════════════════════════════════════════════════════════════════════════
// AUTHENTICATION
// ═══════════════════════════════════════════════════════════════════════════════

export {
  AuthGuard,
  RBAC,
  Role,
  getAuthGuard,
  getRBAC,
  Secured,
  RequireRole,
  RequirePermission,
  type User,
  type Permission,
  type Token,
  type AuthResult,
  type Session,
} from './auth-guard';

// ═══════════════════════════════════════════════════════════════════════════════
// VALIDATION
// ═══════════════════════════════════════════════════════════════════════════════

export {
  Schema,
  InputValidator,
  validators,
  sanitizers,
  ValidateInput,
  type ValidatorFn,
  type ValidationResult,
  type ValidationError,
  type FieldSchema,
  type SchemaDefinition,
} from './validator';

// ═══════════════════════════════════════════════════════════════════════════════
// SECURITY FACADE
// ═══════════════════════════════════════════════════════════════════════════════

import { EncryptionService } from './encryption';
import { AuthGuard, RBAC, Role } from './auth-guard';
import { Schema, InputValidator, validators, sanitizers } from './validator';

export interface SecurityConfig {
  encryption?: {
    algorithm?: 'aes-256-gcm' | 'aes-256-cbc';
    keyDerivation?: 'pbkdf2' | 'scrypt';
    iterations?: number;
  };
  auth?: {
    accessTokenTTL?: number;
    refreshTokenTTL?: number;
    sessionTTL?: number;
  };
}

/**
 * Security Facade - Unified security interface
 */
export class Security {
  readonly encryption: EncryptionService;
  readonly auth: AuthGuard;
  readonly rbac: RBAC;
  readonly validator: InputValidator;

  constructor(config: SecurityConfig = {}) {
    this.encryption = EncryptionService.getInstance(config.encryption);
    this.auth = AuthGuard.getInstance();
    this.rbac = new RBAC();
    this.validator = new InputValidator();

    // Register common schemas
    this.registerCommonSchemas();
  }

  // Complexity: O(1)
  private registerCommonSchemas(): void {
    // User registration schema
    const userRegistration = Schema.create()
      .string('username')
      .required()
      .minLength(3)
      .maxLength(50)
      .alphanumeric()
      .string('email')
      .required()
      .email()
      .string('password')
      .required()
      .minLength(8);

    this.validator.register('userRegistration', userRegistration);

    // Login schema
    const login = Schema.create().string('username').required().string('password').required();

    this.validator.register('login', login);
  }

  /**
   * Quick encrypt
   */
  // Complexity: O(1)
  encrypt(data: string): any {
    return this.encryption.encrypt(data);
  }

  /**
   * Quick decrypt
   */
  // Complexity: O(1)
  decrypt(encrypted: any): string {
    return this.encryption.decryptToString(encrypted);
  }

  /**
   * Quick hash
   */
  // Complexity: O(1)
  hash(data: string): string {
    return this.encryption.hash(data);
  }

  /**
   * Quick validate
   */
  // Complexity: O(1)
  validate(schemaName: string, data: any): boolean {
    const result = this.validator.validate(schemaName, data);
    return result.valid;
  }

  /**
   * Quick authorize
   */
  // Complexity: O(1)
  authorize(token: string, resource: string, action: any): boolean {
    const result = this.auth.authorize(token, resource, action);
    return result.authorized;
  }
}

// Singleton
let securityInstance: Security | null = null;

export function getSecurity(config?: SecurityConfig): Security {
  if (!securityInstance) {
    securityInstance = new Security(config);
  }
  return securityInstance;
}

// ═══════════════════════════════════════════════════════════════════════════════
// RE-EXPORT UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════

export const createSchema = (): Schema => Schema.create();
export const Validators = validators;
export const Sanitizers = sanitizers;
export const Roles = Role;

export default Security;
