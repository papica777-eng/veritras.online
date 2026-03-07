/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║               AUTONOMOUS FEEDBACK LOOP - THE SELF-CORRECTING ENGINE           ║
 * ║                                                                               ║
 * ║     "Change → Verify → Report → Learn. The eternal cycle of improvement."     ║
 * ║                                                                               ║
 * ║  Created: 2026-01-01 | QAntum Prime v28.1.0 SUPREME                          ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

import * as fs from 'fs';
import * as path from 'path';
import { EventEmitter } from 'events';
import { VSCodeBridge, FileChangeEvent, VerificationResult, getVSCodeBridge } from './VSCodeBridge';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════════════════

export interface FeedbackReport {
  timestamp: number;
  file: string;
  changeType: 'created' | 'modified' | 'deleted';
  verification: VerificationResult;
  action: 'approved' | 'warning' | 'rejected' | 'pending';
  suggestions: string[];
  autoFixed: boolean;
  duration: number;
}

export interface LoopConfig {
  autoFix: boolean;
  strictMode: boolean;
  reportToTerminal: boolean;
  saveReports: boolean;
  reportsPath: string;
  maxReportsToKeep: number;
  notifyOnError: boolean;
  learnFromChanges: boolean;
}

export interface LearningEntry {
  pattern: string;
  outcome: 'success' | 'failure' | 'warning';
  frequency: number;
  lastSeen: number;
  autoAction?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// AUTONOMOUS FEEDBACK LOOP
// ═══════════════════════════════════════════════════════════════════════════════

export class AutonomousFeedbackLoop extends EventEmitter {
  private bridge: VSCodeBridge;
  private config: LoopConfig;
  private reports: FeedbackReport[] = [];
  private learningMemory: Map<string, LearningEntry> = new Map();
  private isRunning: boolean = false;
  private stats = {
    totalChanges: 0,
    approved: 0,
    warnings: 0,
    rejected: 0,
    autoFixed: 0,
  };

  constructor(config: Partial<LoopConfig> = {}) {
    super();

    this.config = {
      autoFix: config.autoFix ?? false,
      strictMode: config.strictMode ?? false,
      reportToTerminal: config.reportToTerminal ?? true,
      saveReports: config.saveReports ?? true,
      reportsPath: config.reportsPath || './data/feedback-reports',
      maxReportsToKeep: config.maxReportsToKeep || 100,
      notifyOnError: config.notifyOnError ?? true,
      learnFromChanges: config.learnFromChanges ?? true,
    };

    this.bridge = getVSCodeBridge();
    this.loadLearningMemory();
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // LIFECYCLE
  // ═══════════════════════════════════════════════════════════════════════════════

  // Complexity: O(1) — amortized
  public async start(): Promise<void> {
    if (this.isRunning) return;

    this.isRunning = true;
    this.log('\n🔄 AUTONOMOUS FEEDBACK LOOP ACTIVATED');
    this.log('═'.repeat(60));
    this.log('   Mode: ' + (this.config.strictMode ? 'STRICT' : 'STANDARD'));
    this.log('   Auto-Fix: ' + (this.config.autoFix ? 'ENABLED' : 'DISABLED'));
    this.log('   Learning: ' + (this.config.learnFromChanges ? 'ENABLED' : 'DISABLED'));
    this.log('═'.repeat(60));

    // Subscribe to bridge events
    this.bridge.on('file:changed', this.handleFileChange.bind(this));
    this.bridge.on('file:verified', this.handleVerificationResult.bind(this));

    // Start the bridge if not already started
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.bridge.start();

    this.emit('loop:started', { timestamp: Date.now() });
  }

  // Complexity: O(1)
  public stop(): void {
    if (!this.isRunning) return;

    this.isRunning = false;
    this.bridge.removeAllListeners('file:changed');
    this.bridge.removeAllListeners('file:verified');

    this.saveLearningMemory();
    this.printStats();

    this.log('\n🛑 Feedback loop stopped');
    this.emit('loop:stopped', { timestamp: Date.now(), stats: this.stats });
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // EVENT HANDLERS
  // ═══════════════════════════════════════════════════════════════════════════════

  // Complexity: O(N)
  private async handleFileChange(event: FileChangeEvent): Promise<void> {
    const startTime = Date.now();
    this.stats.totalChanges++;

    if (event.type === 'deleted') {
      this.logChange(event, 'info');
      return;
    }

    // Verification will be handled by the bridge, we wait for the result
    this.emit('change:detected', event);
  }

  // Complexity: O(1) — amortized
  private async handleVerificationResult(data: { filePath: string; result: VerificationResult }): Promise<void> {
    const { filePath, result } = data;
    const relativePath = path.relative(process.cwd(), filePath);
    const startTime = Date.now();

    // Determine action based on verification result
    let action: FeedbackReport['action'];
    let autoFixed = false;

    if (!result.valid) {
      action = 'rejected';
      this.stats.rejected++;

      if (this.config.autoFix) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        autoFixed = await this.attemptAutoFix(filePath, result);
        if (autoFixed) {
          this.stats.autoFixed++;
          action = 'approved';
        }
      }

      if (!autoFixed && this.config.notifyOnError) {
        this.notifyError(relativePath, result);
      }
    } else if (result.warnings.length > 0) {
      action = 'warning';
      this.stats.warnings++;
    } else {
      action = 'approved';
      this.stats.approved++;
    }

    // Create report
    const report: FeedbackReport = {
      timestamp: Date.now(),
      file: relativePath,
      changeType: 'modified',
      verification: result,
      action,
      suggestions: result.suggestions,
      autoFixed,
      duration: Date.now() - startTime,
    };

    this.reports.push(report);

    // Report to terminal
    if (this.config.reportToTerminal) {
      this.printReport(report);
    }

    // Save report
    if (this.config.saveReports) {
      // SAFETY: async operation — wrap in try-catch for production resilience
      await this.saveReport(report);
    }

    // Learn from this change
    if (this.config.learnFromChanges) {
      this.learnFromChange(report);
    }

    // Emit events
    this.emit('feedback:complete', report);

    // Cleanup old reports
    this.cleanupReports();
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // AUTO-FIX
  // ═══════════════════════════════════════════════════════════════════════════════

  // Complexity: O(N*M) — nested iteration detected
  private async attemptAutoFix(filePath: string, result: VerificationResult): Promise<boolean> {
    this.log(`   🔧 Attempting auto-fix for: ${path.basename(filePath)}`);

    try {
      let content = await fs.promises.readFile(filePath, 'utf-8');
      let fixed = false;

      // Fix common issues
      for (const error of result.errors) {
        if (error.includes('Invalid JSON')) {
          // Try to fix JSON
          try {
            // Remove trailing commas
            content = content.replace(/,(\s*[}\]])/g, '$1');
            // Remove comments
            content = content.replace(/\/\/.*$/gm, ');
            // Parse to validate
            JSON.parse(content);
            fixed = true;
          } catch {
            // Can't auto-fix this JSON
          }
        }

        if (error.includes('undefined')) {
          // Add optional chaining where possible
          content = content.replace(/(\w+)\.(\w+)/g, (match, obj, prop) => {
            // Don't modify if already has optional chaining
            if (match.includes('?.')) return match;
            // Check if this might be a problematic access
            return match; // Be conservative, don't auto-fix undefined issues
          });
        }
      }

      if (fixed) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await fs.promises.writeFile(filePath, content);
        this.log(`   ✅ Auto-fix applied successfully`);
        return true;
      }

      return false;
    } catch (error) {
      this.log(`   ⚠️ Auto-fix failed: ${error}`);
      return false;
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // LEARNING
  // ═══════════════════════════════════════════════════════════════════════════════

  // Complexity: O(N) — linear iteration
  private learnFromChange(report: FeedbackReport): void {
    // Extract patterns from the change
    const ext = path.extname(report.file);
    const patterns = [
      `ext:${ext}`,
      `action:${report.action}`,
      ...(report.verification.errors.map(e => `error:${this.normalizePattern(e)}`)),
      ...(report.verification.warnings.map(w => `warning:${this.normalizePattern(w)}`)),
    ];

    for (const pattern of patterns) {
      const existing = this.learningMemory.get(pattern);

      if (existing) {
        existing.frequency++;
        existing.lastSeen = Date.now();
        existing.outcome = report.action === 'rejected' ? 'failure' :
                          report.action === 'warning' ? 'warning' : 'success';
      } else {
        this.learningMemory.set(pattern, {
          pattern,
          outcome: report.action === 'rejected' ? 'failure' :
                   report.action === 'warning' ? 'warning' : 'success',
          frequency: 1,
          lastSeen: Date.now(),
        });
      }
    }
  }

  // Complexity: O(1)
  private normalizePattern(str: string): string {
    // Normalize error/warning messages to create reusable patterns
    return str
      .replace(/['"`].*?['"`]/g, '<string>')
      .replace(/\d+/g, '<number>')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 50);
  }

  // Complexity: O(N) — linear iteration
  private loadLearningMemory(): void {
    const memoryFile = path.join(process.cwd(), 'data/feedback-learning.json');

    try {
      const content = fs.readFileSync(memoryFile, 'utf-8');
      const data = JSON.parse(content);

      for (const entry of data.patterns || []) {
        this.learningMemory.set(entry.pattern, entry);
      }

      this.log(`   📚 Loaded ${this.learningMemory.size} learned patterns`);
    } catch {
      // No existing memory
    }
  }

  // Complexity: O(1)
  private saveLearningMemory(): void {
    const memoryFile = path.join(process.cwd(), 'data/feedback-learning.json');

    try {
      fs.mkdirSync(path.dirname(memoryFile), { recursive: true });

      const data = {
        timestamp: Date.now(),
        patterns: Array.from(this.learningMemory.values()),
      };

      fs.writeFileSync(memoryFile, JSON.stringify(data, null, 2));
      this.log(`   💾 Saved ${this.learningMemory.size} patterns to memory`);
    } catch (error) {
      this.log(`   ⚠️ Could not save learning memory: ${error}`);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // REPORTING
  // ═══════════════════════════════════════════════════════════════════════════════

  // Complexity: O(N) — linear iteration
  private printReport(report: FeedbackReport): void {
    const icons = {
      approved: '✅',
      warning: '⚠️',
      rejected: '❌',
      pending: '⏳',
    };

    const colors = {
      approved: '\x1b[32m',
      warning: '\x1b[33m',
      rejected: '\x1b[31m',
      pending: '\x1b[36m',
      reset: '\x1b[0m',
    };

    console.log(`\n${icons[report.action]} ${colors[report.action]}FEEDBACK: ${report.file}${colors.reset}`);
    console.log(`   Action: ${report.action.toUpperCase()}`);
    console.log(`   Duration: ${report.duration}ms`);

    if (report.verification.errors.length > 0) {
      console.log(`   Errors:`);
      report.verification.errors.forEach(e => console.log(`     • ${e}`));
    }

    if (report.verification.warnings.length > 0) {
      console.log(`   Warnings:`);
      report.verification.warnings.forEach(w => console.log(`     • ${w}`));
    }

    if (report.suggestions.length > 0) {
      console.log(`   Suggestions:`);
      report.suggestions.forEach(s => console.log(`     💡 ${s}`));
    }

    if (report.autoFixed) {
      console.log(`   🔧 Auto-fix was applied`);
    }
  }

  // Complexity: O(N)
  private async saveReport(report: FeedbackReport): Promise<void> {
    try {
      await fs.promises.mkdir(this.config.reportsPath, { recursive: true });

      const filename = `report-${Date.now()}.json`;
      const filepath = path.join(this.config.reportsPath, filename);

      await fs.promises.writeFile(filepath, JSON.stringify(report, null, 2));
    } catch (error) {
      // Silently fail for report saving
    }
  }

  // Complexity: O(N) — loop-based
  private cleanupReports(): void {
    while (this.reports.length > this.config.maxReportsToKeep) {
      this.reports.shift();
    }
  }

  // Complexity: O(1)
  private printStats(): void {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║                   FEEDBACK LOOP STATS                      ║
╠════════════════════════════════════════════════════════════╣
║   Total Changes:    ${String(this.stats.totalChanges).padStart(6)}                              ║
║   ✅ Approved:      ${String(this.stats.approved).padStart(6)}                              ║
║   ⚠️  Warnings:      ${String(this.stats.warnings).padStart(6)}                              ║
║   ❌ Rejected:      ${String(this.stats.rejected).padStart(6)}                              ║
║   🔧 Auto-Fixed:    ${String(this.stats.autoFixed).padStart(6)}                              ║
║   📚 Patterns:      ${String(this.learningMemory.size).padStart(6)}                              ║
╚════════════════════════════════════════════════════════════╝
`);
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // NOTIFICATIONS
  // ═══════════════════════════════════════════════════════════════════════════════

  // Complexity: O(1)
  private notifyError(file: string, result: VerificationResult): void {
    // Terminal bell
    console.log('\x07');

    // Visual notification
    console.log(`
╔════════════════════════════════════════════════════════════╗
║                    ⛔ VERIFICATION FAILED                   ║
╠════════════════════════════════════════════════════════════╣
║   File: ${file.slice(0, 48).padEnd(49)}║
║   Errors: ${result.errors.length}                                             ║
╚════════════════════════════════════════════════════════════╝
`);
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════════════════════════════════════════

  // Complexity: O(1)
  private log(message: string): void {
    console.log(message);
  }

  // Complexity: O(1) — hash/map lookup
  private logChange(event: FileChangeEvent, level: 'info' | 'warning' | 'error'): void {
    const icons = {
      info: 'ℹ️',
      warning: '⚠️',
      error: '❌',
    };

    const relativePath = path.relative(process.cwd(), event.filePath);
    console.log(`${icons[level]} ${event.type.toUpperCase()}: ${relativePath}`);
  }

  // Complexity: O(1)
  public getStats() {
    return { ...this.stats };
  }

  // Complexity: O(1)
  public getReports(): FeedbackReport[] {
    return [...this.reports];
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SINGLETON
// ═══════════════════════════════════════════════════════════════════════════════

let loopInstance: AutonomousFeedbackLoop | null = null;

export function getFeedbackLoop(config?: Partial<LoopConfig>): AutonomousFeedbackLoop {
  if (!loopInstance) {
    loopInstance = new AutonomousFeedbackLoop(config);
  }
  return loopInstance;
}

export function destroyFeedbackLoop(): void {
  if (loopInstance) {
    loopInstance.stop();
    loopInstance = null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// CLI RUNNER
// ═══════════════════════════════════════════════════════════════════════════════

if (require.main === module) {
  console.log(`
╔═══════════════════════════════════════════════════════════════════════════════╗
║                    🔄 AUTONOMOUS FEEDBACK LOOP - STANDALONE                   ║
║                                                                               ║
║                    QAntum Prime v28.1.0 - Self-Correcting Mode                ║
╚═══════════════════════════════════════════════════════════════════════════════╝
`);

  const loop = getFeedbackLoop({
    autoFix: process.argv.includes('--auto-fix'),
    strictMode: process.argv.includes('--strict'),
    learnFromChanges: true,
    reportToTerminal: true,
  });

  loop.start().catch(console.error);

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n\n🛑 Shutting down feedback loop...');
    loop.stop();
    process.exit(0);
  });
}
