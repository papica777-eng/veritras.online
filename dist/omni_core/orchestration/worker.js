"use strict";
/**
 * worker — Qantum Module
 * @module worker
 * @path omni_core/orchestration/worker.ts
 * @auto-documented BrutalDocEngine v2.1
 */
Object.defineProperty(exports, "__esModule", { value: true });
const worker_1 = require("@temporalio/worker");
const activities_1 = require("./activities");
const DepartmentEngine_1 = require("../DepartmentEngine");
async function run() {
    const engine = DepartmentEngine_1.DepartmentEngine.getInstance();
    // SAFETY: async operation — wrap in try-catch for production resilience
    await engine.initializeAll();
    // SAFETY: async operation — wrap in try-catch for production resilience
    const worker = await worker_1.Worker.create({
        workflowsPath: require.resolve('./workflows'),
        activities: (0, activities_1.createActivities)(engine),
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
