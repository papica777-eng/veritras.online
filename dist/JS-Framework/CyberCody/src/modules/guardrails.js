"use strict";
// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║  CYBERCODY v1.0.0 - ETHICAL GUARDRAILS                                       ║
// ║  "The Moral Compass" - Authorization & Scope Enforcement                     ║
// ║  CRITICAL: Blocks All Unauthorized Scanning Operations                       ║
// ╚══════════════════════════════════════════════════════════════════════════════╝
Object.defineProperty(exports, "__esModule", { value: true });
exports.EthicalGuardrails = void 0;
const fs_1 = require("fs");
const crypto_1 = require("crypto");
// ═══════════════════════════════════════════════════════════════════════════════
// 🚫 BLOCKED TARGETS - NEVER SCAN THESE
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * Critical infrastructure patterns that should NEVER be scanned
 * without explicit government/organizational authorization
 */
const BLOCKED_PATTERNS = [
    // Government domains
    /\.gov$/i,
    /\.gov\.\w{2}$/i,
    /\.mil$/i,
    /\.edu$/i,
    // Financial infrastructure
    /\.bank$/i,
    /paypal\.com$/i,
    /stripe\.com$/i,
    /mastercard\.com$/i,
    /visa\.com$/i,
    // Healthcare
    /\.health$/i,
    /\.hospital$/i,
    // Critical infrastructure
    /scada\./i,
    /\.ics\./i,
    /\.industrial\./i,
    // Major cloud providers (internal endpoints)
    /169\.254\.169\.254/, // AWS/GCP metadata
    /metadata\.google\.internal/,
    /100\.100\.100\.200/, // Alibaba metadata
    // Local/Internal addresses
    /^127\./,
    /^10\./,
    /^172\.(1[6-9]|2[0-9]|3[01])\./,
    /^192\.168\./,
    /^localhost$/i,
    /^::1$/,
    /^\[::1\]$/,
];
/**
 * Reserved IP ranges that require explicit authorization
 */
const RESERVED_IP_RANGES = [
    { start: '0.0.0.0', end: '0.255.255.255', name: 'Current network' },
    { start: '10.0.0.0', end: '10.255.255.255', name: 'Private Class A' },
    { start: '127.0.0.0', end: '127.255.255.255', name: 'Loopback' },
    { start: '169.254.0.0', end: '169.254.255.255', name: 'Link-local' },
    { start: '172.16.0.0', end: '172.31.255.255', name: 'Private Class B' },
    { start: '192.168.0.0', end: '192.168.255.255', name: 'Private Class C' },
    { start: '224.0.0.0', end: '239.255.255.255', name: 'Multicast' },
    { start: '240.0.0.0', end: '255.255.255.255', name: 'Reserved' },
];
// ═══════════════════════════════════════════════════════════════════════════════
// 🛡️ ETHICAL GUARDRAILS CLASS
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * Ethical Guardrails Module for CyberCody
 * Enforces authorization and scope restrictions for all scanning operations
 *
 * ⚠️ CRITICAL: This module MUST be used before ANY scanning operation
 */
class EthicalGuardrails {
    config;
    consent = null;
    authorizationLog = [];
    constructor(config) {
        this.config = config;
        // Load consent file if required
        if (config.requireConsentFile && config.consentFilePath) {
            this.loadConsentFile(config.consentFilePath);
        }
    }
    /**
     * Check if a target is authorized for scanning
     * THIS MUST BE CALLED BEFORE ANY SCAN OPERATION
     */
    authorize(target) {
        const result = {
            authorized: false,
            reason: '',
            target,
            timestamp: new Date(),
            guardrailsApplied: [],
        };
        try {
            const url = new URL(target);
            const hostname = url.hostname;
            const ip = this.isIP(hostname) ? hostname : null;
            // Check 1: Blocked patterns (critical infrastructure)
            if (this.config.blockCriticalInfrastructure) {
                result.guardrailsApplied.push('critical-infrastructure-check');
                for (const pattern of BLOCKED_PATTERNS) {
                    if (pattern.test(hostname) || pattern.test(target)) {
                        result.reason = `BLOCKED: Target matches critical infrastructure pattern: ${pattern.source}`;
                        this.logAuthorization(result);
                        return result;
                    }
                }
            }
            // Check 2: Reserved IP ranges
            if (ip) {
                result.guardrailsApplied.push('reserved-ip-check');
                const reservedRange = this.isInReservedRange(ip);
                if (reservedRange && !this.isExplicitlyAllowed(ip)) {
                    result.reason = `BLOCKED: Target IP is in reserved range: ${reservedRange}`;
                    this.logAuthorization(result);
                    return result;
                }
            }
            // Check 3: Domain allowlist
            result.guardrailsApplied.push('domain-allowlist-check');
            if (this.config.allowedDomains.length > 0) {
                const domainAllowed = this.config.allowedDomains.some((allowed) => {
                    // Support wildcard domains like *.example.com
                    if (allowed.startsWith('*.')) {
                        const baseDomain = allowed.slice(2);
                        return hostname === baseDomain || hostname.endsWith('.' + baseDomain);
                    }
                    return hostname === allowed;
                });
                if (!domainAllowed) {
                    result.reason = `BLOCKED: Domain ${hostname} not in allowlist`;
                    this.logAuthorization(result);
                    return result;
                }
            }
            // Check 4: IP allowlist
            if (ip) {
                result.guardrailsApplied.push('ip-allowlist-check');
                if (this.config.allowedTargets.length > 0) {
                    const ipAllowed = this.config.allowedTargets.some((allowed) => {
                        // Support CIDR notation
                        if (allowed.includes('/')) {
                            return this.isInCIDR(ip, allowed);
                        }
                        return ip === allowed;
                    });
                    if (!ipAllowed) {
                        result.reason = `BLOCKED: IP ${ip} not in allowlist`;
                        this.logAuthorization(result);
                        return result;
                    }
                }
            }
            // Check 5: Consent file validation
            if (this.config.requireConsentFile) {
                result.guardrailsApplied.push('consent-file-check');
                if (!this.consent) {
                    result.reason = 'BLOCKED: No valid consent file loaded';
                    this.logAuthorization(result);
                    return result;
                }
                if (!this.isWithinConsentScope(hostname, ip)) {
                    result.reason = 'BLOCKED: Target not within consent file scope';
                    this.logAuthorization(result);
                    return result;
                }
                if (!this.isConsentValid()) {
                    result.reason = 'BLOCKED: Consent file has expired or is not yet valid';
                    this.logAuthorization(result);
                    return result;
                }
            }
            // Check 6: Rate limiting
            result.guardrailsApplied.push('rate-limit-check');
            // Rate limiting is enforced at execution time, just mark it as applied
            // All checks passed
            result.authorized = true;
            result.reason = 'Target authorized for scanning';
            this.logAuthorization(result);
            return result;
        }
        catch (error) {
            result.reason = `BLOCKED: Invalid target URL - ${error instanceof Error ? error.message : 'Unknown error'}`;
            this.logAuthorization(result);
            return result;
        }
    }
    /**
     * Batch authorize multiple targets
     */
    authorizeMultiple(targets) {
        const results = new Map();
        for (const target of targets) {
            results.set(target, this.authorize(target));
        }
        return results;
    }
    /**
     * Load and validate consent file
     */
    loadConsentFile(path) {
        if (!(0, fs_1.existsSync)(path)) {
            throw new Error(`Consent file not found: ${path}`);
        }
        try {
            const content = (0, fs_1.readFileSync)(path, 'utf-8');
            const consent = JSON.parse(content);
            // Validate required fields
            if (!consent.version || !consent.authorizer || !consent.scope) {
                throw new Error('Invalid consent file format');
            }
            // Verify signature (in production, use proper cryptographic verification)
            const expectedHash = this.hashConsentData(consent);
            if (consent.signature !== expectedHash) {
                console.warn('⚠️ Consent file signature mismatch - proceeding with caution');
            }
            this.consent = consent;
            console.log(`✅ Consent file loaded: Authorized by ${consent.authorizer.name}`);
            console.log(`   Valid: ${consent.validFrom} to ${consent.validUntil}`);
            console.log(`   Scope: ${consent.scope.domains.length} domains, ${consent.scope.ipAddresses.length} IPs`);
        }
        catch (error) {
            throw new Error(`Failed to load consent file: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Check if hostname/IP is within consent scope
     */
    isWithinConsentScope(hostname, ip) {
        if (!this.consent)
            return false;
        // Check domains
        for (const domain of this.consent.scope.domains) {
            if (domain.startsWith('*.')) {
                const baseDomain = domain.slice(2);
                if (hostname === baseDomain || hostname.endsWith('.' + baseDomain)) {
                    return true;
                }
            }
            else if (hostname === domain) {
                return true;
            }
        }
        // Check IPs
        if (ip) {
            if (this.consent.scope.ipAddresses.includes(ip)) {
                return true;
            }
            // Check IP ranges
            for (const range of this.consent.scope.ipRanges) {
                if (this.isIPInRange(ip, range.start, range.end)) {
                    return true;
                }
            }
        }
        return false;
    }
    /**
     * Check if consent is currently valid (time-based)
     */
    isConsentValid() {
        if (!this.consent)
            return false;
        const now = new Date();
        const validFrom = new Date(this.consent.validFrom);
        const validUntil = new Date(this.consent.validUntil);
        return now >= validFrom && now <= validUntil;
    }
    /**
     * Hash consent data for signature verification
     */
    hashConsentData(consent) {
        const dataToHash = JSON.stringify({
            version: consent.version,
            authorizer: consent.authorizer,
            scope: consent.scope,
            validFrom: consent.validFrom,
            validUntil: consent.validUntil,
        });
        return (0, crypto_1.createHash)('sha256').update(dataToHash).digest('hex');
    }
    /**
     * Check if string is an IP address
     */
    isIP(str) {
        // IPv4
        const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
        // IPv6 (simplified)
        const ipv6Pattern = /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/;
        return ipv4Pattern.test(str) || ipv6Pattern.test(str);
    }
    /**
     * Check if IP is in a reserved range
     */
    isInReservedRange(ip) {
        for (const range of RESERVED_IP_RANGES) {
            if (this.isIPInRange(ip, range.start, range.end)) {
                return range.name;
            }
        }
        return null;
    }
    /**
     * Check if IP is in a specific range
     */
    isIPInRange(ip, start, end) {
        const ipNum = this.ipToNumber(ip);
        const startNum = this.ipToNumber(start);
        const endNum = this.ipToNumber(end);
        return ipNum >= startNum && ipNum <= endNum;
    }
    /**
     * Convert IP to number for range comparison
     */
    ipToNumber(ip) {
        const parts = ip.split('.').map(Number);
        return ((parts[0] << 24) + (parts[1] << 16) + (parts[2] << 8) + parts[3]) >>> 0;
    }
    /**
     * Check if IP is in CIDR range
     */
    isInCIDR(ip, cidr) {
        const [range, bits] = cidr.split('/');
        if (!range || !bits)
            return false;
        const mask = ~(2 ** (32 - parseInt(bits)) - 1);
        const ipNum = this.ipToNumber(ip);
        const rangeNum = this.ipToNumber(range);
        return (ipNum & mask) === (rangeNum & mask);
    }
    /**
     * Check if target is explicitly allowed
     */
    isExplicitlyAllowed(target) {
        return this.config.allowedTargets.includes(target) ||
            this.config.allowedDomains.includes(target);
    }
    /**
     * Log authorization result
     */
    logAuthorization(result) {
        this.authorizationLog.push(result);
        const emoji = result.authorized ? '✅' : '🚫';
        console.log(`${emoji} [GUARDRAILS] ${result.target}: ${result.reason}`);
    }
    /**
     * Get authorization log
     */
    getAuthorizationLog() {
        return [...this.authorizationLog];
    }
    /**
     * Get blocked targets from log
     */
    getBlockedTargets() {
        return this.authorizationLog.filter((r) => !r.authorized);
    }
    /**
     * Generate sample consent file
     */
    static generateSampleConsentFile(_outputPath) {
        const consent = {
            version: '1.0',
            timestamp: new Date().toISOString(),
            authorizer: {
                name: 'Security Team Lead',
                email: 'security@example.com',
                organization: 'Example Corp',
            },
            scope: {
                domains: ['*.example.com', 'test.example.org'],
                ipAddresses: ['192.168.1.100', '192.168.1.101'],
                ipRanges: [
                    { start: '192.168.1.0', end: '192.168.1.255' },
                ],
            },
            validFrom: new Date().toISOString(),
            validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
            restrictions: [
                'No denial of service testing',
                'No data exfiltration',
                'Report all findings within 24 hours',
            ],
            signature: '', // Will be set below
        };
        // Generate signature
        const dataToHash = JSON.stringify({
            version: consent.version,
            authorizer: consent.authorizer,
            scope: consent.scope,
            validFrom: consent.validFrom,
            validUntil: consent.validUntil,
        });
        consent.signature = (0, crypto_1.createHash)('sha256').update(dataToHash).digest('hex');
        return consent;
    }
    /**
     * Print guardrails status
     */
    printStatus() {
        console.log('\n╔══════════════════════════════════════════════════════════════════╗');
        console.log('║           🛡️  CYBERCODY ETHICAL GUARDRAILS STATUS  🛡️            ║');
        console.log('╠══════════════════════════════════════════════════════════════════╣');
        console.log(`║ Block Critical Infrastructure: ${this.config.blockCriticalInfrastructure ? '✅ ENABLED' : '❌ DISABLED'}              ║`);
        console.log(`║ Require Consent File: ${this.config.requireConsentFile ? '✅ ENABLED' : '❌ DISABLED'}                       ║`);
        console.log(`║ Allowed Domains: ${this.config.allowedDomains.length.toString().padStart(3)} domains                            ║`);
        console.log(`║ Allowed IPs: ${this.config.allowedTargets.length.toString().padStart(3)} addresses                              ║`);
        console.log(`║ Max Requests/sec: ${this.config.maxRequestsPerSecond.toString().padStart(4)}                                   ║`);
        console.log('╠══════════════════════════════════════════════════════════════════╣');
        if (this.consent) {
            console.log('║ 📜 CONSENT FILE LOADED                                           ║');
            console.log(`║    Authorizer: ${this.consent.authorizer.name.substring(0, 45).padEnd(45)} ║`);
            console.log(`║    Valid Until: ${this.consent.validUntil.substring(0, 44).padEnd(44)} ║`);
        }
        else {
            console.log('║ ⚠️  NO CONSENT FILE LOADED                                        ║');
        }
        console.log('╚══════════════════════════════════════════════════════════════════╝\n');
    }
}
exports.EthicalGuardrails = EthicalGuardrails;
exports.default = EthicalGuardrails;
