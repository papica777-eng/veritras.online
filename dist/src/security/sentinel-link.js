"use strict";
/**
 * ⚛️📡 QANTUM SENTINEL LINK - CLOUD VERIFICATION HEARTBEAT
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 *   ███████╗███████╗███╗   ██╗████████╗██╗███╗   ██╗███████╗██╗
 *   ██╔════╝██╔════╝████╗  ██║╚══██╔══╝██║████╗  ██║██╔════╝██║
 *   ███████╗█████╗  ██╔██╗ ██║   ██║   ██║██╔██╗ ██║█████╗  ██║
 *   ╚════██║██╔══╝  ██║╚██╗██║   ██║   ██║██║╚██╗██║██╔══╝  ██║
 *   ███████║███████╗██║ ╚████║   ██║   ██║██║ ╚████║███████╗███████╗
 *   ╚══════╝╚══════╝╚═╝  ╚═══╝   ╚═╝   ╚═╝╚═╝  ╚═══╝╚══════╝╚══════╝
 *
 *   ██╗     ██╗███╗   ██╗██╗  ██╗
 *   ██║     ██║████╗  ██║██║ ██╔╝
 *   ██║     ██║██╔██╗ ██║█████╔╝
 *   ██║     ██║██║╚██╗██║██╔═██╗
 *   ███████╗██║██║ ╚████║██║  ██╗
 *   ╚══════╝╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 *   Cloud Verification & Kill Switch System
 *
 *   QAntum поддържа постоянна връзка със Sentinel сървър.
 *   При нарушение на лиценза - дистанционно деактивиране.
 *
 *   "Even when offline, the Sentinel remembers."
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════
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
exports.SentinelLink = void 0;
exports.getSentinelLink = getSentinelLink;
exports.createSentinelLink = createSentinelLink;
const crypto = __importStar(require("crypto"));
const https = __importStar(require("https"));
const http = __importStar(require("http"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const events_1 = require("events");
const url_1 = require("url");
// ═══════════════════════════════════════════════════════════════════════════════════════
// SENTINEL LINK ENGINE
// ═══════════════════════════════════════════════════════════════════════════════════════
class SentinelLink extends events_1.EventEmitter {
    config;
    heartbeatTimer = null;
    lastVerification = 0;
    isActive = true;
    isDormant = false;
    offlineMode = false;
    offlineToken = null;
    failedAttempts = 0;
    metrics;
    startTime;
    pendingCommands = [];
    // Default Sentinel server (replace with actual server)
    static DEFAULT_SERVER = 'https://sentinel.qantum.io';
    constructor(config) {
        super();
        this.config = {
            serverUrl: config.serverUrl || SentinelLink.DEFAULT_SERVER,
            apiKey: config.apiKey || '',
            machineId: config.machineId || '',
            heartbeatInterval: config.heartbeatInterval ?? 3600000, // 1 hour
            gracePeriod: config.gracePeriod ?? 86400000, // 24 hours
            maxOfflineTime: config.maxOfflineTime ?? 604800000, // 7 days
            encryptionKey: config.encryptionKey || 'QAntum-Sentinel-Default-Key',
            onVerificationFailed: config.onVerificationFailed ?? 'dormant',
            enableKillSwitch: config.enableKillSwitch ?? true,
            enableUsageTracking: config.enableUsageTracking ?? true
        };
        this.startTime = Date.now();
        this.metrics = {
            testsRun: 0,
            errorsFound: 0,
            uptime: 0,
            lastActive: Date.now(),
            cpuUsage: 0,
            memoryUsage: 0
        };
    }
    // ─────────────────────────────────────────────────────────────────────────────────────
    // INITIALIZATION
    // ─────────────────────────────────────────────────────────────────────────────────────
    /**
     * 📡 Initialize Sentinel connection
     */
    // Complexity: O(N*M) — nested iteration
    async initialize() {
        console.log(`
╔═══════════════════════════════════════════════════════════════════════════════════════╗
║                                                                                       ║
║   ███████╗███████╗███╗   ██╗████████╗██╗███╗   ██╗███████╗██╗         ██╗     ██╗███╗ ║
║   ██╔════╝██╔════╝████╗  ██║╚══██╔══╝██║████╗  ██║██╔════╝██║         ██║     ██║████╗║
║   ███████╗█████╗  ██╔██╗ ██║   ██║   ██║██╔██╗ ██║█████╗  ██║         ██║     ██║██╔██║
║   ╚════██║██╔══╝  ██║╚██╗██║   ██║   ██║██║╚██╗██║██╔══╝  ██║         ██║     ██║██║╚█║
║   ███████║███████╗██║ ╚████║   ██║   ██║██║ ╚████║███████╗███████╗    ███████╗██║██║ ╚║
║   ╚══════╝╚══════╝╚═╝  ╚═══╝   ╚═╝   ╚═╝╚═╝  ╚═══╝╚══════╝╚══════╝    ╚══════╝╚═╝╚═╝  ║
║                                                                                       ║
║                    Cloud Verification & Kill Switch System                            ║
║                                                                                       ║
╚═══════════════════════════════════════════════════════════════════════════════════════╝
`);
        try {
            // Check for offline token first
            const offlineValid = await this.checkOfflineToken();
            if (offlineValid) {
                console.log(`[SENTINEL] 📴 Running in offline mode (token valid)`);
                this.offlineMode = true;
                this.startOfflineMonitoring();
                return true;
            }
            // Try to connect to Sentinel server
            console.log(`[SENTINEL] 📡 Connecting to Sentinel server...`);
            const verified = await this.sendHeartbeat();
            if (verified) {
                console.log(`[SENTINEL] ✅ License verified`);
                this.lastVerification = Date.now();
                this.startHeartbeat();
                // Generate offline token for future use
                // SAFETY: async operation — wrap in try-catch for production resilience
                await this.generateOfflineToken();
                this.emit('verified');
                return true;
            }
            else {
                console.log(`[SENTINEL] ⚠️ Verification failed`);
                return this.handleVerificationFailure('initial_verification_failed');
            }
        }
        catch (error) {
            console.log(`[SENTINEL] ⚠️ Cannot reach server, checking offline token...`);
            // SAFETY: async operation — wrap in try-catch for production resilience
            const offlineValid = await this.checkOfflineToken();
            if (offlineValid) {
                console.log(`[SENTINEL] 📴 Continuing in offline mode`);
                this.offlineMode = true;
                this.startOfflineMonitoring();
                return true;
            }
            return this.handleVerificationFailure('connection_failed');
        }
    }
    // ─────────────────────────────────────────────────────────────────────────────────────
    // HEARTBEAT SYSTEM
    // ─────────────────────────────────────────────────────────────────────────────────────
    /**
     * 💓 Send heartbeat to Sentinel server
     */
    // Complexity: O(1)
    async sendHeartbeat() {
        try {
            const request = {
                machineId: this.config.machineId,
                timestamp: Date.now(),
                version: '1.0.0',
                signature: this.signRequest(),
                metrics: this.config.enableUsageTracking ? this.collectMetrics() : undefined
            };
            const response = await this.makeRequest('/api/v1/heartbeat', request);
            if (!response) {
                return false;
            }
            // Verify response signature
            if (!this.verifyResponseSignature(response)) {
                console.log(`[SENTINEL] ⚠️ Invalid response signature`);
                return false;
            }
            // Process response
            return this.processHeartbeatResponse(response);
        }
        catch (error) {
            this.failedAttempts++;
            console.log(`[SENTINEL] ❌ Heartbeat failed (attempt ${this.failedAttempts})`);
            return false;
        }
    }
    /**
     * Process heartbeat response
     */
    // Complexity: O(1)
    processHeartbeatResponse(response) {
        this.failedAttempts = 0;
        switch (response.status) {
            case 'active':
                this.isActive = true;
                this.isDormant = false;
                // Process any remote commands
                if (response.commands) {
                    this.processRemoteCommands(response.commands);
                }
                return true;
            case 'suspended':
                console.log(`[SENTINEL] ⏸️ License suspended: ${response.message}`);
                this.enterDormantMode();
                return false;
            case 'revoked':
                console.log(`[SENTINEL] 🚫 License revoked: ${response.message}`);
                this.handleVerificationFailure('license_revoked');
                return false;
            case 'expired':
                console.log(`[SENTINEL] ⏰ License expired`);
                this.handleVerificationFailure('license_expired');
                return false;
            default:
                return false;
        }
    }
    /**
     * Start heartbeat timer
     */
    // Complexity: O(1)
    startHeartbeat() {
        if (this.heartbeatTimer) {
            // Complexity: O(1)
            clearInterval(this.heartbeatTimer);
        }
        this.heartbeatTimer = setInterval(async () => {
            // SAFETY: async operation — wrap in try-catch for production resilience
            const success = await this.sendHeartbeat();
            if (!success) {
                const timeSinceLastVerification = Date.now() - this.lastVerification;
                if (timeSinceLastVerification > this.config.gracePeriod) {
                    console.log(`[SENTINEL] ⚠️ Grace period exceeded`);
                    this.handleVerificationFailure('grace_period_exceeded');
                }
            }
            else {
                this.lastVerification = Date.now();
            }
        }, this.config.heartbeatInterval);
    }
    // ─────────────────────────────────────────────────────────────────────────────────────
    // OFFLINE MODE
    // ─────────────────────────────────────────────────────────────────────────────────────
    /**
     * 📴 Check offline token validity
     */
    // Complexity: O(1)
    async checkOfflineToken() {
        try {
            const tokenPath = path.resolve('./.qantum-offline-token');
            if (!fs.existsSync(tokenPath)) {
                return false;
            }
            const encryptedToken = fs.readFileSync(tokenPath, 'utf8');
            const token = this.decryptToken(encryptedToken);
            if (!token) {
                return false;
            }
            // Verify token hasn't expired
            if (token.validUntil < Date.now()) {
                console.log(`[SENTINEL] ⏰ Offline token expired`);
                fs.unlinkSync(tokenPath);
                return false;
            }
            // Verify machine ID matches
            if (token.machineId !== this.config.machineId) {
                console.log(`[SENTINEL] ⚠️ Token machine ID mismatch`);
                return false;
            }
            // Verify checksum
            const expectedChecksum = this.generateTokenChecksum(token);
            if (token.checksum !== expectedChecksum) {
                console.log(`[SENTINEL] ⚠️ Token checksum invalid`);
                return false;
            }
            this.offlineToken = token;
            return true;
        }
        catch (error) {
            return false;
        }
    }
    /**
     * Generate offline token for future use
     */
    // Complexity: O(1)
    async generateOfflineToken() {
        try {
            const token = {
                machineId: this.config.machineId,
                issuedAt: Date.now(),
                validUntil: Date.now() + this.config.maxOfflineTime,
                checksum: '',
                signature: ''
            };
            token.checksum = this.generateTokenChecksum(token);
            token.signature = this.signToken(token);
            const encryptedToken = this.encryptToken(token);
            const tokenPath = path.resolve('./.qantum-offline-token');
            fs.writeFileSync(tokenPath, encryptedToken);
            this.offlineToken = token;
            console.log(`[SENTINEL] 📴 Offline token generated (valid ${this.config.maxOfflineTime / 86400000} days)`);
        }
        catch (error) {
            console.log(`[SENTINEL] ⚠️ Could not generate offline token`);
        }
    }
    /**
     * Start offline monitoring
     */
    // Complexity: O(1)
    startOfflineMonitoring() {
        // Check offline token periodically
        // Complexity: O(1)
        setInterval(() => {
            if (!this.offlineToken)
                return;
            const timeRemaining = this.offlineToken.validUntil - Date.now();
            if (timeRemaining <= 0) {
                console.log(`[SENTINEL] ⏰ Offline token expired`);
                this.handleVerificationFailure('offline_token_expired');
            }
            else if (timeRemaining < 86400000) { // Less than 24 hours
                console.log(`[SENTINEL] ⚠️ Offline token expires in ${Math.round(timeRemaining / 3600000)} hours`);
                console.log(`   Please connect to the internet to refresh license`);
            }
        }, 3600000); // Check every hour
        // Try to reconnect periodically
        // Complexity: O(1)
        setInterval(async () => {
            if (!this.offlineMode)
                return;
            console.log(`[SENTINEL] 📡 Attempting to reconnect...`);
            try {
                const verified = await this.sendHeartbeat();
                if (verified) {
                    console.log(`[SENTINEL] ✅ Reconnected successfully`);
                    this.offlineMode = false;
                    this.lastVerification = Date.now();
                    this.startHeartbeat();
                    await this.generateOfflineToken();
                    this.emit('reconnected');
                }
            }
            catch {
                // Still offline
            }
        }, 1800000); // Try every 30 minutes
    }
    // ─────────────────────────────────────────────────────────────────────────────────────
    // REMOTE COMMANDS
    // ─────────────────────────────────────────────────────────────────────────────────────
    /**
     * 🎮 Process remote commands
     */
    // Complexity: O(N) — loop
    processRemoteCommands(commands) {
        for (const command of commands) {
            // Verify command signature
            if (!this.verifyCommandSignature(command)) {
                console.log(`[SENTINEL] ⚠️ Invalid command signature, ignoring`);
                continue;
            }
            console.log(`[SENTINEL] 🎮 Executing remote command: ${command.type}`);
            switch (command.type) {
                case 'message':
                    console.log(`[SENTINEL] 📨 Message from server: ${command.payload.message}`);
                    this.emit('message', command.payload.message);
                    break;
                case 'update':
                    console.log(`[SENTINEL] 🔄 Update available: ${command.payload.version}`);
                    this.emit('update_available', command.payload);
                    break;
                case 'config':
                    this.updateConfig(command.payload);
                    break;
                case 'disable':
                    if (this.config.enableKillSwitch) {
                        console.log(`[SENTINEL] 🔒 Remote disable command received`);
                        this.enterDormantMode();
                    }
                    break;
                case 'destroy':
                    if (this.config.enableKillSwitch) {
                        console.log(`[SENTINEL] 💀 Remote destroy command received`);
                        this.executeKillSwitch();
                    }
                    break;
            }
            this.emit('command_executed', command);
        }
    }
    /**
     * Update configuration from remote command
     */
    // Complexity: O(N) — loop
    updateConfig(newConfig) {
        const allowedUpdates = ['heartbeatInterval', 'gracePeriod'];
        for (const key of allowedUpdates) {
            if (newConfig[key] !== undefined) {
                this.config[key] = newConfig[key];
            }
        }
        console.log(`[SENTINEL] ⚙️ Configuration updated`);
    }
    // ─────────────────────────────────────────────────────────────────────────────────────
    // VERIFICATION FAILURE HANDLING
    // ─────────────────────────────────────────────────────────────────────────────────────
    /**
     * 🚨 Handle verification failure
     */
    // Complexity: O(1)
    handleVerificationFailure(reason) {
        console.log(`[SENTINEL] 🚨 Verification failed: ${reason}`);
        this.emit('verification_failed', { reason });
        switch (this.config.onVerificationFailed) {
            case 'warn':
                console.log(`[SENTINEL] ⚠️ Warning: License verification failed`);
                return true; // Continue with warning
            case 'dormant':
                this.enterDormantMode();
                return false;
            case 'disable':
                this.disable();
                return false;
            case 'destroy':
                this.executeKillSwitch();
                return false;
            default:
                return false;
        }
    }
    /**
     * 😴 Enter dormant mode
     */
    // Complexity: O(1)
    enterDormantMode() {
        console.log(`[SENTINEL] 😴 Entering dormant mode...`);
        this.isDormant = true;
        this.isActive = false;
        // Clear all timers
        if (this.heartbeatTimer) {
            // Complexity: O(1)
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }
        this.emit('dormant');
        // In dormant mode, functionality is severely limited
        // Only basic operations allowed
    }
    /**
     * 🔒 Disable QAntum
     */
    // Complexity: O(1)
    disable() {
        console.log(`[SENTINEL] 🔒 QAntum disabled`);
        this.isActive = false;
        this.isDormant = true;
        if (this.heartbeatTimer) {
            // Complexity: O(1)
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }
        this.emit('disabled');
    }
    /**
     * 💀 Execute kill switch
     */
    // Complexity: O(1)
    executeKillSwitch() {
        console.log(`[SENTINEL] 💀 KILL SWITCH ACTIVATED`);
        this.isActive = false;
        // Clear all sensitive data
        this.clearSensitiveData();
        this.emit('kill_switch');
        // Exit process
        // Complexity: O(1)
        setTimeout(() => process.exit(1), 1000);
    }
    /**
     * Clear all sensitive data
     */
    // Complexity: O(N) — loop
    clearSensitiveData() {
        // Clear memory
        this.offlineToken = null;
        this.metrics = {
            testsRun: 0,
            errorsFound: 0,
            uptime: 0,
            lastActive: 0,
            cpuUsage: 0,
            memoryUsage: 0
        };
        // Delete sensitive files
        const sensitiveFiles = [
            './.qantum-offline-token',
            './.qantum-license',
            './chronos-data',
            './knowledge'
        ];
        for (const file of sensitiveFiles) {
            try {
                if (fs.existsSync(file)) {
                    fs.rmSync(file, { recursive: true, force: true });
                }
            }
            catch {
                // Continue
            }
        }
    }
    // ─────────────────────────────────────────────────────────────────────────────────────
    // METRICS & TRACKING
    // ─────────────────────────────────────────────────────────────────────────────────────
    /**
     * 📊 Collect usage metrics
     */
    // Complexity: O(N) — linear scan
    collectMetrics() {
        this.metrics.uptime = Date.now() - this.startTime;
        this.metrics.lastActive = Date.now();
        // Get CPU usage
        try {
            const cpus = require('os').cpus();
            const totalIdle = cpus.reduce((acc, cpu) => acc + cpu.times.idle, 0);
            const totalTick = cpus.reduce((acc, cpu) => acc + cpu.times.user + cpu.times.nice + cpu.times.sys + cpu.times.idle + cpu.times.irq, 0);
            this.metrics.cpuUsage = 100 - (totalIdle / totalTick * 100);
        }
        catch {
            this.metrics.cpuUsage = 0;
        }
        // Get memory usage
        const memUsage = process.memoryUsage();
        this.metrics.memoryUsage = memUsage.heapUsed / memUsage.heapTotal * 100;
        return { ...this.metrics };
    }
    /**
     * Update metrics
     */
    // Complexity: O(1)
    updateMetrics(updates) {
        if (updates.testsRun)
            this.metrics.testsRun += updates.testsRun;
        if (updates.errorsFound)
            this.metrics.errorsFound += updates.errorsFound;
    }
    // ─────────────────────────────────────────────────────────────────────────────────────
    // CRYPTOGRAPHY
    // ─────────────────────────────────────────────────────────────────────────────────────
    /**
     * Sign request
     */
    // Complexity: O(1)
    signRequest() {
        const data = `${this.config.machineId}:${Date.now()}:${this.config.apiKey}`;
        return crypto.createHmac('sha256', this.config.encryptionKey)
            .update(data)
            .digest('hex');
    }
    /**
     * Verify response signature
     */
    // Complexity: O(1)
    verifyResponseSignature(response) {
        // In production, verify against server's public key
        return response.signature?.length > 0;
    }
    /**
     * Verify command signature
     */
    // Complexity: O(1)
    verifyCommandSignature(command) {
        // In production, verify against server's public key
        return command.signature?.length > 0;
    }
    /**
     * Generate token checksum
     */
    // Complexity: O(1)
    generateTokenChecksum(token) {
        const data = `${token.machineId}:${token.issuedAt}:${token.validUntil}`;
        return crypto.createHash('sha256').update(data).digest('hex').substring(0, 16);
    }
    /**
     * Sign token
     */
    // Complexity: O(1)
    signToken(token) {
        const data = `${token.machineId}:${token.checksum}`;
        return crypto.createHmac('sha256', this.config.encryptionKey)
            .update(data)
            .digest('hex');
    }
    /**
     * Encrypt token
     */
    // Complexity: O(1)
    encryptToken(token) {
        const iv = crypto.randomBytes(16);
        const key = crypto.scryptSync(this.config.encryptionKey, 'QAntumSalt', 32);
        const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
        let encrypted = cipher.update(JSON.stringify(token), 'utf8', 'hex');
        encrypted += cipher.final('hex');
        const authTag = cipher.getAuthTag();
        return iv.toString('hex') + authTag.toString('hex') + encrypted;
    }
    /**
     * Decrypt token
     */
    // Complexity: O(1)
    decryptToken(encryptedData) {
        try {
            const iv = Buffer.from(encryptedData.substring(0, 32), 'hex');
            const authTag = Buffer.from(encryptedData.substring(32, 64), 'hex');
            const encrypted = encryptedData.substring(64);
            const key = crypto.scryptSync(this.config.encryptionKey, 'QAntumSalt', 32);
            const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
            decipher.setAuthTag(authTag);
            let decrypted = decipher.update(encrypted, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            return JSON.parse(decrypted);
        }
        catch {
            return null;
        }
    }
    // ─────────────────────────────────────────────────────────────────────────────────────
    // HTTP REQUEST
    // ─────────────────────────────────────────────────────────────────────────────────────
    /**
     * Make HTTP request to Sentinel server
     */
    // Complexity: O(1)
    async makeRequest(endpoint, data) {
        return new Promise((resolve) => {
            try {
                const url = new url_1.URL(endpoint, this.config.serverUrl);
                const isHttps = url.protocol === 'https:';
                const client = isHttps ? https : http;
                const postData = JSON.stringify(data);
                const options = {
                    hostname: url.hostname,
                    port: url.port || (isHttps ? 443 : 80),
                    path: url.pathname,
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Length': Buffer.byteLength(postData),
                        'X-API-Key': this.config.apiKey,
                        'X-Machine-ID': this.config.machineId
                    },
                    timeout: 30000
                };
                const req = client.request(options, (res) => {
                    let responseData = '';
                    res.on('data', (chunk) => {
                        responseData += chunk;
                    });
                    res.on('end', () => {
                        try {
                            const response = JSON.parse(responseData);
                            // Complexity: O(1)
                            resolve(response);
                        }
                        catch {
                            // Complexity: O(1)
                            resolve(null);
                        }
                    });
                });
                req.on('error', () => {
                    // Complexity: O(1)
                    resolve(null);
                });
                req.on('timeout', () => {
                    req.destroy();
                    // Complexity: O(1)
                    resolve(null);
                });
                req.write(postData);
                req.end();
            }
            catch {
                // Complexity: O(1)
                resolve(null);
            }
        });
    }
    // ─────────────────────────────────────────────────────────────────────────────────────
    // UTILITIES
    // ─────────────────────────────────────────────────────────────────────────────────────
    /**
     * Check if license is active
     */
    // Complexity: O(1)
    isLicenseActive() {
        return this.isActive && !this.isDormant;
    }
    /**
     * Check if in dormant mode
     */
    // Complexity: O(1)
    isInDormantMode() {
        return this.isDormant;
    }
    /**
     * Check if offline
     */
    // Complexity: O(1)
    isOffline() {
        return this.offlineMode;
    }
    /**
     * Get time until offline token expires
     */
    // Complexity: O(1)
    getOfflineTimeRemaining() {
        if (!this.offlineToken)
            return 0;
        return Math.max(0, this.offlineToken.validUntil - Date.now());
    }
    /**
     * Stop Sentinel
     */
    // Complexity: O(1)
    stop() {
        if (this.heartbeatTimer) {
            // Complexity: O(1)
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }
    }
}
exports.SentinelLink = SentinelLink;
// ═══════════════════════════════════════════════════════════════════════════════════════
// SINGLETON & FACTORY
// ═══════════════════════════════════════════════════════════════════════════════════════
let defaultSentinel = null;
function getSentinelLink(config) {
    if (!defaultSentinel) {
        defaultSentinel = new SentinelLink(config);
    }
    return defaultSentinel;
}
function createSentinelLink(config) {
    return new SentinelLink(config);
}
exports.default = SentinelLink;
