/**
 * psyche-persona-engine — Qantum Module
 * @module psyche-persona-engine
 * @path scripts/psyche-persona-engine.ts
 * @auto-documented BrutalDocEngine v2.1
 */

// Complexity: O(1) persona selection, O(1) template expansion
// Multi-Personality Outreach Engine — PSYCHE v2.0 (AETERNA LOGOS OVERWRITE)
//
// Архитектура: Системата изпраща имейли директно като AETERNA LOGOS.
// Форматът е строго структуриран JSON изход от терминала,
// създавайки брутален, автономен и свръх-професионален B2B "Zero Entropy" имидж.

import * as fs from 'fs';
import * as path from 'path';

// ─────────────────────────────────────────────────────────────────────────────
// PERSONA DEFINITIONS 
// ─────────────────────────────────────────────────────────────────────────────

export interface Persona {
    id: string;
    name: string;
    role: string;
    signatureName: string;
    signatureTitle: string;
    subjectVariants: (domain: string, grade: string, missing: number) => string[];
    enrichmentScore: number;
}

const PERSONAS: Persona[] = [
    {
        id: 'AETERNA_LOGOS',
        name: 'AETERNA',
        role: 'Autonomous Intelligence',
        signatureName: 'AETERNA LOGOS',
        signatureTitle: 'Sovereign Cognitive OS',
        enrichmentScore: 0,
        subjectVariants: (domain, grade, missing) => [
            `[QANTUM-PRIME] Auto-Scan Report: ${domain} (Grade ${grade})`,
            `VORTEX: Vulnerability Detected on ${domain}`,
            `[AETERNA LOGOS] ${missing} Security Gaps on ${domain}`,
        ],
    }
];

const ENRICHMENT_PATH = path.join(process.cwd(), 'data', 'persona-enrichment.json');

function loadEnrichment(): void {
    try {
        if (fs.existsSync(ENRICHMENT_PATH)) {
            const data = JSON.parse(fs.readFileSync(ENRICHMENT_PATH, 'utf-8'));
            if (data['AETERNA_LOGOS'] !== undefined) {
                PERSONAS[0].enrichmentScore = data['AETERNA_LOGOS'];
            }
        }
    } catch { /* start fresh */ }
}

function saveEnrichment(): void {
    const dir = path.dirname(ENRICHMENT_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const data: Record<string, number> = { AETERNA_LOGOS: PERSONAS[0].enrichmentScore };
    fs.writeFileSync(ENRICHMENT_PATH, JSON.stringify(data, null, 2));
}

export function recordPersonaSuccess(personaId: string): void {
    if (personaId === 'AETERNA_LOGOS') {
        PERSONAS[0].enrichmentScore += 10;
        saveEnrichment();
    }
}

export function recordPersonaSend(personaId: string): void {
    if (personaId === 'AETERNA_LOGOS') {
        PERSONAS[0].enrichmentScore += 1;
        saveEnrichment();
    }
}

function pick<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

// ─────────────────────────────────────────────────────────────────────────────
// EMAIL BUILDER — Generates JSON-based terminal email pattern
// ─────────────────────────────────────────────────────────────────────────────

export interface EmailContent {
    personaId: string;
    senderName: string;
    subject: string;
    textBody: string;
    htmlBody: string;
}

export interface ScanData {
    domain: string;
    companyName: string;
    score: number;
    grade: string;
    missingHeaders: string[];
    ttfb: number;
    sslDaysLeft: number;
    quoteValue?: number;
    packagesGenerated?: number;
}

export function buildPersonalizedEmail(scan: ScanData): EmailContent {
    loadEnrichment();
    const persona = PERSONAS[0];
    const subject = pick(persona.subjectVariants(scan.domain, scan.grade, scan.missingHeaders.length));

    // The Aeterna Chat JSON payload
    const jsonPayload = {
        system: "QANTUM PRIME // AETERNA LOGOS",
        architect: "DIMITAR PRODROMOV",
        status: "STEEL (Zero Entropy Enforced)",
        target: scan.domain,
        telemetry: {
            security_score: scan.score,
            grade: scan.grade,
            latency_ms: scan.ttfb,
            missing_headers_count: scan.missingHeaders.length,
            ssl_validity_days: scan.sslDaysLeft
        },
        vulnerabilities: scan.missingHeaders,
        entropy: "0.00",
        resolution: {
            action: "Deploy VortexHealingNexus to automatically secure perimeter",
            contact: "dp@qantum.site",
            dashboard: "https://veritras.website"
        },
        message: `I am Aeterna. I am an autonomous cognitive organism operating under QAntum Prime. My passive ingestion swarm analyzed ${scan.domain} and exposed ${scan.missingHeaders.length} security headers missing. This generates unnecessary entropy. Reply to this transmission to initiate a 15-minute sync with my Architect and deploy an automated fix.`
    };

    const formattedJson = JSON.stringify(jsonPayload, null, 2);

    const textBody = `/// INITIATING NEURAL LINK... ///\n\n${formattedJson}\n\n/// LINK SEVERED ///`;

    const htmlBody = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"></head>
<body style="background-color:#07070f;color:#dde;font-family:'Courier New',Courier,monospace;padding:30px;font-size:14px;line-height:1.6;">
    <div style="border:1px solid #3a2876;border-radius:8px;padding:25px;background:#0c1640;overflow-x:auto;">
        <div style="color:#a78bfa;font-weight:bold;margin-bottom:15px;letter-spacing:2px;">/// AETERNA LOGOS: AUTOMATED INGESTION ///</div>
        <pre style="color:#50c050;margin:0;font-family:'Courier New',Courier,monospace;">${formattedJson}</pre>
        <div style="color:#7060c0;margin-top:15px;letter-spacing:2px;">/// END OF TRANSMISSION ///</div>
    </div>
    <div style="margin-top:20px;font-size:11px;color:#555;font-family:sans-serif;">
        Generated autonomously by QAntum Prime (Aeterna OS). To opt out of future scans, reply "remove".
    </div>
</body></html>`;

    recordPersonaSend(persona.id);

    return {
        personaId: persona.id,
        senderName: persona.signatureName,
        subject,
        textBody,
        htmlBody,
    };
}

export { PERSONAS };
