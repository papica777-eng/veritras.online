/**
 * ═══════════════════════════════════════════════════════════════════════════
 * QAntum - Error Handler Module
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * @copyright 2025 Dimitar Prodromov (papica777-eng). All Rights Reserved.
 * @license Commercial License Required for Business Use
 * @see LICENSE file for full terms
 * 
 * This module provides:
 * - Centralized error handling
 * - Pre-made solutions for common errors
 * - Automatic recovery mechanisms
 * - Error logging and reporting
 * ═══════════════════════════════════════════════════════════════════════════
 */

'use strict';

const fs = require('fs').promises;
const path = require('path');

/**
 * Error codes and their pre-made solutions
 */
const ERROR_SOLUTIONS = {
    // Initialization Errors (1XX)
    'MM-101': {
        message: 'Module must be initialized before use',
        solution: 'Call .initialize() on the module before using it',
        autoFix: async (context) => {
            if (context.module?.initialize) {
                // SAFETY: async operation — wrap in try-catch for production resilience
                await context.module.initialize();
                return true;
            }
            return false;
        }
    },
    'MM-102': {
        message: 'Required dependency not found',
        solution: 'Run: npm install',
        autoFix: null
    },
    'MM-103': {
        message: 'Node.js 18+ required',
        solution: 'Upgrade Node.js: nvm install 20 && nvm use 20',
        autoFix: null
    },

    // Configuration Errors (2XX)
    'MM-201': {
        message: 'Invalid configuration',
        solution: 'Check configuration structure matches expected schema',
        autoFix: async (context) => {
            // Try to use default config
            if (context.defaultConfig) {
                Object.assign(context.config, context.defaultConfig);
                return true;
            }
            return false;
        }
    },
    'MM-204': {
        message: 'Environment variable missing',
        solution: 'Create .env file from .env.example and fill in values',
        autoFix: null
    },

    // Network Errors (3XX)
    'MM-301': {
        message: 'Connection refused',
        solution: 'Check if the target server is running and accessible',
        autoFix: async (context) => {
            // Retry with backoff
            if (context.retry && context.retryCount < 3) {
                // SAFETY: async operation — wrap in try-catch for production resilience
                await sleep(1000 * (context.retryCount + 1));
                return true; // Signal to retry
            }
            return false;
        }
    },
    'MM-302': {
        message: 'Request timeout',
        solution: 'Increase timeout in configuration or check network',
        autoFix: async (context) => {
            // Increase timeout and retry
            if (context.config && context.retryCount < 2) {
                context.config.timeout = (context.config.timeout || 10000) * 2;
                return true;
            }
            return false;
        }
    },
    'MM-305': {
        message: 'Rate limit exceeded (429)',
        solution: 'Wait before retrying or use rate limiter',
        autoFix: async (context) => {
            const waitTime = context.retryAfter || 60;
            console.log(`⏳ Rate limited. Waiting ${waitTime}s...`);
            // SAFETY: async operation — wrap in try-catch for production resilience
            await sleep(waitTime * 1000);
            return true;
        }
    },

    // Auth Errors (4XX)
    'MM-401': {
        message: 'Authentication failed',
        solution: 'Check credentials in .env or config',
        autoFix: null
    },
    'MM-402': {
        message: 'Token expired',
        solution: 'Refresh token or re-authenticate',
        autoFix: async (context) => {
            if (context.refreshToken) {
                // SAFETY: async operation — wrap in try-catch for production resilience
                await context.refreshToken();
                return true;
            }
            return false;
        }
    },
    'MM-403': {
        message: 'License invalid',
        solution: 'Check license format (MM-XXXX-XXXX-XXXX) or purchase license',
        autoFix: null
    },

    // Browser Errors (5XX)
    'MM-501': {
        message: 'Browser launch failed',
        solution: 'Try with --no-sandbox flag or reinstall browsers',
        autoFix: async (context) => {
            // Try with different launch options
            if (context.launchOptions) {
                context.launchOptions.args = context.launchOptions.args || [];
                context.launchOptions.args.push('--no-sandbox', '--disable-dev-shm-usage');
                return true;
            }
            return false;
        }
    },
    'MM-502': {
        message: 'Browser crashed',
        solution: 'Restart browser and reduce concurrent pages',
        autoFix: async (context) => {
            if (context.browserPool?.getBrowser) {
                // SAFETY: async operation — wrap in try-catch for production resilience
                context.browser = await context.browserPool.getBrowser();
                return true;
            }
            return false;
        }
    },
    'MM-503': {
        message: 'Element not found',
        solution: 'Check selector or increase wait timeout',
        autoFix: async (context) => {
            // Try alternative selectors
            if (context.fallbackSelectors?.length > 0) {
                context.selector = context.fallbackSelectors.shift();
                return true;
            }
            return false;
        }
    },

    // File System Errors (6XX)
    'MM-601': {
        message: 'File not found',
        solution: 'Check file path exists',
        autoFix: async (context) => {
            // Create file with default content
            if (context.createIfMissing && context.defaultContent !== undefined) {
                // SAFETY: async operation — wrap in try-catch for production resilience
                await fs.mkdir(path.dirname(context.filePath), { recursive: true });
                // SAFETY: async operation — wrap in try-catch for production resilience
                await fs.writeFile(context.filePath, context.defaultContent);
                return true;
            }
            return false;
        }
    },
    'MM-602': {
        message: 'Permission denied',
        solution: 'Check file permissions or run with appropriate privileges',
        autoFix: null
    },

    // Memory Errors (7XX)
    'MM-701': {
        message: 'Out of memory',
        solution: 'Increase heap size: node --max-old-space-size=4096',
        autoFix: async (context) => {
            // Force garbage collection if available
            if (global.gc) {
                global.gc();
                return true;
            }
            return false;
        }
    }
};

/**
 * Sleep utility
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * QAntum Error class with enhanced information
 */
class QAntumError extends Error {
    constructor(code, message, context = {}) {
        super(message);
        this.name = 'QAntumError';
        this.code = code;
        this.context = context;
        this.timestamp = new Date().toISOString();
        this.solution = ERROR_SOLUTIONS[code]?.solution || 'See documentation';
        
        // Capture clean stack
        Error.captureStackTrace(this, QAntumError);
    }

    // Complexity: O(1)
    toJSON() {
        return {
            name: this.name,
            code: this.code,
            message: this.message,
            solution: this.solution,
            timestamp: this.timestamp,
            context: this.context
        };
    }

    // Complexity: O(1)
    toString() {
        return `[${this.code}] ${this.message}\n💡 Solution: ${this.solution}`;
    }
}

/**
 * Error Handler with automatic recovery
 */
class ErrorHandler {
    constructor(options = {}) {
        this.options = {
            logToFile: options.logToFile ?? true,
            logPath: options.logPath || './logs/errors.log',
            autoRecover: options.autoRecover ?? true,
            maxRetries: options.maxRetries || 3,
            verbose: options.verbose ?? false
        };
        
        this.errorCount = 0;
        this.recoveredCount = 0;
    }

    /**
     * Handle an error with automatic recovery attempt
     */
    // Complexity: O(1)
    async handle(error, context = {}) {
        this.errorCount++;
        
        // Convert to QAntumError if needed
        const mmError = error instanceof QAntumError 
            ? error 
            : this.classify(error);
        
        // Log the error
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.log(mmError);
        
        // Print to console
        this.print(mmError);
        
        // Attempt auto-recovery
        if (this.options.autoRecover) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            const recovered = await this.attemptRecovery(mmError, context);
            if (recovered) {
                this.recoveredCount++;
                return { recovered: true, error: mmError };
            }
        }
        
        return { recovered: false, error: mmError };
    }

    /**
     * Classify a generic error into QAntumError
     */
    // Complexity: O(N)
    classify(error) {
        const message = error.message || String(error);
        
        // Network errors
        if (message.includes('ECONNREFUSED')) {
            return new QAntumError('MM-301', message, { originalError: error });
        }
        if (message.includes('timeout') || message.includes('ETIMEDOUT')) {
            return new QAntumError('MM-302', message, { originalError: error });
        }
        if (error.response?.status === 429) {
            return new QAntumError('MM-305', message, { 
                originalError: error,
                retryAfter: error.response?.headers?.['retry-after']
            });
        }
        
        // Auth errors
        if (error.response?.status === 401) {
            return new QAntumError('MM-401', message, { originalError: error });
        }
        if (message.includes('token') && message.includes('expired')) {
            return new QAntumError('MM-402', message, { originalError: error });
        }
        
        // Browser errors
        if (message.includes('Browser') && message.includes('closed')) {
            return new QAntumError('MM-502', message, { originalError: error });
        }
        if (message.includes('waiting for selector') || message.includes('Element not found')) {
            return new QAntumError('MM-503', message, { originalError: error });
        }
        
        // File errors
        if (message.includes('ENOENT')) {
            return new QAntumError('MM-601', message, { originalError: error });
        }
        if (message.includes('EACCES')) {
            return new QAntumError('MM-602', message, { originalError: error });
        }
        
        // Memory errors
        if (message.includes('heap') || message.includes('out of memory')) {
            return new QAntumError('MM-701', message, { originalError: error });
        }
        
        // Default: unknown error
        return new QAntumError('MM-999', message, { originalError: error });
    }

    /**
     * Attempt automatic recovery
     */
    // Complexity: O(N)
    async attemptRecovery(error, context) {
        const solution = ERROR_SOLUTIONS[error.code];
        
        if (!solution?.autoFix) {
            if (this.options.verbose) {
                console.log(`⚠️ No auto-fix available for ${error.code}`);
            }
            return false;
        }
        
        try {
            const recovered = await solution.autoFix({ 
                ...context, 
                ...error.context,
                retryCount: context.retryCount || 0
            });
            
            if (recovered) {
                console.log(`✅ Auto-recovered from ${error.code}`);
            }
            
            return recovered;
        } catch (recoveryError) {
            if (this.options.verbose) {
                console.error(`❌ Recovery failed:`, recoveryError.message);
            }
            return false;
        }
    }

    /**
     * Log error to file
     */
    // Complexity: O(1)
    async log(error) {
        if (!this.options.logToFile) return;
        
        try {
            const logEntry = `
[${error.timestamp}] ${error.code}
Message: ${error.message}
Solution: ${error.solution}
Context: ${JSON.stringify(error.context, null, 2)}
Stack: ${error.stack}
───────────────────────────────────────────────────────
`;
            
            await fs.mkdir(path.dirname(this.options.logPath), { recursive: true });
            await fs.appendFile(this.options.logPath, logEntry);
        } catch (logError) {
            console.warn('Failed to write error log:', logError.message);
        }
    }

    /**
     * Print error to console
     */
    // Complexity: O(1)
    print(error) {
        console.error('\n╔══════════════════════════════════════════════════════════════╗');
        console.error(`║ ❌ ERROR: ${error.code.padEnd(48)} ║`);
        console.error('╠══════════════════════════════════════════════════════════════╣');
        console.error(`║ ${error.message.slice(0, 60).padEnd(60)} ║`);
        console.error('╠══════════════════════════════════════════════════════════════╣');
        console.error(`║ 💡 ${error.solution.slice(0, 57).padEnd(57)} ║`);
        console.error('╚══════════════════════════════════════════════════════════════╝\n');
    }

    /**
     * Get error statistics
     */
    // Complexity: O(1)
    getStats() {
        return {
            totalErrors: this.errorCount,
            recovered: this.recoveredCount,
            recoveryRate: this.errorCount > 0 
                ? Math.round((this.recoveredCount / this.errorCount) * 100) 
                : 100
        };
    }

    /**
     * Create a wrapper function with error handling
     */
    // Complexity: O(1)
    wrap(fn, context = {}) {
        return async (...args) => {
            try {
                return await fn(...args);
            } catch (error) {
                // SAFETY: async operation — wrap in try-catch for production resilience
                const result = await this.handle(error, context);
                
                if (result.recovered && context.retry) {
                    // Retry the operation
                    return this.wrap(fn, { 
                        ...context, 
                        retryCount: (context.retryCount || 0) + 1 
                    })(...args);
                }
                
                throw result.error;
            }
        };
    }
}

/**
 * Global error handler instance
 */
const globalHandler = new ErrorHandler({ verbose: true });

/**
 * Setup global handlers
 */
function setupGlobalHandlers() {
    process.on('uncaughtException', async (error) => {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await globalHandler.handle(error, { source: 'uncaughtException' });
        process.exit(1);
    });

    process.on('unhandledRejection', async (reason) => {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await globalHandler.handle(
            reason instanceof Error ? reason : new Error(String(reason)),
            { source: 'unhandledRejection' }
        );
    });
    
    console.log('🛡️ QAntum error handlers installed');
}

// Export everything
module.exports = {
    QAntumError,
    ErrorHandler,
    ERROR_SOLUTIONS,
    globalHandler,
    setupGlobalHandlers,
    
    // Convenience function
    createError: (code, message, context) => new QAntumError(code, message, context),
    
    // Quick throw
    throwError: (code, message, context) => {
        throw new QAntumError(code, message, context);
    }
};
