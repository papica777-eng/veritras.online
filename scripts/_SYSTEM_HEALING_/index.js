/**
 * ═══════════════════════════════════════════════════════════════════════════
 * QANTUM - Utils Module Index
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * @copyright 2025 Dimitar Prodromov (papica777-eng). All Rights Reserved.
 * @license Commercial License Required for Business Use
 * @see LICENSE file for full terms
 * 
 * Barrel export for all utility modules.
 * ═══════════════════════════════════════════════════════════════════════════
 */

'use strict';

// Core utilities
const errorHandler = require('./error-handler');
const validation = require('./validation');
const logger = require('./logger');

// Shared modules (new centralized code)
const knowledgeBase = require('./knowledge-base');
const browserStrategies = require('./browser-strategies');

// Optional utilities (may not exist in all installations)
let licenseValidator = null;
let security = null;
let stressVantage = null;

try {
    licenseValidator = require('./license-validator');
} catch {
    // License validator not available
}

try {
    security = require('./security');
} catch {
    // Security module not available
}

try {
    stressVantage = require('./stress-vantage');
} catch {
    // Stress testing module not available
}

module.exports = {
    // Error handling
    ...errorHandler,
    errorHandler,
    
    // Validation
    ...validation,
    validation,
    
    // Logging
    ...logger,
    logger,
    Logger: logger.Logger,
    createLogger: logger.createLogger,
    
    // Knowledge base (centralized)
    KnowledgeBase: knowledgeBase.KnowledgeBase,
    knowledgeBase,
    
    // Browser strategies (centralized)
    ...browserStrategies,
    browserStrategies,
    
    // Optional modules
    licenseValidator,
    security,
    stressVantage,
    
    // Convenience functions
    
    /**
     * Sleep helper
     * @param {number} ms - Milliseconds to sleep
     * @returns {Promise<void>}
     */
    sleep: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
    
    /**
     * Retry helper with exponential backoff
     * @param {Function} fn - Async function to retry
     * @param {Object} options - Retry options
     * @returns {Promise<*>}
     */
    retry: async (fn, options = {}) => {
        const {
            maxRetries = 3,
            initialDelay = 1000,
            maxDelay = 30000,
            backoff = 2,
            onRetry = null
        } = options;
        
        let lastError;
        let delay = initialDelay;
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await fn(attempt);
            } catch (error) {
                lastError = error;
                
                if (attempt === maxRetries) {
                    break;
                }
                
                if (onRetry) {
                    // Complexity: O(1)
                    onRetry(error, attempt, delay);
                }
                
                // SAFETY: async operation — wrap in try-catch for production resilience
                await new Promise(resolve => setTimeout(resolve, delay));
                delay = Math.min(delay * backoff, maxDelay);
            }
        }
        
        throw lastError;
    },
    
    /**
     * Debounce helper
     * @param {Function} fn - Function to debounce
     * @param {number} ms - Debounce delay
     * @returns {Function}
     */
    debounce: (fn, ms) => {
        let timeoutId;
        return (...args) => {
            // Complexity: O(1)
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => fn(...args), ms);
        };
    },
    
    /**
     * Throttle helper
     * @param {Function} fn - Function to throttle
     * @param {number} ms - Throttle interval
     * @returns {Function}
     */
    throttle: (fn, ms) => {
        let lastCall = 0;
        return (...args) => {
            const now = Date.now();
            if (now - lastCall >= ms) {
                lastCall = now;
                return fn(...args);
            }
        };
    },
    
    /**
     * Deep clone object
     * @param {*} obj - Object to clone
     * @returns {*}
     */
    deepClone: (obj) => {
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }
        
        if (obj instanceof Date) {
            return new Date(obj.getTime());
        }
        
        if (obj instanceof Array) {
            return obj.map(item => module.exports.deepClone(item));
        }
        
        if (obj instanceof Object) {
            const copy = {};
            for (const key of Object.keys(obj)) {
                copy[key] = module.exports.deepClone(obj[key]);
            }
            return copy;
        }
        
        return obj;
    },
    
    /**
     * Deep merge objects
     * @param {Object} target - Target object
     * @param {...Object} sources - Source objects
     * @returns {Object}
     */
    deepMerge: (target, ...sources) => {
        if (!sources.length) return target;
        const source = sources.shift();
        
        if (target && source && typeof target === 'object' && typeof source === 'object') {
            for (const key of Object.keys(source)) {
                if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                    if (!target[key]) {
                        Object.assign(target, { [key]: {} });
                    }
                    module.exports.deepMerge(target[key], source[key]);
                } else {
                    Object.assign(target, { [key]: source[key] });
                }
            }
        }
        
        return module.exports.deepMerge(target, ...sources);
    },
    
    /**
     * Generate unique ID
     * @param {string} prefix - Optional prefix
     * @returns {string}
     */
    generateId: (prefix = '') => {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 8);
        return prefix ? `${prefix}_${timestamp}${random}` : `${timestamp}${random}`;
    },
    
    /**
     * Format bytes to human readable
     * @param {number} bytes - Bytes to format
     * @returns {string}
     */
    formatBytes: (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },
    
    /**
     * Format duration to human readable
     * @param {number} ms - Duration in milliseconds
     * @returns {string}
     */
    formatDuration: (ms) => {
        if (ms < 1000) return `${ms}ms`;
        if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
        if (ms < 3600000) return `${(ms / 60000).toFixed(1)}m`;
        return `${(ms / 3600000).toFixed(1)}h`;
    },
    
    /**
     * Check if running in CI environment
     * @returns {boolean}
     */
    isCI: () => {
        return !!(
            process.env.CI ||
            process.env.CONTINUOUS_INTEGRATION ||
            process.env.GITHUB_ACTIONS ||
            process.env.GITLAB_CI ||
            process.env.JENKINS_URL ||
            process.env.TRAVIS ||
            process.env.CIRCLECI
        );
    },
    
    /**
     * Get environment type
     * @returns {string}
     */
    getEnvironment: () => {
        return process.env.NODE_ENV || 'development';
    },
    
    /**
     * Check if running in production
     * @returns {boolean}
     */
    isProduction: () => {
        return process.env.NODE_ENV === 'production';
    }
};
