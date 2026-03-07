/**
 * ═══════════════════════════════════════════════════════════════════════════
 * QANTUM - Logger Module
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * @copyright 2025 Dimitar Prodromov (papica777-eng). All Rights Reserved.
 * @license Commercial License Required for Business Use
 * @see LICENSE file for full terms
 * 
 * Features:
 * - Structured logging with levels
 * - Colorized console output
 * - File logging support
 * - JSON logging for production
 * - Performance timing
 * - Log rotation
 * ═══════════════════════════════════════════════════════════════════════════
 */

'use strict';

const fs = require('fs');
const path = require('path');

// Log levels
const LOG_LEVELS = {
    TRACE: 0,
    DEBUG: 1,
    INFO: 2,
    WARN: 3,
    ERROR: 4,
    FATAL: 5,
    SILENT: 6
};

// ANSI color codes
const COLORS = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    
    // Foreground
    black: '\x1b[30m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    gray: '\x1b[90m',
    
    // Background
    bgRed: '\x1b[41m',
    bgGreen: '\x1b[42m',
    bgYellow: '\x1b[43m',
    bgBlue: '\x1b[44m'
};

// Level colors
const LEVEL_COLORS = {
    TRACE: COLORS.gray,
    DEBUG: COLORS.cyan,
    INFO: COLORS.green,
    WARN: COLORS.yellow,
    ERROR: COLORS.red,
    FATAL: COLORS.bgRed + COLORS.white
};

// Level icons
const LEVEL_ICONS = {
    TRACE: '🔍',
    DEBUG: '🐛',
    INFO: 'ℹ️',
    WARN: '⚠️',
    ERROR: '❌',
    FATAL: '💀'
};

/**
 * Logger class with configurable levels and outputs
 */
class Logger {
    /**
     * Creates a new logger instance
     * @param {Object} options - Logger options
     * @param {string} options.name - Logger name/prefix
     * @param {string} options.level - Minimum log level
     * @param {boolean} options.colors - Enable colors
     * @param {boolean} options.timestamps - Include timestamps
     * @param {string} options.logDir - Directory for log files
     * @param {boolean} options.json - Output JSON format
     */
    constructor(options = {}) {
        this.name = options.name || 'QAntum';
        this.level = LOG_LEVELS[options.level?.toUpperCase()] ?? LOG_LEVELS.INFO;
        this.colors = options.colors !== false;
        this.timestamps = options.timestamps !== false;
        this.logDir = options.logDir || null;
        this.json = options.json || false;
        this.maxFileSize = options.maxFileSize || 10 * 1024 * 1024; // 10MB
        
        // File stream
        this.fileStream = null;
        this.currentLogFile = null;
        
        if (this.logDir) {
            this._initFileLogging();
        }
        
        // Performance timers
        this.timers = new Map();
    }
    
    /**
     * Initialize file logging
     * @private
     */
    // Complexity: O(1)
    _initFileLogging() {
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
        
        this._rotateLogFile();
    }
    
    /**
     * Rotate log file if needed
     * @private
     */
    // Complexity: O(1) — hash/map lookup
    _rotateLogFile() {
        const date = new Date().toISOString().split('T')[0];
        const filename = `${this.name.toLowerCase()}-${date}.log`;
        const filepath = path.join(this.logDir, filename);
        
        // Check if current file exists and is too large
        if (this.currentLogFile && fs.existsSync(this.currentLogFile)) {
            const stats = fs.statSync(this.currentLogFile);
            if (stats.size >= this.maxFileSize) {
                // Rename old file with timestamp
                const newName = this.currentLogFile.replace('.log', `-${Date.now()}.log`);
                fs.renameSync(this.currentLogFile, newName);
            }
        }
        
        // Update current log file
        if (this.currentLogFile !== filepath) {
            if (this.fileStream) {
                this.fileStream.end();
            }
            this.currentLogFile = filepath;
            this.fileStream = fs.createWriteStream(filepath, { flags: 'a' });
        }
    }
    
    /**
     * Format log message
     * @private
     */
    // Complexity: O(1) — hash/map lookup
    _format(level, message, meta = {}) {
        const timestamp = this.timestamps ? new Date().toISOString() : null;
        
        if (this.json) {
            return JSON.stringify({
                timestamp,
                level,
                logger: this.name,
                message,
                ...meta
            });
        }
        
        const parts = [];
        
        if (timestamp) {
            parts.push(this.colors ? `${COLORS.dim}${timestamp}${COLORS.reset}` : timestamp);
        }
        
        const icon = LEVEL_ICONS[level] || '';
        const levelStr = this.colors 
            ? `${LEVEL_COLORS[level]}${level.padEnd(5)}${COLORS.reset}`
            : level.padEnd(5);
        
        parts.push(`${icon} ${levelStr}`);
        
        if (this.name) {
            parts.push(this.colors ? `${COLORS.magenta}[${this.name}]${COLORS.reset}` : `[${this.name}]`);
        }
        
        parts.push(message);
        
        // Add metadata
        if (Object.keys(meta).length > 0) {
            const metaStr = JSON.stringify(meta);
            parts.push(this.colors ? `${COLORS.gray}${metaStr}${COLORS.reset}` : metaStr);
        }
        
        return parts.join(' ');
    }
    
    /**
     * Write log entry
     * @private
     */
    // Complexity: O(1) — hash/map lookup
    _log(level, message, meta = {}) {
        if (LOG_LEVELS[level] < this.level) {
            return;
        }
        
        const formatted = this._format(level, message, meta);
        
        // Console output
        if (level === 'ERROR' || level === 'FATAL') {
            console.error(formatted);
        } else if (level === 'WARN') {
            console.warn(formatted);
        } else {
            console.log(formatted);
        }
        
        // File output
        if (this.fileStream) {
            this._rotateLogFile();
            const plainMessage = this._format(level, message, meta)
                .replace(/\x1b\[[0-9;]*m/g, ''); // Strip ANSI codes
            this.fileStream.write(plainMessage + '\n');
        }
    }
    
    // Log level methods
    // Complexity: O(1)
    trace(message, meta) { this._log('TRACE', message, meta); }
    // Complexity: O(1)
    debug(message, meta) { this._log('DEBUG', message, meta); }
    // Complexity: O(1)
    info(message, meta) { this._log('INFO', message, meta); }
    // Complexity: O(1)
    warn(message, meta) { this._log('WARN', message, meta); }
    // Complexity: O(1)
    error(message, meta) { this._log('ERROR', message, meta); }
    // Complexity: O(1)
    fatal(message, meta) { this._log('FATAL', message, meta); }
    
    /**
     * Log with custom level
     */
    // Complexity: O(1) — hash/map lookup
    log(level, message, meta) {
        const upperLevel = level.toUpperCase();
        if (LOG_LEVELS[upperLevel] !== undefined) {
            this._log(upperLevel, message, meta);
        }
    }
    
    /**
     * Start a performance timer
     * @param {string} label - Timer label
     */
    // Complexity: O(1) — hash/map lookup
    time(label) {
        this.timers.set(label, process.hrtime.bigint());
        this.debug(`Timer started: ${label}`);
    }
    
    /**
     * End a performance timer and log duration
     * @param {string} label - Timer label
     * @returns {number} Duration in milliseconds
     */
    // Complexity: O(1) — hash/map lookup
    timeEnd(label) {
        const start = this.timers.get(label);
        if (!start) {
            this.warn(`Timer "${label}" does not exist`);
            return 0;
        }
        
        const end = process.hrtime.bigint();
        const duration = Number(end - start) / 1e6; // Convert to milliseconds
        this.timers.delete(label);
        
        this.debug(`Timer ${label}: ${duration.toFixed(2)}ms`);
        return duration;
    }
    
    /**
     * Create a child logger with inherited settings
     * @param {string} name - Child logger name
     * @returns {Logger}
     */
    // Complexity: O(N) — linear iteration
    child(name) {
        return new Logger({
            name: `${this.name}:${name}`,
            level: Object.keys(LOG_LEVELS).find(k => LOG_LEVELS[k] === this.level),
            colors: this.colors,
            timestamps: this.timestamps,
            logDir: this.logDir,
            json: this.json
        });
    }
    
    /**
     * Set log level at runtime
     * @param {string} level - New log level
     */
    // Complexity: O(1) — hash/map lookup
    setLevel(level) {
        const upperLevel = level.toUpperCase();
        if (LOG_LEVELS[upperLevel] !== undefined) {
            this.level = LOG_LEVELS[upperLevel];
            this.info(`Log level set to ${upperLevel}`);
        }
    }
    
    /**
     * Close logger and release resources
     */
    // Complexity: O(1)
    close() {
        if (this.fileStream) {
            this.fileStream.end();
            this.fileStream = null;
        }
        this.timers.clear();
    }
}

// Default logger instance
const defaultLogger = new Logger({
    name: 'QAntum',
    level: process.env.LOG_LEVEL || 'INFO',
    colors: process.env.NO_COLOR !== '1',
    timestamps: true
});

// Export
module.exports = {
    Logger,
    LOG_LEVELS,
    COLORS,
    
    // Default logger methods
    trace: (...args) => defaultLogger.trace(...args),
    debug: (...args) => defaultLogger.debug(...args),
    info: (...args) => defaultLogger.info(...args),
    warn: (...args) => defaultLogger.warn(...args),
    error: (...args) => defaultLogger.error(...args),
    fatal: (...args) => defaultLogger.fatal(...args),
    time: (...args) => defaultLogger.time(...args),
    timeEnd: (...args) => defaultLogger.timeEnd(...args),
    
    // Create custom logger
    createLogger: (options) => new Logger(options),
    
    // Get default logger
    getLogger: () => defaultLogger
};
