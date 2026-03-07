"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelegramAdapter = exports.VortexBrainAdapter = exports.BinanceAdapter = void 0;
const ResilientHttpClient_ts_1 = __importDefault(require("../utils/ResilientHttpClient.ts"));
// --- BINANCE ADAPTER ---
class BinanceAdapter {
    name = "Binance [Enterprise]";
    http;
    constructor() {
        // In a real app, API Key comes from env
        // We use a mock key for the exercise if env is missing
        const apiKey = process.env.BINANCE_API_KEY || "MOCK_KEY";
        this.http = new ResilientHttpClient_ts_1.default("BINANCE_CONN", "https://api.binance.com/api/v3", apiKey);
    }
    async connect() {
        console.log("🔌 Connecting to Binance [Resilient Layer]...");
        // Test connectivity with a lightweight ping
        try {
            await this.http.get('/ping');
            console.log("✅ Binance Connected via Enterprise Gateway.");
        }
        catch (e) {
            console.warn("⚠️ Binance Connectivity Issues (Demo Mode Active).");
        }
    }
    async getTicker(symbol) {
        try {
            // Attempt standard API call
            const data = await this.http.get('/ticker/price', { symbol });
            return {
                symbol: data.symbol,
                price: parseFloat(data.price),
                volume: 0,
                timestamp: Date.now()
            };
        }
        catch (e) {
            // Fallback for offline demo mode
            return {
                symbol,
                price: 95000 + (Math.random() - 0.5) * 100,
                volume: 5000,
                timestamp: Date.now()
            };
        }
    }
    async executeOrder(symbol, side, amount) {
        console.log(`🏦 [BINANCE ENTERPRISE] ORDER: ${side} $${amount} of ${symbol}`);
        return `ORD-${Date.now()}`;
    }
    async getWalletBalance(asset) {
        return 10000; // Mock balance
    }
}
exports.BinanceAdapter = BinanceAdapter;
// --- VORTEX BRAIN ADAPTER ---
// Simulates the bridge to the old AI engine
class LegacyVortexBrain {
    analyze(marketState) {
        const strength = Math.random() * 100;
        return { signalStrength: strength > 70 ? strength : -strength };
    }
}
class VortexBrainAdapter {
    core;
    constructor() {
        this.core = new LegacyVortexBrain();
    }
    async analyze(data) {
        const result = this.core.analyze({ price: data.price, vol: data.volume });
        if (result.signalStrength > 80) {
            return { action: 'BUY', confidence: result.signalStrength, reason: "DeepMind Bullish Pattern" };
        }
        if (result.signalStrength < -80) {
            return { action: 'SELL', confidence: Math.abs(result.signalStrength), reason: "DeepMind Bearish Divergence" };
        }
        return { action: 'HOLD', confidence: 0, reason: "Market Neutral" };
    }
}
exports.VortexBrainAdapter = VortexBrainAdapter;
// --- TELEGRAM ADAPTER ---
class TelegramAdapter {
    async sendAlert(message, level) {
        const icon = level === 'CRITICAL' ? '🚨' : (level === 'WARNING' ? '⚠️' : '📱');
        console.log(`${icon} [TELEGRAM SENT]: ${message}`);
    }
}
exports.TelegramAdapter = TelegramAdapter;
