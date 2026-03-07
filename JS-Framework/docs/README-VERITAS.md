# VERITAS API Implementation

This directory contains the implementation of the VERITAS subscription API.

## Environment Variables

The following environment variables are required for the server to function correctly:

| Variable | Description |
|----------|-------------|
| `STRIPE_SECRET_KEY` | Your Stripe Secret Key (starts with `sk_`) |
| `STRIPE_WEBHOOK_SECRET` | Your Stripe Webhook Secret (starts with `whsec_`) |
| `PRICE_BASIC` | Stripe Price ID for the BASIC plan |
| `PRICE_PREMIUM` | Stripe Price ID for the PREMIUM plan |
| `PORT` | Port to run the server on (default: 3000) |

## Running the Server

Use the following command to start the server:

```bash
node server.js
```

## API Endpoints

- `GET /health`: Check server status. Returns `{ status: 'ok', uptime: <seconds> }`.
- `POST /api/checkout`: Create a checkout session. Body: `{ planId: 'BASIC' | 'PREMIUM' }`.
- `POST /api/portal`: Create a billing portal session. Body: `{ customerId: '...' }`.
- `GET /api/session`: Retrieve session details. Query: `?session_id=...`.
- `POST /api/webhook`: Handle Stripe webhooks.

## Frontend Integration

Include the script in your HTML:

```html
<script src="/public/veritras-checkout.js"></script>
```

Add buttons with `data-veritras-plan` attribute:

```html
<button data-veritras-plan="BASIC">Subscribe to Basic</button>
<button data-veritras-plan="PREMIUM">Subscribe to Premium</button>
```
