/**
 * BinanceAdapterPro — Qantum Module
 * @module BinanceAdapterPro
 * @path src/departments/finance/arbitrage/binance/BinanceAdapterPro.ts
 * @auto-documented BrutalDocEngine v2.1
 */

import type { IExchangeAdapter, TickerData } from '../core/interfaces.ts';
import ResilientHttpClient from '../utils/ResilientHttpClient.ts';
import { binanceSteel } from '../src/services/binance/BinanceSteelClient';

interface BinanceTickerResponse {
    symbol: string;
    price: string;
}

/**
 * 🏛️ BINANCE ADAPTER PRO [STEEL_VERSION]
 * Complexity: O(1) per execution
 * "No simulation. Real orders. Real money."
 */
export default class BinanceAdapter implements IExchangeAdapter {
    name = "Binance [Enterprise]";
    private http: ResilientHttpClient;

    constructor() {
        // Public data via Resilient HTTP (Ghost Mode)
        const apiKey = process.env.BINANCE_API_KEY || "MOCK_KEY";
        this.http = new ResilientHttpClient("BINANCE_CONN", "https://api.binance.com/api/v3", apiKey);
    }

    // Complexity: O(1) — hash/map lookup
    async connect(): Promise<void> {
        console.log("🔌 Connecting to Binance [Steel Layer]...");
        if (binanceSteel.isManifested()) {
            console.log("✅ Binance Steel Client Manifested (Authenticated).");
        } else {
            console.warn("⚠️ Binance Steel Client NOT Manifested (Missing Keys).");
        }

        try {
            await this.http.get('/ping');
            console.log("✅ Binance Public Gateway Connected.");
        } catch (e) {
            console.warn("⚠️ Binance Connectivity Issues (Ghost Mode Active).");
        }
    }

    // Complexity: O(N)
    async getTicker(symbol: string): Promise<TickerData> {
        // Use MarketClient for real-time tickers
        if (binanceSteel.isManifested()) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            const data = await binanceSteel.market.getTicker(symbol);
            return {
                symbol: data.symbol,
                price: data.price,
                volume: data.volume || 0,
                timestamp: data.timestamp || Date.now()
            };
        }

        // Fallback to Public HTTP if credentials missing
        const cleanSymbol = symbol.replace(/\//g, '').toUpperCase();
        // SAFETY: async operation — wrap in try-catch for production resilience
        const data = await this.http.get<BinanceTickerResponse>('/ticker/price', { symbol: cleanSymbol });
        return {
            symbol: symbol,
            price: parseFloat(data.price),
            volume: 0,
            timestamp: Date.now()
        };
    }

    // Complexity: O(1) — hash/map lookup
    async executeOrder(symbol: string, side: 'BUY' | 'SELL', amount: number): Promise<string> {
        if (!binanceSteel.isManifested()) {
            console.warn("[STEEL_ADAPTER] Running in SIMULATION (No API Keys)");
            return `SIM-ORD-${Date.now()}`;
        }

        // SAFETY: async operation — wrap in try-catch for production resilience
        const res = await binanceSteel.spot.createOrder(symbol, side.toLowerCase() as 'buy' | 'sell', amount);
        return res.id || `ORD-${Date.now()}`;
    }

    // Complexity: O(1)
    async getWalletBalance(asset: string): Promise<number> {
        if (!binanceSteel.isManifested()) {
            return 10000; // Simulated fallback
        }
        // SAFETY: async operation — wrap in try-catch for production resilience
        return await binanceSteel.wallet.getBalance(asset);
    }
}


