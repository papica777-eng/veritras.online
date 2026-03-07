"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                               ║
 * ║   QANTUM INTEGRATION MODULE                                                   ║
 * ║   "Seamless integration with CI/CD and notification systems"                  ║
 * ║                                                                               ║
 * ║   TODO B #28-29 - Integration: CI/CD & Notifications                          ║
 * ║                                                                               ║
 * ║   © 2025-2026 QAntum | Dimitar Prodromov                                        ║
 * ║                                                                               ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notify = exports.getIntegration = exports.QAntumIntegration = void 0;
// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════
__exportStar(require("./ci.js"), exports);
__exportStar(require("./notifications.js"), exports);
const ci_js_1 = require("./ci.js");
const notifications_js_1 = require("./notifications.js");
Object.defineProperty(exports, "notify", { enumerable: true, get: function () { return notifications_js_1.notify; } });
// ═══════════════════════════════════════════════════════════════════════════════
// UNIFIED INTEGRATION FACADE
// ═══════════════════════════════════════════════════════════════════════════════
class QAntumIntegration {
    static instance;
    ci;
    notifications;
    constructor() {
        this.ci = ci_js_1.CIIntegration.getInstance();
        this.notifications = notifications_js_1.NotificationManager.getInstance();
    }
    static getInstance() {
        if (!QAntumIntegration.instance) {
            QAntumIntegration.instance = new QAntumIntegration();
        }
        return QAntumIntegration.instance;
    }
    // ─────────────────────────────────────────────────────────────────────────
    // CI/CD
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Get CI integration
     */
    // Complexity: O(1)
    getCI() {
        return this.ci;
    }
    /**
     * Get CI environment info
     */
    // Complexity: O(1)
    getCIEnvironment() {
        return this.ci.getEnvironment();
    }
    /**
     * Check if running in CI
     */
    // Complexity: O(1)
    isCI() {
        return this.ci.isCI();
    }
    /**
     * Get CI provider
     */
    // Complexity: O(1)
    getCIProvider() {
        return this.ci.getProvider();
    }
    /**
     * Add build annotation
     */
    // Complexity: O(1)
    annotate(annotation) {
        this.ci.annotate(annotation);
    }
    /**
     * Set CI output variable
     */
    // Complexity: O(1)
    setOutput(name, value) {
        this.ci.setOutput(name, value);
    }
    /**
     * Create log group
     */
    // Complexity: O(1)
    group(name, fn) {
        return this.ci.group(name, fn);
    }
    // ─────────────────────────────────────────────────────────────────────────
    // NOTIFICATIONS
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Get notification manager
     */
    // Complexity: O(1)
    getNotifications() {
        return this.notifications;
    }
    /**
     * Configure Slack
     */
    // Complexity: O(1)
    slack(webhookUrl) {
        this.notifications.slack(webhookUrl);
        return this;
    }
    /**
     * Configure Discord
     */
    // Complexity: O(1)
    discord(webhookUrl) {
        this.notifications.discord(webhookUrl);
        return this;
    }
    /**
     * Configure Teams
     */
    // Complexity: O(1)
    teams(webhookUrl) {
        this.notifications.teams(webhookUrl);
        return this;
    }
    /**
     * Configure webhook
     */
    // Complexity: O(1)
    webhook(url) {
        this.notifications.webhook(url);
        return this;
    }
    /**
     * Send notification
     */
    // Complexity: O(1)
    async notify(payload) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.notifications.notify(payload);
    }
    // ─────────────────────────────────────────────────────────────────────────
    // COMBINED OPERATIONS
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Report test results
     */
    // Complexity: O(N)
    async reportResults(results) {
        const { total, passed, failed, skipped, duration } = results;
        const passRate = total > 0 ? ((passed / total) * 100).toFixed(1) : '0';
        // Set CI outputs
        if (this.isCI()) {
            this.setOutput('total', String(total));
            this.setOutput('passed', String(passed));
            this.setOutput('failed', String(failed));
            this.setOutput('skipped', String(skipped));
            this.setOutput('pass_rate', passRate);
            this.setOutput('duration', String(duration));
        }
        // Send notification
        const level = failed > 0 ? 'error' : 'success';
        const title = failed > 0 ? '❌ Tests Failed' : '✅ Tests Passed';
        const message = `${passed}/${total} tests passed (${passRate}%)`;
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.notifications.notify({
            title,
            message,
            level,
            details: {
                Total: total,
                Passed: passed,
                Failed: failed,
                Skipped: skipped,
                Duration: `${(duration / 1000).toFixed(1)}s`,
                'Pass Rate': `${passRate}%`,
            },
        });
        // Add CI annotation for failures
        if (failed > 0 && this.isCI()) {
            this.annotate({
                type: 'error',
                title: 'Test Failures',
                message: `${failed} test(s) failed`,
            });
        }
    }
    /**
     * Generate CI workflow
     */
    // Complexity: O(1)
    generateWorkflow(provider) {
        const targetProvider = provider || this.getCIProvider();
        switch (targetProvider) {
            case 'github':
                return this.ci.generateGitHubWorkflow();
            case 'gitlab':
                return this.ci.generateGitLabCI();
            default:
                return this.ci.generateGitHubWorkflow();
        }
    }
}
exports.QAntumIntegration = QAntumIntegration;
// ═══════════════════════════════════════════════════════════════════════════════
// CONVENIENCE EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════
const getIntegration = () => QAntumIntegration.getInstance();
exports.getIntegration = getIntegration;
exports.default = QAntumIntegration;
