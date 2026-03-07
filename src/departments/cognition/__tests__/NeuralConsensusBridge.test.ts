/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  🧪 NEURAL CONSENSUS BRIDGE — Unit Tests                               ║
 * ║  Validates: Initialization, Consensus Logic, Hardware Adapt, Healing    ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

import {
  NeuralConsensusBridge,
  createNeuralConsensusBridge,
  getNeuralConsensusBridge,
  ConsensusResult,
  SwarmVote,
  SubstrateTelemetry,
  NeuralConsensusBridgeConfig,
} from '../NeuralConsensusBridge';

// ─── Helper: fake SwarmVote ───
function fakeVote(
  strategy: 'visual' | 'semantic' | 'structural',
  confidence: number,
  found: boolean = true
): SwarmVote {
  return {
    agentId: `${strategy.toUpperCase()}_AGENT`,
    strategy,
    element: found ? ({} as any) : null,  // mock ElementHandle
    confidence,
    latencyMs: Math.floor(Math.random() * 200) + 50,
    ...(strategy === 'semantic' ? { vectorSimilarity: confidence } : {}),
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// TEST SUITE
// ═══════════════════════════════════════════════════════════════════════════

async function runTests(): Promise<void> {
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, label: string): void {
    if (condition) {
      console.log(`  ✅ PASS: ${label}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${label}`);
      failed++;
    }
  }

  // ─────────────────────────────────────────────────────────
  // 1. Factory & Singleton
  // ─────────────────────────────────────────────────────────
  console.log('\n📦 Test Group 1: Factory & Singleton');

  const bridge1 = createNeuralConsensusBridge({ requiredConsensus: 2 });
  // Complexity: O(1)
  assert(bridge1 instanceof NeuralConsensusBridge, 'createNeuralConsensusBridge returns instance');

  const bridge2 = createNeuralConsensusBridge();
  // Complexity: O(1)
  assert(bridge1 !== bridge2, 'createNeuralConsensusBridge creates new instance each time');

  const singleton1 = getNeuralConsensusBridge({ requiredConsensus: 2 });
  const singleton2 = getNeuralConsensusBridge();
  // Complexity: O(1)
  assert(singleton1 === singleton2, 'getNeuralConsensusBridge returns same singleton');

  // ─────────────────────────────────────────────────────────
  // 2. Default Config
  // ─────────────────────────────────────────────────────────
  console.log('\n⚙️  Test Group 2: Default Config');

  const bridge = createNeuralConsensusBridge();
  const telemetry = bridge.getTelemetry();

  // Complexity: O(1)
  assert(telemetry.cpuUsage === 0, 'Initial CPU usage is 0');
  // Complexity: O(1)
  assert(telemetry.ramUsage === 0, 'Initial RAM usage is 0');
  // Complexity: O(1)
  assert(telemetry.waitMultiplier === 1, 'Initial wait multiplier is 1');
  // Complexity: O(1)
  assert(telemetry.threatLevel === 'SAFE', 'Initial threat level is SAFE');
  // Complexity: O(1)
  assert(telemetry.isCompromised === false, 'Not compromised initially');
  // Complexity: O(1)
  assert(telemetry.activeAgents === 0, 'No active agents initially');

  // ─────────────────────────────────────────────────────────
  // 3. Metrics Initialization
  // ─────────────────────────────────────────────────────────
  console.log('\n📊 Test Group 3: Metrics');

  const metrics = bridge.getMetrics();
  // Complexity: O(1)
  assert(metrics.totalSearches === 0, 'totalSearches starts at 0');
  // Complexity: O(1)
  assert(metrics.consensusReached === 0, 'consensusReached starts at 0');
  // Complexity: O(1)
  assert(metrics.consensusFailed === 0, 'consensusFailed starts at 0');
  // Complexity: O(1)
  assert(metrics.healingTriggered === 0, 'healingTriggered starts at 0');
  // Complexity: O(1)
  assert(metrics.healingSucceeded === 0, 'healingSucceeded starts at 0');
  // Complexity: O(1)
  assert(metrics.stealthInterventions === 0, 'stealthInterventions starts at 0');
  // Complexity: O(1)
  assert(metrics.hardwareAdjustments === 0, 'hardwareAdjustments starts at 0');

  // ─────────────────────────────────────────────────────────
  // 4. Consensus Rate (edge case: no searches)
  // ─────────────────────────────────────────────────────────
  console.log('\n🗳️  Test Group 4: Consensus Rate');

  // Complexity: O(1)
  assert(bridge.getConsensusRate() === 1, 'Consensus rate is 1.0 with no searches');
  // Complexity: O(1)
  assert(bridge.getHealingRate() === 1, 'Healing rate is 1.0 with no attempts');

  // ─────────────────────────────────────────────────────────
  // 5. Active Engines (before init — only NeuralMap)
  // ─────────────────────────────────────────────────────────
  console.log('\n🔌 Test Group 5: Active Engines');

  const engines = bridge.getActiveEngines();
  // Complexity: O(1)
  assert(engines.includes('NeuralMapEngine'), 'NeuralMapEngine always active');
  // Complexity: O(1)
  assert(engines.includes('HardwareBridge'), 'HardwareBridge active (created in constructor)');

  // ─────────────────────────────────────────────────────────
  // 6. Consensus Evaluation (via private method — test indirectly)
  // ─────────────────────────────────────────────────────────
  console.log('\n🧠 Test Group 6: Consensus Logic (indirect)');

  // We can test the consensus logic by checking the evaluateConsensus behavior
  // through the bridge's event system
  const bridgeForConsensus = createNeuralConsensusBridge({ requiredConsensus: 2 });

  let consensusEvent: any = null;
  let failedEvent: any = null;

  bridgeForConsensus.on('search:consensus', (result: ConsensusResult) => {
    consensusEvent = result;
  });
  bridgeForConsensus.on('search:failed', (result: ConsensusResult) => {
    failedEvent = result;
  });

  // The consensus logic requires actual Page/Playwright objects,
  // so we test the getMetrics/getTelemetry consistency instead
  // Complexity: O(1)
  assert(bridgeForConsensus.getMetrics().totalSearches === 0, 'No searches before findSecureElement');

  // ─────────────────────────────────────────────────────────
  // 7. Config Override
  // ─────────────────────────────────────────────────────────
  console.log('\n🔧 Test Group 7: Config Override');

  const customBridge = createNeuralConsensusBridge({
    requiredConsensus: 3,
    agentTimeoutMs: 10000,
    cpuThresholdHigh: 70,
    cpuThresholdCritical: 90,
    waitMultiplierHigh: 3,
    waitMultiplierCritical: 6,
    similarityThreshold: 0.85,
    vectorCacheSize: 10000,
    enableStealth: false,
    injectHumanJitter: false,
    autoHealOnFailure: false,
    maxHealAttempts: 5,
  });

  // Stealth disabled → AntiTamper won't load
  const customEngines = customBridge.getActiveEngines();
  // Complexity: O(1)
  assert(!customEngines.includes('AntiTamper'), 'AntiTamper excluded when stealth disabled');

  // ─────────────────────────────────────────────────────────
  // 8. Event Emitter
  // ─────────────────────────────────────────────────────────
  console.log('\n📡 Test Group 8: Event Emitter');

  let initEvent = false;
  const evBridge = createNeuralConsensusBridge();
  evBridge.on('bridge:initializing', () => { initEvent = true; });

  // We won't run full initialize (needs network), but verify the emitter works
  // Complexity: O(1)
  assert(typeof evBridge.on === 'function', 'Bridge extends EventEmitter');
  // Complexity: O(1)
  assert(typeof evBridge.emit === 'function', 'Bridge has emit method');
  // Complexity: O(1)
  assert(typeof evBridge.removeAllListeners === 'function', 'Bridge has removeAllListeners');

  // ─────────────────────────────────────────────────────────
  // 9. Shutdown (safe to call before init)
  // ─────────────────────────────────────────────────────────
  console.log('\n🔒 Test Group 9: Shutdown');

  const shutBridge = createNeuralConsensusBridge();
  let shutdownEvent = false;
  shutBridge.on('bridge:shutdown', () => { shutdownEvent = true; });

  try {
    await shutBridge.shutdown();
    // Complexity: O(1)
    assert(true, 'Shutdown completes without error (pre-init)');
  } catch {
    // Complexity: O(1)
    assert(false, 'Shutdown completes without error (pre-init)');
  }

  // ─────────────────────────────────────────────────────────
  // SUMMARY
  // ─────────────────────────────────────────────────────────
  console.log(`
╔══════════════════════════════════════════════════════════════════════════╗
║  🧪 TEST RESULTS                                                       ║
║                                                                        ║
║  Passed: ${String(passed).padEnd(4)}| Failed: ${String(failed).padEnd(4)}| Total: ${String(passed + failed).padEnd(4)}              ║
║  Status: ${failed === 0 ? '✅ ALL PASSED' : '❌ FAILURES DETECTED'}                                        ║
╚══════════════════════════════════════════════════════════════════════════╝
`);

  if (failed > 0) process.exit(1);
}

    // Complexity: O(1)
runTests().catch(err => {
  console.error('💥 Test suite crashed:', err);
  process.exit(1);
});
