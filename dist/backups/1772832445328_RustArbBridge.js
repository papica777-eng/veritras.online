"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  QAntum Prime v36.0 - RUST BRIDGE                                        ║
 * ║  "The NEON Link" - Node.js ↔ Rust IPC Bridge                             ║
 * ║                                                                           ║
 * ║  Calls the compiled Rust hot-path binary via child_process/stdin           ║
 * ║  JSON serialization over pipe — zero network overhead                     ║
 * ║                                                                           ║
 * ║  INTEGRATION POINTS:                                                      ║
 * ║  - BinanceAdapterPro.ts (S24: SamsunS24/binance/)                         ║
 * ║  - ArbitrageLogic.ts (Blockchain/Arbitrage/)                              ║
 * ║  - OrderBookDepthEngine.ts (Blockchain/Exchanges/)                        ║
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
exports.rustBridge = exports.RustArbBridge = void 0;
const child_process_1 = require("child_process");
const path_1 = require("path");
// ═══════════════════════════════════════════════════════════════════════════
// RUST BRIDGE
// ═══════════════════════════════════════════════════════════════════════════
class RustArbBridge {
    binaryPath;
    isAvailable = false;
    callCount = 0;
    totalLatencyMs = 0;
    lastError = null;
    /**
     * Complexity: O(1)
     * @param binaryPath Path to compiled Rust binary.
     *   - On S24 (Termux): /data/data/com.termux/files/home/qantum-arb-hotpath/target/release/qantum-arb-hotpath
     *   - On Desktop: ./arb_hotpath/target/release/qantum-arb-hotpath
     */
    constructor(binaryPath) {
        // Auto-detect: Termux vs Desktop
        const isTermux = typeof process !== 'undefined' && process.env.PREFIX?.includes('com.termux');
        if (binaryPath) {
            this.binaryPath = binaryPath;
        }
        else if (isTermux) {
            this.binaryPath = '/data/data/com.termux/files/home/qantum-arb-hotpath/target/release/qantum-arb-hotpath';
        }
        else {
            this.binaryPath = (0, path_1.join)(__dirname, 'arb_hotpath', 'target', 'release', 'qantum-arb-hotpath');
        }
    }
    /**
     * Check if the Rust binary exists and is executable
     * Complexity: O(1)
     */
    // Complexity: O(1) — hash/map lookup
    async probe() {
        try {
            const { existsSync } = await Promise.resolve().then(() => __importStar(require('fs')));
            this.isAvailable = existsSync(this.binaryPath);
            if (this.isAvailable) {
                console.log(`[RustBridge] Binary found: ${this.binaryPath}`);
            }
            else {
                console.log(`[RustBridge] Binary NOT found at: ${this.binaryPath}`);
                console.log(`[RustBridge] Falling back to TypeScript calculation`);
            }
            return this.isAvailable;
        }
        catch {
            this.isAvailable = false;
            return false;
        }
    }
    /**
     * Execute a command against the Rust binary via stdin/stdout JSON pipe
     * Complexity: O(n) serialization + O(Rust calculation)
     */
    async execute(type, data) {
        const startMs = performance.now();
        return new Promise((resolve, reject) => {
            const child = (0, child_process_1.spawn)(this.binaryPath, [], {
                stdio: ['pipe', 'pipe', 'pipe'],
            });
            const command = JSON.stringify({ type, data });
            let stdout = '';
            let stderr = '';
            child.stdout.on('data', (chunk) => {
                stdout += chunk.toString();
            });
            child.stderr.on('data', (chunk) => {
                stderr += chunk.toString();
            });
            child.on('close', (code) => {
                const elapsedMs = performance.now() - startMs;
                this.callCount++;
                this.totalLatencyMs += elapsedMs;
                if (code !== 0) {
                    this.lastError = stderr || `Exit code: ${code}`;
                    // Complexity: O(1) — hash/map lookup
                    reject(new Error(`[RustBridge] Process exited with code ${code}: ${stderr}`));
                    return;
                }
                try {
                    const result = JSON.parse(stdout);
                    // Complexity: O(1)
                    resolve(result);
                }
                catch (e) {
                    this.lastError = `JSON parse error: ${stdout}`;
                    // Complexity: O(1) — hash/map lookup
                    reject(new Error(`[RustBridge] Invalid JSON output: ${stdout}`));
                }
            });
            child.on('error', (err) => {
                this.lastError = err.message;
                // Complexity: O(1) — hash/map lookup
                reject(new Error(`[RustBridge] Spawn error: ${err.message}`));
            });
            // Send input and close stdin
            child.stdin.write(command);
            child.stdin.end();
        });
    }
    // ═══════════════════════════════════════════════════════════════════════
    // PUBLIC API
    // ═══════════════════════════════════════════════════════════════════════
    /**
     * Batch-calculate arbitrage opportunities using Rust engine
     * Falls back to TypeScript if Rust binary not available
     * Complexity: O(n) pairs
     */
    // Complexity: O(1) — hash/map lookup
    async batchCalculate(input) {
        if (!this.isAvailable) {
            return this.fallbackBatchCalculate(input);
        }
        try {
            return await this.execute('batch_arb', input);
        }
        catch (e) {
            console.warn(`[RustBridge] Rust call failed, falling back to TS: ${e.message}`);
            return this.fallbackBatchCalculate(input);
        }
    }
    /**
     * Calculate triangular arbitrage via Rust engine
     * Complexity: O(1)
     */
    // Complexity: O(1) — hash/map lookup
    async calculateTriangular(path) {
        if (!this.isAvailable) {
            return this.fallbackTriangular(path);
        }
        try {
            return await this.execute('triangular', path);
        }
        catch (e) {
            console.warn(`[RustBridge] Triangular failed, falling back to TS: ${e.message}`);
            return this.fallbackTriangular(path);
        }
    }
    // ═══════════════════════════════════════════════════════════════════════
    // TYPESCRIPT FALLBACKS (when Rust binary not compiled yet)
    // ═══════════════════════════════════════════════════════════════════════
    /**
     * TypeScript fallback for batch calculation
     * Uses standard JS floats (NOT deterministic like Rust Decimal)
     * Complexity: O(n)
     */
    // Complexity: O(N) — linear iteration
    fallbackBatchCalculate(input) {
        const start = performance.now();
        const results = [];
        let best = null;
        let viableCount = 0;
        for (const pair of input.pairs) {
            const [buyPrice, sellPrice, buyEx, sellEx] = pair.price_a < pair.price_b
                ? [pair.price_a, pair.price_b, pair.exchange_a, pair.exchange_b]
                : [pair.price_b, pair.price_a, pair.exchange_b, pair.exchange_a];
            if (buyPrice === 0 || sellPrice === 0)
                continue;
            const spread = ((sellPrice - buyPrice) / buyPrice) * 100;
            const qty = input.capital_usd / buyPrice;
            const buyFee = input.capital_usd * (input.fee_percent / 100);
            const sellRevenue = qty * sellPrice;
            const sellFee = sellRevenue * (input.fee_percent / 100);
            const slippage = input.capital_usd * (input.slippage_percent / 100);
            const totalCosts = buyFee + sellFee + slippage + input.network_fee_usd;
            const grossProfit = sellRevenue - input.capital_usd;
            const netProfit = grossProfit - totalCosts;
            const netProfitPct = (netProfit / input.capital_usd) * 100;
            const costRatio = grossProfit !== 0 ? Math.min(totalCosts / Math.abs(grossProfit), 1) : 1;
            const isViable = netProfit > 0 && costRatio < 0.8;
            const result = {
                symbol: pair.symbol,
                buy_exchange: buyEx,
                sell_exchange: sellEx,
                buy_price: buyPrice.toFixed(8),
                sell_price: sellPrice.toFixed(8),
                spread_percent: spread.toFixed(4),
                net_profit_usd: netProfit.toFixed(2),
                net_profit_percent: netProfitPct.toFixed(4),
                risk_score: costRatio.toFixed(4),
                is_viable: isViable,
                calculation_ns: 0,
            };
            if (isViable) {
                viableCount++;
                if (!best || netProfit > parseFloat(best.net_profit_usd)) {
                    best = result;
                }
            }
            results.push(result);
        }
        return {
            results,
            viable_count: viableCount,
            total_pairs_scanned: input.pairs.length,
            total_calculation_ns: (performance.now() - start) * 1_000_000,
            best_opportunity: best,
        };
    }
    /**
     * TypeScript fallback for triangular
     * Complexity: O(1)
     */
    // Complexity: O(1)
    fallbackTriangular(path) {
        const start = performance.now();
        const feeMult = 1 - 0.001; // 0.1% default fee
        const afterLeg1 = (1 / path.leg1_price) * feeMult;
        const afterLeg2 = (afterLeg1 * path.leg2_price) * feeMult;
        const afterLeg3 = (afterLeg2 / path.leg3_price) * feeMult;
        const netReturn = afterLeg3;
        const netAfterFees = netReturn - 1;
        return {
            path: `${path.leg1_symbol} → ${path.leg2_symbol} → ${path.leg3_symbol}`,
            expected_return: netReturn.toFixed(8),
            net_after_fees: netAfterFees.toFixed(8),
            is_profitable: netAfterFees > 0,
            calculation_ns: (performance.now() - start) * 1_000_000,
        };
    }
    // ═══════════════════════════════════════════════════════════════════════
    // DIAGNOSTICS
    // ═══════════════════════════════════════════════════════════════════════
    // Complexity: O(1)
    getDiagnostics() {
        return {
            binaryPath: this.binaryPath,
            isAvailable: this.isAvailable,
            totalCalls: this.callCount,
            avgLatencyMs: this.callCount > 0 ? this.totalLatencyMs / this.callCount : 0,
            lastError: this.lastError,
            mode: this.isAvailable ? 'RUST_NATIVE' : 'TS_FALLBACK',
        };
    }
}
exports.RustArbBridge = RustArbBridge;
// ═══════════════════════════════════════════════════════════════════════════
// SINGLETON
// ═══════════════════════════════════════════════════════════════════════════
exports.rustBridge = new RustArbBridge();
exports.default = RustArbBridge;
