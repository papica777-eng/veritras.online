// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║  CYBERCODY v1.2.0 - STEALTH ENGINE                                           ║
// ║  "The Ghost" - Adaptive Rate Limiting & Evasion System                       ║
// ║  Specialization: WAF Bypass, Rate Limit Evasion, Fingerprint Randomization   ║
// ╚══════════════════════════════════════════════════════════════════════════════╝
import { EventEmitter } from 'events';
// ═══════════════════════════════════════════════════════════════════════════════
// 🎭 USER AGENT POOLS
// ═══════════════════════════════════════════════════════════════════════════════
const USER_AGENT_POOL = {
    browsers: [
        // Chrome Windows
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
        // Chrome Mac
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
        // Firefox Windows
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
        // Firefox Mac
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0',
        // Safari
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
        // Edge
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
        // Linux Chrome
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        // Linux Firefox
        'Mozilla/5.0 (X11; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0',
    ],
    mobile: [
        // iOS Safari
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1',
        'Mozilla/5.0 (iPad; CPU OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1',
        // Android Chrome
        'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
        // Android Firefox
        'Mozilla/5.0 (Android 14; Mobile; rv:121.0) Gecko/121.0 Firefox/121.0',
    ],
    bots: [
        'Googlebot/2.1 (+http://www.google.com/bot.html)',
        'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)',
        'Mozilla/5.0 (compatible; YandexBot/3.0; +http://yandex.com/bots)',
    ],
    custom: [
        'CyberCody/1.2.0 SecurityScanner',
    ],
};
// ═══════════════════════════════════════════════════════════════════════════════
// 🎲 RANDOMIZATION UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * Generate random delay with jitter
 */
function randomDelay(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
/**
 * Generate human-like delay (gamma distribution simulation)
 */
function humanDelay(baseDelay) {
    // Box-Muller transform for normal distribution
    const u1 = Math.random();
    const u2 = Math.random();
    const normal = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    // Scale to desired range with some randomness
    const delay = baseDelay + (normal * baseDelay * 0.3);
    // Add occasional "thinking" pauses (5% chance of longer delay)
    if (Math.random() < 0.05) {
        return delay * randomDelay(2, 5);
    }
    return Math.max(100, delay);
}
/**
 * Generate random Accept-Language header
 */
function randomAcceptLanguage() {
    const languages = [
        'en-US,en;q=0.9',
        'en-GB,en;q=0.9,en-US;q=0.8',
        'en-US,en;q=0.9,es;q=0.8',
        'en-US,en;q=0.9,de;q=0.8',
        'en-US,en;q=0.9,fr;q=0.8',
        'en-US,en;q=0.9,ja;q=0.8',
        'en-US,en;q=0.9,zh-CN;q=0.8',
        'bg-BG,bg;q=0.9,en-US;q=0.8,en;q=0.7',
    ];
    return languages[Math.floor(Math.random() * languages.length)];
}
/**
 * Generate random cache control
 */
function randomCacheControl() {
    const options = [
        'no-cache',
        'max-age=0',
        'no-store',
        'no-cache, no-store, must-revalidate',
    ];
    return options[Math.floor(Math.random() * options.length)];
}
// ═══════════════════════════════════════════════════════════════════════════════
// 👻 STEALTH ENGINE CLASS
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * Stealth Engine - The Ghost
 *
 * Adaptive rate limiting evasion and request fingerprint randomization.
 * Automatically adjusts strategy based on target behavior.
 */
export class StealthEngine extends EventEmitter {
    config;
    stats;
    currentUserAgent;
    rateLimitHistory = [];
    requestTimestamps = [];
    consecutiveRateLimits = 0;
    constructor(config = {}) {
        super();
        this.config = {
            stealthLevel: config.stealthLevel ?? 'normal',
            baseDelay: config.baseDelay ?? 1000,
            maxDelay: config.maxDelay ?? 30000,
            timingStrategy: config.timingStrategy ?? 'adaptive',
            rotateUserAgent: config.rotateUserAgent ?? true,
            rotateTLS: config.rotateTLS ?? false,
            maxRetries: config.maxRetries ?? 3,
            backoffMultiplier: config.backoffMultiplier ?? 2,
            detectRateLimits: config.detectRateLimits ?? true,
            adaptiveThreshold: config.adaptiveThreshold ?? 3,
        };
        this.stats = {
            totalRequests: 0,
            successfulRequests: 0,
            rateLimitedRequests: 0,
            retriedRequests: 0,
            averageResponseTime: 0,
            averageDelay: 0,
            currentStrategy: this.config.timingStrategy,
            currentStealthLevel: this.config.stealthLevel,
            adaptations: 0,
        };
        this.currentUserAgent = this.selectUserAgent();
        // Apply stealth level presets
        this.applyStealthLevel(this.config.stealthLevel);
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // ⚙️ CONFIGURATION
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Apply stealth level preset
     */
    applyStealthLevel(level) {
        switch (level) {
            case 'aggressive':
                this.config.baseDelay = 100;
                this.config.maxDelay = 5000;
                this.config.timingStrategy = 'constant';
                break;
            case 'normal':
                this.config.baseDelay = 1000;
                this.config.maxDelay = 15000;
                this.config.timingStrategy = 'random';
                break;
            case 'cautious':
                this.config.baseDelay = 3000;
                this.config.maxDelay = 30000;
                this.config.timingStrategy = 'jitter';
                break;
            case 'ghost':
                this.config.baseDelay = 5000;
                this.config.maxDelay = 60000;
                this.config.timingStrategy = 'human';
                this.config.rotateUserAgent = true;
                break;
        }
        this.stats.currentStealthLevel = level;
        this.stats.currentStrategy = this.config.timingStrategy;
        this.emit('stealthLevelChanged', level);
    }
    /**
     * Set stealth level
     */
    setStealthLevel(level) {
        this.applyStealthLevel(level);
        console.log(`   👻 [STEALTH] Switched to ${level} mode`);
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // 🚀 REQUEST EXECUTION
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Execute a stealthy request
     */
    async request(config) {
        let attempt = 0;
        let lastError = null;
        // Calculate initial delay
        const delay = this.calculateDelay();
        await this.sleep(delay);
        while (attempt < this.config.maxRetries) {
            attempt++;
            try {
                // Prepare headers with fingerprint
                const headers = this.generateFingerprint(config.headers);
                // Make request
                const requestStart = Date.now();
                const response = await fetch(config.url, {
                    method: config.method,
                    headers,
                    body: config.body,
                    signal: AbortSignal.timeout(config.timeout ?? 30000),
                });
                const responseTime = Date.now() - requestStart;
                const body = await response.text();
                // Update stats
                this.stats.totalRequests++;
                this.updateAverageResponseTime(responseTime);
                this.requestTimestamps.push(Date.now());
                // Check for rate limiting
                const rateLimitInfo = this.detectRateLimit(response, body);
                if (rateLimitInfo.detected) {
                    this.stats.rateLimitedRequests++;
                    this.consecutiveRateLimits++;
                    this.rateLimitHistory.push(rateLimitInfo);
                    this.emit('rateLimitDetected', rateLimitInfo);
                    console.log(`   ⚠️  [STEALTH] Rate limit detected (${response.status})`);
                    // Adaptive response to rate limiting
                    if (this.consecutiveRateLimits >= this.config.adaptiveThreshold) {
                        this.adaptToRateLimiting(rateLimitInfo);
                    }
                    // Calculate backoff delay
                    const backoffDelay = this.calculateBackoff(attempt, rateLimitInfo);
                    console.log(`   ⏳ [STEALTH] Backing off for ${backoffDelay}ms`);
                    await this.sleep(backoffDelay);
                    this.stats.retriedRequests++;
                    continue;
                }
                // Success!
                this.stats.successfulRequests++;
                this.consecutiveRateLimits = 0;
                // Rotate user agent periodically
                if (this.config.rotateUserAgent && this.stats.totalRequests % 10 === 0) {
                    this.rotateUserAgent();
                }
                return {
                    statusCode: response.status,
                    body,
                    headers: this.headersToObject(response.headers),
                    responseTime,
                    attempt,
                    stealthMetrics: {
                        originalDelay: this.config.baseDelay,
                        actualDelay: delay,
                        headersRandomized: this.config.rotateUserAgent,
                        strategyUsed: this.stats.currentStrategy,
                    },
                };
            }
            catch (error) {
                lastError = error instanceof Error ? error : new Error(String(error));
                if (error instanceof Error && error.name === 'TimeoutError') {
                    console.log(`   ⏱️  [STEALTH] Request timeout, retrying...`);
                }
                else {
                    console.log(`   ❌ [STEALTH] Request failed: ${lastError.message}`);
                }
                // Backoff before retry
                const backoffDelay = this.calculateBackoff(attempt);
                await this.sleep(backoffDelay);
                this.stats.retriedRequests++;
            }
        }
        // All retries exhausted
        throw lastError ?? new Error('Max retries exceeded');
    }
    /**
     * Execute multiple stealthy requests
     */
    async batchRequest(configs, concurrency = 1) {
        const results = [];
        for (let i = 0; i < configs.length; i += concurrency) {
            const batch = configs.slice(i, i + concurrency);
            // Execute batch with staggered delays
            const batchResults = await Promise.all(batch.map(async (config, index) => {
                // Stagger requests within batch
                await this.sleep(index * randomDelay(100, 500));
                return this.request(config);
            }));
            results.push(...batchResults);
            // Inter-batch delay
            if (i + concurrency < configs.length) {
                const interBatchDelay = this.calculateDelay() * 1.5;
                await this.sleep(interBatchDelay);
            }
        }
        return results;
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // ⏱️ TIMING STRATEGIES
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Calculate delay based on current strategy
     */
    calculateDelay() {
        const { baseDelay, maxDelay, timingStrategy } = this.config;
        switch (timingStrategy) {
            case 'constant':
                return baseDelay;
            case 'random':
                return randomDelay(baseDelay, maxDelay);
            case 'exponential':
                // Exponential based on recent requests
                const recentRequests = this.requestTimestamps.filter(t => Date.now() - t < 60000).length;
                return Math.min(baseDelay * Math.pow(1.5, recentRequests / 10), maxDelay);
            case 'jitter':
                // Base delay with random jitter (+/- 30%)
                const jitter = baseDelay * 0.3;
                return baseDelay + randomDelay(-jitter, jitter);
            case 'human':
                return humanDelay(baseDelay);
            case 'adaptive':
                return this.calculateAdaptiveDelay();
            default:
                return baseDelay;
        }
    }
    /**
     * Calculate adaptive delay based on rate limit history
     */
    calculateAdaptiveDelay() {
        const { baseDelay, maxDelay } = this.config;
        // No rate limits - use base delay
        if (this.rateLimitHistory.length === 0) {
            return baseDelay;
        }
        // Recent rate limits - increase delay
        const recentRateLimits = this.rateLimitHistory.filter(rl => Date.now() - (rl.resetTime?.getTime() ?? 0) < 300000).length;
        if (recentRateLimits > 0) {
            const multiplier = Math.min(recentRateLimits * this.config.backoffMultiplier, 10);
            return Math.min(baseDelay * multiplier, maxDelay);
        }
        return baseDelay;
    }
    /**
     * Calculate backoff delay after error/rate limit
     */
    calculateBackoff(attempt, rateLimitInfo) {
        const { baseDelay, maxDelay, backoffMultiplier } = this.config;
        // If we have retry-after header, use it
        if (rateLimitInfo?.retryAfter) {
            return rateLimitInfo.retryAfter * 1000 + randomDelay(500, 2000);
        }
        // Exponential backoff with jitter
        const exponentialDelay = baseDelay * Math.pow(backoffMultiplier, attempt);
        const jitter = randomDelay(0, exponentialDelay * 0.3);
        return Math.min(exponentialDelay + jitter, maxDelay);
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // 🛡️ RATE LIMIT DETECTION
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Convert Headers to plain object
     */
    headersToObject(headers) {
        const obj = {};
        headers.forEach((value, key) => {
            obj[key] = value;
        });
        return obj;
    }
    /**
     * Detect rate limiting from response
     */
    detectRateLimit(response, body) {
        const headers = this.headersToObject(response.headers);
        // Check status code
        if (response.status === 429) {
            return {
                detected: true,
                type: this.determineRateLimitType(headers),
                statusCode: response.status,
                retryAfter: this.parseRetryAfter(headers['retry-after']),
                remainingRequests: parseInt(headers['x-ratelimit-remaining'] ?? '0'),
                resetTime: this.parseResetTime(headers['x-ratelimit-reset']),
                headers,
            };
        }
        // Check for soft rate limiting (200 but with warning headers)
        if (headers['x-ratelimit-remaining'] === '0') {
            return {
                detected: true,
                type: 'soft',
                statusCode: response.status,
                remainingRequests: 0,
                resetTime: this.parseResetTime(headers['x-ratelimit-reset']),
                headers,
            };
        }
        // Check for rate limit in body
        if (body.toLowerCase().includes('rate limit') ||
            body.toLowerCase().includes('too many requests') ||
            body.toLowerCase().includes('throttl')) {
            return {
                detected: true,
                type: 'unknown',
                statusCode: response.status,
                headers,
            };
        }
        return {
            detected: false,
            type: 'unknown',
            statusCode: response.status,
            headers,
        };
    }
    /**
     * Determine rate limit algorithm type
     */
    determineRateLimitType(headers) {
        // Token bucket usually has X-RateLimit-Limit and X-RateLimit-Remaining
        if (headers['x-ratelimit-limit'] && headers['x-ratelimit-remaining']) {
            return 'token-bucket';
        }
        // Sliding window often has X-RateLimit-Reset
        if (headers['x-ratelimit-reset']) {
            return 'sliding-window';
        }
        return 'unknown';
    }
    /**
     * Parse Retry-After header
     */
    parseRetryAfter(value) {
        if (!value)
            return undefined;
        // Try as seconds
        const seconds = parseInt(value);
        if (!isNaN(seconds))
            return seconds;
        // Try as HTTP date
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
            return Math.ceil((date.getTime() - Date.now()) / 1000);
        }
        return undefined;
    }
    /**
     * Parse rate limit reset time
     */
    parseResetTime(value) {
        if (!value)
            return undefined;
        // Try as Unix timestamp
        const timestamp = parseInt(value);
        if (!isNaN(timestamp)) {
            return new Date(timestamp * 1000);
        }
        // Try as ISO date
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
            return date;
        }
        return undefined;
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // 🔄 ADAPTIVE BEHAVIOR
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Adapt to rate limiting
     */
    adaptToRateLimiting(_rateLimitInfo) {
        this.stats.adaptations++;
        console.log(`   🔄 [STEALTH] Adapting to rate limiting (adaptation #${this.stats.adaptations})`);
        // Increase base delay
        this.config.baseDelay = Math.min(this.config.baseDelay * 2, this.config.maxDelay / 2);
        // Switch to more cautious strategy
        if (this.stats.currentStrategy !== 'human') {
            this.config.timingStrategy = 'human';
            this.stats.currentStrategy = 'human';
            console.log(`   👻 [STEALTH] Switched to human-like timing`);
        }
        // Rotate user agent
        this.rotateUserAgent();
        // If we've adapted multiple times, go full ghost mode
        if (this.stats.adaptations >= 3 && this.stats.currentStealthLevel !== 'ghost') {
            this.setStealthLevel('ghost');
        }
        // Reset consecutive counter
        this.consecutiveRateLimits = 0;
        this.emit('adapted', {
            newDelay: this.config.baseDelay,
            newStrategy: this.config.timingStrategy,
            newLevel: this.stats.currentStealthLevel,
        });
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // 🎭 FINGERPRINT GENERATION
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Generate randomized request fingerprint
     */
    generateFingerprint(existingHeaders) {
        const fingerprint = {
            userAgent: this.currentUserAgent,
            acceptLanguage: randomAcceptLanguage(),
            acceptEncoding: 'gzip, deflate, br',
            connection: 'keep-alive',
            cacheControl: randomCacheControl(),
            dnt: Math.random() > 0.5 ? '1' : '0',
            secFetchDest: 'document',
            secFetchMode: 'navigate',
            secFetchSite: 'none',
        };
        // Add Chrome-specific headers if using Chrome UA
        if (this.currentUserAgent.includes('Chrome')) {
            fingerprint.secChUa = '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"';
            fingerprint.secChUaMobile = '?0';
            fingerprint.secChUaPlatform = this.currentUserAgent.includes('Windows') ? '"Windows"' : '"macOS"';
        }
        const headers = {
            'User-Agent': fingerprint.userAgent,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': fingerprint.acceptLanguage,
            'Accept-Encoding': fingerprint.acceptEncoding,
            'Connection': fingerprint.connection,
            'Cache-Control': fingerprint.cacheControl,
            'DNT': fingerprint.dnt,
            'Sec-Fetch-Dest': fingerprint.secFetchDest,
            'Sec-Fetch-Mode': fingerprint.secFetchMode,
            'Sec-Fetch-Site': fingerprint.secFetchSite,
            'Sec-Fetch-User': '?1',
            'Upgrade-Insecure-Requests': '1',
        };
        if (fingerprint.secChUa) {
            headers['Sec-CH-UA'] = fingerprint.secChUa;
            headers['Sec-CH-UA-Mobile'] = fingerprint.secChUaMobile;
            headers['Sec-CH-UA-Platform'] = fingerprint.secChUaPlatform;
        }
        // Merge with existing headers (existing take priority)
        return { ...headers, ...existingHeaders };
    }
    /**
     * Select a user agent
     */
    selectUserAgent() {
        const { browsers } = USER_AGENT_POOL;
        return browsers[Math.floor(Math.random() * browsers.length)];
    }
    /**
     * Rotate to new user agent
     */
    rotateUserAgent() {
        const oldUA = this.currentUserAgent;
        let newUA = this.selectUserAgent();
        // Ensure we get a different one
        while (newUA === oldUA && USER_AGENT_POOL.browsers.length > 1) {
            newUA = this.selectUserAgent();
        }
        this.currentUserAgent = newUA;
        this.emit('userAgentRotated', { old: oldUA, new: newUA });
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // 📊 STATISTICS & UTILITIES
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Get current statistics
     */
    getStats() {
        return { ...this.stats };
    }
    /**
     * Update average response time
     */
    updateAverageResponseTime(newTime) {
        const total = this.stats.totalRequests;
        this.stats.averageResponseTime =
            (this.stats.averageResponseTime * (total - 1) + newTime) / total;
    }
    /**
     * Sleep for specified milliseconds
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    /**
     * Reset statistics
     */
    resetStats() {
        this.stats = {
            totalRequests: 0,
            successfulRequests: 0,
            rateLimitedRequests: 0,
            retriedRequests: 0,
            averageResponseTime: 0,
            averageDelay: 0,
            currentStrategy: this.config.timingStrategy,
            currentStealthLevel: this.config.stealthLevel,
            adaptations: 0,
        };
        this.rateLimitHistory = [];
        this.requestTimestamps = [];
        this.consecutiveRateLimits = 0;
    }
    /**
     * Print statistics report
     */
    printStats() {
        console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║                    👻 STEALTH ENGINE STATISTICS                              ║
╠══════════════════════════════════════════════════════════════════════════════╣
║ Total Requests:      ${this.stats.totalRequests.toString().padEnd(46)}║
║ Successful:          ${this.stats.successfulRequests.toString().padEnd(46)}║
║ Rate Limited:        ${this.stats.rateLimitedRequests.toString().padEnd(46)}║
║ Retried:             ${this.stats.retriedRequests.toString().padEnd(46)}║
║ Avg Response Time:   ${this.stats.averageResponseTime.toFixed(0).padEnd(44)}ms║
║ Current Strategy:    ${this.stats.currentStrategy.padEnd(46)}║
║ Stealth Level:       ${this.stats.currentStealthLevel.padEnd(46)}║
║ Adaptations:         ${this.stats.adaptations.toString().padEnd(46)}║
╚══════════════════════════════════════════════════════════════════════════════╝`);
    }
}
// ═══════════════════════════════════════════════════════════════════════════════
// 📤 EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════
export { USER_AGENT_POOL, randomDelay, humanDelay };
//# sourceMappingURL=stealth-engine.js.map