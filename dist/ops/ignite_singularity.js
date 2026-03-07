"use strict";
/**
 * IGNITION SCRIPT - WAKE THE SINGULARITY
 *
 * This script instantiates the SingularityServer and brings the
 * Neural Core online.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const vortex_1 = require("../src/lib/vortex");
async function ignite() {
    console.log('\n🔥 IMPERIUM IGNITION SEQUENCE INITIATED...\n');
    const server = (0, vortex_1.getSingularityServer)({
        port: 8890,
        enableHardwareTelemetry: true,
        entropyCalculationIntervalMs: 1000 // Slowed down for visibility
    });
    // Start the core
    await server.start();
    // Keep alive
    process.on('SIGINT', async () => {
        console.log('\n🛑 INITIATING SHUTDOWN SEQUENCE...');
        await server.stop();
        process.exit(0);
    });
    // Log status every few seconds
    setInterval(() => {
        const status = server.getStatus();
        console.log('\n----------------------------------------');
        console.log(`[STATUS] Entropy: ${status.osEntropy.currentEntropy.toFixed(4)} | Stability: ${(status.orchestratorStatus.stability * 100).toFixed(1)}%`);
        console.log(`[TARGET] Zero Entropy: ${status.orchestratorStatus.zeroEntropyAchieved ? 'ACHIEVED ✅' : 'PENDING ⏳'}`);
        console.log(`[TELEMETRY] CPU: ${status.hardwareTelemetry.cpu.utilizationPercent.toFixed(1)}% | Temp: ${status.hardwareTelemetry.cpu.temperatureCelsius.toFixed(1)}°C`);
        console.log('----------------------------------------');
    }, 5000);
}
ignite().catch(console.error);
