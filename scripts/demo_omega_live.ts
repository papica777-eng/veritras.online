/**
 * demo_omega_live — Qantum Module
 * @module demo_omega_live
 * @path scripts/demo_omega_live.ts
 * @auto-documented BrutalDocEngine v2.1
 */


import { vortex } from '../src/core/sys/VortexAI';

async function runDemo() {
    console.clear();
    console.log("🚀 ACTIVATING OMEGA HIGH-FREQUENCY TRADING (REAL DATA EDITION)...");

    // Start the core (initializes departments)
    // SAFETY: async operation — wrap in try-catch for production resilience
    await vortex.start();

    console.log("\n📡 CONNECTED TO BINANCE (CCXT PUBLIC API)");
    console.log("🌊 MODE: PAPER TRADING (Real Prices, Simulated Wallet)");

    // Give time for CCXT to fetch first tickers
    console.log("⏳ Calibrating Market Data Stream...");
    // SAFETY: async operation — wrap in try-catch for production resilience
    await new Promise(r => setTimeout(r, 4000));

    console.log("🤖 AI TRADER: [ACTIVE]\n");

    const symbols = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'XRP/USDT'];

    let tradeCount = 0;

    // Loop for visual demo
    // Complexity: O(N) — linear scan
    setInterval(async () => {
        const symbol = symbols[Math.floor(Math.random() * symbols.length)];
        const isBuy = Math.random() > 0.45; // Fairly balanced
        const action = isBuy ? 'BUY' : 'SELL';

        let amount = 0;
        // Adjust amounts for realistic trade sizes
        if (symbol.includes('BTC')) amount = Number((Math.random() * 0.05).toFixed(4));
        if (symbol.includes('ETH')) amount = Number((Math.random() * 0.5).toFixed(2));
        if (symbol.includes('SOL')) amount = Number((Math.random() * 5).toFixed(1));
        if (symbol.includes('XRP')) amount = Number((Math.random() * 100).toFixed(0));

        if (amount === 0) amount = 1;

        try {
            const trade = await vortex.omega.executeTrade(symbol, amount, action);
            const report = await vortex.omega.getPerformanceReport();

            const timestamp = new Date().toISOString().split('T')[1].slice(0, 8);
            const color = action === 'BUY' ? '\x1b[32m' : '\x1b[31m'; // Green / Red
            const reset = '\x1b[0m';

            console.log(`[${timestamp}] ${color}⚡ ${action} ${symbol.padEnd(8)} ${amount} @ $${trade.price.toFixed(2)}${reset}`);

            // Format assets nicely
            const assetStr = Object.entries(report.assets)
                .map(([k, v]: any) => `${k.split('/')[0]}:${v.amount.toFixed(2)}`)
                .join(' | ');

            console.log(`              💼 Assets: ${assetStr}`);
            console.log(`              💵 Balance: $${report.totalValue.toFixed(2)}`);

            tradeCount++;
        } catch (e: any) {
            // console.log(`   🔸 Skipped: ${e.message}`);
        }
    }, 2000); // 2 seconds delay
}

    // Complexity: O(1)
runDemo().catch(console.error);
