/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * THE HARVESTER - Autonomous Lead Processing & Proposal Generation
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * "Жътварят обхожда leads.json, намира слабостите чрез Pinecone и записва
 *  готовите PDF предложения в папка ready-to-send."
 * 
 * Workflow:
 * 1. Load leads from leads.json
 * 2. Query Pinecone for best QAntum solution per lead
 * 3. Generate technical proposals
 * 4. Save to ready-to-send folder
 * 
 * @author Димитър Продромов / Mister Mind
 * @copyright 2026 QAntum Empire. All Rights Reserved.
 * @version 28.5.0 - THE AWAKENING
 */

const fs = require('fs');
const path = require('path');
const { searchHighValueTargets, findBestModule } = require('./oracle-search-turbo');

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

const LEADS_PATH = './data/real-leads/leads.json';
const OUTPUT_DIR = './data/proposals/ready-to-send';
const LOG_FILE = './data/harvester-log.json';

// Statistics
const stats = {
    startTime: null,
    endTime: null,
    totalLeads: 0,
    highPriorityLeads: 0,
    proposalsGenerated: 0,
    totalPotentialRevenue: 0,
    errors: [],
};

// ═══════════════════════════════════════════════════════════════════════════════
// PROPOSAL TEMPLATE
// ═══════════════════════════════════════════════════════════════════════════════

function generateProposalMarkdown(lead, solution) {
    const pricing = calculatePricing(lead.priority);
    
    return `
# 🔒 ТЕХНИЧЕСКИ ОДИТ: ${lead.company}

---

## 📋 СТАТУС: ${lead.priority.toUpperCase()}

**Дата:** ${new Date().toISOString().split('T')[0]}
**Референция:** ${lead.id}
**Източник:** ${lead.source || 'Oracle Discovery'}

---

## 🔍 ОТКРИТИ ПРОБЛЕМИ

${lead.detected_issue || lead.issues?.join('\n- ') || 'Security and performance gaps identified'}

${lead.latency ? `**Латентност:** ${lead.latency}ms (Критична: >100ms)` : ''}
${lead.vulnerability_type ? `**Уязвимост:** ${lead.vulnerability_type}` : ''}

---

## 🛡️ ПРЕПОРЪЧАНО РЕШЕНИЕ

### QAntum Модул: ${solution.module || 'Ghost Protocol v2'}

${solution.description || 'AI-powered invisible security testing framework'}

**Защо този модул?**
- Съвпадение: ${((solution.score || 0.85) * 100).toFixed(1)}% с вашите нужди
- Автоматизация: 42% подобрение в успеваемостта на тестовете
- Невидимост: 0% детекция от WAF/IDS системи

---

## 💰 ИНВЕСТИЦИЯ

| Компонент | Цена (USD) |
|-----------|------------|
| Базов одит | $${pricing.base.toLocaleString()} |
| Ghost Protocol v2 | $${pricing.ghostProtocol.toLocaleString()} |
| Self-Healing | $${pricing.selfHealing.toLocaleString()} |
| **ОБЩО / Квартал** | **$${pricing.total.toLocaleString()}** |

---

## 🚀 СЛЕДВАЩИ СТЪПКИ

1. **Потвърждение** - Отговорете на този имейл
2. **Консултация** - 30-минутен видео разговор
3. **POC** - Безплатна демонстрация на Ghost Protocol
4. **Внедряване** - Пълна имплементация в рамките на 2 седмици

---

## 📞 КОНТАКТ

**QAntum Security Division**
📧 security@qantum.dev
🌐 https://qantum.dev

---

*"В QAntum не лъжем. Гарантираме резултати."*

**© ${new Date().getFullYear()} QAntum Empire. Made in Bulgaria 🇧🇬**
    `.trim();
}

// ═══════════════════════════════════════════════════════════════════════════════
// PRICING LOGIC
// ═══════════════════════════════════════════════════════════════════════════════

function calculatePricing(priority) {
    const basePricing = {
        low: 500,
        medium: 1000,
        high: 2500,
        critical: 5000,
    };

    const base = basePricing[priority] || 1000;
    const ghostProtocol = 1500;
    const selfHealing = 1000;
    const total = base + ghostProtocol + selfHealing;

    return { base, ghostProtocol, selfHealing, total };
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN HARVESTER FUNCTION
// ═══════════════════════════════════════════════════════════════════════════════

async function startHarvester() {
    console.log(`
╔═══════════════════════════════════════════════════════════════════════════════╗
║                         THE HARVESTER v28.5.0                                 ║
║                                                                               ║
║  "Автономна жътва на възможности. leads.json → ready-to-send/"               ║
╚═══════════════════════════════════════════════════════════════════════════════╝
    `);

    stats.startTime = new Date();

    // Ensure output directory exists
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    // Load leads
    let leads = [];
    try {
        if (fs.existsSync(LEADS_PATH)) {
            leads = JSON.parse(fs.readFileSync(LEADS_PATH, 'utf-8'));
        } else {
            // Create sample leads if file doesn't exist
            leads = createSampleLeads();
            fs.mkdirSync(path.dirname(LEADS_PATH), { recursive: true });
            fs.writeFileSync(LEADS_PATH, JSON.stringify(leads, null, 2));
            console.log('📝 [HARVESTER] Created sample leads.json');
        }
    } catch (error) {
        console.error('❌ [HARVESTER] Failed to load leads:', error);
        stats.errors.push({ phase: 'load', error: error.message });
        return;
    }

    stats.totalLeads = leads.length;
    console.log(`📊 [HARVESTER] Loaded ${leads.length} leads`);

    // Process high-priority leads
    const highPriorityLeads = leads.filter(l => 
        l.priority === 'high' || l.priority === 'critical'
    );
    stats.highPriorityLeads = highPriorityLeads.length;

    console.log(`🎯 [HARVESTER] Processing ${highPriorityLeads.length} high-priority targets\n`);

    for (const lead of highPriorityLeads) {
        try {
            console.log(`\n🎯 [TARGET] Analyzing ${lead.company}...`);

            // Find best QAntum solution via Oracle/Pinecone
            let solution = { module: 'Ghost Protocol v2', score: 0.85, description: 'AI-powered invisible testing' };
            
            try {
                const modules = await findBestModule(lead.detected_issue || lead.company);
                if (modules && modules.length > 0) {
                    solution = modules[0];
                }
            } catch (oracleError) {
                console.log('   ⚠️ Oracle offline, using default solution');
            }

            console.log(`   📦 Best module: ${solution.module} (${(solution.score * 100).toFixed(1)}% match)`);

            // Generate proposal
            const proposalContent = generateProposalMarkdown(lead, solution);
            
            // Save to file
            const filename = `PROPOSAL_${lead.id}_${Date.now()}.md`;
            const filepath = path.join(OUTPUT_DIR, filename);
            fs.writeFileSync(filepath, proposalContent);

            // Update stats
            const pricing = calculatePricing(lead.priority);
            stats.proposalsGenerated++;
            stats.totalPotentialRevenue += pricing.total;

            console.log(`   ✅ Proposal generated: ${filename}`);
            console.log(`   💰 Potential: $${pricing.total.toLocaleString()}`);

        } catch (error) {
            console.error(`   ❌ Failed for ${lead.company}:`, error.message);
            stats.errors.push({ lead: lead.id, error: error.message });
        }
    }

    // Finalize
    stats.endTime = new Date();
    const duration = (stats.endTime - stats.startTime) / 1000;

    // Save log
    fs.writeFileSync(LOG_FILE, JSON.stringify(stats, null, 2));

    console.log(`
╔═══════════════════════════════════════════════════════════════════════════════╗
║                       HARVEST COMPLETE                                        ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║                                                                               ║
║  Duration: ${duration.toFixed(1).padEnd(59)}s ║
║  Leads Processed: ${stats.highPriorityLeads.toString().padEnd(52)}║
║  Proposals Generated: ${stats.proposalsGenerated.toString().padEnd(48)}║
║  Total Potential: $${stats.totalPotentialRevenue.toLocaleString().padEnd(50)}║
║  Errors: ${stats.errors.length.toString().padEnd(61)}║
║                                                                               ║
║  Output: ${OUTPUT_DIR.padEnd(61)}║
╚═══════════════════════════════════════════════════════════════════════════════╝

🚀 Ready to send ${stats.proposalsGenerated} proposals!
📁 Check: ${OUTPUT_DIR}
    `);

    return stats;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SAMPLE LEADS GENERATOR
// ═══════════════════════════════════════════════════════════════════════════════

function createSampleLeads() {
    return [
        {
            id: 'lead_001',
            company: 'TechStartup BG',
            website: 'https://techstartup.bg',
            contact: 'CTO',
            email: 'cto@techstartup.bg',
            priority: 'high',
            detected_issue: 'Slow API response times (>500ms) and missing rate limiting',
            latency: 523,
            vulnerability_type: 'performance',
            technology_stack: ['Node.js', 'React', 'PostgreSQL'],
            source: 'linkedin-scan',
        },
        {
            id: 'lead_002',
            company: 'E-Commerce Pro',
            website: 'https://ecommerce-pro.com',
            contact: 'Security Lead',
            priority: 'critical',
            detected_issue: 'Exposed admin endpoints and weak authentication',
            vulnerability_type: 'authentication',
            technology_stack: ['PHP', 'Laravel', 'MySQL'],
            source: 'github-scan',
        },
        {
            id: 'lead_003',
            company: 'FinTech Solutions',
            website: 'https://fintech-solutions.eu',
            priority: 'high',
            detected_issue: 'Missing HTTPS on payment endpoints',
            vulnerability_type: 'encryption',
            technology_stack: ['Java', 'Spring Boot', 'Oracle'],
            source: 'manual-discovery',
        },
        {
            id: 'lead_004',
            company: 'Healthcare App',
            website: 'https://healthapp.io',
            priority: 'critical',
            detected_issue: 'GDPR compliance gaps in patient data handling',
            vulnerability_type: 'compliance',
            technology_stack: ['Python', 'Django', 'MongoDB'],
            source: 'referral',
        },
        {
            id: 'lead_005',
            company: 'Gaming Studio',
            website: 'https://gamestudio.net',
            priority: 'medium',
            detected_issue: 'Bot detection bypass vulnerabilities',
            vulnerability_type: 'anti-bot',
            technology_stack: ['C#', 'Unity', 'Redis'],
            source: 'organic',
        },
    ];
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS & EXECUTION
// ═══════════════════════════════════════════════════════════════════════════════

module.exports = { startHarvester, createSampleLeads };

// Run if called directly
if (require.main === module) {
    // Complexity: O(1)
    startHarvester().catch(console.error);
}
