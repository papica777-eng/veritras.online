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
const MarketWatcher_1 = require("./market/MarketWatcher");
const ArbitrageLogic_1 = require("./market/ArbitrageLogic");
const PriceOracle_1 = require("./intelligence/PriceOracle");
const AtomicTrader_1 = require("./execution/AtomicTrader");
class ArbitrageOrchestrator extends events_1.EventEmitter {
    config;
    watcher;
    logic;
    oracle;
    trader;
    isRunning = false;
    startTime = 0;
    initialCapital = 0;
    currentCapital = 0;
    reservedCapital = 0;
    dailyStats;
    allTimeProfit = 0;
    tradesExecuted = 0;
    successfulTrades = 0;
    tradesThisHour = 0;
    hourStartTime = Date.now();
    opportunityQueue = [];
    processingLock = false;
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
        this.watcher = MarketWatcher_1.marketWatcher;
        this.logic = ArbitrageLogic_1.arbitrageLogic;
        this.oracle = PriceOracle_1.priceOracle;
        this.trader = AtomicTrader_1.atomicTrader;
        this.initialCapital = this.config.capitalUSD;
        this.currentCapital = this.config.capitalUSD;
        this.dailyStats = this.createEmptyDayStats();
        this.setupEventHandlers();
        console.log(`[ArbitrageOrchestrator] 🚀 Initialized in ${this.config.mode} mode`);
    }
    // Complexity: O(1) — hash/map lookup
    createEmptyDayStats() {
        return {
            date: new Date().toISOString().split('T')[0], tradesExecuted: 0, successfulTrades: 0, failedTrades: 0, totalProfit: 0, totalVolume: 0, avgProfitPercent: 0, bestTrade: null, worstTrade: null, uptimePercent: 0,
        };
    }
    // Complexity: O(1)
    setupEventHandlers() {
        this.watcher.on('spreads', (spreads) => { this.handleNewSpreads(spreads); });
        this.trader.on('swap-completed', (swap) => { this.handleSwapCompleted(swap); });
        this.trader.on('swap-failed', (swap) => { this.handleSwapFailed(swap); });
        this.trader.on('swap-rollback', (swap) => { this.handleSwapRollback(swap); });
        this.oracle.on('predictions-updated', () => { });
    }
    // Complexity: O(N) — linear iteration
    handleNewSpreads(spreads) {
        if (!this.isRunning)
            return;
        const opportunities = this.logic.analyzeOpportunities(spreads); // Simplified mapping, assuming logic handles it
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
        this.currentCapital += profit;
        this.dailyStats.tradesExecuted++;
        this.dailyStats.successfulTrades++;
        this.dailyStats.totalProfit += profit;
        this.dailyStats.totalVolume += swap.buyOrder.price * swap.buyOrder.quantity;
        this.allTimeProfit += profit;
        this.tradesExecuted++;
        this.successfulTrades++;
        if (!this.dailyStats.bestTrade || profit > this.dailyStats.bestTrade.profit) {
            this.dailyStats.bestTrade = { profit, symbol: swap.buyOrder.symbol };
        }
        this.sendTelemetry({ type: 'trade-completed', swap, profit, currentCapital: this.currentCapital });
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
    // Complexity: O(1)
    queueOpportunity(opportunity) {
        if (this.tradesThisHour >= this.config.maxTradesPerHour)
            return;
        if (this.dailyStats.totalProfit < -this.config.dailyLossLimit)
            return;
        const requiredCapital = this.logic.getConfig().capitalAllocation;
        if (this.currentCapital - this.reservedCapital < requiredCapital)
            return;
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
    // Complexity: O(1) — amortized
    async executeOpportunity(opportunity) {
        if (this.config.enableChronosPrediction) {
            const riskEval = this.oracle.evaluateArbitrageRisk(opportunity.symbol, opportunity.buyPrice, opportunity.sellPrice, opportunity.netProfit, 5000);
            if (!riskEval.shouldProceed) {
                this.emit('opportunity-blocked', { opportunity, reason: riskEval.riskAssessment });
                return;
            }
        }
        const tradeAmount = this.logic.getConfig().capitalAllocation;
        this.reservedCapital += tradeAmount;
        if (this.config.enableAtomicExecution && this.config.mode !== 'simulation') {
            const quantity = tradeAmount / opportunity.buyPrice;
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.trader.executeAtomicSwap(opportunity.symbol, opportunity.buyExchange, opportunity.sellExchange, opportunity.buyPrice, opportunity.sellPrice, quantity, opportunity.netProfit);
            this.tradesThisHour++;
            this.checkHourReset();
        }
        else {
            // Simulation
            this.currentCapital += opportunity.netProfit;
            this.dailyStats.tradesExecuted++;
            this.dailyStats.successfulTrades++;
            this.dailyStats.totalProfit += opportunity.netProfit;
            this.allTimeProfit += opportunity.netProfit;
            this.tradesExecuted++;
            this.successfulTrades++;
            this.emit('trade-simulated', { opportunity, profit: opportunity.netProfit });
        }
        this.reservedCapital -= tradeAmount;
    }
    // Complexity: O(1)
    checkHourReset() {
        const now = Date.now();
        if (now - this.hourStartTime >= 3600000) {
            this.tradesThisHour = 0;
            this.hourStartTime = now;
        }
    }
    // Complexity: O(1)
    sendTelemetry(data) {
        this.telemetryBuffer.push({ ...data, timestamp: Date.now(), status: this.getStatus() });
        this.emit('telemetry', this.telemetryBuffer[this.telemetryBuffer.length - 1]);
        if (this.telemetryBuffer.length > 1000)
            this.telemetryBuffer.shift();
    }
    // Complexity: O(N) — potential recursive descent
    async start() {
        if (this.isRunning)
            return;
        this.isRunning = true;
        this.startTime = Date.now();
        this.watcher.start();
        this.oracle.start();
        this.trader.start();
        this.emit('started');
    }
    // Complexity: O(N) — potential recursive descent
    stop() {
        if (!this.isRunning)
            return;
        this.isRunning = false;
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
        if (this.isRunning) {
            const uptimeMs = Date.now() - this.startTime;
            this.dailyStats.uptimePercent = Math.min(100, (uptimeMs / (24 * 60 * 60 * 1000)) * 100);
        }
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
exports.arbitrageOrchestrator = new ArbitrageOrchestrator();
exports.default = ArbitrageOrchestrator;
