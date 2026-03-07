"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const worker_1 = require("@temporalio/worker");
const activities_1 = require("./activities");
const DepartmentEngine_1 = require("../DepartmentEngine");
async function run() {
    const engine = DepartmentEngine_1.DepartmentEngine.getInstance();
    await engine.initializeAll();
    const worker = await worker_1.Worker.create({
        workflowsPath: require.resolve('./workflows'),
        activities: (0, activities_1.createActivities)(engine),
        taskQueue: 'vortex-core-queue',
    });
    console.log('VORTEX Worker is alive. Nervous system active.');
    await worker.run();
}
run().catch((err) => {
    console.error('Fatal Worker Error:', err);
    process.exit(1);
});
