"use strict";
/**
 * Symbol Verifier Module Adapter
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SymbolVerifierModule = void 0;
const assimilator_1 = require("../../../scripts/assimilator");
class SymbolVerifierModule {
    assimilator;
    constructor() {
        this.assimilator = assimilator_1.Assimilator.getInstance();
    }
    // Complexity: O(N)
    async execute(payload) {
        const symbol = payload.symbol || payload.value;
        if (!symbol) {
            return { error: 'No symbol provided for verification' };
        }
        const result = this.assimilator.verify(symbol);
        return result;
    }
    // Complexity: O(1)
    getName() {
        return 'SymbolVerifier';
    }
}
exports.SymbolVerifierModule = SymbolVerifierModule;
