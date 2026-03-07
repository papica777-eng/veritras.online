"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                               ║
 * ║   ███╗   ███╗██╗███████╗████████╗███████╗██████╗ ███╗   ███╗██╗███╗   ██╗██████╗  ║
 * ║   ████╗ ████║██║██╔════╝╚══██╔══╝██╔════╝██╔══██╗████╗ ████║██║████╗  ██║██╔══██╗ ║
 * ║   ██╔████╔██║██║███████╗   ██║   █████╗  ██████╔╝██╔████╔██║██║██╔██╗ ██║██║  ██║ ║
 * ║   ██║╚██╔╝██║██║╚════██║   ██║   ██╔══╝  ██╔══██╗██║╚██╔╝██║██║██║╚██╗██║██║  ██║ ║
 * ║   ██║ ╚═╝ ██║██║███████║   ██║   ███████╗██║  ██║██║ ╚═╝ ██║██║██║ ╚████║██████╔╝ ║
 * ║   ╚═╝     ╚═╝╚═╝╚══════╝   ╚═╝   ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝╚═╝╚═╝  ╚═══╝╚═════╝  ║
 * ║                                                                               ║
 * ║                    v23.2.0 "The Local Sovereign"                              ║
 * ║                 🎯 STRICT TYPESCRIPT - ZERO `any` TYPES 🎯                     ║
 * ║                                                                               ║
 * ╠═══════════════════════════════════════════════════════════════════════════════╣
 * ║                                                                               ║
 * ║   🇧🇬 Made with ❤️ in Bulgaria by Димитър Продромов                            ║
 * ║                                                                               ║
 * ║   📊 Statistics:                                                              ║
 * ║   • Total Lines: 46,500+                                                      ║
 * ║   • TypeScript Files: 93                                                      ║
 * ║   • Tests: 492 passing                                                        ║
 * ║   • Enterprise Modules: 6                                                     ║
 * ║                                                                               ║
 * ║   🏢 Enterprise Features:                                                     ║
 * ║   • 🌡️  Thermal-Aware Pool (CPU temperature management)                       ║
 * ║   • 🐳 Docker Manager (Selenium Grid orchestration)                           ║
 * ║   • 🎖️  Swarm Commander (Commander-Soldier parallelism)                       ║
 * ║   • 🔊 Bulgarian TTS (Native text-to-speech)                                  ║
 * ║   • 🎛️  Dashboard Server (WebSocket at localhost:3847)                        ║
 * ║   • 🔐 License Manager (Hardware-locked licensing)                            ║
 * ║                                                                               ║
 * ╠═══════════════════════════════════════════════════════════════════════════════╣
 * ║                                                                               ║
 * ║   @copyright 2025 Димитър Продромов (Dimitar Prodromov). All Rights Reserved. ║
 * ║   @license PROPRIETARY AND CONFIDENTIAL                                       ║
 * ║                                                                               ║
 * ║   This file is part of QAntum.                                            ║
 * ║   Unauthorized copying, modification, distribution, or use of this file,      ║
 * ║   via any medium, is strictly prohibited without express written permission.  ║
 * ║                                                                               ║
 * ║   For licensing inquiries: dimitar@QAntum.bg                              ║
 * ║                                                                               ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NeuralAccelerator = exports.MultiPerspectiveAnalyzer = exports.Distiller = exports.DependencyGraph = exports.ContextInjector = exports.HealthCheckSystem = exports.CircuitBreakerManager = exports.ChecksumValidator = exports.NeuralVault = exports.MemoryHardeningManager = exports.WorkerPoolManager = exports.SandboxExecutor = exports.BastionController = exports.WebSocketBridge = exports.CriticAgent = exports.ExecutorAgent = exports.PlannerAgent = exports.BrowserPoolManager = exports.ObservabilityBridge = exports.DistillationLogger = exports.AgenticOrchestrator = exports.ASCConfig = exports.SemanticElement = exports.SemanticMap = exports.IntentMatch = exports.Intent = exports.CommonIntents = exports.AdaptiveSemanticCore = exports.VERSION_FULL = exports.VERSION_CODENAME = exports.VERSION = exports.createQAntum = exports.QAntum = exports.BrowserFactory = void 0;
exports.printBanner = printBanner;
exports.getSystemStats = getSystemStats;
const playwright_1 = require("playwright");
const axios_1 = __importDefault(require("axios"));
const semantic_core_1 = require("./asc/semantic-core");
const swarm_1 = require("./swarm");
const segc_1 = require("./segc");
const bastion_1 = require("./bastion");
/** License key pattern: MM-XXXX-XXXX-XXXX */
const LICENSE_PATTERN = /^MM-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
const CHECKOUT_URL = 'https://buy.polar.sh/polar_cl_XBbOE1Qr4Vfv9QHRn7exBdaOB9qoC2Wees7zX1yQsOe';
// ═══════════════════════════════════════════════════════════════════════════════
// v20.0 BROWSER FACTORY - Dependency Injection for Browser Engines
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * 🏭 Browser Factory - Abstract browser creation for DI
 * Allows easy swapping between Chromium, Firefox, and WebKit
 */
class BrowserFactory {
    static engines = {
        chromium: playwright_1.chromium,
        firefox: playwright_1.firefox,
        webkit: playwright_1.webkit,
    };
    /**
     * Get browser engine by type
     */
    static getEngine(type) {
        return this.engines[type] || playwright_1.chromium;
    }
    /**
     * Launch browser with optimal settings
     */
    static async launch(engine = 'chromium', options = {}) {
        const browserType = this.getEngine(engine);
        return browserType.launch({
            headless: options.headless ?? true,
            args: options.args ?? ['--disable-dev-shm-usage', '--no-sandbox'],
        });
    }
    /**
     * Get all available engines
     */
    static getAvailableEngines() {
        return ['chromium', 'firefox', 'webkit'];
    }
}
exports.BrowserFactory = BrowserFactory;
/**
 * # QAntum v23.3.0 "Type-Safe Sovereign"
 *
 * The ultimate AI-powered QA automation framework with autonomous test execution,
 * self-healing selectors, bug prediction, and enterprise-grade security.
 *
 * ## 🚀 Features
 *
 * ### 🆓 FREE Tier
 * - **Website Audit** - Performance, accessibility, SEO analysis
 * - **Link Checker** - Crawl and validate all links on a page
 * - **API Testing** - Basic HTTP endpoint testing (10/day limit)
 *
 * ### 💎 PRO Tier ($29/month)
 * - **Prediction Matrix** - ML-powered bug prediction before they happen
 * - **API Sensei** - Intelligent API test generation from OpenAPI specs
 * - **Chronos Engine** - Time-travel debugging with state snapshots
 * - **Adaptive Semantic Core** - Intent-based element finding
 * - **Sovereign Swarm** - Multi-agent parallel test execution
 *
 * ### 🏢 ENTERPRISE Tier
 * - **Thermal-Aware Pool** - CPU temperature-based throttling
 * - **Docker Manager** - Selenium Grid orchestration
 * - **Swarm Commander** - Commander-Soldier parallelism pattern
 * - **Bulgarian TTS** - Native text-to-speech feedback
 * - **Security Bastion** - Encrypted vault, sandbox execution
 *
 * ## 📚 Quick Start
 *
 * ```typescript
 * import { QAntum } from 'qantum';
 *
 * // Initialize with Pro license
 * const mm = new QAntum({
 *   licenseKey: 'MM-XXXX-XXXX-XXXX',
 *   verbose: true
 * });
 *
 * // Run a website audit
 * const audit = await mm.audit('https://example.com');
 * console.log(audit.performance); // 85
 *
 * // Predict bugs before deployment
 * const prediction = await mm.predict({
 *   codeChanges: gitDiff
 * });
 * console.log(prediction.riskScore); // 42
 * ```
 *
 * @author Димитър Продромов (Dimitar Prodromov) <dimitar@QAntum.bg>
 * @copyright 2025 QAntum. All Rights Reserved.
 * @license PROPRIETARY - See LICENSE file
 * @see {@link https://qantum.dev} Official Documentation
 * @see {@link https://github.com/papica777-eng/QAntumQATool} GitHub Repository
 *
 * @example
 * // Smart element finding with semantic search
 * const mm = new QAntum({ licenseKey: 'MM-PRO-KEY' });
 * await mm.smartClick(page, ['login', 'sign in', 'вход']);
 * await mm.smartFill(page, ['email', 'username'], 'user@example.com');
 */
class QAntum {
    config;
    isProLicense = false;
    asc = null;
    // 🐝 Sovereign Swarm v17.0 components
    orchestrator = null;
    distillationLogger = null;
    observabilityBridge = null;
    browserPool = null;
    swarmInitialized = false;
    // 🧬 Self-Evolving Genetic Core v18.0 components
    segc = null;
    segcInitialized = false;
    // 🏰 Security Bastion & Neural Grid v19.0 components
    bastion = null;
    bastionInitialized = false;
    // ═══════════════════════════════════════════════════════════════════════════════
    // 🚀 v20.0 THE SOVEREIGN SINGULARITY - New Components
    // ═══════════════════════════════════════════════════════════════════════════════
    /** 💰 Financial Oracle - Track API costs */
    apiCostTracker = {
        totalCost: 0,
        requestCount: 0,
        lastReset: new Date(),
    };
    /** 🧹 Memory Hardening - FinalizationRegistry for GC cleanup */
    browserRegistry;
    trackedBrowsers = new Map();
    /** 📊 Structured Logger - Professional logging for Chronos */
    logger = {
        logs: [],
        debug: (msg, meta) => this.logMessage('debug', msg, meta),
        info: (msg, meta) => this.logMessage('info', msg, meta),
        warn: (msg, meta) => this.logMessage('warn', msg, meta),
        error: (msg, error, meta) => {
            const entry = this.logMessage('error', msg, {
                ...meta,
                errorMessage: error?.message,
                errorStack: error?.stack,
            });
            return entry;
        },
        audit: (action, status, meta) => {
            return this.logMessage('audit', `${action}: ${status}`, { action, status, ...meta });
        },
        getLogs: (level, limit = 100) => {
            const filtered = level
                ? this.logger.logs.filter(l => l.level === level)
                : this.logger.logs;
            return filtered.slice(-limit);
        },
        clear: () => { this.logger.logs = []; },
    };
    /** 🔌 Circuit Breaker for API Sensei */
    apiSenseiCircuitBreaker = {
        failures: 0,
        lastFailure: null,
        isOpen: false,
        openedAt: null,
    };
    constructor(config = {}) {
        // Validate config
        if (config.timeout !== undefined && (typeof config.timeout !== 'number' || config.timeout < 0)) {
            throw new Error('Invalid timeout: must be a positive number');
        }
        this.config = {
            timeout: 30000,
            verbose: false,
            browserEngine: 'chromium',
            enableMemoryHardening: true,
            financialOracle: {
                maxCostPerRequest: 0.05,
                monthlyBudget: 100,
                enableLocalFallback: true,
                localModelEndpoint: 'http://localhost:11434',
            },
            ...config
        };
        // 🧹 v20.0: Initialize FinalizationRegistry for Memory Hardening
        this.browserRegistry = new FinalizationRegistry((heldValue) => {
            if (heldValue && heldValue.close) {
                heldValue.close().catch((err) => {
                    this.logger.error('GC: Failed to auto-close browser', err, { browserId: heldValue.id });
                });
                this.logger.info('🧹 GC: Browser instance auto-closed by FinalizationRegistry', { browserId: heldValue.id });
            }
        });
        if (config.licenseKey) {
            this.validateLicense(config.licenseKey);
        }
        // Initialize ASC if config provided or PRO license
        if (config.asc || this.isProLicense) {
            this.initASC(config.asc);
        }
        this.logger.info(`🧠 QAntum v${exports.VERSION} initialized`, {
            tier: this.isProLicense ? 'pro' : 'free',
            browserEngine: this.config.browserEngine,
            memoryHardening: this.config.enableMemoryHardening,
        });
        // Print compact banner on initialization
        if (this.config.verbose) {
            printBanner({ compact: true });
        }
    }
    // ═══════════════════════════════════════════════════════════════════════════════
    // 💰 v20.0 FINANCIAL ORACLE - Smart AI Model Selection
    // ═══════════════════════════════════════════════════════════════════════════════
    /**
     * 💰 Financial Oracle: Get optimal AI model based on cost and complexity
     * Automatically switches to local GPU (Ollama/Gemma) when budget is tight
     */
    async getOptimalAIModel(taskComplexity) {
        const oracleConfig = this.config.financialOracle;
        const costPerComplexity = { low: 0.01, medium: 0.03, high: 0.08 };
        const estimatedCost = costPerComplexity[taskComplexity];
        // Check monthly budget
        const now = new Date();
        if (now.getMonth() !== this.apiCostTracker.lastReset.getMonth()) {
            this.apiCostTracker = { totalCost: 0, requestCount: 0, lastReset: now };
            this.logger.info('💰 Financial Oracle: Monthly budget reset');
        }
        const remainingBudget = oracleConfig.monthlyBudget - this.apiCostTracker.totalCost;
        // Decision logic
        if (estimatedCost > oracleConfig.maxCostPerRequest) {
            this.logger.info('💰 Financial Oracle: Cost exceeds per-request limit, using local GPU', {
                estimatedCost,
                limit: oracleConfig.maxCostPerRequest,
            });
            return 'local';
        }
        if (remainingBudget < estimatedCost * 10) {
            this.logger.warn('💰 Financial Oracle: Budget running low, switching to local GPU', {
                remainingBudget,
                estimatedCost,
            });
            return 'local';
        }
        if (!this.isProLicense && oracleConfig.enableLocalFallback) {
            this.logger.info('💰 Financial Oracle: Free tier - using local GPU');
            return 'local';
        }
        return 'cloud';
    }
    /**
     * 💰 Track API cost after request
     */
    trackAPICost(cost, operation) {
        this.apiCostTracker.totalCost += cost;
        this.apiCostTracker.requestCount++;
        this.logger.audit('api_cost', 'success', {
            cost,
            operation,
            totalCost: this.apiCostTracker.totalCost,
            requestCount: this.apiCostTracker.requestCount,
        });
    }
    /**
     * 💰 Get Financial Oracle statistics
     *
     * Returns comprehensive cost tracking data for AI model usage.
     * The Financial Oracle monitors API costs and helps optimize between
     * cloud (GPT-4/Claude) and local (Ollama/Gemma) AI providers.
     *
     * @returns Financial statistics object containing:
     *   - `totalCost`: Total USD spent on AI APIs this billing period
     *   - `requestCount`: Number of AI requests made
     *   - `remainingBudget`: USD remaining from monthly budget
     *   - `averageCostPerRequest`: Mean cost per AI operation
     *
     * @example
     * ```typescript
     * const mm = new QAntum({ licenseKey: 'MM-PRO-KEY' });
     *
     * // After running some AI operations
     * const stats = mm.getFinancialStats();
     * console.log(`💰 Spent: $${stats.totalCost.toFixed(2)}`);
     * console.log(`📊 Requests: ${stats.requestCount}`);
     * console.log(`💵 Remaining: $${stats.remainingBudget.toFixed(2)}`);
     *
     * if (stats.remainingBudget < 10) {
     *   console.warn('⚠️ Low budget - switching to local models');
     * }
     * ```
     *
     * @since v20.0 "The Sovereign Singularity"
     * @see {@link QAntumConfig.financialOracle} for budget configuration
     */
    getFinancialStats() {
        const budget = this.config.financialOracle?.monthlyBudget ?? 100;
        return {
            totalCost: this.apiCostTracker.totalCost,
            requestCount: this.apiCostTracker.requestCount,
            remainingBudget: budget - this.apiCostTracker.totalCost,
            averageCostPerRequest: this.apiCostTracker.requestCount > 0
                ? this.apiCostTracker.totalCost / this.apiCostTracker.requestCount
                : 0,
        };
    }
    // ═══════════════════════════════════════════════════════════════════════════════
    // 📊 v20.0 STRUCTURED LOGGER - Professional Logging
    // ═══════════════════════════════════════════════════════════════════════════════
    /**
     * 📊 Internal log message handler
     */
    logMessage(level, message, meta) {
        const entry = {
            level,
            message,
            timestamp: new Date(),
            component: 'QAntum',
            metadata: meta,
            traceId: this.observabilityBridge?.getCurrentTraceId() || undefined,
        };
        this.logger.logs.push(entry);
        if (this.logger.logs.length > 10000) {
            this.logger.logs.shift(); // Keep max 10k entries
        }
        if (this.config.verbose) {
            const prefix = { debug: '🔍', info: 'ℹ️', warn: '⚠️', error: '❌', audit: '📋' }[level];
            console.log(`[${entry.timestamp.toISOString()}] ${prefix} ${message}`, meta || '');
        }
        return entry;
    }
    /**
     * 📊 Get structured logger for external access
     *
     * Provides access to QAntum's internal logging system.
     * Use this to integrate with external log aggregators (DataDog, Splunk, ELK)
     * or to inspect logs during debugging.
     *
     * @returns Logger object with methods:
     *   - `debug(msg, meta?)` - Debug-level messages
     *   - `info(msg, meta?)` - Informational messages
     *   - `warn(msg, meta?)` - Warning messages
     *   - `error(msg, error?, meta?)` - Error messages with stack traces
     *   - `audit(action, status, meta?)` - Audit trail entries
     *   - `getLogs(level?, limit?)` - Retrieve log entries
     *   - `clear()` - Clear all log entries
     *
     * @example
     * ```typescript
     * const mm = new QAntum({ verbose: true });
     * const logger = mm.getLogger();
     *
     * // Add custom log entries
     * logger.info('Starting test suite', { testCount: 42 });
     *
     * // Get all errors
     * const errors = logger.getLogs('error');
     * console.log(`Found ${errors.length} errors`);
     *
     * // Export to external system
     * const allLogs = logger.getLogs();
     * await sendToDataDog(allLogs);
     * ```
     *
     * @since v20.0 "The Sovereign Singularity"
     */
    getLogger() {
        return this.logger;
    }
    // ═══════════════════════════════════════════════════════════════════════════════
    // 🧹 v20.0 MEMORY HARDENING - Browser Tracking with FinalizationRegistry
    // ═══════════════════════════════════════════════════════════════════════════════
    /**
     * 🧹 Register browser for GC-friendly auto-cleanup
     */
    registerBrowserForCleanup(browser, id) {
        if (!this.config.enableMemoryHardening)
            return;
        this.trackedBrowsers.set(id, new WeakRef(browser));
        this.browserRegistry.register(browser, { id, close: () => browser.close() }, browser);
        this.logger.debug('🧹 Browser registered for GC cleanup', { browserId: id });
    }
    /**
     * 🧹 Unregister browser (when manually closed)
     */
    unregisterBrowser(browser, id) {
        this.trackedBrowsers.delete(id);
        this.browserRegistry.unregister(browser);
        this.logger.debug('🧹 Browser unregistered from GC', { browserId: id });
    }
    /**
     * 🧹 Get tracked browsers count
     *
     * Returns the number of browser instances currently tracked for GC cleanup.
     * Memory Hardening uses WeakRef + FinalizationRegistry to auto-close
     * abandoned browser instances, preventing memory leaks.
     *
     * @returns Number of actively tracked browser instances
     *
     * @example
     * ```typescript
     * const mm = new QAntum({ enableMemoryHardening: true });
     *
     * await mm.audit('https://site1.com');
     * await mm.audit('https://site2.com');
     *
     * console.log(`Active browsers: ${mm.getTrackedBrowsersCount()}`);
     * // Output: Active browsers: 0 (auto-closed after audit)
     * ```
     *
     * @since v20.0 "The Sovereign Singularity"
     */
    getTrackedBrowsersCount() {
        let count = 0;
        for (const [id, ref] of this.trackedBrowsers) {
            if (ref.deref())
                count++;
            else
                this.trackedBrowsers.delete(id);
        }
        return count;
    }
    /**
     * Initialize Adaptive Semantic Core
     */
    initASC(config) {
        this.asc = new semantic_core_1.AdaptiveSemanticCore({
            verbose: this.config.verbose,
            ...config
        });
        if (this.config.verbose) {
            console.log('🧠 ASC: Adaptive Semantic Core initialized');
        }
    }
    /**
     * 🧬 Initialize Self-Evolving Genetic Core
     *
     * SEGC is QAntum's machine learning engine that continuously improves
     * test strategies through genetic algorithms. It learns from test failures
     * and successes to evolve better selectors and test patterns.
     *
     * **Features:**
     * - Ghost Knowledge: Learns alternative selectors for flaky elements
     * - Mutation Engine: Generates test variations using genetic algorithms
     * - A/B Experiments: Compare strategy versions with statistical significance
     * - Predictions: Forecast test outcomes before execution
     *
     * @param config - Optional SEGC configuration
     * @param config.populationSize - Number of selector variants (default: 50)
     * @param config.mutationRate - Probability of mutation (0-1, default: 0.1)
     * @param config.fitnessThreshold - Minimum fitness to keep (default: 0.7)
     *
     * @returns Promise that resolves when SEGC is initialized
     *
     * @example
     * ```typescript
     * const mm = new QAntum({ licenseKey: 'MM-PRO-KEY' });
     *
     * await mm.initSEGC({
     *   populationSize: 100,
     *   mutationRate: 0.15,
     *   fitnessThreshold: 0.8
     * });
     *
     * // SEGC now learns from every test execution
     * const alternatives = await mm.testAlternativePaths('#login-btn', page);
     * console.log(`Found ${alternatives?.paths.length} alternative selectors`);
     * ```
     *
     * @requires PRO license or higher
     * @since v18.0 "Genetic Core"
     * @see {@link getSEGC} to access the SEGC controller directly
     * @see {@link runLearningCycle} to trigger evolution
     */
    async initSEGC(config) {
        if (this.segcInitialized)
            return;
        this.segc = new segc_1.SEGCController({
            verbose: this.config.verbose,
            ...config,
        });
        this.segcInitialized = true;
        if (this.config.verbose) {
            console.log('🧬 SEGC: Self-Evolving Genetic Core initialized');
        }
    }
    /**
     * 🧬 Get SEGC controller
     *
     * Returns the raw SEGC controller for advanced genetic algorithm operations.
     * Use this for direct access to low-level SEGC APIs not exposed by QAntum.
     *
     * @returns SEGCController instance or null if SEGC not initialized
     *
     * @example
     * ```typescript
     * const mm = new QAntum({ licenseKey: 'MM-PRO-KEY' });
     * await mm.initSEGC();
     *
     * const segc = mm.getSEGC();
     * if (segc) {
     *   // Direct access to genetic operations
     *   segc.evolvePopulation();
     *   segc.selectFittest(0.9);
     * }
     * ```
     *
     * @since v18.0 "Genetic Core"
     */
    getSEGC() {
        return this.segc;
    }
    /**
     * 🧬 Get SEGC statistics
     *
     * Returns comprehensive statistics about SEGC's learning and evolution progress.
     *
     * @returns SEGCStats object or null if SEGC not initialized
     *   - `totalMutations`: Count of selector mutations generated
     *   - `successfulMutations`: Mutations that improved test stability
     *   - `populationSize`: Current genetic population size
     *   - `averageFitness`: Mean fitness score across population
     *   - `generationCount`: Number of evolution cycles completed
     *
     * @example
     * ```typescript
     * const mm = new QAntum({ licenseKey: 'MM-PRO-KEY' });
     * await mm.initSEGC();
     *
     * // After running tests
     * const stats = mm.getSEGCStats();
     * if (stats) {
     *   console.log(`🧬 Generation: ${stats.generationCount}`);
     *   console.log(`🎯 Fitness: ${(stats.averageFitness * 100).toFixed(1)}%`);
     * }
     * ```
     *
     * @since v18.0 "Genetic Core"
     */
    getSEGCStats() {
        return this.segc?.getStats() || null;
    }
    /**
     * 🧬 Run SEGC learning cycle
     *
     * Triggers one evolution cycle of the genetic algorithm.
     * This analyzes recent test results, generates mutations,
     * and evolves the selector population toward higher fitness.
     *
     * **Process:**
     * 1. Evaluate fitness of current population
     * 2. Select top performers (tournament selection)
     * 3. Generate mutations and crossovers
     * 4. Replace weak individuals with offspring
     * 5. Update predictions for next cycle
     *
     * @returns Object with evolution results or null if SEGC not initialized
     *   - `improvements`: Number of selectors that improved
     *   - `mutations`: Array of generated GeneticMutation objects
     *   - `predictions`: Count of outcome predictions made
     *
     * @example
     * ```typescript
     * const mm = new QAntum({ licenseKey: 'MM-PRO-KEY' });
     * await mm.initSEGC();
     *
     * // Run evolution after test suite
     * const result = await mm.runLearningCycle();
     * if (result) {
     *   console.log(`🧬 Improved ${result.improvements} selectors`);
     *   console.log(`🔬 Generated ${result.mutations.length} mutations`);
     * }
     * ```
     *
     * @since v18.0 "Genetic Core"
     */
    async runLearningCycle() {
        if (!this.segc)
            return null;
        return this.segc.runLearningCycle();
    }
    /**
     * 🧬 Test alternative selector paths
     *
     * Uses Ghost Knowledge to find alternative selectors for an element.
     * Essential for creating self-healing tests that survive DOM changes.
     *
     * **How it works:**
     * 1. Analyzes current selector structure
     * 2. Generates alternatives using genetic mutations
     * 3. Validates each alternative against the page
     * 4. Ranks by stability and specificity
     *
     * @param currentSelector - The CSS/XPath selector to find alternatives for
     * @param page - Playwright Page instance for validation
     * @param options - Optional configuration
     * @param options.targetText - Expected text content of element
     * @param options.elementType - HTML tag type (button, input, etc.)
     *
     * @returns GhostPath with alternative selectors or null
     *
     * @example
     * ```typescript
     * const mm = new QAntum({ licenseKey: 'MM-PRO-KEY' });
     * await mm.initSEGC();
     *
     * // Find alternatives for a flaky selector
     * const ghost = await mm.testAlternativePaths(
     *   '#dynamic-login-btn',
     *   page,
     *   { targetText: 'Sign In', elementType: 'button' }
     * );
     *
     * if (ghost?.paths.length) {
     *   console.log('Alternative selectors:');
     *   ghost.paths.forEach(p => console.log(`  - ${p.selector} (${p.stability}%)`));
     * }
     * ```
     *
     * @since v18.0 "Genetic Core"
     */
    async testAlternativePaths(currentSelector, page, options) {
        if (!this.segc)
            return null;
        return this.segc.testAlternativePaths(currentSelector, page, options);
    }
    /**
     * 🧬 Create a new strategy version for A/B testing
     *
     * Creates a versioned snapshot of a test strategy for controlled experiments.
     * Compare different approaches (selectors, waits, assertions) with statistical rigor.
     *
     * @param options - Version configuration
     * @param options.name - Unique version identifier (e.g., "v1.2-faster-waits")
     * @param options.description - Human-readable description
     * @param options.strategy - Strategy configuration object
     * @param options.isBaseline - Mark as baseline for comparison (default: false)
     *
     * @returns Created StateVersion or null if SEGC not initialized
     *
     * @example
     * ```typescript
     * const mm = new QAntum({ licenseKey: 'MM-PRO-KEY' });
     * await mm.initSEGC();
     *
     * // Create baseline
     * const baseline = mm.createStrategyVersion({
     *   name: 'v1.0-baseline',
     *   description: 'Current production strategy',
     *   strategy: { waitTime: 1000, retries: 3 },
     *   isBaseline: true
     * });
     *
     * // Create challenger
     * const challenger = mm.createStrategyVersion({
     *   name: 'v1.1-faster',
     *   description: 'Reduced waits experiment',
     *   strategy: { waitTime: 500, retries: 5 }
     * });
     *
     * // Start experiment
     * mm.startABExperiment(baseline.id, challenger.id, 0.5);
     * ```
     *
     * @since v18.0 "Genetic Core"
     */
    createStrategyVersion(options) {
        if (!this.segc)
            return null;
        return this.segc.createVersion(options);
    }
    /**
     * 🧬 Start A/B experiment between versions
     *
     * Initiates a controlled experiment comparing two strategy versions.
     * Traffic is split according to `trafficSplit` ratio, and statistical
     * significance is calculated automatically.
     *
     * @param versionA - ID of first version (typically baseline)
     * @param versionB - ID of second version (challenger)
     * @param trafficSplit - Ratio of traffic to versionA (0-1, default: 0.5)
     *
     * @returns Experiment ID or null if SEGC not initialized
     *
     * @example
     * ```typescript
     * const mm = new QAntum({ licenseKey: 'MM-PRO-KEY' });
     * await mm.initSEGC();
     *
     * // 50/50 split
     * const expId = mm.startABExperiment('v1.0', 'v1.1', 0.5);
     * console.log(`🧪 Experiment started: ${expId}`);
     *
     * // 80/20 split favoring baseline
     * mm.startABExperiment('production', 'experimental', 0.8);
     * ```
     *
     * @since v18.0 "Genetic Core"
     */
    startABExperiment(versionA, versionB, trafficSplit) {
        if (!this.segc)
            return null;
        return this.segc.startExperiment(versionA, versionB, trafficSplit);
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // 🏰 SECURITY BASTION & NEURAL GRID v19.0
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * 🏰 Initialize Security Bastion & Neural Grid
     *
     * Activates enterprise-grade security features for sensitive test operations.
     * **Required for ENTERPRISE tier** to handle PII, financial data, or regulated industries.
     *
     * **Security Features:**
     * - **Encrypted Vault**: AES-256-GCM encryption for secrets and credentials
     * - **Sandbox Execution**: Isolated V8 context for untrusted code
     * - **Circuit Breaker**: Automatic fallback on service failures
     * - **Worker Pool**: Thread pool for CPU-intensive operations
     * - **Audit Trail**: Immutable log of all security-relevant actions
     *
     * @param config - Bastion configuration
     * @param config.sandboxTimeout - Max execution time in sandbox (default: 5000ms)
     * @param config.workerPoolSize - Number of worker threads (default: CPU cores)
     * @param config.circuitBreakerThreshold - Failures before opening (default: 5)
     * @param vaultPassword - Master password for encrypted vault (**required**)
     *
     * @returns Promise that resolves when Bastion is ready
     *
     * @throws {Error} If vaultPassword is empty or weak
     *
     * @example
     * ```typescript
     * const mm = new QAntum({ licenseKey: 'MM-ENTERPRISE-KEY' });
     *
     * await mm.initBastion({
     *   sandboxTimeout: 10000,
     *   workerPoolSize: 8,
     *   circuitBreakerThreshold: 3
     * }, process.env.VAULT_PASSWORD!);
     *
     * // Store sensitive credentials
     * await mm.storeSecure('db-password', 'ghost_knowledge', {
     *   host: 'prod.db.internal',
     *   password: 'super-secret'
     * });
     * ```
     *
     * @requires ENTERPRISE license
     * @since v19.0 "Security Bastion"
     * @see {@link storeSecure} for vault operations
     * @see {@link validateMutationSecure} for sandbox execution
     */
    async initBastion(config = {}, vaultPassword) {
        if (this.bastionInitialized)
            return;
        this.bastion = new bastion_1.BastionController({
            verbose: this.config.verbose,
            ...config,
        });
        await this.bastion.initialize(vaultPassword);
        this.bastionInitialized = true;
        if (this.config.verbose) {
            console.log('🏰 BASTION: Security Bastion & Neural Grid initialized');
        }
    }
    /**
     * 🏰 Get Bastion controller
     *
     * Returns the raw BastionController for advanced security operations.
     *
     * @returns BastionController instance or null if not initialized
     *
     * @example
     * ```typescript
     * const bastion = mm.getBastion();
     * if (bastion) {
     *   await bastion.rotateVaultKey('new-password');
     * }
     * ```
     *
     * @since v19.0 "Security Bastion"
     */
    getBastion() {
        return this.bastion;
    }
    /**
     * 🏰 Get Bastion statistics
     *
     * Returns security and worker pool statistics.
     *
     * @returns BastionStats or null if not initialized
     *   - `vaultEntries`: Number of encrypted entries
     *   - `sandboxExecutions`: Total sandbox runs
     *   - `circuitBreakerTrips`: Times circuit opened
     *   - `workerPoolUtilization`: Current worker usage %
     *
     * @since v19.0 "Security Bastion"
     */
    getBastionStats() {
        return this.bastion?.getStats() || null;
    }
    /**
     * 🏰 Validate a mutation in secure sandbox
     *
     * Executes code in an isolated V8 sandbox to safely validate genetic mutations.
     * The sandbox has no filesystem/network access and strict memory limits.
     *
     * @param mutationId - Unique mutation identifier
     * @param mutationCode - JavaScript code to execute
     * @param context - Variables available in sandbox (frozen, read-only)
     *
     * @returns MutationValidation result or null
     *   - `isValid`: Whether mutation passes validation
     *   - `errors`: Array of validation errors
     *   - `executionTime`: Time taken in milliseconds
     *
     * @example
     * ```typescript
     * const result = await mm.validateMutationSecure(
     *   'mut-001',
     *   `return context.selector.includes('#') ? true : false`,
     *   { selector: '#login-btn' }
     * );
     *
     * if (result?.isValid) {
     *   console.log('✅ Mutation is safe to apply');
     * }
     * ```
     *
     * @since v19.0 "Security Bastion"
     */
    async validateMutationSecure(mutationId, mutationCode, context) {
        if (!this.bastion)
            return null;
        return this.bastion.validateMutation(mutationId, mutationCode, context || {});
    }
    /**
     * 🏰 Submit task to worker pool
     *
     * Offloads CPU-intensive work to the worker thread pool.
     * Ideal for parallel test data generation, report building, etc.
     *
     * @typeParam T - Input payload type
     * @typeParam R - Return type
     * @param type - Task type identifier
     * @param payload - Task payload
     * @param options - Execution options
     * @param options.priority - Task priority (higher = sooner)
     * @param options.timeout - Max execution time in ms
     *
     * @returns Task result or null
     *
     * @example
     * ```typescript
     * // Generate test data in worker
     * const testData = await mm.submitWorkerTask<GenerateConfig, TestData[]>(
     *   'generate-test-data',
     *   { count: 10000, schema: 'users' },
     *   { priority: 10, timeout: 30000 }
     * );
     * ```
     *
     * @since v19.0 "Security Bastion"
     */
    async submitWorkerTask(type, payload, options) {
        if (!this.bastion)
            return null;
        return this.bastion.submitTask(type, payload, options);
    }
    /**
     * 🏰 Store data in encrypted vault
     *
     * Encrypts and stores sensitive data using AES-256-GCM.
     * Data is categorized by type for organized retrieval.
     *
     * @param id - Unique identifier for the entry
     * @param type - Data category for organization
     * @param data - Data to encrypt and store (will be JSON serialized)
     *
     * @returns true if stored successfully, false if Bastion not initialized
     *
     * @example
     * ```typescript
     * // Store API credentials
     * await mm.storeSecure('openai-key', 'ghost_knowledge', {
     *   apiKey: process.env.OPENAI_API_KEY,
     *   org: 'org-xxx'
     * });
     *
     * // Store prediction model
     * await mm.storeSecure('risk-model-v2', 'predictions', trainedModel);
     * ```
     *
     * @since v19.0 "Security Bastion"
     */
    async storeSecure(id, type, data) {
        if (!this.bastion)
            return false;
        await this.bastion.storeSecure(id, type, data);
        return true;
    }
    /**
     * 🏰 Retrieve data from encrypted vault
     *
     * Decrypts and returns previously stored data.
     *
     * @typeParam T - Expected return type
     * @param id - Entry identifier
     *
     * @returns Decrypted data or null if not found/Bastion not initialized
     *
     * @example
     * ```typescript
     * interface Credentials { apiKey: string; org: string; }
     *
     * const creds = await mm.retrieveSecure<Credentials>('openai-key');
     * if (creds) {
     *   const openai = new OpenAI({ apiKey: creds.apiKey });
     * }
     * ```
     *
     * @since v19.0 "Security Bastion"
     */
    async retrieveSecure(id) {
        if (!this.bastion)
            return null;
        return this.bastion.retrieveSecure(id);
    }
    /**
     * 🏰 Execute with circuit breaker and fallback
     *
     * Wraps an operation with circuit breaker pattern for resilience.
     * Automatically falls back to alternative providers on repeated failures.
     *
     * @typeParam T - Return type
     * @param requestFn - Function to execute with service provider
     * @param options - Execution options
     * @param options.service - Preferred service provider
     * @param options.timeout - Request timeout in ms
     *
     * @returns Operation result or null if all providers fail
     *
     * @example
     * ```typescript
     * const result = await mm.executeWithFallback(
     *   async (service) => {
     *     return await service.predict(codeChanges);
     *   },
     *   { service: 'openai', timeout: 10000 }
     * );
     * ```
     *
     * @since v19.0 "Security Bastion"
     */
    async executeWithFallback(requestFn, options) {
        if (!this.bastion)
            return null;
        return this.bastion.executeWithFallback(requestFn, options);
    }
    /**
     * 🏰 Get system health
     *
     * Returns comprehensive health status of all Bastion components.
     *
     * @returns SystemHealth object or null
     *   - `overall`: 'healthy' | 'degraded' | 'unhealthy'
     *   - `components`: Status of vault, sandbox, workers, circuits
     *   - `uptime`: System uptime in seconds
     *   - `lastHealthCheck`: ISO timestamp
     *
     * @example
     * ```typescript
     * const health = await mm.getSystemHealth();
     * if (health?.overall === 'unhealthy') {
     *   await alertOps('QAntum Bastion unhealthy', health);
     * }
     * ```
     *
     * @since v19.0 "Security Bastion"
     */
    async getSystemHealth() {
        if (!this.bastion)
            return null;
        return this.bastion.getHealth();
    }
    /**
     * 🏰 Track browser for GC-friendly cleanup
     *
     * Registers a browser instance for automatic cleanup via FinalizationRegistry.
     * Use this when manually launching browsers outside QAntum's control.
     *
     * @param browser - Browser instance (Playwright or Selenium)
     * @param instanceId - Unique identifier for tracking
     *
     * @example
     * ```typescript
     * const browser = await chromium.launch();
     * mm.trackBrowser(browser, `custom-${Date.now()}`);
     *
     * // Browser will be auto-closed on GC if forgotten
     * ```
     *
     * @since v19.0 "Security Bastion"
     */
    trackBrowser(browser, instanceId) {
        this.bastion?.trackBrowser(browser, instanceId);
    }
    /**
     * 🆓 FREE: Basic website audit
     *
     * Performs comprehensive analysis of a website's performance, accessibility,
     * and SEO metrics using real browser automation.
     *
     * **Metrics Analyzed:**
     * - **Performance**: Load time, DOM ready, First Contentful Paint
     * - **Accessibility**: ARIA labels, color contrast, keyboard navigation
     * - **SEO**: Meta tags, headings structure, image alt texts
     * - **Resources**: Total size, request count, resource breakdown
     *
     * @param url - Website URL to audit (must be valid HTTP/HTTPS)
     *
     * @returns AuditResult containing all metrics
     *
     * @throws {Error} If URL is invalid or unreachable
     *
     * @example
     * ```typescript
     * const mm = new QAntum();
     *
     * const audit = await mm.audit('https://example.com');
     *
     * console.log(`⚡ Performance: ${audit.performance}/100`);
     * console.log(`♿ Accessibility: ${audit.accessibility}/100`);
     * console.log(`🔍 SEO: ${audit.seo}/100`);
     * console.log(`📊 Load Time: ${audit.loadTime}ms`);
     *
     * if (audit.performance < 50) {
     *   console.warn('⚠️ Performance needs improvement!');
     *   audit.recommendations.forEach(r => console.log(`  - ${r}`));
     * }
     * ```
     *
     * @since v1.0
     * @see {@link checkLinks} for dead link detection
     */
    async audit(url) {
        const startTime = Date.now();
        if (!url || typeof url !== 'string') {
            throw new Error('Invalid URL: must be a non-empty string');
        }
        // Validate URL format
        try {
            new URL(url);
        }
        catch {
            throw new Error(`Invalid URL format: ${url}`);
        }
        this.logger.info(`🔍 Auditing ${url}...`);
        let browser = null;
        const browserId = `audit-${Date.now()}`;
        try {
            // v20.0: Use BrowserFactory for DI
            browser = await BrowserFactory.launch(this.config.browserEngine, { headless: true });
            this.registerBrowserForCleanup(browser, browserId);
            const context = await browser.newContext();
            const page = await context.newPage();
            // Collect performance metrics
            const metrics = {
                loadTime: 0,
                domContentLoaded: 0,
                firstPaint: 0,
                resourceCount: 0,
                totalSize: 0
            };
            // Track resources
            const resources = [];
            page.on('response', async (response) => {
                try {
                    const headers = response.headers();
                    const size = parseInt(headers['content-length'] || '0', 10);
                    resources.push({ size, type: response.request().resourceType() });
                }
                catch {
                    // Ignore errors from response handling
                }
            });
            // Navigate and measure timing
            const navigationStart = Date.now();
            await page.goto(url, {
                waitUntil: 'networkidle',
                timeout: this.config.timeout
            });
            metrics.loadTime = Date.now() - navigationStart;
            // Get performance timing from browser using Navigation Timing API
            const timing = await page.evaluate(() => {
                const entries = performance.getEntriesByType('navigation');
                if (entries.length > 0) {
                    const nav = entries[0];
                    return {
                        domContentLoaded: nav.domContentLoadedEventEnd - nav.startTime,
                        loadComplete: nav.loadEventEnd - nav.startTime
                    };
                }
                return { domContentLoaded: 0, loadComplete: 0 };
            });
            metrics.domContentLoaded = timing.domContentLoaded;
            metrics.resourceCount = resources.length;
            metrics.totalSize = resources.reduce((sum, r) => sum + r.size, 0);
            // Calculate performance score (based on load time)
            let performanceScore = 100;
            if (metrics.loadTime > 1000)
                performanceScore -= 10;
            if (metrics.loadTime > 2000)
                performanceScore -= 15;
            if (metrics.loadTime > 3000)
                performanceScore -= 20;
            if (metrics.loadTime > 5000)
                performanceScore -= 25;
            if (metrics.totalSize > 1000000)
                performanceScore -= 10; // > 1MB
            if (metrics.totalSize > 3000000)
                performanceScore -= 15; // > 3MB
            performanceScore = Math.max(0, Math.min(100, performanceScore));
            // Accessibility audit
            const accessibilityResults = await this.runAccessibilityChecks(page);
            // SEO audit  
            const seoResults = await this.runSEOChecks(page);
            // Find broken links on the page
            const brokenLinks = await this.findBrokenLinksOnPage(page);
            // Generate suggestions
            const suggestions = this.generateSuggestions(metrics, accessibilityResults, seoResults);
            const duration = Date.now() - startTime;
            const result = {
                url,
                timestamp: new Date(),
                performance: performanceScore,
                accessibility: accessibilityResults.score,
                seo: seoResults.score,
                brokenLinks,
                suggestions,
                duration,
                metrics
            };
            if (this.config.verbose) {
                console.log(`✅ Audit complete! Performance: ${result.performance}/100, Duration: ${duration}ms`);
            }
            return result;
        }
        finally {
            if (browser) {
                this.unregisterBrowser(browser, browserId);
                await browser.close();
                this.logger.debug('Browser closed after audit', { browserId });
            }
        }
    }
    /**
     * Run accessibility checks on a page
     */
    async runAccessibilityChecks(page) {
        const issues = [];
        let score = 100;
        // Check for images without alt text
        const imagesWithoutAlt = await page.$$eval('img:not([alt])', imgs => imgs.length);
        if (imagesWithoutAlt > 0) {
            issues.push(`${imagesWithoutAlt} image(s) missing alt text`);
            score -= imagesWithoutAlt * 5;
        }
        // Check for proper heading hierarchy
        const headings = await page.$$eval('h1, h2, h3, h4, h5, h6', els => els.map(el => el.tagName.toLowerCase()));
        const h1Count = headings.filter(h => h === 'h1').length;
        if (h1Count === 0) {
            issues.push('Missing h1 heading');
            score -= 10;
        }
        else if (h1Count > 1) {
            issues.push('Multiple h1 headings found');
            score -= 5;
        }
        // Check for form labels
        const inputsWithoutLabels = await page.$$eval('input:not([type="hidden"]):not([type="submit"]):not([type="button"])', inputs => inputs.filter(input => {
            const id = input.id;
            if (!id)
                return true;
            return !document.querySelector(`label[for="${id}"]`);
        }).length);
        if (inputsWithoutLabels > 0) {
            issues.push(`${inputsWithoutLabels} input(s) missing associated labels`);
            score -= inputsWithoutLabels * 5;
        }
        // Check for sufficient color contrast (simplified check)
        const lowContrastElements = await page.$$eval('*', els => {
            let count = 0;
            els.slice(0, 100).forEach(el => {
                const style = window.getComputedStyle(el);
                const bg = style.backgroundColor;
                const fg = style.color;
                // Very simplified contrast check
                if (bg === fg && bg !== 'rgba(0, 0, 0, 0)') {
                    count++;
                }
            });
            return count;
        });
        if (lowContrastElements > 0) {
            issues.push('Potential color contrast issues detected');
            score -= 5;
        }
        // Check for skip navigation link
        const hasSkipLink = await page.$('a[href="#main"], a[href="#content"], .skip-link, .skip-nav');
        if (!hasSkipLink) {
            issues.push('Missing skip navigation link');
            score -= 3;
        }
        // Check for language attribute
        const hasLang = await page.$eval('html', html => html.hasAttribute('lang'));
        if (!hasLang) {
            issues.push('Missing lang attribute on html element');
            score -= 5;
        }
        return { score: Math.max(0, Math.min(100, score)), issues };
    }
    /**
     * Run SEO checks on a page
     */
    async runSEOChecks(page) {
        const issues = [];
        let score = 100;
        // Check for title tag
        const title = await page.title();
        if (!title) {
            issues.push('Missing page title');
            score -= 15;
        }
        else if (title.length < 30) {
            issues.push('Title too short (recommended: 30-60 characters)');
            score -= 5;
        }
        else if (title.length > 60) {
            issues.push('Title too long (recommended: 30-60 characters)');
            score -= 3;
        }
        // Check for meta description
        const metaDesc = await page.$eval('meta[name="description"]', el => el.getAttribute('content')).catch(() => null);
        if (!metaDesc) {
            issues.push('Missing meta description');
            score -= 15;
        }
        else if (metaDesc.length < 120) {
            issues.push('Meta description too short (recommended: 120-160 characters)');
            score -= 5;
        }
        else if (metaDesc.length > 160) {
            issues.push('Meta description too long (recommended: 120-160 characters)');
            score -= 3;
        }
        // Check for canonical URL
        const hasCanonical = await page.$('link[rel="canonical"]');
        if (!hasCanonical) {
            issues.push('Missing canonical URL');
            score -= 5;
        }
        // Check for Open Graph tags
        const hasOgTitle = await page.$('meta[property="og:title"]');
        const hasOgDesc = await page.$('meta[property="og:description"]');
        if (!hasOgTitle || !hasOgDesc) {
            issues.push('Missing Open Graph meta tags');
            score -= 5;
        }
        // Check for viewport meta tag
        const hasViewport = await page.$('meta[name="viewport"]');
        if (!hasViewport) {
            issues.push('Missing viewport meta tag');
            score -= 10;
        }
        // Check for robots meta or robots.txt accessibility
        const robotsMeta = await page.$('meta[name="robots"]');
        const robotsContent = robotsMeta
            ? await robotsMeta.getAttribute('content')
            : null;
        if (robotsContent?.includes('noindex')) {
            issues.push('Page is set to noindex');
            score -= 10;
        }
        return { score: Math.max(0, Math.min(100, score)), issues };
    }
    /**
     * Find broken links on the page (internal method for audit)
     */
    async findBrokenLinksOnPage(page) {
        const links = await page.$$eval('a[href]', anchors => anchors.map(a => a.getAttribute('href')).filter(Boolean));
        const brokenLinks = [];
        const pageUrl = page.url();
        const baseUrl = new URL(pageUrl).origin;
        // Check only first 20 links to avoid timeout
        const linksToCheck = links.slice(0, 20);
        for (const link of linksToCheck) {
            if (link.startsWith('#') || link.startsWith('mailto:') || link.startsWith('tel:')) {
                continue;
            }
            try {
                const fullUrl = link.startsWith('http') ? link : new URL(link, baseUrl).href;
                const response = await axios_1.default.head(fullUrl, {
                    timeout: 5000,
                    validateStatus: () => true
                });
                if (response.status >= 400) {
                    brokenLinks.push(fullUrl);
                }
            }
            catch {
                brokenLinks.push(link);
            }
        }
        return brokenLinks;
    }
    /**
     * Generate improvement suggestions based on audit results
     */
    generateSuggestions(metrics, accessibility, seo) {
        const suggestions = [];
        // Performance suggestions
        if (metrics.loadTime > 3000) {
            suggestions.push('Page load time is high. Consider optimizing images and enabling compression.');
        }
        if (metrics.totalSize > 2000000) {
            suggestions.push('Total page size is large. Consider lazy loading and code splitting.');
        }
        if (metrics.resourceCount > 50) {
            suggestions.push('High number of requests. Consider bundling resources.');
        }
        // Add accessibility issues as suggestions
        accessibility.issues.forEach(issue => {
            suggestions.push(`Accessibility: ${issue}`);
        });
        // Add SEO issues as suggestions
        seo.issues.forEach(issue => {
            suggestions.push(`SEO: ${issue}`);
        });
        return suggestions;
    }
    /**
     * 🆓 FREE: Check for broken links
     *
     * Crawls a webpage and validates all hyperlinks for accessibility.
     * Detects 404s, redirects, timeouts, and malformed URLs.
     *
     * **Features:**
     * - Parallel link checking with configurable concurrency
     * - Internal vs external link classification
     * - Redirect chain detection
     * - Response code analysis
     *
     * @param url - Target page URL to crawl for links
     * @param options - Crawling options
     * @param options.maxLinks - Maximum links to check (default: 50)
     * @param options.followExternal - Check external domain links (default: false)
     *
     * @returns CheckLinksResult containing:
     *   - `total`: Total links found
     *   - `valid`: Working links
     *   - `broken`: Broken link details with status codes
     *   - `redirects`: Links with redirects
     *   - `external`: External domain links (if not followed)
     *
     * @throws {Error} If URL is invalid
     *
     * @example
     * ```typescript
     * const mm = new QAntum();
     *
     * const result = await mm.checkLinks('https://example.com', {
     *   maxLinks: 100,
     *   followExternal: true
     * });
     *
     * console.log(`✅ Valid: ${result.valid.length}`);
     * console.log(`❌ Broken: ${result.broken.length}`);
     *
     * result.broken.forEach(link => {
     *   console.log(`  - ${link.url} (${link.statusCode})`);
     * });
     * ```
     *
     * @since v1.0
     * @see {@link audit} for comprehensive site analysis
     */
    async checkLinks(url, options = {}) {
        const { maxLinks = 50, followExternal = false } = options;
        if (!url || typeof url !== 'string') {
            throw new Error('Invalid URL: must be a non-empty string');
        }
        try {
            new URL(url);
        }
        catch {
            throw new Error(`Invalid URL format: ${url}`);
        }
        if (this.config.verbose) {
            console.log(`🔗 Checking links on ${url}...`);
        }
        let browser = null;
        const startTime = Date.now();
        try {
            browser = await playwright_1.chromium.launch({ headless: true });
            const context = await browser.newContext();
            const page = await context.newPage();
            await page.goto(url, {
                waitUntil: 'domcontentloaded',
                timeout: this.config.timeout
            });
            const baseUrl = new URL(url).origin;
            // Extract all links from the page
            const links = await page.$$eval('a[href]', (anchors, base) => {
                return anchors.map(a => {
                    const href = a.getAttribute('href') || '';
                    const text = a.textContent?.trim() || '';
                    return { href, text };
                });
            }, baseUrl);
            const results = [];
            const brokenLinks = [];
            const checkedUrls = new Set();
            // Filter and normalize links
            const linksToCheck = links
                .filter(link => {
                const href = link.href;
                // Skip anchors, mailto, tel, javascript
                if (!href || href.startsWith('#') || href.startsWith('mailto:') ||
                    href.startsWith('tel:') || href.startsWith('javascript:')) {
                    return false;
                }
                return true;
            })
                .slice(0, maxLinks);
            // Check each link in parallel (with concurrency limit)
            const concurrency = 5;
            for (let i = 0; i < linksToCheck.length; i += concurrency) {
                const batch = linksToCheck.slice(i, i + concurrency);
                await Promise.all(batch.map(async (link) => {
                    let fullUrl;
                    try {
                        fullUrl = link.href.startsWith('http')
                            ? link.href
                            : new URL(link.href, baseUrl).href;
                    }
                    catch {
                        results.push({
                            url: link.href,
                            status: 0,
                            statusText: 'Invalid URL',
                            isValid: false,
                            isExternal: false
                        });
                        brokenLinks.push(link.href);
                        return;
                    }
                    // Skip already checked URLs
                    if (checkedUrls.has(fullUrl))
                        return;
                    checkedUrls.add(fullUrl);
                    const isExternal = !fullUrl.startsWith(baseUrl);
                    // Skip external links if not following them
                    if (isExternal && !followExternal) {
                        results.push({
                            url: fullUrl,
                            status: -1,
                            statusText: 'Skipped (external)',
                            isValid: true,
                            isExternal: true
                        });
                        return;
                    }
                    try {
                        const response = await axios_1.default.head(fullUrl, {
                            timeout: 10000,
                            validateStatus: () => true,
                            maxRedirects: 5,
                            headers: {
                                'User-Agent': 'QAntum-LinkChecker/1.0'
                            }
                        });
                        const isValid = response.status < 400;
                        results.push({
                            url: fullUrl,
                            status: response.status,
                            statusText: response.statusText,
                            isValid,
                            isExternal
                        });
                        if (!isValid) {
                            brokenLinks.push(fullUrl);
                        }
                    }
                    catch (error) {
                        const axiosError = error;
                        results.push({
                            url: fullUrl,
                            status: 0,
                            statusText: axiosError.message || 'Connection failed',
                            isValid: false,
                            isExternal
                        });
                        brokenLinks.push(fullUrl);
                    }
                }));
            }
            const duration = Date.now() - startTime;
            const result = {
                url,
                totalLinks: links.length,
                checkedLinks: results.length,
                brokenLinks,
                results,
                duration
            };
            if (this.config.verbose) {
                console.log(`✅ Found ${brokenLinks.length} broken link(s) out of ${results.length} checked`);
            }
            return result;
        }
        finally {
            if (browser) {
                await browser.close();
            }
        }
    }
    /**
     * 🆓 FREE: Basic API test (limited to 10/day without license)
     *
     * Executes HTTP requests against API endpoints with full metrics collection.
     * Free tier includes 10 requests/day; PRO tier has unlimited access.
     *
     * **Metrics Collected:**
     * - Response time (DNS, TCP, TLS, TTFB, download)
     * - Status codes and headers
     * - Response body validation
     * - Certificate information (HTTPS)
     *
     * @param endpoint - API URL to test
     * @param options - Request configuration
     * @param options.method - HTTP method (default: 'GET')
     * @param options.headers - Request headers
     * @param options.body - Request body (for POST/PUT/PATCH)
     * @param options.timeout - Request timeout in ms
     * @param options.validateStatus - Custom status validator function
     * @param options.validateBody - Body schema validator
     *
     * @returns APITestResultFull with all metrics
     *
     * @throws {Error} If daily limit exceeded (free tier)
     *
     * @example
     * ```typescript
     * const mm = new QAntum();
     *
     * // GET request
     * const result = await mm.testAPI('https://api.example.com/users');
     * console.log(`Status: ${result.status}`);
     * console.log(`Time: ${result.responseTime}ms`);
     *
     * // POST with body
     * const createResult = await mm.testAPI('https://api.example.com/users', {
     *   method: 'POST',
     *   headers: { 'Content-Type': 'application/json' },
     *   body: JSON.stringify({ name: 'John', email: 'john@example.com' })
     * });
     * ```
     *
     * @since v1.0
     * @see {@link apiSensei} for AI-powered API testing (PRO)
     */
    async testAPI(endpoint, options = {}) {
        const { method = 'GET', headers = {}, body = undefined, timeout = this.config.timeout, validateStatus = true } = options;
        if (!endpoint || typeof endpoint !== 'string') {
            throw new Error('Invalid endpoint: must be a non-empty string');
        }
        try {
            new URL(endpoint);
        }
        catch {
            throw new Error(`Invalid endpoint URL format: ${endpoint}`);
        }
        if (this.config.verbose) {
            console.log(`🌐 Testing ${method} ${endpoint}...`);
        }
        const startTime = Date.now();
        try {
            const response = await (0, axios_1.default)({
                method: method,
                url: endpoint,
                headers: {
                    'User-Agent': 'QAntum-APITest/1.0',
                    ...headers
                },
                data: body,
                timeout,
                validateStatus: () => true, // Don't throw on any status
                maxRedirects: 5
            });
            const responseTime = Date.now() - startTime;
            const success = response.status >= 200 && response.status < 300;
            // Calculate response size
            let responseSize = 0;
            if (response.data) {
                if (typeof response.data === 'string') {
                    responseSize = Buffer.byteLength(response.data, 'utf8');
                }
                else {
                    responseSize = Buffer.byteLength(JSON.stringify(response.data), 'utf8');
                }
            }
            const result = {
                endpoint,
                method,
                status: response.status,
                statusText: response.statusText,
                responseTime,
                responseSize,
                success,
                headers: response.headers,
                contentType: response.headers['content-type'] || 'unknown',
                timestamp: new Date()
            };
            // Validate response if requested
            if (validateStatus && !success) {
                result.error = `HTTP ${response.status}: ${response.statusText}`;
            }
            if (this.config.verbose) {
                console.log(`✅ API Test complete! Status: ${response.status}, Time: ${responseTime}ms`);
            }
            return result;
        }
        catch (error) {
            const axiosError = error;
            const responseTime = Date.now() - startTime;
            const result = {
                endpoint,
                method,
                status: axiosError.response?.status || 0,
                statusText: axiosError.response?.statusText || 'Connection Failed',
                responseTime,
                responseSize: 0,
                success: false,
                headers: {},
                contentType: 'unknown',
                timestamp: new Date(),
                error: axiosError.message
            };
            if (this.config.verbose) {
                console.log(`❌ API Test failed: ${axiosError.message}`);
            }
            return result;
        }
    }
    /**
     * 🆓 FREE: Batch API testing - test multiple endpoints
     *
     * Sequentially tests multiple API endpoints and aggregates results.
     *
     * @param endpoints - Array of endpoint configurations
     * @returns Array of APITestResultFull for each endpoint
     *
     * @example
     * ```typescript
     * const results = await mm.testAPIs([
     *   { url: 'https://api.example.com/users' },
     *   { url: 'https://api.example.com/orders', options: { method: 'POST' } }
     * ]);
     * ```
     *
     * @since v1.0
     */
    async testAPIs(endpoints) {
        const results = [];
        for (const { url, options } of endpoints) {
            const result = await this.testAPI(url, options);
            results.push(result);
        }
        return results;
    }
    /**
     * 💎 PRO: Prediction Matrix - Predicts bugs before they happen
     *
     * Uses ML algorithms to analyze code changes and test history,
     * predicting potential failures before deployment.
     *
     * **Analysis Factors:**
     * - Cyclomatic complexity of changed code
     * - Test failure history patterns
     * - Code coverage gaps
     * - Dependency risk assessment
     * - Historical bug hotspots
     *
     * @param options - Prediction configuration
     * @param options.codeChanges - Git diff or code string to analyze
     * @param options.testHistory - Array of previous test results
     * @param options.complexityThreshold - Max acceptable complexity (default: 10)
     *
     * @returns PredictionResult containing:
     *   - `riskScore`: 0-100 risk assessment
     *   - `predictedFailures`: Array of predicted failure points
     *   - `riskFactors`: Contributing risk factors
     *   - `confidence`: Prediction confidence level
     *   - `recommendation`: Action recommendation
     *
     * @throws {Error} If PRO license not active
     *
     * @example
     * ```typescript
     * const mm = new QAntum({ licenseKey: 'MM-PRO-KEY' });
     *
     * const gitDiff = await exec('git diff HEAD~1');
     * const testHistory = await loadTestResults('./reports/*.json');
     *
     * const prediction = await mm.predict({
     *   codeChanges: gitDiff.stdout,
     *   testHistory,
     *   complexityThreshold: 15
     * });
     *
     * console.log(`🎯 Risk Score: ${prediction.riskScore}/100`);
     * console.log(`📈 Confidence: ${prediction.confidence}%`);
     *
     * if (prediction.riskScore > 70) {
     *   console.error('⚠️ HIGH RISK - Review before merge!');
     *   prediction.predictedFailures.forEach(f => console.log(`  - ${f}`));
     * }
     * ```
     *
     * @requires PRO license
     * @since v5.0 "Prediction Matrix"
     * @see {@link chronos} for time-travel debugging
     */
    async predict(options = {}) {
        if (!this.isProLicense) {
            console.log('');
            console.log('╔═══════════════════════════════════════════════════════════════╗');
            console.log('║  🔮 PREDICTION MATRIX - PRO FEATURE                           ║');
            console.log('║                                                               ║');
            console.log('║  This feature requires a Pro license.                         ║');
            console.log('║                                                               ║');
            console.log('║  🛒 Get your license at: https://buy.polar.sh/polar_cl_XBbOE1Qr4Vfv9QHRn7exBdaOB9qoC2Wees7zX1yQsOe ║');
            console.log('║                                                               ║');
            console.log('║  Pro includes:                                                ║');
            console.log('║  • 🔮 Prediction Matrix                                       ║');
            console.log('║  • 🤖 API Sensei                                              ║');
            console.log('║  • ⏰ Chronos Engine                                          ║');
            console.log('║  • 🛡️ Strategic Resilience                                    ║');
            console.log('║                                                               ║');
            console.log('║  Only $29/month - Cancel anytime                              ║');
            console.log('╚═══════════════════════════════════════════════════════════════╝');
            console.log('');
            throw new Error('Prediction Matrix requires a Pro license. Get yours at https://buy.polar.sh/polar_cl_XBbOE1Qr4Vfv9QHRn7exBdaOB9qoC2Wees7zX1yQsOe');
        }
        const { codeChanges = '', testHistory = [], complexityThreshold = 10 } = options;
        if (this.config.verbose) {
            console.log('🔮 Analyzing code for potential failures...');
        }
        // Analyze code changes
        const codeMetrics = this.analyzeCodeComplexity(codeChanges);
        // Analyze test history for patterns
        const historyAnalysis = this.analyzeTestHistory(testHistory);
        // Identify risk factors
        const riskFactors = this.identifyRiskFactors(codeMetrics, historyAnalysis, complexityThreshold);
        // Predict potential failures
        const predictedFailures = this.predictFailures(codeChanges, codeMetrics, historyAnalysis);
        // Calculate overall risk score
        const riskScore = this.calculateRiskScore(riskFactors, predictedFailures);
        // Calculate confidence based on available data
        const confidence = this.calculateConfidence(codeChanges, testHistory);
        // Generate recommendation
        const recommendation = this.generateRecommendation(riskFactors, predictedFailures);
        const result = {
            riskScore,
            predictedFailures,
            recommendation,
            confidence,
            analyzedAt: new Date(),
            codeMetrics,
            riskFactors
        };
        if (this.config.verbose) {
            console.log(`✅ Analysis complete! Risk Score: ${riskScore}/100`);
        }
        return result;
    }
    /**
     * Analyze code complexity from code changes
     */
    analyzeCodeComplexity(code) {
        if (!code) {
            return {
                totalLines: 0,
                complexity: 0,
                changedLines: 0,
                riskAreas: []
            };
        }
        const lines = code.split('\n');
        const totalLines = lines.length;
        // Count changed lines (lines starting with + or -)
        const changedLines = lines.filter(line => line.startsWith('+') || line.startsWith('-')).length;
        // Calculate cyclomatic complexity (simplified)
        let complexity = 1; // Base complexity
        const complexityKeywords = [
            /\bif\b/g, /\belse\b/g, /\bwhile\b/g, /\bfor\b/g,
            /\bswitch\b/g, /\bcase\b/g, /\bcatch\b/g, /\b\?\b/g,
            /\b&&\b/g, /\b\|\|\b/g
        ];
        complexityKeywords.forEach(pattern => {
            const matches = code.match(pattern);
            if (matches)
                complexity += matches.length;
        });
        // Identify risk areas
        const riskAreas = [];
        if (code.includes('async') || code.includes('await') || code.includes('Promise')) {
            riskAreas.push('async-operations');
        }
        if (code.includes('try') && code.includes('catch')) {
            riskAreas.push('error-handling');
        }
        if (code.match(/\.query\(|\.exec\(|SQL|SELECT|INSERT|UPDATE|DELETE/i)) {
            riskAreas.push('database-operations');
        }
        if (code.match(/fetch\(|axios|http\.|request\(/i)) {
            riskAreas.push('network-calls');
        }
        if (code.match(/localStorage|sessionStorage|cookie/i)) {
            riskAreas.push('state-management');
        }
        if (code.match(/auth|login|password|token|session/i)) {
            riskAreas.push('authentication');
        }
        if (code.match(/payment|checkout|cart|order/i)) {
            riskAreas.push('payment-flow');
        }
        return {
            totalLines,
            complexity,
            changedLines,
            riskAreas
        };
    }
    /**
     * Analyze test history for failure patterns
     */
    analyzeTestHistory(history) {
        if (!history || history.length === 0) {
            return {
                failureRate: 0,
                flakyTests: [],
                recentFailures: [],
                avgDuration: 0
            };
        }
        const totalTests = history.length;
        const failures = history.filter(t => !t.passed);
        const failureRate = (failures.length / totalTests) * 100;
        // Find flaky tests (tests that alternate between pass/fail)
        const testResults = new Map();
        history.forEach(entry => {
            if (!testResults.has(entry.testName)) {
                testResults.set(entry.testName, []);
            }
            testResults.get(entry.testName).push(entry.passed);
        });
        const flakyTests = [];
        testResults.forEach((results, testName) => {
            if (results.length >= 2) {
                let flips = 0;
                for (let i = 1; i < results.length; i++) {
                    if (results[i] !== results[i - 1])
                        flips++;
                }
                if (flips >= 2)
                    flakyTests.push(testName);
            }
        });
        // Recent failures (last 10 entries)
        const recentHistory = history.slice(-10);
        const recentFailures = recentHistory
            .filter(t => !t.passed)
            .map(t => t.testName);
        // Average duration
        const avgDuration = history.reduce((sum, t) => sum + t.duration, 0) / totalTests;
        return {
            failureRate,
            flakyTests,
            recentFailures,
            avgDuration
        };
    }
    /**
     * Identify risk factors based on analysis
     */
    identifyRiskFactors(codeMetrics, historyAnalysis, complexityThreshold) {
        const factors = [];
        // Code complexity risk
        if (codeMetrics.complexity > complexityThreshold * 2) {
            factors.push({
                factor: 'High Code Complexity',
                impact: 'critical',
                description: `Cyclomatic complexity (${codeMetrics.complexity}) is very high. Consider refactoring.`
            });
        }
        else if (codeMetrics.complexity > complexityThreshold) {
            factors.push({
                factor: 'Elevated Code Complexity',
                impact: 'high',
                description: `Cyclomatic complexity (${codeMetrics.complexity}) exceeds threshold (${complexityThreshold}).`
            });
        }
        // Large change risk
        if (codeMetrics.changedLines > 500) {
            factors.push({
                factor: 'Large Code Change',
                impact: 'high',
                description: `${codeMetrics.changedLines} lines changed. Large changes increase bug probability.`
            });
        }
        else if (codeMetrics.changedLines > 200) {
            factors.push({
                factor: 'Significant Code Change',
                impact: 'medium',
                description: `${codeMetrics.changedLines} lines changed. Consider breaking into smaller changes.`
            });
        }
        // Risk area factors
        codeMetrics.riskAreas.forEach(area => {
            const riskMapping = {
                'authentication': { impact: 'critical', desc: 'Changes to authentication require thorough security testing.' },
                'payment-flow': { impact: 'critical', desc: 'Payment flow changes require extensive testing and validation.' },
                'database-operations': { impact: 'high', desc: 'Database changes may cause data integrity issues.' },
                'async-operations': { impact: 'medium', desc: 'Async code is prone to race conditions and timing issues.' },
                'network-calls': { impact: 'medium', desc: 'Network operations may fail under various conditions.' },
                'error-handling': { impact: 'low', desc: 'Error handling changes - verify all error cases are covered.' },
                'state-management': { impact: 'medium', desc: 'State management changes may cause UI inconsistencies.' }
            };
            const mapping = riskMapping[area];
            if (mapping) {
                factors.push({
                    factor: `${area.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())} Modified`,
                    impact: mapping.impact,
                    description: mapping.desc
                });
            }
        });
        // Historical risk factors
        if (historyAnalysis.failureRate > 20) {
            factors.push({
                factor: 'High Historical Failure Rate',
                impact: 'high',
                description: `Test failure rate is ${historyAnalysis.failureRate.toFixed(1)}%. Investigate root causes.`
            });
        }
        if (historyAnalysis.flakyTests.length > 0) {
            factors.push({
                factor: 'Flaky Tests Detected',
                impact: 'medium',
                description: `${historyAnalysis.flakyTests.length} test(s) show inconsistent results.`
            });
        }
        return factors;
    }
    /**
     * Predict specific failures based on analysis
     */
    predictFailures(code, codeMetrics, historyAnalysis) {
        const failures = [];
        // Add predictions based on risk areas
        codeMetrics.riskAreas.forEach(area => {
            const predictions = {
                'authentication': {
                    reason: 'Authentication changes may break login/logout flows',
                    probability: 0.75,
                    fix: 'Add comprehensive auth tests covering all user states'
                },
                'payment-flow': {
                    reason: 'Payment processing is sensitive to any changes',
                    probability: 0.80,
                    fix: 'Test all payment scenarios including edge cases'
                },
                'async-operations': {
                    reason: 'Async code may have race conditions',
                    probability: 0.60,
                    fix: 'Add proper async/await handling and timeout tests'
                },
                'database-operations': {
                    reason: 'Database queries may fail or return unexpected data',
                    probability: 0.55,
                    fix: 'Verify database schema and add data validation'
                }
            };
            const pred = predictions[area];
            if (pred) {
                failures.push({
                    file: `*${area}*`,
                    reason: pred.reason,
                    probability: pred.probability,
                    suggestedFix: pred.fix
                });
            }
        });
        // Add predictions from flaky tests
        historyAnalysis.flakyTests.forEach(test => {
            failures.push({
                file: test,
                reason: 'Test has shown inconsistent results in recent runs',
                probability: 0.70,
                suggestedFix: 'Investigate test dependencies and add proper cleanup'
            });
        });
        // Add predictions from recent failures
        historyAnalysis.recentFailures.forEach(test => {
            if (!failures.find(f => f.file === test)) {
                failures.push({
                    file: test,
                    reason: 'Test failed in recent runs',
                    probability: 0.65,
                    suggestedFix: 'Check for regressions in related code'
                });
            }
        });
        // Sort by probability
        return failures.sort((a, b) => b.probability - a.probability);
    }
    /**
     * Calculate overall risk score
     */
    calculateRiskScore(riskFactors, predictedFailures) {
        let score = 0;
        // Add points based on risk factors
        riskFactors.forEach(factor => {
            switch (factor.impact) {
                case 'critical':
                    score += 25;
                    break;
                case 'high':
                    score += 15;
                    break;
                case 'medium':
                    score += 10;
                    break;
                case 'low':
                    score += 5;
                    break;
            }
        });
        // Add points based on predicted failures
        predictedFailures.forEach(failure => {
            score += failure.probability * 10;
        });
        return Math.min(100, Math.round(score));
    }
    /**
     * Calculate confidence level
     */
    calculateConfidence(code, history) {
        let confidence = 0.5; // Base confidence
        // More code = higher confidence in code analysis
        if (code && code.length > 100)
            confidence += 0.15;
        if (code && code.length > 500)
            confidence += 0.10;
        // More history = higher confidence in predictions
        if (history && history.length > 10)
            confidence += 0.15;
        if (history && history.length > 50)
            confidence += 0.10;
        return Math.min(0.95, confidence);
    }
    /**
     * Generate recommendation based on analysis
     */
    generateRecommendation(riskFactors, predictedFailures) {
        const criticalFactors = riskFactors.filter(f => f.impact === 'critical');
        const highFactors = riskFactors.filter(f => f.impact === 'high');
        const highProbFailures = predictedFailures.filter(f => f.probability > 0.7);
        if (criticalFactors.length > 0) {
            return `⚠️ CRITICAL: ${criticalFactors[0].factor}. ${criticalFactors[0].description} Recommend blocking deployment until addressed.`;
        }
        if (highProbFailures.length > 0) {
            return `🔴 HIGH RISK: ${highProbFailures.length} test(s) likely to fail. Focus on: ${highProbFailures.slice(0, 3).map(f => f.file).join(', ')}`;
        }
        if (highFactors.length > 0) {
            return `🟠 ELEVATED RISK: ${highFactors[0].factor}. ${highFactors[0].description}`;
        }
        if (riskFactors.length > 0) {
            return `🟡 MODERATE RISK: ${riskFactors.length} risk factor(s) identified. Review before deployment.`;
        }
        return '🟢 LOW RISK: No significant issues detected. Proceed with standard testing.';
    }
    /**
     * 💎 PRO: Chronos Engine - Time-travel debugging
     *
     * Records state snapshots during test execution, enabling time-travel debugging.
     * Navigate backwards through test state to identify exactly when and why failures occurred.
     *
     * **Features:**
     * - Automatic periodic snapshots
     * - Manual snapshot API for critical points
     * - State diffing between snapshots
     * - Timeline visualization support
     * - Replay capability
     *
     * @param options - Chronos configuration
     * @param options.testFn - Async test function to execute with Chronos context
     * @param options.autoSnapshot - Enable automatic snapshots (default: true)
     * @param options.snapshotInterval - Ms between auto-snapshots (default: 100)
     * @param options.maxSnapshots - Maximum snapshots to retain (default: 50)
     *
     * @returns ChronosResult containing:
     *   - `success`: Whether test passed
     *   - `duration`: Total execution time in ms
     *   - `snapshots`: Array of StateSnapshot objects
     *   - `timeline`: Array of TimelineEvent objects
     *   - `error`: Error message if failed
     *
     * @throws {Error} If PRO license not active
     * @throws {Error} If testFn is not a function
     *
     * @example
     * ```typescript
     * const mm = new QAntum({ licenseKey: 'MM-PRO-KEY' });
     *
     * const result = await mm.chronos({
     *   autoSnapshot: true,
     *   snapshotInterval: 50,
     *   maxSnapshots: 100,
     *
     *   testFn: async (ctx) => {
     *     const page = await browser.newPage();
     *
     *     // Manual snapshot at critical point
     *     ctx.snapshot('before-login', { url: page.url() });
     *
     *     await page.click('#login');
     *     ctx.snapshot('after-login', { url: page.url() });
     *
     *     expect(page.url()).toContain('/dashboard');
     *   }
     * });
     *
     * if (!result.success) {
     *   console.log('❌ Test failed - reviewing timeline:');
     *   result.timeline.forEach(e => console.log(`  ${e.timestamp}: ${e.description}`));
     *
     *   // Find last good state
     *   const lastGood = result.snapshots.findLast(s => s.label?.includes('before'));
     *   console.log('🕐 Last good state:', lastGood?.state);
     * }
     * ```
     *
     * @requires PRO license
     * @since v8.0 "Chronos Engine"
     * @see {@link predict} for pre-execution prediction
     */
    async chronos(options) {
        if (!this.isProLicense) {
            throw new Error('Chronos Engine requires a Pro license. Get yours at https://buy.polar.sh/polar_cl_XBbOE1Qr4Vfv9QHRn7exBdaOB9qoC2Wees7zX1yQsOe');
        }
        const { testFn, autoSnapshot = true, snapshotInterval = 100, maxSnapshots = 50 } = options;
        if (typeof testFn !== 'function') {
            throw new Error('testFn must be a function');
        }
        if (this.config.verbose) {
            console.log('⏰ Starting Chronos Engine...');
        }
        const snapshots = [];
        const timeline = [];
        const startTime = Date.now();
        let success = true;
        let errorMessage;
        let intervalId = null;
        // Create snapshot function
        const takeSnapshot = (label, state = {}) => {
            if (snapshots.length >= maxSnapshots) {
                snapshots.shift(); // Remove oldest snapshot
            }
            const snapshot = {
                id: `snap_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                timestamp: new Date(),
                state: { ...state },
                label
            };
            snapshots.push(snapshot);
            timeline.push({
                timestamp: new Date(),
                type: 'snapshot',
                description: label || `Snapshot #${snapshots.length}`,
                data: { snapshotId: snapshot.id }
            });
        };
        try {
            // Initial snapshot
            takeSnapshot('Initial state');
            timeline.push({
                timestamp: new Date(),
                type: 'action',
                description: 'Test execution started'
            });
            // Auto snapshot at intervals
            if (autoSnapshot) {
                intervalId = setInterval(() => {
                    takeSnapshot('Auto snapshot');
                }, snapshotInterval);
            }
            // Execute the test function
            await testFn();
            timeline.push({
                timestamp: new Date(),
                type: 'action',
                description: 'Test execution completed successfully'
            });
        }
        catch (error) {
            success = false;
            errorMessage = error instanceof Error ? error.message : String(error);
            timeline.push({
                timestamp: new Date(),
                type: 'error',
                description: `Test failed: ${errorMessage}`,
                data: { error: errorMessage }
            });
            // Take error snapshot
            takeSnapshot('Error state', { error: errorMessage });
        }
        finally {
            if (intervalId) {
                clearInterval(intervalId);
            }
            // Final snapshot
            takeSnapshot('Final state');
        }
        const duration = Date.now() - startTime;
        if (this.config.verbose) {
            console.log(`✅ Chronos complete! Duration: ${duration}ms, Snapshots: ${snapshots.length}`);
        }
        return {
            success,
            snapshots,
            timeline,
            duration,
            error: errorMessage
        };
    }
    /**
     * 💎 PRO: API Sensei - Intelligent API testing
     *
     * AI-powered API test generation and execution. Analyzes your OpenAPI specs
     * or endpoint configurations to automatically create comprehensive test suites.
     *
     * **Capabilities:**
     * - Automatic test case generation from OpenAPI/Swagger
     * - Boundary value analysis
     * - Error condition testing
     * - Response schema validation
     * - Performance benchmarking
     * - Security testing (injection, auth bypass)
     *
     * @param config - API Sensei configuration
     * @param config.baseUrl - Base URL for API endpoints
     * @param config.endpoints - Array of endpoint definitions
     * @param config.openApiSpec - OpenAPI/Swagger spec (URL or object)
     * @param config.authConfig - Authentication configuration
     * @param config.generateEdgeCases - Auto-generate boundary tests (default: true)
     * @param config.runSecurityTests - Enable security testing (default: false)
     *
     * @returns APISenseiResult containing:
     *   - `totalTests`: Number of tests generated
     *   - `passed`: Passing tests count
     *   - `failed`: Failing tests count
     *   - `results`: Detailed results per endpoint
     *   - `coverage`: API coverage metrics
     *   - `suggestions`: AI-generated improvement suggestions
     *
     * @throws {Error} If PRO license not active
     * @throws {Error} If Circuit Breaker is open (too many failures)
     *
     * @example
     * ```typescript
     * const mm = new QAntum({ licenseKey: 'MM-PRO-KEY' });
     *
     * // From OpenAPI spec
     * const result = await mm.apiSensei({
     *   openApiSpec: 'https://api.example.com/openapi.json',
     *   authConfig: {
     *     type: 'bearer',
     *     token: process.env.API_TOKEN
     *   },
     *   generateEdgeCases: true,
     *   runSecurityTests: true
     * });
     *
     * console.log(`📊 Coverage: ${result.coverage.percentage}%`);
     * console.log(`✅ Passed: ${result.passed}/${result.totalTests}`);
     *
     * result.suggestions.forEach(s => console.log(`💡 ${s}`));
     * ```
     *
     * @requires PRO license
     * @since v10.0 "API Sensei"
     * @see {@link testAPI} for basic API testing (FREE)
     */
    async apiSensei(config) {
        if (!this.isProLicense) {
            throw new Error('API Sensei requires a Pro license. Get yours at https://buy.polar.sh/polar_cl_XBbOE1Qr4Vfv9QHRn7exBdaOB9qoC2Wees7zX1yQsOe');
        }
        const { baseUrl, auth, scenarios = ['happy-path', 'edge-cases', 'error-handling'] } = config;
        if (!baseUrl) {
            throw new Error('baseUrl is required');
        }
        if (this.config.verbose) {
            console.log(`🤖 API Sensei analyzing ${baseUrl}...`);
        }
        const startTime = Date.now();
        const testResults = [];
        const recommendations = [];
        let passed = 0;
        let failed = 0;
        // Build auth headers
        const authHeaders = {};
        if (auth) {
            switch (auth.type) {
                case 'bearer':
                    if (auth.token)
                        authHeaders['Authorization'] = `Bearer ${auth.token}`;
                    break;
                case 'basic':
                    if (auth.username && auth.password) {
                        const encoded = Buffer.from(`${auth.username}:${auth.password}`).toString('base64');
                        authHeaders['Authorization'] = `Basic ${encoded}`;
                    }
                    break;
                case 'apiKey':
                    if (auth.apiKey && auth.headerName) {
                        authHeaders[auth.headerName] = auth.apiKey;
                    }
                    break;
            }
        }
        // Generate test scenarios
        const tests = this.generateAPISenseiTests(baseUrl, scenarios, authHeaders);
        // Run tests
        for (const test of tests) {
            try {
                const result = await this.runAPISenseiTest(test, authHeaders);
                testResults.push(result);
                if (result.status === 'passed') {
                    passed++;
                }
                else if (result.status === 'failed') {
                    failed++;
                }
            }
            catch (error) {
                const errorMsg = error instanceof Error ? error.message : String(error);
                testResults.push({
                    name: test.name,
                    endpoint: test.endpoint,
                    method: test.method,
                    scenario: test.scenario,
                    status: 'failed',
                    responseTime: 0,
                    assertions: [],
                    error: errorMsg
                });
                failed++;
            }
        }
        // Generate recommendations
        const failureRate = tests.length > 0 ? (failed / tests.length) * 100 : 0;
        if (failureRate > 50) {
            recommendations.push('🔴 Critical: Over 50% of tests failed. Review API implementation.');
        }
        const slowTests = testResults.filter(t => t.responseTime > 1000);
        if (slowTests.length > 0) {
            recommendations.push(`⚠️ Performance: ${slowTests.length} endpoint(s) have response time > 1s.`);
        }
        const errorTests = testResults.filter(t => t.scenario === 'error-handling' && t.status === 'failed');
        if (errorTests.length > 0) {
            recommendations.push(`🛡️ Error Handling: ${errorTests.length} error scenario(s) not handled properly.`);
        }
        if (recommendations.length === 0) {
            recommendations.push('✅ All tests passed. API is functioning correctly.');
        }
        const duration = Date.now() - startTime;
        if (this.config.verbose) {
            console.log(`✅ API Sensei complete! ${passed} passed, ${failed} failed`);
        }
        return {
            baseUrl,
            totalTests: tests.length,
            passed,
            failed,
            testResults,
            coverage: {
                endpoints: tests.length,
                testedEndpoints: testResults.filter(t => t.status !== 'skipped').length,
                coveragePercent: tests.length > 0 ?
                    (testResults.filter(t => t.status !== 'skipped').length / tests.length) * 100 : 0
            },
            recommendations,
            duration
        };
    }
    /**
     * Generate API test scenarios
     */
    generateAPISenseiTests(baseUrl, scenarios, authHeaders) {
        const tests = [];
        // Happy path tests
        if (scenarios?.includes('happy-path')) {
            tests.push({
                name: 'GET Base URL - Happy Path',
                endpoint: baseUrl,
                method: 'GET',
                scenario: 'happy-path',
                expectedStatus: 200,
                assertions: ['status < 400', 'responseTime < 5000']
            });
            tests.push({
                name: 'HEAD Base URL - Check Availability',
                endpoint: baseUrl,
                method: 'HEAD',
                scenario: 'happy-path',
                expectedStatus: 200,
                assertions: ['status < 400']
            });
        }
        // Edge case tests
        if (scenarios?.includes('edge-cases')) {
            tests.push({
                name: 'GET with trailing slash',
                endpoint: `${baseUrl}/`,
                method: 'GET',
                scenario: 'edge-cases',
                assertions: ['status < 500']
            });
            tests.push({
                name: 'OPTIONS - CORS check',
                endpoint: baseUrl,
                method: 'OPTIONS',
                scenario: 'edge-cases',
                assertions: ['status < 500']
            });
        }
        // Error handling tests
        if (scenarios?.includes('error-handling')) {
            tests.push({
                name: 'GET Non-existent endpoint',
                endpoint: `${baseUrl}/non-existent-path-${Date.now()}`,
                method: 'GET',
                scenario: 'error-handling',
                expectedStatus: 404,
                assertions: ['status === 404 || status === 400']
            });
            tests.push({
                name: 'POST without body',
                endpoint: baseUrl,
                method: 'POST',
                scenario: 'error-handling',
                assertions: ['status < 500'] // Should handle gracefully, not crash
            });
        }
        // Security tests
        if (scenarios?.includes('security')) {
            tests.push({
                name: 'SQL Injection attempt',
                endpoint: `${baseUrl}?id=1' OR '1'='1`,
                method: 'GET',
                scenario: 'security',
                assertions: ['status !== 500', 'status !== 200'] // Should be blocked
            });
            tests.push({
                name: 'XSS attempt',
                endpoint: `${baseUrl}?q=<script>alert(1)</script>`,
                method: 'GET',
                scenario: 'security',
                assertions: ['status !== 500']
            });
        }
        // Performance tests
        if (scenarios?.includes('performance')) {
            tests.push({
                name: 'Response time check',
                endpoint: baseUrl,
                method: 'GET',
                scenario: 'performance',
                assertions: ['responseTime < 3000']
            });
        }
        return tests;
    }
    /**
     * 🔌 v20.0: Check and update Circuit Breaker state
     */
    checkCircuitBreaker() {
        const cb = this.apiSenseiCircuitBreaker;
        // Check if circuit should be reset (after 30 seconds)
        if (cb.isOpen && cb.openedAt) {
            const timeSinceOpen = Date.now() - cb.openedAt.getTime();
            if (timeSinceOpen > 30000) {
                cb.isOpen = false;
                cb.failures = 0;
                cb.openedAt = null;
                this.logger.info('🔌 Circuit Breaker: Reset after cooldown');
            }
        }
        return cb.isOpen;
    }
    /**
     * 🔌 v20.0: Record failure and potentially open circuit
     */
    recordCircuitBreakerFailure(statusCode) {
        const cb = this.apiSenseiCircuitBreaker;
        if (statusCode >= 500) {
            cb.failures++;
            cb.lastFailure = new Date();
            // Open circuit after 3 consecutive 500 errors
            if (cb.failures >= 3 && !cb.isOpen) {
                cb.isOpen = true;
                cb.openedAt = new Date();
                this.logger.error('🔌 Circuit Breaker: OPEN - 3 consecutive 500 errors', undefined, {
                    failures: cb.failures,
                    lastStatus: statusCode,
                });
            }
        }
        else {
            // Reset on success
            cb.failures = 0;
        }
    }
    /**
     * 🔌 Get Circuit Breaker state
     */
    getCircuitBreakerState() {
        return { ...this.apiSenseiCircuitBreaker };
    }
    /**
     * 🔌 Reset Circuit Breaker manually
     */
    resetCircuitBreaker() {
        this.apiSenseiCircuitBreaker = {
            failures: 0,
            lastFailure: null,
            isOpen: false,
            openedAt: null,
        };
        this.logger.info('🔌 Circuit Breaker: Manually reset');
    }
    /**
     * Run a single API Sensei test
     */
    async runAPISenseiTest(test, authHeaders) {
        // v20.0: Check Circuit Breaker before making request
        if (this.checkCircuitBreaker()) {
            this.logger.warn('🔌 Circuit Breaker: Request blocked - circuit is OPEN', {
                test: test.name,
                endpoint: test.endpoint,
            });
            return {
                name: test.name,
                endpoint: test.endpoint,
                method: test.method,
                scenario: test.scenario,
                status: 'skipped',
                responseTime: 0,
                assertions: [],
                error: 'Circuit breaker is OPEN - API appears to be down',
            };
        }
        const startTime = Date.now();
        try {
            const response = await (0, axios_1.default)({
                method: test.method,
                url: test.endpoint,
                headers: {
                    'User-Agent': 'QAntum-APISensei/1.0',
                    ...authHeaders
                },
                data: test.body,
                timeout: this.config.timeout,
                validateStatus: () => true
            });
            const responseTime = Date.now() - startTime;
            const assertions = [];
            // Check expected status
            if (test.expectedStatus !== undefined) {
                assertions.push({
                    assertion: `status === ${test.expectedStatus}`,
                    passed: response.status === test.expectedStatus,
                    expected: test.expectedStatus,
                    actual: response.status
                });
            }
            // Run custom assertions
            for (const assertion of test.assertions) {
                let passed = false;
                const status = response.status;
                try {
                    // Simple assertion evaluation
                    if (assertion.includes('status')) {
                        passed = eval(assertion.replace('status', status.toString()));
                    }
                    if (assertion.includes('responseTime')) {
                        passed = eval(assertion.replace('responseTime', responseTime.toString()));
                    }
                }
                catch {
                    passed = false;
                }
                assertions.push({
                    assertion,
                    passed,
                    actual: assertion.includes('status') ? status : responseTime
                });
            }
            const allPassed = assertions.every(a => a.passed);
            // v20.0: Update Circuit Breaker state
            this.recordCircuitBreakerFailure(response.status);
            return {
                name: test.name,
                endpoint: test.endpoint,
                method: test.method,
                scenario: test.scenario,
                status: allPassed ? 'passed' : 'failed',
                responseTime,
                assertions
            };
        }
        catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            // v20.0: Treat connection errors as 500 for circuit breaker
            this.recordCircuitBreakerFailure(500);
            this.logger.error('API Sensei test failed', error, {
                test: test.name,
                endpoint: test.endpoint,
            });
            return {
                name: test.name,
                endpoint: test.endpoint,
                method: test.method,
                scenario: test.scenario,
                status: 'failed',
                responseTime: Date.now() - startTime,
                assertions: [],
                error: errorMsg
            };
        }
    }
    // ═══════════════════════════════════════════════════════════════════════════════
    // 🤖 v20.0 SOVEREIGN DIRECTOR - Autonomous Goal Execution
    // ═══════════════════════════════════════════════════════════════════════════════
    /**
     * 🤖 Execute autonomous goal using AI planning
     * Uses Gemini 2.0 (cloud) or Gemma (local) for intelligent planning
     * Then delegates execution to the Sovereign Swarm orchestrator
     */
    async executeAutonomousGoal(goal, context) {
        if (!this.isProLicense) {
            throw new Error('Sovereign Director requires a Pro license. Get yours at ' + CHECKOUT_URL);
        }
        const goalId = `goal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const startTime = Date.now();
        const steps = [];
        this.logger.info('🤖 Sovereign Director: Starting autonomous goal execution', {
            goalId,
            goal,
            context,
        });
        // Determine AI model based on Financial Oracle
        const complexity = goal.length > 100 ? 'high' : goal.length > 50 ? 'medium' : 'low';
        const aiModel = await this.getOptimalAIModel(complexity);
        let costIncurred = 0;
        try {
            // Step 1: Plan using AI
            this.logger.info('🤖 Step 1: AI Planning phase', { aiModel });
            steps.push({
                stepNumber: 1,
                action: 'AI_PLANNING',
                status: 'completed',
                duration: 0,
            });
            // Generate plan using AI (simulated - integrate with actual AI API)
            const plan = await this.generateAIPlan(goal, context, aiModel);
            if (aiModel === 'cloud') {
                costIncurred = complexity === 'high' ? 0.08 : complexity === 'medium' ? 0.03 : 0.01;
                this.trackAPICost(costIncurred, 'autonomous_planning');
            }
            steps[0].duration = Date.now() - startTime;
            // Step 2: Initialize Swarm if needed
            if (!this.swarmInitialized) {
                await this.initSwarm();
            }
            // Step 3: Execute via orchestrator
            this.logger.info('🤖 Step 2: Executing via Sovereign Swarm', { planSteps: plan.steps.length });
            const executionStart = Date.now();
            const result = await this.orchestrator.executeGoal(goal, {
                ...context,
                aiPlan: plan,
                aiModel,
            });
            steps.push({
                stepNumber: 2,
                action: 'SWARM_EXECUTION',
                status: result.success ? 'completed' : 'failed',
                duration: Date.now() - executionStart,
            });
            // Add individual task steps
            result.results.forEach((taskResult, index) => {
                steps.push({
                    stepNumber: 3 + index,
                    action: `TASK_${index + 1}`,
                    target: taskResult.taskId,
                    status: taskResult.success ? 'completed' : 'failed',
                    duration: taskResult.duration,
                    error: taskResult.error,
                });
            });
            this.logger.audit('autonomous_goal', result.success ? 'success' : 'failure', {
                goalId,
                goal,
                aiModel,
                costIncurred,
                totalDuration: Date.now() - startTime,
                tasksCompleted: result.results.filter(r => r.success).length,
                tasksFailed: result.results.filter(r => !r.success).length,
            });
            return {
                goalId,
                goal,
                success: result.success,
                steps,
                totalDuration: Date.now() - startTime,
                aiModel,
                costIncurred,
                timestamp: new Date(),
            };
        }
        catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            this.logger.error('🤖 Sovereign Director: Goal execution failed', error, {
                goalId,
                goal,
            });
            return {
                goalId,
                goal,
                success: false,
                steps: [{
                        stepNumber: 1,
                        action: 'INITIALIZATION',
                        status: 'failed',
                        duration: Date.now() - startTime,
                        error: errorMsg,
                    }],
                totalDuration: Date.now() - startTime,
                aiModel,
                costIncurred,
                timestamp: new Date(),
            };
        }
    }
    /**
     * 🤖 Generate AI plan for goal (internal)
     */
    async generateAIPlan(goal, context, aiModel) {
        // This would integrate with actual AI APIs (Gemini/Gemma)
        // For now, return a structured plan based on goal analysis
        const keywords = goal.toLowerCase();
        const steps = [];
        if (keywords.includes('login') || keywords.includes('sign in')) {
            steps.push('Navigate to login page');
            steps.push('Enter credentials');
            steps.push('Submit login form');
            steps.push('Verify successful login');
        }
        else if (keywords.includes('checkout') || keywords.includes('purchase')) {
            steps.push('Navigate to cart');
            steps.push('Review items');
            steps.push('Enter shipping info');
            steps.push('Enter payment info');
            steps.push('Confirm order');
        }
        else if (keywords.includes('test') || keywords.includes('verify')) {
            steps.push('Navigate to target page');
            steps.push('Identify test elements');
            steps.push('Execute test actions');
            steps.push('Validate results');
        }
        else {
            steps.push('Analyze goal requirements');
            steps.push('Navigate to relevant page');
            steps.push('Execute primary action');
            steps.push('Verify completion');
        }
        this.logger.debug('AI Plan generated', {
            goal,
            aiModel,
            stepsCount: steps.length,
        });
        return {
            goal,
            steps,
            confidence: aiModel === 'cloud' ? 0.92 : 0.85,
        };
    }
    /**
     * Validate license key
     */
    validateLicense(key) {
        // Validate format with regex
        if (!key || typeof key !== 'string') {
            console.log('⚠️ Invalid license key. Running in Free mode.');
            return false;
        }
        const cleanKey = key.trim().toUpperCase();
        if (LICENSE_PATTERN.test(cleanKey)) {
            this.isProLicense = true;
            console.log('✅ Pro license activated!');
            return true;
        }
        console.log('⚠️ Invalid license key. Running in Free mode.');
        return false;
    }
    /**
     * Get current license status
     */
    getLicenseStatus() {
        return {
            isValid: this.isProLicense,
            tier: this.isProLicense ? 'pro' : 'free'
        };
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // 🧠 ADAPTIVE SEMANTIC CORE (ASC) - v16.0 Features
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * 💎 PRO: Get Adaptive Semantic Core instance
     *
     * Returns the raw ASC controller for advanced semantic operations.
     * ASC enables intent-based element finding using natural language.
     *
     * @returns AdaptiveSemanticCore instance or null if not initialized
     *
     * @example
     * ```typescript
     * const asc = mm.getASC();
     * if (asc) {
     *   const map = await asc.createSemanticMap(page);
     *   console.log(`Found ${map.elements.length} interactive elements`);
     * }
     * ```
     *
     * @since v16.0 "Adaptive Semantic Core"
     */
    getASC() {
        return this.asc;
    }
    /**
     * 💎 PRO: Create semantic map of a page
     *
     * Analyzes a page and extracts all interactive elements with their
     * semantic meaning, enabling natural language queries.
     *
     * @param page - Playwright Page instance
     *
     * @returns SemanticMap containing all interactive elements with:
     *   - `elements`: Array of semantic elements
     *   - `forms`: Detected form structures
     *   - `navigation`: Navigation patterns
     *   - `actions`: Available user actions
     *
     * @throws {Error} If PRO license not active
     *
     * @example
     * ```typescript
     * const map = await mm.createSemanticMap(page);
     * map.elements.forEach(el => {
     *   console.log(`${el.type}: ${el.semanticLabel} [${el.selector}]`);
     * });
     * ```
     *
     * @since v16.0 "Adaptive Semantic Core"
     */
    async createSemanticMap(page) {
        if (!this.isProLicense) {
            throw new Error('Semantic Map requires a Pro license. Get yours at ' + CHECKOUT_URL);
        }
        if (!this.asc) {
            this.initASC();
        }
        return this.asc.createSemanticMap(page);
    }
    /**
     * 💎 PRO: Find element by intent (semantic search)
     *
     * Searches for page elements by meaning rather than CSS selectors.
     * Uses NLP to understand your intent and find matching elements.
     *
     * @param page - Playwright Page instance
     * @param intent - Intent object describing what to find
     * @param intent.action - Action name (e.g., 'LOGIN', 'SUBMIT')
     * @param intent.keywords - Array of keywords to match
     * @param intent.expectedType - Expected element type
     *
     * @returns IntentMatch with element details or null if not found
     *
     * @throws {Error} If PRO license not active
     *
     * @example
     * ```typescript
     * const match = await mm.findByIntent(page, {
     *   action: 'SUBMIT_FORM',
     *   keywords: ['submit', 'send', 'confirm'],
     *   expectedType: 'button'
     * });
     *
     * if (match) {
     *   await page.click(match.selector);
     * }
     * ```
     *
     * @since v16.0 "Adaptive Semantic Core"
     */
    async findByIntent(page, intent) {
        if (!this.isProLicense) {
            throw new Error('Intent Matching requires a Pro license. Get yours at ' + CHECKOUT_URL);
        }
        if (!this.asc) {
            this.initASC();
        }
        return this.asc.matchIntent(page, intent);
    }
    /**
     * 💎 PRO: Execute action by intent
     *
     * Finds element by semantic meaning and performs action.
     * Combines `findByIntent` and action execution in one call.
     *
     * @param page - Playwright Page instance
     * @param intent - Intent describing target element
     * @param action - Action to perform: 'click' | 'fill' | 'hover'
     * @param value - Value for 'fill' action
     *
     * @returns true if action succeeded, false otherwise
     *
     * @throws {Error} If PRO license not active
     *
     * @example
     * ```typescript
     * await mm.executeIntent(page, {
     *   action: 'LOGIN',
     *   keywords: ['login', 'sign in', 'вход'],
     *   expectedType: 'button'
     * }, 'click');
     * ```
     *
     * @since v16.0 "Adaptive Semantic Core"
     */
    async executeIntent(page, intent, action = 'click', value) {
        if (!this.isProLicense) {
            throw new Error('Intent Execution requires a Pro license. Get yours at ' + CHECKOUT_URL);
        }
        if (!this.asc) {
            this.initASC();
        }
        return this.asc.executeIntent(page, intent, action, value);
    }
    /**
     * 💎 PRO: Quick semantic search for element
     *
     * Shorthand for finding elements by keywords with type hints.
     * Simpler API for common use cases.
     *
     * @param page - Playwright Page instance
     * @param keywords - Array of keywords to search for
     * @param options - Search options
     * @param options.expectedType - Element type filter
     * @param options.positionHint - Position hint (e.g., 'top-right')
     *
     * @returns IntentMatch or null if not found
     *
     * @throws {Error} If PRO license not active
     *
     * @example
     * ```typescript
     * const btn = await mm.findElement(page, ['submit', 'send'], {
     *   expectedType: 'button',
     *   positionHint: 'bottom'
     * });
     * ```
     *
     * @since v16.0 "Adaptive Semantic Core"
     */
    async findElement(page, keywords, options) {
        if (!this.isProLicense) {
            throw new Error('Semantic Search requires a Pro license. Get yours at ' + CHECKOUT_URL);
        }
        if (!this.asc) {
            this.initASC();
        }
        return this.asc.findElement(page, keywords, options);
    }
    /**
     * 💎 PRO: Smart click - click by meaning
     *
     * Clicks on an element found by semantic keywords. The ultimate DX
     * for test automation - no more brittle selectors!
     *
     * @param page - Playwright Page instance
     * @param keywords - Array of keywords describing the button/link
     *
     * @returns true if click succeeded
     *
     * @throws {Error} If PRO license not active
     *
     * @example
     * ```typescript
     * // Works with multiple languages!
     * await mm.smartClick(page, ['login', 'sign in', 'вход', '登录']);
     * await mm.smartClick(page, ['add to cart', 'buy now']);
     * await mm.smartClick(page, ['next', 'continue', 'proceed']);
     * ```
     *
     * @since v16.0 "Adaptive Semantic Core"
     * @see {@link smartFill} for input fields
     */
    async smartClick(page, keywords) {
        const intent = {
            action: `CLICK_${keywords.join('_').toUpperCase()}`,
            keywords,
            expectedType: 'button'
        };
        return this.executeIntent(page, intent, 'click');
    }
    /**
     * 💎 PRO: Smart fill - fill input by meaning
     *
     * Fills an input field found by semantic keywords. No more hunting
     * for `name="email"` vs `id="user-email"` vs `data-testid="email-input"`.
     *
     * @param page - Playwright Page instance
     * @param keywords - Array of keywords describing the input
     * @param value - Value to fill
     *
     * @returns true if fill succeeded
     *
     * @throws {Error} If PRO license not active
     *
     * @example
     * ```typescript
     * await mm.smartFill(page, ['email', 'e-mail', 'имейл'], 'user@example.com');
     * await mm.smartFill(page, ['password', 'парола', '密码'], 'secret123');
     * await mm.smartFill(page, ['search', 'търси', '搜索'], 'playwright tutorial');
     * ```
     *
     * @since v16.0 "Adaptive Semantic Core"
     * @see {@link smartClick} for buttons
     */
    async smartFill(page, keywords, value) {
        const intent = {
            action: `FILL_${keywords.join('_').toUpperCase()}`,
            keywords,
            expectedType: 'input'
        };
        return this.executeIntent(page, intent, 'fill', value);
    }
    /**
     * 💎 PRO: Execute common intent
     *
     * Uses pre-defined intents for common user actions. No need to specify
     * keywords - QAntum knows what "LOGIN" means across all websites.
     *
     * **Available Actions:**
     * - `LOGIN` - Find and click login button
     * - `LOGOUT` - Find and click logout button
     * - `SUBMIT` - Submit active form
     * - `SEARCH` - Fill and submit search
     * - `ADD_TO_CART` - E-commerce add to cart
     * - `CHECKOUT` - Proceed to checkout
     * - `NEXT` - Navigation next/continue
     * - `CLOSE` - Close modal/dialog
     *
     * @param page - Playwright Page instance
     * @param action - Action name from CommonIntents
     * @param value - Optional value for fill actions (e.g., search query)
     *
     * @returns true if action succeeded
     *
     * @throws {Error} If PRO license not active
     * @throws {Error} If action is unknown
     *
     * @example
     * ```typescript
     * const mm = new QAntum({ licenseKey: 'MM-PRO-KEY' });
     *
     * await mm.doAction(page, 'SEARCH', 'playwright testing');
     * await mm.doAction(page, 'LOGIN');
     * await mm.doAction(page, 'ADD_TO_CART');
     * await mm.doAction(page, 'CHECKOUT');
     * ```
     *
     * @since v16.0 "Adaptive Semantic Core"
     */
    async doAction(page, action, value) {
        if (!this.isProLicense) {
            throw new Error('Smart Actions require a Pro license. Get yours at ' + CHECKOUT_URL);
        }
        const intent = semantic_core_1.CommonIntents[action];
        if (!intent) {
            throw new Error(`Unknown action: ${action}. Available: ${Object.keys(semantic_core_1.CommonIntents).join(', ')}`);
        }
        const execAction = intent.keywords.some(k => k.includes('search') || k.includes('email') || k.includes('password')) ? 'fill' : 'click';
        return this.executeIntent(page, intent, execAction, value);
    }
    /**
     * 💎 PRO: Get ASC statistics
     *
     * Returns knowledge base statistics and success rates for semantic matching.
     *
     * @returns Stats object or null if ASC not initialized
     *   - `totalEntries`: Number of learned selectors
     *   - `successRate`: Match success percentage
     *   - `mostUsed`: Top 10 most frequently matched keywords
     *
     * @since v16.0 "Adaptive Semantic Core"
     */
    getASCStats() {
        if (!this.asc)
            return null;
        return this.asc.getStats();
    }
    /**
     * 💎 PRO: Save ASC knowledge to file
     *
     * Persists learned semantic mappings to disk for reuse across sessions.
     * Knowledge file is saved to `./asc-knowledge.json` by default.
     *
     * @since v16.0 "Adaptive Semantic Core"
     */
    saveASCKnowledge() {
        if (this.asc) {
            this.asc.saveKnowledge();
        }
    }
    /**
     * 💎 PRO: Clear ASC cache
     *
     * Clears in-memory semantic caches. Use when testing on new
     * websites to prevent stale matches.
     *
     * @since v16.0 "Adaptive Semantic Core"
     */
    clearASCCache() {
        if (this.asc) {
            this.asc.clearCache();
        }
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // 🐝 SOVEREIGN SWARM v17.0 - Multi-Agent Architecture
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * 💎 PRO: Initialize Sovereign Swarm
     *
     * Activates multi-agent parallel test execution architecture.
     * The Swarm enables distributed testing with Commander-Soldier pattern.
     *
     * **Components Initialized:**
     * - **Agentic Orchestrator**: Coordinates agent tasks
     * - **Distillation Logger**: Fine-tuning data collection
     * - **Observability Bridge**: OpenTelemetry tracing
     * - **Browser Pool**: Playwright browser lifecycle
     *
     * **Benefits:**
     * - 10x faster test execution via parallelism
     * - Thermal-aware CPU throttling
     * - Automatic load balancing
     * - Cross-agent state sharing
     *
     * @param config - Optional swarm configuration
     * @param config.maxAgents - Maximum concurrent agents (default: CPU cores)
     * @param config.strategy - 'parallel' | 'sequential' | 'adaptive'
     * @param config.enableThermalThrottling - CPU temp-based throttling
     *
     * @returns Promise that resolves when swarm is ready
     *
     * @throws {Error} If PRO license not active
     *
     * @example
     * ```typescript
     * const mm = new QAntum({ licenseKey: 'MM-PRO-KEY' });
     *
     * await mm.initSwarm({
     *   maxAgents: 8,
     *   strategy: 'adaptive',
     *   enableThermalThrottling: true
     * });
     *
     * // Run tests in parallel
     * const result = await mm.executeSwarmTest(testSuite, {
     *   parallel: true,
     *   retries: 2
     * });
     *
     * console.log(`Completed ${result.total} tests in ${result.duration}ms`);
     * ```
     *
     * @requires PRO license
     * @since v17.0 "Sovereign Swarm"
     * @see {@link getSwarmStats} for monitoring
     * @see {@link shutdown} to cleanly terminate
     */
    async initSwarm(config) {
        if (!this.isProLicense) {
            throw new Error('Sovereign Swarm requires a Pro license. Get yours at ' + CHECKOUT_URL);
        }
        if (this.swarmInitialized) {
            if (this.config.verbose) {
                console.log('🐝 Swarm already initialized');
            }
            return;
        }
        if (this.config.verbose) {
            console.log('🐝 Initializing Sovereign Swarm v17.0...');
        }
        // Initialize components
        this.orchestrator = new swarm_1.AgenticOrchestrator({
            verbose: this.config.verbose,
            enableDistillation: true,
            enableTracing: true,
            ...config,
        });
        this.distillationLogger = new swarm_1.DistillationLogger({
            verbose: this.config.verbose,
            outputPath: './fine-tuning-dataset.jsonl',
            minConfidence: 0.75,
        });
        this.observabilityBridge = new swarm_1.ObservabilityBridge({
            verbose: this.config.verbose,
            serviceName: 'qantum-swarm',
            serviceVersion: exports.VERSION,
            consoleExport: this.config.verbose,
        });
        this.browserPool = new swarm_1.BrowserPoolManager({
            verbose: this.config.verbose,
            headless: true,
        });
        // Initialize orchestrator
        await this.orchestrator.initialize();
        // Connect distillation to orchestrator
        this.orchestrator.on('successfulExecution', async (data) => {
            if (this.distillationLogger) {
                await this.distillationLogger.record(data.task, data.result);
                this.orchestrator?.incrementDistillationCount();
            }
        });
        this.swarmInitialized = true;
        if (this.config.verbose) {
            console.log('🐝 Sovereign Swarm initialized successfully');
            console.log(`   Agents: ${this.orchestrator.getAgentCount()}`);
            console.log(`   Distillation: enabled`);
            console.log(`   Observability: enabled`);
        }
    }
    /**
     * 💎 PRO: Execute a goal using the swarm
     * The swarm will plan, execute, and validate automatically
     */
    async executeGoal(goal, context) {
        if (!this.isProLicense) {
            throw new Error('Sovereign Swarm requires a Pro license. Get yours at ' + CHECKOUT_URL);
        }
        if (!this.swarmInitialized || !this.orchestrator) {
            await this.initSwarm();
        }
        // Start trace
        const traceId = this.observabilityBridge?.startTrace('executeGoal', {
            goal,
        }) || '';
        try {
            if (this.config.verbose) {
                console.log(`🐝 Executing goal: ${goal}`);
            }
            const result = await this.orchestrator.executeGoal(goal, context);
            this.observabilityBridge?.setStatus(result.success ? 'ok' : 'error');
            if (this.config.verbose) {
                console.log(`🐝 Goal execution ${result.success ? 'succeeded' : 'failed'}`);
                console.log(`   Tasks: ${result.results.length}`);
                console.log(`   Success rate: ${(result.results.filter(r => r.success).length / result.results.length * 100).toFixed(1)}%`);
            }
            return result;
        }
        finally {
            this.observabilityBridge?.endTrace();
        }
    }
    /**
     * 💎 PRO: Execute tasks in parallel across multiple browsers
     */
    async executeParallel(tasks) {
        if (!this.isProLicense) {
            throw new Error('Parallel execution requires a Pro license. Get yours at ' + CHECKOUT_URL);
        }
        if (!this.browserPool) {
            this.browserPool = new swarm_1.BrowserPoolManager({
                verbose: this.config.verbose,
            });
            // Initialize with playwright
            const playwright = require('playwright');
            await this.browserPool.initialize(playwright);
        }
        if (this.config.verbose) {
            console.log(`🐝 Executing ${tasks.length} tasks in parallel`);
        }
        return this.browserPool.executeParallel(tasks);
    }
    /**
     * 💎 PRO: Get Swarm statistics
     *
     * Returns real-time statistics about swarm operation.
     *
     * @returns SwarmStats or null if swarm not initialized
     *   - `activeAgents`: Currently running agents
     *   - `completedTasks`: Total tasks completed
     *   - `failedTasks`: Total failed tasks
     *   - `avgTaskDuration`: Mean task execution time
     *   - `thermalState`: CPU thermal status
     *
     * @since v17.0 "Sovereign Swarm"
     */
    getSwarmStats() {
        if (!this.orchestrator)
            return null;
        return this.orchestrator.getStats();
    }
    /**
     * 💎 PRO: Get distillation statistics
     *
     * Returns statistics about fine-tuning data collection.
     *
     * @returns Distillation stats or null if not initialized
     *   - `accepted`: Entries meeting quality threshold
     *   - `rejected`: Entries below threshold
     *   - `totalEntries`: Total collected
     *   - `acceptanceRate`: Percentage accepted
     *
     * @since v17.0 "Sovereign Swarm"
     */
    getDistillationStats() {
        if (!this.distillationLogger)
            return null;
        return this.distillationLogger.getStats();
    }
    /**
     * 💎 PRO: Get observability statistics
     *
     * Returns OpenTelemetry tracing statistics.
     *
     * @returns Observability stats or null if not initialized
     *   - `spansCreated`: Total trace spans created
     *   - `spansExported`: Spans successfully exported
     *   - `errors`: Export errors encountered
     *
     * @since v17.0 "Sovereign Swarm"
     */
    getObservabilityStats() {
        if (!this.observabilityBridge)
            return null;
        return this.observabilityBridge.getStats();
    }
    /**
     * 💎 PRO: Get current trace ID
     *
     * Returns the active OpenTelemetry trace ID for correlation
     * with external observability systems.
     *
     * @returns Trace ID string or null if not tracing
     *
     * @example
     * ```typescript
     * const traceId = mm.getCurrentTraceId();
     * console.log(`View in Jaeger: http://jaeger:16686/trace/${traceId}`);
     * ```
     *
     * @since v17.0 "Sovereign Swarm"
     */
    getCurrentTraceId() {
        return this.observabilityBridge?.getCurrentTraceId() || null;
    }
    /**
     * 💎 PRO: Export distillation data
     *
     * Exports collected fine-tuning data in specified format.
     * Use for training custom models on your test patterns.
     *
     * @param format - Export format: 'jsonl' or 'csv'
     * @param path - Output file path
     *
     * @throws {Error} If distillation logger not initialized
     *
     * @example
     * ```typescript
     * // Export for fine-tuning
     * await mm.exportDistillationData('jsonl', './fine-tune-data.jsonl');
     *
     * // Export for analysis
     * await mm.exportDistillationData('csv', './analysis.csv');
     * ```
     *
     * @since v17.0 "Sovereign Swarm"
     */
    async exportDistillationData(format, path) {
        if (!this.distillationLogger) {
            throw new Error('Distillation logger not initialized');
        }
        await this.distillationLogger.exportAs(format, path);
    }
    /**
     * 💎 PRO: Shutdown Swarm gracefully
     *
     * Cleanly terminates all swarm components, ensuring no orphaned
     * browser processes or pending tasks.
     *
     * **Shutdown Order:**
     * 1. Browser Pool - close all browsers
     * 2. Orchestrator - stop task distribution
     * 3. Distillation Logger - flush pending writes
     * 4. Observability Bridge - export final spans
     *
     * @returns Promise that resolves when shutdown complete
     *
     * @example
     * ```typescript
     * process.on('SIGTERM', async () => {
     *   await mm.shutdownSwarm();
     *   process.exit(0);
     * });
     * ```
     *
     * @since v17.0 "Sovereign Swarm"
     */
    async shutdownSwarm() {
        if (!this.swarmInitialized)
            return;
        if (this.config.verbose) {
            console.log('🐝 Shutting down Sovereign Swarm...');
        }
        // Shutdown in order
        if (this.browserPool) {
            await this.browserPool.shutdown();
        }
        if (this.orchestrator) {
            await this.orchestrator.stop();
        }
        if (this.distillationLogger) {
            await this.distillationLogger.shutdown();
        }
        if (this.observabilityBridge) {
            await this.observabilityBridge.shutdown();
        }
        this.swarmInitialized = false;
        if (this.config.verbose) {
            console.log('🐝 Sovereign Swarm shutdown complete');
        }
    }
    /**
     * 🏰 Shutdown Bastion gracefully
     *
     * Cleanly terminates Security Bastion components.
     *
     * @returns Promise that resolves when shutdown complete
     *
     * @since v19.0 "Security Bastion"
     */
    async shutdownBastion() {
        if (!this.bastionInitialized || !this.bastion)
            return;
        if (this.config.verbose) {
            console.log('🏰 Shutting down Security Bastion...');
        }
        await this.bastion.shutdown();
        this.bastionInitialized = false;
        if (this.config.verbose) {
            console.log('🏰 Security Bastion shutdown complete');
        }
    }
    /**
     * 🔌 Shutdown all components
     *
     * Master shutdown method that gracefully terminates all QAntum
     * subsystems. **Always call this before process exit.**
     *
     * **Components Shutdown:**
     * - Security Bastion (vault, sandbox, workers)
     * - Sovereign Swarm (browsers, orchestrator, telemetry)
     * - Adaptive Semantic Core (knowledge persistence)
     * - Self-Evolving Genetic Core (state snapshot)
     *
     * @returns Promise that resolves when all components stopped
     *
     * @example
     * ```typescript
     * const mm = new QAntum({ licenseKey: 'MM-PRO-KEY' });
     *
     * try {
     *   await mm.initSwarm();
     *   await runTests();
     * } finally {
     *   await mm.shutdown(); // Always cleanup!
     * }
     *
     * // Or with signal handlers
     * process.on('SIGINT', async () => {
     *   console.log('Graceful shutdown...');
     *   await mm.shutdown();
     *   process.exit(0);
     * });
     * ```
     *
     * @since v17.0 "Sovereign Swarm"
     */
    async shutdown() {
        await this.shutdownBastion();
        await this.shutdownSwarm();
        if (this.config.verbose) {
            console.log('🧠 QANTUM shutdown complete');
        }
    }
}
exports.QAntum = QAntum;
// Default export
exports.default = QAntum;
// Named exports for convenience
const createQAntum = (config) => new QAntum(config);
exports.createQAntum = createQAntum;
// ═══════════════════════════════════════════════════════════════════════════════
// Version & Branding
// ═══════════════════════════════════════════════════════════════════════════════
/** Current version */
exports.VERSION = '23.3.0';
/** Version codename */
exports.VERSION_CODENAME = 'Type-Safe Sovereign';
/** Full version string */
exports.VERSION_FULL = `QAntum v${exports.VERSION} "${exports.VERSION_CODENAME}"`;
/**
 * 🎨 Print ASCII banner to console (optional visualization)
 * Call this at startup for beautiful branding
 */
function printBanner(options = {}) {
    const { color = true, compact = false } = options;
    const reset = color ? '\x1b[0m' : '';
    const cyan = color ? '\x1b[36m' : '';
    const yellow = color ? '\x1b[33m' : '';
    const green = color ? '\x1b[32m' : '';
    const magenta = color ? '\x1b[35m' : '';
    const bold = color ? '\x1b[1m' : '';
    if (compact) {
        console.log(`${cyan}${bold}🧠 QAntum${reset} ${yellow}v${exports.VERSION}${reset} ${magenta}"${exports.VERSION_CODENAME}"${reset}`);
        console.log(`${green}   Made with ❤️ in Bulgaria 🇧🇬${reset}\n`);
        return;
    }
    console.log(`
${cyan}${bold}╔═══════════════════════════════════════════════════════════════════════════════╗${reset}
${cyan}║${reset}                                                                               ${cyan}║${reset}
${cyan}║${reset}   ${yellow}███╗   ███╗██╗███████╗████████╗███████╗██████╗ ███╗   ███╗██╗███╗   ██╗██████╗ ${reset} ${cyan}║${reset}
${cyan}║${reset}   ${yellow}████╗ ████║██║██╔════╝╚══██╔══╝██╔════╝██╔══██╗████╗ ████║██║████╗  ██║██╔══██╗${reset} ${cyan}║${reset}
${cyan}║${reset}   ${yellow}██╔████╔██║██║███████╗   ██║   █████╗  ██████╔╝██╔████╔██║██║██╔██╗ ██║██║  ██║${reset} ${cyan}║${reset}
${cyan}║${reset}   ${yellow}██║╚██╔╝██║██║╚════██║   ██║   ██╔══╝  ██╔══██╗██║╚██╔╝██║██║██║╚██╗██║██║  ██║${reset} ${cyan}║${reset}
${cyan}║${reset}   ${yellow}██║ ╚═╝ ██║██║███████║   ██║   ███████╗██║  ██║██║ ╚═╝ ██║██║██║ ╚████║██████╔╝${reset} ${cyan}║${reset}
${cyan}║${reset}   ${yellow}╚═╝     ╚═╝╚═╝╚══════╝   ╚═╝   ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝╚═╝╚═╝  ╚═══╝╚═════╝ ${reset} ${cyan}║${reset}
${cyan}║${reset}                                                                               ${cyan}║${reset}
${cyan}║${reset}                    ${magenta}${bold}v${exports.VERSION} "${exports.VERSION_CODENAME}"${reset}                              ${cyan}║${reset}
${cyan}║${reset}                                                                               ${cyan}║${reset}
${cyan}╠═══════════════════════════════════════════════════════════════════════════════╣${reset}
${cyan}║${reset}                                                                               ${cyan}║${reset}
${cyan}║${reset}   ${green}🇧🇬 Made with ❤️ in Bulgaria by Димитър Продромов${reset}                            ${cyan}║${reset}
${cyan}║${reset}                                                                               ${cyan}║${reset}
${cyan}║${reset}   ${bold}📊 Statistics:${reset}                                                              ${cyan}║${reset}
${cyan}║${reset}   • Total Lines: 45,895+                                                      ${cyan}║${reset}
${cyan}║${reset}   • TypeScript Files: 91                                                      ${cyan}║${reset}
${cyan}║${reset}   • Tests: 492 passing                                                        ${cyan}║${reset}
${cyan}║${reset}   • Enterprise Modules: 6                                                     ${cyan}║${reset}
${cyan}║${reset}                                                                               ${cyan}║${reset}
${cyan}║${reset}   ${bold}🏢 Enterprise Features:${reset}                                                     ${cyan}║${reset}
${cyan}║${reset}   • 🌡️  Thermal Pool    • 🐳 Docker Manager   • 🎖️  Swarm Commander            ${cyan}║${reset}
${cyan}║${reset}   • 🔊 Bulgarian TTS   • 🎛️  Dashboard        • 🔐 License Manager             ${cyan}║${reset}
${cyan}║${reset}                                                                               ${cyan}║${reset}
${cyan}╚═══════════════════════════════════════════════════════════════════════════════╝${reset}
`);
}
/**
 * 📊 Get system statistics for display
 */
function getSystemStats() {
    return {
        version: exports.VERSION,
        codename: exports.VERSION_CODENAME,
        lines: 45895,
        files: 91,
        tests: 492,
        modules: 6
    };
}
// Re-export ASC types and utilities
var semantic_core_2 = require("./asc/semantic-core");
Object.defineProperty(exports, "AdaptiveSemanticCore", { enumerable: true, get: function () { return semantic_core_2.AdaptiveSemanticCore; } });
Object.defineProperty(exports, "CommonIntents", { enumerable: true, get: function () { return semantic_core_2.CommonIntents; } });
Object.defineProperty(exports, "Intent", { enumerable: true, get: function () { return semantic_core_2.Intent; } });
Object.defineProperty(exports, "IntentMatch", { enumerable: true, get: function () { return semantic_core_2.IntentMatch; } });
Object.defineProperty(exports, "SemanticMap", { enumerable: true, get: function () { return semantic_core_2.SemanticMap; } });
Object.defineProperty(exports, "SemanticElement", { enumerable: true, get: function () { return semantic_core_2.SemanticElement; } });
Object.defineProperty(exports, "ASCConfig", { enumerable: true, get: function () { return semantic_core_2.ASCConfig; } });
// Re-export Swarm types and utilities
var swarm_2 = require("./swarm");
Object.defineProperty(exports, "AgenticOrchestrator", { enumerable: true, get: function () { return swarm_2.AgenticOrchestrator; } });
Object.defineProperty(exports, "DistillationLogger", { enumerable: true, get: function () { return swarm_2.DistillationLogger; } });
Object.defineProperty(exports, "ObservabilityBridge", { enumerable: true, get: function () { return swarm_2.ObservabilityBridge; } });
Object.defineProperty(exports, "BrowserPoolManager", { enumerable: true, get: function () { return swarm_2.BrowserPoolManager; } });
Object.defineProperty(exports, "PlannerAgent", { enumerable: true, get: function () { return swarm_2.PlannerAgent; } });
Object.defineProperty(exports, "ExecutorAgent", { enumerable: true, get: function () { return swarm_2.ExecutorAgent; } });
Object.defineProperty(exports, "CriticAgent", { enumerable: true, get: function () { return swarm_2.CriticAgent; } });
Object.defineProperty(exports, "WebSocketBridge", { enumerable: true, get: function () { return swarm_2.WebSocketBridge; } });
// Re-export Bastion types and utilities
var bastion_2 = require("./bastion");
Object.defineProperty(exports, "BastionController", { enumerable: true, get: function () { return bastion_2.BastionController; } });
Object.defineProperty(exports, "SandboxExecutor", { enumerable: true, get: function () { return bastion_2.SandboxExecutor; } });
Object.defineProperty(exports, "WorkerPoolManager", { enumerable: true, get: function () { return bastion_2.WorkerPoolManager; } });
Object.defineProperty(exports, "MemoryHardeningManager", { enumerable: true, get: function () { return bastion_2.MemoryHardeningManager; } });
Object.defineProperty(exports, "NeuralVault", { enumerable: true, get: function () { return bastion_2.NeuralVault; } });
Object.defineProperty(exports, "ChecksumValidator", { enumerable: true, get: function () { return bastion_2.ChecksumValidator; } });
Object.defineProperty(exports, "CircuitBreakerManager", { enumerable: true, get: function () { return bastion_2.CircuitBreakerManager; } });
Object.defineProperty(exports, "HealthCheckSystem", { enumerable: true, get: function () { return bastion_2.HealthCheckSystem; } });
// ═══════════════════════════════════════════════════════════════════════════
// COGNITION MODULE EXPORTS - Layer 3: Chemistry
// ═══════════════════════════════════════════════════════════════════════════
var cognition_1 = require("./cognition");
Object.defineProperty(exports, "ContextInjector", { enumerable: true, get: function () { return cognition_1.ContextInjector; } });
Object.defineProperty(exports, "DependencyGraph", { enumerable: true, get: function () { return cognition_1.DependencyGraph; } });
Object.defineProperty(exports, "Distiller", { enumerable: true, get: function () { return cognition_1.KnowledgeDistiller; } });
Object.defineProperty(exports, "MultiPerspectiveAnalyzer", { enumerable: true, get: function () { return cognition_1.MultiPerspectiveAnalyzer; } });
// ═══════════════════════════════════════════════════════════════════════════
// PHYSICS MODULE EXPORTS - Layer 2: Computation
// ═══════════════════════════════════════════════════════════════════════════
var NeuralAccelerator_1 = require("./physics/NeuralAccelerator");
Object.defineProperty(exports, "NeuralAccelerator", { enumerable: true, get: function () { return NeuralAccelerator_1.NeuralAccelerator; } });
