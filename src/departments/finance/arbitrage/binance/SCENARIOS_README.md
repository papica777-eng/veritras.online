# 🧬 Evolution Chamber & Scenario Runner

This module provides the core OODA (Observe-Orient-Decide-Act) engine and a robust testing harness for the **QAntum Framework**. It allows for autonomous agent execution, scenario validation, and deterministic fallback mechanisms when LLM inference is unavailable.

## 📂 Architecture Overview

The system is built on four key components:

| File | Role |
| :--- | :--- |
| **`Scenario.ts`** | Holds the core TypeScript interfaces (`Scenario`, `ScenarioStep`, `StepValidation`, `ScenarioResult`). Defines the contract for agent missions. |
| **`ScenarioRunner.ts`** | The execution engine. Orchestrates environment boot-up, step execution, DOM fallback logic, and detailed validation and reporting. |
| **`wiki-walk.ts`** | An end-to-end reference implementation that navigates Wikipedia, runs a search, and validates content (e.g., finding "Turing Test"). |
| **`EvolutionChamber.ts`** | The autonomous agent "brain". Exports OODA types and exposes internal state (memory, vision, embedding) for external validation. |

## 🛠️ Recent Core Improvements

| Change | Description | Benefit |
| :--- | :--- | :--- |
| **Public API & Types** | `EvolutionChamber` class and OODA types are now exported. | Enables the engine to be consumed by external test suites and other modules. |
| **Introspection Fields** | Exposed `sessionMemory`, `vision`, `embeddingWorker`, and `mouse`. | Allows scenarios to validate internal state (e.g., "Did the agent *actually* see the element?"). |
| **Auto-Run Guard** | Added `if (require.main === module)` check to main loops. | Prevents the agent from auto-starting during imports, keeping CI/CD pipelines clean. |
| **Stale Element Fix** | Switched from `elementHandle.fill()` to `page.fill()` with re-querying. | Ensures interactions work reliably properly even when modern React/Vue apps mutate the DOM (detaching inputs). |
| **DOM Fallback Engine** | A deterministic heuristic engine for "Search/Click/Navigate" actions. | Guarantees mission success without an active LLM connection (offline mode). |

## 🚀 Execution Flow

1.  **Boot**: `ScenarioRunner.boot()` spins up the `EvolutionChamber`, loads the LLM (if configured), and initializes the Vision and Embedding/Memory pipelines.
2.  **Run**: The specific `Scenario` is loaded, and steps are executed sequentially.
3.  **OODA Loop**: The agent "Thinks" (Observe -> Orient -> Decide -> Act).
    *   *LLM Path*: The goal is sent to the model for high-level reasoning.
    *   *Fallback Path*: If the LLM is offline or returns malformed data, the **DOM Heuristic Engine** takes over, matching patterns like "Search for X" to CSS selectors.
4.  **Validate**: Each step's outcome is verified against `StepValidation` rules (e.g., `url-contains`, `dom-contains`).
5.  **Report**: A detailed JSON report is generated, logging every prompt, selector, action, and result.

## 💻 Quick Start Guide

### 1. Install Dependencies
```bash
npm ci
```

### 2. Run the Wiki-Walk Scenario (LLM Enabled)
This will boot the full agent with Vision and Memory enabled.
```bash
node wiki-walk.ts
```

### 3. Run in Offline / Fallback-Only Mode
Forces the agent to use deterministic selectors (skip LLM trace). Ideal for CI/CD speed.
```bash
# Windows (PowerShell)
$env:EVO_USE_FALLBACK="1"; node wiki-walk.ts

# Linux/Mac
EVO_USE_FALLBACK=1 node wiki-walk.ts
```

### 4. Run Tests
(If test suite is configured)
```bash
npm test
```

> **Note:** Due to the `require.main === module` guard, you can safely import `./wiki-walk` or `./EvolutionChamber` in your own scripts without triggering the infinite loop.

## 📝 Example Scenario Definition

Scenarios are defined using the `Scenario` interface:

```typescript
const wikiWalkScenario: Scenario = {
    name: 'Wiki-Walk: Turing Test',
    steps: [
        {
            id: 'nav-wiki',
            goal: 'Navigate to https://en.wikipedia.org/wiki/Main_Page',
            actionType: 'navigate',
            validation: { type: 'url-contains', value: 'wikipedia.org' }
        },
        {
            id: 'search-turing',
            goal: 'Search for "Turing Test" in the search bar',
            actionType: 'input',
            validation: { type: 'dom-contains', selector: 'h1', value: 'Turing test' }
        }
    ]
};
```

## 🎯 Real-World Scenarios

### Binance Login (Autonomous Authentication)

A production-ready scenario demonstrating:
- Automated email/password entry
- Dynamic 2FA code generation (Google Authenticator compatible)
- CAPTCHA detection with manual intervention fallback

[**📖 Full Documentation**](./scenarios/BINANCE_LOGIN_GUIDE.md)

**Quick Start:**
```bash
# 1. Configure credentials in .env
BINANCE_EMAIL=your_email@example.com
BINANCE_PASSWORD=your_password
BINANCE_2FA_SECRET=YOUR_BASE32_SECRET

# 2. Run the scenario
npx ts-node --project PRIVATE-CORE/tsconfig.json PRIVATE-CORE/scenarios/binance-login.ts
```
