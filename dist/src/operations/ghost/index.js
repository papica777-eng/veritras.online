"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                               ║
 * ║   QANTUM GHOST MODULE                                                         ║
 * ║   "Stealth Testing & Anti-Detection"                                          ║
 * ║                                                                               ║
 * ║   TODO B #21-24 - Ghost Protocol Complete                                     ║
 * ║                                                                               ║
 * ║   © 2025-2026 QAntum | Dimitar Prodromov                                        ║
 * ║                                                                               ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ghost = exports.getProxyChain = exports.ProxyChain = exports.getNetworkInterceptor = exports.NetworkInterceptor = exports.getAntiDetection = exports.AntiDetection = exports.getGhostProtocol = exports.SelectorObfuscator = exports.GhostProtocol = void 0;
exports.getGhost = getGhost;
// ═══════════════════════════════════════════════════════════════════════════════
// PROTOCOL
// ═══════════════════════════════════════════════════════════════════════════════
var protocol_1 = require("./protocol");
Object.defineProperty(exports, "GhostProtocol", { enumerable: true, get: function () { return protocol_1.GhostProtocol; } });
Object.defineProperty(exports, "SelectorObfuscator", { enumerable: true, get: function () { return protocol_1.SelectorObfuscator; } });
Object.defineProperty(exports, "getGhostProtocol", { enumerable: true, get: function () { return protocol_1.getGhostProtocol; } });
// ═══════════════════════════════════════════════════════════════════════════════
// ANTI-DETECTION
// ═══════════════════════════════════════════════════════════════════════════════
var anti_detection_1 = require("./anti-detection");
Object.defineProperty(exports, "AntiDetection", { enumerable: true, get: function () { return anti_detection_1.AntiDetection; } });
Object.defineProperty(exports, "getAntiDetection", { enumerable: true, get: function () { return anti_detection_1.getAntiDetection; } });
// ═══════════════════════════════════════════════════════════════════════════════
// NETWORK
// ═══════════════════════════════════════════════════════════════════════════════
var network_interceptor_1 = require("./network-interceptor");
Object.defineProperty(exports, "NetworkInterceptor", { enumerable: true, get: function () { return network_interceptor_1.NetworkInterceptor; } });
Object.defineProperty(exports, "getNetworkInterceptor", { enumerable: true, get: function () { return network_interceptor_1.getNetworkInterceptor; } });
// ═══════════════════════════════════════════════════════════════════════════════
// PROXY
// ═══════════════════════════════════════════════════════════════════════════════
var proxy_chain_1 = require("./proxy-chain");
Object.defineProperty(exports, "ProxyChain", { enumerable: true, get: function () { return proxy_chain_1.ProxyChain; } });
Object.defineProperty(exports, "getProxyChain", { enumerable: true, get: function () { return proxy_chain_1.getProxyChain; } });
// ═══════════════════════════════════════════════════════════════════════════════
// UNIFIED GHOST FACADE
// ═══════════════════════════════════════════════════════════════════════════════
const protocol_2 = require("./protocol");
const anti_detection_2 = require("./anti-detection");
const network_interceptor_2 = require("./network-interceptor");
const proxy_chain_2 = require("./proxy-chain");
class Ghost {
    protocol;
    antiDetection;
    network;
    proxy;
    constructor() {
        this.protocol = protocol_2.GhostProtocol.getInstance();
        this.antiDetection = anti_detection_2.AntiDetection.getInstance();
        this.network = network_interceptor_2.NetworkInterceptor.getInstance();
        this.proxy = proxy_chain_2.ProxyChain.getInstance();
    }
    /**
     * Start stealth session with anti-detection
     */
    // Complexity: O(1)
    start(level = 'medium') {
        // Apply anti-detection first
        this.antiDetection.applyAll();
        // Start ghost session
        return this.protocol.startSession(level);
    }
    /**
     * Execute action in stealth mode
     */
    async execute(sessionId, action, name) {
        return this.protocol.executeStealthAction(sessionId, action, name);
    }
    /**
     * End session
     */
    // Complexity: O(1)
    end(sessionId) {
        this.protocol.endSession(sessionId);
    }
    /**
     * Check current stealth status
     */
    // Complexity: O(1)
    getStatus(sessionId) {
        return {
            riskLevel: this.antiDetection.getOverallRisk(),
            risks: this.antiDetection.assessRisk(),
            session: sessionId ? this.protocol.getSession(sessionId) : undefined,
        };
    }
    /**
     * Get browser launch configuration
     */
    // Complexity: O(1)
    getBrowserConfig(proxyPoolId) {
        return {
            args: this.antiDetection.getBrowserArgs(),
            contextOptions: this.antiDetection.getContextOptions(),
            proxy: proxyPoolId ? this.proxy.getPlaywrightConfig(proxyPoolId) : undefined,
        };
    }
    // ─────────────────────────────────────────────────────────────────────────
    // NETWORK SHORTCUTS
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Mock API endpoint
     */
    // Complexity: O(1)
    mockApi(endpoint, data, options) {
        this.network.enable();
        return this.network.mockApi(endpoint, data, options);
    }
    /**
     * Block requests to pattern
     */
    // Complexity: O(1)
    blockRequests(pattern) {
        this.network.enable();
        return this.network.block(pattern);
    }
    /**
     * Start recording network traffic
     */
    // Complexity: O(1)
    startRecording() {
        this.network.enable();
        this.network.startRecording();
    }
    /**
     * Stop recording and get traffic
     */
    // Complexity: O(1)
    stopRecording() {
        return this.network.stopRecording();
    }
    // ─────────────────────────────────────────────────────────────────────────
    // PROXY SHORTCUTS
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Create proxy pool
     */
    // Complexity: O(1)
    createProxyPool(name, proxies) {
        this.proxy.enable();
        return this.proxy.createPool(name, proxies);
    }
    /**
     * Get proxy URL for pool
     */
    // Complexity: O(1)
    getProxyUrl(poolId) {
        return this.proxy.getProxyUrl(poolId);
    }
}
exports.Ghost = Ghost;
// Singleton
let ghostInstance = null;
function getGhost() {
    if (!ghostInstance) {
        ghostInstance = new Ghost();
    }
    return ghostInstance;
}
exports.default = Ghost;
