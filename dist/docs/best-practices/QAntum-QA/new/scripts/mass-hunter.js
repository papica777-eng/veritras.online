#!/usr/bin/env npx ts-node
"use strict";
/**
 * 🦁 MASS HUNTER - Scan multiple targets simultaneously
 * Usage: npx ts-node scripts/mass-hunter.ts
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
const https = __importStar(require("https"));
const TARGETS = [
    'ozone.bg',
    'chaos.com',
    'telerik.com',
    'superhosting.bg',
    'siteground.com',
    'gtmhub.com',
    'kanbanize.com',
    'payhawk.com',
    'officerentinfo.bg',
    'jobs.bg'
];
async function quickScan(domain) {
    const HEADERS = [
        'strict-transport-security',
        'content-security-policy',
        'x-frame-options',
        'x-content-type-options',
        'x-xss-protection',
        'referrer-policy',
        'permissions-policy'
    ];
    return new Promise((resolve) => {
        const start = Date.now();
        const req = https.request({
            hostname: domain,
            port: 443,
            path: '/',
            method: 'HEAD',
            timeout: 10000,
            rejectUnauthorized: false
        }, (res) => {
            const ttfb = Date.now() - start;
            let score = 100;
            const issues = [];
            for (const h of HEADERS) {
                if (!res.headers[h]) {
                    score -= 12;
                    issues.push(`Missing: ${h}`);
                }
            }
            score = Math.max(0, score);
            let grade = 'A+';
            if (score < 95)
                grade = 'A';
            if (score < 85)
                grade = 'B';
            if (score < 70)
                grade = 'C';
            if (score < 55)
                grade = 'D';
            if (score < 40)
                grade = 'F';
            resolve({ domain, score, grade, issues, ttfb });
        });
        req.on('error', () => resolve({
            domain, score: 0, grade: 'ERR', issues: ['Connection failed'], ttfb: 0
        }));
        req.on('timeout', () => resolve({
            domain, score: 0, grade: 'ERR', issues: ['Timeout'], ttfb: 10000
        }));
        req.end();
    });
}
async function main() {
    console.log(`
╔═══════════════════════════════════════════════════════════════════════════════╗
║                                                                               ║
║                    🦁 MASS HUNTER v34.0 - FULL FORCE                         ║
║                    ═══════════════════════════════════                        ║
║                    Scanning ${TARGETS.length} targets simultaneously...                        ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝
  `);
    console.log('⏳ Scanning all targets in parallel...\n');
    const results = await Promise.all(TARGETS.map(quickScan));
    // Sort by score (worst first = best opportunities)
    results.sort((a, b) => a.score - b.score);
    console.log('═══════════════════════════════════════════════════════════════════════════════');
    console.log('                           📊 SCAN RESULTS (Sorted by Opportunity)');
    console.log('═══════════════════════════════════════════════════════════════════════════════\n');
    console.log('┌────────────────────────┬───────┬───────┬────────┬─────────────────────────┐');
    console.log('│ Domain                 │ Score │ Grade │ TTFB   │ Top Issue               │');
    console.log('├────────────────────────┼───────┼───────┼────────┼─────────────────────────┤');
    for (const r of results) {
        const gradeColor = r.grade === 'F' ? '🔴' : r.grade === 'D' ? '🟠' : r.grade === 'C' ? '🟡' : '🟢';
        const topIssue = r.issues[0]?.replace('Missing: ', '') || 'None';
        console.log(`│ ${r.domain.padEnd(22)} │ ${String(r.score).padStart(3)}/100│   ${gradeColor}${r.grade}  │ ${String(r.ttfb).padStart(4)}ms │ ${topIssue.substring(0, 23).padEnd(23)} │`);
    }
    console.log('└────────────────────────┴───────┴───────┴────────┴─────────────────────────┘');
    // Top opportunities
    const opportunities = results.filter(r => r.score < 70);
    console.log(`\n
═══════════════════════════════════════════════════════════════════════════════
                           🎯 TOP OPPORTUNITIES (${opportunities.length} targets)
═══════════════════════════════════════════════════════════════════════════════
`);
    for (const opp of opportunities) {
        console.log(`\n🔥 ${opp.domain.toUpperCase()} - Grade ${opp.grade} (${opp.score}/100)`);
        console.log('   Issues:');
        opp.issues.slice(0, 5).forEach(i => console.log(`   • ${i}`));
        console.log(`   Estimated Value: €5,000 - €25,000`);
    }
    console.log(`\n
╔═══════════════════════════════════════════════════════════════════════════════╗
║                                                                               ║
║   📊 SUMMARY                                                                  ║
║   ─────────────────────────────────────────────────────────────────────────   ║
║   Total Scanned:     ${String(results.length).padEnd(5)}                                              ║
║   Grade F:           ${String(results.filter(r => r.grade === 'F').length).padEnd(5)} 🔴 HOT LEADS                                  ║
║   Grade D:           ${String(results.filter(r => r.grade === 'D').length).padEnd(5)} 🟠 WARM LEADS                                 ║
║   Grade C:           ${String(results.filter(r => r.grade === 'C').length).padEnd(5)} 🟡 POSSIBLE                                   ║
║   Grade A/B:         ${String(results.filter(r => r.grade === 'A' || r.grade === 'B' || r.grade === 'A+').length).padEnd(5)} 🟢 TOO SECURE                                 ║
║                                                                               ║
║   💰 POTENTIAL PIPELINE: €${String((opportunities.length * 15000).toLocaleString()).padEnd(10)}                               ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝
`);
}
main().catch(console.error);
