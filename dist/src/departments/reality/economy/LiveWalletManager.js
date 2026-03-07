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
    /**
     * Derive a 256-bit key from password using PBKDF2
     */
    // Complexity: O(1)
    deriveKey(password, salt) {
        return crypto.pbkdf2Sync(password, salt, this.iterations, this.keyLength, 'sha512');
    }
    /**
     * Encrypt data with AES-256-GCM
     */
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
        // Format: salt:iv:authTag:ciphertext
        return [
            salt.toString('hex'),
            iv.toString('hex'),
            authTag.toString('hex'),
            encrypted,
        ].join(':');
    }
    /**
     * Decrypt data with AES-256-GCM
     */
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
    /**
     * Hash password for verification
     */
    // Complexity: O(1)
    hashPassword(password) {
        const salt = crypto.randomBytes(32);
        const hash = crypto.pbkdf2Sync(password, salt, this.iterations, 64, 'sha512');
        return `${salt.toString('hex')}:${hash.toString('hex')}`;
    }
    /**
     * Verify password against hash
     */
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
    // Security
    failedAttempts = 0;
    lockoutUntil = 0;
    autoLockTimeout = null;
    lastActivity = Date.now();
    // Configuration
    vaultPath;
    maxFailedAttempts = 5;
    lockoutDurationMs = 300000; // 5 minutes
    autoLockMs = 600000; // 10 minutes
    constructor(vaultPath = './data/fortress') {
        super();
        this.fortress = new FortressEncryption();
        this.vaultPath = vaultPath;
        // Ensure vault directory exists
        if (!fs.existsSync(vaultPath)) {
            fs.mkdirSync(vaultPath, { recursive: true });
        }
        console.log(`
╔═══════════════════════════════════════════════════════════════════════════╗
║  🏰 FORTRESS PROTOCOL - Live Wallet Manager                               ║
║                                                                           ║
║  ⚠️  REAL MONEY MODE                                                      ║
║  • 256-bit AES-GCM encryption                                             ║
║  • PBKDF2 key derivation (100,000 iterations)                             ║
║  • Auto-lock after 10 minutes inactivity                                  ║
║  • Max 5 failed unlock attempts                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
    `);
    }
    // ═══════════════════════════════════════════════════════════════════════
    // VAULT MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════
    /**
     * Initialize new vault with master password
     */
    // Complexity: O(1) — hash/map lookup
    initializeVault(masterPassword) {
        if (masterPassword.length < 12) {
            console.error('[Fortress] ❌ Password must be at least 12 characters');
            return false;
        }
        // Check password strength
        const hasUpper = /[A-Z]/.test(masterPassword);
        const hasLower = /[a-z]/.test(masterPassword);
        const hasNumber = /[0-9]/.test(masterPassword);
        const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(masterPassword);
        if (!(hasUpper && hasLower && hasNumber && hasSpecial)) {
            console.error('[Fortress] ❌ Password must contain uppercase, lowercase, number, and special character');
            return false;
        }
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
        console.log('[Fortress] ✅ Vault initialized successfully');
        this.emit('vault-initialized');
        return true;
    }
    /**
     * Unlock vault with master password
     */
    // Complexity: O(N)
    unlock(masterPassword) {
        // Check lockout
        if (Date.now() < this.lockoutUntil) {
            const remaining = Math.ceil((this.lockoutUntil - Date.now()) / 1000);
            console.error(`[Fortress] 🔒 Locked out. Try again in ${remaining} seconds`);
            return false;
        }
        // Load config
        const configPath = path.join(this.vaultPath, 'config.json');
        if (!fs.existsSync(configPath)) {
            console.error('[Fortress] ❌ Vault not initialized. Call initializeVault() first');
            return false;
        }
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        // Verify password
        if (!this.fortress.verifyPassword(masterPassword, config.masterPasswordHash)) {
            this.failedAttempts++;
            console.error(`[Fortress] ❌ Invalid password. Attempt ${this.failedAttempts}/${this.maxFailedAttempts}`);
            if (this.failedAttempts >= this.maxFailedAttempts) {
                this.lockoutUntil = Date.now() + this.lockoutDurationMs;
                console.error(`[Fortress] 🔒 Too many failed attempts. Locked for 5 minutes`);
                this.emit('lockout', { until: this.lockoutUntil });
            }
            return false;
        }
        // Success
        this.failedAttempts = 0;
        this.isUnlocked = true;
        this.masterPassword = masterPassword;
        this.lastActivity = Date.now();
        // Load encrypted credentials
        this.loadCredentials();
        // Start auto-lock timer
        this.startAutoLockTimer();
        console.log('[Fortress] ✅ Vault unlocked successfully');
        this.emit('unlocked');
        return true;
    }
    /**
     * Lock vault immediately
     */
    // Complexity: O(1) — hash/map lookup
    lock() {
        this.isUnlocked = false;
        this.masterPassword = null;
        this.credentials.clear();
        if (this.autoLockTimeout) {
            // Complexity: O(1)
            clearTimeout(this.autoLockTimeout);
            this.autoLockTimeout = null;
        }
        console.log('[Fortress] 🔒 Vault locked');
        this.emit('locked');
    }
    // Complexity: O(1) — hash/map lookup
    startAutoLockTimer() {
        if (this.autoLockTimeout) {
            // Complexity: O(1)
            clearTimeout(this.autoLockTimeout);
        }
        this.autoLockTimeout = setTimeout(() => {
            if (Date.now() - this.lastActivity > this.autoLockMs) {
                console.log('[Fortress] ⏰ Auto-locking due to inactivity');
                this.lock();
            }
            else {
                this.startAutoLockTimer();
            }
        }, 60000); // Check every minute
    }
    // Complexity: O(1)
    touchActivity() {
        this.lastActivity = Date.now();
    }
    // ═══════════════════════════════════════════════════════════════════════
    // CREDENTIALS MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════
    /**
     * Add exchange credentials (encrypted)
     */
    // Complexity: O(N)
    addCredentials(creds) {
        if (!this.isUnlocked || !this.masterPassword) {
            console.error('[Fortress] ❌ Vault is locked');
            return false;
        }
        this.touchActivity();
        const credentials = {
            ...creds,
            createdAt: Date.now(),
            lastUsed: 0,
        };
        this.credentials.set(creds.exchange, credentials);
        this.saveCredentials();
        console.log(`[Fortress] ✅ Added credentials for ${creds.exchange}`);
        this.emit('credentials-added', { exchange: creds.exchange });
        return true;
    }
    /**
     * Get decrypted credentials for an exchange
     */
    // Complexity: O(1) — hash/map lookup
    getCredentials(exchange) {
        if (!this.isUnlocked) {
            console.error('[Fortress] ❌ Vault is locked');
            return null;
        }
        this.touchActivity();
        const creds = this.credentials.get(exchange);
        if (creds) {
            creds.lastUsed = Date.now();
        }
        return creds || null;
    }
    /**
     * Remove credentials
     */
    // Complexity: O(N)
    removeCredentials(exchange) {
        if (!this.isUnlocked) {
            console.error('[Fortress] ❌ Vault is locked');
            return false;
        }
        this.touchActivity();
        const deleted = this.credentials.delete(exchange);
        if (deleted) {
            this.saveCredentials();
            console.log(`[Fortress] ✅ Removed credentials for ${exchange}`);
        }
        return deleted;
    }
    // Complexity: O(N) — linear iteration
    loadCredentials() {
        const credsPath = path.join(this.vaultPath, 'credentials.enc');
        if (!fs.existsSync(credsPath)) {
            return;
        }
        try {
            const encrypted = fs.readFileSync(credsPath, 'utf8');
            const decrypted = this.fortress.decrypt(encrypted, this.masterPassword);
            const credsArray = JSON.parse(decrypted);
            this.credentials.clear();
            for (const cred of credsArray) {
                this.credentials.set(cred.exchange, cred);
            }
            console.log(`[Fortress] 📥 Loaded ${this.credentials.size} exchange credentials`);
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
    // ═══════════════════════════════════════════════════════════════════════
    // WALLET CONFIGURATION
    // ═══════════════════════════════════════════════════════════════════════
    /**
     * Configure a wallet for trading
     */
    // Complexity: O(1) — hash/map lookup
    configureWallet(config) {
        if (!this.isUnlocked) {
            console.error('[Fortress] ❌ Vault is locked');
            return;
        }
        this.touchActivity();
        this.wallets.set(config.id, config);
        this.saveWallets();
        console.log(`[Fortress] ✅ Configured wallet: ${config.name} (${config.exchange})`);
    }
    // Complexity: O(1) — hash/map lookup
    getWallet(id) {
        return this.wallets.get(id);
    }
    // Complexity: O(N) — linear iteration
    getActiveWallets() {
        return Array.from(this.wallets.values()).filter(w => w.isActive);
    }
    // Complexity: O(1)
    saveWallets() {
        if (!this.masterPassword)
            return;
        const walletsArray = Array.from(this.wallets.values());
        const plaintext = JSON.stringify(walletsArray);
        const encrypted = this.fortress.encrypt(plaintext, this.masterPassword);
        fs.writeFileSync(path.join(this.vaultPath, 'wallets.enc'), encrypted);
    }
    // ═══════════════════════════════════════════════════════════════════════
    // WITHDRAWAL TARGETS (WHITELIST)
    // ═══════════════════════════════════════════════════════════════════════
    /**
     * Add a withdrawal target address (with delay for security)
     */
    // Complexity: O(1) — hash/map lookup
    addWithdrawalTarget(target) {
        if (!this.isUnlocked) {
            console.error('[Fortress] ❌ Vault is locked');
            return;
        }
        this.touchActivity();
        const fullTarget = {
            ...target,
            isWhitelisted: false, // Requires 24h cooling period
            addedAt: Date.now(),
        };
        this.withdrawalTargets.set(target.id, fullTarget);
        this.saveWithdrawalTargets();
        console.log(`[Fortress] ⏳ Added withdrawal target: ${target.name}`);
        console.log(`[Fortress] ⚠️  24-hour cooling period before withdrawal is enabled`);
        this.emit('withdrawal-target-added', { target: fullTarget });
    }
    /**
     * Get whitelisted withdrawal targets (only those past cooling period)
     */
    // Complexity: O(N) — linear iteration
    getWhitelistedTargets() {
        const coolingPeriod = 24 * 60 * 60 * 1000; // 24 hours
        const now = Date.now();
        return Array.from(this.withdrawalTargets.values())
            .filter(t => now - t.addedAt >= coolingPeriod)
            .map(t => ({ ...t, isWhitelisted: true }));
    }
    // Complexity: O(1)
    saveWithdrawalTargets() {
        if (!this.masterPassword)
            return;
        const targetsArray = Array.from(this.withdrawalTargets.values());
        const plaintext = JSON.stringify(targetsArray);
        const encrypted = this.fortress.encrypt(plaintext, this.masterPassword);
        fs.writeFileSync(path.join(this.vaultPath, 'withdrawal-targets.enc'), encrypted);
    }
    // ═══════════════════════════════════════════════════════════════════════
    // BALANCE TRACKING
    // ═══════════════════════════════════════════════════════════════════════
    /**
     * Update balance from exchange
     */
    // Complexity: O(1) — hash/map lookup
    updateBalance(exchange, balances) {
        this.balances.set(exchange, balances);
        this.emit('balance-updated', { exchange, balances });
    }
    // Complexity: O(1) — hash/map lookup
    getBalance(exchange) {
        return this.balances.get(exchange) || [];
    }
    // Complexity: O(N) — linear iteration
    getTotalBalance() {
        let total = 0;
        const byExchange = new Map();
        for (const [exchange, balances] of this.balances) {
            const exchangeTotal = balances.reduce((sum, b) => sum + b.usdValue, 0);
            byExchange.set(exchange, exchangeTotal);
            total += exchangeTotal;
        }
        return { total, byExchange };
    }
    // ═══════════════════════════════════════════════════════════════════════
    // STATUS & INFO
    // ═══════════════════════════════════════════════════════════════════════
    // Complexity: O(1)
    isVaultUnlocked() {
        return this.isUnlocked;
    }
    // Complexity: O(1)
    getStatus() {
        return {
            isUnlocked: this.isUnlocked,
            exchangeCount: this.credentials.size,
            walletCount: this.wallets.size,
            totalBalance: this.getTotalBalance().total,
            failedAttempts: this.failedAttempts,
            isLockedOut: Date.now() < this.lockoutUntil,
        };
    }
}
exports.LiveWalletManager = LiveWalletManager;
// ═══════════════════════════════════════════════════════════════════════════
// SINGLETON EXPORT
// ═══════════════════════════════════════════════════════════════════════════
exports.liveWalletManager = new LiveWalletManager('./data/fortress');
exports.default = LiveWalletManager;
