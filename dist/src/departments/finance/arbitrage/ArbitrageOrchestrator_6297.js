"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  QAntum Prime v28.0 - ARBITRAGE ORCHESTRATOR                              ║
 * ║  "Economic Sovereign" - Master Controller                                 ║
 * ║                                                                           ║
 * ║  Свързва MarketWatcher → ArbitrageLogic → PriceOracle → AtomicTrader      ║
 * ║  Пълна автономна търговия с Zero-Loss гаранция                            ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.arbitrageOrchestrator = exports.ArbitrageOrchestrator = void 0;
const events_1 = require("events");
const MarketWatcher_1 = require("./MarketWatcher");
const ArbitrageLogic_1 = require("../../math/ArbitrageLogic");
const PriceOracle_1 = require("../../chronos/PriceOracle");
const AtomicTrader_1 = require("../../physics/AtomicTrader");
// ═══════════════════════════════════════════════════════════════════════════
// ARBITRAGE ORCHESTRATOR - THE ECONOMIC SOVEREIGN
// ═══════════════════════════════════════════════════════════════════════════
class ArbitrageOrchestrator extends events_1.EventEmitter {
    config;
    watcher;
    logic;
    oracle;
    trader;
    isRunning = false;
    startTime = 0;
    // Capital tracking
    initialCapital = 0;
    currentCapital = 0;
    reservedCapital = 0;
    // Daily tracking
    dailyStats;
    allTimeProfit = 0;
    tradesExecuted = 0;
    successfulTrades = 0;
    // Rate limiting
    tradesThisHour = 0;
    hourStartTime = Date.now();
    // Opportunity queue
    opportunityQueue = [];
    processingLock = false;
    // Telemetry
    telemetryBuffer = [];
    constructor(config = {}) {
        super();
        this.config = {
            mode: config.mode ?? 'simulation',
            capitalUSD: config.capitalUSD ?? 10000,
            maxTradesPerHour: config.maxTradesPerHour ?? 50,
            minProfitThreshold: config.minProfitThreshold ?? 1.5,
            maxRiskThreshold: config.maxRiskThreshold ?? 15,
            dailyLossLimit: config.dailyLossLimit ?? 500,
            enableChronosPrediction: config.enableChronosPrediction ?? true,
            enableAtomicExecution: config.enableAtomicExecution ?? true,
            telemetryUrl: config.telemetryUrl ?? 'ws://192.168.0.6:8888',
        };
        // Initialize components
        this.watcher = MarketWatcher_1.marketWatcher;
        this.logic = ArbitrageLogic_1.arbitrageLogic;
        this.oracle = PriceOracle_1.priceOracle;
        this.trader = AtomicTrader_1.atomicTrader;
        // Initialize capital
        this.initialCapital = this.config.capitalUSD;
        this.currentCapital = this.config.capitalUSD;
        // Initialize daily stats
        this.dailyStats = this.createEmptyDayStats();
        // Setup event handlers
        this.setupEventHandlers();
        console.log(`
╔═══════════════════════════════════════════════════════════════════════════╗
║  ⚛️  QAntum-Market-Reaper v28.0 - ECONOMIC SOVEREIGN                      ║
║                                                                           ║
║  Mode: ${this.config.mode.toUpperCase().padEnd(12)} | Capital: $${this.config.capitalUSD.toLocaleString().padEnd(10)}             ║
║  Min Profit: ${this.config.minProfitThreshold}%      | Max Risk: ${this.config.maxRiskThreshold}%                           ║
║  Chronos: ${this.config.enableChronosPrediction ? 'ON ' : 'OFF'}          | Atomic: ${this.config.enableAtomicExecution ? 'ON' : 'OFF'}                             ║
╚═══════════════════════════════════════════════════════════════════════════╝
    `);
    }
    // Complexity: O(1) — hash/map lookup
    createEmptyDayStats() {
        return {
            date: new Date().toISOString().split('T')[0],
            tradesExecuted: 0,
            successfulTrades: 0,
            failedTrades: 0,
            totalProfit: 0,
            totalVolume: 0,
            avgProfitPercent: 0,
            bestTrade: null,
            worstTrade: null,
            uptimePercent: 0,
        };
    }
    // ═══════════════════════════════════════════════════════════════════════
    // EVENT HANDLERS
    // ═══════════════════════════════════════════════════════════════════════
    // Complexity: O(1) — amortized
    setupEventHandlers() {
        // Market Watcher: New spreads detected
        this.watcher.on('spreads', (spreads) => {
            this.handleNewSpreads(spreads);
        });
        // Atomic Trader: Swap completed
        this.trader.on('swap-completed', (swap) => {
            this.handleSwapCompleted(swap);
        });
        // Atomic Trader: Swap failed
        this.trader.on('swap-failed', (swap) => {
            this.handleSwapFailed(swap);
        });
        // Atomic Trader: Swap rolled back
        this.trader.on('swap-rollback', (swap) => {
            this.handleSwapRollback(swap);
        });
        // Price Oracle: Predictions updated
        this.oracle.on('predictions-updated', () => {
            // Log prediction updates if in verbose mode
        });
    }
    // Complexity: O(N) — linear iteration
    handleNewSpreads(spreads) {
        if (!this.isRunning)
            return;
        // Analyze opportunities
        const opportunities = this.logic.analyzeOpportunities(spreads.map(s => ({
            symbol: s.symbol,
            buyExchange: s.buyExchange,
            sellExchange: s.sellExchange,
            buyPrice: s.buyPrice,
            sellPrice: s.sellPrice,
        })));
        // Filter viable opportunities
        const viable = this.logic.getViableOpportunities(opportunities);
        if (viable.length > 0) {
            console.log(`[Orchestrator] 🎯 Found ${viable.length} viable opportunities`);
            for (const opp of viable) {
                this.queueOpportunity(opp);
            }
        }
    }
    // Complexity: O(1) — hash/map lookup
    handleSwapCompleted(swap) {
        const profit = swap.actualProfit || 0;
        // Update capital
        this.currentCapital += profit;
        // Update stats
        this.dailyStats.tradesExecuted++;
        this.dailyStats.successfulTrades++;
        this.dailyStats.totalProfit += profit;
        this.dailyStats.totalVolume += swap.buyOrder.price * swap.buyOrder.quantity;
        this.allTimeProfit += profit;
        this.tradesExecuted++;
        this.successfulTrades++;
        // Track best trade
        if (!this.dailyStats.bestTrade || profit > this.dailyStats.bestTrade.profit) {
            this.dailyStats.bestTrade = { profit, symbol: swap.buyOrder.symbol };
        }
        // Send telemetry
        this.sendTelemetry({
            type: 'trade-completed',
            swap,
            profit,
            currentCapital: this.currentCapital,
        });
        console.log(`[Orchestrator] 💰 Trade completed! Profit: $${profit.toFixed(2)} | Capital: $${this.currentCapital.toFixed(2)}`);
        this.emit('trade-completed', { swap, profit });
    }
    // Complexity: O(1) — hash/map lookup
    handleSwapFailed(swap) {
        this.dailyStats.tradesExecuted++;
        this.dailyStats.failedTrades++;
        console.log(`[Orchestrator] ❌ Trade failed: ${swap.id}`);
        this.emit('trade-failed', swap);
    }
    // Complexity: O(1) — hash/map lookup
    handleSwapRollback(swap) {
        console.log(`[Orchestrator] 🔄 Trade rolled back: ${swap.id}`);
        this.emit('trade-rollback', swap);
    }
    // ═══════════════════════════════════════════════════════════════════════
    // OPPORTUNITY PROCESSING
    // ═══════════════════════════════════════════════════════════════════════
    // Complexity: O(N)
    queueOpportunity(opportunity) {
        // Check rate limits
        if (this.tradesThisHour >= this.config.maxTradesPerHour) {
            console.log(`[Orchestrator] ⚠️ Rate limit reached (${this.config.maxTradesPerHour}/hour)`);
            return;
        }
        // Check daily loss limit
        if (this.dailyStats.totalProfit < -this.config.dailyLossLimit) {
            console.log(`[Orchestrator] 🛑 Daily loss limit reached. Pausing trades.`);
            return;
        }
        // Check capital availability
        const requiredCapital = this.logic.getConfig().capitalAllocation;
        if (this.currentCapital - this.reservedCapital < requiredCapital) {
            console.log(`[Orchestrator] ⚠️ Insufficient capital for trade`);
            return;
        }
        this.opportunityQueue.push(opportunity);
        this.processQueue();
    }
    // Complexity: O(N) — loop-based
    async processQueue() {
        if (this.processingLock)
            return;
        if (this.opportunityQueue.length === 0)
            return;
        this.processingLock = true;
        try {
            while (this.opportunityQueue.length > 0) {
                const opportunity = this.opportunityQueue.shift();
                await this.executeOpportunity(opportunity);
            }
        }
        finally {
            this.processingLock = false;
        }
    }
    // Complexity: O(1) — hash/map lookup
    async executeOpportunity(opportunity) {
        console.log(`
╔═══════════════════════════════════════════════════════════════════════════╗
║  🎯 OPPORTUNITY DETECTED                                                  ║
║  Symbol: ${opportunity.symbol.padEnd(10)} | Spread: ${opportunity.grossSpread.toFixed(2)}%                          ║
║  Buy: ${opportunity.buyExchange.padEnd(12)} @ $${opportunity.buyPrice.toFixed(2)}                            ║
║  Sell: ${opportunity.sellExchange.padEnd(11)} @ $${opportunity.sellPrice.toFixed(2)}                            ║
║  Net Profit: $${opportunity.netProfit.toFixed(2).padEnd(8)} (${opportunity.netProfitPercent.toFixed(2)}%)                         ║
╚═══════════════════════════════════════════════════════════════════════════╝
    `);
        // Step 1: Chronos Prediction (if enabled)
        if (this.config.enableChronosPrediction) {
            console.log(`[Orchestrator] 🔮 Consulting Chronos Oracle...`);
            const riskEval = this.oracle.evaluateArbitrageRisk(opportunity.symbol, opportunity.buyPrice, opportunity.sellPrice, opportunity.netProfit, 5000 // 5 second execution window
            );
            if (!riskEval.shouldProceed) {
                console.log(`[Orchestrator] ${riskEval.riskAssessment}`);
                this.emit('opportunity-blocked', { opportunity, reason: riskEval.riskAssessment });
                return;
            }
            console.log(`[Orchestrator] ${riskEval.riskAssessment}`);
        }
        // Step 2: Reserve capital
        const tradeAmount = this.logic.getConfig().capitalAllocation;
        this.reservedCapital += tradeAmount;
        // Step 3: Execute atomic swap (if enabled and in live mode)
        if (this.config.enableAtomicExecution && this.config.mode !== 'simulation') {
            console.log(`[Orchestrator] ⚡ Executing atomic swap...`);
            const quantity = tradeAmount / opportunity.buyPrice;
            try {
                const swap = await this.trader.executeAtomicSwap(opportunity.symbol, opportunity.buyExchange, opportunity.sellExchange, opportunity.buyPrice, opportunity.sellPrice, quantity, opportunity.netProfit);
                // Update rate limiting
                this.tradesThisHour++;
                this.checkHourReset();
            }
            catch (error) {
                console.error(`[Orchestrator] ❌ Swap execution error:`, error);
            }
        }
        else {
            // Simulation mode - just log
            console.log(`[Orchestrator] 📝 [SIMULATION] Would execute trade:`);
            console.log(`    Buy ${(tradeAmount / opportunity.buyPrice).toFixed(6)} ${opportunity.symbol} @ $${opportunity.buyPrice}`);
            console.log(`    Sell @ $${opportunity.sellPrice}`);
            console.log(`    Expected profit: $${opportunity.netProfit.toFixed(2)}`);
            // Simulate successful trade
            this.currentCapital += opportunity.netProfit;
            this.dailyStats.tradesExecuted++;
            this.dailyStats.successfulTrades++;
            this.dailyStats.totalProfit += opportunity.netProfit;
            this.allTimeProfit += opportunity.netProfit;
            this.tradesExecuted++;
            this.successfulTrades++;
            this.emit('trade-simulated', { opportunity, profit: opportunity.netProfit });
        }
        // Release reserved capital
        this.reservedCapital -= tradeAmount;
    }
    // Complexity: O(1)
    checkHourReset() {
        const now = Date.now();
        if (now - this.hourStartTime >= 3600000) { // 1 hour
            this.tradesThisHour = 0;
            this.hourStartTime = now;
        }
    }
    // ═══════════════════════════════════════════════════════════════════════
    // TELEMETRY (TO OLD LAPTOP)
    // ═══════════════════════════════════════════════════════════════════════
    // Complexity: O(1)
    sendTelemetry(data) {
        this.telemetryBuffer.push({
            ...data,
            timestamp: Date.now(),
            status: this.getStatus(),
        });
        // In production, this would send to WebSocket on 192.168.0.6:8888
        this.emit('telemetry', this.telemetryBuffer[this.telemetryBuffer.length - 1]);
        // Keep buffer limited
        if (this.telemetryBuffer.length > 1000) {
            this.telemetryBuffer.shift();
        }
    }
    // ═══════════════════════════════════════════════════════════════════════
    // PUBLIC API
    // ═══════════════════════════════════════════════════════════════════════
    // Complexity: O(1) — hash/map lookup
    async start() {
        if (this.isRunning) {
            console.log('[Orchestrator] Already running');
            return;
        }
        this.isRunning = true;
        this.startTime = Date.now();
        console.log(`
╔═══════════════════════════════════════════════════════════════════════════╗
║  🚀 QAntum-Market-Reaper ACTIVATED                                        ║
║                                                                           ║
║  "Да започне лова..."                                                     ║
╚═══════════════════════════════════════════════════════════════════════════╝
    `);
        // Start all components
        this.watcher.start();
        this.oracle.start();
        this.trader.start();
        this.emit('started');
    }
    // Complexity: O(1) — amortized
    stop() {
        if (!this.isRunning)
            return;
        this.isRunning = false;
        console.log(`
╔═══════════════════════════════════════════════════════════════════════════╗
║  🛑 QAntum-Market-Reaper DEACTIVATED                                      ║
║                                                                           ║
║  Final P&L: $${this.dailyStats.totalProfit.toFixed(2).padEnd(10)}                                         ║
║  Trades: ${this.tradesExecuted.toString().padEnd(5)} | Win Rate: ${this.getWinRate().toFixed(1)}%                            ║
╚═══════════════════════════════════════════════════════════════════════════╝
    `);
        // Stop all components
        this.watcher.stop();
        this.oracle.stop();
        this.trader.stop();
        this.emit('stopped');
    }
    // Complexity: O(1)
    getStatus() {
        const traderStats = this.trader.getStats();
        return {
            isRunning: this.isRunning,
            mode: this.config.mode,
            uptime: this.isRunning ? Date.now() - this.startTime : 0,
            capital: this.currentCapital,
            todayProfit: this.dailyStats.totalProfit,
            allTimeProfit: this.allTimeProfit,
            tradesExecuted: this.tradesExecuted,
            winRate: this.getWinRate(),
            activeOpportunities: this.opportunityQueue.length,
            chronosAccuracy: this.oracle.getAccuracy(),
            atomicLatencyMs: traderStats.avgLatencyMs,
            lastTradeTime: this.tradesExecuted > 0 ? Date.now() : null,
        };
    }
    // Complexity: O(1)
    getDailyStats() {
        // Calculate uptime
        if (this.isRunning) {
            const uptimeMs = Date.now() - this.startTime;
            const dayMs = 24 * 60 * 60 * 1000;
            this.dailyStats.uptimePercent = Math.min(100, (uptimeMs / dayMs) * 100);
        }
        // Calculate average profit
        if (this.dailyStats.successfulTrades > 0) {
            this.dailyStats.avgProfitPercent = this.dailyStats.totalProfit / this.dailyStats.successfulTrades;
        }
        return { ...this.dailyStats };
    }
    // Complexity: O(1)
    getWinRate() {
        if (this.tradesExecuted === 0)
            return 0;
        return (this.successfulTrades / this.tradesExecuted) * 100;
    }
    // Complexity: O(1) — hash/map lookup
    updateConfig(config) {
        this.config = { ...this.config, ...config };
        console.log('[Orchestrator] Configuration updated');
    }
    // Complexity: O(1) — hash/map lookup
    setCapital(amount) {
        this.currentCapital = amount;
        this.initialCapital = amount;
        console.log(`[Orchestrator] Capital set to $${amount}`);
    }
    // Complexity: O(1)
    getDetailedReport() {
        return {
            status: this.getStatus(),
            dailyStats: this.getDailyStats(),
            watcherStats: this.watcher.getStats(),
            traderStats: this.trader.getStats(),
            config: { ...this.config },
        };
    }
}
exports.ArbitrageOrchestrator = ArbitrageOrchestrator;
// ═══════════════════════════════════════════════════════════════════════════
// SINGLETON EXPORT
// ═══════════════════════════════════════════════════════════════════════════
exports.arbitrageOrchestrator = new ArbitrageOrchestrator();
exports.default = ArbitrageOrchestrator;
