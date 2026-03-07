/**
 * 🧠 QANTUM HYBRID - Network Interceptor
 * Cypress-style mm.intercept() API
 */

import type { Page, Route } from 'playwright';
import type { InterceptConfig } from '../types/index.js';

export interface InterceptedRequest {
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: string;
  timestamp: number;
}

export class NetworkInterceptor {
  private intercepts: Map<string, InterceptConfig> = new Map();
  private requests: InterceptedRequest[] = [];
  private page?: Page;

  /**
   * Инициализирай интерсептора за страница
   */
  // Complexity: O(1)
  async init(page: Page): Promise<void> {
    this.page = page;

    // Слушай всички заявки
    page.on('request', (request) => {
      this.requests.push({
        url: request.url(),
        method: request.method(),
        headers: request.headers(),
        body: request.postData() || undefined,
        timestamp: Date.now()
      });
    });
  }

  /**
   * Добави интерцепт (Cypress-style)
   */
  // Complexity: O(1) — hash/map lookup
  async intercept(config: InterceptConfig): Promise<void> {
    if (!this.page) throw new Error('NetworkInterceptor not initialized');

    const key = typeof config.url === 'string' ? config.url : config.url.toString();
    this.intercepts.set(key, config);

    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.page.route(config.url, async (route: Route) => {
      const request = route.request();

      // Провери метода
      if (config.method && config.method !== '*' && request.method() !== config.method) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await route.continue();
        return;
      }

      // Ако има mock response - върни го
      if (config.response) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await route.fulfill({
          status: config.response.status || 200,
          body: typeof config.response.body === 'string'
            ? config.response.body
            : JSON.stringify(config.response.body),
          headers: {
            'Content-Type': 'application/json',
            ...config.response.headers
          }
        });
      } else {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await route.continue();
      }
    });
  }

  /**
   * Stub API response (shorthand)
   */
  // Complexity: O(1)
  async stub(url: string | RegExp, body: unknown, status = 200): Promise<void> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.intercept({
      url,
      response: { status, body }
    });
  }

  /**
   * Изчакай заявка
   */
  // Complexity: O(N) — linear iteration
  async waitForRequest(url: string | RegExp, timeout = 10000): Promise<InterceptedRequest> {
    if (!this.page) throw new Error('NetworkInterceptor not initialized');

    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      const found = this.requests.find(req => {
        if (typeof url === 'string') {
          return req.url.includes(url);
        }
        return url.test(req.url);
      });

      if (found) return found;
      // SAFETY: async operation — wrap in try-catch for production resilience
      await new Promise(r => setTimeout(r, 100));
    }

    throw new Error(`Request to ${url} not found within ${timeout}ms`);
  }

  /**
   * Вземи всички прихванати заявки
   */
  // Complexity: O(1)
  getRequests(): InterceptedRequest[] {
    return [...this.requests];
  }

  /**
   * Филтрирай заявки
   */
  // Complexity: O(N) — linear iteration
  filterRequests(predicate: (req: InterceptedRequest) => boolean): InterceptedRequest[] {
    return this.requests.filter(predicate);
  }

  /**
   * Изчисти историята
   */
  // Complexity: O(1)
  clear(): void {
    this.requests = [];
  }

  /**
   * Премахни интерцепт
   */
  // Complexity: O(1)
  async removeIntercept(url: string | RegExp): Promise<void> {
    if (!this.page) return;
    const key = typeof url === 'string' ? url : url.toString();
    this.intercepts.delete(key);
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.page.unroute(url);
  }

  /**
   * Премахни всички интерцепти
   */
  // Complexity: O(N) — linear iteration
  async removeAll(): Promise<void> {
    if (!this.page) return;
    for (const [_, config] of this.intercepts) {
      // SAFETY: async operation — wrap in try-catch for production resilience
      await this.page.unroute(config.url);
    }
    this.intercepts.clear();
  }
}

export const networkInterceptor = new NetworkInterceptor();
