/**
 * ═══════════════════════════════════════════════════════════════════════════
 * QAntum - Browser Strategies Module
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * @copyright 2025 Dimitar Prodromov (papica777-eng). All Rights Reserved.
 * @license Commercial License Required for Business Use
 * 
 * Shared browser automation strategies:
 * - Cookie consent handling
 * - Overlay/popup dismissal
 * - Common selector patterns
 * ═══════════════════════════════════════════════════════════════════════════
 */

'use strict';

/**
 * Cookie consent selectors - commonly used across websites
 */
const COOKIE_SELECTORS = [
    // Button text patterns
    'button[id*="accept"]',
    'button[id*="cookie"]',
    'button[class*="accept"]',
    'button[class*="cookie"]',
    'button[class*="consent"]',
    '[data-testid*="accept"]',
    '[data-testid*="cookie"]',
    
    // Common frameworks
    '#onetrust-accept-btn-handler',           // OneTrust
    '#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll', // Cookiebot
    '.cc-btn.cc-allow',                        // Cookie Consent
    '#cookie-consent-accept',
    '#gdpr-cookie-accept',
    '.gdpr-accept-button',
    
    // ARIA patterns
    '[aria-label*="accept" i][aria-label*="cookie" i]',
    '[aria-label*="allow" i][aria-label*="cookie" i]',
    
    // Text-based (XPath)
    '//button[contains(text(), "Accept")]',
    '//button[contains(text(), "Allow")]',
    '//button[contains(text(), "Agree")]',
    '//button[contains(text(), "I agree")]',
    '//button[contains(text(), "Got it")]',
    '//button[contains(text(), "OK")]',
    '//a[contains(text(), "Accept")]',
    '//span[contains(text(), "Accept")]/..',
    
    // Bulgarian
    '//button[contains(text(), "Приемам")]',
    '//button[contains(text(), "Съгласен")]',
    
    // German
    '//button[contains(text(), "Akzeptieren")]',
    '//button[contains(text(), "Alle akzeptieren")]',
    
    // French
    '//button[contains(text(), "Accepter")]',
    '//button[contains(text(), "J\'accepte")]',
    
    // Spanish
    '//button[contains(text(), "Aceptar")]'
];

/**
 * Overlay/Popup dismiss selectors
 */
const OVERLAY_SELECTORS = [
    // Close buttons
    'button[aria-label="Close"]',
    'button[aria-label="close"]',
    'button[class*="close"]',
    'button[class*="dismiss"]',
    '.modal-close',
    '.popup-close',
    '[data-dismiss="modal"]',
    '[data-close]',
    
    // X buttons
    '.close-btn',
    '.btn-close',
    '.icon-close',
    'button:has(svg[class*="close"])',
    
    // Common patterns
    '[class*="overlay"] [class*="close"]',
    '[class*="modal"] [class*="close"]',
    '[class*="popup"] [class*="close"]',
    '[class*="dialog"] [class*="close"]',
    
    // Newsletter popups
    '[class*="newsletter"] [class*="close"]',
    '[class*="subscribe"] [class*="close"]',
    '#newsletter-popup .close',
    
    // No thanks links
    '//a[contains(text(), "No thanks")]',
    '//button[contains(text(), "No thanks")]',
    '//a[contains(text(), "Maybe later")]',
    '//button[contains(text(), "Skip")]'
];

/**
 * Interactive element selectors for semantic discovery
 */
const INTERACTIVE_SELECTORS = [
    'button',
    'a[href]',
    'input',
    'select',
    'textarea',
    '[role="button"]',
    '[role="link"]',
    '[role="checkbox"]',
    '[role="radio"]',
    '[role="textbox"]',
    '[role="combobox"]',
    '[onclick]',
    '[tabindex]:not([tabindex="-1"])',
    'label[for]'
];

/**
 * Form field patterns for auto-fill
 */
const FORM_PATTERNS = {
    email: [
        'input[type="email"]',
        'input[name*="email" i]',
        'input[id*="email" i]',
        'input[placeholder*="email" i]',
        'input[autocomplete="email"]'
    ],
    password: [
        'input[type="password"]',
        'input[name*="password" i]',
        'input[name*="pass" i]',
        'input[autocomplete="current-password"]',
        'input[autocomplete="new-password"]'
    ],
    username: [
        'input[name*="user" i]',
        'input[id*="user" i]',
        'input[name="login"]',
        'input[autocomplete="username"]'
    ],
    name: [
        'input[name*="name" i]',
        'input[id*="name" i]',
        'input[autocomplete="name"]',
        'input[placeholder*="name" i]'
    ],
    phone: [
        'input[type="tel"]',
        'input[name*="phone" i]',
        'input[name*="tel" i]',
        'input[autocomplete="tel"]'
    ],
    search: [
        'input[type="search"]',
        'input[name*="search" i]',
        'input[name="q"]',
        'input[name="query"]',
        'input[placeholder*="search" i]'
    ],
    submit: [
        'button[type="submit"]',
        'input[type="submit"]',
        'button:not([type])',
        '[role="button"][type="submit"]'
    ]
};

/**
 * Wait condition patterns
 */
const WAIT_PATTERNS = {
    // Elements that indicate page is loading
    loading: [
        '.loading',
        '.spinner',
        '.loader',
        '[class*="loading"]',
        '[class*="spinner"]',
        '[aria-busy="true"]'
    ],
    
    // Elements that indicate page is ready
    ready: [
        'main',
        '#main-content',
        '[role="main"]',
        'article',
        '.content'
    ]
};

/**
 * Try to dismiss cookie consent
 * @param {Object} driver - Selenium/Playwright driver
 * @param {Object} options - Options
 * @returns {Promise<boolean>} Success
 */
async function dismissCookieConsent(driver, options = {}) {
    const { timeout = 3000, clickDelay = 500 } = options;
    
    for (const selector of COOKIE_SELECTORS) {
        try {
            let element;
            
            if (selector.startsWith('//')) {
                // XPath
                element = await driver.findElement({ xpath: selector });
            } else {
                // CSS
                element = await driver.findElement({ css: selector });
            }
            
            if (element) {
                const isDisplayed = await element.isDisplayed().catch(() => false);
                if (isDisplayed) {
                    await element.click();
                    if (clickDelay > 0) {
                        // SAFETY: async operation — wrap in try-catch for production resilience
                        await new Promise(r => setTimeout(r, clickDelay));
                    }
                    return true;
                }
            }
        } catch {
            // Selector not found, try next
        }
    }
    
    return false;
}

/**
 * Try to dismiss overlay/popup
 * @param {Object} driver - Selenium/Playwright driver
 * @param {Object} options - Options
 * @returns {Promise<boolean>} Success
 */
async function dismissOverlay(driver, options = {}) {
    const { timeout = 3000, clickDelay = 300 } = options;
    
    for (const selector of OVERLAY_SELECTORS) {
        try {
            let element;
            
            if (selector.startsWith('//')) {
                element = await driver.findElement({ xpath: selector });
            } else {
                element = await driver.findElement({ css: selector });
            }
            
            if (element) {
                const isDisplayed = await element.isDisplayed().catch(() => false);
                if (isDisplayed) {
                    await element.click();
                    if (clickDelay > 0) {
                        await new Promise(r => setTimeout(r, clickDelay));
                    }
                    return true;
                }
            }
        } catch {
            // Continue
        }
    }
    
    // Try pressing Escape key
    try {
        const actions = driver.actions({ async: true });
        await actions.sendKeys('\uE00C').perform(); // Escape key
        return true;
    } catch {
        // Escape didn't work
    }
    
    return false;
}

/**
 * Find form field by type
 * @param {Object} driver - Selenium/Playwright driver
 * @param {string} fieldType - Field type (email, password, etc.)
 * @returns {Promise<Object|null>} Element or null
 */
async function findFormField(driver, fieldType) {
    const selectors = FORM_PATTERNS[fieldType] || [];
    
    for (const selector of selectors) {
        try {
            const element = await driver.findElement({ css: selector });
            const isDisplayed = await element.isDisplayed().catch(() => false);
            if (isDisplayed) {
                return element;
            }
        } catch {
            // Continue
        }
    }
    
    return null;
}

/**
 * Wait for page to be ready
 * @param {Object} driver - Selenium/Playwright driver
 * @param {Object} options - Options
 * @returns {Promise<boolean>} Ready
 */
async function waitForPageReady(driver, options = {}) {
    const { timeout = 10000, checkInterval = 500 } = options;
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
        // Check if loading indicators are gone
        let isLoading = false;
        for (const selector of WAIT_PATTERNS.loading) {
            try {
                const element = await driver.findElement({ css: selector });
                const isDisplayed = await element.isDisplayed().catch(() => false);
                if (isDisplayed) {
                    isLoading = true;
                    break;
                }
            } catch {
                // Not found = not loading
            }
        }
        
        if (!isLoading) {
            // Check if ready indicators are present
            for (const selector of WAIT_PATTERNS.ready) {
                try {
                    const element = await driver.findElement({ css: selector });
                    const isDisplayed = await element.isDisplayed().catch(() => false);
                    if (isDisplayed) {
                        return true;
                    }
                } catch {
                    // Continue
                }
            }
        }
        
        // SAFETY: async operation — wrap in try-catch for production resilience
        await new Promise(r => setTimeout(r, checkInterval));
    }
    
    return false;
}

module.exports = {
    // Selectors
    COOKIE_SELECTORS,
    OVERLAY_SELECTORS,
    INTERACTIVE_SELECTORS,
    FORM_PATTERNS,
    WAIT_PATTERNS,
    
    // Functions
    dismissCookieConsent,
    dismissOverlay,
    findFormField,
    waitForPageReady
};
