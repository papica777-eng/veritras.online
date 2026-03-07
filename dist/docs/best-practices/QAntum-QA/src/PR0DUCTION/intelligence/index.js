"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * QANTUM INTELLIGENCE MODULE - The All-Seeing Eye
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Central export hub for all intelligence gathering and trust systems.
 * 100% legal, 100% ethical, 100% devastating.
 *
 * @author Димитър Продромов / Mister Mind
 * @copyright 2026 QAntum Empire. All Rights Reserved.
 * @version 33.1.0 - THE ETHICAL PREDATOR
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrustNetwork = exports.PublicScanner = void 0;
exports.getIntelligence = getIntelligence;
exports.quickScan = quickScan;
exports.issueTrustSeal = issueTrustSeal;
exports.verifySeal = verifySeal;
// ═══════════════════════════════════════════════════════════════════════════════
// CORE SCANNERS
// ═══════════════════════════════════════════════════════════════════════════════
var PublicScanner_1 = require("./PublicScanner");
Object.defineProperty(exports, "PublicScanner", { enumerable: true, get: function () { return PublicScanner_1.PublicScanner; } });
// ═══════════════════════════════════════════════════════════════════════════════
// TRUST NETWORK
// ═══════════════════════════════════════════════════════════════════════════════
var TrustNetwork_1 = require("./TrustNetwork");
Object.defineProperty(exports, "TrustNetwork", { enumerable: true, get: function () { return TrustNetwork_1.TrustNetwork; } });
// ═══════════════════════════════════════════════════════════════════════════════
// FACTORY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════
const PublicScanner_2 = require("./PublicScanner");
const TrustNetwork_2 = require("./TrustNetwork");
/**
 * Get singleton instances of all intelligence modules.
 */
function getIntelligence() {
    return {
        scanner: PublicScanner_2.PublicScanner.getInstance(),
        trust: TrustNetwork_2.TrustNetwork.getInstance(),
    };
}
/**
 * Quick scan a domain and return intelligence report.
 */
async function quickScan(url) {
    const scanner = PublicScanner_2.PublicScanner.getInstance();
    return scanner.scan(url);
}
/**
 * Generate and issue a trust seal for a domain.
 */
async function issueTrustSeal(clientId, domain) {
    const trust = TrustNetwork_2.TrustNetwork.getInstance();
    return trust.generateSeal(clientId, domain);
}
/**
 * Verify an existing trust seal.
 */
async function verifySeal(sealId) {
    const trust = TrustNetwork_2.TrustNetwork.getInstance();
    return trust.verifySeal(sealId);
}
// ═══════════════════════════════════════════════════════════════════════════════
// DEFAULT EXPORT
// ═══════════════════════════════════════════════════════════════════════════════
exports.default = {
    PublicScanner: PublicScanner_2.PublicScanner,
    TrustNetwork: TrustNetwork_2.TrustNetwork,
    getIntelligence,
    quickScan,
    issueTrustSeal,
    verifySeal,
};
