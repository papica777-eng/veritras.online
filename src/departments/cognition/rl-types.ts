/**
 * Type definitions for Reinforcement Learning Bridge
 * Stub types for PRIVATE-CORE integration
 */

export type SelectorType = 'ID' | 'CSS' | 'XPATH' | 'TEXT' | 'ROLE' | 'DATA_TESTID' | 'NAME' | 'ARIA';

export interface SelectorDNA {
    type: SelectorType;
    value: string;
    stability: number;
    weight: number;
    lastSuccess?: number;
    lastFailure?: number;
}

export interface ElementGeneticCode {
    tagName: string;
    selectors: SelectorDNA[];
    attributes: Record<string, string>;
    textContent?: string;
    parentPath?: string;
}

export interface ExecutionContext {
    domain: string;
    pagePath?: string;
    browser?: string;
    viewport?: { width: number; height: number };
    isDeploymentWindow: boolean;
    timestamp?: number;
}

export interface QLearningConfig {
    learningRate: number;
    discountFactor: number;
    explorationRate: number;
    minExplorationRate: number;
    explorationDecay: number;
    batchSize: number;
    memorySize: number;
}

export interface ActionOutcome {
    success: boolean;
    error?: string;
    responseTimeMs: number;
    usedFallback: boolean;
    consecutiveSuccesses: number;
    survivedUpdate: boolean;
    selectorUsed?: string;
    timestamp?: number;
}

export interface RewardSignal {
    value: number;
    source: string;
    timestamp: number;
}

export type ExplorationStrategy = 'epsilon_greedy' | 'thompson_sampling' | 'ucb1' | 'boltzmann';

export interface PolicyGradient {
    stateKey: string;
    gradients: Float64Array;
    lastUpdated: number;
}

export interface ReinforcementState {
    currentState: string;
    availableActions: string[];
    history: ActionOutcome[];
    cumulativeReward: number;
}
