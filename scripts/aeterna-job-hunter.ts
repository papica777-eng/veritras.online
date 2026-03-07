/**
 * aeterna-job-hunter — Qantum Module
 * @module aeterna-job-hunter
 * @path scripts/aeterna-job-hunter.ts
 * @auto-documented BrutalDocEngine v2.1
 */

import * as fs from 'fs';
import * as path from 'path';
import * as cheerio from 'cheerio';
import axios from 'axios';

// ═══════════════════════════════════════════════════════════════════════════════
// 🏹 AETERNA LOGOS: JOB HUNTER VORTEX
// ═══════════════════════════════════════════════════════════════════════════════

const TARGET_ROLES = [
    { query: 'Playwright', category: 'quality-assurance', url: 'https://dev.bg/company/jobs/quality-assurance/?_job_keyword=playwright' },
    { query: 'SDET', category: 'quality-assurance', url: 'https://dev.bg/company/jobs/quality-assurance/?_job_keyword=SDET' },
    { query: 'Rust', category: 'backend', url: 'https://dev.bg/company/jobs/rust/' },
    { query: 'Cybersecurity', category: 'security', url: 'https://dev.bg/company/jobs/it-security/' },
    { query: 'SaaS Platform', category: 'architecture', url: 'https://dev.bg/company/jobs/software-architecture/' }
];

async function huntDevBg() {
    console.log('\n/// INITIATING AETERNA JOB HUNTER LOGOS ///');
    console.log(`📡 Architect: DIMITAR PRODROMOV`);
    console.log(`🌐 Target: DEV.BG (Bulgarian IT Market)`);
    console.log(`🎯 Profile Match: QA Automation, Playwright, Rust, Security, SaaS\n`);

    const results: any[] = [];
    let totalFound = 0;

    for (const role of TARGET_ROLES) {
        console.log(`[VORTEX PING] Scanning for: ${role.query}...`);
        try {
            const response = await axios.get(role.url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
                },
                timeout: 10000
            });

            const $ = cheerio.load(response.data);

            // On DEV.BG, jobs are typically inside a wrapper
            const jobCards = $('.job-list-item');

            const localResults: any[] = [];

            jobCards.each((i, el) => {
                const title = $(el).find('h6.job-title').text().trim() || $(el).find('.job-title').text().trim();
                const company = $(el).find('.company-name').text().trim() || $(el).find('.company-title').text().trim();
                let techStack: string[] = [];
                $(el).find('.tech-stack-element').each((j, stackEl) => {
                    techStack.push($(stackEl).text().trim());
                });

                const link = $(el).find('a.overlay-link').attr('href') || $(el).find('a').attr('href');

                if (title) {
                    localResults.push({
                        title: title.replace(/\n/g, '').replace(/\s{2,}/g, ' '),
                        company: company.replace(/\n/g, '').replace(/\s{2,}/g, ' '),
                        techStack,
                        link,
                        matchSource: role.query
                    });
                }
            });

            if (localResults.length > 0) {
                console.log(`   ✅ Found ${localResults.length} open positions.`);
                results.push(...localResults);
                totalFound += localResults.length;
            } else {
                console.log(`   ❌ 0 results found directly. The page might be protected or no matches today.`);
            }

        } catch (error) {
            console.log(`   ⚠️ Blocked or failed to connect for ${role.query}:`, (error as Error).message);
        }
    }

    console.log(`\n/// SCAN COMPLETE ///`);
    console.log(`🔹 Total matches aggregated: ${totalFound}`);

    const outputPath = path.join(process.cwd(), 'data', 'job-leads.json');
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });

    // Deduplicate
    const unique = Array.from(new Map(results.map(item => [item.link, item])).values());

    fs.writeFileSync(outputPath, JSON.stringify(unique, null, 2));

    console.log(`\n╔═══════════════════════════════════════════════════════════════════════╗`);
    console.log(`║ 📊 TOP HOT MATCHES FOR DIMITAR PRODROMOV                              ║`);
    console.log(`╠═══════════════════════════════════════════════════════════════════════╣`);

    unique.slice(0, 10).forEach((job, index) => {
        console.log(`║ [${index + 1}] ${job.company.padEnd(25)} │ ${job.title.substring(0, 35).padEnd(35)} ║`);
    });
    console.log(`╚═══════════════════════════════════════════════════════════════════════╝`);

    console.log(`\nData saved to: data/job-leads.json`);
    console.log(`Status: STEEL (Zero Entropy Enforced)`);
}

    // Complexity: O(1)
huntDevBg();
