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
 * For licensing inquiries: dimitar.papazov@QAntum.dev
 * ═══════════════════════════════════════════════════════════════════════════════
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecutorAgent = void 0;
const base_agent_1 = require("./base-agent");
/**
 * Type guard to check if page has browser-like interface
 */
function isBrowserPage(page) {
    return (typeof page === 'object' &&
        page !== null &&
        typeof page.goto === 'function' &&
        typeof page.$ === 'function');
}
/**
 * Executor Agent - Task Execution
 *
 * Responsibilities:
 * - Execute browser automation tasks
 * - Run local LLM inference
 * - Report results back to orchestrator
 * - Handle retries and fallbacks
 */
class ExecutorAgent extends base_agent_1.BaseAgent {
    /** Browser page reference (set externally) */
    page = null;
    /** Execution history for learning */
    executionHistory = [];
    /** Max history size */
    maxHistorySize = 500;
    /** Retry delay in ms */
    retryDelay = 1000;
    constructor(config) {
        super({ ...config, role: 'executor' });
    }
    /**
     * Set browser page reference
     */
    setPage(page) {
        this.page = page;
        this.log('Browser page reference set');
    }
    /**
     * Get browser page reference
     */
    getPage() {
        return this.page;
    }
    /**
     * Handle incoming message
     */
    async handleMessage(message) {
        switch (message.type) {
            case 'task':
                // Execute task
                const result = await this.executeTask(message.payload.task);
                return this.createMessage(message.from, 'result', { result }, message.traceId, message.spanId);
            case 'feedback':
                // Retry with adjustments
                const retryResult = await this.retryWithFeedback(message.payload.task, message.payload.feedback);
                return this.createMessage(message.from, 'result', { result: retryResult }, message.traceId, message.spanId);
            default:
                return null;
        }
    }
    /**
     * Execute a task
     */
    async executeTask(task) {
        const startTime = Date.now();
        const reasoning = [];
        this.log(`Executing task: ${task.type} - ${task.target}`);
        this.emit('taskStarted', { taskId: task.id, type: task.type });
        try {
            let result;
            let selectorUsed;
            let confidence = 0.8;
            switch (task.type) {
                case 'navigate':
                    result = await this.executeNavigate(task, reasoning);
                    confidence = 0.95;
                    break;
                case 'click':
                    const clickResult = await this.executeClick(task, reasoning);
                    result = clickResult.result;
                    selectorUsed = clickResult.selector;
                    confidence = clickResult.confidence;
                    break;
                case 'fill':
                    const fillResult = await this.executeFill(task, reasoning);
                    result = fillResult.result;
                    selectorUsed = fillResult.selector;
                    confidence = fillResult.confidence;
                    break;
                case 'extract':
                    result = await this.executeExtract(task, reasoning);
                    confidence = 0.85;
                    break;
                case 'validate':
                    result = await this.executeValidate(task, reasoning);
                    confidence = 0.9;
                    break;
                case 'custom':
                    result = await this.executeCustom(task, reasoning);
                    confidence = 0.7;
                    break;
                default:
                    throw new Error(`Unknown task type: ${task.type}`);
            }
            const taskResult = {
                taskId: task.id,
                traceId: task.traceId,
                success: true,
                data: result,
                duration: Date.now() - startTime,
                executedBy: this.id,
                reasoning,
                selectorUsed,
                confidence,
                completedAt: new Date(),
            };
            this.storeResult(taskResult);
            this.emit('taskCompleted', taskResult);
            return taskResult;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            const taskResult = {
                taskId: task.id,
                traceId: task.traceId,
                success: false,
                error: errorMessage,
                duration: Date.now() - startTime,
                executedBy: this.id,
                reasoning: [...reasoning, `Error: ${errorMessage}`],
                completedAt: new Date(),
            };
            this.storeResult(taskResult);
            this.emit('taskFailed', taskResult);
            // Retry if configured
            if (task.retries && task.retries > 0) {
                this.log(`Retrying task (${task.retries} attempts remaining)`);
                await this.delay(this.retryDelay);
                return this.executeTask({
                    ...task,
                    retries: task.retries - 1,
                });
            }
            return taskResult;
        }
    }
    /**
     * Execute navigation task
     */
    async executeNavigate(task, reasoning) {
        reasoning.push(`Navigating to: ${task.target}`);
        if (!this.page) {
            reasoning.push('No browser page available, simulating navigation');
            return { url: task.target, simulated: true };
        }
        await this.page.goto(task.target, {
            waitUntil: 'domcontentloaded',
            timeout: task.params?.timeout || 30000
        });
        const currentUrl = this.page.url();
        reasoning.push(`Navigation complete, current URL: ${currentUrl}`);
        return { url: currentUrl, success: true };
    }
    /**
     * Execute click task
     */
    async executeClick(task, reasoning) {
        reasoning.push(`Finding element to click: ${task.target}`);
        const selectors = this.generateSelectors(task.target, 'click');
        let usedSelector = '';
        let confidence = 0;
        if (!this.page) {
            reasoning.push('No browser page available, simulating click');
            usedSelector = selectors[0];
            confidence = 0.5;
            return {
                result: { clicked: task.target, simulated: true },
                selector: usedSelector,
                confidence
            };
        }
        for (const selector of selectors) {
            try {
                reasoning.push(`Trying selector: ${selector}`);
                const element = await this.page.$(selector);
                if (element) {
                    await element.click();
                    usedSelector = selector;
                    confidence = this.calculateSelectorConfidence(selector, selectors.indexOf(selector));
                    reasoning.push(`Click successful with selector: ${selector}`);
                    break;
                }
            }
            catch (e) {
                reasoning.push(`Selector failed: ${selector}`);
            }
        }
        if (!usedSelector) {
            throw new Error(`Could not find element: ${task.target}`);
        }
        return {
            result: { clicked: task.target, selector: usedSelector },
            selector: usedSelector,
            confidence
        };
    }
    /**
     * Execute fill task
     */
    async executeFill(task, reasoning) {
        reasoning.push(`Finding field to fill: ${task.target}`);
        const value = task.params?.value || '';
        const selectors = this.generateSelectors(task.target, 'fill');
        let usedSelector = '';
        let confidence = 0;
        if (!this.page) {
            reasoning.push('No browser page available, simulating fill');
            usedSelector = selectors[0];
            confidence = 0.5;
            return {
                result: { filled: task.target, value, simulated: true },
                selector: usedSelector,
                confidence
            };
        }
        for (const selector of selectors) {
            try {
                reasoning.push(`Trying selector: ${selector}`);
                const element = await this.page.$(selector);
                if (element) {
                    await element.fill(value);
                    usedSelector = selector;
                    confidence = this.calculateSelectorConfidence(selector, selectors.indexOf(selector));
                    reasoning.push(`Fill successful with selector: ${selector}`);
                    break;
                }
            }
            catch (e) {
                reasoning.push(`Selector failed: ${selector}`);
            }
        }
        if (!usedSelector) {
            throw new Error(`Could not find field: ${task.target}`);
        }
        return {
            result: { filled: task.target, value, selector: usedSelector },
            selector: usedSelector,
            confidence
        };
    }
    /**
     * Execute extract task
     */
    async executeExtract(task, reasoning) {
        reasoning.push(`Extracting data from: ${task.target}`);
        if (!this.page) {
            reasoning.push('No browser page available, simulating extraction');
            return { extracted: [], simulated: true };
        }
        const selector = task.params?.selector || task.target;
        const elements = await this.page.$$(selector);
        const extracted = [];
        for (const el of elements) {
            const text = await el.textContent();
            const html = await el.innerHTML();
            extracted.push({ text, html });
        }
        reasoning.push(`Extracted ${extracted.length} elements`);
        return { extracted, count: extracted.length };
    }
    /**
     * Execute validate task
     */
    async executeValidate(task, reasoning) {
        reasoning.push(`Validating: ${task.target}`);
        const expected = task.params?.expected;
        const checks = task.params?.checks || [];
        if (!this.page) {
            reasoning.push('No browser page available, simulating validation');
            return { valid: true, simulated: true };
        }
        const results = {};
        // Check expected content
        if (expected) {
            const pageContent = await this.page.content();
            results['expectedContent'] = pageContent.includes(expected);
            reasoning.push(`Expected content "${expected}": ${results['expectedContent']}`);
        }
        // Run custom checks
        for (const check of checks) {
            if (check.selector) {
                const element = await this.page.$(check.selector);
                results[check.name || check.selector] = !!element;
                reasoning.push(`Check "${check.name || check.selector}": ${!!element}`);
            }
        }
        const allValid = Object.values(results).every(v => v);
        reasoning.push(`Validation result: ${allValid ? 'PASS' : 'FAIL'}`);
        return { valid: allValid, results };
    }
    /**
     * Execute custom task
     */
    async executeCustom(task, reasoning) {
        reasoning.push(`Executing custom task: ${task.target}`);
        // Custom tasks are handled based on context
        const context = task.params?.context || {};
        reasoning.push('Custom task executed (placeholder)');
        return { custom: true, context };
    }
    /**
     * Retry task with feedback adjustments
     */
    async retryWithFeedback(task, feedback) {
        this.log(`Retrying task with feedback: ${feedback}`);
        // Adjust task based on feedback
        const adjustedTask = {
            ...task,
            params: {
                ...task.params,
                feedbackApplied: feedback,
                alternativeStrategy: true,
            },
        };
        return this.executeTask(adjustedTask);
    }
    /**
     * Generate possible selectors for a target
     */
    generateSelectors(target, action) {
        const selectors = [];
        const targetLower = target.toLowerCase();
        // Try exact match
        selectors.push(`[data-testid="${target}"]`);
        selectors.push(`#${target.replace(/\s+/g, '-')}`);
        // Try by text content (for clicks)
        if (action === 'click') {
            selectors.push(`text="${target}"`);
            selectors.push(`button:has-text("${target}")`);
            selectors.push(`a:has-text("${target}")`);
            selectors.push(`[role="button"]:has-text("${target}")`);
        }
        // Try by label (for fills)
        if (action === 'fill') {
            selectors.push(`input[name="${target}"]`);
            selectors.push(`input[placeholder*="${target}"]`);
            selectors.push(`label:has-text("${target}") + input`);
            selectors.push(`[aria-label="${target}"]`);
        }
        // Try by common patterns
        if (targetLower.includes('login') || targetLower.includes('submit')) {
            selectors.push('button[type="submit"]');
            selectors.push('input[type="submit"]');
        }
        if (targetLower.includes('username') || targetLower.includes('email')) {
            selectors.push('input[type="email"]');
            selectors.push('input[name="email"]');
            selectors.push('input[name="username"]');
        }
        if (targetLower.includes('password')) {
            selectors.push('input[type="password"]');
            selectors.push('input[name="password"]');
        }
        return selectors;
    }
    /**
     * Calculate confidence based on selector type and position
     */
    calculateSelectorConfidence(selector, position) {
        let base = 0.9 - (position * 0.05);
        // High confidence for data-testid
        if (selector.includes('data-testid')) {
            base = 0.98;
        }
        // High confidence for ID
        else if (selector.startsWith('#')) {
            base = 0.95;
        }
        // Medium confidence for text-based
        else if (selector.includes('text=') || selector.includes('has-text')) {
            base = 0.85;
        }
        return Math.max(0.5, Math.min(1, base));
    }
    /**
     * Store result in history
     */
    storeResult(result) {
        this.executionHistory.push(result);
        if (this.executionHistory.length > this.maxHistorySize) {
            this.executionHistory.shift();
        }
    }
    /**
     * Delay helper
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    /**
     * Get execution history
     */
    getExecutionHistory() {
        return [...this.executionHistory];
    }
    /**
     * Get success rate
     */
    getSuccessRate() {
        if (this.executionHistory.length === 0)
            return 0;
        const successful = this.executionHistory.filter(r => r.success).length;
        return successful / this.executionHistory.length;
    }
}
exports.ExecutorAgent = ExecutorAgent;
exports.default = ExecutorAgent;
