import { chromium } from 'playwright';
import { SelfHealingEngine } from './src/engines/SelfHealingEngine';

/**
 * =========================================================================
 * QANTUM PRIME: LIVE HOMEOSTATIC SELF-HEALING DEMO FOR MIHAI
 * =========================================================================
 * This script demonstrates the absolute determinism of the Aeterna Prime
 * Self-Healing Engine. 
 * 
 * Scenario:
 * - A CI pipeline runs tests against an updated UI.
 * - The engineering team changed `#login-submit` to `#auth-login-submit-99`.
 * - The hardcoded test selector fails.
 * - The SelfHealing Engine steps in, extrapolates the fuzzy heuristic pattern,
 *   repairs the selector, executes the click, and caches the healed state for O(1) future runs.
 */

async function runDemo() {
    await new Promise(resolve => setTimeout(resolve, 2000)); // Pause to start screen recording
    console.log(`\n\x1b[36m/// BOOTING QANTUM HOMEOSTATIC DEMO ///\x1b[0m\n`);

    const browser = await chromium.launch({ headless: false, slowMo: 100 });
    const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const page = await context.newPage();

    // 1. Setup a dynamic DOM simulating an updated staging environment
    await page.setContent(`
        <html>
            <body style="font-family: sans-serif; background: #06080d; color: white;">
                <h1>Aeterna Prime Secure Portal</h1>
                <div class="login-container">
                    <input type="text" placeholder="Username" id="user" />
                    <input type="password" placeholder="Password" id="pass" />
                    <!-- THE MUTATION: The button ID was changed from #login-submit to #auth-login-submit-99 -->
                    <button id="auth-login-submit-99" class="primary-btn" data-testid="login-action">Login Securely</button>
                </div>
                <!-- Success indicator -->
                <div id="success" style="display:none; color: #10b981; font-weight: bold; margin-top: 20px;">
                    SUCCESS: NEURAL LINK ESTABLISHED!
                </div>
                <script>
                    document.getElementById('auth-login-submit-99').addEventListener('click', () => {
                        document.getElementById('success').style.display = 'block';
                    });
                </script>
            </body>
        </html>
    `);

    // 2. Arm the Self-Healing Engine
    const healer = new SelfHealingEngine({
        enabled: true,
        maxAttempts: 15,
        timeout: 2000,
        strategies: ['id', 'testId', 'class', 'role', 'text', 'fuzzy', 'semantic']
    });
    healer.setPage(page);

    // Subscribe to events for metrics
    healer.on('healed', (result) => {
        console.log(`\x1b[35m[AETERNA LINTER]\x1b[0m Pattern successfully mapped.`);
    });

    // 3. The Broken Test Scenario
    const originalBrokenSelector = '#login-submit'; // The outdated selector

    console.log(`\x1b[33m[TEST EXECUTION] Searching for target: ${originalBrokenSelector}\x1b[0m`);

    const startTime = Date.now();
    // findWithHealing automatically handles catching the failure and generating 15 alternative trajectories
    const locator = await healer.findWithHealing(originalBrokenSelector, { timeout: 1000 });
    const timeMs = Date.now() - startTime;

    if (locator) {
        console.log(`\n\x1b[32m[HEALING SUCCESS]\x1b[0m Broken selector autonomously repaired in \x1b[36m${timeMs}ms\x1b[0m!`);

        // Visual enhancement for the video - highlight the healed button before clicking
        await locator.evaluate((node: any) => {
            node.style.border = '3px solid #10b981';
            node.style.boxShadow = '0 0 20px #10b981';
            node.style.transition = 'all 0.3s ease';
        });

        console.log(`\x1b[36m[VISUAL]\x1b[0m Highlighting successfully found target element...`);
        await page.waitForTimeout(1500);

        // Execute the action via the healed locator pipeline
        await locator.click();

        // Validation
        await page.waitForTimeout(2000); // Hold the success screen so it can be seen

        const successVisible = await page.isVisible('#success');

        console.log(`[VERIFICATION] Target successfully clicked. Post-action state: \x1b[35m${successVisible ? 'VERIFIED' : 'FAILED'}\x1b[0m\n`);

        // Measurable Before & After
        console.log(`\x1b[36m/// HEALING METRICS & RESULTS ///\x1b[0m`);
        const history = (healer as any).healingHistory;
        console.table(history.map((h: any) => ({
            Original: h.originalSelector,
            Healed: h.healedSelector,
            Strategy: h.strategyUsed,
            ExecutionTime: `${timeMs}ms`
        })));

    } else {
        console.log(`\x1b[31m[FATAL] Auto - healing failed.Entropy increased.\x1b[0m`);
    }

    await browser.close();
    console.log(`\n\x1b[36m/// SHUTTING DOWN HOMEOSTATIC DEMO ///\x1b[0m\n`);
}

runDemo().catch(console.error);
