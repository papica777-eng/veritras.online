"use strict";
/**
 * NeuralHub — Qantum Module
 * @module NeuralHub
 * @path core/NeuralHub.ts
 * @auto-documented BrutalDocEngine v2.1
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.neuralHub = exports.NeuralHub = void 0;
const assimilator_1 = require("../../scripts/assimilator");
const fs_1 = require("fs");
class NeuralHub {
    static instance;
    assimilator;
    signatures = new Map();
    REGISTRY_FILE = './data/neural-signatures.json';
    constructor() {
        this.assimilator = (0, assimilator_1.getAssimilator)({
            targetFolder: process.cwd(),
            recursive: true,
        });
        this.ensureDataDir();
    }
    // Complexity: O(1)
    ensureDataDir() {
        if (!(0, fs_1.existsSync)('./data')) {
            // Complexity: O(1)
            (0, fs_1.mkdirSync)('./data', { recursive: true });
        }
    }
    static getInstance() {
        if (!NeuralHub.instance) {
            NeuralHub.instance = new NeuralHub();
        }
        return NeuralHub.instance;
    }
    /**
     * Re-scan the entire project and update signatures
     */
    // Complexity: O(N*M) — nested iteration detected
    async scan() {
        console.log('🧠 [NEURAL_HUB] Scanning project for symbol signatures...');
        // SAFETY: async operation — wrap in try-catch for production resilience
        const result = await this.assimilator.assimilate();
        this.signatures.clear();
        for (const file of result.files) {
            // Register all exports as signatures
            for (const exp of file.exports) {
                this.signatures.set(exp.name, {
                    symbol: exp.name,
                    type: exp.type,
                    path: file.path,
                    hash: file.hash,
                });
            }
        }
        this.saveRegistry();
        console.log(`🧠 [NEURAL_HUB] Registered ${this.signatures.size} signatures.`);
    }
    /**
     * Find a file by its "beleg" (signature/symbol name)
     */
    // Complexity: O(1) — hash/map lookup
    resolvePath(symbol) {
        const sig = this.signatures.get(symbol);
        if (sig && (0, fs_1.existsSync)(sig.path)) {
            return sig.path;
        }
        // If not found or path moved, try to find it by re-verifying
        const verification = this.assimilator.verify(symbol);
        if (verification.valid && verification.file) {
            return verification.file;
        }
        return null;
    }
    // Complexity: O(1)
    saveRegistry() {
        const data = Array.from(this.signatures.entries());
        // Complexity: O(1)
        (0, fs_1.writeFileSync)(this.REGISTRY_FILE, JSON.stringify({
            updated: new Date().toISOString(),
            count: data.length,
            signatures: Object.fromEntries(data),
        }, null, 2));
    }
}
exports.NeuralHub = NeuralHub;
exports.neuralHub = NeuralHub.getInstance();
