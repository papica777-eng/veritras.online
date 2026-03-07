"use strict";
/**
 * api — Qantum Module
 * @module api
 * @path src/infrastructure/apps/dashboard/src/lib/api.ts
 * @auto-documented BrutalDocEngine v2.1
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiClient = exports.ApiClient = void 0;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';
class ApiClient {
    baseUrl;
    constructor(baseUrl = API_BASE_URL) {
        this.baseUrl = baseUrl;
    }
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        // SAFETY: async operation — wrap in try-catch for production resilience
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });
        if (!response.ok) {
            throw new Error(`API request failed: ${response.statusText}`);
        }
        return response.json();
    }
    // Dashboard stats
    // Complexity: O(1)
    async getDashboardStats() {
        return this.request('/api/v1/dashboard/stats');
    }
    // Test runs
    // Complexity: O(1)
    async getTestRuns() {
        return this.request('/api/v1/runs');
    }
    // Complexity: O(1)
    async getTestRun(id) {
        return this.request(`/api/v1/runs/${id}`);
    }
    // Projects
    // Complexity: O(1)
    async getProjects() {
        return this.request('/api/v1/projects');
    }
    // Tests
    // Complexity: O(1)
    async runTests(data) {
        return this.request('/api/v1/tests/run', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }
    // AI
    // Complexity: O(1)
    async generateTest(data) {
        return this.request('/api/v1/ai/generate', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }
}
exports.ApiClient = ApiClient;
exports.apiClient = new ApiClient();
