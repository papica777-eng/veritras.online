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
exports.NeuralHUD = exports.VideoReplayAnalyzer = exports.VoiceCommander = void 0;
// ═══════════════════════════════════════════════════════════════════════════════
// 🎙️ MULTIMODAL COMMANDER - Voice, Video & Neural HUD
// ═══════════════════════════════════════════════════════════════════════════════
__exportStar(require("./voice-commander"), exports);
__exportStar(require("./video-replay-analyzer"), exports);
__exportStar(require("./neural-hud"), exports);
var voice_commander_1 = require("./voice-commander");
Object.defineProperty(exports, "VoiceCommander", { enumerable: true, get: function () { return __importDefault(voice_commander_1).default; } });
var video_replay_analyzer_1 = require("./video-replay-analyzer");
Object.defineProperty(exports, "VideoReplayAnalyzer", { enumerable: true, get: function () { return __importDefault(video_replay_analyzer_1).default; } });
var neural_hud_1 = require("./neural-hud");
Object.defineProperty(exports, "NeuralHUD", { enumerable: true, get: function () { return __importDefault(neural_hud_1).default; } });
