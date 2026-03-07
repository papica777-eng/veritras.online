/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🎯 LEAD HUNTER — АВТОМАТИЧНО ТЪРСЕНЕ НА B2B ТАРГЕТИ
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Търси реални компании от бизнес директории и ги добавя като таргети.
 * 
 * Usage: node qantum/lead-hunter.js
 * 
 * @author Димитър Продромов
 * @version 1.0.0
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

// ═══════════════════════════════════════════════════════════════════════════════
// НИШИ И КЛЮЧОВИ ДУМИ
// ═══════════════════════════════════════════════════════════════════════════════

const NICHES = [
    {
        name: 'QA & Testing Companies',
        searchQueries: [
            'QA company Bulgaria',
            'software testing company Sofia',
            'test automation company Europe',
            'QA outsourcing Bulgaria',
        ],
        painPoints: [
            'Flaky tests cost 30-40% of QA time',
            'Manual test maintenance is expensive',
            'No AI-powered test failure prediction',
            'Compliance auditing is manual and slow',
        ],
        services: ['Self-Healing Tests', 'AI Failure Prediction', 'Compliance AutoPilot'],
    },
    {
        name: 'Marketing Agencies',
        searchQueries: [
            'digital marketing agency Bulgaria',
            'маркетинг агенция София',
            'SEO agency Bulgaria',
            'web design agency Sofia',
        ],
        painPoints: [
            'Lead generation is time-consuming and expensive',
            'Client website audits take hours manually',
            'Cold outreach has low response rates',
            'No automated security/performance scanning for clients',
        ],
        services: ['AI Website Audit', 'Automated Lead Gen', 'Value Bomb Reports'],
    },
    {
        name: 'Fintech & Crypto Startups',
        searchQueries: [
            'fintech company Bulgaria',
            'crypto startup Europe',
            'trading platform company',
            'DeFi company Bulgaria',
        ],
        painPoints: [
            'Need low-latency trading infrastructure',
            'Risk management is complex and expensive',
            'No real-time arbitrage detection',
            'Building trading dashboards from scratch is costly',
        ],
        services: ['HFT Engine (100ns/tick)', 'Risk Management Suite', 'Arbitrage Scanner'],
    },
];

// ═══════════════════════════════════════════════════════════════════════════════
// GOOGLE SEARCH SCRAPER (без API ключ)
// ═══════════════════════════════════════════════════════════════════════════════

async function searchGoogle(query, maxResults = 5) {
    const results = [];
    
    // Метод 1: DuckDuckGo HTML (по-лесен за scrape)
    try {
        const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
        
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html',
            },
            timeout: 10000,
        });

        const $ = cheerio.load(response.data);
        
        // DuckDuckGo HTML results
        $('.result').each((i, el) => {
            if (i >= maxResults) return false;
            
            const title = $(el).find('.result__title a').text().trim();
            const link = $(el).find('.result__url').text().trim();
            const snippet = $(el).find('.result__snippet').text().trim();
            
            let domain = link.replace(/^https?:\/\//, '').replace('www.', '').split('/')[0].trim();
            let fullUrl = link.startsWith('http') ? link : `https://${domain}`;
            
            if (title && domain && !domain.includes('duckduckgo') && !domain.includes('google')) {
                results.push({ title, domain, url: fullUrl, snippet });
            }
        });
    } catch (err) {
        console.log(`   ⚠️  DuckDuckGo failed: ${err.message}`);
    }

    // Метод 2: Ако DuckDuckGo не върне резултати — ръчен fallback
    if (results.length === 0) {
        try {
            const url = `https://www.google.com/search?q=${encodeURIComponent(query)}&num=${maxResults}&hl=en`;
            const response = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'text/html',
                    'Accept-Language': 'en-US,en;q=0.9',
                },
                timeout: 10000,
            });
            const $ = cheerio.load(response.data);
            $('a[href^="/url?"]').each((i, el) => {
                if (results.length >= maxResults) return false;
                const href = $(el).attr('href') || '';
                const match = href.match(/\/url\?q=([^&]+)/);
                if (match) {
                    try {
                        const realUrl = decodeURIComponent(match[1]);
                        const domain = new URL(realUrl).hostname.replace('www.', '');
                        const title = $(el).text().trim();
                        if (domain && !domain.includes('google') && !domain.includes('youtube') && title.length > 3) {
                            results.push({ title: title.split('\n')[0], domain, url: realUrl, snippet: '' });
                        }
                    } catch {}
                }
            });
        } catch {}
    }
    
    return results;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONTACT FINDER — търси имейли/контакти на сайта
// ═══════════════════════════════════════════════════════════════════════════════

async function findContacts(domain) {
    const contacts = { emails: [], phones: [], names: [] };
    
    const pagesToCheck = [
        `https://${domain}`,
        `https://${domain}/contact`,
        `https://${domain}/contacts`,
        `https://${domain}/about`,
        `https://${domain}/team`,
        `https://${domain}/kontakti`,
        `https://${domain}/za-nas`,
    ];

    for (const pageUrl of pagesToCheck) {
        try {
            const resp = await axios.get(pageUrl, {
                headers: { 
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0' 
                },
                timeout: 5000,
                maxRedirects: 3,
            });
            
            const html = resp.data;
            
            // Имейли (regex)
            const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
            const foundEmails = html.match(emailRegex) || [];
            foundEmails.forEach(e => {
                const lower = e.toLowerCase();
                // Филтрирай junk
                if (!lower.includes('example.com') && 
                    !lower.includes('wixpress') &&
                    !lower.includes('sentry') &&
                    !lower.includes('schema.org') &&
                    !lower.endsWith('.png') &&
                    !lower.endsWith('.jpg')) {
                    contacts.emails.push(lower);
                }
            });
            
            // Телефони (BG формат)
            const phoneRegex = /(?:\+359|0)\s*\d[\d\s\-]{7,12}/g;
            const foundPhones = html.match(phoneRegex) || [];
            contacts.phones.push(...foundPhones.map(p => p.replace(/\s+/g, '')));
            
        } catch {
            // Ignore — page might not exist
        }
    }
    
    // Дедупликация
    contacts.emails = [...new Set(contacts.emails)];
    contacts.phones = [...new Set(contacts.phones)];
    
    return contacts;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SEED DATABASE — познати компании по ниши (вместо скрейпинг)
// ═══════════════════════════════════════════════════════════════════════════════

const SEED_TARGETS = [
    // ═══ QA & Testing Companies ═══
    { domain: 'musala.com', company: 'Musala Soft', niche: 'QA & Testing', painPoint: 'Manual test maintenance is expensive and time-consuming' },
    { domain: 'siteground.com', company: 'SiteGround', niche: 'QA & Testing', painPoint: 'Infrastructure monitoring and automated testing at scale' },
    { domain: 'scalefocus.com', company: 'ScaleFocus', niche: 'QA & Testing', painPoint: 'QA automation for enterprise clients needs AI-powered optimization' },
    { domain: 'proxiad.com', company: 'Proxiad', niche: 'QA & Testing', painPoint: 'Test maintenance across multiple client projects is costly' },
    { domain: 'mentormate.com', company: 'MentorMate', niche: 'QA & Testing', painPoint: 'Flaky tests in CI/CD pipelines slow delivery' },
    { domain: 'softuni.bg', company: 'SoftUni', niche: 'QA & Testing', painPoint: 'Need AI-powered tools for teaching automation' },
    { domain: 'telerik.com', company: 'Telerik (Progress)', niche: 'QA & Testing', painPoint: 'Test Studio competitors with AI self-healing' },
    { domain: 'devrix.com', company: 'DevriX', niche: 'QA & Testing', painPoint: 'WordPress and web app testing needs automation' },

    // ═══ Marketing Agencies ═══
    { domain: 'xplora.bg', company: 'Xplora', niche: 'Marketing Agency', painPoint: 'Lead generation for clients is manual and slow' },
    { domain: 'netinfo.bg', company: 'Netinfo', niche: 'Marketing Agency', painPoint: 'No automated website security scanning for client reports' },
    { domain: 'thenewway.bg', company: 'The New Way', niche: 'Marketing Agency', painPoint: 'Client reporting and audits take hours manually' },
    { domain: 'hop.bg', company: 'Hop Online', niche: 'Marketing Agency', painPoint: 'SEO audits and technical analysis are time-consuming' },
    { domain: 'speedflow.bg', company: 'SpeedFlow', niche: 'Marketing Agency', painPoint: 'Need automated lead generation tools for B2B clients' },
    { domain: 'dgtl.bg', company: 'DGTL Agency', niche: 'Marketing Agency', painPoint: 'Website performance monitoring for clients needs automation' },
    { domain: 'stenik.bg', company: 'Stenik', niche: 'Marketing Agency', painPoint: 'E-commerce clients need automated security and performance checks' },
    { domain: 'bookonline.bg', company: 'BookOnline', niche: 'Marketing Agency', painPoint: 'Digital marketing analytics need AI enhancement' },

    // ═══ Fintech & Crypto ═══
    { domain: 'payhawk.com', company: 'Payhawk', niche: 'Fintech', painPoint: 'Need advanced risk management and fraud detection' },
    { domain: 'nexo.com', company: 'Nexo', niche: 'Fintech', painPoint: 'Crypto lending needs real-time arbitrage and risk analysis' },
    { domain: 'sumup.com', company: 'SumUp', niche: 'Fintech', painPoint: 'Payment processing needs low-latency optimization' },
    { domain: 'mypos.com', company: 'myPOS', niche: 'Fintech', painPoint: 'POS infrastructure needs performance monitoring and load testing' },
    { domain: 'phyre.com', company: 'Phyre', niche: 'Fintech', painPoint: 'Mobile wallet security testing and compliance scanning' },
    { domain: 'gtmhub.com', company: 'Gtmhub (Quantive)', niche: 'Fintech', painPoint: 'Platform needs predictive analytics and AI optimization' },
    { domain: 'dext.com', company: 'Dext', niche: 'Fintech', painPoint: 'Accounting automation needs AI-powered data extraction' },
    { domain: 'icanpreneur.com', company: 'ICan', niche: 'Fintech', painPoint: 'Startup analytics platform needs AI insights' },
];

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN — HUNT!
// ═══════════════════════════════════════════════════════════════════════════════

async function hunt() {
    console.log(`
🎯 ═══════════════════════════════════════════════════════════════════════════════
   QANTUM PRIME — LEAD HUNTER v1.0
   ─────────────────────────────────────────────────────────────────────────────
   "Намери ги. Сканирай ги. Бомбардирай ги с Value."
═══════════════════════════════════════════════════════════════════════════════
    `);

    console.log(`📋 Seed database: ${SEED_TARGETS.length} компании в 3 ниши\n`);
    
    const allLeads = [];
    
    // Сканираме директно seed targets за контакти
    let currentNiche = '';
    for (const target of SEED_TARGETS) {
        if (target.niche !== currentNiche) {
            currentNiche = target.niche;
            console.log(`\n🔍 ═══ ${currentNiche} ═══`);
        }
        
        console.log(`   📡 ${target.domain}...`);
        // SAFETY: async operation — wrap in try-catch for production resilience
        const contacts = await findContacts(target.domain);
        
        const lead = {
            company: target.company,
            domain: target.domain,
            url: `https://${target.domain}`,
            snippet: '',
            niche: target.niche,
            painPoint: target.painPoint,
            services: NICHES.find(n => target.niche.includes(n.name.split(' ')[0]))?.services || [],
            emails: contacts.emails,
            phones: contacts.phones,
            discoveredAt: new Date().toISOString(),
        };
        
        allLeads.push(lead);
        
        if (contacts.emails.length > 0) {
            console.log(`      ✅ 📧 ${contacts.emails.join(', ')}`);
        } else {
            console.log(`      ⚠️  No email found`);
        }
        if (contacts.phones.length > 0) {
            console.log(`      📞 ${contacts.phones.join(', ')}`);
        }
        
        // Малка пауза между заявки
        // SAFETY: async operation — wrap in try-catch for production resilience
        await new Promise(r => setTimeout(r, 1000));
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // ЗАПАЗВАНЕ НА РЕЗУЛТАТИТЕ
    // ═══════════════════════════════════════════════════════════════════════════

    const outputDir = path.join(process.cwd(), 'dashboard', 'b2b-pitches');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
    
    // JSON с всички leads
    const leadsFile = path.join(outputDir, `leads_${new Date().toISOString().split('T')[0]}.json`);
    fs.writeFileSync(leadsFile, JSON.stringify(allLeads, null, 2));
    
    // Генериране на targets масив за b2b-agency-runner.ts
    const targetsWithEmail = allLeads.filter(l => l.emails.length > 0);
    const targetsCode = targetsWithEmail.map(l => `        {
            name: "CEO",
            company: "${l.company.replace(/"/g, '\\"')}",
            domain: "${l.domain}",
            email: "${l.emails[0]}",
            role: "Decision Maker",
            painPoint: "${l.painPoint.replace(/"/g, '\\"')}"
        }`).join(',\n');
    
    const targetsFile = path.join(outputDir, `targets_ready.ts`);
    fs.writeFileSync(targetsFile, `// Auto-generated by Lead Hunter — ${new Date().toISOString()}
// Копирай тези таргети в b2b-agency-runner.ts

export const autoTargets = [
${targetsCode}
];
`);

    // Статистика
    const withEmail = allLeads.filter(l => l.emails.length > 0).length;
    const withPhone = allLeads.filter(l => l.phones.length > 0).length;
    
    console.log(`
🔥 ═══════════════════════════════════════════════════════════════════════════════
   LEAD HUNT ЗАВЪРШЕН!
   ─────────────────────────────────────────────────────────────────────────────
   📊 Общо leads: ${allLeads.length}
   📧 С имейл:    ${withEmail}
   📞 С телефон:  ${withPhone}
   
   📁 JSON:    ${leadsFile}
   📁 Targets: ${targetsFile}
   
   Следващи стъпки:
   1. Прегледай ${leadsFile}
   2. Копирай targets от ${targetsFile} в b2b-agency-runner.ts
   3. Пусни: npx ts-node qantum/b2b-agency-runner.ts
   4. Имейлите се изпращат автоматично 🚀
═══════════════════════════════════════════════════════════════════════════════
    `);
}

    // Complexity: O(1)
hunt().catch(err => {
    console.error('❌ Lead Hunter Error:', err);
    process.exit(1);
});
