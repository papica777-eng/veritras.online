"use strict";
/**
 * 🔧 SELF-HEALING V2 - Real-Time Test Refactoring
 *
 * Advanced self-healing system that automatically repairs
 * broken tests when cognitive anchors change.
 *
 * Features:
 * - Real-time DOM mutation detection
 * - Intelligent selector migration
 * - Automatic test code refactoring
 * - Learning from successful repairs
 *
 * @version 1.0.0-QANTUM-PRIME
 * @phase 89-90
 */
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
exports.SelfHealingV2 = void 0;
exports.createSelfHealing = createSelfHealing;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const crypto = __importStar(require("crypto"));
const events_1 = require("events");
const neural_map_engine_1 = require("./neural-map-engine");
const logger_1 = require("../api/unified/utils/logger");
// ============================================================
// SELF-HEALING V2 ENGINE
// ============================================================
class SelfHealingV2 extends events_1.EventEmitter {
    config;
    neuralMap;
    healingHistory = new Map();
    mutationPatterns = [];
    activeWatchers = new Map();
    constructor(config = {}) {
        super();
        this.config = {
            autoHeal: true,
            maxHealAttempts: 5,
            healingStrategies: [
                'fallback-selector',
                'semantic-match',
                'visual-match',
                'neighboring-elements',
                'structure-analysis',
                'ml-prediction'
            ],
            learningEnabled: true,
            notifyOnHeal: true,
            refactorTestCode: true,
            backupBeforeRefactor: true,
            outputDir: './healing-data',
            ...config
        };
        this.neuralMap = new neural_map_engine_1.NeuralMapEngine();
        this.loadHealingData();
    }
    /**
     * 🔧 Attempt to heal a broken anchor
     */
    // Complexity: O(N) — linear iteration
    async heal(page, anchor, change) {
        logger_1.logger.debug(`
╔═══════════════════════════════════════════════════════════════╗
║  🔧 SELF-HEALING V2 - Automatic Repair                        ║
║                                                               ║
║  "Tests that fix themselves"                                  ║
╚═══════════════════════════════════════════════════════════════╝
`);
        logger_1.logger.debug(`🔧 [HEALER] Anchor: ${anchor.id}`);
        logger_1.logger.debug(`🔧 [HEALER] Change: ${change.changeType}`);
        logger_1.logger.debug(`🔧 [HEALER] Previous: ${change.previousSelector}`);
        logger_1.logger.debug('');
        const startTime = Date.now();
        let result = null;
        // Try each strategy in order
        for (const strategy of this.config.healingStrategies) {
            if (result?.success)
                break;
            logger_1.logger.debug(`🔧 [HEALER] Trying strategy: ${strategy}`);
            try {
                result = await this.tryStrategy(page, anchor, change, strategy);
                if (result.success) {
                    logger_1.logger.debug(`✅ [HEALER] Success with ${strategy}!`);
                    logger_1.logger.debug(`   New selector: ${result.newSelector}`);
                    logger_1.logger.debug(`   Confidence: ${(result.confidence * 100).toFixed(1)}%`);
                }
            }
            catch (error) {
                logger_1.logger.debug(`❌ [HEALER] ${strategy} failed: ${error.message}`);
            }
        }
        if (!result || !result.success) {
            result = {
                success: false,
                anchorId: anchor.id,
                strategy: 'fallback-selector',
                previousSelector: change.previousSelector,
                newSelector: change.previousSelector,
                confidence: 0,
                healingTime: Date.now() - startTime,
                refactoredFiles: []
            };
        }
        result.healingTime = Date.now() - startTime;
        // Update history
        this.recordHealing(anchor.id, change, result);
        // Refactor test code if enabled
        if (result.success && this.config.refactorTestCode) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            const refactored = await this.refactorTests(anchor, result);
            result.refactoredFiles = refactored;
        }
        // Learn from this healing
        if (this.config.learningEnabled && result.success) {
            this.learnFromHealing(change, result);
        }
        // Emit event
        this.emit('healing:complete', result);
        return result;
    }
    /**
     * Try a specific healing strategy
     */
    // Complexity: O(1) — amortized
    async tryStrategy(page, anchor, change, strategy) {
        const baseResult = {
            anchorId: anchor.id,
            strategy,
            previousSelector: change.previousSelector,
            healingTime: 0,
            refactoredFiles: []
        };
        switch (strategy) {
            case 'fallback-selector':
                // SAFETY: async operation — wrap in try-catch for production resilience
                return await this.tryFallbackSelector(page, anchor, baseResult);
            case 'semantic-match':
                // SAFETY: async operation — wrap in try-catch for production resilience
                return await this.trySemanticMatch(page, anchor, baseResult);
            case 'visual-match':
                // SAFETY: async operation — wrap in try-catch for production resilience
                return await this.tryVisualMatch(page, anchor, baseResult);
            case 'neighboring-elements':
                // SAFETY: async operation — wrap in try-catch for production resilience
                return await this.tryNeighboringElements(page, anchor, change, baseResult);
            case 'structure-analysis':
                // SAFETY: async operation — wrap in try-catch for production resilience
                return await this.tryStructureAnalysis(page, anchor, change, baseResult);
            case 'ml-prediction':
                // SAFETY: async operation — wrap in try-catch for production resilience
                return await this.tryMLPrediction(page, anchor, change, baseResult);
            default:
                return { ...baseResult, success: false, newSelector: '', confidence: 0 };
        }
    }
    /**
     * Strategy: Try fallback selectors from the anchor
     */
    // Complexity: O(N) — linear iteration
    async tryFallbackSelector(page, anchor, baseResult) {
        // Try each selector in the anchor's list
        for (const selector of anchor.selectors) {
            try {
                const selectorValue = selector.value || selector.selector;
                const element = await page.$(selectorValue);
                if (element) {
                    const isVisible = await element.isVisible();
                    if (isVisible) {
                        return {
                            ...baseResult,
                            success: true,
                            newSelector: selectorValue,
                            confidence: selector.confidence
                        };
                    }
                }
            }
            catch { }
        }
        return {
            ...baseResult,
            success: false,
            newSelector: '',
            confidence: 0
        };
    }
    /**
     * Strategy: Semantic matching based on text/aria
     */
    // Complexity: O(N) — linear iteration
    async trySemanticMatch(page, anchor, baseResult) {
        // Find semantic context
        const semanticHints = anchor.selectors.filter(s => s.type === 'text' || s.type === 'aria' || s.type === 'role');
        for (const hint of semanticHints) {
            try {
                let selector;
                const hintValue = hint.value || hint.selector;
                switch (hint.type) {
                    case 'text':
                        selector = `text=${hintValue}`;
                        break;
                    case 'aria':
                        selector = `[aria-label="${hintValue}"]`;
                        break;
                    case 'role':
                        selector = `[role="${hintValue}"]`;
                        break;
                    default:
                        continue;
                }
                // SAFETY: async operation — wrap in try-catch for production resilience
                const element = await page.$(selector);
                // SAFETY: async operation — wrap in try-catch for production resilience
                if (element && await element.isVisible()) {
                    return {
                        ...baseResult,
                        success: true,
                        newSelector: selector,
                        confidence: hint.confidence * 0.9
                    };
                }
            }
            catch { }
        }
        return {
            ...baseResult,
            success: false,
            newSelector: '',
            confidence: 0
        };
    }
    /**
     * Strategy: Visual matching using image comparison
     */
    // Complexity: O(N*M) — nested iteration detected
    async tryVisualMatch(page, anchor, baseResult) {
        if (!anchor.visual?.fingerprint) {
            return { ...baseResult, success: false, newSelector: '', confidence: 0 };
        }
        // Get all similar elements on page
        // SAFETY: async operation — wrap in try-catch for production resilience
        const candidates = await page.evaluate((visual) => {
            const results = [];
            const elements = document.querySelectorAll('*');
            for (const el of elements) {
                const rect = el.getBoundingClientRect();
                const style = window.getComputedStyle(el);
                // Match by approximate size and color
                const sizeSimilarity = 1 - Math.abs(rect.width - visual.bounds.width) / 100;
                const heightSimilarity = 1 - Math.abs(rect.height - visual.bounds.height) / 100;
                if (sizeSimilarity > 0.7 && heightSimilarity > 0.7) {
                    // Generate XPath for this element
                    const getXPath = (element) => {
                        if (element.id)
                            return `//*[@id="${element.id}"]`;
                        if (element === document.body)
                            return '/html/body';
                        const siblings = element.parentNode?.children || [];
                        let index = 1;
                        for (const sibling of siblings) {
                            if (sibling === element) {
                                return getXPath(element.parentElement) +
                                    `/${element.tagName.toLowerCase()}[${index}]`;
                            }
                            if (sibling.tagName === element.tagName)
                                index++;
                        }
                        return '';
                    };
                    results.push({
                        xpath: getXPath(el),
                        similarity: (sizeSimilarity + heightSimilarity) / 2,
                        tag: el.tagName.toLowerCase()
                    });
                }
            }
            return results.sort((a, b) => b.similarity - a.similarity).slice(0, 5);
        }, anchor.visual);
        // Try candidates
        for (const candidate of candidates) {
            try {
                const element = await page.$(`xpath=${candidate.xpath}`);
                if (element && await element.isVisible()) {
                    return {
                        ...baseResult,
                        success: true,
                        newSelector: `xpath=${candidate.xpath}`,
                        confidence: candidate.similarity * 0.8
                    };
                }
            }
            catch { }
        }
        return {
            ...baseResult,
            success: false,
            newSelector: '',
            confidence: 0
        };
    }
    /**
     * Strategy: Find element based on neighboring elements
     */
    // Complexity: O(N*M) — nested iteration detected
    async tryNeighboringElements(page, anchor, change, baseResult) {
        // Use semantic context from anchor
        const context = anchor.semantic;
        if (!context) {
            return { ...baseResult, success: false, newSelector: '', confidence: 0 };
        }
        // Try to find element near known landmarks
        // SAFETY: async operation — wrap in try-catch for production resilience
        const landmarks = await page.evaluate((semantic) => {
            const results = [];
            // Find heading
            if (semantic.nearestHeading) {
                const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
                for (const h of headings) {
                    if (h.textContent?.includes(semantic.nearestHeading)) {
                        // Find interactive elements near this heading
                        const siblings = h.parentElement?.querySelectorAll('button, a, input') || [];
                        for (const sib of siblings) {
                            results.push({
                                xpath: sib.id ? `//*[@id="${sib.id}"]` : null,
                                text: sib.textContent?.trim(),
                                tag: sib.tagName.toLowerCase()
                            });
                        }
                    }
                }
            }
            return results;
        }, context);
        for (const landmark of landmarks) {
            if (landmark.xpath) {
                try {
                    const element = await page.$(`xpath=${landmark.xpath}`);
                    if (element && await element.isVisible()) {
                        return {
                            ...baseResult,
                            success: true,
                            newSelector: `xpath=${landmark.xpath}`,
                            confidence: 0.7
                        };
                    }
                }
                catch { }
            }
        }
        return {
            ...baseResult,
            success: false,
            newSelector: '',
            confidence: 0
        };
    }
    /**
     * Strategy: Analyze DOM structure changes
     */
    // Complexity: O(N*M) — nested iteration detected
    async tryStructureAnalysis(page, anchor, change, baseResult) {
        // Get DOM tree and compare structure
        // SAFETY: async operation — wrap in try-catch for production resilience
        const analysis = await page.evaluate((prevSelector) => {
            // Parse the previous selector to understand what we're looking for
            const patterns = {
                hasClass: prevSelector.match(/\.([a-zA-Z0-9_-]+)/g),
                hasTag: prevSelector.match(/^([a-z]+)/)?.[1],
                hasAttr: prevSelector.match(/\[([^\]]+)\]/g)
            };
            // Find elements matching partial patterns
            const candidates = [];
            // Try to find by class pattern
            if (patterns.hasClass) {
                for (const cls of patterns.hasClass) {
                    const className = cls.slice(1);
                    const elements = document.querySelectorAll(`[class*="${className}"]`);
                    for (const el of elements) {
                        candidates.push({
                            selector: el.id ? `#${el.id}` : `[class="${el.className}"]`,
                            score: 0.6
                        });
                    }
                }
            }
            return candidates.slice(0, 5);
        }, change.previousSelector);
        for (const candidate of analysis) {
            try {
                const element = await page.$(candidate.selector);
                if (element && await element.isVisible()) {
                    return {
                        ...baseResult,
                        success: true,
                        newSelector: candidate.selector,
                        confidence: candidate.score
                    };
                }
            }
            catch { }
        }
        return {
            ...baseResult,
            success: false,
            newSelector: '',
            confidence: 0
        };
    }
    /**
     * Strategy: ML-based prediction from learned patterns
     */
    // Complexity: O(1) — hash/map lookup
    async tryMLPrediction(page, anchor, change, baseResult) {
        // Find similar mutation patterns from history
        const patterns = this.findSimilarPatterns(change);
        if (patterns.length === 0) {
            return { ...baseResult, success: false, newSelector: '', confidence: 0 };
        }
        // Use most successful pattern
        const bestPattern = patterns[0];
        // Apply the pattern's successful strategy
        logger_1.logger.debug(`🔧 [ML] Using learned pattern: ${bestPattern.pattern}`);
        logger_1.logger.debug(`🔧 [ML] Recommended strategy: ${bestPattern.successfulStrategy}`);
        // Re-try with the learned strategy
        // SAFETY: async operation — wrap in try-catch for production resilience
        return await this.tryStrategy(page, anchor, change, bestPattern.successfulStrategy);
    }
    /**
     * Find similar mutation patterns from history
     */
    // Complexity: O(N log N) — sort operation
    findSimilarPatterns(change) {
        return this.mutationPatterns
            .filter(p => {
            // Match by change type and selector pattern
            const changePattern = `${change.changeType}:${this.extractSelectorPattern(change.previousSelector)}`;
            return p.pattern.includes(changePattern.split(':')[0]) ||
                this.calculateSimilarity(p.pattern, changePattern) > 0.5;
        })
            .sort((a, b) => b.confidence - a.confidence);
    }
    /**
     * Extract pattern from selector
     */
    // Complexity: O(1)
    extractSelectorPattern(selector) {
        return selector
            .replace(/[0-9]+/g, 'N')
            .replace(/"[^"]+"/g, '"..."')
            .replace(/'[^']+'/g, "'...'");
    }
    /**
     * Calculate string similarity
     */
    // Complexity: O(N*M) — nested iteration detected
    calculateSimilarity(a, b) {
        const longer = a.length > b.length ? a : b;
        const shorter = a.length > b.length ? b : a;
        if (longer.length === 0)
            return 1.0;
        const costs = [];
        for (let i = 0; i <= longer.length; i++) {
            let lastValue = i;
            for (let j = 0; j <= shorter.length; j++) {
                if (i === 0) {
                    costs[j] = j;
                }
                else if (j > 0) {
                    let newValue = costs[j - 1];
                    if (longer[i - 1] !== shorter[j - 1]) {
                        newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
                    }
                    costs[j - 1] = lastValue;
                    lastValue = newValue;
                }
            }
            if (i > 0)
                costs[shorter.length] = lastValue;
        }
        return (longer.length - costs[shorter.length]) / longer.length;
    }
    // ============================================================
    // TEST REFACTORING
    // ============================================================
    /**
     * Refactor test files with new selector
     */
    // Complexity: O(N*M) — nested iteration detected
    async refactorTests(anchor, healing) {
        logger_1.logger.debug('🔧 [HEALER] Refactoring test files...');
        const refactoredFiles = [];
        const testDirs = ['./test', './tests', './generated_tests', './e2e'];
        for (const dir of testDirs) {
            if (!fs.existsSync(dir))
                continue;
            const files = this.findTestFiles(dir);
            for (const file of files) {
                // SAFETY: async operation — wrap in try-catch for production resilience
                const refactored = await this.refactorFile(file, healing.previousSelector, healing.newSelector, anchor.id);
                if (refactored) {
                    refactoredFiles.push(file);
                }
            }
        }
        logger_1.logger.debug(`🔧 [HEALER] Refactored ${refactoredFiles.length} files`);
        return refactoredFiles;
    }
    /**
     * Find all test files in directory
     */
    // Complexity: O(N) — linear iteration
    findTestFiles(dir) {
        const files = [];
        const walk = (currentDir) => {
            const entries = fs.readdirSync(currentDir, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(currentDir, entry.name);
                if (entry.isDirectory() && !entry.name.startsWith('.')) {
                    // Complexity: O(1)
                    walk(fullPath);
                }
                else if (entry.isFile() && /\.(spec|test)\.(ts|js)$/.test(entry.name)) {
                    files.push(fullPath);
                }
            }
        };
        // Complexity: O(1)
        walk(dir);
        return files;
    }
    /**
     * Refactor a single file
     */
    // Complexity: O(1) — amortized
    async refactorFile(filePath, oldSelector, newSelector, anchorId) {
        try {
            const content = fs.readFileSync(filePath, 'utf-8');
            // Check if file contains the old selector
            if (!content.includes(oldSelector)) {
                return false;
            }
            // Backup if enabled
            if (this.config.backupBeforeRefactor) {
                const backupPath = filePath + '.backup.' + Date.now();
                fs.writeFileSync(backupPath, content);
            }
            // Replace selector
            const newContent = content.replace(new RegExp(this.escapeRegex(oldSelector), 'g'), newSelector);
            // Add healing comment
            const healingComment = `// 🔧 Self-healed: ${new Date().toISOString()} | Anchor: ${anchorId}\n`;
            const finalContent = healingComment + newContent;
            fs.writeFileSync(filePath, finalContent);
            logger_1.logger.debug(`   ✅ Refactored: ${filePath}`);
            return true;
        }
        catch (error) {
            logger_1.logger.error(`   ❌ Failed to refactor: ${filePath}`);
            return false;
        }
    }
    /**
     * Generate refactoring suggestions without auto-applying
     */
    // Complexity: O(N*M) — nested iteration detected
    async suggestRefactoring(anchor, healing) {
        const suggestions = [];
        const testDirs = ['./test', './tests', './generated_tests', './e2e'];
        for (const dir of testDirs) {
            if (!fs.existsSync(dir))
                continue;
            const files = this.findTestFiles(dir);
            for (const file of files) {
                const content = fs.readFileSync(file, 'utf-8');
                const lines = content.split('\n');
                lines.forEach((line, index) => {
                    if (line.includes(healing.previousSelector)) {
                        suggestions.push({
                            testFile: file,
                            line: index + 1,
                            originalCode: line.trim(),
                            suggestedCode: line.replace(healing.previousSelector, healing.newSelector).trim(),
                            reason: `Anchor '${anchor.id}' changed: ${anchor.name}`,
                            confidence: healing.confidence,
                            autoApply: healing.confidence > 0.9
                        });
                    }
                });
            }
        }
        return suggestions;
    }
    // ============================================================
    // LEARNING & HISTORY
    // ============================================================
    /**
     * Record healing attempt
     */
    // Complexity: O(N) — linear iteration
    recordHealing(anchorId, change, result) {
        let history = this.healingHistory.get(anchorId);
        if (!history) {
            history = {
                anchorId,
                changes: [],
                healings: [],
                successRate: 0,
                lastUpdated: Date.now()
            };
            this.healingHistory.set(anchorId, history);
        }
        history.changes.push(change);
        history.healings.push(result);
        history.lastUpdated = Date.now();
        // Calculate success rate
        const successes = history.healings.filter(h => h.success).length;
        history.successRate = successes / history.healings.length;
        this.saveHealingData();
    }
    /**
     * Learn from successful healing
     */
    // Complexity: O(N) — linear iteration
    learnFromHealing(change, result) {
        if (!result.success)
            return;
        const pattern = `${change.changeType}:${this.extractSelectorPattern(change.previousSelector)}`;
        // Find or create pattern
        let existing = this.mutationPatterns.find(p => p.pattern === pattern);
        if (existing) {
            existing.frequency++;
            if (result.confidence > existing.confidence) {
                existing.successfulStrategy = result.strategy;
                existing.confidence = result.confidence;
            }
        }
        else {
            this.mutationPatterns.push({
                id: `pattern_${crypto.randomBytes(4).toString('hex')}`,
                pattern,
                frequency: 1,
                successfulStrategy: result.strategy,
                confidence: result.confidence
            });
        }
        logger_1.logger.debug(`🧠 [LEARN] Pattern learned: ${pattern} → ${result.strategy}`);
        this.saveHealingData();
    }
    // ============================================================
    // REAL-TIME MONITORING
    // ============================================================
    /**
     * Start real-time monitoring for anchor changes
     */
    // Complexity: O(N*M) — nested iteration detected
    async startMonitoring(page, anchors) {
        logger_1.logger.debug(`🔧 [MONITOR] Starting real-time monitoring for ${anchors.length} anchors`);
        // Setup mutation observer
        // SAFETY: async operation — wrap in try-catch for production resilience
        await page.evaluate((anchorData) => {
            const observer = new MutationObserver((mutations) => {
                for (const mutation of mutations) {
                    // Check if any monitored anchors are affected
                    window.__anchorMutations = window.__anchorMutations || [];
                    window.__anchorMutations.push({
                        type: mutation.type,
                        target: mutation.target.nodeName,
                        timestamp: Date.now()
                    });
                }
            });
            observer.observe(document.body, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['class', 'id', 'data-testid', 'aria-label']
            });
            window.__mutationObserver = observer;
        }, anchors);
        // Start polling for mutations
        const watcherId = `watcher_${Date.now()}`;
        this.activeWatchers.set(watcherId, setInterval(async () => {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.checkForMutations(page, anchors);
        }, 1000));
        this.emit('monitoring:started', { anchors: anchors.length });
    }
    /**
     * Check for mutations
     */
    // Complexity: O(N) — linear iteration
    async checkForMutations(page, anchors) {
        try {
            const mutations = await page.evaluate(() => {
                const m = window.__anchorMutations || [];
                window.__anchorMutations = [];
                return m;
            });
            if (mutations.length > 0) {
                logger_1.logger.debug(`🔧 [MONITOR] Detected ${mutations.length} mutations`);
                // Check each anchor
                for (const anchor of anchors) {
                    const element = await this.neuralMap.findElement(page, anchor.id);
                    if (!element?.found) {
                        logger_1.logger.debug(`🔧 [MONITOR] Anchor broken: ${anchor.id}`);
                        if (this.config.autoHeal) {
                            const change = {
                                anchorId: anchor.id,
                                previousSelector: anchor.selectors[0]?.value || anchor.selectors[0]?.selector || '',
                                previousSignals: anchor.selectors,
                                changeType: 'modified',
                                detectedAt: Date.now(),
                                pageUrl: page.url()
                            };
                            // SAFETY: async operation — wrap in try-catch for production resilience
                            await this.heal(page, anchor, change);
                        }
                    }
                }
            }
        }
        catch (error) {
            // Page might be navigating, ignore
        }
    }
    /**
     * Stop monitoring
     */
    // Complexity: O(N) — linear iteration
    stopMonitoring() {
        for (const [id, timer] of this.activeWatchers) {
            // Complexity: O(1)
            clearInterval(timer);
        }
        this.activeWatchers.clear();
        this.emit('monitoring:stopped');
    }
    // ============================================================
    // PERSISTENCE
    // ============================================================
    // Complexity: O(1)
    loadHealingData() {
        try {
            const historyPath = path.join(this.config.outputDir, 'healing-history.json');
            if (fs.existsSync(historyPath)) {
                const data = JSON.parse(fs.readFileSync(historyPath, 'utf-8'));
                this.healingHistory = new Map(Object.entries(data.history || {}));
                this.mutationPatterns = data.patterns || [];
            }
        }
        catch { }
    }
    // Complexity: O(1)
    saveHealingData() {
        try {
            const dir = this.config.outputDir;
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            const data = {
                history: Object.fromEntries(this.healingHistory),
                patterns: this.mutationPatterns,
                savedAt: Date.now()
            };
            fs.writeFileSync(path.join(dir, 'healing-history.json'), JSON.stringify(data, null, 2));
        }
        catch { }
    }
    // ============================================================
    // UTILITIES
    // ============================================================
    // Complexity: O(1)
    escapeRegex(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    /**
     * Get healing statistics
     */
    // Complexity: O(N log N) — sort operation
    getStatistics() {
        const allHealings = Array.from(this.healingHistory.values())
            .flatMap(h => h.healings);
        const successfulHealings = allHealings.filter(h => h.success);
        const strategyCounts = new Map();
        for (const h of successfulHealings) {
            strategyCounts.set(h.strategy, (strategyCounts.get(h.strategy) || 0) + 1);
        }
        return {
            totalHealings: allHealings.length,
            successRate: allHealings.length > 0
                ? successfulHealings.length / allHealings.length
                : 0,
            patternsLearned: this.mutationPatterns.length,
            topStrategies: Array.from(strategyCounts.entries())
                .map(([strategy, count]) => ({ strategy, count }))
                .sort((a, b) => b.count - a.count)
        };
    }
}
exports.SelfHealingV2 = SelfHealingV2;
// ============================================================
// EXPORTS
// ============================================================
function createSelfHealing(config) {
    return new SelfHealingV2(config);
}
