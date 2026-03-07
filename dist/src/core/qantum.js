"use strict";
/**
 * 🧠 QANTUM HYBRID - Main Class
 * Унифициран API: mm.visit().click().type().should()
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMM = exports.QAntum = void 0;
exports.createQA = createQA;
const playwright_1 = require("playwright");
const index_js_1 = require("../types/index.js");
const self_healing_js_1 = require("./self-healing.js");
const deep_search_js_1 = require("./deep-search.js");
const network_interceptor_js_1 = require("./network-interceptor.js");
const fluent_chain_js_1 = require("./fluent-chain.js");
class QAntum {
    config;
    browser;
    context;
    page;
    // Core engines
    selfHealer;
    deepSearch;
    networkInterceptor;
    constructor(config = {}) {
        this.config = { ...index_js_1.DEFAULT_CONFIG, ...config };
        this.selfHealer = new self_healing_js_1.SelfHealingEngine();
        this.deepSearch = new deep_search_js_1.DeepSearchEngine();
        this.networkInterceptor = new network_interceptor_js_1.NetworkInterceptor();
    }
    // ============== BROWSER LIFECYCLE ==============
    /**
     * Стартирай браузър
     */
    // Complexity: O(1) — amortized
    async launch() {
        const browserType = this.getBrowserType();
        // SAFETY: async operation — wrap in try-catch for production resilience
        this.browser = await browserType.launch({
            headless: this.config.browser.headless,
            slowMo: this.config.browser.slowMo
        });
        // Нов контекст за изолация (като Cypress)
        // SAFETY: async operation — wrap in try-catch for production resilience
        this.context = await this.browser.newContext({
            viewport: this.config.browser.viewport,
            baseURL: this.config.baseUrl
        });
        // SAFETY: async operation — wrap in try-catch for production resilience
        this.page = await this.context.newPage();
        // Инициализирай network interceptor
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.networkInterceptor.init(this.page);
        // Включи tracing ако е конфигурирано
        if (this.config.reporting.traces) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.context.tracing.start({
                screenshots: true,
                snapshots: true
            });
        }
        return this;
    }
    /**
     * Затвори браузър
     */
    // Complexity: O(1)
    async close() {
        if (this.config.reporting.traces && this.context) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.context.tracing.stop({
                path: `traces/trace-${Date.now()}.zip`
            });
        }
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.context?.close();
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.browser?.close();
    }
    /**
     * Вземи правилния браузър тип
     */
    // Complexity: O(1)
    getBrowserType() {
        const browsers = {
            chromium: playwright_1.chromium,
            firefox: playwright_1.firefox,
            webkit: playwright_1.webkit
        };
        return browsers[this.config.browser.browser];
    }
    // ============== NAVIGATION ==============
    /**
     * Отиди на URL
     */
    // Complexity: O(N) — potential recursive descent
    async visit(url) {
        this.ensurePage();
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.page.goto(url, {
            waitUntil: 'domcontentloaded',
            timeout: this.config.browser.timeout
        });
        return this;
    }
    /**
     * Презареди страницата
     */
    // Complexity: O(N) — potential recursive descent
    async reload() {
        this.ensurePage();
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.page.reload();
        return this;
    }
    /**
     * Назад
     */
    // Complexity: O(N) — potential recursive descent
    async goBack() {
        this.ensurePage();
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.page.goBack();
        return this;
    }
    /**
     * Напред
     */
    // Complexity: O(N) — potential recursive descent
    async goForward() {
        this.ensurePage();
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.page.goForward();
        return this;
    }
    // ============== ELEMENT SELECTION (Fluent API) ==============
    /**
     * Избери елемент (връща FluentChain за chaining)
     */
    // Complexity: O(N) — potential recursive descent
    get(selector) {
        this.ensurePage();
        return new fluent_chain_js_1.FluentChain(this.page, this.selfHealer, this.deepSearch, this.config.browser.timeout).get(selector);
    }
    /**
     * Намери елемент с Deep Search
     */
    // Complexity: O(N) — linear iteration
    async find(selector) {
        this.ensurePage();
        const chain = new fluent_chain_js_1.FluentChain(this.page, this.selfHealer, this.deepSearch, this.config.browser.timeout);
        // SAFETY: async operation — wrap in try-catch for production resilience
        return await chain.find(selector);
    }
    /**
     * Селектори по различни стратегии
     */
    // Complexity: O(N) — potential recursive descent
    getByTestId(testId) {
        return this.get(`[data-testid="${testId}"]`);
    }
    // Complexity: O(N) — potential recursive descent
    getByText(text) {
        return this.get(`text="${text}"`);
    }
    // Complexity: O(1)
    getByRole(role, options) {
        this.ensurePage();
        const chain = new fluent_chain_js_1.FluentChain(this.page, this.selfHealer, this.deepSearch, this.config.browser.timeout);
        // @ts-ignore
        chain['currentLocator'] = this.page.getByRole(role, options);
        return chain;
    }
    // Complexity: O(N) — potential recursive descent
    getByPlaceholder(placeholder) {
        return this.get(`[placeholder="${placeholder}"]`);
    }
    // Complexity: O(1)
    getByLabel(label) {
        this.ensurePage();
        const chain = new fluent_chain_js_1.FluentChain(this.page, this.selfHealer, this.deepSearch, this.config.browser.timeout);
        // @ts-ignore
        chain['currentLocator'] = this.page.getByLabel(label);
        return chain;
    }
    // ============== QUICK ACTIONS (Direct, no chaining) ==============
    /**
     * Бърз клик
     */
    // Complexity: O(N) — potential recursive descent
    async click(selector) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.get(selector).click();
        return this;
    }
    /**
     * Бързо въвеждане
     */
    // Complexity: O(N) — potential recursive descent
    async type(selector, text) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.get(selector).type(text);
        return this;
    }
    /**
     * Изчакай елемент
     */
    // Complexity: O(N) — potential recursive descent
    async waitFor(selector, timeout) {
        this.ensurePage();
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.page.waitForSelector(selector, {
            timeout: timeout || this.config.browser.timeout
        });
        return this;
    }
    /**
     * Изчакай URL
     */
    // Complexity: O(N) — potential recursive descent
    async waitForUrl(url) {
        this.ensurePage();
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.page.waitForURL(url);
        return this;
    }
    /**
     * Изчакай навигация
     */
    // Complexity: O(N) — potential recursive descent
    async waitForNavigation() {
        this.ensurePage();
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.page.waitForLoadState('domcontentloaded');
        return this;
    }
    // ============== NETWORK (Cypress-style) ==============
    /**
     * Интерцептирай заявка
     */
    // Complexity: O(1)
    async intercept(config) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.networkInterceptor.intercept(config);
        return this;
    }
    /**
     * Stub API response
     */
    // Complexity: O(1)
    async stub(url, body, status = 200) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.networkInterceptor.stub(url, body, status);
        return this;
    }
    /**
     * Изчакай заявка
     */
    // Complexity: O(1)
    async waitForRequest(url) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.networkInterceptor.waitForRequest(url);
        return this;
    }
    // ============== SCREENSHOTS & TRACES ==============
    /**
     * Направи screenshot
     */
    // Complexity: O(N) — potential recursive descent
    async screenshot(name) {
        this.ensurePage();
        const path = `screenshots/${name || `screenshot-${Date.now()}`}.png`;
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.page.screenshot({ path, fullPage: true });
        return path;
    }
    /**
     * Вземи HTML на страницата
     */
    // Complexity: O(N) — potential recursive descent
    async getHtml() {
        this.ensurePage();
        // SAFETY: async operation — wrap in try-catch for production resilience
        return await this.page.content();
    }
    /**
     * Вземи заглавие
     */
    // Complexity: O(N) — potential recursive descent
    async getTitle() {
        this.ensurePage();
        // SAFETY: async operation — wrap in try-catch for production resilience
        return await this.page.title();
    }
    /**
     * Вземи URL
     */
    // Complexity: O(N) — potential recursive descent
    getUrl() {
        this.ensurePage();
        return this.page.url();
    }
    // ============== UTILITIES ==============
    /**
     * Изпълни JavaScript
     */
    async evaluate(fn) {
        this.ensurePage();
        // SAFETY: async operation — wrap in try-catch for production resilience
        return await this.page.evaluate(fn);
    }
    /**
     * Пауза (за дебъгване)
     */
    // Complexity: O(1)
    async pause(ms) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await new Promise(resolve => setTimeout(resolve, ms));
        return this;
    }
    /**
     * Директен достъп до Page
     */
    // Complexity: O(N) — potential recursive descent
    getPage() {
        this.ensurePage();
        return this.page;
    }
    /**
     * Директен достъп до Context
     */
    // Complexity: O(1)
    getContext() {
        if (!this.context)
            throw new Error('Browser not launched');
        return this.context;
    }
    /**
     * Осигури че има страница
     */
    // Complexity: O(1)
    ensurePage() {
        if (!this.page) {
            throw new Error('Browser not launched. Call mm.launch() first.');
        }
    }
}
exports.QAntum = QAntum;
// ============== FACTORY FUNCTION ==============
/**
 * Създай нова инстанция на QANTUM
 */
function createQA(config) {
    return new QAntum(config);
}
/**
 * Legacy alias for backward compatibility
 * @deprecated Use createQA instead
 */
exports.createMM = createQA;
// Default export
exports.default = QAntum;
