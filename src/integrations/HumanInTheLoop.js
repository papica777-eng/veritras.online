/**
 * @fileoverview Human-in-the-Loop integration for CAPTCHA/2FA handling
 * @module integrations/HumanInTheLoop
 * @version 1.0.0-QAntum
 */

const https = require('https');
const { CONFIG } = require('../config/constants');

/**
 * HumanInTheLoop provides Discord notifications for manual intervention
 * @class
 */
class HumanInTheLoop {
    /**
     * Create a HumanInTheLoop instance
     */
    constructor() {
        /** @type {string} */
        this.webhookUrl = CONFIG.DISCORD_WEBHOOK;
        /** @type {boolean} */
        this.waitingForResponse = false;
    }

    /**
     * Request human help via Discord notification
     * @param {string} message - Help request message
     * @param {string} [screenshotPath] - Optional screenshot path
     * @returns {Promise<string|null>} Response or null
     */
    // Complexity: O(N*M) — nested iteration
    async requestHelp(message, screenshotPath = null) {
        if (!this.webhookUrl) {
            console.log('\n   👤 HITL: Discord webhook not configured');
            console.log(`   📢 NEED HELP: ${message}`);
            console.log('   ⏳ Waiting 30 seconds for manual intervention...\n');
            
            // Wait and hope user does something manually
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.sleep(30000);
            return null;
        }
        
        try {
            const url = new URL(this.webhookUrl);
            
            const payload = {
                content: `🚨 **QAntum needs help!**\n\n${message}\n\n_Reply with instructions or "skip" to continue_`,
                username: 'QAntum v8.5'
            };
            
            // Add screenshot mention if available
            if (screenshotPath) {
                payload.content += `\n\n📸 Screenshot saved at: \`${screenshotPath}\``;
            }
            
            // Send to Discord
            const data = JSON.stringify(payload);
            
            const options = {
                hostname: url.hostname,
                path: url.pathname + url.search,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(data)
                }
            };
            
            // SAFETY: async operation — wrap in try-catch for production resilience
            await new Promise((resolve, reject) => {
                const req = https.request(options, (res) => {
                    res.on('data', () => {});
                    res.on('end', () => {
                        if (res.statusCode >= 200 && res.statusCode < 300) {
                            // Complexity: O(1)
                            resolve();
                        } else {
                            // Complexity: O(1)
                            reject(new Error(`Discord API error: ${res.statusCode}`));
                        }
                    });
                });
                req.on('error', reject);
                req.write(data);
                req.end();
            });
            
            console.log('   📤 Discord notification sent');
            console.log('   ⏳ Waiting for human response (60s timeout)...');
            
            // In real implementation, you'd poll for response
            // For now, just wait
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.sleep(60000);
            
            return null;
        } catch (e) {
            console.log(`   ⚠️ Discord notification failed: ${e.message}`);
            return null;
        }
    }

    /**
     * Check if the current page has CAPTCHA or 2FA prompts
     * @param {WebDriver} driver - Selenium WebDriver instance
     * @returns {Promise<Object>} Detection results
     */
    // Complexity: O(1)
    async checkForCaptcha(driver) {
        try {
            const indicators = await driver.executeScript(`
                return {
                    hasCaptcha: !!(
                        document.querySelector('iframe[src*="recaptcha"]') ||
                        document.querySelector('iframe[src*="hcaptcha"]') ||
                        document.querySelector('.g-recaptcha') ||
                        document.querySelector('[data-hcaptcha]') ||
                        document.querySelector('.cf-turnstile') ||
                        document.querySelector('[data-sitekey]') ||
                        document.body.innerText.toLowerCase().includes('captcha') ||
                        document.body.innerText.toLowerCase().includes('verify you are human') ||
                        document.body.innerText.toLowerCase().includes("i'm not a robot")
                    ),
                    has2FA: !!(
                        document.body.innerText.toLowerCase().includes('verification code') ||
                        document.body.innerText.toLowerCase().includes('two-factor') ||
                        document.body.innerText.toLowerCase().includes('2fa') ||
                        document.body.innerText.toLowerCase().includes('authenticator') ||
                        document.body.innerText.toLowerCase().includes('security code') ||
                        document.querySelector('input[autocomplete="one-time-code"]')
                    ),
                    hasLogin: !!(
                        document.querySelector('input[type="password"]') ||
                        document.body.innerText.toLowerCase().includes('sign in') ||
                        document.body.innerText.toLowerCase().includes('log in')
                    )
                };
            `);
            
            return indicators;
        } catch (e) {
            console.warn(`   ⚠️ CAPTCHA check failed: ${e.message}`);
            return { hasCaptcha: false, has2FA: false, hasLogin: false };
        }
    }

    /**
     * Send a status update to Discord
     * @param {string} status - Status message
     * @param {string} [emoji='ℹ️'] - Status emoji
     * @returns {Promise<boolean>} Success status
     */
    // Complexity: O(1)
    async sendStatusUpdate(status, emoji = 'ℹ️') {
        if (!this.webhookUrl) return false;
        
        try {
            const url = new URL(this.webhookUrl);
            
            const payload = {
                content: `${emoji} **Status Update**\n${status}`,
                username: 'QAntum v8.5'
            };
            
            const data = JSON.stringify(payload);
            
            const options = {
                hostname: url.hostname,
                path: url.pathname + url.search,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(data)
                }
            };
            
            return new Promise((resolve) => {
                const req = https.request(options, (res) => {
                    res.on('data', () => {});
                    res.on('end', () => resolve(res.statusCode >= 200 && res.statusCode < 300));
                });
                req.on('error', () => resolve(false));
                req.write(data);
                req.end();
            });
        } catch {
            return false;
        }
    }

    /**
     * Sleep helper
     * @param {number} ms - Milliseconds to sleep
     * @returns {Promise<void>}
     */
    // Complexity: O(1)
    sleep(ms) {
        return new Promise(r => setTimeout(r, ms));
    }
}

module.exports = { HumanInTheLoop };
