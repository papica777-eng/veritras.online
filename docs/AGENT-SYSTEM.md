# QAntum Autonomous Agent System — Complete Documentation

> **Status:** ONLINE — All agents running autonomously
> **Version:** v1.0.2 — Enterprise QA Suite
> **Live Product:** [veritras.website](https://veritras.website)
> **Last Updated:** 2026-02-28

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Active Autonomous Agents](#2-active-autonomous-agents)
3. [PSYCHE Multi-Personality Engine](#3-psyche-multi-personality-engine)
4. [Sovereign Market Platform](#4-sovereign-market-platform)
5. [Mister Mind Surgeon — Self-Healing Codebase](#5-mister-mind-surgeon--self-healing-codebase)
6. [Intelligence Layer](#6-intelligence-layer)
7. [Marketing Agents](#7-marketing-agents)
8. [Environment Variables (.env)](#8-environment-variables-env)
9. [How to Start Everything](#9-how-to-start-everything)
10. [Data Files and Persistence](#10-data-files-and-persistence)
11. [Architecture Diagram](#11-architecture-diagram)

---

## 1. System Overview

QAntum is an **Enterprise QA Automation Platform + Autonomous Marketing Engine** with four pillars:

| Pillar | Description | Entry Point |
|--------|-------------|-------------|
| **QA Engine** | Playwright-based self-healing test automation | `ai/server.ts` |
| **Sovereign Market** | Standalone marketing platform with anti-bot + worker pool | `sovereign-market/index.ts` |
| **Sales Automation** | PSYCHE multi-persona B2B outreach | `scripts/auto-outreach.ts` |
| **Self-Healing Code** | Autonomous TypeScript error repair | `scripts/mister-mind-surgeon.ts` |

---

## 2. Active Autonomous Agents

### Currently Running

| Script | Interval | Purpose | Command |
|--------|----------|---------|---------|
| `x-marketing-cycle.ts` | 4 hours | X (Twitter) brand content | `npx ts-node scripts/x-marketing-cycle.ts` |
| `x-follow-agent.ts` | Continuous | Follows QA/Dev accounts on X | `npx ts-node scripts/x-follow-agent.ts` |
| `b2b-outreach-cycle.ts` | 6 hours | B2B email via PSYCHE personas | `npx ts-node scripts/b2b-outreach-cycle.ts` |
| `linkedin-marketing-cycle.ts` | 24 hours | LinkedIn thought leadership | `npx ts-node scripts/linkedin-marketing-cycle.ts` |
| `ai/server.ts` | Continuous | QA Dashboard backend port 8890 | `npx ts-node ai/server.ts` |
| `sovereign-market/veritras-campaign.ts` | 6 hours loop | All-channel Veritras campaigns | `npx ts-node sovereign-market/veritras-campaign.ts --loop` |

---

## 3. PSYCHE Multi-Personality Engine

**File:** `scripts/psyche-persona-engine.ts`
**Complexity:** O(1) persona selection

### Purpose

Prevents outreach emails from sounding AI-generated. 5 rotating human personas with unique tone, subject lines, and writing style. Learns which personas generate replies.

### 5 Personas

| ID | Name | Tone | Style |
|----|------|------|-------|
| `ALEX_DIRECT` | Alex Mitev | Direct, no-fluff | 4-line punch email |
| `MARTIN_CONSULTANT` | Martin Georgiev | Consultative, data | Detailed audit report |
| `IVAN_CURIOUS` | Ivan Stoyanov | Question-hook | Peer curiosity opener |
| `DIMI_TECHNICAL` | Dimitar P. | Engineer-to-engineer | Raw curl data inline |
| `PETRA_CASUAL` | Petra (ex-Telerik) | Casual stranger | Cold apology opener |

### Rotation Logic

```
1. Never same persona twice in a row
2. Weighted by enrichment score — replies boost persona weight
3. Every 5th cycle: chaos injection (fully random override)
4. Subtle text mutations per email (double spaces, dash variants)
```

### Enrichment Learning

- `+1` score per email sent
- `+10` score when reply detected
- Persisted to: `data/persona-enrichment.json`

### API

```typescript
import { buildPersonalizedEmail, recordPersonaSuccess } from './psyche-persona-engine';

const email = buildPersonalizedEmail({
  domain: 'example.com',
  companyName: 'Example Corp',
  score: 45,
  grade: 'D',
  missingHeaders: ['strict-transport-security', 'x-frame-options'],
  ttfb: 320,
  sslDaysLeft: 180,
});

// email.subject, email.textBody, email.htmlBody, email.senderName, email.personaId

// When a reply is received:
recordPersonaSuccess(email.personaId);
```

---

## 4. Sovereign Market Platform

**Files:** `sovereign-market/index.ts`, `sovereign-market/veritras-campaign.ts`
**Status:** Standalone product — can be extracted and sold separately

### Components

#### StealthLayer — Anti-Bot Detection Bypass

```typescript
// Human-gaussian delay distribution (not uniform — passes rate-limit detectors)
await StealthLayer.humanDelay(minMs, maxMs);

// 12 rotating real browser User-Agent strings
const ua = StealthLayer.getUserAgent();

// Fingerprint randomization per session
const fp = StealthLayer.generateFingerprint();
// Returns: screenWidth, screenHeight, timezone, language, platform, sessionId, hardwareConcurrency

// Headers with random variation to avoid pattern matching
const headers = StealthLayer.getJitteredHeaders(baseHeaders);

// Block response detector (captcha, cloudflare, 429, 403, 503)
const blocked = StealthLayer.isBlockResponse(statusCode, body);

// Exponential backoff with jitter (max 2 min)
await StealthLayer.backoff(attempt, baseMs);
```

#### HumanSimulator — Behavioral Patterns

```typescript
const human = new HumanSimulator();

// Simulate reading (based on content length, ~200 wpm)
await human.simulateRead(contentLength);

// Simulate typing delay (~60 wpm with variance)
await human.simulateTyping(text);

// Check if agent should rest (sleep hours 2am-6am, or after 200 actions)
if (human.shouldRest()) { ... }

// Auto-rest if needed (10-60 min sleep simulation)
await human.restIfNeeded();

human.recordAction(); // Track action count
```

#### WorkerPool — Autonomous Thread Orchestration

```typescript
const pool = new WorkerPool(3, dryRun); // 3 concurrent workers

pool.enqueue({
  channel: 'email',           // 'email' | 'x' | 'linkedin' | 'webhook' | 'scan'
  payload: { domain: 'example.com', email: 'ceo@example.com' },
  priority: 10,               // Higher = runs first (priority queue, O(log n))
  scheduledAt: Date.now(),
  retries: 0,
  maxRetries: 3,              // Auto-retry with exponential backoff
});

await pool.drain();           // Blocks until all tasks complete

const stats = pool.getStats();
// Returns: { total, success, failed, byChannel }
```

### Running Sovereign Market

```powershell
# One-time run (all channels)
npx ts-node sovereign-market/veritras-campaign.ts

# Autonomous loop (every 6 hours, never stops)
npx ts-node sovereign-market/veritras-campaign.ts --loop

# Dry run (preview without sending)
npx ts-node sovereign-market/veritras-campaign.ts --dry-run

# Single channel
npx ts-node sovereign-market/veritras-campaign.ts --channel=email
npx ts-node sovereign-market/veritras-campaign.ts --channel=x
npx ts-node sovereign-market/veritras-campaign.ts --channel=linkedin
```

### Platform Timing (Bot-Safe Intervals)

| Channel | Min Delay | Max Delay | Daily Limit |
|---------|-----------|-----------|-------------|
| Email | 35s | 65s | 450 |
| X | 3 min | 10 min | 17 posts |
| LinkedIn | 1 hour | 2 hours | 5 posts |

---

## 5. Mister Mind Surgeon — Self-Healing Codebase

**File:** `scripts/mister-mind-surgeon.ts`
**Complexity:** O(n) error parse, O(k) fix strategies per file

### What It Does

Automatically scans the entire codebase with `tsc --noEmit`, parses all TypeScript errors, and applies deterministic fix strategies — without any external AI. Iterates until zero errors or no progress.

### Fix Strategies Implemented

| TS Code | Error Type | Fix Applied |
|---------|-----------|-------------|
| TS2307 | Cannot find module | Corrects import paths (voice-commander, worker-pool, etc.) |
| TS4114 | Override modifier missing | Adds `override` keyword to method |
| TS4023 | Re-export needs `export type` | Converts `export {` to `export type {` |
| TS2339 | Property does not exist | Adds type guard or optional chaining |
| TS2345 | Argument type mismatch | Adds type assertion or fixes generics |
| TS2322 | Type not assignable | Corrects Map generic types, unknown[] |
| TS2769 | No overload matches | Removes type annotations from callbacks |
| TS2532 | Object possibly undefined | Adds `?.` optional chaining |
| TS2305 | Module has no exported member | Removes missing import from destructure |
| TS2578 | Unused @ts-expect-error | Removes the directive |
| TS2724 | Did you mean...? | Applies suggested name from compiler |

### Usage

```powershell
# Auto-fix all TS errors in the codebase (up to 5 iterations)
npx ts-node scripts/mister-mind-surgeon.ts

# Dry run — show what would be fixed, no writes
npx ts-node scripts/mister-mind-surgeon.ts --dry-run

# Quiet mode (less output)
npx ts-node scripts/mister-mind-surgeon.ts --quiet

# Custom max iterations
npx ts-node scripts/mister-mind-surgeon.ts --max-retries 10
```

### Integration with Sovereign Market

Run the surgeon **before** starting any marketing cycle to ensure clean compilation:

```powershell
# Pre-flight check + campaign
npx ts-node scripts/mister-mind-surgeon.ts --quiet
npx ts-node sovereign-market/veritras-campaign.ts --loop
```

### Architecture

```
SCANNER (tsc exec) → PARSER (regex) → ANALYZER (strategy map) → SURGEON (patch) → VALIDATOR (re-scan)
         ↑_________________________________________________________|  (iterate until 0 errors)
```

---

## 6. MarketBlueprint — Evolution Engine (Micro-SaaS Revenue)

**File:** `salvaged-brutality-vortex/dpREPO/7/src/modules/GAMMA_INFRA/core/mouth/energy/MarketBlueprint.ts`
**Market Value tag:** +$185,000 (as documented in the file)
**Status:** Production-ready, white-label enabled

### What It Does

Converts any crawled website into **purchasable test packages** with dynamic pricing. Enterprise clients get auto-generated test suites for their site — one-click purchase. This is the core revenue engine for veritras.website.

### Package Categories Generated

| Category | Complexity Multiplier | Use Case |
|----------|-----------------------|----------|
| `smoke` | 0.8x | Basic health checks |
| `regression` | 1.0x | Forms + interactions |
| `e2e` | 1.5x | Full user journeys |
| `api` | 1.2x | REST/GraphQL endpoints |
| `performance` | 2.0x | Load time + stress |
| `security` | 2.5x | Headers + injection |
| `accessibility` | 1.3x | WCAG compliance |
| `chaos` | 3.0x | Failure injection |
| `compliance` | 2.8x | GDPR, SOC2, etc. |

### Pricing Model

```
Base price per test: $49.99
Dynamic price = basePricePerTest × complexityMultiplier × categoryMultiplier

Example: Security test (complex) = $49.99 × 3.2 × 2.5 = $399.92 per test
Bundle of 5+ packages: up to 30% discount
Reseller margin: 10–40% (white-label ready)
```

### API

```typescript
import { MarketBlueprint } from './MarketBlueprint';

const blueprint = new MarketBlueprint({
  basePricePerTest: 49.99,
  codeGenerationEnabled: true,
  defaultResellerMargin: 20,
});

// Generate purchasable packages from crawl data
const result = await blueprint.generateBlueprints(source, crawlData);
// result.packages   → MarketablePackage[]
// result.bundles    → PackageBundle[]
// result.totalValue → total EUR value generated
// result.recommendations → what to upsell

// Process purchase order
const order = await blueprint.processPurchase(orderId, paymentRef);
```

### Integration with Sovereign Market

The SCAN worker in `WorkerPool` feeds crawl data directly into `MarketBlueprint.generateBlueprints()`. Each B2B target that responds gets an auto-generated quote.

---

## 7. QAntum Master Control — Script Orchestrator

**File:** `scripts/qantum-master.ts`
**Purpose:** Central hub for running all QAntum automation scripts

### Commands

```powershell
# List all registered scripts with status
npx tsx scripts/qantum-master.ts list

# Full project analysis (Eagle + Surgeon + Metrics + Dep Doctor)
npx tsx scripts/qantum-master.ts analyze

# Auto-fix TS errors + safe dependency updates
npx tsx scripts/qantum-master.ts fix

# Prepare release (type check + audit + benchmarks + dry-run)
npx tsx scripts/qantum-master.ts release patch
npx tsx scripts/qantum-master.ts release minor
npx tsx scripts/qantum-master.ts release major

# First-time project setup (hooks + ENV + CI/CD pipelines)
npx tsx scripts/qantum-master.ts setup

# Run specific script
npx tsx scripts/qantum-master.ts run surgeon fix
npx tsx scripts/qantum-master.ts run benchmark all
npx tsx scripts/qantum-master.ts run dep check
```

### Registered Scripts

| Script | Category | Key Commands |
|--------|----------|--------------|
| `eagle-orchestrator.ts` | analysis | scan, analyze, organize |
| `qantum-surgeon.ts` | quality | diagnose, fix, report |
| `qantum-control-panel.ts` | utility | start, menu |
| `qantum-release.ts` | release | major, minor, patch |
| `qantum-ci-cd.ts` | devops | generate, github, azure, gitlab |
| `qantum-dep-doctor.ts` | security | check, outdated, audit, licenses |
| `qantum-benchmark.ts` | analysis | all, build, test, report |
| `qantum-git-hooks.ts` | devops | install, uninstall, list |
| `qantum-env-validator.ts` | security | validate, encrypt, decrypt, diff |
| `qantum-code-metrics.ts` | analysis | analyze, report, json |
| `qantum-backup.ts` | utility | create, restore, list |
| `mister-mind-surgeon.ts` | quality | (standalone — see Section 5) |

### Pre-Launch Checklist via Master

```powershell
# Run this before any major release:
npx tsx scripts/qantum-master.ts analyze    # 1. Full audit
npx tsx scripts/qantum-master.ts fix        # 2. Auto-fix
npx tsx scripts/qantum-master.ts release patch  # 3. Prepare release
```

---

## 8. CI/CD Generator — Multi-Platform Pipelines

**File:** `scripts/_ARCHITECT_FORGE_/qantum-ci-cd.ts`
**Generates:** GitHub Actions, Azure DevOps, GitLab CI

### Usage

```powershell
# Generate all 3 CI/CD configs at once
npx tsx scripts/_ARCHITECT_FORGE_/qantum-ci-cd.ts

# Or via Master Control:
npx tsx scripts/qantum-master.ts setup  # includes CI/CD generation
```

### Generated Files

| File | Platform | Pipeline Stages |
|------|----------|-----------------|
| `.github/workflows/ci.yml` | GitHub Actions | lint → test → build → security → release |
| `.github/workflows/release.yml` | GitHub Actions | NPM publish + Docker build |
| `azure-pipelines.yml` | Azure DevOps | Build + Security + Deploy |
| `.gitlab-ci.yml` | GitLab CI | lint → test → build → security → deploy |

### GitHub Actions Pipeline (ci.yml)

```
Push to main/develop → triggers:
  lint      → ESLint + tsc --noEmit
  test      → vitest --coverage + codecov upload
  build     → tsc + artifact upload
  security  → npm audit + secret detection
  release   → npm publish (only on main push)
```

### Adding Veritras.website Deploy Step

After generating, add this to `.github/workflows/ci.yml` under the `release` job:

```yaml
      - name: Deploy to Veritras
        run: |
          curl -X POST ${{ secrets.DEPLOY_WEBHOOK }} \
            -H "Content-Type: application/json" \
            -d '{"ref": "${{ github.sha }}"}'
```

---

## 9. Intelligence Layer

### `system/reinforcement-learning-bridge.ts`

- **Algorithm:** Q-Learning + Thompson Sampling + UCB1 (Bellman equation)
- **Purpose:** Learns which CSS selectors succeed for each page state
- **Persistence:** `knowledge/q-learning.json`

```typescript
import { rlBridge } from './system/reinforcement-learning-bridge';

const { selector, strategy, confidence } = rlBridge.selectBestSelector(element, context);

rlBridge.updateFromOutcome(element, selector, context, {
  success: true,
  responseTimeMs: 124,
  usedFallback: false,
  consecutiveSuccesses: 3,
  survivedUpdate: true,
});
```

---

### `system/semantic-core.ts` — Adaptive Semantic Core

- **Purpose:** Converts raw DOM into semantic intent map
- **Languages:** BG / EN / DE / FR / ES synonyms built-in
- **Fallback:** Visual coordinate-based extraction

```typescript
const asc = new AdaptiveSemanticCore({ enableLearning: true, verbose: true });
const map = await asc.createSemanticMap(page);
const match = await asc.matchIntent(page, {
  action: 'LOGIN_ACTION',
  keywords: ['login', 'sign in', 'влез'],
  expectedType: 'button',
});
```

---

### `system/VSCodeBridge.ts`

- **Purpose:** Real-time workspace file watcher
- **Events:** `file:changed`, `file:verified`, `activeFile:changed`

```typescript
const bridge = getVSCodeBridge({ workspaceRoot: process.cwd(), autoVerify: true });
bridge.on('file:changed', (event) => console.log(event.filePath, event.type));
await bridge.start();
```

---

## 7. Marketing Agents

### X (Twitter) — `scripts/x-marketing-cycle.ts`

Interval: every 4 hours. Posts QAntum + Veritras content.

Required env:

```
X_API_KEY=
X_API_SECRET=
X_ACCESS_TOKEN=
X_ACCESS_SECRET=
```

---

### LinkedIn — `scripts/linkedin-marketing-cycle.ts`

Interval: every 24 hours. 6 rotating post templates, emojis removed (human tone).

Required env:

```
LINKEDIN_ACCESS_TOKEN=
LINKEDIN_PERSON_URN=urn:li:person:YOUR_ID
```

To get your Person URN:

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" https://api.linkedin.com/v2/me
# Copy the "id" field
```

---

## 8. Environment Variables (.env)

Create `.env` in project root (`C:\Users\papic\Desktop\ALL-POSITIONS\Blockchain\QAntum-1\.env`):

```env
# Gmail (B2B Outreach)
GMAIL_EMAIL=your@gmail.com
GMAIL_FROM_EMAIL=dp@qantum.site
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx

# X (Twitter)
X_API_KEY=
X_API_SECRET=
X_ACCESS_TOKEN=
X_ACCESS_SECRET=

# LinkedIn
LINKEDIN_ACCESS_TOKEN=
LINKEDIN_PERSON_URN=urn:li:person:XXXXX

# QA Dashboard
PORT=8890
NODE_ENV=production
```

> Gmail App Password: Google Account > Security > 2-Step Verification > App Passwords

---

## 9. How to Start Everything

### Full System Boot

```powershell
$root = "C:\Users\papic\Desktop\ALL-POSITIONS\Blockchain\QAntum-1"

# 0. Self-healing pre-flight (fix TS errors before launch)
Start-Process powershell -ArgumentList "-NoExit -Command cd '$root'; npx ts-node scripts/mister-mind-surgeon.ts --quiet"

# 1. QA Dashboard (port 8890)
Start-Process powershell -ArgumentList "-NoExit -Command cd '$root'; npx ts-node ai/server.ts"

# 2. X Marketing (every 4h)
Start-Process powershell -ArgumentList "-NoExit -Command cd '$root'; npx ts-node scripts/x-marketing-cycle.ts"

# 3. X Follow Agent
Start-Process powershell -ArgumentList "-NoExit -Command cd '$root'; npx ts-node scripts/x-follow-agent.ts"

# 4. B2B Outreach (every 6h via PSYCHE)
Start-Process powershell -ArgumentList "-NoExit -Command cd '$root'; npx ts-node scripts/b2b-outreach-cycle.ts"

# 5. LinkedIn (daily)
Start-Process powershell -ArgumentList "-NoExit -Command cd '$root'; npx ts-node scripts/linkedin-marketing-cycle.ts"

# 6. Sovereign Market — all channels, autonomous loop
Start-Process powershell -ArgumentList "-NoExit -Command cd '$root'; npx ts-node sovereign-market/veritras-campaign.ts --loop"
```

### Quick Test (Dry Run Everything)

```powershell
npx ts-node scripts/auto-outreach.ts --dry-run
npx ts-node sovereign-market/veritras-campaign.ts --dry-run
npx ts-node scripts/mister-mind-surgeon.ts --dry-run
```

---

## 11. Data Files and Persistence

| File | Created By | Purpose |
|------|-----------|---------|
| `data/outreach-log.json` | auto-outreach.ts | Sent emails + persona used |
| `data/persona-enrichment.json` | psyche-persona-engine.ts | Persona learning scores |
| `data/sovereign-market-log.json` | sovereign-market/index.ts | All campaign task results |
| `data/b2b-cycle-log.json` | b2b-outreach-cycle.ts | Cycle timestamps |
| `data/phone-alerts/alerts.json` | auto-outreach.ts | Mobile notification log |
| `knowledge/q-learning.json` | reinforcement-learning-bridge.ts | ML selector Q-table |

---

## 12. Architecture Diagram

```
╔══════════════════════════════════════════════════════════════════════════╗
║                    QANTUM EMPIRE — veritras.website                     ║
╚══════════════════════════════════════════════════════════════════════════╝
                               │
         ┌─────────────────────┼──────────────────────┐
         │                     │                      │
   ┌─────▼──────┐      ┌───────▼───────┐      ┌──────▼──────┐
   │  QA ENGINE │      │  SOVEREIGN    │      │ SELF-HEALING │
   │  port 8890 │      │  MARKET       │      │  SURGEON     │
   │  Playwright│      │  StealthLayer │      │  tsc + patch │
   └─────┬──────┘      │  WorkerPool   │      └─────────────┘
         │             │  PSYCHE x5    │
   ┌─────▼──────┐      └───────┬───────┘
   │ Semantic   │              │
   │ Core ASC   │     ┌────────┼────────┐
   │ RL Bridge  │     │        │        │
   └────────────┘  Email      X    LinkedIn
                 PSYCHE  Marketing   Daily
                Personas  (4h)      Post
```

---

## Quick Reference — File Map

| Purpose | File |
|---------|------|
| Dashboard UI | `ai/public/index.html` |
| Dashboard Server | `ai/server.ts` |
| Sovereign Market | `sovereign-market/index.ts` |
| Veritras Campaign | `sovereign-market/veritras-campaign.ts` |
| Persona Engine | `scripts/psyche-persona-engine.ts` |
| B2B Email Engine | `scripts/auto-outreach.ts` |
| B2B Loop | `scripts/b2b-outreach-cycle.ts` |
| X Marketing | `scripts/x-marketing-cycle.ts` |
| X Follow | `scripts/x-follow-agent.ts` |
| LinkedIn | `scripts/linkedin-marketing-cycle.ts` |
| Self-Healing Code | `scripts/mister-mind-surgeon.ts` |
| **Market Revenue Engine** | `salvaged-brutality-vortex/.../MarketBlueprint.ts` |
| **Master Orchestrator** | `scripts/qantum-master.ts` |
| **CI/CD Generator** | `scripts/_ARCHITECT_FORGE_/qantum-ci-cd.ts` |
| RL Selectors | `system/reinforcement-learning-bridge.ts` |
| Semantic Intent | `system/semantic-core.ts` |
| File Watcher | `system/VSCodeBridge.ts` |

---

*For issues: <dp@qantum.site> | veritras.website*
