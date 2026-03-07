"use strict";
/**
 * ⚛️🔐 QANTUM GENETIC LOCK - HARDWARE FINGERPRINT AUTHENTICATION
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 *    ██████╗ ███████╗███╗   ██╗███████╗████████╗██╗ ██████╗
 *   ██╔════╝ ██╔════╝████╗  ██║██╔════╝╚══██╔══╝██║██╔════╝
 *   ██║  ███╗█████╗  ██╔██╗ ██║█████╗     ██║   ██║██║
 *   ██║   ██║██╔══╝  ██║╚██╗██║██╔══╝     ██║   ██║██║
 *   ╚██████╔╝███████╗██║ ╚████║███████╗   ██║   ██║╚██████╗
 *    ╚═════╝ ╚══════╝╚═╝  ╚═══╝╚══════╝   ╚═╝   ╚═╝ ╚═════╝
 *
 *   ██╗      ██████╗  ██████╗██╗  ██╗
 *   ██║     ██╔═══██╗██╔════╝██║ ██╔╝
 *   ██║     ██║   ██║██║     █████╔╝
 *   ██║     ██║   ██║██║     ██╔═██╗
 *   ███████╗╚██████╔╝╚██████╗██║  ██╗
 *   ╚══════╝ ╚═════╝  ╚═════╝╚═╝  ╚═╝
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 *   Hardware DNA Verification System
 *
 *   QAntum работи САМО на оторизирани машини.
 *   Всеки опит за копиране на друга система ще бъде засечен.
 *
 *   "Your hardware is the key. Without it, QAntum is a ghost."
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
exports.HardwareLock = void 0;
exports.getHardwareLock = getHardwareLock;
exports.createHardwareLock = createHardwareLock;
const crypto = __importStar(require("crypto"));
const os = __importStar(require("os"));
const child_process_1 = require("child_process");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const events_1 = require("events");
// ═══════════════════════════════════════════════════════════════════════════════════════
// HARDWARE LOCK ENGINE
// ═══════════════════════════════════════════════════════════════════════════════════════
class HardwareLock extends events_1.EventEmitter {
    config;
    currentFingerprint = null;
    licenseData = null;
    verificationInterval = null;
    isLocked = false;
    violationCount = 0;
    // Димитър's Master Machine fingerprint (Lenovo Ryzen 7)
    static MASTER_FINGERPRINT_HASH = 'GENERATE_ON_FIRST_RUN';
    constructor(config) {
        super();
        this.config = {
            strictMode: config?.strictMode ?? true,
            allowedVariance: config?.allowedVariance ?? 0.1,
            checkInterval: config?.checkInterval ?? 300000, // 5 minutes
            licensePath: config?.licensePath ?? './.qantum-license',
            onViolation: config?.onViolation ?? 'disable',
            encryptionKey: config?.encryptionKey
        };
    }
    // ─────────────────────────────────────────────────────────────────────────────────────
    // FINGERPRINT COLLECTION
    // ─────────────────────────────────────────────────────────────────────────────────────
    /**
     * 🔍 Collect hardware fingerprint from current machine
     */
    // Complexity: O(1) — hash/map lookup
    async collectFingerprint() {
        const fingerprint = {
            // SAFETY: async operation — wrap in try-catch for production resilience
            cpuId: await this.getCpuId(),
            cpuModel: os.cpus()[0]?.model || 'unknown',
            cpuCores: os.cpus().length,
            // SAFETY: async operation — wrap in try-catch for production resilience
            motherboardSerial: await this.getMotherboardSerial(),
            // SAFETY: async operation — wrap in try-catch for production resilience
            biosSerial: await this.getBiosSerial(),
            // SAFETY: async operation — wrap in try-catch for production resilience
            diskUUID: await this.getDiskUUID(),
            macAddresses: this.getMacAddresses(),
            hostname: os.hostname(),
            username: os.userInfo().username,
            platform: os.platform(),
            arch: os.arch(),
            totalMemory: os.totalmem(),
            // SAFETY: async operation — wrap in try-catch for production resilience
            gpuInfo: await this.getGpuInfo()
        };
        this.currentFingerprint = fingerprint;
        return fingerprint;
    }
    /**
     * Get CPU ID (Windows specific)
     */
    // Complexity: O(1) — hash/map lookup
    async getCpuId() {
        try {
            if (os.platform() === 'win32') {
                const result = (0, child_process_1.execSync)('wmic cpu get processorid', { encoding: 'utf8', windowsHide: true });
                const lines = result.trim().split('\n');
                return lines[1]?.trim() || 'unknown';
            }
            else if (os.platform() === 'linux') {
                const result = (0, child_process_1.execSync)("cat /proc/cpuinfo | grep 'Serial\\|model name' | head -2", { encoding: 'utf8' });
                return crypto.createHash('md5').update(result).digest('hex');
            }
            else if (os.platform() === 'darwin') {
                const result = (0, child_process_1.execSync)('sysctl -n machdep.cpu.brand_string', { encoding: 'utf8' });
                return crypto.createHash('md5').update(result).digest('hex');
            }
        }
        catch {
            // Fallback
        }
        return crypto.createHash('md5').update(os.cpus()[0]?.model || 'unknown').digest('hex');
    }
    /**
     * Get Motherboard Serial Number
     */
    // Complexity: O(1) — hash/map lookup
    async getMotherboardSerial() {
        try {
            if (os.platform() === 'win32') {
                const result = (0, child_process_1.execSync)('wmic baseboard get serialnumber', { encoding: 'utf8', windowsHide: true });
                const lines = result.trim().split('\n');
                return lines[1]?.trim() || 'unknown';
            }
            else if (os.platform() === 'linux') {
                const result = (0, child_process_1.execSync)('sudo dmidecode -s baseboard-serial-number 2>/dev/null || echo "unknown"', { encoding: 'utf8' });
                return result.trim();
            }
        }
        catch {
            // Fallback
        }
        return 'unknown';
    }
    /**
     * Get BIOS Serial Number
     */
    // Complexity: O(1) — hash/map lookup
    async getBiosSerial() {
        try {
            if (os.platform() === 'win32') {
                const result = (0, child_process_1.execSync)('wmic bios get serialnumber', { encoding: 'utf8', windowsHide: true });
                const lines = result.trim().split('\n');
                return lines[1]?.trim() || 'unknown';
            }
            else if (os.platform() === 'linux') {
                const result = (0, child_process_1.execSync)('sudo dmidecode -s bios-version 2>/dev/null || echo "unknown"', { encoding: 'utf8' });
                return result.trim();
            }
        }
        catch {
            // Fallback
        }
        return 'unknown';
    }
    /**
     * Get Disk UUID
     */
    // Complexity: O(1) — hash/map lookup
    async getDiskUUID() {
        try {
            if (os.platform() === 'win32') {
                const result = (0, child_process_1.execSync)('wmic diskdrive get serialnumber', { encoding: 'utf8', windowsHide: true });
                const lines = result.trim().split('\n');
                return lines[1]?.trim() || 'unknown';
            }
            else if (os.platform() === 'linux') {
                const result = (0, child_process_1.execSync)('blkid -o value -s UUID /dev/sda1 2>/dev/null || echo "unknown"', { encoding: 'utf8' });
                return result.trim();
            }
            else if (os.platform() === 'darwin') {
                const result = (0, child_process_1.execSync)('diskutil info disk0 | grep "Disk / Partition UUID"', { encoding: 'utf8' });
                return result.split(':')[1]?.trim() || 'unknown';
            }
        }
        catch {
            // Fallback
        }
        return 'unknown';
    }
    /**
     * Get all MAC addresses
     */
    // Complexity: O(N*M) — nested iteration detected
    getMacAddresses() {
        const interfaces = os.networkInterfaces();
        const macs = [];
        for (const [name, addrs] of Object.entries(interfaces)) {
            if (!addrs)
                continue;
            for (const addr of addrs) {
                if (addr.mac && addr.mac !== '00:00:00:00:00:00') {
                    macs.push(addr.mac);
                }
            }
        }
        return [...new Set(macs)].sort();
    }
    /**
     * Get GPU information
     */
    // Complexity: O(1) — hash/map lookup
    async getGpuInfo() {
        try {
            if (os.platform() === 'win32') {
                const result = (0, child_process_1.execSync)('wmic path win32_VideoController get name', { encoding: 'utf8', windowsHide: true });
                const lines = result.trim().split('\n');
                return lines[1]?.trim() || 'unknown';
            }
        }
        catch {
            // Fallback
        }
        return 'unknown';
    }
    // ─────────────────────────────────────────────────────────────────────────────────────
    // FINGERPRINT HASHING
    // ─────────────────────────────────────────────────────────────────────────────────────
    /**
     * 🔐 Generate hash from fingerprint
     */
    // Complexity: O(1) — amortized
    generateHash(fingerprint) {
        // Full hash - all components
        const fullData = JSON.stringify({
            cpuId: fingerprint.cpuId,
            cpuModel: fingerprint.cpuModel,
            motherboardSerial: fingerprint.motherboardSerial,
            biosSerial: fingerprint.biosSerial,
            diskUUID: fingerprint.diskUUID,
            macAddresses: fingerprint.macAddresses,
            hostname: fingerprint.hostname,
            platform: fingerprint.platform,
            arch: fingerprint.arch,
            totalMemory: fingerprint.totalMemory
        });
        // Partial hash - stable components only (excludes MAC which can change)
        const partialData = JSON.stringify({
            cpuId: fingerprint.cpuId,
            cpuModel: fingerprint.cpuModel,
            motherboardSerial: fingerprint.motherboardSerial,
            biosSerial: fingerprint.biosSerial,
            diskUUID: fingerprint.diskUUID,
            platform: fingerprint.platform,
            arch: fingerprint.arch
        });
        return {
            full: crypto.createHash('sha256').update(fullData).digest('hex'),
            partial: crypto.createHash('sha256').update(partialData).digest('hex'),
            timestamp: Date.now(),
            version: '1.0.0'
        };
    }
    /**
     * Generate machine ID (short unique identifier)
     */
    // Complexity: O(1)
    generateMachineId(fingerprint) {
        const data = `${fingerprint.cpuId}-${fingerprint.motherboardSerial}-${fingerprint.diskUUID}`;
        return crypto.createHash('sha256').update(data).digest('hex').substring(0, 16).toUpperCase();
    }
    // ─────────────────────────────────────────────────────────────────────────────────────
    // VERIFICATION
    // ─────────────────────────────────────────────────────────────────────────────────────
    /**
     * 🔒 Initialize and lock to current hardware
     */
    // Complexity: O(N)
    async initialize() {
        console.log(`
╔═══════════════════════════════════════════════════════════════════════════════════════╗
║                                                                                       ║
║   ██████╗ ███████╗███╗   ██╗███████╗████████╗██╗ ██████╗    ██╗      ██████╗  ██████╗██║
║  ██╔════╝ ██╔════╝████╗  ██║██╔════╝╚══██╔══╝██║██╔════╝    ██║     ██╔═══██╗██╔════╝██║
║  ██║  ███╗█████╗  ██╔██╗ ██║█████╗     ██║   ██║██║         ██║     ██║   ██║██║     ██║
║  ██║   ██║██╔══╝  ██║╚██╗██║██╔══╝     ██║   ██║██║         ██║     ██║   ██║██║     ╚═╝
║  ╚██████╔╝███████╗██║ ╚████║███████╗   ██║   ██║╚██████╗    ███████╗╚██████╔╝╚██████╗██╗
║   ╚═════╝ ╚══════╝╚═╝  ╚═══╝╚══════╝   ╚═╝   ╚═╝ ╚═════╝    ╚══════╝ ╚═════╝  ╚═════╝╚═╝
║                                                                                       ║
║                    Hardware DNA Verification System                                   ║
║                                                                                       ║
╚═══════════════════════════════════════════════════════════════════════════════════════╝
`);
        try {
            // Collect fingerprint
            const fingerprint = await this.collectFingerprint();
            const hash = this.generateHash(fingerprint);
            const machineId = this.generateMachineId(fingerprint);
            console.log(`[GENETIC-LOCK] 🔍 Hardware fingerprint collected`);
            console.log(`   Machine ID: ${machineId}`);
            console.log(`   CPU: ${fingerprint.cpuModel}`);
            console.log(`   Platform: ${fingerprint.platform} ${fingerprint.arch}`);
            // Check for existing license
            const licenseValid = await this.verifyLicense();
            if (!licenseValid) {
                console.log(`[GENETIC-LOCK] ⚠️ No valid license found`);
                // First run - generate license request
                // SAFETY: async operation — wrap in try-catch for production resilience
                await this.generateLicenseRequest(fingerprint, hash, machineId);
                if (this.config.strictMode) {
                    console.log(`[GENETIC-LOCK] ❌ Strict mode: Cannot run without license`);
                    this.isLocked = true;
                    this.emit('locked', { reason: 'no_license', machineId });
                    return false;
                }
            }
            // Start periodic verification
            this.startPeriodicVerification();
            console.log(`[GENETIC-LOCK] ✅ Hardware lock initialized`);
            this.emit('initialized', { machineId, hash: hash.partial });
            return true;
        }
        catch (error) {
            console.error(`[GENETIC-LOCK] ❌ Initialization failed:`, error);
            this.emit('error', error);
            return false;
        }
    }
    /**
     * 🔑 Verify license file
     */
    // Complexity: O(1) — amortized
    async verifyLicense() {
        try {
            const licensePath = path.resolve(this.config.licensePath);
            if (!fs.existsSync(licensePath)) {
                return false;
            }
            const encryptedData = fs.readFileSync(licensePath, 'utf8');
            const licenseData = this.decryptLicense(encryptedData);
            if (!licenseData) {
                return false;
            }
            // Verify license hasn't expired
            if (licenseData.expiresAt < Date.now()) {
                console.log(`[GENETIC-LOCK] ⚠️ License expired`);
                return false;
            }
            // Verify hardware fingerprint matches
            // SAFETY: async operation — wrap in try-catch for production resilience
            const currentFingerprint = await this.collectFingerprint();
            const currentHash = this.generateHash(currentFingerprint);
            if (licenseData.fingerprintHash !== currentHash.partial) {
                console.log(`[GENETIC-LOCK] ⚠️ Hardware mismatch detected`);
                this.handleViolation('hardware_mismatch');
                return false;
            }
            this.licenseData = licenseData;
            return true;
        }
        catch (error) {
            console.error(`[GENETIC-LOCK] License verification error:`, error);
            return false;
        }
    }
    /**
     * Decrypt license data
     */
    // Complexity: O(1) — amortized
    decryptLicense(encryptedData) {
        try {
            const key = this.config.encryptionKey || 'QAntum-Prime-Genetic-Lock-Key-2024';
            const decipher = crypto.createDecipheriv('aes-256-gcm', crypto.scryptSync(key, 'QAntumSalt', 32), Buffer.from(encryptedData.substring(0, 32), 'hex'));
            const authTag = Buffer.from(encryptedData.substring(32, 64), 'hex');
            decipher.setAuthTag(authTag);
            const encrypted = encryptedData.substring(64);
            let decrypted = decipher.update(encrypted, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            return JSON.parse(decrypted);
        }
        catch {
            return null;
        }
    }
    /**
     * Encrypt license data
     */
    // Complexity: O(1)
    encryptLicense(licenseData) {
        const key = this.config.encryptionKey || 'QAntum-Prime-Genetic-Lock-Key-2024';
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv('aes-256-gcm', crypto.scryptSync(key, 'QAntumSalt', 32), iv);
        let encrypted = cipher.update(JSON.stringify(licenseData), 'utf8', 'hex');
        encrypted += cipher.final('hex');
        const authTag = cipher.getAuthTag();
        return iv.toString('hex') + authTag.toString('hex') + encrypted;
    }
    /**
     * Generate license request file
     */
    // Complexity: O(1) — amortized
    async generateLicenseRequest(fingerprint, hash, machineId) {
        const request = {
            machineId,
            fingerprintHash: hash.partial,
            fingerprint: {
                cpuId: fingerprint.cpuId,
                cpuModel: fingerprint.cpuModel,
                motherboardSerial: fingerprint.motherboardSerial,
                platform: fingerprint.platform,
                arch: fingerprint.arch
            },
            requestedAt: Date.now(),
            qantumVersion: '1.0.0'
        };
        const requestPath = path.resolve('./.qantum-license-request');
        fs.writeFileSync(requestPath, JSON.stringify(request, null, 2));
        console.log(`[GENETIC-LOCK] 📄 License request generated: ${requestPath}`);
        console.log(`   Send this file to activate QAntum Prime`);
    }
    // ─────────────────────────────────────────────────────────────────────────────────────
    // PERIODIC VERIFICATION
    // ─────────────────────────────────────────────────────────────────────────────────────
    /**
     * Start periodic hardware verification
     */
    // Complexity: O(1)
    startPeriodicVerification() {
        if (this.verificationInterval) {
            // Complexity: O(1)
            clearInterval(this.verificationInterval);
        }
        this.verificationInterval = setInterval(async () => {
            // SAFETY: async operation — wrap in try-catch for production resilience
            const isValid = await this.verify();
            if (!isValid) {
                this.handleViolation('periodic_check_failed');
            }
        }, this.config.checkInterval);
    }
    /**
     * 🔒 Verify current hardware matches license
     */
    // Complexity: O(1) — amortized
    async verify() {
        if (this.isLocked) {
            return false;
        }
        try {
            const currentFingerprint = await this.collectFingerprint();
            const currentHash = this.generateHash(currentFingerprint);
            if (!this.licenseData) {
                return !this.config.strictMode;
            }
            // Check hash match
            if (currentHash.partial !== this.licenseData.fingerprintHash) {
                return false;
            }
            this.emit('verified');
            return true;
        }
        catch (error) {
            this.emit('error', error);
            return false;
        }
    }
    // ─────────────────────────────────────────────────────────────────────────────────────
    // VIOLATION HANDLING
    // ─────────────────────────────────────────────────────────────────────────────────────
    /**
     * 🚨 Handle security violation
     */
    // Complexity: O(1) — amortized
    handleViolation(reason) {
        this.violationCount++;
        console.log(`[GENETIC-LOCK] 🚨 VIOLATION DETECTED: ${reason}`);
        console.log(`   Violation count: ${this.violationCount}`);
        this.emit('violation', { reason, count: this.violationCount });
        switch (this.config.onViolation) {
            case 'warn':
                console.log(`[GENETIC-LOCK] ⚠️ Warning issued`);
                break;
            case 'disable':
                console.log(`[GENETIC-LOCK] 🔒 QAntum disabled`);
                this.isLocked = true;
                this.emit('locked', { reason });
                break;
            case 'destroy':
                console.log(`[GENETIC-LOCK] 💀 Initiating self-destruct sequence...`);
                this.selfDestruct();
                break;
        }
    }
    /**
     * 💀 Self-destruct critical data
     */
    // Complexity: O(N) — linear iteration
    selfDestruct() {
        // Clear all cached data
        this.currentFingerprint = null;
        this.licenseData = null;
        this.isLocked = true;
        // Clear any sensitive files
        const sensitiveFiles = [
            './chronos-data',
            './knowledge',
            './.qantum-license'
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
        this.emit('destroyed');
        // Exit process
        // Complexity: O(1)
        setTimeout(() => process.exit(1), 1000);
    }
    // ─────────────────────────────────────────────────────────────────────────────────────
    // UTILITIES
    // ─────────────────────────────────────────────────────────────────────────────────────
    /**
     * Check if system is locked
     */
    // Complexity: O(1)
    isSystemLocked() {
        return this.isLocked;
    }
    /**
     * Get current license info
     */
    // Complexity: O(1)
    getLicenseInfo() {
        return this.licenseData;
    }
    /**
     * Get current fingerprint
     */
    // Complexity: O(1)
    getFingerprint() {
        return this.currentFingerprint;
    }
    /**
     * Stop verification
     */
    // Complexity: O(1)
    stop() {
        if (this.verificationInterval) {
            // Complexity: O(1)
            clearInterval(this.verificationInterval);
            this.verificationInterval = null;
        }
    }
}
exports.HardwareLock = HardwareLock;
// ═══════════════════════════════════════════════════════════════════════════════════════
// SINGLETON & FACTORY
// ═══════════════════════════════════════════════════════════════════════════════════════
let defaultLock = null;
function getHardwareLock(config) {
    if (!defaultLock) {
        defaultLock = new HardwareLock(config);
    }
    return defaultLock;
}
function createHardwareLock(config) {
    return new HardwareLock(config);
}
exports.default = HardwareLock;
