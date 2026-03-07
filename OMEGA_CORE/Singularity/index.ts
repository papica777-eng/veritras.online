/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║                    QANTUM LOGIC SUBSTRATE - ЕДИНЕН ЕКСПОРТ                   ║
 * ║          Пълна интеграция на мета-логически и онтологични системи           ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 * 
 * АРХИТЕКТУРА НА ЛОГИЧЕСКИЯ СУБСТРАТ:
 * 
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │                         SINGULARITY LOGIC                                   │
 * │                    (Унификационен слой - отвъд сингуларността)              │
 * ├─────────────────────────────────────────────────────────────────────────────┤
 * │  ┌───────────────┐  ┌───────────────┐  ┌───────────────────────────────┐   │
 * │  │ MetaLogic     │  │ Transcendence │  │ OntoGenerator                 │   │
 * │  │ Engine        │  │ Core          │  │ (Аксиоматичен Генезис)        │   │
 * │  │ (Златен Ключ) │  │ (Архитектура  │  │                               │   │
 * │  │               │  │  на Истината) │  │                               │   │
 * │  └───────────────┘  └───────────────┘  └───────────────────────────────┘   │
 * │                                                                             │
 * │  ┌───────────────┐  ┌───────────────┐                                      │
 * │  │ Phenomenon    │  │ Logic         │                                      │
 * │  │ Weaver        │  │ EvolutionDB   │                                      │
 * │  │ (Онтологична  │  │ (История на   │                                      │
 * │  │  Ковачница)   │  │  Истината)    │                                      │
 * │  └───────────────┘  └───────────────┘                                      │
 * └─────────────────────────────────────────────────────────────────────────────┘
 * 
 * УПОТРЕБА:
 * 
 * ```typescript
 * import { 
 *   SingularityLogic,
 *   MetaLogicEngine,
 *   TranscendenceEngine,
 *   OntoGenerator
 * } from './LogicSubstrate';
 * 
 * // Сингулярна обработка
 * const singularity = new SingularityLogic();
 * const result = singularity.process("What is the nature of reality?");
 * ```
 */

// ═══════════════════════════════════════════════════════════════════════════════
// SINGULARITY LOGIC - Унификационен слой
// ═══════════════════════════════════════════════════════════════════════════════

export {
  SingularityLogic,
  singularityLogic,
  type SingularityLevel,
  type CognitionMode,
  type SingularityResult,
  type SingularityConfig,
  type SingularityState
} from './SingularityLogic';

// ═══════════════════════════════════════════════════════════════════════════════
// METALOGIC ENGINE - Златният Ключ
// ═══════════════════════════════════════════════════════════════════════════════

export {
  MetaLogicEngine,
  metaLogic,
  GoldenKey,
  type TruthValue,
  type MetaProposition,
  type LogicalSystem,
  type InferenceRule,
  type DialecticTriad,
  type QueryResult
} from './MetaLogicEngine';

// ═══════════════════════════════════════════════════════════════════════════════
// TRANSCENDENCE CORE - Архитектура на Истината
// ═══════════════════════════════════════════════════════════════════════════════

export {
  TranscendenceEngine,
  transcendence,
  Catuskoti,
  JainaSyadavada,
  ZenKoan,
  GodelNumbering,
  ARISTOTELIAN_LAWS,
  type ClassicalTruthValue,
  type ThreeValuedTruth,
  type FourValuedTruth,
  type CatuskotiTruth,
  type JainaTruth,
  type TranscendentTruth,
  type AristotelianLaw,
  type LogicalFramework
} from './TranscendenceCore';

// ═══════════════════════════════════════════════════════════════════════════════
// ONTO-GENERATOR - Аксиоматичен Генезис
// ═══════════════════════════════════════════════════════════════════════════════

export {
  OntoGenerator,
  ontoGenerator,
  type AxiomType,
  type CausalityType,
  type ModalSystem,
  type Axiom,
  type AxiomSystem,
  type PossibleWorld,
  type CausalNode,
  type CausalWeb,
  type Dimension,
  type Spacetime,
  type RealityConfig,
  type GeneratedReality
} from './OntoGenerator';

// ═══════════════════════════════════════════════════════════════════════════════
// PHENOMENON WEAVER - Онтологична Ковачница
// ═══════════════════════════════════════════════════════════════════════════════

export {
  RealityCohesionEngine,
  type PotentialType,
  type CoherenceLevel,
  type ObservationType,
  type Potential,
  type ManifestedReality,
  type CohesionReport,
  type ObservationResult
} from './PhenomenonWeaver';

// ═══════════════════════════════════════════════════════════════════════════════
// LOGIC EVOLUTION DB - История на Истината
// ═══════════════════════════════════════════════════════════════════════════════

export {
  LOGICAL_ERAS,
  PARADOXES,
  LOGIC_SYSTEMS,
  KEY_THEOREMS,
  LOGICAL_HACKS_TABLE,
  type LogicalEra,
  type Paradox,
  type LogicSystem
} from './LogicEvolutionDB';

// ═══════════════════════════════════════════════════════════════════════════════
// DEFAULT EXPORT
// ═══════════════════════════════════════════════════════════════════════════════

import { SingularityLogic } from './SingularityLogic';
export default SingularityLogic;
