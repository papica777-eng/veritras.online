/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                               ║
 * ║   COGNITIVE TYPE DEFINITIONS                                                  ║
 * ║   Strict contracts for autonomous reasoning modules                          ║
 * ║                                                                               ║
 * ║   © 2025-2026 QAntum | Dimitar Prodromov                                     ║
 * ║                                                                               ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

// ═══════════════════════════════════════════════════════════════════════════════
// ACTION TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export enum CognitiveActionType {
  AUTONOMOUS_THINK = 'autonomous-think',
  SELF_AUDIT = 'self-audit',
  VERIFY_SYMBOL = 'verify-symbol',
  LOOKUP_MAP = 'lookup-map',
  SELF_HEAL = 'self-heal',
  PATTERN_ANALYSIS = 'pattern-analysis',
  SWARM_TASK = 'swarm-task',
  DECRYPT_VAULT = 'decrypt-vault',
  NETWORK_RECON = 'network-recon',
  SELF_OPTIMIZE = 'self-optimize',
  PREDICT_RISK = 'predict-risk',
  ENGAGE_DEFENSE = 'engage-defense',
}

// ═══════════════════════════════════════════════════════════════════════════════
// COGNITIVE STRUCTURES
// ═══════════════════════════════════════════════════════════════════════════════

export interface CognitiveAction {
  type: CognitiveActionType;
  payload: Record<string, any>;
  department?: string;
}

export interface CognitiveObservation {
  action: CognitiveActionType;
  result: any;
  timestamp: number;
  success: boolean;
  error?: string;
}

export interface CognitiveState {
  step: number;
  thought: string;
  action?: CognitiveAction;
  observation?: CognitiveObservation;
  reflection?: string;
}

export interface CognitiveEvent {
  timestamp: number;
  phase: 'start' | 'thought' | 'action' | 'observation' | 'reflection' | 'end' | 'error';
  data: any;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MODULE INTERFACE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Interface that all cognitive modules must implement
 */
export interface ICognitiveModule {
  /**
   * Execute the module's primary function
   * @param payload Input data for the module
   * @returns Promise resolving to the module's output
   */
  // Complexity: O(1)
  execute(payload: Record<string, any>): Promise<any>;

  /**
   * Get module name for logging/debugging
   */
  // Complexity: O(1)
  getName(): string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

export interface CognitiveBridgeConfig {
  maxIterations: number;
  temperature: number;
  enableLogging: boolean;
  enableEventBus: boolean;
  abortOnError: boolean;
}

export const DEFAULT_COGNITIVE_CONFIG: CognitiveBridgeConfig = {
  maxIterations: 10,
  temperature: 0.3,
  enableLogging: true,
  enableEventBus: true,
  abortOnError: false,
};
