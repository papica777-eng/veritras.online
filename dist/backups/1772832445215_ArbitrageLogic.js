"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  QAntum Prime v35.0 - ARBITRAGE LOGIC                                     ║
 * ║  "Математиката на Спреда" - Spread Analysis Engine                        ║
 * ║                                                                           ║
 * ║  Direct Arb  = (Price_B - Price_A) - (Fees + Slippage + Latency_Cost)     ║
 * ║  Triangle Arb = A→B→C→A path profit - cumulative costs                    ║
 * ║  Execution Priority = netProfit / riskScore * timeDecay                    ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.arbitrageLogic = exports.ArbitrageLogic = void 0;
const TRIANGULAR_PATHS = [
    { id: 'TRI-BTC-ETH', legs: ['BTC/USDT', 'ETH/BTC', 'ETH/USDT'], exchanges: ['Binance', 'Binance', 'Binance'], expectedCycleProfitPercent: 0 },
    { id: 'TRI-BTC-SOL', legs: ['BTC/USDT', 'SOL/BTC', 'SOL/USDT'], exchanges: ['Binance', 'Binance', 'Binance'], expectedCycleProfitPercent: 0 },
    { id: 'TRI-ETH-SOL', legs: ['ETH/USDT', 'SOL/ETH', 'SOL/USDT'], exchanges: ['Binance', 'Binance', 'Binance'], expectedCycleProfitPercent: 0 },
    { id: 'TRI-BTC-XRP', legs: ['BTC/USDT', 'XRP/BTC', 'XRP/USDT'], exchanges: ['Binance', 'Binance', 'Binance'], expectedCycleProfitPercent: 0 },
    { id: 'TRI-BTC-AVAX', legs: ['BTC/USDT', 'AVAX/BTC', 'AVAX/USDT'], exchanges: ['Binance', 'Binance', 'Binance'], expectedCycleProfitPercent: 0 },
    { id: 'TRI-CROSS-BTC', legs: ['BTC/USDT', 'BTC/USDT', 'BTC/USDT'], exchanges: ['Binance', 'Kraken', 'Coinbase'], expectedCycleProfitPercent: 0 },
    { id: 'TRI-CROSS-ETH', legs: ['ETH/USDT', 'ETH/USDT', 'ETH/USDT'], exchanges: ['Binance', 'OKX', 'Bybit'], expectedCycleProfitPercent: 0 },
];
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
    cooldowns = new Map(); // exchange-pair → cooldown timestamp
    activeTrades = 0;
    tradeHistory = [];
    // Complexity: O(1)
    constructor(config = {}) {
        this.config = {
            minProfitThreshold: config.minProfitThreshold ?? 1.5,
            maxSlippageTolerance: config.maxSlippageTolerance ?? 0.5,
            maxRiskScore: config.maxRiskScore ?? 30,
            latencyBudgetMs: config.latencyBudgetMs ?? 5000,
            minConfidence: config.minConfidence ?? 0.8,
            capitalAllocation: config.capitalAllocation ?? 10000,
            enableTriangular: config.enableTriangular ?? true,
            cooldownMs: config.cooldownMs ?? 3000,
            maxConcurrentTrades: config.maxConcurrentTrades ?? 3,
            decayHalfLifeMs: config.decayHalfLifeMs ?? 2000,
            minOrderBookDepth: config.minOrderBookDepth ?? 5000,
        };
        this.initializeSlippageModels();
    }
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
        // 11. Calculate priority score (profit/risk weighted by time decay)
        const priorityScore = this.calculatePriorityScore(netProfitPercent, riskScore, confidence);
        // 12. Estimate order book depth (simulated)
        const orderBookDepth = this.estimateOrderBookDepth(symbol, buyExchange, sellExchange);
        // 13. Check cooldown
        const pairKey = `${buyExchange}-${sellExchange}-${symbol}`;
        const cooldownUntil = this.cooldowns.get(pairKey) || 0;
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
            type: 'direct',
            priorityScore,
            cooldownUntil: cooldownUntil > Date.now() ? cooldownUntil : undefined,
            orderBookDepth,
        };
    }
    calculateExchangeFees(exchange, amount, type) {
        const fees = EXCHANGE_FEES.get(exchange);
        if (!fees) {
            // Default fees if exchange not found
            return amount * 0.002; // 0.2% default
        }
        const feeRate = type === 'maker' ? fees.makerFee : fees.takerFee;
        return amount * feeRate;
    }
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
    calculateNetworkFee(symbol) {
        const network = NETWORK_COSTS.get(symbol);
        if (!network) {
            return 5; // $5 default network fee
        }
        return network.avgGasFee * network.congestionMultiplier;
    }
    calculateLatencyCost(symbol, price) {
        // Estimate price movement during execution
        // Based on typical 100ms execution time and volatility
        const model = this.slippageModels.get(symbol);
        const volatility = model?.volatilityFactor ?? 1.5;
        // Assume 0.01% price movement per 100ms on average, scaled by volatility
        const expectedMovement = 0.0001 * volatility;
        return price * expectedMovement;
    }
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
    estimateExecutionTime(symbol, buyExchange, sellExchange) {
        const network = NETWORK_COSTS.get(symbol);
        const baseLatency = 50; // 50ms base API latency
        const executionTime = network ? network.confirmationTime * 1000 : 5000;
        // API calls + blockchain confirmation
        return baseLatency * 2 + executionTime;
    }
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
    analyzeOpportunities(spreads) {
        const opportunities = spreads.map(spread => this.calculateNetProfit(spread.symbol, spread.buyExchange, spread.sellExchange, spread.buyPrice, spread.sellPrice));
        // Sort by PRIORITY SCORE (composite metric) — not just profit
        return opportunities.sort((a, b) => {
            if (a.status === 'viable' && b.status !== 'viable')
                return -1;
            if (b.status === 'viable' && a.status !== 'viable')
                return 1;
            // Primary: priority score (profit/risk * decay)
            return b.priorityScore - a.priorityScore;
        });
    }
    /**
     * Get only viable opportunities that pass all thresholds
     * Complexity: O(n) filter pass
     */
    getViableOpportunities(opportunities) {
        const now = Date.now();
        return opportunities.filter(opp => opp.status === 'viable' &&
            opp.netProfitPercent >= this.config.minProfitThreshold &&
            opp.riskScore <= this.config.maxRiskScore &&
            opp.confidence >= this.config.minConfidence &&
            // NEW: Cooldown check
            (!opp.cooldownUntil || opp.cooldownUntil <= now) &&
            // NEW: Concurrent trade limit
            this.activeTrades < this.config.maxConcurrentTrades &&
            // NEW: Order book depth check
            (opp.orderBookDepth === undefined || opp.orderBookDepth >= this.config.minOrderBookDepth));
    }
    // ═══════════════════════════════════════════════════════════════════════
    // TRIANGULAR ARBITRAGE SCANNER
    // ═══════════════════════════════════════════════════════════════════════
    /**
     * Scan for triangular arbitrage opportunities
     * A→B→C→A cycle: profit if product of rates > 1.0 + costs
     * Complexity: O(paths * legs)
     */
    scanTriangularOpportunities(prices // exchange → symbol → price
    ) {
        if (!this.config.enableTriangular)
            return [];
        const triangularOpps = [];
        for (const path of TRIANGULAR_PATHS) {
            try {
                const [leg1Symbol, leg2Symbol, leg3Symbol] = path.legs;
                const [ex1, ex2, ex3] = path.exchanges;
                const price1 = prices.get(ex1)?.get(leg1Symbol);
                const price2 = prices.get(ex2)?.get(leg2Symbol);
                const price3 = prices.get(ex3)?.get(leg3Symbol);
                if (!price1 || !price2 || !price3)
                    continue;
                // Calculate cycle rate: buy A with USDT, convert A→B, sell B for USDT
                // Profit if: (1/price1) * price2 * price3 > 1.0
                const cycleRate = (1 / price1) * price2 * price3;
                const grossProfitPercent = (cycleRate - 1) * 100;
                // Deduct cumulative fees for 3 trades
                const fee1 = this.calculateExchangeFees(ex1, this.config.capitalAllocation, 'taker');
                const fee2 = this.calculateExchangeFees(ex2, this.config.capitalAllocation, 'taker');
                const fee3 = this.calculateExchangeFees(ex3, this.config.capitalAllocation, 'maker');
                const totalFees = fee1 + fee2 + fee3;
                const baseSymbol = leg1Symbol.split('/')[0] || leg1Symbol;
                const slippage = this.calculateSlippage(baseSymbol, this.config.capitalAllocation) * 3; // 3 legs
                const netProfit = (this.config.capitalAllocation * grossProfitPercent / 100) - totalFees - slippage;
                const netProfitPercent = (netProfit / this.config.capitalAllocation) * 100;
                if (netProfitPercent > 0.1) { // Even marginal triangular opps are interesting
                    const riskScore = Math.min(100, 15 + (3 - cycleRate) * 30); // 3 legs = higher base risk
                    const confidence = Math.max(0, Math.min(1, (netProfitPercent / 2) * (1 - riskScore / 100)));
                    triangularOpps.push({
                        id: `TRI-${path.id}-${Date.now()}`,
                        symbol: baseSymbol,
                        buyExchange: ex1,
                        sellExchange: ex3,
                        buyPrice: price1,
                        sellPrice: price3,
                        grossSpread: grossProfitPercent,
                        netProfit,
                        netProfitPercent,
                        breakdownCosts: { buyFee: fee1, sellFee: fee3, slippage, networkFee: 0, latencyCost: fee2 },
                        expectedExecutionTime: 150, // ~50ms per leg
                        riskScore,
                        confidence,
                        timestamp: Date.now(),
                        status: this.determineStatus(netProfitPercent, riskScore, confidence),
                        type: 'triangular',
                        path: path.legs,
                        priorityScore: this.calculatePriorityScore(netProfitPercent, riskScore, confidence),
                        orderBookDepth: this.estimateOrderBookDepth(baseSymbol, ex1, ex3),
                    });
                }
            }
            catch (e) {
                // Skip invalid paths silently
            }
        }
        return triangularOpps.sort((a, b) => b.priorityScore - a.priorityScore);
    }
    // ═══════════════════════════════════════════════════════════════════════
    // PRIORITY SCORING & ORDER BOOK DEPTH
    // ═══════════════════════════════════════════════════════════════════════
    /**
     * Composite priority score: higher = execute first
     * Formula: (netProfit / riskScore) * confidenceBoost * timeDecay
     * Complexity: O(1)
     */
    calculatePriorityScore(netProfitPercent, riskScore, confidence) {
        const safeRisk = Math.max(1, riskScore); // Avoid division by zero
        const profitRiskRatio = netProfitPercent / safeRisk;
        const confidenceBoost = 1 + (confidence - 0.5) * 2; // 0.5→1.0, 1.0→2.0
        return profitRiskRatio * confidenceBoost * 100;
    }
    /**
     * Estimate available liquidity at the target price level
     * In production, this would query actual order book depth via WebSocket
     * Complexity: O(1)
     */
    estimateOrderBookDepth(symbol, buyExchange, sellExchange) {
        const model = this.slippageModels.get(symbol);
        const liquidityScore = model?.liquidityScore ?? 50;
        // Base depth estimation from liquidity score
        // High liquidity (100) → ~$500K depth, Low (30) → ~$15K depth
        const baseDepth = (liquidityScore / 100) * 500000;
        // Known exchanges have better depth
        const exchangeMultiplier = (EXCHANGE_FEES.has(buyExchange) ? 1.0 : 0.6) *
            (EXCHANGE_FEES.has(sellExchange) ? 1.0 : 0.6);
        return baseDepth * exchangeMultiplier;
    }
    // ═══════════════════════════════════════════════════════════════════════
    // COOLDOWN MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════
    /**
     * Set cooldown for an exchange pair after trade execution
     * Prevents rapid-fire trades that trigger exchange rate limits
     * Complexity: O(1)
     */
    setCooldown(buyExchange, sellExchange, symbol) {
        const key = `${buyExchange}-${sellExchange}-${symbol}`;
        this.cooldowns.set(key, Date.now() + this.config.cooldownMs);
    }
    /**
     * Track active trade count for concurrency limiting
     * Complexity: O(1)
     */
    onTradeStart() { this.activeTrades++; }
    onTradeEnd() { this.activeTrades = Math.max(0, this.activeTrades - 1); }
    /**
     * Record trade outcome for historical performance tracking
     * Complexity: O(1)
     */
    recordTradeOutcome(id, profit, symbol) {
        this.tradeHistory.push({ id, profit, timestamp: Date.now(), symbol });
        if (this.tradeHistory.length > 5000)
            this.tradeHistory.shift();
    }
    /**
     * Get performance metrics by symbol
     * Complexity: O(n) where n = tradeHistory length
     */
    getSymbolPerformance(symbol) {
        const symbolTrades = this.tradeHistory.filter(t => t.symbol === symbol);
        const wins = symbolTrades.filter(t => t.profit > 0).length;
        const totalProfit = symbolTrades.reduce((sum, t) => sum + t.profit, 0);
        return {
            trades: symbolTrades.length,
            totalProfit,
            avgProfit: symbolTrades.length > 0 ? totalProfit / symbolTrades.length : 0,
            winRate: symbolTrades.length > 0 ? (wins / symbolTrades.length) * 100 : 0,
        };
    }
    // ═══════════════════════════════════════════════════════════════════════
    // CONFIGURATION
    // ═══════════════════════════════════════════════════════════════════════
    updateConfig(config) {
        this.config = { ...this.config, ...config };
    }
    getConfig() {
        return { ...this.config };
    }
    /**
     * Update network congestion multiplier in real-time
     * Complexity: O(1)
     */
    updateNetworkCongestion(symbol, multiplier) {
        const network = NETWORK_COSTS.get(symbol);
        if (network) {
            network.congestionMultiplier = multiplier;
        }
    }
    /**
     * Dynamically update exchange fee data (called when live API reports new fees)
     * Complexity: O(1)
     */
    updateExchangeFees(exchange, fees) {
        const existing = EXCHANGE_FEES.get(exchange);
        if (existing) {
            EXCHANGE_FEES.set(exchange, { ...existing, ...fees });
        }
        else {
            EXCHANGE_FEES.set(exchange, {
                exchange,
                makerFee: fees.makerFee ?? 0.002,
                takerFee: fees.takerFee ?? 0.002,
                withdrawalFee: fees.withdrawalFee ?? 0.001,
                depositFee: fees.depositFee ?? 0,
            });
        }
    }
    /**
     * Record actual vs predicted profit with DECAY-WEIGHTED accuracy
     * Recent outcomes weigh more than older ones
     * Complexity: O(1)
     */
    recordOutcome(predicted, actual) {
        const accuracy = predicted !== 0 ? 1 - Math.abs(predicted - actual) / Math.abs(predicted) : 0;
        this.historicalAccuracy.push({ value: accuracy, timestamp: Date.now() });
        // Keep last 1000 records
        if (this.historicalAccuracy.length > 1000) {
            this.historicalAccuracy.shift();
        }
    }
    /**
     * Get decay-weighted accuracy metrics
     * Recent predictions matter more (exponential decay)
     * Complexity: O(n)
     */
    getAccuracyMetrics() {
        if (this.historicalAccuracy.length === 0) {
            return { avgAccuracy: 0, weightedAccuracy: 0, samples: 0 };
        }
        const now = Date.now();
        let weightedSum = 0;
        let totalWeight = 0;
        let simpleSum = 0;
        for (const record of this.historicalAccuracy) {
            const ageMs = now - record.timestamp;
            const weight = Math.exp(-ageMs / this.config.decayHalfLifeMs * Math.LN2);
            weightedSum += record.value * weight;
            totalWeight += weight;
            simpleSum += record.value;
        }
        return {
            avgAccuracy: simpleSum / this.historicalAccuracy.length,
            weightedAccuracy: totalWeight > 0 ? weightedSum / totalWeight : 0,
            samples: this.historicalAccuracy.length,
        };
    }
    /**
     * Get full system diagnostics
     * Complexity: O(n)
     */
    getDiagnostics() {
        const symbols = [...new Set(this.tradeHistory.map(t => t.symbol))];
        const topSymbols = symbols
            .map(s => ({ symbol: s, ...this.getSymbolPerformance(s) }))
            .sort((a, b) => b.totalProfit - a.totalProfit)
            .slice(0, 5)
            .map(s => ({ symbol: s.symbol, trades: s.trades, profit: s.totalProfit }));
        return {
            config: this.getConfig(),
            activeTrades: this.activeTrades,
            cooldownCount: this.cooldowns.size,
            tradeHistoryCount: this.tradeHistory.length,
            accuracy: this.getAccuracyMetrics(),
            topSymbols,
        };
    }
}
exports.ArbitrageLogic = ArbitrageLogic;
// ═══════════════════════════════════════════════════════════════════════════
// SINGLETON EXPORT
// ═══════════════════════════════════════════════════════════════════════════
exports.arbitrageLogic = new ArbitrageLogic();
exports.default = ArbitrageLogic;
