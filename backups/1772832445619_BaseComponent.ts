/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🧠 QANTUM HYBRID v1.0.0 - BaseComponent
 * Reusable UI component abstraction (Header, Footer, Modal, etc.)
 * Ported from: training-framework/architecture/pom-base.js
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { EventEmitter } from 'events';
import type { Page, Locator } from 'playwright';
import { BaseElement, LocatorStrategy, ElementOptions } from './BaseElement';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface ComponentOptions extends ElementOptions {
  waitForRoot?: boolean;
  rootTimeout?: number;
}

export interface ComponentMetadata {
  name: string;
  type: string;
  description?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// BASE COMPONENT CLASS
// ═══════════════════════════════════════════════════════════════════════════════

export class BaseComponent extends EventEmitter {
  public rootLocator: LocatorStrategy;
  public options: Required<ComponentOptions>;
  public metadata: ComponentMetadata;
  
  protected page?: Page;
  protected elements: Map<string, BaseElement> = new Map();
  protected subComponents: Map<string, BaseComponent> = new Map();
  protected cachedRoot?: Locator;

  constructor(rootLocator: LocatorStrategy, options: ComponentOptions = {}) {
    super();

    this.rootLocator = rootLocator;
    this.options = {
      timeout: options.timeout ?? 30000,
      retries: options.retries ?? 3,
      waitBetweenRetries: options.waitBetweenRetries ?? 500,
      selfHealing: options.selfHealing ?? true,
      cacheEnabled: options.cacheEnabled ?? true,
      name: options.name ?? 'UnnamedComponent',
      type: options.type ?? 'component',
      description: options.description ?? '',
      waitForRoot: options.waitForRoot ?? true,
      rootTimeout: options.rootTimeout ?? 10000,
    };

    this.metadata = {
      name: this.options.name,
      type: this.options.type,
      description: this.options.description,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Set Playwright page instance
   */
  // Complexity: O(N*M) — nested iteration
  setPage(page: Page): this {
    this.page = page;
    this.cachedRoot = undefined;

    // Update all child elements
    for (const element of this.elements.values()) {
      element.setPage(page);
    }

    // Update all sub-components
    for (const component of this.subComponents.values()) {
      component.setPage(page);
    }

    return this;
  }

  /**
   * Find the root element of this component
   */
  // Complexity: O(1)
  async findRoot(): Promise<Locator> {
    if (!this.page) {
      throw new Error('Page not set. Call setPage() first.');
    }

    // Use cache if available
    if (this.options.cacheEnabled && this.cachedRoot) {
      try {
        const count = await this.cachedRoot.count();
        if (count > 0) return this.cachedRoot;
      } catch {
        // Cache invalid
      }
    }

    const locator = this.toPlaywrightLocator(this.rootLocator);
    
    if (this.options.waitForRoot) {
      // SAFETY: async operation — wrap in try-catch for production resilience
      await locator.waitFor({ 
        state: 'attached', 
        timeout: this.options.rootTimeout 
      });
    }

    this.cachedRoot = locator;
    return locator;
  }

  /**
   * Convert strategy to Playwright locator
   */
  // Complexity: O(1)
  private toPlaywrightLocator(strategy: LocatorStrategy): Locator {
    if (!this.page) throw new Error('Page not set');

    switch (strategy.type) {
      case 'css':
        return this.page.locator(strategy.value);
      case 'xpath':
        return this.page.locator(`xpath=${strategy.value}`);
      case 'id':
        return this.page.locator(`#${strategy.value}`);
      case 'name':
        return this.page.locator(`[name="${strategy.value}"]`);
      case 'testId':
        return this.page.getByTestId(strategy.value);
      case 'text':
        return this.page.getByText(strategy.value);
      case 'role':
        return this.page.getByRole(strategy.value as any, strategy.options as any);
      default:
        return this.page.locator(strategy.value);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ELEMENT MANAGEMENT (scoped to component root)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Define an element within this component (scoped to root)
   */
  // Complexity: O(1) — lookup
  element(name: string, locator: string | LocatorStrategy, options: ElementOptions = {}): BaseElement {
    const strategy: LocatorStrategy = typeof locator === 'string'
      ? { type: 'css', value: locator }
      : locator;

    // Create element that will be scoped to component root
    const element = new BaseElement(strategy, { ...options, name });
    
    if (this.page) {
      element.setPage(this.page);
    }

    this.elements.set(name, element);
    return element;
  }

  /**
   * Get scoped element by name
   */
  $(name: string): BaseElement {
    const element = this.elements.get(name);
    if (!element) {
      throw new Error(`Element not found in component ${this.metadata.name}: ${name}`);
    }
    return element;
  }

  /**
   * Define a sub-component within this component
   */
  subComponent<T extends BaseComponent>(
    name: string,
    ComponentClass: new (root: LocatorStrategy, options?: ComponentOptions) => T,
    rootLocator: string | LocatorStrategy,
    options?: ComponentOptions
  ): T {
    const strategy: LocatorStrategy = typeof rootLocator === 'string'
      ? { type: 'css', value: rootLocator }
      : rootLocator;

    const comp = new ComponentClass(strategy, { ...options, name });

    if (this.page) {
      comp.setPage(this.page);
    }

    this.subComponents.set(name, comp);
    return comp;
  }

  /**
   * Get sub-component by name
   */
  getSubComponent<T extends BaseComponent>(name: string): T {
    const comp = this.subComponents.get(name);
    if (!comp) {
      throw new Error(`Sub-component not found: ${name}`);
    }
    return comp as T;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STATE CHECKS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Check if component is visible
   */
  // Complexity: O(1)
  async isVisible(): Promise<boolean> {
    try {
      const root = await this.findRoot();
      return await root.isVisible();
    } catch {
      return false;
    }
  }

  /**
   * Check if component exists in DOM
   */
  // Complexity: O(1)
  async exists(): Promise<boolean> {
    try {
      const root = await this.findRoot();
      return (await root.count()) > 0;
    } catch {
      return false;
    }
  }

  /**
   * Check if component is enabled
   */
  // Complexity: O(1)
  async isEnabled(): Promise<boolean> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    const root = await this.findRoot();
    // SAFETY: async operation — wrap in try-catch for production resilience
    return await root.isEnabled();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // WAITS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Wait for component to be visible
   */
  // Complexity: O(1)
  async waitForVisible(timeout?: number): Promise<void> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    const root = await this.findRoot();
    // SAFETY: async operation — wrap in try-catch for production resilience
    await root.waitFor({ 
      state: 'visible', 
      timeout: timeout ?? this.options.timeout 
    });
  }

  /**
   * Wait for component to be hidden
   */
  // Complexity: O(1)
  async waitForHidden(timeout?: number): Promise<void> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    const root = await this.findRoot();
    // SAFETY: async operation — wrap in try-catch for production resilience
    await root.waitFor({ 
      state: 'hidden', 
      timeout: timeout ?? this.options.timeout 
    });
  }

  /**
   * Wait for component to be detached
   */
  // Complexity: O(1)
  async waitForDetached(timeout?: number): Promise<void> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    const root = await this.findRoot();
    // SAFETY: async operation — wrap in try-catch for production resilience
    await root.waitFor({ 
      state: 'detached', 
      timeout: timeout ?? this.options.timeout 
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ACTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Click on component root
   */
  // Complexity: O(1)
  async click(): Promise<void> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    const root = await this.findRoot();
    // SAFETY: async operation — wrap in try-catch for production resilience
    await root.click();
  }

  /**
   * Hover over component
   */
  // Complexity: O(1)
  async hover(): Promise<void> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    const root = await this.findRoot();
    // SAFETY: async operation — wrap in try-catch for production resilience
    await root.hover();
  }

  /**
   * Scroll component into view
   */
  // Complexity: O(1)
  async scrollIntoView(): Promise<void> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    const root = await this.findRoot();
    // SAFETY: async operation — wrap in try-catch for production resilience
    await root.scrollIntoViewIfNeeded();
  }

  /**
   * Get text content of component
   */
  // Complexity: O(1)
  async getText(): Promise<string> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    const root = await this.findRoot();
    // SAFETY: async operation — wrap in try-catch for production resilience
    return (await root.textContent()) ?? '';
  }

  /**
   * Get inner HTML
   */
  // Complexity: O(1)
  async getInnerHTML(): Promise<string> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    const root = await this.findRoot();
    // SAFETY: async operation — wrap in try-catch for production resilience
    return await root.innerHTML();
  }

  /**
   * Get attribute
   */
  // Complexity: O(1)
  async getAttribute(name: string): Promise<string | null> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    const root = await this.findRoot();
    // SAFETY: async operation — wrap in try-catch for production resilience
    return await root.getAttribute(name);
  }

  /**
   * Take screenshot of component
   */
  // Complexity: O(1)
  async screenshot(path?: string): Promise<Buffer> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    const root = await this.findRoot();
    // SAFETY: async operation — wrap in try-catch for production resilience
    return await root.screenshot({ path });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // UTILITIES
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Get component state info
   */
  // Complexity: O(1)
  getState(): {
    metadata: ComponentMetadata;
    elementCount: number;
    subComponentCount: number;
    elements: string[];
    subComponents: string[];
  } {
    return {
      metadata: this.metadata,
      elementCount: this.elements.size,
      subComponentCount: this.subComponents.size,
      elements: Array.from(this.elements.keys()),
      subComponents: Array.from(this.subComponents.keys()),
    };
  }

  /**
   * Get root Playwright locator directly
   */
  // Complexity: O(1)
  async getLocator(): Promise<Locator> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    return await this.findRoot();
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMMON COMPONENT IMPLEMENTATIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Header Component
 */
export class HeaderComponent extends BaseComponent {
  constructor(rootLocator: LocatorStrategy = { type: 'css', value: 'header' }, options?: ComponentOptions) {
    super(rootLocator, { ...options, type: 'header' });
    this.initElements();
  }

  // Complexity: O(1)
  private initElements(): void {
    this.element('logo', 'img.logo, .logo, [data-testid="logo"]');
    this.element('nav', 'nav, .nav, .navigation');
    this.element('search', 'input[type="search"], .search-input');
    this.element('menuButton', '.menu-button, .hamburger, [data-testid="menu"]');
  }

  // Complexity: O(1)
  async clickLogo(): Promise<void> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.$('logo').click();
  }

  // Complexity: O(1)
  async search(query: string): Promise<void> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.$('search').type(query);
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.$('search').press('Enter');
  }

  // Complexity: O(1)
  async toggleMenu(): Promise<void> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.$('menuButton').click();
  }
}

/**
 * Footer Component
 */
export class FooterComponent extends BaseComponent {
  constructor(rootLocator: LocatorStrategy = { type: 'css', value: 'footer' }, options?: ComponentOptions) {
    super(rootLocator, { ...options, type: 'footer' });
    this.initElements();
  }

  // Complexity: O(1)
  private initElements(): void {
    this.element('copyright', '.copyright, [data-testid="copyright"]');
    this.element('links', '.footer-links, nav');
    this.element('socialLinks', '.social-links, .social');
  }

  // Complexity: O(1)
  async getCopyright(): Promise<string> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    return await this.$('copyright').getText();
  }
}

/**
 * Modal/Dialog Component
 */
export class ModalComponent extends BaseComponent {
  constructor(rootLocator: LocatorStrategy = { type: 'css', value: '.modal, [role="dialog"], .dialog' }, options?: ComponentOptions) {
    super(rootLocator, { ...options, type: 'modal' });
    this.initElements();
  }

  // Complexity: O(1)
  private initElements(): void {
    this.element('title', '.modal-title, .dialog-title, h2');
    this.element('body', '.modal-body, .dialog-body, .content');
    this.element('closeButton', '.close, .modal-close, [aria-label="Close"]');
    this.element('confirmButton', '.confirm, .ok, button[type="submit"]');
    this.element('cancelButton', '.cancel, button[type="button"]:not(.confirm)');
    this.element('overlay', '.modal-overlay, .backdrop');
  }

  // Complexity: O(1)
  async close(): Promise<void> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.$('closeButton').click();
  }

  // Complexity: O(1)
  async confirm(): Promise<void> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.$('confirmButton').click();
  }

  // Complexity: O(1)
  async cancel(): Promise<void> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.$('cancelButton').click();
  }

  // Complexity: O(1)
  async getTitle(): Promise<string> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    return await this.$('title').getText();
  }

  // Complexity: O(1)
  async getBody(): Promise<string> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    return await this.$('body').getText();
  }
}

/**
 * Form Component
 */
export class FormComponent extends BaseComponent {
  constructor(rootLocator: LocatorStrategy = { type: 'css', value: 'form' }, options?: ComponentOptions) {
    super(rootLocator, { ...options, type: 'form' });
    this.initElements();
  }

  // Complexity: O(1)
  private initElements(): void {
    this.element('submitButton', 'button[type="submit"], input[type="submit"]');
    this.element('resetButton', 'button[type="reset"], input[type="reset"]');
  }

  // Complexity: O(1)
  async fillField(name: string, value: string): Promise<void> {
    if (!this.page) throw new Error('Page not set');
    // SAFETY: async operation — wrap in try-catch for production resilience
    const root = await this.findRoot();
    // SAFETY: async operation — wrap in try-catch for production resilience
    await root.locator(`[name="${name}"], #${name}`).fill(value);
  }

  // Complexity: O(1)
  async selectOption(name: string, value: string): Promise<void> {
    if (!this.page) throw new Error('Page not set');
    // SAFETY: async operation — wrap in try-catch for production resilience
    const root = await this.findRoot();
    // SAFETY: async operation — wrap in try-catch for production resilience
    await root.locator(`select[name="${name}"], #${name}`).selectOption(value);
  }

  // Complexity: O(1)
  async checkField(name: string): Promise<void> {
    if (!this.page) throw new Error('Page not set');
    // SAFETY: async operation — wrap in try-catch for production resilience
    const root = await this.findRoot();
    // SAFETY: async operation — wrap in try-catch for production resilience
    await root.locator(`input[name="${name}"], #${name}`).check();
  }

  // Complexity: O(1)
  async submit(): Promise<void> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.$('submitButton').click();
  }

  // Complexity: O(1)
  async reset(): Promise<void> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.$('resetButton').click();
  }
}

/**
 * Table Component
 */
export class TableComponent extends BaseComponent {
  constructor(rootLocator: LocatorStrategy = { type: 'css', value: 'table' }, options?: ComponentOptions) {
    super(rootLocator, { ...options, type: 'table' });
    this.initElements();
  }

  // Complexity: O(1)
  private initElements(): void {
    this.element('header', 'thead');
    this.element('body', 'tbody');
    this.element('footer', 'tfoot');
  }

  // Complexity: O(1)
  async getRowCount(): Promise<number> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    const root = await this.findRoot();
    // SAFETY: async operation — wrap in try-catch for production resilience
    return await root.locator('tbody tr').count();
  }

  // Complexity: O(1)
  async getColumnCount(): Promise<number> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    const root = await this.findRoot();
    // SAFETY: async operation — wrap in try-catch for production resilience
    return await root.locator('thead th, thead td').count();
  }

  // Complexity: O(1)
  async getCell(row: number, col: number): Promise<string> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    const root = await this.findRoot();
    const cell = root.locator(`tbody tr:nth-child(${row}) td:nth-child(${col})`);
    // SAFETY: async operation — wrap in try-catch for production resilience
    return (await cell.textContent()) ?? '';
  }

  // Complexity: O(N) — loop
  async getRow(index: number): Promise<string[]> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    const root = await this.findRoot();
    const cells = root.locator(`tbody tr:nth-child(${index}) td`);
    // SAFETY: async operation — wrap in try-catch for production resilience
    const count = await cells.count();
    const values: string[] = [];
    
    for (let i = 0; i < count; i++) {
      // SAFETY: async operation — wrap in try-catch for production resilience
      values.push((await cells.nth(i).textContent()) ?? '');
    }
    
    return values;
  }

  // Complexity: O(N) — loop
  async getColumn(index: number): Promise<string[]> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    const root = await this.findRoot();
    const cells = root.locator(`tbody tr td:nth-child(${index})`);
    // SAFETY: async operation — wrap in try-catch for production resilience
    const count = await cells.count();
    const values: string[] = [];
    
    for (let i = 0; i < count; i++) {
      // SAFETY: async operation — wrap in try-catch for production resilience
      values.push((await cells.nth(i).textContent()) ?? '');
    }
    
    return values;
  }

  // Complexity: O(1)
  async clickRow(index: number): Promise<void> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    const root = await this.findRoot();
    // SAFETY: async operation — wrap in try-catch for production resilience
    await root.locator(`tbody tr:nth-child(${index})`).click();
  }

  // Complexity: O(N) — loop
  async getHeaders(): Promise<string[]> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    const root = await this.findRoot();
    const headers = root.locator('thead th');
    // SAFETY: async operation — wrap in try-catch for production resilience
    const count = await headers.count();
    const values: string[] = [];
    
    for (let i = 0; i < count; i++) {
      // SAFETY: async operation — wrap in try-catch for production resilience
      values.push((await headers.nth(i).textContent()) ?? '');
    }
    
    return values;
  }
}

/**
 * Dropdown/Select Component
 */
export class DropdownComponent extends BaseComponent {
  constructor(rootLocator: LocatorStrategy = { type: 'css', value: '.dropdown, .select, select' }, options?: ComponentOptions) {
    super(rootLocator, { ...options, type: 'dropdown' });
    this.initElements();
  }

  // Complexity: O(1)
  private initElements(): void {
    this.element('trigger', '.dropdown-trigger, .select-trigger, button');
    this.element('menu', '.dropdown-menu, .select-menu, ul');
    this.element('options', '.option, li, option');
  }

  // Complexity: O(1)
  async open(): Promise<void> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    const visible = await this.isMenuVisible();
    if (!visible) {
      // SAFETY: async operation — wrap in try-catch for production resilience
      await this.$('trigger').click();
    }
  }

  // Complexity: O(1)
  async close(): Promise<void> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    const visible = await this.isMenuVisible();
    if (visible) {
      // SAFETY: async operation — wrap in try-catch for production resilience
      await this.$('trigger').click();
    }
  }

  // Complexity: O(1)
  async isMenuVisible(): Promise<boolean> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    return await this.$('menu').isVisible();
  }

  // Complexity: O(1)
  async selectByText(text: string): Promise<void> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.open();
    // SAFETY: async operation — wrap in try-catch for production resilience
    const root = await this.findRoot();
    // SAFETY: async operation — wrap in try-catch for production resilience
    await root.locator(`text=${text}`).click();
  }

  // Complexity: O(1)
  async selectByIndex(index: number): Promise<void> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.open();
    // SAFETY: async operation — wrap in try-catch for production resilience
    const root = await this.findRoot();
    // SAFETY: async operation — wrap in try-catch for production resilience
    await root.locator('.option, li, option').nth(index).click();
  }

  // Complexity: O(N) — loop
  async getOptions(): Promise<string[]> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    const root = await this.findRoot();
    const options = root.locator('.option, li, option');
    // SAFETY: async operation — wrap in try-catch for production resilience
    const count = await options.count();
    const values: string[] = [];
    
    for (let i = 0; i < count; i++) {
      // SAFETY: async operation — wrap in try-catch for production resilience
      values.push((await options.nth(i).textContent()) ?? '');
    }
    
    return values;
  }

  // Complexity: O(1)
  async getSelectedValue(): Promise<string> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    return await this.$('trigger').getText();
  }
}

export default BaseComponent;
