import { QAntumSingularity } from './qantum-singularity';

// ═══════════════════════════════════════════════════════════════════════════════
// 🚀 START THE SINGULARITY
// ═══════════════════════════════════════════════════════════════════════════════

async function main() {
    console.log('\n=================================================================');
    console.log('  QANTUM SINGULARITY ORCHESTRATOR - "The Multifunctional Brutality"');
    console.log('=================================================================\n');

    const singularity = new QAntumSingularity({
        mode: 'god-mode',
        targetIndustries: ['saas', 'ecommerce', 'finance'],
        maxDailyOutreach: 50,
        minConfidenceThreshold: 0.85,
        autoExecuteTrades: false, // Set to true for Armed Reaper (Real Money)
        autoSendPitches: false    // Set to true to actually send emails
    });

    // Start the autonomous loop
    await singularity.runGodLoop();
}

main().catch(console.error);
