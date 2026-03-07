"use strict";
/**
 * PublicScanner — Qantum Module
 * @module PublicScanner
 * @path src/departments/intelligence/PublicScanner.ts
 * @auto-documented BrutalDocEngine v2.1
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicScanner = void 0;
// src/intelligence/PublicScanner.ts
// Stub matching ValueBombGenerator's expected interface
const axios_1 = __importDefault(require("axios"));
class PublicScanner {
    static instance;
    constructor() { }
    static getInstance() {
        if (!PublicScanner.instance) {
            PublicScanner.instance = new PublicScanner();
        }
        return PublicScanner.instance;
    }
    // Complexity: O(N) — linear scan
    async scan(url) {
        console.log(`   🔍 [PublicScanner] Scanning ${url}...`);
        const result = {
            ssl: { valid: true, daysUntilExpiry: null },
            headers: { missing: [] },
            performance: { ttfb: 0, totalTime: 0 },
            dns: { hasSPF: false, hasDMARC: false },
            criticalIssues: [],
            overallScore: 50,
        };
        try {
            const start = Date.now();
            const response = await axios_1.default.get(url, {
                timeout: 10000,
                validateStatus: () => true,
                maxRedirects: 5
            });
            const totalTime = Date.now() - start;
            result.performance.ttfb = totalTime; // approximate
            result.performance.totalTime = totalTime;
            // Check headers
            const headers = response.headers;
            const securityHeaders = [
                'strict-transport-security',
                'x-content-type-options',
                'x-frame-options',
                'content-security-policy',
                'x-xss-protection',
                'referrer-policy',
                'permissions-policy'
            ];
            result.headers.missing = securityHeaders.filter(h => !headers[h]);
            // SSL check (if https works, it's valid)
            if (url.startsWith('https://') && response.status < 500) {
                result.ssl.valid = true;
            }
            // Score calculation
            const missingCount = result.headers.missing.length;
            let score = 100;
            score -= missingCount * 8; // -8 per missing header
            score -= totalTime > 2000 ? 15 : (totalTime > 1000 ? 8 : 0);
            score -= result.ssl.valid ? 0 : 25;
            result.overallScore = Math.max(0, Math.min(100, score));
            console.log(`   └─ Score: ${result.overallScore}/100 | Time: ${totalTime}ms | Missing Headers: ${missingCount}`);
        }
        catch (error) {
            console.log(`   └─ Scan error: ${error.message} (using defaults)`);
            result.criticalIssues.push(`Site unreachable: ${error.message}`);
            result.overallScore = 20;
        }
        return result;
    }
}
exports.PublicScanner = PublicScanner;
