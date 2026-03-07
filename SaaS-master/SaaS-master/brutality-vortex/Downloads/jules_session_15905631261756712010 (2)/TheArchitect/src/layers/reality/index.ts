/**
 * ═══════════════════════════════════════════════════════════════════════════
 * REALITY LAYER - THE OUTPUT TO THE WORLD
 * Layer 5: Final Manifestation - CLI, Reports, UI, Logs
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * "Думите създават реалности."
 *                            — Лудвиг Витгенщайн
 * 
 * This is the FINAL layer. Everything culminates here. Reality is what
 * the user sees, hears, and experiences. All other layers serve this one.
 * 
 * PRINCIPLES:
 * - Can import from ALL lower layers
 * - Exports NOTHING to other layers (terminal)
 * - Human-readable output always
 * - Accessibility and UX focused
 * 
 * CONTENTS:
 * - CLI Interface: Command-line interaction
 * - Report Generators: HTML, PDF, JSON reports
 * - Visual Output: Screenshots, diffs, videos
 * - Notification System: Alerts, emails, webhooks
 * 
 * LAYER HIERARCHY:
 * ┌─────────────────────────────────────────────────────────────────┐
 * │ [5] REALITY    ← Final output to the world ← YOU ARE HERE       │
 * │ [4] BIOLOGY    ← Self-organizing, learning systems              │
 * │ [3] CHEMISTRY  ← Reactive transformations                       │
 * │ [2] PHYSICS    ← Interaction rules, forces                      │
 * │ [1] MATH       ← Pure algorithms, immutable truths              │
 * └─────────────────────────────────────────────────────────────────┘
 * 
 * DEPENDENCY RULE:
 * Reality imports FROM Math, Physics, Chemistry, Biology
 * Reality exports TO the external world (users, systems)
 * 
 * @module layers/reality
 * @version 1.0.0
 * @license MIT
 */

import {
  type MathResult,
  createMathResult,
  createTemporalPoint,
  contentHash,
} from '../math';
import { PerformanceTracker, RateLimiter } from '../physics';
import { 
  type TransformResult,
  createPipeline,
  SchemaValidator,
} from '../chemistry';
import {
  type HealthStatus,
  type HealingAction,
  type Decision,
  type Memory,
  LongTermMemory,
  Oracle,
  SelfHealingOrganism,
} from '../biology';

// ═══════════════════════════════════════════════════════════════════════════
// REALITY PRIMITIVES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Output format types
 */
export type OutputFormat = 'text' | 'json' | 'html' | 'markdown' | 'ansi';

/**
 * Log level for reality output
 */
export type RealityLogLevel = 'debug' | 'info' | 'success' | 'warn' | 'error' | 'fatal';

/**
 * Reality event (something that happened)
 */
export interface RealityEvent {
  readonly id: string;
  readonly type: string;
  readonly timestamp: number;
  readonly source: string;
  readonly data: unknown;
  readonly level: RealityLogLevel;
}

/**
 * Report section
 */
export interface ReportSection {
  readonly title: string;
  readonly content: string;
  readonly format: OutputFormat;
  readonly importance: number;
  readonly collapsible?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// CLI INTERFACE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * ANSI color codes for terminal output
 */
const ANSI = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  // Colors
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  // Backgrounds
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
} as const;

/**
 * CLI Output formatter
 */
export class CLIOutput {
  private readonly useColors: boolean;
  private readonly prefix: string;

  constructor(options: { useColors?: boolean; prefix?: string } = {}) {
    this.useColors = options.useColors ?? process.stdout.isTTY ?? false;
    this.prefix = options.prefix ?? '';
  }

  /**
   * Colorize text
   */
  private colorize(text: string, ...codes: string[]): string {
    if (!this.useColors) return text;
    return codes.join('') + text + ANSI.reset;
  }

  /**
   * Print a line
   */
  line(text: string): void {
    console.log(this.prefix + text);
  }

  /**
   * Print success message
   */
  success(message: string): void {
    const icon = this.colorize('✓', ANSI.green, ANSI.bold);
    this.line(`${icon} ${this.colorize(message, ANSI.green)}`);
  }

  /**
   * Print error message
   */
  error(message: string): void {
    const icon = this.colorize('✗', ANSI.red, ANSI.bold);
    this.line(`${icon} ${this.colorize(message, ANSI.red)}`);
  }

  /**
   * Print warning message
   */
  warn(message: string): void {
    const icon = this.colorize('⚠', ANSI.yellow, ANSI.bold);
    this.line(`${icon} ${this.colorize(message, ANSI.yellow)}`);
  }

  /**
   * Print info message
   */
  info(message: string): void {
    const icon = this.colorize('ℹ', ANSI.blue, ANSI.bold);
    this.line(`${icon} ${this.colorize(message, ANSI.blue)}`);
  }

  /**
   * Print a header/title
   */
  header(title: string, char = '═'): void {
    const line = char.repeat(Math.max(0, 60 - title.length));
    this.line('');
    this.line(this.colorize(`${char.repeat(3)} ${title} ${line}`, ANSI.cyan, ANSI.bold));
    this.line('');
  }

  /**
   * Print a box
   */
  box(content: string[], title?: string): void {
    const width = Math.max(...content.map(l => l.length), title?.length ?? 0) + 4;
    const topBorder = '╔' + '═'.repeat(width - 2) + '╗';
    const bottomBorder = '╚' + '═'.repeat(width - 2) + '╝';
    const emptyLine = '║' + ' '.repeat(width - 2) + '║';

    this.line(this.colorize(topBorder, ANSI.cyan));
    
    if (title) {
      const padding = ' '.repeat(Math.floor((width - 2 - title.length) / 2));
      this.line(this.colorize(`║${padding}${title}${padding}${(width - 2 - title.length) % 2 ? ' ' : ''}║`, ANSI.cyan));
      this.line(this.colorize('╠' + '═'.repeat(width - 2) + '╣', ANSI.cyan));
    }

    for (const line of content) {
      const padding = ' '.repeat(width - 2 - line.length);
      this.line(this.colorize('║', ANSI.cyan) + ' ' + line + padding.slice(1) + this.colorize('║', ANSI.cyan));
    }

    this.line(this.colorize(bottomBorder, ANSI.cyan));
  }

  /**
   * Print a progress bar
   */
  progressBar(current: number, total: number, width = 40): void {
    const percentage = Math.round((current / total) * 100);
    const filled = Math.round((current / total) * width);
    const empty = width - filled;
    
    const bar = this.colorize('█'.repeat(filled), ANSI.green) + 
                this.colorize('░'.repeat(empty), ANSI.dim);
    
    process.stdout.write(`\r${this.prefix}[${bar}] ${percentage}% (${current}/${total})`);
    
    if (current >= total) {
      console.log('');
    }
  }

  /**
   * Print a table
   */
  table(headers: string[], rows: string[][]): void {
    const widths = headers.map((h, i) => 
      Math.max(h.length, ...rows.map(r => (r[i] ?? '').length))
    );

    // Header
    const headerLine = headers.map((h, i) => 
      this.colorize(h.padEnd(widths[i]), ANSI.bold)
    ).join(' │ ');
    this.line(headerLine);
    this.line(widths.map(w => '─'.repeat(w)).join('─┼─'));

    // Rows
    for (const row of rows) {
      const rowLine = row.map((cell, i) => 
        (cell ?? '').padEnd(widths[i])
      ).join(' │ ');
      this.line(rowLine);
    }
  }

  /**
   * Clear the terminal
   */
  clear(): void {
    console.clear();
  }

  /**
   * Print a spinner (returns stop function)
   */
  spinner(message: string): { stop: (success: boolean) => void } {
    const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    let i = 0;
    let running = true;

    const interval = setInterval(() => {
      if (!running) return;
      const frame = this.colorize(frames[i % frames.length], ANSI.cyan);
      process.stdout.write(`\r${this.prefix}${frame} ${message}`);
      i++;
    }, 80);

    return {
      stop: (success: boolean) => {
        running = false;
        clearInterval(interval);
        process.stdout.write('\r' + ' '.repeat(message.length + 10) + '\r');
        if (success) {
          this.success(message);
        } else {
          this.error(message);
        }
      },
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// REPORT GENERATOR
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Report configuration
 */
export interface ReportConfig {
  readonly title: string;
  readonly format: OutputFormat;
  readonly timestamp?: boolean;
  readonly logo?: string;
  readonly theme?: 'light' | 'dark';
}

/**
 * Report generator - creates human-readable reports
 */
export class ReportGenerator {
  private sections: ReportSection[] = [];
  private readonly config: ReportConfig;

  constructor(config: ReportConfig) {
    this.config = config;
  }

  /**
   * Add a section to the report
   */
  addSection(section: ReportSection): this {
    this.sections.push(section);
    return this;
  }

  /**
   * Add a summary section
   */
  addSummary(stats: Record<string, number | string>): this {
    const content = Object.entries(stats)
      .map(([key, value]) => `**${key}:** ${value}`)
      .join('\n');

    this.sections.push({
      title: 'Summary',
      content,
      format: 'markdown',
      importance: 1,
    });
    return this;
  }

  /**
   * Add a table section
   */
  addTable(title: string, headers: string[], rows: string[][]): this {
    let content: string;

    if (this.config.format === 'markdown' || this.config.format === 'text') {
      // Markdown table
      content = '| ' + headers.join(' | ') + ' |\n';
      content += '| ' + headers.map(() => '---').join(' | ') + ' |\n';
      content += rows.map(row => '| ' + row.join(' | ') + ' |').join('\n');
    } else if (this.config.format === 'html') {
      content = '<table>\n<thead><tr>';
      content += headers.map(h => `<th>${h}</th>`).join('');
      content += '</tr></thead>\n<tbody>';
      content += rows.map(row => 
        '<tr>' + row.map(cell => `<td>${cell}</td>`).join('') + '</tr>'
      ).join('\n');
      content += '</tbody>\n</table>';
    } else {
      content = JSON.stringify({ headers, rows });
    }

    this.sections.push({
      title,
      content,
      format: this.config.format,
      importance: 0.8,
    });
    return this;
  }

  /**
   * Generate the final report
   */
  generate(): string {
    switch (this.config.format) {
      case 'markdown':
        return this.generateMarkdown();
      case 'html':
        return this.generateHTML();
      case 'json':
        return this.generateJSON();
      default:
        return this.generateText();
    }
  }

  private generateMarkdown(): string {
    let output = `# ${this.config.title}\n\n`;
    
    if (this.config.timestamp) {
      output += `*Generated: ${new Date().toISOString()}*\n\n`;
    }

    for (const section of this.sections.sort((a, b) => b.importance - a.importance)) {
      output += `## ${section.title}\n\n`;
      output += section.content + '\n\n';
    }

    return output;
  }

  private generateHTML(): string {
    const isDark = this.config.theme === 'dark';
    const bgColor = isDark ? '#1a1a2e' : '#ffffff';
    const textColor = isDark ? '#e0e0e0' : '#333333';
    const accentColor = isDark ? '#00d9ff' : '#0066cc';

    let output = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${this.config.title}</title>
  <style>
    body { 
      font-family: 'Segoe UI', system-ui, sans-serif; 
      background: ${bgColor}; 
      color: ${textColor};
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }
    h1 { color: ${accentColor}; border-bottom: 2px solid ${accentColor}; padding-bottom: 0.5rem; }
    h2 { color: ${accentColor}; margin-top: 2rem; }
    table { border-collapse: collapse; width: 100%; margin: 1rem 0; }
    th, td { padding: 0.75rem; text-align: left; border: 1px solid ${isDark ? '#333' : '#ddd'}; }
    th { background: ${accentColor}; color: white; }
    tr:nth-child(even) { background: ${isDark ? '#252540' : '#f5f5f5'}; }
    .timestamp { color: #888; font-size: 0.9rem; }
    .section { margin-bottom: 2rem; }
  </style>
</head>
<body>
  <h1>${this.config.title}</h1>
`;

    if (this.config.timestamp) {
      output += `  <p class="timestamp">Generated: ${new Date().toISOString()}</p>\n`;
    }

    for (const section of this.sections.sort((a, b) => b.importance - a.importance)) {
      output += `  <div class="section">
    <h2>${section.title}</h2>
    <div>${section.content}</div>
  </div>\n`;
    }

    output += `</body>
</html>`;
    return output;
  }

  private generateJSON(): string {
    return JSON.stringify({
      title: this.config.title,
      generatedAt: new Date().toISOString(),
      sections: this.sections.map(s => ({
        title: s.title,
        content: s.content,
        importance: s.importance,
      })),
    }, null, 2);
  }

  private generateText(): string {
    let output = `${'='.repeat(60)}\n`;
    output += `  ${this.config.title}\n`;
    output += `${'='.repeat(60)}\n\n`;

    if (this.config.timestamp) {
      output += `Generated: ${new Date().toISOString()}\n\n`;
    }

    for (const section of this.sections.sort((a, b) => b.importance - a.importance)) {
      output += `${'-'.repeat(40)}\n`;
      output += `  ${section.title}\n`;
      output += `${'-'.repeat(40)}\n`;
      output += section.content + '\n\n';
    }

    return output;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// NOTIFICATION SYSTEM
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Notification channel
 */
export type NotificationChannel = 'console' | 'file' | 'webhook' | 'email';

/**
 * Notification
 */
export interface Notification {
  readonly id: string;
  readonly channel: NotificationChannel;
  readonly level: RealityLogLevel;
  readonly title: string;
  readonly message: string;
  readonly metadata?: Record<string, unknown>;
  readonly sentAt?: number;
}

/**
 * Notification handler
 */
export interface NotificationHandler {
  readonly channel: NotificationChannel;
  send(notification: Notification): Promise<boolean>;
}

/**
 * Console notification handler
 */
export class ConsoleNotificationHandler implements NotificationHandler {
  readonly channel = 'console' as const;
  private readonly cli = new CLIOutput({ useColors: true });

  async send(notification: Notification): Promise<boolean> {
    switch (notification.level) {
      case 'success':
        this.cli.success(`${notification.title}: ${notification.message}`);
        break;
      case 'error':
      case 'fatal':
        this.cli.error(`${notification.title}: ${notification.message}`);
        break;
      case 'warn':
        this.cli.warn(`${notification.title}: ${notification.message}`);
        break;
      default:
        this.cli.info(`${notification.title}: ${notification.message}`);
    }
    return true;
  }
}

/**
 * Notification manager
 */
export class NotificationManager {
  private readonly handlers: Map<NotificationChannel, NotificationHandler> = new Map();
  private readonly rateLimiter = new RateLimiter({ maxTokens: 100, refillRatePerSecond: 10 });
  private readonly history: Notification[] = [];
  private readonly maxHistory = 1000;

  /**
   * Register a notification handler
   */
  registerHandler(handler: NotificationHandler): void {
    this.handlers.set(handler.channel, handler);
  }

  /**
   * Send a notification
   */
  async notify(
    channel: NotificationChannel,
    level: RealityLogLevel,
    title: string,
    message: string,
    metadata?: Record<string, unknown>
  ): Promise<boolean> {
    // Rate limit
    if (!this.rateLimiter.tryConsume()) {
      return false;
    }

    const notification: Notification = {
      id: contentHash(title + message + Date.now()),
      channel,
      level,
      title,
      message,
      metadata,
      sentAt: Date.now(),
    };

    const handler = this.handlers.get(channel);
    if (!handler) {
      // Fallback to console
      const consoleHandler = new ConsoleNotificationHandler();
      await consoleHandler.send(notification);
      return true;
    }

    const success = await handler.send(notification);
    
    // Store in history
    this.history.push(notification);
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }

    return success;
  }

  /**
   * Get notification history
   */
  getHistory(filter?: { level?: RealityLogLevel; channel?: NotificationChannel }): Notification[] {
    return this.history.filter(n => {
      if (filter?.level && n.level !== filter.level) return false;
      if (filter?.channel && n.channel !== filter.channel) return false;
      return true;
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// REALITY ORCHESTRATOR (Brings it all together)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Reality configuration
 */
export interface RealityConfig {
  readonly outputFormat: OutputFormat;
  readonly notificationChannels: NotificationChannel[];
  readonly verbosity: 'quiet' | 'normal' | 'verbose' | 'debug';
  readonly theme?: 'light' | 'dark';
}

/**
 * Reality Orchestrator - The final interface to the world
 */
export class RealityOrchestrator {
  private readonly cli: CLIOutput;
  private readonly notifications: NotificationManager;
  private readonly config: RealityConfig;
  private readonly tracker = new PerformanceTracker();

  constructor(config: RealityConfig) {
    this.config = config;
    this.cli = new CLIOutput({ useColors: true });
    this.notifications = new NotificationManager();
    this.notifications.registerHandler(new ConsoleNotificationHandler());
  }

  /**
   * Manifest an event to reality
   */
  async manifest(event: RealityEvent): Promise<void> {
    await this.tracker.time(async () => {
      // Console output based on verbosity
      if (this.shouldLog(event.level)) {
        this.logEvent(event);
      }

      // Send notifications for important events
      if (event.level === 'error' || event.level === 'fatal') {
        for (const channel of this.config.notificationChannels) {
          await this.notifications.notify(
            channel,
            event.level,
            event.type,
            JSON.stringify(event.data)
          );
        }
      }
    });
  }

  /**
   * Generate and output a report
   */
  generateReport(config: ReportConfig): ReportGenerator {
    return new ReportGenerator({
      ...config,
      theme: this.config.theme,
    });
  }

  /**
   * Display system health status
   */
  displayHealth(health: HealthStatus[]): void {
    this.cli.header('SYSTEM HEALTH');

    const rows = health.map(h => [
      h.component,
      this.formatStatus(h.status),
      h.issues.length > 0 ? h.issues[0] : 'OK',
    ]);

    this.cli.table(['Component', 'Status', 'Notes'], rows);
  }

  /**
   * Display healing actions
   */
  displayHealingPlan(actions: HealingAction[]): void {
    if (actions.length === 0) {
      this.cli.success('No healing actions required');
      return;
    }

    this.cli.header('HEALING PLAN');

    for (const action of actions) {
      const icon = action.automated ? '🤖' : '👤';
      const priority = this.formatPriority(action.priority);
      this.cli.line(`${icon} [${priority}] ${action.type.toUpperCase()}: ${action.target}`);
      this.cli.line(`   └─ ${action.reason}`);
    }
  }

  /**
   * Display a decision
   */
  displayDecision(decision: Decision): void {
    this.cli.box([
      `Action: ${decision.action}`,
      `Confidence: ${(decision.confidence * 100).toFixed(1)}%`,
      '',
      'Reasoning:',
      ...decision.reasoning.map(r => `  • ${r}`),
      '',
      'Alternatives:',
      ...decision.alternatives.slice(0, 3).map(a => 
        `  ${a.action}: ${(a.score * 100).toFixed(0)}%`
      ),
    ], 'DECISION');
  }

  private shouldLog(level: RealityLogLevel): boolean {
    const levels: RealityLogLevel[] = ['debug', 'info', 'success', 'warn', 'error', 'fatal'];
    const levelIndex = levels.indexOf(level);
    
    switch (this.config.verbosity) {
      case 'quiet': return levelIndex >= 4; // error, fatal
      case 'normal': return levelIndex >= 2; // success, warn, error, fatal
      case 'verbose': return levelIndex >= 1; // info and above
      case 'debug': return true; // everything
    }
  }

  private logEvent(event: RealityEvent): void {
    switch (event.level) {
      case 'success':
        this.cli.success(`[${event.source}] ${event.type}`);
        break;
      case 'error':
      case 'fatal':
        this.cli.error(`[${event.source}] ${event.type}: ${JSON.stringify(event.data)}`);
        break;
      case 'warn':
        this.cli.warn(`[${event.source}] ${event.type}`);
        break;
      case 'info':
        this.cli.info(`[${event.source}] ${event.type}`);
        break;
      case 'debug':
        this.cli.line(`[DEBUG] [${event.source}] ${event.type}`);
        break;
    }
  }

  private formatStatus(status: string): string {
    const colors: Record<string, string> = {
      healthy: '\x1b[32m✓ HEALTHY\x1b[0m',
      degraded: '\x1b[33m⚠ DEGRADED\x1b[0m',
      critical: '\x1b[31m✗ CRITICAL\x1b[0m',
      dead: '\x1b[31m☠ DEAD\x1b[0m',
    };
    return colors[status] ?? status;
  }

  private formatPriority(priority: string): string {
    const colors: Record<string, string> = {
      low: '\x1b[32mLOW\x1b[0m',
      medium: '\x1b[33mMED\x1b[0m',
      high: '\x1b[31mHIGH\x1b[0m',
      critical: '\x1b[41m\x1b[37mCRIT\x1b[0m',
    };
    return colors[priority] ?? priority;
  }

  /**
   * Get performance stats
   */
  getPerformanceStats() {
    return this.tracker.getStats();
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// LAYER METADATA
// ═══════════════════════════════════════════════════════════════════════════

export const LAYER_INFO = Object.freeze({
  name: 'REALITY',
  level: 5,
  description: 'The Output to the World - CLI, Reports, UI, Notifications',
  principles: [
    'Can import from ALL lower layers',
    'Exports NOTHING to other layers',
    'Human-readable output always',
    'Accessibility focused',
  ],
  exports: ['EXTERNAL_WORLD'],
  imports: ['MATH', 'PHYSICS', 'CHEMISTRY', 'BIOLOGY'],
});

export default {
  CLIOutput,
  ReportGenerator,
  NotificationManager,
  ConsoleNotificationHandler,
  RealityOrchestrator,
  LAYER_INFO,
};
