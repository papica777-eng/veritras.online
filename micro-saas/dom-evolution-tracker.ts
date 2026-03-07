/**
 * ╔═══════════════════════════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                                                   ║
 * ║   🧬 DOM EVOLUTION TRACKER                                                                        ║
 * ║   "Recording the Genetic Code of Every Element"                                                   ║
 * ║                                                                                                   ║
 * ║   Part of THE PREDICTION MATRIX - QANTUM v15.1                                              ║
 * ║                                                                                                   ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════════════════╝
 */

import { createHash } from 'crypto';
import { EventEmitter } from 'events';
import type {
  ElementGeneticCode,
  SelectorDNA,
  SelectorType,
  AttributeSnapshot,
  StyleSnapshot,
  StructuralPosition,
  SiblingInfo,
  AncestryInfo,
  BoundingBox,
  ElementEvolutionHistory,
  RecordedMutation,
  MutationType,
  PredictionKnowledge
} from './types';

// ═══════════════════════════════════════════════════════════════════════════════════════
// 🎯 SELECTOR TYPE BASE SCORES (higher = more stable)
// ═══════════════════════════════════════════════════════════════════════════════════════

const SELECTOR_TYPE_BASE_SCORES: Record<SelectorType, number> = {
  'DATA_TESTID': 0.95,      // Most stable - explicitly for testing
  'DATA_CY': 0.93,          // Cypress-specific, very stable
  'ARIA_LABEL': 0.88,       // Accessibility-focused, rarely changes
  'ARIA_ROLE': 0.85,        // Semantic, stable
  'NAME': 0.75,             // Form elements, moderately stable
  'ID': 0.70,               // Can change with frameworks
  'TEXT_CONTENT': 0.50,     // Internationalization risk
  'CLASS': 0.40,            // Often changes with styling
  'NTH_CHILD': 0.30,        // Fragile to DOM changes
  'CSS_PATH': 0.25,         // Very fragile
  'XPATH': 0.20             // Most fragile
};

// ═══════════════════════════════════════════════════════════════════════════════════════
// 🧬 DOM EVOLUTION TRACKER CLASS
// ═══════════════════════════════════════════════════════════════════════════════════════

export class DOMEvolutionTracker extends EventEmitter {
  private knowledge: PredictionKnowledge;
  private knowledgePath: string;
  private cache: Map<string, ElementGeneticCode> = new Map();
  private dirty: boolean = false;
  private saveDebounceTimer: NodeJS.Timeout | null = null;

  constructor(knowledgePath: string = './knowledge/prediction-knowledge.json') {
    super();
    this.knowledgePath = knowledgePath;
    this.knowledge = this.loadKnowledge();

    // Auto-save every 30 seconds if dirty
    setInterval(() => {
      if (this.dirty) {
        this.saveKnowledge();
      }
    }, 30000);
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // 🧬 CAPTURE ELEMENT GENETIC CODE
  // ═══════════════════════════════════════════════════════════════════════════════

  /**
   * Capture the complete "genetic code" of a DOM element
   * This is the core function that records everything about an element
   */
  async captureGeneticCode(
    element: any, // Playwright ElementHandle or similar
    page: any,    // Playwright Page
    primarySelector: string
  ): Promise<ElementGeneticCode> {
    const timestamp = Date.now();

    // Execute in browser context for performance
    const elementData = await page.evaluate((sel: string) => {
      const el = document.querySelector(sel);
      if (!el) return null;

      // Helper to get computed styles
      const getStyles = (element: Element): Record<string, string> => {
        const computed = window.getComputedStyle(element);
        return {
          display: computed.display,
          visibility: computed.visibility,
          position: computed.position,
          zIndex: computed.zIndex,
          width: computed.width,
          height: computed.height,
          color: computed.color,
          backgroundColor: computed.backgroundColor,
          fontSize: computed.fontSize,
          fontFamily: computed.fontFamily
        };
      };

      // Helper to get all attributes
      const getAttributes = (element: Element): Record<string, any> => {
        const attrs: Record<string, any> = {
          dataAttributes: {},
          ariaAttributes: {},
          customAttributes: {}
        };

        for (const attr of Array.from(element.attributes)) {
          if (attr.name === 'id') {
            attrs.id = attr.value;
          } else if (attr.name === 'name') {
            attrs.name = attr.value;
          } else if (attr.name === 'class') {
            attrs.class = attr.value.split(' ').filter(Boolean);
          } else if (attr.name.startsWith('data-')) {
            attrs.dataAttributes[attr.name] = attr.value;
          } else if (attr.name.startsWith('aria-')) {
            attrs.ariaAttributes[attr.name] = attr.value;
          } else {
            attrs.customAttributes[attr.name] = attr.value;
          }
        }

        // Form-specific attributes
        if (el instanceof HTMLInputElement || el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement) {
          attrs.formAttributes = {
            type: (el as HTMLInputElement).type,
            placeholder: (el as HTMLInputElement).placeholder,
            required: el.required,
            disabled: el.disabled
          };
        }

        return attrs;
      };

      // Helper to get structural position
      const getStructure = (element: Element): Record<string, any> => {
        const parent = element.parentElement;
        const siblings = parent ? Array.from(parent.children) : [];
        const index = siblings.indexOf(element);
        const sameTagSiblings = siblings.filter(s => s.tagName === element.tagName);
        const tagIndex = sameTagSiblings.indexOf(element);

        // Calculate depth
        let depth = 0;
        let current: Element | null = element;
        while (current && current.tagName !== 'BODY') {
          depth++;
          current = current.parentElement;
        }

        // Build path
        const buildPath = (el: Element): string => {
          const parts: string[] = [];
          let cur: Element | null = el;
          while (cur && cur.tagName !== 'BODY') {
            const p = cur.parentElement;
            if (p) {
              const sibs = Array.from(p.children).filter(s => s.tagName === cur!.tagName);
              const idx = sibs.indexOf(cur);
              parts.unshift(`${cur.tagName.toLowerCase()}${sibs.length > 1 ? `:nth-of-type(${idx + 1})` : ''}`);
            }
            cur = cur.parentElement;
          }
          return 'body > ' + parts.join(' > ');
        };

        return {
          tagName: element.tagName.toLowerCase(),
          index,
          globalIndex: index,
          depth,
          path: buildPath(element),
          tagIndex
        };
      };

      // Helper to get sibling info
      const getSiblings = (element: Element): Record<string, any> => {
        const prev = element.previousElementSibling;
        const next = element.nextElementSibling;
        const parent = element.parentElement;
        const siblings = parent ? Array.from(parent.children) : [];

        const siblingSnapshot = (sib: Element | null) => {
          if (!sib) return undefined;
          return {
            tagName: sib.tagName.toLowerCase(),
            id: sib.id || undefined,
            class: sib.className ? sib.className.split(' ').filter(Boolean) : undefined,
            textContent: sib.textContent?.slice(0, 50)
          };
        };

        return {
          prevSibling: siblingSnapshot(prev),
          nextSibling: siblingSnapshot(next),
          siblingCount: siblings.length,
          sameTagSiblingCount: siblings.filter(s => s.tagName === element.tagName).length
        };
      };

      // Helper to get ancestry
      const getAncestry = (element: Element): Record<string, any>[] => {
        const ancestry: Record<string, any>[] = [];
        let current = element.parentElement;
        let level = 1;

        while (current && level <= 3 && current.tagName !== 'BODY') {
          ancestry.push({
            tagName: current.tagName.toLowerCase(),
            id: current.id || undefined,
            class: current.className ? current.className.split(' ').filter(Boolean) : undefined,
            level
          });
          current = current.parentElement;
          level++;
        }

        return ancestry;
      };

      // Get bounding box
      const rect = el.getBoundingClientRect();

      // Calculate content hash
      const contentHash = (el.textContent || '').trim().slice(0, 100);

      return {
        attributes: getAttributes(el),
        styles: getStyles(el),
        structure: getStructure(el),
        siblings: getSiblings(el),
        ancestry: getAncestry(el),
        boundingBox: {
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height
        },
        contentHash
      };
    }, primarySelector);

    if (!elementData) {
      throw new Error(`Element not found: ${primarySelector}`);
    }

    // Generate tracking ID
    const trackingId = this.generateTrackingId(elementData);

    // Extract all possible selectors
    const selectors = this.extractSelectors(elementData, primarySelector);

    const geneticCode: ElementGeneticCode = {
      trackingId,
      timestamp,
      primarySelector,
      tagName: elementData.structure?.tagName || 'unknown',
      selectors,
      attributes: elementData.attributes as AttributeSnapshot,
      styles: elementData.styles as StyleSnapshot,
      structure: elementData.structure as StructuralPosition,
      siblings: elementData.siblings as SiblingInfo,
      ancestry: elementData.ancestry as AncestryInfo[],
      contentHash: this.hashContent(elementData.contentHash),
      boundingBox: elementData.boundingBox as BoundingBox
    };

    // Store in evolution history
    this.recordEvolution(geneticCode);

    // Update cache
    this.cache.set(trackingId, geneticCode);

    this.emit('geneticCodeCaptured', geneticCode);

    return geneticCode;
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // 🔍 EXTRACT ALL POSSIBLE SELECTORS
  // ═══════════════════════════════════════════════════════════════════════════════

  private extractSelectors(elementData: any, primarySelector: string): SelectorDNA[] {
    const selectors: SelectorDNA[] = [];
    const attrs = elementData.attributes;
    const structure = elementData.structure;

    // ID selector
    if (attrs.id) {
      selectors.push(this.createSelectorDNA('ID', `#${attrs.id}`));
    }

    // data-testid
    if (attrs.dataAttributes['data-testid']) {
      selectors.push(this.createSelectorDNA('DATA_TESTID', `[data-testid="${attrs.dataAttributes['data-testid']}"]`));
    }

    // data-cy (Cypress)
    if (attrs.dataAttributes['data-cy']) {
      selectors.push(this.createSelectorDNA('DATA_CY', `[data-cy="${attrs.dataAttributes['data-cy']}"]`));
    }

    // aria-label
    if (attrs.ariaAttributes['aria-label']) {
      selectors.push(this.createSelectorDNA('ARIA_LABEL', `[aria-label="${attrs.ariaAttributes['aria-label']}"]`));
    }

    // aria-role
    if (attrs.ariaAttributes['role']) {
      selectors.push(this.createSelectorDNA('ARIA_ROLE', `[role="${attrs.ariaAttributes['role']}"]`));
    }

    // name attribute
    if (attrs.name) {
      selectors.push(this.createSelectorDNA('NAME', `[name="${attrs.name}"]`));
    }

    // Class-based (first stable-looking class)
    if (attrs.class && attrs.class.length > 0) {
      const stableClass = attrs.class.find((c: string) =>
        !c.match(/^(css-|sc-|styled-|_|__|\d)/) // Filter out generated classes
      );
      if (stableClass) {
        selectors.push(this.createSelectorDNA('CLASS', `.${stableClass}`));
      }
    }

    // CSS Path
    selectors.push(this.createSelectorDNA('CSS_PATH', structure.path));

    // Text content (if short and unique)
    if (elementData.contentHash && elementData.contentHash.length > 0 && elementData.contentHash.length < 50) {
      selectors.push(this.createSelectorDNA('TEXT_CONTENT', `text="${elementData.contentHash}"`));
    }

    // nth-child fallback
    selectors.push(this.createSelectorDNA(
      'NTH_CHILD',
      `${structure.tagName}:nth-child(${structure.index + 1})`
    ));

    // Update stability scores from history
    this.updateSelectorStabilityFromHistory(selectors, elementData);

    return selectors.sort((a, b) => b.survivalProbability - a.survivalProbability);
  }

  private createSelectorDNA(type: SelectorType, value: string): SelectorDNA {
    const baseScore = SELECTOR_TYPE_BASE_SCORES[type];

    return {
      type,
      value,
      specificity: this.calculateSpecificity(type, value),
      stability: baseScore,
      changeCount: 0,
      survivalProbability: baseScore
    };
  }

  private calculateSpecificity(type: SelectorType, value: string): number {
    // CSS Specificity calculation (simplified)
    switch (type) {
      case 'ID':
        return 100;
      case 'CLASS':
      case 'DATA_TESTID':
      case 'DATA_CY':
      case 'ARIA_LABEL':
      case 'ARIA_ROLE':
      case 'NAME':
        return 10;
      case 'NTH_CHILD':
      case 'CSS_PATH':
        return 1;
      default:
        return 1;
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // 📊 UPDATE SELECTOR STABILITY FROM HISTORY
  // ═══════════════════════════════════════════════════════════════════════════════

  private updateSelectorStabilityFromHistory(selectors: SelectorDNA[], elementData: any): void {
    const trackingId = this.generateTrackingId(elementData);
    const history = this.knowledge.elements.get(trackingId);

    if (!history) return;

    for (const selector of selectors) {
      const historicalStability = history.selectorStability.get(selector.value);

      if (historicalStability) {
        selector.stability = historicalStability.score;
        selector.changeCount = historicalStability.factors.changeFrequency;
        selector.lastChangeTimestamp = historicalStability.lastUpdated;

        // Calculate survival probability
        selector.survivalProbability = this.calculateSurvivalProbability(
          selector,
          historicalStability,
          history
        );
      }
    }
  }

  private calculateSurvivalProbability(
    selector: SelectorDNA,
    stability: any,
    history: ElementEvolutionHistory
  ): number {
    const baseScore = SELECTOR_TYPE_BASE_SCORES[selector.type];
    const changeFrequency = stability.factors.changeFrequency || 0;
    const daysSinceChange = stability.factors.daysSinceLastChange || 30;
    const successRate = stability.factors.successCount /
      Math.max(1, stability.factors.successCount + stability.factors.failureCount);

    // Weighted formula:
    // - 40% base type score
    // - 25% change frequency penalty (fewer changes = better)
    // - 20% recency bonus (longer stable = better)
    // - 15% success rate

    const changePenalty = Math.max(0, 1 - (changeFrequency * 0.1));
    const recencyBonus = Math.min(1, daysSinceChange / 30);

    const survivalProbability = (
      baseScore * 0.40 +
      changePenalty * 0.25 +
      recencyBonus * 0.20 +
      successRate * 0.15
    );

    return Math.max(0, Math.min(1, survivalProbability));
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // 📝 RECORD EVOLUTION HISTORY
  // ═══════════════════════════════════════════════════════════════════════════════

  private recordEvolution(geneticCode: ElementGeneticCode): void {
    const trackingId = geneticCode.trackingId;
    let history = this.knowledge.elements.get(trackingId);

    if (!history) {
      // New element - create history
      history = {
        trackingId,
        firstSeen: geneticCode.timestamp,
        lastSeen: geneticCode.timestamp,
        snapshots: [geneticCode],
        selectorStability: new Map(),
        mutations: []
      };
      this.knowledge.elements.set(trackingId, history);
    } else {
      // Existing element - check for mutations
      const lastSnapshot = history.snapshots[history.snapshots.length - 1];
      const mutations = this.detectMutations(lastSnapshot, geneticCode);

      if (mutations.length > 0) {
        history.mutations.push(...mutations);
        this.updateStabilityAfterMutation(history, mutations);
        this.emit('mutationDetected', { trackingId, mutations });
      }

      history.lastSeen = geneticCode.timestamp;
      history.snapshots.push(geneticCode);

      // Keep only last 100 snapshots to manage memory
      if (history.snapshots.length > 100) {
        history.snapshots = history.snapshots.slice(-100);
      }
    }

    // Update selector stability scores
    for (const selector of geneticCode.selectors) {
      this.updateSelectorStabilityScore(history, selector);
    }

    this.dirty = true;
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // 🔍 MUTATION DETECTION
  // ═══════════════════════════════════════════════════════════════════════════════

  private detectMutations(
    before: ElementGeneticCode,
    after: ElementGeneticCode
  ): RecordedMutation[] {
    const mutations: RecordedMutation[] = [];
    const timestamp = after.timestamp;

    // Check ID change
    if (before.attributes.id !== after.attributes.id) {
      if (!after.attributes.id) {
        mutations.push(this.createMutation('ID_REMOVED', timestamp, before.attributes.id, undefined));
      } else {
        mutations.push(this.createMutation('ID_CHANGED', timestamp, before.attributes.id, after.attributes.id));
      }
    }

    // Check class changes
    const beforeClasses = before.attributes.class || [];
    const afterClasses = after.attributes.class || [];
    const beforeClassSet = new Set(beforeClasses);
    const afterClassSet = new Set(afterClasses);

    for (const cls of beforeClasses) {
      if (!afterClassSet.has(cls)) {
        mutations.push(this.createMutation('CLASS_REMOVED', timestamp, cls, undefined));
      }
    }

    for (const cls of afterClasses) {
      if (!beforeClassSet.has(cls)) {
        mutations.push(this.createMutation('CLASS_ADDED', timestamp, undefined, cls));
      }
    }

    // Check data-testid
    const beforeTestId = before.attributes.dataAttributes?.['data-testid'];
    const afterTestId = after.attributes.dataAttributes?.['data-testid'];
    if (beforeTestId !== afterTestId) {
      if (!afterTestId && beforeTestId) {
        mutations.push(this.createMutation('DATA_TESTID_REMOVED', timestamp, beforeTestId, undefined));
      } else if (afterTestId && !beforeTestId) {
        mutations.push(this.createMutation('DATA_TESTID_ADDED', timestamp, undefined, afterTestId));
      } else {
        mutations.push(this.createMutation('ATTRIBUTE_CHANGED', timestamp, beforeTestId, afterTestId));
      }
    }

    // Check aria-label
    const beforeAria = before.attributes.ariaAttributes?.['aria-label'];
    const afterAria = after.attributes.ariaAttributes?.['aria-label'];
    if (beforeAria !== afterAria) {
      mutations.push(this.createMutation('ARIA_CHANGED', timestamp, beforeAria, afterAria));
    }

    // Check structural changes
    if (before.structure.path !== after.structure.path) {
      mutations.push(this.createMutation('ELEMENT_MOVED', timestamp, before.structure.path, after.structure.path));
    }

    // Check depth change (nested)
    if (Math.abs(before.structure.depth - after.structure.depth) > 1) {
      mutations.push(this.createMutation('ELEMENT_NESTED', timestamp,
        String(before.structure.depth),
        String(after.structure.depth)
      ));
    }

    return mutations;
  }

  private createMutation(
    type: MutationType,
    timestamp: number,
    before?: string,
    after?: string
  ): RecordedMutation {
    return {
      timestamp,
      type,
      before: before || '',
      after: after || '',
      affectedSelectors: this.getAffectedSelectors(type)
    };
  }

  private getAffectedSelectors(mutationType: MutationType): string[] {
    const mapping: Record<MutationType, SelectorType[]> = {
      'ID_CHANGED': ['ID'],
      'ID_REMOVED': ['ID'],
      'CLASS_ADDED': ['CLASS'],
      'CLASS_REMOVED': ['CLASS'],
      'CLASS_RENAMED': ['CLASS'],
      'ATTRIBUTE_CHANGED': ['NAME', 'DATA_TESTID', 'DATA_CY'],
      'ATTRIBUTE_REMOVED': ['NAME', 'DATA_TESTID', 'DATA_CY'],
      'ELEMENT_MOVED': ['CSS_PATH', 'XPATH', 'NTH_CHILD'],
      'ELEMENT_NESTED': ['CSS_PATH', 'XPATH', 'NTH_CHILD'],
      'ELEMENT_CLONED': ['ID', 'NTH_CHILD'],
      'TEXT_CHANGED': ['TEXT_CONTENT'],
      'ARIA_CHANGED': ['ARIA_LABEL', 'ARIA_ROLE'],
      'DATA_TESTID_ADDED': ['DATA_TESTID'],
      'DATA_TESTID_REMOVED': ['DATA_TESTID'],
      'FRAMEWORK_MIGRATION': ['ID', 'CLASS', 'CSS_PATH', 'XPATH']
    };

    return mapping[mutationType] || [];
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // 📊 UPDATE STABILITY AFTER MUTATION
  // ═══════════════════════════════════════════════════════════════════════════════

  private updateStabilityAfterMutation(
    history: ElementEvolutionHistory,
    mutations: RecordedMutation[]
  ): void {
    for (const mutation of mutations) {
      for (const affectedType of mutation.affectedSelectors) {
        // Find selectors of this type and decrease their stability
        const entries = Array.from(history.selectorStability.entries());
        for (const [selectorValue, stability] of entries) {
          if (this.getSelectorType(selectorValue) === affectedType) {
            stability.factors.changeFrequency++;
            stability.factors.daysSinceLastChange = 0;
            stability.score = this.recalculateStabilityScore(stability);
            stability.lastUpdated = mutation.timestamp;
            stability.trend = this.calculateTrend(stability);
          }
        }
      }
    }
  }

  private getSelectorType(selector: string): SelectorType {
    if (selector.startsWith('#')) return 'ID';
    if (selector.includes('data-testid')) return 'DATA_TESTID';
    if (selector.includes('data-cy')) return 'DATA_CY';
    if (selector.includes('aria-label')) return 'ARIA_LABEL';
    if (selector.includes('role=')) return 'ARIA_ROLE';
    if (selector.includes('name=')) return 'NAME';
    if (selector.startsWith('.')) return 'CLASS';
    if (selector.includes('nth-child')) return 'NTH_CHILD';
    if (selector.startsWith('text=')) return 'TEXT_CONTENT';
    if (selector.includes('>')) return 'CSS_PATH';
    return 'XPATH';
  }

  private recalculateStabilityScore(stability: any): number {
    const factors = stability.factors;

    const changePenalty = Math.max(0, 1 - (factors.changeFrequency * 0.15));
    const recencyPenalty = factors.daysSinceLastChange < 7 ? 0.8 : 1.0;
    const successBonus = factors.successCount / Math.max(1, factors.successCount + factors.failureCount);

    return Math.max(0.1, Math.min(1,
      factors.typeBaseScore * 0.4 +
      changePenalty * 0.3 +
      recencyPenalty * 0.15 +
      successBonus * 0.15
    ));
  }

  private calculateTrend(stability: any): 'IMPROVING' | 'STABLE' | 'DEGRADING' | 'VOLATILE' {
    const recent = stability.factors.daysSinceLastChange;
    const changes = stability.factors.changeFrequency;

    if (changes > 5 && recent < 7) return 'VOLATILE';
    if (changes > 3 && recent < 14) return 'DEGRADING';
    if (recent > 30 && changes < 2) return 'IMPROVING';
    return 'STABLE';
  }

  private updateSelectorStabilityScore(
    history: ElementEvolutionHistory,
    selector: SelectorDNA
  ): void {
    let stability = history.selectorStability.get(selector.value);

    if (!stability) {
      stability = {
        selector: selector.value,
        selectorType: selector.type,
        score: selector.stability,
        confidence: 0.5,
        factors: {
          changeFrequency: 0,
          daysSinceLastChange: 0,
          typeBaseScore: SELECTOR_TYPE_BASE_SCORES[selector.type],
          successCount: 1,
          failureCount: 0,
          domainAdjustment: 0,
          peerInfluence: 0
        },
        trend: 'STABLE',
        lastUpdated: Date.now()
      };
      history.selectorStability.set(selector.value, stability);
    } else {
      stability.factors.successCount++;
      stability.factors.daysSinceLastChange = Math.floor(
        (Date.now() - stability.lastUpdated) / (1000 * 60 * 60 * 24)
      );
      stability.confidence = Math.min(1, stability.confidence + 0.01);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // 🔧 UTILITY METHODS
  // ═══════════════════════════════════════════════════════════════════════════════

  private generateTrackingId(elementData: any): string {
    // Create stable ID from element characteristics
    const signature = [
      elementData.structure?.tagName || '',
      elementData.attributes?.id || '',
      elementData.attributes?.name || '',
      elementData.attributes?.dataAttributes?.['data-testid'] || '',
      elementData.structure?.path || ''
    ].join('|');

    return createHash('md5').update(signature).digest('hex').slice(0, 16);
  }

  private hashContent(content: string): string {
    return createHash('md5').update(content || '').digest('hex').slice(0, 8);
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // 💾 PERSISTENCE
  // ═══════════════════════════════════════════════════════════════════════════════

  private loadKnowledge(): PredictionKnowledge {
    try {
      const fs = require('fs');
      if (fs.existsSync(this.knowledgePath)) {
        const data = JSON.parse(fs.readFileSync(this.knowledgePath, 'utf-8'));
        // Convert Maps from JSON
        data.elements = new Map(Object.entries(data.elements || {}));
        data.domainPatterns = new Map(Object.entries(data.domainPatterns || {}));

        for (const [, history] of data.elements) {
          (history as any).selectorStability = new Map(
            Object.entries((history as any).selectorStability || {})
          );
        }

        return data;
      }
    } catch (error) {
      console.warn('⚠️ Could not load prediction knowledge, starting fresh');
    }

    return {
      version: '1.0.0',
      lastUpdated: Date.now(),
      elements: new Map(),
      domainPatterns: new Map(),
      globalHeuristics: {
        selectorTypeRankings: new Map(Object.entries(SELECTOR_TYPE_BASE_SCORES) as [SelectorType, number][]),
        mutationProbabilities: new Map(),
        recoveryStrategies: new Map()
      },
      temporalPatterns: []
    };
  }

  saveKnowledge(): void {
    try {
      const fs = require('fs');
      const path = require('path');

      // Ensure directory exists
      const dir = path.dirname(this.knowledgePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Convert Maps to objects for JSON
      const data = {
        version: this.knowledge.version,
        lastUpdated: Date.now(),
        elements: Object.fromEntries(
          Array.from(this.knowledge.elements.entries()).map(([k, v]) => [
            k,
            {
              ...v,
              selectorStability: Object.fromEntries(v.selectorStability)
            }
          ])
        ),
        domainPatterns: Object.fromEntries(this.knowledge.domainPatterns),
        globalHeuristics: {
          selectorTypeRankings: Object.fromEntries(this.knowledge.globalHeuristics.selectorTypeRankings),
          mutationProbabilities: Object.fromEntries(this.knowledge.globalHeuristics.mutationProbabilities),
          recoveryStrategies: Object.fromEntries(this.knowledge.globalHeuristics.recoveryStrategies)
        },
        temporalPatterns: this.knowledge.temporalPatterns
      };

      fs.writeFileSync(this.knowledgePath, JSON.stringify(data, null, 2));
      this.dirty = false;

      console.log('💾 Prediction knowledge saved');
    } catch (error) {
      console.error('❌ Failed to save prediction knowledge:', error);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // 📊 PUBLIC API
  // ═══════════════════════════════════════════════════════════════════════════════

  getElementHistory(trackingId: string): ElementEvolutionHistory | undefined {
    return this.knowledge.elements.get(trackingId);
  }

  getAllElements(): Map<string, ElementEvolutionHistory> {
    return this.knowledge.elements;
  }

  getKnowledge(): PredictionKnowledge {
    return this.knowledge;
  }

  recordSuccess(selector: string, elementTrackingId: string): void {
    const history = this.knowledge.elements.get(elementTrackingId);
    if (history) {
      const stability = history.selectorStability.get(selector);
      if (stability) {
        stability.factors.successCount++;
        this.dirty = true;
      }
    }
  }

  recordFailure(selector: string, elementTrackingId: string): void {
    const history = this.knowledge.elements.get(elementTrackingId);
    if (history) {
      const stability = history.selectorStability.get(selector);
      if (stability) {
        stability.factors.failureCount++;
        stability.score = this.recalculateStabilityScore(stability);
        this.dirty = true;
      }
    }
  }

  /**
   * Get history for a specific element
   */
  getHistory(trackingId: string): ElementEvolutionHistory | undefined {
    return this.knowledge.elements.get(trackingId);
  }

  /**
   * Record a mutation for an element
   */
  recordMutation(trackingId: string, mutation: Omit<RecordedMutation, 'recoverySelector'>): void {
    const history = this.knowledge.elements.get(trackingId);
    if (history) {
      history.mutations.push(mutation as RecordedMutation);
      this.updateStabilityAfterMutation(history, [mutation as RecordedMutation]);
      this.dirty = true;
      this.emit('mutationRecorded', { trackingId, mutation });
    }
  }

  /**
   * Update selector stability based on usage outcome
   */
  updateSelectorStability(trackingId: string, selectorValue: string, success: boolean): void {
    const history = this.knowledge.elements.get(trackingId);
    if (history) {
      const stability = history.selectorStability.get(selectorValue);
      if (stability) {
        if (success) {
          stability.factors.successCount++;
        } else {
          stability.factors.failureCount++;
        }
        stability.score = this.recalculateStabilityScore(stability);
        stability.lastUpdated = Date.now();
        this.dirty = true;
      }
    }
  }

  /**
   * Get statistics about the evolution tracker
   */
  getStatistics(): {
    trackedElements: number;
    totalMutations: number;
    averageStability: number;
  } {
    let totalMutations = 0;
    let totalStability = 0;
    let stabilityCount = 0;

    const elements = Array.from(this.knowledge.elements.values());
    for (const history of elements) {
      totalMutations += history.mutations.length;
      const stabilities = Array.from(history.selectorStability.values());
      for (const stability of stabilities) {
        totalStability += stability.score;
        stabilityCount++;
      }
    }

    return {
      trackedElements: this.knowledge.elements.size,
      totalMutations,
      averageStability: stabilityCount > 0 ? totalStability / stabilityCount : 0
    };
  }

  /**
   * Force save to disk
   */
  async save(): Promise<void> {
    this.saveKnowledge();
  }

  /**
   * Cleanup on shutdown
   */
  dispose(): void {
    if (this.saveDebounceTimer) {
      clearTimeout(this.saveDebounceTimer);
    }
    this.saveKnowledge();
  }
}

// Export singleton
export const domEvolutionTracker = new DOMEvolutionTracker();
