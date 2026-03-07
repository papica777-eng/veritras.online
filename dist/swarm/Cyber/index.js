"use strict";
/**
 * VORTEX SYNTHESIS ENGINE
 * Version: 1.0.0-SINGULARITY
 *
 * The sovereign meta-layer that achieves Zero Entropy and Infinite Scalability.
 *
 * Core Components:
 * - VortexOrchestrator: The "Orchestrator of Orchestrators"
 * - SingularityServer: Neural Core Entry Point with real-time OS Entropy
 * - SharedMemoryV2: Cross-component synchronization (<25ms recovery)
 * - GhostShield: Adaptive Polymorphic Wrapper (50ms fingerprint rotation)
 * - BrowserPool: GhostShield-protected browser instances
 * - RefactorEngine: Self-analyzing code optimization with FFI bridge
 * - AssetSpawner: Autonomous Micro-SaaS generation (Economic Darwinism)
 * - CyberCody: AI Auditor for GOD_MODE signal validation
 *
 * Mathematical Model: Entropy-Stability Equilibrium
 * S(t) = S₀ * e^(-λt) + ∫₀ᵗ R(τ) * e^(-λ(t-τ)) dτ
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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetCyberCody = exports.getCyberCody = exports.CyberCody = exports.resetAssetSpawner = exports.getAssetSpawner = exports.AssetSpawner = exports.resetRefactorEngine = exports.getRefactorEngine = exports.RefactorEngine = exports.resetBrowserPool = exports.getBrowserPool = exports.BrowserPool = exports.resetGhostShield = exports.getGhostShield = exports.GhostShield = exports.resetSharedMemory = exports.getSharedMemory = exports.SharedMemoryV2 = exports.resetVortexOrchestrator = exports.getVortexOrchestrator = exports.VortexOrchestrator = exports.resetSingularityServer = exports.getSingularityServer = exports.SingularityServer = void 0;
// Singularity Server (Neural Core Entry Point)
var SingularityServer_1 = require("./SingularityServer");
Object.defineProperty(exports, "SingularityServer", { enumerable: true, get: function () { return SingularityServer_1.SingularityServer; } });
Object.defineProperty(exports, "getSingularityServer", { enumerable: true, get: function () { return SingularityServer_1.getSingularityServer; } });
Object.defineProperty(exports, "resetSingularityServer", { enumerable: true, get: function () { return SingularityServer_1.resetSingularityServer; } });
// Core Orchestrator
var VortexOrchestrator_1 = require("./VortexOrchestrator");
Object.defineProperty(exports, "VortexOrchestrator", { enumerable: true, get: function () { return VortexOrchestrator_1.VortexOrchestrator; } });
Object.defineProperty(exports, "getVortexOrchestrator", { enumerable: true, get: function () { return VortexOrchestrator_1.getVortexOrchestrator; } });
Object.defineProperty(exports, "resetVortexOrchestrator", { enumerable: true, get: function () { return VortexOrchestrator_1.resetVortexOrchestrator; } });
// Shared Memory System
var SharedMemoryV2_1 = require("./SharedMemoryV2");
Object.defineProperty(exports, "SharedMemoryV2", { enumerable: true, get: function () { return SharedMemoryV2_1.SharedMemoryV2; } });
Object.defineProperty(exports, "getSharedMemory", { enumerable: true, get: function () { return SharedMemoryV2_1.getSharedMemory; } });
Object.defineProperty(exports, "resetSharedMemory", { enumerable: true, get: function () { return SharedMemoryV2_1.resetSharedMemory; } });
// Ghost Shield SDK
var GhostShield_1 = require("./GhostShield");
Object.defineProperty(exports, "GhostShield", { enumerable: true, get: function () { return GhostShield_1.GhostShield; } });
Object.defineProperty(exports, "getGhostShield", { enumerable: true, get: function () { return GhostShield_1.getGhostShield; } });
Object.defineProperty(exports, "resetGhostShield", { enumerable: true, get: function () { return GhostShield_1.resetGhostShield; } });
// Browser Pool with GhostShield
var BrowserPool_1 = require("./BrowserPool");
Object.defineProperty(exports, "BrowserPool", { enumerable: true, get: function () { return BrowserPool_1.BrowserPool; } });
Object.defineProperty(exports, "getBrowserPool", { enumerable: true, get: function () { return BrowserPool_1.getBrowserPool; } });
Object.defineProperty(exports, "resetBrowserPool", { enumerable: true, get: function () { return BrowserPool_1.resetBrowserPool; } });
// Refactor Engine
var RefactorEngine_1 = require("./RefactorEngine");
Object.defineProperty(exports, "RefactorEngine", { enumerable: true, get: function () { return RefactorEngine_1.RefactorEngine; } });
Object.defineProperty(exports, "getRefactorEngine", { enumerable: true, get: function () { return RefactorEngine_1.getRefactorEngine; } });
Object.defineProperty(exports, "resetRefactorEngine", { enumerable: true, get: function () { return RefactorEngine_1.resetRefactorEngine; } });
// Asset Spawner
var AssetSpawner_1 = require("./AssetSpawner");
Object.defineProperty(exports, "AssetSpawner", { enumerable: true, get: function () { return AssetSpawner_1.AssetSpawner; } });
Object.defineProperty(exports, "getAssetSpawner", { enumerable: true, get: function () { return AssetSpawner_1.getAssetSpawner; } });
Object.defineProperty(exports, "resetAssetSpawner", { enumerable: true, get: function () { return AssetSpawner_1.resetAssetSpawner; } });
// CyberCody AI Auditor
var CyberCody_1 = require("./CyberCody");
Object.defineProperty(exports, "CyberCody", { enumerable: true, get: function () { return CyberCody_1.CyberCody; } });
Object.defineProperty(exports, "getCyberCody", { enumerable: true, get: function () { return CyberCody_1.getCyberCody; } });
Object.defineProperty(exports, "resetCyberCody", { enumerable: true, get: function () { return CyberCody_1.resetCyberCody; } });
// Type Definitions
__exportStar(require("./types"), exports);
