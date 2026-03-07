/**
 * ═══════════════════════════════════════════════════════════════════════════
 * QANTUM - Knowledge Base Module
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * @copyright 2025 Dimitar Prodromov (papica777-eng). All Rights Reserved.
 * @license Commercial License Required for Business Use
 * 
 * Centralized knowledge storage and retrieval system.
 * Used by: qantum-v8, sovereign-core, chronos-engine
 * ═══════════════════════════════════════════════════════════════════════════
 */

'use strict';

const fs = require('fs');
const path = require('path');

/**
 * KnowledgeBase - Persistent learning system
 * Stores successful selectors, heuristics, and patterns
 */
class KnowledgeBase {
    /**
     * @param {Object} options - Configuration options
     * @param {string} options.dataDir - Directory for knowledge files
     * @param {string} options.filename - Knowledge file name
     * @param {boolean} options.autoSave - Auto-save on update
     */
    constructor(options = {}) {
        this.dataDir = options.dataDir || path.join(process.cwd(), 'knowledge');
        this.filename = options.filename || 'knowledge.json';
        this.autoSave = options.autoSave !== false;
        this.dbPath = path.join(this.dataDir, this.filename);
        
        // Ensure directory exists
        if (!fs.existsSync(this.dataDir)) {
            fs.mkdirSync(this.dataDir, { recursive: true });
        }
        
        this.data = this._load();
    }

    /**
     * Load knowledge from file
     * @private
     */
    // Complexity: O(1)
    _load() {
        try {
            if (fs.existsSync(this.dbPath)) {
                const content = fs.readFileSync(this.dbPath, 'utf8');
                return JSON.parse(content);
            }
        } catch (error) {
            console.warn(`⚠️ Could not load knowledge from ${this.dbPath}:`, error.message);
        }
        
        return {
            selectors: {},      // domain -> { original -> [working alternatives] }
            heuristics: {},     // pattern -> success rate
            sessions: [],       // session history
            version: '15.1',
            created: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
        };
    }

    /**
     * Save knowledge to file
     */
    // Complexity: O(1)
    save() {
        try {
            this.data.lastUpdated = new Date().toISOString();
            fs.writeFileSync(this.dbPath, JSON.stringify(this.data, null, 2));
            return true;
        } catch (error) {
            console.error(`❌ Could not save knowledge to ${this.dbPath}:`, error.message);
            return false;
        }
    }

    /**
     * Record a successful selector for a domain
     * @param {string} domain - Website domain
     * @param {string} original - Original selector that failed
     * @param {string} working - Alternative selector that worked
     */
    // Complexity: O(1) — hash/map lookup
    recordSelector(domain, original, working) {
        if (!this.data.selectors[domain]) {
            this.data.selectors[domain] = {};
        }
        if (!this.data.selectors[domain][original]) {
            this.data.selectors[domain][original] = [];
        }
        
        // Add if not already known
        if (!this.data.selectors[domain][original].includes(working)) {
            this.data.selectors[domain][original].push(working);
            
            // Keep only top 10 alternatives
            if (this.data.selectors[domain][original].length > 10) {
                this.data.selectors[domain][original] = 
                    this.data.selectors[domain][original].slice(-10);
            }
            
            if (this.autoSave) this.save();
        }
    }

    /**
     * Get best selectors for a domain
     * @param {string} domain - Website domain
     * @param {string} original - Original selector
     * @returns {string[]} Array of known working alternatives
     */
    // Complexity: O(1) — hash/map lookup
    getBestSelectors(domain, original) {
        if (!this.data.selectors[domain]) return [];
        if (!this.data.selectors[domain][original]) return [];
        return this.data.selectors[domain][original];
    }

    /**
     * Get all known selectors for a domain
     * @param {string} domain - Website domain
     * @returns {Object} Map of original -> alternatives
     */
    // Complexity: O(1) — hash/map lookup
    getDomainSelectors(domain) {
        return this.data.selectors[domain] || {};
    }

    /**
     * Update heuristic success rate
     * @param {string} pattern - Heuristic pattern name
     * @param {boolean} success - Whether it succeeded
     */
    // Complexity: O(1) — hash/map lookup
    updateHeuristic(pattern, success) {
        if (!this.data.heuristics[pattern]) {
            this.data.heuristics[pattern] = { success: 0, total: 0, rate: 0 };
        }
        
        this.data.heuristics[pattern].total++;
        if (success) this.data.heuristics[pattern].success++;
        
        this.data.heuristics[pattern].rate = 
            this.data.heuristics[pattern].success / this.data.heuristics[pattern].total;
        
        if (this.autoSave) this.save();
    }

    /**
     * Get heuristic success rate
     * @param {string} pattern - Heuristic pattern name
     * @returns {number} Success rate (0-1)
     */
    // Complexity: O(1) — hash/map lookup
    getHeuristicRate(pattern) {
        return this.data.heuristics[pattern]?.rate || 0;
    }

    /**
     * Get all heuristics sorted by success rate
     * @returns {Array} Sorted heuristics with stats
     */
    // Complexity: O(N log N) — sort operation
    getTopHeuristics() {
        return Object.entries(this.data.heuristics)
            .map(([pattern, stats]) => ({ pattern, ...stats }))
            .sort((a, b) => b.rate - a.rate);
    }

    /**
     * Record a test session
     * @param {Object} session - Session data
     */
    // Complexity: O(1)
    recordSession(session) {
        this.data.sessions.push({
            ...session,
            timestamp: new Date().toISOString()
        });
        
        // Keep only last 100 sessions
        if (this.data.sessions.length > 100) {
            this.data.sessions = this.data.sessions.slice(-100);
        }
        
        if (this.autoSave) this.save();
    }

    /**
     * Get session history
     * @param {number} limit - Max sessions to return
     * @returns {Array} Recent sessions
     */
    // Complexity: O(1)
    getSessions(limit = 10) {
        return this.data.sessions.slice(-limit);
    }

    /**
     * Get statistics
     * @returns {Object} Knowledge base stats
     */
    // Complexity: O(N) — linear iteration
    getStats() {
        const domains = Object.keys(this.data.selectors).length;
        const selectors = Object.values(this.data.selectors)
            .reduce((sum, d) => sum + Object.keys(d).length, 0);
        const heuristics = Object.keys(this.data.heuristics).length;
        const sessions = this.data.sessions.length;
        
        return {
            domains,
            selectors,
            heuristics,
            sessions,
            version: this.data.version,
            created: this.data.created,
            lastUpdated: this.data.lastUpdated
        };
    }

    /**
     * Clear all knowledge (with confirmation)
     * @param {boolean} confirm - Must be true to actually clear
     */
    // Complexity: O(1)
    clear(confirm = false) {
        if (!confirm) {
            console.warn('⚠️ Pass confirm=true to actually clear knowledge');
            return false;
        }
        
        this.data = {
            selectors: {},
            heuristics: {},
            sessions: [],
            version: '15.1',
            created: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
        };
        
        return this.save();
    }

    /**
     * Export knowledge to JSON
     * @returns {string} JSON string
     */
    // Complexity: O(1)
    export() {
        return JSON.stringify(this.data, null, 2);
    }

    /**
     * Import knowledge from JSON
     * @param {string} json - JSON string
     * @param {boolean} merge - Merge with existing (true) or replace (false)
     */
    import(json, merge = true) {
        try {
            const imported = JSON.parse(json);
            
            if (merge) {
                // Merge selectors
                for (const [domain, selectors] of Object.entries(imported.selectors || {})) {
                    if (!this.data.selectors[domain]) {
                        this.data.selectors[domain] = {};
                    }
                    for (const [original, alternatives] of Object.entries(selectors)) {
                        if (!this.data.selectors[domain][original]) {
                            this.data.selectors[domain][original] = [];
                        }
                        for (const alt of alternatives) {
                            if (!this.data.selectors[domain][original].includes(alt)) {
                                this.data.selectors[domain][original].push(alt);
                            }
                        }
                    }
                }
                
                // Merge heuristics (keep higher rate)
                for (const [pattern, stats] of Object.entries(imported.heuristics || {})) {
                    if (!this.data.heuristics[pattern] || 
                        stats.rate > this.data.heuristics[pattern].rate) {
                        this.data.heuristics[pattern] = stats;
                    }
                }
            } else {
                this.data = imported;
            }
            
            return this.save();
        } catch (error) {
            console.error('❌ Import failed:', error.message);
            return false;
        }
    }
}

/**
 * Create a shared knowledge base instance
 * @param {Object} options - Configuration
 * @returns {KnowledgeBase}
 */
function createKnowledgeBase(options = {}) {
    return new KnowledgeBase(options);
}

// Default shared instance
let _defaultInstance = null;

/**
 * Get or create the default knowledge base instance
 * @returns {KnowledgeBase}
 */
function getDefaultKnowledgeBase() {
    if (!_defaultInstance) {
        _defaultInstance = new KnowledgeBase();
    }
    return _defaultInstance;
}

module.exports = {
    KnowledgeBase,
    createKnowledgeBase,
    getDefaultKnowledgeBase
};
