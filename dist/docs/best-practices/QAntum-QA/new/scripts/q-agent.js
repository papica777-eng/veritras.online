#!/usr/bin/env npx tsx
"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * Q-AGENT - Your Terminal Oracle
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * "Когато Claude каже „Rate limit reached", ти просто пишеш:
 *  q-agent „продължи откъдето спряхме и оправи грешката""
 *
 * Usage:
 *   npx tsx scripts/q-agent.ts "your command"
 *   npx tsx scripts/q-agent.ts "fix this file" --file ./src/module.ts
 *   npx tsx scripts/q-agent.ts --swap "continue from where we left off"
 *   npx tsx scripts/q-agent.ts --status
 *
 * PowerShell Alias (add to your profile):
 *   function q-agent($msg) {
 *     $file = (Get-Location).Path
 *     npx tsx scripts/q-agent.ts "$msg" --file "$file"
 *   }
 *
 * @author Димитър Продромов / Mister Mind
 * @version 30.3.0 - THE SOVEREIGN FAILOVER
 */
Object.defineProperty(exports, "__esModule", { value: true });
const AIAgentExpert_1 = require("../src/intelligence/AIAgentExpert");
const FailoverAgent_1 = require("../src/intelligence/FailoverAgent");
const OmegaCycle_1 = require("../src/omega/OmegaCycle");
// ═══════════════════════════════════════════════════════════════════════════════
// CLI ARGUMENTS
// ═══════════════════════════════════════════════════════════════════════════════
const args = process.argv.slice(2);
// Find the command (first non-flag argument)
const command = args.find(a => !a.startsWith('--')) || '';
// Parse flags
const flags = {
    file: args.find(a => a.startsWith('--file='))?.split('=')[1] ||
        (args.includes('--file') ? args[args.indexOf('--file') + 1] : null),
    swap: args.includes('--swap'),
    status: args.includes('--status'),
    fix: args.includes('--fix'),
    evolve: args.includes('--evolve'),
    audit: args.includes('--audit'),
    opus: args.includes('--opus'),
    help: args.includes('--help') || args.includes('-h'),
};
// ═══════════════════════════════════════════════════════════════════════════════
// HELP
// ═══════════════════════════════════════════════════════════════════════════════
function showHelp() {
    console.log(`
╔═══════════════════════════════════════════════════════════════════════════════╗
║                    🤖 Q-AGENT - QAntum Terminal Oracle 🤖                      ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║                                                                               ║
║  Usage:                                                                       ║
║    npx tsx scripts/q-agent.ts "command" [options]                             ║
║                                                                               ║
║  Options:                                                                     ║
║    --file <path>   Target file for the command                                ║
║    --swap          Use Failover Agent (for rate limit recovery)               ║
║    --fix           Fix mode - automatically apply fixes                       ║
║    --evolve        Evolve mode - use Chronos-Omega                            ║
║    --audit         Audit mode - security analysis                             ║
║    --opus          Maximum reasoning depth (slower, more accurate)            ║
║    --status        Show system status                                         ║
║    --help, -h      Show this help                                             ║
║                                                                               ║
║  Examples:                                                                    ║
║    npx tsx scripts/q-agent.ts "explain this code" --file ./src/app.ts         ║
║    npx tsx scripts/q-agent.ts "fix all errors" --fix --file ./src/            ║
║    npx tsx scripts/q-agent.ts --swap "continue from where we left off"        ║
║    npx tsx scripts/q-agent.ts --status                                        ║
║                                                                               ║
║  PowerShell Integration:                                                      ║
║    Add to your profile ($PROFILE):                                            ║
║    function q($msg) { npx tsx scripts/q-agent.ts "$msg" }                     ║
║    function q-swap($msg) { npx tsx scripts/q-agent.ts --swap "$msg" }         ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝
  `);
}
// ═══════════════════════════════════════════════════════════════════════════════
// STATUS
// ═══════════════════════════════════════════════════════════════════════════════
async function showStatus() {
    const expert = AIAgentExpert_1.AIAgentExpert.getInstance();
    const failover = FailoverAgent_1.FailoverAgent.getInstance();
    const cycle = OmegaCycle_1.OmegaCycle.getInstance();
    const shadowContext = expert.getShadowContext();
    const failoverState = failover.getState();
    const inactivityMin = (expert.getInactivityDuration() / (60 * 1000)).toFixed(0);
    console.log(`
╔═══════════════════════════════════════════════════════════════════════════════╗
║                    📊 Q-AGENT STATUS 📊                                        ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║                                                                               ║
║  AIAgentExpert:                                                               ║
║    Shadow Commands: ${shadowContext.lastCommands.length.toString().padEnd(51)}║
║    Active Files: ${shadowContext.activeFiles.length.toString().padEnd(54)}║
║    Recent Changes: ${shadowContext.recentChanges.length.toString().padEnd(52)}║
║    Inactivity: ${inactivityMin.padEnd(55)}min ║
║                                                                               ║
║  Failover Agent:                                                              ║
║    Active: ${failoverState.isActive ? 'YES' : 'NO '.padEnd(61)}║
║    Last Reason: ${(failoverState.reason || 'NONE').padEnd(55)}║
║    Recovery Attempts: ${failoverState.recoveryAttempts.toString().padEnd(50)}║
║                                                                               ║
║  Omega Cycle:                                                                 ║
║    Inactivity Threshold: 3 hours                                              ║
║    Current Inactivity: ${inactivityMin.padEnd(48)}min ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝
  `);
}
// ═══════════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════════
async function main() {
    // Handle help
    if (flags.help) {
        showHelp();
        return;
    }
    // Handle status
    if (flags.status) {
        await showStatus();
        return;
    }
    // Require command for other operations
    if (!command) {
        console.log('⚠️ No command provided. Use --help for usage.\n');
        showHelp();
        return;
    }
    console.log(`
╔═══════════════════════════════════════════════════════════════════════════════╗
║                    🤖 Q-AGENT PROCESSING 🤖                                    ║
╚═══════════════════════════════════════════════════════════════════════════════╝
  `);
    try {
        let result;
        // ═══════════════════════════════════════════════════════════════════════
        // SWAP MODE (Failover from Cloud)
        // ═══════════════════════════════════════════════════════════════════════
        if (flags.swap) {
            console.log('🔄 [FAILOVER] Cloud limit reached. Sovereign Agent taking over...\n');
            const failover = FailoverAgent_1.FailoverAgent.getInstance();
            const failoverResult = await failover.takeOver('RATE_LIMIT', command, flags.file || undefined);
            result = failoverResult.response;
            console.log(`\nModel: ${failoverResult.model}`);
            console.log(`Latency: ${failoverResult.latency}ms`);
            console.log(`Context Preserved: ${failoverResult.contextPreserved}`);
        }
        // ═══════════════════════════════════════════════════════════════════════
        // NORMAL MODE (AIAgentExpert)
        // ═══════════════════════════════════════════════════════════════════════
        else {
            const expert = AIAgentExpert_1.AIAgentExpert.getInstance();
            // Determine mode
            let mode = 'analyze';
            if (flags.fix)
                mode = 'fix';
            if (flags.evolve)
                mode = 'evolve';
            if (flags.audit)
                mode = 'audit';
            const response = await expert.executeDirective({
                command,
                filePath: flags.file || process.cwd(),
                mode,
                precision: flags.opus ? 'opus' : 'balanced',
            });
            result = response.result;
            console.log(`\nModel: ${response.model}`);
            console.log(`Confidence: ${(response.reasoning.confidence * 100).toFixed(0)}%`);
            console.log(`Execution Time: ${response.executionTime}ms`);
            if (response.filesModified.length > 0) {
                console.log(`Files Modified: ${response.filesModified.join(', ')}`);
            }
        }
        // ═══════════════════════════════════════════════════════════════════════
        // OUTPUT
        // ═══════════════════════════════════════════════════════════════════════
        console.log(`
╔═══════════════════════════════════════════════════════════════════════════════╗
║                    📤 Q-AGENT OUTPUT 📤                                        ║
╚═══════════════════════════════════════════════════════════════════════════════╝

${result}

────────────────────────────────────────────────────────────────────────────────
🏆 [SUCCESS] Task completed by QAntum OMEGA.
    `);
    }
    catch (error) {
        console.error('\n❌ [ERROR]:', error instanceof Error ? error.message : error);
        process.exit(1);
    }
}
// Run
main();
