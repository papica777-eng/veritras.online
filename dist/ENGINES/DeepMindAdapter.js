"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const VortexDeepMind_ts_1 = __importDefault(require("../core/VortexDeepMind.ts"));
const ResilientHttpClient_ts_1 = __importDefault(require("../utils/ResilientHttpClient.ts"));
/**
 * 🧠 DEEP MIND ADAPTER
 *
 * Bridges the gap between:
 * 1. The Hexagonal Engine (which speaks 'TickerData')
 * 2. The VortexDeepMind Math Core (which speaks 'Candles' and 'RSI')
 *
 * Feature: AUTOMATIC WARMUP
 * Before trading, it pulls 300 minutes of history to prime the indicators.
 */
class DeepMindAdapter {
    brain;
    http;
    symbol;
    constructor(symbol, apiKey) {
        this.symbol = symbol;
        this.brain = new VortexDeepMind_ts_1.default();
        // Dedicated HTTP client for historical data fetching
        this.http = new ResilientHttpClient_ts_1.default(`HIST-${symbol.replace('/', '')}`, 'https://api.binance.com/api/v3', apiKey);
    }
    /**
     * 🔥 WARMUP: Downloads history to prime RSI/MACD
     */
    async warmup() {
        // Use console directly if Logger not fully set up in this context, or use standard Logger
        console.log(`[${this.symbol}] ⏳ Downloading historical market data (300m)...`);
        try {
            // Fetch last 300 candles (1m interval)
            // Endpoint: /api/v3/klines?symbol=BTCUSDT&interval=1m&limit=300
            const symbolClean = this.symbol.replace('/', '');
            const klines = await this.http.get('/klines', {
                symbol: symbolClean,
                interval: '1m',
                limit: 300
            });
            // Feed the Brain
            klines.forEach(k => {
                const candle = {
                    timestamp: k[0],
                    open: parseFloat(k[1]),
                    high: parseFloat(k[2]),
                    low: parseFloat(k[3]),
                    close: parseFloat(k[4]),
                    volume: parseFloat(k[5])
                };
                this.brain.ingest(candle);
            });
            console.log(`[${this.symbol}] 🧠 Brain fully charged with ${klines.length} historical candles.`);
        }
        catch (error) {
            console.error(`[${this.symbol}] ❌ Warmup Failed! Indicators will be inaccurate initially.`, error);
        }
    }
    /**
     * ⚡ ANALYZE: Real-time processing
     */
    async analyze(ticker) {
        // 1. Convert Ticker to Candle (Approximation for HFT)
        const currentCandle = {
            timestamp: ticker.timestamp,
            open: ticker.price,
            high: ticker.price,
            low: ticker.price,
            close: ticker.price,
            volume: ticker.volume
        };
        // 2. Feed the Beast
        this.brain.ingest(currentCandle);
        // 3. Get Analysis
        const analysis = this.brain.analyze(this.symbol);
        if (!analysis) {
            return { action: 'HOLD', confidence: 0, reason: "Insufficient Data" };
        }
        // 4. Translate Score (-100 to +100) to Signal
        const score = analysis.signalStrength;
        if (score >= 75) {
            return {
                action: 'BUY',
                confidence: score,
                reason: `STRONG BUY | RSI: ${analysis.indicators.rsi.toFixed(1)}`
            };
        }
        if (score <= -75) {
            return {
                action: 'SELL',
                confidence: Math.abs(score),
                reason: `STRONG SELL | MACD Divergence`
            };
        }
        // Logic for Stop Loss could go here if we tracked position state in the adapter
        // but for now, we leave it to the Engine/Exit logic.
        return { action: 'HOLD', confidence: 0, reason: `Neutral (${score.toFixed(1)})` };
    }
}
exports.default = DeepMindAdapter;
