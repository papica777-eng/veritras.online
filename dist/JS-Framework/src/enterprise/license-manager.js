"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * QAntum - LICENSE MANAGER
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * @copyright 2025 Димитър Продромов (Dimitar Prodromov). All Rights Reserved.
 * @license PROPRIETARY AND CONFIDENTIAL
 *
 * Hardware ID verification system for enterprise licensing.
 * Protects intellectual property and ensures authorized usage only.
 * ═══════════════════════════════════════════════════════════════════════════════
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
exports.LicenseManager = void 0;
exports.requireLicense = requireLicense;
const os = __importStar(require("os"));
const crypto = __importStar(require("crypto"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const child_process_1 = require("child_process");
// ═══════════════════════════════════════════════════════════════════════════════
// 🔐 LICENSE MANAGER CLASS
// ═══════════════════════════════════════════════════════════════════════════════
class LicenseManager {
    static LICENSE_FILE = '.QAntum.license';
    static PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA5vG2r4K9HdMzXx3JxY7q
kMrLh8sYbKqP2gWb0Z1xVvN3Q8JdHmFnRvKjX2L5sT6D7wN8fP1Yg3H4iK9jL0S
2U1qR3xZ4oP7vM6dN5sA8hG9tY2eV1wB4xC3rI0jF6qK8uL5nP9oS7tX1zY2aD3
bE4cF5gH6iJ7kL8mN9oP0qR1sT2uV3wX4yZ5aB6cD7eF8gH9iJ0kL1mN2oP3qR4
sT5uV6wX7yZ8aB9cD0eF1gH2iJ3kL4mN5oP6qR7sT8uV9wX0yZ1aB2cD3eF4gH5
iJ6kL7mN8oP9qR0sT1uV2wX3yZ4aB5cD6eF7gH8iJ9kL0mN1oP2qR3sT4uV5wX6
yQIDAQAB
-----END PUBLIC KEY-----`;
    license = null;
    hardwareInfo;
    constructor() {
        this.hardwareInfo = this.collectHardwareInfo();
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // 🔍 HARDWARE FINGERPRINTING
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Collect hardware information
     */
    collectHardwareInfo() {
        const networkInterfaces = os.networkInterfaces();
        const macAddresses = [];
        for (const [, interfaces] of Object.entries(networkInterfaces)) {
            if (interfaces) {
                for (const iface of interfaces) {
                    if (iface.mac && iface.mac !== '00:00:00:00:00:00') {
                        macAddresses.push(iface.mac);
                    }
                }
            }
        }
        return {
            cpuModel: os.cpus()[0]?.model || 'Unknown',
            cpuCores: os.cpus().length,
            totalMemory: os.totalmem(),
            hostname: os.hostname(),
            platform: os.platform(),
            macAddresses,
            diskSerial: this.getDiskSerial(),
            motherboardSerial: this.getMotherboardSerial()
        };
    }
    /**
     * Get disk serial (Windows)
     */
    getDiskSerial() {
        if (os.platform() !== 'win32')
            return undefined;
        try {
            const output = (0, child_process_1.execSync)('wmic diskdrive get SerialNumber', { encoding: 'utf-8' });
            const lines = output.trim().split('\n').filter(l => l.trim() && !l.includes('SerialNumber'));
            return lines[0]?.trim();
        }
        catch {
            return undefined;
        }
    }
    /**
     * Get motherboard serial (Windows)
     */
    getMotherboardSerial() {
        if (os.platform() !== 'win32')
            return undefined;
        try {
            const output = (0, child_process_1.execSync)('wmic baseboard get SerialNumber', { encoding: 'utf-8' });
            const lines = output.trim().split('\n').filter(l => l.trim() && !l.includes('SerialNumber'));
            return lines[0]?.trim();
        }
        catch {
            return undefined;
        }
    }
    /**
     * Generate hardware ID
     */
    generateHardwareId() {
        const data = [
            this.hardwareInfo.cpuModel,
            this.hardwareInfo.cpuCores.toString(),
            Math.round(this.hardwareInfo.totalMemory / (1024 * 1024 * 1024)).toString(),
            this.hardwareInfo.hostname,
            ...this.hardwareInfo.macAddresses.sort()
        ].join('|');
        return crypto.createHash('sha256').update(data).digest('hex').substring(0, 32).toUpperCase();
    }
    /**
     * Generate machine fingerprint (more detailed)
     */
    generateMachineFingerprint() {
        const data = [
            this.hardwareInfo.cpuModel,
            this.hardwareInfo.cpuCores.toString(),
            this.hardwareInfo.totalMemory.toString(),
            this.hardwareInfo.hostname,
            this.hardwareInfo.platform,
            this.hardwareInfo.diskSerial || '',
            this.hardwareInfo.motherboardSerial || '',
            ...this.hardwareInfo.macAddresses.sort()
        ].join('::');
        return crypto.createHash('sha512').update(data).digest('hex');
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // 📜 LICENSE OPERATIONS
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Load license from file
     */
    loadLicense(licenseFile) {
        const filePath = licenseFile || path.join(process.cwd(), LicenseManager.LICENSE_FILE);
        try {
            if (!fs.existsSync(filePath)) {
                return false;
            }
            const content = fs.readFileSync(filePath, 'utf-8');
            const decoded = Buffer.from(content, 'base64').toString('utf-8');
            this.license = JSON.parse(decoded);
            return true;
        }
        catch {
            this.license = null;
            return false;
        }
    }
    /**
     * Validate loaded license
     */
    validate() {
        if (!this.license) {
            return {
                valid: false,
                type: null,
                owner: null,
                features: [],
                daysRemaining: 0,
                error: 'Не е намерен лиценз. Моля активирайте QAntum.'
            };
        }
        // Check hardware ID match
        const currentHardwareId = this.generateHardwareId();
        if (this.license.hardwareId !== currentHardwareId) {
            return {
                valid: false,
                type: null,
                owner: null,
                features: [],
                daysRemaining: 0,
                error: `Лицензът е за друга машина. Очакван: ${this.license.hardwareId}, Текущ: ${currentHardwareId}`
            };
        }
        // Check expiration
        const now = Date.now();
        if (now > this.license.expiresAt) {
            const expiredDays = Math.ceil((now - this.license.expiresAt) / (1000 * 60 * 60 * 24));
            return {
                valid: false,
                type: this.license.type,
                owner: this.license.owner,
                features: [],
                daysRemaining: -expiredDays,
                error: `Лицензът е изтекъл преди ${expiredDays} дни.`
            };
        }
        // Verify signature
        if (!this.verifySignature()) {
            return {
                valid: false,
                type: null,
                owner: null,
                features: [],
                daysRemaining: 0,
                error: 'Невалиден лицензен подпис. Възможна манипулация.'
            };
        }
        const daysRemaining = Math.ceil((this.license.expiresAt - now) / (1000 * 60 * 60 * 24));
        return {
            valid: true,
            type: this.license.type,
            owner: this.license.owner,
            features: this.license.features,
            daysRemaining
        };
    }
    /**
     * Verify license signature
     */
    verifySignature() {
        if (!this.license)
            return false;
        try {
            const { signature, ...dataToVerify } = this.license;
            const dataString = JSON.stringify(dataToVerify, Object.keys(dataToVerify).sort());
            // Check for dev license signature (simple hash)
            const devSignature = crypto.createHash('sha256').update(dataString + 'dev-secret').digest('base64');
            if (signature === devSignature) {
                return true;
            }
            // Try RSA verification for production licenses
            const verify = crypto.createVerify('RSA-SHA256');
            verify.update(dataString);
            return verify.verify(LicenseManager.PUBLIC_KEY, signature, 'base64');
        }
        catch {
            // In development mode or test mode, allow dev signatures
            return process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';
        }
    }
    /**
     * Check if specific feature is licensed
     */
    hasFeature(feature) {
        if (!this.license)
            return false;
        const validation = this.validate();
        if (!validation.valid)
            return false;
        // Sovereign license has all features
        if (this.license.type === 'sovereign')
            return true;
        return this.license.features.includes(feature);
    }
    /**
     * Get max instances allowed
     */
    getMaxInstances() {
        if (!this.license)
            return 1;
        const validation = this.validate();
        if (!validation.valid)
            return 1;
        return this.license.maxInstances;
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // 🎫 LICENSE GENERATION (For Development/Testing)
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Generate a development license
     */
    generateDevLicense(owner, email, type = 'sovereign') {
        const now = Date.now();
        const expiresAt = now + (365 * 24 * 60 * 60 * 1000); // 1 year
        const features = {
            trial: ['basic-automation', 'dashboard'],
            professional: ['basic-automation', 'dashboard', 'thermal-monitoring', 'docker-integration'],
            enterprise: ['basic-automation', 'dashboard', 'thermal-monitoring', 'docker-integration', 'swarm-execution', 'bulgarian-tts'],
            sovereign: ['*'] // All features
        };
        const maxInstances = {
            trial: 2,
            professional: 10,
            enterprise: 50,
            sovereign: 999
        };
        const licenseData = {
            type,
            owner,
            email,
            hardwareId: this.generateHardwareId(),
            machineFingerprint: this.generateMachineFingerprint(),
            issuedAt: now,
            expiresAt,
            features: features[type],
            maxInstances: maxInstances[type]
        };
        // In dev mode, create a simple signature
        const dataString = JSON.stringify(licenseData, Object.keys(licenseData).sort());
        const signature = crypto.createHash('sha256').update(dataString + 'dev-secret').digest('base64');
        const fullLicense = { ...licenseData, signature };
        return Buffer.from(JSON.stringify(fullLicense)).toString('base64');
    }
    /**
     * Save license to file
     */
    saveLicense(licenseString, licenseFile) {
        const filePath = licenseFile || path.join(process.cwd(), LicenseManager.LICENSE_FILE);
        fs.writeFileSync(filePath, licenseString, 'utf-8');
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // 📊 STATUS
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Get hardware info
     */
    getHardwareInfo() {
        return { ...this.hardwareInfo };
    }
    /**
     * Get license info
     */
    getLicenseInfo() {
        return this.license ? { ...this.license } : null;
    }
    /**
     * Display license status
     */
    displayStatus() {
        const validation = this.validate();
        const hwId = this.generateHardwareId();
        let output = `
╔══════════════════════════════════════════════════════════════════════════════╗
║                     🛡️ QAntum License Manager                           ║
╠══════════════════════════════════════════════════════════════════════════════╣
║ Hardware ID: ${hwId}                ║
║ CPU: ${this.hardwareInfo.cpuModel.substring(0, 50).padEnd(50)}       ║
║ Cores: ${this.hardwareInfo.cpuCores.toString().padEnd(4)} | RAM: ${(this.hardwareInfo.totalMemory / (1024 * 1024 * 1024)).toFixed(1).padEnd(6)} GB | Platform: ${this.hardwareInfo.platform.padEnd(10)}║
╠══════════════════════════════════════════════════════════════════════════════╣`;
        if (validation.valid) {
            output += `
║ ✅ Статус: АКТИВЕН                                                           ║
║ Тип: ${(validation.type || 'N/A').toUpperCase().padEnd(15)} | Собственик: ${(validation.owner || 'N/A').padEnd(25)}║
║ Оставащи дни: ${validation.daysRemaining.toString().padEnd(5)} | Функции: ${validation.features.join(', ').substring(0, 35).padEnd(35)}║`;
        }
        else {
            output += `
║ ❌ Статус: НЕВАЛИДЕН                                                         ║
║ Грешка: ${(validation.error || 'Unknown').substring(0, 60).padEnd(60)}     ║`;
        }
        output += `
╚══════════════════════════════════════════════════════════════════════════════╝`;
        return output;
    }
}
exports.LicenseManager = LicenseManager;
// ═══════════════════════════════════════════════════════════════════════════════
// 🔒 LICENSE GUARD DECORATOR
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * Decorator to guard methods with license check
 */
function requireLicense(feature) {
    return function (target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        descriptor.value = function (...args) {
            const manager = new LicenseManager();
            manager.loadLicense();
            const validation = manager.validate();
            if (!validation.valid) {
                throw new Error(`License required: ${validation.error}`);
            }
            if (feature && !manager.hasFeature(feature)) {
                throw new Error(`Feature '${feature}' not included in your ${validation.type} license.`);
            }
            return originalMethod.apply(this, args);
        };
        return descriptor;
    };
}
// ═══════════════════════════════════════════════════════════════════════════════
// 📦 EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════
exports.default = LicenseManager;
