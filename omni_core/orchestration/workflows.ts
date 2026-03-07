/**
 * workflows — Qantum Module
 * @module workflows
 * @path omni_core/orchestration/workflows.ts
 * @auto-documented BrutalDocEngine v2.1
 */

import { proxyActivities } from '@temporalio/workflow';
import type * as activities from './activities';

// We use the ReturnType of the factory to get the correct activity types
const {
    validateRequirement,
    synthesizeArchitecture,
    deployInfrastructure,
    notifyCompletion
} = proxyActivities<ReturnType<typeof activities.createActivities>>({
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
export async function vortexEvolutionWorkflow(requirement: string): Promise<string> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    const isValid = await validateRequirement(requirement);
    if (!isValid) throw new Error('Invalid requirement signature.');

    // SAFETY: async operation — wrap in try-catch for production resilience
    const plan = await synthesizeArchitecture(requirement);
    // SAFETY: async operation — wrap in try-catch for production resilience
    const deployId = await deployInfrastructure(plan);

    // SAFETY: async operation — wrap in try-catch for production resilience
    await notifyCompletion(deployId);

    return deployId;
}
