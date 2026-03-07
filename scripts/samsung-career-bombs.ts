/**
 * samsung-career-bombs — Qantum Module
 * @module samsung-career-bombs
 * @path scripts/samsung-career-bombs.ts
 * @auto-documented BrutalDocEngine v2.1
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import * as dotenv from 'dotenv';

const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
}

const ADB_PATH = process.env.ADB_PATH || '"C:\\Users\\papic\\Downloads\\platform-tools-latest-windows\\platform-tools\\adb.exe"';
const DRAFT_PATH = path.join(process.cwd(), 'data', 'career-value-bombs.md');

function deployToSamsungS24() {
    console.log('\n/// 📱 AETERNA LOGOS: SAMSUNG S24 ULTRA DEPLOYMENT ///');
    console.log('🔄 Routing payload execution strictly through mobile device...');

    if (!fs.existsSync(DRAFT_PATH)) {
        console.log('❌ FATAL: data/career-value-bombs.md not found.');
        process.exit(1);
    }

    try {
        console.log('Checking ADB Connection...');
        const devices = execSync(`${ADB_PATH} devices`).toString();
        if (!devices.includes('\tdevice')) {
            console.log('⚠️ Warning: Samsung device not detected or unauthorized. Make sure USB Debugging is ON.');
        } else {
            console.log('✅ Samsung S24 Connected. (Zero Entropy Mobile Sync)');
        }
    } catch (e) {
        console.log('⚠️ Failed to run ADB executable. Check ADB_PATH in .env');
    }

    const draftContent = fs.readFileSync(DRAFT_PATH, 'utf-8');

    let cleanContent = draftContent
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .replace(/---/g, '')
        .replace(/###/g, '')
        .trim();

    console.log('📥 Siphoning Value Bombs to Samsung UI...');

    const htmlPath = path.join(process.cwd(), 'data', 'samsung-bombs.html');

    // Build chunks
    const chunks = cleanContent.split('## Target').filter(Boolean);
    const renderChunks = chunks.map(chunk => {
        const lines = chunk.split('\n');
        const title = lines[0].trim();
        const body = chunk.substring(chunk.indexOf('Payload (Copy-Paste):') + 21).trim();
        const cleanTitle = title.replace(/\s+/g, '');

        return `
        <div class="pitch">
            <h2>${title}</h2>
            <textarea id="text-${cleanTitle}" style="width:100%; height:200px; background:#000; color:#50c050; border:none; padding:10px;">${body}</textarea><br>
            <button onclick="document.getElementById('text-${cleanTitle}').select(); document.execCommand('copy'); alert('PITCH COPIED TO CLIPBOARD');">📋 COPY PAYLOAD</button>
            <a href="mailto:?subject=AETERNA LOGOS Architectural Proposal&body=${encodeURIComponent(body)}" style="background:#6d3af0; color:#fff; text-decoration:none; display:inline-block; padding:10px 15px; border-radius:4px; font-weight:bold; margin-left:10px;">📧 Open in Gmail</a>
        </div>
        `;
    }).join('');

    const htmlContent = `
    <html>
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
            body { background: #07070f; color: #50c050; font-family: monospace; padding: 20px; font-size: 16px; margin: 0; }
            .pitch { background: #0c1640; padding: 20px; border-radius: 8px; margin-bottom: 25px; border: 1px solid #3a2876; }
            h2 { color: #fff; font-size: 18px; margin-top: 0; }
            button { background: #50c050; color: #000; border: none; padding: 10px 15px; margin-top: 10px; font-weight: bold; cursor: pointer; border-radius: 4px; }
            h1 { font-size: 22px; color: #c9b8ff; }
        </style>
    </head>
    <body>
        <h1>/// AETERNA: S24 TERMINAL ///</h1>
        <p>Architect, tap "Copy Payload" to put it in your clipboard, then switch to LinkedIn/Gmail to deploy.</p>
        <div id="content">
            ${renderChunks}
        </div>
    </body>
    </html>
    `;

    fs.writeFileSync(htmlPath, htmlContent);
    console.log(`✅ Generated S24-compatible interactive UI at ${htmlPath}`);

    try {
        console.log('📲 Pushing payload to Samsung S24...');
        // Complexity: O(1)
        execSync(`${ADB_PATH} push "${htmlPath}" /sdcard/Download/samsung-bombs.html`);

        console.log('🌐 Opening payload manifest on device browser...');
        // Complexity: O(1)
        execSync(`${ADB_PATH} shell am start -a android.intent.action.VIEW -d "file:///sdcard/Download/samsung-bombs.html" -t "text/html"`);

        console.log('\n🎯 [SUCCESS] CHECK YOUR SAMSUNG SCREEN.');
        console.log('   The terminal UI is now open on your device.');
        console.log('   You can one-tap copy the pitches and paste them into LinkedIn/Gmail perfectly from your phone.');
    } catch (e: any) {
        console.log('❌ Failed to push and open on Samsung via ADB.', e.message);
        console.log('Ensure the phone is connected via USB and ADB is authorized.');
    }
}

    // Complexity: O(1)
deployToSamsungS24();
