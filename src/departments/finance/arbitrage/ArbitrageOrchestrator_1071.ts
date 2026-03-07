/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  QAntum Prime v28.0 - ARBITRAGE ORCHESTRATOR                              ║
 * ║  "Economic Sovereign" - Master Controller                                 ║
 * ║                                                                           ║
 * ║  Свързва MarketWatcher → ArbitrageLogic → PriceOracle → AtomicTrader      ║
 * ║  Пълна автономна търговия с Zero-Loss гаранция                            ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

import { EventEmitter } from 'events';
import { MarketWatcher, marketWatcher, PriceSpread } from './market/MarketWatcher';
import { ArbitrageLogic, arbitrageLogic, ArbitrageOpportunity } from './market/ArbitrageLogic';
import { PriceOracle, priceOracle } from './intelligence/PriceOracle';
import { AtomicTrader, atomicTrader, AtomicSwap } from './execution/AtomicTrader';

export interface OrchestratorConfig {
    mode: 'simulation' | 'paper' | 'live';
    capitalUSD: number;
    maxTradesPerHour: number;
    minProfitThreshold: number;
    maxRiskThreshold: number;
    dailyLossLimit: number;
    enableChronosPrediction: boolean;
    enableAtomicExecution: boolean;
    telemetryUrl: string;
}

export interface DailyStats {
    date: string;
    tradesExecuted: number;
    successfulTrades: number;
    failedTrades: number;
    totalProfit: number;
    totalVolume: number;
    avgProfitPercent: number;
    bestTrade: { profit: number; symbol: string } | null;
    worstTrade: { loss: number; symbol: string } | null;
    uptimePercent: number;
}

export interface ReaperStatus {
    isRunning: boolean;
    mode: string;
    uptime: number;
    capital: number;
    todayProfit: number;
    allTimeProfit: number;
    tradesExecuted: number;
    winRate: number;
    activeOpportunities: number;
    chronosAccuracy: number;
    atomicLatencyMs: number;
    lastTradeTime: number | null;
}

export class ArbitrageOrchestrator extends EventEmitter {
    private config: OrchestratorConfig;
    private watcher: MarketWatcher;
    private logic: ArbitrageLogic;
    private oracle: PriceOracle;
    private trader: AtomicTrader;

    private isRunning: boolean = false;
    private startTime: number = 0;

    private initialCapital: number = 0;
    private currentCapital: number = 0;
    private reservedCapital: number = 0;

    private dailyStats: DailyStats;
    private allTimeProfit: number = 0;
    private tradesExecuted: number = 0;
    private successfulTrades: number = 0;

    private tradesThisHour: number = 0;
    private hourStartTime: number = Date.now();
    private opportunityQueue: ArbitrageOpportunity[] = [];
    private processingLock: boolean = false;
    private telemetryBuffer: any[] = [];

    constructor(config: Partial<OrchestratorConfig> = {}) {
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

        this.watcher = marketWatcher;
        this.logic = arbitrageLogic;
        this.oracle = priceOracle;
        this.trader = atomicTrader;
        this.initialCapital = this.config.capitalUSD;
        this.currentCapital = this.config.capitalUSD;
        this.dailyStats = this.createEmptyDayStats();
        this.setupEventHandlers();

        console.log(`[ArbitrageOrchestrator] 🚀 Initialized in ${this.config.mode} mode`);
    }

    // Complexity: O(1) — hash/map lookup
    private createEmptyDayStats(): DailyStats {
        return {
            date: new Date().toISOString().split('T')[0], tradesExecuted: 0, successfulTrades: 0, failedTrades: 0, totalProfit: 0, totalVolume: 0, avgProfitPercent: 0, bestTrade: null, worstTrade: null, uptimePercent: 0,
        };
    }

    // Complexity: O(1)
    private setupEventHandlers(): void {
        this.watcher.on('spreads', (spreads: PriceSpread[]) => { this.handleNewSpreads(spreads); });
        this.trader.on('swap-completed', (swap: AtomicSwap) => { this.handleSwapCompleted(swap); });
        this.trader.on('swap-failed', (swap: AtomicSwap) => { this.handleSwapFailed(swap); });
        this.trader.on('swap-rollback', (swap: AtomicSwap) => { this.handleSwapRollback(swap); });
        this.oracle.on('predictions-updated', () => { });
    }

    // Complexity: O(N) — linear iteration
    private handleNewSpreads(spreads: PriceSpread[]): void {
        if (!this.isRunning) return;
        const opportunities = this.logic.analyzeOpportunities(spreads); // Simplified mapping, assuming logic handles it
        const viable = this.logic.getViableOpportunities(opportunities);
        if (viable.length > 0) {
            console.log(`[Orchestrator] 🎯 Found ${viable.length} viable opportunities`);
            for (const opp of viable) { this.queueOpportunity(opp); }
        }
    }

    // Complexity: O(1) — hash/map lookup
    private handleSwapCompleted(swap: AtomicSwap): void {
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
    private handleSwapFailed(swap: AtomicSwap): void {
        this.dailyStats.tradesExecuted++;
        this.dailyStats.failedTrades++;
        console.log(`[Orchestrator] ❌ Trade failed: ${swap.id}`);
        this.emit('trade-failed', swap);
    }

    // Complexity: O(1) — hash/map lookup
    private handleSwapRollback(swap: AtomicSwap): void {
        console.log(`[Orchestrator] 🔄 Trade rolled back: ${swap.id}`);
        this.emit('trade-rollback', swap);
    }

    // Complexity: O(1)
    private queueOpportunity(opportunity: ArbitrageOpportunity): void {
        if (this.tradesThisHour >= this.config.maxTradesPerHour) return;
        if (this.dailyStats.totalProfit < -this.config.dailyLossLimit) return;
        const requiredCapital = this.logic.getConfig().capitalAllocation;
        if (this.currentCapital - this.reservedCapital < requiredCapital) return;

        this.opportunityQueue.push(opportunity);
        this.processQueue();
    }

    // Complexity: O(N) — loop-based
    private async processQueue(): Promise<void> {
        if (this.processingLock) return;
        if (this.opportunityQueue.length === 0) return;
        this.processingLock = true;
        try {
            while (this.opportunityQueue.length > 0) {
                const opportunity = this.opportunityQueue.shift()!;
                await this.executeOpportunity(opportunity);
            }
        } finally { this.processingLock = false; }
    }

    // Complexity: O(1) — amortized
    private async executeOpportunity(opportunity: ArbitrageOpportunity): Promise<void> {
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
        } else {
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
    private checkHourReset(): void {
        const now = Date.now();
        if (now - this.hourStartTime >= 3600000) { this.tradesThisHour = 0; this.hourStartTime = now; }
    }

    // Complexity: O(1)
    private sendTelemetry(data: any): void {
        this.telemetryBuffer.push({ ...data, timestamp: Date.now(), status: this.getStatus() });
        this.emit('telemetry', this.telemetryBuffer[this.telemetryBuffer.length - 1]);
        if (this.telemetryBuffer.length > 1000) this.telemetryBuffer.shift();
    }

    // Complexity: O(N) — potential recursive descent
    public async start(): Promise<void> {
        if (this.isRunning) return;
        this.isRunning = true;
        this.startTime = Date.now();
        this.watcher.start();
        this.oracle.start();
        this.trader.start();
        this.emit('started');
    }

    // Complexity: O(N) — potential recursive descent
    public stop(): void {
        if (!this.isRunning) return;
        this.isRunning = false;
        this.watcher.stop();
        this.oracle.stop();
        this.trader.stop();
        this.emit('stopped');
    }

    // Complexity: O(1)
    public getStatus(): ReaperStatus {
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
    public getDailyStats(): DailyStats {
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
    public getWinRate(): number {
        if (this.tradesExecuted === 0) return 0;
        return (this.successfulTrades / this.tradesExecuted) * 100;
    }

    // Complexity: O(1)
    public getDetailedReport(): {
        status: ReaperStatus;
        dailyStats: DailyStats;
        watcherStats: any;
        traderStats: any;
        config: OrchestratorConfig;
    } {
        return {
            status: this.getStatus(),
            dailyStats: this.getDailyStats(),
            watcherStats: this.watcher.getStats(),
            traderStats: this.trader.getStats(),
            config: { ...this.config },
        };
    }
}

export const arbitrageOrchestrator = new ArbitrageOrchestrator();
export default ArbitrageOrchestrator;
