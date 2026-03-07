/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                     SCENARIO INTERFACE - Mission Definition                   ║
 * ║                                                                               ║
 * ║   Formalizes what a "Mission" looks like to the EvolutionChamber.              ║
 * ║   Each scenario is a self-contained instruction set that the OODA loop        ║
 * ║   will attempt to execute autonomously.                                       ║
 * ║                                                                               ║
 * ║   © 2026 QAntum | Dimitar Prodromov                                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

export interface Scenario {
  /** Human-readable scenario name */
  name: string;

  /** Starting URL — the first page the agent navigates to */
  startUrl: string;

  /** Natural language goal — what the agent should accomplish */
  goal: string;

  /** Maximum OODA cycles before timeout */
  maxSteps: number;

  /** Keywords expected on the final page (for validation without LLM judge) */
  expectedKeywords: string[];

  /** Optional: intermediate goals (multi-step scenarios) */
  steps?: ScenarioStep[];

  /** Optional: time limit in ms (default: 60000) */
  timeoutMs?: number;

  /** Optional: enable debug recording for this scenario */
  debug?: boolean;

  /** Optional: headless mode (default: true) */
  headless?: boolean;
}

export interface ScenarioStep {
  /** What to do at this step */
  goal: string;

  /** How to validate this step succeeded */
  validation: StepValidation;

  /** Max OODA cycles for this step (default: 5) */
  maxCycles?: number;
}

export interface StepValidation {
  /** Method of validation */
  method: 'url-contains' | 'dom-contains' | 'memory-contains' | 'title-contains';

  /** Value to check against */
  value: string;
}

export interface ScenarioResult {
  /** Scenario name */
  name: string;

  /** Overall pass/fail */
  success: boolean;

  /** Per-step results */
  stepResults: StepResult[];

  /** Total OODA cycles executed */
  totalCycles: number;

  /** Total time in ms */
  totalTimeMs: number;

  /** Final page URL */
  finalUrl: string;

  /** Final page title */
  finalTitle: string;

  /** Matched keywords from expectedKeywords */
  matchedKeywords: string[];

  /** Unmatched keywords */
  missedKeywords: string[];

  /** Session memory snapshot (for debugging) */
  memorySnapshot: string[];

  /** OODA cycle breakdown */
  oodaStats: any;

  /** Errors encountered */
  errors: string[];
}

export interface StepResult {
  goal: string;
  success: boolean;
  cyclesUsed: number;
  timeMs: number;
  error?: string;
}
