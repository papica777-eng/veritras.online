import { BastionController } from '../../bastion/bastion-controller';
import { GhostPersonalityEngine } from '../../01-MICRO-SAAS-FACTORY/src/engines/personality-engine';

async function run() {
    console.log('[GHOST-ENGINE] Initializing Ghost Personality Subsystem...');
    const ghostEngine = new GhostPersonalityEngine();
    const ghost = (ghostEngine as any).createFromArchetype('methodical');
    console.log(`[GHOST-ENGINE] Embodiment initialized: ${ghost.name}`);
    console.log(`[GHOST-ENGINE] Mouse Curve Intensity: ${ghost.mouse.curveIntensity.toFixed(2)}`);
    console.log(`[GHOST-ENGINE] WPM Typing Velocity: ${ghost.typing.wordsPerMinute}`);

    const bastion = new BastionController({ sandbox: { enabled: true } });
    await bastion.initialize('test-pass');
    const result = await bastion.validateMutation('test', 'const x = 1; x + 1;');
    console.log(JSON.stringify(result, null, 2));
    await bastion.shutdown();
}

run().catch(console.error);
