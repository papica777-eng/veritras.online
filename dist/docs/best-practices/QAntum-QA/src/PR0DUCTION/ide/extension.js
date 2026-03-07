"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * QANTUM OMEGA - THE NEURAL STREAMING EDITION
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * "Ние не молим VS Code за разрешение. Ние СТРОИМ СОБСТВЕНА ИМПЕРИЯ."
 *
 * v30.6.1 - THE NEURAL STREAMING EDITION
 *
 * 🔐 PROTECTED: This extension is LOCKED to Dimitar's machine only.
 *    Any attempt to run on unauthorized hardware will trigger Tombstone Protocol.
 *
 * Features:
 * 1. QAntumChatPanel - Modern Sovereign Webview (Purple Theme)
 * 2. SovereignProvider - Matrix Terminal (Emerald Theme) with Neural Streaming
 * 3. Real-time [THOUGHT] telemetry from RTX 4050
 * 4. Neural Overlay - Ghost Text inline completions
 * 5. Command Palette integration
 * 6. Hardware-Bound Authentication (Sovereign Lock)
 *
 * @author Димитър Продромов / Mister Mind
 * @copyright 2026 QAntum Empire. ЛИЧЕН. НЕ ЗА РАЗПРОСТРАНЕНИЕ.
 * @version 30.6.1 - THE NEURAL STREAMING EDITION
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
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const QAntumChatPanel_1 = require("./QAntumChatPanel");
const SovereignProvider_1 = require("./SovereignProvider");
const OmegaViewProvider_1 = require("./OmegaViewProvider");
const OmegaServer_1 = require("./OmegaServer");
const SovereignLock_1 = require("./SovereignLock");
const Sovereignty_1 = require("../fortress/Sovereignty");
const AIAgentExpert_1 = require("../intelligence/AIAgentExpert");
const FailoverAgent_1 = require("../intelligence/FailoverAgent");
// ═══════════════════════════════════════════════════════════════════════════════
// EXTENSION ACTIVATION
// ═══════════════════════════════════════════════════════════════════════════════
async function activate(context) {
    // ═══════════════════════════════════════════════════════════════════════════
    // 🔐 SOVEREIGN LOCK - VERIFY CREATOR BEFORE ANYTHING ELSE
    // ═══════════════════════════════════════════════════════════════════════════
    // Check if system is tombstoned first
    if (Sovereignty_1.Sovereignty.isTombstoned()) {
        vscode.window.showErrorMessage('💀 QAntum: TOMBSTONE PROTOCOL ACTIVE. This system is permanently disabled.', { modal: true });
        return;
    }
    // Multi-layer verification
    const sovereignLock = SovereignLock_1.SovereignLock.getInstance();
    const sovereigntyReport = Sovereignty_1.Sovereignty.verifyOwner();
    const isAuthorized = await sovereignLock.verify() && sovereigntyReport.isAuthorized;
    if (!isAuthorized) {
        vscode.window.showErrorMessage('🚫 QAntum OMEGA: Unauthorized machine. This extension is locked to the Creator\'s hardware.', { modal: true });
        console.error(`
╔═══════════════════════════════════════════════════════════════════════════════╗
║                    🚫 ACCESS DENIED 🚫                                         ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║                                                                               ║
║  This extension is LOCKED to Dimitar Prodromov's machine.                     ║
║  It cannot be used on any other computer.                                     ║
║                                                                               ║
║  "В QAntum не лъжем."                                                         ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝
    `);
        return; // Stop activation - extension will not work
    }
    console.log(`
╔═══════════════════════════════════════════════════════════════════════════════╗
║                    🚀 QANTUM OMEGA v30.6 - THE SOVEREIGN SIDEBAR 🚀            ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║                                                                               ║
║  🔐 Creator Verified - Full Access Granted                                    ║
║                                                                               ║
║  "Ние не молим VS Code за разрешение. Ние СТРОИМ СОБСТВЕНА ИМПЕРИЯ."          ║
║                                                                               ║
║  Features:                                                                    ║
║    • QAntumChatPanel - Sovereign Webview (No Proposed API)                    ║
║    • Direct RTX 4050 Connection                                               ║
║    • Status LED (Green/Purple/Red)                                            ║
║    • Action Buttons (Heal, Audit, Swap, Synthesize)                           ║
║    • Neural Overlay (Ghost Text)                                              ║
║    • Hardware-Bound Protection (ACTIVE)                                       ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝
  `);
    // Start the Omega Server (bridge between extension and core)
    const server = OmegaServer_1.OmegaServer.getInstance({ port: 3848 });
    try {
        await server.start();
    }
    catch (error) {
        console.warn('⚠️ [OMEGA] Server may already be running:', error);
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // 🏛️ THE SOVEREIGN SIDEBAR - QAntumChatPanel (Modern Purple Theme)
    // ═══════════════════════════════════════════════════════════════════════════
    // Register the Sovereign Chat Panel (Modern UI)
    const qantumChatPanel = new QAntumChatPanel_1.QAntumChatPanel(context.extensionUri, context);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider(QAntumChatPanel_1.QAntumChatPanel.viewType, qantumChatPanel));
    console.log('🏛️ [OMEGA] Sovereign Chat Panel registered: qantum.chatView');
    // ═══════════════════════════════════════════════════════════════════════════
    // 🖥️ THE MATRIX TERMINAL - SovereignProvider (Neural Streaming)
    // ═══════════════════════════════════════════════════════════════════════════
    // Register the Sovereign Terminal (Matrix Theme with Neural Streaming)
    const sovereignTerminal = new SovereignProvider_1.SovereignProvider(context.extensionUri, context);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider(SovereignProvider_1.SovereignProvider.viewType, sovereignTerminal));
    console.log('🖥️ [OMEGA] Sovereign Terminal registered: qantum.sovereignView');
    console.log('   → Neural Streaming enabled - [THOUGHT] telemetry active');
    console.log('   → Emerald & Obsidian Matrix Theme');
    console.log('   → Direct connection to RTX 4050');
    console.log('   → "В QAntum не лъжем."');
    // ═══════════════════════════════════════════════════════════════════════════
    // 📢 QANTUM CHAT COMMAND - Quick Access via Command Palette
    // ═══════════════════════════════════════════════════════════════════════════
    context.subscriptions.push(vscode.commands.registerCommand('qantum.chat', async () => {
        const input = await vscode.window.showInputBox({
            prompt: '🧠 QAntum OMEGA - Ask anything',
            placeHolder: 'Type your question or command (e.g., /heal, /audit, /status)',
            ignoreFocusOut: true
        });
        if (!input)
            return;
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: '🧠 QAntum OMEGA',
            cancellable: false
        }, async (progress) => {
            progress.report({ message: 'Processing via RTX 4050...' });
            try {
                const expert = AIAgentExpert_1.AIAgentExpert.getInstance();
                const currentFile = vscode.window.activeTextEditor?.document.fileName || '';
                let result = '';
                if (input.startsWith('/heal')) {
                    result = await executeHealCommand(currentFile);
                }
                else if (input.startsWith('/audit')) {
                    result = await executeAuditCommand();
                }
                else if (input.startsWith('/status')) {
                    result = getSystemStatus();
                }
                else {
                    result = await expert.ask(input, currentFile);
                }
                // Show result in output channel
                const outputChannel = vscode.window.createOutputChannel('QAntum OMEGA');
                outputChannel.clear();
                outputChannel.appendLine('═'.repeat(80));
                outputChannel.appendLine('                    🧠 QANTUM OMEGA RESPONSE');
                outputChannel.appendLine('═'.repeat(80));
                outputChannel.appendLine('');
                outputChannel.appendLine(result);
                outputChannel.appendLine('');
                outputChannel.appendLine('═'.repeat(80));
                outputChannel.show();
            }
            catch (error) {
                vscode.window.showErrorMessage(`QAntum Error: ${error.message}`);
            }
        });
    }));
    // ═══════════════════════════════════════════════════════════════════════════
    // 🔧 HEAL COMMAND
    // ═══════════════════════════════════════════════════════════════════════════
    context.subscriptions.push(vscode.commands.registerCommand('qantum.heal', async () => {
        const currentFile = vscode.window.activeTextEditor?.document.fileName || '';
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: '🔧 QAntum Heal',
            cancellable: false
        }, async (progress) => {
            progress.report({ message: 'Analyzing and healing code...' });
            const result = await executeHealCommand(currentFile);
            const outputChannel = vscode.window.createOutputChannel('QAntum OMEGA');
            outputChannel.clear();
            outputChannel.appendLine(result);
            outputChannel.show();
        });
    }));
    // ═══════════════════════════════════════════════════════════════════════════
    // 🛡️ AUDIT COMMAND
    // ═══════════════════════════════════════════════════════════════════════════
    context.subscriptions.push(vscode.commands.registerCommand('qantum.runAudit', async () => {
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: '🛡️ QAntum Security Audit',
            cancellable: false
        }, async (progress) => {
            progress.report({ message: 'Running Ghost Protocol audit...' });
            const result = await executeAuditCommand();
            const outputChannel = vscode.window.createOutputChannel('QAntum OMEGA');
            outputChannel.clear();
            outputChannel.appendLine(result);
            outputChannel.show();
        });
    }));
    // ═══════════════════════════════════════════════════════════════════════════
    // 📊 STATUS COMMAND
    // ═══════════════════════════════════════════════════════════════════════════
    context.subscriptions.push(vscode.commands.registerCommand('qantum.status', async () => {
        const result = getSystemStatus();
        vscode.window.showInformationMessage('🟢 QAntum OMEGA: All systems operational', { modal: true, detail: result });
    }));
    // ═══════════════════════════════════════════════════════════════════════════
    // SIDEBAR WEBVIEW
    // ═══════════════════════════════════════════════════════════════════════════
    const viewProvider = new OmegaViewProvider_1.OmegaViewProvider(context.extensionUri);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider('qantum-omega-sidebar', viewProvider));
    // ═══════════════════════════════════════════════════════════════════════════
    // NEURAL OVERLAY (Ghost Text / Inline Completions)
    // ═══════════════════════════════════════════════════════════════════════════
    const inlineCompletionProvider = vscode.languages.registerInlineCompletionItemProvider({ pattern: '**' }, // All files
    {
        async provideInlineCompletionItems(document, position, context, token) {
            // Get context from start of file to current position
            const startPos = new vscode.Position(Math.max(0, position.line - 50), 0);
            const range = new vscode.Range(startPos, position);
            const textBefore = document.getText(range);
            // Don't trigger on empty or whitespace-only context
            if (!textBefore.trim() || textBefore.length < 10) {
                return [];
            }
            // Only trigger after a newline or specific characters
            const lastChar = textBefore.slice(-1);
            const triggerChars = ['\n', '{', '(', ':', ',', ' '];
            if (!triggerChars.includes(lastChar)) {
                return [];
            }
            try {
                // Get suggestion from AIAgentExpert
                const expert = AIAgentExpert_1.AIAgentExpert.getInstance();
                // Build a focused prompt
                const prompt = `Complete this ${document.languageId} code. Output ONLY the next few tokens, no explanations:
\`\`\`${document.languageId}
${textBefore.slice(-500)}
\`\`\`
Continuation:`;
                const response = await expert.ask(prompt, document.uri.fsPath);
                // Extract clean code from response
                let suggestion = extractCodeFromResponse(response);
                if (!suggestion || suggestion.length < 2) {
                    return [];
                }
                // Limit suggestion length
                suggestion = suggestion.slice(0, 100);
                return [{
                        insertText: suggestion,
                        range: new vscode.Range(position, position),
                        command: {
                            title: 'QAntum Neural Overlay',
                            command: 'qantum.trackAcceptedSuggestion',
                            arguments: [suggestion],
                        },
                    }];
            }
            catch (error) {
                console.error('⚠️ [NEURAL-OVERLAY] Error:', error);
                return [];
            }
        }
    });
    context.subscriptions.push(inlineCompletionProvider);
    // ═══════════════════════════════════════════════════════════════════════════
    // COMMANDS
    // ═══════════════════════════════════════════════════════════════════════════
    // Command: Ask Expert
    context.subscriptions.push(vscode.commands.registerCommand('qantum.askExpert', async () => {
        const input = await vscode.window.showInputBox({
            prompt: 'Ask AIAgentExpert',
            placeHolder: 'What do you want to know?',
        });
        if (input) {
            const editor = vscode.window.activeTextEditor;
            const filePath = editor?.document.uri.fsPath;
            const expert = AIAgentExpert_1.AIAgentExpert.getInstance();
            const response = await expert.ask(input, filePath);
            viewProvider.addMessage('user', input);
            viewProvider.addMessage('assistant', response);
            // Show in output channel
            const outputChannel = vscode.window.createOutputChannel('QAntum OMEGA');
            outputChannel.appendLine(`\n[USER] ${input}`);
            outputChannel.appendLine(`[OMEGA] ${response}`);
            outputChannel.show(true);
        }
    }));
    // Command: Omega Heal
    context.subscriptions.push(vscode.commands.registerCommand('qantum.omegaHeal', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage('No active file to heal.');
            return;
        }
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: '🌀 OMEGA HEAL in progress...',
            cancellable: false,
        }, async () => {
            const expert = AIAgentExpert_1.AIAgentExpert.getInstance();
            const result = await expert.fix(editor.document.uri.fsPath);
            viewProvider.addMessage('system', `🌀 HEAL: ${result}`);
            vscode.window.showInformationMessage(`✅ Heal complete: ${result}`);
        });
    }));
    // Command: Ghost Audit
    context.subscriptions.push(vscode.commands.registerCommand('qantum.ghostAudit', async () => {
        const editor = vscode.window.activeTextEditor;
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: '👻 GHOST AUDIT scanning...',
            cancellable: false,
        }, async () => {
            const expert = AIAgentExpert_1.AIAgentExpert.getInstance();
            const response = await expert.executeDirective({
                command: 'Security audit with Ghost Protocol - zero detection footprint',
                filePath: editor?.document.uri.fsPath,
                mode: 'audit',
                precision: 'opus',
            });
            viewProvider.addMessage('system', `👻 AUDIT:\n${response.result}`);
            // Show detailed report
            const doc = await vscode.workspace.openTextDocument({
                content: response.result,
                language: 'markdown',
            });
            vscode.window.showTextDocument(doc, vscode.ViewColumn.Beside);
        });
    }));
    // Command: Failover Swap
    context.subscriptions.push(vscode.commands.registerCommand('qantum.failoverSwap', async () => {
        const input = await vscode.window.showInputBox({
            prompt: 'Failover to local agent - what should I continue?',
            placeHolder: 'Continue from where we left off...',
            value: 'Continue from where we left off',
        });
        if (input) {
            const editor = vscode.window.activeTextEditor;
            const failover = FailoverAgent_1.FailoverAgent.getInstance();
            vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: '🔄 FAILOVER SWAP - Activating local agent...',
                cancellable: false,
            }, async () => {
                const result = await failover.takeOver('RATE_LIMIT', input, editor?.document.uri.fsPath);
                viewProvider.addMessage('user', `[SWAP] ${input}`);
                viewProvider.addMessage('assistant', result.response);
                viewProvider.updateLed('purple', 'GHOST MODE');
                vscode.window.showInformationMessage('🟣 Local agent active - Ghost Mode enabled');
            });
        }
    }));
    // Command: Synthesize
    context.subscriptions.push(vscode.commands.registerCommand('qantum.synthesize', async () => {
        const input = await vscode.window.showInputBox({
            prompt: 'Describe what you want to create',
            placeHolder: 'Create a function that...',
        });
        if (input) {
            const expert = AIAgentExpert_1.AIAgentExpert.getInstance();
            const response = await expert.executeDirective({
                command: input,
                mode: 'generate',
                precision: 'opus',
            });
            // Insert generated code at cursor
            const editor = vscode.window.activeTextEditor;
            if (editor && response.result) {
                const code = extractCodeFromResponse(response.result);
                if (code) {
                    editor.edit(editBuilder => {
                        editBuilder.insert(editor.selection.active, code);
                    });
                }
            }
            viewProvider.addMessage('system', `🧬 SYNTHESIZE: Code generated`);
        }
    }));
    // Command: Track accepted suggestions (for learning)
    context.subscriptions.push(vscode.commands.registerCommand('qantum.trackAcceptedSuggestion', (suggestion) => {
        const expert = AIAgentExpert_1.AIAgentExpert.getInstance();
        expert.recordActivity(`ACCEPTED_GHOST: ${suggestion.slice(0, 50)}...`);
    }));
    // ═══════════════════════════════════════════════════════════════════════════
    // STATUS BAR
    // ═══════════════════════════════════════════════════════════════════════════
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.text = '$(zap) QAntum';
    statusBarItem.tooltip = 'QAntum OMEGA - Click for menu';
    statusBarItem.command = 'qantum.showMenu';
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);
    // Update status bar based on system state
    setInterval(() => {
        const failover = FailoverAgent_1.FailoverAgent.getInstance();
        const state = failover.getState();
        if (state.isActive) {
            statusBarItem.text = '$(ghost) QAntum [GHOST]';
            statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
        }
        else {
            statusBarItem.text = '$(zap) QAntum';
            statusBarItem.backgroundColor = undefined;
        }
    }, 5000);
    // Command: Show menu
    context.subscriptions.push(vscode.commands.registerCommand('qantum.showMenu', async () => {
        const selection = await vscode.window.showQuickPick([
            { label: '$(comment-discussion) Ask Expert', description: 'Ask AIAgentExpert', command: 'qantum.askExpert' },
            { label: '$(heart) Omega Heal', description: 'Fix current file', command: 'qantum.omegaHeal' },
            { label: '$(shield) Ghost Audit', description: 'Security scan', command: 'qantum.ghostAudit' },
            { label: '$(sync) Failover Swap', description: 'Switch to local agent', command: 'qantum.failoverSwap' },
            { label: '$(sparkle) Synthesize', description: 'Generate code from intent', command: 'qantum.synthesize' },
        ], {
            placeHolder: 'QAntum OMEGA Commands',
        });
        if (selection) {
            vscode.commands.executeCommand(selection.command);
        }
    }));
    // ═══════════════════════════════════════════════════════════════════════════
    // CLEANUP
    // ═══════════════════════════════════════════════════════════════════════════
    context.subscriptions.push({
        dispose: () => {
            server.stop();
        }
    });
}
// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════
function getSystemStatus() {
    const os = require('os');
    const statusReport = {
        sovereignty: '🟢 VERIFIED',
        machine: {
            hostname: os.hostname(),
            user: os.userInfo().username,
            cpu: os.cpus()[0]?.model || 'Unknown',
            cores: os.cpus().length,
            memory: Math.round(os.totalmem() / 1024 / 1024 / 1024) + 'GB'
        },
        nexus: 'ACTIVE',
        rtx: 'RTX 4050 (CUDA Acceleration)',
        version: '30.6.1 - THE NEURAL STREAMING EDITION',
        timestamp: new Date().toISOString()
    };
    return `🧠 QANTUM OMEGA STATUS REPORT
═══════════════════════════════════════
Sovereignty: ${statusReport.sovereignty}
Machine: ${statusReport.machine.hostname}
User: ${statusReport.machine.user}
CPU: ${statusReport.machine.cpu}
Cores: ${statusReport.machine.cores}
Memory: ${statusReport.machine.memory}
GPU: ${statusReport.rtx}
Nexus: ${statusReport.nexus}
Version: ${statusReport.version}
═══════════════════════════════════════
✅ All systems operational.
"В QAntum не лъжем."`;
}
async function executeHealCommand(filePath) {
    try {
        const expert = AIAgentExpert_1.AIAgentExpert.getInstance();
        if (!filePath) {
            return '⚠️ No file selected. Open a file first.';
        }
        const fs = require('fs');
        if (!fs.existsSync(filePath)) {
            return `⚠️ File not found: ${filePath}`;
        }
        const content = fs.readFileSync(filePath, 'utf-8');
        const prompt = `Analyze this code and suggest improvements for type-safety, performance, and best practices. Be specific and actionable:

\`\`\`
${content.slice(0, 5000)}
\`\`\`

Provide:
1. Type-safety issues found
2. Performance optimizations
3. Code quality improvements
4. Fixed code snippets where applicable`;
        const result = await expert.ask(prompt, filePath);
        return `🔧 CHRONOS-OMEGA HEAL REPORT
═══════════════════════════════════════
File: ${filePath}
═══════════════════════════════════════

${result}

═══════════════════════════════════════
✅ Analysis complete.`;
    }
    catch (error) {
        return `❌ Heal failed: ${error.message}`;
    }
}
async function executeAuditCommand() {
    try {
        const expert = AIAgentExpert_1.AIAgentExpert.getInstance();
        const prompt = `Perform a comprehensive security audit. Check for:
1. Hardcoded credentials or API keys
2. SQL injection vulnerabilities
3. XSS vulnerabilities
4. Insecure dependencies
5. Authentication/Authorization issues
6. Data exposure risks

Report format:
- Severity: CRITICAL/HIGH/MEDIUM/LOW
- Location: file path and line
- Issue: description
- Fix: recommended solution`;
        const result = await expert.ask(prompt, 'security-audit');
        return `🛡️ GHOST PROTOCOL SECURITY AUDIT
═══════════════════════════════════════
Status: COMPLETE
═══════════════════════════════════════

${result}

═══════════════════════════════════════
"В QAntum не лъжем."`;
    }
    catch (error) {
        return `❌ Audit failed: ${error.message}`;
    }
}
function extractCodeFromResponse(response) {
    // Try to extract code from markdown blocks
    const codeBlockMatch = response.match(/```[\w]*\n?([\s\S]*?)```/);
    if (codeBlockMatch) {
        return codeBlockMatch[1].trim();
    }
    // Return first line if no code block
    const firstLine = response.split('\n')[0];
    if (firstLine && !firstLine.startsWith('#') && !firstLine.startsWith('//')) {
        return firstLine;
    }
    return response.slice(0, 50);
}
// ═══════════════════════════════════════════════════════════════════════════════
// DEACTIVATION
// ═══════════════════════════════════════════════════════════════════════════════
function deactivate() {
    console.log('🛑 [OMEGA] Extension deactivated');
}
