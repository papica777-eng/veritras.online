"use strict";
/**
 * 🔮 THE ORACLE - Site Mapper Module
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 *   ████████╗██╗  ██╗███████╗     ██████╗ ██████╗  █████╗  ██████╗██╗     ███████╗
 *   ╚══██╔══╝██║  ██║██╔════╝    ██╔═══██╗██╔══██╗██╔══██╗██╔════╝██║     ██╔════╝
 *      ██║   ███████║█████╗      ██║   ██║██████╔╝███████║██║     ██║     █████╗
 *      ██║   ██╔══██║██╔══╝      ██║   ██║██╔══██╗██╔══██║██║     ██║     ██╔══╝
 *      ██║   ██║  ██║███████╗    ╚██████╔╝██║  ██║██║  ██║╚██████╗███████╗███████╗
 *      ╚═╝   ╚═╝  ╚═╝╚══════╝     ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝╚══════╝╚══════╝
 *
 * AI-powered autonomous site mapping - discovers forms, buttons, APIs, hidden endpoints.
 *
 * "Потребителят дава само URL. QAntum Prime прави всичко останало."
 *
 * @version 1.0.0
 * @author QAntum AI Architect
 * @phase THE ORACLE - Autonomous Discovery
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
exports.SiteMapper = void 0;
exports.createSiteMapper = createSiteMapper;
const crypto = __importStar(require("crypto"));
const events_1 = require("events");
// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════
const DEFAULT_CONFIG = {
    maxDepth: 5,
    maxPages: 100,
    timeout: 30000,
    concurrency: 5,
    respectRobotsTxt: true,
    followExternalLinks: false,
    captureScreenshots: true,
    discoverAPIs: true,
    discoverForms: true,
    userAgent: 'QAntum-Oracle/1.0 (Autonomous Discovery)',
    viewport: { width: 1920, height: 1080 }
};
// AI-powered purpose detection patterns
const FORM_PURPOSE_PATTERNS = [
    { pattern: /login|signin|sign-in/i, purpose: 'Authentication - Login' },
    { pattern: /register|signup|sign-up|create.*account/i, purpose: 'Registration' },
    { pattern: /search/i, purpose: 'Search' },
    { pattern: /contact|feedback|support/i, purpose: 'Contact/Support' },
    { pattern: /checkout|payment|pay/i, purpose: 'Payment/Checkout' },
    { pattern: /subscribe|newsletter/i, purpose: 'Newsletter Subscription' },
    { pattern: /comment|review|rating/i, purpose: 'User Feedback' },
    { pattern: /upload|import/i, purpose: 'File Upload' },
    { pattern: /profile|settings|preferences/i, purpose: 'User Settings' },
    { pattern: /filter|sort/i, purpose: 'Data Filtering' },
];
const BUTTON_PURPOSE_PATTERNS = [
    { pattern: /submit|send|save/i, purpose: 'Form Submission' },
    { pattern: /cancel|close|back/i, purpose: 'Navigation/Cancel' },
    { pattern: /delete|remove|trash/i, purpose: 'Deletion' },
    { pattern: /add|create|new/i, purpose: 'Creation' },
    { pattern: /edit|modify|update/i, purpose: 'Modification' },
    { pattern: /download|export/i, purpose: 'Data Export' },
    { pattern: /upload|import/i, purpose: 'Data Import' },
    { pattern: /cart|buy|purchase/i, purpose: 'E-commerce' },
    { pattern: /share|social/i, purpose: 'Social Sharing' },
    { pattern: /login|signin/i, purpose: 'Authentication' },
];
// ═══════════════════════════════════════════════════════════════════════════════
// SITE MAPPER CLASS
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * 🔮 SiteMapper - AI-powered autonomous site mapping
 *
 * Discovers:
 * - All navigable pages
 * - Forms and their fields
 * - Buttons and actions
 * - API endpoints (from network traffic)
 * - Security headers and cookies
 * - Performance metrics
 */
class SiteMapper extends events_1.EventEmitter {
    config;
    browser = null;
    context = null;
    siteMap = null;
    visitedUrls = new Set();
    pendingUrls = [];
    activeWorkers = 0;
    discoveredApis = new Map();
    aborted = false;
    constructor(config = {}) {
        super();
        this.config = { ...DEFAULT_CONFIG, ...config };
    }
    /**
     * 🚀 Start mapping a site from the root URL
     */
    // Complexity: O(1)
    async mapSite(rootUrl, browser) {
        this.browser = browser;
        this.aborted = false;
        console.log(`
╔═══════════════════════════════════════════════════════════════════════════════════════╗
║                                                                                       ║
║   ████████╗██╗  ██╗███████╗     ██████╗ ██████╗  █████╗  ██████╗██╗     ███████╗      ║
║   ╚══██╔══╝██║  ██║██╔════╝    ██╔═══██╗██╔══██╗██╔══██╗██╔════╝██║     ██╔════╝      ║
║      ██║   ███████║█████╗      ██║   ██║██████╔╝███████║██║     ██║     █████╗        ║
║      ██║   ██╔══██║██╔══╝      ██║   ██║██╔══██╗██╔══██║██║     ██║     ██╔══╝        ║
║      ██║   ██║  ██║███████╗    ╚██████╔╝██║  ██║██║  ██║╚██████╗███████╗███████╗      ║
║      ╚═╝   ╚═╝  ╚═╝╚══════╝     ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝╚══════╝╚══════╝      ║
║                                                                                       ║
║                          SITE MAPPER - Autonomous Discovery                           ║
║                                                                                       ║
╠═══════════════════════════════════════════════════════════════════════════════════════╣
║  Target: ${rootUrl.padEnd(70)}║
║  Max Depth: ${this.config.maxDepth.toString().padEnd(66)}║
║  Max Pages: ${this.config.maxPages.toString().padEnd(66)}║
║  Concurrency: ${this.config.concurrency.toString().padEnd(64)}║
╚═══════════════════════════════════════════════════════════════════════════════════════╝
`);
        // Initialize site map
        this.siteMap = {
            id: crypto.randomUUID(),
            rootUrl,
            startedAt: Date.now(),
            totalPages: 0,
            totalForms: 0,
            totalApiEndpoints: 0,
            totalButtons: 0,
            totalLinks: 0,
            pages: new Map(),
            apiEndpoints: [],
            graph: { nodes: new Map(), edges: [] },
            stats: {
                pagesDiscovered: 0,
                pagesCrawled: 0,
                formsFound: 0,
                apisFound: 0,
                errorsEncountered: 0,
                avgLoadTime: 0,
                totalDuration: 0
            }
        };
        // Create browser context with API interception
        // SAFETY: async operation — wrap in try-catch for production resilience
        this.context = await browser.newContext({
            userAgent: this.config.userAgent,
            viewport: this.config.viewport,
            ignoreHTTPSErrors: true
        });
        // Setup API discovery listener
        if (this.config.discoverAPIs) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.setupApiDiscovery();
        }
        // Add root URL to queue
        this.pendingUrls.push({ url: rootUrl, depth: 0, parentId: null });
        // Start crawling
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.crawl();
        // Finalize
        this.siteMap.completedAt = Date.now();
        this.siteMap.apiEndpoints = Array.from(this.discoveredApis.values());
        this.siteMap.totalApiEndpoints = this.siteMap.apiEndpoints.length;
        this.siteMap.stats.totalDuration = this.siteMap.completedAt - this.siteMap.startedAt;
        // Print summary
        this.printSummary();
        // Cleanup
        if (this.context) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.context.close();
        }
        this.emit('mapping:complete', this.siteMap);
        return this.siteMap;
    }
    /**
     * Setup API discovery through network interception
     */
    // Complexity: O(N)
    async setupApiDiscovery() {
        if (!this.context)
            return;
        this.context.on('request', request => {
            const url = request.url();
            const method = request.method();
            // Skip static resources
            if (this.isStaticResource(url))
                return;
            // Track API calls
            if (this.isApiCall(url, method)) {
                const api = {
                    id: crypto.randomUUID(),
                    url,
                    method,
                    discoveredFrom: 'network_intercept',
                    requestHeaders: request.headers(),
                    isAuthenticated: this.hasAuthHeader(request.headers())
                };
                this.discoveredApis.set(`${method}:${url}`, api);
                this.emit('api:discovered', api);
            }
        });
        this.context.on('response', async (response) => {
            const url = response.url();
            const method = response.request().method();
            const key = `${method}:${url}`;
            if (this.discoveredApis.has(key)) {
                const api = this.discoveredApis.get(key);
                api.responseStatus = response.status();
                api.responseType = response.headers()['content-type'];
                // Check for rate limit headers
                const rateLimitHeader = response.headers()['x-ratelimit-limit'] ||
                    response.headers()['x-rate-limit-limit'];
                if (rateLimitHeader) {
                    api.rateLimit = rateLimitHeader;
                }
            }
        });
    }
    /**
     * Main crawling loop
     */
    // Complexity: O(N*M) — nested iteration
    async crawl() {
        while ((this.pendingUrls.length > 0 || this.activeWorkers > 0) && !this.aborted) {
            // Check if we've hit limits
            if (this.siteMap.totalPages >= this.config.maxPages) {
                console.log(`[Oracle] ⚠️ Max pages limit (${this.config.maxPages}) reached`);
                break;
            }
            // Process URLs up to concurrency limit
            while (this.pendingUrls.length > 0 &&
                this.activeWorkers < this.config.concurrency &&
                this.siteMap.totalPages < this.config.maxPages) {
                const item = this.pendingUrls.shift();
                if (item && !this.visitedUrls.has(item.url)) {
                    this.visitedUrls.add(item.url);
                    this.activeWorkers++;
                    // Don't await - let it run concurrently
                    this.crawlPage(item.url, item.depth, item.parentId)
                        .catch(err => {
                        console.error(`[Oracle] Error crawling ${item.url}:`, err.message);
                        this.siteMap.stats.errorsEncountered++;
                    })
                        .finally(() => {
                        this.activeWorkers--;
                    });
                }
            }
            // Small delay to prevent overwhelming
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.sleep(100);
        }
    }
    /**
     * Crawl a single page
     */
    // Complexity: O(1)
    async crawlPage(url, depth, parentId) {
        if (depth > this.config.maxDepth)
            return;
        // SAFETY: async operation — wrap in try-catch for production resilience
        const page = await this.context.newPage();
        const pageId = crypto.randomUUID();
        try {
            console.log(`[Oracle] 🔍 Crawling (depth ${depth}): ${url}`);
            const startTime = Date.now();
            // Navigate with timeout
            const response = await page.goto(url, {
                waitUntil: 'networkidle',
                timeout: this.config.timeout
            });
            const loadTime = Date.now() - startTime;
            // Get page info
            const title = await page.title();
            const statusCode = response?.status() ?? 0;
            const contentType = response?.headers()['content-type'] ?? '';
            // Create discovered page object
            const discoveredPage = {
                id: pageId,
                url,
                title,
                depth,
                parentId,
                discoveredAt: Date.now(),
                loadTime,
                statusCode,
                contentType,
                forms: [],
                buttons: [],
                links: [],
                inputs: [],
                apiEndpoints: [],
                securityHeaders: this.extractSecurityHeaders(response?.headers() ?? {}),
                // SAFETY: async operation — wrap in try-catch for production resilience
                cookies: await this.extractCookies(page),
                a11yIssues: [],
                // SAFETY: async operation — wrap in try-catch for production resilience
                performanceMetrics: await this.getPerformanceMetrics(page)
            };
            // Discover forms
            if (this.config.discoverForms) {
                // SAFETY: async operation — wrap in try-catch for production resilience
                discoveredPage.forms = await this.discoverForms(page);
                this.siteMap.totalForms += discoveredPage.forms.length;
                this.siteMap.stats.formsFound += discoveredPage.forms.length;
            }
            // Discover buttons
            // SAFETY: async operation — wrap in try-catch for production resilience
            discoveredPage.buttons = await this.discoverButtons(page);
            this.siteMap.totalButtons += discoveredPage.buttons.length;
            // Discover links (and add to queue)
            // SAFETY: async operation — wrap in try-catch for production resilience
            discoveredPage.links = await this.discoverLinks(page, url);
            this.siteMap.totalLinks += discoveredPage.links.length;
            // Discover inputs
            // SAFETY: async operation — wrap in try-catch for production resilience
            discoveredPage.inputs = await this.discoverInputs(page);
            // Capture screenshot
            if (this.config.captureScreenshots) {
                // SAFETY: async operation — wrap in try-catch for production resilience
                const screenshotBuffer = await page.screenshot({
                    type: 'png',
                    fullPage: false
                }).catch(() => undefined);
                discoveredPage.screenshot = screenshotBuffer ? screenshotBuffer.toString('base64') : undefined;
            }
            // Add internal links to queue
            for (const link of discoveredPage.links) {
                if (link.isInternal && !this.visitedUrls.has(link.href)) {
                    this.pendingUrls.push({
                        url: link.href,
                        depth: depth + 1,
                        parentId: pageId
                    });
                    // Add edge to graph
                    this.siteMap.graph.edges.push({
                        from: pageId,
                        to: link.href,
                        type: 'link',
                        label: link.text
                    });
                }
            }
            // Add to site map
            this.siteMap.pages.set(pageId, discoveredPage);
            this.siteMap.totalPages++;
            this.siteMap.stats.pagesCrawled++;
            // Add node to graph
            this.siteMap.graph.nodes.set(pageId, {
                id: pageId,
                url,
                depth,
                isEntry: depth === 0,
                isExit: discoveredPage.links.filter(l => l.isInternal).length === 0
            });
            // Update avg load time
            const totalLoadTime = Array.from(this.siteMap.pages.values())
                .reduce((sum, p) => sum + p.loadTime, 0);
            this.siteMap.stats.avgLoadTime = totalLoadTime / this.siteMap.pages.size;
            this.emit('page:crawled', discoveredPage);
        }
        catch (error) {
            this.siteMap.stats.errorsEncountered++;
            this.emit('page:error', { url, error });
        }
        finally {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await page.close();
        }
    }
    /**
     * Discover all forms on a page
     */
    // Complexity: O(N*M) — nested iteration
    async discoverForms(page) {
        const forms = [];
        // SAFETY: async operation — wrap in try-catch for production resilience
        const formElements = await page.locator('form').all();
        for (const form of formElements) {
            try {
                const action = await form.getAttribute('action') || '';
                const method = (await form.getAttribute('method') || 'GET').toUpperCase();
                const name = await form.getAttribute('name') || await form.getAttribute('id') || '';
                // Get all fields
                const fields = await this.discoverFormFields(form);
                // Check for special elements
                const hasFileUpload = fields.some(f => f.type === 'file');
                const hasCaptcha = await form.locator('[class*="captcha"], [id*="captcha"], [class*="recaptcha"]').count() > 0;
                const hasValidation = fields.some(f => f.required || f.validation);
                // Generate selector
                const selector = await this.generateSelector(form);
                // Detect purpose using AI patterns
                const formText = `${name} ${action} ${fields.map(f => f.name).join(' ')}`;
                const purpose = this.detectFormPurpose(formText);
                forms.push({
                    id: crypto.randomUUID(),
                    action,
                    method,
                    name,
                    fields,
                    hasValidation,
                    hasFileUpload,
                    hasCaptcha,
                    selector,
                    purpose
                });
            }
            catch (e) {
                // Skip problematic forms
            }
        }
        return forms;
    }
    /**
     * Discover form fields
     */
    // Complexity: O(N*M) — nested iteration
    async discoverFormFields(form) {
        const fields = [];
        // SAFETY: async operation — wrap in try-catch for production resilience
        const inputs = await form.locator('input, select, textarea').all();
        for (const input of inputs) {
            try {
                const type = await input.getAttribute('type') || 'text';
                // Skip hidden and submit types
                if (['hidden', 'submit', 'button', 'image'].includes(type))
                    continue;
                const name = await input.getAttribute('name') || '';
                const required = await input.getAttribute('required') !== null;
                const placeholder = await input.getAttribute('placeholder') || '';
                const pattern = await input.getAttribute('pattern');
                const selector = await this.generateSelector(input);
                // Get options for select elements
                let options;
                const tagName = await input.evaluate(el => el.tagName.toLowerCase());
                if (tagName === 'select') {
                    // SAFETY: async operation — wrap in try-catch for production resilience
                    options = await input.locator('option').allTextContents();
                }
                fields.push({
                    name,
                    type,
                    required,
                    placeholder,
                    validation: pattern,
                    options,
                    selector
                });
            }
            catch (e) {
                // Skip problematic inputs
            }
        }
        return fields;
    }
    /**
     * Discover all buttons on a page
     */
    // Complexity: O(N) — loop
    async discoverButtons(page) {
        const buttons = [];
        // SAFETY: async operation — wrap in try-catch for production resilience
        const buttonElements = await page.locator('button, [role="button"], input[type="submit"], input[type="button"], a.btn, a.button').all();
        for (const button of buttonElements) {
            try {
                const text = await button.textContent() || await button.getAttribute('value') || '';
                const type = await button.getAttribute('type') || 'button';
                const onClick = await button.getAttribute('onclick');
                const isDisabled = await button.isDisabled();
                const isVisible = await button.isVisible();
                const selector = await this.generateSelector(button);
                // Detect purpose
                const purpose = this.detectButtonPurpose(text);
                buttons.push({
                    id: crypto.randomUUID(),
                    text: text.trim(),
                    type,
                    onClick,
                    selector,
                    purpose,
                    isDisabled,
                    isVisible
                });
            }
            catch (e) {
                // Skip problematic buttons
            }
        }
        return buttons;
    }
    /**
     * Discover all links on a page
     */
    // Complexity: O(N) — loop
    async discoverLinks(page, currentUrl) {
        const links = [];
        const currentDomain = new URL(currentUrl).hostname;
        // SAFETY: async operation — wrap in try-catch for production resilience
        const linkElements = await page.locator('a[href]').all();
        for (const link of linkElements) {
            try {
                const href = await link.getAttribute('href') || '';
                const text = await link.textContent() || '';
                const target = await link.getAttribute('target');
                // Skip empty/invalid hrefs
                if (!href || href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:'))
                    continue;
                // Resolve relative URLs
                const absoluteUrl = new URL(href, currentUrl).href;
                const linkDomain = new URL(absoluteUrl).hostname;
                const isInternal = linkDomain === currentDomain;
                const isExternal = !isInternal;
                const opensNewTab = target === '_blank';
                // Check filters
                if (!this.config.followExternalLinks && isExternal)
                    continue;
                if (this.config.excludePatterns?.some(p => p.test(absoluteUrl)))
                    continue;
                if (this.config.includePatterns && !this.config.includePatterns.some(p => p.test(absoluteUrl)))
                    continue;
                // SAFETY: async operation — wrap in try-catch for production resilience
                const selector = await this.generateSelector(link);
                links.push({
                    id: crypto.randomUUID(),
                    text: text.trim(),
                    href: absoluteUrl,
                    isInternal,
                    isExternal,
                    opensNewTab,
                    selector
                });
            }
            catch (e) {
                // Skip problematic links
            }
        }
        return links;
    }
    /**
     * Discover all inputs on a page (not in forms)
     */
    // Complexity: O(N) — loop
    async discoverInputs(page) {
        const inputs = [];
        // Get inputs not inside forms
        // SAFETY: async operation — wrap in try-catch for production resilience
        const inputElements = await page.locator('input:not(form input), textarea:not(form textarea)').all();
        for (const input of inputElements) {
            try {
                const type = await input.getAttribute('type') || 'text';
                if (['hidden', 'submit', 'button'].includes(type))
                    continue;
                const name = await input.getAttribute('name') || '';
                const placeholder = await input.getAttribute('placeholder') || '';
                const required = await input.getAttribute('required') !== null;
                const pattern = await input.getAttribute('pattern');
                const selector = await this.generateSelector(input);
                inputs.push({
                    id: crypto.randomUUID(),
                    name,
                    type,
                    placeholder,
                    required,
                    selector,
                    validation: pattern
                });
            }
            catch (e) {
                // Skip
            }
        }
        return inputs;
    }
    /**
     * Extract security headers
     */
    // Complexity: O(N) — loop
    extractSecurityHeaders(headers) {
        const securityHeaders = {};
        const headerNames = [
            'strict-transport-security',
            'content-security-policy',
            'x-content-type-options',
            'x-frame-options',
            'x-xss-protection',
            'referrer-policy',
            'permissions-policy'
        ];
        for (const name of headerNames) {
            if (headers[name]) {
                securityHeaders[name] = headers[name];
            }
        }
        return securityHeaders;
    }
    /**
     * Extract cookies
     */
    // Complexity: O(N) — linear scan
    async extractCookies(page) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const cookies = await page.context().cookies();
        return cookies.map(c => ({
            name: c.name,
            value: c.value.substring(0, 50) + (c.value.length > 50 ? '...' : ''),
            domain: c.domain,
            path: c.path,
            secure: c.secure,
            httpOnly: c.httpOnly,
            sameSite: c.sameSite,
            expires: c.expires
        }));
    }
    /**
     * Get performance metrics
     */
    // Complexity: O(N) — linear scan
    async getPerformanceMetrics(page) {
        try {
            const metrics = await page.evaluate(() => {
                const perf = performance;
                const navigation = perf.getEntriesByType('navigation')[0];
                const paint = perf.getEntriesByType('paint');
                return {
                    loadTime: navigation?.loadEventEnd - navigation?.startTime || 0,
                    domContentLoaded: navigation?.domContentLoadedEventEnd - navigation?.startTime || 0,
                    firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
                    firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
                    largestContentfulPaint: 0,
                    timeToInteractive: 0,
                    totalBlockingTime: 0,
                    cumulativeLayoutShift: 0
                };
            });
            return metrics;
        }
        catch {
            return {
                loadTime: 0,
                domContentLoaded: 0,
                firstPaint: 0,
                firstContentfulPaint: 0,
                largestContentfulPaint: 0,
                timeToInteractive: 0,
                totalBlockingTime: 0,
                cumulativeLayoutShift: 0
            };
        }
    }
    /**
     * Generate robust selector for element
     */
    // Complexity: O(N) — linear scan
    async generateSelector(element) {
        try {
            // Try data-testid first
            const testId = await element.getAttribute('data-testid');
            if (testId)
                return `[data-testid="${testId}"]`;
            // Try id
            const id = await element.getAttribute('id');
            if (id)
                return `#${id}`;
            // Try unique class combination
            const className = await element.getAttribute('class');
            if (className) {
                const classes = className.split(' ').filter(c => c.length > 0).slice(0, 2);
                if (classes.length > 0) {
                    return `.${classes.join('.')}`;
                }
            }
            // Try name
            // SAFETY: async operation — wrap in try-catch for production resilience
            const name = await element.getAttribute('name');
            if (name)
                return `[name="${name}"]`;
            // Fallback to tag + text
            // SAFETY: async operation — wrap in try-catch for production resilience
            const tagName = await element.evaluate(el => el.tagName.toLowerCase());
            // SAFETY: async operation — wrap in try-catch for production resilience
            const text = await element.textContent();
            if (text && text.length < 30) {
                return `${tagName}:has-text("${text.trim()}")`;
            }
            return tagName;
        }
        catch {
            return 'unknown';
        }
    }
    /**
     * Detect form purpose using AI patterns
     */
    // Complexity: O(N) — loop
    detectFormPurpose(text) {
        for (const { pattern, purpose } of FORM_PURPOSE_PATTERNS) {
            if (pattern.test(text)) {
                return purpose;
            }
        }
        return 'General Form';
    }
    /**
     * Detect button purpose using AI patterns
     */
    // Complexity: O(N) — loop
    detectButtonPurpose(text) {
        for (const { pattern, purpose } of BUTTON_PURPOSE_PATTERNS) {
            if (pattern.test(text)) {
                return purpose;
            }
        }
        return 'Action Button';
    }
    /**
     * Check if URL is a static resource
     */
    // Complexity: O(1)
    isStaticResource(url) {
        const staticPatterns = /\.(css|js|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot|ico|webp|mp4|webm)(\?|$)/i;
        return staticPatterns.test(url);
    }
    /**
     * Check if URL is an API call
     */
    // Complexity: O(N)
    isApiCall(url, method) {
        // POST/PUT/DELETE are usually API calls
        if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method))
            return true;
        // Check for API patterns
        const apiPatterns = /\/api\/|\/v\d+\/|\/graphql|\.json(\?|$)/i;
        return apiPatterns.test(url);
    }
    /**
     * Check if request has authentication header
     */
    // Complexity: O(1)
    hasAuthHeader(headers) {
        return !!(headers['authorization'] || headers['x-api-key'] || headers['x-auth-token']);
    }
    /**
     * Print summary after mapping
     */
    // Complexity: O(1)
    printSummary() {
        const sm = this.siteMap;
        console.log(`
╔═══════════════════════════════════════════════════════════════════════════════════════╗
║                          THE ORACLE - MAPPING COMPLETE                                ║
╠═══════════════════════════════════════════════════════════════════════════════════════╣
║  📊 DISCOVERY STATISTICS                                                              ║
║  ─────────────────────────────────────────────────────────────────────────────────    ║
║  Pages Crawled:    ${sm.totalPages.toString().padEnd(60)}║
║  Forms Found:      ${sm.totalForms.toString().padEnd(60)}║
║  API Endpoints:    ${sm.totalApiEndpoints.toString().padEnd(60)}║
║  Buttons:          ${sm.totalButtons.toString().padEnd(60)}║
║  Links:            ${sm.totalLinks.toString().padEnd(60)}║
║  Errors:           ${sm.stats.errorsEncountered.toString().padEnd(60)}║
║  ─────────────────────────────────────────────────────────────────────────────────    ║
║  Total Duration:   ${(sm.stats.totalDuration / 1000).toFixed(2)}s${' '.repeat(55)}║
║  Avg Load Time:    ${sm.stats.avgLoadTime.toFixed(0)}ms${' '.repeat(55)}║
╚═══════════════════════════════════════════════════════════════════════════════════════╝
`);
    }
    /**
     * Abort current mapping
     */
    // Complexity: O(1)
    abort() {
        this.aborted = true;
        console.log('[Oracle] ⚠️ Mapping aborted');
    }
    /**
     * Get current site map state
     */
    // Complexity: O(1)
    getSiteMap() {
        return this.siteMap;
    }
    /**
     * Sleep helper
     */
    // Complexity: O(1)
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
exports.SiteMapper = SiteMapper;
// ═══════════════════════════════════════════════════════════════════════════════
// FACTORY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * Create a new SiteMapper instance
 */
function createSiteMapper(config) {
    return new SiteMapper(config);
}
exports.default = SiteMapper;
