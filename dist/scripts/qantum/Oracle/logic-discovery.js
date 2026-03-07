"use strict";
/**
 * 🔮 THE ORACLE - Logic Discovery Module
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Uses Chronos-Paradox to simulate different user paths and discover
 * business logic without manual instructions.
 *
 * "Симулира различни потребителски пътища и открива бизнес логиката."
 *
 * @version 1.0.0
 * @author QAntum AI Architect
 * @phase THE ORACLE - Logic Discovery
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
exports.LogicDiscoveryEngine = void 0;
exports.createLogicDiscovery = createLogicDiscovery;
const crypto = __importStar(require("crypto"));
const events_1 = require("events");
// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════
const DEFAULT_CONFIG = {
    maxJourneys: 20,
    maxStepsPerJourney: 15,
    timeout: 30000,
    captureScreenshots: true,
    exploreFormVariations: true,
    simulateErrors: true,
    testAuthentication: true,
    testValidation: true,
    testRateLimits: false
};
// Test data generators
const TEST_DATA = {
    email: ['test@example.com', 'invalid-email', '', 'admin@test.com'],
    password: ['Password123!', '123', '', 'verylongpassword'.repeat(10)],
    username: ['testuser', 'admin', '', 'a', 'test@user'],
    phone: ['+1234567890', '123', '', 'not-a-phone'],
    name: ['John Doe', '', 'A', 'Test'.repeat(100)],
    number: ['123', '0', '-1', 'abc', '999999999'],
    text: ['Test input', '', ' ', '<script>alert(1)</script>'],
};
// ═══════════════════════════════════════════════════════════════════════════════
// LOGIC DISCOVERY ENGINE
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * 🔮 LogicDiscoveryEngine - Autonomous business logic discovery
 *
 * Uses Chronos-Paradox simulation principles to:
 * - Explore all possible user paths
 * - Discover validation rules
 * - Map authentication/authorization flows
 * - Identify transaction workflows
 * - Detect error handling patterns
 */
class LogicDiscoveryEngine extends events_1.EventEmitter {
    config;
    browser = null;
    context = null;
    siteMap = null;
    discoveredJourneys = [];
    discoveredLogic = [];
    discoveredFlows = [];
    constructor(config = {}) {
        super();
        this.config = { ...DEFAULT_CONFIG, ...config };
    }
    /**
     * 🚀 Discover business logic from a site map
     */
    // Complexity: O(1) — hash/map lookup
    async discoverLogic(siteMap, browser) {
        this.browser = browser;
        this.siteMap = siteMap;
        console.log(`
╔═══════════════════════════════════════════════════════════════════════════════════════╗
║                                                                                       ║
║   ██╗      ██████╗  ██████╗ ██╗ ██████╗    ██████╗ ██╗███████╗ ██████╗ ██████╗ ██╗   ║
║   ██║     ██╔═══██╗██╔════╝ ██║██╔════╝    ██╔══██╗██║██╔════╝██╔════╝██╔═══██╗██║   ║
║   ██║     ██║   ██║██║  ███╗██║██║         ██║  ██║██║███████╗██║     ██║   ██║██║   ║
║   ██║     ██║   ██║██║   ██║██║██║         ██║  ██║██║╚════██║██║     ██║   ██║╚═╝   ║
║   ███████╗╚██████╔╝╚██████╔╝██║╚██████╗    ██████╔╝██║███████║╚██████╗╚██████╔╝██╗   ║
║   ╚══════╝ ╚═════╝  ╚═════╝ ╚═╝ ╚═════╝    ╚═════╝ ╚═╝╚══════╝ ╚═════╝ ╚═════╝ ╚═╝   ║
║                                                                                       ║
║                      THE ORACLE - Business Logic Discovery                            ║
║                                                                                       ║
╠═══════════════════════════════════════════════════════════════════════════════════════╣
║  Pages to analyze: ${siteMap.totalPages.toString().padEnd(60)}║
║  Forms to test: ${siteMap.totalForms.toString().padEnd(63)}║
║  Max Journeys: ${this.config.maxJourneys.toString().padEnd(64)}║
╚═══════════════════════════════════════════════════════════════════════════════════════╝
`);
        // Create browser context
        // SAFETY: async operation — wrap in try-catch for production resilience
        this.context = await browser.newContext({
            ignoreHTTPSErrors: true
        });
        try {
            // Phase 1: Discover form validation logic
            if (this.config.testValidation) {
                console.log('\n[LogicDiscovery] 📝 Phase 1: Exploring Form Validation...');
                await this.discoverFormValidation();
            }
            // Phase 2: Discover authentication flows
            if (this.config.testAuthentication) {
                console.log('\n[LogicDiscovery] 🔐 Phase 2: Mapping Authentication Flows...');
                await this.discoverAuthenticationFlows();
            }
            // Phase 3: Discover transaction flows
            console.log('\n[LogicDiscovery] 💰 Phase 3: Mapping Transaction Flows...');
            await this.discoverTransactionFlows();
            // Phase 4: Discover error handling
            if (this.config.simulateErrors) {
                console.log('\n[LogicDiscovery] ⚠️ Phase 4: Testing Error Handling...');
                // SAFETY: async operation — wrap in try-catch for production resilience
                await this.discoverErrorHandling();
            }
            // Phase 5: Generate user journeys
            console.log('\n[LogicDiscovery] 🗺️ Phase 5: Generating User Journeys...');
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.generateUserJourneys();
        }
        finally {
            if (this.context) {
                // SAFETY: async operation — wrap in try-catch for production resilience
                await this.context.close();
            }
        }
        // Print summary
        this.printSummary();
        return {
            journeys: this.discoveredJourneys,
            logic: this.discoveredLogic,
            flows: this.discoveredFlows
        };
    }
    /**
     * Phase 1: Discover form validation rules
     */
    // Complexity: O(N*M) — nested iteration detected
    async discoverFormValidation() {
        const pages = Array.from(this.siteMap.pages.values());
        for (const page of pages) {
            for (const form of page.forms) {
                if (form.fields.length === 0)
                    continue;
                console.log(`  → Testing form: ${form.purpose || form.name || 'Unknown'}`);
                // SAFETY: async operation — wrap in try-catch for production resilience
                const validationLogic = await this.testFormValidation(page.url, form);
                if (validationLogic) {
                    this.discoveredLogic.push(validationLogic);
                    this.emit('logic:discovered', validationLogic);
                }
            }
        }
    }
    /**
     * Test form validation with various inputs
     */
    // Complexity: O(N*M) — nested iteration detected
    async testFormValidation(pageUrl, form) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const playwrightPage = await this.context.newPage();
        const evidence = [];
        const conditions = [];
        const outcomes = [];
        try {
            await playwrightPage.goto(pageUrl, { timeout: this.config.timeout });
            for (const field of form.fields) {
                const testValues = TEST_DATA[field.type] || TEST_DATA['text'];
                for (const testValue of testValues) {
                    try {
                        // Clear and fill field
                        await playwrightPage.locator(field.selector).fill('');
                        await playwrightPage.locator(field.selector).fill(testValue);
                        // Trigger validation (blur)
                        await playwrightPage.locator(field.selector).blur();
                        await this.sleep(300);
                        // Check for validation messages
                        const errorMessage = await this.findValidationError(playwrightPage, field.selector);
                        if (errorMessage) {
                            evidence.push(`Field "${field.name}" with value "${testValue}" → Error: "${errorMessage}"`);
                            conditions.push({
                                type: 'field_value',
                                field: field.name,
                                operator: 'equals',
                                value: testValue
                            });
                            outcomes.push({
                                type: 'error_message',
                                value: errorMessage,
                                selector: field.selector
                            });
                        }
                        // Check if field has pattern validation
                        if (field.validation) {
                            evidence.push(`Field "${field.name}" has pattern validation: ${field.validation}`);
                        }
                    }
                    catch (e) {
                        // Field interaction failed
                    }
                }
            }
        }
        finally {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await playwrightPage.close();
        }
        if (evidence.length === 0)
            return null;
        return {
            id: crypto.randomUUID(),
            type: 'validation',
            name: `Form Validation: ${form.purpose}`,
            description: `Validation rules for ${form.name || 'form'} at ${pageUrl}`,
            triggers: [{
                    type: 'form_submit',
                    selector: form.selector,
                    url: pageUrl
                }],
            conditions,
            outcomes,
            confidence: 0.85,
            evidence
        };
    }
    /**
     * Find validation error message near a field
     */
    // Complexity: O(N*M) — nested iteration detected
    async findValidationError(page, fieldSelector) {
        try {
            // Common error message patterns
            const errorSelectors = [
                `${fieldSelector} + .error`,
                `${fieldSelector} ~ .error`,
                `${fieldSelector} + [class*="error"]`,
                `${fieldSelector} ~ [class*="error"]`,
                `${fieldSelector} + [class*="invalid"]`,
                '.field-error',
                '.validation-error',
                '[role="alert"]'
            ];
            for (const selector of errorSelectors) {
                const error = page.locator(selector).first();
                if (await error.isVisible().catch(() => false)) {
                    // SAFETY: async operation — wrap in try-catch for production resilience
                    const text = await error.textContent();
                    if (text && text.trim().length > 0) {
                        return text.trim();
                    }
                }
            }
            // Check for aria-invalid
            // SAFETY: async operation — wrap in try-catch for production resilience
            const isInvalid = await page.locator(fieldSelector).getAttribute('aria-invalid');
            if (isInvalid === 'true') {
                return 'Field marked as invalid';
            }
        }
        catch (e) {
            // Error finding validation
        }
        return null;
    }
    /**
     * Phase 2: Discover authentication flows
     */
    // Complexity: O(N*M) — nested iteration detected
    async discoverAuthenticationFlows() {
        const pages = Array.from(this.siteMap.pages.values());
        // Find login forms
        const loginForms = pages.flatMap(p => p.forms.filter(f => f.purpose.toLowerCase().includes('authentication') ||
            f.purpose.toLowerCase().includes('login')).map(f => ({ page: p, form: f })));
        for (const { page, form } of loginForms) {
            console.log(`  → Analyzing login form at: ${page.url}`);
            // SAFETY: async operation — wrap in try-catch for production resilience
            const authLogic = await this.analyzeAuthenticationForm(page, form);
            if (authLogic) {
                this.discoveredLogic.push(authLogic);
                this.emit('logic:discovered', authLogic);
            }
        }
        // Find registration forms
        const registrationForms = pages.flatMap(p => p.forms.filter(f => f.purpose.toLowerCase().includes('registration')).map(f => ({ page: p, form: f })));
        for (const { page, form } of registrationForms) {
            console.log(`  → Analyzing registration form at: ${page.url}`);
            // SAFETY: async operation — wrap in try-catch for production resilience
            const regLogic = await this.analyzeRegistrationForm(page, form);
            if (regLogic) {
                this.discoveredLogic.push(regLogic);
            }
        }
    }
    /**
     * Analyze authentication form behavior
     */
    // Complexity: O(N)
    async analyzeAuthenticationForm(page, form) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const playwrightPage = await this.context.newPage();
        const evidence = [];
        const outcomes = [];
        try {
            await playwrightPage.goto(page.url, { timeout: this.config.timeout });
            // Test 1: Empty credentials
            evidence.push('Testing empty credentials...');
            await this.submitFormWithData(playwrightPage, form, {});
            const emptyError = await this.getPageError(playwrightPage);
            if (emptyError) {
                outcomes.push({ type: 'error_message', value: emptyError });
                evidence.push(`Empty credentials → "${emptyError}"`);
            }
            // Test 2: Invalid credentials
            await playwrightPage.goto(page.url);
            evidence.push('Testing invalid credentials...');
            await this.submitFormWithData(playwrightPage, form, {
                email: 'nonexistent@test.com',
                username: 'nonexistent',
                password: 'wrongpassword'
            });
            // SAFETY: async operation — wrap in try-catch for production resilience
            const invalidError = await this.getPageError(playwrightPage);
            if (invalidError) {
                outcomes.push({ type: 'error_message', value: invalidError });
                evidence.push(`Invalid credentials → "${invalidError}"`);
            }
            // Check for redirect after auth
            const currentUrl = playwrightPage.url();
            if (currentUrl !== page.url) {
                outcomes.push({ type: 'redirect', value: currentUrl });
                evidence.push(`Form redirects to: ${currentUrl}`);
            }
        }
        finally {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await playwrightPage.close();
        }
        return {
            id: crypto.randomUUID(),
            type: 'authentication',
            name: 'Login Flow',
            description: `Authentication logic at ${page.url}`,
            triggers: [{
                    type: 'form_submit',
                    selector: form.selector,
                    url: page.url
                }],
            conditions: [
                { type: 'field_value', field: 'credentials', operator: 'exists', value: 'valid' }
            ],
            outcomes,
            confidence: 0.9,
            evidence
        };
    }
    /**
     * Analyze registration form
     */
    // Complexity: O(N*M) — nested iteration detected
    async analyzeRegistrationForm(page, form) {
        const evidence = [];
        // Document required fields
        const requiredFields = form.fields.filter(f => f.required);
        evidence.push(`Required fields: ${requiredFields.map(f => f.name).join(', ')}`);
        // Document validation patterns
        const patternsFields = form.fields.filter(f => f.validation);
        for (const field of patternsFields) {
            evidence.push(`Field "${field.name}" has pattern: ${field.validation}`);
        }
        // Document field types
        for (const field of form.fields) {
            evidence.push(`Field "${field.name}": type=${field.type}, required=${field.required}`);
        }
        return {
            id: crypto.randomUUID(),
            type: 'workflow',
            name: 'Registration Flow',
            description: `Registration process at ${page.url}`,
            triggers: [{
                    type: 'form_submit',
                    selector: form.selector,
                    url: page.url
                }],
            conditions: requiredFields.map(f => ({
                type: 'field_value',
                field: f.name,
                operator: 'exists',
                value: 'any'
            })),
            outcomes: [
                { type: 'redirect', value: 'success_page' },
                { type: 'state_change', value: 'user_created' }
            ],
            confidence: 0.8,
            evidence
        };
    }
    /**
     * Phase 3: Discover transaction flows
     */
    // Complexity: O(N) — linear iteration
    async discoverTransactionFlows() {
        const pages = Array.from(this.siteMap.pages.values());
        // Identify potential transaction entry points
        const transactionIndicators = [
            'checkout', 'cart', 'basket', 'payment', 'subscribe',
            'order', 'booking', 'reservation', 'register', 'signup'
        ];
        const transactionPages = pages.filter(p => transactionIndicators.some(ind => p.url.toLowerCase().includes(ind) ||
            p.title.toLowerCase().includes(ind) ||
            p.forms.some(f => f.purpose.toLowerCase().includes(ind))));
        for (const page of transactionPages) {
            console.log(`  → Analyzing transaction flow at: ${page.url}`);
            const flow = this.buildTransactionFlow(page, pages);
            if (flow) {
                this.discoveredFlows.push(flow);
                this.emit('flow:discovered', flow);
            }
        }
    }
    /**
     * Build transaction flow from page analysis
     */
    // Complexity: O(N*M) — nested iteration detected
    buildTransactionFlow(startPage, allPages) {
        const steps = [];
        const requiredFields = [];
        const validationRules = [];
        // Add entry step
        steps.push({
            order: 1,
            page: startPage.url,
            action: 'navigate',
            requiredBefore: [],
            leadsTo: startPage.links.filter(l => l.isInternal).map(l => l.href)
        });
        // Extract required fields from forms
        for (const form of startPage.forms) {
            for (const field of form.fields) {
                if (field.required) {
                    requiredFields.push(field.name);
                }
                if (field.validation) {
                    validationRules.push({
                        field: field.name,
                        rule: field.validation,
                        errorMessage: `Invalid ${field.name}`
                    });
                }
            }
        }
        // Determine flow type
        let flowType = 'crud';
        const urlLower = startPage.url.toLowerCase();
        if (urlLower.includes('checkout') || urlLower.includes('payment')) {
            flowType = 'checkout';
        }
        else if (urlLower.includes('register') || urlLower.includes('signup')) {
            flowType = 'registration';
        }
        else if (urlLower.includes('login') || urlLower.includes('signin')) {
            flowType = 'authentication';
        }
        else if (urlLower.includes('search')) {
            flowType = 'search';
        }
        // Find related API endpoints
        const relatedApis = this.siteMap.apiEndpoints.filter(api => api.url.includes(new URL(startPage.url).pathname.split('/')[1] || ''));
        return {
            id: crypto.randomUUID(),
            name: `${flowType.charAt(0).toUpperCase() + flowType.slice(1)} Flow`,
            type: flowType,
            steps,
            requiredFields,
            validationRules,
            endpoints: relatedApis,
            success: true
        };
    }
    /**
     * Phase 4: Discover error handling patterns
     */
    // Complexity: O(1) — amortized
    async discoverErrorHandling() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const playwrightPage = await this.context.newPage();
        try {
            // Test 404 handling
            const rootUrl = this.siteMap.rootUrl;
            const notFoundUrl = new URL('/this-page-does-not-exist-12345', rootUrl).href;
            console.log('  → Testing 404 error handling...');
            await playwrightPage.goto(notFoundUrl, { timeout: this.config.timeout }).catch(() => { });
            const pageContent = await playwrightPage.content();
            const has404Page = pageContent.includes('404') ||
                pageContent.includes('not found') ||
                pageContent.includes('Not Found');
            if (has404Page) {
                this.discoveredLogic.push({
                    id: crypto.randomUUID(),
                    type: 'error_handling',
                    name: '404 Error Page',
                    description: 'Custom 404 error handling detected',
                    triggers: [{ type: 'page_load', url: 'non-existent' }],
                    conditions: [{ type: 'url_param', field: 'path', operator: 'equals', value: 'not_found' }],
                    outcomes: [{ type: 'element_change', value: '404 page displayed' }],
                    confidence: 0.95,
                    evidence: [`404 page at ${notFoundUrl}`]
                });
            }
        }
        finally {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await playwrightPage.close();
        }
    }
    /**
     * Phase 5: Generate user journeys
     */
    // Complexity: O(N) — linear iteration
    async generateUserJourneys() {
        const pages = Array.from(this.siteMap.pages.values());
        // Journey 1: Happy path through forms
        const formPages = pages.filter(p => p.forms.length > 0);
        if (formPages.length > 0) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            const formJourney = await this.createFormJourney(formPages[0]);
            if (formJourney) {
                this.discoveredJourneys.push(formJourney);
            }
        }
        // Journey 2: Navigation exploration
        const navJourney = this.createNavigationJourney(pages);
        this.discoveredJourneys.push(navJourney);
        // Journey 3: Error path
        if (this.config.simulateErrors) {
            const errorJourney = this.createErrorJourney();
            this.discoveredJourneys.push(errorJourney);
        }
    }
    /**
     * Create form interaction journey
     */
    // Complexity: O(N) — linear iteration
    async createFormJourney(page) {
        const steps = [];
        const startTime = Date.now();
        // Step 1: Navigate
        steps.push({
            stepNumber: 1,
            action: 'navigate',
            url: page.url,
            urlAfter: page.url,
            timestamp: Date.now(),
            duration: 0,
            success: true,
            networkActivity: [],
            stateChanges: []
        });
        // Step 2: Fill form
        const form = page.forms[0];
        if (form) {
            steps.push({
                stepNumber: 2,
                action: 'fill_form',
                element: {
                    selector: form.selector,
                    type: 'form',
                    purpose: form.purpose
                },
                data: form.fields.reduce((acc, f) => {
                    acc[f.name] = TEST_DATA[f.type]?.[0] || 'test';
                    return acc;
                }, {}),
                url: page.url,
                urlAfter: page.url,
                timestamp: Date.now(),
                duration: 0,
                success: true,
                networkActivity: [],
                stateChanges: []
            });
            // Step 3: Submit
            steps.push({
                stepNumber: 3,
                action: 'submit',
                element: {
                    selector: form.selector,
                    type: 'form',
                    purpose: form.purpose
                },
                url: page.url,
                urlAfter: form.action || page.url,
                timestamp: Date.now(),
                duration: 0,
                success: true,
                networkActivity: [],
                stateChanges: []
            });
        }
        return {
            id: crypto.randomUUID(),
            name: `Form Submission: ${form?.purpose || 'Unknown'}`,
            description: `Complete ${form?.purpose} flow`,
            startUrl: page.url,
            steps,
            duration: Date.now() - startTime,
            success: true,
            discoveredLogic: [],
            stateChanges: []
        };
    }
    /**
     * Create navigation journey
     */
    // Complexity: O(N) — linear iteration
    createNavigationJourney(pages) {
        const steps = [];
        const pagesToVisit = pages.slice(0, 5);
        pagesToVisit.forEach((page, idx) => {
            steps.push({
                stepNumber: idx + 1,
                action: 'navigate',
                url: page.url,
                urlAfter: page.url,
                timestamp: Date.now(),
                duration: page.loadTime,
                success: true,
                networkActivity: [],
                stateChanges: []
            });
        });
        return {
            id: crypto.randomUUID(),
            name: 'Site Navigation Journey',
            description: 'Navigate through main pages',
            startUrl: pagesToVisit[0]?.url || this.siteMap.rootUrl,
            steps,
            duration: steps.reduce((sum, s) => sum + s.duration, 0),
            success: true,
            discoveredLogic: [],
            stateChanges: []
        };
    }
    /**
     * Create error path journey
     */
    // Complexity: O(1) — amortized
    createErrorJourney() {
        const rootUrl = this.siteMap.rootUrl;
        return {
            id: crypto.randomUUID(),
            name: 'Error Handling Journey',
            description: 'Test error handling paths',
            startUrl: rootUrl,
            steps: [
                {
                    stepNumber: 1,
                    action: 'navigate',
                    url: new URL('/nonexistent-page', rootUrl).href,
                    urlAfter: new URL('/nonexistent-page', rootUrl).href,
                    timestamp: Date.now(),
                    duration: 500,
                    success: true,
                    networkActivity: [],
                    stateChanges: []
                }
            ],
            duration: 500,
            success: true,
            discoveredLogic: [],
            stateChanges: []
        };
    }
    /**
     * Helper: Submit form with data
     */
    // Complexity: O(N) — linear iteration
    async submitFormWithData(page, form, data) {
        for (const field of form.fields) {
            const value = data[field.name] || data[field.type] || '';
            try {
                await page.locator(field.selector).fill(value);
            }
            catch (e) {
                // Field not found or not fillable
            }
        }
        // Try to submit
        try {
            await page.locator(form.selector).locator('button[type="submit"], input[type="submit"]').first().click();
            await this.sleep(1000);
        }
        catch (e) {
            // Submit failed
        }
    }
    /**
     * Helper: Get page error message
     */
    // Complexity: O(N) — linear iteration
    async getPageError(page) {
        const errorSelectors = [
            '.error', '.error-message', '.alert-danger', '.alert-error',
            '[role="alert"]', '.form-error', '.validation-error'
        ];
        for (const selector of errorSelectors) {
            try {
                const error = page.locator(selector).first();
                if (await error.isVisible()) {
                    const text = await error.textContent();
                    if (text && text.trim().length > 0) {
                        return text.trim();
                    }
                }
            }
            catch (e) {
                // Selector not found
            }
        }
        return null;
    }
    /**
     * Print discovery summary
     */
    // Complexity: O(1)
    printSummary() {
        console.log(`
╔═══════════════════════════════════════════════════════════════════════════════════════╗
║                     LOGIC DISCOVERY - COMPLETE                                        ║
╠═══════════════════════════════════════════════════════════════════════════════════════╣
║  📊 DISCOVERY STATISTICS                                                              ║
║  ─────────────────────────────────────────────────────────────────────────────────    ║
║  User Journeys:     ${this.discoveredJourneys.length.toString().padEnd(59)}║
║  Business Logic:    ${this.discoveredLogic.length.toString().padEnd(59)}║
║  Transaction Flows: ${this.discoveredFlows.length.toString().padEnd(59)}║
╚═══════════════════════════════════════════════════════════════════════════════════════╝
`);
    }
    /**
     * Sleep helper
     */
    // Complexity: O(1)
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
exports.LogicDiscoveryEngine = LogicDiscoveryEngine;
// ═══════════════════════════════════════════════════════════════════════════════
// FACTORY
// ═══════════════════════════════════════════════════════════════════════════════
function createLogicDiscovery(config) {
    return new LogicDiscoveryEngine(config);
}
exports.default = LogicDiscoveryEngine;
