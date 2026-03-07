"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * QAntum
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * @copyright 2025 Димитър Продромов (Dimitar Prodromov). All Rights Reserved.
 * @license PROPRIETARY AND CONFIDENTIAL
 *
 * This file is part of QAntum.
 * Unauthorized copying, modification, distribution, or use of this file,
 * via any medium, is strictly prohibited without express written permission.
 *
 * For licensing inquiries: dimitar.papazov@QAntum.dev
 * ═══════════════════════════════════════════════════════════════════════════════
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.GhostExecutionLayer = void 0;
const events_1 = require("events");
const crypto = __importStar(require("crypto"));
/** Generate unique ID */
function generateId(prefix) {
    return `${prefix}_${crypto.randomBytes(4).toString('hex')}`;
}
/**
 * Ghost Execution Layer
 *
 * Features:
 * - Parallel testing of alternative selector paths
 * - Non-blocking shadow execution
 * - Automatic knowledge base updates
 * - Winner path detection
 */
class GhostExecutionLayer extends events_1.EventEmitter {
    /** Configuration */
    config;
    /** Active ghost sessions */
    activeSessions = new Map();
    /** Path knowledge base (path hash → performance data) */
    knowledgeBase = new Map();
    /** Statistics */
    stats = {
        totalSessions: 0,
        completedSessions: 0,
        improvementsFound: 0,
        pathsTested: 0,
        knowledgeUpdates: 0,
    };
    /** Start time */
    startTime;
    constructor(config) {
        super();
        this.config = {
            enabled: config?.enabled ?? true,
            maxGhostThreads: config?.maxGhostThreads || 3,
            ghostTimeout: config?.ghostTimeout || 5000,
            minConfidenceDelta: config?.minConfidenceDelta || 0.1,
            enableScreenshots: config?.enableScreenshots ?? false,
            onlyOnFirstEncounter: config?.onlyOnFirstEncounter ?? false,
        };
        this.startTime = new Date();
    }
    /**
     * Start a ghost execution session
     * Tests alternative paths while the main path executes
     */
    // Complexity: O(N) — linear scan
    async startGhostSession(realPath, alternativePaths, page // Playwright Page
    ) {
        if (!this.config.enabled) {
            throw new Error('Ghost execution is disabled');
        }
        const session = {
            id: generateId('ghost'),
            realPath,
            ghostPaths: alternativePaths.slice(0, this.config.maxGhostThreads),
            results: new Map(),
            startedAt: new Date(),
            shouldUpdateKnowledge: true,
        };
        this.activeSessions.set(session.id, session);
        this.stats.totalSessions++;
        this.emit('sessionStarted', { sessionId: session.id, pathCount: session.ghostPaths.length });
        // Execute all ghost paths in parallel (without affecting main test state)
        const ghostPromises = session.ghostPaths.map(path => this.executeGhostPath(session.id, path, page));
        // Don't await - let them run in background
        Promise.all(ghostPromises)
            .then(results => this.completeSession(session.id, results))
            .catch(err => this.emit('sessionError', { sessionId: session.id, error: err.message }));
        return session;
    }
    /**
     * Execute a single ghost path
     */
    // Complexity: O(1)
    async executeGhostPath(sessionId, path, page) {
        const startTime = Date.now();
        this.stats.pathsTested++;
        try {
            // Create timeout promise
            const timeoutPromise = new Promise((_, reject) => {
                // Complexity: O(1)
                setTimeout(() => reject(new Error('Ghost timeout')), this.config.ghostTimeout);
            });
            // Try to find element using the ghost path's selector
            const findPromise = this.findElementGhost(page, path);
            // Race between finding and timeout
            const result = await Promise.race([findPromise, timeoutPromise]);
            const executionResult = {
                path,
                success: result.found,
                executionTime: Date.now() - startTime,
                elementFound: result.found,
                elementState: result.state,
                timestamp: new Date(),
            };
            // Get screenshot hash if enabled
            if (this.config.enableScreenshots && result.found) {
                // SAFETY: async operation — wrap in try-catch for production resilience
                executionResult.screenshotHash = await this.getScreenshotHash(page, path.selector);
            }
            return executionResult;
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            return {
                path,
                success: false,
                executionTime: Date.now() - startTime,
                error: message,
                elementFound: false,
                timestamp: new Date(),
            };
        }
    }
    /**
     * Find element using ghost path (read-only, doesn't affect state)
     */
    // Complexity: O(N*M) — nested iteration
    async findElementGhost(page, path) {
        if (!page) {
            // Simulate for testing
            return this.simulateFindElement(path);
        }
        // Type assertion for page-like object with selector methods
        const browserPage = page;
        try {
            let element = null;
            switch (path.strategy) {
                case 'semantic':
                case 'text':
                    element = await browserPage.$(`text="${path.selector}"`);
                    break;
                case 'css':
                    element = await browserPage.$(path.selector);
                    break;
                case 'xpath':
                    element = await browserPage.$(`xpath=${path.selector}`);
                    break;
                case 'visual':
                    // Visual strategy would use image matching
                    // SAFETY: async operation — wrap in try-catch for production resilience
                    element = await browserPage.$(path.selector);
                    break;
                default:
                    // SAFETY: async operation — wrap in try-catch for production resilience
                    element = await browserPage.$(path.selector);
            }
            if (!element) {
                return { found: false };
            }
            // Get element state without interacting
            // SAFETY: async operation — wrap in try-catch for production resilience
            const visible = await element.isVisible().catch(() => false);
            // SAFETY: async operation — wrap in try-catch for production resilience
            const enabled = await element.isEnabled().catch(() => false);
            // SAFETY: async operation — wrap in try-catch for production resilience
            const box = await element.boundingBox().catch(() => null);
            return {
                found: true,
                state: {
                    visible,
                    enabled,
                    interactable: visible && enabled && box !== null,
                },
            };
        }
        catch {
            return { found: false };
        }
    }
    /**
     * Simulate finding element (for testing without browser)
     */
    // Complexity: O(1)
    simulateFindElement(path) {
        // Simulate with random success based on confidence
        const success = Math.random() < path.confidence;
        return {
            found: success,
            state: success ? {
                visible: true,
                enabled: true,
                interactable: true,
            } : undefined,
        };
    }
    /**
     * Get screenshot hash for visual comparison
     */
    // Complexity: O(N)
    async getScreenshotHash(page, selector) {
        try {
            if (!page)
                return 'simulated_hash';
            // Type assertion for page-like object
            const browserPage = page;
            const element = await browserPage.$(selector);
            if (!element)
                return '';
            const screenshot = await element.screenshot({ type: 'png' });
            return crypto.createHash('md5').update(screenshot).digest('hex');
        }
        catch {
            return '';
        }
    }
    /**
     * Complete a ghost session and determine winner
     */
    // Complexity: O(N log N) — sort
    completeSession(sessionId, results) {
        const session = this.activeSessions.get(sessionId);
        if (!session)
            return;
        // Store results
        for (const result of results) {
            session.results.set(result.path.id, result);
        }
        // Find winner (best performing path)
        const successfulResults = results.filter(r => r.success && r.elementFound);
        if (successfulResults.length > 0) {
            // Sort by execution time (fastest first)
            successfulResults.sort((a, b) => a.executionTime - b.executionTime);
            const winner = successfulResults[0];
            session.winnerPath = winner.path;
            // Check if ghost found better path than real
            const realResult = session.results.get(session.realPath.id);
            if (realResult && winner.path.id !== session.realPath.id) {
                if (!realResult.success || winner.executionTime < realResult.executionTime * 0.8) {
                    this.stats.improvementsFound++;
                    this.emit('improvementFound', {
                        sessionId,
                        realPath: session.realPath,
                        betterPath: winner.path,
                        timeSaved: realResult.executionTime - winner.executionTime,
                    });
                }
            }
        }
        // Update knowledge base
        if (session.shouldUpdateKnowledge) {
            this.updateKnowledgeBase(results);
        }
        session.completedAt = new Date();
        this.stats.completedSessions++;
        this.emit('sessionCompleted', {
            sessionId,
            winner: session.winnerPath,
            resultsCount: results.length,
        });
        // Clean up session after a delay
        // Complexity: O(1)
        setTimeout(() => {
            this.activeSessions.delete(sessionId);
        }, 60000);
    }
    /**
     * Update knowledge base with ghost results
     */
    // Complexity: O(N) — loop
    updateKnowledgeBase(results) {
        for (const result of results) {
            const pathHash = this.getPathHash(result.path);
            const existing = this.knowledgeBase.get(pathHash);
            if (existing) {
                // Update with exponential moving average
                const alpha = 0.3; // Learning rate
                existing.successRate = existing.successRate * (1 - alpha) + (result.success ? 1 : 0) * alpha;
                existing.avgTime = existing.avgTime * (1 - alpha) + result.executionTime * alpha;
                existing.sampleCount++;
                existing.lastUpdated = new Date();
            }
            else {
                // New entry
                this.knowledgeBase.set(pathHash, {
                    successRate: result.success ? 1 : 0,
                    avgTime: result.executionTime,
                    sampleCount: 1,
                    lastUpdated: new Date(),
                });
            }
            this.stats.knowledgeUpdates++;
        }
    }
    /**
     * Generate hash for path (for knowledge base key)
     */
    // Complexity: O(1)
    getPathHash(path) {
        return crypto.createHash('md5')
            .update(`${path.strategy}:${path.selector}`)
            .digest('hex');
    }
    /**
     * Generate alternative paths for a given selector
     */
    // Complexity: O(1)
    generateAlternativePaths(originalSelector, targetText, elementType) {
        const alternatives = [];
        const baseConfidence = 0.7;
        // Original path
        alternatives.push({
            id: generateId('path'),
            name: 'Path A (Original)',
            selector: originalSelector,
            strategy: 'css',
            confidence: 0.9,
        });
        // Text-based alternative
        if (targetText) {
            alternatives.push({
                id: generateId('path'),
                name: 'Path B (Text)',
                selector: targetText,
                strategy: 'text',
                confidence: baseConfidence + 0.15,
            });
        }
        // Simplified CSS (remove complex specificity)
        const simplifiedSelector = this.simplifySelector(originalSelector);
        if (simplifiedSelector !== originalSelector) {
            alternatives.push({
                id: generateId('path'),
                name: 'Path C (Simplified)',
                selector: simplifiedSelector,
                strategy: 'css',
                confidence: baseConfidence,
            });
        }
        // Type-based selector
        if (elementType) {
            alternatives.push({
                id: generateId('path'),
                name: 'Path D (Type)',
                selector: elementType,
                strategy: 'css',
                confidence: baseConfidence - 0.1,
            });
        }
        // XPath alternative
        if (!originalSelector.includes('xpath')) {
            alternatives.push({
                id: generateId('path'),
                name: 'Path E (XPath)',
                selector: this.toXPath(originalSelector),
                strategy: 'xpath',
                confidence: baseConfidence - 0.05,
            });
        }
        return alternatives;
    }
    /**
     * Simplify CSS selector
     */
    // Complexity: O(1)
    simplifySelector(selector) {
        // Remove nth-child, :not(), complex pseudo-selectors
        let simplified = selector
            .replace(/:nth-child\([^)]+\)/g, '')
            .replace(/:not\([^)]+\)/g, '')
            .replace(/\s+>\s+/g, ' ')
            .replace(/\s{2,}/g, ' ')
            .trim();
        // If we have ID, just use that
        const idMatch = selector.match(/#[\w-]+/);
        if (idMatch) {
            return idMatch[0];
        }
        // If we have data-testid, use that
        const testIdMatch = selector.match(/\[data-testid="[^"]+"\]/);
        if (testIdMatch) {
            return testIdMatch[0];
        }
        return simplified || selector;
    }
    /**
     * Convert CSS selector to XPath
     */
    // Complexity: O(1)
    toXPath(cssSelector) {
        // Simple conversion - not comprehensive
        let xpath = cssSelector
            .replace(/#([\w-]+)/g, '[@id="$1"]')
            .replace(/\.([\w-]+)/g, '[contains(@class, "$1")]')
            .replace(/\[([^\]]+)="([^"]+)"\]/g, '[@$1="$2"]');
        // If starts with tag, convert to XPath format
        const tagMatch = xpath.match(/^(\w+)/);
        if (tagMatch) {
            xpath = `//${tagMatch[1]}${xpath.slice(tagMatch[0].length)}`;
        }
        else {
            xpath = `//*${xpath}`;
        }
        return xpath;
    }
    /**
     * Get best known path for a selector pattern
     */
    // Complexity: O(N*M) — nested iteration
    getBestKnownPath(selectorPattern) {
        let bestPath = null;
        let bestScore = 0;
        for (const [hash, data] of this.knowledgeBase.entries()) {
            if (data.successRate > bestScore && data.sampleCount >= 3) {
                bestScore = data.successRate;
                // We'd need to store full path info - simplified for now
            }
        }
        return bestPath;
    }
    /**
     * Get session by ID
     */
    // Complexity: O(1) — lookup
    getSession(sessionId) {
        return this.activeSessions.get(sessionId);
    }
    /**
     * Get all active sessions
     */
    // Complexity: O(1)
    getActiveSessions() {
        return Array.from(this.activeSessions.values());
    }
    /**
     * Get statistics
     */
    // Complexity: O(1)
    getStats() {
        return {
            ...this.stats,
            knowledgeBaseSize: this.knowledgeBase.size,
            activeSessions: this.activeSessions.size,
            uptime: Date.now() - this.startTime.getTime(),
            improvementRate: this.stats.completedSessions > 0
                ? this.stats.improvementsFound / this.stats.completedSessions
                : 0,
        };
    }
    /**
     * Export knowledge base
     */
    // Complexity: O(N) — loop
    exportKnowledge() {
        const data = [];
        for (const [hash, value] of this.knowledgeBase.entries()) {
            data.push({
                pathHash: hash,
                ...value,
            });
        }
        return data;
    }
    /**
     * Import knowledge base
     */
    // Complexity: O(N) — loop
    importKnowledge(data) {
        for (const entry of data) {
            this.knowledgeBase.set(entry.pathHash, {
                successRate: entry.successRate,
                avgTime: entry.avgTime,
                sampleCount: entry.sampleCount,
                lastUpdated: new Date(entry.lastUpdated),
            });
        }
    }
    /**
     * Clear knowledge base
     */
    // Complexity: O(1)
    clearKnowledge() {
        this.knowledgeBase.clear();
    }
    /**
     * Shutdown
     */
    // Complexity: O(N) — loop
    async shutdown() {
        // Cancel all active sessions
        for (const [sessionId] of this.activeSessions) {
            this.emit('sessionCancelled', { sessionId, reason: 'shutdown' });
        }
        this.activeSessions.clear();
        this.emit('shutdown', { stats: this.getStats() });
    }
}
exports.GhostExecutionLayer = GhostExecutionLayer;
exports.default = GhostExecutionLayer;
