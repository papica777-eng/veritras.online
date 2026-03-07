"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SWARM INTERFACES - Type-Safe Communication Primitives
 * Part of PHYSICS Layer - Interaction Rules
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * "Тип-безопасност е щитът срещу хаоса."
 *                                     — QAntum Philosophy
 *
 * These interfaces replace `any` types in the swarm subsystem with
 * properly typed contracts.
 *
 * @module layers/physics/swarm-interfaces
 * @version 1.0.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTaskCompletedMessage = isTaskCompletedMessage;
exports.isTaskFailedMessage = isTaskFailedMessage;
exports.isSwarmMetricsMessage = isSwarmMetricsMessage;
exports.isWorkerReadyMessage = isWorkerReadyMessage;
// ═══════════════════════════════════════════════════════════════════════════
// TYPE GUARDS
// ═══════════════════════════════════════════════════════════════════════════
/**
 * Type guard for task completed message
 */
function isTaskCompletedMessage(msg) {
    return msg.type === 'task:completed';
}
/**
 * Type guard for task failed message
 */
function isTaskFailedMessage(msg) {
    return msg.type === 'task:failed';
}
/**
 * Type guard for swarm metrics message
 */
function isSwarmMetricsMessage(msg) {
    return msg.type === 'swarm:metrics';
}
/**
 * Type guard for worker ready message
 */
function isWorkerReadyMessage(msg) {
    return msg.type === 'worker:ready';
}
