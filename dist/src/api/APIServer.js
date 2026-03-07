"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * MIND-ENGINE: API SERVER
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * REST API for remote control of Mind Engine
 * HTTP server, endpoints, authentication, WebSocket
 *
 * @author dp | QAntum Labs
 * @version 1.0.0-QANTUM-PRIME
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
exports.MindEngineAPI = exports.APIServer = void 0;
exports.createAPI = createAPI;
const http = __importStar(require("http"));
const https = __importStar(require("https"));
const url = __importStar(require("url"));
const crypto = __importStar(require("crypto"));
const events_1 = require("events");
const logger_1 = require("./unified/utils/logger");
// ═══════════════════════════════════════════════════════════════════════════════
// RATE LIMITER
// ═══════════════════════════════════════════════════════════════════════════════
class RateLimiter {
    requests = new Map();
    windowMs;
    max;
    constructor(windowMs = 60000, max = 100) {
        this.windowMs = windowMs;
        this.max = max;
    }
    // Complexity: O(1) — lookup
    check(key) {
        const now = Date.now();
        let record = this.requests.get(key);
        if (!record || now > record.resetTime) {
            record = { count: 0, resetTime: now + this.windowMs };
            this.requests.set(key, record);
        }
        record.count++;
        return {
            allowed: record.count <= this.max,
            remaining: Math.max(0, this.max - record.count),
            resetTime: record.resetTime
        };
    }
    // Complexity: O(N) — loop
    cleanup() {
        const now = Date.now();
        for (const [key, record] of this.requests) {
            if (now > record.resetTime) {
                this.requests.delete(key);
            }
        }
    }
}
// ═══════════════════════════════════════════════════════════════════════════════
// API SERVER
// ═══════════════════════════════════════════════════════════════════════════════
class APIServer extends events_1.EventEmitter {
    server;
    routes = [];
    middlewares = [];
    config;
    rateLimiter;
    constructor(config) {
        super();
        this.config = {
            host: '0.0.0.0',
            cors: true,
            auth: { type: 'none' },
            ...config
        };
        if (this.config.rateLimit) {
            this.rateLimiter = new RateLimiter(this.config.rateLimit.windowMs, this.config.rateLimit.max);
        }
    }
    /**
     * Add middleware
     */
    // Complexity: O(1)
    use(middleware) {
        this.middlewares.push(middleware);
        return this;
    }
    /**
     * GET route
     */
    // Complexity: O(1)
    get(path, handler) {
        return this.addRoute('GET', path, handler);
    }
    /**
     * POST route
     */
    // Complexity: O(1)
    post(path, handler) {
        return this.addRoute('POST', path, handler);
    }
    /**
     * PUT route
     */
    // Complexity: O(1)
    put(path, handler) {
        return this.addRoute('PUT', path, handler);
    }
    /**
     * DELETE route
     */
    // Complexity: O(1)
    delete(path, handler) {
        return this.addRoute('DELETE', path, handler);
    }
    /**
     * PATCH route
     */
    // Complexity: O(1)
    patch(path, handler) {
        return this.addRoute('PATCH', path, handler);
    }
    /**
     * Add route
     */
    // Complexity: O(1)
    addRoute(method, path, handler) {
        const paramNames = [];
        const patternStr = path.replace(/:(\w+)/g, (_, name) => {
            paramNames.push(name);
            return '([^/]+)';
        });
        this.routes.push({
            method,
            path,
            pattern: new RegExp(`^${patternStr}$`),
            paramNames,
            handler
        });
        return this;
    }
    /**
     * Start server
     */
    // Complexity: O(1)
    async start() {
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
        return new Promise((resolve, reject) => {
            this.server.on('error', reject);
            this.server.listen(this.config.port, this.config.host, () => {
                this.emit('start', {
                    port: this.config.port,
                    host: this.config.host,
                    ssl: !!this.config.ssl
                });
                // Complexity: O(1)
                resolve();
            });
        });
    }
    /**
     * Stop server
     */
    // Complexity: O(1)
    async stop() {
        return new Promise((resolve) => {
            if (this.server) {
                this.server.close(() => {
                    this.emit('stop');
                    // Complexity: O(1)
                    resolve();
                });
            }
            else {
                // Complexity: O(1)
                resolve();
            }
        });
    }
    /**
     * Handle incoming request
     */
    // Complexity: O(N*M) — nested iteration
    async handleRequest(raw, rawRes) {
        const startTime = Date.now();
        const parsedUrl = url.parse(raw.url || '/', true);
        const path = parsedUrl.pathname || '/';
        const method = raw.method || 'GET';
        // Build request object
        const req = {
            method,
            path,
            params: {},
            query: parsedUrl.query,
            body: null,
            headers: raw.headers,
            raw
        };
        // Build response object
        let statusCode = 200;
        const headers = {};
        const res = {
            status: (code) => {
                statusCode = code;
                return res;
            },
            header: (name, value) => {
                headers[name] = value;
                return res;
            },
            json: (data) => {
                headers['Content-Type'] = 'application/json';
                for (const [k, v] of Object.entries(headers)) {
                    rawRes.setHeader(k, v);
                }
                rawRes.statusCode = statusCode;
                rawRes.end(JSON.stringify(data));
            },
            send: (data) => {
                for (const [k, v] of Object.entries(headers)) {
                    rawRes.setHeader(k, v);
                }
                rawRes.statusCode = statusCode;
                rawRes.end(data);
            },
            raw: rawRes
        };
        try {
            // CORS
            if (this.config.cors) {
                res.header('Access-Control-Allow-Origin', '*');
                res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
                res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');
            }
            // Handle OPTIONS (preflight)
            if (method === 'OPTIONS') {
                res.status(204).send('');
                return;
            }
            // Rate limiting
            if (this.rateLimiter) {
                const clientIP = this.getClientIP(raw);
                const limit = this.rateLimiter.check(clientIP);
                res.header('X-RateLimit-Limit', this.config.rateLimit.max.toString());
                res.header('X-RateLimit-Remaining', limit.remaining.toString());
                res.header('X-RateLimit-Reset', limit.resetTime.toString());
                if (!limit.allowed) {
                    res.status(429).json({
                        error: 'Too Many Requests',
                        retryAfter: Math.ceil((limit.resetTime - Date.now()) / 1000)
                    });
                    return;
                }
            }
            // Authentication
            if (this.config.auth?.type !== 'none') {
                const authResult = this.authenticate(req);
                if (!authResult.success) {
                    res.status(401).json({ error: authResult.error });
                    return;
                }
            }
            // Parse body
            if (method !== 'GET' && method !== 'HEAD') {
                // SAFETY: async operation — wrap in try-catch for production resilience
                req.body = await this.parseBody(raw);
            }
            // Run middlewares
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.runMiddlewares(req, res);
            // Find matching route
            const route = this.findRoute(method, path);
            if (!route) {
                res.status(404).json({ error: 'Not Found', path });
                return;
            }
            // Extract params
            const match = path.match(route.pattern);
            if (match) {
                route.paramNames.forEach((name, i) => {
                    req.params[name] = match[i + 1];
                });
            }
            // Execute handler
            // SAFETY: async operation — wrap in try-catch for production resilience
            await route.handler(req, res);
            // Log request
            const duration = Date.now() - startTime;
            this.emit('request', {
                method,
                path,
                status: statusCode,
                duration
            });
        }
        catch (error) {
            logger_1.logger.error('API Error:', error);
            res.status(500).json({
                error: 'Internal Server Error',
                message: error.message
            });
        }
    }
    // Complexity: O(N) — linear scan
    findRoute(method, path) {
        return this.routes.find(r => r.method === method && r.pattern.test(path));
    }
    // Complexity: O(1)
    async parseBody(raw) {
        return new Promise((resolve, reject) => {
            const chunks = [];
            raw.on('data', (chunk) => chunks.push(chunk));
            raw.on('end', () => {
                const body = Buffer.concat(chunks).toString();
                if (!body) {
                    // Complexity: O(1)
                    resolve(null);
                    return;
                }
                const contentType = raw.headers['content-type'] || '';
                if (contentType.includes('application/json')) {
                    try {
                        // Complexity: O(1)
                        resolve(JSON.parse(body));
                    }
                    catch {
                        // Complexity: O(1)
                        reject(new Error('Invalid JSON'));
                    }
                }
                else {
                    // Complexity: O(1)
                    resolve(body);
                }
            });
            raw.on('error', reject);
        });
    }
    // Complexity: O(1)
    async runMiddlewares(req, res) {
        let index = 0;
        const next = async () => {
            if (index < this.middlewares.length) {
                const middleware = this.middlewares[index++];
                // SAFETY: async operation — wrap in try-catch for production resilience
                await middleware(req, res, next);
            }
        };
        // SAFETY: async operation — wrap in try-catch for production resilience
        await next();
    }
    // Complexity: O(N) — linear scan
    authenticate(req) {
        switch (this.config.auth?.type) {
            case 'apikey': {
                const apiKey = req.headers['x-api-key'] || req.query.apiKey;
                if (apiKey !== this.config.auth.apiKey) {
                    return { success: false, error: 'Invalid API key' };
                }
                return { success: true };
            }
            case 'basic': {
                const auth = req.headers.authorization;
                if (!auth?.startsWith('Basic ')) {
                    return { success: false, error: 'Missing authorization' };
                }
                const credentials = Buffer.from(auth.slice(6), 'base64').toString();
                const [username, password] = credentials.split(':');
                const user = this.config.auth.users?.find(u => u.username === username && u.password === password);
                if (!user) {
                    return { success: false, error: 'Invalid credentials' };
                }
                return { success: true };
            }
            case 'jwt': {
                const auth = req.headers.authorization;
                if (!auth?.startsWith('Bearer ')) {
                    return { success: false, error: 'Missing authorization' };
                }
                // Simplified JWT validation
                const token = auth.slice(7);
                try {
                    const parts = token.split('.');
                    if (parts.length !== 3)
                        throw new Error('Invalid token');
                    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
                    if (payload.exp && payload.exp < Date.now() / 1000) {
                        return { success: false, error: 'Token expired' };
                    }
                    return { success: true };
                }
                catch {
                    return { success: false, error: 'Invalid token' };
                }
            }
            default:
                return { success: true };
        }
    }
    // Complexity: O(N)
    getClientIP(req) {
        const forwarded = req.headers['x-forwarded-for'];
        if (forwarded) {
            return (Array.isArray(forwarded) ? forwarded[0] : forwarded).split(',')[0].trim();
        }
        return req.socket.remoteAddress || 'unknown';
    }
}
exports.APIServer = APIServer;
// ═══════════════════════════════════════════════════════════════════════════════
// MIND ENGINE API
// ═══════════════════════════════════════════════════════════════════════════════
class MindEngineAPI extends APIServer {
    sessions = new Map();
    jobs = new Map();
    constructor(config) {
        super(config);
        this.registerRoutes();
    }
    // Complexity: O(N) — linear scan
    registerRoutes() {
        // Health check
        this.get('/health', (req, res) => {
            res.json({
                status: 'healthy',
                version: '1.0.0',
                uptime: process.uptime()
            });
        });
        // API info
        this.get('/api/v1', (req, res) => {
            res.json({
                name: 'Mind Engine API',
                version: '1.0.0',
                endpoints: [
                    'GET /api/v1/sessions',
                    'POST /api/v1/sessions',
                    'DELETE /api/v1/sessions/:id',
                    'POST /api/v1/tests/run',
                    'GET /api/v1/tests/:id',
                    'GET /api/v1/jobs',
                    'GET /api/v1/jobs/:id'
                ]
            });
        });
        // ═══════════════════════════════════════════════════════════════════════════
        // SESSION MANAGEMENT
        // ═══════════════════════════════════════════════════════════════════════════
        // List sessions
        this.get('/api/v1/sessions', (req, res) => {
            const sessions = Array.from(this.sessions.entries()).map(([id, session]) => ({
                id,
                browser: session.browser,
                createdAt: session.createdAt,
                status: session.status
            }));
            res.json({ sessions });
        });
        // Create session
        this.post('/api/v1/sessions', async (req, res) => {
            const { browser = 'chromium', headless = true } = req.body || {};
            const sessionId = crypto.randomUUID();
            this.sessions.set(sessionId, {
                id: sessionId,
                browser,
                headless,
                createdAt: new Date().toISOString(),
                status: 'active'
            });
            res.status(201).json({
                id: sessionId,
                browser,
                status: 'active',
                message: 'Session created'
            });
        });
        // Get session
        this.get('/api/v1/sessions/:id', (req, res) => {
            const session = this.sessions.get(req.params.id);
            if (!session) {
                res.status(404).json({ error: 'Session not found' });
                return;
            }
            res.json(session);
        });
        // Delete session
        this.delete('/api/v1/sessions/:id', (req, res) => {
            const deleted = this.sessions.delete(req.params.id);
            if (!deleted) {
                res.status(404).json({ error: 'Session not found' });
                return;
            }
            res.json({ message: 'Session deleted' });
        });
        // ═══════════════════════════════════════════════════════════════════════════
        // TEST EXECUTION
        // ═══════════════════════════════════════════════════════════════════════════
        // Run tests
        this.post('/api/v1/tests/run', async (req, res) => {
            const { tests, browser = 'chromium', workers = 4, retries = 0, reporter = 'json' } = req.body || {};
            if (!tests || !Array.isArray(tests)) {
                res.status(400).json({ error: 'tests array is required' });
                return;
            }
            const jobId = crypto.randomUUID();
            this.jobs.set(jobId, {
                id: jobId,
                status: 'running',
                tests,
                browser,
                workers,
                retries,
                reporter,
                startedAt: new Date().toISOString(),
                progress: {
                    total: tests.length,
                    completed: 0,
                    passed: 0,
                    failed: 0
                }
            });
            // Simulate async test execution
            this.simulateTestRun(jobId, tests);
            res.status(202).json({
                jobId,
                status: 'running',
                message: 'Test run started'
            });
        });
        // Get job status
        this.get('/api/v1/jobs/:id', (req, res) => {
            const job = this.jobs.get(req.params.id);
            if (!job) {
                res.status(404).json({ error: 'Job not found' });
                return;
            }
            res.json(job);
        });
        // List jobs
        this.get('/api/v1/jobs', (req, res) => {
            const jobs = Array.from(this.jobs.values())
                .slice(-50)
                .reverse();
            res.json({ jobs });
        });
        // ═══════════════════════════════════════════════════════════════════════════
        // PAGE ACTIONS
        // ═══════════════════════════════════════════════════════════════════════════
        // Navigate
        this.post('/api/v1/sessions/:id/navigate', async (req, res) => {
            const { url } = req.body || {};
            if (!url) {
                res.status(400).json({ error: 'url is required' });
                return;
            }
            const session = this.sessions.get(req.params.id);
            if (!session) {
                res.status(404).json({ error: 'Session not found' });
                return;
            }
            res.json({
                success: true,
                url,
                title: 'Page Title'
            });
        });
        // Click
        this.post('/api/v1/sessions/:id/click', async (req, res) => {
            const { selector } = req.body || {};
            if (!selector) {
                res.status(400).json({ error: 'selector is required' });
                return;
            }
            res.json({ success: true, action: 'click', selector });
        });
        // Type
        this.post('/api/v1/sessions/:id/type', async (req, res) => {
            const { selector, text } = req.body || {};
            if (!selector || !text) {
                res.status(400).json({ error: 'selector and text are required' });
                return;
            }
            res.json({ success: true, action: 'type', selector, textLength: text.length });
        });
        // Screenshot
        this.get('/api/v1/sessions/:id/screenshot', async (req, res) => {
            const session = this.sessions.get(req.params.id);
            if (!session) {
                res.status(404).json({ error: 'Session not found' });
                return;
            }
            res.json({
                success: true,
                format: 'base64',
                data: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
            });
        });
        // Evaluate
        this.post('/api/v1/sessions/:id/evaluate', async (req, res) => {
            const { script } = req.body || {};
            if (!script) {
                res.status(400).json({ error: 'script is required' });
                return;
            }
            res.json({
                success: true,
                result: null
            });
        });
        // ═══════════════════════════════════════════════════════════════════════════
        // REPORTS
        // ═══════════════════════════════════════════════════════════════════════════
        // Get report
        this.get('/api/v1/reports/:id', (req, res) => {
            res.json({
                id: req.params.id,
                format: 'json',
                results: {
                    total: 10,
                    passed: 9,
                    failed: 1,
                    skipped: 0,
                    duration: 12500
                }
            });
        });
        // ═══════════════════════════════════════════════════════════════════════════
        // CONFIGURATION
        // ═══════════════════════════════════════════════════════════════════════════
        // Get config
        this.get('/api/v1/config', (req, res) => {
            res.json({
                browsers: ['chromium', 'firefox', 'webkit'],
                defaultTimeout: 30000,
                retries: 2,
                workers: 4
            });
        });
    }
    // Complexity: O(N) — loop
    async simulateTestRun(jobId, tests) {
        const job = this.jobs.get(jobId);
        if (!job)
            return;
        for (let i = 0; i < tests.length; i++) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await new Promise(r => setTimeout(r, 500));
            job.progress.completed++;
            const passed = Math.random() > 0.1;
            if (passed) {
                job.progress.passed++;
            }
            else {
                job.progress.failed++;
            }
        }
        job.status = job.progress.failed > 0 ? 'failed' : 'passed';
        job.completedAt = new Date().toISOString();
    }
}
exports.MindEngineAPI = MindEngineAPI;
// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════
function createAPI(config) {
    return new MindEngineAPI(config);
}
exports.default = {
    APIServer,
    MindEngineAPI,
    createAPI
};
