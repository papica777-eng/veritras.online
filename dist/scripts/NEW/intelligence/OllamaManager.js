"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║            OLLAMA MANAGER — SMART AUTO-MODEL SELECTOR                        ║
 * ║   Detects which Ollama models are installed, picks the best one.             ║
 * ║   Zero external deps — pure Node.js http built-in.                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
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
exports.OllamaManager = void 0;
const http = __importStar(require("http"));
const child_process_1 = require("child_process");
// ═══════════════════════════════════════════════════════════════════════════════
// MODEL PREFERENCE LIST (order = priority)
// ═══════════════════════════════════════════════════════════════════════════════
const PREFERRED_MODELS = [
    'deepseek-coder',
    'deepseek-r1',
    'qantum-ai-supreme',
    'qwen2.5-coder',
    'llama3.3',
    'llama3.2',
    'llama3.1',
    'llama3',
    'gemma3',
    'gemma2',
    'mistral',
    'phi4',
    'phi3',
    'codellama',
    'gemma',
];
// ═══════════════════════════════════════════════════════════════════════════════
class OllamaManager {
    static instance;
    baseUrl = 'http://127.0.0.1:11434';
    selectedModel = '';
    isInitialized = false;
    constructor() { }
    static getInstance() {
        if (!OllamaManager.instance) {
            OllamaManager.instance = new OllamaManager();
        }
        return OllamaManager.instance;
    }
    // ───────────────────────────────────────────────────────────────────────────
    // PUBLIC API
    // ───────────────────────────────────────────────────────────────────────────
    /** Returns true if Ollama server is reachable */
    // Complexity: O(N) — potential recursive descent
    async isRunning() {
        try {
            await this.httpGet('/api/tags');
            return true;
        }
        catch {
            return false;
        }
    }
    /** Get list of installed model names */
    // Complexity: O(N) — linear iteration
    async getInstalledModels() {
        try {
            const raw = await this.httpGet('/api/tags');
            const data = JSON.parse(raw);
            return (data.models || []).map((m) => m.name);
        }
        catch {
            return [];
        }
    }
    /**
     * Auto-select the best available model.
     * Returns the model name, or '' if Ollama isn't running.
     */
    // Complexity: O(N) — linear iteration
    async adaptModel() {
        if (this.isInitialized && this.selectedModel) {
            return this.selectedModel;
        }
        // SAFETY: async operation — wrap in try-catch for production resilience
        const installed = await this.getInstalledModels();
        if (installed.length === 0) {
            console.log('[OllamaManager] ⚠️ No models found (Ollama not running or empty)');
            return '';
        }
        // Match preferred list against installed
        for (const preferred of PREFERRED_MODELS) {
            const found = installed.find(m => m.startsWith(preferred));
            if (found) {
                this.selectedModel = found;
                this.isInitialized = true;
                console.log(`[OllamaManager] ✅ Auto-selected: ${this.selectedModel}`);
                return this.selectedModel;
            }
        }
        // Fallback: first non-cloud model
        const local = installed.find(m => !m.includes('cloud')) || installed[0];
        this.selectedModel = local;
        this.isInitialized = true;
        console.log(`[OllamaManager] ⚠️ No preferred model. Using: ${this.selectedModel}`);
        return this.selectedModel;
    }
    /** Try to start Ollama if not running */
    // Complexity: O(N) — linear iteration
    async ensureRunning() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        if (await this.isRunning())
            return true;
        console.log('[OllamaManager] Starting Ollama...');
        const proc = (0, child_process_1.spawn)('ollama', ['serve'], { detached: true, stdio: 'ignore' });
        proc.unref();
        for (let i = 0; i < 5; i++) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.sleep(2000);
            // SAFETY: async operation — wrap in try-catch for production resilience
            if (await this.isRunning()) {
                console.log('[OllamaManager] ✅ Ollama started');
                // SAFETY: async operation — wrap in try-catch for production resilience
                await this.adaptModel();
                return true;
            }
        }
        console.log('[OllamaManager] ❌ Could not start Ollama');
        return false;
    }
    get currentModel() {
        return this.selectedModel;
    }
    // ───────────────────────────────────────────────────────────────────────────
    // PRIVATE HELPERS
    // ───────────────────────────────────────────────────────────────────────────
    // Complexity: O(1) — hash/map lookup
    httpGet(path) {
        return new Promise((resolve, reject) => {
            const url = new URL(path, this.baseUrl);
            const req = http.get({
                hostname: url.hostname,
                port: url.port || 11434,
                path: url.pathname,
                timeout: 3000,
            }, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => resolve(data));
            });
            req.on('error', reject);
            req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
        });
    }
    // Complexity: O(1)
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
exports.OllamaManager = OllamaManager;
exports.default = OllamaManager;
