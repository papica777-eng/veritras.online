"use strict";
/**
 * 🌐 Edge Computing Demo
 * Copyright © 2025 Dimitar Prodromov. All rights reserved.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = __importStar(require("./index"));
async function runDemo() {
    console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
    console.log('║     🌐 QANTUM EDGE COMPUTING SYNERGY                                         ║');
    console.log('║     "Тестове от всяка точка на планетата."                                   ║');
    console.log('╚══════════════════════════════════════════════════════════════════════════════╝');
    console.log('');
    // ─────────────────────────────────────────────────────────────────────────────
    // GLOBAL NETWORK OVERVIEW
    // ─────────────────────────────────────────────────────────────────────────────
    console.log('🌍 GLOBAL EDGE NETWORK');
    console.log('─'.repeat(60));
    index_1.EDGE_NETWORK.forEach(node => {
        const statusIcon = node.status === 'active' ? '🟢' : node.status === 'idle' ? '🟡' : '🔴';
        console.log(`  ${statusIcon} ${node.region.padEnd(25)} ${node.provider.padEnd(12)} ${node.workers}/${node.maxWorkers} workers`);
    });
    const totalWorkers = index_1.EDGE_NETWORK.reduce((sum, n) => sum + n.maxWorkers, 0);
    console.log(`\n  Total Capacity: ${totalWorkers} workers across ${index_1.EDGE_NETWORK.length} regions`);
    // ─────────────────────────────────────────────────────────────────────────────
    // ORCHESTRATOR STATUS
    // ─────────────────────────────────────────────────────────────────────────────
    console.log('\n');
    console.log('📊 ORCHESTRATOR STATUS');
    console.log('─'.repeat(60));
    const orchestrator = new index_1.default();
    const status = orchestrator.getNetworkStatus();
    console.log(`  Total Workers: ${status.totalWorkers}`);
    console.log(`  Active Workers: ${status.activeWorkers}`);
    console.log(`  Queued Tasks: ${status.queuedTasks}`);
    console.log(`  Running Tasks: ${status.runningTasks}`);
    // ─────────────────────────────────────────────────────────────────────────────
    // COVERAGE REPORT
    // ─────────────────────────────────────────────────────────────────────────────
    console.log('\n');
    console.log('🗺️ COVERAGE REPORT');
    console.log('─'.repeat(60));
    const coverage = orchestrator.getCoverageReport();
    console.log(`  Regions: ${coverage.regions}`);
    console.log(`  Providers: ${coverage.providers.join(', ')}`);
    console.log('\n  Capabilities:');
    Object.entries(coverage.capabilities).forEach(([cap, count]) => {
        console.log(`    • ${cap}: ${count} nodes`);
    });
    console.log('\n  Geographic Distribution:');
    coverage.geoDistribution.forEach(g => {
        console.log(`    • ${g.continent}: ${g.nodes} nodes`);
    });
    // ─────────────────────────────────────────────────────────────────────────────
    // TASK DISTRIBUTION
    // ─────────────────────────────────────────────────────────────────────────────
    console.log('\n');
    console.log('📦 TASK DISTRIBUTION DEMO');
    console.log('─'.repeat(60));
    // Submit some test tasks
    const tests = Array.from({ length: 20 }, (_, i) => ({
        name: `Test ${i + 1}`,
        url: `https://api.example.com/endpoint/${i}`
    }));
    // SAFETY: async operation — wrap in try-catch for production resilience
    const distribution = await orchestrator.distributeTests(tests, {
        parallel: 10,
        capabilities: ['api-testing']
    });
    console.log(`  Distributed ${distribution.tasks.length} tests`);
    console.log('\n  Distribution by node:');
    Object.entries(distribution.distribution).forEach(([nodeId, count]) => {
        console.log(`    • ${nodeId}: ${count} tests`);
    });
    // ─────────────────────────────────────────────────────────────────────────────
    // LATENCY TEST
    // ─────────────────────────────────────────────────────────────────────────────
    console.log('\n');
    console.log('⚡ GLOBAL LATENCY TEST');
    console.log('─'.repeat(60));
    // SAFETY: async operation — wrap in try-catch for production resilience
    const latencies = await orchestrator.runLatencyTest('https://api.example.com');
    const sortedLatencies = Object.entries(latencies).sort((a, b) => a[1] - b[1]);
    sortedLatencies.forEach(([region, latency]) => {
        const bar = '█'.repeat(Math.ceil(latency / 20));
        console.log(`  ${region.padEnd(25)} ${latency.toString().padStart(4)}ms ${bar}`);
    });
    // ─────────────────────────────────────────────────────────────────────────────
    // CLOUDFLARE WORKER CODE
    // ─────────────────────────────────────────────────────────────────────────────
    console.log('\n');
    console.log('☁️ CLOUDFLARE WORKER CODE');
    console.log('─'.repeat(60));
    const cfGenerator = new index_1.CloudflareWorkerGenerator();
    console.log(cfGenerator.generateApiTestWorker().slice(0, 500) + '...');
    // ─────────────────────────────────────────────────────────────────────────────
    // AWS LAMBDA@EDGE CODE
    // ─────────────────────────────────────────────────────────────────────────────
    console.log('\n');
    console.log('🔷 AWS LAMBDA@EDGE CODE');
    console.log('─'.repeat(60));
    const lambdaGenerator = new index_1.LambdaEdgeGenerator();
    console.log(lambdaGenerator.generateOriginRequestHandler());
    console.log('\n');
    console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
    console.log('║     🌐 EDGE COMPUTING SYNERGY - COMPLETE                                     ║');
    console.log('║     "Глобален обхват. Локална скорост."                                      ║');
    console.log('╚══════════════════════════════════════════════════════════════════════════════╝');
}
// Run
// Complexity: O(1)
runDemo().catch(console.error);
