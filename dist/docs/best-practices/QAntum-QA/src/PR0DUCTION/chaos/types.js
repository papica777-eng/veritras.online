"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CHAOS ENGINEERING - TYPE DEFINITIONS
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * @author Димитър Продромов / Mister Mind
 * @copyright 2026 QAntum Empire. All Rights Reserved.
 * @version 33.5 - MODULAR CHAOS
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_CONFIG = void 0;
exports.DEFAULT_CONFIG = {
    maxConcurrentStrategies: 3,
    globalTimeout: 300000, // 5 minutes
    healthCheckInterval: 5000, // 5 seconds
    killSwitchEnabled: true,
    safeMode: true,
    logLevel: 'info',
};
