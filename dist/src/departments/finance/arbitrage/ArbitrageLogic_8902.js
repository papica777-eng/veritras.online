"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  QAntum Prime v28.0 - ARBITRAGE LOGIC                                     ║
 * ║  "Математиката на Спреда" - Spread Analysis Engine                        ║
 * ║                                                                           ║
 * ║  Чист арбитраж = (Price_B - Price_A) - (Fees + Slippage + Latency_Cost)   ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.arbitrageLogic = exports.ArbitrageLogic = void 0;
// ═══════════════════════════════════════════════════════════════════════════
// EXCHANGE FEE DATABASE
// ═══════════════════════════════════════════════════════════════════════════
const EXCHANGE_FEES = new Map([
    ['Binance', { exchange: 'Binance', makerFee: 0.001, takerFee: 0.001, withdrawalFee: 0.0005, depositFee: 0 }],
    ['Coinbase', { exchange: 'Coinbase', makerFee: 0.004, takerFee: 0.006, withdrawalFee: 0, depositFee: 0 }],
    ['Kraken', { exchange: 'Kraken', makerFee: 0.0016, takerFee: 0.0026, withdrawalFee: 0.00015, depositFee: 0 }],
    ['Bybit', { exchange: 'Bybit', makerFee: 0.001, takerFee: 0.001, withdrawalFee: 0.0002, depositFee: 0 }],
    ['OKX', { exchange: 'OKX', makerFee: 0.0008, takerFee: 0.001, withdrawalFee: 0.0004, depositFee: 0 }],
    ['Upbit', { exchange: 'Upbit', makerFee: 0.0005, takerFee: 0.0005, withdrawalFee: 0.001, depositFee: 0 }],
]);
// ═══════════════════════════════════════════════════════════════════════════
// NETWORK COSTS DATABASE
// ═══════════════════════════════════════════════════════════════════════════
const NETWORK_COSTS = new Map([
    ['BTC', { blockchain: 'Bitcoin', avgGasFee: 15, confirmationTime: 600, congestionMultiplier: 1.0 }],
    ['ETH', { blockchain: 'Ethereum', avgGasFee: 25, confirmationTime: 15, congestionMultiplier: 1.2 }],
    ['SOL', { blockchain: 'Solana', avgGasFee: 0.001, confirmationTime: 0.4, congestionMultiplier: 1.0 }],
    ['XRP', { blockchain: 'Ripple', avgGasFee: 0.0001, confirmationTime: 4, congestionMultiplier: 1.0 }],
    ['ADA', { blockchain: 'Cardano', avgGasFee: 0.5, confirmationTime: 20, congestionMultiplier: 1.0 }],
    ['DOGE', { blockchain: 'Dogecoin', avgGasFee: 0.5, confirmationTime: 60, congestionMultiplier: 1.0 }],
    ['MATIC', { blockchain: 'Polygon', avgGasFee: 0.01, confirmationTime: 2, congestionMultiplier: 1.0 }],
    ['AVAX', { blockchain: 'Avalanche', avgGasFee: 0.1, confirmationTime: 2, congestionMultiplier: 1.0 }],
]);
// ═══════════════════════════════════════════════════════════════════════════
// ARBITRAGE LOGIC ENGINE
// ═══════════════════════════════════════════════════════════════════════════
class ArbitrageLogic {
    config;
    slippageModels = new Map();
    historicalAccuracy = [];
    constructor(config = {}) {
        this.config = {
            minProfitThreshold: config.minProfitThreshold ?? 1.5,
            maxSlippageTolerance: config.maxSlippageTolerance ?? 0.5,
            maxRiskScore: config.maxRiskScore ?? 30,
            latencyBudgetMs: config.latencyBudgetMs ?? 5000,
            minConfidence: config.minConfidence ?? 0.8,
            capitalAllocation: config.capitalAllocation ?? 10000,
        };
        this.initializeSlippageModels();
    }
    // Complexity: O(N) — linear iteration
    initializeSlippageModels() {
        const symbols = ['BTC', 'ETH', 'SOL', 'XRP', 'ADA', 'DOGE', 'MATIC', 'AVAX'];
        for (const symbol of symbols) {
            this.slippageModels.set(symbol, {
                symbol,
                avgSlippage: this.getBaseSlippage(symbol),
                volatilityFactor: this.getVolatilityFactor(symbol),
                liquidityScore: this.getLiquidityScore(symbol),
            });
        }
    }
    // Complexity: O(1) — hash/map lookup
    getBaseSlippage(symbol) {
        const slippages = {
            'BTC': 0.001, // 0.1% - very liquid
            'ETH': 0.001, // 0.1% - very liquid
            'SOL': 0.002, // 0.2%
            'XRP': 0.002, // 0.2%
            'ADA': 0.003, // 0.3%
            'DOGE': 0.004, // 0.4% - more volatile
            'MATIC': 0.003, // 0.3%
            'AVAX': 0.003, // 0.3%
        };
        return slippages[symbol] ?? 0.005;
    }
    // Complexity: O(1) — hash/map lookup
    getVolatilityFactor(symbol) {
        const volatility = {
            'BTC': 1.0,
            'ETH': 1.1,
            'SOL': 1.5,
            'XRP': 1.3,
            'ADA': 1.4,
            'DOGE': 2.0,
            'MATIC': 1.6,
            'AVAX': 1.5,
        };
        return volatility[symbol] ?? 1.5;
    }
    // Complexity: O(1) — hash/map lookup
    getLiquidityScore(symbol) {
        const liquidity = {
            'BTC': 100,
            'ETH': 95,
            'SOL': 80,
            'XRP': 85,
            'ADA': 75,
            'DOGE': 70,
            'MATIC': 70,
            'AVAX': 65,
        };
        return liquidity[symbol] ?? 50;
    }
    // ═══════════════════════════════════════════════════════════════════════
    // CORE CALCULATION: NET PROFIT
    // ═══════════════════════════════════════════════════════════════════════
    /**
     * Calculate the true net profit of an arbitrage opportunity
     * Formula: Net Profit = (Sell Price - Buy Price) - (All Costs)
     */
    // Complexity: O(1) — amortized
    calculateNetProfit(symbol, buyExchange, sellExchange, buyPrice, sellPrice, tradeAmount = this.config.capitalAllocation) {
        const id = `ARB-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        // 1. Calculate gross spread
        const grossSpread = sellPrice - buyPrice;
        const grossSpreadPercent = (grossSpread / buyPrice) * 100;
        // 2. Calculate exchange fees
        const buyFees = this.calculateExchangeFees(buyExchange, tradeAmount, 'taker');
        const sellFees = this.calculateExchangeFees(sellExchange, tradeAmount, 'maker');
        // 3. Calculate slippage
        const slippage = this.calculateSlippage(symbol, tradeAmount);
        // 4. Calculate network fees
        const networkFee = this.calculateNetworkFee(symbol);
        // 5. Calculate latency cost (price movement during execution)
        const latencyCost = this.calculateLatencyCost(symbol, buyPrice);
        // 6. Calculate total costs
        const totalCosts = buyFees + sellFees + slippage + networkFee + latencyCost;
        // 7. Calculate net profit
        const quantity = tradeAmount / buyPrice;
        const grossProfitUSD = grossSpread * quantity;
        const netProfit = grossProfitUSD - totalCosts;
        const netProfitPercent = (netProfit / tradeAmount) * 100;
        // 8. Calculate risk score
        const riskScore = this.calculateRiskScore(symbol, grossSpreadPercent, slippage);
        // 9. Calculate confidence
        const confidence = this.calculateConfidence(grossSpreadPercent, netProfitPercent, riskScore, buyExchange, sellExchange);
        // 10. Determine status
        const status = this.determineStatus(netProfitPercent, riskScore, confidence);
        return {
            id,
            symbol,
            buyExchange,
            sellExchange,
            buyPrice,
            sellPrice,
            grossSpread: grossSpreadPercent,
            netProfit,
            netProfitPercent,
            breakdownCosts: {
                buyFee: buyFees,
                sellFee: sellFees,
                slippage,
                networkFee,
                latencyCost,
            },
            expectedExecutionTime: this.estimateExecutionTime(symbol, buyExchange, sellExchange),
            riskScore,
            confidence,
            timestamp: Date.now(),
            status,
        };
    }
    // Complexity: O(1) — hash/map lookup
    calculateExchangeFees(exchange, amount, type) {
        const fees = EXCHANGE_FEES.get(exchange);
        if (!fees) {
            // Default fees if exchange not found
            return amount * 0.002; // 0.2% default
        }
        const feeRate = type === 'maker' ? fees.makerFee : fees.takerFee;
        return amount * feeRate;
    }
    // Complexity: O(1) — hash/map lookup
    calculateSlippage(symbol, amount) {
        const model = this.slippageModels.get(symbol);
        if (!model) {
            return amount * 0.005; // 0.5% default slippage
        }
        // Slippage increases with trade size and decreases with liquidity
        const sizeMultiplier = 1 + (amount / 100000) * 0.1; // Larger trades = more slippage
        const liquidityMultiplier = 100 / model.liquidityScore;
        const effectiveSlippage = model.avgSlippage * model.volatilityFactor * sizeMultiplier * liquidityMultiplier;
        return amount * effectiveSlippage;
    }
    // Complexity: O(1) — hash/map lookup
    calculateNetworkFee(symbol) {
        const network = NETWORK_COSTS.get(symbol);
        if (!network) {
            return 5; // $5 default network fee
        }
        return network.avgGasFee * network.congestionMultiplier;
    }
    // Complexity: O(1) — hash/map lookup
    calculateLatencyCost(symbol, price) {
        // Estimate price movement during execution
        // Based on typical 100ms execution time and volatility
        const model = this.slippageModels.get(symbol);
        const volatility = model?.volatilityFactor ?? 1.5;
        // Assume 0.01% price movement per 100ms on average, scaled by volatility
        const expectedMovement = 0.0001 * volatility;
        return price * expectedMovement;
    }
    // Complexity: O(1) — hash/map lookup
    calculateRiskScore(symbol, spread, slippage) {
        let risk = 0;
        // Higher spread = potentially more risk (might be manipulation)
        if (spread > 3)
            risk += 20;
        else if (spread > 2)
            risk += 10;
        // Slippage risk
        const slippagePercent = slippage / this.config.capitalAllocation * 100;
        if (slippagePercent > 0.5)
            risk += 25;
        else if (slippagePercent > 0.3)
            risk += 15;
        // Volatility risk
        const model = this.slippageModels.get(symbol);
        if (model) {
            risk += (model.volatilityFactor - 1) * 20;
        }
        // Liquidity risk
        if (model && model.liquidityScore < 70) {
            risk += (100 - model.liquidityScore) * 0.3;
        }
        return Math.min(100, Math.max(0, risk));
    }
    // Complexity: O(1) — hash/map lookup
    calculateConfidence(grossSpread, netProfit, riskScore, buyExchange, sellExchange) {
        let confidence = 1.0;
        // Spread too good to be true?
        if (grossSpread > 5)
            confidence *= 0.7;
        // Risk penalty
        confidence *= (100 - riskScore) / 100;
        // Net profit positive?
        if (netProfit < 0)
            confidence *= 0.3;
        // Known exchanges?
        if (!EXCHANGE_FEES.has(buyExchange))
            confidence *= 0.8;
        if (!EXCHANGE_FEES.has(sellExchange))
            confidence *= 0.8;
        return Math.max(0, Math.min(1, confidence));
    }
    // Complexity: O(1) — hash/map lookup
    estimateExecutionTime(symbol, buyExchange, sellExchange) {
        const network = NETWORK_COSTS.get(symbol);
        const baseLatency = 50; // 50ms base API latency
        const executionTime = network ? network.confirmationTime * 1000 : 5000;
        // API calls + blockchain confirmation
        return baseLatency * 2 + executionTime;
    }
    // Complexity: O(1)
    determineStatus(netProfitPercent, riskScore, confidence) {
        if (riskScore > this.config.maxRiskScore)
            return 'high-risk';
        if (netProfitPercent < 0)
            return 'unprofitable';
        if (netProfitPercent < this.config.minProfitThreshold)
            return 'marginal';
        if (confidence < this.config.minConfidence)
            return 'marginal';
        return 'viable';
    }
    // ═══════════════════════════════════════════════════════════════════════
    // BATCH ANALYSIS
    // ═══════════════════════════════════════════════════════════════════════
    /**
     * Analyze multiple arbitrage opportunities and rank them
     */
    // Complexity: O(1)
    analyzeOpportunities(spreads) {
        const opportunities = spreads.map(spread => this.calculateNetProfit(spread.symbol, spread.buyExchange, spread.sellExchange, spread.buyPrice, spread.sellPrice));
        // Sort by net profit descending, then by risk ascending
        return opportunities.sort((a, b) => {
            if (a.status === 'viable' && b.status !== 'viable')
                return -1;
            if (b.status === 'viable' && a.status !== 'viable')
                return 1;
            const profitDiff = b.netProfitPercent - a.netProfitPercent;
            if (Math.abs(profitDiff) > 0.1)
                return profitDiff;
            return a.riskScore - b.riskScore;
        });
    }
    /**
     * Get only viable opportunities that pass all thresholds
     */
    // Complexity: O(N) — linear iteration
    getViableOpportunities(opportunities) {
        return opportunities.filter(opp => opp.status === 'viable' &&
            opp.netProfitPercent >= this.config.minProfitThreshold &&
            opp.riskScore <= this.config.maxRiskScore &&
            opp.confidence >= this.config.minConfidence);
    }
    // ═══════════════════════════════════════════════════════════════════════
    // CONFIGURATION
    // ═══════════════════════════════════════════════════════════════════════
    // Complexity: O(1)
    updateConfig(config) {
        this.config = { ...this.config, ...config };
    }
    // Complexity: O(1)
    getConfig() {
        return { ...this.config };
    }
    /**
     * Update network congestion multiplier in real-time
     */
    // Complexity: O(1) — hash/map lookup
    updateNetworkCongestion(symbol, multiplier) {
        const network = NETWORK_COSTS.get(symbol);
        if (network) {
            network.congestionMultiplier = multiplier;
        }
    }
    /**
     * Record actual vs predicted profit for accuracy tracking
     */
    // Complexity: O(1)
    recordOutcome(predicted, actual) {
        const accuracy = 1 - Math.abs(predicted - actual) / Math.abs(predicted);
        this.historicalAccuracy.push(accuracy);
        // Keep last 1000 records
        if (this.historicalAccuracy.length > 1000) {
            this.historicalAccuracy.shift();
        }
    }
    // Complexity: O(N) — linear iteration
    getAccuracyMetrics() {
        if (this.historicalAccuracy.length === 0) {
            return { avgAccuracy: 0, samples: 0 };
        }
        const sum = this.historicalAccuracy.reduce((a, b) => a + b, 0);
        return {
            avgAccuracy: sum / this.historicalAccuracy.length,
            samples: this.historicalAccuracy.length,
        };
    }
}
exports.ArbitrageLogic = ArbitrageLogic;
// ═══════════════════════════════════════════════════════════════════════════
// SINGLETON EXPORT
// ═══════════════════════════════════════════════════════════════════════════
exports.arbitrageLogic = new ArbitrageLogic();
exports.default = ArbitrageLogic;
