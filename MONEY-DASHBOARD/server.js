/**
 * 💰 QANTUM MONEY BACKEND
 * Real Stripe payments + Gemini AI
 */

import express from 'express';
import cors from 'cors';
import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const GEMINI_KEY = process.env.GEMINI_API_KEY;

app.use(cors());
app.use(express.json());

// ═══════════════════════════════════════════════════════════════
// 💰 PRICING PLANS
// ═══════════════════════════════════════════════════════════════

const PLANS = {
  starter: { price: 29, tokens: 10000, name: 'Starter' },
  pro: { price: 99, tokens: 50000, name: 'Pro' },
  enterprise: { price: 299, tokens: 200000, name: 'Enterprise' }
};

// ═══════════════════════════════════════════════════════════════
// ROUTES
// ═══════════════════════════════════════════════════════════════

// Health check
app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'OPERATIONAL',
    engine: 'QANTUM_MONEY_V1',
    stripe: !!process.env.STRIPE_SECRET_KEY,
    gemini: !!process.env.GEMINI_API_KEY
  });
});

// Get pricing
app.get('/api/pricing', (req, res) => {
  res.json(PLANS);
});

// 💳 Create Stripe Checkout Session
app.post('/api/checkout', async (req, res) => {
  try {
    const { plan, email } = req.body;
    const planData = PLANS[plan];
    
    if (!planData) {
      return res.status(400).json({ error: 'Invalid plan' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `QAntum AI ${planData.name}`,
            description: `${planData.tokens.toLocaleString()} AI tokens/month`,
          },
          unit_amount: planData.price * 100,
          recurring: { interval: 'month' }
        },
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/pricing`,
      customer_email: email,
      metadata: { plan, tokens: planData.tokens }
    });

    res.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 🧠 AI Chat with Gemini
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: message }] }],
          generationConfig: { maxOutputTokens: 1000 }
        })
      }
    );
    
    const data = await response.json();
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response';
    
    res.json({ response: aiResponse });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 📊 Revenue stats (mock for demo)
app.get('/api/stats', (req, res) => {
  res.json({
    totalRevenue: 12847.50,
    activeSubscriptions: 156,
    todayRevenue: 847.00,
    growthPercent: 23.5,
    topPlan: 'Pro'
  });
});

// Stripe Webhook
app.post('/api/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  
  try {
    const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      console.log('💰 NEW PAYMENT:', session.amount_total / 100, 'USD');
      // TODO: Activate user subscription in database
    }
    
    res.json({ received: true });
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║  💰 QANTUM MONEY DASHBOARD BACKEND                            ║
║  🌐 http://localhost:${PORT}                                    ║
║  💳 Stripe: ${process.env.STRIPE_SECRET_KEY ? 'CONNECTED' : 'NOT SET'}                                    ║
║  🧠 Gemini: ${process.env.GEMINI_API_KEY ? 'CONNECTED' : 'NOT SET'}                                     ║
╚═══════════════════════════════════════════════════════════════╝
  `);
});
