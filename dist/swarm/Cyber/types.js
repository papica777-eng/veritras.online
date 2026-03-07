"use strict";
/**
 * VORTEX SYNTHESIS ENGINE - TYPE DEFINITIONS
 * Version: 1.0.0-SINGULARITY
 *
 * Mathematical Model: Entropy-Stability Equilibrium
 * S(t) = S₀ * e^(-λt) + ∫₀ᵗ R(τ) * e^(-λ(t-τ)) dτ
 * Where:
 *   S(t) = System stability at time t
 *   S₀ = Initial stability coefficient
 *   λ = Entropy decay constant (configurable)
 *   R(τ) = Regeneration function (self-healing rate)
 *
 * Entropy Model: E(t) = E_base + Σᵢ(load_i * complexity_i) / throughput
 * Target: E(t) < E_threshold for Zero Entropy condition
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrchestratorEventType = exports.AssetLifecycleState = void 0;
/**
 * Spawned asset lifecycle state
 */
var AssetLifecycleState;
(function (AssetLifecycleState) {
    /** Being created */
    AssetLifecycleState["SPAWNING"] = "SPAWNING";
    /** Deploying to infrastructure */
    AssetLifecycleState["DEPLOYING"] = "DEPLOYING";
    /** Active and serving traffic */
    AssetLifecycleState["ACTIVE"] = "ACTIVE";
    /** Temporarily suspended */
    AssetLifecycleState["SUSPENDED"] = "SUSPENDED";
    /** Being terminated */
    AssetLifecycleState["TERMINATING"] = "TERMINATING";
    /** Terminated and cleaned up */
    AssetLifecycleState["TERMINATED"] = "TERMINATED";
    /** Error state requiring intervention */
    AssetLifecycleState["ERROR"] = "ERROR";
})(AssetLifecycleState || (exports.AssetLifecycleState = AssetLifecycleState = {}));
// ============================================================================
// ORCHESTRATOR INTERFACES
// ============================================================================
/**
 * Orchestrator event types
 */
var OrchestratorEventType;
(function (OrchestratorEventType) {
    OrchestratorEventType["ASSET_SPAWNED"] = "ASSET_SPAWNED";
    OrchestratorEventType["ASSET_DEPLOYED"] = "ASSET_DEPLOYED";
    OrchestratorEventType["ASSET_TERMINATED"] = "ASSET_TERMINATED";
    OrchestratorEventType["ENTROPY_WARNING"] = "ENTROPY_WARNING";
    OrchestratorEventType["ENTROPY_CRITICAL"] = "ENTROPY_CRITICAL";
    OrchestratorEventType["STABILITY_RESTORED"] = "STABILITY_RESTORED";
    OrchestratorEventType["BOTTLENECK_DETECTED"] = "BOTTLENECK_DETECTED";
    OrchestratorEventType["OPTIMIZATION_COMPLETE"] = "OPTIMIZATION_COMPLETE";
    OrchestratorEventType["REVENUE_CAPTURED"] = "REVENUE_CAPTURED";
    OrchestratorEventType["HEALTH_CHECK_FAILED"] = "HEALTH_CHECK_FAILED";
})(OrchestratorEventType || (exports.OrchestratorEventType = OrchestratorEventType = {}));
