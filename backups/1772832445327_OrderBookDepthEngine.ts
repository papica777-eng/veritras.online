/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  QAntum Prime v36.0 - ORDER BOOK DEPTH ENGINE                            ║
 * ║  "The Heatmap Oracle" - Real Execution Price Calculator                   ║
 * ║                                                                           ║
 * ║  Replaces simulated slippage with L2 order book depth analysis            ║
 * ║  RealProfit = Σ(Depth[Price] * Qty) - Fees                                ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

// ═══════════════════════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════════════

export interface OrderBookLevel {
    price: number;    // Price at this level (cents precision)
    quantity: number; // Available quantity
    total: number;    // Cumulative quantity up to this level
}

export interface OrderBookSnapshot {
    symbol: string;
    exchange: string;
    bids: OrderBookLevel[];  // Sorted descending (best bid first)
    asks: OrderBookLevel[];  // Sorted ascending (best ask first)
    timestamp: number;
    lastUpdateId: number;
}

export interface ExecutionSimulation {
    side: 'buy' | 'sell';
    requestedAmountUSD: number;
    avgFillPrice: number;      // Weighted average fill price
    bestPrice: number;         // Best available price (top of book)
    worstPrice: number;        // Worst fill price in the simulation
    effectiveSlippage: number; // % difference from best price
    filledQuantity: number;
    totalCostUSD: number;
    levelsConsumed: number;    // How many order book levels were needed
    depthAvailableUSD: number; // Total available liquidity in USD
    canFillCompletely: boolean;
}

export interface DepthHeatmapData {
    symbol: string;
    exchange: string;
    bidWall: { price: number; sizeUSD: number } | null;   // Largest bid concentration
    askWall: { price: number; sizeUSD: number } | null;   // Largest ask concentration
    spread: number;            // Current bid-ask spread %
    spreadAbsolute: number;    // Spread in USD
    imbalance: number;         // Bid/Ask volume ratio (>1 = more bids = bullish)
    midPrice: number;          // (bestBid + bestAsk) / 2
    topBidDepthUSD: number;    // Total USD in top 10 bid levels
    topAskDepthUSD: number;    // Total USD in top 10 ask levels
    timestamp: number;
}

export interface DepthEngineConfig {
    maxLevels: number;          // Max order book levels to track (default 20)
    staleThresholdMs: number;   // Mark data stale after N ms (default 5000)
    reconnectIntervalMs: number;// WebSocket reconnect interval
    symbols: string[];          // Symbols to track
    exchanges: string[];        // Exchanges to track
}

// ═══════════════════════════════════════════════════════════════════════════
// ORDER BOOK DEPTH ENGINE
// ═══════════════════════════════════════════════════════════════════════════

export class OrderBookDepthEngine {
    private config: DepthEngineConfig;
    private books: Map<string, OrderBookSnapshot> = new Map(); // key: "exchange:symbol"
    private wsConnections: Map<string, WebSocket | null> = new Map();
    private listeners: Map<string, ((data: DepthHeatmapData) => void)[]> = new Map();
    private updateCount: number = 0;

    // Complexity: O(1)
    constructor(config: Partial<DepthEngineConfig> = {}) {
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
    public simulateExecution(
        symbol: string,
        exchange: string,
        side: 'buy' | 'sell',
        amountUSD: number
    ): ExecutionSimulation {
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
            if (remainingUSD <= 0) break;

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
    public calculateRealArbitrageProfit(
        symbol: string,
        buyExchange: string,
        sellExchange: string,
        amountUSD: number,
        totalFeesUSD: number
    ): {
        netProfitUSD: number;
        netProfitPercent: number;
        buyExecution: ExecutionSimulation;
        sellExecution: ExecutionSimulation;
        isViable: boolean;
    } {
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
    public getHeatmapData(symbol: string, exchange: string): DepthHeatmapData | null {
        const book = this.getBook(`${exchange}:${symbol}`);
        if (!book || book.bids.length === 0 || book.asks.length === 0) return null;

        const bestBid = book.bids[0].price;
        const bestAsk = book.asks[0].price;

        // Find walls (largest single level)
        let bidWall: { price: number; sizeUSD: number } | null = null;
        let askWall: { price: number; sizeUSD: number } | null = null;
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
    public getAllHeatmapData(): DepthHeatmapData[] {
        const results: DepthHeatmapData[] = [];
        for (const [key] of this.books) {
            const [exchange, symbol] = key.split(':');
            const data = this.getHeatmapData(symbol, exchange);
            if (data) results.push(data);
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
    public ingestBinanceDepth(
        symbol: string,
        exchange: string,
        rawData: { bids: [string, string][]; asks: [string, string][]; lastUpdateId?: number }
    ): void {
        const bids: OrderBookLevel[] = [];
        const asks: OrderBookLevel[] = [];
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

        const snapshot: OrderBookSnapshot = {
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
            for (const cb of listeners) cb(heatmap);
        }
    }

    /**
     * Connect to Binance WebSocket depth stream
     * wss://stream.binance.com:9443/ws/<symbol>@depth20@100ms
     * 
     * This method is designed to work in both Node.js and browser environments.
     * In Termux (S24 Ultra), use the 'ws' package.
     */
    public connectBinanceWS(symbol: string): void {
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

            ws.onmessage = (event: { data: string }) => {
                try {
                    const data = JSON.parse(typeof event.data === 'string' ? event.data : event.data.toString());
                    if (data.bids && data.asks) {
                        this.ingestBinanceDepth(symbol.toUpperCase(), 'Binance', data);
                    }
                } catch (e) {
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
        } catch (e) {
            // WebSocket not available — fall back to HTTP polling
            console.log(`[DepthEngine] WebSocket unavailable for ${symbol}, use HTTP polling`);
        }
    }

    /**
     * Connect to all configured symbols via WebSocket
     */
    public connectAll(): void {
        for (const symbol of this.config.symbols) {
            this.connectBinanceWS(symbol);
        }
    }

    /**
     * Disconnect all WebSocket connections
     */
    public disconnectAll(): void {
        for (const [key, ws] of this.wsConnections) {
            if (ws) {
                try { ws.close(); } catch (e) { /* ignore */ }
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
    public onUpdate(exchange: string, symbol: string, callback: (data: DepthHeatmapData) => void): void {
        const key = `${exchange}:${symbol}`;
        const existing = this.listeners.get(key) ?? [];
        existing.push(callback);
        this.listeners.set(key, existing);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // UTILITIES
    // ═══════════════════════════════════════════════════════════════════════

    // Complexity: O(1)
    private getBook(key: string): OrderBookSnapshot | undefined {
        return this.books.get(key);
    }

    // Complexity: O(1)
    private isStale(book: OrderBookSnapshot): boolean {
        return Date.now() - book.timestamp > this.config.staleThresholdMs;
    }

    // Complexity: O(1)
    private createFallbackSimulation(side: 'buy' | 'sell', amountUSD: number): ExecutionSimulation {
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
    public getDiagnostics(): {
        trackedBooks: number;
        activeConnections: number;
        totalUpdates: number;
        staleBooks: string[];
        config: DepthEngineConfig;
    } {
        const staleBooks: string[] = [];
        for (const [key, book] of this.books) {
            if (this.isStale(book)) staleBooks.push(key);
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

// ═══════════════════════════════════════════════════════════════════════════
// SINGLETON EXPORT
// ═══════════════════════════════════════════════════════════════════════════

export const orderBookEngine = new OrderBookDepthEngine();

export default OrderBookDepthEngine;
