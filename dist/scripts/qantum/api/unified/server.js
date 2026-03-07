"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * MIND-ENGINE: UNIFIED API SERVER
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Production-ready HTTP server combining REST API + WebSocket Dashboard
 * Enterprise features: Auth, Rate Limiting, Logging, Error Handling
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
exports.UnifiedServer = void 0;
exports.createServer = createServer;
const http = __importStar(require("http"));
const https = __importStar(require("https"));
const os = __importStar(require("os"));
const events_1 = require("events");
const logger_1 = require("./utils/logger");
const auth_1 = require("./middleware/auth");
const rateLimit_1 = require("./middleware/rateLimit");
const errorHandler_1 = require("./middleware/errorHandler");
const logging_1 = require("./middleware/logging");
// ═══════════════════════════════════════════════════════════════════════════════
// UNIFIED SERVER
// ═══════════════════════════════════════════════════════════════════════════════
class UnifiedServer extends events_1.EventEmitter {
    server;
    config;
    routes = [];
    globalMiddlewares = [];
    logger;
    auth;
    rateLimiter;
    errorHandler;
    requestLogger;
    responseTimeTracker;
    // State
    isShuttingDown = false;
    activeConnections = new Set();
    constructor(config) {
        super();
        this.config = {
            host: '0.0.0.0',
            cors: { enabled: true },
            trustProxy: false,
            ...config,
            timeouts: {
                request: 30000,
                keepAlive: 5000,
                ...config.timeouts
            }
        };
        // Initialize components
        this.logger = (0, logger_1.createLogger)({
            level: config.logging?.level || 'info',
            format: process.env.NODE_ENV === 'production' ? 'json' : 'pretty',
            outputs: ['console']
        });
        if (config.auth && config.auth.strategy !== 'none') {
            this.auth = new auth_1.AuthMiddleware(config.auth);
        }
        if (config.rateLimit) {
            this.rateLimiter = new rateLimit_1.TieredRateLimiter({
                windowMs: config.rateLimit.windowMs,
                tiers: config.rateLimit.tiers
            });
        }
        this.errorHandler = new errorHandler_1.ErrorHandler({
            environment: process.env.NODE_ENV === 'production' ? 'production' : 'development',
            includeStack: process.env.NODE_ENV !== 'production'
        });
        this.requestLogger = new logging_1.RequestLogger({
            logBody: config.logging?.requestBody,
            logResponseBody: config.logging?.responseBody
        });
        this.responseTimeTracker = new logging_1.ResponseTimeTracker();
        // Register built-in routes
        this.registerBuiltInRoutes();
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // ROUTE REGISTRATION
    // ═══════════════════════════════════════════════════════════════════════════
    // Complexity: O(N) — potential recursive descent
    get(path, ...handlers) {
        return this.addRoute('GET', path, handlers);
    }
    // Complexity: O(N) — potential recursive descent
    post(path, ...handlers) {
        return this.addRoute('POST', path, handlers);
    }
    // Complexity: O(N) — potential recursive descent
    put(path, ...handlers) {
        return this.addRoute('PUT', path, handlers);
    }
    // Complexity: O(N) — potential recursive descent
    delete(path, ...handlers) {
        return this.addRoute('DELETE', path, handlers);
    }
    // Complexity: O(N) — potential recursive descent
    patch(path, ...handlers) {
        return this.addRoute('PATCH', path, handlers);
    }
    // Complexity: O(N) — potential recursive descent
    options(path, ...handlers) {
        return this.addRoute('OPTIONS', path, handlers);
    }
    // Complexity: O(N) — linear iteration
    all(path, ...handlers) {
        ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'].forEach(method => {
            this.addRoute(method, path, handlers);
        });
        return this;
    }
    // Complexity: O(1)
    use(middleware) {
        this.globalMiddlewares.push(middleware);
        return this;
    }
    // Complexity: O(1) — amortized
    addRoute(method, path, handlers) {
        const paramNames = [];
        const patternStr = path.replace(/:(\w+)/g, (_, name) => {
            paramNames.push(name);
            return '([^/]+)';
        });
        const middlewares = handlers.slice(0, -1);
        const handler = handlers[handlers.length - 1];
        this.routes.push({
            method,
            path,
            pattern: new RegExp(`^${patternStr}$`),
            paramNames,
            handler,
            middlewares
        });
        return this;
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // SERVER LIFECYCLE
    // ═══════════════════════════════════════════════════════════════════════════
    // Complexity: O(N)
    async start() {
        return new Promise((resolve, reject) => {
            const handler = this.handleRequest.bind(this);
            if (this.config.ssl) {
                this.server = https.createServer({
                    key: this.config.ssl.key,
                    cert: this.config.ssl.cert
                }, handler);
            }
            else {
                this.server = http.createServer(handler);
            }
            // Configure server
            this.server.timeout = this.config.timeouts?.request ?? 30000;
            this.server.keepAliveTimeout = this.config.timeouts?.keepAlive ?? 5000;
            // Track connections for graceful shutdown
            this.server.on('connection', (socket) => {
                const req = socket;
                this.activeConnections.add(req);
                socket.on('close', () => this.activeConnections.delete(req));
            });
            this.server.on('error', (error) => {
                this.logger.error('Server error', { error });
                // Complexity: O(1)
                reject(error);
            });
            this.server.listen(this.config.port, this.config.host, () => {
                const protocol = this.config.ssl ? 'https' : 'http';
                const address = `${protocol}://${this.config.host}:${this.config.port}`;
                this.logger.info(`🚀 Mind-Engine API Server started`, {
                    address,
                    environment: process.env.NODE_ENV || 'development',
                    pid: process.pid
                });
                this.emit('start', { address, port: this.config.port });
                // Complexity: O(1)
                resolve();
            });
            // Graceful shutdown handlers
            this.setupShutdownHandlers();
        });
    }
    // Complexity: O(N) — linear iteration
    async stop() {
        if (this.isShuttingDown)
            return;
        this.isShuttingDown = true;
        this.logger.info('🛑 Shutting down server...');
        return new Promise((resolve) => {
            // Stop accepting new connections
            this.server?.close(() => {
                this.logger.info('✅ Server closed');
                // Cleanup
                this.rateLimiter?.destroy();
                this.logger.close();
                this.emit('stop');
                // Complexity: O(1)
                resolve();
            });
            // Force close after timeout
            // Complexity: O(N) — linear iteration
            setTimeout(() => {
                this.logger.warn('⚠️ Forcing shutdown after timeout');
                this.activeConnections.forEach((conn) => {
                    conn.destroy?.();
                });
                // Complexity: O(1)
                resolve();
            }, 10000);
        });
    }
    // Complexity: O(1)
    setupShutdownHandlers() {
        const shutdown = async (signal) => {
            this.logger.info(`Received ${signal}`);
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.stop();
            process.exit(0);
        };
        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));
        process.on('uncaughtException', (error) => {
            this.logger.error('Uncaught exception', { error });
            // Complexity: O(1)
            shutdown('uncaughtException');
        });
        process.on('unhandledRejection', (reason) => {
            this.logger.error('Unhandled rejection', { reason });
        });
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // REQUEST HANDLING
    // ═══════════════════════════════════════════════════════════════════════════
    // Complexity: O(1) — amortized
    async handleRequest(rawReq, rawRes) {
        if (this.isShuttingDown) {
            rawRes.writeHead(503, { 'Retry-After': '30' });
            rawRes.end(JSON.stringify({ error: 'Server is shutting down' }));
            return;
        }
        const startTime = Date.now();
        const requestId = this.requestLogger.getRequestId(rawReq);
        // Parse URL
        const parsedUrl = new URL(rawReq.url || '/', `http://${rawReq.headers.host || 'localhost'}`);
        const path = parsedUrl.pathname;
        const method = rawReq.method || 'GET';
        // Build request object
        const req = {
            raw: rawReq,
            method,
            path,
            url: parsedUrl,
            params: {},
            query: Object.fromEntries(parsedUrl.searchParams),
            headers: rawReq.headers,
            body: null,
            requestId,
            startTime
        };
        // Build response object
        const res = this.createResponse(rawRes);
        try {
            // CORS preflight
            if (this.config.cors?.enabled) {
                this.handleCors(req, res);
                if (method === 'OPTIONS') {
                    res.status(204).send('');
                    return;
                }
            }
            // Security headers
            this.setSecurityHeaders(res);
            // Set request ID header
            res.header('X-Request-Id', requestId);
            // Parse body
            if (['POST', 'PUT', 'PATCH'].includes(method)) {
                // SAFETY: async operation — wrap in try-catch for production resilience
                req.body = await this.parseBody(rawReq);
            }
            // Log request
            this.requestLogger.logRequest(rawReq, requestId, req.body);
            // Authentication
            if (this.auth) {
                const authResult = this.auth.authenticate(rawReq, path);
                if (!authResult.success) {
                    throw new errorHandler_1.UnauthorizedError(authResult.error, authResult.errorCode);
                }
                req.user = authResult.user;
            }
            // Rate limiting
            if (this.rateLimiter && req.user) {
                const tier = req.user.tier;
                const limitResult = this.rateLimiter.check(rawReq, tier);
                // Set rate limit headers
                const headers = this.rateLimiter.getHeaders(limitResult);
                Object.entries(headers).forEach(([k, v]) => res.header(k, v));
                if (!limitResult.allowed) {
                    throw new errorHandler_1.TooManyRequestsError(limitResult.retryAfter);
                }
            }
            // Find matching route
            const route = this.findRoute(method, path);
            if (!route) {
                throw new errorHandler_1.NotFoundError(`Route ${method} ${path}`);
            }
            // Extract path params
            const match = path.match(route.pattern);
            if (match) {
                route.paramNames.forEach((name, i) => {
                    req.params[name] = decodeURIComponent(match[i + 1]);
                });
            }
            // Run middlewares
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.runMiddlewares(req, res, [
                ...this.globalMiddlewares,
                ...route.middlewares
            ]);
            // Run handler
            if (!res.sent) {
                // SAFETY: async operation — wrap in try-catch for production resilience
                await route.handler(req, res);
            }
        }
        catch (error) {
            this.errorHandler.handle(error, rawRes, requestId, path);
        }
        finally {
            // Log response
            const duration = Date.now() - startTime;
            this.requestLogger.logResponse(rawRes, requestId, startTime);
            this.responseTimeTracker.record(path, duration);
        }
    }
    // Complexity: O(N) — linear iteration
    createResponse(raw) {
        const res = {
            raw,
            statusCode: 200,
            headers: new Map(),
            sent: false,
            // Complexity: O(1)
            status(code) {
                res.statusCode = code;
                return res;
            },
            // Complexity: O(1) — hash/map lookup
            header(name, value) {
                res.headers.set(name, value);
                return res;
            },
            // Complexity: O(1)
            json(data) {
                if (res.sent)
                    return;
                res.header('Content-Type', 'application/json');
                res.send(JSON.stringify(data));
            },
            // Complexity: O(N) — linear iteration
            send(data) {
                if (res.sent)
                    return;
                res.sent = true;
                res.headers.forEach((value, key) => {
                    raw.setHeader(key, value);
                });
                raw.statusCode = res.statusCode;
                raw.end(data);
            },
            // Complexity: O(1)
            redirect(url, status = 302) {
                res.status(status).header('Location', url).send('');
            },
            // Complexity: O(N) — linear iteration
            stream(readable) {
                if (res.sent)
                    return;
                res.sent = true;
                res.headers.forEach((value, key) => {
                    raw.setHeader(key, value);
                });
                raw.statusCode = res.statusCode;
                readable.pipe(raw);
            }
        };
        return res;
    }
    // Complexity: O(N) — linear iteration
    findRoute(method, path) {
        return this.routes.find(r => r.method === method && r.pattern.test(path));
    }
    // Complexity: O(1) — amortized
    async parseBody(req) {
        return new Promise((resolve, reject) => {
            const chunks = [];
            let size = 0;
            const maxSize = 10 * 1024 * 1024; // 10MB
            req.on('data', (chunk) => {
                size += chunk.length;
                if (size > maxSize) {
                    // Complexity: O(1)
                    reject(new errorHandler_1.BadRequestError('Request body too large'));
                    return;
                }
                chunks.push(chunk);
            });
            req.on('end', () => {
                const body = Buffer.concat(chunks).toString('utf8');
                if (!body) {
                    // Complexity: O(1)
                    resolve(null);
                    return;
                }
                const contentType = req.headers['content-type'] || '';
                if (contentType.includes('application/json')) {
                    try {
                        // Complexity: O(1)
                        resolve(JSON.parse(body));
                    }
                    catch {
                        // Complexity: O(1)
                        reject(new errorHandler_1.BadRequestError('Invalid JSON body'));
                    }
                }
                else if (contentType.includes('application/x-www-form-urlencoded')) {
                    // Complexity: O(1)
                    resolve(Object.fromEntries(new URLSearchParams(body)));
                }
                else {
                    // Complexity: O(1)
                    resolve(body);
                }
            });
            req.on('error', reject);
        });
    }
    // Complexity: O(1)
    async runMiddlewares(req, res, middlewares) {
        let index = 0;
        const next = async () => {
            if (res.sent || index >= middlewares.length)
                return;
            const middleware = middlewares[index++];
            // SAFETY: async operation — wrap in try-catch for production resilience
            await middleware(req, res, next);
        };
        // SAFETY: async operation — wrap in try-catch for production resilience
        await next();
    }
    // Complexity: O(1) — amortized
    handleCors(req, res) {
        const cors = this.config.cors;
        const origin = req.headers['origin'];
        // Determine allowed origin
        let allowedOrigin = '*';
        if (cors.origins && origin) {
            if (cors.origins.includes(origin) || cors.origins.includes('*')) {
                allowedOrigin = origin;
            }
        }
        res.header('Access-Control-Allow-Origin', allowedOrigin);
        res.header('Access-Control-Allow-Methods', cors.methods?.join(', ') || 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
        res.header('Access-Control-Allow-Headers', cors.headers?.join(', ') || 'Content-Type, Authorization, X-API-Key, X-Request-Id');
        if (cors.credentials) {
            res.header('Access-Control-Allow-Credentials', 'true');
        }
        if (cors.maxAge) {
            res.header('Access-Control-Max-Age', cors.maxAge.toString());
        }
    }
    // Complexity: O(1)
    setSecurityHeaders(res) {
        res.header('X-Content-Type-Options', 'nosniff');
        res.header('X-Frame-Options', 'DENY');
        res.header('X-XSS-Protection', '1; mode=block');
        res.header('Referrer-Policy', 'strict-origin-when-cross-origin');
        if (this.config.ssl) {
            res.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        }
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // BUILT-IN ROUTES
    // ═══════════════════════════════════════════════════════════════════════════
    // Complexity: O(1) — hash/map lookup
    registerBuiltInRoutes() {
        // Health check
        this.get('/health', (req, res) => {
            res.json({
                status: 'healthy',
                version: '1.0.0',
                timestamp: new Date().toISOString(),
                uptime: process.uptime()
            });
        });
        // Ready check
        this.get('/ready', (req, res) => {
            if (this.isShuttingDown) {
                res.status(503).json({ status: 'shutting_down' });
            }
            else {
                res.json({ status: 'ready' });
            }
        });
        // API info
        this.get('/api/v1', (req, res) => {
            res.json({
                name: 'Mind-Engine API',
                version: '1.0.0',
                documentation: '/api/v1/docs',
                endpoints: {
                    sessions: '/api/v1/sessions',
                    tests: '/api/v1/tests',
                    jobs: '/api/v1/jobs',
                    reports: '/api/v1/reports'
                }
            });
        });
        // Metrics
        this.get('/api/v1/metrics', (req, res) => {
            const metrics = {
                server: {
                    uptime: process.uptime(),
                    memory: process.memoryUsage(),
                    cpu: process.cpuUsage()
                },
                system: {
                    platform: os.platform(),
                    arch: os.arch(),
                    cpus: os.cpus().length,
                    totalMemory: os.totalmem(),
                    freeMemory: os.freemem(),
                    loadAvg: os.loadavg()
                },
                responseTime: this.responseTimeTracker.getAllStats()
            };
            res.json(metrics);
        });
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // PUBLIC API
    // ═══════════════════════════════════════════════════════════════════════════
    // Complexity: O(1)
    getLogger() {
        return this.logger;
    }
    // Complexity: O(1)
    getMetrics() {
        return {
            activeConnections: this.activeConnections.size,
            responseTime: this.responseTimeTracker.getAllStats()
        };
    }
}
exports.UnifiedServer = UnifiedServer;
// ═══════════════════════════════════════════════════════════════════════════════
// FACTORY
// ═══════════════════════════════════════════════════════════════════════════════
function createServer(config) {
    return new UnifiedServer(config);
}
exports.default = UnifiedServer;
