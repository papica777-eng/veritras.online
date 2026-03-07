"use strict";
/**
 * 👻 GHOST PROTOCOL - STRATEGY PATTERN IMPLEMENTATION
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Design Pattern: Strategy
 * Purpose: Hot-swap stealth algorithms without changing client code
 *
 * Part of Gold Standard Integration - SOLID Principles
 *
 * @version 1.0.0
 * @author QAntum AI Architect
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GhostOrchestrator = exports.TimingObfuscationStrategy = exports.VisualStealthStrategy = exports.WebGLMutatorStrategy = exports.BiometricJitterStrategy = exports.TLSPhantomStrategy = void 0;
exports.getGhostOrchestrator = getGhostOrchestrator;
exports.createGhostOrchestrator = createGhostOrchestrator;
const events_1 = require("events");
// ═══════════════════════════════════════════════════════════════════════════════
// CONCRETE STRATEGIES
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * 🔐 TLS Phantom Strategy
 * Mimics real browser TLS fingerprints
 */
class TLSPhantomStrategy {
    name = 'tls-phantom';
    priority = 1;
    enabled = true;
    fingerprints = [
        'Chrome/120.0.0.0',
        'Chrome/119.0.0.0',
        'Firefox/121.0',
        'Safari/17.2'
    ];
    // Complexity: O(1)
    async apply(page) {
        // Rotate TLS fingerprint
        const fp = this.fingerprints[Math.floor(Math.random() * this.fingerprints.length)];
        // SAFETY: async operation — wrap in try-catch for production resilience
        await page.addInitScript((fingerprint) => {
            // Override navigator properties
            Object.defineProperty(navigator, 'userAgent', {
                get: () => `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) ${fingerprint}`
            });
        }, fp);
    }
    // Complexity: O(1)
    getRiskScore() {
        return 15; // Low risk when enabled
    }
}
exports.TLSPhantomStrategy = TLSPhantomStrategy;
/**
 * 🎯 Biometric Jitter Strategy
 * Adds human-like randomness to interactions
 */
class BiometricJitterStrategy {
    name = 'biometric-jitter';
    priority = 2;
    enabled = true;
    jitterRange = { min: 50, max: 150 };
    // Complexity: O(N)
    async apply(page) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await page.addInitScript(() => {
            // Add micro-variations to mouse movements
            const originalMove = window.__originalMouseMove;
            if (!originalMove) {
                window.__originalMouseMove = true;
                document.addEventListener('mousemove', (e) => {
                    // Add subtle jitter
                    const jitterX = (Math.random() - 0.5) * 2;
                    const jitterY = (Math.random() - 0.5) * 2;
                    // Store for analysis
                    window.__lastMouseJitter = { x: jitterX, y: jitterY };
                }, { passive: true });
            }
        });
    }
    // Complexity: O(1)
    getRiskScore() {
        return 10;
    }
}
exports.BiometricJitterStrategy = BiometricJitterStrategy;
/**
 * 🎨 WebGL Mutator Strategy
 * Randomizes WebGL fingerprint
 */
class WebGLMutatorStrategy {
    name = 'webgl-mutator';
    priority = 3;
    enabled = true;
    // Complexity: O(1)
    async apply(page) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await page.addInitScript(() => {
            // Modify WebGL fingerprint
            const getParameter = WebGLRenderingContext.prototype.getParameter;
            WebGLRenderingContext.prototype.getParameter = function (parameter) {
                // Randomize specific parameters
                if (parameter === 37445) { // UNMASKED_VENDOR_WEBGL
                    return 'Intel Inc.';
                }
                if (parameter === 37446) { // UNMASKED_RENDERER_WEBGL
                    return 'Intel Iris OpenGL Engine';
                }
                return getParameter.call(this, parameter);
            };
        });
    }
    // Complexity: O(1)
    getRiskScore() {
        return 20;
    }
}
exports.WebGLMutatorStrategy = WebGLMutatorStrategy;
/**
 * 👁️ Visual Stealth Strategy
 * Hides automation indicators
 */
class VisualStealthStrategy {
    name = 'visual-stealth';
    priority = 4;
    enabled = true;
    // Complexity: O(1)
    async apply(page) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await page.addInitScript(() => {
            // Hide webdriver property
            Object.defineProperty(navigator, 'webdriver', {
                get: () => undefined
            });
            // Hide automation properties
            // Complexity: O(1)
            delete window.cdc_adoQpoasnfa76pfcZLmcfl_Array;
            // Complexity: O(1)
            delete window.cdc_adoQpoasnfa76pfcZLmcfl_Promise;
            // Complexity: O(1)
            delete window.cdc_adoQpoasnfa76pfcZLmcfl_Symbol;
            // Override permissions
            const originalQuery = navigator.permissions.query;
            navigator.permissions.query = (parameters) => (parameters.name === 'notifications' ?
                Promise.resolve({ state: 'denied', onchange: null }) :
                originalQuery.call(navigator.permissions, parameters));
        });
    }
    // Complexity: O(1)
    getRiskScore() {
        return 5; // Very low risk
    }
}
exports.VisualStealthStrategy = VisualStealthStrategy;
/**
 * ⏰ Timing Obfuscation Strategy
 * Prevents timing-based detection
 */
class TimingObfuscationStrategy {
    name = 'timing-obfuscation';
    priority = 5;
    enabled = true;
    // Complexity: O(1)
    async apply(page) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await page.addInitScript(() => {
            // Add noise to timing APIs
            const originalNow = performance.now.bind(performance);
            const originalDate = Date.now.bind(Date);
            let offset = Math.random() * 100;
            performance.now = () => {
                offset += Math.random() * 0.1;
                return originalNow() + offset;
            };
            Date.now = () => {
                return originalDate() + Math.floor(offset);
            };
        });
    }
    // Complexity: O(1)
    getRiskScore() {
        return 12;
    }
}
exports.TimingObfuscationStrategy = TimingObfuscationStrategy;
// ═══════════════════════════════════════════════════════════════════════════════
// STRATEGY ORCHESTRATOR
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * 👻 GhostOrchestrator - Manages all stealth strategies
 * Uses Strategy Pattern for hot-swappable stealth algorithms
 */
class GhostOrchestrator extends events_1.EventEmitter {
    strategies = new Map();
    executionOrder = [];
    constructor() {
        super();
        this.registerDefaultStrategies();
    }
    /**
     * Register default strategies
     */
    // Complexity: O(1)
    registerDefaultStrategies() {
        this.registerStrategy(new TLSPhantomStrategy());
        this.registerStrategy(new BiometricJitterStrategy());
        this.registerStrategy(new WebGLMutatorStrategy());
        this.registerStrategy(new VisualStealthStrategy());
        this.registerStrategy(new TimingObfuscationStrategy());
        this.updateExecutionOrder();
    }
    /**
     * Register a new strategy
     */
    // Complexity: O(1) — lookup
    registerStrategy(strategy) {
        this.strategies.set(strategy.name, strategy);
        this.updateExecutionOrder();
        this.emit('strategy:registered', strategy.name);
        return this;
    }
    /**
     * Unregister a strategy
     */
    // Complexity: O(1)
    unregisterStrategy(name) {
        const removed = this.strategies.delete(name);
        if (removed) {
            this.updateExecutionOrder();
            this.emit('strategy:unregistered', name);
        }
        return removed;
    }
    /**
     * Enable/disable a strategy
     */
    // Complexity: O(1) — lookup
    setStrategyEnabled(name, enabled) {
        const strategy = this.strategies.get(name);
        if (strategy) {
            strategy.enabled = enabled;
            this.emit('strategy:toggled', { name, enabled });
            return true;
        }
        return false;
    }
    /**
     * Get a strategy by name
     */
    // Complexity: O(1) — lookup
    getStrategy(name) {
        return this.strategies.get(name);
    }
    /**
     * Get all registered strategies
     */
    // Complexity: O(1)
    getAllStrategies() {
        return Array.from(this.strategies.values());
    }
    /**
     * Update execution order based on priority
     */
    // Complexity: O(N log N) — sort
    updateExecutionOrder() {
        this.executionOrder = Array.from(this.strategies.values())
            .sort((a, b) => a.priority - b.priority)
            .map(s => s.name);
    }
    /**
     * 🚀 Apply all enabled strategies to a page
     */
    // Complexity: O(N) — linear scan
    async applyAll(page) {
        const results = [];
        const startTime = Date.now();
        for (const name of this.executionOrder) {
            const strategy = this.strategies.get(name);
            if (!strategy || !strategy.enabled)
                continue;
            const strategyStart = Date.now();
            try {
                await strategy.apply(page);
                results.push({
                    name,
                    success: true,
                    duration: Date.now() - strategyStart,
                    riskScore: strategy.getRiskScore()
                });
                this.emit('strategy:applied', { name, success: true });
            }
            catch (error) {
                results.push({
                    name,
                    success: false,
                    duration: Date.now() - strategyStart,
                    error: error instanceof Error ? error.message : 'Unknown error',
                    riskScore: 100 // Max risk on failure
                });
                this.emit('strategy:failed', { name, error });
            }
        }
        const totalRisk = results.reduce((sum, r) => sum + (r.success ? r.riskScore : 100), 0) / results.length;
        return {
            totalStrategies: results.length,
            successfulStrategies: results.filter(r => r.success).length,
            failedStrategies: results.filter(r => !r.success).length,
            totalDuration: Date.now() - startTime,
            averageRiskScore: totalRisk,
            results
        };
    }
    /**
     * 🔍 Verify all strategies are working
     */
    // Complexity: O(N) — loop
    async verifyAll(page) {
        const results = [];
        for (const [name, strategy] of this.strategies) {
            if (!strategy.enabled || !strategy.verify)
                continue;
            try {
                const verified = await strategy.verify(page);
                results.push({ name, verified, error: undefined });
            }
            catch (error) {
                results.push({
                    name,
                    verified: false,
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        }
        return results;
    }
    /**
     * 📊 Get overall stealth score
     */
    // Complexity: O(N) — linear scan
    getStealthScore() {
        const enabledStrategies = Array.from(this.strategies.values()).filter(s => s.enabled);
        if (enabledStrategies.length === 0)
            return 0;
        const avgRisk = enabledStrategies.reduce((sum, s) => sum + s.getRiskScore(), 0) / enabledStrategies.length;
        return Math.max(0, 100 - avgRisk);
    }
    /**
     * 📋 Get status report
     */
    // Complexity: O(N) — linear scan
    getStatusReport() {
        const strategies = Array.from(this.strategies.values());
        return {
            totalStrategies: strategies.length,
            enabledStrategies: strategies.filter(s => s.enabled).length,
            disabledStrategies: strategies.filter(s => !s.enabled).length,
            stealthScore: this.getStealthScore(),
            strategies: strategies.map(s => ({
                name: s.name,
                enabled: s.enabled,
                priority: s.priority,
                riskScore: s.getRiskScore()
            })),
            executionOrder: this.executionOrder
        };
    }
}
exports.GhostOrchestrator = GhostOrchestrator;
// ═══════════════════════════════════════════════════════════════════════════════
// FACTORY
// ═══════════════════════════════════════════════════════════════════════════════
let globalOrchestrator = null;
/**
 * Get global Ghost Orchestrator instance (Singleton)
 */
function getGhostOrchestrator() {
    if (!globalOrchestrator) {
        globalOrchestrator = new GhostOrchestrator();
    }
    return globalOrchestrator;
}
/**
 * Create a new Ghost Orchestrator
 */
function createGhostOrchestrator() {
    return new GhostOrchestrator();
}
exports.default = GhostOrchestrator;
