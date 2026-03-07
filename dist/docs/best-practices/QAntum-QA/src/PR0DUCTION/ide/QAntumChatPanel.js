"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * QANTUM CHAT PANEL - THE SOVEREIGN UI
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * "Ние не молим VS Code за разрешение. Ние СТРОИМ СОБСТВЕНА ИМПЕРИЯ."
 *
 * Това е 100% независим Webview панел, който:
 * 1. Контролира всеки пиксел
 * 2. Има директна връзка с RTX 4050
 * 3. Няма филтри - Суверенен UI
 * 4. Показва real-time статус на всички системи
 * 5. Поддържа Heal, Audit, Swap, Synthesize с един клик
 *
 * @author Димитър Продромов / Mister Mind
 * @copyright 2026 QAntum Empire. ЛИЧЕН. НЕ ЗА РАЗПРОСТРАНЕНИЕ.
 * @version 30.6.0 - THE SOVEREIGN SIDEBAR
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
exports.QAntumChatPanel = void 0;
const vscode = __importStar(require("vscode"));
const AIAgentExpert_1 = require("../intelligence/AIAgentExpert");
const FailoverAgent_1 = require("../intelligence/FailoverAgent");
// ═══════════════════════════════════════════════════════════════════════════════
// THE SOVEREIGN CHAT PANEL
// ═══════════════════════════════════════════════════════════════════════════════
class QAntumChatPanel {
    _extensionUri;
    _context;
    static viewType = 'qantum.chatView';
    _view;
    _conversationHistory = [];
    _systemStatus = {
        rtx4050: true,
        ollama: false,
        ghostProtocol: true,
        chronosOmega: true
    };
    constructor(_extensionUri, _context) {
        this._extensionUri = _extensionUri;
        this._context = _context;
        // Check Ollama status periodically
        this._checkOllamaStatus();
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // WEBVIEW PROVIDER IMPLEMENTATION
    // ═══════════════════════════════════════════════════════════════════════════
    resolveWebviewView(webviewView, _context, _token) {
        this._view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };
        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
        // ═══════════════════════════════════════════════════════════════════════
        // COMMUNICATION BRIDGE: Webview <-> Extension Host
        // ═══════════════════════════════════════════════════════════════════════
        webviewView.webview.onDidReceiveMessage(async (data) => {
            switch (data.type) {
                case 'askExpert':
                    await this._handleAskExpert(data.value);
                    break;
                case 'triggerCommand':
                    vscode.commands.executeCommand(data.command);
                    break;
                case 'heal':
                    await this._handleHeal();
                    break;
                case 'audit':
                    await this._handleAudit();
                    break;
                case 'swap':
                    await this._handleSwap(data.value);
                    break;
                case 'synthesize':
                    await this._handleSynthesize(data.value);
                    break;
                case 'clearHistory':
                    this._conversationHistory = [];
                    this._view?.webview.postMessage({ type: 'historyCleared' });
                    break;
                case 'getStatus':
                    await this._sendSystemStatus();
                    break;
            }
        });
        // Send initial status
        setTimeout(() => this._sendSystemStatus(), 500);
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // COMMAND HANDLERS
    // ═══════════════════════════════════════════════════════════════════════════
    async _handleAskExpert(query) {
        if (!query.trim())
            return;
        // Add user message
        this._addMessage('user', query);
        // Show thinking state
        this._view?.webview.postMessage({ type: 'thinking', value: true });
        try {
            const expert = AIAgentExpert_1.AIAgentExpert.getInstance();
            const activeEditor = vscode.window.activeTextEditor;
            const currentFile = activeEditor?.document.fileName || '';
            const selectedText = activeEditor?.document.getText(activeEditor.selection) || '';
            // Build context-aware prompt
            let fullContext = query;
            if (selectedText) {
                fullContext = `[Selected Code]:\n\`\`\`\n${selectedText}\n\`\`\`\n\n[Question]: ${query}`;
            }
            const response = await expert.ask(fullContext, currentFile);
            this._addMessage('expert', response);
        }
        catch (error) {
            this._addMessage('system', `❌ Error: ${error.message}\n\nEnsure Ollama is running: ollama serve`);
        }
        finally {
            this._view?.webview.postMessage({ type: 'thinking', value: false });
        }
    }
    async _handleHeal() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            this._addMessage('system', '⚠️ No active file to heal. Open a file first.');
            return;
        }
        this._addMessage('system', '🌀 CHRONOS-OMEGA HEAL initiated...');
        this._view?.webview.postMessage({ type: 'thinking', value: true });
        try {
            const expert = AIAgentExpert_1.AIAgentExpert.getInstance();
            const filePath = editor.document.fileName;
            const content = editor.document.getText();
            const healPrompt = `Analyze and fix this ${editor.document.languageId} code. Return the corrected code with explanations:
\`\`\`${editor.document.languageId}
${content}
\`\`\``;
            const result = await expert.ask(healPrompt, filePath);
            this._addMessage('expert', `🔧 **Heal Analysis:**\n\n${result}`);
            // Extract code from result and offer to apply
            const codeMatch = result.match(/```[\w]*\n([\s\S]*?)```/);
            if (codeMatch) {
                this._view?.webview.postMessage({
                    type: 'offerApply',
                    value: codeMatch[1],
                    filePath
                });
            }
        }
        catch (error) {
            this._addMessage('system', `❌ Heal failed: ${error.message}`);
        }
        finally {
            this._view?.webview.postMessage({ type: 'thinking', value: false });
        }
    }
    async _handleAudit() {
        this._addMessage('system', '👻 GHOST PROTOCOL AUDIT initiated...');
        this._view?.webview.postMessage({ type: 'thinking', value: true });
        try {
            const expert = AIAgentExpert_1.AIAgentExpert.getInstance();
            const editor = vscode.window.activeTextEditor;
            let auditTarget = 'current workspace';
            let content = '';
            if (editor) {
                auditTarget = editor.document.fileName;
                content = editor.document.getText();
            }
            const auditPrompt = `Perform a comprehensive security audit (Ghost Protocol) on this code:
\`\`\`
${content || '[Full workspace scan requested]'}
\`\`\`

Check for:
1. 🔐 Hardcoded credentials
2. 💉 Injection vulnerabilities
3. 🔓 Authentication weaknesses
4. 📝 Logging of sensitive data
5. 🌐 CORS/XSS vulnerabilities
6. 🔒 Encryption issues
7. ⚡ Race conditions

Format as detailed security report with severity levels.`;
            const result = await expert.ask(auditPrompt, editor?.document.fileName || '');
            this._addMessage('expert', `🛡️ **Security Audit Report:**\n\n${result}`);
        }
        catch (error) {
            this._addMessage('system', `❌ Audit failed: ${error.message}`);
        }
        finally {
            this._view?.webview.postMessage({ type: 'thinking', value: false });
        }
    }
    async _handleSwap(context) {
        this._addMessage('system', '🔄 FAILOVER SWAP - Activating Ghost Mode...');
        this._view?.webview.postMessage({ type: 'thinking', value: true });
        this._view?.webview.postMessage({ type: 'ledUpdate', color: 'purple', status: 'GHOST MODE' });
        try {
            const failover = FailoverAgent_1.FailoverAgent.getInstance();
            const editor = vscode.window.activeTextEditor;
            const swapContext = context || 'Continue from where we left off';
            const result = await failover.takeOver('RATE_LIMIT', swapContext, editor?.document.fileName);
            this._addMessage('expert', `🟣 **Ghost Mode Active:**\n\n${result.response}`);
        }
        catch (error) {
            this._addMessage('system', `❌ Swap failed: ${error.message}`);
            this._view?.webview.postMessage({ type: 'ledUpdate', color: 'red', status: 'ERROR' });
        }
        finally {
            this._view?.webview.postMessage({ type: 'thinking', value: false });
        }
    }
    async _handleSynthesize(description) {
        if (!description.trim())
            return;
        this._addMessage('user', `[SYNTHESIZE] ${description}`);
        this._view?.webview.postMessage({ type: 'thinking', value: true });
        try {
            const expert = AIAgentExpert_1.AIAgentExpert.getInstance();
            const editor = vscode.window.activeTextEditor;
            const lang = editor?.document.languageId || 'typescript';
            const synthesizePrompt = `Generate ${lang} code for: ${description}

Requirements:
- Clean, production-ready code
- Include comments
- Follow best practices
- Type-safe (if applicable)

Output ONLY the code, wrapped in \`\`\`${lang} blocks.`;
            const result = await expert.ask(synthesizePrompt, editor?.document.fileName || '');
            this._addMessage('expert', `⚡ **Synthesized Code:**\n\n${result}`);
            // Offer to insert at cursor
            const codeMatch = result.match(/```[\w]*\n([\s\S]*?)```/);
            if (codeMatch && editor) {
                this._view?.webview.postMessage({
                    type: 'offerInsert',
                    value: codeMatch[1]
                });
            }
        }
        catch (error) {
            this._addMessage('system', `❌ Synthesis failed: ${error.message}`);
        }
        finally {
            this._view?.webview.postMessage({ type: 'thinking', value: false });
        }
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // HELPERS
    // ═══════════════════════════════════════════════════════════════════════════
    _addMessage(role, content) {
        const message = { role, content, timestamp: new Date() };
        this._conversationHistory.push(message);
        this._view?.webview.postMessage({
            type: 'addMessage',
            role,
            content,
            timestamp: message.timestamp.toLocaleTimeString()
        });
    }
    async _checkOllamaStatus() {
        try {
            const response = await fetch('http://localhost:11434/api/tags');
            this._systemStatus.ollama = response.ok;
        }
        catch {
            this._systemStatus.ollama = false;
        }
    }
    async _sendSystemStatus() {
        await this._checkOllamaStatus();
        this._view?.webview.postMessage({
            type: 'statusUpdate',
            status: this._systemStatus
        });
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // THE SOVEREIGN HTML - FULL CONTROL
    // ═══════════════════════════════════════════════════════════════════════════
    _getHtmlForWebview(webview) {
        return `<!DOCTYPE html>
<html lang="bg">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline';">
  <title>QAntum OMEGA</title>
  <style>
    :root {
      --bg-primary: #0b0f1a;
      --bg-secondary: #161b22;
      --bg-tertiary: #1c2128;
      --text-primary: #e2e8f0;
      --text-secondary: #94a3b8;
      --accent-green: #4ade80;
      --accent-purple: #a855f7;
      --accent-blue: #3b82f6;
      --accent-red: #ef4444;
      --accent-orange: #f97316;
      --border-color: #30363d;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Segoe UI', system-ui, sans-serif;
      background: var(--bg-primary);
      color: var(--text-primary);
      padding: 8px;
      font-size: 13px;
      line-height: 1.5;
    }

    /* ═══════════════════════════════════════════════════════════════════ */
    /* HEADER - Status Bar                                                  */
    /* ═══════════════════════════════════════════════════════════════════ */

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 10px;
      background: linear-gradient(135deg, #1a1f2e 0%, #0d1117 100%);
      border-radius: 8px;
      margin-bottom: 10px;
      border: 1px solid var(--border-color);
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      font-size: 14px;
    }

    .logo-icon {
      font-size: 18px;
    }

    .version {
      font-size: 10px;
      color: var(--text-secondary);
      background: var(--bg-tertiary);
      padding: 2px 6px;
      border-radius: 4px;
    }

    .status-led {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
    }

    .led {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: var(--accent-green);
      box-shadow: 0 0 8px var(--accent-green);
      animation: pulse 2s infinite;
    }

    .led.purple {
      background: var(--accent-purple);
      box-shadow: 0 0 8px var(--accent-purple);
    }

    .led.red {
      background: var(--accent-red);
      box-shadow: 0 0 8px var(--accent-red);
      animation: none;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    /* ═══════════════════════════════════════════════════════════════════ */
    /* SYSTEM STATUS                                                        */
    /* ═══════════════════════════════════════════════════════════════════ */

    .system-status {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 6px;
      margin-bottom: 10px;
      font-size: 10px;
    }

    .status-item {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 4px 8px;
      background: var(--bg-secondary);
      border-radius: 4px;
      border: 1px solid var(--border-color);
    }

    .status-icon {
      font-size: 12px;
    }

    .status-ok { color: var(--accent-green); }
    .status-warn { color: var(--accent-orange); }
    .status-error { color: var(--accent-red); }

    /* ═══════════════════════════════════════════════════════════════════ */
    /* CHAT CONTAINER                                                       */
    /* ═══════════════════════════════════════════════════════════════════ */

    .chat-container {
      height: calc(100vh - 280px);
      min-height: 200px;
      overflow-y: auto;
      padding: 8px;
      background: var(--bg-secondary);
      border-radius: 8px;
      border: 1px solid var(--border-color);
      margin-bottom: 10px;
    }

    .chat-container::-webkit-scrollbar {
      width: 6px;
    }

    .chat-container::-webkit-scrollbar-thumb {
      background: var(--border-color);
      border-radius: 3px;
    }

    .message {
      margin-bottom: 12px;
      padding: 10px 12px;
      border-radius: 8px;
      background: var(--bg-tertiary);
      border-left: 3px solid var(--border-color);
      word-wrap: break-word;
      white-space: pre-wrap;
    }

    .message.user {
      border-left-color: var(--accent-blue);
      background: linear-gradient(135deg, #1e293b 0%, #1c2128 100%);
    }

    .message.expert {
      border-left-color: var(--accent-purple);
      background: linear-gradient(135deg, #1f1720 0%, #1c2128 100%);
    }

    .message.system {
      border-left-color: var(--accent-orange);
      background: linear-gradient(135deg, #1f1710 0%, #1c2128 100%);
      font-size: 12px;
    }

    .message-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 6px;
      font-size: 11px;
      color: var(--text-secondary);
    }

    .message-role {
      font-weight: 600;
      text-transform: uppercase;
    }

    .message.user .message-role { color: var(--accent-blue); }
    .message.expert .message-role { color: var(--accent-purple); }
    .message.system .message-role { color: var(--accent-orange); }

    .message-content {
      font-size: 13px;
    }

    .message-content code {
      background: var(--bg-primary);
      padding: 2px 6px;
      border-radius: 4px;
      font-family: 'Consolas', monospace;
      font-size: 12px;
    }

    .message-content pre {
      background: var(--bg-primary);
      padding: 10px;
      border-radius: 6px;
      overflow-x: auto;
      margin: 8px 0;
      font-family: 'Consolas', monospace;
      font-size: 12px;
      border: 1px solid var(--border-color);
    }

    .thinking {
      display: none;
      text-align: center;
      padding: 20px;
      color: var(--text-secondary);
    }

    .thinking.active {
      display: block;
    }

    .thinking-dots {
      display: inline-block;
    }

    .thinking-dots::after {
      content: '...';
      animation: dots 1.5s infinite;
    }

    @keyframes dots {
      0%, 20% { content: '.'; }
      40% { content: '..'; }
      60%, 100% { content: '...'; }
    }

    .empty-state {
      text-align: center;
      padding: 40px 20px;
      color: var(--text-secondary);
    }

    .empty-state-icon {
      font-size: 48px;
      margin-bottom: 10px;
    }

    /* ═══════════════════════════════════════════════════════════════════ */
    /* INPUT AREA                                                           */
    /* ═══════════════════════════════════════════════════════════════════ */

    .input-container {
      position: relative;
      margin-bottom: 10px;
    }

    textarea {
      width: 100%;
      min-height: 60px;
      max-height: 150px;
      background: var(--bg-secondary);
      color: var(--text-primary);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 10px 12px;
      resize: vertical;
      font-family: inherit;
      font-size: 13px;
      line-height: 1.5;
    }

    textarea:focus {
      outline: none;
      border-color: var(--accent-purple);
      box-shadow: 0 0 0 2px rgba(168, 85, 247, 0.2);
    }

    textarea::placeholder {
      color: var(--text-secondary);
    }

    /* ═══════════════════════════════════════════════════════════════════ */
    /* ACTION BUTTONS                                                       */
    /* ═══════════════════════════════════════════════════════════════════ */

    .actions-primary {
      display: flex;
      gap: 6px;
      margin-bottom: 8px;
    }

    .actions-secondary {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 6px;
    }

    button {
      cursor: pointer;
      border: none;
      border-radius: 6px;
      padding: 8px 12px;
      font-size: 12px;
      font-weight: 500;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
    }

    button:hover {
      transform: translateY(-1px);
    }

    button:active {
      transform: translateY(0);
    }

    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }

    .btn-primary {
      flex: 1;
      background: linear-gradient(135deg, #238636 0%, #1a6b2c 100%);
      color: white;
      padding: 10px 16px;
      font-size: 13px;
    }

    .btn-primary:hover {
      background: linear-gradient(135deg, #2ea043 0%, #238636 100%);
      box-shadow: 0 4px 12px rgba(35, 134, 54, 0.4);
    }

    .btn-secondary {
      background: var(--bg-tertiary);
      color: var(--text-primary);
      border: 1px solid var(--border-color);
      flex-direction: column;
      padding: 10px 8px;
    }

    .btn-secondary:hover {
      background: var(--bg-secondary);
      border-color: var(--accent-purple);
    }

    .btn-icon {
      font-size: 16px;
    }

    .btn-label {
      font-size: 10px;
      color: var(--text-secondary);
    }

    .btn-clear {
      background: transparent;
      color: var(--text-secondary);
      padding: 10px;
    }

    .btn-clear:hover {
      color: var(--accent-red);
      background: rgba(239, 68, 68, 0.1);
    }
  </style>
</head>
<body>
  <!-- ═══════════════════════════════════════════════════════════════════ -->
  <!-- HEADER                                                               -->
  <!-- ═══════════════════════════════════════════════════════════════════ -->
  
  <div class="header">
    <div class="logo">
      <span class="logo-icon">⚡</span>
      <span>QAntum OMEGA</span>
      <span class="version">v30.6</span>
    </div>
    <div class="status-led">
      <div class="led" id="statusLed"></div>
      <span id="statusText">SYNCED</span>
    </div>
  </div>

  <!-- ═══════════════════════════════════════════════════════════════════ -->
  <!-- SYSTEM STATUS                                                        -->
  <!-- ═══════════════════════════════════════════════════════════════════ -->
  
  <div class="system-status">
    <div class="status-item">
      <span class="status-icon status-ok" id="statusRtx">🎮</span>
      <span>RTX 4050</span>
    </div>
    <div class="status-item">
      <span class="status-icon" id="statusOllama">🤖</span>
      <span>Ollama</span>
    </div>
    <div class="status-item">
      <span class="status-icon status-ok" id="statusGhost">👻</span>
      <span>Ghost</span>
    </div>
    <div class="status-item">
      <span class="status-icon status-ok" id="statusChronos">⏰</span>
      <span>Chronos</span>
    </div>
  </div>

  <!-- ═══════════════════════════════════════════════════════════════════ -->
  <!-- CHAT CONTAINER                                                       -->
  <!-- ═══════════════════════════════════════════════════════════════════ -->
  
  <div class="chat-container" id="chatContainer">
    <div class="empty-state" id="emptyState">
      <div class="empty-state-icon">🧠</div>
      <div>AIAgentExpert готов за команди</div>
      <div style="font-size: 11px; margin-top: 8px;">
        Пиши въпрос или използвай бутоните долу
      </div>
    </div>
    <div class="thinking" id="thinking">
      <div>🧠 QAntum мисли<span class="thinking-dots"></span></div>
    </div>
  </div>

  <!-- ═══════════════════════════════════════════════════════════════════ -->
  <!-- INPUT                                                                -->
  <!-- ═══════════════════════════════════════════════════════════════════ -->
  
  <div class="input-container">
    <textarea 
      id="inputField" 
      placeholder="Заповед към AIAgentExpert... (Enter за изпращане, Shift+Enter за нов ред)"
      rows="2"
    ></textarea>
  </div>

  <!-- ═══════════════════════════════════════════════════════════════════ -->
  <!-- ACTIONS                                                              -->
  <!-- ═══════════════════════════════════════════════════════════════════ -->
  
  <div class="actions-primary">
    <button class="btn-primary" onclick="sendMessage()" id="sendBtn">
      <span>🚀</span>
      <span>Send</span>
    </button>
    <button class="btn-clear" onclick="clearHistory()" title="Clear History">
      🗑️
    </button>
  </div>

  <div class="actions-secondary">
    <button class="btn-secondary" onclick="heal()">
      <span class="btn-icon">🌀</span>
      <span class="btn-label">Heal</span>
    </button>
    <button class="btn-secondary" onclick="audit()">
      <span class="btn-icon">👻</span>
      <span class="btn-label">Audit</span>
    </button>
    <button class="btn-secondary" onclick="swap()">
      <span class="btn-icon">🔄</span>
      <span class="btn-label">Swap</span>
    </button>
    <button class="btn-secondary" onclick="synthesize()">
      <span class="btn-icon">⚡</span>
      <span class="btn-label">Create</span>
    </button>
  </div>

  <!-- ═══════════════════════════════════════════════════════════════════ -->
  <!-- JAVASCRIPT - THE BRAIN                                               -->
  <!-- ═══════════════════════════════════════════════════════════════════ -->
  
  <script>
    const vscode = acquireVsCodeApi();
    
    // ═══════════════════════════════════════════════════════════════════
    // CORE FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════
    
    function sendMessage() {
      const input = document.getElementById('inputField');
      const value = input.value.trim();
      if (!value) return;
      
      vscode.postMessage({ type: 'askExpert', value: value });
      input.value = '';
      hideEmptyState();
    }
    
    function heal() {
      vscode.postMessage({ type: 'heal' });
      hideEmptyState();
    }
    
    function audit() {
      vscode.postMessage({ type: 'audit' });
      hideEmptyState();
    }
    
    function swap() {
      const context = document.getElementById('inputField').value.trim() || undefined;
      vscode.postMessage({ type: 'swap', value: context });
      hideEmptyState();
    }
    
    function synthesize() {
      const input = document.getElementById('inputField');
      const value = input.value.trim();
      if (!value) {
        addMessage('system', '⚠️ Enter a description of what to create');
        return;
      }
      vscode.postMessage({ type: 'synthesize', value: value });
      input.value = '';
      hideEmptyState();
    }
    
    function clearHistory() {
      vscode.postMessage({ type: 'clearHistory' });
      document.getElementById('chatContainer').innerHTML = '';
      showEmptyState();
    }
    
    // ═══════════════════════════════════════════════════════════════════
    // UI HELPERS
    // ═══════════════════════════════════════════════════════════════════
    
    function hideEmptyState() {
      const empty = document.getElementById('emptyState');
      if (empty) empty.style.display = 'none';
    }
    
    function showEmptyState() {
      const container = document.getElementById('chatContainer');
      container.innerHTML = '<div class="empty-state" id="emptyState">' +
        '<div class="empty-state-icon">🧠</div>' +
        '<div>AIAgentExpert готов за команди</div>' +
        '<div style="font-size: 11px; margin-top: 8px;">Пиши въпрос или използвай бутоните долу</div>' +
        '</div>' +
        '<div class="thinking" id="thinking">' +
        '<div>🧠 QAntum мисли<span class="thinking-dots"></span></div>' +
        '</div>';
    }
    
    function addMessage(role, content, timestamp) {
      hideEmptyState();
      const container = document.getElementById('chatContainer');
      const thinking = document.getElementById('thinking');
      
      const roleLabels = {
        user: 'ВИЕ',
        expert: 'OMEGA',
        system: 'SYSTEM'
      };
      
      const time = timestamp || new Date().toLocaleTimeString();
      
      // Format content - convert markdown code blocks
      let formattedContent = content
        .replace(/\`\`\`(\\w*)\\n([\\s\\S]*?)\`\`\`/g, '<pre><code>$2</code></pre>')
        .replace(/\`([^\`]+)\`/g, '<code>$1</code>')
        .replace(/\\*\\*([^*]+)\\*\\*/g, '<strong>$1</strong>')
        .replace(/\\n/g, '<br>');
      
      const messageDiv = document.createElement('div');
      messageDiv.className = 'message ' + role;
      messageDiv.innerHTML = 
        '<div class="message-header">' +
        '<span class="message-role">' + roleLabels[role] + '</span>' +
        '<span>' + time + '</span>' +
        '</div>' +
        '<div class="message-content">' + formattedContent + '</div>';
      
      // Insert before thinking indicator
      if (thinking) {
        container.insertBefore(messageDiv, thinking);
      } else {
        container.appendChild(messageDiv);
      }
      
      // Scroll to bottom
      container.scrollTop = container.scrollHeight;
    }
    
    function updateLed(color, status) {
      const led = document.getElementById('statusLed');
      const text = document.getElementById('statusText');
      
      led.className = 'led';
      if (color === 'purple') led.classList.add('purple');
      if (color === 'red') led.classList.add('red');
      
      text.textContent = status;
    }
    
    function updateSystemStatus(status) {
      const ollama = document.getElementById('statusOllama');
      ollama.className = 'status-icon ' + (status.ollama ? 'status-ok' : 'status-warn');
    }
    
    // ═══════════════════════════════════════════════════════════════════
    // MESSAGE HANDLER
    // ═══════════════════════════════════════════════════════════════════
    
    window.addEventListener('message', event => {
      const data = event.data;
      
      switch (data.type) {
        case 'addMessage':
          addMessage(data.role, data.content, data.timestamp);
          break;
          
        case 'thinking':
          const thinking = document.getElementById('thinking');
          const sendBtn = document.getElementById('sendBtn');
          if (data.value) {
            thinking.classList.add('active');
            sendBtn.disabled = true;
          } else {
            thinking.classList.remove('active');
            sendBtn.disabled = false;
          }
          break;
          
        case 'ledUpdate':
          updateLed(data.color, data.status);
          break;
          
        case 'statusUpdate':
          updateSystemStatus(data.status);
          break;
          
        case 'historyCleared':
          // Already handled
          break;
          
        case 'offerApply':
          addMessage('system', '✅ Код готов за прилагане. Използвай Ctrl+Shift+P > "QAntum: Apply Fix"');
          break;
          
        case 'offerInsert':
          addMessage('system', '✅ Код копиран. Ctrl+V за вмъкване.');
          break;
      }
    });
    
    // ═══════════════════════════════════════════════════════════════════
    // KEYBOARD SHORTCUTS
    // ═══════════════════════════════════════════════════════════════════
    
    document.getElementById('inputField').addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
    
    // Request initial status
    vscode.postMessage({ type: 'getStatus' });
  </script>
</body>
</html>`;
    }
}
exports.QAntumChatPanel = QAntumChatPanel;
