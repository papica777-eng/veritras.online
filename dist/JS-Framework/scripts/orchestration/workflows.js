"use strict";
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
    const isValid = await validateRequirement(requirement);
    if (!isValid)
        throw new Error('Invalid requirement signature.');
    const plan = await synthesizeArchitecture(requirement);
    const deployId = await deployInfrastructure(plan);
    await notifyCompletion(deployId);
    return deployId;
}
