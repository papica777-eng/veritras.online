"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * TRUST NETWORK - The Reputation Economy Engine
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * "Когато притежаваш стандарта за доверие, ти притежаваш пазара."
 *
 * The Trust Network creates a self-reinforcing ecosystem where:
 * 1. Companies WANT to be verified (prestige)
 * 2. Being unverified looks suspicious (FOMO)
 * 3. Badges drive organic traffic (marketing)
 * 4. Verification requires QAntum (lock-in)
 *
 * @author Димитър Продромов / Mister Mind
 * @copyright 2026 QAntum Empire. All Rights Reserved.
 * @version 33.1.0 - THE ETHICAL PREDATOR
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrustNetwork = void 0;
const events_1 = require("events");
const fs_1 = require("fs");
const path_1 = require("path");
const crypto = __importStar(require("crypto"));
const PublicScanner_1 = require("./PublicScanner");
// ═══════════════════════════════════════════════════════════════════════════════
// TRUST NETWORK
// ═══════════════════════════════════════════════════════════════════════════════
class TrustNetwork extends events_1.EventEmitter {
    static instance;
    // Trust level thresholds
    static THRESHOLDS = {
        SUPREME: 95,
        VERIFIED: 80,
        STANDARD: 60,
        PENDING: 0,
    };
    // Modules
    scanner = PublicScanner_1.PublicScanner.getInstance();
    // State
    seals = new Map();
    // Paths
    DATA_PATH = (0, path_1.join)(process.cwd(), 'data', 'trust-network');
    SEALS_FILE;
    BADGES_PATH;
    constructor() {
        super();
        this.SEALS_FILE = (0, path_1.join)(this.DATA_PATH, 'seals.json');
        this.BADGES_PATH = (0, path_1.join)(this.DATA_PATH, 'badges');
        this.ensureDirectories();
        this.loadSeals();
        console.log(`
🛡️ ═══════════════════════════════════════════════════════════════════════════════
   TRUST NETWORK v33.1 - THE REPUTATION ECONOMY
   ─────────────────────────────────────────────────────────────────────────────
   Active Seals: ${this.seals.size}
   "Verified by QAntum" - The new gold standard.
═══════════════════════════════════════════════════════════════════════════════
    `);
    }
    static getInstance() {
        if (!TrustNetwork.instance) {
            TrustNetwork.instance = new TrustNetwork();
        }
        return TrustNetwork.instance;
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // SEAL MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Generate a trust seal for a client.
     * Requires a passing score from PublicScanner.
     */
    async generateSeal(clientId, domain, config = {}) {
        console.log(`\n🛡️ [TRUST] Generating seal for ${domain}...`);
        // Perform verification scan
        const scanResult = await this.scanner.scan(`https://${domain}`);
        // Determine trust level
        const level = config.level || this.calculateLevel(scanResult.overallScore);
        if (level === 'UNVERIFIED') {
            throw new Error(`Score too low for verification (${scanResult.overallScore}/100). Minimum 60 required.`);
        }
        // Generate seal
        const sealId = this.generateSealId();
        const validDays = config.validDays || this.getValidityPeriod(level);
        const expiresAt = new Date(Date.now() + validDays * 24 * 60 * 60 * 1000);
        const seal = {
            id: sealId,
            clientId,
            domain,
            level,
            score: scanResult.overallScore,
            issuedAt: new Date(),
            expiresAt,
            verificationUrl: `https://qantum.dev/verify/${sealId}`,
            badgeUrl: `https://qantum.dev/badge/${sealId}.svg`,
            embedCode: this.generateEmbedCode(sealId, level, scanResult.overallScore),
            lastScan: new Date(),
            scanHistory: [{
                    date: new Date(),
                    score: scanResult.overallScore,
                    criticalIssues: scanResult.criticalIssues.length,
                    warnings: scanResult.warnings.length,
                }],
        };
        // Generate badge SVG
        await this.generateBadgeSVG(seal);
        // Store seal
        this.seals.set(sealId, seal);
        this.saveSeals();
        console.log(`   └─ Seal issued: ${level} (Score: ${scanResult.overallScore}/100)`);
        console.log(`   └─ Badge: ${seal.badgeUrl}`);
        console.log(`   └─ Verify: ${seal.verificationUrl}`);
        console.log(`   └─ Expires: ${expiresAt.toISOString()}`);
        this.emit('seal:issued', seal);
        return seal;
    }
    /**
     * Verify an existing seal
     */
    async verifySeal(sealId) {
        const seal = this.seals.get(sealId);
        if (!seal) {
            return { valid: false, reason: 'Seal not found' };
        }
        if (new Date() > seal.expiresAt) {
            return { valid: false, reason: 'Seal expired', seal };
        }
        // Re-scan to verify current status
        const scanResult = await this.scanner.scan(`https://${seal.domain}`);
        // Update scan history
        seal.scanHistory.push({
            date: new Date(),
            score: scanResult.overallScore,
            criticalIssues: scanResult.criticalIssues.length,
            warnings: scanResult.warnings.length,
        });
        seal.lastScan = new Date();
        seal.score = scanResult.overallScore;
        // Check if still qualifies
        const currentLevel = this.calculateLevel(scanResult.overallScore);
        if (currentLevel === 'UNVERIFIED') {
            seal.level = 'PENDING';
            this.saveSeals();
            return { valid: false, reason: 'Score dropped below minimum threshold', seal };
        }
        // Update level if changed
        if (currentLevel !== seal.level) {
            seal.level = currentLevel;
            await this.generateBadgeSVG(seal);
        }
        this.saveSeals();
        return { valid: true, seal };
    }
    /**
     * Revoke a seal
     */
    revokeSeal(sealId) {
        if (this.seals.has(sealId)) {
            this.seals.delete(sealId);
            this.saveSeals();
            this.emit('seal:revoked', { sealId });
            return true;
        }
        return false;
    }
    /**
     * Deploy a badge to client's site (integration)
     */
    async deployBadge(clientId) {
        // Find seal by clientId
        for (const seal of this.seals.values()) {
            if (seal.clientId === clientId) {
                console.log(`🛡️ [TRUST] Badge deployed for ${seal.domain}`);
                console.log(`   └─ Embed code:\n${seal.embedCode}`);
                return seal;
            }
        }
        return null;
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // BADGE GENERATION
    // ═══════════════════════════════════════════════════════════════════════════
    async generateBadgeSVG(seal) {
        const colors = {
            SUPREME: { bg: '#FFD700', text: '#000000', label: 'SUPREME' },
            VERIFIED: { bg: '#22C55E', text: '#FFFFFF', label: 'VERIFIED' },
            STANDARD: { bg: '#3B82F6', text: '#FFFFFF', label: 'STANDARD' },
            PENDING: { bg: '#F59E0B', text: '#000000', label: 'PENDING' },
            UNVERIFIED: { bg: '#EF4444', text: '#FFFFFF', label: 'UNVERIFIED' },
        };
        const style = colors[seal.level];
        const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="200" height="40" viewBox="0 0 200 40">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${style.bg};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${this.darkenColor(style.bg, 20)};stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect x="0" y="0" width="200" height="40" rx="6" fill="url(#bg)" />
  
  <!-- Shield Icon -->
  <path d="M20,8 L30,8 L30,22 L25,28 L20,22 Z" fill="${style.text}" opacity="0.9"/>
  <path d="M23,14 L27,14 L27,20 L25,22 L23,20 Z" fill="${style.bg}"/>
  
  <!-- Text -->
  <text x="38" y="17" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="${style.text}">
    VERIFIED BY QANTUM
  </text>
  <text x="38" y="30" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="${style.text}">
    ${style.label} · ${seal.score}/100
  </text>
</svg>`;
        const badgePath = (0, path_1.join)(this.BADGES_PATH, `${seal.id}.svg`);
        (0, fs_1.writeFileSync)(badgePath, svg);
    }
    generateEmbedCode(sealId, level, score) {
        return `<!-- QAntum Trust Badge -->
<a href="https://qantum.dev/verify/${sealId}" target="_blank" rel="noopener" title="Verified by QAntum - ${level} (${score}/100)">
  <img src="https://qantum.dev/badge/${sealId}.svg" alt="QAntum ${level} Badge" width="200" height="40" />
</a>
<!-- End QAntum Trust Badge -->`;
    }
    darkenColor(hex, percent) {
        const num = parseInt(hex.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.max((num >> 16) - amt, 0);
        const G = Math.max((num >> 8 & 0x00FF) - amt, 0);
        const B = Math.max((num & 0x0000FF) - amt, 0);
        return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // UTILITIES
    // ═══════════════════════════════════════════════════════════════════════════
    calculateLevel(score) {
        if (score >= TrustNetwork.THRESHOLDS.SUPREME)
            return 'SUPREME';
        if (score >= TrustNetwork.THRESHOLDS.VERIFIED)
            return 'VERIFIED';
        if (score >= TrustNetwork.THRESHOLDS.STANDARD)
            return 'STANDARD';
        return 'UNVERIFIED';
    }
    getValidityPeriod(level) {
        switch (level) {
            case 'SUPREME': return 365;
            case 'VERIFIED': return 180;
            case 'STANDARD': return 90;
            default: return 30;
        }
    }
    generateSealId() {
        return `QS-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    }
    ensureDirectories() {
        if (!(0, fs_1.existsSync)(this.DATA_PATH)) {
            (0, fs_1.mkdirSync)(this.DATA_PATH, { recursive: true });
        }
        if (!(0, fs_1.existsSync)(this.BADGES_PATH)) {
            (0, fs_1.mkdirSync)(this.BADGES_PATH, { recursive: true });
        }
    }
    loadSeals() {
        try {
            if ((0, fs_1.existsSync)(this.SEALS_FILE)) {
                const data = JSON.parse((0, fs_1.readFileSync)(this.SEALS_FILE, 'utf-8'));
                for (const seal of data) {
                    seal.issuedAt = new Date(seal.issuedAt);
                    seal.expiresAt = new Date(seal.expiresAt);
                    seal.lastScan = new Date(seal.lastScan);
                    seal.scanHistory = seal.scanHistory.map((s) => ({
                        ...s,
                        date: new Date(s.date),
                    }));
                    this.seals.set(seal.id, seal);
                }
            }
        }
        catch {
            // Start fresh
        }
    }
    saveSeals() {
        const data = Array.from(this.seals.values());
        (0, fs_1.writeFileSync)(this.SEALS_FILE, JSON.stringify(data, null, 2));
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // PUBLIC API
    // ═══════════════════════════════════════════════════════════════════════════
    getSeal(sealId) {
        return this.seals.get(sealId);
    }
    getSealByDomain(domain) {
        for (const seal of this.seals.values()) {
            if (seal.domain === domain)
                return seal;
        }
        return undefined;
    }
    getAllSeals() {
        return Array.from(this.seals.values());
    }
    getStats() {
        const seals = this.getAllSeals();
        const scores = seals.map(s => s.score);
        return {
            totalSeals: seals.length,
            supremeCount: seals.filter(s => s.level === 'SUPREME').length,
            verifiedCount: seals.filter(s => s.level === 'VERIFIED').length,
            standardCount: seals.filter(s => s.level === 'STANDARD').length,
            averageScore: scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
            topPerformers: seals
                .sort((a, b) => b.score - a.score)
                .slice(0, 10)
                .map(s => ({ domain: s.domain, score: s.score })),
        };
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // LIVE INTEGRITY STREAM (v33.2)
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Generate a Live Integrity Stream endpoint for real-time verification.
     * When users click the badge, they see LIVE security metrics.
     *
     * "Абсолютно доверие идва от абсолютна прозрачност."
     */
    async generateLiveStream(sealId) {
        const seal = this.seals.get(sealId);
        if (!seal)
            return null;
        // Perform fresh scan
        const freshScan = await this.scanner.scan(`https://${seal.domain}`);
        const liveData = {
            sealId,
            domain: seal.domain,
            level: seal.level,
            timestamp: new Date(),
            // Real-time metrics
            metrics: {
                sslValid: freshScan.ssl?.valid ?? false,
                sslDaysRemaining: freshScan.ssl?.daysUntilExpiry ?? 0,
                securityScore: freshScan.overallScore,
                headersScore: this.calculateHeadersScore(freshScan),
                latency: freshScan.performance?.ttfb ?? 0,
                uptime: 99.9, // Would come from monitoring service
            },
            // Status indicators
            status: {
                ssl: freshScan.ssl?.valid ? 'HEALTHY' : 'CRITICAL',
                headers: freshScan.headers && freshScan.headers.missing.length < 3 ? 'HEALTHY' : 'WARNING',
                dns: freshScan.dns?.hasSPF && freshScan.dns?.hasDMARC ? 'HEALTHY' : 'WARNING',
                performance: (freshScan.performance?.ttfb ?? 1000) < 500 ? 'HEALTHY' : 'WARNING',
            },
            // Historical trend (last 7 scans)
            trend: seal.scanHistory.slice(-7).map(s => ({
                date: s.date.toISOString().split('T')[0],
                score: s.score,
            })),
            // Verification proof
            verification: {
                lastVerified: new Date(),
                nextScheduled: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
                verifiedBy: 'QAntum OMEGA v33.2',
                signatureHash: this.generateVerificationHash(seal, freshScan),
            },
        };
        this.emit('livestream:generated', liveData);
        return liveData;
    }
    calculateHeadersScore(scan) {
        if (!scan.headers)
            return 0;
        const total = scan.headers.present.length + scan.headers.missing.length;
        if (total === 0)
            return 0;
        return Math.round((scan.headers.present.length / total) * 100);
    }
    generateVerificationHash(seal, scan) {
        const data = `${seal.id}:${seal.domain}:${scan.overallScore}:${Date.now()}`;
        return crypto.createHash('sha256').update(data).digest('hex').slice(0, 16);
    }
    /**
     * Generate embeddable widget code for Live Integrity Stream.
     * This replaces the static badge with a dynamic, clickable widget.
     */
    generateLiveWidgetCode(sealId) {
        return `<!-- QAntum Live Integrity Widget -->
<div id="qantum-integrity-${sealId}" style="display:inline-block;"></div>
<script>
(function() {
  const widget = document.getElementById('qantum-integrity-${sealId}');
  const apiUrl = 'https://api.qantum.dev/v1/integrity/${sealId}';
  
  async function updateWidget() {
    try {
      const res = await fetch(apiUrl);
      const data = await res.json();
      
      widget.innerHTML = \`
        <a href="https://qantum.dev/verify/${sealId}" target="_blank" rel="noopener" 
           style="display:flex;align-items:center;gap:8px;padding:8px 16px;
                  background:linear-gradient(135deg,#1a1a2e,#16213e);
                  border-radius:8px;text-decoration:none;font-family:system-ui;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L4 6v6c0 5.5 3.4 10.7 8 12 4.6-1.3 8-6.5 8-12V6l-8-4z" 
                  fill="\${data.metrics.securityScore >= 80 ? '#22C55E' : data.metrics.securityScore >= 60 ? '#F59E0B' : '#EF4444'}"/>
            <path d="M9 12l2 2 4-4" stroke="white" stroke-width="2" fill="none"/>
          </svg>
          <div style="color:white;">
            <div style="font-size:12px;font-weight:600;">VERIFIED BY QANTUM</div>
            <div style="font-size:10px;opacity:0.8;">
              Score: \${data.metrics.securityScore}/100 · 
              Latency: \${data.metrics.latency}ms · 
              <span style="color:\${data.status.ssl === 'HEALTHY' ? '#22C55E' : '#EF4444'}">●</span> LIVE
            </div>
          </div>
        </a>
      \`;
    } catch (e) {
      widget.innerHTML = '<a href="https://qantum.dev/verify/${sealId}" target="_blank">Verified by QAntum</a>';
    }
  }
  
  updateWidget();
  setInterval(updateWidget, 60000); // Refresh every minute
})();
</script>
<!-- End QAntum Live Integrity Widget -->`;
    }
}
exports.TrustNetwork = TrustNetwork;
// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════
exports.default = TrustNetwork;
