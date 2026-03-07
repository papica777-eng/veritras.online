/**
 * BinanceAdapterPro.d — Qantum Module
 * @module BinanceAdapterPro.d
 * @path src/departments/reality/binance/Exchanges/BinanceAdapterPro.d.ts
 * @auto-documented BrutalDocEngine v2.1
 */

import type { IExchangeAdapter, TickerData } from '../core/interfaces.ts';
/**
 * 🏛️ BINANCE ADAPTER PRO
 * Isolated file for Worker Threads to avoid circular dependency or export ambiguity.
 */
export default class BinanceAdapter implements IExchangeAdapter {
    name: string;
    private http;
    constructor();
    // Complexity: O(1)
    connect(): Promise<void>;
    // Complexity: O(1)
    getTicker(symbol: string): Promise<TickerData>;
    // Complexity: O(1)
    executeOrder(symbol: string, side: 'BUY' | 'SELL', amount: number): Promise<string>;
    // Complexity: O(1)
    getWalletBalance(asset: string): Promise<number>;
}
//# sourceMappingURL=BinanceAdapterPro.d.ts.map