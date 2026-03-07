/**
 * DOM Optimizer - Cost-Effective AI Context Preparation
 *
 * Minifies DOM snapshots for GPT-4o context window efficiency.
 * Strips noise, keeps semantic structure for selector healing.
 *
 * @author Димитър Продромов
 * @copyright 2026 QAntum. All Rights Reserved.
 */

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface DOMOptimizerConfig {
  maxSizeKB?: number;           // Target output size (default: 15KB)
  preserveIds?: boolean;        // Keep id attributes (default: true)
  preserveClasses?: boolean;    // Keep class attributes (default: true)
  preserveDataAttrs?: boolean;  // Keep data-* attributes (default: true)
  preserveAria?: boolean;       // Keep aria-* attributes (default: true)
  preserveTestAttrs?: boolean;  // Keep data-testid, data-cy, etc. (default: true)
  focusDepth?: number;          // Depth around target element (default: 3)
  interactiveOnly?: boolean;    // Keep only interactive elements (default: false)
}

export interface OptimizedDOM {
  html: string;
  originalSize: number;
  optimizedSize: number;
  compressionRatio: number;
  elementCount: number;
  truncated: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

/** Elements to completely strip from DOM */
const STRIP_ELEMENTS = new Set([
  'script',
  'style',
  'link',
  'meta',
  'noscript',
  'iframe',
  'embed',
  'object',
  'svg',      // Unless interactive
  'canvas',
  'video',
  'audio',
  'source',
  'track',
  'map',
  'area',
  'picture',
  'template',
]);

/** Interactive elements to always preserve */
const INTERACTIVE_ELEMENTS = new Set([
  'a',
  'button',
  'input',
  'select',
  'textarea',
  'label',
  'form',
  'fieldset',
  'option',
  'optgroup',
  'datalist',
  'output',
  'details',
  'summary',
  'dialog',
  'menu',
  'menuitem',
]);

/** Semantic elements to preserve for context */
const SEMANTIC_ELEMENTS = new Set([
  'main',
  'header',
  'footer',
  'nav',
  'article',
  'section',
  'aside',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'p',
  'ul', 'ol', 'li',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'div',  // Common container
  'span', // Common inline
]);

/** Attributes to strip (bloat) */
const STRIP_ATTRIBUTES = new Set([
  'style',
  'onclick', 'onload', 'onerror', 'onchange', 'onsubmit', 'onfocus', 'onblur',
  'onmouseover', 'onmouseout', 'onmousedown', 'onmouseup', 'onkeydown', 'onkeyup',
  'srcset',
  'sizes',
  'integrity',
  'crossorigin',
  'loading',
  'decoding',
  'fetchpriority',
  'referrerpolicy',
  'xmlns',
  'viewBox', // SVG
  'd',       // SVG path
  'points',  // SVG
  'transform',
  'fill',
  'stroke',
]);

/** Test automation attributes to always keep */
const TEST_ATTRIBUTES = [
  'data-testid',
  'data-test-id',
  'data-test',
  'data-cy',
  'data-qa',
  'data-automation',
  'data-e2e',
];

// ═══════════════════════════════════════════════════════════════════════════════
// DOM OPTIMIZER
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Optimize DOM for AI context window
 */
export function optimizeDOM(
  html: string,
  targetSelector?: string,
  config: DOMOptimizerConfig = {}
): OptimizedDOM {
  const {
    maxSizeKB = 15,
    preserveIds = true,
    preserveClasses = true,
    preserveDataAttrs = true,
    preserveAria = true,
    preserveTestAttrs = true,
    focusDepth = 3,
    interactiveOnly = false,
  } = config;

  const originalSize = Buffer.byteLength(html, 'utf-8');

  // Quick regex-based optimization (no DOM parser dependency)
  let optimized = html;

  // 1. Strip comments
  optimized = optimized.replace(/<!--[\s\S]*?-->/g, '');

  // 2. Strip script/style tags and content
  for (const tag of STRIP_ELEMENTS) {
    const regex = new RegExp(`<${tag}[^>]*>[\\s\\S]*?<\\/${tag}>`, 'gi');
    optimized = optimized.replace(regex, '');
    // Also strip self-closing
    const selfClosing = new RegExp(`<${tag}[^>]*\\/?>`, 'gi');
    optimized = optimized.replace(selfClosing, '');
  }

  // 3. Strip unwanted attributes
  for (const attr of STRIP_ATTRIBUTES) {
    // Handle quoted attributes
    const doubleQuote = new RegExp(`\\s${attr}="[^"]*"`, 'gi');
    const singleQuote = new RegExp(`\\s${attr}='[^']*'`, 'gi');
    const noQuote = new RegExp(`\\s${attr}=\\S+`, 'gi');
    optimized = optimized.replace(doubleQuote, '');
    optimized = optimized.replace(singleQuote, '');
    optimized = optimized.replace(noQuote, '');
  }

  // 4. Strip inline styles if not needed
  if (!config.preserveClasses) {
    optimized = optimized.replace(/\sclass="[^"]*"/gi, '');
    optimized = optimized.replace(/\sclass='[^']*'/gi, '');
  }

  // 5. Collapse whitespace
  optimized = optimized.replace(/\s+/g, ' ');
  optimized = optimized.replace(/>\s+</g, '><');

  // 6. Remove empty elements (except self-closing)
  optimized = optimized.replace(/<(\w+)[^>]*>\s*<\/\1>/gi, '');

  // 7. Truncate if still too large
  const maxBytes = maxSizeKB * 1024;
  const optimizedSize = Buffer.byteLength(optimized, 'utf-8');
  let truncated = false;

  if (optimizedSize > maxBytes) {
    // Find focus area if selector provided
    if (targetSelector) {
      optimized = extractFocusArea(optimized, targetSelector, focusDepth, maxBytes);
    } else {
      // Simple truncation with closing tags
      optimized = smartTruncate(optimized, maxBytes);
    }
    truncated = true;
  }

  const finalSize = Buffer.byteLength(optimized, 'utf-8');
  const elementCount = (optimized.match(/<[a-z]/gi) || []).length;

  return {
    html: optimized,
    originalSize,
    optimizedSize: finalSize,
    compressionRatio: Math.round((1 - finalSize / originalSize) * 100),
    elementCount,
    truncated,
  };
}

/**
 * Extract DOM area around target selector
 */
function extractFocusArea(html: string, selector: string, depth: number, maxBytes: number): string {
  // Convert selector to regex pattern
  const pattern = selectorToPattern(selector);
  const match = html.match(pattern);

  if (!match || match.index === undefined) {
    // Selector not found, return head + truncated body
    return smartTruncate(html, maxBytes);
  }

  // Find surrounding context
  const matchIndex = match.index;
  const contextStart = Math.max(0, html.lastIndexOf('<', matchIndex - 500) || matchIndex - 500);
  const contextEnd = Math.min(html.length, html.indexOf('>', matchIndex + match[0].length + 500) + 1 || matchIndex + 1000);

  let focused = html.substring(contextStart, contextEnd);

  // Add context markers
  if (contextStart > 0) {
    focused = '<!-- ... preceding DOM truncated ... -->' + focused;
  }
  if (contextEnd < html.length) {
    focused = focused + '<!-- ... following DOM truncated ... -->';
  }

  return focused;
}

/**
 * Convert CSS selector to regex pattern
 */
function selectorToPattern(selector: string): RegExp {
  // Handle common selector patterns
  if (selector.startsWith('#')) {
    const id = selector.slice(1).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`<[^>]+id=["']${id}["'][^>]*>`, 'i');
  }

  if (selector.startsWith('.')) {
    const className = selector.slice(1).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`<[^>]+class=["'][^"']*${className}[^"']*["'][^>]*>`, 'i');
  }

  if (selector.startsWith('[data-')) {
    const attrMatch = selector.match(/\[([^=\]]+)(?:=["']?([^"'\]]+)["']?)?\]/);
    if (attrMatch) {
      const attr = attrMatch[1].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const value = attrMatch[2]?.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (value) {
        return new RegExp(`<[^>]+${attr}=["']${value}["'][^>]*>`, 'i');
      }
      return new RegExp(`<[^>]+${attr}[^>]*>`, 'i');
    }
  }

  // Tag selector
  const tag = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`<${tag}[^>]*>`, 'i');
}

/**
 * Smart truncation that preserves valid HTML structure
 */
function smartTruncate(html: string, maxBytes: number): string {
  if (Buffer.byteLength(html, 'utf-8') <= maxBytes) {
    return html;
  }

  // Find last complete tag before limit
  let truncated = html.slice(0, maxBytes);
  const lastTagClose = truncated.lastIndexOf('>');

  if (lastTagClose > 0) {
    truncated = truncated.slice(0, lastTagClose + 1);
  }

  // Add truncation marker
  truncated += '\n<!-- DOM truncated for AI context efficiency -->';

  return truncated;
}

/**
 * Extract text content only (for simpler analysis)
 */
export function extractTextContent(html: string): string {
  // Strip all tags
  let text = html.replace(/<[^>]+>/g, ' ');
  // Decode common entities
  text = text.replace(/&nbsp;/g, ' ')
             .replace(/&amp;/g, '&')
             .replace(/&lt;/g, '<')
             .replace(/&gt;/g, '>')
             .replace(/&quot;/g, '"')
             .replace(/&#39;/g, "'");
  // Collapse whitespace
  text = text.replace(/\s+/g, ' ').trim();

  return text;
}

/**
 * Extract just the interactive elements (buttons, links, inputs)
 */
export function extractInteractiveElements(html: string): string {
  const elements: string[] = [];

  for (const tag of INTERACTIVE_ELEMENTS) {
    const regex = new RegExp(`<${tag}[^>]*(?:>[\\s\\S]*?<\\/${tag}>|\\/>)`, 'gi');
    const matches = html.match(regex) || [];
    elements.push(...matches);
  }

  return elements.join('\n');
}

/**
 * Build selector suggestions from DOM snippet
 */
export function suggestSelectors(html: string): string[] {
  const selectors: string[] = [];

  // Extract data-testid
  const testIds = html.match(/data-testid=["']([^"']+)["']/gi);
  if (testIds) {
    for (const match of testIds) {
      const value = match.match(/["']([^"']+)["']/)?.[1];
      if (value) selectors.push(`[data-testid="${value}"]`);
    }
  }

  // Extract IDs
  const ids = html.match(/\sid=["']([^"']+)["']/gi);
  if (ids) {
    for (const match of ids) {
      const value = match.match(/["']([^"']+)["']/)?.[1];
      if (value && !value.includes(' ')) selectors.push(`#${value}`);
    }
  }

  // Extract unique classes (common component patterns)
  const classes = html.match(/class=["']([^"']+)["']/gi);
  if (classes) {
    for (const match of classes) {
      const value = match.match(/["']([^"']+)["']/)?.[1];
      if (value) {
        const parts = value.split(/\s+/);
        for (const cls of parts) {
          // Keep semantic class names
          if (cls.match(/^(btn|button|input|form|header|footer|nav|menu|modal|dialog|card|list|item|link)/i)) {
            selectors.push(`.${cls}`);
          }
        }
      }
    }
  }

  // Dedupe and limit
  return [...new Set(selectors)].slice(0, 20);
}
