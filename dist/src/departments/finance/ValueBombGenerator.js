"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * VALUE BOMB GENERATOR - The AI-Powered Proposal Engine
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * "Даваме толкова безплатна стойност, че плащането става естествено."
 *
 * Value Bombs are FREE, comprehensive technical analyses that:
 * 1. Demonstrate our expertise (credibility)
 * 2. Create obligation through reciprocity (psychology)
 * 3. Make the "ask" obvious (conversion)
 * 4. Position competitors as inferior (comparison)
 *
 * @author Димитър Продромов / Mister Mind
 * @copyright 2026 QAntum Empire. All Rights Reserved.
 * @version 1.0.0-QAntum
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValueBombGenerator = void 0;
const events_1 = require("events");
const fs_1 = require("fs");
const path_1 = require("path");
const PublicScanner_1 = require("../intelligence/PublicScanner");
// ═══════════════════════════════════════════════════════════════════════════════
// VALUE BOMB GENERATOR
// ═══════════════════════════════════════════════════════════════════════════════
class ValueBombGenerator extends events_1.EventEmitter {
    static instance;
    // Pricing tiers (monthly)
    static PRICING = {
        STARTUP: { min: 299, max: 499, name: 'Startup' },
        GROWTH: { min: 999, max: 2499, name: 'Growth' },
        ENTERPRISE: { min: 4999, max: 9999, name: 'Enterprise' },
        SUPREME: { min: 15000, max: 50000, name: 'Supreme Partnership' },
    };
    // Modules
    scanner = PublicScanner_1.PublicScanner.getInstance();
    // State
    valueBombs = new Map();
    // Paths
    DATA_PATH = (0, path_1.join)(process.cwd(), 'data', 'value-bombs');
    BOMBS_FILE;
    constructor() {
        super();
        this.BOMBS_FILE = (0, path_1.join)(this.DATA_PATH, 'history.json');
        this.ensureDirectories();
        this.loadHistory();
        console.log(`
💣 ═══════════════════════════════════════════════════════════════════════════════
   VALUE BOMB GENERATOR v33.1 - THE RECIPROCITY ENGINE
   ─────────────────────────────────────────────────────────────────────────────
   Generated: ${this.valueBombs.size} bombs
   "Даваме стойност, докато не могат да откажат."
═══════════════════════════════════════════════════════════════════════════════
    `);
    }
    static getInstance() {
        if (!ValueBombGenerator.instance) {
            ValueBombGenerator.instance = new ValueBombGenerator();
        }
        return ValueBombGenerator.instance;
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // GENERATION
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Generate a comprehensive Value Bomb for a target.
     */
    // Complexity: O(N) — linear iteration
    async generate(targetDomain, companyName) {
        console.log(`\n💣 [BOMB] Generating Value Bomb for ${companyName}...`);
        // Scan the target
        // SAFETY: async operation — wrap in try-catch for production resilience
        const scanResult = await this.scanner.scan(`https://${targetDomain}`);
        // Build sections based on findings
        const sections = this.buildSections(scanResult);
        // Calculate total value
        const totalEstimatedValue = sections.reduce((sum, s) => sum + s.estimatedValue, 0);
        // Determine pricing tier
        const pricingTier = this.determinePricingTier(totalEstimatedValue, scanResult.overallScore);
        // Generate content
        const executiveSummary = this.generateExecutiveSummary(companyName, scanResult, sections);
        const callToAction = this.generateCTA(pricingTier, totalEstimatedValue);
        const markdownContent = this.generateMarkdown(companyName, targetDomain, scanResult, sections, executiveSummary, callToAction, pricingTier);
        const htmlContent = this.markdownToHtml(markdownContent);
        const bomb = {
            id: `VB-${Date.now().toString(36).toUpperCase()}`,
            targetDomain,
            targetCompany: companyName,
            generatedAt: new Date(),
            scanResult,
            sections,
            executiveSummary,
            totalEstimatedValue,
            pricingTier,
            callToAction,
            markdownContent,
            htmlContent,
        };
        // Save the bomb
        this.valueBombs.set(bomb.id, bomb);
        this.saveHistory();
        this.saveBombFile(bomb);
        console.log(`   └─ Sections: ${sections.length}`);
        console.log(`   └─ Estimated Value: $${totalEstimatedValue.toLocaleString()}`);
        console.log(`   └─ Tier: ${pricingTier}`);
        console.log(`   └─ Saved: ${bomb.id}.md`);
        this.emit('bomb:generated', bomb);
        return bomb;
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // SECTION BUILDING
    // ═══════════════════════════════════════════════════════════════════════════
    // Complexity: O(N) — linear iteration
    buildSections(scan) {
        const sections = [];
        // SSL/TLS Section
        if (scan.ssl) {
            const sslFindings = [];
            const sslRecs = [];
            let sslValue = 0;
            if (!scan.ssl.valid) {
                sslFindings.push({
                    category: 'SSL',
                    issue: 'Invalid SSL certificate',
                    impact: 'Visitors see security warnings, destroying trust',
                    solution: 'Install valid SSL certificate from trusted CA',
                    effort: 'LOW',
                });
                sslValue += 5000;
                sslRecs.push('Immediate SSL certificate replacement required');
            }
            if (scan.ssl.daysUntilExpiry !== null && scan.ssl.daysUntilExpiry < 30) {
                sslFindings.push({
                    category: 'SSL',
                    issue: `Certificate expires in ${scan.ssl.daysUntilExpiry} days`,
                    impact: 'Site will become inaccessible when certificate expires',
                    solution: 'Implement automated certificate renewal (Let\'s Encrypt)',
                    effort: 'MEDIUM',
                });
                sslValue += 2500;
                sslRecs.push('Setup automated certificate monitoring and renewal');
            }
            if (sslFindings.length > 0) {
                sections.push({
                    title: '🔒 SSL/TLS Security',
                    findings: sslFindings,
                    recommendations: sslRecs,
                    estimatedValue: sslValue,
                    priority: !scan.ssl.valid ? 'CRITICAL' : 'HIGH',
                });
            }
        }
        // Security Headers Section
        if (scan.headers) {
            const headerFindings = [];
            const headerRecs = [];
            const missingHeaders = scan.headers.missing;
            if (missingHeaders.length > 0) {
                for (const header of missingHeaders) {
                    headerFindings.push({
                        category: 'Headers',
                        issue: `Missing ${header} header`,
                        impact: this.getHeaderImpact(header),
                        solution: `Add ${header} header with recommended configuration`,
                        effort: 'LOW',
                    });
                }
                headerRecs.push(`Implement ${missingHeaders.length} missing security headers`);
            }
            if (headerFindings.length > 0) {
                sections.push({
                    title: '🛡️ Security Headers',
                    findings: headerFindings,
                    recommendations: headerRecs,
                    estimatedValue: missingHeaders.length * 1500,
                    priority: missingHeaders.length > 3 ? 'CRITICAL' : 'HIGH',
                });
            }
        }
        // Performance Section
        if (scan.performance) {
            const perfFindings = [];
            const perfRecs = [];
            let perfValue = 0;
            if (scan.performance.ttfb > 500) {
                perfFindings.push({
                    category: 'Performance',
                    issue: `Slow Time to First Byte: ${scan.performance.ttfb}ms`,
                    impact: 'Poor user experience, lower search rankings',
                    solution: 'Optimize server response time, implement caching',
                    effort: 'MEDIUM',
                });
                perfValue += 3000;
                perfRecs.push('Server-side optimization needed');
            }
            if (scan.performance.totalTime > 2000) {
                perfFindings.push({
                    category: 'Performance',
                    issue: `Slow total load time: ${scan.performance.totalTime}ms`,
                    impact: 'Users abandon slow sites - every 100ms costs 1% conversion',
                    solution: 'Implement CDN, optimize assets, enable compression',
                    effort: 'MEDIUM',
                });
                perfValue += 5000;
                perfRecs.push('Full performance audit and optimization');
            }
            if (perfFindings.length > 0) {
                sections.push({
                    title: '⚡ Performance Analysis',
                    findings: perfFindings,
                    recommendations: perfRecs,
                    estimatedValue: perfValue,
                    priority: scan.performance.totalTime > 3000 ? 'CRITICAL' : 'MEDIUM',
                });
            }
        }
        // DNS/Email Security Section
        if (scan.dns) {
            const dnsFindings = [];
            const dnsRecs = [];
            let dnsValue = 0;
            if (!scan.dns.hasSPF) {
                dnsFindings.push({
                    category: 'Email',
                    issue: 'Missing SPF record',
                    impact: 'Emails may be marked as spam, phishing vulnerability',
                    solution: 'Configure SPF record in DNS',
                    effort: 'LOW',
                });
                dnsValue += 1000;
            }
            if (!scan.dns.hasDMARC) {
                dnsFindings.push({
                    category: 'Email',
                    issue: 'Missing DMARC record',
                    impact: 'No protection against email spoofing',
                    solution: 'Implement DMARC policy',
                    effort: 'LOW',
                });
                dnsValue += 1500;
            }
            if (dnsFindings.length > 0) {
                dnsRecs.push('Complete email authentication setup (SPF/DKIM/DMARC)');
                sections.push({
                    title: '📧 Email Security',
                    findings: dnsFindings,
                    recommendations: dnsRecs,
                    estimatedValue: dnsValue,
                    priority: 'MEDIUM',
                });
            }
        }
        // Add critical issues as separate section
        if (scan.criticalIssues.length > 0) {
            const critFindings = scan.criticalIssues.map(issue => ({
                category: 'Critical',
                issue: issue,
                impact: 'Severe security or operational risk',
                solution: 'Immediate remediation required',
                effort: 'HIGH',
            }));
            sections.push({
                title: '🚨 Critical Issues',
                findings: critFindings,
                recommendations: ['Engage QAntum for emergency remediation'],
                estimatedValue: scan.criticalIssues.length * 5000,
                priority: 'CRITICAL',
            });
        }
        return sections;
    }
    // Complexity: O(1) — hash/map lookup
    getHeaderImpact(header) {
        const impacts = {
            'Strict-Transport-Security': 'Vulnerable to SSL stripping attacks',
            'X-Content-Type-Options': 'Vulnerable to MIME-type confusion attacks',
            'X-Frame-Options': 'Vulnerable to clickjacking attacks',
            'Content-Security-Policy': 'Vulnerable to XSS and injection attacks',
            'X-XSS-Protection': 'Reduced XSS protection in older browsers',
            'Referrer-Policy': 'Privacy leakage through referrer headers',
            'Permissions-Policy': 'No control over browser feature access',
        };
        return impacts[header] || 'Security vulnerability';
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // CONTENT GENERATION
    // ═══════════════════════════════════════════════════════════════════════════
    // Complexity: O(N) — linear iteration
    generateExecutiveSummary(company, scan, sections) {
        const criticalCount = sections.filter(s => s.priority === 'CRITICAL').length;
        const totalValue = sections.reduce((sum, s) => sum + s.estimatedValue, 0);
        let severity;
        if (scan.overallScore >= 80)
            severity = 'good foundation with optimization opportunities';
        else if (scan.overallScore >= 60)
            severity = 'several areas requiring attention';
        else
            severity = 'critical vulnerabilities requiring immediate action';
        return `
## Executive Summary

Our automated analysis of **${company}** revealed ${severity}.

### Key Metrics
- **Overall Security Score:** ${scan.overallScore}/100
- **Critical Issues:** ${criticalCount}
- **Optimization Opportunities:** ${sections.length}
- **Sovereign Code Integrity:** 860,503 verified lines of Rust/TS
- **Estimated Annual Value at Risk:** $${totalValue.toLocaleString()}

### Why This Matters
${criticalCount > 0
            ? 'The critical issues identified could lead to data breaches, regulatory fines, or reputational damage.'
            : 'While no critical issues were found, the identified improvements could significantly enhance security and performance.'}

This analysis was provided **free of charge** by QAntum to demonstrate our commitment to web security and autonomous digital sovereignty. Our platform is built on 860,503 lines of sovereign code, ensuring maximum performance and zero data leakage to third-party providers.
    `.trim();
    }
    // Complexity: O(N)
    generateCTA(tier, value) {
        const pricing = ValueBombGenerator.PRICING[tier];
        const roi = Math.round(value / pricing.min);
        return `
## Next Steps

### 🎯 Recommended Action: ${pricing.name} Plan

**Investment:** $${pricing.min.toLocaleString()} - $${pricing.max.toLocaleString()}/month
**Estimated Annual Value:** $${value.toLocaleString()}
**ROI:** ${roi}x within first year

### What's Included:
- Full implementation of all recommendations
- Continuous monitoring and alerting
- Monthly security assessments
- Priority support (24/7 for Enterprise+)
- "Verified by QAntum" Trust Badge

### 📞 Schedule Your Free Strategy Call
**Email:** enterprise@QAntum.dev
**Calendar:** https://cal.com/QAntum/strategy

---
*This report was generated by QAntum OMEGA (860,503 lines of sovereign code)*
*"Ние не продаваме страх. Ние продаваме сигурност."*
    `.trim();
    }
    // Complexity: O(1)
    determinePricingTier(value, score) {
        if (value > 30000 || score < 40)
            return 'SUPREME';
        if (value > 15000 || score < 60)
            return 'ENTERPRISE';
        if (value > 5000 || score < 75)
            return 'GROWTH';
        return 'STARTUP';
    }
    // Complexity: O(N*M) — nested iteration detected
    generateMarkdown(company, domain, scan, sections, summary, cta, tier) {
        let md = `# Security & Performance Analysis
## ${company} (${domain})
### Generated: ${new Date().toISOString().split('T')[0]}

---

${summary}

---

# Detailed Findings

`;
        for (const section of sections) {
            md += `## ${section.title}\n\n`;
            md += `**Priority:** ${section.priority} | **Estimated Value:** $${section.estimatedValue.toLocaleString()}\n\n`;
            for (const finding of section.findings) {
                md += `### ${finding.issue}\n\n`;
                md += `- **Impact:** ${finding.impact}\n`;
                md += `- **Solution:** ${finding.solution}\n`;
                md += `- **Effort:** ${finding.effort}\n\n`;
            }
            md += `**Recommendations:**\n`;
            for (const rec of section.recommendations) {
                md += `- ${rec}\n`;
            }
            md += '\n---\n\n';
        }
        md += cta;
        return md;
    }
    // Complexity: O(1)
    markdownToHtml(md) {
        // Simple markdown to HTML conversion
        return md
            .replace(/^### (.*$)/gm, '<h3>$1</h3>')
            .replace(/^## (.*$)/gm, '<h2>$1</h2>')
            .replace(/^# (.*$)/gm, '<h1>$1</h1>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/^- (.*$)/gm, '<li>$1</li>')
            .replace(/\n/g, '<br>');
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // PERSISTENCE
    // ═══════════════════════════════════════════════════════════════════════════
    // Complexity: O(1)
    ensureDirectories() {
        if (!(0, fs_1.existsSync)(this.DATA_PATH)) {
            // Complexity: O(1)
            (0, fs_1.mkdirSync)(this.DATA_PATH, { recursive: true });
        }
    }
    // Complexity: O(1)
    saveBombFile(bomb) {
        const filePath = (0, path_1.join)(this.DATA_PATH, `${bomb.id}.md`);
        // Complexity: O(1)
        (0, fs_1.writeFileSync)(filePath, bomb.markdownContent);
    }
    // Complexity: O(N) — linear iteration
    loadHistory() {
        try {
            if ((0, fs_1.existsSync)(this.BOMBS_FILE)) {
                const data = JSON.parse((0, fs_1.readFileSync)(this.BOMBS_FILE, 'utf-8'));
                for (const bomb of data) {
                    bomb.generatedAt = new Date(bomb.generatedAt);
                    this.valueBombs.set(bomb.id, bomb);
                }
            }
        }
        catch {
            // Start fresh
        }
    }
    // Complexity: O(N) — linear iteration
    saveHistory() {
        const data = Array.from(this.valueBombs.values()).map(b => ({
            id: b.id,
            targetDomain: b.targetDomain,
            targetCompany: b.targetCompany,
            generatedAt: b.generatedAt,
            totalEstimatedValue: b.totalEstimatedValue,
            pricingTier: b.pricingTier,
        }));
        // Complexity: O(1)
        (0, fs_1.writeFileSync)(this.BOMBS_FILE, JSON.stringify(data, null, 2));
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // PUBLIC API
    // ═══════════════════════════════════════════════════════════════════════════
    // Complexity: O(1) — hash/map lookup
    getBomb(id) {
        return this.valueBombs.get(id);
    }
    // Complexity: O(1)
    getAllBombs() {
        return Array.from(this.valueBombs.values());
    }
    // Complexity: O(N) — linear iteration
    getStats() {
        const bombs = this.getAllBombs();
        return {
            totalGenerated: bombs.length,
            totalValueIdentified: bombs.reduce((sum, b) => sum + b.totalEstimatedValue, 0),
            tierBreakdown: {
                startup: bombs.filter(b => b.pricingTier === 'STARTUP').length,
                growth: bombs.filter(b => b.pricingTier === 'GROWTH').length,
                enterprise: bombs.filter(b => b.pricingTier === 'ENTERPRISE').length,
                supreme: bombs.filter(b => b.pricingTier === 'SUPREME').length,
            },
        };
    }
}
exports.ValueBombGenerator = ValueBombGenerator;
// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════
exports.default = ValueBombGenerator;
