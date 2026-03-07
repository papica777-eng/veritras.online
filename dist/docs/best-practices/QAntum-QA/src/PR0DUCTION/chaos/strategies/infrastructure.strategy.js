"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * INFRASTRUCTURE CHAOS STRATEGIES
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * @author Димитър Продромов / Mister Mind
 * @copyright 2026 QAntum Empire. All Rights Reserved.
 * @version 33.5 - MODULAR CHAOS
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.InfrastructureStrategies = exports.CacheInvalidationStrategy = exports.DatabaseFailoverStrategy = exports.DependencyTimeoutStrategy = exports.ZoneFailureStrategy = exports.NodeCrashStrategy = void 0;
// ═══════════════════════════════════════════════════════════════════════════════
// BASE INFRASTRUCTURE STRATEGY
// ═══════════════════════════════════════════════════════════════════════════════
class BaseInfrastructureStrategy {
    category = 'infrastructure';
    active = false;
    startTime;
    async healthCheck() {
        return {
            healthy: !this.active,
            timestamp: new Date(),
            checks: [
                {
                    name: 'infrastructure_state',
                    status: this.active ? 'fail' : 'pass',
                    message: this.active ? 'Infrastructure fault active' : 'Infrastructure healthy',
                },
            ],
            overallScore: this.active ? 0 : 100,
        };
    }
    log(message) {
        console.log(`🔥 [CHAOS:${this.name.toUpperCase()}] ${message}`);
    }
}
// ═══════════════════════════════════════════════════════════════════════════════
// NODE CRASH STRATEGY
// ═══════════════════════════════════════════════════════════════════════════════
class NodeCrashStrategy extends BaseInfrastructureStrategy {
    targetNodes;
    crashType;
    name = 'node_crash';
    severity = 'critical';
    blastRadius;
    constructor(targetNodes, crashType = 'graceful') {
        super();
        this.targetNodes = targetNodes;
        this.crashType = crashType;
        this.blastRadius = {
            scope: 'zone',
            affectedServices: targetNodes,
            estimatedImpactPercent: 100,
            maxDurationMs: 5000,
            rollbackTimeMs: 30000, // Time for restart
        };
    }
    async inject() {
        this.startTime = new Date();
        this.active = true;
        this.log(`Simulating ${this.crashType} crash for nodes: ${this.targetNodes.join(', ')}`);
        // In production, would send kill signal to target containers/processes
        // Using Kubernetes API, Docker API, or SSH
        return {
            success: true,
            strategyName: this.name,
            startTime: this.startTime,
            message: `Node crash simulation (${this.crashType}) active`,
        };
    }
    async recover() {
        const recoveryStart = Date.now();
        this.log('Initiating node recovery...');
        // Simulate restart time
        await new Promise(resolve => setTimeout(resolve, 2000));
        this.active = false;
        return {
            success: true,
            strategyName: this.name,
            recoveryTimeMs: Date.now() - recoveryStart,
            healthRestored: true,
            message: 'Nodes restarted successfully',
        };
    }
}
exports.NodeCrashStrategy = NodeCrashStrategy;
// ═══════════════════════════════════════════════════════════════════════════════
// ZONE FAILURE STRATEGY
// ═══════════════════════════════════════════════════════════════════════════════
class ZoneFailureStrategy extends BaseInfrastructureStrategy {
    zoneName;
    servicesInZone;
    name = 'zone_failure';
    severity = 'critical';
    blastRadius;
    constructor(zoneName, servicesInZone) {
        super();
        this.zoneName = zoneName;
        this.servicesInZone = servicesInZone;
        this.blastRadius = {
            scope: 'zone',
            affectedServices: servicesInZone,
            estimatedImpactPercent: 100,
            maxDurationMs: 60000,
            rollbackTimeMs: 60000,
        };
    }
    async inject() {
        this.startTime = new Date();
        this.active = true;
        this.log(`Simulating complete failure of zone: ${this.zoneName}`);
        this.log(`Affected services: ${this.servicesInZone.join(', ')}`);
        return {
            success: true,
            strategyName: this.name,
            startTime: this.startTime,
            message: `Zone ${this.zoneName} marked as failed`,
            affectedEndpoints: this.servicesInZone,
        };
    }
    async recover() {
        const recoveryStart = Date.now();
        this.log(`Restoring zone: ${this.zoneName}`);
        this.active = false;
        return {
            success: true,
            strategyName: this.name,
            recoveryTimeMs: Date.now() - recoveryStart,
            healthRestored: true,
            message: `Zone ${this.zoneName} restored`,
        };
    }
}
exports.ZoneFailureStrategy = ZoneFailureStrategy;
// ═══════════════════════════════════════════════════════════════════════════════
// DEPENDENCY TIMEOUT STRATEGY
// ═══════════════════════════════════════════════════════════════════════════════
class DependencyTimeoutStrategy extends BaseInfrastructureStrategy {
    dependencyName;
    timeoutMs;
    name = 'dependency_timeout';
    severity = 'high';
    blastRadius;
    constructor(dependencyName, timeoutMs = 30000) {
        super();
        this.dependencyName = dependencyName;
        this.timeoutMs = timeoutMs;
        this.blastRadius = {
            scope: 'service',
            affectedServices: [dependencyName],
            estimatedImpactPercent: 80,
            maxDurationMs: 30000,
            rollbackTimeMs: 1000,
        };
    }
    async inject() {
        this.startTime = new Date();
        this.active = true;
        this.log(`${this.dependencyName} will timeout after ${this.timeoutMs}ms`);
        return {
            success: true,
            strategyName: this.name,
            startTime: this.startTime,
            message: `Dependency timeout active: ${this.dependencyName}`,
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
            message: `${this.dependencyName} responding normally`,
        };
    }
    /**
     * Simulate timeout for dependency call
     */
    async simulateCall(actualCall) {
        if (!this.active) {
            return actualCall();
        }
        // Race between actual call and timeout
        return Promise.race([
            actualCall(),
            new Promise((_, reject) => setTimeout(() => reject(new Error(`${this.dependencyName} timeout`)), this.timeoutMs)),
        ]);
    }
}
exports.DependencyTimeoutStrategy = DependencyTimeoutStrategy;
// ═══════════════════════════════════════════════════════════════════════════════
// DATABASE FAILOVER STRATEGY
// ═══════════════════════════════════════════════════════════════════════════════
class DatabaseFailoverStrategy extends BaseInfrastructureStrategy {
    databaseName;
    failoverTimeMs;
    name = 'database_failover';
    severity = 'critical';
    blastRadius;
    constructor(databaseName, failoverTimeMs = 5000) {
        super();
        this.databaseName = databaseName;
        this.failoverTimeMs = failoverTimeMs;
        this.blastRadius = {
            scope: 'region',
            affectedServices: [databaseName, 'all-db-clients'],
            estimatedImpactPercent: 100,
            maxDurationMs: 30000,
            rollbackTimeMs: this.failoverTimeMs,
        };
    }
    async inject() {
        this.startTime = new Date();
        this.active = true;
        this.log(`Triggering failover for database: ${this.databaseName}`);
        this.log(`Expected failover time: ${this.failoverTimeMs}ms`);
        // Simulate primary going down
        await new Promise(resolve => setTimeout(resolve, 100));
        return {
            success: true,
            strategyName: this.name,
            startTime: this.startTime,
            message: `Database ${this.databaseName} primary is down, failover in progress`,
        };
    }
    async recover() {
        const recoveryStart = Date.now();
        // Simulate failover completion
        this.log('Failover completing...');
        await new Promise(resolve => setTimeout(resolve, this.failoverTimeMs));
        this.active = false;
        return {
            success: true,
            strategyName: this.name,
            recoveryTimeMs: Date.now() - recoveryStart,
            healthRestored: true,
            message: `Database ${this.databaseName} failover complete, replica promoted`,
        };
    }
}
exports.DatabaseFailoverStrategy = DatabaseFailoverStrategy;
// ═══════════════════════════════════════════════════════════════════════════════
// CACHE INVALIDATION STRATEGY
// ═══════════════════════════════════════════════════════════════════════════════
class CacheInvalidationStrategy extends BaseInfrastructureStrategy {
    cacheName;
    invalidationType;
    name = 'cache_invalidation';
    severity = 'high';
    blastRadius;
    constructor(cacheName, invalidationType = 'full') {
        super();
        this.cacheName = cacheName;
        this.invalidationType = invalidationType;
        this.blastRadius = {
            scope: 'service',
            affectedServices: [cacheName],
            estimatedImpactPercent: this.invalidationType === 'full' ? 100 : 30,
            maxDurationMs: 5000,
            rollbackTimeMs: 60000, // Cache warm-up time
        };
    }
    async inject() {
        this.startTime = new Date();
        this.active = true;
        this.log(`${this.invalidationType.toUpperCase()} cache invalidation: ${this.cacheName}`);
        return {
            success: true,
            strategyName: this.name,
            startTime: this.startTime,
            message: `Cache ${this.cacheName} invalidated (${this.invalidationType})`,
        };
    }
    async recover() {
        const recoveryStart = Date.now();
        // Cache will warm up naturally, just mark as recovered
        this.active = false;
        return {
            success: true,
            strategyName: this.name,
            recoveryTimeMs: Date.now() - recoveryStart,
            healthRestored: true,
            message: `Cache ${this.cacheName} warming up`,
        };
    }
}
exports.CacheInvalidationStrategy = CacheInvalidationStrategy;
// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════
exports.InfrastructureStrategies = {
    nodeCrash: NodeCrashStrategy,
    zoneFailure: ZoneFailureStrategy,
    dependencyTimeout: DependencyTimeoutStrategy,
    databaseFailover: DatabaseFailoverStrategy,
    cacheInvalidation: CacheInvalidationStrategy,
};
