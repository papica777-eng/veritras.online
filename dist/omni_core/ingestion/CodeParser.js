"use strict";
/**
 * CodeParser — Qantum Module
 * @module CodeParser
 * @path omni_core/ingestion/CodeParser.ts
 * @auto-documented BrutalDocEngine v2.1
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeParser = void 0;
const assimilator_1 = require("../assimilator");
/**
 * 🏗️ THE ARCHITECT: CodeParser
 * Bio-Digital Code Anatomy & Structural Analysis.
 * Leverages the Assimilator (Anti-Hallucination Engine) for surgical precision.
 */
class CodeParser {
    assimilator;
    constructor() {
        this.assimilator = (0, assimilator_1.getAssimilator)();
    }
    /**
     * Anatomical Scan: Extracts and verifies structural signatures.
     */
    // Complexity: O(1)
    async scanArchitecturalSymmetry(symbolName) {
        const verification = this.assimilator.verify(symbolName);
        return {
            name: symbolName,
            type: verification.type || 'unknown',
            file: verification.file || 'unmapped',
            valid: verification.valid
        };
    }
    /**
     * Massive Ingestion: Assimilates the entire codebase context.
     */
    // Complexity: O(1)
    async assimilateReality() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.assimilator.assimilate();
    }
    /**
     * Context Retrieval: Gets relevant code for a specific query.
     */
    // Complexity: O(1)
    getSurgicalContext(query) {
        return this.assimilator.getRelevantContext(query);
    }
}
exports.CodeParser = CodeParser;
