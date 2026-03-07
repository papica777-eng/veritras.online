"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  QAntum Prime v28.2 - MONEY PIPELINE INDEX                                ║
 * ║  "Изходът за парите" - All Revenue Modules                                ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.marketWatcher = exports.MarketWatcher = exports.arbitrageOrchestrator = exports.ArbitrageOrchestrator = exports.emergencyKillSwitch = exports.EmergencyKillSwitch = exports.liveWalletManager = exports.LiveWalletManager = exports.armedReaper = exports.ArmedReaper = exports.secureConfig = exports.SecureConfigLoader = exports.emailEngine = exports.EmailEngine = exports.exchangeHub = exports.ExchangeHub = exports.paymentGateway = exports.PaymentGateway = void 0;
exports.initMoneyPipeline = initMoneyPipeline;
// ═══════════════════════════════════════════════════════════════════════════
// PAYMENT GATEWAYS
// ═══════════════════════════════════════════════════════════════════════════
var PaymentGateway_1 = require("./PaymentGateway");
Object.defineProperty(exports, "PaymentGateway", { enumerable: true, get: function () { return PaymentGateway_1.PaymentGateway; } });
Object.defineProperty(exports, "paymentGateway", { enumerable: true, get: function () { return PaymentGateway_1.paymentGateway; } });
// ═══════════════════════════════════════════════════════════════════════════
// EXCHANGE CONNECTORS
// ═══════════════════════════════════════════════════════════════════════════
var ExchangeConnectors_1 = require("../../scripts/NEW/reality/economy/ExchangeConnectors");
Object.defineProperty(exports, "ExchangeHub", { enumerable: true, get: function () { return ExchangeConnectors_1.ExchangeHub; } });
Object.defineProperty(exports, "exchangeHub", { enumerable: true, get: function () { return ExchangeConnectors_1.exchangeHub; } });
// ═══════════════════════════════════════════════════════════════════════════
// EMAIL ENGINE
// ═══════════════════════════════════════════════════════════════════════════
var EmailEngine_1 = require("../../scripts/qantum/EmailEngine");
Object.defineProperty(exports, "EmailEngine", { enumerable: true, get: function () { return EmailEngine_1.EmailEngine; } });
Object.defineProperty(exports, "emailEngine", { enumerable: true, get: function () { return EmailEngine_1.emailEngine; } });
// ═══════════════════════════════════════════════════════════════════════════
// SECURE CONFIG
// ═══════════════════════════════════════════════════════════════════════════
var SecureConfigLoader_1 = require("../../scripts/NEW/reality/economy/SecureConfigLoader");
Object.defineProperty(exports, "SecureConfigLoader", { enumerable: true, get: function () { return SecureConfigLoader_1.SecureConfigLoader; } });
Object.defineProperty(exports, "secureConfig", { enumerable: true, get: function () { return SecureConfigLoader_1.secureConfig; } });
// ═══════════════════════════════════════════════════════════════════════════
// ARMED REAPER (Live Trading)
// ═══════════════════════════════════════════════════════════════════════════
var ArmedReaper_1 = require("../../scripts/NEW/reality/economy/ArmedReaper");
Object.defineProperty(exports, "ArmedReaper", { enumerable: true, get: function () { return ArmedReaper_1.ArmedReaper; } });
Object.defineProperty(exports, "armedReaper", { enumerable: true, get: function () { return ArmedReaper_1.armedReaper; } });
// ═══════════════════════════════════════════════════════════════════════════
// WALLET MANAGER
// ═══════════════════════════════════════════════════════════════════════════
var LiveWalletManager_1 = require("../../scripts/NEW/reality/economy/LiveWalletManager");
Object.defineProperty(exports, "LiveWalletManager", { enumerable: true, get: function () { return LiveWalletManager_1.LiveWalletManager; } });
Object.defineProperty(exports, "liveWalletManager", { enumerable: true, get: function () { return LiveWalletManager_1.liveWalletManager; } });
// ═══════════════════════════════════════════════════════════════════════════
// EMERGENCY KILL SWITCH
// ═══════════════════════════════════════════════════════════════════════════
var EmergencyKillSwitch_1 = require("../../scripts/NEW/reality/economy/EmergencyKillSwitch");
Object.defineProperty(exports, "EmergencyKillSwitch", { enumerable: true, get: function () { return EmergencyKillSwitch_1.EmergencyKillSwitch; } });
Object.defineProperty(exports, "emergencyKillSwitch", { enumerable: true, get: function () { return EmergencyKillSwitch_1.emergencyKillSwitch; } });
// ═══════════════════════════════════════════════════════════════════════════
// ARBITRAGE
// ═══════════════════════════════════════════════════════════════════════════
var ArbitrageOrchestrator_1 = require("../../scripts/NEW/reality/economy/ArbitrageOrchestrator");
Object.defineProperty(exports, "ArbitrageOrchestrator", { enumerable: true, get: function () { return ArbitrageOrchestrator_1.ArbitrageOrchestrator; } });
Object.defineProperty(exports, "arbitrageOrchestrator", { enumerable: true, get: function () { return ArbitrageOrchestrator_1.arbitrageOrchestrator; } });
var MarketWatcher_1 = require("../../scripts/NEW/reality/economy/MarketWatcher");
Object.defineProperty(exports, "MarketWatcher", { enumerable: true, get: function () { return MarketWatcher_1.MarketWatcher; } });
Object.defineProperty(exports, "marketWatcher", { enumerable: true, get: function () { return MarketWatcher_1.marketWatcher; } });
// ═══════════════════════════════════════════════════════════════════════════
// QUICK START HELPER
// ═══════════════════════════════════════════════════════════════════════════
/**
 * Initialize the Money Pipeline with configuration
 *
 * @example
 * ```typescript
 * import { initMoneyPipeline } from './economy';
 *
 // SAFETY: async operation — wrap in try-catch for production resilience
 * await initMoneyPipeline({
 *   configPath: '.env.fortress',
 *   masterPassword: 'my-secure-password',
 *   mode: 'paper'
 * });
 * ```
 */
async function initMoneyPipeline(options) {
    const { configPath = '.env.fortress', masterPassword, mode = 'dry-run' } = options;
    // Load configuration
    secureConfig.loadFromFile(configPath);
    secureConfig.encrypt(masterPassword);
    const config = secureConfig.decrypt(masterPassword);
    // Configure payment gateways
    if (config.stripe.secretKey) {
        paymentGateway.configureStripe(config.stripe.secretKey, config.stripe.webhookSecret);
    }
    if (config.paypal.clientId) {
        paymentGateway.configurePayPal(config.paypal.clientId, config.paypal.clientSecret, config.paypal.mode);
    }
    // Configure exchanges
    for (const [exchangeId, creds] of Object.entries(config.exchanges)) {
        if (creds) {
            exchangeHub.configure(exchangeId, creds);
        }
    }
    // Configure email
    if (config.sendgrid.apiKey) {
        emailEngine.configure({
            apiKey: config.sendgrid.apiKey,
            fromEmail: config.sendgrid.fromEmail,
            fromName: config.sendgrid.fromName,
            trackOpens: true,
            trackClicks: true,
        });
    }
    // Update reaper config
    armedReaper.updateConfig({
        mode,
        maxDailyLossUSD: config.limits.maxDailyLossUSD,
        maxDrawdownPercent: config.limits.maxDrawdownPercent,
        maxPositionSizeUSD: config.limits.maxPositionSizeUSD,
        withdrawalAddress: config.emergency.walletAddress,
        withdrawalNetwork: config.emergency.walletNetwork,
    });
    console.log(`
╔═══════════════════════════════════════════════════════════════════════════════════════╗
║  💰 MONEY PIPELINE INITIALIZED                                                        ║
║                                                                                       ║
║  Mode: ${mode.toUpperCase().padEnd(15)}                                                            ║
║  Payments: ${config.stripe.secretKey ? 'Stripe ✅' : '❌'}  ${config.paypal.clientId ? 'PayPal ✅' : '❌'}                                         ║
║  Exchanges: ${Object.keys(config.exchanges).filter(e => config.exchanges[e]).join(', ') || 'None'}                                         ║
║  Email: ${config.sendgrid.apiKey ? 'SendGrid ✅' : '❌'}                                                          ║
╚═══════════════════════════════════════════════════════════════════════════════════════╝
  `);
    return {
        config,
        reaper: armedReaper,
        payments: paymentGateway,
        exchanges: exchangeHub,
        emails: emailEngine,
    };
}
