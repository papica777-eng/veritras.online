import type { EthicalConfig, AuthorizationResult } from '../../../qantum/SaaS-Framework/01_ECOSYSTEM_APPS/MrMindQATool/src/index';
interface ConsentFile {
    version: string;
    timestamp: string;
    authorizer: {
        name: string;
        email: string;
        organization: string;
    };
    scope: {
        domains: string[];
        ipAddresses: string[];
        ipRanges: {
            start: string;
            end: string;
        }[];
    };
    validFrom: string;
    validUntil: string;
    restrictions: string[];
    signature: string;
}
/**
 * Ethical Guardrails Module for CyberCody
 * Enforces authorization and scope restrictions for all scanning operations
 *
 * ⚠️ CRITICAL: This module MUST be used before ANY scanning operation
 */
export declare class EthicalGuardrails {
    private config;
    private consent;
    private authorizationLog;
    constructor(config: EthicalConfig);
    /**
     * Check if a target is authorized for scanning
     * THIS MUST BE CALLED BEFORE ANY SCAN OPERATION
     */
    authorize(target: string): AuthorizationResult;
    /**
     * Batch authorize multiple targets
     */
    authorizeMultiple(targets: string[]): Map<string, AuthorizationResult>;
    /**
     * Load and validate consent file
     */
    private loadConsentFile;
    /**
     * Check if hostname/IP is within consent scope
     */
    private isWithinConsentScope;
    /**
     * Check if consent is currently valid (time-based)
     */
    private isConsentValid;
    /**
     * Hash consent data for signature verification
     */
    private hashConsentData;
    /**
     * Check if string is an IP address
     */
    private isIP;
    /**
     * Check if IP is in a reserved range
     */
    private isInReservedRange;
    /**
     * Check if IP is in a specific range
     */
    private isIPInRange;
    /**
     * Convert IP to number for range comparison
     */
    private ipToNumber;
    /**
     * Check if IP is in CIDR range
     */
    private isInCIDR;
    /**
     * Check if target is explicitly allowed
     */
    private isExplicitlyAllowed;
    /**
     * Log authorization result
     */
    private logAuthorization;
    /**
     * Get authorization log
     */
    getAuthorizationLog(): AuthorizationResult[];
    /**
     * Get blocked targets from log
     */
    getBlockedTargets(): AuthorizationResult[];
    /**
     * Generate sample consent file
     */
    static generateSampleConsentFile(_outputPath: string): ConsentFile;
    /**
     * Print guardrails status
     */
    printStatus(): void;
}
export default EthicalGuardrails;
//# sourceMappingURL=guardrails.d.ts.map