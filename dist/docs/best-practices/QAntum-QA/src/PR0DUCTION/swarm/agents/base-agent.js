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
 * For licensing inquiries: dimitar.prodromov@QAntum.dev
 * ═══════════════════════════════════════════════════════════════════════════════
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseAgent = void 0;
const id_generator_1 = require("../utils/id-generator");
/**
 * Abstract base class for swarm agents
 */
class BaseAgent {
    /** Agent configuration */
    config;
    /** Current status */
    status = 'idle';
    /** Message queue */
    messageQueue = [];
    /** Event listeners */
    listeners = new Map();
    /** Start time */
    startTime;
    /** Processed message count */
    processedMessages = 0;
    /** Error count */
    errorCount = 0;
    constructor(config) {
        this.config = {
            id: config.id || (0, id_generator_1.generateAgentId)(),
            role: config.role,
            model: config.model || this.getDefaultModel(config.role),
            env: config.env || this.getDefaultEnv(config.role),
            endpoint: config.endpoint,
            apiKey: config.apiKey,
            maxTokens: config.maxTokens || 4096,
            temperature: config.temperature || 0.7,
            timeout: config.timeout || 30000,
            verbose: config.verbose || false,
        };
        this.startTime = new Date();
    }
    /**
     * Get default model based on role
     */
    getDefaultModel(role) {
        switch (role) {
            case 'planner':
                return 'claude-3-5-sonnet';
            case 'executor':
                return 'gemma-7b';
            case 'critic':
                return 'gemini-flash';
            case 'orchestrator':
                return 'internal';
            default:
                return 'gpt-4o-mini';
        }
    }
    /**
     * Get default environment based on role
     */
    getDefaultEnv(role) {
        switch (role) {
            case 'planner':
                return 'cloud';
            case 'executor':
                return 'local';
            case 'critic':
                return 'cloud';
            case 'orchestrator':
                return 'local';
            default:
                return 'hybrid';
        }
    }
    /**
     * Get agent ID
     */
    get id() {
        return this.config.id;
    }
    /**
     * Get agent role
     */
    get role() {
        return this.config.role;
    }
    /**
     * Get current status
     */
    getStatus() {
        return this.status;
    }
    /**
     * Set status
     */
    setStatus(status) {
        const oldStatus = this.status;
        this.status = status;
        this.emit('statusChange', { agent: this.id, from: oldStatus, to: status });
    }
    /**
     * Get agent info
     */
    getInfo() {
        return { ...this.config, status: this.status };
    }
    /**
     * Receive a message
     */
    receiveMessage(message) {
        this.messageQueue.push(message);
        this.emit('messageReceived', message);
        if (this.config.verbose) {
            console.log(`[${this.id}] Received message from ${message.from}: ${message.type}`);
        }
    }
    /**
     * Create a message to send
     */
    createMessage(to, type, payload, traceId, parentSpanId, priority = 'normal') {
        return {
            id: (0, id_generator_1.generateMessageId)(),
            traceId,
            spanId: (0, id_generator_1.generateSpanId)(),
            parentSpanId,
            from: this.id,
            to,
            type,
            priority,
            payload,
            timestamp: new Date(),
        };
    }
    /**
     * Process next message in queue
     */
    async processNextMessage() {
        if (this.messageQueue.length === 0) {
            return null;
        }
        // Sort by priority
        this.messageQueue.sort((a, b) => {
            const priorityOrder = { critical: 0, high: 1, normal: 2, low: 3 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        });
        const message = this.messageQueue.shift();
        this.setStatus('working');
        try {
            const result = await this.handleMessage(message);
            this.processedMessages++;
            this.setStatus('idle');
            return result;
        }
        catch (error) {
            this.errorCount++;
            this.setStatus('error');
            this.emit('error', { agent: this.id, message, error });
            throw error;
        }
    }
    /**
     * Add event listener
     */
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }
    /**
     * Remove event listener
     */
    off(event, callback) {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }
    /**
     * Emit an event
     */
    emit(event, data) {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            for (const callback of callbacks) {
                try {
                    callback(data);
                }
                catch (error) {
                    console.error(`[${this.id}] Error in event callback:`, error);
                }
            }
        }
    }
    /**
     * Get statistics
     */
    getStats() {
        return {
            id: this.id,
            role: this.role,
            status: this.status,
            processedMessages: this.processedMessages,
            errorCount: this.errorCount,
            uptime: Date.now() - this.startTime.getTime(),
            queueLength: this.messageQueue.length,
        };
    }
    /**
     * Log if verbose mode
     */
    log(message, ...args) {
        if (this.config.verbose) {
            console.log(`[${this.id}] ${message}`, ...args);
        }
    }
    /**
     * Shutdown the agent
     */
    async shutdown() {
        this.setStatus('completed');
        this.messageQueue = [];
        this.emit('shutdown', { agent: this.id });
        this.log('Agent shutdown complete');
    }
}
exports.BaseAgent = BaseAgent;
exports.default = BaseAgent;
