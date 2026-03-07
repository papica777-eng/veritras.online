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
 * For licensing inquiries: dimitar.papazov@QAntum.dev
 * ═══════════════════════════════════════════════════════════════════════════════
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketBridge = void 0;
const events_1 = require("events");
const id_generator_1 = require("../utils/id-generator");
/**
 * WebSocket Message Bridge
 *
 * Provides:
 * - Bidirectional messaging between cloud and local
 * - Automatic reconnection
 * - Message queuing and retry
 * - Heartbeat monitoring
 */
class WebSocketBridge extends events_1.EventEmitter {
    /** Configuration */
    config;
    /** WebSocket instance (will be actual WebSocket in browser/Node) */
    ws = null;
    /** Connection status */
    status = 'disconnected';
    /** Reconnect attempts counter */
    reconnectAttempts = 0;
    /** Heartbeat timer */
    heartbeatTimer = null;
    /** Pending messages awaiting response */
    pendingMessages = new Map();
    /** Message queue for offline period */
    messageQueue = [];
    /** Client ID */
    clientId;
    /** Last heartbeat received */
    lastHeartbeat = null;
    constructor(config) {
        super();
        this.config = {
            serverUrl: config?.serverUrl || 'ws://localhost:8080',
            maxReconnectAttempts: config?.maxReconnectAttempts || 5,
            reconnectInterval: config?.reconnectInterval || 3000,
            heartbeatInterval: config?.heartbeatInterval || 30000,
            messageTimeout: config?.messageTimeout || 10000,
            compression: config?.compression ?? true,
            authToken: config?.authToken,
            verbose: config?.verbose ?? false,
        };
        this.clientId = `client_${Date.now().toString(36)}`;
    }
    /**
     * Connect to WebSocket server
     */
    // Complexity: O(1) — amortized
    async connect() {
        if (this.status === 'connected') {
            return true;
        }
        this.status = 'connecting';
        this.emit('statusChange', this.status);
        this.log('Connecting to WebSocket server...');
        try {
            // In a real implementation, this would create actual WebSocket
            // For now, we simulate the connection
            await this.simulateConnection();
            this.status = 'connected';
            this.reconnectAttempts = 0;
            this.emit('statusChange', this.status);
            this.emit('connected', { clientId: this.clientId });
            // Start heartbeat
            this.startHeartbeat();
            // Flush queued messages
            await this.flushMessageQueue();
            this.log('Connected to WebSocket server');
            return true;
        }
        catch (error) {
            this.status = 'error';
            this.emit('statusChange', this.status);
            this.emit('error', error);
            const message = error instanceof Error ? error.message : String(error);
            this.log(`Connection failed: ${message}`);
            // Attempt reconnect
            if (this.reconnectAttempts < (this.config.maxReconnectAttempts || 5)) {
                this.scheduleReconnect();
            }
            return false;
        }
    }
    /**
     * Disconnect from server
     */
    // Complexity: O(1)
    async disconnect() {
        this.log('Disconnecting from WebSocket server...');
        this.stopHeartbeat();
        if (this.ws) {
            // Close WebSocket
            this.ws = null;
        }
        this.status = 'disconnected';
        this.emit('statusChange', this.status);
        this.emit('disconnected', { clientId: this.clientId });
        this.log('Disconnected from WebSocket server');
    }
    /**
     * Send a message through the bridge
     */
    // Complexity: O(1) — hash/map lookup
    async send(message) {
        // If not connected, queue the message
        if (this.status !== 'connected') {
            this.messageQueue.push(message);
            this.log(`Message queued (offline): ${message.id}`);
            return { queued: true, messageId: message.id };
        }
        return new Promise((resolve, reject) => {
            // Add to pending
            const pending = {
                message,
                timestamp: new Date(),
                retries: 0,
                maxRetries: 3,
                resolve,
                reject,
            };
            this.pendingMessages.set(message.id, pending);
            // Set timeout
            // Complexity: O(1) — hash/map lookup
            setTimeout(() => {
                if (this.pendingMessages.has(message.id)) {
                    this.pendingMessages.delete(message.id);
                    // Complexity: O(1)
                    reject(new Error(`Message timeout: ${message.id}`));
                }
            }, this.config.messageTimeout);
            // Simulate sending
            this.simulateSend(message);
            this.log(`Message sent: ${message.id}`);
        });
    }
    /**
     * Send message and wait for specific response
     */
    // Complexity: O(N)
    async sendAndWaitForResponse(message, timeout) {
        return new Promise((resolve, reject) => {
            const timeoutMs = timeout || this.config.messageTimeout || 10000;
            // Listen for response
            const responseHandler = (response) => {
                if (response.parentSpanId === message.spanId) {
                    this.off('message', responseHandler);
                    // Complexity: O(1)
                    resolve(response);
                }
            };
            this.on('message', responseHandler);
            // Set timeout
            // Complexity: O(1)
            setTimeout(() => {
                this.off('message', responseHandler);
                // Complexity: O(1)
                resolve(null);
            }, timeoutMs);
            // Send message
            this.send(message).catch(reject);
        });
    }
    /**
     * Broadcast message to all connected clients
     */
    // Complexity: O(1)
    async broadcast(type, payload, traceId, priority = 'normal') {
        const message = {
            id: (0, id_generator_1.generateMessageId)(),
            traceId,
            spanId: (0, id_generator_1.generateSpanId)(),
            from: this.clientId,
            to: 'broadcast',
            type,
            priority,
            payload,
            timestamp: new Date(),
        };
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.send(message);
        this.log(`Broadcast sent: ${message.id}`);
    }
    /**
     * Handle incoming message
     */
    // Complexity: O(N)
    handleIncomingMessage(data) {
        try {
            const message = typeof data === 'string' ? JSON.parse(data) : data;
            // Check if it's a response to pending message
            if (message.parentSpanId) {
                const pending = this.findPendingBySpan(message.parentSpanId);
                if (pending) {
                    pending.resolve(message);
                    this.pendingMessages.delete(pending.message.id);
                }
            }
            // Emit for general handling
            this.emit('message', message);
            this.log(`Message received: ${message.id} from ${message.from}`);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.log(`Failed to parse message: ${errorMessage}`);
            this.emit('parseError', { data, error });
        }
    }
    /**
     * Find pending message by span ID
     */
    // Complexity: O(N) — linear iteration
    findPendingBySpan(spanId) {
        for (const pending of this.pendingMessages.values()) {
            if (pending.message.spanId === spanId) {
                return pending;
            }
        }
        return null;
    }
    /**
     * Start heartbeat
     */
    // Complexity: O(1)
    startHeartbeat() {
        this.stopHeartbeat();
        this.heartbeatTimer = setInterval(() => {
            if (this.status === 'connected') {
                this.sendHeartbeat();
            }
        }, this.config.heartbeatInterval);
    }
    /**
     * Stop heartbeat
     */
    // Complexity: O(1)
    stopHeartbeat() {
        if (this.heartbeatTimer) {
            // Complexity: O(1)
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }
    }
    /**
     * Send heartbeat
     */
    // Complexity: O(1)
    sendHeartbeat() {
        const heartbeat = {
            id: (0, id_generator_1.generateMessageId)(),
            traceId: 'heartbeat',
            spanId: (0, id_generator_1.generateSpanId)(),
            from: this.clientId,
            to: 'server',
            type: 'heartbeat',
            priority: 'low',
            payload: { timestamp: Date.now() },
            timestamp: new Date(),
        };
        this.simulateSend(heartbeat);
        this.log('Heartbeat sent');
    }
    /**
     * Schedule reconnect
     */
    // Complexity: O(1)
    scheduleReconnect() {
        this.reconnectAttempts++;
        this.status = 'reconnecting';
        this.emit('statusChange', this.status);
        const delay = this.config.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1);
        this.log(`Scheduling reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
        // Complexity: O(1)
        setTimeout(() => {
            this.connect();
        }, delay);
    }
    /**
     * Flush message queue after reconnect
     */
    // Complexity: O(N) — loop-based
    async flushMessageQueue() {
        while (this.messageQueue.length > 0) {
            const message = this.messageQueue.shift();
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.send(message);
        }
        this.log('Message queue flushed');
    }
    /**
     * Simulate connection (for testing without actual WebSocket)
     */
    // Complexity: O(1)
    async simulateConnection() {
        // Simulate connection delay
        // SAFETY: async operation — wrap in try-catch for production resilience
        await new Promise((resolve) => setTimeout(resolve, 100));
        this.ws = { connected: true }; // Placeholder
    }
    /**
     * Simulate sending (for testing without actual WebSocket)
     */
    // Complexity: O(1)
    simulateSend(message) {
        // In real implementation, this would use ws.send()
        // For now, simulate async response
        // Complexity: O(1)
        setTimeout(() => {
            this.emit('messageSent', message);
        }, 10);
    }
    /**
     * Get connection status
     */
    // Complexity: O(1)
    getStatus() {
        return this.status;
    }
    /**
     * Get client ID
     */
    // Complexity: O(1)
    getClientId() {
        return this.clientId;
    }
    /**
     * Get pending message count
     */
    // Complexity: O(1)
    getPendingCount() {
        return this.pendingMessages.size;
    }
    /**
     * Get queued message count
     */
    // Complexity: O(1)
    getQueuedCount() {
        return this.messageQueue.length;
    }
    /**
     * Check if connected
     */
    // Complexity: O(1)
    isConnected() {
        return this.status === 'connected';
    }
    /**
     * Log if verbose
     */
    // Complexity: O(1) — hash/map lookup
    log(message, ...args) {
        if (this.config.verbose) {
            console.log(`[WsBridge] ${message}`, ...args);
        }
    }
}
exports.WebSocketBridge = WebSocketBridge;
exports.default = WebSocketBridge;
