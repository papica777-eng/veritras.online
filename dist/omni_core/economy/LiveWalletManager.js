"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  QAntum Prime v28.0 - LIVE WALLET MANAGER                                 ║
 * ║  "Fortress Protocol" - 256-bit AES Encrypted Key Management               ║
 * ║                                                                           ║
 * ║  ⚠️  WARNING: THIS MODULE HANDLES REAL MONEY                              ║
 * ║  ⚠️  NEVER share your master password or API keys                         ║
 * ║  ⚠️  Test thoroughly in PAPER mode before going LIVE                      ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
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
exports.liveWalletManager = exports.LiveWalletManager = void 0;
const events_1 = require("events");
const crypto = __importStar(require("crypto"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// ═══════════════════════════════════════════════════════════════════════════
// FORTRESS ENCRYPTION ENGINE
// ═══════════════════════════════════════════════════════════════════════════
class FortressEncryption {
    algorithm = 'aes-256-gcm';
    keyLength = 32; // 256 bits
    ivLength = 16;
    saltLength = 32;
    tagLength = 16;
    iterations = 100000;
    // Complexity: O(1)
    deriveKey(password, salt) {
        return crypto.pbkdf2Sync(password, salt, this.iterations, this.keyLength, 'sha512');
    }
    // Complexity: O(1) — amortized
    encrypt(plaintext, password) {
        const salt = crypto.randomBytes(this.saltLength);
        const iv = crypto.randomBytes(this.ivLength);
        const key = this.deriveKey(password, salt);
        const cipher = crypto.createCipheriv(this.algorithm, key, iv, {
            authTagLength: this.tagLength,
        });
        let encrypted = cipher.update(plaintext, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        const authTag = cipher.getAuthTag();
        return [
            salt.toString('hex'),
            iv.toString('hex'),
            authTag.toString('hex'),
            encrypted,
        ].join(':');
    }
    // Complexity: O(1) — amortized
    decrypt(encryptedData, password) {
        const parts = encryptedData.split(':');
        if (parts.length !== 4) {
            throw new Error('Invalid encrypted data format');
        }
        const [saltHex, ivHex, authTagHex, ciphertext] = parts;
        const salt = Buffer.from(saltHex, 'hex');
        const iv = Buffer.from(ivHex, 'hex');
        const authTag = Buffer.from(authTagHex, 'hex');
        const key = this.deriveKey(password, salt);
        const decipher = crypto.createDecipheriv(this.algorithm, key, iv, {
            authTagLength: this.tagLength,
        });
        decipher.setAuthTag(authTag);
        let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
    // Complexity: O(1)
    hashPassword(password) {
        const salt = crypto.randomBytes(32);
        const hash = crypto.pbkdf2Sync(password, salt, this.iterations, 64, 'sha512');
        return `${salt.toString('hex')}:${hash.toString('hex')}`;
    }
    // Complexity: O(1)
    verifyPassword(password, storedHash) {
        const [saltHex, hashHex] = storedHash.split(':');
        const salt = Buffer.from(saltHex, 'hex');
        const computedHash = crypto.pbkdf2Sync(password, salt, this.iterations, 64, 'sha512');
        return computedHash.toString('hex') === hashHex;
    }
}
// ═══════════════════════════════════════════════════════════════════════════
// LIVE WALLET MANAGER
// ═══════════════════════════════════════════════════════════════════════════
class LiveWalletManager extends events_1.EventEmitter {
    fortress;
    isUnlocked = false;
    masterPassword = null;
    credentials = new Map();
    wallets = new Map();
    balances = new Map();
    withdrawalTargets = new Map();
    failedAttempts = 0;
    lockoutUntil = 0;
    autoLockTimeout = null;
    lastActivity = Date.now();
    vaultPath;
    maxFailedAttempts = 5;
    lockoutDurationMs = 300000; // 5 minutes
    autoLockMs = 600000; // 10 minutes
    constructor(vaultPath = './data/fortress') {
        super();
        this.fortress = new FortressEncryption();
        this.vaultPath = vaultPath;
        if (!fs.existsSync(vaultPath)) {
            fs.mkdirSync(vaultPath, { recursive: true });
        }
    }
    // Complexity: O(1) — amortized
    initializeVault(masterPassword) {
        if (masterPassword.length < 12)
            return false;
        const passwordHash = this.fortress.hashPassword(masterPassword);
        const config = {
            masterPasswordHash: passwordHash,
            encryptionAlgorithm: 'aes-256-gcm',
            keyDerivation: 'pbkdf2',
            iterations: 100000,
            saltLength: 32,
            ivLength: 16,
            tagLength: 16,
            vaultPath: this.vaultPath,
            autoLockMinutes: 10,
            maxFailedAttempts: 5,
        };
        fs.writeFileSync(path.join(this.vaultPath, 'config.json'), JSON.stringify(config, null, 2));
        return true;
    }
    // Complexity: O(1) — amortized
    unlock(masterPassword) {
        if (Date.now() < this.lockoutUntil)
            return false;
        const configPath = path.join(this.vaultPath, 'config.json');
        if (!fs.existsSync(configPath))
            return false;
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        if (!this.fortress.verifyPassword(masterPassword, config.masterPasswordHash)) {
            this.failedAttempts++;
            if (this.failedAttempts >= this.maxFailedAttempts) {
                this.lockoutUntil = Date.now() + this.lockoutDurationMs;
            }
            return false;
        }
        this.failedAttempts = 0;
        this.isUnlocked = true;
        this.masterPassword = masterPassword;
        this.lastActivity = Date.now();
        this.loadCredentials();
        this.startAutoLockTimer();
        return true;
    }
    // Complexity: O(1)
    lock() {
        this.isUnlocked = false;
        this.masterPassword = null;
        this.credentials.clear();
        if (this.autoLockTimeout) {
            // Complexity: O(1)
            clearTimeout(this.autoLockTimeout);
            this.autoLockTimeout = null;
        }
    }
    // Complexity: O(1)
    startAutoLockTimer() {
        if (this.autoLockTimeout) {
            // Complexity: O(1)
            clearTimeout(this.autoLockTimeout);
        }
        this.autoLockTimeout = setTimeout(() => {
            if (Date.now() - this.lastActivity > this.autoLockMs) {
                this.lock();
            }
            else {
                this.startAutoLockTimer();
            }
        }, 60000);
    }
    // Complexity: O(1)
    touchActivity() {
        this.lastActivity = Date.now();
    }
    // Complexity: O(1) — hash/map lookup
    addCredentials(creds) {
        if (!this.isUnlocked || !this.masterPassword)
            return false;
        this.touchActivity();
        const credentials = {
            ...creds,
            createdAt: Date.now(),
            lastUsed: 0,
        };
        this.credentials.set(creds.exchange, credentials);
        this.saveCredentials();
        return true;
    }
    // Complexity: O(N) — potential recursive descent
    getCredentials(exchange) {
        if (!this.isUnlocked)
            return null;
        this.touchActivity();
        const creds = this.credentials.get(exchange);
        if (creds)
            creds.lastUsed = Date.now();
        return creds || null;
    }
    // Complexity: O(N) — linear iteration
    loadCredentials() {
        const credsPath = path.join(this.vaultPath, 'credentials.enc');
        if (!fs.existsSync(credsPath))
            return;
        try {
            const encrypted = fs.readFileSync(credsPath, 'utf8');
            const decrypted = this.fortress.decrypt(encrypted, this.masterPassword);
            const credsArray = JSON.parse(decrypted);
            this.credentials.clear();
            for (const cred of credsArray) {
                this.credentials.set(cred.exchange, cred);
            }
        }
        catch (error) {
            console.error('[Fortress] ❌ Failed to load credentials:', error);
        }
    }
    // Complexity: O(1)
    saveCredentials() {
        if (!this.masterPassword)
            return;
        const credsArray = Array.from(this.credentials.values());
        const plaintext = JSON.stringify(credsArray);
        const encrypted = this.fortress.encrypt(plaintext, this.masterPassword);
        fs.writeFileSync(path.join(this.vaultPath, 'credentials.enc'), encrypted);
    }
    // Complexity: O(1) — hash/map lookup
    updateBalance(exchange, balances) {
        this.balances.set(exchange, balances);
    }
    // Complexity: O(1) — hash/map lookup
    getBalance(exchange) {
        return this.balances.get(exchange) || [];
    }
}
exports.LiveWalletManager = LiveWalletManager;
exports.liveWalletManager = new LiveWalletManager('./data/fortress');
exports.default = LiveWalletManager;
