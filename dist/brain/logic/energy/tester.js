"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                               ║
 * ║   QANTUM ACCESSIBILITY TESTING                                                ║
 * ║   "WCAG 2.1 compliance testing engine"                                        ║
 * ║                                                                               ║
 * ║   TODO B #37 - Accessibility: WCAG testing                                    ║
 * ║                                                                               ║
 * ║   © 2025-2026 QAntum | Dimitar Prodromov                                        ║
 * ║                                                                               ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.a11y = exports.configureA11y = exports.getA11yTester = exports.AccessibilityTester = void 0;
const accessibilityRules = [
    // Image alt text
    {
        id: 'image-alt',
        name: 'Images must have alt text',
        wcagLevel: 'A',
        wcagCriteria: ['1.1.1'],
        impact: 'critical',
        check: (html) => {
            const violations = [];
            const imgRegex = /<img\s+[^>]*>/gi;
            let match;
            while ((match = imgRegex.exec(html)) !== null) {
                const imgTag = match[0];
                if (!imgTag.includes('alt=')) {
                    violations.push({
                        html: imgTag,
                        target: ['img'],
                        failureSummary: 'Image missing alt attribute'
                    });
                }
            }
            return violations;
        }
    },
    // Form labels
    {
        id: 'label',
        name: 'Form inputs must have labels',
        wcagLevel: 'A',
        wcagCriteria: ['1.3.1', '4.1.2'],
        impact: 'critical',
        check: (html) => {
            const violations = [];
            const inputRegex = /<input\s+[^>]*type=["'](?:text|email|password|tel|number|search)["'][^>]*>/gi;
            let match;
            while ((match = inputRegex.exec(html)) !== null) {
                const inputTag = match[0];
                const hasId = /id=["']([^"']+)["']/.exec(inputTag);
                if (!hasId) {
                    violations.push({
                        html: inputTag,
                        target: ['input'],
                        failureSummary: 'Input missing id for label association'
                    });
                }
                else {
                    const labelRegex = new RegExp(`<label[^>]*for=["']${hasId[1]}["']`, 'i');
                    if (!labelRegex.test(html)) {
                        violations.push({
                            html: inputTag,
                            target: ['input'],
                            failureSummary: 'Input missing associated label'
                        });
                    }
                }
            }
            return violations;
        }
    },
    // Document language
    {
        id: 'html-lang',
        name: 'HTML must have lang attribute',
        wcagLevel: 'A',
        wcagCriteria: ['3.1.1'],
        impact: 'serious',
        check: (html) => {
            const violations = [];
            const htmlRegex = /<html[^>]*>/i;
            const match = htmlRegex.exec(html);
            if (match && !match[0].includes('lang=')) {
                violations.push({
                    html: match[0],
                    target: ['html'],
                    failureSummary: 'HTML element missing lang attribute'
                });
            }
            return violations;
        }
    },
    // Page title
    {
        id: 'document-title',
        name: 'Documents must have title',
        wcagLevel: 'A',
        wcagCriteria: ['2.4.2'],
        impact: 'serious',
        check: (html) => {
            const violations = [];
            if (!/<title[^>]*>[^<]+<\/title>/i.test(html)) {
                violations.push({
                    html: '<head>...</head>',
                    target: ['head'],
                    failureSummary: 'Document missing title element or title is empty'
                });
            }
            return violations;
        }
    },
    // Color contrast (simplified check)
    {
        id: 'color-contrast',
        name: 'Text must have sufficient contrast',
        wcagLevel: 'AA',
        wcagCriteria: ['1.4.3'],
        impact: 'serious',
        check: (html) => {
            // Full contrast check requires computed styles
            // This is a placeholder for the concept
            return [];
        }
    },
    // Link text
    {
        id: 'link-name',
        name: 'Links must have discernible text',
        wcagLevel: 'A',
        wcagCriteria: ['2.4.4', '4.1.2'],
        impact: 'serious',
        check: (html) => {
            const violations = [];
            const linkRegex = /<a\s+[^>]*href[^>]*>([^<]*)<\/a>/gi;
            let match;
            while ((match = linkRegex.exec(html)) !== null) {
                const linkText = match[1].trim();
                if (!linkText && !match[0].includes('aria-label')) {
                    violations.push({
                        html: match[0],
                        target: ['a'],
                        failureSummary: 'Link has no discernible text'
                    });
                }
            }
            return violations;
        }
    },
    // Button name
    {
        id: 'button-name',
        name: 'Buttons must have discernible text',
        wcagLevel: 'A',
        wcagCriteria: ['4.1.2'],
        impact: 'critical',
        check: (html) => {
            const violations = [];
            const buttonRegex = /<button[^>]*>([^<]*)<\/button>/gi;
            let match;
            while ((match = buttonRegex.exec(html)) !== null) {
                const buttonText = match[1].trim();
                if (!buttonText && !match[0].includes('aria-label')) {
                    violations.push({
                        html: match[0],
                        target: ['button'],
                        failureSummary: 'Button has no discernible text'
                    });
                }
            }
            return violations;
        }
    },
    // Skip link
    {
        id: 'skip-link',
        name: 'Page should have skip to main content link',
        wcagLevel: 'A',
        wcagCriteria: ['2.4.1'],
        impact: 'moderate',
        check: (html) => {
            const violations = [];
            if (!/<a[^>]*href=["']#(main|content|maincontent)[^>]*>/i.test(html)) {
                violations.push({
                    html: '<body>...</body>',
                    target: ['body'],
                    failureSummary: 'Page missing skip to main content link'
                });
            }
            return violations;
        }
    },
    // Heading order
    {
        id: 'heading-order',
        name: 'Heading levels should increase by one',
        wcagLevel: 'A',
        wcagCriteria: ['1.3.1'],
        impact: 'moderate',
        check: (html) => {
            const violations = [];
            const headingRegex = /<h([1-6])[^>]*>/gi;
            let lastLevel = 0;
            let match;
            while ((match = headingRegex.exec(html)) !== null) {
                const level = parseInt(match[1]);
                if (lastLevel > 0 && level > lastLevel + 1) {
                    violations.push({
                        html: match[0],
                        target: [`h${level}`],
                        failureSummary: `Heading skipped from h${lastLevel} to h${level}`
                    });
                }
                lastLevel = level;
            }
            return violations;
        }
    }
];
// ═══════════════════════════════════════════════════════════════════════════════
// ACCESSIBILITY TESTER
// ═══════════════════════════════════════════════════════════════════════════════
class AccessibilityTester {
    static instance;
    rules = [...accessibilityRules];
    config;
    constructor(config = {}) {
        this.config = {
            level: config.level || 'AA',
            rules: config.rules,
            exclude: config.exclude || [],
            include: config.include,
            timeout: config.timeout || 30000
        };
    }
    static getInstance(config) {
        if (!AccessibilityTester.instance) {
            AccessibilityTester.instance = new AccessibilityTester(config);
        }
        return AccessibilityTester.instance;
    }
    static configure(config) {
        AccessibilityTester.instance = new AccessibilityTester(config);
        return AccessibilityTester.instance;
    }
    // ─────────────────────────────────────────────────────────────────────────
    // TESTING
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Test HTML for accessibility violations
     */
    test(html, url) {
        const violations = [];
        let passes = 0;
        let incomplete = 0;
        const inapplicable = 0;
        const rulesToRun = this.getRulesToRun();
        for (const rule of rulesToRun) {
            const nodes = rule.check(html);
            if (nodes.length > 0) {
                violations.push({
                    id: rule.id,
                    rule: rule.name,
                    impact: rule.impact,
                    wcagLevel: rule.wcagLevel,
                    wcagCriteria: rule.wcagCriteria,
                    description: rule.name,
                    help: `Fix: ${rule.name}`,
                    nodes
                });
            }
            else {
                passes++;
            }
        }
        // Calculate summary
        const summary = {
            critical: violations.filter(v => v.impact === 'critical').length,
            serious: violations.filter(v => v.impact === 'serious').length,
            moderate: violations.filter(v => v.impact === 'moderate').length,
            minor: violations.filter(v => v.impact === 'minor').length,
            total: violations.length
        };
        return {
            url: url || 'unknown',
            timestamp: new Date(),
            violations,
            passes,
            incomplete,
            inapplicable,
            summary
        };
    }
    /**
     * Assert no violations
     */
    assertNoViolations(html) {
        const result = this.test(html);
        if (result.violations.length > 0) {
            const details = result.violations.map(v => `- [${v.impact.toUpperCase()}] ${v.rule}: ${v.nodes.length} issue(s)`).join('\n');
            throw new Error(`Accessibility violations found:\n${details}\n\n` +
                `Total: ${result.summary.total} violations ` +
                `(${result.summary.critical} critical, ${result.summary.serious} serious)`);
        }
    }
    /**
     * Assert no critical/serious violations
     */
    assertNoSerious(html) {
        const result = this.test(html);
        const serious = result.violations.filter(v => v.impact === 'critical' || v.impact === 'serious');
        if (serious.length > 0) {
            const details = serious.map(v => `- [${v.impact.toUpperCase()}] ${v.rule}: ${v.nodes.length} issue(s)`).join('\n');
            throw new Error(`Serious accessibility violations found:\n${details}`);
        }
    }
    // ─────────────────────────────────────────────────────────────────────────
    // RULE MANAGEMENT
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Add custom rule
     */
    addRule(rule) {
        this.rules.push(rule);
    }
    /**
     * Get rules to run based on config
     */
    getRulesToRun() {
        let rules = this.rules;
        // Filter by WCAG level
        const levelOrder = ['A', 'AA', 'AAA'];
        const maxLevel = levelOrder.indexOf(this.config.level);
        rules = rules.filter(r => levelOrder.indexOf(r.wcagLevel) <= maxLevel);
        // Filter by include list
        if (this.config.include?.length) {
            rules = rules.filter(r => this.config.include.includes(r.id));
        }
        // Filter by exclude list
        if (this.config.exclude?.length) {
            rules = rules.filter(r => !this.config.exclude.includes(r.id));
        }
        // Filter by specific rules
        if (this.config.rules?.length) {
            rules = rules.filter(r => this.config.rules.includes(r.id));
        }
        return rules;
    }
    /**
     * Get available rules
     */
    getAvailableRules() {
        return this.rules.map(r => r.id);
    }
}
exports.AccessibilityTester = AccessibilityTester;
// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════
const getA11yTester = () => AccessibilityTester.getInstance();
exports.getA11yTester = getA11yTester;
const configureA11y = (config) => AccessibilityTester.configure(config);
exports.configureA11y = configureA11y;
// Quick a11y operations
exports.a11y = {
    test: (html, url) => AccessibilityTester.getInstance().test(html, url),
    assertNoViolations: (html) => AccessibilityTester.getInstance().assertNoViolations(html),
    assertNoSerious: (html) => AccessibilityTester.getInstance().assertNoSerious(html),
    getRules: () => AccessibilityTester.getInstance().getAvailableRules()
};
exports.default = AccessibilityTester;
