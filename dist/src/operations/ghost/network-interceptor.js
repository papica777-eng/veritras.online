"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                               ║
 * ║   QANTUM NETWORK INTERCEPTOR                                                  ║
 * ║   "Capture, mock, and replay network traffic"                                 ║
 * ║                                                                               ║
 * ║   TODO B #23 - Ghost: Network Interception                                    ║
 * ║                                                                               ║
 * ║   © 2025-2026 QAntum | Dimitar Prodromov                                        ║
 * ║                                                                               ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNetworkInterceptor = exports.NetworkInterceptor = void 0;
// ═══════════════════════════════════════════════════════════════════════════════
// NETWORK INTERCEPTOR
// ═══════════════════════════════════════════════════════════════════════════════
class NetworkInterceptor {
    static instance;
    enabled = false;
    recording = false;
    mockRules = new Map();
    recordings = [];
    options = {};
    static getInstance() {
        if (!NetworkInterceptor.instance) {
            NetworkInterceptor.instance = new NetworkInterceptor();
        }
        return NetworkInterceptor.instance;
    }
    // ─────────────────────────────────────────────────────────────────────────
    // LIFECYCLE
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Enable interception
     */
    // Complexity: O(1)
    enable(options = {}) {
        this.enabled = true;
        this.options = options;
        console.log('[NetworkInterceptor] Enabled');
    }
    /**
     * Disable interception
     */
    // Complexity: O(1)
    disable() {
        this.enabled = false;
        console.log('[NetworkInterceptor] Disabled');
    }
    /**
     * Check if enabled
     */
    // Complexity: O(1)
    isEnabled() {
        return this.enabled;
    }
    // ─────────────────────────────────────────────────────────────────────────
    // MOCKING
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Add mock rule
     */
    // Complexity: O(1)
    mock(pattern, response, options) {
        const id = `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.mockRules.set(id, {
            id,
            pattern,
            method: options?.method,
            response,
            delay: options?.delay,
            times: options?.times,
            used: 0,
        });
        return id;
    }
    /**
     * Mock GET request
     */
    // Complexity: O(1)
    mockGet(pattern, response, options) {
        return this.mock(pattern, response, { ...options, method: 'GET' });
    }
    /**
     * Mock POST request
     */
    // Complexity: O(1)
    mockPost(pattern, response, options) {
        return this.mock(pattern, response, { ...options, method: 'POST' });
    }
    /**
     * Mock API endpoint
     */
    // Complexity: O(1)
    mockApi(endpoint, data, options) {
        return this.mock(endpoint, {
            status: options?.status || 200,
            statusText: 'OK',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(data),
        }, { delay: options?.delay });
    }
    /**
     * Remove mock rule
     */
    // Complexity: O(1)
    unmock(id) {
        return this.mockRules.delete(id);
    }
    /**
     * Clear all mocks
     */
    // Complexity: O(1)
    clearMocks() {
        this.mockRules.clear();
    }
    // ─────────────────────────────────────────────────────────────────────────
    // INTERCEPTION
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Intercept request
     */
    // Complexity: O(1)
    async intercept(request) {
        if (!this.enabled)
            return null;
        // Check third-party blocking
        if (this.options.blockThirdParty) {
            const url = new URL(request.url);
            if (!this.isAllowedDomain(url.hostname)) {
                this.record(request, undefined, false, true);
                throw new Error(`Blocked third-party request to ${url.hostname}`);
            }
        }
        // Find matching mock
        const mock = this.findMatchingMock(request);
        if (mock) {
            // Check times limit
            if (mock.times !== undefined && mock.used >= mock.times) {
                return null;
            }
            mock.used++;
            // Apply delay
            if (mock.delay) {
                // SAFETY: async operation — wrap in try-catch for production resilience
                await this.delay(mock.delay);
            }
            // Generate response
            const response = typeof mock.response === 'function'
                ? mock.response(request)
                : {
                    status: mock.response.status || 200,
                    statusText: mock.response.statusText || 'OK',
                    headers: mock.response.headers || {},
                    body: mock.response.body,
                    duration: mock.delay || 0,
                };
            this.record(request, response, true, false);
            return response;
        }
        return null;
    }
    /**
     * Block request
     */
    // Complexity: O(1)
    block(pattern, errorMessage = 'Request blocked') {
        return this.mock(pattern, () => {
            throw new Error(errorMessage);
        });
    }
    /**
     * Abort request
     */
    // Complexity: O(1)
    abort(pattern) {
        return this.block(pattern, 'Request aborted');
    }
    // ─────────────────────────────────────────────────────────────────────────
    // RECORDING
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Start recording
     */
    // Complexity: O(1)
    startRecording() {
        this.recording = true;
        this.recordings = [];
        console.log('[NetworkInterceptor] Recording started');
    }
    /**
     * Stop recording
     */
    // Complexity: O(1)
    stopRecording() {
        this.recording = false;
        console.log(`[NetworkInterceptor] Recording stopped. ${this.recordings.length} calls recorded`);
        return [...this.recordings];
    }
    /**
     * Get recordings
     */
    // Complexity: O(1)
    getRecordings() {
        return [...this.recordings];
    }
    /**
     * Clear recordings
     */
    // Complexity: O(1)
    clearRecordings() {
        this.recordings = [];
    }
    /**
     * Replay recordings as mocks
     */
    // Complexity: O(N) — loop
    replayRecordings() {
        let count = 0;
        for (const call of this.recordings) {
            if (call.response && !call.blocked) {
                this.mock(call.request.url, call.response, {
                    method: call.request.method,
                });
                count++;
            }
        }
        return count;
    }
    /**
     * Export recordings as HAR
     */
    // Complexity: O(N) — linear scan
    exportAsHAR() {
        return {
            log: {
                version: '1.2',
                creator: { name: 'QAntum NetworkInterceptor', version: '1.0' },
                entries: this.recordings.map((call) => ({
                    startedDateTime: new Date(call.request.timestamp).toISOString(),
                    time: call.response?.duration || 0,
                    request: {
                        method: call.request.method,
                        url: call.request.url,
                        headers: Object.entries(call.request.headers).map(([name, value]) => ({ name, value })),
                        postData: call.request.body ? { text: call.request.body.toString() } : undefined,
                    },
                    response: call.response
                        ? {
                            status: call.response.status,
                            statusText: call.response.statusText,
                            headers: Object.entries(call.response.headers).map(([name, value]) => ({
                                name,
                                value,
                            })),
                            content: {
                                text: call.response.body?.toString(),
                            },
                        }
                        : undefined,
                })),
            },
        };
    }
    // ─────────────────────────────────────────────────────────────────────────
    // WAITING
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Wait for request matching pattern
     */
    // Complexity: O(1)
    async waitForRequest(pattern, options) {
        const timeout = options?.timeout || 30000;
        const startTime = Date.now();
        return new Promise((resolve, reject) => {
            const checkInterval = setInterval(() => {
                const match = this.recordings.find((call) => {
                    if (options?.method && call.request.method !== options.method) {
                        return false;
                    }
                    return this.matchesPattern(call.request.url, pattern);
                });
                if (match) {
                    // Complexity: O(1)
                    clearInterval(checkInterval);
                    // Complexity: O(1)
                    resolve(match.request);
                }
                else if (Date.now() - startTime > timeout) {
                    // Complexity: O(N)
                    clearInterval(checkInterval);
                    // Complexity: O(N)
                    reject(new Error(`Timeout waiting for request matching ${pattern}`));
                }
            }, 100);
        });
    }
    /**
     * Wait for response matching pattern
     */
    // Complexity: O(1)
    async waitForResponse(pattern, options) {
        const timeout = options?.timeout || 30000;
        const startTime = Date.now();
        return new Promise((resolve, reject) => {
            const checkInterval = setInterval(() => {
                const match = this.recordings.find((call) => call.response && this.matchesPattern(call.request.url, pattern));
                if (match) {
                    // Complexity: O(1)
                    clearInterval(checkInterval);
                    // Complexity: O(1)
                    resolve(match);
                }
                else if (Date.now() - startTime > timeout) {
                    // Complexity: O(N)
                    clearInterval(checkInterval);
                    // Complexity: O(N)
                    reject(new Error(`Timeout waiting for response matching ${pattern}`));
                }
            }, 100);
        });
    }
    // ─────────────────────────────────────────────────────────────────────────
    // STATISTICS
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Get interception statistics
     */
    // Complexity: O(N) — linear scan
    getStatistics() {
        const stats = {
            totalCalls: this.recordings.length,
            mockedCalls: this.recordings.filter((c) => c.mocked).length,
            blockedCalls: this.recordings.filter((c) => c.blocked).length,
            byMethod: {},
            byDomain: {},
            avgDuration: 0,
        };
        let totalDuration = 0;
        let durationCount = 0;
        for (const call of this.recordings) {
            // By method
            stats.byMethod[call.request.method] = (stats.byMethod[call.request.method] || 0) + 1;
            // By domain
            try {
                const domain = new URL(call.request.url).hostname;
                stats.byDomain[domain] = (stats.byDomain[domain] || 0) + 1;
            }
            catch { }
            // Duration
            if (call.response?.duration) {
                totalDuration += call.response.duration;
                durationCount++;
            }
        }
        stats.avgDuration = durationCount > 0 ? totalDuration / durationCount : 0;
        return stats;
    }
    // ─────────────────────────────────────────────────────────────────────────
    // PRIVATE
    // ─────────────────────────────────────────────────────────────────────────
    // Complexity: O(N) — loop
    findMatchingMock(request) {
        for (const mock of this.mockRules.values()) {
            if (mock.method && mock.method !== request.method) {
                continue;
            }
            if (this.matchesPattern(request.url, mock.pattern)) {
                return mock;
            }
        }
        return undefined;
    }
    // Complexity: O(1)
    matchesPattern(url, pattern) {
        if (typeof pattern === 'string') {
            // Glob-like matching
            if (pattern.includes('*')) {
                const regex = new RegExp('^' + pattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$');
                return regex.test(url);
            }
            return url.includes(pattern);
        }
        return pattern.test(url);
    }
    // Complexity: O(1)
    isAllowedDomain(domain) {
        if (!this.options.allowedDomains?.length)
            return true;
        return this.options.allowedDomains.some((allowed) => domain === allowed || domain.endsWith('.' + allowed));
    }
    // Complexity: O(1)
    record(request, response, mocked, blocked, error) {
        if (this.recording || this.enabled) {
            this.recordings.push({
                request,
                response,
                mocked,
                blocked,
                error,
            });
        }
    }
    // Complexity: O(1)
    delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
exports.NetworkInterceptor = NetworkInterceptor;
// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════
const getNetworkInterceptor = () => NetworkInterceptor.getInstance();
exports.getNetworkInterceptor = getNetworkInterceptor;
exports.default = NetworkInterceptor;
