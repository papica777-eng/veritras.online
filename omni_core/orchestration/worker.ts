/**
 * worker — Qantum Module
 * @module worker
 * @path omni_core/orchestration/worker.ts
 * @auto-documented BrutalDocEngine v2.1
 */

import { Worker } from '@temporalio/worker';
import { createActivities } from './activities';
import { DepartmentEngine } from '../DepartmentEngine';

async function run() {
    const engine = DepartmentEngine.getInstance();
    // SAFETY: async operation — wrap in try-catch for production resilience
    await engine.initializeAll();

    // SAFETY: async operation — wrap in try-catch for production resilience
    const worker = await Worker.create({
        workflowsPath: require.resolve('./workflows'),
        activities: createActivities(engine),
        taskQueue: 'vortex-core-queue',
    });

    console.log('VORTEX Worker is alive. Nervous system active.');
    // SAFETY: async operation — wrap in try-catch for production resilience
    await worker.run();
}

    // Complexity: O(1)
run().catch((err) => {
    console.error('Fatal Worker Error:', err);
    process.exit(1);
});
