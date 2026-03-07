/**
 * @fileoverview Knowledge Base - Learning and storing selector success patterns
 * @module core/KnowledgeBase
 * @version 1.0.0-QAntum
 */

const fs = require('fs');
const path = require('path');
const { CONFIG } = require('../config/constants');

/**
 * KnowledgeBase stores and retrieves learned patterns for element selection
 * @class
 */
class KnowledgeBase {
    /**
     * Create a KnowledgeBase instance
     * @param {string} [dbPath] - Optional custom path for knowledge database
     */
    constructor(dbPath) {
        /** @type {string} */
        this.dbPath = dbPath || path.join(CONFIG.KNOWLEDGE_DIR, "knowledge.json");
        /** @type {Object} */
        this.data = this.load();
    }

    /**
     * Load knowledge from disk
     * @returns {Object} Knowledge data
     */
    // Complexity: O(1)
    load() {
        try {
            if (fs.existsSync(this.dbPath)) {
                return JSON.parse(fs.readFileSync(this.dbPath, "utf8"));
            }
        } catch (e) {
            console.warn(`   ⚠️ Failed to load knowledge: ${e.message}`);
        }
        return this._getDefaultData();
    }

    /**
     * Get default knowledge structure
     * @private
     * @returns {Object}
     */
    // Complexity: O(1)
    _getDefaultData() {
        return {
            version: "8.5.0",
            created: new Date().toISOString(),
            sitePatterns: {},
            selectorSuccess: {},
            selectorFail: {},
            cookieStrategies: {},
            formPatterns: {},
            errorSolutions: {},
            domainKnowledge: {},
            totalSessions: 0,
            totalActions: 0,
            successRate: 0
        };
    }

    /**
     * Save knowledge to disk
     * @returns {void}
     */
    // Complexity: O(1)
    save() {
        try {
            const dir = path.dirname(this.dbPath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(this.dbPath, JSON.stringify(this.data, null, 2));
        } catch (e) {
            console.warn(`   ⚠️ Failed to save knowledge: ${e.message}`);
        }
    }

    /**
     * Learn from a selector attempt
     * @param {string} domain - Website domain
     * @param {string} selector - Selector used
     * @param {Object} context - Additional context
     * @param {boolean} success - Whether the selector worked
     * @returns {void}
     */
    // Complexity: O(1) — hash/map lookup
    learnSelector(domain, selector, context, success) {
        const key = `${domain}::${selector}`;
        if (!this.data.selectorSuccess[key]) {
            this.data.selectorSuccess[key] = { attempts: 0, successes: 0, contexts: [] };
        }
        this.data.selectorSuccess[key].attempts++;
        if (success) this.data.selectorSuccess[key].successes++;
        
        // Keep only last 10 contexts to prevent bloat
        this.data.selectorSuccess[key].contexts.push(context);
        if (this.data.selectorSuccess[key].contexts.length > 10) {
            this.data.selectorSuccess[key].contexts.shift();
        }
        
        this.save();
    }

    /**
     * Learn a successful cookie dismiss strategy
     * @param {string} domain - Website domain
     * @param {string} selector - Working selector
     * @returns {void}
     */
    // Complexity: O(1) — hash/map lookup
    learnCookieStrategy(domain, selector) {
        if (!this.data.cookieStrategies[domain]) {
            this.data.cookieStrategies[domain] = [];
        }
        if (!this.data.cookieStrategies[domain].includes(selector)) {
            this.data.cookieStrategies[domain].unshift(selector);
            // Keep max 10 strategies per domain
            this.data.cookieStrategies[domain] = this.data.cookieStrategies[domain].slice(0, 10);
            this.save();
        }
    }

    /**
     * Get cookie dismiss strategies for a domain
     * @param {string} domain - Website domain
     * @returns {Array<string>} Array of selectors to try
     */
    // Complexity: O(N) — linear iteration
    getCookieStrategies(domain) {
        const strategies = [];
        
        // Domain-specific strategies first
        for (const [d, selectors] of Object.entries(this.data.cookieStrategies)) {
            if (domain.includes(d) || d.includes(domain)) {
                strategies.push(...selectors);
            }
        }
        
        // Common cookie selectors as fallback
        const commonSelectors = [
            "#L2AGLb", "#onetrust-accept-btn-handler", "#accept-cookies",
            ".accept-cookies", "[data-testid='cookie-accept']",
            "//button[contains(text(),'Accept')]", "//button[contains(text(),'Приемам')]",
            "//button[contains(text(),'Accept all')]", "//button[contains(text(),'I agree')]",
            ".cc-accept", ".cookie-consent-accept", "#CybotCookiebotDialogBodyButtonAccept",
            "[aria-label*='accept']", "[aria-label*='cookie']",
            ".js-cookie-accept", "#cookie-accept-all"
        ];
        
        strategies.push(...commonSelectors);
        return [...new Set(strategies)];
    }

    /**
     * Get best performing selectors for a domain
     * @param {string} domain - Website domain
     * @param {string} purpose - What the selector is for (optional)
     * @returns {Array<Object>} Sorted selectors by success rate
     */
    // Complexity: O(N log N) — sort operation
    getBestSelectors(domain, purpose) {
        const relevant = Object.entries(this.data.selectorSuccess)
            .filter(([key]) => key.startsWith(domain))
            .map(([key, data]) => ({
                selector: key.split("::")[1],
                score: data.successes / Math.max(data.attempts, 1),
                attempts: data.attempts
            }))
            .filter(s => s.attempts >= 2)
            .sort((a, b) => b.score - a.score);
        
        return relevant.slice(0, 5);
    }

    /**
     * Update overall statistics
     * @param {boolean} success - Whether the last action succeeded
     * @returns {void}
     */
    // Complexity: O(1)
    updateStats(success) {
        this.data.totalActions++;
        const total = this.data.totalActions;
        const oldSuccesses = Math.round(this.data.successRate * (total - 1));
        this.data.successRate = (oldSuccesses + (success ? 1 : 0)) / total;
        this.save();
    }

    /**
     * Increment session count
     * @returns {void}
     */
    // Complexity: O(1)
    incrementSessions() {
        this.data.totalSessions++;
        this.save();
    }

    /**
     * Get knowledge summary
     * @returns {Object} Summary statistics
     */
    // Complexity: O(1)
    getSummary() {
        return {
            sessions: this.data.totalSessions,
            actions: this.data.totalActions,
            successRate: (this.data.successRate * 100).toFixed(1) + "%",
            knownDomains: Object.keys(this.data.cookieStrategies).length,
            learnedSelectors: Object.keys(this.data.selectorSuccess).length
        };
    }

    /**
     * Clear old data to prevent database bloat
     * @param {number} maxAge - Max age in days for entries
     * @returns {number} Number of entries cleaned
     */
    // Complexity: O(N) — linear iteration
    cleanup(maxAge = 30) {
        let cleaned = 0;
        const now = Date.now();
        const maxAgeMs = maxAge * 24 * 60 * 60 * 1000;
        
        // Clean old selector data
        for (const [key, data] of Object.entries(this.data.selectorSuccess)) {
            if (data.contexts.length > 0) {
                const lastContext = data.contexts[data.contexts.length - 1];
                if (lastContext.timestamp && (now - new Date(lastContext.timestamp).getTime()) > maxAgeMs) {
                    delete this.data.selectorSuccess[key];
                    cleaned++;
                }
            }
        }
        
        if (cleaned > 0) {
            this.save();
            console.log(`   🧹 Cleaned ${cleaned} old knowledge entries`);
        }
        
        return cleaned;
    }
}

module.exports = { KnowledgeBase };
