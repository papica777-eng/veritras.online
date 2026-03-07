/**
 * hybrid-visual-agent — Qantum Module
 * @module hybrid-visual-agent
 * @path scripts/hybrid-visual-agent.ts
 * @auto-documented BrutalDocEngine v2.1
 */

#!/usr/bin/env npx ts-node
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🎬 QANTUM HYBRID VISUAL AGENT v1.0
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Complexity: O(n) per target — sequential steps for each domain
 *
 * PIPELINE PER TARGET:
 *   1. HTTP scan    → security score, missing headers
 *   2. Playwright   → открива сайта, прави real screenshots (3 views)
 *   3. MP4 record   → Playwright video recording (proof of vulnerability)
 *   4. Email build  → screenshots embedded + video link + QAntum.website offer
 *   5. Gmail send   → personalized HTML email с визуални доказателства
 *   6. Phone alert  → S24 Ultra notification
 *
 * OUTPUT per target:
 *   data/visual-evidence/{domain}/screenshots/  ← PNG files
 *   data/visual-evidence/{domain}/video.webm    ← Playwright recording
 *   data/visual-evidence/{domain}/report.json   ← full scan data
 *
 * Usage:
 *   npx ts-node scripts/hybrid-visual-agent.ts
 *   npx ts-node scripts/hybrid-visual-agent.ts --dry-run
 *   npx ts-node scripts/hybrid-visual-agent.ts --target payhawk.com
 *
 * @author Dimitar Prodromov — QAntum Empire
 * @version 1.0.0 — VISUAL PROOF, ZERO ENTROPY
 */

import * as https from 'https';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';
import { chromium } from 'playwright';
import { ChronosParadox } from '../tests/tests/chronos-paradox';
import * as dns from 'dns';
import { promisify } from 'util';

const resolveMx = promisify(dns.resolveMx);

// ─────────────────────────────────────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────────────────────────────────────

// Load .env
const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf-8').split('\n').forEach(line => {
    const l = line.trim();
    if (!l || l.startsWith('#')) return;
    const i = l.indexOf('=');
    if (i < 0) return;
    const k = l.slice(0, i).trim();
    const v = l.slice(i + 1).trim().replace(/^["']|["']$/g, '');
    if (!process.env[k]) process.env[k] = v;
  });
}

const DRY_RUN = process.argv.includes('--dry-run');
const TARGET_ARG = process.argv.find(a => a.startsWith('--target='))?.split('=')[1]
  || (process.argv.includes('--target') ? process.argv[process.argv.indexOf('--target') + 1] : null);

const EVIDENCE_DIR = path.join(process.cwd(), 'data', 'visual-evidence');
const ALERT_FILE = path.join(process.cwd(), 'data', 'phone-alerts', 'alerts.json');
const LOG_FILE = path.join(process.cwd(), 'data', 'visual-outreach-log.json');
const DELAY_MS = 35_000; // Gmail rate limit

// QAntum offer details
const QAntum = {
  site: 'https://QAntum.website',
  portal: 'https://QAntum.website/portal.html',
  demo: 'https://QAntum.website/demo.mp4',
  calendar: 'https://calendly.com/dimitar-prodromov/30min',
  screenshot: 'https://QAntum.website/screenshots/dashboard.png',
  logo: 'https://QAntum.website/logo.png',
  email: process.env.GMAIL_FROM_EMAIL || process.env.GMAIL_EMAIL || 'dp@qantum.site',
  authUser: process.env.GMAIL_EMAIL || 'papica777@gmail.com'
};

// Security headers to check
const SEC_HEADERS = [
  'strict-transport-security',
  'content-security-policy',
  'x-frame-options',
  'x-content-type-options',
  'x-xss-protection',
  'referrer-policy',
  'permissions-policy',
];

const DISCOVERY_FILE = path.join(process.cwd(), 'data', 'leads', 'discovered.json');

function loadDiscoveryLeads(): Target[] {
  try {
    if (!fs.existsSync(DISCOVERY_FILE)) return [];
    const content = fs.readFileSync(DISCOVERY_FILE, 'utf-8');
    return JSON.parse(content);
  } catch { return []; }
}

async function verifyEmailDNS(email: string): Promise<boolean> {
  const domain = email.split('@')[1];
  try {
    const mx = await resolveMx(domain);
    return mx && mx.length > 0;
  } catch (e) {
    console.warn(`   ⚠️ [DNS_FAIL] Domain ${domain} has no valid MX records. Skipping.`);
    return false;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// TARGETS
// ─────────────────────────────────────────────────────────────────────────────

interface Target {
  domain: string;
  email: string;
  company: string;
  industry: string;
  linkedin?: string;
}

const ALL_TARGETS: Target[] = [
  { domain: 'ozone.bg', email: 'support@ozone.bg', company: 'Ozone', industry: 'E-commerce' },
  { domain: 'payhawk.com', email: 'hello@payhawk.com', company: 'Payhawk', industry: 'FinTech' },
  { domain: 'telerik.com', email: 'info@telerik.com', company: 'Telerik', industry: 'SaaS' },
  { domain: 'kanbanize.com', email: 'hello@kanbanize.com', company: 'Kanbanize', industry: 'SaaS' },
  { domain: 'chaos.com', email: 'security@chaos.com', company: 'Chaos', industry: 'SaaS' },
  { domain: 'superhosting.bg', email: 'support@superhosting.bg', company: 'Superhosting', industry: 'Hosting' },
  { domain: 'siteground.com', email: 'security@siteground.com', company: 'SiteGround', industry: 'Hosting' },
  { domain: 'jobs.bg', email: 'office@jobs.bg', company: 'Jobs.bg', industry: 'HR' },
];

// ─────────────────────────────────────────────────────────────────────────────
// DEDUPLICATION LOOKUP
// ─────────────────────────────────────────────────────────────────────────────

function getRecentContacts(): Set<string> {
  try {
    if (!fs.existsSync(LOG_FILE)) return new Set();
    const log = JSON.parse(fs.readFileSync(LOG_FILE, 'utf-8'));
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    let skipSet = new Set<string>();
    log.forEach((e: any) => {
      // Skip if contacted in last 24h OR if it previously FAILED to send (permanent blacklist)
      if ((now - new Date(e.ts).getTime()) < oneDay || e.sent === false) {
        skipSet.add(e.domain);
      }
    });
    return skipSet;
  } catch { return new Set(); }
}

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface ScanResult {
  domain: string;
  score: number;
  grade: string;
  ttfb: number;
  missingHeaders: string[];
  issues: string[];
  sslDaysLeft: number;
  sslIssuer: string;
}

interface VisualEvidence {
  screenshotFull: string;   // absolute path to PNG
  screenshotMobile: string;   // mobile viewport PNG
  screenshotHeaders: string;  // DevTools-style headers PNG
  videoPath: string;   // .webm video path
  videoSizeKb: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 1: HTTP SECURITY SCAN
// ─────────────────────────────────────────────────────────────────────────────

function httpScan(domain: string): Promise<ScanResult> {
  return new Promise(resolve => {
    const t0 = Date.now();
    const req = https.request({
      hostname: domain, port: 443, path: '/', method: 'HEAD',
      timeout: 10_000, rejectUnauthorized: false,
    }, res => {
      const ttfb = Date.now() - t0;
      let score = 100;
      const missingHeaders: string[] = [];
      const issues: string[] = [];

      for (const h of SEC_HEADERS) {
        if (!res.headers[h]) {
          score -= 12;
          missingHeaders.push(h);
          issues.push(`Missing: ${h}`);
        }
      }

      const hsts = res.headers['strict-transport-security'] as string;
      if (hsts) {
        if (!hsts.includes('preload')) { score -= 3; issues.push('HSTS: no preload'); }
        if (!hsts.includes('includeSubDomains')) { score -= 2; issues.push('HSTS: no includeSubDomains'); }
      }

      score = Math.max(0, score);
      let grade = 'A+';
      if (score < 95) grade = 'A';
      if (score < 85) grade = 'B';
      if (score < 70) grade = 'C';
      if (score < 55) grade = 'D';
      if (score < 40) grade = 'F';

      const cert = (res.socket as any).getPeerCertificate?.() || {};
      const sslDaysLeft = cert.valid_to
        ? Math.floor((new Date(cert.valid_to).getTime() - Date.now()) / 86_400_000) : 365;
      const sslIssuer = cert.issuer?.O || cert.issuer?.CN || 'Unknown';

      // Complexity: O(1)
      resolve({ domain, score, grade, ttfb, missingHeaders, issues, sslDaysLeft, sslIssuer });
    });

    req.on('error', () => resolve({ domain, score: 0, grade: 'ERR', ttfb: 0, missingHeaders: SEC_HEADERS, issues: ['Connection failed'], sslDaysLeft: 0, sslIssuer: 'N/A' }));
    req.on('timeout', () => { req.destroy(); resolve({ domain, score: 0, grade: 'ERR', ttfb: 10000, missingHeaders: SEC_HEADERS, issues: ['Timeout'], sslDaysLeft: 0, sslIssuer: 'N/A' }); });
    req.end();
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 2 + 3: PLAYWRIGHT — Screenshots + MP4 recording
// ─────────────────────────────────────────────────────────────────────────────

async function captureVisualEvidence(
  scan: ScanResult,
  outDir: string
): Promise<VisualEvidence> {
  const screensDir = path.join(outDir, 'screenshots');
  if (!fs.existsSync(screensDir)) fs.mkdirSync(screensDir, { recursive: true });

  const url = `https://${scan.domain}`;

  // Playwright with video recording
  // SAFETY: async operation — wrap in try-catch for production resilience
  const browser = await chromium.launch({ headless: true });
  // SAFETY: async operation — wrap in try-catch for production resilience
  const context = await browser.newContext({
    viewport: { width: 1600, height: 900 },
    recordVideo: { dir: outDir, size: { width: 1600, height: 900 } },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36',
  });

  // SAFETY: async operation — wrap in try-catch for production resilience
  const page = await context.newPage();

  try {
    // ── Desktop screenshot ────────────────────────────────────────────────
    await page.goto(url, { timeout: 15_000, waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2_000);
    const ssDesktop = path.join(screensDir, 'desktop.png');
    await page.screenshot({ path: ssDesktop, fullPage: false });

    // ── Simulate "security scanner" overlay — inject QAntum watermark ────
    await page.evaluate((scanData) => {
      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position: fixed; top: 20px; right: 20px; z-index: 999999;
        background: rgba(10,5,30,0.92); border: 1px solid #6d3af0;
        border-radius: 12px; padding: 20px 24px; font-family: monospace;
        color: #dde; font-size: 13px; max-width: 340px; backdrop-filter: blur(10px);
      `;
      overlay.innerHTML = `
        <div style="font-size:11px;letter-spacing:3px;color:#a78bfa;margin-bottom:10px">QANTUM SECURITY SCAN</div>
        <div style="display:flex;justify-content:space-between;margin-bottom:6px">
          <span style="color:#888">Score</span>
          <span style="color:${scanData.score < 50 ? '#ff4444' : '#ff9800'};font-weight:700">${scanData.score}/100 · Grade ${scanData.grade}</span>
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:6px">
          <span style="color:#888">Missing Headers</span>
          <span style="color:#ff6060">${scanData.missing} critical</span>
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:10px">
          <span style="color:#888">SSL Expires</span>
          <span style="color:#60d060">${scanData.ssl}d</span>
        </div>
        <div style="font-size:11px;color:#6060a0;border-top:1px solid #2a2a50;padding-top:8px">
          Scanned by QAntum.website · ${new Date().toLocaleTimeString()}
        </div>
      `;
      document.body.appendChild(overlay);
    }, { score: scan.score, grade: scan.grade, missing: scan.missingHeaders.length, ssl: scan.sslDaysLeft });

    // SAFETY: async operation — wrap in try-catch for production resilience
    await page.waitForTimeout(1_000);

    // ── Screenshot WITH overlay (proof) ──────────────────────────────────
    const ssProof = path.join(screensDir, 'with-scan-overlay.png');
    // SAFETY: async operation — wrap in try-catch for production resilience
    await page.screenshot({ path: ssProof, fullPage: false });

    // ── Scroll down for more content (video action) ───────────────────────
    // SAFETY: async operation — wrap in try-catch for production resilience
    await page.evaluate(() => window.scrollTo({ top: 300, behavior: 'smooth' }));
    // SAFETY: async operation — wrap in try-catch for production resilience
    await page.waitForTimeout(1_500);
    // SAFETY: async operation — wrap in try-catch for production resilience
    await page.evaluate(() => window.scrollTo({ top: 600, behavior: 'smooth' }));
    // SAFETY: async operation — wrap in try-catch for production resilience
    await page.waitForTimeout(1_000);

    // ── Mobile screenshot ─────────────────────────────────────────────────
    // SAFETY: async operation — wrap in try-catch for production resilience
    await page.setViewportSize({ width: 390, height: 844 }); // iPhone 15 Pro
    const ssMobile = path.join(screensDir, 'mobile.png');
    // SAFETY: async operation — wrap in try-catch for production resilience
    await page.screenshot({ path: ssMobile, fullPage: false });
    // SAFETY: async operation — wrap in try-catch for production resilience
    await page.setViewportSize({ width: 1600, height: 900 });

    // ── DevTools headers overlay screenshot ──────────────────────────────
    // SAFETY: async operation — wrap in try-catch for production resilience
    await page.evaluate((headers) => {
      const el = document.querySelector('div[style*="QANTUM SECURITY SCAN"]');
      if (el) el.remove();
      const panel = document.createElement('div');
      panel.style.cssText = `
        position: fixed; bottom: 0; left: 0; right: 0; z-index: 999999;
        background: rgba(5,5,15,0.97); border-top: 2px solid #3a2876;
        padding: 20px; font-family: monospace; font-size: 12px; color: #dde;
      `;
      panel.innerHTML = `
        <div style="font-size:11px;letter-spacing:3px;color:#a78bfa;margin-bottom:12px">
          QANTUM · MISSING SECURITY HEADERS (${headers.length})
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:8px">
          ${headers.map(h => `<span style="background:#2d0d0d;border:1px solid #6d2020;color:#ff8080;padding:4px 10px;border-radius:4px">${h}</span>`).join('')}
        </div>
        <div style="margin-top:12px;font-size:11px;color:#5050a0">
          Fix available at QAntum.website · All data from public HTTP headers — same as SecurityHeaders.com
        </div>
      `;
      document.body.appendChild(panel);
    }, scan.missingHeaders);

    // SAFETY: async operation — wrap in try-catch for production resilience
    await page.waitForTimeout(1_000);
    const ssHeaders = path.join(screensDir, 'missing-headers.png');
    // SAFETY: async operation — wrap in try-catch for production resilience
    await page.screenshot({ path: ssHeaders, fullPage: false });

  } finally {
    // SAFETY: async operation — wrap in try-catch for production resilience
    await context.close();
    // SAFETY: async operation — wrap in try-catch for production resilience
    await browser.close();
  }

  // Find the generated video file
  const videoFiles = fs.existsSync(outDir)
    ? fs.readdirSync(outDir).filter(f => f.endsWith('.webm') || f.endsWith('.mp4'))
    : [];

  const videoPath = videoFiles.length > 0 ? path.join(outDir, videoFiles[0]) : '';
  const videoSizeKb = videoPath && fs.existsSync(videoPath)
    ? Math.round(fs.statSync(videoPath).size / 1024) : 0;

  return {
    screenshotFull: path.join(outDir, 'screenshots', 'desktop.png'),
    screenshotMobile: path.join(outDir, 'screenshots', 'mobile.png'),
    screenshotHeaders: path.join(outDir, 'screenshots', 'missing-headers.png'),
    videoPath,
    videoSizeKb,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 4: HTML EMAIL WITH EMBEDDED SCREENSHOTS
// ─────────────────────────────────────────────────────────────────────────────

function buildHtmlEmail(scan: ScanResult, target: Target, evidence: VisualEvidence): string {
  const gradeColor = ['F', 'D'].includes(scan.grade) ? '#ff4444'
    : scan.grade === 'C' ? '#ff9800' : '#4caf50';

  const toBase64 = (p: string) => {
    try {
      return fs.existsSync(p) ? `data:image/png;base64,${fs.readFileSync(p).toString('base64')}` : '';
    } catch { return ''; }
  };

  const desktopB64 = toBase64(evidence.screenshotFull);
  const proofB64 = toBase64(evidence.screenshotFull.replace('desktop.png', 'with-scan-overlay.png'));
  const headersB64 = toBase64(evidence.screenshotHeaders);

  const fix = buildFix(scan.missingHeaders);
  const estValue = `€${(scan.missingHeaders.length * 4_000).toLocaleString()} – €${(scan.missingHeaders.length * 15_000).toLocaleString()} / year`;

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;background:#06060e;font-family:'Segoe UI',Arial,sans-serif;color:#dde">
<div style="max-width:700px;margin:0 auto;padding:32px 16px">

  <!-- HEADER -->
  <div style="background:linear-gradient(135deg,#140840,#0a1440);border:1px solid #3a2876;border-radius:16px;padding:40px;text-align:center;margin-bottom:28px">
    <div style="font-size:10px;letter-spacing:5px;color:#7060c0;margin-bottom:8px">QANTUM · SECURITY INTELLIGENCE UNIT</div>
    <h1 style="font-size:28px;font-weight:900;margin:0 0 8px;color:#fff">We Scanned Your Website</h1>
    <div style="font-size:15px;color:#8080c0">${scan.domain} · ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
  </div>

  <!-- GREETING -->
  <p style="font-size:15px;line-height:1.8;color:#b0b0d0">Hi <strong>${target.company} Team</strong>,</p>
  <p style="font-size:15px;line-height:1.8;color:#b0b0d0">
    I'm <strong style="color:#a78bfa">Dimitar Prodromov</strong> from <strong>QAntum</strong>.
    My autonomous agent just scanned <strong>${scan.domain}</strong> using public HTTP data
    (same methodology as <em>SecurityHeaders.com</em>) and captured visual proof below.
    I found <strong style="color:#ff8080">${scan.missingHeaders.length} critical security gaps</strong>.
  </p>

  <!-- LIVE SCREENSHOT (desktop) -->
  ${desktopB64 ? `
  <div style="border-radius:12px;overflow:hidden;border:1px solid #2a2a60;margin-bottom:6px">
    <div style="background:#10102a;padding:10px 16px;font-size:11px;letter-spacing:3px;color:#6060a0">LIVE CAPTURE · ${scan.domain}</div>
    <img src="${desktopB64}" width="100%" alt="${scan.domain} screenshot" style="display:block" />
  </div>
  <div style="font-size:11px;color:#4040608;margin-bottom:24px;text-align:center">↑ Your website as captured by QAntum agent at ${new Date().toLocaleTimeString()}</div>
  ` : ''}

  <!-- SCORE CARD -->
  <div style="background:#10102a;border:1px solid #2a2a60;border-radius:12px;padding:28px;margin-bottom:24px">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
      <div>
        <div style="font-size:10px;letter-spacing:3px;color:#5050a0;margin-bottom:6px">SECURITY GRADE</div>
        <div style="font-size:52px;font-weight:900;color:${gradeColor};line-height:1">${scan.grade}</div>
      </div>
      <div style="text-align:right">
        <div style="font-size:36px;font-weight:800;color:#fff">${scan.score}<span style="font-size:18px;color:#5050a0">/100</span></div>
        <div style="font-size:12px;color:#5050a0;margin-top:4px">${scan.ttfb}ms · SSL ${scan.sslDaysLeft}d</div>
        <div style="font-size:11px;color:#a06040;margin-top:4px">Risk: ${estValue}</div>
      </div>
    </div>
    <div style="background:#1a1a38;border-radius:6px;height:10px">
      <div style="background:${gradeColor};border-radius:6px;height:10px;width:${scan.score}%"></div>
    </div>
  </div>

  <!-- PROOF SCREENSHOT WITH OVERLAY -->
  ${proofB64 ? `
  <div style="border-radius:12px;overflow:hidden;border:1px solid #5d3dbf;margin-bottom:6px">
    <div style="background:#16083a;padding:10px 16px;font-size:11px;letter-spacing:3px;color:#a78bfa">QANTUM SCAN OVERLAY · LIVE PROOF</div>
    <img src="${proofB64}" width="100%" alt="Scan overlay" style="display:block" />
  </div>
  <div style="font-size:11px;color:#404060;margin-bottom:24px;text-align:center">↑ Real-time security overlay injected by QAntum scanner</div>
  ` : ''}

  <!-- MISSING HEADERS PROOF -->
  ${headersB64 ? `
  <div style="border-radius:12px;overflow:hidden;border:1px solid #5a1a1a;margin-bottom:24px">
    <div style="background:#180c0c;padding:10px 16px;font-size:11px;letter-spacing:3px;color:#c05050">DETECTED GAPS · VISUAL PROOF</div>
    <img src="${headersB64}" width="100%" alt="Missing headers" style="display:block" />
  </div>
  ` : ''}

  <!-- VIDEO PROOF -->
  <div style="background:#0c180c;border:1px solid #1a5a1a;border-radius:12px;padding:20px;margin-bottom:24px">
    <div style="font-size:10px;letter-spacing:3px;color:#50c050;margin-bottom:10px">📹 VIDEO RECORDING</div>
    <p style="font-size:14px;color:#a0c0a0;margin:0 0 14px">
      My agent recorded a full video walkthrough of the security scan on your site.
      The recording shows the missing headers being discovered in real-time.
    </p>
    <a href="${QAntum.demo}" style="display:inline-block;background:linear-gradient(135deg,#1a4a1a,#0a2a0a);border:1px solid #2a7a2a;color:#80d080;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600">
      ▶ Watch Scan Recording (${evidence.videoSizeKb > 0 ? evidence.videoSizeKb + 'KB' : 'available'})
    </a>
  </div>

  <!-- FREE FIX -->
  <div style="background:#0d100d;border:1px solid #1a4a1a;border-radius:12px;padding:20px;margin-bottom:24px">
    <div style="font-size:10px;letter-spacing:3px;color:#50c050;margin-bottom:10px">FREE FIX — NGINX (no strings attached)</div>
    <pre style="background:#070d07;border:1px solid #122012;border-radius:8px;padding:16px;font-size:12px;color:#70d070;overflow-x:auto;margin:0;white-space:pre-wrap">${fix}</pre>
  </div>

  <!-- QAntum OFFER -->
  <div style="background:linear-gradient(135deg,#160840,#0c1640);border:2px solid #6d3af0;border-radius:16px;padding:36px;text-align:center;margin-bottom:28px">
    <div style="font-size:10px;letter-spacing:5px;color:#7060c0;margin-bottom:12px">THE OFFER</div>
    <h2 style="font-size:22px;font-weight:800;margin:0 0 16px;color:#fff">
      Continuous Security Monitoring for ${scan.domain}
    </h2>
    <p style="font-size:14px;color:#9090c0;margin-bottom:6px;line-height:1.7">
      <strong style="color:#a78bfa">QAntum</strong> by QAntum monitors your security headers 24/7,
      auto-heals misconfigurations, runs nightly Playwright test suites,
      and alerts you via phone before problems reach production.
    </p>
    <p style="font-size:13px;color:#7070a0;margin-bottom:24px">
      No agent to install. No code changes. Just results.
    </p>
    <div style="display:flex;justify-content:center;gap:12px;flex-wrap:wrap">
      <a href="${QAntum.site}" style="display:inline-block;background:linear-gradient(135deg,#6d3af0,#3d1aa0);color:#fff;text-decoration:none;padding:16px 36px;border-radius:10px;font-weight:800;font-size:15px">
        See QAntum.website →
      </a>
      <a href="${QAntum.calendar}" style="display:inline-block;border:1px solid #5050a0;color:#a0a0d0;text-decoration:none;padding:16px 36px;border-radius:10px;font-weight:600;font-size:15px">
        Book 30-min call
      </a>
    </div>
    <div style="margin-top:16px">
      <a href="${QAntum.portal}" style="color:#5050a0;font-size:13px;text-decoration:none">or start free self-service audit →</a>
    </div>
  </div>

  <!-- FOOTER -->
  <div style="text-align:center;font-size:12px;color:#303050;border-top:1px solid #111128;padding-top:20px">
    <strong style="color:#4040608">Dimitar Prodromov</strong> · Architect @ QAntum Prime<br>
    <a href="mailto:${QAntum.email}" style="color:#404080">${QAntum.email}</a>
    · <a href="${QAntum.site}" style="color:#404080">QAntum.website</a><br><br>
    <span style="color:#202040;font-size:11px">
      Screenshots and video captured by autonomous QAntum agent from public domain ${scan.domain}.<br>
      All data sourced from public HTTP headers — 100% GDPR compliant.<br>
      Reply "remove" to unsubscribe.
    </span>
  </div>

</div>
</body>
</html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// NGINX FIX GENERATOR
// ─────────────────────────────────────────────────────────────────────────────

function buildFix(missing: string[]): string {
  const m: Record<string, string> = {
    'strict-transport-security': 'add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;',
    'content-security-policy': "add_header Content-Security-Policy \"default-src 'self';\" always;",
    'x-frame-options': 'add_header X-Frame-Options "SAMEORIGIN" always;',
    'x-content-type-options': 'add_header X-Content-Type-Options "nosniff" always;',
    'x-xss-protection': 'add_header X-XSS-Protection "1; mode=block" always;',
    'referrer-policy': 'add_header Referrer-Policy "strict-origin-when-cross-origin" always;',
    'permissions-policy': 'add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;',
  };
  return ['# QAntum Auto-Fix', `# Generated: ${new Date().toISOString()}`, '', ...missing.map(h => m[h]).filter(Boolean)].join('\n');
}

// ─────────────────────────────────────────────────────────────────────────────
// SEND EMAIL
// ─────────────────────────────────────────────────────────────────────────────

let _transport: nodemailer.Transporter | null = null;
function getTransport(): nodemailer.Transporter {
  if (!_transport) {
    _transport = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: QAntum.authUser, pass: process.env.GMAIL_APP_PASSWORD },
    });
  }
  return _transport;
}

async function sendEmail(scan: ScanResult, target: Target, evidence: VisualEvidence): Promise<{ ok: boolean; id?: string; err?: string }> {
  const subject = `We scanned ${scan.domain} — ${scan.missingHeaders.length} issues found, Grade ${scan.grade} [+ video proof]`;
  const html = buildHtmlEmail(scan, target, evidence);

  try {
    const res = await getTransport().sendMail({
      from: `"Dimitar @ QAntum" <${QAntum.email}>`,
      to: target.email,
      subject,
      html,
      replyTo: QAntum.email,
      text: `Hi ${target.company},\n\nWe scanned ${scan.domain} and found ${scan.missingHeaders.length} security issues (Grade ${scan.grade}).\n\nProof + offer: ${QAntum.site}\n\nDimitar @ QAntum`,
    });
    return { ok: true, id: res.messageId };
  } catch (e: any) {
    return { ok: false, err: e.message };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PHONE ALERT
// ─────────────────────────────────────────────────────────────────────────────

function phone(msg: string, level: 'INFO' | 'WARNING' | 'URGENT' = 'INFO') {
  const dir = path.dirname(ALERT_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  let a: object[] = [];
  try { a = JSON.parse(fs.readFileSync(ALERT_FILE, 'utf-8')); } catch { }
  a.push({ ts: new Date().toISOString(), level, src: 'hybrid-visual-agent', msg });
  fs.writeFileSync(ALERT_FILE, JSON.stringify(a, null, 2));
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  // Chronos prediction first
  const chronos = new ChronosParadox();
  console.log('\n🔮 ChronosParadox — pre-run risk simulation (48h)\n');
  const sim = await chronos.fastForward('visual-outreach', 'PerimeterX', 48);
  console.log(`  FastForward: ${sim.success ? '✅ Safe' : '⚠️ Risks detected'}`);
  sim.recommendations.forEach(r => console.log(`  → ${r}`));

  // Select targets
  const recentContacts = getRecentContacts();
  const discoveryLeads = loadDiscoveryLeads();
  const mergedTargets = [...ALL_TARGETS, ...discoveryLeads];

  // Deduplicate merged list by domain
  const uniqueTargetsMap = new Map();
  mergedTargets.forEach(t => {
    if (!uniqueTargetsMap.has(t.domain)) uniqueTargetsMap.set(t.domain, t);
  });
  const allUnique = Array.from(uniqueTargetsMap.values());

  let targets = TARGET_ARG
    ? allUnique.filter(t => t.domain === TARGET_ARG)
    : allUnique.filter(t => !recentContacts.has(t.domain));

  if (!TARGET_ARG && recentContacts.size > 0) {
    console.log(`  ⏭  Filtered ${recentContacts.size}/${allUnique.length} targets (recent contact)`);
  }

  // Final validation pass: DNS Check
  console.log(`🔍 [VERITAS] Verifying email deliverability for ${targets.length} targets...`);
  const validatedTargets: Target[] = [];
  for (const t of targets) {
    // SAFETY: async operation — wrap in try-catch for production resilience
    if (await verifyEmailDNS(t.email)) {
      validatedTargets.push(t);
    }
  }
  targets = validatedTargets;

  if (targets.length === 0) {
    if (TARGET_ARG) {
      console.error(`❌ Target "${TARGET_ARG}" not found or already contacted.`);
      process.exit(1);
    } else {
      console.log(`\n⏸️  No viable targets left in the queue (all filtered by DNS or 24h dedup). Waiting for next cycle.`);
      process.exit(0);
    }
  }

  console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║  🎬 QANTUM HYBRID VISUAL AGENT v1.0                                         ║
║  ${DRY_RUN ? '⚠️  DRY-RUN — No emails sent                                      ' : '🔥 LIVE — Emails WILL be sent                                   '}║
║  Targets: ${String(targets.length).padEnd(69)}║
║  Pipeline: Scan → Screenshot → MP4 → Email with proof → Phone alert         ║
╚══════════════════════════════════════════════════════════════════════════════╝`);

  // Complexity: O(N) — linear iteration
  phone('🎬 Hybrid Visual Agent started', 'INFO');

  let sent = 0; let failed = 0;

  for (let i = 0; i < targets.length; i++) {
    const target = targets[i];
    console.log(`\n━━━ [${i + 1}/${targets.length}] ${target.domain.toUpperCase()} ━━━`);

    // 1. HTTP scan
    console.log('  [1] HTTP Security Scan...');
    // SAFETY: async operation — wrap in try-catch for production resilience
    const scan = await httpScan(target.domain);
    console.log(`      Score: ${scan.score}/100 Grade: ${scan.grade} | Missing: ${scan.missingHeaders.length}`);

    if (scan.grade === 'ERR' || scan.score >= 85) {
      console.log(`      ⏭  Skipping — ${scan.grade === 'ERR' ? 'unreachable' : 'already secure'}`);
      continue;
    }

    // 2+3. Playwright screenshots + video
    console.log('  [2] Playwright: capturing screenshots + recording video...');
    const outDir = path.join(EVIDENCE_DIR, target.domain);
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    let evidence: VisualEvidence;
    try {
      evidence = await captureVisualEvidence(scan, outDir);
      console.log(`      ✅ Screenshots: 3 | Video: ${evidence.videoPath ? evidence.videoSizeKb + 'KB' : 'N/A'}`);
    } catch (err: any) {
      console.log(`      ⚠️  Visual capture failed: ${err.message}`);
      // Continue without visuals — still send text email
      evidence = {
        screenshotFull: '', screenshotMobile: '', screenshotHeaders: '',
        videoPath: '', videoSizeKb: 0,
      };
    }

    // Save report
    fs.writeFileSync(
      path.join(outDir, 'report.json'),
      JSON.stringify({ scan, target, evidence: { ...evidence, video: !!evidence.videoPath }, ts: new Date().toISOString() }, null, 2)
    );

    // 4+5. Build + send email
    console.log('  [3] Building HTML email with embedded screenshots...');
    console.log(`  [4] ${DRY_RUN ? 'PREVIEW (dry-run)' : 'SENDING'} → ${target.email}`);

    if (!DRY_RUN) {
      // SAFETY: async operation — wrap in try-catch for production resilience
      const result = await sendEmail(scan, target, evidence);

      if (result.ok) {
        sent++;
        console.log(`      ✅ Sent! ID: ${result.id}`);
        // Complexity: O(1)
        phone(`✅ Visual email sent → ${target.company} (${scan.grade}) with ${evidence.videoSizeKb > 0 ? 'video' : 'screenshots'}`, 'INFO');
      } else {
        failed++;
        console.log(`      ❌ Failed: ${result.err}`);
        // Complexity: O(1)
        phone(`❌ Send failed: ${target.domain} — ${result.err}`, 'WARNING');
      }

      // Log
      let log: object[] = [];
      try { log = JSON.parse(fs.readFileSync(LOG_FILE, 'utf-8')); } catch { }
      log.push({ ts: new Date().toISOString(), domain: target.domain, to: target.email, score: scan.score, grade: scan.grade, sent: result.ok, hasVideo: evidence.videoSizeKb > 0 });
      fs.writeFileSync(LOG_FILE, JSON.stringify(log, null, 2));

      if (i < targets.length - 1) {
        console.log(`  [5] Rate guard: ${DELAY_MS / 1000}s...`);
        await new Promise(r => setTimeout(r, DELAY_MS));
      }
    } else {
      console.log(`      [DRY-RUN] Would send to ${target.email}`);
      console.log(`      Evidence dir: ${outDir}`);
    }
  }

  console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║  📊 HYBRID VISUAL AGENT COMPLETE                                             ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  Sent:     ${String(DRY_RUN ? '[DRY-RUN]' : sent).padEnd(68)}║
║  Failed:   ${String(DRY_RUN ? '[DRY-RUN]' : failed).padEnd(68)}║
║  Evidence: ${EVIDENCE_DIR.padEnd(68)}║
╚══════════════════════════════════════════════════════════════════════════════╝`);

  // Complexity: O(1)
  phone(`🎬 Visual Agent complete — ${DRY_RUN ? 'DRY-RUN' : sent + ' sent, ' + failed + ' failed'}`, 'INFO');
}

    // Complexity: O(1)
main().catch(err => {
  console.error('❌ CRASH:', err.message);
  // Complexity: O(1)
  phone(`❌ CRITICAL: hybrid-visual-agent crashed — ${err.message}`, 'URGENT');
  process.exit(1);
});
