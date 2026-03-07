"use strict";
/**
 * 🤖 AUTONOMOUS EXPLORER - Self-Discovery Engine
 *
 * Automatically crawls websites, discovers business logic,
 * maps API dependencies, and prepares data for test generation.
 *
 * Features:
 * - Intelligent page crawling with parallel workers
 * - Form detection and field analysis
 * - Transaction flow discovery
 * - API endpoint mapping
 * - Business logic inference
 *
 * @version 1.0.0-QANTUM-PRIME
 * @phase 84-86
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
exports.AutonomousExplorer = void 0;
exports.createExplorer = createExplorer;
const playwright_1 = require("playwright");
const neural_map_engine_1 = require("./neural-map-engine");
const crypto = __importStar(require("crypto"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const events_1 = require("events");
const logger_1 = require("../api/unified/utils/logger");
// ============================================================
// AUTONOMOUS EXPLORER
// ============================================================
class AutonomousExplorer extends events_1.EventEmitter {
    config;
    neuralMap;
    browser = null;
    siteMap = null;
    visitedUrls = new Set();
    urlQueue = [];
    activeWorkers = 0;
    constructor(config = {}) {
        super();
        this.config = {
            maxPages: 100,
            maxDepth: 5,
            parallelWorkers: 4,
            timeout: 30000,
            respectRobotsTxt: true,
            captureNetworkTraffic: true,
            takeScreenshots: true,
            detectForms: true,
            detectAPIs: true,
            headless: true,
            outputDir: './exploration-data',
            ...config
        };
        this.neuralMap = new neural_map_engine_1.NeuralMapEngine();
    }
    /**
     * 🚀 Start autonomous exploration
     */
    // Complexity: O(1) — hash/map lookup
    async explore(baseUrl) {
        logger_1.logger.debug(`
╔═══════════════════════════════════════════════════════════════╗
║  🤖 AUTONOMOUS EXPLORER - Self-Discovery Mode                 ║
║                                                               ║
║  "QANTUM writes its own tests"                          ║
╚═══════════════════════════════════════════════════════════════╝
`);
        logger_1.logger.debug(`🤖 [EXPLORER] Target: ${baseUrl}`);
        logger_1.logger.debug(`🤖 [EXPLORER] Max Pages: ${this.config.maxPages}`);
        logger_1.logger.debug(`🤖 [EXPLORER] Workers: ${this.config.parallelWorkers}`);
        logger_1.logger.debug('');
        // Initialize
        this.siteMap = this.initializeSiteMap(baseUrl);
        this.visitedUrls.clear();
        this.urlQueue = [{ url: baseUrl, depth: 0 }];
        // Launch browser
        // SAFETY: async operation — wrap in try-catch for production resilience
        this.browser = await playwright_1.chromium.launch({
            headless: this.config.headless
        });
        const startTime = Date.now();
        this.emit('exploration:start', { baseUrl });
        // Start parallel crawling
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.runCrawlers();
        // Post-process discoveries
        this.detectTransactionFlows();
        this.identifyAuthentication();
        this.analyzeApiPatterns();
        // Save results
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.saveSiteMap();
        // Cleanup
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.browser.close();
        const duration = Date.now() - startTime;
        logger_1.logger.debug('');
        logger_1.logger.debug(`🤖 [EXPLORER] Exploration complete!`);
        logger_1.logger.debug(`   Duration: ${(duration / 1000).toFixed(1)}s`);
        logger_1.logger.debug(`   Pages discovered: ${this.siteMap.totalPages}`);
        logger_1.logger.debug(`   Forms found: ${this.siteMap.totalForms}`);
        logger_1.logger.debug(`   API endpoints: ${this.siteMap.totalApiEndpoints}`);
        logger_1.logger.debug(`   Transaction flows: ${this.siteMap.transactionFlows.length}`);
        this.emit('exploration:complete', this.siteMap);
        return this.siteMap;
    }
    /**
     * Run parallel crawlers
     */
    // Complexity: O(N) — linear iteration
    async runCrawlers() {
        const workers = [];
        for (let i = 0; i < this.config.parallelWorkers; i++) {
            workers.push(this.crawlerWorker(i));
        }
        // SAFETY: async operation — wrap in try-catch for production resilience
        await Promise.all(workers);
    }
    /**
     * Individual crawler worker
     */
    // Complexity: O(N) — loop-based
    async crawlerWorker(workerId) {
        if (!this.browser)
            return;
        // SAFETY: async operation — wrap in try-catch for production resilience
        const context = await this.browser.newContext({
            viewport: { width: 1920, height: 1080 },
            userAgent: 'QAntum-Explorer/26.0'
        });
        // SAFETY: async operation — wrap in try-catch for production resilience
        const page = await context.newPage();
        // Setup network interception
        if (this.config.captureNetworkTraffic) {
            this.setupNetworkCapture(page, workerId);
        }
        while (this.urlQueue.length > 0 || this.activeWorkers > 0) {
            const item = this.urlQueue.shift();
            if (!item) {
                // SAFETY: async operation — wrap in try-catch for production resilience
                await this.sleep(100);
                continue;
            }
            if (this.visitedUrls.has(item.url))
                continue;
            if (this.visitedUrls.size >= this.config.maxPages)
                break;
            if (item.depth > this.config.maxDepth)
                continue;
            this.visitedUrls.add(item.url);
            this.activeWorkers++;
            try {
                await this.crawlPage(page, item.url, item.depth, item.parent);
            }
            catch (error) {
                logger_1.logger.error(`🤖 [WORKER-${workerId}] Error crawling ${item.url}:`, error.message);
            }
            this.activeWorkers--;
        }
        // SAFETY: async operation — wrap in try-catch for production resilience
        await context.close();
    }
    /**
     * Crawl a single page
     */
    // Complexity: O(N*M) — nested iteration detected
    async crawlPage(page, url, depth, parentUrl) {
        logger_1.logger.debug(`🤖 [EXPLORER] Crawling: ${url} (depth: ${depth})`);
        try {
            // Navigate
            await page.goto(url, {
                waitUntil: 'networkidle',
                timeout: this.config.timeout
            });
            // Wait for dynamic content
            await this.sleep(500);
            // Analyze page
            const discoveredPage = await this.analyzePage(page, url, depth, parentUrl);
            // Store in sitemap
            this.siteMap.pages.set(url, discoveredPage);
            // Update counts
            this.siteMap.totalPages++;
            this.siteMap.totalForms += discoveredPage.forms.length;
            // Queue new links
            for (const link of discoveredPage.links) {
                if (!link.isExternal && !this.visitedUrls.has(link.url)) {
                    this.urlQueue.push({
                        url: link.url,
                        depth: depth + 1,
                        parent: url
                    });
                }
            }
            // Take screenshot
            if (this.config.takeScreenshots) {
                // SAFETY: async operation — wrap in try-catch for production resilience
                const screenshotPath = await this.takeScreenshot(page, url);
                discoveredPage.screenshot = screenshotPath;
            }
            this.emit('page:crawled', discoveredPage);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Analyze page content
     */
    // Complexity: O(N)
    async analyzePage(page, url, depth, parentUrl) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const title = await page.title();
        // Discover forms
        const forms = this.config.detectForms
            // SAFETY: async operation — wrap in try-catch for production resilience
            ? await this.discoverForms(page)
            : [];
        // Discover links
        // SAFETY: async operation — wrap in try-catch for production resilience
        const links = await this.discoverLinks(page, url);
        // Discover buttons
        // SAFETY: async operation — wrap in try-catch for production resilience
        const buttons = await this.discoverButtons(page);
        // Discover inputs
        // SAFETY: async operation — wrap in try-catch for production resilience
        const inputs = await this.discoverInputs(page);
        // Create cognitive anchors for important elements
        // SAFETY: async operation — wrap in try-catch for production resilience
        const anchors = await this.createAnchors(page, forms, buttons, inputs);
        // Classify page type
        const pageType = this.classifyPageType(forms, buttons, url);
        // Infer business function
        const businessFunction = this.inferBusinessFunction(forms, buttons, title, url);
        return {
            url,
            title,
            depth,
            parentUrl,
            discoveredAt: Date.now(),
            crawledAt: Date.now(),
            forms,
            links,
            buttons,
            inputs,
            anchors,
            apiCalls: [], // Filled by network capture
            pageType,
            businessFunction
        };
    }
    /**
     * Discover forms on page
     */
    // Complexity: O(N*M) — nested iteration detected
    async discoverForms(page) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        return await page.evaluate(() => {
            const forms = [];
            const formElements = document.querySelectorAll('form');
            for (const form of formElements) {
                const fields = [];
                const inputs = form.querySelectorAll('input, select, textarea');
                for (const input of inputs) {
                    const inp = input;
                    const label = document.querySelector(`label[for="${inp.id}"]`);
                    fields.push({
                        name: inp.name || inp.id || `field_${fields.length}`,
                        type: inp.type || 'text',
                        label: label?.textContent?.trim(),
                        placeholder: inp.placeholder,
                        required: inp.required,
                        validation: inp.pattern,
                        autocomplete: inp.autocomplete
                    });
                }
                // Find submit button
                const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
                // Determine form purpose
                const formText = form.textContent?.toLowerCase() || '';
                let purpose = 'other';
                if (formText.includes('login') || formText.includes('sign in'))
                    purpose = 'login';
                else if (formText.includes('register') || formText.includes('sign up'))
                    purpose = 'register';
                else if (formText.includes('search'))
                    purpose = 'search';
                else if (formText.includes('contact'))
                    purpose = 'contact';
                else if (formText.includes('checkout') || formText.includes('payment'))
                    purpose = 'checkout';
                forms.push({
                    id: form.id || `form_${forms.length}`,
                    name: form.getAttribute('name'),
                    action: form.action,
                    method: form.method?.toUpperCase() || 'GET',
                    fields,
                    submitButton: submitBtn?.textContent?.trim() || 'Submit',
                    purpose
                });
            }
            return forms;
        });
    }
    /**
     * Discover links on page
     */
    // Complexity: O(N) — linear iteration
    async discoverLinks(page, currentUrl) {
        const baseHost = new URL(currentUrl).host;
        // SAFETY: async operation — wrap in try-catch for production resilience
        return await page.evaluate((host) => {
            const links = [];
            const anchors = document.querySelectorAll('a[href]');
            for (const anchor of anchors) {
                const a = anchor;
                const href = a.href;
                if (!href || href.startsWith('javascript:') || href.startsWith('#'))
                    continue;
                try {
                    const linkUrl = new URL(href);
                    const isExternal = linkUrl.host !== host;
                    const isNavigation = a.closest('nav, header, [role="navigation"]') !== null;
                    links.push({
                        url: href,
                        text: a.textContent?.trim() || '',
                        isExternal,
                        isNavigation
                    });
                }
                catch { }
            }
            return links;
        }, baseHost);
    }
    /**
     * Discover buttons on page
     */
    // Complexity: O(N) — linear iteration
    async discoverButtons(page) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        return await page.evaluate(() => {
            const buttons = [];
            const btnElements = document.querySelectorAll('button, [role="button"], input[type="button"], input[type="submit"]');
            for (const btn of btnElements) {
                const text = btn.textContent?.trim() || btn.value || '';
                const type = btn.type || 'button';
                // Infer business action
                const lowerText = text.toLowerCase();
                let businessAction;
                if (lowerText.includes('submit') || lowerText.includes('save'))
                    businessAction = 'submit';
                else if (lowerText.includes('add to cart') || lowerText.includes('buy'))
                    businessAction = 'purchase';
                else if (lowerText.includes('login') || lowerText.includes('sign in'))
                    businessAction = 'login';
                else if (lowerText.includes('search'))
                    businessAction = 'search';
                else if (lowerText.includes('delete') || lowerText.includes('remove'))
                    businessAction = 'delete';
                else if (lowerText.includes('edit') || lowerText.includes('update'))
                    businessAction = 'update';
                buttons.push({
                    text,
                    type,
                    onClick: btn.getAttribute('onclick'),
                    businessAction
                });
            }
            return buttons;
        });
    }
    /**
     * Discover inputs on page
     */
    // Complexity: O(N*M) — nested iteration detected
    async discoverInputs(page) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        return await page.evaluate(() => {
            const inputs = [];
            const inputElements = document.querySelectorAll('input:not([type="hidden"]), textarea, select');
            for (const inp of inputElements) {
                const input = inp;
                const label = document.querySelector(`label[for="${input.id}"]`);
                inputs.push({
                    name: input.name || input.id || `input_${inputs.length}`,
                    type: input.type || 'text',
                    label: label?.textContent?.trim()
                });
            }
            return inputs;
        });
    }
    /**
     * Create cognitive anchors for important elements
     */
    // Complexity: O(N*M) — nested iteration detected
    async createAnchors(page, forms, buttons, inputs) {
        const anchorIds = [];
        // Create anchors for form submit buttons
        for (const form of forms) {
            try {
                const submitSelector = `form#${form.id} button[type="submit"], form#${form.id} input[type="submit"]`;
                const submitElement = await page.$(submitSelector);
                if (submitElement) {
                    const anchor = await this.neuralMap.createAnchor(page, submitElement, `${form.purpose}_submit`, form.purpose);
                    anchorIds.push(anchor.id);
                }
            }
            catch { }
        }
        // Create anchors for action buttons
        for (const button of buttons.filter(b => b.businessAction)) {
            try {
                const btnSelector = `button:has-text("${button.text}"), [role="button"]:has-text("${button.text}")`;
                const btnElement = await page.$(btnSelector);
                if (btnElement) {
                    const anchor = await this.neuralMap.createAnchor(page, btnElement, button.businessAction, button.businessAction);
                    anchorIds.push(anchor.id);
                }
            }
            catch { }
        }
        return anchorIds;
    }
    /**
     * Setup network traffic capture
     */
    // Complexity: O(N)
    setupNetworkCapture(page, workerId) {
        const apiCalls = [];
        const requestTimings = new Map();
        page.on('request', (request) => {
            const url = request.url();
            if (this.isApiRequest(url)) {
                requestTimings.set(url, Date.now());
            }
        });
        page.on('response', async (response) => {
            const url = response.url();
            if (!this.isApiRequest(url))
                return;
            const startTime = requestTimings.get(url) || Date.now();
            const request = response.request();
            try {
                const apiCall = {
                    id: `api_${crypto.randomBytes(4).toString('hex')}`,
                    method: request.method(),
                    url,
                    requestHeaders: request.headers(),
                    responseStatus: response.status(),
                    timestamp: startTime,
                    duration: Date.now() - startTime
                };
                // Try to get bodies
                try {
                    const postData = request.postData();
                    if (postData) {
                        apiCall.requestBody = JSON.parse(postData);
                    }
                }
                catch { }
                try {
                    if (response.headers()['content-type']?.includes('json')) {
                        apiCall.responseBody = await response.json();
                    }
                }
                catch { }
                apiCalls.push(apiCall);
                this.recordApiEndpoint(apiCall);
            }
            catch { }
        });
        // Store reference for the current page
        page.__apiCalls = apiCalls;
    }
    /**
     * Record API endpoint for pattern analysis
     */
    // Complexity: O(N)
    recordApiEndpoint(apiCall) {
        if (!this.siteMap)
            return;
        // Normalize URL (remove query params for grouping)
        const urlObj = new URL(apiCall.url);
        const normalizedUrl = `${urlObj.origin}${urlObj.pathname}`;
        const key = `${apiCall.method}:${normalizedUrl}`;
        let endpoint = this.siteMap.apiEndpoints.get(key);
        if (!endpoint) {
            endpoint = {
                url: normalizedUrl,
                method: apiCall.method,
                usageCount: 0,
                avgResponseTime: 0,
                authentication: 'none'
            };
            this.siteMap.apiEndpoints.set(key, endpoint);
            this.siteMap.totalApiEndpoints++;
        }
        // Update stats
        endpoint.usageCount++;
        endpoint.avgResponseTime =
            (endpoint.avgResponseTime * (endpoint.usageCount - 1) + apiCall.duration) /
                endpoint.usageCount;
        // Detect authentication type
        if (apiCall.requestHeaders['authorization']?.startsWith('Bearer')) {
            endpoint.authentication = 'bearer';
        }
        else if (apiCall.requestHeaders['x-api-key']) {
            endpoint.authentication = 'api-key';
        }
        else if (apiCall.requestHeaders['cookie']) {
            endpoint.authentication = 'cookie';
        }
    }
    /**
     * Detect transaction flows from discovered data
     */
    // Complexity: O(N) — linear iteration
    detectTransactionFlows() {
        if (!this.siteMap)
            return;
        const flows = [];
        // Detect login flow
        const loginForm = Array.from(this.siteMap.pages.values())
            .flatMap(p => p.forms)
            .find(f => f.purpose === 'login');
        if (loginForm) {
            flows.push({
                id: 'flow_login',
                name: 'User Login',
                startPage: loginForm.action,
                endPage: '/', // Would need actual detection
                steps: [
                    { pageUrl: loginForm.action, action: 'fill', target: 'username', value: '{{username}}', apiCalls: [] },
                    { pageUrl: loginForm.action, action: 'fill', target: 'password', value: '{{password}}', apiCalls: [] },
                    { pageUrl: loginForm.action, action: 'submit', apiCalls: [] }
                ],
                apiSequence: [],
                businessPurpose: 'authentication'
            });
        }
        // Detect checkout flow
        const checkoutPages = Array.from(this.siteMap.pages.values())
            .filter(p => p.businessFunction === 'checkout' || p.pageType === 'checkout');
        if (checkoutPages.length > 0) {
            flows.push({
                id: 'flow_checkout',
                name: 'Checkout Process',
                startPage: checkoutPages[0].url,
                endPage: checkoutPages[checkoutPages.length - 1].url,
                steps: checkoutPages.map(p => ({
                    pageUrl: p.url,
                    action: 'navigate',
                    apiCalls: p.apiCalls.map(a => a.id)
                })),
                apiSequence: checkoutPages.flatMap(p => p.apiCalls.map(a => a.id)),
                businessPurpose: 'purchase'
            });
        }
        this.siteMap.transactionFlows = flows;
    }
    /**
     * Identify authentication mechanism
     */
    // Complexity: O(N) — linear iteration
    identifyAuthentication() {
        if (!this.siteMap)
            return;
        for (const page of this.siteMap.pages.values()) {
            const loginForm = page.forms.find(f => f.purpose === 'login');
            if (loginForm) {
                const usernameField = loginForm.fields.find(f => f.type === 'email' || f.name.includes('email') ||
                    f.name.includes('user') || f.autocomplete?.includes('username'));
                const passwordField = loginForm.fields.find(f => f.type === 'password' || f.autocomplete?.includes('password'));
                if (usernameField && passwordField) {
                    this.siteMap.authentication = {
                        loginUrl: page.url,
                        loginForm: loginForm.id,
                        usernameField: usernameField.name,
                        passwordField: passwordField.name,
                        submitButton: loginForm.submitButton || 'submit',
                        successIndicator: 'dashboard|home|profile'
                    };
                    break;
                }
            }
        }
    }
    /**
     * Analyze API patterns
     */
    // Complexity: O(N) — linear iteration
    analyzeApiPatterns() {
        if (!this.siteMap)
            return;
        // Detect RESTful patterns
        for (const [key, endpoint] of this.siteMap.apiEndpoints) {
            // Detect CRUD operations
            const urlParts = endpoint.url.split('/').filter(Boolean);
            const lastPart = urlParts[urlParts.length - 1];
            if (/^\d+$/.test(lastPart) || /^[a-f0-9-]{36}$/.test(lastPart)) {
                // ID-based endpoint - likely detail/update/delete
                const resourceUrl = urlParts.slice(0, -1).join('/');
                logger_1.logger.debug(`🤖 [EXPLORER] Detected resource: ${resourceUrl}`);
            }
        }
    }
    // ============================================================
    // HELPER METHODS
    // ============================================================
    // Complexity: O(1)
    initializeSiteMap(baseUrl) {
        return {
            baseUrl,
            exploredAt: Date.now(),
            totalPages: 0,
            totalForms: 0,
            totalApiEndpoints: 0,
            pages: new Map(),
            forms: new Map(),
            apiEndpoints: new Map(),
            transactionFlows: [],
            authentication: null,
            userFlows: [],
            criticalPaths: []
        };
    }
    // Complexity: O(1)
    isApiRequest(url) {
        return url.includes('/api/') ||
            url.includes('/v1/') ||
            url.includes('/v2/') ||
            url.includes('.json') ||
            url.includes('/graphql');
    }
    // Complexity: O(1)
    classifyPageType(forms, buttons, url) {
        const urlLower = url.toLowerCase();
        if (forms.some(f => f.purpose === 'login'))
            return 'auth';
        if (forms.some(f => f.purpose === 'checkout'))
            return 'checkout';
        if (forms.length > 0)
            return 'form';
        if (urlLower.includes('dashboard') || urlLower.includes('admin'))
            return 'dashboard';
        if (urlLower.includes('list') || urlLower.includes('search'))
            return 'list';
        if (urlLower.match(/\/\d+$/) || urlLower.includes('/detail'))
            return 'detail';
        if (urlLower === '/' || urlLower.endsWith('/home'))
            return 'landing';
        return 'other';
    }
    // Complexity: O(1)
    inferBusinessFunction(forms, buttons, title, url) {
        const text = (title + ' ' + url).toLowerCase();
        if (forms.some(f => f.purpose === 'login') || text.includes('login'))
            return 'login';
        if (forms.some(f => f.purpose === 'register') || text.includes('register'))
            return 'register';
        if (text.includes('checkout') || text.includes('cart'))
            return 'checkout';
        if (text.includes('search'))
            return 'search';
        if (text.includes('profile') || text.includes('account'))
            return 'profile';
        if (text.includes('dashboard'))
            return 'dashboard';
        return undefined;
    }
    // Complexity: O(1)
    async takeScreenshot(page, url) {
        const hash = crypto.createHash('md5').update(url).digest('hex').slice(0, 8);
        const filename = `screenshot_${hash}.png`;
        const filepath = path.join(this.config.outputDir, 'screenshots', filename);
        const dir = path.dirname(filepath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        // SAFETY: async operation — wrap in try-catch for production resilience
        await page.screenshot({ path: filepath, fullPage: false });
        return filepath;
    }
    // Complexity: O(N)
    async saveSiteMap() {
        if (!this.siteMap)
            return;
        const dir = this.config.outputDir;
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        // Convert Maps to objects for JSON serialization
        const serializable = {
            ...this.siteMap,
            pages: Object.fromEntries(this.siteMap.pages),
            forms: Object.fromEntries(this.siteMap.forms),
            apiEndpoints: Object.fromEntries(this.siteMap.apiEndpoints)
        };
        const filepath = path.join(dir, 'sitemap.json');
        fs.writeFileSync(filepath, JSON.stringify(serializable, null, 2));
        logger_1.logger.debug(`🤖 [EXPLORER] Sitemap saved: ${filepath}`);
    }
    // Complexity: O(1)
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
exports.AutonomousExplorer = AutonomousExplorer;
// ============================================================
// EXPORTS
// ============================================================
function createExplorer(config) {
    return new AutonomousExplorer(config);
}
