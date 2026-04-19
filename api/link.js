// Complexity: O(1) — all-events listener / audit log
// Vercel Serverless Function: POST /link
// Receives ALL Stripe events (catch-all audit handler)

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

export const config = {
  api: {
    bodyParser: false,
  },
};

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET_LINK;

  let event;

  try {
    const rawBody = await getRawBody(req);
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error('[/link] Signature verification failed:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  // Audit log — every Stripe event is logged
  console.log(JSON.stringify({
    source: 'veritras.website/link',
    event: event.type,
    id: event.id,
    created: new Date(event.created * 1000).toISOString(),
    livemode: event.livemode,
  }));

  return res.status(200).json({ received: true, event: event.type });
}
