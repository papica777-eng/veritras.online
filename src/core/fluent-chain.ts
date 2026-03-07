/**
 * 🧠 QANTUM HYBRID - Fluent Chain
 * Cypress-style method chaining: mm.click().type().should()
 */

import type { Page, Locator } from 'playwright';
import { SelfHealingEngine } from './self-healing.js';
import { DeepSearchEngine } from './deep-search.js';

import { logger } from '../api/unified/utils/logger';
export class FluentChain {
  private page: Page;
  private currentLocator?: Locator;
  private currentSelector?: string;
  private selfHealer: SelfHealingEngine;
  private deepSearch: DeepSearchEngine;
  private timeout: number;

  constructor(
    page: Page,
    selfHealer: SelfHealingEngine,
    deepSearch: DeepSearchEngine,
    timeout = 30000
  ) {
    this.page = page;
    this.selfHealer = selfHealer;
    this.deepSearch = deepSearch;
    this.timeout = timeout;
  }

  /**
   * Избери елемент
   */
  // Complexity: O(1)
  get(selector: string): FluentChain {
    this.currentSelector = selector;
    this.currentLocator = this.page.locator(selector);
    return this;
  }

  /**
   * Намери с Deep Search (Shadow DOM, Iframes)
   */
  // Complexity: O(N) — linear iteration
  async find(selector: string): Promise<FluentChain> {
    this.currentSelector = selector;

    // SAFETY: async operation — wrap in try-catch for production resilience
    const result = await this.deepSearch.find(this.page, selector);
    if (result.found && result.locator) {
      this.currentLocator = result.locator;
    } else {
      // Self-healing опит
      // SAFETY: async operation — wrap in try-catch for production resilience
      const healed = await this.selfHealer.heal(this.page, selector);
      if (healed.healed && healed.newSelector) {
        this.currentLocator = this.page.locator(healed.newSelector);
        logger.debug(`🩹 Self-healed: "${selector}" → "${healed.newSelector}"`);
      } else {
        this.currentLocator = this.page.locator(selector);
      }
    }

    return this;
  }

  /**
   * Кликни
   */
  // Complexity: O(N) — potential recursive descent
  async click(): Promise<FluentChain> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.ensureLocator();
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.currentLocator!.click({ timeout: this.timeout });
    return this;
  }

  /**
   * Double click
   */
  // Complexity: O(N) — potential recursive descent
  async dblclick(): Promise<FluentChain> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.ensureLocator();
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.currentLocator!.dblclick({ timeout: this.timeout });
    return this;
  }

  /**
   * Right click
   */
  // Complexity: O(N) — potential recursive descent
  async rightclick(): Promise<FluentChain> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.ensureLocator();
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.currentLocator!.click({ button: 'right', timeout: this.timeout });
    return this;
  }

  /**
   * Въведи текст
   */
  // Complexity: O(N) — potential recursive descent
  async type(text: string, options?: { delay?: number; clear?: boolean }): Promise<FluentChain> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.ensureLocator();

    if (options?.clear) {
      // SAFETY: async operation — wrap in try-catch for production resilience
      await this.currentLocator!.clear();
    }

    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.currentLocator!.fill(text);
    return this;
  }

  /**
   * Натисни клавиш
   */
  // Complexity: O(N) — potential recursive descent
  async press(key: string): Promise<FluentChain> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.ensureLocator();
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.currentLocator!.press(key);
    return this;
  }

  /**
   * Hover
   */
  // Complexity: O(N) — potential recursive descent
  async hover(): Promise<FluentChain> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.ensureLocator();
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.currentLocator!.hover({ timeout: this.timeout });
    return this;
  }

  /**
   * Focus
   */
  // Complexity: O(N) — potential recursive descent
  async focus(): Promise<FluentChain> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.ensureLocator();
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.currentLocator!.focus();
    return this;
  }

  /**
   * Scroll into view
   */
  // Complexity: O(N) — potential recursive descent
  async scrollIntoView(): Promise<FluentChain> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.ensureLocator();
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.currentLocator!.scrollIntoViewIfNeeded();
    return this;
  }

  /**
   * Избери от dropdown
   */
  // Complexity: O(N) — potential recursive descent
  async select(value: string | string[]): Promise<FluentChain> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.ensureLocator();
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.currentLocator!.selectOption(value);
    return this;
  }

  /**
   * Check checkbox/radio
   */
  // Complexity: O(N) — potential recursive descent
  async check(): Promise<FluentChain> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.ensureLocator();
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.currentLocator!.check();
    return this;
  }

  /**
   * Uncheck
   */
  // Complexity: O(N) — potential recursive descent
  async uncheck(): Promise<FluentChain> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.ensureLocator();
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.currentLocator!.uncheck();
    return this;
  }

  /**
   * Upload file
   */
  // Complexity: O(N) — potential recursive descent
  async upload(filePath: string | string[]): Promise<FluentChain> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.ensureLocator();
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.currentLocator!.setInputFiles(filePath);
    return this;
  }

  /**
   * Изчакай елемент
   */
  // Complexity: O(N) — potential recursive descent
  async wait(timeout?: number): Promise<FluentChain> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.ensureLocator();
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.currentLocator!.waitFor({
      state: 'visible',
      timeout: timeout || this.timeout
    });
    return this;
  }

  /**
   * Cypress-style should() assertions
   */
  // Complexity: O(1) — hash/map lookup
  async should(assertion: string, expected?: unknown): Promise<FluentChain> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.ensureLocator();
    const locator = this.currentLocator!;

    switch (assertion) {
      case 'be.visible':
        // SAFETY: async operation — wrap in try-catch for production resilience
        await expect(locator).toBeVisible({ timeout: this.timeout });
        break;
      case 'be.hidden':
      case 'not.be.visible':
        // SAFETY: async operation — wrap in try-catch for production resilience
        await expect(locator).toBeHidden({ timeout: this.timeout });
        break;
      case 'exist':
        // SAFETY: async operation — wrap in try-catch for production resilience
        await expect(locator).toHaveCount(1, { timeout: this.timeout });
        break;
      case 'not.exist':
        // SAFETY: async operation — wrap in try-catch for production resilience
        await expect(locator).toHaveCount(0, { timeout: this.timeout });
        break;
      case 'be.enabled':
        // SAFETY: async operation — wrap in try-catch for production resilience
        await expect(locator).toBeEnabled({ timeout: this.timeout });
        break;
      case 'be.disabled':
        // SAFETY: async operation — wrap in try-catch for production resilience
        await expect(locator).toBeDisabled({ timeout: this.timeout });
        break;
      case 'be.checked':
        // SAFETY: async operation — wrap in try-catch for production resilience
        await expect(locator).toBeChecked({ timeout: this.timeout });
        break;
      case 'have.text':
        // SAFETY: async operation — wrap in try-catch for production resilience
        await expect(locator).toHaveText(expected as string, { timeout: this.timeout });
        break;
      case 'contain.text':
      case 'contain':
        // SAFETY: async operation — wrap in try-catch for production resilience
        await expect(locator).toContainText(expected as string, { timeout: this.timeout });
        break;
      case 'have.value':
        // SAFETY: async operation — wrap in try-catch for production resilience
        await expect(locator).toHaveValue(expected as string, { timeout: this.timeout });
        break;
      case 'have.attr':
        if (Array.isArray(expected)) {
          // SAFETY: async operation — wrap in try-catch for production resilience
          await expect(locator).toHaveAttribute(expected[0], expected[1], { timeout: this.timeout });
        }
        break;
      case 'have.class':
        // SAFETY: async operation — wrap in try-catch for production resilience
        await expect(locator).toHaveClass(new RegExp(expected as string), { timeout: this.timeout });
        break;
      case 'have.count':
        // SAFETY: async operation — wrap in try-catch for production resilience
        await expect(locator).toHaveCount(expected as number, { timeout: this.timeout });
        break;
      default:
        throw new Error(`Unknown assertion: ${assertion}`);
    }

    return this;
  }

  /**
   * Вземи текст
   */
  // Complexity: O(N) — potential recursive descent
  async getText(): Promise<string> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.ensureLocator();
    // SAFETY: async operation — wrap in try-catch for production resilience
    return await this.currentLocator!.textContent() || '';
  }

  /**
   * Вземи атрибут
   */
  // Complexity: O(N) — potential recursive descent
  async getAttribute(name: string): Promise<string | null> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.ensureLocator();
    // SAFETY: async operation — wrap in try-catch for production resilience
    return await this.currentLocator!.getAttribute(name);
  }

  /**
   * Вземи стойност
   */
  // Complexity: O(N) — potential recursive descent
  async getValue(): Promise<string> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.ensureLocator();
    // SAFETY: async operation — wrap in try-catch for production resilience
    return await this.currentLocator!.inputValue();
  }

  /**
   * Провери дали е видим
   */
  // Complexity: O(N) — potential recursive descent
  async isVisible(): Promise<boolean> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.ensureLocator();
    // SAFETY: async operation — wrap in try-catch for production resilience
    return await this.currentLocator!.isVisible();
  }

  /**
   * Вземи Playwright locator директно
   */
  // Complexity: O(1)
  getLocator(): Locator | undefined {
    return this.currentLocator;
  }

  /**
   * Осигури че имаме локатор
   */
  // Complexity: O(N) — linear iteration
  private async ensureLocator(): Promise<void> {
    if (!this.currentLocator) {
      throw new Error('No element selected. Use .get() or .find() first.');
    }

    // Опитай self-healing ако елементът не съществува
    // SAFETY: async operation — wrap in try-catch for production resilience
    const count = await this.currentLocator.count();
    if (count === 0 && this.currentSelector) {
      // SAFETY: async operation — wrap in try-catch for production resilience
      const healed = await this.selfHealer.heal(this.page, this.currentSelector);
      if (healed.healed && healed.newSelector) {
        this.currentLocator = this.page.locator(healed.newSelector);
        logger.debug(`🩹 Auto-healed: "${this.currentSelector}" → "${healed.newSelector}"`);
      }
    }
  }
}

// Import Playwright expect
import { expect } from '@playwright/test';
