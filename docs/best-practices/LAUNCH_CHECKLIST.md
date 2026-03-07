# Aeterna Prime Launch Checklist ✅

**Goal:** Launch the platform and acquire first 5 users within 7 days.

---

## 🟢 Phase 1: Infrastructure (Day 1)
- [x] **Deploy Presentation Site** ✅ Live at aeterna.website
  - Use Render "Static Site" or GitHub Pages.
  - Source: `aeterna-prime-architecture.html`
  - URL: `https://aeterna-prime-architecture.onrender.com` (Example)
- [x] **Deploy Webapp (SaaS)** ✅ Live at aeterna-dashboard.vercel.app
  - Use Render "Web Service".
  - Source: `src/security_core/MrMindQATool_ACTIVE/webapp`
  - Start Command: `node server.js`
  - URL: `https://aeterna-prime.onrender.com`

## 🟡 Phase 2: Content Creation (Day 2)
- [x] **Create "Hero" Case Study** ✅ marketing/case-study-hero.md
  - Open `BUG_BOUNTY_REPORT.md` from `src/security_core/MrMindQATool_ACTIVE/evidence/revolut/`.
  - Redact sensitive info (e.g., replace "Revolut" with "Global Fintech App").
  - Take screenshots of the report.
- [x] **Generate Social Assets** ✅ marketing/social-posts-ready.md + carousel-slides.json
  - Open `linkedin-carousel-generator.html` in browser.
  - Paste the Case Study highlights.
  - Export PDF for LinkedIn.

## 🟠 Phase 3: Outreach (Day 3-5)
- [ ] **LinkedIn Post**
  - Topic: "How AI found critical vulnerabilities in < 10 mins."
  - Attach: The PDF carousel.
  - Tag: #CyberSecurity #AI #BugBounty #Aeterna
- [ ] **Direct Outreach**
  - Identify 5 CTOs/CISOs on LinkedIn.
  - Message: "I built an AI agent that automates security audits. It found [X] vulnerabilities in a major fintech app. Want to see the architecture? [Link]"
- [ ] **Product Hunt / Reddit**
  - Post on r/NetSec, r/SideProject.
  - Title: "I built an AI Bug Hunter that automates finding PII leaks."

## 🔴 Phase 4: Monitor & Scale (Day 6-7)
- [ ] **Check Logs**
  - Monitor Render logs for errors.
  - Check `dashboard/trades/` for HFT performance.
- [ ] **Gather Feedback**
  - Ask first users: "What one feature is missing?"
  - Iterate on the Webapp.

---
*Stay disciplined. Execute daily.*
