/**
 * debug-evolution — Qantum Module
 * @module debug-evolution
 * @path scripts/debug-evolution.ts
 * @auto-documented BrutalDocEngine v2.1
 */


import { EvolutionaryHardening } from '../src/core/evolution/EvolutionaryHardening';
import { VortexHealingNexus, HealingDomain } from '../src/core/evolution/VortexHealingNexus';

async function test() {
    console.log('--- Debugging EvolutionaryHardening ---');

    // 1. Test direct usage
    try {
        console.log('1. Testing direct instantiation...');
        const hardener = EvolutionaryHardening.getInstance();
        const result = await hardener.harden('test.ts', 'SyntaxError: Unexpected token }');
        console.log('Direct Result:', result);
    } catch (e) {
        console.error('Direct Instantiation Failed:', e);
    }

    // 2. Test integration via Nexus
    try {
        console.log('\n2. Testing Nexus integration...');
        const nexus = VortexHealingNexus.getInstance();
        const context = {
            path: 'test.ts',
            error: 'SyntaxError: Unexpected token }',
            code: 'function broken() { return; }}'
        };

        console.log('Initiating healing...');
        const result = await nexus.initiateHealing(HealingDomain.LOGIC, context);
        console.log('Nexus Result Success:', result.success);
        console.log('Nexus Result Strategy:', result.strategy);
        console.log('Nexus Result Error:', result.error);
    } catch (e) {
        console.error('Nexus Integration Failed:', e);
    }
}

    // Complexity: O(1)
test().catch(console.error);
