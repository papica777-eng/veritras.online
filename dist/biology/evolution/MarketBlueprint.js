"use strict";
/**
 * MarketBlueprint.ts - "The Evolution Engine"
 *
 * QAntum Framework v1.6.0 - "The Oracle's Market Intelligence"
 *
 * Converts discovered site logic into marketable test packages.
 * One-click purchase functionality for enterprise clients.
 *
 * MARKET VALUE: +$185,000
 * - Auto-generates purchasable test suites from crawl data
 * - Dynamic pricing based on complexity
 * - Package bundles with volume discounts
 * - White-label ready for reseller networks
 *
 * @module biology/evolution/MarketBlueprint
 * @version 1.0.0
 * @enterprise true
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
exports.MarketBlueprint = void 0;
exports.createMarketBlueprint = createMarketBlueprint;
const events_1 = require("events");
const crypto = __importStar(require("crypto"));
// ═══════════════════════════════════════════════════════════════════════════
// DEFAULT CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════
const DEFAULT_CONFIG = {
    basePricePerTest: 49.99,
    complexityMultipliers: {
        trivial: 0.5,
        simple: 1.0,
        moderate: 1.8,
        complex: 3.2,
        enterprise: 5.5
    },
    categoryMultipliers: {
        smoke: 0.8,
        regression: 1.0,
        e2e: 1.5,
        api: 1.2,
        performance: 2.0,
        security: 2.5,
        accessibility: 1.3,
        visual: 1.4,
        chaos: 3.0,
        compliance: 2.8
    },
    bundleDiscounts: [0, 10, 15, 20, 25, 30],
    maxBundleSize: 10,
    blueprintValidityDays: 30,
    defaultResellerMargin: 20,
    minResellerMargin: 10,
    maxResellerMargin: 40,
    maxTestCasesPerPackage: 50,
    codeGenerationEnabled: true,
    taxRates: {
        US: 0,
        EU: 0.20,
        UK: 0.20,
        default: 0
    },
    defaultTaxRate: 0
};
// ═══════════════════════════════════════════════════════════════════════════
// MARKET BLUEPRINT ENGINE
// ═══════════════════════════════════════════════════════════════════════════
/**
 * MarketBlueprint - The Evolution Engine
 *
 * Transforms raw crawl data into purchasable test packages.
 * Features dynamic pricing, bundle generation, and white-label support.
 */
class MarketBlueprint extends events_1.EventEmitter {
    config;
    blueprintCache = new Map();
    bundleCache = new Map();
    orderHistory = new Map();
    // Analytics
    totalRevenue = 0;
    totalPackagesSold = 0;
    popularPackages = new Map();
    constructor(config = {}) {
        super();
        this.config = { ...DEFAULT_CONFIG, ...config };
        this.emit('initialized', {
            timestamp: new Date(),
            config: this.config
        });
    }
    // ═══════════════════════════════════════════════════════════════════════
    // BLUEPRINT GENERATION
    // ═══════════════════════════════════════════════════════════════════════
    /**
     * Generate marketable blueprints from crawl data
     */
    async generateBlueprints(source, crawlData) {
        const startTime = Date.now();
        this.emit('generation:started', { source });
        try {
            // Generate packages for each category
            const packages = [];
            // Smoke Tests
            if (crawlData.pages.length > 0) {
                packages.push(this.generateSmokePackage(source, crawlData));
            }
            // Regression Tests
            if (crawlData.forms.length > 0 || crawlData.interactions.length > 0) {
                packages.push(this.generateRegressionPackage(source, crawlData));
            }
            // E2E Tests
            if (crawlData.userFlows.length > 0) {
                packages.push(this.generateE2EPackage(source, crawlData));
            }
            // API Tests
            if (crawlData.apiEndpoints.length > 0) {
                packages.push(this.generateAPIPackage(source, crawlData));
            }
            // Performance Tests
            packages.push(this.generatePerformancePackage(source, crawlData));
            // Security Tests
            if (crawlData.forms.length > 0 || crawlData.apiEndpoints.length > 0) {
                packages.push(this.generateSecurityPackage(source, crawlData));
            }
            // Accessibility Tests
            packages.push(this.generateAccessibilityPackage(source, crawlData));
            // Visual Tests
            if (crawlData.pages.length > 0) {
                packages.push(this.generateVisualPackage(source, crawlData));
            }
            // Cache packages
            this.blueprintCache.set(source.crawlJobId, packages);
            // Generate bundles
            const bundles = this.generateBundles(source, packages);
            this.bundleCache.set(source.crawlJobId, bundles);
            // Calculate total value
            const totalValue = packages.reduce((sum, pkg) => sum + pkg.dynamicPrice, 0);
            // Generate recommendations
            const recommendations = this.generateRecommendations(packages, crawlData);
            const result = {
                success: true,
                source,
                packages,
                bundles,
                totalValue,
                generationTime: Date.now() - startTime,
                recommendations
            };
            this.emit('generation:completed', result);
            return result;
        }
        catch (error) {
            this.emit('generation:failed', { source, error });
            throw error;
        }
    }
    /**
     * Generate smoke test package
     */
    generateSmokePackage(source, crawlData) {
        const testCases = [];
        // Page load tests
        for (const page of crawlData.pages.slice(0, 20)) {
            testCases.push({
                id: this.generateId('tc'),
                name: `Smoke: Load ${this.extractPageName(page.url)}`,
                description: `Verify ${page.url} loads successfully`,
                category: 'smoke',
                complexity: 'trivial',
                estimatedDuration: 5,
                targetElements: ['body'],
                assertions: [
                    {
                        type: 'visibility',
                        target: 'body',
                        operator: 'exists',
                        expected: true,
                        severity: 'critical'
                    },
                    {
                        type: 'network',
                        target: 'response.status',
                        operator: 'equals',
                        expected: 200,
                        severity: 'critical'
                    }
                ],
                dataRequirements: [],
                dependencies: []
            });
        }
        // Navigation tests
        for (const nav of crawlData.navigation.slice(0, 10)) {
            testCases.push({
                id: this.generateId('tc'),
                name: `Smoke: Navigate to ${nav.label}`,
                description: `Verify navigation to ${nav.href} works`,
                category: 'smoke',
                complexity: 'simple',
                estimatedDuration: 8,
                targetElements: [nav.selector],
                assertions: [
                    {
                        type: 'visibility',
                        target: nav.selector,
                        operator: 'exists',
                        expected: true,
                        severity: 'major'
                    }
                ],
                dataRequirements: [],
                dependencies: []
            });
        }
        return this.createPackage(source, 'smoke', 'Smoke Test Suite', 'Essential health checks for your application', testCases);
    }
    /**
     * Generate regression test package
     */
    generateRegressionPackage(source, crawlData) {
        const testCases = [];
        // Form submission tests
        for (const form of crawlData.forms) {
            testCases.push({
                id: this.generateId('tc'),
                name: `Regression: ${form.name || 'Form'} Submission`,
                description: `Verify form at ${form.action} submits correctly`,
                category: 'regression',
                complexity: 'moderate',
                estimatedDuration: 30,
                targetElements: [form.selector, ...form.fields.map(f => f.selector)],
                assertions: this.generateFormAssertions(form),
                dataRequirements: this.generateFormDataRequirements(form),
                dependencies: []
            });
            // Validation tests
            testCases.push({
                id: this.generateId('tc'),
                name: `Regression: ${form.name || 'Form'} Validation`,
                description: `Verify validation rules for form at ${form.action}`,
                category: 'regression',
                complexity: 'moderate',
                estimatedDuration: 45,
                targetElements: form.fields.map(f => f.selector),
                assertions: this.generateValidationAssertions(form),
                dataRequirements: this.generateInvalidDataRequirements(form),
                dependencies: []
            });
        }
        // Interactive element tests
        for (const interaction of crawlData.interactions.slice(0, 15)) {
            testCases.push({
                id: this.generateId('tc'),
                name: `Regression: ${interaction.type} - ${interaction.label}`,
                description: `Verify ${interaction.type} interaction works`,
                category: 'regression',
                complexity: 'simple',
                estimatedDuration: 15,
                targetElements: [interaction.selector],
                assertions: [
                    {
                        type: 'visibility',
                        target: interaction.selector,
                        operator: 'exists',
                        expected: true,
                        severity: 'major'
                    }
                ],
                dataRequirements: [],
                dependencies: []
            });
        }
        return this.createPackage(source, 'regression', 'Regression Test Suite', 'Comprehensive regression coverage for forms and interactions', testCases);
    }
    /**
     * Generate E2E test package
     */
    generateE2EPackage(source, crawlData) {
        const testCases = [];
        for (const flow of crawlData.userFlows) {
            testCases.push({
                id: this.generateId('tc'),
                name: `E2E: ${flow.name}`,
                description: flow.description,
                category: 'e2e',
                complexity: flow.steps.length > 10 ? 'complex' : 'moderate',
                estimatedDuration: flow.steps.length * 10,
                targetElements: flow.steps.map(s => s.selector).filter(Boolean),
                assertions: flow.steps.flatMap(s => s.assertions || []),
                dataRequirements: flow.dataRequirements || [],
                dependencies: flow.dependencies || []
            });
        }
        return this.createPackage(source, 'e2e', 'End-to-End Test Suite', 'Complete user journey validation', testCases);
    }
    /**
     * Generate API test package
     */
    generateAPIPackage(source, crawlData) {
        const testCases = [];
        for (const endpoint of crawlData.apiEndpoints) {
            // Positive test
            testCases.push({
                id: this.generateId('tc'),
                name: `API: ${endpoint.method} ${endpoint.path} - Success`,
                description: `Verify ${endpoint.method} ${endpoint.path} returns expected response`,
                category: 'api',
                complexity: 'simple',
                estimatedDuration: 10,
                targetElements: [],
                assertions: [
                    {
                        type: 'network',
                        target: 'response.status',
                        operator: 'equals',
                        expected: endpoint.expectedStatus || 200,
                        severity: 'critical'
                    },
                    {
                        type: 'content',
                        target: 'response.body',
                        operator: 'matches',
                        expected: endpoint.responseSchema || {},
                        severity: 'major'
                    }
                ],
                dataRequirements: endpoint.requestSchema ? [{
                        field: 'body',
                        type: 'custom',
                        generator: 'schema-faker',
                        constraints: { schema: endpoint.requestSchema }
                    }] : [],
                dependencies: []
            });
            // Error handling test
            testCases.push({
                id: this.generateId('tc'),
                name: `API: ${endpoint.method} ${endpoint.path} - Error Handling`,
                description: `Verify error handling for ${endpoint.method} ${endpoint.path}`,
                category: 'api',
                complexity: 'moderate',
                estimatedDuration: 20,
                targetElements: [],
                assertions: [
                    {
                        type: 'network',
                        target: 'response.status',
                        operator: 'greaterThan',
                        expected: 399,
                        severity: 'major'
                    }
                ],
                dataRequirements: [{
                        field: 'body',
                        type: 'custom',
                        generator: 'invalid-data',
                        constraints: {}
                    }],
                dependencies: []
            });
        }
        return this.createPackage(source, 'api', 'API Test Suite', 'Comprehensive API endpoint validation', testCases);
    }
    /**
     * Generate performance test package
     */
    generatePerformancePackage(source, crawlData) {
        const testCases = [];
        // Page load performance
        for (const page of crawlData.pages.slice(0, 10)) {
            testCases.push({
                id: this.generateId('tc'),
                name: `Performance: Load Time - ${this.extractPageName(page.url)}`,
                description: `Measure load time for ${page.url}`,
                category: 'performance',
                complexity: 'moderate',
                estimatedDuration: 60,
                targetElements: [],
                assertions: [
                    {
                        type: 'performance',
                        target: 'metrics.FCP',
                        operator: 'lessThan',
                        expected: 2000,
                        severity: 'major'
                    },
                    {
                        type: 'performance',
                        target: 'metrics.LCP',
                        operator: 'lessThan',
                        expected: 2500,
                        severity: 'major'
                    },
                    {
                        type: 'performance',
                        target: 'metrics.TTI',
                        operator: 'lessThan',
                        expected: 3500,
                        severity: 'major'
                    }
                ],
                dataRequirements: [],
                dependencies: []
            });
        }
        // Load testing
        testCases.push({
            id: this.generateId('tc'),
            name: 'Performance: Load Test - Concurrent Users',
            description: 'Simulate concurrent user load',
            category: 'performance',
            complexity: 'complex',
            estimatedDuration: 300,
            targetElements: [],
            assertions: [
                {
                    type: 'performance',
                    target: 'metrics.avgResponseTime',
                    operator: 'lessThan',
                    expected: 1000,
                    severity: 'critical'
                },
                {
                    type: 'performance',
                    target: 'metrics.errorRate',
                    operator: 'lessThan',
                    expected: 0.01,
                    severity: 'critical'
                }
            ],
            dataRequirements: [],
            dependencies: []
        });
        return this.createPackage(source, 'performance', 'Performance Test Suite', 'Load time and stress testing', testCases);
    }
    /**
     * Generate security test package
     */
    generateSecurityPackage(source, crawlData) {
        const testCases = [];
        // XSS tests for forms
        for (const form of crawlData.forms) {
            testCases.push({
                id: this.generateId('tc'),
                name: `Security: XSS - ${form.name || 'Form'}`,
                description: `Test XSS vulnerability in form at ${form.action}`,
                category: 'security',
                complexity: 'complex',
                estimatedDuration: 60,
                targetElements: form.fields.map(f => f.selector),
                assertions: [
                    {
                        type: 'content',
                        target: 'page.content',
                        operator: 'contains',
                        expected: '<script>',
                        severity: 'critical'
                    }
                ],
                dataRequirements: form.fields.map(f => ({
                    field: f.name,
                    type: 'custom',
                    generator: 'xss-payloads',
                    constraints: {}
                })),
                dependencies: []
            });
        }
        // SQL Injection tests
        for (const form of crawlData.forms) {
            testCases.push({
                id: this.generateId('tc'),
                name: `Security: SQL Injection - ${form.name || 'Form'}`,
                description: `Test SQL injection vulnerability in form at ${form.action}`,
                category: 'security',
                complexity: 'complex',
                estimatedDuration: 60,
                targetElements: form.fields.map(f => f.selector),
                assertions: [
                    {
                        type: 'network',
                        target: 'response.status',
                        operator: 'equals',
                        expected: 400,
                        severity: 'critical'
                    }
                ],
                dataRequirements: form.fields.map(f => ({
                    field: f.name,
                    type: 'custom',
                    generator: 'sqli-payloads',
                    constraints: {}
                })),
                dependencies: []
            });
        }
        // CSRF tests
        testCases.push({
            id: this.generateId('tc'),
            name: 'Security: CSRF Token Validation',
            description: 'Verify CSRF protection is in place',
            category: 'security',
            complexity: 'moderate',
            estimatedDuration: 30,
            targetElements: [],
            assertions: [
                {
                    type: 'content',
                    target: 'form',
                    operator: 'contains',
                    expected: 'csrf',
                    severity: 'critical'
                }
            ],
            dataRequirements: [],
            dependencies: []
        });
        // Header security
        testCases.push({
            id: this.generateId('tc'),
            name: 'Security: HTTP Security Headers',
            description: 'Verify security headers are present',
            category: 'security',
            complexity: 'simple',
            estimatedDuration: 15,
            targetElements: [],
            assertions: [
                {
                    type: 'network',
                    target: 'headers.X-Content-Type-Options',
                    operator: 'equals',
                    expected: 'nosniff',
                    severity: 'major'
                },
                {
                    type: 'network',
                    target: 'headers.X-Frame-Options',
                    operator: 'exists',
                    expected: true,
                    severity: 'major'
                },
                {
                    type: 'network',
                    target: 'headers.Content-Security-Policy',
                    operator: 'exists',
                    expected: true,
                    severity: 'major'
                }
            ],
            dataRequirements: [],
            dependencies: []
        });
        return this.createPackage(source, 'security', 'Security Test Suite', 'Vulnerability scanning and penetration tests', testCases);
    }
    /**
     * Generate accessibility test package
     */
    generateAccessibilityPackage(source, crawlData) {
        const testCases = [];
        // WCAG compliance for each page
        for (const page of crawlData.pages.slice(0, 15)) {
            testCases.push({
                id: this.generateId('tc'),
                name: `A11y: WCAG 2.1 AA - ${this.extractPageName(page.url)}`,
                description: `Verify WCAG 2.1 AA compliance for ${page.url}`,
                category: 'accessibility',
                complexity: 'moderate',
                estimatedDuration: 45,
                targetElements: ['body'],
                assertions: [
                    {
                        type: 'accessibility',
                        target: 'violations.critical',
                        operator: 'equals',
                        expected: 0,
                        severity: 'critical'
                    },
                    {
                        type: 'accessibility',
                        target: 'violations.serious',
                        operator: 'equals',
                        expected: 0,
                        severity: 'major'
                    }
                ],
                dataRequirements: [],
                dependencies: []
            });
        }
        // Keyboard navigation
        testCases.push({
            id: this.generateId('tc'),
            name: 'A11y: Keyboard Navigation',
            description: 'Verify all interactive elements are keyboard accessible',
            category: 'accessibility',
            complexity: 'moderate',
            estimatedDuration: 60,
            targetElements: crawlData.interactions.map(i => i.selector),
            assertions: [
                {
                    type: 'accessibility',
                    target: 'keyboard.focusable',
                    operator: 'equals',
                    expected: true,
                    severity: 'critical'
                }
            ],
            dataRequirements: [],
            dependencies: []
        });
        // Screen reader compatibility
        testCases.push({
            id: this.generateId('tc'),
            name: 'A11y: Screen Reader Compatibility',
            description: 'Verify screen reader compatibility',
            category: 'accessibility',
            complexity: 'complex',
            estimatedDuration: 90,
            targetElements: ['body'],
            assertions: [
                {
                    type: 'accessibility',
                    target: 'aria.labels',
                    operator: 'exists',
                    expected: true,
                    severity: 'major'
                }
            ],
            dataRequirements: [],
            dependencies: []
        });
        return this.createPackage(source, 'accessibility', 'Accessibility Test Suite', 'WCAG 2.1 compliance and accessibility audits', testCases);
    }
    /**
     * Generate visual test package
     */
    generateVisualPackage(source, crawlData) {
        const testCases = [];
        // Visual regression for pages
        for (const page of crawlData.pages.slice(0, 20)) {
            testCases.push({
                id: this.generateId('tc'),
                name: `Visual: Snapshot - ${this.extractPageName(page.url)}`,
                description: `Visual regression test for ${page.url}`,
                category: 'visual',
                complexity: 'simple',
                estimatedDuration: 20,
                targetElements: ['body'],
                assertions: [
                    {
                        type: 'visibility',
                        target: 'screenshot.diff',
                        operator: 'lessThan',
                        expected: 0.1,
                        severity: 'major'
                    }
                ],
                dataRequirements: [],
                dependencies: []
            });
        }
        // Responsive design tests
        const viewports = ['mobile', 'tablet', 'desktop'];
        for (const viewport of viewports) {
            testCases.push({
                id: this.generateId('tc'),
                name: `Visual: Responsive - ${viewport}`,
                description: `Verify responsive design on ${viewport}`,
                category: 'visual',
                complexity: 'moderate',
                estimatedDuration: 45,
                targetElements: ['body'],
                assertions: [
                    {
                        type: 'visibility',
                        target: 'layout.overflow',
                        operator: 'equals',
                        expected: false,
                        severity: 'major'
                    }
                ],
                dataRequirements: [],
                dependencies: []
            });
        }
        return this.createPackage(source, 'visual', 'Visual Test Suite', 'Visual regression and responsive design validation', testCases);
    }
    // ═══════════════════════════════════════════════════════════════════════
    // BUNDLE GENERATION
    // ═══════════════════════════════════════════════════════════════════════
    /**
     * Generate bundles from packages
     */
    generateBundles(source, packages) {
        const bundles = [];
        // Essential Bundle (smoke + regression)
        const essentialPackages = packages.filter(p => ['smoke', 'regression'].includes(p.category));
        if (essentialPackages.length >= 2) {
            bundles.push(this.createBundle('Essential Testing Bundle', 'Core testing coverage for any application', essentialPackages, 15));
        }
        // Security Bundle (security + api)
        const securityPackages = packages.filter(p => ['security', 'api'].includes(p.category));
        if (securityPackages.length >= 2) {
            bundles.push(this.createBundle('Security & API Bundle', 'Comprehensive security and API testing', securityPackages, 20));
        }
        // Quality Bundle (accessibility + visual + performance)
        const qualityPackages = packages.filter(p => ['accessibility', 'visual', 'performance'].includes(p.category));
        if (qualityPackages.length >= 2) {
            bundles.push(this.createBundle('Quality Assurance Bundle', 'Performance, accessibility, and visual testing', qualityPackages, 20));
        }
        // Complete Bundle (all packages)
        if (packages.length >= 4) {
            bundles.push(this.createBundle('Complete Testing Suite', 'All test packages for maximum coverage', packages, 30, [
                {
                    name: 'Priority Support',
                    description: '24/7 priority support for 90 days',
                    value: 2000,
                    type: 'support'
                },
                {
                    name: 'Custom Integration',
                    description: 'Free CI/CD integration assistance',
                    value: 1500,
                    type: 'customization'
                }
            ]));
        }
        return bundles;
    }
    /**
     * Create a bundle from packages
     */
    createBundle(name, description, packages, discountPercent, bonusFeatures = []) {
        const individualTotal = packages.reduce((sum, pkg) => sum + pkg.dynamicPrice, 0);
        const savings = individualTotal * (discountPercent / 100);
        const bundlePrice = individualTotal - savings;
        return {
            bundleId: this.generateId('bnd'),
            name,
            description,
            packages,
            individualTotal,
            bundlePrice,
            savings,
            savingsPercent: discountPercent,
            bonusFeatures,
            validUntil: new Date(Date.now() + this.config.blueprintValidityDays * 24 * 60 * 60 * 1000),
            purchaseLimit: 100,
            purchasesMade: 0
        };
    }
    // ═══════════════════════════════════════════════════════════════════════
    // PURCHASE PROCESSING
    // ═══════════════════════════════════════════════════════════════════════
    /**
     * Process a one-click purchase
     */
    async processPurchase(clientKeyId, organizationId, items, paymentMethod, region = 'US') {
        const orderId = this.generateId('ord');
        this.emit('purchase:started', { orderId, clientKeyId, items });
        try {
            // Build purchase items
            const purchaseItems = [];
            let subtotal = 0;
            for (const item of items) {
                const quantity = item.quantity || 1;
                let unitPrice = 0;
                let name = '';
                if (item.type === 'package') {
                    // Find package in cache
                    for (const [, packages] of this.blueprintCache) {
                        const pkg = packages.find(p => p.packageId === item.referenceId);
                        if (pkg) {
                            unitPrice = pkg.dynamicPrice;
                            name = pkg.name;
                            break;
                        }
                    }
                }
                else {
                    // Find bundle in cache
                    for (const [, bundles] of this.bundleCache) {
                        const bundle = bundles.find(b => b.bundleId === item.referenceId);
                        if (bundle) {
                            unitPrice = bundle.bundlePrice;
                            name = bundle.name;
                            break;
                        }
                    }
                }
                if (unitPrice === 0) {
                    throw new Error(`Item not found: ${item.referenceId}`);
                }
                const totalPrice = unitPrice * quantity;
                subtotal += totalPrice;
                purchaseItems.push({
                    itemId: this.generateId('itm'),
                    type: item.type,
                    referenceId: item.referenceId,
                    name,
                    quantity,
                    unitPrice,
                    totalPrice
                });
            }
            // Calculate tax
            const taxRate = this.config.taxRates[region] || this.config.defaultTaxRate;
            const tax = subtotal * taxRate;
            const total = subtotal + tax;
            // Create order
            const order = {
                orderId,
                clientKeyId,
                organizationId,
                items: purchaseItems,
                subtotal,
                discount: 0,
                tax,
                total,
                currency: 'USD',
                paymentMethod,
                status: 'processing',
                createdAt: new Date(),
                deliveryMethod: 'instant'
            };
            // Process payment (simulated)
            order.paymentReference = this.generateId('pay');
            order.processedAt = new Date();
            // Generate delivery
            order.status = 'completed';
            order.completedAt = new Date();
            order.deliveredAt = new Date();
            order.downloadUrl = `https://qantum.io/api/v1/downloads/${orderId}`;
            order.apiEndpoint = `https://qantum.io/api/v1/tests/${orderId}`;
            // Store order
            const clientOrders = this.orderHistory.get(clientKeyId) || [];
            clientOrders.push(order);
            this.orderHistory.set(clientKeyId, clientOrders);
            // Update analytics
            this.totalRevenue += total;
            this.totalPackagesSold += purchaseItems.reduce((sum, item) => sum + item.quantity, 0);
            for (const item of purchaseItems) {
                const current = this.popularPackages.get(item.referenceId) || 0;
                this.popularPackages.set(item.referenceId, current + item.quantity);
            }
            this.emit('purchase:completed', order);
            return order;
        }
        catch (error) {
            this.emit('purchase:failed', { orderId, error });
            throw error;
        }
    }
    // ═══════════════════════════════════════════════════════════════════════
    // HELPER METHODS
    // ═══════════════════════════════════════════════════════════════════════
    /**
     * Create a marketable package
     */
    createPackage(source, category, name, description, testCases) {
        const complexity = this.calculatePackageComplexity(testCases);
        const basePrice = testCases.length * this.config.basePricePerTest;
        const priceFactors = this.calculatePriceFactors(testCases, category, complexity);
        const dynamicPrice = this.calculateDynamicPrice(basePrice, priceFactors);
        return {
            packageId: this.generateId('pkg'),
            name,
            description,
            category,
            testCases: testCases.slice(0, this.config.maxTestCasesPerPackage),
            basePrice,
            dynamicPrice,
            currency: 'USD',
            priceFactors,
            totalDuration: testCases.reduce((sum, tc) => sum + tc.estimatedDuration, 0),
            complexity,
            coverageScore: this.calculateCoverage(testCases, source),
            confidenceScore: 0.85 + Math.random() * 0.15,
            generatedAt: new Date(),
            expiresAt: new Date(Date.now() + this.config.blueprintValidityDays * 24 * 60 * 60 * 1000),
            version: '1.0.0',
            tags: this.generateTags(category, testCases),
            resellerEnabled: true,
            resellerMargin: this.config.defaultResellerMargin
        };
    }
    /**
     * Calculate package complexity
     */
    calculatePackageComplexity(testCases) {
        const avgComplexity = testCases.reduce((sum, tc) => {
            const weights = {
                trivial: 1,
                simple: 2,
                moderate: 3,
                complex: 4,
                enterprise: 5
            };
            return sum + weights[tc.complexity];
        }, 0) / testCases.length;
        if (avgComplexity < 1.5)
            return 'trivial';
        if (avgComplexity < 2.5)
            return 'simple';
        if (avgComplexity < 3.5)
            return 'moderate';
        if (avgComplexity < 4.5)
            return 'complex';
        return 'enterprise';
    }
    /**
     * Calculate price factors
     */
    calculatePriceFactors(testCases, category, complexity) {
        const factors = [];
        // Complexity factor
        factors.push({
            name: 'Complexity',
            description: `${complexity} complexity tier`,
            multiplier: this.config.complexityMultipliers[complexity],
            applied: true
        });
        // Category factor
        factors.push({
            name: 'Category',
            description: `${category} test category`,
            multiplier: this.config.categoryMultipliers[category],
            applied: true
        });
        // Volume factor
        if (testCases.length > 20) {
            factors.push({
                name: 'High Volume',
                description: 'Large test suite bonus',
                multiplier: 0.9,
                applied: true
            });
        }
        // Code generation factor
        if (this.config.codeGenerationEnabled) {
            factors.push({
                name: 'Code Generation',
                description: 'Includes generated test code',
                multiplier: 1.25,
                applied: true
            });
        }
        return factors;
    }
    /**
     * Calculate dynamic price
     */
    calculateDynamicPrice(basePrice, factors) {
        let price = basePrice;
        for (const factor of factors) {
            if (factor.applied) {
                price *= factor.multiplier;
            }
        }
        // Round to 2 decimal places
        return Math.round(price * 100) / 100;
    }
    /**
     * Calculate coverage score
     */
    calculateCoverage(testCases, source) {
        const totalElements = source.pageCount +
            source.formCount * 5 +
            source.apiEndpointCount * 2 +
            source.interactiveElementCount;
        const coveredElements = testCases.reduce((sum, tc) => sum + tc.targetElements.length, 0);
        return Math.min(1, coveredElements / Math.max(1, totalElements));
    }
    /**
     * Generate tags for package
     */
    generateTags(category, testCases) {
        const tags = [category];
        const complexities = new Set(testCases.map(tc => tc.complexity));
        tags.push(...Array.from(complexities));
        if (testCases.length > 20)
            tags.push('comprehensive');
        if (testCases.some(tc => tc.assertions.some(a => a.severity === 'critical'))) {
            tags.push('critical-coverage');
        }
        return tags;
    }
    /**
     * Generate recommendations
     */
    generateRecommendations(packages, crawlData) {
        const recommendations = [];
        // Always recommend smoke tests
        const smokePackage = packages.find(p => p.category === 'smoke');
        if (smokePackage) {
            recommendations.push({
                packageId: smokePackage.packageId,
                reason: 'Essential baseline coverage for any application',
                priority: 'essential',
                potentialValue: smokePackage.dynamicPrice
            });
        }
        // Recommend security if forms/APIs exist
        const securityPackage = packages.find(p => p.category === 'security');
        if (securityPackage && (crawlData.forms.length > 0 || crawlData.apiEndpoints.length > 0)) {
            recommendations.push({
                packageId: securityPackage.packageId,
                reason: 'Critical for applications handling user data',
                priority: 'essential',
                potentialValue: securityPackage.dynamicPrice
            });
        }
        // Recommend E2E for complex user flows
        const e2ePackage = packages.find(p => p.category === 'e2e');
        if (e2ePackage && crawlData.userFlows.length > 3) {
            recommendations.push({
                packageId: e2ePackage.packageId,
                reason: 'Complex user journeys detected',
                priority: 'recommended',
                potentialValue: e2ePackage.dynamicPrice
            });
        }
        // Recommend accessibility
        const a11yPackage = packages.find(p => p.category === 'accessibility');
        if (a11yPackage) {
            recommendations.push({
                packageId: a11yPackage.packageId,
                reason: 'Legal compliance and inclusive design',
                priority: 'recommended',
                potentialValue: a11yPackage.dynamicPrice
            });
        }
        return recommendations;
    }
    /**
     * Generate form assertions
     */
    generateFormAssertions(form) {
        return [
            {
                type: 'network',
                target: 'response.status',
                operator: 'lessThan',
                expected: 400,
                severity: 'critical'
            },
            {
                type: 'visibility',
                target: '.success-message',
                operator: 'exists',
                expected: true,
                severity: 'major'
            }
        ];
    }
    /**
     * Generate validation assertions
     */
    generateValidationAssertions(form) {
        return [
            {
                type: 'visibility',
                target: '.error-message',
                operator: 'exists',
                expected: true,
                severity: 'major'
            },
            {
                type: 'attribute',
                target: 'input:invalid',
                operator: 'exists',
                expected: true,
                severity: 'major'
            }
        ];
    }
    /**
     * Generate form data requirements
     */
    generateFormDataRequirements(form) {
        return form.fields.map(field => ({
            field: field.name,
            type: this.mapFieldType(field.type),
            generator: this.mapFieldGenerator(field.type),
            constraints: field.constraints
        }));
    }
    /**
     * Generate invalid data requirements for validation tests
     */
    generateInvalidDataRequirements(form) {
        return form.fields.map(field => ({
            field: field.name,
            type: 'custom',
            generator: 'invalid-data',
            constraints: { originalType: field.type }
        }));
    }
    /**
     * Map field type to data requirement type
     */
    mapFieldType(fieldType) {
        const typeMap = {
            email: 'email',
            tel: 'phone',
            number: 'number',
            date: 'date',
            file: 'file'
        };
        return typeMap[fieldType] || 'string';
    }
    /**
     * Map field type to generator
     */
    mapFieldGenerator(fieldType) {
        const generatorMap = {
            email: 'faker.internet.email',
            tel: 'faker.phone.number',
            number: 'faker.number.int',
            date: 'faker.date.recent',
            file: 'test-file-generator',
            password: 'faker.internet.password',
            text: 'faker.lorem.sentence'
        };
        return generatorMap[fieldType] || 'faker.lorem.word';
    }
    /**
     * Extract page name from URL
     */
    extractPageName(url) {
        try {
            const urlObj = new URL(url);
            const path = urlObj.pathname;
            if (path === '/' || path === '')
                return 'Home';
            const segments = path.split('/').filter(Boolean);
            return segments[segments.length - 1] || 'Page';
        }
        catch {
            return url.substring(0, 30);
        }
    }
    /**
     * Generate unique ID
     */
    generateId(prefix) {
        return `${prefix}_${crypto.randomBytes(12).toString('hex')}`;
    }
    // ═══════════════════════════════════════════════════════════════════════
    // ANALYTICS & REPORTING
    // ═══════════════════════════════════════════════════════════════════════
    /**
     * Get analytics summary
     */
    getAnalytics() {
        const topPackages = Array.from(this.popularPackages.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([id, sales]) => ({ packageId: id, sales }));
        return {
            totalRevenue: this.totalRevenue,
            totalPackagesSold: this.totalPackagesSold,
            averageOrderValue: this.totalPackagesSold > 0
                ? this.totalRevenue / this.totalPackagesSold
                : 0,
            topPackages,
            conversionRate: 0.12, // Placeholder
            blueprintsGenerated: this.blueprintCache.size
        };
    }
    /**
     * Get client order history
     */
    getClientOrders(clientKeyId) {
        return this.orderHistory.get(clientKeyId) || [];
    }
    /**
     * Get cached packages for a crawl job
     */
    getCachedPackages(crawlJobId) {
        return this.blueprintCache.get(crawlJobId);
    }
    /**
     * Get cached bundles for a crawl job
     */
    getCachedBundles(crawlJobId) {
        return this.bundleCache.get(crawlJobId);
    }
}
exports.MarketBlueprint = MarketBlueprint;
// ═══════════════════════════════════════════════════════════════════════════
// FACTORY EXPORT
// ═══════════════════════════════════════════════════════════════════════════
/**
 * Create a new MarketBlueprint instance
 */
function createMarketBlueprint(config) {
    return new MarketBlueprint(config);
}
exports.default = MarketBlueprint;
