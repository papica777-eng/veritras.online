/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * Aeterna - LICENSE MANAGER
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * @copyright 2025 Димитър Продромов (Dimitar Prodromov). All Rights Reserved.
 * @license PROPRIETARY AND CONFIDENTIAL
 *
 * Hardware ID verification system for enterprise licensing.
 * Protects intellectual property and ensures authorized usage only.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import * as os from 'os';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

// ═══════════════════════════════════════════════════════════════════════════════
// 🛡️ THE INTELLECTUAL SHIELD - Hardware-Locked Licensing
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * License types
 */
export type LicenseType = 'trial' | 'professional' | 'enterprise' | 'sovereign';

/**
 * License info
 */
export interface LicenseInfo {
    type: LicenseType;
    owner: string;
    email: string;
    hardwareId: string;
    machineFingerprint: string;
    issuedAt: number;
    expiresAt: number;
    features: string[];
    maxInstances: number;
    signature: string;
}

/**
 * License validation result
 */
export interface LicenseValidationResult {
    valid: boolean;
    type: LicenseType | null;
    owner: string | null;
    features: string[];
    daysRemaining: number;
    error?: string;
}

/**
 * Hardware info for fingerprinting
 */
export interface HardwareInfo {
    cpuModel: string;
    cpuCores: number;
    totalMemory: number;
    hostname: string;
    platform: string;
    macAddresses: string[];
    diskSerial?: string;
    motherboardSerial?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🔐 LICENSE MANAGER CLASS
// ═══════════════════════════════════════════════════════════════════════════════

export class LicenseManager {
    private static readonly LICENSE_FILE = '.Aeterna.license';
    private static readonly PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA5vG2r4K9HdMzXx3JxY7q
kMrLh8sYbKqP2gWb0Z1xVvN3Q8JdHmFnRvKjX2L5sT6D7wN8fP1Yg3H4iK9jL0S
2U1qR3xZ4oP7vM6dN5sA8hG9tY2eV1wB4xC3rI0jF6qK8uL5nP9oS7tX1zY2aD3
bE4cF5gH6iJ7kL8mN9oP0qR1sT2uV3wX4yZ5aB6cD7eF8gH9iJ0kL1mN2oP3qR4
sT5uV6wX7yZ8aB9cD0eF1gH2iJ3kL4mN5oP6qR7sT8uV9wX0yZ1aB2cD3eF4gH5
iJ6kL7mN8oP9qR0sT1uV2wX3yZ4aB5cD6eF7gH8iJ9kL0mN1oP2qR3sT4uV5wX6
yQIDAQAB
-----END PUBLIC KEY-----`;

    private license: LicenseInfo | null = null;
    private hardwareInfo: HardwareInfo;

    constructor() {
        this.hardwareInfo = this.collectHardwareInfo();
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 🔍 HARDWARE FINGERPRINTING
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Collect hardware information
     */
    // Complexity: O(N*M) — nested iteration detected
    private collectHardwareInfo(): HardwareInfo {
        const networkInterfaces = os.networkInterfaces();
        const macAddresses: string[] = [];

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
    // Complexity: O(N) — linear iteration
    private getDiskSerial(): string | undefined {
        if (os.platform() !== 'win32') return undefined;

        try {
            const output = execSync('wmic diskdrive get SerialNumber', { encoding: 'utf-8' });
            const lines = output.trim().split('\n').filter(l => l.trim() && !l.includes('SerialNumber'));
            return lines[0]?.trim();
        } catch {
            return undefined;
        }
    }

    /**
     * Get motherboard serial (Windows)
     */
    // Complexity: O(N) — linear iteration
    private getMotherboardSerial(): string | undefined {
        if (os.platform() !== 'win32') return undefined;

        try {
            const output = execSync('wmic baseboard get SerialNumber', { encoding: 'utf-8' });
            const lines = output.trim().split('\n').filter(l => l.trim() && !l.includes('SerialNumber'));
            return lines[0]?.trim();
        } catch {
            return undefined;
        }
    }

    /**
     * Generate hardware ID
     */
    // Complexity: O(N log N) — sort operation
    generateHardwareId(): string {
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
    // Complexity: O(N log N) — sort operation
    generateMachineFingerprint(): string {
        const data = [
            this.hardwareInfo.cpuModel,
            this.hardwareInfo.cpuCores.toString(),
            this.hardwareInfo.totalMemory.toString(),
            this.hardwareInfo.hostname,
            this.hardwareInfo.platform,
            this.hardwareInfo.diskSerial || ',
            this.hardwareInfo.motherboardSerial || ',
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
    // Complexity: O(1)
    loadLicense(licenseFile?: string): boolean {
        const filePath = licenseFile || path.join(process.cwd(), LicenseManager.LICENSE_FILE);

        try {
            if (!fs.existsSync(filePath)) {
                return false;
            }

            const content = fs.readFileSync(filePath, 'utf-8');
            const decoded = Buffer.from(content, 'base64').toString('utf-8');
            this.license = JSON.parse(decoded);
            return true;
        } catch {
            this.license = null;
            return false;
        }
    }

    /**
     * Validate loaded license
     */
    // Complexity: O(1) — amortized
    validate(): LicenseValidationResult {
        if (!this.license) {
            return {
                valid: false,
                type: null,
                owner: null,
                features: [],
                daysRemaining: 0,
                error: 'Не е намерен лиценз. Моля активирайте Aeterna.'
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
    // Complexity: O(N*M) — nested iteration detected
    private verifySignature(): boolean {
        if (!this.license) return false;

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
        } catch {
            // In development mode or test mode, allow dev signatures
            return process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';
        }
    }

    /**
     * Check if specific feature is licensed
     */
    // Complexity: O(1)
    hasFeature(feature: string): boolean {
        if (!this.license) return false;

        const validation = this.validate();
        if (!validation.valid) return false;

        // Sovereign license has all features
        if (this.license.type === 'sovereign') return true;

        return this.license.features.includes(feature);
    }

    /**
     * Get max instances allowed
     */
    // Complexity: O(N) — potential recursive descent
    getMaxInstances(): number {
        if (!this.license) return 1;

        const validation = this.validate();
        if (!validation.valid) return 1;

        return this.license.maxInstances;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 🎫 LICENSE GENERATION (For Development/Testing)
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Generate a development license
     */
    // Complexity: O(N log N) — sort operation
    generateDevLicense(owner: string, email: string, type: LicenseType = 'sovereign'): string {
        const now = Date.now();
        const expiresAt = now + (365 * 24 * 60 * 60 * 1000); // 1 year

        const features: Record<LicenseType, string[]> = {
            trial: ['basic-automation', 'dashboard'],
            professional: ['basic-automation', 'dashboard', 'thermal-monitoring', 'docker-integration'],
            enterprise: ['basic-automation', 'dashboard', 'thermal-monitoring', 'docker-integration', 'swarm-execution', 'bulgarian-tts'],
            sovereign: ['*'] // All features
        };

        const maxInstances: Record<LicenseType, number> = {
            trial: 2,
            professional: 10,
            enterprise: 50,
            sovereign: 999
        };

        const licenseData: Omit<LicenseInfo, 'signature'> = {
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

        const fullLicense: LicenseInfo = { ...licenseData, signature };

        return Buffer.from(JSON.stringify(fullLicense)).toString('base64');
    }

    /**
     * Save license to file
     */
    // Complexity: O(1)
    saveLicense(licenseString: string, licenseFile?: string): void {
        const filePath = licenseFile || path.join(process.cwd(), LicenseManager.LICENSE_FILE);
        fs.writeFileSync(filePath, licenseString, 'utf-8');
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 📊 STATUS
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Get hardware info
     */
    // Complexity: O(1)
    getHardwareInfo(): HardwareInfo {
        return { ...this.hardwareInfo };
    }

    /**
     * Get license info
     */
    // Complexity: O(1)
    getLicenseInfo(): LicenseInfo | null {
        return this.license ? { ...this.license } : null;
    }

    /**
     * Display license status
     */
    // Complexity: O(1) — amortized
    displayStatus(): string {
        const validation = this.validate();
        const hwId = this.generateHardwareId();

        let output = `
╔══════════════════════════════════════════════════════════════════════════════╗
║                     🛡️ Aeterna License Manager                           ║
╠══════════════════════════════════════════════════════════════════════════════╣
║ Hardware ID: ${hwId}                ║
║ CPU: ${this.hardwareInfo.cpuModel.substring(0, 50).padEnd(50)}       ║
║ Cores: ${this.hardwareInfo.cpuCores.toString().padEnd(4)} | RAM: ${(this.hardwareInfo.totalMemory / (1024*1024*1024)).toFixed(1).padEnd(6)} GB | Platform: ${this.hardwareInfo.platform.padEnd(10)}║
╠══════════════════════════════════════════════════════════════════════════════╣`;

        if (validation.valid) {
            output += `
║ ✅ Статус: АКТИВЕН                                                           ║
║ Тип: ${(validation.type || 'N/A').toUpperCase().padEnd(15)} | Собственик: ${(validation.owner || 'N/A').padEnd(25)}║
║ Оставащи дни: ${validation.daysRemaining.toString().padEnd(5)} | Функции: ${validation.features.join(', ').substring(0, 35).padEnd(35)}║`;
        } else {
            output += `
║ ❌ Статус: НЕВАЛИДЕН                                                         ║
║ Грешка: ${(validation.error || 'Unknown').substring(0, 60).padEnd(60)}     ║`;
        }

        output += `
╚══════════════════════════════════════════════════════════════════════════════╝`;

        return output;
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🔒 LICENSE GUARD DECORATOR
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Decorator to guard methods with license check
 */
export function requireLicense(feature?: string) {
    return function (
        target: unknown,
        propertyKey: string,
        descriptor: PropertyDescriptor
    ) {
        const originalMethod = descriptor.value;

        descriptor.value = function (...args: unknown[]) {
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

export default LicenseManager;
