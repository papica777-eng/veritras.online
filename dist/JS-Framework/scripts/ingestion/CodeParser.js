"use strict";
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
    async assimilateReality() {
        await this.assimilator.assimilate();
    }
    /**
     * Context Retrieval: Gets relevant code for a specific query.
     */
    getSurgicalContext(query) {
        return this.assimilator.getRelevantContext(query);
    }
}
exports.CodeParser = CodeParser;
