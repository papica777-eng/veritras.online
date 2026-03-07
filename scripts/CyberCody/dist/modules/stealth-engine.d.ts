import { EventEmitter } from 'events';
/**
 * Stealth mode levels
 */
export type StealthLevel = 'aggressive' | 'normal' | 'cautious' | 'ghost';
/**
 * Request timing strategy
 */
export type TimingStrategy = 'constant' | 'random' | 'exponential' | 'jitter' | 'human' | 'adaptive';
/**
 * Rate limit detection result
 */
export interface RateLimitDetection {
    detected: boolean;
    type: 'hard' | 'soft' | 'sliding-window' | 'token-bucket' | 'unknown';
    statusCode: number;
    retryAfter?: number;
    remainingRequests?: number;
    resetTime?: Date;
    headers: Record<string, string>;
}
/**
 * Stealth request configuration
 */
export interface StealthRequestConfig {
    url: string;
    method: string;
    headers?: Record<string, string>;
    body?: string;
    timeout?: number;
    retries?: number;
}
/**
 * Stealth response
 */
export interface StealthResponse {
    statusCode: number;
    body: string;
    headers: Record<string, string>;
    responseTime: number;
    attempt: number;
    stealthMetrics: {
        originalDelay: number;
        actualDelay: number;
        headersRandomized: boolean;
        strategyUsed: TimingStrategy;
    };
}
/**
 * User-Agent rotation pool
 */
export interface UserAgentPool {
    browsers: string[];
    mobile: string[];
    bots: string[];
    custom: string[];
}
/**
 * Fingerprint configuration
 */
export interface FingerprintConfig {
    userAgent: string;
    acceptLanguage: string;
    acceptEncoding: string;
    connection: string;
    cacheControl: string;
    dnt: string;
    secFetchDest: string;
    secFetchMode: string;
    secFetchSite: string;
    secChUa?: string;
    secChUaMobile?: string;
    secChUaPlatform?: string;
}
/**
 * Stealth engine configuration
 */
export interface StealthEngineConfig {
    stealthLevel?: StealthLevel;
    baseDelay?: number;
    maxDelay?: number;
    timingStrategy?: TimingStrategy;
    rotateUserAgent?: boolean;
    rotateTLS?: boolean;
    maxRetries?: number;
    backoffMultiplier?: number;
    detectRateLimits?: boolean;
    adaptiveThreshold?: number;
}
/**
 * Stealth engine statistics
 */
export interface StealthStats {
    totalRequests: number;
    successfulRequests: number;
    rateLimitedRequests: number;
    retriedRequests: number;
    averageResponseTime: number;
    averageDelay: number;
    currentStrategy: TimingStrategy;
    currentStealthLevel: StealthLevel;
    adaptations: number;
}
declare const USER_AGENT_POOL: UserAgentPool;
/**
 * Generate random delay with jitter
 */
declare function randomDelay(min: number, max: number): number;
/**
 * Generate human-like delay (gamma distribution simulation)
 */
declare function humanDelay(baseDelay: number): number;
/**
 * Stealth Engine - The Ghost
 *
 * Adaptive rate limiting evasion and request fingerprint randomization.
 * Automatically adjusts strategy based on target behavior.
 */
export declare class StealthEngine extends EventEmitter {
    private config;
    private stats;
    private currentUserAgent;
    private rateLimitHistory;
    private requestTimestamps;
    private consecutiveRateLimits;
    constructor(config?: StealthEngineConfig);
    /**
     * Apply stealth level preset
     */
    private applyStealthLevel;
    /**
     * Set stealth level
     */
    setStealthLevel(level: StealthLevel): void;
    /**
     * Execute a stealthy request
     */
    request(config: StealthRequestConfig): Promise<StealthResponse>;
    /**
     * Execute multiple stealthy requests
     */
    batchRequest(configs: StealthRequestConfig[], concurrency?: number): Promise<StealthResponse[]>;
    /**
     * Calculate delay based on current strategy
     */
    calculateDelay(): number;
    /**
     * Calculate adaptive delay based on rate limit history
     */
    private calculateAdaptiveDelay;
    /**
     * Calculate backoff delay after error/rate limit
     */
    private calculateBackoff;
    /**
     * Convert Headers to plain object
     */
    private headersToObject;
    /**
     * Detect rate limiting from response
     */
    private detectRateLimit;
    /**
     * Determine rate limit algorithm type
     */
    private determineRateLimitType;
    /**
     * Parse Retry-After header
     */
    private parseRetryAfter;
    /**
     * Parse rate limit reset time
     */
    private parseResetTime;
    /**
     * Adapt to rate limiting
     */
    private adaptToRateLimiting;
    /**
     * Generate randomized request fingerprint
     */
    generateFingerprint(existingHeaders?: Record<string, string>): Record<string, string>;
    /**
     * Select a user agent
     */
    private selectUserAgent;
    /**
     * Rotate to new user agent
     */
    rotateUserAgent(): void;
    /**
     * Get current statistics
     */
    getStats(): StealthStats;
    /**
     * Update average response time
     */
    private updateAverageResponseTime;
    /**
     * Sleep for specified milliseconds
     */
    private sleep;
    /**
     * Reset statistics
     */
    resetStats(): void;
    /**
     * Print statistics report
     */
    printStats(): void;
}
export { USER_AGENT_POOL, randomDelay, humanDelay };
//# sourceMappingURL=stealth-engine.d.ts.map