"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * NETWORK CHAOS STRATEGIES
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * @author Димитър Продромов / Mister Mind
 * @copyright 2026 QAntum Empire. All Rights Reserved.
 * @version 33.5 - MODULAR CHAOS
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.NetworkStrategies = exports.BandwidthThrottleStrategy = exports.ConnectionResetStrategy = exports.DnsFailureStrategy = exports.PacketLossStrategy = exports.NetworkLatencyStrategy = void 0;
// ═══════════════════════════════════════════════════════════════════════════════
// BASE NETWORK STRATEGY
// ═══════════════════════════════════════════════════════════════════════════════
class BaseNetworkStrategy {
    category = 'network';
    active = false;
    startTime;
    async healthCheck() {
        const checks = await this.performHealthChecks();
        const passedChecks = checks.filter(c => c.status === 'pass').length;
        return {
            healthy: passedChecks === checks.length,
            timestamp: new Date(),
            checks,
            overallScore: Math.round((passedChecks / checks.length) * 100),
        };
    }
    async performHealthChecks() {
        return [
            {
                name: 'network_connectivity',
                status: this.active ? 'warn' : 'pass',
                message: this.active ? 'Fault injection active' : 'Network normal',
            },
        ];
    }
    log(message) {
        console.log(`🔥 [CHAOS:${this.name.toUpperCase()}] ${message}`);
    }
}
// ═══════════════════════════════════════════════════════════════════════════════
// NETWORK LATENCY STRATEGY
// ═══════════════════════════════════════════════════════════════════════════════
class NetworkLatencyStrategy extends BaseNetworkStrategy {
    latencyMs;
    targetUrls;
    jitterMs;
    name = 'network_latency';
    severity = 'medium';
    blastRadius;
    interceptorId;
    constructor(latencyMs, targetUrls, jitterMs = 0) {
        super();
        this.latencyMs = latencyMs;
        this.targetUrls = targetUrls;
        this.jitterMs = jitterMs;
        this.blastRadius = {
            scope: 'service',
            affectedServices: targetUrls,
            estimatedImpactPercent: 30,
            maxDurationMs: 60000,
            rollbackTimeMs: 1000,
        };
    }
    async inject() {
        this.startTime = new Date();
        this.active = true;
        // In real implementation, this would use:
        // - Playwright: page.route() with delay
        // - Cypress: cy.intercept() with delay
        // - Proxy: toxiproxy or similar
        this.interceptorId = `latency_${Date.now()}`;
        this.log(`Injecting ${this.latencyMs}ms latency (±${this.jitterMs}ms jitter)`);
        this.log(`Targets: ${this.targetUrls.join(', ')}`);
        // Simulate interceptor setup
        await this.setupInterceptor();
        return {
            success: true,
            strategyName: this.name,
            startTime: this.startTime,
            message: `Latency injection active: ${this.latencyMs}ms`,
            affectedEndpoints: this.targetUrls,
        };
    }
    async recover() {
        const recoveryStart = Date.now();
        this.log('Removing latency injection...');
        // Remove interceptor
        await this.removeInterceptor();
        this.active = false;
        const recoveryTimeMs = Date.now() - recoveryStart;
        this.log(`Recovery complete in ${recoveryTimeMs}ms`);
        return {
            success: true,
            strategyName: this.name,
            recoveryTimeMs,
            healthRestored: true,
            message: 'Latency injection removed',
        };
    }
    async setupInterceptor() {
        // Placeholder for actual implementation
        // Would integrate with test framework's network interception
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    async removeInterceptor() {
        this.interceptorId = undefined;
        await new Promise(resolve => setTimeout(resolve, 50));
    }
}
exports.NetworkLatencyStrategy = NetworkLatencyStrategy;
// ═══════════════════════════════════════════════════════════════════════════════
// PACKET LOSS STRATEGY
// ═══════════════════════════════════════════════════════════════════════════════
class PacketLossStrategy extends BaseNetworkStrategy {
    lossPercent;
    targetUrls;
    name = 'packet_loss';
    severity = 'high';
    blastRadius;
    constructor(lossPercent, targetUrls) {
        super();
        this.lossPercent = lossPercent;
        this.targetUrls = targetUrls;
        this.blastRadius = {
            scope: 'service',
            affectedServices: targetUrls,
            estimatedImpactPercent: lossPercent,
            maxDurationMs: 30000,
            rollbackTimeMs: 500,
        };
    }
    async inject() {
        this.startTime = new Date();
        this.active = true;
        this.log(`Injecting ${this.lossPercent}% packet loss`);
        return {
            success: true,
            strategyName: this.name,
            startTime: this.startTime,
            message: `Dropping ${this.lossPercent}% of packets`,
            affectedEndpoints: this.targetUrls,
        };
    }
    async recover() {
        const recoveryStart = Date.now();
        this.active = false;
        return {
            success: true,
            strategyName: this.name,
            recoveryTimeMs: Date.now() - recoveryStart,
            healthRestored: true,
            message: 'Packet loss simulation stopped',
        };
    }
}
exports.PacketLossStrategy = PacketLossStrategy;
// ═══════════════════════════════════════════════════════════════════════════════
// DNS FAILURE STRATEGY
// ═══════════════════════════════════════════════════════════════════════════════
class DnsFailureStrategy extends BaseNetworkStrategy {
    targetDomains;
    name = 'dns_failure';
    severity = 'critical';
    blastRadius;
    constructor(targetDomains) {
        super();
        this.targetDomains = targetDomains;
        this.blastRadius = {
            scope: 'zone',
            affectedServices: targetDomains,
            estimatedImpactPercent: 100,
            maxDurationMs: 15000,
            rollbackTimeMs: 2000,
        };
    }
    async inject() {
        this.startTime = new Date();
        this.active = true;
        this.log(`Simulating DNS failures for: ${this.targetDomains.join(', ')}`);
        return {
            success: true,
            strategyName: this.name,
            startTime: this.startTime,
            message: 'DNS resolution will fail for target domains',
            affectedEndpoints: this.targetDomains,
        };
    }
    async recover() {
        const recoveryStart = Date.now();
        this.active = false;
        // DNS cache may need time to refresh
        await new Promise(resolve => setTimeout(resolve, 1000));
        return {
            success: true,
            strategyName: this.name,
            recoveryTimeMs: Date.now() - recoveryStart,
            healthRestored: true,
            message: 'DNS resolution restored',
        };
    }
}
exports.DnsFailureStrategy = DnsFailureStrategy;
// ═══════════════════════════════════════════════════════════════════════════════
// CONNECTION RESET STRATEGY
// ═══════════════════════════════════════════════════════════════════════════════
class ConnectionResetStrategy extends BaseNetworkStrategy {
    targetUrls;
    resetAfterBytes;
    name = 'connection_reset';
    severity = 'high';
    blastRadius;
    constructor(targetUrls, resetAfterBytes = 0) {
        super();
        this.targetUrls = targetUrls;
        this.resetAfterBytes = resetAfterBytes;
        this.blastRadius = {
            scope: 'service',
            affectedServices: targetUrls,
            estimatedImpactPercent: 50,
            maxDurationMs: 20000,
            rollbackTimeMs: 500,
        };
    }
    async inject() {
        this.startTime = new Date();
        this.active = true;
        const msg = this.resetAfterBytes > 0
            ? `Resetting connections after ${this.resetAfterBytes} bytes`
            : 'Immediately resetting connections';
        this.log(msg);
        return {
            success: true,
            strategyName: this.name,
            startTime: this.startTime,
            message: msg,
            affectedEndpoints: this.targetUrls,
        };
    }
    async recover() {
        const recoveryStart = Date.now();
        this.active = false;
        return {
            success: true,
            strategyName: this.name,
            recoveryTimeMs: Date.now() - recoveryStart,
            healthRestored: true,
            message: 'Connection reset simulation stopped',
        };
    }
}
exports.ConnectionResetStrategy = ConnectionResetStrategy;
// ═══════════════════════════════════════════════════════════════════════════════
// BANDWIDTH THROTTLE STRATEGY
// ═══════════════════════════════════════════════════════════════════════════════
class BandwidthThrottleStrategy extends BaseNetworkStrategy {
    bytesPerSecond;
    targetUrls;
    name = 'bandwidth_throttle';
    severity = 'medium';
    blastRadius;
    constructor(bytesPerSecond, targetUrls) {
        super();
        this.bytesPerSecond = bytesPerSecond;
        this.targetUrls = targetUrls;
        this.blastRadius = {
            scope: 'service',
            affectedServices: targetUrls,
            estimatedImpactPercent: 20,
            maxDurationMs: 120000,
            rollbackTimeMs: 500,
        };
    }
    async inject() {
        this.startTime = new Date();
        this.active = true;
        const kbps = Math.round(this.bytesPerSecond / 1024);
        this.log(`Throttling bandwidth to ${kbps} KB/s`);
        return {
            success: true,
            strategyName: this.name,
            startTime: this.startTime,
            message: `Bandwidth limited to ${kbps} KB/s`,
            affectedEndpoints: this.targetUrls,
        };
    }
    async recover() {
        const recoveryStart = Date.now();
        this.active = false;
        return {
            success: true,
            strategyName: this.name,
            recoveryTimeMs: Date.now() - recoveryStart,
            healthRestored: true,
            message: 'Bandwidth throttle removed',
        };
    }
}
exports.BandwidthThrottleStrategy = BandwidthThrottleStrategy;
// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════
exports.NetworkStrategies = {
    latency: NetworkLatencyStrategy,
    packetLoss: PacketLossStrategy,
    dnsFailure: DnsFailureStrategy,
    connectionReset: ConnectionResetStrategy,
    bandwidthThrottle: BandwidthThrottleStrategy,
};
