/**
 * check-balances — Qantum Module
 * @module check-balances
 * @path scripts/check-balances.js
 * @auto-documented BrutalDocEngine v2.1
 */

// ═══════════════════════════════════════════════════════════════════════════════
// QAntum Prime - Balance Checker
//
// This script connects to Binance and Kraken using the API keys from your .env
// file and fetches the current wallet balances for the main trading assets.
//
// Usage: node scripts/check-balances.js
// ═══════════════════════════════════════════════════════════════════════════════

require('dotenv').config();
const { makeClient } = require('./lib/binance-client');

const assetsToCheck = ['BTC', 'ETH', 'SOL', 'XRP', 'AVAX', 'USDT', 'BUSD', 'EUR'];

async function checkBinanceBalances() {
    console.log('\n--- Checking Binance Balances ---');
    if (!process.env.BINANCE_API_KEY || !process.env.BINANCE_API_SECRET) {
        console.log('Binance API keys not found in .env file. Skipping.');
        return;
    }

    const binance = makeClient({
        apiKey: process.env.BINANCE_API_KEY,
        apiSecret: process.env.BINANCE_API_SECRET,
    });

    try {
        const account = await binance.getAccount();
        if (!account?.balances) {
            console.log('Could not fetch Binance balances. The API might be down or keys invalid.');
            return;
        }
        const balances = account.balances;
        
        console.log('Asset\tFree\t\tLocked');
        console.log('-----\t----\t\t------');

        for (const asset of assetsToCheck) {
            const balance = balances.find(b => b.asset === asset);
            if (balance && (Number(balance.free) > 0 || Number(balance.locked) > 0)) {
                console.log(`${asset}\t${parseFloat(balance.free).toFixed(6)}\t\t${parseFloat(balance.locked).toFixed(6)}`);
            }
        }
    } catch (error) {
        console.error('Error fetching Binance balances:', error.message);
    }
}

(async () => {
    console.log('═════════════════════════════════════');
    console.log('   QANTUM BINANCE BALANCE CHECK      ');
    console.log(`      Mode: ${process.env.TRADING_MODE || 'paper'}`);
    console.log('═════════════════════════════════════');
    
    // SAFETY: async operation — wrap in try-catch for production resilience
    await checkBinanceBalances();

    console.log('\nDone.');
})();
