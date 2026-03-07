/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                  BINANCE LOGIN SCENARIO - Autonomous Authentication           ║
 * ║                                                                               ║
 * ║   Demonstrates the full power of the Heuristic Engine + 2FA automation.       ║
 * ║   This script handles:                                                        ║
 * ║   • Email/Password entry                                                      ║
 * ║   • Dynamic 2FA code generation (Google Authenticator compatible)            ║
 * ║   • CAPTCHA detection (with optional manual intervention window)             ║
 * ║                                                                               ║
 * ║   © 2026 QAntum | Dimitar Prodromov                                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

import { Scenario } from './Scenario';
import { ScenarioRunner } from './ScenarioRunner';
import { TwoFactorManager } from '../utils/TwoFactorManager';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '../.env' });

// ══════════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ══════════════════════════════════════════════════════════════════════════════

const CONFIG = {
  email: process.env.BINANCE_EMAIL || '',
  password: process.env.BINANCE_PASSWORD || '',
  twoFactorSecret: process.env.BINANCE_2FA_SECRET || '',
  captchaWaitSeconds: 15, // Time to manually solve CAPTCHA if it appears
};

// Validate configuration
if (!CONFIG.email || !CONFIG.password) {
  console.error(`
❌ MISSING CREDENTIALS!

Add these to your .env file:
BINANCE_EMAIL=your_email@example.com
BINANCE_PASSWORD=your_password
BINANCE_2FA_SECRET=YOUR_BASE32_SECRET  # Optional, for auto-2FA
  `);
  process.exit(1);
}

// ══════════════════════════════════════════════════════════════════════════════
// SCENARIO DEFINITION
// ══════════════════════════════════════════════════════════════════════════════

const binanceLoginScenario: Scenario = {
  name: 'Binance: Autonomous Login',
  startUrl: 'https://accounts.binance.com/en/login',
  goal: 'Successfully authenticate to Binance account',
  maxSteps: 15,
  expectedKeywords: ['Dashboard', 'Wallet', 'Overview', 'Balance'],
  headless: false, // Set to true for production, false for debugging
  timeoutMs: 120_000, // 2 minutes total timeout
  steps: [
    // ── STEP 1: Navigate to login page ─────────────────────────────────
    {
      goal: 'Navigate to https://accounts.binance.com/en/login',
      validation: { method: 'url-contains', value: 'binance.com' },
    },

    // ── STEP 2: Wait for page to fully load ────────────────────────────
    {
      goal: 'Wait 3 seconds',
      validation: { method: 'dom-contains', value: 'Log In' },
    },

    // ── STEP 3: Enter email ─────────────────────────────────────────────
    {
      goal: `Type "${CONFIG.email}" in email`,
      validation: { method: 'dom-contains', value: CONFIG.email },
    },

    // ── STEP 4: Enter password ──────────────────────────────────────────
    {
      goal: `Type "${CONFIG.password}" in password`,
      validation: { method: 'dom-contains', value: 'password' }, // Just check field exists
    },

    // ── STEP 5: Click login button ──────────────────────────────────────
    {
      goal: 'Click "Log In"',
      validation: { method: 'url-contains', value: 'verify' }, // Often redirects to /verify or /2fa
      maxCycles: 10, // May take time if CAPTCHA appears
    },

    // ── STEP 6: Handle CAPTCHA (if present) ─────────────────────────────
    // This step will timeout if no CAPTCHA, which is fine - we catch it below
    {
      goal: `Wait ${CONFIG.captchaWaitSeconds} seconds`, // Manual CAPTCHA solve window
      validation: { method: 'dom-contains', value: 'Authenticator' }, // Looking for 2FA prompt
      maxCycles: 1, // Only try once
    },
  ],
};

// ══════════════════════════════════════════════════════════════════════════════
// EXECUTION LOGIC
// ══════════════════════════════════════════════════════════════════════════════

(async () => {
  console.log(`
╔═══════════════════════════════════════════════════════════════════════════════╗
║                                                                               ║
║   🔐 BINANCE INFILTRATION PROTOCOL                                            ║
║                                                                               ║
║   Target: ${binanceLoginScenario.startUrl.padEnd(65)}║
║   Mode: ${(binanceLoginScenario.headless ? 'Headless (Stealth)' : 'GUI (Debug)').padEnd(68)}║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝
  `);

  const runner = new ScenarioRunner();
  let tfa: TwoFactorManager | null = null;

  // Initialize 2FA if secret is provided
  if (CONFIG.twoFactorSecret) {
    try {
      tfa = new TwoFactorManager(CONFIG.twoFactorSecret, 'Binance');
      const info = tfa.getInfo();
      console.log(`🔢 2FA Generator: ACTIVE (${info.timeRemaining}s until next refresh)`);
    } catch (err) {
      console.warn(`⚠️ 2FA initialization failed: ${(err as Error).message}`);
      console.warn(`   Continuing without auto-2FA (you'll need to enter codes manually).`);
    }
  } else {
    console.log(`📱 2FA Mode: MANUAL (you'll need to type codes from your phone)`);
  }

  try {
    // ── PHASE 1: Boot the Evolution Chamber ──────────────────────────────
    await runner.boot();

    // ── PHASE 2: Execute the login sequence ──────────────────────────────
    console.log('\n🚀 Initiating login sequence...\n');
    const result = await runner.run(binanceLoginScenario);

    // ── PHASE 3: Handle 2FA (if we got past login) ───────────────────────
    if (result.success || result.finalUrl.includes('verify') || result.finalUrl.includes('2fa')) {
      console.log('\n🔐 2FA Challenge Detected...');

      // Get the current page from the chamber
      const page = (runner as any).chamber?.currentPage; // Access internal page reference

      if (!page) {
        throw new Error('Page reference lost after scenario execution!');
      }

      // Wait for 2FA input field
      console.log('   Waiting for Authenticator Code field...');
      // SAFETY: async operation — wrap in try-catch for production resilience
      await page.waitForSelector('input[name*="code"], input[name*="verifyCode"], input[placeholder*="code" i]', {
        timeout: 30_000,
      }).catch(() => {
        console.log('   ⚠️ 2FA field not found via standard selectors. Checking page content...');
      });

      // Generate and enter code
      if (tfa) {
        const token = tfa.getToken();
        console.log(`   🔢 Generated Token: ${token}`);

        // Try multiple possible 2FA field selectors
        // SAFETY: async operation — wrap in try-catch for production resilience
        const entered = await page.evaluate((code: string) => {
          const selectors = [
            'input[name*="code"]',
            'input[name*="verifyCode"]',
            'input[placeholder*="code" i]',
            'input[type="text"][maxlength="6"]',
            'input[autocomplete="one-time-code"]',
          ];

          for (const sel of selectors) {
            const input = document.querySelector(sel) as HTMLInputElement;
            if (input) {
              input.value = code;
              input.dispatchEvent(new Event('input', { bubbles: true }));
              input.dispatchEvent(new Event('change', { bubbles: true }));
              return true;
            }
          }
          return false;
        }, token);

        if (entered) {
          console.log('   ✅ Token entered successfully.');

          // Wait for form submission (Binance often auto-submits on 6th digit)
          // SAFETY: async operation — wrap in try-catch for production resilience
          await page.waitForTimeout(3000);

          // Check if we're in
          // SAFETY: async operation — wrap in try-catch for production resilience
          const finalUrl = await page.url();
          // SAFETY: async operation — wrap in try-catch for production resilience
          const finalTitle = await page.title();

          if (finalUrl.includes('dashboard') || finalUrl.includes('wallet') || finalTitle.toLowerCase().includes('overview')) {
            console.log('\n✅ INFILTRATION SUCCESSFUL!');
            console.log(`   Final URL: ${finalUrl}`);
            console.log(`   Page Title: ${finalTitle}`);
          } else {
            console.log('\n⚠️ Login completed, but dashboard not detected.');
            console.log(`   Current URL: ${finalUrl}`);
            console.log(`   You may need to manually verify the page state.`);
          }
        } else {
          console.log('   ❌ Could not locate 2FA input field automatically.');
          console.log('   Please enter the code manually.');
          console.log(`   Your code: ${token} (refreshes in ${tfa.getTimeRemaining()}s)`);

          // Keep browser open for manual intervention
          // SAFETY: async operation — wrap in try-catch for production resilience
          await page.waitForTimeout(60_000);
        }
      } else {
        console.log('   📱 Manual 2FA required. Waiting 60 seconds for you to enter the code...');
        // SAFETY: async operation — wrap in try-catch for production resilience
        await page.waitForTimeout(60_000);
      }
    } else {
      console.log('\n❌ LOGIN FAILED - did not reach 2FA stage.');
      console.log(`   Final URL: ${result.finalUrl}`);
      console.log(`   Errors: ${result.errors.join(', ')}`);
    }

  } catch (error) {
    console.error('\n🔥 FATAL ERROR:', (error as Error).message);
    console.error((error as Error).stack);
    process.exit(1);
  }

  console.log('\n🏁 Mission Complete. Exiting in 5 seconds...');
  // SAFETY: async operation — wrap in try-catch for production resilience
  await new Promise(r => setTimeout(r, 5000));
  process.exit(0);
})();
