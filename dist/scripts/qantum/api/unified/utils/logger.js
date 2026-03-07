"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * MIND-ENGINE: PROFESSIONAL LOGGER
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Production-grade logging with Winston
 * Structured logs, rotation, multiple transports
 *
 * @author Dimitar Prodromov
 * @version 1.0.0
 * @license Commercial
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
exports.logger = exports.Logger = void 0;
exports.getLogger = getLogger;
exports.createLogger = createLogger;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const events_1 = require("events");
// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════
const LOG_LEVELS = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
    trace: 5
};
const COLORS = {
    error: '\x1b[31m', // Red
    warn: '\x1b[33m', // Yellow
    info: '\x1b[36m', // Cyan
    http: '\x1b[35m', // Magenta
    debug: '\x1b[32m', // Green
    trace: '\x1b[90m' // Gray
};
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
// ═══════════════════════════════════════════════════════════════════════════════
// LOGGER CLASS
// ═══════════════════════════════════════════════════════════════════════════════
class Logger extends events_1.EventEmitter {
    config;
    fileStream;
    currentFileSize = 0;
    fileIndex = 0;
    constructor(config) {
        super();
        this.config = {
            level: config?.level ?? 'info',
            format: config?.format ?? 'pretty',
            outputs: config?.outputs ?? ['console'],
            filePath: config?.filePath,
            maxFileSize: config?.maxFileSize ?? 10 * 1024 * 1024, // 10MB
            maxFiles: config?.maxFiles ?? 5,
            colorize: config?.colorize ?? true
        };
        if (this.config.outputs.includes('file') && this.config.filePath) {
            this.initFileStream();
        }
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // PUBLIC METHODS
    // ═══════════════════════════════════════════════════════════════════════════
    // Complexity: O(1)
    error(message, meta) {
        this.log('error', message, meta);
    }
    // Complexity: O(1)
    warn(message, meta) {
        this.log('warn', message, meta);
    }
    // Complexity: O(1)
    info(message, meta) {
        this.log('info', message, meta);
    }
    // Complexity: O(1)
    http(message, meta) {
        this.log('http', message, meta);
    }
    // Complexity: O(1)
    debug(message, meta) {
        this.log('debug', message, meta);
    }
    // Complexity: O(1)
    trace(message, meta) {
        this.log('trace', message, meta);
    }
    /**
     * Create child logger with context
     */
    // Complexity: O(1)
    child(context) {
        return new ChildLogger(this, context);
    }
    /**
     * Log with request ID for tracing
     */
    // Complexity: O(1)
    withRequestId(requestId) {
        return new RequestLogger(this, requestId);
    }
    /**
     * Flush and close file streams
     */
    // Complexity: O(1)
    async close() {
        if (this.fileStream) {
            return new Promise((resolve) => {
                this.fileStream.end(() => resolve());
            });
        }
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // PRIVATE METHODS
    // ═══════════════════════════════════════════════════════════════════════════
    // Complexity: O(N)
    log(level, message, meta, requestId, context) {
        // Check if we should log this level
        if (LOG_LEVELS[level] > LOG_LEVELS[this.config.level]) {
            return;
        }
        const metaObj = (typeof meta === 'object' && meta !== null) ? meta : undefined;
        const entry = {
            timestamp: new Date().toISOString(),
            level,
            message,
            ...(requestId && { requestId }),
            ...(context && { context }),
            ...(metaObj && Object.keys(metaObj).length > 0 && { meta: metaObj })
        };
        // Handle error objects
        if (metaObj?.error instanceof Error) {
            entry.stack = metaObj.error.stack;
            entry.meta = {
                ...(entry.meta || {}),
                errorName: metaObj.error.name,
                errorMessage: metaObj.error.message
            };
            // Complexity: O(1)
            delete entry.meta.error;
        }
        // Output to configured destinations
        if (this.config.outputs.includes('console')) {
            this.writeConsole(entry);
        }
        if (this.config.outputs.includes('file') && this.fileStream) {
            this.writeFile(entry);
        }
        // Emit for external handlers
        this.emit('log', entry);
    }
    // Complexity: O(1) — hash/map lookup
    writeConsole(entry) {
        const { level, timestamp, message, requestId, context, meta, stack, duration } = entry;
        if (this.config.format === 'json') {
            console.log(JSON.stringify(entry));
            return;
        }
        // Pretty format
        const color = this.config.colorize ? COLORS[level] : '';
        const reset = this.config.colorize ? RESET : '';
        const bold = this.config.colorize ? BOLD : '';
        const time = timestamp.split('T')[1].slice(0, 12);
        const levelStr = level.toUpperCase().padEnd(5);
        let line = `${color}${time} ${bold}${levelStr}${reset}${color}`;
        if (context) {
            line += ` [${context}]`;
        }
        if (requestId) {
            line += ` (${requestId.slice(0, 8)})`;
        }
        line += ` ${message}`;
        if (duration !== undefined) {
            line += ` ${bold}+${duration}ms${reset}${color}`;
        }
        line += reset;
        console.log(line);
        if (meta && Object.keys(meta).length > 0) {
            console.log(`  ${JSON.stringify(meta)}`);
        }
        if (stack) {
            console.log(`  ${stack.split('\n').slice(1).join('\n  ')}`);
        }
    }
    // Complexity: O(1)
    writeFile(entry) {
        if (!this.fileStream)
            return;
        const line = JSON.stringify(entry) + '\n';
        const lineSize = Buffer.byteLength(line);
        // Check if rotation needed
        if (this.currentFileSize + lineSize > this.config.maxFileSize) {
            this.rotateFile();
        }
        this.fileStream.write(line);
        this.currentFileSize += lineSize;
    }
    // Complexity: O(1)
    initFileStream() {
        const dir = path.dirname(this.config.filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        this.fileStream = fs.createWriteStream(this.config.filePath, { flags: 'a' });
        try {
            const stats = fs.statSync(this.config.filePath);
            this.currentFileSize = stats.size;
        }
        catch {
            this.currentFileSize = 0;
        }
    }
    // Complexity: O(N) — linear iteration
    rotateFile() {
        if (!this.fileStream || !this.config.filePath)
            return;
        this.fileStream.end();
        // Rotate existing files
        for (let i = this.config.maxFiles - 1; i > 0; i--) {
            const oldPath = `${this.config.filePath}.${i}`;
            const newPath = `${this.config.filePath}.${i + 1}`;
            if (fs.existsSync(oldPath)) {
                if (i === this.config.maxFiles - 1) {
                    fs.unlinkSync(oldPath);
                }
                else {
                    fs.renameSync(oldPath, newPath);
                }
            }
        }
        // Rename current file
        if (fs.existsSync(this.config.filePath)) {
            fs.renameSync(this.config.filePath, `${this.config.filePath}.1`);
        }
        // Create new file
        this.fileStream = fs.createWriteStream(this.config.filePath, { flags: 'a' });
        this.currentFileSize = 0;
    }
    // Internal method for child/request loggers
    // Complexity: O(1)
    _log(level, message, meta, requestId, context) {
        this.log(level, message, meta, requestId, context);
    }
}
exports.Logger = Logger;
// ═══════════════════════════════════════════════════════════════════════════════
// CHILD LOGGER
// ═══════════════════════════════════════════════════════════════════════════════
class ChildLogger {
    parent;
    context;
    constructor(parent, context) {
        this.parent = parent;
        this.context = context;
    }
    // Complexity: O(1)
    error(message, meta) {
        this.parent._log('error', message, meta, undefined, this.context);
    }
    // Complexity: O(1)
    warn(message, meta) {
        this.parent._log('warn', message, meta, undefined, this.context);
    }
    // Complexity: O(1)
    info(message, meta) {
        this.parent._log('info', message, meta, undefined, this.context);
    }
    // Complexity: O(1)
    http(message, meta) {
        this.parent._log('http', message, meta, undefined, this.context);
    }
    // Complexity: O(1)
    debug(message, meta) {
        this.parent._log('debug', message, meta, undefined, this.context);
    }
    // Complexity: O(1)
    trace(message, meta) {
        this.parent._log('trace', message, meta, undefined, this.context);
    }
}
// ═══════════════════════════════════════════════════════════════════════════════
// REQUEST LOGGER
// ═══════════════════════════════════════════════════════════════════════════════
class RequestLogger {
    parent;
    requestId;
    constructor(parent, requestId) {
        this.parent = parent;
        this.requestId = requestId;
    }
    // Complexity: O(1)
    error(message, meta) {
        this.parent._log('error', message, meta, this.requestId);
    }
    // Complexity: O(1)
    warn(message, meta) {
        this.parent._log('warn', message, meta, this.requestId);
    }
    // Complexity: O(1)
    info(message, meta) {
        this.parent._log('info', message, meta, this.requestId);
    }
    // Complexity: O(1)
    http(message, meta) {
        this.parent._log('http', message, meta, this.requestId);
    }
    // Complexity: O(1)
    debug(message, meta) {
        this.parent._log('debug', message, meta, this.requestId);
    }
    // Complexity: O(1)
    trace(message, meta) {
        this.parent._log('trace', message, meta, this.requestId);
    }
}
// ═══════════════════════════════════════════════════════════════════════════════
// SINGLETON INSTANCE
// ═══════════════════════════════════════════════════════════════════════════════
let defaultLogger = null;
function getLogger() {
    if (!defaultLogger) {
        defaultLogger = new Logger({
            level: process.env.LOG_LEVEL || 'info',
            format: process.env.NODE_ENV === 'production' ? 'json' : 'pretty',
            outputs: ['console'],
            colorize: process.env.NODE_ENV !== 'production'
        });
    }
    return defaultLogger;
}
function createLogger(config) {
    return new Logger(config);
}
// ═══════════════════════════════════════════════════════════════════════════════
// GLOBAL LOGGER INSTANCE
// ═══════════════════════════════════════════════════════════════════════════════
// This is the default logger instance that can be imported directly:
// import { logger } from './logger';
// ═══════════════════════════════════════════════════════════════════════════════
exports.logger = getLogger();
exports.default = Logger;
