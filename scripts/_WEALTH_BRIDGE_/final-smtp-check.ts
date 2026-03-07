/**
 * final-smtp-check — Qantum Module
 * @module final-smtp-check
 * @path scripts/_WEALTH_BRIDGE_/final-smtp-check.ts
 * @auto-documented BrutalDocEngine v2.1
 */

import nodemailer from 'nodemailer';

async function test() {
    console.log('Testing with hardcoded credentials from screenshot...');
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'papica777@gmail.com',
            pass: 'jgrcjrsmmdtlibja'
        }
    });

    try {
        await transporter.verify();
        console.log('✅ SUCCESS: SMTP working with hardcoded pass!');
    } catch (error) {
        console.error('❌ FAILED:', (error as Error).message);
    }
}

    // Complexity: O(1)
test();
