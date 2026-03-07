/**
 * ═══════════════════════════════════════════════════════════════════════════
 * QANTUM - Validation Module
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * @copyright 2025 Dimitar Prodromov (papica777-eng). All Rights Reserved.
 * @license Commercial License Required for Business Use
 * @see LICENSE file for full terms
 * 
 * This module provides:
 * - Configuration validation
 * - Input sanitization
 * - API key validation
 * - Security checks
 * ═══════════════════════════════════════════════════════════════════════════
 */

'use strict';

/**
 * Validates configuration object against required fields
 * @param {Object} config - Configuration object to validate
 * @param {Object} schema - Schema defining required fields and types
 * @returns {{valid: boolean, errors: string[]}}
 */
function validateConfig(config, schema) {
    const errors = [];
    
    if (!config || typeof config !== 'object') {
        return { valid: false, errors: ['Configuration must be an object'] };
    }
    
    for (const [key, rules] of Object.entries(schema)) {
        const value = config[key];
        
        // Check required fields
        if (rules.required && (value === undefined || value === null || value === '')) {
            errors.push(`Missing required field: ${key}`);
            continue;
        }
        
        // Skip validation if not required and not present
        if (value === undefined || value === null) {
            continue;
        }
        
        // Type validation
        if (rules.type && typeof value !== rules.type) {
            errors.push(`Field "${key}" must be of type ${rules.type}, got ${typeof value}`);
        }
        
        // Min/max for numbers
        if (rules.type === 'number') {
            if (rules.min !== undefined && value < rules.min) {
                errors.push(`Field "${key}" must be >= ${rules.min}`);
            }
            if (rules.max !== undefined && value > rules.max) {
                errors.push(`Field "${key}" must be <= ${rules.max}`);
            }
        }
        
        // Min/max length for strings
        if (rules.type === 'string') {
            if (rules.minLength !== undefined && value.length < rules.minLength) {
                errors.push(`Field "${key}" must be at least ${rules.minLength} characters`);
            }
            if (rules.maxLength !== undefined && value.length > rules.maxLength) {
                errors.push(`Field "${key}" must be at most ${rules.maxLength} characters`);
            }
            if (rules.pattern && !rules.pattern.test(value)) {
                errors.push(`Field "${key}" does not match required pattern`);
            }
        }
        
        // Enum validation
        if (rules.enum && !rules.enum.includes(value)) {
            errors.push(`Field "${key}" must be one of: ${rules.enum.join(', ')}`);
        }
        
        // Custom validator
        if (rules.validate && typeof rules.validate === 'function') {
            const customResult = rules.validate(value, config);
            if (customResult !== true) {
                errors.push(customResult || `Field "${key}" failed custom validation`);
            }
        }
    }
    
    return { valid: errors.length === 0, errors };
}

/**
 * Validates API key format and presence
 * @param {string} apiKey - API key to validate
 * @param {string} provider - Provider name (gemini, openai, etc.)
 * @returns {{valid: boolean, message: string}}
 */
function validateApiKey(apiKey, provider = 'gemini') {
    if (!apiKey || typeof apiKey !== 'string') {
        return {
            valid: false,
            message: `${provider.toUpperCase()}_API_KEY is not configured. Set it in .env file or environment variables.`
        };
    }
    
    const trimmed = apiKey.trim();
    
    if (trimmed.length === 0) {
        return {
            valid: false,
            message: `${provider.toUpperCase()}_API_KEY is empty. Get your API key from the provider dashboard.`
        };
    }
    
    // Provider-specific validation
    const patterns = {
        gemini: /^AIzaSy[A-Za-z0-9_-]{33}$/,
        openai: /^sk-[A-Za-z0-9]{48}$/,
        anthropic: /^sk-ant-[A-Za-z0-9-]{90,}$/
    };
    
    if (patterns[provider] && !patterns[provider].test(trimmed)) {
        return {
            valid: false,
            message: `${provider.toUpperCase()}_API_KEY appears to be invalid format. Check if you copied it correctly.`
        };
    }
    
    return { valid: true, message: 'API key validated successfully' };
}

/**
 * Sanitizes user input to prevent injection attacks
 * @param {string} input - User input to sanitize
 * @param {Object} options - Sanitization options
 * @returns {string} Sanitized input
 */
function sanitizeInput(input, options = {}) {
    if (typeof input !== 'string') {
        return String(input);
    }
    
    let sanitized = input;
    
    // Remove null bytes
    sanitized = sanitized.replace(/\0/g, '');
    
    // Limit length
    if (options.maxLength && sanitized.length > options.maxLength) {
        sanitized = sanitized.substring(0, options.maxLength);
    }
    
    // Remove dangerous shell characters if needed
    if (options.shellSafe) {
        sanitized = sanitized.replace(/[;&|`$(){}[\]<>\\]/g, '');
    }
    
    // HTML encode if needed
    if (options.htmlEncode) {
        sanitized = sanitized
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;');
    }
    
    // Remove script tags
    if (options.removeScripts) {
        sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    }
    
    // Trim whitespace
    if (options.trim !== false) {
        sanitized = sanitized.trim();
    }
    
    return sanitized;
}

/**
 * Validates URL format and safety
 * @param {string} url - URL to validate
 * @param {Object} options - Validation options
 * @returns {{valid: boolean, message: string, normalized: string|null}}
 */
function validateUrl(url, options = {}) {
    if (!url || typeof url !== 'string') {
        return { valid: false, message: 'URL is required', normalized: null };
    }
    
    const trimmed = url.trim();
    
    // Check for dangerous protocols
    const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];
    const lowerUrl = trimmed.toLowerCase();
    
    for (const protocol of dangerousProtocols) {
        if (lowerUrl.startsWith(protocol)) {
            return { valid: false, message: `Dangerous protocol: ${protocol}`, normalized: null };
        }
    }
    
    // Try to parse URL
    try {
        const parsed = new URL(trimmed);
        
        // Check allowed protocols
        const allowedProtocols = options.protocols || ['http:', 'https:'];
        if (!allowedProtocols.includes(parsed.protocol)) {
            return { 
                valid: false, 
                message: `Protocol not allowed: ${parsed.protocol}`, 
                normalized: null 
            };
        }
        
        // Check for localhost if not allowed
        if (!options.allowLocalhost && (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1')) {
            return { valid: false, message: 'Localhost URLs not allowed', normalized: null };
        }
        
        // Check for private IPs if not allowed
        if (!options.allowPrivateIps) {
            const privatePatterns = [
                /^10\./,
                /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
                /^192\.168\./
            ];
            
            for (const pattern of privatePatterns) {
                if (pattern.test(parsed.hostname)) {
                    return { valid: false, message: 'Private IP addresses not allowed', normalized: null };
                }
            }
        }
        
        return { valid: true, message: 'URL is valid', normalized: parsed.href };
    } catch {
        return { valid: false, message: 'Invalid URL format', normalized: null };
    }
}

/**
 * Validates selector for XSS and injection prevention
 * @param {string} selector - CSS/XPath selector to validate
 * @returns {{valid: boolean, message: string}}
 */
function validateSelector(selector) {
    if (!selector || typeof selector !== 'string') {
        return { valid: false, message: 'Selector is required' };
    }
    
    const trimmed = selector.trim();
    
    // Check for dangerous patterns
    const dangerous = [
        /javascript:/i,
        /<script/i,
        /onclick/i,
        /onerror/i,
        /onload/i,
        /eval\(/i,
        /expression\(/i
    ];
    
    for (const pattern of dangerous) {
        if (pattern.test(trimmed)) {
            return { valid: false, message: 'Potentially dangerous selector detected' };
        }
    }
    
    // Max length check
    if (trimmed.length > 1000) {
        return { valid: false, message: 'Selector too long (max 1000 characters)' };
    }
    
    return { valid: true, message: 'Selector is valid' };
}

/**
 * Environment variable validation helper
 * @param {string[]} required - List of required environment variables
 * @returns {{valid: boolean, missing: string[]}}
 */
function validateEnvironment(required) {
    const missing = [];
    
    for (const varName of required) {
        if (!process.env[varName] || process.env[varName].trim() === '') {
            missing.push(varName);
        }
    }
    
    return {
        valid: missing.length === 0,
        missing
    };
}

/**
 * Creates a validated configuration with defaults
 * @param {Object} userConfig - User-provided configuration
 * @param {Object} defaults - Default configuration
 * @param {Object} schema - Validation schema
 * @returns {{config: Object, warnings: string[]}}
 */
function createValidatedConfig(userConfig, defaults, schema) {
    const warnings = [];
    const config = { ...defaults };
    
    // Merge user config
    for (const [key, value] of Object.entries(userConfig || {})) {
        if (value !== undefined && value !== null) {
            config[key] = value;
        }
    }
    
    // Validate
    const validation = validateConfig(config, schema);
    
    if (!validation.valid) {
        for (const error of validation.errors) {
            // Check if it's a missing optional field
            const field = error.match(/Missing required field: (\w+)/)?.[1];
            if (field && defaults[field] !== undefined) {
                warnings.push(`Using default value for ${field}`);
            } else {
                throw new Error(`Configuration error: ${error}`);
            }
        }
    }
    
    return { config, warnings };
}

module.exports = {
    validateConfig,
    validateApiKey,
    sanitizeInput,
    validateUrl,
    validateSelector,
    validateEnvironment,
    createValidatedConfig
};
