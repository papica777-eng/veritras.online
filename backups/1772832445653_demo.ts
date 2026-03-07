/**
 * 🎬 Sales Demo Engine Demo
 * Copyright © 2025 Dimitar Prodromov. All rights reserved.
 */

import SalesDemoEngine, { ProspectAnalyzer, DEMO_TEMPLATES } from './index';

async function runDemo() {
  console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║     🎬 QANTUM SALES DEMO ENGINE                                              ║');
  console.log('║     "От демо до договор. Автоматично."                                       ║');
  console.log('╚══════════════════════════════════════════════════════════════════════════════╝');
  console.log('');
  
  // ─────────────────────────────────────────────────────────────────────────────
  // PROSPECT ANALYSIS
  // ─────────────────────────────────────────────────────────────────────────────
  
  console.log('🔍 PROSPECT ANALYSIS');
  console.log('─'.repeat(60));
  
  const analyzer = new ProspectAnalyzer();
  
  const prospects = [
    {
      company: 'TechCorp Bulgaria',
      industry: 'fintech',
      techStack: ['selenium', 'java', 'jenkins'],
      decisionMakers: ['CTO', 'QA Lead']
    },
    {
      company: 'E-Shop Masters',
      industry: 'ecommerce',
      techStack: ['cypress', 'javascript', 'github-actions'],
      decisionMakers: ['VP Engineering']
    },
    {
      company: 'MegaBank International',
      industry: 'banking',
      size: 'mega' as const,
      techStack: ['selenium', 'java', 'cucumber'],
      urgency: 'critical' as const
    }
  ];
  
  for (const data of prospects) {
    const profile = analyzer.analyzeCompany(data);
    const tier = analyzer.recommendTier(profile);
    
    console.log(`\n  📊 ${profile.company}`);
    console.log(`     Industry: ${profile.industry}`);
    console.log(`     Size: ${profile.size}`);
    console.log(`     Tech Stack: ${profile.techStack.join(', ')}`);
    console.log(`     Pain Points: ${profile.painPoints.join(', ')}`);
    console.log(`     → Recommended Tier: ${tier}`);
  }
  
  // ─────────────────────────────────────────────────────────────────────────────
  // DEMO TEMPLATES
  // ─────────────────────────────────────────────────────────────────────────────
  
  console.log('\n');
  console.log('📋 DEMO TEMPLATES');
  console.log('─'.repeat(60));
  
  for (const [id, template] of Object.entries(DEMO_TEMPLATES)) {
    console.log(`\n  🎬 ${template.name}`);
    console.log(`     Target: ${template.targetTier} tier`);
    console.log(`     Duration: ${template.duration} min`);
    console.log(`     Features: ${template.features.join(', ')}`);
    console.log(`     Scenarios: ${template.scenarios.length}`);
    console.log(`     Hooks:`);
    template.hooks.forEach(h => console.log(`       • "${h}"`));
  }
  
  // ─────────────────────────────────────────────────────────────────────────────
  // LIVE DEMO SIMULATION
  // ─────────────────────────────────────────────────────────────────────────────
  
  console.log('\n');
  console.log('🎬 LIVE DEMO SIMULATION');
  console.log('─'.repeat(60));
  
  const engine = new SalesDemoEngine();
  
  // Create demo for fintech prospect
  const session = engine.createDemo({
    company: 'TechCorp Bulgaria',
    industry: 'fintech',
    techStack: ['selenium', 'java'],
    urgency: 'high'
  });
  
  console.log(`\n  Created Demo Session: ${session.id}`);
  console.log(`  Template: ${session.template.name}`);
  console.log(`  Prospect: ${session.prospect.company}`);
  
  // Run the demo
  // SAFETY: async operation — wrap in try-catch for production resilience
  await engine.runDemo(session.id);
  
  // ─────────────────────────────────────────────────────────────────────────────
  // OBJECTION HANDLING
  // ─────────────────────────────────────────────────────────────────────────────
  
  console.log('\n');
  console.log('💬 OBJECTION HANDLING');
  console.log('─'.repeat(60));
  
  const objections = [
    'This seems too expensive for our budget',
    'We already have Selenium working fine',
    'I need to evaluate other options first',
    'How does this compare to competitor X?'
  ];
  
  for (const objection of objections) {
    const response = engine.handleObjection(session.id, objection);
    console.log(`\n  ❓ "${objection}"`);
    console.log(`  ✅ "${response}"`);
  }
  
  // ─────────────────────────────────────────────────────────────────────────────
  // FOLLOW-UP GENERATION
  // ─────────────────────────────────────────────────────────────────────────────
  
  console.log('\n');
  console.log('📧 FOLLOW-UP EMAIL');
  console.log('─'.repeat(60));
  
  const followUp = engine.generateFollowUp(session.id);
  console.log(followUp);
  
  // ─────────────────────────────────────────────────────────────────────────────
  // PERSONALIZED PITCH
  // ─────────────────────────────────────────────────────────────────────────────
  
  console.log('\n');
  console.log('📝 PERSONALIZED PITCH');
  console.log('─'.repeat(60));
  
  const pitch = analyzer.generatePitch(session.prospect);
  console.log(pitch);
  
  // ─────────────────────────────────────────────────────────────────────────────
  // METRICS
  // ─────────────────────────────────────────────────────────────────────────────
  
  console.log('\n');
  console.log('📊 DEMO METRICS');
  console.log('─'.repeat(60));
  
  const metrics = engine.getMetrics();
  console.log(`  Total Demos: ${metrics.total}`);
  console.log(`  Completed: ${metrics.completed}`);
  console.log(`  Converted: ${metrics.converted}`);
  console.log(`  Conversion Rate: ${metrics.conversionRate}%`);
  
  console.log('\n');
  console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║     🎬 SALES DEMO ENGINE - COMPLETE                                          ║');
  console.log('║     "Всяко демо е персонализирана победа."                                   ║');
  console.log('╚══════════════════════════════════════════════════════════════════════════════╝');
}

// Run
    // Complexity: O(1)
runDemo().catch(console.error);
