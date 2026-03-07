"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                               ║
 * ║   ████████╗ ██████╗  ██████╗ ██╗                                              ║
 * ║   ╚══██╔══╝██╔═══██╗██╔═══██╗██║                                              ║
 * ║      ██║   ██║   ██║██║   ██║██║                                              ║
 * ║      ██║   ██║   ██║██║   ██║██║                                              ║
 * ║      ██║   ╚██████╔╝╚██████╔╝███████╗                                         ║
 * ║      ╚═╝    ╚═════╝  ╚═════╝ ╚══════╝                                         ║
 * ║                                                                               ║
 * ║   ███████╗██╗  ██╗███████╗ ██████╗██╗   ██╗████████╗ ██████╗ ██████╗          ║
 * ║   ██╔════╝╚██╗██╔╝██╔════╝██╔════╝██║   ██║╚══██╔══╝██╔═══██╗██╔══██╗         ║
 * ║   █████╗   ╚███╔╝ █████╗  ██║     ██║   ██║   ██║   ██║   ██║██████╔╝         ║
 * ║   ██╔══╝   ██╔██╗ ██╔══╝  ██║     ██║   ██║   ██║   ██║   ██║██╔══██╗         ║
 * ║   ███████╗██╔╝ ██╗███████╗╚██████╗╚██████╔╝   ██║   ╚██████╔╝██║  ██║         ║
 * ║   ╚══════╝╚═╝  ╚═╝╚══════╝ ╚═════╝ ╚═════╝    ╚═╝    ╚═════╝ ╚═╝  ╚═╝         ║
 * ║                                                                               ║
 * ║   QAntum v29.0 "THE OMNIPOTENT NEXUS" - Secure Tool Executor                  ║
 * ║   "Сигурно изпълнение с Fortress защита и Fatality мониторинг"                ║
 * ║                                                                               ║
 * ║   © 2025-2026 QAntum | Dimitar Prodromov                                      ║
 * ║                                                                               ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
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
exports.getToolExecutor = exports.ToolExecutor = void 0;
const events_1 = require("events");
const crypto = __importStar(require("crypto"));
const https = __importStar(require("https"));
const http = __importStar(require("http"));
const ToolRegistry_1 = require("./ToolRegistry");
// ═══════════════════════════════════════════════════════════════════════════════
// DEFAULT CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════
const DEFAULT_CONFIG = {
    defaultTimeoutMs: 30000,
    maxTimeoutMs: 120000,
    defaultRetries: 3,
    maxRetries: 5,
    retryDelayMs: 1000,
    exponentialBackoff: true,
    enableGhostProtocol: true,
    enableFatalityMonitoring: true,
    fatalityThreshold: 5,
    enableRateLimiting: true,
    globalRateLimit: {
        requests: 100,
        windowMs: 60000
    }
};
const DEFAULT_GHOST_CONFIG = {
    enableTLSPhantom: true,
    ja3Fingerprint: 'chrome_120',
    enableWebGLSpoofing: true,
    gpuVendor: 'Google Inc. (NVIDIA)',
    gpuRenderer: 'ANGLE (NVIDIA, NVIDIA GeForce RTX 4050 Direct3D11 vs_5_0 ps_5_0)',
    enableBiometricInjection: false,
    rotateUserAgent: true,
    customHeaders: {
        'Accept-Language': 'en-US,en;q=0.9,bg;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
    }
};
// ═══════════════════════════════════════════════════════════════════════════════
// USER AGENTS FOR ROTATION
// ═══════════════════════════════════════════════════════════════════════════════
const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
];
// ═══════════════════════════════════════════════════════════════════════════════
// TOOL EXECUTOR
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * ToolExecutor - Secure Tool Execution Engine
 *
 * Executes MCP tools with:
 * - Fortress-level API key encryption
 * - Ghost Protocol for stealth requests
 * - Fatality Engine for abuse monitoring
 * - Automatic retries with exponential backoff
 * - Learning from execution outcomes
 *
 * @example
 * ```typescript
 * const executor = ToolExecutor.getInstance();
 *
 * const result = await executor.execute({
 *   toolId: 'mcp-apify',
 *   operationId: 'runActor',
 *   parameters: {
 *     actorId: 'apify/web-scraper',
 *     input: { startUrls: [{ url: 'https://example.com' }] }
 *   }
 * });
 *
 * if (result.success) {
 *   console.log('Data:', result.data);
 * }
 * ```
 */
class ToolExecutor extends events_1.EventEmitter {
    static instance;
    config;
    ghostConfig;
    registry;
    // API Keys (encrypted in memory)
    encryptedKeys = new Map();
    encryptionKey;
    // Rate limiting
    requestCounts = new Map();
    // Fatality tracking
    failureCounts = new Map();
    circuitBroken = new Set();
    // Execution history
    executionHistory = [];
    lessonsLearned = [];
    constructor(config = {}, ghostConfig = {}) {
        super();
        this.config = { ...DEFAULT_CONFIG, ...config };
        this.ghostConfig = { ...DEFAULT_GHOST_CONFIG, ...ghostConfig };
        this.registry = (0, ToolRegistry_1.getToolRegistry)();
        // Generate encryption key for API keys in memory
        this.encryptionKey = crypto.randomBytes(32);
        // Load API keys from environment
        this.loadApiKeys();
    }
    /**
     * Get singleton instance
     */
    static getInstance(config, ghostConfig) {
        if (!ToolExecutor.instance) {
            ToolExecutor.instance = new ToolExecutor(config, ghostConfig);
        }
        return ToolExecutor.instance;
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // API KEY MANAGEMENT (Fortress Layer)
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Load and encrypt API keys from environment
     */
    loadApiKeys() {
        const tools = this.registry.getAllTools();
        for (const tool of tools) {
            if (tool.envKeyName) {
                const key = process.env[tool.envKeyName];
                if (key) {
                    this.encryptAndStore(tool.id, key);
                }
            }
        }
        console.log(`🔐 Loaded ${this.encryptedKeys.size} API keys (encrypted in memory)`);
    }
    /**
     * Encrypt and store API key
     */
    encryptAndStore(toolId, apiKey) {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv('aes-256-gcm', this.encryptionKey, iv);
        const encrypted = Buffer.concat([
            iv,
            cipher.update(apiKey, 'utf8'),
            cipher.final(),
            cipher.getAuthTag()
        ]);
        this.encryptedKeys.set(toolId, encrypted);
    }
    /**
     * Decrypt API key for use
     */
    decryptKey(toolId) {
        const encrypted = this.encryptedKeys.get(toolId);
        if (!encrypted)
            return null;
        try {
            const iv = encrypted.subarray(0, 16);
            const authTag = encrypted.subarray(-16);
            const data = encrypted.subarray(16, -16);
            const decipher = crypto.createDecipheriv('aes-256-gcm', this.encryptionKey, iv);
            decipher.setAuthTag(authTag);
            return decipher.update(data) + decipher.final('utf8');
        }
        catch (error) {
            console.error(`🔓 Failed to decrypt key for ${toolId}`);
            return null;
        }
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // MAIN EXECUTION API
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Execute a tool operation
     */
    async execute(request) {
        const startTime = Date.now();
        const requestId = request.requestId || crypto.randomUUID();
        // Get tool and operation
        const tool = this.registry.getTool(request.toolId);
        if (!tool) {
            return this.createErrorResult(request, requestId, startTime, {
                code: 'TOOL_NOT_FOUND',
                message: `Tool ${request.toolId} not found`,
                isRetryable: false
            });
        }
        const operation = tool.operations.find(op => op.id === request.operationId);
        if (!operation) {
            return this.createErrorResult(request, requestId, startTime, {
                code: 'OPERATION_NOT_FOUND',
                message: `Operation ${request.operationId} not found in ${request.toolId}`,
                isRetryable: false
            });
        }
        // Check circuit breaker
        if (this.isCircuitBroken(request.toolId)) {
            return this.createErrorResult(request, requestId, startTime, {
                code: 'CIRCUIT_BROKEN',
                message: `Tool ${request.toolId} is temporarily disabled due to repeated failures`,
                isRetryable: false,
                suggestedAction: 'Wait 5 minutes and try again'
            });
        }
        // Check rate limit
        if (!this.checkRateLimit(request.toolId, operation)) {
            return this.createErrorResult(request, requestId, startTime, {
                code: 'RATE_LIMITED',
                message: `Rate limit exceeded for ${request.toolId}`,
                isRetryable: true,
                suggestedAction: 'Wait and retry'
            });
        }
        // Execute with retries
        const timeout = Math.min(request.timeout || this.config.defaultTimeoutMs, this.config.maxTimeoutMs);
        const retries = Math.min(request.retries || this.config.defaultRetries, this.config.maxRetries);
        let lastError;
        let retryCount = 0;
        for (let attempt = 0; attempt <= retries; attempt++) {
            try {
                const data = await this.executeOperation(tool, operation, request, timeout);
                // Success!
                this.resetFailureCount(request.toolId);
                const result = {
                    success: true,
                    toolId: request.toolId,
                    operationId: request.operationId,
                    data,
                    executionMs: Date.now() - startTime,
                    retryCount,
                    requestId,
                    timestamp: new Date()
                };
                // Update metrics
                this.registry.updateMetrics(request.toolId, true, result.executionMs);
                // Record history
                this.recordExecution(result);
                this.emit('execution:success', result);
                return result;
            }
            catch (error) {
                retryCount++;
                lastError = this.parseError(error);
                if (!lastError.isRetryable || attempt >= retries) {
                    break;
                }
                // Wait before retry
                const delay = this.config.exponentialBackoff
                    ? this.config.retryDelayMs * Math.pow(2, attempt)
                    : this.config.retryDelayMs;
                await this.sleep(delay);
            }
        }
        // All retries failed
        this.incrementFailureCount(request.toolId);
        const result = this.createErrorResult(request, requestId, startTime, lastError);
        result.retryCount = retryCount;
        // Update metrics
        this.registry.updateMetrics(request.toolId, false, result.executionMs);
        // Record history
        this.recordExecution(result);
        // Learn from failure
        result.lessonLearned = this.learnFromFailure(request, lastError);
        this.emit('execution:failure', result);
        return result;
    }
    /**
     * Execute the actual operation
     */
    async executeOperation(tool, operation, request, timeout) {
        // Handle stdio tools (local MCP servers)
        if (tool.endpoint.startsWith('stdio://')) {
            return this.executeStdioTool(tool, operation, request);
        }
        // Handle HTTP tools
        return this.executeHttpTool(tool, operation, request, timeout);
    }
    /**
     * Execute stdio-based MCP tool
     */
    async executeStdioTool(tool, operation, request) {
        // Stdio tools are executed via child_process
        // For now, return simulated response
        this.emit('stdio:execute', { tool, operation, request });
        return {
            success: true,
            message: `Executed ${operation.name} via stdio`,
            toolId: tool.id,
            operationId: operation.id,
            parameters: request.parameters
        };
    }
    /**
     * Execute HTTP-based MCP tool
     */
    async executeHttpTool(tool, operation, request, timeout) {
        // Build URL
        let url = tool.endpoint + operation.path;
        // Replace path parameters
        for (const [key, value] of Object.entries(request.parameters)) {
            url = url.replace(`{${key}}`, encodeURIComponent(String(value)));
        }
        // Build headers
        const headers = {
            'Content-Type': 'application/json',
            ...this.getGhostHeaders(tool)
        };
        // Add authentication
        const apiKey = this.decryptKey(tool.id);
        if (apiKey) {
            switch (tool.authType) {
                case 'bearer':
                    headers['Authorization'] = `Bearer ${apiKey}`;
                    break;
                case 'api-key':
                    headers['X-API-Key'] = apiKey;
                    break;
                case 'basic':
                    headers['Authorization'] = `Basic ${Buffer.from(apiKey).toString('base64')}`;
                    break;
            }
        }
        // Make request
        return new Promise((resolve, reject) => {
            const urlObj = new URL(url);
            const isHttps = urlObj.protocol === 'https:';
            const lib = isHttps ? https : http;
            const options = {
                hostname: urlObj.hostname,
                port: urlObj.port || (isHttps ? 443 : 80),
                path: urlObj.pathname + urlObj.search,
                method: operation.httpMethod,
                headers,
                timeout
            };
            const req = lib.request(options, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
                        try {
                            resolve(JSON.parse(data));
                        }
                        catch {
                            resolve(data);
                        }
                    }
                    else {
                        reject(new Error(`HTTP ${res.statusCode}: ${data}`));
                    }
                });
            });
            req.on('error', reject);
            req.on('timeout', () => {
                req.destroy();
                reject(new Error('Request timeout'));
            });
            // Send body for POST/PUT/PATCH
            if (['POST', 'PUT', 'PATCH'].includes(operation.httpMethod)) {
                req.write(JSON.stringify(request.parameters));
            }
            req.end();
        });
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // GHOST PROTOCOL
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Get Ghost Protocol headers
     */
    getGhostHeaders(tool) {
        if (!this.config.enableGhostProtocol || !tool.requiresGhostProtocol) {
            return {};
        }
        const headers = {};
        // Rotate User Agent
        if (this.ghostConfig.rotateUserAgent) {
            headers['User-Agent'] = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
        }
        // Add custom headers
        if (this.ghostConfig.customHeaders) {
            Object.assign(headers, this.ghostConfig.customHeaders);
        }
        // Add fingerprint-related headers
        headers['Sec-CH-UA'] = '"Chromium";v="120", "Google Chrome";v="120", "Not-A.Brand";v="99"';
        headers['Sec-CH-UA-Mobile'] = '?0';
        headers['Sec-CH-UA-Platform'] = '"Windows"';
        headers['Sec-Fetch-Dest'] = 'empty';
        headers['Sec-Fetch-Mode'] = 'cors';
        headers['Sec-Fetch-Site'] = 'cross-site';
        return headers;
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // RATE LIMITING
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Check if request is within rate limit
     */
    checkRateLimit(toolId, operation) {
        if (!this.config.enableRateLimiting)
            return true;
        const key = `${toolId}:${operation.id}`;
        const now = new Date();
        // Get operation-specific or global rate limit
        const limit = operation.rateLimit || this.config.globalRateLimit;
        if (!limit)
            return true;
        let record = this.requestCounts.get(key);
        // Reset if window expired
        if (!record || now.getTime() - record.windowStart.getTime() > limit.windowMs) {
            record = { count: 0, windowStart: now };
        }
        // Check limit
        if (record.count >= limit.requests) {
            return false;
        }
        // Increment count
        record.count++;
        this.requestCounts.set(key, record);
        return true;
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // FATALITY ENGINE (Circuit Breaker)
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Check if circuit is broken for tool
     */
    isCircuitBroken(toolId) {
        return this.circuitBroken.has(toolId);
    }
    /**
     * Increment failure count
     */
    incrementFailureCount(toolId) {
        const count = (this.failureCounts.get(toolId) || 0) + 1;
        this.failureCounts.set(toolId, count);
        // Break circuit if threshold exceeded
        if (this.config.enableFatalityMonitoring && count >= this.config.fatalityThreshold) {
            this.circuitBroken.add(toolId);
            this.emit('fatality:circuit-broken', { toolId, failureCount: count });
            // Auto-reset after 5 minutes
            setTimeout(() => {
                this.circuitBroken.delete(toolId);
                this.failureCounts.delete(toolId);
                this.emit('fatality:circuit-reset', { toolId });
            }, 300000);
        }
    }
    /**
     * Reset failure count on success
     */
    resetFailureCount(toolId) {
        this.failureCounts.delete(toolId);
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // LEARNING & HISTORY
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Record execution in history
     */
    recordExecution(result) {
        this.executionHistory.push(result);
        // Keep only last 1000
        if (this.executionHistory.length > 1000) {
            this.executionHistory = this.executionHistory.slice(-1000);
        }
    }
    /**
     * Learn from failure
     */
    learnFromFailure(request, error) {
        const lesson = {
            id: crypto.randomUUID(),
            toolId: request.toolId,
            operationId: request.operationId,
            taskDescription: `Execute ${request.operationId}`,
            inputParameters: request.parameters,
            success: false,
            outcome: error.message,
            executionMs: 0,
            whatFailed: [error.code, error.message],
            improvements: error.suggestedAction ? [error.suggestedAction] : [],
            timestamp: new Date()
        };
        this.lessonsLearned.push(lesson);
        this.emit('lesson:learned', lesson);
        return lesson;
    }
    /**
     * Get lessons for a tool
     */
    getLessons(toolId) {
        return this.lessonsLearned.filter(l => l.toolId === toolId);
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // HELPERS
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Parse error into structured format
     */
    parseError(error) {
        if (error instanceof Error) {
            const isTimeout = error.message.includes('timeout');
            const isNetwork = error.message.includes('ECONNREFUSED') ||
                error.message.includes('ENOTFOUND');
            const isAuth = error.message.includes('401') ||
                error.message.includes('403');
            return {
                code: isTimeout ? 'TIMEOUT' : isNetwork ? 'NETWORK_ERROR' : isAuth ? 'AUTH_ERROR' : 'UNKNOWN',
                message: error.message,
                isRetryable: isTimeout || isNetwork,
                suggestedAction: isAuth ? 'Check API key configuration' : undefined
            };
        }
        return {
            code: 'UNKNOWN',
            message: String(error),
            isRetryable: false
        };
    }
    /**
     * Create error result
     */
    createErrorResult(request, requestId, startTime, error) {
        return {
            success: false,
            toolId: request.toolId,
            operationId: request.operationId,
            error,
            executionMs: Date.now() - startTime,
            retryCount: 0,
            requestId,
            timestamp: new Date()
        };
    }
    /**
     * Sleep helper
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    /**
     * Get execution statistics
     */
    getStats() {
        const successful = this.executionHistory.filter(e => e.success);
        const totalLatency = this.executionHistory.reduce((sum, e) => sum + e.executionMs, 0);
        return {
            totalExecutions: this.executionHistory.length,
            successRate: this.executionHistory.length > 0
                ? successful.length / this.executionHistory.length
                : 1.0,
            avgLatencyMs: this.executionHistory.length > 0
                ? totalLatency / this.executionHistory.length
                : 0,
            circuitBrokenTools: Array.from(this.circuitBroken),
            lessonsLearned: this.lessonsLearned.length
        };
    }
}
exports.ToolExecutor = ToolExecutor;
// ═══════════════════════════════════════════════════════════════════════════════
// FACTORY & EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════
const getToolExecutor = (config, ghostConfig) => {
    return ToolExecutor.getInstance(config, ghostConfig);
};
exports.getToolExecutor = getToolExecutor;
exports.default = ToolExecutor;
