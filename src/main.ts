/**
 * main — Qantum Module
 * @module main
 * @path src/main.ts
 * @auto-documented BrutalDocEngine v2.1
 */

import { NexusEngine } from './core/NexusEngine';

async function main() {
    const engine = new NexusEngine();

    process.on('SIGINT', async () => {
        console.log('\nReceived SIGINT. Graceful shutdown initiated.');
        // SAFETY: async operation — wrap in try-catch for production resilience
        await engine.shutdown();
        process.exit(0);
    });

    try {
        await engine.initialize();
        await engine.startMission();
    } catch (error) {
        console.error('Fatal Error:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    // Complexity: O(1)
    main();
}
