import { EventEmitter } from 'events';
import type { BOLATestResult } from '../../../qantum/SaaS-Framework/01_ECOSYSTEM_APPS/MisterMind-Site/dpengeneering/cybercody/src/modules/bola-tester';
import type { LogicAnalysisResult } from '../../src/modules/logic-analyzer.js';
/**
 * Supported frameworks for patch generation
 */
export type Framework = 'express' | 'fastify' | 'koa' | 'nest' | 'nextjs' | 'django' | 'flask' | 'fastapi' | 'spring' | 'aspnet';
/**
 * Language for code generation
 */
export type Language = 'typescript' | 'javascript' | 'python' | 'java' | 'csharp';
/**
 * Configuration for Surgeon
 */
export interface SurgeonConfig {
    /** Target framework */
    framework: Framework;
    /** Target language */
    language?: Language;
    /** Generate inline fixes or separate middleware */
    patchStyle?: 'middleware' | 'inline' | 'decorator';
    /** Include comments explaining the fix */
    includeComments?: boolean;
    /** Output directory for generated patches */
    outputDir?: string;
}
/**
 * Generated patch/fix
 */
export interface GeneratedPatch {
    /** Unique ID */
    id: string;
    /** Vulnerability type this fixes */
    vulnerabilityType: string;
    /** Affected endpoint */
    endpoint: string;
    /** Framework */
    framework: Framework;
    /** Language */
    language: Language;
    /** Patch style */
    style: 'middleware' | 'inline' | 'decorator';
    /** Generated code */
    code: string;
    /** Filename suggestion */
    suggestedFilename: string;
    /** Dependencies required */
    dependencies: string[];
    /** Installation instructions */
    installInstructions: string;
    /** Integration instructions */
    integrationSteps: string[];
    /** Test code */
    testCode?: string;
}
/**
 * Patch generation report
 */
export interface SurgeonReport {
    generatedAt: Date;
    framework: Framework;
    totalPatches: number;
    patches: GeneratedPatch[];
    summary: {
        bolaFixes: number;
        dataExposureFixes: number;
        logicFlawFixes: number;
        middlewareCount: number;
        decoratorCount: number;
    };
}
/**
 * Surgeon Integration - The Healer
 *
 * Auto-generates middleware patches and code fixes for
 * discovered vulnerabilities.
 */
export declare class SurgeonIntegration extends EventEmitter {
    private config;
    private patches;
    constructor(config: SurgeonConfig);
    /**
     * Infer language from framework
     */
    private inferLanguage;
    /**
     * Generate patches for BOLA vulnerabilities
     */
    generateBOLAPatches(results: BOLATestResult[]): GeneratedPatch[];
    /**
     * Generate patches for data exposure
     */
    generateDataExposurePatches(results: LogicAnalysisResult[]): GeneratedPatch[];
    /**
     * Generate rate limiter patch
     */
    generateRateLimiterPatch(): GeneratedPatch;
    /**
     * Get file extension for language
     */
    private getExtension;
    /**
     * Get dependencies for patch type
     */
    private getDependencies;
    /**
     * Get install instructions
     */
    private getInstallInstructions;
    /**
     * Get integration steps
     */
    private getIntegrationSteps;
    /**
     * Generate report
     */
    generateReport(): SurgeonReport;
    /**
     * Export all patches
     */
    exportPatches(): Map<string, string>;
    /**
     * Get all patches
     */
    getPatches(): GeneratedPatch[];
}
export default SurgeonIntegration;
//# sourceMappingURL=surgeon-integration.d.ts.map