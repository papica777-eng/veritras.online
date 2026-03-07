/**
 * api — Qantum Module
 * @module api
 * @path src/infrastructure/apps/dashboard/src/lib/api.ts
 * @auto-documented BrutalDocEngine v2.1
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
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
  async getDashboardStats(): Promise<{
    totalRuns: number;
    totalRunsChange: number;
    passRate: number;
    passRateChange: number;
    failedTests: number;
    failedTestsChange: number;
    healedSelectors: number;
    healedSelectorsChange: number;
  }> {
    return this.request('/api/v1/dashboard/stats');
  }

  // Test runs
  // Complexity: O(1)
  async getTestRuns() {
    return this.request('/api/v1/runs');
  }

  // Complexity: O(1)
  async getTestRun(id: string) {
    return this.request(`/api/v1/runs/${id}`);
  }

  // Projects
  // Complexity: O(1)
  async getProjects() {
    return this.request('/api/v1/projects');
  }

  // Tests
  // Complexity: O(1)
  async runTests(data: any) {
    return this.request('/api/v1/tests/run', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // AI
  // Complexity: O(1)
  async generateTest(data: any) {
    return this.request('/api/v1/ai/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const apiClient = new ApiClient();
