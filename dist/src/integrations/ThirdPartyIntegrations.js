"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * MIND-ENGINE: THIRD-PARTY INTEGRATIONS
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Jira, Slack, TestRail, GitHub, Azure DevOps integrations
 *
 * @author dp | QAntum Labs
 * @version 1.0.0-QAntum
 * @license Commercial
 * ═══════════════════════════════════════════════════════════════════════════════
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationManager = exports.AzureDevOpsIntegration = exports.GitHubIntegration = exports.TestRailIntegration = exports.SlackIntegration = exports.JiraIntegration = void 0;
exports.createJiraIntegration = createJiraIntegration;
exports.createSlackIntegration = createSlackIntegration;
exports.createTestRailIntegration = createTestRailIntegration;
exports.createGitHubIntegration = createGitHubIntegration;
exports.createAzureDevOpsIntegration = createAzureDevOpsIntegration;
exports.createIntegrationManager = createIntegrationManager;
const events_1 = require("events");
// ═══════════════════════════════════════════════════════════════════════════════
// JIRA INTEGRATION
// ═══════════════════════════════════════════════════════════════════════════════
class JiraIntegration extends events_1.EventEmitter {
    config;
    headers;
    constructor(config) {
        super();
        this.config = config;
        this.headers = {
            'Authorization': `Basic ${Buffer.from(`${config.email}:${config.apiToken}`).toString('base64')}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
    }
    /**
     * Create bug from test failure
     */
    // Complexity: O(N) — loop
    async createBug(report) {
        const issueData = {
            fields: {
                project: { key: this.config.projectKey },
                summary: report.title,
                description: this.formatDescription(report),
                issuetype: { name: 'Bug' },
                priority: { name: this.mapPriority(report.priority) },
                labels: report.labels || ['automated-test', 'mind-engine'],
                ...(report.assignee && { assignee: { name: report.assignee } })
            }
        };
        // SAFETY: async operation — wrap in try-catch for production resilience
        const response = await this.request('POST', '/rest/api/3/issue', issueData);
        // Upload attachments
        if (report.attachments?.length) {
            for (const attachment of report.attachments) {
                // SAFETY: async operation — wrap in try-catch for production resilience
                await this.uploadAttachment(response.key, attachment);
            }
        }
        this.emit('bugCreated', { key: response.key, ...report });
        return response;
    }
    /**
     * Update issue status
     */
    // Complexity: O(N) — linear scan
    async updateStatus(issueKey, status) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const transitions = await this.getTransitions(issueKey);
        const transition = transitions.find((t) => t.name.toLowerCase() === status.toLowerCase());
        if (!transition) {
            throw new Error(`Transition to "${status}" not available`);
        }
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.request('POST', `/rest/api/3/issue/${issueKey}/transitions`, {
            transition: { id: transition.id }
        });
        this.emit('statusUpdated', { issueKey, status });
    }
    /**
     * Add comment to issue
     */
    // Complexity: O(1)
    async addComment(issueKey, comment) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.request('POST', `/rest/api/3/issue/${issueKey}/comment`, {
            body: {
                type: 'doc',
                version: 1,
                content: [{
                        type: 'paragraph',
                        content: [{ type: 'text', text: comment }]
                    }]
            }
        });
    }
    /**
     * Link test result to issue
     */
    // Complexity: O(1)
    async linkTestResult(issueKey, result) {
        const statusEmoji = result.status === 'passed' ? '✅' : '❌';
        const comment = `${statusEmoji} Test Result: ${result.name}

Status: ${result.status.toUpperCase()}
Duration: ${result.duration}ms
${result.error ? `Error: ${result.error}` : ''}`;
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.addComment(issueKey, comment);
    }
    /**
     * Search issues
     */
    // Complexity: O(1)
    async searchIssues(jql) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const response = await this.request('POST', '/rest/api/3/search', {
            jql,
            maxResults: 100
        });
        return response.issues;
    }
    /**
     * Get issue details
     */
    // Complexity: O(1)
    async getIssue(issueKey) {
        return this.request('GET', `/rest/api/3/issue/${issueKey}`);
    }
    // Complexity: O(1)
    async getTransitions(issueKey) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const response = await this.request('GET', `/rest/api/3/issue/${issueKey}/transitions`);
        return response.transitions;
    }
    // Complexity: O(1)
    async uploadAttachment(issueKey, filePath) {
        // Would implement file upload
        this.emit('attachmentUploaded', { issueKey, filePath });
    }
    // Complexity: O(N) — linear scan
    formatDescription(report) {
        return {
            type: 'doc',
            version: 1,
            content: [
                {
                    type: 'heading',
                    attrs: { level: 3 },
                    content: [{ type: 'text', text: 'Description' }]
                },
                {
                    type: 'paragraph',
                    content: [{ type: 'text', text: report.description }]
                },
                {
                    type: 'heading',
                    attrs: { level: 3 },
                    content: [{ type: 'text', text: 'Steps to Reproduce' }]
                },
                {
                    type: 'orderedList',
                    content: report.steps.map(step => ({
                        type: 'listItem',
                        content: [{ type: 'paragraph', content: [{ type: 'text', text: step }] }]
                    }))
                },
                {
                    type: 'heading',
                    attrs: { level: 3 },
                    content: [{ type: 'text', text: 'Expected Result' }]
                },
                {
                    type: 'paragraph',
                    content: [{ type: 'text', text: report.expectedResult }]
                },
                {
                    type: 'heading',
                    attrs: { level: 3 },
                    content: [{ type: 'text', text: 'Actual Result' }]
                },
                {
                    type: 'paragraph',
                    content: [{ type: 'text', text: report.actualResult }]
                },
                ...(report.environment ? [{
                        type: 'paragraph',
                        content: [{ type: 'text', text: `Environment: ${report.environment}` }]
                    }] : [])
            ]
        };
    }
    // Complexity: O(1)
    mapPriority(priority) {
        const map = {
            'critical': 'Highest',
            'high': 'High',
            'medium': 'Medium',
            'low': 'Low'
        };
        return map[priority] || 'Medium';
    }
    // Complexity: O(1)
    async request(method, path, body) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const response = await fetch(`${this.config.apiUrl}${path}`, {
            method,
            headers: this.headers,
            body: body ? JSON.stringify(body) : undefined
        });
        if (!response.ok) {
            throw new Error(`Jira API error: ${response.status} ${response.statusText}`);
        }
        return method === 'DELETE' ? null : response.json();
    }
}
exports.JiraIntegration = JiraIntegration;
// ═══════════════════════════════════════════════════════════════════════════════
// SLACK INTEGRATION
// ═══════════════════════════════════════════════════════════════════════════════
class SlackIntegration extends events_1.EventEmitter {
    webhookUrl;
    channel;
    botToken;
    constructor(config) {
        super();
        this.webhookUrl = config.webhookUrl;
        this.channel = config.channel;
        this.botToken = config.botToken;
    }
    /**
     * Send test summary
     */
    // Complexity: O(N) — linear scan
    async sendTestSummary(summary) {
        const color = summary.failed > 0 ? '#dc3545' : '#28a745';
        const emoji = summary.failed > 0 ? '❌' : '✅';
        const message = {
            channel: this.channel,
            attachments: [{
                    color,
                    blocks: [
                        {
                            type: 'header',
                            text: {
                                type: 'plain_text',
                                text: `${emoji} Test Results: ${summary.suiteName}`
                            }
                        },
                        {
                            type: 'section',
                            fields: [
                                { type: 'mrkdwn', text: `*Total Tests:*\n${summary.total}` },
                                { type: 'mrkdwn', text: `*Duration:*\n${this.formatDuration(summary.duration)}` },
                                { type: 'mrkdwn', text: `*Passed:*\n${summary.passed} ✅` },
                                { type: 'mrkdwn', text: `*Failed:*\n${summary.failed} ❌` },
                                { type: 'mrkdwn', text: `*Skipped:*\n${summary.skipped} ⏭️` },
                                { type: 'mrkdwn', text: `*Pass Rate:*\n${summary.passRate.toFixed(1)}%` }
                            ]
                        },
                        ...(summary.failedTests.length > 0 ? [{
                                type: 'section',
                                text: {
                                    type: 'mrkdwn',
                                    text: `*Failed Tests:*\n${summary.failedTests.slice(0, 5).map(t => `• ${t}`).join('\n')}`
                                }
                            }] : []),
                        {
                            type: 'context',
                            elements: [{
                                    type: 'mrkdwn',
                                    text: `Run at: ${new Date().toISOString()} | Branch: ${summary.branch || 'unknown'}`
                                }]
                        }
                    ]
                }]
        };
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.sendWebhook(message);
        this.emit('summarySent', summary);
    }
    /**
     * Send alert
     */
    // Complexity: O(N) — linear scan
    async sendAlert(alert) {
        const colorMap = {
            'error': '#dc3545',
            'warning': '#ffc107',
            'success': '#28a745',
            'info': '#17a2b8'
        };
        const message = {
            channel: this.channel,
            attachments: [{
                    color: colorMap[alert.type] || '#6c757d',
                    blocks: [
                        {
                            type: 'section',
                            text: {
                                type: 'mrkdwn',
                                text: `*${alert.title}*\n${alert.message}`
                            }
                        },
                        ...(alert.fields ? [{
                                type: 'section',
                                fields: alert.fields.map(f => ({
                                    type: 'mrkdwn',
                                    text: `*${f.name}:*\n${f.value}`
                                }))
                            }] : []),
                        ...(alert.actions ? [{
                                type: 'actions',
                                elements: alert.actions.map(a => ({
                                    type: 'button',
                                    text: { type: 'plain_text', text: a.text },
                                    url: a.url,
                                    style: a.style
                                }))
                            }] : [])
                    ]
                }]
        };
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.sendWebhook(message);
        this.emit('alertSent', alert);
    }
    /**
     * Send failure notification
     */
    // Complexity: O(1)
    async sendFailureNotification(failure) {
        const message = {
            channel: this.channel,
            attachments: [{
                    color: '#dc3545',
                    blocks: [
                        {
                            type: 'header',
                            text: { type: 'plain_text', text: '🚨 Test Failure Alert' }
                        },
                        {
                            type: 'section',
                            text: {
                                type: 'mrkdwn',
                                text: `*Test:* ${failure.testName}\n*Error:* ${failure.error}`
                            }
                        },
                        {
                            type: 'section',
                            fields: [
                                { type: 'mrkdwn', text: `*File:*\n${failure.file}` },
                                { type: 'mrkdwn', text: `*Line:*\n${failure.line || 'N/A'}` }
                            ]
                        },
                        ...(failure.stackTrace ? [{
                                type: 'section',
                                text: {
                                    type: 'mrkdwn',
                                    text: `*Stack Trace:*\n\`\`\`${failure.stackTrace.slice(0, 500)}\`\`\``
                                }
                            }] : [])
                    ]
                }]
        };
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.sendWebhook(message);
        this.emit('failureSent', failure);
    }
    /**
     * Upload file (requires bot token)
     */
    // Complexity: O(N)
    async uploadFile(filePath, title) {
        if (!this.botToken) {
            throw new Error('Bot token required for file uploads');
        }
        // Would implement file upload via Slack API
        this.emit('fileUploaded', { filePath, title });
    }
    // Complexity: O(1)
    async sendWebhook(message) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const response = await fetch(this.webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(message)
        });
        if (!response.ok) {
            throw new Error(`Slack webhook error: ${response.status}`);
        }
    }
    // Complexity: O(1)
    formatDuration(ms) {
        if (ms < 1000)
            return `${ms}ms`;
        if (ms < 60000)
            return `${(ms / 1000).toFixed(1)}s`;
        return `${(ms / 60000).toFixed(1)}m`;
    }
}
exports.SlackIntegration = SlackIntegration;
// ═══════════════════════════════════════════════════════════════════════════════
// TESTRAIL INTEGRATION
// ═══════════════════════════════════════════════════════════════════════════════
class TestRailIntegration extends events_1.EventEmitter {
    config;
    headers;
    constructor(config) {
        super();
        this.config = config;
        this.headers = {
            'Authorization': `Basic ${Buffer.from(`${config.username}:${config.apiKey}`).toString('base64')}`,
            'Content-Type': 'application/json'
        };
    }
    /**
     * Create test run
     */
    // Complexity: O(1)
    async createRun(name, caseIds) {
        const data = {
            name,
            suite_id: this.config.suiteId,
            include_all: !caseIds,
            case_ids: caseIds
        };
        // SAFETY: async operation — wrap in try-catch for production resilience
        const response = await this.request('POST', `add_run/${this.config.projectId}`, data);
        this.emit('runCreated', response);
        return response;
    }
    /**
     * Add test result
     */
    // Complexity: O(1)
    async addResult(runId, caseId, result) {
        const statusMap = {
            'passed': 1,
            'blocked': 2,
            'failed': 5,
            'skipped': 6
        };
        const data = {
            status_id: statusMap[result.status] || 5,
            comment: result.error || `Test ${result.status}`,
            elapsed: `${Math.ceil(result.duration / 1000)}s`
        };
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.request('POST', `add_result_for_case/${runId}/${caseId}`, data);
        this.emit('resultAdded', { runId, caseId, status: result.status });
    }
    /**
     * Add multiple results
     */
    // Complexity: O(N) — linear scan
    async addResults(runId, results) {
        const statusMap = {
            'passed': 1,
            'blocked': 2,
            'failed': 5,
            'skipped': 6
        };
        const data = {
            results: results.map(r => ({
                case_id: r.caseId,
                status_id: statusMap[r.result.status] || 5,
                comment: r.result.error || `Test ${r.result.status}`,
                elapsed: `${Math.ceil(r.result.duration / 1000)}s`
            }))
        };
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.request('POST', `add_results_for_cases/${runId}`, data);
        this.emit('resultsAdded', { runId, count: results.length });
    }
    /**
     * Close test run
     */
    // Complexity: O(1)
    async closeRun(runId) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.request('POST', `close_run/${runId}`);
        this.emit('runClosed', { runId });
    }
    /**
     * Get test cases
     */
    // Complexity: O(1)
    async getCases(suiteId) {
        const suite = suiteId || this.config.suiteId;
        // SAFETY: async operation — wrap in try-catch for production resilience
        const response = await this.request('GET', `get_cases/${this.config.projectId}&suite_id=${suite}`);
        return response.cases || response;
    }
    /**
     * Get run results
     */
    // Complexity: O(1)
    async getResults(runId) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const response = await this.request('GET', `get_results_for_run/${runId}`);
        return response.results || response;
    }
    /**
     * Sync test results from run
     */
    // Complexity: O(N) — loop
    async syncResults(runId, results, caseMapping) {
        let synced = 0;
        let failed = 0;
        for (const result of results) {
            const caseId = caseMapping.get(result.testId) || caseMapping.get(result.name);
            if (caseId) {
                try {
                    await this.addResult(runId, caseId, result);
                    synced++;
                }
                catch {
                    failed++;
                }
            }
            else {
                failed++;
            }
        }
        return { synced, failed, total: results.length };
    }
    // Complexity: O(1)
    async request(method, endpoint, body) {
        const url = `${this.config.apiUrl}/index.php?/api/v2/${endpoint}`;
        // SAFETY: async operation — wrap in try-catch for production resilience
        const response = await fetch(url, {
            method,
            headers: this.headers,
            body: body ? JSON.stringify(body) : undefined
        });
        if (!response.ok) {
            throw new Error(`TestRail API error: ${response.status}`);
        }
        return response.json();
    }
}
exports.TestRailIntegration = TestRailIntegration;
// ═══════════════════════════════════════════════════════════════════════════════
// GITHUB INTEGRATION
// ═══════════════════════════════════════════════════════════════════════════════
class GitHubIntegration extends events_1.EventEmitter {
    config;
    headers;
    constructor(config) {
        super();
        this.config = config;
        this.headers = {
            'Authorization': `token ${config.token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
        };
    }
    /**
     * Create issue from test failure
     */
    // Complexity: O(1)
    async createIssue(title, body, labels) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const response = await this.request('POST', `/repos/${this.config.owner}/${this.config.repo}/issues`, {
            title,
            body,
            labels: labels || ['automated-test', 'bug']
        });
        this.emit('issueCreated', response);
        return response;
    }
    /**
     * Create check run
     */
    // Complexity: O(1)
    async createCheckRun(name, headSha, conclusion, summary) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.request('POST', `/repos/${this.config.owner}/${this.config.repo}/check-runs`, {
            name,
            head_sha: headSha,
            status: 'completed',
            conclusion,
            output: {
                title: name,
                summary
            }
        });
        this.emit('checkRunCreated', { name, conclusion });
    }
    /**
     * Update commit status
     */
    // Complexity: O(1)
    async updateStatus(sha, state, description, context = 'mind-engine') {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.request('POST', `/repos/${this.config.owner}/${this.config.repo}/statuses/${sha}`, {
            state,
            description,
            context,
            target_url: this.config.targetUrl
        });
        this.emit('statusUpdated', { sha, state });
    }
    /**
     * Add comment to PR
     */
    // Complexity: O(1)
    async addPRComment(prNumber, comment) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.request('POST', `/repos/${this.config.owner}/${this.config.repo}/issues/${prNumber}/comments`, {
            body: comment
        });
        this.emit('commentAdded', { prNumber });
    }
    /**
     * Create release
     */
    // Complexity: O(1)
    async createRelease(tagName, name, body, draft = false) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.request('POST', `/repos/${this.config.owner}/${this.config.repo}/releases`, {
            tag_name: tagName,
            name,
            body,
            draft
        });
        this.emit('releaseCreated', { tagName });
    }
    // Complexity: O(1)
    async request(method, path, body) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const response = await fetch(`https://api.github.com${path}`, {
            method,
            headers: this.headers,
            body: body ? JSON.stringify(body) : undefined
        });
        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status}`);
        }
        return response.json();
    }
}
exports.GitHubIntegration = GitHubIntegration;
// ═══════════════════════════════════════════════════════════════════════════════
// AZURE DEVOPS INTEGRATION
// ═══════════════════════════════════════════════════════════════════════════════
class AzureDevOpsIntegration extends events_1.EventEmitter {
    config;
    headers;
    constructor(config) {
        super();
        this.config = config;
        this.headers = {
            'Authorization': `Basic ${Buffer.from(`:${config.pat}`).toString('base64')}`,
            'Content-Type': 'application/json'
        };
    }
    /**
     * Create work item
     */
    // Complexity: O(1)
    async createWorkItem(type, title, description) {
        const patchDocument = [
            { op: 'add', path: '/fields/System.Title', value: title },
            { op: 'add', path: '/fields/System.Description', value: description }
        ];
        // SAFETY: async operation — wrap in try-catch for production resilience
        const response = await this.request('POST', `/${this.config.project}/_apis/wit/workitems/$${type}?api-version=7.0`, patchDocument, 'application/json-patch+json');
        this.emit('workItemCreated', response);
        return response;
    }
    /**
     * Create test run
     */
    // Complexity: O(1)
    async createTestRun(name, planId) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const response = await this.request('POST', `/${this.config.project}/_apis/test/runs?api-version=7.0`, {
            name,
            plan: { id: planId },
            automated: true
        });
        this.emit('testRunCreated', response);
        return response;
    }
    /**
     * Add test results
     */
    // Complexity: O(N) — linear scan
    async addTestResults(runId, results) {
        const outcomeMap = {
            'passed': 'Passed',
            'failed': 'Failed',
            'skipped': 'NotExecuted'
        };
        const data = results.map(r => ({
            testCaseTitle: r.name,
            outcome: outcomeMap[r.status] || 'Failed',
            durationInMs: r.duration,
            errorMessage: r.error
        }));
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.request('POST', `/${this.config.project}/_apis/test/runs/${runId}/results?api-version=7.0`, data);
        this.emit('resultsAdded', { runId, count: results.length });
    }
    /**
     * Update build status
     */
    // Complexity: O(1)
    async updateBuildStatus(buildId, status) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.request('PATCH', `/${this.config.project}/_apis/build/builds/${buildId}?api-version=7.0`, {
            status
        });
    }
    // Complexity: O(1)
    async request(method, path, body, contentType) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const response = await fetch(`${this.config.orgUrl}${path}`, {
            method,
            headers: {
                ...this.headers,
                ...(contentType && { 'Content-Type': contentType })
            },
            body: body ? JSON.stringify(body) : undefined
        });
        if (!response.ok) {
            throw new Error(`Azure DevOps API error: ${response.status}`);
        }
        return response.json();
    }
}
exports.AzureDevOpsIntegration = AzureDevOpsIntegration;
// ═══════════════════════════════════════════════════════════════════════════════
// INTEGRATION MANAGER
// ═══════════════════════════════════════════════════════════════════════════════
class IntegrationManager extends events_1.EventEmitter {
    integrations = new Map();
    /**
     * Register integration
     */
    // Complexity: O(1) — lookup
    register(name, integration) {
        this.integrations.set(name, integration);
        this.emit('registered', { name });
    }
    /**
     * Get integration
     */
    get(name) {
        return this.integrations.get(name);
    }
    /**
     * Broadcast test results to all integrations
     */
    // Complexity: O(N) — loop
    async broadcastResults(results) {
        const outcomes = {};
        for (const [name, integration] of this.integrations) {
            try {
                if (typeof integration.onTestResults === 'function') {
                    await integration.onTestResults(results);
                    outcomes[name] = true;
                }
            }
            catch (error) {
                outcomes[name] = false;
                this.emit('broadcastError', { integration: name, error });
            }
        }
        return { outcomes };
    }
    /**
     * Report failure to all integrations
     */
    // Complexity: O(N) — loop
    async reportFailure(failure) {
        for (const [name, integration] of this.integrations) {
            try {
                if (name === 'jira' && integration instanceof JiraIntegration) {
                    await integration.createBug(failure);
                }
                if (name === 'slack' && integration instanceof SlackIntegration) {
                    await integration.sendAlert({
                        type: 'error',
                        title: failure.title,
                        message: failure.description
                    });
                }
                if (name === 'github' && integration instanceof GitHubIntegration) {
                    await integration.createIssue(failure.title, failure.description);
                }
            }
            catch (error) {
                this.emit('reportError', { integration: name, error });
            }
        }
    }
}
exports.IntegrationManager = IntegrationManager;
// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════
function createJiraIntegration(config) {
    return new JiraIntegration(config);
}
function createSlackIntegration(config) {
    return new SlackIntegration(config);
}
function createTestRailIntegration(config) {
    return new TestRailIntegration(config);
}
function createGitHubIntegration(config) {
    return new GitHubIntegration(config);
}
function createAzureDevOpsIntegration(config) {
    return new AzureDevOpsIntegration(config);
}
function createIntegrationManager() {
    return new IntegrationManager();
}
exports.default = {
    JiraIntegration,
    SlackIntegration,
    TestRailIntegration,
    GitHubIntegration,
    AzureDevOpsIntegration,
    IntegrationManager,
    createJiraIntegration,
    createSlackIntegration,
    createTestRailIntegration,
    createGitHubIntegration,
    createAzureDevOpsIntegration,
    createIntegrationManager
};
