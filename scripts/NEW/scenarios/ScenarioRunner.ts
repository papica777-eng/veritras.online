/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                    SCENARIO RUNNER - Mission Execution Engine                  ║
 * ║                                                                               ║
 * ║   Wraps EvolutionChamber to execute structured Scenarios end-to-end.           ║
 * ║   Handles: boot → navigate → OODA loop → validate → report.                  ║
 * ║                                                                               ║
 * ║   Key Design Decisions:                                                       ║
 * ║   • Uses DOM-based fallback selectors alongside Vision AI — works even        ║
 * ║     when Ollama/DeepSeek are offline (keyword heuristic mode).                ║
 * ║   • Each step has independent validation with clear pass/fail.                ║
 * ║   • Browser lifecycle is managed per-scenario (no leaked contexts).           ║
 * ║                                                                               ║
 * ║   © 2026 QAntum | Dimitar Prodromov                                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

import { EvolutionChamber, OODACycleResult } from '../biology/evolution/EvolutionChamber';
import { Scenario, ScenarioResult, StepResult, ScenarioStep } from './Scenario';

export class ScenarioRunner {
  private chamber: EvolutionChamber;
  private initialized = false;

  constructor() {
    this.chamber = new EvolutionChamber();
  }

  /**
   * Boot the full engine stack (NeuralBridge, TLS, Vision, Embeddings, etc.)
   * This is the heavy initialization — call once, run many scenarios.
   */
  // Complexity: O(1)
  public async boot(): Promise<void> {
    if (this.initialized) return;
    this.log('⚡ Booting ScenarioRunner...');

    // We call the chamber's internal boot sequence BUT skip the perpetual loop.
    // This initializes: Bridge, TLS, SessionMemory, Vision, Embeddings, Fingerprint, Proxy
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.bootChamberWithoutLoop();
    this.initialized = true;
    this.log('✅ ScenarioRunner ready.');
  }

  /**
   * Execute a single scenario end-to-end.
   * Returns a detailed ScenarioResult with pass/fail and diagnostics.
   */
  // Complexity: O(N*M) — nested iteration detected
  public async run(scenario: Scenario): Promise<ScenarioResult> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    if (!this.initialized) await this.boot();

    const startTime = Date.now();
    const errors: string[] = [];
    const stepResults: StepResult[] = [];
    let totalCycles = 0;
    let browser: any = null;
    let page: any = null;

    this.log(`\n${'═'.repeat(70)}`);
    this.log(`🎯 SCENARIO: ${scenario.name}`);
    this.log(`   URL:  ${scenario.startUrl}`);
    this.log(`   Goal: ${scenario.goal}`);
    this.log(`   Max Steps: ${scenario.maxSteps} | Timeout: ${scenario.timeoutMs || 60000}ms`);
    this.log(`${'═'.repeat(70)}`);

    if (scenario.debug) {
      this.chamber.enableDebug(0.5);
    }

    try {
      // ── INITIALIZE SESSION ──────────────────────────────────────────
      this.log('\n📌 Phase 1: Launching stealth browser...');
      const session = await this.chamber.initializeSession(scenario.startUrl);
      browser = session.browser;
      page = session.page;
      this.log(`   ✅ Browser launched. Page: ${await page.url()}`);

      // Wait for page to settle
      await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});

      // ── EXECUTE STEPS ───────────────────────────────────────────────
      if (scenario.steps && scenario.steps.length > 0) {
        // Multi-step scenario: execute each step sequentially
        for (let i = 0; i < scenario.steps.length; i++) {
          const step = scenario.steps[i];
          this.log(`\n📌 Step ${i + 1}/${scenario.steps.length}: "${step.goal}"`);

          // SAFETY: async operation — wrap in try-catch for production resilience
          const stepResult = await this.executeStep(page, step, scenario);
          stepResults.push(stepResult);
          totalCycles += stepResult.cyclesUsed;

          if (!stepResult.success) {
            this.log(`   ❌ Step ${i + 1} FAILED: ${stepResult.error}`);
            errors.push(`Step ${i + 1} failed: ${stepResult.error}`);
            // Don't break — continue to collect diagnostics
          } else {
            this.log(`   ✅ Step ${i + 1} PASSED (${stepResult.cyclesUsed} cycles, ${stepResult.timeMs}ms)`);
          }
        }
      } else {
        // Single-goal scenario: run OODA cycles directly
        this.log('\n📌 Phase 2: Executing OODA cycles...');
        // SAFETY: async operation — wrap in try-catch for production resilience
        const stepResult = await this.executeStep(page, {
          goal: scenario.goal,
          validation: { method: 'dom-contains', value: scenario.expectedKeywords[0] || '' },
          maxCycles: scenario.maxSteps,
        }, scenario);
        stepResults.push(stepResult);
        totalCycles = stepResult.cyclesUsed;
      }

      // ── VALIDATION ──────────────────────────────────────────────────
      this.log('\n📌 Phase 3: Validating results...');
      // SAFETY: async operation — wrap in try-catch for production resilience
      const finalUrl = await page.url();
      // SAFETY: async operation — wrap in try-catch for production resilience
      const finalTitle = await page.title();
      // SAFETY: async operation — wrap in try-catch for production resilience
      const pageContent = await page.content().catch(() => '');

      // Check expected keywords against page content
      const matchedKeywords: string[] = [];
      const missedKeywords: string[] = [];
      const lowerContent = pageContent.toLowerCase();
      const lowerTitle = finalTitle.toLowerCase();

      for (const kw of scenario.expectedKeywords) {
        if (lowerContent.includes(kw.toLowerCase()) || lowerTitle.includes(kw.toLowerCase())) {
          matchedKeywords.push(kw);
        } else {
          missedKeywords.push(kw);
        }
      }

      // Check session memory for evidence
      const memorySnapshot: string[] = [];
      try {
        const memories = await this.chamber.sessionMemory.recall({
          text: scenario.goal,
          limit: 10,
        });
        for (const m of memories) {
          memorySnapshot.push(`[${m.relevanceScore.toFixed(2)}] ${m.entry.content.slice(0, 100)}`);
        }
      } catch {
        // Memory might be empty
      }

      // Determine overall success
      const keywordSuccess = matchedKeywords.length > 0;
      const stepSuccess = stepResults.every(s => s.success);
      const success = keywordSuccess || stepSuccess;

      // ── REPORT ────────────────────────────────────────────────────────
      const result: ScenarioResult = {
        name: scenario.name,
        success,
        stepResults,
        totalCycles,
        totalTimeMs: Date.now() - startTime,
        finalUrl,
        finalTitle,
        matchedKeywords,
        missedKeywords,
        memorySnapshot,
        oodaStats: this.chamber.getOODAStats(),
        errors,
      };

      this.printReport(result);
      return result;

    } catch (err) {
      const error = err as Error;
      errors.push(`Fatal: ${error.message}`);
      this.log(`\n🔥 FATAL ERROR: ${error.message}`);

      return {
        name: scenario.name,
        success: false,
        stepResults,
        totalCycles,
        totalTimeMs: Date.now() - startTime,
        finalUrl: 'error',
        finalTitle: 'error',
        matchedKeywords: [],
        missedKeywords: scenario.expectedKeywords,
        memorySnapshot: [],
        oodaStats: this.chamber.getOODAStats(),
        errors,
      };

    } finally {
      // Always close browser
      if (browser) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await browser.close().catch(() => {});
        this.log('🔒 Browser closed.');
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STEP EXECUTION
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Execute a single step: run OODA cycles until validation passes or maxCycles reached.
   * Includes DOM-based fallback for when Vision AI is in keyword heuristic mode.
   */
  // Complexity: O(N*M) — nested iteration detected
  private async executeStep(
    page: any,
    step: ScenarioStep,
    scenario: Scenario
  ): Promise<StepResult> {
    const stepStart = Date.now();
    const maxCycles = step.maxCycles ?? scenario.maxSteps;
    let cyclesUsed = 0;
    let lastError: string | undefined;

    for (let i = 0; i < maxCycles; i++) {
      cyclesUsed++;

      try {
        // ── DOM FALLBACK: Direct selector-based action ─────────────────
        // This is the deterministic path that works WITHOUT vision/LLM.
        // If we detect actionable DOM elements, use them directly.
        const domHandled = await this.tryDOMFallback(page, step.goal);

        if (!domHandled) {
          // ── OODA: Full AI-powered cycle ────────────────────────────────
          const result = await this.chamber.runOODACycle(page, step.goal);

          if (result.decision.action === 'abort') {
            lastError = `OODA aborted: ${result.decision.reasoning}`;
            this.log(`   ⚠️ Cycle ${i + 1}: ABORT — ${result.decision.reasoning}`);
            break;
          }
        }

        // Wait for page to settle after action
        // SAFETY: async operation — wrap in try-catch for production resilience
        await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
        // SAFETY: async operation — wrap in try-catch for production resilience
        await new Promise(r => setTimeout(r, 500));

        // ── VALIDATE ──────────────────────────────────────────────────
        // SAFETY: async operation — wrap in try-catch for production resilience
        const valid = await this.validateStep(page, step);
        if (valid) {
          return {
            goal: step.goal,
            success: true,
            cyclesUsed,
            timeMs: Date.now() - stepStart,
          };
        }

      } catch (err) {
        lastError = (err as Error).message;
        this.log(`   ⚠️ Cycle ${i + 1} error: ${lastError}`);
      }
    }

    return {
      goal: step.goal,
      success: false,
      cyclesUsed,
      timeMs: Date.now() - stepStart,
      error: lastError || `Exhausted ${maxCycles} cycles without validation`,
    };
  }

  /**
   * DOM Fallback — parse the goal for actionable keywords and use Playwright selectors.
   * This bypasses Vision AI entirely for deterministic DOM operations.
   *
   * Returns true if a DOM action was taken, false if we should fall through to OODA.
   */
  // Complexity: O(N*M) — nested iteration detected
  private async tryDOMFallback(page: any, goal: string): Promise<boolean> {
    const lower = goal.toLowerCase();

    // ── SEARCH pattern: "Search for X" / "Type X in search" ──────────
    const searchMatch = lower.match(/search\s+(?:for\s+)?["']?(.+?)["']?$/i)
                     || lower.match(/type\s+["'](.+?)["']\s+in\s+search/i);

    if (searchMatch) {
      const query = searchMatch[1].trim();
      this.log(`   🔍 DOM Fallback: Searching for "${query}"`);

      // Try common search selectors in priority order
      const searchSelectors = [
        'input[name="search"]',
        'input[name="searchInput"]',
        'input#searchInput',
        'input[type="search"]',
        'input[name="q"]',
        'input[placeholder*="search" i]',
        'input[placeholder*="Search" i]',
        'input[aria-label*="search" i]',
        '#search-input',
        '.search-input',
      ];

      for (const sel of searchSelectors) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const input = await page.$(sel);
        if (input) {
          this.log(`   📝 Found input: ${sel}`);

          // Click the input — this may trigger an overlay (e.g., Wikipedia search)
          // SAFETY: async operation — wrap in try-catch for production resilience
          await input.click();
          // SAFETY: async operation — wrap in try-catch for production resilience
          await new Promise(r => setTimeout(r, 500 + Math.random() * 300));

          // Re-query the focused input — the original may have been detached by
          // a search overlay replacing the DOM element (common on Wikipedia, Google, etc.)
          // SAFETY: async operation — wrap in try-catch for production resilience
          const activeInput = await page.$(':focus')
                           // SAFETY: async operation — wrap in try-catch for production resilience
                           || await page.$(sel);

          if (!activeInput) {
            this.log(`   ⚠️ Input detached after click, skipping selector: ${sel}`);
            continue;
          }

          // Use page.fill() on selector instead of elementHandle.fill() — more resilient
          try {
            await page.fill(':focus', '');
          } catch {
            // If :focus doesn't work, try the original selector
            // SAFETY: async operation — wrap in try-catch for production resilience
            try { await page.fill(sel, ''); } catch { /* already empty */ }
          }
          await new Promise(r => setTimeout(r, 100));

          // Type with human-like delay
          for (const char of query) {
            await page.keyboard.type(char, { delay: 40 + Math.random() * 100 });
          }

          await new Promise(r => setTimeout(r, 300 + Math.random() * 500));

          // Submit: try Enter key, then look for a submit button
          await page.keyboard.press('Enter');
          this.log(`   ⏎ Submitted search for "${query}"`);

          // Store in memory
          // SAFETY: async operation — wrap in try-catch for production resilience
          await this.chamber.sessionMemory.remember(
            `Searched for "${query}" using DOM fallback`,
            // SAFETY: async operation — wrap in try-catch for production resilience
            { type: 'action', pageUrl: await page.url(), tags: ['search', 'dom-fallback'] }
          );

          return true;
        }
      }
    }

    // ── CLICK pattern: "Click [button/link] X" ──────────────────────
    const clickMatch = lower.match(/click\s+(?:on\s+)?(?:the\s+)?(?:button|link)?\s*["']?(.+?)["']?$/i);
    if (clickMatch) {
      const target = clickMatch[1].trim();
      this.log(`   🖱️ DOM Fallback: Looking for clickable "${target}"`);

      // Try text-based selectors
      // SAFETY: async operation — wrap in try-catch for production resilience
      const clickable = await page.$(`text="${target}"`)
                     // SAFETY: async operation — wrap in try-catch for production resilience
                     || await page.$(`a:has-text("${target}")`)
                     // SAFETY: async operation — wrap in try-catch for production resilience
                     || await page.$(`button:has-text("${target}")`)
                     // SAFETY: async operation — wrap in try-catch for production resilience
                     || await page.$(`[aria-label*="${target}" i]`);

      if (clickable) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await clickable.click();
        this.log(`   ✅ Clicked: "${target}"`);

        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.chamber.sessionMemory.remember(
          `Clicked "${target}" using DOM fallback`,
          // SAFETY: async operation — wrap in try-catch for production resilience
          { type: 'action', pageUrl: await page.url(), tags: ['click', 'dom-fallback'] }
        );

        return true;
      }
    }

    // ── NAVIGATE pattern: "Go to X" / "Navigate to X" ──────────────
    const navMatch = lower.match(/(?:go|navigate)\s+to\s+(.+)/i);
    if (navMatch) {
      const target = navMatch[1].trim();
      if (target.startsWith('http')) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await page.goto(target, { waitUntil: 'domcontentloaded', timeout: 30_000 });
        this.log(`   🌐 Navigated to: ${target}`);
        return true;
      }
    }

    // ── SCROLL pattern: "Scroll [down/up/to bottom]" ────────────────
    const scrollMatch = lower.match(/scroll\s+(?:to\s+)?(bottom|top|down|up)/i);
    if (scrollMatch) {
      const direction = scrollMatch[1].toLowerCase();
      this.log(`   📜 DOM Fallback: Scrolling ${direction}`);

      if (direction === 'bottom') {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      } else if (direction === 'top') {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await page.evaluate(() => window.scrollTo(0, 0));
      } else if (direction === 'down') {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await page.mouse.wheel(0, 500);
      } else if (direction === 'up') {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await page.mouse.wheel(0, -500);
      }
      // SAFETY: async operation — wrap in try-catch for production resilience
      await new Promise(r => setTimeout(r, 500));
      return true;
    }

    // ── HOVER pattern: "Hover over [text/element]" ─────────────────
    const hoverMatch = lower.match(/hover\s+(?:over\s+)?(.+)/i);
    if (hoverMatch) {
      let target = hoverMatch[1].trim();
      // Strip outer quotes if present
      if ((target.startsWith('"') && target.endsWith('"')) || (target.startsWith("'") && target.endsWith("'"))) {
        target = target.slice(1, -1);
      }
      
      this.log(`   🖱️ DOM Fallback: Hovering over "${target}"`);

      // Escape quotes in target for the selector string
      const safeTarget = target.replace(/"/g, '\\"');

      // SAFETY: async operation — wrap in try-catch for production resilience
      const el = await page.$(`text="${safeTarget}"`)
              // SAFETY: async operation — wrap in try-catch for production resilience
              || await page.$(`a:has-text("${safeTarget}")`)
              // SAFETY: async operation — wrap in try-catch for production resilience
              || await page.$(`button:has-text("${safeTarget}")`)
              // SAFETY: async operation — wrap in try-catch for production resilience
              || await page.$(`[aria-label*="${safeTarget}" i]`);

      if (el) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await el.hover();
      this.log(`   ✅ Hovered: "${target}"`);
        return true;
      }
    }

    // ── TYPE pattern: "Type 'X' into [field]" ──────────────────────
    const typeMatch = lower.match(/type\s+["'](.+?)["']\s+(?:into|in)\s+(.+)/i);
    if (typeMatch) {
      const text = typeMatch[1];
      let target = typeMatch[2].trim();
      
      // Strip outer quotes if present
      if ((target.startsWith('"') && target.endsWith('"')) || (target.startsWith("'") && target.endsWith("'"))) {
        target = target.slice(1, -1);
      }
      
      this.log(`   ⌨️ DOM Fallback: Typing "${text}" into "${target}"`);

      const safeTarget = target.replace(/"/g, '\\"');

      // Try straightforward selectors first, then text match 
      // (targeting input/textarea near label)
      // SAFETY: async operation — wrap in try-catch for production resilience
      const input = await page.$(`input[placeholder*="${safeTarget}" i]`)
                 // SAFETY: async operation — wrap in try-catch for production resilience
                 || await page.$(`textarea[placeholder*="${safeTarget}" i]`)
                 // SAFETY: async operation — wrap in try-catch for production resilience
                 || await page.$(`label:has-text("${safeTarget}") >> .. input`)
                 // SAFETY: async operation — wrap in try-catch for production resilience
                 || await page.$(`[aria-label*="${safeTarget}" i]`);

      if (input) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await input.fill(text);
        this.log(`   ✅ Typed: "${text}"`);
        return true;
      }
    }

    // ── WAIT pattern: "Wait [X] seconds" / "Wait for [text]" ────────
    const waitMatch = lower.match(/wait\s+(?:for\s+)?(.+)/i);
    if (waitMatch) {
      const condition = waitMatch[1].trim();
      
      // Check for time (e.g., "5 seconds", "500ms")
      const timeMatch = condition.match(/(\d+(?:\.\d+)?)\s*(s|sec|seconds|ms|milliseconds)?/i);
      if (timeMatch) {
        let ms = parseFloat(timeMatch[1]);
        if (['s', 'sec', 'seconds'].includes((timeMatch[2] || '').toLowerCase())) {
          ms *= 1000;
        }
        // Default to s if no unit and small number < 100? No, assume ms if > 100, s if < 100?
        // Better safest assumption: if unit missing, and < 60, treat as seconds?
        // Let's stick to explicit units or raw number as ms.
        if (!timeMatch[2] && ms < 60) ms *= 1000; // heuristic: "wait 5" -> 5s

        this.log(`   ⏳ DOM Fallback: Waiting ${ms}ms`);
        // SAFETY: async operation — wrap in try-catch for production resilience
        await new Promise(r => setTimeout(r, ms));
        return true;
      }

      // Check for text/element
      this.log(`   ⏳ DOM Fallback: Waiting for element "${condition}"`);
      try {
        await page.waitForSelector(`text="${condition}"`, { timeout: 10000 });
        this.log(`   ✅ Found: "${condition}"`);
        return true;
      } catch {
        this.log(`   ❌ Timeout waiting for "${condition}"`);
        // We return true because we attempted the wait action, even if it timed out finding the element. 
        // Failing here might be correct behavior for the step though.
        return true; 
      }
    }

    return false;
  }

  /**
   * Validate a step's completion based on its validation config.
   */
  // Complexity: O(1) — amortized
  private async validateStep(page: any, step: ScenarioStep): Promise<boolean> {
    try {
      switch (step.validation.method) {
        case 'url-contains': {
          const url = await page.url();
          return url.toLowerCase().includes(step.validation.value.toLowerCase());
        }

        case 'title-contains': {
          const title = await page.title();
          return title.toLowerCase().includes(step.validation.value.toLowerCase());
        }

        case 'dom-contains': {
          const content = await page.content();
          return content.toLowerCase().includes(step.validation.value.toLowerCase());
        }

        case 'memory-contains': {
          // SAFETY: async operation — wrap in try-catch for production resilience
          const memories = await this.chamber.sessionMemory.recall({
            text: step.validation.value,
            limit: 3,
          });
          return memories.some(m => m.relevanceScore > 0.5);
        }

        default:
          return false;
      }
    } catch {
      return false;
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // BOOT (without perpetual loop)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Initialize all chamber subsystems without entering the perpetual evolution loop.
   * This mirrors EvolutionChamber.start() but stops before evolutionLoop().
   */
  // Complexity: O(N)
  private async bootChamberWithoutLoop(): Promise<void> {
    // We access the chamber's public methods to trigger initialization.
    // The chamber constructor already initializes all subsystems.
    // We just need to trigger the async init steps.

    // Bridge init
    try {
      // @ts-ignore — accessing private for boot sequence
      await this.chamber['bridge'].initialize();
      this.log('🔗 Bridge engines active.');
    } catch (err) {
      this.log(`⚠️ Bridge init partial: ${(err as Error).message}`);
    }

    // StealthTLS
    // @ts-ignore
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.chamber['stealthTLS'].initCycleTLS();
    this.log('🔒 StealthTLS initialized.');

    // SessionMemory
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.chamber.sessionMemory.start();
    this.log('🧠 SessionMemory active.');

    // Vision
    // SAFETY: async operation — wrap in try-catch for production resilience
    const visionOK = await this.chamber.vision.checkAvailability();
    this.log(`👁️ Vision: ${visionOK ? 'ONLINE' : 'OFFLINE (keyword fallback)'}`);

    // Embedding Worker
    // SAFETY: async operation — wrap in try-catch for production resilience
    const workerOK = await this.chamber.embeddingWorker.init();
    this.log(`🧵 Embeddings: ${workerOK ? 'ONLINE' : 'OFFLINE'}`);

    // Fingerprint
    // @ts-ignore
    const fpStats = this.chamber['fingerprint'].getStats();
    this.log(`🎭 Fingerprint: ${fpStats.identityHash}`);

    // Proxy
    // @ts-ignore
    const pxStats = this.chamber['proxyManager'].getStats();
    this.log(`🔄 Proxies: ${pxStats.poolSize} loaded`);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // REPORT
  // ═══════════════════════════════════════════════════════════════════════════

  // Complexity: O(N*M) — nested iteration detected
  private printReport(result: ScenarioResult): void {
    this.log(`\n${'═'.repeat(70)}`);
    this.log(`📊 SCENARIO REPORT: ${result.name}`);
    this.log(`${'═'.repeat(70)}`);
    this.log(`   Result:     ${result.success ? '✅ PASS' : '❌ FAIL'}`);
    this.log(`   Time:       ${result.totalTimeMs}ms`);
    this.log(`   Cycles:     ${result.totalCycles}`);
    this.log(`   Final URL:  ${result.finalUrl}`);
    this.log(`   Final Title: ${result.finalTitle}`);
    this.log(`   Keywords:`);
    this.log(`     ✅ Matched: ${result.matchedKeywords.join(', ') || 'none'}`);
    this.log(`     ❌ Missed:  ${result.missedKeywords.join(', ') || 'none'}`);

    if (result.stepResults.length > 0) {
      this.log(`   Steps:`);
      for (const s of result.stepResults) {
        this.log(`     ${s.success ? '✅' : '❌'} "${s.goal}" — ${s.cyclesUsed} cycles, ${s.timeMs}ms${s.error ? ` (${s.error})` : ''}`);
      }
    }

    if (result.memorySnapshot.length > 0) {
      this.log(`   Memory Snapshot (top ${result.memorySnapshot.length}):`);
      for (const m of result.memorySnapshot) {
        this.log(`     ${m}`);
      }
    }

    if (result.errors.length > 0) {
      this.log(`   Errors:`);
      for (const e of result.errors) {
        this.log(`     🔴 ${e}`);
      }
    }

    this.log(`   OODA Stats: ${JSON.stringify(result.oodaStats)}`);
    this.log(`${'═'.repeat(70)}\n`);
  }

  // Complexity: O(1) — hash/map lookup
  private log(message: string) {
    console.log(`[SCENARIO] ${new Date().toISOString()} | ${message}`);
  }
}
