"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                               ║
 * ║   QAntum DEADLINE MANAGER                                                     ║
 * ║   "Smart timeout handling and deadline enforcement"                           ║
 * ║                                                                               ║
 * ║   TODO B #33 - Chronos: Deadline Management                                   ║
 * ║                                                                               ║
 * ║   © 2025-2026 QAntum | Dimitar Prodromov                                        ║
 * ║                                                                               ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDeadlineManager = exports.DeadlineExpiredError = exports.DeadlineContext = exports.DeadlineManager = void 0;
exports.WithDeadline = WithDeadline;
exports.AdaptiveDeadline = AdaptiveDeadline;
// ═══════════════════════════════════════════════════════════════════════════════
// DEADLINE MANAGER
// ═══════════════════════════════════════════════════════════════════════════════
class DeadlineManager {
    static instance;
    deadlines = new Map();
    timers = new Map();
    adaptiveHistory = new Map();
    static getInstance() {
        if (!DeadlineManager.instance) {
            DeadlineManager.instance = new DeadlineManager();
        }
        return DeadlineManager.instance;
    }
    // ─────────────────────────────────────────────────────────────────────────
    // DEADLINE CREATION
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Create a deadline
     */
    // Complexity: O(1) — lookup
    create(name, timeoutMs, options = {}) {
        const id = `deadline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const now = Date.now();
        const deadline = {
            id,
            name,
            timeout: timeoutMs,
            strategy: options.strategy || 'hard',
            startedAt: now,
            expiresAt: now + timeoutMs,
            status: 'active',
            onExpire: options.onExpire,
            onWarning: options.onWarning,
            warningThreshold: options.warningThreshold || 0.8,
            metadata: options.metadata,
        };
        this.deadlines.set(id, deadline);
        this.setupTimers(deadline);
        return id;
    }
    /**
     * Create deadline from context (AbortController-like)
     */
    // Complexity: O(1)
    createContext(name, timeoutMs) {
        const id = this.create(name, timeoutMs);
        return new DeadlineContext(id, this);
    }
    // ─────────────────────────────────────────────────────────────────────────
    // EXECUTION WITH DEADLINE
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Execute function with deadline
     */
    async withDeadline(name, timeoutMs, fn, options = {}) {
        const context = this.createContext(name, timeoutMs);
        const startTime = Date.now();
        try {
            const result = await Promise.race([
                // Complexity: O(1)
                fn(context),
                this.createTimeoutPromise(context.id, timeoutMs),
            ]);
            const duration = Date.now() - startTime;
            this.complete(context.id);
            // Record for adaptive strategy
            this.recordExecution(name, duration);
            return {
                success: true,
                result: result,
                expired: false,
                duration,
                remaining: Math.max(0, timeoutMs - duration),
            };
        }
        catch (error) {
            const duration = Date.now() - startTime;
            const deadline = this.deadlines.get(context.id);
            const expired = deadline?.status === 'expired';
            return {
                success: false,
                expired,
                duration,
                remaining: 0,
            };
        }
        finally {
            this.cleanup(context.id);
        }
    }
    /**
     * Execute with adaptive timeout
     */
    async withAdaptiveDeadline(name, baseTimeoutMs, fn, options = {}) {
        const adaptiveTimeout = this.calculateAdaptiveTimeout(name, baseTimeoutMs);
        return this.withDeadline(name, adaptiveTimeout, fn, { ...options, strategy: 'adaptive' });
    }
    // ─────────────────────────────────────────────────────────────────────────
    // DEADLINE MANAGEMENT
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Get deadline
     */
    // Complexity: O(1) — lookup
    get(id) {
        return this.deadlines.get(id);
    }
    /**
     * Get remaining time
     */
    // Complexity: O(1) — lookup
    getRemaining(id) {
        const deadline = this.deadlines.get(id);
        if (!deadline || deadline.status !== 'active')
            return 0;
        return Math.max(0, deadline.expiresAt - Date.now());
    }
    /**
     * Extend deadline
     */
    // Complexity: O(1) — lookup
    extend(id, additionalMs) {
        const deadline = this.deadlines.get(id);
        if (!deadline || deadline.status !== 'active')
            return false;
        deadline.expiresAt += additionalMs;
        deadline.timeout += additionalMs;
        // Reset timers
        this.clearTimers(id);
        this.setupTimers(deadline);
        return true;
    }
    /**
     * Mark deadline as complete
     */
    // Complexity: O(1) — lookup
    complete(id) {
        const deadline = this.deadlines.get(id);
        if (deadline) {
            deadline.status = 'completed';
            this.clearTimers(id);
        }
    }
    /**
     * Cancel deadline
     */
    // Complexity: O(1) — lookup
    cancel(id) {
        const deadline = this.deadlines.get(id);
        if (!deadline)
            return false;
        deadline.status = 'cancelled';
        this.clearTimers(id);
        return true;
    }
    /**
     * Check if expired
     */
    // Complexity: O(1) — lookup
    isExpired(id) {
        const deadline = this.deadlines.get(id);
        if (!deadline)
            return true;
        if (deadline.status === 'expired')
            return true;
        if (Date.now() >= deadline.expiresAt) {
            deadline.status = 'expired';
            return true;
        }
        return false;
    }
    // ─────────────────────────────────────────────────────────────────────────
    // BATCH OPERATIONS
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Create multiple deadlines with shared parent
     */
    // Complexity: O(1)
    createGroup(parentName, parentTimeoutMs, children) {
        const parentId = this.create(parentName, parentTimeoutMs);
        const childIds = [];
        for (const child of children) {
            // Child cannot exceed parent
            const childTimeout = Math.min(child.timeout, parentTimeoutMs);
            const childId = this.create(`${parentName}/${child.name}`, childTimeout, {
                metadata: { parent: parentId },
            });
            childIds.push(childId);
        }
        return { parent: parentId, children: childIds };
    }
    /**
     * Cancel all deadlines in group
     */
    // Complexity: O(N) — loop
    cancelGroup(parentId) {
        let cancelled = 0;
        for (const [id, deadline] of this.deadlines) {
            if (id === parentId || deadline.metadata?.parent === parentId) {
                this.cancel(id);
                cancelled++;
            }
        }
        return cancelled;
    }
    // ─────────────────────────────────────────────────────────────────────────
    // PRIVATE
    // ─────────────────────────────────────────────────────────────────────────
    // Complexity: O(1) — lookup
    setupTimers(deadline) {
        const timers = [];
        // Warning timer
        if (deadline.onWarning && deadline.warningThreshold) {
            const warningTime = deadline.timeout * deadline.warningThreshold;
            const warningTimer = setTimeout(() => {
                if (deadline.status === 'active') {
                    deadline.onWarning(this.getRemaining(deadline.id));
                }
            }, warningTime);
            timers.push(warningTimer);
        }
        // Expiration timer
        const expirationTimer = setTimeout(() => {
            if (deadline.status === 'active') {
                deadline.status = 'expired';
                deadline.onExpire?.();
            }
        }, deadline.timeout);
        timers.push(expirationTimer);
        this.timers.set(deadline.id, timers);
    }
    // Complexity: O(N) — linear scan
    clearTimers(id) {
        const timers = this.timers.get(id);
        if (timers) {
            timers.forEach(clearTimeout);
            this.timers.delete(id);
        }
    }
    // Complexity: O(N)
    cleanup(id) {
        this.clearTimers(id);
        // Keep deadline for history but mark as done
        const deadline = this.deadlines.get(id);
        if (deadline && deadline.status === 'active') {
            deadline.status = 'completed';
        }
    }
    // Complexity: O(N)
    createTimeoutPromise(id, timeoutMs) {
        return new Promise((_, reject) => {
            const timer = setTimeout(() => {
                const deadline = this.deadlines.get(id);
                if (deadline) {
                    deadline.status = 'expired';
                }
                // Complexity: O(1)
                reject(new DeadlineExpiredError(id, timeoutMs));
            }, timeoutMs);
            // Store for cleanup
            const timers = this.timers.get(id) || [];
            timers.push(timer);
            this.timers.set(id, timers);
        });
    }
    // Complexity: O(1) — lookup
    recordExecution(name, duration) {
        const history = this.adaptiveHistory.get(name) || [];
        history.push(duration);
        // Keep last 100 executions
        if (history.length > 100) {
            history.shift();
        }
        this.adaptiveHistory.set(name, history);
    }
    // Complexity: O(N log N) — sort
    calculateAdaptiveTimeout(name, baseTimeout) {
        const history = this.adaptiveHistory.get(name);
        if (!history || history.length < 5) {
            return baseTimeout;
        }
        // Calculate P95 of historical durations
        const sorted = [...history].sort((a, b) => a - b);
        const p95Index = Math.floor(sorted.length * 0.95);
        const p95 = sorted[p95Index];
        // Use max of P95 + 20% buffer or base timeout
        return Math.max(baseTimeout, p95 * 1.2);
    }
}
exports.DeadlineManager = DeadlineManager;
// ═══════════════════════════════════════════════════════════════════════════════
// DEADLINE CONTEXT
// ═══════════════════════════════════════════════════════════════════════════════
class DeadlineContext {
    id;
    manager;
    constructor(id, manager) {
        this.id = id;
        this.manager = manager;
    }
    /**
     * Get remaining time
     */
    get remaining() {
        return this.manager.getRemaining(this.id);
    }
    /**
     * Check if expired
     */
    get isExpired() {
        return this.manager.isExpired(this.id);
    }
    /**
     * Throw if expired
     */
    // Complexity: O(1)
    checkDeadline() {
        if (this.isExpired) {
            throw new DeadlineExpiredError(this.id, 0);
        }
    }
    /**
     * Extend deadline
     */
    // Complexity: O(1)
    extend(additionalMs) {
        return this.manager.extend(this.id, additionalMs);
    }
    /**
     * Cancel
     */
    // Complexity: O(1)
    cancel() {
        this.manager.cancel(this.id);
    }
}
exports.DeadlineContext = DeadlineContext;
// ═══════════════════════════════════════════════════════════════════════════════
// ERRORS
// ═══════════════════════════════════════════════════════════════════════════════
class DeadlineExpiredError extends Error {
    deadlineId;
    timeout;
    constructor(deadlineId, timeout) {
        super(`Deadline ${deadlineId} expired after ${timeout}ms`);
        this.deadlineId = deadlineId;
        this.timeout = timeout;
        this.name = 'DeadlineExpiredError';
    }
}
exports.DeadlineExpiredError = DeadlineExpiredError;
// ═══════════════════════════════════════════════════════════════════════════════
// DECORATORS
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * @WithDeadline - Add deadline to method
 */
function WithDeadline(timeoutMs, options = {}) {
    return function (target, propertyKey, descriptor) {
        const original = descriptor.value;
        const methodName = String(propertyKey);
        descriptor.value = async function (...args) {
            const manager = DeadlineManager.getInstance();
            // SAFETY: async operation — wrap in try-catch for production resilience
            const result = await manager.withDeadline(methodName, timeoutMs, 
            // Complexity: O(1)
            async () => original.apply(this, args), options);
            if (result.expired) {
                throw new DeadlineExpiredError(methodName, timeoutMs);
            }
            return result.result;
        };
        return descriptor;
    };
}
/**
 * @AdaptiveDeadline - Add adaptive deadline to method
 */
function AdaptiveDeadline(baseTimeoutMs) {
    return function (target, propertyKey, descriptor) {
        const original = descriptor.value;
        const methodName = String(propertyKey);
        descriptor.value = async function (...args) {
            const manager = DeadlineManager.getInstance();
            // SAFETY: async operation — wrap in try-catch for production resilience
            const result = await manager.withAdaptiveDeadline(methodName, baseTimeoutMs, async () => original.apply(this, args));
            if (result.expired) {
                throw new DeadlineExpiredError(methodName, baseTimeoutMs);
            }
            return result.result;
        };
        return descriptor;
    };
}
// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════
const getDeadlineManager = () => DeadlineManager.getInstance();
exports.getDeadlineManager = getDeadlineManager;
exports.default = DeadlineManager;
