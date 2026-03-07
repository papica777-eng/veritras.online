/**
 * autonomous-lead-discovery — Qantum Module
 * @module autonomous-lead-discovery
 * @path scripts/autonomous-lead-discovery.ts
 * @auto-documented BrutalDocEngine v2.1
 */

import fs from 'fs';
import path from 'path';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { chromium } from 'playwright';

// Complexity: O(n * m) where n is search results and m is pages crawled
// Description: Autonomous Lead Discovery Engine for QAntum PRIME.

const QUEUE_PATH = path.join(process.cwd(), 'data', 'leads', 'discovery_queue.json');
const DISCOVERED_PATH = path.join(process.cwd(), 'data', 'leads', 'discovered.json');

async function searchForLeads(): Promise<string[]> {
    try {
        if (!fs.existsSync(QUEUE_PATH)) return [];
        const queue: string[] = JSON.parse(fs.readFileSync(QUEUE_PATH, 'utf-8'));

        // Take first 5 domains for this cycle
        const batch = queue.splice(0, 5);

        // Save remaining queue
        fs.writeFileSync(QUEUE_PATH, JSON.stringify(queue, null, 2));

        console.log(`🔍 [DISCOVERY] Processing batch of ${batch.length} domains...`);
        return batch.map(d => d.startsWith('http') ? d : `https://${d}`);
    } catch (e) {
        console.error(`   ❌ Failed to read discovery queue: ${e}`);
        return [];
    }
}

async function extractEmailFromUrl(url: string): Promise<string | null> {
    try {
        console.log(`   🌐 Crawling ${url} for contact info...`);
        const browser = await chromium.launch({ headless: true });
        const context = await browser.newContext();
        const page = await context.newPage();

        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        const content = await page.content();

        // Regex for email
        const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;
        let matches = content.match(emailRegex) || [];

        // Filter out junk
        let validEmails = matches.filter(e => {
            const lc = e.toLowerCase();
            return !lc.includes('sentry') &&
                !lc.includes('example') &&
                !lc.includes('company.com') &&
                !lc.includes('wixpress.com') &&
                !lc.startsWith('name@') &&
                !lc.startsWith('email@') &&
                !lc.startsWith('your@') &&
                !lc.endsWith('.png') &&
                !lc.endsWith('.jpg') &&
                !lc.endsWith('.gif') &&
                !lc.endsWith('.svg');
        });

        // Try /contact page if nothing found on home
        if (validEmails.length === 0) {
            try {
                const contactUrl = url.endsWith('/') ? url + 'contact' : url + '/contact';
                await page.goto(contactUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
                const contactContent = await page.content();
                const contactMatches = contactContent.match(emailRegex) || [];
                validEmails = [...validEmails, ...contactMatches];
            } catch (e) { }
        }

        // SAFETY: async operation — wrap in try-catch for production resilience
        await browser.close();

        if (validEmails.length > 0) {
            // Prefer office@, hello@, support@
            const preferred = validEmails.find(e =>
                e.startsWith('office@') || e.startsWith('hello@') || e.startsWith('info@') || e.startsWith('hi@')
            );
            return preferred || validEmails[0];
        }
    } catch (error) {
        console.error(`   ❌ Failed to crawl ${url}: ${error}`);
    }
    return null;
}

const OUTREACH_LOG = path.join(process.cwd(), 'data', 'visual-outreach-log.json');

async function main() {
    // SAFETY: async operation — wrap in try-catch for production resilience
    const urls = await searchForLeads();
    const newDiscovered: any[] = [];

    // Load existing
    let existingLeads: any[] = [];
    if (fs.existsSync(DISCOVERED_PATH)) {
        try { existingLeads = JSON.parse(fs.readFileSync(DISCOVERED_PATH, 'utf-8')); } catch (e) { }
    }

    // Load outreach log for master deduplication
    let alreadyContacted: Set<string> = new Set();
    if (fs.existsSync(OUTREACH_LOG)) {
        try {
            const log = JSON.parse(fs.readFileSync(OUTREACH_LOG, 'utf-8'));
            log.forEach((e: any) => alreadyContacted.add(e.domain));
        } catch (e) { }
    }

    const currentKnown = new Set([
        ...existingLeads.map(l => l.domain),
        ...alreadyContacted
    ]);

    if (!fs.existsSync(path.dirname(DISCOVERED_PATH))) {
        fs.mkdirSync(path.dirname(DISCOVERED_PATH), { recursive: true });
    }

    for (const url of urls) {
        const domain = new URL(url).hostname.replace('www.', '');

        if (currentKnown.has(domain)) {
            console.log(`   ⏭  Skipping ${domain}: Already known.`);
            continue;
        }

        // SAFETY: async operation — wrap in try-catch for production resilience
        const email = await extractEmailFromUrl(url);

        if (email) {
            console.log(`   ✅ Found: ${domain} -> ${email}`);
            newDiscovered.push({
                domain,
                email: email.toLowerCase(),
                company: domain.split('.')[0].toUpperCase(),
                ts: new Date().toISOString()
            });
        }
    }

    const finalLeads = [...existingLeads, ...newDiscovered];
    fs.writeFileSync(DISCOVERED_PATH, JSON.stringify(finalLeads, null, 2));
    console.log(`\n💎 [SUCCESS] Discovery complete. Added ${newDiscovered.length} new leads. Total Queue: ${finalLeads.length}`);
}

main();
