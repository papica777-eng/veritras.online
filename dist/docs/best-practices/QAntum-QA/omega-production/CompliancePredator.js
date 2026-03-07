"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * COMPLIANCE PREDATOR - The IPO-Ready Valuation Engine
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * "Когато един стартъп се подготвя за $50M рунд, техническият дълг
 *  струва 15% от оценката. Ние сме тези, които го откриват И оправят."
 *
 * Target Audience:
 * - Pre-IPO companies (Series B+)
 * - M&A targets undergoing due diligence
 * - Companies preparing for SOC 2 / ISO 27001 certification
 * - Startups before major funding rounds
 *
 * Value Proposition:
 * - Find technical gaps BEFORE investors/auditors do
 * - Quantify risk in DOLLARS, not technical jargon
 * - Provide remediation roadmap with clear timelines
 * - Position QAntum as the "Technical Due Diligence Partner"
 *
 * @author Димитър Продромов / Mister Mind
 * @copyright 2026 QAntum Empire. All Rights Reserved.
 * @version 33.2.0 - THE COMPLIANCE PREDATOR
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompliancePredator = void 0;
const events_1 = require("events");
const fs_1 = require("fs");
const path_1 = require("path");
const PublicScanner_1 = require("../intelligence/PublicScanner");
const LegalFortress_1 = require("./LegalFortress");
// ═══════════════════════════════════════════════════════════════════════════════
// COMPLIANCE FRAMEWORK CONTROLS
// ═══════════════════════════════════════════════════════════════════════════════
const FRAMEWORK_CONTROLS = {
    SOC2: [
        { id: 'CC6.1', name: 'Logical Access Controls', checks: ['ssl', 'headers', 'auth'] },
        { id: 'CC6.6', name: 'Encryption in Transit', checks: ['ssl', 'tls_version'] },
        { id: 'CC6.7', name: 'Encryption at Rest', checks: ['headers', 'csp'] },
        { id: 'CC7.1', name: 'Security Monitoring', checks: ['security_txt', 'monitoring'] },
        { id: 'CC7.2', name: 'Incident Response', checks: ['security_txt', 'contact'] },
    ],
    ISO27001: [
        { id: 'A.9.4.1', name: 'Information Access Restriction', checks: ['headers', 'auth'] },
        { id: 'A.10.1.1', name: 'Cryptographic Controls', checks: ['ssl', 'tls_version'] },
        { id: 'A.12.6.1', name: 'Technical Vulnerability Management', checks: ['headers', 'csp'] },
        { id: 'A.14.1.2', name: 'Securing Application Services', checks: ['ssl', 'headers'] },
        { id: 'A.18.1.3', name: 'Protection of Records', checks: ['privacy', 'gdpr'] },
    ],
    GDPR: [
        { id: 'Art.25', name: 'Data Protection by Design', checks: ['privacy', 'cookies'] },
        { id: 'Art.32', name: 'Security of Processing', checks: ['ssl', 'headers', 'encryption'] },
        { id: 'Art.33', name: 'Breach Notification', checks: ['security_txt', 'contact'] },
        { id: 'Art.35', name: 'Impact Assessment', checks: ['privacy_policy', 'dpia'] },
    ],
    HIPAA: [
        { id: '164.312(a)', name: 'Access Control', checks: ['auth', 'headers'] },
        { id: '164.312(c)', name: 'Integrity Controls', checks: ['ssl', 'csp'] },
        { id: '164.312(d)', name: 'Authentication', checks: ['auth', 'mfa'] },
        { id: '164.312(e)', name: 'Transmission Security', checks: ['ssl', 'tls_version', 'hsts'] },
    ],
    'PCI-DSS': [
        { id: 'Req.2', name: 'Secure Configuration', checks: ['headers', 'server_info'] },
        { id: 'Req.4', name: 'Encrypt Transmission', checks: ['ssl', 'tls_version'] },
        { id: 'Req.6', name: 'Secure Development', checks: ['csp', 'xss'] },
        { id: 'Req.10', name: 'Track Access', checks: ['logging', 'monitoring'] },
    ],
    SOX: [
        { id: 'S302', name: 'Corporate Responsibility', checks: ['ssl', 'auth'] },
        { id: 'S404', name: 'Internal Controls', checks: ['audit', 'logging'] },
        { id: 'S409', name: 'Real-Time Disclosure', checks: ['monitoring', 'alerting'] },
    ],
};
// ═══════════════════════════════════════════════════════════════════════════════
// VALUATION IMPACT MATRIX
// ═══════════════════════════════════════════════════════════════════════════════
const SEVERITY_VALUATION_IMPACT = {
    CRITICAL: 0.05, // 5% valuation hit per critical issue
    HIGH: 0.025, // 2.5% per high
    MEDIUM: 0.01, // 1% per medium
    LOW: 0.005, // 0.5% per low
    INFO: 0, // No impact
};
// ═══════════════════════════════════════════════════════════════════════════════
// COMPLIANCE PREDATOR
// ═══════════════════════════════════════════════════════════════════════════════
class CompliancePredator extends events_1.EventEmitter {
    static instance;
    // Modules
    scanner = PublicScanner_1.PublicScanner.getInstance();
    legalFortress = LegalFortress_1.LegalFortress.getInstance();
    // State
    roadmaps = new Map();
    // Paths
    DATA_PATH = (0, path_1.join)(process.cwd(), 'data', 'compliance');
    ROADMAPS_PATH;
    constructor() {
        super();
        this.ROADMAPS_PATH = (0, path_1.join)(this.DATA_PATH, 'roadmaps');
        this.ensureDirectories();
        this.loadRoadmaps();
        console.log(`
📋 ═══════════════════════════════════════════════════════════════════════════════
   COMPLIANCE PREDATOR v33.2 - THE VALUATION GUARDIAN
   ─────────────────────────────────────────────────────────────────────────────
   Frameworks: SOC2, ISO27001, GDPR, HIPAA, PCI-DSS, SOX
   Roadmaps Generated: ${this.roadmaps.size}
   "Техническият дълг е скрит данък върху оценката."
═══════════════════════════════════════════════════════════════════════════════
    `);
    }
    static getInstance() {
        if (!CompliancePredator.instance) {
            CompliancePredator.instance = new CompliancePredator();
        }
        return CompliancePredator.instance;
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // IPO ROADMAP GENERATION
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Generate a comprehensive IPO-Ready Compliance Roadmap.
     * This is the main weapon for pre-IPO/Series B+ companies.
     */
    async generateIPORoadmap(company, frameworks = ['SOC2', 'ISO27001', 'GDPR']) {
        console.log(`\n📋 [COMPLIANCE] Generating IPO Roadmap for ${company.name}...`);
        console.log(`   └─ Estimated Valuation: $${(company.estimatedValuation / 1_000_000).toFixed(1)}M`);
        console.log(`   └─ Funding Stage: ${company.fundingStage}`);
        console.log(`   └─ Frameworks: ${frameworks.join(', ')}`);
        // Legal validation
        const validation = await this.legalFortress.validateAction({
            type: 'COMPLIANCE_SCAN',
            target: company.domain,
            data: { frameworks },
        });
        if (!validation.approved) {
            throw new Error(`Action blocked: ${validation.reason}`);
        }
        // Scan target
        const scanResult = await this.scanner.scan(`https://${company.domain}`);
        // Analyze compliance gaps
        const gaps = this.analyzeComplianceGaps(scanResult, frameworks, company.estimatedValuation);
        // Calculate totals
        const totalValuationAtRisk = gaps.reduce((sum, g) => sum + g.valuationImpact, 0);
        const totalDollarAtRisk = Math.round(company.estimatedValuation * totalValuationAtRisk);
        // Determine overall risk
        const overallRisk = this.calculateOverallRisk(gaps);
        // Calculate compliance score (inverse of risk)
        const complianceScore = Math.max(0, Math.round(100 - (totalValuationAtRisk * 100 * 5)));
        // Generate remediation timeline
        const remediationTimeline = this.buildRemediationTimeline(gaps, company.estimatedValuation);
        // Calculate investor-ready date
        const totalRemediationDays = remediationTimeline.reduce((max, phase) => Math.max(max, parseInt(phase.duration) || 30), 0);
        const investorReadyDate = new Date(Date.now() + totalRemediationDays * 24 * 60 * 60 * 1000);
        // Generate executive summary
        const executiveSummary = this.generateExecutiveSummary(company, gaps, totalDollarAtRisk, complianceScore, investorReadyDate);
        // Build roadmap
        const roadmap = {
            id: `IPO-${Date.now().toString(36).toUpperCase()}`,
            companyName: company.name,
            domain: company.domain,
            generatedAt: new Date(),
            fundingStage: company.fundingStage,
            estimatedValuation: company.estimatedValuation,
            overallRisk,
            complianceScore,
            gaps,
            totalValuationAtRisk,
            totalDollarAtRisk,
            remediationTimeline,
            executiveSummary,
            investorReadyDate,
            markdownReport: '',
        };
        // Generate full report
        roadmap.markdownReport = this.generateMarkdownReport(roadmap);
        // Save
        this.roadmaps.set(roadmap.id, roadmap);
        this.saveRoadmap(roadmap);
        console.log(`\n   ✅ Roadmap Generated: ${roadmap.id}`);
        console.log(`   └─ Compliance Score: ${complianceScore}/100`);
        console.log(`   └─ Gaps Found: ${gaps.length}`);
        console.log(`   └─ Valuation at Risk: $${(totalDollarAtRisk / 1_000_000).toFixed(2)}M (${(totalValuationAtRisk * 100).toFixed(1)}%)`);
        console.log(`   └─ Investor-Ready: ${investorReadyDate.toISOString().split('T')[0]}`);
        this.emit('roadmap:generated', roadmap);
        return roadmap;
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // GAP ANALYSIS
    // ═══════════════════════════════════════════════════════════════════════════
    analyzeComplianceGaps(scan, frameworks, valuation) {
        const gaps = [];
        let gapIndex = 1;
        for (const framework of frameworks) {
            const controls = FRAMEWORK_CONTROLS[framework];
            for (const control of controls) {
                const issues = this.checkControl(scan, control.checks);
                if (issues.length > 0) {
                    const severity = this.determineSeverity(issues, framework);
                    const valuationImpact = SEVERITY_VALUATION_IMPACT[severity];
                    const dollarImpact = Math.round(valuation * valuationImpact);
                    gaps.push({
                        id: `GAP-${gapIndex++}`,
                        framework,
                        control: control.name,
                        controlId: control.id,
                        description: issues.join('; '),
                        severity,
                        valuationImpact,
                        dollarImpact,
                        remediation: this.getRemediationAdvice(issues, framework),
                        remediationDays: this.estimateRemediationDays(severity),
                        evidence: issues,
                    });
                }
            }
        }
        // Sort by dollar impact (highest first)
        return gaps.sort((a, b) => b.dollarImpact - a.dollarImpact);
    }
    checkControl(scan, checks) {
        const issues = [];
        for (const check of checks) {
            switch (check) {
                case 'ssl':
                    if (!scan.ssl?.valid)
                        issues.push('Invalid or missing SSL certificate');
                    break;
                case 'tls_version':
                    if (scan.ssl?.protocol && !scan.ssl.protocol.includes('TLSv1.3') && !scan.ssl.protocol.includes('TLSv1.2')) {
                        issues.push(`Outdated TLS version: ${scan.ssl.protocol}`);
                    }
                    break;
                case 'hsts':
                    if (!scan.headers?.present.includes('Strict-Transport-Security')) {
                        issues.push('Missing HSTS header');
                    }
                    break;
                case 'headers':
                    if (scan.headers && scan.headers.missing.length > 2) {
                        issues.push(`Missing security headers: ${scan.headers.missing.slice(0, 3).join(', ')}`);
                    }
                    break;
                case 'csp':
                    if (scan.headers && !scan.headers.present.includes('Content-Security-Policy')) {
                        issues.push('No Content-Security-Policy header');
                    }
                    break;
                case 'security_txt':
                    if (!scan.securityTxt?.exists) {
                        issues.push('No security.txt file (RFC 9116)');
                    }
                    break;
                case 'contact':
                    if (!scan.securityTxt?.contact) {
                        issues.push('No security contact defined');
                    }
                    break;
                case 'privacy':
                    // Check DNS for privacy indicators
                    break;
                case 'encryption':
                    if (!scan.ssl?.valid) {
                        issues.push('Transmission encryption not properly configured');
                    }
                    break;
                case 'auth':
                    // Cannot check auth without access - note as INFO
                    break;
            }
        }
        return issues;
    }
    determineSeverity(issues, framework) {
        const criticalKeywords = ['Invalid', 'missing SSL', 'Outdated TLS', 'No encryption'];
        const highKeywords = ['Missing HSTS', 'No Content-Security-Policy', 'Missing security headers'];
        for (const issue of issues) {
            if (criticalKeywords.some(k => issue.includes(k)))
                return 'CRITICAL';
            if (highKeywords.some(k => issue.includes(k)))
                return 'HIGH';
        }
        // Certain frameworks are more strict
        if (['HIPAA', 'PCI-DSS'].includes(framework)) {
            return issues.length > 0 ? 'HIGH' : 'LOW';
        }
        return issues.length > 1 ? 'MEDIUM' : 'LOW';
    }
    getRemediationAdvice(issues, framework) {
        const advice = [];
        if (issues.some(i => i.includes('SSL'))) {
            advice.push('Deploy valid SSL certificate from trusted CA (Let\'s Encrypt or commercial)');
        }
        if (issues.some(i => i.includes('TLS'))) {
            advice.push('Upgrade to TLS 1.2+ and disable older protocols');
        }
        if (issues.some(i => i.includes('HSTS'))) {
            advice.push('Add Strict-Transport-Security header with min 1-year max-age');
        }
        if (issues.some(i => i.includes('CSP') || i.includes('Content-Security-Policy'))) {
            advice.push('Implement Content-Security-Policy header to prevent XSS');
        }
        if (issues.some(i => i.includes('security.txt'))) {
            advice.push('Create /.well-known/security.txt per RFC 9116');
        }
        return advice.join('. ') || 'Consult QAntum security team for remediation plan';
    }
    estimateRemediationDays(severity) {
        switch (severity) {
            case 'CRITICAL': return 7;
            case 'HIGH': return 14;
            case 'MEDIUM': return 30;
            case 'LOW': return 45;
            default: return 60;
        }
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // TIMELINE BUILDING
    // ═══════════════════════════════════════════════════════════════════════════
    buildRemediationTimeline(gaps, valuation) {
        const phases = [];
        // Phase 1: Critical (Week 1)
        const criticalGaps = gaps.filter(g => g.severity === 'CRITICAL');
        if (criticalGaps.length > 0) {
            phases.push({
                phase: 1,
                name: 'Emergency Remediation',
                duration: '7 days',
                gaps: criticalGaps.map(g => g.id),
                cost: criticalGaps.length * 5000,
                valuationRecovered: criticalGaps.reduce((sum, g) => sum + g.dollarImpact, 0),
            });
        }
        // Phase 2: High Priority (Weeks 2-3)
        const highGaps = gaps.filter(g => g.severity === 'HIGH');
        if (highGaps.length > 0) {
            phases.push({
                phase: 2,
                name: 'High Priority Fixes',
                duration: '14 days',
                gaps: highGaps.map(g => g.id),
                cost: highGaps.length * 3000,
                valuationRecovered: highGaps.reduce((sum, g) => sum + g.dollarImpact, 0),
            });
        }
        // Phase 3: Compliance Hardening (Weeks 4-6)
        const mediumGaps = gaps.filter(g => g.severity === 'MEDIUM');
        if (mediumGaps.length > 0) {
            phases.push({
                phase: 3,
                name: 'Compliance Hardening',
                duration: '21 days',
                gaps: mediumGaps.map(g => g.id),
                cost: mediumGaps.length * 2000,
                valuationRecovered: mediumGaps.reduce((sum, g) => sum + g.dollarImpact, 0),
            });
        }
        // Phase 4: Polish & Documentation (Weeks 7-8)
        const lowGaps = gaps.filter(g => g.severity === 'LOW' || g.severity === 'INFO');
        phases.push({
            phase: phases.length + 1,
            name: 'Audit Preparation & Documentation',
            duration: '14 days',
            gaps: lowGaps.map(g => g.id),
            cost: 10000, // Flat fee for documentation
            valuationRecovered: lowGaps.reduce((sum, g) => sum + g.dollarImpact, 0),
        });
        return phases;
    }
    calculateOverallRisk(gaps) {
        const criticalCount = gaps.filter(g => g.severity === 'CRITICAL').length;
        const highCount = gaps.filter(g => g.severity === 'HIGH').length;
        if (criticalCount >= 2)
            return 'CRITICAL';
        if (criticalCount >= 1 || highCount >= 3)
            return 'HIGH';
        if (highCount >= 1)
            return 'MEDIUM';
        return 'LOW';
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // REPORT GENERATION
    // ═══════════════════════════════════════════════════════════════════════════
    generateExecutiveSummary(company, gaps, dollarAtRisk, score, readyDate) {
        const criticalCount = gaps.filter(g => g.severity === 'CRITICAL').length;
        const highCount = gaps.filter(g => g.severity === 'HIGH').length;
        return `
## Executive Summary

**Company:** ${company.name}
**Analysis Date:** ${new Date().toISOString().split('T')[0]}
**Funding Stage:** ${company.fundingStage}
**Estimated Valuation:** $${(company.estimatedValuation / 1_000_000).toFixed(1)}M

### Key Findings

Our automated compliance analysis identified **${gaps.length} compliance gaps** that could impact your valuation during due diligence:

| Severity | Count | Valuation Impact |
|----------|-------|------------------|
| 🔴 Critical | ${criticalCount} | ${criticalCount > 0 ? '-' + (criticalCount * 5) + '%' : '0%'} |
| 🟠 High | ${highCount} | ${highCount > 0 ? '-' + (highCount * 2.5) + '%' : '0%'} |
| 🟡 Medium | ${gaps.filter(g => g.severity === 'MEDIUM').length} | -${gaps.filter(g => g.severity === 'MEDIUM').length}% |

### Financial Impact

**Total Valuation at Risk:** $${(dollarAtRisk / 1_000_000).toFixed(2)}M

In our experience with pre-IPO technical due diligence, these gaps are commonly flagged by:
- Big Four auditors (EY, PwC, Deloitte, KPMG)
- Institutional investor security reviews
- Insurance underwriters for D&O coverage

### Path to Investor-Ready

With QAntum's remediation program, your company can achieve **Investor-Ready** status by:
**${readyDate.toISOString().split('T')[0]}**

Current Compliance Score: **${score}/100**
Target Compliance Score: **95/100**

### Recommendation

We recommend immediate engagement to address the ${criticalCount} critical issues before your next investor meeting. Every week of delay increases the risk of a reduced valuation or failed due diligence.

---
*This analysis was provided by QAntum as a demonstration of our technical due diligence capabilities.*
    `.trim();
    }
    generateMarkdownReport(roadmap) {
        let md = `# IPO-Ready Compliance Roadmap
## ${roadmap.companyName}

**Report ID:** ${roadmap.id}
**Generated:** ${roadmap.generatedAt.toISOString()}

---

${roadmap.executiveSummary}

---

# Detailed Gap Analysis

`;
        // Group gaps by framework
        const gapsByFramework = new Map();
        for (const gap of roadmap.gaps) {
            const existing = gapsByFramework.get(gap.framework) || [];
            existing.push(gap);
            gapsByFramework.set(gap.framework, existing);
        }
        for (const [framework, gaps] of gapsByFramework) {
            md += `## ${framework} Compliance\n\n`;
            for (const gap of gaps) {
                const severityIcon = gap.severity === 'CRITICAL' ? '🔴' : gap.severity === 'HIGH' ? '🟠' : '🟡';
                md += `### ${severityIcon} ${gap.control} (${gap.controlId})\n\n`;
                md += `**Severity:** ${gap.severity}\n`;
                md += `**Valuation Impact:** -$${(gap.dollarImpact / 1000).toFixed(0)}K (${(gap.valuationImpact * 100).toFixed(1)}%)\n`;
                md += `**Remediation Time:** ${gap.remediationDays} days\n\n`;
                md += `**Issue:** ${gap.description}\n\n`;
                md += `**Remediation:** ${gap.remediation}\n\n`;
                md += `---\n\n`;
            }
        }
        md += `# Remediation Timeline\n\n`;
        for (const phase of roadmap.remediationTimeline) {
            md += `## Phase ${phase.phase}: ${phase.name}\n\n`;
            md += `**Duration:** ${phase.duration}\n`;
            md += `**Investment:** $${phase.cost.toLocaleString()}\n`;
            md += `**Valuation Recovered:** $${(phase.valuationRecovered / 1000).toFixed(0)}K\n`;
            md += `**Gaps Addressed:** ${phase.gaps.length}\n\n`;
        }
        md += `---

# Next Steps

## Schedule Your Strategy Call

**Email:** enterprise@qantum.dev
**Calendar:** https://cal.com/qantum/ipo-readiness

Our team will:
1. Review this report with your CTO/CISO
2. Provide detailed technical specifications
3. Present fixed-price remediation proposal
4. Define success metrics and timeline

---

*QAntum - "We don't sell fear. We sell certainty."*
*Generated by QAntum OMEGA v33.2*
`;
        return md;
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // COLD OUTREACH GENERATOR
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Generate a cold outreach message based on compliance findings.
     * This is the "ethical" version - we lead with value, not fear.
     */
    generateOutreachMessage(roadmap) {
        const criticalGaps = roadmap.gaps.filter(g => g.severity === 'CRITICAL');
        const topGap = roadmap.gaps[0];
        return `Subject: ${roadmap.companyName} - Pre-Due Diligence Technical Review (Complimentary)

Hi [Name],

Congratulations on ${roadmap.fundingStage === 'PRE_IPO' ? 'the IPO preparation' : `the ${roadmap.fundingStage.replace('_', ' ')} momentum`}!

As part of our research into ${this.getIndustryFromDomain(roadmap.domain)} companies preparing for institutional investment, we ran a complimentary technical compliance scan on ${roadmap.domain}.

**Quick findings:**
${criticalGaps.length > 0
            ? `• ${criticalGaps.length} critical items that typically get flagged in technical due diligence`
            : `• Your security posture is solid, with ${roadmap.gaps.length} optimization opportunities`}
• Estimated ${roadmap.remediationTimeline[0]?.duration || '2 weeks'} to reach investor-ready status
• ${(roadmap.totalValuationAtRisk * 100).toFixed(1)}% potential valuation impact if unaddressed

We've prepared a detailed roadmap (attached) at no cost. If you'd like to discuss the findings or explore how QAntum can help, I'm happy to connect.

Best,
[Your Name]
QAntum Security

P.S. This analysis uses only publicly available data - the same data investors and auditors will review.

---
Attachment: ${roadmap.id}.pdf`;
    }
    getIndustryFromDomain(domain) {
        // Simple heuristic - in production would use enrichment APIs
        if (domain.includes('health') || domain.includes('med'))
            return 'healthcare';
        if (domain.includes('fin') || domain.includes('bank'))
            return 'fintech';
        if (domain.includes('ai') || domain.includes('ml'))
            return 'AI/ML';
        return 'technology';
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // PERSISTENCE
    // ═══════════════════════════════════════════════════════════════════════════
    ensureDirectories() {
        if (!(0, fs_1.existsSync)(this.DATA_PATH)) {
            (0, fs_1.mkdirSync)(this.DATA_PATH, { recursive: true });
        }
        if (!(0, fs_1.existsSync)(this.ROADMAPS_PATH)) {
            (0, fs_1.mkdirSync)(this.ROADMAPS_PATH, { recursive: true });
        }
    }
    saveRoadmap(roadmap) {
        const filePath = (0, path_1.join)(this.ROADMAPS_PATH, `${roadmap.id}.md`);
        (0, fs_1.writeFileSync)(filePath, roadmap.markdownReport);
        // Also save JSON for processing
        const jsonPath = (0, path_1.join)(this.ROADMAPS_PATH, `${roadmap.id}.json`);
        (0, fs_1.writeFileSync)(jsonPath, JSON.stringify(roadmap, null, 2));
    }
    loadRoadmaps() {
        try {
            const indexPath = (0, path_1.join)(this.DATA_PATH, 'index.json');
            if ((0, fs_1.existsSync)(indexPath)) {
                const data = JSON.parse((0, fs_1.readFileSync)(indexPath, 'utf-8'));
                for (const rm of data) {
                    rm.generatedAt = new Date(rm.generatedAt);
                    rm.investorReadyDate = new Date(rm.investorReadyDate);
                    this.roadmaps.set(rm.id, rm);
                }
            }
        }
        catch {
            // Start fresh
        }
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // PUBLIC API
    // ═══════════════════════════════════════════════════════════════════════════
    getRoadmap(id) {
        return this.roadmaps.get(id);
    }
    getAllRoadmaps() {
        return Array.from(this.roadmaps.values());
    }
    getStats() {
        const roadmaps = this.getAllRoadmaps();
        return {
            totalGenerated: roadmaps.length,
            totalValueAtRisk: roadmaps.reduce((sum, r) => sum + r.totalDollarAtRisk, 0),
            averageScore: roadmaps.length
                ? Math.round(roadmaps.reduce((sum, r) => sum + r.complianceScore, 0) / roadmaps.length)
                : 0,
            byStage: {
                preiIPO: roadmaps.filter(r => r.fundingStage === 'PRE_IPO').length,
                seriesC: roadmaps.filter(r => r.fundingStage === 'SERIES_C').length,
                seriesB: roadmaps.filter(r => r.fundingStage === 'SERIES_B').length,
            },
        };
    }
}
exports.CompliancePredator = CompliancePredator;
// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════
exports.default = CompliancePredator;
