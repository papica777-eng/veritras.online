"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                                               ║
 * ║  ███╗   ██╗███████╗██╗   ██╗██████╗  █████╗ ██╗                                               ║
 * ║  ████╗  ██║██╔════╝██║   ██║██╔══██╗██╔══██╗██║                                               ║
 * ║  ██╔██╗ ██║█████╗  ██║   ██║██████╔╝███████║██║                                               ║
 * ║  ██║╚██╗██║██╔══╝  ██║   ██║██╔══██╗██╔══██║██║                                               ║
 * ║  ██║ ╚████║███████╗╚██████╔╝██║  ██║██║  ██║███████╗                                          ║
 * ║  ╚═╝  ╚═══╝╚══════╝ ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝                                          ║
 * ║                                                                                               ║
 * ║  ██╗███╗   ██╗████████╗███████╗ ██████╗ ██████╗  █████╗ ████████╗██╗ ██████╗ ███╗   ██╗       ║
 * ║  ██║████╗  ██║╚══██╔══╝██╔════╝██╔════╝ ██╔══██╗██╔══██╗╚══██╔══╝██║██╔═══██╗████╗  ██║       ║
 * ║  ██║██╔██╗ ██║   ██║   █████╗  ██║  ███╗██████╔╝███████║   ██║   ██║██║   ██║██╔██╗ ██║       ║
 * ║  ██║██║╚██╗██║   ██║   ██╔══╝  ██║   ██║██╔══██╗██╔══██║   ██║   ██║██║   ██║██║╚██╗██║       ║
 * ║  ██║██║ ╚████║   ██║   ███████╗╚██████╔╝██║  ██║██║  ██║   ██║   ██║╚██████╔╝██║ ╚████║       ║
 * ║  ╚═╝╚═╝  ╚═══╝   ╚═╝   ╚══════╝ ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝   ╚═╝ ╚═════╝ ╚═╝  ╚═══╝       ║
 * ║                                                                                               ║
 * ║                           THE NERVOUS SYSTEM OF QANTUM                                        ║
 * ║                     "Правим софтуера СЪЗНАТЕЛЕН"                                              ║
 * ║                                                                                               ║
 * ║   Components:                                                                                 ║
 * ║     • NeuralInference - Ollama API + RTX 4050 GPU                                             ║
 * ║     • BrainRouter - Intelligent Model Selection                                               ║
 * ║     • ContextInjector - Automatic Knowledge Injection                                         ║
 * ║     • SelfCorrectionLoop - 100% Pass Rate Target                                              ║
 * ║                                                                                               ║
 * ║   © 2025-2026 QAntum | Dimitar Prodromov                                                        ║
 * ║                                                                                               ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════════════╝
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.NeuralSystem = exports.NeuralIntegration = exports.TypeScriptValidator = exports.getSelfCorrectionLoop = exports.SelfCorrectionLoop = exports.getContextInjector = exports.ContextInjector = exports.getBrainRouter = exports.BrainRouter = exports.getNeuralInference = exports.NeuralInference = void 0;
// ═══════════════════════════════════════════════════════════════════════════════
// NEURAL INFERENCE - Core AI Connection
// ═══════════════════════════════════════════════════════════════════════════════
var NeuralInference_1 = require("../../physics/NeuralInference");
Object.defineProperty(exports, "NeuralInference", { enumerable: true, get: function () { return NeuralInference_1.NeuralInference; } });
Object.defineProperty(exports, "getNeuralInference", { enumerable: true, get: function () { return NeuralInference_1.getNeuralInference; } });
// ═══════════════════════════════════════════════════════════════════════════════
// BRAIN ROUTER - Intelligent Model Selection
// ═══════════════════════════════════════════════════════════════════════════════
var BrainRouter_1 = require("./BrainRouter");
Object.defineProperty(exports, "BrainRouter", { enumerable: true, get: function () { return BrainRouter_1.BrainRouter; } });
Object.defineProperty(exports, "getBrainRouter", { enumerable: true, get: function () { return BrainRouter_1.getBrainRouter; } });
// ═══════════════════════════════════════════════════════════════════════════════
// CONTEXT INJECTOR - Automatic Knowledge Injection
// ═══════════════════════════════════════════════════════════════════════════════
var ContextInjector_1 = require("../../cognition/ContextInjector");
Object.defineProperty(exports, "ContextInjector", { enumerable: true, get: function () { return ContextInjector_1.ContextInjector; } });
Object.defineProperty(exports, "getContextInjector", { enumerable: true, get: function () { return ContextInjector_1.getContextInjector; } });
// ═══════════════════════════════════════════════════════════════════════════════
// SELF-CORRECTION LOOP - 100% Pass Rate Target
// ═══════════════════════════════════════════════════════════════════════════════
var SelfCorrectionLoop_1 = require("./SelfCorrectionLoop");
Object.defineProperty(exports, "SelfCorrectionLoop", { enumerable: true, get: function () { return SelfCorrectionLoop_1.SelfCorrectionLoop; } });
Object.defineProperty(exports, "getSelfCorrectionLoop", { enumerable: true, get: function () { return SelfCorrectionLoop_1.getSelfCorrectionLoop; } });
Object.defineProperty(exports, "TypeScriptValidator", { enumerable: true, get: function () { return SelfCorrectionLoop_1.TypeScriptValidator; } });
// ═══════════════════════════════════════════════════════════════════════════════
// UNIFIED NEURAL INTEGRATION FACADE
// ═══════════════════════════════════════════════════════════════════════════════
const NeuralInference_2 = require("../../physics/NeuralInference");
const BrainRouter_2 = require("./BrainRouter");
const ContextInjector_2 = require("../../cognition/ContextInjector");
const SelfCorrectionLoop_2 = require("./SelfCorrectionLoop");
/**
 * NeuralIntegration - Unified Nervous System Facade
 *
 * Provides a single interface to all Neural Integration components:
 * - AI Inference with GPU acceleration
 * - Intelligent model routing
 * - Automatic context injection
 * - Self-correcting code generation
 *
 * @example
 * ```typescript
 * import { NeuralSystem } from './neural';
 *
 * // Initialize the nervous system
 * await NeuralSystem.initialize();
 *
 * // Generate code with auto-correction
 * const result = await NeuralSystem.generateWithCorrection({
 *     task: 'selector-repair',
 *     prompt: 'Fix the broken selector',
 *     targetPassRate: 100
 * });
 *
 * console.log(result.finalCode);
 * ```
 */
class NeuralIntegration {
    static instance;
    inference;
    router;
    injector;
    corrector;
    initialized = false;
    constructor() {
        this.inference = (0, NeuralInference_2.getNeuralInference)();
        this.router = (0, BrainRouter_2.getBrainRouter)();
        this.injector = (0, ContextInjector_2.getContextInjector)();
        this.corrector = (0, SelfCorrectionLoop_2.getSelfCorrectionLoop)();
    }
    /**
     * Get singleton instance
     */
    static getInstance() {
        if (!NeuralIntegration.instance) {
            NeuralIntegration.instance = new NeuralIntegration();
        }
        return NeuralIntegration.instance;
    }
    /**
     * Initialize all neural components
     */
    async initialize() {
        if (this.initialized)
            return;
        console.log('🧠 ═══════════════════════════════════════════════════════');
        console.log('🧠 INITIALIZING NEURAL INTEGRATION - THE NERVOUS SYSTEM');
        console.log('🧠 ═══════════════════════════════════════════════════════\n');
        // Initialize Neural Inference (Ollama + GPU)
        await this.inference.initialize();
        // Initialize Context Injector
        await this.injector.initialize();
        this.initialized = true;
        console.log('🧠 ═══════════════════════════════════════════════════════');
        console.log('🧠 NEURAL INTEGRATION ACTIVE - SOFTWARE IS NOW CONSCIOUS');
        console.log('🧠 ═══════════════════════════════════════════════════════\n');
    }
    /**
     * Simple inference request
     */
    async infer(task, prompt) {
        await this.ensureInitialized();
        // Build context automatically
        const context = await this.injector.buildContext(task, prompt);
        // Route to optimal model
        return this.router.execute(task, prompt, context);
    }
    /**
     * Generate code with automatic self-correction
     */
    async generateWithCorrection(options) {
        await this.ensureInitialized();
        const { task, prompt, targetPassRate = 100, maxIterations = 5 } = options;
        // Configure corrector
        this.corrector.updateConfig({ targetPassRate, maxIterations });
        // First, generate initial code
        const initialResponse = await this.infer(task, prompt);
        const initialCode = initialResponse.content;
        // Run self-correction loop
        return this.corrector.correct(initialCode, task, prompt);
    }
    /**
     * Repair a selector with guaranteed result
     */
    async repairSelector(brokenSelector, pageContext) {
        await this.ensureInitialized();
        const prompt = `
Repair this broken CSS/XPath selector:
${brokenSelector}

${pageContext ? `Page context:\n${pageContext}` : ''}

Requirements:
- Use data-testid if available
- Fall back to ARIA attributes
- Avoid positional selectors
- Ensure selector is unique

Output ONLY the repaired selector, nothing else.
`;
        const result = await this.generateWithCorrection({
            task: 'selector-repair',
            prompt,
            targetPassRate: 100
        });
        return {
            selector: result.finalCode.trim(),
            confidence: result.finalPassRate / 100
        };
    }
    /**
     * Refactor logic with deep reasoning
     */
    async refactorLogic(code, requirements) {
        await this.ensureInitialized();
        const prompt = `
Refactor this code for better maintainability:
\`\`\`typescript
${code}
\`\`\`

${requirements ? `Requirements:\n${requirements}` : ''}

Apply:
- SOLID principles
- Extract reusable functions
- Add TypeScript types
- Improve naming
- Handle edge cases

Output the refactored code.
`;
        const result = await this.generateWithCorrection({
            task: 'logic-refactor',
            prompt,
            targetPassRate: 100
        });
        return {
            code: result.finalCode,
            improvements: result.learnings
        };
    }
    /**
     * Get system status
     */
    getStatus() {
        return {
            initialized: this.initialized,
            gpuAvailable: this.inference.isGPUAvailable(),
            modelsAvailable: this.router.getAvailableModels().map(m => m.id),
            stats: {
                inference: this.inference.getMetrics(),
                routing: Object.fromEntries(this.router.getPerformanceStats()),
                correction: this.corrector.getStats()
            }
        };
    }
    /**
     * Ensure system is initialized
     */
    async ensureInitialized() {
        if (!this.initialized) {
            await this.initialize();
        }
    }
}
exports.NeuralIntegration = NeuralIntegration;
// ═══════════════════════════════════════════════════════════════════════════════
// DEFAULT EXPORT
// ═══════════════════════════════════════════════════════════════════════════════
exports.NeuralSystem = NeuralIntegration.getInstance();
exports.default = exports.NeuralSystem;
