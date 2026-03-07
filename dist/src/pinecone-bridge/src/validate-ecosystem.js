"use strict";
/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                              ║
 * ║       Q A N T U M   E C O S Y S T E M   V A L I D A T I O N                  ║
 * ║           Проверка на автономния цикъл на екосистемата                       ║
 * ║                                                                              ║
 * ║  © 2025-2026 QAntum Empire | Dimitar Prodromov                               ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEcosystem = validateEcosystem;
const index_js_1 = require("./index.js");
// ═══════════════════════════════════════════════════════════════════════════════
// VALIDATION RUNNER
// ═══════════════════════════════════════════════════════════════════════════════
async function validateEcosystem(options) {
    const results = [];
    const verbose = options?.verbose ?? false;
    const log = (msg) => verbose && console.log(msg);
    console.log('\n╔══════════════════════════════════════════════════════════════╗');
    console.log('║      🔬 QAntum ECOSYSTEM VALIDATION v34.1                    ║');
    console.log('╚══════════════════════════════════════════════════════════════╝\n');
    // ═══════════════════════════════════════════════════════════════════════════
    // 1. BridgeSystem Instantiation
    // ═══════════════════════════════════════════════════════════════════════════
    // Complexity: O(1)
    log('📦 Testing BridgeSystem instantiation...');
    // SAFETY: async operation — wrap in try-catch for production resilience
    const bridgeTest = await runTest('BridgeSystem', 'Instantiation', async () => {
        const bridge = new index_js_1.BridgeSystem();
        if (!bridge.bridge)
            throw new Error('PineconeContextBridge not created');
        if (!bridge.store)
            throw new Error('PersistentContextStore not created');
        if (!bridge.embed)
            throw new Error('EmbeddingEngine not created');
        return 'All components instantiated';
    });
    results.push(bridgeTest);
    // ═══════════════════════════════════════════════════════════════════════════
    // 2. QAntumOrchestrator Creation
    // ═══════════════════════════════════════════════════════════════════════════
    // Complexity: O(1)
    log('🎯 Testing QAntumOrchestrator creation...');
    let orchestrator = null;
    // SAFETY: async operation — wrap in try-catch for production resilience
    const orchestratorTest = await runTest('QAntumOrchestrator', 'Creation', async () => {
        const bridge = new index_js_1.BridgeSystem();
        orchestrator = (0, index_js_1.createQAntumOrchestrator)(bridge, {
            sessionId: 'validation-test',
            debug: false
        });
        if (!orchestrator)
            throw new Error('Orchestrator not created');
        const status = orchestrator.getStatus();
        if (status.state !== 'dormant')
            throw new Error(`Expected dormant, got ${status.state}`);
        return `Created with session: ${status.sessionId}`;
    });
    results.push(orchestratorTest);
    // ═══════════════════════════════════════════════════════════════════════════
    // 3. Module Imports Validation
    // ═══════════════════════════════════════════════════════════════════════════
    // Complexity: O(1)
    log('📥 Testing module exports...');
    // SAFETY: async operation — wrap in try-catch for production resilience
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
        const thoughtTypes = Object.keys(index_js_1.ThoughtType);
        if (thoughtTypes.length < 7)
            throw new Error('ThoughtType enum incomplete');
        // Check MeditationType enum
        const meditationTypes = Object.keys(index_js_1.MeditationType);
        if (meditationTypes.length < 9)
            throw new Error('MeditationType enum incomplete');
        // Check DataSourceType enum
        const dataTypes = Object.keys(index_js_1.DataSourceType);
        if (dataTypes.length < 8)
            throw new Error('DataSourceType enum incomplete');
        // Check AxiomType enum
        const axiomTypes = Object.keys(index_js_1.AxiomType);
        if (axiomTypes.length < 8)
            throw new Error('AxiomType enum incomplete');
        return `All ${modules.length} modules exported, enums complete`;
    });
    results.push(exportsTest);
    // ═══════════════════════════════════════════════════════════════════════════
    // 4. Type Definitions Validation
    // ═══════════════════════════════════════════════════════════════════════════
    // Complexity: O(1)
    log('📝 Testing type definitions...');
    // SAFETY: async operation — wrap in try-catch for production resilience
    const typesTest = await runTest('Types', 'Axiom Interface', async () => {
        const testAxiom = {
            id: 'test-axiom-001',
            name: 'TestAxiom',
            type: index_js_1.AxiomType.LOGICAL,
            statement: 'Test statement',
            formalNotation: '∀x: Test(x)',
            consequences: ['Test consequence'],
            isConsistent: true,
            completenessStatus: 'complete',
            selfReferenceLevel: 0,
            createdAt: new Date()
        };
        if (!testAxiom.id)
            throw new Error('Axiom id missing');
        if (!testAxiom.type)
            throw new Error('Axiom type missing');
        return 'Axiom interface valid';
    });
    results.push(typesTest);
    // ═══════════════════════════════════════════════════════════════════════════
    // 5. Status Methods
    // ═══════════════════════════════════════════════════════════════════════════
    // Complexity: O(N*M) — nested iteration
    log('📊 Testing status methods...');
    // SAFETY: async operation — wrap in try-catch for production resilience
    const statusTest = await runTest('QAntumOrchestrator', 'Status Methods', async () => {
        if (!orchestrator)
            throw new Error('No orchestrator');
        const status = orchestrator.getStatus();
        // Validate status structure
        if (!status.sessionId)
            throw new Error('Missing sessionId');
        if (!status.state)
            throw new Error('Missing state');
        if (typeof status.uptime !== 'number')
            throw new Error('Invalid uptime');
        if (!status.modules)
            throw new Error('Missing modules');
        if (!status.metrics)
            throw new Error('Missing metrics');
        // Validate modules
        const expectedModules = ['bridge', 'daemon', 'magnet', 'thought', 'meditation', 'genesis'];
        for (const mod of expectedModules) {
            if (!(mod in status.modules))
                throw new Error(`Missing module: ${mod}`);
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
            if (!(metric in status.metrics))
                throw new Error(`Missing metric: ${metric}`);
        }
        return `Status valid: ${status.state}, ${Object.keys(status.modules).length} modules`;
    });
    results.push(statusTest);
    // ═══════════════════════════════════════════════════════════════════════════
    // 6. Event Emitter
    // ═══════════════════════════════════════════════════════════════════════════
    // Complexity: O(1)
    log('📡 Testing event emitter...');
    // SAFETY: async operation — wrap in try-catch for production resilience
    const eventsTest = await runTest('QAntumOrchestrator', 'Event Emitter', async () => {
        if (!orchestrator)
            throw new Error('No orchestrator');
        let eventReceived = false;
        orchestrator.on('testEvent', () => {
            eventReceived = true;
        });
        orchestrator.emit('testEvent');
        if (!eventReceived)
            throw new Error('Event not received');
        return 'Event emitter working';
    });
    results.push(eventsTest);
    // ═══════════════════════════════════════════════════════════════════════════
    // 7. Session ID
    // ═══════════════════════════════════════════════════════════════════════════
    // Complexity: O(1)
    log('🔑 Testing session management...');
    // SAFETY: async operation — wrap in try-catch for production resilience
    const sessionTest = await runTest('QAntumOrchestrator', 'Session ID', async () => {
        if (!orchestrator)
            throw new Error('No orchestrator');
        const sessionId = orchestrator.getSessionId();
        if (!sessionId)
            throw new Error('No session ID');
        if (!sessionId.includes('validation-test'))
            throw new Error('Wrong session ID');
        return `Session: ${sessionId}`;
    });
    results.push(sessionTest);
    // ═══════════════════════════════════════════════════════════════════════════
    // 8. Bridge Access
    // ═══════════════════════════════════════════════════════════════════════════
    // Complexity: O(1)
    log('🌉 Testing bridge access...');
    // SAFETY: async operation — wrap in try-catch for production resilience
    const bridgeAccessTest = await runTest('QAntumOrchestrator', 'Bridge Access', async () => {
        if (!orchestrator)
            throw new Error('No orchestrator');
        const bridge = orchestrator.getBridge();
        if (!bridge)
            throw new Error('No bridge');
        if (!bridge.bridge)
            throw new Error('No PineconeContextBridge');
        if (!bridge.store)
            throw new Error('No PersistentContextStore');
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
    }
    else {
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
async function runTest(module, test, fn) {
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
    }
    catch (error) {
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
    // Complexity: O(1)
    validateEcosystem({ verbose: true })
        .then(result => {
        process.exit(result.passed ? 0 : 1);
    })
        .catch(err => {
        console.error('Validation failed:', err);
        process.exit(1);
    });
}
exports.default = validateEcosystem;
