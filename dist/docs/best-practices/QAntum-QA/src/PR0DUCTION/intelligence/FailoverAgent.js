"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * FAILOVER AGENT - Sovereign Hot-Swap
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * "Когато облачният агент (Claude Opus) каже „Rate limit reached",
 *  QAntum поема щафетата без загуба на нито една милисекунда мисъл."
 *
 * The Sovereign Failover provides:
 * 1. Shadow Context Tracking - follows your work in real-time
 * 2. Hot-Swap Capability - seamless transition from cloud to local
 * 3. Zero Context Loss - preserves all previous interactions
 * 4. Hardware Acceleration - RTX 4050 for instant response
 *
 * @author Димитър Продромов / Mister Mind
 * @copyright 2026 QAntum Empire. All Rights Reserved.
 * @version 30.3.0 - THE SOVEREIGN FAILOVER
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
exports.failoverAgent = exports.FailoverAgent = void 0;
const events_1 = require("events");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const AIAgentExpert_1 = require("./AIAgentExpert");
const NeuralInference_1 = require("../physics/NeuralInference");
const HardwareBridge_1 = require("../omega/HardwareBridge");
// ═══════════════════════════════════════════════════════════════════════════════
// FAILOVER AGENT
// ═══════════════════════════════════════════════════════════════════════════════
class FailoverAgent extends events_1.EventEmitter {
    static instance;
    expert = AIAgentExpert_1.AIAgentExpert.getInstance();
    brain = NeuralInference_1.NeuralInference.getInstance();
    hardware = HardwareBridge_1.HardwareBridge.getInstance();
    state;
    STATE_PATH = 'data/context/failover_state.json';
    constructor() {
        super();
        this.state = this.loadState();
        console.log(`
╔═══════════════════════════════════════════════════════════════════════════════╗
║                    🔄 FAILOVER AGENT INITIALIZED 🔄                            ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║                                                                               ║
║  "Когато Opus спре, QAntum поема."                                            ║
║                                                                               ║
║  Mode: HOT-STANDBY                                                            ║
║  Context Sync: ENABLED                                                        ║
║  Recovery: AUTOMATIC                                                          ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝
    `);
    }
    static getInstance() {
        if (!FailoverAgent.instance) {
            FailoverAgent.instance = new FailoverAgent();
        }
        return FailoverAgent.instance;
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // STATE MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════════
    loadState() {
        try {
            if (fs.existsSync(this.STATE_PATH)) {
                const data = JSON.parse(fs.readFileSync(this.STATE_PATH, 'utf-8'));
                return {
                    ...data,
                    switchedAt: data.switchedAt ? new Date(data.switchedAt) : null,
                };
            }
        }
        catch { }
        return {
            isActive: false,
            lastCloudCommand: '',
            lastCloudResponse: '',
            switchedAt: null,
            reason: 'NONE',
            recoveryAttempts: 0,
        };
    }
    saveState() {
        try {
            const dir = path.dirname(this.STATE_PATH);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(this.STATE_PATH, JSON.stringify(this.state, null, 2));
        }
        catch (error) {
            console.error('❌ [FAILOVER] Failed to save state:', error);
        }
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // HOT-SWAP FUNCTIONALITY
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Record a cloud command (call this while working with Claude)
     * This keeps the shadow context in sync
     */
    recordCloudInteraction(command, response) {
        this.state.lastCloudCommand = command;
        if (response) {
            this.state.lastCloudResponse = response;
        }
        // Also record in expert's shadow context
        this.expert.recordActivity(command);
        this.saveState();
        this.emit('cloud:recorded', { command, response });
    }
    /**
     * Take over from cloud agent
     * This is the main failover function
     */
    async takeOver(reason, lastCommand, activeFilePath) {
        const startTime = Date.now();
        console.log(`
╔═══════════════════════════════════════════════════════════════════════════════╗
║                    🔄 FAILOVER ACTIVATED 🔄                                    ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║  Reason: ${reason.padEnd(62)}║
║  Taking over from Cloud Agent...                                              ║
╚═══════════════════════════════════════════════════════════════════════════════╝
    `);
        this.state.isActive = true;
        this.state.switchedAt = new Date();
        this.state.reason = reason;
        this.saveState();
        this.emit('failover:start', { reason });
        try {
            // Get shadow context
            const shadowContext = this.expert.getShadowContext();
            const commandToExecute = lastCommand || this.state.lastCloudCommand;
            if (!commandToExecute) {
                return {
                    success: false,
                    response: '⚠️ No command to continue. Please provide a command.',
                    model: 'none',
                    latency: Date.now() - startTime,
                    contextPreserved: true,
                };
            }
            // Build continuation prompt with full context
            const continuationPrompt = this.buildContinuationPrompt(commandToExecute, shadowContext, activeFilePath);
            // Execute via AIAgentExpert
            const response = await this.expert.executeDirective({
                command: continuationPrompt,
                filePath: activeFilePath,
                mode: 'analyze',
                precision: 'opus',
                context: JSON.stringify({
                    previousCommands: shadowContext.lastCommands,
                    recentChanges: shadowContext.recentChanges.slice(-10),
                    failoverReason: reason,
                }),
            });
            const result = {
                success: response.success,
                response: response.result,
                model: response.model,
                latency: Date.now() - startTime,
                contextPreserved: true,
            };
            console.log(`
🏆 [FAILOVER] Task resumed by QAntum OMEGA.
   Model: ${result.model}
   Latency: ${result.latency}ms
   Context Preserved: ${result.contextPreserved}
      `);
            this.emit('failover:complete', result);
            return result;
        }
        catch (error) {
            console.error('❌ [FAILOVER] Failed:', error);
            this.state.recoveryAttempts++;
            this.saveState();
            return {
                success: false,
                response: `Failover error: ${error instanceof Error ? error.message : 'Unknown'}`,
                model: 'error',
                latency: Date.now() - startTime,
                contextPreserved: false,
            };
        }
    }
    /**
     * Build a continuation prompt with full context
     */
    buildContinuationPrompt(command, shadowContext, filePath) {
        const recentCommands = shadowContext.lastCommands.slice(-5).join('\n- ');
        const recentChanges = shadowContext.recentChanges
            .slice(-5)
            .map((c) => `${c.type}: ${c.path} - ${c.summary}`)
            .join('\n- ');
        return `
SOVEREIGN FAILOVER - CONTINUE TASK

## Original Command
${command}

## Previous Context (Shadow Memory)
Recent commands:
- ${recentCommands || 'None'}

Recent file changes:
- ${recentChanges || 'None'}

${filePath ? `## Active File: ${filePath}` : ''}

## Instructions
Continue exactly where the cloud agent left off. You have full sovereignty.
Provide the response or code needed to complete the task.
    `.trim();
    }
    /**
     * Return control to cloud agent
     */
    returnToCloud() {
        if (!this.state.isActive) {
            console.log('⚠️ [FAILOVER] Not currently in failover mode.');
            return;
        }
        this.state.isActive = false;
        this.state.reason = 'NONE';
        this.saveState();
        console.log('☁️ [FAILOVER] Returning control to cloud agent.');
        this.emit('failover:return');
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // QUICK COMMANDS
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Quick swap - use when you hit rate limit
     * Just type: q-swap "continue from where we left off"
     */
    async swap(command) {
        const result = await this.takeOver('RATE_LIMIT', command);
        return result.response;
    }
    /**
     * Check if failover is active
     */
    isActive() {
        return this.state.isActive;
    }
    /**
     * Get current state
     */
    getState() {
        return { ...this.state };
    }
}
exports.FailoverAgent = FailoverAgent;
// ═══════════════════════════════════════════════════════════════════════════════
// SINGLETON EXPORT
// ═══════════════════════════════════════════════════════════════════════════════
exports.failoverAgent = FailoverAgent.getInstance();
exports.default = FailoverAgent;
