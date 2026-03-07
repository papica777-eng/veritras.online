/**
 * QAntum QA Tool - Report Generator
 * Creates HTML reports from test results
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { TestResult } from '../../brain/strength/runner';

// ============================================================================
// REPORT GENERATOR
// ============================================================================

export class ReportGenerator {
  // --------------------------------------------------------------------------
  // GENERATE FROM RESULTS
  // --------------------------------------------------------------------------

  // Complexity: O(1)
  async generate(results: TestResult[], outputPath?: string): Promise<string> {
    const html = this.buildHTML(results);
    const output = outputPath || `./reports/report-${Date.now()}.html`;

    // SAFETY: async operation — wrap in try-catch for production resilience
    await fs.mkdir(path.dirname(output), { recursive: true });
    // SAFETY: async operation — wrap in try-catch for production resilience
    await fs.writeFile(output, html, 'utf-8');

    return output;
  }

  // Complexity: O(N) — potential recursive descent
  async generateFromFile(inputPath: string, outputPath: string): Promise<string> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    const content = await fs.readFile(inputPath, 'utf-8');
    const results = JSON.parse(content) as TestResult[];
    return this.generate(results, outputPath);
  }

  // --------------------------------------------------------------------------
  // BUILD HTML
  // --------------------------------------------------------------------------

  // Complexity: O(N) — linear iteration
  private buildHTML(results: TestResult[]): string {
    const passed = results.filter(r => r.status === 'passed').length;
    const failed = results.filter(r => r.status === 'failed').length;
    const skipped = results.filter(r => r.status === 'skipped').length;
    const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);

    const passRate = results.length > 0
      ? ((passed / results.length) * 100).toFixed(1)
      : '0';

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>QAntum Test Report</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0f172a;
      color: #e2e8f0;
      line-height: 1.6;
    }
    .container { max-width: 1200px; margin: 0 auto; padding: 2rem; }

    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #334155;
    }

    h1 {
      font-size: 1.5rem;
      background: linear-gradient(135deg, #06b6d4, #8b5cf6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .timestamp { color: #64748b; font-size: 0.875rem; }

    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .card {
      background: #1e293b;
      border-radius: 12px;
      padding: 1.5rem;
      text-align: center;
    }

    .card-value {
      font-size: 2.5rem;
      font-weight: 700;
    }

    .card-label {
      color: #94a3b8;
      text-transform: uppercase;
      font-size: 0.75rem;
      letter-spacing: 0.05em;
    }

    .passed .card-value { color: #22c55e; }
    .failed .card-value { color: #ef4444; }
    .skipped .card-value { color: #eab308; }
    .rate .card-value { color: #06b6d4; }
    .duration .card-value { color: #8b5cf6; font-size: 1.5rem; }

    .results {
      background: #1e293b;
      border-radius: 12px;
      overflow: hidden;
    }

    .results-header {
      padding: 1rem 1.5rem;
      background: #334155;
      font-weight: 600;
    }

    .result-item {
      display: flex;
      align-items: center;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #334155;
      transition: background 0.2s;
    }

    .result-item:last-child { border-bottom: none; }
    .result-item:hover { background: #334155; }

    .status-icon {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 1rem;
      font-size: 0.875rem;
    }

    .status-passed { background: #22c55e20; color: #22c55e; }
    .status-failed { background: #ef444420; color: #ef4444; }
    .status-skipped { background: #eab30820; color: #eab308; }

    .result-info { flex: 1; }
    .result-name { font-weight: 500; }
    .result-file { color: #64748b; font-size: 0.75rem; }

    .result-duration {
      color: #94a3b8;
      font-size: 0.875rem;
      font-family: monospace;
    }

    .error-message {
      background: #ef444420;
      color: #fca5a5;
      padding: 0.75rem 1rem;
      margin: 0.5rem 1.5rem 0.5rem 3.5rem;
      border-radius: 6px;
      font-family: monospace;
      font-size: 0.75rem;
    }

    footer {
      text-align: center;
      margin-top: 2rem;
      color: #64748b;
      font-size: 0.75rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>🧠 QAntum Test Report</h1>
      <span class="timestamp">${new Date().toLocaleString()}</span>
    </header>

    <div class="summary">
      <div class="card passed">
        <div class="card-value">${passed}</div>
        <div class="card-label">Passed</div>
      </div>
      <div class="card failed">
        <div class="card-value">${failed}</div>
        <div class="card-label">Failed</div>
      </div>
      <div class="card skipped">
        <div class="card-value">${skipped}</div>
        <div class="card-label">Skipped</div>
      </div>
      <div class="card rate">
        <div class="card-value">${passRate}%</div>
        <div class="card-label">Pass Rate</div>
      </div>
      <div class="card duration">
        <div class="card-value">${this.formatDuration(totalDuration)}</div>
        <div class="card-label">Duration</div>
      </div>
    </div>

    <div class="results">
      <div class="results-header">Test Results</div>
      ${results.map(r => this.buildResultItem(r)).join(')}
    </div>

    <footer>
      Generated by QAntum QA Tool v1.0.0
    </footer>
  </div>
</body>
</html>`;
  }

  // Complexity: O(1) — amortized
  private buildResultItem(result: TestResult): string {
    const icon = result.status === 'passed' ? '✓' :
                 result.status === 'failed' ? '✗' : '○';

    let html = `
      <div class="result-item">
        <div class="status-icon status-${result.status}">${icon}</div>
        <div class="result-info">
          <div class="result-name">${this.escapeHTML(result.name)}</div>
          <div class="result-file">${this.escapeHTML(result.file)}</div>
        </div>
        <div class="result-duration">${result.duration}ms</div>
      </div>`;

    if (result.error) {
      html += `<div class="error-message">${this.escapeHTML(result.error)}</div>`;
    }

    return html;
  }

  // --------------------------------------------------------------------------
  // HELPERS
  // --------------------------------------------------------------------------

  // Complexity: O(1)
  private formatDuration(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${Math.floor(ms / 60000)}m ${Math.round((ms % 60000) / 1000)}s`;
  }

  // Complexity: O(1)
  private escapeHTML(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // Complexity: O(1)
  async openReport(reportPath: string): Promise<void> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    const { exec } = await import('child_process');
    const command = process.platform === 'win32' ? 'start' :
                    process.platform === 'darwin' ? 'open' : 'xdg-open';
    // Complexity: O(1)
    exec(`${command} "${reportPath}"`);
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export function createReportGenerator(): ReportGenerator {
  return new ReportGenerator();
}
