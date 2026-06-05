# AETERNA — EIC Step 2 Pitch Script
## 10-Minute Presentation Guide
### Proposal №101327948 | Dimitar Prodromov

---

> **FORMAT:** 10 minutes pitch (strictly enforced) + 35 minutes Q&A
> **RULE:** You MUST use the exact PDF deck submitted in Step 1. No new slides.
> **STRATEGY:** Don't read slides. Tell the STORY behind them.

---

## ⏱️ MINUTE 0:00 – 0:30 | OPENING HOOK

**[Stand. Make eye contact. Pause.]**

> "In the last 12 months, European SMEs spent an average of €2,000 per month on SaaS tools — across 23 different vendors. That's €24,000 a year just to keep the lights on digitally.
>
> When one of those tools fails, they open a support ticket. Then they wait.
>
> What if the platform could heal itself — in under 30 seconds — without anyone lifting a finger?
>
> My name is Dimitar Prodromov. I built AETERNA. And it already does this."

---

## ⏱️ MINUTE 0:30 – 2:00 | THE PROBLEM (Slide: Problem)

> "Let me give you a concrete example. A 50-person logistics company in Hamburg uses Salesforce for CRM, HubSpot for marketing, Zapier for automation, CrowdStrike for security, and Tableau for analytics. Five vendors. Five contracts. Five security surfaces. Five points of failure.
>
> When their Zapier-to-Salesforce bridge broke last March, it took **4 days** to fix. Four days of lost leads. Four days of manual data entry. Estimated cost: €12,000.
>
> This is not a technology problem. It's an **architecture** problem. The tools were never designed to work together. They were designed to sell separately.
>
> We interviewed 47 enterprises across 5 EU countries. 73% cannot correlate data across their tools. 100% require human intervention when something breaks. This is the SaaS Fragmentation Tax."

---

## ⏱️ MINUTE 2:00 – 4:30 | THE SOLUTION (Slides: Solution + Architecture)

> "AETERNA eliminates this tax entirely. One platform. One subscription. Self-healing.
>
> But here's what makes us fundamentally different from every other 'all-in-one' platform that has been tried before:
>
> **We don't just run in the cloud. We compile into a standalone binary.**
>
> [Point to architecture slide]
>
> There are three layers. At the bottom: a 32-byte cryptographic anchor, written to the physical disk. This is the Veritas Anchor — the ground truth of the system. Every time the platform evolves its own business rules, it validates against this anchor. If the state diverges — even by one bit — self-healing triggers automatically.
>
> In the middle: a Rust execution engine. 764 lines. Zero floating-point arithmetic in the financial layer — everything is in atomic integer cents. No rounding errors. No reconciliation drift. Ever.
>
> At the top: a TypeScript evolution layer that tracks 16 phases of the platform's development. 11 are complete. The system knows its own fitness: 0.6667. It evolves toward 1.0 autonomously.
>
> This is not a theoretical framework. The executable exists. It's 30 megabytes. I can run it on this laptop right now, with no internet connection, and it will process transactions with the same determinism as the cloud version.
>
> **No other SaaS platform on Earth can do this.**"

---

## ⏱️ MINUTE 4:30 – 6:00 | MARKET & TRACTION (Slides: Market + Traction)

> "Our total addressable market is the €50 billion global enterprise SaaS consolidation trend. But we're starting precise:
>
> **Serviceable addressable market: €156 million per year.** That's EU SMEs with 50 to 250 employees who currently spend over €1,500 per month on fragmented SaaS.
>
> Our entry price is €499 per month for the full platform. That's a 77% cost reduction compared to equivalent multi-vendor stacks.
>
> Unit economics: Customer Acquisition Cost is €180. Lifetime Value is €4,312. That's a 24x LTV-to-CAC ratio.
>
> We're launching on aeterna.website with 6 SaaS applications already built:
> - Wealth Scanner — financial intelligence
> - Sector Security — cybersecurity
> - Network Optimizer — infrastructure
> - Valuation Gate — AI asset valuation
> - Automation Nexus — process automation
> - Intelligence Core — multi-modal AI
>
> All six share a single authentication layer, a single data model, and a single self-healing engine."

---

## ⏱️ MINUTE 6:00 – 7:30 | BUSINESS MODEL & FINANCIALS (Slide: Revenue)

> "Revenue model is pure SaaS subscription. Four tiers, from €29 for individual users to €4,999 for lifetime enterprise access.
>
> Year 1: 120 customers, €172,000 ARR. We break even in month 22.
>
> Year 3: 1,800 customers, €8.2 million ARR. Gross margin of 87%.
>
> Year 5: 8,500 customers, €48.7 million ARR at 91% gross margin.
>
> The key lever is gross margin. Because AETERNA is a single platform — not 23 separate services — our infrastructure cost is €0.16 per user per day. That's 85% less compute than the equivalent multi-vendor stack.
>
> This isn't just a business advantage. It's a **Green Deal** advantage. One platform means dramatically less energy consumption per customer."

---

## ⏱️ MINUTE 7:30 – 8:30 | USE OF FUNDS & TEAM (Slide: Team + Funding)

> "We're requesting the standard EIC blended finance: grant component for R&D, equity component for scale.
>
> 48% goes to engineering — specifically, expanding the Rust and Mojo layers of the sovereign engine.
>
> 18% to market validation — a 5-country EU pilot starting with Germany, France, and the Netherlands.
>
> 15% to team expansion — 5 engineers and 2 sales professionals over 18 months.
>
> Currently, I am the sole architect. I built every layer: the Rust backend, the TypeScript middleware, the React frontend, the cryptographic verification system, and the compiled binary.
>
> This is both the biggest risk and the biggest advantage. Risk: key-person dependency. Advantage: every architectural decision is coherent. There is no technical debt from 10 different developers pulling in 10 different directions.
>
> The first priority post-funding is hiring a senior Rust engineer and a DevOps lead within 90 days."

---

## ⏱️ MINUTE 8:30 – 9:30 | WHY THIS MATTERS FOR EUROPE (Slide: Impact)

> "Let me be direct about why AETERNA matters for Europe specifically.
>
> Right now, 90% of the SaaS tools European companies use are American. Salesforce, HubSpot, Slack, Notion — all US-owned. European data flows through American infrastructure, governed by American law.
>
> AETERNA is EU-native. It runs on EU hardware. The standalone binary means data **never has to leave the customer's jurisdiction**. This isn't digital sovereignty as a slogan — it's digital sovereignty as a compiled executable.
>
> We align with:
> - **AI Act** — our logic is deterministic and auditable, not a black-box neural network
> - **Green Deal** — 85% less infrastructure per customer
> - **SME Competitiveness** — 77% cost reduction for the very companies the EU is trying to protect
>
> By year 3, we project 1,800 EU companies served and 45 jobs created."

---

## ⏱️ MINUTE 9:30 – 10:00 | CLOSE

> "To summarize:
>
> **The problem** is that European companies are paying a massive hidden tax to keep 23 American SaaS tools barely working together.
>
> **AETERNA** replaces all of them with a single, self-healing platform that compiles into a 30-megabyte binary.
>
> **The evidence** is not in this slideshow. It's in the SHA-256 hash of the anchor on my disk. It's in the zero floating-point violations in the financial engine. It's in the compiled executable sitting in my laptop right now.
>
> We're asking the EIC to help us take this from my laptop to 1,800 European companies in 3 years.
>
> Thank you."

**[Pause. Do not rush to Q&A. Let the silence work.]**

---

## 🎯 KEY PRINCIPLES FOR Q&A

1. **Keep answers under 60 seconds.** The jury wants to cover more ground.
2. **Quantify everything.** "73% of enterprises" is better than "many companies."
3. **Acknowledge risk honestly.** "Yes, key-person dependency is our #1 risk. Here's the plan."
4. **Redirect weak areas to strengths.** Any question about team size → "That's exactly why we need EIC funding."
5. **Never say "I don't know."** Say: "That's an excellent question. Based on our data, [partial answer]. I'd be happy to provide detailed analysis post-interview."

---

## 🔴 RED FLAG ANSWERS TO AVOID

| Question Trigger | BAD Answer | GOOD Answer |
|-----------------|-----------|-------------|
| "What about competition?" | "We have no competition" | "No competitor combines self-healing + zero-float + standalone binary. The closest is ServiceNow, but their entry point is €100K+." |
| "Are these real revenue numbers?" | "We project €462K/month" | "These are validated potential numbers. Actual current revenue is [state honestly]. Our financial model is conservative at [X]% conversion rate." |
| "Why should we fund a solo founder?" | "I can do everything" | "I built the entire stack solo, which proves extreme execution speed. But I recognize key-person risk is #1 priority — first two hires within 90 days." |
| "Is the technology real?" | "It's the most advanced..." | "veritas_lock.bin exists on disk with this SHA-256 hash. The code compiles. I can demonstrate now." |

---

*Estimated reading time: 10 minutes exactly at natural speaking pace.*
*Practice at least 5 times before interview. Time yourself.*
