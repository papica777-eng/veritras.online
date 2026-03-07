# VERITAS SaaS на veritras.website

## Текущо състояние

- **Checkout API** `/api/checkout` – Basic **€24/mo**, Premium **€79/mo** (Stripe subscriptions)
- **Portal API** `/api/portal` – управление на абонамент (фактури, отказ, карта)
- **Session API** `/api/session` – след плащане: `session_id` → customerId + planId
- **Webhook** `/api/webhook` – Stripe събития (subscription lifecycle)
- **Drop-in script** `/public/veritras-checkout.js` – за Subscribe бутоните

### Цени – конкурентен анализ (малко под пазара)

| Конкурент | Entry | Mid/Pro |
|-----------|-------|---------|
| Snyk | $25/dev | custom |
| SonarQube | $32/mo | custom |
| SignupGate | €29 | €99 |
| CipherStash (ZKP) | — | $99 |
| **VERITAS** | **€24** | **€79** |

## Vercel (препоръчително)

1. [vercel.com](https://vercel.com) → Import repo
2. **Environment Variables** → добави `STRIPE_SECRET_KEY` (от Stripe Dashboard)
3. **Domains** → `veritras.website`
4. Deploy

## Subscribe бутони на VERITAS landing

Добави в HTML:
```html
<script src="/public/veritras-checkout.js"></script>
<!-- ... -->
<button data-veritras-plan="BASIC">SUBSCRIBE BASIC</button>
<button data-veritras-plan="PREMIUM">SUBSCRIBE PREMIUM</button>
```

## API

- `POST /api/checkout` → `{ planId: "BASIC" | "PREMIUM" }` → `{ url, sessionId }`
- `POST /api/portal` → `{ customerId }` → `{ url }` (Stripe Customer Portal)
- `GET /api/session?session_id=cs_xxx` → `{ customerId, subscriptionId, planId }`
- `POST /api/webhook` → Stripe webhook (нужен `STRIPE_WEBHOOK_SECRET`)

## Пълен поток (front → плащане → back)

1. **Landing** – бутони с `data-veritras-plan="BASIC"` или `"PREMIUM"`, скрипт `/public/veritras-checkout.js`.
2. **Checkout** – кликът вика `POST /api/checkout` → redirect към Stripe Checkout.
3. **Success** – Stripe пренасочва към `/app/dashboard.html?session_id=cs_xxx`.
4. **Dashboard** – JS вика `GET /api/session?session_id=...`, записва `customerId` и `planId` в localStorage, показва „Manage billing“.
5. **Manage billing** – вика `POST /api/portal` с `customerId` → redirect към Stripe Billing Portal.
6. **Webhook** (по избор) – в Stripe Dashboard добави endpoint `https://veritras.website/api/webhook`, събития `checkout.session.completed`, `customer.subscription.*`, `invoice.*`; env `STRIPE_WEBHOOK_SECRET`.

---

## (Legacy) Вариант 2: Netlify
1. Отиди на [netlify.com](https://netlify.com) и влез с GitHub
2. New site from Git → избери този repo
3. Build: остави празно (static site)
4. Publish directory: `.` (root)
5. Domain: добави custom domain `veritras.website`

### Вариант 3: GitHub Pages
1. В repo: **Settings** → **Pages**
2. Source: **GitHub Actions** (избери workflow `Deploy to veritras.website`)
3. Custom domain: добави `veritras.website`
4. Push към `main` — автоматичен deploy

## DNS настройки за veritras.website

При регистратор на домейна (Namecheap, GoDaddy, Cloudflare и т.н.) добави:

| Type | Host | Value |
|------|------|-------|
| **A** | @ | `76.76.21.21` (Vercel) |
| **CNAME** | www | `cname.vercel-dns.com` |

*За Netlify:* `A` → `75.2.60.5`, `CNAME` www → `apex-loadbalancer.netlify.com`  
*За GitHub Pages:* `A` → `185.199.108.153`, `CNAME` www → `username.github.io`

## SSL

Vercel, Netlify и GitHub Pages настройват HTTPS автоматично за custom domain.

## Тестване локално

```bash
# Със npx serve
npx serve .

# Или с Python
python -m http.server 8080
```

Отвори http://localhost:8080 или http://localhost:3000
