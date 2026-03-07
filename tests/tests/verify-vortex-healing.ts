
import { vortex } from '../src/core/sys/VortexAI';
import { hybridHealer } from '../src/core/sys/HybridHealer';

async function main() {
    console.log('🧪 STARTING VORTEX & HEALER VERIFICATION');
    console.log('════════════════════════════════════════');

    // 1. Start Vortex (Should show GPU Banner)
    console.log('\n[TEST 1] Starting Vortex AI...');
    try {
        await vortex.start();
        console.log('✅ Vortex AI Started Successfully');

        const status = (vortex as any).isRunning ? 'RUNNING' : 'STOPPED'; // Access private if needed or check console
        console.log(`Vortex Status: ${status}`);
    } catch (error) {
        console.error('❌ Vortex Failed to Start:', error);
    }

    // 2. Test Hybrid Healer
    console.log('\n[TEST 2] Testing Hybrid Healer Logic...');
    const mockError = new Error('Element containing text "Submit" not found');

    // Simulate a failure context
    const context = {
        source: 'TEST' as const,
        error: mockError,
        component: 'LoginButton',
        selector: '#btn-login-bad' // Intentional bad selector
    };

    console.log('Simulating error:', mockError.message);
    const result = await hybridHealer.heal(context);

    console.log('Healer Result:', JSON.stringify(result, null, 2));

    if (result.confidence > 0) {
        console.log('✅ Healer successfully generated a fix strategy.');
    } else {
        console.warn('⚠️ Healer returned low confidence (expected for this mock input).');
    }

    // Cleanup
    vortex.stop();
    console.log('\n════════════════════════════════════════');
    console.log('🧪 VERIFICATION COMPLETE');
}

main().catch(console.error);
