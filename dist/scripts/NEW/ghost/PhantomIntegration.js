"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║              QATOOL PHANTOM INTEGRATION - AUTO-STEALTH MODE                    ║
 * ╠═══════════════════════════════════════════════════════════════════════════════╣
 * ║                                                                               ║
 * ║     Automatic Phantom Mode activation when cf-turnstile is detected           ║
 * ║     Seamless integration with QATool test framework                           ║
 * ║                                                                               ║
 * ║     Created: 2026-01-01 | QAntum Prime v28.1.1 SUPREME                        ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.examplePhantomTest = exports.PhantomModeController = void 0;
exports.createPhantomFixture = createPhantomFixture;
const CloudflareBypass_1 = require("./CloudflareBypass");
// ═══════════════════════════════════════════════════════════════════════════════
// PHANTOM MODE CONTROLLER
// ═══════════════════════════════════════════════════════════════════════════════
class PhantomModeController {
    bypass;
    isPhantomActive = false;
    autoDetect = true;
    constructor() {
        this.bypass = new CloudflareBypass_1.CloudflareBypass({
            autoRotateTLS: true,
            spoofFingerprints: true,
            emulateHuman: true,
            maxAttempts: 5,
            telemetryEnabled: true,
        });
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // PLAYWRIGHT HOOK
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Wrap a Playwright page with automatic Phantom Mode
     * Use this in QATool tests for seamless Cloudflare bypass
     */
    // Complexity: O(N*M) — nested iteration detected
    async wrapPage(page) {
        // Pre-inject fingerprint spoofing
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.injectStealthContext(page);
        // Monitor for Cloudflare challenges
        page.on('response', async (response) => {
            if (this.autoDetect) {
                // SAFETY: async operation — wrap in try-catch for production resilience
                await this.checkForChallenge(page, response);
            }
        });
        // Monitor for Turnstile widget
        page.on('frameattached', async (frame) => {
            const url = frame.url();
            if (url.includes('challenges.cloudflare.com') || url.includes('turnstile')) {
                console.log('[PHANTOM] 🛡️ Turnstile iframe detected - activating Phantom Mode');
                // SAFETY: async operation — wrap in try-catch for production resilience
                await this.activatePhantomMode(page);
            }
        });
        return page;
    }
    /**
     * Wrap browser context with stealth defaults
     */
    // Complexity: O(N*M) — nested iteration detected
    async wrapContext(context) {
        // Set stealth headers
        const headers = this.bypass.getStealthHeaders('');
        // SAFETY: async operation — wrap in try-catch for production resilience
        await context.setExtraHTTPHeaders(headers);
        // Route handler for CF challenge detection
        // SAFETY: async operation — wrap in try-catch for production resilience
        await context.route('**/*', async (route) => {
            const request = route.request();
            // SAFETY: async operation — wrap in try-catch for production resilience
            const response = await route.fetch();
            // Check for CF challenge in response
            const contentType = response.headers()['content-type'] || '';
            if (contentType.includes('text/html')) {
                // SAFETY: async operation — wrap in try-catch for production resilience
                const body = await response.text();
                if (this.bypass.detectWAFChallenge(body, response.headers())) {
                    console.log('[PHANTOM] ⚠️ CF Challenge detected in response');
                    this.isPhantomActive = true;
                }
            }
            // SAFETY: async operation — wrap in try-catch for production resilience
            await route.fulfill({ response });
        });
        return context;
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // STEALTH INJECTION
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Inject stealth context into page
     */
    // Complexity: O(1) — hash/map lookup
    async injectStealthContext(page) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await page.addInitScript(`
      // ═══════════════════════════════════════════════════════════════════════
      // PHANTOM MODE - PRE-INJECTION STEALTH
      // ═══════════════════════════════════════════════════════════════════════
      
      // Remove webdriver flag
      Object.defineProperty(navigator, 'webdriver', {
        get: () => false,
        configurable: true
      });
      
      // Chrome runtime mock
      window.chrome = {
        runtime: {},
        loadTimes: () => ({}),
        csi: () => ({}),
        app: {}
      };
      
      // Permissions mock
      const originalQuery = window.navigator.permissions?.query;
      if (originalQuery) {
        window.navigator.permissions.query = (parameters) => (
          parameters.name === 'notifications' ?
            Promise.resolve({ state: Notification.permission }) :
            // Complexity: O(1)
            originalQuery(parameters)
        );
      }
      
      // Plugin mock
      Object.defineProperty(navigator, 'plugins', {
        get: () => [
          { name: 'Chrome PDF Plugin', filename: 'internal-pdf-viewer' },
          { name: 'Chrome PDF Viewer', filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai' },
          { name: 'Native Client', filename: 'internal-nacl-plugin' }
        ]
      });
      
      // Languages
      Object.defineProperty(navigator, 'languages', {
        get: () => ['en-US', 'en']
      });
      
      console.log('[PHANTOM] 👻 Pre-injection stealth active');
    `);
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // CHALLENGE DETECTION
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Check response for Cloudflare challenge
     */
    // Complexity: O(N)
    async checkForChallenge(page, response) {
        try {
            const headers = response.headers();
            const status = response.status();
            // CF challenge typically returns 403 or 503
            if (status === 403 || status === 503) {
                const cfRay = headers['cf-ray'];
                if (cfRay) {
                    console.log(`[PHANTOM] ⚡ CF-Ray detected: ${cfRay}`);
                    await this.activatePhantomMode(page);
                }
            }
            // Check for challenge page content
            const contentType = headers['content-type'] || '';
            if (contentType.includes('text/html') && response.url().includes(page.url())) {
                // SAFETY: async operation — wrap in try-catch for production resilience
                const body = await response.text().catch(() => '');
                if (this.bypass.detectWAFChallenge(body, headers)) {
                    // SAFETY: async operation — wrap in try-catch for production resilience
                    await this.activatePhantomMode(page);
                }
            }
        }
        catch (e) {
            // Ignore errors in detection
        }
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // PHANTOM MODE ACTIVATION
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Activate full Phantom Mode
     */
    // Complexity: O(1) — hash/map lookup
    async activatePhantomMode(page) {
        if (this.isPhantomActive) {
            console.log('[PHANTOM] 👻 Phantom Mode already active');
        }
        else {
            console.log('[PHANTOM] 👻 ACTIVATING PHANTOM MODE...');
            this.isPhantomActive = true;
        }
        // SAFETY: async operation — wrap in try-catch for production resilience
        const content = await page.content();
        // SAFETY: async operation — wrap in try-catch for production resilience
        const result = await this.bypass.autoBypass(content, {}, page);
        if (result.success) {
            console.log(`[PHANTOM] ✅ Cloudflare bypassed: ${result.method} (${result.duration}ms)`);
        }
        else {
            console.log(`[PHANTOM] ⚠️ Bypass failed after ${result.attempts} attempts`);
        }
        return result;
    }
    /**
     * Manually trigger bypass (for explicit test control)
     */
    // Complexity: O(N) — potential recursive descent
    async triggerBypass(page) {
        return this.activatePhantomMode(page);
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // CONFIGURATION
    // ═══════════════════════════════════════════════════════════════════════════
    // Complexity: O(1)
    setAutoDetect(enabled) {
        this.autoDetect = enabled;
    }
    // Complexity: O(1)
    isActive() {
        return this.isPhantomActive;
    }
    // Complexity: O(1)
    getStats() {
        return {
            bypasses: this.bypass.getBypassCount(),
            telemetry: this.bypass.getTelemetry(),
        };
    }
}
exports.PhantomModeController = PhantomModeController;
// ═══════════════════════════════════════════════════════════════════════════════
// QATOOL TEST HELPERS
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * QATool fixture for Phantom Mode tests
 *
 * Usage in test:
 * ```typescript
 * import { phantomTest } from '@mistmind/ghost/PhantomIntegration';
 *
 * phantomTest('should bypass Turnstile', async ({ page }) => {
 // SAFETY: async operation — wrap in try-catch for production resilience
 *   await page.goto('https://protected-site.com');
 *   // Phantom Mode auto-activates on CF detection
 // SAFETY: async operation — wrap in try-catch for production resilience
 *   await expect(page.locator('.content')).toBeVisible();
 * });
 * ```
 */
function createPhantomFixture() {
    const controller = new PhantomModeController();
    return {
        /**
         * Use in test.beforeEach to wrap page
         */
        async beforeEach(page) {
            return controller.wrapPage(page);
        },
        /**
         * Manual bypass trigger
         */
        // Complexity: O(1)
        async bypass(page) {
            return controller.triggerBypass(page);
        },
        /**
         * Get bypass statistics
         */
        // Complexity: O(1)
        getStats() {
            return controller.getStats();
        },
        /**
         * Controller instance for advanced usage
         */
        controller,
    };
}
// ═══════════════════════════════════════════════════════════════════════════════
// PLAYWRIGHT TEST EXTENSION
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * Example Playwright test with Phantom Mode
 */
exports.examplePhantomTest = `
import { test, expect } from '@playwright/test';
import { createPhantomFixture } from '@mistmind/ghost/PhantomIntegration';

const phantom = createPhantomFixture();

test.describe('Cloudflare Protected Site', () => {
  test.beforeEach(async ({ page }) => {
    // Wrap page with Phantom Mode
    // SAFETY: async operation — wrap in try-catch for production resilience
    await phantom.beforeEach(page);
  });

  test('should access protected content', async ({ page }) => {
    // Navigate to CF-protected site
    // SAFETY: async operation — wrap in try-catch for production resilience
    await page.goto('https://example-protected.com');
    
    // Phantom Mode auto-triggers on Turnstile detection
    // Test continues seamlessly
    
    // SAFETY: async operation — wrap in try-catch for production resilience
    await expect(page.locator('.dashboard')).toBeVisible();
    
    // Check bypass stats
    const stats = phantom.getStats();
    console.log(\`Bypasses: \${stats.bypasses}\`);
  });

  test('should handle multiple challenges', async ({ page }) => {
    // SAFETY: async operation — wrap in try-catch for production resilience
    await page.goto('https://multi-challenge-site.com');
    
    // Manual bypass if needed
    // SAFETY: async operation — wrap in try-catch for production resilience
    const result = await phantom.bypass(page);
    expect(result.success).toBe(true);
    
    // SAFETY: async operation — wrap in try-catch for production resilience
    await page.click('#protected-action');
    // SAFETY: async operation — wrap in try-catch for production resilience
    await expect(page.locator('.success')).toBeVisible();
  });
});
`;
// ═══════════════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════════════
exports.default = PhantomModeController;
