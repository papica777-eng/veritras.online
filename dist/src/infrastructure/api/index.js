"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                               ║
 * ║   QAntum API MODULE                                                           ║
 * ║   "Rate Limiting & Versioning"                                                ║
 * ║                                                                               ║
 * ║   TODO B #44-45 - API Complete                                                ║
 * ║                                                                               ║
 * ║   © 2025-2026 QAntum | Dimitar Prodromov                                        ║
 * ║                                                                               ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.APIClient = exports.createMigrationManager = exports.createVersionManager = exports.Since = exports.Deprecated = exports.Version = exports.MigrationManager = exports.VersionParser = exports.APIVersionManager = exports.createTokenBucket = exports.createRateLimiter = exports.ThrottleMethod = exports.RateLimit = exports.RateLimitError = exports.RateLimitPresets = exports.SlidingWindowCounter = exports.TokenBucket = exports.RateLimiter = void 0;
exports.createAPIClient = createAPIClient;
// ═══════════════════════════════════════════════════════════════════════════════
// RATE LIMITING
// ═══════════════════════════════════════════════════════════════════════════════
var rate_limiter_1 = require("./rate-limiter");
Object.defineProperty(exports, "RateLimiter", { enumerable: true, get: function () { return rate_limiter_1.RateLimiter; } });
Object.defineProperty(exports, "TokenBucket", { enumerable: true, get: function () { return rate_limiter_1.TokenBucket; } });
Object.defineProperty(exports, "SlidingWindowCounter", { enumerable: true, get: function () { return rate_limiter_1.SlidingWindowCounter; } });
Object.defineProperty(exports, "RateLimitPresets", { enumerable: true, get: function () { return rate_limiter_1.RateLimitPresets; } });
Object.defineProperty(exports, "RateLimitError", { enumerable: true, get: function () { return rate_limiter_1.RateLimitError; } });
Object.defineProperty(exports, "RateLimit", { enumerable: true, get: function () { return rate_limiter_1.RateLimit; } });
Object.defineProperty(exports, "ThrottleMethod", { enumerable: true, get: function () { return rate_limiter_1.ThrottleMethod; } });
Object.defineProperty(exports, "createRateLimiter", { enumerable: true, get: function () { return rate_limiter_1.createRateLimiter; } });
Object.defineProperty(exports, "createTokenBucket", { enumerable: true, get: function () { return rate_limiter_1.createTokenBucket; } });
// ═══════════════════════════════════════════════════════════════════════════════
// VERSIONING
// ═══════════════════════════════════════════════════════════════════════════════
var versioning_1 = require("./versioning");
Object.defineProperty(exports, "APIVersionManager", { enumerable: true, get: function () { return versioning_1.APIVersionManager; } });
Object.defineProperty(exports, "VersionParser", { enumerable: true, get: function () { return versioning_1.VersionParser; } });
Object.defineProperty(exports, "MigrationManager", { enumerable: true, get: function () { return versioning_1.MigrationManager; } });
Object.defineProperty(exports, "Version", { enumerable: true, get: function () { return versioning_1.Version; } });
Object.defineProperty(exports, "Deprecated", { enumerable: true, get: function () { return versioning_1.Deprecated; } });
Object.defineProperty(exports, "Since", { enumerable: true, get: function () { return versioning_1.Since; } });
Object.defineProperty(exports, "createVersionManager", { enumerable: true, get: function () { return versioning_1.createVersionManager; } });
Object.defineProperty(exports, "createMigrationManager", { enumerable: true, get: function () { return versioning_1.createMigrationManager; } });
// ═══════════════════════════════════════════════════════════════════════════════
// UNIFIED API CLIENT
// ═══════════════════════════════════════════════════════════════════════════════
const rate_limiter_2 = require("./rate-limiter");
const versioning_2 = require("./versioning");
/**
 * Unified API Client with versioning and rate limiting
 */
class APIClient {
    config;
    rateLimiter;
    versionManager;
    constructor(config) {
        this.config = {
            version: '1.0.0',
            timeout: 30000,
            ...config,
        };
        this.rateLimiter = config.rateLimit
            ? new rate_limiter_2.RateLimiter({
                strategy: 'sliding-window',
                windowMs: config.rateLimit.windowMs,
                maxRequests: config.rateLimit.maxRequests,
            })
            : rate_limiter_2.RateLimitPresets.api();
        this.versionManager = new versioning_2.APIVersionManager({
            defaultVersion: this.config.version,
            supportedVersions: [this.config.version],
        });
    }
    /**
     * Make a request
     */
    async request(method, path, options = {}) {
        // Check rate limit
        const rateLimitResult = this.rateLimiter.check(path);
        if (!rateLimitResult.allowed) {
            throw new Error(`Rate limit exceeded. Retry after ${rateLimitResult.retryAfter}s`);
        }
        // Build URL
        const url = this.buildUrl(path, options.query);
        // Build headers
        const headers = {
            'Content-Type': 'application/json',
            'X-API-Version': this.config.version,
            ...this.config.headers,
            ...options.headers,
        };
        // Make request (placeholder - would use fetch/axios in real impl)
        // SAFETY: async operation — wrap in try-catch for production resilience
        const response = await this.makeRequest(method, url, {
            headers,
            body: options.body,
        });
        return response;
    }
    /**
     * GET request
     */
    get(path, query) {
        return this.request('GET', path, { query });
    }
    /**
     * POST request
     */
    post(path, body) {
        return this.request('POST', path, { body });
    }
    /**
     * PUT request
     */
    put(path, body) {
        return this.request('PUT', path, { body });
    }
    /**
     * DELETE request
     */
    delete(path) {
        return this.request('DELETE', path);
    }
    /**
     * Set API version
     */
    // Complexity: O(1)
    setVersion(version) {
        this.config.version = version;
        return this;
    }
    /**
     * Get current version
     */
    // Complexity: O(1)
    getVersion() {
        return this.config.version;
    }
    /**
     * Get rate limit info
     */
    // Complexity: O(1)
    getRateLimitInfo(path = 'default') {
        return this.rateLimiter.getInfo(path);
    }
    // Complexity: O(1)
    buildUrl(path, query) {
        let url = `${this.config.baseUrl}${path}`;
        if (query) {
            const params = new URLSearchParams(query);
            url += `?${params.toString()}`;
        }
        return url;
    }
    // Complexity: O(1)
    async makeRequest(method, url, options) {
        // This is a placeholder - in real implementation would use fetch
        console.log(`[APIClient] ${method} ${url}`);
        return { success: true };
    }
}
exports.APIClient = APIClient;
// ═══════════════════════════════════════════════════════════════════════════════
// FACTORY
// ═══════════════════════════════════════════════════════════════════════════════
function createAPIClient(config) {
    return new APIClient(config);
}
exports.default = {
    APIClient,
    RateLimiter: rate_limiter_2.RateLimiter,
    APIVersionManager: versioning_2.APIVersionManager,
    VersionParser: versioning_2.VersionParser,
    RateLimitPresets: rate_limiter_2.RateLimitPresets,
};
