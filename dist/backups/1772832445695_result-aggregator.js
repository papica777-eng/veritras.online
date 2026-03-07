"use strict";
/**
 * 🐝 THE SWARM - Result Aggregator with WebSocket
 *
 * Real-time aggregation of distributed test results
 * with WebSocket streaming to dashboard.
 *
 * Features:
 * - Real-time result streaming
 * - Metric aggregation
 * - Live dashboard updates
 * - Historical data storage
 *
 * @version 1.0.0-QANTUM-PRIME
 * @phase 79-80
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
exports.DashboardConnector = exports.SwarmWebSocketServer = exports.ResultAggregator = void 0;
exports.createSwarmDashboard = createSwarmDashboard;
const events_1 = require("events");
const http = __importStar(require("http"));
const crypto = __importStar(require("crypto"));
// UNIVERSAL SYNTHESIS: PHYSICS layer uses PHYSICS layer logger
const logger_1 = require("../layers/physics/logger");
// ============================================================
// RESULT AGGREGATOR
// ============================================================
class ResultAggregator extends events_1.EventEmitter {
    results = new Map();
    metrics;
    timeline = [];
    startTime = 0;
    constructor() {
        super();
        this.metrics = this.initializeMetrics();
    }
    /**
     * Add result from worker
     */
    // Complexity: O(1) — lookup
    addResult(result) {
        this.results.set(result.taskId, result);
        this.updateMetrics(result);
        const event = {
            type: 'task:complete',
            timestamp: Date.now(),
            data: result
        };
        this.timeline.push(event);
        this.emit('result', event);
    }
    /**
     * Add error from worker
     */
    // Complexity: O(1)
    addError(error) {
        const event = {
            type: 'task:error',
            timestamp: Date.now(),
            data: error
        };
        this.timeline.push(event);
        this.emit('error', event);
        this.metrics.failedTests++;
        this.metrics.totalTests++;
        this.recalculatePassRate();
    }
    /**
     * Get current aggregated metrics
     */
    // Complexity: O(1)
    getMetrics() {
        return { ...this.metrics };
    }
    /**
     * Get all results
     */
    // Complexity: O(1)
    getResults() {
        return Array.from(this.results.values());
    }
    /**
     * Get timeline of events
     */
    // Complexity: O(1)
    getTimeline() {
        return [...this.timeline];
    }
    /**
     * Generate summary report
     */
    // Complexity: O(1)
    generateSummary() {
        const duration = Date.now() - this.startTime;
        return {
            swarmId: crypto.randomBytes(8).toString('hex'),
            timestamp: new Date().toISOString(),
            duration,
            metrics: this.metrics,
            topFailures: this.getTopFailures(10),
            slowestTests: this.getSlowestTests(10),
            workerPerformance: this.getWorkerPerformance()
        };
    }
    /**
     * Start aggregation session
     */
    // Complexity: O(1)
    startSession() {
        this.startTime = Date.now();
        this.results.clear();
        this.timeline = [];
        this.metrics = this.initializeMetrics();
        logger_1.logger.debug('📊 [AGGREGATOR] Session started');
    }
    /**
     * End aggregation session
     */
    // Complexity: O(1)
    endSession() {
        const summary = this.generateSummary();
        logger_1.logger.debug('📊 [AGGREGATOR] Session ended');
        this.emit('session:end', summary);
        return summary;
    }
    // ============================================================
    // PRIVATE METHODS
    // ============================================================
    // Complexity: O(1)
    initializeMetrics() {
        return {
            totalTests: 0,
            passedTests: 0,
            failedTests: 0,
            skippedTests: 0,
            passRate: 0,
            avgDuration: 0,
            totalDuration: 0,
            testsPerSecond: 0,
            peakConcurrency: 0,
            memoryUsed: 0
        };
    }
    // Complexity: O(1)
    updateMetrics(result) {
        this.metrics.totalTests++;
        this.metrics.totalDuration += result.duration || 0;
        this.metrics.avgDuration = this.metrics.totalDuration / this.metrics.totalTests;
        if (result.status === 'passed') {
            this.metrics.passedTests++;
        }
        else if (result.status === 'failed' || result.status === 'error') {
            this.metrics.failedTests++;
        }
        else {
            this.metrics.skippedTests++;
        }
        this.recalculatePassRate();
        // Calculate tests per second
        const elapsed = (Date.now() - this.startTime) / 1000;
        this.metrics.testsPerSecond = this.metrics.totalTests / Math.max(elapsed, 1);
        // Update memory usage
        if (result.metrics?.memoryUsed) {
            this.metrics.memoryUsed = Math.max(this.metrics.memoryUsed, result.metrics.memoryUsed);
        }
    }
    // Complexity: O(1)
    recalculatePassRate() {
        const total = this.metrics.passedTests + this.metrics.failedTests;
        this.metrics.passRate = total > 0
            ? (this.metrics.passedTests / total) * 100
            : 0;
    }
    // Complexity: O(N) — linear scan
    getTopFailures(limit) {
        return Array.from(this.results.values())
            .filter(r => r.status === 'failed' || r.status === 'error')
            .slice(0, limit)
            .map(r => ({
            testFile: r.output?.testFile,
            testName: r.output?.testName,
            error: r.error
        }));
    }
    // Complexity: O(N log N) — sort
    getSlowestTests(limit) {
        return Array.from(this.results.values())
            .sort((a, b) => (b.duration || 0) - (a.duration || 0))
            .slice(0, limit)
            .map(r => ({
            testFile: r.output?.testFile,
            testName: r.output?.testName,
            duration: r.duration
        }));
    }
    // Complexity: O(N) — linear scan
    getWorkerPerformance() {
        const workerStats = new Map();
        for (const result of this.results.values()) {
            const workerId = result.workerId || 'unknown';
            const stats = workerStats.get(workerId) || { count: 0, totalDuration: 0 };
            stats.count++;
            stats.totalDuration += result.duration || 0;
            workerStats.set(workerId, stats);
        }
        return Object.fromEntries(Array.from(workerStats.entries()).map(([id, stats]) => [
            id,
            {
                tasksCompleted: stats.count,
                avgDuration: stats.totalDuration / stats.count
            }
        ]));
    }
}
exports.ResultAggregator = ResultAggregator;
// ============================================================
// WEBSOCKET SERVER
// ============================================================
class SwarmWebSocketServer {
    server = null;
    clients = new Map();
    aggregator;
    port;
    constructor(aggregator, port = 3001) {
        this.aggregator = aggregator;
        this.port = port;
        this.setupAggregatorListeners();
    }
    /**
     * Start WebSocket server
     */
    // Complexity: O(N)
    start() {
        this.server = http.createServer((req, res) => {
            // Handle upgrade manually for WebSocket
            if (req.headers.upgrade !== 'websocket') {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ status: 'ok', clients: this.clients.size }));
            }
        });
        this.server.on('upgrade', (request, socket, head) => {
            this.handleUpgrade(request, socket, head);
        });
        this.server.listen(this.port, () => {
            logger_1.logger.debug(`🔌 [WEBSOCKET] Server running on ws://localhost:${this.port}`);
        });
    }
    /**
     * Stop WebSocket server
     */
    // Complexity: O(N) — loop
    stop() {
        for (const client of this.clients.values()) {
            this.closeClient(client);
        }
        this.clients.clear();
        if (this.server) {
            this.server.close();
            logger_1.logger.debug('🔌 [WEBSOCKET] Server stopped');
        }
    }
    /**
     * Broadcast message to all clients
     */
    // Complexity: O(N) — loop
    broadcast(update) {
        const message = JSON.stringify(update);
        for (const client of this.clients.values()) {
            this.sendToClient(client, message);
        }
    }
    /**
     * Send to specific subscribed clients
     */
    // Complexity: O(N) — loop
    broadcastToSubscribers(channel, update) {
        const message = JSON.stringify(update);
        for (const client of this.clients.values()) {
            if (client.subscriptions.includes(channel) || client.subscriptions.includes('*')) {
                this.sendToClient(client, message);
            }
        }
    }
    // ============================================================
    // PRIVATE METHODS
    // ============================================================
    // Complexity: O(N)
    handleUpgrade(request, socket, head) {
        // Simple WebSocket handshake
        const key = request.headers['sec-websocket-key'];
        if (!key) {
            socket.destroy();
            return;
        }
        const acceptKey = crypto
            .createHash('sha1')
            .update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11')
            .digest('base64');
        const responseHeaders = [
            'HTTP/1.1 101 Switching Protocols',
            'Upgrade: websocket',
            'Connection: Upgrade',
            `Sec-WebSocket-Accept: ${acceptKey}`,
            '',
            ''
        ].join('\r\n');
        socket.write(responseHeaders);
        const clientId = crypto.randomBytes(8).toString('hex');
        const client = {
            id: clientId,
            socket,
            subscriptions: ['*']
        };
        this.clients.set(clientId, client);
        logger_1.logger.debug(`🔌 [WEBSOCKET] Client connected: ${clientId}`);
        // Handle messages
        socket.on('data', (buffer) => {
            this.handleMessage(client, buffer);
        });
        socket.on('close', () => {
            this.clients.delete(clientId);
            logger_1.logger.debug(`🔌 [WEBSOCKET] Client disconnected: ${clientId}`);
        });
        socket.on('error', (error) => {
            logger_1.logger.error(`🔌 [WEBSOCKET] Error for ${clientId}:`, error.message);
            this.clients.delete(clientId);
        });
        // Send initial state
        this.sendToClient(client, JSON.stringify({
            type: 'metrics',
            payload: this.aggregator.getMetrics()
        }));
    }
    // Complexity: O(N) — loop
    handleMessage(client, buffer) {
        try {
            // Decode WebSocket frame (simplified)
            const firstByte = buffer[0];
            const secondByte = buffer[1];
            const isMasked = (secondByte & 0x80) !== 0;
            let payloadLength = secondByte & 0x7f;
            let maskOffset = 2;
            if (payloadLength === 126) {
                payloadLength = buffer.readUInt16BE(2);
                maskOffset = 4;
            }
            else if (payloadLength === 127) {
                payloadLength = Number(buffer.readBigUInt64BE(2));
                maskOffset = 10;
            }
            if (!isMasked)
                return;
            const mask = buffer.slice(maskOffset, maskOffset + 4);
            const payload = buffer.slice(maskOffset + 4, maskOffset + 4 + payloadLength);
            // Unmask
            for (let i = 0; i < payload.length; i++) {
                payload[i] ^= mask[i % 4];
            }
            const message = JSON.parse(payload.toString());
            // Handle subscription requests
            if (message.type === 'subscribe') {
                client.subscriptions = message.channels || ['*'];
                logger_1.logger.debug(`🔌 [WEBSOCKET] ${client.id} subscribed to:`, client.subscriptions);
            }
        }
        catch (error) {
            // Ignore parse errors
        }
    }
    // Complexity: O(1)
    sendToClient(client, message) {
        try {
            const payload = Buffer.from(message);
            let frame;
            if (payload.length < 126) {
                frame = Buffer.alloc(2 + payload.length);
                frame[0] = 0x81; // Text frame
                frame[1] = payload.length;
                payload.copy(frame, 2);
            }
            else if (payload.length < 65536) {
                frame = Buffer.alloc(4 + payload.length);
                frame[0] = 0x81;
                frame[1] = 126;
                frame.writeUInt16BE(payload.length, 2);
                payload.copy(frame, 4);
            }
            else {
                frame = Buffer.alloc(10 + payload.length);
                frame[0] = 0x81;
                frame[1] = 127;
                frame.writeBigUInt64BE(BigInt(payload.length), 2);
                payload.copy(frame, 10);
            }
            client.socket.write(frame);
        }
        catch (error) {
            // Client disconnected
        }
    }
    // Complexity: O(1)
    closeClient(client) {
        try {
            const closeFrame = Buffer.from([0x88, 0x00]);
            client.socket.write(closeFrame);
            client.socket.end();
        }
        catch {
            // Already closed
        }
    }
    // Complexity: O(1)
    setupAggregatorListeners() {
        this.aggregator.on('result', (event) => {
            this.broadcast({
                type: 'result',
                payload: event.data
            });
            // Also send updated metrics
            this.broadcast({
                type: 'metrics',
                payload: this.aggregator.getMetrics()
            });
        });
        this.aggregator.on('error', (event) => {
            this.broadcast({
                type: 'alert',
                payload: {
                    level: 'error',
                    message: event.data.error,
                    testFile: event.data.output?.testFile
                }
            });
        });
        this.aggregator.on('session:end', (summary) => {
            this.broadcast({
                type: 'progress',
                payload: {
                    status: 'complete',
                    summary
                }
            });
        });
    }
}
exports.SwarmWebSocketServer = SwarmWebSocketServer;
// ============================================================
// DASHBOARD INTEGRATION
// ============================================================
class DashboardConnector {
    wsServer;
    aggregator;
    constructor(port = 3001) {
        this.aggregator = new ResultAggregator();
        this.wsServer = new SwarmWebSocketServer(this.aggregator, port);
    }
    /**
     * Start dashboard connection
     */
    // Complexity: O(1)
    start() {
        this.wsServer.start();
        this.aggregator.startSession();
        logger_1.logger.debug(`
╔═══════════════════════════════════════════════════════════════╗
║  📊 SWARM DASHBOARD CONNECTOR                                 ║
║                                                               ║
║  WebSocket: ws://localhost:3001                               ║
║  Dashboard: http://localhost:3000/dashboard-new.html          ║
╚═══════════════════════════════════════════════════════════════╝
`);
    }
    /**
     * Stop dashboard connection
     */
    // Complexity: O(1)
    stop() {
        const summary = this.aggregator.endSession();
        this.wsServer.stop();
        return summary;
    }
    /**
     * Get aggregator for adding results
     */
    // Complexity: O(1)
    getAggregator() {
        return this.aggregator;
    }
    /**
     * Manual broadcast
     */
    // Complexity: O(1)
    broadcast(update) {
        this.wsServer.broadcast(update);
    }
}
exports.DashboardConnector = DashboardConnector;
// ============================================================
// EXPORTS
// ============================================================
function createSwarmDashboard(port) {
    return new DashboardConnector(port);
}
