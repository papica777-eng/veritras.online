"use strict";
// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║  CYBERCODY v25.0 - HOT-SWAP SELECTOR ENGINE                                  ║
// ║  "The Temporal Healer" - Visual Selector Recalculation During Runtime        ║
// ║  If site changes mid-test, recalculate selector visually without restart     ║
// ╚══════════════════════════════════════════════════════════════════════════════╝
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.HotSwapSelectorEngine = void 0;
const events_1 = require("events");
const fs_1 = require("fs");
// ═══════════════════════════════════════════════════════════════════════════════
// 🧠 HOT-SWAP SELECTOR ENGINE CLASS
// ═══════════════════════════════════════════════════════════════════════════════
class HotSwapSelectorEngine extends events_1.EventEmitter {
    config;
    browser = null;
    memory;
    activeObservers = new Map();
    swapHistory = [];
    geminiModel = null;
    constructor(config = {}) {
        super();
        this.config = {
            enableVisualMatching: config.enableVisualMatching ?? true,
            geminiApiKey: config.geminiApiKey ?? process.env['GEMINI_API_KEY'] ?? '',
            minSwapConfidence: config.minSwapConfidence ?? 70,
            enableMutationObserver: config.enableMutationObserver ?? true,
            verificationIntervalMs: config.verificationIntervalMs ?? 500,
            maxRecalculationAttempts: config.maxRecalculationAttempts ?? 5,
            screenshotDir: config.screenshotDir ?? './temporal-healer-screenshots',
            enableLearning: config.enableLearning ?? true,
            persistMemory: config.persistMemory ?? true,
            memoryFilePath: config.memoryFilePath ?? './selector-memory.json',
        };
        this.memory = {
            fingerprints: new Map(),
            mutations: [],
            successRates: new Map(),
            lastVerified: new Map(),
        };
        // Load persisted memory
        if (this.config.persistMemory) {
            this.loadMemory();
        }
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // 🚀 INITIALIZATION
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Initialize the engine
     */
    async initialize() {
        this.emit('info', '🧠 Initializing Hot-Swap Selector Engine...');
        // Ensure screenshot directory exists
        if (!(0, fs_1.existsSync)(this.config.screenshotDir)) {
            (0, fs_1.mkdirSync)(this.config.screenshotDir, { recursive: true });
        }
        // Initialize Gemini for visual matching
        if (this.config.enableVisualMatching && this.config.geminiApiKey) {
            try {
                const { GoogleGenerativeAI } = await Promise.resolve().then(() => __importStar(require('@google/generative-ai')));
                const genAI = new GoogleGenerativeAI(this.config.geminiApiKey);
                this.geminiModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
                this.emit('info', '   ✅ Gemini 2.0 Vision initialized for visual matching');
            }
            catch (error) {
                this.emit('warning', `   ⚠️ Gemini initialization failed: ${error}`);
            }
        }
        this.emit('info', '   ✅ Hot-Swap Selector Engine ready');
    }
    /**
     * Set browser instance
     */
    setBrowser(browser) {
        this.browser = browser;
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // 📸 SELECTOR FINGERPRINTING
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Capture fingerprint of an element
     */
    async captureFingerprint(page, selector) {
        try {
            const element = await page.$(selector);
            if (!element) {
                this.emit('warning', `Element not found for fingerprinting: ${selector}`);
                return null;
            }
            const fingerprint = await page.evaluate((sel) => {
                const el = document.querySelector(sel);
                if (!el)
                    return null;
                // Get computed CSS path
                const getCssPath = (element) => {
                    const path = [];
                    let current = element;
                    while (current && current.nodeType === Node.ELEMENT_NODE) {
                        let selector = current.tagName.toLowerCase();
                        if (current.id) {
                            selector += `#${current.id}`;
                            path.unshift(selector);
                            break;
                        }
                        else {
                            let sibling = current;
                            let nth = 1;
                            while (sibling = sibling.previousElementSibling) {
                                if (sibling.tagName === current.tagName)
                                    nth++;
                            }
                            if (nth > 1)
                                selector += `:nth-of-type(${nth})`;
                        }
                        path.unshift(selector);
                        current = current.parentElement;
                    }
                    return path.join(' > ');
                };
                // Get XPath
                const getXPath = (element) => {
                    const parts = [];
                    let current = element;
                    while (current && current.nodeType === Node.ELEMENT_NODE) {
                        let index = 0;
                        let sibling = current;
                        while (sibling = sibling.previousElementSibling) {
                            if (sibling.tagName === current.tagName)
                                index++;
                        }
                        const tagName = current.tagName.toLowerCase();
                        const part = index > 0 ? `${tagName}[${index + 1}]` : tagName;
                        parts.unshift(part);
                        current = current.parentElement;
                    }
                    return '/' + parts.join('/');
                };
                // Get parent chain
                const getParentChain = (element) => {
                    const chain = [];
                    let current = element.parentElement;
                    let depth = 0;
                    while (current && depth < 5) {
                        const desc = current.tagName.toLowerCase() +
                            (current.id ? `#${current.id}` : '') +
                            (current.className ? `.${current.className.split(' ')[0]}` : '');
                        chain.push(desc);
                        current = current.parentElement;
                        depth++;
                    }
                    return chain;
                };
                // Get sibling context
                const getSiblingContext = (element) => {
                    const parent = element.parentElement;
                    if (!parent)
                        return { index: 0, totalSiblings: 1 };
                    const siblings = Array.from(parent.children);
                    const index = siblings.indexOf(element);
                    return {
                        previousSibling: siblings[index - 1]?.tagName?.toLowerCase(),
                        nextSibling: siblings[index + 1]?.tagName?.toLowerCase(),
                        index,
                        totalSiblings: siblings.length,
                    };
                };
                // Get attributes
                const getAttributes = (element) => {
                    const attrs = {};
                    for (let i = 0; i < element.attributes.length; i++) {
                        const attr = element.attributes[i];
                        if (attr) {
                            attrs[attr.name] = attr.value;
                        }
                    }
                    return attrs;
                };
                // Get computed styles
                const style = window.getComputedStyle(el);
                // Get ARIA attributes
                const ariaAttrs = {};
                for (const attr of Array.from(el.attributes)) {
                    if (attr.name.startsWith('aria-')) {
                        ariaAttrs[attr.name] = attr.value;
                    }
                }
                // Get data attributes
                const dataAttrs = {};
                for (const attr of Array.from(el.attributes)) {
                    if (attr.name.startsWith('data-')) {
                        dataAttrs[attr.name] = attr.value;
                    }
                }
                const rect = el.getBoundingClientRect();
                return {
                    cssPath: getCssPath(el),
                    xpath: getXPath(el),
                    boundingBox: {
                        x: rect.x,
                        y: rect.y,
                        width: rect.width,
                        height: rect.height,
                    },
                    textContent: el.textContent?.substring(0, 200) ?? '',
                    tagName: el.tagName.toLowerCase(),
                    attributes: getAttributes(el),
                    parentChain: getParentChain(el),
                    siblingContext: getSiblingContext(el),
                    visualStyles: {
                        backgroundColor: style.backgroundColor,
                        color: style.color,
                        fontSize: style.fontSize,
                        fontFamily: style.fontFamily,
                        position: style.position,
                        display: style.display,
                    },
                    ariaAttributes: ariaAttrs,
                    dataAttributes: dataAttrs,
                };
            }, selector);
            if (!fingerprint)
                return null;
            // Generate visual hash
            const visualHash = this.generateVisualHash(fingerprint);
            const fullFingerprint = {
                originalSelector: selector,
                ...fingerprint,
                visualHash,
                capturedAt: new Date(),
            };
            // Store in memory
            this.memory.fingerprints.set(selector, fullFingerprint);
            this.memory.lastVerified.set(selector, new Date());
            this.emit('fingerprint', { selector, fingerprint: fullFingerprint });
            return fullFingerprint;
        }
        catch (error) {
            this.emit('error', `Fingerprint capture failed: ${error}`);
            return null;
        }
    }
    /**
     * Generate visual hash from fingerprint
     */
    generateVisualHash(fingerprint) {
        const hashInput = [
            fingerprint.tagName,
            fingerprint.textContent?.substring(0, 50),
            fingerprint.boundingBox?.width,
            fingerprint.boundingBox?.height,
            fingerprint.visualStyles?.backgroundColor,
            fingerprint.visualStyles?.color,
            fingerprint.visualStyles?.fontSize,
            JSON.stringify(fingerprint.ariaAttributes),
        ].join('|');
        // Simple hash function
        let hash = 0;
        for (let i = 0; i < hashInput.length; i++) {
            const char = hashInput.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(16);
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // 🔄 HOT-SWAP MECHANISM
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Verify element exists and hasn't mutated
     */
    async verifySelector(page, selector) {
        const storedFingerprint = this.memory.fingerprints.get(selector);
        if (!storedFingerprint) {
            return { valid: true }; // No baseline to compare
        }
        const element = await page.$(selector);
        if (!element) {
            // Element removed - try to find it
            return {
                valid: false,
                mutation: {
                    original: storedFingerprint,
                    mutated: storedFingerprint,
                    mutationType: 'removed',
                    confidence: 0,
                    recommendedSelector: '',
                    detectedAt: new Date(),
                },
            };
        }
        // Capture current fingerprint
        const currentFingerprint = await this.captureFingerprint(page, selector);
        if (!currentFingerprint) {
            return { valid: false };
        }
        // Compare fingerprints
        const mutation = this.detectMutation(storedFingerprint, currentFingerprint);
        if (mutation) {
            this.memory.mutations.push(mutation);
            this.emit('mutation', mutation);
            return { valid: false, mutation };
        }
        return { valid: true };
    }
    /**
     * Detect mutation between fingerprints
     */
    detectMutation(original, current) {
        const changes = [];
        let mutationType = 'attribute_change';
        // Check position change
        const positionDiff = Math.abs(original.boundingBox.x - current.boundingBox.x) +
            Math.abs(original.boundingBox.y - current.boundingBox.y);
        if (positionDiff > 50) {
            changes.push('position');
            mutationType = 'position_change';
        }
        // Check size change
        const sizeDiff = Math.abs(original.boundingBox.width - current.boundingBox.width) +
            Math.abs(original.boundingBox.height - current.boundingBox.height);
        if (sizeDiff > 20) {
            changes.push('size');
        }
        // Check text change
        if (original.textContent !== current.textContent) {
            changes.push('text');
            mutationType = 'text_change';
        }
        // Check style change
        if (JSON.stringify(original.visualStyles) !== JSON.stringify(current.visualStyles)) {
            changes.push('style');
            mutationType = 'style_change';
        }
        // Check parent change
        if (JSON.stringify(original.parentChain) !== JSON.stringify(current.parentChain)) {
            changes.push('parent');
            mutationType = 'parent_change';
        }
        // Check attribute change
        if (JSON.stringify(original.attributes) !== JSON.stringify(current.attributes)) {
            changes.push('attributes');
            mutationType = 'attribute_change';
        }
        if (changes.length === 0) {
            return null;
        }
        // Calculate confidence based on what's still the same
        let confidence = 100;
        if (changes.includes('position'))
            confidence -= 15;
        if (changes.includes('size'))
            confidence -= 10;
        if (changes.includes('text'))
            confidence -= 20;
        if (changes.includes('style'))
            confidence -= 10;
        if (changes.includes('parent'))
            confidence -= 30;
        if (changes.includes('attributes'))
            confidence -= 15;
        return {
            original,
            mutated: current,
            mutationType,
            confidence: Math.max(0, confidence),
            recommendedSelector: current.cssPath,
            detectedAt: new Date(),
        };
    }
    /**
     * Hot-swap selector if element changed
     */
    async hotSwap(page, selector) {
        const startTime = Date.now();
        this.emit('info', `🔄 Hot-swap check for: ${selector}`);
        // Verify current selector
        const verification = await this.verifySelector(page, selector);
        if (verification.valid) {
            return {
                success: true,
                originalSelector: selector,
                confidence: 100,
                recalculationTimeMs: Date.now() - startTime,
                strategyUsed: 'original_valid',
            };
        }
        // Need to recalculate
        const storedFingerprint = this.memory.fingerprints.get(selector);
        if (!storedFingerprint) {
            return {
                success: false,
                originalSelector: selector,
                confidence: 0,
                recalculationTimeMs: Date.now() - startTime,
                strategyUsed: 'no_baseline',
            };
        }
        // Try multiple strategies to find the element
        const strategies = [
            { name: 'css_path', fn: () => this.findByCssPath(page, storedFingerprint) },
            { name: 'xpath', fn: () => this.findByXpath(page, storedFingerprint) },
            { name: 'text_content', fn: () => this.findByTextContent(page, storedFingerprint) },
            { name: 'visual_similarity', fn: () => this.findByVisualSimilarity(page, storedFingerprint) },
            { name: 'aria_attributes', fn: () => this.findByAriaAttributes(page, storedFingerprint) },
            { name: 'data_attributes', fn: () => this.findByDataAttributes(page, storedFingerprint) },
            { name: 'parent_context', fn: () => this.findByParentContext(page, storedFingerprint) },
            { name: 'gemini_vision', fn: () => this.findByGeminiVision(page, storedFingerprint) },
        ];
        for (const strategy of strategies) {
            try {
                const result = await strategy.fn();
                if (result && result.confidence >= this.config.minSwapConfidence) {
                    // Update fingerprint
                    const newFingerprint = await this.captureFingerprint(page, result.selector);
                    if (newFingerprint) {
                        this.memory.fingerprints.set(selector, newFingerprint);
                    }
                    // Update success rate
                    const currentRate = this.memory.successRates.get(selector) ?? 100;
                    this.memory.successRates.set(selector, (currentRate + 100) / 2);
                    const swapResult = {
                        success: true,
                        originalSelector: selector,
                        newSelector: result.selector,
                        confidence: result.confidence,
                        mutation: verification.mutation,
                        recalculationTimeMs: Date.now() - startTime,
                        strategyUsed: strategy.name,
                    };
                    this.swapHistory.push(swapResult);
                    this.emit('swap', swapResult);
                    if (this.config.persistMemory) {
                        this.saveMemory();
                    }
                    return swapResult;
                }
            }
            catch (error) {
                this.emit('warning', `Strategy ${strategy.name} failed: ${error}`);
            }
        }
        // All strategies failed
        const currentRate = this.memory.successRates.get(selector) ?? 100;
        this.memory.successRates.set(selector, (currentRate + 0) / 2);
        const failResult = {
            success: false,
            originalSelector: selector,
            confidence: 0,
            mutation: verification.mutation,
            recalculationTimeMs: Date.now() - startTime,
            strategyUsed: 'all_failed',
        };
        this.swapHistory.push(failResult);
        return failResult;
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // 🔍 SELECTOR RECOVERY STRATEGIES
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Find element by CSS path
     */
    async findByCssPath(page, fingerprint) {
        const element = await page.$(fingerprint.cssPath);
        if (element) {
            return { selector: fingerprint.cssPath, confidence: 95 };
        }
        return null;
    }
    /**
     * Find element by XPath
     */
    async findByXpath(page, fingerprint) {
        const elements = await page.$$(`xpath=${fingerprint.xpath}`);
        if (elements.length === 1) {
            return { selector: `xpath=${fingerprint.xpath}`, confidence: 90 };
        }
        return null;
    }
    /**
     * Find element by text content
     */
    async findByTextContent(page, fingerprint) {
        if (!fingerprint.textContent || fingerprint.textContent.length < 3)
            return null;
        const text = fingerprint.textContent.trim().substring(0, 50);
        const selector = `${fingerprint.tagName}:has-text("${text.replace(/"/g, '\\"')}")`;
        try {
            const elements = await page.$$(selector);
            if (elements.length === 1) {
                return { selector, confidence: 85 };
            }
        }
        catch {
            // Selector syntax error
        }
        return null;
    }
    /**
     * Find element by visual similarity (position/size)
     */
    async findByVisualSimilarity(page, fingerprint) {
        const candidates = await page.$$eval(fingerprint.tagName, (elements, fp) => {
            return elements.map((el, index) => {
                const rect = el.getBoundingClientRect();
                const positionDiff = Math.abs(rect.x - fp.boundingBox.x) + Math.abs(rect.y - fp.boundingBox.y);
                const sizeDiff = Math.abs(rect.width - fp.boundingBox.width) + Math.abs(rect.height - fp.boundingBox.height);
                return {
                    index,
                    positionDiff,
                    sizeDiff,
                    totalDiff: positionDiff + sizeDiff,
                    id: el.id,
                    className: el.className,
                };
            }).filter(c => c.totalDiff < 100)
                .sort((a, b) => a.totalDiff - b.totalDiff);
        }, { boundingBox: fingerprint.boundingBox });
        if (candidates.length > 0) {
            const best = candidates[0];
            if (best) {
                let selector = fingerprint.tagName;
                if (best.id)
                    selector += `#${best.id}`;
                else if (best.className)
                    selector += `.${best.className.split(' ')[0]}`;
                else
                    selector += `:nth-of-type(${best.index + 1})`;
                const confidence = Math.max(50, 90 - best.totalDiff / 2);
                return { selector, confidence };
            }
        }
        return null;
    }
    /**
     * Find element by ARIA attributes
     */
    async findByAriaAttributes(page, fingerprint) {
        const ariaKeys = Object.keys(fingerprint.ariaAttributes);
        if (ariaKeys.length === 0)
            return null;
        for (const key of ariaKeys) {
            const value = fingerprint.ariaAttributes[key];
            const selector = `[${key}="${value}"]`;
            const elements = await page.$$(selector);
            if (elements.length === 1) {
                return { selector, confidence: 88 };
            }
        }
        return null;
    }
    /**
     * Find element by data attributes
     */
    async findByDataAttributes(page, fingerprint) {
        const dataKeys = Object.keys(fingerprint.dataAttributes);
        if (dataKeys.length === 0)
            return null;
        // Try data-testid first
        if (fingerprint.dataAttributes['data-testid']) {
            const selector = `[data-testid="${fingerprint.dataAttributes['data-testid']}"]`;
            const elements = await page.$$(selector);
            if (elements.length === 1) {
                return { selector, confidence: 95 };
            }
        }
        // Try other data attributes
        for (const key of dataKeys) {
            const value = fingerprint.dataAttributes[key];
            const selector = `[${key}="${value}"]`;
            const elements = await page.$$(selector);
            if (elements.length === 1) {
                return { selector, confidence: 85 };
            }
        }
        return null;
    }
    /**
     * Find element by parent context
     */
    async findByParentContext(page, fingerprint) {
        if (fingerprint.parentChain.length === 0)
            return null;
        // Build selector from parent chain
        const firstParent = fingerprint.parentChain[0];
        if (!firstParent)
            return null;
        const parentSelector = firstParent.split('.')[0]?.split('#')[0] ?? fingerprint.tagName;
        const selector = `${parentSelector} ${fingerprint.tagName}:nth-child(${fingerprint.siblingContext.index + 1})`;
        try {
            const elements = await page.$$(selector);
            if (elements.length === 1) {
                return { selector, confidence: 75 };
            }
        }
        catch {
            // Invalid selector
        }
        return null;
    }
    /**
     * Find element by Gemini Vision AI
     */
    async findByGeminiVision(page, fingerprint) {
        if (!this.geminiModel || !this.config.enableVisualMatching)
            return null;
        try {
            // Take screenshot
            const screenshot = await page.screenshot({ type: 'png' });
            const base64 = screenshot.toString('base64');
            const prompt = `Analyze this webpage screenshot and find an element that matches this description:
- Tag: ${fingerprint.tagName}
- Text content: "${fingerprint.textContent.substring(0, 100)}"
- Approximate position: x=${fingerprint.boundingBox.x}, y=${fingerprint.boundingBox.y}
- Size: ${fingerprint.boundingBox.width}x${fingerprint.boundingBox.height}
- Background color: ${fingerprint.visualStyles.backgroundColor}
- Text color: ${fingerprint.visualStyles.color}

Return ONLY a CSS selector that would uniquely identify this element. If you cannot find it, return "NOT_FOUND".`;
            const model = this.geminiModel;
            const result = await model.generateContent({
                contents: [{
                        role: 'user',
                        parts: [
                            { text: prompt },
                            { inlineData: { mimeType: 'image/png', data: base64 } },
                        ],
                    }],
            });
            const suggestedSelector = result.response.text().trim();
            if (suggestedSelector && suggestedSelector !== 'NOT_FOUND') {
                const elements = await page.$$(suggestedSelector);
                if (elements.length === 1) {
                    return { selector: suggestedSelector, confidence: 80 };
                }
            }
        }
        catch (error) {
            this.emit('warning', `Gemini Vision analysis failed: ${error}`);
        }
        return null;
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // 📊 MUTATION OBSERVER
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Start observing mutations on a page
     */
    async startMutationObserver(page, selectors) {
        if (!this.config.enableMutationObserver)
            return;
        // Capture initial fingerprints
        for (const selector of selectors) {
            await this.captureFingerprint(page, selector);
            this.activeObservers.set(selector, true);
        }
        // Set up periodic verification
        const verifyLoop = async () => {
            for (const selector of selectors) {
                if (!this.activeObservers.get(selector))
                    continue;
                const verification = await this.verifySelector(page, selector);
                if (!verification.valid && verification.mutation) {
                    // Try hot-swap
                    const swapResult = await this.hotSwap(page, selector);
                    if (!swapResult.success) {
                        this.emit('swap_failed', { selector, mutation: verification.mutation });
                    }
                }
            }
        };
        // Run verification loop
        const interval = setInterval(verifyLoop, this.config.verificationIntervalMs);
        // Clean up on page close
        page.on('close', () => {
            clearInterval(interval);
            selectors.forEach(s => this.activeObservers.set(s, false));
        });
    }
    /**
     * Stop observing a selector
     */
    stopObserving(selector) {
        this.activeObservers.set(selector, false);
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // 💾 MEMORY PERSISTENCE
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Save memory to disk
     */
    saveMemory() {
        try {
            const data = {
                fingerprints: Array.from(this.memory.fingerprints.entries()),
                mutations: this.memory.mutations.slice(-100), // Keep last 100
                successRates: Array.from(this.memory.successRates.entries()),
                lastVerified: Array.from(this.memory.lastVerified.entries()).map(([k, v]) => [k, v.toISOString()]),
            };
            (0, fs_1.writeFileSync)(this.config.memoryFilePath, JSON.stringify(data, null, 2));
        }
        catch (error) {
            this.emit('warning', `Failed to save memory: ${error}`);
        }
    }
    /**
     * Load memory from disk
     */
    loadMemory() {
        try {
            if ((0, fs_1.existsSync)(this.config.memoryFilePath)) {
                const data = JSON.parse((0, fs_1.readFileSync)(this.config.memoryFilePath, 'utf-8'));
                this.memory.fingerprints = new Map(data.fingerprints);
                this.memory.mutations = data.mutations || [];
                this.memory.successRates = new Map(data.successRates);
                this.memory.lastVerified = new Map((data.lastVerified || []).map(([k, v]) => [k, new Date(v)]));
                this.emit('info', `   📂 Loaded ${this.memory.fingerprints.size} selector fingerprints from memory`);
            }
        }
        catch (error) {
            this.emit('warning', `Failed to load memory: ${error}`);
        }
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // 📊 REPORTING
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Generate hot-swap report
     */
    generateReport() {
        const successfulSwaps = this.swapHistory.filter(s => s.success).length;
        const failedSwaps = this.swapHistory.filter(s => !s.success).length;
        // Find problematic selectors
        const selectorStats = new Map();
        for (const swap of this.swapHistory) {
            const stats = selectorStats.get(swap.originalSelector) || { mutations: 0, successes: 0 };
            stats.mutations++;
            if (swap.success)
                stats.successes++;
            selectorStats.set(swap.originalSelector, stats);
        }
        const problematicSelectors = Array.from(selectorStats.entries())
            .map(([selector, stats]) => ({
            selector,
            mutationCount: stats.mutations,
            successRate: stats.mutations > 0 ? (stats.successes / stats.mutations) * 100 : 100,
        }))
            .filter(s => s.mutationCount > 1)
            .sort((a, b) => a.successRate - b.successRate)
            .slice(0, 10);
        const recommendations = [];
        if (failedSwaps > successfulSwaps) {
            recommendations.push('Consider using more stable selectors (data-testid, aria-label)');
        }
        if (problematicSelectors.some(s => s.successRate < 50)) {
            recommendations.push('Some selectors have <50% recovery rate - review selector strategy');
        }
        if (!this.config.enableVisualMatching) {
            recommendations.push('Enable Gemini Vision for improved visual matching');
        }
        return {
            totalMonitored: this.memory.fingerprints.size,
            totalMutations: this.memory.mutations.length,
            successfulSwaps,
            failedSwaps,
            averageConfidence: this.swapHistory.length > 0
                ? this.swapHistory.reduce((sum, s) => sum + s.confidence, 0) / this.swapHistory.length
                : 100,
            problematicSelectors,
            timeline: this.swapHistory.slice(-50).map(s => ({
                timestamp: new Date(),
                selector: s.originalSelector,
                mutationType: s.mutation?.mutationType ?? 'unknown',
                success: s.success,
            })),
            recommendations,
        };
    }
    /**
     * Cleanup
     */
    async cleanup() {
        this.activeObservers.clear();
        if (this.config.persistMemory) {
            this.saveMemory();
        }
    }
}
exports.HotSwapSelectorEngine = HotSwapSelectorEngine;
