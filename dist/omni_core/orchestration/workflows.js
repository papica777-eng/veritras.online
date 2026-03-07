"use strict";
/**
 * workflows — Qantum Module
 * @module workflows
 * @path omni_core/orchestration/workflows.ts
 * @auto-documented BrutalDocEngine v2.1
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.vortexEvolutionWorkflow = vortexEvolutionWorkflow;
const workflow_1 = require("@temporalio/workflow");
// We use the ReturnType of the factory to get the correct activity types
const { validateRequirement, synthesizeArchitecture, deployInfrastructure, notifyCompletion } = (0, workflow_1.proxyActivities)({
    startToCloseTimeout: '1 minute',
    retry: {
        initialInterval: '1s',
        backoffCoefficient: 2,
        maximumAttempts: 5,
    },
});
/**
 * 🌀 VORTEX EVOLUTION WORKFLOW
 * Deterministic logic for the autonomous evolution of the system.
 */
async function vortexEvolutionWorkflow(requirement) {
    // SAFETY: async operation — wrap in try-catch for production resilience
    const isValid = await validateRequirement(requirement);
    if (!isValid)
        throw new Error('Invalid requirement signature.');
    // SAFETY: async operation — wrap in try-catch for production resilience
    const plan = await synthesizeArchitecture(requirement);
    // SAFETY: async operation — wrap in try-catch for production resilience
    const deployId = await deployInfrastructure(plan);
    // SAFETY: async operation — wrap in try-catch for production resilience
    await notifyCompletion(deployId);
    return deployId;
}
