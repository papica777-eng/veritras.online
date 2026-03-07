/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * PROPOSAL ENGINE - Automated Technical Proposal Generator
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * "Когато Оракулът намери възможност, Proposal Engine я превръща в оферта за 2 секунди."
 * 
 * Features:
 * - AI-powered technical proposals
 * - Automatic vulnerability assessment
 * - Pricing calculation
 * - PDF-ready markdown output
 * 
 * @author Димитър Продромов / Mister Mind
 * @copyright 2026 QAntum Empire. All Rights Reserved.
 * @version 1.0.0-QANTUM
 */

import { EventEmitter } from 'events';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { NeuralInference } from '../physics/NeuralInference';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface LeadData {
  id: string;
  company: string;
  website?: string;
  contact?: string;
  email?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  detected_issue?: string;
  issues?: string[];
  latency?: number;
  vulnerability_type?: string;
  technology_stack?: string[];
  estimated_value?: number;
  source?: string;
}

export interface ProposalConfig {
  includeGhostProtocol: boolean;
  includeSelfHealing: boolean;
  includeCompliance: boolean;
  customPricing?: number;
  currency: 'USD' | 'EUR' | 'BGN' | 'BTC';
  language: 'en' | 'bg';
}

export interface GeneratedProposal {
  id: string;
  leadId: string;
  company: string;
  filePath: string;
  content: string;
  pricing: ProposalPricing;
  generatedAt: Date;
}

export interface ProposalPricing {
  base: number;
  ghostProtocol: number;
  selfHealing: number;
  compliance: number;
  total: number;
  currency: string;
  period: 'monthly' | 'quarterly' | 'yearly' | 'one-time';
}

// ═══════════════════════════════════════════════════════════════════════════════
// PROPOSAL ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

export class ProposalEngine extends EventEmitter {
  private static instance: ProposalEngine;

  private readonly brain = NeuralInference.getInstance();
  private readonly OUTPUT_DIR = './data/proposals';

  private generatedProposals: GeneratedProposal[] = [];

  // Pricing tiers (USD per quarter)
  private readonly PRICING = {
    base: {
      low: 500,
      medium: 1000,
      high: 2500,
      critical: 5000,
    },
    modules: {
      ghostProtocol: 1500,
      selfHealing: 1000,
      compliance: 2000,
      knoxVault: 3500,        // Hardware-Backed Security
      spectatorMode: 2500,    // Real-Time Manual Hijack
    },
    btcRate: 100000, // Approximate BTC/USD
  };

  private constructor() {
    super();
    this.ensureOutputDir();
    console.log('📝 [PROPOSAL] Engine initialized. Ready to generate.');
  }

  static getInstance(): ProposalEngine {
    if (!ProposalEngine.instance) {
      ProposalEngine.instance = new ProposalEngine();
    }
    return ProposalEngine.instance;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MAIN GENERATION METHOD
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Generate a technical proposal for a lead
   */
  async generate(
    targetData: LeadData,
    config: Partial<ProposalConfig> = {}
  ): Promise<GeneratedProposal> {
    const startTime = Date.now();

    const fullConfig: ProposalConfig = {
      includeGhostProtocol: config.includeGhostProtocol ?? true,
      includeSelfHealing: config.includeSelfHealing ?? true,
      includeCompliance: config.includeCompliance ?? false,
      currency: config.currency ?? 'USD',
      language: config.language ?? 'en',
      ...config,
    };

    console.log(`📝 [PROPOSAL] Generating for ${targetData.company}...`);
    this.emit('generate:start', { company: targetData.company });

    // Calculate pricing
    const pricing = this.calculatePricing(targetData, fullConfig);

    // Generate content using AI
    const content = await this.generateContent(targetData, fullConfig, pricing);

    // Create proposal
    const proposalId = `PROP_${targetData.id}_${Date.now()}`;
    const filename = `PROPOSAL_${targetData.id}.md`;
    const filePath = join(this.OUTPUT_DIR, filename);

    // Write to file
    writeFileSync(filePath, content);

    const proposal: GeneratedProposal = {
      id: proposalId,
      leadId: targetData.id,
      company: targetData.company,
      filePath,
      content,
      pricing,
      generatedAt: new Date(),
    };

    this.generatedProposals.push(proposal);

    console.log(`✅ [PROPOSAL] Generated for ${targetData.company} in ${Date.now() - startTime}ms`);
    console.log(`💰 [REVENUE] Potential: ${this.formatCurrency(pricing.total, pricing.currency)}`);

    this.emit('generate:complete', proposal);
    return proposal;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CONTENT GENERATION
  // ═══════════════════════════════════════════════════════════════════════════

  private async generateContent(
    target: LeadData,
    config: ProposalConfig,
    pricing: ProposalPricing
  ): Promise<string> {
    // Build issues list
    const issuesList = target.issues
      ? target.issues.map(i => `- ${i}`).join('\n')
      : target.detected_issue || 'Performance and security gaps identified';

    // Generate AI-enhanced executive summary
    let executiveSummary = '';
    try {
      const aiSummary = await this.brain.infer(`
        Generate a 3-sentence executive summary for a technical audit proposal.
        Company: ${target.company}
        Issues: ${issuesList}
        Solution: QAntum Ghost Protocol for invisible security testing.
        Tone: Professional, confident, solution-focused.
        Output only the summary, no headers.
      `);
      executiveSummary = aiSummary || this.getDefaultSummary(target);
    } catch {
      executiveSummary = this.getDefaultSummary(target);
    }

    // Build the proposal
    const template = `
# 🔒 ТЕХНИЧЕСКИ ОДИТ: ${target.company}

---

## 📋 СТАТУС: ${target.priority.toUpperCase()}

**Дата:** ${new Date().toISOString().split('T')[0]}
**Референция:** ${target.id}
**Подготвено от:** QAntum Security Nexus

---

## 📌 ИЗПЪЛНИТЕЛНО РЕЗЮМЕ

${executiveSummary}

---

## 🔍 ОТКРИТИ ПРОБЛЕМИ

${issuesList}

${target.latency ? `**Измерена латентност:** ${target.latency}ms` : ''}
${target.vulnerability_type ? `**Тип уязвимост:** ${target.vulnerability_type}` : ''}

---

## 🛡️ ПРЕДЛОЖЕНО РЕШЕНИЕ: QAntum Prime

### Пакет: ${this.getPackageName(config)}

${config.includeGhostProtocol ? `
#### 👻 Ghost Protocol v2
- **JA3 Fingerprint Rotation** - Неоткриваемо сканиране
- **Phantom Stealth Mode** - 0% детекция от WAF/IDS
- **Browser Signature Morphing** - Изглежда като реален потребител
- **Прогнозирана ефективност:** +42% успех при автоматизация
` : ''}

${config.includeSelfHealing ? `
#### 🔧 Self-Healing Engine
- **Автоматично възстановяване** на неуспешни тестове
- **AI-powered selector healing** - 15+ стратегии
- **Zero maintenance** - Тестовете се адаптират сами
- **Прогнозирано спестяване:** 60% от времето за поддръжка
` : ''}

${config.includeCompliance ? `
#### 📜 Compliance Autopilot
- **SOC 2 Type II** автоматизация
- **GDPR** проверки
- **PCI DSS** валидация
- **ISO 27001** готовност
` : ''}
#### 🔐 Hardware-Backed Proof (KNOX)
- **Samsung S24 Ultra TEE** - Частните ключове НИКОГА не напускат хардуера
- **Knox Vault Signature** - Математическо доказателство за автентичност
- **0% Leak Risk** - Изключва всякаква възможност за кражба на сесии

#### 👁️ Spectator Audit Engine
- **Live Stream Proof** - Можете да наблюдавате одита в реално време
- **Manual Hijack** - Моментално поемане на контрол при необходимост
- **Neural Learning** - Оракулът се учи от вашите действия

---

## 💰 ИНВЕСТИЦИЯ

| Компонент | Цена (${pricing.currency}) |
|-----------|---------------------------|
| Базов одит | ${this.formatCurrency(pricing.base, pricing.currency)} |
${config.includeGhostProtocol ? `| Ghost Protocol v2 | ${this.formatCurrency(pricing.ghostProtocol, pricing.currency)} |` : ''}
${config.includeSelfHealing ? `| Self-Healing Engine | ${this.formatCurrency(pricing.selfHealing, pricing.currency)} |` : ''}
${config.includeCompliance ? `| Compliance Autopilot | ${this.formatCurrency(pricing.compliance, pricing.currency)} |` : ''}
| **KNOX Hardware Bridge** | **${this.formatCurrency(3500, pricing.currency)}** |
| **Spectator Mode Access** | **${this.formatCurrency(2500, pricing.currency)}** |
| **ОБЩО** | **${this.formatCurrency(pricing.total + 6000, pricing.currency)}** |

*Период: ${pricing.period === 'quarterly' ? 'Тримесечие' : pricing.period === 'yearly' ? 'Година' : 'Еднократно'}*

---

## 🚀 СЛЕДВАЩИ СТЪПКИ

1. **Консултация** - 30-минутен обаждане за обсъждане на детайлите
2. **Proof of Concept** - Демонстрация върху една критична зона
3. **Внедряване** - Full rollout в рамките на 2 седмици
4. **Поддръжка** - 24/7 техническа поддръжка

---

## 📞 КОНТАКТ

**QAntum Security Nexus**
📧 dp@qantum.site
🌐 https://qantum.site
🇧🇬 Made in Bulgaria

---

*"В QAntum не лъжем. Ние гарантираме резултати."*

---

**© ${new Date().getFullYear()} QAntum Empire. All Rights Reserved.**
**Version: 28.5.0 - THE AWAKENING**
    `.trim();

    return template;
  }

  private getDefaultSummary(target: LeadData): string {
    return `${target.company} показва признаци на ${target.priority === 'critical' ? 'критични' : 'значителни'} пропуски в сигурността. Нашият анализ идентифицира възможности за оптимизация, които биха намалили риска и подобрили производителността. QAntum Ghost Protocol предлага решение, което ще осигури неоткриваема защита и автоматизирано тестване.`;
  }

  private getPackageName(config: ProposalConfig): string {
    if (config.includeCompliance && config.includeGhostProtocol && config.includeSelfHealing) {
      return 'ENTERPRISE COMPLETE';
    }
    if (config.includeGhostProtocol && config.includeSelfHealing) {
      return 'PROFESSIONAL';
    }
    if (config.includeGhostProtocol) {
      return 'GHOST PROTOCOL';
    }
    return 'STARTER';
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PRICING CALCULATION
  // ═══════════════════════════════════════════════════════════════════════════

  private calculatePricing(target: LeadData, config: ProposalConfig): ProposalPricing {
    const base = this.PRICING.base[target.priority];
    const ghostProtocol = config.includeGhostProtocol ? this.PRICING.modules.ghostProtocol : 0;
    const selfHealing = config.includeSelfHealing ? this.PRICING.modules.selfHealing : 0;
    const compliance = config.includeCompliance ? this.PRICING.modules.compliance : 0;

    let total = base + ghostProtocol + selfHealing + compliance;

    // Apply custom pricing if set
    if (config.customPricing) {
      total = config.customPricing;
    }

    // Convert to requested currency
    if (config.currency === 'BTC') {
      total = total / this.PRICING.btcRate;
    } else if (config.currency === 'EUR') {
      total = total * 0.92; // Approximate
    } else if (config.currency === 'BGN') {
      total = total * 1.80; // Approximate
    }

    return {
      base: config.currency === 'BTC' ? base / this.PRICING.btcRate : base,
      ghostProtocol: config.currency === 'BTC' ? ghostProtocol / this.PRICING.btcRate : ghostProtocol,
      selfHealing: config.currency === 'BTC' ? selfHealing / this.PRICING.btcRate : selfHealing,
      compliance: config.currency === 'BTC' ? compliance / this.PRICING.btcRate : compliance,
      total,
      currency: config.currency,
      period: 'quarterly',
    };
  }

  private formatCurrency(amount: number, currency: string): string {
    if (currency === 'BTC') {
      return `${amount.toFixed(4)} BTC`;
    }
    const symbols: Record<string, string> = {
      USD: '$',
      EUR: '€',
      BGN: 'лв.',
    };
    return `${symbols[currency] || '$'}${amount.toLocaleString()}`;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // BATCH GENERATION
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Generate proposals for all high-priority leads
   */
  async generateBatch(leads: LeadData[], config?: Partial<ProposalConfig>): Promise<GeneratedProposal[]> {
    console.log(`
╔═══════════════════════════════════════════════════════════════════════════════╗
║                      PROPOSAL BATCH GENERATION                                ║
║                                                                               ║
║  Leads: ${leads.length.toString().padEnd(62)}║
║  High Priority: ${leads.filter(l => l.priority === 'high' || l.priority === 'critical').length.toString().padEnd(53)}║
╚═══════════════════════════════════════════════════════════════════════════════╝
    `);

    const proposals: GeneratedProposal[] = [];
    const highPriorityLeads = leads.filter(l =>
      l.priority === 'high' || l.priority === 'critical'
    );

    for (const lead of highPriorityLeads) {
      try {
        const proposal = await this.generate(lead, config);
        proposals.push(proposal);
      } catch (error) {
        console.error(`❌ [PROPOSAL] Failed for ${lead.company}:`, error);
      }
    }

    const totalPotential = proposals.reduce((acc, p) => acc + p.pricing.total, 0);
    console.log(`
✅ [BATCH] Complete
   Generated: ${proposals.length} proposals
   Total Potential: ${this.formatCurrency(totalPotential, config?.currency || 'USD')}
    `);

    return proposals;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // UTILITIES
  // ═══════════════════════════════════════════════════════════════════════════

  private ensureOutputDir(): void {
    if (!existsSync(this.OUTPUT_DIR)) {
      mkdirSync(this.OUTPUT_DIR, { recursive: true });
    }
  }

  getGeneratedProposals(): GeneratedProposal[] {
    return [...this.generatedProposals];
  }

  getTotalPotentialRevenue(): number {
    return this.generatedProposals.reduce((acc, p) => acc + p.pricing.total, 0);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SINGLETON EXPORT
// ═══════════════════════════════════════════════════════════════════════════════

export const proposalEngine = ProposalEngine.getInstance();
export default ProposalEngine;
