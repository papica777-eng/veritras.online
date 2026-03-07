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
exports.StateVersioningSystem = exports.HotSwapModuleLoader = exports.GeneticMutationEngine = exports.PredictiveStatePreloader = exports.GhostExecutionLayer = exports.default = exports.SEGCController = void 0;
// Main Controller
var segc_controller_1 = require("./segc-controller");
Object.defineProperty(exports, "SEGCController", { enumerable: true, get: function () { return segc_controller_1.SEGCController; } });
Object.defineProperty(exports, "default", { enumerable: true, get: function () { return __importDefault(segc_controller_1).default; } });
// Components
var ghost_execution_layer_1 = require("./ghost/ghost-execution-layer");
Object.defineProperty(exports, "GhostExecutionLayer", { enumerable: true, get: function () { return ghost_execution_layer_1.GhostExecutionLayer; } });
var state_preloader_1 = require("./predictive/state-preloader");
Object.defineProperty(exports, "PredictiveStatePreloader", { enumerable: true, get: function () { return state_preloader_1.PredictiveStatePreloader; } });
var mutation_engine_1 = require("./mutations/mutation-engine");
Object.defineProperty(exports, "GeneticMutationEngine", { enumerable: true, get: function () { return mutation_engine_1.GeneticMutationEngine; } });
var module_loader_1 = require("./hotswap/module-loader");
Object.defineProperty(exports, "HotSwapModuleLoader", { enumerable: true, get: function () { return module_loader_1.HotSwapModuleLoader; } });
var state_versioner_1 = require("./versioning/state-versioner");
Object.defineProperty(exports, "StateVersioningSystem", { enumerable: true, get: function () { return state_versioner_1.StateVersioningSystem; } });
// Types
__exportStar(require("./types"), exports);
