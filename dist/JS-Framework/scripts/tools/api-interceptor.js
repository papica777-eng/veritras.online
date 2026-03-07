"use strict";
// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║  CYBERCODY v1.1.0 - API INTERCEPTOR                                          ║
// ║  "The All-Seeing Eye" - Complete API Traffic Interception & Mapping          ║
// ║  Specialization: Autonomous API Security Architect & Logic Hunter            ║
// ╚══════════════════════════════════════════════════════════════════════════════╝
Object.defineProperty(exports, "__esModule", { value: true });
exports.APIInterceptor = void 0;
const playwright_1 = require("playwright");
const events_1 = require("events");
const crypto_1 = require("crypto");
// ═══════════════════════════════════════════════════════════════════════════════
// 🔍 SENSITIVE DATA PATTERNS
// ═══════════════════════════════════════════════════════════════════════════════
const SENSITIVE_PATTERNS = {
    // Personal Identifiable Information (PII)
    email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    phone: /(\+?[1-9]\d{1,14}|\d{10,14})/g,
    ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
    creditCard: /\b(?:\d{4}[- ]?){3}\d{4}\b/g,
    // Authentication tokens
    jwt: /eyJ[a-zA-Z0-9_-]*\.eyJ[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*/g,
    apiKey: /(?:api[_-]?key|apikey|api_secret)["\s:=]+["']?([a-zA-Z0-9_-]{20,})["']?/gi,
    bearer: /Bearer\s+([a-zA-Z0-9_-]+\.?)+/gi,
    // Passwords and secrets
    password: /"(?:password|passwd|pwd|secret)"[\s]*:[\s]*"[^"]+"/gi,
    privateKey: /-----BEGIN (?:RSA |EC )?PRIVATE KEY-----/g,
    // Database/Internal IDs
    mongoId: /[a-f0-9]{24}/gi,
    uuid: /[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/gi,
    // Financial
    iban: /[A-Z]{2}\d{2}[A-Z0-9]{4}\d{7}([A-Z0-9]?){0,16}/g,
    bankAccount: /"(?:account|iban|routing)"[\s]*:[\s]*"[^"]+"/gi,
};
const SENSITIVE_FIELD_NAMES = [
    'password', 'passwd', 'pwd', 'secret', 'token', 'apikey', 'api_key',
    'access_token', 'refresh_token', 'auth', 'authorization', 'credential',
    'ssn', 'social_security', 'credit_card', 'card_number', 'cvv', 'cvc',
    'pin', 'private_key', 'secret_key', 'encryption_key', 'bank_account',
    'routing_number', 'salary', 'income', 'medical', 'health', 'diagnosis',
];
// ═══════════════════════════════════════════════════════════════════════════════
// 🎯 ID PARAMETER PATTERNS (for BOLA detection)
// ═══════════════════════════════════════════════════════════════════════════════
const ID_PATTERNS = {
    // Common ID parameter names
    names: [
        'id', 'userId', 'user_id', 'uid', 'accountId', 'account_id',
        'orderId', 'order_id', 'customerId', 'customer_id', 'profileId',
        'documentId', 'doc_id', 'fileId', 'file_id', 'recordId', 'record_id',
        'transactionId', 'transaction_id', 'paymentId', 'payment_id',
        'subscriptionId', 'subscription_id', 'memberId', 'member_id',
    ],
    // Path patterns that suggest object references
    pathPatterns: [
        /\/users?\/([^\/]+)/i,
        /\/accounts?\/([^\/]+)/i,
        /\/profiles?\/([^\/]+)/i,
        /\/orders?\/([^\/]+)/i,
        /\/customers?\/([^\/]+)/i,
        /\/documents?\/([^\/]+)/i,
        /\/files?\/([^\/]+)/i,
        /\/records?\/([^\/]+)/i,
        /\/transactions?\/([^\/]+)/i,
        /\/payments?\/([^\/]+)/i,
        /\/subscriptions?\/([^\/]+)/i,
        /\/messages?\/([^\/]+)/i,
        /\/invoices?\/([^\/]+)/i,
    ],
};
/**
 * API Interceptor - The All-Seeing Eye
 *
 * Captures and maps all API traffic while navigating a web application.
 * Identifies BOLA targets, sensitive data leaks, and authentication patterns.
 */
class APIInterceptor extends events_1.EventEmitter {
    browser = null;
    page = null;
    config;
    apiMap;
    requestQueue = new Map();
    isIntercepting = false;
    constructor(config) {
        super();
        this.config = {
            target: config.target,
            timeout: config.timeout ?? 60000,
            includeStatic: config.includeStatic ?? false,
            interceptDomains: config.interceptDomains ?? [new URL(config.target).hostname],
            userAgent: config.userAgent ?? 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 CyberCody/1.1',
            cookies: config.cookies ?? [],
            authToken: config.authToken ?? '',
            headless: config.headless ?? true,
        };
        this.apiMap = this.initializeAPIMap();
    }
    /**
     * Initialize empty API map
     */
    initializeAPIMap() {
        return {
            target: this.config.target,
            scanStarted: new Date(),
            endpoints: new Map(),
            requests: [],
            authTokens: [],
            sensitiveEndpoints: [],
            bolaTargets: [],
            statistics: {
                totalEndpoints: 0,
                totalRequests: 0,
                uniquePaths: 0,
                authenticatedEndpoints: 0,
                sensitiveEndpoints: 0,
                bolaTargets: 0,
            },
        };
    }
    /**
     * Start intercepting API traffic
     */
    async startInterception() {
        console.log('\n🕸️  [API_INTERCEPTOR] Starting traffic interception...');
        console.log(`   Target: ${this.config.target}`);
        console.log(`   Domains: ${this.config.interceptDomains.join(', ')}`);
        this.browser = await playwright_1.chromium.launch({
            headless: this.config.headless,
        });
        const context = await this.browser.newContext({
            userAgent: this.config.userAgent,
        });
        // Set initial cookies
        if (this.config.cookies.length > 0) {
            await context.addCookies(this.config.cookies);
        }
        this.page = await context.newPage();
        this.isIntercepting = true;
        // Intercept all requests
        await this.page.route('**/*', async (route) => {
            const request = route.request();
            // Check if we should intercept this request
            if (this.shouldIntercept(request)) {
                await this.captureRequest(request);
            }
            // Continue the request
            await route.continue();
        });
        // Capture responses
        this.page.on('response', async (response) => {
            if (this.shouldIntercept(response.request())) {
                await this.captureResponse(response);
            }
        });
        // Navigate to target
        await this.page.goto(this.config.target, {
            waitUntil: 'networkidle',
            timeout: this.config.timeout,
        });
        console.log('   ✅ Page loaded, intercepting traffic...\n');
    }
    /**
     * Check if request should be intercepted
     */
    shouldIntercept(request) {
        const url = new URL(request.url());
        // Check domain
        if (!this.config.interceptDomains.some(d => url.hostname.includes(d))) {
            return false;
        }
        // Skip static resources unless configured
        if (!this.config.includeStatic) {
            const staticExtensions = ['.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.woff', '.woff2', '.ttf', '.ico'];
            if (staticExtensions.some(ext => url.pathname.endsWith(ext))) {
                return false;
            }
        }
        // Skip data URLs and blobs
        if (url.protocol === 'data:' || url.protocol === 'blob:') {
            return false;
        }
        return true;
    }
    /**
     * Capture and analyze request
     */
    async captureRequest(request) {
        const url = new URL(request.url());
        const requestId = this.generateRequestId(request);
        // Extract headers
        const headers = {};
        const allHeaders = await request.allHeaders();
        for (const [key, value] of Object.entries(allHeaders)) {
            headers[key.toLowerCase()] = value;
        }
        // Extract query parameters
        const queryParams = {};
        url.searchParams.forEach((value, key) => {
            queryParams[key] = value;
        });
        // Extract path parameters
        const pathParams = this.extractPathParameters(url.pathname);
        // Extract authentication
        const authentication = this.extractAuthentication(headers, queryParams);
        // Extract cookies
        const cookies = this.extractCookies(headers['cookie'] ?? '');
        // Get request body
        let body;
        let bodyType = 'none';
        try {
            body = request.postData() ?? undefined;
            if (body) {
                bodyType = this.detectBodyType(body, headers['content-type'] ?? '');
            }
        }
        catch {
            // No body
        }
        const captured = {
            id: requestId,
            timestamp: new Date(),
            url: request.url(),
            method: request.method(),
            headers,
            body,
            bodyType,
            queryParams,
            pathParams,
            cookies,
            authentication,
        };
        this.requestQueue.set(requestId, captured);
        this.apiMap.statistics.totalRequests++;
        // Emit event
        this.emit('request', captured);
        // Check for BOLA targets
        this.analyzeBOLAPotential(captured);
    }
    /**
     * Capture and analyze response
     */
    async captureResponse(response) {
        const request = response.request();
        const requestId = this.generateRequestId(request);
        const capturedRequest = this.requestQueue.get(requestId);
        if (!capturedRequest)
            return;
        const startTime = capturedRequest.timestamp.getTime();
        const responseTime = Date.now() - startTime;
        // Get response body
        let body = '';
        let bodyType = 'text';
        try {
            body = await response.text();
            const contentType = response.headers()['content-type'] ?? '';
            if (contentType.includes('json')) {
                bodyType = 'json';
            }
            else if (contentType.includes('html')) {
                bodyType = 'html';
            }
            else if (contentType.includes('xml')) {
                bodyType = 'xml';
            }
        }
        catch {
            body = '[Binary or unreadable content]';
            bodyType = 'binary';
        }
        const captured = {
            requestId,
            timestamp: new Date(),
            statusCode: response.status(),
            statusText: response.statusText(),
            headers: response.headers(),
            body,
            bodyType,
            responseTime,
            size: body.length,
        };
        // Store the request with response
        capturedRequest.response = captured;
        this.apiMap.requests.push(capturedRequest);
        // Update API map
        this.updateAPIMap(capturedRequest, captured);
        // Analyze for sensitive data
        this.analyzeSensitiveData(capturedRequest, captured);
        // Emit event
        this.emit('response', { request: capturedRequest, response: captured });
    }
    /**
     * Extract path parameters from URL path
     */
    extractPathParameters(pathname) {
        const params = [];
        const segments = pathname.split('/').filter(Boolean);
        segments.forEach((segment, index) => {
            let type = 'unknown';
            let potentialBOLA = false;
            // Detect UUID
            if (/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(segment)) {
                type = 'uuid';
                potentialBOLA = true;
            }
            // Detect MongoDB ObjectId
            else if (/^[a-f0-9]{24}$/i.test(segment)) {
                type = 'id';
                potentialBOLA = true;
            }
            // Detect numeric ID
            else if (/^\d+$/.test(segment)) {
                type = 'numeric';
                potentialBOLA = true;
            }
            // Detect slug (contains only lowercase letters, numbers, hyphens)
            else if (/^[a-z0-9-]+$/.test(segment) && segment.includes('-')) {
                type = 'slug';
            }
            // Check if previous segment suggests this is an ID
            if (index > 0) {
                const prevSegment = segments[index - 1]?.toLowerCase() ?? '';
                if (ID_PATTERNS.names.some(name => prevSegment.includes(name.toLowerCase()))) {
                    potentialBOLA = true;
                }
            }
            if (type !== 'unknown' || potentialBOLA) {
                params.push({
                    name: segments[index - 1] ?? `param_${index}`,
                    value: segment,
                    position: index,
                    type,
                    potentialBOLA,
                });
            }
        });
        return params;
    }
    /**
     * Extract authentication information from request
     */
    extractAuthentication(headers, queryParams) {
        // Check Authorization header
        const authHeader = headers['authorization'];
        if (authHeader) {
            if (authHeader.toLowerCase().startsWith('bearer ')) {
                return {
                    type: 'bearer',
                    token: authHeader.substring(7),
                    location: 'header',
                    headerName: 'Authorization',
                };
            }
            if (authHeader.toLowerCase().startsWith('basic ')) {
                return {
                    type: 'basic',
                    token: authHeader.substring(6),
                    location: 'header',
                    headerName: 'Authorization',
                };
            }
        }
        // Check common API key headers
        const apiKeyHeaders = ['x-api-key', 'api-key', 'apikey', 'x-auth-token', 'x-access-token'];
        for (const header of apiKeyHeaders) {
            if (headers[header]) {
                return {
                    type: 'apikey',
                    token: headers[header],
                    location: 'header',
                    headerName: header,
                };
            }
        }
        // Check query parameters
        const apiKeyParams = ['api_key', 'apikey', 'key', 'token', 'access_token'];
        for (const param of apiKeyParams) {
            if (queryParams[param]) {
                return {
                    type: 'apikey',
                    token: queryParams[param],
                    location: 'query',
                };
            }
        }
        // Check for session cookie
        if (headers['cookie']?.includes('session')) {
            return {
                type: 'cookie',
                location: 'cookie',
            };
        }
        return { type: 'none', location: 'header' };
    }
    /**
     * Extract cookies from cookie header
     */
    extractCookies(cookieHeader) {
        const cookies = {};
        if (!cookieHeader)
            return cookies;
        cookieHeader.split(';').forEach(cookie => {
            const [name, value] = cookie.split('=').map(s => s.trim());
            if (name && value) {
                cookies[name] = value;
            }
        });
        return cookies;
    }
    /**
     * Detect body type
     */
    detectBodyType(body, contentType) {
        if (contentType.includes('json') || body.startsWith('{') || body.startsWith('[')) {
            return 'json';
        }
        if (contentType.includes('form') || body.includes('=')) {
            return 'form';
        }
        return 'text';
    }
    /**
     * Generate unique request ID
     */
    generateRequestId(request) {
        const data = `${request.method()}-${request.url()}-${Date.now()}`;
        return (0, crypto_1.createHash)('md5').update(data).digest('hex').substring(0, 16);
    }
    /**
     * Update API map with captured request/response
     */
    updateAPIMap(request, response) {
        const url = new URL(request.url);
        const endpointKey = this.normalizeEndpointPath(url.pathname);
        let endpoint = this.apiMap.endpoints.get(endpointKey);
        if (!endpoint) {
            endpoint = {
                baseUrl: url.origin,
                path: endpointKey,
                fullUrl: `${url.origin}${endpointKey}`,
                methods: [],
                parameters: {
                    query: [],
                    path: [],
                    body: [],
                    header: [],
                },
                authentication: request.authentication,
                responses: [],
                sensitiveDataDetected: false,
                bolaRisk: 'none',
                requestCount: 0,
                firstSeen: new Date(),
                lastSeen: new Date(),
            };
            this.apiMap.endpoints.set(endpointKey, endpoint);
            this.apiMap.statistics.totalEndpoints++;
        }
        // Update methods
        if (!endpoint.methods.includes(request.method)) {
            endpoint.methods.push(request.method);
        }
        // Update query parameters
        for (const [name, value] of Object.entries(request.queryParams)) {
            let param = endpoint.parameters.query.find(p => p.name === name);
            if (!param) {
                param = {
                    name,
                    type: this.inferParameterType(value),
                    required: false,
                    examples: [],
                    isIdentifier: ID_PATTERNS.names.some(n => name.toLowerCase().includes(n.toLowerCase())),
                    sensitiveData: SENSITIVE_FIELD_NAMES.some(f => name.toLowerCase().includes(f)),
                };
                endpoint.parameters.query.push(param);
            }
            if (!param.examples.includes(value) && param.examples.length < 5) {
                param.examples.push(value);
            }
        }
        // Update path parameters
        for (const pathParam of request.pathParams) {
            let param = endpoint.parameters.path.find(p => p.name === pathParam.name);
            if (!param) {
                param = {
                    name: pathParam.name,
                    type: pathParam.type,
                    required: true,
                    examples: [],
                    isIdentifier: pathParam.potentialBOLA,
                    sensitiveData: false,
                };
                endpoint.parameters.path.push(param);
            }
            if (!param.examples.includes(pathParam.value) && param.examples.length < 5) {
                param.examples.push(pathParam.value);
            }
        }
        // Update body parameters (for JSON)
        if (request.bodyType === 'json' && request.body) {
            try {
                const bodyObj = JSON.parse(request.body);
                this.extractBodyParameters(bodyObj, endpoint.parameters.body);
            }
            catch {
                // Invalid JSON
            }
        }
        // Update response patterns
        let responsePattern = endpoint.responses.find(r => r.statusCode === response.statusCode);
        if (!responsePattern) {
            responsePattern = {
                statusCode: response.statusCode,
                contentType: response.headers['content-type'] ?? 'unknown',
                sensitiveFields: [],
                exampleCount: 0,
            };
            endpoint.responses.push(responsePattern);
        }
        responsePattern.exampleCount++;
        // Update statistics
        endpoint.requestCount++;
        endpoint.lastSeen = new Date();
        // Update authentication info
        if (request.authentication.type !== 'none') {
            endpoint.authentication = request.authentication;
            // Track auth tokens
            if (!this.apiMap.authTokens.some(t => t.token === request.authentication.token)) {
                this.apiMap.authTokens.push(request.authentication);
            }
        }
    }
    /**
     * Normalize endpoint path (replace IDs with placeholders)
     */
    normalizeEndpointPath(pathname) {
        return pathname
            // Replace UUIDs
            .replace(/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/gi, '{uuid}')
            // Replace MongoDB ObjectIds
            .replace(/[a-f0-9]{24}/gi, '{id}')
            // Replace numeric IDs
            .replace(/\/\d+(?=\/|$)/g, '/{id}');
    }
    /**
     * Infer parameter type from value
     */
    inferParameterType(value) {
        if (/^\d+$/.test(value))
            return 'integer';
        if (/^\d+\.\d+$/.test(value))
            return 'number';
        if (/^(true|false)$/i.test(value))
            return 'boolean';
        if (/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(value))
            return 'uuid';
        if (/^[a-f0-9]{24}$/i.test(value))
            return 'objectId';
        return 'string';
    }
    /**
     * Extract body parameters recursively
     */
    extractBodyParameters(obj, params, prefix = '') {
        if (typeof obj !== 'object' || obj === null)
            return;
        for (const [key, value] of Object.entries(obj)) {
            const fullName = prefix ? `${prefix}.${key}` : key;
            let param = params.find(p => p.name === fullName);
            if (!param) {
                param = {
                    name: fullName,
                    type: typeof value,
                    required: false,
                    examples: [],
                    isIdentifier: ID_PATTERNS.names.some(n => key.toLowerCase().includes(n.toLowerCase())),
                    sensitiveData: SENSITIVE_FIELD_NAMES.some(f => key.toLowerCase().includes(f)),
                };
                params.push(param);
            }
            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                this.extractBodyParameters(value, params, fullName);
            }
        }
    }
    /**
     * Analyze request for BOLA potential
     */
    analyzeBOLAPotential(request) {
        const url = new URL(request.url);
        // Check path parameters
        for (const pathParam of request.pathParams) {
            if (pathParam.potentialBOLA) {
                const target = {
                    endpoint: url.pathname,
                    method: request.method,
                    parameter: pathParam.name,
                    parameterType: 'path',
                    originalValue: pathParam.value,
                    riskLevel: this.assessBOLARisk(pathParam, request),
                    reason: `Path parameter '${pathParam.name}' appears to be an object identifier (${pathParam.type})`,
                };
                if (!this.apiMap.bolaTargets.some(t => t.endpoint === target.endpoint &&
                    t.parameter === target.parameter)) {
                    this.apiMap.bolaTargets.push(target);
                    this.emit('bola-target', target);
                }
            }
        }
        // Check query parameters
        for (const [name, value] of Object.entries(request.queryParams)) {
            if (ID_PATTERNS.names.some(n => name.toLowerCase().includes(n.toLowerCase()))) {
                const target = {
                    endpoint: url.pathname,
                    method: request.method,
                    parameter: name,
                    parameterType: 'query',
                    originalValue: value,
                    riskLevel: 'medium',
                    reason: `Query parameter '${name}' appears to be an object identifier`,
                };
                if (!this.apiMap.bolaTargets.some(t => t.endpoint === target.endpoint &&
                    t.parameter === target.parameter)) {
                    this.apiMap.bolaTargets.push(target);
                    this.emit('bola-target', target);
                }
            }
        }
    }
    /**
     * Assess BOLA risk level
     */
    assessBOLARisk(param, request) {
        // Higher risk if authenticated endpoint
        if (request.authentication.type !== 'none') {
            // Numeric IDs are easier to guess = higher risk
            if (param.type === 'numeric')
                return 'critical';
            if (param.type === 'id')
                return 'high';
            return 'medium';
        }
        return 'low';
    }
    /**
     * Analyze response for sensitive data
     */
    analyzeSensitiveData(request, response) {
        if (response.bodyType !== 'json')
            return;
        const sensitiveFindings = [];
        const body = response.body;
        // Check for sensitive patterns
        for (const [name, pattern] of Object.entries(SENSITIVE_PATTERNS)) {
            if (pattern.test(body)) {
                sensitiveFindings.push(name);
            }
        }
        // Check for sensitive field names in JSON
        try {
            const json = JSON.parse(body);
            const fields = this.findSensitiveFields(json);
            sensitiveFindings.push(...fields);
        }
        catch {
            // Not valid JSON
        }
        if (sensitiveFindings.length > 0) {
            const endpointKey = this.normalizeEndpointPath(new URL(request.url).pathname);
            const endpoint = this.apiMap.endpoints.get(endpointKey);
            if (endpoint) {
                endpoint.sensitiveDataDetected = true;
                const responsePattern = endpoint.responses.find(r => r.statusCode === response.statusCode);
                if (responsePattern) {
                    responsePattern.sensitiveFields = [...new Set([...responsePattern.sensitiveFields, ...sensitiveFindings])];
                }
            }
            if (!this.apiMap.sensitiveEndpoints.includes(endpointKey)) {
                this.apiMap.sensitiveEndpoints.push(endpointKey);
            }
            this.emit('sensitive-data', {
                endpoint: endpointKey,
                findings: sensitiveFindings,
                request,
                response,
            });
        }
    }
    /**
     * Find sensitive fields in JSON object
     */
    findSensitiveFields(obj, path = '') {
        const findings = [];
        if (typeof obj !== 'object' || obj === null)
            return findings;
        for (const [key, value] of Object.entries(obj)) {
            const currentPath = path ? `${path}.${key}` : key;
            if (SENSITIVE_FIELD_NAMES.some(f => key.toLowerCase().includes(f))) {
                findings.push(currentPath);
            }
            if (typeof value === 'object' && value !== null) {
                findings.push(...this.findSensitiveFields(value, currentPath));
            }
        }
        return findings;
    }
    /**
     * Navigate and interact with page to discover more APIs
     */
    async explore(options = {}) {
        if (!this.page)
            throw new Error('Interception not started');
        const maxClicks = options.maxClicks ?? 50;
        const clickSelectors = options.clickSelectors ?? [
            'button', 'a[href^="/"]', '[onclick]', 'input[type="submit"]',
            '[role="button"]', '.btn', '[data-action]',
        ];
        console.log('🔍 [API_INTERCEPTOR] Exploring page to discover more APIs...');
        let clicks = 0;
        for (const selector of clickSelectors) {
            if (clicks >= maxClicks)
                break;
            try {
                const elements = await this.page.$$(selector);
                for (const element of elements.slice(0, 10)) {
                    if (clicks >= maxClicks)
                        break;
                    try {
                        await element.click({ timeout: 2000 });
                        await this.page.waitForTimeout(500);
                        clicks++;
                    }
                    catch {
                        // Element not clickable
                    }
                }
            }
            catch {
                // Selector not found
            }
        }
        console.log(`   ✅ Clicked ${clicks} elements\n`);
    }
    /**
     * Stop interception and return API map
     */
    async stopInterception() {
        this.isIntercepting = false;
        this.apiMap.scanEnded = new Date();
        // Calculate final statistics
        this.apiMap.statistics.uniquePaths = this.apiMap.endpoints.size;
        this.apiMap.statistics.authenticatedEndpoints = Array.from(this.apiMap.endpoints.values())
            .filter(e => e.authentication.type !== 'none').length;
        this.apiMap.statistics.sensitiveEndpoints = this.apiMap.sensitiveEndpoints.length;
        this.apiMap.statistics.bolaTargets = this.apiMap.bolaTargets.length;
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
            this.page = null;
        }
        return this.apiMap;
    }
    /**
     * Intercept API traffic with optional interaction steps
     * This is the main entry point for API interception
     */
    async intercept(interactionSteps) {
        await this.startInterception();
        // Perform interaction steps if provided
        if (interactionSteps && this.page) {
            for (const step of interactionSteps) {
                try {
                    switch (step.action) {
                        case 'click':
                            if (step.selector)
                                await this.page.click(step.selector);
                            break;
                        case 'fill':
                            if (step.selector && step.value)
                                await this.page.fill(step.selector, step.value);
                            break;
                        case 'navigate':
                            if (step.url)
                                await this.page.goto(step.url, { waitUntil: 'networkidle' });
                            break;
                        case 'wait':
                            await this.page.waitForTimeout(parseInt(step.value ?? '1000'));
                            break;
                        case 'scroll':
                            await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
                            break;
                    }
                    // Wait for any triggered requests
                    await this.page.waitForTimeout(500);
                }
                catch (error) {
                    console.warn(`   ⚠️  Interaction step failed: ${step.action} - ${error instanceof Error ? error.message : 'Unknown'}`);
                }
            }
        }
        // Wait for any pending requests
        if (this.page) {
            await this.page.waitForTimeout(2000);
        }
        return this.stopInterception();
    }
    /**
     * Get current API map
     */
    getAPIMap() {
        return this.apiMap;
    }
    /**
     * Export API map to JSON
     */
    exportToJSON() {
        const exportData = {
            ...this.apiMap,
            endpoints: Array.from(this.apiMap.endpoints.entries()),
        };
        return JSON.stringify(exportData, null, 2);
    }
    /**
     * Print API map summary
     */
    printSummary() {
        console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║                    🕸️  API INTERCEPTOR SUMMARY                               ║
╠══════════════════════════════════════════════════════════════════════════════╣
║ Target: ${this.apiMap.target.padEnd(65)}║
║ Duration: ${((this.apiMap.scanEnded?.getTime() ?? Date.now()) - this.apiMap.scanStarted.getTime()) / 1000}s                                                          ║
╠══════════════════════════════════════════════════════════════════════════════╣
║ STATISTICS:                                                                  ║
║   Total Requests Captured: ${this.apiMap.statistics.totalRequests.toString().padStart(5)}                                       ║
║   Unique Endpoints: ${this.apiMap.statistics.totalEndpoints.toString().padStart(5)}                                              ║
║   Authenticated Endpoints: ${this.apiMap.statistics.authenticatedEndpoints.toString().padStart(5)}                                       ║
║   Sensitive Data Endpoints: ${this.apiMap.statistics.sensitiveEndpoints.toString().padStart(4)}                                       ║
║   BOLA Targets Found: ${this.apiMap.statistics.bolaTargets.toString().padStart(5)}                                            ║
╠══════════════════════════════════════════════════════════════════════════════╣
║ AUTH TOKENS CAPTURED: ${this.apiMap.authTokens.length.toString().padStart(3)}                                                    ║`);
        for (const token of this.apiMap.authTokens.slice(0, 3)) {
            console.log(`║   ${token.type.padEnd(8)} @ ${token.location.padEnd(6)} : ${(token.token?.substring(0, 30) + '...').padEnd(35)}║`);
        }
        console.log(`╠══════════════════════════════════════════════════════════════════════════════╣
║ 🎯 BOLA TARGETS:                                                             ║`);
        for (const target of this.apiMap.bolaTargets.slice(0, 5)) {
            const riskEmoji = { critical: '🔴', high: '🟠', medium: '🟡', low: '🟢' }[target.riskLevel];
            console.log(`║   ${riskEmoji} ${target.method.padEnd(6)} ${target.endpoint.substring(0, 40).padEnd(42)} ║`);
        }
        console.log(`╚══════════════════════════════════════════════════════════════════════════════╝`);
    }
}
exports.APIInterceptor = APIInterceptor;
exports.default = APIInterceptor;
