"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                    QANTUM ECOSYSTEM - SHARED TYPES                            ║
 * ║                                                                               ║
 * ║   Common types used across all three repositories:                            ║
 * ║   • MisteMind (Core) - Business logic & AI                                    ║
 * ║   • MrMindQATool (Shield) - QA & Testing                                      ║
 * ║   • MisterMindPage (Voice) - Public interface                                 ║
 * ║                                                                               ║
 * ║   Generated: 2026-01-02T01:37:28.448Z                                       ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CODENAME = exports.ECOSYSTEM_VERSION = exports.PRIME_VERSION = exports.QANTUM_VERSION = void 0;
exports.isTestPassed = isTestPassed;
exports.isVulnerabilityCritical = isVulnerabilityCritical;
exports.isEcosystemHealthy = isEcosystemHealthy;
// ═══════════════════════════════════════════════════════════════════════════════
// VERSION CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════
exports.QANTUM_VERSION = '34.0.0';
exports.PRIME_VERSION = '28.4.0';
exports.ECOSYSTEM_VERSION = '1.0.0';
exports.CODENAME = 'ABSOLUTE_SOVEREIGNTY';
// ═══════════════════════════════════════════════════════════════════════════════
// TYPE GUARDS
// ═══════════════════════════════════════════════════════════════════════════════
function isTestPassed(result) {
    return result.status === 'passed';
}
function isVulnerabilityCritical(vuln) {
    return vuln.severity === 'critical' || vuln.severity === 'high';
}
function isEcosystemHealthy(health) {
    return health.status === 'PERFECT' || health.status === 'GOOD';
}
