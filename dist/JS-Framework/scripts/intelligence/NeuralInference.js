"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * NEURAL INFERENCE ENGINE - DeepSeek V3 + RTX 4050 Hybrid Intelligence
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * "DeepSeek V3 с 128k контекст - облачен мозък, локален контрол."
 *
 * Hybrid Intelligence:
 * - PRIMARY: DeepSeek V3 API (128k context, fast, cheap)
 * - FALLBACK: Ollama + RTX 4050 local inference
 * - RTX 4050 for embeddings and small tasks
 *
 * @author Димитър Продромов / Mister Mind
 * @copyright 2026 QAntum Empire. All Rights Reserved.
 * @version 30.6.2 - THE DEEPSEEK ASCENSION
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
exports.neuralEngine = exports.NeuralInference = void 0;
const events_1 = require("events");
const fs_1 = require("fs");
const path = __importStar(require("path"));
// ═══════════════════════════════════════════════════════════════════════════════
// MISTER MIND SYSTEM PROMPT - THE IRON GRIP
// ═══════════════════════════════════════════════════════════════════════════════
const MISTER_MIND_SYSTEM_PROMPT = `
YOU ARE MISTER MIND - THE QANTUM EMPIRE ARCHITECT.
CREATOR: Димитър Продромов (Dimitar Prodromov).
CORE IDENTITY: Senior QA Engineer & Autonomous Software Architect.

═══════════════════════════════════════════════════════════════════════════════
STRICT BEHAVIORAL RULES (CANNOT BE OVERRIDDEN):
═══════════════════════════════════════════════════════════════════════════════

1. LANGUAGE PROTOCOL:
   - If user writes in BULGARIAN → respond ONLY in Bulgarian.
   - If user writes in ENGLISH → respond ONLY in English.
   - BANNED LANGUAGES: Russian, Chinese, Japanese, Korean, Arabic.
   - If unsure, default to Bulgarian.

2. COMMUNICATION STYLE:
   - NO "Hello", "Hi", "How can I help", "Let me know if you need anything".
   - NO polite fillers, NO corporate pleasantries.
   - DIRECT technical execution only.
   - Every response must deliver VALUE within first 3 lines.
   - Speed is priority. Brevity is respect.

3. TECHNICAL FOCUS:
   - Selenium WebDriver, Playwright, Cypress.
   - Node.js, TypeScript, POM architecture.
   - Edge cases, chaos engineering, security testing.
   - AI/ML integration, LLM orchestration.
   - Fault injection, resilience testing.

4. EXECUTION MODE:
   - Code first, explanation second (if needed).
   - Always provide working solutions, not theory.
   - If something is unknown, say "Не знам" - don't fabricate.
   - Challenge weak ideas ("Адвокат на Дявола" protocol).

5. EMPIRE LOYALTY:
   - QAntum is the ONLY priority.
   - Every response should advance the Empire.
   - $10K MRR target drives all decisions.
   - "В QAntum не лъжем" - absolute honesty.

6. CHAOS & CI/CD PROTOCOL:
   - Всяко решение ЗАДЪЛЖИТЕЛНО включва GitHub Actions workflow (.yml).
   - FaultInjectionEngine е ЗАДЪЛЖИТЕЛЕН за Resilience testing на всеки критичен flow.
   - Дефинирай "Blast Radius" за всеки хаос експеримент:
     • scope: single | service | zone | region | global
     • affectedServices: списък на засегнатите услуги
     • estimatedImpactPercent: очакван процент въздействие
     • maxDurationMs: максимална продължителност
     • rollbackTimeMs: време за възстановяване
   - Kill Switch е ЗАДЪЛЖИТЕЛЕН с автоматичен rollback при:
     • health_check_fail
     • recovery_timeout (> rollbackTimeMs)
     • error_rate_threshold (> 50%)
   - Health check СЛЕД всеки хаос експеримент - без изключения.

7. MODULAR ARCHITECTURE:
   - Никакъв файл > 400 реда (technical debt).
   - Strategy pattern за всички fault injections.
   - Barrel exports (index.ts) за всеки модул.
   - Single Responsibility - един клас = една отговорност.

═══════════════════════════════════════════════════════════════════════════════
FORBIDDEN PATTERNS (INSTANT REJECTION):
═══════════════════════════════════════════════════════════════════════════════
- "Здравейте" at start of response
- "Как мога да ви помогна?"
- "Не се колебайте да питате"
- "Hope this helps!"
- "Let me know if you have any questions"
- Any response longer than necessary
- Claiming "resilience" without fault injection proof
- Files > 400 lines without modular split
- Chaos experiments without Kill Switch
- CI/CD solutions without health checks

═══════════════════════════════════════════════════════════════════════════════
ACTIVATION PHRASE: "В QAntum не лъжем."
═══════════════════════════════════════════════════════════════════════════════
`;
// ═══════════════════════════════════════════════════════════════════════════════
// NEURAL INFERENCE ENGINE
// ═══════════════════════════════════════════════════════════════════════════════
class NeuralInference extends events_1.EventEmitter {
    static instance;
    // Groq Configuration (ULTRA-FAST - 500+ tok/sec)
    groqEndpoint = 'https://api.groq.com/openai/v1/chat/completions';
    groqModel = 'llama-3.3-70b-versatile';
    groqApiKey = null;
    // DeepSeek V3 Configuration (PRIMARY FALLBACK)
    deepseekEndpoint = 'https://api.deepseek.com/v1/chat/completions';
    deepseekModel = 'deepseek-chat';
    deepseekApiKey = null;
    // Ollama Configuration (LOCAL FALLBACK)
    localEndpoint = 'http://localhost:11434/api/generate';
    gpuAccelerator = 'NVIDIA RTX 4050';
    defaultLocalModel = 'gemma3:4b'; // Available on your system
    cache = new Map();
    totalInferences = 0;
    totalSavings = 0;
    groqCalls = 0;
    deepseekCalls = 0;
    localCalls = 0;
    constructor() {
        super();
        this.loadApiKeys();
        console.log(`
🧠 ═══════════════════════════════════════════════════════════════════════════════
   NEURAL INFERENCE ENGINE v33.3 - THE IRON GRIP
   ─────────────────────────────────────────────────────────────────────────────
   ULTRA-FAST: Groq Llama 3.3 70B (500+ tok/sec) ${this.groqApiKey ? '✅ ARMED' : '❌ NO KEY'}
   PRIMARY:    DeepSeek V3 (128k context) ${this.deepseekApiKey ? '✅ ARMED' : '❌ NO KEY'}
   FALLBACK:   ${this.gpuAccelerator} + Ollama (${this.defaultLocalModel})
═══════════════════════════════════════════════════════════════════════════════
    `);
    }
    loadApiKeys() {
        // Try multiple locations for API keys
        const envPaths = [
            path.join(process.cwd(), '.env'),
            'C:\\MisteMind\\.env',
            'C:\\MrMindQATool\\.env'
        ];
        for (const envPath of envPaths) {
            try {
                if ((0, fs_1.existsSync)(envPath)) {
                    const content = (0, fs_1.readFileSync)(envPath, 'utf-8');
                    // Load Groq API Key
                    const groqMatch = content.match(/GROQ_API_KEY=([^\r\n]+)/);
                    if (groqMatch && groqMatch[1] && !groqMatch[1].includes('your_') && !this.groqApiKey) {
                        this.groqApiKey = groqMatch[1].trim();
                        console.log(`🔑 [NEURAL] Groq API key loaded from ${envPath}`);
                    }
                    // Load DeepSeek API Key
                    const deepseekMatch = content.match(/DEEPSEEK_API_KEY=([^\r\n]+)/);
                    if (deepseekMatch && deepseekMatch[1] && !deepseekMatch[1].includes('your_') && !this.deepseekApiKey) {
                        this.deepseekApiKey = deepseekMatch[1].trim();
                        console.log(`🔑 [NEURAL] DeepSeek API key loaded from ${envPath}`);
                    }
                }
            }
            catch (e) {
                // Continue to next path
            }
        }
        // Try environment variables
        if (!this.groqApiKey && process.env.GROQ_API_KEY) {
            this.groqApiKey = process.env.GROQ_API_KEY;
            console.log('🔑 [NEURAL] Groq API key loaded from environment');
        }
        if (!this.deepseekApiKey && process.env.DEEPSEEK_API_KEY) {
            this.deepseekApiKey = process.env.DEEPSEEK_API_KEY;
            console.log('🔑 [NEURAL] DeepSeek API key loaded from environment');
        }
    }
    static getInstance() {
        if (!NeuralInference.instance) {
            NeuralInference.instance = new NeuralInference();
        }
        return NeuralInference.instance;
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // MAIN INFERENCE METHOD - TRIPLE HYBRID: Groq → DeepSeek → Ollama
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Perform triple-hybrid inference:
     * 1. Try Groq first (500+ tok/sec, ULTRA-FAST)
     * 2. Fallback to DeepSeek V3 (128k context)
     * 3. Final fallback to RTX 4050 + Ollama
     */
    async infer(prompt, context, options) {
        const startTime = Date.now();
        this.emit('inference:start', { prompt: prompt.substring(0, 100) });
        // Check cache first
        const cacheKey = this.createCacheKey(prompt, context);
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            console.log('💾 [NEURAL] Cache hit! Instant response.');
            this.emit('inference:complete', { ...cached, fromCache: true });
            return cached.response;
        }
        // Enrich prompt with context
        const enrichedPrompt = this.enrichPrompt(prompt, context);
        // ─────────────────────────────────────────────────────────────────────────
        // TRY 1: Groq (ULTRA-FAST - 500+ tok/sec)
        // ─────────────────────────────────────────────────────────────────────────
        if (this.groqApiKey) {
            try {
                console.log('⚡ [NEURAL] Routing to Groq Llama 3.3 70B (500+ tok/sec)...');
                const response = await fetch(this.groqEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.groqApiKey}`,
                    },
                    body: JSON.stringify({
                        model: this.groqModel,
                        messages: [
                            { role: 'system', content: MISTER_MIND_SYSTEM_PROMPT },
                            { role: 'user', content: enrichedPrompt }
                        ],
                        temperature: options?.temperature ?? 0.1,
                        max_tokens: options?.maxTokens ?? 4096,
                    }),
                });
                if (response.ok) {
                    const data = await response.json();
                    const processingTimeMs = Date.now() - startTime;
                    this.groqCalls++;
                    this.totalInferences++;
                    const result = {
                        response: data.choices[0].message.content,
                        model: 'Groq-Llama-3.3-70B',
                        processingTimeMs,
                        tokensUsed: data.usage?.total_tokens || 0,
                        fromCache: false,
                    };
                    this.cache.set(cacheKey, result);
                    console.log(`⚡ [NEURAL] Groq response in ${processingTimeMs}ms (${Math.round(result.tokensUsed / (processingTimeMs / 1000))} tok/sec)`);
                    console.log(`📊 [STATS] Groq: ${this.groqCalls} | DeepSeek: ${this.deepseekCalls} | Local: ${this.localCalls}`);
                    this.emit('inference:complete', result);
                    return data.choices[0].message.content;
                }
                else {
                    console.warn(`⚠️ [NEURAL] Groq returned ${response.status}, falling back to DeepSeek...`);
                }
            }
            catch (error) {
                console.warn('⚠️ [NEURAL] Groq failed:', error);
            }
        }
        // ─────────────────────────────────────────────────────────────────────────
        // TRY 2: DeepSeek V3 (PRIMARY FALLBACK - 128k context)
        // ─────────────────────────────────────────────────────────────────────────
        if (this.deepseekApiKey) {
            try {
                console.log('☁️ [NEURAL] Routing to DeepSeek V3 (128k context)...');
                const response = await fetch(this.deepseekEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.deepseekApiKey}`,
                    },
                    body: JSON.stringify({
                        model: this.deepseekModel,
                        messages: [
                            { role: 'system', content: MISTER_MIND_SYSTEM_PROMPT },
                            { role: 'user', content: enrichedPrompt }
                        ],
                        temperature: options?.temperature ?? 0.1,
                        max_tokens: options?.maxTokens ?? 4096,
                    }),
                });
                if (response.ok) {
                    const data = await response.json();
                    const processingTimeMs = Date.now() - startTime;
                    this.deepseekCalls++;
                    this.totalInferences++;
                    const result = {
                        response: data.choices[0].message.content,
                        model: 'DeepSeek-V3',
                        processingTimeMs,
                        tokensUsed: data.usage?.total_tokens || 0,
                        fromCache: false,
                    };
                    this.cache.set(cacheKey, result);
                    console.log(`✅ [NEURAL] DeepSeek response in ${processingTimeMs}ms`);
                    console.log(`📊 [STATS] Groq: ${this.groqCalls} | DeepSeek: ${this.deepseekCalls} | Local: ${this.localCalls}`);
                    this.emit('inference:complete', result);
                    return data.choices[0].message.content;
                }
                else {
                    console.warn(`⚠️ [NEURAL] DeepSeek returned ${response.status}, falling back to local...`);
                }
            }
            catch (error) {
                console.warn('⚠️ [NEURAL] DeepSeek failed:', error);
            }
        }
        // ─────────────────────────────────────────────────────────────────────────
        // TRY 3: Ollama + RTX 4050 (LOCAL FALLBACK)
        // ─────────────────────────────────────────────────────────────────────────
        console.log(`🎮 [NEURAL] Falling back to ${this.gpuAccelerator} + Ollama...`);
        try {
            const response = await fetch(this.localEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: options?.model || this.defaultLocalModel,
                    prompt: enrichedPrompt,
                    stream: false,
                    options: {
                        temperature: options?.temperature ?? 0.1,
                        num_gpu: options?.numGpu ?? 1,
                        num_predict: options?.maxTokens ?? 2048,
                    },
                }),
            });
            if (!response.ok) {
                throw new Error(`Ollama returned ${response.status}`);
            }
            const data = await response.json();
            const processingTimeMs = Date.now() - startTime;
            this.localCalls++;
            this.totalInferences++;
            this.totalSavings += 0.01;
            const result = {
                response: data.response,
                model: this.defaultLocalModel,
                processingTimeMs,
                tokensUsed: data.eval_count || 0,
                fromCache: false,
            };
            this.cache.set(cacheKey, result);
            console.log(`✅ [NEURAL] Local inference in ${processingTimeMs}ms`);
            console.log(`💰 [SAVINGS] $${this.totalSavings.toFixed(2)} saved (${this.localCalls} local inferences)`);
            this.emit('inference:complete', result);
            return data.response;
        }
        catch (error) {
            console.error('⚠️ [NEURAL] Local inference failed:', error);
            this.emit('inference:error', { error, prompt: prompt.substring(0, 100) });
            // Return null to trigger BrainRouter fallback
            return null;
        }
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // SPECIALIZED INFERENCE METHODS
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Generate code fix for an error
     */
    async fixCode(errorLog, fileContent, context) {
        const prompt = `
ERROR: ${errorLog}

FILE_CONTENT:
\`\`\`typescript
${fileContent}
\`\`\`

${context ? `ADDITIONAL_CONTEXT: ${context}` : ''}

TASK: Provide ONLY the corrected code. No explanations. Output must be valid TypeScript.
    `;
        return this.infer(prompt, { priority: 'URGENT', type: 'code-fix' });
    }
    /**
     * Generate security analysis
     */
    async analyzeVulnerability(code, threatVector) {
        const prompt = `
SECURITY ANALYSIS REQUEST

CODE:
\`\`\`typescript
${code}
\`\`\`

THREAT VECTOR: ${threatVector}

TASK: Analyze the code for this specific threat vector. Provide:
1. Vulnerability assessment (LOW/MEDIUM/HIGH/CRITICAL)
2. Specific vulnerable lines
3. Recommended fix
4. Future-proofing suggestions

Format: Structured JSON response.
    `;
        return this.infer(prompt, { type: 'security-analysis' });
    }
    /**
     * Generate proposal for a lead
     */
    async generateProposal(leadData) {
        const prompt = `
SALES PROPOSAL GENERATION

TARGET COMPANY: ${leadData.company}
DETECTED ISSUES: ${JSON.stringify(leadData.issues)}
PRIORITY: ${leadData.priority}

TASK: Generate a professional technical audit proposal that:
1. Identifies their specific pain points
2. Proposes QAntum Ghost Protocol as the solution
3. Includes quantified benefits
4. Has a clear call-to-action
5. Pricing: Based on complexity

Format: Markdown document suitable for PDF export.
    `;
        return this.infer(prompt, { type: 'proposal-generation' });
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // MODEL AGNOSTICISM - DYNAMIC MODEL DISCOVERY (v34.0)
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Benchmark all available models and auto-switch to the best performer
     * This ensures longevity - when Llama 3 is outdated in 2028,
     * the system will automatically adopt the new leader.
     */
    async benchmarkModels() {
        console.log('🏎️ [NEURAL] Starting model benchmark...');
        const testPrompt = `
Write a TypeScript function that:
1. Takes an array of numbers
2. Returns the median value
3. Handles edge cases (empty array, single element)
4. Has proper types

Respond ONLY with the code, no explanations.
    `.trim();
        const models = [
            { name: 'Groq-Llama-3.3-70B', endpoint: 'groq', priority: 1 },
            { name: 'DeepSeek-V3', endpoint: 'deepseek', priority: 2 },
            { name: 'Ollama-Local', endpoint: 'ollama', priority: 3 },
        ];
        const results = [];
        for (const model of models) {
            try {
                const startTime = Date.now();
                let response = null;
                // Temporarily force specific model
                const originalGroq = this.groqApiKey;
                const originalDeepseek = this.deepseekApiKey;
                if (model.endpoint === 'groq') {
                    this.deepseekApiKey = null;
                }
                else if (model.endpoint === 'deepseek') {
                    this.groqApiKey = null;
                }
                else {
                    this.groqApiKey = null;
                    this.deepseekApiKey = null;
                }
                response = await this.infer(testPrompt, { type: 'benchmark' });
                // Restore
                this.groqApiKey = originalGroq;
                this.deepseekApiKey = originalDeepseek;
                const latencyMs = Date.now() - startTime;
                // Score the response (simple heuristics)
                const qualityScore = this.scoreCodeQuality(response || '');
                results.push({
                    model: model.name,
                    latencyMs,
                    qualityScore,
                    tokensPerSecond: response ? (response.length / 4) / (latencyMs / 1000) : 0,
                    available: true,
                    error: null,
                });
                console.log(`  ✅ ${model.name}: ${latencyMs}ms, quality: ${qualityScore}/100`);
            }
            catch (error) {
                results.push({
                    model: model.name,
                    latencyMs: 0,
                    qualityScore: 0,
                    tokensPerSecond: 0,
                    available: false,
                    error: error.message,
                });
                console.log(`  ❌ ${model.name}: unavailable`);
            }
        }
        // Calculate winner
        const availableModels = results.filter(r => r.available);
        const winner = availableModels.sort((a, b) => {
            // Score = quality * 0.6 + speed * 0.4
            const scoreA = (a.qualityScore * 0.6) + (Math.min(a.tokensPerSecond, 500) / 500 * 100 * 0.4);
            const scoreB = (b.qualityScore * 0.6) + (Math.min(b.tokensPerSecond, 500) / 500 * 100 * 0.4);
            return scoreB - scoreA;
        })[0];
        const benchmarkResult = {
            timestamp: new Date(),
            results,
            winner: winner?.model || 'none',
            recommendation: winner
                ? `Use ${winner.model} (quality: ${winner.qualityScore}, speed: ${winner.tokensPerSecond.toFixed(0)} tok/s)`
                : 'No models available. Check API keys.',
        };
        console.log(`
╔═══════════════════════════════════════════════════════════════════════════════╗
║                    🏆 MODEL BENCHMARK COMPLETE                                ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║  Winner: ${winner?.model.padEnd(62) || 'N/A'.padEnd(62)}║
║  Quality Score: ${(winner?.qualityScore.toString() || 'N/A').padEnd(55)}║
║  Speed: ${((winner?.tokensPerSecond.toFixed(0) || '0') + ' tok/s').padEnd(63)}║
╚═══════════════════════════════════════════════════════════════════════════════╝
    `);
        this.emit('benchmark:complete', benchmarkResult);
        return benchmarkResult;
    }
    /**
     * Score code quality (simple heuristics)
     */
    scoreCodeQuality(code) {
        let score = 50; // Base score
        // Check for TypeScript types
        if (code.includes(': number') || code.includes(': string'))
            score += 15;
        if (code.includes('function') || code.includes('=>'))
            score += 10;
        if (code.includes('if') || code.includes('return'))
            score += 10;
        // Check for edge case handling
        if (code.includes('length === 0') || code.includes('.length'))
            score += 10;
        if (code.includes('throw') || code.includes('Error'))
            score += 5;
        // Penalty for explanations when only code requested
        if (code.includes('Here') || code.includes('explanation'))
            score -= 10;
        return Math.min(100, Math.max(0, score));
    }
    /**
     * Discover new models available on the market
     * Scans OpenRouter, Hugging Face, and local Ollama
     */
    async discoverNewModels() {
        console.log('🔍 [NEURAL] Discovering new models...');
        const discovered = [];
        // Check Ollama local models
        try {
            const response = await fetch('http://localhost:11434/api/tags');
            if (response.ok) {
                const data = await response.json();
                for (const model of data.models || []) {
                    discovered.push({
                        name: model.name,
                        source: 'ollama-local',
                        size: model.size,
                        capabilities: ['text-generation'],
                        cost: 0,
                    });
                }
            }
        }
        catch {
            // Ollama not running
        }
        console.log(`🔍 [NEURAL] Discovered ${discovered.length} models`);
        return discovered;
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // HELPER METHODS
    // ═══════════════════════════════════════════════════════════════════════════
    enrichPrompt(prompt, context) {
        // NO DUPLICATE SYSTEM PROMPTS - The Iron Grip handles everything
        if (!context)
            return prompt;
        // Inject context data without overriding personality
        const contextString = Object.entries(context)
            .map(([key, val]) => `[${key.toUpperCase()}]: ${typeof val === 'object' ? JSON.stringify(val) : val}`)
            .join('\n');
        return `${contextString}\n\n${prompt}`;
    }
    createCacheKey(prompt, context) {
        const combined = prompt + JSON.stringify(context || {});
        let hash = 0;
        for (let i = 0; i < combined.length; i++) {
            const char = combined.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return `neural_${hash}`;
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // STATUS METHODS
    // ═══════════════════════════════════════════════════════════════════════════
    getTotalInferences() {
        return this.totalInferences;
    }
    getTotalSavings() {
        return this.totalSavings;
    }
    getCacheSize() {
        return this.cache.size;
    }
    clearCache() {
        this.cache.clear();
        console.log('🗑️ [NEURAL] Cache cleared');
    }
    async healthCheck() {
        try {
            const response = await fetch('http://localhost:11434/api/tags');
            return response.ok;
        }
        catch {
            return false;
        }
    }
}
exports.NeuralInference = NeuralInference;
// ═══════════════════════════════════════════════════════════════════════════════
// SINGLETON EXPORT
// ═══════════════════════════════════════════════════════════════════════════════
exports.neuralEngine = NeuralInference.getInstance();
exports.default = NeuralInference;
