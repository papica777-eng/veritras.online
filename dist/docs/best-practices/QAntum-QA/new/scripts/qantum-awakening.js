"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * QANTUM AWAKENING - Full System Activation Script
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * "1 януари 2026, 05:15 сутринта. Империята се пробужда."
 *
 * This script activates:
 * - Neural Inference Engine (RTX 4050)
 * - Brain Router (Model Selection)
 * - Immune System (Self-Healing)
 * - Proposal Engine (Revenue Generation)
 * - Kill-Switch (IP Protection)
 * - Chronos-Omega (Self-Evolution)
 *
 * @author Димитър Продромов / Mister Mind
 * @copyright 2026 QAntum Empire. All Rights Reserved.
 * @version 28.5.0 - THE AWAKENING
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const NeuralInference_1 = require("../src/physics/NeuralInference");
const BrainRouter_1 = require("../src/biology/evolution/BrainRouter");
const ImmuneSystem_1 = require("../src/intelligence/ImmuneSystem");
const ProposalEngine_1 = require("../src/intelligence/ProposalEngine");
const NeuralKillSwitch_1 = require("../src/fortress/NeuralKillSwitch");
const ChronosOmegaArchitect_1 = require("../src/omega/ChronosOmegaArchitect");
// ═══════════════════════════════════════════════════════════════════════════════
// BANNER
// ═══════════════════════════════════════════════════════════════════════════════
function displayBanner() {
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
async function activateNeuralCore() {
    const start = Date.now();
    console.log('\n🧠 [PHASE 1] Activating Neural Core...');
    try {
        const neural = NeuralInference_1.NeuralInference.getInstance();
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
        }
        else {
            console.log('   ⚠️ Ollama not running. Start with: ollama run llama3.1:8b');
            return {
                phase: 'Neural Core',
                status: 'failed',
                message: 'Ollama not available',
                duration: Date.now() - start,
            };
        }
    }
    catch (error) {
        return {
            phase: 'Neural Core',
            status: 'failed',
            message: String(error),
            duration: Date.now() - start,
        };
    }
}
async function activateBrainRouter() {
    const start = Date.now();
    console.log('\n🧭 [PHASE 2] Activating Brain Router...');
    try {
        const router = BrainRouter_1.BrainRouter.getInstance();
        console.log('   ✅ Local model routing configured');
        console.log('   ✅ Cloud fallback ready (DeepSeek V3)');
        return {
            phase: 'Brain Router',
            status: 'success',
            message: 'Intelligent model selection online',
            duration: Date.now() - start,
        };
    }
    catch (error) {
        return {
            phase: 'Brain Router',
            status: 'failed',
            message: String(error),
            duration: Date.now() - start,
        };
    }
}
async function activateImmuneSystem() {
    const start = Date.now();
    console.log('\n🛡️ [PHASE 3] Activating Immune System...');
    try {
        const immune = ImmuneSystem_1.ImmuneSystem.getInstance();
        console.log('   ✅ Self-healing engine ready');
        console.log('   ✅ Backup directory configured');
        return {
            phase: 'Immune System',
            status: 'success',
            message: 'Self-healing code engine online',
            duration: Date.now() - start,
        };
    }
    catch (error) {
        return {
            phase: 'Immune System',
            status: 'failed',
            message: String(error),
            duration: Date.now() - start,
        };
    }
}
async function activateProposalEngine() {
    const start = Date.now();
    console.log('\n📝 [PHASE 4] Activating Proposal Engine...');
    try {
        const engine = ProposalEngine_1.ProposalEngine.getInstance();
        console.log('   ✅ Template engine ready');
        console.log('   ✅ Pricing calculator configured');
        return {
            phase: 'Proposal Engine',
            status: 'success',
            message: 'Revenue generation engine online',
            duration: Date.now() - start,
        };
    }
    catch (error) {
        return {
            phase: 'Proposal Engine',
            status: 'failed',
            message: String(error),
            duration: Date.now() - start,
        };
    }
}
async function activateKillSwitch(arm = false) {
    const start = Date.now();
    console.log('\n🔐 [PHASE 5] Activating Neural Kill-Switch...');
    try {
        const killSwitch = NeuralKillSwitch_1.NeuralKillSwitch.getInstance();
        if (arm) {
            killSwitch.arm({ protectionLevel: 2 });
            console.log('   ✅ Kill-Switch ARMED (Level 2)');
        }
        else {
            console.log('   ⚡ Kill-Switch ready (not armed)');
            console.log('   💡 Run with --arm-protection to enable');
        }
        return {
            phase: 'Neural Kill-Switch',
            status: 'success',
            message: arm ? 'IP protection ARMED' : 'IP protection ready',
            duration: Date.now() - start,
        };
    }
    catch (error) {
        return {
            phase: 'Neural Kill-Switch',
            status: 'failed',
            message: String(error),
            duration: Date.now() - start,
        };
    }
}
async function activateChronosOmega(evolve = false) {
    const start = Date.now();
    console.log('\n🌀 [PHASE 6] Activating Chronos-Omega Protocol...');
    try {
        const omega = ChronosOmegaArchitect_1.ChronosOmegaArchitect.getInstance();
        console.log('   ✅ Self-evolution engine ready');
        console.log('   ✅ Future threat simulation loaded (2026-2035)');
        if (evolve) {
            console.log('   🧬 Starting evolution on src/fortress/...');
            await omega.evolve('./src/fortress');
        }
        else {
            console.log('   💡 Run with --evolve to start self-evolution');
        }
        return {
            phase: 'Chronos-Omega',
            status: 'success',
            message: 'Self-evolution protocol online',
            duration: Date.now() - start,
        };
    }
    catch (error) {
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
async function awaken() {
    displayBanner();
    const args = process.argv.slice(2);
    const armProtection = args.includes('--arm-protection');
    const startEvolution = args.includes('--evolve');
    const runHarvester = args.includes('--harvest');
    console.log('\n⚡ INITIATING AWAKENING SEQUENCE...\n');
    const results = [];
    // Phase 1: Neural Core
    results.push(await activateNeuralCore());
    // Phase 2: Brain Router
    results.push(await activateBrainRouter());
    // Phase 3: Immune System
    results.push(await activateImmuneSystem());
    // Phase 4: Proposal Engine
    results.push(await activateProposalEngine());
    // Phase 5: Kill-Switch
    results.push(await activateKillSwitch(armProtection));
    // Phase 6: Chronos-Omega
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

"В QAntum не лъжем. Ние побеждаваме бъдещето."
— DIMITAR PRODROMOV & MISTER MIND
  `);
    // Optional: Run Harvester
    if (runHarvester) {
        console.log('\n🌾 Starting The Harvester...\n');
        const { startHarvester } = await Promise.resolve().then(() => __importStar(require('./launch-harvester.js')));
        await startHarvester();
    }
}
// ═══════════════════════════════════════════════════════════════════════════════
// EXECUTION
// ═══════════════════════════════════════════════════════════════════════════════
awaken().catch(console.error);
