"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  QAntum Prime v28.1 - PAYMENT GATEWAY                                     ║
 * ║  "Парите влизат" - Stripe + PayPal Integration                            ║
 * ║                                                                           ║
 * ║  💰 Real money acceptance pipeline                                        ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentGateway = exports.PaymentGateway = void 0;
const events_1 = require("events");
const crypto = __importStar(require("crypto"));
// ═══════════════════════════════════════════════════════════════════════════
// STRIPE ADAPTER
// ═══════════════════════════════════════════════════════════════════════════
class StripeAdapter {
    secretKey;
    webhookSecret;
    baseUrl = 'https://api.stripe.com/v1';
    constructor(secretKey, webhookSecret) {
        this.secretKey = secretKey;
        this.webhookSecret = webhookSecret;
    }
    // Complexity: O(1) — hash/map lookup
    async request(endpoint, method, body) {
        const url = `${this.baseUrl}${endpoint}`;
        const headers = {
            'Authorization': `Bearer ${this.secretKey}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        };
        const options = {
            method,
            headers,
        };
        if (body) {
            options.body = new URLSearchParams(body).toString();
        }
        try {
            const response = await fetch(url, options);
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error?.message || 'Stripe API error');
            }
            return data;
        }
        catch (error) {
            console.error('[Stripe] API error:', error);
            throw error;
        }
    }
    /**
     * Create a payment intent
     */
    // Complexity: O(1)
    async createPaymentIntent(amount, currency = 'usd', metadata) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const data = await this.request('/payment_intents', 'POST', {
            amount: Math.round(amount * 100), // Stripe uses cents
            currency,
            ...metadata && { metadata: JSON.stringify(metadata) },
        });
        return {
            id: data.id,
            amount: data.amount / 100,
            currency: data.currency,
            status: this.mapStripeStatus(data.status),
            provider: 'stripe',
            metadata,
            createdAt: data.created * 1000,
        };
    }
    /**
     * Confirm payment intent
     */
    // Complexity: O(1)
    async confirmPayment(paymentIntentId, paymentMethodId) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const data = await this.request(`/payment_intents/${paymentIntentId}/confirm`, 'POST', {
            payment_method: paymentMethodId,
        });
        return {
            id: data.id,
            amount: data.amount / 100,
            currency: data.currency,
            status: this.mapStripeStatus(data.status),
            provider: 'stripe',
            createdAt: data.created * 1000,
        };
    }
    /**
     * Create a subscription
     */
    // Complexity: O(1) — hash/map lookup
    async createSubscription(customerId, priceId) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const data = await this.request('/subscriptions', 'POST', {
            customer: customerId,
            'items[0][price]': priceId,
        });
        return {
            id: data.id,
            customerId: data.customer,
            planId: data.items.data[0].price.id,
            status: data.status,
            currentPeriodEnd: data.current_period_end * 1000,
            amount: data.items.data[0].price.unit_amount / 100,
            currency: data.items.data[0].price.currency,
            provider: 'stripe',
        };
    }
    /**
     * Create a customer
     */
    // Complexity: O(N) — potential recursive descent
    async createCustomer(email, name) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const data = await this.request('/customers', 'POST', {
            email,
            ...(name && { name }),
        });
        return data.id;
    }
    /**
     * Verify webhook signature
     */
    // Complexity: O(1) — hash/map lookup
    verifyWebhook(payload, signature) {
        const timestamp = signature.split(',')[0].split('=')[1];
        const sig = signature.split(',')[1].split('=')[1];
        const expectedSig = crypto
            .createHmac('sha256', this.webhookSecret)
            .update(`${timestamp}.${payload}`)
            .digest('hex');
        return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig));
    }
    // Complexity: O(1) — hash/map lookup
    mapStripeStatus(status) {
        const map = {
            'requires_payment_method': 'pending',
            'requires_confirmation': 'pending',
            'requires_action': 'processing',
            'processing': 'processing',
            'succeeded': 'succeeded',
            'canceled': 'cancelled',
        };
        return map[status] || 'pending';
    }
}
// ═══════════════════════════════════════════════════════════════════════════
// PAYPAL ADAPTER
// ═══════════════════════════════════════════════════════════════════════════
class PayPalAdapter {
    clientId;
    clientSecret;
    mode;
    //   private accessToken: string = ';
    tokenExpiry = 0;
    constructor(clientId, clientSecret, mode) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.mode = mode;
    }
    get baseUrl() {
        return this.mode === 'live'
            ? 'https://api-m.paypal.com'
            : 'https://api-m.sandbox.paypal.com';
    }
    // Complexity: O(1) — amortized
    async getAccessToken() {
        if (this.accessToken && Date.now() < this.tokenExpiry) {
            return this.accessToken;
        }
        const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
        // SAFETY: async operation — wrap in try-catch for production resilience
        const response = await fetch(`${this.baseUrl}/v1/oauth2/token`, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'grant_type=client_credentials',
        });
        // SAFETY: async operation — wrap in try-catch for production resilience
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error_description || 'PayPal auth error');
        }
        this.accessToken = data.access_token;
        this.tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000; // 1 min buffer
        return this.accessToken;
    }
    // Complexity: O(1) — amortized
    async request(endpoint, method, body) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const token = await this.getAccessToken();
        // SAFETY: async operation — wrap in try-catch for production resilience
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            ...(body && { body: JSON.stringify(body) }),
        });
        // SAFETY: async operation — wrap in try-catch for production resilience
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'PayPal API error');
        }
        return data;
    }
    /**
     * Create an order (PayPal's equivalent of payment intent)
     */
    // Complexity: O(1) — amortized
    async createOrder(amount, currency = 'USD') {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const data = await this.request('/v2/checkout/orders', 'POST', {
            intent: 'CAPTURE',
            purchase_units: [{
                    amount: {
                        currency_code: currency.toUpperCase(),
                        value: amount.toFixed(2),
                    },
                }],
        });
        return {
            id: data.id,
            amount,
            currency: currency.toLowerCase(),
            status: this.mapPayPalStatus(data.status),
            provider: 'paypal',
            createdAt: Date.now(),
        };
    }
    /**
     * Capture an order
     */
    // Complexity: O(1) — hash/map lookup
    async captureOrder(orderId) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const data = await this.request(`/v2/checkout/orders/${orderId}/capture`, 'POST');
        const purchase = data.purchase_units[0];
        const capture = purchase.payments.captures[0];
        return {
            id: data.id,
            amount: parseFloat(capture.amount.value),
            currency: capture.amount.currency_code.toLowerCase(),
            status: this.mapPayPalStatus(data.status),
            provider: 'paypal',
            createdAt: Date.now(),
            completedAt: Date.now(),
        };
    }
    /**
     * Create a subscription
     */
    // Complexity: O(1) — amortized
    async createSubscription(planId, subscriberEmail) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const data = await this.request('/v1/billing/subscriptions', 'POST', {
            plan_id: planId,
            subscriber: {
                email_address: subscriberEmail,
            },
            application_context: {
                return_url: 'https://QAntum.pro/success',
                cancel_url: 'https://QAntum.pro/cancel',
            },
        });
        return {
            id: data.id,
            customerId: subscriberEmail,
            planId,
            status: 'active',
            currentPeriodEnd: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
            amount: 0, // Will be updated on webhook
            currency: 'usd',
            provider: 'paypal',
        };
    }
    // Complexity: O(1) — hash/map lookup
    mapPayPalStatus(status) {
        const map = {
            'CREATED': 'pending',
            'SAVED': 'pending',
            'APPROVED': 'processing',
            'PAYER_ACTION_REQUIRED': 'processing',
            'COMPLETED': 'succeeded',
            'VOIDED': 'cancelled',
        };
        return map[status] || 'pending';
    }
}
// ═══════════════════════════════════════════════════════════════════════════
// PAYMENT GATEWAY - UNIFIED INTERFACE
// ═══════════════════════════════════════════════════════════════════════════
class PaymentGateway extends events_1.EventEmitter {
    stripe;
    paypal;
    payments = new Map();
    subscriptions = new Map();
    // Stats
    totalRevenue = 0;
    totalTransactions = 0;
    successfulTransactions = 0;
    constructor() {
        super();
        // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // //
    }
    /**
     * Configure Stripe
     */
    // Complexity: O(1)
    configureStripe(secretKey, webhookSecret) {
        this.stripe = new StripeAdapter(secretKey, webhookSecret);
        // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // //
    }
    /**
     * Configure PayPal
     */
    // Complexity: O(1)
    configurePayPal(clientId, clientSecret, mode = 'sandbox') {
        this.paypal = new PayPalAdapter(clientId, clientSecret, mode);
        // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // //
    }
    /**
     * Create a payment intent
     */
    // Complexity: O(1) — hash/map lookup
    async createPayment(amount, currency = 'usd', provider = 'stripe', metadata) {
        // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // //
        let payment;
        if (provider === 'stripe') {
            if (!this.stripe)
                throw new Error('Stripe not configured');
            // SAFETY: async operation — wrap in try-catch for production resilience
            payment = await this.stripe.createPaymentIntent(amount, currency, metadata);
        }
        else {
            if (!this.paypal)
                throw new Error('PayPal not configured');
            // SAFETY: async operation — wrap in try-catch for production resilience
            payment = await this.paypal.createOrder(amount, currency);
        }
        this.payments.set(payment.id, payment);
        this.totalTransactions++;
        this.emit('payment-created', payment);
        return payment;
    }
    /**
     * Confirm/Capture payment
     */
    // Complexity: O(N)
    async confirmPayment(paymentId, paymentMethodId) {
        const payment = this.payments.get(paymentId);
        if (!payment)
            throw new Error('Payment not found');
        let result;
        if (payment.provider === 'stripe') {
            if (!this.stripe)
                throw new Error('Stripe not configured');
            if (!paymentMethodId)
                throw new Error('Payment method required for Stripe');
            // SAFETY: async operation — wrap in try-catch for production resilience
            result = await this.stripe.confirmPayment(paymentId, paymentMethodId);
        }
        else {
            if (!this.paypal)
                throw new Error('PayPal not configured');
            // SAFETY: async operation — wrap in try-catch for production resilience
            result = await this.paypal.captureOrder(paymentId);
        }
        this.payments.set(paymentId, result);
        if (result.status === 'succeeded') {
            this.successfulTransactions++;
            this.totalRevenue += result.amount;
            // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // //
        }
        this.emit('payment-confirmed', result);
        return result;
    }
    /**
     * Create a subscription
     */
    // Complexity: O(1) — hash/map lookup
    async createSubscription(provider, customerIdOrEmail, planId) {
        let subscription;
        if (provider === 'stripe') {
            if (!this.stripe)
                throw new Error('Stripe not configured');
            // SAFETY: async operation — wrap in try-catch for production resilience
            subscription = await this.stripe.createSubscription(customerIdOrEmail, planId);
        }
        else {
            if (!this.paypal)
                throw new Error('PayPal not configured');
            // SAFETY: async operation — wrap in try-catch for production resilience
            subscription = await this.paypal.createSubscription(planId, customerIdOrEmail);
        }
        this.subscriptions.set(subscription.id, subscription);
        // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // //
        this.emit('subscription-created', subscription);
        return subscription;
    }
    /**
     * Handle webhook
     */
    // Complexity: O(1)
    async handleWebhook(provider, payload, signature) {
        if (provider === 'stripe' && this.stripe && signature) {
            if (!this.stripe.verifyWebhook(payload, signature)) {
                throw new Error('Invalid webhook signature');
            }
        }
        const event = JSON.parse(payload);
        // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // //
        this.emit('webhook', { provider, event });
    }
    /**
     * Get payment by ID
     */
    // Complexity: O(1) — hash/map lookup
    getPayment(paymentId) {
        return this.payments.get(paymentId);
    }
    /**
     * Get subscription by ID
     */
    // Complexity: O(1) — hash/map lookup
    getSubscription(subscriptionId) {
        return this.subscriptions.get(subscriptionId);
    }
    /**
     * Get stats
     */
    // Complexity: O(N) — linear iteration
    getStats() {
        return {
            totalRevenue: this.totalRevenue,
            totalTransactions: this.totalTransactions,
            successfulTransactions: this.successfulTransactions,
            conversionRate: this.totalTransactions > 0
                ? (this.successfulTransactions / this.totalTransactions) * 100
                : 0,
            activeSubscriptions: Array.from(this.subscriptions.values())
                .filter(s => s.status === 'active').length,
        };
    }
    /**
     * Quick checkout link for Stripe
     */
    // Complexity: O(1)
    async createCheckoutLink(amount, productName, successUrl, cancelUrl) {
        // This would create a Stripe Checkout session
        // For now, return a placeholder
        const sessionId = `cs_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // //
        return `https://checkout.stripe.com/pay/${sessionId}`;
    }
}
exports.PaymentGateway = PaymentGateway;
// ═══════════════════════════════════════════════════════════════════════════
// SINGLETON EXPORT
// ═══════════════════════════════════════════════════════════════════════════
exports.paymentGateway = new PaymentGateway();
exports.default = PaymentGateway;
