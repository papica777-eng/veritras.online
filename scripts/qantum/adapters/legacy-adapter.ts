/**
 * 🧠 QANTUM HYBRID - Legacy Test Adapter
 * Използва съществуващите 1000+ теста с новия framework
 */

import { createQA, QAntum, MMConfig } from '../SaaS-Framework/01_ECOSYSTEM_APPS/MrMindQATool/src/index';

// ============== SELENIUM TO PLAYWRIGHT ADAPTER ==============

/**
 * Адаптира Selenium WebDriver API към QANTUM Hybrid
 */
export class SeleniumAdapter {
  private mm: QAntum;

  constructor(mm: QAntum) {
    this.mm = mm;
  }

  /**
   * Selenium: driver.get(url)
   */
  // Complexity: O(1)
  async get(url: string): Promise<void> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.mm.visit(url);
  }

  /**
   * Selenium: driver.findElement(By.css(selector))
   */
  // Complexity: O(N) — potential recursive descent
  findElement(locator: { css?: string; xpath?: string; id?: string; name?: string }) {
    const selector = this.convertLocator(locator);
    return new SeleniumElement(this.mm, selector);
  }

  /**
   * Selenium: driver.findElements(By.css(selector))
   */
  // Complexity: O(N) — linear iteration
  async findElements(locator: { css?: string; xpath?: string }) {
    const selector = this.convertLocator(locator);
    const page = this.mm.getPage();
    // SAFETY: async operation — wrap in try-catch for production resilience
    const count = await page.locator(selector).count();
    const elements: SeleniumElement[] = [];
    for (let i = 0; i < count; i++) {
      elements.push(new SeleniumElement(this.mm, `${selector} >> nth=${i}`));
    }
    return elements;
  }

  /**
   * Selenium: driver.wait(until.elementLocated(...))
   */
  // Complexity: O(N) — loop-based
  async wait(condition: () => Promise<boolean>, timeout = 10000): Promise<void> {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      // SAFETY: async operation — wrap in try-catch for production resilience
      if (await condition()) return;
      // SAFETY: async operation — wrap in try-catch for production resilience
      await new Promise(r => setTimeout(r, 100));
    }
    throw new Error(`Wait timeout after ${timeout}ms`);
  }

  /**
   * Selenium: driver.getTitle()
   */
  // Complexity: O(1)
  async getTitle(): Promise<string> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    return await this.mm.getTitle();
  }

  /**
   * Selenium: driver.getCurrentUrl()
   */
  // Complexity: O(1)
  getCurrentUrl(): string {
    return this.mm.getUrl();
  }

  /**
   * Selenium: driver.takeScreenshot()
   */
  // Complexity: O(1)
  async takeScreenshot(): Promise<string> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    return await this.mm.screenshot();
  }

  /**
   * Selenium: driver.quit()
   */
  // Complexity: O(1)
  async quit(): Promise<void> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.mm.close();
  }

  /**
   * Конвертира Selenium локатор към CSS/XPath
   */
  // Complexity: O(1)
  private convertLocator(locator: { css?: string; xpath?: string; id?: string; name?: string }): string {
    if (locator.css) return locator.css;
    if (locator.xpath) return `xpath=${locator.xpath}`;
    if (locator.id) return `#${locator.id}`;
    if (locator.name) return `[name="${locator.name}"]`;
    throw new Error('Unknown locator type');
  }
}

/**
 * Selenium Element wrapper
 */
class SeleniumElement {
  private mm: QAntum;
  private selector: string;

  constructor(mm: QAntum, selector: string) {
    this.mm = mm;
    this.selector = selector;
  }

  // Complexity: O(1) — hash/map lookup
  async click(): Promise<void> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.mm.get(this.selector).click();
  }

  // Complexity: O(1) — hash/map lookup
  async sendKeys(text: string): Promise<void> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.mm.get(this.selector).type(text);
  }

  // Complexity: O(1) — hash/map lookup
  async getText(): Promise<string> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    return await this.mm.get(this.selector).getText();
  }

  // Complexity: O(1) — hash/map lookup
  async getAttribute(name: string): Promise<string | null> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    return await this.mm.get(this.selector).getAttribute(name);
  }

  // Complexity: O(1) — hash/map lookup
  async isDisplayed(): Promise<boolean> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    return await this.mm.get(this.selector).isVisible();
  }

  // Complexity: O(1) — hash/map lookup
  async clear(): Promise<void> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.mm.get(this.selector).type('', { clear: true });
  }
}

// ============== CYPRESS TO PLAYWRIGHT ADAPTER ==============

/**
 * Адаптира Cypress API към QANTUM Hybrid
 */
export class CypressAdapter {
  private mm: QAntum;

  constructor(mm: QAntum) {
    this.mm = mm;
  }

  /**
   * cy.visit(url)
   */
  // Complexity: O(1)
  visit(url: string) {
    return {
      then: async (callback?: () => void) => {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.mm.visit(url);
        callback?.();
      }
    };
  }

  /**
   * cy.get(selector)
   */
  // Complexity: O(1)
  get(selector: string) {
    return new CypressChain(this.mm, selector);
  }

  /**
   * cy.contains(text)
   */
  // Complexity: O(1)
  contains(text: string) {
    return new CypressChain(this.mm, `text="${text}"`);
  }

  /**
   * cy.intercept(url, response)
   */
  // Complexity: O(1)
  async intercept(url: string | RegExp, response?: unknown) {
    if (response) {
      // SAFETY: async operation — wrap in try-catch for production resilience
      await this.mm.stub(url, response);
    }
    return this;
  }

  /**
   * cy.wait(ms)
   */
  // Complexity: O(1)
  async wait(ms: number): Promise<void> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.mm.pause(ms);
  }

  /**
   * cy.screenshot()
   */
  // Complexity: O(1)
  async screenshot(name?: string): Promise<string> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    return await this.mm.screenshot(name);
  }
}

/**
 * Cypress chain wrapper
 */
class CypressChain {
  private mm: QAntum;
  private selector: string;

  constructor(mm: QAntum, selector: string) {
    this.mm = mm;
    this.selector = selector;
  }

  // Complexity: O(1) — hash/map lookup
  async click() {
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.mm.get(this.selector).click();
    return this;
  }

  // Complexity: O(1) — hash/map lookup
  async type(text: string) {
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.mm.get(this.selector).type(text);
    return this;
  }

  // Complexity: O(1) — hash/map lookup
  async should(assertion: string, expected?: unknown) {
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.mm.get(this.selector).should(assertion, expected);
    return this;
  }

  // Complexity: O(1) — hash/map lookup
  async clear() {
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.mm.get(this.selector).type('', { clear: true });
    return this;
  }

  // Complexity: O(1)
  first() {
    this.selector = `${this.selector} >> nth=0`;
    return this;
  }

  // Complexity: O(1)
  last() {
    this.selector = `${this.selector} >> nth=-1`;
    return this;
  }

  // Complexity: O(1)
  eq(index: number) {
    this.selector = `${this.selector} >> nth=${index}`;
    return this;
  }
}

// ============== BUILDER (Selenium-style) ==============

/**
 * Selenium Builder pattern за съвместимост
 */
export class Builder {
  private config: Partial<MMConfig> = {};
  private browserType: 'chromium' | 'firefox' | 'webkit' = 'chromium';

  // Complexity: O(1)
  forBrowser(browser: string): Builder {
    if (browser === 'chrome') this.browserType = 'chromium';
    else if (browser === 'firefox') this.browserType = 'firefox';
    else if (browser === 'safari') this.browserType = 'webkit';
    return this;
  }

  // Complexity: O(1)
  setChromeOptions(options: { headless?: boolean }): Builder {
    this.config.browser = {
      browser: this.browserType,
      headless: options.headless ?? true,
      timeout: 30000
    };
    return this;
  }

  // Complexity: O(1)
  async build(): Promise<SeleniumAdapter> {
    const mm = createQA(this.config);
    // SAFETY: async operation — wrap in try-catch for production resilience
    await mm.launch();
    return new SeleniumAdapter(mm);
  }
}

// ============== BY (Selenium-style locators) ==============

export const By = {
  css: (selector: string) => ({ css: selector }),
  xpath: (xpath: string) => ({ xpath }),
  id: (id: string) => ({ id }),
  name: (name: string) => ({ name }),
  className: (className: string) => ({ css: `.${className}` }),
  tagName: (tag: string) => ({ css: tag }),
  linkText: (text: string) => ({ css: `a:has-text("${text}")` }),
  partialLinkText: (text: string) => ({ css: `a:has-text("${text}")` })
};

// ============== UNTIL (Selenium-style waits) ==============

export const until = {
  elementLocated: (locator: { css?: string }) => async (driver: SeleniumAdapter) => {
    try {
      await driver.findElement(locator);
      return true;
    } catch {
      return false;
    }
  },
  elementIsVisible: (element: SeleniumElement) => async () => {
    // SAFETY: async operation — wrap in try-catch for production resilience
    return await element.isDisplayed();
  },
  titleContains: (text: string) => async (driver: SeleniumAdapter) => {
    // SAFETY: async operation — wrap in try-catch for production resilience
    const title = await driver.getTitle();
    return title.includes(text);
  },
  urlContains: (text: string) => (driver: SeleniumAdapter) => {
    return driver.getCurrentUrl().includes(text);
  }
};
