"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🧠 QANTUM HYBRID v1.0.0 - DeepSearch Engine
 * Shadow DOM penetration + iFrame traversal + Overlay dismissal
 * Ported from: shadow-visual-engines.js
 * ═══════════════════════════════════════════════════════════════════════════════
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeepSearchEngine = void 0;
const events_1 = require("events");
const logger_1 = require("../api/unified/utils/logger");
// ═══════════════════════════════════════════════════════════════════════════════
// DEEP SEARCH ENGINE
// ═══════════════════════════════════════════════════════════════════════════════
class DeepSearchEngine extends events_1.EventEmitter {
    page;
    config;
    currentFrame = null;
    frameStack = [];
    constructor(config) {
        super();
        this.config = {
            shadowDOM: {
                enabled: config?.shadowDOM?.enabled ?? true,
                maxDepth: config?.shadowDOM?.maxDepth ?? 5,
                pierceMode: config?.shadowDOM?.pierceMode ?? 'deep',
            },
            iframes: {
                enabled: config?.iframes?.enabled ?? true,
                autoSwitch: config?.iframes?.autoSwitch ?? true,
                crossOrigin: config?.iframes?.crossOrigin ?? false,
                maxDepth: config?.iframes?.maxDepth ?? 3,
            },
            overlays: {
                autoDismiss: config?.overlays?.autoDismiss ?? true,
                selectors: config?.overlays?.selectors ?? [
                    '[class*="cookie"]', '[id*="cookie"]',
                    '[class*="consent"]', '[class*="gdpr"]',
                    '#onetrust-banner-sdk', '#CybotCookiebotDialog',
                    '.cc-window', '[class*="modal"]', '[class*="popup"]',
                    '[class*="overlay"]', '[role="dialog"]',
                ],
                closeSelectors: config?.overlays?.closeSelectors ?? [
                    '[class*="close"]', '[aria-label*="close"]', '[aria-label*="Close"]',
                    '#accept', '.accept-all', '[class*="accept"]',
                    '#onetrust-accept-btn-handler', '.cc-accept', '.cc-dismiss',
                    'button[class*="reject"]', '[id*="reject"]',
                ],
            },
            timeout: config?.timeout ?? 15000,
            retryInterval: config?.retryInterval ?? 300,
        };
    }
    /**
     * Set Playwright page instance
     */
    setPage(page) {
        this.page = page;
        this.currentFrame = null;
        this.frameStack = [];
        return this;
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // OVERLAY DISMISSAL
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Auto-dismiss overlays (cookies, modals, popups)
     */
    async dismissOverlays() {
        if (!this.page || !this.config.overlays.autoDismiss) {
            return { dismissed: 0, selectors: [] };
        }
        const overlaySelectors = this.config.overlays.selectors;
        const closeSelectors = this.config.overlays.closeSelectors;
        try {
            const result = await this.page.evaluate(({ overlays, closes }) => {
                let dismissed = 0;
                const dismissedSelectors = [];
                for (const overlaySel of overlays) {
                    try {
                        document.querySelectorAll(overlaySel).forEach((overlay) => {
                            const el = overlay;
                            if (el.offsetParent === null)
                                return;
                            const style = window.getComputedStyle(el);
                            if (style.position !== 'fixed' && style.position !== 'absolute')
                                return;
                            // Try close button first
                            for (const closeSel of closes) {
                                const closeBtn = el.querySelector(closeSel);
                                if (closeBtn) {
                                    closeBtn.click();
                                    dismissed++;
                                    dismissedSelectors.push(overlaySel);
                                    return;
                                }
                            }
                            // Hide if no button found
                            el.style.display = 'none';
                            dismissed++;
                            dismissedSelectors.push(overlaySel);
                        });
                    }
                    catch { }
                }
                return { dismissed, selectors: dismissedSelectors };
            }, { overlays: overlaySelectors, closes: closeSelectors });
            if (result.dismissed > 0) {
                logger_1.logger.debug(`🧹 Dismissed ${result.dismissed} overlay(s)`);
                this.emit('overlayDismissed', result);
            }
            return result;
        }
        catch {
            return { dismissed: 0, selectors: [] };
        }
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // SHADOW DOM PENETRATION
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Discover all Shadow DOM roots in the page
     */
    async discoverShadowRoots() {
        if (!this.page)
            return [];
        try {
            const roots = await this.page.evaluate((maxDepth) => {
                const results = [];
                function findRoots(node, path, depth) {
                    if (depth > maxDepth)
                        return;
                    if (node instanceof Element && node.shadowRoot) {
                        results.push({
                            path,
                            host: node.tagName,
                            id: node.id || undefined,
                            depth,
                        });
                        findRoots(node.shadowRoot, path + '/shadow', depth + 1);
                    }
                    const children = 'querySelectorAll' in node
                        ? node.querySelectorAll('*')
                        : [];
                    children.forEach((child) => {
                        findRoots(child, path + '/' + child.tagName.toLowerCase(), depth + 1);
                    });
                }
                findRoots(document.body, 'body', 0);
                return results;
            }, this.config.shadowDOM.maxDepth);
            if (roots.length > 0) {
                logger_1.logger.debug(`🌑 Found ${roots.length} Shadow DOM root(s)`);
                this.emit('shadowRootsDiscovered', roots);
            }
            return roots;
        }
        catch {
            return [];
        }
    }
    /**
     * Find element inside Shadow DOM
     */
    async findInShadow(selector) {
        if (!this.page || !this.config.shadowDOM.enabled) {
            return { found: false, depth: 0 };
        }
        const maxDepth = this.config.shadowDOM.maxDepth;
        try {
            const result = await this.page.evaluate(({ sel, maxD }) => {
                function deepQuery(cssSelector, root = document, depth = 0) {
                    if (depth > maxD)
                        return { found: false, depth };
                    // Try direct query first
                    try {
                        const el = root.querySelector(cssSelector);
                        if (el && el.offsetParent !== null) {
                            return { found: true, depth, tagName: el.tagName };
                        }
                    }
                    catch { }
                    // Search in shadow roots
                    const elements = 'querySelectorAll' in root
                        ? root.querySelectorAll('*')
                        : [];
                    for (const el of elements) {
                        if (el.shadowRoot) {
                            const found = deepQuery(cssSelector, el.shadowRoot, depth + 1);
                            if (found.found)
                                return found;
                        }
                    }
                    return { found: false, depth };
                }
                return deepQuery(sel);
            }, { sel: selector, maxD: maxDepth });
            return result;
        }
        catch {
            return { found: false, depth: 0 };
        }
    }
    /**
     * Click element inside Shadow DOM
     */
    async clickInShadow(selector) {
        if (!this.page) {
            return { success: false, error: 'Page not set' };
        }
        // Dismiss overlays first
        await this.dismissOverlays();
        try {
            const result = await this.page.evaluate(({ sel, maxDepth }) => {
                function deepQuery(cssSelector, root = document, depth = 0) {
                    if (depth > maxDepth)
                        return null;
                    try {
                        const el = root.querySelector(cssSelector);
                        if (el)
                            return el;
                    }
                    catch { }
                    for (const el of root.querySelectorAll('*')) {
                        if (el.shadowRoot) {
                            const found = deepQuery(cssSelector, el.shadowRoot, depth + 1);
                            if (found)
                                return found;
                        }
                    }
                    return null;
                }
                const element = deepQuery(sel);
                if (!element)
                    return { success: false, error: 'Element not found' };
                // Scroll into view
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                // Try multiple click methods
                try {
                    element.click();
                    return { success: true, method: 'native' };
                }
                catch {
                    try {
                        element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
                        return { success: true, method: 'dispatch' };
                    }
                    catch {
                        element.focus();
                        element.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
                        return { success: true, method: 'keyboard' };
                    }
                }
            }, { sel: selector, maxDepth: this.config.shadowDOM.maxDepth });
            if (result.success) {
                this.emit('clickInShadow', { selector, method: result.method });
            }
            return result;
        }
        catch (e) {
            return { success: false, error: e.message };
        }
    }
    /**
     * Type text into element inside Shadow DOM
     */
    async typeInShadow(selector, text) {
        if (!this.page) {
            return { success: false, error: 'Page not set' };
        }
        await this.dismissOverlays();
        try {
            const result = await this.page.evaluate(({ sel, txt, maxDepth }) => {
                function deepQuery(cssSelector, root = document, depth = 0) {
                    if (depth > maxDepth)
                        return null;
                    try {
                        const el = root.querySelector(cssSelector);
                        if (el)
                            return el;
                    }
                    catch { }
                    for (const el of root.querySelectorAll('*')) {
                        if (el.shadowRoot) {
                            const found = deepQuery(cssSelector, el.shadowRoot, depth + 1);
                            if (found)
                                return found;
                        }
                    }
                    return null;
                }
                const element = deepQuery(sel);
                if (!element)
                    return { success: false, error: 'Element not found' };
                element.scrollIntoView({ block: 'center' });
                element.focus();
                element.value = '';
                element.value = txt;
                element.dispatchEvent(new Event('input', { bubbles: true }));
                element.dispatchEvent(new Event('change', { bubbles: true }));
                return { success: true };
            }, { sel: selector, txt: text, maxDepth: this.config.shadowDOM.maxDepth });
            return result;
        }
        catch (e) {
            return { success: false, error: e.message };
        }
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // IFRAME HANDLING
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Discover all iframes in the page
     */
    async discoverIframes() {
        if (!this.page)
            return [];
        try {
            const iframes = await this.page.evaluate(() => {
                return [...document.querySelectorAll('iframe')].map((frame, index) => ({
                    index,
                    id: frame.id || undefined,
                    name: frame.name || undefined,
                    src: frame.src || undefined,
                    visible: frame.offsetParent !== null,
                }));
            });
            if (iframes.length > 0) {
                logger_1.logger.debug(`🖼️ Found ${iframes.length} iframe(s)`);
                this.emit('iframesDiscovered', iframes);
            }
            return iframes;
        }
        catch {
            return [];
        }
    }
    /**
     * Switch to iframe by index, name, or selector
     */
    async switchToFrame(identifier) {
        if (!this.page) {
            return { success: false };
        }
        try {
            let frame = null;
            if (typeof identifier === 'number') {
                const frames = this.page.frames();
                frame = frames[identifier + 1]; // +1 because index 0 is main frame
            }
            else {
                // Try by name first
                frame = this.page.frame(identifier);
                // Try by selector
                if (!frame) {
                    const frameElement = await this.page.$(identifier);
                    if (frameElement) {
                        frame = await frameElement.contentFrame();
                    }
                }
            }
            if (frame) {
                // Save current frame to stack
                if (this.currentFrame) {
                    this.frameStack.push(this.currentFrame);
                }
                this.currentFrame = frame;
                logger_1.logger.debug(`🖼️ Switched to frame: ${typeof identifier === 'number' ? `index ${identifier}` : identifier}`);
                this.emit('frameSwitched', { identifier });
                return { success: true, frame };
            }
            return { success: false };
        }
        catch {
            return { success: false };
        }
    }
    /**
     * Switch back to main frame
     */
    async switchToMain() {
        this.currentFrame = null;
        this.frameStack = [];
        logger_1.logger.debug('🖼️ Switched to main frame');
        return { success: true };
    }
    /**
     * Switch to parent frame
     */
    async switchToParent() {
        const parent = this.frameStack.pop();
        this.currentFrame = parent || null;
        return { success: true };
    }
    /**
     * Get current frame context
     */
    getCurrentFrame() {
        return this.currentFrame || this.page || null;
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // DEEP FIND (COMBINED)
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Deep find - searches main DOM, Shadow DOM, and iframes
     */
    async deepFind(selector, options) {
        if (!this.page) {
            return { found: false, context: 'main', depth: 0, timeMs: 0 };
        }
        const startTime = Date.now();
        const timeout = options?.timeout ?? this.config.timeout;
        // Dismiss overlays first
        await this.dismissOverlays();
        while (Date.now() - startTime < timeout) {
            // 1. Try main DOM
            try {
                const locator = this.page.locator(selector);
                const count = await locator.count();
                if (count > 0) {
                    const isVisible = await locator.first().isVisible();
                    if (isVisible) {
                        return {
                            found: true,
                            locator: locator.first(),
                            context: 'main',
                            depth: 0,
                            strategy: 'direct',
                            timeMs: Date.now() - startTime,
                        };
                    }
                }
            }
            catch { }
            // 2. Try Shadow DOM
            if (this.config.shadowDOM.enabled) {
                const shadowResult = await this.findInShadow(selector);
                if (shadowResult.found) {
                    return {
                        found: true,
                        context: 'shadow',
                        depth: shadowResult.depth,
                        strategy: 'shadow-pierce',
                        timeMs: Date.now() - startTime,
                    };
                }
            }
            // 3. Try iframes
            if (this.config.iframes.enabled && this.config.iframes.autoSwitch) {
                const iframes = await this.discoverIframes();
                for (const iframe of iframes) {
                    if (!iframe.visible)
                        continue;
                    const frameResult = await this.switchToFrame(iframe.index);
                    if (frameResult.success && frameResult.frame) {
                        try {
                            const locator = frameResult.frame.locator(selector);
                            const count = await locator.count();
                            if (count > 0) {
                                return {
                                    found: true,
                                    locator: locator.first(),
                                    context: 'iframe',
                                    depth: 1,
                                    frameIndex: iframe.index,
                                    strategy: 'iframe-switch',
                                    timeMs: Date.now() - startTime,
                                };
                            }
                        }
                        catch { }
                    }
                    await this.switchToMain();
                }
            }
            // Wait before retry
            await this.sleep(this.config.retryInterval);
        }
        return {
            found: false,
            context: 'main',
            depth: 0,
            timeMs: Date.now() - startTime,
        };
    }
    /**
     * Deep click - clicks element wherever it is found
     */
    async deepClick(selector) {
        const result = await this.deepFind(selector);
        if (!result.found) {
            // Try shadow click as last resort
            const shadowClick = await this.clickInShadow(selector);
            if (shadowClick.success) {
                return { success: true, context: 'shadow' };
            }
            return { success: false, error: 'Element not found in any context' };
        }
        if (result.locator) {
            await result.locator.click();
            return { success: true, context: result.context };
        }
        if (result.context === 'shadow') {
            return await this.clickInShadow(selector);
        }
        return { success: false, error: 'Unable to click element' };
    }
    /**
     * Deep type - types text into element wherever it is found
     */
    async deepType(selector, text) {
        const result = await this.deepFind(selector);
        if (!result.found) {
            // Try shadow type as last resort
            const shadowType = await this.typeInShadow(selector, text);
            if (shadowType.success) {
                return { success: true, context: 'shadow' };
            }
            return { success: false, error: 'Element not found in any context' };
        }
        if (result.locator) {
            await result.locator.fill(text);
            return { success: true, context: result.context };
        }
        if (result.context === 'shadow') {
            return await this.typeInShadow(selector, text);
        }
        return { success: false, error: 'Unable to type into element' };
    }
    /**
     * Pierce all - get all matching elements across shadow boundaries
     */
    async pierceAll(selector) {
        if (!this.page)
            return [];
        try {
            // Use Playwright's >> pierce syntax for Shadow DOM
            const locator = this.page.locator(`css=${selector} >> visible=true`);
            const count = await locator.count();
            const elements = [];
            for (let i = 0; i < count; i++) {
                const handle = await locator.nth(i).elementHandle();
                if (handle)
                    elements.push(handle);
            }
            // Also search in shadow roots
            const shadowElements = await this.page.evaluate(({ sel, maxDepth }) => {
                const results = [];
                function deepQueryAll(cssSelector, root = document, depth = 0) {
                    if (depth > maxDepth)
                        return;
                    try {
                        const els = root.querySelectorAll(cssSelector);
                        els.forEach((_, i) => results.push(i));
                    }
                    catch { }
                    for (const el of root.querySelectorAll('*')) {
                        if (el.shadowRoot) {
                            deepQueryAll(cssSelector, el.shadowRoot, depth + 1);
                        }
                    }
                }
                deepQueryAll(sel);
                return results.length;
            }, { sel: selector, maxDepth: this.config.shadowDOM.maxDepth });
            logger_1.logger.debug(`🔍 Found ${elements.length + shadowElements} elements with pierceAll`);
            return elements;
        }
        catch {
            return [];
        }
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // UTILITIES
    // ═══════════════════════════════════════════════════════════════════════════
    sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
    /**
     * Get search statistics
     */
    getStatistics() {
        return {
            shadowRootsFound: 0, // Would need to track
            iframesFound: 0,
            overlaysDismissed: 0,
        };
    }
}
exports.DeepSearchEngine = DeepSearchEngine;
exports.default = DeepSearchEngine;
