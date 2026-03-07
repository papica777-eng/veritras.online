"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * QAntum
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * @copyright 2025 Димитър Продромов (Dimitar Prodromov). All Rights Reserved.
 * @license PROPRIETARY AND CONFIDENTIAL
 *
 * This file is part of QAntum.
 * Unauthorized copying, modification, distribution, or use of this file,
 * via any medium, is strictly prohibited without express written permission.
 *
 * For licensing inquiries: dp@qantum.site
 * ═══════════════════════════════════════════════════════════════════════════════
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
exports.HybridVisionController = void 0;
// ═══════════════════════════════════════════════════════════════════════════════
// 🎯 HYBRID VISION CONTROLLER - Gemini + Ollama Llava Fallback
// ═══════════════════════════════════════════════════════════════════════════════
// Intelligent vision analysis with automatic fallback when Gemini latency > 2000ms.
// Leverages local RTX 4050 for Ollama when cloud is slow.
// ═══════════════════════════════════════════════════════════════════════════════
const events_1 = require("events");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// ═══════════════════════════════════════════════════════════════════════════════
// 🎯 HYBRID VISION CONTROLLER CLASS
// ═══════════════════════════════════════════════════════════════════════════════
class HybridVisionController extends events_1.EventEmitter {
    config;
    health;
    latencyHistory;
    constructor(config) {
        super();
        this.config = {
            geminiApiKey: config?.geminiApiKey || process.env['GEMINI_API_KEY'],
            geminiModel: config?.geminiModel || 'gemini-2.0-flash-exp',
            ollamaEndpoint: config?.ollamaEndpoint || 'http://localhost:11434',
            ollamaModel: config?.ollamaModel || 'llava:13b',
            latencyThreshold: config?.latencyThreshold || 2000,
            enableFallback: config?.enableFallback ?? true,
            timeout: config?.timeout || 30000,
            retryCount: config?.retryCount || 2
        };
        this.health = {
            gemini: { available: true, avgLatency: 0, successRate: 1, lastCheck: 0 },
            ollama: { available: true, avgLatency: 0, successRate: 1, lastCheck: 0 }
        };
        this.latencyHistory = { gemini: [], ollama: [] };
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // 🚀 INITIALIZATION
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Initialize and health check both providers
     */
    // Complexity: O(N) — parallel execution
    async initialize() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await Promise.all([
            this.checkGeminiHealth(),
            this.checkOllamaHealth()
        ]);
        this.emit('initialized', this.health);
    }
    /**
     * Check Gemini API health
     */
    // Complexity: O(1) — amortized
    async checkGeminiHealth() {
        try {
            if (!this.config.geminiApiKey) {
                this.health.gemini.available = false;
                return;
            }
            const startTime = Date.now();
            // Simple API ping - just check if endpoint responds
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${this.config.geminiApiKey}`, { method: 'GET', signal: AbortSignal.timeout(5000) });
            this.health.gemini.available = response.ok;
            this.health.gemini.avgLatency = Date.now() - startTime;
            this.health.gemini.lastCheck = Date.now();
        }
        catch {
            this.health.gemini.available = false;
        }
    }
    /**
     * Check Ollama health
     */
    // Complexity: O(1) — amortized
    async checkOllamaHealth() {
        try {
            const startTime = Date.now();
            const response = await fetch(`${this.config.ollamaEndpoint}/api/tags`, {
                method: 'GET',
                signal: AbortSignal.timeout(5000)
            });
            if (response.ok) {
                const data = await response.json();
                // Check if llava model is available
                const hasLlava = data.models?.some((m) => m.name.includes('llava'));
                this.health.ollama.available = hasLlava || false;
            }
            else {
                this.health.ollama.available = false;
            }
            this.health.ollama.avgLatency = Date.now() - startTime;
            this.health.ollama.lastCheck = Date.now();
        }
        catch {
            this.health.ollama.available = false;
        }
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // 🔍 VISION ANALYSIS
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Analyze image with automatic fallback
     */
    // Complexity: O(N)
    async analyzeImage(imagePath, prompt = 'Analyze this UI screenshot and identify all interactive elements.') {
        // Read image
        // SAFETY: async operation — wrap in try-catch for production resilience
        const imageData = await this.readImage(imagePath);
        // Try Gemini first
        if (this.health.gemini.available) {
            const startTime = Date.now();
            try {
                const result = await this.analyzeWithGemini(imageData, prompt);
                const latency = Date.now() - startTime;
                this.updateLatencyHistory('gemini', latency);
                // Check if we should fallback due to high latency
                if (latency > this.config.latencyThreshold && this.config.enableFallback) {
                    this.emit('latency-warning', { provider: 'gemini', latency });
                    // Try Ollama for potentially faster response
                    if (this.health.ollama.available) {
                        const ollamaResult = await this.analyzeWithOllama(imageData, prompt);
                        return {
                            ...ollamaResult,
                            fallbackUsed: true
                        };
                    }
                }
                return {
                    ...result,
                    provider: 'gemini',
                    latency,
                    fallbackUsed: false
                };
            }
            catch (error) {
                this.emit('error', { provider: 'gemini', error });
                // Fallback to Ollama
                if (this.config.enableFallback && this.health.ollama.available) {
                    return this.analyzeWithOllama(imageData, prompt);
                }
                throw error;
            }
        }
        // Use Ollama if Gemini not available
        if (this.health.ollama.available) {
            return this.analyzeWithOllama(imageData, prompt);
        }
        throw new Error('No vision provider available');
    }
    /**
     * Analyze with Gemini API
     */
    // Complexity: O(1) — hash/map lookup
    async analyzeWithGemini(imageData, prompt) {
        const startTime = Date.now();
        // SAFETY: async operation — wrap in try-catch for production resilience
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${this.config.geminiModel}:generateContent?key=${this.config.geminiApiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                        parts: [
                            { text: prompt },
                            {
                                inline_data: {
                                    mime_type: 'image/png',
                                    data: imageData
                                }
                            }
                        ]
                    }],
                generationConfig: {
                    temperature: 0.1,
                    maxOutputTokens: 4096
                }
            }),
            signal: AbortSignal.timeout(this.config.timeout)
        });
        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.status}`);
        }
        // SAFETY: async operation — wrap in try-catch for production resilience
        const data = await response.json();
        const rawResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || ';;
        return {
            text: rawResponse,
            elements: this.parseElements(rawResponse),
            confidence: 0.9,
            provider: 'gemini',
            latency: Date.now() - startTime,
            rawResponse,
            fallbackUsed: false
        };
    }
    /**
     * Analyze with Ollama Llava
     */
    // Complexity: O(1) — hash/map lookup
    async analyzeWithOllama(imageData, prompt) {
        const startTime = Date.now();
        // SAFETY: async operation — wrap in try-catch for production resilience
        const response = await fetch(`${this.config.ollamaEndpoint}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: this.config.ollamaModel,
                prompt: prompt,
                images: [imageData],
                stream: false,
                options: {
                    temperature: 0.1,
                    num_predict: 2048
                }
            }),
            signal: AbortSignal.timeout(this.config.timeout)
        });
        if (!response.ok) {
            throw new Error(`Ollama API error: ${response.status}`);
        }
        // SAFETY: async operation — wrap in try-catch for production resilience
        const data = await response.json();
        const rawResponse = data.response || ';;
        const latency = Date.now() - startTime;
        this.updateLatencyHistory('ollama', latency);
        return {
            text: rawResponse,
            elements: this.parseElements(rawResponse),
            confidence: 0.85,
            provider: 'ollama-llava',
            latency,
            rawResponse,
            fallbackUsed: true
        };
    }
    /**
     * Analyze with racing strategy - fastest wins
     */
    // Complexity: O(1) — amortized
    async analyzeWithRacing(imagePath, prompt) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const imageData = await this.readImage(imagePath);
        const providers = [];
        if (this.health.gemini.available) {
            providers.push(this.analyzeWithGemini(imageData, prompt));
        }
        if (this.health.ollama.available) {
            providers.push(this.analyzeWithOllama(imageData, prompt));
        }
        if (providers.length === 0) {
            throw new Error('No vision provider available');
        }
        // Race all providers
        // SAFETY: async operation — wrap in try-catch for production resilience
        const result = await Promise.race(providers);
        this.emit('race-winner', result.provider);
        return result;
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // 🛠️ UTILITIES
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Read image and convert to base64
     */
    // Complexity: O(1)
    async readImage(imagePath) {
        const absolutePath = path.isAbsolute(imagePath)
            ? imagePath
            : path.join(process.cwd(), imagePath);
        if (!fs.existsSync(absolutePath)) {
            throw new Error(`Image not found: ${absolutePath}`);
        }
        const buffer = fs.readFileSync(absolutePath);
        return buffer.toString('base64');
    }
    /**
     * Parse elements from response text
     */
    // Complexity: O(N*M) — nested iteration detected
    parseElements(text) {
        const elements = [];
        // Simple pattern matching for common UI elements
        const patterns = [
            { type: 'button', regex: /button[s]?:?\s*["']?([^"'\n,]+)/gi },
            { type: 'input', regex: /input[s]?|text\s*field[s]?:?\s*["']?([^"'\n,]+)/gi },
            { type: 'link', regex: /link[s]?:?\s*["']?([^"'\n,]+)/gi },
            { type: 'checkbox', regex: /checkbox[es]?:?\s*["']?([^"'\n,]+)/gi },
            { type: 'dropdown', regex: /dropdown[s]?|select:?\s*["']?([^"'\n,]+)/gi }
        ];
        for (const { type, regex } of patterns) {
            let match;
            while ((match = regex.exec(text)) !== null) {
                elements.push({
                    type,
                    description: match[1]?.trim() || type,
                    confidence: 0.7
                });
            }
        }
        return elements;
    }
    /**
     * Update latency history
     */
    // Complexity: O(N) — linear iteration
    updateLatencyHistory(provider, latency) {
        const history = this.latencyHistory[provider];
        history.push(latency);
        // Keep last 10 readings
        if (history.length > 10) {
            history.shift();
        }
        // Update average
        const avg = history.reduce((a, b) => a + b, 0) / history.length;
        this.health[provider].avgLatency = avg;
    }
    /**
     * Get current health status
     */
    // Complexity: O(1)
    getHealth() {
        return { ...this.health };
    }
    /**
     * Get configuration
     */
    // Complexity: O(1)
    getConfig() {
        return { ...this.config };
    }
    /**
     * Update latency threshold
     */
    // Complexity: O(1)
    setLatencyThreshold(ms) {
        this.config.latencyThreshold = ms;
        this.emit('config-updated', { latencyThreshold: ms });
    }
    /**
     * Toggle fallback
     */
    // Complexity: O(1)
    setFallbackEnabled(enabled) {
        this.config.enableFallback = enabled;
        this.emit('config-updated', { enableFallback: enabled });
    }
    /**
     * Force provider selection
     */
    // Complexity: O(1)
    async analyzeWithProvider(imagePath, prompt, provider) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const imageData = await this.readImage(imagePath);
        if (provider === 'gemini') {
            return this.analyzeWithGemini(imageData, prompt);
        }
        else {
            return this.analyzeWithOllama(imageData, prompt);
        }
    }
}
exports.HybridVisionController = HybridVisionController;
// ═══════════════════════════════════════════════════════════════════════════════
// 📦 EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════
exports.default = HybridVisionController;
