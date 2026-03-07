/**
 * PublicScanner — Qantum Module
 * @module PublicScanner
 * @path src/departments/intelligence/PublicScanner.ts
 * @auto-documented BrutalDocEngine v2.1
 */

// src/intelligence/PublicScanner.ts
// Stub matching ValueBombGenerator's expected interface

import axios from 'axios';

export interface PublicScanResult {
  ssl: { valid: boolean; daysUntilExpiry: number | null };
  headers: { missing: string[] };
  performance: { ttfb: number; totalTime: number };
  dns: { hasSPF: boolean; hasDMARC: boolean };
  criticalIssues: string[];
  overallScore: number;
}

export class PublicScanner {
  private static instance: PublicScanner;

  private constructor() {}

  static getInstance(): PublicScanner {
    if (!PublicScanner.instance) {
      PublicScanner.instance = new PublicScanner();
    }
    return PublicScanner.instance;
  }

  // Complexity: O(N) — linear scan
  async scan(url: string): Promise<PublicScanResult> {
    console.log(`   🔍 [PublicScanner] Scanning ${url}...`);

    const result: PublicScanResult = {
      ssl: { valid: true, daysUntilExpiry: null },
      headers: { missing: [] },
      performance: { ttfb: 0, totalTime: 0 },
      dns: { hasSPF: false, hasDMARC: false },
      criticalIssues: [],
      overallScore: 50,
    };

    try {
      const start = Date.now();
      const response = await axios.get(url, {
        timeout: 10000,
        validateStatus: () => true,
        maxRedirects: 5
      });
      const totalTime = Date.now() - start;

      result.performance.ttfb = totalTime;  // approximate
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
      score -= missingCount * 8;                               // -8 per missing header
      score -= totalTime > 2000 ? 15 : (totalTime > 1000 ? 8 : 0);
      score -= result.ssl.valid ? 0 : 25;
      result.overallScore = Math.max(0, Math.min(100, score));

      console.log(`   └─ Score: ${result.overallScore}/100 | Time: ${totalTime}ms | Missing Headers: ${missingCount}`);
    } catch (error: any) {
      console.log(`   └─ Scan error: ${error.message} (using defaults)`);
      result.criticalIssues.push(`Site unreachable: ${error.message}`);
      result.overallScore = 20;
    }

    return result;
  }
}
