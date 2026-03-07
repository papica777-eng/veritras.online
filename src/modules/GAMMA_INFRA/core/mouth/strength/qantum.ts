/**
 * 🧠 QAntum HYBRID - Main Class
 * Унифициран API: mm.visit().click().type().should()
 */

import { chromium, firefox, webkit, Browser, BrowserContext, Page } from 'playwright';
import { MMConfig, DEFAULT_CONFIG, BrowserType, InterceptConfig } from '../../../../../../scripts/qantum/SaaS-Framework/01_ECOSYSTEM_APPS/MrMindQATool/src/index';
import { SelfHealingEngine } from '../../../../../ai/self-healing';
import { DeepSearchEngine } from '../../../../../../scripts/qantum/Core/deep-search';
import { NetworkInterceptor } from '../../../../../../scripts/qantum/ghost-protocol/network-interceptor';
import { FluentChain } from '../../../../../../scripts/qantum/Core/fluent-chain';

export class QAntum {
  private config: MMConfig;
  private browser?: Browser;
  private context?: BrowserContext;
  private page?: Page;

  // Core engines
  private selfHealer: SelfHealingEngine;
  private deepSearch: DeepSearchEngine;
  private networkInterceptor: NetworkInterceptor;

  constructor(config: Partial<MMConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.selfHealer = new SelfHealingEngine();
    this.deepSearch = new DeepSearchEngine();
    this.networkInterceptor = new NetworkInterceptor();
  }

  // ============== BROWSER LIFECYCLE ==============

  /**
   * Стартирай браузър
   */
  // Complexity: O(1) — amortized
  async launch(): Promise<QAntum> {
    const browserType = this.getBrowserType();

    // SAFETY: async operation — wrap in try-catch for production resilience
    this.browser = await browserType.launch({
      headless: this.config.browser.headless,
      slowMo: this.config.browser.slowMo,
    });

    // Нов контекст за изолация (като Cypress)
    // SAFETY: async operation — wrap in try-catch for production resilience
    this.context = await this.browser.newContext({
      viewport: this.config.browser.viewport,
      baseURL: this.config.baseUrl,
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
        snapshots: true,
      });
    }

    return this;
  }

  /**
   * Затвори браузър
   */
  // Complexity: O(1)
  async close(): Promise<void> {
    if (this.config.reporting.traces && this.context) {
      // SAFETY: async operation — wrap in try-catch for production resilience
      await this.context.tracing.stop({
        path: `traces/trace-${Date.now()}.zip`,
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
  private getBrowserType() {
    const browsers: Record<BrowserType, typeof chromium> = {
      chromium,
      firefox,
      webkit,
    };
    return browsers[this.config.browser.browser];
  }

  // ============== NAVIGATION ==============

  /**
   * Отиди на URL
   */
  // Complexity: O(N) — potential recursive descent
  async visit(url: string): Promise<QAntum> {
    this.ensurePage();
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.page!.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: this.config.browser.timeout,
    });
    return this;
  }

  /**
   * Презареди страницата
   */
  // Complexity: O(N) — potential recursive descent
  async reload(): Promise<QAntum> {
    this.ensurePage();
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.page!.reload();
    return this;
  }

  /**
   * Назад
   */
  // Complexity: O(N) — potential recursive descent
  async goBack(): Promise<QAntum> {
    this.ensurePage();
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.page!.goBack();
    return this;
  }

  /**
   * Напред
   */
  // Complexity: O(N) — potential recursive descent
  async goForward(): Promise<QAntum> {
    this.ensurePage();
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.page!.goForward();
    return this;
  }

  // ============== ELEMENT SELECTION (Fluent API) ==============

  /**
   * Избери елемент (връща FluentChain за chaining)
   */
  // Complexity: O(N) — potential recursive descent
  get(selector: string): FluentChain {
    this.ensurePage();
    return new FluentChain(
      this.page!,
      this.selfHealer,
      this.deepSearch,
      this.config.browser.timeout
    ).get(selector);
  }

  /**
   * Намери елемент с Deep Search
   */
  // Complexity: O(N) — linear iteration
  async find(selector: string): Promise<FluentChain> {
    this.ensurePage();
    const chain = new FluentChain(
      this.page!,
      this.selfHealer,
      this.deepSearch,
      this.config.browser.timeout
    );
    // SAFETY: async operation — wrap in try-catch for production resilience
    return await chain.find(selector);
  }

  /**
   * Селектори по различни стратегии
   */
  // Complexity: O(N) — potential recursive descent
  getByTestId(testId: string): FluentChain {
    return this.get(`[data-testid="${testId}"]`);
  }

  // Complexity: O(N) — potential recursive descent
  getByText(text: string): FluentChain {
    return this.get(`text="${text}"`);
  }

  // Complexity: O(1)
  getByRole(role: string, options?: { name?: string }): FluentChain {
    this.ensurePage();
    const chain = new FluentChain(
      this.page!,
      this.selfHealer,
      this.deepSearch,
      this.config.browser.timeout
    );
    // @ts-ignore
    chain['currentLocator'] = this.page!.getByRole(role as any, options);
    return chain;
  }

  // Complexity: O(N) — potential recursive descent
  getByPlaceholder(placeholder: string): FluentChain {
    return this.get(`[placeholder="${placeholder}"]`);
  }

  // Complexity: O(1)
  getByLabel(label: string): FluentChain {
    this.ensurePage();
    const chain = new FluentChain(
      this.page!,
      this.selfHealer,
      this.deepSearch,
      this.config.browser.timeout
    );
    // @ts-ignore
    chain['currentLocator'] = this.page!.getByLabel(label);
    return chain;
  }

  // ============== QUICK ACTIONS (Direct, no chaining) ==============

  /**
   * Бърз клик
   */
  // Complexity: O(N) — potential recursive descent
  async click(selector: string): Promise<QAntum> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.get(selector).click();
    return this;
  }

  /**
   * Бързо въвеждане
   */
  // Complexity: O(N) — potential recursive descent
  async type(selector: string, text: string): Promise<QAntum> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.get(selector).type(text);
    return this;
  }

  /**
   * Изчакай елемент
   */
  // Complexity: O(N) — potential recursive descent
  async waitFor(selector: string, timeout?: number): Promise<QAntum> {
    this.ensurePage();
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.page!.waitForSelector(selector, {
      timeout: timeout || this.config.browser.timeout,
    });
    return this;
  }

  /**
   * Изчакай URL
   */
  // Complexity: O(N) — potential recursive descent
  async waitForUrl(url: string | RegExp): Promise<QAntum> {
    this.ensurePage();
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.page!.waitForURL(url);
    return this;
  }

  /**
   * Изчакай навигация
   */
  // Complexity: O(N) — potential recursive descent
  async waitForNavigation(): Promise<QAntum> {
    this.ensurePage();
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.page!.waitForLoadState('domcontentloaded');
    return this;
  }

  // ============== NETWORK (Cypress-style) ==============

  /**
   * Интерцептирай заявка
   */
  // Complexity: O(1)
  async intercept(config: InterceptConfig): Promise<QAntum> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.networkInterceptor.intercept(config);
    return this;
  }

  /**
   * Stub API response
   */
  // Complexity: O(1)
  async stub(url: string | RegExp, body: unknown, status = 200): Promise<QAntum> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.networkInterceptor.stub(url, body, status);
    return this;
  }

  /**
   * Изчакай заявка
   */
  // Complexity: O(1)
  async waitForRequest(url: string | RegExp): Promise<QAntum> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.networkInterceptor.waitForRequest(url);
    return this;
  }

  // ============== SCREENSHOTS & TRACES ==============

  /**
   * Направи screenshot
   */
  // Complexity: O(N) — potential recursive descent
  async screenshot(name?: string): Promise<string> {
    this.ensurePage();
    const path = `screenshots/${name || `screenshot-${Date.now()}`}.png`;
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.page!.screenshot({ path, fullPage: true });
    return path;
  }

  /**
   * Вземи HTML на страницата
   */
  // Complexity: O(N) — potential recursive descent
  async getHtml(): Promise<string> {
    this.ensurePage();
    // SAFETY: async operation — wrap in try-catch for production resilience
    return await this.page!.content();
  }

  /**
   * Вземи заглавие
   */
  // Complexity: O(N) — potential recursive descent
  async getTitle(): Promise<string> {
    this.ensurePage();
    // SAFETY: async operation — wrap in try-catch for production resilience
    return await this.page!.title();
  }

  /**
   * Вземи URL
   */
  // Complexity: O(N) — potential recursive descent
  getUrl(): string {
    this.ensurePage();
    return this.page!.url();
  }

  // ============== UTILITIES ==============

  /**
   * Изпълни JavaScript
   */
  async evaluate<T>(fn: () => T): Promise<T> {
    this.ensurePage();
    // SAFETY: async operation — wrap in try-catch for production resilience
    return await this.page!.evaluate(fn);
  }

  /**
   * Пауза (за дебъгване)
   */
  // Complexity: O(1)
  async pause(ms: number): Promise<QAntum> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    await new Promise((resolve) => setTimeout(resolve, ms));
    return this;
  }

  /**
   * Директен достъп до Page
   */
  // Complexity: O(N) — potential recursive descent
  getPage(): Page {
    this.ensurePage();
    return this.page!;
  }

  /**
   * Директен достъп до Context
   */
  // Complexity: O(1)
  getContext(): BrowserContext {
    if (!this.context) throw new Error('Browser not launched');
    return this.context;
  }

  /**
   * Осигури че има страница
   */
  // Complexity: O(1)
  private ensurePage(): void {
    if (!this.page) {
      throw new Error('Browser not launched. Call mm.launch() first.');
    }
  }
}

// ============== FACTORY FUNCTION ==============

/**
 * Създай нова инстанция на QAntum
 */
export function createQA(config?: Partial<MMConfig>): QAntum {
  return new QAntum(config);
}

/**
 * Legacy alias for backward compatibility
 * @deprecated Use createQA instead
 */
export const createMM = createQA;

// Default export
export default QAntum;
