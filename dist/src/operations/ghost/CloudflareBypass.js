"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║           CLOUDFLARE BYPASS - THE TURNSTILE EXECUTIONER                        ║
 * ╠═══════════════════════════════════════════════════════════════════════════════╣
 * ║                                                                               ║
 * ║     Bridge module connecting solveCloudflareChallenge with TLS-Phantom        ║
 * ║     Auto-triggers Phantom Mode on cf-turnstile detection                      ║
 * ║                                                                               ║
 * ║     Created: 2026-01-01 | QAntum Prime v28.1.1 SUPREME                        ║
 * ║     "Cloudflare Turnstile е невидима преграда."                               ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudflareBypass = exports.CLOUDFLARE_SIGNATURES = void 0;
const tls_phantom_1 = require("../../scripts/qantum/ghost-protocol-v2/tls-phantom");
const visual_stealth_1 = require("../../scripts/qantum/ghost-protocol-v2/visual-stealth");
const biometric_engine_1 = require("../../scripts/qantum/ghost-protocol-v2/biometric-engine");
// ═══════════════════════════════════════════════════════════════════════════════
// CLOUDFLARE SIGNATURES
// ═══════════════════════════════════════════════════════════════════════════════
exports.CLOUDFLARE_SIGNATURES = {
    turnstile: ['cf-turnstile', 'challenges.cloudflare.com', 'turnstile.js'],
    waf: ['__cf_bm', 'cf_clearance', 'cf-ray'],
    challenge: ['Just a moment...', 'Checking your browser', 'Please wait while we verify'],
    cookies: ['__cf_bm', 'cf_clearance', '_cf_chl_opt'],
};
const DEFAULT_CONFIG = {
    autoRotateTLS: true,
    spoofFingerprints: true,
    emulateHuman: true,
    maxAttempts: 5,
    rotationInterval: 2000,
    telemetryEnabled: true,
};
// ═══════════════════════════════════════════════════════════════════════════════
// CLOUDFLARE BYPASS CLASS
// ═══════════════════════════════════════════════════════════════════════════════
class CloudflareBypass {
    tlsPhantom;
    visualStealth;
    biometricEngine;
    config;
    bypassCount = 0;
    telemetryLog = [];
    constructor(config = {}) {
        this.config = { ...DEFAULT_CONFIG, ...config };
        this.tlsPhantom = new tls_phantom_1.TLSPhantom();
        this.visualStealth = new visual_stealth_1.VisualStealth();
        this.biometricEngine = new biometric_engine_1.BiometricEngine(0.15); // 15% human variance
        console.log('[GHOST] 👻 CloudflareBypass initialized - Phantom Mode ready');
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // DETECTION
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Detect Cloudflare Turnstile in page content or response
     */
    // Complexity: O(1)
    detectTurnstile(content) {
        const contentLower = content.toLowerCase();
        return exports.CLOUDFLARE_SIGNATURES.turnstile.some(sig => contentLower.includes(sig.toLowerCase()));
    }
    /**
     * Detect Cloudflare WAF challenge
     */
    // Complexity: O(N*M) — nested iteration
    detectWAFChallenge(content, headers) {
        const contentLower = content.toLowerCase();
        // Check content for challenge page
        const hasChallenge = exports.CLOUDFLARE_SIGNATURES.challenge.some(sig => contentLower.includes(sig.toLowerCase()));
        // Check for CF headers
        const hasCFHeaders = headers && (headers['cf-ray'] ||
            headers['server']?.includes('cloudflare'));
        return hasChallenge || !!hasCFHeaders;
    }
    /**
     * Auto-detect and trigger appropriate bypass
     */
    // Complexity: O(1)
    async autoBypass(content, headers, page // Playwright/Puppeteer page
    ) {
        const startTime = Date.now();
        // Detect protection type
        const hasTurnstile = this.detectTurnstile(content);
        const hasWAF = this.detectWAFChallenge(content, headers);
        if (!hasTurnstile && !hasWAF) {
            return {
                success: true,
                method: 'tls-rotation',
                duration: 0,
                attempts: 0,
            };
        }
        this.log(`[GHOST] 🛡️ Cloudflare detected: Turnstile=${hasTurnstile}, WAF=${hasWAF}`);
        // Execute bypass strategy
        let result;
        if (hasTurnstile && page) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            result = await this.bypassTurnstile(page);
        }
        else {
            // SAFETY: async operation — wrap in try-catch for production resilience
            result = await this.bypassWAF();
        }
        result.duration = Date.now() - startTime;
        // Telemetry
        if (this.config.telemetryEnabled) {
            this.telemetryLog.push(result);
            this.logTelemetry(result);
        }
        return result;
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // TURNSTILE BYPASS
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Bypass Cloudflare Turnstile widget
     */
    // Complexity: O(N*M) — nested iteration
    async bypassTurnstile(page) {
        let attempts = 0;
        const maxAttempts = this.config.maxAttempts;
        while (attempts < maxAttempts) {
            attempts++;
            this.log(`[GHOST] 👻 Turnstile bypass attempt ${attempts}/${maxAttempts}`);
            try {
                // 1. Rotate TLS fingerprint
                if (this.config.autoRotateTLS) {
                    const newProfile = this.tlsPhantom.rotate();
                    this.log(`[GHOST] 🔄 TLS rotated: ${newProfile.name}`);
                }
                // 2. Spoof browser fingerprints
                if (this.config.spoofFingerprints) {
                    await this.injectFingerprintSpoof(page);
                }
                // 3. Emulate human behavior
                if (this.config.emulateHuman) {
                    await this.emulateHumanInteraction(page);
                }
                // 4. Wait for Turnstile to solve
                // SAFETY: async operation — wrap in try-catch for production resilience
                const solved = await this.waitForTurnstileSolution(page);
                if (solved) {
                    this.bypassCount++;
                    return {
                        success: true,
                        method: 'fingerprint-spoof',
                        duration: 0, // Will be set by caller
                        attempts,
                        tlsProfile: this.tlsPhantom.getCurrentProfile().name,
                        gpuProfile: this.visualStealth.generateDeviceProfile().gpu.unmasked,
                    };
                }
                // Wait before retry
                // SAFETY: async operation — wrap in try-catch for production resilience
                await this.delay(this.config.rotationInterval);
            }
            catch (error) {
                this.log(`[GHOST] ⚠️ Attempt ${attempts} failed: ${error}`);
            }
        }
        return {
            success: false,
            method: 'fingerprint-spoof',
            duration: 0,
            attempts,
        };
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // WAF BYPASS
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Bypass Cloudflare WAF challenge page
     */
    // Complexity: O(N) — loop
    async bypassWAF() {
        let attempts = 0;
        while (attempts < this.config.maxAttempts) {
            attempts++;
            // 1. Rotate TLS fingerprint
            const newProfile = this.tlsPhantom.rotate();
            // 2. Solve JS challenge
            const challengeResult = this.visualStealth.solveJSChallenge('cloudflare');
            if (challengeResult.solved) {
                this.bypassCount++;
                return {
                    success: true,
                    method: 'js-challenge',
                    duration: challengeResult.duration,
                    attempts,
                    tlsProfile: newProfile.name,
                };
            }
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.delay(this.config.rotationInterval);
        }
        return {
            success: false,
            method: 'js-challenge',
            duration: 0,
            attempts,
        };
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // FINGERPRINT INJECTION
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Inject fingerprint spoofing into page context
     */
    // Complexity: O(N) — loop
    async injectFingerprintSpoof(page) {
        const webglProfile = this.visualStealth.generateWebGLProfile();
        const deviceProfile = this.visualStealth.generateDeviceProfile();
        const canvasNoise = this.visualStealth.generateCanvasNoise();
        // SAFETY: async operation — wrap in try-catch for production resilience
        await page.addInitScript(`
      // ═══════════════════════════════════════════════════════════════════════
      // GHOST PROTOCOL V2 - FINGERPRINT INJECTION
      // ═══════════════════════════════════════════════════════════════════════

      // WebGL Vendor/Renderer Spoofing
      const getParameterOriginal = WebGLRenderingContext.prototype.getParameter;
      WebGLRenderingContext.prototype.getParameter = function(param) {
        if (param === 37445) return '${webglProfile.vendor}';
        if (param === 37446) return '${webglProfile.renderer}';
        return getParameterOriginal.apply(this, arguments);
      };

      // WebGL2 Spoofing
      if (typeof WebGL2RenderingContext !== 'undefined') {
        const getParameter2Original = WebGL2RenderingContext.prototype.getParameter;
        WebGL2RenderingContext.prototype.getParameter = function(param) {
          if (param === 37445) return '${webglProfile.vendor}';
          if (param === 37446) return '${webglProfile.renderer}';
          return getParameter2Original.apply(this, arguments);
        };
      }

      // Canvas Fingerprint Noise
      const toDataURLOriginal = HTMLCanvasElement.prototype.toDataURL;
      HTMLCanvasElement.prototype.toDataURL = function(type) {
        const ctx = this.getContext('2d');
        if (ctx) {
          try {
            const imageData = ctx.getImageData(0, 0, Math.min(this.width, 16), Math.min(this.height, 16));
            for (let i = 0; i < imageData.data.length; i += 4) {
              imageData.data[i] += (Math.random() - 0.5) * ${canvasNoise.noiseLevel * 255};
            }
            ctx.putImageData(imageData, 0, 0);
          } catch(e) {}
        }
        return toDataURLOriginal.apply(this, arguments);
      };

      // Navigator Overrides
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
      Object.defineProperty(navigator, 'languages', { get: () => ${JSON.stringify(deviceProfile.languages)} });
      Object.defineProperty(navigator, 'platform', { get: () => '${deviceProfile.platform}' });
      Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => ${deviceProfile.cores} });
      Object.defineProperty(navigator, 'deviceMemory', { get: () => ${deviceProfile.memory} });

      // Screen Properties
      Object.defineProperty(screen, 'width', { get: () => ${deviceProfile.screen.width} });
      Object.defineProperty(screen, 'height', { get: () => ${deviceProfile.screen.height} });
      Object.defineProperty(screen, 'colorDepth', { get: () => ${deviceProfile.screen.colorDepth} });

      // Timezone
      const DateOriginal = Date;
      const timezoneOffset = new DateOriginal().getTimezoneOffset();
      Date.prototype.getTimezoneOffset = function() {
        return ${deviceProfile.timezone === 'Europe/Sofia' ? -120 : 0};
      };

      console.log('[GHOST] 👻 Fingerprint injection complete');
    `);
        this.log(`[GHOST] 🎭 Injected: GPU=${webglProfile.renderer.substring(0, 30)}...`);
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // HUMAN EMULATION
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Emulate human-like interaction
     */
    // Complexity: O(1)
    async emulateHumanInteraction(page) {
        // Random initial delay (human reaction time)
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.delay(200 + Math.random() * 500);
        // Mouse movement to random position
        // SAFETY: async operation — wrap in try-catch for production resilience
        const viewportSize = await page.viewportSize();
        if (viewportSize) {
            const x = Math.floor(Math.random() * viewportSize.width * 0.8) + 50;
            const y = Math.floor(Math.random() * viewportSize.height * 0.8) + 50;
            // Bezier curve movement
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.humanMouseMove(page, x, y);
        }
        // Small random scroll
        // SAFETY: async operation — wrap in try-catch for production resilience
        await page.evaluate(() => {
            window.scrollBy(0, Math.floor(Math.random() * 100) - 50);
        });
        this.log('[GHOST] 🖱️ Human interaction emulated');
    }
    /**
     * Human-like mouse movement using Bezier curves
     */
    // Complexity: O(N*M) — nested iteration
    async humanMouseMove(page, targetX, targetY) {
        const mouse = page.mouse;
        const steps = 10 + Math.floor(Math.random() * 10);
        // Get current position (approximate)
        const startX = Math.floor(Math.random() * 100);
        const startY = Math.floor(Math.random() * 100);
        // Control points for Bezier curve
        const cp1x = startX + (targetX - startX) * 0.3 + (Math.random() - 0.5) * 100;
        const cp1y = startY + (targetY - startY) * 0.3 + (Math.random() - 0.5) * 100;
        const cp2x = startX + (targetX - startX) * 0.7 + (Math.random() - 0.5) * 100;
        const cp2y = startY + (targetY - startY) * 0.7 + (Math.random() - 0.5) * 100;
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            // Cubic Bezier formula
            const x = Math.pow(1 - t, 3) * startX +
                3 * Math.pow(1 - t, 2) * t * cp1x +
                3 * (1 - t) * Math.pow(t, 2) * cp2x +
                Math.pow(t, 3) * targetX;
            const y = Math.pow(1 - t, 3) * startY +
                3 * Math.pow(1 - t, 2) * t * cp1y +
                3 * (1 - t) * Math.pow(t, 2) * cp2y +
                Math.pow(t, 3) * targetY;
            // SAFETY: async operation — wrap in try-catch for production resilience
            await mouse.move(x, y);
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.delay(10 + Math.random() * 20);
        }
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // TURNSTILE SOLUTION DETECTION
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Wait for Turnstile to be solved
     */
    // Complexity: O(N*M) — nested iteration
    async waitForTurnstileSolution(page, timeout = 10000) {
        const startTime = Date.now();
        while (Date.now() - startTime < timeout) {
            // Check for cf_clearance cookie
            // SAFETY: async operation — wrap in try-catch for production resilience
            const cookies = await page.context().cookies();
            const hasClearance = cookies.some((c) => c.name === 'cf_clearance' || c.name === '__cf_bm');
            if (hasClearance) {
                this.log('[GHOST] ✅ Turnstile solution detected (cookie)');
                return true;
            }
            // Check if Turnstile iframe is gone
            // SAFETY: async operation — wrap in try-catch for production resilience
            const turnstileFrame = await page.$('iframe[src*="challenges.cloudflare.com"]');
            if (!turnstileFrame) {
                this.log('[GHOST] ✅ Turnstile widget cleared');
                return true;
            }
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.delay(500);
        }
        return false;
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // UTILITIES
    // ═══════════════════════════════════════════════════════════════════════════
    // Complexity: O(1)
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    // Complexity: O(1)
    log(message) {
        console.log(message);
    }
    // Complexity: O(1)
    logTelemetry(result) {
        const status = result.success ? '✅' : '❌';
        console.log(`[GHOST] ${status} Cloudflare ${result.method} bypassed in ${result.duration}ms using RTX 4050 spoofing`);
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // GETTERS
    // ═══════════════════════════════════════════════════════════════════════════
    // Complexity: O(1)
    getBypassCount() {
        return this.bypassCount;
    }
    // Complexity: O(1)
    getTelemetry() {
        return [...this.telemetryLog];
    }
    // Complexity: O(1)
    getCurrentTLSProfile() {
        return this.tlsPhantom.getCurrentProfile();
    }
    /**
     * Get stealth headers for HTTP requests
     */
    // Complexity: O(1)
    getStealthHeaders(targetUrl) {
        const profile = this.tlsPhantom.getCurrentProfile();
        const deviceProfile = this.visualStealth.generateDeviceProfile();
        return {
            'User-Agent': profile.userAgent,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
            'Accept-Language': deviceProfile.languages.join(','),
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1',
            'sec-ch-ua': profile.secChUa,
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': `"${profile.platform}"`,
        };
    }
}
exports.CloudflareBypass = CloudflareBypass;
// ═══════════════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════════════
exports.default = CloudflareBypass;
