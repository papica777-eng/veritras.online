import type { ReconResult } from '../../../qantum/SaaS-Framework/01_ECOSYSTEM_APPS/MrMindQATool/src/index';
export interface ReconConfig {
    timeout?: number;
    screenshotViewports?: Array<{
        width: number;
        height: number;
    }>;
    userAgent?: string;
    followRedirects?: boolean;
    maxRedirects?: number;
    outputDir?: string;
}
/**
 * Reconnaissance Module for CyberCody
 * Uses Playwright to analyze web applications and detect technology stacks
 */
export declare class ReconModule {
    private browser;
    private config;
    constructor(config?: ReconConfig);
    /**
     * Initialize browser instance
     */
    initialize(): Promise<void>;
    /**
     * Cleanup browser instance
     */
    cleanup(): Promise<void>;
    /**
     * Run full reconnaissance on target
     * @param targetUrl - URL to analyze
     */
    scan(targetUrl: string): Promise<ReconResult>;
    /**
     * Analyze server information from response headers
     */
    private analyzeServerInfo;
    /**
     * Extract version from server header
     */
    private extractVersion;
    /**
     * Detect OS from headers
     */
    private detectOS;
    /**
     * Analyze security headers
     */
    private analyzeSecurityHeaders;
    /**
     * Analyze SSL/TLS configuration
     */
    private analyzeSSL;
    /**
     * Fetch and parse robots.txt
     */
    private fetchRobotsTxt;
    /**
     * Fetch and parse sitemap
     */
    private fetchSitemap;
    /**
     * Capture screenshots at different viewports
     */
    private captureScreenshots;
    /**
     * Detect technologies from page content and headers
     */
    private detectTechnologies;
    /**
     * Extract API endpoints from network responses
     */
    private extractAPIEndpoint;
    /**
     * Extract endpoints from page content (links, forms, etc.)
     */
    private extractEndpointsFromPage;
    /**
     * Sanitize URL for use as filename
     */
    private sanitizeFilename;
}
export default ReconModule;
//# sourceMappingURL=recon.d.ts.map