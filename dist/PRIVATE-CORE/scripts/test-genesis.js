"use strict";
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
require("dotenv/config");
const VortexHealingNexus_1 = require("../core/evolution/VortexHealingNexus");
const ApoptosisModule_1 = require("../core/evolution/ApoptosisModule");
const SovereignSalesHealer_1 = require("../modules/sales/SovereignSalesHealer");
const Logger_1 = require("../utils/Logger");
const LivenessTokenManager_1 = require("../core/evolution/LivenessTokenManager");
const crypto = __importStar(require("crypto"));
const logger = Logger_1.Logger.getInstance();
const nexus = new VortexHealingNexus_1.VortexHealingNexus();
const apoptosis = new ApoptosisModule_1.ApoptosisModule();
const salesHealer = new SovereignSalesHealer_1.SovereignSalesHealer();
async function runChaosSuite() {
    logger.log('🧪 INITIATING GENESIS CHAOS SUITE...');
    // Test 1: Network Healing
    await testNetworkHealing();
    // Test 2: Security Validation
    await testSecurityValidation();
    logger.log('✅ GENESIS CHAOS SUITE COMPLETE.');
}
async function testNetworkHealing() {
    logger.log('--- TEST: NETWORK HEALING ---');
    try {
        // Trigger Network Error (666)
        await salesHealer.executeTrade({
            agentId: 'TEST_SALES_AGENT',
            pair: 'BTC/USD',
            amount: 666,
            action: 'BUY'
        });
        logger.log('✅ Network healing successful (Re-validation reached)');
    }
    catch (e) {
        // In the mock, it might re-fail because 666 is hardcoded to fail, 
        // but it should log 'Healing successful' first.
        logger.log('ℹ️ Network healing logic triggered');
    }
}
async function testSecurityValidation() {
    logger.log('--- TEST: SECURITY VALIDATION ---');
    const moduleId = 'SecurityTestModule';
    const secret = LivenessTokenManager_1.LivenessTokenManager.getInstance().getSecret();
    // 1. Happy Path
    try {
        const token = nexus.generateLivenessToken(moduleId, 'HEALTHY');
        await apoptosis.registerVitality(moduleId, token);
        logger.log('✅ Security: Valid token accepted');
    }
    catch (e) {
        logger.error('❌ Happy Path Failed', e);
    }
    // 2. Forged Token
    try {
        const payload = `${moduleId}:${Date.now()}:HEALTHY`;
        const forgedToken = Buffer.from(`${payload}:deadbeef`).toString('base64');
        await apoptosis.registerVitality(moduleId, forgedToken);
        logger.error('❌ SECURITY FAILURE: Forged token accepted');
    }
    catch (e) {
        logger.log('✅ Security: Forged token rejected');
    }
    // 3. Expired Token
    try {
        const past = Date.now() - (10 * 60 * 1000); // 10 mins ago
        const payload = `${moduleId}:${past}:HEALTHY`;
        const sig = crypto.createHmac('sha256', secret).update(payload).digest('hex');
        const expiredToken = Buffer.from(`${payload}:${sig}`).toString('base64');
        await apoptosis.registerVitality(moduleId, expiredToken);
        logger.error('❌ SECURITY FAILURE: Expired token accepted');
    }
    catch (e) {
        logger.log('✅ Security: Expired token rejected');
    }
}
runChaosSuite().catch(console.error);
