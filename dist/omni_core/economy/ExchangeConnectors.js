"use strict";
/**
 * ExchangeConnectors — Qantum Module
 * @module ExchangeConnectors
 * @path omni_core/economy/ExchangeConnectors.ts
 * @auto-documented BrutalDocEngine v2.1
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
exports.ExchangeHub = void 0;
// [PURIFIED_BY_AETERNA: a2cbc8ea-5607-49bb-a758-b5a503c30c42]
// Suggestion: Review and entrench stable logic.
/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  QAntum Prime v28.1 - EXCHANGE CONNECTORS                                 ║
 * ║  "Вратата към борсите" - Binance + Kraken + More                          ║
 * ║                                                                           ║
 * ║  🏦 Real exchange API integration with Fortress encryption                ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */
const events_1 = require("events");
const crypto = __importStar(require("crypto"));
const LiveWalletManager_1 = require("./LiveWalletManager");
// ═══════════════════════════════════════════════════════════════════════════
// BINANCE CONNECTOR
// ═══════════════════════════════════════════════════════════════════════════
class BinanceConnector extends events_1.EventEmitter {
    apiKey = '';
    apiSecret = '';
    baseUrl = 'https://api.binance.com';
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
        let queryString = new URLSearchParams(params).toString();
        if (signed) {
            const signature = this.sign(queryString);
            queryString += `&signature=${signature}`;
        }
        if (method === 'GET' || method === 'DELETE') {
            url += `?${queryString}`;
        }
        else {
            headers['Content-Type'] = 'application/x-www-form-urlencoded';
            body = queryString;
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
    // Complexity: O(1)
    async getTicker(symbol) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const data = await this.request('/api/v3/ticker/bookTicker', 'GET', { symbol });
        return {
            symbol: data.symbol,
            bid: parseFloat(data.bidPrice),
            ask: parseFloat(data.askPrice),
            last: parseFloat(data.bidPrice),
            volume24h: 0,
            timestamp: Date.now(),
        };
    }
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
    // Complexity: O(1)
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
            fee: 0,
            feeCurrency: '',
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
// EXCHANGE HUB - UNIFIED INTERFACE
// ═══════════════════════════════════════════════════════════════════════════
class ExchangeHub extends events_1.EventEmitter {
    binance;
    configuredExchanges = new Set();
    constructor() {
        super();
        this.binance = new BinanceConnector();
        console.log('[ExchangeHub] 🏦 Initialized');
    }
    // Complexity: O(1)
    async configureFromVault(exchangeId) {
        const credentials = LiveWalletManager_1.liveWalletManager.getCredentials(exchangeId);
        if (!credentials)
            return false;
        return this.configure(exchangeId, {
            apiKey: credentials.apiKey,
            apiSecret: credentials.apiSecret,
            passphrase: credentials.passphrase,
        });
    }
    // Complexity: O(1)
    configure(exchangeId, credentials) {
        if (exchangeId.toLowerCase() === 'binance') {
            this.binance.configure(credentials);
            this.configuredExchanges.add('binance');
            return true;
        }
        return false;
    }
    // Complexity: O(1)
    async getTicker(exchangeId, symbol) {
        if (exchangeId.toLowerCase() === 'binance')
            return this.binance.getTicker(symbol);
        throw new Error(`Unknown exchange: ${exchangeId}`);
    }
    // Complexity: O(1)
    async getBalances(exchangeId) {
        if (exchangeId.toLowerCase() === 'binance')
            return this.binance.getBalances();
        throw new Error(`Unknown exchange: ${exchangeId}`);
    }
    // Complexity: O(1)
    async createOrder(exchangeId, params) {
        if (exchangeId.toLowerCase() === 'binance')
            return this.binance.createOrder(params);
        throw new Error(`Unknown exchange: ${exchangeId}`);
    }
}
exports.ExchangeHub = ExchangeHub;
exports.default = ExchangeHub;
