/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                              ║
 * ║       Q A N T U M   E C O S Y S T E M   V A L I D A T I O N                  ║
 * ║           Проверка на автономния цикъл на екосистемата                       ║
 * ║                                                                              ║
 * ║  © 2025-2026 QAntum Empire | Dimitar Prodromov                               ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import { 
  BridgeSystem, 
  QAntumOrchestrator,
  createQAntumOrchestrator,
  ThoughtType,
  MeditationType,
  DataSourceType,
  AxiomType,
  type Axiom
} from './index.js';

// ═══════════════════════════════════════════════════════════════════════════════
// VALIDATION RESULTS
// ═══════════════════════════════════════════════════════════════════════════════

interface ValidationResult {
  module: string;
  test: string;
  passed: boolean;
  duration: number;
  details?: string;
  error?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// VALIDATION RUNNER
// ═══════════════════════════════════════════════════════════════════════════════

export async function validateEcosystem(options?: {
  skipPinecone?: boolean;
  verbose?: boolean;
}): Promise<{
  passed: boolean;
  total: number;
  successful: number;
  failed: number;
  results: ValidationResult[];
}> {
  const results: ValidationResult[] = [];
  const verbose = options?.verbose ?? false;
  
  const log = (msg: string) => verbose && console.log(msg);
  
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║      🔬 QANTUM ECOSYSTEM VALIDATION v34.1                    ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. BridgeSystem Instantiation
  // ═══════════════════════════════════════════════════════════════════════════
  
  log('📦 Testing BridgeSystem instantiation...');
  const bridgeTest = await runTest('BridgeSystem', 'Instantiation', async () => {
    const bridge = new BridgeSystem();
    if (!bridge.bridge) throw new Error('PineconeContextBridge not created');
    if (!bridge.store) throw new Error('PersistentContextStore not created');
    if (!bridge.embed) throw new Error('EmbeddingEngine not created');
    return 'All components instantiated';
  });
  results.push(bridgeTest);

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. QAntumOrchestrator Creation
  // ═══════════════════════════════════════════════════════════════════════════
  
  log('🎯 Testing QAntumOrchestrator creation...');
  let orchestrator: QAntumOrchestrator | null = null;
  
  const orchestratorTest = await runTest('QAntumOrchestrator', 'Creation', async () => {
    const bridge = new BridgeSystem();
    orchestrator = createQAntumOrchestrator(bridge, {
      sessionId: 'validation-test',
      debug: false
    });
    if (!orchestrator) throw new Error('Orchestrator not created');
    const status = orchestrator.getStatus();
    if (status.state !== 'dormant') throw new Error(`Expected dormant, got ${status.state}`);
    return `Created with session: ${status.sessionId}`;
  });
  results.push(orchestratorTest);

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. Module Imports Validation
  // ═══════════════════════════════════════════════════════════════════════════
  
  log('📥 Testing module exports...');
  const exportsTest = await runTest('Exports', 'All Daemon Modules', async () => {
    const modules = [
      'BridgeSystem',
      'QAntumOrchestrator',
      'createQAntumOrchestrator',
      'ThoughtType',
      'MeditationType',
      'DataSourceType',
      'AxiomType',
    ];
    
    // Check ThoughtType enum
    const thoughtTypes = Object.keys(ThoughtType);
    if (thoughtTypes.length < 7) throw new Error('ThoughtType enum incomplete');
    
    // Check MeditationType enum
    const meditationTypes = Object.keys(MeditationType);
    if (meditationTypes.length < 9) throw new Error('MeditationType enum incomplete');
    
    // Check DataSourceType enum
    const dataTypes = Object.keys(DataSourceType);
    if (dataTypes.length < 8) throw new Error('DataSourceType enum incomplete');
    
    // Check AxiomType enum
    const axiomTypes = Object.keys(AxiomType);
    if (axiomTypes.length < 8) throw new Error('AxiomType enum incomplete');
    
    return `All ${modules.length} modules exported, enums complete`;
  });
  results.push(exportsTest);

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. Type Definitions Validation
  // ═══════════════════════════════════════════════════════════════════════════
  
  log('📝 Testing type definitions...');
  const typesTest = await runTest('Types', 'Axiom Interface', async () => {
    const testAxiom: Axiom = {
      id: 'test-axiom-001',
      name: 'TestAxiom',
      type: AxiomType.LOGICAL,
      statement: 'Test statement',
      formalNotation: '∀x: Test(x)',
      consequences: ['Test consequence'],
      isConsistent: true,
      completenessStatus: 'complete',
      selfReferenceLevel: 0,
      createdAt: new Date()
    };
    
    if (!testAxiom.id) throw new Error('Axiom id missing');
    if (!testAxiom.type) throw new Error('Axiom type missing');
    
    return 'Axiom interface valid';
  });
  results.push(typesTest);

  // ═══════════════════════════════════════════════════════════════════════════
  // 5. Status Methods
  // ═══════════════════════════════════════════════════════════════════════════
  
  log('📊 Testing status methods...');
  const statusTest = await runTest('QAntumOrchestrator', 'Status Methods', async () => {
    if (!orchestrator) throw new Error('No orchestrator');
    
    const status = orchestrator.getStatus();
    
    // Validate status structure
    if (!status.sessionId) throw new Error('Missing sessionId');
    if (!status.state) throw new Error('Missing state');
    if (typeof status.uptime !== 'number') throw new Error('Invalid uptime');
    if (!status.modules) throw new Error('Missing modules');
    if (!status.metrics) throw new Error('Missing metrics');
    
    // Validate modules
    const expectedModules = ['bridge', 'daemon', 'magnet', 'thought', 'meditation', 'genesis'];
    for (const mod of expectedModules) {
      if (!(mod in status.modules)) throw new Error(`Missing module: ${mod}`);
    }
    
    // Validate metrics
    const expectedMetrics = [
      'contextQueries', 
      'decisionsGenerated', 
      'meditationSessions',
      'axiomsStored',
      'realitiesStored',
      'fragmentsCollected'
    ];
    for (const metric of expectedMetrics) {
      if (!(metric in status.metrics)) throw new Error(`Missing metric: ${metric}`);
    }
    
    return `Status valid: ${status.state}, ${Object.keys(status.modules).length} modules`;
  });
  results.push(statusTest);

  // ═══════════════════════════════════════════════════════════════════════════
  // 6. Event Emitter
  // ═══════════════════════════════════════════════════════════════════════════
  
  log('📡 Testing event emitter...');
  const eventsTest = await runTest('QAntumOrchestrator', 'Event Emitter', async () => {
    if (!orchestrator) throw new Error('No orchestrator');
    
    let eventReceived = false;
    orchestrator.on('testEvent', () => {
      eventReceived = true;
    });
    orchestrator.emit('testEvent');
    
    if (!eventReceived) throw new Error('Event not received');
    
    return 'Event emitter working';
  });
  results.push(eventsTest);

  // ═══════════════════════════════════════════════════════════════════════════
  // 7. Session ID
  // ═══════════════════════════════════════════════════════════════════════════
  
  log('🔑 Testing session management...');
  const sessionTest = await runTest('QAntumOrchestrator', 'Session ID', async () => {
    if (!orchestrator) throw new Error('No orchestrator');
    
    const sessionId = orchestrator.getSessionId();
    if (!sessionId) throw new Error('No session ID');
    if (!sessionId.includes('validation-test')) throw new Error('Wrong session ID');
    
    return `Session: ${sessionId}`;
  });
  results.push(sessionTest);

  // ═══════════════════════════════════════════════════════════════════════════
  // 8. Bridge Access
  // ═══════════════════════════════════════════════════════════════════════════
  
  log('🌉 Testing bridge access...');
  const bridgeAccessTest = await runTest('QAntumOrchestrator', 'Bridge Access', async () => {
    if (!orchestrator) throw new Error('No orchestrator');
    
    const bridge = orchestrator.getBridge();
    if (!bridge) throw new Error('No bridge');
    if (!bridge.bridge) throw new Error('No PineconeContextBridge');
    if (!bridge.store) throw new Error('No PersistentContextStore');
    
    return 'Bridge accessible';
  });
  results.push(bridgeAccessTest);

  // ═══════════════════════════════════════════════════════════════════════════
  // SUMMARY
  // ═══════════════════════════════════════════════════════════════════════════
  
  const successful = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const total = results.length;
  const passed = failed === 0;
  
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║                    📋 VALIDATION SUMMARY                     ║');
  console.log('╠══════════════════════════════════════════════════════════════╣');
  
  for (const result of results) {
    const status = result.passed ? '✅' : '❌';
    const module = result.module.padEnd(20);
    const test = result.test.padEnd(20);
    const duration = `${result.duration}ms`.padStart(6);
    console.log(`║ ${status} ${module} ${test} ${duration} ║`);
  }
  
  console.log('╠══════════════════════════════════════════════════════════════╣');
  console.log(`║ Total: ${total} | ✅ Passed: ${successful} | ❌ Failed: ${failed}`.padEnd(63) + '║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  
  if (passed) {
    console.log('\n🎉 ALL VALIDATIONS PASSED - ECOSYSTEM IS OPERATIONAL\n');
  } else {
    console.log('\n⚠️  SOME VALIDATIONS FAILED - REVIEW ERRORS ABOVE\n');
    for (const result of results.filter(r => !r.passed)) {
      console.log(`   ❌ ${result.module}/${result.test}: ${result.error}`);
    }
  }
  
  return { passed, total, successful, failed, results };
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTION
// ═══════════════════════════════════════════════════════════════════════════════

async function runTest(
  module: string, 
  test: string, 
  fn: () => Promise<string>
): Promise<ValidationResult> {
  const start = Date.now();
  try {
    const details = await fn();
    return {
      module,
      test,
      passed: true,
      duration: Date.now() - start,
      details
    };
  } catch (error) {
    return {
      module,
      test,
      passed: false,
      duration: Date.now() - start,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// CLI ENTRY
// ═══════════════════════════════════════════════════════════════════════════════

if (process.argv[1]?.includes('validate-ecosystem')) {
  validateEcosystem({ verbose: true })
    .then(result => {
      process.exit(result.passed ? 0 : 1);
    })
    .catch(err => {
      console.error('Validation failed:', err);
      process.exit(1);
    });
}

export default validateEcosystem;
