/**
 * QANTUM Security Module
 * Input validation, sanitization, and security checks
 */

const crypto = require('crypto');

/**
 * Validate and sanitize URL input
 */
function validateUrl(url) {
  if (!url || typeof url !== 'string') {
    return { valid: false, error: 'URL is required' };
  }

  // Remove whitespace
  url = url.trim();

  // Check for dangerous protocols
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];
  const lowerUrl = url.toLowerCase();
  
  for (const protocol of dangerousProtocols) {
    if (lowerUrl.startsWith(protocol)) {
      return { valid: false, error: `Dangerous protocol: ${protocol}` };
    }
  }

  // Validate URL format
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { valid: false, error: 'Only HTTP/HTTPS URLs allowed' };
    }
    return { valid: true, url: parsed.href };
  } catch (e) {
    return { valid: false, error: 'Invalid URL format' };
  }
}

/**
 * Validate selector input (CSS/XPath)
 */
function validateSelector(selector) {
  if (!selector || typeof selector !== 'string') {
    return { valid: false, error: 'Selector is required' };
  }

  selector = selector.trim();

  // Check max length
  if (selector.length > 1000) {
    return { valid: false, error: 'Selector too long (max 1000 chars)' };
  }

  // Check for script injection attempts
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,  // onclick=, onerror=, etc.
    /expression\s*\(/i,
    /url\s*\(\s*['"]?\s*javascript/i
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(selector)) {
      return { valid: false, error: 'Potentially dangerous selector content' };
    }
  }

  return { valid: true, selector };
}

/**
 * Validate test scenario input
 */
function validateScenario(scenario) {
  const errors = [];

  if (!scenario || typeof scenario !== 'object') {
    return { valid: false, errors: ['Scenario must be an object'] };
  }

  // Required fields
  if (!scenario.name || typeof scenario.name !== 'string') {
    errors.push('Scenario name is required');
  } else if (scenario.name.length > 200) {
    errors.push('Scenario name too long (max 200 chars)');
  }

  // Validate URL if present
  if (scenario.url) {
    const urlResult = validateUrl(scenario.url);
    if (!urlResult.valid) {
      errors.push(`Invalid URL: ${urlResult.error}`);
    }
  }

  // Validate steps if present
  if (scenario.steps) {
    if (!Array.isArray(scenario.steps)) {
      errors.push('Steps must be an array');
    } else if (scenario.steps.length > 100) {
      errors.push('Too many steps (max 100)');
    } else {
      scenario.steps.forEach((step, index) => {
        if (step.selector) {
          const selectorResult = validateSelector(step.selector);
          if (!selectorResult.valid) {
            errors.push(`Step ${index + 1}: ${selectorResult.error}`);
          }
        }
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Sanitize string for safe output
 */
function sanitizeOutput(str) {
  if (typeof str !== 'string') {
    return String(str);
  }

  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Generate secure random token
 */
function generateSecureToken(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Hash sensitive data
 */
function hashSensitiveData(data, salt = '') {
  return crypto
    .createHash('sha256')
    .update(data + salt)
    .digest('hex');
}

/**
 * Rate limiter for API endpoints
 */
class RateLimiter {
  constructor(windowMs = 60000, maxRequests = 100) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    this.requests = new Map();
  }

  // Complexity: O(1) — lookup
  isAllowed(clientId) {
    const now = Date.now();
    const clientData = this.requests.get(clientId) || { count: 0, windowStart: now };

    // Reset window if expired
    if (now - clientData.windowStart > this.windowMs) {
      clientData.count = 0;
      clientData.windowStart = now;
    }

    clientData.count++;
    this.requests.set(clientId, clientData);

    return clientData.count <= this.maxRequests;
  }

  // Complexity: O(1) — lookup
  getRemainingRequests(clientId) {
    const clientData = this.requests.get(clientId);
    if (!clientData) {
      return this.maxRequests;
    }
    return Math.max(0, this.maxRequests - clientData.count);
  }
}

/**
 * Validate license key format
 */
function validateLicenseKeyFormat(key) {
  if (!key || typeof key !== 'string') {
    return { valid: false, error: 'License key is required' };
  }

  // Format: MM-XXX-XXXXXXXX-XXXXXXXXXXXXXXXX
  const pattern = /^MM-(PRO|ENT|SRC)-[A-Z0-9]+-[A-F0-9]{16}$/i;
  
  if (!pattern.test(key)) {
    return { valid: false, error: 'Invalid license key format' };
  }

  return { valid: true };
}

/**
 * Check for common security issues in config
 */
function auditConfig(config) {
  const warnings = [];
  const errors = [];

  // Check for exposed secrets
  if (config.apiKey && config.apiKey.length < 20) {
    warnings.push('API key seems too short');
  }

  // Check for default/weak passwords
  const weakPasswords = ['password', '123456', 'admin', 'test'];
  if (config.password && weakPasswords.includes(config.password.toLowerCase())) {
    errors.push('Weak password detected');
  }

  // Check for localhost in production
  if (config.env === 'production') {
    if (config.host === 'localhost' || config.host === '127.0.0.1') {
      warnings.push('Using localhost in production');
    }
  }

  // Check SSL settings
  if (config.ssl === false && config.env === 'production') {
    warnings.push('SSL disabled in production');
  }

  return {
    secure: errors.length === 0,
    warnings,
    errors
  };
}

module.exports = {
  validateUrl,
  validateSelector,
  validateScenario,
  sanitizeOutput,
  generateSecureToken,
  hashSensitiveData,
  RateLimiter,
  validateLicenseKeyFormat,
  auditConfig
};
