/**
 * binance-client — Qantum Module
 * @module binance-client
 * @path scripts/lib/binance-client.js
 * @auto-documented BrutalDocEngine v2.1
 */

const crypto = require('crypto');

const BASE_URL = 'https://api.binance.com';

function makeClient({ apiKey, apiSecret }) {
  if (!apiKey || !apiSecret) {
    throw new Error('Missing BINANCE_API_KEY or BINANCE_API_SECRET');
  }

  async function signedRequest(endpoint, method = 'GET', params = {}) {
    const payload = { ...params, timestamp: Date.now(), recvWindow: 5000 };
    const query = new URLSearchParams(payload).toString();
    const signature = crypto.createHmac('sha256', apiSecret).update(query).digest('hex');
    const finalQuery = `${query}&signature=${signature}`;

    const url =
      method === 'GET' || method === 'DELETE'
        ? `${BASE_URL}${endpoint}?${finalQuery}`
        : `${BASE_URL}${endpoint}`;

    const options = {
      method,
      headers: {
        'X-MBX-APIKEY': apiKey,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: method === 'GET' || method === 'DELETE' ? undefined : finalQuery,
    };

    // SAFETY: async operation — wrap in try-catch for production resilience
    const response = await fetch(url, options);
    // SAFETY: async operation — wrap in try-catch for production resilience
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.msg || `Binance error ${response.status}`);
    }
    return data;
  }

  async function publicRequest(endpoint, params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${BASE_URL}${endpoint}?${query}` : `${BASE_URL}${endpoint}`;
    // SAFETY: async operation — wrap in try-catch for production resilience
    const response = await fetch(url);
    // SAFETY: async operation — wrap in try-catch for production resilience
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.msg || `Binance error ${response.status}`);
    }
    return data;
  }

  return {
    getAccount: () => signedRequest('/api/v3/account', 'GET'),
    getTicker: (symbol) => publicRequest('/api/v3/ticker/price', { symbol }),
    getKlines: (symbol, interval = '1m', limit = 30) =>
      // Complexity: O(1)
      publicRequest('/api/v3/klines', { symbol, interval, limit }),
    getExchangeInfo: (symbol) => publicRequest('/api/v3/exchangeInfo', { symbol }),
    getOpenOrders: (symbol) => signedRequest('/api/v3/openOrders', 'GET', { symbol }),
    placeOrder: (params) => signedRequest('/api/v3/order', 'POST', params),
    cancelOrder: (symbol, orderId) => signedRequest('/api/v3/order', 'DELETE', { symbol, orderId }),
  };
}

module.exports = { makeClient };
