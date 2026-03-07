/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * PHASE 2 NLU & SHADOW DOM - UNIT TESTS
 * Steps 21, 23: NLU Engine, Shadow DOM Penetration
 * ═══════════════════════════════════════════════════════════════════════════════
 */

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
    toContain: (item) => {
      if (!actual.includes(item)) throw new Error(`Expected to contain ${item}`);
    },
    toHaveLength: (len) => {
      if (actual.length !== len) throw new Error(`Expected length ${len} but got ${actual.length}`);
    },
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOAD MODULES
// ═══════════════════════════════════════════════════════════════════════════════

console.log('═══════════════════════════════════════════════════════════════════════════════');
console.log('🧪 PHASE 2 NLU & SHADOW DOM - UNIT TESTS');
console.log('═══════════════════════════════════════════════════════════════════════════════');

const {
  Tokenizer,
  IntentPattern,
  EntityExtractor,
  NLUEngine,
  IntentCategory,
  EntityType,
  BuiltInIntents,
  createNLU,
  getNLUEngine,
} = require('../../nlu/nlu-engine');

const {
  ShadowPath,
  ShadowDOMNavigator,
  ShadowSelectorBuilder,
  PiercingLocator,
  ShadowDOMInteractor,
  ShadowMode,
  TraversalStrategy,
  createNavigator,
  createInteractor,
  selector,
  getShadowNavigator,
} = require('../../shadow/shadow-dom');

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 21: NLU ENGINE TESTS
// ═══════════════════════════════════════════════════════════════════════════════

    // Complexity: O(1)
describe('Step 21: IntentCategory', () => {
  // Complexity: O(1)
  test('IntentCategory should be defined', () => {
    // Complexity: O(1)
    expect(IntentCategory).toBeTruthy();
  });

  // Complexity: O(1)
  test('IntentCategory should have NAVIGATION', () => {
    // Complexity: O(1)
    expect(IntentCategory.NAVIGATION).toBe('navigation');
  });

  // Complexity: O(1)
  test('IntentCategory should have FORM_INTERACTION', () => {
    // Complexity: O(1)
    expect(IntentCategory.FORM_INTERACTION).toBe('form_interaction');
  });

  // Complexity: O(1)
  test('IntentCategory should have DATA_VALIDATION', () => {
    // Complexity: O(1)
    expect(IntentCategory.DATA_VALIDATION).toBe('data_validation');
  });

  // Complexity: O(1)
  test('IntentCategory should have ASSERTION', () => {
    // Complexity: O(1)
    expect(IntentCategory.ASSERTION).toBe('assertion');
  });

  // Complexity: O(1)
  test('IntentCategory should have API_CALL', () => {
    // Complexity: O(1)
    expect(IntentCategory.API_CALL).toBe('api_call');
  });

  // Complexity: O(1)
  test('IntentCategory should have WAIT', () => {
    // Complexity: O(1)
    expect(IntentCategory.WAIT).toBe('wait');
  });

  // Complexity: O(1)
  test('IntentCategory should have UNKNOWN', () => {
    // Complexity: O(1)
    expect(IntentCategory.UNKNOWN).toBe('unknown');
  });
});

    // Complexity: O(1)
describe('Step 21: EntityType', () => {
  // Complexity: O(1)
  test('EntityType should be defined', () => {
    // Complexity: O(1)
    expect(EntityType).toBeTruthy();
  });

  // Complexity: O(1)
  test('EntityType should have ELEMENT', () => {
    // Complexity: O(1)
    expect(EntityType.ELEMENT).toBe('element');
  });

  // Complexity: O(1)
  test('EntityType should have VALUE', () => {
    // Complexity: O(1)
    expect(EntityType.VALUE).toBe('value');
  });

  // Complexity: O(1)
  test('EntityType should have URL', () => {
    // Complexity: O(1)
    expect(EntityType.URL).toBe('url');
  });

  // Complexity: O(1)
  test('EntityType should have SELECTOR', () => {
    // Complexity: O(1)
    expect(EntityType.SELECTOR).toBe('selector');
  });
});

    // Complexity: O(1)
describe('Step 21: Tokenizer', () => {
  // Complexity: O(1)
  test('Tokenizer should be a class', () => {
    // Complexity: O(1)
    expect(typeof Tokenizer).toBe('function');
  });

  // Complexity: O(1)
  test('Tokenizer should be constructable', () => {
    const tokenizer = new Tokenizer();
    // Complexity: O(1)
    expect(tokenizer).toBeInstanceOf(Tokenizer);
  });

  // Complexity: O(1)
  test('Tokenizer should have tokenize method', () => {
    const tokenizer = new Tokenizer();
    // Complexity: O(1)
    expect(typeof tokenizer.tokenize).toBe('function');
  });

  // Complexity: O(1)
  test('Tokenizer should tokenize text', () => {
    const tokenizer = new Tokenizer();
    const tokens = tokenizer.tokenize('click the button');
    // Complexity: O(1)
    expect(Array.isArray(tokens)).toBe(true);
  });

  // Complexity: O(1)
  test('Tokenizer should lowercase by default', () => {
    const tokenizer = new Tokenizer();
    const tokens = tokenizer.tokenize('CLICK BUTTON');
    // Complexity: O(1)
    expect(tokens[0]).toBe('click');
  });

  // Complexity: O(1)
  test('Tokenizer should remove stopwords by default', () => {
    const tokenizer = new Tokenizer({ removeStopwords: true });
    const tokens = tokenizer.tokenize('click the button');
    // Complexity: O(1)
    expect(tokens.includes('the')).toBe(false);
  });

  // Complexity: O(1)
  test('Tokenizer should have ngrams method', () => {
    const tokenizer = new Tokenizer();
    // Complexity: O(1)
    expect(typeof tokenizer.ngrams).toBe('function');
  });
});

    // Complexity: O(1)
describe('Step 21: IntentPattern', () => {
  // Complexity: O(1)
  test('IntentPattern should be a class', () => {
    // Complexity: O(1)
    expect(typeof IntentPattern).toBe('function');
  });

  // Complexity: O(1)
  test('IntentPattern should be constructable', () => {
    const pattern = new IntentPattern({ name: 'test', category: 'test', patterns: [] });
    // Complexity: O(1)
    expect(pattern).toBeInstanceOf(IntentPattern);
  });

  // Complexity: O(1)
  test('IntentPattern should have match method', () => {
    const pattern = new IntentPattern({ name: 'test', patterns: [] });
    // Complexity: O(1)
    expect(typeof pattern.match).toBe('function');
  });
});

    // Complexity: O(1)
describe('Step 21: EntityExtractor', () => {
  // Complexity: O(1)
  test('EntityExtractor should be a class', () => {
    // Complexity: O(1)
    expect(typeof EntityExtractor).toBe('function');
  });

  // Complexity: O(1)
  test('EntityExtractor should be constructable', () => {
    const extractor = new EntityExtractor();
    // Complexity: O(1)
    expect(extractor).toBeInstanceOf(EntityExtractor);
  });

  // Complexity: O(1)
  test('EntityExtractor should have extract method', () => {
    const extractor = new EntityExtractor();
    // Complexity: O(1)
    expect(typeof extractor.extract).toBe('function');
  });
});

    // Complexity: O(1)
describe('Step 21: NLUEngine', () => {
  // Complexity: O(1)
  test('NLUEngine should be a class', () => {
    // Complexity: O(1)
    expect(typeof NLUEngine).toBe('function');
  });

  // Complexity: O(1)
  test('NLUEngine should be constructable', () => {
    const engine = new NLUEngine();
    // Complexity: O(1)
    expect(engine).toBeInstanceOf(NLUEngine);
  });

  // Complexity: O(1)
  test('NLUEngine should have understand method', () => {
    const engine = new NLUEngine();
    // Complexity: O(1)
    expect(typeof engine.understand).toBe('function');
  });

  // Complexity: O(1)
  test('NLUEngine should have registerIntent method', () => {
    const engine = new NLUEngine();
    // Complexity: O(1)
    expect(typeof engine.registerIntent).toBe('function');
  });

  // Complexity: O(1)
  test('NLUEngine should have tokenizer', () => {
    const engine = new NLUEngine();
    // Complexity: O(1)
    expect(engine.tokenizer).toBeInstanceOf(Tokenizer);
  });

  // Complexity: O(1)
  test('NLUEngine should have entityExtractor', () => {
    const engine = new NLUEngine();
    // Complexity: O(1)
    expect(engine.entityExtractor).toBeInstanceOf(EntityExtractor);
  });

  // Complexity: O(1)
  test('NLUEngine should have getStats method', () => {
    const engine = new NLUEngine();
    // Complexity: O(1)
    expect(typeof engine.getStats).toBe('function');
  });

  // Complexity: O(1)
  test('NLUEngine getStats should return stats object', () => {
    const engine = new NLUEngine();
    const stats = engine.getStats();
    // Complexity: O(1)
    expect(stats).toHaveProperty('processed');
  });
});

    // Complexity: O(1)
describe('Step 21: BuiltInIntents', () => {
  // Complexity: O(1)
  test('BuiltInIntents should be defined', () => {
    // Complexity: O(1)
    expect(BuiltInIntents).toBeTruthy();
  });

  // Complexity: O(1)
  test('BuiltInIntents should be an array', () => {
    // Complexity: O(1)
    expect(Array.isArray(BuiltInIntents)).toBe(true);
  });

  // Complexity: O(1)
  test('BuiltInIntents should have intent patterns', () => {
    // Complexity: O(1)
    expect(BuiltInIntents.length).toBeGreaterThan(0);
  });
});

    // Complexity: O(1)
describe('Step 21: NLU Factory Functions', () => {
  // Complexity: O(1)
  test('createNLU should create NLUEngine', () => {
    const engine = createNLU();
    // Complexity: O(1)
    expect(engine).toBeInstanceOf(NLUEngine);
  });

  // Complexity: O(1)
  test('getNLUEngine should return singleton', () => {
    const engine1 = getNLUEngine();
    const engine2 = getNLUEngine();
    // Complexity: O(1)
    expect(engine1).toBe(engine2);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 23: SHADOW DOM TESTS
// ═══════════════════════════════════════════════════════════════════════════════

    // Complexity: O(1)
describe('Step 23: ShadowMode', () => {
  // Complexity: O(1)
  test('ShadowMode should be defined', () => {
    // Complexity: O(1)
    expect(ShadowMode).toBeTruthy();
  });

  // Complexity: O(1)
  test('ShadowMode should have OPEN', () => {
    // Complexity: O(1)
    expect(ShadowMode.OPEN).toBe('open');
  });

  // Complexity: O(1)
  test('ShadowMode should have CLOSED', () => {
    // Complexity: O(1)
    expect(ShadowMode.CLOSED).toBe('closed');
  });
});

    // Complexity: O(1)
describe('Step 23: TraversalStrategy', () => {
  // Complexity: O(1)
  test('TraversalStrategy should be defined', () => {
    // Complexity: O(1)
    expect(TraversalStrategy).toBeTruthy();
  });

  // Complexity: O(1)
  test('TraversalStrategy should have DEEP_FIRST', () => {
    // Complexity: O(1)
    expect(TraversalStrategy.DEEP_FIRST).toBe('deep_first');
  });

  // Complexity: O(1)
  test('TraversalStrategy should have BREADTH_FIRST', () => {
    // Complexity: O(1)
    expect(TraversalStrategy.BREADTH_FIRST).toBe('breadth_first');
  });

  // Complexity: O(1)
  test('TraversalStrategy should have PIERCE', () => {
    // Complexity: O(1)
    expect(TraversalStrategy.PIERCE).toBe('pierce');
  });
});

    // Complexity: O(1)
describe('Step 23: ShadowPath', () => {
  // Complexity: O(1)
  test('ShadowPath should be a class', () => {
    // Complexity: O(1)
    expect(typeof ShadowPath).toBe('function');
  });

  // Complexity: O(1)
  test('ShadowPath should be constructable', () => {
    const path = new ShadowPath();
    // Complexity: O(1)
    expect(path).toBeInstanceOf(ShadowPath);
  });

  // Complexity: O(1)
  test('ShadowPath should have addSegment method', () => {
    const path = new ShadowPath();
    // Complexity: O(1)
    expect(typeof path.addSegment).toBe('function');
  });

  // Complexity: O(1)
  test('ShadowPath addSegment should return self', () => {
    const path = new ShadowPath();
    const result = path.addSegment('.host');
    // Complexity: O(1)
    expect(result).toBe(path);
  });

  // Complexity: O(1)
  test('ShadowPath should have toString method', () => {
    const path = new ShadowPath();
    // Complexity: O(1)
    expect(typeof path.toString).toBe('function');
  });

  // Complexity: O(1)
  test('ShadowPath should have getDepth method', () => {
    const path = new ShadowPath();
    // Complexity: O(1)
    expect(typeof path.getDepth).toBe('function');
  });

  // Complexity: O(1)
  test('ShadowPath.fromString should parse >>> notation', () => {
    const path = ShadowPath.fromString('.host >>> .inner >>> .target');
    // Complexity: O(1)
    expect(path.segments.length).toBe(3);
  });

  // Complexity: O(1)
  test('ShadowPath toString should return >>> notation', () => {
    const path = new ShadowPath();
    path.addSegment('.host', true);
    path.addSegment('.target', false);
    // Complexity: O(1)
    expect(path.toString()).toContain('>>>');
  });
});

    // Complexity: O(1)
describe('Step 23: ShadowDOMNavigator', () => {
  // Complexity: O(1)
  test('ShadowDOMNavigator should be a class', () => {
    // Complexity: O(1)
    expect(typeof ShadowDOMNavigator).toBe('function');
  });

  // Complexity: O(1)
  test('ShadowDOMNavigator should be constructable', () => {
    const navigator = new ShadowDOMNavigator();
    // Complexity: O(1)
    expect(navigator).toBeInstanceOf(ShadowDOMNavigator);
  });

  // Complexity: O(1)
  test('ShadowDOMNavigator should accept options', () => {
    const navigator = new ShadowDOMNavigator({ maxDepth: 5 });
    // Complexity: O(1)
    expect(navigator.options.maxDepth).toBe(5);
  });

  // Complexity: O(1)
  test('ShadowDOMNavigator should have findElement method', () => {
    const navigator = new ShadowDOMNavigator();
    // Complexity: O(1)
    expect(typeof navigator.findElement).toBe('function');
  });

  // Complexity: O(1)
  test('ShadowDOMNavigator should have findElements method', () => {
    const navigator = new ShadowDOMNavigator();
    // Complexity: O(1)
    expect(typeof navigator.findElements).toBe('function');
  });

  // Complexity: O(1)
  test('ShadowDOMNavigator should track stats', () => {
    const navigator = new ShadowDOMNavigator();
    // Complexity: O(1)
    expect(navigator.stats).toHaveProperty('traversals');
  });
});

    // Complexity: O(1)
describe('Step 23: ShadowSelectorBuilder', () => {
  // Complexity: O(1)
  test('ShadowSelectorBuilder should be a class', () => {
    // Complexity: O(1)
    expect(typeof ShadowSelectorBuilder).toBe('function');
  });

  // Complexity: O(1)
  test('ShadowSelectorBuilder should be constructable', () => {
    const builder = new ShadowSelectorBuilder();
    // Complexity: O(1)
    expect(builder).toBeInstanceOf(ShadowSelectorBuilder);
  });

  // Complexity: O(1)
  test('ShadowSelectorBuilder should have shadow method', () => {
    const builder = new ShadowSelectorBuilder();
    // Complexity: O(1)
    expect(typeof builder.shadow).toBe('function');
  });

  // Complexity: O(1)
  test('ShadowSelectorBuilder should support chaining', () => {
    const builder = new ShadowSelectorBuilder();
    const result = builder.shadow('.host');
    // Complexity: O(1)
    expect(result).toBe(builder);
  });

  // Complexity: O(1)
  test('ShadowSelectorBuilder should have select method', () => {
    const builder = new ShadowSelectorBuilder();
    // Complexity: O(1)
    expect(typeof builder.select).toBe('function');
  });

  // Complexity: O(1)
  test('ShadowSelectorBuilder should have build method', () => {
    const builder = new ShadowSelectorBuilder();
    // Complexity: O(1)
    expect(typeof builder.build).toBe('function');
  });
});

    // Complexity: O(1)
describe('Step 23: PiercingLocator', () => {
  // Complexity: O(1)
  test('PiercingLocator should be a class', () => {
    // Complexity: O(1)
    expect(typeof PiercingLocator).toBe('function');
  });

  // Complexity: O(1)
  test('PiercingLocator should be constructable', () => {
    const navigator = new ShadowDOMNavigator();
    const locator = new PiercingLocator(navigator, '.target');
    // Complexity: O(1)
    expect(locator).toBeInstanceOf(PiercingLocator);
  });

  // Complexity: O(1)
  test('PiercingLocator should have find method', () => {
    const navigator = new ShadowDOMNavigator();
    const locator = new PiercingLocator(navigator, '.target');
    // Complexity: O(1)
    expect(typeof locator.find).toBe('function');
  });

  // Complexity: O(1)
  test('PiercingLocator should have waitFor method', () => {
    const navigator = new ShadowDOMNavigator();
    const locator = new PiercingLocator(navigator, '.target');
    // Complexity: O(1)
    expect(typeof locator.waitFor).toBe('function');
  });
});

    // Complexity: O(1)
describe('Step 23: ShadowDOMInteractor', () => {
  // Complexity: O(1)
  test('ShadowDOMInteractor should be a class', () => {
    // Complexity: O(1)
    expect(typeof ShadowDOMInteractor).toBe('function');
  });

  // Complexity: O(1)
  test('ShadowDOMInteractor should have click method', () => {
    const navigator = new ShadowDOMNavigator();
    const interactor = new ShadowDOMInteractor(navigator);
    // Complexity: O(1)
    expect(typeof interactor.click).toBe('function');
  });

  // Complexity: O(1)
  test('ShadowDOMInteractor should have type method', () => {
    const navigator = new ShadowDOMNavigator();
    const interactor = new ShadowDOMInteractor(navigator);
    // Complexity: O(1)
    expect(typeof interactor.type).toBe('function');
  });

  // Complexity: O(1)
  test('ShadowDOMInteractor should have getText method', () => {
    const navigator = new ShadowDOMNavigator();
    const interactor = new ShadowDOMInteractor(navigator);
    // Complexity: O(1)
    expect(typeof interactor.getText).toBe('function');
  });

  // Complexity: O(1)
  test('ShadowDOMInteractor should have exists method', () => {
    const navigator = new ShadowDOMNavigator();
    const interactor = new ShadowDOMInteractor(navigator);
    // Complexity: O(1)
    expect(typeof interactor.exists).toBe('function');
  });

  // Complexity: O(1)
  test('ShadowDOMInteractor should have locator method', () => {
    const navigator = new ShadowDOMNavigator();
    const interactor = new ShadowDOMInteractor(navigator);
    // Complexity: O(1)
    expect(typeof interactor.locator).toBe('function');
  });
});

    // Complexity: O(1)
describe('Step 23: Shadow DOM Factory Functions', () => {
  // Complexity: O(1)
  test('createNavigator should create ShadowDOMNavigator', () => {
    const navigator = createNavigator();
    // Complexity: O(1)
    expect(navigator).toBeInstanceOf(ShadowDOMNavigator);
  });

  // Complexity: O(1)
  test('createInteractor should create ShadowDOMInteractor', () => {
    const navigator = new ShadowDOMNavigator();
    const interactor = createInteractor(navigator);
    // Complexity: O(1)
    expect(interactor).toBeInstanceOf(ShadowDOMInteractor);
  });

  // Complexity: O(1)
  test('selector should return ShadowSelectorBuilder', () => {
    const builder = selector();
    // Complexity: O(1)
    expect(builder).toBeInstanceOf(ShadowSelectorBuilder);
  });

  // Complexity: O(1)
  test('getShadowNavigator should return singleton', () => {
    const nav1 = getShadowNavigator();
    const nav2 = getShadowNavigator();
    // Complexity: O(1)
    expect(nav1).toBe(nav2);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// SUMMARY
// ═══════════════════════════════════════════════════════════════════════════════

console.log('\n═══════════════════════════════════════════════════════════════════════════════');
console.log('📊 TEST SUMMARY');
console.log('═══════════════════════════════════════════════════════════════════════════════');
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
console.log('═══════════════════════════════════════════════════════════════════════════════');

if (errors.length > 0) {
  console.log('\n❌ FAILURES:');
  errors.forEach((e) => console.log(`  ${e.name}: ${e.error}`));
}

process.exit(failed > 0 ? 1 : 0);
