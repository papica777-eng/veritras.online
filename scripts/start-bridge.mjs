
import { NeuralHUD } from '../src/core/neural-hud.ts';

console.log('╔══════════════════════════════════════════════════════════════════╗');
console.log('║               ⚡ QAntum Vortex: EMERGENCY BRIDGE ⚡               ║');
console.log('╚══════════════════════════════════════════════════════════════════╝');

const PORT = 3847;

async function startBridge() {
    try {
        console.log(`\n🔌 Initializing NeuralHUD on port ${PORT}...`);

        const hud = new NeuralHUD({
            port: PORT,
            enableCors: true,
            telemetryInterval: 1000
        });

        await hud.start();

        console.log(`✅ BRIDGE STATUS: ONLINE`);
        console.log(`📡 Listening on: http://localhost:${PORT}`);
        console.log(`🧬 Telemetry: ACTIVE`);
        console.log(`\n[Keep this window open to maintain Neural Link]`);

    } catch (error) {
        console.error('❌ BRIDGE FAILED:', error);
        process.exit(1);
    }
}

startBridge();
