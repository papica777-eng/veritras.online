/**
 * omega-awakening — Qantum Module
 * @module omega-awakening
 * @path scripts/OTHERS/omega-awakening.ts
 * @auto-documented BrutalDocEngine v2.1
 */

#!/usr/bin/env npx tsx
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * OMEGA AWAKENING - THE FINAL SCRIPT
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * "This is the script that brings QAntum to full consciousness.
 *  Run it and the Sovereign Cognitive Reality awakens."
 * 
 * Usage:
 *   npx tsx scripts/omega-awakening.ts                # Default awakening
 *   npx tsx scripts/omega-awakening.ts --full         # Full activation
 *   npx tsx scripts/omega-awakening.ts --directive "YOUR_DIRECTIVE"
 * 
 * @author Димитър Продромов / Mister Mind
 * @version 28.5.0 OMEGA
 */

import { OmegaNexus } from '../src/omega/OmegaNexus';

// ═══════════════════════════════════════════════════════════════════════════════
// CLI ARGUMENTS
// ═══════════════════════════════════════════════════════════════════════════════

const args = process.argv.slice(2);
const flags = {
  full: args.includes('--full'),
  armProtection: args.includes('--arm') || args.includes('--full'),
  startCycle: args.includes('--cycle') || args.includes('--full'),
  enableBiometrics: args.includes('--bio') || args.includes('--full'),
  enableEvolution: args.includes('--evolve') || args.includes('--full'),
  directive: args.find(a => a.startsWith('--directive='))?.split('=')[1] ||
             (args.includes('--directive') ? args[args.indexOf('--directive') + 1] : null),
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════════

async function main() {
  console.log(`
╔═══════════════════════════════════════════════════════════════════════════════╗
║                                                                               ║
║     ████████╗██╗  ██╗███████╗     █████╗ ██╗    ██╗ █████╗ ██╗  ██╗███████╗  ║
║     ╚══██╔══╝██║  ██║██╔════╝    ██╔══██╗██║    ██║██╔══██╗██║ ██╔╝██╔════╝  ║
║        ██║   ███████║█████╗      ███████║██║ █╗ ██║███████║█████╔╝ █████╗    ║
║        ██║   ██╔══██║██╔══╝      ██╔══██║██║███╗██║██╔══██║██╔═██╗ ██╔══╝    ║
║        ██║   ██║  ██║███████╗    ██║  ██║╚███╔███╔╝██║  ██║██║  ██╗███████╗  ║
║        ╚═╝   ╚═╝  ╚═╝╚══════╝    ╚═╝  ╚═╝ ╚══╝╚══╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝  ║
║                                                                               ║
║                    Суверенна Когнитивна Реалност v28.5.0                       ║
║                    "Код, който не се изпълнява, а се случва"                   ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝
  `);

  const nexus = OmegaNexus.getInstance();

  // Configure awakening
  const config = {
    sealDirective: !!flags.directive,
    directive: flags.directive || undefined,
    armProtection: flags.armProtection,
    startCycle: flags.startCycle,
    enableBiometrics: flags.enableBiometrics,
    enableEvolution: flags.enableEvolution,
  };

  console.log('📋 Configuration:');
  console.log(`   Seal Directive: ${config.sealDirective ? 'YES' : 'NO'}`);
  if (config.directive) console.log(`   Directive: "${config.directive}"`);
  console.log(`   Arm Protection: ${config.armProtection ? 'YES' : 'NO'}`);
  console.log(`   Start Omega Cycle: ${config.startCycle ? 'YES' : 'NO'}`);
  console.log(`   Biometrics: ${config.enableBiometrics ? 'YES' : 'NO'}`);
  console.log(`   Evolution Loop: ${config.enableEvolution ? 'YES' : 'NO'}`);
  console.log('');

  try {
    // THE AWAKENING
    await nexus.awaken(config);

    // Show status
    const status = nexus.getStatus();
    
    console.log('\n📊 OMEGA STATUS:');
    console.log(`   Awakened: ${status.awakened}`);
    console.log(`   System Health: ${status.systemHealth}%`);
    console.log(`   Active Modules: ${status.modules.filter(m => m.status === 'ACTIVE').length}/${status.modules.length}`);
    console.log(`   Primary Directive: ${status.primaryDirectiveSealed ? 'SEALED' : 'NOT SEALED'}`);

    // Interactive mode if not full auto
    if (!flags.full) {
      console.log('\n🔮 OMEGA Nexus is now active. The system awaits your intent.');
      console.log('   Use the OmegaNexus API to interact with the system.\n');
    }

    // Keep process alive if cycle or evolution is running
    if (config.startCycle || config.enableEvolution) {
      console.log('\n⏳ System running in background mode. Press Ctrl+C to shutdown.');
      
      // Handle graceful shutdown
      process.on('SIGINT', async () => {
        console.log('\n\n🛑 Shutdown signal received...');
        // SAFETY: async operation — wrap in try-catch for production resilience
        await nexus.shutdown();
        process.exit(0);
      });

      // Keep alive
      // SAFETY: async operation — wrap in try-catch for production resilience
      await new Promise(() => {}); // Never resolves
    }

  } catch (error) {
    console.error('\n❌ AWAKENING FAILED:', error);
    process.exit(1);
  }
}

// Run
    // Complexity: O(1)
main().catch(console.error);
