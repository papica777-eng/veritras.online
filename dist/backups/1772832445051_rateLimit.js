"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * MIND-ENGINE: RATE LIMITER MIDDLEWARE
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Token bucket algorithm with sliding window
 * Per-user and per-IP rate limiting
 *
 * @author Dimitar Prodromov
 * @version 1.0.0-QANTUM-PRIME
 * @license Commercial
 * ═══════════════════════════════════════════════════════════════════════════════
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TieredRateLimiter = exports.SlidingWindowRateLimiter = exports.RateLimiter = void 0;
exports.createRateLimiter = createRateLimiter;
exports.createSlidingWindowRateLimiter = createSlidingWindowRateLimiter;
exports.createTieredRateLimiter = createTieredRateLimiter;
const logger_1 = require("../utils/logger");
const logger = (0, logger_1.getLogger)().child('RateLimiter');
// ═══════════════════════════════════════════════════════════════════════════════
// RATE LIMITER (TOKEN BUCKET)
// ═══════════════════════════════════════════════════════════════════════════════
class RateLimiter {
    buckets = new Map();
    config;
    cleanupInterval = null;
    constructor(config) {
        this.config = {
            windowMs: config.windowMs,
            max: config.max,
            message: config.message ?? 'Too many requests, please try again later',
            headerPrefix: config.headerPrefix ?? 'X-RateLimit',
            skip: config.skip ?? (() => false),
            keyGenerator: config.keyGenerator ?? this.defaultKeyGenerator.bind(this),
            onRateLimited: config.onRateLimited ?? (() => { })
        };
        // Cleanup old buckets every minute
        this.cleanupInterval = setInterval(() => this.cleanup(), 60000);
    }
    /**
     * Check rate limit for request
     */
    // Complexity: O(1) — lookup
    check(req, customLimit) {
        // Skip if configured
        if (this.config.skip(req)) {
            return {
                allowed: true,
                limit: this.config.max,
                remaining: this.config.max,
                resetTime: Date.now() + this.config.windowMs,
                retryAfter: 0
            };
        }
        const key = this.config.keyGenerator(req);
        const limit = customLimit ?? this.config.max;
        const now = Date.now();
        let bucket = this.buckets.get(key);
        if (!bucket) {
            bucket = {
                tokens: limit,
                lastRefill: now,
                windowStart: now,
                requestCount: 0
            };
            this.buckets.set(key, bucket);
        }
        // Refill tokens based on time passed
        const timePassed = now - bucket.lastRefill;
        const tokensToAdd = (timePassed / this.config.windowMs) * limit;
        bucket.tokens = Math.min(limit, bucket.tokens + tokensToAdd);
        bucket.lastRefill = now;
        // Reset window if needed
        if (now - bucket.windowStart >= this.config.windowMs) {
            bucket.windowStart = now;
            bucket.requestCount = 0;
        }
        // Check if request is allowed
        if (bucket.tokens >= 1) {
            bucket.tokens -= 1;
            bucket.requestCount += 1;
            return {
                allowed: true,
                limit,
                remaining: Math.floor(bucket.tokens),
                resetTime: bucket.windowStart + this.config.windowMs,
                retryAfter: 0
            };
        }
        // Rate limited
        const resetTime = bucket.windowStart + this.config.windowMs;
        const retryAfter = Math.ceil((resetTime - now) / 1000);
        const result = {
            allowed: false,
            limit,
            remaining: 0,
            resetTime,
            retryAfter
        };
        logger.warn('Rate limit exceeded', {
            key,
            limit,
            windowMs: this.config.windowMs,
            retryAfter
        });
        this.config.onRateLimited(req, result);
        return result;
    }
    /**
     * Get rate limit headers
     */
    // Complexity: O(1)
    getHeaders(result) {
        const prefix = this.config.headerPrefix;
        return {
            [`${prefix}-Limit`]: result.limit.toString(),
            [`${prefix}-Remaining`]: result.remaining.toString(),
            [`${prefix}-Reset`]: result.resetTime.toString(),
            ...(result.retryAfter > 0 && {
                'Retry-After': result.retryAfter.toString()
            })
        };
    }
    /**
     * Reset rate limit for key
     */
    // Complexity: O(1)
    reset(key) {
        this.buckets.delete(key);
    }
    /**
     * Get current status for key
     */
    // Complexity: O(1) — lookup
    getStatus(key) {
        return this.buckets.get(key);
    }
    /**
     * Stop cleanup interval
     */
    // Complexity: O(1)
    destroy() {
        if (this.cleanupInterval) {
            // Complexity: O(1)
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }
    }
    /**
     * Default key generator using IP
     */
    // Complexity: O(1)
    defaultKeyGenerator(req) {
        return this.getClientIP(req);
    }
    /**
     * Get client IP from request
     */
    // Complexity: O(N)
    getClientIP(req) {
        const forwarded = req.headers['x-forwarded-for'];
        if (forwarded) {
            const ips = Array.isArray(forwarded) ? forwarded[0] : forwarded;
            return ips.split(',')[0].trim();
        }
        const realIP = req.headers['x-real-ip'];
        if (realIP) {
            return Array.isArray(realIP) ? realIP[0] : realIP;
        }
        return req.socket.remoteAddress || 'unknown';
    }
    /**
     * Cleanup expired buckets
     */
    // Complexity: O(N) — loop
    cleanup() {
        const now = Date.now();
        let cleaned = 0;
        for (const [key, bucket] of this.buckets) {
            if (now - bucket.lastRefill > this.config.windowMs * 2) {
                this.buckets.delete(key);
                cleaned++;
            }
        }
        if (cleaned > 0) {
            logger.debug('Cleaned expired rate limit buckets', { count: cleaned });
        }
    }
}
exports.RateLimiter = RateLimiter;
// ═══════════════════════════════════════════════════════════════════════════════
// SLIDING WINDOW RATE LIMITER (More accurate)
// ═══════════════════════════════════════════════════════════════════════════════
class SlidingWindowRateLimiter {
    windows = new Map();
    config;
    cleanupInterval = null;
    constructor(config) {
        this.config = {
            windowMs: config.windowMs,
            max: config.max,
            message: config.message ?? 'Too many requests, please try again later',
            headerPrefix: config.headerPrefix ?? 'X-RateLimit',
            skip: config.skip ?? (() => false),
            keyGenerator: config.keyGenerator ?? this.defaultKeyGenerator.bind(this),
            onRateLimited: config.onRateLimited ?? (() => { })
        };
        this.cleanupInterval = setInterval(() => this.cleanup(), 60000);
    }
    /**
     * Check rate limit using sliding window
     */
    // Complexity: O(N) — linear scan
    check(req, customLimit) {
        if (this.config.skip(req)) {
            return {
                allowed: true,
                limit: this.config.max,
                remaining: this.config.max,
                resetTime: Date.now() + this.config.windowMs,
                retryAfter: 0
            };
        }
        const key = this.config.keyGenerator(req);
        const limit = customLimit ?? this.config.max;
        const now = Date.now();
        const windowStart = now - this.config.windowMs;
        let entries = this.windows.get(key) || [];
        // Remove expired entries
        entries = entries.filter(e => e.timestamp > windowStart);
        // Count requests in window
        const requestCount = entries.reduce((sum, e) => sum + e.count, 0);
        if (requestCount < limit) {
            // Add new entry
            const lastEntry = entries[entries.length - 1];
            if (lastEntry && now - lastEntry.timestamp < 1000) {
                // Aggregate within same second
                lastEntry.count++;
            }
            else {
                entries.push({ timestamp: now, count: 1 });
            }
            this.windows.set(key, entries);
            return {
                allowed: true,
                limit,
                remaining: limit - requestCount - 1,
                resetTime: now + this.config.windowMs,
                retryAfter: 0
            };
        }
        // Rate limited
        const oldestEntry = entries[0];
        const resetTime = oldestEntry ? oldestEntry.timestamp + this.config.windowMs : now + this.config.windowMs;
        const retryAfter = Math.ceil((resetTime - now) / 1000);
        const result = {
            allowed: false,
            limit,
            remaining: 0,
            resetTime,
            retryAfter: Math.max(1, retryAfter)
        };
        this.config.onRateLimited(req, result);
        return result;
    }
    /**
     * Get rate limit headers
     */
    // Complexity: O(1)
    getHeaders(result) {
        const prefix = this.config.headerPrefix;
        return {
            [`${prefix}-Limit`]: result.limit.toString(),
            [`${prefix}-Remaining`]: result.remaining.toString(),
            [`${prefix}-Reset`]: result.resetTime.toString(),
            ...(result.retryAfter > 0 && {
                'Retry-After': result.retryAfter.toString()
            })
        };
    }
    // Complexity: O(1)
    reset(key) {
        this.windows.delete(key);
    }
    // Complexity: O(1)
    destroy() {
        if (this.cleanupInterval) {
            // Complexity: O(1)
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }
    }
    // Complexity: O(N)
    defaultKeyGenerator(req) {
        const forwarded = req.headers['x-forwarded-for'];
        if (forwarded) {
            const ips = Array.isArray(forwarded) ? forwarded[0] : forwarded;
            return ips.split(',')[0].trim();
        }
        return req.socket.remoteAddress || 'unknown';
    }
    // Complexity: O(N) — linear scan
    cleanup() {
        const cutoff = Date.now() - this.config.windowMs * 2;
        for (const [key, entries] of this.windows) {
            const filtered = entries.filter(e => e.timestamp > cutoff);
            if (filtered.length === 0) {
                this.windows.delete(key);
            }
            else {
                this.windows.set(key, filtered);
            }
        }
    }
}
exports.SlidingWindowRateLimiter = SlidingWindowRateLimiter;
class TieredRateLimiter {
    limiter;
    tiers;
    constructor(config) {
        this.tiers = config.tiers;
        this.limiter = new SlidingWindowRateLimiter({
            windowMs: config.windowMs,
            max: config.tiers.anonymous, // Default to lowest tier
            headerPrefix: config.headerPrefix
        });
    }
    /**
     * Check rate limit for specific tier
     */
    // Complexity: O(1)
    check(req, tier) {
        const limit = this.tiers[tier] || this.tiers.anonymous;
        return this.limiter.check(req, limit);
    }
    // Complexity: O(1)
    getHeaders(result) {
        return this.limiter.getHeaders(result);
    }
    // Complexity: O(1)
    destroy() {
        this.limiter.destroy();
    }
}
exports.TieredRateLimiter = TieredRateLimiter;
// ═══════════════════════════════════════════════════════════════════════════════
// FACTORY
// ═══════════════════════════════════════════════════════════════════════════════
function createRateLimiter(config) {
    return new RateLimiter(config);
}
function createSlidingWindowRateLimiter(config) {
    return new SlidingWindowRateLimiter(config);
}
function createTieredRateLimiter(config) {
    return new TieredRateLimiter(config);
}
exports.default = RateLimiter;
