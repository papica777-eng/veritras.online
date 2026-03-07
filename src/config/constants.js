/**
 * @fileoverview Configuration constants for QAntum v8.5
 * @module config/constants
 * @version 1.0.0-QAntum
 */

const path = require('path');

/**
 * Timing constants for various operations (in milliseconds)
 * @constant {Object}
 */
const TIMING = {
    /** Base delay for retry operations */
    RETRY_BASE_MS: 500,
    /** Wait time for cookie banners to appear */
    COOKIE_WAIT_MS: 1500,
    /** Wait after scroll operations */
    SCROLL_WAIT_MS: 400,
    /** Wait for animations to complete */
    ANIMATION_WAIT_MS: 600,
    /** Wait for DOM to settle after changes */
    DOM_SETTLE_MS: 800,
    /** Default timeout for finding elements */
    ELEMENT_FIND_MS: 2000,
    /** Wait for network to become idle */
    NETWORK_IDLE_MS: 3000
};

/**
 * Main configuration object
 * @constant {Object}
 */
const CONFIG = {
    // 🔑 API Configuration
    GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",
    MODEL_NAME: process.env.GEMINI_MODEL || "gemini-2.0-flash",
    
    // ⚡ Performance Mode
    LITE_MODE: process.env.LITE_MODE === 'true' || false,
    CPU_THROTTLE_MS: 100,
    
    // 🧠 Agent Settings
    MAX_STEPS: 35,
    MAX_RETRIES: 3,
    LEARNING_ENABLED: true,
    SEMANTIC_SELECTORS: true,
    PERFORMANCE_PROFILING: false,
    AUTO_BUG_REPORTS: false,
    
    // 🖥️ Chrome Optimization Flags
    CHROME_FLAGS: [
        '--disable-gpu',
        '--disable-software-rasterizer',
        '--disable-dev-shm-usage',
        '--no-sandbox',
        '--disable-background-networking',
        '--disable-default-apps',
        '--disable-extensions',
        '--disable-sync',
        '--disable-translate',
        '--disable-features=TranslateUI',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--disable-infobars',
        '--disable-breakpad',
        '--disable-component-update',
        '--disable-ipc-flooding-protection',
        '--memory-pressure-off',
        '--js-flags=--max-old-space-size=512'
    ],
    
    // 🔄 Self-Healing Engine Configuration
    SELF_HEALING: {
        enabled: true,
        maxRetries: 3,
        staleElementRetry: true,
        autoScroll: true,
        autoDismissOverlays: true,
        visualVerification: false,
        adaptiveTimeout: true,
        learnFromFailures: true,
        alternativeStrategies: 5,
        delayBetweenRetries: 500
    },
    
    // 🌐 Browser Settings
    HEADLESS: process.env.HEADLESS !== 'false',
    WINDOW_SIZE: { width: 1920, height: 1080 },
    TIMEOUTS: { 
        page: 60000,
        implicit: 10000,
        script: 60000,
        element: 15000,
        animation: 600,
        networkIdle: 3000,
        domStable: 1000
    },
    
    // 🛡️ Reliability Settings
    RELIABILITY: {
        waitForNetworkIdle: true,
        waitForDomStable: true,
        verifyActionSuccess: true,
        retryOnNetworkError: true,
        maxNetworkRetries: 3,
        screenshotOnFailure: true
    },
    
    // 🌑 Shadow DOM & Iframe Configuration
    SHADOW_DOM: {
        enabled: true,
        maxDepth: 3,
        autoSwitch: true,
        pierceMode: 'shallow',
        retryInShadow: false
    },
    
    // 📸 Visual Regression Testing
    VISUAL_REGRESSION: {
        enabled: false,
        baselineDir: path.join(__dirname, "../../baselines"),
        diffDir: path.join(__dirname, "../../visual_diffs"),
        threshold: 5,
        highlightDiffs: true,
        saveBaselines: true,
        compareOnNavigate: false,
        compareOnDone: false
    },
    
    // 📁 Storage Paths
    BASE_DIR: path.join(__dirname, "../.."),
    OUTPUT_DIR: path.join(__dirname, "../../output"),
    KNOWLEDGE_DIR: path.join(__dirname, "../../knowledge"),
    BUG_REPORTS_DIR: path.join(__dirname, "../../bug_reports"),
    
    // 🔗 Integrations
    GITHUB_TOKEN: process.env.GITHUB_TOKEN || "",
    GITHUB_REPO: process.env.GITHUB_REPO || "papica777-eng/QA-Framework",
    DISCORD_WEBHOOK: process.env.DISCORD_WEBHOOK || "",
    
    // 🛡️ Security Patterns (blocked commands)
    BLOCKED_PATTERNS: [
        /rm\s+-rf/i, 
        /del\s+\/[fqs]/i, 
        /format\s+/i, 
        /drop\s+table/i, 
        /shutdown/i
    ]
};

/**
 * Validates that critical configuration is present
 * @returns {boolean} True if valid
 */
function validateConfig() {
    let isValid = true;
    
    if (!CONFIG.GEMINI_API_KEY) {
        console.warn('⚠️  WARNING: GEMINI_API_KEY not set in .env file!');
        console.warn('   The agent will not function without a valid API key.');
        console.warn('   Set it in .env: GEMINI_API_KEY=your_key_here\n');
        isValid = false;
    }
    
    return isValid;
}

module.exports = {
    TIMING,
    CONFIG,
    validateConfig
};
