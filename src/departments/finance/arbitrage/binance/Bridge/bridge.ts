/**
 * bridge — Qantum Module
 * @module bridge
 * @path src/departments/finance/arbitrage/binance/Bridge/bridge.ts
 * @auto-documented BrutalDocEngine v2.1
 */

import { createRequire } from 'module';
import path from 'path';
import fs from 'fs';

const require = createRequire(import.meta.url);

let physics: any = null;

// Attempt to load the Rust binary
const potentialPaths = [
    '../../../rust_core/index.node',
    '../../rust_core/index.node',
    './rust_core/index.node',
    '../../../index.node'
];

for (const p of potentialPaths) {
    try {
        const fullPath = path.resolve(process.cwd(), p);

        if (fs.existsSync(fullPath)) {
            physics = require(fullPath);
            console.log(`[BRIDGE] ✅ Rust Core Loaded from ${p}`);
            break;
        }
    } catch (e) {
        // Continue
    }
}

if (!physics) {
    console.warn('[BRIDGE] ⚠️ Rust Core binary not found. Using MOCK mode.');
    physics = {
        init_physics_engine: () => "MOCK_ENGINE_INIT",
        check_gpu_status: () => "⚠️ MOCK_GPU_MODE",
        calculate_obi_batch: async () => [],
        calculate_manifold_curvature: () => Math.random() * 0.1, // Mock small curvature
        scan_mempool: () => [
            { hash: '0xMockWhale', value_eth: 50000, to_exchange: true } // Mock detection
        ],
        analyze_competitor_behavior: () => "MOCK_ANALYSIS: DEPLOY_BAIT",
        evaluate_market_entropy: () => "NEUTRAL"
    };
}

export const Physics = physics;
