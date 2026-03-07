"use strict";
/**
 * 💰 QAntum SaaS Platform Demo
 * Copyright © 2025 Dimitar Prodromov. All rights reserved.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
async function runDemo() {
    console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
    console.log('║     💰 QANTUM SAAS PLATFORM - THE REVENUE AWAKENING                          ║');
    console.log('║     "В QAntum не лъжем. Само истински стойности."                            ║');
    console.log('╚══════════════════════════════════════════════════════════════════════════════╝');
    console.log('');
    // ─────────────────────────────────────────────────────────────────────────────
    // LICENSE MANAGER DEMO
    // ─────────────────────────────────────────────────────────────────────────────
    console.log('📜 LICENSE MANAGER');
    console.log('─'.repeat(60));
    const licenseManager = new index_1.LicenseManager('qantum-secret-2025');
    // Generate licenses for each tier
    const licenses = {
        free: licenseManager.generateLicenseKey('customer-001', 'FREE'),
        pro: licenseManager.generateLicenseKey('customer-002', 'PRO'),
        enterprise: licenseManager.generateLicenseKey('customer-003', 'ENTERPRISE'),
        singularity: licenseManager.generateLicenseKey('customer-004', 'SINGULARITY')
    };
    console.log('Generated License Keys:');
    console.log(`  FREE:        ${licenses.free}`);
    console.log(`  PRO:         ${licenses.pro}`);
    console.log(`  ENTERPRISE:  ${licenses.enterprise}`);
    console.log(`  SINGULARITY: ${licenses.singularity}`);
    console.log('');
    // Validate licenses
    console.log('License Validation:');
    for (const [tier, key] of Object.entries(licenses)) {
        const result = licenseManager.validateLicenseKey(key);
        console.log(`  ${tier.toUpperCase()}: ${result.valid ? '✅ Valid' : '❌ Invalid'} (Tier: ${result.tier})`);
    }
    console.log('');
    // ─────────────────────────────────────────────────────────────────────────────
    // USAGE METERING DEMO
    // ─────────────────────────────────────────────────────────────────────────────
    console.log('📊 USAGE METERING');
    console.log('─'.repeat(60));
    const usageMeter = new index_1.UsageMeter();
    // Simulate usage for FREE tier customer
    console.log('Simulating FREE tier usage (limit: 100 tests/month):');
    for (let i = 0; i < 105; i++) {
        usageMeter.record('customer-001', 'testsPerMonth', 1);
    }
    const freeCheck = usageMeter.checkLimit('customer-001', 'testsPerMonth', 'FREE');
    console.log(`  Tests used: ${freeCheck.current}/${freeCheck.limit}`);
    console.log(`  Allowed: ${freeCheck.allowed ? '✅' : '❌ LIMIT REACHED'}`);
    console.log(`  Remaining: ${freeCheck.remaining}`);
    console.log('');
    // Simulate usage for PRO tier customer
    console.log('Simulating PRO tier usage (limit: 10,000 tests/month):');
    for (let i = 0; i < 500; i++) {
        usageMeter.record('customer-002', 'testsPerMonth', 1);
    }
    const proCheck = usageMeter.checkLimit('customer-002', 'testsPerMonth', 'PRO');
    console.log(`  Tests used: ${proCheck.current}/${proCheck.limit}`);
    console.log(`  Allowed: ${proCheck.allowed ? '✅' : '❌'}`);
    console.log(`  Remaining: ${proCheck.remaining}`);
    console.log('');
    // Enterprise - unlimited
    console.log('Enterprise tier (unlimited):');
    const entCheck = usageMeter.checkLimit('customer-003', 'testsPerMonth', 'ENTERPRISE');
    console.log(`  Limit: ${entCheck.limit === -1 ? '∞ UNLIMITED' : entCheck.limit}`);
    console.log('');
    // ─────────────────────────────────────────────────────────────────────────────
    // SUBSCRIPTION TIERS OVERVIEW
    // ─────────────────────────────────────────────────────────────────────────────
    console.log('💎 SUBSCRIPTION TIERS');
    console.log('─'.repeat(60));
    for (const [name, tier] of Object.entries(index_1.SUBSCRIPTION_TIERS)) {
        console.log(`\n  ${tier.name} - $${tier.price}/month`);
        console.log(`  ${'─'.repeat(40)}`);
        console.log(`  Features:`);
        tier.features.forEach(f => console.log(`    • ${f}`));
        console.log(`  Limits:`);
        console.log(`    • Tests/month: ${tier.limits.testsPerMonth === -1 ? '∞' : tier.limits.testsPerMonth.toLocaleString()}`);
        console.log(`    • Ghost Sessions: ${tier.limits.ghostSessions === -1 ? '∞' : tier.limits.ghostSessions}`);
        console.log(`    • Oracle Scans: ${tier.limits.oracleScans === -1 ? '∞' : tier.limits.oracleScans}`);
        console.log(`    • Team Members: ${tier.limits.teamMembers === -1 ? '∞' : tier.limits.teamMembers}`);
    }
    console.log('');
    // ─────────────────────────────────────────────────────────────────────────────
    // FULL PLATFORM DEMO
    // ─────────────────────────────────────────────────────────────────────────────
    console.log('🚀 FULL PLATFORM DEMO');
    console.log('─'.repeat(60));
    const platform = new index_1.QAntumSaaSPlatform();
    // Register customers
    console.log('\nRegistering customers:');
    // SAFETY: async operation — wrap in try-catch for production resilience
    const freeCustomer = await platform.registerCustomer('free@example.com', 'Free User', 'FREE');
    console.log(`  ✅ ${freeCustomer.name} (${freeCustomer.tier})`);
    console.log(`     License: ${freeCustomer.licenseKey}`);
    // SAFETY: async operation — wrap in try-catch for production resilience
    const proCustomer = await platform.registerCustomer('pro@example.com', 'Pro User', 'PRO');
    console.log(`  ✅ ${proCustomer.name} (${proCustomer.tier})`);
    console.log(`     License: ${proCustomer.licenseKey}`);
    // Track usage
    console.log('\nTracking usage:');
    const usage1 = platform.trackUsage(freeCustomer.id, 'testsPerMonth', 50);
    console.log(`  Free user - 50 tests: ${usage1.allowed ? '✅ Allowed' : '❌ Blocked'} (${usage1.remaining} remaining)`);
    const usage2 = platform.trackUsage(freeCustomer.id, 'ghostSessions', 3);
    console.log(`  Free user - 3 ghost sessions: ${usage2.allowed ? '✅ Allowed' : '❌ Blocked'} (${usage2.remaining} remaining)`);
    // Validate feature access
    console.log('\nFeature validation:');
    const v1 = platform.validateAccess(freeCustomer.licenseKey, 'Ghost Protocol V2');
    console.log(`  Free user → Ghost Protocol V2: ${v1.valid ? '✅' : '❌ ' + v1.error}`);
    const v2 = platform.validateAccess(proCustomer.licenseKey, 'Ghost Protocol V2');
    console.log(`  Pro user → Ghost Protocol V2: ${v2.valid ? '✅' : '❌'}`);
    const v3 = platform.validateAccess(proCustomer.licenseKey, 'Chronos Paradox Engine');
    console.log(`  Pro user → Chronos Paradox: ${v3.valid ? '✅' : '❌ ' + v3.error}`);
    // Get dashboard
    console.log('\nCustomer Dashboard:');
    const dashboard = platform.getCustomerDashboard(freeCustomer.id);
    if (dashboard) {
        console.log(`  Customer: ${dashboard.customer.name}`);
        console.log(`  Tier: ${dashboard.tier.name}`);
        console.log(`  Usage:`);
        for (const [metric, data] of Object.entries(dashboard.limits)) {
            if (data.current > 0) {
                console.log(`    ${metric}: ${data.current}/${data.limit === -1 ? '∞' : data.limit} (${data.percentage}%)`);
            }
        }
    }
    // ─────────────────────────────────────────────────────────────────────────────
    // REVENUE PROJECTIONS
    // ─────────────────────────────────────────────────────────────────────────────
    console.log('\n');
    console.log('💰 REVENUE PROJECTIONS');
    console.log('─'.repeat(60));
    const projections = [
        { tier: 'PRO', customers: 100, price: 49 },
        { tier: 'ENTERPRISE', customers: 20, price: 299 },
        { tier: 'SINGULARITY', customers: 5, price: 999 }
    ];
    let totalMRR = 0;
    console.log('\nMonthly Recurring Revenue (MRR):');
    projections.forEach(p => {
        const mrr = p.customers * p.price;
        totalMRR += mrr;
        console.log(`  ${p.tier}: ${p.customers} × $${p.price} = $${mrr.toLocaleString()}`);
    });
    console.log(`  ${'─'.repeat(40)}`);
    console.log(`  Total MRR: $${totalMRR.toLocaleString()}`);
    console.log(`  Annual Run Rate: $${(totalMRR * 12).toLocaleString()}`);
    console.log('\n');
    console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
    console.log('║     💰 THE REVENUE AWAKENING - COMPLETE                                       ║');
    console.log('║     "От код до кеш. От мечта до реалност."                                   ║');
    console.log('╚══════════════════════════════════════════════════════════════════════════════╝');
}
// Run demo
// Complexity: O(1)
runDemo().catch(console.error);
