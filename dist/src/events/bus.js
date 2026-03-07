"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                               ║
 * ║   QAntum EVENT BUS                                                            ║
 * ║   "Enterprise event-driven architecture"                                      ║
 * ║                                                                               ║
 * ║   TODO B #41 - Events: Event bus system                                       ║
 * ║                                                                               ║
 * ║   © 2025-2026 QAntum | Dimitar Prodromov                                        ║
 * ║                                                                               ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.events = exports.getEventBus = exports.EventBus = void 0;
// ═══════════════════════════════════════════════════════════════════════════════
// EVENT BUS
// ═══════════════════════════════════════════════════════════════════════════════
class EventBus {
    static instance;
    subscriptions = new Map();
    wildcardSubscriptions = [];
    config;
    middleware = [];
    eventHistory = [];
    subscriptionCounter = 0;
    constructor(config = {}) {
        this.config = {
            maxListeners: config.maxListeners || 100,
            asyncMode: config.asyncMode ?? true,
            errorHandler: config.errorHandler || this.defaultErrorHandler,
            middleware: config.middleware || [],
        };
        this.middleware = [...this.config.middleware];
    }
    static getInstance(config) {
        if (!EventBus.instance) {
            EventBus.instance = new EventBus(config);
        }
        return EventBus.instance;
    }
    static configure(config) {
        EventBus.instance = new EventBus(config);
        return EventBus.instance;
    }
    // ─────────────────────────────────────────────────────────────────────────
    // SUBSCRIPTION
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Subscribe to event
     */
    on(type, handler, options) {
        return this.subscribe(type, handler, {
            filter: options?.filter,
            priority: options?.priority || 0,
            once: false,
        });
    }
    /**
     * Subscribe once
     */
    once(type, handler) {
        return this.subscribe(type, handler, { once: true, priority: 0 });
    }
    /**
     * Subscribe to all events
     */
    // Complexity: O(1)
    onAll(handler) {
        return this.subscribe('*', handler, { once: false, priority: 0 });
    }
    // Complexity: O(1)
    subscribe(type, handler, options) {
        const id = `sub_${++this.subscriptionCounter}`;
        const subscription = {
            id,
            type,
            handler,
            filter: options.filter,
            once: options.once,
            priority: options.priority,
            unsubscribe: () => this.unsubscribe(id),
        };
        if (type === '*') {
            this.wildcardSubscriptions.push(subscription);
            this.wildcardSubscriptions.sort((a, b) => b.priority - a.priority);
        }
        else {
            if (!this.subscriptions.has(type)) {
                this.subscriptions.set(type, []);
            }
            const subs = this.subscriptions.get(type);
            if (subs.length >= this.config.maxListeners) {
                console.warn(`Max listeners (${this.config.maxListeners}) reached for event "${type}"`);
            }
            subs.push(subscription);
            subs.sort((a, b) => b.priority - a.priority);
        }
        return subscription;
    }
    /**
     * Unsubscribe
     */
    // Complexity: O(N) — linear scan
    off(type, handler) {
        if (type === '*') {
            if (handler) {
                this.wildcardSubscriptions = this.wildcardSubscriptions.filter((s) => s.handler !== handler);
            }
            else {
                this.wildcardSubscriptions = [];
            }
            return;
        }
        if (!this.subscriptions.has(type))
            return;
        if (handler) {
            const subs = this.subscriptions.get(type);
            this.subscriptions.set(type, subs.filter((s) => s.handler !== handler));
        }
        else {
            this.subscriptions.delete(type);
        }
    }
    // Complexity: O(N) — linear scan
    unsubscribe(id) {
        for (const [type, subs] of this.subscriptions) {
            const filtered = subs.filter((s) => s.id !== id);
            if (filtered.length !== subs.length) {
                this.subscriptions.set(type, filtered);
                return;
            }
        }
        this.wildcardSubscriptions = this.wildcardSubscriptions.filter((s) => s.id !== id);
    }
    // ─────────────────────────────────────────────────────────────────────────
    // EMISSION
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Emit event
     */
    async emit(type, payload, metadata) {
        const event = {
            type,
            payload,
            timestamp: Date.now(),
            id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            metadata,
        };
        // Store in history
        this.eventHistory.push(event);
        if (this.eventHistory.length > 1000) {
            this.eventHistory.shift();
        }
        // Run through middleware
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.runMiddleware(event, async () => {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.notifySubscribers(event);
        });
    }
    /**
     * Emit sync
     */
    emitSync(type, payload) {
        const event = {
            type,
            payload,
            timestamp: Date.now(),
            id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        };
        this.notifySubscribersSync(event);
    }
    // Complexity: O(N*M) — nested iteration
    async notifySubscribers(event) {
        const subscribers = this.getSubscribers(event.type);
        const toRemove = [];
        for (const sub of subscribers) {
            // Check filter
            if (sub.filter && !sub.filter(event)) {
                continue;
            }
            try {
                if (this.config.asyncMode) {
                    await sub.handler(event);
                }
                else {
                    sub.handler(event);
                }
            }
            catch (error) {
                this.config.errorHandler(error, event);
            }
            if (sub.once) {
                toRemove.push(sub.id);
            }
        }
        // Remove once subscriptions
        for (const id of toRemove) {
            this.unsubscribe(id);
        }
    }
    // Complexity: O(N) — linear scan
    notifySubscribersSync(event) {
        const subscribers = this.getSubscribers(event.type);
        for (const sub of subscribers) {
            if (sub.filter && !sub.filter(event))
                continue;
            try {
                sub.handler(event);
            }
            catch (error) {
                this.config.errorHandler(error, event);
            }
        }
    }
    // Complexity: O(1) — lookup
    getSubscribers(type) {
        const specific = this.subscriptions.get(type) || [];
        return [...specific, ...this.wildcardSubscriptions];
    }
    // ─────────────────────────────────────────────────────────────────────────
    // MIDDLEWARE
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Add middleware
     */
    // Complexity: O(1)
    use(middleware) {
        this.middleware.push(middleware);
    }
    // Complexity: O(1)
    async runMiddleware(event, final) {
        const middlewares = [...this.middleware];
        let index = 0;
        const next = async () => {
            if (index < middlewares.length) {
                const mw = middlewares[index++];
                // SAFETY: async operation — wrap in try-catch for production resilience
                await mw(event, next);
            }
            else {
                // SAFETY: async operation — wrap in try-catch for production resilience
                await final();
            }
        };
        // SAFETY: async operation — wrap in try-catch for production resilience
        await next();
    }
    // ─────────────────────────────────────────────────────────────────────────
    // UTILITIES
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Get event history
     */
    // Complexity: O(N) — linear scan
    getHistory(type) {
        if (type) {
            return this.eventHistory.filter((e) => e.type === type);
        }
        return [...this.eventHistory];
    }
    /**
     * Clear history
     */
    // Complexity: O(1)
    clearHistory() {
        this.eventHistory = [];
    }
    /**
     * Get listener count
     */
    // Complexity: O(N) — loop
    listenerCount(type) {
        if (type) {
            return (this.subscriptions.get(type)?.length || 0) + this.wildcardSubscriptions.length;
        }
        let count = this.wildcardSubscriptions.length;
        for (const subs of this.subscriptions.values()) {
            count += subs.length;
        }
        return count;
    }
    /**
     * Get event types
     */
    // Complexity: O(1)
    eventTypes() {
        return [...this.subscriptions.keys()];
    }
    /**
     * Remove all listeners
     */
    // Complexity: O(1)
    removeAllListeners(type) {
        if (type) {
            this.subscriptions.delete(type);
        }
        else {
            this.subscriptions.clear();
            this.wildcardSubscriptions = [];
        }
    }
    /**
     * Wait for event
     */
    waitFor(type, timeout) {
        return new Promise((resolve, reject) => {
            const timeoutId = timeout
                ? setTimeout(() => {
                    this.off(type, handler);
                    // Complexity: O(N)
                    reject(new Error(`Timeout waiting for event "${type}"`));
                }, timeout)
                : null;
            const handler = (event) => {
                if (timeoutId)
                    clearTimeout(timeoutId);
                // Complexity: O(1)
                resolve(event);
            };
            this.once(type, handler);
        });
    }
    // Complexity: O(1)
    defaultErrorHandler(error, event) {
        console.error(`Error handling event "${event.type}":`, error);
    }
}
exports.EventBus = EventBus;
// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════
const getEventBus = () => EventBus.getInstance();
exports.getEventBus = getEventBus;
// Quick event operations
exports.events = {
    on: (type, handler) => EventBus.getInstance().on(type, handler),
    once: (type, handler) => EventBus.getInstance().once(type, handler),
    off: (type, handler) => EventBus.getInstance().off(type, handler),
    emit: (type, payload) => EventBus.getInstance().emit(type, payload),
    emitSync: (type, payload) => EventBus.getInstance().emitSync(type, payload),
    waitFor: (type, timeout) => EventBus.getInstance().waitFor(type, timeout),
    history: (type) => EventBus.getInstance().getHistory(type),
};
exports.default = EventBus;
