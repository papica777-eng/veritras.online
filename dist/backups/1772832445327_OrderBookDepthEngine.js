"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  QAntum Prime v36.0 - ORDER BOOK DEPTH ENGINE                            ║
 * ║  "The Heatmap Oracle" - Real Execution Price Calculator                   ║
 * ║                                                                           ║
 * ║  Replaces simulated slippage with L2 order book depth analysis            ║
 * ║  RealProfit = Σ(Depth[Price] * Qty) - Fees                                ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderBookEngine = exports.OrderBookDepthEngine = void 0;
// ═══════════════════════════════════════════════════════════════════════════
// ORDER BOOK DEPTH ENGINE
// ═══════════════════════════════════════════════════════════════════════════
class OrderBookDepthEngine {
    config;
    books = new Map(); // key: "exchange:symbol"
    wsConnections = new Map();
    listeners = new Map();
    updateCount = 0;
    // Complexity: O(1)
    constructor(config = {}) {
        this.config = {
            maxLevels: config.maxLevels ?? 20,
            staleThresholdMs: config.staleThresholdMs ?? 5000,
            reconnectIntervalMs: config.reconnectIntervalMs ?? 10000,
            symbols: config.symbols ?? ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'XRPUSDT', 'AVAXUSDT'],
            exchanges: config.exchanges ?? ['Binance'],
        };
    }
    // ═══════════════════════════════════════════════════════════════════════
    // CORE: EXECUTION PRICE CALCULATION
    // ═══════════════════════════════════════════════════════════════════════
    /**
     * Calculate the REAL execution price for a given trade amount
     * by walking through the order book depth levels.
     *
     * This replaces the naive slippage estimation with actual
     * order book analysis.
     *
     * Complexity: O(levels) where levels = order book depth consumed
     */
    simulateExecution(symbol, exchange, side, amountUSD) {
        const key = `${exchange}:${symbol}`;
        const book = this.books.get(key);
        // Fallback if no order book data available
        if (!book || this.isStale(book)) {
            return this.createFallbackSimulation(side, amountUSD);
        }
        const levels = side === 'buy' ? book.asks : book.bids;
        if (levels.length === 0) {
            return this.createFallbackSimulation(side, amountUSD);
        }
        let remainingUSD = amountUSD;
        let totalQuantityFilled = 0;
        let weightedPriceSum = 0;
        let levelsConsumed = 0;
        let worstPrice = levels[0].price;
        const bestPrice = levels[0].price;
        // Walk through order book levels
        for (const level of levels) {
            if (remainingUSD <= 0)
                break;
            const levelValueUSD = level.quantity * level.price;
            const fillUSD = Math.min(remainingUSD, levelValueUSD);
            const fillQuantity = fillUSD / level.price;
            weightedPriceSum += fillQuantity * level.price;
            totalQuantityFilled += fillQuantity;
            remainingUSD -= fillUSD;
            worstPrice = level.price;
            levelsConsumed++;
        }
        const avgFillPrice = totalQuantityFilled > 0 ? weightedPriceSum / totalQuantityFilled : bestPrice;
        const effectiveSlippage = Math.abs(avgFillPrice - bestPrice) / bestPrice * 100;
        const totalDepthUSD = levels.reduce((sum, l) => sum + l.quantity * l.price, 0);
        return {
            side,
            requestedAmountUSD: amountUSD,
            avgFillPrice,
            bestPrice,
            worstPrice,
            effectiveSlippage,
            filledQuantity: totalQuantityFilled,
            totalCostUSD: amountUSD - remainingUSD,
            levelsConsumed,
            depthAvailableUSD: totalDepthUSD,
            canFillCompletely: remainingUSD <= 0,
        };
    }
    /**
     * Calculate REAL arbitrage profit using order book depth on both sides
     *
     * Instead of: profit = (sellPrice - buyPrice) * qty - fees
     * We compute:  profit = sellExecution.total - buyExecution.total - fees
     *
     * Complexity: O(buyLevels + sellLevels)
     */
    calculateRealArbitrageProfit(symbol, buyExchange, sellExchange, amountUSD, totalFeesUSD) {
        const buyExec = this.simulateExecution(symbol, buyExchange, 'buy', amountUSD);
        // Sell the same quantity we bought
        const sellValueUSD = buyExec.filledQuantity * (this.getBook(`${sellExchange}:${symbol}`)?.bids[0]?.price ?? 0);
        const sellExec = this.simulateExecution(symbol, sellExchange, 'sell', sellValueUSD);
        // Real profit: what we get from selling - what we paid to buy - fees
        const sellRevenue = sellExec.filledQuantity * sellExec.avgFillPrice;
        const buyCost = buyExec.filledQuantity * buyExec.avgFillPrice;
        const netProfitUSD = sellRevenue - buyCost - totalFeesUSD;
        const netProfitPercent = (netProfitUSD / amountUSD) * 100;
        return {
            netProfitUSD,
            netProfitPercent,
            buyExecution: buyExec,
            sellExecution: sellExec,
            isViable: netProfitUSD > 0 && buyExec.canFillCompletely && sellExec.canFillCompletely,
        };
    }
    // ═══════════════════════════════════════════════════════════════════════
    // HEATMAP DATA GENERATION
    // ═══════════════════════════════════════════════════════════════════════
    /**
     * Generate heatmap data for dashboard visualization
     * Complexity: O(levels) per book
     */
    getHeatmapData(symbol, exchange) {
        const book = this.getBook(`${exchange}:${symbol}`);
        if (!book || book.bids.length === 0 || book.asks.length === 0)
            return null;
        const bestBid = book.bids[0].price;
        const bestAsk = book.asks[0].price;
        // Find walls (largest single level)
        let bidWall = null;
        let askWall = null;
        let maxBidSize = 0;
        let maxAskSize = 0;
        for (const level of book.bids) {
            const sizeUSD = level.quantity * level.price;
            if (sizeUSD > maxBidSize) {
                maxBidSize = sizeUSD;
                bidWall = { price: level.price, sizeUSD };
            }
        }
        for (const level of book.asks) {
            const sizeUSD = level.quantity * level.price;
            if (sizeUSD > maxAskSize) {
                maxAskSize = sizeUSD;
                askWall = { price: level.price, sizeUSD };
            }
        }
        // Top 10 depth
        const top10Bids = book.bids.slice(0, 10);
        const top10Asks = book.asks.slice(0, 10);
        const topBidDepthUSD = top10Bids.reduce((s, l) => s + l.quantity * l.price, 0);
        const topAskDepthUSD = top10Asks.reduce((s, l) => s + l.quantity * l.price, 0);
        return {
            symbol,
            exchange,
            bidWall,
            askWall,
            spread: ((bestAsk - bestBid) / bestBid) * 100,
            spreadAbsolute: bestAsk - bestBid,
            imbalance: topAskDepthUSD > 0 ? topBidDepthUSD / topAskDepthUSD : 0,
            midPrice: (bestBid + bestAsk) / 2,
            topBidDepthUSD,
            topAskDepthUSD,
            timestamp: book.timestamp,
        };
    }
    /**
     * Get all heatmap data for all tracked books
     * Complexity: O(books * levels)
     */
    getAllHeatmapData() {
        const results = [];
        for (const [key] of this.books) {
            const [exchange, symbol] = key.split(':');
            const data = this.getHeatmapData(symbol, exchange);
            if (data)
                results.push(data);
        }
        return results;
    }
    // ═══════════════════════════════════════════════════════════════════════
    // DATA INGESTION (from WebSocket or HTTP polling)
    // ═══════════════════════════════════════════════════════════════════════
    /**
     * Ingest order book snapshot from Binance depth endpoint
     * Expected format: { bids: [[price, qty], ...], asks: [[price, qty], ...] }
     * Complexity: O(n log n) for sorting
     */
    ingestBinanceDepth(symbol, exchange, rawData) {
        const bids = [];
        const asks = [];
        let cumBid = 0;
        let cumAsk = 0;
        // Parse and sort bids (desc by price)
        const sortedBids = rawData.bids
            .map(([p, q]) => ({ price: parseFloat(p), quantity: parseFloat(q) }))
            .sort((a, b) => b.price - a.price)
            .slice(0, this.config.maxLevels);
        for (const { price, quantity } of sortedBids) {
            cumBid += quantity;
            bids.push({ price, quantity, total: cumBid });
        }
        // Parse and sort asks (asc by price)
        const sortedAsks = rawData.asks
            .map(([p, q]) => ({ price: parseFloat(p), quantity: parseFloat(q) }))
            .sort((a, b) => a.price - b.price)
            .slice(0, this.config.maxLevels);
        for (const { price, quantity } of sortedAsks) {
            cumAsk += quantity;
            asks.push({ price, quantity, total: cumAsk });
        }
        const snapshot = {
            symbol,
            exchange,
            bids,
            asks,
            timestamp: Date.now(),
            lastUpdateId: rawData.lastUpdateId ?? 0,
        };
        const key = `${exchange}:${symbol}`;
        this.books.set(key, snapshot);
        this.updateCount++;
        // Notify listeners
        const heatmap = this.getHeatmapData(symbol, exchange);
        if (heatmap) {
            const listeners = this.listeners.get(key) ?? [];
            for (const cb of listeners)
                cb(heatmap);
        }
    }
    /**
     * Connect to Binance WebSocket depth stream
     * wss://stream.binance.com:9443/ws/<symbol>@depth20@100ms
     *
     * This method is designed to work in both Node.js and browser environments.
     * In Termux (S24 Ultra), use the 'ws' package.
     */
    connectBinanceWS(symbol) {
        const wsSymbol = symbol.toLowerCase();
        const url = `wss://stream.binance.com:9443/ws/${wsSymbol}@depth20@100ms`;
        const key = `Binance:${symbol.toUpperCase()}`;
        // Guard: prevent duplicate connections
        if (this.wsConnections.has(key)) {
            return;
        }
        try {
            // Dynamic WebSocket creation (works in both browser and Node.js/Termux)
            const WS = typeof WebSocket !== 'undefined' ? WebSocket : require('ws');
            const ws = new WS(url);
            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(typeof event.data === 'string' ? event.data : event.data.toString());
                    if (data.bids && data.asks) {
                        this.ingestBinanceDepth(symbol.toUpperCase(), 'Binance', data);
                    }
                }
                catch (e) {
                    // Invalid data — skip
                }
            };
            ws.onclose = () => {
                this.wsConnections.delete(key);
                // Auto-reconnect
                setTimeout(() => this.connectBinanceWS(symbol), this.config.reconnectIntervalMs);
            };
            ws.onerror = () => {
                ws.close();
            };
            this.wsConnections.set(key, ws);
        }
        catch (e) {
            // WebSocket not available — fall back to HTTP polling
            console.log(`[DepthEngine] WebSocket unavailable for ${symbol}, use HTTP polling`);
        }
    }
    /**
     * Connect to all configured symbols via WebSocket
     */
    connectAll() {
        for (const symbol of this.config.symbols) {
            this.connectBinanceWS(symbol);
        }
    }
    /**
     * Disconnect all WebSocket connections
     */
    disconnectAll() {
        for (const [key, ws] of this.wsConnections) {
            if (ws) {
                try {
                    ws.close();
                }
                catch (e) { /* ignore */ }
            }
        }
        this.wsConnections.clear();
    }
    // ═══════════════════════════════════════════════════════════════════════
    // EVENT LISTENERS
    // ═══════════════════════════════════════════════════════════════════════
    /**
     * Subscribe to heatmap updates for a specific exchange:symbol pair
     * Complexity: O(1)
     */
    onUpdate(exchange, symbol, callback) {
        const key = `${exchange}:${symbol}`;
        const existing = this.listeners.get(key) ?? [];
        existing.push(callback);
        this.listeners.set(key, existing);
    }
    // ═══════════════════════════════════════════════════════════════════════
    // UTILITIES
    // ═══════════════════════════════════════════════════════════════════════
    // Complexity: O(1)
    getBook(key) {
        return this.books.get(key);
    }
    // Complexity: O(1)
    isStale(book) {
        return Date.now() - book.timestamp > this.config.staleThresholdMs;
    }
    // Complexity: O(1)
    createFallbackSimulation(side, amountUSD) {
        return {
            side,
            requestedAmountUSD: amountUSD,
            avgFillPrice: 0,
            bestPrice: 0,
            worstPrice: 0,
            effectiveSlippage: 0.5, // 0.5% default fallback
            filledQuantity: 0,
            totalCostUSD: 0,
            levelsConsumed: 0,
            depthAvailableUSD: 0,
            canFillCompletely: false,
        };
    }
    /**
     * Get engine diagnostics
     * Complexity: O(books)
     */
    getDiagnostics() {
        const staleBooks = [];
        for (const [key, book] of this.books) {
            if (this.isStale(book))
                staleBooks.push(key);
        }
        return {
            trackedBooks: this.books.size,
            activeConnections: this.wsConnections.size,
            totalUpdates: this.updateCount,
            staleBooks,
            config: { ...this.config },
        };
    }
}
exports.OrderBookDepthEngine = OrderBookDepthEngine;
// ═══════════════════════════════════════════════════════════════════════════
// SINGLETON EXPORT
// ═══════════════════════════════════════════════════════════════════════════
exports.orderBookEngine = new OrderBookDepthEngine();
exports.default = OrderBookDepthEngine;
