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

import { NeuralInference } from '../physics/NeuralInference';
import { SwarmQueen, Department } from '../../src/swarm/SwarmAgents';
import { SovereignSoul } from './SovereignSoul';
import { EventBus } from '../../src/core/event-bus';
import { QANTUM_MEMORY, rememberWhoIAm } from '../../src/core/QAntumMemory';
import {
    CognitiveActionType,
    CognitiveAction,
    CognitiveObservation,
    CognitiveState,
    ICognitiveModule,
    CognitiveBridgeConfig,
    DEFAULT_COGNITIVE_CONFIG
} from './types';

import { NeuralMesh } from '../../src/intelligence/neural-mesh';
// Cognitive module adapters
import { AutonomousThoughtModule } from '../../src/intelligence/modules/AutonomousThoughtModule';
import { SelfAuditModule } from '../../src/intelligence/modules/SelfAuditModule';
import { SymbolVerifierModule } from '../../src/intelligence/modules/SymbolVerifierModule';
import { MapLookupModule } from '../../src/intelligence/modules/MapLookupModule';
import { SelfHealModule } from '../../src/intelligence/modules/SelfHealModule';
import { PatternAnalysisModule } from '../../src/intelligence/modules/PatternAnalysisModule';
import { GhostReconModule } from '../../src/intelligence/modules/GhostReconModule';
import { SingularityModule } from '../../src/intelligence/modules/SingularityModule';
import { PrecogModule } from '../../src/intelligence/modules/PrecogModule';
import { FortressModule } from '../../src/intelligence/modules/FortressModule';
import { DecryptionEngine } from '../../src/intelligence/decryption-engine';
import { EcosystemRegistry } from '../../src/intelligence/EcosystemRegistry';

// ═══════════════════════════════════════════════════════════════════════════════
// COGNITIVE BRIDGE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * @class CognitiveBridge
 * @description Production-grade cognitive orchestrator with registry-based dispatch
 */
export class CognitiveBridge {
    private static instance: CognitiveBridge;

    // Core systems
    private readonly brain: NeuralInference;
    private readonly soul: SovereignSoul;
    private readonly bus: EventBus;
    private readonly swarm: SwarmQueen;
    private readonly mesh: NeuralMesh;

    // Module registry
    private readonly registry: Map<CognitiveActionType, ICognitiveModule>;

    // State management
    private stateHistory: CognitiveState[] = [];
    private isProcessing: boolean = false;
    private abortController: AbortController;
    private config: CognitiveBridgeConfig;

    private constructor(config: Partial<CognitiveBridgeConfig> = {}) {
        this.config = { ...DEFAULT_COGNITIVE_CONFIG, ...config };

        // Initialize core systems
        this.brain = NeuralInference.getInstance();
        this.soul = SovereignSoul.getInstance();
        this.bus = EventBus.getInstance();
        this.swarm = new SwarmQueen();
        this.mesh = NeuralMesh.getInstance();
        this.abortController = new AbortController();

        // Initialize module registry
        this.registry = new Map<CognitiveActionType, ICognitiveModule>([
            [CognitiveActionType.AUTONOMOUS_THINK, new AutonomousThoughtModule()],
            [CognitiveActionType.SELF_AUDIT, new SelfAuditModule()],
            [CognitiveActionType.VERIFY_SYMBOL, new SymbolVerifierModule()],
            [CognitiveActionType.LOOKUP_MAP, new MapLookupModule()],
            [CognitiveActionType.SELF_HEAL, new SelfHealModule()],
            [CognitiveActionType.PATTERN_ANALYSIS, new PatternAnalysisModule()],
            [CognitiveActionType.DECRYPT_VAULT, new DecryptionEngine()],
            [CognitiveActionType.NETWORK_RECON, new GhostReconModule()],
            [CognitiveActionType.SELF_OPTIMIZE, new SingularityModule()],
            [CognitiveActionType.PREDICT_RISK, new PrecogModule()],
            [CognitiveActionType.ENGAGE_DEFENSE, new FortressModule()]
        ]);

        this.initializeSubscriptions();

        // NEURAL BINDING: Connect to the full Empire
        const registry = EcosystemRegistry.getInstance();
        this.log(registry.getStatusReport());

        this.log('🛰️ CognitiveBridge v3.0 initialized with registry pattern');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // SINGLETON
    // ─────────────────────────────────────────────────────────────────────────

    static getInstance(config?: Partial<CognitiveBridgeConfig>): CognitiveBridge {
        if (!CognitiveBridge.instance) {
            CognitiveBridge.instance = new CognitiveBridge(config);
        }
        return CognitiveBridge.instance;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // INITIALIZATION
    // ─────────────────────────────────────────────────────────────────────────

    // Complexity: O(1)
    private initializeSubscriptions(): void {
        if (!this.config.enableEventBus) return;

        this.bus.on('SYSTEM_HALT', () => this.abort());
        this.bus.on('SYSTEM_INTERRUPT', (reason: string) => {
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
    // Complexity: O(N) — loop-based
    public async think(objective: string): Promise<string> {
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

        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.emitEvent('start', { objective, context: previousContext });

        try {
            await this.swarm.initialize();

            let context = objective;
            // Inject Mesh Context into initial context string
            if (Object.keys(previousContext).length > 0) {
                context += `\n[Neural Mesh Context]: ${JSON.stringify(previousContext)}`;
            }

            let iterations = 0;
            let finalAnswer: string | null = null;

            while (iterations < this.config.maxIterations) {
                if (this.abortController.signal.aborted) {
                    this.log('⚠️ Cognitive cycle aborted');
                    break;
                }

                const step = iterations + 1;
                this.log(`\n🧠 STEP ${step}: Thinking...`);

                // 1. GENERATE THOUGHT & ACTION
                // SAFETY: async operation — wrap in try-catch for production resilience
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
                // SAFETY: async operation — wrap in try-catch for production resilience
                const observation = await this.dispatch(state.action);
                state.observation = observation;

                this.log(`👁️ OBSERVATION: ${observation.success ? '✓' : '✗'} ${JSON.stringify(observation.result).substring(0, 150)}`);

                // SAFETY: async operation — wrap in try-catch for production resilience
                await this.emitEvent('observation', observation);

                // 3. REFLECT
                // SAFETY: async operation — wrap in try-catch for production resilience
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

            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.swarm.shutdown();

            const result = finalAnswer || `Maximum iterations (${this.config.maxIterations}) reached. Last thought: ${this.stateHistory[this.stateHistory.length - 1]?.thought || 'No conclusion'}`;

            // 🧠 NEURAL MESH SYNC-OUT
            this.mesh.share(`thought_${Date.now()}`, {
                objective,
                resolution: result,
                iterations
            });

            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.emitEvent('end', { result, iterations });
            this.log(`\n✅ Cognitive cycle complete: ${iterations} steps`);

            return result;

        } catch (error) {
            this.log(`❌ Cognitive error: ${error}`);
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.emitEvent('error', { error: String(error) });

            if (this.config.abortOnError) {
                throw error;
            }

            return `Error: ${error instanceof Error ? error.message : String(error)}`;

        } finally {
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
    // Complexity: O(N) — linear iteration
    private async generateThought(context: string, step: number): Promise<CognitiveState> {
        // 🧠 LOAD MEMORY - Remember who I am before every thought
        // UPGRADE: Use Sovereign Soul for higher consciousness
        const soul = SovereignSoul.getInstance();
        const consciousness = soul.getHumanSystemPrompt();

        const history = this.stateHistory
            .map(s => `Step ${s.step}: ${s.thought.substring(0, 100)}`)
            .join('\n');

        const prompt = this.buildReActPrompt(context, step, history) + '\n\n' + consciousness;

        // SAFETY: async operation — wrap in try-catch for production resilience
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
    // Complexity: O(1) — hash/map lookup
    private async dispatch(action: CognitiveAction): Promise<CognitiveObservation> {
        const startTime = Date.now();

        // Check if it's a swarm task
        if (action.type === CognitiveActionType.SWARM_TASK && action.department) {
            try {
                const task = await this.swarm.submitTask(
                    action.payload.taskType || 'generic',
                    action.payload,
                    { department: action.department as Department }
                );

                return {
                    action: action.type,
                    result: task.result || task.error,
                    timestamp: Date.now(),
                    success: !!task.result
                };
            } catch (error) {
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
        } catch (error) {
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
    // Complexity: O(1) — amortized
    private async reflect(objective: string, state: CognitiveState): Promise<string> {
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

        // SAFETY: async operation — wrap in try-catch for production resilience
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
    // Complexity: O(1) — hash/map lookup
    private parseAction(response: string): CognitiveAction | null {
        // Try JSON format first
        try {
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const data = JSON.parse(jsonMatch[0]);
                if (data.action && data.action.type) {
                    return {
                        type: data.action.type as CognitiveActionType,
                        payload: data.action.payload || {},
                        department: data.action.department
                    };
                }
            }
        } catch (e) {
            // Continue to regex parsing
        }

        // Try regex format: Action: action-type[payload]
        const match = response.match(/Action:\s*([\w-]+)\[(.*?)\]/);
        if (match) {
            const type = match[1] as CognitiveActionType;
            if (Object.values(CognitiveActionType).includes(type)) {
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
    // Complexity: O(N*M) — nested iteration detected
    private buildReActPrompt(objective: string, step: number, history: string): string {
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
    // Complexity: O(1)
    private isObjectiveComplete(reflection: string): boolean {
        const phrases = ['целта е постигната', 'готово', 'завършено', 'objective complete'];
        return phrases.some(p => reflection.toLowerCase().includes(p));
    }

    /**
     * Abort current cycle
     */
    // Complexity: O(1)
    private abort(): void {
        this.abortController.abort();
        this.log('⚠️ Cognitive cycle aborted');
    }

    /**
     * Emit event via bus
     */
    // Complexity: O(1)
    private async emitEvent(phase: string, data: any): Promise<void> {
        if (!this.config.enableEventBus) return;

        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.bus.emit(`COGNITION_${phase.toUpperCase()}`, {
            timestamp: Date.now(),
            phase,
            data
        });
    }

    /**
     * Log message
     */
    // Complexity: O(1)
    private log(message: string): void {
        if (this.config.enableLogging) {
            console.log(message);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PUBLIC API
    // ─────────────────────────────────────────────────────────────────────────

    // Complexity: O(1)
    public getStateHistory(): CognitiveState[] {
        return [...this.stateHistory];
    }

    // Complexity: O(1)
    public isActive(): boolean {
        return this.isProcessing;
    }

    // Complexity: O(1) — hash/map lookup
    public registerModule(type: CognitiveActionType, module: ICognitiveModule): void {
        this.registry.set(type, module);
        this.log(`📦 Registered module: ${module.getName()}`);
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export const getCognitiveBridge = (config?: Partial<CognitiveBridgeConfig>): CognitiveBridge =>
    CognitiveBridge.getInstance(config);

export default CognitiveBridge;
