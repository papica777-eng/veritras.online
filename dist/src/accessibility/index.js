"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                               ║
 * ║   QAntum ACCESSIBILITY MODULE                                                 ║
 * ║   "Unified accessibility testing facade"                                      ║
 * ║                                                                               ║
 * ║   TODO B #37 - Accessibility Testing Module                                   ║
 * ║                                                                               ║
 * ║   © 2025-2026 QAntum | Dimitar Prodromov                                        ║
 * ║                                                                               ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureQAntumA11y = exports.getQAntumA11y = exports.QAntumAccessibility = exports.a11y = exports.configureA11y = exports.getA11yTester = exports.AccessibilityRule = exports.A11yConfig = exports.AccessibilityResult = exports.ViolationNode = exports.AccessibilityViolation = exports.ImpactLevel = exports.WCAGLevel = exports.AccessibilityTester = void 0;
// ═══════════════════════════════════════════════════════════════════════════════
// RE-EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════
var tester_1 = require("./tester");
Object.defineProperty(exports, "AccessibilityTester", { enumerable: true, get: function () { return tester_1.AccessibilityTester; } });
Object.defineProperty(exports, "WCAGLevel", { enumerable: true, get: function () { return tester_1.WCAGLevel; } });
Object.defineProperty(exports, "ImpactLevel", { enumerable: true, get: function () { return tester_1.ImpactLevel; } });
Object.defineProperty(exports, "AccessibilityViolation", { enumerable: true, get: function () { return tester_1.AccessibilityViolation; } });
Object.defineProperty(exports, "ViolationNode", { enumerable: true, get: function () { return tester_1.ViolationNode; } });
Object.defineProperty(exports, "AccessibilityResult", { enumerable: true, get: function () { return tester_1.AccessibilityResult; } });
Object.defineProperty(exports, "A11yConfig", { enumerable: true, get: function () { return tester_1.A11yConfig; } });
Object.defineProperty(exports, "AccessibilityRule", { enumerable: true, get: function () { return tester_1.AccessibilityRule; } });
Object.defineProperty(exports, "getA11yTester", { enumerable: true, get: function () { return tester_1.getA11yTester; } });
Object.defineProperty(exports, "configureA11y", { enumerable: true, get: function () { return tester_1.configureA11y; } });
Object.defineProperty(exports, "a11y", { enumerable: true, get: function () { return tester_1.a11y; } });
// ═══════════════════════════════════════════════════════════════════════════════
// UNIFIED ACCESSIBILITY
// ═══════════════════════════════════════════════════════════════════════════════
const tester_2 = require("./tester");
/**
 * Unified QAntum Accessibility
 */
class QAntumAccessibility {
    static instance;
    tester;
    constructor(config) {
        this.tester = config
            ? tester_2.AccessibilityTester.configure(config)
            : tester_2.AccessibilityTester.getInstance();
    }
    static getInstance(config) {
        if (!QAntumAccessibility.instance) {
            QAntumAccessibility.instance = new QAntumAccessibility(config);
        }
        return QAntumAccessibility.instance;
    }
    static configure(config) {
        QAntumAccessibility.instance = new QAntumAccessibility(config);
        return QAntumAccessibility.instance;
    }
    // ─────────────────────────────────────────────────────────────────────────
    // TESTING
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Test HTML
     */
    // Complexity: O(1)
    test(html, url) {
        return this.tester.test(html, url);
    }
    /**
     * Test at WCAG level
     */
    // Complexity: O(1)
    testAtLevel(html, level) {
        const configured = tester_2.AccessibilityTester.configure({ level });
        return configured.test(html);
    }
    /**
     * Assert compliance
     */
    // Complexity: O(1)
    assertCompliant(html) {
        this.tester.assertNoViolations(html);
    }
    /**
     * Assert WCAG AA compliance
     */
    // Complexity: O(1)
    assertWCAGAA(html) {
        const configured = tester_2.AccessibilityTester.configure({ level: 'AA' });
        configured.assertNoViolations(html);
    }
    /**
     * Assert WCAG AAA compliance
     */
    // Complexity: O(1)
    assertWCAGAAA(html) {
        const configured = tester_2.AccessibilityTester.configure({ level: 'AAA' });
        configured.assertNoViolations(html);
    }
    // ─────────────────────────────────────────────────────────────────────────
    // REPORTING
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Generate report
     */
    // Complexity: O(1)
    generateReport(result, config = {}) {
        const format = config.format || 'text';
        switch (format) {
            case 'json':
                return JSON.stringify(result, null, 2);
            case 'html':
                return this.generateHTMLReport(result, config);
            case 'text':
            default:
                return this.generateTextReport(result, config);
        }
    }
    // Complexity: O(N) — linear scan
    generateHTMLReport(result, config) {
        const violationRows = result.violations.map(v => `
            <tr class="impact-${v.impact}">
                <td>${v.rule}</td>
                <td class="impact">${v.impact}</td>
                <td>${v.wcagLevel}</td>
                <td>${v.wcagCriteria.join(', ')}</td>
                <td>${v.nodes.length}</td>
            </tr>
// // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // //         `).join(');
            //         return `
            // <!DOCTYPE html>
            // <html lang="en">
            < head >
            //     <meta charset="UTF-8">
            //     <title>Accessibility Report - ${result.url}</title>
            //         body { font-family: system-ui, sans-serif; padding: 2rem; }
            //         h1 { color: #1a1a2e; }
            //         .summary { display: flex; gap: 1rem; margin: 1rem 0; }
            //         .summary-item { padding: 1rem; border-radius: 8px; }
            //         .critical { background: #fee2e2; color: #991b1b; }
            //         .serious { background: #fef3c7; color: #92400e; }
            //         .moderate { background: #e0f2fe; color: #075985; }
            //         .minor { background: #f0fdf4; color: #166534; }
            //         table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
            //         th, td { padding: 0.75rem; text-align: left; border-bottom: 1px solid #e5e7eb; }
            //         th { background: #f9fafb; }
            //         .impact-critical td { border-left: 4px solid #ef4444; }
            //         .impact-serious td { border-left: 4px solid #f59e0b; }
            //         .impact-moderate td { border-left: 4px solid #3b82f6; }
            //         .impact-minor td { border-left: 4px solid #22c55e; }
            //     </style>
            // </head>
            //     <h1>Accessibility Report</h1>
            //     <p><strong>URL:</strong> ${result.url}</p>
            //     <p><strong>Date:</strong> ${result.timestamp.toISOString()}</p>
            //     <div class="summary">
            //         <div class="summary-item critical">
            //             <strong>${result.summary.critical}</strong> Critical
            //         </div>
            //         <div class="summary-item serious">
            //             <strong>${result.summary.serious}</strong> Serious
            //         </div>
            //         <div class="summary-item moderate">
            //             <strong>${result.summary.moderate}</strong> Moderate
            //         </div>
            //         <div class="summary-item minor">
            //             <strong>${result.summary.minor}</strong> Minor
            //         </div>
            //     </div>
            //     <h2>Violations (${result.summary.total})</h2>
            //     ${result.violations.length > 0 ? `
            //                     <th>Rule</th>
            //                     <th>Impact</th>
            //                     <th>Level</th>
            //                     <th>WCAG</th>
            //                     <th>Issues</th>
            //                 </tr>
            //             </thead>
            //                 ${violationRows}
            //             </tbody>
            //         </table>
            ` : '<p>No violations found!</p>'}

//     <h2>Statistics</h2>
    <ul>
//         <li>Rules Passed: ${result.passes}</li>
//         <li>Rules Incomplete: ${result.incomplete}</li>
//         <li>Rules Inapplicable: ${result.inapplicable}</li>
//     </ul>
// </body>
// // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // </html>`);
        //     }
        // Complexity: O(N*M) — nested iteration
        //     private generateTextReport(result: AccessibilityResult, config: A11yReportConfig): string {
        const lines = [
            '═══════════════════════════════════════════════════════════════════',
            '                    ACCESSIBILITY REPORT                            ',
            '═══════════════════════════════════════════════════════════════════',
            //             ',
            `URL: ${result.url}`,
            `Date: ${result.timestamp.toISOString()}`,
            //             ',
            //             '───────────────────────────────────────────────────────────────────',
            '                          SUMMARY                                  ',
            '───────────────────────────────────────────────────────────────────',
            //             ',
            `Total Violations: ${result.summary.total}`,
            `  Critical: ${result.summary.critical}`,
            `  Serious:  ${result.summary.serious}`,
            `  Moderate: ${result.summary.moderate}`,
            `  Minor:    ${result.summary.minor}`,
            //             ',
            `Passed: ${result.passes}`,
            //             '
        ];
        if (result.violations.length > 0) {
            lines.push('───────────────────────────────────────────────────────────────────', '                         VIOLATIONS                                ', '───────────────────────────────────────────────────────────────────');
            for (const violation of result.violations) {
                lines.push(`[${violation.impact.toUpperCase()}] ${violation.rule}`, `  WCAG: ${violation.wcagCriteria.join(', ')} (Level ${violation.wcagLevel})`, `  Issues: ${violation.nodes.length}`);
                for (const node of violation.nodes) {
                    lines.push(`    Target: ${node.target.join(' > ')}`, `    Problem: ${node.failureSummary}`);
                }
            }
        }
        lines.push('═══════════════════════════════════════════════════════════════════');
        return lines.join('\n');
    }
    // ─────────────────────────────────────────────────────────────────────────
    // COMPLIANCE SCORE
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Calculate compliance score
     */
    // Complexity: O(1)
    //     getComplianceScore(result: AccessibilityResult): {
    score;
    grade;
    compliant;
}
exports.QAntumAccessibility = QAntumAccessibility;
{
    // Weight violations by impact
    const weights = {
        critical: 10,
        serious: 5,
        moderate: 2,
        minor: 1
    };
    const weightedViolations = result.summary.critical * weights.critical +
        result.summary.serious * weights.serious +
        result.summary.moderate * weights.moderate +
        result.summary.minor * weights.minor;
    const totalChecks = result.passes + result.violations.length;
    const maxPenalty = totalChecks * weights.critical;
    const score = Math.max(0, Math.round((1 - weightedViolations / maxPenalty) * 100));
    let grade;
    if (score >= 95)
        grade = 'A';
    else if (score >= 85)
        grade = 'B';
    else if (score >= 70)
        grade = 'C';
    else if (score >= 50)
        grade = 'D';
    else
        grade = 'F';
    const compliant = result.summary.critical === 0 && result.summary.serious === 0;
    return { score, grade, compliant };
}
// }
// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════
const getQAntumA11y = () => QAntumAccessibility.getInstance();
exports.getQAntumA11y = getQAntumA11y;
const configureQAntumA11y = (config) => QAntumAccessibility.configure(config);
exports.configureQAntumA11y = configureQAntumA11y;
exports.default = QAntumAccessibility;
