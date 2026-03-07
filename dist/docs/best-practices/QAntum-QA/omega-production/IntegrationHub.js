"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * INTEGRATION HUB - The Lock-In Engine
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * "Колкото по-дълбоко се интегрираме, толкова по-скъпо е да се махнат от нас."
 *
 * The Integration Hub connects QAntum to:
 * - Slack: Real-time alerts and commands
 * - Jira: Issue creation and tracking
 * - GitHub: PR scanning, code analysis
 * - Webhook: Universal event dispatch
 *
 * Each integration increases switching cost exponentially.
 *
 * @author Димитър Продромов / Mister Mind
 * @copyright 2026 QAntum Empire. All Rights Reserved.
 * @version 33.1.0 - THE ETHICAL PREDATOR
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
exports.IntegrationHub = void 0;
const events_1 = require("events");
const fs_1 = require("fs");
const path_1 = require("path");
const https = __importStar(require("https"));
const http = __importStar(require("http"));
// ═══════════════════════════════════════════════════════════════════════════════
// INTEGRATION HUB
// ═══════════════════════════════════════════════════════════════════════════════
class IntegrationHub extends events_1.EventEmitter {
    static instance;
    // State
    integrations = new Map();
    // Paths
    DATA_PATH = (0, path_1.join)(process.cwd(), 'data', 'integrations');
    CONFIG_FILE;
    // Adapters
    adapters = new Map();
    constructor() {
        super();
        this.CONFIG_FILE = (0, path_1.join)(this.DATA_PATH, 'config.json');
        this.ensureDirectories();
        this.loadConfig();
        this.registerAdapters();
        console.log(`
🔗 ═══════════════════════════════════════════════════════════════════════════════
   INTEGRATION HUB v33.1 - THE LOCK-IN ENGINE
   ─────────────────────────────────────────────────────────────────────────────
   Active Integrations: ${this.integrations.size}
   Adapters: ${this.adapters.size}
   "Всеки канал е верига, която ни свързва с клиента."
═══════════════════════════════════════════════════════════════════════════════
    `);
    }
    static getInstance() {
        if (!IntegrationHub.instance) {
            IntegrationHub.instance = new IntegrationHub();
        }
        return IntegrationHub.instance;
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // ADAPTER REGISTRATION
    // ═══════════════════════════════════════════════════════════════════════════
    registerAdapters() {
        this.adapters.set('SLACK', new SlackAdapter());
        this.adapters.set('JIRA', new JiraAdapter());
        this.adapters.set('GITHUB', new GitHubAdapter());
        this.adapters.set('WEBHOOK', new WebhookAdapter());
        this.adapters.set('TEAMS', new TeamsAdapter());
        this.adapters.set('DISCORD', new DiscordAdapter());
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // INTEGRATION MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Register a new integration for a client.
     */
    register(clientId, type, name, config) {
        console.log(`\n🔗 [HUB] Registering ${type} integration for client ${clientId}...`);
        const id = `INT-${Date.now().toString(36).toUpperCase()}-${type}`;
        const integration = {
            id,
            clientId,
            type,
            name,
            config,
            enabled: true,
            createdAt: new Date(),
            lastUsed: null,
            stats: {
                messagesSent: 0,
                issuesCreated: 0,
            },
        };
        this.integrations.set(id, integration);
        this.saveConfig();
        console.log(`   └─ Integration ID: ${id}`);
        console.log(`   └─ Type: ${type}`);
        console.log(`   └─ Status: ENABLED`);
        this.emit('integration:registered', integration);
        return integration;
    }
    /**
     * Send a message through an integration.
     */
    async send(integrationId, message) {
        const integration = this.integrations.get(integrationId);
        if (!integration) {
            console.error(`[HUB] Integration not found: ${integrationId}`);
            return false;
        }
        if (!integration.enabled) {
            console.warn(`[HUB] Integration disabled: ${integrationId}`);
            return false;
        }
        const adapter = this.adapters.get(integration.type);
        if (!adapter) {
            console.error(`[HUB] No adapter for type: ${integration.type}`);
            return false;
        }
        try {
            await adapter.send(integration, message);
            integration.lastUsed = new Date();
            integration.stats.messagesSent++;
            this.saveConfig();
            this.emit('message:sent', { integration, message });
            return true;
        }
        catch (error) {
            integration.stats.lastError = error instanceof Error ? error.message : String(error);
            integration.stats.lastErrorAt = new Date();
            this.saveConfig();
            this.emit('message:error', { integration, message, error });
            return false;
        }
    }
    /**
     * Broadcast a message to all enabled integrations for a client.
     */
    async broadcast(clientId, message) {
        const results = { success: 0, failed: 0 };
        const clientIntegrations = Array.from(this.integrations.values())
            .filter(i => i.clientId === clientId && i.enabled);
        for (const integration of clientIntegrations) {
            const success = await this.send(integration.id, message);
            if (success)
                results.success++;
            else
                results.failed++;
        }
        return results;
    }
    /**
     * Create an issue in connected issue tracker (Jira/GitHub).
     */
    async createIssue(clientId, issue) {
        // Find Jira or GitHub integration
        const integration = Array.from(this.integrations.values())
            .find(i => i.clientId === clientId && (i.type === 'JIRA' || i.type === 'GITHUB') && i.enabled);
        if (!integration) {
            return { created: false };
        }
        const adapter = this.adapters.get(integration.type);
        if (!adapter || !adapter.createIssue) {
            return { created: false };
        }
        try {
            const result = await adapter.createIssue(integration, issue);
            integration.stats.issuesCreated++;
            this.saveConfig();
            return result;
        }
        catch {
            return { created: false };
        }
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // QUICK SETUP
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Quick setup for Slack integration.
     */
    setupSlack(clientId, webhookUrl, channel) {
        return this.register(clientId, 'SLACK', 'Slack Alerts', {
            webhookUrl,
            channel: channel || '#qantum-alerts',
            events: ['critical', 'security', 'performance'],
        });
    }
    /**
     * Quick setup for Jira integration.
     */
    setupJira(clientId, apiToken, projectKey) {
        return this.register(clientId, 'JIRA', 'Jira Issues', {
            apiToken,
            projectKey,
            events: ['critical', 'security'],
        });
    }
    /**
     * Quick setup for GitHub integration.
     */
    setupGitHub(clientId, apiToken, repository) {
        return this.register(clientId, 'GITHUB', 'GitHub Integration', {
            apiToken,
            repository,
            events: ['security', 'code-review'],
        });
    }
    /**
     * Quick setup for custom webhook.
     */
    setupWebhook(clientId, webhookUrl, events) {
        return this.register(clientId, 'WEBHOOK', 'Custom Webhook', {
            webhookUrl,
            events,
        });
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // UTILITIES
    // ═══════════════════════════════════════════════════════════════════════════
    enable(integrationId) {
        const integration = this.integrations.get(integrationId);
        if (integration) {
            integration.enabled = true;
            this.saveConfig();
            return true;
        }
        return false;
    }
    disable(integrationId) {
        const integration = this.integrations.get(integrationId);
        if (integration) {
            integration.enabled = false;
            this.saveConfig();
            return true;
        }
        return false;
    }
    remove(integrationId) {
        if (this.integrations.has(integrationId)) {
            this.integrations.delete(integrationId);
            this.saveConfig();
            return true;
        }
        return false;
    }
    getIntegration(id) {
        return this.integrations.get(id);
    }
    getClientIntegrations(clientId) {
        return Array.from(this.integrations.values())
            .filter(i => i.clientId === clientId);
    }
    getAllIntegrations() {
        return Array.from(this.integrations.values());
    }
    getStats() {
        const integrations = this.getAllIntegrations();
        return {
            total: integrations.length,
            enabled: integrations.filter(i => i.enabled).length,
            byType: {
                slack: integrations.filter(i => i.type === 'SLACK').length,
                jira: integrations.filter(i => i.type === 'JIRA').length,
                github: integrations.filter(i => i.type === 'GITHUB').length,
                webhook: integrations.filter(i => i.type === 'WEBHOOK').length,
                teams: integrations.filter(i => i.type === 'TEAMS').length,
                discord: integrations.filter(i => i.type === 'DISCORD').length,
            },
            totalMessages: integrations.reduce((sum, i) => sum + i.stats.messagesSent, 0),
            totalIssues: integrations.reduce((sum, i) => sum + i.stats.issuesCreated, 0),
        };
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // PERSISTENCE
    // ═══════════════════════════════════════════════════════════════════════════
    ensureDirectories() {
        if (!(0, fs_1.existsSync)(this.DATA_PATH)) {
            (0, fs_1.mkdirSync)(this.DATA_PATH, { recursive: true });
        }
    }
    loadConfig() {
        try {
            if ((0, fs_1.existsSync)(this.CONFIG_FILE)) {
                const data = JSON.parse((0, fs_1.readFileSync)(this.CONFIG_FILE, 'utf-8'));
                for (const int of data) {
                    int.createdAt = new Date(int.createdAt);
                    int.lastUsed = int.lastUsed ? new Date(int.lastUsed) : null;
                    if (int.stats.lastErrorAt) {
                        int.stats.lastErrorAt = new Date(int.stats.lastErrorAt);
                    }
                    this.integrations.set(int.id, int);
                }
            }
        }
        catch {
            // Start fresh
        }
    }
    saveConfig() {
        const data = Array.from(this.integrations.values());
        (0, fs_1.writeFileSync)(this.CONFIG_FILE, JSON.stringify(data, null, 2));
    }
}
exports.IntegrationHub = IntegrationHub;
class SlackAdapter {
    async send(integration, message) {
        const payload = {
            channel: integration.config.channel,
            attachments: [{
                    color: this.getPriorityColor(message.priority),
                    title: message.title,
                    text: message.body,
                    footer: 'QAntum OMEGA v33.1',
                    ts: Math.floor(Date.now() / 1000),
                }],
        };
        await this.post(integration.config.webhookUrl, payload);
    }
    getPriorityColor(priority) {
        switch (priority) {
            case 'CRITICAL': return '#FF0000';
            case 'HIGH': return '#FF6B00';
            case 'MEDIUM': return '#FFD700';
            default: return '#00FF00';
        }
    }
    post(url, data) {
        return new Promise((resolve, reject) => {
            const urlObj = new URL(url);
            const options = {
                hostname: urlObj.hostname,
                path: urlObj.pathname,
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            };
            const req = https.request(options, (res) => {
                if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
                    resolve();
                }
                else {
                    reject(new Error(`HTTP ${res.statusCode}`));
                }
            });
            req.on('error', reject);
            req.write(JSON.stringify(data));
            req.end();
        });
    }
}
class JiraAdapter {
    async send(_integration, _message) {
        // Jira doesn't support direct messaging - use createIssue instead
        console.log('[JIRA] Use createIssue for Jira integration');
    }
    async createIssue(integration, issue) {
        // In production, this would call Jira API
        console.log(`[JIRA] Creating issue in project ${integration.config.projectKey}: ${issue.title}`);
        return { created: true, url: `https://jira.example.com/browse/${integration.config.projectKey}-XXX` };
    }
}
class GitHubAdapter {
    async send(_integration, _message) {
        // GitHub uses createIssue for notifications
        console.log('[GITHUB] Use createIssue for GitHub integration');
    }
    async createIssue(integration, issue) {
        // In production, this would call GitHub API
        console.log(`[GITHUB] Creating issue in ${integration.config.repository}: ${issue.title}`);
        return { created: true, url: `https://github.com/${integration.config.repository}/issues/XXX` };
    }
}
class WebhookAdapter {
    async send(integration, message) {
        const payload = {
            event: message.type,
            priority: message.priority,
            title: message.title,
            body: message.body,
            data: message.data,
            timestamp: new Date().toISOString(),
            source: 'QAntum OMEGA v33.1',
        };
        await this.post(integration.config.webhookUrl, payload);
    }
    post(url, data) {
        return new Promise((resolve, reject) => {
            const urlObj = new URL(url);
            const protocol = urlObj.protocol === 'https:' ? https : http;
            const options = {
                hostname: urlObj.hostname,
                port: urlObj.port,
                path: urlObj.pathname,
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            };
            const req = protocol.request(options, (res) => {
                if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
                    resolve();
                }
                else {
                    reject(new Error(`HTTP ${res.statusCode}`));
                }
            });
            req.on('error', reject);
            req.write(JSON.stringify(data));
            req.end();
        });
    }
}
class TeamsAdapter {
    async send(integration, message) {
        const payload = {
            '@type': 'MessageCard',
            '@context': 'http://schema.org/extensions',
            themeColor: this.getPriorityColor(message.priority),
            summary: message.title,
            sections: [{
                    activityTitle: message.title,
                    text: message.body,
                    markdown: true,
                }],
        };
        await this.post(integration.config.webhookUrl, payload);
    }
    getPriorityColor(priority) {
        switch (priority) {
            case 'CRITICAL': return 'FF0000';
            case 'HIGH': return 'FF6B00';
            case 'MEDIUM': return 'FFD700';
            default: return '00FF00';
        }
    }
    post(url, data) {
        return new Promise((resolve, reject) => {
            const urlObj = new URL(url);
            const options = {
                hostname: urlObj.hostname,
                path: urlObj.pathname,
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            };
            const req = https.request(options, (res) => {
                if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
                    resolve();
                }
                else {
                    reject(new Error(`HTTP ${res.statusCode}`));
                }
            });
            req.on('error', reject);
            req.write(JSON.stringify(data));
            req.end();
        });
    }
}
class DiscordAdapter {
    async send(integration, message) {
        const payload = {
            embeds: [{
                    title: message.title,
                    description: message.body,
                    color: this.getPriorityColorInt(message.priority),
                    footer: { text: 'QAntum OMEGA v33.1' },
                    timestamp: new Date().toISOString(),
                }],
        };
        await this.post(integration.config.webhookUrl, payload);
    }
    getPriorityColorInt(priority) {
        switch (priority) {
            case 'CRITICAL': return 0xFF0000;
            case 'HIGH': return 0xFF6B00;
            case 'MEDIUM': return 0xFFD700;
            default: return 0x00FF00;
        }
    }
    post(url, data) {
        return new Promise((resolve, reject) => {
            const urlObj = new URL(url);
            const options = {
                hostname: urlObj.hostname,
                path: urlObj.pathname,
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            };
            const req = https.request(options, (res) => {
                if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
                    resolve();
                }
                else {
                    reject(new Error(`HTTP ${res.statusCode}`));
                }
            });
            req.on('error', reject);
            req.write(JSON.stringify(data));
            req.end();
        });
    }
}
// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════
exports.default = IntegrationHub;
