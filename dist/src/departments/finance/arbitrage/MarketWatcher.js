"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  QAntum Prime v28.0 - MARKET WATCHER                                      ║
 * ║  "Очите на Хищника" - Multi-Market Interceptor                            ║
 * ║                                                                           ║
 * ║  Паралелно сканиране на цени от 3+ източници с Ghost Protocol stealth    ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.marketWatcher = exports.MarketWatcher = void 0;
const events_1 = require("events");
// ═══════════════════════════════════════════════════════════════════════════
// MARKET WATCHER - THE PREDATOR'S EYES
// ═══════════════════════════════════════════════════════════════════════════
class MarketWatcher extends events_1.EventEmitter {
    markets = new Map();
    priceCache = new Map();
    stealthProfiles = [];
    currentProfileIndex = 0;
    scanInterval = null;
    isRunning = false;
    // Performance metrics
    totalScans = 0;
    successfulScans = 0;
    detectionAttempts = 0;
    // Configuration
    SCAN_INTERVAL_MS = 100; // 10 scans per second per market
    FINGERPRINT_ROTATION_MS = 30000; // Rotate every 30 seconds
    MAX_CONCURRENT_REQUESTS = 50;
    PRICE_CACHE_TTL_MS = 5000;
    constructor() {
        super();
        this.initializeStealthProfiles();
        this.initializeDefaultMarkets();
    }
    // ═══════════════════════════════════════════════════════════════════════
    // STEALTH INITIALIZATION - GHOST PROTOCOL INTEGRATION
    // ═══════════════════════════════════════════════════════════════════════
    // Complexity: O(N*M) — nested iteration detected
    initializeStealthProfiles() {
        // 50 unique fingerprints for TLS JA3 diversity
        const userAgents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1',
        ];
        const tlsProfiles = ['chrome_120', 'firefox_121', 'safari_17', 'edge_120', 'ios_17'];
        for (let i = 0; i < 50; i++) {
            this.stealthProfiles.push({
                fingerprint: this.generateFingerprint(),
                userAgent: userAgents[i % userAgents.length],
                tlsProfile: tlsProfiles[i % tlsProfiles.length],
                proxyChain: this.generateProxyChain(),
                lastRotation: Date.now(),
            });
        }
        console.log(`[MarketWatcher] 🎭 Initialized ${this.stealthProfiles.length} stealth profiles`);
    }
    // Complexity: O(N) — linear iteration
    generateFingerprint() {
        const chars = 'abcdef0123456789';
        let fingerprint = '';
        for (let i = 0; i < 32; i++) {
            fingerprint += chars[Math.floor(Math.random() * chars.length)];
        }
        return fingerprint;
    }
    // Complexity: O(N*M) — nested iteration detected
    generateProxyChain() {
        // Simulated proxy chain for demonstration
        const regions = ['us-east', 'eu-west', 'asia-pacific', 'us-west', 'eu-central'];
        const chain = [];
        const chainLength = Math.floor(Math.random() * 2) + 1; // 1-2 hops
        for (let i = 0; i < chainLength; i++) {
            const region = regions[Math.floor(Math.random() * regions.length)];
            chain.push(`proxy-${region}-${Math.floor(Math.random() * 100)}.qantum.network`);
        }
        return chain;
    }
    // Complexity: O(1)
    getNextStealthProfile() {
        const profile = this.stealthProfiles[this.currentProfileIndex];
        this.currentProfileIndex = (this.currentProfileIndex + 1) % this.stealthProfiles.length;
        // Rotate fingerprint if needed
        if (Date.now() - profile.lastRotation > this.FINGERPRINT_ROTATION_MS) {
            profile.fingerprint = this.generateFingerprint();
            profile.proxyChain = this.generateProxyChain();
            profile.lastRotation = Date.now();
        }
        return profile;
    }
    // ═══════════════════════════════════════════════════════════════════════
    // MARKET CONFIGURATION
    // ═══════════════════════════════════════════════════════════════════════
    // Complexity: O(N)
    initializeDefaultMarkets() {
        // Crypto Exchanges
        this.addMarket({
            name: 'Binance',
            type: 'crypto',
            apiUrl: 'https://api.binance.com/api/v3/ticker/price',
            rateLimit: 1200, // 1200 requests per minute
            useStealth: true,
            timeout: 5000,
        });
        this.addMarket({
            name: 'Coinbase',
            type: 'crypto',
            apiUrl: 'https://api.coinbase.com/v2/prices',
            rateLimit: 10000,
            useStealth: true,
            timeout: 5000,
        });
        this.addMarket({
            name: 'Kraken',
            type: 'crypto',
            apiUrl: 'https://api.kraken.com/0/public/Ticker',
            rateLimit: 15,
            useStealth: true,
            timeout: 5000,
        });
        this.addMarket({
            name: 'Bybit',
            type: 'crypto',
            apiUrl: 'https://api.bybit.com/v5/market/tickers',
            rateLimit: 120,
            useStealth: true,
            timeout: 5000,
        });
        this.addMarket({
            name: 'OKX',
            type: 'crypto',
            apiUrl: 'https://www.okx.com/api/v5/market/tickers',
            rateLimit: 20,
            useStealth: true,
            timeout: 5000,
        });
        // Korean Exchange (for geographic arbitrage)
        this.addMarket({
            name: 'Upbit',
            type: 'crypto',
            apiUrl: 'https://api.upbit.com/v1/ticker',
            rateLimit: 10,
            useStealth: true,
            timeout: 5000,
        });
        console.log(`[MarketWatcher] 📊 Initialized ${this.markets.size} market sources`);
    }
    // Complexity: O(1) — hash/map lookup
    addMarket(config) {
        this.markets.set(config.name, config);
        this.priceCache.set(config.name, []);
    }
    // Complexity: O(1)
    removeMarket(name) {
        this.markets.delete(name);
        this.priceCache.delete(name);
    }
    // ═══════════════════════════════════════════════════════════════════════
    // PRICE FETCHING - THE HUNT
    // ═══════════════════════════════════════════════════════════════════════
    // Complexity: O(1) — hash/map lookup
    async start() {
        if (this.isRunning) {
            console.log('[MarketWatcher] Already running');
            return;
        }
        this.isRunning = true;
        console.log('[MarketWatcher] 🦅 Predator Eyes ACTIVATED - Scanning markets...');
        // Initial scan
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.scanAllMarkets();
        // Continuous scanning
        this.scanInterval = setInterval(async () => {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.scanAllMarkets();
        }, this.SCAN_INTERVAL_MS);
        this.emit('started');
    }
    // Complexity: O(1) — hash/map lookup
    stop() {
        if (!this.isRunning)
            return;
        this.isRunning = false;
        if (this.scanInterval) {
            // Complexity: O(1)
            clearInterval(this.scanInterval);
            this.scanInterval = null;
        }
        console.log('[MarketWatcher] 🛑 Predator Eyes DEACTIVATED');
        this.emit('stopped');
    }
    // Complexity: O(N) — linear iteration
    async scanAllMarkets() {
        const scanStart = performance.now();
        const symbols = ['BTC', 'ETH', 'SOL', 'XRP', 'ADA', 'DOGE', 'MATIC', 'AVAX'];
        const promises = Array.from(this.markets.entries()).map(async ([name, config]) => {
            try {
                const prices = await this.fetchMarketPrices(config, symbols);
                this.priceCache.set(name, prices);
                this.successfulScans++;
                return { market: name, prices, success: true };
            }
            catch (error) {
                console.error(`[MarketWatcher] ❌ Failed to fetch from ${name}:`, error);
                return { market: name, prices: [], success: false };
            }
        });
        // SAFETY: async operation — wrap in try-catch for production resilience
        const results = await Promise.all(promises);
        this.totalScans++;
        const scanDuration = performance.now() - scanStart;
        // Detect arbitrage opportunities
        const spreads = this.calculateSpreads(symbols);
        if (spreads.length > 0) {
            this.emit('spreads', spreads);
        }
        // Performance logging every 100 scans
        if (this.totalScans % 100 === 0) {
            const successRate = (this.successfulScans / (this.totalScans * this.markets.size) * 100).toFixed(2);
            console.log(`[MarketWatcher] 📈 Scan #${this.totalScans} | ${scanDuration.toFixed(2)}ms | Success: ${successRate}%`);
        }
    }
    // Complexity: O(N) — linear iteration
    async fetchMarketPrices(config, symbols) {
        const profile = this.getNextStealthProfile();
        const fetchStart = performance.now();
        // In production, this would make actual API calls
        // For now, we simulate with realistic data
        const prices = [];
        for (const symbol of symbols) {
            // Simulate realistic price with slight variance per exchange
            const basePrice = this.getBasePrice(symbol);
            const exchangeVariance = (Math.random() - 0.5) * 0.02; // ±1% variance
            const price = basePrice * (1 + exchangeVariance);
            prices.push({
                exchange: config.name,
                symbol: symbol,
                price: price,
                volume24h: Math.random() * 1000000000,
                timestamp: Date.now(),
                latencyMs: performance.now() - fetchStart,
                confidence: 0.95 + Math.random() * 0.05,
            });
        }
        return prices;
    }
    // Complexity: O(1) — hash/map lookup
    getBasePrice(symbol) {
        // Simulated base prices (would be from actual market data)
        const prices = {
            'BTC': 42500,
            'ETH': 2250,
            'SOL': 110,
            'XRP': 0.62,
            'ADA': 0.61,
            'DOGE': 0.092,
            'MATIC': 0.87,
            'AVAX': 38.5,
        };
        return prices[symbol] || 100;
    }
    // ═══════════════════════════════════════════════════════════════════════
    // SPREAD CALCULATION - FINDING THE PREY
    // ═══════════════════════════════════════════════════════════════════════
    // Complexity: O(N*M) — nested iteration detected
    calculateSpreads(symbols) {
        const spreads = [];
        const exchanges = Array.from(this.priceCache.keys());
        for (const symbol of symbols) {
            // Get all prices for this symbol across exchanges
            const symbolPrices = [];
            for (const exchange of exchanges) {
                const prices = this.priceCache.get(exchange) || [];
                const symbolPrice = prices.find(p => p.symbol === symbol);
                if (symbolPrice) {
                    symbolPrices.push({ exchange, price: symbolPrice.price });
                }
            }
            if (symbolPrices.length < 2)
                continue;
            // Find min and max prices
            symbolPrices.sort((a, b) => a.price - b.price);
            const lowest = symbolPrices[0];
            const highest = symbolPrices[symbolPrices.length - 1];
            const spreadPercent = ((highest.price - lowest.price) / lowest.price) * 100;
            // Only report significant spreads (> 0.5%)
            if (spreadPercent > 0.5) {
                spreads.push({
                    symbol,
                    buyExchange: lowest.exchange,
                    sellExchange: highest.exchange,
                    buyPrice: lowest.price,
                    sellPrice: highest.price,
                    spreadPercent,
                    potentialProfit: highest.price - lowest.price,
                    timestamp: Date.now(),
                });
            }
        }
        return spreads.sort((a, b) => b.spreadPercent - a.spreadPercent);
    }
    // ═══════════════════════════════════════════════════════════════════════
    // PUBLIC API
    // ═══════════════════════════════════════════════════════════════════════
    // Complexity: O(1) — hash/map lookup
    getPrices(exchange) {
        return this.priceCache.get(exchange) || [];
    }
    // Complexity: O(1)
    getAllPrices() {
        return new Map(this.priceCache);
    }
    // Complexity: O(N) — potential recursive descent
    getTopSpreads(limit = 10) {
        const symbols = ['BTC', 'ETH', 'SOL', 'XRP', 'ADA', 'DOGE', 'MATIC', 'AVAX'];
        return this.calculateSpreads(symbols).slice(0, limit);
    }
    // Complexity: O(1)
    getStats() {
        return {
            totalScans: this.totalScans,
            successfulScans: this.successfulScans,
            successRate: this.totalScans > 0
                ? (this.successfulScans / (this.totalScans * this.markets.size)) * 100
                : 0,
            marketsMonitored: this.markets.size,
            detectionAttempts: this.detectionAttempts,
        };
    }
}
exports.MarketWatcher = MarketWatcher;
// ═══════════════════════════════════════════════════════════════════════════
// SINGLETON EXPORT
// ═══════════════════════════════════════════════════════════════════════════
exports.marketWatcher = new MarketWatcher();
exports.default = MarketWatcher;
