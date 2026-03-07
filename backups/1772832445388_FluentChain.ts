/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🧠 QANTUM HYBRID v1.0.0 - Fluent Chain API
 * Cypress-style chaining: cy.get().should().click()
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import type { Page, Locator, ElementHandle } from 'playwright';

import { logger } from '../api/unified/utils/logger';
// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type ChainCallback<T> = (value: T) => void | Promise<void>;
export type ShouldCallback = (subject: any) => void | boolean | Promise<void | boolean>;

export interface ChainOptions {
  timeout?: number;
  log?: boolean;
  force?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// FLUENT CHAIN
// ═══════════════════════════════════════════════════════════════════════════════

export class FluentChain {
  private page: Page;
  private selector: string;
  private locator: Locator;
  private parentChain?: FluentChain;
  private options: ChainOptions;
  private assertions: Array<() => Promise<void>> = [];

  constructor(page: Page, selector: string, options: ChainOptions = {}, parentChain?: FluentChain) {
    this.page = page;
    this.selector = selector;
    this.locator = page.locator(selector);
    this.parentChain = parentChain;
    this.options = {
      timeout: options.timeout ?? 30000,
      log: options.log ?? true,
      force: options.force ?? false,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // TRAVERSAL
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Get child element
   */
  // Complexity: O(1)
  find(selector: string): FluentChain {
    const newLocator = this.locator.locator(selector);
    const chain = new FluentChain(this.page, `${this.selector} ${selector}`, this.options, this);
    chain.locator = newLocator;
    return chain;
  }

  /**
   * Get first element
   */
  // Complexity: O(1)
  first(): FluentChain {
    const chain = new FluentChain(this.page, `${this.selector}:first`, this.options, this);
    chain.locator = this.locator.first();
    return chain;
  }

  /**
   * Get last element
   */
  // Complexity: O(1)
  last(): FluentChain {
    const chain = new FluentChain(this.page, `${this.selector}:last`, this.options, this);
    chain.locator = this.locator.last();
    return chain;
  }

  /**
   * Get nth element
   */
  // Complexity: O(1)
  eq(index: number): FluentChain {
    const chain = new FluentChain(this.page, `${this.selector}:eq(${index})`, this.options, this);
    chain.locator = this.locator.nth(index);
    return chain;
  }

  /**
   * Get parent element
   */
  // Complexity: O(1)
  parent(): FluentChain {
    const chain = new FluentChain(this.page, `${this.selector}/..`, this.options, this);
    chain.locator = this.locator.locator('..');
    return chain;
  }

  /**
   * Get siblings
   */
  // Complexity: O(1)
  siblings(selector?: string): FluentChain {
    const sibSelector = selector ?? '*';
    const chain = new FluentChain(this.page, `${this.selector}~${sibSelector}`, this.options, this);
    chain.locator = this.locator.locator(`xpath=following-sibling::${sibSelector}`);
    return chain;
  }

  /**
   * Get next sibling
   */
  // Complexity: O(1)
  next(): FluentChain {
    const chain = new FluentChain(this.page, `${this.selector}+*`, this.options, this);
    chain.locator = this.locator.locator('xpath=following-sibling::*[1]');
    return chain;
  }

  /**
   * Get previous sibling
   */
  // Complexity: O(1)
  prev(): FluentChain {
    const chain = new FluentChain(this.page, `${this.selector}-*`, this.options, this);
    chain.locator = this.locator.locator('xpath=preceding-sibling::*[1]');
    return chain;
  }

  /**
   * Filter by selector
   */
  // Complexity: O(N) — linear scan
  filter(selector: string): FluentChain {
    const chain = new FluentChain(this.page, `${this.selector}:filter(${selector})`, this.options, this);
    chain.locator = this.locator.filter({ has: this.page.locator(selector) });
    return chain;
  }

  /**
   * Filter by text
   */
  // Complexity: O(N) — linear scan
  contains(text: string): FluentChain {
    const chain = new FluentChain(this.page, `${this.selector}:contains("${text}")`, this.options, this);
    chain.locator = this.locator.filter({ hasText: text });
    return chain;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ACTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Click element
   */
  // Complexity: O(1)
  async click(options?: { force?: boolean; multiple?: boolean }): Promise<this> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.runAssertions();
    
    if (this.options.log) {
      logger.debug(`🖱️ click: ${this.selector}`);
    }

    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.locator.click({
      timeout: this.options.timeout,
      force: options?.force ?? this.options.force,
    });

    return this;
  }

  /**
   * Double click
   */
  // Complexity: O(1)
  async dblclick(): Promise<this> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.runAssertions();
    
    if (this.options.log) {
      logger.debug(`🖱️🖱️ dblclick: ${this.selector}`);
    }

    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.locator.dblclick({ timeout: this.options.timeout });
    return this;
  }

  /**
   * Right click
   */
  // Complexity: O(1)
  async rightclick(): Promise<this> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.runAssertions();
    
    if (this.options.log) {
      logger.debug(`🖱️ rightclick: ${this.selector}`);
    }

    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.locator.click({ button: 'right', timeout: this.options.timeout });
    return this;
  }

  /**
   * Type text
   */
  // Complexity: O(1)
  async type(text: string, options?: { delay?: number; clear?: boolean }): Promise<this> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.runAssertions();
    
    if (this.options.log) {
      logger.debug(`⌨️ type: "${text}" → ${this.selector}`);
    }

    if (options?.clear) {
      // SAFETY: async operation — wrap in try-catch for production resilience
      await this.locator.clear();
    }

    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.locator.fill(text);
    return this;
  }

  /**
   * Clear input
   */
  // Complexity: O(1)
  async clear(): Promise<this> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.runAssertions();
    
    if (this.options.log) {
      logger.debug(`🧹 clear: ${this.selector}`);
    }

    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.locator.clear();
    return this;
  }

  /**
   * Check checkbox/radio
   */
  // Complexity: O(1)
  async check(): Promise<this> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.runAssertions();
    
    if (this.options.log) {
      logger.debug(`☑️ check: ${this.selector}`);
    }

    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.locator.check({ timeout: this.options.timeout });
    return this;
  }

  /**
   * Uncheck checkbox
   */
  // Complexity: O(1)
  async uncheck(): Promise<this> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.runAssertions();
    
    if (this.options.log) {
      logger.debug(`☐ uncheck: ${this.selector}`);
    }

    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.locator.uncheck({ timeout: this.options.timeout });
    return this;
  }

  /**
   * Select option from dropdown
   */
  // Complexity: O(1)
  async select(value: string | string[]): Promise<this> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.runAssertions();
    
    if (this.options.log) {
      logger.debug(`📋 select: ${value} → ${this.selector}`);
    }

    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.locator.selectOption(value);
    return this;
  }

  /**
   * Hover over element
   */
  // Complexity: O(1)
  async hover(): Promise<this> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.runAssertions();
    
    if (this.options.log) {
      logger.debug(`👆 hover: ${this.selector}`);
    }

    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.locator.hover({ timeout: this.options.timeout });
    return this;
  }

  /**
   * Focus element
   */
  // Complexity: O(1)
  async focus(): Promise<this> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.runAssertions();
    
    if (this.options.log) {
      logger.debug(`🎯 focus: ${this.selector}`);
    }

    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.locator.focus();
    return this;
  }

  /**
   * Blur element
   */
  // Complexity: O(1)
  async blur(): Promise<this> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.runAssertions();
    
    if (this.options.log) {
      logger.debug(`💨 blur: ${this.selector}`);
    }

    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.locator.blur();
    return this;
  }

  /**
   * Scroll element into view
   */
  // Complexity: O(1)
  async scrollIntoView(): Promise<this> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.runAssertions();
    
    if (this.options.log) {
      logger.debug(`📜 scrollIntoView: ${this.selector}`);
    }

    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.locator.scrollIntoViewIfNeeded();
    return this;
  }

  /**
   * Trigger event
   */
  // Complexity: O(1)
  async trigger(event: string): Promise<this> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.runAssertions();
    
    if (this.options.log) {
      logger.debug(`⚡ trigger: ${event} → ${this.selector}`);
    }

    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.locator.dispatchEvent(event);
    return this;
  }

  /**
   * Submit form
   */
  // Complexity: O(1)
  async submit(): Promise<this> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.runAssertions();
    
    if (this.options.log) {
      logger.debug(`📤 submit: ${this.selector}`);
    }

    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.locator.evaluate((el) => {
      const form = el.closest('form');
      if (form) form.submit();
    });

    return this;
  }

  /**
   * Upload file
   */
  // Complexity: O(1)
  async attachFile(filePath: string | string[]): Promise<this> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.runAssertions();
    
    if (this.options.log) {
      logger.debug(`📎 attachFile: ${filePath} → ${this.selector}`);
    }

    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.locator.setInputFiles(filePath);
    return this;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ASSERTIONS (should)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Add assertion (Cypress-style should)
   */
  // Complexity: O(1)
  should(assertion: string | ShouldCallback, ...args: any[]): this {
    if (typeof assertion === 'function') {
      this.assertions.push(async () => {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const result = await assertion(this);
        if (result === false) {
          throw new Error('Custom assertion failed');
        }
      });
      return this;
    }

    // Parse Chai-style assertions
    const assertionMap: Record<string, () => Promise<void>> = {
      // Visibility
      'be.visible': async () => {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await expect(this.locator).toBeVisible({ timeout: this.options.timeout });
      },
      'be.hidden': async () => {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await expect(this.locator).toBeHidden({ timeout: this.options.timeout });
      },
      'not.be.visible': async () => {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await expect(this.locator).toBeHidden({ timeout: this.options.timeout });
      },
      'exist': async () => {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const count = await this.locator.count();
        if (count === 0) throw new Error(`Element does not exist: ${this.selector}`);
      },
      'not.exist': async () => {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const count = await this.locator.count();
        if (count > 0) throw new Error(`Element exists: ${this.selector}`);
      },

      // State
      'be.enabled': async () => {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await expect(this.locator).toBeEnabled({ timeout: this.options.timeout });
      },
      'be.disabled': async () => {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await expect(this.locator).toBeDisabled({ timeout: this.options.timeout });
      },
      'be.checked': async () => {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await expect(this.locator).toBeChecked({ timeout: this.options.timeout });
      },
      'not.be.checked': async () => {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await expect(this.locator).not.toBeChecked({ timeout: this.options.timeout });
      },
      'be.focused': async () => {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await expect(this.locator).toBeFocused({ timeout: this.options.timeout });
      },
      'be.empty': async () => {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await expect(this.locator).toBeEmpty({ timeout: this.options.timeout });
      },

      // Content
      'have.text': async () => {
        const expected = args[0];
        // SAFETY: async operation — wrap in try-catch for production resilience
        await expect(this.locator).toHaveText(expected, { timeout: this.options.timeout });
      },
      'contain': async () => {
        const expected = args[0];
        // SAFETY: async operation — wrap in try-catch for production resilience
        await expect(this.locator).toContainText(expected, { timeout: this.options.timeout });
      },
      'contain.text': async () => {
        const expected = args[0];
        // SAFETY: async operation — wrap in try-catch for production resilience
        await expect(this.locator).toContainText(expected, { timeout: this.options.timeout });
      },
      'have.value': async () => {
        const expected = args[0];
        // SAFETY: async operation — wrap in try-catch for production resilience
        await expect(this.locator).toHaveValue(expected, { timeout: this.options.timeout });
      },
      'have.attr': async () => {
        const [attr, value] = args;
        // SAFETY: async operation — wrap in try-catch for production resilience
        await expect(this.locator).toHaveAttribute(attr, value, { timeout: this.options.timeout });
      },
      'have.class': async () => {
        const className = args[0];
        // SAFETY: async operation — wrap in try-catch for production resilience
        await expect(this.locator).toHaveClass(new RegExp(className), { timeout: this.options.timeout });
      },
      'have.css': async () => {
        const [prop, value] = args;
        // SAFETY: async operation — wrap in try-catch for production resilience
        await expect(this.locator).toHaveCSS(prop, value, { timeout: this.options.timeout });
      },

      // Count
      'have.length': async () => {
        const expected = args[0];
        // SAFETY: async operation — wrap in try-catch for production resilience
        await expect(this.locator).toHaveCount(expected, { timeout: this.options.timeout });
      },
      'have.length.gt': async () => {
        const expected = args[0];
        // SAFETY: async operation — wrap in try-catch for production resilience
        const count = await this.locator.count();
        if (count <= expected) throw new Error(`Expected length > ${expected}, got ${count}`);
      },
      'have.length.gte': async () => {
        const expected = args[0];
        // SAFETY: async operation — wrap in try-catch for production resilience
        const count = await this.locator.count();
        if (count < expected) throw new Error(`Expected length >= ${expected}, got ${count}`);
      },
      'have.length.lt': async () => {
        const expected = args[0];
        // SAFETY: async operation — wrap in try-catch for production resilience
        const count = await this.locator.count();
        if (count >= expected) throw new Error(`Expected length < ${expected}, got ${count}`);
      },
      'have.length.lte': async () => {
        const expected = args[0];
        // SAFETY: async operation — wrap in try-catch for production resilience
        const count = await this.locator.count();
        if (count > expected) throw new Error(`Expected length <= ${expected}, got ${count}`);
      },

      // Misc
      'match': async () => {
        const pattern = args[0] as RegExp;
        // SAFETY: async operation — wrap in try-catch for production resilience
        const text = await this.locator.textContent() ?? '';
        if (!pattern.test(text)) throw new Error(`Text "${text}" does not match ${pattern}`);
      },
      'include': async () => {
        const expected = args[0];
        // SAFETY: async operation — wrap in try-catch for production resilience
        const text = await this.locator.textContent() ?? '';
        if (!text.includes(expected)) throw new Error(`Text "${text}" does not include "${expected}"`);
      },
    };

    const assertFn = assertionMap[assertion];
    if (assertFn) {
      this.assertions.push(assertFn);
    } else {
      logger.warn(`Unknown assertion: ${assertion}`);
    }

    return this;
  }

  /**
   * Add negated assertion
   */
  // Complexity: O(1)
  and(assertion: string, ...args: any[]): this {
    return this.should(assertion, ...args);
  }

  /**
   * Run all pending assertions
   */
  // Complexity: O(N) — loop
  private async runAssertions(): Promise<void> {
    for (const assertion of this.assertions) {
      // SAFETY: async operation — wrap in try-catch for production resilience
      await assertion();
    }
    this.assertions = [];
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GETTERS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Get text content
   */
  // Complexity: O(1)
  async text(): Promise<string> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.runAssertions();
    // SAFETY: async operation — wrap in try-catch for production resilience
    return (await this.locator.textContent()) ?? '';
  }

  /**
   * Get inner text
   */
  // Complexity: O(1)
  async innerText(): Promise<string> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.runAssertions();
    // SAFETY: async operation — wrap in try-catch for production resilience
    return await this.locator.innerText();
  }

  /**
   * Get attribute value
   */
  // Complexity: O(1)
  async attr(name: string): Promise<string | null> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.runAssertions();
    // SAFETY: async operation — wrap in try-catch for production resilience
    return await this.locator.getAttribute(name);
  }

  /**
   * Get input value
   */
  // Complexity: O(1)
  async val(): Promise<string> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.runAssertions();
    // SAFETY: async operation — wrap in try-catch for production resilience
    return await this.locator.inputValue();
  }

  /**
   * Get element count
   */
  // Complexity: O(1)
  async length(): Promise<number> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    return await this.locator.count();
  }

  /**
   * Check if visible
   */
  // Complexity: O(1)
  async isVisible(): Promise<boolean> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    return await this.locator.isVisible();
  }

  /**
   * Check if enabled
   */
  // Complexity: O(1)
  async isEnabled(): Promise<boolean> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    return await this.locator.isEnabled();
  }

  /**
   * Check if checked
   */
  // Complexity: O(1)
  async isChecked(): Promise<boolean> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    return await this.locator.isChecked();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CALLBACKS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Execute callback with element (then)
   */
  async then<T>(callback: (el: FluentChain) => T | Promise<T>): Promise<T> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.runAssertions();
    // SAFETY: async operation — wrap in try-catch for production resilience
    return await callback(this);
  }

  /**
   * Execute callback on each element
   */
  // Complexity: O(N) — loop
  async each(callback: (el: FluentChain, index: number) => void | Promise<void>): Promise<this> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.runAssertions();
    
    // SAFETY: async operation — wrap in try-catch for production resilience
    const count = await this.locator.count();
    for (let i = 0; i < count; i++) {
      const chain = new FluentChain(this.page, `${this.selector}[${i}]`, this.options);
      chain.locator = this.locator.nth(i);
      // SAFETY: async operation — wrap in try-catch for production resilience
      await callback(chain, i);
    }

    return this;
  }

  /**
   * Execute callback with value (invoke)
   */
  async invoke<K extends keyof HTMLElement>(method: K): Promise<any> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.runAssertions();
    // SAFETY: async operation — wrap in try-catch for production resilience
    return await this.locator.evaluate((el, m) => (el as any)[m]?.(), method);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // WAITING
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Wait for element to appear
   */
  // Complexity: O(1)
  async wait(timeout?: number): Promise<this> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.locator.waitFor({ 
      state: 'visible', 
      timeout: timeout ?? this.options.timeout 
    });
    return this;
  }

  /**
   * Wait for element to disappear
   */
  // Complexity: O(1)
  async waitUntilGone(timeout?: number): Promise<this> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.locator.waitFor({ 
      state: 'hidden', 
      timeout: timeout ?? this.options.timeout 
    });
    return this;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // UTILITIES
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Get underlying Playwright locator
   */
  // Complexity: O(1)
  getLocator(): Locator {
    return this.locator;
  }

  /**
   * Take screenshot of element
   */
  // Complexity: O(1)
  async screenshot(path?: string): Promise<Buffer> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.runAssertions();
    // SAFETY: async operation — wrap in try-catch for production resilience
    return await this.locator.screenshot({ path });
  }

  /**
   * Log element info
   */
  // Complexity: O(1)
  async debug(): Promise<this> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    const count = await this.locator.count();
    // SAFETY: async operation — wrap in try-catch for production resilience
    const isVisible = count > 0 ? await this.locator.first().isVisible() : false;
    
    logger.debug(`🔍 Debug: ${this.selector}`);
    logger.debug(`   Count: ${count}`);
    logger.debug(`   Visible: ${isVisible}`);
    
    if (count > 0) {
      // SAFETY: async operation — wrap in try-catch for production resilience
      const text = await this.locator.first().textContent();
      logger.debug(`   Text: ${text?.substring(0, 50)}`);
    }

    return this;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPECT HELPERS (Playwright compatibility)
// ═══════════════════════════════════════════════════════════════════════════════

function expect(locator: Locator) {
  return {
    // Complexity: O(1)
    async toBeVisible(options?: { timeout?: number }) {
      // SAFETY: async operation — wrap in try-catch for production resilience
      await locator.waitFor({ state: 'visible', timeout: options?.timeout });
    },
    // Complexity: O(1)
    async toBeHidden(options?: { timeout?: number }) {
      // SAFETY: async operation — wrap in try-catch for production resilience
      await locator.waitFor({ state: 'hidden', timeout: options?.timeout });
    },
    // Complexity: O(1)
    async toBeEnabled(options?: { timeout?: number }) {
      // SAFETY: async operation — wrap in try-catch for production resilience
      const isEnabled = await locator.isEnabled();
      if (!isEnabled) throw new Error('Element is not enabled');
    },
    // Complexity: O(1)
    async toBeDisabled(options?: { timeout?: number }) {
      // SAFETY: async operation — wrap in try-catch for production resilience
      const isDisabled = await locator.isDisabled();
      if (!isDisabled) throw new Error('Element is not disabled');
    },
    // Complexity: O(1)
    async toBeChecked(options?: { timeout?: number }) {
      // SAFETY: async operation — wrap in try-catch for production resilience
      const isChecked = await locator.isChecked();
      if (!isChecked) throw new Error('Element is not checked');
    },
    // Complexity: O(1)
    async toBeFocused(options?: { timeout?: number }) {
      // SAFETY: async operation — wrap in try-catch for production resilience
      const isFocused = await locator.evaluate(el => el === document.activeElement);
      if (!isFocused) throw new Error('Element is not focused');
    },
    // Complexity: O(1)
    async toBeEmpty(options?: { timeout?: number }) {
      // SAFETY: async operation — wrap in try-catch for production resilience
      const text = await locator.textContent();
      if (text && text.trim()) throw new Error('Element is not empty');
    },
    // Complexity: O(1)
    async toHaveText(expected: string | RegExp, options?: { timeout?: number }) {
      // SAFETY: async operation — wrap in try-catch for production resilience
      const text = await locator.textContent() ?? '';
      if (typeof expected === 'string') {
        if (text !== expected) throw new Error(`Expected "${expected}", got "${text}"`);
      } else {
        if (!expected.test(text)) throw new Error(`Text "${text}" does not match ${expected}`);
      }
    },
    // Complexity: O(1)
    async toContainText(expected: string, options?: { timeout?: number }) {
      // SAFETY: async operation — wrap in try-catch for production resilience
      const text = await locator.textContent() ?? '';
      if (!text.includes(expected)) throw new Error(`"${text}" does not contain "${expected}"`);
    },
    // Complexity: O(1)
    async toHaveValue(expected: string, options?: { timeout?: number }) {
      // SAFETY: async operation — wrap in try-catch for production resilience
      const value = await locator.inputValue();
      if (value !== expected) throw new Error(`Expected value "${expected}", got "${value}"`);
    },
    // Complexity: O(1)
    async toHaveAttribute(name: string, value: string | RegExp, options?: { timeout?: number }) {
      // SAFETY: async operation — wrap in try-catch for production resilience
      const attr = await locator.getAttribute(name);
      if (typeof value === 'string') {
        if (attr !== value) throw new Error(`Expected ${name}="${value}", got "${attr}"`);
      } else {
        if (!attr || !value.test(attr)) throw new Error(`Attribute ${name}="${attr}" does not match ${value}`);
      }
    },
    // Complexity: O(1)
    async toHaveClass(expected: string | RegExp, options?: { timeout?: number }) {
      // SAFETY: async operation — wrap in try-catch for production resilience
      const className = await locator.getAttribute('class') ?? '';
      if (typeof expected === 'string') {
        if (!className.includes(expected)) throw new Error(`Expected class "${expected}" in "${className}"`);
      } else {
        if (!expected.test(className)) throw new Error(`Class "${className}" does not match ${expected}`);
      }
    },
    // Complexity: O(1)
    async toHaveCSS(property: string, value: string, options?: { timeout?: number }) {
      // SAFETY: async operation — wrap in try-catch for production resilience
      const css = await locator.evaluate((el, prop) => 
        window.getComputedStyle(el).getPropertyValue(prop), property
      );
      if (css !== value) throw new Error(`Expected CSS ${property}: ${value}, got ${css}`);
    },
    // Complexity: O(1)
    async toHaveCount(expected: number, options?: { timeout?: number }) {
      // SAFETY: async operation — wrap in try-catch for production resilience
      const count = await locator.count();
      if (count !== expected) throw new Error(`Expected ${expected} elements, found ${count}`);
    },
    not: {
      // Complexity: O(1)
      async toBeChecked(options?: { timeout?: number }) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const isChecked = await locator.isChecked();
        if (isChecked) throw new Error('Element is checked');
      },
    },
  };
}

export default FluentChain;
