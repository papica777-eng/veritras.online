"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                               ║
 * ║   COGNITIVE TYPE DEFINITIONS                                                  ║
 * ║   Strict contracts for autonomous reasoning modules                          ║
 * ║                                                                               ║
 * ║   © 2025-2026 QAntum | Dimitar Prodromov                                     ║
 * ║                                                                               ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_COGNITIVE_CONFIG = exports.CognitiveActionType = void 0;
// ═══════════════════════════════════════════════════════════════════════════════
// ACTION TYPES
// ═══════════════════════════════════════════════════════════════════════════════
var CognitiveActionType;
(function (CognitiveActionType) {
    CognitiveActionType["AUTONOMOUS_THINK"] = "autonomous-think";
    CognitiveActionType["SELF_AUDIT"] = "self-audit";
    CognitiveActionType["VERIFY_SYMBOL"] = "verify-symbol";
    CognitiveActionType["LOOKUP_MAP"] = "lookup-map";
    CognitiveActionType["SELF_HEAL"] = "self-heal";
    CognitiveActionType["PATTERN_ANALYSIS"] = "pattern-analysis";
    CognitiveActionType["SWARM_TASK"] = "swarm-task";
    CognitiveActionType["DECRYPT_VAULT"] = "decrypt-vault";
    CognitiveActionType["NETWORK_RECON"] = "network-recon";
    CognitiveActionType["SELF_OPTIMIZE"] = "self-optimize";
    CognitiveActionType["PREDICT_RISK"] = "predict-risk";
    CognitiveActionType["ENGAGE_DEFENSE"] = "engage-defense";
})(CognitiveActionType || (exports.CognitiveActionType = CognitiveActionType = {}));
exports.DEFAULT_COGNITIVE_CONFIG = {
    maxIterations: 10,
    temperature: 0.3,
    enableLogging: true,
    enableEventBus: true,
    abortOnError: false,
};
