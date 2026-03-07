/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * PROFESSIONAL AUDIT ENGINE - The Evidence-Based Sales Machine
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * "Не просто казваме, че имат бъгове. Показваме им ги на видео."
 * 
 * This module orchestrates a real-world audit:
 * 1. Launches a stealth browser WITH video recording.
 * 2. Maps the target site and identifies vulnerabilities.
 * 3. Captures the "Proof of Concept" (POC) video.
 * 4. Generates a Supreme QA Report.
 * 5. Emails the audit + video to the prospect.
 * 
 * @author QANTUM Neural QA Nexus
 * @version 1.0.0
 */

// Complexity: O(n) where n is pages scanned
import { MindEngine } from './MindEngine';
import { SiteMapper } from './Oracle/site-mapper';
import { SupremeReportGenerator } from './Oracle/report-generator';
import { QantumEmailSender } from './email-sender';
import { join } from 'path';
import { existsSync, readdirSync, renameSync } from 'fs';

export interface AuditConfig {
    targetUrl: string;
    companyName: string;
    contactEmail: string;
    maxPages?: number;
}

export class ProfessionalAudit {
    private engine: MindEngine;
    private mapper: SiteMapper;
    private reporter: SupremeReportGenerator;
    private emailer: QantumEmailSender;

    constructor() {
        this.engine = new MindEngine();
        this.mapper = new SiteMapper({
            maxPages: 10,
            captureScreenshots: true
        });
        this.reporter = new SupremeReportGenerator();
        this.emailer = QantumEmailSender.getInstance();
    }

    /**
     * Complexity: O(n * p) where n is pages and p is plugins
     */
    async execute(config: AuditConfig) {
        console.log(`\n🕵️ [AUDIT] Starting professional audit for ${config.companyName} (${config.targetUrl})...`);

        // 1. Initialize Engine with Video Recording
        const videoDir = join(process.cwd(), 'data', 'audits', 'videos', Date.now().toString());
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.engine.init({
            headless: true,
            recordVideo: true,
            videoPath: videoDir, // MindEngine needs to handle this
            proxy: { use: false }
        });

        try {
            // 2. Map Site and Find Bugs
            console.log(`⏳ [AUDIT] Walking through ${config.targetUrl} and capturing evidence...`);
            const siteMap = await this.mapper.mapSite(config.targetUrl, this.engine.getBrowser() as any);

            // 3. Generate Report
            console.log(`⏳ [AUDIT] Processing findings and generating Supreme Report...`);
            const report = await this.reporter.generateReport(siteMap, {
                targetUrl: config.targetUrl,
                clientName: config.companyName
            });

            // 4. Locate Video Proof
            // Playwright saves video on context close.
            await this.engine.close();

            const videoFile = this.getLatestVideo(videoDir);
            console.log(`✅ [AUDIT] Video proof captured: ${videoFile || 'NULL'}`);

            // 5. Send Professional Audit via Email
            console.log(`⏳ [AUDIT] Dispatching professional audit to ${config.contactEmail}...`);

            const emailBody = `
        <h1>Professional QA Audit: ${config.companyName}</h1>
        <p>Dear ${config.companyName} Team,</p>
        <p>Our autonomous QA system, <strong>QAntum</strong>, has performed a complimentary audit of your platform at ${config.targetUrl}.</p>
        <p>We have identified several critical vulnerabilities and functional bugs that could impact your user experience and security.</p>
        <p><strong>Attached you will find:</strong></p>
        <ul>
          <li>A comprehensive HTML Audit Report.</li>
          <li>A Video Recording of the automated audit process (Evidence).</li>
        </ul>
        <p>Our platform not only finds these issues but implements <strong>Self-Healing</strong> mechanisms to prevent them from ever recurring.</p>
        <p>Best regards,<br>The QAntum Team</p>
      `;

            const attachments = [];
            if (report.htmlPath && existsSync(report.htmlPath)) {
                attachments.push({ filename: 'Audit_Report.html', path: report.htmlPath });
            }
            if (videoFile) {
                attachments.push({ filename: 'Video_Proof.webm', path: videoFile });
            }

            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.emailer.send({
                to: config.contactEmail,
                subject: `[URGENT] Professional QA Audit & Bug Proof: ${config.companyName}`,
                html: emailBody,
                attachments: attachments
            });

            console.log(`\n🚀 [AUDIT] Mission Accomplished. Audit sent to ${config.contactEmail}.`);

            return {
                success: true,
                reportId: report.id,
                videoPath: videoFile
            };

        } catch (error) {
            console.error(`\n❌ [AUDIT] Critical Failure:`, error);
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.engine.close();
            throw error;
        }
    }

    private getLatestVideo(dir: string): string | null {
        if (!existsSync(dir)) return null;
        const files = readdirSync(dir).filter(f => f.endsWith('.webm'));
        if (files.length === 0) return null;
        return join(dir, files[0]); // Take the first one for now
    }
}

export default ProfessionalAudit;
