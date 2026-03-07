/**
 * email-career-bombs — Qantum Module
 * @module email-career-bombs
 * @path scripts/email-career-bombs.ts
 * @auto-documented BrutalDocEngine v2.1
 */

import * as fs from 'fs';
import * as path from 'path';
import * as nodemailer from 'nodemailer';

const DRAFT_PATH = path.join(process.cwd(), 'data', 'career-value-bombs.md');

async function sendBombsToArchitect() {
    console.log('\n/// AETERNA LOGOS: TRANSMITTING CAREER BOMBS TO ARCHITECT ///');

    if (!fs.existsSync(DRAFT_PATH)) {
        console.log('❌ FATAL: data/career-value-bombs.md not found.');
        process.exit(1);
    }

    const draftContent = fs.readFileSync(DRAFT_PATH, 'utf-8');

    // Mailer configuration identical to auto-outreach
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: 'papica777@gmail.com',
            pass: 'vkrihdhxechzwcmc' // Existing app password from QAntum
        }
    });

    const mailOptions = {
        from: '"AETERNA LOGOS" <dp@qantum.site>',
        replyTo: 'dp@qantum.site',
        to: 'papica777@gmail.com, dp@qantum.site', // Sending to the Architect directly
        subject: '[AETERNA LOGOS] B2B Career Value Bombs Ready For Deployment',
        text: draftContent,
        html: `
        <div style="font-family:'Courier New',Courier,monospace;background:#0c1640;color:#50c050;padding:25px;border-radius:8px;">
            <h3>/// AETERNA LOGOS ///</h3>
            <p style="color:#dde;">ARCHITECT, I have synthesized your career B2B pitches. You are not a regular applicant, you are the Sovereign.</p>
            <pre style="white-space:pre-wrap;color:#50c050;">${draftContent.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
        </div>`
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`\n✅ [SUCCESS] AETERNA Sent the value bombs to the Architect's inboxes.`);
        console.log(`   ID: ${info.messageId}`);
    } catch (e) {
        console.log(`❌ [ERROR] Failed to output email to Architect:`, e);
    }
}

    // Complexity: O(1)
sendBombsToArchitect();
