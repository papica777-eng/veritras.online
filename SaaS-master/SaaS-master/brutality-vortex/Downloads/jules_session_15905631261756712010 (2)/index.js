#!/usr/bin/env node
/**
 * ╔═══════════════════════════════════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                                                           ║
 * ║    █████╗ ██████╗ ██╗    ███████╗███████╗███╗   ██╗███████╗███████╗██╗                                    ║
 * ║   ██╔══██╗██╔══██╗██║    ██╔════╝██╔════╝████╗  ██║██╔════╝██╔════╝██║                                    ║
 * ║   ███████║██████╔╝██║    ███████╗█████╗  ██╔██╗ ██║███████╗█████╗  ██║                                    ║
 * ║   ██╔══██║██╔═══╝ ██║    ╚════██║██╔══╝  ██║╚██╗██║╚════██║██╔══╝  ██║                                    ║
 * ║   ██║  ██║██║     ██║    ███████║███████╗██║ ╚████║███████║███████╗██║                                    ║
 * ║   ╚═╝  ╚═╝╚═╝     ╚═╝    ╚══════╝╚══════╝╚═╝  ╚═══╝╚══════╝╚══════╝╚═╝                                    ║
 * ║                                                                                                           ║
 * ║   QANTUM v15.0 - API SENSEI MODULE                                                                  ║
 * ║   "Master the Art of API Testing"                                                                        ║
 * ║                                                                                                           ║
 * ║   Features:                                                                                               ║
 * ║   - REST & GraphQL Testing                                                                               ║
 * ║   - Schema Validation (JSON Schema, OpenAPI)                                                             ║
 * ║   - Contract Testing                                                                                      ║
 * ║   - Response Time Monitoring                                                                              ║
 * ║   - Data Validation & Type Checking                                                                       ║
 * ║   - Chained Request Testing                                                                               ║
 * ║   - Authentication Handling (OAuth, JWT, API Keys)                                                        ║
 * ║   - AI-Powered Response Analysis                                                                          ║
 * ║                                                                                                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════════════════════════╝
 */

const EventEmitter = require('events');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// ═══════════════════════════════════════════════════════════════════════════════════════
// 📊 HTTP STATUS CODES
// ═══════════════════════════════════════════════════════════════════════════════════════

const HTTP_STATUS = {
    // Success
    200: { name: 'OK', type: 'success' },
    201: { name: 'Created', type: 'success' },
    204: { name: 'No Content', type: 'success' },
    
    // Redirection
    301: { name: 'Moved Permanently', type: 'redirect' },
    302: { name: 'Found', type: 'redirect' },
    304: { name: 'Not Modified', type: 'redirect' },
    
    // Client Errors
    400: { name: 'Bad Request', type: 'client_error' },
    401: { name: 'Unauthorized', type: 'client_error' },
    403: { name: 'Forbidden', type: 'client_error' },
    404: { name: 'Not Found', type: 'client_error' },
    405: { name: 'Method Not Allowed', type: 'client_error' },
    409: { name: 'Conflict', type: 'client_error' },
    422: { name: 'Unprocessable Entity', type: 'client_error' },
    429: { name: 'Too Many Requests', type: 'client_error' },
    
    // Server Errors
    500: { name: 'Internal Server Error', type: 'server_error' },
    502: { name: 'Bad Gateway', type: 'server_error' },
    503: { name: 'Service Unavailable', type: 'server_error' },
    504: { name: 'Gateway Timeout', type: 'server_error' }
};

// ═══════════════════════════════════════════════════════════════════════════════════════
// 🔐 AUTHENTICATION STRATEGIES
// ═══════════════════════════════════════════════════════════════════════════════════════

const AUTH_STRATEGIES = {
    NONE: 'none',
    BASIC: 'basic',
    BEARER: 'bearer',
    API_KEY: 'api_key',
    OAUTH2: 'oauth2',
    JWT: 'jwt',
    CUSTOM: 'custom'
};

// ═══════════════════════════════════════════════════════════════════════════════════════
// 📝 VALIDATION RULES
// ═══════════════════════════════════════════════════════════════════════════════════════

const VALIDATION_RULES = {
    // Type validators
    isString: (val) => typeof val === 'string',
    isNumber: (val) => typeof val === 'number' && !isNaN(val),
    isBoolean: (val) => typeof val === 'boolean',
    isArray: (val) => Array.isArray(val),
    isObject: (val) => val !== null && typeof val === 'object' && !Array.isArray(val),
    isNull: (val) => val === null,
    isUndefined: (val) => val === undefined,
    
    // String validators
    isEmail: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
    isUrl: (val) => /^https?:\/\/.+/.test(val),
    isUuid: (val) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val),
    isIsoDate: (val) => /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2})?/.test(val),
    minLength: (min) => (val) => val && val.length >= min,
    maxLength: (max) => (val) => val && val.length <= max,
    pattern: (regex) => (val) => regex.test(val),
    
    // Number validators
    isPositive: (val) => val > 0,
    isNegative: (val) => val < 0,
    isInteger: (val) => Number.isInteger(val),
    min: (min) => (val) => val >= min,
    max: (max) => (val) => val <= max,
    between: (min, max) => (val) => val >= min && val <= max,
    
    // Array validators
    minItems: (min) => (val) => Array.isArray(val) && val.length >= min,
    maxItems: (max) => (val) => Array.isArray(val) && val.length <= max,
    uniqueItems: (val) => Array.isArray(val) && new Set(val).size === val.length,
    contains: (item) => (val) => Array.isArray(val) && val.includes(item),
    
    // Object validators
    hasProperty: (prop) => (val) => val && prop in val,
    hasProperties: (props) => (val) => val && props.every(p => p in val)
};

// ═══════════════════════════════════════════════════════════════════════════════════════
// 🎯 API SENSEI CLASS
// ═══════════════════════════════════════════════════════════════════════════════════════

class APISensei extends EventEmitter {
    constructor(options = {}) {
        super();
        
        this.baseUrl = options.baseURL || options.baseUrl || '';
        this.timeout = options.timeout || 30000;
        this.retries = options.retries || 3;
        this.retryDelay = options.retryDelay || 1000;
        
        // Authentication
        this.auth = {
            strategy: AUTH_STRATEGIES.NONE,
            credentials: null
        };
        
        // Default headers
        this.defaultHeaders = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'QAntum-APISensei/15.0',
            ...options.headers
        };
        
        // Request history for chaining
        this.history = [];
        this.variables = {};
        
        // Performance tracking
        this.metrics = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            avgResponseTime: 0,
            responseTimes: []
        };
        
        // Schema cache
        this.schemas = new Map();
        
        console.log('🥋 API Sensei initialized');
    }
    
    // ═══════════════════════════════════════════════════════════════════════════════
    // 🔐 AUTHENTICATION METHODS
    // ═══════════════════════════════════════════════════════════════════════════════
    
    /**
     * Set Basic Authentication
     */
    setBasicAuth(username, password) {
        this.auth = {
            strategy: AUTH_STRATEGIES.BASIC,
            credentials: Buffer.from(`${username}:${password}`).toString('base64')
        };
        return this;
    }
    
    /**
     * Set Bearer Token Authentication
     */
    setBearerToken(token) {
        this.auth = {
            strategy: AUTH_STRATEGIES.BEARER,
            credentials: token
        };
        return this;
    }
    
    /**
     * Set API Key Authentication
     */
    setApiKey(key, headerName = 'X-API-Key') {
        this.auth = {
            strategy: AUTH_STRATEGIES.API_KEY,
            credentials: { key, headerName }
        };
        return this;
    }
    
    /**
     * Set JWT Authentication
     */
    setJWT(token) {
        this.auth = {
            strategy: AUTH_STRATEGIES.JWT,
            credentials: token
        };
        return this;
    }
    
    /**
     * Get authentication header
     */
    _getAuthHeader() {
        switch (this.auth.strategy) {
            case AUTH_STRATEGIES.BASIC:
                return { 'Authorization': `Basic ${this.auth.credentials}` };
            case AUTH_STRATEGIES.BEARER:
            case AUTH_STRATEGIES.JWT:
                return { 'Authorization': `Bearer ${this.auth.credentials}` };
            case AUTH_STRATEGIES.API_KEY:
                return { [this.auth.credentials.headerName]: this.auth.credentials.key };
            default:
                return {};
        }
    }
    
    // ═══════════════════════════════════════════════════════════════════════════════
    // 📡 HTTP METHODS
    // ═══════════════════════════════════════════════════════════════════════════════
    
    /**
     * Make HTTP request
     */
    async request(method, endpoint, options = {}) {
        const startTime = Date.now();
        const url = this._buildUrl(endpoint);
        
        const requestOptions = {
            method: method.toUpperCase(),
            headers: {
                ...this.defaultHeaders,
                ...this._getAuthHeader(),
                ...options.headers
            },
            timeout: options.timeout || this.timeout
        };
        
        // Add body for POST/PUT/PATCH
        let body = null;
        if (options.body && ['POST', 'PUT', 'PATCH'].includes(requestOptions.method)) {
            body = typeof options.body === 'string' 
                ? options.body 
                : JSON.stringify(options.body);
            requestOptions.headers['Content-Length'] = Buffer.byteLength(body);
        }
        
        // Add query parameters
        const urlWithParams = options.params 
            ? `${url}?${new URLSearchParams(options.params).toString()}`
            : url;
        
        this.emit('request:start', { method, url: urlWithParams, options: requestOptions });
        
        try {
            const response = await this._executeRequest(urlWithParams, requestOptions, body);
            const responseTime = Date.now() - startTime;
            
            // Update metrics
            this._updateMetrics(true, responseTime);
            
            // Build result
            const result = {
                success: response.statusCode >= 200 && response.statusCode < 300,
                status: response.statusCode,
                statusText: HTTP_STATUS[response.statusCode]?.name || 'Unknown',
                headers: response.headers,
                data: response.data,
                responseTime,
                request: {
                    method,
                    url: urlWithParams,
                    headers: requestOptions.headers,
                    body: options.body
                }
            };
            
            // Store in history
            this.history.push(result);
            
            this.emit('request:complete', result);
            
            return result;
            
        } catch (error) {
            const responseTime = Date.now() - startTime;
            this._updateMetrics(false, responseTime);
            
            const errorResult = {
                success: false,
                error: error.message,
                responseTime,
                request: {
                    method,
                    url: urlWithParams
                }
            };
            
            this.emit('request:error', errorResult);
            
            return errorResult;
        }
    }
    
    /**
     * Execute HTTP request with retry logic
     */
    async _executeRequest(url, options, body, attempt = 1) {
        return new Promise((resolve, reject) => {
            const urlObj = new URL(url);
            const protocol = urlObj.protocol === 'https:' ? https : http;
            
            const req = protocol.request(url, options, (res) => {
                let data = '';
                
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    let parsedData;
                    try {
                        parsedData = JSON.parse(data);
                    } catch {
                        parsedData = data;
                    }
                    
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        data: parsedData
                    });
                });
            });
            
            req.on('error', async (error) => {
                if (attempt < this.retries) {
                    await this._delay(this.retryDelay * attempt);
                    try {
                        const result = await this._executeRequest(url, options, body, attempt + 1);
                        resolve(result);
                    } catch (retryError) {
                        reject(retryError);
                    }
                } else {
                    reject(error);
                }
            });
            
            req.on('timeout', () => {
                req.destroy();
                reject(new Error('Request timeout'));
            });
            
            if (body) {
                req.write(body);
            }
            
            req.end();
        });
    }
    
    /**
     * HTTP GET
     */
    async get(endpoint, options = {}) {
        return this.request('GET', endpoint, options);
    }
    
    /**
     * HTTP POST
     */
    async post(endpoint, body, options = {}) {
        return this.request('POST', endpoint, { ...options, body });
    }
    
    /**
     * HTTP PUT
     */
    async put(endpoint, body, options = {}) {
        return this.request('PUT', endpoint, { ...options, body });
    }
    
    /**
     * HTTP PATCH
     */
    async patch(endpoint, body, options = {}) {
        return this.request('PATCH', endpoint, { ...options, body });
    }
    
    /**
     * HTTP DELETE
     */
    async delete(endpoint, options = {}) {
        return this.request('DELETE', endpoint, options);
    }
    
    // ═══════════════════════════════════════════════════════════════════════════════
    // 🔍 GRAPHQL SUPPORT
    // ═══════════════════════════════════════════════════════════════════════════════
    
    /**
     * Execute GraphQL query
     */
    async graphql(query, variables = {}, options = {}) {
        const endpoint = options.endpoint || '/graphql';
        
        return this.post(endpoint, {
            query,
            variables
        }, {
            ...options,
            headers: {
                ...options.headers,
                'Content-Type': 'application/json'
            }
        });
    }
    
    /**
     * Execute GraphQL mutation
     */
    async mutation(mutation, variables = {}, options = {}) {
        return this.graphql(mutation, variables, options);
    }
    
    // ═══════════════════════════════════════════════════════════════════════════════
    // ✅ VALIDATION & ASSERTIONS
    // ═══════════════════════════════════════════════════════════════════════════════
    
    /**
     * Validate response against schema
     */
    validateSchema(response, schema) {
        const errors = [];
        
        const validate = (data, schemaObj, path = '') => {
            if (!schemaObj) return;
            
            // Type validation
            if (schemaObj.type) {
                const typeCheck = {
                    'string': VALIDATION_RULES.isString,
                    'number': VALIDATION_RULES.isNumber,
                    'integer': (v) => VALIDATION_RULES.isNumber(v) && VALIDATION_RULES.isInteger(v),
                    'boolean': VALIDATION_RULES.isBoolean,
                    'array': VALIDATION_RULES.isArray,
                    'object': VALIDATION_RULES.isObject,
                    'null': VALIDATION_RULES.isNull
                };
                
                if (typeCheck[schemaObj.type] && !typeCheck[schemaObj.type](data)) {
                    errors.push({
                        path: path || 'root',
                        expected: schemaObj.type,
                        actual: typeof data,
                        message: `Expected ${schemaObj.type} at ${path || 'root'}, got ${typeof data}`
                    });
                }
            }
            
            // Required fields
            if (schemaObj.required && VALIDATION_RULES.isObject(data)) {
                for (const field of schemaObj.required) {
                    if (!(field in data)) {
                        errors.push({
                            path: `${path}.${field}`,
                            message: `Missing required field: ${field}`
                        });
                    }
                }
            }
            
            // Properties validation
            if (schemaObj.properties && VALIDATION_RULES.isObject(data)) {
                for (const [key, propSchema] of Object.entries(schemaObj.properties)) {
                    if (key in data) {
                        validate(data[key], propSchema, `${path}.${key}`);
                    }
                }
            }
            
            // Array items validation
            if (schemaObj.items && VALIDATION_RULES.isArray(data)) {
                data.forEach((item, index) => {
                    validate(item, schemaObj.items, `${path}[${index}]`);
                });
            }
            
            // String validations
            if (VALIDATION_RULES.isString(data)) {
                if (schemaObj.minLength && data.length < schemaObj.minLength) {
                    errors.push({
                        path,
                        message: `String too short. Min: ${schemaObj.minLength}, Got: ${data.length}`
                    });
                }
                if (schemaObj.maxLength && data.length > schemaObj.maxLength) {
                    errors.push({
                        path,
                        message: `String too long. Max: ${schemaObj.maxLength}, Got: ${data.length}`
                    });
                }
                if (schemaObj.pattern && !new RegExp(schemaObj.pattern).test(data)) {
                    errors.push({
                        path,
                        message: `String doesn't match pattern: ${schemaObj.pattern}`
                    });
                }
                if (schemaObj.format) {
                    const formatChecks = {
                        'email': VALIDATION_RULES.isEmail,
                        'uri': VALIDATION_RULES.isUrl,
                        'url': VALIDATION_RULES.isUrl,
                        'uuid': VALIDATION_RULES.isUuid,
                        'date-time': VALIDATION_RULES.isIsoDate
                    };
                    if (formatChecks[schemaObj.format] && !formatChecks[schemaObj.format](data)) {
                        errors.push({
                            path,
                            message: `Invalid format. Expected: ${schemaObj.format}`
                        });
                    }
                }
            }
            
            // Number validations
            if (VALIDATION_RULES.isNumber(data)) {
                if (schemaObj.minimum !== undefined && data < schemaObj.minimum) {
                    errors.push({
                        path,
                        message: `Number too small. Min: ${schemaObj.minimum}, Got: ${data}`
                    });
                }
                if (schemaObj.maximum !== undefined && data > schemaObj.maximum) {
                    errors.push({
                        path,
                        message: `Number too large. Max: ${schemaObj.maximum}, Got: ${data}`
                    });
                }
            }
            
            // Enum validation
            if (schemaObj.enum && !schemaObj.enum.includes(data)) {
                errors.push({
                    path,
                    message: `Value not in enum. Expected one of: ${schemaObj.enum.join(', ')}`
                });
            }
        };
        
        validate(response.data, schema);
        
        return {
            valid: errors.length === 0,
            errors
        };
    }
    
    /**
     * Assert response status
     */
    assertStatus(response, expectedStatus) {
        const passed = response.status === expectedStatus;
        return {
            passed,
            message: passed 
                ? `✅ Status ${expectedStatus} as expected`
                : `❌ Expected status ${expectedStatus}, got ${response.status}`
        };
    }
    
    /**
     * Assert response time
     */
    assertResponseTime(response, maxMs) {
        const passed = response.responseTime <= maxMs;
        return {
            passed,
            message: passed
                ? `✅ Response time ${response.responseTime}ms <= ${maxMs}ms`
                : `❌ Response time ${response.responseTime}ms exceeded ${maxMs}ms`
        };
    }
    
    /**
     * Assert response contains property
     */
    assertHasProperty(response, propertyPath) {
        const value = this._getNestedProperty(response.data, propertyPath);
        const passed = value !== undefined;
        return {
            passed,
            message: passed
                ? `✅ Property '${propertyPath}' exists`
                : `❌ Property '${propertyPath}' not found`
        };
    }
    
    /**
     * Assert property equals value
     */
    assertPropertyEquals(response, propertyPath, expectedValue) {
        const actualValue = this._getNestedProperty(response.data, propertyPath);
        const passed = actualValue === expectedValue;
        return {
            passed,
            message: passed
                ? `✅ Property '${propertyPath}' equals '${expectedValue}'`
                : `❌ Property '${propertyPath}': expected '${expectedValue}', got '${actualValue}'`
        };
    }
    
    /**
     * Assert array length
     */
    assertArrayLength(response, propertyPath, expectedLength) {
        const array = this._getNestedProperty(response.data, propertyPath);
        const passed = Array.isArray(array) && array.length === expectedLength;
        return {
            passed,
            message: passed
                ? `✅ Array '${propertyPath}' has ${expectedLength} items`
                : `❌ Array '${propertyPath}': expected ${expectedLength} items, got ${array?.length || 'not an array'}`
        };
    }
    
    // ═══════════════════════════════════════════════════════════════════════════════
    // 🔗 CHAINED REQUESTS
    // ═══════════════════════════════════════════════════════════════════════════════
    
    /**
     * Create a test chain
     */
    chain(name) {
        return new APITestChain(this, name);
    }
    
    /**
     * Store variable from response
     */
    storeVariable(name, value) {
        this.variables[name] = value;
        return this;
    }
    
    /**
     * Get stored variable
     */
    getVariable(name) {
        return this.variables[name];
    }
    
    /**
     * Replace variables in string
     */
    _replaceVariables(str) {
        if (typeof str !== 'string') return str;
        return str.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
            return this.variables[varName] !== undefined ? this.variables[varName] : match;
        });
    }
    
    // ═══════════════════════════════════════════════════════════════════════════════
    // 📊 METRICS & REPORTING
    // ═══════════════════════════════════════════════════════════════════════════════
    
    /**
     * Update metrics
     */
    _updateMetrics(success, responseTime) {
        this.metrics.totalRequests++;
        this.metrics.responseTimes.push(responseTime);
        
        if (success) {
            this.metrics.successfulRequests++;
        } else {
            this.metrics.failedRequests++;
        }
        
        this.metrics.avgResponseTime = 
            this.metrics.responseTimes.reduce((a, b) => a + b, 0) / 
            this.metrics.responseTimes.length;
    }
    
    /**
     * Get metrics report
     */
    getMetrics() {
        const sortedTimes = [...this.metrics.responseTimes].sort((a, b) => a - b);
        const p95Index = Math.floor(sortedTimes.length * 0.95);
        const p99Index = Math.floor(sortedTimes.length * 0.99);
        
        return {
            ...this.metrics,
            successRate: (this.metrics.successfulRequests / this.metrics.totalRequests * 100).toFixed(2) + '%',
            p95ResponseTime: sortedTimes[p95Index] || 0,
            p99ResponseTime: sortedTimes[p99Index] || 0,
            minResponseTime: Math.min(...sortedTimes) || 0,
            maxResponseTime: Math.max(...sortedTimes) || 0
        };
    }
    
    /**
     * Generate HTML report
     */
    generateReport(filename = 'api-report.html') {
        const metrics = this.getMetrics();
        const html = `
<!DOCTYPE html>
<html>
<head>
    <title>API Sensei Test Report</title>
    <style>
        body { font-family: 'Segoe UI', sans-serif; background: #0f172a; color: #e2e8f0; padding: 2rem; }
        .container { max-width: 1200px; margin: 0 auto; }
        h1 { color: #818cf8; }
        .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin: 2rem 0; }
        .metric { background: #1e293b; padding: 1.5rem; border-radius: 0.5rem; border-left: 4px solid #818cf8; }
        .metric-value { font-size: 2rem; font-weight: bold; color: #10b981; }
        .metric-label { color: #94a3b8; font-size: 0.875rem; }
        .history { margin-top: 2rem; }
        .request { background: #1e293b; padding: 1rem; margin: 0.5rem 0; border-radius: 0.5rem; }
        .success { border-left: 4px solid #10b981; }
        .failure { border-left: 4px solid #ef4444; }
        .status { font-weight: bold; }
        .status-2xx { color: #10b981; }
        .status-4xx { color: #f59e0b; }
        .status-5xx { color: #ef4444; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🥋 API Sensei Test Report</h1>
        <p>Generated: ${new Date().toISOString()}</p>
        
        <div class="metrics">
            <div class="metric">
                <div class="metric-value">${metrics.totalRequests}</div>
                <div class="metric-label">Total Requests</div>
            </div>
            <div class="metric">
                <div class="metric-value">${metrics.successRate}</div>
                <div class="metric-label">Success Rate</div>
            </div>
            <div class="metric">
                <div class="metric-value">${metrics.avgResponseTime.toFixed(0)}ms</div>
                <div class="metric-label">Avg Response Time</div>
            </div>
            <div class="metric">
                <div class="metric-value">${metrics.p95ResponseTime}ms</div>
                <div class="metric-label">P95 Response Time</div>
            </div>
        </div>
        
        <div class="history">
            <h2>Request History</h2>
            ${this.history.map(req => `
                <div class="request ${req.success ? 'success' : 'failure'}">
                    <span class="status status-${Math.floor(req.status/100)}xx">${req.status}</span>
                    <strong>${req.request.method}</strong> ${req.request.url}
                    <span style="float:right">${req.responseTime}ms</span>
                </div>
            `).join('')}
        </div>
    </div>
</body>
</html>`;
        
        fs.writeFileSync(filename, html);
        console.log(`📊 Report generated: ${filename}`);
        return filename;
    }
    
    // ═══════════════════════════════════════════════════════════════════════════════
    // 🛠️ UTILITY METHODS
    // ═══════════════════════════════════════════════════════════════════════════════
    
    _buildUrl(endpoint) {
        if (endpoint.startsWith('http')) return endpoint;
        return `${this.baseUrl}${endpoint}`;
    }
    
    _delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    _getNestedProperty(obj, path) {
        return path.split('.').reduce((current, key) => {
            if (current === undefined || current === null) return undefined;
            // Handle array notation: items[0]
            const arrayMatch = key.match(/(\w+)\[(\d+)\]/);
            if (arrayMatch) {
                const [, prop, index] = arrayMatch;
                return current[prop]?.[parseInt(index)];
            }
            return current[key];
        }, obj);
    }
    
    /**
     * Reset all state
     */
    reset() {
        this.history = [];
        this.variables = {};
        this.metrics = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            avgResponseTime: 0,
            responseTimes: []
        };
        return this;
    }
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// 🔗 API TEST CHAIN CLASS
// ═══════════════════════════════════════════════════════════════════════════════════════

class APITestChain {
    constructor(sensei, name) {
        this.sensei = sensei;
        this.name = name;
        this.steps = [];
        this.results = [];
    }
    
    /**
     * Add GET step
     */
    get(endpoint, options = {}) {
        this.steps.push({ method: 'get', endpoint, options });
        return this;
    }
    
    /**
     * Add POST step
     */
    post(endpoint, body, options = {}) {
        this.steps.push({ method: 'post', endpoint, body, options });
        return this;
    }
    
    /**
     * Add PUT step
     */
    put(endpoint, body, options = {}) {
        this.steps.push({ method: 'put', endpoint, body, options });
        return this;
    }
    
    /**
     * Add DELETE step
     */
    delete(endpoint, options = {}) {
        this.steps.push({ method: 'delete', endpoint, options });
        return this;
    }
    
    /**
     * Store value from last response
     */
    store(varName, propertyPath) {
        this.steps.push({ 
            type: 'store', 
            varName, 
            propertyPath 
        });
        return this;
    }
    
    /**
     * Add assertion
     */
    assert(assertionFn) {
        this.steps.push({ 
            type: 'assert', 
            fn: assertionFn 
        });
        return this;
    }
    
    /**
     * Assert status code
     */
    expectStatus(status) {
        return this.assert((response) => this.sensei.assertStatus(response, status));
    }
    
    /**
     * Assert response time
     */
    expectResponseTime(maxMs) {
        return this.assert((response) => this.sensei.assertResponseTime(response, maxMs));
    }
    
    /**
     * Assert property exists
     */
    expectProperty(path) {
        return this.assert((response) => this.sensei.assertHasProperty(response, path));
    }
    
    /**
     * Assert property equals
     */
    expectPropertyEquals(path, value) {
        return this.assert((response) => this.sensei.assertPropertyEquals(response, path, value));
    }
    
    /**
     * Execute the chain
     */
    async run() {
        console.log(`\n🔗 Running chain: ${this.name}`);
        console.log('═'.repeat(50));
        
        let lastResponse = null;
        const assertions = [];
        
        for (const step of this.steps) {
            if (step.type === 'store') {
                // Store variable from last response
                if (lastResponse) {
                    const value = this.sensei._getNestedProperty(lastResponse.data, step.propertyPath);
                    this.sensei.storeVariable(step.varName, value);
                    console.log(`   📦 Stored ${step.varName} = ${value}`);
                }
            } else if (step.type === 'assert') {
                // Run assertion on last response
                if (lastResponse) {
                    const result = step.fn(lastResponse);
                    assertions.push(result);
                    console.log(`   ${result.message}`);
                }
            } else {
                // HTTP request
                const endpoint = this.sensei._replaceVariables(step.endpoint);
                const body = step.body ? JSON.parse(this.sensei._replaceVariables(JSON.stringify(step.body))) : undefined;
                
                console.log(`\n📡 ${step.method.toUpperCase()} ${endpoint}`);
                
                lastResponse = await this.sensei[step.method](endpoint, body, step.options);
                
                console.log(`   Status: ${lastResponse.status} (${lastResponse.responseTime}ms)`);
                
                this.results.push({
                    step: step.method.toUpperCase() + ' ' + endpoint,
                    response: lastResponse
                });
            }
        }
        
        // Summary
        const passed = assertions.filter(a => a.passed).length;
        const failed = assertions.filter(a => !a.passed).length;
        
        console.log('\n' + '═'.repeat(50));
        console.log(`📊 Chain "${this.name}" complete:`);
        console.log(`   ✅ Passed: ${passed}`);
        console.log(`   ❌ Failed: ${failed}`);
        console.log('═'.repeat(50) + '\n');
        
        return {
            name: this.name,
            passed: failed === 0,
            assertions: { passed, failed, total: assertions.length },
            results: this.results
        };
    }
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// 📦 EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════

module.exports = {
    APISensei,
    APITestChain,
    HTTP_STATUS,
    AUTH_STRATEGIES,
    VALIDATION_RULES
};

// ═══════════════════════════════════════════════════════════════════════════════════════
// 🧪 CLI TEST
// ═══════════════════════════════════════════════════════════════════════════════════════

if (require.main === module) {
    (async () => {
        console.log(`
╔═══════════════════════════════════════════════════════════════╗
║   🥋 API SENSEI - QANTUM v15.0                          ║
║   "Master the Art of API Testing"                            ║
╚═══════════════════════════════════════════════════════════════╝
        `);
        
        const sensei = new APISensei({
            baseUrl: 'https://jsonplaceholder.typicode.com'
        });
        
        // Example 1: Simple GET
        console.log('\n📌 Example 1: Simple GET request\n');
        const users = await sensei.get('/users');
        console.log(`Status: ${users.status}`);
        console.log(`Users count: ${users.data?.length}`);
        console.log(`Response time: ${users.responseTime}ms`);
        
        // Example 2: Schema Validation
        console.log('\n📌 Example 2: Schema Validation\n');
        const userSchema = {
            type: 'array',
            items: {
                type: 'object',
                required: ['id', 'name', 'email'],
                properties: {
                    id: { type: 'integer' },
                    name: { type: 'string' },
                    email: { type: 'string', format: 'email' }
                }
            }
        };
        const validation = sensei.validateSchema(users, userSchema);
        console.log(`Schema valid: ${validation.valid}`);
        if (!validation.valid) {
            console.log('Errors:', validation.errors);
        }
        
        // Example 3: Chained Request Test
        console.log('\n📌 Example 3: Chained Request Test\n');
        const chainResult = await sensei.chain('User CRUD Flow')
            .get('/users/1')
            .expectStatus(200)
            .expectResponseTime(2000)
            .expectProperty('name')
            .store('userId', 'id')
            .get('/posts?userId={{userId}}')
            .expectStatus(200)
            .run();
        
        // Example 4: POST with body
        console.log('\n📌 Example 4: POST request\n');
        const newPost = await sensei.post('/posts', {
            title: 'Test Post from API Sensei',
            body: 'This is a test post created by QANTUM',
            userId: 1
        });
        console.log(`Created post with ID: ${newPost.data?.id}`);
        
        // Metrics
        console.log('\n📊 Final Metrics:');
        console.log(sensei.getMetrics());
        
        // Generate report
        sensei.generateReport('api-sensei-report.html');
        
    })();
}
