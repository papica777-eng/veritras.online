"use strict";
/**
 * check-wallet — Qantum Module
 * @module check-wallet
 * @path src/departments/finance/check-wallet.ts
 * @auto-documented BrutalDocEngine v2.1
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Hybrid_check_wallet = void 0;
const HybridGodModeWrapper_1 = require("./HybridGodModeWrapper");
/**
 * @wrapper Hybrid_check_wallet
 * @description Auto-generated God-Mode Hybrid.
 * @origin "check-wallet.js"
 */
class Hybrid_check_wallet extends HybridGodModeWrapper_1.HybridGodModeWrapper {
    // Complexity: O(N)
    async execute() {
        try {
            console.log("/// [HYBRID_CORE] Executing Logics from Hybrid_check_wallet ///");
            // --- START LEGACY INJECTION ---
            //             #!/usr/bin/env node
            /**
             * ╔══════════════════════════════════════════════════════════════════════════════╗
             * ║  💰 QAntum PRIME - WALLET CHECKER                                            ║
             * ║  Check balances before going LIVE                                            ║
             * ╚══════════════════════════════════════════════════════════════════════════════╝
             */
            'use strict';
            require('dotenv').config();
            const { Web3 } = require('web3');
            // ERC20 ABI (minimal for balanceOf)
            const ERC20_ABI = [
                {
                    "constant": true,
                    "inputs": [{ "name": "_owner", "type": "address" }],
                    "name": "balanceOf",
                    "outputs": [{ "name": "balance", "type": "uint256" }],
                    "type": "function"
                },
                {
                    "constant": true,
                    "inputs": [],
                    "name": "decimals",
                    "outputs": [{ "name": "", "type": "uint8" }],
                    "type": "function"
                },
                {
                    "constant": true,
                    "inputs": [],
                    "name": "symbol",
                    "outputs": [{ "name": "", "type": "string" }],
                    "type": "function"
                }
            ];
            // Token addresses (BSC Mainnet)
            const TOKENS = {
                WBNB: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
                BUSD: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
                USDT: '0x55d398326f99059fF775485246999027B3197955'
            };
            async function checkWallet() {
                console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║  💰 QAntum PRIME - WALLET CHECKER                                            ║
║  Checking your BSC wallet before LIVE trading...                             ║
╚══════════════════════════════════════════════════════════════════════════════╝
`);
                // Check if private key exists
                if (!process.env.PRIVATE_KEY || process.env.PRIVATE_KEY === 'YOUR_PRIVATE_KEY_HERE') {
                    console.log('❌ ERROR: Private key not configured!');
                    console.log('');
                    console.log('   Please edit .env file and set:');
                    console.log('   PRIVATE_KEY=0xYOUR_ACTUAL_PRIVATE_KEY');
                    console.log('');
                    process.exit(1);
                }
                const RPC_URL = process.env.RPC_URL || 'https://bsc-dataseed.binance.org/';
                console.log(`🔗 Connecting to BSC...`);
                console.log(`   RPC: ${RPC_URL}`);
                console.log('');
                try {
                    const web3 = new Web3(RPC_URL);
                    // Get wallet address from private key
                    const account = web3.eth.accounts.privateKeyToAccount(process.env.PRIVATE_KEY);
                    const walletAddress = account.address;
                    console.log('╔══════════════════════════════════════════════════════════════╗');
                    console.log('║  📍 YOUR WALLET                                              ║');
                    console.log('╠══════════════════════════════════════════════════════════════╣');
                    console.log(`║  Address: ${walletAddress}  ║`);
                    console.log('╚══════════════════════════════════════════════════════════════╝');
                    console.log('');
                    // Get native BNB balance
                    const bnbBalanceWei = await web3.eth.getBalance(walletAddress);
                    const bnbBalance = web3.utils.fromWei(bnbBalanceWei, 'ether');
                    console.log('╔══════════════════════════════════════════════════════════════╗');
                    console.log('║  💎 TOKEN BALANCES                                           ║');
                    console.log('╠══════════════════════════════════════════════════════════════╣');
                    console.log(`║  🟡 BNB (Native):  ${parseFloat(bnbBalance).toFixed(6)} BNB`);
                    // Get WBNB balance
                    const wbnbContract = new web3.eth.Contract(ERC20_ABI, TOKENS.WBNB);
                    // SAFETY: async operation — wrap in try-catch for production resilience
                    const wbnbBalanceWei = await wbnbContract.methods.balanceOf(walletAddress).call();
                    const wbnbBalance = web3.utils.fromWei(wbnbBalanceWei, 'ether');
                    console.log(`║  🔶 WBNB:          ${parseFloat(wbnbBalance).toFixed(6)} WBNB`);
                    // Get BUSD balance
                    const busdContract = new web3.eth.Contract(ERC20_ABI, TOKENS.BUSD);
                    // SAFETY: async operation — wrap in try-catch for production resilience
                    const busdBalanceWei = await busdContract.methods.balanceOf(walletAddress).call();
                    const busdBalance = web3.utils.fromWei(busdBalanceWei, 'ether');
                    console.log(`║  🟢 BUSD:          ${parseFloat(busdBalance).toFixed(2)} BUSD`);
                    // Get USDT balance
                    const usdtContract = new web3.eth.Contract(ERC20_ABI, TOKENS.USDT);
                    // SAFETY: async operation — wrap in try-catch for production resilience
                    const usdtBalanceWei = await usdtContract.methods.balanceOf(walletAddress).call();
                    const usdtBalance = web3.utils.fromWei(usdtBalanceWei, 'ether');
                    console.log(`║  🟢 USDT:          ${parseFloat(usdtBalance).toFixed(2)} USDT`);
                    console.log('╚══════════════════════════════════════════════════════════════╝');
                    console.log('');
                    // Trading readiness check
                    const bnbNum = parseFloat(bnbBalance);
                    const wbnbNum = parseFloat(wbnbBalance);
                    console.log('╔══════════════════════════════════════════════════════════════╗');
                    console.log('║  🚦 TRADING READINESS                                        ║');
                    console.log('╠══════════════════════════════════════════════════════════════╣');
                    // Check gas fees (need ~0.005 BNB minimum)
                    if (bnbNum >= 0.005) {
                        console.log('║  ✅ Gas Fees:      Sufficient BNB for transactions');
                    }
                    else {
                        console.log('║  ❌ Gas Fees:      NEED MORE BNB! (min 0.005 BNB)');
                    }
                    // Check trading amount (0.1 WBNB needed)
                    if (wbnbNum >= 0.1) {
                        console.log('║  ✅ Trade Amount:  Sufficient WBNB for 0.1 BNB trade');
                    }
                    else if (bnbNum >= 0.1) {
                        console.log('║  ⚠️  Trade Amount:  You have BNB but need WBNB!');
                        console.log('║                   Wrap BNB → WBNB on PancakeSwap');
                    }
                    else {
                        console.log('║  ❌ Trade Amount:  NEED MORE BNB/WBNB! (min 0.1)');
                    }
                    console.log('╚══════════════════════════════════════════════════════════════╝');
                    console.log('');
                    // Final verdict
                    if (bnbNum >= 0.005 && wbnbNum >= 0.1) {
                        console.log('🟢 ════════════════════════════════════════════════════════════');
                        console.log('🟢  READY FOR LIVE TRADING!');
                        console.log('🟢  Run: node scripts/main.js --duration 60 --live');
                        console.log('🟢 ════════════════════════════════════════════════════════════');
                    }
                    else if (bnbNum >= 0.15) {
                        console.log('🟡 ════════════════════════════════════════════════════════════');
                        console.log('🟡  ALMOST READY!');
                        console.log('🟡  You need to wrap some BNB to WBNB first.');
                        console.log('🟡  Go to: https://pancakeswap.finance/swap');
                        console.log('🟡  Swap BNB → WBNB (at least 0.1 WBNB)');
                        console.log('🟡 ════════════════════════════════════════════════════════════');
                    }
                    else {
                        console.log('🔴 ════════════════════════════════════════════════════════════');
                        console.log('🔴  NOT READY FOR LIVE TRADING');
                        console.log('🔴  Please deposit at least 0.15 BNB to your wallet:');
                        console.log(`🔴  ${walletAddress}`);
                        console.log('🔴 ════════════════════════════════════════════════════════════');
                    }
                    console.log('');
                    console.log('🔍 View on BSCScan:');
                    console.log(`   https://bscscan.com/address/${walletAddress}`);
                    console.log('');
                }
                catch (error) {
                    console.error('❌ Error:', error.message);
                    if (error.message.includes('private key')) {
                        console.log('');
                        console.log('💡 TIP: Make sure your private key:');
                        console.log('   - Starts with 0x');
                        console.log('   - Is 66 characters long (0x + 64 hex chars)');
                        console.log('   - Contains only valid hex characters (0-9, a-f)');
                    }
                    process.exit(1);
                }
            }
            // Complexity: O(1)
            checkWallet();
            // --- END LEGACY INJECTION ---
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.recordAxiom({
                status: 'SUCCESS',
                origin: 'Hybrid_check_wallet',
                timestamp: Date.now()
            });
        }
        catch (error) {
            console.error("/// [HYBRID_FAULT] Critical Error in Hybrid_check_wallet ///", error);
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.recordAxiom({
                status: 'CRITICAL_FAILURE',
                error: String(error),
                origin: 'Hybrid_check_wallet'
            });
            throw error;
        }
    }
}
exports.Hybrid_check_wallet = Hybrid_check_wallet;
