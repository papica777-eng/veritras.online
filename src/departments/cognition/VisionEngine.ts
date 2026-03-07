/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║           VISION ENGINE - ОЧИТЕ НА БОТА                                     ║
 * ║                                                                               ║
 * ║   Visual AI чрез Ollama multimodal модели (llava, moondream, bakllava).       ║
 * ║   Когато DOM-ът е сляп, ботът "вижда" екрана.                                ║
 * ║                                                                               ║
 * ║   Pipeline:                                                                   ║
 * ║   1. Screenshot (page.screenshot → base64)                                   ║
 * ║   2. Ollama Vision (llava/moondream → описание + координати)                 ║
 * ║   3. BezierMouse (координати → human-like клик)                              ║
 * ║                                                                               ║
 * ║   Use Cases:                                                                  ║
 * ║   • Canvas-based UI (цени/бутони без DOM елемент)                            ║
 * ║   • CAPTCHA solving (image classification → click)                           ║
 * ║   • Visual element location when selectors fail                              ║
 * ║   • Page understanding ("какво виждам на тази страница?")                    ║
 * ║                                                                               ║
 * ║  Created: 2026-02-23 | QAntum Prime v28.3.0 - Phase 3: Autonomous Survival  ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

import { EventEmitter } from 'events';
import * as http from 'http';
import * as https from 'https';
import * as fs from 'fs';
import * as path from 'path';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface VisionConfig {
  /** Ollama base URL (default: http://127.0.0.1:11434) */
  ollamaURL: string;
  /** Vision model — llava (best), moondream (fastest), bakllava */
  model: string;
  /** Fallback model if primary fails */
  fallbackModel: string;
  /** Timeout for vision requests in ms (default: 60000) */
  timeout: number;
  /** Screenshot quality 0-100 (default: 80) */
  screenshotQuality: number;
  /** Max screenshot width for faster processing (default: 1280) */
  maxWidth: number;
  /** Save screenshots to disk for debugging (default: false) */
  debugScreenshots: boolean;
  /** Debug screenshot path */
  debugPath: string;
  /** Default language for responses */
  language: string;
  /** Enable vision cache — reuse coordinates when DOM hasn't changed (default: true) */
  enableCache: boolean;
  /** Cache TTL in ms — how long to trust cached coordinates (default: 10000) */
  cacheTTLMs: number;
  /** Max cache entries (default: 50) */
  maxCacheEntries: number;
  /** DOM change threshold 0-1 — if DOM similarity > this, use cache (default: 0.85) */
  domSimilarityThreshold: number;
  /** Enable debug recording on low confidence (default: false) */
  enableDebugRecording: boolean;
  /** Confidence threshold for debug recording (default: 0.4) */
  debugConfidenceThreshold: number;
}

export interface VisionQuery {
  /** What to find/analyze */
  prompt: string;
  /** Pre-captured screenshot as base64 (if not provided, will capture from page) */
  screenshot?: string;
  /** Playwright page (for auto-screenshot) */
  page?: any;
  /** Region to capture (crop before sending — faster processing) */
  region?: { x: number; y: number; width: number; height: number };
  /** Temperature for model (default: 0.1 for precision) */
  temperature?: number;
}

export interface VisionResult {
  /** Raw text answer from the model */
  answer: string;
  /** Detected coordinates (if applicable) */
  coordinates: Point[] | null;
  /** Detected elements description */
  elements: DetectedElement[];
  /** Confidence 0-1 */
  confidence: number;
  /** Model used */
  model: string;
  /** Processing time ms */
  latencyMs: number;
  /** Screenshot dimensions */
  screenshotSize: { width: number; height: number } | null;
}

export interface DetectedElement {
  description: string;
  type: 'button' | 'link' | 'input' | 'text' | 'image' | 'captcha' | 'price' | 'unknown';
  coordinates?: Point;
  boundingBox?: { x: number; y: number; width: number; height: number };
  confidence: number;
}

export interface Point {
  x: number;
  y: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PRE-BUILT PROMPTS
// ═══════════════════════════════════════════════════════════════════════════════

const VISION_PROMPTS = {
  findButton: (label: string) => `Look at this webpage screenshot. Find the button labeled "${label}" or similar. Return the EXACT pixel coordinates (x, y) of its center. Format: COORDINATES: x,y`,

  findElement: (desc: string) => `Look at this webpage screenshot. Find the element: "${desc}". Return its EXACT pixel coordinates (x, y). Format: COORDINATES: x,y`,

  readPrice: (product: string) => `Look at this screenshot. Find the price of "${product}". Return ONLY the numeric price value. Format: PRICE: $XX.XX`,

  describePage: () => `Describe what you see on this webpage screenshot. List all visible buttons, links, prices, forms, and important text. Be concise.`,

  solveCaptcha: () => `This is a CAPTCHA image. Describe what you see in detail. If it's a text CAPTCHA, read the text. If it's an image selection CAPTCHA, describe which images match the prompt. Be precise.`,

  findClickTarget: (action: string) => `I need to ${action} on this webpage. Find the exact element to click and return its pixel coordinates. Format: COORDINATES: x,y ELEMENT: description`,

  comparePages: () => `Describe the key differences between the visible elements. Focus on prices, availability, and call-to-action buttons.`,

  extractText: (region: string) => `Read all text visible in the ${region} area of this screenshot. Return it verbatim.`,
};

// ═══════════════════════════════════════════════════════════════════════════════
// VISION ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════════
// VISION CACHE ENTRY
// ═══════════════════════════════════════════════════════════════════════════════

interface VisionCacheEntry {
  /** The prompt that generated this result */
  prompt: string;
  /** DOM structure hash at time of query */
  domHash: string;
  /** The cached result */
  result: VisionResult;
  /** When this entry was created */
  createdAt: number;
  /** Page URL */
  url: string;
  /** Hit count */
  hits: number;
}

export class VisionEngine extends EventEmitter {
  private config: VisionConfig;
  private isAvailable: boolean = false;
  private cache: Map<string, VisionCacheEntry> = new Map();
  private stats = {
    queries: 0,
    successfulDetections: 0,
    failedDetections: 0,
    avgLatencyMs: 0,
    totalLatencyMs: 0,
    captchasSolved: 0,
    modelFallbacks: 0,
    cacheHits: 0,
    cacheMisses: 0,
    debugRecordings: 0,
  };

  constructor(config?: Partial<VisionConfig>) {
    super();
    this.config = {
      ollamaURL: config?.ollamaURL || process.env.OLLAMA_URL || 'http://127.0.0.1:11434',
      model: config?.model || process.env.VISION_MODEL || 'llava',
      fallbackModel: config?.fallbackModel || 'moondream',
      timeout: config?.timeout ?? 60_000,
      screenshotQuality: config?.screenshotQuality ?? 80,
      maxWidth: config?.maxWidth ?? 1280,
      debugScreenshots: config?.debugScreenshots ?? false,
      debugPath: config?.debugPath || path.resolve(__dirname, '../../.vision-debug'),
      language: config?.language ?? 'en',
      enableCache: config?.enableCache ?? true,
      cacheTTLMs: config?.cacheTTLMs ?? 10_000,
      maxCacheEntries: config?.maxCacheEntries ?? 50,
      domSimilarityThreshold: config?.domSimilarityThreshold ?? 0.85,
      enableDebugRecording: config?.enableDebugRecording ?? false,
      debugConfidenceThreshold: config?.debugConfidenceThreshold ?? 0.4,
    };

    console.log(`👁️ VisionEngine initialized — Model: ${this.config.model} @ ${this.config.ollamaURL} | Cache: ${this.config.enableCache ? 'ON' : 'OFF'}`);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Check if Ollama is running and vision model is available.
   */
  // Complexity: O(N) — linear iteration
  public async checkAvailability(): Promise<boolean> {
    try {
      const response = await this.ollamaGet('/api/tags');
      const data = JSON.parse(response);
      const models = (data.models || []).map((m: any) => m.name || m.model);

      const hasModel = models.some((m: string) =>
        m.includes(this.config.model) || m.startsWith(this.config.model)
      );
      const hasFallback = models.some((m: string) =>
        m.includes(this.config.fallbackModel) || m.startsWith(this.config.fallbackModel)
      );

      if (hasModel) {
        this.isAvailable = true;
        console.log(`   ✅ Vision model "${this.config.model}" available`);
      } else if (hasFallback) {
        this.config.model = this.config.fallbackModel;
        this.isAvailable = true;
        console.log(`   ⚠️ Primary model not found, using fallback: ${this.config.fallbackModel}`);
      } else {
        console.log(`   ⚠️ No vision model found. Install: ollama pull ${this.config.model}`);
        console.log(`      Available models: ${models.join(', ') || 'none'}`);
        this.isAvailable = false;
      }

      return this.isAvailable;
    } catch (err: any) {
      if (err.code === 'ECONNREFUSED') {
        console.log('   ⚠️ Ollama not running — install from https://ollama.com');
      } else {
        console.log(`   ⚠️ Vision check failed: ${err.message}`);
      }
      this.isAvailable = false;
      return false;
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CORE VISION API
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Ask the vision model a question about a screenshot.
   * This is the core method — all convenience methods delegate here.
   */
  // Complexity: O(1) — amortized
  public async query(q: VisionQuery): Promise<VisionResult> {
    const startTime = Date.now();
    this.stats.queries++;

    // ── CACHE CHECK ───────────────────────────────────────────────────
    if (this.config.enableCache && q.page) {
      // SAFETY: async operation — wrap in try-catch for production resilience
      const cached = await this.checkCache(q.page, q.prompt);
      if (cached) {
        this.stats.cacheHits++;
        cached.result.latencyMs = Date.now() - startTime; // Update latency to show it was fast
        this.emit('cache-hit', { prompt: q.prompt, entry: cached });
        return cached.result;
      }
      this.stats.cacheMisses++;
    }

    // Get screenshot
    let screenshot = q.screenshot;
    let screenshotSize: { width: number; height: number } | null = null;

    if (!screenshot && q.page) {
      // SAFETY: async operation — wrap in try-catch for production resilience
      const result = await this.captureScreenshot(q.page, q.region);
      screenshot = result.base64;
      screenshotSize = result.size;
    }

    if (!screenshot) {
      return this.emptyResult('No screenshot provided and no page available', startTime);
    }

    // Debug save
    if (this.config.debugScreenshots) {
      this.saveDebugScreenshot(screenshot);
    }

    // Try primary model, then fallback
    let answer: string;
    let model = this.config.model;

    try {
      answer = await this.ollamaVision(model, q.prompt, screenshot, q.temperature ?? 0.1);
    } catch (err: any) {
      this.stats.modelFallbacks++;
      console.log(`   ⚠️ ${model} failed: ${err.message}, trying ${this.config.fallbackModel}`);
      model = this.config.fallbackModel;
      try {
        answer = await this.ollamaVision(model, q.prompt, screenshot, q.temperature ?? 0.1);
      } catch (err2: any) {
        this.stats.failedDetections++;
        return this.emptyResult(`Both models failed: ${err2.message}`, startTime);
      }
    }

    // Parse the response
    const coordinates = this.extractCoordinates(answer);
    const elements = this.extractElements(answer);
    const confidence = this.estimateConfidence(answer, coordinates, elements);

    if (coordinates || elements.length > 0) {
      this.stats.successfulDetections++;
    } else {
      this.stats.failedDetections++;
    }

    const latency = Date.now() - startTime;
    this.stats.totalLatencyMs += latency;
    this.stats.avgLatencyMs = this.stats.totalLatencyMs / this.stats.queries;

    const result: VisionResult = {
      answer,
      coordinates,
      elements,
      confidence,
      model,
      latencyMs: latency,
      screenshotSize,
    };

    this.emit('vision-result', result);

    // ── CACHE STORE ───────────────────────────────────────────────────
    if (this.config.enableCache && q.page && result.confidence > 0.3) {
      // SAFETY: async operation — wrap in try-catch for production resilience
      await this.storeInCache(q.page, q.prompt, result);
    }

    // ── DEBUG RECORDING on low confidence ─────────────────────────────
    if (this.config.enableDebugRecording && result.confidence < this.config.debugConfidenceThreshold && q.page) {
      this.stats.debugRecordings++;
      this.emit('low-confidence', { confidence: result.confidence, prompt: q.prompt, answer: result.answer });
      this.saveDebugScreenshot(screenshot || '');
      console.log(`   👁️ ⚠️ LOW CONFIDENCE (${(result.confidence * 100).toFixed(0)}%) on "${q.prompt.slice(0, 60)}" — debug screenshot saved`);
    }

    return result;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // VISION CACHE — DOM hash comparison to avoid redundant Ollama calls
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Generate a structural hash of the visible DOM.
   * Uses tag counts, text length, and element count — NOT full HTML.
   * This is fast and detects meaningful layout changes.
   */
  // Complexity: O(1) — hash/map lookup
  private async getDOMHash(page: any): Promise<string> {
    try {
      const hash = await page.evaluate(() => {
        const body = document.body;
        if (!body) return 'empty';

        // Count key structural elements
        const counts = {
          buttons: document.querySelectorAll('button, [role="button"], input[type="submit"]').length,
          links: document.querySelectorAll('a[href]').length,
          inputs: document.querySelectorAll('input, textarea, select').length,
          images: document.querySelectorAll('img, canvas, svg').length,
          textLen: (body.innerText || '').length,
          childCount: body.querySelectorAll('*').length,
        };

        // Create a structural signature
        return `${counts.buttons}:${counts.links}:${counts.inputs}:${counts.images}:${Math.floor(counts.textLen / 100)}:${Math.floor(counts.childCount / 10)}`;
      });
      return hash;
    } catch {
      return `fallback_${Date.now()}`; // Unique hash on error = cache miss
    }
  }

  /**
   * Check if we have a valid cached result for this prompt + DOM state.
   */
  // Complexity: O(1) — hash/map lookup
  private async checkCache(page: any, prompt: string): Promise<VisionCacheEntry | null> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    const domHash = await this.getDOMHash(page);
    const cacheKey = `${prompt}__${domHash}`;
    const entry = this.cache.get(cacheKey);

    if (!entry) return null;

    // Check TTL
    if (Date.now() - entry.createdAt > this.config.cacheTTLMs) {
      this.cache.delete(cacheKey);
      return null;
    }

    entry.hits++;
    return entry;
  }

  /**
   * Store a vision result in cache, keyed by prompt + DOM hash.
   */
  // Complexity: O(N log N) — sort operation
  private async storeInCache(page: any, prompt: string, result: VisionResult): Promise<void> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    const domHash = await this.getDOMHash(page);
    const cacheKey = `${prompt}__${domHash}`;
    const url = (typeof page.url === 'function' ? page.url() : page.url) || 'unknown';

    // Evict oldest if full
    if (this.cache.size >= this.config.maxCacheEntries) {
      const oldest = [...this.cache.entries()].sort((a, b) => a[1].createdAt - b[1].createdAt)[0];
      if (oldest) this.cache.delete(oldest[0]);
    }

    this.cache.set(cacheKey, {
      prompt,
      domHash,
      result: { ...result }, // Shallow copy
      createdAt: Date.now(),
      url,
      hits: 0,
    });
  }

  /**
   * Clear the vision cache (e.g., after navigation).
   */
  // Complexity: O(1)
  public clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache stats.
   */
  // Complexity: O(1)
  public getCacheStats() {
    return {
      size: this.cache.size,
      hits: this.stats.cacheHits,
      misses: this.stats.cacheMisses,
      hitRate: (this.stats.cacheHits + this.stats.cacheMisses) > 0
        ? ((this.stats.cacheHits / (this.stats.cacheHits + this.stats.cacheMisses)) * 100).toFixed(1) + '%'
        : 'N/A',
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CONVENIENCE METHODS (Integration with NeuralConsensusBridge)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Find a button by visual appearance when DOM selectors fail.
   * Returns center coordinates for BezierMouse.
   */
  // Complexity: O(N) — potential recursive descent
  public async findButton(page: any, label: string): Promise<Point | null> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    const result = await this.query({
      prompt: VISION_PROMPTS.findButton(label),
      page,
    });

    return result.coordinates?.[0] || null;
  }

  /**
   * Find any visual element by description.
   */
  // Complexity: O(N) — potential recursive descent
  public async findElement(page: any, description: string): Promise<Point | null> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    const result = await this.query({
      prompt: VISION_PROMPTS.findElement(description),
      page,
    });

    return result.coordinates?.[0] || null;
  }

  /**
   * Read a price from visual content (Canvas, images, etc.)
   */
  // Complexity: O(1) — hash/map lookup
  public async readPrice(page: any, product: string): Promise<number | null> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    const result = await this.query({
      prompt: VISION_PROMPTS.readPrice(product),
      page,
    });

    const priceMatch = result.answer.match(/PRICE:\s*\$?([\d,.]+)/i)
      || result.answer.match(/\$?([\d]+[.,]\d{2})/);

    if (priceMatch) {
      return parseFloat(priceMatch[1].replace(',', ''));
    }
    return null;
  }

  /**
   * Describe the full page — used for SessionMemory context.
   */
  // Complexity: O(N) — potential recursive descent
  public async describePage(page: any): Promise<string> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    const result = await this.query({
      prompt: VISION_PROMPTS.describePage(),
      page,
      temperature: 0.3,
    });

    return result.answer;
  }

  /**
   * Attempt CAPTCHA solving via vision.
   */
  // Complexity: O(N)
  public async solveCaptcha(page: any, region?: VisionQuery['region']): Promise<VisionResult> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    const result = await this.query({
      prompt: VISION_PROMPTS.solveCaptcha(),
      page,
      region,
      temperature: 0.05, // Very low for precision
    });

    if (result.confidence > 0.5) {
      this.stats.captchasSolved++;
    }

    this.emit('captcha-attempt', { success: result.confidence > 0.5, answer: result.answer });
    return result;
  }

  /**
   * Navigate by vision — "click the element that does X".
   * Returns coordinates for BezierMouse.
   */
  // Complexity: O(N) — potential recursive descent
  public async findClickTarget(page: any, action: string): Promise<Point | null> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    const result = await this.query({
      prompt: VISION_PROMPTS.findClickTarget(action),
      page,
    });

    return result.coordinates?.[0] || null;
  }

  /**
   * Extract text from a specific region (OCR-like).
   */
  // Complexity: O(N) — potential recursive descent
  public async extractText(page: any, region: string): Promise<string> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    const result = await this.query({
      prompt: VISION_PROMPTS.extractText(region),
      page,
      temperature: 0.1,
    });

    return result.answer;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SCREENSHOT CAPTURE
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Capture a screenshot from Playwright page and convert to base64.
   */
  // Complexity: O(1) — amortized
  private async captureScreenshot(page: any, region?: VisionQuery['region']): Promise<{
    base64: string;
    size: { width: number; height: number };
  }> {
    const options: any = {
      type: 'jpeg',
      quality: this.config.screenshotQuality,
    };

    if (region) {
      options.clip = region;
    }

    // SAFETY: async operation — wrap in try-catch for production resilience
    const buffer: Buffer = await page.screenshot(options);

    // Get viewport size
    const viewport = page.viewportSize?.() || { width: 1280, height: 720 };

    return {
      base64: buffer.toString('base64'),
      size: region
        ? { width: region.width, height: region.height }
        : viewport,
    };
  }

  /**
   * Save debug screenshot to disk.
   */
  // Complexity: O(1)
  private saveDebugScreenshot(base64: string): void {
    try {
      if (!fs.existsSync(this.config.debugPath)) {
        fs.mkdirSync(this.config.debugPath, { recursive: true });
      }
      const filename = `vision_${Date.now()}.jpg`;
      fs.writeFileSync(
        path.join(this.config.debugPath, filename),
        Buffer.from(base64, 'base64')
      );
    } catch { /* ignore debug save failures */ }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // OLLAMA COMMUNICATION
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Send a vision query to Ollama with base64 image.
   */
  // Complexity: O(1) — hash/map lookup
  private ollamaVision(model: string, prompt: string, imageBase64: string, temperature: number): Promise<string> {
    const body = JSON.stringify({
      model,
      prompt,
      images: [imageBase64],
      stream: false,
      options: {
        temperature,
        num_predict: 512,
      },
    });

    return new Promise((resolve, reject) => {
      const url = new URL('/api/generate', this.config.ollamaURL);
      const isHttps = url.protocol === 'https:';
      const transport = isHttps ? https : http;

      const req = transport.request({
        hostname: url.hostname,
        port: url.port || (isHttps ? 443 : 11434),
        path: url.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
        },
        timeout: this.config.timeout,
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            if (parsed.response) {
              // Complexity: O(1)
              resolve(parsed.response);
            } else if (parsed.error) {
              // Complexity: O(1)
              reject(new Error(`Ollama: ${parsed.error}`));
            } else {
              // Complexity: O(1)
              reject(new Error('Invalid Ollama response'));
            }
          } catch (e) {
            // Complexity: O(1)
            reject(e);
          }
        });
      });

      req.on('error', reject);
      req.on('timeout', () => { req.destroy(); reject(new Error('Vision request timeout')); });
      req.write(body);
      req.end();
    });
  }

  /**
   * Simple GET to Ollama API.
   */
  // Complexity: O(1) — amortized
  private ollamaGet(path: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const url = new URL(path, this.config.ollamaURL);
      const isHttps = url.protocol === 'https:';
      const transport = isHttps ? https : http;

      const req = transport.request({
        hostname: url.hostname,
        port: url.port || (isHttps ? 443 : 11434),
        path: url.pathname,
        method: 'GET',
        timeout: 5_000,
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(data));
      });

      req.on('error', reject);
      req.on('timeout', () => { req.destroy(); reject(new Error('GET timeout')); });
      req.end();
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RESPONSE PARSING
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Extract pixel coordinates from vision model response.
   * Handles formats: "COORDINATES: 450,320" / "(450, 320)" / "x=450, y=320"
   */
  // Complexity: O(N*M) — nested iteration detected
  private extractCoordinates(text: string): Point[] | null {
    const coords: Point[] = [];

    // Pattern: COORDINATES: x,y
    const coordMatch = text.matchAll(/COORDINATES:\s*(\d+)\s*[,;]\s*(\d+)/gi);
    for (const m of coordMatch) {
      coords.push({ x: parseInt(m[1]), y: parseInt(m[2]) });
    }

    // Pattern: (x, y)
    if (coords.length === 0) {
      const parenMatch = text.matchAll(/\((\d{2,4})\s*,\s*(\d{2,4})\)/g);
      for (const m of parenMatch) {
        const x = parseInt(m[1]);
        const y = parseInt(m[2]);
        // Filter out unreasonable coordinates (e.g., years like 2026)
        if (x < 2000 && y < 2000) {
          coords.push({ x, y });
        }
      }
    }

    // Pattern: x=450, y=320
    if (coords.length === 0) {
      const xyMatch = text.matchAll(/x\s*[=:]\s*(\d+)\s*[,;]?\s*y\s*[=:]\s*(\d+)/gi);
      for (const m of xyMatch) {
        coords.push({ x: parseInt(m[1]), y: parseInt(m[2]) });
      }
    }

    return coords.length > 0 ? coords : null;
  }

  /**
   * Extract detected elements from model response.
   */
  // Complexity: O(N*M) — nested iteration detected
  private extractElements(text: string): DetectedElement[] {
    const elements: DetectedElement[] = [];
    const lower = text.toLowerCase();

    // Look for ELEMENT: descriptions
    const elemMatch = text.matchAll(/ELEMENT:\s*(.+?)(?:\n|$)/gi);
    for (const m of elemMatch) {
      elements.push({
        description: m[1].trim(),
        type: this.classifyElement(m[1]),
        confidence: 0.7,
      });
    }

    // Detect common element types from free text
    const types: Array<[string, DetectedElement['type'], RegExp]> = [
      ['button', 'button', /button\s+(?:labeled?|saying|with text)\s+["']?([^"'\n]+)/i],
      ['link', 'link', /link\s+(?:labeled?|saying|to)\s+["']?([^"'\n]+)/i],
      ['input', 'input', /input\s+(?:field|box)\s+(?:for|labeled?)\s+["']?([^"'\n]+)/i],
      ['captcha', 'captcha', /captcha|verification|robot|verify/i],
      ['price', 'price', /(?:price|cost|amount)[:\s]+\$?([\d,.]+)/i],
    ];

    for (const [, type, regex] of types) {
      const match = text.match(regex);
      if (match && !elements.some(e => e.type === type)) {
        elements.push({
          description: match[0],
          type,
          confidence: 0.6,
        });
      }
    }

    return elements;
  }

  /**
   * Classify element type from description.
   */
  // Complexity: O(1)
  private classifyElement(desc: string): DetectedElement['type'] {
    const lower = desc.toLowerCase();
    if (lower.includes('button') || lower.includes('btn') || lower.includes('click')) return 'button';
    if (lower.includes('link') || lower.includes('href') || lower.includes('url')) return 'link';
    if (lower.includes('input') || lower.includes('field') || lower.includes('text box')) return 'input';
    if (lower.includes('image') || lower.includes('img') || lower.includes('photo')) return 'image';
    if (lower.includes('captcha') || lower.includes('verify')) return 'captcha';
    if (lower.includes('price') || lower.includes('$') || lower.includes('cost')) return 'price';
    return 'unknown';
  }

  /**
   * Estimate confidence based on response quality.
   */
  // Complexity: O(1)
  private estimateConfidence(answer: string, coords: Point[] | null, elements: DetectedElement[]): number {
    let score = 0.3; // Base confidence

    // Has coordinates → higher confidence
    if (coords && coords.length > 0) score += 0.3;

    // Has element descriptions → higher
    if (elements.length > 0) score += 0.15;

    // Longer, more detailed answer → slightly higher
    if (answer.length > 100) score += 0.1;

    // Uses our expected format → higher
    if (answer.includes('COORDINATES:') || answer.includes('ELEMENT:')) score += 0.15;

    return Math.min(1, score);
  }

  /**
   * Empty result for errors.
   */
  // Complexity: O(1)
  private emptyResult(reason: string, startTime: number): VisionResult {
    return {
      answer: reason,
      coordinates: null,
      elements: [],
      confidence: 0,
      model: this.config.model,
      latencyMs: Date.now() - startTime,
      screenshotSize: null,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STATS & DIAGNOSTICS
  // ═══════════════════════════════════════════════════════════════════════════

  // Complexity: O(1)
  public getStats() {
    return {
      ...this.stats,
      isAvailable: this.isAvailable,
      model: this.config.model,
      successRate: this.stats.queries > 0
        ? (this.stats.successfulDetections / this.stats.queries * 100).toFixed(1) + '%'
        : 'N/A',
      cacheSize: this.cache.size,
      cacheHitRate: (this.stats.cacheHits + this.stats.cacheMisses) > 0
        ? ((this.stats.cacheHits / (this.stats.cacheHits + this.stats.cacheMisses)) * 100).toFixed(1) + '%'
        : 'N/A',
    };
  }

  // Complexity: O(1)
  public isReady(): boolean {
    return this.isAvailable;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SINGLETON
// ═══════════════════════════════════════════════════════════════════════════════

let visionInstance: VisionEngine | null = null;

export function getVisionEngine(config?: Partial<VisionConfig>): VisionEngine {
  if (!visionInstance) {
    visionInstance = new VisionEngine(config);
  }
  return visionInstance;
}

export default VisionEngine;
