import { EventEmitter } from 'events';
import type { HTTPMethod } from '../../../qantum/SaaS-Framework/01_ECOSYSTEM_APPS/MrMindQATool/src/index';
/**
 * Configuration for Shadow API Discovery
 */
export interface ShadowAPIConfig {
    /** Target URL */
    target: string;
    /** Browser to use */
    headless?: boolean;
    /** Request timeout */
    timeout?: number;
    /** Maximum discovery depth */
    maxDepth?: number;
    /** Request delay (ms) */
    delayMs?: number;
    /** Include common admin paths */
    includeAdmin?: boolean;
    /** Include version discovery */
    includeVersions?: boolean;
    /** Custom wordlist */
    customPaths?: string[];
    /** Authentication headers */
    authHeaders?: Record<string, string>;
}
/**
 * Discovered shadow endpoint
 */
export interface ShadowEndpoint {
    path: string;
    method: HTTPMethod;
    statusCode: number;
    responseSize: number;
    discoveryMethod: DiscoveryMethod;
    risk: ShadowRisk;
    category: EndpointCategory;
    evidence: string[];
    details?: Record<string, unknown>;
}
export type DiscoveryMethod = 'version_enum' | 'path_bruteforce' | 'js_extraction' | 'response_leak' | 'sitemap' | 'api_docs' | 'common_pattern';
export type ShadowRisk = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type EndpointCategory = 'deprecated' | 'debug' | 'admin' | 'internal' | 'undocumented' | 'backup' | 'test' | 'legacy';
/**
 * Shadow API Discovery Report
 */
export interface ShadowAPIReport {
    target: string;
    startTime: Date;
    endTime: Date;
    totalEndpointsFound: number;
    endpoints: ShadowEndpoint[];
    summary: {
        criticalFindings: ShadowEndpoint[];
        deprecatedAPIs: ShadowEndpoint[];
        debugEndpoints: ShadowEndpoint[];
        adminEndpoints: ShadowEndpoint[];
        versionMatrix: Map<string, string[]>;
    };
    recommendations: string[];
}
/**
 * Shadow API Discovery - The Ghost Hunter
 *
 * Discovers hidden, forgotten, and undocumented API endpoints
 * through version enumeration, path fuzzing, and JS analysis.
 */
export declare class ShadowAPIDiscovery extends EventEmitter {
    private config;
    private discoveries;
    private browser?;
    private context?;
    constructor(config: ShadowAPIConfig);
    /**
     * Run full discovery scan
     */
    discover(): Promise<ShadowAPIReport>;
    /**
     * Phase 1: Check common files
     */
    private checkCommonFiles;
    /**
     * Phase 2: Extract paths from JavaScript
     */
    private extractFromJavaScript;
    /**
     * Phase 3: Version enumeration
     */
    private enumerateVersions;
    /**
     * Phase 4: Path bruteforce
     */
    private bruteforcePaths;
    /**
     * Phase 5: Admin paths
     */
    private checkAdminPaths;
    /**
     * Phase 6: Debug paths
     */
    private checkDebugPaths;
    /**
     * Rate limiting delay
     */
    private delay;
    /**
     * Generate report
     */
    private generateReport;
    /**
     * Print report
     */
    private printReport;
    /**
     * Get discoveries
     */
    getDiscoveries(): ShadowEndpoint[];
    /**
     * Export to JSON
     */
    exportToJSON(): string;
}
export default ShadowAPIDiscovery;
//# sourceMappingURL=shadow-api-discovery.d.ts.map