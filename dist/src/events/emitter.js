"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                               ║
 * ║   QAntum EVENT EMITTER                                                        ║
 * ║   "TypeScript-first event emitter with type safety"                           ║
 * ║                                                                               ║
 * ║   TODO B #42 - Events: Typed emitter                                          ║
 * ║                                                                               ║
 * ║   © 2025-2026 QAntum | Dimitar Prodromov                                        ║
 * ║                                                                               ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObservableEmitter = exports.TypedEmitter = void 0;
exports.createEmitter = createEmitter;
exports.createObservable = createObservable;
// ═══════════════════════════════════════════════════════════════════════════════
// TYPED EMITTER
// ═══════════════════════════════════════════════════════════════════════════════
class TypedEmitter {
    listeners = new Map();
    onceListeners = new Map();
    /**
     * Add listener
     */
    on(event, listener) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event).add(listener);
        return this;
    }
    /**
     * Add one-time listener
     */
    once(event, listener) {
        if (!this.onceListeners.has(event)) {
            this.onceListeners.set(event, new Set());
        }
        this.onceListeners.get(event).add(listener);
        return this;
    }
    /**
     * Remove listener
     */
    off(event, listener) {
        this.listeners.get(event)?.delete(listener);
        this.onceListeners.get(event)?.delete(listener);
        return this;
    }
    /**
     * Remove all listeners for event
     */
    removeAllListeners(event) {
        if (event) {
            this.listeners.delete(event);
            this.onceListeners.delete(event);
        }
        else {
            this.listeners.clear();
            this.onceListeners.clear();
        }
        return this;
    }
    /**
     * Emit event
     */
    emit(event, payload) {
        const regularListeners = this.listeners.get(event);
        const onceListeners = this.onceListeners.get(event);
        let hadListeners = false;
        if (regularListeners?.size) {
            hadListeners = true;
            for (const listener of regularListeners) {
                // Complexity: O(1)
                listener(payload);
            }
        }
        if (onceListeners?.size) {
            hadListeners = true;
            for (const listener of onceListeners) {
                // Complexity: O(1)
                listener(payload);
            }
            this.onceListeners.delete(event);
        }
        return hadListeners;
    }
    /**
     * Emit async
     */
    async emitAsync(event, payload) {
        const regularListeners = this.listeners.get(event);
        const onceListeners = this.onceListeners.get(event);
        const promises = [];
        if (regularListeners) {
            for (const listener of regularListeners) {
                promises.push(Promise.resolve(listener(payload)));
            }
        }
        if (onceListeners) {
            for (const listener of onceListeners) {
                promises.push(Promise.resolve(listener(payload)));
            }
            this.onceListeners.delete(event);
        }
        // SAFETY: async operation — wrap in try-catch for production resilience
        await Promise.all(promises);
    }
    /**
     * Get listener count
     */
    listenerCount(event) {
        return (this.listeners.get(event)?.size || 0) + (this.onceListeners.get(event)?.size || 0);
    }
    /**
     * Get registered events
     */
    // Complexity: O(N*M) — nested iteration
    eventNames() {
        const events = new Set();
        for (const key of this.listeners.keys())
            events.add(key);
        for (const key of this.onceListeners.keys())
            events.add(key);
        return [...events];
    }
    /**
     * Wait for event
     */
    waitFor(event, timeout) {
        return new Promise((resolve, reject) => {
            const timeoutId = timeout
                ? setTimeout(() => {
                    this.off(event, handler);
                    // Complexity: O(N)
                    reject(new Error(`Timeout waiting for event "${String(event)}"`));
                }, timeout)
                : null;
            const handler = (payload) => {
                if (timeoutId)
                    clearTimeout(timeoutId);
                // Complexity: O(1)
                resolve(payload);
            };
            this.once(event, handler);
        });
    }
}
exports.TypedEmitter = TypedEmitter;
class ObservableEmitter {
    observers = new Set();
    completed = false;
    lastValue;
    hasValue = false;
    /**
     * Subscribe to emissions
     */
    // Complexity: O(1)
    subscribe(observer) {
        if (this.completed) {
            if (typeof observer === 'function') {
                return { unsubscribe: () => { } };
            }
            observer.complete?.();
            return { unsubscribe: () => { } };
        }
        const obs = typeof observer === 'function' ? { next: observer } : observer;
        this.observers.add(obs);
        // Emit last value to new subscriber (behavior subject style)
        if (this.hasValue && this.lastValue !== undefined) {
            obs.next(this.lastValue);
        }
        return {
            unsubscribe: () => this.observers.delete(obs),
        };
    }
    /**
     * Emit value
     */
    // Complexity: O(N) — loop
    next(value) {
        if (this.completed)
            return;
        this.lastValue = value;
        this.hasValue = true;
        for (const observer of this.observers) {
            try {
                observer.next(value);
            }
            catch (error) {
                observer.error?.(error);
            }
        }
    }
    /**
     * Emit error
     */
    // Complexity: O(N) — loop
    error(error) {
        if (this.completed)
            return;
        for (const observer of this.observers) {
            observer.error?.(error);
        }
    }
    /**
     * Complete stream
     */
    // Complexity: O(N) — loop
    complete() {
        if (this.completed)
            return;
        this.completed = true;
        for (const observer of this.observers) {
            observer.complete?.();
        }
        this.observers.clear();
    }
    /**
     * Get current value
     */
    // Complexity: O(1)
    getValue() {
        return this.lastValue;
    }
    /**
     * Is completed
     */
    // Complexity: O(1)
    isCompleted() {
        return this.completed;
    }
    /**
     * Map values
     */
    map(transform) {
        const mapped = new ObservableEmitter();
        this.subscribe({
            next: (value) => mapped.next(transform(value)),
            error: (err) => mapped.error(err),
            complete: () => mapped.complete(),
        });
        return mapped;
    }
    /**
     * Filter values
     */
    // Complexity: O(1)
    filter(predicate) {
        const filtered = new ObservableEmitter();
        this.subscribe({
            next: (value) => {
                if (predicate(value)) {
                    filtered.next(value);
                }
            },
            error: (err) => filtered.error(err),
            complete: () => filtered.complete(),
        });
        return filtered;
    }
    /**
     * Take n values
     */
    // Complexity: O(1)
    take(count) {
        const taken = new ObservableEmitter();
        let remaining = count;
        this.subscribe({
            next: (value) => {
                if (remaining > 0) {
                    remaining--;
                    taken.next(value);
                    if (remaining === 0) {
                        taken.complete();
                    }
                }
            },
            error: (err) => taken.error(err),
            complete: () => taken.complete(),
        });
        return taken;
    }
}
exports.ObservableEmitter = ObservableEmitter;
// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════
function createEmitter() {
    return new TypedEmitter();
}
function createObservable(initialValue) {
    const observable = new ObservableEmitter();
    if (initialValue !== undefined) {
        observable.next(initialValue);
    }
    return observable;
}
exports.default = TypedEmitter;
