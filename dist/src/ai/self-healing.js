"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                               ║
 * ║   QANTUM SELF-HEALING ENGINE                                                  ║
 * ║   "Auto-repair tests, adapt to changes"                                       ║
 * ║                                                                               ║
 * ║   TODO B #36 - AI: Self-Healing Tests                                         ║
 * ║                                                                               ║
 * ║   © 2025-2026 QAntum | Dimitar Prodromov                                        ║
 * ║                                                                               ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSelfHealingEngine = exports.SelfHealingEngine = exports.SelectorGenerator = void 0;
exports.SelfHeal = SelfHeal;
// ═══════════════════════════════════════════════════════════════════════════════
// SELECTOR GENERATOR
// ═══════════════════════════════════════════════════════════════════════════════
class SelectorGenerator {
    /**
     * Generate alternative selectors for an element
     */
    static generateAlternatives(element) {
        const alternatives = [];
        // By ID (highest priority)
        if (element.id) {
            alternatives.push({
                selector: `#${element.id}`,
                type: 'id',
                confidence: 0.95,
                reason: 'Unique ID selector',
            });
        }
        // By data-testid
        if (element.attributes['data-testid']) {
            alternatives.push({
                selector: `[data-testid="${element.attributes['data-testid']}"]`,
                type: 'data-attribute',
                confidence: 0.9,
                reason: 'Test-specific data attribute',
            });
        }
        // By data-cy
        if (element.attributes['data-cy']) {
            alternatives.push({
                selector: `[data-cy="${element.attributes['data-cy']}"]`,
                type: 'data-attribute',
                confidence: 0.9,
                reason: 'Cypress data attribute',
            });
        }
        // By aria-label
        if (element.attributes['aria-label']) {
            alternatives.push({
                selector: `[aria-label="${element.attributes['aria-label']}"]`,
                type: 'aria',
                confidence: 0.85,
                reason: 'Accessibility attribute',
            });
        }
        // By role and name
        if (element.attributes['role']) {
            const name = element.attributes['aria-label'] || element.text;
            if (name) {
                alternatives.push({
                    selector: `[role="${element.attributes['role']}"][aria-label="${name}"]`,
                    type: 'aria',
                    confidence: 0.8,
                    reason: 'Role with name',
                });
            }
        }
        // By text content
        if (element.text && element.text.length < 50) {
            alternatives.push({
                selector: `//${element.tag}[contains(text(), "${element.text.trim()}")]`,
                type: 'xpath',
                confidence: 0.7,
                reason: 'Text content selector',
            });
        }
        // By class combination
        if (element.classes.length > 0) {
            const uniqueClasses = element.classes.filter((c) => !c.match(/^(ng-|_|[a-z]{10,})/) // Filter generated classes
            );
            if (uniqueClasses.length > 0) {
                alternatives.push({
                    selector: `${element.tag}.${uniqueClasses.join('.')}`,
                    type: 'class',
                    confidence: 0.6,
                    reason: 'Class combination',
                });
            }
        }
        // By structural path
        alternatives.push({
            selector: element.path,
            type: 'xpath',
            confidence: 0.5,
            reason: 'Structural path (may break on DOM changes)',
        });
        // By relative position to stable element
        if (element.parent?.id) {
            alternatives.push({
                selector: `#${element.parent.id} > ${element.tag}`,
                type: 'relative',
                confidence: 0.65,
                reason: 'Relative to parent with ID',
            });
        }
        return alternatives.sort((a, b) => b.confidence - a.confidence);
    }
    /**
     * Find best matching selector from alternatives
     */
    static findBestSelector(alternatives, validator) {
        // Return highest confidence by default
        if (!validator) {
            return alternatives[0] || null;
        }
        // Would validate against actual DOM in real implementation
        return alternatives[0] || null;
    }
}
exports.SelectorGenerator = SelectorGenerator;
// ═══════════════════════════════════════════════════════════════════════════════
// BUILT-IN STRATEGIES
// ═══════════════════════════════════════════════════════════════════════════════
const selectorNotFoundStrategy = {
    name: 'SelectorNotFound',
    priority: 1,
    canHeal: (failure) => {
        return (failure.errorType === 'ElementNotFoundError' ||
            failure.error.toLowerCase().includes('element not found') ||
            failure.error.toLowerCase().includes('no element') ||
            failure.error.toLowerCase().includes('selector'));
    },
    heal: async (failure) => {
        if (!failure.element) {
            return {
                healed: false,
                strategy: 'SelectorNotFound',
                confidence: 0,
                explanation: 'No element context available for healing',
                shouldSave: false,
            };
        }
        const alternatives = SelectorGenerator.generateAlternatives(failure.element);
        const best = SelectorGenerator.findBestSelector(alternatives);
        if (best && best.selector !== failure.selector) {
            return {
                healed: true,
                strategy: 'SelectorNotFound',
                originalSelector: failure.selector,
                newSelector: best.selector,
                confidence: best.confidence,
                explanation: `Healed using ${best.type} selector: ${best.reason}`,
                shouldSave: best.confidence > 0.7,
            };
        }
        return {
            healed: false,
            strategy: 'SelectorNotFound',
            confidence: 0,
            explanation: 'Could not find suitable alternative selector',
            shouldSave: false,
        };
    },
};
const timeoutStrategy = {
    name: 'Timeout',
    priority: 2,
    canHeal: (failure) => {
        return failure.errorType === 'TimeoutError' || failure.error.toLowerCase().includes('timeout');
    },
    heal: async (failure) => {
        // Suggest increased timeout or explicit wait
        return {
            healed: true,
            strategy: 'Timeout',
            confidence: 0.6,
            explanation: 'Suggest adding explicit wait or increasing timeout',
            shouldSave: false,
        };
    },
};
const staleElementStrategy = {
    name: 'StaleElement',
    priority: 3,
    canHeal: (failure) => {
        return (failure.errorType === 'StaleElementReferenceError' ||
            failure.error.toLowerCase().includes('stale element'));
    },
    heal: async (failure) => {
        return {
            healed: true,
            strategy: 'StaleElement',
            confidence: 0.7,
            explanation: 'Re-query element after DOM mutation',
            shouldSave: false,
        };
    },
};
const clickInterceptedStrategy = {
    name: 'ClickIntercepted',
    priority: 4,
    canHeal: (failure) => {
        return (failure.error.toLowerCase().includes('click intercepted') ||
            failure.error.toLowerCase().includes('other element would receive'));
    },
    heal: async (failure) => {
        return {
            healed: true,
            strategy: 'ClickIntercepted',
            confidence: 0.65,
            explanation: 'Scroll element into view or dismiss overlay',
            shouldSave: false,
        };
    },
};
// ═══════════════════════════════════════════════════════════════════════════════
// SELF-HEALING ENGINE
// ═══════════════════════════════════════════════════════════════════════════════
class SelfHealingEngine {
    static instance;
    strategies = [];
    history = new Map();
    selectorCache = new Map();
    constructor() {
        this.registerDefaultStrategies();
    }
    static getInstance() {
        if (!SelfHealingEngine.instance) {
            SelfHealingEngine.instance = new SelfHealingEngine();
        }
        return SelfHealingEngine.instance;
    }
    // ─────────────────────────────────────────────────────────────────────────
    // STRATEGY MANAGEMENT
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Register a healing strategy
     */
    // Complexity: O(N log N) — sort
    registerStrategy(strategy) {
        this.strategies.push(strategy);
        this.strategies.sort((a, b) => a.priority - b.priority);
    }
    /**
     * Unregister a strategy
     */
    // Complexity: O(1)
    unregisterStrategy(name) {
        const index = this.strategies.findIndex((s) => s.name === name);
        if (index >= 0) {
            this.strategies.splice(index, 1);
            return true;
        }
        return false;
    }
    /**
     * Get all strategies
     */
    // Complexity: O(1)
    getStrategies() {
        return [...this.strategies];
    }
    // ─────────────────────────────────────────────────────────────────────────
    // HEALING
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Attempt to heal a failure
     */
    // Complexity: O(N) — loop
    async heal(failure) {
        console.log(`[SelfHealing] Attempting to heal: ${failure.testName}`);
        // Check cache first
        if (failure.selector) {
            const cached = this.selectorCache.get(failure.selector);
            if (cached) {
                return {
                    healed: true,
                    strategy: 'Cache',
                    originalSelector: failure.selector,
                    newSelector: cached,
                    confidence: 0.85,
                    explanation: 'Using previously healed selector from cache',
                    shouldSave: false,
                };
            }
        }
        // Try each strategy
        for (const strategy of this.strategies) {
            if (strategy.canHeal(failure)) {
                try {
                    const result = await strategy.heal(failure);
                    if (result.healed) {
                        // Record in history
                        this.recordHealing(failure, result);
                        // Cache if confident
                        if (result.shouldSave && result.originalSelector && result.newSelector) {
                            this.selectorCache.set(result.originalSelector, result.newSelector);
                        }
                        console.log(`[SelfHealing] Healed using ${result.strategy}: ${result.explanation}`);
                        return result;
                    }
                }
                catch (error) {
                    console.warn(`[SelfHealing] Strategy ${strategy.name} failed:`, error);
                }
            }
        }
        return {
            healed: false,
            strategy: 'None',
            confidence: 0,
            explanation: 'No healing strategy could fix this failure',
            shouldSave: false,
        };
    }
    /**
     * Heal with retry
     */
    // Complexity: O(N*M) — nested iteration
    async healWithRetry(failure, executor, maxRetries = 3) {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            failure.attempt = attempt;
            // SAFETY: async operation — wrap in try-catch for production resilience
            const result = await this.heal(failure);
            if (result.healed && result.newSelector) {
                try {
                    await executor(result.newSelector);
                    // Mark as successful
                    this.markHealingSuccess(failure.testId, result.newSelector);
                    return true;
                }
                catch (error) {
                    // Update failure context for next attempt
                    failure.error = error.message;
                }
            }
        }
        return false;
    }
    // ─────────────────────────────────────────────────────────────────────────
    // HISTORY
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Get healing history for a test
     */
    // Complexity: O(1) — lookup
    getHistory(testId) {
        return this.history.get(testId) || [];
    }
    /**
     * Get all healing history
     */
    // Complexity: O(1)
    getAllHistory() {
        return new Map(this.history);
    }
    /**
     * Get healing statistics
     */
    // Complexity: O(N*M) — nested iteration
    getStatistics() {
        let total = 0;
        let successful = 0;
        const byStrategy = {};
        const testCounts = new Map();
        for (const [testId, entries] of this.history) {
            total += entries.length;
            testCounts.set(testId, entries.length);
            for (const entry of entries) {
                if (entry.successful)
                    successful++;
                byStrategy[entry.strategy] = (byStrategy[entry.strategy] || 0) + 1;
            }
        }
        const mostHealedTests = [...testCounts.entries()]
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([testId, count]) => ({ testId, count }));
        return {
            totalHealings: total,
            successfulHealings: successful,
            byStrategy,
            mostHealedTests,
        };
    }
    /**
     * Clear history
     */
    // Complexity: O(1)
    clearHistory() {
        this.history.clear();
    }
    // ─────────────────────────────────────────────────────────────────────────
    // SELECTOR MANAGEMENT
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Get cached selector
     */
    // Complexity: O(1) — lookup
    getCachedSelector(original) {
        return this.selectorCache.get(original);
    }
    /**
     * Clear selector cache
     */
    // Complexity: O(1)
    clearCache() {
        this.selectorCache.clear();
    }
    /**
     * Export selector mappings
     */
    // Complexity: O(1)
    exportMappings() {
        return Object.fromEntries(this.selectorCache);
    }
    /**
     * Import selector mappings
     */
    // Complexity: O(N) — loop
    importMappings(mappings) {
        for (const [key, value] of Object.entries(mappings)) {
            this.selectorCache.set(key, value);
        }
    }
    // ─────────────────────────────────────────────────────────────────────────
    // PRIVATE
    // ─────────────────────────────────────────────────────────────────────────
    // Complexity: O(1)
    registerDefaultStrategies() {
        this.registerStrategy(selectorNotFoundStrategy);
        this.registerStrategy(timeoutStrategy);
        this.registerStrategy(staleElementStrategy);
        this.registerStrategy(clickInterceptedStrategy);
    }
    // Complexity: O(1) — lookup
    recordHealing(failure, result) {
        const history = this.history.get(failure.testId) || [];
        history.push({
            testId: failure.testId,
            timestamp: Date.now(),
            original: failure.selector || '',
            healed: result.newSelector || '',
            strategy: result.strategy,
            successful: false, // Will be updated on success
        });
        // Keep last 100 entries per test
        this.history.set(failure.testId, history.slice(-100));
    }
    // Complexity: O(1) — lookup
    markHealingSuccess(testId, selector) {
        const history = this.history.get(testId);
        if (history && history.length > 0) {
            const last = history[history.length - 1];
            if (last.healed === selector) {
                last.successful = true;
            }
        }
    }
}
exports.SelfHealingEngine = SelfHealingEngine;
// ═══════════════════════════════════════════════════════════════════════════════
// DECORATORS
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * @SelfHeal - Enable self-healing for a test method
 */
function SelfHeal(maxRetries = 3) {
    return function (target, propertyKey, descriptor) {
        const original = descriptor.value;
        descriptor.value = async function (...args) {
            const engine = SelfHealingEngine.getInstance();
            try {
                return await original.apply(this, args);
            }
            catch (error) {
                // Attempt to heal
                const failure = {
                    testId: `${target.constructor.name}_${String(propertyKey)}`,
                    testName: String(propertyKey),
                    error: error.message,
                    errorType: error.name,
                    timestamp: Date.now(),
                    attempt: 1,
                };
                // SAFETY: async operation — wrap in try-catch for production resilience
                const result = await engine.heal(failure);
                if (result.healed) {
                    console.log(`[SelfHeal] Attempting retry with healed context`);
                    // SAFETY: async operation — wrap in try-catch for production resilience
                    return await original.apply(this, args);
                }
                throw error;
            }
        };
        return descriptor;
    };
}
// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════
const getSelfHealingEngine = () => SelfHealingEngine.getInstance();
exports.getSelfHealingEngine = getSelfHealingEngine;
exports.default = SelfHealingEngine;
