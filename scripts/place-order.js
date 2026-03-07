/**
 * place-order — Qantum Module
 * @module place-order
 * @path scripts/place-order.js
 * @auto-documented BrutalDocEngine v2.1
 */

// ═══════════════════════════════════════════════════════════════════════════════
// QAntum Prime - Live Order Executor
//
// This script places a live order on the specified exchange. It's a utility
// for testing the order placement functionality of the ExchangeConnectors.
//
// WARNING: This will execute a REAL trade if TRADING_MODE is 'live'.
//
// Usage: node scripts/place-order.js <exchange> <symbol> <side> <amount> [price]
// Example (LMT): node scripts/place-order.js binance BTC/USDT buy 0.001 50000
// Example (MKT): node scripts/place-order.js kraken ETH/USD sell 0.01
// ═══════════════════════════════════════════════════════════════════════════════

require('dotenv').config();
const { makeClient } = require('./lib/binance-client');

const args = process.argv.slice(2);
if (args.length < 3) {
    console.error('Usage: node scripts/place-order.js <symbol> <side> <quantity> [price]');
    console.error('Example (LMT): node scripts/place-order.js BTCUSDT buy 0.0002 65000');
    console.error('Example (MKT): node scripts/place-order.js BTCUSDT sell 0.0002');
    process.exit(1);
}

const [symbol, side, quantity, price] = args;
const isLive = process.env.TRADING_MODE === 'live';

if (!process.env.BINANCE_API_KEY || !process.env.BINANCE_API_SECRET) {
    console.error('Binance API keys not found in .env file.');
    process.exit(1);
}

if (isLive && process.env.LIVE_TRADING_CONFIRM !== 'YES') {
    console.error('LIVE mode blocked. Set LIVE_TRADING_CONFIRM="YES" in .env to unlock real orders.');
    process.exit(1);
}

const connector = makeClient({
    apiKey: process.env.BINANCE_API_KEY,
    apiSecret: process.env.BINANCE_API_SECRET,
});

const order = {
    symbol,
    side: side.toLowerCase(),
    quantity: Number(quantity),
    type: price ? 'limit' : 'market',
    price: price ? Number(price) : undefined,
};

(async () => {
    console.log('═════════════════════════════════════');
    console.log('     QANTUM BINANCE ORDER SENDER     ');
    console.log(`       Mode: ${isLive ? '!!! LIVE !!!' : 'PAPER'}`);
    console.log('═════════════════════════════════════');
    console.log('Placing order:');
    console.log(JSON.stringify(order, null, 2));
    console.log('\nSending to exchange...');

    try {
        const params = {
            symbol: order.symbol,
            side: order.side.toUpperCase(),
            type: order.type.toUpperCase(),
            quantity: String(order.quantity),
        };
        if (order.type === 'limit') {
            params.price = String(order.price);
            params.timeInForce = 'GTC';
        }

        if (!isLive) {
            console.log('PAPER mode: order not sent. This is the payload that would be sent:');
            console.log(JSON.stringify(params, null, 2));
            return;
        }

        // SAFETY: async operation — wrap in try-catch for production resilience
        const result = await connector.placeOrder(params);
        console.log('\n✅ Exchange Response:');
        console.log(JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('\n❌ Order Failed:');
        console.error(error.message);
        if (error.response && error.response.data) {
            console.error('Full error data:', error.response.data);
        }
    }
})();
