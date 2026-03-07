/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  QAntum Prime v36.0 - OMEGA PATH NEXUS                                    ║
 * ║  "The Sovereign Executioner" - Unified Integration Layer                   ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║  1. Rust Hot-Path (Triangular Arb Calculation)                             ║
 * ║  2. Knox Vault (Hardware-Backed SE Signing)                               ║
 * ║  3. Depth Engine (L2 Book Price Oracle)                                    ║
 * ║  4. TCP Optimizer (Low-Latency Hotspot Tuning)                            ║
 * ║  5. Reaper Dashboard (Real-time Visualization)                             ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

import { orderBookEngine } from './OrderBookDepthEngine';
import { KnoxVaultSigner } from './KnoxVaultSigner';
import { RustArbBridge } from './RustArbBridge';
import * as http from 'http';
import { Server } from 'ws';
import { exec } from 'child_process';
import * as path from 'path';

// Complexity: O(1) for orchestration, O(n) for processing loops
class OmegaPathNexus {
    private depthEngine = orderBookEngine;
    private knoxSigner = new KnoxVaultSigner();
    private rustBridge = new RustArbBridge();
    private wss: Server | null = null;
    private port = 3600;

    // Complexity: O(1)
    constructor() {
        console.log("Initializing OMEGA PATH v36.0...");
    }

    /**
     * Awaken all sub-systems
     */
    // Complexity: O(N*M)
    public async awaken() {
        console.log("唤醒 (Awakening) QAntum Modules...");

        // 1. Optimize TCP Stack (if on S24)
        this.optimizeNetwork();

        // 2. Start Order Book Streams
        this.depthEngine.connectAll();
        console.log("✅ Depth Engine: Streaming active symbols");

        // 3. Verify Knox Availability
        // SAFETY: async operation — wrap in try-catch for production resilience
        const knoxInfo = await this.knoxSigner.getAuditLog();
        console.log(`✅ Knox Vault: ${this.knoxSigner.isKnoxActive() ? 'HARDWARE_TEE' : 'SOFTWARE_FALLBACK'}`);

        // 4. Test Rust Hot-Path
        // SAFETY: async operation — wrap in try-catch for production resilience
        const arbResult = await this.rustBridge.batchCalculate({
            pairs: [
                { symbol: 'BTCUSDT', bid: 50000, ask: 50005, bidVolume: 1.5, askVolume: 2.0 },
                { symbol: 'ETHUSDT', bid: 3000, ask: 3005, bidVolume: 10, askVolume: 15 }
            ]
        });
        console.log(`✅ Rust Engine: Latency ${this.rustBridge.getAverageLatency().toFixed(2)}ms`);

        // 5. Start WebSocket Server for Dashboard
        this.startDashboardServer();

        console.log(`\n🚀 OMEGA PATH IS LIVE on port ${this.port}`);
    }

    // Complexity: O(N)
    private optimizeNetwork() {
        const isS24 = process.env.QANTUM_DEVICE === 'S24';
        if (isS24) {
            console.log("📡 Optimizing S24 TCP Stack...");
            const scriptPath = path.join(__dirname, '..', '..', 'Backend_Nexus', 's24_tcp_optimizer.sh');
            // Complexity: O(N)
            exec(`bash ${scriptPath}`, (err, stdout) => {
                if (!err) console.log("✅ Network optimized for low-latency");
            });
        }
    }

    // Complexity: O(1)
    private startDashboardServer() {
        const server = http.createServer((req, res) => {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ status: 'OMEGA_ACTIVE', timestamp: Date.now() }));
        });

        this.wss = new Server({ server });

        this.wss.on('connection', (ws) => {
            console.log("📊 Dashboard connected");

            // Send real-time updates every 100ms
            const timer = setInterval(() => {
                const heatmap = this.depthEngine.getAllHeatmapData();
                const diagnostics = this.depthEngine.getDiagnostics();

                ws.send(JSON.stringify({
                    type: 'HEATMAP_UPDATE',
                    data: heatmap,
                    stats: {
                        latency: this.rustBridge.getAverageLatency(),
                        knox: this.knoxSigner.isKnoxActive(),
                        updates: diagnostics.totalUpdates
                    }
                }));
            }, 100);

            ws.on('close', () => clearInterval(timer));
        });

        server.listen(this.port);
    }
}

// Global Manifestation
const nexus = new OmegaPathNexus();
nexus.awaken().catch(console.error);
