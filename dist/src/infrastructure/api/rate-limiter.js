"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                               ║
 * ║   QAntum RATE LIMITER                                                         ║
 * ║   "Token bucket and sliding window rate limiting"                             ║
 * ║                                                                               ║
 * ║   TODO B #44 - API: Rate Limiting                                             ║
 * ║                                                                               ║
 * ║   © 2025-2026 QAntum | Dimitar Prodromov                                        ║
 * ║                                                                               ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimitPresets = exports.RateLimitError = exports.RateLimiter = exports.SlidingWindowCounter = exports.TokenBucket = void 0;
exports.RateLimit = RateLimit;
exports.ThrottleMethod = ThrottleMethod;
exports.createRateLimiter = createRateLimiter;
exports.createTokenBucket = createTokenBucket;
// ═══════════════════════════════════════════════════════════════════════════════
// TOKEN BUCKET ALGORITHM
// ═══════════════════════════════════════════════════════════════════════════════
class TokenBucket {
    capacity;
    refillRate;
    refillAmount;
    tokens;
    lastRefill;
    constructor(capacity, refillRate, // tokens per second
    refillAmount = 1) {
        this.capacity = capacity;
        this.refillRate = refillRate;
        this.refillAmount = refillAmount;
        this.tokens = capacity;
        this.lastRefill = Date.now();
    }
    /**
     * Try to consume tokens
     */
    // Complexity: O(1)
    consume(amount = 1) {
        this.refill();
        if (this.tokens >= amount) {
            this.tokens -= amount;
            return {
                allowed: true,
                remaining: Math.floor(this.tokens),
                resetAt: this.lastRefill + (this.capacity / this.refillRate) * 1000,
            };
        }
        const tokensNeeded = amount - this.tokens;
        const waitTime = (tokensNeeded / this.refillRate) * 1000;
        return {
            allowed: false,
            remaining: 0,
            resetAt: Date.now() + waitTime,
            retryAfter: Math.ceil(waitTime / 1000),
        };
    }
    /**
     * Refill tokens based on elapsed time
     */
    // Complexity: O(1)
    refill() {
        const now = Date.now();
        const elapsed = (now - this.lastRefill) / 1000;
        const tokensToAdd = elapsed * this.refillRate * this.refillAmount;
        this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
        this.lastRefill = now;
    }
    /**
     * Get current state
     */
    // Complexity: O(1)
    getState() {
        this.refill();
        return {
            tokens: Math.floor(this.tokens),
            capacity: this.capacity,
            refillRate: this.refillRate,
        };
    }
    /**
     * Reset bucket to full capacity
     */
    // Complexity: O(1)
    reset() {
        this.tokens = this.capacity;
        this.lastRefill = Date.now();
    }
}
exports.TokenBucket = TokenBucket;
// ═══════════════════════════════════════════════════════════════════════════════
// SLIDING WINDOW COUNTER
// ═══════════════════════════════════════════════════════════════════════════════
class SlidingWindowCounter {
    windowMs;
    maxRequests;
    windows = new Map();
    constructor(windowMs, maxRequests) {
        this.windowMs = windowMs;
        this.maxRequests = maxRequests;
    }
    /**
     * Record a request and check if allowed
     */
    // Complexity: O(1) — lookup
    hit(timestamp = Date.now()) {
        const currentWindow = Math.floor(timestamp / this.windowMs);
        const previousWindow = currentWindow - 1;
        // Clean old windows
        this.cleanup(currentWindow);
        // Get counts
        const currentCount = this.windows.get(currentWindow) || 0;
        const previousCount = this.windows.get(previousWindow) || 0;
        // Calculate weighted count (sliding window approximation)
        const windowProgress = (timestamp % this.windowMs) / this.windowMs;
        const weightedCount = previousCount * (1 - windowProgress) + currentCount;
        if (weightedCount < this.maxRequests) {
            // Allowed - increment counter
            this.windows.set(currentWindow, currentCount + 1);
            return {
                allowed: true,
                remaining: Math.floor(this.maxRequests - weightedCount - 1),
                resetAt: (currentWindow + 1) * this.windowMs,
            };
        }
        // Rate limited
        const resetAt = (currentWindow + 1) * this.windowMs;
        return {
            allowed: false,
            remaining: 0,
            resetAt,
            retryAfter: Math.ceil((resetAt - timestamp) / 1000),
        };
    }
    /**
     * Get current window info
     */
    // Complexity: O(1) — lookup
    getInfo(timestamp = Date.now()) {
        const currentWindow = Math.floor(timestamp / this.windowMs);
        const count = this.windows.get(currentWindow) || 0;
        return {
            key: `window-${currentWindow}`,
            requests: count,
            windowStart: currentWindow * this.windowMs,
            windowEnd: (currentWindow + 1) * this.windowMs,
            remaining: Math.max(0, this.maxRequests - count),
        };
    }
    /**
     * Reset all windows
     */
    // Complexity: O(1)
    reset() {
        this.windows.clear();
    }
    // Complexity: O(N) — loop
    cleanup(currentWindow) {
        // Keep only current and previous window
        for (const window of this.windows.keys()) {
            if (window < currentWindow - 1) {
                this.windows.delete(window);
            }
        }
    }
}
exports.SlidingWindowCounter = SlidingWindowCounter;
class RateLimiter {
    limiters = new Map();
    config;
    constructor(config) {
        this.config = {
            burstCapacity: config.maxRequests,
            ...config,
        };
    }
    /**
     * Check if request is allowed for a key
     */
    // Complexity: O(1)
    check(key) {
        const limiter = this.getOrCreateLimiter(key);
        if (limiter instanceof TokenBucket) {
            return limiter.consume(1);
        }
        else {
            return limiter.hit();
        }
    }
    /**
     * Check without consuming
     */
    // Complexity: O(1) — lookup
    peek(key) {
        const limiter = this.limiters.get(key);
        if (!limiter) {
            return {
                allowed: true,
                remaining: this.config.maxRequests,
                resetAt: Date.now() + this.config.windowMs,
            };
        }
        if (limiter instanceof TokenBucket) {
            const state = limiter.getState();
            return {
                allowed: state.tokens > 0,
                remaining: state.tokens,
                resetAt: Date.now() + (state.capacity / state.refillRate) * 1000,
            };
        }
        else {
            const info = limiter.getInfo();
            return {
                allowed: info.remaining > 0,
                remaining: info.remaining,
                resetAt: info.windowEnd,
            };
        }
    }
    /**
     * Reset rate limit for a key
     */
    // Complexity: O(1) — lookup
    reset(key) {
        const limiter = this.limiters.get(key);
        if (limiter) {
            limiter.reset();
        }
    }
    /**
     * Reset all rate limits
     */
    // Complexity: O(1)
    resetAll() {
        this.limiters.clear();
    }
    /**
     * Get info for a key
     */
    // Complexity: O(1) — lookup
    getInfo(key) {
        const limiter = this.limiters.get(key);
        if (!limiter)
            return null;
        if (limiter instanceof SlidingWindowCounter) {
            return limiter.getInfo();
        }
        const state = limiter.getState();
        return {
            key,
            requests: state.capacity - state.tokens,
            windowStart: Date.now(),
            windowEnd: Date.now() + this.config.windowMs,
            remaining: state.tokens,
        };
    }
    // Complexity: O(1) — lookup
    getOrCreateLimiter(key) {
        let limiter = this.limiters.get(key);
        if (!limiter) {
            if (this.config.strategy === 'token-bucket') {
                // tokens per second = max requests / window in seconds
                const refillRate = this.config.maxRequests / (this.config.windowMs / 1000);
                limiter = new TokenBucket(this.config.burstCapacity, refillRate);
            }
            else {
                limiter = new SlidingWindowCounter(this.config.windowMs, this.config.maxRequests);
            }
            this.limiters.set(key, limiter);
        }
        return limiter;
    }
}
exports.RateLimiter = RateLimiter;
// ═══════════════════════════════════════════════════════════════════════════════
// DECORATORS
// ═══════════════════════════════════════════════════════════════════════════════
const defaultLimiter = new RateLimiter({
    strategy: 'sliding-window',
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100,
});
/**
 * @RateLimit - Apply rate limiting to a method
 */
function RateLimit(maxRequests, windowMs = 60000, keyExtractor) {
    const limiter = new RateLimiter({
        strategy: 'sliding-window',
        windowMs,
        maxRequests,
    });
    return function (target, propertyKey, descriptor) {
        const original = descriptor.value;
        const methodName = String(propertyKey);
        descriptor.value = function (...args) {
            const key = keyExtractor ? keyExtractor(args) : `${methodName}-default`;
            const result = limiter.check(key);
            if (!result.allowed) {
                throw new RateLimitError(`Rate limit exceeded. Retry after ${result.retryAfter} seconds.`, result);
            }
            return original.apply(this, args);
        };
        return descriptor;
    };
}
/**
 * @ThrottleMethod - Simple throttle (one call per interval)
 */
function ThrottleMethod(intervalMs) {
    return function (target, propertyKey, descriptor) {
        const original = descriptor.value;
        let lastCall = 0;
        descriptor.value = function (...args) {
            const now = Date.now();
            if (now - lastCall < intervalMs) {
                throw new Error(`Method throttled. Wait ${intervalMs - (now - lastCall)}ms`);
            }
            lastCall = now;
            return original.apply(this, args);
        };
        return descriptor;
    };
}
// ═══════════════════════════════════════════════════════════════════════════════
// ERROR
// ═══════════════════════════════════════════════════════════════════════════════
class RateLimitError extends Error {
    result;
    constructor(message, result) {
        super(message);
        this.result = result;
        this.name = 'RateLimitError';
    }
    get retryAfter() {
        return this.result.retryAfter || 0;
    }
    get resetAt() {
        return new Date(this.result.resetAt);
    }
}
exports.RateLimitError = RateLimitError;
// ═══════════════════════════════════════════════════════════════════════════════
// PRESETS
// ═══════════════════════════════════════════════════════════════════════════════
exports.RateLimitPresets = {
    /** Standard API: 100 req/min */
    api: () => new RateLimiter({
        strategy: 'sliding-window',
        windowMs: 60 * 1000,
        maxRequests: 100,
    }),
    /** Strict: 10 req/min */
    strict: () => new RateLimiter({
        strategy: 'sliding-window',
        windowMs: 60 * 1000,
        maxRequests: 10,
    }),
    /** Burst: 1000 req/min with 50 burst */
    burst: () => new RateLimiter({
        strategy: 'token-bucket',
        windowMs: 60 * 1000,
        maxRequests: 1000,
        burstCapacity: 50,
    }),
    /** Auth: 5 req/15min (login attempts) */
    auth: () => new RateLimiter({
        strategy: 'fixed-window',
        windowMs: 15 * 60 * 1000,
        maxRequests: 5,
    }),
    /** Daily: 10000 req/day */
    daily: () => new RateLimiter({
        strategy: 'sliding-window',
        windowMs: 24 * 60 * 60 * 1000,
        maxRequests: 10000,
    }),
};
// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════
function createRateLimiter(config) {
    return new RateLimiter(config);
}
function createTokenBucket(capacity, refillRate) {
    return new TokenBucket(capacity, refillRate);
}
exports.default = RateLimiter;
