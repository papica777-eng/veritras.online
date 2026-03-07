"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 🌐 NETWORK INTERCEPTOR - Traffic Pattern Obfuscation
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * Metaphysical Principle: In the digital realm, patterns are the fingerprints of behavior.
 * Every request, every response, every timing interval forms a unique signature.
 * The Network Interceptor practices "pattern dissolution" - breaking the causal chains
 * that link behavior to identity.
 *
 * Like water that takes the shape of its container while retaining no memory of previous
 * forms, network traffic should flow without leaving traceable patterns.
 *
 * @author Dimitar Prodromov
 * @version 17.0.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.NetworkInterceptor = void 0;
const events_1 = require("events");
// ═══════════════════════════════════════════════════════════════════════════════════════
// 🔄 NETWORK INTERCEPTOR ENGINE
// ═══════════════════════════════════════════════════════════════════════════════════════
class NetworkInterceptor extends events_1.EventEmitter {
    config;
    requestHistory;
    stats;
    entropyPool;
    entropyIndex;
    baselinePattern;
    MAX_HISTORY = 1000;
    ENTROPY_SIZE = 512;
    constructor() {
        super();
        this.config = this.getDefaultConfig();
        this.requestHistory = [];
        this.stats = this.initializeStats();
        this.entropyPool = [];
        this.entropyIndex = 0;
        this.baselinePattern = null;
        this.seedEntropy();
    }
    /**
     * Get default obfuscation configuration
     */
    // Complexity: O(1)
    getDefaultConfig() {
        return {
            timing: true,
            headers: true,
            payloadSize: true,
            compression: true,
            tlsFingerprint: false, // Advanced - requires deeper integration
        };
    }
    /**
     * Initialize statistics tracking
     */
    // Complexity: O(1)
    initializeStats() {
        return {
            requestsProcessed: 0,
            timingAdjustments: 0,
            headerMutations: 0,
            sizePaddings: 0,
            averageDelay: 0,
        };
    }
    /**
     * Seed entropy pool for randomization
     */
    // Complexity: O(N*M) — nested iteration detected
    seedEntropy() {
        this.entropyPool = [];
        for (let i = 0; i < this.ENTROPY_SIZE; i++) {
            const hrTime = process.hrtime();
            const time = Date.now() ^ (hrTime[0] * 1e9 + hrTime[1]);
            const random = Math.floor(Math.random() * 0xffffffff);
            this.entropyPool.push((time ^ random) >>> 0);
        }
        // Shuffle pool
        for (let i = this.entropyPool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.entropyPool[i], this.entropyPool[j]] = [this.entropyPool[j], this.entropyPool[i]];
        }
        this.entropyIndex = 0;
    }
    /**
     * Get entropy value
     */
    // Complexity: O(N) — potential recursive descent
    getEntropy() {
        if (this.entropyIndex >= this.entropyPool.length) {
            this.seedEntropy();
        }
        return this.entropyPool[this.entropyIndex++];
    }
    /**
     * Configure obfuscation patterns
     *
     * @param config - Configuration for traffic obfuscation
     */
    // Complexity: O(1)
    obfuscatePatterns(config) {
        this.config = { ...this.config, ...config };
        this.emit('configUpdated', { config: this.config });
    }
    /**
     * Process outgoing request with obfuscation
     *
     * Metaphysical Note: Each request is a "moment of potential detection."
     * By transforming these moments, we create uncertainty in the observer's model.
     * The request still achieves its purpose, but its signature becomes fluid.
     */
    async processRequest(request) {
        const startTime = Date.now();
        const obfuscation = {};
        const mutableRequest = { ...request };
        // Apply timing variance
        if (this.config.timing) {
            const delay = this.calculateTimingVariance();
            obfuscation.delay = delay;
            this.stats.timingAdjustments++;
            if (delay > 0) {
                // SAFETY: async operation — wrap in try-catch for production resilience
                await this.delay(delay);
            }
        }
        // Mutate headers
        if (this.config.headers && 'headers' in mutableRequest && mutableRequest.headers) {
            mutableRequest.headers = this.mutateHeaders(mutableRequest.headers);
            obfuscation.headersMutated = true;
            this.stats.headerMutations++;
        }
        // Add payload padding
        if (this.config.payloadSize) {
            const padding = this.generatePadding();
            obfuscation.padding = padding;
            this.stats.sizePaddings++;
        }
        // Apply compression variance
        if (this.config.compression && 'headers' in mutableRequest && mutableRequest.headers) {
            mutableRequest.headers['Accept-Encoding'] =
                this.randomizeCompression();
        }
        // Record metrics
        this.recordRequest({
            timestamp: startTime,
            size: this.estimateSize(mutableRequest),
            duration: Date.now() - startTime,
            method: mutableRequest.method || 'GET',
            endpoint: mutableRequest.url || 'unknown',
        });
        this.stats.requestsProcessed++;
        this.updateAverageDelay(obfuscation.delay || 0);
        return { ...mutableRequest, _obfuscation: obfuscation };
    }
    /**
     * Calculate timing variance to break request patterns
     *
     * Uses exponential distribution with jitter to prevent statistical analysis
     * from identifying automated behavior patterns.
     */
    // Complexity: O(1)
    calculateTimingVariance() {
        // Base delay using exponential distribution
        const entropy = this.getEntropy();
        const normalizedEntropy = entropy / 0xffffffff;
        // Exponential with mean of 100ms, capped at 500ms
        const exponentialDelay = Math.min(-100 * Math.log(1 - normalizedEntropy), 500);
        // Add jitter
        const jitter = (this.getEntropy() % 100) - 50;
        // Consider time of day patterns
        const hourlyFactor = this.getHourlyFactor();
        // Final delay
        const delay = Math.max(0, Math.round(exponentialDelay + jitter) * hourlyFactor);
        return delay;
    }
    /**
     * Get factor based on time of day to match human patterns
     */
    // Complexity: O(1)
    getHourlyFactor() {
        const hour = new Date().getHours();
        // Lower delays during "business hours" (9-18), higher during night
        if (hour >= 9 && hour <= 18) {
            return 0.8;
        }
        else if (hour >= 22 || hour <= 6) {
            return 1.5;
        }
        return 1.0;
    }
    /**
     * Mutate HTTP headers while preserving functionality
     */
    // Complexity: O(N*M) — nested iteration detected
    mutateHeaders(headers) {
        const mutated = {};
        const entries = Object.entries(headers);
        // Randomize header order
        for (let i = entries.length - 1; i > 0; i--) {
            const j = this.getEntropy() % (i + 1);
            [entries[i], entries[j]] = [entries[j], entries[i]];
        }
        for (const [key, value] of entries) {
            // Randomize case for non-standard headers
            const mutatedKey = this.shouldMutateCase(key)
                ? this.randomizeHeaderCase(key)
                : key;
            mutated[mutatedKey] = value;
        }
        // Add common headers with variance
        mutated['Accept-Language'] = this.randomizeAcceptLanguage();
        mutated['Cache-Control'] = this.randomizeCacheControl();
        // Add decoy headers occasionally
        if (this.getEntropy() % 4 === 0) {
            mutated['X-Request-ID'] = this.generateRequestId();
        }
        return mutated;
    }
    /**
     * Check if header case should be mutated
     */
    // Complexity: O(1)
    shouldMutateCase(key) {
        // Don't mutate standard HTTP headers
        const standardHeaders = [
            'content-type', 'content-length', 'authorization', 'cookie',
            'user-agent', 'host', 'accept', 'connection',
        ];
        return !standardHeaders.includes(key.toLowerCase());
    }
    /**
     * Randomize header case
     */
    // Complexity: O(N) — linear iteration
    randomizeHeaderCase(header) {
        return header
            .split('-')
            .map((part) => {
            if (this.getEntropy() % 2 === 0) {
                return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
            }
            return part.toLowerCase();
        })
            .join('-');
    }
    /**
     * Randomize Accept-Language header
     */
    // Complexity: O(N) — potential recursive descent
    randomizeAcceptLanguage() {
        const options = [
            'en-US,en;q=0.9',
            'en-GB,en;q=0.9',
            'en-US,en;q=0.9,es;q=0.8',
            'en;q=0.8,en-US;q=0.9',
            'en-US,en;q=0.9,de;q=0.8',
        ];
        return options[this.getEntropy() % options.length];
    }
    /**
     * Randomize Cache-Control header
     */
    // Complexity: O(N) — potential recursive descent
    randomizeCacheControl() {
        const options = [
            'no-cache',
            'no-store',
            'max-age=0',
            'no-cache, no-store',
            'no-cache, max-age=0',
        ];
        return options[this.getEntropy() % options.length];
    }
    /**
     * Randomize compression preferences
     */
    // Complexity: O(N) — potential recursive descent
    randomizeCompression() {
        const options = [
            'gzip, deflate, br',
            'gzip, deflate',
            'br, gzip, deflate',
            'gzip, br, deflate',
            'deflate, gzip, br',
        ];
        return options[this.getEntropy() % options.length];
    }
    /**
     * Generate unique request ID
     */
    // Complexity: O(N) — potential recursive descent
    generateRequestId() {
        const parts = [
            this.getEntropy().toString(16),
            Date.now().toString(16),
            this.getEntropy().toString(16),
        ];
        return parts.join('-').substring(0, 32);
    }
    /**
     * Generate random padding to normalize payload sizes
     *
     * Normalizing payload sizes prevents traffic analysis based on request size patterns.
     */
    // Complexity: O(N) — linear iteration
    generatePadding() {
        const paddingSizes = [64, 128, 256, 512, 1024];
        const size = paddingSizes[this.getEntropy() % paddingSizes.length];
        // Generate random padding that compresses well
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let padding = '';
        for (let i = 0; i < size; i++) {
            padding += chars[this.getEntropy() % chars.length];
        }
        return padding;
    }
    /**
     * Estimate request size
     */
    // Complexity: O(1)
    estimateSize(request) {
        try {
            return JSON.stringify(request).length;
        }
        catch {
            return 0;
        }
    }
    /**
     * Record request metrics for pattern analysis
     */
    // Complexity: O(1)
    recordRequest(metrics) {
        this.requestHistory.push(metrics);
        if (this.requestHistory.length > this.MAX_HISTORY) {
            this.requestHistory = this.requestHistory.slice(-this.MAX_HISTORY);
        }
        // Update baseline pattern every 100 requests
        if (this.requestHistory.length % 100 === 0) {
            this.updateBaselinePattern();
        }
    }
    /**
     * Update baseline traffic pattern from history
     */
    // Complexity: O(N*M) — nested iteration detected
    updateBaselinePattern() {
        if (this.requestHistory.length < 10)
            return;
        const intervals = [];
        for (let i = 1; i < this.requestHistory.length; i++) {
            intervals.push(this.requestHistory[i].timestamp - this.requestHistory[i - 1].timestamp);
        }
        const sizes = this.requestHistory.map((r) => r.size);
        const methods = {};
        const hours = new Array(24).fill(0);
        for (const req of this.requestHistory) {
            methods[req.method] = (methods[req.method] || 0) + 1;
            const hour = new Date(req.timestamp).getHours();
            hours[hour]++;
        }
        this.baselinePattern = {
            averageInterval: this.average(intervals),
            intervalVariance: this.variance(intervals),
            averageSize: this.average(sizes),
            sizeVariance: this.variance(sizes),
            methodDistribution: methods,
            peakHours: hours
                .map((count, hour) => ({ hour, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 5)
                .map((h) => h.hour),
        };
    }
    /**
     * Calculate average of array
     */
    // Complexity: O(N) — linear iteration
    average(arr) {
        if (arr.length === 0)
            return 0;
        return arr.reduce((a, b) => a + b, 0) / arr.length;
    }
    /**
     * Calculate variance of array
     */
    // Complexity: O(N) — linear iteration
    variance(arr) {
        if (arr.length < 2)
            return 0;
        const avg = this.average(arr);
        return arr.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / arr.length;
    }
    /**
     * Delay execution
     */
    // Complexity: O(1)
    delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
    /**
     * Update average delay statistic
     */
    // Complexity: O(1)
    updateAverageDelay(delay) {
        const processed = this.stats.requestsProcessed;
        this.stats.averageDelay =
            (this.stats.averageDelay * (processed - 1) + delay) / processed;
    }
    /**
     * Analyze traffic for potential detection risks
     */
    // Complexity: O(N*M) — nested iteration detected
    analyzeTrafficPatterns() {
        const indicators = [];
        let riskScore = 0;
        if (this.requestHistory.length < 10) {
            return { riskLevel: 'none', indicators: ['Insufficient data for analysis'] };
        }
        // Check interval regularity
        const intervals = [];
        for (let i = 1; i < this.requestHistory.length; i++) {
            intervals.push(this.requestHistory[i].timestamp - this.requestHistory[i - 1].timestamp);
        }
        const intervalCV = this.coefficientOfVariation(intervals);
        if (intervalCV < 0.1) {
            indicators.push('Request intervals are too regular');
            riskScore += 30;
        }
        // Check size regularity
        const sizes = this.requestHistory.map((r) => r.size);
        const sizeCV = this.coefficientOfVariation(sizes);
        if (sizeCV < 0.05) {
            indicators.push('Request sizes are too uniform');
            riskScore += 20;
        }
        // Check method distribution
        const methods = new Set(this.requestHistory.map((r) => r.method));
        if (methods.size === 1) {
            indicators.push('Only one HTTP method used');
            riskScore += 15;
        }
        // Check timing patterns
        const hours = this.requestHistory.map((r) => new Date(r.timestamp).getHours());
        const uniqueHours = new Set(hours).size;
        if (uniqueHours < 4) {
            indicators.push('Traffic concentrated in few hours');
            riskScore += 10;
        }
        // Determine risk level
        let riskLevel;
        if (riskScore >= 50)
            riskLevel = 'high';
        else if (riskScore >= 30)
            riskLevel = 'medium';
        else if (riskScore >= 10)
            riskLevel = 'low';
        else
            riskLevel = 'none';
        return { riskLevel, indicators };
    }
    /**
     * Calculate coefficient of variation (CV)
     */
    // Complexity: O(N) — potential recursive descent
    coefficientOfVariation(arr) {
        const avg = this.average(arr);
        if (avg === 0)
            return 0;
        const stdDev = Math.sqrt(this.variance(arr));
        return stdDev / avg;
    }
    /**
     * Get obfuscation statistics
     */
    // Complexity: O(1)
    getStatistics() {
        return {
            ...this.stats,
            history: this.requestHistory.length,
            pattern: this.baselinePattern,
        };
    }
    /**
     * Apply countermeasures based on detected risk
     */
    // Complexity: O(1) — amortized
    applyCountermeasures(riskLevel) {
        switch (riskLevel) {
            case 'critical':
            case 'high':
                // Aggressive obfuscation
                this.config.timing = true;
                this.config.headers = true;
                this.config.payloadSize = true;
                this.config.compression = true;
                this.seedEntropy(); // Fresh entropy
                break;
            case 'medium':
                // Moderate obfuscation
                this.config.timing = true;
                this.config.headers = true;
                break;
            case 'low':
                // Light obfuscation
                this.config.timing = true;
                break;
            default:
                // Minimal obfuscation
                break;
        }
        this.emit('countermeasuresApplied', { riskLevel, config: this.config });
    }
    /**
     * Reset statistics and history
     */
    // Complexity: O(1)
    reset() {
        this.requestHistory = [];
        this.stats = this.initializeStats();
        this.baselinePattern = null;
        this.seedEntropy();
        this.emit('reset');
    }
    /**
     * Clean up resources
     */
    // Complexity: O(1)
    destroy() {
        this.requestHistory = [];
        this.entropyPool = [];
        this.removeAllListeners();
    }
}
exports.NetworkInterceptor = NetworkInterceptor;
exports.default = NetworkInterceptor;
