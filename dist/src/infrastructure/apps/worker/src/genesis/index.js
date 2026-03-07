"use strict";
/**
 * Genesis Module - ОНТОЛОГИЧНА КОВАЧНИЦА ЗА ТЕСТОВЕ
 *
 * "Реалностите се създават от аксиоми, тестовете ги наблюдават"
 *
 * This module provides:
 * - GenesisRealityProvider: Translates axioms to Docker environments
 * - GenesisProcessor: Executes tests within manifested realities
 * - Hybrid execution: Combines Ghost Protocol with Genesis isolation
 *
 * @author Димитър Продромов
 * @copyright 2026 QAntum. All Rights Reserved.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.genesisQueue = exports.startGenesisWorker = exports.executeHybridGenesisTest = exports.processGenesisTestJob = exports.genesisRealityProvider = exports.GenesisRealityProvider = void 0;
exports.createSimpleReality = createSimpleReality;
exports.quickManifest = quickManifest;
exports.quickObserve = quickObserve;
exports.getGenesisStatus = getGenesisStatus;
var GenesisRealityProvider_1 = require("../../../../SaaS-master/SaaS-master/brutality-vortex/dpREPO/7/src/modules/BETA_SECURITY/security/auth/energy/GenesisRealityProvider");
Object.defineProperty(exports, "GenesisRealityProvider", { enumerable: true, get: function () { return GenesisRealityProvider_1.GenesisRealityProvider; } });
Object.defineProperty(exports, "genesisRealityProvider", { enumerable: true, get: function () { return GenesisRealityProvider_1.genesisRealityProvider; } });
var GenesisProcessor_1 = require("../../../../../scripts/qantum/GenesisProcessor");
Object.defineProperty(exports, "processGenesisTestJob", { enumerable: true, get: function () { return GenesisProcessor_1.processGenesisTestJob; } });
Object.defineProperty(exports, "executeHybridGenesisTest", { enumerable: true, get: function () { return GenesisProcessor_1.executeHybridGenesisTest; } });
Object.defineProperty(exports, "startGenesisWorker", { enumerable: true, get: function () { return GenesisProcessor_1.startGenesisWorker; } });
Object.defineProperty(exports, "genesisQueue", { enumerable: true, get: function () { return GenesisProcessor_1.genesisQueue; } });
// ═══════════════════════════════════════════════════════════════════════════════
// QUICK START HELPERS
// ═══════════════════════════════════════════════════════════════════════════════
const GenesisRealityProvider_2 = require("../../../../SaaS-master/SaaS-master/brutality-vortex/dpREPO/7/src/modules/BETA_SECURITY/security/auth/energy/GenesisRealityProvider");
const crypto_1 = require("crypto");
/**
 * Create a simple test reality with common axioms
 */
function createSimpleReality(name, tenantId, options = {}) {
    const axioms = [
        // Always include identity for isolation
        {
            id: (0, crypto_1.randomUUID)(),
            type: 'IDENTITY',
            statement: 'Each service maintains its unique identity',
            strength: 1.0,
            dependencies: [],
        },
    ];
    if (options.includeDatabase !== false) {
        axioms.push({
            id: (0, crypto_1.randomUUID)(),
            type: 'CONSERVATION',
            statement: 'Data persists with strict resource limits',
            strength: 0.8,
            dependencies: [],
        });
    }
    if (options.includeCache) {
        axioms.push({
            id: (0, crypto_1.randomUUID)(),
            type: 'HOLOGRAPHIC',
            statement: 'State is distributed and synchronized',
            strength: 0.9,
            dependencies: [],
        });
    }
    if (options.includeWeb !== false) {
        axioms.push({
            id: (0, crypto_1.randomUUID)(),
            type: 'SYMMETRY',
            statement: 'Load is balanced across replicas',
            strength: 0.7,
            dependencies: [],
        });
    }
    if (options.chaosLevel && options.chaosLevel > 0) {
        axioms.push({
            id: (0, crypto_1.randomUUID)(),
            type: 'UNCERTAINTY',
            statement: 'Chaos tests system resilience',
            strength: options.chaosLevel,
            dependencies: [],
        });
    }
    return {
        id: (0, crypto_1.randomUUID)(),
        name,
        dimensions: 4,
        axioms,
        causality: 'DETERMINISTIC',
        coherence: 0.9,
        entropy: options.chaosLevel || 0.1,
        temporalFlow: 'FORWARD',
        createdAt: new Date(),
        tenantId,
    };
}
/**
 * Quick manifest - create and start a simple reality
 */
async function quickManifest(name, tenantId) {
    const spec = createSimpleReality(name, tenantId);
    return GenesisRealityProvider_2.genesisRealityProvider.manifestReality(spec);
}
/**
 * Quick observe - execute a test in a reality
 */
async function quickObserve(realityId, testCode, timeout = 30000) {
    return GenesisRealityProvider_2.genesisRealityProvider.observeReality({
        realityId,
        observerId: (0, crypto_1.randomUUID)(),
        testCode,
        targetService: 'api',
        timeout,
    });
}
/**
 * Get active realities summary
 */
function getGenesisStatus(tenantId) {
    const realities = GenesisRealityProvider_2.genesisRealityProvider.getActiveRealities(tenantId);
    return {
        activeRealities: realities.length,
        totalContainers: realities.reduce((sum, r) => sum + r.containers.length, 0),
        realities: realities.map(r => ({
            id: r.id,
            name: r.specId,
            status: r.status,
            containers: r.containers.length,
        })),
    };
}
