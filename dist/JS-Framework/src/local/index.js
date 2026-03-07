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
 * For licensing inquiries: dimitar.prodromov@QAntum.dev
 * ═══════════════════════════════════════════════════════════════════════════════
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.HybridVisionController = exports.WhisperService = void 0;
// ═══════════════════════════════════════════════════════════════════════════════
// 📦 LOCAL MODULE EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════
var whisper_service_1 = require("./whisper-service");
Object.defineProperty(exports, "WhisperService", { enumerable: true, get: function () { return whisper_service_1.WhisperService; } });
var hybrid_vision_controller_1 = require("./hybrid-vision-controller");
Object.defineProperty(exports, "HybridVisionController", { enumerable: true, get: function () { return hybrid_vision_controller_1.HybridVisionController; } });
