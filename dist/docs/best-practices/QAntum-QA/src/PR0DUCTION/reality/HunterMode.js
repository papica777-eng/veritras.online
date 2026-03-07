"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * HUNTER MODE - Economic Imperative Activation
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * "От Defense към Offense. Време е да печелим."
 *
 * Това е автономният лов на leads чрез:
 * 1. PublicScanner - легално сканиране на публични данни
 * 2. Security Analysis - намиране на проблеми
 * 3. Value Bomb Generation - безплатен одит като примамка
 *
 * ПРАВНА ОСНОВА: Само публични данни (SSL, Headers, DNS)
 * Същото като SecurityHeaders.com, SSL Labs, Qualys
 *
 * @author Димитър Продромов / Mister Mind
 * @copyright 2026 QAntum Empire. All Rights Reserved.
 * @version 34.0.0 ETERNAL SOVEREIGN
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.hunter = exports.HunterMode = void 0;
exports.activateHunterMode = activateHunterMode;
exports.generateValueBomb = generateValueBomb;
const events_1 = require("events");
const PublicScanner_1 = require("../intelligence/PublicScanner");
// ═══════════════════════════════════════════════════════════════════════════════
// HUNTER MODE ENGINE
// ═══════════════════════════════════════════════════════════════════════════════
class HunterMode extends events_1.EventEmitter {
    static instance;
    config;
    scanner;
    qualifiedLeads = [];
    isHunting = false;
    constructor(config) {
        super();
        this.config = {
            maxTargets: config?.maxTargets ?? 10,
            minSecurityScore: config?.minSecurityScore ?? 70,
            industries: config?.industries ?? ['e-commerce', 'fintech', 'saas'],
            excludeDomains: config?.excludeDomains ?? ['google.com', 'facebook.com', 'amazon.com'],
        };
        this.scanner = PublicScanner_1.PublicScanner.getInstance();
        console.log(`
🎯 ═══════════════════════════════════════════════════════════════════════════════
   HUNTER MODE v34.0 - ECONOMIC IMPERATIVE ACTIVATION
   ─────────────────────────────────────────────────────────────────────────────
   "От Defense към Offense. $10k MRR target."
   ─────────────────────────────────────────────────────────────────────────────
   Legal Basis:  PUBLIC_DATA_ONLY (SSL, Headers, DNS)
   Compliance:   CFAA ✅ | GDPR ✅ | Ethical ✅
═══════════════════════════════════════════════════════════════════════════════
    `);
    }
    static getInstance(config) {
        if (!HunterMode.instance) {
            HunterMode.instance = new HunterMode(config);
        }
        return HunterMode.instance;
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // HUNTING OPERATIONS
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Hunt for leads from a list of targets
     */
    async hunt(targets) {
        if (this.isHunting) {
            throw new Error('HUNT_ALREADY_RUNNING');
        }
        this.isHunting = true;
        this.qualifiedLeads = [];
        console.log(`\n🎯 [HUNTER] Starting hunt for ${targets.length} targets...`);
        this.emit('hunt:start', { targets: targets.length });
        for (const target of targets.slice(0, this.config.maxTargets)) {
            // Skip excluded domains
            if (this.config.excludeDomains.some(d => target.domain.includes(d))) {
                console.log(`   ⏭️ Skipping excluded domain: ${target.domain}`);
                continue;
            }
            try {
                console.log(`\n🔍 [HUNTER] Scanning: ${target.domain}`);
                // 1. Scan public surface
                const scanResult = await this.scanner.scan(`https://${target.domain}`);
                // 2. Qualify the lead
                if (scanResult.overallScore < this.config.minSecurityScore) {
                    const lead = this.qualifyLead(target, scanResult);
                    this.qualifiedLeads.push(lead);
                    console.log(`   ✅ QUALIFIED: ${target.domain} (Score: ${scanResult.overallScore}/100, Issues: ${lead.totalIssues})`);
                    this.emit('lead:qualified', lead);
                }
                else {
                    console.log(`   ⚪ PASSED: ${target.domain} (Score: ${scanResult.overallScore}/100 - too secure)`);
                }
                // Cooldown between scans (respect servers)
                await this.sleep(2000);
            }
            catch (error) {
                console.log(`   ❌ ERROR: ${target.domain} - ${error.message}`);
            }
        }
        this.isHunting = false;
        console.log(`\n📊 [HUNTER] Hunt complete: ${this.qualifiedLeads.length} qualified leads`);
        this.emit('hunt:complete', { leads: this.qualifiedLeads });
        return this.qualifiedLeads;
    }
    /**
     * Qualify a lead based on scan results
     */
    qualifyLead(target, scanResult) {
        const criticalIssues = scanResult.criticalIssues;
        const totalIssues = criticalIssues.length + scanResult.warnings.length;
        // Calculate opportunity score (inverse of security)
        const opportunityScore = 100 - scanResult.overallScore;
        // Estimate deal value based on issues
        let estimatedDealValue = 2500; // Base
        estimatedDealValue += criticalIssues.filter(i => i.severity === 'CRITICAL').length * 1000;
        estimatedDealValue += criticalIssues.filter(i => i.severity === 'HIGH').length * 500;
        estimatedDealValue += scanResult.warnings.length * 100;
        // Cap at reasonable enterprise range
        estimatedDealValue = Math.min(estimatedDealValue, 25000);
        const lead = {
            leadId: `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            domain: target.domain,
            companyName: this.extractCompanyName(target.domain),
            scanResult,
            securityScore: scanResult.overallScore,
            opportunityScore,
            estimatedDealValue,
            criticalIssues,
            totalIssues,
            possibleContacts: this.findContactHints(scanResult),
            discoveredAt: new Date(),
            qualifiedAt: new Date(),
        };
        return lead;
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // VALUE BOMB GENERATION
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Generate a "Value Bomb" - free security audit as sales tool
     */
    generateValueBomb(lead) {
        console.log(`\n💣 [HUNTER] Generating Value Bomb for ${lead.companyName}...`);
        const securityGrade = this.calculateGrade(lead.securityScore);
        // Convert issues to findings
        const findings = lead.criticalIssues.map(issue => ({
            severity: issue.severity,
            title: issue.title,
            impact: this.generateImpactStatement(issue),
            evidence: issue.description,
            remediation: issue.fix,
        }));
        // Generate recommendations
        const recommendations = lead.scanResult.recommendations.map((rec, i) => ({
            priority: i + 1,
            title: rec,
            description: this.expandRecommendation(rec),
            estimatedEffort: this.estimateEffort(rec),
            businessImpact: this.estimateBusinessImpact(rec),
        }));
        // Executive summary
        const executiveSummary = this.generateExecutiveSummary(lead, securityGrade);
        // Generate outreach content
        const emailSubject = this.generateEmailSubject(lead, securityGrade);
        const emailBody = this.generateEmailBody(lead, findings, recommendations);
        const linkedInMessage = this.generateLinkedInMessage(lead, securityGrade);
        const valueBomb = {
            leadId: lead.leadId,
            companyName: lead.companyName,
            domain: lead.domain,
            executiveSummary,
            securityGrade,
            criticalFindings: findings,
            recommendations,
            offerTitle: '🎁 Безплатен Security Audit + 14-дневен Trial',
            offerDescription: `Пълен security audit на ${lead.domain} с Ghost Protocol технология. Включва: SSL анализ, header verification, DNS security check, и персонализирани препоръки.`,
            callToAction: 'Резервирайте 15-минутна демонстрация',
            validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            emailSubject,
            emailBody,
            linkedInMessage,
            generatedAt: new Date(),
        };
        console.log(`   ✅ Value Bomb готов: ${findings.length} findings, ${recommendations.length} recommendations`);
        this.emit('valuebomb:generated', valueBomb);
        return valueBomb;
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // CONTENT GENERATION
    // ═══════════════════════════════════════════════════════════════════════════
    generateExecutiveSummary(lead, grade) {
        return `
## 🛡️ Security Assessment: ${lead.companyName}

**Overall Grade: ${grade}** (${lead.securityScore}/100)

При нашия публичен security scan на ${lead.domain}, открихме **${lead.totalIssues} потенциални проблема**, от които **${lead.criticalIssues.length} са критични**.

### Ключови наблюдения:
${lead.criticalIssues.slice(0, 3).map(i => `- ⚠️ ${i.title}`).join('\n')}

### Потенциален риск:
${this.estimateRisk(lead)}

### Препоръка:
Препоръчваме незабавна ревизия на security конфигурацията. QAntum може да помогне с пълен audit и автоматизирана защита.
    `.trim();
    }
    generateEmailSubject(lead, grade) {
        const subjects = [
            `${lead.companyName}: Открихме ${lead.criticalIssues.length} security проблема (безплатен одит)`,
            `🛡️ Security Alert за ${lead.domain} - Grade ${grade}`,
            `${lead.companyName} - Вашият SSL сертификат има проблем`,
            `Безплатен Security Audit за ${lead.companyName} от QAntum`,
        ];
        // Pick most relevant based on issues
        if (lead.scanResult.ssl && !lead.scanResult.ssl.valid) {
            return subjects[2];
        }
        return subjects[0];
    }
    generateEmailBody(lead, findings, recommendations) {
        return `
Здравейте,

Казвам се Димитър Продромов и съм основател на QAntum - платформа за автоматизирано QA и security тестване.

При рутинен мониторинг на публични security индикатори, забелязахме няколко потенциални проблема на ${lead.domain}:

**🔴 Критични находки:**
${findings.slice(0, 3).map(f => `• ${f.title} - ${f.impact}`).join('\n')}

**📊 Общ Security Score: ${lead.securityScore}/100**

Тези проблеми могат да доведат до:
- Компрометиране на потребителски данни
- SEO penalty от Google
- Загуба на доверие от клиенти

---

**🎁 Безплатна оферта:**

Предлагам ви **безплатен пълен security audit** на ${lead.domain}, включващ:
✅ SSL/TLS deep analysis
✅ HTTP Security Headers check
✅ DNS security verification
✅ Performance & availability test
✅ Персонализиран action plan

**Без задължения. Без кредитна карта.**

Просто отговорете на този имейл или резервирайте 15-минутен разговор:
📅 https://calendly.com/qantum/security-review

С уважение,
Димитър Продромов
QAntum Founder
"В QAntum не лъжем."

---
P.S. Всички данни в този анализ са от публични източници (SSL сертификати, HTTP headers, DNS записи) - същото като SecurityHeaders.com или SSL Labs.
    `.trim();
    }
    generateLinkedInMessage(lead, grade) {
        return `
Здравейте! 👋

Забелязах ${lead.domain} при рутинен security мониторинг.

Вашият security score е ${lead.securityScore}/100 (Grade ${grade}).

Открих ${lead.totalIssues} потенциални подобрения, включително ${lead.criticalIssues.length} критични.

Мога да ви изпратя безплатен детайлен отчет, ако ви е интересно?

Димитър от QAntum
    `.trim();
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // HELPER METHODS
    // ═══════════════════════════════════════════════════════════════════════════
    calculateGrade(score) {
        if (score >= 90)
            return 'A';
        if (score >= 80)
            return 'B';
        if (score >= 70)
            return 'C';
        if (score >= 60)
            return 'D';
        return 'F';
    }
    extractCompanyName(domain) {
        // Remove TLD and capitalize
        const parts = domain.split('.');
        const name = parts[0];
        return name.charAt(0).toUpperCase() + name.slice(1);
    }
    findContactHints(scanResult) {
        const hints = [];
        // Check security.txt for contact
        if (scanResult.securityTxt?.contact) {
            hints.push({
                type: 'email',
                value: scanResult.securityTxt.contact,
                confidence: 0.9,
            });
        }
        // Standard patterns
        hints.push({
            type: 'email',
            value: `security@${scanResult.domain}`,
            confidence: 0.6,
        });
        hints.push({
            type: 'email',
            value: `info@${scanResult.domain}`,
            confidence: 0.5,
        });
        return hints;
    }
    generateImpactStatement(issue) {
        const impacts = {
            'CRITICAL': 'Може да доведе до пълно компрометиране на системата',
            'HIGH': 'Може да позволи неоторизиран достъп',
            'MEDIUM': 'Намалява общата сигурност',
            'LOW': 'Препоръчително за подобряване',
        };
        return impacts[issue.severity] || 'Изисква внимание';
    }
    expandRecommendation(rec) {
        // Add context to recommendations
        return `${rec}. Това подобрение ще повиши security score-а и ще намали риска от атаки.`;
    }
    estimateEffort(rec) {
        if (rec.includes('header'))
            return '30 минути';
        if (rec.includes('SSL') || rec.includes('certificate'))
            return '1-2 часа';
        if (rec.includes('CSP'))
            return '2-4 часа';
        return '1-2 часа';
    }
    estimateBusinessImpact(rec) {
        if (rec.includes('header') || rec.includes('security')) {
            return 'Защита от XSS, clickjacking, data theft';
        }
        return 'Подобрена сигурност и compliance';
    }
    estimateRisk(lead) {
        if (lead.criticalIssues.length >= 3) {
            return '🔴 ВИСОК РИСК: Сайтът е уязвим на множество вектори на атака.';
        }
        if (lead.criticalIssues.length >= 1) {
            return '🟡 СРЕДЕН РИСК: Има критични проблеми, които изискват внимание.';
        }
        return '🟢 НИК РИСК: Основните защити са на място, има място за подобрения.';
    }
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // PUBLIC METHODS
    // ═══════════════════════════════════════════════════════════════════════════
    getQualifiedLeads() {
        return [...this.qualifiedLeads];
    }
    isCurrentlyHunting() {
        return this.isHunting;
    }
}
exports.HunterMode = HunterMode;
// ═══════════════════════════════════════════════════════════════════════════════
// CONVENIENCE EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════
exports.hunter = HunterMode.getInstance();
async function activateHunterMode(targets) {
    return exports.hunter.hunt(targets);
}
function generateValueBomb(lead) {
    return exports.hunter.generateValueBomb(lead);
}
