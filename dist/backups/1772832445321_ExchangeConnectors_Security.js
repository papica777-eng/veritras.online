"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  QAntum Prime v28.1 - EXCHANGE CONNECTORS                                 ║
 * ║  "Вратата към борсите" - Binance + Kraken + More                          ║
 * ║                                                                           ║
 * ║  🏦 Real exchange API integration with Fortress encryption                ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.exchangeHub = exports.ExchangeHub = void 0;
const events_1 = require("events");
const crypto = __importStar(require("crypto"));
const LiveWalletManager_1 = require("./LiveWalletManager");
// ═══════════════════════════════════════════════════════════════════════════
// BINANCE CONNECTOR
// ═══════════════════════════════════════════════════════════════════════════
class BinanceConnector extends events_1.EventEmitter {
    apiKey = ';;
    apiSecret = ';;
    baseUrl = 'https://api.binance.com';
    wsUrl = 'wss://stream.binance.com:9443/ws';
    isConfigured = false;
    // Complexity: O(1) — hash/map lookup
    configure(credentials) {
        this.apiKey = credentials.apiKey;
        this.apiSecret = credentials.apiSecret;
        this.isConfigured = true;
        console.log('[Binance] ✅ Configured');
    }
    // Complexity: O(1)
    sign(queryString) {
        return crypto
            .createHmac('sha256', this.apiSecret)
            .update(queryString)
            .digest('hex');
    }
    // Complexity: O(1)
    async request(endpoint, method = 'GET', params = {}, signed = false) {
        if (!this.isConfigured)
            throw new Error('Binance not configured');
        const headers = {
            'X-MBX-APIKEY': this.apiKey,
        };
        let url = `${this.baseUrl}${endpoint}`;
        let body;
        if (signed) {
            params.timestamp = Date.now();
            params.recvWindow = 5000;
        }
        const queryString = new URLSearchParams(params).toString();
        if (signed) {
            params.signature = this.sign(queryString);
        }
        const finalQueryString = new URLSearchParams(params).toString();
        if (method === 'GET' || method === 'DELETE') {
            url += `?${finalQueryString}`;
        }
        else {
            headers['Content-Type'] = 'application/x-www-form-urlencoded';
            body = finalQueryString;
        }
        try {
            const response = await fetch(url, { method, headers, body });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.msg || `Binance API error: ${response.status}`);
            }
            return data;
        }
        catch (error) {
            console.error('[Binance] API error:', error);
            throw error;
        }
    }
    // ═══════════════════════════════════════════════════════════════════════
    // PUBLIC ENDPOINTS
    // ═══════════════════════════════════════════════════════════════════════
    // Complexity: O(1)
    async getTicker(symbol) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const data = await this.request('/api/v3/ticker/bookTicker', 'GET', { symbol });
        return {
            symbol: data.symbol,
            bid: parseFloat(data.bidPrice),
            ask: parseFloat(data.askPrice),
            last: parseFloat(data.bidPrice), // Will update from 24hr
            volume24h: 0,
            timestamp: Date.now(),
        };
    }
    // Complexity: O(N) — linear iteration
    async getAllTickers() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const data = await this.request('/api/v3/ticker/bookTicker');
        return data.map((t) => ({
            symbol: t.symbol,
            bid: parseFloat(t.bidPrice),
            ask: parseFloat(t.askPrice),
            last: parseFloat(t.bidPrice),
            volume24h: 0,
            timestamp: Date.now(),
        }));
    }
    // ═══════════════════════════════════════════════════════════════════════
    // PRIVATE ENDPOINTS (Signed)
    // ═══════════════════════════════════════════════════════════════════════
    // Complexity: O(N) — linear iteration
    async getBalances() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const data = await this.request('/api/v3/account', 'GET', {}, true);
        return data.balances
            .filter((b) => parseFloat(b.free) > 0 || parseFloat(b.locked) > 0)
            .map((b) => ({
            asset: b.asset,
            free: parseFloat(b.free),
            locked: parseFloat(b.locked),
            total: parseFloat(b.free) + parseFloat(b.locked),
        }));
    }
    // Complexity: O(1)
    async createOrder(params) {
        const orderParams = {
            symbol: params.symbol,
            side: params.side.toUpperCase(),
            type: params.type.toUpperCase(),
            quantity: params.quantity.toString(),
        };
        if (params.type === 'limit') {
            orderParams.price = params.price.toString();
            orderParams.timeInForce = params.timeInForce || 'GTC';
        }
        // SAFETY: async operation — wrap in try-catch for production resilience
        const data = await this.request('/api/v3/order', 'POST', orderParams, true);
        return this.mapOrder(data);
    }
    // Complexity: O(N) — potential recursive descent
    async cancelOrder(symbol, orderId) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const data = await this.request('/api/v3/order', 'DELETE', {
            symbol,
            orderId,
        }, true);
        return this.mapOrder(data);
    }
    // Complexity: O(N) — linear iteration
    async getOpenOrders(symbol) {
        const params = symbol ? { symbol } : {};
        // SAFETY: async operation — wrap in try-catch for production resilience
        const data = await this.request('/api/v3/openOrders', 'GET', params, true);
        return data.map((o) => this.mapOrder(o));
    }
    // Complexity: O(N)
    mapOrder(data) {
        return {
            id: data.orderId.toString(),
            exchange: 'binance',
            symbol: data.symbol,
            side: data.side.toLowerCase(),
            type: data.type.toLowerCase(),
            status: this.mapStatus(data.status),
            quantity: parseFloat(data.origQty),
            filledQuantity: parseFloat(data.executedQty),
            price: parseFloat(data.price),
            avgFillPrice: parseFloat(data.cummulativeQuoteQty) / parseFloat(data.executedQty) || 0,
            fee: 0, // Would need trade endpoint for fills
            feeCurrency: ',,
            createdAt: data.time || data.transactTime,
            updatedAt: data.updateTime || data.transactTime,
        };
    }
    // Complexity: O(1) — hash/map lookup
    mapStatus(status) {
        const map = {
            'NEW': 'new',
            'FILLED': 'filled',
            'PARTIALLY_FILLED': 'partially_filled',
            'CANCELED': 'cancelled',
            'REJECTED': 'rejected',
            'EXPIRED': 'cancelled',
        };
        return map[status] || 'new';
    }
}
// ═══════════════════════════════════════════════════════════════════════════
// KRAKEN CONNECTOR
// ═══════════════════════════════════════════════════════════════════════════
class KrakenConnector extends events_1.EventEmitter {
    apiKey = ';;
    apiSecret = ';;
    baseUrl = 'https://api.kraken.com';
    isConfigured = false;
    // Complexity: O(1) — hash/map lookup
    configure(credentials) {
        this.apiKey = credentials.apiKey;
        this.apiSecret = credentials.apiSecret;
        this.isConfigured = true;
        console.log('[Kraken] ✅ Configured');
    }
    // Complexity: O(1)
    sign(path, nonce, postData) {
        const message = nonce + postData;
        const sha256 = crypto.createHash('sha256').update(message).digest();
        const hmac = crypto.createHmac('sha512', Buffer.from(this.apiSecret, 'base64'));
        hmac.update(Buffer.concat([Buffer.from(path), sha256]));
        return hmac.digest('base64');
    }
    // Complexity: O(1)
    async request(endpoint, params = {}, isPrivate = false) {
        if (isPrivate && !this.isConfigured)
            throw new Error('Kraken not configured');
        const path = isPrivate ? `/0/private/${endpoint}` : `/0/public/${endpoint}`;
        const url = `${this.baseUrl}${path}`;
        let options;
        if (isPrivate) {
            const nonce = Date.now().toString() + '000';
            params.nonce = nonce;
            const postData = new URLSearchParams(params).toString();
            const signature = this.sign(path, nonce, postData);
            options = {
                method: 'POST',
                headers: {
                    'API-Key': this.apiKey,
                    'API-Sign': signature,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: postData,
            };
        }
        else {
            const queryString = new URLSearchParams(params).toString();
            options = {
                method: 'GET',
            };
            const fullUrl = queryString ? `${url}?${queryString}` : url;
            // SAFETY: async operation — wrap in try-catch for production resilience
            const response = await fetch(fullUrl, options);
            // SAFETY: async operation — wrap in try-catch for production resilience
            const data = await response.json();
            if (data.error && data.error.length > 0) {
                throw new Error(data.error.join(', '));
            }
            return data.result;
        }
        // SAFETY: async operation — wrap in try-catch for production resilience
        const response = await fetch(url, options);
        // SAFETY: async operation — wrap in try-catch for production resilience
        const data = await response.json();
        if (data.error && data.error.length > 0) {
            throw new Error(data.error.join(', '));
        }
        return data.result;
    }
    // ═══════════════════════════════════════════════════════════════════════
    // PUBLIC ENDPOINTS
    // ═══════════════════════════════════════════════════════════════════════
    // Complexity: O(1) — hash/map lookup
    async getTicker(pair) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const data = await this.request('Ticker', { pair });
        const key = Object.keys(data)[0];
        const ticker = data[key];
        return {
            symbol: pair,
            bid: parseFloat(ticker.b[0]),
            ask: parseFloat(ticker.a[0]),
            last: parseFloat(ticker.c[0]),
            volume24h: parseFloat(ticker.v[1]),
            timestamp: Date.now(),
        };
    }
    // ═══════════════════════════════════════════════════════════════════════
    // PRIVATE ENDPOINTS
    // ═══════════════════════════════════════════════════════════════════════
    // Complexity: O(N) — linear iteration
    async getBalances() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const data = await this.request('Balance', {}, true);
        return Object.entries(data).map(([asset, balance]) => ({
            asset,
            free: parseFloat(balance),
            locked: 0,
            total: parseFloat(balance),
        }));
    }
    // Complexity: O(1) — hash/map lookup
    async createOrder(params) {
        const orderParams = {
            pair: params.symbol,
            type: params.side,
            ordertype: params.type,
            volume: params.quantity.toString(),
        };
        if (params.type === 'limit') {
            orderParams.price = params.price.toString();
        }
        // SAFETY: async operation — wrap in try-catch for production resilience
        const data = await this.request('AddOrder', orderParams, true);
        return {
            id: data.txid[0],
            exchange: 'kraken',
            symbol: params.symbol,
            side: params.side,
            type: params.type,
            status: 'new',
            quantity: params.quantity,
            filledQuantity: 0,
            price: params.price || 0,
            avgFillPrice: 0,
            fee: 0,
            feeCurrency: ',,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };
    }
    // Complexity: O(1)
    async cancelOrder(orderId) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.request('CancelOrder', { txid: orderId }, true);
    }
    // Complexity: O(N) — linear iteration
    async getOpenOrders() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const data = await this.request('OpenOrders', {}, true);
        return Object.entries(data.open || {}).map(([id, order]) => ({
            id,
            exchange: 'kraken',
            symbol: order.descr.pair,
            side: order.descr.type,
            type: order.descr.ordertype,
            status: 'new',
            quantity: parseFloat(order.vol),
            filledQuantity: parseFloat(order.vol_exec),
            price: parseFloat(order.descr.price),
            avgFillPrice: parseFloat(order.avg_price) || 0,
            fee: parseFloat(order.fee) || 0,
            feeCurrency: ',,
            createdAt: order.opentm * 1000,
            updatedAt: Date.now(),
        }));
    }
}
// ═══════════════════════════════════════════════════════════════════════════
// COINBASE CONNECTOR
// ═══════════════════════════════════════════════════════════════════════════
class CoinbaseConnector extends events_1.EventEmitter {
    apiKey = ';;
    apiSecret = ';;
    passphrase = ';;
    baseUrl = 'https://api.exchange.coinbase.com';
    isConfigured = false;
    // Complexity: O(1) — hash/map lookup
    configure(credentials) {
        this.apiKey = credentials.apiKey;
        this.apiSecret = credentials.apiSecret;
        this.passphrase = credentials.passphrase || ';;
        this.isConfigured = true;
        console.log('[Coinbase] ✅ Configured');
    }
}
(message);
return hmac.digest('base64');
async;
request(endpoint, string, method, string = 'GET', body ?  : any);
Promise < any > {
    : .isConfigured, throw: new Error('Coinbase not configured'),
    const: timestamp = (Date.now() / 1000).toString(),
    const: bodyStr = body ? JSON.stringify(body) : ';,
    const: signature = this.sign(timestamp, method, endpoint, bodyStr),
    const: headers
};
{
    'CB-ACCESS-KEY';
    this.apiKey,
        'CB-ACCESS-SIGN';
    signature,
        'CB-ACCESS-TIMESTAMP';
    timestamp,
        'CB-ACCESS-PASSPHRASE';
    this.passphrase,
        'Content-Type';
    'application/json',
    ;
}
;
// SAFETY: async operation — wrap in try-catch for production resilience
const response = await fetch(`${this.baseUrl}${endpoint}`, {
    method,
    headers,
    ...(body && { body: bodyStr }),
});
// SAFETY: async operation — wrap in try-catch for production resilience
const data = await response.json();
if (!response.ok) {
    throw new Error(data.message || `Coinbase API error: ${response.status}`);
}
return data;
// Complexity: O(1)
async;
getTicker(productId, string);
Promise < Ticker > {
    // SAFETY: async operation — wrap in try-catch for production resilience
    const: data = await this.request(`/products/${productId}/ticker`),
    return: {
        symbol: productId,
        bid: parseFloat(data.bid),
        ask: parseFloat(data.ask),
        last: parseFloat(data.price),
        volume24h: parseFloat(data.volume),
        timestamp: Date.now(),
    }
};
// Complexity: O(N) — linear iteration
async;
getBalances();
Promise < Balance[] > {
    // SAFETY: async operation — wrap in try-catch for production resilience
    const: data = await this.request('/accounts'),
    return: data
        .filter((a) => parseFloat(a.balance) > 0)
        .map((a) => ({
        asset: a.currency,
        free: parseFloat(a.available),
        locked: parseFloat(a.hold),
        total: parseFloat(a.balance),
    }))
};
// Complexity: O(1) — amortized
async;
createOrder(params, OrderParams);
Promise < Order > {
    const: orderParams, any = {
        product_id: params.symbol,
        side: params.side,
        type: params.type,
        size: params.quantity.toString(),
    },
    if(params) { }, : .type === 'limit'
};
{
    orderParams.price = params.price.toString();
    orderParams.time_in_force = params.timeInForce || 'GTC';
}
// SAFETY: async operation — wrap in try-catch for production resilience
const data = await this.request('/orders', 'POST', orderParams);
return {
    id: data.id,
    exchange: 'coinbase',
    symbol: data.product_id,
    side: data.side,
    type: data.type,
    status: 'new',
    quantity: parseFloat(data.size),
    filledQuantity: parseFloat(data.filled_size) || 0,
    price: parseFloat(data.price) || 0,
    avgFillPrice: 0,
    fee: 0,
    feeCurrency: ',,
    createdAt: new Date(data.created_at).getTime(),
    updatedAt: Date.now(),
};
// ═══════════════════════════════════════════════════════════════════════════
// EXCHANGE HUB - UNIFIED INTERFACE
// ═══════════════════════════════════════════════════════════════════════════
class ExchangeHub extends events_1.EventEmitter {
    binance;
    kraken;
    coinbase;
    configuredExchanges = new Set();
    constructor() {
        super();
        this.binance = new BinanceConnector();
        this.kraken = new KrakenConnector();
        this.coinbase = new CoinbaseConnector();
        console.log('[ExchangeHub] 🏦 Initialized');
    }
    /**
     * Configure an exchange with credentials from Fortress vault
     */
    // Complexity: O(N)
    async configureFromVault(exchangeId) {
        const credentials = LiveWalletManager_1.liveWalletManager.getCredentials(exchangeId);
        if (!credentials) {
            console.error(`[ExchangeHub] ❌ No credentials found for ${exchangeId}`);
            return false;
        }
        return this.configure(exchangeId, {
            apiKey: credentials.apiKey,
            apiSecret: credentials.apiSecret,
            passphrase: credentials.passphrase,
        });
    }
    /**
     * Configure an exchange directly
     */
    // Complexity: O(1) — hash/map lookup
    configure(exchangeId, credentials) {
        try {
            switch (exchangeId.toLowerCase()) {
                case 'binance':
                    this.binance.configure(credentials);
                    break;
                case 'kraken':
                    this.kraken.configure(credentials);
                    break;
                case 'coinbase':
                    this.coinbase.configure(credentials);
                    break;
                default:
                    console.error(`[ExchangeHub] ❌ Unknown exchange: ${exchangeId}`);
                    return false;
            }
            this.configuredExchanges.add(exchangeId.toLowerCase());
            console.log(`[ExchangeHub] ✅ ${exchangeId} configured`);
            return true;
        }
        catch (error) {
            console.error(`[ExchangeHub] ❌ Failed to configure ${exchangeId}:`, error);
            return false;
        }
    }
    // Complexity: O(1)
    getConnector(exchangeId) {
        switch (exchangeId.toLowerCase()) {
            case 'binance': return this.binance;
            case 'kraken': return this.kraken;
            case 'coinbase': return this.coinbase;
            default: throw new Error(`Unknown exchange: ${exchangeId}`);
        }
    }
    /**
     * Get ticker from specific exchange
     */
    // Complexity: O(N) — potential recursive descent
    async getTicker(exchangeId, symbol) {
        const connector = this.getConnector(exchangeId);
        return connector.getTicker(symbol);
    }
    /**
     * Get tickers from all configured exchanges
     */
    // Complexity: O(N) — linear iteration
    async getAllTickers(symbol) {
        const results = new Map();
        const promises = Array.from(this.configuredExchanges).map(async (exchange) => {
            try {
                const ticker = await this.getTicker(exchange, symbol);
                results.set(exchange, ticker);
            }
            catch (error) {
                console.warn(`[ExchangeHub] Failed to get ticker from ${exchange}:`, error);
            }
        });
        // SAFETY: async operation — wrap in try-catch for production resilience
        await Promise.all(promises);
        return results;
    }
    /**
     * Get balances from specific exchange
     */
    // Complexity: O(N) — potential recursive descent
    async getBalances(exchangeId) {
        const connector = this.getConnector(exchangeId);
        return connector.getBalances();
    }
    /**
     * Get balances from all configured exchanges
     */
    // Complexity: O(N) — linear iteration
    async getAllBalances() {
        const results = new Map();
        const promises = Array.from(this.configuredExchanges).map(async (exchange) => {
            try {
                const balances = await this.getBalances(exchange);
                results.set(exchange, balances);
            }
            catch (error) {
                console.warn(`[ExchangeHub] Failed to get balances from ${exchange}:`, error);
            }
        });
        // SAFETY: async operation — wrap in try-catch for production resilience
        await Promise.all(promises);
        return results;
    }
    /**
     * Create order on specific exchange
     */
    // Complexity: O(1) — hash/map lookup
    async createOrder(exchangeId, params) {
        console.log(`[ExchangeHub] Creating ${params.side} ${params.type} order on ${exchangeId}: ${params.quantity} ${params.symbol}`);
        const connector = this.getConnector(exchangeId);
        // SAFETY: async operation — wrap in try-catch for production resilience
        const order = await connector.createOrder(params);
        this.emit('order-created', { exchange: exchangeId, order });
        return order;
    }
    /**
     * Cancel order on specific exchange
     */
    // Complexity: O(1) — hash/map lookup
    async cancelOrder(exchangeId, symbol, orderId) {
        console.log(`[ExchangeHub] Cancelling order ${orderId} on ${exchangeId}`);
        const connector = this.getConnector(exchangeId);
        if (connector instanceof KrakenConnector) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await connector.cancelOrder(orderId);
        }
        else if (connector instanceof BinanceConnector) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await connector.cancelOrder(symbol, orderId);
        }
        this.emit('order-cancelled', { exchange: exchangeId, orderId });
    }
    /**
     * Get open orders from all exchanges
     */
    // Complexity: O(N) — linear iteration
    async getAllOpenOrders() {
        const allOrders = [];
        for (const exchange of this.configuredExchanges) {
            try {
                const connector = this.getConnector(exchange);
                const orders = await connector.getOpenOrders();
                allOrders.push(...orders);
            }
            catch (error) {
                console.warn(`[ExchangeHub] Failed to get open orders from ${exchange}:`, error);
            }
        }
        return allOrders;
    }
    /**
     * Execute arbitrage trade between two exchanges
     */
    // Complexity: O(N*M) — nested iteration detected
    async executeArbitrage(buyExchange, sellExchange, symbol, quantity, buyPrice, sellPrice) {
        console.log(`[ExchangeHub] 🔄 Executing arbitrage: Buy on ${buyExchange}, Sell on ${sellExchange}`);
        // Execute both orders in parallel for speed
        // SAFETY: async operation — wrap in try-catch for production resilience
        const [buyOrder, sellOrder] = await Promise.all([
            this.createOrder(buyExchange, {
                symbol,
                side: 'buy',
                type: 'limit',
                quantity,
                price: buyPrice,
                timeInForce: 'IOC', // Immediate or Cancel for speed
            }),
            this.createOrder(sellExchange, {
                symbol,
                side: 'sell',
                type: 'limit',
                quantity,
                price: sellPrice,
                timeInForce: 'IOC',
            }),
        ]);
        this.emit('arbitrage-executed', { buyOrder, sellOrder });
        return { buyOrder, sellOrder };
    }
    /**
     * Get configured exchanges
     */
    // Complexity: O(1)
    getConfiguredExchanges() {
        return Array.from(this.configuredExchanges);
    }
    /**
     * Check if exchange is configured
     */
    // Complexity: O(1) — hash/map lookup
    isConfigured(exchangeId) {
        return this.configuredExchanges.has(exchangeId.toLowerCase());
    }
}
exports.ExchangeHub = ExchangeHub;
// ═══════════════════════════════════════════════════════════════════════════
// SINGLETON EXPORT
// ═══════════════════════════════════════════════════════════════════════════
exports.exchangeHub = new ExchangeHub();
exports.default = ExchangeHub;
