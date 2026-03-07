# 📢 Aeterna v1.0 — Viral Launch Posts

Copy-paste ready posts for Reddit, HackerNews, and Dev.to.

---

## 🔴 Reddit — r/programming

**Title:**
`I built an open-source framework that writes tests, self-heals them when your UI changes, scans websites for bugs, writes the sales emails, creates client accounts, AND does crypto arbitrage — all from a single function call`

**Post body:**
```
I've been building this in public for ~8 months and finally pushed v1.0 to GitHub.

Aeterna is a Node.js/TypeScript framework with zero mandatory external dependencies. Here's what one call does:

    await singularity.runGodLoop();

1. The Growth Hacker module scans your target industries (SaaS, ecommerce, fintech) using Puppeteer + smart selectors
2. It deep-scans every site it finds — finds broken links, slow endpoints, JS errors, CLS issues, accessibility violations
3. Self-Healing Sales converts raw bugs into business impact reports with ROI projections
4. Thought Chain + Self-Critique refines a personalized sales pitch (runs 5 critique iterations until it scores 90+/100)
5. It creates a free "shadow" account for the prospect and sends them a magic activation link embedded in the email
6. Market Reaper runs cognitive arbitrage on BTC/ETH/BNB in parallel using a Monte Carlo price oracle + HMAC-SHA256 signed Binance API calls. Biometric jitter makes it look human.
7. When someone upgrades from Free → Pro, feature-flags.ts automatically unlocks their features

The entire SaaS stack (subscription engine, feature flags with A/B testing, telemetry/churn detection) is included.

I built this to learn if you could automate the entire B2B sales funnel without humans in the loop. Turns out: mostly yes.

GitHub: [link]

AMA. The architecture is wild and I'm happy to explain any part of it.

---
EDIT: Yes the trading engine is real. No I'm not responsible for your losses. Use paper mode first (`tradingMode: 'paper'`).
```

---

## 🟠 HackerNews — Ask HN / Show HN

**Title:**
`Show HN: Aeterna – autonomous B2B sales + self-healing tests + crypto arbitrage in one TypeScript framework`

**Post body:**
```
Hi HN,

I'm releasing Aeterna v1.0 — an open-source TypeScript framework that fuses:

1. AI Test Self-Healing: Tests that rewrite themselves when your HTML structure changes. No more flaky e2e tests from UI updates.

2. Autonomous Sales Engine: Crawls websites, generates professional bug/performance reports with ROI estimates, writes bespoke pitches using LLM chains with self-critique loops.

3. Cognitive Crypto Arbitrage: Binance-connected arbitrage engine with a Monte Carlo price oracle. Uses "biometric jitter" (random timing variance derived from HR/fatigue models) to avoid API detection.

4. SaaS Infrastructure: Subscription engine, feature flags (with A/B test support and % rollouts), and a telemetry engine that detects churn risk and upsell candidates automatically.

The whole thing runs as `await singularity.runGodLoop()`. No microservices, no Docker required — just Node.js.

Architecture highlights:
- Pure Node.js `https` module for all HTTP (no Axios)
- HMAC-SHA256 signing hand-rolled
- Thought Chain: breaks problems into steps → generates solutions → self-critiques → refines until score ≥ 90/100
- Feature flags use deterministic SHA-256 hashing for consistent A/B bucket assignment per user

The core is MIT licensed. Enterprise features (Singularity, live trading, Cloudflare bypass) are in the paid tier.

GitHub: [link]
Docs: [link]

Happy to answer questions about the architecture, especially the cognitive arbitrage + biometric stealth layer — it's the most interesting part technically.
```

---

## 💙 Dev.to

**Title:**
`I built a Node.js framework that self-heals tests, runs autonomous sales, and trades crypto — here's the architecture`

**Tags:** `typescript`, `node`, `opensource`, `ai`

**Intro paragraph:**
```
Eight months ago I asked: "What if a software framework could replace an entire B2B sales team AND a QA team AND a quant trader?" 

The answer is Aeterna v1.0 — and the architecture is genuinely weird.

Let me walk you through how it works.
```

*(Continue with architecture walkthrough, code samples, and a mention of the GitHub Sponsors link)*

---

## 🐦 Twitter/X Thread

```
Tweet 1:
I just shipped Aeterna v1.0 — a TypeScript framework where one function call runs:

→ 🤖 AI Test Self-Healing
→ 📧 Autonomous B2B Sales  
→ ⚔️ Crypto Arbitrage
→ 💳 Full SaaS billing stack

await singularity.runGodLoop();

Thread 🧵👇

---

Tweet 2:
The Self-Healing Tests part:

When your UI changes and a test breaks, Aeterna doesn't just report the failure.

It rewrites the selector, re-runs the test, confirms it passes, and submits a PR — all without you touching anything.

---

Tweet 3:
The Autonomous Sales part:

1. Growth Hacker finds target sites in your industry
2. Scans them for bugs (broken links, slow API, accessibility)  
3. Generates a PDF report with ROI projections
4. Writes a personalized cold email with a Self-Critique loop until it scores 90+/100
5. Creates a free account for the prospect and sends the magic link

---

Tweet 4:
The "Shadow Provisioning" trick is my favourite part:

Instead of asking prospects to sign up, Singularity creates their free account preemptively.

The email says: "I found 14 bugs on your site. Here's a live dashboard → [magic link]"

No friction. They're already inside your product.

---

Tweet 5:
The Cognitive Arbitrage is the wildest part.

It uses a Monte Carlo price oracle + biometric timing jitter (simulated from HR/fatigue models) to make API calls look human.

Only executes a trade if cognitive score ≥ 0.75:
score = 0.40×oracle + 0.35×profit + 0.25×riskScore × fatigueMultiplier

---

Tweet 6:
The entire SaaS stack is included:

• subscription.ts — Free/Starter/Pro/Enterprise plans with usage limits
• feature-flags.ts — A/B test pricing on % of users, VIP overrides, kill switches  
• telemetry.ts — churn detection + upsell readiness scoring

The Singularity uses all of this autonomously.

---

Tweet 7:
GitHub: [link]
npm: npm install aeterna-framework

Core is MIT. Enterprise layer (live trading, Singularity, Cloudflare bypass) is paid.

If this helped you, a ⭐ means a lot.

Sponsorship: [link]
```

---

*Last updated: 2026-02-23*
