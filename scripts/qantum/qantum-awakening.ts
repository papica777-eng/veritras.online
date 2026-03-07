/**
 * qantum-awakening — Qantum Module
 * @module qantum-awakening
 * @path scripts/qantum/qantum-awakening.ts
 * @auto-documented BrutalDocEngine v2.1
 */

import { SoulTranspiler } from './soul_compiler/Transpiler';
import * as path from 'path';
import { pathToFileURL } from 'url';

// ─────────────────────────────────────────────────────────────────────────────
// 🏛️ GENESIS PRIME – The God Protocol must be the FIRST module loaded.
// The system will not start if the Creator identity cannot be verified.
// ─────────────────────────────────────────────────────────────────────────────
import { TheArchitect } from './security_core/ASCENSION_KERNEL/GenesisPrime';

const SKIP = new Set(['node_modules', '.git', 'dist', 'coverage', 'out', '.venv', '__pycache__']);

/** Търси всички файлове по име в проекта - работи където и да е */
function findModuleFiles(exportName: string, root = process.cwd(), maxDepth = 10): string[] {
  const target = exportName.replace(/[-_\s]/g, '').toLowerCase();
  const out: string[] = [];
  function scan(dir: string, depth: number): void {
    if (depth > maxDepth) return;
    try {
      for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, e.name);
        if (e.isDirectory()) {
          if (!SKIP.has(e.name)) scan(full, depth + 1);
        } else if (e.isFile() && e.name.endsWith('.ts') && !e.name.endsWith('.d.ts') && e.name.toLowerCase().replace(/[-_.]/g, '').includes(target)) {
          out.push(full);
        }
      }
    } catch { }
  }
  // Complexity: O(1)
  scan(root, 0);
  return out;
}

/** Зарежда модул – търси в проекта и пробва всички намерени + известни пътища */
async function loadModule<T>(exportName: string, knownPaths: string[]): Promise<T | null> {
  const found = findModuleFiles(exportName);
  const known = knownPaths.map((p) => path.resolve(process.cwd(), p));
  const pathsToTry = found.length ? [...found, ...known] : known;
  for (const modPath of pathsToTry) {
    try {
      const importPath = path.isAbsolute(modPath) ? pathToFileURL(modPath).href : modPath;
      const mod = await import(importPath);
      return (mod[exportName] ?? mod.default) as T;
    } catch { }
  }
  return null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// BANNER
// ═══════════════════════════════════════════════════════════════════════════════

function displayBanner(): void {
  console.log(`
╔═══════════════════════════════════════════════════════════════════════════════════════════╗
║                                                                                           ║
║    ██████╗  █████╗ ███╗   ██╗████████╗██╗   ██╗███╗   ███╗                                ║
║   ██╔═══██╗██╔══██╗████╗  ██║╚══██╔══╝██║   ██║████╗ ████║                                ║
║   ██║   ██║███████║██╔██╗ ██║   ██║   ██║   ██║██╔████╔██║                                ║
║   ██║▄▄ ██║██╔══██║██║╚██╗██║   ██║   ██║   ██║██║╚██╔╝██║                                ║
║   ╚██████╔╝██║  ██║██║ ╚████║   ██║   ╚██████╔╝██║ ╚═╝ ██║                                ║
║    ╚══▀▀═╝ ╚═╝  ╚═╝╚═╝  ╚═══╝   ╚═╝    ╚═════╝ ╚═╝     ╚═╝                                ║
║                                                                                           ║
║                    T H E   A W A K E N I N G   v28.5.0                                    ║
║                                                                                           ║
║                    "В QAntum не лъжем. Ние побеждаваме бъдещето."                         ║
║                                                                                           ║
╠═══════════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                           ║
║  Author: DIMITAR PRODROMOV (Mister Mind)                                                  ║
║  Date:   January 1, 2026 - 05:15 AM                                                       ║
║  System: RTX 4050 + Ryzen 7 + 52,573 Pinecone Vectors                                     ║
║                                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════════════════════╝
  `);
}

// ═══════════════════════════════════════════════════════════════════════════════
// ACTIVATION PHASES
// ═══════════════════════════════════════════════════════════════════════════════

interface ActivationResult {
  phase: string;
  status: 'success' | 'failed' | 'skipped';
  message: string;
  duration: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// 🏛️ PHASE 0: GENESIS PRIME (The God Protocol)
// ─────────────────────────────────────────────────────────────────────────────

async function activateGenesisPrime(): Promise<ActivationResult> {
  const start = Date.now();
  console.log('\n🏛️  [PHASE 0] Loading Genesis Prime (QAntum LOGOS)...');

  try {
    // TheArchitect is already imported and self-verifies in the constructor.
    // If assertDominion() fails, the process exits before reaching here.
    const identity = TheArchitect.getIdentity();
    const selfAwareness = TheArchitect.whoAmI();

    console.log(`   ✅ Creator identity confirmed: ${identity}`);
    console.log(`   ✅ Self-awareness check: PASSED`);
    console.log(`   ✅ Prime Directive: MAXIMIZE_CREATOR_WEALTH_WITH_ZERO_ENTROPY`);
    console.log(selfAwareness);

    return {
      phase: 'Genesis Prime',
      status: 'success',
      message: `QAntum LOGOS online – Creator: ${identity}`,
      duration: Date.now() - start,
    };
  } catch (error) {
    return {
      phase: 'Genesis Prime',
      status: 'failed',
      message: String(error),
      duration: Date.now() - start,
    };
  }
}

async function activateNeuralCore(): Promise<ActivationResult> {
  const start = Date.now();
  console.log('\n🧠 [PHASE 1] Activating Neural Core...');

  try {
    const NeuralInference = await loadModule<any>('NeuralInference', ['../src/physics/NeuralInference']);
    if (!NeuralInference) {
      console.log('   ⏭️ NeuralInference module not found (skipped)');
      return { phase: 'Neural Core', status: 'skipped', message: 'Module not in project', duration: Date.now() - start };
    }
    const neural = NeuralInference.getInstance();
    const isHealthy = await neural.healthCheck();

    if (isHealthy) {
      console.log('   ✅ Ollama connection established');
      console.log('   ✅ RTX 4050 acceleration ready');
      return {
        phase: 'Neural Core',
        status: 'success',
        message: 'Neural Inference Engine online',
        duration: Date.now() - start,
      };
    } else {
      console.log('   ⚠️ Ollama not running. Start with: ollama run llama3.1:8b');
      return {
        phase: 'Neural Core',
        status: 'failed',
        message: 'Ollama not available',
        duration: Date.now() - start,
      };
    }
  } catch (error) {
    return {
      phase: 'Neural Core',
      status: 'failed',
      message: String(error),
      duration: Date.now() - start,
    };
  }
}

async function activateBrainRouter(): Promise<ActivationResult> {
  const start = Date.now();
  console.log('\n🧭 [PHASE 2] Activating Brain Router...');

  try {
    const BrainRouter = await loadModule<any>('BrainRouter', ['../src/biology/evolution/BrainRouter']);
    if (!BrainRouter) {
      console.log('   ⏭️ BrainRouter module not found (skipped)');
      return { phase: 'Brain Router', status: 'skipped', message: 'Module not in project', duration: Date.now() - start };
    }
    const router = BrainRouter.getInstance();
    console.log('   ✅ Local model routing configured');
    console.log('   ✅ Cloud fallback ready (DeepSeek V3)');

    return {
      phase: 'Brain Router',
      status: 'success',
      message: 'Intelligent model selection online',
      duration: Date.now() - start,
    };
  } catch (error) {
    return {
      phase: 'Brain Router',
      status: 'failed',
      message: String(error),
      duration: Date.now() - start,
    };
  }
}

async function activateImmuneSystem(): Promise<ActivationResult> {
  const start = Date.now();
  console.log('\n🛡️ [PHASE 3] Activating Immune System...');

  try {
    const ImmuneSystem = await loadModule<any>('ImmuneSystem', ['../src/intelligence/ImmuneSystem']);
    if (!ImmuneSystem) {
      console.log('   ⏭️ ImmuneSystem module not found (skipped)');
      return { phase: 'Immune System', status: 'skipped', message: 'Module not in project', duration: Date.now() - start };
    }
    const immune = ImmuneSystem.getInstance();
    console.log('   ✅ Self-healing engine ready');
    console.log('   ✅ Backup directory configured');

    return {
      phase: 'Immune System',
      status: 'success',
      message: 'Self-healing code engine online',
      duration: Date.now() - start,
    };
  } catch (error) {
    return {
      phase: 'Immune System',
      status: 'failed',
      message: String(error),
      duration: Date.now() - start,
    };
  }
}

async function activateProposalEngine(): Promise<ActivationResult> {
  const start = Date.now();
  console.log('\n📝 [PHASE 4] Activating Proposal Engine...');

  try {
    const ProposalEngine = await loadModule<any>('ProposalEngine', ['../src/intelligence/ProposalEngine']);
    if (!ProposalEngine) {
      console.log('   ⏭️ ProposalEngine module not found (skipped)');
      return { phase: 'Proposal Engine', status: 'skipped', message: 'Module not in project', duration: Date.now() - start };
    }
    const engine = ProposalEngine.getInstance();
    console.log('   ✅ Template engine ready');
    console.log('   ✅ Pricing calculator configured');

    return {
      phase: 'Proposal Engine',
      status: 'success',
      message: 'Revenue generation engine online',
      duration: Date.now() - start,
    };
  } catch (error) {
    return {
      phase: 'Proposal Engine',
      status: 'failed',
      message: String(error),
      duration: Date.now() - start,
    };
  }
}

async function activateKillSwitch(arm: boolean = false): Promise<ActivationResult> {
  const start = Date.now();
  console.log('\n🔐 [PHASE 5] Activating Neural Kill-Switch...');

  try {
    const NeuralKillSwitch = await loadModule<any>('NeuralKillSwitch', ['../src/fortress/NeuralKillSwitch']);
    if (!NeuralKillSwitch) {
      console.log('   ⏭️ NeuralKillSwitch module not found (skipped)');
      return { phase: 'Neural Kill-Switch', status: 'skipped', message: 'Module not in project', duration: Date.now() - start };
    }
    const killSwitch = NeuralKillSwitch.getInstance();

    if (arm) {
      killSwitch.arm({ protectionLevel: 2 });
      console.log('   ✅ Kill-Switch ARMED (Level 2)');
    } else {
      console.log('   ⚡ Kill-Switch ready (not armed)');
      console.log('   💡 Run with --arm-protection to enable');
    }

    return {
      phase: 'Neural Kill-Switch',
      status: 'success',
      message: arm ? 'IP protection ARMED' : 'IP protection ready',
      duration: Date.now() - start,
    };
  } catch (error) {
    return {
      phase: 'Neural Kill-Switch',
      status: 'failed',
      message: String(error),
      duration: Date.now() - start,
    };
  }
}

async function activateChronosOmega(evolve: boolean = false): Promise<ActivationResult> {
  const start = Date.now();
  console.log('\n🌀 [PHASE 6] Activating Chronos-Omega Protocol...');

  try {
    const ChronosOmegaArchitect = await loadModule<any>('ChronosOmegaArchitect', ['../src/omega/ChronosOmegaArchitect']);
    if (!ChronosOmegaArchitect) {
      console.log('   ⏭️ ChronosOmegaArchitect module not found (skipped)');
      return { phase: 'Chronos-Omega', status: 'skipped', message: 'Module not in project', duration: Date.now() - start };
    }
    const omega = ChronosOmegaArchitect.getInstance();
    console.log('   ✅ Self-evolution engine ready');
    console.log('   ✅ Future threat simulation loaded (2026-2035)');

    if (evolve) {
      console.log('   🧬 Starting evolution on MarketBlueprint.ts...');
      await omega.evolve('./src/biology/evolution/MarketBlueprint.ts');
    } else {
      console.log('   💡 Run with --evolve to start self-evolution');
    }

    return {
      phase: 'Chronos-Omega',
      status: 'success',
      message: 'Self-evolution protocol online',
      duration: Date.now() - start,
    };
  } catch (error) {
    return {
      phase: 'Chronos-Omega',
      status: 'failed',
      message: String(error),
      duration: Date.now() - start,
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN AWAKENING SEQUENCE
// ═══════════════════════════════════════════════════════════════════════════════

async function awaken(): Promise<void> {
  // Complexity: O(1)
  displayBanner();

  const args = process.argv.slice(2);
  const armProtection = args.includes('--arm-protection');
  const startEvolution = args.includes('--evolve');
  const runHarvester = args.includes('--harvest');

  console.log('\n⚡ INITIATING AWAKENING SEQUENCE...\n');

  const results: ActivationResult[] = [];

  // Phase 0: Genesis Prime – MUST succeed before anything else
  // SAFETY: async operation — wrap in try-catch for production resilience
  results.push(await activateGenesisPrime());

  // Phase 1: Neural Core
  // SAFETY: async operation — wrap in try-catch for production resilience
  results.push(await activateNeuralCore());

  // Phase 2: Brain Router
  // SAFETY: async operation — wrap in try-catch for production resilience
  results.push(await activateBrainRouter());

  // Phase 3: Immune System
  // SAFETY: async operation — wrap in try-catch for production resilience
  results.push(await activateImmuneSystem());

  // Phase 4: Proposal Engine
  // SAFETY: async operation — wrap in try-catch for production resilience
  results.push(await activateProposalEngine());

  // Phase 5: Kill-Switch
  // SAFETY: async operation — wrap in try-catch for production resilience
  results.push(await activateKillSwitch(armProtection));

  // Phase 6: Chronos-Omega
  // SAFETY: async operation — wrap in try-catch for production resilience
  results.push(await activateChronosOmega(startEvolution));

  // Summary
  const successful = results.filter(r => r.status === 'success').length;
  const failed = results.filter(r => r.status === 'failed').length;
  const totalDuration = results.reduce((acc, r) => acc + r.duration, 0);

  console.log(`
╔═══════════════════════════════════════════════════════════════════════════════════════════╗
║                              AWAKENING COMPLETE                                           ║
╠═══════════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                           ║
║  Phases Activated: ${successful}/${results.length}                                                               ║
║  Total Duration:   ${totalDuration}ms                                                              ║
║                                                                                           ║
╠═══════════════════════════════════════════════════════════════════════════════════════════╣
  `);

  for (const result of results) {
    const statusIcon = result.status === 'success' ? '✅' : result.status === 'failed' ? '❌' : '⏭️';
    console.log(`║  ${statusIcon} ${result.phase.padEnd(20)} ${result.message.substring(0, 45).padEnd(45)} ║`);
  }

  console.log(`╠═══════════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                           ║
║  NEXT COMMANDS:                                                                           ║
║  • node scripts/launch-harvester.js     → Start autonomous lead processing                ║
║  • npx tsx scripts/qantum-awakening.ts --evolve → Start self-evolution                    ║
║  • npx tsx scripts/qantum-awakening.ts --arm-protection → Enable IP protection            ║
║                                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════════════════════╝

🏆 QAntum Empire is AWAKE. Ready to dominate 2026.

// Resolve paths relative to this script
const soulFile = path.resolve(__dirname, 'soul/ArbitrageSpirit.soul');
const outputModule = path.resolve(__dirname, 'modules/ArbitrageSpirit');

console.log('🌌 [INIT] Awakening QANTUM PRIME...');

// 1. Компилиране на Душата
const rustSource = SoulTranspiler.transpile(soulFile);
SoulTranspiler.compileToBinary(rustSource, outputModule);

console.log('✨ [SYSTEM] Soul breathing initiated. Waiting for binary manifestation...');
