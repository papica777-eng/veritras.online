"use strict";
/**
 * EvolutionNotary — Qantum Module
 * @module EvolutionNotary
 * @path omni_core/governance/EvolutionNotary.ts
 * @auto-documented BrutalDocEngine v2.1
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
exports.EvolutionNotary = void 0;
const ed25519 = __importStar(require("@noble/ed25519"));
const crypto_1 = require("crypto");
/**
 * 🔐 EvolutionNotary - Cryptographic Sovereignty
 *
 * Uses Ed25519 for verification of architectural changes.
 * NOT A SINGLE BYTE changes without a valid digital signature.
 *
 * Security Model:
 * 1. Every evolution proposal is hashed (SHA-256)
 * 2. Administrator signs the hash with their private key
 * 3. System verifies signature with administrator's public key
 * 4. Only verified patches are applied
 *
 * Compliance: Non-repudiation, audit trail, GDPR Article 32
 */
class EvolutionNotary {
    /**
     * Creates a deterministic hash of the proposed patch.
     *
     * @param code - The code/patch to be hashed
     * @returns SHA-256 hash as Uint8Array
     */
    static createPatchHash(code) {
        return (0, crypto_1.createHash)('sha256').update(code).digest();
    }
    /**
     * Verifies the administrator's signature.
     *
     * @param code - The code that was signed
     * @param signature - The Ed25519 signature (hex string)
     * @param publicKey - Administrator's public key (hex string)
     * @returns true if signature is valid, false otherwise
     */
    static async verifyAuthorization(code, signature, publicKey) {
        try {
            const hash = this.createPatchHash(code);
            const signatureBytes = hexToBytes(signature);
            const publicKeyBytes = hexToBytes(publicKey);
            return await ed25519.verify(signatureBytes, hash, publicKeyBytes);
        }
        catch (error) {
            // Invalid signature format or verification failure
            return false;
        }
    }
    /**
     * Signs a patch with the administrator's private key.
     *
     * @param code - The code to sign
     * @param privateKey - Administrator's private key (hex string)
     * @returns Ed25519 signature (hex string)
     */
    static async signPatch(code, privateKey) {
        const hash = this.createPatchHash(code);
        const privateKeyBytes = hexToBytes(privateKey);
        // SAFETY: async operation — wrap in try-catch for production resilience
        const signature = await ed25519.sign(hash, privateKeyBytes);
        return bytesToHex(signature);
    }
    /**
     * Generates a new Ed25519 keypair for an administrator.
     *
     * @returns Object containing privateKey and publicKey (both hex strings)
     */
    static async generateKeypair() {
        const privateKey = ed25519.utils.randomPrivateKey();
        // SAFETY: async operation — wrap in try-catch for production resilience
        const publicKey = await ed25519.getPublicKey(privateKey);
        return {
            privateKey: bytesToHex(privateKey),
            publicKey: bytesToHex(publicKey),
        };
    }
}
exports.EvolutionNotary = EvolutionNotary;
/**
 * Utility: Converts hex string to Uint8Array
 */
function hexToBytes(hex) {
    if (hex.length % 2 !== 0) {
        throw new Error('Invalid hex string length');
    }
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < bytes.length; i++) {
        bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
    }
    return bytes;
}
/**
 * Utility: Converts Uint8Array to hex string
 */
function bytesToHex(bytes) {
    return Array.from(bytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}
