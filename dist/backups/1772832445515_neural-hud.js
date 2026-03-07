"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * QAntum
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * @copyright 2025 Димитър Продромов (Dimitar Prodromov). All Rights Reserved.
 * @license PROPRIETARY AND CONFIDENTIAL
 *
 * This file is part of QAntum.
 * Unauthorized copying, modification, distribution, or use of this file,
 * via any medium, is strictly prohibited without express written permission.
 *
 * For licensing inquiries: dp@qantum.site
 * ═══════════════════════════════════════════════════════════════════════════════
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.NeuralHUD = void 0;
const events_1 = require("events");
const ws_1 = require("ws");
const http_1 = require("http");
// ═══════════════════════════════════════════════════════════════════════════════
// 🧠 NEURAL HUD CLASS
// ═══════════════════════════════════════════════════════════════════════════════
class NeuralHUD extends events_1.EventEmitter {
    config;
    httpServer = null;
    wsServer = null;
    clients = new Map();
    waveBuffer = [];
    telemetryBuffer = [];
    waveSequence = 0;
    telemetryInterval = null;
    routes = new Map();
    isRunning = false;
    // v26.0: Nexus log buffer for Shield/Sword collaboration streaming
    nexusLogBuffer = [];
    nexusLogSequence = 0;
    constructor(config) {
        super();
        this.config = {
            port: config?.port || 3847,
            wsPath: config?.wsPath || '/neural-hud',
            telemetryInterval: config?.telemetryInterval || 1000,
            waveBufferSize: config?.waveBufferSize || 1000,
            requireAuth: config?.requireAuth ?? false,
            authToken: config?.authToken,
            enableCors: config?.enableCors ?? true,
            corsOrigins: config?.corsOrigins || ['*'],
            enableNexusLogs: config?.enableNexusLogs ?? true,
            nexusLogBufferSize: config?.nexusLogBufferSize ?? 500,
        };
        this.initializeRoutes();
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // 🚀 SERVER LIFECYCLE
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Start the Neural HUD server
     */
    // Complexity: O(1) — amortized
    async start() {
        if (this.isRunning) {
            throw new Error('Neural HUD is already running');
        }
        return new Promise((resolve, reject) => {
            try {
                // Create HTTP server
                this.httpServer = (0, http_1.createServer)((req, res) => this.handleHttpRequest(req, res));
                // Create WebSocket server
                this.wsServer = new ws_1.WebSocketServer({
                    server: this.httpServer,
                    path: this.config.wsPath,
                });
                // Set up WebSocket handlers
                this.wsServer.on('connection', (socket, req) => this.handleConnection(socket, req));
                this.wsServer.on('error', (error) => this.emit('error', error));
                // Start telemetry collection
                this.startTelemetryCollection();
                // Start listening
                this.httpServer.listen(this.config.port, () => {
                    this.isRunning = true;
                    this.emit('start', { port: this.config.port });
                    // Complexity: O(1)
                    resolve();
                });
                this.httpServer.on('error', (error) => {
                    this.emit('error', error);
                    // Complexity: O(1)
                    reject(error);
                });
            }
            catch (error) {
                // Complexity: O(1)
                reject(error);
            }
        });
    }
    /**
     * Stop the Neural HUD server
     */
    // Complexity: O(N) — linear iteration
    async stop() {
        if (!this.isRunning) {
            return;
        }
        // Stop telemetry collection
        if (this.telemetryInterval) {
            // Complexity: O(N) — linear iteration
            clearInterval(this.telemetryInterval);
            this.telemetryInterval = null;
        }
        // Close all client connections
        for (const client of this.clients.values()) {
            client.socket.close(1000, 'Server shutting down');
        }
        this.clients.clear();
        // Close WebSocket server
        if (this.wsServer) {
            this.wsServer.close();
            this.wsServer = null;
        }
        // Close HTTP server
        return new Promise((resolve) => {
            if (this.httpServer) {
                this.httpServer.close(() => {
                    this.httpServer = null;
                    this.isRunning = false;
                    this.emit('stop');
                    // Complexity: O(1)
                    resolve();
                });
            }
            else {
                this.isRunning = false;
                // Complexity: O(1)
                resolve();
            }
        });
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // 🌐 HTTP API
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Initialize REST API routes
     */
    // Complexity: O(N) — linear iteration
    initializeRoutes() {
        // Health check
        this.routes.set('GET:/health', async (req, res) => {
            this.sendJson(res, 200, {
                status: 'healthy',
                uptime: process.uptime(),
                clients: this.clients.size,
                waveCount: this.waveBuffer.length,
            });
        });
        // Get recent brain waves
        this.routes.set('GET:/waves', async (req, res, params) => {
            const limit = parseInt(params.limit || '100');
            const waves = this.waveBuffer.slice(-limit);
            this.sendJson(res, 200, { waves, total: this.waveBuffer.length });
        });
        // Get brain wave by ID
        this.routes.set('GET:/waves/:id', async (req, res, params) => {
            const wave = this.waveBuffer.find((w) => w.id === params.id);
            if (wave) {
                this.sendJson(res, 200, wave);
            }
            else {
                this.sendJson(res, 404, { error: 'Wave not found' });
            }
        });
        // Get latest telemetry
        this.routes.set('GET:/telemetry', async (req, res) => {
            const latest = this.telemetryBuffer[this.telemetryBuffer.length - 1];
            this.sendJson(res, 200, latest || {});
        });
        // Get telemetry history
        this.routes.set('GET:/telemetry/history', async (req, res, params) => {
            const limit = parseInt(params.limit || '60');
            const history = this.telemetryBuffer.slice(-limit);
            this.sendJson(res, 200, { snapshots: history, total: this.telemetryBuffer.length });
        });
        // Get connected clients
        this.routes.set('GET:/clients', async (req, res) => {
            const clients = Array.from(this.clients.values()).map((c) => ({
                id: c.id,
                connectedAt: c.connectedAt,
                lastActivity: c.lastActivity,
                subscriptions: Array.from(c.subscriptions),
            }));
            this.sendJson(res, 200, { clients, total: clients.length });
        });
        // Get statistics
        this.routes.set('GET:/stats', async (req, res) => {
            const stats = this.getStatistics();
            this.sendJson(res, 200, stats);
        });
        // Clear buffers
        this.routes.set('DELETE:/buffers', async (req, res) => {
            this.clearBuffers();
            this.sendJson(res, 200, { message: 'Buffers cleared' });
        });
    }
    /**
     * Handle HTTP request
     */
    // Complexity: O(N) — linear iteration
    async handleHttpRequest(req, res) {
        // Handle CORS
        if (this.config.enableCors) {
            const origin = req.headers.origin || '*';
            if (this.config.corsOrigins.includes('*') || this.config.corsOrigins.includes(origin)) {
                res.setHeader('Access-Control-Allow-Origin', origin);
                res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
                res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            }
        }
        // Handle preflight
        if (req.method === 'OPTIONS') {
            res.writeHead(204);
            res.end();
            return;
        }
        // Check authentication
        if (this.config.requireAuth) {
            const authHeader = req.headers.authorization;
            if (!authHeader || authHeader !== `Bearer ${this.config.authToken}`) {
                this.sendJson(res, 401, { error: 'Unauthorized' });
                return;
            }
        }
        // Parse URL
        const url = new URL(req.url || '/', `http://localhost:${this.config.port}`);
        const path = url.pathname;
        const params = {};
        // Parse query params
        url.searchParams.forEach((value, key) => {
            params[key] = value;
        });
        // Find matching route
        let handler;
        let routeParams = {};
        for (const [routeKey, routeHandler] of this.routes) {
            const [method, pattern] = routeKey.split(':');
            if (method !== req.method)
                continue;
            const match = this.matchRoute(pattern, path);
            if (match) {
                handler = routeHandler;
                routeParams = { ...params, ...match };
                break;
            }
        }
        if (handler) {
            try {
                await handler(req, res, routeParams);
            }
            catch (error) {
                this.sendJson(res, 500, { error: 'Internal server error' });
            }
        }
        else {
            this.sendJson(res, 404, { error: 'Not found' });
        }
    }
    /**
     * Match route pattern
     */
    // Complexity: O(N) — linear iteration
    matchRoute(pattern, path) {
        const patternParts = pattern.split('/');
        const pathParts = path.split('/');
        if (patternParts.length !== pathParts.length) {
            return null;
        }
        const params = {};
        for (let i = 0; i < patternParts.length; i++) {
            if (patternParts[i].startsWith(':')) {
                params[patternParts[i].slice(1)] = pathParts[i];
            }
            else if (patternParts[i] !== pathParts[i]) {
                return null;
            }
        }
        return params;
    }
    /**
     * Send JSON response
     */
    // Complexity: O(1)
    sendJson(res, status, data) {
        res.writeHead(status, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(data));
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // 🔌 WEBSOCKET HANDLING
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Handle new WebSocket connection
     */
    // Complexity: O(1) — hash/map lookup
    handleConnection(socket, req) {
        const clientId = this.generateClientId();
        const client = {
            id: clientId,
            socket,
            subscriptions: new Set(['waves', 'telemetry']), // Default subscriptions
            connectedAt: Date.now(),
            lastActivity: Date.now(),
            metadata: {
                ip: req.socket.remoteAddress,
                userAgent: req.headers['user-agent'],
            },
        };
        this.clients.set(clientId, client);
        // Send welcome message
        this.sendToClient(client, {
            type: 'connected',
            clientId,
            serverTime: Date.now(),
            config: {
                telemetryInterval: this.config.telemetryInterval,
                waveBufferSize: this.config.waveBufferSize,
            },
        });
        // Send recent waves
        const recentWaves = this.waveBuffer.slice(-10);
        if (recentWaves.length > 0) {
            this.sendToClient(client, {
                type: 'waves:history',
                waves: recentWaves,
            });
        }
        // Handle messages
        socket.on('message', (data) => this.handleClientMessage(client, data));
        // Handle close
        socket.on('close', () => {
            this.clients.delete(clientId);
            this.emit('client:disconnect', { clientId });
        });
        // Handle errors
        socket.on('error', (error) => {
            this.emit('client:error', { clientId, error });
        });
        this.emit('client:connect', { clientId, client });
    }
    /**
     * Handle client message
     */
    // Complexity: O(N) — linear iteration
    handleClientMessage(client, data) {
        client.lastActivity = Date.now();
        try {
            const message = JSON.parse(data.toString());
            switch (message.type) {
                case 'subscribe':
                    if (message.channels) {
                        message.channels.forEach((ch) => client.subscriptions.add(ch));
                    }
                    break;
                case 'unsubscribe':
                    if (message.channels) {
                        message.channels.forEach((ch) => client.subscriptions.delete(ch));
                    }
                    break;
                case 'ping':
                    this.sendToClient(client, { type: 'pong', timestamp: Date.now() });
                    break;
                case 'get:waves':
                    this.sendToClient(client, {
                        type: 'waves:history',
                        waves: this.waveBuffer.slice(-100),
                    });
                    break;
                case 'get:telemetry':
                    this.sendToClient(client, {
                        type: 'telemetry:history',
                        snapshots: this.telemetryBuffer.slice(-60),
                    });
                    break;
            }
        }
        catch (error) {
            this.sendToClient(client, { type: 'error', message: 'Invalid message format' });
        }
    }
    /**
     * Send message to client
     */
    // Complexity: O(1)
    sendToClient(client, message) {
        if (client.socket.readyState === ws_1.WebSocket.OPEN) {
            client.socket.send(JSON.stringify(message));
        }
    }
    /**
     * Broadcast to subscribed clients
     */
    // Complexity: O(N) — linear iteration
    broadcast(channel, message) {
        for (const client of this.clients.values()) {
            if (client.subscriptions.has(channel)) {
                this.sendToClient(client, message);
            }
        }
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // 🧠 BRAIN WAVE EMISSION
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Emit a brain wave
     */
    // Complexity: O(1)
    emitWave(wave) {
        const fullWave = {
            id: this.generateWaveId(),
            timestamp: Date.now(),
            ...wave,
            metadata: {
                sequence: this.waveSequence++,
                childWaves: [],
                tags: [],
                priority: 'normal',
                ...wave.metadata,
            },
        };
        // Add to buffer
        this.waveBuffer.push(fullWave);
        // Trim buffer if needed
        if (this.waveBuffer.length > this.config.waveBufferSize) {
            this.waveBuffer.shift();
        }
        // Broadcast to clients
        this.broadcast('waves', {
            type: 'wave',
            wave: fullWave,
        });
        // Emit event
        this.emit('wave', fullWave);
        return fullWave;
    }
    /**
     * Create perception wave
     */
    // Complexity: O(1)
    perception(source, summary, input) {
        return this.emitWave({
            type: 'perception',
            source,
            confidence: 1,
            duration: 0,
            relatedWaves: [],
            content: {
                summary,
                details: {},
                input,
            },
        });
    }
    /**
     * Create reasoning wave
     */
    // Complexity: O(1)
    reasoning(source, summary, details) {
        return this.emitWave({
            type: 'reasoning',
            source,
            confidence: 0.9,
            duration: 0,
            relatedWaves: [],
            content: {
                summary,
                details,
            },
        });
    }
    /**
     * Create decision wave
     */
    // Complexity: O(1)
    decision(source, summary, chosen, alternatives) {
        return this.emitWave({
            type: 'decision',
            source,
            confidence: 0.85,
            duration: 0,
            relatedWaves: [],
            content: {
                summary,
                details: { chosen },
                output: chosen,
                alternatives,
            },
        });
    }
    /**
     * Create action wave
     */
    // Complexity: O(1)
    action(source, summary, output, duration) {
        return this.emitWave({
            type: 'action',
            source,
            confidence: 1,
            duration,
            relatedWaves: [],
            content: {
                summary,
                details: {},
                output,
            },
        });
    }
    /**
     * Create error wave
     */
    // Complexity: O(1) — amortized
    error(source, summary, error) {
        return this.emitWave({
            type: 'error',
            source,
            confidence: 1,
            duration: 0,
            relatedWaves: [],
            content: {
                summary,
                details: {
                    name: error.name,
                    message: error.message,
                    stack: error.stack,
                },
            },
            metadata: {
                sequence: this.waveSequence,
                childWaves: [],
                tags: ['error'],
                priority: 'critical',
            },
        });
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // 📊 TELEMETRY COLLECTION
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Start telemetry collection
     */
    // Complexity: O(1)
    startTelemetryCollection() {
        this.telemetryInterval = setInterval(() => {
            const snapshot = this.collectTelemetry();
            // Add to buffer
            this.telemetryBuffer.push(snapshot);
            // Keep last 3600 snapshots (1 hour at 1 second interval)
            if (this.telemetryBuffer.length > 3600) {
                this.telemetryBuffer.shift();
            }
            // Broadcast to clients
            this.broadcast('telemetry', {
                type: 'telemetry',
                snapshot,
            });
        }, this.config.telemetryInterval);
    }
    /**
     * Collect telemetry snapshot
     */
    // Complexity: O(1) — amortized
    collectTelemetry() {
        const memUsage = process.memoryUsage();
        const cpuUsage = process.cpuUsage();
        return {
            timestamp: Date.now(),
            cpu: {
                load: (cpuUsage.user + cpuUsage.system) / 1000000, // Convert to percentage-like value
                cores: this.getCoreLoads(),
                model: 'AMD Ryzen 7 7435HS', // From hardware telemetry
                speed: 3100,
                temperature: undefined,
                isThrottled: false,
            },
            memory: {
                total: 24 * 1024 * 1024 * 1024, // 24GB
                used: memUsage.heapUsed + memUsage.external,
                free: 24 * 1024 * 1024 * 1024 - (memUsage.heapUsed + memUsage.external),
                usagePercent: ((memUsage.heapUsed + memUsage.external) / (24 * 1024 * 1024 * 1024)) * 100,
                heapUsed: memUsage.heapUsed,
                heapTotal: memUsage.heapTotal,
            },
            system: {
                platform: process.platform,
                uptime: process.uptime(),
                loadAverage: [0, 0, 0], // Would use os.loadavg() in real impl
                processCount: 1,
            },
            process: {
                pid: process.pid,
                cpuUsage: (cpuUsage.user + cpuUsage.system) / 1000000,
                memoryUsage: memUsage.heapUsed,
                activeHandles: process._getActiveHandles?.().length || 0,
                activeRequests: process._getActiveRequests?.().length || 0,
                eventLoopLag: 0,
            },
            network: {
                activeConnections: this.clients.size,
                bytesReceived: 0,
                bytesSent: 0,
                requestsPerSecond: 0,
            },
        };
    }
    /**
     * Get simulated core loads
     */
    // Complexity: O(N) — linear iteration
    getCoreLoads() {
        // 16 cores for Ryzen 7
        return Array(16)
            .fill(0)
            .map(() => Math.random() * 30 + 10);
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // 📈 STATISTICS
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Get comprehensive statistics
     */
    // Complexity: O(N) — linear iteration
    getStatistics() {
        const wavesByType = {};
        const wavesBySource = {};
        for (const wave of this.waveBuffer) {
            wavesByType[wave.type] = (wavesByType[wave.type] || 0) + 1;
            wavesBySource[wave.source] = (wavesBySource[wave.source] || 0) + 1;
        }
        let avgCpu = 0;
        let avgMem = 0;
        if (this.telemetryBuffer.length > 0) {
            avgCpu =
                this.telemetryBuffer.reduce((sum, t) => sum + t.cpu.load, 0) / this.telemetryBuffer.length;
            avgMem =
                this.telemetryBuffer.reduce((sum, t) => sum + t.memory.usagePercent, 0) /
                    this.telemetryBuffer.length;
        }
        return {
            server: {
                isRunning: this.isRunning,
                uptime: process.uptime(),
                port: this.config.port,
            },
            clients: {
                total: this.clients.size,
                active: Array.from(this.clients.values()).filter((c) => Date.now() - c.lastActivity < 60000)
                    .length,
            },
            waves: {
                total: this.waveBuffer.length,
                byType: wavesByType,
                bySource: wavesBySource,
            },
            telemetry: {
                snapshots: this.telemetryBuffer.length,
                avgCpuLoad: avgCpu,
                avgMemoryUsage: avgMem,
            },
        };
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // 🛠️ UTILITIES
    // ═══════════════════════════════════════════════════════════════════════════
    // Complexity: O(1)
    generateClientId() {
        return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    // Complexity: O(1)
    generateWaveId() {
        return `wave_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    /**
     * Clear all buffers
     */
    // Complexity: O(1)
    clearBuffers() {
        this.waveBuffer = [];
        this.telemetryBuffer = [];
        this.waveSequence = 0;
    }
    /**
     * Get recent waves
     */
    // Complexity: O(1)
    getRecentWaves(limit = 100) {
        return this.waveBuffer.slice(-limit);
    }
    /**
     * Get latest telemetry
     */
    // Complexity: O(1)
    getLatestTelemetry() {
        return this.telemetryBuffer[this.telemetryBuffer.length - 1] || null;
    }
    /**
     * Check if server is running
     */
    // Complexity: O(1)
    isActive() {
        return this.isRunning;
    }
    /**
     * Get client count
     */
    // Complexity: O(1)
    getClientCount() {
        return this.clients.size;
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // 🔗 v26.0 NEXUS LOG STREAMING - Shield & Sword Collaboration
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * v26.0: Log a Nexus event (Shield/Sword collaboration)
     */
    // Complexity: O(1) — amortized
    logNexusEvent(entry) {
        const logEntry = {
            id: `nexus_${++this.nexusLogSequence}_${Date.now()}`,
            timestamp: Date.now(),
            ...entry,
        };
        this.nexusLogBuffer.push(logEntry);
        // Trim buffer if needed
        const maxSize = this.config.nexusLogBufferSize ?? 500;
        if (this.nexusLogBuffer.length > maxSize) {
            this.nexusLogBuffer = this.nexusLogBuffer.slice(-maxSize);
        }
        // Broadcast to all clients subscribed to nexus logs
        this.broadcast('nexus_log', logEntry);
        this.emit('nexusLog', logEntry);
        return logEntry;
    }
    /**
     * v26.0: Log vulnerability detection from CyberCody (Sword)
     */
    // Complexity: O(1)
    logVulnerabilityDetected(vulnerabilityId, type, severity, target) {
        return this.logNexusEvent({
            eventType: 'vulnerability_detected',
            source: 'sword',
            target: 'nexus',
            message: `🗡️ CyberCody detected ${severity.toUpperCase()} ${type} vulnerability on ${target}`,
            data: { vulnerabilityId, vulnerabilityType: type, severity },
        });
    }
    /**
     * v26.0: Log test generation from QAntum (Shield)
     */
    // Complexity: O(N)
    logTestGenerated(testId, vulnerabilityId, duration) {
        return this.logNexusEvent({
            eventType: 'test_generated',
            source: 'shield',
            target: 'nexus',
            message: `🛡️ Shield generated regression test for vulnerability ${vulnerabilityId}`,
            data: { testId, vulnerabilityId },
            duration,
        });
    }
    /**
     * v26.0: Log patch generation from Surgeon
     */
    // Complexity: O(N)
    logPatchGenerated(patchId, vulnerabilityId, duration) {
        return this.logNexusEvent({
            eventType: 'patch_generated',
            source: 'surgeon',
            target: 'nexus',
            message: `🔧 Surgeon generated security patch for vulnerability ${vulnerabilityId}`,
            data: { patchId, vulnerabilityId },
            duration,
        });
    }
    /**
     * v26.0: Log patch validation result
     */
    // Complexity: O(1)
    logPatchValidated(patchId, vulnerabilityId, success) {
        return this.logNexusEvent({
            eventType: 'patch_validated',
            source: 'nexus',
            message: success
                ? `✅ Patch ${patchId} validated successfully`
                : `❌ Patch ${patchId} validation failed`,
            data: { patchId, vulnerabilityId },
        });
    }
    /**
     * v26.0: Log feedback cycle completion
     */
    // Complexity: O(N) — potential recursive descent
    logCycleComplete(cycleId, vulnerabilityId, patchValidated, duration) {
        return this.logNexusEvent({
            eventType: 'cycle_complete',
            source: 'nexus',
            message: `🔄 Feedback cycle ${cycleId} completed - Patch ${patchValidated ? 'VALIDATED' : 'FAILED'}`,
            data: { cycleId, vulnerabilityId },
            duration,
        });
    }
    /**
     * v26.0: Log Chronos fallback trigger
     */
    // Complexity: O(N) — potential recursive descent
    logFallbackTriggered(action, survivalProbability, fallbackType) {
        return this.logNexusEvent({
            eventType: 'fallback_triggered',
            source: 'chronos',
            message: `⚠️ Survival probability ${(survivalProbability * 100).toFixed(1)}% - switching to ${fallbackType} fallback`,
            data: { survivalProbability },
        });
    }
    /**
     * v26.0: Log thermal throttling event
     */
    // Complexity: O(1)
    logThermalThrottle(thermalState, estimatedTemp) {
        return this.logNexusEvent({
            eventType: 'thermal_throttle',
            source: 'nexus',
            message: `🌡️ Thermal state: ${thermalState.toUpperCase()} (${estimatedTemp}°C) - throttling enabled`,
            data: { thermalState },
        });
    }
    /**
     * v26.0: Get recent Nexus logs
     */
    // Complexity: O(1)
    getRecentNexusLogs(limit = 100) {
        return this.nexusLogBuffer.slice(-limit);
    }
    /**
     * v26.0: Get Nexus logs by event type
     */
    // Complexity: O(N) — linear iteration
    getNexusLogsByType(eventType, limit = 50) {
        return this.nexusLogBuffer.filter((log) => log.eventType === eventType).slice(-limit);
    }
    /**
     * v26.0: Get Nexus logs by source agent
     */
    // Complexity: O(N) — linear iteration
    getNexusLogsBySource(source, limit = 50) {
        return this.nexusLogBuffer.filter((log) => log.source === source).slice(-limit);
    }
    /**
     * v26.0: Clear Nexus log buffer
     */
    // Complexity: O(1)
    clearNexusLogs() {
        this.nexusLogBuffer = [];
        this.nexusLogSequence = 0;
    }
    /**
     * v26.0: Get Nexus collaboration statistics
     */
    // Complexity: O(N) — linear iteration
    getNexusStats() {
        return {
            totalLogs: this.nexusLogBuffer.length,
            vulnerabilitiesDetected: this.nexusLogBuffer.filter((l) => l.eventType === 'vulnerability_detected').length,
            testsGenerated: this.nexusLogBuffer.filter((l) => l.eventType === 'test_generated').length,
            patchesGenerated: this.nexusLogBuffer.filter((l) => l.eventType === 'patch_generated').length,
            patchesValidated: this.nexusLogBuffer.filter((l) => l.eventType === 'patch_validated').length,
            fallbacksTriggered: this.nexusLogBuffer.filter((l) => l.eventType === 'fallback_triggered')
                .length,
            thermalThrottles: this.nexusLogBuffer.filter((l) => l.eventType === 'thermal_throttle')
                .length,
        };
    }
}
exports.NeuralHUD = NeuralHUD;
// ═══════════════════════════════════════════════════════════════════════════════
// 📦 EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════
exports.default = NeuralHUD;
