"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 👻 GHOST MODULE - Unified Stealth System Export
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * The Ghost Module unifies all stealth capabilities into a single, coherent API.
 * This is the entry point for all anti-detection and anonymity features.
 *
 * @author Dimitar Prodromov
 * @version 17.0.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ghost = exports.ProxyChain = exports.NetworkInterceptor = exports.AntiDetection = exports.GhostProtocol = void 0;
var protocol_1 = require("./protocol");
Object.defineProperty(exports, "GhostProtocol", { enumerable: true, get: function () { return protocol_1.GhostProtocol; } });
var anti_detection_1 = require("./anti-detection");
Object.defineProperty(exports, "AntiDetection", { enumerable: true, get: function () { return anti_detection_1.AntiDetection; } });
var network_interceptor_1 = require("./network-interceptor");
Object.defineProperty(exports, "NetworkInterceptor", { enumerable: true, get: function () { return network_interceptor_1.NetworkInterceptor; } });
var proxy_chain_1 = require("./proxy-chain");
Object.defineProperty(exports, "ProxyChain", { enumerable: true, get: function () { return proxy_chain_1.ProxyChain; } });
// ═══════════════════════════════════════════════════════════════════════════════════════
// 🎯 UNIFIED GHOST FACADE
// ═══════════════════════════════════════════════════════════════════════════════════════
const protocol_2 = require("./protocol");
const anti_detection_2 = require("./anti-detection");
const network_interceptor_2 = require("./network-interceptor");
const proxy_chain_2 = require("./proxy-chain");
/**
 * Unified Ghost System - Combines all stealth modules
 *
 * Provides a single interface for complete anonymity and anti-detection.
 */
class Ghost {
    protocol;
    antiDetection;
    networkInterceptor;
    proxyChain;
    initialized = false;
    constructor() {
        this.protocol = new protocol_2.GhostProtocol();
        this.antiDetection = new anti_detection_2.AntiDetection();
        this.networkInterceptor = new network_interceptor_2.NetworkInterceptor();
        this.proxyChain = new proxy_chain_2.ProxyChain();
    }
    /**
     * Initialize all ghost systems with specified stealth level
     */
    // Complexity: O(1) — amortized
    initialize(level = 'standard') {
        // Enable ghost protocol
        this.protocol.enable(level);
        // Configure anti-detection based on level
        const fingerprintConfig = this.getFingerprintConfigForLevel(level);
        this.antiDetection.randomizeFingerprint(fingerprintConfig);
        // Configure network obfuscation
        const networkConfig = this.getNetworkConfigForLevel(level);
        this.networkInterceptor.obfuscatePatterns(networkConfig);
        // Configure proxy chain
        this.proxyChain.configure({
            hops: level === 'ghost' ? 5 : level === 'paranoid' ? 4 : 3,
            rotation: 'auto',
            rotationInterval: level === 'ghost' ? 60000 : 300000,
        });
        this.initialized = true;
    }
    /**
     * Get fingerprint configuration based on stealth level
     */
    // Complexity: O(1) — hash/map lookup
    getFingerprintConfigForLevel(level) {
        const configs = {
            minimal: {
                userAgent: true,
                canvas: false,
                webGL: false,
                fonts: false,
                plugins: false,
                timezone: true,
                language: true,
                screen: false,
            },
            standard: {
                userAgent: true,
                canvas: true,
                webGL: true,
                fonts: true,
                plugins: false,
                timezone: true,
                language: true,
                screen: true,
            },
            paranoid: {
                userAgent: true,
                canvas: true,
                webGL: true,
                fonts: true,
                plugins: true,
                timezone: true,
                language: true,
                screen: true,
                hardwareConcurrency: true,
                deviceMemory: true,
            },
            ghost: {
                userAgent: true,
                canvas: true,
                webGL: true,
                fonts: true,
                plugins: true,
                timezone: true,
                language: true,
                screen: true,
                hardwareConcurrency: true,
                deviceMemory: true,
                audioContext: true,
            },
        };
        return configs[level];
    }
    /**
     * Get network configuration based on stealth level
     */
    // Complexity: O(1) — hash/map lookup
    getNetworkConfigForLevel(level) {
        const configs = {
            minimal: {
                timing: true,
                headers: false,
                payloadSize: false,
                compression: false,
            },
            standard: {
                timing: true,
                headers: true,
                payloadSize: false,
                compression: true,
            },
            paranoid: {
                timing: true,
                headers: true,
                payloadSize: true,
                compression: true,
            },
            ghost: {
                timing: true,
                headers: true,
                payloadSize: true,
                compression: true,
                tlsFingerprint: true,
            },
        };
        return configs[level];
    }
    /**
     * Enable anti-detection features
     */
    // Complexity: O(1)
    enableAntiDetection() {
        if (!this.initialized) {
            this.initialize('standard');
        }
    }
    /**
     * Get comprehensive status report
     */
    // Complexity: O(1)
    getStatus() {
        return {
            initialized: this.initialized,
            protocol: this.protocol.getStatistics(),
            antiDetection: {
                profile: this.antiDetection.getProfile(),
                rating: this.antiDetection.getResistanceRating(),
            },
            network: this.networkInterceptor.getStatistics(),
            proxy: this.proxyChain.getChainInfo(),
        };
    }
    /**
     * Force complete identity refresh
     */
    // Complexity: O(1)
    refreshIdentity() {
        this.protocol.forceMutation();
        this.antiDetection.mutateOnRisk('medium');
        this.proxyChain.rotate();
    }
    /**
     * Clean up all resources
     */
    // Complexity: O(1)
    destroy() {
        this.protocol.destroy();
        this.antiDetection.destroy();
        this.networkInterceptor.destroy();
        this.proxyChain.destroy();
        this.initialized = false;
    }
}
exports.Ghost = Ghost;
exports.default = Ghost;
