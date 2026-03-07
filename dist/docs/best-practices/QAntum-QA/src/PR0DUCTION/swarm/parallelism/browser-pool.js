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
exports.BrowserPoolManager = void 0;
const events_1 = require("events");
const id_generator_1 = require("../utils/id-generator");
/**
 * Browser Pool Manager
 *
 * Features:
 * - Dynamic browser/context scaling
 * - Automatic load balancing
 * - Health monitoring
 * - Resource cleanup
 */
class BrowserPoolManager extends events_1.EventEmitter {
    /** Configuration */
    config;
    /** Browser instances */
    browsers = new Map();
    /** All contexts (for quick lookup) */
    contexts = new Map();
    /** Waiting queue */
    waitingQueue = [];
    /** Cleanup timer */
    cleanupTimer = null;
    /** Playwright instance (set externally) */
    playwright = null;
    /** Statistics */
    stats = {
        totalContextsCreated: 0,
        totalTasksExecuted: 0,
        currentBrowsers: 0,
        currentContexts: 0,
        peakContexts: 0,
        avgTasksPerContext: 0,
    };
    constructor(config) {
        super();
        // Detect CPU cores for optimal parallelism
        const cpuCores = this.detectCpuCores();
        this.config = {
            maxBrowsers: config?.maxBrowsers || Math.max(2, Math.floor(cpuCores / 2)),
            maxContextsPerBrowser: config?.maxContextsPerBrowser || 4,
            browserType: config?.browserType || 'chromium',
            headless: config?.headless ?? true,
            contextTimeout: config?.contextTimeout || 60000,
            autoCleanup: config?.autoCleanup ?? true,
            cleanupInterval: config?.cleanupInterval || 60000,
            maxContextAge: config?.maxContextAge || 300000, // 5 minutes
            viewport: config?.viewport || { width: 1920, height: 1080 },
            verbose: config?.verbose ?? false,
        };
        this.log(`Browser pool configured for ${this.config.maxBrowsers} browsers (${cpuCores} CPU cores detected)`);
    }
    /**
     * Detect CPU cores
     */
    detectCpuCores() {
        try {
            const os = require('os');
            return os.cpus().length;
        }
        catch {
            return 4; // Default fallback
        }
    }
    /**
     * Initialize the pool with Playwright
     */
    async initialize(playwright) {
        this.playwright = playwright;
        // Create initial browser(s)
        await this.createBrowser();
        // Start cleanup timer
        if (this.config.autoCleanup) {
            this.startCleanupTimer();
        }
        this.emit('initialized', {
            browsers: this.browsers.size,
            maxCapacity: this.getMaxCapacity(),
        });
        this.log('Browser pool initialized');
    }
    /**
     * Get max capacity
     */
    getMaxCapacity() {
        return this.config.maxBrowsers * this.config.maxContextsPerBrowser;
    }
    /**
     * Create a new browser instance
     */
    async createBrowser() {
        if (this.browsers.size >= this.config.maxBrowsers) {
            this.log('Max browsers reached');
            return null;
        }
        if (!this.playwright) {
            throw new Error('Playwright not initialized');
        }
        try {
            const browserId = `browser_${Date.now().toString(36)}`;
            const browser = await this.playwright[this.config.browserType].launch({
                headless: this.config.headless,
            });
            const instance = {
                id: browserId,
                browser,
                contexts: new Map(),
                createdAt: new Date(),
            };
            this.browsers.set(browserId, instance);
            this.stats.currentBrowsers++;
            this.emit('browserCreated', { browserId });
            this.log(`Browser created: ${browserId}`);
            return instance;
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            this.log(`Failed to create browser: ${message}`);
            this.emit('error', { type: 'browserCreation', error });
            return null;
        }
    }
    /**
     * Acquire a browser context
     */
    async acquire(agentId) {
        // Try to find available context
        let context = this.findAvailableContext();
        if (!context) {
            // Try to create new context
            context = await this.createContext();
        }
        if (!context) {
            // Queue the request
            return this.queueRequest();
        }
        // Mark as busy
        context.status = 'busy';
        context.assignedAgent = agentId;
        context.lastUsed = new Date();
        this.emit('contextAcquired', {
            contextId: context.id,
            agentId,
        });
        return context;
    }
    /**
     * Release a browser context
     */
    release(contextId) {
        const context = this.contexts.get(contextId);
        if (!context)
            return;
        context.status = 'available';
        context.assignedAgent = undefined;
        context.taskCount++;
        this.stats.totalTasksExecuted++;
        this.emit('contextReleased', { contextId });
        // Check waiting queue
        this.processWaitingQueue();
    }
    /**
     * Find an available context
     */
    findAvailableContext() {
        for (const context of this.contexts.values()) {
            if (context.status === 'available') {
                return context;
            }
        }
        return null;
    }
    /**
     * Create a new context
     */
    async createContext() {
        // Find browser with capacity
        let targetBrowser = this.findBrowserWithCapacity();
        if (!targetBrowser) {
            // Create new browser
            targetBrowser = await this.createBrowser();
        }
        if (!targetBrowser) {
            return null;
        }
        try {
            const contextId = (0, id_generator_1.generateContextId)();
            const browserContext = await targetBrowser.browser.newContext({
                viewport: this.config.viewport,
            });
            const page = await browserContext.newPage();
            const wrapper = {
                id: contextId,
                browserId: targetBrowser.id,
                context: browserContext,
                page,
                status: 'available',
                createdAt: new Date(),
                taskCount: 0,
            };
            targetBrowser.contexts.set(contextId, wrapper);
            this.contexts.set(contextId, wrapper);
            this.stats.totalContextsCreated++;
            this.stats.currentContexts++;
            this.stats.peakContexts = Math.max(this.stats.peakContexts, this.stats.currentContexts);
            this.emit('contextCreated', {
                contextId,
                browserId: targetBrowser.id,
            });
            this.log(`Context created: ${contextId}`);
            return wrapper;
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            this.log(`Failed to create context: ${message}`);
            this.emit('error', { type: 'contextCreation', error });
            return null;
        }
    }
    /**
     * Find browser with capacity
     */
    findBrowserWithCapacity() {
        for (const browser of this.browsers.values()) {
            if (browser.contexts.size < this.config.maxContextsPerBrowser) {
                return browser;
            }
        }
        return null;
    }
    /**
     * Queue request when no context available
     */
    queueRequest() {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                const index = this.waitingQueue.findIndex(w => w.resolve === resolve);
                if (index > -1) {
                    this.waitingQueue.splice(index, 1);
                    reject(new Error('Context acquisition timeout'));
                }
            }, this.config.contextTimeout);
            this.waitingQueue.push({ resolve, reject, timeout });
            this.emit('requestQueued', { queueLength: this.waitingQueue.length });
        });
    }
    /**
     * Process waiting queue
     */
    processWaitingQueue() {
        while (this.waitingQueue.length > 0) {
            const context = this.findAvailableContext();
            if (!context)
                break;
            const waiting = this.waitingQueue.shift();
            clearTimeout(waiting.timeout);
            context.status = 'busy';
            context.lastUsed = new Date();
            waiting.resolve(context);
        }
    }
    /**
     * Destroy a context
     */
    async destroyContext(contextId) {
        const context = this.contexts.get(contextId);
        if (!context)
            return;
        try {
            await context.page.close();
            await context.context.close();
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            this.log(`Error closing context: ${message}`);
        }
        const browser = this.browsers.get(context.browserId);
        if (browser) {
            browser.contexts.delete(contextId);
        }
        this.contexts.delete(contextId);
        this.stats.currentContexts--;
        this.emit('contextDestroyed', { contextId });
        this.log(`Context destroyed: ${contextId}`);
    }
    /**
     * Destroy a browser
     */
    async destroyBrowser(browserId) {
        const browser = this.browsers.get(browserId);
        if (!browser)
            return;
        // Destroy all contexts
        for (const contextId of browser.contexts.keys()) {
            await this.destroyContext(contextId);
        }
        try {
            await browser.browser.close();
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            this.log(`Error closing browser: ${message}`);
        }
        this.browsers.delete(browserId);
        this.stats.currentBrowsers--;
        this.emit('browserDestroyed', { browserId });
        this.log(`Browser destroyed: ${browserId}`);
    }
    /**
     * Start cleanup timer
     */
    startCleanupTimer() {
        this.stopCleanupTimer();
        this.cleanupTimer = setInterval(() => {
            this.cleanup();
        }, this.config.cleanupInterval);
    }
    /**
     * Stop cleanup timer
     */
    stopCleanupTimer() {
        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
            this.cleanupTimer = null;
        }
    }
    /**
     * Cleanup old/unused contexts
     */
    async cleanup() {
        const now = Date.now();
        const maxAge = this.config.maxContextAge;
        const toDestroy = [];
        for (const context of this.contexts.values()) {
            // Skip busy contexts
            if (context.status === 'busy')
                continue;
            const age = now - context.createdAt.getTime();
            const idleTime = context.lastUsed
                ? now - context.lastUsed.getTime()
                : age;
            // Destroy if too old or idle too long
            if (age > maxAge || idleTime > maxAge / 2) {
                toDestroy.push(context.id);
            }
        }
        for (const contextId of toDestroy) {
            await this.destroyContext(contextId);
        }
        if (toDestroy.length > 0) {
            this.log(`Cleaned up ${toDestroy.length} contexts`);
        }
        // Update stats
        if (this.stats.totalContextsCreated > 0) {
            this.stats.avgTasksPerContext =
                this.stats.totalTasksExecuted / this.stats.totalContextsCreated;
        }
    }
    /**
     * Execute task in parallel across multiple contexts
     */
    async executeParallel(tasks, agentId) {
        const results = [];
        // Acquire contexts for all tasks
        const contextPromises = tasks.map(() => this.acquire(agentId));
        const contexts = await Promise.all(contextPromises);
        try {
            // Execute tasks in parallel
            const taskPromises = tasks.map(async (task, index) => {
                const context = contexts[index];
                try {
                    const result = await task(context.page);
                    return { success: true, result };
                }
                catch (error) {
                    const message = error instanceof Error ? error.message : String(error);
                    return { success: false, error: message };
                }
            });
            results.push(...await Promise.all(taskPromises));
        }
        finally {
            // Release all contexts
            for (const context of contexts) {
                this.release(context.id);
            }
        }
        return results;
    }
    /**
     * Get context by ID
     */
    getContext(contextId) {
        return this.contexts.get(contextId);
    }
    /**
     * Get all contexts
     */
    getAllContexts() {
        return Array.from(this.contexts.values()).map(ctx => ({
            id: ctx.id,
            browserId: ctx.browserId,
            currentUrl: ctx.currentUrl,
            status: ctx.status,
            assignedAgent: ctx.assignedAgent,
            createdAt: ctx.createdAt,
            lastUsed: ctx.lastUsed,
        }));
    }
    /**
     * Get statistics
     */
    getStats() {
        const available = Array.from(this.contexts.values())
            .filter(c => c.status === 'available').length;
        const busy = this.stats.currentContexts - available;
        return {
            ...this.stats,
            availableContexts: available,
            busyContexts: busy,
            queueLength: this.waitingQueue.length,
            utilization: this.stats.currentContexts > 0
                ? busy / this.stats.currentContexts
                : 0,
        };
    }
    /**
     * Shutdown the pool
     */
    async shutdown() {
        this.log('Shutting down browser pool...');
        this.stopCleanupTimer();
        // Reject all waiting requests
        for (const waiting of this.waitingQueue) {
            clearTimeout(waiting.timeout);
            waiting.reject(new Error('Pool shutdown'));
        }
        this.waitingQueue = [];
        // Destroy all browsers
        const browserIds = Array.from(this.browsers.keys());
        for (const browserId of browserIds) {
            await this.destroyBrowser(browserId);
        }
        this.emit('shutdown', { stats: this.getStats() });
        this.log('Browser pool shutdown complete');
    }
    /**
     * Log if verbose
     */
    log(message, ...args) {
        if (this.config.verbose) {
            console.log(`[BrowserPool] ${message}`, ...args);
        }
    }
}
exports.BrowserPoolManager = BrowserPoolManager;
exports.default = BrowserPoolManager;
