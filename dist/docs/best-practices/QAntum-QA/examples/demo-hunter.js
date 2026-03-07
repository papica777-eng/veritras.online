"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * HUNTER MODE DEMO - Test the monetization engine
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Run with: ts-node demo-hunter.ts
 *
 * @author Димитър Продромов / Mister Mind
 * @version 34.0.0 ETERNAL SOVEREIGN
 */
Object.defineProperty(exports, "__esModule", { value: true });
const HunterMode_1 = require("../src/reality/HunterMode");
// ═══════════════════════════════════════════════════════════════════════════════
// DEMO TARGETS (Public websites for testing)
// ═══════════════════════════════════════════════════════════════════════════════
const DEMO_TARGETS = [
    {
        domain: 'example.com',
        industry: 'demo',
        reason: 'Test target - safe domain'
    },
    {
        domain: 'httpbin.org',
        industry: 'developer-tools',
        reason: 'Known testing service'
    },
    {
        domain: 'badssl.com',
        industry: 'security-testing',
        reason: 'Intentionally misconfigured SSL for testing'
    },
    {
        domain: 'testssl.sh',
        industry: 'security-tools',
        reason: 'SSL testing tool website'
    },
];
// ═══════════════════════════════════════════════════════════════════════════════
// DEMO EXECUTION
// ═══════════════════════════════════════════════════════════════════════════════
async function runHunterDemo() {
    console.log(`
╔═══════════════════════════════════════════════════════════════════════════════╗
║                                                                               ║
║                    🎯 HUNTER MODE v34.0 DEMO                                 ║
║                    ─────────────────────────────                              ║
║                    "Economic Imperative Activation"                           ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝
  `);
    // Initialize Hunter Mode
    const hunter = HunterMode_1.HunterMode.getInstance({
        maxTargets: 5,
        minSecurityScore: 90, // High threshold = more leads qualify
    });
    // Set up event listeners
    hunter.on('hunt:start', (data) => {
        console.log(`\n🚀 Hunt started: ${data.targets} targets in queue`);
    });
    hunter.on('lead:qualified', (lead) => {
        console.log(`\n   💎 NEW LEAD: ${lead.companyName}`);
        console.log(`      Score: ${lead.securityScore}/100`);
        console.log(`      Issues: ${lead.totalIssues}`);
        console.log(`      Est. Value: $${lead.estimatedDealValue}`);
    });
    hunter.on('hunt:complete', (data) => {
        console.log(`\n✅ Hunt complete! ${data.leads.length} leads qualified`);
    });
    hunter.on('valuebomb:generated', (bomb) => {
        console.log(`\n   💣 Value Bomb ready for ${bomb.companyName}`);
    });
    // Execute hunt
    console.log('\n📋 DEMO TARGETS:');
    DEMO_TARGETS.forEach((t, i) => {
        console.log(`   ${i + 1}. ${t.domain} (${t.industry})`);
    });
    console.log('\n⏳ Starting hunt...\n');
    const leads = await hunter.hunt(DEMO_TARGETS);
    // Generate Value Bombs for qualified leads
    if (leads.length > 0) {
        console.log('\n\n═══════════════════════════════════════════════════════════════════════════════');
        console.log('💣 GENERATING VALUE BOMBS');
        console.log('═══════════════════════════════════════════════════════════════════════════════\n');
        for (const lead of leads.slice(0, 2)) { // Generate for first 2 leads
            const valueBomb = hunter.generateValueBomb(lead);
            console.log(`\n${'─'.repeat(79)}`);
            console.log(`COMPANY: ${valueBomb.companyName} (${valueBomb.domain})`);
            console.log(`GRADE: ${valueBomb.securityGrade}`);
            console.log(`${'─'.repeat(79)}`);
            console.log('\n📝 EXECUTIVE SUMMARY:');
            console.log(valueBomb.executiveSummary);
            console.log('\n📧 EMAIL SUBJECT:');
            console.log(`   "${valueBomb.emailSubject}"`);
            console.log('\n📧 EMAIL BODY:');
            console.log('─'.repeat(50));
            console.log(valueBomb.emailBody);
            console.log('─'.repeat(50));
            console.log('\n💼 LINKEDIN MESSAGE:');
            console.log('─'.repeat(50));
            console.log(valueBomb.linkedInMessage);
            console.log('─'.repeat(50));
            console.log(`\n🎁 OFFER: ${valueBomb.offerTitle}`);
            console.log(`   ${valueBomb.offerDescription}`);
            console.log(`   CTA: ${valueBomb.callToAction}`);
            console.log(`   Valid until: ${valueBomb.validUntil.toDateString()}`);
        }
    }
    // Summary
    console.log(`\n\n
╔═══════════════════════════════════════════════════════════════════════════════╗
║                                                                               ║
║                         🏆 HUNT SUMMARY                                       ║
║                                                                               ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║                                                                               ║
║   Targets Scanned:    ${String(DEMO_TARGETS.length).padEnd(10)}                                       ║
║   Leads Qualified:    ${String(leads.length).padEnd(10)}                                       ║
║   Value Bombs Ready:  ${String(Math.min(leads.length, 2)).padEnd(10)}                                       ║
║                                                                               ║
║   Total Est. Value:   $${String(leads.reduce((sum, l) => sum + l.estimatedDealValue, 0)).padEnd(8)}                                      ║
║                                                                               ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║                                                                               ║
║   "Не пращай нищо без одобрение от Димитър."                                 ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝
  `);
}
// Run demo
runHunterDemo().catch(console.error);
