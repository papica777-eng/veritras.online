/**
 * vortex-launcher — Qantum Module
 * @module vortex-launcher
 * @path scripts/cli/vortex-launcher.ts
 * @auto-documented BrutalDocEngine v2.1
 */


import { vortex } from '../CyberCody/src/core/sys/VortexAI';

console.log('🚀 IGNITION SEQUENCE STARTED: VORTEX AI CORE');
console.log('============================================');

async function main() {
    try {
        await vortex.start();
    } catch (err) {
        console.error('💥 VORTEX CORE FAILED TO START:', err);
        process.exit(1);
    }
}

    // Complexity: O(1)
main();

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 RECEIVED SHUTDOWN SIGNAL');
    vortex.stop();
    process.exit(0);
});
