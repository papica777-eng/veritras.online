// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║  CYBERCODY v1.3.0 - HIDDEN ELEMENT FINDER                                    ║
// ║  "The Visual Hacker" - Discovers Hidden DOM Elements & Clickjacking Vectors  ║
// ║  Exposes display:none, opacity:0, off-screen elements, invisible iframes     ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

import { EventEmitter } from 'events';
import { chromium, type Browser, type Page } from 'playwright';
import { mkdirSync, existsSync } from 'fs';
import { join } from 'path';

// ═══════════════════════════════════════════════════════════════════════════════
// 🎯 TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Types of hidden elements
 */
export type HiddenElementType = 
  | 'display-none'
  | 'visibility-hidden'
  | 'opacity-zero'
  | 'off-screen'
  | 'zero-size'
  | 'clip-hidden'
  | 'overflow-hidden'
  | 'z-index-buried'
  | 'pointer-events-none'
  | 'aria-hidden';

/**
 * Risk level of hidden element
 */
export type HiddenElementRisk = 'info' | 'low' | 'medium' | 'high' | 'critical';

/**
 * Hidden element finding
 */
export interface HiddenElement {
  id: string;
  type: HiddenElementType;
  tagName: string;
  selector: string;
  attributes: Record<string, string>;
  computedStyle: {
    display: string;
    visibility: string;
    opacity: string;
    position: string;
    left: string;
    top: string;
    width: string;
    height: string;
    zIndex: string;
    pointerEvents: string;
    overflow: string;
    clip: string;
  };
  boundingBox: { x: number; y: number; width: number; height: number } | null;
  innerHTML: string;
  textContent: string;
  risk: HiddenElementRisk;
  riskReason: string;
  category: HiddenElementCategory;
  screenshot?: string;
}

/**
 * Categories for hidden elements
 */
export type HiddenElementCategory = 
  | 'credential_harvester'
  | 'clickjacking'
  | 'form_hijacking'
  | 'data_exfiltration'
  | 'tracking_pixel'
  | 'malicious_script'
  | 'ui_redressing'
  | 'hidden_link'
  | 'seo_spam'
  | 'legitimate'
  | 'unknown';

/**
 * Clickjacking vector
 */
export interface ClickjackingVector {
  type: 'iframe_overlay' | 'transparent_layer' | 'ui_redressing' | 'cursor_hijacking';
  element: HiddenElement;
  targetElement?: string;
  description: string;
  exploitability: 'easy' | 'medium' | 'difficult';
  recommendation: string;
}

/**
 * Hidden Element Finder configuration
 */
export interface HiddenElementConfig {
  screenshotDir?: string;
  timeout?: number;
  userAgent?: string;
  includeCategories?: HiddenElementCategory[];
  minRiskLevel?: HiddenElementRisk;
  captureScreenshots?: boolean;
  revealHiddenElements?: boolean;
}

/**
 * Full hidden element scan report
 */
export interface HiddenElementReport {
  target: string;
  startTime: Date;
  endTime: Date;
  totalElementsScanned: number;
  hiddenElementsFound: number;
  criticalFindings: number;
  highRiskFindings: number;
  clickjackingVectors: ClickjackingVector[];
  hiddenForms: HiddenElement[];
  hiddenInputs: HiddenElement[];
  hiddenIframes: HiddenElement[];
  hiddenLinks: HiddenElement[];
  allHiddenElements: HiddenElement[];
  riskScore: number;
  recommendations: string[];
  screenshotPath?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🔍 DETECTION PATTERNS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Patterns that indicate malicious hidden elements
 */
const SUSPICIOUS_PATTERNS = {
  // Credential harvesting
  credentialHarvesting: {
    attributes: ['password', 'passwd', 'pwd', 'secret', 'credential', 'auth', 'login', 'token', 'session'],
    inputTypes: ['password', 'hidden'],
    formActions: ['external', 'data:', 'javascript:'],
  },
  
  // Data exfiltration
  dataExfil: {
    srcs: ['data:', 'javascript:', 'blob:'],
    attributes: ['exfil', 'beacon', 'collect', 'harvest', 'steal'],
  },
  
  // Clickjacking
  clickjacking: {
    iframeSrcs: ['javascript:', 'data:', 'about:blank'],
    styles: ['position: fixed', 'position: absolute', 'z-index: 9999'],
  },
  
  // Tracking
  tracking: {
    dimensions: [{ width: 1, height: 1 }, { width: 0, height: 0 }],
    srcs: ['pixel', 'beacon', 'track', 'analytics', '1x1'],
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// 👁️ HIDDEN ELEMENT FINDER CLASS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Hidden Element Finder
 * 
 * Discovers hidden DOM elements that may be used for:
 * - Clickjacking attacks
 * - Credential harvesting
 * - UI redressing
 * - Data exfiltration
 * - Malicious script hiding
 */
export class HiddenElementFinder extends EventEmitter {
  private config: Required<HiddenElementConfig>;
  private browser: Browser | null = null;
  private findings: HiddenElement[] = [];
  private clickjackingVectors: ClickjackingVector[] = [];

  constructor(config: HiddenElementConfig = {}) {
    super();
    
    this.config = {
      screenshotDir: config.screenshotDir ?? './screenshots/hidden',
      timeout: config.timeout ?? 30000,
      userAgent: config.userAgent ?? 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      includeCategories: config.includeCategories ?? [
        'credential_harvester', 'clickjacking', 'form_hijacking', 
        'data_exfiltration', 'malicious_script', 'ui_redressing'
      ],
      minRiskLevel: config.minRiskLevel ?? 'low',
      captureScreenshots: config.captureScreenshots ?? true,
      revealHiddenElements: config.revealHiddenElements ?? false,
    };

    // Ensure screenshot directory exists
    if (!existsSync(this.config.screenshotDir)) {
      mkdirSync(this.config.screenshotDir, { recursive: true });
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 🚀 MAIN SCAN METHODS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Scan a URL for hidden elements
   */
  async scanUrl(url: string): Promise<HiddenElementReport> {
    const startTime = new Date();
    this.emit('scan:start', { url });
    
    this.findings = [];
    this.clickjackingVectors = [];

    if (!this.browser) {
      this.browser = await chromium.launch({ headless: true });
    }

    const page = await this.browser.newPage({
      userAgent: this.config.userAgent,
      viewport: { width: 1920, height: 1080 },
    });

    try {
      await page.goto(url, { 
        waitUntil: 'networkidle',
        timeout: this.config.timeout,
      });

      // Take initial screenshot
      let screenshotPath: string | undefined;
      if (this.config.captureScreenshots) {
        screenshotPath = await this.takeScreenshot(page, url, 'initial');
      }

      // Scan for all hidden elements
      const totalElements = await this.findHiddenElements(page);
      
      // Analyze clickjacking vectors
      await this.analyzeClickjacking(page);

      // Optionally reveal hidden elements and take another screenshot
      if (this.config.revealHiddenElements && this.config.captureScreenshots) {
        await this.revealHidden(page);
        await this.takeScreenshot(page, url, 'revealed');
      }

      const endTime = new Date();

      // Build report
      const report = this.buildReport(url, startTime, endTime, totalElements, screenshotPath);
      
      this.emit('scan:complete', report);
      return report;

    } finally {
      await page.close();
    }
  }

  /**
   * Scan page for hidden elements (from existing page object)
   */
  async scanPage(page: Page, url: string): Promise<HiddenElementReport> {
    const startTime = new Date();
    this.findings = [];
    this.clickjackingVectors = [];

    let screenshotPath: string | undefined;
    if (this.config.captureScreenshots) {
      screenshotPath = await this.takeScreenshot(page, url, 'initial');
    }

    const totalElements = await this.findHiddenElements(page);
    await this.analyzeClickjacking(page);

    const endTime = new Date();
    return this.buildReport(url, startTime, endTime, totalElements, screenshotPath);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 🔍 HIDDEN ELEMENT DETECTION
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Find all hidden elements on the page
   */
  private async findHiddenElements(page: Page): Promise<number> {
    const result = await page.evaluate(() => {
      const hiddenElements: Array<{
        tagName: string;
        selector: string;
        attributes: Record<string, string>;
        computedStyle: {
          display: string;
          visibility: string;
          opacity: string;
          position: string;
          left: string;
          top: string;
          width: string;
          height: string;
          zIndex: string;
          pointerEvents: string;
          overflow: string;
          clip: string;
        };
        boundingBox: { x: number; y: number; width: number; height: number } | null;
        innerHTML: string;
        textContent: string;
        hiddenType: string;
      }> = [];

      let totalScanned = 0;
      const allElements = document.querySelectorAll('*');

      allElements.forEach((element, index) => {
        totalScanned++;
        const el = element as HTMLElement;
        const style = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        
        // Check various hidden states
        const isDisplayNone = style.display === 'none';
        const isVisibilityHidden = style.visibility === 'hidden';
        const isOpacityZero = parseFloat(style.opacity) === 0;
        const isOffScreen = rect.left < -1000 || rect.top < -1000 || 
                           rect.left > window.innerWidth + 1000 || 
                           rect.top > window.innerHeight + 1000;
        const isZeroSize = (rect.width <= 1 && rect.height <= 1) && el.tagName !== 'BR';
        const isClipHidden = style.clip === 'rect(0px, 0px, 0px, 0px)' || 
                            style.clipPath === 'inset(100%)';
        const isOverflowHidden = style.overflow === 'hidden' && 
                                 (rect.width === 0 || rect.height === 0);
        const isZIndexBuried = parseInt(style.zIndex) < -100;
        const isPointerEventsNone = style.pointerEvents === 'none';
        const isAriaHidden = el.getAttribute('aria-hidden') === 'true';

        // Determine hidden type
        let hiddenType = '';
        if (isDisplayNone) hiddenType = 'display-none';
        else if (isVisibilityHidden) hiddenType = 'visibility-hidden';
        else if (isOpacityZero) hiddenType = 'opacity-zero';
        else if (isOffScreen) hiddenType = 'off-screen';
        else if (isZeroSize) hiddenType = 'zero-size';
        else if (isClipHidden) hiddenType = 'clip-hidden';
        else if (isOverflowHidden) hiddenType = 'overflow-hidden';
        else if (isZIndexBuried) hiddenType = 'z-index-buried';
        else if (isPointerEventsNone) hiddenType = 'pointer-events-none';
        else if (isAriaHidden) hiddenType = 'aria-hidden';

        if (hiddenType) {
          // Build selector
          let selector = el.tagName.toLowerCase();
          if (el.id) selector += `#${el.id}`;
          if (el.className && typeof el.className === 'string') {
            selector += '.' + el.className.split(' ').filter(c => c).join('.');
          }
          selector += `:nth-of-type(${index + 1})`;

          // Get attributes
          const attributes: Record<string, string> = {};
          for (let i = 0; i < el.attributes.length; i++) {
            const attr = el.attributes[i];
            if (attr) {
              attributes[attr.name] = attr.value;
            }
          }

          hiddenElements.push({
            tagName: el.tagName.toLowerCase(),
            selector,
            attributes,
            computedStyle: {
              display: style.display,
              visibility: style.visibility,
              opacity: style.opacity,
              position: style.position,
              left: style.left,
              top: style.top,
              width: style.width,
              height: style.height,
              zIndex: style.zIndex,
              pointerEvents: style.pointerEvents,
              overflow: style.overflow,
              clip: style.clip,
            },
            boundingBox: rect.width > 0 || rect.height > 0 ? {
              x: rect.x,
              y: rect.y,
              width: rect.width,
              height: rect.height,
            } : null,
            innerHTML: el.innerHTML.substring(0, 1000),
            textContent: el.textContent?.substring(0, 500) ?? '',
            hiddenType,
          });
        }
      });

      return { hiddenElements, totalScanned };
    });

    // Process and categorize each hidden element
    for (const element of result.hiddenElements) {
      const processed = this.categorizeElement(element);
      
      // Filter by minimum risk level
      if (this.shouldInclude(processed)) {
        this.findings.push(processed);
        this.emit('finding', processed);
      }
    }

    return result.totalScanned;
  }

  /**
   * Categorize a hidden element and assess its risk
   */
  private categorizeElement(element: {
    tagName: string;
    selector: string;
    attributes: Record<string, string>;
    computedStyle: HiddenElement['computedStyle'];
    boundingBox: HiddenElement['boundingBox'];
    innerHTML: string;
    textContent: string;
    hiddenType: string;
  }): HiddenElement {
    const id = `hidden-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    let category: HiddenElementCategory = 'unknown';
    let risk: HiddenElementRisk = 'info';
    let riskReason = '';

    const { tagName, attributes, innerHTML, textContent } = element;
    const attrString = JSON.stringify(attributes).toLowerCase();
    const contentLower = (innerHTML + textContent).toLowerCase();

    // Credential Harvesting Detection
    if (tagName === 'input' || tagName === 'form') {
      const hasPassword = attributes['type'] === 'password' || 
                         attrString.includes('password') ||
                         attrString.includes('passwd');
      const hasCredential = SUSPICIOUS_PATTERNS.credentialHarvesting.attributes.some(
        attr => attrString.includes(attr)
      );
      
      if (hasPassword) {
        category = 'credential_harvester';
        risk = 'critical';
        riskReason = 'Hidden password input field - potential credential theft';
      } else if (hasCredential) {
        category = 'credential_harvester';
        risk = 'high';
        riskReason = 'Hidden form element with credential-related attributes';
      }
    }

    // Form Hijacking
    if (tagName === 'form') {
      const action = attributes['action'] ?? '';
      if (action.startsWith('javascript:') || action.startsWith('data:') || 
          (action.startsWith('http') && !action.includes(globalThis.location?.hostname ?? ''))) {
        category = 'form_hijacking';
        risk = 'critical';
        riskReason = `Hidden form with suspicious action: ${action.substring(0, 50)}`;
      }
    }

    // Clickjacking Detection
    if (tagName === 'iframe') {
      const src = attributes['src'] ?? '';
      if (element.computedStyle.position === 'absolute' || 
          element.computedStyle.position === 'fixed') {
        category = 'clickjacking';
        risk = 'high';
        riskReason = 'Hidden iframe with absolute/fixed positioning - clickjacking risk';
      } else if (src.startsWith('javascript:') || src.startsWith('data:')) {
        category = 'clickjacking';
        risk = 'critical';
        riskReason = `Hidden iframe with suspicious src: ${src.substring(0, 50)}`;
      }
    }

    // Tracking Pixel Detection
    if ((tagName === 'img' || tagName === 'iframe') && 
        element.boundingBox && 
        element.boundingBox.width <= 1 && 
        element.boundingBox.height <= 1) {
      category = 'tracking_pixel';
      risk = 'low';
      riskReason = '1x1 tracking pixel detected';
    }

    // Malicious Script Detection
    if (tagName === 'script') {
      const src = attributes['src'] ?? '';
      if (contentLower.includes('eval(') || 
          contentLower.includes('document.write') ||
          contentLower.includes('innerhtml') ||
          src.startsWith('data:') ||
          src.startsWith('javascript:')) {
        category = 'malicious_script';
        risk = 'critical';
        riskReason = 'Hidden script with potentially malicious content';
      }
    }

    // Hidden Links (SEO Spam or Malicious)
    if (tagName === 'a') {
      const href = attributes['href'] ?? '';
      if (href && !href.startsWith('#') && !href.startsWith('javascript:void')) {
        category = 'hidden_link';
        risk = 'medium';
        riskReason = `Hidden link: ${href.substring(0, 100)}`;
      }
    }

    // Data Exfiltration
    if (SUSPICIOUS_PATTERNS.dataExfil.srcs.some(src => attrString.includes(src)) ||
        SUSPICIOUS_PATTERNS.dataExfil.attributes.some(attr => attrString.includes(attr))) {
      category = 'data_exfiltration';
      risk = 'high';
      riskReason = 'Element with data exfiltration indicators';
    }

    // UI Redressing
    if ((element.computedStyle.position === 'absolute' || 
         element.computedStyle.position === 'fixed') &&
        parseInt(element.computedStyle.zIndex) > 1000 &&
        element.hiddenType === 'opacity-zero') {
      category = 'ui_redressing';
      risk = 'high';
      riskReason = 'Transparent overlay with high z-index - UI redressing attack';
    }

    // Legitimate cases
    if (category === 'unknown') {
      // Common legitimate patterns
      if (tagName === 'noscript' || 
          attributes['class']?.includes('sr-only') ||
          attributes['class']?.includes('visually-hidden') ||
          attributes['class']?.includes('hidden-accessible')) {
        category = 'legitimate';
        risk = 'info';
        riskReason = 'Likely legitimate accessibility element';
      }
    }

    return {
      id,
      type: element.hiddenType as HiddenElementType,
      tagName,
      selector: element.selector,
      attributes,
      computedStyle: element.computedStyle,
      boundingBox: element.boundingBox,
      innerHTML: element.innerHTML,
      textContent: element.textContent,
      risk,
      riskReason,
      category,
    };
  }

  /**
   * Check if element should be included based on config
   */
  private shouldInclude(element: HiddenElement): boolean {
    // Check category filter
    if (!this.config.includeCategories.includes(element.category) && 
        element.category !== 'legitimate' && 
        element.category !== 'unknown') {
      return false;
    }

    // Check risk level filter
    const riskLevels: HiddenElementRisk[] = ['info', 'low', 'medium', 'high', 'critical'];
    const minIndex = riskLevels.indexOf(this.config.minRiskLevel);
    const elementIndex = riskLevels.indexOf(element.risk);
    
    return elementIndex >= minIndex;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 🎯 CLICKJACKING ANALYSIS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Analyze page for clickjacking vulnerabilities
   */
  private async analyzeClickjacking(page: Page): Promise<void> {
    // Check for X-Frame-Options and CSP via meta tags
    const cspContent = await page.evaluate(() => {
      // Can't access response headers directly, but can check meta tags
      const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
      return cspMeta?.getAttribute('content') ?? null;
    });

    // Log CSP content for debugging if found
    if (cspContent) {
      this.emit('info', `Found CSP meta tag: ${cspContent.substring(0, 100)}...`);
    }

    // Find iframes that could be used for clickjacking
    const hiddenIframes = this.findings.filter(f => f.tagName === 'iframe');
    
    for (const iframe of hiddenIframes) {
      // Iframe overlay detection
      if (iframe.computedStyle.position === 'absolute' || 
          iframe.computedStyle.position === 'fixed') {
        this.clickjackingVectors.push({
          type: 'iframe_overlay',
          element: iframe,
          description: 'Hidden iframe positioned over page content',
          exploitability: 'easy',
          recommendation: 'Remove hidden iframe or add proper X-Frame-Options header',
        });
      }
    }

    // Find transparent overlay elements
    const transparentOverlays = this.findings.filter(f => 
      f.type === 'opacity-zero' &&
      (f.computedStyle.position === 'absolute' || f.computedStyle.position === 'fixed') &&
      parseInt(f.computedStyle.zIndex) > 100
    );

    for (const overlay of transparentOverlays) {
      this.clickjackingVectors.push({
        type: 'transparent_layer',
        element: overlay,
        description: 'Transparent element positioned over page - potential click interception',
        exploitability: 'medium',
        recommendation: 'Investigate transparent overlay and its purpose',
      });
    }

    // UI Redressing detection
    const redressingElements = this.findings.filter(f => f.category === 'ui_redressing');
    
    for (const element of redressingElements) {
      this.clickjackingVectors.push({
        type: 'ui_redressing',
        element,
        description: 'UI redressing attack vector detected',
        exploitability: 'medium',
        recommendation: 'Remove or properly display the hidden overlay element',
      });
    }

    // Check for pointer-events manipulation
    const pointerManipulated = this.findings.filter(f => 
      f.computedStyle.pointerEvents === 'none' &&
      (f.tagName === 'div' || f.tagName === 'span' || f.tagName === 'button')
    );

    for (const element of pointerManipulated) {
      if (element.boundingBox && element.boundingBox.width > 100 && element.boundingBox.height > 50) {
        this.clickjackingVectors.push({
          type: 'cursor_hijacking',
          element,
          description: 'Large element with pointer-events disabled - possible cursor hijacking',
          exploitability: 'difficult',
          recommendation: 'Review pointer-events usage for this element',
        });
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 📸 SCREENSHOT & REVEAL
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Take screenshot of the page
   */
  private async takeScreenshot(page: Page, url: string, suffix: string): Promise<string> {
    const urlHash = this.hashUrl(url);
    const filename = `hidden-scan-${urlHash}-${suffix}-${Date.now()}.png`;
    const screenshotPath = join(this.config.screenshotDir, filename);

    await page.screenshot({
      path: screenshotPath,
      fullPage: true,
      type: 'png',
    });

    return screenshotPath;
  }

  /**
   * Reveal hidden elements for screenshot
   */
  private async revealHidden(page: Page): Promise<void> {
    await page.evaluate(() => {
      const allElements = document.querySelectorAll('*');
      allElements.forEach(element => {
        const el = element as HTMLElement;
        const style = window.getComputedStyle(el);
        
        if (style.display === 'none') {
          el.style.setProperty('display', 'block', 'important');
          el.style.setProperty('border', '3px solid red', 'important');
          el.style.setProperty('background', 'rgba(255,0,0,0.1)', 'important');
        }
        
        if (style.visibility === 'hidden') {
          el.style.setProperty('visibility', 'visible', 'important');
          el.style.setProperty('border', '3px solid orange', 'important');
        }
        
        if (parseFloat(style.opacity) === 0) {
          el.style.setProperty('opacity', '0.5', 'important');
          el.style.setProperty('border', '3px solid yellow', 'important');
        }
      });
    });
  }

  /**
   * Generate hash for URL
   */
  private hashUrl(url: string): string {
    let hash = 0;
    for (let i = 0; i < url.length; i++) {
      const char = url.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).substring(0, 8);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 📊 REPORT GENERATION
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Build the final report
   */
  private buildReport(
    target: string,
    startTime: Date,
    endTime: Date,
    totalElements: number,
    screenshotPath?: string
  ): HiddenElementReport {
    const criticalFindings = this.findings.filter(f => f.risk === 'critical').length;
    const highRiskFindings = this.findings.filter(f => f.risk === 'high').length;
    
    const hiddenForms = this.findings.filter(f => f.tagName === 'form');
    const hiddenInputs = this.findings.filter(f => f.tagName === 'input');
    const hiddenIframes = this.findings.filter(f => f.tagName === 'iframe');
    const hiddenLinks = this.findings.filter(f => f.tagName === 'a');

    // Calculate risk score
    let riskScore = 0;
    riskScore += criticalFindings * 25;
    riskScore += highRiskFindings * 15;
    riskScore += this.findings.filter(f => f.risk === 'medium').length * 8;
    riskScore += this.findings.filter(f => f.risk === 'low').length * 3;
    riskScore += this.clickjackingVectors.length * 20;
    riskScore = Math.min(100, riskScore);

    // Generate recommendations
    const recommendations = this.generateRecommendations();

    return {
      target,
      startTime,
      endTime,
      totalElementsScanned: totalElements,
      hiddenElementsFound: this.findings.length,
      criticalFindings,
      highRiskFindings,
      clickjackingVectors: this.clickjackingVectors,
      hiddenForms,
      hiddenInputs,
      hiddenIframes,
      hiddenLinks,
      allHiddenElements: this.findings,
      riskScore,
      recommendations,
      screenshotPath,
    };
  }

  /**
   * Generate recommendations based on findings
   */
  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    
    const credentialHarvesters = this.findings.filter(f => f.category === 'credential_harvester');
    if (credentialHarvesters.length > 0) {
      recommendations.push(
        `🚨 CRITICAL: ${credentialHarvesters.length} hidden credential harvesting elements detected. ` +
        `These could be stealing user credentials. Investigate immediately.`
      );
    }

    if (this.clickjackingVectors.length > 0) {
      recommendations.push(
        `⚠️ ${this.clickjackingVectors.length} clickjacking vectors found. ` +
        `Implement X-Frame-Options and Content-Security-Policy headers.`
      );
    }

    const hiddenForms = this.findings.filter(f => f.tagName === 'form');
    if (hiddenForms.length > 0) {
      recommendations.push(
        `📝 ${hiddenForms.length} hidden forms detected. Review each form for legitimate purpose.`
      );
    }

    const exfilElements = this.findings.filter(f => f.category === 'data_exfiltration');
    if (exfilElements.length > 0) {
      recommendations.push(
        `🔍 ${exfilElements.length} potential data exfiltration elements found. Monitor network requests.`
      );
    }

    const maliciousScripts = this.findings.filter(f => f.category === 'malicious_script');
    if (maliciousScripts.length > 0) {
      recommendations.push(
        `💀 ${maliciousScripts.length} hidden scripts with suspicious content. Review script contents carefully.`
      );
    }

    if (recommendations.length === 0) {
      recommendations.push('✅ No critical hidden element issues detected.');
    }

    return recommendations;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 🧹 CLEANUP & UTILITIES
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
    this.findings = [];
    this.clickjackingVectors = [];
  }

  /**
   * Get all findings
   */
  getFindings(): HiddenElement[] {
    return [...this.findings];
  }

  /**
   * Get clickjacking vectors
   */
  getClickjackingVectors(): ClickjackingVector[] {
    return [...this.clickjackingVectors];
  }
}
