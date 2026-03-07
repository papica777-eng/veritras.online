/**
 * EmailEngine — Qantum Module
 * @module EmailEngine
 * @path scripts/_WEALTH_BRIDGE_/EmailEngine.js
 * @auto-documented BrutalDocEngine v2.1
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const RESEND_API_KEY = process.env.RESEND_API_KEY || "re_3UMJ2DNB_2MBzoBXTzyVLmXhVRjbMvV7i"; // Enterprise Key Verified
const TARGETS_FILE = path.join(__dirname, 'targets_ghost.json'); // SWITCHED TO GHOST LIST

// THE SINGULARITY PITCH ENGINE
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
        solution = `Нашата AI система QAntum интегрира "Strike Orchestrator", който позволява на вашата инфраструктура да се самопачва и оптимизира без ръчна намеса. Системата е защитена с "Genetic Hardware Lock", което гарантира, че кодът не може да бъде откраднат или стартиран на неоторизиран хардуер.`;
    } else if (target.need === 'grand_softuni_partnership') {
        subject = `Партньорство в ерата на AI: Поглед върху QAntum Prime (14.7M LOC) от вашия нов курсист`;
        hook = `пиша ви с огромен респект към това, което изградихте със SoftUni. Самият аз станах ваш курсист преди 5 дни, за да систематизирам знанията си, но искам да ви споделя нещо необичайно`;
        solution = `През последните 2 месеца, чрез метода на "Математическата Сингулярност", изградих QAntum Prime - автономна система с 14.7 милиона реда код. Не ви го казвам за похвала, а защото вярвам, че това е практическото приложение на вашата лекция "Software Engineers in the AI Era". Искам да предложа на SoftUni да използваме проекта като "жива лаборатория" за обучение на истински AI архитекти.`;
    } else if (target.need === 'internal_test') {
        subject = `TEST: QAntum Singularity Verification`;
        hook = `това е тест на автономната система`;
        solution = `Системата работи успешно.`;
    } else if (target.need === 'refactor_partner') {
        subject = `AI Modernization Partner for ${target.company} (14.7M LOC Engine)`;
        hook = `виждам, че сте лидери в модернизацията на Legacy системи (${target.context})`;
        solution = `Като собственик на QAntum Prime (14.7M LOC автономна система), разработих "Refactor Engine" - AI модул, който автоматизира миграцията на стар PHP/Java код. Искам да предложа на ${target.company} да ползва нашия енджин като "White Label" решение за ускоряване на проектите ви.`;
    }

    const plainText = `
Здравейте ${target.name},

${target.context ? `Пиша ви, тъй като ${target.context[0].toLowerCase()}${target.context.slice(1)}` : `Пиша ви, защото ${hook}`}.

${solution}

Предлагам ви безплатен "Ghost Scan" на вашата инфраструктура (или демо на архитектурата), за да демонстрираме силата на технологията в реални условия.

Можем ли да направим 15-минутно демо тази седмица?

Поздрави,
Димитър Продромов
Founder, QAntum-Fortres
https://qantum-fortres.github.io/PORTFOLIO/
    `.trim();

    return { subject, plainText };
}

async function sendEmail(target) {
    const emailContent = generateEmailContent(target);

    // Construct request payload for Resend/SendGrid (Using Resend API structure as default modern choice)
    const data = JSON.stringify({
        from: 'QAntum AI <onboarding@dpengeneering.site>', // VERIFIED DOMAIN
        to: [target.email],
        subject: emailContent.subject,
        text: emailContent.plainText
    });

    console.log(`🚀 Sending to ${target.email}...`);

    // Mock send if no key is present
    if (RESEND_API_KEY === "YOUR_API_KEY_HERE") {
        console.log(`⚠️  SIMULATION MODE: Email to ${target.email} NOT sent (Missing API Key)`);
        console.log(`   Subject: ${emailContent.subject}`);
        return;
    }

    // Actual HTTP Request Logic
    const options = {
        hostname: 'api.resend.com',
        path: '/emails',
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json'
        }
    };

    const req = https.request(options, (res) => {
        let responseData = '';
        res.on('data', (chunk) => { responseData += chunk; });
        res.on('end', () => {
            if (res.statusCode === 200 || res.statusCode === 201) {
                console.log(`✅ SENT to ${target.email} | ID: ${JSON.parse(responseData).id}`);
            } else {
                console.error(`❌ FAILED to ${target.email}: ${responseData}`);
            }
        });
    });

    req.on('error', (e) => {
        console.error(`❌ NETWORK ERROR: ${e.message}`);
    });

    req.write(data);
    req.end();
}

function main() {
    console.log("╔════════════════════════════════════════════════════╗");
    console.log("║  🤖  EMAIL ENGINE v3.0 (AUTOMATED)                 ║");
    console.log("║  Autonomous Outreach System                        ║");
    console.log("╚════════════════════════════════════════════════════╝\n");

    if (!fs.existsSync(TARGETS_FILE)) {
        console.error("❌ targets.json not found!");
        process.exit(1);
    }
    const targets = JSON.parse(fs.readFileSync(TARGETS_FILE, 'utf8'));

    console.log(`🎯 Loaded ${targets.length} targets.`);

    // Rate limit: 1 email per 10 seconds to mimic human behavior
    let delay = 0;
    targets.forEach((target) => {
        // Complexity: O(1)
        setTimeout(() => {
            // Complexity: O(1)
            sendEmail(target);
        }, delay);
        delay += 2000;
    });
}

    // Complexity: O(1)
main();
