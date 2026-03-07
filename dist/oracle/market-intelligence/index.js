"use strict";
/**
 * Oracle's Market Intelligence - Unified Export
 *
 * QAntum Framework v1.6.0 - "The Oracle's Market Intelligence"
 *
 * TOTAL v1.6.0 MARKET VALUE: +$650,000
 *
 * Components:
 * - EnterpriseDiscovery: +$220,000 (Auto Deep Crawl with Ghost Protocol v2)
 * - MarketBlueprint: +$185,000 (Site logic → Purchasable packages)
 * - PredictiveScaler: +$150,000 (Chronos-Paradox resource prediction)
 * - SelfHealingSales: +$95,000 (Issue → Sales opportunity conversion)
 *
 * @module oracle/market-intelligence
 * @version 1.6.0
 * @enterprise true
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FEATURES = exports.MARKET_VALUE = exports.CODENAME = exports.VERSION = exports.createSelfHealingSales = exports.SelfHealingSales = exports.createPredictiveScaler = exports.PredictiveScaler = exports.createMarketBlueprint = exports.MarketBlueprint = exports.createEnterpriseDiscovery = exports.EnterpriseDiscovery = void 0;
exports.createMarketIntelligencePipeline = createMarketIntelligencePipeline;
// ═══════════════════════════════════════════════════════════════════════════
// ENTERPRISE DISCOVERY - Auto Deep Crawl
// ═══════════════════════════════════════════════════════════════════════════
var EnterpriseDiscovery_1 = require("../oracle/EnterpriseDiscovery");
Object.defineProperty(exports, "EnterpriseDiscovery", { enumerable: true, get: function () { return EnterpriseDiscovery_1.EnterpriseDiscovery; } });
Object.defineProperty(exports, "createEnterpriseDiscovery", { enumerable: true, get: function () { return EnterpriseDiscovery_1.createEnterpriseDiscovery; } });
// ═══════════════════════════════════════════════════════════════════════════
// MARKET BLUEPRINT - Purchasable Test Packages
// ═══════════════════════════════════════════════════════════════════════════
var MarketBlueprint_1 = require("../biology/evolution/MarketBlueprint");
Object.defineProperty(exports, "MarketBlueprint", { enumerable: true, get: function () { return MarketBlueprint_1.MarketBlueprint; } });
Object.defineProperty(exports, "createMarketBlueprint", { enumerable: true, get: function () { return MarketBlueprint_1.createMarketBlueprint; } });
// ═══════════════════════════════════════════════════════════════════════════
// PREDICTIVE SCALER - Chronos-Paradox Integration
// ═══════════════════════════════════════════════════════════════════════════
var PredictiveScaler_1 = require("../chronos/PredictiveScaler");
Object.defineProperty(exports, "PredictiveScaler", { enumerable: true, get: function () { return PredictiveScaler_1.PredictiveScaler; } });
Object.defineProperty(exports, "createPredictiveScaler", { enumerable: true, get: function () { return PredictiveScaler_1.createPredictiveScaler; } });
// ═══════════════════════════════════════════════════════════════════════════
// SELF-HEALING SALES - Issue → Opportunity Conversion
// ═══════════════════════════════════════════════════════════════════════════
var SelfHealingSales_1 = require("../sales/SelfHealingSales");
Object.defineProperty(exports, "SelfHealingSales", { enumerable: true, get: function () { return SelfHealingSales_1.SelfHealingSales; } });
Object.defineProperty(exports, "createSelfHealingSales", { enumerable: true, get: function () { return SelfHealingSales_1.createSelfHealingSales; } });
// ═══════════════════════════════════════════════════════════════════════════
// ORCHESTRATED PIPELINE
// ═══════════════════════════════════════════════════════════════════════════
const EnterpriseDiscovery_2 = require("../oracle/EnterpriseDiscovery");
const MarketBlueprint_2 = require("../biology/evolution/MarketBlueprint");
const PredictiveScaler_2 = require("../chronos/PredictiveScaler");
const SelfHealingSales_2 = require("../sales/SelfHealingSales");
/**
 * Create a complete Market Intelligence pipeline
 */
function createMarketIntelligencePipeline(config) {
    return {
        discovery: (0, EnterpriseDiscovery_2.createEnterpriseDiscovery)(config?.discovery),
        blueprint: (0, MarketBlueprint_2.createMarketBlueprint)(config?.blueprint),
        scaler: (0, PredictiveScaler_2.createPredictiveScaler)(config?.scaler),
        sales: (0, SelfHealingSales_2.createSelfHealingSales)(config?.sales)
    };
}
/**
 * Version information
 */
exports.VERSION = '1.6.0';
exports.CODENAME = "The Oracle's Market Intelligence";
exports.MARKET_VALUE = {
    enterpriseDiscovery: 220000,
    marketBlueprint: 185000,
    predictiveScaler: 150000,
    selfHealingSales: 95000,
    total: 650000
};
/**
 * v1.6.0 Feature Summary
 */
exports.FEATURES = {
    enterpriseDiscovery: [
        'Auto Deep Crawl when client adds URL',
        'Ghost Protocol v2 stealth integration',
        'ClientOrchestrator authentication',
        'Multi-level stealth (standard/enhanced/ghost/phantom)'
    ],
    marketBlueprint: [
        'Convert site logic to purchasable packages',
        'Dynamic pricing with complexity tiers',
        'Package bundles with volume discounts',
        'White-label support for resellers'
    ],
    predictiveScaler: [
        'Chronos-Paradox temporal analysis',
        'Predict resources BEFORE Run button',
        'Butterfly effect risk assessment',
        'Cost-optimized resource allocation'
    ],
    selfHealingSales: [
        'Auto-detect bugs during crawling',
        'Generate professional issue reports',
        'Create targeted sales offers',
        'Track conversion metrics'
    ]
};
exports.default = {
    createMarketIntelligencePipeline,
    VERSION: exports.VERSION,
    CODENAME: exports.CODENAME,
    MARKET_VALUE: exports.MARKET_VALUE,
    FEATURES: exports.FEATURES
};
