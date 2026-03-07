"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CRYPTO-RUST TYPESCRIPT FALLBACK
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Pure TypeScript implementation of crypto operations.
 * Used when Rust binary is not available (missing build tools, cross-platform).
 *
 * Performance: ~10-20x slower than Rust, but fully functional.
 * Security: Uses Node.js crypto module (OpenSSL-backed).
 *
 * This fallback ensures the system works even without:
 * - Rust toolchain
 * - C++ Build Tools / MSVC linker
 * - Platform-specific binaries
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
exports.moduleInfo = void 0;
exports.encrypt = encrypt;
exports.decrypt = decrypt;
exports.blake3_hash = blake3_hash;
exports.hash_password = hash_password;
exports.verify_password = verify_password;
exports.sign = sign;
exports.verify_signature = verify_signature;
exports.__health__ = __health__;
const crypto = __importStar(require("crypto"));
// Algorithm constants
const AES_ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const PBKDF2_ITERATIONS = 100000;
/**
 * Encrypt data using AES-256-GCM
 * Equivalent to Rust: aes_gcm::encrypt
 *
 * @param data - Plaintext data to encrypt
 * @param secret - Encryption key/password
 * @returns Encrypted data as hex string (iv:authTag:ciphertext)
 */
function encrypt(data, secret) {
    const key = crypto.scryptSync(secret, 'qantum-salt', KEY_LENGTH);
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(AES_ALGORITHM, key, iv);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}
/**
 * Decrypt data using AES-256-GCM
 * Equivalent to Rust: aes_gcm::decrypt
 *
 * @param encryptedData - Encrypted data (iv:authTag:ciphertext)
 * @param secret - Decryption key/password
 * @returns Decrypted plaintext string
 */
function decrypt(encryptedData, secret) {
    const parts = encryptedData.split(':');
    if (parts.length !== 3) {
        throw new Error('Invalid encrypted data format');
    }
    const [ivHex, authTagHex, encrypted] = parts;
    const key = crypto.scryptSync(secret, 'qantum-salt', KEY_LENGTH);
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv(AES_ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}
/**
 * Calculate BLAKE3 hash
 * Note: Node.js doesn't have native BLAKE3, using SHA3-256 as secure alternative
 * When Rust is available, true BLAKE3 will be used (faster)
 *
 * @param data - Data to hash
 * @returns Hash as hex string
 */
function blake3_hash(data) {
    // SHA3-256 is cryptographically secure fallback for BLAKE3
    // Performance: SHA3 ~3x slower than BLAKE3, but still fast
    return crypto
        .createHash('sha3-256')
        .update(data)
        .digest('hex');
}
/**
 * Hash password using Argon2-like method
 * Uses PBKDF2 with high iterations as secure fallback
 * When Rust is available, true Argon2id will be used
 *
 * @param password - Password to hash
 * @returns Hashed password (salt:hash)
 */
async function hash_password(password) {
    return new Promise((resolve, reject) => {
        const salt = crypto.randomBytes(SALT_LENGTH);
        crypto.pbkdf2(password, salt, PBKDF2_ITERATIONS, KEY_LENGTH, 'sha512', (err, derivedKey) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(`${salt.toString('hex')}:${derivedKey.toString('hex')}`);
            }
        });
    });
}
/**
 * Verify password against hash
 *
 * @param password - Password to verify
 * @param hash - Stored hash (salt:hash)
 * @returns true if password matches
 */
async function verify_password(password, hash) {
    return new Promise((resolve, reject) => {
        const parts = hash.split(':');
        if (parts.length !== 2) {
            resolve(false);
            return;
        }
        const [saltHex, keyHex] = parts;
        const salt = Buffer.from(saltHex, 'hex');
        const storedKey = Buffer.from(keyHex, 'hex');
        crypto.pbkdf2(password, salt, PBKDF2_ITERATIONS, KEY_LENGTH, 'sha512', (err, derivedKey) => {
            if (err) {
                reject(err);
            }
            else {
                // Constant-time comparison to prevent timing attacks
                resolve(crypto.timingSafeEqual(storedKey, derivedKey));
            }
        });
    });
}
/**
 * Sign data using Ed25519-like signature
 * Uses HMAC-SHA512 as fallback (still cryptographically secure)
 * When Rust is available, true Ed25519 will be used
 *
 * @param data - Data to sign
 * @param privateKey - Private/secret key
 * @returns Signature as hex string
 */
function sign(data, privateKey) {
    return crypto
        .createHmac('sha512', privateKey)
        .update(data)
        .digest('hex');
}
/**
 * Verify signature
 *
 * @param data - Original data
 * @param signature - Signature to verify
 * @param publicKey - Public/secret key (in HMAC mode, same as private)
 * @returns true if signature is valid
 */
function verify_signature(data, signature, publicKey) {
    const expectedSignature = sign(data, publicKey);
    try {
        return crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expectedSignature, 'hex'));
    }
    catch {
        return false;
    }
}
/**
 * Health check function (required by polyglot system)
 * @returns Always resolves (TypeScript fallback is always healthy)
 */
async function __health__() {
    return true;
}
/**
 * Module info for debugging
 */
exports.moduleInfo = {
    name: 'crypto-rust-fallback',
    language: 'typescript',
    version: '1.0.0',
    capabilities: [
        'encrypt',
        'decrypt',
        'blake3_hash',
        'hash_password',
        'verify_password',
        'sign',
        'verify_signature'
    ],
    note: 'TypeScript fallback - using Node.js crypto (OpenSSL). For maximum performance, compile Rust module.'
};
