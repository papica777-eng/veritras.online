/**
 * ╔═══════════════════════════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                                                   ║
 * ║   🔮 THE PREDICTION MATRIX - Type Definitions                                                    ║
 * ║   "Time-Aware Testing: We See the Future Before It Happens"                                      ║
 * ║                                                                                                   ║
 * ║   Part of QANTUM v15.1 - THE CHRONOS ENGINE                                                 ║
 * ║                                                                                                   ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════════════════╝
 */

// ═══════════════════════════════════════════════════════════════════════════════════════
// 🧬 ELEMENT GENETIC CODE - The "DNA" of a DOM element
// ═══════════════════════════════════════════════════════════════════════════════════════

export interface ElementGeneticCode {
  /** Unique identifier for tracking across time */
  trackingId: string;

  /** Timestamp when this snapshot was recorded */
  timestamp: number;

  /** Primary selector used to locate this element */
  primarySelector: string;

  /** HTML tag name */
  tagName: string;

  /** All available selectors for this element */
  selectors: SelectorDNA[];

  /** Element attributes at time of capture */
  attributes: AttributeSnapshot;

  /** Computed styles (filtered for relevance) */
  styles: StyleSnapshot;

  /** Structural position in DOM */
  structure: StructuralPosition;

  /** Sibling elements info */
  siblings: SiblingInfo;

  /** Parent chain up to 3 levels */
  ancestry: AncestryInfo[];

  /** Text content hash (for identity verification) */
  contentHash: string;

  /** Bounding box for position tracking */
  boundingBox: BoundingBox;
}

export interface SelectorDNA {
  type: SelectorType;
  value: string;
  specificity: number;
  stability: number;  // 0.0 - 1.0
  lastChangeTimestamp?: number;
  changeCount: number;
  survivalProbability: number;
}

export type SelectorType =
  | 'ID'
  | 'DATA_TESTID'
  | 'DATA_CY'
  | 'ARIA_LABEL'
  | 'ARIA_ROLE'
  | 'NAME'
  | 'CLASS'
  | 'CSS_PATH'
  | 'XPATH'
  | 'TEXT_CONTENT'
  | 'NTH_CHILD';

export interface AttributeSnapshot {
  id?: string;
  name?: string;
  class?: string[];
  dataAttributes: Record<string, string>;
  ariaAttributes: Record<string, string>;
  customAttributes: Record<string, string>;
  formAttributes?: FormAttributeSnapshot;
}

export interface FormAttributeSnapshot {
  type?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  value?: string;
}

export interface StyleSnapshot {
  display: string;
  visibility: string;
  position: string;
  zIndex: string;
  width: string;
  height: string;
  color: string;
  backgroundColor: string;
  fontSize: string;
  fontFamily: string;
}

export interface StructuralPosition {
  tagName: string;
  index: number;         // Index among same-tag siblings
  globalIndex: number;   // Index among all siblings
  depth: number;         // DOM depth from body
  path: string;          // CSS-like path (e.g., "body > div:nth(2) > form")
}

export interface SiblingInfo {
  prevSibling?: SiblingSnapshot;
  nextSibling?: SiblingSnapshot;
  siblingCount: number;
  sameTagSiblingCount: number;
}

export interface SiblingSnapshot {
  tagName: string;
  id?: string;
  class?: string[];
  textContent?: string;
}

export interface AncestryInfo {
  tagName: string;
  id?: string;
  class?: string[];
  level: number;  // 1 = parent, 2 = grandparent, etc.
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// 📊 STABILITY SCORING SYSTEM
// ═══════════════════════════════════════════════════════════════════════════════════════

export interface StabilityScore {
  selector: string;
  selectorType: SelectorType;
  score: number;          // 0.0 - 1.0
  confidence: number;     // How confident we are in this score
  factors: StabilityFactors;
  trend: TrendDirection;
  lastUpdated: number;
}

export interface StabilityFactors {
  /** How many times this selector changed (negative impact) */
  changeFrequency: number;

  /** Days since last change (positive if stable) */
  daysSinceLastChange: number;

  /** Type-based base score (data-testid > id > class) */
  typeBaseScore: number;

  /** How many successful uses */
  successCount: number;

  /** How many failures before self-heal */
  failureCount: number;

  /** Score adjustment from domain patterns */
  domainAdjustment: number;

  /** Score from similar selectors in same app */
  peerInfluence: number;
}

export type TrendDirection = 'IMPROVING' | 'STABLE' | 'DEGRADING' | 'VOLATILE';

// ═══════════════════════════════════════════════════════════════════════════════════════
// 🔮 N-STEP LOOK-AHEAD SIMULATION
// ═══════════════════════════════════════════════════════════════════════════════════════

export interface FutureSimulation {
  simulationId: string;
  timestamp: number;
  scenarios: SimulatedScenario[];
  winnerSelector: SelectorDNA;
  survivalMatrix: SurvivalMatrix;
}

export interface SimulatedScenario {
  name: string;
  description: string;
  probability: number;     // How likely this scenario is
  mutations: DOMMutation[];
  survivingSelectors: string[];
  failingSelectors: string[];
}

export interface DOMMutation {
  type: MutationType;
  target: string;          // What was changed
  before?: string;
  after?: string;
  impact: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export type MutationType =
  | 'ID_CHANGED'
  | 'ID_REMOVED'
  | 'CLASS_ADDED'
  | 'CLASS_REMOVED'
  | 'CLASS_RENAMED'
  | 'ATTRIBUTE_CHANGED'
  | 'ATTRIBUTE_REMOVED'
  | 'ELEMENT_MOVED'
  | 'ELEMENT_NESTED'
  | 'ELEMENT_CLONED'
  | 'TEXT_CHANGED'
  | 'ARIA_CHANGED'
  | 'DATA_TESTID_ADDED'
  | 'DATA_TESTID_REMOVED'
  | 'FRAMEWORK_MIGRATION';

export interface SurvivalMatrix {
  /** Rows: selectors, Columns: scenarios */
  matrix: boolean[][];
  selectors: string[];
  scenarios: string[];
  survivalRates: Map<string, number>;
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// 🧠 REINFORCEMENT LEARNING TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════

export interface SelectorDecision {
  chosen: SelectorDNA;
  alternatives: SelectorDNA[];
  reasoning: DecisionReasoning;
  timestamp: number;
  outcome?: DecisionOutcome;
}

export interface DecisionReasoning {
  survivalProbability: number;
  stabilityScore: number;
  simulationResults: string;
  historicalPerformance: string;
  riskAssessment: string;
}

export interface DecisionOutcome {
  success: boolean;
  executionTime: number;
  retryCount: number;
  finalSelector?: string;
  failureReason?: string;
}

export interface ReinforcementState {
  elementId: string;
  selectorScores: Map<string, number>;
  actionHistory: ActionHistoryEntry[];
  qValues: Map<string, number>;  // Q-learning values
  explorationRate: number;       // ε in ε-greedy
}

export interface ActionHistoryEntry {
  selector: string;
  action: 'SELECT' | 'RETRY' | 'FALLBACK';
  reward: number;
  timestamp: number;
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// 📚 KNOWLEDGE BASE TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════

export interface PredictionKnowledge {
  version: string;
  lastUpdated: number;
  elements: Map<string, ElementEvolutionHistory>;
  domainPatterns: Map<string, DomainPattern>;
  globalHeuristics: GlobalHeuristics;
  temporalPatterns: TemporalPattern[];
}

export interface ElementEvolutionHistory {
  trackingId: string;
  firstSeen: number;
  lastSeen: number;
  snapshots: ElementGeneticCode[];
  selectorStability: Map<string, StabilityScore>;
  mutations: RecordedMutation[];
  predictedNextChange?: PredictedChange;
}

export interface RecordedMutation {
  timestamp: number;
  type: MutationType;
  before: string;
  after: string;
  affectedSelectors: string[];
  recoverySelector?: string;
}

export interface PredictedChange {
  probability: number;
  expectedDate: number;
  expectedType: MutationType;
  confidence: number;
  basedOn: string;  // What pattern led to this prediction
}

export interface DomainPattern {
  domain: string;
  updateFrequency: 'DAILY' | 'WEEKLY' | 'BI_WEEKLY' | 'MONTHLY' | 'IRREGULAR';
  typicalUpdateDay?: number;  // 0-6 for day of week
  typicalUpdateHour?: number; // 0-23
  riskElements: string[];     // Selectors that often break
  stableElements: string[];   // Selectors that are reliable
  frameworkHints: string[];   // Detected frameworks
}

export interface GlobalHeuristics {
  selectorTypeRankings: Map<SelectorType, number>;
  mutationProbabilities: Map<MutationType, number>;
  recoveryStrategies: Map<MutationType, SelectorType[]>;
}

export interface TemporalPattern {
  name: string;
  description: string;
  dayOfWeek?: number[];
  hourOfDay?: number[];
  dayOfMonth?: number[];
  mutationTypes: MutationType[];
  affectedDomains: string[];
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// ⚡ PERFORMANCE OPTIMIZATION TYPES (Ryzen 7000 optimized)
// ═══════════════════════════════════════════════════════════════════════════════════════

export interface BatchOperation<T, R> {
  items: T[];
  batchSize: number;
  parallelism: number;
  processor: (batch: T[]) => Promise<R[]>;
}

export interface CacheConfig {
  maxSize: number;
  ttlMs: number;
  strategy: 'LRU' | 'LFU' | 'FIFO';
}

export interface PerformanceMetrics {
  operationName: string;
  startTime: number;
  endTime: number;
  itemsProcessed: number;
  cacheHits: number;
  cacheMisses: number;
  memoryUsed: number;
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// 🎯 ACTION EXECUTOR INTEGRATION
// ═══════════════════════════════════════════════════════════════════════════════════════

export interface SelectorRecommendation {
  primary: SelectorDNA;
  fallbacks: SelectorDNA[];
  strategy: SelectionStrategy;
  confidence: number;
  expectedSuccessRate: number;
}

export type SelectionStrategy =
  | 'SURVIVAL_FIRST'      // Highest survival probability
  | 'SPEED_FIRST'         // Fastest selector type
  | 'STABILITY_FIRST'     // Highest stability score
  | 'BALANCED'            // Weighted combination
  | 'EXPLORATION';        // Try less-used selectors to gather data

export interface ExecutionContext {
  url: string;
  domain: string;
  pagePath?: string;
  pageType: string;
  framework?: string;
  timeOfDay: number;
  dayOfWeek: number;
  isDeploymentWindow: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// 🤖 Q-LEARNING CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════════════

export interface QLearningConfig {
  learningRate: number;          // α - How much new info overrides old
  discountFactor: number;        // γ - Future reward importance
  explorationRate: number;       // ε - Probability of random exploration
  minExplorationRate: number;    // Minimum ε after decay
  explorationDecay: number;      // How fast ε decreases
  batchSize: number;             // Experience replay batch size
  memorySize: number;            // Max experiences to remember
}

export interface ActionOutcome {
  success: boolean;
  responseTimeMs: number;
  error?: string;
  usedFallback: boolean;
  consecutiveSuccesses: number;
  survivedUpdate: boolean;
  mutationDetected?: boolean;
  mutationType?: MutationType;
  beforeValue?: string;
  afterValue?: string;
}

export interface RewardSignal {
  base: number;
  timingBonus: number;
  consistencyBonus: number;
  survivalBonus: number;
  penalties: number;
  total: number;
}

export type ExplorationStrategy =
  | 'EPSILON_GREEDY'
  | 'THOMPSON_SAMPLING'
  | 'UCB1'
  | 'SOFTMAX';

export interface PolicyGradient {
  selectorType: SelectorType;
  weight: number;
  gradient: number;
  lastUpdate: number;
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// ⚡ PERFORMANCE OPTIMIZATION TYPES (Additional)
// ═══════════════════════════════════════════════════════════════════════════════════════

export interface PerformanceConfig {
  maxCacheSize: number;
  cacheTtlMs: number;
  batchSize: number;
  parallelism: number;
  enableSimd: boolean;
}

export interface CacheEntry<T> {
  key: string;
  value: T;
  timestamp: number;
  hits: number;
  lastAccess: number;
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// 🧬 DOM SNAPSHOT TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════

export interface DOMSnapshot {
  trackingId: string;
  timestamp: number;
  geneticCode: ElementGeneticCode;
  hash: string;
}
