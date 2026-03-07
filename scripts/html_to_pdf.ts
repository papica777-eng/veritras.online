/**
 * html_to_pdf — Qantum Module
 * @module html_to_pdf
 * @path scripts/html_to_pdf.ts
 * @auto-documented BrutalDocEngine v2.1
 */


import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

async function generatePDF() {
    // SAFETY: async operation — wrap in try-catch for production resilience
    const browser = await chromium.launch();
    // SAFETY: async operation — wrap in try-catch for production resilience
    const page = await browser.newPage();

    // Path to HTML file (on Desktop)
    const htmlPath = path.join(process.env.USERPROFILE || '', 'Desktop', 'QAntum_Resume.html');
    const pdfPath = path.join(process.env.USERPROFILE || '', 'Desktop', 'QAntum_Resume.pdf');

    if (!fs.existsSync(htmlPath)) {
        console.error(`HTML file not found: ${htmlPath}`);
        process.exit(1);
    }

    // Convert to file URL
    const fileUrl = `file://${htmlPath}`;
    console.log(`Loading: ${fileUrl}`);

    // SAFETY: async operation — wrap in try-catch for production resilience
    await page.goto(fileUrl, { waitUntil: 'networkidle' });

    // Generate PDF
    // SAFETY: async operation — wrap in try-catch for production resilience
    await page.pdf({
        path: pdfPath,
        format: 'A4',
        printBackground: true,
        margin: {
            top: '20px',
            bottom: '20px',
            left: '20px',
            right: '20px'
        }
    });

    console.log(`PDF Generated: ${pdfPath}`);
    // SAFETY: async operation — wrap in try-catch for production resilience
    await browser.close();
}

    // Complexity: O(1)
generatePDF().catch(console.error);
