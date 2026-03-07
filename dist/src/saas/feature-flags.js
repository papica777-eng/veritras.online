"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                               ║
 * ║   QANTUM FEATURE FLAGS                                                        ║
 * ║   "Dynamic feature gating with A/B testing"                                   ║
 * ║                                                                               ║
 * ║   TODO B #49 - SaaS: Feature Flags                                            ║
 * ║                                                                               ║
 * ║   © 2025-2026 QAntum | Dimitar Prodromov                                        ║
 * ║                                                                               ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFeatureFlags = exports.FeatureFlagService = void 0;
exports.Feature = Feature;
exports.createFlag = createFlag;
// ═══════════════════════════════════════════════════════════════════════════════
// FEATURE FLAG SERVICE
// ═══════════════════════════════════════════════════════════════════════════════
class FeatureFlagService {
    static instance;
    flags = new Map();
    overrides = new Map();
    evaluationCache = new Map();
    listeners = new Set();
    static getInstance() {
        if (!FeatureFlagService.instance) {
            FeatureFlagService.instance = new FeatureFlagService();
        }
        return FeatureFlagService.instance;
    }
    // ─────────────────────────────────────────────────────────────────────────
    // FLAG MANAGEMENT
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Register a feature flag
     */
    // Complexity: O(1) — lookup
    register(flag) {
        this.flags.set(flag.key, flag);
        this.invalidateCache(flag.key);
    }
    /**
     * Register multiple flags
     */
    // Complexity: O(N) — loop
    registerAll(flags) {
        for (const flag of flags) {
            this.register(flag);
        }
    }
    /**
     * Update a flag
     */
    // Complexity: O(1) — lookup
    update(key, updates) {
        const existing = this.flags.get(key);
        if (!existing) {
            throw new Error(`Flag not found: ${key}`);
        }
        this.flags.set(key, {
            ...existing,
            ...updates,
            updatedAt: new Date().toISOString(),
        });
        this.invalidateCache(key);
        this.notifyListeners(key);
    }
    /**
     * Delete a flag
     */
    // Complexity: O(1)
    delete(key) {
        const result = this.flags.delete(key);
        this.invalidateCache(key);
        return result;
    }
    /**
     * Get flag definition
     */
    // Complexity: O(1) — lookup
    getFlag(key) {
        return this.flags.get(key);
    }
    /**
     * Get all flags
     */
    // Complexity: O(1)
    getAllFlags() {
        return [...this.flags.values()];
    }
    // ─────────────────────────────────────────────────────────────────────────
    // EVALUATION
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Evaluate a flag
     */
    // Complexity: O(1) — lookup
    evaluate(key, context = {}) {
        const cacheKey = this.getCacheKey(key, context);
        const cached = this.evaluationCache.get(cacheKey);
        if (cached)
            return cached;
        const result = this.doEvaluate(key, context);
        this.evaluationCache.set(cacheKey, result);
        return result;
    }
    /**
     * Get boolean flag value
     */
    // Complexity: O(1)
    isEnabled(key, context = {}) {
        return Boolean(this.evaluate(key, context).value);
    }
    /**
     * Get string flag value
     */
    // Complexity: O(1)
    getString(key, defaultValue, context = {}) {
        const result = this.evaluate(key, context);
        return typeof result.value === 'string' ? result.value : defaultValue;
    }
    /**
     * Get number flag value
     */
    // Complexity: O(1)
    getNumber(key, defaultValue, context = {}) {
        const result = this.evaluate(key, context);
        return typeof result.value === 'number' ? result.value : defaultValue;
    }
    /**
     * Get JSON flag value
     */
    getJSON(key, defaultValue, context = {}) {
        const result = this.evaluate(key, context);
        return result.value ?? defaultValue;
    }
    // ─────────────────────────────────────────────────────────────────────────
    // OVERRIDES
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Set a local override
     */
    // Complexity: O(1) — lookup
    setOverride(key, value) {
        this.overrides.set(key, value);
        this.invalidateCache(key);
    }
    /**
     * Remove an override
     */
    // Complexity: O(1)
    removeOverride(key) {
        this.overrides.delete(key);
        this.invalidateCache(key);
    }
    /**
     * Clear all overrides
     */
    // Complexity: O(1)
    clearOverrides() {
        this.overrides.clear();
        this.evaluationCache.clear();
    }
    // ─────────────────────────────────────────────────────────────────────────
    // A/B TESTING
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Get variation for A/B test
     */
    // Complexity: O(N) — linear scan
    getVariation(key, context = {}) {
        const flag = this.flags.get(key);
        if (!flag?.variations?.length)
            return null;
        const result = this.evaluate(key, context);
        return flag.variations.find((v) => v.id === result.variationId) || null;
    }
    /**
     * Track conversion for A/B test
     */
    // Complexity: O(1)
    trackConversion(key, context = {}) {
        const result = this.evaluate(key, context);
        console.log(`[FeatureFlags] Conversion: ${key}, variation: ${result.variationId}`);
        // In real implementation, send to analytics
    }
    // ─────────────────────────────────────────────────────────────────────────
    // LISTENERS
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Subscribe to flag changes
     */
    // Complexity: O(1)
    subscribe(callback) {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback);
    }
    // ─────────────────────────────────────────────────────────────────────────
    // PRIVATE
    // ─────────────────────────────────────────────────────────────────────────
    // Complexity: O(N log N) — sort
    doEvaluate(key, context) {
        // Check override first
        if (this.overrides.has(key)) {
            return {
                key,
                value: this.overrides.get(key),
                reason: 'fallback',
                evaluatedAt: Date.now(),
            };
        }
        const flag = this.flags.get(key);
        // Flag not found
        if (!flag) {
            return {
                key,
                value: undefined,
                reason: 'fallback',
                evaluatedAt: Date.now(),
            };
        }
        // Flag disabled
        if (!flag.enabled) {
            return {
                key,
                value: flag.defaultValue,
                reason: 'default',
                evaluatedAt: Date.now(),
            };
        }
        // Check user targets
        if (context.userId && flag.targets) {
            const target = flag.targets.find((t) => t.userId === context.userId);
            if (target) {
                const variation = flag.variations?.find((v) => v.id === target.variation);
                return {
                    key,
                    value: variation?.value ?? flag.defaultValue,
                    variationId: target.variation,
                    reason: 'target',
                    evaluatedAt: Date.now(),
                };
            }
        }
        // Check rules
        if (flag.rules && context.userAttributes) {
            const sortedRules = [...flag.rules].sort((a, b) => a.priority - b.priority);
            for (const rule of sortedRules) {
                if (this.evaluateRule(rule, context)) {
                    const variation = flag.variations?.find((v) => v.id === rule.variation);
                    return {
                        key,
                        value: variation?.value ?? flag.defaultValue,
                        variationId: rule.variation,
                        reason: 'rule',
                        evaluatedAt: Date.now(),
                    };
                }
            }
        }
        // Percentage rollout
        if (flag.percentage !== undefined && context.userId) {
            const hash = this.hashUserId(context.userId + key);
            const bucket = hash % 100;
            if (bucket < flag.percentage) {
                // Select variation by weight
                const variation = this.selectVariation(flag.variations || [], context.userId, key);
                return {
                    key,
                    value: variation?.value ?? true,
                    variationId: variation?.id,
                    reason: 'percentage',
                    evaluatedAt: Date.now(),
                };
            }
        }
        // Default value
        return {
            key,
            value: flag.defaultValue,
            reason: 'default',
            evaluatedAt: Date.now(),
        };
    }
    // Complexity: O(N) — loop
    evaluateRule(rule, context) {
        for (const condition of rule.conditions) {
            const value = context.userAttributes?.[condition.attribute];
            if (!this.evaluateCondition(condition, value)) {
                return false;
            }
        }
        return true;
    }
    // Complexity: O(1)
    evaluateCondition(condition, value) {
        const { operator, value: conditionValue } = condition;
        switch (operator) {
            case 'equals':
                return value === conditionValue;
            case 'not_equals':
                return value !== conditionValue;
            case 'contains':
                return String(value).includes(String(conditionValue));
            case 'starts_with':
                return String(value).startsWith(String(conditionValue));
            case 'ends_with':
                return String(value).endsWith(String(conditionValue));
            case 'greater_than':
                return Number(value) > Number(conditionValue);
            case 'less_than':
                return Number(value) < Number(conditionValue);
            case 'in':
                return Array.isArray(conditionValue) && conditionValue.includes(value);
            case 'not_in':
                return Array.isArray(conditionValue) && !conditionValue.includes(value);
            case 'regex':
                return new RegExp(String(conditionValue)).test(String(value));
            default:
                return false;
        }
    }
    // Complexity: O(N) — linear scan
    selectVariation(variations, userId, flagKey) {
        if (variations.length === 0)
            return undefined;
        if (variations.length === 1)
            return variations[0];
        const totalWeight = variations.reduce((sum, v) => sum + (v.weight || 1), 0);
        const hash = this.hashUserId(userId + flagKey + 'variation');
        const bucket = hash % totalWeight;
        let cumulative = 0;
        for (const variation of variations) {
            cumulative += variation.weight || 1;
            if (bucket < cumulative) {
                return variation;
            }
        }
        return variations[0];
    }
    // Complexity: O(N) — loop
    hashUserId(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash = hash & hash;
        }
        return Math.abs(hash);
    }
    // Complexity: O(1)
    getCacheKey(key, context) {
        return `${key}:${context.userId || 'anon'}:${context.environment || 'default'}`;
    }
    // Complexity: O(N) — loop
    invalidateCache(key) {
        for (const cacheKey of this.evaluationCache.keys()) {
            if (cacheKey.startsWith(key + ':')) {
                this.evaluationCache.delete(cacheKey);
            }
        }
    }
    // Complexity: O(N) — loop
    notifyListeners(key) {
        const flag = this.flags.get(key);
        for (const listener of this.listeners) {
            try {
                // Complexity: O(1)
                listener(key, flag?.defaultValue);
            }
            catch (error) {
                console.error('[FeatureFlags] Listener error:', error);
            }
        }
    }
}
exports.FeatureFlagService = FeatureFlagService;
// ═══════════════════════════════════════════════════════════════════════════════
// DECORATORS
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * @Feature - Guard method with feature flag
 */
function Feature(flagKey, fallback) {
    return function (target, propertyKey, descriptor) {
        const original = descriptor.value;
        descriptor.value = function (...args) {
            const flags = FeatureFlagService.getInstance();
            if (!flags.isEnabled(flagKey)) {
                if (fallback !== undefined) {
                    return typeof fallback === 'function' ? fallback() : fallback;
                }
                throw new Error(`Feature '${flagKey}' is disabled`);
            }
            return original.apply(this, args);
        };
        return descriptor;
    };
}
// ═══════════════════════════════════════════════════════════════════════════════
// HELPER
// ═══════════════════════════════════════════════════════════════════════════════
function createFlag(key, defaultValue, options = {}) {
    return {
        key,
        name: options.name || key,
        enabled: options.enabled ?? true,
        defaultValue,
        ...options,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
}
// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════
const getFeatureFlags = () => FeatureFlagService.getInstance();
exports.getFeatureFlags = getFeatureFlags;
exports.default = FeatureFlagService;
