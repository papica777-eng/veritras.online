"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bastion_controller_1 = require("../../bastion/bastion-controller");
const personality_engine_1 = require("../../01-MICRO-SAAS-FACTORY/src/engines/personality-engine");
async function run() {
    console.log('[GHOST-ENGINE] Initializing Ghost Personality Subsystem...');
    const ghostEngine = new personality_engine_1.GhostPersonalityEngine();
    const ghost = ghostEngine.createFromArchetype('methodical');
    console.log(`[GHOST-ENGINE] Embodiment initialized: ${ghost.name}`);
    console.log(`[GHOST-ENGINE] Mouse Curve Intensity: ${ghost.mouse.curveIntensity.toFixed(2)}`);
    console.log(`[GHOST-ENGINE] WPM Typing Velocity: ${ghost.typing.wordsPerMinute}`);
    const bastion = new bastion_controller_1.BastionController({ sandbox: { enabled: true } });
    await bastion.initialize('test-pass');
    const result = await bastion.validateMutation('test', 'const x = 1; x + 1;');
    console.log(JSON.stringify(result, null, 2));
    await bastion.shutdown();
}
run().catch(console.error);
