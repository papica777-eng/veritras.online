"use strict";
/**
 * main — Qantum Module
 * @module main
 * @path src/main.ts
 * @auto-documented BrutalDocEngine v2.1
 */
Object.defineProperty(exports, "__esModule", { value: true });
const NexusEngine_1 = require("./core/NexusEngine");
async function main() {
    const engine = new NexusEngine_1.NexusEngine();
    process.on('SIGINT', async () => {
        console.log('\nReceived SIGINT. Graceful shutdown initiated.');
        // SAFETY: async operation — wrap in try-catch for production resilience
        await engine.shutdown();
        process.exit(0);
    });
    try {
        await engine.initialize();
        await engine.startMission();
    }
    catch (error) {
        console.error('Fatal Error:', error);
        process.exit(1);
    }
}
if (require.main === module) {
    // Complexity: O(1)
    main();
}
