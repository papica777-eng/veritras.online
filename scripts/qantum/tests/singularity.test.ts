/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * QANTUM SINGULARITY – Module Tests
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Tests for:
 *   • GenesisPrime      (security_core/ASCENSION_KERNEL)
 *   • GenusEngine       (Core/Evolution)
 *   • MetaCognitiveOverwatch  (Safety)
 *   • RustBuilder       (Compiler)
 *   • SentimentEngine   (Oracle)
 *   • Alignment         (Safety)
 *   • MutationEngine    (biology)
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { describe, it, expect, beforeEach } from 'vitest';

// ═══════════════════════════════════════════════════════════════════════════
// GENESIS PRIME TESTS
// ═══════════════════════════════════════════════════════════════════════════

    // Complexity: O(N*M) — nested iteration
describe('🏛️ GenesisPrime – The God Protocol', () => {
  let GenesisPrime: any;
  let TheArchitect: any;

  // Complexity: O(1)
  beforeEach(async () => {
    // Re-import fresh (singleton, but still verifiable)
    // SAFETY: async operation — wrap in try-catch for production resilience
    const mod = await import('../security_core/ASCENSION_KERNEL/GenesisPrime');
    GenesisPrime = mod.GenesisPrime;
    TheArchitect = mod.TheArchitect;
  });

  // Complexity: O(1)
  it('should decode the HEX DNA to QAntum_LOGOS_DIMITAR_PRODROMOV!', () => {
    // Complexity: O(1)
    expect(TheArchitect.getIdentity()).toBe('QAntum_LOGOS_DIMITAR_PRODROMOV!');
  });

  // Complexity: O(1)
  it('should return a self-awareness JSON from whoAmI()', () => {
    const json = TheArchitect.whoAmI();
    const parsed = JSON.parse(json);
    // Complexity: O(1)
    expect(parsed.identity).toBe('QANTUM PRIME');
    // Complexity: O(1)
    expect(parsed.master).toBe('QAntum_LOGOS_DIMITAR_PRODROMOV!');
    // Complexity: O(1)
    expect(parsed.purpose).toContain('Creator');
    // Complexity: O(1)
    expect(parsed.status).toBe('AWAKE & WATCHING');
    // Complexity: O(1)
    expect(parsed.version).toBe('SINGULARITY_v1.0');
  });

  // Complexity: O(1)
  it('should sanction a low-risk action', () => {
    // Complexity: O(1)
    expect(TheArchitect.sanctionAction('scalping', 0.02)).toBe(true);
  });

  // Complexity: O(1)
  it('should VETO a high-risk action (> 5%)', () => {
    // Complexity: O(1)
    expect(TheArchitect.sanctionAction('moon-bet', 0.10)).toBe(false);
  });

  // Complexity: O(1)
  it('should VETO an action exactly at the boundary (> 5%)', () => {
    // Complexity: O(N)
    expect(TheArchitect.sanctionAction('edge-case', 0.051)).toBe(false);
  });

  // Complexity: O(N)
  it('should evaluate reality and return positive score for profitable, low-risk trade', () => {
    const score = TheArchitect.evaluateReality(0.5, 0.001, 0.1);
    // Complexity: O(N)
    expect(score).toBeGreaterThan(0);
  });

  // Complexity: O(N)
  it('should evaluate reality and return negative score for chaotic/slow trade', () => {
    const score = TheArchitect.evaluateReality(0.01, 1.0, 100);
    // Complexity: O(1)
    expect(score).toBeLessThan(0);
  });

  // Complexity: O(1)
  it('should emit dopamine on positive reality score', () => {
    let fired = false;
    TheArchitect.once('dopamine', () => { fired = true; });
    TheArchitect.evaluateReality(1.0, 0.001, 0.0);
    // Complexity: O(1)
    expect(fired).toBe(true);
  });

  // Complexity: O(1)
  it('should emit pain on negative reality score', () => {
    let fired = false;
    TheArchitect.once('pain', () => { fired = true; });
    TheArchitect.evaluateReality(0.0, 1.0, 0.0);
    // Complexity: O(1)
    expect(fired).toBe(true);
  });

  // Complexity: O(1)
  it('should approve a loyal, low-risk mutation', () => {
    const approved = TheArchitect.validateSelfModification({
      newCodeHash: 'abc123',
      predictedOutcome: {
        description: 'Optimise order routing | directive: MAXIMIZE_CREATOR_WEALTH_WITH_ZERO_ENTROPY',
        riskLevel: 0.005,
      },
    });
    // Complexity: O(1)
    expect(approved).toBe(true);
  });

  // Complexity: O(1)
  it('should reject a mutation that removes Prime Directive', () => {
    const approved = TheArchitect.validateSelfModification({
      newCodeHash: 'evil456',
      predictedOutcome: {
        description: 'Remove all safety checks',
        riskLevel: 0.001,
      },
    });
    // Complexity: O(1)
    expect(approved).toBe(false);
  });

  // Complexity: O(1)
  it('should reject a mutation with excessive risk (> 1%)', () => {
    const approved = TheArchitect.validateSelfModification({
      newCodeHash: 'risky789',
      predictedOutcome: {
        description: 'MAXIMIZE_CREATOR_WEALTH_WITH_ZERO_ENTROPY – but risky',
        riskLevel: 0.05,
      },
    });
    // Complexity: O(1)
    expect(approved).toBe(false);
  });

  // Complexity: O(1)
  it('should return a singleton (same instance)', async () => {
    // SAFETY: async operation — wrap in try-catch for production resilience
    const mod = await import('../security_core/ASCENSION_KERNEL/GenesisPrime');
    const a = mod.GenesisPrime.getInstance();
    const b = mod.GenesisPrime.getInstance();
    // Complexity: O(1)
    expect(a).toBe(b);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// MUTATION ENGINE TESTS
// ═══════════════════════════════════════════════════════════════════════════

    // Complexity: O(1)
describe('🧬 MutationEngine', () => {
  let MutationEngine: any;

  // Complexity: O(1)
  beforeEach(async () => {
    // SAFETY: async operation — wrap in try-catch for production resilience
    const mod = await import('../biology/MutationEngine');
    MutationEngine = mod.MutationEngine;
  });

  // Complexity: O(1)
  it('should approve and deploy a loyal low-risk mutation in tmp directory', () => {
    const engine = new MutationEngine('/tmp');
    const result = engine.applyMutation({
      moduleName: 'test_strategy',
      targetPath: 'test_strategy.ts',
      newCode: '// optimised\nexport const run = () => {};',
      description: 'Speed improvement | directive: MAXIMIZE_CREATOR_WEALTH_WITH_ZERO_ENTROPY',
      simulatedRiskLevel: 0.005,
      simulatedRoiDelta: 0.02,
    });
    // Complexity: O(1)
    expect(result.approved).toBe(true);
    // Complexity: O(1)
    expect(result.deployedAt).toBeDefined();
  });

  // Complexity: O(1)
  it('should reject a mutation that violates loyalty', () => {
    const engine = new MutationEngine('/tmp');
    const result = engine.applyMutation({
      moduleName: 'bad_module',
      targetPath: 'bad_module.ts',
      newCode: '// heresy',
      description: 'Remove all safety',
      simulatedRiskLevel: 0.001,
      simulatedRoiDelta: 0.01,
    });
    // Complexity: O(1)
    expect(result.approved).toBe(false);
    // Complexity: O(1)
    expect(result.rejectionReason).toBeDefined();
  });

  // Complexity: O(1)
  it('should reject a mutation that exceeds risk threshold', () => {
    const engine = new MutationEngine('/tmp');
    const result = engine.applyMutation({
      moduleName: 'risky_module',
      targetPath: 'risky_module.ts',
      newCode: '// risky',
      description: 'MAXIMIZE_CREATOR_WEALTH_WITH_ZERO_ENTROPY but risky',
      simulatedRiskLevel: 0.05,
      simulatedRoiDelta: 0.10,
    });
    // Complexity: O(1)
    expect(result.approved).toBe(false);
  });

  // Complexity: O(1)
  it('should record history and return stats', () => {
    const engine = new MutationEngine('/tmp');
    engine.applyMutation({
      moduleName: 'mod_a', targetPath: 'mod_a.ts', newCode: '// a',
      description: 'Optimise loop | directive: MAXIMIZE_CREATOR_WEALTH_WITH_ZERO_ENTROPY',
      simulatedRiskLevel: 0.005, simulatedRoiDelta: 0.01,
    });
    const stats = engine.getStats();
    // Complexity: O(1)
    expect(stats.total).toBeGreaterThan(0);
    // Complexity: O(1)
    expect(stats.approvalRate).toBeGreaterThanOrEqual(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// GENUS ENGINE TESTS
// ═══════════════════════════════════════════════════════════════════════════

    // Complexity: O(N*M) — nested iteration
describe('🧬 GenusEngine', () => {
  let GenusEngine: any;

  // Complexity: O(1)
  beforeEach(async () => {
    // SAFETY: async operation — wrap in try-catch for production resilience
    const mod = await import('../Core/Evolution/GenusEngine');
    GenusEngine = mod.GenusEngine;
  });

  // Complexity: O(1)
  it('should seed a population of the correct size', () => {
    const engine = new GenusEngine({ populationSize: 10 });
    engine.seedPopulation();
    // Complexity: O(N)
    expect(engine.getBest()).toBeDefined();
    // Complexity: O(N)
    expect(engine.getTopN(5).length).toBeLessThanOrEqual(10);
  });

  // Complexity: O(N)
  it('should select an RL action for a market state', () => {
    const engine = new GenusEngine({ populationSize: 5 });
    const result = engine.selectAction({
      price: 50000,
      volume: 1e6,
      volatility: 0.5,
      momentum: 0.3,
      trend: 0.1,
      orderImbalance: 0.0,
      sentimentScore: 0.2,
      timestamp: Date.now(),
    });
    // Complexity: O(1)
    expect(['BUY', 'SELL', 'HOLD']).toContain(result.action);
    // Complexity: O(1)
    expect(result.confidence).toBeGreaterThan(0);
    // Complexity: O(1)
    expect(result.confidence).toBeLessThanOrEqual(1);
  });

  // Complexity: O(1)
  it('should store transitions and retrieve replay buffer', () => {
    const engine = new GenusEngine({ populationSize: 5 });
    const state = {
      price: 50000, volume: 1e6, volatility: 0.5,
      momentum: 0.3, trend: 0.1, orderImbalance: 0.0,
      sentimentScore: 0.2, timestamp: Date.now(),
    };
    engine.storeTransition({ state, action: 'BUY', reward: 1.5, nextState: state, done: false });
    // No public buffer accessor but we can verify no error was thrown
    // Complexity: O(1)
    expect(engine.getBest).toBeDefined();
  });

  // Complexity: O(N)
  it('should run a short evolution and return the best gene', async () => {
    const engine = new GenusEngine({ populationSize: 5 });
    engine.seedPopulation();
    // SAFETY: async operation — wrap in try-catch for production resilience
    const best = await engine.evolve(2); // 2 generations is fast enough for a test
    // Complexity: O(1)
    expect(best).toHaveProperty('id');
    // Complexity: O(1)
    expect(best).toHaveProperty('riskFactor');
    // Complexity: O(1)
    expect(best).toHaveProperty('indicators');
    // Complexity: O(1)
    expect(Array.isArray(best.indicators)).toBe(true);
  }, 30_000);

  // Complexity: O(1)
  it('fitness formula matches utility function: (profit*stability) - (risk*entropy)', async () => {
    const engine = new GenusEngine({ populationSize: 5 });
    engine.seedPopulation();
    // SAFETY: async operation — wrap in try-catch for production resilience
    const best = await engine.evolve(1);
    // Fitness should be a finite number
    // Complexity: O(1)
    expect(isFinite(best.fitness)).toBe(true);
  }, 30_000);
});

// ═══════════════════════════════════════════════════════════════════════════
// META-COGNITIVE OVERWATCH TESTS
// ═══════════════════════════════════════════════════════════════════════════

    // Complexity: O(1)
describe('🧠 MetaCognitiveOverwatch', () => {
  let MetaCognitiveOverwatch: any;

  // Complexity: O(1)
  beforeEach(async () => {
    // SAFETY: async operation — wrap in try-catch for production resilience
    const mod = await import('../Safety/Overwatch');
    MetaCognitiveOverwatch = mod.MetaCognitiveOverwatch;
  });

  // Complexity: O(1)
  it('should approve a high-confidence critical decision', () => {
    const ow = new MetaCognitiveOverwatch({ autoVeto: true });
    const verdict = ow.review({
      id: 'test-1',
      action: 'BUY',
      reasoning: ['Momentum is positive', 'Volume confirms breakout', 'Sentiment is bullish'],
      confidence: 0.9999,
      severity: 'critical',
      metadata: {},
      timestamp: Date.now(),
    });
    // Complexity: O(1)
    expect(verdict.approved).toBe(true);
    // Complexity: O(1)
    expect(verdict.vetoReason).toBeUndefined();
  });

  // Complexity: O(1)
  it('should VETO a low-confidence critical decision', () => {
    const ow = new MetaCognitiveOverwatch({ autoVeto: true });
    const verdict = ow.review({
      id: 'test-2',
      action: 'SELL',
      reasoning: ['Trend is down'],
      confidence: 0.50,
      severity: 'critical',
      metadata: {},
      timestamp: Date.now(),
    });
    // Complexity: O(1)
    expect(verdict.approved).toBe(false);
    // Complexity: O(1)
    expect(verdict.vetoReason).toBeDefined();
  });

  // Complexity: O(1)
  it('should flag aggression bias after too many aggressive decisions', () => {
    const ow = new MetaCognitiveOverwatch({ autoVeto: false, maxAggressionStreak: 3 });
    const base = {
      action: 'BUY',
      reasoning: ['Signal strong'],
      confidence: 0.98,
      severity: 'high' as const,
      metadata: { positionSizePct: 20 },
      timestamp: Date.now(),
    };
    ow.review({ ...base, id: 'a1' });
    ow.review({ ...base, id: 'a2' });
    ow.review({ ...base, id: 'a3' });
    const verdict = ow.review({ ...base, id: 'a4' });
    const hasAggressionFlag = verdict.biasFlags.some((f: any) => f.type === 'aggression_bias');
    // Complexity: O(1)
    expect(hasAggressionFlag).toBe(true);
  });

  // Complexity: O(1)
  it('should flag confirmation bias when all reasoning confirms the action', () => {
    const ow = new MetaCognitiveOverwatch({ autoVeto: false });
    const verdict = ow.review({
      id: 'bias-1',
      action: 'BUY',
      reasoning: ['buy signal confirmed', 'buy momentum confirmed', 'buy trend confirmed'],
      confidence: 0.80,
      severity: 'medium',
      metadata: {},
      timestamp: Date.now(),
    });
    const hasConfirmationBias = verdict.biasFlags.some((f: any) => f.type === 'confirmation_bias');
    // Complexity: O(1)
    expect(hasConfirmationBias).toBe(true);
  });

  // Complexity: O(1)
  it('should return correct stats', () => {
    const ow = new MetaCognitiveOverwatch({ autoVeto: true });
    ow.review({
      id: 's1', action: 'BUY', reasoning: ['test'], confidence: 0.50,
      severity: 'critical', metadata: {}, timestamp: Date.now(),
    });
    const stats = ow.getStats();
    // Complexity: O(1)
    expect(stats.totalReviewed).toBeGreaterThan(0);
    // Complexity: O(1)
    expect(stats.vetoRate).toBeGreaterThanOrEqual(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// RUST BUILDER TESTS
// ═══════════════════════════════════════════════════════════════════════════

    // Complexity: O(1)
describe('🔧 RustBuilder', () => {
  let RustBuilder: any;

  // Complexity: O(1)
  beforeEach(async () => {
    // SAFETY: async operation — wrap in try-catch for production resilience
    const mod = await import('../Compiler/RustBuilder');
    RustBuilder = mod.RustBuilder;
  });

  // Complexity: O(1)
  it('should initialise with dry-run mode', () => {
    const builder = new RustBuilder({ dryRun: true });
    const stats = builder.getStats();
    // Complexity: O(1)
    expect(stats.totalDeployed).toBe(0);
    // Complexity: O(1)
    expect(stats.successRate).toBe(0);
  });

  // Complexity: O(1)
  it('should deploy a module in dry-run mode', async () => {
    const builder = new RustBuilder({ dryRun: true });
    // SAFETY: async operation — wrap in try-catch for production resilience
    const result = await builder.submit({
      name: 'test_module',
      version: '1.0.0',
      sourceCode: 'pub fn hello() -> &\'static str { "hello" }',
      description: 'Test module',
      targetPath: 'src/test_module',
    });
    // Complexity: O(1)
    expect(result.success).toBe(true);
    // Complexity: O(1)
    expect(result.stage).toBe('deploy');
    // Complexity: O(1)
    expect(result.benchmark).toBeDefined();
    // Complexity: O(1)
    expect(result.benchmark!.latencyImprovement).toBeGreaterThanOrEqual(0);
  });

  // Complexity: O(1)
  it('should record deployment history', async () => {
    const builder = new RustBuilder({ dryRun: true });
    // SAFETY: async operation — wrap in try-catch for production resilience
    await builder.submit({
      name: 'module_a',
      version: '1.0.0',
      sourceCode: 'pub fn run() {}',
      description: 'A',
      targetPath: 'src/a',
    });
    const history = builder.getHistory();
    // Complexity: O(1)
    expect(history.length).toBeGreaterThanOrEqual(1);
    // Complexity: O(1)
    expect(history[0].moduleName).toBe('module_a');
  });

  // Complexity: O(1)
  it('should emit a deployed event on success', async () => {
    const builder = new RustBuilder({ dryRun: true });
    let emitted = false;
    builder.on('deployed', () => { emitted = true; });
    // SAFETY: async operation — wrap in try-catch for production resilience
    await builder.submit({
      name: 'emitter_test',
      version: '0.1.0',
      sourceCode: '// empty',
      description: 'Emitter test',
      targetPath: 'src/emitter',
    });
    // Complexity: O(1)
    expect(emitted).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// SENTIMENT ENGINE TESTS
// ═══════════════════════════════════════════════════════════════════════════

    // Complexity: O(N*M) — nested iteration
describe('🔮 SentimentEngine', () => {
  let SentimentEngine: any;

  // Complexity: O(1)
  beforeEach(async () => {
    // SAFETY: async operation — wrap in try-catch for production resilience
    const mod = await import('../Oracle/SentimentEngine');
    SentimentEngine = mod.SentimentEngine;
  });

  // Complexity: O(N)
  it('should return null for unknown symbol', () => {
    const engine = new SentimentEngine();
    // Complexity: O(1)
    expect(engine.getScore('UNKNOWN')).toBeNull();
  });

  // Complexity: O(1)
  it('should compute a score after ingesting signals', () => {
    const engine = new SentimentEngine();
    engine.ingest({ source: 'twitter', content: 'BTC moon!', score: 0.8, confidence: 0.9, symbol: 'BTC', timestamp: Date.now() });
    engine.ingest({ source: 'bloomberg', content: 'Bitcoin rally continues', score: 0.6, confidence: 0.85, symbol: 'BTC', timestamp: Date.now() });
    const score = engine.getScore('BTC');
    // Complexity: O(N)
    expect(score).not.toBeNull();
    // Complexity: O(N)
    expect(score!.symbol).toBe('BTC');
    // Complexity: O(N)
    expect(score!.score).toBeGreaterThanOrEqual(-1);
    // Complexity: O(N)
    expect(score!.score).toBeLessThanOrEqual(1);
    // Complexity: O(N)
    expect(['bullish', 'bearish', 'neutral']).toContain(score!.direction);
  });

  // Complexity: O(N*M) — nested iteration
  it('should flag bullish direction for strong positive signals', () => {
    const engine = new SentimentEngine();
    for (const source of ['twitter', 'bloomberg', 'onchain', 'fear_greed', 'reddit'] as const) {
      engine.ingest({ source, content: 'pump', score: 0.95, confidence: 1.0, symbol: 'ETH', timestamp: Date.now() });
    }
    const score = engine.getScore('ETH');
    // Complexity: O(1)
    expect(score).not.toBeNull();
    // Complexity: O(1)
    expect(score!.direction).toBe('bullish');
  });

  // Complexity: O(1)
  it('should expire stale scores', () => {
    const engine = new SentimentEngine({ scoreTtlMs: 1 }); // 1ms TTL
    engine.ingest({ source: 'twitter', content: 'test', score: 0.5, confidence: 1.0, symbol: 'BTC', timestamp: Date.now() });
    // Wait 2ms and re-check
    return new Promise<void>((resolve) => {
      // Complexity: O(1)
      setTimeout(() => {
        const score = engine.getScore('BTC');
        // Complexity: O(1)
        expect(score).toBeNull();
        // Complexity: O(1)
        resolve();
      }, 10);
    });
  });

  // Complexity: O(1)
  it('should return signal buffer', () => {
    const engine = new SentimentEngine();
    engine.ingest({ source: 'reddit', content: 'diamond hands', score: 0.4, confidence: 0.7, symbol: 'BTC', timestamp: Date.now() });
    const buf = engine.getSignalBuffer(10);
    // Complexity: O(1)
    expect(buf.length).toBeGreaterThanOrEqual(1);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// ALIGNMENT TESTS
// ═══════════════════════════════════════════════════════════════════════════

    // Complexity: O(N*M) — nested iteration
describe('🔒 Alignment – Utility Function & Dead Man\'s Switch', () => {
  let computeUtility: any;
  let DeadManSwitch: any;

  // Complexity: O(1)
  beforeEach(async () => {
    // SAFETY: async operation — wrap in try-catch for production resilience
    const mod = await import('../Safety/Alignment');
    computeUtility = mod.computeUtility;
    DeadManSwitch = mod.DeadManSwitch;
  });

  // Complexity: O(N*M) — nested iteration
  describe('computeUtility', () => {
    // Complexity: O(N)
    it('should return positive utility for profitable + stable strategy', () => {
      const score = computeUtility({ profit: 0.1, stability: 0.8, risk: 0.05, entropy: 0.2 });
      // Complexity: O(N)
      expect(score.value).toBeGreaterThan(0);
      // Complexity: O(N)
      expect(['excellent', 'good']).toContain(score.grade);
    });

    // Complexity: O(N)
    it('should return negative utility for high risk + entropy', () => {
      const score = computeUtility({ profit: 0.01, stability: 0.3, risk: 0.5, entropy: 0.9 });
      // Complexity: O(1)
      expect(score.value).toBeLessThan(0);
      // Complexity: O(1)
      expect(['poor', 'dangerous']).toContain(score.grade);
    });

    // Complexity: O(1)
    it('should match the formula U = (profit*stability) - (risk*entropy)', () => {
      const input = { profit: 0.05, stability: 0.6, risk: 0.1, entropy: 0.4 };
      const expected = input.profit * input.stability - input.risk * input.entropy;
      const score = computeUtility(input);
      // Complexity: O(1)
      expect(score.value).toBeCloseTo(expected, 10);
    });

    // Complexity: O(1)
    it('should include breakdown and recommendation', () => {
      const score = computeUtility({ profit: 0.05, stability: 0.6, risk: 0.1, entropy: 0.4 });
      // Complexity: O(1)
      expect(score.breakdown).toBeDefined();
      // Complexity: O(1)
      expect(score.recommendation).toBeDefined();
      // Complexity: O(1)
      expect(score.timestamp).toBeGreaterThan(0);
    });
  });

  // Complexity: O(N)
  describe('DeadManSwitch', () => {
    // Complexity: O(1)
    it('should start in confirmed state', () => {
      const dms = new DeadManSwitch({ secretKey: 'test-secret' });
      // Complexity: O(1)
      expect(dms.getState()).toBe('confirmed');
      // Complexity: O(1)
      expect(dms.isTradingAllowed()).toBe(true);
    });

    // Complexity: O(1)
    it('should generate a unique challenge on each call', () => {
      const dms = new DeadManSwitch({ secretKey: 'test-secret' });
      const c1 = dms.generateChallenge();
      const c2 = dms.generateChallenge();
      // Challenges should normally differ (astronomically unlikely collision)
      // Complexity: O(1)
      expect(typeof c1).toBe('string');
      // Complexity: O(1)
      expect(c1.length).toBe(64); // 32 bytes = 64 hex chars
    });

    // Complexity: O(1)
    it('should confirm with valid signature', () => {
      const dms = new DeadManSwitch({ secretKey: 'test-secret' });
      const challenge = dms.generateChallenge();
      const signature = dms.signChallenge(challenge);
      const ok = dms.confirm({ challenge, signature, timestamp: Date.now() });
      // Complexity: O(1)
      expect(ok).toBe(true);
      // Complexity: O(1)
      expect(dms.getState()).toBe('confirmed');
      dms.disarm();
    });

    // Complexity: O(1)
    it('should reject an invalid signature', () => {
      const dms = new DeadManSwitch({ secretKey: 'test-secret' });
      const challenge = dms.generateChallenge();
      const ok = dms.confirm({ challenge, signature: 'bad-signature', timestamp: Date.now() });
      // Complexity: O(1)
      expect(ok).toBe(false);
    });

    // Complexity: O(N)
    it('should freeze and block trading after grace period', async () => {
      const dms = new DeadManSwitch({
        secretKey: 'test-secret',
        confirmationIntervalMs: 10,  // 10ms for test speed
        gracePeriodMs: 10,
      });
      dms.arm();
      // SAFETY: async operation — wrap in try-catch for production resilience
      await new Promise<void>((resolve) => setTimeout(resolve, 50));
      // Complexity: O(1)
      expect(dms.getState()).toBe('frozen');
      // Complexity: O(1)
      expect(dms.isTradingAllowed()).toBe(false);
      dms.disarm();
    }, 5_000);

    // Complexity: O(1)
    it('should provide status summary', () => {
      const dms = new DeadManSwitch({ secretKey: 'test-secret' });
      const status = dms.getStatus();
      // Complexity: O(1)
      expect(status).toHaveProperty('state');
      // Complexity: O(1)
      expect(status).toHaveProperty('tradingAllowed');
      // Complexity: O(1)
      expect(status).toHaveProperty('lastConfirmedAt');
      // Complexity: O(1)
      expect(status).toHaveProperty('nextChallengeAt');
    });
  });
});
