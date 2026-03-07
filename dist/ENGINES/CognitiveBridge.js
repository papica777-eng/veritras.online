"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                               ║
 * ║   🛰️ COGNITIVE BRIDGE v3.0 - PRODUCTION GRADE                                 ║
 * ║   Registry-Based, Event-Driven, Type-Safe Cognitive Architecture             ║
 * ║                                                                               ║
 * ║   Architecture:                                                               ║
 * ║   • Registry Pattern for Module Dispatch                                     ║
 * ║   • AbortController for Lifecycle Management                                 ║
 * ║   • Strictly Typed Action/Observation Pipeline                               ║
 * ║   • Event-Driven State Broadcasting                                          ║
 * ║                                                                               ║
 * ║   © 2025-2026 QAntum | Dimitar Prodromov                                     ║
 * ║                                                                               ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCognitiveBridge = exports.CognitiveBridge = void 0;
const NeuralInference_1 = require("../physics/NeuralInference");
const SwarmAgents_1 = require("../swarm/SwarmAgents");
const SovereignSoul_1 = require("./SovereignSoul");
const event_bus_1 = require("../core/event-bus");
const types_ts_1 = require("./types.ts");
const neural_mesh_ts_1 = require("./neural-mesh.ts");
// Cognitive module adapters
const AutonomousThoughtModule_ts_1 = require("./modules/AutonomousThoughtModule.ts");
const SelfAuditModule_ts_1 = require("./modules/SelfAuditModule.ts");
const SymbolVerifierModule_ts_1 = require("./modules/SymbolVerifierModule.ts");
const MapLookupModule_ts_1 = require("./modules/MapLookupModule.ts");
const SelfHealModule_ts_1 = require("./modules/SelfHealModule.ts");
const PatternAnalysisModule_ts_1 = require("./modules/PatternAnalysisModule.ts");
const GhostReconModule_ts_1 = require("./modules/GhostReconModule.ts");
const SingularityModule_ts_1 = require("./modules/SingularityModule.ts");
const PrecogModule_ts_1 = require("./modules/PrecogModule.ts");
const FortressModule_ts_1 = require("./modules/FortressModule.ts");
const decryption_engine_ts_1 = require("./decryption-engine.ts");
const EcosystemRegistry_ts_1 = require("./EcosystemRegistry.ts");
// ═══════════════════════════════════════════════════════════════════════════════
// COGNITIVE BRIDGE
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * @class CognitiveBridge
 * @description Production-grade cognitive orchestrator with registry-based dispatch
 */
class CognitiveBridge {
    static instance;
    // Core systems
    brain;
    soul;
    bus;
    swarm;
    mesh;
    // Module registry
    registry;
    // State management
    stateHistory = [];
    isProcessing = false;
    abortController;
    config;
    constructor(config = {}) {
        this.config = { ...types_ts_1.DEFAULT_COGNITIVE_CONFIG, ...config };
        // Initialize core systems
        this.brain = NeuralInference_1.NeuralInference.getInstance();
        this.soul = SovereignSoul_1.SovereignSoul.getInstance();
        this.bus = event_bus_1.EventBus.getInstance();
        this.swarm = new SwarmAgents_1.SwarmQueen();
        this.mesh = neural_mesh_ts_1.NeuralMesh.getInstance();
        this.abortController = new AbortController();
        // Initialize module registry
        this.registry = new Map([
            [types_ts_1.CognitiveActionType.AUTONOMOUS_THINK, new AutonomousThoughtModule_ts_1.AutonomousThoughtModule()],
            [types_ts_1.CognitiveActionType.SELF_AUDIT, new SelfAuditModule_ts_1.SelfAuditModule()],
            [types_ts_1.CognitiveActionType.VERIFY_SYMBOL, new SymbolVerifierModule_ts_1.SymbolVerifierModule()],
            [types_ts_1.CognitiveActionType.LOOKUP_MAP, new MapLookupModule_ts_1.MapLookupModule()],
            [types_ts_1.CognitiveActionType.SELF_HEAL, new SelfHealModule_ts_1.SelfHealModule()],
            [types_ts_1.CognitiveActionType.PATTERN_ANALYSIS, new PatternAnalysisModule_ts_1.PatternAnalysisModule()],
            [types_ts_1.CognitiveActionType.DECRYPT_VAULT, new decryption_engine_ts_1.DecryptionEngine()],
            [types_ts_1.CognitiveActionType.NETWORK_RECON, new GhostReconModule_ts_1.GhostReconModule()],
            [types_ts_1.CognitiveActionType.SELF_OPTIMIZE, new SingularityModule_ts_1.SingularityModule()],
            [types_ts_1.CognitiveActionType.PREDICT_RISK, new PrecogModule_ts_1.PrecogModule()],
            [types_ts_1.CognitiveActionType.ENGAGE_DEFENSE, new FortressModule_ts_1.FortressModule()]
        ]);
        this.initializeSubscriptions();
        // NEURAL BINDING: Connect to the full Empire
        const registry = EcosystemRegistry_ts_1.EcosystemRegistry.getInstance();
        this.log(registry.getStatusReport());
        this.log('🛰️ CognitiveBridge v3.0 initialized with registry pattern');
    }
    // ─────────────────────────────────────────────────────────────────────────
    // SINGLETON
    // ─────────────────────────────────────────────────────────────────────────
    static getInstance(config) {
        if (!CognitiveBridge.instance) {
            CognitiveBridge.instance = new CognitiveBridge(config);
        }
        return CognitiveBridge.instance;
    }
    // ─────────────────────────────────────────────────────────────────────────
    // INITIALIZATION
    // ─────────────────────────────────────────────────────────────────────────
    initializeSubscriptions() {
        if (!this.config.enableEventBus)
            return;
        this.bus.on('SYSTEM_HALT', () => this.abort());
        this.bus.on('SYSTEM_INTERRUPT', (reason) => {
            this.log(`⚠️ System interrupt: ${reason}`);
            this.abort();
        });
    }
    // ─────────────────────────────────────────────────────────────────────────
    // MAIN COGNITIVE LOOP
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Primary ReAct execution loop
     * @param objective The task to accomplish
     * @returns Final answer or solution
     */
    async think(objective) {
        if (this.isProcessing) {
            throw new Error('Cognitive Overload: Process already in flight');
        }
        this.isProcessing = true;
        this.stateHistory = [];
        this.abortController = new AbortController();
        // 🧠 NEURAL MESH CHECK-IN
        const previousContext = this.mesh.synchronize();
        this.log(`\n🚀 [COGNITIVE BRIDGE] Objective: ${objective}`);
        this.log(`🌐 [NEURAL MESH] Context Loaded: ${Object.keys(previousContext).length} items`);
        await this.emitEvent('start', { objective, context: previousContext });
        try {
            await this.swarm.initialize();
            let context = objective;
            // Inject Mesh Context into initial context string
            if (Object.keys(previousContext).length > 0) {
                context += `\n[Neural Mesh Context]: ${JSON.stringify(previousContext)}`;
            }
            let iterations = 0;
            let finalAnswer = null;
            while (iterations < this.config.maxIterations) {
                if (this.abortController.signal.aborted) {
                    this.log('⚠️ Cognitive cycle aborted');
                    break;
                }
                const step = iterations + 1;
                this.log(`\n🧠 STEP ${step}: Thinking...`);
                // 1. GENERATE THOUGHT & ACTION
                const state = await this.generateThought(context, step);
                this.stateHistory.push(state);
                this.log(`💭 THOUGHT: ${state.thought}`);
                // Check if we have a final answer (no action)
                if (!state.action) {
                    finalAnswer = state.thought;
                    break;
                }
                // 2. EXECUTE ACTION & OBSERVE
                this.log(`🎬 ACTION: ${state.action.type}`);
                const observation = await this.dispatch(state.action);
                state.observation = observation;
                this.log(`👁️ OBSERVATION: ${observation.success ? '✓' : '✗'} ${JSON.stringify(observation.result).substring(0, 150)}`);
                await this.emitEvent('observation', observation);
                // 3. REFLECT
                const reflection = await this.reflect(objective, state);
                state.reflection = reflection;
                this.log(`🤔 REFLECTION: ${reflection}`);
                // Update context for next iteration
                context += `\nAction: ${state.action.type}\nObservation: ${JSON.stringify(observation.result).substring(0, 200)}\nReflection: ${reflection}`;
                // Check if objective is complete
                if (this.isObjectiveComplete(reflection)) {
                    finalAnswer = state.thought;
                    break;
                }
                iterations++;
            }
            await this.swarm.shutdown();
            const result = finalAnswer || `Maximum iterations (${this.config.maxIterations}) reached. Last thought: ${this.stateHistory[this.stateHistory.length - 1]?.thought || 'No conclusion'}`;
            // 🧠 NEURAL MESH SYNC-OUT
            this.mesh.share(`thought_${Date.now()}`, {
                objective,
                resolution: result,
                iterations
            });
            await this.emitEvent('end', { result, iterations });
            this.log(`\n✅ Cognitive cycle complete: ${iterations} steps`);
            return result;
        }
        catch (error) {
            this.log(`❌ Cognitive error: ${error}`);
            await this.emitEvent('error', { error: String(error) });
            if (this.config.abortOnError) {
                throw error;
            }
            return `Error: ${error instanceof Error ? error.message : String(error)}`;
        }
        finally {
            this.isProcessing = false;
        }
    }
    // ─────────────────────────────────────────────────────────────────────────
    // COGNITIVE PHASES
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Generate thought and determine next action
     * 🧠 ALWAYS loads QAntum memory before thinking
     */
    async generateThought(context, step) {
        // 🧠 LOAD MEMORY - Remember who I am before every thought
        // UPGRADE: Use Sovereign Soul for higher consciousness
        const soul = SovereignSoul_1.SovereignSoul.getInstance();
        const consciousness = soul.getHumanSystemPrompt();
        const history = this.stateHistory
            .map(s => `Step ${s.step}: ${s.thought.substring(0, 100)}`)
            .join('\n');
        const prompt = this.buildReActPrompt(context, step, history) + '\n\n' + consciousness;
        const inferenceResponse = await this.brain.infer({
            prompt,
            temperature: this.config.temperature,
            maxTokens: 2000
        });
        const response = inferenceResponse.content;
        if (!response) {
            return { step, thought: 'No response from neural inference' };
        }
        // Parse action from response
        const action = this.parseAction(response);
        return {
            step,
            thought: response,
            action: action || undefined
        };
    }
    /**
     * Dispatch action to appropriate module via registry
     */
    async dispatch(action) {
        const startTime = Date.now();
        // Check if it's a swarm task
        if (action.type === types_ts_1.CognitiveActionType.SWARM_TASK && action.department) {
            try {
                const task = await this.swarm.submitTask(action.payload.taskType || 'generic', action.payload, { department: action.department });
                return {
                    action: action.type,
                    result: task.result || task.error,
                    timestamp: Date.now(),
                    success: !!task.result
                };
            }
            catch (error) {
                return {
                    action: action.type,
                    result: null,
                    timestamp: Date.now(),
                    success: false,
                    error: String(error)
                };
            }
        }
        // Dispatch to registered module
        const module = this.registry.get(action.type);
        if (!module) {
            return {
                action: action.type,
                result: null,
                timestamp: Date.now(),
                success: false,
                error: `Module ${action.type} not registered`
            };
        }
        try {
            this.log(`   → Executing ${module.getName()}...`);
            const result = await module.execute(action.payload);
            return {
                action: action.type,
                result,
                timestamp: Date.now(),
                success: true
            };
        }
        catch (error) {
            return {
                action: action.type,
                result: null,
                timestamp: Date.now(),
                success: false,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }
    /**
     * Reflect on current state
     */
    async reflect(objective, state) {
        const prompt = `
[САМОРЕФЛЕКСИЯ]
ЦЕЛ: ${objective}
ПОСЛЕДНА СТЪПКА: ${state.step}
Мисъл: ${state.thought.substring(0, 200)}
Действие: ${state.action?.type || 'none'}
Резултат: ${state.observation?.success ? 'успех' : 'грешка'}

Постигната ли е целта? Отговори кратко на български.
Започни с "ЦЕЛТА Е ПОСТИГНАТА" ако е готово.
`;
        const response = await this.brain.infer(prompt, {
            phase: 'reflection',
            persona: 'Sovereign Critic'
        }, { temperature: 0.2 });
        return response || 'Reflection unavailable';
    }
    // ─────────────────────────────────────────────────────────────────────────
    // PARSING & UTILITIES
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Parse action from LLM response
     */
    parseAction(response) {
        // Try JSON format first
        try {
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const data = JSON.parse(jsonMatch[0]);
                if (data.action && data.action.type) {
                    return {
                        type: data.action.type,
                        payload: data.action.payload || {},
                        department: data.action.department
                    };
                }
            }
        }
        catch (e) {
            // Continue to regex parsing
        }
        // Try regex format: Action: action-type[payload]
        const match = response.match(/Action:\s*([\w-]+)\[(.*?)\]/);
        if (match) {
            const type = match[1];
            if (Object.values(types_ts_1.CognitiveActionType).includes(type)) {
                return {
                    type,
                    payload: { value: match[2] }
                };
            }
        }
        return null;
    }
    /**
     * Build ReAct prompt
     */
    buildReActPrompt(objective, step, history) {
        return `
[КОГНИТИВНА АРХИТЕКТУРА - ReAct v3.0]
ЦЕЛ: ${objective}
СТЪПКА: ${step}/${this.config.maxIterations}

ИСТОРИЯ:
${history || 'Няма предишни стъпки'}

НАЛИЧНИ ДЕЙСТВИЯ:
- autonomous-think: Дълбоко автономно мислене
- self-audit: Self-determination протокол
- verify-symbol: Anti-hallucination проверка на символи
- lookup-map: Търсене в project map
- self-heal: Self-healing engine
- pattern-analysis: Pattern recognition
- swarm-task: Делегиране към Swarm department
- network-recon: Synchronize blockchain state into Neural Mesh
- self-optimize: Trigger Singularity Engine for code self-improvement
- predict-risk: Consult Pre-Cog Oracle for change analysis
- engage-defense: Active Obfuscation & Protection Protocol

ФОРМАТ:
{
    "thought": "Твоето разсъждение",
    "action": {
        "type": "action-type",
        "payload": { "key": "value" },
        "department": "DEPARTMENT_NAME" (optional)
    }
}

Ако целта е постигната, върни само thought без action.
`;
    }
    /**
     * Check if objective is complete
     */
    isObjectiveComplete(reflection) {
        const phrases = ['целта е постигната', 'готово', 'завършено', 'objective complete'];
        return phrases.some(p => reflection.toLowerCase().includes(p));
    }
    /**
     * Abort current cycle
     */
    abort() {
        this.abortController.abort();
        this.log('⚠️ Cognitive cycle aborted');
    }
    /**
     * Emit event via bus
     */
    async emitEvent(phase, data) {
        if (!this.config.enableEventBus)
            return;
        await this.bus.emit(`COGNITION_${phase.toUpperCase()}`, {
            timestamp: Date.now(),
            phase,
            data
        });
    }
    /**
     * Log message
     */
    log(message) {
        if (this.config.enableLogging) {
            console.log(message);
        }
    }
    // ─────────────────────────────────────────────────────────────────────────
    // PUBLIC API
    // ─────────────────────────────────────────────────────────────────────────
    getStateHistory() {
        return [...this.stateHistory];
    }
    isActive() {
        return this.isProcessing;
    }
    registerModule(type, module) {
        this.registry.set(type, module);
        this.log(`📦 Registered module: ${module.getName()}`);
    }
}
exports.CognitiveBridge = CognitiveBridge;
// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════
const getCognitiveBridge = (config) => CognitiveBridge.getInstance(config);
exports.getCognitiveBridge = getCognitiveBridge;
exports.default = CognitiveBridge;
