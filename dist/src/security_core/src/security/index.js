"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Roles = exports.Sanitizers = exports.Validators = exports.createSchema = exports.Security = exports.ValidateInput = exports.sanitizers = exports.validators = exports.InputValidator = exports.Schema = exports.RequirePermission = exports.RequireRole = exports.Secured = exports.getRBAC = exports.getAuthGuard = exports.Role = exports.RBAC = exports.AuthGuard = exports.getEncryption = exports.SecureVault = exports.EncryptionService = exports.auth = exports.getAuthTester = exports.PasswordStrengthChecker = exports.JWTValidator = exports.AuthenticationTester = exports.security = exports.getHeaderChecker = exports.getSecurityScanner = exports.SecurityHeaderChecker = exports.SecurityScanner = void 0;
exports.getSecurity = getSecurity;
// ═══════════════════════════════════════════════════════════════════════════════
// VULNERABILITY SCANNING
// ═══════════════════════════════════════════════════════════════════════════════
var scanner_1 = require("./scanner");
Object.defineProperty(exports, "SecurityScanner", { enumerable: true, get: function () { return scanner_1.SecurityScanner; } });
Object.defineProperty(exports, "SecurityHeaderChecker", { enumerable: true, get: function () { return scanner_1.SecurityHeaderChecker; } });
Object.defineProperty(exports, "getSecurityScanner", { enumerable: true, get: function () { return scanner_1.getSecurityScanner; } });
Object.defineProperty(exports, "getHeaderChecker", { enumerable: true, get: function () { return scanner_1.getHeaderChecker; } });
Object.defineProperty(exports, "security", { enumerable: true, get: function () { return scanner_1.security; } });
// ═══════════════════════════════════════════════════════════════════════════════
// AUTHENTICATION TESTING
// ═══════════════════════════════════════════════════════════════════════════════
var auth_1 = require("../../../../scripts/qantum/api/unified/middleware/auth");
Object.defineProperty(exports, "AuthenticationTester", { enumerable: true, get: function () { return auth_1.AuthenticationTester; } });
Object.defineProperty(exports, "JWTValidator", { enumerable: true, get: function () { return auth_1.JWTValidator; } });
Object.defineProperty(exports, "PasswordStrengthChecker", { enumerable: true, get: function () { return auth_1.PasswordStrengthChecker; } });
Object.defineProperty(exports, "getAuthTester", { enumerable: true, get: function () { return auth_1.getAuthTester; } });
Object.defineProperty(exports, "auth", { enumerable: true, get: function () { return auth_1.auth; } });
// ═══════════════════════════════════════════════════════════════════════════════
// ENCRYPTION
// ═══════════════════════════════════════════════════════════════════════════════
var encryption_1 = require("./encryption");
Object.defineProperty(exports, "EncryptionService", { enumerable: true, get: function () { return encryption_1.EncryptionService; } });
Object.defineProperty(exports, "SecureVault", { enumerable: true, get: function () { return encryption_1.SecureVault; } });
Object.defineProperty(exports, "getEncryption", { enumerable: true, get: function () { return encryption_1.getEncryption; } });
// ═══════════════════════════════════════════════════════════════════════════════
// AUTHENTICATION
// ═══════════════════════════════════════════════════════════════════════════════
var auth_guard_1 = require("./auth-guard");
Object.defineProperty(exports, "AuthGuard", { enumerable: true, get: function () { return auth_guard_1.AuthGuard; } });
Object.defineProperty(exports, "RBAC", { enumerable: true, get: function () { return auth_guard_1.RBAC; } });
Object.defineProperty(exports, "Role", { enumerable: true, get: function () { return auth_guard_1.Role; } });
Object.defineProperty(exports, "getAuthGuard", { enumerable: true, get: function () { return auth_guard_1.getAuthGuard; } });
Object.defineProperty(exports, "getRBAC", { enumerable: true, get: function () { return auth_guard_1.getRBAC; } });
Object.defineProperty(exports, "Secured", { enumerable: true, get: function () { return auth_guard_1.Secured; } });
Object.defineProperty(exports, "RequireRole", { enumerable: true, get: function () { return auth_guard_1.RequireRole; } });
Object.defineProperty(exports, "RequirePermission", { enumerable: true, get: function () { return auth_guard_1.RequirePermission; } });
// ═══════════════════════════════════════════════════════════════════════════════
// VALIDATION
// ═══════════════════════════════════════════════════════════════════════════════
var validator_1 = require("./validator");
Object.defineProperty(exports, "Schema", { enumerable: true, get: function () { return validator_1.Schema; } });
Object.defineProperty(exports, "InputValidator", { enumerable: true, get: function () { return validator_1.InputValidator; } });
Object.defineProperty(exports, "validators", { enumerable: true, get: function () { return validator_1.validators; } });
Object.defineProperty(exports, "sanitizers", { enumerable: true, get: function () { return validator_1.sanitizers; } });
Object.defineProperty(exports, "ValidateInput", { enumerable: true, get: function () { return validator_1.ValidateInput; } });
// ═══════════════════════════════════════════════════════════════════════════════
// SECURITY FACADE
// ═══════════════════════════════════════════════════════════════════════════════
const encryption_2 = require("./encryption");
const auth_guard_2 = require("./auth-guard");
const validator_2 = require("./validator");
/**
 * Security Facade - Unified security interface
 */
class Security {
    encryption;
    auth;
    rbac;
    validator;
    constructor(config = {}) {
        this.encryption = encryption_2.EncryptionService.getInstance(config.encryption);
        this.auth = auth_guard_2.AuthGuard.getInstance();
        this.rbac = new auth_guard_2.RBAC();
        this.validator = new validator_2.InputValidator();
        // Register common schemas
        this.registerCommonSchemas();
    }
    // Complexity: O(1)
    registerCommonSchemas() {
        // User registration schema
        const userRegistration = validator_2.Schema.create()
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
        const login = validator_2.Schema.create().string('username').required().string('password').required();
        this.validator.register('login', login);
    }
    /**
     * Quick encrypt
     */
    // Complexity: O(1)
    encrypt(data) {
        return this.encryption.encrypt(data);
    }
    /**
     * Quick decrypt
     */
    // Complexity: O(1)
    decrypt(encrypted) {
        return this.encryption.decryptToString(encrypted);
    }
    /**
     * Quick hash
     */
    // Complexity: O(1)
    hash(data) {
        return this.encryption.hash(data);
    }
    /**
     * Quick validate
     */
    // Complexity: O(1)
    validate(schemaName, data) {
        const result = this.validator.validate(schemaName, data);
        return result.valid;
    }
    /**
     * Quick authorize
     */
    // Complexity: O(1)
    authorize(token, resource, action) {
        const result = this.auth.authorize(token, resource, action);
        return result.authorized;
    }
}
exports.Security = Security;
// Singleton
let securityInstance = null;
function getSecurity(config) {
    if (!securityInstance) {
        securityInstance = new Security(config);
    }
    return securityInstance;
}
// ═══════════════════════════════════════════════════════════════════════════════
// RE-EXPORT UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════
const createSchema = () => validator_2.Schema.create();
exports.createSchema = createSchema;
exports.Validators = validator_2.validators;
exports.Sanitizers = validator_2.sanitizers;
exports.Roles = auth_guard_2.Role;
exports.default = Security;
