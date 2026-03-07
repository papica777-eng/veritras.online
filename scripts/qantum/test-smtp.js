/**
 * Бърз SMTP тест — верифицира Gmail връзката
 */
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Зареди .env
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
    fs.readFileSync(envPath, 'utf-8').split('\n').forEach(line => {
        const [key, ...vals] = line.split('=');
        if (key && vals.length && !key.startsWith('#')) {
            process.env[key.trim()] = vals.join('=').trim();
        }
    });
}

async function testSmtp() {
    const email = process.env.GMAIL_EMAIL || 'papica777@gmail.com';
    const pass = process.env.GMAIL_APP_PASSWORD || '';
    
    console.log(`📧 Тест SMTP: ${email}`);
    console.log(`🔑 Парола: ${'*'.repeat(pass.length)} (${pass.length} символа)`);

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: { user: email, pass: pass },
    });

    try {
        await transporter.verify();
        console.log('✅ SMTP ВЕРИФИЦИРАН — връзката работи!');
        
        // Изпрати тестов имейл до себе си
        const info = await transporter.sendMail({
            from: `"QAntum Prime" <${email}>`,
            to: email,
            subject: '🚀 QAntum Prime — SMTP тест успешен!',
            text: 'Автономното изпращане на имейли работи.\n\n— QAntum Prime · QAntum_LOGOS',
            html: '<h2>🚀 QAntum Prime</h2><p>Автономното изпращане на имейли <b>работи</b>.</p><p>— QAntum Prime · QAntum_LOGOS</p>',
        });
        
        console.log(`📨 Тестов имейл изпратен! ID: ${info.messageId}`);
        console.log(`   Провери inbox-а на ${email}`);
    } catch (err) {
        console.error('❌ SMTP грешка:', err.message);
        if (err.message.includes('Invalid login') || err.message.includes('Username and Password not accepted')) {
            console.error('\n⚠️  Тази парола НЕ работи за Gmail SMTP.');
            console.error('   Gmail изисква App Password, не обичайна парола.');
            console.error('   1. Влез в https://myaccount.google.com/security');
            console.error('   2. Включи 2-Step Verification');
            console.error('   3. Отиди на https://myaccount.google.com/apppasswords');
            console.error('   4. Създай App Password → сложи го в .env');
        }
    }
}

    // Complexity: O(1)
testSmtp();
