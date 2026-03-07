/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🚀 B2B AGENCY RUNNER — ПЕЧАТНИЦАТА ЗА ПАРИ
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * AGENCY_MODE: Впряга DeepSeek-v3 да генерира Value Bombs и Sales Pitches
 * за B2B клиенти. Без крипто, без trading — чисто AI-powered lead gen.
 * 
 * Usage: npx ts-node qantum/b2b-agency-runner.ts
 * 
 * @author Димитър Продромов / Mister Mind
 * @version 1.0.0
 */

import { OllamaManager } from '../../ai/OllamaManager';
import { ValueBombGenerator } from '../../src/finance/ValueBombGenerator';
import { AutonomousSalesForce } from '../../src/reality/AutonomousSalesForce';
import { QantumEmailSender, EmailPayload } from './email-sender';
import * as fs from 'fs';
import * as path from 'path';

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIG — Зареди .env ако съществува
// ═══════════════════════════════════════════════════════════════════════════════
const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
        const [key, ...vals] = line.split('=');
        if (key && vals.length) {
            process.env[key.trim()] = vals.join('=').trim();
        }
    });
}

// ═══════════════════════════════════════════════════════════════════════════════
// TARGET PROFILES
// ═══════════════════════════════════════════════════════════════════════════════

interface B2BTarget {
    name: string;
    company: string;
    domain: string;        // за ValueBombGenerator.generate(domain, company)
    email?: string;        // имейл за автоматично изпращане
    role: string;
    painPoint: string;
    phone?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════════

async function igniteB2BAgency() {
    console.clear();
    console.log(`
🚀 ═══════════════════════════════════════════════════════════════════════════════
   QANTUM PRIME — B2B AGENCY MODE
   ─────────────────────────────────────────────────────────────────────────────
   "Крипто арбитражът изисква война с Уолстрийт. Тук воюваме с нормални бизнеси,
    а ние имаме AGI оръжие."
═══════════════════════════════════════════════════════════════════════════════
    `);

    // 1. Инициализиране на Мозъка (LLM) — Singleton pattern
    const llm = OllamaManager.getInstance();
    console.log("🧠 Core Intelligence [OllamaManager] Linked.");

    // 2. Инициализиране на Бизнес Модулите — Singleton pattern
    const valueBombGen = ValueBombGenerator.getInstance();
    console.log("💣 ValueBombGenerator Online.");

    // AutonomousSalesForce приема (llm, valueBombGen) в конструктора
    const salesForce = new AutonomousSalesForce(llm, valueBombGen);
    console.log("🎯 AutonomousSalesForce Armed.");

    // 3. Реални таргети от Lead Hunter
    const targets: B2BTarget[] = [
        {
            name: "CEO",
            company: "DevriX",
            domain: "devrix.com",
            email: "contact@devrix.com",
            role: "Decision Maker",
            painPoint: "WordPress and web app testing needs automation"
        },
        {
            name: "CEO",
            company: "Xplora",
            domain: "xplora.bg",
            email: "human@xplora.bg",
            role: "Decision Maker",
            painPoint: "Lead generation for clients is manual and slow"
        },
        {
            name: "CEO",
            company: "Netinfo",
            domain: "netinfo.bg",
            email: "reklama@netinfo.bg",
            role: "Decision Maker",
            painPoint: "No automated website security scanning for client reports"
        },
        {
            name: "CEO",
            company: "SpeedFlow",
            domain: "speedflow.bg",
            email: "info@speedflow.bg",
            role: "Decision Maker",
            painPoint: "Need automated lead generation tools for B2B clients"
        },
        {
            name: "CEO",
            company: "Stenik",
            domain: "stenik.bg",
            email: "office@stenik.bg",
            role: "Decision Maker",
            painPoint: "E-commerce clients need automated security and performance checks"
        },
        {
            name: "CEO",
            company: "Payhawk",
            domain: "payhawk.com",
            email: "sales@payhawk.com",
            role: "Decision Maker",
            painPoint: "Need advanced risk management and fraud detection"
        },
        {
            name: "CEO",
            company: "Nexo",
            domain: "nexo.com",
            email: "support@nexo.com",
            role: "Decision Maker",
            painPoint: "Crypto lending needs real-time arbitrage and risk analysis"
        },
        {
            name: "CEO",
            company: "ICan",
            domain: "icanpreneur.com",
            email: "info@icanpreneur.com",
            role: "Decision Maker",
            painPoint: "Startup analytics platform needs AI insights"
        },
        {
            name: "CEO",
            company: "SoftUni",
            domain: "softuni.bg",
            email: "university@softuni.bg",
            role: "Decision Maker",
            painPoint: "Need AI-powered tools for teaching automation"
        },
        {
            name: "CEO",
            company: "SumUp",
            domain: "sumup.com",
            email: "support@sumup.com",
            role: "Decision Maker",
            painPoint: "Payment processing needs low-latency optimization"
        },
        {
            name: "CEO",
            company: "myPOS",
            domain: "mypos.com",
            email: "sales@mypos.com",
            role: "Decision Maker",
            painPoint: "POS infrastructure needs performance monitoring and load testing"
        },
        {
            name: "CEO",
            company: "Hop Online",
            domain: "hop.bg",
            email: "support@hop.bg",
            role: "Decision Maker",
            painPoint: "SEO audits and technical analysis are time-consuming"
        },
    ];

    console.log(`\n🎯 Намерени ${targets.length} таргета.\n`);

    // 4. Инициализиране на Email Sender (ако има App Password)
    const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD || '';
    let emailSender: QantumEmailSender | null = null;

    if (GMAIL_APP_PASSWORD) {
        emailSender = new QantumEmailSender({
            senderEmail: 'papica777@gmail.com',
            senderName: 'Dimitar Prodromov',
            appPassword: GMAIL_APP_PASSWORD,
        });

        // SAFETY: async operation — wrap in try-catch for production resilience
        const smtpOk = await emailSender.verify();
        if (smtpOk) {
            console.log('📧 Email Sender ARMED — имейлите ще се изпращат автоматично!');
        } else {
            console.log('⚠️  SMTP верификация неуспешна — имейли НЯМА да се изпращат.');
            emailSender = null;
        }
    } else {
        console.log('ℹ️  GMAIL_APP_PASSWORD не е зададен → имейлите ще се запишат само като файлове.');
        console.log('   За да активираш автоматично изпращане:');
        console.log('   1. Отиди на https://myaccount.google.com/apppasswords');
        console.log('   2. Създай App Password');
        console.log('   3. Добави GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx в .env файла');
    }

    // Ensure output directory exists
    const outputDir = path.join(process.cwd(), 'dashboard', 'b2b-pitches');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    for (const target of targets) {
        console.log(`\n⚡ ═══ ${target.company} (${target.name}, ${target.role}) ═══`);

        // A) ValueBombGenerator.generate(domain, companyName) → ValueBomb обект
        console.log(`💣 Генериране на Value Bomb за ${target.domain}...`);
        // SAFETY: async operation — wrap in try-catch for production resilience
        const valueBomb = await valueBombGen.generate(target.domain, target.company);

        // B) AutonomousSalesForce.craftOutreachMessage(prospect, valueBombContent)
        console.log(`📝 Генериране на Sales Pitch...`);
        // SAFETY: async operation — wrap in try-catch for production resilience
        const pitchMessage = await salesForce.craftOutreachMessage(
            {
                name: target.name,
                company: target.company,
                role: target.role,
                painPoint: target.painPoint
            },
            valueBomb.markdownContent || valueBomb.executiveSummary || 'Value Bomb Generated'
        );

        // C) Запазване в папка
        const safeCompanyName = target.company.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const timestamp = new Date().toISOString().split('T')[0];

        // Pitch съобщение
        const pitchFile = path.join(outputDir, `${safeCompanyName}_pitch_${timestamp}.txt`);
        fs.writeFileSync(pitchFile, [
            `From: Dimitar Prodromov <papica777@gmail.com>`,
            `To: ${target.name} (${target.role} @ ${target.company})`,
            `Domain: ${target.domain}`,
            `Pain Point: ${target.painPoint}`,
            `Generated: ${new Date().toISOString()}`,
            ``,
            `══════ OUTREACH MESSAGE ══════`,
            ``,
            pitchMessage,
            ``,
            `══════ VALUE BOMB (SUMMARY) ══════`,
            ``,
            `ID: ${valueBomb.id}`,
            `Estimated Value: $${valueBomb.totalEstimatedValue?.toLocaleString() || 'N/A'}`,
            `Pricing Tier: ${valueBomb.pricingTier || 'N/A'}`,
            `Sections: ${valueBomb.sections?.length || 0}`,
            ``,
            valueBomb.executiveSummary || '',
            ``,
            `══════ CALL TO ACTION ══════`,
            ``,
            valueBomb.callToAction || '',
        ].join('\n'));

        // Value Bomb MD файл (пълен)
        if (valueBomb.markdownContent) {
            const bombFile = path.join(outputDir, `${safeCompanyName}_valuebomb_${timestamp}.md`);
            fs.writeFileSync(bombFile, valueBomb.markdownContent);
        }

        // D) Автоматично изпращане на имейл (ако има email sender + target email)
        if (emailSender && target.email) {
            console.log(`📧 Изпращане на имейл до ${target.email}...`);

            const subject = `[QAntum] Безплатен AI анализ на ${target.domain} — ${valueBomb.pricingTier || 'PREMIUM'} ниво`;
            const htmlBody = QantumEmailSender.pitchToHtml(pitchMessage, 'Dimitar Prodromov');

            // SAFETY: async operation — wrap in try-catch for production resilience
            await emailSender.send({
                to: target.email,
                toName: target.name,
                subject,
                textBody: pitchMessage,
                htmlBody,
            });
        } else if (emailSender && !target.email) {
            console.log(`ℹ️  Няма имейл за ${target.name} — пропускам автоматично изпращане.`);
        }

        console.log(`✅ ${target.company} — ГОТОВО!`);
        console.log(`   📁 Pitch: ${pitchFile}`);
        console.log(`   💣 Bomb ID: ${valueBomb.id}`);
        console.log('─'.repeat(60));
    }

    console.log(`
🔥 ═══════════════════════════════════════════════════════════════════════════════
   ВСИЧКИ ТАРГЕТИ ОБРАБОТЕНИ!
   ─────────────────────────────────────────────────────────────────────────────
   📁 Провери: ${outputDir}
   📧 Email Sender: ${emailSender ? 'ACTIVE — имейли бяха изпратени автоматично' : 'OFFLINE — добави GMAIL_APP_PASSWORD в .env'}
   
   Следващи стъпки:
   1. Прегледай pitch файловете
   2. Копирай съобщенията → LinkedIn / Email
   3. Когато отговорят → пусни linkedin-carousel-generator.html
   4. Затвори 2 клиента → автоматизирай изпращането
═══════════════════════════════════════════════════════════════════════════════
    `);
}

    // Complexity: O(1)
igniteB2BAgency().catch(err => {
    console.error('❌ B2B Agency Runner Error:', err);
    process.exit(1);
});
