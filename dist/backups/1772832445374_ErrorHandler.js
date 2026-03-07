"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * MIND-ENGINE: ERROR HANDLING & RETRY SYSTEM
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Comprehensive error classification, retry strategies, recovery mechanisms
 * Dead letter queue for failed operations
 *
 * @author dp | QAntum Labs
 * @version 1.0.0-QANTUM-PRIME
 * @license Commercial
 * ═══════════════════════════════════════════════════════════════════════════════
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorHandler = exports.CircuitBreaker = exports.CircuitState = exports.DeadLetterQueue = exports.RecoveryStrategies = exports.RetryManager = exports.ErrorClassifier = exports.ErrorSeverity = exports.ErrorCategory = void 0;
const events_1 = require("events");
// ═══════════════════════════════════════════════════════════════════════════════
// ERROR TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════════════════
var ErrorCategory;
(function (ErrorCategory) {
    ErrorCategory["NETWORK"] = "network";
    ErrorCategory["ELEMENT"] = "element";
    ErrorCategory["TIMEOUT"] = "timeout";
    ErrorCategory["VALIDATION"] = "validation";
    ErrorCategory["AUTHENTICATION"] = "authentication";
    ErrorCategory["CAPTCHA"] = "captcha";
    ErrorCategory["RATE_LIMIT"] = "rate_limit";
    ErrorCategory["BLOCKED"] = "blocked";
    ErrorCategory["SESSION"] = "session";
    ErrorCategory["DATA"] = "data";
    ErrorCategory["SYSTEM"] = "system";
    ErrorCategory["UNKNOWN"] = "unknown";
})(ErrorCategory || (exports.ErrorCategory = ErrorCategory = {}));
var ErrorSeverity;
(function (ErrorSeverity) {
    ErrorSeverity["LOW"] = "low";
    ErrorSeverity["MEDIUM"] = "medium";
    ErrorSeverity["HIGH"] = "high";
    ErrorSeverity["CRITICAL"] = "critical";
})(ErrorSeverity || (exports.ErrorSeverity = ErrorSeverity = {}));
// ═══════════════════════════════════════════════════════════════════════════════
// ERROR CLASSIFIER
// ═══════════════════════════════════════════════════════════════════════════════
class ErrorClassifier {
    static patterns = [
        // Network errors
        { pattern: /ECONNREFUSED|ENOTFOUND|ETIMEDOUT|ECONNRESET/i, category: ErrorCategory.NETWORK, severity: ErrorSeverity.MEDIUM, retryable: true, recovery: 'wait_and_retry' },
        { pattern: /net::ERR_|NetworkError|fetch failed/i, category: ErrorCategory.NETWORK, severity: ErrorSeverity.MEDIUM, retryable: true, recovery: 'wait_and_retry' },
        { pattern: /socket hang up|connection refused/i, category: ErrorCategory.NETWORK, severity: ErrorSeverity.MEDIUM, retryable: true, recovery: 'rotate_proxy' },
        // Timeout errors
        { pattern: /timeout|timed out|TimeoutError/i, category: ErrorCategory.TIMEOUT, severity: ErrorSeverity.LOW, retryable: true, recovery: 'retry' },
        { pattern: /navigation timeout|waiting for selector/i, category: ErrorCategory.TIMEOUT, severity: ErrorSeverity.LOW, retryable: true, recovery: 'refresh_page' },
        // Element errors
        { pattern: /element not found|no such element|locator resolved to/i, category: ErrorCategory.ELEMENT, severity: ErrorSeverity.LOW, retryable: true, recovery: 'retry' },
        { pattern: /element is not attached|stale element/i, category: ErrorCategory.ELEMENT, severity: ErrorSeverity.LOW, retryable: true, recovery: 'refresh_page' },
        { pattern: /element not visible|element not interactable/i, category: ErrorCategory.ELEMENT, severity: ErrorSeverity.LOW, retryable: true, recovery: 'retry' },
        { pattern: /detached from DOM/i, category: ErrorCategory.ELEMENT, severity: ErrorSeverity.LOW, retryable: true, recovery: 'refresh_page' },
        // Rate limiting
        { pattern: /rate limit|too many requests|429/i, category: ErrorCategory.RATE_LIMIT, severity: ErrorSeverity.MEDIUM, retryable: true, recovery: 'wait_and_retry' },
        { pattern: /quota exceeded|throttle/i, category: ErrorCategory.RATE_LIMIT, severity: ErrorSeverity.MEDIUM, retryable: true, recovery: 'wait_and_retry' },
        // Blocking/Detection
        { pattern: /blocked|banned|forbidden|403/i, category: ErrorCategory.BLOCKED, severity: ErrorSeverity.HIGH, retryable: false, recovery: 'rotate_proxy' },
        { pattern: /access denied|unauthorized|401/i, category: ErrorCategory.AUTHENTICATION, severity: ErrorSeverity.HIGH, retryable: false, recovery: 'new_session' },
        { pattern: /captcha|recaptcha|hcaptcha|challenge/i, category: ErrorCategory.CAPTCHA, severity: ErrorSeverity.MEDIUM, retryable: true, recovery: 'solve_captcha' },
        { pattern: /bot detected|automation detected/i, category: ErrorCategory.BLOCKED, severity: ErrorSeverity.CRITICAL, retryable: false, recovery: 'abort' },
        // Session errors
        { pattern: /session expired|invalid session|session not found/i, category: ErrorCategory.SESSION, severity: ErrorSeverity.MEDIUM, retryable: true, recovery: 'new_session' },
        { pattern: /cookie|localStorage|sessionStorage/i, category: ErrorCategory.SESSION, severity: ErrorSeverity.MEDIUM, retryable: true, recovery: 'clear_cookies' },
        // Validation errors
        { pattern: /validation|invalid|required field/i, category: ErrorCategory.VALIDATION, severity: ErrorSeverity.LOW, retryable: false, recovery: 'abort' },
        // Data errors
        { pattern: /parse error|JSON|syntax error/i, category: ErrorCategory.DATA, severity: ErrorSeverity.LOW, retryable: false, recovery: 'abort' },
        { pattern: /database|query failed|SQL/i, category: ErrorCategory.DATA, severity: ErrorSeverity.HIGH, retryable: true, recovery: 'retry' },
        // System errors
        { pattern: /out of memory|heap|stack overflow/i, category: ErrorCategory.SYSTEM, severity: ErrorSeverity.CRITICAL, retryable: false, recovery: 'abort' },
        { pattern: /ENOSPC|disk full/i, category: ErrorCategory.SYSTEM, severity: ErrorSeverity.CRITICAL, retryable: false, recovery: 'abort' }
    ];
    /**
     * Classify error
     */
    static classify(error, context) {
        const errorMessage = typeof error === 'string' ? error : error.message;
        const errorStack = typeof error === 'string' ? '' : error.stack || '';
        const fullText = `${errorMessage} ${errorStack}`;
        for (const { pattern, category, severity, retryable, recovery } of this.patterns) {
            if (pattern.test(fullText)) {
                return {
                    original: typeof error === 'string' ? new Error(error) : error,
                    category,
                    severity,
                    retryable,
                    retryDelay: this.getRetryDelay(category),
                    maxRetries: this.getMaxRetries(category),
                    recoveryAction: recovery,
                    context
                };
            }
        }
        // Default classification
        return {
            original: typeof error === 'string' ? new Error(error) : error,
            category: ErrorCategory.UNKNOWN,
            severity: ErrorSeverity.MEDIUM,
            retryable: true,
            retryDelay: 1000,
            maxRetries: 3,
            recoveryAction: 'retry',
            context
        };
    }
    /**
     * Get default retry delay for category
     */
    static getRetryDelay(category) {
        const delays = {
            [ErrorCategory.NETWORK]: 2000,
            [ErrorCategory.ELEMENT]: 500,
            [ErrorCategory.TIMEOUT]: 1000,
            [ErrorCategory.VALIDATION]: 0,
            [ErrorCategory.AUTHENTICATION]: 0,
            [ErrorCategory.CAPTCHA]: 5000,
            [ErrorCategory.RATE_LIMIT]: 30000,
            [ErrorCategory.BLOCKED]: 60000,
            [ErrorCategory.SESSION]: 2000,
            [ErrorCategory.DATA]: 0,
            [ErrorCategory.SYSTEM]: 0,
            [ErrorCategory.UNKNOWN]: 1000
        };
        return delays[category];
    }
    /**
     * Get default max retries for category
     */
    static getMaxRetries(category) {
        const retries = {
            [ErrorCategory.NETWORK]: 5,
            [ErrorCategory.ELEMENT]: 10,
            [ErrorCategory.TIMEOUT]: 3,
            [ErrorCategory.VALIDATION]: 0,
            [ErrorCategory.AUTHENTICATION]: 1,
            [ErrorCategory.CAPTCHA]: 3,
            [ErrorCategory.RATE_LIMIT]: 2,
            [ErrorCategory.BLOCKED]: 0,
            [ErrorCategory.SESSION]: 2,
            [ErrorCategory.DATA]: 0,
            [ErrorCategory.SYSTEM]: 0,
            [ErrorCategory.UNKNOWN]: 3
        };
        return retries[category];
    }
    /**
     * Add custom pattern
     */
    static addPattern(pattern, category, severity, retryable, recovery) {
        this.patterns.unshift({ pattern, category, severity, retryable, recovery });
    }
    /**
     * Check if error is retryable
     */
    static isRetryable(error) {
        return this.classify(error).retryable;
    }
    /**
     * Get recovery action for error
     */
    static getRecoveryAction(error) {
        return this.classify(error).recoveryAction || 'retry';
    }
}
exports.ErrorClassifier = ErrorClassifier;
// ═══════════════════════════════════════════════════════════════════════════════
// RETRY MANAGER
// ═══════════════════════════════════════════════════════════════════════════════
class RetryManager extends events_1.EventEmitter {
    config;
    fibonacciCache = [0, 1];
    constructor(config = {}) {
        super();
        this.config = {
            maxRetries: 3,
            baseDelay: 1000,
            maxDelay: 30000,
            strategy: 'exponential',
            jitter: true,
            ...config
        };
    }
    /**
     * Execute with retry
     */
    async execute(operation, options = {}) {
        const config = { ...this.config, ...options };
        let lastError;
        for (let attempt = 1; attempt <= config.maxRetries + 1; attempt++) {
            try {
                this.emit('attempt', { attempt, maxRetries: config.maxRetries });
                return await operation();
            }
            catch (error) {
                lastError = ErrorClassifier.classify(error);
                this.emit('error', { attempt, error: lastError });
                // Check if retryable
                if (!this.shouldRetry(lastError, attempt, config)) {
                    this.emit('failed', { attempts: attempt, error: lastError });
                    throw lastError.original;
                }
                // Calculate delay
                const delay = this.calculateDelay(attempt, config, lastError);
                this.emit('retry', { attempt, delay, error: lastError });
                // Execute onRetry callback
                if (config.onRetry) {
                    // SAFETY: async operation — wrap in try-catch for production resilience
                    await config.onRetry(attempt, lastError);
                }
                // Wait before retry
                // SAFETY: async operation — wrap in try-catch for production resilience
                await this.sleep(delay);
            }
        }
        this.emit('failed', { attempts: config.maxRetries + 1, error: lastError });
        throw lastError?.original || new Error('Retry failed');
    }
    /**
     * Check if should retry
     */
    // Complexity: O(1)
    shouldRetry(error, attempt, config) {
        if (attempt > config.maxRetries)
            return false;
        if (!error.retryable)
            return false;
        if (config.retryableErrors && !config.retryableErrors.includes(error.category)) {
            return false;
        }
        return true;
    }
    /**
     * Calculate retry delay
     */
    // Complexity: O(1)
    calculateDelay(attempt, config, error) {
        let delay;
        switch (config.strategy) {
            case 'fixed':
                delay = config.baseDelay;
                break;
            case 'linear':
                delay = config.baseDelay * attempt;
                break;
            case 'exponential':
                delay = config.baseDelay * Math.pow(2, attempt - 1);
                break;
            case 'fibonacci':
                delay = config.baseDelay * this.fibonacci(attempt);
                break;
            case 'decorrelated_jitter':
                delay = Math.min(config.maxDelay, Math.random() * (config.baseDelay * Math.pow(3, attempt - 1) - config.baseDelay) + config.baseDelay);
                break;
            default:
                delay = config.baseDelay;
        }
        // Apply jitter
        if (config.jitter && config.strategy !== 'decorrelated_jitter') {
            const jitterRange = delay * 0.3;
            delay = delay - jitterRange + Math.random() * jitterRange * 2;
        }
        // Apply category-specific delay
        if (error?.retryDelay) {
            delay = Math.max(delay, error.retryDelay);
        }
        // Cap at maxDelay
        return Math.min(delay, config.maxDelay);
    }
    /**
     * Fibonacci sequence
     */
    // Complexity: O(N) — loop
    fibonacci(n) {
        while (this.fibonacciCache.length <= n) {
            const len = this.fibonacciCache.length;
            this.fibonacciCache.push(this.fibonacciCache[len - 1] + this.fibonacciCache[len - 2]);
        }
        return this.fibonacciCache[n];
    }
    // Complexity: O(1)
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
exports.RetryManager = RetryManager;
class RecoveryStrategies extends events_1.EventEmitter {
    context;
    constructor(context = {}) {
        super();
        this.context = context;
    }
    /**
     * Execute recovery action
     */
    // Complexity: O(1)
    async execute(action, error) {
        this.emit('recovery:start', { action, error });
        try {
            let success = false;
            switch (action) {
                case 'retry':
                    success = true; // Just retry
                    break;
                case 'wait_and_retry':
                    await this.waitAndRetry(error);
                    success = true;
                    break;
                case 'refresh_page':
                    success = await this.refreshPage();
                    break;
                case 'clear_cookies':
                    // SAFETY: async operation — wrap in try-catch for production resilience
                    success = await this.clearCookies();
                    break;
                case 'rotate_proxy':
                    // SAFETY: async operation — wrap in try-catch for production resilience
                    success = await this.rotateProxy();
                    break;
                case 'solve_captcha':
                    // SAFETY: async operation — wrap in try-catch for production resilience
                    success = await this.solveCaptcha();
                    break;
                case 'new_session':
                    // SAFETY: async operation — wrap in try-catch for production resilience
                    success = await this.newSession();
                    break;
                case 'escalate':
                    this.emit('recovery:escalate', error);
                    success = false;
                    break;
                case 'abort':
                    this.emit('recovery:abort', error);
                    success = false;
                    break;
            }
            this.emit('recovery:complete', { action, success, error });
            return success;
        }
        catch (recoveryError) {
            this.emit('recovery:failed', { action, error, recoveryError });
            return false;
        }
    }
    // Complexity: O(1)
    async waitAndRetry(error) {
        const delay = error.retryDelay || 5000;
        // SAFETY: async operation — wrap in try-catch for production resilience
        await new Promise(resolve => setTimeout(resolve, delay));
    }
    // Complexity: O(1)
    async refreshPage() {
        if (!this.context.page)
            return false;
        try {
            await this.context.page.reload({ waitUntil: 'networkidle' });
            return true;
        }
        catch {
            return false;
        }
    }
    // Complexity: O(1)
    async clearCookies() {
        if (!this.context.page)
            return false;
        try {
            const context = this.context.page.context();
            await context.clearCookies();
            return true;
        }
        catch {
            return false;
        }
    }
    // Complexity: O(1)
    async rotateProxy() {
        if (!this.context.proxyRotator)
            return false;
        try {
            const newProxy = await this.context.proxyRotator.rotateProxy();
            this.emit('proxy:rotated', { proxy: newProxy });
            return true;
        }
        catch {
            return false;
        }
    }
    // Complexity: O(1)
    async solveCaptcha() {
        if (!this.context.captchaSolver || !this.context.page)
            return false;
        try {
            await this.context.captchaSolver.solve(this.context.page);
            return true;
        }
        catch {
            return false;
        }
    }
    // Complexity: O(1)
    async newSession() {
        if (!this.context.sessionManager)
            return false;
        try {
            await this.context.sessionManager.clearSession();
            await this.context.sessionManager.createSession();
            return true;
        }
        catch {
            return false;
        }
    }
    /**
     * Update context
     */
    // Complexity: O(1)
    setContext(context) {
        this.context = { ...this.context, ...context };
    }
}
exports.RecoveryStrategies = RecoveryStrategies;
// ═══════════════════════════════════════════════════════════════════════════════
// DEAD LETTER QUEUE
// ═══════════════════════════════════════════════════════════════════════════════
class DeadLetterQueue extends events_1.EventEmitter {
    queue = new Map();
    maxSize;
    retentionMs;
    constructor(options = {}) {
        super();
        this.maxSize = options.maxSize || 10000;
        this.retentionMs = (options.retentionHours || 24) * 60 * 60 * 1000;
    }
    /**
     * Add failed operation
     */
    // Complexity: O(1) — lookup
    add(item) {
        const id = this.generateId();
        const now = new Date();
        const dlqItem = {
            ...item,
            id,
            attempts: 1,
            firstFailure: now,
            lastFailure: now
        };
        // Check size limit
        if (this.queue.size >= this.maxSize) {
            this.pruneOldest();
        }
        this.queue.set(id, dlqItem);
        this.emit('item:added', dlqItem);
        return id;
    }
    /**
     * Get item by ID
     */
    // Complexity: O(1) — lookup
    get(id) {
        return this.queue.get(id);
    }
    /**
     * Get all items
     */
    // Complexity: O(N) — linear scan
    getAll(filter) {
        let items = Array.from(this.queue.values());
        if (filter) {
            if (filter.category) {
                items = items.filter(i => i.error.category === filter.category);
            }
            if (filter.operation) {
                items = items.filter(i => i.operation === filter.operation);
            }
            if (filter.minAttempts) {
                items = items.filter(i => i.attempts >= (filter.minAttempts ?? 0));
            }
        }
        return items;
    }
    /**
     * Retry item
     */
    async retry(id, operation) {
        const item = this.queue.get(id);
        if (!item)
            return null;
        try {
            this.emit('item:retrying', item);
            const result = await operation(...item.args);
            this.remove(id);
            this.emit('item:succeeded', { id, result });
            return result;
        }
        catch (error) {
            item.attempts++;
            item.lastFailure = new Date();
            item.error = ErrorClassifier.classify(error);
            this.emit('item:failed', item);
            return null;
        }
    }
    /**
     * Retry all items of category
     */
    async retryCategory(category, operation, options = {}) {
        const items = this.getAll({ category });
        const { maxConcurrent = 5, delayBetween = 1000 } = options;
        let succeeded = 0;
        let failed = 0;
        // Process in batches
        for (let i = 0; i < items.length; i += maxConcurrent) {
            const batch = items.slice(i, i + maxConcurrent);
            // SAFETY: async operation — wrap in try-catch for production resilience
            const results = await Promise.all(batch.map(item => this.retry(item.id, operation)));
            results.forEach(r => r !== null ? succeeded++ : failed++);
            if (i + maxConcurrent < items.length) {
                // SAFETY: async operation — wrap in try-catch for production resilience
                await new Promise(resolve => setTimeout(resolve, delayBetween));
            }
        }
        return { succeeded, failed };
    }
    /**
     * Remove item
     */
    // Complexity: O(1)
    remove(id) {
        const existed = this.queue.delete(id);
        if (existed) {
            this.emit('item:removed', { id });
        }
        return existed;
    }
    /**
     * Clear all items
     */
    // Complexity: O(1)
    clear() {
        const count = this.queue.size;
        this.queue.clear();
        this.emit('cleared', { count });
    }
    /**
     * Get stats
     */
    // Complexity: O(N) — loop
    getStats() {
        const items = Array.from(this.queue.values());
        const byCategory = {};
        const byOperation = {};
        let totalAttempts = 0;
        let oldestItem;
        for (const item of items) {
            byCategory[item.error.category] = (byCategory[item.error.category] || 0) + 1;
            byOperation[item.operation] = (byOperation[item.operation] || 0) + 1;
            totalAttempts += item.attempts;
            if (!oldestItem || item.firstFailure < oldestItem) {
                oldestItem = item.firstFailure;
            }
        }
        return {
            total: items.length,
            byCategory: byCategory,
            byOperation,
            avgAttempts: items.length > 0 ? totalAttempts / items.length : 0,
            oldestItem
        };
    }
    /**
     * Prune expired items
     */
    // Complexity: O(N) — loop
    prune() {
        const now = Date.now();
        let pruned = 0;
        for (const [id, item] of this.queue.entries()) {
            if (now - item.lastFailure.getTime() > this.retentionMs) {
                this.queue.delete(id);
                pruned++;
            }
        }
        if (pruned > 0) {
            this.emit('pruned', { count: pruned });
        }
        return pruned;
    }
    /**
     * Export to JSON
     */
    // Complexity: O(1)
    export() {
        const items = Array.from(this.queue.values());
        return JSON.stringify(items, null, 2);
    }
    /**
     * Import from JSON
     */
    import(json) {
        const items = JSON.parse(json);
        for (const item of items) {
            item.firstFailure = new Date(item.firstFailure);
            item.lastFailure = new Date(item.lastFailure);
            this.queue.set(item.id, item);
        }
        return items.length;
    }
    // Complexity: O(N) — loop
    pruneOldest() {
        let oldest = null;
        for (const [id, item] of this.queue.entries()) {
            if (!oldest || item.firstFailure < oldest.date) {
                oldest = { id, date: item.firstFailure };
            }
        }
        if (oldest) {
            this.queue.delete(oldest.id);
        }
    }
    // Complexity: O(1)
    generateId() {
        return `dlq_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}
exports.DeadLetterQueue = DeadLetterQueue;
// ═══════════════════════════════════════════════════════════════════════════════
// CIRCUIT BREAKER
// ═══════════════════════════════════════════════════════════════════════════════
var CircuitState;
(function (CircuitState) {
    CircuitState["CLOSED"] = "closed";
    CircuitState["OPEN"] = "open";
    CircuitState["HALF_OPEN"] = "half_open";
})(CircuitState || (exports.CircuitState = CircuitState = {}));
class CircuitBreaker extends events_1.EventEmitter {
    options;
    state = CircuitState.CLOSED;
    failures = 0;
    successes = 0;
    lastFailureTime;
    nextAttemptTime;
    constructor(options = {}) {
        super();
        this.options = options;
        this.options = {
            failureThreshold: 5,
            successThreshold: 2,
            timeout: 30000,
            resetTimeout: 60000,
            ...options
        };
    }
    /**
     * Execute with circuit breaker
     */
    async execute(operation) {
        if (this.state === CircuitState.OPEN) {
            if (this.nextAttemptTime && Date.now() < this.nextAttemptTime.getTime()) {
                throw new Error('Circuit breaker is OPEN');
            }
            this.state = CircuitState.HALF_OPEN;
            this.emit('state:change', { state: this.state });
        }
        try {
            const result = await this.withTimeout(operation);
            this.onSuccess();
            return result;
        }
        catch (error) {
            this.onFailure();
            throw error;
        }
    }
    /**
     * Get current state
     */
    // Complexity: O(1)
    getState() {
        return this.state;
    }
    /**
     * Force reset
     */
    // Complexity: O(1)
    reset() {
        this.state = CircuitState.CLOSED;
        this.failures = 0;
        this.successes = 0;
        this.lastFailureTime = undefined;
        this.nextAttemptTime = undefined;
        this.emit('reset');
    }
    // Complexity: O(1)
    onSuccess() {
        if (this.state === CircuitState.HALF_OPEN) {
            this.successes++;
            if (this.successes >= this.options.successThreshold) {
                this.state = CircuitState.CLOSED;
                this.failures = 0;
                this.successes = 0;
                this.emit('state:change', { state: this.state });
            }
        }
        else {
            this.failures = 0;
        }
        this.emit('success');
    }
    // Complexity: O(1)
    onFailure() {
        this.failures++;
        this.lastFailureTime = new Date();
        this.successes = 0;
        if (this.state === CircuitState.HALF_OPEN || this.failures >= this.options.failureThreshold) {
            this.state = CircuitState.OPEN;
            this.nextAttemptTime = new Date(Date.now() + this.options.resetTimeout);
            this.emit('state:change', { state: this.state, nextAttempt: this.nextAttemptTime });
        }
        this.emit('failure', { failures: this.failures });
    }
    withTimeout(operation) {
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                // Complexity: O(1)
                reject(new Error('Circuit breaker timeout'));
            }, this.options.timeout);
            // Complexity: O(1)
            operation()
                .then(result => {
                // Complexity: O(1)
                clearTimeout(timer);
                // Complexity: O(1)
                resolve(result);
            })
                .catch(error => {
                // Complexity: O(1)
                clearTimeout(timer);
                // Complexity: O(1)
                reject(error);
            });
        });
    }
}
exports.CircuitBreaker = CircuitBreaker;
// ═══════════════════════════════════════════════════════════════════════════════
// UNIFIED ERROR HANDLER
// ═══════════════════════════════════════════════════════════════════════════════
class ErrorHandler extends events_1.EventEmitter {
    classifier = ErrorClassifier;
    retry;
    recovery;
    deadLetter;
    circuitBreaker;
    constructor(options = {}) {
        super();
        this.retry = new RetryManager(options.retry);
        this.recovery = new RecoveryStrategies(options.recovery);
        this.deadLetter = new DeadLetterQueue(options.deadLetter);
        this.circuitBreaker = new CircuitBreaker(options.circuitBreaker);
        // Forward events
        this.retry.on('failed', (data) => this.emit('operation:failed', data));
        this.recovery.on('recovery:complete', (data) => this.emit('recovery:complete', data));
        this.deadLetter.on('item:added', (data) => this.emit('deadletter:added', data));
        this.circuitBreaker.on('state:change', (data) => this.emit('circuit:state', data));
    }
    /**
     * Execute operation with full error handling
     */
    async execute(operation, options = {}) {
        const { name = 'unknown', args = [], retry = {}, useCircuitBreaker = true } = options;
        try {
            if (useCircuitBreaker) {
                return await this.circuitBreaker.execute(() => this.retry.execute(operation, retry));
            }
            return await this.retry.execute(operation, retry);
        }
        catch (error) {
            const classified = ErrorClassifier.classify(error);
            // Try recovery
            if (classified.recoveryAction && classified.recoveryAction !== 'abort') {
                // SAFETY: async operation — wrap in try-catch for production resilience
                const recovered = await this.recovery.execute(classified.recoveryAction, classified);
                if (recovered) {
                    // Retry after recovery
                    try {
                        return await operation();
                    }
                    catch (retryError) {
                        // Add to dead letter queue
                        this.deadLetter.add({
                            error: ErrorClassifier.classify(retryError),
                            operation: name,
                            args,
                            context: { recoveryAttempted: classified.recoveryAction }
                        });
                    }
                }
            }
            // Add to dead letter queue
            this.deadLetter.add({
                error: classified,
                operation: name,
                args
            });
            throw error;
        }
    }
}
exports.ErrorHandler = ErrorHandler;
exports.default = ErrorHandler;
