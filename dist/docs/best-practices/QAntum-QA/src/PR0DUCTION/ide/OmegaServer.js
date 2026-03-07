"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * OMEGA SERVER - The IDE Bridge
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * "Мостът между VS Code и Суверенния Мозък на QAntum.
 *  HTTP + WebSocket за real-time комуникация."
 *
 * Features:
 * 1. REST API за команди (/ask, /heal, /audit, /swap, /synthesize)
 * 2. WebSocket за real-time status updates
 * 3. Biometric sync endpoint (/sync)
 * 4. Ghost Text endpoint за Neural Overlay (/ghost)
 *
 * @author Димитър Продромов / Mister Mind
 * @copyright 2026 QAntum Empire. All Rights Reserved.
 * @version 30.4.0 - THE SOVEREIGN SIDEBAR
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
exports.omegaServer = exports.OmegaServer = void 0;
const http = __importStar(require("http"));
const ws_1 = require("ws");
const OmegaNexus_1 = require("../omega/OmegaNexus");
const AIAgentExpert_1 = require("../intelligence/AIAgentExpert");
const FailoverAgent_1 = require("../intelligence/FailoverAgent");
const HardwareBridge_1 = require("../omega/HardwareBridge");
const SovereignGuard_1 = require("../fortress/SovereignGuard");
const OmegaCycle_1 = require("../omega/OmegaCycle");
// ═══════════════════════════════════════════════════════════════════════════════
// OMEGA SERVER
// ═══════════════════════════════════════════════════════════════════════════════
class OmegaServer {
    static instance;
    server = null;
    wss = null;
    clients = new Set();
    config;
    isRunning = false;
    // Singletons
    nexus = OmegaNexus_1.OmegaNexus.getInstance();
    expert = AIAgentExpert_1.AIAgentExpert.getInstance();
    failover = FailoverAgent_1.FailoverAgent.getInstance();
    guard = SovereignGuard_1.SovereignGuard.getInstance();
    cycle = OmegaCycle_1.OmegaCycle.getInstance();
    constructor(config) {
        this.config = {
            port: config?.port || 3848,
            enableWebSocket: config?.enableWebSocket ?? true,
            corsOrigin: config?.corsOrigin || '*',
        };
    }
    static getInstance(config) {
        if (!OmegaServer.instance) {
            OmegaServer.instance = new OmegaServer(config);
        }
        return OmegaServer.instance;
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // SERVER LIFECYCLE
    // ═══════════════════════════════════════════════════════════════════════════
    async start() {
        if (this.isRunning) {
            console.log('⚠️ [IDE-BRIDGE] Server already running.');
            return;
        }
        return new Promise((resolve, reject) => {
            this.server = http.createServer((req, res) => this.handleRequest(req, res));
            // WebSocket server
            if (this.config.enableWebSocket) {
                this.wss = new ws_1.WebSocketServer({ server: this.server });
                this.setupWebSocket();
            }
            this.server.listen(this.config.port, () => {
                this.isRunning = true;
                console.log(`
╔═══════════════════════════════════════════════════════════════════════════════╗
║                    📡 OMEGA IDE BRIDGE ACTIVATED 📡                            ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║                                                                               ║
║  REST API:    http://localhost:${this.config.port}                                      ║
║  WebSocket:   ws://localhost:${this.config.port}                                        ║
║                                                                               ║
║  Endpoints:                                                                   ║
║    POST /ask       - Ask AIAgentExpert                                        ║
║    POST /heal      - Omega Heal (fix current file)                            ║
║    POST /audit     - Ghost Protocol security audit                            ║
║    POST /swap      - Failover to local agent                                  ║
║    POST /synthesize - Binary synthesis from intent                            ║
║    POST /sync      - Biometric focus sync                                     ║
║    POST /ghost     - Get ghost text completion                                ║
║    GET  /status    - System status (LED, health)                              ║
║                                                                               ║
║  "Мостът към Суверенния Мозък е отворен."                                     ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝
        `);
                resolve();
            });
            this.server.on('error', (err) => {
                console.error('❌ [IDE-BRIDGE] Server error:', err);
                reject(err);
            });
        });
    }
    stop() {
        if (this.wss) {
            this.clients.forEach(client => client.close());
            this.wss.close();
        }
        if (this.server) {
            this.server.close();
            this.isRunning = false;
            console.log('🛑 [IDE-BRIDGE] Server stopped.');
        }
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // HTTP REQUEST HANDLER
    // ═══════════════════════════════════════════════════════════════════════════
    async handleRequest(req, res) {
        // CORS headers
        res.setHeader('Access-Control-Allow-Origin', this.config.corsOrigin);
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        if (req.method === 'OPTIONS') {
            res.writeHead(204);
            res.end();
            return;
        }
        const startTime = Date.now();
        const url = req.url || '/';
        try {
            let response;
            // Parse body for POST requests
            let body = {};
            if (req.method === 'POST') {
                body = await this.parseBody(req);
            }
            // Route to handler
            switch (url) {
                case '/ask':
                    response = await this.handleAsk(body);
                    break;
                case '/heal':
                    response = await this.handleHeal(body);
                    break;
                case '/audit':
                    response = await this.handleAudit(body);
                    break;
                case '/swap':
                    response = await this.handleSwap(body);
                    break;
                case '/synthesize':
                    response = await this.handleSynthesize(body);
                    break;
                case '/sync':
                    response = await this.handleSync(body);
                    break;
                case '/ghost':
                    response = await this.handleGhost(body);
                    break;
                case '/status':
                    response = await this.handleStatus();
                    break;
                default:
                    response = {
                        success: false,
                        error: `Unknown endpoint: ${url}`,
                        timestamp: Date.now(),
                    };
            }
            // Add latency
            response.latency = Date.now() - startTime;
            // Send response
            res.writeHead(response.success ? 200 : 400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(response));
        }
        catch (error) {
            const errorResponse = {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: Date.now(),
                latency: Date.now() - startTime,
            };
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(errorResponse));
        }
    }
    parseBody(req) {
        return new Promise((resolve, reject) => {
            let data = '';
            req.on('data', chunk => data += chunk);
            req.on('end', () => {
                try {
                    resolve(data ? JSON.parse(data) : {});
                }
                catch {
                    resolve({});
                }
            });
            req.on('error', reject);
        });
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // ENDPOINT HANDLERS
    // ═══════════════════════════════════════════════════════════════════════════
    async handleAsk(body) {
        const { prompt, command, file, mode = 'analyze', context } = body;
        const query = prompt || command || '';
        if (!query) {
            return { success: false, error: 'No prompt provided', timestamp: Date.now() };
        }
        const result = await this.expert.executeDirective({
            command: query,
            filePath: file,
            context,
            mode,
            precision: 'balanced',
        });
        // Broadcast status update
        this.broadcastStatus();
        return {
            success: result.success,
            response: result.result,
            timestamp: Date.now(),
        };
    }
    async handleHeal(body) {
        const { file } = body;
        if (!file) {
            return { success: false, error: 'No file path provided', timestamp: Date.now() };
        }
        const result = await this.expert.fix(file, 'OMEGA_HEAL: Fix all issues and optimize');
        this.broadcastStatus();
        return {
            success: true,
            response: result,
            timestamp: Date.now(),
        };
    }
    async handleAudit(body) {
        const { file } = body;
        const result = await this.expert.executeDirective({
            command: 'GHOST_AUDIT: Perform security analysis with zero detection footprint',
            filePath: file,
            mode: 'audit',
            precision: 'opus',
        });
        this.broadcastStatus();
        return {
            success: result.success,
            response: result.result,
            timestamp: Date.now(),
        };
    }
    async handleSwap(body) {
        const { prompt, command, file } = body;
        const query = prompt || command || 'Continue from where we left off';
        const result = await this.failover.takeOver('RATE_LIMIT', query, file);
        // Update LED to purple (ghost mode)
        this.broadcastStatus();
        return {
            success: true,
            response: result.response,
            timestamp: Date.now(),
        };
    }
    async handleSynthesize(body) {
        const { prompt, command } = body;
        const intent = prompt || command || '';
        if (!intent) {
            return { success: false, error: 'No intent provided', timestamp: Date.now() };
        }
        // Use Binary Synthesis if nexus is awakened
        if (this.nexus.isAwakened()) {
            const result = await this.nexus.synthesizeBinary(intent, 'x64', 'MAXIMUM', 'PARANOID');
            return {
                success: true,
                response: `Binary synthesized: ${JSON.stringify(result)}`,
                timestamp: Date.now(),
            };
        }
        // Fallback to expert
        const result = await this.expert.executeDirective({
            command: intent,
            mode: 'generate',
            precision: 'opus',
        });
        return {
            success: result.success,
            response: result.result,
            timestamp: Date.now(),
        };
    }
    async handleSync(body) {
        const { focus } = body;
        if (typeof focus === 'number') {
            await HardwareBridge_1.HardwareBridge.syncFocus(focus);
        }
        return {
            success: true,
            response: `Focus synced: ${focus || 'default'}`,
            timestamp: Date.now(),
        };
    }
    async handleGhost(body) {
        const { context, file } = body;
        if (!context) {
            return { success: false, error: 'No context provided', timestamp: Date.now() };
        }
        // Get ghost text (inline completion)
        const ghostText = await this.expert.ask(`CONTINUE_CODE: Complete this code naturally, output ONLY the continuation:\n${context}`, file);
        // Extract just the continuation (not the full response)
        const lines = ghostText.split('\n');
        const codeStart = lines.findIndex(l => l.includes('```'));
        const suggestion = codeStart >= 0
            ? lines.slice(codeStart + 1).join('\n').replace(/```$/, '').trim()
            : ghostText.slice(0, 100);
        return {
            success: true,
            response: suggestion,
            timestamp: Date.now(),
        };
    }
    async handleStatus() {
        const status = this.getSystemStatus();
        return {
            success: true,
            status,
            timestamp: Date.now(),
        };
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // SYSTEM STATUS
    // ═══════════════════════════════════════════════════════════════════════════
    getSystemStatus() {
        const failoverState = this.failover.getState();
        const guardStatus = this.guard.getStatus();
        const inactivityMs = this.expert.getInactivityDuration();
        const inactivityMinutes = Math.floor(inactivityMs / 60000);
        // Determine LED color
        let led = 'green';
        let ledLabel = 'SYNCED';
        if (guardStatus.level >= 3) {
            led = 'red';
            ledLabel = 'GUARD LEVEL 3';
        }
        else if (failoverState.isActive) {
            led = 'purple';
            ledLabel = 'GHOST MODE';
        }
        else if (inactivityMinutes >= 180) {
            led = 'yellow';
            ledLabel = 'EVOLUTION PENDING';
        }
        return {
            led,
            ledLabel,
            awakened: this.nexus.isAwakened(),
            health: this.nexus.getStatus().systemHealth,
            inactivityMinutes,
            guardLevel: guardStatus.level,
            activeModel: failoverState.isActive ? 'LOCAL' : 'CLOUD',
        };
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // WEBSOCKET
    // ═══════════════════════════════════════════════════════════════════════════
    setupWebSocket() {
        if (!this.wss)
            return;
        this.wss.on('connection', (ws) => {
            console.log('🔗 [IDE-BRIDGE] WebSocket client connected');
            this.clients.add(ws);
            // Send initial status
            ws.send(JSON.stringify({
                type: 'status',
                data: this.getSystemStatus(),
            }));
            ws.on('close', () => {
                this.clients.delete(ws);
                console.log('🔌 [IDE-BRIDGE] WebSocket client disconnected');
            });
            ws.on('message', async (message) => {
                try {
                    const data = JSON.parse(message.toString());
                    if (data.type === 'command') {
                        const result = await this.handleAsk({ prompt: data.prompt, file: data.file });
                        ws.send(JSON.stringify({ type: 'response', data: result }));
                    }
                }
                catch (error) {
                    ws.send(JSON.stringify({ type: 'error', error: 'Invalid message' }));
                }
            });
        });
    }
    broadcastStatus() {
        const status = this.getSystemStatus();
        const message = JSON.stringify({ type: 'status', data: status });
        this.clients.forEach(client => {
            if (client.readyState === ws_1.WebSocket.OPEN) {
                client.send(message);
            }
        });
    }
    broadcast(type, data) {
        const message = JSON.stringify({ type, data });
        this.clients.forEach(client => {
            if (client.readyState === ws_1.WebSocket.OPEN) {
                client.send(message);
            }
        });
    }
}
exports.OmegaServer = OmegaServer;
// ═══════════════════════════════════════════════════════════════════════════════
// SINGLETON EXPORT
// ═══════════════════════════════════════════════════════════════════════════════
exports.omegaServer = OmegaServer.getInstance();
exports.default = OmegaServer;
