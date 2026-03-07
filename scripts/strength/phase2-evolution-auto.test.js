/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  PHASE 2 UNIT TESTS - Steps 29-34                                             ║
 * ║  Look-Ahead, Knowledge Distillation, Genetic, Mutations, Decisions, Meta      ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

'use strict';

// Test utilities
let passed = 0;
let failed = 0;
const errors = [];

function describe(name, fn) {
  console.log(`\n📦 ${name}`);
  // Complexity: O(1)
  fn();
}

function test(name, fn) {
  try {
    // Complexity: O(1)
    fn();
    passed++;
    console.log(`  ✅ ${name}`);
  } catch (err) {
    failed++;
    errors.push({ name, error: err.message });
    console.log(`  ❌ ${name}: ${err.message}`);
  }
}

function expect(actual) {
  return {
    toBe: (expected) => {
      if (actual !== expected) throw new Error(`Expected ${expected} but got ${actual}`);
    },
    toEqual: (expected) => {
      if (JSON.stringify(actual) !== JSON.stringify(expected))
        throw new Error(`Deep equality failed`);
    },
    toBeTruthy: () => {
      if (!actual) throw new Error(`Expected truthy but got ${actual}`);
    },
    toBeFalsy: () => {
      if (actual) throw new Error(`Expected falsy but got ${actual}`);
    },
    toBeInstanceOf: (cls) => {
      if (!(actual instanceof cls)) throw new Error(`Expected instance of ${cls.name}`);
    },
    toHaveProperty: (prop) => {
      if (!(prop in actual)) throw new Error(`Missing property ${prop}`);
    },
    toBeGreaterThan: (n) => {
      if (actual <= n) throw new Error(`Expected ${actual} > ${n}`);
    },
    toBeGreaterThanOrEqual: (n) => {
      if (actual < n) throw new Error(`Expected ${actual} >= ${n}`);
    },
    toBeLessThan: (n) => {
      if (actual >= n) throw new Error(`Expected ${actual} < ${n}`);
    },
    toBeLessThanOrEqual: (n) => {
      if (actual > n) throw new Error(`Expected ${actual} <= ${n}`);
    },
    toContain: (item) => {
      if (!actual.includes(item)) throw new Error(`Expected to contain ${item}`);
    },
    toHaveLength: (len) => {
      if (actual.length !== len) throw new Error(`Expected length ${len} but got ${actual.length}`);
    },
    toBeDefined: () => {
      if (actual === undefined) throw new Error(`Expected defined but got undefined`);
    },
    toBeNull: () => {
      if (actual !== null) throw new Error(`Expected null but got ${actual}`);
    },
    toBeCloseTo: (expected, precision = 2) => {
      const diff = Math.abs(actual - expected);
      const tolerance = Math.pow(10, -precision) / 2;
      if (diff > tolerance) throw new Error(`Expected ${actual} to be close to ${expected}`);
    },
    not: {
      toBe: (expected) => {
        if (actual === expected) throw new Error(`Expected ${actual} to not equal ${expected}`);
      },
      toEqual: (expected) => {
        if (JSON.stringify(actual) === JSON.stringify(expected))
          throw new Error(`Expected values to differ`);
      },
    },
  };
}

console.log('═══════════════════════════════════════════════════════════════════════════════');
console.log('🧪 PHASE 2 STEPS 29-34 - UNIT TESTS');
console.log('   Look-Ahead, Knowledge Distillation, Genetic, Mutations, Decisions, Meta');
console.log('═══════════════════════════════════════════════════════════════════════════════');

// Step 29: Look-Ahead Engine
const {
  StateNode,
  MCTS,
  MinimaxEngine,
  LookAheadEngine,
  createEngine: createLookAhead,
  createMCTS,
  createMinimax,
} = require('../../chronos/look-ahead');

// Step 30: Knowledge Distillation
const {
  KnowledgeExtractor,
  DistillationLoss,
  KnowledgeDistiller,
  KnowledgeType,
  DistillationMode,
  createDistiller,
  createExtractor,
} = require('../../knowledge/distillation');

// Step 31: Genetic Evolution
const {
  Genome,
  SelectionOperator,
  CrossoverOperator,
  GeneticAlgorithm,
  SelectionMethod,
  CrossoverMethod,
  createGA,
  createGenome,
} = require('../../evolution/genetic');

// Step 32: Mutation Engine
const {
  BasicMutations,
  RealMutations,
  AdaptiveMutation,
  MutationEngine,
  MutationType,
  createEngine: createMutationEngine,
  bitFlip,
  swap,
  gaussian,
} = require('../../evolution/mutations');

// Step 33: Autonomous Decisions
const {
  Option,
  DecisionMaker,
  AutonomousDecisionEngine,
  DecisionStrategy,
  DecisionPriority,
  createEngine: createDecisionEngine,
  createDecisionMaker,
} = require('../../autonomous/decisions');

// Step 34: Meta-Learning
const {
  TaskDistribution,
  MAML,
  Reptile,
  MetaLearningEngine,
  MetaStrategy,
  TaskType,
  createEngine: createMetaEngine,
  createMAML,
  createReptile,
  createTaskDistribution,
} = require('../../meta/learning');

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 29: LOOK-AHEAD ENGINE TESTS
// ═══════════════════════════════════════════════════════════════════════════════

    // Complexity: O(N)
describe('Step 29: StateNode', () => {
  // Complexity: O(1)
  test('should create state node with initial values', () => {
    const node = new StateNode({ x: 0, y: 0 });
    // Complexity: O(1)
    expect(node.state).toBeDefined();
    // Complexity: O(1)
    expect(node.state.x).toBe(0);
    // Complexity: O(1)
    expect(node.children).toBeInstanceOf(Array);
    // Complexity: O(1)
    expect(node.children.length).toBe(0);
    // Complexity: O(1)
    expect(node.visits).toBe(0);
    // Complexity: O(1)
    expect(node.value).toBe(0);
    // Complexity: O(1)
    expect(node.depth).toBe(0);
  });

  // Complexity: O(1)
  test('should create node with action and parent', () => {
    const parent = new StateNode({ pos: 0 });
    const child = new StateNode({ pos: 1 }, 'move', parent);
    // Complexity: O(1)
    expect(child.action).toBe('move');
    // Complexity: O(1)
    expect(child.parent).toBe(parent);
    // Complexity: O(1)
    expect(child.depth).toBe(1);
  });

  // Complexity: O(1)
  test('should add child nodes', () => {
    const root = new StateNode({ val: 0 });
    const child = root.addChild({ val: 1 }, 'increment');
    // Complexity: O(1)
    expect(root.children.length).toBe(1);
    // Complexity: O(1)
    expect(child.parent).toBe(root);
    // Complexity: O(1)
    expect(child.action).toBe('increment');
  });

  // Complexity: O(1)
  test('should calculate UCB1 correctly', () => {
    const root = new StateNode({});
    root.visits = 100;
    const child = root.addChild({}, 'act');
    child.visits = 10;
    child.value = 5;

    const ucb = child.getUCB1();
    // Complexity: O(N)
    expect(typeof ucb).toBe('number');
    // Complexity: O(N)
    expect(ucb).toBeGreaterThan(0);
  });

  // Complexity: O(N)
  test('should return Infinity for unvisited nodes', () => {
    const root = new StateNode({});
    const child = root.addChild({}, 'act');
    // Complexity: O(1)
    expect(child.getUCB1()).toBe(Infinity);
  });

  // Complexity: O(1)
  test('should detect leaf nodes', () => {
    const node = new StateNode({});
    // Complexity: O(1)
    expect(node.isLeaf()).toBe(true);
    node.addChild({}, 'a');
    // Complexity: O(1)
    expect(node.isLeaf()).toBe(false);
  });

  // Complexity: O(1)
  test('should get path from root', () => {
    const root = new StateNode({ level: 0 });
    const child1 = root.addChild({ level: 1 }, 'a');
    const child2 = child1.addChild({ level: 2 }, 'b');

    const path = child2.getPath();
    // Complexity: O(1)
    expect(path.length).toBe(2);
    // Complexity: O(1)
    expect(path[0].action).toBe('a');
    // Complexity: O(1)
    expect(path[1].action).toBe('b');
  });
});

    // Complexity: O(N)
describe('Step 29: MCTS', () => {
  // Complexity: O(1)
  test('should create MCTS with default options', () => {
    const mcts = new MCTS();
    // Complexity: O(1)
    expect(mcts.options.simulations).toBe(1000);
    // Complexity: O(1)
    expect(mcts.options.maxDepth).toBe(50);
  });

  // Complexity: O(1)
  test('should create MCTS with custom options', () => {
    const mcts = new MCTS({ simulations: 500, maxDepth: 20 });
    // Complexity: O(N)
    expect(mcts.options.simulations).toBe(500);
    // Complexity: O(N)
    expect(mcts.options.maxDepth).toBe(20);
  });

  // Complexity: O(N)
  test('should search for best action', () => {
    const mcts = new MCTS({ simulations: 50 });

    const getActions = (state) => (state < 10 ? ['inc', 'stay'] : []);
    const transition = (state, action) => (action === 'inc' ? state + 1 : state);
    const evaluate = (state) => state;
    const isTerminal = (state) => state >= 10;

    const result = mcts.search(0, getActions, transition, evaluate, isTerminal);
    // Complexity: O(1)
    expect(result.action).toBeDefined();
    // Complexity: O(1)
    expect(typeof result.value).toBe('number');
  });

  // Complexity: O(1)
  test('should use factory function', () => {
    const mcts = createMCTS({ simulations: 100 });
    // Complexity: O(1)
    expect(mcts).toBeInstanceOf(MCTS);
  });

  // Complexity: O(1)
  test('should emit progress events', () => {
    const mcts = new MCTS({ simulations: 200 });
    let progressEmitted = false;

    mcts.on('progress', () => {
      progressEmitted = true;
    });

    const getActions = (s) => (s < 5 ? ['a'] : []);
    const transition = (s, a) => s + 1;
    const evaluate = (s) => s;
    const isTerminal = (s) => s >= 5;

    mcts.search(0, getActions, transition, evaluate, isTerminal);
    // Complexity: O(1)
    expect(progressEmitted).toBe(true);
  });
});

    // Complexity: O(N)
describe('Step 29: MinimaxEngine', () => {
  // Complexity: O(1)
  test('should create minimax with default options', () => {
    const minimax = new MinimaxEngine();
    // Complexity: O(1)
    expect(minimax.options.maxDepth).toBe(10);
    // Complexity: O(1)
    expect(minimax.nodesExplored).toBe(0);
  });

  // Complexity: O(1)
  test('should create minimax with custom depth', () => {
    const minimax = new MinimaxEngine({ maxDepth: 5 });
    // Complexity: O(N)
    expect(minimax.options.maxDepth).toBe(5);
  });

  // Complexity: O(N)
  test('should search for best action', () => {
    const minimax = new MinimaxEngine({ maxDepth: 3 });

    const getActions = (state) => (state.depth < 3 ? [0, 1] : []);
    const transition = (state, action) => ({ depth: state.depth + 1, val: state.val + action });
    const evaluate = (state) => state.val;
    const isTerminal = (state) => state.depth >= 3;

    const result = minimax.search(
      { depth: 0, val: 0 },
      getActions,
      transition,
      evaluate,
      isTerminal,
      true
    );

    // Complexity: O(1)
    expect(result.value).toBeDefined();
  });

  // Complexity: O(1)
  test('should use factory function', () => {
    const minimax = createMinimax({ maxDepth: 8 });
    // Complexity: O(1)
    expect(minimax).toBeInstanceOf(MinimaxEngine);
  });

  // Complexity: O(1)
  test('should emit complete event', () => {
    const minimax = new MinimaxEngine({ maxDepth: 2 });
    let completed = false;

    minimax.on('complete', () => {
      completed = true;
    });

    minimax.search(
      { d: 0 },
      (s) => (s.d < 2 ? [1] : []),
      (s, a) => ({ d: s.d + 1 }),
      (s) => s.d,
      (s) => s.d >= 2
    );

    // Complexity: O(1)
    expect(completed).toBe(true);
  });
});

    // Complexity: O(1)
describe('Step 29: LookAheadEngine', () => {
  // Complexity: O(1)
  test('should create engine with default options', () => {
    const engine = new LookAheadEngine();
    // Complexity: O(1)
    expect(engine.options.nSteps).toBeDefined();
  });

  // Complexity: O(1)
  test('should use factory function', () => {
    const engine = createLookAhead({ nSteps: 5 });
    // Complexity: O(1)
    expect(engine).toBeInstanceOf(LookAheadEngine);
  });

  // Complexity: O(1)
  test('should clear cache', () => {
    const engine = new LookAheadEngine();
    engine.clearCache();
    // Complexity: O(1)
    expect(engine.cache.size).toBe(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 30: KNOWLEDGE DISTILLATION TESTS
// ═══════════════════════════════════════════════════════════════════════════════

    // Complexity: O(N) — linear scan
describe('Step 30: KnowledgeExtractor', () => {
  // Complexity: O(1)
  test('should create extractor with default options', () => {
    const extractor = new KnowledgeExtractor();
    // Complexity: O(1)
    expect(extractor.options.temperature).toBe(3.0);
    // Complexity: O(1)
    expect(extractor.extractedKnowledge).toBeInstanceOf(Array);
  });

  // Complexity: O(1)
  test('should create extractor with custom temperature', () => {
    const extractor = new KnowledgeExtractor({ temperature: 5.0 });
    // Complexity: O(1)
    expect(extractor.options.temperature).toBe(5.0);
  });

  // Complexity: O(N) — linear scan
  test('should extract soft labels from logits', () => {
    const extractor = new KnowledgeExtractor();
    const logits = [2.0, 1.0, 0.1];

    const result = extractor.extractSoftLabels(logits);
    // Complexity: O(1)
    expect(result.type).toBe(KnowledgeType.SOFT_LABELS);
    // Complexity: O(1)
    expect(result.data).toBeInstanceOf(Array);
    // Complexity: O(1)
    expect(result.data.length).toBe(3);

    // Sum should be close to 1
    const sum = result.data.reduce((a, b) => a + b, 0);
    // Complexity: O(1)
    expect(Math.abs(sum - 1)).toBeLessThan(0.001);
  });

  // Complexity: O(1)
  test('should extract feature maps', () => {
    const extractor = new KnowledgeExtractor();
    const activations = [1.0, 2.0, 3.0, 4.0, 5.0];

    const result = extractor.extractFeatureMaps(activations);
    // Complexity: O(1)
    expect(result.type).toBe(KnowledgeType.FEATURE_MAPS);
    // Complexity: O(1)
    expect(result.data).toBeInstanceOf(Array);
  });

  // Complexity: O(1)
  test('should extract attention patterns', () => {
    const extractor = new KnowledgeExtractor();
    const attention = [
      [0.1, 0.2, 0.7],
      [0.3, 0.3, 0.4],
    ];

    const result = extractor.extractAttention(attention);
    // Complexity: O(1)
    expect(result.type).toBe(KnowledgeType.ATTENTION);
    // Complexity: O(1)
    expect(result.heads).toBe(2);
  });

  // Complexity: O(1)
  test('should use factory function', () => {
    const extractor = createExtractor({ temperature: 2.0 });
    // Complexity: O(1)
    expect(extractor).toBeInstanceOf(KnowledgeExtractor);
  });

  // Complexity: O(1)
  test('should extract all knowledge types', () => {
    const extractor = new KnowledgeExtractor({
      extractionTypes: [KnowledgeType.SOFT_LABELS, KnowledgeType.EMBEDDINGS],
    });

    const teacherOutput = {
      logits: [1, 2, 3],
      embeddings: [0.1, 0.2, 0.3],
    };

    const knowledge = extractor.extract(teacherOutput);
    // Complexity: O(1)
    expect(knowledge.softLabels).toBeDefined();
    // Complexity: O(1)
    expect(knowledge.embeddings).toBeDefined();
  });
});

    // Complexity: O(1)
describe('Step 30: DistillationLoss', () => {
  // Complexity: O(1)
  test('should calculate KL divergence', () => {
    const studentProbs = [0.3, 0.3, 0.4];
    const teacherProbs = [0.2, 0.3, 0.5];

    const loss = DistillationLoss.klDivergence(studentProbs, teacherProbs);
    // Complexity: O(1)
    expect(typeof loss).toBe('number');
    // Complexity: O(1)
    expect(loss).toBeGreaterThanOrEqual(0);
  });

  // Complexity: O(1)
  test('should calculate MSE loss', () => {
    const student = [1, 2, 3];
    const teacher = [1.1, 2.2, 3.3];

    const loss = DistillationLoss.mse(student, teacher);
    // Complexity: O(1)
    expect(typeof loss).toBe('number');
    // Complexity: O(1)
    expect(loss).toBeGreaterThan(0);
  });

  // Complexity: O(1)
  test('should calculate cosine similarity loss', () => {
    const vec1 = [1, 0, 0];
    const vec2 = [0, 1, 0];

    const loss = DistillationLoss.cosineSimilarity(vec1, vec2);
    // Complexity: O(1)
    expect(typeof loss).toBe('number');
    // Orthogonal vectors should have similarity near 0, loss near 1
    // Complexity: O(1)
    expect(loss).toBeCloseTo(1, 1);
  });

  // Complexity: O(1)
  test('should calculate combined loss', () => {
    const studentOutput = { logits: [1, 2, 3] };
    const teacherKnowledge = {
      softLabels: { data: [0.2, 0.3, 0.5] },
    };

    const result = DistillationLoss.combined(studentOutput, teacherKnowledge);
    // Complexity: O(1)
    expect(result.total).toBeDefined();
    // Complexity: O(1)
    expect(result.components).toBeDefined();
  });
});

    // Complexity: O(1)
describe('Step 30: KnowledgeDistiller', () => {
  // Complexity: O(1)
  test('should create distiller with default options', () => {
    const distiller = new KnowledgeDistiller();
    // Complexity: O(1)
    expect(distiller.options.mode).toBe(DistillationMode.OFFLINE);
    // Complexity: O(1)
    expect(distiller.options.temperature).toBe(3.0);
    // Complexity: O(1)
    expect(distiller.options.alpha).toBe(0.5);
  });

  // Complexity: O(1)
  test('should create distiller with custom options', () => {
    const distiller = new KnowledgeDistiller({
      mode: DistillationMode.ONLINE,
      temperature: 4.0,
    });
    // Complexity: O(1)
    expect(distiller.options.mode).toBe(DistillationMode.ONLINE);
    // Complexity: O(1)
    expect(distiller.options.temperature).toBe(4.0);
  });

  // Complexity: O(1)
  test('should use factory function', () => {
    const distiller = createDistiller({ alpha: 0.7 });
    // Complexity: O(1)
    expect(distiller).toBeInstanceOf(KnowledgeDistiller);
  });

  // Complexity: O(1)
  test('should have extractor', () => {
    const distiller = new KnowledgeDistiller();
    // Complexity: O(1)
    expect(distiller.extractor).toBeInstanceOf(KnowledgeExtractor);
  });

  // Complexity: O(1)
  test('should verify knowledge types enum', () => {
    // Complexity: O(1)
    expect(KnowledgeType.SOFT_LABELS).toBe('soft_labels');
    // Complexity: O(1)
    expect(KnowledgeType.FEATURE_MAPS).toBe('feature_maps');
    // Complexity: O(1)
    expect(KnowledgeType.ATTENTION).toBe('attention');
    // Complexity: O(1)
    expect(KnowledgeType.LOGITS).toBe('logits');
    // Complexity: O(1)
    expect(KnowledgeType.EMBEDDINGS).toBe('embeddings');
  });

  // Complexity: O(1)
  test('should verify distillation modes', () => {
    // Complexity: O(1)
    expect(DistillationMode.OFFLINE).toBe('offline');
    // Complexity: O(1)
    expect(DistillationMode.ONLINE).toBe('online');
    // Complexity: O(1)
    expect(DistillationMode.SELF).toBe('self');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 31: GENETIC EVOLUTION TESTS
// ═══════════════════════════════════════════════════════════════════════════════

    // Complexity: O(1) — lookup
describe('Step 31: Genome', () => {
  // Complexity: O(1)
  test('should create genome with genes', () => {
    const genome = new Genome([1, 2, 3, 4, 5]);
    // Complexity: O(1)
    expect(genome.genes).toEqual([1, 2, 3, 4, 5]);
    // Complexity: O(1)
    expect(genome.fitness).toBeNull();
    // Complexity: O(1)
    expect(genome.length).toBe(5);
  });

  // Complexity: O(1)
  test('should create genome with fitness', () => {
    const genome = new Genome([1, 2], 0.8);
    // Complexity: O(1)
    expect(genome.fitness).toBe(0.8);
  });

  // Complexity: O(1)
  test('should create random genome', () => {
    const genome = Genome.random(10, () => Math.random());
    // Complexity: O(1)
    expect(genome.length).toBe(10);
    // Complexity: O(1)
    expect(genome.genes.every((g) => typeof g === 'number')).toBe(true);
  });

  // Complexity: O(1)
  test('should clone genome', () => {
    const original = new Genome([1, 2, 3], 0.5);
    original.age = 5;

    const clone = original.clone();
    // Complexity: O(1)
    expect(clone.genes).toEqual(original.genes);
    // Complexity: O(1)
    expect(clone.fitness).toBe(original.fitness);
    // Complexity: O(1)
    expect(clone.age).toBe(original.age);
    // Complexity: O(1)
    expect(clone.id).not.toBe(original.id);
  });

  // Complexity: O(1) — lookup
  test('should get gene at index', () => {
    const genome = new Genome([10, 20, 30]);
    // Complexity: O(1)
    expect(genome.get(0)).toBe(10);
    // Complexity: O(1)
    expect(genome.get(1)).toBe(20);
    // Complexity: O(1)
    expect(genome.get(2)).toBe(30);
  });

  // Complexity: O(1) — lookup
  test('should set gene and invalidate fitness', () => {
    const genome = new Genome([1, 2, 3], 0.9);
    genome.set(1, 99);
    // Complexity: O(1)
    expect(genome.get(1)).toBe(99);
    // Complexity: O(1)
    expect(genome.fitness).toBeNull();
  });

  // Complexity: O(1)
  test('should use factory function', () => {
    const genome = createGenome([1, 2, 3], 0.5);
    // Complexity: O(1)
    expect(genome).toBeInstanceOf(Genome);
  });
});

    // Complexity: O(N) — linear scan
describe('Step 31: SelectionOperator', () => {
  const createPopulation = () =>
    [new Genome([1], 0.9), new Genome([2], 0.5), new Genome([3], 0.3), new Genome([4], 0.1)].map(
      (g) => {
        g.fitness = g.genes[0] / 10;
        return g;
      }
    );

  // Complexity: O(1)
  test('should perform tournament selection', () => {
    const population = createPopulation();
    const selected = SelectionOperator.tournament(population, 2);
    // Complexity: O(1)
    expect(selected).toBeInstanceOf(Genome);
    // Complexity: O(1)
    expect(population.includes(selected)).toBe(true);
  });

  // Complexity: O(1)
  test('should perform roulette selection', () => {
    const population = createPopulation();
    const selected = SelectionOperator.roulette(population);
    // Complexity: O(1)
    expect(selected).toBeInstanceOf(Genome);
  });

  // Complexity: O(1)
  test('should perform rank selection', () => {
    const population = createPopulation();
    const selected = SelectionOperator.rank(population);
    // Complexity: O(1)
    expect(selected).toBeInstanceOf(Genome);
  });

  // Complexity: O(1)
  test('should perform truncation selection', () => {
    const population = createPopulation();
    const selected = SelectionOperator.truncation(population, 0.5);
    // Complexity: O(1)
    expect(selected).toBeInstanceOf(Genome);
  });

  // Complexity: O(1)
  test('should verify selection methods enum', () => {
    // Complexity: O(1)
    expect(SelectionMethod.TOURNAMENT).toBe('tournament');
    // Complexity: O(1)
    expect(SelectionMethod.ROULETTE).toBe('roulette');
    // Complexity: O(1)
    expect(SelectionMethod.RANK).toBe('rank');
    // Complexity: O(1)
    expect(SelectionMethod.ELITISM).toBe('elitism');
  });
});

    // Complexity: O(1)
describe('Step 31: CrossoverOperator', () => {
  // Complexity: O(1)
  test('should perform single point crossover', () => {
    const p1 = new Genome([1, 1, 1, 1]);
    const p2 = new Genome([2, 2, 2, 2]);

    const [c1, c2] = CrossoverOperator.singlePoint(p1, p2);
    // Complexity: O(1)
    expect(c1.length).toBe(4);
    // Complexity: O(1)
    expect(c2.length).toBe(4);
  });

  // Complexity: O(1)
  test('should perform two point crossover', () => {
    const p1 = new Genome([1, 1, 1, 1, 1]);
    const p2 = new Genome([2, 2, 2, 2, 2]);

    const [c1, c2] = CrossoverOperator.twoPoint(p1, p2);
    // Complexity: O(1)
    expect(c1.length).toBe(5);
    // Complexity: O(1)
    expect(c2.length).toBe(5);
  });

  // Complexity: O(1)
  test('should perform uniform crossover', () => {
    const p1 = new Genome([1, 1, 1, 1]);
    const p2 = new Genome([2, 2, 2, 2]);

    const [c1, c2] = CrossoverOperator.uniform(p1, p2);
    // Complexity: O(1)
    expect(c1.length).toBe(4);
    // Complexity: O(1)
    expect(c2.length).toBe(4);
  });

  // Complexity: O(1)
  test('should perform arithmetic crossover', () => {
    const p1 = new Genome([0, 0, 0]);
    const p2 = new Genome([10, 10, 10]);

    const [c1, c2] = CrossoverOperator.arithmetic(p1, p2, 0.5);
    // With alpha=0.5, children should have values around 5
    // Complexity: O(1)
    expect(c1.genes[0]).toBeCloseTo(5, 1);
  });

  // Complexity: O(1)
  test('should perform SBX crossover', () => {
    const p1 = new Genome([1, 2, 3]);
    const p2 = new Genome([4, 5, 6]);

    const [c1, c2] = CrossoverOperator.sbx(p1, p2);
    // Complexity: O(1)
    expect(c1.length).toBe(3);
    // Complexity: O(1)
    expect(c2.length).toBe(3);
  });

  // Complexity: O(1)
  test('should verify crossover methods enum', () => {
    // Complexity: O(1)
    expect(CrossoverMethod.SINGLE_POINT).toBe('single_point');
    // Complexity: O(1)
    expect(CrossoverMethod.TWO_POINT).toBe('two_point');
    // Complexity: O(1)
    expect(CrossoverMethod.UNIFORM).toBe('uniform');
    // Complexity: O(1)
    expect(CrossoverMethod.SBX).toBe('sbx');
  });
});

    // Complexity: O(N) — linear scan
describe('Step 31: GeneticAlgorithm', () => {
  // Complexity: O(1)
  test('should create GA with default options', () => {
    const ga = new GeneticAlgorithm();
    // Complexity: O(1)
    expect(ga.population).toBeInstanceOf(Array);
    // Complexity: O(1)
    expect(ga.generation).toBe(0);
  });

  // Complexity: O(1)
  test('should use factory function', () => {
    const ga = createGA({ populationSize: 20 });
    // Complexity: O(1)
    expect(ga).toBeInstanceOf(GeneticAlgorithm);
  });

  // Complexity: O(1)
  test('should initialize population', () => {
    const ga = new GeneticAlgorithm({ populationSize: 10 });
    ga.initialize(5, () => Math.random());
    // Complexity: O(1)
    expect(ga.population.length).toBe(10);
    // Complexity: O(1)
    expect(ga.population[0].length).toBe(5);
  });

  // Complexity: O(N) — linear scan
  test('should get statistics', () => {
    const ga = new GeneticAlgorithm({ populationSize: 5 });
    ga.initialize(3, () => Math.random());
    ga.population.forEach((g, i) => (g.fitness = i));

    const stats = ga.getStatistics();
    // Complexity: O(1)
    expect(stats.generation).toBe(0);
    // Complexity: O(1)
    expect(stats.best).toBeDefined();
    // Complexity: O(1)
    expect(stats.worst).toBeDefined();
    // Complexity: O(1)
    expect(stats.average).toBeDefined();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 32: MUTATION ENGINE TESTS
// ═══════════════════════════════════════════════════════════════════════════════

    // Complexity: O(N) — linear scan
describe('Step 32: BasicMutations', () => {
  // Complexity: O(N) — linear scan
  test('should perform bit flip mutation', () => {
    const genome = new Genome([0, 0, 0, 0, 0]);
    BasicMutations.bitFlip(genome, 1.0); // 100% rate
    // At least some should flip
    const sum = genome.genes.reduce((a, b) => a + b, 0);
    // Complexity: O(1)
    expect(sum).toBeGreaterThan(0);
    // Complexity: O(1)
    expect(genome.fitness).toBeNull();
  });

  // Complexity: O(1)
  test('should perform swap mutation', () => {
    const genome = new Genome([1, 2, 3, 4, 5]);
    BasicMutations.swap(genome, 1.0);
    // Complexity: O(1)
    expect(genome.fitness).toBeNull();
  });

  // Complexity: O(1)
  test('should perform inversion mutation', () => {
    const genome = new Genome([1, 2, 3, 4, 5]);
    BasicMutations.inversion(genome, 1.0);
    // Complexity: O(1)
    expect(genome.fitness).toBeNull();
  });

  // Complexity: O(1)
  test('should perform scramble mutation', () => {
    const genome = new Genome([1, 2, 3, 4, 5]);
    BasicMutations.scramble(genome, 1.0);
    // Complexity: O(1)
    expect(genome.fitness).toBeNull();
  });

  // Complexity: O(1)
  test('should use exported shortcuts', () => {
    const genome1 = new Genome([0, 0, 0, 0]);
    // Complexity: O(1)
    bitFlip(genome1, 1.0);

    const genome2 = new Genome([1, 2, 3, 4]);
    // Complexity: O(1)
    swap(genome2, 1.0);

    // Complexity: O(1)
    expect(genome1.fitness).toBeNull();
    // Complexity: O(1)
    expect(genome2.fitness).toBeNull();
  });
});

    // Complexity: O(1)
describe('Step 32: RealMutations', () => {
  // Complexity: O(1)
  test('should perform gaussian mutation', () => {
    const genome = new Genome([0, 0, 0, 0, 0]);
    RealMutations.gaussian(genome, 1.0, 0.5);
    // Some values should have changed
    // Complexity: O(1)
    expect(genome.genes.some((g) => g !== 0)).toBe(true);
    // Complexity: O(1)
    expect(genome.fitness).toBeNull();
  });

  // Complexity: O(1)
  test('should perform uniform mutation', () => {
    const genome = new Genome([0, 0, 0, 0, 0]);
    RealMutations.uniform(genome, 1.0, 0, 1);
    // Complexity: O(1)
    expect(genome.genes.every((g) => g >= 0 && g <= 1)).toBe(true);
  });

  // Complexity: O(1)
  test('should perform polynomial mutation', () => {
    const genome = new Genome([0.5, 0.5, 0.5]);
    RealMutations.polynomial(genome, 1.0, 20, 0, 1);
    // Complexity: O(1)
    expect(genome.genes.every((g) => g >= 0 && g <= 1)).toBe(true);
  });

  // Complexity: O(1)
  test('should perform creep mutation', () => {
    const genome = new Genome([0.5, 0.5, 0.5]);
    const original = [...genome.genes];
    RealMutations.creep(genome, 1.0, 0.1);
    // Values should have changed slightly
    // Complexity: O(1)
    expect(genome.genes.some((g, i) => g !== original[i])).toBe(true);
  });

  // Complexity: O(1)
  test('should use exported shortcuts', () => {
    const genome = new Genome([0, 0, 0]);
    // Complexity: O(1)
    gaussian(genome, 1.0, 0.1);
    // Complexity: O(1)
    expect(genome.fitness).toBeNull();
  });
});

    // Complexity: O(N) — loop
describe('Step 32: AdaptiveMutation', () => {
  // Complexity: O(1)
  test('should create with default options', () => {
    const am = new AdaptiveMutation();
    // Complexity: O(1)
    expect(am.rate).toBe(0.1);
    // Complexity: O(1)
    expect(am.options.minRate).toBe(0.001);
    // Complexity: O(1)
    expect(am.options.maxRate).toBe(0.5);
  });

  // Complexity: O(1)
  test('should create with custom options', () => {
    const am = new AdaptiveMutation({ initialRate: 0.2 });
    // Complexity: O(1)
    expect(am.rate).toBe(0.2);
  });

  // Complexity: O(1)
  test('should apply mutation', () => {
    const am = new AdaptiveMutation();
    const genome = new Genome([0, 0, 0, 0, 0]);
    am.mutate(genome);
    // Complexity: O(1)
    expect(genome.fitness).toBeNull();
  });

  // Complexity: O(1)
  test('should track success count', () => {
    const am = new AdaptiveMutation();
    const genome = new Genome([1, 2, 3]);
    am.mutate(genome, true);
    // Complexity: O(1)
    expect(am.successCount).toBe(1);
    // Complexity: O(1)
    expect(am.totalCount).toBe(1);
  });

  // Complexity: O(N) — loop
  test('should adapt rate after threshold', () => {
    const am = new AdaptiveMutation({ initialRate: 0.1 });
    const genome = new Genome([1, 2, 3]);

    // Apply 10 mutations with high success rate
    for (let i = 0; i < 10; i++) {
      am.mutate(genome, true);
    }

    // Rate should have increased
    // Complexity: O(1)
    expect(am.history.length).toBeGreaterThan(0);
  });
});

    // Complexity: O(1)
describe('Step 32: MutationEngine', () => {
  // Complexity: O(1)
  test('should create engine with default options', () => {
    const engine = new MutationEngine();
    // Complexity: O(1)
    expect(engine.options.rate).toBeDefined();
  });

  // Complexity: O(1)
  test('should use factory function', () => {
    const engine = createMutationEngine({ rate: 0.2 });
    // Complexity: O(1)
    expect(engine).toBeInstanceOf(MutationEngine);
  });

  // Complexity: O(1)
  test('should verify mutation types enum', () => {
    // Complexity: O(1)
    expect(MutationType.BIT_FLIP).toBe('bit_flip');
    // Complexity: O(1)
    expect(MutationType.SWAP).toBe('swap');
    // Complexity: O(1)
    expect(MutationType.GAUSSIAN).toBe('gaussian');
    // Complexity: O(1)
    expect(MutationType.ADAPTIVE).toBe('adaptive');
  });

  // Complexity: O(1)
  test('should get mutation operator', () => {
    const engine = new MutationEngine();
    const operator = engine.getOperator();
    // Complexity: O(1)
    expect(typeof operator).toBe('function');
  });

  // Complexity: O(1)
  test('should get stats', () => {
    const engine = new MutationEngine();
    const stats = engine.getStats();
    // Complexity: O(1)
    expect(stats).toBeDefined();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 33: AUTONOMOUS DECISIONS TESTS
// ═══════════════════════════════════════════════════════════════════════════════

    // Complexity: O(N)
describe('Step 33: Option', () => {
  // Complexity: O(1)
  test('should create option with id and name', () => {
    const option = new Option('opt1', 'Option One');
    // Complexity: O(1)
    expect(option.id).toBe('opt1');
    // Complexity: O(1)
    expect(option.name).toBe('Option One');
    // Complexity: O(1)
    expect(option.trials).toBe(0);
    // Complexity: O(1)
    expect(option.successes).toBe(0);
  });

  // Complexity: O(1)
  test('should create option with metadata', () => {
    const option = new Option('opt1', 'Test', { category: 'test' });
    // Complexity: O(1)
    expect(option.metadata.category).toBe('test');
  });

  // Complexity: O(1)
  test('should record outcome', () => {
    const option = new Option('opt1', 'Test');
    option.record(10, true);
    // Complexity: O(1)
    expect(option.trials).toBe(1);
    // Complexity: O(1)
    expect(option.successes).toBe(1);
    // Complexity: O(1)
    expect(option.totalReward).toBe(10);
  });

  // Complexity: O(1)
  test('should calculate average reward', () => {
    const option = new Option('opt1', 'Test');
    option.record(10);
    option.record(20);
    // Complexity: O(1)
    expect(option.getAverageReward()).toBe(15);
  });

  // Complexity: O(1)
  test('should calculate success rate', () => {
    const option = new Option('opt1', 'Test');
    option.record(1, true);
    option.record(1, false);
    option.record(1, true);
    // Complexity: O(1)
    expect(option.getSuccessRate()).toBeCloseTo(0.667, 2);
  });

  // Complexity: O(1)
  test('should sample from beta distribution', () => {
    const option = new Option('opt1', 'Test');
    option.record(1, true);
    const sample = option.sampleBeta();
    // Complexity: O(1)
    expect(typeof sample).toBe('number');
    // Complexity: O(1)
    expect(sample).toBeGreaterThanOrEqual(0);
    // Complexity: O(1)
    expect(sample).toBeLessThanOrEqual(1);
  });

  // Complexity: O(1)
  test('should calculate UCB score', () => {
    const option = new Option('opt1', 'Test');
    option.record(10);
    option.record(20);

    const ucb = option.getUCB(100);
    // Complexity: O(N)
    expect(typeof ucb).toBe('number');
  });

  // Complexity: O(N)
  test('should return Infinity UCB for unvisited', () => {
    const option = new Option('opt1', 'Test');
    // Complexity: O(1)
    expect(option.getUCB(100)).toBe(Infinity);
  });
});

    // Complexity: O(1)
describe('Step 33: DecisionMaker', () => {
  // Complexity: O(1)
  test('should create with default options', () => {
    const dm = new DecisionMaker();
    // Complexity: O(1)
    expect(dm.options.strategy).toBe(DecisionStrategy.UCB);
    // Complexity: O(1)
    expect(dm.totalTrials).toBe(0);
  });

  // Complexity: O(1)
  test('should create with custom strategy', () => {
    const dm = new DecisionMaker({ strategy: DecisionStrategy.GREEDY });
    // Complexity: O(1)
    expect(dm.options.strategy).toBe(DecisionStrategy.GREEDY);
  });

  // Complexity: O(1)
  test('should add options', () => {
    const dm = new DecisionMaker();
    dm.addOption('a', 'Option A');
    dm.addOption('b', 'Option B');
    // Complexity: O(1)
    expect(dm.options_.size).toBe(2);
  });

  // Complexity: O(1)
  test('should remove options', () => {
    const dm = new DecisionMaker();
    dm.addOption('a', 'Option A');
    dm.removeOption('a');
    // Complexity: O(1)
    expect(dm.options_.size).toBe(0);
  });

  // Complexity: O(1)
  test('should select option', () => {
    const dm = new DecisionMaker();
    dm.addOption('a', 'Option A');
    dm.addOption('b', 'Option B');

    const selected = dm.select();
    // Complexity: O(1)
    expect(selected).toBeInstanceOf(Option);
  });

  // Complexity: O(1)
  test('should throw if no options', () => {
    const dm = new DecisionMaker();
    let threw = false;
    try {
      dm.select();
    } catch (e) {
      threw = true;
    }
    // Complexity: O(1)
    expect(threw).toBe(true);
  });

  // Complexity: O(1)
  test('should use factory function', () => {
    const dm = createDecisionMaker({ epsilon: 0.2 });
    // Complexity: O(1)
    expect(dm).toBeInstanceOf(DecisionMaker);
  });

  // Complexity: O(1)
  test('should verify decision strategies', () => {
    // Complexity: O(1)
    expect(DecisionStrategy.GREEDY).toBe('greedy');
    // Complexity: O(1)
    expect(DecisionStrategy.EPSILON_GREEDY).toBe('epsilon_greedy');
    // Complexity: O(1)
    expect(DecisionStrategy.UCB).toBe('ucb');
    // Complexity: O(1)
    expect(DecisionStrategy.THOMPSON).toBe('thompson');
    // Complexity: O(1)
    expect(DecisionStrategy.SOFTMAX).toBe('softmax');
  });

  // Complexity: O(1)
  test('should verify decision priorities', () => {
    // Complexity: O(1)
    expect(DecisionPriority.CRITICAL).toBe(1);
    // Complexity: O(1)
    expect(DecisionPriority.HIGH).toBe(2);
    // Complexity: O(1)
    expect(DecisionPriority.MEDIUM).toBe(3);
    // Complexity: O(1)
    expect(DecisionPriority.LOW).toBe(4);
  });
});

    // Complexity: O(1)
describe('Step 33: AutonomousDecisionEngine', () => {
  // Complexity: O(1)
  test('should create with default options', () => {
    const engine = new AutonomousDecisionEngine();
    // Complexity: O(1)
    expect(engine.decisionMaker).toBeInstanceOf(DecisionMaker);
  });

  // Complexity: O(1)
  test('should use factory function', () => {
    const engine = createDecisionEngine({ confidenceThreshold: 0.9 });
    // Complexity: O(1)
    expect(engine).toBeInstanceOf(AutonomousDecisionEngine);
  });

  // Complexity: O(1)
  test('should get summary', () => {
    const engine = new AutonomousDecisionEngine();
    const summary = engine.getSummary();
    // Complexity: O(1)
    expect(summary.totalDecisions).toBeDefined();
    // Complexity: O(1)
    expect(summary.autonomousCapable).toBeDefined();
  });

  // Complexity: O(1)
  test('should check autonomous capability', () => {
    const engine = new AutonomousDecisionEngine();
    // Complexity: O(1)
    expect(engine.shouldActAutonomously()).toBe(false); // Not enough trials
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 34: META-LEARNING TESTS
// ═══════════════════════════════════════════════════════════════════════════════

    // Complexity: O(1)
describe('Step 34: TaskDistribution', () => {
  // Complexity: O(1)
  test('should create with default options', () => {
    const td = new TaskDistribution();
    // Complexity: O(1)
    expect(td.options.nWay).toBe(5);
    // Complexity: O(1)
    expect(td.options.kShot).toBe(1);
    // Complexity: O(1)
    expect(td.tasks).toBeInstanceOf(Array);
  });

  // Complexity: O(1)
  test('should create with custom options', () => {
    const td = new TaskDistribution({ nWay: 3, kShot: 5 });
    // Complexity: O(1)
    expect(td.options.nWay).toBe(3);
    // Complexity: O(1)
    expect(td.options.kShot).toBe(5);
  });

  // Complexity: O(1)
  test('should create task from data', () => {
    const td = new TaskDistribution({ nWay: 2, kShot: 1 });

    const data = [1, 2, 3, 4, 5, 6];
    const labels = ['a', 'a', 'b', 'b', 'c', 'c'];

    const task = td.createTask(data, labels);
    // Complexity: O(1)
    expect(task.id).toBeDefined();
    // Complexity: O(1)
    expect(task.classes).toBeInstanceOf(Array);
    // Complexity: O(1)
    expect(task.support).toBeInstanceOf(Array);
    // Complexity: O(1)
    expect(task.query).toBeInstanceOf(Array);
  });

  // Complexity: O(1)
  test('should create batch of tasks', () => {
    const td = new TaskDistribution({ nWay: 2, kShot: 1 });

    const data = [1, 2, 3, 4, 5, 6];
    const labels = ['a', 'a', 'b', 'b', 'c', 'c'];

    const batch = td.createBatch(data, labels, 3);
    // Complexity: O(1)
    expect(batch.length).toBe(3);
  });

  // Complexity: O(1)
  test('should use factory function', () => {
    const td = createTaskDistribution({ nWay: 3 });
    // Complexity: O(1)
    expect(td).toBeInstanceOf(TaskDistribution);
  });
});

    // Complexity: O(1)
describe('Step 34: MAML', () => {
  // Complexity: O(1)
  test('should create with default options', () => {
    const maml = new MAML();
    // Complexity: O(1)
    expect(maml.options.innerLR).toBe(0.01);
    // Complexity: O(1)
    expect(maml.options.outerLR).toBe(0.001);
    // Complexity: O(1)
    expect(maml.options.innerSteps).toBe(5);
  });

  // Complexity: O(1)
  test('should create with custom options', () => {
    const maml = new MAML({ innerLR: 0.05, innerSteps: 10 });
    // Complexity: O(1)
    expect(maml.options.innerLR).toBe(0.05);
    // Complexity: O(1)
    expect(maml.options.innerSteps).toBe(10);
  });

  // Complexity: O(1)
  test('should initialize meta-parameters', () => {
    const maml = new MAML();
    maml.initialize([3, 4, 5]);
    // Complexity: O(1)
    expect(maml.metaParameters).toBeDefined();
  });

  // Complexity: O(1)
  test('should use factory function', () => {
    const maml = createMAML({ innerLR: 0.02 });
    // Complexity: O(1)
    expect(maml).toBeInstanceOf(MAML);
  });

  // Complexity: O(1)
  test('should verify meta strategies', () => {
    // Complexity: O(1)
    expect(MetaStrategy.MAML).toBe('maml');
    // Complexity: O(1)
    expect(MetaStrategy.REPTILE).toBe('reptile');
    // Complexity: O(1)
    expect(MetaStrategy.PROTOTYPICAL).toBe('proto');
    // Complexity: O(1)
    expect(MetaStrategy.MATCHING).toBe('matching');
    // Complexity: O(1)
    expect(MetaStrategy.MEMORY).toBe('memory');
  });

  // Complexity: O(1)
  test('should verify task types', () => {
    // Complexity: O(1)
    expect(TaskType.CLASSIFICATION).toBe('classification');
    // Complexity: O(1)
    expect(TaskType.REGRESSION).toBe('regression');
    // Complexity: O(1)
    expect(TaskType.REINFORCEMENT).toBe('reinforcement');
    // Complexity: O(1)
    expect(TaskType.GENERATION).toBe('generation');
  });
});

    // Complexity: O(1)
describe('Step 34: Reptile', () => {
  // Complexity: O(1)
  test('should create with default options', () => {
    const reptile = new Reptile();
    // Complexity: O(1)
    expect(reptile.options.epsilon).toBeDefined();
    // Complexity: O(1)
    expect(reptile.options.innerSteps).toBeDefined();
  });

  // Complexity: O(1)
  test('should create with custom options', () => {
    const reptile = new Reptile({ epsilon: 0.2 });
    // Complexity: O(1)
    expect(reptile.options.epsilon).toBe(0.2);
  });

  // Complexity: O(1)
  test('should initialize parameters', () => {
    const reptile = new Reptile();
    reptile.initialize([2, 3]);
    // Complexity: O(1)
    expect(reptile.parameters).toBeDefined();
  });

  // Complexity: O(1)
  test('should use factory function', () => {
    const reptile = createReptile({ innerSteps: 3 });
    // Complexity: O(1)
    expect(reptile).toBeInstanceOf(Reptile);
  });
});

    // Complexity: O(1)
describe('Step 34: MetaLearningEngine', () => {
  // Complexity: O(1)
  test('should create with default options', () => {
    const engine = new MetaLearningEngine();
    // Complexity: O(1)
    expect(engine.options.strategy).toBeDefined();
    // Complexity: O(1)
    expect(engine.metrics).toBeDefined();
  });

  // Complexity: O(1)
  test('should create with custom strategy', () => {
    const engine = new MetaLearningEngine({ strategy: MetaStrategy.REPTILE });
    // Complexity: O(1)
    expect(engine.options.strategy).toBe(MetaStrategy.REPTILE);
  });

  // Complexity: O(1)
  test('should use factory function', () => {
    const engine = createMetaEngine({ epochs: 50 });
    // Complexity: O(1)
    expect(engine).toBeInstanceOf(MetaLearningEngine);
  });

  // Complexity: O(1)
  test('should get metrics', () => {
    const engine = new MetaLearningEngine();
    const metrics = engine.getMetrics();
    // Complexity: O(1)
    expect(metrics).toBeDefined();
    // Complexity: O(1)
    expect(metrics.avgAdaptTime).toBeDefined();
  });

  // Complexity: O(1)
  test('should track adaptation speed', () => {
    const engine = new MetaLearningEngine();
    // Complexity: O(1)
    expect(engine.metrics.adaptationSpeed).toBeInstanceOf(Array);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// INTEGRATION TESTS
// ═══════════════════════════════════════════════════════════════════════════════

    // Complexity: O(N) — linear scan
describe('Steps 29-34: Integration Tests', () => {
  // Complexity: O(1)
  test('should integrate look-ahead with decisions', () => {
    const mcts = new MCTS({ simulations: 20 });
    const dm = new DecisionMaker();

    dm.addOption('mcts', 'MCTS Search');
    dm.addOption('minimax', 'Minimax Search');

    const selected = dm.select();
    // Complexity: O(1)
    expect(selected).toBeDefined();
  });

  // Complexity: O(N) — loop
  test('should integrate genetic algorithm with mutations', () => {
    const ga = new GeneticAlgorithm({ populationSize: 5 });
    ga.initialize(5, () => Math.random());

    const mutationEngine = new MutationEngine({ type: MutationType.GAUSSIAN });

    for (const genome of ga.population) {
      mutationEngine.mutate(genome);
    }

    // Complexity: O(1)
    expect(ga.population.every((g) => g.fitness === null)).toBe(true);
  });

  // Complexity: O(1)
  test('should integrate knowledge distillation with meta-learning', () => {
    const distiller = new KnowledgeDistiller();
    const metaEngine = new MetaLearningEngine();

    const knowledge = distiller.extractor.extractSoftLabels([1, 2, 3]);
    // Complexity: O(1)
    expect(knowledge.type).toBe(KnowledgeType.SOFT_LABELS);

    const metrics = metaEngine.getMetrics();
    // Complexity: O(1)
    expect(metrics.tasksLearned).toBe(0);
  });

  // Complexity: O(N) — linear scan
  test('should integrate all evolution components', () => {
    // Create genetic algorithm
    const ga = new GeneticAlgorithm({ populationSize: 10 });
    ga.initialize(5, () => Math.random());

    // Create mutation engine
    const mutEngine = new MutationEngine({ type: MutationType.GAUSSIAN });

    // Evaluate population
    ga.population.forEach((g, i) => (g.fitness = g.genes.reduce((a, b) => a + b, 0)));

    // Get statistics
    const stats = ga.getStatistics();
    // Complexity: O(1)
    expect(stats.generation).toBe(0);
    // Complexity: O(1)
    expect(stats.best).toBeGreaterThan(0);

    // Select parents and crossover
    const p1 = SelectionOperator.tournament(ga.population, 3);
    const p2 = SelectionOperator.tournament(ga.population, 3);
    const [c1, c2] = CrossoverOperator.uniform(p1, p2);

    // Mutate children
    mutEngine.mutate(c1);
    mutEngine.mutate(c2);

    // Complexity: O(1)
    expect(c1.fitness).toBeNull();
    // Complexity: O(1)
    expect(c2.fitness).toBeNull();
  });

  // Complexity: O(1) — lookup
  test('should combine decision strategies with UCB exploration', () => {
    const dm = new DecisionMaker({ strategy: DecisionStrategy.UCB });

    dm.addOption('explore', 'Exploration');
    dm.addOption('exploit', 'Exploitation');

    // Simulate some trials
    const opt1 = dm.options_.get('explore');
    const opt2 = dm.options_.get('exploit');

    opt1.record(5);
    opt2.record(10);

    dm.totalTrials = 2;

    const ucb1 = opt1.getUCB(dm.totalTrials);
    const ucb2 = opt2.getUCB(dm.totalTrials);

    // Complexity: O(1)
    expect(ucb2).toBeGreaterThan(ucb1); // Higher reward option
  });

  // Complexity: O(N) — linear scan
  test('should create complete meta-learning pipeline', () => {
    const taskDist = new TaskDistribution({ nWay: 2, kShot: 2 });
    const maml = new MAML({ innerLR: 0.01 });
    const engine = new MetaLearningEngine({ strategy: MetaStrategy.MAML });

    // Generate simple data
    const data = Array(20)
      .fill(0)
      .map((_, i) => i);
    const labels = data.map((d) => (d < 10 ? 'A' : 'B'));

    const task = taskDist.createTask(data, labels);
    // Complexity: O(1)
    expect(task.classes.length).toBe(2);

    const metrics = engine.getMetrics();
    // Complexity: O(1)
    expect(metrics.tasksLearned).toBe(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// RUN TESTS
// ═══════════════════════════════════════════════════════════════════════════════

console.log('\n═══════════════════════════════════════════════════════════════════════════════');
console.log(
  `📊 RESULTS: ${passed} passed, ${failed} failed (${Math.round((passed / (passed + failed)) * 100)}%)`
);
console.log('═══════════════════════════════════════════════════════════════════════════════');

if (errors.length > 0) {
  console.log('\n❌ FAILED TESTS:');
  errors.forEach((e) => console.log(`   - ${e.name}: ${e.error}`));
}

process.exit(failed > 0 ? 1 : 0);
