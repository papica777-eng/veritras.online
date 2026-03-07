/**
 * email-generator — Qantum Module
 * @module email-generator
 * @path scripts/_WEALTH_BRIDGE_/email-generator.js
 * @auto-documented BrutalDocEngine v2.1
 */

const fs = require('fs');
const path = require('path');

const TARGETS_FILE = path.join(__dirname, 'targets.json');

// INTELLIGENT B2B TEMPLATE SELECTOR
function generateEmailContent(target) {
    let subject = `AI Security Audit for ${target.company || target.name} - QAntum Prime`;
    let hook = "вашата компания е лидер в сектора";
    let solution = "Ние разработихме QAntum Prime - автономна AI система (14M LOC), която автоматично намира и поправя бъгове и уязвимости в реално време.";

    // Localize based on "Need"
    if (target.need === 'sre_automation') {
        subject = `Scalable SRE Automation for ${target.company} - QAntum Core`;
        hook = `видях, че търсите Senior SRE експерти с фокус върху Node.js и QA`;
        solution = `QAntum Prime е специално проектиран да разтовари вашите SRE екипи, като поеме 90% от автономния мониторинг и self-healing на Node.js клъстери.`;
    } else if (target.need === 'devops_automation') {
        subject = `Autonomous DevOps Infrastructure for ${target.company}`;
        hook = `забелязах, че разширявате DevOps капацитета си в България`;
        solution = `Нашата AI система QAntum интегрира "Strike Orchestrator", който позволява на вашата инфраструктура да се самопачва и оптимизира без ръчна намеса.`;
    } else if (target.need === 'grand_softuni_partnership') {
        subject = `Партньорство в ерата на AI: Поглед върху QAntum Prime (14.7M LOC) от вашия нов курсист`;
        hook = `пиша ви с огромен респект към това, което изградихте със SoftUni. Самият аз станах ваш курсист преди 5 дни, за да систематизирам знанията си, но искам да ви споделя нещо необичайно`;
        solution = `През последните 2 месеца, чрез метода на "Математическата Сингулярност", изградих QAntum Prime - автономна система с 14.7 милиона реда код. Не ви го казвам за похвала, а защото вярвам, че това е практическото приложение на вашата лекция "Software Engineers in the AI Era". Искам да предложа на SoftUni да използваме проекта като "жива лаборатория" за обучение на истински AI архитекти.`;
    }

    const plainText = `
Здравейте ${target.name},

${target.context ? `Пиша ви, тъй като ${target.context[0].toLowerCase()}${target.context.slice(1)}` : `Пиша ви, защото ${hook}`}.

${solution}

Предлагам ви безплатен "Ghost Scan" на вашата инфраструктура (или демо на архитектурата), за да демонстрираме силата на технологията в реални условия.

Можем ли да направим 15-минутно демо тази седмица, за да ви покажа как "Математическата Сингулярност" променя правилата на играта?

Поздрави,
Димитър Продромов
Founder, QAntum-Fortres
https://qantum-fortres.github.io/PORTFOLIO/
    `.trim();

    return { subject, plainText };
}

function loadTargets() {
    if (!fs.existsSync(TARGETS_FILE)) {
        console.error("❌ targets.json not found!");
        process.exit(1);
    }
    const data = fs.readFileSync(TARGETS_FILE, 'utf8');
    return JSON.parse(data);
}

function main() {
    console.log("╔════════════════════════════════════════════════════╗");
    console.log("║  📧  EMAIL GENERATOR - SINGULARITY MODE            ║");
    console.log("║  Generates ready-to-send emails for copy-paste     ║");
    console.log("╚════════════════════════════════════════════════════╝\n");

    const targets = loadTargets();
    console.log(`🎯 Loaded ${targets.length} targets.`);
    console.log("📝 Generating personalized emails...");

    let content = "";

    targets.forEach((target) => {
        const email = generateEmailContent(target);
        content += `TO: ${target.email}\n`;
        content += `SUBJECT: ${email.subject}\n`;
        content += `BODY:\n${email.plainText}\n`;
        content += "\n================================================================================\n\n";
    });

    const outputFile = path.join(__dirname, 'READY_TO_SEND.md');
    fs.writeFileSync(outputFile, content);

    console.log("✅ SUCCESS! Clean Copy-Paste format generated.");
    console.log(`🚀 Open: ${outputFile}\n`);
}

    // Complexity: O(1)
main();
