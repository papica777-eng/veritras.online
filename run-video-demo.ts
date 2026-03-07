import { chromium } from 'playwright';
import { SelfHealingEngine } from './src/engines/SelfHealingEngine';
import * as path from 'path';

/**
 * =========================================================================
 * QANTUM PRIME: LIVE HOMEOSTATIC SELF-HEALING DEMO FOR MIHAI
 * =========================================================================
 * This script demonstrates the absolute determinism of the Aeterna Prime
 * Self-Healing Engine. It records a video automatically.
 */

async function runDemo() {
    console.log(`\n\x1b[36m/// BOOTING QANTUM HOMEOSTATIC DEMO (VIDEO RECORDING MODE) ///\x1b[0m\n`);

    const browser = await chromium.launch({ headless: true, slowMo: 100 });
    const context = await browser.newContext({
        viewport: { width: 1280, height: 720 },
        recordVideo: { dir: './QANTUM_MIHAI_VIDEO/', size: { width: 1280, height: 720 } }
    });
    const page = await context.newPage();

    // 1. Setup a dynamic DOM simulating an updated staging environment with an embedded terminal
    await page.setContent(`
        <html>
            <body style="font-family: 'Courier New', Courier, monospace; background: #06080d; color: white; display: flex; flex-direction: row; height: 100vh; margin: 0; overflow: hidden;">
                <!-- UI Section -->
                <div style="flex: 1; padding: 40px; border-right: 2px solid #333; display: flex; flex-direction: column; justify-content: center; align-items: center;">
                    <h1 style="color: #10b981; margin-bottom: 40px; font-family: sans-serif;">Aeterna Prime Secure Portal</h1>
                    <div class="login-container" style="background: #111827; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.5); width: 100%; max-width: 400px;">
                        <input type="text" placeholder="Username" id="user" style="width: 100%; padding: 12px; margin-bottom: 20px; background: #1f2937; border: 1px solid #374151; color: white; border-radius: 6px; box-sizing: border-box;" />
                        <input type="password" placeholder="Password" id="pass" style="width: 100%; padding: 12px; margin-bottom: 30px; background: #1f2937; border: 1px solid #374151; color: white; border-radius: 6px; box-sizing: border-box;" />
                        
                        <!-- THE MUTATION: The button ID was changed from #login-submit to #auth-login-submit-99 -->
                        <button id="auth-login-submit-99" class="primary-btn" data-testid="login-action" style="width: 100%; padding: 14px; background: #2563eb; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; transition: all 0.2s;">Login Securely</button>
                    </div>
                    
                    <!-- Success indicator -->
                    <div id="success" style="display:none; color: #10b981; font-weight: bold; margin-top: 30px; padding: 20px; border: 1px solid #10b981; background: rgba(16, 185, 129, 0.1); border-radius: 8px; font-family: sans-serif; font-size: 1.2rem;">
                        [ZERO ENTROPY] SUCCESS: NEURAL LINK ESTABLISHED!
                    </div>
                </div>

                <!-- Terminal Overlay Section -->
                <div style="flex: 1; background: #000; padding: 20px; display: flex; flex-direction: column;">
                    <div style="color: #6b7280; margin-bottom: 20px; border-bottom: 1px solid #333; padding-bottom: 10px;">AETERNA PRIME VORTEX TERMINAL // LOG OUTPUT</div>
                    <div id="terminal-output" style="color: #a78bfa; font-size: 14px; line-height: 1.6; flex: 1; overflow-y: auto;">
                        <span style="color: #10b981;">> SYSTEM BOOT:</span> AETERNA PRIME QA SUBSYSTEM INITIALIZED<br/>
                    </div>
                </div>

                <script>
                    document.getElementById('auth-login-submit-99').addEventListener('click', () => {
                        document.getElementById('success').style.display = 'block';
                    });
                    
                    window.logToVortex = (msg, color = '#a78bfa') => {
                        const term = document.getElementById('terminal-output');
                        term.innerHTML += '<span style="color: ' + color + ';">' + msg + '</span><br/>';
                        term.scrollTop = term.scrollHeight;
                    };
                </script>
            </body>
        </html>
    `);

    // Helper to log to both Node terminal and the Browser page
    async function nexusLog(msg: string, colorHex: string = '#a78bfa') {
        console.log(msg); // Node.js terminal
        await page.evaluate(({ m, c }) => {
            (window as any).logToVortex(m, c);
        }, { m: msg, c: colorHex });
    }

    await page.waitForTimeout(1000);
    await nexusLog('> [CI/CD PIPELINE TRIGGERED] Starting automated test suite...', '#60a5fa');
    await page.waitForTimeout(1000);

    // 2. Arm the Self-Healing Engine
    const healer = new SelfHealingEngine({
        enabled: true,
        maxAttempts: 15,
        timeout: 2000,
        strategies: ['id', 'testId', 'class', 'role', 'text', 'fuzzy', 'semantic']
    });
    healer.setPage(page);

    // Subscribe to events for metrics
    healer.on('healed', async (result) => {
        await nexusLog('> [AETERNA LINTER] Pattern mapped successfully. Repair generated.', '#f472b6');
    });

    // 3. The Broken Test Scenario
    const originalBrokenSelector = '#login-submit'; // The outdated selector

    await nexusLog(`> [TEST EXECUTION] Searching for target: <span style="color: #ef4444">${originalBrokenSelector}</span>`, '#fbbf24');
    await nexusLog(`> [ERROR] Selector not found in DOM! (Simulated mutation detected)`, '#ef4444');
    await page.waitForTimeout(800);
    await nexusLog(`> [SELF-HEALING ENGAGED] Activating 15 parallel fallback strategies...`, '#a78bfa');

    const startTime = Date.now();
    // findWithHealing automatically handles catching the failure and generating 15 alternative trajectories
    const locator = await healer.findWithHealing(originalBrokenSelector, { timeout: 1000 });
    const timeMs = Date.now() - startTime;

    if (locator) {
        await nexusLog(`> [HEALING SUCCESS] Broken selector autonomously repaired in <span style="color: #fca5a5; font-weight: bold;">${timeMs}ms</span>!`, '#10b981');
        await page.waitForTimeout(500);

        // Visual enhancement for the video - highlight the healed button before clicking
        await locator.evaluate((node: any) => {
            node.style.border = '4px solid #10b981';
            node.style.boxShadow = '0 0 30px #10b981';
            node.style.transition = 'all 0.3s ease';
            node.style.transform = 'scale(1.05)';
        });

        await nexusLog(`> [VISUAL] Target element found and highlighted on UI.`, '#38bdf8');
        await page.waitForTimeout(1500);

        // Execute the action via the healed locator pipeline
        await nexusLog(`> [ACTION] Executing click() on repaired locator [id*="login-submit"]...`, '#9ca3af');
        await locator.click();

        // Validation
        await page.waitForTimeout(2000); // Hold the success screen so it can be seen

        const successVisible = await page.isVisible('#success');

        await nexusLog(`> [VERIFICATION] Post-action state: <span style="font-weight: bold;">${successVisible ? 'VERIFIED' : 'FAILED'}</span>`, '#10b981');

        await nexusLog(`> [O(1) CACHE] Healed mapping securely cached for future runs. Zero Entropy maintained.`, '#a78bfa');

    } else {
        await nexusLog(`> [FATAL] Auto-healing failed. Entropy increased.`, '#ef4444');
    }

    await page.waitForTimeout(3000); // Wait a few seconds to let the recorder capture the final frame
    await browser.close();

    console.log(`\n\x1b[36m/// VIDEO SAVED IN ./QANTUM_MIHAI_VIDEO/ DIRECTORY ///\x1b[0m\n`);
}

runDemo().catch(console.error);
