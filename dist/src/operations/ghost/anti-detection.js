"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                               ║
 * ║   QANTUM ANTI-DETECTION                                                       ║
 * ║   "Evade bot detection systems"                                               ║
 * ║                                                                               ║
 * ║   TODO B #22 - Ghost Protocol: Anti-Detection                                 ║
 * ║                                                                               ║
 * ║   © 2025-2026 QAntum | Dimitar Prodromov                                        ║
 * ║                                                                               ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAntiDetection = exports.AntiDetection = void 0;
// ═══════════════════════════════════════════════════════════════════════════════
// BOT SIGNATURES TO AVOID
// ═══════════════════════════════════════════════════════════════════════════════
const BOT_SIGNATURES = [
    // Header-based
    { pattern: /HeadlessChrome/i, type: 'header', severity: 'high' },
    { pattern: /PhantomJS/i, type: 'header', severity: 'high' },
    { pattern: /Selenium/i, type: 'header', severity: 'high' },
    { pattern: /Puppeteer/i, type: 'header', severity: 'high' },
    { pattern: /webdriver/i, type: 'header', severity: 'high' },
    // Behavior-based
    { pattern: 'no_mouse_movement', type: 'behavior', severity: 'medium' },
    { pattern: 'perfect_timing', type: 'behavior', severity: 'medium' },
    { pattern: 'instant_form_fill', type: 'behavior', severity: 'high' },
    { pattern: 'no_scroll', type: 'behavior', severity: 'medium' },
    // Fingerprint-based
    { pattern: 'navigator.webdriver', type: 'fingerprint', severity: 'high' },
    { pattern: 'missing_plugins', type: 'fingerprint', severity: 'medium' },
    { pattern: 'no_language', type: 'fingerprint', severity: 'medium' },
    { pattern: 'headless_ua', type: 'fingerprint', severity: 'high' },
];
// ═══════════════════════════════════════════════════════════════════════════════
// ANTI-DETECTION SERVICE
// ═══════════════════════════════════════════════════════════════════════════════
class AntiDetection {
    static instance;
    strategies = new Map();
    enabled = true;
    static getInstance() {
        if (!AntiDetection.instance) {
            AntiDetection.instance = new AntiDetection();
            AntiDetection.instance.registerDefaultStrategies();
        }
        return AntiDetection.instance;
    }
    // ─────────────────────────────────────────────────────────────────────────
    // STRATEGIES
    // ─────────────────────────────────────────────────────────────────────────
    // Complexity: O(1)
    registerDefaultStrategies() {
        // WebDriver flag removal
        this.registerStrategy({
            name: 'removeWebdriver',
            enabled: true,
            apply: () => {
                if (typeof window !== 'undefined') {
                    Object.defineProperty(navigator, 'webdriver', {
                        get: () => undefined,
                    });
                }
            },
        });
        // Chrome runtime injection
        this.registerStrategy({
            name: 'injectChrome',
            enabled: true,
            apply: () => {
                if (typeof window !== 'undefined' && !window.chrome) {
                    window.chrome = {
                        runtime: {},
                        loadTimes: () => { },
                        csi: () => { },
                        app: {},
                    };
                }
            },
        });
        // Plugin spoofing
        this.registerStrategy({
            name: 'spoofPlugins',
            enabled: true,
            apply: () => {
                if (typeof window !== 'undefined') {
                    Object.defineProperty(navigator, 'plugins', {
                        get: () => [
                            { name: 'Chrome PDF Plugin', filename: 'internal-pdf-viewer' },
                            { name: 'Chrome PDF Viewer', filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai' },
                            { name: 'Native Client', filename: 'internal-nacl-plugin' },
                        ],
                    });
                }
            },
        });
        // Language spoofing
        this.registerStrategy({
            name: 'spoofLanguages',
            enabled: true,
            apply: () => {
                if (typeof window !== 'undefined') {
                    Object.defineProperty(navigator, 'languages', {
                        get: () => ['en-US', 'en'],
                    });
                }
            },
        });
        // WebGL vendor spoofing
        this.registerStrategy({
            name: 'spoofWebGL',
            enabled: true,
            apply: () => {
                // WebGL spoofing would be applied via browser launch args
            },
        });
        // Permissions spoofing
        this.registerStrategy({
            name: 'spoofPermissions',
            enabled: true,
            apply: () => {
                if (typeof window !== 'undefined' && navigator.permissions) {
                    const originalQuery = navigator.permissions.query;
                    navigator.permissions.query = (parameters) => {
                        if (parameters.name === 'notifications') {
                            return Promise.resolve({ state: 'denied', onchange: null });
                        }
                        return originalQuery(parameters);
                    };
                }
            },
        });
    }
    /**
     * Register a custom strategy
     */
    // Complexity: O(1) — lookup
    registerStrategy(strategy) {
        this.strategies.set(strategy.name, strategy);
    }
    /**
     * Apply all enabled strategies
     */
    // Complexity: O(N) — loop
    applyAll() {
        if (!this.enabled)
            return;
        for (const strategy of this.strategies.values()) {
            if (strategy.enabled) {
                try {
                    strategy.apply();
                }
                catch (error) {
                    console.warn(`[AntiDetection] Failed to apply ${strategy.name}:`, error);
                }
            }
        }
    }
    /**
     * Enable/disable a strategy
     */
    // Complexity: O(1) — lookup
    setStrategyEnabled(name, enabled) {
        const strategy = this.strategies.get(name);
        if (strategy) {
            strategy.enabled = enabled;
        }
    }
    // ─────────────────────────────────────────────────────────────────────────
    // RISK ASSESSMENT
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Assess detection risk
     */
    // Complexity: O(N*M) — nested iteration
    assessRisk() {
        const risks = [];
        // Check for webdriver
        if (typeof navigator !== 'undefined' && navigator.webdriver) {
            risks.push({
                category: 'Fingerprint',
                risk: 'high',
                description: 'navigator.webdriver is true',
                mitigation: 'Enable removeWebdriver strategy',
            });
        }
        // Check for Chrome
        if (typeof window !== 'undefined' && !window.chrome) {
            risks.push({
                category: 'Fingerprint',
                risk: 'medium',
                description: 'Chrome runtime not present',
                mitigation: 'Enable injectChrome strategy',
            });
        }
        // Check plugins
        if (typeof navigator !== 'undefined' && navigator.plugins?.length === 0) {
            risks.push({
                category: 'Fingerprint',
                risk: 'medium',
                description: 'No plugins detected',
                mitigation: 'Enable spoofPlugins strategy',
            });
        }
        // Check languages
        if (typeof navigator !== 'undefined' && !navigator.languages?.length) {
            risks.push({
                category: 'Fingerprint',
                risk: 'low',
                description: 'No languages defined',
                mitigation: 'Enable spoofLanguages strategy',
            });
        }
        return risks;
    }
    /**
     * Get overall risk level
     */
    // Complexity: O(1)
    getOverallRisk() {
        const risks = this.assessRisk();
        if (risks.some((r) => r.risk === 'high'))
            return 'high';
        if (risks.some((r) => r.risk === 'medium'))
            return 'medium';
        return 'low';
    }
    /**
     * Check user agent for bot signatures
     */
    // Complexity: O(N) — linear scan
    checkUserAgent(userAgent) {
        for (const sig of BOT_SIGNATURES.filter((s) => s.type === 'header')) {
            if (sig.pattern instanceof RegExp) {
                if (sig.pattern.test(userAgent))
                    return true;
            }
            else if (userAgent.includes(sig.pattern)) {
                return true;
            }
        }
        return false;
    }
    // ─────────────────────────────────────────────────────────────────────────
    // BROWSER ARGS
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Get recommended browser launch args
     */
    // Complexity: O(1)
    getBrowserArgs() {
        return [
            '--disable-blink-features=AutomationControlled',
            '--disable-dev-shm-usage',
            '--disable-infobars',
            '--disable-notifications',
            '--disable-popup-blocking',
            '--disable-extensions',
            '--no-sandbox',
            '--start-maximized',
            '--window-size=1920,1080',
            '--disable-gpu',
            '--ignore-certificate-errors',
            '--disable-accelerated-2d-canvas',
            '--disable-background-networking',
            '--metrics-recording-only',
            '--mute-audio',
        ];
    }
    /**
     * Get stealth browser context options
     */
    // Complexity: O(1)
    getContextOptions() {
        return {
            ignoreHTTPSErrors: true,
            javaScriptEnabled: true,
            viewport: { width: 1920, height: 1080 },
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            locale: 'en-US',
            timezoneId: 'America/New_York',
            permissions: ['geolocation'],
            colorScheme: 'light',
            deviceScaleFactor: 1,
            hasTouch: false,
            isMobile: false,
        };
    }
    // ─────────────────────────────────────────────────────────────────────────
    // CONTROL
    // ─────────────────────────────────────────────────────────────────────────
    // Complexity: O(1)
    enable() {
        this.enabled = true;
    }
    // Complexity: O(1)
    disable() {
        this.enabled = false;
    }
    // Complexity: O(1)
    isEnabled() {
        return this.enabled;
    }
}
exports.AntiDetection = AntiDetection;
// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════
const getAntiDetection = () => AntiDetection.getInstance();
exports.getAntiDetection = getAntiDetection;
exports.default = AntiDetection;
