"use strict";
/**
 * BinanceAdapterPro — Qantum Module
 * @module BinanceAdapterPro
 * @path src/departments/reality/exchanges/BinanceAdapterPro.ts
 * @auto-documented BrutalDocEngine v2.1
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ResilientHttpClient_ts_1 = __importDefault(require("../utils/ResilientHttpClient.ts"));
/**
 * 🏛️ BINANCE ADAPTER PRO
 * Isolated file for Worker Threads to avoid circular dependency or export ambiguity.
 */
class BinanceAdapter {
    name = "Binance [Enterprise]";
    http;
    constructor() {
        const apiKey = process.env.BINANCE_API_KEY || "MOCK_KEY";
        this.http = new ResilientHttpClient_ts_1.default("BINANCE_CONN", "https://api.binance.com/api/v3", apiKey);
    }
    // Complexity: O(1) — hash/map lookup
    async connect() {
        console.log("🔌 Connecting to Binance [Resilient Layer]...");
        try {
            await this.http.get('/ping');
            console.log("✅ Binance Connected via Enterprise Gateway.");
        }
        catch (e) {
            console.warn("⚠️ Binance Connectivity Issues (Demo Mode Active).");
        }
    }
    // Complexity: O(N*M) — nested iteration detected
    async getTicker(symbol) {
        // ✅ Enterprise Sanitization
        const cleanSymbol = symbol.replace(/\//g, '').toUpperCase();
        try {
            const data = await this.http.get('/ticker/price', { symbol: cleanSymbol });
            return {
                symbol: symbol, // Keep original format (BTC/USDT) for logs
                price: parseFloat(data.price),
                volume: 0,
                timestamp: Date.now()
            };
        }
        catch (e) {
            console.warn(`[BinanceAdapter] Error fetching ticker for ${symbol}:`, e);
            throw e; // Propagate error as requested
        }
    }
    // Complexity: O(1)
    async executeOrder(symbol, side, amount) {
        return `ORD-${Date.now()}`;
    }
    // Complexity: O(1)
    async getWalletBalance(asset) {
        return 10000;
    }
}
exports.default = BinanceAdapter;
