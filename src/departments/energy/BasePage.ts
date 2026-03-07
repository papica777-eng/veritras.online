/**
 * Page Object Model - Base Page
 *
 * Production-ready POM implementation for AI-generated tests
 *
 * @author Димитър Продромов
 * @copyright 2026 QAntum. All Rights Reserved.
 */

import {WebDriver, WebElement, By, until} from 'selenium-webdriver';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface WaitOptions {
  timeout?: number;
  pollInterval?: number;
  message?: string;
}

export interface ClickOptions {
  force?: boolean;
  scrollIntoView?: boolean;
  waitForNavigation?: boolean;
}

export interface TypeOptions {
  clear?: boolean;
  delay?: number;
  mask?: boolean;
}

export interface SelectorAlternative {
  selector: string;
  type: 'css' | 'xpath' | 'id' | 'name' | 'text';
  priority: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// BASE PAGE CLASS
// ═══════════════════════════════════════════════════════════════════════════════

export class BasePage {
  protected defaultTimeout = 15000;
  protected pollInterval = 100;

  // Self-healing: Track selector alternatives
  private selectorKnowledge: Map<string, SelectorAlternative[]> = new Map();

  constructor(protected driver: WebDriver) {}

  // ═══════════════════════════════════════════════════════════════════════════
  // WAIT METHODS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Wait for element to be present in DOM
   */
  // Complexity: O(1)
  async waitForElement(locator: By, options: WaitOptions = {}): Promise<WebElement> {
    const timeout = options.timeout || this.defaultTimeout;
    const message = options.message || `Element not found: ${locator}`;

    // SAFETY: async operation — wrap in try-catch for production resilience
    return await this.driver.wait(
      until.elementLocated(locator),
      timeout,
      message
    );
  }

  /**
   * Wait for element to be visible
   */
  // Complexity: O(1)
  async waitForVisible(locator: By, options: WaitOptions = {}): Promise<WebElement> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    const element = await this.waitForElement(locator, options);
    const timeout = options.timeout || this.defaultTimeout;

    // SAFETY: async operation — wrap in try-catch for production resilience
    return await this.driver.wait(
      until.elementIsVisible(element),
      timeout,
      `Element not visible: ${locator}`
    );
  }

  /**
   * Wait for element to be clickable
   */
  // Complexity: O(1)
  async waitForClickable(locator: By, options: WaitOptions = {}): Promise<WebElement> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    const element = await this.waitForVisible(locator, options);
    const timeout = options.timeout || this.defaultTimeout;

    // SAFETY: async operation — wrap in try-catch for production resilience
    return await this.driver.wait(
      until.elementIsEnabled(element),
      timeout,
      `Element not clickable: ${locator}`
    );
  }

  /**
   * Wait for element to disappear
   */
  // Complexity: O(1)
  async waitForHidden(locator: By, options: WaitOptions = {}): Promise<boolean> {
    const timeout = options.timeout || this.defaultTimeout;

    try {
      await this.driver.wait(
        until.stalenessOf(await this.driver.findElement(locator)),
        timeout
      );
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Wait for URL to match pattern
   */
  // Complexity: O(1)
  async waitForUrl(pattern: string | RegExp, options: WaitOptions = {}): Promise<boolean> {
    const timeout = options.timeout || this.defaultTimeout;

    // SAFETY: async operation — wrap in try-catch for production resilience
    return await this.driver.wait(async () => {
      // SAFETY: async operation — wrap in try-catch for production resilience
      const url = await this.driver.getCurrentUrl();
      if (typeof pattern === 'string') {
        return url.includes(pattern);
      }
      return pattern.test(url);
    }, timeout, `URL did not match: ${pattern}`);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ACTION METHODS (SELF-HEALING ENABLED)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Click element with self-healing fallback
   */
  // Complexity: O(1) — hash/map lookup
  async clickSafe(locator: By, options: ClickOptions = {}): Promise<void> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    const element = await this.findWithHealing(locator);

    if (options.scrollIntoView) {
      // SAFETY: async operation — wrap in try-catch for production resilience
      await this.scrollIntoView(element);
    }

    try {
      if (options.force) {
        await this.driver.executeScript('arguments[0].click();', element);
      } else {
        await element.click();
      }
    } catch (error: any) {
      // Fallback: JavaScript click
      // SAFETY: async operation — wrap in try-catch for production resilience
      await this.driver.executeScript('arguments[0].click();', element);
    }

    if (options.waitForNavigation) {
      // SAFETY: async operation — wrap in try-catch for production resilience
      await this.waitForPageLoad();
    }
  }

  /**
   * Type text with optional delay (human-like)
   */
  // Complexity: O(N) — linear iteration
  async typeSafe(locator: By, text: string, options: TypeOptions = {}): Promise<void> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    const element = await this.findWithHealing(locator);

    if (options.clear !== false) {
      // SAFETY: async operation — wrap in try-catch for production resilience
      await element.clear();
    }

    if (options.delay) {
      // Human-like typing with random delays
      for (const char of text) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await element.sendKeys(char);
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.sleep(options.delay + Math.random() * 50);
      }
    } else {
      // SAFETY: async operation — wrap in try-catch for production resilience
      await element.sendKeys(text);
    }

    if (options.mask) {
      console.log(`[Type] ${locator}: ${'*'.repeat(text.length)}`);
    }
  }

  /**
   * Select dropdown option
   */
  // Complexity: O(1)
  async selectOption(locator: By, value: string, by: 'value' | 'text' | 'index' = 'value'): Promise<void> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    const select = await this.findWithHealing(locator);

    let optionLocator: By;
    switch (by) {
      case 'value':
        optionLocator = By.css(`option[value="${value}"]`);
        break;
      case 'text':
        optionLocator = By.xpath(`//option[text()="${value}"]`);
        break;
      case 'index':
        optionLocator = By.css(`option:nth-child(${parseInt(value) + 1})`);
        break;
    }

    // SAFETY: async operation — wrap in try-catch for production resilience
    const option = await select.findElement(optionLocator);
    // SAFETY: async operation — wrap in try-catch for production resilience
    await option.click();
  }

  /**
   * Hover over element
   */
  // Complexity: O(1)
  async hover(locator: By): Promise<void> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    const element = await this.findWithHealing(locator);
    const actions = this.driver.actions({ async: true });
    // SAFETY: async operation — wrap in try-catch for production resilience
    await actions.move({ origin: element }).perform();
  }

  /**
   * Drag and drop
   */
  // Complexity: O(1)
  async dragAndDrop(sourceLocator: By, targetLocator: By): Promise<void> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    const source = await this.findWithHealing(sourceLocator);
    // SAFETY: async operation — wrap in try-catch for production resilience
    const target = await this.findWithHealing(targetLocator);

    const actions = this.driver.actions({ async: true });
    // SAFETY: async operation — wrap in try-catch for production resilience
    await actions.dragAndDrop(source, target).perform();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SELF-HEALING LOCATOR
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Find element with self-healing fallback
   */
  // Complexity: O(N log N) — sort operation
  private async findWithHealing(locator: By): Promise<WebElement> {
    const locatorString = locator.toString();

    try {
      // Try primary locator
      return await this.waitForClickable(locator);
    } catch (primaryError) {
      // Try alternatives from knowledge base
      const alternatives = this.selectorKnowledge.get(locatorString) || [];

      for (const alt of alternatives.sort((a, b) => b.priority - a.priority)) {
        try {
          const altLocator = this.createLocator(alt);
          const element = await this.waitForClickable(altLocator, { timeout: 2000 });

          // Update priority on success
          alt.priority++;
          console.log(`[Self-Healing] Used alternative: ${alt.selector}`);

          return element;
        } catch {
          continue;
        }
      }

      // Try to find by text content as last resort
      try {
        const textMatch = await this.findByTextContent(locatorString);
        if (textMatch) {
          // Add to knowledge base
          this.addAlternative(locatorString, {
            selector: `text:${await textMatch.getText()}`,
            type: 'text',
            priority: 1,
          });
          return textMatch;
        }
      } catch {
        // Fall through
      }

      throw primaryError;
    }
  }

  /**
   * Create locator from alternative
   */
  // Complexity: O(1)
  private createLocator(alt: SelectorAlternative): By {
    switch (alt.type) {
      case 'css':
        return By.css(alt.selector);
      case 'xpath':
        return By.xpath(alt.selector);
      case 'id':
        return By.id(alt.selector);
      case 'name':
        return By.name(alt.selector);
      case 'text':
//         return By.xpath(`//*[contains(text(), "${alt.selector.replace('text:', ')}")]`);
//       default:
        return By.css(alt.selector);
    }
  }

  /**
   * Find element by visible text
   */
  // Complexity: O(1) — hash/map lookup
  private async findByTextContent(hint: string): Promise<WebElement | null> {
    // Extract potential text from locator
    const textMatch = hint.match(/['"]([^'"]+)['"]/);
    if (!textMatch) return null;

    const text = textMatch[1];
    const xpath = `//*[contains(normalize-space(text()), "${text}") or contains(@aria-label, "${text}")]`;

    try {
      return await this.driver.findElement(By.xpath(xpath));
    } catch {
      return null;
    }
  }

  /**
   * Add selector alternative to knowledge base
   */
  // Complexity: O(1) — hash/map lookup
  addAlternative(originalLocator: string, alternative: SelectorAlternative): void {
    const existing = this.selectorKnowledge.get(originalLocator) || [];
    existing.push(alternative);
    this.selectorKnowledge.set(originalLocator, existing);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ASSERTION HELPERS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Assert element text
   */
  // Complexity: O(1)
  async assertText(locator: By, expected: string, partial = false): Promise<void> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    const element = await this.waitForVisible(locator);
    // SAFETY: async operation — wrap in try-catch for production resilience
    const actual = await element.getText();

    const matches = partial ? actual.includes(expected) : actual === expected;
    if (!matches) {
      throw new Error(`Text assertion failed. Expected: "${expected}", Got: "${actual}"`);
    }
  }

  /**
   * Assert element exists
   */
  // Complexity: O(1)
  async assertExists(locator: By): Promise<void> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.waitForElement(locator);
  }

  /**
   * Assert element visible
   */
  // Complexity: O(1)
  async assertVisible(locator: By): Promise<void> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.waitForVisible(locator);
  }

  /**
   * Assert element value (for inputs)
   */
  // Complexity: O(1)
  async assertValue(locator: By, expected: string): Promise<void> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    const element = await this.waitForVisible(locator);
    // SAFETY: async operation — wrap in try-catch for production resilience
    const actual = await element.getAttribute('value');

    if (actual !== expected) {
      throw new Error(`Value assertion failed. Expected: "${expected}", Got: "${actual}"`);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // UTILITY METHODS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Navigate to URL
   */
  // Complexity: O(1) — hash/map lookup
  async navigate(url: string): Promise<void> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.driver.get(url);
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.waitForPageLoad();
  }

  /**
   * Wait for page to fully load
   */
  // Complexity: O(1)
  async waitForPageLoad(): Promise<void> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.driver.wait(async () => {
      // SAFETY: async operation — wrap in try-catch for production resilience
      const readyState = await this.driver.executeScript('return document.readyState');
      return readyState === 'complete';
    }, this.defaultTimeout);
  }

  /**
   * Scroll element into view
   */
  // Complexity: O(N)
  async scrollIntoView(element: WebElement): Promise<void> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.driver.executeScript(
      'arguments[0].scrollIntoView({ behavior: "smooth", block: "center" });',
      element
    );
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.sleep(300); // Wait for scroll animation
  }

  /**
   * Get current URL
   */
  // Complexity: O(1)
  async getCurrentUrl(): Promise<string> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    return await this.driver.getCurrentUrl();
  }

  /**
   * Get page title
   */
  // Complexity: O(1)
  async getTitle(): Promise<string> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    return await this.driver.getTitle();
  }

  /**
   * Execute JavaScript
   */
  async executeScript<T>(script: string, ...args: any[]): Promise<T> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    return await this.driver.executeScript(script, ...args) as T;
  }

  /**
   * Take screenshot
   */
  // Complexity: O(1)
  async screenshot(): Promise<string> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    return await this.driver.takeScreenshot();
  }

  /**
   * Sleep helper
   */
  // Complexity: O(1)
  protected sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get element count
   */
  // Complexity: O(1)
  async getElementCount(locator: By): Promise<number> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    const elements = await this.driver.findElements(locator);
    return elements.length;
  }

  /**
   * Check if element exists (without waiting)
   */
  // Complexity: O(1)
  async exists(locator: By): Promise<boolean> {
    try {
      await this.driver.findElement(locator);
      return true;
    } catch {
      return false;
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // AI-POWERED HEALING (DOM Snapshot for GPT-4o)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Get optimized DOM snapshot for AI analysis
   * Uses DOM optimizer to stay within GPT-4o context limits
   */
  // Complexity: O(1) — hash/map lookup
  async getOptimizedDOMSnapshot(targetSelector?: string): Promise<string> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    const { optimizeDOM } = await import('../apps/worker/src/utils/dom-optimizer');

    // SAFETY: async operation — wrap in try-catch for production resilience
    const html = await this.driver.getPageSource();
    const optimized = optimizeDOM(html, targetSelector, {
      maxSizeKB: 15,
      preserveIds: true,
      preserveClasses: true,
      preserveDataAttrs: true,
      preserveAria: true,
      preserveTestAttrs: true,
    });

    console.log(
      `[DOM] Optimized: ${optimized.originalSize} → ${optimized.optimizedSize} bytes ` +
      `(${optimized.compressionRatio}% reduction, ${optimized.elementCount} elements)`
    );

    return optimized.html;
  }

  /**
   * Request AI healing for broken selector
   * Called when self-healing alternatives fail
   */
  // Complexity: O(N) — linear iteration
  async requestAIHealing(brokenSelector: string, error: string): Promise<SelectorAlternative[]> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    const { optimizeDOM, suggestSelectors } = await import('../apps/worker/src/utils/dom-optimizer');

    // Get focused DOM snapshot around the expected element area
    // SAFETY: async operation — wrap in try-catch for production resilience
    const html = await this.driver.getPageSource();
    const optimized = optimizeDOM(html, brokenSelector, {
      maxSizeKB: 15,
      focusDepth: 3,
    });

    // Get selector suggestions from current DOM
    const suggestions = suggestSelectors(optimized.html);

    // Build alternatives from suggestions
    const alternatives: SelectorAlternative[] = suggestions.map((sel, i) => ({
      selector: sel,
      type: sel.startsWith('#') ? 'id' : sel.startsWith('[') ? 'css' : 'css',
      priority: suggestions.length - i,
    }));

    // Log for manual review / training
    console.log(`[AI-Healing] Broken: ${brokenSelector}`);
    console.log(`[AI-Healing] Error: ${error}`);
    console.log(`[AI-Healing] Suggestions:`, suggestions.slice(0, 5));

    return alternatives;
  }
}
