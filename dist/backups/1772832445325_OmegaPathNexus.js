"use strict";
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
const OrderBookDepthEngine_1 = require("./OrderBookDepthEngine");
const KnoxVaultSigner_1 = require("./KnoxVaultSigner");
const RustArbBridge_1 = require("./RustArbBridge");
const http = __importStar(require("http"));
const ws_1 = require("ws");
const child_process_1 = require("child_process");
const path = __importStar(require("path"));
// Complexity: O(1) for orchestration, O(n) for processing loops
class OmegaPathNexus {
    depthEngine = OrderBookDepthEngine_1.orderBookEngine;
    knoxSigner = new KnoxVaultSigner_1.KnoxVaultSigner();
    rustBridge = new RustArbBridge_1.RustArbBridge();
    wss = null;
    port = 3600;
    // Complexity: O(1)
    constructor() {
        console.log("Initializing OMEGA PATH v36.0...");
    }
    /**
     * Awaken all sub-systems
     */
    // Complexity: O(N*M)
    async awaken() {
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
    optimizeNetwork() {
        const isS24 = process.env.QANTUM_DEVICE === 'S24';
        if (isS24) {
            console.log("📡 Optimizing S24 TCP Stack...");
            const scriptPath = path.join(__dirname, '..', '..', 'Backend_Nexus', 's24_tcp_optimizer.sh');
            // Complexity: O(N)
            (0, child_process_1.exec)(`bash ${scriptPath}`, (err, stdout) => {
                if (!err)
                    console.log("✅ Network optimized for low-latency");
            });
        }
    }
    // Complexity: O(1)
    startDashboardServer() {
        const server = http.createServer((req, res) => {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ status: 'OMEGA_ACTIVE', timestamp: Date.now() }));
        });
        this.wss = new ws_1.Server({ server });
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
