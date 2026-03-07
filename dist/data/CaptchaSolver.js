"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * MIND-ENGINE: CAPTCHA SOLVER
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Universal captcha solving with support for multiple providers:
 * - 2Captcha (reCAPTCHA v2/v3, hCaptcha, FunCaptcha, image captcha)
 * - AntiCaptcha
 * - CapMonster
 *
 * @author dp | QAntum Labs
 * @version 1.0.0-QANTUM-PRIME
 * @license Commercial
 * ═══════════════════════════════════════════════════════════════════════════════
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CaptchaSolver = exports.CapMonsterSolver = exports.AntiCaptchaSolver = exports.TwoCaptchaSolver = exports.BaseCaptchaSolver = void 0;
exports.createCaptchaSolver = createCaptchaSolver;
const events_1 = require("events");
const logger_1 = require("../api/unified/utils/logger");
// ═══════════════════════════════════════════════════════════════════════════════
// BASE CAPTCHA SOLVER
// ═══════════════════════════════════════════════════════════════════════════════
class BaseCaptchaSolver extends events_1.EventEmitter {
    config;
    baseUrl = '';
    constructor(config) {
        super();
        this.config = {
            timeout: 120000,
            pollingInterval: 5000,
            debug: false,
            ...config
        };
    }
    /**
     * Solve any captcha type
     */
    async solve(task) {
        const startTime = Date.now();
        this.emit('captcha:solving', { type: task.type });
        try {
            // Create task
            const taskId = await this.createTask(task);
            this.emit('captcha:task_created', { taskId, type: task.type });
            // Wait for solution
            const solution = await this.waitForResult(taskId);
            const solveTime = Date.now() - startTime;
            this.emit('captcha:solved', { taskId, solveTime, type: task.type });
            return {
                taskId,
                solution,
                solveTime
            };
        }
        catch (error) {
            this.emit('captcha:error', { error, type: task.type });
            throw error;
        }
    }
    /**
     * Wait for result with polling
     */
    async waitForResult(taskId) {
        const startTime = Date.now();
        const timeout = this.config.timeout;
        const interval = this.config.pollingInterval;
        while (Date.now() - startTime < timeout) {
            await this.sleep(interval);
            const result = await this.getResult(taskId);
            if (result) {
                return result;
            }
        }
        throw new Error(`Captcha solve timeout after ${timeout}ms`);
    }
    /**
     * Sleep helper
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    /**
     * HTTP request helper
     */
    async request(url, options = {}) {
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.json();
    }
    /**
     * Debug log
     */
    log(...args) {
        if (this.config.debug) {
            logger_1.logger.debug('[CaptchaSolver]', ...args);
        }
    }
}
exports.BaseCaptchaSolver = BaseCaptchaSolver;
// ═══════════════════════════════════════════════════════════════════════════════
// 2CAPTCHA SOLVER
// ═══════════════════════════════════════════════════════════════════════════════
class TwoCaptchaSolver extends BaseCaptchaSolver {
    baseUrl = 'https://2captcha.com';
    async createTask(task) {
        const params = {
            key: this.config.apiKey,
            json: 1,
            soft_id: this.config.softId
        };
        switch (task.type) {
            case 'recaptcha_v2':
                params.method = 'userrecaptcha';
                params.googlekey = task.siteKey;
                params.pageurl = task.pageUrl;
                if (task.isInvisible)
                    params.invisible = 1;
                if (task.dataS)
                    params.data_s = task.dataS;
                break;
            case 'recaptcha_v3':
                params.method = 'userrecaptcha';
                params.version = 'v3';
                params.googlekey = task.siteKey;
                params.pageurl = task.pageUrl;
                if (task.action)
                    params.action = task.action;
                if (task.minScore)
                    params.min_score = task.minScore;
                break;
            case 'hcaptcha':
                params.method = 'hcaptcha';
                params.sitekey = task.siteKey;
                params.pageurl = task.pageUrl;
                if (task.isInvisible)
                    params.invisible = 1;
                break;
            case 'funcaptcha':
                params.method = 'funcaptcha';
                params.publickey = task.publicKey;
                params.pageurl = task.pageUrl;
                if (task.serviceUrl)
                    params.surl = task.serviceUrl;
                break;
            case 'image':
                params.method = 'base64';
                params.body = task.base64Image;
                if (task.phrase)
                    params.phrase = 1;
                if (task.caseSensitive)
                    params.regsense = 1;
                if (task.numeric !== undefined)
                    params.numeric = task.numeric;
                if (task.minLength)
                    params.min_len = task.minLength;
                if (task.maxLength)
                    params.max_len = task.maxLength;
                break;
            case 'turnstile':
                params.method = 'turnstile';
                params.sitekey = task.siteKey;
                params.pageurl = task.pageUrl;
                break;
            default:
                throw new Error(`Unsupported captcha type: ${task.type}`);
        }
        const queryString = new URLSearchParams(params).toString();
        const response = await this.request(`${this.baseUrl}/in.php?${queryString}`);
        if (response.status !== 1) {
            throw new Error(`2Captcha error: ${response.request}`);
        }
        return response.request;
    }
    async getResult(taskId) {
        const params = new URLSearchParams({
            key: this.config.apiKey,
            action: 'get',
            id: taskId,
            json: '1'
        });
        const response = await this.request(`${this.baseUrl}/res.php?${params}`);
        if (response.status === 1) {
            return response.request;
        }
        if (response.request === 'CAPCHA_NOT_READY') {
            return null;
        }
        throw new Error(`2Captcha error: ${response.request}`);
    }
    async getBalance() {
        const params = new URLSearchParams({
            key: this.config.apiKey,
            action: 'getbalance',
            json: '1'
        });
        const response = await this.request(`${this.baseUrl}/res.php?${params}`);
        return parseFloat(response.request);
    }
    async reportIncorrect(taskId) {
        const params = new URLSearchParams({
            key: this.config.apiKey,
            action: 'reportbad',
            id: taskId,
            json: '1'
        });
        await this.request(`${this.baseUrl}/res.php?${params}`);
        this.emit('captcha:reported', { taskId });
    }
}
exports.TwoCaptchaSolver = TwoCaptchaSolver;
// ═══════════════════════════════════════════════════════════════════════════════
// ANTICAPTCHA SOLVER
// ═══════════════════════════════════════════════════════════════════════════════
class AntiCaptchaSolver extends BaseCaptchaSolver {
    baseUrl = 'https://api.anti-captcha.com';
    async createTask(task) {
        let taskPayload = {};
        switch (task.type) {
            case 'recaptcha_v2':
                taskPayload = {
                    type: task.isInvisible ? 'RecaptchaV2TaskProxyless' : 'NoCaptchaTaskProxyless',
                    websiteURL: task.pageUrl,
                    websiteKey: task.siteKey,
                    isInvisible: task.isInvisible
                };
                break;
            case 'recaptcha_v3':
                taskPayload = {
                    type: 'RecaptchaV3TaskProxyless',
                    websiteURL: task.pageUrl,
                    websiteKey: task.siteKey,
                    minScore: task.minScore || 0.3,
                    pageAction: task.action
                };
                break;
            case 'hcaptcha':
                taskPayload = {
                    type: 'HCaptchaTaskProxyless',
                    websiteURL: task.pageUrl,
                    websiteKey: task.siteKey,
                    isInvisible: task.isInvisible
                };
                break;
            case 'funcaptcha':
                taskPayload = {
                    type: 'FunCaptchaTaskProxyless',
                    websiteURL: task.pageUrl,
                    websitePublicKey: task.publicKey,
                    funcaptchaApiJSSubdomain: task.serviceUrl
                };
                break;
            case 'image':
                taskPayload = {
                    type: 'ImageToTextTask',
                    body: task.base64Image,
                    phrase: task.phrase,
                    case: task.caseSensitive,
                    numeric: task.numeric,
                    minLength: task.minLength,
                    maxLength: task.maxLength
                };
                break;
            case 'turnstile':
                taskPayload = {
                    type: 'TurnstileTaskProxyless',
                    websiteURL: task.pageUrl,
                    websiteKey: task.siteKey
                };
                break;
        }
        const response = await this.request(`${this.baseUrl}/createTask`, {
            method: 'POST',
            body: JSON.stringify({
                clientKey: this.config.apiKey,
                task: taskPayload
            })
        });
        if (response.errorId !== 0) {
            throw new Error(`AntiCaptcha error: ${response.errorCode} - ${response.errorDescription}`);
        }
        return String(response.taskId);
    }
    async getResult(taskId) {
        const response = await this.request(`${this.baseUrl}/getTaskResult`, {
            method: 'POST',
            body: JSON.stringify({
                clientKey: this.config.apiKey,
                taskId: parseInt(taskId)
            })
        });
        if (response.errorId !== 0) {
            throw new Error(`AntiCaptcha error: ${response.errorCode} - ${response.errorDescription}`);
        }
        if (response.status === 'ready') {
            return response.solution.gRecaptchaResponse ||
                response.solution.token ||
                response.solution.text;
        }
        return null;
    }
    async getBalance() {
        const response = await this.request(`${this.baseUrl}/getBalance`, {
            method: 'POST',
            body: JSON.stringify({
                clientKey: this.config.apiKey
            })
        });
        return response.balance;
    }
    async reportIncorrect(taskId) {
        await this.request(`${this.baseUrl}/reportIncorrectRecaptcha`, {
            method: 'POST',
            body: JSON.stringify({
                clientKey: this.config.apiKey,
                taskId: parseInt(taskId)
            })
        });
        this.emit('captcha:reported', { taskId });
    }
}
exports.AntiCaptchaSolver = AntiCaptchaSolver;
// ═══════════════════════════════════════════════════════════════════════════════
// CAPMONSTER SOLVER
// ═══════════════════════════════════════════════════════════════════════════════
class CapMonsterSolver extends BaseCaptchaSolver {
    baseUrl = 'https://api.capmonster.cloud';
    async createTask(task) {
        let taskPayload = {};
        switch (task.type) {
            case 'recaptcha_v2':
                taskPayload = {
                    type: 'NoCaptchaTaskProxyless',
                    websiteURL: task.pageUrl,
                    websiteKey: task.siteKey
                };
                break;
            case 'recaptcha_v3':
                taskPayload = {
                    type: 'RecaptchaV3TaskProxyless',
                    websiteURL: task.pageUrl,
                    websiteKey: task.siteKey,
                    minScore: task.minScore || 0.3,
                    pageAction: task.action
                };
                break;
            case 'hcaptcha':
                taskPayload = {
                    type: 'HCaptchaTaskProxyless',
                    websiteURL: task.pageUrl,
                    websiteKey: task.siteKey
                };
                break;
            case 'funcaptcha':
                taskPayload = {
                    type: 'FunCaptchaTaskProxyless',
                    websiteURL: task.pageUrl,
                    websitePublicKey: task.publicKey,
                    funcaptchaApiJSSubdomain: task.serviceUrl
                };
                break;
            case 'image':
                taskPayload = {
                    type: 'ImageToTextTask',
                    body: task.base64Image
                };
                break;
            case 'turnstile':
                taskPayload = {
                    type: 'TurnstileTask',
                    websiteURL: task.pageUrl,
                    websiteKey: task.siteKey
                };
                break;
        }
        const response = await this.request(`${this.baseUrl}/createTask`, {
            method: 'POST',
            body: JSON.stringify({
                clientKey: this.config.apiKey,
                task: taskPayload
            })
        });
        if (response.errorId !== 0) {
            throw new Error(`CapMonster error: ${response.errorCode}`);
        }
        return String(response.taskId);
    }
    async getResult(taskId) {
        const response = await this.request(`${this.baseUrl}/getTaskResult`, {
            method: 'POST',
            body: JSON.stringify({
                clientKey: this.config.apiKey,
                taskId: parseInt(taskId)
            })
        });
        if (response.errorId !== 0) {
            throw new Error(`CapMonster error: ${response.errorCode}`);
        }
        if (response.status === 'ready') {
            return response.solution.gRecaptchaResponse ||
                response.solution.token ||
                response.solution.text;
        }
        return null;
    }
    async getBalance() {
        const response = await this.request(`${this.baseUrl}/getBalance`, {
            method: 'POST',
            body: JSON.stringify({
                clientKey: this.config.apiKey
            })
        });
        return response.balance;
    }
    async reportIncorrect(taskId) {
        await this.request(`${this.baseUrl}/reportIncorrectRecaptcha`, {
            method: 'POST',
            body: JSON.stringify({
                clientKey: this.config.apiKey,
                taskId: parseInt(taskId)
            })
        });
    }
}
exports.CapMonsterSolver = CapMonsterSolver;
// ═══════════════════════════════════════════════════════════════════════════════
// CAPTCHA SOLVER FACTORY
// ═══════════════════════════════════════════════════════════════════════════════
class CaptchaSolver extends events_1.EventEmitter {
    solver;
    page = null;
    constructor(config) {
        super();
        switch (config.provider) {
            case '2captcha':
                this.solver = new TwoCaptchaSolver(config);
                break;
            case 'anticaptcha':
                this.solver = new AntiCaptchaSolver(config);
                break;
            case 'capmonster':
                this.solver = new CapMonsterSolver(config);
                break;
            default:
                throw new Error(`Unknown captcha provider: ${config.provider}`);
        }
        // Forward events
        this.solver.on('captcha:solving', (data) => this.emit('captcha:solving', data));
        this.solver.on('captcha:solved', (data) => this.emit('captcha:solved', data));
        this.solver.on('captcha:error', (data) => this.emit('captcha:error', data));
    }
    /**
     * Set page for auto-detection
     */
    setPage(page) {
        this.page = page;
    }
    /**
     * Solve reCAPTCHA v2
     */
    async solveRecaptchaV2(siteKey, pageUrl, isInvisible = false) {
        const solution = await this.solver.solve({
            type: 'recaptcha_v2',
            siteKey,
            pageUrl,
            isInvisible
        });
        return solution.solution;
    }
    /**
     * Solve reCAPTCHA v3
     */
    async solveRecaptchaV3(siteKey, pageUrl, action, minScore) {
        const solution = await this.solver.solve({
            type: 'recaptcha_v3',
            siteKey,
            pageUrl,
            action,
            minScore
        });
        return solution.solution;
    }
    /**
     * Solve hCaptcha
     */
    async solveHCaptcha(siteKey, pageUrl) {
        const solution = await this.solver.solve({
            type: 'hcaptcha',
            siteKey,
            pageUrl
        });
        return solution.solution;
    }
    /**
     * Solve FunCaptcha
     */
    async solveFunCaptcha(publicKey, pageUrl, serviceUrl) {
        const solution = await this.solver.solve({
            type: 'funcaptcha',
            publicKey,
            pageUrl,
            serviceUrl
        });
        return solution.solution;
    }
    /**
     * Solve Cloudflare Turnstile
     */
    async solveTurnstile(siteKey, pageUrl) {
        const solution = await this.solver.solve({
            type: 'turnstile',
            siteKey,
            pageUrl
        });
        return solution.solution;
    }
    /**
     * Solve image captcha
     */
    async solveImage(base64Image, options = {}) {
        const solution = await this.solver.solve({
            type: 'image',
            base64Image,
            ...options
        });
        return solution.solution;
    }
    /**
     * Auto-detect and solve captcha on current page
     */
    async autoSolve() {
        if (!this.page) {
            throw new Error('Page not set. Call setPage() first.');
        }
        const pageUrl = this.page.url();
        // Check for reCAPTCHA
        const recaptchaSiteKey = await this.detectRecaptcha();
        if (recaptchaSiteKey) {
            const isV3 = await this.isRecaptchaV3();
            if (isV3) {
                return this.solveRecaptchaV3(recaptchaSiteKey, pageUrl);
            }
            const isInvisible = await this.isInvisibleRecaptcha();
            return this.solveRecaptchaV2(recaptchaSiteKey, pageUrl, isInvisible);
        }
        // Check for hCaptcha
        const hcaptchaSiteKey = await this.detectHCaptcha();
        if (hcaptchaSiteKey) {
            return this.solveHCaptcha(hcaptchaSiteKey, pageUrl);
        }
        // Check for Turnstile
        const turnstileSiteKey = await this.detectTurnstile();
        if (turnstileSiteKey) {
            return this.solveTurnstile(turnstileSiteKey, pageUrl);
        }
        return null;
    }
    /**
     * Inject solution into page
     */
    async injectSolution(solution, type = 'recaptcha') {
        if (!this.page)
            throw new Error('Page not set');
        switch (type) {
            case 'recaptcha':
                await this.page.evaluate((token) => {
                    const textarea = document.getElementById('g-recaptcha-response');
                    if (textarea) {
                        textarea.value = token;
                        textarea.style.display = 'none';
                    }
                    // Also try callback
                    if (window.grecaptcha && window.grecaptcha.callback) {
                        window.grecaptcha.callback(token);
                    }
                }, solution);
                break;
            case 'hcaptcha':
                await this.page.evaluate((token) => {
                    const textarea = document.querySelector('[name="h-captcha-response"]');
                    if (textarea) {
                        textarea.value = token;
                    }
                    // Trigger callback
                    if (window.hcaptcha) {
                        window.hcaptcha.execute({ response: token });
                    }
                }, solution);
                break;
            case 'turnstile':
                await this.page.evaluate((token) => {
                    const input = document.querySelector('[name="cf-turnstile-response"]');
                    if (input) {
                        input.value = token;
                    }
                }, solution);
                break;
        }
        this.emit('captcha:injected', { type });
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // DETECTION HELPERS
    // ═══════════════════════════════════════════════════════════════════════════
    async detectRecaptcha() {
        if (!this.page)
            return null;
        return this.page.evaluate(() => {
            // Check for reCAPTCHA element
            const recaptcha = document.querySelector('.g-recaptcha');
            if (recaptcha) {
                return recaptcha.getAttribute('data-sitekey');
            }
            // Check for reCAPTCHA script
            const scripts = Array.from(document.querySelectorAll('script'));
            for (const script of scripts) {
                const src = script.src || '';
                const match = src.match(/[?&]render=([^&]+)/);
                if (match)
                    return match[1];
            }
            // Check grecaptcha object
            if (window.grecaptcha) {
                const iframe = document.querySelector('iframe[src*="recaptcha"]');
                if (iframe) {
                    const src = iframe.getAttribute('src') || '';
                    const match = src.match(/k=([^&]+)/);
                    if (match)
                        return match[1];
                }
            }
            return null;
        });
    }
    async isRecaptchaV3() {
        if (!this.page)
            return false;
        return this.page.evaluate(() => {
            // V3 is usually loaded with render parameter
            const scripts = Array.from(document.querySelectorAll('script'));
            return scripts.some(s => s.src.includes('render='));
        });
    }
    async isInvisibleRecaptcha() {
        if (!this.page)
            return false;
        return this.page.evaluate(() => {
            const recaptcha = document.querySelector('.g-recaptcha');
            return recaptcha?.getAttribute('data-size') === 'invisible';
        });
    }
    async detectHCaptcha() {
        if (!this.page)
            return null;
        return this.page.evaluate(() => {
            const hcaptcha = document.querySelector('.h-captcha');
            return hcaptcha?.getAttribute('data-sitekey') || null;
        });
    }
    async detectTurnstile() {
        if (!this.page)
            return null;
        return this.page.evaluate(() => {
            const turnstile = document.querySelector('.cf-turnstile');
            return turnstile?.getAttribute('data-sitekey') || null;
        });
    }
    /**
     * Get account balance
     */
    async getBalance() {
        return this.solver.getBalance();
    }
    /**
     * Report incorrect solution
     */
    async reportIncorrect(taskId) {
        return this.solver.reportIncorrect(taskId);
    }
}
exports.CaptchaSolver = CaptchaSolver;
// ═══════════════════════════════════════════════════════════════════════════════
// FACTORY
// ═══════════════════════════════════════════════════════════════════════════════
function createCaptchaSolver(provider, apiKey) {
    return new CaptchaSolver({ provider, apiKey });
}
exports.default = CaptchaSolver;
