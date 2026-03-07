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

import { spawn } from 'child_process';
import { join } from 'path';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES (mirror Rust structs exactly)
// ═══════════════════════════════════════════════════════════════════════════

export interface PricePair {
    symbol: string;
    exchange_a: string;
    exchange_b: string;
    price_a: number;
    price_b: number;
}

export interface ArbitrageResult {
    symbol: string;
    buy_exchange: string;
    sell_exchange: string;
    buy_price: string;
    sell_price: string;
    spread_percent: string;
    net_profit_usd: string;
    net_profit_percent: string;
    risk_score: string;
    is_viable: boolean;
    calculation_ns: number;
}

export interface TriangularPath {
    leg1_symbol: string;
    leg2_symbol: string;
    leg3_symbol: string;
    leg1_price: number;
    leg2_price: number;
    leg3_price: number;
}

export interface TriangularResult {
    path: string;
    expected_return: string;
    net_after_fees: string;
    is_profitable: boolean;
    calculation_ns: number;
}

export interface BatchInput {
    pairs: PricePair[];
    capital_usd: number;
    fee_percent: number;
    min_spread_percent: number;
    slippage_percent: number;
    network_fee_usd: number;
}

export interface BatchOutput {
    results: ArbitrageResult[];
    viable_count: number;
    total_pairs_scanned: number;
    total_calculation_ns: number;
    best_opportunity: ArbitrageResult | null;
}

// ═══════════════════════════════════════════════════════════════════════════
// RUST BRIDGE
// ═══════════════════════════════════════════════════════════════════════════

export class RustArbBridge {
    private binaryPath: string;
    private isAvailable: boolean = false;
    private callCount: number = 0;
    private totalLatencyMs: number = 0;
    private lastError: string | null = null;

    /**
     * Complexity: O(1)
     * @param binaryPath Path to compiled Rust binary.
     *   - On S24 (Termux): /data/data/com.termux/files/home/qantum-arb-hotpath/target/release/qantum-arb-hotpath
     *   - On Desktop: ./arb_hotpath/target/release/qantum-arb-hotpath
     */
    constructor(binaryPath?: string) {
        // Auto-detect: Termux vs Desktop
        const isTermux = typeof process !== 'undefined' && process.env.PREFIX?.includes('com.termux');

        if (binaryPath) {
            this.binaryPath = binaryPath;
        } else if (isTermux) {
            this.binaryPath = '/data/data/com.termux/files/home/qantum-arb-hotpath/target/release/qantum-arb-hotpath';
        } else {
            this.binaryPath = join(__dirname, 'arb_hotpath', 'target', 'release', 'qantum-arb-hotpath');
        }
    }

    /**
     * Check if the Rust binary exists and is executable
     * Complexity: O(1)
     */
    // Complexity: O(1) — hash/map lookup
    public async probe(): Promise<boolean> {
        try {
            const { existsSync } = await import('fs');
            this.isAvailable = existsSync(this.binaryPath);
            if (this.isAvailable) {
                console.log(`[RustBridge] Binary found: ${this.binaryPath}`);
            } else {
                console.log(`[RustBridge] Binary NOT found at: ${this.binaryPath}`);
                console.log(`[RustBridge] Falling back to TypeScript calculation`);
            }
            return this.isAvailable;
        } catch {
            this.isAvailable = false;
            return false;
        }
    }

    /**
     * Execute a command against the Rust binary via stdin/stdout JSON pipe
     * Complexity: O(n) serialization + O(Rust calculation)
     */
    private async execute<T>(type: string, data: unknown): Promise<T> {
        const startMs = performance.now();

        return new Promise<T>((resolve, reject) => {
            const child = spawn(this.binaryPath, [], {
                stdio: ['pipe', 'pipe', 'pipe'],
            });

            const command = JSON.stringify({ type, data });
            let stdout = '';
            let stderr = '';

            child.stdout.on('data', (chunk: Buffer) => {
                stdout += chunk.toString();
            });

            child.stderr.on('data', (chunk: Buffer) => {
                stderr += chunk.toString();
            });

            child.on('close', (code: number | null) => {
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
                    const result = JSON.parse(stdout) as T;
                    // Complexity: O(1)
                    resolve(result);
                } catch (e) {
                    this.lastError = `JSON parse error: ${stdout}`;
                    // Complexity: O(1) — hash/map lookup
                    reject(new Error(`[RustBridge] Invalid JSON output: ${stdout}`));
                }
            });

            child.on('error', (err: Error) => {
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
    public async batchCalculate(input: BatchInput): Promise<BatchOutput> {
        if (!this.isAvailable) {
            return this.fallbackBatchCalculate(input);
        }

        try {
            return await this.execute<BatchOutput>('batch_arb', input);
        } catch (e) {
            console.warn(`[RustBridge] Rust call failed, falling back to TS: ${(e as Error).message}`);
            return this.fallbackBatchCalculate(input);
        }
    }

    /**
     * Calculate triangular arbitrage via Rust engine
     * Complexity: O(1)
     */
    // Complexity: O(1) — hash/map lookup
    public async calculateTriangular(path: TriangularPath): Promise<TriangularResult> {
        if (!this.isAvailable) {
            return this.fallbackTriangular(path);
        }

        try {
            return await this.execute<TriangularResult>('triangular', path);
        } catch (e) {
            console.warn(`[RustBridge] Triangular failed, falling back to TS: ${(e as Error).message}`);
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
    private fallbackBatchCalculate(input: BatchInput): BatchOutput {
        const start = performance.now();
        const results: ArbitrageResult[] = [];
        let best: ArbitrageResult | null = null;
        let viableCount = 0;

        for (const pair of input.pairs) {
            const [buyPrice, sellPrice, buyEx, sellEx] =
                pair.price_a < pair.price_b
                    ? [pair.price_a, pair.price_b, pair.exchange_a, pair.exchange_b]
                    : [pair.price_b, pair.price_a, pair.exchange_b, pair.exchange_a];

            if (buyPrice === 0 || sellPrice === 0) continue;

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

            const result: ArbitrageResult = {
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
    private fallbackTriangular(path: TriangularPath): TriangularResult {
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
    public getDiagnostics(): {
        binaryPath: string;
        isAvailable: boolean;
        totalCalls: number;
        avgLatencyMs: number;
        lastError: string | null;
        mode: 'RUST_NATIVE' | 'TS_FALLBACK';
    } {
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

// ═══════════════════════════════════════════════════════════════════════════
// SINGLETON
// ═══════════════════════════════════════════════════════════════════════════

export const rustBridge = new RustArbBridge();

export default RustArbBridge;
