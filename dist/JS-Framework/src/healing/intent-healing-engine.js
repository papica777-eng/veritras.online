"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntentHealingEngine = void 0;
exports.getIntentHealingEngine = getIntentHealingEngine;
const events_1 = require("events");
/**
 * IntentHealingEngine - Semantic Test Recovery System
 *
 * Instead of just finding alternative selectors, this engine:
 * 1. Understands the INTENT behind the test step
 * 2. Analyzes the current page state semantically
 * 3. Finds ANY path to achieve the goal, even if UI changed completely
 * 4. Rewrites the test step with new strategy
 *
 * Example: Test says "click login button with #login-btn"
 *   - Button ID changed to #sign-in-button
 *   - Traditional healing: Find alternative selector
 *   - Intent healing: "User wants to access the system" - finds login form,
 *     enters credentials, submits - regardless of button ID
 */
class IntentHealingEngine extends events_1.EventEmitter {
    config;
    strategies = new Map();
    healingHistory = [];
    learnedPatterns = new Map();
    nextAttemptId = 0;
    constructor(config) {
        super();
        this.config = {
            enableSemanticAnalysis: config?.enableSemanticAnalysis ?? true,
            enableNLU: config?.enableNLU ?? true,
            confidenceThreshold: config?.confidenceThreshold ?? 0.7,
            maxAttempts: config?.maxAttempts ?? 5,
            enableLearning: config?.enableLearning ?? true,
            timeout: config?.timeout ?? 30000,
            verbose: config?.verbose ?? false,
        };
        // Initialize built-in strategies
        this.initializeStrategies();
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // 🎯 INTENT PARSING
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Parse natural language description into semantic intent
     */
    parseIntent(description) {
        const id = `intent_${++this.nextAttemptId}_${Date.now().toString(36)}`;
        // Determine category from description
        const category = this.detectCategory(description);
        // Extract goal and constraints
        const { goal, constraints } = this.extractGoalAndConstraints(description);
        const intent = {
            id,
            category,
            description,
            goal,
            constraints,
            priority: this.calculatePriority(category, description),
            confidence: this.calculateIntentConfidence(description, category),
        };
        this.emit('intentParsed', intent);
        this.log(`Intent parsed: ${intent.goal} (${category})`);
        return intent;
    }
    /**
     * Detect intent category from description
     */
    detectCategory(description) {
        const lower = description.toLowerCase();
        // Authentication patterns
        if (/\b(login|sign\s*in|authenticate|log\s*in|access|credentials)\b/.test(lower)) {
            return 'authentication';
        }
        if (/\b(logout|sign\s*out|log\s*out|exit|end\s*session)\b/.test(lower)) {
            return 'authentication';
        }
        // Navigation patterns
        if (/\b(navigate|go\s*to|visit|open|load|redirect)\b/.test(lower)) {
            return 'navigation';
        }
        // Data entry patterns
        if (/\b(enter|type|fill|input|write|set|provide)\b/.test(lower)) {
            return 'data_entry';
        }
        // Data retrieval patterns
        if (/\b(read|get|extract|retrieve|fetch|find|see|check)\b/.test(lower)) {
            return 'data_retrieval';
        }
        // Assertion patterns
        if (/\b(verify|assert|expect|should|must|confirm|validate)\b/.test(lower)) {
            return 'assertion';
        }
        // Wait patterns
        if (/\b(wait|until|after|before|when|once)\b/.test(lower)) {
            return 'wait';
        }
        // Interaction patterns (default)
        return 'interaction';
    }
    /**
     * Extract goal and constraints from description
     */
    extractGoalAndConstraints(description) {
        const constraints = [];
        let goal = description;
        // Extract "with" constraints
        const withMatch = description.match(/\bwith\s+(.+?)(?:\band\b|\bor\b|$)/i);
        if (withMatch) {
            constraints.push(`with: ${withMatch[1].trim()}`);
            goal = goal.replace(withMatch[0], '').trim();
        }
        // Extract "using" constraints
        const usingMatch = description.match(/\busing\s+(.+?)(?:\band\b|\bor\b|$)/i);
        if (usingMatch) {
            constraints.push(`using: ${usingMatch[1].trim()}`);
            goal = goal.replace(usingMatch[0], '').trim();
        }
        // Extract timeout constraints
        const timeoutMatch = description.match(/\b(within|timeout|max)\s*:?\s*(\d+)\s*(ms|s|seconds?|milliseconds?)?/i);
        if (timeoutMatch) {
            constraints.push(`timeout: ${timeoutMatch[2]}${timeoutMatch[3] || 'ms'}`);
        }
        // Normalize goal
        goal = goal
            .replace(/^(i\s+want\s+to|please|need\s+to|should)\s+/i, '')
            .replace(/\s+$/, '')
            .trim();
        return { goal, constraints };
    }
    /**
     * Calculate priority based on category and description
     */
    calculatePriority(category, description) {
        const basePriorities = {
            authentication: 100,
            assertion: 90,
            data_entry: 80,
            navigation: 70,
            data_retrieval: 60,
            interaction: 50,
            wait: 40,
            configuration: 30,
        };
        let priority = basePriorities[category];
        // Boost for critical keywords
        if (/\b(critical|must|required|important)\b/i.test(description)) {
            priority += 20;
        }
        return Math.min(100, priority);
    }
    /**
     * Calculate confidence in intent detection
     */
    calculateIntentConfidence(description, category) {
        let confidence = 0.5;
        // Longer, more specific descriptions increase confidence
        const words = description.split(/\s+/).length;
        confidence += Math.min(0.2, words * 0.02);
        // Category-specific keywords boost confidence
        const categoryKeywords = {
            authentication: [/login/i, /password/i, /username/i, /credentials/i],
            navigation: [/navigate/i, /page/i, /url/i, /open/i],
            data_entry: [/enter/i, /type/i, /fill/i, /input/i, /field/i],
            data_retrieval: [/read/i, /get/i, /value/i, /text/i],
            interaction: [/click/i, /press/i, /button/i, /link/i],
            assertion: [/verify/i, /assert/i, /expect/i, /should/i],
            wait: [/wait/i, /until/i, /visible/i, /loaded/i],
            configuration: [/config/i, /setting/i, /option/i],
        };
        const keywords = categoryKeywords[category] || [];
        const matchCount = keywords.filter(k => k.test(description)).length;
        confidence += matchCount * 0.1;
        return Math.min(0.99, confidence);
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // 🔍 PAGE ANALYSIS
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Analyze page semantically
     */
    async analyzePage(page) {
        // This would be implemented with actual DOM analysis
        // Here we provide the structure for integration
        const elements = await this.detectSemanticElements(page);
        const forms = await this.detectForms(page, elements);
        const modals = await this.detectModals(page, elements);
        const navigation = await this.detectNavigation(page, elements);
        return { elements, forms, modals, navigation };
    }
    /**
     * Detect semantic elements on page
     */
    async detectSemanticElements(page) {
        // Extract elements from page context
        return page.elements || [];
    }
    /**
     * Detect forms and their purposes
     */
    async detectForms(page, elements) {
        const forms = [];
        // Find form containers
        const formElements = elements.filter(e => e.tagName === 'FORM');
        for (const formEl of formElements) {
            // Find fields within form
            const fields = elements.filter(e => this.isInputElement(e) &&
                this.isWithinElement(e, formEl));
            // Determine form purpose
            const purpose = this.detectFormPurpose(fields);
            // Find buttons
            const submitButton = elements.find(e => e.semanticType === 'submit_button' &&
                this.isWithinElement(e, formEl));
            const cancelButton = elements.find(e => e.semanticType === 'cancel_button' &&
                this.isWithinElement(e, formEl));
            forms.push({
                selector: formEl.selector,
                fields,
                submitButton,
                cancelButton,
                purpose,
            });
        }
        return forms;
    }
    /**
     * Detect form purpose from fields
     */
    detectFormPurpose(fields) {
        const hasPassword = fields.some(f => f.semanticType === 'password_field');
        const hasUsername = fields.some(f => f.semanticType === 'username_field' ||
            f.semanticType === 'email_field');
        const hasSearch = fields.some(f => f.semanticType === 'search_field');
        if (hasPassword && hasUsername) {
            // Check for registration indicators
            const hasConfirmPassword = fields.filter(f => f.semanticType === 'password_field').length > 1;
            return hasConfirmPassword ? 'registration' : 'login';
        }
        if (hasSearch)
            return 'search';
        if (fields.length > 2)
            return 'data_entry';
        return 'unknown';
    }
    /**
     * Detect modals/dialogs
     */
    async detectModals(page, elements) {
        return elements
            .filter(e => e.semanticType === 'modal_dialog' || e.role === 'dialog')
            .map(e => ({
            selector: e.selector,
            title: e.label,
            type: 'custom',
            visible: e.isVisible,
            closeButton: elements.find(btn => btn.semanticType === 'cancel_button' &&
                this.isWithinElement(btn, e)),
        }));
    }
    /**
     * Detect navigation elements
     */
    async detectNavigation(page, elements) {
        return elements
            .filter(e => e.semanticType === 'navigation_link' || e.role === 'link')
            .map(e => ({
            selector: e.selector,
            label: e.label || e.ariaLabel || '',
            href: undefined, // Would be extracted from actual DOM
            isActive: false, // Would check against current URL
        }));
    }
    /**
     * Check if element is input type
     */
    isInputElement(element) {
        return ['INPUT', 'TEXTAREA', 'SELECT'].includes(element.tagName);
    }
    /**
     * Check if element is within another
     */
    isWithinElement(child, parent) {
        if (!child.boundingBox || !parent.boundingBox)
            return false;
        const c = child.boundingBox;
        const p = parent.boundingBox;
        return (c.x >= p.x &&
            c.y >= p.y &&
            c.x + c.width <= p.x + p.width &&
            c.y + c.height <= p.y + p.height);
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // 🔧 INTENT RESOLUTION
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Heal a failed test step using intent-based reasoning
     */
    async heal(originalSelector, intentDescription, page) {
        const startTime = Date.now();
        const attemptId = `heal_${++this.nextAttemptId}_${Date.now().toString(36)}`;
        this.emit('healingStarted', { attemptId, originalSelector, intentDescription });
        this.log(`Healing started: ${intentDescription}`);
        // Parse the intent
        const intent = this.parseIntent(intentDescription);
        // Check learned patterns first
        if (this.config.enableLearning) {
            const learned = this.learnedPatterns.get(this.createPatternKey(intent, page));
            if (learned && learned.confidence >= this.config.confidenceThreshold) {
                return this.createHealingAttempt(attemptId, originalSelector, intent, learned, startTime);
            }
        }
        // Analyze current page
        const pageAnalysis = await this.analyzePage(page);
        const enrichedPage = {
            ...page,
            ...pageAnalysis,
        };
        // Try resolution strategies
        const strategies = this.strategies.get(intent.category) || [];
        for (const strategy of strategies) {
            for (const pattern of strategy.patterns) {
                try {
                    const conditionMet = await pattern.condition(enrichedPage);
                    if (!conditionMet)
                        continue;
                    const result = await pattern.action(enrichedPage, intent);
                    if (result.success && result.confidence >= this.config.confidenceThreshold) {
                        // Learn from success
                        if (this.config.enableLearning) {
                            this.learnedPatterns.set(this.createPatternKey(intent, page), result);
                        }
                        return this.createHealingAttempt(attemptId, originalSelector, intent, result, startTime);
                    }
                }
                catch (error) {
                    this.log(`Strategy ${strategy.name} failed: ${error}`);
                }
            }
        }
        // Healing failed
        const failedAttempt = {
            id: attemptId,
            originalSelector,
            originalIntent: intent,
            success: false,
            duration: Date.now() - startTime,
            confidence: 0,
            timestamp: Date.now(),
        };
        this.healingHistory.push(failedAttempt);
        this.emit('healingFailed', failedAttempt);
        return failedAttempt;
    }
    /**
     * Create healing attempt record
     */
    createHealingAttempt(id, originalSelector, intent, result, startTime) {
        const attempt = {
            id,
            originalSelector,
            originalIntent: intent,
            newSelector: result.selector,
            newStrategy: result.strategy,
            success: true,
            duration: Date.now() - startTime,
            confidence: result.confidence,
            timestamp: Date.now(),
        };
        this.healingHistory.push(attempt);
        this.emit('healingSucceeded', attempt);
        this.log(`Healing succeeded: ${result.strategy} (${result.confidence.toFixed(2)})`);
        return attempt;
    }
    /**
     * Create pattern key for learning
     */
    createPatternKey(intent, page) {
        return `${intent.category}:${intent.goal}:${page.url}`;
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // 📚 STRATEGY MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Initialize built-in resolution strategies
     */
    initializeStrategies() {
        // Authentication strategies
        this.registerStrategy({
            name: 'login_form_detection',
            category: 'authentication',
            priority: 100,
            patterns: [
                {
                    condition: async (page) => {
                        const forms = page.forms || [];
                        return forms.some(f => f.purpose === 'login');
                    },
                    action: async (page, intent) => {
                        const loginForm = page.forms?.find(f => f.purpose === 'login');
                        if (!loginForm) {
                            return { success: false, strategy: 'login_form_detection', confidence: 0, reasoning: 'No login form found' };
                        }
                        const usernameField = loginForm.fields.find(f => f.semanticType === 'username_field' ||
                            f.semanticType === 'email_field');
                        return {
                            success: true,
                            strategy: 'login_form_detection',
                            selector: usernameField?.selector,
                            action: 'focus_and_type',
                            confidence: 0.9,
                            reasoning: 'Found login form with username field',
                        };
                    },
                },
                {
                    condition: async (page) => {
                        return page.elements.some(e => e.semanticType === 'login_button');
                    },
                    action: async (page, intent) => {
                        const loginButton = page.elements.find(e => e.semanticType === 'login_button');
                        return {
                            success: true,
                            strategy: 'login_button_detection',
                            selector: loginButton?.selector,
                            action: 'click',
                            confidence: 0.85,
                            reasoning: 'Found semantic login button',
                        };
                    },
                },
            ],
        });
        // Navigation strategies
        this.registerStrategy({
            name: 'navigation_link_detection',
            category: 'navigation',
            priority: 90,
            patterns: [
                {
                    condition: async (page) => {
                        return (page.navigation?.length || 0) > 0;
                    },
                    action: async (page, intent) => {
                        // Find navigation that matches intent goal
                        const goalWords = intent.goal.toLowerCase().split(/\s+/);
                        const matchingNav = page.navigation?.find(nav => goalWords.some(word => nav.label.toLowerCase().includes(word)));
                        if (!matchingNav) {
                            return { success: false, strategy: 'navigation_link_detection', confidence: 0, reasoning: 'No matching navigation' };
                        }
                        return {
                            success: true,
                            strategy: 'navigation_link_detection',
                            selector: matchingNav.selector,
                            action: 'click',
                            confidence: 0.8,
                            reasoning: `Found navigation link: ${matchingNav.label}`,
                        };
                    },
                },
            ],
        });
        // Interaction strategies
        this.registerStrategy({
            name: 'semantic_button_detection',
            category: 'interaction',
            priority: 80,
            patterns: [
                {
                    condition: async () => true,
                    action: async (page, intent) => {
                        // Find button with matching label/aria
                        const goalWords = intent.goal.toLowerCase().split(/\s+/);
                        const buttons = page.elements.filter(e => e.tagName === 'BUTTON' ||
                            e.role === 'button' ||
                            (e.tagName === 'A' && e.role === 'link'));
                        const matchingButton = buttons.find(btn => {
                            const label = (btn.label || btn.ariaLabel || '').toLowerCase();
                            return goalWords.some(word => label.includes(word));
                        });
                        if (!matchingButton) {
                            return { success: false, strategy: 'semantic_button_detection', confidence: 0, reasoning: 'No matching button' };
                        }
                        return {
                            success: true,
                            strategy: 'semantic_button_detection',
                            selector: matchingButton.selector,
                            action: 'click',
                            confidence: 0.75,
                            reasoning: `Found button with label: ${matchingButton.label}`,
                        };
                    },
                },
            ],
        });
        // Data entry strategies
        this.registerStrategy({
            name: 'form_field_detection',
            category: 'data_entry',
            priority: 85,
            patterns: [
                {
                    condition: async (page) => {
                        return page.elements.some(e => this.isInputElement(e));
                    },
                    action: async (page, intent) => {
                        const goalWords = intent.goal.toLowerCase().split(/\s+/);
                        const inputs = page.elements.filter(e => this.isInputElement(e));
                        // Match by label, placeholder, or aria
                        const matchingInput = inputs.find(inp => {
                            const text = [
                                inp.label,
                                inp.placeholder,
                                inp.ariaLabel,
                            ].filter(Boolean).join(' ').toLowerCase();
                            return goalWords.some(word => text.includes(word));
                        });
                        if (!matchingInput) {
                            return { success: false, strategy: 'form_field_detection', confidence: 0, reasoning: 'No matching input' };
                        }
                        return {
                            success: true,
                            strategy: 'form_field_detection',
                            selector: matchingInput.selector,
                            action: 'type',
                            confidence: 0.85,
                            reasoning: `Found input field: ${matchingInput.label || matchingInput.placeholder}`,
                        };
                    },
                },
            ],
        });
    }
    /**
     * Register a new resolution strategy
     */
    registerStrategy(strategy) {
        const existing = this.strategies.get(strategy.category) || [];
        existing.push(strategy);
        // Sort by priority
        existing.sort((a, b) => b.priority - a.priority);
        this.strategies.set(strategy.category, existing);
        this.emit('strategyRegistered', { name: strategy.name, category: strategy.category });
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // 📊 STATISTICS & UTILITIES
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Get healing statistics
     */
    getStats() {
        const successful = this.healingHistory.filter(h => h.success);
        const failed = this.healingHistory.filter(h => !h.success);
        const totalStrategies = Array.from(this.strategies.values())
            .reduce((sum, arr) => sum + arr.length, 0);
        return {
            totalAttempts: this.healingHistory.length,
            successfulHealings: successful.length,
            failedHealings: failed.length,
            successRate: this.healingHistory.length > 0
                ? successful.length / this.healingHistory.length
                : 0,
            avgDuration: this.healingHistory.length > 0
                ? this.healingHistory.reduce((sum, h) => sum + h.duration, 0) / this.healingHistory.length
                : 0,
            avgConfidence: successful.length > 0
                ? successful.reduce((sum, h) => sum + h.confidence, 0) / successful.length
                : 0,
            strategiesRegistered: totalStrategies,
            learnedPatterns: this.learnedPatterns.size,
        };
    }
    /**
     * Get healing history
     */
    getHistory() {
        return [...this.healingHistory];
    }
    /**
     * Clear learned patterns
     */
    clearLearnedPatterns() {
        this.learnedPatterns.clear();
        this.emit('patternsCleared');
    }
    /**
     * Update configuration
     */
    updateConfig(config) {
        this.config = { ...this.config, ...config };
        this.emit('configUpdated', this.config);
    }
    /**
     * Log message if verbose
     */
    log(message) {
        if (this.config.verbose) {
            console.log(`[IntentHealingEngine] ${message}`);
        }
    }
}
exports.IntentHealingEngine = IntentHealingEngine;
// Export singleton for global use
let healingEngineInstance = null;
function getIntentHealingEngine() {
    if (!healingEngineInstance) {
        healingEngineInstance = new IntentHealingEngine();
    }
    return healingEngineInstance;
}
exports.default = IntentHealingEngine;
