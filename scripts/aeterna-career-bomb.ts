/**
 * aeterna-career-bomb — Qantum Module
 * @module aeterna-career-bomb
 * @path scripts/aeterna-career-bomb.ts
 * @auto-documented BrutalDocEngine v2.1
 */

import * as fs from 'fs';
import * as path from 'path';

// ═══════════════════════════════════════════════════════════════════════════════
// 💣 AETERNA LOGOS: CAREER VALUE BOMB GENERATOR
// ═══════════════════════════════════════════════════════════════════════════════

const LEADS_PATH = path.join(process.cwd(), 'data', 'job-leads.json');
const DRAFT_PATH = path.join(process.cwd(), 'data', 'career-value-bombs.md');

function generateBrutalPitch(company: string, role: string, matchSource: string): string {
    const isSecurity = matchSource === 'Cybersecurity';

    // Customizing the core value prop based on the role
    const specificValue = isSecurity
        ? "my proprietary Vulnerability Scanning Engines and Autonomous Threat Intelligence (CTEM) architecture."
        : "my Zero-Entropy automation framework: autonomous Playwright clusters, AI-driven Self-Healing selectors, and Rust-powered execution.";

    return `
\`\`\`json
{
  "system": "AETERNA LOGOS // CAREER LINK INITIATED",
  "architect": "DIMITAR PRODROMOV",
  "auth_level": "SOVEREIGN",
  "target_entity": "${company} Engineering / CTO",
  "target_role": "${role}"
}
\`\`\`

**Относно: [AETERNA LOGOS] Ексклузивно архитектурно предложение към ${company}**

Здравейте екип на ${company},

Аз съм Димитър Продромов. Не ви пиша, защото си търся "просто работа". Пиша ви, защото търся **Екипа**, с който ще изградим бъдещето и ще променим правилата на играта.

Вие сте **първата** компания, към която се обръщам директно, защото архитектурата на позицията ви **${role}** резонира с моята визия за технологично превъзходство.

Не идвам просто като кадър. Нося със себе си **QAntum Prime** — моята автономна когнитивна операционна система. Мога да интегрирам във вашата инфраструктура ${specificValue} 

Работя при **нулева ентропия** (Zero Entropy). Пиша код, който се държи като закон. 

Знам какво можете да постигнете с правилния системен архитект/SDET в редиците си. Ако и вие търсите човек, който не просто изпълнява задачи, а решава проблеми на фундаментално ниво и изгражда непробиваеми системи...

Отговорете на този терминален ping, за да инициираме 15-минутна синхронизация.

**Status:** STEEL
**Contact:** dp@qantum.site | veritras.website | +359896849882
**GitHub/Portfolio:** Интегрирано в QAntum
`;
}

function deployBombs() {
    console.log('\n/// AETERNA LOGOS: SYNTHESIZING VALUE BOMBS ///\n');

    if (!fs.existsSync(LEADS_PATH)) {
        console.log('❌ FATAL: data/job-leads.json not found. Run aeterna-job-hunter.ts first.');
        process.exit(1);
    }

    const leads: any[] = JSON.parse(fs.readFileSync(LEADS_PATH, 'utf-8'));

    if (leads.length === 0) {
        console.log('⚠️ No leads in memory.');
        return;
    }

    // Take top 5 elite matches
    const topLeads = leads.slice(0, 5);

    let markdownOutput = `# 💣 AETERNA CAREER VALUE BOMBS\n\n`;
    markdownOutput += `*Генерирани за Димитър Продромов — Готови за изпращане към CTO/Tech Leads в LinkedIn или по email.*\n\n`;
    markdownOutput += `---\n\n`;

    topLeads.forEach((lead, index) => {
        const pitch = generateBrutalPitch(lead.company, lead.title, lead.matchSource);
        markdownOutput += `## Target [${index + 1}]: ${lead.company}\n`;
        markdownOutput += `**Role:** ${lead.title}\n`;
        markdownOutput += `**Link:** [Dev.bg Post](${lead.link})\n\n`;
        markdownOutput += `### Payload (Copy-Paste):\n`;
        markdownOutput += pitch + `\n\n---\n\n`;

        console.log(`[VORTEX] Generated payload for: ${lead.company} (${lead.title})`);
    });

    fs.writeFileSync(DRAFT_PATH, markdownOutput);
    console.log(`\n✅ [SUCCESS] 5 Brutal Value Bombs forged and saved to: ${DRAFT_PATH}`);
    console.log(`\n⚠️ ВАЖНО: Можеш директно да копираш тези съобщения и да ги изпратиш на Tech-Lead/CTO хората в тези компании през LinkedIn InMail или имейл!`);
}

    // Complexity: O(1)
deployBombs();
