"use strict";
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
    const isValid = await validateInput(goal);
    if (!isValid) {
        throw new Error(`[VORTEX_ERROR] Invalid goal definition: ${goal}`);
    }
    // 2. Initial Security Pre-check (Immune System)
    await handleSecurityScan();
    // 3. Synthesize the Plan (Neural Map)
    const plan = await synthesizePlan(goal);
    const results = [];
    // 4. Execute Workflow Steps (Durable Loop)
    for (const step of plan.steps) {
        // If the process crashes here, Temporal will resume from this specific step!
        const stepResult = await executeCognitiveTask(step);
        results.push({
            step,
            result: stepResult
        });
    }
    // 5. Finalize and Consolidate
    return await finalizeOutput(results);
}
