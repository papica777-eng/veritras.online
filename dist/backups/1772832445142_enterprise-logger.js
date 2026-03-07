"use strict";
/**
 * 🏢 QANTUM ENTERPRISE LOGGER
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Centralized logging system with environment-based filtering.
 * Replaces 148+ console.log calls with structured, performant logging.
 *
 * Features:
 * - Environment-based log levels (DEBUG, INFO, WARN, ERROR)
 * - Structured JSON output for production
 * - Performance-optimized (no-op in production for debug)
 * - Color-coded console output for development
 * - Automatic context injection
 * - Log rotation ready
 *
 * @version 1.0.0
 * @author QAntum AI Architect
 * @phase Quick Win #1
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
exports.fatal = exports.error = exports.warn = exports.info = exports.debug = exports.logger = exports.EnterpriseLogger = void 0;
exports.getLogger = getLogger;
exports.createLogger = createLogger;
exports.configureLogger = configureLogger;
const events_1 = require("events");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════
const LOG_LEVELS = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
    fatal: 4,
    silent: 5
};
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
    // Background
    bgRed: '\x1b[41m',
    bgYellow: '\x1b[43m',
};
const LEVEL_COLORS = {
    debug: COLORS.dim + COLORS.cyan,
    info: COLORS.green,
    warn: COLORS.yellow,
    error: COLORS.red,
    fatal: COLORS.bgRed + COLORS.white + COLORS.bright,
    silent: ''
};
const LEVEL_ICONS = {
    debug: '🔍',
    info: '📘',
    warn: '⚠️',
    error: '❌',
    fatal: '💀',
    silent: ''
};
const DEFAULT_CONFIG = {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.NODE_ENV === 'production' ? 'json' : 'pretty',
    colorize: process.env.NODE_ENV !== 'production',
    includeTimestamp: true,
    includeContext: true
};
// ═══════════════════════════════════════════════════════════════════════════════
// ENTERPRISE LOGGER
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * 🏢 EnterpriseLogger - Production-grade logging
 */
class EnterpriseLogger extends events_1.EventEmitter {
    config;
    context;
    correlationId;
    fileStream;
    buffer = [];
    flushInterval;
    constructor(context = 'QAntum', config = {}) {
        super();
        this.config = { ...DEFAULT_CONFIG, ...config };
        this.context = context;
        // Setup file output if configured
        if (this.config.outputFile) {
            this.setupFileOutput();
        }
        // Setup periodic flush
        this.flushInterval = setInterval(() => this.flush(), 5000);
    }
    /**
     * Create a child logger with inherited context
     */
    // Complexity: O(1)
    child(childContext) {
        const childLogger = new EnterpriseLogger(`${this.context}:${childContext}`, this.config);
        childLogger.correlationId = this.correlationId;
        return childLogger;
    }
    /**
     * Set correlation ID for request tracing
     */
    // Complexity: O(1)
    setCorrelationId(id) {
        this.correlationId = id;
        return this;
    }
    /**
     * 🔍 Debug - Only in development
     */
    // Complexity: O(1)
    debug(message, data) {
        this.log('debug', message, data);
    }
    /**
     * 📘 Info - General information
     */
    // Complexity: O(1)
    info(message, data) {
        this.log('info', message, data);
    }
    /**
     * ⚠️ Warn - Potential issues
     */
    // Complexity: O(1)
    warn(message, data) {
        this.log('warn', message, data);
    }
    /**
     * ❌ Error - Errors with optional error object
     */
    // Complexity: O(1)
    error(message, error, data) {
        const errorData = error instanceof Error ? {
            name: error.name,
            message: error.message,
            stack: error.stack
        } : undefined;
        this.log('error', message, data, errorData);
    }
    /**
     * 💀 Fatal - Critical errors
     */
    // Complexity: O(1)
    fatal(message, error, data) {
        const errorData = error instanceof Error ? {
            name: error.name,
            message: error.message,
            stack: error.stack
        } : undefined;
        this.log('fatal', message, data, errorData);
    }
    /**
     * ⏱️ Timer - Measure operation duration
     */
    // Complexity: O(N) — potential recursive descent
    time(label) {
        const start = performance.now();
        return () => {
            const duration = performance.now() - start;
            this.info(`${label} completed`, { duration: `${duration.toFixed(2)}ms` });
        };
    }
    /**
     * 📊 Table - Log structured data as table
     */
    // Complexity: O(N) — potential recursive descent
    table(data) {
        if (this.config.format === 'pretty' && !this.isLevelEnabled('debug'))
            return;
        console.table(data);
    }
    /**
     * 📦 Group - Start a log group
     */
    // Complexity: O(1)
    group(label) {
        if (this.config.format === 'pretty') {
            console.group(`${COLORS.bright}${label}${COLORS.reset}`);
        }
    }
    /**
     * 📦 GroupEnd - End a log group
     */
    // Complexity: O(1)
    groupEnd() {
        if (this.config.format === 'pretty') {
            console.groupEnd();
        }
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // INTERNAL
    // ═══════════════════════════════════════════════════════════════════════════
    // Complexity: O(1)
    log(level, message, data, error) {
        // Early exit if level is below threshold
        if (!this.isLevelEnabled(level))
            return;
        const entry = {
            timestamp: new Date().toISOString(),
            level,
            message,
            context: this.config.includeContext ? this.context : undefined,
            data,
            error,
            correlationId: this.correlationId
        };
        // Emit event for external handlers
        this.emit('log', entry);
        // Output based on format
        switch (this.config.format) {
            case 'json':
                this.outputJSON(entry);
                break;
            case 'pretty':
                this.outputPretty(entry);
                break;
            case 'minimal':
                this.outputMinimal(entry);
                break;
        }
        // Buffer for file output
        if (this.config.outputFile) {
            this.buffer.push(entry);
        }
    }
    // Complexity: O(1) — hash/map lookup
    isLevelEnabled(level) {
        return LOG_LEVELS[level] >= LOG_LEVELS[this.config.level];
    }
    // Complexity: O(1)
    outputJSON(entry) {
        const output = JSON.stringify(entry);
        if (entry.level === 'error' || entry.level === 'fatal') {
            console.error(output);
        }
        else {
            console.log(output);
        }
    }
    // Complexity: O(1) — amortized
    outputPretty(entry) {
        const color = this.config.colorize ? LEVEL_COLORS[entry.level] : '';
        const reset = this.config.colorize ? COLORS.reset : '';
        const icon = LEVEL_ICONS[entry.level];
        let output = '';
        // Timestamp
        if (this.config.includeTimestamp) {
            const time = new Date(entry.timestamp).toLocaleTimeString();
            output += `${COLORS.dim}[${time}]${reset} `;
        }
        // Level
        output += `${color}${icon} ${entry.level.toUpperCase().padEnd(5)}${reset} `;
        // Context
        if (entry.context) {
            output += `${COLORS.cyan}[${entry.context}]${reset} `;
        }
        // Message
        output += entry.message;
        // Data
        if (entry.data && Object.keys(entry.data).length > 0) {
            output += ` ${COLORS.dim}${JSON.stringify(entry.data)}${reset}`;
        }
        // Error
        if (entry.error) {
            output += `\n${COLORS.red}  └─ ${entry.error.name}: ${entry.error.message}${reset}`;
            if (entry.error.stack && this.config.level === 'debug') {
                output += `\n${COLORS.dim}${entry.error.stack}${reset}`;
            }
        }
        console.log(output);
    }
    // Complexity: O(1)
    outputMinimal(entry) {
        const prefix = `[${entry.level.charAt(0).toUpperCase()}]`;
        console.log(`${prefix} ${entry.message}`);
    }
    // Complexity: O(1)
    setupFileOutput() {
        const dir = path.dirname(this.config.outputFile);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        this.fileStream = fs.createWriteStream(this.config.outputFile, { flags: 'a' });
    }
    // Complexity: O(N) — linear iteration
    flush() {
        if (this.buffer.length === 0 || !this.fileStream)
            return;
        const entries = this.buffer.splice(0, this.buffer.length);
        const output = entries.map(e => JSON.stringify(e)).join('\n') + '\n';
        this.fileStream.write(output);
    }
    /**
     * Cleanup resources
     */
    // Complexity: O(1)
    destroy() {
        if (this.flushInterval) {
            // Complexity: O(1)
            clearInterval(this.flushInterval);
        }
        this.flush();
        if (this.fileStream) {
            this.fileStream.end();
        }
    }
}
exports.EnterpriseLogger = EnterpriseLogger;
// ═══════════════════════════════════════════════════════════════════════════════
// SINGLETON & FACTORY
// ═══════════════════════════════════════════════════════════════════════════════
let globalLogger = null;
/**
 * Get the global logger instance (Singleton)
 */
function getLogger() {
    if (!globalLogger) {
        globalLogger = new EnterpriseLogger('QAntum');
    }
    return globalLogger;
}
/**
 * Create a new logger with custom context
 */
function createLogger(context, config) {
    return new EnterpriseLogger(context, config);
}
/**
 * Configure the global logger
 */
function configureLogger(config) {
    globalLogger = new EnterpriseLogger('QAntum', config);
}
// ═══════════════════════════════════════════════════════════════════════════════
// CONVENIENCE EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════
exports.logger = getLogger();
// Quick access functions
const debug = (msg, data) => exports.logger.debug(msg, data);
exports.debug = debug;
const info = (msg, data) => exports.logger.info(msg, data);
exports.info = info;
const warn = (msg, data) => exports.logger.warn(msg, data);
exports.warn = warn;
const error = (msg, err, data) => exports.logger.error(msg, err, data);
exports.error = error;
const fatal = (msg, err, data) => exports.logger.fatal(msg, err, data);
exports.fatal = fatal;
exports.default = EnterpriseLogger;
