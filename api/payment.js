// Complexity: O(1) per event type dispatch
// Vercel Serverless Function: POST /payment
// Handles: checkout.session.completed, subscription.*, invoice.*

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

// Disable Vercel body parsing — Stripe needs raw body for signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};

// Read raw body from stream
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
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  let rawBody;

  try {
    rawBody = await getRawBody(req);
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error('[/payment] Signature verification failed:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  console.log(`[/payment] Event received: ${event.type}`);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const { plan, email } = session.metadata || {};
        console.log(`[/payment] Checkout complete — Plan: ${plan} | Email: ${email || session.customer_email}`);
        // TODO: Provision tenant via Firebase/DB
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = event.data.object;
        console.log(`[/payment] Subscription ${event.type}: ${sub.id} | Status: ${sub.status}`);
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        console.log(`[/payment] Subscription CANCELLED: ${sub.id}`);
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object;
        console.log(`[/payment] Invoice PAID: ${invoice.id} | Amount: ${invoice.amount_paid / 100} ${invoice.currency.toUpperCase()}`);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        console.error(`[/payment] Invoice FAILED: ${invoice.id}`);
        break;
      }

      default:
        console.log(`[/payment] Unhandled: ${event.type}`);
    }
  } catch (err) {
    console.error(`[/payment] Processing error for ${event.type}:`, err.message);
    // Return 200 to prevent Stripe retries for handler errors
  }

  return res.status(200).json({ received: true });
}
