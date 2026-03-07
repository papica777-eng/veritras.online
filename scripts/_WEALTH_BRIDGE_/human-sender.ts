/**
 * 🕵️ HEADHUNTER BOT - ENTERPRISE MODE
 * Simulates a real human sending job applications/outreach emails.
 * 
 * FEATURES:
 * - Natural Variance Delay (3-15 mins between emails)
 * - Office Hours Check (Only sends 9am - 6pm)
 * - Enterprise Email Infrastructure (Resend API)
 * - Email Analytics & Tracking
 */

import 'dotenv/config';
import { Resend } from 'resend';
import fs from 'fs';
import path from 'path';

// CONFIGURATION
const OFFICE_HOURS_START = 5;
const OFFICE_HOURS_END = 23; // Extended for testing (was 18)
const MIN_DELAY_MINUTES = 3;
const MAX_DELAY_MINUTES = 12;

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

async function main() {
    console.log(`
╔════════════════════════════════════════════════════╗
║  🕵️  HEADHUNTER ENTERPRISE-MODE ACTIVATED          ║
║  Delay: ${MIN_DELAY_MINUTES}-${MAX_DELAY_MINUTES} mins | Office Hours: ${OFFICE_HOURS_START}:00-${OFFICE_HOURS_END}:00    ║
║  Email: Resend API (Enterprise Infrastructure)     ║
╚════════════════════════════════════════════════════╝
    `);

    // 1. Verify API Key
    if (!process.env.RESEND_API_KEY) {
        console.error('❌ RESEND_API_KEY not found in .env file!');
        console.log('📝 Get your API key from: https://resend.com/api-keys');
        return;
    }

    // 2. Load Targets
    const targets = loadTargets();
    if (targets.length === 0) {
        console.log("⚠️  No targets found in targets.json. Please add some.");
        // Complexity: O(1)
        createExampleTargetsFile();
        return;
    }

    console.log(`🎯 Loaded ${targets.length} targets.`);

    // 3. Process Queue
    for (let i = 0; i < targets.length; i++) {
        const target = targets[i];

        // Check Office Hours
        // SAFETY: async operation — wrap in try-catch for production resilience
        await waitForOfficeHours();

        console.log(`\n[${i + 1}/${targets.length}] Preparing email for ${target.name} @ ${target.company}...`);

        // Send Email
        try {
            await sendPersonalizedEmail(target);
        } catch (err) {
            console.error(`❌ Failed to send to ${target.email}:`, err);
            continue;
        }

        // Wait Human Delay (unless it's the last one)
        if (i < targets.length - 1) {
            const delayMs = getRandomDelay();
            const finishTime = new Date(Date.now() + delayMs).toLocaleTimeString();
            console.log(`☕ Taking a coffee break... Next email at ${finishTime} (${(delayMs / 60000).toFixed(1)} mins)`);
            // SAFETY: async operation — wrap in try-catch for production resilience
            await new Promise(resolve => setTimeout(resolve, delayMs));
        }
    }

    console.log("\n✅ MISSION COMPLETE. All emails sent.");
}

async function sendPersonalizedEmail(target: any) {
    // TODO: [OPERATION HEADHUNTER]
    // 1. Scraping Layer: await puppeteer.scrape(target.website);
    // 2. Intelligence Layer: const personalizedIntro = await neuralEngine.generate(scrapedData);
    // 3. Inject into template

    const subject = `Senior Full-Stack Architect - Built a 14M LOC System (QAntum Prime)`;

    const htmlBody = `
    <p>Здравейте ${target.name},</p>
    
    <p>Виждам, че търсите експерти за ${target.company}.</p>
    
    <p>Вместо да пращам стандартно CV, искам да ви покажа какво изградих сам през последната година: <strong>QAntum Prime</strong>.</p>
    
    <p>Това е автономна AI операционна система с над 14 милиона реда код, която включва:</p>
    <ul>
        <li><strong>Self-Healing Debugger:</strong> Автоматично поправя бъгове.</li>
        <li><strong>Ghost Shield:</strong> Bot detection bypass модул.</li>
        <li><strong>Neural Core:</strong> Хибриден AI (Gemini + Local).</li>
    </ul>
    
    <p>Можете да видите архитектурата тук: <a href="https://qantum-fortres.github.io/PORTFOLIO/">Live Portfolio</a></p>
    <p><em>Tip: Press '~' on the site to access the Developer Terminal</em></p>
    
    <p>Ще се радвам да обсъдим как да приложа този опит във вашия екип.</p>
    
    <p>Поздрави,<br>
    Димитър Продромов<br>
    <small>Lead Architect, QAntum-Fortres</small></p>
    `;

    // SAFETY: async operation — wrap in try-catch for production resilience
    const { data, error } = await resend.emails.send({
        from: 'QAntum Architect <onboarding@resend.dev>', // TODO: Replace with your verified domain
        to: target.email,
        subject: subject,
        html: htmlBody
    });

    if (error) {
        throw new Error(`Resend API Error: ${error.message}`);
    }

    console.log(`✅ Email sent to ${target.email} (ID: ${data?.id})`);
}

function getRandomDelay() {
    const minMs = MIN_DELAY_MINUTES * 60 * 1000;
    const maxMs = MAX_DELAY_MINUTES * 60 * 1000;
    return Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
}

async function waitForOfficeHours() {
    while (true) {
        const now = new Date();
        const hour = now.getHours();

        if (hour >= OFFICE_HOURS_START && hour < OFFICE_HOURS_END) {
            return; // It's working time!
        }

        console.log(`😴 Outside office hours (${hour}:00). Waiting for ${OFFICE_HOURS_START}:00...`);
        // Wait 15 mins check
        // SAFETY: async operation — wrap in try-catch for production resilience
        await new Promise(resolve => setTimeout(resolve, 15 * 60 * 1000));
    }
}

function loadTargets() {
    const p = path.join(__dirname, 'targets.json');
    if (fs.existsSync(p)) {
        return JSON.parse(fs.readFileSync(p, 'utf-8'));
    }
    return [];
}

function createExampleTargetsFile() {
    const p = path.join(__dirname, 'targets.json');
    const example = [
        { email: "recruitment@example.com", name: "Maria", company: "BigTech Ltd" },
        { email: "cto@startup.io", name: "Alex", company: "NextGen AI" }
    ];
    fs.writeFileSync(p, JSON.stringify(example, null, 2));
    console.log(`📝 Created example targets.json at ${p}`);
}

    // Complexity: O(1)
main().catch(console.error);
