/**
 * 🌐 Edge Computing Demo
 * Copyright © 2025 Dimitar Prodromov. All rights reserved.
 */

import EdgeOrchestrator, { EDGE_NETWORK, CloudflareWorkerGenerator, LambdaEdgeGenerator } from '../SaaS-Framework/01_ECOSYSTEM_APPS/MrMindQATool/src/index';

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
  
  EDGE_NETWORK.forEach(node => {
    const statusIcon = node.status === 'active' ? '🟢' : node.status === 'idle' ? '🟡' : '🔴';
    console.log(`  ${statusIcon} ${node.region.padEnd(25)} ${node.provider.padEnd(12)} ${node.workers}/${node.maxWorkers} workers`);
  });
  
  const totalWorkers = EDGE_NETWORK.reduce((sum, n) => sum + n.maxWorkers, 0);
  console.log(`\n  Total Capacity: ${totalWorkers} workers across ${EDGE_NETWORK.length} regions`);
  
  // ─────────────────────────────────────────────────────────────────────────────
  // ORCHESTRATOR STATUS
  // ─────────────────────────────────────────────────────────────────────────────
  
  console.log('\n');
  console.log('📊 ORCHESTRATOR STATUS');
  console.log('─'.repeat(60));
  
  const orchestrator = new EdgeOrchestrator();
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
  
  const cfGenerator = new CloudflareWorkerGenerator();
  console.log(cfGenerator.generateApiTestWorker().slice(0, 500) + '...');
  
  // ─────────────────────────────────────────────────────────────────────────────
  // AWS LAMBDA@EDGE CODE
  // ─────────────────────────────────────────────────────────────────────────────
  
  console.log('\n');
  console.log('🔷 AWS LAMBDA@EDGE CODE');
  console.log('─'.repeat(60));
  
  const lambdaGenerator = new LambdaEdgeGenerator();
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
