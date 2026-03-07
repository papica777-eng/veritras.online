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
exports.getTranscendenceCore = exports.TranscendenceCore = exports.ChronosEngine = exports.NexusCoordinator = exports.HeavyTaskType = exports.HeavyTaskDelegator = exports.MemoryThrottleTransform = exports.BatchProcessor = exports.JSONArrayParser = exports.JSONLineParser = exports.StreamProcessor = exports.AILogicGate = exports.CircuitOpenError = exports.WorkerError = exports.MutationError = exports.SecurityError = exports.BrowserError = exports.AIServiceError = exports.ConfigurationError = exports.ValidationError = exports.TimeoutError = exports.NetworkError = exports.QAntumError = exports.createNeuralSnapshot = exports.AggregateRetryError = exports.ExponentialBackoffRetry = exports.CentralizedErrorHandler = exports.globalContainer = exports.ServiceLifetime = exports.ServiceTokens = exports.ServiceToken = exports.DIContainer = void 0;
// ═══════════════════════════════════════════════════════════════════════════════
// DEPENDENCY INJECTION
// ═══════════════════════════════════════════════════════════════════════════════
var container_1 = require("./di/container");
Object.defineProperty(exports, "DIContainer", { enumerable: true, get: function () { return container_1.DIContainer; } });
Object.defineProperty(exports, "ServiceToken", { enumerable: true, get: function () { return container_1.ServiceToken; } });
Object.defineProperty(exports, "ServiceTokens", { enumerable: true, get: function () { return container_1.ServiceTokens; } });
Object.defineProperty(exports, "ServiceLifetime", { enumerable: true, get: function () { return container_1.ServiceLifetime; } });
Object.defineProperty(exports, "globalContainer", { enumerable: true, get: function () { return container_1.globalContainer; } });
// ═══════════════════════════════════════════════════════════════════════════════
// ERROR HANDLING
// ═══════════════════════════════════════════════════════════════════════════════
var error_handler_1 = require("./errors/error-handler");
Object.defineProperty(exports, "CentralizedErrorHandler", { enumerable: true, get: function () { return error_handler_1.CentralizedErrorHandler; } });
Object.defineProperty(exports, "ExponentialBackoffRetry", { enumerable: true, get: function () { return error_handler_1.ExponentialBackoffRetry; } });
Object.defineProperty(exports, "AggregateRetryError", { enumerable: true, get: function () { return error_handler_1.AggregateRetryError; } });
Object.defineProperty(exports, "createNeuralSnapshot", { enumerable: true, get: function () { return error_handler_1.createNeuralSnapshot; } });
// Error types
Object.defineProperty(exports, "QAntumError", { enumerable: true, get: function () { return error_handler_1.QAntumError; } });
Object.defineProperty(exports, "NetworkError", { enumerable: true, get: function () { return error_handler_1.NetworkError; } });
Object.defineProperty(exports, "TimeoutError", { enumerable: true, get: function () { return error_handler_1.TimeoutError; } });
Object.defineProperty(exports, "ValidationError", { enumerable: true, get: function () { return error_handler_1.ValidationError; } });
Object.defineProperty(exports, "ConfigurationError", { enumerable: true, get: function () { return error_handler_1.ConfigurationError; } });
Object.defineProperty(exports, "AIServiceError", { enumerable: true, get: function () { return error_handler_1.AIServiceError; } });
Object.defineProperty(exports, "BrowserError", { enumerable: true, get: function () { return error_handler_1.BrowserError; } });
Object.defineProperty(exports, "SecurityError", { enumerable: true, get: function () { return error_handler_1.SecurityError; } });
Object.defineProperty(exports, "MutationError", { enumerable: true, get: function () { return error_handler_1.MutationError; } });
Object.defineProperty(exports, "WorkerError", { enumerable: true, get: function () { return error_handler_1.WorkerError; } });
Object.defineProperty(exports, "CircuitOpenError", { enumerable: true, get: function () { return error_handler_1.CircuitOpenError; } });
// ═══════════════════════════════════════════════════════════════════════════════
// AI LOGIC GATE (COGNITIVE AUDIT)
// ═══════════════════════════════════════════════════════════════════════════════
var logic_gate_1 = require("./validation/logic-gate");
Object.defineProperty(exports, "AILogicGate", { enumerable: true, get: function () { return logic_gate_1.AILogicGate; } });
// ═══════════════════════════════════════════════════════════════════════════════
// STREAM PROCESSING (MEMORY OPTIMIZATION)
// ═══════════════════════════════════════════════════════════════════════════════
var stream_processor_1 = require("./streams/stream-processor");
Object.defineProperty(exports, "StreamProcessor", { enumerable: true, get: function () { return stream_processor_1.StreamProcessor; } });
Object.defineProperty(exports, "JSONLineParser", { enumerable: true, get: function () { return stream_processor_1.JSONLineParser; } });
Object.defineProperty(exports, "JSONArrayParser", { enumerable: true, get: function () { return stream_processor_1.JSONArrayParser; } });
Object.defineProperty(exports, "BatchProcessor", { enumerable: true, get: function () { return stream_processor_1.BatchProcessor; } });
Object.defineProperty(exports, "MemoryThrottleTransform", { enumerable: true, get: function () { return stream_processor_1.MemoryThrottleTransform; } });
// ═══════════════════════════════════════════════════════════════════════════════
// HEAVY TASK DELEGATION (WORKER THREADS)
// ═══════════════════════════════════════════════════════════════════════════════
var heavy_task_delegator_1 = require("./workers/heavy-task-delegator");
Object.defineProperty(exports, "HeavyTaskDelegator", { enumerable: true, get: function () { return heavy_task_delegator_1.HeavyTaskDelegator; } });
Object.defineProperty(exports, "HeavyTaskType", { enumerable: true, get: function () { return heavy_task_delegator_1.HeavyTaskType; } });
// ═══════════════════════════════════════════════════════════════════════════════
// NEXUS COORDINATOR (v26.0 Sovereign Nexus)
// ═══════════════════════════════════════════════════════════════════════════════
var nexus_coordinator_1 = require("./nexus-coordinator");
Object.defineProperty(exports, "NexusCoordinator", { enumerable: true, get: function () { return nexus_coordinator_1.NexusCoordinator; } });
// ═══════════════════════════════════════════════════════════════════════════════
// CHRONOS ENGINE V2.0 (v26.0 Sovereign Nexus - MCTS Look-ahead)
// ═══════════════════════════════════════════════════════════════════════════════
var chronos_engine_v2_1 = require("./chronos-engine-v2");
Object.defineProperty(exports, "ChronosEngine", { enumerable: true, get: function () { return chronos_engine_v2_1.ChronosEngine; } });
// ═══════════════════════════════════════════════════════════════════════════════
// TRANSCENDENCE CORE (Active Paradox Resolution System)
// ═══════════════════════════════════════════════════════════════════════════════
var transcendence_core_1 = require("./transcendence-core");
Object.defineProperty(exports, "TranscendenceCore", { enumerable: true, get: function () { return transcendence_core_1.TranscendenceCore; } });
Object.defineProperty(exports, "getTranscendenceCore", { enumerable: true, get: function () { return transcendence_core_1.getTranscendenceCore; } });
