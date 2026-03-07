/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * QAntum
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * @copyright 2025 Димитър Продромов (Dimitar Prodromov). All Rights Reserved.
 * @license PROPRIETARY AND CONFIDENTIAL
 *
 * This file is part of QAntum.
 * Unauthorized copying, modification, distribution, or use of this file,
 * via any medium, is strictly prohibited without express written permission.
 *
 * For licensing inquiries: dimitar.prodromov@QAntum.dev
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import {Page} from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

// ═══════════════════════════════════════════════════════════════════════════
// INTERFACES
// ═══════════════════════════════════════════════════════════════════════════

/** Semantic element extracted from DOM */
export interface SemanticElement {
  /** Unique identifier for this element */
  id: string;
  /** Element tag name */
  tag: string;
  /** Visible text content */
  visibleText: string;
  /** ARIA label if present */
  ariaLabel: string | null;
  /** Placeholder text (for inputs) */
  placeholder: string | null;
  /** ARIA role */
  role: string | null;
  /** Element type (for inputs) */
  type: string | null;
  /** All CSS classes */
  classes: string[];
  /** Element ID attribute */
  elementId: string | null;
  /** Name attribute */
  name: string | null;
  /** Visual coordinates on screen */
  coordinates: {
    x: number;
    y: number;
    width: number;
    height: number;
    centerX: number;
    centerY: number;
  };
  /** Best selector found */
  selector: string;
  /** Is element currently visible */
  isVisible: boolean;
  /** Is element interactable */
  isInteractable: boolean;
  /** Parent semantic info */
  parentContext: string | null;
  /** Nearby text (context) */
  nearbyText: string[];
}

/** Semantic Map - abstracted view of page */
export interface SemanticMap {
  url: string;
  timestamp: Date;
  title: string;
  elements: SemanticElement[];
  /** Quick lookup by intent keywords */
  intentIndex: Map<string, SemanticElement[]>;
}

/** Intent definition */
export interface Intent {
  /** Action name like LOGIN_ACTION, SUBMIT_ORDER */
  action: string;
  /** Keywords to search for */
  keywords: string[];
  /** Synonyms for each keyword */
  synonyms?: Record<string, string[]>;
  /** Expected element type */
  expectedType?: 'button' | 'link' | 'input' | 'form' | 'any';
  /** Position hints */
  positionHint?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
}

/** Match result with confidence score */
export interface IntentMatch {
  element: SemanticElement;
  score: number;
  confidence: 'high' | 'medium' | 'low';
  matchReasons: string[];
}

/** Knowledge base entry for learned selectors */
export interface KnowledgeEntry {
  intent: string;
  url: string;
  selectors: {
    primary: string;
    fallbacks: string[];
  };
  visualSignature?: {
    position: { x: number; y: number };
    size: { width: number; height: number };
    nearbyText: string[];
  };
  lastUsed: Date;
  successCount: number;
  failCount: number;
}

/** ASC Configuration */
export interface ASCConfig {
  /** Path to knowledge.json file */
  knowledgePath?: string;
  /** Minimum confidence threshold (0-1) */
  confidenceThreshold?: number;
  /** Enable visual fallback */
  enableVisualFallback?: boolean;
  /** Enable auto-learning */
  enableLearning?: boolean;
  /** Verbose logging */
  verbose?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// SYNONYM DATABASE - Multi-language support
// ═══════════════════════════════════════════════════════════════════════════

const INTENT_SYNONYMS: Record<string, string[]> = {
  // Login/Auth
  'login': ['sign in', 'log in', 'вход', 'влез', 'einloggen', 'connexion', 'iniciar sesión', 'entrar'],
  'logout': ['sign out', 'log out', 'изход', 'излез', 'ausloggen', 'déconnexion', 'cerrar sesión', 'salir'],
  'register': ['sign up', 'create account', 'регистрация', 'регистрирай се', 'registrieren', 'inscription'],
  'password': ['парола', 'passwort', 'mot de passe', 'contraseña'],
  'email': ['e-mail', 'имейл', 'електронна поща', 'correo'],
  'username': ['user', 'потребител', 'потребителско име', 'usuario'],

  // Actions
  'submit': ['send', 'изпрати', 'потвърди', 'absenden', 'envoyer', 'enviar'],
  'cancel': ['back', 'отказ', 'назад', 'abbrechen', 'annuler', 'cancelar'],
  'save': ['запази', 'запиши', 'speichern', 'enregistrer', 'guardar'],
  'delete': ['remove', 'изтрий', 'премахни', 'löschen', 'supprimer', 'eliminar'],
  'edit': ['modify', 'редактирай', 'промени', 'bearbeiten', 'modifier', 'editar'],
  'search': ['find', 'търси', 'търсене', 'suchen', 'chercher', 'buscar'],
  'close': ['затвори', 'schließen', 'fermer', 'cerrar', 'x', '×'],

  // E-commerce
  'buy': ['purchase', 'order', 'купи', 'поръчай', 'kaufen', 'acheter', 'comprar'],
  'cart': ['basket', 'bag', 'количка', 'кошница', 'warenkorb', 'panier', 'carrito'],
  'checkout': ['pay', 'плащане', 'каса', 'kasse', 'paiement', 'pago'],
  'add to cart': ['add to basket', 'добави в количката', 'in den warenkorb', 'ajouter au panier'],
  'price': ['cost', 'цена', 'стойност', 'preis', 'prix', 'precio'],

  // Navigation
  'home': ['начало', 'главна', 'startseite', 'accueil', 'inicio'],
  'next': ['continue', 'forward', 'напред', 'продължи', 'weiter', 'suivant', 'siguiente'],
  'previous': ['back', 'назад', 'zurück', 'précédent', 'anterior'],
  'menu': ['меню', 'навигация'],

  // Forms
  'name': ['име', 'nom', 'nombre', 'first name', 'last name'],
  'phone': ['telephone', 'телефон', 'telefon', 'téléphone', 'teléfono'],
  'address': ['адрес', 'adresse', 'dirección'],
  'city': ['град', 'stadt', 'ville', 'ciudad'],
  'country': ['държава', 'страна', 'land', 'pays', 'país'],

  // Confirmations
  'confirm': ['ok', 'yes', 'accept', 'agree', 'потвърди', 'да', 'bestätigen', 'confirmer'],
  'deny': ['no', 'reject', 'decline', 'не', 'отхвърли', 'ablehnen', 'refuser', 'rechazar']
};

// ═══════════════════════════════════════════════════════════════════════════
// ADAPTIVE SEMANTIC CORE CLASS
// ═══════════════════════════════════════════════════════════════════════════

export class AdaptiveSemanticCore {
  private config: Required<ASCConfig>;
  private knowledge: Map<string, KnowledgeEntry> = new Map();
  private semanticCache: Map<string, SemanticMap> = new Map();

  constructor(config: ASCConfig = {}) {
    this.config = {
      knowledgePath: config.knowledgePath || './knowledge.json',
      confidenceThreshold: config.confidenceThreshold || 0.7,
      enableVisualFallback: config.enableVisualFallback ?? true,
      enableLearning: config.enableLearning ?? true,
      verbose: config.verbose || false
    };

    this.loadKnowledge();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. SEMANTIC ABSTRACTION LAYER (SAL)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * 🗺️ SAL: Convert raw DOM into Semantic Map
   * Filters only interactive elements and extracts semantic meaning
   */
  // Complexity: O(N*M) — nested iteration
  async createSemanticMap(page: Page): Promise<SemanticMap> {
    const url = page.url();

    // Check cache first
    const cacheKey = `${url}_${Date.now() - (Date.now() % 5000)}`; // 5s cache
    if (this.semanticCache.has(cacheKey)) {
      return this.semanticCache.get(cacheKey)!;
    }

    if (this.config.verbose) {
      console.log(`🗺️ SAL: Creating Semantic Map for ${url}`);
    }

    // SAFETY: async operation — wrap in try-catch for production resilience
    const title = await page.title();

    // Extract all interactive elements
    // SAFETY: async operation — wrap in try-catch for production resilience
    const elements = await page.evaluate(() => {
      const interactiveSelectors = [
        'button', 'a', 'input', 'select', 'textarea',
        '[role="button"]', '[role="link"]', '[role="menuitem"]',
        '[onclick]', '[ng-click]', '[v-on:click]', '[@click]',
        '.btn', '.button', '[class*="btn"]', '[class*="button"]'
      ];

      const getVisibleText = (el: Element): string => {
        // Get text content, handling various scenarios
        const text = el.textContent?.trim() || '';
        const value = (el as HTMLInputElement).value || '';
        const title = el.getAttribute('title') || '';
        return text || value || title;
      };

      const getNearbyText = (el: Element): string[] => {
        const nearby: string[] = [];

        // Parent text
        const parent = el.parentElement;
        if (parent) {
          const parentText = parent.textContent?.trim().slice(0, 100);
          if (parentText) nearby.push(parentText);
        }

        // Previous sibling
        const prev = el.previousElementSibling;
        if (prev) {
          const prevText = prev.textContent?.trim().slice(0, 50);
          if (prevText) nearby.push(prevText);
        }

        // Label (for inputs)
        const id = el.getAttribute('id');
        if (id) {
          const label = document.querySelector(`label[for="${id}"]`);
          if (label) nearby.push(label.textContent?.trim() || '');
        }

        return nearby.filter(t => t.length > 0);
      };

      const getBestSelector = (el: Element): string => {
        // Priority: id > data-testid > unique class > nth-child
        if (el.id) return `#${el.id}`;

        const testId = el.getAttribute('data-testid') || el.getAttribute('data-test-id');
        if (testId) return `[data-testid="${testId}"]`;

        const ariaLabel = el.getAttribute('aria-label');
        if (ariaLabel) return `[aria-label="${ariaLabel}"]`;

        // Build a unique selector
        const tag = el.tagName.toLowerCase();
        const classes = Array.from(el.classList).slice(0, 2).join('.');
        if (classes) return `${tag}.${classes}`;

        return tag;
      };

      const results: Array<{
        tag: string;
        visibleText: string;
        ariaLabel: string | null;
        placeholder: string | null;
        role: string | null;
        type: string | null;
        classes: string[];
        elementId: string | null;
        name: string | null;
        coordinates: {
          x: number;
          y: number;
          width: number;
          height: number;
          centerX: number;
          centerY: number;
        };
        selector: string;
        isVisible: boolean;
        isInteractable: boolean;
        parentContext: string | null;
        nearbyText: string[];
      }> = [];
      const seen = new Set<Element>();

      interactiveSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
          if (seen.has(el)) return;
          seen.add(el);

          const rect = el.getBoundingClientRect();

          // Skip invisible or tiny elements
          if (rect.width < 10 || rect.height < 10) return;
          if (rect.top < -100 || rect.left < -100) return;

          const style = window.getComputedStyle(el);
          if (style.display === 'none' || style.visibility === 'hidden') return;
          if (parseFloat(style.opacity) < 0.1) return;

          results.push({
            tag: el.tagName.toLowerCase(),
            visibleText: getVisibleText(el).slice(0, 200),
            ariaLabel: el.getAttribute('aria-label'),
            placeholder: el.getAttribute('placeholder'),
            role: el.getAttribute('role'),
            type: el.getAttribute('type'),
            classes: Array.from(el.classList),
            elementId: el.id || null,
            name: el.getAttribute('name'),
            coordinates: {
              x: Math.round(rect.x),
              y: Math.round(rect.y),
              width: Math.round(rect.width),
              height: Math.round(rect.height),
              centerX: Math.round(rect.x + rect.width / 2),
              centerY: Math.round(rect.y + rect.height / 2)
            },
            selector: getBestSelector(el),
            isVisible: rect.width > 0 && rect.height > 0,
            isInteractable: !el.hasAttribute('disabled'),
            parentContext: el.parentElement?.className || null,
            nearbyText: getNearbyText(el)
          });
        });
      });

      return results;
    });

    // Add unique IDs and create semantic map
    const semanticElements: SemanticElement[] = elements.map((el, idx) => ({
      ...el,
      id: `sem_${idx}_${el.tag}`
    }));

    // Build intent index for fast lookup
    const intentIndex = new Map<string, SemanticElement[]>();

    semanticElements.forEach(el => {
      const keywords = this.extractKeywords(el);
      keywords.forEach(keyword => {
        const lower = keyword.toLowerCase();
        if (!intentIndex.has(lower)) {
          intentIndex.set(lower, []);
        }
        intentIndex.get(lower)!.push(el);
      });
    });

    const semanticMap: SemanticMap = {
      url,
      timestamp: new Date(),
      title,
      elements: semanticElements,
      intentIndex
    };

    // Cache it
    this.semanticCache.set(cacheKey, semanticMap);

    if (this.config.verbose) {
      console.log(`✅ SAL: Found ${semanticElements.length} interactive elements`);
    }

    return semanticMap;
  }

  /**
   * Extract searchable keywords from element
   */
  // Complexity: O(N) — linear scan
  private extractKeywords(el: SemanticElement): string[] {
    const keywords: string[] = [];

    if (el.visibleText) {
      keywords.push(...el.visibleText.toLowerCase().split(/\s+/));
    }
    if (el.ariaLabel) {
      keywords.push(...el.ariaLabel.toLowerCase().split(/\s+/));
    }
    if (el.placeholder) {
      keywords.push(...el.placeholder.toLowerCase().split(/\s+/));
    }
    if (el.name) {
      keywords.push(el.name.toLowerCase());
    }
    if (el.elementId) {
      // Split camelCase and snake_case
      keywords.push(...el.elementId.toLowerCase().split(/[_-]/));
    }
    el.classes.forEach(cls => {
      keywords.push(...cls.toLowerCase().split(/[_-]/));
    });

    return [...new Set(keywords)].filter(k => k.length > 1);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. HEURISTIC INTENT MATCHER (HIM)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * 🎯 HIM: Find best element for given intent
   * Uses scoring algorithm with text matching, synonyms, position, proximity
   */
  // Complexity: O(N*M) — nested iteration
  async matchIntent(page: Page, intent: Intent): Promise<IntentMatch | null> {
    if (this.config.verbose) {
      console.log(`🎯 HIM: Matching intent "${intent.action}"`);
    }

    // Check knowledge base first
    const knownSelector = this.getKnownSelector(intent.action, page.url());
    if (knownSelector) {
      try {
        const element = await page.$(knownSelector);
        if (element && await element.isVisible()) {
          if (this.config.verbose) {
            console.log(`📚 Using known selector: ${knownSelector}`);
          }
          const semanticMap = await this.createSemanticMap(page);
          const matchedEl = semanticMap.elements.find(e => e.selector === knownSelector);
          if (matchedEl) {
            return {
              element: matchedEl,
              score: 1.0,
              confidence: 'high',
              matchReasons: ['Known selector from knowledge base']
            };
          }
        }
      } catch {
        // Known selector failed, continue with matching
      }
    }

    // SAFETY: async operation — wrap in try-catch for production resilience
    const semanticMap = await this.createSemanticMap(page);
    const candidates: IntentMatch[] = [];

    // Expand keywords with synonyms
    const allKeywords = this.expandKeywords(intent.keywords, intent.synonyms);

    for (const element of semanticMap.elements) {
      const score = this.calculateScore(element, intent, allKeywords);

      if (score > 0) {
        const confidence: 'high' | 'medium' | 'low' =
          score >= 0.8 ? 'high' :
          score >= 0.5 ? 'medium' : 'low';

        candidates.push({
          element,
          score,
          confidence,
          matchReasons: this.getMatchReasons(element, intent, allKeywords)
        });
      }
    }

    // Sort by score descending
    candidates.sort((a, b) => b.score - a.score);

    if (candidates.length === 0) {
      if (this.config.verbose) {
        console.log(`⚠️ HIM: No matches found for "${intent.action}"`);
      }
      return null;
    }

    const best = candidates[0];

    if (this.config.verbose) {
      console.log(`✅ HIM: Best match "${best.element.visibleText}" (score: ${best.score.toFixed(2)})`);
    }

    return best;
  }

  /**
   * Expand keywords with all synonyms
   */
  // Complexity: O(N) — linear scan
  private expandKeywords(
    keywords: string[],
    customSynonyms?: Record<string, string[]>
  ): Set<string> {
    const expanded = new Set<string>();

    keywords.forEach(keyword => {
      const lower = keyword.toLowerCase();
      expanded.add(lower);

      // Add from global synonyms
      if (INTENT_SYNONYMS[lower]) {
        INTENT_SYNONYMS[lower].forEach(syn => expanded.add(syn.toLowerCase()));
      }

      // Add from custom synonyms
      if (customSynonyms?.[lower]) {
        customSynonyms[lower].forEach(syn => expanded.add(syn.toLowerCase()));
      }

      // Reverse lookup - find keywords where this is a synonym
      Object.entries(INTENT_SYNONYMS).forEach(([key, syns]) => {
        if (syns.some(s => s.toLowerCase() === lower)) {
          expanded.add(key);
          syns.forEach(syn => expanded.add(syn.toLowerCase()));
        }
      });
    });

    return expanded;
  }

  /**
   * Calculate match score for element
   */
  // Complexity: O(1)
  private calculateScore(
    element: SemanticElement,
    intent: Intent,
    keywords: Set<string>
  ): number {
    let score = 0;
    const keywordArray = Array.from(keywords);

    // 1. Text matching (40% weight)
    const textScore = this.textMatchScore(element, keywordArray);
    score += textScore * 0.4;

    // 2. Type matching (20% weight)
    const typeScore = this.typeMatchScore(element, intent.expectedType);
    score += typeScore * 0.2;

    // 3. Position matching (15% weight)
    const positionScore = this.positionMatchScore(element, intent.positionHint);
    score += positionScore * 0.15;

    // 4. Aria/accessibility matching (15% weight)
    const ariaScore = this.ariaMatchScore(element, keywordArray);
    score += ariaScore * 0.15;

    // 5. Context/proximity matching (10% weight)
    const contextScore = this.contextMatchScore(element, keywordArray);
    score += contextScore * 0.1;

    return Math.min(1, score);
  }

  // Complexity: O(N) — loop
  private textMatchScore(element: SemanticElement, keywords: string[]): number {
    const text = `${element.visibleText} ${element.placeholder || ''} ${element.name || ''}`.toLowerCase();

    let matches = 0;
    let exactMatches = 0;

    for (const keyword of keywords) {
      if (text === keyword) {
        exactMatches++;
      } else if (text.includes(keyword)) {
        matches++;
      }
    }

    if (exactMatches > 0) return 1;
    if (matches > 0) return Math.min(1, matches * 0.3 + 0.4);
    return 0;
  }

  // Complexity: O(1)
  private typeMatchScore(element: SemanticElement, expectedType?: string): number {
    if (!expectedType || expectedType === 'any') return 0.5;

    const tagTypeMap: Record<string, string[]> = {
      'button': ['button', 'input[type=submit]', 'input[type=button]'],
      'link': ['a'],
      'input': ['input', 'textarea'],
      'form': ['form']
    };

    const expected = tagTypeMap[expectedType] || [expectedType];

    if (expected.includes(element.tag)) return 1;
    if (element.role === expectedType) return 0.9;
    if (element.classes.some(c => c.includes(expectedType))) return 0.7;

    return 0;
  }

  // Complexity: O(1)
  private positionMatchScore(element: SemanticElement, hint?: string): number {
    if (!hint) return 0.5;

    const { x, y, centerX, centerY } = element.coordinates;
    const viewportWidth = 1920; // Assume standard
    const viewportHeight = 1080;

    switch (hint) {
      case 'top-right':
        return (x > viewportWidth * 0.6 && y < viewportHeight * 0.3) ? 1 : 0.2;
      case 'top-left':
        return (x < viewportWidth * 0.4 && y < viewportHeight * 0.3) ? 1 : 0.2;
      case 'bottom-right':
        return (x > viewportWidth * 0.6 && y > viewportHeight * 0.7) ? 1 : 0.2;
      case 'bottom-left':
        return (x < viewportWidth * 0.4 && y > viewportHeight * 0.7) ? 1 : 0.2;
      case 'center':
        const centerDist = Math.sqrt(
          Math.pow(centerX - viewportWidth/2, 2) +
          Math.pow(centerY - viewportHeight/2, 2)
        );
        return Math.max(0, 1 - centerDist / 500);
      default:
        return 0.5;
    }
  }

  // Complexity: O(N) — loop
  private ariaMatchScore(element: SemanticElement, keywords: string[]): number {
    if (!element.ariaLabel && !element.role) return 0;

    const ariaText = `${element.ariaLabel || ''} ${element.role || ''}`.toLowerCase();

    for (const keyword of keywords) {
      if (ariaText.includes(keyword)) return 1;
    }

    return 0;
  }

  // Complexity: O(N) — loop
  private contextMatchScore(element: SemanticElement, keywords: string[]): number {
    const context = element.nearbyText.join(' ').toLowerCase();

    let matches = 0;
    for (const keyword of keywords) {
      if (context.includes(keyword)) matches++;
    }

    return Math.min(1, matches * 0.25);
  }

  // Complexity: O(N) — linear scan
  private getMatchReasons(
    element: SemanticElement,
    intent: Intent,
    keywords: Set<string>
  ): string[] {
    const reasons: string[] = [];
    const keywordArray = Array.from(keywords);

    const text = element.visibleText.toLowerCase();
    keywordArray.forEach(k => {
      if (text.includes(k)) reasons.push(`Text contains "${k}"`);
    });

    if (element.ariaLabel) {
      keywordArray.forEach(k => {
        if (element.ariaLabel!.toLowerCase().includes(k)) {
          reasons.push(`Aria-label contains "${k}"`);
        }
      });
    }

    if (intent.expectedType && element.tag === intent.expectedType) {
      reasons.push(`Matches expected type "${intent.expectedType}"`);
    }

    return reasons;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. VISUAL-TO-CODE BRIDGE (Self-Healing 2.0)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * 👁️ VCB: Visual fallback when HIM confidence is low
   * Takes screenshot, finds element visually, extracts new selector
   */
  // Complexity: O(N)
  async visualFallback(
    page: Page,
    intent: Intent,
    description: string
  ): Promise<IntentMatch | null> {
    if (!this.config.enableVisualFallback) {
      return null;
    }

    if (this.config.verbose) {
      console.log(`👁️ VCB: Initiating visual fallback for "${intent.action}"`);
    }

    // Take screenshot
    const screenshotPath = path.join(
      path.dirname(this.config.knowledgePath),
      `screenshot_${Date.now()}.png`
    );

    // SAFETY: async operation — wrap in try-catch for production resilience
    await page.screenshot({ path: screenshotPath, fullPage: false });

    if (this.config.verbose) {
      console.log(`📸 Screenshot saved: ${screenshotPath}`);
    }

    // For now, return null - Vision AI integration would go here
    // In production, you'd call Gemini Vision API here

    // Cleanup screenshot
    try {
      fs.unlinkSync(screenshotPath);
    } catch {}

    return null;
  }

  /**
   * 🔄 Extract selector from coordinates using page context
   */
  // Complexity: O(N) — linear scan
  async extractSelectorFromCoordinates(
    page: Page,
    x: number,
    y: number
  ): Promise<string | null> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    const selector = await page.evaluate(({ x, y }) => {
      const element = document.elementFromPoint(x, y);
      if (!element) return null;

      // Try to build best selector
      if (element.id) return `#${element.id}`;

      const testId = element.getAttribute('data-testid');
      if (testId) return `[data-testid="${testId}"]`;

      const ariaLabel = element.getAttribute('aria-label');
      if (ariaLabel) return `[aria-label="${ariaLabel}"]`;

      // Build path selector
      const path: string[] = [];
      let current: Element | null = element;

      while (current && current !== document.body) {
        let selector = current.tagName.toLowerCase();
        if (current.id) {
          selector = `#${current.id}`;
          path.unshift(selector);
          break;
        }

        const siblings = Array.from(current.parentElement?.children || []);
        const sameTag = siblings.filter(s => s.tagName === current!.tagName);
        if (sameTag.length > 1) {
          const index = sameTag.indexOf(current) + 1;
          selector += `:nth-of-type(${index})`;
        }

        path.unshift(selector);
        current = current.parentElement;
      }

      return path.join(' > ');
    }, { x, y });

    return selector;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // KNOWLEDGE BASE MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Load knowledge from file
   */
  // Complexity: O(N) — linear scan
  private loadKnowledge(): void {
    try {
      if (fs.existsSync(this.config.knowledgePath)) {
        const data = JSON.parse(fs.readFileSync(this.config.knowledgePath, 'utf-8'));

        if (Array.isArray(data)) {
          data.forEach((entry: KnowledgeEntry) => {
            const key = `${entry.intent}:${entry.url}`;
            this.knowledge.set(key, entry);
          });
        }

        if (this.config.verbose) {
          console.log(`📚 Loaded ${this.knowledge.size} knowledge entries`);
        }
      }
    } catch (error) {
      if (this.config.verbose) {
        console.log(`⚠️ Could not load knowledge: ${error}`);
      }
    }
  }

  /**
   * Save knowledge to file
   */
  // Complexity: O(1)
  saveKnowledge(): void {
    try {
      const data = Array.from(this.knowledge.values());
      fs.writeFileSync(
        this.config.knowledgePath,
        JSON.stringify(data, null, 2),
        'utf-8'
      );

      if (this.config.verbose) {
        console.log(`💾 Saved ${data.length} knowledge entries`);
      }
    } catch (error) {
      if (this.config.verbose) {
        console.log(`⚠️ Could not save knowledge: ${error}`);
      }
    }
  }

  /**
   * Get known selector for intent
   */
  // Complexity: O(1) — lookup
  private getKnownSelector(action: string, url: string): string | null {
    const key = `${action}:${url}`;
    const entry = this.knowledge.get(key);

    if (entry && entry.selectors.primary) {
      return entry.selectors.primary;
    }

    return null;
  }

  /**
   * Learn new selector from successful match
   */
  // Complexity: O(1) — lookup
  learnSelector(
    intent: string,
    url: string,
    element: SemanticElement,
    success: boolean
  ): void {
    if (!this.config.enableLearning) return;

    const key = `${intent}:${url}`;
    let entry = this.knowledge.get(key);

    if (!entry) {
      entry = {
        intent,
        url,
        selectors: {
          primary: element.selector,
          fallbacks: []
        },
        visualSignature: {
          position: { x: element.coordinates.x, y: element.coordinates.y },
          size: { width: element.coordinates.width, height: element.coordinates.height },
          nearbyText: element.nearbyText
        },
        lastUsed: new Date(),
        successCount: 0,
        failCount: 0
      };
    }

    if (success) {
      entry.successCount++;
      entry.lastUsed = new Date();

      // Update primary selector if this one is better
      if (element.selector !== entry.selectors.primary) {
        if (!entry.selectors.fallbacks.includes(element.selector)) {
          entry.selectors.fallbacks.push(element.selector);
        }
      }
    } else {
      entry.failCount++;

      // Move failed selector to fallbacks
      if (entry.selectors.primary === element.selector) {
        if (entry.selectors.fallbacks.length > 0) {
          entry.selectors.primary = entry.selectors.fallbacks.shift()!;
        }
      }
    }

    this.knowledge.set(key, entry);
    this.saveKnowledge();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // HIGH-LEVEL API
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * 🚀 Execute intent - main entry point
   * Tries HIM first, falls back to VCB if confidence is low
   */
  // Complexity: O(N)
  async executeIntent(
    page: Page,
    intent: Intent,
    action: 'click' | 'fill' | 'hover' = 'click',
    value?: string
  ): Promise<boolean> {
    if (this.config.verbose) {
      console.log(`\n🚀 Executing intent: ${intent.action}`);
    }

    // Try HIM first
    // SAFETY: async operation — wrap in try-catch for production resilience
    let match = await this.matchIntent(page, intent);

    // If low confidence, try visual fallback
    if (!match || match.score < this.config.confidenceThreshold) {
      if (this.config.enableVisualFallback) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const visualMatch = await this.visualFallback(
          page,
          intent,
          intent.keywords.join(' ')
        );
        if (visualMatch && visualMatch.score > (match?.score || 0)) {
          match = visualMatch;
        }
      }
    }

    if (!match) {
      if (this.config.verbose) {
        console.log(`❌ Could not find element for "${intent.action}"`);
      }
      return false;
    }

    // Execute the action
    try {
      const element = await page.$(match.element.selector);

      if (!element) {
        // Fallback to coordinates
        if (this.config.verbose) {
          console.log(`🎯 Using coordinates fallback`);
        }

        const { centerX, centerY } = match.element.coordinates;

        switch (action) {
          case 'click':
            await page.mouse.click(centerX, centerY);
            break;
          case 'hover':
            // SAFETY: async operation — wrap in try-catch for production resilience
            await page.mouse.move(centerX, centerY);
            break;
          case 'fill':
            // SAFETY: async operation — wrap in try-catch for production resilience
            await page.mouse.click(centerX, centerY);
            // SAFETY: async operation — wrap in try-catch for production resilience
            if (value) await page.keyboard.type(value);
            break;
        }
      } else {
        switch (action) {
          case 'click':
            // SAFETY: async operation — wrap in try-catch for production resilience
            await element.click();
            break;
          case 'hover':
            // SAFETY: async operation — wrap in try-catch for production resilience
            await element.hover();
            break;
          case 'fill':
            // SAFETY: async operation — wrap in try-catch for production resilience
            await element.fill(value || '');
            break;
        }
      }

      // Learn from success
      this.learnSelector(intent.action, page.url(), match.element, true);

      if (this.config.verbose) {
        console.log(`✅ Successfully executed "${intent.action}"`);
      }

      return true;

    } catch (error) {
      // Learn from failure
      this.learnSelector(intent.action, page.url(), match.element, false);

      if (this.config.verbose) {
        console.log(`❌ Failed to execute "${intent.action}": ${error}`);
      }

      return false;
    }
  }

  /**
   * 🔍 Quick intent matching for common actions
   */
  // Complexity: O(1)
  async findElement(
    page: Page,
    keywords: string[],
    options: Partial<Intent> = {}
  ): Promise<IntentMatch | null> {
    const intent: Intent = {
      action: `FIND_${keywords.join('_').toUpperCase()}`,
      keywords,
      ...options
    };

    return this.matchIntent(page, intent);
  }

  /**
   * 📊 Get statistics about knowledge base
   */
  // Complexity: O(N log N) — sort
  getStats(): {
    totalEntries: number;
    successRate: number;
    mostUsed: string[];
  } {
    const entries = Array.from(this.knowledge.values());
    const totalSuccess = entries.reduce((sum, e) => sum + e.successCount, 0);
    const totalFail = entries.reduce((sum, e) => sum + e.failCount, 0);
    const total = totalSuccess + totalFail;

    const sorted = entries.sort((a, b) => b.successCount - a.successCount);

    return {
      totalEntries: entries.length,
      successRate: total > 0 ? totalSuccess / total : 0,
      mostUsed: sorted.slice(0, 5).map(e => e.intent)
    };
  }

  /**
   * 🧹 Clear semantic cache
   */
  // Complexity: O(1)
  clearCache(): void {
    this.semanticCache.clear();
    if (this.config.verbose) {
      console.log('🧹 Semantic cache cleared');
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export default AdaptiveSemanticCore;

// Pre-defined common intents
export const CommonIntents = {
  LOGIN: {
    action: 'LOGIN_ACTION',
    keywords: ['login', 'sign in'],
    expectedType: 'button' as const,
    positionHint: 'top-right' as const
  },
  LOGOUT: {
    action: 'LOGOUT_ACTION',
    keywords: ['logout', 'sign out'],
    expectedType: 'button' as const
  },
  SUBMIT: {
    action: 'SUBMIT_ACTION',
    keywords: ['submit', 'send', 'confirm'],
    expectedType: 'button' as const
  },
  SEARCH: {
    action: 'SEARCH_ACTION',
    keywords: ['search', 'find'],
    expectedType: 'input' as const
  },
  ADD_TO_CART: {
    action: 'ADD_TO_CART_ACTION',
    keywords: ['add to cart', 'add to basket', 'buy'],
    expectedType: 'button' as const
  },
  CHECKOUT: {
    action: 'CHECKOUT_ACTION',
    keywords: ['checkout', 'proceed', 'pay'],
    expectedType: 'button' as const
  },
  NEXT: {
    action: 'NEXT_ACTION',
    keywords: ['next', 'continue', 'forward'],
    expectedType: 'button' as const
  },
  CLOSE: {
    action: 'CLOSE_ACTION',
    keywords: ['close', 'x', 'dismiss'],
    expectedType: 'button' as const
  }
};
