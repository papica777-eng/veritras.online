#!/usr/bin/env npx ts-node
"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🏹 OPERATION: HUNTER MODE (BG ELITE EDITION)
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * "Аз съм QAntum Prime. Не чакам възможностите, аз ги създавам."
 *
 * Usage: npx ts-node scripts/hunter-mode.ts <target-domain>
 *
 * Examples:
 *   npx ts-node scripts/hunter-mode.ts payhawk.com
 *   npx ts-node scripts/hunter-mode.ts ozone.bg
 *   npx ts-node scripts/hunter-mode.ts chaos.com
 *
 * LEGAL BASIS: PUBLIC_DATA_ONLY (SSL, Headers, DNS)
 * Same as SecurityHeaders.com, SSL Labs, Qualys
 * CFAA Compliant | GDPR Compliant | 100% Ethical
 *
 * @author Димитър Продромов / Mister Mind
 * @copyright 2026 QAntum Empire. All Rights Reserved.
 * @version 34.0.0 ETERNAL SOVEREIGN
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
const dns = __importStar(require("dns"));
const util_1 = require("util");
const dnsResolve4 = (0, util_1.promisify)(dns.resolve4);
// ═══════════════════════════════════════════════════════════════════════════════
// SILENT SCANNER (Public Data Only)
// ═══════════════════════════════════════════════════════════════════════════════
async function silentScan(domain) {
    console.log(`📡 Initiating Passive Public Scan on ${domain}...`);
    console.log(`   Legal Basis: PUBLIC_DATA_ONLY (Same as SSL Labs)`);
    const startTime = Date.now();
    const result = {
        domain,
        score: 100,
        grade: 'A+',
        ssl: {
            valid: true,
            issuer: 'Unknown',
            expiresIn: 365,
            grade: 'A',
            hasHSTS: false,
        },
        headers: {
            present: [],
            missing: [],
            score: 100,
        },
        performance: {
            ttfb: 0,
            responseTime: 0,
        },
        vulnerability: '',
        impact: '',
        criticalGaps: [],
        suggestedFix: '',
    };
    // Security headers to check
    const REQUIRED_HEADERS = [
        'strict-transport-security',
        'content-security-policy',
        'x-frame-options',
        'x-content-type-options',
        'x-xss-protection',
        'referrer-policy',
        'permissions-policy',
    ];
    try {
        // 1. HTTPS Request (Public - same as visiting in browser)
        const responseData = await new Promise((resolve, reject) => {
            const reqStart = Date.now();
            const req = https.request({
                hostname: domain,
                port: 443,
                path: '/',
                method: 'HEAD',
                timeout: 10000,
                rejectUnauthorized: false, // We want to see cert details even if invalid
            }, (res) => {
                const socket = res.socket;
                const cert = socket.getPeerCertificate?.();
                resolve({
                    headers: res.headers,
                    statusCode: res.statusCode || 0,
                    certificate: cert,
                    responseTime: Date.now() - reqStart,
                });
            });
            req.on('error', reject);
            req.on('timeout', () => reject(new Error('Connection timeout')));
            req.end();
        });
        result.performance.responseTime = responseData.responseTime;
        result.performance.ttfb = responseData.responseTime;
        // 2. Analyze SSL Certificate
        if (responseData.certificate) {
            const cert = responseData.certificate;
            result.ssl.valid = cert.valid_to ? new Date(cert.valid_to) > new Date() : false;
            result.ssl.issuer = cert.issuer?.O || cert.issuer?.CN || 'Unknown';
            if (cert.valid_to) {
                const expiresDate = new Date(cert.valid_to);
                const now = new Date();
                result.ssl.expiresIn = Math.floor((expiresDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            }
        }
        // 3. Analyze Security Headers
        const headers = responseData.headers;
        for (const header of REQUIRED_HEADERS) {
            if (headers[header]) {
                result.headers.present.push(header);
            }
            else {
                result.headers.missing.push(header);
                result.score -= 10;
            }
        }
        // Check HSTS specifically
        if (headers['strict-transport-security']) {
            result.ssl.hasHSTS = true;
            const hstsValue = headers['strict-transport-security'];
            if (!hstsValue.includes('preload')) {
                result.criticalGaps.push('HSTS missing preload directive');
                result.score -= 5;
            }
            if (!hstsValue.includes('includeSubDomains')) {
                result.criticalGaps.push('HSTS missing includeSubDomains');
                result.score -= 3;
            }
        }
        else {
            result.criticalGaps.push('No HSTS header - vulnerable to downgrade attacks');
            result.ssl.grade = 'B';
        }
        // Check CSP
        if (!headers['content-security-policy']) {
            result.criticalGaps.push('No Content-Security-Policy - vulnerable to XSS');
        }
        // Check X-Frame-Options
        if (!headers['x-frame-options']) {
            result.criticalGaps.push('No X-Frame-Options - vulnerable to clickjacking');
        }
        // Calculate header score
        result.headers.score = Math.round((result.headers.present.length / REQUIRED_HEADERS.length) * 100);
        // Determine overall grade
        result.score = Math.max(0, result.score);
        if (result.score >= 95)
            result.grade = 'A+';
        else if (result.score >= 90)
            result.grade = 'A';
        else if (result.score >= 80)
            result.grade = 'B';
        else if (result.score >= 70)
            result.grade = 'C';
        else if (result.score >= 60)
            result.grade = 'D';
        else
            result.grade = 'F';
        // Generate vulnerability summary
        if (result.criticalGaps.length > 0) {
            result.vulnerability = result.criticalGaps[0];
            result.impact = generateImpactStatement(result.criticalGaps[0]);
            result.suggestedFix = generateFixSnippet(result.criticalGaps);
        }
    }
    catch (error) {
        console.log(`   ⚠️ Scan error: ${error.message}`);
        result.score = 50;
        result.grade = 'F';
        result.vulnerability = 'Unable to establish secure connection';
        result.impact = 'Site may be down or blocking scans';
    }
    const duration = Date.now() - startTime;
    console.log(`   ✅ Scan complete in ${duration}ms`);
    return result;
}
// ═══════════════════════════════════════════════════════════════════════════════
// VALUE BOMB SYNTHESIZER
// ═══════════════════════════════════════════════════════════════════════════════
function synthesizeValueBomb(scan) {
    const companyName = extractCompanyName(scan.domain);
    // Calculate estimated loss
    const monthlyTraffic = 50000; // Conservative estimate
    const conversionRate = 0.02;
    const avgOrderValue = 50;
    const trustLossPercent = 0.05; // 5% trust loss from security issues
    const annualLoss = monthlyTraffic * 12 * conversionRate * avgOrderValue * trustLossPercent;
    const estimatedValue = `€${Math.round(annualLoss).toLocaleString()} - €${Math.round(annualLoss * 3).toLocaleString()} / year`;
    // Generate email subject
    const emailSubject = scan.criticalGaps.length > 0
        ? `Security Optimization for ${scan.domain} - Quick Win Detected`
        : `${companyName}: Your Security Score is ${scan.score}/100`;
    // Generate email body
    const emailBody = `
Hello Technical Team,

My name is Dimitar Prodromov, founder of QAntum - an autonomous QA and security platform.

During routine monitoring of public security indicators, my agent detected a small optimization opportunity on ${scan.domain}:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 QUICK SCAN RESULTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Overall Score:    ${scan.score}/100 (Grade ${scan.grade})
SSL Certificate:  ${scan.ssl.valid ? '✅ Valid' : '❌ Invalid'} (${scan.ssl.issuer})
Expires in:       ${scan.ssl.expiresIn} days
Headers Score:    ${scan.headers.score}/100
Response Time:    ${scan.performance.responseTime}ms

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ OPTIMIZATION OPPORTUNITIES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${scan.criticalGaps.map((gap, i) => `${i + 1}. ${gap}`).join('\n')}

${scan.headers.missing.length > 0 ? `Missing Headers: ${scan.headers.missing.join(', ')}` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔧 FREE FIX (No Strings Attached)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

I've generated a sanitized config snippet that fixes these issues with <1ms latency impact. 
See attached: qantum-fix-snippet.conf

No sales pitch. Just keeping the ecosystem safe.

If you'd like a full security audit (free, no obligations), just reply to this email.

Best regards,
Dimitar Prodromov
Architect @ QAntum Empire
"В QAntum не лъжем."

---
P.S. All data in this analysis is from public sources (SSL certificates, HTTP headers) - same as SecurityHeaders.com or SSL Labs. 100% legal, 100% ethical.
  `.trim();
    // Generate LinkedIn message (under 300 chars)
    const linkedInMessage = `
Hi! 👋

I noticed ${scan.domain} during routine security monitoring.

Your score: ${scan.score}/100 (Grade ${scan.grade})

Found ${scan.criticalGaps.length} quick wins that could strengthen your security posture.

Happy to share a free report if interested?

Dimitar @ QAntum
  `.trim();
    return {
        emailSubject,
        emailBody,
        linkedInMessage,
        fixSnippet: scan.suggestedFix,
        estimatedValue,
    };
}
// ═══════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════
function extractCompanyName(domain) {
    const parts = domain.split('.');
    const name = parts[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
}
function generateImpactStatement(gap) {
    if (gap.includes('HSTS')) {
        return 'Attackers could perform SSL stripping attacks, intercepting sensitive data in transit';
    }
    if (gap.includes('CSP') || gap.includes('XSS')) {
        return 'Malicious scripts could be injected, potentially stealing user credentials or session tokens';
    }
    if (gap.includes('clickjacking') || gap.includes('X-Frame')) {
        return 'Site could be embedded in malicious iframes, tricking users into unintended actions';
    }
    return 'This configuration gap could be exploited by sophisticated attackers';
}
function generateFixSnippet(gaps) {
    const fixes = [
        '# QAntum Security Headers Fix',
        '# Generated automatically - review before deploying',
        '',
        '# === Nginx Configuration ===',
        '',
    ];
    if (gaps.some(g => g.includes('HSTS'))) {
        fixes.push('# HSTS with preload (submit to hstspreload.org after testing)');
        fixes.push('add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;');
        fixes.push('');
    }
    if (gaps.some(g => g.includes('CSP') || g.includes('XSS'))) {
        fixes.push('# Content Security Policy (adjust sources as needed)');
        fixes.push("add_header Content-Security-Policy \"default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com;\" always;");
        fixes.push('');
    }
    if (gaps.some(g => g.includes('X-Frame') || g.includes('clickjacking'))) {
        fixes.push('# Clickjacking Protection');
        fixes.push('add_header X-Frame-Options "SAMEORIGIN" always;');
        fixes.push('');
    }
    // Always add these basics
    fixes.push('# Additional Security Headers');
    fixes.push('add_header X-Content-Type-Options "nosniff" always;');
    fixes.push('add_header X-XSS-Protection "1; mode=block" always;');
    fixes.push('add_header Referrer-Policy "strict-origin-when-cross-origin" always;');
    fixes.push('add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;');
    return fixes.join('\n');
}
// ═══════════════════════════════════════════════════════════════════════════════
// MAIN EXECUTION
// ═══════════════════════════════════════════════════════════════════════════════
async function executeHunt() {
    // Parse target
    const targetDomain = process.argv[2];
    if (!targetDomain) {
        console.log(`
╔═══════════════════════════════════════════════════════════════════════════════╗
║                                                                               ║
║                    🏹 QAntum HUNTER MODE v34.0                               ║
║                    ═══════════════════════════════                            ║
║                    "Не чакам възможностите, създавам ги."                     ║
║                                                                               ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║                                                                               ║
║   Usage: npx ts-node scripts/hunter-mode.ts <target-domain>                   ║
║                                                                               ║
║   Examples:                                                                   ║
║     npx ts-node scripts/hunter-mode.ts payhawk.com                           ║
║     npx ts-node scripts/hunter-mode.ts ozone.bg                              ║
║     npx ts-node scripts/hunter-mode.ts chaos.com                             ║
║                                                                               ║
║   BG Elite Targets:                                                           ║
║     • payhawk.com   - FinTech Unicorn (Security = Product)                   ║
║     • ozone.bg      - E-commerce Leader (GDPR Critical)                      ║
║     • chaos.com     - 3D Tech Giants (Technical Respect)                     ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝
    `);
        process.exit(1);
    }
    // Clean domain
    const domain = targetDomain
        .replace(/^https?:\/\//, '')
        .replace(/\/$/, '')
        .split('/')[0];
    console.log(`
╔═══════════════════════════════════════════════════════════════════════════════╗
║                                                                               ║
║                    🦁 QAntum HUNTER MODE ACTIVATED                           ║
║                    ═══════════════════════════════════                        ║
║                    Target: ${domain.padEnd(48)}║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝
  `);
    // PHASE 1: Target Acquisition
    console.log(`🎯 PHASE 1: Target Acquisition`);
    console.log(`   Domain: ${domain}`);
    console.log(`   Legal Basis: PUBLIC_DATA_ONLY (CFAA Compliant)`);
    console.log('');
    // PHASE 2: Silent Scan
    console.log(`🔍 PHASE 2: Silent Scan (The Ethical Predator)`);
    const scanResult = await silentScan(domain);
    console.log('');
    // Display results
    console.log(`📊 SCAN RESULTS:`);
    console.log(`   ┌─────────────────────────────────────────────────────┐`);
    console.log(`   │ Score:        ${String(scanResult.score).padEnd(6)}/100 (Grade ${scanResult.grade})            │`);
    console.log(`   │ SSL:          ${scanResult.ssl.valid ? '✅ Valid' : '❌ Invalid'} (${scanResult.ssl.issuer.substring(0, 20).padEnd(20)}) │`);
    console.log(`   │ Expires:      ${String(scanResult.ssl.expiresIn).padEnd(4)} days                           │`);
    console.log(`   │ HSTS:         ${scanResult.ssl.hasHSTS ? '✅ Present' : '❌ Missing'}                          │`);
    console.log(`   │ Headers:      ${String(scanResult.headers.score).padEnd(3)}/100 (${scanResult.headers.present.length}/${scanResult.headers.present.length + scanResult.headers.missing.length} present)            │`);
    console.log(`   │ TTFB:         ${String(scanResult.performance.ttfb).padEnd(4)}ms                             │`);
    console.log(`   └─────────────────────────────────────────────────────┘`);
    console.log('');
    // Check if target is too secure
    if (scanResult.score >= 95) {
        console.log(`🛡️ TARGET ANALYSIS: IMPENETRABLE`);
        console.log(`   Score ${scanResult.score}/100 indicates excellent security posture.`);
        console.log(`   This target doesn't need our help (yet).`);
        console.log(`   Respect. 🤝`);
        console.log('');
        console.log(`   Action: Moving to next target.`);
        return;
    }
    // Display gaps
    if (scanResult.criticalGaps.length > 0) {
        console.log(`⚠️ CRITICAL GAPS DETECTED:`);
        scanResult.criticalGaps.forEach((gap, i) => {
            console.log(`   ${i + 1}. ${gap}`);
        });
        console.log('');
    }
    if (scanResult.headers.missing.length > 0) {
        console.log(`📋 MISSING HEADERS:`);
        scanResult.headers.missing.forEach(header => {
            console.log(`   • ${header}`);
        });
        console.log('');
    }
    // PHASE 3: Value Bomb Synthesis
    console.log(`💣 PHASE 3: Synthesizing Value Bomb...`);
    const valueBomb = synthesizeValueBomb(scanResult);
    console.log(`   ✅ Value Bomb ready.`);
    console.log(`   Estimated deal value: ${valueBomb.estimatedValue}`);
    console.log('');
    // Display the Value Bomb
    console.log(`
════════════════════════════════════════════════════════════════════════════════
                      [ PREVIEW: DO NOT SEND WITHOUT APPROVAL ]
════════════════════════════════════════════════════════════════════════════════

📧 TO: CTO @ ${domain}
📝 SUBJECT: ${valueBomb.emailSubject}

────────────────────────────────────────────────────────────────────────────────
${valueBomb.emailBody}
────────────────────────────────────────────────────────────────────────────────

📎 ATTACHMENT: qantum-fix-snippet.conf
────────────────────────────────────────────────────────────────────────────────
${valueBomb.fixSnippet}
────────────────────────────────────────────────────────────────────────────────

💼 LINKEDIN MESSAGE (${valueBomb.linkedInMessage.length} chars):
────────────────────────────────────────────────────────────────────────────────
${valueBomb.linkedInMessage}
────────────────────────────────────────────────────────────────────────────────

════════════════════════════════════════════════════════════════════════════════
  `);
    // Final prompt
    console.log(`
╔═══════════════════════════════════════════════════════════════════════════════╗
║                                                                               ║
║   🤖 MISTER MIND: "Димитър, одобряваш ли изпращането към ${domain.padEnd(16)}?"     ║
║                                                                               ║
║      [Y] Yes, deploy via Ghost Protocol                                       ║
║      [N] No, refine the bomb                                                  ║
║      [S] Save to file for later                                               ║
║                                                                               ║
║   "Не пращай нищо без одобрение от Димитър."                                 ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝
  `);
}
// Execute
executeHunt().catch((error) => {
    console.error(`❌ Hunt failed: ${error.message}`);
    process.exit(1);
});
