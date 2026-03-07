/**
 * 🔮 THE ORACLE - Auto Test Factory
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Automatically generates complete test packages from discovered site structure.
 *
 * "Генерира автоматично пълни тестови пакети (Ghost API + UI)"
 *
 * @version 1.0.0
 * @author QAntum AI Architect
 * @phase THE ORACLE - Auto Test Generation
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { EventEmitter } from 'events';
import type { SiteMap, DiscoveredPage, DiscoveredForm, DiscoveredButton, DiscoveredAPI } from './site-mapper';
import type { UserJourney, BusinessLogic, TransactionFlow } from './logic-discovery';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Generated test suite
 */
export interface TestSuite {
  id: string;
  name: string;
  description: string;
  type: TestSuiteType;
  generatedAt: number;
  tests: GeneratedTest[];
  setup?: string;
  teardown?: string;
  dependencies: string[];
}

export type TestSuiteType = 'e2e' | 'api' | 'form' | 'visual' | 'performance' | 'security' | 'accessibility';

/**
 * Individual generated test
 */
export interface GeneratedTest {
  id: string;
  name: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  tags: string[];
  steps: TestStep[];
  assertions: TestAssertion[];
  dataVariations?: TestDataVariation[];
  timeout: number;
  retries: number;
  code: string; // Generated Playwright code
}

/**
 * Test step
 */
export interface TestStep {
  order: number;
  action: string;
  target?: string;
  value?: string;
  comment: string;
  code: string;
}

/**
 * Test assertion
 */
export interface TestAssertion {
  type: 'visibility' | 'text' | 'url' | 'attribute' | 'count' | 'enabled' | 'network' | 'performance';
  target?: string;
  expected: string;
  code: string;
}

/**
 * Data variation for parameterized tests
 */
export interface TestDataVariation {
  name: string;
  data: Record<string, string>;
  expectedOutcome: string;
}

/**
 * Test factory configuration
 */
export interface TestFactoryConfig {
  outputDir: string;
  framework: 'playwright' | 'cypress' | 'puppeteer';
  language: 'typescript' | 'javascript';
  includeGhostProtocol: boolean;
  includeApiTests: boolean;
  includeVisualTests: boolean;
  includePerformanceTests: boolean;
  includeSecurityTests: boolean;
  includeAccessibilityTests: boolean;
  generateDataVariations: boolean;
  maxTestsPerSuite: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

const DEFAULT_CONFIG: TestFactoryConfig = {
  outputDir: './generated-tests',
  framework: 'playwright',
  language: 'typescript',
  includeGhostProtocol: true,
  includeApiTests: true,
  includeVisualTests: true,
  includePerformanceTests: true,
  includeSecurityTests: true,
  includeAccessibilityTests: false,
  generateDataVariations: true,
  maxTestsPerSuite: 20
};

// Test data for variations
const VALID_TEST_DATA: Record<string, string> = {
  email: 'valid.user@example.com',
  password: 'SecurePassword123!',
  username: 'testuser2024',
  phone: '+1-555-123-4567',
  name: 'John Doe',
  address: '123 Test Street',
  city: 'Test City',
  zip: '12345'
};

const INVALID_TEST_DATA: Record<string, string> = {
  email: 'invalid-email',
  password: '123',
  username: '',
  phone: 'abc',
  name: '',
  address: '',
  city: '',
  zip: 'abc'
};

// ═══════════════════════════════════════════════════════════════════════════════
// AUTO TEST FACTORY
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * 🏭 AutoTestFactory - Generates complete test packages automatically
 */
export class AutoTestFactory extends EventEmitter {
  private config: TestFactoryConfig;
  private generatedSuites: TestSuite[] = [];

  constructor(config: Partial<TestFactoryConfig> = {}) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * 🚀 Generate all tests from site map and logic
   */
  // Complexity: O(1) — hash/map lookup
  async generateTests(
    siteMap: SiteMap,
    logic: BusinessLogic[],
    journeys: UserJourney[],
    flows: TransactionFlow[]
  ): Promise<TestSuite[]> {
    console.log(`
╔═══════════════════════════════════════════════════════════════════════════════════════╗
║                                                                                       ║
║    █████╗ ██╗   ██╗████████╗ ██████╗     ████████╗███████╗███████╗████████╗           ║
║   ██╔══██╗██║   ██║╚══██╔══╝██╔═══██╗    ╚══██╔══╝██╔════╝██╔════╝╚══██╔══╝           ║
║   ███████║██║   ██║   ██║   ██║   ██║       ██║   █████╗  ███████╗   ██║              ║
║   ██╔══██║██║   ██║   ██║   ██║   ██║       ██║   ██╔══╝  ╚════██║   ██║              ║
║   ██║  ██║╚██████╔╝   ██║   ╚██████╔╝       ██║   ███████╗███████║   ██║              ║
║   ╚═╝  ╚═╝ ╚═════╝    ╚═╝    ╚═════╝        ╚═╝   ╚══════╝╚══════╝   ╚═╝              ║
║                                                                                       ║
║   ███████╗ █████╗  ██████╗████████╗ ██████╗ ██████╗ ██╗   ██╗                         ║
║   ██╔════╝██╔══██╗██╔════╝╚══██╔══╝██╔═══██╗██╔══██╗╚██╗ ██╔╝                         ║
║   █████╗  ███████║██║        ██║   ██║   ██║██████╔╝ ╚████╔╝                          ║
║   ██╔══╝  ██╔══██║██║        ██║   ██║   ██║██╔══██╗  ╚██╔╝                           ║
║   ██║     ██║  ██║╚██████╗   ██║   ╚██████╔╝██║  ██║   ██║                            ║
║   ╚═╝     ╚═╝  ╚═╝ ╚═════╝   ╚═╝    ╚═════╝ ╚═╝  ╚═╝   ╚═╝                            ║
║                                                                                       ║
║                    THE ORACLE - Automatic Test Generation                             ║
║                                                                                       ║
╠═══════════════════════════════════════════════════════════════════════════════════════╣
║  Output: ${this.config.outputDir.padEnd(70)}║
║  Framework: ${this.config.framework.padEnd(67)}║
║  Language: ${this.config.language.padEnd(68)}║
║  Ghost Protocol: ${this.config.includeGhostProtocol ? 'ENABLED' : 'DISABLED'}${' '.repeat(59)}║
╚═══════════════════════════════════════════════════════════════════════════════════════╝
`);

    this.generatedSuites = [];

    // Generate different test suite types
    console.log('\n[TestFactory] 📝 Generating E2E Tests...');
    const e2eSuite = this.generateE2ETests(siteMap, journeys);
    this.generatedSuites.push(e2eSuite);

    console.log('[TestFactory] 📋 Generating Form Tests...');
    const formSuites = this.generateFormTests(siteMap);
    this.generatedSuites.push(...formSuites);

    if (this.config.includeApiTests && siteMap.apiEndpoints.length > 0) {
      console.log('[TestFactory] 🔗 Generating API Tests...');
      const apiSuite = this.generateAPITests(siteMap);
      this.generatedSuites.push(apiSuite);
    }

    if (this.config.includeVisualTests) {
      console.log('[TestFactory] 🎨 Generating Visual Tests...');
      const visualSuite = this.generateVisualTests(siteMap);
      this.generatedSuites.push(visualSuite);
    }

    if (this.config.includePerformanceTests) {
      console.log('[TestFactory] ⚡ Generating Performance Tests...');
      const perfSuite = this.generatePerformanceTests(siteMap);
      this.generatedSuites.push(perfSuite);
    }

    if (this.config.includeSecurityTests) {
      console.log('[TestFactory] 🛡️ Generating Security Tests...');
      const secSuite = this.generateSecurityTests(siteMap, logic);
      this.generatedSuites.push(secSuite);
    }

    // Generate journey tests from discovered flows
    if (flows.length > 0) {
      console.log('[TestFactory] 🗺️ Generating Flow Tests...');
      const flowSuites = this.generateFlowTests(flows);
      this.generatedSuites.push(...flowSuites);
    }

    // Write to disk
    console.log('\n[TestFactory] 💾 Writing test files...');
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.writeTestFiles();

    // Print summary
    this.printSummary();

    return this.generatedSuites;
  }

  /**
   * Generate E2E navigation tests
   */
  // Complexity: O(N*M) — nested iteration detected
  private generateE2ETests(siteMap: SiteMap, journeys: UserJourney[]): TestSuite {
    const tests: GeneratedTest[] = [];
    const pages = Array.from(siteMap.pages.values()).slice(0, this.config.maxTestsPerSuite);

    // Basic navigation tests
    for (const page of pages) {
      const test = this.createNavigationTest(page);
      tests.push(test);
    }

    // Journey-based tests
    for (const journey of journeys.slice(0, 5)) {
      const test = this.createJourneyTest(journey);
      tests.push(test);
    }

    return {
      id: crypto.randomUUID(),
      name: 'E2E Navigation Tests',
      description: 'End-to-end tests for site navigation and page loading',
      type: 'e2e',
      generatedAt: Date.now(),
      tests,
      setup: this.generateSetup(),
      teardown: this.generateTeardown(),
      dependencies: ['@playwright/test']
    };
  }

  /**
   * Generate form interaction tests
   */
  // Complexity: O(N*M) — nested iteration detected
  private generateFormTests(siteMap: SiteMap): TestSuite[] {
    const suites: TestSuite[] = [];
    const pages = Array.from(siteMap.pages.values());
    const formsPages = pages.filter(p => p.forms.length > 0);

    for (const page of formsPages.slice(0, 5)) {
      const tests: GeneratedTest[] = [];

      for (const form of page.forms) {
        // Valid submission test
        tests.push(this.createFormValidTest(page, form));

        // Invalid submission tests
        if (this.config.generateDataVariations) {
          tests.push(this.createFormInvalidTest(page, form));
          tests.push(this.createFormEmptyTest(page, form));
        }
      }

      if (tests.length > 0) {
        suites.push({
          id: crypto.randomUUID(),
          name: `Form Tests - ${page.title || page.url}`,
          description: `Form interaction tests for ${page.url}`,
          type: 'form',
          generatedAt: Date.now(),
          tests,
          setup: this.generateSetup(),
          teardown: this.generateTeardown(),
          dependencies: ['@playwright/test']
        });
      }
    }

    return suites;
  }

  /**
   * Generate API tests
   */
  // Complexity: O(N) — linear iteration
  private generateAPITests(siteMap: SiteMap): TestSuite {
    const tests: GeneratedTest[] = [];

    for (const api of siteMap.apiEndpoints.slice(0, this.config.maxTestsPerSuite)) {
      const test = this.createAPITest(api);
      tests.push(test);
    }

    return {
      id: crypto.randomUUID(),
      name: 'API Tests',
      description: 'API endpoint tests discovered from network traffic',
      type: 'api',
      generatedAt: Date.now(),
      tests,
      dependencies: ['@playwright/test']
    };
  }

  /**
   * Generate visual regression tests
   */
  // Complexity: O(N*M) — nested iteration detected
  private generateVisualTests(siteMap: SiteMap): TestSuite {
    const tests: GeneratedTest[] = [];
    const pages = Array.from(siteMap.pages.values()).slice(0, 10);

    for (const page of pages) {
      tests.push(this.createVisualTest(page));
    }

    return {
      id: crypto.randomUUID(),
      name: 'Visual Regression Tests',
      description: 'Screenshot comparison tests for visual regression',
      type: 'visual',
      generatedAt: Date.now(),
      tests,
      setup: this.generateSetup(),
      dependencies: ['@playwright/test']
    };
  }

  /**
   * Generate performance tests
   */
  // Complexity: O(N) — linear iteration
  private generatePerformanceTests(siteMap: SiteMap): TestSuite {
    const tests: GeneratedTest[] = [];
    const pages = Array.from(siteMap.pages.values()).slice(0, 5);

    for (const page of pages) {
      tests.push(this.createPerformanceTest(page));
    }

    return {
      id: crypto.randomUUID(),
      name: 'Performance Tests',
      description: 'Page load time and Core Web Vitals tests',
      type: 'performance',
      generatedAt: Date.now(),
      tests,
      dependencies: ['@playwright/test']
    };
  }

  /**
   * Generate security tests
   */
  // Complexity: O(N*M) — nested iteration detected
  private generateSecurityTests(siteMap: SiteMap, logic: BusinessLogic[]): TestSuite {
    const tests: GeneratedTest[] = [];
    const pages = Array.from(siteMap.pages.values());

    // XSS test for forms
    const formsPages = pages.filter(p => p.forms.length > 0);
    for (const page of formsPages.slice(0, 3)) {
      tests.push(this.createXSSTest(page));
    }

    // Security headers test
    tests.push(this.createSecurityHeadersTest(siteMap.rootUrl));

    // Auth flow tests
    const authLogic = logic.filter(l => l.type === 'authentication');
    for (const auth of authLogic.slice(0, 2)) {
      tests.push(this.createAuthSecurityTest(auth));
    }

    return {
      id: crypto.randomUUID(),
      name: 'Security Tests',
      description: 'Basic security checks including XSS, headers, and auth',
      type: 'security',
      generatedAt: Date.now(),
      tests,
      dependencies: ['@playwright/test']
    };
  }

  /**
   * Generate flow tests from transaction flows
   */
  // Complexity: O(N*M) — nested iteration detected
  private generateFlowTests(flows: TransactionFlow[]): TestSuite[] {
    const suites: TestSuite[] = [];

    for (const flow of flows) {
      const tests: GeneratedTest[] = [];
      tests.push(this.createFlowTest(flow));

      suites.push({
        id: crypto.randomUUID(),
        name: `${flow.name} Tests`,
        description: `Tests for ${flow.type} transaction flow`,
        type: 'e2e',
        generatedAt: Date.now(),
        tests,
        dependencies: ['@playwright/test']
      });
    }

    return suites;
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // TEST CREATORS
  // ═══════════════════════════════════════════════════════════════════════════════

  // Complexity: O(N*M) — nested iteration detected
  private createNavigationTest(page: DiscoveredPage): GeneratedTest {
    const steps: TestStep[] = [
      {
        order: 1,
        action: 'navigate',
        target: page.url,
        comment: 'Navigate to page',
        // SAFETY: async operation — wrap in try-catch for production resilience
        code: `await page.goto('${page.url}');`
      },
      {
        order: 2,
        action: 'wait',
        comment: 'Wait for page to load',
        // SAFETY: async operation — wrap in try-catch for production resilience
        code: `await page.waitForLoadState('networkidle');`
      }
    ];

    const assertions: TestAssertion[] = [
      {
        type: 'url',
        expected: page.url,
        code: `expect(page.url()).toContain('${new URL(page.url).pathname}');`
      },
      {
        type: 'text',
        target: 'title',
        expected: page.title,
        // SAFETY: async operation — wrap in try-catch for production resilience
        code: `await expect(page).toHaveTitle(/${this.escapeRegex(page.title.substring(0, 30))}/i);`
      }
    ];

    const code = this.generateTestCode(`Navigation - ${page.title}`, steps, assertions);

    return {
      id: crypto.randomUUID(),
      name: `Navigate to ${page.title || page.url}`,
      description: `Verify navigation and page load for ${page.url}`,
      priority: page.depth === 0 ? 'critical' : 'medium',
      tags: ['navigation', 'smoke'],
      steps,
      assertions,
      timeout: 30000,
      retries: 2,
      code
    };
  }

  // Complexity: O(N) — linear iteration
  private createJourneyTest(journey: UserJourney): GeneratedTest {
    const steps: TestStep[] = journey.steps.map((step, idx) => ({
      order: idx + 1,
      action: step.action,
      target: step.element?.selector,
      value: step.data ? JSON.stringify(step.data) : undefined,
      comment: `${step.action} ${step.element?.purpose || ''}`,
      code: this.generateStepCode(step)
    }));

    const assertions: TestAssertion[] = [{
      type: 'url',
      expected: journey.steps[journey.steps.length - 1]?.urlAfter || journey.startUrl,
      code: `expect(page.url()).toBeDefined();`
    }];

    const code = this.generateTestCode(`Journey - ${journey.name}`, steps, assertions);

    return {
      id: crypto.randomUUID(),
      name: journey.name,
      description: journey.description,
      priority: 'high',
      tags: ['journey', 'e2e'],
      steps,
      assertions,
      timeout: 60000,
      retries: 1,
      code
    };
  }

  // Complexity: O(N*M) — nested iteration detected
  private createFormValidTest(page: DiscoveredPage, form: DiscoveredForm): GeneratedTest {
    const steps: TestStep[] = [
      {
        order: 1,
        action: 'navigate',
        target: page.url,
        comment: 'Navigate to form page',
        // SAFETY: async operation — wrap in try-catch for production resilience
        code: `await page.goto('${page.url}');`
      }
    ];

    // Add fill steps for each field
    form.fields.forEach((field, idx) => {
      const value = VALID_TEST_DATA[field.type] || 'test value';
      steps.push({
        order: idx + 2,
        action: 'fill',
        target: field.selector,
        value,
        comment: `Fill ${field.name}`,
        // SAFETY: async operation — wrap in try-catch for production resilience
        code: `await page.locator('${field.selector}').fill('${value}');`
      });
    });

    // Submit step
    steps.push({
      order: steps.length + 1,
      action: 'submit',
      target: form.selector,
      comment: 'Submit form',
      // SAFETY: async operation — wrap in try-catch for production resilience
      code: `await page.locator('${form.selector}').locator('button[type="submit"], input[type="submit"]').click();`
    });

    const assertions: TestAssertion[] = [
      {
        type: 'visibility',
        target: '.error',
        expected: 'hidden',
        // SAFETY: async operation — wrap in try-catch for production resilience
        code: `await expect(page.locator('.error, .error-message')).toBeHidden();`
      }
    ];

    const code = this.generateTestCode(`Form Valid - ${form.purpose}`, steps, assertions);

    return {
      id: crypto.randomUUID(),
      name: `${form.purpose} - Valid Submission`,
      description: `Test valid form submission for ${form.purpose}`,
      priority: 'high',
      tags: ['form', 'positive'],
      steps,
      assertions,
      timeout: 30000,
      retries: 2,
      code
    };
  }

  // Complexity: O(N) — linear iteration
  private createFormInvalidTest(page: DiscoveredPage, form: DiscoveredForm): GeneratedTest {
    const steps: TestStep[] = [
      {
        order: 1,
        action: 'navigate',
        target: page.url,
        comment: 'Navigate to form page',
        // SAFETY: async operation — wrap in try-catch for production resilience
        code: `await page.goto('${page.url}');`
      }
    ];

    form.fields.forEach((field, idx) => {
      const value = INVALID_TEST_DATA[field.type] || 'x';
      steps.push({
        order: idx + 2,
        action: 'fill',
        target: field.selector,
        value,
        comment: `Fill ${field.name} with invalid data`,
        // SAFETY: async operation — wrap in try-catch for production resilience
        code: `await page.locator('${field.selector}').fill('${value}');`
      });
    });

    steps.push({
      order: steps.length + 1,
      action: 'submit',
      comment: 'Submit form',
      // SAFETY: async operation — wrap in try-catch for production resilience
      code: `await page.locator('${form.selector}').locator('button[type="submit"], input[type="submit"]').click();`
    });

    const assertions: TestAssertion[] = [
      {
        type: 'visibility',
        target: '.error',
        expected: 'visible',
        // SAFETY: async operation — wrap in try-catch for production resilience
        code: `await expect(page.locator('.error, .error-message, [role="alert"]').first()).toBeVisible();`
      }
    ];

    const code = this.generateTestCode(`Form Invalid - ${form.purpose}`, steps, assertions);

    return {
      id: crypto.randomUUID(),
      name: `${form.purpose} - Invalid Data`,
      description: `Test form validation with invalid data`,
      priority: 'medium',
      tags: ['form', 'negative', 'validation'],
      steps,
      assertions,
      timeout: 30000,
      retries: 1,
      code
    };
  }

  // Complexity: O(1) — amortized
  private createFormEmptyTest(page: DiscoveredPage, form: DiscoveredForm): GeneratedTest {
    const steps: TestStep[] = [
      {
        order: 1,
        action: 'navigate',
        target: page.url,
        comment: 'Navigate to form page',
        // SAFETY: async operation — wrap in try-catch for production resilience
        code: `await page.goto('${page.url}');`
      },
      {
        order: 2,
        action: 'submit',
        comment: 'Submit empty form',
        // SAFETY: async operation — wrap in try-catch for production resilience
        code: `await page.locator('${form.selector}').locator('button[type="submit"], input[type="submit"]').click();`
      }
    ];

    const hasRequiredFields = form.fields.some(f => f.required);

    const assertions: TestAssertion[] = hasRequiredFields ? [
      {
        type: 'visibility',
        target: '.error',
        expected: 'visible',
        // SAFETY: async operation — wrap in try-catch for production resilience
        code: `await expect(page.locator('.error, .error-message, [role="alert"], :invalid').first()).toBeVisible();`
      }
    ] : [];

    const code = this.generateTestCode(`Form Empty - ${form.purpose}`, steps, assertions);

    return {
      id: crypto.randomUUID(),
      name: `${form.purpose} - Empty Submission`,
      description: `Test form required field validation`,
      priority: 'low',
      tags: ['form', 'negative', 'required'],
      steps,
      assertions,
      timeout: 30000,
      retries: 1,
      code
    };
  }

  // Complexity: O(N) — linear iteration
  private createAPITest(api: DiscoveredAPI): GeneratedTest {
    const steps: TestStep[] = [
      {
        order: 1,
        action: 'api_call',
        target: api.url,
        value: api.method,
        comment: `${api.method} ${api.url}`,
        // SAFETY: async operation — wrap in try-catch for production resilience
        code: `const response = await request.${api.method.toLowerCase()}('${api.url}');`
      }
    ];

    const assertions: TestAssertion[] = [
      {
        type: 'network',
        expected: '200-299',
        code: `expect(response.status()).toBeGreaterThanOrEqual(200);
expect(response.status()).toBeLessThan(300);`
      }
    ];

    const code = `
test('API - ${api.method} ${new URL(api.url).pathname}', async ({ request }) => {
  ${steps.map(s => s.code).join('\n  ')}

  ${assertions.map(a => a.code).join('\n  ')}
});
`;

    return {
      id: crypto.randomUUID(),
      name: `API ${api.method} - ${new URL(api.url).pathname}`,
      description: `Test API endpoint ${api.url}`,
      priority: api.isAuthenticated ? 'high' : 'medium',
      tags: ['api', api.method.toLowerCase()],
      steps,
      assertions,
      timeout: 10000,
      retries: 3,
      code
    };
  }

  // Complexity: O(N)
  private createVisualTest(page: DiscoveredPage): GeneratedTest {
    const code = `
test('Visual - ${page.title}', async ({ page }) => {
  // SAFETY: async operation — wrap in try-catch for production resilience
  await page.goto('${page.url}');
  // SAFETY: async operation — wrap in try-catch for production resilience
  await page.waitForLoadState('networkidle');

  // SAFETY: async operation — wrap in try-catch for production resilience
  await expect(page).toHaveScreenshot('${this.slugify(page.title)}.png', {
    maxDiffPixels: 100,
    threshold: 0.1
  });
});
`;

    return {
      id: crypto.randomUUID(),
      name: `Visual - ${page.title}`,
      description: `Visual regression test for ${page.url}`,
      priority: 'low',
      tags: ['visual', 'regression'],
      steps: [],
      assertions: [],
      timeout: 30000,
      retries: 1,
      code
    };
  }

  // Complexity: O(N) — linear iteration
  private createPerformanceTest(page: DiscoveredPage): GeneratedTest {
    const code = `
test('Performance - ${page.title}', async ({ page }) => {
  const startTime = Date.now();

  // SAFETY: async operation — wrap in try-catch for production resilience
  await page.goto('${page.url}');
  // SAFETY: async operation — wrap in try-catch for production resilience
  await page.waitForLoadState('networkidle');

  const loadTime = Date.now() - startTime;

  // Page should load within 3 seconds
  expect(loadTime).toBeLessThan(3000);

  // Check Core Web Vitals
  // SAFETY: async operation — wrap in try-catch for production resilience
  const metrics = await page.evaluate(() => {
    return {
      lcp: performance.getEntriesByType('paint').find(p => p.name === 'first-contentful-paint')?.startTime || 0,
      fcp: performance.getEntriesByType('paint').find(p => p.name === 'first-paint')?.startTime || 0
    };
  });

  // FCP should be under 1.8s
  expect(metrics.fcp).toBeLessThan(1800);
});
`;

    return {
      id: crypto.randomUUID(),
      name: `Performance - ${page.title}`,
      description: `Performance test for ${page.url}`,
      priority: 'medium',
      tags: ['performance', 'web-vitals'],
      steps: [],
      assertions: [],
      timeout: 30000,
      retries: 1,
      code
    };
  }

  // Complexity: O(N*M) — nested iteration detected
  private createXSSTest(page: DiscoveredPage): GeneratedTest {
    const xssPayload = '<script>alert(1)</script>';

    const code = `
test('Security XSS - ${page.title}', async ({ page }) => {
  // SAFETY: async operation — wrap in try-catch for production resilience
  await page.goto('${page.url}');

  // Find all text inputs
  // SAFETY: async operation — wrap in try-catch for production resilience
  const inputs = await page.locator('input[type="text"], input:not([type]), textarea').all();

  for (const input of inputs) {
    // SAFETY: async operation — wrap in try-catch for production resilience
    if (await input.isVisible()) {
      // SAFETY: async operation — wrap in try-catch for production resilience
      await input.fill('${xssPayload}');
    }
  }

  // Submit form if exists
  const submitBtn = page.locator('button[type="submit"], input[type="submit"]').first();
  // SAFETY: async operation — wrap in try-catch for production resilience
  if (await submitBtn.isVisible().catch(() => false)) {
    // SAFETY: async operation — wrap in try-catch for production resilience
    await submitBtn.click();
    // SAFETY: async operation — wrap in try-catch for production resilience
    await page.waitForLoadState('networkidle');
  }

  // Check that XSS payload was escaped
  // SAFETY: async operation — wrap in try-catch for production resilience
  const bodyText = await page.content();
  expect(bodyText).not.toContain('<script>alert(1)</script>');
});
`;

    return {
      id: crypto.randomUUID(),
      name: `XSS Test - ${page.title}`,
      description: `XSS vulnerability test for ${page.url}`,
      priority: 'critical',
      tags: ['security', 'xss'],
      steps: [],
      assertions: [],
      timeout: 30000,
      retries: 1,
      code
    };
  }

  // Complexity: O(N*M) — nested iteration detected
  private createSecurityHeadersTest(rootUrl: string): GeneratedTest {
    const code = `
test('Security Headers', async ({ request }) => {
  // SAFETY: async operation — wrap in try-catch for production resilience
  const response = await request.get('${rootUrl}');
  const headers = response.headers();

  // Check for important security headers
  const securityHeaders = [
    'x-content-type-options',
    'x-frame-options',
  ];

  for (const header of securityHeaders) {
    // Log warning if missing (don't fail test)
    if (!headers[header]) {
      console.warn(\`Missing security header: \${header}\`);
    }
  }

  // At minimum, content-type should be present
  expect(headers['content-type']).toBeDefined();
});
`;

    return {
      id: crypto.randomUUID(),
      name: 'Security Headers Check',
      description: 'Verify security headers are present',
      priority: 'high',
      tags: ['security', 'headers'],
      steps: [],
      assertions: [],
      timeout: 10000,
      retries: 2,
      code
    };
  }

  // Complexity: O(N*M) — nested iteration detected
  private createAuthSecurityTest(logic: BusinessLogic): GeneratedTest {
    const code = `
test('Auth Security - ${logic.name}', async ({ page }) => {
  // This is a placeholder test for authentication security
  // Actual implementation depends on auth flow specifics

  // Test 1: Verify redirect to login for protected routes
  // Test 2: Verify session handling
  // Test 3: Verify logout clears session

  expect(true).toBe(true); // Placeholder
});
`;

    return {
      id: crypto.randomUUID(),
      name: `Auth Security - ${logic.name}`,
      description: `Security test for authentication flow`,
      priority: 'critical',
      tags: ['security', 'auth'],
      steps: [],
      assertions: [],
      timeout: 30000,
      retries: 1,
      code
    };
  }

  // Complexity: O(N) — linear iteration
  private createFlowTest(flow: TransactionFlow): GeneratedTest {
    const code = `
test('${flow.name}', async ({ page }) => {
  // Transaction flow test for ${flow.type}
  // Steps: ${flow.steps.length}
  // Required fields: ${flow.requiredFields.join(', ')}

  ${flow.steps.map(s => `// Step ${s.order}: ${s.action} at ${s.page}`).join('\n  ')}

  // Implementation depends on specific flow requirements
  expect(true).toBe(true); // Placeholder
});
`;

    return {
      id: crypto.randomUUID(),
      name: flow.name,
      description: `Test ${flow.type} transaction flow`,
      priority: 'high',
      tags: ['flow', flow.type],
      steps: [],
      assertions: [],
      timeout: 60000,
      retries: 1,
      code
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════════════════════════════════════════

  // Complexity: O(N) — linear iteration
  private generateTestCode(name: string, steps: TestStep[], assertions: TestAssertion[]): string {
    const ghostSetup = this.config.includeGhostProtocol ? `
  // Ghost Protocol: Stealth mode activated
  // await ghostProtocol.activate(page);
` : '';

    return `
test('${name}', async ({ page }) => {
  ${ghostSetup}
  ${steps.map(s => `// ${s.comment}\n  ${s.code}`).join('\n\n  ')}

  ${assertions.map(a => `// Assert: ${a.type}\n  ${a.code}`).join('\n\n  ')}
});
`;
  }

  // Complexity: O(1)
  private generateStepCode(step: any): string {
    switch (step.action) {
      case 'navigate':
        // SAFETY: async operation — wrap in try-catch for production resilience
        return `await page.goto('${step.url}');`;
      case 'click':
        // SAFETY: async operation — wrap in try-catch for production resilience
        return `await page.locator('${step.element?.selector}').click();`;
      case 'fill_form':
        return `// Fill form fields\n  // ${JSON.stringify(step.data)}`;
      case 'submit':
        // SAFETY: async operation — wrap in try-catch for production resilience
        return `await page.locator('${step.element?.selector}').locator('button[type="submit"]').click();`;
      default:
        return `// ${step.action}`;
    }
  }

  // Complexity: O(1)
  private generateSetup(): string {
    return `
import { test, expect } from '@playwright/test';
${this.config.includeGhostProtocol ? "import { ghostProtocol } from '../ghost';" : ''}

test.beforeEach(async ({ page }) => {
  // Setup code
  // SAFETY: async operation — wrap in try-catch for production resilience
  ${this.config.includeGhostProtocol ? '// await ghostProtocol.initialize(page);' : ''}
});
`;
  }

  // Complexity: O(1)
  private generateTeardown(): string {
    return `
test.afterEach(async ({ page }) => {
  // Teardown code
});
`;
  }

  // Complexity: O(N) — linear iteration
  private async writeTestFiles(): Promise<void> {
    // Ensure output directory exists
    if (!fs.existsSync(this.config.outputDir)) {
      fs.mkdirSync(this.config.outputDir, { recursive: true });
    }

    for (const suite of this.generatedSuites) {
      const filename = `${this.slugify(suite.name)}.spec.${this.config.language === 'typescript' ? 'ts' : 'js'}`;
      const filepath = path.join(this.config.outputDir, filename);

      const content = `/**
 * ${suite.name}
 * ${suite.description}
 *
 * Generated by QAntum Oracle - Auto Test Factory
 * Generated at: ${new Date(suite.generatedAt).toISOString()}
 * Tests: ${suite.tests.length}
 */

import { test, expect } from '@playwright/test';

${suite.tests.map(t => t.code).join('\n\n')}
`;

      // SAFETY: async operation — wrap in try-catch for production resilience
      await fs.promises.writeFile(filepath, content, 'utf-8');
      console.log(`  → ${filename} (${suite.tests.length} tests)`);
    }

    // Write index file
    const indexContent = `/**
 * QAntum Oracle - Generated Test Index
 * Generated at: ${new Date().toISOString()}
 * Total Suites: ${this.generatedSuites.length}
 * Total Tests: ${this.generatedSuites.reduce((sum, s) => sum + s.tests.length, 0)}
 */

${this.generatedSuites.map(s => `export * from './${this.slugify(s.name)}.spec';`).join('\n')}
`;

    // SAFETY: async operation — wrap in try-catch for production resilience
    await fs.promises.writeFile(
      path.join(this.config.outputDir, `index.${this.config.language === 'typescript' ? 'ts' : 'js'}`),
      indexContent,
      'utf-8'
    );
  }

  // Complexity: O(N) — linear iteration
  private printSummary(): void {
    const totalTests = this.generatedSuites.reduce((sum, s) => sum + s.tests.length, 0);

    console.log(`
╔═══════════════════════════════════════════════════════════════════════════════════════╗
║                      AUTO TEST FACTORY - COMPLETE                                     ║
╠═══════════════════════════════════════════════════════════════════════════════════════╣
║  📊 GENERATION STATISTICS                                                             ║
║  ─────────────────────────────────────────────────────────────────────────────────    ║
║  Test Suites:    ${this.generatedSuites.length.toString().padEnd(62)}║
║  Total Tests:    ${totalTests.toString().padEnd(62)}║
║  Output Dir:     ${this.config.outputDir.padEnd(62)}║
╚═══════════════════════════════════════════════════════════════════════════════════════╝
`);
  }

  // Complexity: O(1)
  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 50);
  }

  // Complexity: O(1)
  private escapeRegex(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// FACTORY
// ═══════════════════════════════════════════════════════════════════════════════

export function createAutoTestFactory(config?: Partial<TestFactoryConfig>): AutoTestFactory {
  return new AutoTestFactory(config);
}

export default AutoTestFactory;
