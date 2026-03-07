"use strict";
/**
 * 🔔 QAntum - Slack & Discord Webhooks Integration
 *
 * Features:
 * - Live test failure alerts with video links
 * - Success celebration messages
 * - Daily summary reports
 * - Self-healing notifications
 *
 * @version 1.0.0-QAntum
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
exports.WebhookNotifier = void 0;
exports.createWebhookNotifier = createWebhookNotifier;
const https = __importStar(require("https"));
const http = __importStar(require("http"));
// ============================================================
// WEBHOOK NOTIFIER CLASS
// ============================================================
class WebhookNotifier {
    config;
    constructor(config) {
        this.config = config;
    }
    // ============================================================
    // SLACK NOTIFICATIONS
    // ============================================================
    /**
     * Send test failure alert to Slack
     */
    // Complexity: O(1)
    async sendSlackFailureAlert(test) {
        if (!this.config.slackWebhookUrl || !this.config.enabled)
            return;
        const payload = {
            blocks: [
                {
                    type: 'header',
                    text: {
                        type: 'plain_text',
                        text: '🚨 Test Failure Alert',
                        emoji: true
                    }
                },
                {
                    type: 'section',
                    fields: [
                        {
                            type: 'mrkdwn',
                            text: `*Test Name:*\n${test.name}`
                        },
                        {
                            type: 'mrkdwn',
                            text: `*Duration:*\n${test.duration}s`
                        }
                    ]
                },
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: `*Error:*\n\`\`\`${test.error || 'Unknown error'}\`\`\``
                    }
                },
                {
                    type: 'actions',
                    elements: [
                        ...(test.video ? [{
                                type: 'button',
                                text: { type: 'plain_text', text: '🎬 Watch Video', emoji: true },
                                url: test.video,
                                style: 'primary'
                            }] : []),
                        ...(test.screenshot ? [{
                                type: 'button',
                                text: { type: 'plain_text', text: '📸 View Screenshot', emoji: true },
                                url: test.screenshot
                            }] : [])
                    ]
                },
                {
                    type: 'context',
                    elements: [
                        {
                            type: 'mrkdwn',
                            text: `🧠 Powered by *QAntum* v1.0.0.0 | ${new Date().toLocaleString()}`
                        }
                    ]
                }
            ]
        };
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.sendWebhook(this.config.slackWebhookUrl, payload);
    }
    /**
     * Send self-healing notification to Slack
     */
    // Complexity: O(1)
    async sendSlackHealingAlert(test) {
        if (!this.config.slackWebhookUrl || !this.config.enabled || !test.healingInfo)
            return;
        const payload = {
            blocks: [
                {
                    type: 'header',
                    text: {
                        type: 'plain_text',
                        text: '🔄 AI Self-Healing Activated',
                        emoji: true
                    }
                },
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: `Test *${test.name}* was automatically healed by QAntum AI`
                    }
                },
                {
                    type: 'section',
                    fields: [
                        {
                            type: 'mrkdwn',
                            text: `*Old Selector:*\n\`${test.healingInfo.oldSelector}\``
                        },
                        {
                            type: 'mrkdwn',
                            text: `*New Selector:*\n\`${test.healingInfo.newSelector}\``
                        },
                        {
                            type: 'mrkdwn',
                            text: `*Strategy:*\n${test.healingInfo.strategy}`
                        },
                        {
                            type: 'mrkdwn',
                            text: `*Confidence:*\n${test.healingInfo.confidence}%`
                        }
                    ]
                },
                {
                    type: 'context',
                    elements: [
                        {
                            type: 'mrkdwn',
                            text: `✨ No manual intervention required | 🧠 QAntum v1.0.0.0`
                        }
                    ]
                }
            ]
        };
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.sendWebhook(this.config.slackWebhookUrl, payload);
    }
    /**
     * Send success celebration to Slack
     */
    // Complexity: O(1)
    async sendSlackSuccessCelebration(summary) {
        if (!this.config.slackWebhookUrl || !this.config.enabled)
            return;
        if (summary.passRate < 100)
            return; // Only celebrate 100% pass rate
        const payload = {
            blocks: [
                {
                    type: 'header',
                    text: {
                        type: 'plain_text',
                        text: '🎉 Perfect Test Run!',
                        emoji: true
                    }
                },
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: `*All ${summary.total} tests passed!* 🚀\n\nGreat job team! Your code quality is exceptional.`
                    }
                },
                {
                    type: 'section',
                    fields: [
                        {
                            type: 'mrkdwn',
                            text: `*Pass Rate:*\n✅ 100%`
                        },
                        {
                            type: 'mrkdwn',
                            text: `*Duration:*\n⏱️ ${summary.duration}s`
                        },
                        {
                            type: 'mrkdwn',
                            text: `*Self-Healed:*\n🔄 ${summary.healed}`
                        },
                        {
                            type: 'mrkdwn',
                            text: `*Total Tests:*\n🧪 ${summary.total}`
                        }
                    ]
                },
                ...(summary.reportUrl ? [{
                        type: 'actions',
                        elements: [{
                                type: 'button',
                                text: { type: 'plain_text', text: '📊 View Full Report', emoji: true },
                                url: summary.reportUrl,
                                style: 'primary'
                            }]
                    }] : []),
                {
                    type: 'context',
                    elements: [
                        {
                            type: 'mrkdwn',
                            text: `🧠 Powered by *QAntum* AI Engine v1.0.0.0`
                        }
                    ]
                }
            ]
        };
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.sendWebhook(this.config.slackWebhookUrl, payload);
    }
    /**
     * Send daily summary to Slack
     */
    // Complexity: O(1)
    async sendSlackDailySummary(summary) {
        if (!this.config.slackWebhookUrl || !this.config.enabled)
            return;
        const statusEmoji = summary.passRate >= 95 ? '🟢' : summary.passRate >= 80 ? '🟡' : '🔴';
        const payload = {
            blocks: [
                {
                    type: 'header',
                    text: {
                        type: 'plain_text',
                        text: '📊 Daily Test Summary',
                        emoji: true
                    }
                },
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: `${statusEmoji} *Pass Rate: ${summary.passRate.toFixed(1)}%*`
                    }
                },
                {
                    type: 'divider'
                },
                {
                    type: 'section',
                    fields: [
                        { type: 'mrkdwn', text: `*Total:*\n${summary.total}` },
                        { type: 'mrkdwn', text: `*Passed:*\n✅ ${summary.passed}` },
                        { type: 'mrkdwn', text: `*Failed:*\n❌ ${summary.failed}` },
                        { type: 'mrkdwn', text: `*Skipped:*\n⏭️ ${summary.skipped}` },
                        { type: 'mrkdwn', text: `*Self-Healed:*\n🔄 ${summary.healed}` },
                        { type: 'mrkdwn', text: `*Duration:*\n⏱️ ${(summary.duration / 60).toFixed(1)}min` }
                    ]
                },
                ...(summary.reportUrl ? [{
                        type: 'actions',
                        elements: [{
                                type: 'button',
                                text: { type: 'plain_text', text: '📄 Download PDF Report', emoji: true },
                                url: summary.reportUrl
                            }]
                    }] : []),
                {
                    type: 'context',
                    elements: [
                        {
                            type: 'mrkdwn',
                            text: `🧠 QAntum v1.0.0.0 | ${new Date().toLocaleDateString()}`
                        }
                    ]
                }
            ]
        };
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.sendWebhook(this.config.slackWebhookUrl, payload);
    }
    // ============================================================
    // DISCORD NOTIFICATIONS
    // ============================================================
    /**
     * Send test failure alert to Discord
     */
    // Complexity: O(1)
    async sendDiscordFailureAlert(test) {
        if (!this.config.discordWebhookUrl || !this.config.enabled)
            return;
        const payload = {
            embeds: [{
                    title: '🚨 Test Failure Alert',
                    color: 0xef4444, // Red
                    fields: [
                        { name: 'Test Name', value: test.name, inline: true },
                        { name: 'Duration', value: `${test.duration}s`, inline: true },
                        { name: 'Error', value: `\`\`\`${test.error || 'Unknown error'}\`\`\`` }
                    ],
                    footer: {
                        text: '🧠 QAntum v1.0.0.0'
                    },
                    timestamp: new Date().toISOString()
                }]
        };
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.sendWebhook(this.config.discordWebhookUrl, payload);
    }
    /**
     * Send success celebration to Discord
     */
    // Complexity: O(1)
    async sendDiscordSuccessCelebration(summary) {
        if (!this.config.discordWebhookUrl || !this.config.enabled)
            return;
        if (summary.passRate < 100)
            return;
        const payload = {
            embeds: [{
                    title: '🎉 Perfect Test Run!',
                    description: `All **${summary.total}** tests passed! Great job team! 🚀`,
                    color: 0x10b981, // Green
                    fields: [
                        { name: '✅ Passed', value: summary.passed.toString(), inline: true },
                        { name: '🔄 Healed', value: summary.healed.toString(), inline: true },
                        { name: '⏱️ Duration', value: `${summary.duration}s`, inline: true }
                    ],
                    footer: {
                        text: '🧠 QAntum AI Engine v1.0.0.0'
                    },
                    timestamp: new Date().toISOString()
                }]
        };
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.sendWebhook(this.config.discordWebhookUrl, payload);
    }
    /**
     * Send daily summary to Discord
     */
    // Complexity: O(1)
    async sendDiscordDailySummary(summary) {
        if (!this.config.discordWebhookUrl || !this.config.enabled)
            return;
        const color = summary.passRate >= 95 ? 0x10b981 : summary.passRate >= 80 ? 0xf59e0b : 0xef4444;
        const payload = {
            embeds: [{
                    title: '📊 Daily Test Summary',
                    color,
                    fields: [
                        { name: '📈 Pass Rate', value: `${summary.passRate.toFixed(1)}%`, inline: true },
                        { name: '🧪 Total', value: summary.total.toString(), inline: true },
                        { name: '✅ Passed', value: summary.passed.toString(), inline: true },
                        { name: '❌ Failed', value: summary.failed.toString(), inline: true },
                        { name: '🔄 Healed', value: summary.healed.toString(), inline: true },
                        { name: '⏱️ Duration', value: `${(summary.duration / 60).toFixed(1)} min`, inline: true }
                    ],
                    footer: {
                        text: '🧠 QAntum v1.0.0.0'
                    },
                    timestamp: new Date().toISOString()
                }]
        };
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.sendWebhook(this.config.discordWebhookUrl, payload);
    }
    // ============================================================
    // HELPER METHODS
    // ============================================================
    // Complexity: O(1)
    async sendWebhook(url, payload) {
        return new Promise((resolve, reject) => {
            const data = JSON.stringify(payload);
            const urlObj = new URL(url);
            const options = {
                hostname: urlObj.hostname,
                port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
                path: urlObj.pathname + urlObj.search,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(data)
                }
            };
            const client = urlObj.protocol === 'https:' ? https : http;
            const req = client.request(options, (res) => {
                if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
                    // Complexity: O(1)
                    resolve();
                }
                else {
                    // Complexity: O(1)
                    reject(new Error(`Webhook failed with status ${res.statusCode}`));
                }
            });
            req.on('error', reject);
            req.write(data);
            req.end();
        });
    }
}
exports.WebhookNotifier = WebhookNotifier;
// ============================================================
// FACTORY FUNCTION
// ============================================================
function createWebhookNotifier(config) {
    return new WebhookNotifier(config);
}
// ============================================================
// EXAMPLE USAGE
// ============================================================
/*
const notifier = createWebhookNotifier({
    slackWebhookUrl: process.env.SLACK_WEBHOOK_URL,
    discordWebhookUrl: process.env.DISCORD_WEBHOOK_URL,
    enabled: true
});

// On test failure
    // SAFETY: async operation — wrap in try-catch for production resilience
await notifier.sendSlackFailureAlert({
    name: 'Login Test',
    status: 'failed',
    duration: 5.2,
    error: 'Element not found: #login-btn',
    video: 'https://example.com/video/123.mp4'
});

// On successful run
    // SAFETY: async operation — wrap in try-catch for production resilience
await notifier.sendSlackSuccessCelebration({
    total: 100,
    passed: 100,
    failed: 0,
    skipped: 0,
    healed: 3,
    passRate: 100,
    duration: 120
});
*/
