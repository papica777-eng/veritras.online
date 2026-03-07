"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * QAntum
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * @copyright 2025 Димитър Продромов (Dimitar Prodromov). All Rights Reserved.
 * @license PROPRIETARY AND CONFIDENTIAL
 *
 * This file is part of QAntum.
 * Unauthorized copying, modification, distribution, or use of this file,
 * via any medium, is strictly prohibited without express written permission.
 *
 * For licensing inquiries: dimitar.prodromov@QAntum.dev
 * ═══════════════════════════════════════════════════════════════════════════════
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MutationType = void 0;
// ═══════════════════════════════════════════════════════════════════════════
// GENETIC MUTATION TYPES
// ═══════════════════════════════════════════════════════════════════════════
/** Genetic mutation type */
var MutationType;
(function (MutationType) {
    MutationType["TIMEOUT_ADJUSTMENT"] = "timeout_adjustment";
    MutationType["WAIT_INJECTION"] = "wait_injection";
    MutationType["RETRY_LOGIC"] = "retry_logic";
    MutationType["ANIMATION_WAIT"] = "animation_wait";
    MutationType["SELECTOR_SIMPLIFICATION"] = "selector_simplification";
    MutationType["FALLBACK_ADDITION"] = "fallback_addition";
    MutationType["ERROR_HANDLING"] = "error_handling";
})(MutationType || (exports.MutationType = MutationType = {}));
// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════
exports.default = {
// Types are exported above
};
