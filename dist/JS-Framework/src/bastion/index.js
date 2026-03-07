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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthCheckSystem = exports.CircuitBreakerManager = exports.ChecksumValidator = exports.NeuralVault = exports.getGlobalMemoryManager = exports.MemoryHardeningManager = exports.workerMain = exports.WorkerPoolManager = exports.SandboxExecutor = exports.default = exports.BastionController = void 0;
// Types
__exportStar(require("./types"), exports);
// Core Controller
var bastion_controller_1 = require("./bastion-controller");
Object.defineProperty(exports, "BastionController", { enumerable: true, get: function () { return bastion_controller_1.BastionController; } });
Object.defineProperty(exports, "default", { enumerable: true, get: function () { return __importDefault(bastion_controller_1).default; } });
// Security Components
var sandbox_executor_1 = require("./sandbox/sandbox-executor");
Object.defineProperty(exports, "SandboxExecutor", { enumerable: true, get: function () { return sandbox_executor_1.SandboxExecutor; } });
var worker_pool_1 = require("./workers/worker-pool");
Object.defineProperty(exports, "WorkerPoolManager", { enumerable: true, get: function () { return worker_pool_1.WorkerPoolManager; } });
Object.defineProperty(exports, "workerMain", { enumerable: true, get: function () { return worker_pool_1.workerMain; } });
var memory_hardening_1 = require("./memory/memory-hardening");
Object.defineProperty(exports, "MemoryHardeningManager", { enumerable: true, get: function () { return memory_hardening_1.MemoryHardeningManager; } });
Object.defineProperty(exports, "getGlobalMemoryManager", { enumerable: true, get: function () { return memory_hardening_1.getGlobalMemoryManager; } });
// Neural Grid Components
var neural_vault_1 = require("./neural/neural-vault");
Object.defineProperty(exports, "NeuralVault", { enumerable: true, get: function () { return neural_vault_1.NeuralVault; } });
var checksum_validator_1 = require("./neural/checksum-validator");
Object.defineProperty(exports, "ChecksumValidator", { enumerable: true, get: function () { return checksum_validator_1.ChecksumValidator; } });
// Infrastructure Components
var circuit_breaker_1 = require("./circuit/circuit-breaker");
Object.defineProperty(exports, "CircuitBreakerManager", { enumerable: true, get: function () { return circuit_breaker_1.CircuitBreakerManager; } });
var health_check_1 = require("./health/health-check");
Object.defineProperty(exports, "HealthCheckSystem", { enumerable: true, get: function () { return health_check_1.HealthCheckSystem; } });
