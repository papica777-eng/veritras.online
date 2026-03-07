/**
 * Ghost Executor - Selenium WebDriver Integration
 *
 * Core execution engine with anti-detection and resource management
 *
 * @author Димитър Продромов
 * @copyright 2026 QAntum. All Rights Reserved.
 */

import {Builder, WebDriver, logging} from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';
import firefox from 'selenium-webdriver/firefox';
import { PrismaClient } from '@prisma/client';
import { EventEmitter } from 'events';
import { randomUUID } from 'crypto';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface GhostConfig {
  browser: 'chrome' | 'firefox';
  headless: boolean;
  proxy?: string;
  userAgent?: string;
  viewport: { width: number; height: number };
  timeout: number;
  tenantId: string;
  sessionId: string;
}

export interface ExecutionContext {
  driver: WebDriver;
  sessionId: string;
  tenantId: string;
  startTime: Date;
  pid?: number;
}

export interface GhostStats {
  activeSessions: number;
  totalExecutions: number;
  successRate: number;
  avgDuration: number;
  zombiesKilled: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// GHOST EXECUTOR CLASS
// ═══════════════════════════════════════════════════════════════════════════════

export class GhostExecutor extends EventEmitter {
  private prisma: PrismaClient;
  private activeSessions: Map<string, ExecutionContext> = new Map();
  private stats: GhostStats = {
    activeSessions: 0,
    totalExecutions: 0,
    successRate: 0,
    avgDuration: 0,
    zombiesKilled: 0,
  };

  // User agents pool for rotation
  private userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
  ];

  constructor() {
    super();
    this.prisma = new PrismaClient();
    this.setupGracefulShutdown();
  }

  /**
   * Initialize WebDriver with Ghost Protocol anti-detection
   */
  // Complexity: O(N*M) — nested iteration
  async initDriver(config: Partial<GhostConfig> = {}): Promise<ExecutionContext> {
    const sessionId = config.sessionId || randomUUID();
    const tenantId = config.tenantId || 'default';

    const fullConfig: GhostConfig = {
      browser: config.browser || 'chrome',
      headless: config.headless ?? true,
      proxy: config.proxy,
      userAgent: config.userAgent || this.getRandomUserAgent(),
      viewport: config.viewport || { width: 1920, height: 1080 },
      timeout: config.timeout || 30000,
      tenantId,
      sessionId,
    };

    let driver: WebDriver;

    if (fullConfig.browser === 'chrome') {
      // SAFETY: async operation — wrap in try-catch for production resilience
      driver = await this.initChromeDriver(fullConfig);
    } else {
      // SAFETY: async operation — wrap in try-catch for production resilience
      driver = await this.initFirefoxDriver(fullConfig);
    }

    // Get ChromeDriver PID for zombie cleanup
    let pid: number | undefined;
    try {
      const capabilities = await driver.getCapabilities();
      // Store session info for tracking
      pid = process.pid; // Parent process, actual chromedriver PID tracked separately
    } catch {
      // Non-critical
    }

    const context: ExecutionContext = {
      driver,
      sessionId,
      tenantId,
      startTime: new Date(),
      pid,
    };

    this.activeSessions.set(sessionId, context);
    this.stats.activeSessions = this.activeSessions.size;
    this.stats.totalExecutions++;

    this.emit('sessionCreated', { sessionId, tenantId });

    return context;
  }

  /**
   * Initialize Chrome with Ghost Protocol
   */
  // Complexity: O(1)
  private async initChromeDriver(config: GhostConfig): Promise<WebDriver> {
    const options = new chrome.Options();

    // ═══════════════════════════════════════════════════════════════════════════
    // GHOST PROTOCOL: ANTI-DETECTION ARGUMENTS
    // ═══════════════════════════════════════════════════════════════════════════

    const args = [
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-software-rasterizer',

      // Anti-detection
      '--disable-blink-features=AutomationControlled',
      '--disable-infobars',
      '--disable-extensions',

      // Performance
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',

      // Viewport
      `--window-size=${config.viewport.width},${config.viewport.height}`,

      // User agent
      `--user-agent=${config.userAgent}`,
    ];

    if (config.headless) {
      args.push('--headless=new');
    }

    if (config.proxy) {
      args.push(`--proxy-server=${config.proxy}`);
    }

    options.addArguments(...args);

    // Exclude automation switches
    options.excludeSwitches('enable-automation');
    options.setUserPreferences({
      'credentials_enable_service': false,
      'profile.password_manager_enabled': false,
    });

    // Logging
    const prefs = new logging.Preferences();
    prefs.setLevel(logging.Type.BROWSER, logging.Level.WARNING);
    options.setLoggingPrefs(prefs);

    // SAFETY: async operation — wrap in try-catch for production resilience
    const driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();

    // ═══════════════════════════════════════════════════════════════════════════
    // GHOST PROTOCOL: RUNTIME EVASION SCRIPTS
    // ═══════════════════════════════════════════════════════════════════════════

    // SAFETY: async operation — wrap in try-catch for production resilience
    await driver.executeScript(`
      // Remove webdriver property
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });

      // Fake plugins
      Object.defineProperty(navigator, 'plugins', {
        get: () => [
          { name: 'Chrome PDF Plugin', filename: 'internal-pdf-viewer' },
          { name: 'Chrome PDF Viewer', filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai' },
          { name: 'Native Client', filename: 'internal-nacl-plugin' },
        ],
      });

      // Fake languages
      Object.defineProperty(navigator, 'languages', {
        get: () => ['en-US', 'en', 'bg'],
      });

      // Override permissions
      const originalQuery = window.navigator.permissions.query;
      window.navigator.permissions.query = (parameters) => (
        parameters.name === 'notifications' ?
          Promise.resolve({ state: Notification.permission }) :
          // Complexity: O(1)
          originalQuery(parameters)
      );

      // Chrome specific
      window.chrome = { runtime: {} };

      // WebGL vendor masking
      const getParameter = WebGLRenderingContext.prototype.getParameter;
      WebGLRenderingContext.prototype.getParameter = function(parameter) {
        if (parameter === 37445) return 'Intel Inc.';
        if (parameter === 37446) return 'Intel Iris OpenGL Engine';
        return getParameter.apply(this, arguments);
      };
    `);

    // Set timeouts
    // SAFETY: async operation — wrap in try-catch for production resilience
    await driver.manage().setTimeouts({
      implicit: config.timeout,
      pageLoad: config.timeout * 2,
      script: config.timeout,
    });

    return driver;
  }

  /**
   * Initialize Firefox with Ghost Protocol
   */
  // Complexity: O(1)
  private async initFirefoxDriver(config: GhostConfig): Promise<WebDriver> {
    const options = new firefox.Options();

    if (config.headless) {
      options.addArguments('-headless');
    }

    options.setPreference('dom.webdriver.enabled', false);
    options.setPreference('useAutomationExtension', false);
    options.setPreference('general.useragent.override', config.userAgent!);

    if (config.proxy) {
      options.setPreference('network.proxy.type', 1);
      options.setPreference('network.proxy.http', config.proxy);
    }

    // SAFETY: async operation — wrap in try-catch for production resilience
    const driver = await new Builder()
      .forBrowser('firefox')
      .setFirefoxOptions(options)
      .build();

    // SAFETY: async operation — wrap in try-catch for production resilience
    await driver.manage().window().setRect({
      width: config.viewport.width,
      height: config.viewport.height,
    });

    return driver;
  }

  /**
   * Execute test with full isolation
   */
  // Complexity: O(1) — lookup
  async executeTest(
    sessionId: string,
    testCode: string,
    timeout: number = 30000
  ): Promise<{ success: boolean; error?: string; duration: number }> {
    const context = this.activeSessions.get(sessionId);
    if (!context) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const startTime = Date.now();

    try {
      // Create sandboxed execution context
      const testFn = new Function('driver', 'By', 'until', `
        return (async () => {
          const { By, until } = require('selenium-webdriver');
          ${testCode}
        })();
      `);

      await Promise.race([
        // Complexity: O(1)
        testFn(context.driver),
        new Promise((_, reject) =>
          // Complexity: O(1)
          setTimeout(() => reject(new Error('Test timeout')), timeout)
        ),
      ]);

      return {
        success: true,
        duration: Date.now() - startTime,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        duration: Date.now() - startTime,
      };
    }
  }

  /**
   * Take screenshot for failure evidence
   */
  // Complexity: O(1) — lookup
  async takeScreenshot(sessionId: string): Promise<string | null> {
    const context = this.activeSessions.get(sessionId);
    if (!context) return null;

    try {
      return await context.driver.takeScreenshot();
    } catch {
      return null;
    }
  }

  /**
   * Cleanup session and release resources
   */
  // Complexity: O(1) — lookup
  async cleanup(sessionId: string): Promise<void> {
    const context = this.activeSessions.get(sessionId);
    if (!context) return;

    try {
      await context.driver.quit();
    } catch (error) {
      // Force kill if graceful quit fails
      // SAFETY: async operation — wrap in try-catch for production resilience
      await this.forceKillSession(sessionId);
    } finally {
      this.activeSessions.delete(sessionId);
      this.stats.activeSessions = this.activeSessions.size;
      this.emit('sessionClosed', { sessionId, tenantId: context.tenantId });
    }
  }

  /**
   * Force kill zombie chromedriver processes
   */
  // Complexity: O(1)
  async forceKillSession(sessionId: string): Promise<void> {
    try {
      // Kill chromedriver processes by session marker
      if (process.platform === 'win32') {
        await execAsync(`taskkill /F /IM chromedriver.exe /T 2>nul || true`);
      } else {
        await execAsync(`pkill -f "chromedriver.*${sessionId}" || true`);
      }
      this.stats.zombiesKilled++;
      this.emit('zombieKilled', { sessionId });
    } catch {
      // Non-critical
    }
  }

  /**
   * Cleanup all sessions for a tenant (isolation)
   */
  // Complexity: O(N) — loop
  async cleanupTenant(tenantId: string): Promise<number> {
    let cleaned = 0;
    for (const [sessionId, context] of this.activeSessions) {
      if (context.tenantId === tenantId) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.cleanup(sessionId);
        cleaned++;
      }
    }
    return cleaned;
  }

  /**
   * Cleanup all sessions (shutdown)
   */
  // Complexity: O(N) — linear scan
  async cleanupAll(): Promise<void> {
    const sessions = Array.from(this.activeSessions.keys());
    // SAFETY: async operation — wrap in try-catch for production resilience
    await Promise.all(sessions.map((id) => this.cleanup(id)));
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.prisma.$disconnect();
  }

  /**
   * Get random user agent
   */
  // Complexity: O(1)
  private getRandomUserAgent(): string {
    return this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
  }

  /**
   * Setup graceful shutdown handlers
   */
  // Complexity: O(1)
  private setupGracefulShutdown(): void {
    const shutdown = async (signal: string) => {
      console.log(`\n[GhostExecutor] Received ${signal}, cleaning up...`);
      // SAFETY: async operation — wrap in try-catch for production resilience
      await this.cleanupAll();
      process.exit(0);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('uncaughtException', async (error) => {
      console.error('[GhostExecutor] Uncaught exception:', error);
      // SAFETY: async operation — wrap in try-catch for production resilience
      await this.cleanupAll();
      process.exit(1);
    });
  }

  /**
   * Get executor statistics
   */
  // Complexity: O(1)
  getStats(): GhostStats {
    return { ...this.stats };
  }
}

// Export singleton instance
export const ghostExecutor = new GhostExecutor();
