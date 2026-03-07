import { EventEmitter } from 'events';
import { type Browser, type Page } from 'playwright';
/**
 * Selector fingerprint for visual matching
 */
export interface SelectorFingerprint {
    /** Original selector */
    originalSelector: string;
    /** Computed CSS path */
    cssPath: string;
    /** XPath */
    xpath: string;
    /** Visual fingerprint hash */
    visualHash: string;
    /** Element bounding box */
    boundingBox: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    /** Text content */
    textContent: string;
    /** Tag name */
    tagName: string;
    /** Attributes */
    attributes: Record<string, string>;
    /** Parent chain fingerprints */
    parentChain: string[];
    /** Sibling context */
    siblingContext: {
        previousSibling?: string;
        nextSibling?: string;
        index: number;
        totalSiblings: number;
    };
    /** Computed styles (key visual properties) */
    visualStyles: {
        backgroundColor: string;
        color: string;
        fontSize: string;
        fontFamily: string;
        position: string;
        display: string;
    };
    /** ARIA attributes */
    ariaAttributes: Record<string, string>;
    /** Data attributes */
    dataAttributes: Record<string, string>;
    /** Timestamp */
    capturedAt: Date;
}
/**
 * Selector mutation event
 */
export interface SelectorMutation {
    /** Original fingerprint */
    original: SelectorFingerprint;
    /** New fingerprint after mutation */
    mutated: SelectorFingerprint;
    /** Type of mutation */
    mutationType: 'attribute_change' | 'position_change' | 'style_change' | 'parent_change' | 'text_change' | 'removed' | 'replaced';
    /** Confidence score (0-100) */
    confidence: number;
    /** Recommended new selector */
    recommendedSelector: string;
    /** Mutation timestamp */
    detectedAt: Date;
}
/**
 * Hot-swap result
 */
export interface HotSwapResult {
    /** Was swap successful */
    success: boolean;
    /** Original selector */
    originalSelector: string;
    /** New selector (if swapped) */
    newSelector?: string;
    /** Confidence in the swap */
    confidence: number;
    /** Mutation that triggered swap */
    mutation?: SelectorMutation;
    /** Time taken to recalculate */
    recalculationTimeMs: number;
    /** Strategy used */
    strategyUsed: string;
}
/**
 * Selector memory cache
 */
export interface SelectorMemory {
    /** Selector to fingerprint mapping */
    fingerprints: Map<string, SelectorFingerprint>;
    /** Historical mutations */
    mutations: SelectorMutation[];
    /** Success rate per selector */
    successRates: Map<string, number>;
    /** Last verified timestamps */
    lastVerified: Map<string, Date>;
}
/**
 * Hot-swap configuration
 */
export interface HotSwapConfig {
    /** Enable visual matching via Gemini Vision */
    enableVisualMatching?: boolean;
    /** Gemini API key */
    geminiApiKey?: string;
    /** Minimum confidence for auto-swap (0-100) */
    minSwapConfidence?: number;
    /** Enable mutation observer */
    enableMutationObserver?: boolean;
    /** Polling interval for element verification (ms) */
    verificationIntervalMs?: number;
    /** Max recalculation attempts */
    maxRecalculationAttempts?: number;
    /** Screenshot directory */
    screenshotDir?: string;
    /** Enable learning from swaps */
    enableLearning?: boolean;
    /** Persist memory to disk */
    persistMemory?: boolean;
    /** Memory file path */
    memoryFilePath?: string;
}
/**
 * Hot-swap report
 */
export interface HotSwapReport {
    /** Total selectors monitored */
    totalMonitored: number;
    /** Total mutations detected */
    totalMutations: number;
    /** Successful swaps */
    successfulSwaps: number;
    /** Failed swaps */
    failedSwaps: number;
    /** Average confidence */
    averageConfidence: number;
    /** Most problematic selectors */
    problematicSelectors: Array<{
        selector: string;
        mutationCount: number;
        successRate: number;
    }>;
    /** Mutation timeline */
    timeline: Array<{
        timestamp: Date;
        selector: string;
        mutationType: string;
        success: boolean;
    }>;
    /** Recommendations */
    recommendations: string[];
}
export declare class HotSwapSelectorEngine extends EventEmitter {
    private config;
    private browser;
    private memory;
    private activeObservers;
    private swapHistory;
    private geminiModel;
    constructor(config?: HotSwapConfig);
    /**
     * Initialize the engine
     */
    initialize(): Promise<void>;
    /**
     * Set browser instance
     */
    setBrowser(browser: Browser): void;
    /**
     * Capture fingerprint of an element
     */
    captureFingerprint(page: Page, selector: string): Promise<SelectorFingerprint | null>;
    /**
     * Generate visual hash from fingerprint
     */
    private generateVisualHash;
    /**
     * Verify element exists and hasn't mutated
     */
    verifySelector(page: Page, selector: string): Promise<{
        valid: boolean;
        mutation?: SelectorMutation;
    }>;
    /**
     * Detect mutation between fingerprints
     */
    private detectMutation;
    /**
     * Hot-swap selector if element changed
     */
    hotSwap(page: Page, selector: string): Promise<HotSwapResult>;
    /**
     * Find element by CSS path
     */
    private findByCssPath;
    /**
     * Find element by XPath
     */
    private findByXpath;
    /**
     * Find element by text content
     */
    private findByTextContent;
    /**
     * Find element by visual similarity (position/size)
     */
    private findByVisualSimilarity;
    /**
     * Find element by ARIA attributes
     */
    private findByAriaAttributes;
    /**
     * Find element by data attributes
     */
    private findByDataAttributes;
    /**
     * Find element by parent context
     */
    private findByParentContext;
    /**
     * Find element by Gemini Vision AI
     */
    private findByGeminiVision;
    /**
     * Start observing mutations on a page
     */
    startMutationObserver(page: Page, selectors: string[]): Promise<void>;
    /**
     * Stop observing a selector
     */
    stopObserving(selector: string): void;
    /**
     * Save memory to disk
     */
    private saveMemory;
    /**
     * Load memory from disk
     */
    private loadMemory;
    /**
     * Generate hot-swap report
     */
    generateReport(): HotSwapReport;
    /**
     * Cleanup
     */
    cleanup(): Promise<void>;
}
//# sourceMappingURL=hot-swap-selector.d.ts.map