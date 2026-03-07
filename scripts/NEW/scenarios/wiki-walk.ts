/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                     WIKI-WALK SCENARIO — E2E Proof of Life                    ║
 * ║                                                                               ║
 * ║   Mission: Go to Wikipedia → Search "Turing Test" → Verify page content.      ║
 * ║                                                                               ║
 * ║   This scenario is designed to work in KEYWORD FALLBACK mode (no LLM).        ║
 * ║   It uses the DOM fallback path for deterministic DOM interactions,            ║
 * ║   and validates via page content keywords.                                    ║
 * ║                                                                               ║
 * ║   Pipeline tested: Browser → Stealth → Fingerprint → DOM → Memory → Report   ║
 * ║                                                                               ║
 * ║   © 2026 QAntum | Dimitar Prodromov                                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

import { ScenarioRunner } from './ScenarioRunner';
import { Scenario } from './Scenario';

// ═══════════════════════════════════════════════════════════════════════════════
// SCENARIO DEFINITION
// ═══════════════════════════════════════════════════════════════════════════════

const wikiWalkScenario: Scenario = {
  name: 'Wiki-Walk: Turing Test',
  startUrl: 'https://en.wikipedia.org/wiki/Main_Page',
  goal: 'Search for Turing Test',
  maxSteps: 5,
  expectedKeywords: ['Turing test', 'Alan Turing', 'imitation game'],
  timeoutMs: 60_000,
  headless: true,
  debug: true,

  steps: [
    {
      goal: 'Search for Turing Test',
      validation: {
        method: 'title-contains',
        value: 'Turing test',
      },
      maxCycles: 3,
    },
    {
      goal: 'Verify we are on the Turing Test article',
      validation: {
        method: 'dom-contains',
        value: 'imitation game',
      },
      maxCycles: 2,
    },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// EXECUTION
// ═══════════════════════════════════════════════════════════════════════════════

async function main() {
  console.log('\n' + '█'.repeat(70));
  console.log('█  PHASE 4: SCENARIO SCRIPTING — Wiki-Walk E2E Test');
  console.log('█  Testing: DOM → Vision → OODA → Memory → Validation');
  console.log('█'.repeat(70) + '\n');

  const runner = new ScenarioRunner();

  try {
    // Boot the full engine stack
    await runner.boot();

    // Execute the scenario
    const result = await runner.run(wikiWalkScenario);

    // Exit with appropriate code
    if (result.success) {
      console.log('\n🏆 WIKI-WALK SCENARIO: PASSED');
      process.exit(0);
    } else {
      console.log('\n💀 WIKI-WALK SCENARIO: FAILED');
      console.log('   Errors:', result.errors);
      console.log('   Missed keywords:', result.missedKeywords);
      process.exit(1);
    }

  } catch (err) {
    console.error('\n🔥 FATAL:', (err as Error).message);
    console.error((err as Error).stack);
    process.exit(1);
  }
}

    // Complexity: O(1)
main();
