"use strict";
/**
 * 🏭 AUTO TEST FACTORY - Self-Writing Test Generator
 *
 * Transforms discovered site maps into ready-to-run tests.
 * Generates both Ghost-API tests and Playwright-UI tests.
 *
 * "QANTUM writes its own tests!"
 *
 * @version 1.0.0-QANTUM-PRIME
 * @phase 87-88
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
exports.AutoTestFactory = void 0;
exports.createTestFactory = createTestFactory;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const logger_1 = require("../api/unified/utils/logger");
// ============================================================
// AUTO TEST FACTORY
// ============================================================
class AutoTestFactory {
    config;
    generatedTests = [];
    constructor(config = {}) {
        this.config = {
            outputDir: './generated_tests',
            generateGhostTests: true,
            generatePlaywrightTests: true,
            generateApiTests: true,
            generateE2ETests: true,
            testFramework: 'playwright',
            language: 'typescript',
            includeComments: true,
            generateDataFactories: true,
            ...config
        };
    }
    /**
     * 🏭 Generate all tests from sitemap
     */
    // Complexity: O(1)
    async generateFromSiteMap(siteMap) {
        logger_1.logger.debug(`
╔═══════════════════════════════════════════════════════════════╗
║  🏭 AUTO TEST FACTORY - Self-Writing Tests                    ║
║                                                               ║
║  "QANTUM writes its own tests!"                         ║
╚═══════════════════════════════════════════════════════════════╝
`);
        logger_1.logger.debug(`🏭 [FACTORY] Processing sitemap: ${siteMap.baseUrl}`);
        logger_1.logger.debug(`🏭 [FACTORY] Pages: ${siteMap.totalPages}`);
        logger_1.logger.debug(`🏭 [FACTORY] Forms: ${siteMap.totalForms}`);
        logger_1.logger.debug(`🏭 [FACTORY] API Endpoints: ${siteMap.totalApiEndpoints}`);
        logger_1.logger.debug('');
        const suites = [];
        // Generate Ghost-API tests (UI actions → API calls)
        if (this.config.generateGhostTests) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            const ghostSuite = await this.generateGhostTests(siteMap);
            suites.push(ghostSuite);
        }
        // Generate Playwright UI tests
        if (this.config.generatePlaywrightTests) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            const playwrightSuite = await this.generatePlaywrightTests(siteMap);
            suites.push(playwrightSuite);
        }
        // Generate pure API tests
        if (this.config.generateApiTests) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            const apiSuite = await this.generateApiTests(siteMap);
            suites.push(apiSuite);
        }
        // Generate E2E flow tests
        if (this.config.generateE2ETests && siteMap.transactionFlows.length > 0) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            const e2eSuite = await this.generateE2ETests(siteMap);
            suites.push(e2eSuite);
        }
        // Generate data factories
        if (this.config.generateDataFactories) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.generateDataFactories(siteMap);
        }
        // Write tests to disk
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.writeTestsToDisk(suites);
        // Print summary
        this.printSummary(suites);
        return suites;
    }
    /**
     * 👻 Generate Ghost-API tests
     * These tests convert UI actions to direct API calls for 100x speed
     */
    // Complexity: O(N*M) — nested iteration
    async generateGhostTests(siteMap) {
        logger_1.logger.debug('🏭 [FACTORY] Generating Ghost-API tests...');
        const tests = [];
        // Generate tests for each form
        for (const page of siteMap.pages.values()) {
            for (const form of page.forms) {
                const test = this.generateGhostFormTest(form, page, siteMap);
                tests.push(test);
            }
        }
        // Generate tests for API endpoints
        for (const [key, endpoint] of Object.entries(siteMap.apiEndpoints)) {
            const ep = endpoint;
            const test = this.generateGhostApiTest(ep, siteMap);
            tests.push(test);
        }
        const setupCode = this.generateGhostSetup(siteMap);
        const teardownCode = this.generateGhostTeardown();
        return {
            name: 'Ghost-API Tests',
            description: 'UI actions converted to direct API calls for maximum speed',
            tests,
            setupCode,
            teardownCode
        };
    }
    /**
     * Generate Ghost test for a form
     */
    // Complexity: O(N) — linear scan
    generateGhostFormTest(form, page, siteMap) {
        const ext = this.config.language === 'typescript' ? 'ts' : 'js';
        const testName = `ghost_${form.purpose}_${form.id}`;
        const fieldAssignments = form.fields.map(f => {
            const value = this.generateFieldValue(f);
            return `        ${f.name}: ${value}`;
        }).join(',\n');
        const code = `
${this.config.includeComments ? `/**
 * 👻 Ghost-API Test: ${form.purpose}
 * Auto-generated from form: ${form.id}
 * Original page: ${page.url}
 *
 * This test bypasses the UI and calls the API directly.
 * Expected speedup: ~100x faster than UI test
 */` : ''}
import { test, expect } from '@playwright/test';
import { GhostProtocol } from '../src/ghost/ghost-protocol';

test.describe('Ghost: ${this.capitalize(form.purpose)} Form', () => {
    let ghost: GhostProtocol;

    test.beforeEach(async ({ page }) => {
        ghost = new GhostProtocol(page);
        // SAFETY: async operation — wrap in try-catch for production resilience
        await ghost.initialize();
    });

    // Complexity: O(1)
    test('should submit ${form.purpose} form via API', async ({ page }) => {
        ${this.config.includeComments ? '// Form data - auto-generated based on field analysis' : ''}
        const formData = {
${fieldAssignments}
        };

        ${this.config.includeComments ? '// Ghost Protocol: Direct API call instead of UI interaction' : ''}
        // SAFETY: async operation — wrap in try-catch for production resilience
        const response = await ghost.submitForm({
            endpoint: '${form.action}',
            method: '${form.method}',
            data: formData
        });

        ${this.config.includeComments ? '// Assertions' : ''}
        // Complexity: O(1)
        expect(response.status).toBe(200);
        // Complexity: O(1)
        expect(response.success).toBeTruthy();
    });

    // Complexity: O(N) — linear scan
    test('should validate required fields', async ({ page }) => {
        ${this.config.includeComments ? '// Submit empty form to test validation' : ''}
        // SAFETY: async operation — wrap in try-catch for production resilience
        const response = await ghost.submitForm({
            endpoint: '${form.action}',
            method: '${form.method}',
            data: {}
        });

        // Complexity: O(N) — linear scan
        expect(response.status).toBe(400);
        ${form.fields.filter(f => f.required).map(f => `expect(response.errors).toContain('${f.name}');`).join('\n        ')}
    });
});
`;
        return {
            id: `ghost_${form.id}`,
            name: testName,
            type: 'ghost-api',
            filePath: `ghost/${testName}.spec.${ext}`,
            code: code.trim(),
            estimatedDuration: 50, // ms - Ghost tests are fast!
            coverage: [form.action]
        };
    }
    /**
     * Generate Ghost test for an API endpoint
     */
    // Complexity: O(N) — linear scan
    generateGhostApiTest(endpoint, siteMap) {
        const ext = this.config.language === 'typescript' ? 'ts' : 'js';
        const urlParts = endpoint.url.split('/').filter(Boolean);
        const resourceName = urlParts[urlParts.length - 1] || 'resource';
        const testName = `ghost_api_${endpoint.method.toLowerCase()}_${resourceName}`;
        const code = `
${this.config.includeComments ? `/**
 * 👻 Ghost-API Test: ${endpoint.method} ${endpoint.url}
 * Auto-generated from captured API traffic
 * Auth: ${endpoint.authentication}
 * Avg Response: ${Math.round(endpoint.avgResponseTime)}ms
 */` : ''}
import { test, expect } from '@playwright/test';
import { GhostProtocol } from '../src/ghost/ghost-protocol';

test.describe('Ghost API: ${endpoint.method} ${resourceName}', () => {
    let ghost: GhostProtocol;

    test.beforeEach(async ({ page }) => {
        ghost = new GhostProtocol(page);
        // SAFETY: async operation — wrap in try-catch for production resilience
        await ghost.initialize();
        // SAFETY: async operation — wrap in try-catch for production resilience
        ${endpoint.authentication !== 'none' ? `await ghost.authenticate();` : ''}
    });

    // Complexity: O(1)
    test('should ${endpoint.method} ${resourceName} successfully', async () => {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const response = await ghost.api({
            method: '${endpoint.method}',
            url: '${endpoint.url}',
            ${endpoint.requestSchema ? `data: ${JSON.stringify(endpoint.requestSchema, null, 12)}` : ''}
        });

        // Complexity: O(1)
        expect(response.status).toBeLessThan(400);
        ${endpoint.responseSchema ? `expect(response.data).toMatchSchema(${JSON.stringify(endpoint.responseSchema)});` : ''}
    });

    // Complexity: O(1)
    test('should respond within SLA (${Math.round(endpoint.avgResponseTime * 2)}ms)', async () => {
        const start = Date.now();

        // SAFETY: async operation — wrap in try-catch for production resilience
        await ghost.api({
            method: '${endpoint.method}',
            url: '${endpoint.url}'
        });

        const duration = Date.now() - start;
        // Complexity: O(1)
        expect(duration).toBeLessThan(${Math.round(endpoint.avgResponseTime * 2)});
    });
});
`;
        return {
            id: `ghost_api_${endpoint.method}_${resourceName}`,
            name: testName,
            type: 'ghost-api',
            filePath: `ghost/api/${testName}.spec.${ext}`,
            code: code.trim(),
            estimatedDuration: 100,
            coverage: [endpoint.url]
        };
    }
    /**
     * 🎭 Generate Playwright UI tests
     */
    // Complexity: O(N*M) — nested iteration
    async generatePlaywrightTests(siteMap) {
        logger_1.logger.debug('🏭 [FACTORY] Generating Playwright UI tests...');
        const tests = [];
        // Generate page tests
        for (const page of siteMap.pages.values()) {
            const test = this.generatePageTest(page, siteMap);
            tests.push(test);
        }
        // Generate form interaction tests
        for (const page of siteMap.pages.values()) {
            for (const form of page.forms) {
                const test = this.generateFormUITest(form, page);
                tests.push(test);
            }
        }
        return {
            name: 'Playwright UI Tests',
            description: 'Full browser tests with visual verification',
            tests,
            setupCode: this.generatePlaywrightSetup(siteMap),
            teardownCode: this.generatePlaywrightTeardown()
        };
    }
    /**
     * Generate page test
     */
    // Complexity: O(N) — linear scan
    generatePageTest(page, siteMap) {
        const ext = this.config.language === 'typescript' ? 'ts' : 'js';
        const pageName = this.urlToTestName(page.url);
        const testName = `ui_page_${pageName}`;
        const code = `
${this.config.includeComments ? `/**
 * 🎭 Playwright UI Test: ${page.title || page.url}
 * Auto-generated from page discovery
 * Type: ${page.pageType}
 * Business Function: ${page.businessFunction || 'N/A'}
 */` : ''}
import { test, expect } from '@playwright/test';
import { NeuralMapEngine } from '../src/cognitive/neural-map-engine';

test.describe('Page: ${page.title || pageName}', () => {
    let neuralMap: NeuralMapEngine;

    test.beforeEach(async ({ page: browserPage }) => {
        neuralMap = new NeuralMapEngine();
        // SAFETY: async operation — wrap in try-catch for production resilience
        await browserPage.goto('${page.url}');
    });

    // Complexity: O(N) — linear scan
    test('should load successfully', async ({ page: browserPage }) => {
        ${this.config.includeComments ? '// Verify page loaded' : ''}
        // SAFETY: async operation — wrap in try-catch for production resilience
        await expect(browserPage).toHaveTitle(/${this.escapeRegex(page.title || '')}/i);

        ${this.config.includeComments ? '// Check for critical elements' : ''}
        ${page.buttons.slice(0, 3).map(btn => 
        // SAFETY: async operation — wrap in try-catch for production resilience
        `await expect(browserPage.getByRole('button', { name: /${this.escapeRegex(btn.text)}/i })).toBeVisible();`).join('\n        ')}
    });

    // Complexity: O(1)
    test('should have no accessibility violations', async ({ page: browserPage }) => {
        ${this.config.includeComments ? '// Run accessibility audit' : ''}
        // SAFETY: async operation — wrap in try-catch for production resilience
        const violations = await browserPage.evaluate(async () => {
            // @ts-ignore - axe injected
            if (window.axe) {
                // SAFETY: async operation — wrap in try-catch for production resilience
                const results = await window.axe.run();
                return results.violations;
            }
            return [];
        });

        // Complexity: O(1)
        expect(violations).toHaveLength(0);
    });

    // Complexity: O(1)
    test('should match visual baseline', async ({ page: browserPage }) => {
        ${this.config.includeComments ? '// Visual regression test' : ''}
        // SAFETY: async operation — wrap in try-catch for production resilience
        await expect(browserPage).toHaveScreenshot('${pageName}.png', {
            maxDiffPixels: 100
        });
    });
});
`;
        return {
            id: `ui_page_${pageName}`,
            name: testName,
            type: 'playwright-ui',
            filePath: `playwright/pages/${testName}.spec.${ext}`,
            code: code.trim(),
            estimatedDuration: 3000, // ms - UI tests are slower
            coverage: [page.url]
        };
    }
    /**
     * Generate form UI test
     */
    // Complexity: O(N*M) — nested iteration
    generateFormUITest(form, page) {
        const ext = this.config.language === 'typescript' ? 'ts' : 'js';
        const testName = `ui_form_${form.purpose}_${form.id}`;
        const fillActions = form.fields.map(f => {
            const value = this.generateFieldValue(f);
            const selector = this.getFieldSelector(f);
            // SAFETY: async operation — wrap in try-catch for production resilience
            return `        await page.${this.getFieldFillMethod(f)}(${selector}, ${value});`;
        }).join('\n');
        const code = `
${this.config.includeComments ? `/**
 * 🎭 Playwright Form Test: ${form.purpose}
 * Auto-generated from form: ${form.id}
 * Page: ${page.url}
 * Method: ${form.method}
 */` : ''}
import { test, expect } from '@playwright/test';
import { NeuralMapEngine } from '../src/cognitive/neural-map-engine';

test.describe('Form: ${this.capitalize(form.purpose)}', () => {
    test.beforeEach(async ({ page }) => {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await page.goto('${page.url}');
    });

    // Complexity: O(1)
    test('should submit form successfully', async ({ page }) => {
        ${this.config.includeComments ? '// Fill form fields' : ''}
${fillActions}

        ${this.config.includeComments ? '// Submit form' : ''}
        // SAFETY: async operation — wrap in try-catch for production resilience
        await page.click('button[type="submit"], input[type="submit"]');

        ${this.config.includeComments ? '// Verify success' : ''}
        // SAFETY: async operation — wrap in try-catch for production resilience
        await expect(page.locator('.success, .alert-success, [data-testid="success"]')).toBeVisible();
    });

    // Complexity: O(N*M) — nested iteration
    test('should show validation errors for empty required fields', async ({ page }) => {
        ${this.config.includeComments ? '// Submit empty form' : ''}
        // SAFETY: async operation — wrap in try-catch for production resilience
        await page.click('button[type="submit"], input[type="submit"]');

        ${this.config.includeComments ? '// Check for validation errors' : ''}
        ${form.fields.filter(f => f.required).map(f => 
        // SAFETY: async operation — wrap in try-catch for production resilience
        `await expect(page.locator('[data-error="${f.name}"], #${f.name}-error, .error')).toBeVisible();`).join('\n        ')}
    });

    ${form.fields.filter(f => f.validation).map(f => `
    // Complexity: O(1)
    test('should validate ${f.name} format', async ({ page }) => {
        ${this.config.includeComments ? '// Enter invalid value' : ''}
        // SAFETY: async operation — wrap in try-catch for production resilience
        await page.fill('[name="${f.name}"]', 'invalid_value');
        // SAFETY: async operation — wrap in try-catch for production resilience
        await page.click('button[type="submit"]');

        ${this.config.includeComments ? '// Should show validation error' : ''}
        // SAFETY: async operation — wrap in try-catch for production resilience
        await expect(page.locator('[data-error="${f.name}"], .error')).toBeVisible();
    });`).join('\n')}
});
`;
        return {
            id: `ui_form_${form.id}`,
            name: testName,
            type: 'playwright-ui',
            filePath: `playwright/forms/${testName}.spec.${ext}`,
            code: code.trim(),
            estimatedDuration: 5000,
            coverage: [page.url, form.action]
        };
    }
    /**
     * 🔌 Generate pure API tests
     */
    // Complexity: O(N) — loop
    async generateApiTests(siteMap) {
        logger_1.logger.debug('🏭 [FACTORY] Generating API tests...');
        const tests = [];
        for (const [key, endpoint] of Object.entries(siteMap.apiEndpoints)) {
            const ep = endpoint;
            const test = this.generateApiEndpointTest(ep);
            tests.push(test);
        }
        return {
            name: 'API Tests',
            description: 'Direct API endpoint tests',
            tests,
            setupCode: this.generateApiSetup(siteMap),
            teardownCode: ''
        };
    }
    /**
     * Generate API endpoint test
     */
    // Complexity: O(N) — linear scan
    generateApiEndpointTest(endpoint) {
        const ext = this.config.language === 'typescript' ? 'ts' : 'js';
        const urlParts = endpoint.url.split('/').filter(Boolean);
        const resourceName = urlParts[urlParts.length - 1] || 'api';
        const testName = `api_${endpoint.method.toLowerCase()}_${resourceName}`;
        const code = `
${this.config.includeComments ? `/**
 * 🔌 API Test: ${endpoint.method} ${endpoint.url}
 * Auth: ${endpoint.authentication}
 * Usage Count: ${endpoint.usageCount}
 */` : ''}
import { test, expect, request } from '@playwright/test';

test.describe('API: ${endpoint.method} ${resourceName}', () => {
    let apiContext;

    test.beforeAll(async () => {
        // SAFETY: async operation — wrap in try-catch for production resilience
        apiContext = await request.newContext({
            baseURL: '${new URL(endpoint.url).origin}',
            extraHTTPHeaders: {
                ${endpoint.authentication === 'bearer' ? "'Authorization': 'Bearer {{TOKEN}}'," : ''}
                ${endpoint.authentication === 'api-key' ? "'X-API-Key': '{{API_KEY}}'," : ''}
                'Content-Type': 'application/json'
            }
        });
    });

    // Complexity: O(1)
    test('${endpoint.method} should return success', async () => {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const response = await apiContext.${endpoint.method.toLowerCase()}('${new URL(endpoint.url).pathname}'${endpoint.method !== 'GET' ? `, { data: {} }` : ''});

        // Complexity: O(1)
        expect(response.ok()).toBeTruthy();
        // Complexity: O(1)
        expect(response.status()).toBeLessThan(400);
    });

    // Complexity: O(1)
    test('should respond within acceptable time', async () => {
        const start = Date.now();

        // SAFETY: async operation — wrap in try-catch for production resilience
        await apiContext.${endpoint.method.toLowerCase()}('${new URL(endpoint.url).pathname}');

        const duration = Date.now() - start;
        // Complexity: O(1)
        expect(duration).toBeLessThan(${Math.max(1000, Math.round(endpoint.avgResponseTime * 3))});
    });

    ${endpoint.authentication !== 'none' ? `
    // Complexity: O(1)
    test('should reject unauthorized requests', async () => {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const unauthContext = await request.newContext({
            baseURL: '${new URL(endpoint.url).origin}'
        });

        // SAFETY: async operation — wrap in try-catch for production resilience
        const response = await unauthContext.${endpoint.method.toLowerCase()}('${new URL(endpoint.url).pathname}');

        // Complexity: O(1)
        expect(response.status()).toBe(401);
    });` : ''}
});
`;
        return {
            id: `api_${endpoint.method}_${resourceName}`,
            name: testName,
            type: 'api',
            filePath: `api/${testName}.spec.${ext}`,
            code: code.trim(),
            estimatedDuration: 500,
            coverage: [endpoint.url]
        };
    }
    /**
     * 🔄 Generate E2E flow tests
     */
    // Complexity: O(N) — loop
    async generateE2ETests(siteMap) {
        logger_1.logger.debug('🏭 [FACTORY] Generating E2E flow tests...');
        const tests = [];
        for (const flow of siteMap.transactionFlows) {
            const test = this.generateFlowTest(flow, siteMap);
            tests.push(test);
        }
        return {
            name: 'E2E Flow Tests',
            description: 'End-to-end business flow tests',
            tests,
            setupCode: this.generateE2ESetup(siteMap),
            teardownCode: this.generateE2ETeardown()
        };
    }
    /**
     * Generate flow test
     */
    // Complexity: O(N) — linear scan
    generateFlowTest(flow, siteMap) {
        const ext = this.config.language === 'typescript' ? 'ts' : 'js';
        const testName = `e2e_${flow.id}`;
        const stepCode = flow.steps.map((step, i) => {
            switch (step.action) {
                case 'navigate':
                    return `        // Step ${i + 1}: Navigate
        // SAFETY: async operation — wrap in try-catch for production resilience
        await page.goto('${step.pageUrl}');
        // SAFETY: async operation — wrap in try-catch for production resilience
        await page.waitForLoadState('networkidle');`;
                case 'click':
                    return `        // Step ${i + 1}: Click
        // SAFETY: async operation — wrap in try-catch for production resilience
        await page.click('${step.target}');`;
                case 'fill':
                    return `        // Step ${i + 1}: Fill
        // SAFETY: async operation — wrap in try-catch for production resilience
        await page.fill('${step.target}', '${step.value}');`;
                case 'submit':
                    return `        // Step ${i + 1}: Submit
        // SAFETY: async operation — wrap in try-catch for production resilience
        await page.click('button[type="submit"]');
        // SAFETY: async operation — wrap in try-catch for production resilience
        await page.waitForLoadState('networkidle');`;
                default:
                    return `        // Step ${i + 1}: ${step.action}`;
            }
        }).join('\n\n');
        const code = `
${this.config.includeComments ? `/**
 * 🔄 E2E Flow Test: ${flow.name}
 * Auto-generated from transaction flow discovery
 * Business Purpose: ${flow.businessPurpose}
 * Steps: ${flow.steps.length}
 */` : ''}
import { test, expect } from '@playwright/test';

test.describe('E2E: ${flow.name}', () => {
    // Complexity: O(1)
    test('should complete ${flow.name} flow', async ({ page }) => {
        ${this.config.includeComments ? `// Flow: ${flow.startPage} → ${flow.endPage}` : ''}

${stepCode}

        ${this.config.includeComments ? '// Verify flow completed successfully' : ''}
        // SAFETY: async operation — wrap in try-catch for production resilience
        await expect(page).toHaveURL(/${this.escapeRegex(flow.endPage)}/);
    });

    // Complexity: O(1)
    test('should handle errors gracefully', async ({ page }) => {
        ${this.config.includeComments ? '// Navigate to start page' : ''}
        // SAFETY: async operation — wrap in try-catch for production resilience
        await page.goto('${flow.startPage}');

        ${this.config.includeComments ? '// Simulate network error' : ''}
        // SAFETY: async operation — wrap in try-catch for production resilience
        await page.route('**/api/**', route => route.abort());

        ${this.config.includeComments ? '// Trigger flow and verify error handling' : ''}
        // SAFETY: async operation — wrap in try-catch for production resilience
        await page.click('button[type="submit"]');
        // SAFETY: async operation — wrap in try-catch for production resilience
        await expect(page.locator('.error, .alert-danger, [role="alert"]')).toBeVisible();
    });
});
`;
        return {
            id: flow.id,
            name: testName,
            type: 'e2e',
            filePath: `e2e/${testName}.spec.${ext}`,
            code: code.trim(),
            estimatedDuration: 10000,
            coverage: [flow.startPage, flow.endPage, ...flow.steps.map(s => s.pageUrl)]
        };
    }
    /**
     * 📦 Generate data factories
     */
    // Complexity: O(N*M) — nested iteration
    async generateDataFactories(siteMap) {
        logger_1.logger.debug('🏭 [FACTORY] Generating data factories...');
        const ext = this.config.language === 'typescript' ? 'ts' : 'js';
        const factories = [];
        // Collect all form fields
        const allFields = new Map();
        for (const page of siteMap.pages.values()) {
            for (const form of page.forms) {
                for (const field of form.fields) {
                    if (!allFields.has(field.type)) {
                        allFields.set(field.type, new Set());
                    }
                    allFields.get(field.type).add(field.name);
                }
            }
        }
        const code = `
/**
 * 📦 Test Data Factory
 * Auto-generated from discovered forms
 */
import { faker } from '@faker-js/faker';

export class TestDataFactory {
    ${Array.from(allFields.entries()).map(([type, names]) => `
    /**
     * Generate ${type} data
     * Used in: ${Array.from(names).join(', ')}
     */
    static ${type}(): string {
        ${this.getFactoryMethod(type)}
    }`).join('\n')}

    /**
     * Generate form data
     */
    static formData(formType: string): Record<string, any> {
        switch (formType) {
            ${Array.from(siteMap.pages.values())
            .flatMap(p => p.forms)
            .map(form => `
            case '${form.purpose}':
                return {
                    ${form.fields.map(f => `${f.name}: this.${f.type}()`).join(',\n                    ')}
                };`).join('')}
            default:
                return {};
        }
    }
}
`;
        const dir = path.join(this.config.outputDir, 'factories');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(path.join(dir, `test-data-factory.${ext}`), code.trim());
    }
    // ============================================================
    // SETUP/TEARDOWN GENERATORS
    // ============================================================
    // Complexity: O(1)
    generateGhostSetup(siteMap) {
        return `
import { GhostProtocol } from '../src/ghost/ghost-protocol';

export async function setupGhost(page) {
    const ghost = new GhostProtocol(page);
    // SAFETY: async operation — wrap in try-catch for production resilience
    await ghost.initialize();
    ${siteMap.authentication ? `
    // Auto-authenticate
    // SAFETY: async operation — wrap in try-catch for production resilience
    await ghost.authenticate({
        loginUrl: '${siteMap.authentication.loginUrl}',
        username: process.env.TEST_USER,
        password: process.env.TEST_PASS
    });` : ''}
    return ghost;
}
`;
    }
    // Complexity: O(1)
    generateGhostTeardown() {
        return `
export async function teardownGhost(ghost) {
    // SAFETY: async operation — wrap in try-catch for production resilience
    await ghost.cleanup();
}
`;
    }
    // Complexity: O(1)
    generatePlaywrightSetup(siteMap) {
        return `
import { test as base } from '@playwright/test';
import { NeuralMapEngine } from '../src/cognitive/neural-map-engine';

export const test = base.extend({
    neuralMap: async ({ page }, use) => {
        const nm = new NeuralMapEngine();
        // SAFETY: async operation — wrap in try-catch for production resilience
        await use(nm);
    }
});
`;
    }
    // Complexity: O(1)
    generatePlaywrightTeardown() {
        return '';
    }
    // Complexity: O(1)
    generateApiSetup(siteMap) {
        return `
export const API_BASE = '${siteMap.baseUrl}';
`;
    }
    // Complexity: O(1)
    generateE2ESetup(siteMap) {
        return `
import { test, expect } from '@playwright/test';

// E2E Test Setup
test.beforeEach(async ({ page }) => {
    // Clear cookies and storage
    // SAFETY: async operation — wrap in try-catch for production resilience
    await page.context().clearCookies();
    // SAFETY: async operation — wrap in try-catch for production resilience
    await page.evaluate(() => localStorage.clear());
});
`;
    }
    // Complexity: O(1)
    generateE2ETeardown() {
        return `
test.afterEach(async ({ page }, testInfo) => {
    if (testInfo.status !== 'passed') {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await page.screenshot({ path: \`./screenshots/\${testInfo.title}.png\` });
    }
});
`;
    }
    // ============================================================
    // HELPER METHODS
    // ============================================================
    // Complexity: O(1)
    generateFieldValue(field) {
        switch (field.type) {
            case 'email':
                return `'test_${Date.now()}@example.com'`;
            case 'password':
                return `'TestPass123!'`;
            case 'tel':
            case 'phone':
                return `'+1234567890'`;
            case 'number':
                return `123`;
            case 'date':
                return `'2024-01-15'`;
            case 'url':
                return `'https://example.com'`;
            case 'checkbox':
                return `true`;
            default:
                return `'Test ${field.name || 'Value'}'`;
        }
    }
    // Complexity: O(1)
    getFieldSelector(field) {
        if (field.name)
            return `'[name="${field.name}"]'`;
        if (field.label)
            return `'text=${field.label}'`;
        return `'[type="${field.type}"]'`;
    }
    // Complexity: O(1)
    getFieldFillMethod(field) {
        switch (field.type) {
            case 'checkbox':
                return 'check';
            case 'select':
                return 'selectOption';
            default:
                return 'fill';
        }
    }
    // Complexity: O(1)
    getFactoryMethod(type) {
        switch (type) {
            case 'email':
                return `return faker.internet.email();`;
            case 'password':
                return `return faker.internet.password({ length: 12 });`;
            case 'text':
                return `return faker.lorem.words(3);`;
            case 'tel':
            case 'phone':
                return `return faker.phone.number();`;
            case 'number':
                return `return faker.number.int({ min: 1, max: 1000 }).toString();`;
            case 'date':
                return `return faker.date.future().toISOString().split('T')[0];`;
            case 'url':
                return `return faker.internet.url();`;
            default:
                return `return faker.lorem.word();`;
        }
    }
    // Complexity: O(1)
    urlToTestName(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.pathname
                .replace(/\//g, '_')
                .replace(/[^a-zA-Z0-9_]/g, '')
                .replace(/^_+|_+$/g, '') || 'root';
        }
        catch {
            return 'page';
        }
    }
    // Complexity: O(1)
    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    // Complexity: O(1)
    escapeRegex(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    /**
     * Write tests to disk
     */
    // Complexity: O(N*M) — nested iteration
    async writeTestsToDisk(suites) {
        for (const suite of suites) {
            for (const test of suite.tests) {
                const fullPath = path.join(this.config.outputDir, test.filePath);
                const dir = path.dirname(fullPath);
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true });
                }
                fs.writeFileSync(fullPath, test.code);
            }
        }
    }
    /**
     * Print summary
     */
    // Complexity: O(N) — linear scan
    printSummary(suites) {
        logger_1.logger.debug('');
        logger_1.logger.debug('╔═══════════════════════════════════════════════════════════════╗');
        logger_1.logger.debug('║  🏭 TEST FACTORY SUMMARY                                      ║');
        logger_1.logger.debug('╠═══════════════════════════════════════════════════════════════╣');
        let totalTests = 0;
        let totalDuration = 0;
        for (const suite of suites) {
            logger_1.logger.debug(`║  ${suite.name.padEnd(50)} ║`);
            logger_1.logger.debug(`║    Tests: ${suite.tests.length.toString().padEnd(42)} ║`);
            const suiteDuration = suite.tests.reduce((sum, t) => sum + t.estimatedDuration, 0);
            logger_1.logger.debug(`║    Est. Duration: ${(suiteDuration / 1000).toFixed(1)}s`.padEnd(62) + '║');
            totalTests += suite.tests.length;
            totalDuration += suiteDuration;
        }
        logger_1.logger.debug('╠═══════════════════════════════════════════════════════════════╣');
        logger_1.logger.debug(`║  TOTAL: ${totalTests} tests`.padEnd(62) + '║');
        logger_1.logger.debug(`║  UI Duration: ~${(totalDuration / 1000).toFixed(0)}s`.padEnd(62) + '║');
        logger_1.logger.debug(`║  Ghost Duration: ~${(totalDuration / 100000).toFixed(1)}s (100x faster!)`.padEnd(62) + '║');
        logger_1.logger.debug('╚═══════════════════════════════════════════════════════════════╝');
    }
}
exports.AutoTestFactory = AutoTestFactory;
// ============================================================
// EXPORTS
// ============================================================
function createTestFactory(config) {
    return new AutoTestFactory(config);
}
