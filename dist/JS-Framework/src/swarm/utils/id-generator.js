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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTraceId = generateTraceId;
exports.generateSpanId = generateSpanId;
exports.generateTaskId = generateTaskId;
exports.generateMessageId = generateMessageId;
exports.generateAgentId = generateAgentId;
exports.generateEntryId = generateEntryId;
exports.generateContextId = generateContextId;
exports.generatePlanId = generatePlanId;
exports.generateFeedbackId = generateFeedbackId;
const crypto = __importStar(require("crypto"));
/**
 * Generate a unique trace ID (128-bit, W3C Trace Context format)
 * Format: 32 hex characters
 */
function generateTraceId() {
    return crypto.randomBytes(16).toString('hex');
}
/**
 * Generate a unique span ID (64-bit)
 * Format: 16 hex characters
 */
function generateSpanId() {
    return crypto.randomBytes(8).toString('hex');
}
/**
 * Generate a unique task ID
 * Format: task_XXXXXXXXXX
 */
function generateTaskId() {
    return `task_${crypto.randomBytes(5).toString('hex')}`;
}
/**
 * Generate a unique message ID
 * Format: msg_XXXXXXXXXX
 */
function generateMessageId() {
    return `msg_${crypto.randomBytes(5).toString('hex')}`;
}
/**
 * Generate a unique agent ID
 * Format: agent_XXXXXX
 */
function generateAgentId() {
    return `agent_${crypto.randomBytes(3).toString('hex')}`;
}
/**
 * Generate a unique entry ID
 * Format: entry_XXXXXXXXXX
 */
function generateEntryId() {
    return `entry_${crypto.randomBytes(5).toString('hex')}`;
}
/**
 * Generate a unique browser context ID
 * Format: ctx_XXXXXX
 */
function generateContextId() {
    return `ctx_${crypto.randomBytes(3).toString('hex')}`;
}
/**
 * Generate a unique plan ID
 * Format: plan_XXXXXXXX
 */
function generatePlanId() {
    return `plan_${crypto.randomBytes(4).toString('hex')}`;
}
/**
 * Generate a unique feedback ID
 * Format: fb_XXXXXXXX
 */
function generateFeedbackId() {
    return `fb_${crypto.randomBytes(4).toString('hex')}`;
}
exports.default = {
    generateTraceId,
    generateSpanId,
    generateTaskId,
    generateMessageId,
    generateAgentId,
    generateEntryId,
    generateContextId,
    generatePlanId,
    generateFeedbackId,
};
