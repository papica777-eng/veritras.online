import { EventEmitter } from 'events';
import type { BOLATestReport } from '../../../qantum/SaaS-Framework/01_ECOSYSTEM_APPS/MisterMind-Site/dpengeneering/cybercody/src/modules/bola-tester';
import type { SessionOrchestratorReport } from '../../../qantum/SaaS-Framework/01_ECOSYSTEM_APPS/MisterMind-Site/dpengeneering/cybercody/src/modules/session-orchestrator';
import type { PIIScannerReport } from '../../../qantum/SaaS-Framework/01_ECOSYSTEM_APPS/MisterMind-Site/dpengeneering/cybercody/src/modules/pii-scanner';
/**
 * Supported frameworks for code generation
 */
export type Framework = 'express' | 'fastify' | 'nest' | 'koa' | 'hapi' | 'fastapi' | 'django' | 'flask' | 'spring';
/**
 * Programming language
 */
export type Language = 'javascript' | 'typescript' | 'python' | 'java';
/**
 * Vulnerability category for remediation
 */
export type VulnCategory = 'bola' | 'pii-exposure' | 'privilege-escalation' | 'rate-limit' | 'auth-bypass' | 'injection';
/**
 * Generated patch
 */
export interface GeneratedPatch {
    id: string;
    name: string;
    description: string;
    category: VulnCategory;
    framework: Framework;
    language: Language;
    code: string;
    filename: string;
    dependencies: string[];
    installCommands: string[];
    priority: 'critical' | 'high' | 'medium' | 'low';
    vulnerability: {
        type: string;
        endpoint?: string;
        description: string;
    };
    instructions: string[];
}
/**
 * Remediation report
 */
export interface RemediationReport {
    target: string;
    generatedAt: Date;
    framework: Framework;
    language: Language;
    patches: GeneratedPatch[];
    summary: {
        totalPatches: number;
        bolaPatches: number;
        piiPatches: number;
        privEscPatches: number;
        rateLimitPatches: number;
    };
    implementationOrder: string[];
    estimatedEffort: string;
}
/**
 * Remediation generator configuration
 */
export interface RemediationGenConfig {
    framework?: Framework;
    language?: Language;
    includeTests?: boolean;
    includeComments?: boolean;
    outputDir?: string;
}
/**
 * Remediation Generator - The Surgeon's Apprentice
 *
 * Automatically generates security patches for detected vulnerabilities.
 * Integrates with BOLA Tester, Session Orchestrator, and PII Scanner.
 */
export declare class RemediationGenerator extends EventEmitter {
    private config;
    private patches;
    constructor(config?: RemediationGenConfig);
    /**
     * Generate patches from BOLA test report
     */
    generateFromBOLAReport(report: BOLATestReport): GeneratedPatch[];
    /**
     * Generate single BOLA protection patch
     */
    private generateBOLAPatch;
    /**
     * Generate BOLA middleware code
     */
    private generateBOLAMiddleware;
    private generateExpressBOLAMiddleware;
    private generateFastifyBOLAMiddleware;
    private generateNestBOLAMiddleware;
    private generateFastAPIBOLAMiddleware;
    private generateDjangoBOLAMiddleware;
    /**
     * Generate patches from PII Scanner report
     */
    generateFromPIIReport(report: PIIScannerReport): GeneratedPatch[];
    /**
     * Generate PII sanitizer middleware
     */
    private generatePIISanitizer;
    private generatePIISanitizerCode;
    /**
     * Generate PII filter for specific categories
     */
    private generatePIIFilter;
    /**
     * Generate patches from Session Orchestrator report
     */
    generateFromSessionReport(report: SessionOrchestratorReport): GeneratedPatch[];
    /**
     * Generate privilege escalation protection patch
     */
    private generatePrivEscPatch;
    private generateRBACMiddleware;
    /**
     * Generate comprehensive remediation report
     */
    generateReport(target: string): RemediationReport;
    /**
     * Estimate implementation effort
     */
    private estimateEffort;
    /**
     * Print report to console
     */
    printReport(report: RemediationReport): void;
    private generateId;
    private sanitizeFilename;
    private getFileExtension;
    private getBOLADependencies;
    private getBOLAInstallCommands;
    private getBOLAInstructions;
    /**
     * Get all generated patches
     */
    getPatches(): GeneratedPatch[];
    /**
     * Clear all patches
     */
    clearPatches(): void;
}
export default RemediationGenerator;
//# sourceMappingURL=remediation-gen.d.ts.map