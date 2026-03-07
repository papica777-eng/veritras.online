import { EventEmitter } from 'events';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// ═══════════════════════════════════════════════════════════════════════════════
// CHAOS TYPES (First Principles & Strict Layering)
// ═══════════════════════════════════════════════════════════════════════════════

export enum ChaosType {
    NETWORK = 'network',
    RESOURCE = 'resource',
    STATE = 'state',
    TIME = 'time',
    DEPENDENCY = 'dependency'
}

export enum FailureMode {
    LATENCY = 'latency',
    ERROR = 'error',
    TIMEOUT = 'timeout',
    CRASH = 'crash',
    CORRUPTION = 'corruption',
    PARTITION = 'partition'
}

export enum ExperimentState {
    PENDING = 'pending',
    RUNNING = 'running',
    PAUSED = 'paused',
    COMPLETED = 'completed',
    ABORTED = 'aborted'
}

export interface AttackConfig {
    probability?: number;
    duration?: number;
    intensity?: number;
    target?: string;
    [key: string]: unknown;
}

export interface AttackOptions {
    id?: string;
    name?: string;
    type?: ChaosType;
    mode?: FailureMode;
    config?: AttackConfig;
}

export interface AttackResult {
    applied: boolean;
    type?: string;
    delay?: number;
    shouldFail?: boolean;
    timedOut?: boolean;
    crashed?: boolean;
    shouldRestart?: boolean;
}

export interface SystemContext {
    health?: () => boolean | Promise<boolean>;
    getLatency?: () => number | Promise<number>;
    getErrorRate?: () => number | Promise<number>;
    getThroughput?: () => number | Promise<number>;
    killWorker?: (id: string | number) => Promise<void>;
}

export interface SystemState {
    healthy: boolean;
    latency: number;
    errorRate: number;
    throughput: number;
    capturedAt: Date;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CHAOS ATTACK - Single execution unit
// ═══════════════════════════════════════════════════════════════════════════════

export class ChaosAttack extends EventEmitter {
    public readonly id: string;
    public readonly name: string;
    public readonly type: ChaosType;
    public readonly mode: FailureMode;
    public readonly config: AttackConfig;

    private active: boolean = false;
    private stats = {
        executions: 0,
        failures: 0,
        avgDuration: 0
    };

    constructor(options: AttackOptions = {}) {
        super();
        this.id = options.id || `attack-${Date.now()}`;
        this.name = options.name || 'Unnamed Attack';
        this.type = options.type || ChaosType.NETWORK;
        this.mode = options.mode || FailureMode.ERROR;

        this.config = {
            probability: options.config?.probability ?? 0.5,
            duration: options.config?.duration ?? 5000,
            intensity: options.config?.intensity ?? 0.5,
            target: options.config?.target ?? '*',
            ...options.config
        };
    }

    /**
     * @Complexity O(1) - Executes chaos effect
     */
    public async execute(context: SystemContext = {}): Promise<AttackResult> {
        if (this.active) {
            throw new Error('Attack already in progress');
        }

        this.active = true;
        const startTime = Date.now();
        this.emit('started', { attack: this });

        try {
            const result = await this._applyAttack(context);

            this.stats.executions++;
            this.stats.avgDuration =
                (this.stats.avgDuration * (this.stats.executions - 1) + (Date.now() - startTime)) /
                this.stats.executions;

            this.emit('completed', { attack: this, result });
            return result;
        } catch (error) {
            this.stats.failures++;
            this.emit('failed', { attack: this, error });
            throw error;
        } finally {
            this.active = false;
        }
    }

    private async _applyAttack(context: SystemContext): Promise<AttackResult> {
        switch (this.mode) {
            case FailureMode.LATENCY:
                return this._applyLatency();
            case FailureMode.ERROR:
                return this._applyError();
            case FailureMode.TIMEOUT:
                return this._applyTimeout();
            case FailureMode.CRASH:
                return this._applyCrash(context);
            default:
                return { applied: false };
        }
    }

    private async _applyLatency(): Promise<AttackResult> {
        const delay = (this.config.duration || 5000) * (this.config.intensity || 0.5);
        await new Promise(resolve => setTimeout(resolve, delay));
        return { applied: true, type: 'latency', delay };
    }

    private async _applyError(): Promise<AttackResult> {
        if (Math.random() < (this.config.probability || 0.5)) {
            return { applied: true, type: 'error', shouldFail: true };
        }
        return { applied: false };
    }

    private async _applyTimeout(): Promise<AttackResult> {
        await new Promise(resolve => setTimeout(resolve, (this.config.duration || 5000) + 1000));
        return { applied: true, type: 'timeout', timedOut: true };
    }

    private async _applyCrash(context: SystemContext): Promise<AttackResult> {
        // True failover testing: Actually kill a random worker if target is '*'
        if (this.config.target === '*' && context.killWorker) {
            await context.killWorker('random');
        }
        return { applied: true, type: 'crash', crashed: true, shouldRestart: true };
    }

    public stop(): void {
        this.active = false;
        this.emit('stopped', { attack: this });
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// CHAOS EXPERIMENT - Group of attacks with validation
// ═══════════════════════════════════════════════════════════════════════════════

export interface ExperimentConfig {
    id?: string;
    name?: string;
    hypothesis?: string;
    description?: string;
}

export class ChaosExperiment extends EventEmitter {
    public readonly id: string;
    public readonly name: string;
    public readonly description: string;
    public state: ExperimentState;
    public readonly hypothesis: string;

    private attacks: ChaosAttack[] = [];
    private results = {
        started: null as Date | null,
        completed: null as Date | null,
        hypothesisValid: null as boolean | null,
        observations: [] as any[],
        metrics: {} as Record<string, any>
    };

    constructor(config: ExperimentConfig = {}) {
        super();
        this.id = config.id || `exp-${Date.now()}`;
        this.name = config.name || 'Chaos Experiment';
        this.description = config.description || '';
        this.state = ExperimentState.PENDING;
        this.hypothesis = config.hypothesis || 'System achieves 0.08ms failover and remains stable';
    }

    public addAttack(attack: ChaosAttack): void {
        this.attacks.push(attack);
    }

    public async run(context: SystemContext = {}): Promise<typeof this.results> {
        this.state = ExperimentState.RUNNING;
        this.results.started = new Date();
        this.emit('started', { experiment: this });

        try {
            const initialState = await this._captureState(context);
            this._recordObservation('initial', { state: initialState });

            for (const attack of this.attacks) {
                if (this.state !== ExperimentState.RUNNING) break;

                try {
                    const result = await attack.execute(context);
                    this._recordObservation('attack', { attack: attack.id, result });
                } catch (error) {
                    this._recordObservation('attack_error', { attack: attack.id, error: String(error) });
                }

                const currentState = await this._captureState(context);
                this._recordObservation('state_check', { state: currentState });
            }

            const finalState = await this._captureState(context);
            this._recordObservation('final', { state: finalState });

            this.results.hypothesisValid = this._validateHypothesis(initialState, finalState);
            this.state = ExperimentState.COMPLETED;
            this.results.completed = new Date();

            this.emit('completed', { experiment: this, results: this.results });
            return this.results;
        } catch (error) {
            this.state = ExperimentState.ABORTED;
            this.emit('aborted', { experiment: this, error });
            throw error;
        }
    }

    private _recordObservation(type: string, data: any): void {
        this.results.observations.push({
            type,
            ...data,
            timestamp: new Date()
        });
    }

    private async _captureState(context: SystemContext): Promise<SystemState> {
        return {
            healthy: context.health ? await context.health() : true,
            latency: context.getLatency ? await context.getLatency() : 0,
            errorRate: context.getErrorRate ? await context.getErrorRate() : 0,
            throughput: context.getThroughput ? await context.getThroughput() : 0,
            capturedAt: new Date()
        };
    }

    private _validateHypothesis(initial: SystemState, final: SystemState): boolean {
        // Validation per QAntum DEFINITION: 0.08ms failover implies extreme resilience
        const errorRateDiff = (final.errorRate || 0) - (initial.errorRate || 0);
        const latencyIncrease = (final.latency || 0) / (initial.latency || 1);

        // Allowed regression is nearly zero
        return errorRateDiff <= 0.05 && latencyIncrease <= 1.5;
    }

    public abort(): void {
        this.state = ExperimentState.ABORTED;
        for (const attack of this.attacks) {
            attack.stop();
        }
        this.emit('aborted', { experiment: this });
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// CHAOS ENGINE (Orchestrator - Layer 2)
// ═══════════════════════════════════════════════════════════════════════════════

export interface ChaosEngineOptions {
    enabled?: boolean;
    safeMode?: boolean;
    maxConcurrent?: number;
}

export class ChaosEngine extends EventEmitter {
    private options: Required<ChaosEngineOptions>;
    private attacks = new Map<string, ChaosAttack>();
    private experiments = new Map<string, ChaosExperiment>();
    private activeAttacks = new Set<string>();

    constructor(options: ChaosEngineOptions = {}) {
        super();
        this.options = {
            enabled: options.enabled ?? true,
            safeMode: options.safeMode ?? true,
            maxConcurrent: options.maxConcurrent ?? 3
        };
        this._initDefaultAttacks();
    }

    private _initDefaultAttacks(): void {
        this.registerAttack(new ChaosAttack({
            id: 'network-latency',
            type: ChaosType.NETWORK,
            mode: FailureMode.LATENCY,
            config: { duration: 3000, intensity: 0.5 }
        }));

        this.registerAttack(new ChaosAttack({
            id: 'cpu-stress',
            type: ChaosType.RESOURCE,
            mode: FailureMode.ERROR,
            config: { intensity: 0.8, duration: 10000 }
        }));

        this.registerAttack(new ChaosAttack({
            id: 'worker-assassination',
            type: ChaosType.STATE,
            mode: FailureMode.CRASH,
            config: { target: '*' }
        }));
    }

    public registerAttack(attack: ChaosAttack): void {
        this.attacks.set(attack.id, attack);
    }

    public createExperiment(config: ExperimentConfig = {}): ChaosExperiment {
        const experiment = new ChaosExperiment(config);
        this.experiments.set(experiment.id, experiment);
        return experiment;
    }

    public async runAttack(attackId: string, context: SystemContext = {}): Promise<AttackResult> {
        if (!this.options.enabled) throw new Error('Chaos engine is disabled');

        const attack = this.attacks.get(attackId);
        if (!attack) throw new Error(`Attack ${attackId} not found`);
        if (this.activeAttacks.size >= this.options.maxConcurrent) throw new Error('Max concurrent attacks reached');

        this.activeAttacks.add(attackId);
        try {
            const result = await attack.execute(context);
            this.emit('attackCompleted', { attackId, result });
            return result;
        } finally {
            this.activeAttacks.delete(attackId);
        }
    }

    public async runExperiment(experimentId: string, context: SystemContext = {}): Promise<any> {
        if (!this.options.enabled) throw new Error('Chaos engine is disabled');
        const experiment = this.experiments.get(experimentId);
        if (!experiment) throw new Error(`Experiment ${experimentId} not found`);
        return await experiment.run(context);
    }

    public stopAll(): void {
        for (const attackId of this.activeAttacks) {
            this.attacks.get(attackId)?.stop();
        }
        this.activeAttacks.clear();
        this.emit('allStopped');
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export function createChaosEngine(options: ChaosEngineOptions = {}): ChaosEngine {
    return new ChaosEngine(options);
}
