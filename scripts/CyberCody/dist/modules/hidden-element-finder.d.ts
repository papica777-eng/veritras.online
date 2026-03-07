import { EventEmitter } from 'events';
import { type Page } from 'playwright';
/**
 * Types of hidden elements
 */
export type HiddenElementType = 'display-none' | 'visibility-hidden' | 'opacity-zero' | 'off-screen' | 'zero-size' | 'clip-hidden' | 'overflow-hidden' | 'z-index-buried' | 'pointer-events-none' | 'aria-hidden';
/**
 * Risk level of hidden element
 */
export type HiddenElementRisk = 'info' | 'low' | 'medium' | 'high' | 'critical';
/**
 * Hidden element finding
 */
export interface HiddenElement {
    id: string;
    type: HiddenElementType;
    tagName: string;
    selector: string;
    attributes: Record<string, string>;
    computedStyle: {
        display: string;
        visibility: string;
        opacity: string;
        position: string;
        left: string;
        top: string;
        width: string;
        height: string;
        zIndex: string;
        pointerEvents: string;
        overflow: string;
        clip: string;
    };
    boundingBox: {
        x: number;
        y: number;
        width: number;
        height: number;
    } | null;
    innerHTML: string;
    textContent: string;
    risk: HiddenElementRisk;
    riskReason: string;
    category: HiddenElementCategory;
    screenshot?: string;
}
/**
 * Categories for hidden elements
 */
export type HiddenElementCategory = 'credential_harvester' | 'clickjacking' | 'form_hijacking' | 'data_exfiltration' | 'tracking_pixel' | 'malicious_script' | 'ui_redressing' | 'hidden_link' | 'seo_spam' | 'legitimate' | 'unknown';
/**
 * Clickjacking vector
 */
export interface ClickjackingVector {
    type: 'iframe_overlay' | 'transparent_layer' | 'ui_redressing' | 'cursor_hijacking';
    element: HiddenElement;
    targetElement?: string;
    description: string;
    exploitability: 'easy' | 'medium' | 'difficult';
    recommendation: string;
}
/**
 * Hidden Element Finder configuration
 */
export interface HiddenElementConfig {
    screenshotDir?: string;
    timeout?: number;
    userAgent?: string;
    includeCategories?: HiddenElementCategory[];
    minRiskLevel?: HiddenElementRisk;
    captureScreenshots?: boolean;
    revealHiddenElements?: boolean;
}
/**
 * Full hidden element scan report
 */
export interface HiddenElementReport {
    target: string;
    startTime: Date;
    endTime: Date;
    totalElementsScanned: number;
    hiddenElementsFound: number;
    criticalFindings: number;
    highRiskFindings: number;
    clickjackingVectors: ClickjackingVector[];
    hiddenForms: HiddenElement[];
    hiddenInputs: HiddenElement[];
    hiddenIframes: HiddenElement[];
    hiddenLinks: HiddenElement[];
    allHiddenElements: HiddenElement[];
    riskScore: number;
    recommendations: string[];
    screenshotPath?: string;
}
/**
 * Hidden Element Finder
 *
 * Discovers hidden DOM elements that may be used for:
 * - Clickjacking attacks
 * - Credential harvesting
 * - UI redressing
 * - Data exfiltration
 * - Malicious script hiding
 */
export declare class HiddenElementFinder extends EventEmitter {
    private config;
    private browser;
    private findings;
    private clickjackingVectors;
    constructor(config?: HiddenElementConfig);
    /**
     * Scan a URL for hidden elements
     */
    scanUrl(url: string): Promise<HiddenElementReport>;
    /**
     * Scan page for hidden elements (from existing page object)
     */
    scanPage(page: Page, url: string): Promise<HiddenElementReport>;
    /**
     * Find all hidden elements on the page
     */
    private findHiddenElements;
    /**
     * Categorize a hidden element and assess its risk
     */
    private categorizeElement;
    /**
     * Check if element should be included based on config
     */
    private shouldInclude;
    /**
     * Analyze page for clickjacking vulnerabilities
     */
    private analyzeClickjacking;
    /**
     * Take screenshot of the page
     */
    private takeScreenshot;
    /**
     * Reveal hidden elements for screenshot
     */
    private revealHidden;
    /**
     * Generate hash for URL
     */
    private hashUrl;
    /**
     * Build the final report
     */
    private buildReport;
    /**
     * Generate recommendations based on findings
     */
    private generateRecommendations;
    /**
     * Cleanup resources
     */
    cleanup(): Promise<void>;
    /**
     * Get all findings
     */
    getFindings(): HiddenElement[];
    /**
     * Get clickjacking vectors
     */
    getClickjackingVectors(): ClickjackingVector[];
}
//# sourceMappingURL=hidden-element-finder.d.ts.map