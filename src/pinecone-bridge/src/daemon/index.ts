/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                              ║
 * ║                    D A E M O N   M O D U L E S                                ║
 * ║              АВТОНОМНИ ИНТЕЛИГЕНТНИ КОМПОНЕНТИ НА QAntum                      ║
 * ║                                                                              ║
 * ║  © 2025-2026 QAntum Empire | Dimitar Prodromov                               ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

// ═══════════════════════════════════════════════════════════════════════════════
// SUPREME DAEMON - Central Orchestrator
// ═══════════════════════════════════════════════════════════════════════════════

export {
  SupremeDaemon,
  awakenSupremeDaemon,
  DaemonState,
  SubDaemonType,
  type SubDaemon,
  type DaemonConfig,
  type DaemonMetrics,
  type ContextualDecision,
} from './SupremeDaemon.js';

// ═══════════════════════════════════════════════════════════════════════════════
// NEURAL CORE MAGNET - Data Collection & Vectorization
// ═══════════════════════════════════════════════════════════════════════════════

export {
  NeuralCoreMagnet,
  createNeuralCoreMagnet,
  DataSourceType,
  type DataFragment,
  type MagnetConfig,
  type MagnetStats,
  type VectorizedFragment,
} from './NeuralCoreMagnet.js';

// ═══════════════════════════════════════════════════════════════════════════════
// AUTONOMOUS THOUGHT - Context-Aware Decision Making
// ═══════════════════════════════════════════════════════════════════════════════

export {
  AutonomousThought,
  createAutonomousThought,
  ThoughtType,
  DecisionOutcome,
  type ThoughtContext,
  type HistoricalPrecedent,
  type Thought,
  type ReasoningChain,
  type ReasoningStep,
  type Decision,
  type AutonomousThoughtConfig,
  type ThoughtMetrics,
} from './AutonomousThought.js';

// ═══════════════════════════════════════════════════════════════════════════════
// SUPREME MEDITATION - Deep Analysis & Meta-Insights
// ═══════════════════════════════════════════════════════════════════════════════

export {
  SupremeMeditation,
  createSupremeMeditation,
  MeditationType,
  InsightSeverity,
  type MeditationSession,
  type Pattern,
  type Anomaly,
  type Correlation,
  type Insight,
  type MetaInsight,
  type Recommendation,
  type MeditationConfig,
  type MeditationMetrics,
} from './SupremeMeditation.js';

// ═══════════════════════════════════════════════════════════════════════════════
// GENESIS BRIDGE ADAPTER - Axiom & Reality Persistence
// ═══════════════════════════════════════════════════════════════════════════════

export {
  GenesisBridgeAdapter,
  createGenesisBridgeAdapter,
  AxiomType,
  type Axiom,
  type AxiomSystem,
  type GeneratedReality,
  type AxiomGenerationContext,
  type RealityEvaluation,
  type GenesisBridgeConfig,
} from '../../../../scripts/qantum/GenesisBridgeAdapter';

// ═══════════════════════════════════════════════════════════════════════════════
// QAntum ORCHESTRATOR - Unified Entry Point
// ═══════════════════════════════════════════════════════════════════════════════

export {
  QAntumOrchestrator,
  createQAntumOrchestrator,
  getQAntumOrchestrator,
  resetGlobalOrchestrator,
  type OrchestratorConfig,
  type OrchestratorStatus,
  type QAntumEvent,
} from './QAntumOrchestrator.js';
