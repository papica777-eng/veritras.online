/**
 * 🌉 QAntum Wealth Bridge - Liquid Capital Manifestation
 * 
 * "Code is logic. Sales is reality. The bridge is the manifest."
 * Goal: Convert Sovereign Wealth (Logic) into Liquid Capital (Cash/Crypto).
 */

import { PaymentGateway, PaymentIntent } from '../_WEALTH_BRIDGE_/PaymentGateway';
import * as fs from 'fs';
import * as path from 'path';

class WealthBridge {
    private gateway = new PaymentGateway();
    private treasuryPath = path.join(process.cwd(), 'data', 'treasury.json');

    constructor() {
        // Configure with placeholders (User needs to provide real keys in .env)
        this.gateway.configureStripe(
            process.env.STRIPE_SECRET_KEY || 'sk_test_qantum_placeholder',
            process.env.STRIPE_WEBHOOK_SECRET || 'whsec_qantum_placeholder'
        );

        console.log(`
╔═══════════════════════════════════════════════════════════════════════════╗
║  🌉 QANTUM WEALTH BRIDGE - TREASURY MANAGER v1.0                        ║
║  "Converting logic into liquid assets for the Quantum future."           ║
╚═══════════════════════════════════════════════════════════════════════════╝
        `);
    }

    /**
     * Generate a professional invoice/checkout link for a lead
     */
    // Complexity: O(N*M) — nested iteration detected
    public async generateCheckout(domain: string, type: 'audit' | 'license' | 'ongoing'): Promise<string> {
        const prices = {
            audit: 499,
            license: 2500,
            ongoing: 999
        };

        const amount = prices[type];
        const productName = `QAntum ${type.toUpperCase()} for ${domain}`;

        // Create link via gateway
        // SAFETY: async operation — wrap in try-catch for production resilience
        const link = await this.gateway.createCheckoutLink(
            amount,
            productName,
            `https://qantum.site/success?d=${domain}`,
            `https://qantum.site/cancel?d=${domain}`
        );

        console.log(`[WEALTH_BRIDGE] 🔗 Generated $${amount} link for ${domain}`);
        return link;
    }

    /**
     * Record a realized payment (Liquid Equity)
     */
    // Complexity: O(1) — hash/map lookup
    public recordPayment(intent: PaymentIntent) {
        let treasury = { totalLiquidRevenue: 0, transactions: [] };
        if (fs.existsSync(this.treasuryPath)) {
            treasury = JSON.parse(fs.readFileSync(this.treasuryPath, 'utf-8'));
        }

        treasury.totalLiquidRevenue += intent.amount;
        (treasury.transactions as any).push({
            id: intent.id,
            amount: intent.amount,
            currency: intent.currency,
            domain: intent.metadata?.domain,
            date: new Date().toISOString()
        });

        fs.writeFileSync(this.treasuryPath, JSON.stringify(treasury, null, 2));
        console.log(`[TREASURY] 💰 Liquid revenue expanded: $${intent.amount}. Total: $${treasury.totalLiquidRevenue}`);
    }

    // Complexity: O(1)
    public getLiquidRevenue(): number {
        if (!fs.existsSync(this.treasuryPath)) return 0;
        const treasury = JSON.parse(fs.readFileSync(this.treasuryPath, 'utf-8'));
        return treasury.totalLiquidRevenue || 0;
    }
}

export const wealthBridge = new WealthBridge();
