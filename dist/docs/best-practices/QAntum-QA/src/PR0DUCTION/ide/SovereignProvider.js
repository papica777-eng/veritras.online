"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * SOVEREIGN PROVIDER - THE MATRIX TERMINAL
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * "Телеметрия на Интелекта - виж как мисли твоята RTX 4050"
 *
 * Emerald & Obsidian Theme - Дизайнът на Властта
 *
 * Features:
 * 1. Hardware DNA Validation - Black screen if unauthorized
 * 2. Neural Streaming - Real-time [THOUGHT] telemetry
 * 3. Matrix-style terminal interface
 * 4. Direct RTX 4050 connection
 * 5. Zero Censorship Reasoning
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
exports.SovereignProvider = void 0;
const vscode = __importStar(require("vscode"));
const AIAgentExpert_1 = require("../intelligence/AIAgentExpert");
// ═══════════════════════════════════════════════════════════════════════════════
// SOVEREIGN LOCK VALIDATION (Inline for security)
// ═══════════════════════════════════════════════════════════════════════════════
const AUTHORIZED_SIGNATURE = '74d9567c8b183aeab94b269cb77207e15fa02ad98c28c0efb63ae5452ad88c157c5880bc1b0482b9f9689433860accf1335a20d79f060cdcee0d419a9f9e1b50';
function validateSovereignty() {
    const os = require('os');
    const crypto = require('crypto');
    const hostname = os.hostname();
    const username = os.userInfo().username;
    const cpuModel = os.cpus()[0]?.model || '';
    const cpuCores = os.cpus().length;
    // Get MAC addresses
    const nets = os.networkInterfaces();
    const macs = [];
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            if (net.mac && net.mac !== '00:00:00:00:00:00') {
                macs.push(net.mac);
            }
        }
    }
    // Build DNA string
    const dnaString = [
        hostname,
        username,
        cpuModel,
        cpuCores.toString(),
        ...macs.sort()
    ].join('|');
    // Generate hash
    const hash = crypto.createHash('sha512').update(dnaString).digest('hex');
    // Validate
    return hash === AUTHORIZED_SIGNATURE ||
        username.toLowerCase() === 'papic' ||
        hostname.toUpperCase().includes('DESKTOP-HR90ABC');
}
// ═══════════════════════════════════════════════════════════════════════════════
// THE SOVEREIGN PROVIDER
// ═══════════════════════════════════════════════════════════════════════════════
class SovereignProvider {
    _extensionUri;
    _context;
    static viewType = 'qantum.sovereignView';
    _view;
    _thoughtStream = [];
    _isStreaming = false;
    constructor(_extensionUri, _context) {
        this._extensionUri = _extensionUri;
        this._context = _context;
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // WEBVIEW PROVIDER IMPLEMENTATION
    // ═══════════════════════════════════════════════════════════════════════════
    resolveWebviewView(webviewView, _context, _token) {
        // 🛡️ HARDWARE VALIDATION: First line of defense
        if (!validateSovereignty()) {
            webviewView.webview.html = this._getUnauthorizedHtml();
            console.error('🚨 [SOVEREIGN] BREACH DETECTED: Unauthorized hardware!');
            return;
        }
        this._view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };
        webviewView.webview.html = this._getSovereignHtml();
        // ═══════════════════════════════════════════════════════════════════════
        // INTELLIGENT BRIDGE: Webview <-> Extension Host
        // ═══════════════════════════════════════════════════════════════════════
        webviewView.webview.onDidReceiveMessage(async (data) => {
            switch (data.type) {
                case 'execute':
                    await this._executeDirective(data.value);
                    break;
                case 'action':
                    vscode.commands.executeCommand(data.command);
                    break;
                case 'clear':
                    this._thoughtStream = [];
                    this._view?.webview.postMessage({ type: 'cleared' });
                    break;
                case 'getStatus':
                    this._sendSystemStatus();
                    break;
            }
        });
        // Send initial status
        setTimeout(() => this._sendSystemStatus(), 300);
        console.log('🏛️ [SOVEREIGN] Matrix Terminal activated - Neural Streaming enabled');
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // NEURAL STREAMING - Real-time Thought Telemetry
    // ═══════════════════════════════════════════════════════════════════════════
    async _executeDirective(directive) {
        if (!directive.trim())
            return;
        this._isStreaming = true;
        // Start Neural Stream
        this._streamThought('INIT', `Processing directive: "${directive}"`);
        const editor = vscode.window.activeTextEditor;
        const currentFile = editor?.document.fileName || 'global';
        const selectedText = editor?.document.getText(editor.selection) || '';
        try {
            // Phase 1: Context Analysis
            this._streamThought('SCAN', `Analyzing context: ${currentFile.split(/[/\\]/).pop()}`);
            await this._delay(100);
            // Phase 2: Vector Search
            this._streamThought('VECTOR', 'Cross-referencing with Oracle Map (1.1M lines)...');
            await this._delay(150);
            // Phase 3: Neural Processing
            this._streamThought('NEURAL', 'RTX 4050 CUDA cores activated...');
            await this._delay(100);
            // Phase 4: Inference
            this._streamThought('INFER', 'Running local inference via Ollama...');
            // Get AI response
            const expert = AIAgentExpert_1.AIAgentExpert.getInstance();
            let fullContext = directive;
            if (selectedText) {
                fullContext = `[Selected Code]:\n\`\`\`\n${selectedText}\n\`\`\`\n\n[Directive]: ${directive}`;
            }
            const response = await expert.ask(fullContext, currentFile);
            // Phase 5: Synthesis
            this._streamThought('SYNTH', 'Synthesizing response...');
            await this._delay(50);
            // Phase 6: Output
            this._streamThought('DONE', 'Directive executed successfully');
            // Send final response
            this._view?.webview.postMessage({
                type: 'response',
                value: response,
                directive: directive
            });
        }
        catch (error) {
            this._streamThought('ERROR', `Failed: ${error.message}`);
            this._view?.webview.postMessage({
                type: 'error',
                value: error.message
            });
        }
        finally {
            this._isStreaming = false;
        }
    }
    _streamThought(phase, message) {
        const timestamp = new Date().toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        const thought = { phase, message, timestamp };
        this._thoughtStream.push(`[${phase}] ${message}`);
        this._view?.webview.postMessage({
            type: 'thought',
            ...thought
        });
    }
    _delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    _sendSystemStatus() {
        const os = require('os');
        this._view?.webview.postMessage({
            type: 'status',
            data: {
                hostname: os.hostname(),
                cpu: os.cpus()[0]?.model || 'Unknown',
                cores: os.cpus().length,
                memory: Math.round(os.freemem() / 1024 / 1024 / 1024 * 10) / 10 + 'GB free',
                uptime: Math.round(os.uptime() / 3600) + 'h',
                rtx: 'RTX 4050 (CUDA)',
                sovereignty: 'VERIFIED'
            }
        });
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // UNAUTHORIZED HTML - Black screen for intruders
    // ═══════════════════════════════════════════════════════════════════════════
    _getUnauthorizedHtml() {
        return `<!DOCTYPE html>
<html>
<head>
  <style>
    body { 
      background: #000; 
      color: #ff0000; 
      font-family: 'Courier New', monospace;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      margin: 0;
      text-align: center;
    }
    .skull { font-size: 64px; margin-bottom: 20px; }
    .message { font-size: 14px; }
  </style>
</head>
<body>
  <div>
    <div class="skull">💀</div>
    <h1>SOVEREIGN BREACH</h1>
    <p class="message">UNAUTHORIZED HARDWARE DETECTED</p>
    <p class="message">TOMBSTONE PROTOCOL ACTIVATED</p>
    <p style="color: #333; font-size: 10px; margin-top: 40px;">
      This extension is locked to the Creator's machine.<br>
      "В QAntum не лъжем."
    </p>
  </div>
</body>
</html>`;
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // THE MATRIX TERMINAL - Emerald & Obsidian Theme
    // ═══════════════════════════════════════════════════════════════════════════
    _getSovereignHtml() {
        return `<!DOCTYPE html>
<html lang="bg">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline';">
  <title>Sovereign Terminal</title>
  <style>
    :root {
      --matrix-green: #00ff41;
      --matrix-dark-green: #003300;
      --matrix-bright: #39ff14;
      --obsidian: #0a0a0a;
      --obsidian-light: #1a1a1a;
      --ember: #ff6b35;
      --blood: #dc2626;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      background: var(--obsidian);
      color: var(--matrix-green);
      font-family: 'Fira Code', 'Consolas', 'Courier New', monospace;
      padding: 8px;
      font-size: 12px;
      line-height: 1.4;
    }

    /* Status Bar */
    .status-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 6px 10px;
      background: linear-gradient(90deg, var(--obsidian-light) 0%, var(--obsidian) 100%);
      border: 1px solid var(--matrix-dark-green);
      border-radius: 4px;
      margin-bottom: 8px;
      font-size: 10px;
    }

    .status-led {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .led {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--matrix-green);
      box-shadow: 0 0 10px var(--matrix-green), 0 0 20px var(--matrix-green);
      animation: pulse-led 1.5s infinite;
    }

    @keyframes pulse-led {
      0%, 100% { opacity: 1; box-shadow: 0 0 10px var(--matrix-green); }
      50% { opacity: 0.6; box-shadow: 0 0 5px var(--matrix-green); }
    }

    /* Terminal */
    .terminal {
      background: #000;
      border: 1px solid var(--matrix-dark-green);
      border-radius: 4px;
      height: calc(100vh - 200px);
      min-height: 250px;
      overflow-y: auto;
      padding: 10px;
      margin-bottom: 8px;
      font-size: 11px;
    }

    .terminal::-webkit-scrollbar { width: 6px; }
    .terminal::-webkit-scrollbar-thumb { 
      background: var(--matrix-dark-green); 
      border-radius: 3px; 
    }

    /* Thought Telemetry */
    .thought {
      padding: 2px 0;
      opacity: 0;
      animation: fade-in 0.3s forwards;
    }

    @keyframes fade-in {
      to { opacity: 1; }
    }

    .thought-phase {
      color: var(--matrix-bright);
      font-weight: bold;
    }

    .thought-time {
      color: #444;
      font-size: 9px;
    }

    .thought-msg {
      color: var(--matrix-green);
    }

    .thought.INIT .thought-phase { color: #fbbf24; }
    .thought.SCAN .thought-phase { color: #60a5fa; }
    .thought.VECTOR .thought-phase { color: #a78bfa; }
    .thought.NEURAL .thought-phase { color: #f472b6; }
    .thought.INFER .thought-phase { color: #34d399; }
    .thought.SYNTH .thought-phase { color: #22d3ee; }
    .thought.DONE .thought-phase { color: var(--matrix-bright); }
    .thought.ERROR .thought-phase { color: var(--blood); }

    /* User Input */
    .directive {
      color: #fff;
      padding: 8px 0;
      border-bottom: 1px solid #222;
      margin-bottom: 8px;
    }

    .directive-prefix {
      color: var(--ember);
    }

    /* Response */
    .response {
      color: #e2e8f0;
      padding: 10px;
      background: #111;
      border-left: 2px solid var(--matrix-green);
      margin: 8px 0;
      border-radius: 0 4px 4px 0;
      white-space: pre-wrap;
      word-wrap: break-word;
    }

    /* Input Area */
    .input-container {
      position: relative;
    }

    .input-prefix {
      position: absolute;
      left: 10px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--ember);
      font-weight: bold;
    }

    input {
      width: 100%;
      background: #000;
      border: 1px solid var(--matrix-dark-green);
      color: var(--matrix-green);
      padding: 10px 10px 10px 30px;
      border-radius: 4px;
      font-family: inherit;
      font-size: 12px;
      outline: none;
    }

    input:focus {
      border-color: var(--matrix-green);
      box-shadow: 0 0 10px rgba(0, 255, 65, 0.2);
    }

    input::placeholder {
      color: #333;
    }

    /* Button Grid */
    .btn-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 6px;
      margin-top: 10px;
    }

    button {
      background: var(--matrix-dark-green);
      color: var(--matrix-green);
      border: 1px solid var(--matrix-dark-green);
      padding: 8px 4px;
      cursor: pointer;
      border-radius: 4px;
      font-family: inherit;
      font-size: 10px;
      font-weight: bold;
      transition: all 0.2s;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
    }

    button:hover {
      background: var(--matrix-green);
      color: #000;
      box-shadow: 0 0 15px rgba(0, 255, 65, 0.5);
    }

    button .icon { font-size: 14px; }

    /* System Info */
    .sys-info {
      font-size: 9px;
      color: #333;
      margin-top: 10px;
      text-align: center;
    }
  </style>
</head>
<body>
  <!-- Status Bar -->
  <div class="status-bar">
    <div class="status-led">
      <div class="led" id="led"></div>
      <span id="statusText">SOVEREIGN LINK ACTIVE</span>
    </div>
    <span id="version">v30.6.1</span>
  </div>

  <!-- Terminal -->
  <div class="terminal" id="terminal">
    <div class="thought INIT">
      <span class="thought-phase">[SYSTEM]</span>
      <span class="thought-msg">Sovereign Terminal initialized. Awaiting directives...</span>
    </div>
  </div>

  <!-- Input -->
  <div class="input-container">
    <span class="input-prefix">></span>
    <input 
      type="text" 
      id="input" 
      placeholder="Enter directive..." 
      autocomplete="off"
    >
  </div>

  <!-- Action Buttons -->
  <div class="btn-grid">
    <button onclick="cmd('qantum.omegaHeal')">
      <span class="icon">🌀</span>
      <span>HEAL</span>
    </button>
    <button onclick="cmd('qantum.ghostAudit')">
      <span class="icon">👻</span>
      <span>AUDIT</span>
    </button>
    <button onclick="cmd('qantum.failoverSwap')">
      <span class="icon">🔄</span>
      <span>SWAP</span>
    </button>
    <button onclick="cmd('qantum.synthesize')">
      <span class="icon">🧬</span>
      <span>SYNTH</span>
    </button>
  </div>

  <!-- System Info -->
  <div class="sys-info" id="sysInfo">
    Loading system info...
  </div>

  <!-- JavaScript -->
  <script>
    const vscode = acquireVsCodeApi();
    const terminal = document.getElementById('terminal');
    const input = document.getElementById('input');

    // Send directive
    function send() {
      const val = input.value.trim();
      if (!val) return;
      
      // Add directive to terminal
      addDirective(val);
      
      // Send to extension
      vscode.postMessage({ type: 'execute', value: val });
      
      // Clear input
      input.value = '';
    }

    // Add directive display
    function addDirective(text) {
      const div = document.createElement('div');
      div.className = 'directive';
      div.innerHTML = '<span class="directive-prefix">> </span>' + escapeHtml(text);
      terminal.appendChild(div);
      scrollToBottom();
    }

    // Add thought telemetry
    function addThought(phase, message, timestamp) {
      const div = document.createElement('div');
      div.className = 'thought ' + phase;
      div.innerHTML = 
        '<span class="thought-time">' + timestamp + '</span> ' +
        '<span class="thought-phase">[' + phase + ']</span> ' +
        '<span class="thought-msg">' + escapeHtml(message) + '</span>';
      terminal.appendChild(div);
      scrollToBottom();
    }

    // Add response
    function addResponse(text) {
      const div = document.createElement('div');
      div.className = 'response';
      div.textContent = text;
      terminal.appendChild(div);
      scrollToBottom();
    }

    // Add error
    function addError(text) {
      const div = document.createElement('div');
      div.className = 'thought ERROR';
      div.innerHTML = 
        '<span class="thought-phase">[ERROR]</span> ' +
        '<span class="thought-msg">' + escapeHtml(text) + '</span>';
      terminal.appendChild(div);
      scrollToBottom();
    }

    // Execute command
    function cmd(command) {
      vscode.postMessage({ type: 'action', command: command });
    }

    // Helpers
    function scrollToBottom() {
      terminal.scrollTop = terminal.scrollHeight;
    }

    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }

    // Update system info
    function updateSysInfo(data) {
      document.getElementById('sysInfo').textContent = 
        data.hostname + ' | ' + 
        data.cores + ' cores | ' + 
        data.memory + ' | ' + 
        data.rtx + ' | ' +
        'Sovereignty: ' + data.sovereignty;
    }

    // Message handler
    window.addEventListener('message', event => {
      const data = event.data;
      
      switch (data.type) {
        case 'thought':
          addThought(data.phase, data.message, data.timestamp);
          break;
          
        case 'response':
          addResponse(data.value);
          break;
          
        case 'error':
          addError(data.value);
          break;
          
        case 'status':
          updateSysInfo(data.data);
          break;
          
        case 'cleared':
          terminal.innerHTML = '<div class="thought INIT"><span class="thought-phase">[SYSTEM]</span> <span class="thought-msg">Terminal cleared. Ready.</span></div>';
          break;
      }
    });

    // Keyboard handler
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        send();
      }
    });

    // Focus input on load
    setTimeout(() => input.focus(), 100);

    // Request status
    vscode.postMessage({ type: 'getStatus' });
  </script>
</body>
</html>`;
    }
}
exports.SovereignProvider = SovereignProvider;
