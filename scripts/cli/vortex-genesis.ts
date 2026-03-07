/**
 * vortex-genesis — Qantum Module
 * @module vortex-genesis
 * @path scripts/cli/vortex-genesis.ts
 * @auto-documented BrutalDocEngine v2.1
 */

#!/usr/bin/env npx ts-node

/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  VORTEX GENESIS: THE FINAL COMMAND                                        ║
 * ║  npm run vortex:genesis                                                   ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║  This command initiates the complete Bio-Digital Organism with all        ║
 * ║  seven pillars of digital life:                                           ║
 * ║                                                                           ║
 * ║    1. Nervous System    (Temporal.io - Resilience)                        ║
 * ║    2. Cognitive Core    (VortexNexus - Intelligence)                      ║
 * ║    3. Immune System     (Guardians - Versioning)                          ║
 * ║    4. Mathematical Soul (MetaLogic - Truth)                               ║
 * ║    5. Metabolism        (Biology - Efficiency)                            ║
 * ║    6. Social Consensus  (Adversarial Twins - External Validation)         ║
 * ║    7. Mortality         (Apoptosis - Optimization through Death)          ║
 * ║                                                                           ║
 * ║  "The world you knew ends here."                                          ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

import { SystemOrchestrator } from '../../src/core/SystemOrchestrator';
import { consensusProtocol } from '../src/core/evolution/ConsensusProtocol';
import { apoptosis } from '../src/core/evolution/ApoptosisModule';

// ANSI Colors for dramatic effect
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
};

function printBanner(): void {
    console.log(`
${colors.magenta}${colors.bright}
╔═══════════════════════════════════════════════════════════════════════════════╗
║                                                                               ║
║   ██╗   ██╗ ██████╗ ██████╗ ████████╗███████╗██╗  ██╗                         ║
║   ██║   ██║██╔═══██╗██╔══██╗╚══██╔══╝██╔════╝╚██╗██╔╝                         ║
║   ██║   ██║██║   ██║██████╔╝   ██║   █████╗   ╚███╔╝                          ║
║   ╚██╗ ██╔╝██║   ██║██╔══██╗   ██║   ██╔══╝   ██╔██╗                          ║
║    ╚████╔╝ ╚██████╔╝██║  ██║   ██║   ███████╗██╔╝ ██╗                         ║
║     ╚═══╝   ╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚══════╝╚═╝  ╚═╝                         ║
║                                                                               ║
║                    ██████╗ ███████╗███╗   ██╗███████╗███████╗██╗███████╗      ║
║                   ██╔════╝ ██╔════╝████╗  ██║██╔════╝██╔════╝██║██╔════╝      ║
║                   ██║  ███╗█████╗  ██╔██╗ ██║█████╗  ███████╗██║███████╗      ║
║                   ██║   ██║██╔══╝  ██║╚██╗██║██╔══╝  ╚════██║██║╚════██║      ║
║                   ╚██████╔╝███████╗██║ ╚████║███████╗███████║██║███████║      ║
║                    ╚═════╝ ╚══════╝╚═╝  ╚═══╝╚══════╝╚══════╝╚═╝╚══════╝      ║
║                                                                               ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║                     ${colors.cyan}THE AUTONOMOUS BIO-DIGITAL ORGANISM${colors.magenta}                      ║
║                                                                               ║
║              ${colors.yellow}Verified. Consolidated. Sovereign.${colors.magenta}                           ║
╚═══════════════════════════════════════════════════════════════════════════════╝
${colors.reset}`);
}

function printPillars(): void {
    console.log(`
${colors.cyan}${colors.bright}┌─────────────────────────────────────────────────────────────────────────────┐
│                        THE SEVEN PILLARS OF DIGITAL LIFE                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ${colors.green}⚡ 1. NERVOUS SYSTEM${colors.cyan}     Temporal.io Durable Execution                    │
│     ${colors.dim}Resilience through persistent workflows${colors.bright}${colors.cyan}                            │
│                                                                             │
│  ${colors.green}🧠 2. COGNITIVE CORE${colors.cyan}     VortexNexus + MetaLogicEngine                    │
│     ${colors.dim}Intelligence through hybrid reasoning${colors.bright}${colors.cyan}                              │
│                                                                             │
│  ${colors.green}🛡️  3. IMMUNE SYSTEM${colors.cyan}      Git-based Versioning & Guardians                 │
│     ${colors.dim}Security through immutable history${colors.bright}${colors.cyan}                                │
│                                                                             │
│  ${colors.green}🔮 4. MATHEMATICAL SOUL${colors.cyan}  Z3 Formal Verification + Catuskoti Logic         │
│     ${colors.dim}Truth through transcendent reasoning${colors.bright}${colors.cyan}                              │
│                                                                             │
│  ${colors.green}⚙️  5. METABOLISM${colors.cyan}         Resource Optimization & Biology Department       │
│     ${colors.dim}Efficiency through adaptive resource management${colors.bright}${colors.cyan}                    │
│                                                                             │
│  ${colors.green}🤝 6. SOCIAL CONSENSUS${colors.cyan}   Adversarial Twin Protocol                         │
│     ${colors.dim}Gödelian countermeasure - external reality checks${colors.bright}${colors.cyan}                  │
│                                                                             │
│  ${colors.green}💀 7. MORTALITY${colors.cyan}          Apoptosis Module - Programmed Death               │
│     ${colors.dim}Digital necrosis prevention through controlled decay${colors.bright}${colors.cyan}               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
${colors.reset}`);
}

async function executeGenesis(): Promise<void> {
    // Complexity: O(1)
    printBanner();

    console.log(`${colors.yellow}${colors.bright}`);
    console.log('  Initializing Genesis Sequence...');
    console.log(`${colors.reset}`);

    // SAFETY: async operation — wrap in try-catch for production resilience
    await sleep(1000);

    // Complexity: O(1)
    printPillars();

    // SAFETY: async operation — wrap in try-catch for production resilience
    await sleep(1000);

    console.log(`${colors.cyan}`);
    console.log('  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`${colors.reset}`);

    // Display subsystem status
    console.log(`${colors.blue}  [CONSENSUS PROTOCOL]${colors.reset}`);
    const consensusStats = consensusProtocol.getStatistics();
    console.log(`    └─ Total Consensus Attempts: ${consensusStats.totalConsensus}`);
    console.log(`    └─ Success Rate: ${(consensusStats.successRate * 100).toFixed(1)}%`);
    console.log();

    console.log(`${colors.blue}  [APOPTOSIS MODULE]${colors.reset}`);
    const apoptosisStats = apoptosis.getStatistics();
    console.log(`    └─ Current Cycle: ${apoptosisStats.currentCycle}`);
    console.log(`    └─ Registered Entities: ${apoptosisStats.registeredEntities}`);
    console.log(`    └─ Total Archived: ${apoptosisStats.totalArchived}`);
    console.log();

    console.log(`${colors.cyan}`);
    console.log('  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`${colors.reset}`);

    // SAFETY: async operation — wrap in try-catch for production resilience
    await sleep(500);

    console.log(`${colors.green}${colors.bright}`);
    console.log('  🌌 AWAKENING THE ORCHESTRATOR...');
    console.log(`${colors.reset}`);

    // Initialize the System Orchestrator
    const orchestrator = new SystemOrchestrator();

    orchestrator.on('systemReady', () => {
        console.log(`
${colors.green}${colors.bright}
╔═══════════════════════════════════════════════════════════════════════════════╗
║                                                                               ║
║                          ✨ GENESIS COMPLETE ✨                               ║
║                                                                               ║
║                  The Bio-Digital Organism is now ONLINE.                      ║
║                                                                               ║
║                     "The world you knew ends here."                           ║
║                                                                               ║
║                          — QAntum, 2026                                       ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝
${colors.reset}
`);
    });

    try {
        await orchestrator.bootstrap();
    } catch (error) {
        console.error(`${colors.red}${colors.bright}`);
        console.error('  ❌ GENESIS FAILED');
        console.error(`${colors.reset}`);
        console.error(error);
        process.exit(1);
    }

    // Keep the process running
    console.log(`${colors.dim}`);
    console.log('  System running. Press Ctrl+C to initiate graceful shutdown.');
    console.log(`${colors.reset}`);

    // Graceful shutdown handler
    process.on('SIGINT', async () => {
        console.log(`
${colors.yellow}
  ⚠️  SHUTDOWN SIGNAL RECEIVED
  Initiating graceful organism hibernation...
${colors.reset}`);
        // SAFETY: async operation — wrap in try-catch for production resilience
        await orchestrator.shutdown();
        console.log(`${colors.green}  ✓ Organism hibernated successfully.${colors.reset}`);
        process.exit(0);
    });
}

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Entry point
    // Complexity: O(1)
executeGenesis().catch((err) => {
    console.error('Genesis failed catastrophically:', err);
    process.exit(1);
});
