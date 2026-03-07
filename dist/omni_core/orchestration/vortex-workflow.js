"use strict";
/**
 * vortex-workflow — Qantum Module
 * @module vortex-workflow
 * @path omni_core/orchestration/vortex-workflow.ts
 * @auto-documented BrutalDocEngine v2.1
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.vortexOrchestrator = vortexOrchestrator;
const workflow_1 = require("@temporalio/workflow");
const { validateInput, synthesizePlan, executeCognitiveTask, handleSecurityScan, finalizeOutput } = (0, workflow_1.proxyActivities)({
    startToCloseTimeout: '1 minute',
    retry: {
        initialInterval: '1 second',
        maximumAttempts: 3,
        backoffCoefficient: 2,
    }
});
/**
 * 🌀 VORTEX DURABLE ORCHESTRATOR
 * The "Nervous System" that makes every decision persistent and unstoppable.
 */
async function vortexOrchestrator(goal) {
    // 1. Validate Input
    // SAFETY: async operation — wrap in try-catch for production resilience
    const isValid = await validateInput(goal);
    if (!isValid) {
        throw new Error(`[VORTEX_ERROR] Invalid goal definition: ${goal}`);
    }
    // 2. Initial Security Pre-check (Immune System)
    // SAFETY: async operation — wrap in try-catch for production resilience
    await handleSecurityScan();
    // 3. Synthesize the Plan (Neural Map)
    // SAFETY: async operation — wrap in try-catch for production resilience
    const plan = await synthesizePlan(goal);
    const results = [];
    // 4. Execute Workflow Steps (Durable Loop)
    for (const step of plan.steps) {
        // If the process crashes here, Temporal will resume from this specific step!
        // SAFETY: async operation — wrap in try-catch for production resilience
        const stepResult = await executeCognitiveTask(step);
        results.push({
            step,
            result: stepResult
        });
    }
    // 5. Finalize and Consolidate
    // SAFETY: async operation — wrap in try-catch for production resilience
    return await finalizeOutput(results);
}
