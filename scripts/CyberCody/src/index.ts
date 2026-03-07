/**
 * index — Qantum Module
 * @module index
 * @path scripts/CyberCody/src/index.ts
 * @auto-documented BrutalDocEngine v2.1
 */

// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║  CYBERCODY v25.0 - MAIN ORCHESTRATOR                                         ║
// ║  "The Temporal Healer" - Full Lifecycle Security Automation                  ║
// ║  Discovery → Attack → Fix → Verification → PR                                ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

import { EventEmitter } from 'events';
import type {
  CyberCodyConfig,
  ScanResult,
  ScanSummary,
  ReconResult,
  FuzzingResult,
  FuzzingConfig,
  VulnerabilitySnapshot,
  VulnerabilitySeverity,
  CyberCodyEvent,
  EventHandler,
  PayloadCategory,
} from '../../qantum/SaaS-Framework/01_ECOSYSTEM_APPS/MrMindQATool/src/index';

// v1.0 Core Modules
import { ReconModule } from './modules/recon.js';
import { FuzzingEngine } from './modules/fuzzing.js';
import { VulnerabilitySnapshotModule } from './modules/snapshot.js';
import { EthicalGuardrails } from './modules/guardrails.js';

// v1.1 API Logic Hunter Modules
import { APIInterceptor, type APIMap } from '../../qantum/SaaS-Framework/01_ECOSYSTEM_APPS/MisterMind-Site/dpengeneering/cybercody/src/modules/api-interceptor';
import { BOLATester, type BOLATestReport } from '../../qantum/SaaS-Framework/01_ECOSYSTEM_APPS/MisterMind-Site/dpengeneering/cybercody/src/modules/bola-tester';
import { LogicAnalyzer, type LogicAnalysisReport } from './modules/logic-analyzer.js';
import { SurgeonIntegration, type SurgeonReport, type Framework } from '../../qantum/SaaS-Framework/01_ECOSYSTEM_APPS/MisterMind-Site/dpengeneering/cybercody/src/modules/surgeon-integration';
import { ShadowAPIDiscovery, type ShadowAPIReport } from '../../qantum/SaaS-Framework/01_ECOSYSTEM_APPS/MisterMind-Site/dpengeneering/cybercody/src/modules/shadow-api-discovery';

// v1.2 Ghost Auditor Modules
import { 
  SessionOrchestrator, 
  type UserProfile,
  type SessionOrchestratorReport,
  type CrossSessionVulnerability,
} from '../../qantum/SaaS-Framework/01_ECOSYSTEM_APPS/MisterMind-Site/dpengeneering/cybercody/src/modules/session-orchestrator';
import { 
  PIIScanner, 
  type PIIDetection, 
  type PIIScannerReport,
  type PIICategory,
  type PIIRiskLevel,
} from '../../qantum/SaaS-Framework/01_ECOSYSTEM_APPS/MisterMind-Site/dpengeneering/cybercody/src/modules/pii-scanner';
import { 
  StealthEngine, 
  type StealthResponse,
  type StealthLevel,
  type TimingStrategy,
  type StealthStats,
} from '../../qantum/SaaS-Framework/01_ECOSYSTEM_APPS/MisterMind-Site/dpengeneering/cybercody/src/modules/stealth-engine';
import { 
  RemediationGenerator,
  type GeneratedPatch,
  type RemediationReport,
  type Framework as RemediationFramework,
} from '../../qantum/SaaS-Framework/01_ECOSYSTEM_APPS/MisterMind-Site/dpengeneering/cybercody/src/modules/remediation-gen';

// v1.3 Visual Hacker Modules
import {
  VisualPhishingDetector,
  type PhishingAnalysis,
  type PhishingReport,
  type BrandSignature,
} from '../../qantum/SaaS-Framework/01_ECOSYSTEM_APPS/MisterMind-Site/dpengeneering/cybercody/src/modules/visual-phishing-detector';
import {
  HiddenElementFinder,
  type HiddenElement,
  type HiddenElementReport,
  type ClickjackingVector,
} from '../../qantum/SaaS-Framework/01_ECOSYSTEM_APPS/MisterMind-Site/dpengeneering/cybercody/src/modules/hidden-element-finder';
import {
  DashboardSync,
  type SecurityHealthScore,
  type DashboardSecurityReport,
  type VulnerabilitySummary,
} from '../../qantum/SaaS-Framework/01_ECOSYSTEM_APPS/MisterMind-Site/dpengeneering/cybercody/src/modules/dashboard-sync';

// v25.0 Temporal Healer Modules
import {
  HotSwapSelectorEngine,
  type SelectorFingerprint as _SelectorFingerprint,
  type SelectorMutation as _SelectorMutation,
  type HotSwapResult as _HotSwapResult,
  type HotSwapReport as _HotSwapReport,
} from '../../qantum/SaaS-Framework/01_ECOSYSTEM_APPS/MisterMind-Site/dpengeneering/cybercody/src/modules/hot-swap-selector';
import {
  PredictiveAttackSurface,
  type VulnerabilityTrend as _VulnerabilityTrend,
  type AttackSurfaceAnalysis,
  type VulnerabilityCategory as _VulnerabilityCategory,
  type DependencyRisk as _DependencyRisk,
} from '../../qantum/SaaS-Framework/01_ECOSYSTEM_APPS/MisterMind-Site/dpengeneering/cybercody/src/modules/predictive-attack-surface';
import {
  AutonomousBugFixer,
  type GeneratedPatch as _BugFixerPatch,
  type PatchVerification as _PatchVerification,
  type PullRequestDetails as _PullRequestDetails,
  type LifecycleResult,
} from '../../qantum/SaaS-Framework/01_ECOSYSTEM_APPS/MisterMind-Site/dpengeneering/cybercody/src/modules/autonomous-bug-fixer';

// ═══════════════════════════════════════════════════════════════════════════════
// 🎯 DEFAULT CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

const DEFAULT_CONFIG: CyberCodyConfig = {
  ethical: {
    allowedTargets: [],
    allowedDomains: [],
    maxRequestsPerSecond: 10,
    requireConsentFile: false,
    blockCriticalInfrastructure: true,
  },
  recon: {
    timeout: 30000,
    screenshotViewports: [
      { width: 1920, height: 1080 },
      { width: 375, height: 812 },
    ],
    followRedirects: true,
    maxRedirects: 5,
  },
  fuzzing: {
    defaultIterations: 500,
    defaultWorkers: 4,
    defaultDelay: 100,
    defaultTimeout: 10000,
  },
  workers: {
    minWorkers: 2,
    maxWorkers: 8,
    idleTimeout: 30000,
    taskTimeout: 60000,
  },
  output: {
    directory: './output',
    format: 'all',
    includeScreenshots: true,
    includeRawResponses: false,
  },
  logging: {
    level: 'info',
    console: true,
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// 🤖 CYBERCODY MAIN CLASS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * CyberCody - Offensive AI Security Agent
 * 
 * The weapon to MisterMind's shield.
 * 
 * Features:
 * - RECON_MODULE: Playwright-powered tech stack detection
 * - FUZZING_ENGINE: Worker Thread parallel fuzzing with 1000+ payloads
 * - VULNERABILITY_SNAPSHOT: Neural snapshots with auto-PoC generation
 * - ETHICAL_GUARDRAILS: Scope enforcement and authorization
 * 
 * @example
 * ```typescript
 * const cody = new CyberCody({
 *   ethical: {
 *     allowedDomains: ['*.mydomain.com'],
 *     blockCriticalInfrastructure: true,
 *   }
 * });
 * 
 // SAFETY: async operation — wrap in try-catch for production resilience
 * const result = await cody.scan('https://test.mydomain.com');
 * console.log(result.summary);
 * ```
 */
export class CyberCody extends EventEmitter {
  private config: CyberCodyConfig;
  private recon: ReconModule;
  private fuzzer: FuzzingEngine;
  private snapshots: VulnerabilitySnapshotModule;
  private guardrails: EthicalGuardrails;
  private activeScan: ScanResult | null = null;

  constructor(config: Partial<CyberCodyConfig> = {}) {
    super();
    
    // Merge with defaults
    this.config = this.mergeConfig(DEFAULT_CONFIG, config);

    // Initialize modules
    this.recon = new ReconModule(this.config.recon);
    this.fuzzer = new FuzzingEngine(this.config.fuzzing);
    this.snapshots = new VulnerabilitySnapshotModule();
    this.guardrails = new EthicalGuardrails(this.config.ethical);

    this.printBanner();
  }

  /**
   * Print CyberCody banner
   */
  // Complexity: O(1) — amortized
  private printBanner(): void {
    console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║   ██████╗██╗   ██╗██████╗ ███████╗██████╗  ██████╗ ██████╗ ██████╗ ██╗   ██╗ ║
║  ██╔════╝╚██╗ ██╔╝██╔══██╗██╔════╝██╔══██╗██╔════╝██╔═══██╗██╔══██╗╚██╗ ██╔╝ ║
║  ██║      ╚████╔╝ ██████╔╝█████╗  ██████╔╝██║     ██║   ██║██║  ██║ ╚████╔╝  ║
║  ██║       ╚██╔╝  ██╔══██╗██╔══╝  ██╔══██╗██║     ██║   ██║██║  ██║  ╚██╔╝   ║
║  ╚██████╗   ██║   ██████╔╝███████╗██║  ██║╚██████╗╚██████╔╝██████╔╝   ██║    ║
║   ╚═════╝   ╚═╝   ╚═════╝ ╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚═════╝ ╚═════╝    ╚═╝    ║
║                                                                              ║
║                    v1.2.0 - "The Ghost Auditor"                              ║
║           🛡️ MisterMind is the Shield. CyberCody is the Sword. ⚔️            ║
║                                                                              ║
║  v1.0: RECON | FUZZING | SNAPSHOT | GUARDRAILS                               ║
║  v1.1: API_INTERCEPTOR | BOLA_TESTER | LOGIC_ANALYZER | SURGEON | SHADOW_API ║
║  v1.2: SESSION_ORCHESTRATOR | PII_SCANNER | STEALTH_ENGINE | REMEDIATION_GEN ║
║                                                                              ║
║  By: Димитър Продромов | dpengineering                                       ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
    `);
  }

  /**
   * Perform full security scan on target
   * 
   * @param target - URL to scan
   * @param options - Scan options
   */
  // Complexity: O(N)
  async scan(target: string, options: {
    skipRecon?: boolean;
    skipFuzzing?: boolean;
    fuzzCategories?: PayloadCategory[];
    fuzzIterations?: number;
  } = {}): Promise<ScanResult> {
    const scanId = this.generateScanId();
    const startTime = new Date();

    // Initialize scan result
    this.activeScan = {
      id: scanId,
      target,
      startTime,
      endTime: startTime,
      status: 'running',
      authorization: { authorized: false, reason: '', target, timestamp: new Date(), guardrailsApplied: [] },
      vulnerabilities: [],
      summary: this.emptySummary(),
    };

    this.emitEvent({ type: 'scan:start', target });

    try {
      // Step 1: Authorization check
      console.log('\n🛡️  [1/4] ETHICAL GUARDRAILS CHECK');
      const authorization = this.guardrails.authorize(target);
      this.activeScan.authorization = authorization;

      if (!authorization.authorized) {
        this.emitEvent({ type: 'guardrail:blocked', target, reason: authorization.reason });
        throw new Error(`Scan blocked by guardrails: ${authorization.reason}`);
      }

      console.log('   ✅ Target authorized for scanning\n');

      // Step 2: Reconnaissance
      if (!options.skipRecon) {
        console.log('🔍 [2/4] RECONNAISSANCE PHASE');
        this.emitEvent({ type: 'recon:start', target });

        // SAFETY: async operation — wrap in try-catch for production resilience
        const reconResult = await this.recon.scan(target);
        this.activeScan.recon = reconResult;

        this.emitEvent({ type: 'recon:complete', result: reconResult });
        console.log(`   ✅ Detected ${reconResult.techStack.frontendFrameworks.length} frameworks`);
        console.log(`   ✅ Found ${reconResult.techStack.apiEndpoints.length} API endpoints`);
        console.log(`   ✅ Security headers score: ${reconResult.techStack.securityHeaders.score}/100\n`);
      }

      // Step 3: Fuzzing
      if (!options.skipFuzzing) {
        console.log('🔥 [3/4] FUZZING PHASE');
        
        const fuzzConfig: FuzzingConfig = {
          target,
          method: 'GET',
          parameters: [{ name: 'test', type: 'query', fuzz: true }],
          iterations: options.fuzzIterations ?? this.config.fuzzing.defaultIterations,
          workerCount: this.config.fuzzing.defaultWorkers,
          delayMs: this.config.fuzzing.defaultDelay,
          timeoutMs: this.config.fuzzing.defaultTimeout,
          payloadCategories: options.fuzzCategories ?? ['xss', 'sqli', 'cmdi', 'pathtraversal'],
        };

        this.emitEvent({ type: 'fuzz:start', target, iterations: fuzzConfig.iterations });

        // SAFETY: async operation — wrap in try-catch for production resilience
        const fuzzResult = await this.fuzzer.fuzz(fuzzConfig);
        this.activeScan.fuzzing = fuzzResult;

        this.emitEvent({ type: 'fuzz:complete', result: fuzzResult });
        console.log(`   ✅ Completed ${fuzzResult.completedIterations} iterations`);
        console.log(`   ✅ Found ${fuzzResult.anomaliesFound.length} anomalies\n`);

        // Step 4: Create vulnerability snapshots
        console.log('📸 [4/4] VULNERABILITY SNAPSHOT PHASE');
        
        for (const anomaly of fuzzResult.anomaliesFound) {
          if (anomaly.anomaly.severity !== 'none' && anomaly.anomaly.severity !== 'low') {
            const snapshot = this.snapshots.createFromFuzzIteration(anomaly);
            this.activeScan.vulnerabilities.push(snapshot);
            this.emitEvent({ type: 'vulnerability:found', snapshot });
          }
        }

        console.log(`   ✅ Created ${this.activeScan.vulnerabilities.length} vulnerability snapshots\n`);
      }

      // Generate summary
      this.activeScan.summary = this.generateSummary(this.activeScan);
      this.activeScan.status = 'completed';
      this.activeScan.endTime = new Date();

      this.emitEvent({ type: 'scan:complete', result: this.activeScan });
      this.printScanSummary(this.activeScan);

      return this.activeScan;

    } catch (error) {
      this.activeScan.status = 'failed';
      this.activeScan.endTime = new Date();
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.emitEvent({ type: 'scan:error', error: errorMessage });
      
      console.error(`\n❌ Scan failed: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Run reconnaissance only
   */
  // Complexity: O(1)
  async runRecon(target: string): Promise<ReconResult> {
    const authorization = this.guardrails.authorize(target);
    if (!authorization.authorized) {
      throw new Error(`Recon blocked: ${authorization.reason}`);
    }

    return this.recon.scan(target);
  }

  /**
   * Run fuzzing only
   */
  // Complexity: O(1)
  async runFuzz(config: FuzzingConfig): Promise<FuzzingResult> {
    const authorization = this.guardrails.authorize(config.target);
    if (!authorization.authorized) {
      throw new Error(`Fuzzing blocked: ${authorization.reason}`);
    }

    return this.fuzzer.fuzz(config);
  }

  /**
   * Add allowed target domain
   */
  // Complexity: O(1)
  allowDomain(domain: string): void {
    if (!this.config.ethical.allowedDomains.includes(domain)) {
      this.config.ethical.allowedDomains.push(domain);
      console.log(`✅ Added ${domain} to allowed domains`);
    }
  }

  /**
   * Add allowed target IP
   */
  // Complexity: O(1)
  allowIP(ip: string): void {
    if (!this.config.ethical.allowedTargets.includes(ip)) {
      this.config.ethical.allowedTargets.push(ip);
      console.log(`✅ Added ${ip} to allowed IPs`);
    }
  }

  /**
   * Get guardrails status
   */
  // Complexity: O(1)
  getGuardrailsStatus(): void {
    this.guardrails.printStatus();
  }

  /**
   * Get all vulnerability snapshots
   */
  // Complexity: O(1)
  getVulnerabilities(): VulnerabilitySnapshot[] {
    return this.snapshots.getSnapshots();
  }

  /**
   * Export scan results
   */
  // Complexity: O(1)
  exportResults(format: 'json' | 'html' | 'markdown' = 'json'): string {
    if (!this.activeScan) {
      throw new Error('No scan results to export');
    }

    switch (format) {
      case 'json':
        return JSON.stringify(this.activeScan, null, 2);
      case 'markdown':
        return this.generateMarkdownReport(this.activeScan);
      case 'html':
        return this.generateHTMLReport(this.activeScan);
      default:
        return JSON.stringify(this.activeScan, null, 2);
    }
  }

  /**
   * Subscribe to events
   */
  // Complexity: O(1)
  onEvent(handler: EventHandler): void {
    this.on('cybercody-event', handler);
  }

  /**
   * Emit typed event
   */
  // Complexity: O(1)
  private emitEvent(event: CyberCodyEvent): void {
    this.emit('cybercody-event', event);
  }

  /**
   * Generate scan ID
   */
  // Complexity: O(1)
  private generateScanId(): string {
    return `scan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate scan summary
   */
  // Complexity: O(N*M) — nested iteration detected
  private generateSummary(scan: ScanResult): ScanSummary {
    const bySeverity: Record<VulnerabilitySeverity, number> = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      info: 0,
    };

    const byType: Record<string, number> = {};

    for (const vuln of scan.vulnerabilities) {
      bySeverity[vuln.severity]++;
      byType[vuln.type] = (byType[vuln.type] ?? 0) + 1;
    }

    // Calculate risk score (0-100)
    const riskScore = Math.min(100,
      bySeverity.critical * 25 +
      bySeverity.high * 15 +
      bySeverity.medium * 5 +
      bySeverity.low * 1
    );

    // Generate recommendations
    const recommendations: string[] = [];
    
    if (bySeverity.critical > 0) {
      recommendations.push('🔴 CRITICAL: Immediate remediation required for critical vulnerabilities');
    }
    if (bySeverity.high > 0) {
      recommendations.push('🟠 HIGH: Schedule urgent fixes for high severity issues');
    }
    if (scan.recon?.techStack.securityHeaders.score && scan.recon.techStack.securityHeaders.score < 50) {
      recommendations.push('🛡️ Security headers are weak - implement CSP, HSTS, X-Frame-Options');
    }

    return {
      totalVulnerabilities: scan.vulnerabilities.length,
      bySeverity,
      byType,
      riskScore,
      recommendations,
    };
  }

  /**
   * Empty summary for initialization
   */
  // Complexity: O(1)
  private emptySummary(): ScanSummary {
    return {
      totalVulnerabilities: 0,
      bySeverity: { critical: 0, high: 0, medium: 0, low: 0, info: 0 },
      byType: {},
      riskScore: 0,
      recommendations: [],
    };
  }

  /**
   * Print scan summary to console
   */
  // Complexity: O(N) — linear iteration
  private printScanSummary(scan: ScanResult): void {
    const duration = (scan.endTime.getTime() - scan.startTime.getTime()) / 1000;

    console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║                        📊 CYBERCODY SCAN SUMMARY                             ║
╠══════════════════════════════════════════════════════════════════════════════╣
║ Target: ${scan.target.padEnd(65)}║
║ Duration: ${duration.toFixed(2)}s                                                          ║
║ Status: ${scan.status.toUpperCase().padEnd(66)}║
╠══════════════════════════════════════════════════════════════════════════════╣
║ VULNERABILITIES FOUND: ${scan.summary.totalVulnerabilities.toString().padStart(3)}                                                 ║
║   🔴 Critical: ${scan.summary.bySeverity.critical.toString().padStart(3)}                                                          ║
║   🟠 High:     ${scan.summary.bySeverity.high.toString().padStart(3)}                                                          ║
║   🟡 Medium:   ${scan.summary.bySeverity.medium.toString().padStart(3)}                                                          ║
║   🟢 Low:      ${scan.summary.bySeverity.low.toString().padStart(3)}                                                          ║
║   ⚪ Info:     ${scan.summary.bySeverity.info.toString().padStart(3)}                                                          ║
╠══════════════════════════════════════════════════════════════════════════════╣
║ RISK SCORE: ${scan.summary.riskScore}/100 ${this.getRiskBar(scan.summary.riskScore)}                              ║
╠══════════════════════════════════════════════════════════════════════════════╣
║ RECOMMENDATIONS:                                                             ║`);

    for (const rec of scan.summary.recommendations.slice(0, 3)) {
      console.log(`║ • ${rec.substring(0, 71).padEnd(71)}║`);
    }

    console.log(`╚══════════════════════════════════════════════════════════════════════════════╝`);
  }

  /**
   * Generate risk bar visualization
   */
  // Complexity: O(1)
  private getRiskBar(score: number): string {
    const filled = Math.round(score / 5);
    const empty = 20 - filled;
    return '[' + '█'.repeat(filled) + '░'.repeat(empty) + ']';
  }

  /**
   * Generate Markdown report
   */
  // Complexity: O(N) — linear iteration
  private generateMarkdownReport(scan: ScanResult): string {
    return `# CyberCody Scan Report

## Target Information
- **URL**: ${scan.target}
- **Scan ID**: ${scan.id}
- **Start Time**: ${scan.startTime.toISOString()}
- **Duration**: ${((scan.endTime.getTime() - scan.startTime.getTime()) / 1000).toFixed(2)}s

## Summary
- **Total Vulnerabilities**: ${scan.summary.totalVulnerabilities}
- **Risk Score**: ${scan.summary.riskScore}/100

### By Severity
| Severity | Count |
|----------|-------|
| Critical | ${scan.summary.bySeverity.critical} |
| High | ${scan.summary.bySeverity.high} |
| Medium | ${scan.summary.bySeverity.medium} |
| Low | ${scan.summary.bySeverity.low} |
| Info | ${scan.summary.bySeverity.info} |

## Recommendations
${scan.summary.recommendations.map(r => `- ${r}`).join('\n')}

## Vulnerabilities

${scan.vulnerabilities.map((v, i) => `
### ${i + 1}. ${v.type}

- **Severity**: ${v.severity}
- **Endpoint**: ${v.endpoint}
- **CWE**: CWE-${v.classification.cweId}
- **CVSS**: ${v.classification.cvssScore}

#### Evidence
${v.evidence.map(e => `- ${e}`).join('\n')}

#### Proof of Concept

\`\`\`bash
${v.poc.code.curl}
\`\`\`

#### Remediation
${v.remediation.description}

${v.remediation.steps.map((s, j) => `${j + 1}. ${s}`).join('\n')}
`).join('\n---\n')}

---
*Generated by CyberCody v1.0.0 - The Offensive Sovereign*
`;
  }

  /**
   * Generate HTML report
   */
  // Complexity: O(N) — linear iteration
  private generateHTMLReport(scan: ScanResult): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>CyberCody Scan Report - ${scan.target}</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #1a1a2e, #16213e); color: white; padding: 30px; border-radius: 10px; }
    .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
    .card { background: white; border-radius: 10px; padding: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .critical { border-left: 4px solid #dc3545; }
    .high { border-left: 4px solid #fd7e14; }
    .medium { border-left: 4px solid #ffc107; }
    .low { border-left: 4px solid #28a745; }
    pre { background: #1a1a2e; color: #00ff00; padding: 15px; border-radius: 5px; overflow-x: auto; }
    .risk-bar { height: 20px; background: #eee; border-radius: 10px; overflow: hidden; }
    .risk-fill { height: 100%; background: linear-gradient(90deg, #28a745, #ffc107, #dc3545); }
  </style>
</head>
<body>
  <div class="header">
    <h1>⚔️ CyberCody Scan Report</h1>
    <p><strong>Target:</strong> ${scan.target}</p>
    <p><strong>Scan ID:</strong> ${scan.id}</p>
  </div>

  <div class="summary">
    <div class="card">
      <h3>Risk Score</h3>
      <h2>${scan.summary.riskScore}/100</h2>
      <div class="risk-bar">
        <div class="risk-fill" style="width: ${scan.summary.riskScore}%"></div>
      </div>
    </div>
    <div class="card critical">
      <h3>🔴 Critical</h3>
      <h2>${scan.summary.bySeverity.critical}</h2>
    </div>
    <div class="card high">
      <h3>🟠 High</h3>
      <h2>${scan.summary.bySeverity.high}</h2>
    </div>
    <div class="card medium">
      <h3>🟡 Medium</h3>
      <h2>${scan.summary.bySeverity.medium}</h2>
    </div>
  </div>

  <h2>Vulnerabilities</h2>
  ${scan.vulnerabilities.map((v, i) => `
    <div class="card ${v.severity}">
      <h3>${i + 1}. ${v.type}</h3>
      <p><strong>Severity:</strong> ${v.severity.toUpperCase()}</p>
      <p><strong>Endpoint:</strong> ${v.endpoint}</p>
      <p><strong>CWE-${v.classification.cweId}</strong> | CVSS: ${v.classification.cvssScore}</p>
      <h4>Proof of Concept</h4>
      <pre>${v.poc.code.curl}</pre>
      <h4>Remediation</h4>
      <p>${v.remediation.description}</p>
    </div>
  `).join('\n')}

  <footer style="text-align: center; margin-top: 40px; color: #666;">
    <p>Generated by CyberCody v1.1.0 - "API Logic Hunter"</p>
    <p>🛡️ MisterMind is the Shield. ⚔️ CyberCody is the Sword.</p>
  </footer>
</body>
</html>`;
  }

  /**
   * Deep merge configuration objects
   */
  // Complexity: O(1)
  private mergeConfig(
    defaults: CyberCodyConfig,
    overrides: Partial<CyberCodyConfig>
  ): CyberCodyConfig {
    return {
      ethical: { ...defaults.ethical, ...overrides.ethical },
      recon: { ...defaults.recon, ...overrides.recon },
      fuzzing: { ...defaults.fuzzing, ...overrides.fuzzing },
      workers: { ...defaults.workers, ...overrides.workers },
      output: { ...defaults.output, ...overrides.output },
      logging: { ...defaults.logging, ...overrides.logging },
    };
  }

  /**
   * Cleanup resources
   */
  // Complexity: O(1)
  async cleanup(): Promise<void> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.recon.cleanup();
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // 🎯 v1.1 API LOGIC HUNTER METHODS
  // ═══════════════════════════════════════════════════════════════════════════════

  /**
   * Perform full API security audit
   * 
   * This is the v1.1 "API Logic Hunter" scan that focuses on:
   * - API endpoint discovery and mapping
   * - BOLA/IDOR vulnerability testing
   * - Sensitive data exposure analysis
   * - Shadow API discovery
   * - Auto-generated security patches
   * 
   * @param target - URL to audit
   * @param options - API audit options
   */
  // Complexity: O(N*M) — nested iteration detected
  async apiSecurityAudit(target: string, options: {
    /** Discover shadow/hidden APIs */
    discoverShadowAPIs?: boolean;
    /** Analyze response data for sensitive info */
    analyzeDataExposure?: boolean;
    /** Generate patches for vulnerabilities */
    generatePatches?: boolean;
    /** Target framework for patch generation */
    framework?: Framework;
    /** Gemini API key for AI analysis */
    geminiApiKey?: string;
    /** Actions to perform during interception */
    interactionSteps?: Array<{ action: string; selector?: string; value?: string; url?: string }>;
    /** Custom user IDs to test for BOLA */
    customIds?: string[];
    /** Maximum pages to crawl */
    maxPages?: number;
  } = {}): Promise<APISecurityAuditReport> {
    const startTime = new Date();
    console.log('\n🎯 [API SECURITY AUDIT] Starting comprehensive API analysis...\n');

    // Step 0: Authorization check
    console.log('🛡️  [0/6] ETHICAL GUARDRAILS CHECK');
    const authorization = this.guardrails.authorize(target);
    if (!authorization.authorized) {
      throw new Error(`Scan blocked by guardrails: ${authorization.reason}`);
    }
    console.log('   ✅ Target authorized for API security audit\n');

    // Step 1: API Interception
    console.log('📡 [1/6] API INTERCEPTION PHASE');
    const interceptor = new APIInterceptor({ target });
    // SAFETY: async operation — wrap in try-catch for production resilience
    const apiMap = await interceptor.intercept(options.interactionSteps);
    console.log(`   ✅ Captured ${apiMap.requests.length} API requests`);
    console.log(`   ✅ Identified ${apiMap.bolaTargets.length} BOLA targets`);
    console.log(`   ✅ Extracted ${apiMap.authTokens.length} auth tokens\n`);

    // Step 2: BOLA Testing
    console.log('🔐 [2/6] BOLA TESTING PHASE');
    const bolaTester = new BOLATester({
      apiMap,
      customIds: options.customIds,
    });
    // SAFETY: async operation — wrap in try-catch for production resilience
    const bolaReport = await bolaTester.test();
    console.log(`   ✅ Tested ${bolaReport.totalTests} ID variations`);
    console.log(`   ✅ Found ${bolaReport.vulnerabilitiesFound} BOLA vulnerabilities\n`);

    // Step 3: Logic Analysis (Data Exposure)
    let logicReport: LogicAnalysisReport | undefined;
    if (options.analyzeDataExposure !== false) {
      console.log('🧠 [3/6] LOGIC ANALYSIS PHASE');
      const logicAnalyzer = new LogicAnalyzer({
        geminiApiKey: options.geminiApiKey,
        useLocalOnly: !options.geminiApiKey,
      });
      // SAFETY: async operation — wrap in try-catch for production resilience
      logicReport = await logicAnalyzer.analyzeAPIMap(apiMap);
      console.log(`   ✅ Analyzed ${logicReport.totalEndpoints} endpoints`);
      console.log(`   ✅ Found ${logicReport.totalExposures} data exposures\n`);
    }

    // Step 4: Shadow API Discovery
    let shadowReport: ShadowAPIReport | undefined;
    if (options.discoverShadowAPIs) {
      console.log('👻 [4/6] SHADOW API DISCOVERY PHASE');
      const shadowDiscovery = new ShadowAPIDiscovery({ target });
      // SAFETY: async operation — wrap in try-catch for production resilience
      shadowReport = await shadowDiscovery.discover();
      console.log(`   ✅ Discovered ${shadowReport.totalEndpointsFound} shadow endpoints`);
      console.log(`   ✅ Found ${shadowReport.summary.criticalFindings.length} critical findings\n`);
    }

    // Step 5: Patch Generation
    let surgeonReport: SurgeonReport | undefined;
    if (options.generatePatches && options.framework) {
      console.log('🔧 [5/6] PATCH GENERATION PHASE');
      const surgeon = new SurgeonIntegration({ framework: options.framework });
      
      // Generate BOLA patches
      if (bolaReport.summary.confirmedBOLA.length > 0) {
        surgeon.generateBOLAPatches(bolaReport.summary.confirmedBOLA);
      }
      
      // Generate data exposure patches
      if (logicReport && logicReport.totalExposures > 0) {
        surgeon.generateDataExposurePatches(logicReport.results);
      }
      
      // Generate rate limiter
      surgeon.generateRateLimiterPatch();
      
      surgeonReport = surgeon.generateReport();
      console.log(`   ✅ Generated ${surgeonReport.totalPatches} security patches\n`);
    }

    // Step 6: Generate comprehensive report
    console.log('📊 [6/6] GENERATING COMPREHENSIVE REPORT\n');
    
    const report: APISecurityAuditReport = {
      target,
      startTime,
      endTime: new Date(),
      authorization,
      
      apiMap: {
        totalEndpoints: apiMap.endpoints.size,
        totalRequests: apiMap.requests.length,
        bolaTargets: apiMap.bolaTargets.length,
        authTokensFound: apiMap.authTokens.length,
      },
      
      bolaReport: bolaReport ? {
        totalTests: bolaReport.totalTests,
        vulnerabilitiesFound: bolaReport.vulnerabilitiesFound,
        confirmedBOLA: bolaReport.summary.confirmedBOLA.length,
        criticalVulns: bolaReport.summary.criticalVulns,
      } : undefined,
      
      logicReport: logicReport ? {
        totalExposures: logicReport.totalExposures,
        totalLogicFlaws: logicReport.totalLogicFlaws,
        overallRiskScore: logicReport.summary.overallRiskScore,
        complianceViolations: logicReport.summary.complianceViolations,
      } : undefined,
      
      shadowReport: shadowReport ? {
        totalEndpoints: shadowReport.totalEndpointsFound,
        criticalFindings: shadowReport.summary.criticalFindings.length,
        deprecatedAPIs: shadowReport.summary.deprecatedAPIs.length,
        debugEndpoints: shadowReport.summary.debugEndpoints.length,
      } : undefined,
      
      patchesGenerated: surgeonReport?.totalPatches ?? 0,
      
      summary: {
        overallRiskScore: this.calculateOverallRisk(bolaReport, logicReport, shadowReport),
        criticalIssues: (bolaReport?.summary.criticalVulns ?? 0) + 
                        (shadowReport?.summary.criticalFindings.length ?? 0) +
                        (logicReport?.summary.criticalExposures.length ?? 0),
        recommendations: this.generateAPIRecommendations(bolaReport, logicReport, shadowReport),
      },
      
      fullReports: {
        apiMap,
        bolaReport,
        logicReport,
        shadowReport,
        surgeonReport,
      },
    };

    this.printAPIAuditSummary(report);
    return report;
  }

  /**
   * Calculate overall risk score from all reports
   */
  // Complexity: O(1) — amortized
  private calculateOverallRisk(
    bolaReport?: BOLATestReport,
    logicReport?: LogicAnalysisReport,
    shadowReport?: ShadowAPIReport
  ): number {
    let score = 0;
    let factors = 0;

    if (bolaReport) {
      score += (bolaReport.summary.criticalVulns * 25) + 
               (bolaReport.summary.highVulns * 15) + 
               (bolaReport.summary.mediumVulns * 5);
      factors++;
    }

    if (logicReport) {
      score += logicReport.summary.overallRiskScore;
      factors++;
    }

    if (shadowReport) {
      score += (shadowReport.summary.criticalFindings.length * 20) +
               (shadowReport.summary.debugEndpoints.length * 15);
      factors++;
    }

    return factors > 0 ? Math.min(100, Math.round(score / factors)) : 0;
  }

  /**
   * Generate recommendations based on findings
   */
  // Complexity: O(N*M) — nested iteration detected
  private generateAPIRecommendations(
    bolaReport?: BOLATestReport,
    logicReport?: LogicAnalysisReport,
    shadowReport?: ShadowAPIReport
  ): string[] {
    const recommendations: string[] = [];

    if (bolaReport?.summary.confirmedBOLA.length) {
      recommendations.push('🔴 CRITICAL: Implement proper authorization checks for all resource access');
      recommendations.push('🔴 Use ownership validation middleware before data retrieval');
    }

    if (logicReport?.summary.criticalExposures.length) {
      recommendations.push('🔴 CRITICAL: Remove sensitive data from API responses');
      recommendations.push('🟡 Implement response filtering/DTO patterns');
    }

    if (shadowReport?.summary.debugEndpoints.length) {
      recommendations.push('🔴 CRITICAL: Disable debug endpoints in production');
    }

    if (shadowReport?.summary.deprecatedAPIs.length) {
      recommendations.push('🟡 Deprecate and remove old API versions');
    }

    recommendations.push('💡 Implement API versioning strategy');
    recommendations.push('💡 Use API gateway for centralized security');
    recommendations.push('💡 Enable rate limiting on all endpoints');

    return recommendations;
  }

  /**
   * Print API audit summary
   */
  // Complexity: O(1) — amortized
  private printAPIAuditSummary(report: APISecurityAuditReport): void {
    const duration = (report.endTime.getTime() - report.startTime.getTime()) / 1000;

    console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║                  ⚔️ CYBERCODY API SECURITY AUDIT REPORT                      ║
╠══════════════════════════════════════════════════════════════════════════════╣
║ Target: ${report.target.substring(0, 65).padEnd(65)}║
║ Duration: ${duration.toFixed(2)}s                                                          ║
║ Overall Risk Score: ${report.summary.overallRiskScore.toString().padStart(3)}/100                                            ║
╠══════════════════════════════════════════════════════════════════════════════╣
║ FINDINGS:                                                                    ║
║   📡 API Endpoints: ${(report.apiMap?.totalEndpoints ?? 0).toString().padStart(5)}                                            ║
║   🎯 BOLA Targets:  ${(report.apiMap?.bolaTargets ?? 0).toString().padStart(5)}                                            ║
║   🔐 BOLA Vulns:    ${(report.bolaReport?.confirmedBOLA ?? 0).toString().padStart(5)}                                            ║
║   🧠 Data Leaks:    ${(report.logicReport?.totalExposures ?? 0).toString().padStart(5)}                                            ║
║   👻 Shadow APIs:   ${(report.shadowReport?.totalEndpoints ?? 0).toString().padStart(5)}                                            ║
║   🔧 Patches:       ${report.patchesGenerated.toString().padStart(5)}                                            ║
╠══════════════════════════════════════════════════════════════════════════════╣
║ CRITICAL ISSUES: ${report.summary.criticalIssues.toString().padStart(3)}                                                     ║
╚══════════════════════════════════════════════════════════════════════════════╝
`);
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // 👻 v1.2 GHOST AUDITOR METHODS
  // ═══════════════════════════════════════════════════════════════════════════════

  /**
   * Perform Ghost Audit - Multi-user session BOLA testing with stealth mode
   * 
   * This is the v1.2 "Ghost Auditor" scan that enables:
   * - Multi-user session management with JWT switching
   * - Cross-session BOLA/IDOR testing (User A accessing User B's data)
   * - PII detection in all API responses (50+ regex patterns)
   * - Stealth mode with adaptive rate limiting evasion
   * - Auto-generated remediation patches
   * 
   * @param target - URL to audit
   * @param options - Ghost audit options
   */
  // Complexity: O(N*M) — nested iteration detected
  async ghostAudit(target: string, options: GhostAuditOptions = {}): Promise<GhostAuditReport> {
    const startTime = new Date();
    console.log('\n👻 [GHOST AUDIT] Starting multi-session stealth security analysis...\n');

    // Authorization check
    console.log('🛡️  [0/7] ETHICAL GUARDRAILS CHECK');
    const authorization = this.guardrails.authorize(target);
    if (!authorization.authorized) {
      throw new Error(`Ghost Audit blocked by guardrails: ${authorization.reason}`);
    }
    console.log('   ✅ Target authorized for Ghost Audit\n');

    // Initialize modules
    const sessionOrchestrator = new SessionOrchestrator({
      maxProfiles: 10,
      parallelTests: 4,
    });

    const piiScanner = new PIIScanner({
      categories: options.piiCategories === 'all' ? undefined : options.piiCategories,
      minConfidence: options.sensitivityThreshold === 'high' ? 80 : options.sensitivityThreshold === 'medium' ? 50 : 30,
    });

    const stealthEngine = new StealthEngine({
      stealthLevel: options.stealthLevel ?? 'normal',
      timingStrategy: options.timingStrategy ?? 'adaptive',
      adaptiveThreshold: options.adaptiveThreshold ?? 3,
    });

    const remediationGen = new RemediationGenerator({
      framework: (options.framework ?? 'express') as RemediationFramework,
      includeTests: options.includeTests ?? true,
    });

    // Step 1: Register user profiles
    console.log('👥 [1/7] REGISTERING USER PROFILES');
    if (options.userProfiles && options.userProfiles.length > 0) {
      for (const profile of options.userProfiles) {
        sessionOrchestrator.addProfile(
          profile.name,
          profile.credentials?.token ?? '',
          profile.role,
          profile.authType
        );
      }
      console.log(`   ✅ Registered ${options.userProfiles.length} user profiles\n`);
    } else {
      // Create default test profiles if none provided
      sessionOrchestrator.addProfile('Test User A', options.userAToken ?? 'test-token-user-a', 'user', 'bearer');
      sessionOrchestrator.addProfile('Test User B', options.userBToken ?? 'test-token-user-b', 'user', 'bearer');
      console.log('   ✅ Registered 2 default test profiles (User A & User B)\n');
    }

    // Step 2: API Interception with stealth
    console.log('📡 [2/7] STEALTHY API INTERCEPTION');
    const interceptor = new APIInterceptor({ target });
    // SAFETY: async operation — wrap in try-catch for production resilience
    const apiMap = await interceptor.intercept(options.interactionSteps);

    console.log(`   ✅ Captured ${apiMap.requests.length} API requests (stealth mode: ${options.stealthLevel ?? 'normal'})`);
    console.log(`   ✅ Stealth stats: ${stealthEngine.getStats().successfulRequests} successful requests\n`);

    // Step 3: Cross-Session BOLA Testing
    console.log('🔐 [3/7] CROSS-SESSION BOLA TESTING');
    // Build endpoints for cross-session testing
    const endpointsForSession = apiMap.bolaTargets.map(t => ({
      endpoint: t.endpoint,
      method: t.method,
      resourceIds: [t.originalValue],
    }));
    
    // SAFETY: async operation — wrap in try-catch for production resilience
    const sessionReport = await sessionOrchestrator.runCrossSessionAudit(target, endpointsForSession);
    console.log(`   ✅ Tested ${sessionReport.testsRun} cross-session scenarios`);
    console.log(`   ✅ Found ${sessionReport.vulnerabilitiesFound.length} cross-session BOLA vulnerabilities\n`);

    // Step 4: PII Scanning
    console.log('🔍 [4/7] PII SCANNING ALL RESPONSES');
    // Scan each API response for PII
    let totalPIIDetections = 0;
    for (const request of apiMap.requests) {
      if (request.response?.body) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const result = await piiScanner.scanAPIResponse(
          request.url,
          request.method,
          request.response.body,
          request.response.headers ?? {}
        );
        totalPIIDetections += result.detections.length;
      }
    }
    
    const piiReport = piiScanner.generateReport(target, startTime);
    console.log(`   ✅ Scanned ${apiMap.requests.length} API responses`);
    console.log(`   ✅ Found ${piiReport.totalDetections} PII exposures`);
    console.log(`   ✅ Compliance violations: ${piiReport.complianceViolations.length} frameworks\n`);

    // Step 5: Run standard BOLA testing
    console.log('🎯 [5/7] STANDARD BOLA TESTING');
    const bolaTester = new BOLATester({
      apiMap,
      customIds: options.customIds,
    });
    
    // SAFETY: async operation — wrap in try-catch for production resilience
    const bolaReport = await bolaTester.test();
    console.log(`   ✅ Tested ${bolaReport.totalTests} ID variations`);
    console.log(`   ✅ Found ${bolaReport.vulnerabilitiesFound} BOLA vulnerabilities\n`);

    // Step 6: Generate Remediation Patches
    console.log('🔧 [6/7] GENERATING REMEDIATION PATCHES');
    
    // Generate from BOLA findings
    if (bolaReport.summary.confirmedBOLA.length > 0) {
      remediationGen.generateFromBOLAReport(bolaReport);
    }

    // Generate from cross-session findings  
    if (sessionReport.vulnerabilitiesFound.length > 0) {
      remediationGen.generateFromSessionReport(sessionReport);
    }

    // Generate from PII findings
    if (piiReport.totalDetections > 0) {
      remediationGen.generateFromPIIReport(piiReport);
    }

    const remediationReport = remediationGen.generateReport(target);
    console.log(`   ✅ Generated ${remediationReport.patches.length} security patches\n`);

    // Step 7: Generate final report
    console.log('📊 [7/7] GENERATING GHOST AUDIT REPORT\n');

    const stealthStats = stealthEngine.getStats();
    
    const report: GhostAuditReport = {
      target,
      version: '1.2.0',
      codename: 'The Ghost Auditor',
      startTime,
      endTime: new Date(),
      authorization,

      sessionReport: {
        profilesRegistered: sessionOrchestrator.getAllProfiles().length,
        crossSessionTests: sessionReport.testsRun,
        crossSessionVulns: sessionReport.vulnerabilitiesFound.length,
        tokenSwappingTests: 0,
      },

      piiReport: {
        totalScanned: apiMap.requests.length,
        totalDetections: piiReport.totalDetections,
        categoriesFound: Object.keys(piiReport.detectionsByCategory) as PIICategory[],
        complianceViolations: piiReport.complianceViolations.reduce((acc, cv) => {
          acc[cv.framework] = cv.details;
          return acc;
        }, {} as Record<string, string[]>),
        criticalExposures: piiReport.detectionsByRisk.critical ?? 0,
      },

      stealthReport: {
        level: options.stealthLevel ?? 'normal',
        timingStrategy: options.timingStrategy ?? 'adaptive',
        totalRequests: stealthStats.totalRequests,
        rateLimitsDetected: stealthStats.rateLimitedRequests,
        successRate: stealthStats.totalRequests > 0 
          ? stealthStats.successfulRequests / stealthStats.totalRequests 
          : 1,
      },

      bolaReport: {
        totalTests: bolaReport.totalTests,
        vulnerabilitiesFound: bolaReport.vulnerabilitiesFound,
        confirmedBOLA: bolaReport.summary.confirmedBOLA.length,
        criticalVulns: bolaReport.summary.criticalVulns,
      },

      remediationReport: {
        totalPatches: remediationReport.patches.length,
        frameworksCovered: [remediationReport.framework],
        patchTypes: [...new Set(remediationReport.patches.map(p => p.category))],
      },

      summary: {
        overallRiskScore: this.calculateGhostRiskScore(sessionReport, piiReport, bolaReport),
        criticalIssues: this.countCriticalIssues(sessionReport, piiReport, bolaReport),
        recommendations: this.generateGhostRecommendations(sessionReport, piiReport, bolaReport),
      },

      fullReports: {
        sessionOrchestrator: sessionReport,
        piiScanner: piiReport,
        stealthEngine: stealthStats as unknown as Record<string, unknown>,
        bolaTester: bolaReport,
        remediationGen: remediationReport,
        apiMap,
      },
    };

    this.printGhostAuditSummary(report);
    return report;
  }

  /**
   * Quick PII scan on a URL without full audit
   */
  // Complexity: O(N*M) — nested iteration detected
  async quickPIIScan(target: string, options: {
    categories?: PIICategory[] | 'all';
    sensitivityThreshold?: 'low' | 'medium' | 'high';
  } = {}): Promise<PIIScannerReport> {
    console.log('\n🔍 [QUICK PII SCAN] Scanning for PII exposure...\n');

    const authorization = this.guardrails.authorize(target);
    if (!authorization.authorized) {
      throw new Error(`PII Scan blocked: ${authorization.reason}`);
    }

    const startTime = new Date();
    const piiScanner = new PIIScanner({
      categories: options.categories === 'all' ? undefined : options.categories,
      minConfidence: options.sensitivityThreshold === 'high' ? 80 : options.sensitivityThreshold === 'medium' ? 50 : 30,
    });

    const interceptor = new APIInterceptor({ target });
    // SAFETY: async operation — wrap in try-catch for production resilience
    const apiMap = await interceptor.intercept();
    
    // Scan each response
    for (const request of apiMap.requests) {
      if (request.response?.body) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await piiScanner.scanAPIResponse(
          request.url,
          request.method,
          request.response.body,
          request.response.headers ?? {}
        );
      }
    }
    
    return piiScanner.generateReport(target, startTime);
  }

  /**
   * Register a user profile for multi-session testing
   */
  // Complexity: O(1)
  registerUserProfile(profile: UserProfile): void {
    const orchestrator = new SessionOrchestrator();
    orchestrator.addProfile(
      profile.name,
      profile.credentials?.token ?? '',
      profile.role,
      profile.authType
    );
    console.log(`✅ Registered profile: ${profile.name} (${profile.role})`);
  }

  /**
   * Calculate risk score for ghost audit
   */
  // Complexity: O(N) — linear iteration
  private calculateGhostRiskScore(
    sessionResult: SessionOrchestratorReport,
    piiReport: PIIScannerReport,
    bolaReport: BOLATestReport
  ): number {
    let score = 0;

    // Cross-session vulnerabilities are severe
    score += sessionResult.vulnerabilitiesFound.filter(v => v.severity === 'critical').length * 30;
    score += sessionResult.vulnerabilitiesFound.filter(v => v.severity === 'high').length * 20;

    // PII exposure by risk level
    score += (piiReport.detectionsByRisk.critical ?? 0) * 25;
    score += (piiReport.detectionsByRisk.high ?? 0) * 15;

    // Standard BOLA
    score += bolaReport.summary.criticalVulns * 25;
    score += bolaReport.summary.highVulns * 15;

    // Compliance violations
    score += piiReport.complianceViolations.length * 10;

    return Math.min(100, score);
  }

  /**
   * Count critical issues across all reports
   */
  // Complexity: O(N) — linear iteration
  private countCriticalIssues(
    sessionResult: SessionOrchestratorReport,
    piiReport: PIIScannerReport,
    bolaReport: BOLATestReport
  ): number {
    return (
      sessionResult.vulnerabilitiesFound.filter(v => v.severity === 'critical').length +
      (piiReport.detectionsByRisk.critical ?? 0) +
      bolaReport.summary.criticalVulns
    );
  }

  /**
   * Generate recommendations for ghost audit
   */
  // Complexity: O(N*M) — nested iteration detected
  private generateGhostRecommendations(
    sessionResult: SessionOrchestratorReport,
    piiReport: PIIScannerReport,
    bolaReport: BOLATestReport
  ): string[] {
    const recommendations: string[] = [];

    if (sessionResult.vulnerabilitiesFound.length > 0) {
      recommendations.push('🔴 CRITICAL: Implement per-user ownership validation on all resource endpoints');
      recommendations.push('🔴 Cross-session access detected - add user context checks to authorization middleware');
    }

    if (piiReport.totalDetections > 0) {
      recommendations.push('🔴 CRITICAL: Remove PII from API responses - implement response sanitization');
      recommendations.push('🟡 Implement data masking for sensitive fields (SSN, credit cards, etc.)');
    }

    // Check compliance violations by framework name
    const violatedFrameworks = piiReport.complianceViolations.map(cv => cv.framework);
    if (violatedFrameworks.includes('GDPR')) {
      recommendations.push('🔴 GDPR violation detected - implement consent management and data minimization');
    }

    if (violatedFrameworks.includes('PCI-DSS')) {
      recommendations.push('🔴 PCI-DSS violation - never expose card numbers in API responses');
    }

    if (bolaReport.summary.confirmedBOLA.length > 0) {
      recommendations.push('🔴 Implement IDOR protection middleware for all data-access endpoints');
    }

    recommendations.push('💡 Use the generated remediation patches as a starting point for fixes');
    recommendations.push('💡 Consider implementing API security gateway with built-in BOLA protection');

    return recommendations;
  }

  /**
   * Print ghost audit summary
   */
  // Complexity: O(N) — linear iteration
  private printGhostAuditSummary(report: GhostAuditReport): void {
    const duration = (report.endTime.getTime() - report.startTime.getTime()) / 1000;

    console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║                  👻 CYBERCODY GHOST AUDIT REPORT v1.2.0                      ║
║                        "The Ghost Auditor"                                   ║
╠══════════════════════════════════════════════════════════════════════════════╣
║ Target: ${report.target.substring(0, 65).padEnd(65)}║
║ Duration: ${duration.toFixed(2)}s                                                          ║
║ Overall Risk Score: ${report.summary.overallRiskScore.toString().padStart(3)}/100 ${this.getRiskBar(report.summary.overallRiskScore)}                              ║
╠══════════════════════════════════════════════════════════════════════════════╣
║ 👥 SESSION ORCHESTRATOR:                                                     ║
║   • Profiles Registered: ${report.sessionReport.profilesRegistered.toString().padStart(3)}                                           ║
║   • Cross-Session Tests: ${report.sessionReport.crossSessionTests.toString().padStart(5)}                                         ║
║   • Cross-Session Vulns: ${report.sessionReport.crossSessionVulns.toString().padStart(5)}                                         ║
╠══════════════════════════════════════════════════════════════════════════════╣
║ 🔍 PII SCANNER:                                                              ║
║   • Responses Scanned:   ${report.piiReport.totalScanned.toString().padStart(5)}                                         ║
║   • PII Exposures:       ${report.piiReport.totalDetections.toString().padStart(5)}                                         ║
║   • Critical Exposures:  ${report.piiReport.criticalExposures.toString().padStart(5)}                                         ║
║   • Compliance Issues:   ${Object.keys(report.piiReport.complianceViolations).length.toString().padStart(5)}                                         ║
╠══════════════════════════════════════════════════════════════════════════════╣
║ 🥷 STEALTH ENGINE:                                                           ║
║   • Stealth Level:       ${(report.stealthReport.level ?? 'normal').padEnd(20)}                          ║
║   • Total Requests:      ${report.stealthReport.totalRequests.toString().padStart(5)}                                         ║
║   • Rate Limits Hit:     ${report.stealthReport.rateLimitsDetected.toString().padStart(5)}                                         ║
║   • Success Rate:        ${(report.stealthReport.successRate * 100).toFixed(1)}%                                          ║
╠══════════════════════════════════════════════════════════════════════════════╣
║ 🔧 REMEDIATION:                                                              ║
║   • Patches Generated:   ${report.remediationReport.totalPatches.toString().padStart(5)}                                         ║
║   • Frameworks:          ${report.remediationReport.frameworksCovered.slice(0, 3).join(', ').padEnd(20)}                          ║
╠══════════════════════════════════════════════════════════════════════════════╣
║ 🚨 CRITICAL ISSUES: ${report.summary.criticalIssues.toString().padStart(3)}                                                    ║
╚══════════════════════════════════════════════════════════════════════════════╝
`);

    // Print top recommendations
    console.log('📋 TOP RECOMMENDATIONS:');
    for (const rec of report.summary.recommendations.slice(0, 5)) {
      console.log(`   ${rec}`);
    }
    console.log('');
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // 👁️ v1.3 VISUAL HACKER METHODS
  // ═══════════════════════════════════════════════════════════════════════════════

  /**
   * Visual Hack - Comprehensive visual security analysis
   * Combines phishing detection, hidden element scanning, and dashboard sync
   */
  // Complexity: O(N) — linear iteration
  async visualHack(target: string, options: VisualHackOptions = {}): Promise<VisualHackReport> {
    const startTime = new Date();
    console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║  👁️ CYBERCODY v1.3.0 - VISUAL HACKER INITIALIZED                            ║
║  Target: ${target.substring(0, 65).padEnd(65)}║
╚══════════════════════════════════════════════════════════════════════════════╝
`);

    // Authorization check
    const authorization = this.guardrails.authorize(target);
    if (!authorization.authorized) {
      throw new Error(`Visual Hack blocked: ${authorization.reason}`);
    }

    // Initialize dashboard sync if enabled
    let dashboardSync: DashboardSync | null = null;
    if (options.syncToDashboard) {
      console.log('📊 [0/4] CONNECTING TO MISTER MIND DASHBOARD');
      dashboardSync = new DashboardSync({
        dashboardUrl: options.dashboardUrl ?? 'localhost',
        dashboardPort: options.dashboardPort ?? 3847,
        autoConnect: true,
      });
      
      // SAFETY: async operation — wrap in try-catch for production resilience
      const connected = await dashboardSync.connect();
      if (connected) {
        console.log('   ✅ Connected to Mister Mind Dashboard\n');
        dashboardSync.startScan(target, 'visual');
      } else {
        console.log('   ⚠️ Dashboard not available - continuing without sync\n');
        dashboardSync = null;
      }
    }

    // Step 1: Phishing Detection
    console.log('🎣 [1/4] VISUAL PHISHING DETECTION');
    const phishingDetector = new VisualPhishingDetector({
      geminiApiKey: options.geminiApiKey,
      screenshotDir: options.screenshotDir ?? './screenshots',
      sensitivityLevel: options.sensitivityLevel ?? 'medium',
    });

    const urls = options.additionalUrls ? [target, ...options.additionalUrls] : [target];
    // SAFETY: async operation — wrap in try-catch for production resilience
    const phishingReport = await phishingDetector.scanUrls(urls);
    
    console.log(`   ✅ Scanned ${phishingReport.pagesScanned} pages`);
    console.log(`   ✅ Phishing risks detected: ${phishingReport.phishingDetected}`);
    console.log(`   ✅ Overall risk score: ${phishingReport.overallRiskScore}/100\n`);

    if (dashboardSync && phishingReport.phishingDetected > 0) {
      for (const page of phishingReport.highRiskPages) {
        dashboardSync.reportPhishingDetection({
          url: page.url,
          riskScore: page.riskAssessment.score,
          detectedBrands: page.visualAnalysis.detectedBrands,
          visualMismatch: page.visualAnalysis.visualMismatch,
        });
      }
    }

    // Step 2: Hidden Element Scanning
    console.log('🔍 [2/4] HIDDEN ELEMENT DISCOVERY');
    const hiddenFinder = new HiddenElementFinder({
      screenshotDir: options.screenshotDir ?? './screenshots/hidden',
      captureScreenshots: options.captureScreenshots ?? true,
      revealHiddenElements: options.revealHiddenElements ?? false,
      minRiskLevel: options.minHiddenRiskLevel ?? 'low',
    });

    // SAFETY: async operation — wrap in try-catch for production resilience
    const hiddenReport = await hiddenFinder.scanUrl(target);
    
    console.log(`   ✅ Total elements scanned: ${hiddenReport.totalElementsScanned}`);
    console.log(`   ✅ Hidden elements found: ${hiddenReport.hiddenElementsFound}`);
    console.log(`   ✅ Clickjacking vectors: ${hiddenReport.clickjackingVectors.length}`);
    console.log(`   ✅ Critical findings: ${hiddenReport.criticalFindings}\n`);

    if (dashboardSync && hiddenReport.clickjackingVectors.length > 0) {
      dashboardSync.reportClickjacking({
        url: target,
        vectorCount: hiddenReport.clickjackingVectors.length,
        hiddenElements: hiddenReport.hiddenElementsFound,
        riskScore: hiddenReport.riskScore,
      });
    }

    // Step 3: API Interception for context
    console.log('📡 [3/4] API CONTEXT GATHERING');
    const interceptor = new APIInterceptor({ target });
    // SAFETY: async operation — wrap in try-catch for production resilience
    const apiMap = await interceptor.intercept(options.interactionSteps);
    
    console.log(`   ✅ Captured ${apiMap.requests.length} API requests`);
    console.log(`   ✅ BOLA targets identified: ${apiMap.bolaTargets.length}\n`);

    // Step 4: Generate Visual Security Report
    console.log('📊 [4/4] GENERATING VISUAL SECURITY REPORT');
    const endTime = new Date();

    const report: VisualHackReport = {
      target,
      version: '1.3.0',
      codename: 'The Visual Hacker',
      startTime,
      endTime,
      authorization,

      phishingReport: {
        pagesScanned: phishingReport.pagesScanned,
        phishingDetected: phishingReport.phishingDetected,
        highRiskUrls: phishingReport.highRiskPages.map(p => p.url),
        detectedBrands: [...new Set(phishingReport.allAnalyses.flatMap(a => a.visualAnalysis.detectedBrands))],
        visualMismatches: phishingReport.allAnalyses.filter(a => a.visualAnalysis.visualMismatch).length,
        overallRiskScore: phishingReport.overallRiskScore,
      },

      hiddenElementReport: {
        totalScanned: hiddenReport.totalElementsScanned,
        hiddenElementsFound: hiddenReport.hiddenElementsFound,
        criticalFindings: hiddenReport.criticalFindings,
        highRiskFindings: hiddenReport.highRiskFindings,
        clickjackingVectors: hiddenReport.clickjackingVectors.length,
        hiddenForms: hiddenReport.hiddenForms.length,
        hiddenInputs: hiddenReport.hiddenInputs.length,
        hiddenIframes: hiddenReport.hiddenIframes.length,
        riskScore: hiddenReport.riskScore,
      },

      apiContext: {
        requestsCaptured: apiMap.requests.length,
        bolaTargets: apiMap.bolaTargets.length,
        authenticatedEndpoints: apiMap.statistics.authenticatedEndpoints,
      },

      summary: {
        overallRiskScore: this.calculateVisualRiskScore(phishingReport, hiddenReport),
        criticalIssues: phishingReport.highRiskPages.length + hiddenReport.criticalFindings,
        recommendations: this.generateVisualRecommendations(phishingReport, hiddenReport),
      },

      fullReports: {
        phishingReport,
        hiddenReport,
        apiMap,
      },
    };

    // Sync final report to dashboard
    if (dashboardSync) {
      const dashboardReport = dashboardSync.buildSecurityReport(
        target,
        'visual',
        startTime,
        endTime,
        {
          phishingReport: {
            phishingDetected: phishingReport.phishingDetected,
            highRiskPages: phishingReport.highRiskPages,
          },
          hiddenReport: {
            clickjackingVectors: hiddenReport.clickjackingVectors,
            criticalFindings: hiddenReport.criticalFindings,
          },
          statistics: {
            totalEndpoints: apiMap.requests.length,
            testedEndpoints: urls.length,
            phishingRisks: phishingReport.phishingDetected,
            clickjackingVectors: hiddenReport.clickjackingVectors.length,
          },
          recommendations: report.summary.recommendations,
        }
      );
      
      dashboardSync.completeScan(dashboardReport);
      console.log('   ✅ Report synced to Mister Mind Dashboard');
    }

    // Cleanup
    // SAFETY: async operation — wrap in try-catch for production resilience
    await phishingDetector.cleanup();
    // SAFETY: async operation — wrap in try-catch for production resilience
    await hiddenFinder.cleanup();
    if (dashboardSync) {
      dashboardSync.disconnect();
    }

    this.printVisualHackSummary(report);
    return report;
  }

  /**
   * Quick phishing scan on URLs
   */
  // Complexity: O(N)
  async quickPhishingScan(urls: string[], options: {
    geminiApiKey?: string;
    sensitivityLevel?: 'low' | 'medium' | 'high';
  } = {}): Promise<PhishingReport> {
    console.log('\n🎣 [QUICK PHISHING SCAN] Analyzing URLs for phishing indicators...\n');

    const detector = new VisualPhishingDetector({
      geminiApiKey: options.geminiApiKey,
      sensitivityLevel: options.sensitivityLevel ?? 'medium',
    });

    try {
      return await detector.scanUrls(urls);
    } finally {
      await detector.cleanup();
    }
  }

  /**
   * Quick hidden element scan
   */
  // Complexity: O(1)
  async quickHiddenScan(target: string, options: {
    captureScreenshots?: boolean;
    revealHiddenElements?: boolean;
  } = {}): Promise<HiddenElementReport> {
    console.log('\n🔍 [QUICK HIDDEN SCAN] Discovering hidden elements...\n');

    const finder = new HiddenElementFinder({
      captureScreenshots: options.captureScreenshots ?? true,
      revealHiddenElements: options.revealHiddenElements ?? false,
    });

    try {
      return await finder.scanUrl(target);
    } finally {
      await finder.cleanup();
    }
  }

  /**
   * Calculate visual risk score
   */
  // Complexity: O(1)
  private calculateVisualRiskScore(
    phishingReport: PhishingReport,
    hiddenReport: HiddenElementReport
  ): number {
    const phishingWeight = 0.6;
    const hiddenWeight = 0.4;
    
    return Math.round(
      (phishingReport.overallRiskScore * phishingWeight) +
      (hiddenReport.riskScore * hiddenWeight)
    );
  }

  /**
   * Generate visual security recommendations
   */
  // Complexity: O(N*M) — nested iteration detected
  private generateVisualRecommendations(
    phishingReport: PhishingReport,
    hiddenReport: HiddenElementReport
  ): string[] {
    const recommendations: string[] = [];

    if (phishingReport.phishingDetected > 0) {
      recommendations.push('🚨 CRITICAL: Phishing risks detected - do not enter credentials on flagged pages');
    }

    if (phishingReport.allAnalyses.some(a => a.visualAnalysis.visualMismatch)) {
      recommendations.push('⚠️ Visual/URL mismatch detected - likely brand impersonation attack');
    }

    if (hiddenReport.clickjackingVectors.length > 0) {
      recommendations.push('🔴 Clickjacking vectors found - implement X-Frame-Options and CSP headers');
    }

    if (hiddenReport.hiddenForms.length > 0) {
      recommendations.push('⚠️ Hidden forms detected - investigate for credential harvesting');
    }

    if (hiddenReport.hiddenIframes.length > 0) {
      recommendations.push('⚠️ Hidden iframes found - potential clickjacking or malware delivery');
    }

    if (hiddenReport.criticalFindings > 0) {
      recommendations.push('🔴 Critical hidden elements found - review immediately for security threats');
    }

    if (recommendations.length === 0) {
      recommendations.push('✅ No critical visual security issues detected');
    }

    recommendations.push('💡 Use Content-Security-Policy headers to prevent UI redressing attacks');
    recommendations.push('💡 Implement frame-ancestors directive to block clickjacking');

    return recommendations;
  }

  /**
   * Print visual hack summary
   */
  // Complexity: O(N) — linear iteration
  private printVisualHackSummary(report: VisualHackReport): void {
    const duration = (report.endTime.getTime() - report.startTime.getTime()) / 1000;

    console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║                  👁️ CYBERCODY VISUAL HACK REPORT v1.3.0                      ║
║                        "The Visual Hacker"                                   ║
╠══════════════════════════════════════════════════════════════════════════════╣
║ Target: ${report.target.substring(0, 65).padEnd(65)}║
║ Duration: ${duration.toFixed(2)}s                                                          ║
║ Overall Risk Score: ${report.summary.overallRiskScore.toString().padStart(3)}/100 ${this.getRiskBar(report.summary.overallRiskScore)}                              ║
╠══════════════════════════════════════════════════════════════════════════════╣
║ 🎣 PHISHING DETECTION:                                                       ║
║   • Pages Scanned:       ${report.phishingReport.pagesScanned.toString().padStart(5)}                                         ║
║   • Phishing Risks:      ${report.phishingReport.phishingDetected.toString().padStart(5)}                                         ║
║   • Visual Mismatches:   ${report.phishingReport.visualMismatches.toString().padStart(5)}                                         ║
║   • Risk Score:          ${report.phishingReport.overallRiskScore.toString().padStart(5)}/100                                     ║
╠══════════════════════════════════════════════════════════════════════════════╣
║ 🔍 HIDDEN ELEMENT ANALYSIS:                                                  ║
║   • Elements Scanned:    ${report.hiddenElementReport.totalScanned.toString().padStart(5)}                                         ║
║   • Hidden Elements:     ${report.hiddenElementReport.hiddenElementsFound.toString().padStart(5)}                                         ║
║   • Clickjacking Vectors:${report.hiddenElementReport.clickjackingVectors.toString().padStart(5)}                                         ║
║   • Critical Findings:   ${report.hiddenElementReport.criticalFindings.toString().padStart(5)}                                         ║
║   • Hidden Forms:        ${report.hiddenElementReport.hiddenForms.toString().padStart(5)}                                         ║
║   • Hidden Iframes:      ${report.hiddenElementReport.hiddenIframes.toString().padStart(5)}                                         ║
╠══════════════════════════════════════════════════════════════════════════════╣
║ 🚨 CRITICAL ISSUES: ${report.summary.criticalIssues.toString().padStart(3)}                                                    ║
╚══════════════════════════════════════════════════════════════════════════════╝
`);

    console.log('📋 TOP RECOMMENDATIONS:');
    for (const rec of report.summary.recommendations.slice(0, 5)) {
      console.log(`   ${rec}`);
    }
    console.log('');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 🧬 v25.0 TEMPORAL HEALER
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Full Lifecycle Automation: Discovery → Attack → Fix → Verification → PR
   * The Temporal Healer - Autonomous security vulnerability lifecycle management
   */
  // Complexity: O(N) — parallel execution
  async temporalHeal(sourceDir: string, options: TemporalHealOptions = {}): Promise<TemporalHealReport> {
    const startTime = new Date();
    console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║        🧬 CYBERCODY v25.0 - THE TEMPORAL HEALER                             ║
║        Full Lifecycle: Discovery → Attack → Fix → Verification → PR          ║
║        "The Future Belongs to Those Who Heal It"                             ║
╚══════════════════════════════════════════════════════════════════════════════╝
`);

    // Initialize modules
    const predictiveEngine = new PredictiveAttackSurface({
      sourceDir,
      geminiApiKey: options.geminiApiKey,
      enableAiAnalysis: options.enableAiAnalysis ?? true,
      analyzeDependencies: options.analyzeDependencies ?? true,
      analyzeGitHistory: options.analyzeGitHistory ?? true,
      riskThreshold: options.riskThreshold ?? 70,
    });

    const bugFixer = new AutonomousBugFixer({
      repoRoot: sourceDir,
      githubToken: options.githubToken,
      repoOwner: options.repoOwner,
      repoName: options.repoName,
      autoCreatePR: options.autoCreatePR ?? false,
      dryRun: options.dryRun ?? true,
      enableAiPatches: options.enableAiPatches ?? true,
      geminiApiKey: options.geminiApiKey,
      testCommand: options.testCommand,
      buildCommand: options.buildCommand,
      defaultLabels: options.prLabels ?? ['security', 'automated', 'cybercody'],
      defaultReviewers: options.prReviewers ?? [],
    });

    const hotSwapEngine = new HotSwapSelectorEngine({
      geminiApiKey: options.geminiApiKey,
      enableVisualMatching: options.enableVisualMatching ?? true,
      minSwapConfidence: options.minSwapConfidence ?? 70,
    });

    // Initialize all engines
    console.log('🔧 Initializing Temporal Healer engines...');
    // SAFETY: async operation — wrap in try-catch for production resilience
    await Promise.all([
      predictiveEngine.initialize(),
      bugFixer.initialize(),
      hotSwapEngine.initialize(),
    ]);

    // Connect to dashboard if enabled
    let dashboardSync: DashboardSync | null = null;
    if (options.syncToDashboard) {
      dashboardSync = new DashboardSync({
        dashboardUrl: options.dashboardUrl ?? 'localhost',
        dashboardPort: options.dashboardPort ?? 3847,
      });
      dashboardSync.connect();
    }

    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 1: DISCOVERY - Predictive Attack Surface Analysis
    // ═══════════════════════════════════════════════════════════════════════
    console.log('\n📡 PHASE 1: PREDICTIVE ATTACK SURFACE ANALYSIS');
    console.log('   Scanning codebase for vulnerabilities and predicting future risks...');
    
    // SAFETY: async operation — wrap in try-catch for production resilience
    const attackSurfaceAnalysis = await predictiveEngine.analyzeCodebase();
    
    console.log(`   ✅ Analyzed ${attackSurfaceAnalysis.filesAnalyzed} files`);
    console.log(`   🔍 Found ${attackSurfaceAnalysis.currentVulnerabilities.length} current vulnerabilities`);
    console.log(`   🔮 Predicted ${attackSurfaceAnalysis.predictedVulnerabilities.length} future vulnerabilities`);
    console.log(`   📦 Found ${attackSurfaceAnalysis.dependencyRisks.length} dependency risks`);
    console.log(`   📊 Current Risk Score: ${attackSurfaceAnalysis.overallRiskScore}/100`);
    console.log(`   📈 30-Day Predicted Risk: ${attackSurfaceAnalysis.predictedRiskScore30Days}/100`);
    console.log(`   📈 90-Day Predicted Risk: ${attackSurfaceAnalysis.predictedRiskScore90Days}/100`);

    // Report to dashboard
    if (dashboardSync) {
      dashboardSync.startScan(sourceDir, 'full');
      for (const vuln of attackSurfaceAnalysis.currentVulnerabilities) {
        dashboardSync.reportVulnerability({
          id: vuln.id,
          type: vuln.category,
          severity: vuln.currentRiskScore >= 80 ? 'critical' : vuln.currentRiskScore >= 60 ? 'high' : 'medium',
          target: sourceDir,
          endpoint: vuln.filePath,
          description: `${vuln.category}: ${vuln.codeSnippet.substring(0, 100)}`,
          timestamp: new Date(),
        });
      }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 2: PRIORITIZATION - Sort by risk and urgency
    // ═══════════════════════════════════════════════════════════════════════
    console.log('\n⚖️ PHASE 2: VULNERABILITY PRIORITIZATION');
    
    const prioritizedVulns = [...attackSurfaceAnalysis.currentVulnerabilities]
      .filter(v => v.currentRiskScore >= (options.riskThreshold ?? 70))
      .sort((a, b) => {
        // Sort by: critical first, then by days to vulnerability, then by risk score
        const aUrgency = a.estimatedDaysToVulnerability <= 30 ? 100 : 0;
        const bUrgency = b.estimatedDaysToVulnerability <= 30 ? 100 : 0;
        return (bUrgency + b.currentRiskScore) - (aUrgency + a.currentRiskScore);
      })
      .slice(0, options.maxVulnerabilitiesToFix ?? 10);

    console.log(`   📋 Prioritized ${prioritizedVulns.length} vulnerabilities for fixing`);

    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 3: AUTONOMOUS FIXING - Generate, Test, PR
    // ═══════════════════════════════════════════════════════════════════════
    console.log('\n🩹 PHASE 3: AUTONOMOUS BUG FIXING');
    
    const lifecycleResults: LifecycleResult[] = [];
    
    for (let i = 0; i < prioritizedVulns.length; i++) {
      const vuln = prioritizedVulns[i];
      if (!vuln) continue;
      
      console.log(`\n   [${i + 1}/${prioritizedVulns.length}] Processing: ${vuln.category} in ${vuln.filePath}`);
      
      try {
        const result = await bugFixer.executeLifecycle(vuln);
        lifecycleResults.push(result);
        
        if (result.success) {
          console.log(`      ✅ Patch generated and verified`);
          if (result.pullRequest?.prUrl) {
            console.log(`      🚀 PR Created: ${result.pullRequest.prUrl}`);
          }
        } else {
          console.log(`      ⚠️ Failed at: ${result.failedAt} - ${result.error}`);
        }

        // Report patch to dashboard
        if (dashboardSync && result.patch) {
          dashboardSync.sendEvent({
            type: 'vulnerability:found',
            timestamp: new Date(),
            source: 'cybercody',
            version: '25.0.0',
            data: {
              vulnerabilityId: vuln.id,
              patchId: result.patch.id,
              success: result.success,
            },
          });
        }
      } catch (error) {
        console.log(`      ❌ Error: ${error instanceof Error ? error.message : 'Unknown'}`);
      }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 4: HOT-SWAP MEMORY - Learn from this session
    // ═══════════════════════════════════════════════════════════════════════
    console.log('\n🧠 PHASE 4: LEARNING & MEMORY UPDATE');
    
    const hotSwapReport = hotSwapEngine.generateReport();
    console.log(`   📊 Total selectors monitored: ${hotSwapReport.totalMonitored}`);
    console.log(`   🔄 Mutations detected: ${hotSwapReport.totalMutations}`);
    console.log(`   ✅ Successful swaps: ${hotSwapReport.successfulSwaps}`);

    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 5: REPORT GENERATION
    // ═══════════════════════════════════════════════════════════════════════
    const endTime = new Date();
    const duration = (endTime.getTime() - startTime.getTime()) / 1000;

    const successfulFixes = lifecycleResults.filter(r => r.success).length;
    const prsCreated = lifecycleResults.filter(r => r.pullRequest?.prNumber).length;

    const report: TemporalHealReport = {
      sourceDir,
      startTime,
      endTime,
      durationSeconds: duration,
      
      discovery: {
        filesAnalyzed: attackSurfaceAnalysis.filesAnalyzed,
        totalLinesOfCode: attackSurfaceAnalysis.totalLinesOfCode,
        currentVulnerabilities: attackSurfaceAnalysis.currentVulnerabilities.length,
        predictedVulnerabilities: attackSurfaceAnalysis.predictedVulnerabilities.length,
        dependencyRisks: attackSurfaceAnalysis.dependencyRisks.length,
        overallRiskScore: attackSurfaceAnalysis.overallRiskScore,
        predictedRiskScore30Days: attackSurfaceAnalysis.predictedRiskScore30Days,
        predictedRiskScore90Days: attackSurfaceAnalysis.predictedRiskScore90Days,
        hotSpots: attackSurfaceAnalysis.hotSpots,
      },
      
      fixing: {
        vulnerabilitiesProcessed: prioritizedVulns.length,
        successfulFixes,
        failedFixes: prioritizedVulns.length - successfulFixes,
        patchesGenerated: lifecycleResults.filter(r => r.patch).length,
        testsGenerated: lifecycleResults.reduce((sum, r) => sum + (r.patch?.tests.length ?? 0), 0),
        prsCreated,
      },
      
      hotSwap: {
        selectorsMonitored: hotSwapReport.totalMonitored,
        mutationsDetected: hotSwapReport.totalMutations,
        successfulSwaps: hotSwapReport.successfulSwaps,
        failedSwaps: hotSwapReport.failedSwaps,
      },
      
      lifecycleResults,
      attackSurfaceAnalysis,
      
      summary: {
        status: successfulFixes > 0 ? 'HEALED' : 'NEEDS_ATTENTION',
        healingRate: prioritizedVulns.length > 0 ? (successfulFixes / prioritizedVulns.length) * 100 : 100,
        riskReduction: attackSurfaceAnalysis.overallRiskScore - 
          (attackSurfaceAnalysis.overallRiskScore * (successfulFixes / Math.max(1, attackSurfaceAnalysis.currentVulnerabilities.length))),
        recommendations: attackSurfaceAnalysis.recommendations,
      },
    };

    // Complete dashboard sync
    if (dashboardSync) {
      const dashboardReport: DashboardSecurityReport = {
        id: `temporal-heal-${Date.now()}`,
        target: sourceDir,
        scanType: 'full',
        startTime,
        endTime,
        healthScore: {
          overall: 100 - attackSurfaceAnalysis.overallRiskScore,
          categories: {
            bola: 80,
            injection: 80,
            pii: 90,
            phishing: 95,
            clickjacking: 95,
            authentication: 80,
            authorization: 80,
            dataExposure: 85,
          },
          trend: attackSurfaceAnalysis.overallRiskScore > attackSurfaceAnalysis.predictedRiskScore30Days ? 'improving' : 'stable',
          lastUpdated: new Date(),
        },
        vulnerabilities: attackSurfaceAnalysis.currentVulnerabilities.map(v => ({
          id: v.id,
          type: v.category,
          severity: v.currentRiskScore >= 80 ? 'critical' as const : v.currentRiskScore >= 60 ? 'high' as const : 'medium' as const,
          target: sourceDir,
          endpoint: v.filePath,
          description: v.codeSnippet,
          timestamp: new Date(),
        })),
        statistics: {
          totalEndpoints: attackSurfaceAnalysis.filesAnalyzed,
          testedEndpoints: attackSurfaceAnalysis.filesAnalyzed,
          totalVulnerabilities: attackSurfaceAnalysis.currentVulnerabilities.length,
          criticalCount: attackSurfaceAnalysis.currentVulnerabilities.filter(v => v.currentRiskScore >= 80).length,
          highCount: attackSurfaceAnalysis.currentVulnerabilities.filter(v => v.currentRiskScore >= 60 && v.currentRiskScore < 80).length,
          mediumCount: attackSurfaceAnalysis.currentVulnerabilities.filter(v => v.currentRiskScore < 60).length,
          lowCount: 0,
          piiExposures: 0,
          phishingRisks: 0,
          clickjackingVectors: 0,
        },
        recommendations: attackSurfaceAnalysis.recommendations,
      };
      dashboardSync.completeScan(dashboardReport);
      dashboardSync.disconnect();
    }

    // Print summary
    this.printTemporalHealSummary(report);

    // Cleanup
    // SAFETY: async operation — wrap in try-catch for production resilience
    await hotSwapEngine.cleanup();

    return report;
  }

  /**
   * Print Temporal Heal summary
   */
  // Complexity: O(N*M) — nested iteration detected
  private printTemporalHealSummary(report: TemporalHealReport): void {
    const statusEmoji = report.summary.status === 'HEALED' ? '✅' : '⚠️';
    
    console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║            🧬 TEMPORAL HEALER REPORT v25.0                                  ║
║            "The Future Belongs to Those Who Heal It"                         ║
╠══════════════════════════════════════════════════════════════════════════════╣
║ Source: ${report.sourceDir.substring(0, 64).padEnd(64)}║
║ Duration: ${report.durationSeconds.toFixed(2)}s                                                          ║
║ Status: ${statusEmoji} ${report.summary.status.padEnd(60)}║
╠══════════════════════════════════════════════════════════════════════════════╣
║ 📡 DISCOVERY PHASE:                                                          ║
║   • Files Analyzed:         ${report.discovery.filesAnalyzed.toString().padStart(5)}                                      ║
║   • Lines of Code:          ${report.discovery.totalLinesOfCode.toString().padStart(5)}                                      ║
║   • Current Vulnerabilities:${report.discovery.currentVulnerabilities.toString().padStart(5)}                                      ║
║   • Predicted (Future):     ${report.discovery.predictedVulnerabilities.toString().padStart(5)}                                      ║
║   • Dependency Risks:       ${report.discovery.dependencyRisks.toString().padStart(5)}                                      ║
║   • Current Risk Score:     ${report.discovery.overallRiskScore.toString().padStart(5)}/100                                  ║
║   • 30-Day Predicted:       ${report.discovery.predictedRiskScore30Days.toString().padStart(5)}/100                                  ║
║   • 90-Day Predicted:       ${report.discovery.predictedRiskScore90Days.toString().padStart(5)}/100                                  ║
╠══════════════════════════════════════════════════════════════════════════════╣
║ 🩹 FIXING PHASE:                                                             ║
║   • Vulnerabilities Processed: ${report.fixing.vulnerabilitiesProcessed.toString().padStart(3)}                                    ║
║   • Successful Fixes:          ${report.fixing.successfulFixes.toString().padStart(3)}                                    ║
║   • Failed Fixes:              ${report.fixing.failedFixes.toString().padStart(3)}                                    ║
║   • Patches Generated:         ${report.fixing.patchesGenerated.toString().padStart(3)}                                    ║
║   • Tests Generated:           ${report.fixing.testsGenerated.toString().padStart(3)}                                    ║
║   • Pull Requests Created:     ${report.fixing.prsCreated.toString().padStart(3)}                                    ║
╠══════════════════════════════════════════════════════════════════════════════╣
║ 📊 HEALING METRICS:                                                          ║
║   • Healing Rate:        ${report.summary.healingRate.toFixed(1).padStart(6)}%                                         ║
║   • Risk Reduction:      ${report.summary.riskReduction.toFixed(1).padStart(6)} points                                    ║
╠══════════════════════════════════════════════════════════════════════════════╣
║ 🛡️ MisterMind is the Shield. ⚔️ CyberCody is the Sword.                      ║
║ 🧬 The Temporal Healer makes them ETERNAL.                                   ║
╚══════════════════════════════════════════════════════════════════════════════╝
`);

    if (report.discovery.hotSpots.length > 0) {
      console.log('🔥 HOT SPOTS (Highest Risk Areas):');
      for (const spot of report.discovery.hotSpots.slice(0, 5)) {
        console.log(`   • ${spot.path} - Risk: ${spot.riskScore}/100, Vulns: ${spot.vulnerabilityCount}`);
      }
      console.log('');
    }

    if (report.summary.recommendations.length > 0) {
      console.log('📋 RECOMMENDATIONS:');
      for (const rec of report.summary.recommendations.slice(0, 5)) {
        console.log(`   ${rec}`);
      }
      console.log('');
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 📊 v25.0 TYPES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Temporal Heal Options
 */
export interface TemporalHealOptions {
  /** Gemini API key */
  geminiApiKey?: string;
  /** Enable AI-powered analysis */
  enableAiAnalysis?: boolean;
  /** Analyze dependencies */
  analyzeDependencies?: boolean;
  /** Analyze git history */
  analyzeGitHistory?: boolean;
  /** Risk threshold for fixing (0-100) */
  riskThreshold?: number;
  /** Max vulnerabilities to fix in one run */
  maxVulnerabilitiesToFix?: number;
  /** GitHub token for PR creation */
  githubToken?: string;
  /** Repository owner */
  repoOwner?: string;
  /** Repository name */
  repoName?: string;
  /** Auto-create PRs */
  autoCreatePR?: boolean;
  /** Dry run mode */
  dryRun?: boolean;
  /** Enable AI-powered patches */
  enableAiPatches?: boolean;
  /** Test command */
  testCommand?: string;
  /** Build command */
  buildCommand?: string;
  /** PR labels */
  prLabels?: string[];
  /** PR reviewers */
  prReviewers?: string[];
  /** Enable visual matching */
  enableVisualMatching?: boolean;
  /** Min swap confidence */
  minSwapConfidence?: number;
  /** Sync to dashboard */
  syncToDashboard?: boolean;
  /** Dashboard URL */
  dashboardUrl?: string;
  /** Dashboard port */
  dashboardPort?: number;
}

/**
 * Temporal Heal Report
 */
export interface TemporalHealReport {
  sourceDir: string;
  startTime: Date;
  endTime: Date;
  durationSeconds: number;
  
  discovery: {
    filesAnalyzed: number;
    totalLinesOfCode: number;
    currentVulnerabilities: number;
    predictedVulnerabilities: number;
    dependencyRisks: number;
    overallRiskScore: number;
    predictedRiskScore30Days: number;
    predictedRiskScore90Days: number;
    hotSpots: Array<{
      path: string;
      riskScore: number;
      vulnerabilityCount: number;
    }>;
  };
  
  fixing: {
    vulnerabilitiesProcessed: number;
    successfulFixes: number;
    failedFixes: number;
    patchesGenerated: number;
    testsGenerated: number;
    prsCreated: number;
  };
  
  hotSwap: {
    selectorsMonitored: number;
    mutationsDetected: number;
    successfulSwaps: number;
    failedSwaps: number;
  };
  
  lifecycleResults: LifecycleResult[];
  attackSurfaceAnalysis: AttackSurfaceAnalysis;
  
  summary: {
    status: 'HEALED' | 'NEEDS_ATTENTION';
    healingRate: number;
    riskReduction: number;
    recommendations: string[];
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 📊 v1.1 TYPES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * API Security Audit Report
 */
export interface APISecurityAuditReport {
  target: string;
  startTime: Date;
  endTime: Date;
  authorization: { authorized: boolean; reason: string };
  
  apiMap?: {
    totalEndpoints: number;
    totalRequests: number;
    bolaTargets: number;
    authTokensFound: number;
  };
  
  bolaReport?: {
    totalTests: number;
    vulnerabilitiesFound: number;
    confirmedBOLA: number;
    criticalVulns: number;
  };
  
  logicReport?: {
    totalExposures: number;
    totalLogicFlaws: number;
    overallRiskScore: number;
    complianceViolations: Record<string, number>;
  };
  
  shadowReport?: {
    totalEndpoints: number;
    criticalFindings: number;
    deprecatedAPIs: number;
    debugEndpoints: number;
  };
  
  patchesGenerated: number;
  
  summary: {
    overallRiskScore: number;
    criticalIssues: number;
    recommendations: string[];
  };
  
  fullReports: {
    apiMap?: APIMap;
    bolaReport?: BOLATestReport;
    logicReport?: LogicAnalysisReport;
    shadowReport?: ShadowAPIReport;
    surgeonReport?: SurgeonReport;
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 👻 v1.2 TYPES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Ghost Audit Options
 */
export interface GhostAuditOptions {
  /** User profiles for multi-session testing */
  userProfiles?: UserProfile[];
  /** Token for User A (if not using profiles) */
  userAToken?: string;
  /** Token for User B (if not using profiles) */
  userBToken?: string;
  /** Auto-rotate tokens when expired */
  autoRotateTokens?: boolean;
  /** Role hierarchy for privilege testing */
  roleHierarchy?: string[];
  /** Test all role combinations */
  testAllRoleCombinations?: boolean;
  /** Include token swapping tests */
  includeTokenSwapping?: boolean;
  /** Custom payloads for cross-session testing */
  customPayloads?: string[];
  /** PII categories to scan for */
  piiCategories?: PIICategory[] | 'all';
  /** Sensitivity threshold for PII detection */
  sensitivityThreshold?: 'low' | 'medium' | 'high';
  /** Enable AI-powered PII analysis */
  enableAIAnalysis?: boolean;
  /** Stealth level for avoiding detection */
  stealthLevel?: StealthLevel;
  /** Timing strategy for requests */
  timingStrategy?: TimingStrategy;
  /** Adaptive threshold for rate limiting */
  adaptiveThreshold?: number;
  /** Target framework for patch generation */
  framework?: Framework;
  /** Include test files in patches */
  includeTests?: boolean;
  /** Generate documentation for patches */
  generateDocs?: boolean;
  /** Custom user IDs to test for BOLA */
  customIds?: string[];
  /** Actions to perform during interception */
  interactionSteps?: Array<{ action: string; selector?: string; value?: string; url?: string }>;
}

/**
 * Ghost Audit Report - Full output from v1.2 audit
 */
export interface GhostAuditReport {
  target: string;
  version: string;
  codename: string;
  startTime: Date;
  endTime: Date;
  authorization: { authorized: boolean; reason: string };

  sessionReport: {
    profilesRegistered: number;
    crossSessionTests: number;
    crossSessionVulns: number;
    tokenSwappingTests: number;
  };

  piiReport: {
    totalScanned: number;
    totalDetections: number;
    categoriesFound: PIICategory[];
    complianceViolations: Record<string, string[]>;
    criticalExposures: number;
  };

  stealthReport: {
    level: StealthLevel;
    timingStrategy: TimingStrategy;
    totalRequests: number;
    rateLimitsDetected: number;
    successRate: number;
  };

  bolaReport: {
    totalTests: number;
    vulnerabilitiesFound: number;
    confirmedBOLA: number;
    criticalVulns: number;
  };

  remediationReport: {
    totalPatches: number;
    frameworksCovered: string[];
    patchTypes: string[];
  };

  summary: {
    overallRiskScore: number;
    criticalIssues: number;
    recommendations: string[];
  };

  fullReports: {
    sessionOrchestrator: SessionOrchestratorReport;
    piiScanner: PIIScannerReport;
    stealthEngine: Record<string, unknown>;
    bolaTester: BOLATestReport;
    remediationGen: RemediationReport;
    apiMap: APIMap;
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 👁️ v1.3 TYPES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Visual Hack Options
 */
export interface VisualHackOptions {
  /** Gemini API key for AI-powered analysis */
  geminiApiKey?: string;
  /** Additional URLs to scan for phishing */
  additionalUrls?: string[];
  /** Screenshot directory */
  screenshotDir?: string;
  /** Sensitivity level for phishing detection */
  sensitivityLevel?: 'low' | 'medium' | 'high';
  /** Capture screenshots of findings */
  captureScreenshots?: boolean;
  /** Reveal hidden elements in screenshots */
  revealHiddenElements?: boolean;
  /** Minimum risk level for hidden elements */
  minHiddenRiskLevel?: 'info' | 'low' | 'medium' | 'high' | 'critical';
  /** Sync results to Mister Mind Dashboard */
  syncToDashboard?: boolean;
  /** Dashboard URL */
  dashboardUrl?: string;
  /** Dashboard port */
  dashboardPort?: number;
  /** Interaction steps for API capture */
  interactionSteps?: Array<{ action: string; selector?: string; value?: string; url?: string }>;
}

/**
 * Visual Hack Report - Full output from v1.3 audit
 */
export interface VisualHackReport {
  target: string;
  version: string;
  codename: string;
  startTime: Date;
  endTime: Date;
  authorization: { authorized: boolean; reason: string };

  phishingReport: {
    pagesScanned: number;
    phishingDetected: number;
    highRiskUrls: string[];
    detectedBrands: string[];
    visualMismatches: number;
    overallRiskScore: number;
  };

  hiddenElementReport: {
    totalScanned: number;
    hiddenElementsFound: number;
    criticalFindings: number;
    highRiskFindings: number;
    clickjackingVectors: number;
    hiddenForms: number;
    hiddenInputs: number;
    hiddenIframes: number;
    riskScore: number;
  };

  apiContext: {
    requestsCaptured: number;
    bolaTargets: number;
    authenticatedEndpoints: number;
  };

  summary: {
    overallRiskScore: number;
    criticalIssues: number;
    recommendations: string[];
  };

  fullReports: {
    phishingReport: PhishingReport;
    hiddenReport: HiddenElementReport;
    apiMap: APIMap;
  };
}

// Re-export v1.1 modules for direct access
export {
  APIInterceptor,
  BOLATester,
  LogicAnalyzer,
  SurgeonIntegration,
  ShadowAPIDiscovery,
};

// Re-export v1.2 modules for direct access
export {
  SessionOrchestrator,
  PIIScanner,
  StealthEngine,
  RemediationGenerator,
};

// Re-export v1.3 modules for direct access
export {
  VisualPhishingDetector,
  HiddenElementFinder,
  DashboardSync,
};

// Export v1.2 types
export type {
  UserProfile,
  SessionOrchestratorReport,
  CrossSessionVulnerability,
  PIIDetection,
  PIIScannerReport,
  PIICategory,
  PIIRiskLevel,
  StealthResponse,
  StealthLevel,
  TimingStrategy,
  StealthStats,
  GeneratedPatch,
  RemediationReport,
};

// Export v1.3 types
export type {
  PhishingAnalysis,
  PhishingReport,
  BrandSignature,
  HiddenElement,
  HiddenElementReport,
  ClickjackingVector,
  SecurityHealthScore,
  DashboardSecurityReport,
  VulnerabilitySummary,
};

// Export v25.0 modules
export { HotSwapSelectorEngine } from '../../qantum/SaaS-Framework/01_ECOSYSTEM_APPS/MisterMind-Site/dpengeneering/cybercody/src/modules/hot-swap-selector';
export type { SelectorFingerprint, HotSwapResult, HotSwapReport, SelectorMemory } from '../../qantum/SaaS-Framework/01_ECOSYSTEM_APPS/MisterMind-Site/dpengeneering/cybercody/src/modules/hot-swap-selector';

export { PredictiveAttackSurface } from '../../qantum/SaaS-Framework/01_ECOSYSTEM_APPS/MisterMind-Site/dpengeneering/cybercody/src/modules/predictive-attack-surface';
export type { VulnerabilityTrend, AttackSurfaceAnalysis, VulnerabilityCategory, DependencyRisk } from '../../qantum/SaaS-Framework/01_ECOSYSTEM_APPS/MisterMind-Site/dpengeneering/cybercody/src/modules/predictive-attack-surface';

export { AutonomousBugFixer } from '../../qantum/SaaS-Framework/01_ECOSYSTEM_APPS/MisterMind-Site/dpengeneering/cybercody/src/modules/autonomous-bug-fixer';
export type { GeneratedPatch as BugPatch, PatchVerification, PullRequestDetails, LifecycleResult } from '../../qantum/SaaS-Framework/01_ECOSYSTEM_APPS/MisterMind-Site/dpengeneering/cybercody/src/modules/autonomous-bug-fixer';

// Export main class and modules
export { ReconModule } from './modules/recon.js';
export { FuzzingEngine } from './modules/fuzzing.js';
export { VulnerabilitySnapshotModule } from './modules/snapshot.js';
export { EthicalGuardrails } from './modules/guardrails.js';
export * from '../../qantum/SaaS-Framework/01_ECOSYSTEM_APPS/MrMindQATool/src/index';

export default CyberCody;
