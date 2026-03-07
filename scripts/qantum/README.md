<div align="center">

```
██████╗  █████╗ ███╗   ██╗████████╗██╗   ██╗███╗   ███╗
██╔═══██╗██╔══██╗████╗  ██║╚══██╔══╝██║   ██║████╗ ████║
██║   ██║███████║██╔██╗ ██║   ██║   ██║   ██║██╔████╔██║
██║▄▄ ██║██╔══██║██║╚██╗██║   ██║   ██║   ██║██║╚██╔╝██║
╚██████╔╝██║  ██║██║ ╚████║   ██║   ╚██████╔╝██║ ╚═╝ ██║
 ╚══▀▀═╝ ╚═╝  ╚═╝╚═╝  ╚═══╝   ╚═╝    ╚═════╝ ╚═╝     ╚═╝
```

**FRAMEWORK v1.0**

*Your tests fix themselves. Your sales run themselves. Your revenue grows itself.*

[![npm version](https://img.shields.io/npm/v/qantum-framework?color=00ff41&style=flat-square)](https://www.npmjs.com/package/qantum-framework)
[![License: MIT](https://img.shields.io/badge/License-MIT-00ff41.svg?style=flat-square)](LICENSE)
[![GitHub Stars](https://img.shields.io/github/stars/QAntum-Fortres/Framework?color=00ff41&style=flat-square)](https://github.com/QAntum-Fortres/Framework/stargazers)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-00ff41?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)

</div>

---

## What is QAntum?

QAntum is a **free, open-source TypeScript framework** that fuses:

- 🤖 **AI Self-Healing Tests** — tests that rewrite themselves when your UI changes
- 🔍 **Autonomous Bug Scanner** — scans websites, generates ROI reports, closes deals
- ⚔️ **Cognitive Crypto Arbitrage** — BTC/ETH/BNB with Monte Carlo price oracle
- 💳 **Full SaaS Stack** — subscription engine, feature flags, A/B testing, churn detection

All from a **single function call:**

```typescript
import { QAntumSingularity } from 'qantum-framework';

const singularity = new QAntumSingularity({
  mode: 'aggressive',
  targetIndustries: ['saas', 'ecommerce', 'fintech'],
  maxDailyOutreach: 50,
  autoSendPitches: true,
  enableMarketReaper: true,
  tradingMode: 'paper',           // start safe
  tradingCapitalUSD: 10_000
});

await singularity.runGodLoop();
// That's it.
// It finds clients, writes reports, sends emails, creates accounts
// and runs crypto arbitrage. All by itself.
```

---

## Install

```bash
npm install qantum-framework
# or
npx create-qantum-app my-project
```

**Requirements:** Node.js ≥ 18. No Docker. No microservices. No bloat.

---

## Features

### 🧪 AI Self-Healing Tests

Stop maintaining flaky tests. QAntum detects when your HTML changes and **rewrites the selector automatically:**

```typescript
import { SelfHealingEngine } from 'qantum-framework/healing';

const engine = new SelfHealingEngine({ confidence: 0.85 });

// Test breaks because your button's class changed?
// QAntum finds the new selector, re-runs the test, confirms it passes.
// You get a PR. You never see the failure.
await engine.runSuite('./tests/**/*.spec.ts');
```

**10 self-healing tests/month free.** No credit card.

---

### 🧬 Evolution Chamber & Scenario Runner (v2.0 Beta)

The new **Scenario Runner** orchestrates complex agent behavior with:
- **OODA Loop Integration**: Observe-Orient-Decide-Act for autonomous problem solving.
- **Deterministic DOM Fallback**: Handles "Search/Click/Navigate" without LLM when offline.
- **Detailed JSON Reporting**: Fully introspects the agent's "thoughts" and actions.

[**👉 Read the Full Documentation**](./SCENARIOS_README.md)

---

### 📧 Autonomous Sales Engine

QAntum scans target sites for bugs, generates professional PDF reports with ROI impact, and sends personalized cold emails — fully without humans:

```typescript
import { AutonomousSalesForce } from 'qantum-framework/sales';

const sales = new AutonomousSalesForce({
  targetIndustries: ['saas', 'fintech'],
  dailyEmailLimit: 20,
  pitchIterations: 5,           // self-critique loop until score ≥ 90/100
  shadowProvision: true,        // create free account for prospect preemptively
});

await sales.startCampaign();
// Finds broken sites → generates bug report → writes pitch → sends email
// Prospect gets: "I found 14 bugs on your site. Here's your live dashboard → [link]"
```

The **Shadow Provisioning** trick: prospects get a pre-created account with their bugs already loaded. Zero friction. They're inside your product before reading the email.

---

### ⚔️ Market Reaper — Cognitive Arbitrage

```typescript
import { ArmedReaper } from 'qantum-framework/reality';

const reaper = new ArmedReaper({
  mode: 'paper',                // paper | live
  capital: 10_000,
  symbols: ['BTCUSDT', 'ETHUSDT', 'BNBUSDT'],
});

// Monte Carlo price oracle: 3000 simulations in <1ms
// Biometric jitter: API calls timed like a human (HR + fatigue model)
// Only executes when cognitive score ≥ 0.75:
// score = 0.40×oracle + 0.35×profit + 0.25×riskScore × fatigueMultiplier

await reaper.start();
```

**Paper mode is free forever.** Live trading requires Pro plan.

---

### 💳 SaaS Engine — Built In

```typescript
import { getSaaS } from 'qantum-framework/saas';

const saas = getSaaS();

// Check if user can run more tests
const check = saas.canPerformAction(subscriptionId, 'testsPerMonth');
if (!check.allowed) {
  // Trigger upgrade email automatically
}

// Churn detection
const churnRisk = saas.subscriptions.calculateChurnRisk(subscriptionId); // 0-100
const upsellReady = saas.subscriptions.calculateUpsellReadiness(subscriptionId); // 0-100

// Feature flags with A/B testing
const isNewPricingEnabled = saas.isFeatureEnabled('new_pricing_v2', userId);
```

Telemetry, feature flags, and subscription engine are **all included** in the open-source core.

---

## Architecture

```
qantum-framework/
├── cognition/          # Thought chains, self-critique, multi-perspective AI
├── healing/            # Self-Healing Test Engine
├── sales/              # AutonomousSalesForce, GrowthHacker, SelfHealingSales
├── saas/               # Subscription + Feature Flags + Telemetry
│   ├── subscription.ts # Free/Starter/Pro/Enterprise plans
│   ├── feature-flags.ts# A/B testing, % rollouts, VIP overrides
│   └── telemetry.ts    # Churn detection, upsell scoring
├── reality/
│   └── economy/        # ArmedReaper, MarketWatcher, Monte Carlo Oracle
└── PRIVATE-CORE/       # 🔒 Enterprise (Singularity, Live Trading, CF Bypass)
```

**Zero external dependencies** in the core. Pure Node.js `https`, hand-rolled HMAC-SHA256. No Axios. No Lodash.

---

## Plans

| Plan | Price | Tests/mo | Emails/day | Singularity | Trading |
|------|-------|----------|------------|-------------|---------|
| **Free** | $0 | 10 | — | — | — |
| **Starter** | $49/mo | 100 | 20 | — | — |
| **Pro** ⭐ | $149/mo | ∞ | 200 | 50 targets/day | Paper |
| **Enterprise** | $499/mo | ∞ | ∞ | Unlimited | **Live** |

```bash
# See plans interactively:
npx qantum upgrade
```

Annual billing saves **~20%**. See [qantum.empire/pricing](https://qantum.empire/pricing).

---

## Quick Start

```bash
# Install globally
npm install -g qantum-framework

# Interactive REPL
qantum

# Check system status
qantum status

# Run full autonomous loop (dry-run, safe)
qantum singularity --mode stealth --dry-run

# Start live trading dashboard (paper mode)
qantum reaper --mode paper --port 3333

# Upgrade plan
qantum upgrade
```

---

## Rust Core Performance

The trading engine uses a compiled **Rust NAPI module** for sub-100ns latency:

| Operation | Performance |
|-----------|-------------|
| `executeBatch(ticks)` | ~100-130 ns/tick |
| `priceOraclePredict()` | 3000 sims in <1ms |
| `computeRisk()` | O(n) VaR, Sharpe, Sortino |
| `batchArb()` | 128-bit precision arbitrage |
| Ring Buffer throughput | 128-slot SPSC, lock-free |

---

## CLI Commands

```bash
qantum                          # Interactive REPL
qantum "refactor auth module"   # Natural language command
qantum mode set engineer        # Switch AI response mode
qantum genesis UserService      # Generate new entity (class/test/interface)
qantum empire audit             # Sovereign architecture audit
qantum upgrade                  # Upgrade to Pro/Enterprise
```

Supports **English and Bulgarian** natural language commands.

---

## Sponsor

QAntum is MIT licensed and maintained by one developer. If this saves you time or makes you money:

**[❤️ Sponsor on GitHub](https://github.com/sponsors/qantum-empire)** | **[💳 One-time via Stripe](https://qantum.empire/sponsor)**

| Tier | Amount | Perks |
|------|--------|-------|
| ☕ Coffee | $5/mo | Name in SPONSORS.md |
| 🚀 Supporter | $25/mo | Name + README badge |
| ⚡ Pro Backer | $100/mo | Free Pro plan |
| 👑 Enterprise | $500/mo | Logo + white-label license + Slack |

See [SPONSORS.md](SPONSORS.md) for full details.

---

## License

**MIT** — free forever for personal and commercial use.

The Enterprise layer in `PRIVATE-CORE/` (live trading, QAntumSingularity, Cloudflare Bypass Engine) requires a commercial license. See [qantum.empire/pricing](https://qantum.empire/pricing).

---

## Contributing

PRs welcome. Issues welcome. Stars **very** welcome.

```bash
git clone https://github.com/QAntum-Fortres/Framework.git
cd Framework
npm install
npm run dev
```

---

<div align="center">

*Built with blood, coffee, and the certainty that manual testing is dead.*

**[Website](https://qantum.empire)** · **[Docs](https://qantum.empire/docs)** · **[Discord](https://qantum.empire/discord)** · **[founder@qantum.empire](mailto:founder@qantum.empire)**

</div>
