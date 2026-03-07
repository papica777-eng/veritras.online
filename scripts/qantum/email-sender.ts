/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 📧 QANTUM EMAIL SENDER — АВТОНОМНО ИЗПРАЩАНЕ НА ИМЕЙЛИ
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Gmail SMTP интеграция с nodemailer.
 * 
 * SETUP:
 *   1. Отиди на https://myaccount.google.com/apppasswords
 *   2. Създай App Password за "Mail" → "Windows Computer"
 *   3. Сложи го в .env файла като GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
 *   4. Или го подай директно при инициализация
 * 
 * @author Димитър Продромов
 * @version 1.0.0
 */

import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';

// ═══════════════════════════════════════════════════════════════════════════════
// INTERFACES
// ═══════════════════════════════════════════════════════════════════════════════

export interface EmailConfig {
    senderEmail: string;
    senderName: string;
    appPassword: string;      // Gmail App Password (NOT regular password)
}

export interface EmailPayload {
    to: string;               // recipient email
    toName?: string;          // recipient name
    subject: string;
    textBody: string;         // plain text version
    htmlBody?: string;        // optional HTML version
    replyTo?: string;
    attachments?: Array<{
        filename: string;
        path: string;
    }>;
}

export interface SendResult {
    success: boolean;
    messageId?: string;
    error?: string;
    timestamp: string;
    to: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// EMAIL SENDER CLASS
// ═══════════════════════════════════════════════════════════════════════════════

export class QantumEmailSender {
    private transporter: nodemailer.Transporter;
    private config: EmailConfig;
    private sendLog: SendResult[] = [];
    private logFile: string;

    // Лимити — Google Workspace = 2000/ден, delay само за естественост
    private readonly DELAY_BETWEEN_EMAILS_MS = 3000;   // 3 сек между имейлите (имитира ръчно изпращане)
    private readonly MAX_PER_HOUR = 500;               // макс 500/час
    private readonly MAX_PER_DAY = 2000;               // макс 2000/ден (Google Workspace лимит)

    constructor(config: EmailConfig) {
        this.config = config;
        this.logFile = path.join(process.cwd(), 'dashboard', 'b2b-pitches', 'email-send-log.json');

        this.transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,   // true за 465, false за 587 (STARTTLS)
            auth: {
                user: config.senderEmail,
                pass: config.appPassword,
            },
            tls: {
                rejectUnauthorized: true
            }
        });
    }

    /**
     * Верифицира SMTP връзката преди изпращане
     */
    // Complexity: O(1)
    async verify(): Promise<boolean> {
        try {
            await this.transporter.verify();
            console.log('✅ SMTP връзка верифицирана — Gmail е ready.');
            return true;
        } catch (err: any) {
            console.error('❌ SMTP верификация НЕУСПЕШНА:', err.message);
            if (err.message.includes('Invalid login')) {
                console.error('   → Провери App Password! Трябва App Password, НЕ обичайна парола.');
                console.error('   → https://myaccount.google.com/apppasswords');
            }
            return false;
        }
    }

    /**
     * Изпраща един имейл
     */
    // Complexity: O(1) — amortized
    async send(payload: EmailPayload): Promise<SendResult> {
        const result: SendResult = {
            success: false,
            timestamp: new Date().toISOString(),
            to: payload.to,
        };

        try {
            // Rate limit check
            await this.checkRateLimits();

            const mailOptions: nodemailer.SendMailOptions = {
                from: `"${this.config.senderName}" <${this.config.senderEmail}>`,
                to: payload.toName ? `"${payload.toName}" <${payload.to}>` : payload.to,
                subject: payload.subject,
                text: payload.textBody,
                replyTo: payload.replyTo || this.config.senderEmail,
            };

            if (payload.htmlBody) {
                mailOptions.html = payload.htmlBody;
            }

            if (payload.attachments && payload.attachments.length > 0) {
                mailOptions.attachments = payload.attachments;
            }

            // SAFETY: async operation — wrap in try-catch for production resilience
            const info = await this.transporter.sendMail(mailOptions);

            result.success = true;
            result.messageId = info.messageId;

            console.log(`📧 ✅ Изпратено до ${payload.to} — ID: ${info.messageId}`);
        } catch (err: any) {
            result.error = err.message;
            console.error(`📧 ❌ Грешка при изпращане до ${payload.to}: ${err.message}`);
        }

        this.sendLog.push(result);
        this.saveSendLog();
        return result;
    }

    /**
     * Изпраща batch от имейли с delay между тях
     */
    // Complexity: O(N) — linear iteration
    async sendBatch(payloads: EmailPayload[]): Promise<SendResult[]> {
        const results: SendResult[] = [];

        console.log(`\n📬 Начало на batch изпращане: ${payloads.length} имейла`);
        console.log(`   ⏱️  Delay: ${this.DELAY_BETWEEN_EMAILS_MS / 1000}s между имейли\n`);

        for (let i = 0; i < payloads.length; i++) {
            console.log(`📧 [${i + 1}/${payloads.length}] Изпращане до ${payloads[i].to}...`);

            // SAFETY: async operation — wrap in try-catch for production resilience
            const result = await this.send(payloads[i]);
            results.push(result);

            // Delay между имейли (освен за последния)
            if (i < payloads.length - 1) {
                console.log(`   ⏱️  Пауза ${this.DELAY_BETWEEN_EMAILS_MS / 1000}s...`);
                // SAFETY: async operation — wrap in try-catch for production resilience
                await this.sleep(this.DELAY_BETWEEN_EMAILS_MS);
            }
        }

        const sent = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success).length;

        console.log(`\n📬 Batch резултат: ✅ ${sent} изпратени, ❌ ${failed} грешки\n`);

        return results;
    }

    /**
     * Генерира HTML версия на pitch-а за по-добро представяне
     */
    static pitchToHtml(pitchText: string, senderName: string): string {
        // Escape HTML
        const escaped = pitchText
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { 
            font-family: 'Segoe UI', Arial, sans-serif; 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 20px;
            color: #1a1a2e;
            background: #f8f9fa;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px 24px;
            border-radius: 12px 12px 0 0;
            text-align: center;
        }
        .header h2 { margin: 0; font-size: 18px; }
        .content {
            background: white;
            padding: 24px;
            border: 1px solid #e2e8f0;
            border-top: none;
            white-space: pre-wrap;
            line-height: 1.6;
            font-size: 14px;
        }
        .footer {
            background: #f1f5f9;
            padding: 16px 24px;
            border: 1px solid #e2e8f0;
            border-top: none;
            border-radius: 0 0 12px 12px;
            font-size: 12px;
            color: #64748b;
            text-align: center;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white !important;
            padding: 12px 24px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: bold;
            margin: 16px 0;
        }
    </style>
</head>
<body>
    <div class="header">
        <h2>🚀 QAntum Prime · AI-Powered Business Intelligence</h2>
    </div>
    <div class="content">${escaped}
        <div style="text-align:center;margin:24px 0 8px;">
            <a href="https://QAntum.website" class="cta-button">🔍 See Plans & Start Free Trial →</a>
        </div>
    </div>
    <div class="footer">
        <p>${senderName} · QAntum Prime · <a href="https://QAntum.website" style="color:#667eea;text-decoration:none;">QAntum.website</a></p>
        <p style="margin-top:4px;">AI-Powered Security, Performance & SEO Scanning</p>
    </div>
</body>
</html>`;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // PRIVATE
    // ═══════════════════════════════════════════════════════════════════════════

    // Complexity: O(N) — linear iteration
    private async checkRateLimits(): Promise<void> {
        const now = Date.now();
        const oneHourAgo = now - 3600000;
        const oneDayAgo = now - 86400000;

        const recentHour = this.sendLog.filter(
            r => r.success && new Date(r.timestamp).getTime() > oneHourAgo
        ).length;

        const recentDay = this.sendLog.filter(
            r => r.success && new Date(r.timestamp).getTime() > oneDayAgo
        ).length;

        if (recentHour >= this.MAX_PER_HOUR) {
            const waitMinutes = Math.ceil((3600000 - (now - new Date(this.sendLog[this.sendLog.length - this.MAX_PER_HOUR].timestamp).getTime())) / 60000);
            throw new Error(`⚠️ Rate limit: ${this.MAX_PER_HOUR}/час достигнат. Изчакай ${waitMinutes} мин.`);
        }

        if (recentDay >= this.MAX_PER_DAY) {
            throw new Error(`⚠️ Rate limit: ${this.MAX_PER_DAY}/ден достигнат. Опитай утре.`);
        }
    }

    // Complexity: O(1)
    private saveSendLog(): void {
        try {
            const dir = path.dirname(this.logFile);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(this.logFile, JSON.stringify(this.sendLog, null, 2));
        } catch (e) {
            // silent
        }
    }

    // Complexity: O(1)
    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // PHONE NOTIFICATIONS
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Notifies the Sovereign Architect on their personal device (e.g. Samsung S24 Ultra).
     * This is used for urgent alerts like responses from prospective clients or security events.
     */
    // Complexity: O(1) — hash/map lookup
    async notifyPhone(message: string, priority: 'URGENT' | 'LOW' = 'URGENT') {
        console.log(`📱 [PHONE_ALERT] Dispatching to Samsung S24 Ultra: ${message}`);

        // In a real scenario, this would use Pushover, IFTTT or a custom bridge app.
        // For now, we use a simulation log which the QAntum Android app will poll.
        const logPath = path.join(process.cwd(), 'data', 'alerts', 'phone_notifications.json');
        const dir = path.dirname(logPath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

        const existing = fs.existsSync(logPath) ? JSON.parse(fs.readFileSync(logPath, 'utf8')) : [];

        existing.push({
            timestamp: new Date().toISOString(),
            message,
            priority,
            status: 'PENDING_SYNC'
        });

        fs.writeFileSync(logPath, JSON.stringify(existing, null, 2));

        // Also send an urgent internal email if needed
        if (priority === 'URGENT') {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.sendDirect({
                to: process.env.ARCHITECT_EMAIL || 'founder@qantum.empire',
                subject: `🚨 [URGENT ALERT] QAntum Notification`,
                text: message
            });
        }
    }

    /**
     * Internal sender without rate limiting for critical alerts.
     */
    // Complexity: O(1) — hash/map lookup
    private async sendDirect(options: any) {
        try {
            const transporter = (this as any).createTransporter();
            await transporter.sendMail(options);
        } catch (e) {
            console.error(`❌ [DIRECT_EMAIL_FAIL]: ${e}`);
        }
    }
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * QANTUM EMAIL MONITOR - The Inbox Intelligence Layer
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Monitors specifically for REPLIES to our agentic messages.
 */
export class QantumEmailMonitor {
    private static instance: QantumEmailMonitor;
    private isRunning: boolean = false;
    private readonly RECIPIENT_HISTORY = path.join(process.cwd(), 'data', 'outreach', 'recipients.json');

    private constructor() { }

    static getInstance(): QantumEmailMonitor {
        if (!QantumEmailMonitor.instance) {
            QantumEmailMonitor.instance = new QantumEmailMonitor();
        }
        return QantumEmailMonitor.instance;
    }

    /**
     * Starts the monitoring loop. 
     * Conceptually this would use IMAP polling or Webhooks.
     */
    // Complexity: O(1) — hash/map lookup
    async startMonitoring() {
        if (this.isRunning) return;
        this.isRunning = true;
        console.log('👀 [MONITOR] Inbox monitoring active. Detecting replies from targeted leads...');

        // Polling simulation every 5 minutes
        // Complexity: O(1)
        setInterval(async () => {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.checkForReplies();
        }, 5 * 60 * 1000);
    }

    // Complexity: O(N*M) — nested iteration detected
    private async checkForReplies() {
        // 🔍 [MONITOR] Inbox Intelligence Layer
        // This method scans the outreach history and cross-references it with new inbound messages.
        console.log('🔍 [MONITOR] Scanning for new inbound messages from targeted leads...');

        try {
            if (!fs.existsSync(this.RECIPIENT_HISTORY)) {
                console.log('⚠️ [MONITOR] No outreach history found at recipients.json. Skipping scan.');
                return;
            }

            const history = JSON.parse(fs.readFileSync(this.RECIPIENT_HISTORY, 'utf8'));
            const targetEmails = history.map((h: any) => h.email.toLowerCase());

            // Simulation of IMAP fetch (In production, replace with imap-simple or similar)
            // We check a designated 'replies' folder where automated agents drop identified responses.
            const repliesDir = path.join(process.cwd(), 'data', 'outreach', 'replies');
            if (fs.existsSync(repliesDir)) {
                const newReplies = fs.readdirSync(repliesDir).filter(f => f.endsWith('.json'));

                for (const replyFile of newReplies) {
                    const replyPath = path.join(repliesDir, replyFile);
                    const replyData = JSON.parse(fs.readFileSync(replyPath, 'utf8'));

                    if (targetEmails.includes(replyData.from.toLowerCase())) {
                        console.log(`🎯 [MONITOR] SUCCESS: Detected reply from lead: ${replyData.from}`);

                        // Notify the Architect on their phone
                        const sender = new QantumEmailSender({
                            senderEmail: process.env.SMTP_USER || 'placeholder@qantum.dev',
                            senderName: 'QAntum Pulse',
                            appPassword: process.env.SMTP_PASS || ''
                        });

                        // SAFETY: async operation — wrap in try-catch for production resilience
                        await sender.notifyPhone(
                            `📧 Target Reply! ${replyData.from} responded to the QAntum Audit. Subject: ${replyData.subject}`,
                            'URGENT'
                        );

                        // Move to 'processed'
                        const processedDir = path.join(repliesDir, 'processed');
                        if (!fs.existsSync(processedDir)) fs.mkdirSync(processedDir, { recursive: true });
                        fs.renameSync(replyPath, path.join(processedDir, replyFile));
                    }
                }
            }
        } catch (error) {
            console.error('❌ [MONITOR_ERROR]:', error);
        }
    }
}

export default QantumEmailSender;
